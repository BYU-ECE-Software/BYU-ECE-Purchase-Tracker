import express from "express";
import orderRoutes from "./routes/orderRoutes.js";
import lineMemoRoutes from "./routes/lineMemoRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";
import spendCategoryRoutes from "./routes/spendCategoryRoutes.js";
import receiptUploadRoutes from "./routes/receiptUploadRoutes.js";
import fileUploadRoutes from "./routes/fileUploadRoutes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// Order route mount point
app.use("/api/orders", orderRoutes);

// Line Memo Options route mount point
app.use("/api/lineMemoOptions", lineMemoRoutes);

// Professors route mount point
app.use("/api/professors", professorRoutes);

// Spend categories route mount point
app.use("/api/spendCategories", spendCategoryRoutes);

// Receipt minio route mount point
app.use("/api/receiptUploads", receiptUploadRoutes);

// File minio route mount point
app.use("/api/fileUploads", fileUploadRoutes);

export default app;
