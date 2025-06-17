import express from "express";
import orderRoutes from "./routes/orderRoutes.js";
import lineMemoRoutes from "./routes/lineMemoRoutes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies
app.use("/api/orders", orderRoutes); // Route mount point
app.use("/api/lineMemoOptions", lineMemoRoutes);

export default app;
