const express = require("express");
const db = require("../db");

const router = express.Router();

// Dashboard stats
router.get("/stats", (_req, res) => {
  const today = db.todayStats.get();
  const allTime = db.countAll.get();
  res.json({ today, all_time_total: allTime.total });
});

// Visitor history with pagination
router.get("/history", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;
  const rows = db.history.all({ limit, offset });
  const total = db.countAll.get().total;
  res.json({ rows, total, limit, offset });
});

// Export visitors as CSV
router.get("/export", (req, res) => {
  const rows = db.history.all({ limit: 100000, offset: 0 });

  const header = "ID,Name,Company,Email,Phone,Host,Purpose,Badge,Sign In,Sign Out,Status";
  const csvRows = rows.map((r) =>
    [
      r.id,
      quote(r.visitor_name),
      quote(r.company),
      quote(r.email),
      quote(r.phone),
      quote(r.host_name),
      quote(r.purpose),
      quote(r.badge_number),
      r.sign_in_time,
      r.sign_out_time || "",
      r.status,
    ].join(",")
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=visitors.csv");
  res.send([header, ...csvRows].join("\n"));
});

function quote(val) {
  if (!val) return "";
  return `"${val.replace(/"/g, '""')}"`;
}

module.exports = router;
