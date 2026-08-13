-- The one table in Dungeon that stores a learner's own words.
--
-- Everything else here is a counter, a summary, or a bounded code. This holds the
-- answer text, because the purpose it serves cannot be served without it: the
-- machine marking is not reliable enough to be a grade, and the only honest way to
-- improve it is to compare what the model decided against what a person reading the
-- same answer decides. That comparison needs the prose.
--
-- Three properties keep that defensible:
--
--   expires_at is written by the application at insert, three months out, and rows
--   past it are deleted by the daily scheduled purge. Retention is a stored fact per
--   row, not a policy someone has to remember.
--
--   ON DELETE CASCADE means revoking a tester removes their answers with the rest of
--   their account, so withdrawal is real rather than a promise.
--
--   decision_json holds only the bounded criterion decisions and gap codes the
--   marker already returns to the learner. No free model prose is archived.
--
-- A response that reads as personal distress is never written here: it is answered
-- with support before any marking runs and is not stored at all.
CREATE TABLE written_answer_archive (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  question_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  decision_json TEXT NOT NULL,
  abstained INTEGER NOT NULL DEFAULT 0 CHECK (abstained IN (0, 1)),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (email) REFERENCES testers(email) ON DELETE CASCADE
);

-- The purge scans by expiry, and the owner review reads one question at a time.
CREATE INDEX idx_written_answer_archive_expiry ON written_answer_archive(expires_at);
CREATE INDEX idx_written_answer_archive_question ON written_answer_archive(question_id, created_at);
CREATE INDEX idx_written_answer_archive_email ON written_answer_archive(email);
