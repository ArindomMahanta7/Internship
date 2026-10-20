import "dotenv/config";
import express from "express";
import cors from "cors";
import connectdb from "./config/db.js";
import cookieParser from "cookie-parser";
import { uploadDir } from "./config/cloudinary.js";


import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js"
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();
const port = process.env.PORT || 3001;

/* The Next dev server (localhost:3000) normally reaches us through a rewrite,
 * but allow direct cross-origin calls too so the API works standalone. The
 * auth token lives in an HTTP-only cookie, so credentials must be allowed and
 * the origin can never be "*". */
app.use(cors({
    origin: (process.env.CLIENT_URL || "http://localhost:3000").split(","),
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

/* Locally-stored product photos (see config/cloudinary.js fallback). */
app.use("/uploads", express.static(uploadDir, { maxAge: "7d" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth/", authRoutes);
app.use("/api/product",productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

/* Express 5 hands async + middleware errors here instead of crashing. */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.status ?? (err.code === "LIMIT_FILE_SIZE" ? 400 : 500);
  res.status(status).json({ message: err.message || "Something went wrong" });
});

connectdb().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
});
