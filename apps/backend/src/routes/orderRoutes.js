
import express from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById
} from "../controllers/orderController.js";

import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Place a new order
router.post("/", authenticate, createOrder);

// Get all orders of logged-in user
router.get("/", authenticate, getMyOrders);

// Get a specific order
router.get("/:orderId", authenticate, getOrderById);

export default router;
