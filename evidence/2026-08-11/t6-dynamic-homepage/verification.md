# Dynamic homepage, practice builder, agreement enforcement, and readable matching

Date: 2026-08-11
Status: `VERIFIED(REAL_BROWSER + AUTOMATED)` for the implemented behavior below.
Not deployed at the time of writing: production still serves commit `475837f`.

## Owner direction being satisfied

1. Move subjects to the top.
2. Put the trendline on the start homepage instead of a `0 of x` indicator.
3. Make the homepage dynamic: fast subject switching, encouragement to mix and match a practice
   check, reassurance about distance travelled, and a holistic view further down the scroll.
4. Answer why testers showed progress while the Control Room said they had not agreed.
5. Make long-form matching readable: show the substance once and identify the short principle.
6. Announce every change to the tester community.

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| App syntax | `node --check mock/t6.js` | pass |
| Control Room syntax | `node --check mock/admin.js` | pass |
| Release / access / agent tests | `npm test` | 33 pass, 0 fail |
| Bank integrity | `node mock/validate_t6_bank.js "C:/Users/knigh/OneDrive/Desktop/exam/Term 6 AI-Ready Pack"` | 0 errors, 0 warnings |

New tests in `tests/cloudflare-access.test.mjs`:

- `a session issued under older terms cannot keep using the learner backend` — the identity and
  progress routes both return `401 AGREEMENT_REQUIRED` once the stored accepted version is changed
  underneath a live session.
- `the control room separates older-terms testers from testers who never agreed` —
  `agreementAccepted:false, agreementEverAccepted:true` for an older-terms tester and
  `false/false` for one who never accepted.

## Real Browser evidence

Server: `python3 mock/server.py 8099` through the Browser pane. Fixtures used
`?scenario=dashboard-progress`, `?scenario=fresh-start` (unseeded default profile),
`?scenario=simulation-results`, and `?scenario=question-match`. No `state/` or `history/` file was
touched, and scenario mode does not persist progress.

### Structure and the first scroll

- Dashboard child order measured from the DOM: `community-reminder`, `subject-rail`, `focus-panel`,
  `practice-builder`, `progress-story`, `evidence-summary`, `stage-tabs`, `stage-panels`,
  `dashboard-tools`.
- Header shows `Term 6 evidence 32%` with a sparkline and `Level since the last block`. The
  `0 of 64` counter is gone.
- Hero momentum card renders `BRGSA / How your evidence is moving / 31% / level` with an inline
  trend path (`spark-area`, `spark-line`, `spark-dot`) and the message
  `Level since your last block. 4 concepts have an open miss, and those come first when you practise.`
- Switching to another tab keeps the hero and subject rail visible; the detailed 220-pixel evidence
  graph now renders inside the Concepts panel with `4 practice blocks shown.`

### Builder controls change the run (LAW-01)

- Pool sizes recompute per combination. BRGSA mixed: anything 151, needs work 100, new ground 35.
- IBM / recognition / new ground has a 7-item pool: `Quick` reports 6 questions, `Standard` reports
  7, and `Deep` is disabled with `Only 7 here, the same run as standard`.
- Fresh profile: `What needs work` is disabled with `Nothing in this subject needs work yet`, and
  `New ground` is disabled with `Nothing is started yet, so this is the same as anything` because it
  would select the whole pool.
- Starting `IBM · recognition · new ground · quick` produced a run titled
  `IBM · Recognition practice · concepts you have not started`, kicker
  `Explanations after each answer · 7 questions`, and 9 queue steps (7 questions plus 2 new-concept
  primers).
- Starting the same builder in `Held to the end` produced 6 steps with no primer, preserving the
  held-feedback rule that assessment-shaped checks contain no teaching support.

### Reassurance strip

- Seeded profile: `16 practice blocks behind you`, `Answers recorded 130`, `Practice blocks 16`,
  `Concepts with evidence 48 of 64`, `Subjects started 4 of 4`. Answers are deduplicated per
  question, block, and timestamp so a multi-concept question counts once.
- Fresh profile: `Your record starts with one block` with every count at zero and no praise.
- After the simulation-results fixture returned to the dashboard, momentum moved to `IBM 22%`, the
  header to `5% / First block recorded`, and the story to `1 practice block behind you`.

### Entry points into the builder

- `Mix your own practice` and the study plan's flexible practice card both focus the builder,
  highlight it, and scroll the page (`window.scrollY` 0 → 630, builder centred). The first attempt
  failed silently because `showScreen`'s `window.scrollTo(0, 0)` animates under
  `scroll-behavior: smooth`; recorded as LAW-42.

### Matching board

Two rejected iterations are recorded because they explain the final shape. Repeating all four long
answer cards under every row made the learner reread the same paragraphs four times. Showing each
statement once with a radio list underneath was shorter but still stacked, so the statements could
not be compared and the choices sat far from the text they applied to.

The accepted layout is a board: statements side by side in one row, a slot under each, and the
unplaced label tablets in a tray docked to the bottom of the board.

- `?scenario=question-match` (SCLM) renders four `.match-column` elements in a single grid row
  (`grid-template-columns: repeat(4, minmax(0,1fr))`, driven by the statement count so a fifth
  statement would not wrap), four `.match-slot` drop targets, and a four-tablet tray labelled
  `Labels to place · 4 left`. The board reports `resize: vertical` and scrolls its own content.
- Lifting a tablet marks it `aria-pressed="true"`, puts all four slots into `ready`, and changes the
  empty-slot copy to `Place A here`.
- Placing removes the tablet from the tray (`3 left`). Choosing a filled slot returns its tablet to
  the tray. Moving a placed tablet to another slot empties the first: slots went from
  `[A, B, empty, empty]` to `[A, empty, B, empty]`.
- Keyboard: tablets and slots are buttons, both take focus, and activation places the label. After
  the tray rebuilds, focus returns to the same tablet (`activeRow "0"`, `aria-pressed "true"`), and
  after placing, focus stays on the slot. Tablets are also `draggable` with slot `dragover`/`drop`
  handlers for mouse users.
- Commit stayed disabled until all four slots were filled and the sampled confidence question was
  answered or skipped.
- Answered state: three slots `filled wrong` with `Belongs to <label>` named underneath and one
  `filled correct`; feedback read `1 of 4 reasoning parts correct`, so partial credit and concept
  results still come from the unchanged row-indexed response.
- The earlier radio version exposed a real defect: computed background on a selected wrong choice
  was the blue selection fill because `.choice:has(input:checked)` outranks `.choice.wrong`. After
  the fix the values are `rgb(253,232,227)` for wrong and `rgb(225,241,232)` for correct. Recorded
  as LAW-41; the fix also covers cloze and boss choices.
- The docked tray originally used a 14-pixel gradient and let statement text read through it while
  the board scrolled. It now uses a solid surface; re-checked at 390 pixels with the board scrolled.

### Responsive

- 390 × 844: `document.scrollWidth === 390`, zero elements overflowing the viewport on the dashboard
  and inside the question card. The subject rail became one swipeable row (258 pixels tall, its own
  `overflow-x` container, page does not scroll sideways), builder chips stayed two-up at 58 pixels
  minimum, the match board collapsed to one statement per row with the tray still docked, slots
  measured 64 pixels and tablets 40 pixels.
- Desktop 1280: `document.scrollWidth 1265`, no overflow.

## Boundaries

- Practice remains within one subject. A single run mixing subjects would require threading a course
  id through every queue item and is `UNSTARTED`.
- `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` is unchanged. Builder copy states that it is practice, not a
  copy of the final paper.
- Momentum and story copy are derived from recorded attempts only. They are not a score prediction.
- The agreement fix is implemented and tested but not live. Deploying it asks the current cohort to
  accept the current agreement version again, which is the intended behavior of a real terms change.
