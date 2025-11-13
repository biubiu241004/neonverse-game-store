import express from "express";
import multer from "multer";
import path from "path";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// 🗂️ Tentukan folder penyimpanan
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 🧩 Filter hanya gambar
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// 📸 Route upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "valdo_store"
    });

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: "Upload gagal", error: err.message });
  }
});

export default router;
