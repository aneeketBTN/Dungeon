# Dungeon — technical overview

**For collaborators. Written 2026-08-13.** This is the document to read before proposing a change
to how the product teaches, tests, or claims anything. It describes what is actually built, not
what is planned. Where something is unfinished or unproven, it says so in the same sentence.

Authoritative sources, in order: `AGENTS.md` (living index and status), then
`docs/briefs/T6_EXAM_PATTERN.md` (paper structure),
`docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` (evidence and item contracts),
`docs/authoring/LESSON-AUTHORING-PROTOCOL.md` (how teaching is written), and
`docs/governance/BUG-LAWS.md` (the failures we have already paid for once).

---

## 1. What the product is

Dungeon is two products sharing one question bank, for one cohort sitting four Term 6 papers on
22–23 August 2026.

**The learning system** exists to take someone from zero to a pass. It sequences deliberately:
teaches a lecture before anything tests it, puts weak concepts first, explains every answer, and
never scores you on something it has not taught.

**The examiner** exists to do the opposite. A full paper, on a clock, in the paper's own random
order, with no teaching, no hints, and no feedback until submission — because that is the
condition the real exam is sat under, and practising only under helpful conditions measures the
help.

They are linked in exactly one direction. Concepts missed under exam conditions are stored and
become a curated revision route in the learning system. **Mock answers never touch your evidence.**
A timed, unassisted, uncoached paper is not the condition the evidence model is calibrated on, so
misses *prioritise* and never *score*.

### Size, as of this writing

| | Count |
| --- | ---: |
| Subjects | 4 (SPMS, BRGSA, IBM, SCLM) |
| Concepts | 64 (16 per subject) |
| Authored lessons | 106 |
| Bank questions | 816 (SPMS 216, BRGSA 204, SCLM 200, IBM 196) |
| Boss (multi-step) questions | 160 |
| Constructed responses | 64 |
| Mock papers | 4, three independent sets each |

---

## 2. The learning philosophy, stated as constraints

These are enforced in code and in gates, not left to good intentions.

1. **Teach before test.** A scored question citing lecture L cannot be scheduled before L's lesson
   has been delivered. This is `LAW-47`, and it is the invariant the whole 0→80 path rests on.
2. **A wrong answer must say what it revealed.** Not "incorrect" — the specific belief that
   produced the choice. Every distractor a scheduled question can present carries a four-field
   diagnosis, and the build fails without it.
3. **Progress is evidence, never effort or time.** Nothing moves because you studied for an hour.
4. **Never predict a score.** The app knows what you have and have not demonstrated. Anything that
   sounds like a prediction is a defect.
5. **Say what is missing.** Where the bank cannot fill a paper section, the card says so *before*
   the clock starts and scores you out of what is actually there.
6. **Lessons are unscored.** A teaching surface cannot leak an answer into an assessment or mutate
   evidence.

---

## 3. The engine

### 3.1 The four states

Every concept sits in one of four states, in ordinary language: **Not started**, **Needs
practice**, **Developing**, **Strong**. The computation is `evidenceFromAttempts()` in
`app/t6.js`.

**Needs practice** if any of:
- attempted but never once correct;
- two of the last three attempts wrong;
- a high-confidence error not yet repaired across two independent families *and* blocks;
- a recurring misconception (the same diagnosis tag twice);
- an unresolved failed boss step.

**Strong** requires *all seven* gates:
1. ≥ 5 scored attempts;
2. ≥ 4 correct;
3. ≥ 3 distinct question types or cognitive perspectives answered correctly;
4. correct evidence from ≥ 2 separate practice blocks;
5. applied/integrative evidence — a new case, a transfer item, or a valid unassisted boss step;
6. the most recent attempt is correct;
7. no open flag: no unresolved confident error, recurring misconception, uncertain-correct
   awaiting confirmation, or failed reasoning step.

**Developing** is everything in between, and the dashboard names which gate is still open rather
than showing a bare percentage.

A single miss after Strong drops the concept to Developing with a review due; it does not erase
history. A second recent miss drops it to Needs practice.

**Strong means strong *current* evidence.** Two time qualifiers ride alongside it: evidence is
*same-day* until a correct retrieval happens ≥ 20 hours after the first successful block, and
*refresh due* when the last correct retrieval is more than 4 days old.

The gates are rule-based on purpose. The bank has no calibrated item parameters and no cohort
data, so presenting an item-response or Bayesian score would be false precision. This is a stated
limitation, not an oversight — see §8.

### 3.2 Scheduling: `layeredQueue`

Given a list of question ids, the queue builder walks them and, for each surface, inserts any
lesson the learner has not yet had for the lectures that surface cites. Two subtleties:

- The rule applies to **primers on their own `sourceIds`**, not by inheritance from the question
  they precede. A primer citing M01-L01 in front of a question citing M01-L05 was running five
  steps ahead of its own lesson — the original defect in miniature.
- Generic held-feedback simulations contain no lessons and no primers, because a teaching aid
  inside an assessment-shaped check leaks answers.

### 3.3 Primers: adaptive support, not a format

Each concept has one primer family with four parts: the minimum fact, a concrete use, the nearest
named misconception, and a causal connection forward. Support escalates with failure — level 1 is
the fact and connection, one recent miss adds the application, two adds the misconception — and
collapses on success. Primer answers live in `primerState` and never enter `conceptAttempts`,
correctness totals, Strong gates, or result percentages.

### 3.4 Confidence

Sampled on high-value diagnostic events only (first diagnostic for a concept, delayed retrieval,
new-family transfer, boss or constructed response, repair check), asked after the response and
before feedback. Four anchors including a penalty-free skip.

Confidence never changes correctness, never earns rewards, never unlocks easier work. It changes
the *next diagnostic action*: a confident error schedules two independent repairs across different
families and blocks; an uncertain correct schedules a new-family confirmation.

Calibration language requires ≥ 20 diagnostic judgments across ≥ 3 blocks and ≥ 2 formats. Below
that the dashboard shows the count and says it is not enough. It never converts verbal categories
into probabilities.

---

## 4. How study material is made

### 4.1 Sources

Everything is derived from the course transcripts. **Course vocabulary is decided by the
transcripts, not by the concept index** (`LAW-49`) — an authored question may not introduce a term
the course does not use, and `tools/validate_t6_bank.js --vocab-report` produces the review list.

### 4.2 What a question must declare

Every item carries: `source` and `sourceIds`; `conceptId` and `supportingConceptIds`; `type`
(`primer`, `mcq`, `cloze`, `match`, `case-cloze`, `short-answer`, `boss`, `multi-select`);
`skills` (recognise, distinguish, explain, apply, calculate, diagnose, connect, evaluate);
`difficulty` 1–5; `variantFamily` so wording variants cannot masquerade as independent evidence;
`misconceptions` mapping each wrong response to a specific error; `diagnoses`; `frameworkSteps`
for multi-step items; and `estimatedMinutes`.

### 4.3 The option-level diagnosis contract

Each wrong option is a hypothesis about the learner's model, so each one carries four fields:

| Field | Holds | Rule |
| --- | --- | --- |
| `tag` | stable short identity | the scheduler's recurrence key; renaming it silently resets recurrence detection |
| `label` | headline of the gap | the learner's words |
| `why` | the belief the choice assumed, *then* what the source holds | name the wrong belief first — a `why` that only restates the right answer explains the verdict, not the error |
| `cue` | what to look for next time | a discriminating test, not a restatement |

Register: **diagnose the reasoning, never the learner.** "This choice assumed…" — no "you failed
to", no praise, no blame.

Most of the bank satisfies this without hand-authoring, because distractors are borrowed from
other concepts with known provenance and the diagnosis is derived from that provenance exactly
rather than inferred. Hand-written distractors with no machine-knowable provenance are diagnosed
by hand in `app/sets/t6_diagnoses.js`, keyed by question id and option index.

### 4.4 Lessons

`docs/authoring/LESSON-AUTHORING-PROTOCOL.md` is the procedure: find the edge (which lectures have
questions but no lesson), extract candidates once per subject, **verify against the transcript
before writing**, author one module per batch, gate the batch, verify in a browser, then run the
full regression. 106 lessons exist against a bank of 816 questions.

### 4.5 The gates that stop bad material shipping

`node tools/validate_t6_bank.js` fails the build on, among others:

- any scheduled distractor with no diagnosis, an empty field, a `why` that restates the correct
  answer, or a `why` that addresses the learner;
- an MCQ whose correct option is guessable from option length (length-rank share analysis);
- an MCQ without three or four plausible options, or without per-option misconception tags;
- a multi-select with fewer than four or more than six options, fewer than two correct answers, or
  **every option correct** (which cannot be penalised);
- a match that is not 4×4 or reuses an answer;
- a boss that is not multi-concept with at least three steps;
- a cloze whose template and blanks do not line up;
- missing `skills` or `sourceIds`, or a duplicate question id.

`npm run check:exam` is the second gate and is described in §5.4.

---

## 5. The examiner

### 5.1 Paper construction

`EXAM_PAPERS` in `app/t6.js` encodes the four papers strictly from
`docs/briefs/T6_EXAM_PATTERN.md`: sections, counts, per-question marks, 120 minutes, negative
marking, calculator rules. Nothing about paper shape is invented in code.

For each section, `buildExamPaper()` draws from the pool of that type, shuffles with a
**seeded** LCG (`state * 1664525 + 1013904223`, seeded from subject + set index, never the clock),
takes the first *n*, and spreads by stem so identical prompts do not cluster. Because the seed is
derived rather than random, a paper survives a reload mid-attempt, and set 2 is a genuinely
different draw from set 1 rather than a reshuffle.

Where a section cannot be filled, the shortfall is computed **from the pools, not from a built
paper** — so it is knowable before a candidate commits two hours — and it is stated on the card
and again on the recommended-paper hero.

### 5.2 Marking

- MCQ: one correct option.
- **MSQ (SPMS Section B only):** +1 per right option, −1 per wrong, floored at zero *per question*
  and capped at the question's marks. This is the only negatively marked section in the term.
- Match: all-or-nothing, because the paper states no partial credit.
- Written answers: excluded from the machine total and returned for structured self-review against
  the rubric. Self-review never becomes opaque correctness credit.

### 5.3 The result: a diagnosis, not a score

The results screen computes, per concept, the **easiest thing that went wrong** and the **hardest
thing that went right**, and reports the pair. Neither is inferred from the other. Four shapes are
distinguished:

- nothing landed;
- stopped below a rung — the easier questions were fine, a harder one was not;
- unreliable — right and wrong at the same level;
- **connection-only** — right on its own, wrong the moment it shared a question with another idea.
  This is the one a score sheet never surfaces.

Alongside it: pacing against the paper's own per-question budget, the cost of speculative ticking
under negative marking, second thoughts and what they were worth, and for written work,
course-vocabulary use against rubric points.

Every breakdown row has a button into a taught single-concept run — `LESSON → primer → questions`,
so `LAW-47` still holds on the way back in.

### 5.4 `npm run check:exam`

Reads `EXAM_PAPERS` out of `app/t6.js` (one source of truth, not a copy) and multiplies it by the
bank. It reports which sections cannot be filled and what that costs in marks, whether a
negatively marked section is *free* to a candidate who ticks everything (`LAW-53`), and how many
questions on every paper are **forced** to share one visible prompt. It prints an authoring
worklist, soonest paper first.

It found the defect it was built to find: SPMS Section B had eight items, every one of them
3-correct-of-4, which under that paper's marking rule meant ticking all four scored full marks —
16/16 without reading a question. Section B is now 20 items with varied shapes, verified live at
12/40 for the all-ticked strategy.

### 5.5 Repair in sittings

After a mock, the concepts that cost marks become a revision run — **four concepts at a time**.
Concepts taken into a sitting are stamped `repairedAt`, so the next sitting moves on rather than
repeating, and once every miss has been through, it falls back to a second pass over the full list.
A bad paper used to produce a single run past sixty steps, which is the wrong thing to hand someone
who has just finished two hours of exam.

---

## 6. Architecture

### 6.1 Shape

A single-page app in three hand-written files — `app/t6.html`, `app/t6.css`, `app/t6.js` — with the
bank in `app/sets/` (`t6_catalog.js`, `t6_challenges.js`, `t6_lessons.js`, `t6_diagnoses.js`,
`t6_brgsa.js`). No framework, no build step for the app itself. Screens are sections toggled by
`showScreen()`, which is also the single place that decides which product you are in.

Served by a Cloudflare Worker (`cloudflare/`) behind an approved-email login, with progress in D1.

### 6.2 State

One profile object, saved to `localStorage` under `term6.revision.v2` (namespaced per learner
email when signed in) and synced to D1 through the Worker. It holds `conceptAttempts`,
`primerState`, `completed`, `examMisses`, `examAttempts`, `active` (a resumable run), the builder
config, and UI preferences. New fields are read defensively and normalised on load, so an older
saved profile is never thrown away for a field it predates.

**`examMisses` is deliberately separate from `conceptAttempts`.** That separation is the technical
expression of "mocks prioritise, never score", and it is verified: `conceptAttempts` and
`totalAnswers` both stay 0 after submitted mocks.

### 6.3 Telemetry

Product telemetry is *shaped* against `.agents/contracts/tester-event.schema.json` and buffered
locally, bounded. **There is no transmission path** — no endpoint, no fetch, no queue that drains
anywhere — because the things that must exist first do not yet: explicit consent for that scope,
pseudonymous identity mapping, a retention and deletion path, and owner activation. The flag
defaults off, and with it off nothing is computed or stored.

### 6.4 Governance

`AGENTS.md` is the living index. Work is governed by evidence gates with a fixed status vocabulary
(`UNSTARTED → DIAGNOSED → IMPLEMENTED → VERIFIED(<evidence>) → DONE`, plus `WAITING_<GATE>`), and
"fixed", "verified" and "done" require a pointer into `evidence/`. Three ledgers carry the
institutional memory: `BUG-LAWS.md` (56 laws, each with origin, cause, comply path and
verification), `QUALITY-LOG.md` (truthful interaction, learning integrity, accessibility, motion
coherence, persistence safety), and `CHANGELOG.md`.

Automated gates: `npm test` (39 tests), `tools/validate_t6_bank.js`, `npm run check:exam`,
`npm run check:palette` (140 contrast pairings, grayscale separation and three colour-vision
simulations in both themes, plus an assertion that the four evidence states are shape-distinct,
not merely colour-distinct), and `tools/browser-checks/ui-audit.js` (overflow, sub-44px tap
targets, off-scale corner radii, paragraph density, type scale, ragged rows).

---

## 7. Where the depth actually is

Being specific, because "it's thorough" is not useful to a collaborator deciding where to spend
effort.

1. **The evidence model.** Seven gates, open-flag tracking, family- and block-aware repair, and
   time qualifiers that distinguish same-day fluency from retention. Most study apps ship a
   percentage.
2. **Option-level diagnosis at bank scale.** 816 questions where every scheduled distractor can
   say what choosing it revealed, enforced by a build gate rather than by review.
3. **The breakdown analysis.** "Right alone, wrong in combination" is a genuinely different
   finding from "got it wrong", and it changes what to teach next.
4. **Honesty under pressure.** The bank being short is stated before the clock, not after the
   score. IBM carries a caveat saying its mock cannot reproduce its paper. `check:exam` exists to
   find places where the app would flatter a learner.
5. **The ledgers.** Failures are written down with their comply path, so the same class of defect
   is paid for once. Several laws in the file were found by the gates that other laws demanded.

---

## 8. Bottlenecks, honestly

Ordered by what would hurt the cohort soonest.

1. **Content authoring is a single-threaded human bottleneck.** Every question and lesson is
   authored against transcripts by one person. Two SCLM Section B numericals are still missing and
   are *blocked* behind authoring the `SCLM-M03-L06` lesson, because shipping them first would
   break teach-before-test.
2. **Prompt variety in SCLM.** `check:exam` warns that 14 of the 50 Section A questions on every
   paper are forced to share one visible prompt, and 3 of 3 in Section C. It trains recognition of
   a stem rather than of an idea. Fixing it means varying caselets, not options.
3. **No item calibration and no cohort data.** All difficulty is authored, not measured. Nothing in
   the product knows which items actually discriminate. Everything downstream — the Strong gates,
   the ordering, the difficulty tags — is a defensible rule set, not a validated model.
4. **Bank breadth against paper size.** SCLM Section A needs 50 questions from a pool of 52. There
   is almost no room to draw three genuinely different sets.
5. **IBM cannot be mocked.** Its paper is ten written answers on a caselet released two days before.
   What the examiner offers is timed writing practice against the frameworks, and it says so.
6. **Self-marked written work.** Sections graded by the learner against a rubric produce a number
   that is not comparable with machine-marked sections. The recommendation logic now excludes
   caveat papers from "weakest" for exactly this reason, but the underlying incomparability stands.
7. **Visual acceptance.** Automated checks cover contrast, tap targets, overflow and radii. Pixel
   acceptance — someone looking at rendered screens — has been owed since 2026-08-12, because the
   verifying environment mostly does not composite frames. Note the failure mode this creates: an
   undisplayed browser pane pins `document.timeline.currentTime` at 0, so every CSS transition
   reads as its *start* value and animation bugs are invented that do not exist (`LAW-56`).
8. **Telemetry is shaped but blind.** Nothing is transmitted, so there is no evidence about which
   lessons work, which items are broken, or where learners stall.
9. **Owner/faculty acceptance.** Transcript-derived question content has not been accepted by a
   subject authority. It is source-traceable, which is not the same thing.

---

## 9. If you are joining

Read in this order: `AGENTS.md` → this document → `T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` →
`BUG-LAWS.md`. Then run the gates before changing anything, so you know what a clean tree looks
like:

```bash
npm test && npm run check:palette && npm run check:exam && node tools/validate_t6_bank.js
```

The highest-value contributions, in order: SCLM Section B's two numericals and the lesson they are
blocked behind; SCLM prompt variety; anything that turns bottleneck 3 into measurement.
