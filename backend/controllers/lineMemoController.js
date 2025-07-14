// All Line Memo Methods

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fetch all Line Memo Options for form dropdown
export const getAllLineMemoOptions = async (req, res) => {
  try {
    const lineMemoOptions = await prisma.lineMemoOption.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json(lineMemoOptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch line memo options" });
  }
};

// Create a new Line Memo
export const createLineMemo = async (req, res) => {
  const { id, description } = req.body;

  // Basic validation
  if (!id || !description) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newOption = await prisma.lineMemoOption.create({
      data: {
        id,
        description,
      },
    });

    res.status(201).json(newOption);
  } catch (error) {
    console.error("Error creating line memo option:", error);
    res.status(500).json({ error: "Failed to create line memo option" });
  }
};

// Update a Line Memo Option
export const updateLineMemo = async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  //Basic Validation
  if (!description) {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedOption = await prisma.lineMemoOption.update({
      where: { id: parseInt(id) },
      data: {
        description,
      },
    });

    res.status(200).json(updatedOption);
  } catch (error) {
    console.error("Error updating line memo option:", error);
    res.status(500).json({ error: "Failed to update line memo option." });
  }
};

// Delete a Line Memo Option
export const deleteLineMemo = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedOption = await prisma.lineMemoOption.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: "Line Memo Option deleted successfully",
      deletedOption,
    });
  } catch (error) {
    console.error("Error deleting line memo option:", error);

    // Handle case where line memo option doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Line Memo option not found" });
    }

    res.status(500).json({ error: "Failed to delete line memo option" });
  }
};
