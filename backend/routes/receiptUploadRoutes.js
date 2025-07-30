import express from "express";
import multer from "multer"; // handles file uploads
import { getSignedReceiptUrl } from "../controllers/receiptUploadController.js";

const router = express.Router();

// Use in-memory storage for uploaded files
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/receiptUploads/:orderId/:filename - get a secure receipt link
router.get("/:orderId/:filename", getSignedReceiptUrl);

export default router;
