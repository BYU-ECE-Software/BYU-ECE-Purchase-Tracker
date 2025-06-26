import express from "express";
const router = express.Router();
import {
  createOrder,
  getAllOrders,
  updateOrder,
  searchOrders,
} from "../controllers/orderController.js";

// GET /orders/search - fetches order requests that match the search query
router.get("/search", searchOrders);

// GET /orders - fetches all order requests
router.get("/", getAllOrders);

// POST /orders - handle purchase form submissions
router.post("/", createOrder);

// PUT /orders - updates an order request
router.put("/:id", updateOrder);

export default router;
