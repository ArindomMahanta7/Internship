import "dotenv/config";
import express from "express";
import connectdb from "./config/db.js";
import cookieParser from "cookie-parser";


import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js"

const app = express();
const port = process.env.PORT || 3001;


app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth/", authRoutes);
app.use("/api/product",productRoutes)

app.listen(port, () => {
  connectdb()
  console.log(`Backend listening on port ${port}`);
});
