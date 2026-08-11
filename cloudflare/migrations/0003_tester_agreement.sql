ALTER TABLE testers ADD COLUMN agreement_version TEXT;
ALTER TABLE testers ADD COLUMN agreement_accepted_at TEXT;

PRAGMA optimize;
