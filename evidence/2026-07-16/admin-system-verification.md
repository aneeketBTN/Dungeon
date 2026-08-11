# Admin System Verification

- **Goal:** Install the owner-supplied Project Operating System before product implementation.
- **Status:** `IMPLEMENTED → VERIFIED(file/reference audit) → DONE`.
- **Date:** 2026-07-16.
- **Primary evidence for this gate:** workspace files and internal-reference audit.
- **Secondary evidence:** current Codex manual guidance confirming `AGENTS.md` is the automatic
  repository instruction surface.

## Expected

- Codex-native living index exists.
- Claude compatibility entry routes into the same index.
- Bug, quality, and session ledgers exist.
- Evidence gates and open/close rituals are durable.
- Authority and exchange rules exist for owner/agent/tool coordination.
- Game implementation remains gated.

## Observed

- `AGENTS.md` contains current status, source order, gates, directory map, Key Files, domain rules,
  conventions, rituals, gaps, and self-maintenance.
- `BUG-LAWS.md`, `QUALITY-LOG.md`, and `CHANGELOG.md` exist and are seeded from demonstrated
  project conditions.
- `briefs/PROJECT_OPERATING_SYSTEM.md` records the adaptation.
- `evidence/README.md` defines evidence acceptance.
- `coordination/CHARTER.md` and `coordination/exchange/README.md` define authority and immutable
  exchange.
- `CLAUDE.md` points Claude-based sessions to `AGENTS.md`.
- `DESIGN_SOURCE_INDEX.md` includes the operating-system brief.

## Remaining gates

- Real Browser usability: `WAITING_REAL_BROWSER`.
- Windows Computer Use: `WAITING_COMPUTER_USE`.
- Remaining external design briefs: `WAITING_OWNER_BRIEFS`.
- Product conflicts C1–C9: resolve when they materially affect the active slice.

## Verification commands/results

- Required operating-system artifacts checked: **11 present, 0 missing**.
- Indexed Key File references checked: **16 present, 0 missing**.
- `AGENTS.md` size: **12,304 bytes**, below Codex's normal **32 KiB** project-instruction limit.
- Placeholder scan found only intentional status/evidence notation such as `<evidence>` and
  `WAITING_<GATE>`; no unfilled project-template placeholders remain.
- `AGENTS.md` contains Current Status, required open order, evidence vocabulary, Directory Map,
  Key Files, design/domain rules, conventions, open/close rituals, Known Gaps, self-maintenance,
  and metadata.
- Product/UI gates remain waiting and were not promoted by this documentation verification.
