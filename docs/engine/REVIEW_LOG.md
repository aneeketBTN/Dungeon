# EXAM PREP ROGUELIKE — REVIEW LOG

---

## v1.10 — Graph read delegation fix
**Implemented by:** Claude Sonnet 4.6
**Date:** 2026-06-04
**Version bump:** 1.9 → 1.10

Graph files (`data/graphs/{subject}.json`) are never delegated to state-manager.

**Rule added to `docs/engine/PROMPT.md` FILE OPERATION RULES section:**
`data/graphs/{subject}.json` is loaded once at session startup into main session context and stays there for the entire session. The main session retrieves nodes from its own context only. state-manager never receives any instruction containing a graph file path. If the main session needs a node, it looks it up from the graph already in its context window — it never asks state-manager to read a graph file.

**Rule added to `state-manager.md` ERROR HANDLING table:**
Graph file path in instruction → return `ERR_UNKNOWN_OP` immediately. Do not read the file.

**Why:** During gameplay the main session already holds the full graph in its context window. Delegating node lookups to state-manager would (a) add a round-trip subagent call for every question, burning tokens unnecessarily, and (b) risk state-manager misinterpreting a graph-path instruction as an OP_READ_STATE or similar, producing corrupt state. The guard in ERROR HANDLING makes any accidental delegation fail loudly rather than silently.

---

## v1.9 — State Manager Optimisation
**Implemented by:** Claude Sonnet 4.6
**Date:** 2026-06-04
**Version bump:** 1.8 → 1.9

### Five-Operation Vocabulary

Replaces the seven natural-language operations from v1.8 with a strict five-operation
vocabulary. State-manager accepts ONLY these strings — anything else returns `ERR_UNKNOWN_OP`.

| Operation | Input | Output |
|---|---|---|
| `OP_READ_STATE` | `"OP_READ_STATE"` | Full game_state.json JSON (only op that returns full file) |
| `OP_WRITE_STATE` | `"OP_WRITE_STATE {field: value, ...}"` | `"WROTE: field=value, ..."` (diff only, never full file) |
| `OP_APPEND_CACHE` | `"OP_APPEND_CACHE {type: TYPE, data: {...}}"` | `"CACHED: TYPE node_id"` |
| `OP_FLUSH_LEVEL` | `"OP_FLUSH_LEVEL {subject: SUBJECT}"` | `"FLUSHED: N node updates, M flags, K history"` |
| `OP_FLUSH_SESSION` | `"OP_FLUSH_SESSION {subject: SUBJECT, session_summary: {...}}"` | `"SESSION_SAVED: subject=S, sessions=N, accuracy=X%"` |

OP_APPEND_CACHE accepts three data types: `node_update`, `flag`, `history`.

**Why:** The previous vocabulary used natural-language method names that required
Haiku to parse intent. Structured op strings eliminate parsing overhead (~30 tokens/call
saved) and make failures unambiguous (wrong op → single error code, not a hallucinated response).

---

### Hot/Cold node_memory Split

`node_memory` split into two layers in all `{SUBJECT}_stats.json` files.

**`node_memory_hot`** — written by `OP_FLUSH_LEVEL` during gameplay:
- `box`, `attempts`, `correct`, `last_seen_turn`, `last_result`, `awaiting_confirmation`, `flag_count`

**`node_memory_cold`** — written by `OP_FLUSH_SESSION` at session end only:
- `first_encountered_correct`, `first_encounter_session`, `stuck_node`,
  `consecutive_correct`, `cross_subject_confirmed`

State-manager's `OP_FLUSH_LEVEL` NEVER touches `node_memory_cold`.

**Migration applied:** `BEHECON_stats.json` migrated from flat `node_memory` to hot/cold split.
`MACRO_stats.json` migrated (was empty, trivial). Any future stats file created from
lazy-init will use the hot/cold schema by default.

**Why:** The hot layer is the only part that changes during gameplay. Cold fields are
longer-term history that only update at session end. Splitting them means OP_FLUSH_LEVEL
reads and writes a smaller object (~40 tokens saved per level flush). It also makes the
contract clearer: the hot layer is the scheduling memory; the cold layer is the learning history.

---

### Async Level Flush

`OP_FLUSH_LEVEL` is now fired async — the engine does NOT wait for its confirmation
before serving the next level's first question.

**Exception:** `OP_FLUSH_SESSION` (session end) is always synchronous. The engine waits
for confirmation before closing. This ensures no data loss on session end.

**Why:** Level-end flushes are a batch write of accumulated mid-level data. There is no
game-state dependency on their completion — the next question's node_memory decisions
rely on the in-memory state, which is already updated at answer-evaluation time.
Blocking the next question on a file write added ~1–2 seconds of felt latency with no
correctness benefit. Session-end flushes are synchronous because losing a full session's
worth of stats and rank updates would be a meaningful regression.

---

### Diff-Only Returns

`OP_WRITE_STATE` now returns only the changed fields (`"WROTE: field=value, ..."`),
never the full `game_state.json`. All other write operations return single-line
confirmation strings.

**Why:** In v1.8, write operations echoed the full updated file back to the main
session. `game_state.json` is small, but echoing it on every per-question write added
~80 tokens per exchange. Diff-only returns eliminate this. The main session already holds
current state in memory; it does not need the echo to reconcile.

---

### Expected Token Reduction

| After | Per-question tokens | Change |
|---|---|---|
| v1.8 (basic state-manager) | ~350–450 | baseline |
| Diff-only returns | ~270–370 | −80 tokens/write |
| Strict op vocabulary | ~240–340 | −30 tokens/call |
| Hot/cold split | ~200–300 | −40 tokens/flush |
| Async flush | latency saving | (not tokens) |
| **All combined** | **<250** | **~40% reduction from v1.8** |

---

### Migration Steps Applied

1. `.claude/agents/state-manager.md` — replaced with five-operation vocabulary (Step 1)
2. `data/state/stats/BEHECON_stats.json` — flat `node_memory` migrated to `node_memory_hot` + `node_memory_cold` (Step 2)
3. `data/state/stats/MACRO_stats.json` — empty `node_memory: {}` replaced with `node_memory_hot: {}` + `node_memory_cold: {}` (Step 2)
4. `docs/engine/PROMPT.md` Section 2 — startup sequence updated to use OP_READ_STATE and reference node_memory_hot/cold layers (Step 2)
5. `docs/engine/PROMPT.md` Section 7 — FILE OPERATION DELEGATION replaced with FILE OPERATION RULES (five ops) + ASYNC LEVEL FLUSH block (Steps 3 & 4)
6. `docs/engine/PROMPT.md` Section 13 — `node_memory` schema replaced with `node_memory_hot` + `node_memory_cold` schemas; v1.9 annotation added (Step 2)
7. `docs/engine/PROMPT.md` version header — bumped 1.8 → 1.9

---

## v1.8 — Token Optimisation
**Implemented by:** Claude Sonnet 4.6
**Date:** 2026-06-04
**Version bump:** 1.7 → 1.8

### Fix 1: Batch Write Schedule

**What changed:**
Section 16 (Context Management) previously required writing state to disk after every
question exchange. Replaced with a three-tier write schedule:

- **Per-question:** `game_state.json` only — 4 fields (`current_node`, `turn_counter`,
  `hp`, `question_index`). Nothing else.
- **Per-level:** flush `session_cache.json` to subject stats + history files at level end.
- **Per-session:** full persona update, rank recalculation, meta_stats cross-subject sync.

**Why:** Every full stats.json write at question time was the single largest contributor
to per-question token cost. The stats file for an active subject with node_memory can be
10–20 KB. Writing it on every answer was unnecessary — only game progress fields need
immediate persistence for crash recovery.

**Edge cases:** If the session dies mid-level, pending node_memory updates in
session_cache are lost. Loss is at most one level's worth of node box changes — acceptable
trade-off given the context savings. game_state.json (level, HP, turn_counter) is still
written per-question, so level progress is never lost.

---

### Fix 2: Three-File Stats Split

**What changed:**
Replaced the single `data/state/stats.json` with three files:

| File | Written | Contains |
|---|---|---|
| `data/state/game_state.json` | Per-question (4 fields only) | Level, HP, node, turn, session metadata |
| `data/state/session_cache.json` | Per-question (append) | Mid-level accumulator; cleared at level end |
| `data/state/stats/{SUBJECT}_stats.json` | Per-session | node_memory, student_profile, rank, transfer_stats, failure_log, session_history |
| `data/state/stats/meta_stats.json` | Per-session | cross_subject_weak_concepts, total_sessions, cross_subject_confirmed |

**Migration:** Existing `data/state/stats.json` retained on disk for backup. BEHECON and MACRO
data extracted to `data/state/stats/BEHECON_stats.json` and `data/state/stats/MACRO_stats.json`.
Cross-subject data moved to `data/state/stats/meta_stats.json`.

**game_state.json field changes:** Removed `mastered_nodes` and `failed_nodes` arrays.
These were maintained redundantly — the authoritative record is `node_memory` in the
subject stats file. The SAVE_STATE export (Section 12) rebuilds these from node_memory
at export time.

**Why:** The stats.json file grows with every node attempted across all subjects. Loading
the full file at startup to get a single subject's node_memory loaded all inactive subject
data too. Split eliminates this: only the active subject file is ever loaded.

---

### Fix 3: state-manager Haiku Subagent

**Config location:** `.claude/agents/state-manager.md`
**Model:** `claude-haiku-4-5`
**Tool access:** Read, Write, Bash

**What it handles:**
- `read_state` — read game_state.json
- `write_state(updates)` — merge updates into game_state.json
- `read_subject_stats(subject)` — read stats/{subject}_stats.json
- `write_subject_stats(subject, data)` — write stats/{subject}_stats.json
- `flush_session_cache()` — merge session_cache into subject stats, clear cache
- `read_graph(subject)` — read data/graphs/{subject}.json
- `append_session_cache(update_type, data)` — accumulate mid-level changes

**What the main session no longer does:**
- Reads any JSON file directly
- Writes any JSON file directly
- Holds inactive subject data in context

**Delegation rules added to:** Section 2 (Startup Sequence), Section 7 (Core Game Rules,
new FILE OPERATION DELEGATION block).

**Why:** Haiku runs at a fraction of Sonnet's per-token cost. Shunting all file I/O to
Haiku means the main Sonnet session context is only loaded with what's needed for
question generation and evaluation. The subagent handles the mechanical read/write loop;
the main session handles cognition.

---

### Fix 4: node_memory Cap to Active Subject

**What changed:**
Added NODE_MEMORY LOADING RULE to Section 2 (Startup Sequence):

- Only `node_memory` for the active subject is loaded into the main session context.
- Inactive subjects' node_memory stays in their `stats/{SUBJECT}_stats.json` on disk.
- On `[SET SUBJECT: X]`: flush current session_cache → write current subject stats →
  clear old node_memory from context → load new subject's node_memory + graph via
  state-manager.

**Why:** node_memory is the largest in-context data structure per subject. A full
semester with 5 subjects, each with 60–100 nodes, would load ~500 node records if all
subjects were in context simultaneously. The cap ensures this never exceeds ~100 records
(one subject) regardless of how many subjects have been played.

**Impact as subject count grows:** This fix compounds with Fix 2 (subject isolation) and
Fix 3 (Haiku handles the load). As Aneeket adds subjects, the per-question cost stays
flat rather than growing linearly.

---

### Expected Token Reduction

| After | Per-question tokens | Change |
|---|---|---|
| Before all fixes | ~2,000 | baseline |
| Fix 1 (batch writes) | ~900 | −55% |
| Fix 2 (split files) | ~600 | −33% from Fix 1 |
| Fix 3 (Haiku subagent) | ~350–450 | −30% from Fix 2 |
| Fix 4 (cap node_memory) | ~300–400 | additional reduction as subjects grow |
| **All four combined** | **<400** | **−80% from baseline** |

---

### Files Changed
- `docs/engine/PROMPT.md`: version 1.7 → 1.8; Section 2 startup sequence; Section 3 file map;
  Section 7 delegation block; Section 13 schemas; Section 16 write schedule
- `CLAUDE.md`: file locations + TOKEN OPTIMISATION block
- `data/state/game_state.json`: removed `mastered_nodes`, `failed_nodes`
- `.claude/agents/state-manager.md`: created (Haiku subagent)
- `data/state/stats/BEHECON_stats.json`: created (migrated from stats.json)
- `data/state/stats/MACRO_stats.json`: created (migrated from stats.json)
- `data/state/stats/meta_stats.json`: created (cross-subject data)
- `data/state/session_cache.json`: created (empty template)
- `docs/engine/REVIEW_LOG.md`: created (this file)
- `data/state/stats.json`: retained on disk as backup; no longer loaded by engine

---

## v1.7 — Export System
*(See docs/engine/PROMPT.md Section 0 review log for v1.1–v1.7 change history.)*
