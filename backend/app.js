import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
//import dotenv from "dotenv";
//dotenv.config();
//import passport from "passport";
//import { Strategy as SamlStrategy } from "@node-saml/passport-saml";
//import path from "path";
//import fs from "fs";
//import { fileURLToPath } from "url";
//import { setupSessions } from "./utils/sessions.js";
//import axios from "axios";

// imports for site specific routes
import orderRoutes from "./routes/orderRoutes.js";
import lineMemoRoutes from "./routes/lineMemoRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";
import spendCategoryRoutes from "./routes/spendCategoryRoutes.js";
import receiptUploadRoutes from "./routes/receiptUploadRoutes.js";
import fileUploadRoutes from "./routes/fileUploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";

/*const allowedOrigins = [
  "https://ecepurchasing.byu.edu", //idk what the site name is to put here
  "http://localhost:5173",
  "http://localhost:3000",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CERT_DIR = process.env.CERT_DIR || path.join(__dirname, "certs");

console.log("Using certificate directory:", CERT_DIR);*/

const ADMIN_SHARED_SECRET = process.env.ADMIN_SHARED_SECRET;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "admin_session";
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || 2);

if (!ADMIN_SHARED_SECRET) {
  console.error("ADMIN_SHARED_SECRET is missing. Set it in .env / compose.");
  process.exit(1);
}

const app = express();
//await setupSessions(app);
app.set("trust proxy", 1); // so secure cookies work behind a proxy/HTTPS

//app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// --- helper: issue a signed token ---
function issueToken() {
  return jwt.sign({ role: "admin" }, ADMIN_SHARED_SECRET, {
    expiresIn: `${SESSION_TTL_HOURS}h`,
  });
}

// --- routes: login / check / logout ---
app.post("/auth/admin-login", (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "Password required" });
  if (password !== ADMIN_SHARED_SECRET) {
    return res.status(401).json({ error: "Bad password" });
  }

  const token = jwt.sign({ role: "admin" }, ADMIN_SHARED_SECRET, {
    expiresIn: `${SESSION_TTL_HOURS}h`,
  });

  // only set Secure on HTTPS
  const isSecureRequest =
    req.secure || req.headers["x-forwarded-proto"] === "https";

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest, // <-- was process.env.NODE_ENV === 'production'
    maxAge: SESSION_TTL_HOURS * 60 * 60 * 1000,
    path: "/",
  });

  return res.json({ ok: true });
});

app.get("/auth/admin-check", (req, res) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) return res.status(200).json({ authed: false });
  try {
    jwt.verify(token, ADMIN_SHARED_SECRET);
    return res.status(200).json({ authed: true });
  } catch {
    return res.status(200).json({ authed: false });
  }
});

app.post("/auth/admin-logout", (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

//app.use(cors({ origin: allowedOrigins, credentials: true }));

/*// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

//Build URL variables
const BASE_URL = process.env.BASE_URL || "https://ecepurchasing.byu.edu"; // again, I need to change this
const CALLBACK_PATH = process.env.CALLBACK_PATH || "/api/auth/login/callback";
const LOGOUT_CALLBACK_PATH =
  process.env.LOGOUT_CALLBACK_PATH || "/api/auth/logout/callback";

//Read certs and keys in as vars
const idpCert = fs.readFileSync(
  path.join(CERT_DIR, "byu_idp_signing_cert.pem"),
  "utf8"
); // IdP x509 cert
const spKey = fs.readFileSync(
  path.join(CERT_DIR, "SAML_sign_bundle.key"),
  "utf8"
); // SP private key
const spCert = fs.existsSync(path.join(CERT_DIR, "SAML_sign_leaf.crt"))
  ? fs.readFileSync(path.join(CERT_DIR, "SAML_sign_leaf.crt"), "utf8") // optional but useful for metadata
  : null;

// SAML Strategy
const samlStrategy = new SamlStrategy(
  {
    //Core
    issuer: `${BASE_URL}`,
    entryPoint: "https://cas.byu.edu/cas/idp/profile/SAML2/Redirect/SSO", //Idp SSO URL
    callbackUrl: `${BASE_URL}${CALLBACK_PATH}`,
    idpCert: idpCert,
    privateKey: spKey,
    decryptionPvk: spKey,

    //Logging out
    logoutUrl: "https://cas.byu.edu/cas/idp/profile/SAML2/POST/SLO", //Idp SLO endpoint
    logoutCallbackUrl: `${BASE_URL}${LOGOUT_CALLBACK_PATH}`,

    //Security Preferences
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
    wantAssertionsSigned: false,
    wantAuthnResponseSigned: false, //maybe false?
    validateInResponseTo: "always",
    disableRequestedAuthnContext: false,
    identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified",
    // authnContext: [
    //   "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
    // ],

    // acceptedClockSkewMs: 3000, // 3s skew tolerance
    // forceAuthn: false,
  },
  (profile, done) => {
    // This function is called after successful authentication
    // The profile contains SAML assertion attributes
    return done(null, {
      id: profile["byuId"],
      name: profile["nameID"],
      nameIDFormat: profile["nameIDFormat"],
      // isAdmin: profile['isAdmin'] || false, // Adjust attribute name as per IdP configuration
      attributes: profile,
    });
  }
);

// Use the SAML strategy
passport.use(samlStrategy);

// Serialize user to session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Routes

// SP Metadata
app.get("/api/saml/metadata", (req, res) => {
  res.type("application/xml");
  res.send(samlStrategy.generateServiceProviderMetadata(spCert, spCert));
});

// SAML Login Route (initiates SSO)
app.get(
  "/api/auth/login",
  passport.authenticate("saml", {
    failureRedirect: "/",
  }),
  function (req, res) {
    res.redirect("/");
  }
  // successRedirect: "/admin",
  // failureRedirect: "/login",
);
//OIT CODE
// app.get(
//     '/login/byu-cas-saml',
//     passport.authenticate("saml", {
//         failureRedirect: "/",
//         failureFlash: true
//     }),
//     function (req, res) {
//         res.redirect("/");
//     },
// );

// SAML Callback Route (handles IdP response)
app.post(
  CALLBACK_PATH,
  // bodyParser.urlencoded({ extended: false }),
  passport.authenticate("saml", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    try {
      const auth_String = Buffer.from(
        `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
      ).toString("base64");
      const authoptions = {
        method: "POST",
        url: "https://api.byu.edu/token",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          authorization: `Basic ${auth_String}`,
        },
        data: `grant_type=client_credentials`,
      };
      const authResponse = await axios.request(authoptions);
      const accessToken = authResponse.data.access_token;
      // User is authenticated, fetch additional data from API
      const userId = req.user.id;
      const options = {
        method: "GET",
        url: `https://api.byu.edu/byuapi/persons/v4/${userId}`,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.request(options);
      const userData = response.data;
      req.session.userData = userData;
      // register could go here
      // req.user.isAdmin = userData.isAdmin || req.user.isAdmin; // Update admin status
      // req.session.user = req.user; // Store user in session
      res.redirect("/admin");
    } catch (error) {
      console.error("API Error:", error);
      res.redirect("/error");
    }
  }
);

// Admin Route (protected)
app.get("/admin", ensureAuthenticated, (req, res) => {
  res.json({
    user: req.user,
    isAdmin: !!req.user.isAdmin,
  });
});

// SLO Route (initiates Single Logout)
app.get("/api/auth/logout", ensureAuthenticated, (req, res) => {
  req.user = req.user || {};
  if (!req.user.nameID) {
    // fallback to session user if needed
    req.user.nameID = req.session?.passport?.user?.nameID;
    req.user.nameIDFormat = req.session?.passport?.user?.nameIDFormat;
  }

  samlStrategy.logout(req, (err, requestUrl) => {
    if (err) {
      console.error("SAML SLO error:", err);
      return res.redirect("/error");
    }
    // Redirect to IdP for SLO
    return res.redirect(requestUrl);
  });
});

// SLO Callback Route
app.post(LOGOUT_CALLBACK_PATH, (req, res) => {
  // Clear local session
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
});*/

// Route Mount Points for standard app routes
app.use("/api/orders", orderRoutes);
app.use("/api/lineMemoOptions", lineMemoRoutes);
app.use("/api/professors", professorRoutes);
app.use("/api/spendCategories", spendCategoryRoutes);
app.use("/api/receiptUploads", receiptUploadRoutes);
app.use("/api/fileUploads", fileUploadRoutes);
app.use("/api/users", userRoutes);

export default app;
