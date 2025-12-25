import Order from "../models/Order.js";
import Game from "../models/Game.js";
import User from "../models/User.js";
import BalanceHistory from "../models/BalanceHistory.js";
import Cart from "../models/Cart.js";

export const checkout = async (req, res) => {
  console.log("Checkout request body:", req.body);
  console.log("Checkout user:", req.user);

  try {
    const userId = req.user.id;
    const { items, payment } = req.body;

    if (!payment || !payment.method) {
      return res.status(400).json({ message: "Metode pembayaran wajib" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const game = await Game.findById(item.gameId);
      if (!game)
        return res.status(404).json({ message: "Game tidak ditemukan" });

      if (game.stock < item.quantity) {
        return res.status(400).json({
          message: `${game.title} stok tidak cukup`,
        });
      }

      game.stock -= item.quantity;
      await game.save();

      totalAmount += game.price * item.quantity;

      orderItems.push({
        game: game._id,
        quantity: item.quantity,
        price: game.price,
      });
    }

    // =========================
    // PAYMENT LOGIC
    // =========================
    if (payment.method === "balance") {
      const user = await User.findById(userId);

      if (user.balance < totalAmount) {
        return res.status(400).json({ message: "Saldo tidak cukup" });
      }

      user.balance -= totalAmount;
      await user.save();
    }

    if (["bank", "ewallet"].includes(payment.method)) {
      if (!payment.provider || !payment.accountNumber) {
        return res.status(400).json({
          message: "Data pembayaran belum lengkap",
        });
      }
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      payment: {
        method: payment.method,
        provider: payment.provider,
        accountNumber: payment.accountNumber,
        status: payment.method === "balance" ? "paid" : "pending",
      },
    });

    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    res.status(201).json({
      message: "Order berhasil dibuat",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const receiveOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate({
      path: "items.game",
      select: "price createdBy",
    });

    if (!order)
      return res.status(404).json({ message: "Order tidak ditemukan" });

    if (order.status !== "completed")
      return res
        .status(400)
        .json({ message: "Admin belum menyelesaikan pesanan" });

    // 🔥 FIX AMAN: UPDATE LANGSUNG KE USER COLLECTION
    for (const item of order.items) {
      const game = item.game;
      if (!game || !game.createdBy) continue;

      const income = item.price * item.quantity;

      await User.findByIdAndUpdate(
        game.createdBy,
        { $inc: { balance: income } },
        { new: true }
      );

      await BalanceHistory.create({
        admin: game.createdBy,
        order: order._id,
        game: game._id,
        amount: income,
        type: "credit",
      });
    }

    order.status = "received";
    await order.save();

    res.json({
      message: "Pesanan diterima, saldo admin berhasil ditambahkan",
    });
  } catch (err) {
    console.error("RECEIVE ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
