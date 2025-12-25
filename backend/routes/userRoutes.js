import express from "express";
import protect from "../middleware/authMiddleware.js";
import checkBanned from "../middleware/checkBanned.js";
import isSuperAdmin from "../middleware/isSuperAdmin.js";

import User from "../models/User.js";
import Withdraw from "../models/Withdraw.js";
import BalanceHistory from "../models/BalanceHistory.js";
import Topup from "../models/Topup.js";

const router = express.Router();

/* =====================================================
   COMMON — BALANCE (USER & ADMIN)
===================================================== */

// GET MY BALANCE (USER & ADMIN)
router.get("/me/balance", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("balance role");

  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  res.json({
    balance: user.balance,
    role: user.role,
  });
});

/* =====================================================
   ADMIN — BALANCE HISTORY
===================================================== */

router.get("/me/balance-history", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Hanya admin" });
  }

  const history = await BalanceHistory.find({ admin: req.user._id })
    .populate("order", "_id")
    .populate("game", "title")
    .sort({ createdAt: -1 });

  res.json(history);
});

/* =====================================================
   ADMIN — WITHDRAW
===================================================== */

router.post("/me/withdraw", protect, checkBanned, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Hanya admin" });
    }

    const {
      amount,
      method,
      bankName,
      accountNumber,
      accountName,
      note,
    } = req.body;

    const MIN_WITHDRAW = 50000;
    const FEE_FLAT = 2500;
    const amt = Number(amount);

    // VALIDASI
    if (!amt || amt < MIN_WITHDRAW) {
      return res.status(400).json({
        message: `Minimal withdraw Rp ${MIN_WITHDRAW.toLocaleString()}`,
      });
    }

    if (!["bank", "ewallet"].includes(method)) {
      return res.status(400).json({ message: "Metode tidak valid" });
    }

    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        message: "Data rekening / e-wallet wajib lengkap",
      });
    }

    const admin = await User.findById(req.user._id);
    if (admin.balance < amt) {
      return res.status(400).json({ message: "Saldo tidak cukup" });
    }

    // CEGAH MULTIPLE PENDING
    const pending = await Withdraw.findOne({
      admin: admin._id,
      status: "pending",
    });

    if (pending) {
      return res.status(400).json({
        message: "Masih ada withdraw pending",
      });
    }

    const withdraw = await Withdraw.create({
      admin: admin._id,
      amount: amt,
      fee: FEE_FLAT,
      finalAmount: Math.max(amt - FEE_FLAT, 0),
      method,
      bankName,
      accountNumber,
      accountName,
      note,
      status: "pending",
    });

    res.json({
      message: "Permintaan withdraw dikirim",
      withdraw,
    });
  } catch (err) {
    console.error("WITHDRAW ERROR:", err);
    res.status(500).json({ message: "Gagal memproses withdraw" });
  }
});

// ADMIN — MY WITHDRAW HISTORY
router.get("/me/withdraws", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Hanya admin" });
  }

  const withdraws = await Withdraw.find({ admin: req.user._id })
    .sort({ createdAt: -1 });

  res.json(withdraws);
});

/* =====================================================
   USER — TOP UP
===================================================== */

router.post("/me/topup", protect, async (req, res) => {
  const { amount, method, provider } = req.body;

  if (!amount || amount < 10000) {
    return res.status(400).json({ message: "Minimal top up Rp 10.000" });
  }

  if (!method || !provider) {
    return res.status(400).json({ message: "Metode tidak valid" });
  }

  const topup = await Topup.create({
    user: req.user._id,
    amount,
    method,
    provider,
    status: "pending",
  });

  res.json({
    message: "Permintaan top up dibuat",
    topup,
  });
});

router.get("/me/topups", protect, async (req, res) => {
  const data = await Topup.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json(data);
});

/* =====================================================
   SUPERADMIN — TOPUP & WITHDRAW MANAGEMENT
===================================================== */

// APPROVE TOPUP
router.put("/admin/topups/:id", protect, isSuperAdmin, async (req, res) => {
  const { status } = req.body;

  const topup = await Topup.findById(req.params.id);
  if (!topup) return res.status(404).json({ message: "Top up tidak ditemukan" });

  if (topup.status !== "pending")
    return res.status(400).json({ message: "Sudah diproses" });

  if (status === "paid") {
    const user = await User.findById(topup.user);
    user.balance += topup.amount;
    await user.save();
  }

  topup.status = status;
  await topup.save();

  res.json({ message: "Top up diproses", topup });
});

// WITHDRAW LIST
router.get("/admin/withdraws", protect, isSuperAdmin, async (req, res) => {
  const withdraws = await Withdraw.find()
    .populate("admin", "username email")
    .sort({ createdAt: -1 });

  res.json(withdraws);
});

// UPDATE WITHDRAW
router.put("/admin/withdraws/:id", protect, isSuperAdmin, async (req, res) => {
  const { status } = req.body;

  if (!["processing", "paid", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status tidak valid" });
  }

  const withdraw = await Withdraw.findById(req.params.id);
  if (!withdraw) {
    return res.status(404).json({ message: "Withdraw tidak ditemukan" });
  }

  if (["paid", "rejected"].includes(withdraw.status)) {
    return res.status(400).json({ message: "Withdraw sudah final" });
  }

  if (status === "paid") {
    const admin = await User.findById(withdraw.admin);
    if (admin.balance < withdraw.amount) {
      return res.status(400).json({ message: "Saldo admin tidak cukup" });
    }

    admin.balance -= withdraw.amount;
    await admin.save();

    withdraw.processedAt = new Date();
  }

  withdraw.status = status;
  await withdraw.save();

  res.json({
    message: `Withdraw diubah ke ${status}`,
    withdraw,
  });
});

/* =====================================================
   SUPERADMIN — USER MANAGEMENT
===================================================== */

router.get("/admin/users", protect, isSuperAdmin, async (req, res) => {
  const users = await User.find().select(
    "username email role isBanned createdAt"
  );
  res.json(users);
});

router.put("/admin/users/:id/ban", protect, isSuperAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.json({
    message: user.isBanned
      ? "User berhasil dibanned"
      : "User berhasil di-unban",
    user,
  });
});

export default router;
