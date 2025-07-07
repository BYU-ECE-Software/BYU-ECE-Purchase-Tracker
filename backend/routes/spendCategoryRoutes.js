import express from "express";
import {
  createSpendCategory,
  getAllSpendCategories,
  getStudentSpendCategories,
} from "../controllers/spendCategoryController.js";
const router = express.Router();

// GET /spendCategories/studentVisible - fetch spend categories that are should be visible to students
router.get("/studentVisible", getStudentSpendCategories);

// GET /spendCategories - fetch all spend categories from the db for admin
router.get("/", getAllSpendCategories);

// POST /spendCategories - creates a new spend category
router.post("/", createSpendCategory);

export default router;
