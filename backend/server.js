import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();
connectDB();
setInterval(() => {
  fetch(`https://neonverse-game-store-production.up.railway.app/health`).catch(() => {});
}, 14 * 60 * 1000);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.status(200).send("✅ Neonverse API Running - Backend Connected Successfully!")
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running and listening on port ${PORT}`);
});
