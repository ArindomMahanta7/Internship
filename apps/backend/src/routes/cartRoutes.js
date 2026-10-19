
import express from "express";

import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cartController.js";

import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Get the logged-in user's cart
router.get("/", authenticate, getCart);

// Add a product to the cart
router.post("/", authenticate, addToCart);

// Update a product's quantity
router.patch("/:productId", authenticate, updateCartItem);

// Remove a product from the cart
router.delete("/:productId", authenticate, removeFromCart);

// Clear the entire cart
router.delete("/", authenticate, clearCart);

export default router;
