import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ role: "superadmin" });

    if (existing) {
      console.log("✅ Superadmin sudah ada");
      process.exit();
    }

    const superadmin = await User.create({
      username: "owner",
      email: "owner@neonverse.com",
      password: "SuperAdmin123", // auto ke-hash oleh schema
      role: "superadmin",
      balance: 0,
    });

    console.log("🔥 Superadmin berhasil dibuat:");
    console.log({
      email: superadmin.email,
      password: "SuperAdmin123",
    });

    process.exit();
  } catch (err) {
    console.error("❌ Gagal buat superadmin:", err);
    process.exit(1);
  }
};

createSuperAdmin();
