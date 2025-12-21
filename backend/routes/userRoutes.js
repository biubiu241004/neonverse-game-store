import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET MY BALANCE
router.get("/me/balance", protect, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bukan admin" });
  }

  res.json({
    balance: req.user.balance,
  });
});

export default router;
