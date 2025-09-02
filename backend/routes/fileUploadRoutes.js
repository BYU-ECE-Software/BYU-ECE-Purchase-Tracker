import express from "express";
//import multer from "multer"; // handles file uploads
import { getSignedFileUrl } from "../controllers/fileUploadController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// Use in-memory storage for uploaded files
//const upload = multer({ storage: multer.memoryStorage() });

// GET /api/fileUploads/:itemId/:filename - get a secure file link
router.get("/:itemId/:filename", requireAdmin, getSignedFileUrl);

export default router;
