
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { generateOTP } from "../utils/otp.js";


// REGISTER USER
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Validate field types
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Name, email and password must be strings"
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // Check whether user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();

        // Create user
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            otp,
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
        });

        // Send verification email
        try {
            const msg = `Welcome to our platform!

Your OTP for email verification is ${otp}.

This OTP expires in 5 minutes.`;

            await sendEmail(
                normalizedEmail,
                "OTP for email verification",
                msg
            );

        } catch (emailError) {
            console.error("Email sending failed:", emailError);

            return res.status(503).json({
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                message: "Account created, but the verification email could not be sent. Please request a new OTP."
            });
        }

        return res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            message: "User registered successfully. Please check your email for the OTP."
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        return res.status(500).json({
            message: "Error occurred while registering user"
        });
    }
};


// VERIFY EMAIL OTP
export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Check required fields
        if (
            typeof email !== "string" ||
            typeof otp !== "string" ||
            !email.trim() ||
            !otp.trim()
        ) {
            return res.status(400).json({
                message: "Valid email and OTP are required"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check whether already verified
        if (user.verified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        // Check OTP expiry
        if (!user.otpExpiry || user.otpExpiry < new Date()) {
            return res.status(400).json({
                message: "OTP has expired"
            });
        }

        // Check OTP
        if (user.otp !== otp.trim()) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Update user without calling save()
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: user._id,
                verified: false,
                otp: otp.trim(),
                otpExpiry: { $gt: new Date() }
            },
            {
                $set: {
                    verified: true,
                    otp: null,
                    otpExpiry: null
                }
            },
            {
                new: true
            }
        );

        if (!updatedUser) {
            return res.status(400).json({
                message: "OTP is invalid or has expired. Please try again."
            });
        }

        return res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("OTP verification error:", error);

        return res.status(500).json({
            message: "Error occurred while verifying email"
        });
    }
};


// LOGIN USER
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check required fields
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check email verification
        if (!user.verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check JWT secret configuration
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                message: "Server authentication configuration error"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Error occurred while logging in"
        });
    }
};


// LOGOUT USER
export const logoutUser = async (req, res) => {
    try {
        // Expire the same cookie used during login
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Error occurred while logging out"
        });
    }
};
