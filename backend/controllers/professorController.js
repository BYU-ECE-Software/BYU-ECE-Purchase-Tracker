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
