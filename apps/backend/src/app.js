import "dotenv/config";
import express from "express";
import connectdb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT || 3001;


app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth/", authRoutes);

app.listen(port, () => {
  connectdb()
  console.log(`Backend listening on port ${port}`);
});
