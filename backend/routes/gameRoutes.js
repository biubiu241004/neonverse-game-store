import express from "express";
import { getAllGames, addGame, deleteGameById } from "../controllers/gameController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllGames);
router.post("/add", protect, adminOnly, addGame);
router.delete("/:id", protect, adminOnly, deleteGameById);

export default router;
