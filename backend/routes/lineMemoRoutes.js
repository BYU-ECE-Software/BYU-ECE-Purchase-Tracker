import express from "express";
import { getAllLineMemoOptions } from "../controllers/lineMemoController.js";
const router = express.Router();

// POST /orders - handle purchase form submissions
router.get("/", getAllLineMemoOptions);

export default router;
