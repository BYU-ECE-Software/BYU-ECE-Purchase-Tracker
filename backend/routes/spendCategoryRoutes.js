import express from "express";
import { getAllSpendCategories } from "../controllers/spendCategoryController.js";
const router = express.Router();

// GET /spendCategories - fetch all spend categories from the db
router.get("/", getAllSpendCategories);

export default router;
