import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

import {
    loginUser,
    registerUser,
    verifyEmail,
    logoutUser
} from "../controllers/authController.js";

const router = express.Router();


// Register user
router.post("/register", registerUser);


// Verify email using OTP
router.post("/verify-email", verifyEmail);

//login
router.post("/login",loginUser)

// Logout - clears the HTTP-only token cookie
router.post("/logout", logoutUser);


/* Who am I? The token is an HTTP-only cookie, so the client can't read it
 * directly - this is how the navbar/user menu learns the current session. */
router.get("/me", async (req, res) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(200).json({ user: null });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(200).json({ user: null });
    }

    // The JWT only carries id + role, so load the profile fresh.
    const user = await User.findById(decoded.userId).select("name email role verified");
    return res.status(200).json({ user: user ?? null });
});

export default router;
