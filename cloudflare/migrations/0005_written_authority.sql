-- Daily metering contains no candidate text, model output, or retrieved course text.
-- It exists only to bound cost and abuse per admitted tester.
CREATE TABLE written_authority_usage (
  email TEXT NOT NULL,
  usage_day TEXT NOT NULL,
  checks INTEGER NOT NULL DEFAULT 0 CHECK (checks >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (email, usage_day),
  FOREIGN KEY (email) REFERENCES testers(email) ON DELETE CASCADE
);

CREATE INDEX idx_written_authority_usage_day ON written_authority_usage(usage_day);
