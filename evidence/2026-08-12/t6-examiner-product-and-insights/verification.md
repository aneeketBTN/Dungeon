# The examiner as its own product, with a diagnostic dashboard

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-12

Local dev server, Chromium via the Browser pane, at 1280×720 and 375×812.
No screenshots: the Browser pane was not displayed, so the page was not compositing
frames and every `computer{action:"screenshot"}` call timed out. Layout acceptance
below is DOM- and computed-style-level, measured with the project's own
`tools/browser-checks/ui-audit.js` probe. **A pixel-level pass is still owed**, the
same gate already open for the lesson surface and the homepage restructure.

## What was built

The examiner stops being a button on the learning dashboard and becomes a product with
its own front door: four papers, three seeded sets each, openable without any learning
state. The result screen gains a diagnostic dashboard, and the diagnosis routes back
into the learning system one concept at a time.

## Verified

### The examiner's own home

- `open-exam` opens `exam-home-screen`, not a subject's brief. Four paper cards, twelve
  set buttons, papers in exam order.
- Both honest warnings render **before** the clock, not after: IBM's caveat (1 card),
  and the two bank shortfalls — `Section B has 8 of 20 questions in the bank` (SPMS)
  and `Section B has 4 of 6` (SCLM), each with "scores out of what is actually here".
- Sets are genuinely different papers and stable across reloads. Probing SCLM sets 0/1/2
  gave three different question-1s; re-probing set 0 returned the identical paper.
  Seeds derive from subject + set index, never from the clock.

### The palette/legend defect (the original bug)

Fixed and measured. The legend now counts the section the palette is showing. Across a
live SPMS attempt the two agreed at every step: `4+0+31+0+0 = 35` chips, then
`12+1+21+1+0 = 35`, then Section B `8+0+0+0+0 = 8`. Before the fix the legend read 42
"not visited" above a grid of 35 — it was counting the whole paper.

### The learning-system boundary holds

After **three** submitted mocks: `conceptAttempts: 0`, `totalAnswers: 0`. Mock answers
still only prioritise (16 concepts in `examMisses` for SPMS) and never score.

### The diagnosis, and the route back

- Breakdown rows render with a per-concept route. Clicking one built a session of kind
  `exam-repair` scoped to `spms_priority`, titled with the concept name, whose queue was
  `LESSON:SPMS-M07-L01 → primer → question → question → question`.
  **Teach-before-test (LAW-47) holds on the new route.**
- Re-sitting the same set showed the comparison block: `Score +10% (31% → 41%)`,
  `Left blank −20 (35 → 15)`, `Concepts breaking down +12`. It is shown only on a re-sit
  of the same set, because two different draws differ in difficulty as well as in study.

### Layout

`ui-audit.js`, both viewports, active screen only:

| Screen | Viewport | Overflow | Sideways scroll | Tap < 44px | Radii off-scale |
| --- | --- | --- | --- | --- | --- |
| Result dashboard | 1280×720 | 0 | no | 1 (`brand-home`, 42px, pre-existing) | 0 |
| Examiner home | 375×812 | 0 | no | 0 | 0 |
| Result dashboard | 375×812 | 0 | no | 0 | 0 |

Density: `p.insight-warning` measured 512 chars and was split into two paragraphs;
`p.exam-home-lede` measured 303 and was cut to ~190. The one remaining flag,
`p.exam-caveat` at 310, is pre-existing. `tools/check-palette.mjs` passes in both themes
with all four evidence states still shape-distinct. 39/39 tests pass.

## Two defects the examiner exposed

### 1. Section B can be beaten by ticking everything — `REDLINE`

All eight authored SPMS MSQs carry **3 correct options out of 4**. With the paper's own
rule (+1 right, −1 wrong, floored at zero, capped at the question's marks), ticking
every option scores `min(2, 3−1) = 2` — full marks.

Verified in the browser rather than argued: ticking all four options on all eight
Section B questions, and answering **nothing** in Section A, scored
**`Section B 16 / 16`**. Zero knowledge, full marks.

This directly contradicts the rule the brief states and the examiner displays: *choosing
every option is strictly worse than choosing only the ones you are sure of.*

The fix is bank content — the authored items need a spread of 1-, 2-, and 3-correct
shapes — and needs the transcripts and owner acceptance, so it is **not fixed here**.
What is fixed is that the dashboard no longer teaches the exploit as a strategy. It had
said "Ticking generously is rational on this shape". The examiner now computes whether
tick-everything is optimal across the paper's items and, when it is, says so plainly as
a defect in the mock, warning the candidate not to carry the habit into the real paper.

### 2. A section can repeat one visible prompt sixteen times

On SCLM Section A (50 questions), measured in the page: 22 distinct caselets, 20
distinct stems, and **16 questions sharing a character-identical caselet *and* stem** —
the generator's filler prompt, "A student understands the definition but needs to explain
why the idea changes the next decision." They are genuinely different items (all 50
option sets are distinct) but they present with nothing to tell them apart.

The pool holds 52 MCQs for a section needing 50, so selection cannot fix it; it is a
bank-volume gap. What was fixed is the clustering: the draw is now round-robined across
groups of identical visible prompt, which took the longest run of consecutive identical
stems from clustered to **1**, with repeats at least 2 apart.

## Product telemetry — contract extended, nothing transmitted

`.agents/contracts/tester-event.schema.json` gains six examiner event types and the
examiner field set, and goes to `schema_version 1.1`.

- **Examiner events carry their own consent scope** (`tester-examiner-events-v1`).
  Agreeing to learning telemetry does not enrol a tester in exam-performance collection;
  the two are separately revocable. A new `allOf` rule in the contract, and a matching
  check in `tools/validate-agent-readiness.mjs`, make a scope/event mismatch an error in
  both directions — verified by asserting both mismatches are rejected.
- **Every examiner field is banded or bounded.** The cohort is eight people: an exact
  mark on a named paper on a known date is close to an identifier, and a raw duration is
  a behavioural fingerprint. No raw text; written answers contribute a vocabulary band
  and a rubric-point count only.
- The validator no longer restates the contract's allowed values — it reads them from the
  schema. The duplication had already drifted once.
- The app shapes events and buffers them locally behind a flag that defaults **off**.
  **There is no transmission path**: no fetch, no beacon, no queue that drains. Consent
  for this scope, pseudonymous identity mapping, retention/deletion and owner activation
  do not exist yet, and collection stays off until they do.
- An event captured from a real submitted attempt validates against the real schema with
  **zero unknown or forbidden fields**; the only errors are the six missing envelope
  fields (`event_id`, `tester_id`, …), which are exactly the identity fields that must
  not exist client-side. Applying a synthetic envelope yields `[]`.

Synthetic fixtures grew from 3 to 7 and all validate. `deployable: false`,
`status: WAITING_BACKEND` — unchanged.

## Note for the owner: exam scores now sync

`profile.examAttempts` is part of the profile, and the profile is PUT to D1 for
cross-device resume. Mock attempt summaries (score, marks, pacing, blanks) therefore
reach the learner backend alongside `conceptAttempts` and `examMisses`. This is
consistent with the existing progress model but is a new **category** of data, and
`docs/community/PRIVACY.md` has been updated to disclose it.

## Not covered

- Pixel-level acceptance (pane not compositing).
- BRGSA's written-answer insight block (rubric points, course-vocabulary band) renders
  only for `short-answer` items; it was not exercised, since the runs used SPMS and SCLM.
- Pacing figures in scripted runs are near-zero because a script answers faster than the
  one-second clock tick. The hand-paced run recorded `31s` used and an `11s` longest
  question, so the pacing path is exercised; the scripted re-sit's `0s → 0s` is an
  artefact of automation, not a defect.
