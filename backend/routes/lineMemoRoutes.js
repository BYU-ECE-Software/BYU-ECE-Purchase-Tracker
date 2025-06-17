import express from "express";
import { getAllLineMemoOptions } from "../controllers/lineMemoController.js";
const router = express.Router();

// GET /lineMemoOptions - fetch all line memo options from the db
router.get("/", getAllLineMemoOptions);

export default router;
