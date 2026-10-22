import mongoose from "mongoose";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

/* Admin data endpoints. Every handler here runs behind authenticate +
 * adminOnly (see routes/adminRoutes.js), so the real protection is on the
 * API - the /admin UI is just a view.
 *
 * The customer's phone/address are never collected at checkout, so these
 * endpoints only expose what actually exists: the owning user's name/email,
 * the order's items, totals and status. */

// GET /api/admin/stats - dashboard numbers + the latest few orders
export const getStats = async (req, res) => {
    try {
        const [orderTotals, recentOrders, products, users] = await Promise.all([
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        sales: { $sum: "$totalAmount" },
                        orders: { $sum: 1 }
                    }
                }
            ]),
            Order.find()
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .limit(5),
            Product.countDocuments(),
            User.countDocuments()
        ]);

        return res.status(200).json({
            stats: {
                sales: orderTotals[0]?.sales ?? 0,
                orders: orderTotals[0]?.orders ?? 0,
                products,
                users
            },
            recentOrders
        });

    } catch (error) {
        console.error("Admin stats error:", error);

        return res.status(500).json({
            message: "Failed to fetch dashboard stats"
        });
    }
};


// GET /api/admin/orders - every order from every customer, newest first
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("items.product", "brandName modelName images color")
            .sort({ createdAt: -1 });

        return res.status(200).json({ orders });

    } catch (error) {
        console.error("Admin orders error:", error);

        return res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
};


// GET /api/admin/orders/:orderId - one order, whoever placed it
export const getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = await Order.findById(orderId)
            .populate("user", "name email")
            .populate("items.product", "brandName modelName images color");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({ order });

    } catch (error) {
        console.error("Admin order error:", error);

        return res.status(500).json({
            message: "Failed to fetch order"
        });
    }
};


// PATCH /api/admin/orders/:orderId/status - move an order along
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

        if (typeof status !== "string" || !allowed.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${allowed.join(", ")}`
            });
        }

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: { status } },
            { new: true, runValidators: true }
        )
            .populate("user", "name email")
            .populate("items.product", "brandName modelName images color");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({ message: "Order updated", order });

    } catch (error) {
        console.error("Admin order update error:", error);

        return res.status(500).json({
            message: "Failed to update order"
        });
    }
};


// GET /api/admin/users - every account, with how much each has ordered
export const getAllUsers = async (req, res) => {
    try {
        const [users, perUser] = await Promise.all([
            User.find()
                .select("name email role verified createdAt")
                .sort({ createdAt: -1 })
                .lean(),
            Order.aggregate([
                {
                    $group: {
                        _id: "$user",
                        orders: { $sum: 1 },
                        spent: { $sum: "$totalAmount" }
                    }
                }
            ])
        ]);

        const byUser = new Map(
            perUser.map((row) => [String(row._id), row])
        );

        return res.status(200).json({
            users: users.map((user) => ({
                ...user,
                orders: byUser.get(String(user._id))?.orders ?? 0,
                spent: byUser.get(String(user._id))?.spent ?? 0
            }))
        });

    } catch (error) {
        console.error("Admin users error:", error);

        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


/* GET /api/admin/analytics - revenue/orders, a per-month series for the
 * chart, and the best-selling products. Months with no orders are still
 * returned (revenue 0) so the bar chart never has holes. */
export const getAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 4, 1));

        const [totals, monthly, topProducts] = await Promise.all([
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 }
                    }
                }
            ]),

            Order.aggregate([
                { $match: { createdAt: { $gte: since } } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),

            Order.aggregate([
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.product",
                        sold: { $sum: "$items.quantity" },
                        revenue: {
                            $sum: {
                                $multiply: ["$items.price", "$items.quantity"]
                            }
                        }
                    }
                },
                { $sort: { sold: -1 } },
                { $limit: 5 }
            ])
        ]);

        // $year/$month read UTC, so build the buckets in UTC too or the
        // current month could land in the wrong bucket.
        const buckets = [];
        for (let i = 4; i >= 0; i--) {
            const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
            buckets.push({
                key: `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`,
                label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
                revenue: 0,
                orders: 0
            });
        }

        const byKey = new Map(
            monthly.map((row) => [`${row._id.year}-${row._id.month}`, row])
        );

        for (const bucket of buckets) {
            const hit = byKey.get(bucket.key);
            if (hit) {
                bucket.revenue = hit.revenue;
                bucket.orders = hit.orders;
            }
        }

        // Attach names to the top-product ids (aggregation leaves raw ids).
        await Product.populate(topProducts, {
            path: "_id",
            select: "brandName modelName"
        });

        return res.status(200).json({
            stats: {
                revenue: totals[0]?.revenue ?? 0,
                orders: totals[0]?.orders ?? 0
            },
            monthly: buckets,
            topProducts: topProducts.map((row) => ({
                product: row._id,
                sold: row.sold,
                revenue: row.revenue
            }))
        });

    } catch (error) {
        console.error("Admin analytics error:", error);

        return res.status(500).json({
            message: "Failed to fetch analytics"
        });
    }
};
