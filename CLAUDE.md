# Dungeon — Claude Compatibility Entry

The project's single living index is `AGENTS.md`. Read it top-to-bottom before doing any work,
then follow its required source order, ledgers, evidence gates, and open/close rituals.

Do not duplicate current status, Key Files, gaps, or operating rules here. `AGENTS.md` is the
source of truth so Codex and Claude-based sessions share one administration system.

**Screenshots:** the Browser pane's screenshot tool cannot work in this repo — an undisplayed pane
composites no frames, and no retry, reload, resize or tab-select changes that. Use
`node tools/screenshot.mjs --port <port>` and read `docs/governance/SCREENSHOTS.md` first. That page
also carries the trap worth more than the picture: a non-compositing pane freezes
`document.timeline` at 0, so **every CSS transition reads as its start value** and a correct rule
looks broken. Three sessions have re-derived this; two filed the artefact as a CSS bug.

## Learning-engine startup

For an explicitly requested in-chat engine session:

1. Read `AGENTS.md`.
2. Read `docs/governance/DESIGN_SOURCE_INDEX.md`.
3. Read `docs/engine/PROMPT.md` and follow its startup/state-manager rules.
4. Restore state through `.claude/agents/state-manager.md`; do not bypass the engine's delegated
   file-operation contract.

Core locations:

- Engine: `docs/engine/PROMPT.md`
- State: `data/state/game_state.json`
- Stats: `data/state/stats/{SUBJECT}_stats.json` and `data/state/stats/meta_stats.json`
- Session buffer: `data/state/session_cache.json`
- Graphs: `data/graphs/{SUBJECT}.json`
- History: `data/history/question_history.json`
- Flags: `data/history/flagged_questions.json`

The existing state-manager/token-optimization contract remains governed by `docs/engine/PROMPT.md` and
`.claude/agents/state-manager.md`.
