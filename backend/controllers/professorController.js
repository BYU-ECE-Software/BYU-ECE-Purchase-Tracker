// All Professor Methods

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fetch all Professors for form dropdown
export const getAllProfessors = async (req, res) => {
  try {
    const professors = await prisma.professors.findMany({
      orderBy: {
        lastName: "asc",
      },
    });

    res.status(200).json(professors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch professors" });
  }
};

// Create a new Professor
export const createProfessor = async (req, res) => {
  const { firstName, lastName, title, email } = req.body;

  // Basic validation
  if (!firstName || !lastName) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newProfessor = await prisma.professors.create({
      data: {
        firstName,
        lastName,
        title,
        email: email?.toLowerCase().trim(),
      },
    });

    res.status(201).json(newProfessor);
  } catch (error) {
    console.error("Error creating professor:", error);
    res.status(500).json({ error: "Failed to create professor" });
  }
};

// Update a Professor
export const updateProfessor = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, title, email } = req.body;

  //Basic Validation
  if (!firstName || !lastName) {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedProfessor = await prisma.professors.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        title: title?.trim() === "" ? null : title?.trim(),
        email: email?.trim() === "" ? null : email?.toLowerCase().trim(),
      },
    });

    res.status(200).json(updatedProfessor);
  } catch (error) {
    console.error("Error updating professor:", error);
    res.status(500).json({ error: "Failed to update professor." });
  }
};

// Delete a Professor
export const deleteProfessor = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProfessor = await prisma.professors.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json({ message: "Professor deleted successfully", deletedProfessor });
  } catch (error) {
    console.error("Error deleting professor:", error);

    // Handle case where professor doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Professor not found" });
    }

    res.status(500).json({ error: "Failed to delete professor" });
  }
};
