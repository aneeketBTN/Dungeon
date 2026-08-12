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

### Two required formats do not exist in the app

The app supports MCQ, cloze, case-cloze, match, short-answer, and three-step boss. It has **no
multiple-select and no numeric-entry** surface.

| Missing format | Paper | Marks | Share of that paper |
| --- | --- | ---: | ---: |
| MSQ, negatively marked | SPMS Sec B | 40 | **53%** |
| Numerical, tolerance-graded | SCLM Sec B | 24 | **30%** |
| | | **64** | |

Building these two formats is worth more than any amount of additional MCQ authoring.

### Objective-question coverage is not uniformly valuable

| Paper | Objective marks | Written marks | Bank alignment |
| --- | ---: | ---: | --- |
| SPMS | 75 (all) | 0 | MCQ half covered; MSQ half absent |
| SCLM | 56 (A + C) | 24 (numerical) | MCQ and match covered; numerical absent |
| BRGSA | 40 | 40 | MCQ covered; written practice is self-review only |
| **IBM** | **0** | **100** | **196 MCQ-derived surfaces contribute nothing** |

**IBM is the reversal.** Its paper is ten written answers on a caselet released two days prior.
Authoring MCQs for its 62 uncited lectures would add zero marks. What helps is framework fluency and
structured written answers against an unseen case.

### Two alignment defects to check in the existing bank

1. **BRGSA self-containment.** The paper guarantees no brand figure has to be recalled. Bank items
   that require remembering a Clairo or Zoko number are training a skill the exam explicitly does
   not test. Teaching *with* those numbers is fine; *testing* recall of them is not.
2. **SCLM numerical weight.** Section B is 24 marks of computation, and standard normal tables being
   supplied points at safety stock, service levels, and newsvendor. Only 3 of SCLM's 16 cited
   lectures currently carry arithmetic — exponential smoothing (M02-L06), EOQ (M03-L03), and
   newsvendor (M03-L05).

### Behaviour the app should now teach

SPMS Section B is the only negatively marked section: +1 per correct option, −1 per wrong, floored
at zero per question. Selecting every option is strictly bad; selecting only options you are
confident in is rational. That is a strategy the app can teach directly, and it makes the existing
confidence sampling more than a research instrument.

## Claim boundary after this file

`EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` is **closed**. Sections, counts, marks, duration, negative
marking, and calculator rules may now be stated as fact, citing this file.

Still not claimable: question content, difficulty, topic weighting inside a section, the IBM
caselet's subject, a likely score, or a pass probability. Knowing the shape of a paper is not
knowing what is on it.
