// src/routes/emailRoutes.js
import { Router } from "express";
import { sendEmail, sendTestEmail } from "../controllers/emailController.js";

const router = Router();

// POST /api/email/send
router.post("/send", sendEmail);

// GET /api/email/test
router.get("/test", sendTestEmail);

export default router;
