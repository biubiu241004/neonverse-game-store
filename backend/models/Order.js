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
      "pending",
      "processing",
      "completed",
      "received",
      "cancel_request",
      "cancelled",
    ],
    default: "pending",
  },

  cancelReasonUser: { type: String, default: "" },

  cancelReasonAdmin: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
