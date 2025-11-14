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
  "/admin/orders/:id/confirm",
  protect,
  checkAdminOrder,
  async (req, res) => {
    try {
      const orderId = req.params.id;

      const updated = await Order.findByIdAndUpdate(
        orderId,
        { status: "confirmed" },
        { new: true }
      );

      res.json({ message: "Order berhasil dikonfirmasi", order: updated });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
