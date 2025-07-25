import { PrismaClient } from "@prisma/client";
import minioClient from "../minioClient.js";
const prisma = new PrismaClient();

// read the order id to know which order to attach the receipt to
export const uploadReceiptAndAttachToOrder = async (req, res) => {
  const { orderId } = req.params;

  // Get the uploaded file and its type to prepare for upload
  try {
    const { originalname, buffer, mimetype } = req.file;
    const metaData = { "Content-Type": mimetype };

    await minioClient.putObject("receipts", originalname, buffer, metaData);

    // construct a url to access the file from minio console. this will be saved to db
    const fileUrl = `http://localhost:9000/receipts/${originalname}`;

    // Append new file URL to existing receipt urls in the db
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        receiptUrls: {
          push: fileUrl,
        },
      },
    });

    res.status(200).json({
      message: "Receipt uploaded and linked successfully",
      fileUrl,
      updatedOrder,
    });
  } catch (err) {
    console.error("Error uploading receipt:", err);
    res.status(500).json({ error: "Receipt upload failed" });
  }
};
