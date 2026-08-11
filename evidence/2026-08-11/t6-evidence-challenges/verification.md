# Term 6 evidence dashboard and challenge-bank verification

Date: 2026-08-11  
Status: `VERIFIED` for the staged dashboard, evidence model, confidence capture, mixed-format and
boss practice, active-bank rotation constraints, isolated persistence, and desktop/narrow Browser
paths described here. Exact final-paper structure remains `WAITING_OWNER_EXAM_PATTERN`.

## Scope accepted

- Overview, Concepts, and Study plan expose one layer at a time.
- The Concepts view graphs demonstrated understanding rather than attempt count. Needs practice
  contributes no upward credit, Developing partial credit, and Strong full credit; seeded misses
  produce an honest plateau. One two-concept module is visible at a time.
- A Strong label requires five attempts, four correct, three question types, two practice blocks,
  an unassisted whole-boss success, a latest correct answer, and no unresolved high-confidence or
  boss error. The inspector lists the evidence that passed or remains open.
- Every question requires Not sure, Fairly sure, or Very sure before checking. Correctness is not
  changed by confidence. A high-confidence error schedules a different-surface retest.
- Implemented learner formats are MCQ, cloze, case-cloze, four-way match, and three-step boss.
- A genuine case precedes the task as quiet body text; the task is the sole headline. Repeated
  pattern/count/status/concept/source metadata remains in DOM/data for maintainers but is hidden
  from learners. Matching instructions are not presented as cases.

## Bank and source validation

Commands:

```text
node --check mock/t6.js
node --check mock/sets/t6_challenges.js
node --check mock/validate_t6_bank.js
node mock/validate_t6_bank.js "C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack"
```

Result: all commands exited 0. The validator reported no errors or warnings.

| Course | Total tagged | Boss | Quarantined legacy MCQ | Active pool |
| --- | ---: | ---: | ---: | ---: |
| BRGSA | 172 | 40 | 37 | 135 |
| IBM | 164 | 40 | 40 | 124 |
| SCLM | 164 | 40 | 43 | 121 |
| SPMS | 164 | 40 | 43 | 121 |
| **Total** | **664** | **160** | **163** | **501** |

All 664 items cite lecture IDs present in the 283-entry supplied manifest. No quarantined
option-shape-risk item appears in any study-set or mock pool. Every concept has at least ten active
surfaces, four active formats, six active variant families, and boss coverage. Module pools contain
14–19 eligible questions; full-mock pools contain 121–135 and choose three least-recent boss IDs.

## Real Browser observations

Canonical route: `http://localhost:8099/mock/t6.html`  
Desktop in-app viewport: 928 CSS pixels wide; narrow viewport: 390 × 844.

- Concepts desktop: document width 913 at inner width 928; four evidence blocks; two concepts in
  the selected module; no horizontal overflow.
- Demand validation inspector: Strong was supported by 4/5 correct, four distinct passed formats,
  two practice blocks, an unassisted boss pass, and a correct retrieval after at least 20 hours.
- Concepts narrow: document width 375 at inner width 390; no horizontal overflow.
- Case-cloze desktop: case text 16 px and task heading 31.552 px. Pattern, repeated count, internal
  state, concept label, and source display were `none`; both select controls stayed within the card.
- Case-cloze narrow: case text 17 px and task heading 30 px; document width 375 at inner width 390;
  both controls were 313 px wide.
- Match: four labelled native select rows, no fake case block, no horizontal overflow.
- MCQ: ArrowDown moved the checked response from A to B. Check answer stayed disabled after a
  response and became enabled only after Fairly sure was selected.
- Boss: three dependent select steps. Submitting steps 1 and 3 correct, step 2 wrong, and Very sure
  produced “2 of 3 reasoning parts correct,” internal state `Needs practice`, a complete answer
  key, and a different-surface retest. Partial work did not satisfy the boss gate.
- Persistence: an unfinished cloze response and Not sure confidence were saved on the isolated
  `127.0.0.1:8099` browser origin. Reload restored the active 1-of-8 session, selected response,
  checked confidence, and enabled Check answer. The learner's normal localhost profile was not
  cleared or repurposed.
- Browser developer logs were empty after the final question and dashboard passes.

## Visual artifacts

- `01-dashboard-concepts-desktop.png`
- `02-concept-explanation-desktop.png`
- `03-case-question-hierarchy-desktop.png`
- `04-case-question-narrow.png`
- `05-dashboard-concepts-narrow.png`
- `06-matching-question-desktop.png`
- `07-boss-question-desktop.png`
- `08-boss-partial-feedback.png`

## Live-state isolation

The nine files under `state/` and `history/` had identical SHA-256 values before and after Browser
practice. Representative values and the complete comparison used in this pass:

```text
447C5A84A4AA200B7741682D8C298082463AAFF8E6921AC6DA512521D1D39081  history/flagged_questions.json
11FE498FA0CDE478D841701C392EBB8FA2FA7E5CE6030770C844317D3BBB7995  history/question_history.json
3708B45896F3A6BED3E292BED5D574658D22965A0E7EB7A858872D29396BAF02  state/game_state.json
49358BC959FD91685BD107A871089CE534CF8DEC1E8AA3E69482778951C24E4B  state/session_cache.json
FB18F52F9FDE8DE1273767199F732C9081F4B87109A69C34458C685CF8F9BE37  state/stats.json
B7563D42265DCF2FBDB1970F146F2EDBEC2EDFE1BE7680D90567E70BBAFF42EC  state/stats/BEHECON_stats.json
1903564C08E60FB0BDA452E5D72CBDE000453F2D688F4C0641E70044DE34A62C  state/stats/MACRO_stats.json
70841DC058CADA01F287C820B19F928017458A7AA45AEB63429C3F543F2192EA  state/stats/meta_stats.json
CFF438BB7F0042A34B1D84E4030F7AD5F2A479D48E05B219DD56A92011672DEB  state/stats/NABM_stats.json
```

## Open gates

- No owner-supplied T6 final paper or instruction sheet has been indexed, so exact sections,
  duration, marks, option rules, and negative marking are not claimed.
- Grounded subjective-response practice is unstarted.
- Transcript-derived items remain `WAITING_OWNER_CONTENT_ACCEPTANCE` before `DONE`.
- Real response data is still needed for item difficulty, discrimination, and empirical confidence
  calibration.
