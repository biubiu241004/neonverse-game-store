import express from "express";
import { checkout } from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import { checkAdminOrder } from "../middleware/checkAdminOrder.js";

const router = express.Router();

// CHECKOUT
router.post("/checkout", protect, checkout);

// GET ADMIN ORDERS
router.get("/admin/orders", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Hanya admin!" });

    const adminId = req.user._id;

    const orders = await Order.find()
      .populate("items.game")
      .populate("user");

    const filtered = orders.filter((order) =>
      order.items.some(
        (i) => i.game?.createdBy?.toString() === adminId.toString()
      )
    );

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE STATUS
router.put(
  "/admin/orders/:id/status",
  protect,
  checkAdminOrder,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowed = [
        "pending",
        "processing",
        "completed",
        "received",
        "cancel_request",
        "cancelled",
      ];

      if (!allowed.includes(status))
        return res.status(400).json({ message: "Status tidak valid" });

      const updated = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      res.json({ message: "Status diubah", order: updated });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// USER CANCEL REQUEST
router.put("/cancel-request/:id", protect, async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

    if (["completed", "cancelled"].includes(order.status))
      return res.status(400).json({ message: "Order sudah final" });

    order.status = "cancel_request";
    order.cancelReasonUser = reason;
    await order.save();

    res.json({ message: "Permintaan pembatalan dikirim", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// USER CONFIRM RECEIVED
router.put("/receive/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order)
      return res.status(404).json({ message: "Order tidak ditemukan" });

    if (order.status !== "completed")
      return res.status(400).json({ message: "Admin belum menyelesaikan pesanan" });

    order.status = "received";
    await order.save();

    res.json({ message: "Pesanan diterima" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// USER ADD REVIEW
router.post("/review/:orderId/:gameId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
      status: "received",
      "items.game": req.params.gameId,
    });

    if (!order)
      return res
        .status(400)
        .json({ message: "Tidak bisa review. Pesanan belum diterima." });

    const rev = await Review.create({
      user: req.user._id,
      game: req.params.gameId,
      rating,
      comment,
    });

    res.json({ message: "Review berhasil ditambahkan", review: rev });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
