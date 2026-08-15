# Prompt — the full bank re-check, rehaul, recreate and generation

> Hand this to a fresh session verbatim. It is written to be self-contained about
> *intent* and deliberately not self-contained about *facts*: every number in it is
> re-measurable, and you are expected to re-measure rather than quote it. If a figure
> here disagrees with what the tools print, the tools win and you correct this file.

---

## 0 — Prerequisites. Do not start without these.

**Stop and ask the owner if any of these is missing.** Starting without one produces work
that looks finished and verifies nothing — that is not hypothetical, it is how a green
`ok: true` with an empty `"coverage": {}` shipped once before.

| # | Prerequisite | How to confirm you have it | If missing |
|---|---|---|---|
| 1 | **The clean lecture transcripts** at `C:\Users\knigh\OneDrive\Desktop\exam\Term 6 Clean Transcripts` | `node tools/validate_t6_bank.js "<root>"` prints a non-empty `"coverage"` block | Ask the owner. **Do not run the validator without the path** — with no argument it returns `ok: true` having skipped every lecture check and the entire LAW-49 vocabulary gate. |
| 2 | **The course assessments** in `docs/course-material/` (gitignored) — `SCLM-CLA.txt`, `BRGSA-CLA.txt` | Both parse into 8 modules with a `Correct answer:` line per question | Ask. Without them you are authoring against your own idea of the course, not the owner's. |
| 3 | **A dev server** | `python tools/server.py 8099`, then `http://localhost:8099/app/t6.html` loads | Nothing browser-side can be verified. Half the gates are browser-side. |
| 4 | **Chrome or Edge on disk** | `node tools/screenshot.mjs --port 8099 --only dashboard` writes PNGs | Pixel acceptance is impossible; say so rather than claiming it. |
| 5 | **Read, in this order**: `AGENTS.md` → `docs/governance/CONTENT-RULES.md` → `docs/governance/BUG-LAWS.md` (LAW-47, 48, 49, 53, 61, 62, 63, 64, 65) → `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` → the two most recent files in `evidence/2026-08-15/` | You can state what each law forbids in one sentence | You will re-discover them at your own cost. Several are laws precisely because someone did. |
| 6 | **An owner decision on scope** (see §9) | The owner has answered the three questions in §9 | Assume the smallest scope and say which one you assumed. |

**Standing constraints that never lift:**

- `main` is the deploy trigger and a real cohort is live. Work on a branch. Never push or
  merge to `main`.
- **The papers are sat 22–23 August.** Content that reaches testers during revision week
  is more disruptive than content that lands after. Ask before shipping tester-visible
  change inside that window.
- All new prose is `WAITING_OWNER_CONTENT_ACCEPTANCE` until the owner has read it. Saying
  "drawn from the transcript" is not acceptance.
- Do not weaken answer correctness, readability, state truthfulness, accessibility, or
  real learner data to make a number move. If a metric can only be moved that way, report
  the metric as unmovable and say why.

---

## 1 — What you are being asked to produce

Four questions. Every decision in this work is judged against them, and the acceptance
tests in §6 exist to answer them with evidence rather than opinion.

1. **Does it teach concepts?** Not "does it mention them" — does a learner who arrives
   knowing nothing finish a run able to state the idea in their own words and use it?
2. **Do concepts layer from 1 to 100?** Does step *n* rest on step *n−1*, does the product
   say so truthfully, and is the sequence the course's own rather than an artefact of how
   questions were selected?
3. **By the end, is the understanding dynamic and application-based?** Can the learner
   take an unseen situation and decide what to do — as opposed to recognising a sentence
   they have met before?
4. **Can they walk into Examiner with confidence — and does Examiner actually test
   understanding rather than re-presenting Learn?**

The fourth is the one the product currently fails hardest, and it is failing in two
directions at once: the examiner draws from the same bank Learn teaches from, and the
items themselves are answerable by craft. Both have to close.

---

## 2 — Ground truth. Measure this first, before you change anything.

Run all of these and paste the output into your evidence file as the "before" block. You
are going to be asked what changed; you cannot answer that without a before.

```bash
node tools/validate_t6_bank.js "<transcripts>"
node tools/check_exam_readiness.mjs
node tools/measure-absolute-bias.js
node tools/export-persona-run.mjs && node tools/run-persona-strategies.mjs
node tools/measure-learn-craft.mjs
node tools/measure-learn-exam-coverage.js
node tools/measure-lesson-handoffs.js
```

And in the page (one subject per page load — see the traps):

```
tools/browser-checks/teach-before-test.js     per subject
tools/browser-checks/lesson-layering.js
tools/browser-checks/primer-prediction.js     per subject
tools/browser-checks/reteach-on-failure.js    three page loads
tools/browser-checks/export-run.js            per subject, then node tools/export-learn-run.mjs
```

**What the last measured state was (2026-08-15 — re-measure, do not trust):**

- Bank-wide absolutes: correct options carry one **18.6%** of the time, wrong options
  **39.3%**. The gap lives almost entirely in two generated families — `explain`
  (14.6 / 58.3) and `apply` (2.1 / 51.4), whose correct answers are the 64 concept
  `summary` and `application` strings. `connect` is inverted (−12.5) and needs nothing.
- "Eliminate the absolutes", mean of exam sets 1–3, against 25% chance: **SPMS 41.2,
  BRGSA 36.6, SCLM 29.5**.
- **Inside a study set the dominant exploit is different**: name-matching the concept pays
  **45–60%**, reaching 67.3% on IBM combined with absolutes.
- **The course's own papers are worse than the product on two rules**: "pick the longest
  option" pays **53.7%** (SCLM CLA) and **86.7%** (BRGSA CLA); "always press B" pays
  31–36%. This is the benchmark. Beating 25% is the ambition; beating the real paper is
  the floor.
- Section A pools against what each paper draws: SPMS 52/35, BRGSA 76/20, SCLM 84/50.
- `measure-learn-exam-coverage.js`: finishing sets 1–8 in order carries a learner from
  about a tenth of their paper to all of it. Sets 1–8 are modules 1–8, two concepts each.

---

## 3 — The job, Learn side: re-check, rehaul, recreate

### 3.1 Re-check — find what is wrong before deciding what to build

Produce a per-item audit of the whole bank. Not a sample. The findings that have cost the
most were each invisible to every existing gate, so the audit has to be run by reading,
with tools narrowing where to look.

Audit for, at minimum:

- **Answerable by shape.** Length rank of the correct option, answer slot, absolutes,
  name-matching, and "the only option that mentions the syllabus". Per family and per
  subject, not just bank-wide — a bank-wide average hides a family that leaks 50%.
- **Answerable from somewhere else on the page or earlier in the run.** The concept's own
  *name* is the standing offender: `_term_cloze` and the framework blank of `_case_cloze`
  key on it, and the run's orientation copy prints it ("Carry forward: X. Now add Y")
  several steps earlier. That is **32 scheduled questions per subject, 128 in all**.
- **Distractors borrowed from other concepts.** `relevantWrong()` fixed this for case
  questions in 2026-08-12 and was never applied to `_repair_cloze` or `_bridge_cloze`,
  where the four options are four *different concepts'* principles — so the item is a
  vocabulary match. This is the single largest reason name-matching pays 45–60%.
- **Repetition inside one delivered run.** Count how many times one sentence appears
  across a set as an option, a match choice, a boss option and a revealed rule. Last
  measured: three of eight scored questions in an SPMS run key on one sentence.
- **R1 referents** — a stem pointing at an example it does not carry. The gate catches
  deictic phrasing; it cannot catch a stem naming a company without a pointing phrase.
- **R4 vocabulary** — a term required before any lesson the learner has reached defines
  it. The gate cannot match a singular glossary term against a plural-only occurrence, so
  grep before deleting a term it accuses of being invented.
- **Feedback quality.** For every scored item: is the correct-answer feedback more than
  the chosen option restated, and is each distractor's diagnosis specific to *that*
  misreading? Last measured: 9 of 32 items in the set-1 runs restate the answer, and 161
  diagnoses draw on only **55 distinct cues** with the top one covering 33 of them.

Write the audit as a table with one row per defect class, a count, a named example, and
whether an existing gate can see it. **Every row whose gate column says "none" is a gate
you are going to build in §6.**

### 3.2 Rehaul — fix what can be fixed without new items

Cheapest and highest-yield first:

1. **Apply `relevantWrong()`'s rule to every family that selects distractors.** Same-concept
   misreadings first; borrow from another concept only when the option-shape guard would
   otherwise expose the answer, one swap at a time. Expect this to move name-matching more
   than anything else you do.
2. **Retire or rewrite the families that key on a concept name.** Either the blank stops
   being the name, or the orientation copy stops printing it — but not by deleting the
   carry-forward line, which is what makes a run read as a sequence. Prefer changing the
   question.
3. **State correct answers with the absolute where the lecture's own claim is universal,
   and only there.** The CLAs do *not* supply this — measured, their correct options carry
   an absolute 3.0% (SCLM) and 7.5% (BRGSA) of the time, less often than the bank you are
   fixing. Manufacturing an absolute to move a metric is the mirror of watering down a
   distractor and is equally forbidden.
4. **Do not water down distractors.** "Transportation speed **alone** determines
   performance" needs "alone" or it stops being the error it exists to catch.
5. **Spread option length by making distractors more specific, never by trimming the
   correct answer.** A trimmed answer is a worse answer. Target a flat rank distribution
   per family; check `lengthRankShares` in the validator's totals.

### 3.3 Recreate — the new items

Volume is not the goal; **coverage of ways-of-knowing is**. One concept supports at least
four genuinely different questions, and the bank has been treating ~3 families as a
ceiling:

| Mode | What it asks | Fails if |
|---|---|---|
| **Definition** | State the idea precisely, distinguish it from its neighbours | It can be answered by matching the topic word |
| **Scenario** | Read a situation, name what is happening | The situation is a paraphrase of the definition |
| **Numeric / case** | Compute or read a figure and say what it means | The arithmetic is the whole question |
| **Judgement** | Two defensible options, one better; say which and why | There is an obviously unethical or absurd option |
| **Diagnosis** | Something has gone wrong; say why | The cause is named in the stem |
| **Transfer** | A domain the lecture never used, same principle | The new domain needs knowledge the course never taught |

Per concept, aim for at least one of each of the first four, plus transfer wherever the
principle genuinely travels. **Every item maps to a concept id and a lecture that already
has a lesson** — without that, the ladder, LAW-47 and every readiness figure silently
stop being true.

Use the CLAs for *style, coverage and difficulty*. Do not mirror them 1:1. BRGSA's are
scenario-led and that is the register the owner wants; SCLM's mix definition, computation
and case reading.

**Where the items live.** Add them to a file every load list already loads —
`app/sets/t6_challenges.js` is the precedent for exactly this. If you create a new file
you must update, at minimum: `app/t6.html`, `tools/build-site.mjs`, `tools/validate_t6_bank.js`,
`tools/check_exam_readiness.mjs`, `tools/export-persona-run.mjs`, `tools/export-learn-run.mjs`,
`tools/measure-absolute-bias.js`, `tools/measure-learn-exam-coverage.js`,
`tools/measure-lesson-handoffs.js`. **A previous new file was missing from four of these
at once and shipped unvalidated for weeks.** If you do create one, add a test that fails
when any load list is missing it.

---

## 4 — The job, Examiner side: generation

The examiner's job is to test whether the learner can use the ideas, on material they have
not met. Today it draws from the same bank Learn teaches from, and the disclosure that
says so is honest but is not a fix.

**Build an examiner-only slice.** Concretely:

1. **Author examiner-only items** — same concepts, same lectures, same difficulty band,
   **different situations**. A learner who has mastered the concept scores well; a learner
   who memorised Learn's items gains nothing.
2. **Reserve them.** `examReservedIds()` already makes Learn yield on ties as a late
   tiebreaker; that is a mitigation and depends on Learn having slack. Once an
   examiner-only slice exists, make the reservation real for those ids while keeping the
   tiebreaker for shared ones. **Do not hard-exclude shared items from Learn** — that
   lets the examiner's draw starve a module of its best teaching surfaces, trading a
   small honesty problem for a real teaching one.
3. **Keep the paper the same for every candidate.** Making the draw learner-dependent was
   considered and rejected: two students sitting different papers is not a mock.
4. **Size it from the section, not from ambition.** A section needs its count plus enough
   spare that three seeded sets differ meaningfully. Check with
   `node tools/check_exam_readiness.mjs` and the per-set digests from the harness.
5. **Respect each paper's real shape** — `docs/briefs/T6_EXAM_PATTERN.md` is authority.
   SPMS Section B is negatively marked and must not be free to a candidate who ticks
   everything (that was LAW-53; re-verify it after any MSQ change). SCLM Section B is
   numeric free-entry — **the only format in four subjects that defeated craft entirely**,
   so extend it rather than replacing it. IBM's paper is ten written answers on a caselet
   released two days before; objective items there add nothing.

**Two specific holes to close while you are in there:**

- **SCLM Section B is 4 of 6 numericals.** The two missing items are blocked on one
  lesson: `SCLM-M03-L06` carries the z-based method and a full worked example, and has no
  lesson. Author the lesson via `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` first, then
  the two items (reorder point at 95% CSL, and the service level the current policy
  achieves). A scored question citing an untaught lecture breaks LAW-47.
- **BRGSA's four integrated scenarios have never been served to a student.** They are in
  the bank, all conceptIds resolve, and BRGSA's paper has two written slots against IBM's
  ten. Check the paper composition, not the bank.

---

## 5 — The failsafes and fallbacks you must build in

Anything that can fail silently, must fail loudly instead.

- **No silent drops.** `addIntegratedScenarios` drops a scenario when a conceptId fails to
  resolve. Any builder you write **throws** on an unresolvable id, naming it. A silent
  drop is how content ships and is never served.
- **No plausible-looking wrong output.** A renderer that meets an unknown type must say
  so on screen (that is already true — keep it). A probe that cannot stage its fixture
  must refuse to run rather than report a pass. An export that cannot resolve a step must
  error, not emit `unknown`.
- **A comment is not an invariant.** If you write "this is withheld" / "this is taught
  first" / "this cannot happen", write the assertion in the same commit. Two REDLINEs
  exist because a comment claimed something the code did not do.
- **Every new content family gets its own row in `measure-absolute-bias.js`'s `familyOf`,**
  so a template fault can be told from an authoring one.
- **Author in batches with the structural gate between them.** Run
  `node tools/check_lesson_file.mjs "<transcripts>"` before the bank validator; a lesson
  file that does not parse makes the validator report nothing at all.
- **Fallback if you run out of session before the work is done:** ship a coherent subset —
  one subject complete, fully gated, fully evidenced — rather than four subjects
  half-done. State exactly which subjects and which families are untouched. A half-applied
  distractor rule is worse than none, because the measurement then describes neither the
  old bank nor the new one.

---

## 6 — The acceptance tests you must build. This is the part that makes the work checkable.

Existing gates stay and must pass. These are **new** and are the deliverable, not a
by-product: the four questions in §1 need to be answerable by running something.

### T1 — "Does it teach?" · the cold-learner test
For each subject, take the delivered run from `tools/browser-checks/export-run.js` +
`tools/export-learn-run.mjs`. For every scored item, assert that **every content word its
correct answer depends on** appears in a lesson, primer or caselet delivered *earlier in
that same run*. Report per item, not as an average. Extend the existing LAW-49 vocabulary
machinery rather than writing a second one.
*Fails if:* an item requires a word the run has not said.

### T2 — "Does it layer?" · the ladder test
Extend `tools/measure-learn-exam-coverage.js` to assert: sets 1–8 are modules 1–8; each
set's concepts have all their prerequisites taught by an earlier set; cumulative paper
coverage is monotonically non-decreasing and reaches 100% at set 8; and every lesson's
"next lecture" promise is either kept or corrected on screen
(`window.__dungeonExport.handoffs()` gives you the app's own answer — do not read
`lesson.connects` directly, that reports a broken promise the product has already
qualified).
*Fails if:* a descent, a gap, or an uncorrected broken promise.

### T3 — "Is the understanding dynamic?" · the craft ceiling
`tools/measure-learn-craft.mjs` and `tools/run-persona-strategies.mjs`, both already
written. **Add two strategies**: `nameMatch` (already there as `topicMatch` — keep the
name stable) and `seenBefore` (pick the option whose text appeared anywhere earlier in the
same run). Set explicit thresholds and make the tools exit non-zero above them:

| Rule | Learn threshold | Exam threshold | Justification |
|---|---|---|---|
| `noAbsolutes` | ≤ 30% | ≤ 30% | Below the course's own SCLM paper (32.6) |
| `topicMatch` | ≤ 32% | ≤ 30% | Currently 45–60% in Learn — the largest open hole |
| `longest` | ≤ 30% | ≤ 30% | The course's own papers pay 53.7 / 86.7 |
| `fixedB` | ≤ 30% | ≤ 30% | Slots are dealt flat; this is draw noise only |
| `combined` | ≤ 32% | ≤ 32% | A person combines rules; this bounds the mechanical version |
| `seenBefore` | ≤ 28% | ≤ 28% | New. This is the memorisation channel |

Measure the exam over **all three seeded sets and report the mean** — one seed cannot tell
a bank change from a draw. That mistake has already been made once: sixteen new items
moved one set's score *up* 10 points while the bank-wide bias fell.

### T4 — "Does Examiner test understanding?" · the transfer test
Two assertions:
- **Overlap.** For each paper, the share of its marks drawn from items a learner
  completing all ten study sets would have already answered. Report per subject; the
  examiner-only slice should drive it down. Today it is roughly 40–53%.
- **Same concept, different surface.** For every concept a paper tests, assert at least
  one examiner item whose caselet, stem and options are **all** distinct from every Learn
  item on that concept — a Jaccard or n-gram overlap under a stated threshold, not exact
  equality, because a reworded copy is still a copy.

### T5 — The three-persona regression
Re-sit the harness after every content batch. Report, per subject: score for each persona,
where each stalled, and — the part that matters — **what they were told when wrong**.
Count distinct diagnosis cues per run and fail below a floor. A run that teaches by
repeating the same sentence four times is not teaching four times.

### T6 — The reading pass
No tool catches the defects that cost the most. Read every new item cold and ask: could I
answer this without the lesson? Does the wrong-answer feedback tell me something I could
use on a different question? If a case is attached, does the question need it? Record the
count read and by whom.

**All six get an entry in `evidence/<date>/<task>/verification.md` with the command and
its output, not a summary of its output.**

---

## 7 — Traps. Each of these has already cost a session.

- The app reads its profile from `localStorage` **once, at load**. Writing after load does
  nothing. A bare `{selectedCourse:"X"}` is normalised back to defaults on load — stage
  fixtures onto a profile the app has already written.
- Rendering a lesson marks it read **in memory** (LAW-62). A probe needing a first-time
  queue opens **one** run per page load. Assert `lessonsRead` is empty immediately before
  the measured click, not at the top of the loop.
- **Do not re-implement scheduling in Node.** `layeredQueue` and `selectQuestionsFromPool`
  live in a DOM-bound IIFE; a second copy drifts and then the persona tests the copy. The
  paper builder is mirrored in `export-persona-run.mjs` **only** because a digest check
  proves it matches the app. Keep that guard working — it is what found the missing load
  list.
- **If a probe reports a defect, check the probe first.** Several have been wrong: a
  glossary hydrated from the wrong field name, a LAW-63 assertion that fired on all eight
  primers and was wrong every time, a duplicate-detector that matched its own
  documentation, and a re-teach check that staged its fixture onto an empty key.
- `attachDiagnoses` runs over every question after every builder. An authored MCQ or MSQ
  diagnosis survives it; anything else is regenerated. `debiasOptionOrder` then permutes
  options **and** diagnoses together, and `balanceAnswerPositions` deals answer slots
  exactly flat — so author the answer wherever you like and do not hand-balance.
- The lesson glossary field is `plain`, not `definition`.
- A viewport sweep is only as wide as the screens it visits. LAW-64 has recurred twice on
  screens the previous sweep never opened.
- `npm run validate:bank` passes **no** transcript argument. It is a schema-only check.

---

## 8 — Gates. All must pass, and each names the thing it proves.

```bash
npm test                                              # 78/78
node tools/validate_t6_bank.js "<transcripts>"        # ok:true, 0 errors, non-empty coverage
node tools/check_exam_readiness.mjs                   # exit 0
node tools/check_lesson_file.mjs "<transcripts>"      # before the validator, after any lesson edit
node tools/check-palette.mjs
node tools/build-site.mjs
node tools/export-persona-run.mjs && node tools/run-persona-strategies.mjs
node tools/measure-learn-craft.mjs
node tools/measure-absolute-bias.js
node tools/screenshot.mjs --port <port>               # 16/16, then LOOK at them
```

In the page, per subject where the check is subject-scoped:

```
teach-before-test.js    12 routes, 0 violations, per subject you touched
lesson-layering.js      0 descents
primer-prediction.js    ok:true
reteach-on-failure.js   3/3, three page loads
ui-audit.js             375 and 1280, on the dashboard, lesson, question, examiner home
                        AND a paper mid-question — 0 overflow / clipped / circleFit /
                        overlaps / sub-44px / ragged
export-run.js           per subject; paper digest MATCH; then node tools/export-learn-run.mjs
```

Plus T1–T6 from §6.

---

## 9 — Owner decisions to get before you start

1. **Scope.** All four subjects, or SCLM + BRGSA first (they have CLAs; SPMS and IBM do
   not)? SPMS currently leaks worst on absolutes and has received no new items.
2. **The 64 concept `summary` and `application` strings.** They are the correct answers of
   the `explain` and `apply` families — 96 questions — and where most of the remaining
   absolutes gap lives. Rewriting them changes prose that also feeds match choices, boss
   steps, written rubrics and the dashboard. Is that in scope?
3. **Timing.** Papers are 22–23 August. Does new content ship before them, or after?

---

## 10 — What is unfinished and must be picked up

Carry these into the work; they are not separate tasks.

- **F-06 open on BRGSA and SPMS.** Located precisely: the `explain` and `apply` families,
  and BRGSA's 60 legacy `t6_brgsa.js` items whose correct answers carry an absolute 0 of
  20 times on a drawn paper.
- **Name-matching inside a study set, 45–60%.** Nothing has been done about it.
- **The concept name as an answer** — `_term_cloze` and `_case_cloze`'s framework blank,
  32 scheduled questions per subject, with the answer printed in the run's own
  orientation copy several steps earlier.
- **Feedback breadth** — 55 distinct cues across 161 diagnoses in four runs.
- **SCLM Section B, 4 of 6**, blocked on the `SCLM-M03-L06` lesson.
- **BRGSA's four integrated scenarios**, authored and never served.
- **Fifteen of twenty SPMS multiple-select stems ask what "the lecture" said** rather than
  what is true. No caselet fixes these; the rewrite is per item.
- **`spms_roadmap_msq`** carries a date-recall claim as a correct option among framework
  claims.
- **IBM option lengths** still put the correct answer at rank 3 of 4 in 50% of items, so
  "pick the second-longest" works. The validator reports it as a warning.
- **BRGSA self-containment** — the paper states no question requires memorising a Clairo
  or Zoko figure. The bank has never been audited against that.
- **48 items authored 2026-08-15** (`_cla` ids) have not been read by the owner.
- **`AGENTS.md` is over its size budget** and the status block accretes a paragraph per
  session. Cut the 2026-08-12 block to one paragraph before adding another.

---

## 11 — What to hand back

1. `evidence/<date>/<task>/verification.md` — before and after for every measurement in
   §2, the T1–T6 results, every gate with its output, and a plain statement of what you
   did **not** do and why.
2. Ledger updates in the same session: `AGENTS.md` (status, Key Files, Known Gaps),
   `docs/governance/CHANGELOG.md` (newest-first), `docs/governance/BUG-LAWS.md` (any bug
   hit during the work), `docs/governance/QUALITY-LOG.md` (learning-integrity entries),
   `docs/governance/CONTENT-RULES.md` (any rule the work establishes).
3. Screenshots of at least the lesson, a question, the examiner home and a paper
   mid-question, at 375 and 1280, both themes.
4. A change announcement draft if anything is tester-visible
   (`docs/community/COMMUNITY_PLAYBOOK.md` has the format).
5. **Never end with a document contradiction you already know about.**
