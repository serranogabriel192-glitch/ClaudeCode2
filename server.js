const express = require("express");
const path = require("path");

// Load .env if present
try {
  const fs = require("fs");
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const [key, ...rest] = line.split("=");
        if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
      });
  }
} catch (_) {
  // no .env file — that's fine
}

const crypto = require("crypto");

const email = require("./src/email");
email.init();

const visitorsRouter = require("./src/routes/visitors");
const adminRouter = require("./src/routes/admin");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// --- Admin auth ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Letmein2026";
const adminTokens = new Set();

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString("hex");
    adminTokens.add(token);
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid password." });
});

function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (token && adminTokens.has(token)) return next();
  res.status(401).json({ error: "Unauthorized. Please log in." });
}

app.use("/api/visitors", visitorsRouter);
app.use("/api/admin", requireAdmin, adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Visitor Sign-In running at http://localhost:${PORT}`);
});
