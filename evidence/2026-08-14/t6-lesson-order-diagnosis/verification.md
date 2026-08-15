# Concepts are layered: a run walks the course's own order

- **Goal:** lessons arrive in the order the course teaches them, so each one builds on the last.
- **Status transition:** `DIAGNOSED → VERIFIED(REAL_BROWSER + AUTOMATED)` on branch
  `codex/measurement-foundation`. Not merged, not deployed.
- **Reported by:** the owner — "we sometimes jump from 1 to 4 to 3 … is it chaining for maximum
  layering, or is it random?", then: "I want you to layer concepts. That was the original intent and
  vision behind lesson structuring — each lesson builds on top of the last."
- **Changed files:** `app/t6.js`. New check: `tools/browser-checks/lesson-layering.js`.

## Diagnosis: neither layering nor random

`layeredQueue()` lives inside the IIFE with no export, so everything here was measured by driving
the real app and reading `profile.active.queue`, the way the LAW-47 browser check does.

**SPMS study set 1**, the run the homepage captions *"in the order the subject teaches it"*,
delivered `M01-L10` (Jobs to Be Done) before `M01-L05` (Desirability, feasibility, viability).

Two mechanisms composed, and neither read lecture position:

1. **Lesson position was a by-product.** `layeredQueue()` inserts a lecture's lesson immediately
   before the first surface citing it. There is no lesson list and nothing sorts one — lesson order
   *was* question order.
2. **Question order was variety plus a hash.** `selectQuestionsFromPool()` sorts on never-attempted
   → format variety → concept variety → least-recent → `stableQuestionOrder(id)`, a hash of the
   question id string. Course position appears nowhere. On a fresh profile the first four keys tie
   for the opening pick, so the first question of a run — and therefore the first lesson a learner
   ever meets — was chosen by that hash. For SPMS: `spms_jtbd_explain` at 205,902,689, the lowest in
   a 23-question pool.

Deterministic, so not random. Arbitrary with respect to teaching, which is why it looked random.

**The app was already making the promise.** A primer following another concept prints
*"Carry forward: `<previous>`. Now add `<this>`"*, and the step header reads *"builds on what you
just did"*. That copy has been shipping against a sequence nothing had sequenced.

## The change

Two edits, both in `app/t6.js`, and **selection is deliberately untouched** — which questions a run
contains is still chosen for format spread, concept coverage and weak-first. Only the order they
arrive in changed.

1. **`selectQuestionsFromPool` sorts the selected questions by teaching rank** after selection
   completes. Rank is `module * 1000 + lecture`, taken from the lecture id, because both numbers are
   positional — modules run in teaching order and the Nth section of a module file is `L<N>`. A
   question ranks by the **last** lecture it cites, since it cannot be asked until every lecture it
   needs is taught; ranking by the first would drag a later lesson into the middle of an earlier
   block. The sort is stable, so variety ordering survives intact *within* a lecture. Bosses and
   constructed responses still go last — they synthesise across the run.

2. **`layeredQueue` commits to the whole lesson list up front and drains it in order.** Ordering the
   questions is not sufficient on its own: a boss held to the end, or a question ranked by its last
   lecture, can be the first surface to owe a lesson for an *early* lecture — which would then be
   introduced after material built on top of it. Measured, that left **4 backward steps**, including
   a module-3 foundation taught last because only the boss cited it. Now the run computes every
   lecture it will owe, sorts it, and when a surface needs lecture X teaches everything still owed
   at or before X. Lesson order is monotonic **by construction**, and LAW-47 holds a fortiori: a
   lesson can only move earlier than the surface that triggered it, never later.

`startPriorityPractice` is deliberately **not** touched. It builds its ids directly rather than
through the pool, and its on-screen kicker says *"Starts here because `<reason>`"* — it is
remediation ordered by need, and it states that order to the learner.

## Measurement

### Question order — all 40 sets, all four subjects

The property that changed, measured contamination-free (selection never reads `lessonsRead`).
Committed as `tools/browser-checks/lesson-layering.js`.

| | Sets | Consecutive pairs | Descents | Sets out of order |
| --- | --- | --- | --- | --- |
| **Before** | 40 | 253 | **94** | **37 of 40** |
| **After** | 40 | 253 | **0** | **0 of 40** |

The pair count is identical at 253, which is the check that selection was not disturbed: the same
questions, in a different order. "Before" was measured by stashing `app/t6.js` to HEAD, reloading,
and running the identical probe.

### Lesson order — one set per page load

| Set | Before | After |
| --- | --- | --- |
| SPMS 1 | `M01-L10 → M01-L05` (1 backward) | `M01-L05 → M01-L10` |
| SPMS 9 | `M06-L05 → M03-L06 → M02-L04 → M01-L05 → M08-L03 → M04-L07 → M07-L04` (4 backward) | `M01-L05 → M02-L04 → M03-L02 → M03-L06 → M04-L02 → M04-L07 → M06-L05 → M06-L08 → M07-L01 → M07-L04 → M08-L03 → M08-L05` |
| BRGSA 9 | `M07-L02 → M07-L01 → M06-L05 → M07-L04 → M05-L06 → M05-L05 → M03-L01 → M01-L03 → M01-L01 → M02-L02 → M02-L03` (7 backward) | 18 lessons, `M01-L01` through `M08-L01`, 0 backward |

Each "after" row was taken on a fresh page load with `lessonsRead` empty — see the trap below.

### The carry-forward chain, SPMS set 9

What the primer now prints, end to end:

```
(first)                              -> Desirability, feasibility, viability
Desirability, feasibility, viability -> TAM, SAM, and SOM
TAM, SAM, and SOM                    -> Product definition and positioning
Product definition and positioning   -> Lean Canvas
Lean Canvas                          -> Value-based pricing
Value-based pricing                  -> Unit economics
Unit economics                       -> Requirements traceability
Requirements traceability            -> Functional and quality requirements
Functional and quality requirements  -> MoSCoW and RICE prioritisation
MoSCoW and RICE prioritisation       -> Product roadmap
Product roadmap                      -> Actionable product metrics
Actionable product metrics           -> Privacy by design
```

That is the SPMS syllabus in order. The copy is now true.

### Gates

| Gate | Result |
| --- | --- |
| `tools/browser-checks/teach-before-test.js` (**LAW-47**, official) | `ok: true` — 9 sets + mixed builder, **0 violations** |
| `tools/browser-checks/lesson-layering.js` (new) | `ok: true` — 40 sets, 253 pairs, **0 descents** |
| `npm test` | **78 / 78** |
| `npm run check:exam SPMS` | 0 errors, 0 warnings |
| `node tools/validate_t6_bank.js "<transcripts>"` | `ok: true`, 0 errors, coverage populated for all four subjects |
| `node tools/check-palette.mjs` | all pairings in tolerance, four states shape-distinct |
| `node tools/build-site.mjs` | release artifact builds, 18 assets |

## A measurement trap this cost, worth knowing about

Rendering a lesson calls `markLessonRead` **immediately** — by design, so a resume does not re-teach
it. That write lands on the profile held **in memory**. Blanking `lessonsRead` in `localStorage`
does not undo it, because the app reads its profile once at load.

So any probe that opens several sets in one page session contaminates itself: set 2 is already
missing the lesson set 1 displayed, and it compounds. The first run of this measurement reported
**53 LAW-47 violations and 4 backward steps** on that basis; both numbers were artefacts. Worse, the
contamination is *order-dependent*, so it is not even a constant offset between a before and an
after — it varies with the thing under test.

The existing LAW-47 check has the same shape (it blanks `lessonsRead` in storage between sets), and
it passes — but it passes on a queue built with fewer lessons than a real first-time learner sees.
That does not make its result wrong, since a missing lesson can only *add* violations, never hide
one. It is recorded as `WATCH` **LAW-62**.

The same check also silently skips set 10: its selector wants a button whose text starts with the
set number, and set 10 is labelled `P` ("Flexible practice check"). Pre-existing; 9 of 10 sets plus
the mixed builder are covered.

## Observed, not a defect

In SPMS set 9 the module-6 pair arrives as two lessons back to back — `M06-L05`, then `M06-L08`,
then questions. That is the owed-list drain working: the first module-6 question is the `L08` one,
and `L05` is a foundation it is about to be tested on top of, so it is taught first. Coherent and in
order, but it is the one place a run presents two lessons before a question.

## Remaining

- Not merged, not deployed. Tester-visible: the order of a run changes for everyone.
  Announcement draft: `outputs/ANNOUNCEMENT-2026-08-14-layered-concepts.md`.
- No new content, so no `WAITING_OWNER_CONTENT_ACCEPTANCE` on this change specifically.
- The "in the order the subject teaches it" caption on the homepage route is now true. It was not
  before, and that is worth knowing when reading older evidence.
