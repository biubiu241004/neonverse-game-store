import express from "express";
import { checkout } from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, checkout);

export default router;
