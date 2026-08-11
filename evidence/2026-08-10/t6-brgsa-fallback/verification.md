# T6 BRGSA Revision Fallback — Verification

Date: 2026-08-10

Status transition: `DIAGNOSED → IMPLEMENTED → VERIFIED(this evidence)` for the BRGSA ten-run
revision route. The broader T6 fallback is not `DONE`: IBM, SCLM, and SPMS remain unstarted, and no
owner-supplied course-specific final-paper blueprint has been audited.

## Goal

Replace the old product-first critical path with a zero-friction exam-season route that lets a
learner start cold, take a mock immediately, progress through ten cumulative runs, and turn wrong
answers into connected repairs.

## Build

- `briefs/T6_REVISION_FALLBACK.md`
- `mock/t6.html`
- `mock/t6.css`
- `mock/t6.js`
- `mock/sets/t6_brgsa.js`
- `mock/server.py` default route

## Source and content checks

Source pack:
`C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack`

- Pack audit observed: 283 lectures, 283 lossless graph chunks, 32 dense modules, four subject
  cores, zero traceability failures.
- BRGSA bank observed: 10 runs, 60 unique scheduled questions, no duplicated scheduled question,
  no missing question object, and no invalid answer/explanation/link/repair route.
- 44 unique cited BRGSA lecture IDs were checked against `graph/LECTURE_MANIFEST.jsonl`; all 44
  resolved.
- Assessment boundary checked against the public IIMB BBA(DBE) policy on 2026-08-10: the official
  public source permits MCQs, caselets, or subjective assessments but does not establish an exact
  T6 course-specific paper blueprint. The UI labels the alpha a pattern-family simulation.

## Secondary technical checks

- `node --check mock/t6.js` — passed.
- `node --check mock/sets/t6_brgsa.js` — passed.
- `python -m py_compile mock/server.py` — passed.
- HTTP 200 observed for `/`, `/mock/t6.html`, question and chain-break scenario URLs, and the BRGSA
  bank on local port 8099.
- Browser console errors after representative flows: none.

## Primary real-Browser acceptance

Environment: Codex in-app Browser, local server at `http://127.0.0.1:8099`, pointer plus keyboard.

Viewports:

- desktop: 1440 × 900;
- narrow: 390 × 844.

Observed passes:

1. Fresh landing exposes **Start Run 1** and **Take the cold mock** without setup, character,
   currency, market, or loadout steps.
2. Only BRGSA is selectable; IBM, SCLM, and SPMS visibly explain that their question banks are not
   authored.
3. The cold mock opens directly from the first viewport and contains 12 mixed questions.
4. Pointer answer selection enables commit; number keys 1–4 select an answer and Enter commits.
5. A wrong answer removes one Resolve, shows the correct route and causal link, schedules a
   different-surface repair, and expands the visible question count truthfully.
6. A correct repair closes its queued state.
7. Two misses produce the chain-break dialog with both lecture IDs/concepts and one joined causal
   synthesis; continuing resets Resolve and preserves answered work.
8. A five-question all-correct run produces 100%, five secure answers, zero misses, and updates the
   header to 1/10 on the results screen.
9. A miss followed by a successful repair reports **repair closed**, not **repair queued**.
10. A full 12/12 mock produces the exam-ready practice signal; its disclaimer says this is not a
    predicted IIMB score.
11. Save/leave/resume returns to the same first question; prototype reset clears only the local T6
    browser key and restores 0/10.
12. Desktop and narrow landing, question, feedback, chain-break, and readiness layouts remain
    readable with no missing interactive surface.

Primary artifacts:

- `desktop-landing.png`
- `desktop-question.png`
- `desktop-chain-break.png`
- `desktop-readiness.png`
- `narrow-landing.png`
- `narrow-chain-break.png`

## Persistence isolation

Before/after SHA-256, length, and UTC timestamp tuples were compared for all nine files under
`state/` and `history/` after Browser save/resume/reset testing. Result: `LIVE_DATA_UNCHANGED=true`.
The T6 prototype uses only `localStorage` key `dungeon.t6.brgsa.v1`; deterministic `?scenario=`
fixtures do not write it.

## Bugs found during Browser acceptance

- Results initially labeled a repaired miss as **repair queued**.
- The global completed-run count initially lagged on the results screen.

Both were corrected by deriving the destination UI after the same state mutation and rechecked in
Browser. The prevention rule is recorded in `BUG-LAWS.md` LAW-11.

## Remaining gates

- Exact paper structure remains `WAITING_OWNER_EXAM_PATTERN` until an owner-supplied T6 final paper
  or instruction sheet is indexed and audited.
- Subjective-answer practice is not implemented in this MCQ/caselet alpha.
- IBM, SCLM, and SPMS campaigns are `UNSTARTED`.
- BRGSA question correctness is grounded to supplied transcripts and traceable IDs; independent
  faculty/owner content acceptance has not occurred.
- Reduced-motion CSS is present; the acceptance Browser did not expose a media-preference override,
  so that preference path remains secondary source evidence.
