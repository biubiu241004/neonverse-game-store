import express from "express";
import { checkout } from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js"; // ini middleware kamu
import Order from "../models/Order.js"; // import Order model
import { checkAdminOrder } from "../middleware/checkAdminOrder.js"; // middleware baru

const router = express.Router();

// Checkout
router.post("/checkout", protect, checkout);

// Admin melihat order miliknya
router.get("/admin/orders", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Hanya admin!" });
    }

    const adminId = req.user._id;

    const orders = await Order.find().populate("items.game").populate("user");

    const filtered = orders.filter((order) => {
      return order.items.some((item) => {
        return item.game.createdBy?.toString() === adminId.toString();
      });
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin konfirmasi order
router.put(
  "/admin/orders/:id/status",
  protect,
  checkAdminOrder,
  async (req, res) => {
    try {
      const { status } = req.body;
      const allowedStatuses = [
        "pending",
        "processing",
        "completed",
        "received",
        "cancel_request",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Status tidak valid" });
      }

      const updated = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      res.json({
        message: `Status berhasil diubah menjadi ${status}`,
        order: updated,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put("/admin/cancel-order/:id", protect, async (req, res) => {
  try {
    const { reason } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Hanya admin!" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

    order.status = "cancelled";
    order.cancelReasonAdmin = reason || "Admin tidak memberikan alasan";

    await order.save();

    res.json({ message: "Pesanan dibatalkan oleh admin", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.game")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
    order.cancelReasonUser = reason || "Tidak ada alasan diberikan";

    await order.save();

    res.json({ message: "Permintaan pembatalan dikirim", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/receive/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

    if (order.status !== "completed") {
      return res.status(400).json({ message: "Admin belum menyelesaikan pesanan" });
    }

    order.status = "received";
    await order.save();

    res.json({ message: "Pesanan diterima, kamu bisa memberi review" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/can-review/:gameId", protect, async (req, res) => {
  try {
    const exists = await Order.findOne({
      user: req.user._id,
      status: "received",                  // WAJIB sudah diterima user
      "items.game": req.params.gameId,
    });

    res.json({ allowed: !!exists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/review/:orderId/:gameId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // user hanya bisa review setelah received
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
      status: "received",
      "items.game": req.params.gameId
    });

    if (!order)
      return res.status(400).json({ message: "Tidak bisa review. Pesanan belum diterima." });

    const rev = await Review.create({
      user: req.user._id,
      game: req.params.gameId,
      rating,
      comment
    });

    res.json({ message: "Review berhasil ditambahkan", review: rev });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
