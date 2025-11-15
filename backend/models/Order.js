import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "pending", // Menunggu Konfirmasi
      "processing", // Perlu Diproses
      "completed", // Pesanan Selesai
      "cancel_request", // Sedang Dibatalkan (menunggu keputusan admin)
      "cancelled", // Pesanan Dibatalkan
    ],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
