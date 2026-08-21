-- Device count and Cloudflare's coarse country signal are no longer authentication
-- controls. Keep the nullable columns for backwards-compatible schema reads, but
-- erase the legacy security state so no tester remains visibly or effectively
-- locked after this release.
UPDATE testers
SET first_country = NULL,
    location_locked_at = NULL,
    lock_reason = NULL
WHERE first_country IS NOT NULL
   OR location_locked_at IS NOT NULL
   OR lock_reason IS NOT NULL;

UPDATE learner_sessions
SET country = NULL
WHERE country IS NOT NULL;
