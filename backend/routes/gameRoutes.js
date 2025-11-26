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

// =============== PUBLIC ===============
router.get("/", getAllGames);

// penting! related & reviews harus di atas /:id
router.get("/:id/related", getRelatedGames);
router.get("/:id/reviews", getReviews);

router.get("/:id", getGameById);

// =============== USER REVIEW ===============
router.post("/:id/reviews", protect, addReview);

// =============== ADMIN CRUD ===============
router.post("/add", protect, adminOnly, addGame);
router.put("/:id", protect, updateGame);
router.delete("/:id", protect, adminOnly, deleteGameById);

export default router;
