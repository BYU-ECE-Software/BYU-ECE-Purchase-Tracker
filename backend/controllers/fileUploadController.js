import { PrismaClient } from "@prisma/client";
import minioClient from "../minioClient.js";
const prisma = new PrismaClient();

//
// Get a signed file url for users to reference
//
export const getSignedFileUrl = async (req, res) => {
  const { itemId, filename } = req.params;

  try {
    // Confirm the file exists for that item
    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item || !item.file.includes(filename)) {
      return res.status(404).json({ error: "File not found for this item" });
    }

    // Generate pre-signed URL
    const url = await minioClient.presignedGetObject(
      "files",
      filename,
      60 * 60 // 10 minutes
    );

    res.status(200).json({ url });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ error: "Failed to generate secure link" });
  }
};
