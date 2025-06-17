import express from "express";
const router = express.Router();
import { createOrder, getAllOrders } from "../controllers/orderController.js";

// POST /orders - handle purchase form submissions
router.post("/", createOrder);

// GET /orders - fetches all order requests
router.get("/", getAllOrders);

export default router;
