import express from "express";
import {
  getAllGames,
  addGame,
  deleteGameById,
  updateGame,
  getGameById,
  getRelatedGames,
  getReviews,
  addReview
} from "../controllers/gameController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// 1. PUBLIC
// ============================
router.get("/", getAllGames);

// penting! related & reviews HARUS sebelum :id
router.get("/:id/related", getRelatedGames);
router.get("/:id/reviews", getReviews);

// GET game by ID — HARUS SETELAH related & reviews
router.get("/:id", getGameById);

// ============================
// 2. USER REVIEW
// ============================
router.post("/:id/reviews", protect, addReview);

// ============================
// 3. ADMIN CRUD
// ============================
router.post("/add", protect, adminOnly, addGame);
router.put("/:id", protect, updateGame);
router.delete("/:id", protect, adminOnly, deleteGameById);

export default router;
