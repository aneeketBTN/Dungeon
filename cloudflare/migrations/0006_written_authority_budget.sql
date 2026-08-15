-- A single counter per UTC day for the whole cohort.
--
-- The per-tester table bounds one person's use, but the owner's real constraint is
-- total spend, and per-tester caps only bound that as (testers x cap). Admitting one
-- more tester silently raises the ceiling. This table is the one number that makes
-- exceeding the budget arithmetically impossible regardless of how many people are
-- admitted. It holds no email, question, answer, retrieved text, or result.
CREATE TABLE written_authority_budget (
  usage_day TEXT PRIMARY KEY,
  checks INTEGER NOT NULL DEFAULT 0 CHECK (checks >= 0),
  updated_at TEXT NOT NULL
);
