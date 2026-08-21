# Building the testing layer — what to author, in what order, and what it actually costs

**Written 2026-08-19** on branch `fix/theme-switch-and-login-theming`, against the working tree
after SPMS modules 6, 7 and 8 were completed. This is the level below
`docs/briefs/DUNGEON_VISION_TO_BUILD.md`: that file decided *what* Phase 2 is and that importance
orders it, this one measures the queue and says how a batch is actually run.

`AGENTS.md` outranks both. **`LAW-72` applies to this file** — a self-contained brief becomes a
second source of truth and drifts. Every number below has the command that produced it printed
beside it. Re-run before trusting any of them, and treat a disagreement as this file being stale.

**Continuation status — 2026-08-20.** Streams A–C now report 100% for all four subjects: BRGSA
69/69, IBM 90/90, SCLM 84/84 and SPMS 116/116 named ideas. The bank holds 219 concepts and 2,827
questions; all concepts are linked. IBM's historical descoping below was superseded by explicit
owner direction: its 73 misses became 69 new classified records and four wording repairs on
existing layers. Layer ideas receive subjective + MCQ practice, named frameworks subjective-only,
and bounded concepts MCQ-only. Generic lesson-grounded cases teach transfer without claiming to
know what was then the unreleased examination case. The 2026-08-21 brief now lives in a separate
fixed paper and does not alter this taxonomy. Teaching delivery is now 283/283 scheduled with zero
readable-only entries. This does **not** close Stream D: phrase coverage is not one trackable record
per idea or equal practice depth.

---

## 1. What the mirror gate told us at the 2026-08-19 baseline

`npm run check:tested` reported 35% when Phase 1 shipped. That number was true and it
is also the least useful form of the finding, because it merges three kinds of miss that need
completely different work. `--triage` splits them:

```bash
node tools/check-taught-not-tested.mjs --triage
```

| subject | ideas | missing | drift | partial | absent |
| --- | ---: | ---: | ---: | ---: | ---: |
| BRGSA | 69 | 23 | 8 | 14 | **1** |
| SCLM | 84 | 56 | 10 | 35 | **11** |
| SPMS | 116 | 81 | 17 | 49 | **15** |
| **in scope** | **269** | **160** | **35** | **98** | **27** |
| *IBM (descoped)* | *90* | *73* | *4* | *45* | *24* |
| *all four* | *359* | *233* | *39* | *143* | *51* |

**IBM is descoped by owner direction, 2026-08-19** — *"we can forget IBM for now."* It is kept in
the table because removing it is the single biggest change to this plan's shape: IBM carried **73
of the 233** misses and **24 of the 51** genuine zeros, the largest block in every column, and it
is the one paper where an objective question earns nothing at all (§2). Nothing was deleted —
`--written` remains in the importance tool for when it returns.

**In scope, only 27 of the 160 misses are genuine zeros, and coverage starts at 41%, not 35%.**
The headline implies hundreds of ideas nobody tests; the measurement says **27**, with 133 the bank
already reaches under a name the syllabus does not use, or reaches partially.

That reframes the cost. The vision doc's ~2,000–4,000 new questions is the cost of **depth** —
8–14 surfaces for every idea, each with a `chain` position and an authored `linkedConceptIds`
pairing. It is not the cost of **coverage**, which is a much smaller and differently-shaped job.

### The distinction that has to hold, or this becomes gaming

Fixing drift moves the gate's number without necessarily changing what a learner meets. That makes
it the most dangerous work in this plan, so the boundary is drawn here and it is not negotiable:

- **Legitimate:** a question genuinely tests an idea and calls it something else; rewrite the
  question's own wording to use the course's term. The learner should meet the exam's vocabulary —
  that is a real improvement, not a cosmetic one.
- **Forbidden:** adding an alias to `data/syllabus/*.terms.json` so a term reads as reached, or
  lowering a floor in `tested-floors.json`. That is the exact move the coverage ratchet exists to
  prevent, and this repository has already refused it twice under `check:syllabus`.

An alias is correct only when the idea genuinely has two names in the course — `Quality
requirements` / `NFR` is a real alias pair. "The bank says X and the syllabus says Y so I will
declare them synonyms" is not.

**Every drift repair must state which question was reworded.** If a batch cannot name the
questions it touched, it did not repair drift; it moved a number.

---

## 2. Importance is measured, against the owner's own definition of it

Owner direction, 2026-08-19, verbatim:

> *"terms and concepts that repeat get importance, especially if theyre tied to a foundational
> concept + if theyre numerical. Basically frameworks, logic gates, anything multi step is
> important."*

That is four signals, and the tool implements those four and nothing else:

```bash
npm run measure:importance -- "<Term 6 Clean Transcripts>"
npm run measure:importance -- "<transcripts>" --course SPMS --module 6
npm run measure:importance -- "<transcripts>" --written          # orders IBM; see below
npm run measure:importance -- "<transcripts>" --why "Lean Canvas"
```

`importance = mark share × (0.30 repetition + 0.20 foundational-tie + 0.25 numerical + 0.25 multi-step)`

Numerical and multi-step carry **half the weight between them**, because *"frameworks, logic
gates, anything multi step is important"* is the direction's own summary of itself. Every
component prints beside the score, and `--why` dumps one idea in full — a number you cannot argue
with is a number nobody will correct.

It is a **measurement, not a gate** (`LAW-75` — a gate calibrated on the population it polices
sets its bar where the defects already are). It exits 0 always. Nothing fails on it.

### Two components were measured, found degenerate, and changed — record kept

Both failures had the same shape: a plausible proxy that turned out not to discriminate.

- **Lecture-granularity foundational tie: 78% of all non-IBM ideas scored a flat 100.** Of course
  they did — a subject's foundational concepts are in most of its lectures by definition, so
  "shares a lecture with `Startup`" is true of nearly everything in SPMS. Twenty per cent of the
  weight was doing no work. Re-measured inside an **800-character window** around each mention it
  gives p10 0 / p50 ~43 / p90 100, and separates real cases: `Supply chain surplus` and
  `Responsive supply chain` tie tightly to `Supply chain`; `exponential smoothing`, `MAPE` and
  `ABC classification` tie loosely because they are self-contained techniques. Correct for both —
  a numerical technique earns importance from signal 3, not this one.
- **"Step" vocabulary was measured and then deleted.** `first`, `then`, `next`, `stage` run at
  9–15 per thousand words across *every* lecture in the course, numerical and conceptual alike.
  That is how people talk. It discriminated nothing, and keeping it would have added noise wearing
  the shape of evidence. Multi-step is carried by framework vocabulary (`framework`, `canvas`,
  `cycle`, `matrix`, `funnel`, `quadrant`…) plus the term's own name.

A third correction is in the tool's header and is the oldest trap in this repository: a substring
probe matched `RICE` in 126 SPMS sentences, every one of them the word **price**. Whole words only.

### What it surfaces, as a check that it works

| head of | ideas |
| --- | --- |
| **numerical** | Payback period, Gross margin, Customer acquisition cost, Sample size, Unit economics, MAD, MAPE, exponential smoothing, multiplicative model |
| **multi-step** | Lean Canvas, Master loop, Value proposition canvas, Lifecycle engagement, Inverted pyramid, Requirement lifecycle, Replenishment cycle, Kano model, B2C value pyramid |

`Multiplicative model` scores high on both (num 80, step 72), which is right — it is a numerical
framework.

### Foundational concepts rank, and are also the yardstick

Sixteen ideas sit in more than half their subject's lectures and are marked `[foundational]`:
`Startup`, `Software product management`, `Business model`, `Supply chain`, `Logistics` and so on.
They **rank on their own repetition** — "terms and concepts that repeat get importance" — and they
are simultaneously the measuring stick for every other idea's foundational-tie score.

*(An earlier cut of this tool set them aside as "background vocabulary" on the grounds that
ubiquity is not importance. That was an over-correction and the owner reversed it. Repetition is a
real signal; what it needed was three other signals beside it, not suppression.)*

### Why IBM was descoped, and why the ranking said so first

From `docs/briefs/T6_EXAM_PATTERN.md`, whose claim boundary is closed:

| paper | objective marks | of total |
| --- | ---: | ---: |
| SPMS | 75 | 75 |
| SCLM | 56 | 80 |
| BRGSA | 40 | 80 |
| **IBM** | **0** | **100** |

IBM is ten written answers on a caselet released two days before the exam. **It has no objective
section at all** — and it also has the lowest tested-coverage of the four subjects, at 19%. The
owner descoped it on 2026-08-19, which is the same conclusion the mark-weighted ranking had already
reached from the other direction.

So "fix the worst number first" would have directed the single largest block of new MCQ authoring
— 73 missing ideas, 24 of them genuine zeros — into the one paper where an MCQ earns zero marks.
Mark weight is what stops that, and it is the main reason the ranking had to exist before
authoring rather than after.

**IBM's Phase 2 work is written-answer work**, not bank work: framework fluency and structured
responses against an unseen case. Its 19% will stay low and that is the correct outcome, not a
regression. Anyone raising the IBM floor by authoring MCQs is optimising the gate against the exam.

### `--written` is what orders IBM

Because the default scale is objective marks, **every IBM row scores 0** — correct for bank
authoring and useless for IBM's actual work. `--written` flips to the written column (IBM 100,
BRGSA 40, SCLM 24, SPMS 0) and ranks the same four signals against it. Under it IBM orders as
`Inclusive business`, `Open-source innovation`, `Bottom of the pyramid`, `Inverted pyramid` —
framework-forward, which is exactly what ten written answers on an unseen caselet reward.

Use the default to order bank authoring, `--written` to order IBM's and BRGSA's written prompts.

### Still wanted from the owner

Corrections are written as `"importance": <number>` on the term's entry in
`data/syllabus/<SUBJ>.terms.json`. An authored value always wins over the derivation and reports
as `owner`. Nothing else in the repository reads the field yet — that is Phase 4's job.

1. **Does the ranked head match your judgement of what the papers reward?** The derivation is four
   signals and a weighting; the weighting in particular (30/20/25/25) is a reading of your
   direction, not a measurement.
2. **`--why "<term>"`** dumps any single idea's components, the foundational concepts it sits
   beside, and the lectures it appears in — the quickest way to check whether a placement is
   defensible before ~3,000 questions are ordered by it.

---

## 3. The four work streams, in order

Each ships something usable alone. The order is by cost-per-idea, not by size.

### Stream A — drift repair (39 ideas, no new questions)

Rewrite existing question wording to use the course's term where the question already tests the
idea. Cheapest work in the plan and the only stream that needs no new content. Bound by
`CONTENT-RULES.md` **R11** and by §1's boundary above.

Expected effect: 126 → ~165 of 359 (35% → 46%). **State it honestly when reporting** — this
corrects the measurement, it does not add teaching-to-testing coverage. The instrument was
misreading; a misreading instrument misdirects every stream below it, which is why this goes first.

### Stream B — partial resolution (143 ideas, read then edit)

Some words appear, the phrase does not. Each needs the item read before deciding: some are Stream A
in disguise, some need a surface added, some are genuine holes wearing a partial mask. **Do not
queue these in bulk** — the triage output says so and it is right.

### Stream C — genuine authoring (51 ideas)

The real zeros. Author in importance order, skipping IBM's 24 unless the surface is a written
prompt rather than an MCQ. That leaves roughly **27 objective-bearing zeros** across SPMS, SCLM and
BRGSA as the true new-question queue for coverage — a very different number from 233.

### Stream D — the concept spine (the expensive, structural one)

Everything above moves *coverage*. None of it moves **depth**, and depth is what owner decision 2
bought: a concept is finished when it has a `chain` position and at least one authored
`linkedConceptIds` pairing that `groupWeaknesses()` can use. That is the ~2,000–4,000 questions,
and it is ordered by the ranking in §2.

**Streams A–C do not substitute for D and must not be reported as if they do.** A syllabus idea
the bank *names* is not a concept the product can track mastery on.

**Stream D is now specified in its own document** — `docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md`. Three
things it establishes that change this section: a concept is a **record of six sentences that
generates ~10–16 surfaces**, so the unit here is **~295 records** rather than ~3,000 questions;
**`chain` and `linkedConceptIds` are not authorable fields**, so "finished when it links" means a
question carrying `supportingConceptIds`; and **three things break at the 65th concept**, one of
which is a code fix (`pair.slice(0, 2)`) that gates all the rest. Do not start Stream D from this
page.

---

## 4. Worked example — SPMS module 6, taught in full today

Module 6 gained five lessons and a composite repair on 2026-08-19
(`evidence/2026-08-19/t6-spms-m06-complete/verification.md`). It is now taught end to end, which
makes it the natural first batch and a useful test of this plan.

| importance | tested today | idea | rep | fnd | num | stp |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 43.8 | **drift** | Product planning | 38 | 61 | 20 | 61 |
| 33.6 | **drift** | Release planning | 28 | 30 | 19 | 57 |
| 30.6 | partial | Data-driven planning | 11 | 42 | 23 | 52 |
| 30.2 | partial | Change control board | 2 | 67 | 53 | 11 |
| 26.9 | partial | Requirements-driven planning | 10 | 25 | 26 | 50 |
| 25.4 | named | Verification versus validation | 40 | 22 | 20 | 16 |
| 20.9 | partial | Requirement lifecycle | 1 | 0 | 4 | 79 |
| 20.8 | **drift** | Requirements engineering | 23 | 27 | 21 | 13 |
| 20.6 | partial | Heartbeat principle | 1 | 20 | 50 | 15 |
| 19.9 | partial | Requirements elicitation | 6 | 45 | 18 | 18 |
| 16.8 | named | Functional requirements | 15 | 15 | 21 | 17 |
| 14.7 | named | Traceability | 4 | 33 | 13 | 15 |
| 14.6 | named | Triage | 5 | 0 | 27 | 25 |
| 13.2 | named | Quality requirements | 14 | 12 | 14 | 13 |

**5 named, 3 drift, 6 partial, and zero absent.** The two highest-importance untested ideas —
`Product planning` and `Release planning` — are both **drift**, so the cheapest first batch is also
the highest-value one. That is not a coincidence: an idea the course returns to is an idea the bank
was already likely to reach under some name.

Three things this table makes visible:

- **`Requirement lifecycle` occurs 0 times in the whole course**, yet scores multi-step **79** and
  ranks mid-table. Both are right, and the disagreement is by design: this tool matches an idea's
  *distinctive tokens* (a lecture carrying "requirement" and "lifecycle" counts), while
  `check-taught-not-tested` requires the **contiguous phrase**. So an idea can be important and
  read as untested at once. No wording fix closes this one, because there is no course wording to
  match — it is a syllabus-sheet phrase carried in `M06-L09`'s prose, the same case as `Team roles`.
  Flag it for the owner; do not invent the phrase into a question.
- **Multi-step scoring reordered the module, correctly.** Under the first derivation
  `Requirement lifecycle` sat bottom at 8.0 and `Change control board` at 11.7. They are a staged
  process and a decision procedure respectively — exactly *"frameworks, logic gates, anything multi
  step"* — and now rank 20.9 and 30.2. The owner's direction changed the answer here, not just the
  formula.
- **Low importance is not low value.** `Heartbeat principle` scores 20.6 off a single lecture. It
  is still an ISPMA-named concept a paper can ask about directly. Importance orders the queue; it
  never removes anything from it (owner decision 3, and §6 of the vision doc is explicit that
  weight changes frequency, never eligibility).

---

## 5. New content still owed on the teaching side

**None. The teaching layer is complete as of 2026-08-19** — 283 lectures, 283 taught, all four
subjects reported `COMPLETE`. Every remaining gap in this plan is a *testing* gap, not a teaching
one.

```bash
node tools/check_lesson_file.mjs "<transcripts>"      # live list; trust this over any table
```

That changes what this plan is for. Until now "new content still owed" meant lessons; from here it
means **questions and concepts only**, and the streams in §3 are the whole of the remaining work.

The forced-order rule still applies and has now paid out four times: **a composite is only
rewritable once the lectures it borrowed from have lessons.** Run the Step 4c sweep in
`docs/authoring/LESSON-AUTHORING-PROTOCOL.md` before each batch — its query was corrected on
2026-08-19 after it failed to catch `SPMS-M06-L01`, and the ~28 rows it now returns across all four
subjects are an unread reading queue.

**A second `connects` defect has its own signature, and it is cheaper to check than any gate.**
Module 7 carried two consecutive handoffs promising a lecture nobody had authored yet: each author
wrote a pointer to the next lesson **in the file** rather than the next lecture **in the course**.
That is self-reinforcing, because an unauthored lecture is invisible in the lesson file, so every
neighbouring handoff written from the file skips it. Read the module's lecture list before writing
a `connects`.

**The sweep now leads on own support, not on margin.** Three composites in one day sat below
successive margin floors — `M06-L01` at −0.011, then `M08-L08` at −0.074, outside even the widened
`>-0.06`. A composite splits its vocabulary between two lectures, so **own support collapses
reliably while the margin lands wherever the borrowed half falls**. Sort by own support, read the
bottom, and use margin only to explain what you find. Two structural cases give low own support
innocently and were confirmed by reading: a **"Part 2" lecture** shares vocabulary with its Part 1,
and a **synthesis lecture** that spans the subject is distinctive against none of it.

**And one class of defect no content gate can see.** Mojibake in lesson prose — eight em-dashes
mangled by a shell/Python escape round-trip — passed `check_lesson_file`, the bank validator, the
match gate, all three ratchets, `npm test` and the build, because every one of them parses the
JavaScript rather than the rendered output. Only opening the lesson in the running app showed it.
That is the second Step-5-only defect found in a single session, after literal `**` markdown.

---

## 6. How every number here was produced

```bash
node tools/check-taught-not-tested.mjs --triage                     # §1 table
npm run measure:importance -- "<transcripts>"                       # §2 and §4 scores
npm run measure:importance -- "<transcripts>" --json                # machine-readable
node tools/check_lesson_file.mjs "<transcripts>"                    # §5 backlog
node tools/check-lesson-lecture-match.mjs "<transcripts>" --calibrate
npm test && node tools/build-site.mjs
```

Mark weights in §2 are restated from `docs/briefs/T6_EXAM_PATTERN.md` and are the one constant a
human must maintain — they live in `OBJECTIVE_MARKS` at the top of
`tools/measure-concept-importance.mjs`. If the paper pattern changes, change both.

---

## 7. What this plan does not cover

- Phase 3 (making the loop visible) and Phase 4 (weighted rotating mocks) — both wait on Stream D's
  pool, and Phase 3's own instruction is to measure what the existing state can already answer
  before building any surface.
- The owner's per-lesson Phase 0 reading, which is optional rather than blocking since the
  2026-08-19 acceptance.
- The linkage input is **co-occurrence inside a lecture**, which is a proxy. Real linkage is an
  authored `linkedConceptIds` pairing, and until Stream D creates those there is nothing better to
  measure. Labelled as a proxy in the tool and here.
