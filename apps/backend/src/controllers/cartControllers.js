
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// 1. Add a product to the cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate input
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        // Check whether the product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Find the logged-in user's cart
        let cart = await Cart.findOne({
            user: req.user.userId
        });

        // If the user has no cart, create one
        if (!cart) {
            cart = await Cart.create({
                user: req.user.userId,
                items: [{
                    product: productId,
                    quantity
                }]
            });
        } else {
            // Check whether the product is already in the cart
            const existingItem = cart.items.find(
                item => item.product.toString() === productId
            );

            if (existingItem) {
                // Increase its quantity
                existingItem.quantity += quantity;
            } else {
                // Add a new product
                cart.items.push({
                    product: productId,
                    quantity
                });
            }

            await cart.save();
        }

        // Populate product details before returning the cart
        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        return res.status(200).json({
            message: "Product added to cart",
            cart: updatedCart
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            message: "Failed to add product to cart"
        });
    }
};


// 2. Get the logged-in user's cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.userId
        }).populate("items.product");

        // A user without a cart has an empty cart
        if (!cart) {
            return res.status(200).json({
                message: "Cart is empty",
                items: [],
                totalAmount: 0
            });
        }

        // Calculate total using current product prices
        const totalAmount = cart.items.reduce((total, item) => {
            if (!item.product) return total;

            return total + item.product.price * item.quantity;
        }, 0);

        return res.status(200).json({
            cart,
            totalAmount
        });

    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            message: "Failed to fetch cart"
        });
    }
};


// 2b. Replace the whole cart (used to sync the browser's localStorage cart
// up to the account in one request - see apps/frontend/lib/cart.js).
export const replaceCart = async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({
                message: "items must be an array"
            });
        }

        const seen = new Set();
        const cleaned = [];

        for (const item of items) {
            const productId = item?.product ?? item?.id ?? item?.productId;
            const quantity = Number(item?.quantity ?? item?.qty ?? 1);

            if (!productId || seen.has(productId)) continue;
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) continue;

            const exists = await Product.exists({ _id: productId });
            if (!exists) continue;

            seen.add(productId);
            cleaned.push({ product: productId, quantity });
        }

        const cart = await Cart.findOneAndUpdate(
            { user: req.user.userId },
            { $set: { items: cleaned } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate("items.product");

        const totalAmount = cart.items.reduce((total, item) => {
            if (!item.product) return total;
            return total + item.product.price * item.quantity;
        }, 0);

        return res.status(200).json({ message: "Cart synced", cart, totalAmount });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product id in cart" });
        }
        console.error("Replace cart error:", error);
        return res.status(500).json({ message: "Failed to sync cart" });
    }
};


// 3. Update the quantity of a product in the cart
export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        item.quantity = quantity;

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        return res.status(200).json({
            message: "Cart quantity updated",
            cart: updatedCart
        });

    } catch (error) {
        console.error("Update cart error:", error);

        return res.status(500).json({
            message: "Failed to update cart"
        });
    }
};


// 4. Remove a product from the cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const initialLength = cart.items.length;

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        return res.status(200).json({
            message: "Product removed from cart",
            cart: updatedCart
        });

    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            message: "Failed to remove product from cart"
        });
    }
};


// 5. Clear the entire cart
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: req.user.userId },
            { $set: { items: [] } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        return res.status(200).json({
            message: "Cart cleared successfully",
            cart
        });

    } catch (error) {
        console.error("Clear cart error:", error);

        return res.status(500).json({
            message: "Failed to clear cart"
        });
    }
};
