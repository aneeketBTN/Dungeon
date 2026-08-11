ALTER TABLE testers ADD COLUMN first_country TEXT;
ALTER TABLE testers ADD COLUMN location_locked_at TEXT;
ALTER TABLE testers ADD COLUMN lock_reason TEXT;
ALTER TABLE learner_sessions ADD COLUMN country TEXT;

CREATE INDEX IF NOT EXISTS idx_testers_location_locked_at
ON testers(location_locked_at)
WHERE location_locked_at IS NOT NULL;

PRAGMA optimize;
