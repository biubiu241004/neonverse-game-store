import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  image: { type: String },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin pemilik
}, { timestamps: true });

const Game = mongoose.model("Game", gameSchema);
export default Game;
