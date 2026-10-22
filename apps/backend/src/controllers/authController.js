
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

        // Hash password (needed by both the fresh account and the
        // "unverified account re-registering" path below)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check whether user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        /* An account that never finished verification is a dead end if we
         * just say "already exists": the visitor can't log in (403), can't
         * re-register (409), and may have lost the first OTP. Issue them a
         * fresh code instead of rejecting - only genuinely verified accounts
         * are told to log in. */
        if (existingUser) {
            if (existingUser.verified) {
                return res.status(409).json({
                    message: "User already exists. Please log in."
                });
            }

            const otp = generateOTP();
            // Unverified accounts have no session and no way to get back in,
            // so the fresh registration attempt wins: new name/password apply
            // once this OTP lands (they still have to prove email ownership).
            existingUser.name = name.trim();
            existingUser.password = hashedPassword;
            existingUser.otp = otp;
            existingUser.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            await existingUser.save();

            const msg = `Welcome to our platform!

Your OTP for email verification is ${otp}.

This OTP expires in 5 minutes.`;

            try {
                await sendEmail(normalizedEmail, "OTP for email verification", msg);
            } catch (emailError) {
                console.error("Email sending failed:", emailError);

                return res.status(503).json({
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    message: "Account created, but the verification email could not be sent. Please request a new OTP."
                });
            }

            return res.status(201).json({
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                message: "You had signed up but not verified yet - we sent you a fresh OTP. Please check your email."
            });
        }

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

        // Already verified: treat as success, not an error. Re-submitting
        // (back button, double submit, stale tab) must send the visitor to
        // the login screen instead of stranding them on /verify.
        if (user.verified) {
            return res.status(200).json({
                message: "Email is already verified",
                alreadyVerified: true
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


// RESEND OTP
/* The verification code only lives 5 minutes, and registering again with the
 * same email is rejected (409) - without this endpoint a slow or failed email
 * permanently locks the account out of the site. Generates a fresh OTP and
 * mails it, with a 30s cooldown so it can't be used to spam inboxes. */
export const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Don't reveal whether the account exists - say the same thing either
        // way, so this can't be used to probe for registered emails.
        const notFoundish = () =>
            res.status(200).json({
                message: `If an account for ${normalizedEmail} needs verification, a new code is on its way.`
            });

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return notFoundish();

        // Already verified: nothing to resend - point them at logging in.
        if (user.verified) {
            return res.status(200).json({
                message: "Email is already verified. Please log in.",
                alreadyVerified: true
            });
        }

        // Cooldown: the current code was issued at (otpExpiry - 5 minutes).
        const issuedAt = user.otpExpiry
            ? user.otpExpiry.getTime() - 5 * 60 * 1000
            : 0;
        if (Date.now() - issuedAt < 30 * 1000) {
            return res.status(429).json({
                message: "Please wait a moment before requesting a new code."
            });
        }

        const otp = generateOTP();

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    otp,
                    otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
                }
            }
        );

        try {
            await sendEmail(
                normalizedEmail,
                "OTP for email verification",
                `Your verification code is ${otp}.

This code expires in 5 minutes.`
            );
        } catch (emailError) {
            console.error("Email sending failed:", emailError);

            return res.status(503).json({
                message: "The code could not be sent right now. Please try again in a moment."
            });
        }

        return res.status(200).json({
            message: `A new code is on its way to ${normalizedEmail}.`
        });

    } catch (error) {
        console.error("Resend OTP error:", error);

        return res.status(500).json({
            message: "Error occurred while resending the OTP"
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
