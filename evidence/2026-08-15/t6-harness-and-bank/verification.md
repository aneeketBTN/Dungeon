# A learn run you can read, and the CLAs measured before they were used

`VERIFIED(REAL_BROWSER + AUTOMATED)` · 2026-08-15 · branch `codex/measurement-foundation`

Continues `evidence/2026-08-15/t6-ladder-and-readiness/round-2-big-issues.md`. Merges
against `evidence/2026-08-14/t6-three-student-cram-test/verification.md`. New findings
from **F-48**.

---

## Job 1 — the learn half of the harness

### What was broken, and what it actually was

The learn export "could not select its own subject". Reading the code, that was three
faults stacked:

1. It wrote `{selectedCourse: COURSE}` into `localStorage` **after page load**. The app
   reads its profile from storage exactly once, at load, so the write was invisible to
   the running page.
2. It called `window.__dungeonSelectSubject`, which **does not exist**. `typeof` it in
   the page: `undefined`.
3. So it clicked whichever set list happened to be on screen — the previously selected
   subject's — and looked those ids up in the requested subject's bank, where none of
   them exist. Every step resolved to `unknown`.

It refused to run rather than emit that, which was right. It now drives the real rail:
find the `.course-card` whose `.course-code` reads the subject's short title, click it,
**assert the app moved** (`profile.selectedCourse === COURSE`), then click the set card
and assert the run that started is the requested subject's. A step whose id the subject's
bank does not carry is a fatal error naming the id, not a `kind: "unknown"` row.

### The split that makes a full run readable

Only the app can say what a learner is served — `layeredQueue` and
`selectQuestionsFromPool` live in a DOM-bound IIFE and depend on learner state. Everything
*behind* that order is a lookup in `app/sets/*.js`. So:

- `tools/browser-checks/export-run.js` returns the **order**: one line per step, ~1 KB.
- `tools/export-learn-run.mjs` **hydrates** it into the two files, 21–24 KB each.

No scheduling rule is re-implemented in Node, which is the line `teach-before-test.js`
draws. It is why the paper mirror in `export-persona-run.mjs` needs a digest check and
this does not.

```
SPMS   12 steps · 2 lessons · 2 primers · 8 questions   queue 2a68bc78
BRGSA  14 steps · 4 lessons · 2 primers · 8 questions   queue 85cbbefc
SCLM   12 steps · 2 lessons · 2 primers · 8 questions   queue 282d56e8
IBM    12 steps · 2 lessons · 2 primers · 8 questions   queue e99f3a58
```

The paper half's drift guard still holds and now checks itself: the browser fetches the
Node-written paper file over the dev server and compares digests in the page rather than
handing a hash back to be eyeballed. **4 / 4 MATCH.**

### F-48 (new) · The feedback was on the candidate side, under a comment saying it was not

`view._feedback` — the per-option diagnoses — was attached to `out.learn`, which is the
candidate half, beneath the comment *"Withheld from the candidate file and carried in the
key."* It was not.

That is not a tidiness problem. **A diagnosis array has a hole at the correct option:**
every scored distractor carries one and the answer carries none. Measured across the
bank: 216 of 216 single-answer MCQs have `diagnoses[answer] === null`. Printing the array
beside the options hands over the answer as reliably as the answer index would.

Fixed by moving it to the key, and then by asserting it rather than commenting it: the
hydrator walks the candidate object for a list of leaky property names and fails on a hit.
Same failure mode as LAW-47's recurrence — *a comment asserting an invariant is not the
invariant.*

### Two probe defects caught before they became findings

Both are recorded because a red report from a broken probe reads exactly like a broken app.

- **The glossary was hydrated blind.** The lesson record's field is `plain`; the first
  hydrator guessed `definition ?? meaning` and wrote `null` under every term in all four
  subjects. The app renders `term` + `plain` as a definition list, so the export was
  understating what a learner has in front of them.
- **The LAW-63 assertion fired on all eight primers, and was wrong every time.** It
  searched the whole run for the primer's rule. The rule is the concept's summary, so it
  is also the correct option of the `_explain` and `_repair_cloze` items *later in the
  same run*. A lesson or reveal preceding a scored question is LAW-47 doing its job; a
  gate that calls that a leak forbids teaching. Scoped to the primer's own surface, which
  is what the Law actually forbids. **0 hits.**

### The handoff is now taken from the app, not from the lesson record

The first export printed `lesson.connects` verbatim and so reported BRGSA promising "the
next lecture is the cheapest one: the smoke test" and then delivering something else.
The app already prints a correction under that sentence when the run departs from the
course's order — the export was reading the record instead of the product.

`lessonHandoff()` is now separated from its markup and exposed through
`window.__dungeonExport.handoffs()`, so the harness reads the app's own decision rather
than a second copy of the rule. What a learner is actually told, in the delivered runs:

| Subject | promises | kept | corrected on screen |
|---|---|---|---|
| SPMS | 0 of 2 | — | — |
| BRGSA | 4 of 4 | **3** | 1 (names *Avoiding survey bias* as not part of this run) |
| SCLM | 2 of 2 | 1 | 1 (names *Exponential smoothing*) |
| IBM | 2 of 2 | 0 | 2 (names *Understanding social organisations*, F-17's lecture) |

F-19's ordering half was already closed. This is the promise half, and it is closed in
the product: no learner is left hunting for a lecture they did not miss.

---

## The three personas, sitting the run

### The number they could not produce, and this can

`tools/measure-learn-craft.mjs` states each reported exploit as code and applies it to
every selectable part of a delivered run — each cloze blank, each match row, each boss
step, each mcq. Ties resolve to the expected value of a random pick among survivors.
Percentage of selectable parts, **chance = 25%**:

| Strategy | SPMS | BRGSA | SCLM | IBM |
|---|---|---|---|---|
| eliminate absolutes | 28.8 | 24.4 | 27.4 | 37.8 |
| **name-match the concept** | **53.8** | **44.9** | **46.4** | **59.6** |
| pick the longest | 11.5 | 19.2 | 9.5 | 27.6 |
| both rules together | 50.0 | 37.8 | 48.2 | **67.3** |

**Inside a study set the dominant exploit is not absolutes — it is topic-matching.** The
mock spans sixteen concepts, so "which of these four sentences is about the subject" is
weak there. A study set is one or two concepts deep, so a learner who has read only the
set's *title* can eliminate on vocabulary alone. It pays 45–60%, and on IBM the two rules
combined reach 67.3%.

### Brilliant-but-lazy · read nothing, answered everything

He never opened a lesson. SPMS set 1 as he sat it:

- **Step 4 and step 7** ask him to "replace the flawed claim with the precise principle".
  The four options are principles from *four different concepts*. The flawed claim names
  desirability; exactly one option contains the word. Two marks, no reasoning.
- **Step 9** is the specimen for F-06. `spms_jtbd_explain`: the three wrong options carry
  *"every single user … anyway"*, *"Only the functional task matters … irrelevant"*,
  *"simply the list of features"*. The correct one carries nothing. One rule, one mark.
- **Step 8**, the match, splits on grammar: two options open with an imperative verb
  (*Treat*, *Design*) and two are definitional sentences. The rows are labelled
  "— principle" and "— decision". F-09 is intact.
- **Step 12**, the boss, ends on *"…neither result replaces the other"*. F-09 again, and
  the same string closes the boss in all four subjects.
- **Step 10** is the one item that stopped him: the drilling-machine multiple-select. It
  now carries its own caselet (LAW-61's fix, confirmed working on the learn surface) and
  the options are labelled *Habitual / Financial / Functional / Emotional / Social*. He
  guessed the three named layers from the lesson title he had not read, and got it —
  but only because the option text names the framework's own parts.

His verdict: *"I answered eight questions about two ideas and never had to know either
one. The only item that made me think was the one with a story attached."*

### Average Joe · read everything

The two SPMS lessons are good — the water bottle for desirability/feasibility/viability,
the doctor's drill and the certificate on the wall for jobs-to-be-done. The BRGSA run is
better still: four lessons, and after the bank grew it now runs **L01 → L02 → L03 → L04**
and keeps three of its four "next lecture" promises.

What he could not get past was repetition. In one twelve-step SPMS run:

- The DFV caselet appears at steps 2, 3 and 12; the JTBD caselet at 6, 11 and 12.
- *"Treat desirability as the missing test…"* appears as an option at steps 3, 8 and
  twice inside 12.
- *"A product opportunity must be wanted by customers…"* is the correct answer at step 4,
  a match choice at step 8, and the primer's revealed rule at step 2.

**Three of eight scored questions key on one sentence.** SCLM is worse in kind rather
than in degree: steps 5 and 11 are `_term_cloze` items whose correct answer is the
concept's own *name*, and step 7's orientation copy prints *"Carry forward: Strategic fit.
Now add Six supply-chain drivers"* — the answer to step 11, four steps early. That is the
`answerableFromTheConceptName` exclusion LAW-63 reports separately, measured here at **2 of
8 scored questions in one run**.

Joe: *"It does relate to itself. That is the problem — it relates to itself instead of to
the subject."*

### Dumb-but-diligent · read every line, trusted the app

He is the one the feedback is for, so the feedback is what was measured.

**F-25 is narrower than reported and should be corrected.** The cram test said feedback on
a correct answer restates the correct answer *every time*. Across the four set-1 runs,
**9 of 32** scored items print, as their correct-answer feedback, a string already
contained in the answer just chosen — the `_repair_cloze` family and two `_explain` items.
The other 23 print an explanation that differs from the option. It is a family defect, not
a universal one.

**The wrong-answer panel is still the best content in the product, and it is thinner than
it reads.** The four runs carry **161 per-option diagnoses**: 106 distinct `why` strings,
**55 distinct cues**, 15 distinct labels. The top cue covers 33 of 161 —

> *"Point to the fact in the case that would have to be true for this action to be right.
> If it is not there, the action is not supported."*

— which is the sentence he called the best the app had given him. A learner who misses
four items in one run can meet it three times.

The generated `_explain` family's diagnosis is a template with the concept name slotted
in: *"This choice states a claim about `<concept>` that the source material specifically
contradicts."* That is true and it is not teaching.

Diligent: *"When it catches me it tells me something I can use again. It just does not
have very many things to say."*

---

## Job 2 — the CLAs, measured before they were used

### The premise did not survive contact with the data

The instruction was to close F-06 by stating correct answers with the absolutes the
course itself uses, with the CLAs as the source of truth for that phrasing. So the CLAs
were measured first. **They do not contain that phrasing.**

| | correct options carrying an absolute | wrong options | "eliminate absolutes" pays |
|---|---|---|---|
| **SCLM CLA** (67 items) | **3.0%** | 19.5% | **32.6%** |
| **BRGSA CLA** (80 items) | **7.5%** | 37.9% | **38.6%** |
| Dungeon, before | 12.0% | 42.4% | 36.0 / 36.2% |

The course's own assessments put an absolute in the correct answer *less* often than the
bank being fixed. Copying their phrasing would have made the gap wider, not narrower.

Two further things fall out of the same measurement, and one of them matters more than
F-06:

- **"Pick the longest option" pays 53.7% on the real SCLM paper and 86.7% on the real
  BRGSA paper.** Against 25% chance. Dungeon's own papers pay 11–29% because
  `checkOptionShape` and the bank-wide length guard exist. The single most gameable
  property of this course's assessment is one the product already fixed.
- **"Always press B" pays 31–36% on the real papers.** `balanceAnswerPositions` deals
  Dungeon's slots exactly flat.

So the honest target is not 25%. It is *no worse than the paper the student will actually
sit*, with 25% as the direction of travel. Recorded in
`evidence/2026-08-15/t6-harness-and-bank/cla-benchmark.json` so the claim is checkable.

### What was authored

48 new single-answer items, in `app/sets/t6_challenges.js` beside the SPMS multiple-selects
and the SCLM numericals — **not** in a new file, because `t6_integrated.js` was added as
one and was missing from four load lists at once (F-47). Every list that loads this file
already loads it. Ids end `_cla<n>`; `measure-absolute-bias.js` reports them as their own
family.

- **SCLM: 32** — two per concept, rotating definition / scenario / numeric / judgement.
- **BRGSA: 16** — one per concept, scenario-led, in the CLAs' own shape.

Nothing is one of their questions. What was taken is style, coverage and difficulty. Each
item sits on a lecture that already has a lesson, so LAW-47 holds by construction, and
every claim is one its lesson states.

**On absolutes, the rule applied was narrow:** where the lecture's own claim is genuinely
universal, state it universally; do not manufacture one where it is not. *"Shorter lead
times, wider variety, more channels, higher service levels and faster innovation ALL raise
it"* is the lecture's sentence. *"His advantage was NEVER the location"* is the lecture's
sentence. 13 of 32 SCLM correct answers and 8 of 16 BRGSA ones carry an absolute because
that many of the underlying claims are absolute.

The other half of the same fix is on the distractor side and is **not** a watering down:
many wrong options here are *hedged, plausible and wrong* rather than over-claims, so
eliminating the absolutes no longer eliminates the distractors. Load-bearing over-claims
were kept as over-claims.

### Length was a defect I introduced and then measured out

First draft: the correct answer was the longest option in **18 of 32** SCLM items. Not
enough to trip `checkOptionShape` — the margins were one to five words — but "pick the
longest" is a strategy, and it moved SCLM's paper score from 11.0 to 31.5. Fixed by
lengthening distractors (which made them more specific) rather than trimming answers.

| | first draft | after | bank-wide rank shares |
|---|---|---|---|
| SCLM CLA family | 5 / 4 / 5 / **18** | 7 / 9 / 10 / 6 | `0.24 0.26 0.36 0.14` |
| BRGSA CLA family | — | 1 / 4 / 10 / 1 | `0.24 0.30 0.25 0.21` |

### F-08 — the examiner has a reserved slice for the first time

| Section | pool before | pool after | drawn |
|---|---|---|---|
| **SCLM Section A** | **52** | **84** | 50 |
| BRGSA Section A | 60 | 76 | 20 |

SCLM went from 2 spare questions to **34**. `examReservedIds()` — Learn yielding on ties —
now has something real to reserve.

### F-06 — closed on SCLM, not closed on BRGSA

`tools/run-persona-strategies.mjs` now measures **all three seeded sets and reports the
mean**, because one seed cannot tell a bank change from a draw: adding sixteen BRGSA items
moved set 1's absolutes score from 36.2 to 46.3 *while the bank-wide bias fell*, purely
because the reshuffled draw picked up four items where all three distractors carry one.

Percentage of MCQ marks, mean of sets 1–3, chance 25%:

| Strategy | SPMS | BRGSA | SCLM | CLA benchmark |
|---|---|---|---|---|
| **eliminate absolutes** | 41.2 | 36.6 | **29.5** | 32.6 / 38.6 |
| pick the longest | 32.1 | 18.4 | 15.2 | **53.7 / 86.7** |
| always B | 23.8 | 23.3 | 27.3 | 35.8 / 31.3 |
| eliminate unethical | 27.0 | 25.7 | 25.4 | 25.1 / 24.9 |
| name-match the concept | 17.4 | 25.0 | 19.7 | — |
| **all rules combined** | 34.5 | 37.8 | **24.5** | — |

Bank-wide absolute bias, all four subjects:

| Family | questions | correct carries | wrong carries | gap |
|---|---|---|---|---|
| **authored** (now incl. 48 new) | 120 | **20.8%** ← was 2.8% | 34.2% | **13.4** ← was 37.5 |
| explain | 48 | 14.6% | 58.3% | 43.7 |
| apply | 48 | 2.1% | 51.4% | 49.3 |
| connect | 48 | 33.3% | 20.8% | −12.5 |
| **overall** | 264 | **18.6%** ← was 12.0% | 39.3% | — |

**SCLM is closed against the benchmark**: 29.5% beats its own course paper's 32.6%, and
every rule combined sits at 24.5% — the craft now misleads.

**BRGSA is not, and the reason is precise.** Its Section A draws 20 from 76. Sixteen new
items are 21% of that pool, so a paper draws about four of them; the other sixteen come
from the 60 legacy `t6_brgsa.js` items, whose correct answers carry an absolute **0 of 20
times** on the drawn paper. Set 1's paper contains four items where all three distractors
carry an absolute and the answer does not. **SPMS is untouched — no items were added
there — and 41.2% is what it still pays.**

---

## The personas, sitting the new content

The bank change reached Learn: SCLM set 1 now delivers `sclm_drivers_cla2` at step 9, and
BRGSA set 1 grew to 14 steps and picked up `BRGSA-M01-L02`, the smoke-test lecture whose
absence was what broke lesson 1's promise. Nothing was scheduled by hand.

Step 9, as the candidate file gives it:

> A grocery chain cuts inventory hard across its regional warehouses to release working
> capital. Six weeks later, working capital is down as planned and lost sales have risen
> sharply in the same regions.
> **Which reading of this outcome is most defensible?**
>
> 1. The inventory driver was moved without moving the transport and information that would let replenishment keep up.
> 2. The lost sales are a forecasting failure, because the cut would have been safe against a more accurate forecast.
> 3. The inventory reduction was executed badly; the same cut done properly would have released capital without lost sales.
> 4. Inventory should be raised back to its previous level, since the trial shows this chain cannot run on less stock.

**Brilliant-but-lazy has nothing to work with.** No option carries an absolute, so the
rule that pays 41.2% on SPMS returns all four. The correct answer is the **shortest** (17
words against 18, 19, 20), so length misleads. All four name inventory, so the
name-matching rule that pays 46.4% inside this run does not discriminate. Four options,
four genuinely different diagnoses — a driver interaction, a forecasting failure, an
execution failure, a reversal — and choosing between them requires knowing that the
drivers interact. He guessed.

**Diligent gets told something transferable whichever way he is wrong.** *"Before blaming
execution, ask which second driver the first one was going to move."* / *"Name the lever
that moved before naming the analysis that might have softened it."* / *"A driver
decision is a set, not a single dial."* Three wrong options, three different cues.

**Joe's complaint survives.** The item is good and it is one of eight; the other seven in
that run are the same generated families as before, and the two `_term_cloze` items whose
answer is the concept's own name are still there. **48 items is a tranche, not a fix.**

## Gates

| Gate | Result |
|---|---|
| `npm test` | **78 / 78** |
| `validate_t6_bank.js` + transcripts | `ok: true`, **0 errors**, 1 pre-existing IBM warning |
| `check-palette.mjs` | clean, four states shape-distinct |
| `build-site.mjs` | 18 assets |
| `check_exam_readiness.mjs` | SCLM Section A **84 of 50**; the pre-existing 2-numerical shortfall stands |
| `teach-before-test.js` (LAW-47) | SPMS **12 routes / 0**, SCLM **12 / 0**, BRGSA **12 / 0** |
| `lesson-layering.js` | **0 descents** |
| `reteach-on-failure.js` | **3 / 3** |
| harness digest vs live app | **4 / 4 MATCH** |
| `ui-audit.js` @ 375 and 1280 | exam screen on a new item and learn screen on a new item: **0 overflow / 0 clipped / 0 circleFit / 0 overlaps / 0 sub-44px / 0 ragged** |

### F-49 (new) · The exam legend overlapped itself at every desktop width

Found by auditing a surface the previous sweep did not reach — that sweep covered the
dashboard, examiner *home* and lesson, not a paper mid-question. `.exam-legend li` is
`grid-template-columns: 26px 1fr`; `.exam-chip` carries `min-width: 44px` for the tap
floor. The chip overflowed its own 26px cell, ate the 9px gap and painted **9×17px across
its own label**, on all five legend rows, at every width above the narrow breakpoint. It
never showed at 375 because the mobile block already sizes the chip to 22px.

In the legend a chip is a swatch, not a control — `li .exam-chip { cursor: default }` has
always said so — so it no longer inherits the tap floor. LAW-64.

---

## Open, and what was deliberately not done

- **F-06 on BRGSA and SPMS.** Not closed. Closing them means either many more items or a
  pass over the correct answers of the 60 legacy BRGSA items and the 64 concept
  `summary` / `application` strings that are `_explain` and `_apply`'s answers. Both are
  owner-facing content that propagates to match choices, boss steps and written rubrics,
  and rewriting them was out of scope for a session that had already added 48 items. The
  `explain` (gap 43.7) and `apply` (gap 49.3) families are where the remaining leak lives.
- **Topic-matching inside a study set, 45–60%.** Newly measured and unaddressed. It is a
  distractor-selection problem in the generated families — `relevantWrong()` fixed the
  opposite defect for case questions and was never applied to `_repair_cloze` or
  `_bridge_cloze`, whose distractors are still other concepts' principles.
- **The concept name as an answer.** 2 of 8 scored questions in an SCLM run, with the
  answer printed in the orientation copy four steps earlier. Reported by
  `primer-prediction.js` under `answerableFromTheConceptName` and still open.
- **SCLM's two missing numericals.** `check_exam_readiness` still fails on them; blocked
  on a lesson for `SCLM-M03-L06` (a known gap, unchanged).
- **Pixel acceptance — closed, and it found two defects immediately.** See below.
- **Owner content acceptance.** All 48 items, their 144 option diagnoses, and their
  explanations are new prose. `WAITING_OWNER_CONTENT_ACCEPTANCE`.
- **Not merged, not pushed, not deployed.**

---

## Addendum — pixel acceptance, and the two defects it found in its first sweep

### The pane was never going to work, so this goes round it

Owed since 2026-08-12. An undisplayed Browser pane composites no frames: `screenshot`
times out saying so, `document.timeline.currentTime` stays pinned at 0, and every CSS
transition reads as its start value — two apparent CSS bugs in one earlier session were
that artefact. Headless Chrome has no pane to display. What it cannot do is click:
`chrome --screenshot` photographs a page as it loads, so on its own it captures only a
landing screen.

`tools/shots/frame.html` is the way round it. Same-origin with the app, it opens
`/app/t6.html` in a fixed-width iframe, drives the real UI exactly as the browser checks
do in the pane, and holds still. Chrome photographs the frame. It is the LAW-64 iframe
technique used for pictures instead of numbers. No CDP, no WebSocket, no dependency, no
extension.

`node tools/screenshot.mjs --port <port>` → **16 / 16**, five screens × two viewports ×
both themes, into `outputs/shots/`.

Three of its own defects were found and fixed before it produced evidence, all of the
same family as everything else in this file:

| Probe defect | Symptom | Cause |
|---|---|---|
| Drove on `load` | 14 of 16 scenes failed "no subject card reads 'SPMS'" | The dashboard renders after the app's own boot; crossing to the examiner is a view transition. Every step now **waits** for what it is about to press. |
| Finished animations once, waited 120ms | The mobile dashboard shipped the resume bar's "Start this study set / Go →" ghosted under the real button | The bar renders and hides itself on finding no run to resume, and the shutter landed inside that. Finishing one animation can start another; it now finishes until two consecutive checks find nothing running. |
| Searched the DOM for the failure banner's text | Four good screenshots reported red | That text also appears in the frame's own source comment explaining the banner. It reads the `<title>` now — the one string that cannot be an echo. |

### F-50 (new) · The Bag launcher sat on top of the theme toggle for the whole paper

The launcher docks top-right on the practice screen and on a running paper. The
`padding-inline-end` that reserves its space was written for `.app-header` on practice and
for `.exam-bar` on the paper — **and the theme toggle lives in `.app-header`**. Measured on
a live paper at 1280: launcher `1201–1247`, toggle `1183–1227`. The bag covered all but
18px of a 44px control, so a candidate reaching for Appearance mid-paper opened the bag.

This is F-01 — the bag over Submit — one bar higher up, and the same class of defect the
docking rule was written to fix.

`ui-audit.js` reported the screen clean and was not wrong: its `overlaps` detector compares
**text-bearing siblings**, and these are two icon-only buttons in different stacking
contexts, one fixed at z-index 40 over a static header control. Fixed by giving the header
the same reservation the practice screen has. Re-measured: toggle `1139–1183`, bag
`1201–1247`, no overlap.

### F-51 (new) · The subject cards laid themselves out differently depending on the bank

Reported by the owner from the mobile dashboard screenshot: the rail looked broken.

`.course-head` is a wrapping flex row of code, negative-marking flag and date, with
`margin-left: auto` pushing the date right. In a 186px card the content needs 166px and has
164px — so the date wrapped onto a second line and right-aligned itself under the code,
leaving a hole. **Only on SPMS**, because SPMS is the only subject carrying the `-1` chip,
which is 21px wide. Measured: SPMS's head 46px against 23px for the other three.

Four cards side by side in one rail, one of them laid out differently, because of a
two-pixel overflow caused by a chip that only one subject has. A layout that depends on
whether this subject has negative marking is not a layout. The date now gets its own row on
every card: heads all 42px, metas all at the same y, pills all at the same y.

`ragged` did not fire because the cards *do* share a height — the grid forces it. The
raggedness was inside them.

**Not a defect, checked and left alone:** `.course-name` is `display: none` below the
narrow breakpoint. That is deliberate and documented — the cards keep the four facts that
identify a subject and the hero names the subject in full two inches below. It does mean
three of four subjects are acronym-only on a phone, which is a judgement call worth
revisiting, not a bug.

### What a screenshot still cannot do

Hover, keyboard focus, transition *direction*, and screen readers. Keep running
`ui-audit.js` for the numbers: a picture and a measurement fail differently, which is the
entire lesson of LAW-64 and the reason both now exist.
