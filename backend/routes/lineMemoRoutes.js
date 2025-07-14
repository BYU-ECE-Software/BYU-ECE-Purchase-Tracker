import express from "express";
import {
  createLineMemo,
  deleteLineMemo,
  getAllLineMemoOptions,
  updateLineMemo,
} from "../controllers/lineMemoController.js";
const router = express.Router();

// GET /lineMemoOptions - fetch all line memo options from the db
router.get("/", getAllLineMemoOptions);

// POST /lineMemoOptions - creates a new line memo option
router.post("/", createLineMemo);

// PUT /lineMemoOptions - updates a line memo option
router.put("/:id", updateLineMemo);

// DELETE /lineMemoOptions - delete a line memo option
router.delete("/:id", deleteLineMemo);

export default router;
