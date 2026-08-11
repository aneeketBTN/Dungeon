# Dungeon Vertical Slice — Implementation Checks

- **Status:** `IMPLEMENTED`.
- **Files:** `mock/rogue.html`, `mock/rogue.css`, `mock/rogue.js`, `mock/server.py`.
- **Acceptance boundary:** syntax, state-contract inspection, and local HTTP routes are secondary
  evidence. Real Browser visual/usability acceptance remains pending.

## Implemented route

`PRELOAD → HOME → CHARACTER → HALL → RUN → SUMMIT | FAILURE → RESULTS → HOME`

Optional market, Archive, Settings, recovery-run, save/resume, and abandon paths are included.

## Secondary checks

- `mock/rogue.js` passes `node --check`.
- All project Python files parse successfully.
- All project JSON files parse successfully.
- Root, prototype HTML, CSS, JavaScript, Door MP4, Door poster, and local API routes return HTTP
  200 through `mock/server.py`.
- Deterministic URL profiles use the real UI state fields and do not persist over the normal local
  browser profile.
- Live learner files under `state/` and `history/` were not used as test fixtures.

## Required Mac Browser follow-up

- Fresh player golden path.
- Returning player and resumable run.
- Market empty/can-afford purchase and equip.
- Secure, developing, missed, and assisted outcomes.
- Quest heal and full-Resolve completion.
- Anchor protection and Resolve exhaustion.
- Correct and missed final-question transitions.
- Results math, detailed response review, recovery action, and updated home.
- Keyboard, Escape/leave dialog, reduced motion, narrow viewport, refresh, and asset failure.
