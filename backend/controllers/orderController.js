import Order from "../models/Order.js";
import Game from "../models/Game.js";

export const checkout = async (req, res) => {
  console.log("Checkout request body:", req.body);
  console.log("Checkout user:", req.user);

  try {
    const userId = req.user.id;
    const { items } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const game = await Game.findById(item.gameId);

      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      if (game.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `${game.title} is out of stock` });
      }

      // kurangi stok
      game.stock -= item.quantity;
      await game.save();

      totalAmount += game.price * item.quantity;

      orderItems.push({
        game: game._id,
        quantity: item.quantity,
        price: game.price,
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
    });

    res.status(201).json({
      message: "Checkout successful",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const receiveOrder = async (req, res) => {
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

    res.json({ message: "Pesanan diterima, kamu bisa memberi review 🎉" });
  } catch {
    res.status(500).json({ message: "Gagal mengupdate status" });
  }
};
