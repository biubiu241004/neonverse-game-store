import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ====== AMOUNT ======
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true, // amount - fee
    },

    // ====== METHOD ======
    method: {
      type: String,
      enum: ["bank", "ewallet"],
      required: true,
    },

    bankName: {
      type: String, // BCA, BRI, Mandiri, DANA, OVO, dll
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },

    // ====== STATUS ======
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "rejected"],
      default: "pending",
    },

    note: {
      type: String,
    },

    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Withdraw", withdrawSchema);
