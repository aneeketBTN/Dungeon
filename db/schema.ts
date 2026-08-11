export const testerSchema = `
CREATE TABLE IF NOT EXISTS testers (
  email TEXT PRIMARY KEY,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT,
  last_seen_at TEXT,
  first_country TEXT,
  location_locked_at TEXT,
  lock_reason TEXT,
  agreement_version TEXT,
  agreement_accepted_at TEXT,
  community_invite_opened_at TEXT,
  community_join_acknowledged_at TEXT,
  community_reminder_at TEXT
)`;

export const learnerSessionSchema = `
CREATE TABLE IF NOT EXISTS learner_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  country TEXT,
  FOREIGN KEY (email) REFERENCES testers(email) ON DELETE CASCADE
)`;

export const learnerProgressSchema = `
CREATE TABLE IF NOT EXISTS learner_progress (
  email TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (email) REFERENCES testers(email) ON DELETE CASCADE
)`;
