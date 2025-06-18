import express from "express";
const router = express.Router();
import {
  createOrder,
  getAllOrders,
  updateOrder,
} from "../controllers/orderController.js";

// POST /orders - handle purchase form submissions
router.post("/", createOrder);

// GET /orders - fetches all order requests
router.get("/", getAllOrders);

// PUT /orders - updates an order request
router.put("/:id", updateOrder);

export default router;
