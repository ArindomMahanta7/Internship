import express from "express";

import {
    registerUser,
    verifyEmail
} from "../controllers/authController.js";

const router = express.Router();


// Register user
router.post("/register", registerUser);


// Verify email using OTP
router.post("/verify-email", verifyEmail);


export default router;