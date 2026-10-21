/* Confirms the "locked out" traps around OTP verification. */
const FRONT = "http://localhost:3000";
const email = `trap.${Date.now()}@example.com`;
const call = async (path, { method = "GET", body } = {}) => {
  const res = await fetch(FRONT + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return `${res.status} ${(await res.text()).slice(0, 200)}`;
};

console.log("A) register           :", await call("/api/auth/register", { method: "POST", body: { name: "Trap", email, password: "password123" } }));
console.log("B) register AGAIN (same email):", await call("/api/auth/register", { method: "POST", body: { name: "Trap", email, password: "password123" } }));
console.log("C) login (unverified):", await call("/api/auth/login", { method: "POST", body: { email, password: "password123" } }));

// Simulate the OTP having expired (as it does after 5 minutes).
const { default: mongoose } = await import("mongoose");
const { default: dotenv } = await import("dotenv");
dotenv.config();
await mongoose.connect(process.env.MONGODB_URL);
const { default: User } = await import("./src/models/userModel.js");
await User.updateOne({ email }, { $set: { otpExpiry: new Date(Date.now() - 60_000) } });
console.log("D) verify with EXPIRED OTP:", await call("/api/auth/verify-email", { method: "POST", body: { email, otp: "123456" } }));

// Simulate the user verifying successfully, then re-submitting (back button).
await User.updateOne({ email }, { $set: { otp: "654321", otpExpiry: new Date(Date.now() + 300_000) } });
console.log("E) verify OK          :", await call("/api/auth/verify-email", { method: "POST", body: { email, otp: "654321" } }));
console.log("F) verify AGAIN (already verified):", await call("/api/auth/verify-email", { method: "POST", body: { email, otp: "654321" } }));
console.log("G) is there any resend endpoint? /api/auth/resend-otp ->", await call("/api/auth/resend-otp", { method: "POST", body: { email } }));

await mongoose.disconnect();
