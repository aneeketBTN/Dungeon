# Project Operating System — Dungeon Adaptation

Status: DONE; verification evidence is in
`evidence/2026-07-16/admin-system-verification.md`.

## Owner brief

The project requires:

1. one cheap, always-loaded living index;
2. tiered living bug and quality ledgers;
3. an append-only session changelog;
4. formal evidence gates and status vocabulary;
5. mandatory open/close session rituals;
6. optional authority/exchange rules when multiple agents or tools participate.

The system exists so durable project awareness is not trapped in a conversation.

## Codex adaptation

The supplied template names `CLAUDE.md` as the automatically loaded file. Codex automatically
loads repository-level `AGENTS.md`, so Dungeon uses:

- `AGENTS.md` as the single living index and instruction source;
- `CLAUDE.md` as a compatibility entry for Claude-based workflows;
- linked ledgers and detailed briefs to keep `AGENTS.md` below Codex's normal instruction budget.

Do not duplicate the full status/index in both files; duplication would create two drifting
sources of truth.

## Implemented mapping

| Brief requirement | Dungeon implementation |
| --- | --- |
| Living index | `AGENTS.md` |
| Claude compatibility | `CLAUDE.md` |
| Bug-law ledger | `BUG-LAWS.md` |
| Quality ledger | `QUALITY-LOG.md` |
| Session history | `CHANGELOG.md` |
| Evidence gates | `AGENTS.md` and `evidence/README.md` |
| Open/close ritual | `AGENTS.md` Session Hygiene |
| Authority charter | `coordination/CHARTER.md` |
| Immutable exchange protocol | `coordination/exchange/README.md` |
| Design/brief authority | `DESIGN_SOURCE_INDEX.md` |

## Acceptance

The admin system is DONE only when:

- every required file exists;
- all internal references resolve;
- `CLAUDE.md` routes to `AGENTS.md`;
- the Current Status names active gates and prohibited claims;
- Key Files and Directory Map include the new system;
- the session is recorded in `CHANGELOG.md`;
- named verification evidence exists;
- future game implementation is explicitly subject to these rules.
