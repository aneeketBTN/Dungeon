# Systems Improvement Plan — cheap-first, in order

Written 2026-08-18. Audience: any future session, including smaller models. Read
`AGENTS.md` first — this brief does not repeat status, and where it disagrees with a
ledger, **the ledger wins** (LAW-72: a brief drifts; it is a to-do list, not a source of
truth). Each item says what to do, how to verify, and what not to do.

## Standing constraints (read before picking an item)

- **Budget is real.** The owner runs sessions on a few dollars of credit. Prefer one
  focused item per session over a sweep. Run gates once at the end, not repeatedly.
- **Never push or merge to `main`** — it deploys to a live cohort. Branch + PR, owner merges.
- Content gates need the external transcripts (not in the repo). With **no path argument
  the bank validator silently passes** — always pass the path (see AGENTS.md, Collaborators).
- Screenshots: `node tools/screenshot.mjs --port <port>`, never the Browser pane
  (`docs/governance/SCREENSHOTS.md`).
- **A test file and its runner entry are one change** (`LAW-77`). `npm test` names its test
  files in `package.json`; it does not discover them, so an unwired test is silence rather
  than a pass. `tests/test-runner-completeness.test.mjs` fails if you forget, but add both.
- The lesson–lecture match gate **is expected to FAIL naming `SPMS-M01-L01` and nothing
  else** (owner decision). Anything else in that output is a new finding.
- **Rejected fixes — do not retry:** stripping concept names from their own prose
  (destroys the sentences); appending universals to answers (creates a length cue);
  manufacturing absolutes or watering down distractors. See Known Gaps and CONTENT-RULES R3.

## Order of work

### 1. Trim the closed Known Gaps entries — doc-only, ~1 session
`AGENTS.md` is still over its 32 KiB budget after the 2026-08-18 story-block compression;
the remaining bulk is Known Gaps, where many closed `[x]` entries keep multi-paragraph
stories. For each `[x]` entry: confirm the story exists in
`docs/governance/CHANGELOG.md` (or move it there), then cut the entry to one or two lines
— outcome, date, pointer. Do not trim `[ ]` or `[~]` entries.
**Verify:** file size drops; no open entry lost; `git diff` reads as pure compression.

### 2. SPMS teaching backlog — 38 lectures, the main content work
Follow `docs/briefs/TEACHING_LAYER_AUTHORING_PLAN.md` and
`docs/authoring/LESSON-AUTHORING-PROTOCOL.md` exactly; trust their live queries over any
table. Known traps are recorded in `docs/briefs/MISFILED_LESSONS_WORK_ORDER.md` (corpus
re-scoring, handoff `connects` above every insertion point, ~one transcript-typo term per
module, house prose lengths).
**Verify:** the protocol's own gate list, run once at the end.

### 3. Build the per-lesson reading checklist, then the owner reads all 95
Everything authored after the 2026-08-18 approval is `WAITING_OWNER_CONTENT_ACCEPTANCE`
and no human has read it. **Owner decision 2026-08-19: every lesson gets read** — sampling
was offered and rejected — so a session's job here is the instrument, not the acceptance:
a resumable checklist, one row per lesson (id, title, lecture, state), rendered from
`app/sets/t6_lessons.js` rather than hand-maintained, and ordered by importance (item 4)
so a partial pass releases the most examinable material first.

### 4. Rank concept importance — the next real move, and everything is ordered by it
**All four owner decisions are answered and the plan is adopted** (2026-08-19,
`docs/briefs/DUNGEON_VISION_TO_BUILD.md` §6): scope is the entire course, every syllabus
idea becomes a concept at **8–14 surfaces** (the thin-tier proposal is rejected), and a
concept counts as finished only when it *links* — a `chain` position plus an authored
`linkedConceptIds` pairing.

That is ~2,000–4,000 new questions, so **importance is what makes it tractable: it does
not cut the scope, it orders it.** Build it before authoring anything, because it is used
three times — authoring order, the Phase 0 reading order, and Phase 4's mock rotation.

Derive a first cut from evidence, not taste: marks the paper allocates
(`docs/briefs/T6_EXAM_PATTERN.md`), lectures touching the idea, and inbound links. Then
hand the ranking to the owner for correction before ~3,000 questions are ordered by it.
**Triage first** with `node tools/check-taught-not-tested.mjs --triage` — a miss is as
often naming drift (an edit) as a genuine hole (a new item). The gate itself is done:
`npm run check:tested`, ratcheted, in `npm test`, binding via **R11**.

### 5. The two SCLM numericals — small, unblocked bank work
Safety stock / service level items. The lesson (`SCLM-M03-L06`) exists, the method is
confirmed taught, and the exact figures for both items are in the Known Gaps entry
("The last two SCLM numericals are unblocked"). Author per CONTENT-RULES; needs
transcripts for the vocabulary gate.
**Verify:** `npm run check:exam SCLM` reports Section B 6 of 6; bank validator 0 errors.

### 6. Two shipped MSQ gaps — small code, verified in a real browser
From Known Gaps ("MSQ format built and verified"): (a) the per-option diagnosis does not
surface in the wrong-answer panel for MSQ — likely `response.selected` is not carried for
this type; (b) `msqMarks` is computed but never rendered, so the learner never sees
"1 of 3 marks".
**Verify:** real-browser check per `docs/governance/UI-CHECKLIST.md`; evidence folder.

### 7. `button#brand-home` at 42px on desktop
Under the project's own 44px floor; `ui-audit.js` reports it on every screen. One line,
but it moves header geometry, so measure before/after (both viewports, both themes).

### 8. Wrong-answer panel repetition
161 diagnoses across four set-1 runs draw on 55 distinct cues; the `_explain` family's
`why` is a template. Improving this is content work with a measurement already in place —
re-run the measurement from the Known Gaps entry before and after.

### Parked (do not start without the owner)
- Hosted grader calibration (`tools/evaluate-hosted-grader.mjs`) — needs a Workers AI
  token and owner marking.
- `/coach` route reachability — cost decision (Neurons budget), owner call.
- `app/admin.css` theming — owner scoped it out.
- Making the repo public — deliberate audit, owner-led (see Known Gaps).

## Known limit with no cheap gate
A lesson written from *half* of its own lecture passes every gate
(`SPMS-M01-L07` was found only by reading). Do not claim gate coverage for this class;
the mitigation is the protocol's read-the-module-chain step.
