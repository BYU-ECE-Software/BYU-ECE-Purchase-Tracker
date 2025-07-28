import express from "express";
import multer from "multer";
import {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  updateOrder,
} from "../controllers/orderController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /orders/user/:userId - fetches orders by user
router.get("/user/:userId", getOrdersByUser);

// GET /orders - fetches all order requests
router.get("/", getAllOrders);

// POST /orders - handle purchase form submissions
router.post("/", upload.single("receipt"), createOrder);

// PUT /orders - updates an order request
router.put("/:id", updateOrder);

export default router;
