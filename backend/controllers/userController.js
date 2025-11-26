// All User Methods

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fetch all Users for form dropdown
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        fullName: "asc",
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Fetch only users who are secretaries
export const getSecretaries = async (req, res) => {
  try {
    const secretaries = await prisma.user.findMany({
      where: { isSecretary: true },
      orderBy: {
        fullName: "asc",
      },
    });

    res.status(200).json(secretaries);
  } catch (error) {
    console.error("Error fetching secretaries:", error);
    res.status(500).json({ error: "Failed to fetch secretaries" });
  }
};

// Create a new User
export const createUser = async (req, res) => {
  const { fullName, byuNetId, email, isSecretary } = req.body;

  // Basic validation
  if (!fullName || !byuNetId || !email) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newUser = await prisma.user.create({
      data: {
        fullName,
        byuNetId,
        email: email?.toLowerCase().trim(),
        isSecretary: isSecretary ?? false,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Update a User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { fullName, byuNetId, email, isSecretary } = req.body;

  //Basic Validation
  if (!fullName || !byuNetId || !email) {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        fullName,
        byuNetId,
        email,
        ...(typeof isSecretary === "boolean" ? { isSecretary } : {}),
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user." });
  }
};

// Delete a User
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);

    // Handle case where users doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Failed to delete user" });
  }
};
