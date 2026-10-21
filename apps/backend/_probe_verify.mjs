/* Reads the OTP for the probe account straight from MongoDB (the email was
 * sent to a throwaway example.com address), then finishes verify -> login
 * -> /me through the Next.js proxy so we see exactly what a browser sees. */
import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/userModel.js";

const FRONT = "http://localhost:3000";
const email = process.argv[2];
if (!email) throw new Error("pass the probe email as argv[2]");

await mongoose.connect(process.env.MONGODB_URL);
const user = await User.findOne({ email }).lean();
console.log("DB user:", {
  email: user?.email,
  verified: user?.verified,
  otp: user?.otp,
  otpExpiry: user?.otpExpiry,
});

async function call(path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(FRONT + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  return {
    status: res.status,
    setCookie: res.headers.getSetCookie(),
    body: (await res.text()).slice(0, 400),
  };
}

const verify = await call("/api/auth/verify-email", {
  method: "POST",
  body: { email, otp: user.otp },
});
console.log("\n=== verify:", verify.status, verify.body);

const login = await call("/api/auth/login", {
  method: "POST",
  body: { email, password: "password123" },
});
console.log("\n=== login:", login.status, login.body);
console.log("setCookie:", login.setCookie.length ? login.setCookie : "(none)");

const raw = login.setCookie.join("\n");
const token = raw
  .split("\n")
  .map((c) => c.match(/token=([^;]+)/)?.[1])
  .find(Boolean);

if (!token) {
  console.log("\n!!! NO token cookie returned by login");
} else {
  const me = await call("/api/auth/me", { cookie: `token=${token}` });
  console.log("\n=== /me with cookie:", me.status, me.body);
}

await mongoose.disconnect();
