
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

// 1. Place an order
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find the user's cart
        const cart = await Cart.findOne({
            user: userId
        }).populate("items.product");

        // Check if cart exists
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        // Check if cart is empty
        if (cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Create order items
        const orderItems = cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }));

        // Calculate total amount
        const totalAmount = orderItems.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);

        // Create the order
        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount
        });

        // Clear the cart after successful order
        cart.items = [];
        await cart.save();

        // Return the created order
        const createdOrder = await Order.findById(order._id)
            .populate("items.product");

        return res.status(201).json({
            message: "Order placed successfully",
            order: createdOrder
        });

    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            message: "Failed to place order"
        });
    }
};


// 2. Get all orders of the logged-in user
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.userId
        })
            .populate("items.product")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            orders
        });

    } catch (error) {
        console.error("Get orders error:", error);

        return res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
};


// 3. Get a single order
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
            user: req.user.userId
        }).populate("items.product");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            order
        });

    } catch (error) {
        console.error("Get order error:", error);

        return res.status(500).json({
            message: "Failed to fetch order"
        });
    }
};
