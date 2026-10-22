import express from "express";

import {
    getStats,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getAllUsers,
    getAnalytics
} from "../controllers/adminControllers.js";

import authenticate from "../middleware/authenticate.js";
import adminOnly from "../middleware/admin.js";

const router = express.Router();

/* Everything under /api/admin is admin-only: authenticate resolves the
 * session cookie into req.user, adminOnly then checks the role. */
router.use(authenticate, adminOnly);

router.get("/stats", getStats);
router.get("/orders", getAllOrders);
router.get("/orders/:orderId", getOrder);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.get("/users", getAllUsers);
router.get("/analytics", getAnalytics);

export default router;
