import { PrismaClient } from "@prisma/client";
import minioClient, { minioSigner } from "../minioClient.js";
const prisma = new PrismaClient();

//
// Get a signed receipt url for users to reference
//
export const getSignedReceiptUrl = async (req, res) => {
  const { orderId, filename } = req.params;

  try {
    // Confirm the receipt exists for that order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
    });

    if (!order || !order.receipt.includes(filename)) {
      return res
        .status(404)
        .json({ error: "Receipt not found for this order" });
    }

    // Generate pre-signed URL
    const url = await minioSigner.presignedGetObject(
      "receipts",
      filename,
      60 * 60
    ); // 1 hour

    res.status(200).json({ url: url });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ error: "Failed to generate secure link" });
  }
};
