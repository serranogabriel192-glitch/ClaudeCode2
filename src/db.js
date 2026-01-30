const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, "visitors.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_name  TEXT    NOT NULL,
    company       TEXT,
    email         TEXT,
    phone         TEXT,
    host_name     TEXT    NOT NULL,
    host_email    TEXT,
    purpose       TEXT    NOT NULL DEFAULT 'Meeting',
    badge_number  TEXT,
    sign_in_time  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    sign_out_time TEXT,
    status        TEXT    NOT NULL DEFAULT 'signed_in',
    notes         TEXT,
    pre_registered INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS badge_sequence (
    id    INTEGER PRIMARY KEY CHECK (id = 1),
    next_number INTEGER NOT NULL DEFAULT 1
  );

  INSERT OR IGNORE INTO badge_sequence (id, next_number) VALUES (1, 1);

  CREATE INDEX IF NOT EXISTS idx_status ON visitors(status);
  CREATE INDEX IF NOT EXISTS idx_sign_in ON visitors(sign_in_time);
`);

// Badge number generator: M365-0001, M365-0002, etc.
const getNextBadge = db.prepare(`SELECT next_number FROM badge_sequence WHERE id = 1`);
const incrementBadge = db.prepare(`UPDATE badge_sequence SET next_number = next_number + 1 WHERE id = 1`);

function nextBadgeNumber() {
  const row = getNextBadge.get();
  const num = row.next_number;
  incrementBadge.run();
  return `M365-${String(num).padStart(4, "0")}`;
}

// --- Queries ---

const insert = db.prepare(`
  INSERT INTO visitors (visitor_name, company, email, phone, host_name, host_email, purpose, badge_number, notes, pre_registered)
  VALUES (@visitor_name, @company, @email, @phone, @host_name, @host_email, @purpose, @badge_number, @notes, @pre_registered)
`);

const signOut = db.prepare(`
  UPDATE visitors SET sign_out_time = datetime('now','localtime'), status = 'signed_out'
  WHERE id = @id AND status = 'signed_in'
`);

const findSignedIn = db.prepare(`
  SELECT * FROM visitors WHERE status = 'signed_in' ORDER BY sign_in_time DESC
`);

const findById = db.prepare(`SELECT * FROM visitors WHERE id = ?`);

const search = db.prepare(`
  SELECT * FROM visitors
  WHERE visitor_name LIKE @q OR company LIKE @q OR host_name LIKE @q
  ORDER BY sign_in_time DESC
  LIMIT 100
`);

const history = db.prepare(`
  SELECT * FROM visitors ORDER BY sign_in_time DESC LIMIT @limit OFFSET @offset
`);

const countAll = db.prepare(`SELECT COUNT(*) AS total FROM visitors`);
const countSignedIn = db.prepare(`SELECT COUNT(*) AS total FROM visitors WHERE status = 'signed_in'`);

const todayStats = db.prepare(`
  SELECT
    COUNT(*) AS total_today,
    SUM(CASE WHEN status = 'signed_in' THEN 1 ELSE 0 END) AS currently_in,
    SUM(CASE WHEN status = 'signed_out' THEN 1 ELSE 0 END) AS checked_out
  FROM visitors
  WHERE date(sign_in_time) = date('now','localtime')
`);

const findPreRegistered = db.prepare(`
  SELECT * FROM visitors WHERE pre_registered = 1 AND status = 'signed_in' AND sign_out_time IS NULL
  ORDER BY sign_in_time DESC
`);

const checkInPreRegistered = db.prepare(`
  UPDATE visitors SET sign_in_time = datetime('now','localtime'), pre_registered = 0
  WHERE id = @id
`);

module.exports = {
  db,
  insert,
  signOut,
  findSignedIn,
  findById,
  search,
  history,
  countAll,
  countSignedIn,
  todayStats,
  findPreRegistered,
  checkInPreRegistered,
  nextBadgeNumber,
};
