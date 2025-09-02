import jwt from "jsonwebtoken";

const ADMIN_SHARED_SECRET = process.env.ADMIN_SHARED_SECRET;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "admin_session";

export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies[SESSION_COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Auth required" });
    jwt.verify(token, ADMIN_SHARED_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired auth" });
  }
}
