CREATE TABLE IF NOT EXISTS testers (
  email TEXT PRIMARY KEY,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT,
  last_seen_at TEXT
);

CREATE TABLE IF NOT EXISTS learner_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (email) REFERENCES testers(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learner_sessions_email
ON learner_sessions(email);

CREATE INDEX IF NOT EXISTS idx_learner_sessions_expires_at
ON learner_sessions(expires_at);

CREATE TABLE IF NOT EXISTS learner_progress (
  email TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (email) REFERENCES testers(email) ON DELETE CASCADE
);

PRAGMA optimize;
