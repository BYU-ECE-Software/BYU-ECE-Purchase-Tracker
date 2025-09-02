import express from "express";
import {
  createProfessor,
  deleteProfessor,
  getAllProfessors,
  updateProfessor,
} from "../controllers/professorController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// GET /professors - fetch all professors from the db
router.get("/", getAllProfessors);

// POST /professors - creates a new professor
router.post("/", requireAdmin, createProfessor);

// PUT /professors - updates a professor
router.put("/:id", requireAdmin, updateProfessor);

// DELETE /professors - delete a professor
router.delete("/:id", requireAdmin, deleteProfessor);

export default router;
