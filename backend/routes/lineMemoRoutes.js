import express from "express";
import {
  createLineMemo,
  deleteLineMemo,
  getAllLineMemoOptions,
  updateLineMemo,
} from "../controllers/lineMemoController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// GET /lineMemoOptions - fetch all line memo options from the db
router.get("/", requireAdmin, getAllLineMemoOptions);

// POST /lineMemoOptions - creates a new line memo option
router.post("/", requireAdmin, createLineMemo);

// PUT /lineMemoOptions - updates a line memo option
router.put("/:id", requireAdmin, updateLineMemo);

// DELETE /lineMemoOptions - delete a line memo option
router.delete("/:id", requireAdmin, deleteLineMemo);

export default router;
