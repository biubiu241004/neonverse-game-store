import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();
connectDB();

const app = express();
import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "https://neonverse-game-store.vercel.app" // nanti ganti kalau beda nama project Vercel
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.status(200).send("✅ Neonverse API Running - Backend Connected Successfully!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// 🔥 Ganti bagian di bawah ini
const PORT = process.env.PORT || 8080;

// 👇 Ini penting biar Railway gak stop container
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running and listening on port ${PORT}`);
});

// ✅ Tambahkan ini di paling bawah
process.on("SIGTERM", () => {
  console.log("🛑 Graceful shutdown initiated by Railway...");
  process.exit(0);
});
