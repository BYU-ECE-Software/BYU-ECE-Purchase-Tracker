// All Spend Categories

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fetch Spend Categories for form dropdown - only the ones we want students to have the option to select
export const getStudentSpendCategories = async (req, res) => {
  try {
    const spendCategories = await prisma.spendCategory.findMany({
      where: { visibleToStudents: true },
      orderBy: {
        code: "asc",
      },
    });

    // "Other" always at the bottom of the list
    const reordered = [
      ...spendCategories.filter((sc) => sc.code !== "Other"),
      ...spendCategories.filter((sc) => sc.code === "Other"),
    ];

    res.status(200).json(reordered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch spend categories" });
  }
};

// Fetch Spend Categories for admin use - All Spend Categories
export const getAllSpendCategories = async (req, res) => {
  try {
    const spendCategories = await prisma.spendCategory.findMany({
      orderBy: {
        code: "asc",
      },
    });

    // "Other" always at the bottom of the list
    const reordered = [
      ...spendCategories.filter((sc) => sc.code !== "Other"),
      ...spendCategories.filter((sc) => sc.code === "Other"),
    ];

    res.status(200).json(reordered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch spend categories" });
  }
};

// Create a new Spend Category
export const createSpendCategory = async (req, res) => {
  const { code, description, visibleToStudents } = req.body;

  // Basic validation
  if (!code || !description || typeof visibleToStudents !== "boolean") {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the spend category
  try {
    const newCategory = await prisma.spendCategory.create({
      data: {
        code,
        description,
        visibleToStudents,
      },
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating spend category:", error);
    res.status(500).json({ error: "Failed to create spend category" });
  }
};

// Update a Spend Category
export const updateSpendCategory = async (req, res) => {
  const { id } = req.params;
  const { code, description, visibleToStudents } = req.body;

  //Basic Validation
  if (!code || !description || typeof visibleToStudents !== "boolean") {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedSpendCategory = await prisma.spendCategory.update({
      where: { id: parseInt(id) },
      data: {
        code,
        description,
        visibleToStudents,
      },
    });

    res.status(200).json(updatedSpendCategory);
  } catch (error) {
    console.error("Error updating spend category:", error);
    res.status(500).json({ error: "Failed to update spend category." });
  }
};

// Delete a Spend Category
export const deleteSpendCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSpendCategory = await prisma.spendCategory.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json({
        message: "Spend Category deleted successfully",
        deletedSpendCategory,
      });
  } catch (error) {
    console.error("Error deleting spend category:", error);

    // Handle case where spend category doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Spend Category not found" });
    }

    res.status(500).json({ error: "Failed to delete spend category" });
  }
};
