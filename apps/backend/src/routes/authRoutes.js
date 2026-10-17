import express from "express";

import {
    loginUser,
    registerUser,
    verifyEmail
} from "../controllers/authController.js";

const router = express.Router();


// Register user
router.post("/register", registerUser);


// Verify email using OTP
router.post("/verify-email", verifyEmail);

//login
router.post("/login",loginUser)




export default router;