import express from "express";
import { getAllGames, addGame, deleteGameById, updateGame } from "../controllers/gameController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllGames);
router.post("/add", protect, adminOnly, addGame);
router.put("/:id", protect, updateGame);
router.delete("/:id", protect, adminOnly, deleteGameById);

export default router;
