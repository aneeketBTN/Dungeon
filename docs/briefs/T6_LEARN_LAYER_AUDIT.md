# The Learn layer, audited from a cold start

**Date:** 2026-08-17 · **Branch:** `fix/theme-switch-and-login-theming` · **Status:** audit only, nothing changed

The question asked was whether Dungeon's Learn layer is down, from the position of a learner
cramming for an exam a week out who has **never opened the topic**. The answer is that Learn is
not broken — it is **half-built, and it does not say so**. The teaching that exists is good. There
is roughly half as much of it as the course examines, and the surface built for reading it is
filed under "Everything else".

Measured against the owner-supplied course material in `docs/course-material/` (gitignored at
`.gitignore:43`; nothing tracked, nothing extracted into the repo).

---

## The headline

**Learn teaches 140 of the 360 named ideas that appear in the course's own revision notes — 39%.**

| Subject | Named ideas in course notes | Taught by Learn | Never taught | Coverage |
|---|---:|---:|---:|---:|
| BRGSA | 69 | 54 | 15 | **78%** |
| SPMS | 116 | 42 | 74 | **36%** |
| SCLM | 84 | 27 | 57 | **32%** |
| IBM | 91 | 17 | 74 | **19%** |
| **All four** | **360** | **140** | **220** | **39%** |

Method: every named idea (acronym, capitalised framework, or distinctive term) in the eight
per-module revision sheets each subject supplies. An idea counts as *taught* only if a learner
reading nothing but Dungeon would meet that name anywhere in that subject's lesson prose,
objectives, worked examples, glossary or handoffs. Document furniture ("Purpose", "Goal",
"Definition") is excluded.

> **This number was corrected twice before it was trusted, and both corrections mattered.**
> The first pass reported 49%. Turning the measurement into a committed tool
> (`tools/measure-syllabus-coverage.mjs`) surfaced three matching bugs, every one of which
> *inflated* coverage: substring matching put RICE inside "price" and SAM inside "same";
> scattered-token matching let four ordinary words match four unrelated sentences, so the bank's
> largest untaught idea read as taught; and stripping interior function words turned "Jobs to Be
> Done" — a lesson title — into "jobs done" and reported it untaught. Reported coverage moved
> 63% → 61% → 36% → 39% across those fixes. The figures above are post-fix, with curated term
> lists, verified against ten hand-checked controls, and reproducible with `npm run check:syllabus`.
> The tool is the authority; this document is a snapshot of it.

The pattern is not random. It tracks lesson depth exactly:

| Subject | Lessons | Lessons per module | Explainer words | Coverage |
|---|---:|---:|---:|---:|
| BRGSA | 50 | 6–7 | 7,459 | 78% |
| SPMS | 16 | 2 | 4,051 | 36% |
| SCLM | 17 | 2 | 4,506 | 32% |
| IBM | 24 | 2 (10 in M1) | 4,593 | 19% |

BRGSA was authored at six lectures per module and reaches 88%. The other three were authored at
two and land between 20% and 54%. `app/sets/t6_lessons.js`'s own header says so: *"BRGSA complete
— 50 lectures, 8 modules. IBM, SCLM, and SPMS outstanding (233 lectures)."* The file is honest.
**The product never repeats that honesty to the learner**, who is told "0 of 16 concepts" as
though 16 were the whole subject.

`app/t6.js:3860` states the gap outright in a comment:

> the course has fifty-odd lectures per subject and the bank cites sixteen, so the numbers are
> necessarily sparse … it cannot be the headline, because as a headline it reads as a gap.

That was the right call for the kicker and the wrong call for the product. The number was hidden;
the gap was not closed.

---

## What a cold learner actually gets

Reading the entire teaching layer for one subject, at 200 wpm:

| Subject | Total teaching words | Read the whole subject in | Exam |
|---|---:|---:|---|
| SPMS | 6,469 | **32 minutes** | 120 min, Aug 22 |
| IBM | 7,079 | **35 minutes** | Aug 23 |
| SCLM | 7,848 | **39 minutes** | Aug 23 |
| BRGSA | 12,565 | **63 minutes** | Aug 22 |

Thirty-two minutes of reading is everything Dungeon has to say about Software Product Management.
The course's own detailed notes for SPMS run to 105 pages, its revision sheets to eight, and the
public notes companion for the same paper carries 33,162 words and 128 tables — **more in its
Module 1 alone (4,731 words) than Dungeon's entire eight-module SPMS explainer (4,051)**.

### The first module is the worst-hit, and that is the one a cold learner opens first

The course's SPMS Module 1 revision sheet has seven clusters. Dungeon teaches two of them.

| Course Module 1 cluster | In Dungeon? |
|---|---|
| Core concepts of SPM; product vs project; the evolution eras | **No** |
| Physical vs software products (marginal cost, iteration, feedback) | **No** |
| Product architecture: embedded / platform / line / family | **No** |
| DFV framework | Yes |
| Startups & MVP: definition, types, discovery→validation→growth→scale | **No** |
| Product thinking; Need ≠ Value; `Value = Benefits − (Money+Time+Effort+Risk)` | **No** |
| Customer discovery & JTBD | Yes |

SCLM Module 1 repeats the shape: **a learner finishes Dungeon's SCLM Module 1 without ever being
told what a supply chain is.** Absent: the definition itself, the three flows (material,
information, funds), the decision phases (design/planning/operations), the cycle view, ROA
decomposition, and the cash-to-cash cycle (`C2C = DIO + DSO − DPO`). Present: strategic fit and
the six drivers.

Whole modules are empty at the end of the syllabus, where revision runs out of time:

- **SCLM M6** — Own Your Wagon, Engine on Load, systemic bottlenecks: **0 of 3**
- **SCLM M7** — Landlord Port Model, PM Gati Shakti, ULIP, Dedicated Freight Corridors: **0 of 4**
- **SCLM M8** — Postponement, Kitting, Cross-Docking: **0 of 3**
- **IBM M5, M6** — SELCO, LabourNet, waste enterprise specifics: **0 of 8 and 0 of 9**

These are not subtle. Cross-docking and postponement are standard examinable terms.

---

## Three defects worth naming

### 1. Questions test what no lesson teaches, and LAW-47 cannot see it

| Idea | Lessons teaching it | Questions testing it |
|---|---:|---:|
| RICE prioritisation | **0** | **20** |
| Requirements traceability | **0** | **23** |
| Vanity metrics | **0** | **13** |

The SPMS concept is literally named *"MoSCoW and RICE prioritisation"*. Its lesson is
*"Prioritisation: MoSCoW"*. The word RICE never appears in any SPMS lesson, and twenty questions
ask about it — including `spms_priority_explain`, whose options begin "MoSCoW and RICE
prioritisation: …".

LAW-47 passes because it checks *lecture citation*: the question cites a lecture id, a lesson
exists at that id, gate satisfied. **It never checks that the lesson's prose contains the thing
the question asks about.** This is the same shape the repository already recorded once — T1's
`smoke_signal` finding, where "LAW-47 structurally cannot see it" — now reproduced at a scale of
56 questions across three ideas.

Systematically, **13 of 48 catalog concepts** carry a name whose distinctive words never appear in
their own lesson. Some are harmless synonym drift ("Shared value" vs a lesson titled "Can
businesses truly share value"; "Privacy by design" vs GDPR's "data protection by design", which
the lesson does define). Three are real teaching gaps: RICE, traceability, and the
actionable-vs-vanity metric contrast.

### 2. Nineteen lessons describe a picture the product never draws

`0` of 107 lessons carry an image, table, chart or SVG. Nineteen invoke one in prose:

- `SPMS-M01-L05` — *"Three areas drawn as a **Venn diagram**"*, and no Venn diagram is drawn.
- `SPMS-M03-L06` — the Lean **Canvas**, a nine-box grid, with no grid.
- `SCLM-M03-L06` — safety stock and reorder point, *"the table"*, with no table.
- `BRGSA-M03-L02` — *"reading retention **curves**"*, with no curve.

The course material is the opposite: the supplied SPMS revision notes are built on comparison
tables, and the public notes companion for the same syllabus uses 128 of them. For frameworks that
*are* a shape — a Venn, a canvas, a 2×2, a cost-responsiveness frontier — prose alone is the wrong
container, and the lessons admit it by naming the shape.

### 3. The reading surface is filed under "Everything else", and reading it earns nothing

The user's instinct was right. Measured on a 375px phone, on a fresh profile:

| | |
|---|---:|
| Where the reading surface begins | **7,096px** down a 10,402px page |
| Scrolling to reach it | **8.7 screens** |
| Section it sits in | **"4 — EVERYTHING ELSE → Additional resources"** |
| Lesson rows, all collapsed by default | 16 |
| Clicks to read one subject end to end | **17** |
| Print stylesheet (`@media print`) | **none** |
| Search across lessons | **none** |
| Expand-all / continuous reading mode | **none** |

And the surface's own first line reads:

> Nothing here is scored and nothing is recorded. Reading a lesson in practice marks it taught;
> reading it here does not.

Verified in code: `markLessonRead` has exactly one call site, `app/t6.js:3908`, inside
`renderLesson` — the in-run surface. The index calls `appendLessonBody`, which records nothing.

So a learner who reads all sixteen SPMS lessons — every word Dungeon has — still sees **"0 of 16
concepts taught"** and a dashboard of zeroes. The one product surface built for reading is the one
the progress model refuses to count. For a crammer whose whole strategy is *read the notes fast*,
the product's answer is that reading is not studying.

---

## What is genuinely good, and should not be disturbed

This is a half-built layer, not a bad one.

- **Teach-before-test holds.** The recommended run opens on a lesson, not a question. Verified live.
- **The prose is well made.** Concrete, specific, unhedged, and glossed at point of use. The DFV
  lesson explains the space-travel case and the unsustainable-product intersection properly.
- **The ladder is real and legible.** "Step 1 of 8 … rests on the 2 concepts before it" is exactly
  the layering the product promises, and the ordering is gated at 0 descents.
- **The worked example and glossary are the right shape**, and every one of the 107 lessons has both.
- **BRGSA proves the model works at depth.** At six lectures per module it reaches 88% coverage.
  The fix for the other three subjects is not a redesign; it is the same authoring, continued.

---

## Honest limits of this audit

- **204 pages of the supplied detailed notes carry no extractable text**, and OCR only partly
  fixed that. Tesseract 5.4 was run over all nine files at 300 dpi on 2026-08-17 and recovered
  20,390 words, but almost all of it is unusable: **seven of the nine are photographs of
  handwritten notebooks** (all four IBM files, SCLM Modules 1–5), which no conventional OCR engine
  reads. Scoring the output by the share of tokens that are ordinary English words: SPMS module 2
  **21.2%** and module 1 **7.8%** — those two are slide decks and are usable — against **1.7–3.9%**
  for the seven handwritten files, which is noise. Those pages are perfectly legible to a human or
  a vision model and remain the right source for authoring; they are simply not machine-extractable.
  Coverage for those modules was therefore measured against the revision sheets and CLAs only.
  IBM's 19% rests on the thinnest ground truth of the four and could move in either direction.
- **BRGSA detailed notes for M5–M7 are Notion links**, not files; the eight revision sheets carried
  the measurement instead.
- **Term matching is lexical.** An idea taught thoroughly under a different name reads as absent.
  Every claim in "Three defects" above was re-checked by hand against the lesson text; the
  aggregate 49% has not been hand-checked term by term and should be read as a strong estimate,
  not a certified count. Two false positives were found and removed during exactly this check.
- **`iimbdbe.rahulkhatri.com` is a third party's site** with no connection to this repo. It is
  cited here only as evidence of the standard a notes surface for this syllabus can reach. It is
  not a content source, and nothing should be copied from it.
- No fix has been applied. Nothing was merged or deployed.

---

## Reproducing the measurements

Four scripts were written to the session scratchpad (outside the repo, so no course material can
reach git). None writes to the repository:

| Script | Produces |
|---|---|
| `measure-lessons.mjs` | lesson counts, prose volume, per-module distribution |
| `measure-gaps.mjs` | visual-language sweep, concept→lesson coverage, reading times |
| `extract-course.py` | text extraction from all 68 readable course files; flags the scanned ones |
| `syllabus-crossref2.mjs` | the 358-term cross-reference behind the headline table |

The recommended permanent home for the last of these is `tools/measure-syllabus-coverage.mjs`,
reading a committed term list rather than the course material itself — see fix **A1** in
`T6_LEARN_LAYER_FIXES.md`.
