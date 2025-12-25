import mongoose from "mongoose";

const topupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["bank", "ewallet"],
      required: true,
    },
    provider: {
      type: String, // BCA, DANA, OVO, dll
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
    note: String,
  },
  { timestamps: true }
);

export default mongoose.model("Topup", topupSchema);
