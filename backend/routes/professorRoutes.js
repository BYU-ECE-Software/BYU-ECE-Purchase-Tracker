import express from "express";
import {
  createProfessor,
  deleteProfessor,
  getAllProfessors,
  updateProfessor,
} from "../controllers/professorController.js";
const router = express.Router();

// GET /professors - fetch all line memo options from the db
router.get("/", getAllProfessors);

// POST /professors - creates a new professor
router.post("/", createProfessor);

// PUT /professors - updates a professor
router.put("/:id", updateProfessor);

// DELETE /professors - delete a professor
router.delete("/:id", deleteProfessor);

export default router;
