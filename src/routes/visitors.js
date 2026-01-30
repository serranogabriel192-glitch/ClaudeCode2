const express = require("express");
const db = require("../db");
const email = require("../email");

const router = express.Router();

// Sign in a visitor
router.post("/signin", (req, res) => {
  const { visitor_name, company, email: visitorEmail, phone, host_name, host_email, purpose, badge_number, notes } = req.body;

  if (!visitor_name || !host_name) {
    return res.status(400).json({ error: "Visitor name and host name are required." });
  }

  const result = db.insert.run({
    visitor_name: visitor_name.trim(),
    company: company?.trim() || null,
    email: visitorEmail?.trim() || null,
    phone: phone?.trim() || null,
    host_name: host_name.trim(),
    host_email: host_email?.trim() || null,
    purpose: purpose || "Meeting",
    badge_number: badge_number?.trim() || null,
    notes: notes?.trim() || null,
    pre_registered: 0,
  });

  const visitor = db.findById.get(result.lastInsertRowid);

  // Fire-and-forget email notification
  email.notifyHost(visitor).catch((err) => {
    console.error("Email notification failed:", err.message);
  });

  res.status(201).json(visitor);
});

// Sign out a visitor
router.post("/signout/:id", (req, res) => {
  const result = db.signOut.run({ id: Number(req.params.id) });
  if (result.changes === 0) {
    return res.status(404).json({ error: "Visitor not found or already signed out." });
  }
  const visitor = db.findById.get(Number(req.params.id));
  res.json(visitor);
});

// Get all currently signed-in visitors
router.get("/current", (_req, res) => {
  res.json(db.findSignedIn.all());
});

// Search visitors
router.get("/search", (req, res) => {
  const q = `%${req.query.q || ""}%`;
  res.json(db.search.all({ q }));
});

// Pre-register a visitor
router.post("/preregister", (req, res) => {
  const { visitor_name, company, email: visitorEmail, phone, host_name, host_email, purpose, notes } = req.body;

  if (!visitor_name || !host_name) {
    return res.status(400).json({ error: "Visitor name and host name are required." });
  }

  const result = db.insert.run({
    visitor_name: visitor_name.trim(),
    company: company?.trim() || null,
    email: visitorEmail?.trim() || null,
    phone: phone?.trim() || null,
    host_name: host_name.trim(),
    host_email: host_email?.trim() || null,
    purpose: purpose || "Meeting",
    badge_number: null,
    notes: notes?.trim() || null,
    pre_registered: 1,
  });

  const visitor = db.findById.get(result.lastInsertRowid);
  res.status(201).json(visitor);
});

module.exports = router;
