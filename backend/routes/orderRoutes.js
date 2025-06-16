import express from "express";
const router = express.Router();
import { createOrder, getAllOrders } from "../controllers/orderController.js";

// POST /orders - handle purchase form submissions
router.post("/", createOrder);
router.get("/", getAllOrders);

export default router;
