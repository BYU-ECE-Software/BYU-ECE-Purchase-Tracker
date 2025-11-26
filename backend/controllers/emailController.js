// src/controllers/emailController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sendMail from "../email/sendMail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load template once
const templatePath = path.join(__dirname, "../email/orderPurchased.html");
let emailTemplate = "";
if (fs.existsSync(templatePath)) {
  emailTemplate = fs.readFileSync(templatePath, "utf8");
  console.log("Loaded email template from", templatePath);
} else {
  console.warn("No email template found at", templatePath);
}

// tiny templating helper
function renderTemplate({ name, subject, body }) {
  if (!emailTemplate) {
    return `
      <h2>Hello ${name || "User"},</h2>
      <p>${body || ""}</p>
      <p>Best regards,<br/>ECE Purchasing</p>
    `;
  }

  let html = emailTemplate;
  html = html.replace(/{{name}}/g, name || "User");
  html = html.replace(/{{subject}}/g, subject || "Notification");
  html = html.replace(/{{body}}/g, body || "");
  return html;
}

// POST /api/email/send
export async function sendEmail(req, res) {
  const { to, subject, message, name } = req.body;

  if (!to) {
    return res.status(400).json({ success: false, error: "Missing 'to' field" });
  }

  const body = message || "This is a default message.";
  const finalSubject = subject || "No subject";

  const html = renderTemplate({
    name,
    subject: finalSubject,
    body,
  });

  try {
    await sendMail({
      to,
      subject: finalSubject,
      text: body,
      html,
    });
    return res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Error in sendEmail controller:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Internal error" });
  }
}

// GET /api/email/test
export async function sendTestEmail(req, res) {
  const to = process.env.TEST_TO || process.env.FROM_EMAIL;

  const subject = "Nodemailer Test Email";
  const body = `This is a test email sent from the /api/email/test route at ${new Date().toISOString()}.`;

  const html = renderTemplate({
    name: "Tester",
    subject,
    body,
  });

  try {
    await sendMail({
      to,
      subject,
      text: body,
      html,
    });

    return res
      .status(200)
      .send(`Test email sent to ${to}. Check your inbox (and spam folder).`);
  } catch (error) {
    console.error("Error in sendTestEmail controller:", error);
    return res
      .status(500)
      .send("Failed to send test email: " + (error.message || "Internal error"));
  }
}
