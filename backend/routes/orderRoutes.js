import express from "express";
import multer from "multer";
import {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  updateOrder,
} from "../controllers/orderController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /orders/user/:userId - fetches orders by user
router.get("/user/:userId", requireAdmin, getOrdersByUser);

// GET /orders - fetches all order requests
router.get("/", requireAdmin, getAllOrders);

// POST /orders - handle purchase form submissions
router.post("/", upload.any(), createOrder);

// PUT /orders - updates an order request
router.put("/:id", requireAdmin, upload.array("receipt"), updateOrder);

export default router;
