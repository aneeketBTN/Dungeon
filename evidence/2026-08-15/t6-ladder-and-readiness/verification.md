# The ladder was in the bank and not in the product

`VERIFIED(REAL_BROWSER + AUTOMATED)` · 2026-08-15 · branch `codex/measurement-foundation`

Owner goals addressed, in the owner's words:

1. concepts taught step by step in order of layering, so questions do not surprise you;
2. testing that does not feel disconnected, with progress you can see is tracked;
3. tracked data that brings back the lessons you need when you make mistakes;
4. an Examiner that stands where students go to be tested on what they have been
   taught — *"If Examiner feels foreign, that's Dungeon Learn's failure."*

Merges against `evidence/2026-08-14/t6-three-student-cram-test/verification.md`
(findings `F-01`…`F-45`). Closes or narrows **F-03, F-16, F-19, F-19a, F-31, F-33,
F-34**. New findings continue from **F-46**.

---

## The measurement that reframed the work

`tools/measure-learn-exam-coverage.js` (new). Walks each subject's study sets in
order and asks what share of that subject's own mock the learner has been taught
after each one.

| Subject | After set 1 | Ladder |
|---|---|---|
| SPMS | 2 of 16 concepts → **8 of 75 marks (10.7%)** | 22.7 → 32 → 45.3 → 56 → 70.7 → 86.7 → **100%** |
| BRGSA | 2 of 16 → **7 of 80 (8.8%)** | 11.3 → 42.5 → 50 → 63.8 → 86.3 → 91.3 → **100%** |
| SCLM | 2 of 16 → **7 of 72 (9.7%)** | 27.8 → 52.8 → 63.9 → 70.8 → 80.6 → 91.7 → **100%** |
| IBM | 2 of 16 → **10 of 100 (10%)** | 20 → 30 → 50 → 60 → 80 → **100%** |

**The curriculum is already layered and already complete.** Sets 1–8 are modules
1–8, two concepts each, and walking them in order carries a learner from a tenth of
their paper to all of it. Every concept's source lecture has an authored lesson;
all four subjects are exactly 8 modules × 2 concepts.

So F-16 — "the recommended set teaches a small fraction of what its own mock
examines" — is not a content gap. It is the *expected state after one step of
eight*, and the product never said which step anyone was on. Ten identical cards
under "Ten study sets are available" and "You do not have to complete all ten"; no
position, no statement of what a set adds or rests on, and nothing separating the
eight that build the subject from the two that revisit it. A learner who finished
set 1 and opened the Examiner met a paper ~90% untaught with nothing anywhere
telling them that was normal.

**The fix is not more content. It is saying out loud what the bank already knows.**

---

## What changed

### 1 · The ladder is the product (goals 1, 2 — F-34)

`courseLadder(courseId)` in `app/t6.js`. Each set card carries its step number, the
concepts it adds, and what it rests on; the current step is marked, later steps say
their ground is not covered yet. Verified on a fresh SPMS profile:

> **The subject in 8 steps — you are on step 1**
> Each step teaches two concepts and rests on the ones before it. 0 of 16 concepts
> taught so far. The last two sets are not steps: they revisit what the eight have
> covered.
>
> `[1] Product foundations · Adds Desirability, feasibility, viability and Jobs to be
> done · Starts the subject — nothing before it · 8 questions · ~12 min · Step 1 of 8`
> `[2] Markets and adoption · Adds TAM, SAM, and SOM and Crossing the chasm · Rests on
> the 2 concepts before it — not all taught yet · Step 2 of 8`

After module 1 is taught, step 1 flips to `ladder-done`, step 2 to `ladder-current`,
and step 2's line loses "— not all taught yet" because the ground under it is now
covered. Sets 9 and 10 are excluded from the ladder by construction and labelled
"Revisits all 16" / "Your own mix".

**F-34 closed at source.** The hero read `definition.questionIds` — a stale
four-item seed list from before sets drew from module pools — while the card read
`definition.questionCount` (8) and the runner counted queue length (12 steps). Same
set, three numbers, one screen. There is now one `setQuestionCount()` and the
runner's "steps" is separately labelled, because 8 questions and 12 steps are both
true and were never in conflict except by omission.

### 2 · The Examiner states readiness before the clock (goal 4 — F-16)

`examReadiness(courseId, setIndex)` + `examReadinessCopy()`. Two numbers because
they answer different questions: concept coverage is seed-independent so it can sit
on a card offering three sets; marks are computed against the real built paper where
someone commits two hours to one draw. A question resting on one taught and one
untaught concept counts as untaught — half-ready would overstate the exact thing
this exists to stop overstating.

Fresh profile, every paper card:

> Learn has not taught you any of the 16 concepts this paper draws on yet. Step 1 of
> 8 in Learn adds Strategic fit and Six supply-chain drivers. **[Teach me that first]**

After SCLM study set 1 — the exact state the students were in:

> *Card:* You have been taught 2 of the 16 concepts this paper draws on. Step 2 of 8
> in Learn adds Exponential smoothing and Sales and operations planning.
>
> *Pre-clock cover:* You have been taught 2 of the 16 concepts this paper draws on —
> **about 10% of this set's 72 marks**. Step 2 of 8 in Learn adds Exponential
> smoothing and Sales and operations planning. Sitting it now is a fair thing to do —
> it will show you the shape of the paper — but a low score here is Learn not having
> happened yet, not a verdict on you.

The browser's 10% and the node measurement's 9.7% agree, which cross-validates the
mirrored `examPool`/`examShuffle` in the measurement script.

**"Teach me that first"** crosses to Learn and opens the next rung, because a
readiness figure with no route out of it is just a discouraging number.

### 3 · A mistake brings the lesson back (goal 3 — F-03)

`lessonsRead` was a one-way latch and `pendingLessonsFor` filtered on it, so a
lecture met once was never taught again — **including by the routes that exist for
nothing else**. `conceptRepairIds` is commented "One concept, several surfaces,
taught first"; `startExamRepair` prints "Taught first, then tested again" on screen;
the in-run re-attempt path says "must not overtake its own teaching". All three were
true only for a learner meeting the lecture for the first time.

`lessonNeedsReteach()` re-opens a read lesson when the last scored answer on its
concept, *after* the lesson was read, was wrong. Scoped narrowly on purpose, because
re-teaching on every slip is a worse product than never re-teaching:

- only in remediation (`priority`, `exam-repair`, `concept`) and in-run re-attempts;
- only on evidence recorded after the read, so the errors that sent you to the lesson
  cannot send you straight back;
- only while the gap is open — wrong-then-right is somebody who recovered.

Standing check: `tools/browser-checks/reteach-on-failure.js`, three cases, `ok: true`.

| Case | Expected | Found |
|---|---|---|
| read → wrong, nothing right since, remediation | 1 re-teach | **1** |
| read → wrong → right, remediation | 0 | **0** |
| same open failure, opened as a study set | 0 | **0** |

One run containing both states, correctly distinguished:
`LESSON SCLM-M01-L04 [RE-TAUGHT]` then `LESSON SCLM-M01-L06 [first time]`.

The re-taught lesson says why it is back — *"Lesson · again" / "Back because you
needed it" / "This lecture is back because your last answer on it was wrong"* —
because a lesson reappearing silently reads as the app losing track of you.

### 4 · The handoff promise, made true of the run (goal 1 — F-19)

`tools/browser-checks/lesson-layering.js` reports 40 sets, 253 consecutive pairs,
**0 descents** — the ordering half of F-19 was genuinely fixed on 2026-08-14 and the
students' report predates it. The *promise* half was never in scope, and the
layering check cannot see it: order can be perfectly monotone while every handoff in
it is false, because the bank cites 16 lectures where BRGSA has 50 authored.

`tools/measure-lesson-handoffs.js` (new) finds all of them. The students found two by
hand:

| Subject | Handoffs promising "the next lecture" | Broken |
|---|---|---|
| BRGSA | 12 of 15 | **12** |
| IBM | 6 of 15 | **2** |
| SCLM | 3 of 15 | 0 |
| SPMS | 0 | 0 |

It agrees with the blind student findings on all four subjects, including SCLM being
clean — which the report singled out as "the best of the four".

Fixed in code rather than by rewriting fourteen sentences, because a study set, a
priority run and the sweep deliver different subsets, so **no fixed sentence can be
true of every route**. `lessonHandoffHtml()` computes the handoff against the run in
hand. On the exact case Diligent hit:

> *Several kinds of organisation claim this territory. The next lecture sorts them.*
> That is the course's order. This run does not follow it here — it delivers only the
> lectures your questions rest on, so **Understanding social organisations** is not
> part of it.
> **Next in this run:** Bottom of the pyramid markets

It names the skipped lecture — the one then examined for ten marks (F-17). On SCLM,
where the promise holds, no note is added and only the true "Next in this run" line
appears. The guard discriminates.

**F-19a closed with it.** `data.order` is the lecture's position in its module, so
the first lesson of the first set was headed "Module 1 · lesson 5" and a careful
reader went hunting for four lessons that were never his to miss. Now: *"Lesson 1 of
6 in this run · module 1, lecture 4"* — the sparse course number is kept because it
is how you find the lecture in the real course, but it is no longer the headline.

### 5 · Two counters that told the truth badly (goal 2 — F-31, F-33)

**F-31.** "Re-attempts due" was honest and its caption was not. A correct answer
schedules a re-attempt whenever confidence was low or the concept has fewer than
three correct behind it (`t6.js`, the `low-confidence-correct` / `developing`
branch) — deliberately, and one of the better things the engine does — but the box
underneath read *"A missed idea returns in a different question"* whatever was in
it. Students watched the number climb through a run they were getting right and
concluded the tracking was broken. `reattemptSummary()` now describes what is
actually queued, splitting repair from confirmation.

**F-33.** COURSE VOCABULARY scored a candidate against each lecture's glossary. On
the one lecture Learn had delivered he scored 3 of 3; across the nine it had not,
under a third. The metric tracks *delivery* almost perfectly and was reporting it as
the candidate's failing, then telling them "examiners look for the framework's
vocabulary" about words no screen had ever shown them. The measurement is good and
stays; whose gap it is has changed:

> **Course vocabulary · 0 of 4** — Learn has not taught you this lecture yet, so this
> is our gap, not yours.
>
> Learn has not delivered this lecture yet, so its vocabulary was never put in front
> of you. Teaching it is on us — the count above is a gap in your revision plan, not
> a mark against this answer.

The scolding is kept for candidates who *were* given the words.

---

## Gates

| Gate | Result |
|---|---|
| `npm test` | **78 / 78** |
| `tools/validate_t6_bank.js` | `ok: true`, 0 errors |
| `tools/check-palette.mjs` | clean, four states shape-distinct |
| `tools/build-site.mjs` | builds |
| `browser-checks/teach-before-test.js` (LAW-47) | `ok: true` — 12 routes, **0 violations** |
| `browser-checks/lesson-layering.js` | `ok: true` — 40 sets, 253 pairs, **0 descents** |
| `browser-checks/reteach-on-failure.js` (new) | `ok: true` — 3 / 3 cases |
| `browser-checks/ui-audit.js` @ 375×812 + 1280×720 | dashboard, examiner home, lesson: **0** overflow / clipped / overlaps / sub-44px / ragged / off-scale radii |

LAW-47 was re-run deliberately: this change *adds* lessons to queues that previously
had none, so teach-before-test had to be re-proved rather than assumed.

---

## A defect this verification found in itself

The first version of `reteach-on-failure.js` reported the open-failure case broken
while the app was doing it correctly. It staged its fixture over an empty
`localStorage` key; `loadProfile` normalised that against its defaults on the
reload, the fixture was discarded, and the run it then measured had no failed
concept in it. **A check that fails that way is worse than no check** — it reads
exactly like a real regression. It now refuses to run unless there is a saved
profile to stage onto, and says so.

Same class as LAW-62 (a probe contaminating its own measurement) and as the
`clipped` false-positive lesson: *a clean report from a probe blind to the defect
class reads exactly like a clean screen, and a red one from a broken probe reads
exactly like a broken app.*

---

## Not done, and named

- **Pixel acceptance.** Screenshots were unavailable in the pane again; all layout
  claims here are DOM geometry, not images.
- **F-05 (the fake stem, 12–16 marks a paper) and F-08 (Learn items reprinted
  verbatim in mocks)** are untouched. They are the largest remaining hole in what the
  mocks measure, and they are bank-content work rather than scheduling.
- **F-02 (BRGSA Section B renders four unanswerable questions and then bills them to
  the student)** is untouched and is still the worst defect in the product. SCLM
  already handles the same shortfall correctly (F-02a), so it is a fixable choice.
- **F-01 (the Bag over Submit)** was fixed in the prior session; not re-verified here.
- **Readiness is "the lesson has been read", never "answered well".** Telling a
  candidate they are 60% ready because their evidence is strong would be a
  prediction, and this product does not make those.
- **No new prose was authored**, so nothing here is
  `WAITING_OWNER_CONTENT_ACCEPTANCE`; all learner-facing copy added is computed from
  the learner's own state.
- Not merged, not pushed, not deployed.
