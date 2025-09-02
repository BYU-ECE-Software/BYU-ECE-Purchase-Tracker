import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../controllers/userController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// GET /users - fetch all users from the db
router.get("/", requireAdmin, getAllUsers);

// POST /users - creates a new user
router.post("/", requireAdmin, createUser);

// PUT /users - updates a user
router.put("/:id", requireAdmin, updateUser);

// DELETE /users - delete a user
router.delete("/:id", requireAdmin, deleteUser);

export default router;
