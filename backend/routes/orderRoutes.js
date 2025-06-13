import express from "express";
const router = express.Router();
import { createOrder } from "../controllers/orderController.js";

// POST /orders - handle purchase form submissions
router.post("/", createOrder);

export default router;
