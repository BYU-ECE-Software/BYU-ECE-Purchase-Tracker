// All Spend Categories

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fetch all Spend Categories for form dropdown
export const getAllSpendCategories = async (req, res) => {
  try {
    const spendCategories = await prisma.spendCategory.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json(spendCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch spend categories" });
  }
};
