import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
        required: true,
      },
      quantity: { type: Number, default: 1 },
    },
  ],
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
