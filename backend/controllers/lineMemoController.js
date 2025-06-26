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
