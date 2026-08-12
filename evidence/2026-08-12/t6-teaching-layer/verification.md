# Teaching layer — 0→80 structure

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-12

## Claim under test

A learner who has not studied the course can reach competence in the app. Before this change the
bank was a measurement instrument: a cold learner's first contact with any concept was a scored
item written in vocabulary nothing had introduced.

## What was measured before the change

Run against the shipped bank by loading `app/sets/*.js` in a VM and inspecting generated output.

| Measurement | Value |
| --- | --- |
| Case questions whose decision blank had **zero** same-concept distractors | **59 of 64** |
| Share of a case's own vocabulary introduced by its own primer (mean) | **19%** |
| Cases whose primer introduced **none** of the case vocabulary | **10 of 64** |
| Cases at or below 20% vocabulary coverage | **36 of 64** |
| Case questions explaining a **different lecture** than the one they tested | **9** |
| Distinct explanation sentences per concept (BRGSA / others) | **4.8 / 2.3** across ~12.8 surfaces |
| BRGSA teaching prose available in the pack vs used by the app | 92,489 dense words vs ~2% |
| `stopping rule` — used in a correct answer — occurrences in 50 BRGSA transcripts | **0** |
| `per arm` (caselet vocabulary) vs `variant(s)` (course vocabulary) | 3 vs 8 lectures |

Worked example of the distractor defect (`brgsa_m2_design_case_cloze`, correct answer 12 words):

| Candidate | Words | Δ | Origin |
| --- | --- | --- | --- |
| Stop and ship B before the lead disappears | 8 | 4 | authored, same concept — **evicted** |
| Delete Variant A from the report | 6 | 6 | authored, same concept — **evicted** |
| Double-count repeat visitors to finish sooner | 6 | 6 | authored, same concept — **evicted** |
| Create a scored backlog tied to the constraint… | 13 | 1 | Prioritisation — **selected** |
| Lifecycle engagement matched to the user's current state… | 12 | 0 | Habit and lifecycle — **selected** |
| Own the cross-functional activation/retention transition… | 11 | 1 | First customers — **selected** |

`comparableWrong()` sorted the whole pool by word-count distance, so relevance was never consulted.

## What changed

1. **Teaching layer.** `app/sets/t6_lessons.js` — lecture-grain lessons (objective, explainer,
   worked example with real course numbers, glossary, handoff). **BRGSA complete: 50 lectures,
   all 8 modules.** `tools/build_t6_lessons.mjs` extracts candidates from the pack; prose is
   authored, because the dense files are transcript bullets and some are incoherent out of context.
   Every figure and framework was grepped against the lecture's own transcript before authoring —
   the ₹3,200 blended vs ₹10,000 LinkedIn CAC, the 33% signup-to-activation constraint, the five
   outbound components, the 70/20/10 split, the 12-week roadmap's five columns, the 1–2 hop
   business-outcome test.
2. **Teach-before-test invariant.** `layeredQueue()` places a lecture's lesson ahead of the first
   scored question citing it, ahead of the primer. Lessons are unscored and create no evidence.
3. **Distractor relevance.** `relevantWrong()` fills from the same concept first, then trades the
   shortest relevant option for a length-matched cross-concept one only while the set would
   otherwise cue the answer by length.
4. **Provenance alignment.** A case question now explains, links to, and cites the lecture its case
   came from (`caseSource` / `caseExplanation` / `caseLink`).
5. **Vocabulary gate.** `tools/validate_t6_bank.js` measures first use against the lossless
   `graph_source/` transcripts, not the concept index — the index reports "sample size" as first
   seen in M02-L03 when M02-L02 is the lecture titled "Sample Size Logic".

## Results after the change

| Measurement | Before | After |
| --- | --- | --- |
| Case questions with zero same-concept distractors | 59 / 64 | **0 / 64** |
| Case questions with ≥2 same-concept distractors | 5 / 64 | **64 / 64** |
| Option-shape (length cue) errors | 0 | **0** — guard still holds |
| Case questions explaining a different lecture | 9 | **0** |
| Bank validator | ok | **ok, 0 errors** |
| Release/access/agent tests | 35 pass | **35 pass** |
| BRGSA lectures with a lesson | 0 / 50 | **50 / 50** |
| BRGSA scheduled questions fully taught | 0 / 151 | **152 / 152** |
| BRGSA cited lectures taught | 0 / 33 | **33 / 33** |
| `stopping rule` in a correct answer | 1 | **0** |
| BRGSA questions excluded as legacy MCQs | 37 | **36** |

The vocabulary gate caught three real authoring errors during this session and all were fixed:

- the lesson defined `arm` at M02-L02, but the course does not use it until M02-L06;
- the lesson defined `sample bound` at M02-L06, first used at M08-L03;
- the M01-L05 lesson invented "sampling bias" — the course names five biases: social desirability,
  hypothetical, acquiescence, leading question, researcher confirmation.

## Real-browser verification

Local dev server, `app/t6.html`, Chromium via the in-app browser. No console errors at any point.

**Teach-before-test, BRGSA set 2, queue as built:**

```
0  lesson:BRGSA-M02-L01   Null hypothesis
1  brgsa_m2_design_primer
2  brgsa_m2_design_term_cloze
3  lesson:BRGSA-M02-L02   Sample size logic
4  brgsa_m2_design_case_cloze     ← the question this work started from
5  lesson:BRGSA-M02-L03   Type I and Type II errors
```

**Lesson surface** rendered: pattern `Lesson`, status pill `Teaching first`, 3 explainer paragraphs,
4 glossary terms, worked example, handoff line, `Check answer` hidden, options empty, confidence
prompt hidden, action reads `I have read this →`.

**The originating question**, reached after its lesson: cites `BRGSA-M02-L02` (was `M02-L01`);
inline glossary offers `sample size, variant, baseline conversion rate, MDE, alpha`; decision
options are now `Stop and ship B before the lead disappears` and `Double-count repeat visitors to
finish sooner` — the misconceptions the lecture actually targets. Answered correctly, feedback
reads *"A tiny early lead is noisy…"* instead of the null-hypothesis sentence it printed before.

**Responsive:** 375×812 — no horizontal overflow (scrollWidth 375 = clientWidth), glossary collapses
to one column, continue button 49.25px. 1280×800 — no overflow, two-column glossary, lesson column
capped at 720px.

**Module 8 (authored last), BRGSA set 8 "Operate the growth system", live in the browser:**
`MODULE 8 · LESSON 1 — ICE prioritisation` rendered with its objective line, 3 explainer paragraphs,
the worked example (Situation / Move / Why), 4 glossary terms under `WORDS THIS LECTURE INTRODUCES`,
the handoff line, and the unscored footer *"Nothing here is scored. The questions after it use these
words."* Clicking `I have read this →` advanced progress 0→1 of 13 and delivered the first scored
item, whose options are stated in the vocabulary the lesson had just introduced — *"ICE is
disciplined only when its three judgments are explicit and anchored to the constraint and available
evidence."* Terms-used count matched the lesson's 4 glossary entries. No console errors at any point.

## `sample_logic` — the originating question, repaired

The correct answer read *"Continue to the planned sample bound unless a pre-registered stopping rule
applies"*. Two vocabulary defects and one structural one:

| Defect | Evidence |
| --- | --- |
| `stopping rule` is course-absent | 0 occurrences across all 50 BRGSA transcripts |
| `sample bound` arrives 6 modules late | question is `BRGSA-M02-L02`; term first used at `M08-L03` |
| correct answer cued by length | 12 words against distractors of 8, 6, 6 — `optionShapeRisk` set, question excluded |

Rewritten in the lecture's own words — M02 says *"sample size should be pre-calculated, you should
test run to completion, no peeking"* — as **"Run the test to completion at the pre-calculated sample
size"**. Word counts are now 8 / 10 / 6 / 6, `optionShapeRisk` is false, and the question is
schedulable again: `excludedLegacyMcqs` 37 → 36, scheduled 151 → 152. The explanation now names
*peeking* and *the false positive rate*, both course terms.

The `--vocab-report` flags the replacement's bigram `pre-calculated sample`, because the transcript
separates the words (*"sample size should be pre-calculated"*). That is the false-positive class the
report's own header documents — it cannot distinguish terminology from ordinary English word order —
which is why it is opt-in and not a build signal. The build signal, `errors`, is 0.

## Defects found and fixed during verification

**Scheduling.** `ensureReattempt()` treated a lesson as a re-attemptable surface, because a lesson
carries the concept id of the question it precedes. Observed live: the sample-size lesson was dragged
from index 3 to index 5, placing the sample-size case **ahead of its own teaching**. Fixed by
skipping lesson items during candidate selection, and by moving any pending lesson ahead of a
re-attempt that is brought forward. Re-verified in the browser — invariant holds.

**Invariant (LAW-47 recurrence).** Re-verified by running the law's own verify step across a live
queue rather than trusting the code comment, and it failed: `brgsa_m1_demand_primer` sat at index 4
citing `BRGSA-M01-L01`, whose lesson did not arrive until index 9.

| Surface | Own `sourceIds` |
| --- | --- |
| `brgsa_m1_demand_primer` | `BRGSA-M01-L01` |
| `survey_bias` (the question it introduces) | `BRGSA-M01-L05` |

`layeredQueue()` computed `pendingLessonsFor()` on the scored question, then pushed the primer
without checking it — so the primer inherited a gate that did not cover its own lectures. The comment
above the block claimed otherwise ("ahead of the primer too, because the primer assumes the
vocabulary the lesson introduces"), which is why reading the code had not caught it. Fixed by
extracting `teachFirst(surface, conceptId)` and calling it for the primer on its own terms; the
lesson for M01-L01 now lands at index 4, immediately before the primer.

Re-checked from an empty `lessonsRead` (the strictest case) across every BRGSA study set and the
mixed builder — for each non-lesson item, every lecture in its own `sourceIds` that has a lesson must
appear earlier in the queue:

| Surface | Items | Violations |
| --- | --- | --- |
| Sets 1–8 | 12–14 each | **0** |
| Set 9 (connect the whole subject) | 36 | **0** |
| Mixed builder (anything / deep) | 24 | **0** |

Simulation mode takes neither lessons nor primers — `layeredQueue()` gates both on
`mode !== "simulation"` — so a practice check stays a measurement instrument.

**Authoring.** `explainer: [ … ]` was closed with `},` instead of `],` eight times across three
authoring batches. Arrays and objects sit at the same indent inside a lesson record, so the closing
bracket is the only thing distinguishing them. Each occurrence threw a bare `SyntaxError` naming only
the first failure, so a batch of six surfaced one at a time and the validator could report nothing at
all until the file parsed — the failure mode is silence, not a warning. Now scanned as a class in one
pass (LAW-50):

```bash
awk 'BEGIN{a=0} /^    (explainer|glossary): \[/{a=1;s=NR;next} a && /^    \},$/{print "BAD close "NR" (opened "s")"; a=0; next} a && /^    \],$/{a=0}' app/sets/t6_lessons.js
```

## Boundaries

- **Not screenshotted.** The Browser pane was not compositing frames in this environment, so visual
  acceptance is DOM- and computed-style-level, not pixel-level. A screenshot pass is still owed.
- **One subject of four.** 50 of 283 lectures have lessons. The validator reports the backlog rather
  than hiding it: BRGSA is at 0 untaught, IBM/SCLM/SPMS remain 100% untaught (414 scheduled
  questions between them).
- **Content acceptance.** All lesson prose is new and stays `WAITING_OWNER_CONTENT_ACCEPTANCE`.
- **Question copy.** `18 visitors per arm` remains in authored question copy; the gloss covers `arm`.
  `pre-registered stopping rule` is resolved — see below.
- **Objectives are BRGSA-shaped.** 25 of 50 BRGSA lectures state objectives in the dense layer; IBM,
  SCLM, and SPMS have almost none, so their lessons will need objectives authored from scratch.
- Nothing pushed or deployed. The live cohort is untouched.

## Reproduce

```bash
node tools/build_t6_lessons.mjs "<Term 6 AI-Ready Pack>"
node tools/validate_t6_bank.js "<Term 6 AI-Ready Pack>"
npm test && npm run build
```
