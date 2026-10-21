/* Prints the OTP (and verification state) for one account. argv[2] = email. */
import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/userModel.js";

const email = process.argv[2];
await mongoose.connect(process.env.MONGODB_URL);
const user = await User.findOne({ email }).lean();
process.stdout.write(user ? String(user.otp ?? "") : "");
await mongoose.disconnect();
