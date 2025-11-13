import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 Gunakan memoryStorage agar Railway tidak hapus file
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📸 Upload langsung ke Cloudinary
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diupload" });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: "valdo_store",
    });

    return res.json({ imageUrl: result.secure_url });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload gagal", error: err.message });
  }
});

export default router;
