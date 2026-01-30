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

const email = require("./src/email");
email.init();

const visitorsRouter = require("./src/routes/visitors");
const adminRouter = require("./src/routes/admin");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/visitors", visitorsRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Visitor Sign-In running at http://localhost:${PORT}`);
});
