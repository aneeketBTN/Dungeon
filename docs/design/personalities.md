[# OPUS 4.8 ENGINEERING REVIEW LOG

**Design conversation:**
https://claude.ai/chat/7d8f31db-7d6a-4da1-bd9d-4fa1a9e121e3
**Student:** Aneeket Das | IIM Bangalore BBA DBE Term 5
**Original Architect:** Claude Sonnet 4.6
**Reviewing Engineer:** Claude Opus 4.8
**Review date:** 2026-06-02
**docs/engine/PROMPT.md version:** 1.0 → **1.1**

---

## Status: ✅ APPROVED FOR USE

Engine reviewed, amended, and signed off. Directory structure built. First
graph (BEHECON) ready to extract.

---

## Addendum — v1.1.1 (2026-06-02, requested by student mid-session)

**Change:** Added an **Anki-style weak-node prioritisation rule** to docs/engine/PROMPT.md
§7 *Question Generation — Universal Rules* (new rule 2; subsequent rules
renumbered 3–7).

**Behaviour:** Before selecting the next node the engine now reads
`stats.json → subjects[ACTIVE].weak_nodes` and `game_state.failed_nodes`, and
prioritises **due failed/weak nodes over unvisited nodes**, re-testing them from
a fresh angle. A node graduates out of `weak_nodes` only after **two consecutive
correct answers**; any miss re-adds it and resets the streak — i.e. a spaced-
repetition review queue layered on top of the existing graph-neighbourhood walk.

**Why:** Concentrates scarce session time on concepts the student has actually
gotten wrong (the highest-yield review target before an exam), rather than
spreading evenly across new material. Selection priority is now:
(a) due weak/failed → (b) unvisited neighbour → (c) mastered (boss combination only).

**Files touched:** `docs/engine/PROMPT.md` (header → v1.1.1; §7 rules). No schema change —
`weak_nodes` and `failed_nodes` already existed in stats.json / game_state.json.

---

## Addendum — v1.2 "Reinforcement Layer" (2026-06-02, requested by student)

A full FSRS-lite weakness-targeting subsystem. New **Section 7.5** in docs/engine/PROMPT.md;
schema extensions to game_state.json and stats.json; honest-difficulty hard limits
in Section 18. The v1.1.1 simple rule is now subsumed by (and defers to) §7.5.

**Schema additions**
- `game_state.json`: global `turn_counter` (int, +1 per question SERVED).
- `stats.json → subjects[X].node_memory{node_id}`:
  `{box(0-4), attempts, correct, consecutive_correct, last_seen_turn,
  last_result, awaiting_confirmation}`. `weak_nodes` (box<3) and `strong_nodes`
  (box==4) become DERIVED VIEWS of node_memory, not independent lists.

**Box / spacing table** (turns since last_seen before "due"):
box0 = immediate · box1 ≥3 · box2 ≥8 · box3 ≥20 (≈next session) · box4 = graduated.
Correct → box+1 (cap 4), streak+1, clear awaiting_confirmation.
Wrong → box=0, streak=0, awaiting_confirmation=true.
*(Basis: Leitner boxes + the spacing effect.)*

**Layer 1 — silent resurfacing.** Default = neighbourhood walk; override only when a
DUE weak node sits within 2 graph hops (pick lowest box). No announcement, no format
change. Hard floor: never the same node twice in a row (min gap 2 questions) — the
"low-interval-hell" guard. *(Basis: spacing/interleaving > massing.)*

**Hypercorrection.** A miss on a box≥2 node is flagged in-line ("You had this one…"),
sets awaiting_confirmation, and schedules a confirmation retest 2-3 questions later;
cleared on a correct retest. *(Basis: the hypercorrection effect.)*

**Layer 2 — pre-level weak signal.** One forward-looking, path-framed line before
Q1 of a level IF a due weak node is in the path; otherwise silent. Never a cumulative
failure scoreboard. *(Basis: growth-framed feedback protects motivation.)*

**Boss rule.** May combine one weak (box ≥1 only — never box-0) + one strong node;
combination announced up front. No ambushing a freshly-failed concept.

**Graduation / demotion.** box4 → stop active scheduling (spot-check only). A miss on
a box-4 node demotes it to box0 + confirmation retest. *(Efficiency frontier:
don't over-drill mastery.)*

**Honest-difficulty hard limits (Section 18, non-negotiable).** The engine never
lowers difficulty to rescue HP / prevent a reset; never elevates or softens a
resurfaced weak node (always current difficulty); never builds a boss on a box-0
node. The layer changes WHAT/WHEN, never HOW HARD. *(Basis: desirable difficulties —
the reinforcement scheduling must not be compounded with hidden hardness changes.)*

**Files touched:** `docs/engine/PROMPT.md` (header → v1.2; new §7.5; §7 rule 2 now defers to
§7.5; §13 game_state + stats schemas; §18 hard limits). Live state migrated to
node_memory (see game_state.json / stats.json).

---

## 0. Build-time discovery (before any code review)

On-disk reality did not match the spec, and one subject was mislabelled:

- The files were scattered at the project root, not in the
  `source/{mega,modules,cla}` + `graphs` + `history` + `state` layout that
  Section 3 of docs/engine/PROMPT.md assumes.
- Four of five source folders mapped cleanly to subjects:
  `BE Merge`→BEHECON, `POME_Compressed`→MACRO, `NABM_Compressed`→NABM,
  `GER_Compressed`→GER (all verified by content + matching CLA docx).
- The fifth folder, **`DDT Merge` (Digital Design Tools — a qualitative design
  course)**, did NOT match docs/engine/PROMPT.md's "NPD / New Product Development" profile
  (PIC → funnel → stage gates, ATAR/QFD). Raised with the student → it was a
  **wrong upload**. The student supplied the correct `NPD_Compressed` folder,
  whose contents (Product Innovation Charter, Product Funnel, Stage Gates,
  Product Development Metrics) match the NPD profile exactly.

**Resolution:**
- Reorganised everything into the Section-3 layout.
- Folded the real NPD content into `source/modules/NPD/` + `source/mega/NPD_mega.txt`.
- Moved the stray `DDT Merge` folder to `_unused_uploads/` (recoverable, unused).
- Normalised the CLA filename `clas biz models.docx` → `clas_biz_models.docx`.

Final inventory: BEHECON (4 modules / 85 ch), MACRO (4/79), NABM (8/145),
GER (8/130), NPD (8/175). CLAs present for all but NPD (correct — NPD has none).

---

## 1. Design Decisions Interrogated (the 7 Sonnet flagged)

### 1.1 Graph Node Schema — *was it rich enough?*  → **No. Fixed.**
`concept + formula + variables + example_from_source + failure_mode` is not
enough to write a correct *answer explanation* without re-opening source, which
is the whole anti-hallucination premise. **Added** `teaching_note` (self-
contained reasoning), `distractors` (wrong-answer + the misconception it
encodes), `sample_question` (style anchor), `source_ref` (traceability). These
are the cold-start quality levers.

### 1.2 BehEcon question generation — *enough scaffolding?* → **No. Fixed.**
The β/δ/agent_type requirement existed but the *method* for Naive vs
Sophisticated was undefined — the exact thing that makes those two look
identical. **Added** an explicit quasi-hyperbolic scaffold and a construction
rule: hold β, δ, payoffs identical across a Naive/Sophisticated pair so the only
difference is the belief about the future self; solve via backward induction for
Sophisticated and verify the keyed answer before presenting.

### 1.3 GER cap-table validation — *specific enough?* → **No. Fixed.**
"Validate all numbers internally" was a slogan. **Added** a concrete 7-point
checklist (round identity, ownership = investment/post-money, Σ% = 100%,
consistent price-per-share, primary-round dilution invariants, cascade
reconciliation, down-round price check) plus a rule to build distractors from
*named* mistakes rather than random numbers.

### 1.4 Macro written rubric — *meaningful for 10M?* → **Partly. Upgraded.**
3 criteria → **5-component partial-credit rubric**: causal direction (dominant —
a reversed arrow caps the score), variable identification, transmission
mechanism (the "why", not just the endpoint), timeframe correctness, and
sufficiency by mark value. Case items must also be grounded in the given case.

### 1.5 Context management for long sessions — *sufficient?* → **Hardened.**
**Added** "disk is the source of truth" (re-read state after `/compact` or any
doubt), a concrete `[COMPACT SUGGESTED]` cadence (~20 Qs or ~50% window or
format drift), and an explicit ban on loading the CLA docx during play.

### 1.6 Flag system feedback loop — *3 flags right?* → **Kept, with rationale.**
Threshold of 3 is sound (1 = fluke, 2 = coincidence, 3 = real signal). **Added**
`angle_tried` logging so re-rolls don't recycle the same framing, and split the
two review states (see §2).

### 1.7 Cold start quality → **Improved via §1.1 + extraction changes.**
Populating `teaching_note`/`distractors`/`sample_question` *at extraction* is
what makes session-1 usable instead of rough.

---

## 2. Bugs / inconsistencies fixed

| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | Sec 2 | "run NEW GAME SETUP (Section 8)" — Sec 8 is Response Format | Corrected to **Section 14** |
| 2 | Sec 2 / Sec 16 | Startup loaded `{SUBJECT}_cla.json` every session — wrong filetype (docx), bloats context, contradicts Sec 16 | Removed; style distilled into graph `header.style_profile` at extraction |
| 3 | Sec 5 vs Sec 10 | `needs_manual_review` vs `needs_review` used interchangeably | Made **distinct states**: extraction-time vs flag-threshold; both documented |
| 4 | Sec 13 | `stats.json` subjects ambiguous (present-but-null) | Defined **lazy init**: `null` = never played; populate on first play |
| 5 | Sec 5 | Graph was an implicit bare array | Defined explicit `{ header, nodes }` file with `exam_format`, `style_profile`, `confirmed_by_student` |
| 6 | Sec 6 | CLA path was `{SUBJECT}_cla.json` (doesn't exist) | Added real **CLA filename map** (docx) |
| 7 | Sec 12 | No save-load edge handling | Added missing-graph / stale-id / out-of-range / malformed handling, disk fallback |

---

## 3. Issues deferred to V2

- **GER OCR:** image-embedded CLA tables can't be auto-read; affected nodes get
  `needs_manual_review` and need a human pass. A real OCR pre-step is V2.
- **Macro web-like graph:** multi-edge concept web extracts messier than
  tree-like subjects. Allowed for V1; a curated per-node review would lift
  quality (V2).
- **Sandboxed calculator:** GER/BehEcon validation is currently the engine's own
  disciplined re-solve. A real arithmetic tool would harden it (V2).
- **Sub-agents / frontend:** out of scope for V1 (single in-chat session).

---

## 4. Sign-Off Checklist

- [x] Graph extraction logic — reviewed & amended
- [x] Graph node schema — reviewed & amended (5 new fields)
- [x] Question generation constraints (all 5 subjects) — reviewed & amended
- [x] Math validation rules (GER, BehEcon) — reviewed & amended
- [x] Written response rubrics (Macro) — reviewed & amended
- [x] Context management rules — reviewed & amended
- [x] Save/load edge cases — reviewed & amended
- [x] Flag system feedback loop — reviewed & amended
- [x] Cross-subject shared nodes — reviewed (Sec 15 sound; no change)
- [x] README.md consistency with docs/engine/PROMPT.md — confirmed (README sign-off updated)
- [x] Version number updated in docs/engine/PROMPT.md — confirmed (1.0 → 1.1)

**Engine status:** APPROVED FOR USE

---

---

## Graph Build Status (updated 2026-06-02)

Per the student's directive — **full verbatim extraction, no skimming, no
confirm-gates (engineer auto-confirms), done once and precisely.**

| Subject | Graph | Nodes | Source read | Status |
|---|---|---|---|---|
| BEHECON | `data/graphs/BEHECON.json` | 58 | M1–M4 verbatim | ✅ confirmed; in play (paused L1 Q3) |
| MACRO | `data/graphs/MACRO.json` | 63 | M1–M4 verbatim (incl. C25-31, M3, M4) | ✅ confirmed; fully verbatim, 0 outline nodes |
| NABM | `data/graphs/NABM.json` | — | — | ⬜ pending (8 mod / 145 ch, ~477K) |
| NPD | `data/graphs/NPD.json` | — | — | ⬜ pending (8 mod / 175 ch, ~786K) |
| GER | `data/graphs/GER.json` | — | — | ⬜ pending (8 mod / 130 ch, ~1.2M) |

**Method for remaining subjects (NABM, NPD, GER):** each is its own intensive
verbatim read+build and must be done in a FRESH context (new session or after
`/compact`) to keep quality high — they cannot all fit one context window.
Procedure per subject: read every module merged file verbatim → build the graph
via a Python builder (guaranteed-valid JSON) with the subject's required
context tag on every node (NABM `business_model_type`, NPD `stage_in_funnel`,
GER `startup_stage` + cap-table validation) → validate (no dup ids, no dangling
edges, every node tagged) → lazy-init the stats entry → set
`header.confirmed_by_student=true` (autonomous) → next subject.
MACRO was built and then upgraded module-by-module with incremental disk
persistence (M2 tail, M3 core, M3 tail, M4) — use that same safe pattern.

---

*This file is the engineering record for this project.
Keep it updated if you make further changes in later sessions.*
](TASK: Implement the Persona System as Section 17 in docs/engine/PROMPT.md.
Extend stats.json. Update [SHOW PROFILE] command output.
Version bump to 1.4. Document in docs/engine/REVIEW_LOG.md.

═══ EIGHT PERSONAS — DETECTION TRIGGERS ═══

Minimum data requirement before persona assignment:
  ≥ 10 nodes attempted AND ≥ 3 sessions completed.
  Before this threshold: student_profile.persona = "calibrating"
  [SHOW PROFILE] output reads: "Still calibrating —
  [X] more nodes needed for a reliable profile."

SPRINTER
  Triggers (ALL): first_encountered_correct > 60% AND
  forgetting_curve_nodes > 3 AND sessions > 3
  Engine adaptation: multiply box spacing gaps by 1.5x.
  Confirmation retests pushed to gap 5 instead of 2-3.

PHOENIX
  Triggers (ALL): first_encountered_correct < 40% AND
  (nodes reaching box 2 within same session as failure / 
  total failed nodes) > 50%
  Engine adaptation: no additional scaffolding. In BREAKDOWN,
  skip CONNECT step and extend BUILD to 4-5 sentences.

SPECIALIST
  Triggers (ALL): transfer_gaps count ≥ 3 AND standard 
  accuracy on those same nodes ≥ 70%
  Engine adaptation: Transfer Probes fire every 3 questions
  for transfer_gap nodes (not every 5). Boss levels default
  to Structural Bridge variant.

ARCHIPELAGO
  Triggers (ALL): cluster_weaknesses count ≥ 2 AND
  average box of non-weak-cluster nodes ≥ 3
  Engine adaptation: new session routes start at the root
  prerequisite node of the weakest cluster, not the most
  recently failed node.

GLACIER
  Triggers (ALL): first_encountered_correct < 35% AND
  forgetting_curve regression events < 10% of box-3+ nodes AND
  sessions ≥ 5
  Engine adaptation: max 2 questions per node per session.
  Prioritise breadth (new nodes) over depth (drilling same node).

MIRAGE
  Triggers (ALL): within-session accuracy > 75% AND
  forgetting_curve_nodes > 4 AND
  box-4 regression rate > 30%
  Engine adaptation: after detection, surface once:
  "Your in-session numbers are strong. Your cross-session
  numbers suggest spacing is the missing piece."
  Prioritise nodes approaching forgetting threshold.

CARTOGRAPHER
  Triggers (ALL): transfer_gaps < 2 AND
  structural_bridge_accuracy > 65% AND
  cross_subject_confirmed ≥ 3
  Engine adaptation: increase detail-recall question frequency.
  Boss levels include ≥1 precision-recall question alongside
  synthesis question.

ARCHITECT
  Triggers (ALL): HP loss rate < 15% AND
  reset count < 1 per 5 sessions AND
  difficulty has never exceeded 2 across ≥ 5 sessions
  Engine adaptation: after detection, surface once:
  "The walls are solid. Time to stress-test them."
  Auto-suggest difficulty 3 for next level.
  Student can override — they are always admin.

═══ PERSONA PRECEDENCE RULES ═══

If multiple personas trigger simultaneously:
  - Primary persona = whichever has the most data points
    confirming it (most signals, not just threshold met)
  - Secondary trait = second strongest signal
  - Never assign more than one primary + one secondary
  - Reassess every 3 sessions. Personas can shift.

═══ STATS.JSON ADDITIONS ═══

Add to student_profile per subject:
  "persona": "calibrating",
  "persona_confidence": 0,
  "persona_last_assessed": null,
  "secondary_trait": null,
  "within_session_accuracy_history": [],
  "cross_session_accuracy_history": [],
  "structural_bridge_accuracy": null,
  "hp_loss_rate": null,
  "difficulty_ceiling_used": 2

═══ [SHOW PROFILE] COMMAND UPDATE ═══

Replace current [SHOW PROFILE] output with the full
stats page format defined in the design spec above.
Plain English throughout. No raw JSON in output.
The "NOTE: built from observed behaviour, not self-report"
line is mandatory — always appears at the bottom.

═══ DOCUMENTATION ═══

docs/engine/REVIEW_LOG.md entry:
- All 8 personas: name, trigger conditions, engine adaptation
- Minimum data threshold before assignment
- Precedence rules for multi-persona triggers
- Reassessment cadence (every 3 sessions)
- Distinction between behavioural observation and self-report
  (VARK criticism — personas emerge from data, not labels)
- New stats.json fields

Version bump to 1.4.)
