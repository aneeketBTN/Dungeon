# T6 all-subject dashboard verification

Date: 2026-08-10  
Status: `VERIFIED` for the implemented dashboard, course-bank structure, adaptive practice,
persistence, and declared Browser paths. Not `DONE`; see boundaries below.

## Acceptance sources

- Explicit owner direction: remove game/proprietary language; expose understandable progress;
  prioritise weak and developing concepts; use repetition, causal bridges, and new-perspective
  re-attempts; implement the remaining T6 subjects.
- Product contract: `briefs/T6_REVISION_FALLBACK.md`.
- Supplied sources: `C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack`.
- Primary interaction source: real in-app Browser against the local server.
- Secondary sources: syntax, catalogue invariants, cited-file existence, HTTP responses, and live
  state/history hashes.

## Content and source checks

The runtime catalogue was loaded exactly as the browser loads it: `t6_brgsa.js` followed by
`t6_catalog.js`.

| Subject | Sets | Concepts | Unique questions | Scheduled | Duplicate/omitted | Missing source files |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| BRGSA | 10 | 16 | 60 | 60 | 0 | 0 |
| IBM | 10 | 16 | 52 | 52 | 0 | 0 |
| SCLM | 10 | 16 | 52 | 52 | 0 | 0 |
| SPMS | 10 | 16 | 52 | 52 | 0 | 0 |
| **Total** | **40** | **64** | **216** | **216** | **0** | **0** |

All questions have four options, an in-range answer index, a tracked concept, explanation, causal
bridge, and perspective. All 92 distinct cited lecture IDs resolve to files under the supplied
`graph_source/` hierarchy. This is provenance and structural verification, not faculty acceptance
of transcript-derived claims.

## Technical checks

Passed:

- `node --check mock/t6.js`
- `node --check mock/sets/t6_catalog.js`
- `node --check mock/sets/t6_brgsa.js`
- `python -m py_compile mock/server.py`
- `/` returns `302` to `/mock/t6.html`
- `/mock/t6.html` returns `200`, loads the catalogue, and sends `Cache-Control: no-cache`
- Browser developer log after acceptance: no entries

The root redirect was introduced during this pass after Browser testing proved that internally
serving the file at `/` broke its relative `sets/` asset base.

## Real-Browser acceptance

Browser: in-app Chromium-compatible Browser against `http://127.0.0.1:8099/`.

### Dashboard and all subjects

- Desktop viewport: 1440 × 900; no horizontal overflow.
- Narrow viewport: 390 × 844; no horizontal overflow; the concept map collapses to one column.
- Dashboard fixture: 14 Strong, 18 Developing, 16 Needs practice, and 16 Not started across 64
  concepts. The best-next-step card prioritised the Needs practice concepts.
- Active UI scan found no student-facing `Dungeon`, `Resolve`, `chain break`, `chain breaker`, or
  `rogue-like` labels.
- Each subject card opened a 16-concept, ten-set subject dashboard:
  - Business Research, Growth Strategies and Analytics;
  - Inclusive Business Models;
  - Supply Chain and Logistics Management;
  - Software Product Management and Strategy.
- Every last set was labelled **Full practice mock**, **12 questions**, and **Available now**.
- Directly opening the SPMS mock showed `SPMS · Full practice mock`, question 1 of 12, four answer
  choices, and source `SPMS-M01-L10`.

### Adaptive learning path

A complete IBM study-set path was exercised in the Browser:

1. missed the recognition question for Inclusive business;
2. received `Not yet — this idea will return`, the correct distinction, and a causal bridge;
3. saw the concept change to Needs practice and the due re-attempt count increase;
4. continued through another concept before the missed idea returned;
5. received an application question rather than the original wording;
6. answered later perspectives correctly until two concepts became Strong;
7. completed with 75% initial accuracy, three correct first tries, one initial miss, three passed
   re-attempts, and two improved concepts;
8. returned to a dashboard showing 2 of 16 IBM concepts Strong and a new Module 2 recommendation.

The growing question total and status pill refresh immediately after re-attempt scheduling. A
separate SCLM wrong-answer fixture showed Needs practice, one due re-attempt, and a causal EOQ
bridge on both desktop and narrow layouts.

### Input, results, and persistence

- Number-key selection plus Enter committed an answer; Enter again advanced from question 1 to
  question 2 in the 12-question SPMS mock.
- Results fixture showed 75%, three correct first tries, one initial miss, zero fixture re-attempts,
  two improved concepts, and two concept-status cards.
- Normal IBM practice was advanced to question 2 of 4 with one re-attempt due. Opening and reloading
  the canonical URL restored the same subject, set, question number, and due count.
- Reloading after feedback restored the resolved answer and `Not yet — this idea will return`
  feedback, not an unanswered or dashboard state.
- Reset required its native confirmation dialog and returned the dashboard to 0 Strong, 0
  Developing, 0 Needs practice, and 64 Not started.

## Live-data isolation

SHA-256 hashes were captured for every file under `state/` and `history/` before the Browser
save/resume/reset path and compared afterward. All nine files were byte-identical:

- `history/flagged_questions.json`
- `history/question_history.json`
- `state/game_state.json`
- `state/session_cache.json`
- `state/stats.json`
- four files under `state/stats/`

Normal T6 progress remained confined to browser local storage; deterministic scenarios did not
save it.

## Visual evidence

- `desktop-dashboard.jpg` — finish-line hero, best next step, and all-subject overview
- `desktop-feedback.jpg` — SCLM miss, correct answer, Needs practice state, due re-attempt, and
  causal bridge
- `desktop-results.jpg` — result summary and concept-status changes
- `narrow-dashboard.jpg` — 390-pixel start path and recommendation
- `narrow-feedback.jpg` — 390-pixel question, answer states, and feedback entry

## Boundaries and open gates

- `WAITING_OWNER_EXAM_PATTERN`: no supplied T6 final paper or instruction sheet establishes exact
  sections, marks, duration, option rules, or negative marking.
- Grounded subjective-response practice is `UNSTARTED`.
- `WAITING_OWNER_CONTENT_ACCEPTANCE`: source traceability and Browser behavior are verified, but
  transcript-derived questions still need owner/faculty acceptance.
- No checked-in automated interaction suite covers every one of the 40 study sets.
- The dashboard is a practice-progress signal, not an exam-score prediction or a guarantee of
  passing.
