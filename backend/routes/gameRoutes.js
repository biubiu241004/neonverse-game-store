import express from "express";
import { getGames, createGame } from "../controllers/gameController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getGames);
router.post("/", protect, adminOnly, createGame);

export default router;
