import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { generateOTP} from "../utils/otp.js";



// REGISTER USER
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();

        const newUser = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            otp:otp,
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
        });

        try {
            const msg = `Welcome to our platform!

Your OTP for email verification is ${otp}.

This OTP expires in 5 minutes.`;

            await sendEmail(normalizedEmail, "OTP for email verification", msg);

        } catch (emailError) {
            console.error("Email sending failed:", emailError);

            return res.status(201).json({
                id: User._id,
                name: User.name,
                email: User.email,
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
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
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

        // Check if already verified
        if (user.verified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        // Check OTP
        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Check OTP expiry
        if (
            !user.otpExpiry ||
            user.otpExpiry < new Date()
        ) {
            return res.status(400).json({
                message: "OTP has expired"
            });
        }

        // Update user after successful verification
        await User.findOneAndUpdate(
            {
                email: normalizedEmail
            },
            {
                $set: {
                    verified: true,
                    otp: null,
                    otpExpiry: null
                }
            }
        );

        return res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {

        console.error(
            "OTP verification error:",
            error
        );

        return res.status(500).json({
            message:
                "Error occurred while verifying email"
        });
    }
};


