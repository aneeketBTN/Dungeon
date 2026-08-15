# Content rules for question authoring

Rules about **what a question may assume the learner can see**. Everything here is
enforced by `tools/validate_t6_bank.js` unless a rule says otherwise; a rule with no
gate behind it is a rule that comes back, which is how LAW-61 recurred after an
816-question manual audit.

Read with `docs/governance/BUG-LAWS.md` (LAW-47, LAW-53, LAW-61, LAW-63) — this file
is the authoring checklist, the laws are the reasoning.

---

## R1 — A question is answered against what is on the page

**Banned:** a stem that points at an example, case, product, company or scenario the
question does not carry.

> ✗ "In the drilling-machine example, select every need the purchase actually serves."
> ✗ "As for the Zerodha example, what principle closed that issue?"
> ✗ "The same distributor settles on an order quantity of 600 units…"
> ✓ "A distributor settles on an order quantity of 600 units against annual demand of…"

**Why:** a lesson delivered four questions earlier is memory, not context — and **the
examiner delivers no lesson at all**, so on a paper the referent has never existed.
These items validate, schedule and mark correctly. They are simply unanswerable by
reasoning, which is invisible to every other check.

**Gate:** `checkReferents()` — fires on a pointing phrase with no caselet, and on
"the same X" where X appears nowhere the candidate can see. Distributive uses
("sends the same weekly email to **every** user") are exempt and must stay exempt;
the first version of the gate flagged one and a gate that cries wolf gets switched off.

**Note:** the gate cannot see a stem that names a company or figure without a pointing
phrase. That still needs a reader. R1 is the rule; the gate is a floor.

---

## R2 — A case must withhold what the question asks for

**Banned:** a caselet that already contains the classification, decision or figure the
question asks the learner to supply.

> ✗ Case names the three layers → "Which three layers does this show?"
> ✓ Case describes the purchase → "Which needs does it serve?"

**Why:** LAW-63. One surface holding both the question and its answer spends first
contact with an idea on matching a string. The primer defect was exactly this, 64 of 64.

**Gate:** partial — the bank gate forbids options on a primer. The case-withholding
half is an authoring judgement.

---

## R3 — A question may not be answerable by shape

**Banned:** the correct answer being findable without reading the stem.

- **Length.** The correct option must not tower over its distractors.
  *Gate: `checkOptionShape` per question, plus a bank-wide longest-option share.*
- **Position.** The answer's slot must be evenly spread.
  *Gate: answer-position check, errors above 40% in any one slot.*
- **On-topic-ness.** Every option must name the concept, or none may. If the correct
  answer is the only sentence mentioning the syllabus, the item tests nothing.
  *Gate: `tools/measure-name-matching.js --gate` — every option set in the built bank,
  per family, ceiling 32% (10% for `connect`). Also measured by
  `tools/run-persona-strategies.mjs` (`onTopic`) on the paper and by
  `tools/measure-learn-craft.mjs` (`topicMatch`) inside a study set.*
  **A set is one or two concepts deep, so this is far worse there than on a paper:**
  name-matching pays **45–60%** across the four set-1 runs against 17–25% on the mocks.
  A learner who has read only the set's title can eliminate on vocabulary alone.

  **The rule is `argmax`, not presence.** A distractor that mentions the concept *less
  densely* than the correct answer is still eliminated, so "every distractor mentions
  it" is not the bar — matching the correct answer's density is. Measured 2026-08-15:
  195 of 384 `explain`/`apply` distractors named their concept and those families still
  paid 66.0% and 36.2%.

  **Bank-wide by family, 2026-08-15, before → after the fix** (1049 option sets, chance
  25%): `term_cloze` 100.0 → **retired**, `repair_cloze` 81.9 → **25.0**, `case_cloze`
  70.8 → **25.0**, `explain` 66.0 → **25.0**, `bridge_cloze` 48.5 → **25.0**, `boss` 41.3
  → **31.2**, `apply` 36.2 → **25.0**, `connect` 0.5 → **0.5**. **324 → 28** option sets
  pay 100%. `boss` is the largest family at 480 sets and was invisible to every earlier
  measurement.

  **How the fix is applied.** `attributeTo()` in `t6_challenges.js` and `labelOptions()`
  in `t6_catalog.js` add the concept's label to every option in a set. No authored word
  changes — over-claims keep their "alone" and "only". Two positions, and the choice is
  not cosmetic: a **leading** label ("`<Concept>`: …") where the option is a *claim about*
  the concept, and a **trailing** tag ("… (`<Concept>`)") where the option is a *decision*,
  because a leading label there misattributes a course of action to a framework name and
  buries the words that differ behind identical text. The rule matches a substring
  anywhere, so position costs nothing.

  **Two traps, both paid for on 2026-08-15.** Do not pronounce a self-reference as "It" to
  avoid "Strategic fit: Strategic fit aligns…": it fires on 11 of 64 summaries, all of
  them correct answers, so it shortens only the correct option and trades this rule's cue
  for the **length** cue above — SPMS earned a new validator warning immediately. And do
  not label a family that is already correct: `connect` goes 0.5% → 26.6%.

  **Fix in `connect`'s direction, never by stripping names.** `connect` reaches 0.5% by
  naming the concept in *every* option — a distractor naming the concept is a specific
  false claim about it, which is what a distractor is for. The opposite fix, stripping
  each concept's name from its own prose, was simulated on 2026-08-15: it drives every
  family to 21.8–27.1% and produces "Lean this idea asks whether real people will take a
  real action", "a payment or signed it is a different category" and "starts from the
  this idea position". **Rejected** — it moves the metric by destroying the sentence, and
  it takes `connect` from 0.5% to 26.6%. Do not re-derive this.

  **A label-selection item cannot be fixed by choosing better distractors.** `term_cloze`
  and `case_cloze`'s framework blank asked for the concept's own *name* among four concept
  names, so exactly one option could carry it and the payoff was 100% by construction.
  Suppressing the concept name on the step is **not** a fix: it moves the metric without
  changing what a learner who read the carry-forward line three steps earlier already
  knows. **Resolved 2026-08-15 on an owner decision** — `term_cloze` retired to
  `contrast`, whose four options are all claims about *this* concept (three of them
  neighbours' claims wearing its label), and the framework blank now selects a claim
  rather than a name. **Do not retire such a family by deletion:** the bank floor is 792
  items and every concept needs ≥10 surfaces, ≥8 variant families, ≥10 actively scheduled
  surfaces and ≥6 active families, so dropping one surface per concept fails four gates
  at once. Replace it.
- **Absolutes.** `only / all / every / never / always / entirely / automatically`
  must not appear far more often in distractors than in correct answers.
  *Gate: `tools/measure-absolute-bias.js --gate` — every option set in the built bank
  (1064), elimination payoff per family, ceiling 30%. Also measured end to end by
  `tools/run-persona-strategies.mjs` over sets 1–3.*

  **Closed 2026-08-15** using exactly two levers, with a third refused:

  1. **Remove filler, never an over-claim.** `simply` is an intensifier by definition, and
     `\ball\b` / `\bany\b` match "at all" and "in any way", which are not universal
     quantifiers — "The job is simply the list of features customers copy" states the
     identical misconception without it. That was only **9.6%** of absolute-carrying
     distractors; the other **90.4% are load-bearing and must stay**.
  2. **State the correct answer at the course's real strength.** 76 rewrites, every added
     universal being the condition already in that concept's own accepted `bridge`
     ("becomes a market **only** when the offer removes the barriers"). Lecture-derived
     prose already carries absolutes 40.6% of the time — which is why `bridge_cloze`
     needed nothing — so a hedged `summary` is house style, not the lecture.
  3. **Refused: manufacturing an absolute, and watering down a distractor.**

  **Rewrite in place; never append.** Appending a universal clause to the correct answer
  closed this gap and opened a worse one — IBM's correct option became the longest **66%**
  of the time, beating the exploit being fixed. All 76 rewrites ended shorter-or-equal and
  every subject's length distribution finished flatter than it started.

**Do not fix an absolutes imbalance by watering down distractors.** Many are
over-claims on purpose — "transportation speed **alone** determines performance" needs
"alone" or it stops being the error it exists to catch. Fix it from the other side:
state the correct answer with the absolute the course actually uses **where the claim is
genuinely universal** — and only there. Manufacturing one is the mirror of the sin.

**Benchmark against the real paper, not against 25%.** Measured 2026-08-15 on the
owner's own assessments (`evidence/2026-08-15/t6-harness-and-bank/cla-benchmark.json`):
"eliminate the absolutes" pays **32.6% on the SCLM paper and 38.6% on the BRGSA paper**,
and their correct options carry an absolute only 3% and 7.5% of the time — *less* often
than this bank does. Two rules the course leaks far worse than Dungeon: "pick the longest
option" pays **53.7% and 86.7%** there against 11–32% here, and "always press B" pays
31–36% against Dungeon's dealt-flat slots. 25% is the direction; the paper the student
will sit is the bar.

---

## R4 — Vocabulary must have been introduced before it is required

**Banned:** a scored question whose stem, options or rubric require a term no lesson
the learner has reached has defined. "BPO", "FPO" and "portfolio-at-risk" all shipped
this way; the last one carried ten marks.

**Gate:** LAW-49 vocabulary gate — **only runs when the transcript root is passed.**
A green run with an empty `"coverage": {}` verified nothing.

**And the citation is not the test (2026-08-15, LAW-66).** LAW-47 guarantees every lecture
an item *cites* has been taught before it. It cannot see a term borrowed from a lecture the
item does **not** cite, because nothing links the two — so an item can pass LAW-47, the bank
validator and the vocabulary gate and still hand a learner an answer written in a word the
run has not said. `smoke_signal` cites `BRGSA-M01-L02` and its correct answer used
"prospects", glossary vocabulary from `BRGSA-M01-L04`, three lessons later.

**Gate:** `node tools/measure-cold-learner.mjs --gate` (T1), over real delivered runs.
Per item, never averaged. Current: 32/32 across four subjects.

---

## R7 — A section's slot must be filled by an item worth its marks

**Banned:** a section declaring only a question *type* and drawing anything of that type,
regardless of the length the slot is worth. BRGSA Section C is two **ten-mark** structured
responses and drew 2 from 36 written items of which **32 run three to five minutes** — so
four times in five a ten-mark slot got a three-minute answer, and three of the four
scenarios authored for that slot reached no set the product offers.

**Why:** it looks like a content gap and is not. The content existed; the draw could not
tell a ten-mark item from a three-minute one because nothing in the section said so.

**Gate:** sections carry a `prefer` order over `writtenMode`, asserted by
`tests/integrated-scenarios.test.mjs` — every BRGSA Section C slot must be `integrated`,
and the three seeded sets must be three distinct draws.

---

## R8 — An examiner-only slice must be additive

**Banned:** hard-reserving a shared item away from Learn. The examiner's draw would then
take a module's best teaching surfaces, trading a small honesty problem for a real teaching
one (overhaul brief §4.2).

**Allowed:** hard-reserving items that are *additional*. The six `examOnly` BRGSA scenarios
are excluded from every study pool and from written practice; the four original scenarios
stay available, so Learn lost access only to content that did not exist before.

**Gate:** `tests/examiner-slice.test.mjs` — no reserved item in any study pool, and every
concept still clears the bank's surface floor **with the slice removed**. Overlap is
reported per section by `tools/measure-exam-transfer.mjs` (T4).

---

## R5 — One visible prompt, one question

**Banned:** shipping many questions that present identically. A candidate meeting the
same sentence sixteen times is not being asked sixteen questions.

**Why:** the `connect` family shared one stem and one caselet across all 64 concepts,
so SCLM printed the same visible prompt 16 times for 16 marks.

**Gate:** none yet — measured by the persona harness (`distinct visible prompts`).
Current: SPMS 55/55, BRGSA 26/26, SCLM 55/57, IBM 10/10.

---

## R6 — Questions may repeat a concept; they may not repeat a question

Testing one concept several ways is the point — a definition, a scenario, a numeric
case and a judgement call are four different questions about one idea, and theoretical
subjects support many more of these than the bank currently carries.

What is not allowed is the *same item* doing duty in both products. Learn and the
examiner draw from one bank; Learn yields on ties (`examReservedIds`), and the paper
discloses how many of its questions the candidate has already answered.

**Gate:** partial — disclosure is enforced in the app; the overlap itself is a bank-size
problem and needs more items, not different scheduling.

---

## When adding questions from the CLAs

`docs/course-material/` (gitignored) holds the real course assessments — SCLM 72
questions, BRGSA 80, eight modules each, with answers.

- **Do not mirror them 1:1.** They are a reference for style, coverage and difficulty,
  not a bank to copy. Their value is showing what the course actually asks and how it
  phrases a scenario.
- **Measure them before you lean on them.** The first tranche (48 items, 2026-08-15) was
  authored on the premise that the CLAs supply absolute-carrying correct answers. They do
  not — 3% and 7.5%. A premise about source material is a claim, and this repository has
  the tooling to check one in ten minutes.
- **Every rule above still applies.** A CLA question lifted verbatim can still break R1
  if its scenario lived in a document the learner never sees.
- Map each new item to a concept id and a lecture, or the ladder, LAW-47 and the
  readiness figures all silently stop being true.
- New prose is `WAITING_OWNER_CONTENT_ACCEPTANCE`.
