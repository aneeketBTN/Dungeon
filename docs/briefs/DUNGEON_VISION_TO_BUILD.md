# Dungeon — from the four promises to a built product

**Status: ADOPTED 2026-08-19.** All four owner decisions in §6 are answered and are policy;
Phase 1 is built and binding. Written 2026-08-18 against the working tree on
`fix/theme-switch-and-login-theming`, decisions recorded 2026-08-19.

**The decisions changed the plan's shape, not just its go-ahead.** The tiered concept spine is
rejected, scope is the entire course at depth, acceptance is per-lesson, and uncited lectures are
no longer optional — so §4's phases below are rewritten against those answers, and the cost is
stated in §6 rather than left implicit.

This is a route from the standing brief to a product that keeps it. It is deliberately **not** a
second source of truth: every number below was measured today with a named command, and where a
contract already exists this file points at it rather than restating it. `AGENTS.md` outranks this
document; `docs/governance/DESIGN_SOURCE_INDEX.md` owns the authority order. `LAW-72` exists because
a self-contained brief drifts from the ledger — so re-run the measurements before trusting a figure
here, and treat a disagreement as this file being stale.

**Progress — 2026-08-20.** The mirror-coverage gap is closed across the whole course: all four
subjects and all 359 named syllabus ideas now read 100%. The bank is **219 concepts and 2,827
questions**, with every concept linked. IBM's same-day owner direction superseded its pause: 69
new records plus four wording repairs closed its 73-idea queue. Its assessment form is authored as
taxonomy, not guessed from the unreleased case — layer ideas receive written + MCQ practice,
frameworks written-only, and bounded concepts MCQ-only. This is a coverage milestone, not
completion of the adopted depth decision: the 219 records still stand in for 359 named ideas.
Teaching delivery is now 283/283 scheduled with zero readable-only entries. Phase 2 continues with
record depth, repeated transfer and cross-module synthesis inside those constraints.

---

## 1. The four promises

Stated by the owner on 2026-08-15 as the standing brief:

1. **Concepts layer.** A step-by-step system where concepts build on one another, and the sum is
   greater than the parts — so exam questions do not surprise you.
2. **Testing does not feel disconnected.** Each step gives learner and system confidence that
   progress is real and is being tracked.
3. **Tracked data pays off on mistakes** by bringing back the lessons you need — *not* by re-serving
   questions you have already done. Layer material that deepens the topic instead.
4. **The Examiner tests what has been taught.** Verbatim: *"If Examiner feels foreign — that's
   Dungeon Learn's failure."*

---

## 2. Where the product actually stands

Measured 2026-08-18. Commands are in §8 so any of this can be re-derived.

| promise | built | honest verdict |
| --- | --- | --- |
| 1. Concepts layer | `layeredQueue()` commits to the whole owed-lesson list up front and drains it in lecture order, so lesson order is monotonic by construction. `chain` and `linkedConceptIds` exist per subject. | **Held, within the 16 concepts it knows.** |
| 2. Connected testing | Evidence states, sampled confidence, boss steps, per-concept attempt history, `groupWeaknesses()` pairing weak concepts that are actually linked. | **Machinery is real. The learner-facing account of it is thin.** |
| 3. Mistakes pay off | `lessonNeedsReteach()` re-teaches on a post-read failure and `examMissNeedsReteach()` now carries mock misses into the same latch, with a RECOVERED rule so one slip does not re-teach for ever. Questions are ranked by least-recently-attempted, not re-served. | **Held. The earlier defect — a mock miss could never reach the latch — is fixed.** |
| 4. Examiner tests what was taught | LAW-47 holds: 12 routes × 4 subjects, 0 violations. No surface precedes its lesson. | **Held in the narrow sense, and broken in the sense the promise means. See §3.** |

**Promise 4 is the one that is not kept**, and it is not kept in the direction that matters.

---

## 3. The starting structural finding (measured 2026-08-18)

Everything in the product hangs off a **concept**. Questions cite a `conceptId`. Mastery, weakness
pairing, re-teach latches, the primer, and the mock all key on it.

At adoption there were **16 concepts per subject — two per module — and 64 in total.** That number had not moved
while the teaching layer grew to 245 lessons covering all 283 lectures.

| layer | unit | count |
| --- | --- | --- |
| Course | lectures | 283 |
| Syllabus | named examinable ideas | 359 |
| **Teaching** | lessons | **245 — every lecture in BRGSA, IBM, SCLM; 46 of 84 in SPMS** |
| **Testing** | concepts | **64** |
| | questions | 920 (14.4 surfaces per concept) |

Run the same strict phrase test the coverage gate applies to lessons, but point it at the question
bank instead:

| subject | syllabus ideas | reached by lessons | reached by the bank |
| --- | --- | --- | --- |
| BRGSA | 69 | 100% | **67%** |
| IBM | 90 | 100% | **19%** |
| SCLM | 84 | 100% | **33%** |
| SPMS | 116 | 100% | **30%** |
| **all** | **359** | **100%** | **35%** |

**So at adoption: we taught the whole course and tested roughly a third of it.** 146 of the 245 lessons were never
scheduled into any run — they are readable in the lesson index and nothing more.

### What that does to promise 4

The promise is that the Examiner never feels foreign. At that baseline a learner could finish every study set,
sit the mock, score well, and still meet the real paper cold on two-thirds of the syllabus — because
nothing in Dungeon ever asked them about it. That failure mode is invisible to every existing gate:
LAW-47 only checks that what we *do* test was taught first. Nothing checks that what we taught is
ever tested.

**The missing gate is the mirror of the one we have.** That is the cheapest high-value thing in this
plan and it is Phase 1.

### One caution on the 35%

The test is strict: the bank must name the idea the way the syllabus names it, contiguously. A
sample check shows both kinds of miss, and they need different fixes:

- **Naming drift, not absence** — `landing page` appears 15 times and `pre-sale` 23 times in the
  BRGSA bank, but the syllabus calls them *Landing page validation* and *Pre-sales validation*.
- **Genuine zeros** — `A/B testing` and `statistical significance` (BRGSA), `bottom of the pyramid`
  and `last mile` (IBM), `Little's Law` and `cross-docking` (SCLM), `north star`, `AARRR` and `Kano`
  (SPMS). Each of those is taught by a lesson and asked by no question.

Triage the 233-item list into those two buckets before authoring anything. This is the same
distinction that cost four coverage repairs during the misfiled-lesson work — see
`QUALITY-LOG` **I56**.

---

## 4. The plan

Five phases. Each ships something usable on its own; none depends on a later one landing.

### Phase 0 — Accept the teaching material *(owner, blocking)*

95 lessons carry `WAITING_OWNER_CONTENT_ACCEPTANCE` and no human has read them. This gates `DONE`
on the whole teaching layer and it cannot be cleared by a gate.

**Decision 1 settled the protocol: every lesson gets read.** Sampling was offered and rejected, so
there is no spot-read path and no per-module shortcut — acceptance is recorded per lesson. Owner
approval in chat is acceptance; it is explicitly **not** faculty review and creates no
subject-matter authority — the same boundary the `IBM-M02` batch was accepted under.

**Deliverable:** a reading checklist rendered from the lesson file with **one row per lesson**,
grouped by subject and module, carrying the lesson id, title, its lecture, and a state that
persists between sittings — because 95 lessons will not be read in one pass and a checklist that
cannot be resumed will be abandoned. Render it from `app/sets/t6_lessons.js` rather than
maintaining a second list; a checklist that drifts from the lesson file is `LAW-72` again.

**Sequence the reading by importance** (decision 3's ranking), not by module number, so the
lessons carrying the most exam weight are accepted first and a partial pass still releases the
material that matters most.

### Phase 1 — Build the mirror gate *(DONE — built 2026-08-18, wired 2026-08-18)*

**Built and running.** `tools/check-taught-not-tested.mjs --gate` (`npm run check:tested`): for
every named syllabus idea, does any question in the bank name it? Floors are a ratchet baseline in
`data/syllabus/tested-floors.json` (fails on regression only; the target stays 100%), `--triage`
sorts misses into naming drift and genuine holes, and `tests/taught-not-tested.test.mjs` asserts
the gate in both directions — it runs in `npm test`. Question authors are bound to it by
`CONTENT-RULES.md` **R11**.

What it bought: "expand the mocks" is now a work queue with a number that goes up, and promise 4
cannot silently regress. The remaining phases consume it; nothing here is left to build.

### Phase 2 — Widen the concept spine

This is the structural change and the expensive one. A concept is the unit mastery and re-teaching
are tracked on, so covering the course means more concepts, not just more questions.

**The tiering this section used to propose is rejected** (decision 2). There is no Core /
Breadth / Recognition split and no class of idea that gets a thinner treatment because it is
assumed less examinable — decision 4 refuses the division outright. Every named syllabus idea
becomes a concept with enough surfaces to carry a chain position and a re-teach latch: **8–14, not
3–4**. The honest total is in §6.

**Importance is the ordering, and it has to become data.** Decision 3 asks for mocks that
interchange topics by how crucial and how large a concept is, so importance cannot stay a feeling
in an author's head — it needs to be a field on the concept, authored once and used three times:

1. **Authoring order** — the most crucial concepts get their depth first.
2. **Mock composition** — Phase 4 rotates sittings by weight (see below).
3. **Ladder position** — a heavy concept earns more layering around it.

Derive the first cut from evidence rather than taste: marks the paper actually allocates
(`docs/briefs/T6_EXAM_PATTERN.md` is authority for structure), how many lectures touch the idea,
and how many syllabus ideas link to it. Then let the owner correct it — importance is a teaching
judgement and the ranking is worth an owner pass before ~3,000 questions are ordered by it.

**Depth must serve linking, or it is just volume.** The measurable form of decision 2: a new
concept is not finished when it has surfaces, it is finished when it has a `chain` position and at
least one authored `linkedConceptIds` pairing that `groupWeaknesses()` can actually use. That is
what makes the sum greater than the parts, and it is what keeps prep *short* — a learner who sees
how ideas connect needs fewer repetitions, which is the only honest way to reconcile "know
everything" with "quick prep".

### Phase 3 — Make the loop visible

Promise 2 is about the learner's confidence that progress is tracked, and the machinery already
exists. What is missing is the account of it. The memory of this project records the shape:

> the bank was already layered while the product presented it as a flat ten-card menu — the gap was
> almost never content, it was the product failing to say what the bank already knew.

**Expect that shape here too.** Before building anything for Phase 3, measure what the existing
state can already answer — `groupWeaknesses()`, the evidence states, the per-concept history — and
only then design the surface. Candidate surfaces, cheapest first:

1. A per-module strength read on the dashboard, sourced from existing evidence states.
2. "Why this next" on each queued item — the run already knows whether an item is new, a re-teach,
   or a weakness pairing, and says none of it.
3. The stronger/weaker map across a subject's `chain`, which exists and is unrendered.

### Phase 4 — Expand the mocks to the whole paper

**This is where decision 3's second half lands.** Once Phase 2 gives the mock a pool worth
sampling, composition itself must rotate: a sitting draws by **importance weight**, and successive
sittings **interchange** topics so that a learner taking three mocks meets the syllabus rather than
the same 16 concepts three times. `EXAM_PAPERS` already supports section-level `prefer` lists — the
same mechanism that fixed BRGSA Section C drawing three-minute prompts into a ten-mark slot — so
weighted rotation is a composition change over existing machinery, not new machinery.

Two properties the rotation must hold, both of them measurable:

- **Heavy concepts recur; light ones still appear.** Weight changes frequency, never eligibility —
  a concept that can never be drawn is a concept the learner can be taken off guard by, which is
  the exact failure decision 3 names.
- **Across a set of sittings, coverage accumulates.** Draw without replacement across sittings
  rather than independently per sitting, or random resampling will leave holes at any weight.

Add a **coverage report per sitting**: which modules this paper reached, and which it did not, plus
what the learner has now met across all sittings. That is the honest form of promise 4 — an
Examiner surface reporting a shortfall should say whose it is.

### Phase 5 — Finish SPMS

**Completed 2026-08-19; delivery completed 2026-08-20.** The 38-lecture SPMS queue is closed, and
all already-authored uncited lessons stay in the course. Module scheduling now delivers them
without waiting for a question citation; Phase 2 gives their ideas deeper concept records and
repeated transfer rather than deciding whether the teaching can be reached.

Order: M5 (3), then M2/M3/M4 (5 each), M8 (6), M6 and M7 (7 each). Two outliers to plan around — the
Sriraman guest session is 48,232 characters, the longest lecture in the course, and Kittlaus is
21,664.

---

## 5. Sequencing

```
Phase 0  Accept teaching material      owner reads every lesson; blocks DONE, not other phases
Phase 1  Mirror gate                   DONE — built, floored, in npm test, bound by R11
Phase 2  Widen concept spine           the long pole. Rank importance FIRST, then author by it
Phase 3  Make the loop visible         measure before building
Phase 4  Weighted, rotating mocks      needs Phase 2 pool; delivers decision 3's second half
Phase 5  Finish SPMS                   38 lessons; no longer optional (decision 4)
```

Phase 1 before Phase 2 was the load-bearing order and it held: the gate exists, so every Phase 2
batch moves a number and cannot silently regress.

**The new first move is the importance ranking**, because decisions 2 and 3 together make it the
thing that orders ~3,000 questions of work, sequences the owner's reading in Phase 0, and drives
Phase 4's rotation. It is cheap — a field, a derivation from paper marks and link counts, and an
owner pass over the result — and everything downstream is ordered wrongly without it. Do not start
authoring depth before it exists.

---

## 6. Owner decisions — ANSWERED 2026-08-19, adopted

All four were answered in chat. They are policy now, not proposals; where they contradict an
older document, **these win and the older document is the bug**.

1. **Acceptance protocol — every lesson gets read.** Sampling is rejected. Acceptance is
   per-lesson, not per-module, so the Phase 0 deliverable is a checklist with **one row per
   lesson** and no "spot-read the rest" path. Owner approval in chat still is not faculty review
   and creates no subject-matter authority — that boundary is unchanged.
2. **Both breadth and depth — depth is what links concepts.** The tiered 3–4-surface proposal is
   **rejected**. Depth is not a luxury to be traded for coverage here: it is the mechanism behind
   promise 1, because a concept with a handful of shallow surfaces cannot carry a `chain`
   position, a `linkedConceptIds` pairing, or a re-teach latch that means anything. The learner
   constraint is **short, accessible, quick prep** — so depth must show up as *better-linked*
   material, not as longer sittings.
3. **Scope is the entire course, and importance orders it.** Every named syllabus idea, on every
   lecture. Not a subset, not the paper's weighting alone. The second half of this decision is a
   new requirement: **mocks interchange topics by importance** — how crucial and how large a
   concept is — so that sittings rotate across the syllabus rather than resampling the same 16
   concepts. The goal stated verbatim: *the student should never be taken off guard by the test or
   the final exam; they should know everything.*
4. **Uncited lectures are not optional and stay in the course content.** No tiering, no dividing
   the course into what counts and what does not. **If the course teaches it, it gets taught.**
   And where the source material is missing or thin, research it on the web rather than dropping
   the topic — see the provenance rule below, because that one has a gate consequence.

### What decisions 2 + 3 actually cost, stated plainly

Depth at full scope is a much bigger number than the rejected tiering, and it should be seen
before it is started rather than discovered in month two:

| | concepts | surfaces each | questions |
| --- | --- | --- | --- |
| today | 64 | 14.4 | 920 |
| tiered proposal *(rejected)* | ~294 | 3–4 for new | ~1,900 |
| **adopted: everything, at depth** | **~359** | **8–14** | **~2,900–5,000** |

So roughly **2,000–4,000 new questions**. That is not a reason to revisit the decision — it is
the reason decision 3's importance ranking is load-bearing. **Importance does not reduce the
scope; it orders it**, so that at every point the most crucial concepts are the deepest and the
tail is filling in behind them. Partial progress still keeps the promise for what matters most,
and "never taken off guard" arrives by degrees instead of all at once.

### The provenance rule that decision 4 requires

Web research fills a gap in the *source material*, and this repository's content gates are built
on the assumption that every term traces to a transcript: the LAW-49 vocabulary gate scores
glossary headings against the lecture corpus, and `check-lesson-lecture-match` scores a lesson's
distinctive vocabulary against its own lecture. **Web-sourced material will fail both, correctly**,
because from the gate's point of view it is indistinguishable from invented vocabulary.

Two things are therefore forbidden and one is required:

- **Never lower a floor or add an alias to make web-sourced content pass.** That is the exact move
  the coverage ratchet exists to prevent.
- **Never file web-sourced material silently under a `lectureId` as though the lecture said it** —
  that is manufacturing evidence, and `check-lesson-lecture-match` would be scoring a claim the
  transcript cannot support.
- **Required:** mark it. Web-sourced content carries explicit provenance (source and date) and is
  gated as an exception rather than as transcript-derived material. **The mechanism does not exist
  yet** — building it is the first task of any batch that needs it, and until it does, a topic
  whose source is missing gets flagged for the owner rather than filled in from the web.

---

## 7. Traps already paid for

Carried forward so this plan does not re-buy them:

- **Measure whether the structure already exists before adding content.** The flat-menu finding is
  the precedent; Phase 3 is where it is most likely to recur.
- **A gate calibrated on the population it polices sets its bar where the defects already are**
  (`LAW-75`). The mirror gate must be anchored on a confirmed case, not on the bank's distribution.
- **A corpus-relative score moves items you did not touch** (`LAW-76`). Re-run after every batch.
- **Coverage is a ratchet.** If a term falls out when something is rewritten, teach it back where
  the lecture makes it — never add an alias, never lower a floor.
- **A coverage miss is as often naming drift as a hole.** Check which before authoring.
- **Never write a tracked file in a language's text mode** (`LAW-74`).
- **The lesson-lecture match gate cannot see a lesson written from half its own lecture.** Only
  reading the lecture finds that class.

---

## 8. How every number here was produced

```bash
node tools/check_lesson_file.mjs "<transcripts>"          # lessons, per-subject completeness, unscheduled count
node tools/measure-syllabus-coverage.mjs --missing        # what the LESSONS reach: 359/359
node tools/validate_t6_bank.js "<transcripts>"            # bank integrity, option-shape, vocabulary
node tools/check-lesson-lecture-match.mjs "<t>" --gate    # does each lesson teach its own lecture
npm test && node tools/build-site.mjs
```

The bank-reach figures in §3 are now gated numbers: `npm run check:tested` reprints them on every
run against the floors in `data/syllabus/tested-floors.json`, and `tests/taught-not-tested.test.mjs`
runs in `npm test`. (They were first measured by a scratch script; Phase 1 was that script done
properly, and it is done.)

---

## 9. What this plan does not cover

- The three real Known Gaps that survived today's audit: F-06 absolutes leakage on BRGSA and SPMS,
  the wrong-answer panel repeating inside one run (161 diagnoses drawing on 55 distinct cues), and
  `button#brand-home` at 42px against the project's 44px floor.
- Everything owner-gated: deploy, hosted-model calibration, the public-repository decision.
- `app/admin.css`, scoped out by owner decision as an internal tool.
