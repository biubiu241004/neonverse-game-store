import Game from "../models/Game.js";
import Order from "../models/Order.js";

export const checkAdminOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const adminId = req.user._id;

    const order = await Order.findById(orderId).populate("items.game");

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    const unauthorized = order.items.some((item) => {
      return item.game?.createdBy?.toString() !== adminId.toString();
    });

    if (unauthorized) {
      return res
        .status(403)
        .json({ message: "Kamu bukan pemilik game di order ini" });
    }

    next();
  } catch (err) {
    console.error("checkAdminOrder ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};
