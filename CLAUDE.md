# Dungeon — Claude Compatibility Entry

The project's single living index is `AGENTS.md`. Read it top-to-bottom before doing any work,
then follow its required source order, ledgers, evidence gates, and open/close rituals.

Do not duplicate current status, Key Files, gaps, or operating rules here. `AGENTS.md` is the
source of truth so Codex and Claude-based sessions share one administration system.

## Learning-engine startup

For an explicitly requested in-chat engine session:

1. Read `AGENTS.md`.
2. Read `DESIGN_SOURCE_INDEX.md`.
3. Read `PROMPT.md` and follow its startup/state-manager rules.
4. Restore state through `.claude/agents/state-manager.md`; do not bypass the engine's delegated
   file-operation contract.

Core locations:

- Engine: `PROMPT.md`
- State: `state/game_state.json`
- Stats: `state/stats/{SUBJECT}_stats.json` and `state/stats/meta_stats.json`
- Session buffer: `state/session_cache.json`
- Graphs: `graphs/{SUBJECT}.json`
- History: `history/question_history.json`
- Flags: `history/flagged_questions.json`

The existing state-manager/token-optimization contract remains governed by `PROMPT.md` and
`.claude/agents/state-manager.md`.
