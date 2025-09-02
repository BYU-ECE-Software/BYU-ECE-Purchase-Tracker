import express from "express";
import {
  createSpendCategory,
  deleteSpendCategory,
  getAllSpendCategories,
  getStudentSpendCategories,
  updateSpendCategory,
} from "../controllers/spendCategoryController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// GET /spendCategories/studentVisible - fetch spend categories that are should be visible to students
router.get("/studentVisible", getStudentSpendCategories);

// GET /spendCategories - fetch all spend categories from the db for admin
router.get("/", requireAdmin, getAllSpendCategories);

// POST /spendCategories - creates a new spend category
router.post("/", requireAdmin, createSpendCategory);

// PUT /spendCategories - updates a spend category
router.put("/:id", requireAdmin, updateSpendCategory);

// DELETE /spendCategories - delete a spend category
router.delete("/:id", requireAdmin, deleteSpendCategory);

export default router;
