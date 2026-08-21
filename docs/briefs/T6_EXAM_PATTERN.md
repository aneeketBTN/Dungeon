# Term 6 exam pattern — Batch 1

**Owner-supplied, 2026-08-12.** This supersedes `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`, which was a
standing claim boundary held because no same-course final existed. It does now. Treat this file as
the authority for paper structure; it outranks any older statement in `AGENTS.md`, `README.md`, or
the tester guide.

**All four papers are 120 minutes. Exams run 22–23 August 2026.**

## The four papers

### 1 · Software Product Management for Startups — 22 Aug, 09:00–11:00

| Section | Type | Count | Each | Marks |
| --- | --- | --- | ---: | ---: |
| A | MCQ | 35 | 1 | 35 |
| B | **MSQ** (multiple-select) | 20 | 2 | 40 |
| | | **55** | | **75** |

**Negative marking — the only paper that has it.** Section B only: +1 for each right answer, −1 for
each wrong. Net score cannot fall below zero *at the question level*. No calculator.

### 2 · Business Research and Growth Systems Architecture — 22 Aug, 13:00–15:00

| Section | Type | Count | Each | Marks |
| --- | --- | --- | ---: | ---: |
| A | MCQ | 20 | 2 | 40 |
| B | Case-based / application | 4 | 5 | 20 |
| C | Subjective / descriptive | 2 | 10 | 20 |
| | | **26** | | **80** |

No negative marking. Normal calculator.

**Every question is self-contained.** No question requires memorising figures from the Clairo or
Zoko Brand Bible; any brand-specific number needed is stated inside the question. Section B presents
a short scenario then a task — the answer must address every part directly. Section C requires a
complete structured response.

### 3 · Inclusive Business Model — 23 Aug, 09:00–11:00

| Section | Type | Count | Each | Marks |
| --- | --- | --- | ---: | ---: |
| A | Subjective, on a released caselet | 10 | 10 | 100 |

No negative marking. **A case study is released two days before the exam**, and every question is
based on it. There is no objective section at all.

**Released 21 August 2026.** The supplied caselet is an open design prompt, not a factual company
case with exhibits:

> Based on your understanding of the condition of the poor people in our country and the
> discussions on case studies that we studied during the course, create an inclusive business
> model.

Because the brief supplies no geography, sector, poverty segment, constraints, figures, or named
organisation, a defensible answer must state a bounded set of assumptions before designing the
model. Dungeon's fixed **Released case** paper therefore keeps the prompt verbatim, declares one
coherent assumption set, builds one inclusive model, and tests it through ten course lenses. The
ordinary numbered IBM papers remain rotating framework-transfer cases and never draw from that
fixed released-case bank.

### 4 · Supply Chain & Logistics Management — 23 Aug, 13:00–15:00

| Section | Type | Count | Each | Marks |
| --- | --- | --- | ---: | ---: |
| A | MCQ | 50 | 1 | 50 |
| B | **Numerical** | 6 | 4 | 24 |
| C | Match the following | 3 | 2 | 6 |
| | | **59** | | **80** |

No negative marking. **Scientific calculator.** Standard normal distribution tables are provided; a
formula sheet is to be confirmed. For numericals, enter the requested final numerical answer — marks
are awarded for the final answer within a stated grading tolerance, and **no marks are given for
working**.

## What this means for the product

### Every required section can now be filled

The app supports MCQ, MSQ, numeric entry, cloze, case-cloze, match, short-answer, and three-step
boss. The current bank can fill every published section: SPMS has 28 MSQs for 20 slots, and SCLM
has eight tolerance-graded numericals for six slots plus 28 match questions for three slots.

`npm run check:exam` now has no volume worklist. Its remaining SCLM finding is a quality warning:
the generated match family repeats one visible task line across the three-question section.

### Objective-question coverage is not uniformly valuable

| Paper | Objective marks | Written marks | Bank alignment |
| --- | ---: | ---: | --- |
| SPMS | 75 (all) | 0 | 219 MCQs and 28 MSQs; both sections fill |
| SCLM | 56 (A + C) | 24 (numerical) | 160 MCQs, 28 matches and 8 numericals; all sections fill |
| BRGSA | 40 | 40 | 78 MCQs, 29 case-clozes and 68 written prompts |
| **IBM** | **0** | **100** | **167 rotating framework/case prompts plus 10 fixed released-case responses** |

**IBM is the reversal.** Its paper is ten written answers on one released prompt, so authoring more
MCQs does not add exam marks. Layer and framework records carry written practice; bounded concepts
remain objective-only by the adopted idea taxonomy. The fixed Released case paper now practises the
actual brief. The numbered coverage cycle stays separate because repeating one memorised model
cannot replace transfer practice across the course.

### Two alignment defects to check in the existing bank

1. **BRGSA self-containment.** The paper guarantees no brand figure has to be recalled. Bank items
   that require remembering a Clairo or Zoko number are training a skill the exam explicitly does
   not test. Teaching *with* those numbers is fine; *testing* recall of them is not.
2. **SCLM numerical weight.** Section B is 24 marks of computation, and standard normal tables being
   supplied points at safety stock, service levels, and newsvendor. The eight available numericals
   fill the paper but still cluster around four lectures: exponential smoothing (M02-L06), EOQ
   (M03-L03), newsvendor (M03-L05), and the worked numerical session (M03-L06).

### Behaviour the app should now teach

SPMS Section B is the only negatively marked section: +1 per correct option, −1 per wrong, floored
at zero per question. Selecting every option is strictly bad; selecting only options you are
confident in is rational. That is a strategy the app can teach directly, and it makes the existing
confidence sampling more than a research instrument.

## Claim boundary after this file

`EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` is **closed**. Sections, counts, marks, duration, negative
marking, and calculator rules may now be stated as fact, citing this file.

Still not claimable: the ten examination questions, difficulty, topic weighting inside a section,
a likely score, or a pass probability. The released IBM prompt is known; the questions the faculty
will ask about it are not.
