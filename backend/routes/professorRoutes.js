import express from "express";
import { getAllProfessors } from "../controllers/professorController.js";
const router = express.Router();

// GET /professors - fetch all line memo options from the db
router.get("/", getAllProfessors);

export default router;
