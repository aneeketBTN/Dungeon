# Experience Quality Log — Living Ledger

Goal: a truthful, readable, accessible, coherent learning-game experience whose visual feedback
matches engine state and whose recommendations are supported by player evidence.

Standing owner rule: never improve polish, speed, engagement, or content volume by weakening
question correctness, readability, state truthfulness, accessibility, or real player data.

## Best Practices

- Define semantic state before animation and assets.
- Use one source of truth for setup, run, world, persistence, and results.
- Correct, partial, and missed feedback must differ through text, symbol, shape, and final state;
  color and motion are supplemental.
- Feedback copy appears immediately; animation never delays learning.
- Every visible setup choice must be functional or pre-declared unavailable.
- Test a generated asset at actual in-game size and context before promotion.
- Use isolated deterministic profiles for fresh, returning, all-correct, all-wrong, partial,
  assisted, failure, resume, and low-resource scenarios.
- Real Browser evidence is primary for web usability; Computer Use is primary for Windows-level
  app flows; code inspection is secondary.
- Dashboard metrics must change a player decision or be demoted/removed.
- Every visible pixel must earn its place through meaning, hierarchy, feedback, navigation, or
  accessibility; maintainer metadata is not learner-facing hierarchy.
- Unanswered learning content stays neutral. Color must explain selection, action, progress,
  accessibility focus, or feedback—not decorate a content type.
- Dependent content must look connected: a case and its instruction share one prompt surface. The
  substantive case owns primary reading emphasis; the instruction is a compact directive.
- Preserve the learning engine's honest-difficulty rule: adaptive scheduling may change what and
  when, never secretly soften how hard.
- In the active revision route, use the same plain four-state vocabulary in the header, course
  cards, evidence graph, questions, results, and recommendations.
- Promote a concept only from answer evidence; never use set completion alone as mastery.
- A held-feedback practice check must withhold every answer-shaped cue—including constructed
  rubrics and exemplars—until the result review.
- Confidence is optional diagnostic evidence. Never reduce it through humiliation, manipulate it
  with secret difficulty, or turn it into a reward currency.
- A valid reasoning step and a valid whole chain are separate facts; preserve both.
- Constructed browser practice is transparent self-review unless a separately validated human or
  model-grading contract exists.
- Opening a tester cohort does not justify collecting learner data that the product does not need.
- Access control must be individual and revocable; never market an identity-gated client bundle as
  impossible for an approved user to copy.

## Issue → Cause → Fix

- **I-ANSWER-VOCABULARY-OUTSIDE-CITED-LECTURES (2026-08-15)** — Issue: learning integrity. A
  scored item's correct answer used a course term defined in a lecture the item does **not**
  cite. `smoke_signal` cites `BRGSA-M01-L02` and its answer read "exposed **prospects** take a
  behavioural step"; "prospect" is glossary vocabulary from `BRGSA-M01-L04`, delivered three
  steps later. Cause: LAW-47 gates each surface on its own `sourceIds`, so it can guarantee the
  *cited* lectures are taught and is structurally blind to vocabulary borrowed from an uncited
  one. Fix: reworded to "people who see the page" — the distinction under test, a measured
  action against a stated opinion, is unchanged. Found by the new **T1**
  (`tools/measure-cold-learner.mjs`), which is now the standing check: 32/32 scored items in
  four delivered runs, every course term introduced earlier in its own run.

- **I-ONE-SENTENCE-ANSWERS-EVERY-MISTAKE (2026-08-15)** — Issue: learning integrity; the
  standing "feedback breadth" finding, now measured per run and gated. A learner who makes four
  different mistakes and is told the same thing four times has been taught once and charged four
  times. Measured by the new **T5** (`tools/measure-persona-regression.mjs`): the single cue
  *"Return to the governing idea and check the option against it directly before selecting."*
  answered **55–100%** of every wrong decision in every subject's set-1 run. Cause:
  `fallbackDiagnosis` fires for any option with no provenance and no authored diagnosis, and it
  was **discarding `targetRole`** — the facet the slot is asking for, already computed at the
  call site. `targetRoleFor` also misses on options `attributeTo` has rewritten, so a
  `ROLE_BY_PERSPECTIVE` fallback was added over a field every question carries. Fix: four cues
  drawn from what the slot asks (principle / decision / reason / which idea governs). Top-cue
  share BRGSA 54.5 → **30.0**, IBM 66.7 → **33.3**, SCLM 55.6 → **33.3**, SPMS 63.6 → **36.4**.
  No cue was invented; the information was already there and being thrown away.

- **I-TEN-MARK-SLOT-THREE-MINUTE-ANSWER (2026-08-15)** — Issue: exam fidelity. BRGSA Section C
  is two ten-mark structured responses and drew 2 from a pool of 36 written items of which
  **32 are three-to-five-minute per-concept prompts**, so four times in five a ten-mark slot was
  filled by a three-minute answer, and three of the four scenarios authored for that slot
  reached no set the product offers. Cause: a section declared a *type* (`short-answer`) and
  nothing about the *length* the slot is worth. Fix: sections carry a `prefer` order over
  `writtenMode`. Correction to the standing record: the scenarios were **not** "never served" —
  `brgsa_case_false_win` reaches set 2 and `ibm_case_hospital_growth` reaches IBM set 2.

- **I-LEARN-CANNOT-TEACH-THE-EXAMINERS-SURFACE (2026-08-15)** — Issue: learning integrity, and
  the owner's own test — *"if Examiner feels foreign, that's Learn's failure"*.
  `startWrittenPractice` rotated `short/case/short/case`, and its fallback fires only when no
  unchosen concept has a prompt in the requested mode. Every concept in these subjects carries
  both, so the fallback never fired and an integrated scenario was **unreachable by
  construction** — the one surface the examiner's Section C is made of was the one surface Learn
  could not teach. Fix: the last slot asks for `integrated`, and relaxes the one-concept-per-
  prompt rule before giving the slot up, because a scenario spans four concepts and is filed
  under the first.

- **I-SUITE-PASSES-OVER-TESTS-THAT-DO-NOT-EXIST (2026-08-15)** — Issue: gate truthfulness. Two
  test files were listed in `package.json` before they were written, and `npm test` exited **0**
  — `node --test` silently skipped the missing paths, although a lone missing file exits 1. A
  suite that passes over tests that do not exist reads exactly like a suite that passes. The
  files now exist; the behaviour is recorded here because the next person to stage a test name
  ahead of the file will get a green run and no warning.

- **I-CRAFT-CLOSED-BOTH-SURFACES (2026-08-15)** — Issue: learning integrity; closes both
  I-NAME-MATCHING-BANK-WIDE and I-CRAFT-INSIDE-A-SET below, and F-06. Cause of the remaining
  half: the absolutes gap was **house style, not meaning** — `bridge_cloze` needed nothing
  because lecture-derived prose already carries absolutes 40.6% of the time, while `summary`
  and `application` were systematically hedged, so "drop the absolutes and guess" beat chance
  on families whose distractors were honest over-claims. Fix, measured by persona on both
  surfaces: paper combined SPMS 34.5 → **16.3**, BRGSA 37.8 → **15.3**, SCLM 24.5 → **20.1**;
  delivered run SPMS 50 → **19.2**, BRGSA 37.8 → **28.2**, SCLM 48.2 → **22.0**, IBM 67.3 →
  **23.1**. Two levers only — 23 filler removals (9.6% of absolute-carrying distractors; the
  load-bearing 90.4% untouched) and 76 correct answers restated at the course's real strength,
  each universal lifted from that concept's own accepted `bridge`. **Manufacturing an absolute
  and watering down a distractor were both refused.** The standing lesson is that verification
  found five defects the gates could not: an "It" substitution firing on 11 of 64 summaries
  traded the name cue for a **length** cue; **appending** universals pushed IBM's "pick the
  longest" to **66%**, worse than the exploit being fixed, so rewrites must be *in place* and
  length-neutral; labelling `case_cloze`'s decision blank buried the differing words behind one
  36-character prefix and misattributed a decision to a framework name; two option-shape errors;
  and unlabelling `explain` on a plausible hypothesis sent it to 61.9%. Bank validator finished
  at **0 errors and 0 warnings**, clearing the standing IBM length warning as well. Evidence:
  `evidence/2026-08-15/t6-bank-overhaul/verification.md`.

- **I-NAME-MATCHING-BANK-WIDE (2026-08-15)** — Issue: learning integrity, and a correction to
  I-CRAFT-INSIDE-A-SET below. Cause: the exploit was attributed to distractors borrowed from
  other concepts, and the fix prescribed was `relevantWrong()` applied to the remaining families.
  Measured over **every** option set in the built bank (1049, not the ~13 per run the craft tool
  samples), that diagnosis is **wrong in its main claim**: `explain` and `apply` already use
  authored **same-concept** distractors and still pay 66.0% and 36.2%. The rule is `argmax`, not
  presence — **195 of 384** of their distractors do name the concept and are eliminated anyway
  for naming it *less densely* than the correct answer. Cross-concept borrowing is real but
  confined to `repair_cloze` and `bridge_cloze`. Per family: `term_cloze` **100.0**,
  `repair_cloze` 81.9, `case_cloze` 70.8, `explain` 66.0, `bridge_cloze` 48.5, **`boss` 41.3**,
  `apply` 36.2, `connect` **0.5**. **324 option sets — a third of the bank — pay 100%.**
  `boss` is the largest family at 480 sets and had never been measured; it sat inside "other".
  Fix: **closed in every generated family the same day, 324 → 28 sets at 100%.**
  `tools/measure-name-matching.js --gate` is the standing check R3's on-topic-ness row never had
  and now **exits 0**; `tests/name-matching-gate.test.mjs` asserts the gate itself. The direction
  taken is `connect`'s — name the concept in *every* option — and **no authored word changed**, so
  over-claims keep their "alone" and the standing rule above is not bent. The opposite direction
  was killed on evidence before anything was edited: stripping each concept's name from its own
  prose drives every family to 21.8–27.1% but produces "Lean this idea asks whether real people
  will take a real action" and takes `connect` from 0.5% to 26.6%. `term_cloze` was **retired to
  `contrast`** on an owner decision, because a label-selection item is 100% name-matchable by
  construction. **Three defects came from verification rather than from the gates**, and each is a
  standing lesson: an "It" substitution that fired on 11 of 64 summaries — all correct answers —
  traded this cue for a **length** cue and earned SPMS a new validator warning; labelling
  `case_cloze`'s decision blank printed **eight options each opening on the same 36-character
  prefix** and misattributed a decision to a framework name, which a green gate could not see and
  reading the screen could; and taking module siblings unconditionally failed the option-shape
  guard twice. **Still open: IBM at 32.7 against a 32 limit, whose residue is absolutes (37.8),
  not name-matching** — that is F-06 and needs the 64-string rewrite, which was in scope and was
  not done. New `npm run review` prints every gate beside the real option text for exactly the
  reason defect two exists. Evidence: `evidence/2026-08-15/t6-bank-overhaul/verification.md`.

- **I-CRAFT-INSIDE-A-SET (2026-08-15)** — Issue: learning integrity. The mock's measured exploit is
  "eliminate the absolutes"; a study set's is not, and nothing had looked. Cause: a mock spans
  sixteen concepts, so "which option names the syllabus" is weak there — but a study set is one or
  two concepts deep, and its `_repair_cloze` and `_bridge_cloze` distractors are *other concepts'*
  principles, so exactly one option contains the set's own vocabulary. Measured with the new
  `tools/measure-learn-craft.mjs` over the delivered runs: name-matching pays **53.8 / 44.9 / 46.4 /
  59.6%** against 25% chance, and combined with absolutes reaches **67.3%** on IBM. The engine then
  reads those answers as evidence of understanding. This is `relevantWrong()`'s defect (LAW-48)
  surviving in the families it was never applied to: it fixed case questions in 2026-08-12 and the
  cloze families kept borrowing distractors from elsewhere. Fix: **none yet, and that is stated
  rather than implied** — it is distractor selection in the generated families, not content volume,
  and it was outside a session that added 48 items. Evidence:
  `evidence/2026-08-15/t6-harness-and-bank/verification.md`. Related and also open: 2 of 8 scored
  questions in an SCLM run key on the concept's own *name*, which the run's orientation copy prints
  four steps earlier ("Carry forward: Strategic fit. Now add Six supply-chain drivers").

- **I-FEEDBACK-BREADTH (2026-08-15)** — Issue: the wrong-answer panel is the best teaching in the
  product and repeats itself inside a single run. Cause: 161 per-option diagnoses across the four
  set-1 runs draw on **55 distinct cues**, and the most common one covers 33 of them, so a learner
  who misses four items in one run can meet the same sentence three times; the generated `_explain`
  family's `why` is a template with the concept name slotted in. Correction to the record while
  measuring it: F-25's "correct-answer feedback restates the correct answer, every time" is
  **9 of 32** items, not universal — the `_repair_cloze` family and two `_explain` items — so it is
  a family defect with a working majority, which is a much smaller thing to fix. Fix: not attempted.
  Evidence: same file. Standing measurement is the persona harness key files, which now carry the
  full post-commit surface per option.

- **I-ISOLATED-WEAKNESS (2026-08-14)** — Issue: the weakness route treated every gap as an unrelated
  item — eight concepts, one question each, no statement anywhere about whether any of them were
  connected. Two weak ideas that the course tests together were repaired separately and never checked
  against each other, and a genuinely isolated gap was presented identically, so the learner had no
  way to tell the difference. Cause: no link structure was consulted, and none was readily available
  — `data/graphs/` holds concept graphs for five *other* subjects and none for Term 6, and the
  concept records carry a `bridge` sentence rather than links. Fix: derive links from the bank
  itself, where an edge exists only if one authored surface tests both concepts, then pair weak
  concepts **only when the partner is also weak** and close each pair with the surface that tests
  both. Everything else is reported as standing on its own, in the run kicker and by omission from
  any pair. The strict edge definition is the point: same-module or adjacent-lecture proximity would
  have produced links with no surface to exercise, which is a claim the product could not then honour.
  Measured, the graph is one module partner per concept plus two real cross-module edges in SCLM, so
  isolation is the common case and had to be a first-class outcome rather than a fallback. Evidence:
  `evidence/2026-08-14/t6-weakness-linking/verification.md`. Standing check:
  `tools/browser-checks/weakness-linking.js`. Watch items: the run promised "Up to 8 questions" and
  delivered 12 because the budget asked whether there was *any* room rather than whether the unit
  fit; and the "Both together" label was first written into `.question-meta`, which is
  `display: none`, so a `textContent` assertion passed on copy no learner could see — the second
  instance of that failure in one session.

- **I-LAYERING (2026-08-14)** — Issue: a run introduced concepts in an order nothing had chosen —
  SPMS study set 1 taught `M01-L10` before `M01-L05`, in the run the homepage captions "in the order
  the subject teaches it" — while the primer printed "Carry forward: `<previous>`. Now add `<this>`"
  and the header said "builds on what you just did". The product was claiming a build the schedule
  did not have. Cause: lecture position was not an input to scheduling anywhere.
  `layeredQueue()` places a lesson immediately before the first surface citing it, so lesson order
  is a by-product of question order; `selectQuestionsFromPool()` orders questions by never-attempted
  → format variety → concept variety → least-recent → a hash of the question id. On a fresh profile
  the first four keys tie, so the opening question of a run — and the first lesson a learner ever
  meets — was picked by that hash. Deterministic, and arbitrary with respect to teaching. Fix:
  selection is untouched (format spread, concept coverage and weak-first are all deliberate); the
  selected questions are sorted by teaching rank afterwards, and `layeredQueue` now commits to the
  run's whole lesson list up front and drains it in order, so lesson delivery is monotonic by
  construction rather than following whichever surface happened to cite a lecture first. Measured
  across all 40 sets in four subjects: **94 descents over 37 of 40 sets → 0**, with the pair count
  identical at 253, which is the proof selection did not move. LAW-47 still clean.
  `startPriorityPractice` is deliberately excluded — it is remediation ordered by need and says so
  on screen. Evidence: `evidence/2026-08-14/t6-lesson-order-diagnosis/verification.md`. New standing
  check: `tools/browser-checks/lesson-layering.js`. Watch item: copy that asserts a relationship
  ("builds on what you just did") needs the relationship verified, not just rendered — it shipped
  for months against an order that did not exist.

- **I-CASE-READABILITY (2026-08-14)** — Issue: the first authored cases were faithful to the
  transcript and read like minutes of it — `spms_jtbd_msq` ran three parallel "Asked why…, she
  says…" clauses in one 557-character block, and the block sat in a column where the case, its
  provenance chip, the vocabulary disclosure and the question all had the same visual rhythm, so
  nothing grouped. Cause: three separate things. The prose was transcribed rather than written. The
  render path set the whole case as one `textContent` block with no paragraph structure and no
  measure cap, so lines ran past 100 characters on a wide card. And the two labels that would have
  explained the structure were both suppressed — `.case-label` was screen-reader-only, and
  `.task-prompt > span` was `display: none` globally, which hid the "Then decide" kicker that
  `renderQuestion` had been computing correctly all along. Fix: cases rewritten as three-beat
  scenarios (situation, what happens, what it costs) with the facts unchanged; `caseParagraphs()`
  renders blank-line-separated beats as paragraphs on both the learn and exam surfaces; a visible
  **THE CASE** eyebrow, a visible **THEN DECIDE** eyebrow, and a 1px rule so everything above it is
  material and everything below is the ask — a divider rather than a nested card, which the design
  rules reserve for controls and state changes. Measure capped at 62ch, verified at 71 characters
  per line. Evidence:
  `evidence/2026-08-14/t6-example-questions-show-their-example/verification.md`. Watch item: a
  computed label that is then hidden by a global rule is invisible to every DOM check that asserts
  on `textContent`; assert on the computed `display` too.

- **I-INVISIBLE-EXAMPLE (2026-08-14)** — Issue: a question opened "In the drilling-machine example,
  select every need the purchase actually serves" and no drilling machine appeared anywhere on the
  page; its options then referred to "the certificate" and "more than a decade of study" as if they
  had been introduced. Cause: `addAuthoredMultiSelect` had no `caselet` field, so the twenty
  authored SPMS multiple-select items had no way to carry a case even when their stem named one —
  the authoring leaned on the lesson delivered earlier in the run to supply the example. That is
  memory rather than evidence on the page, and it fails outright in the examiner, where Section B is
  these same twenty items sat cold with no lesson at all. One of the four (`SPMS-M07-L01`'s
  ride-hailing MoSCoW list) was not in its lesson either, so it was answerable only from the
  transcript. Fix: the builder passes `caselet` through and the four items that name an example now
  display it, written from their own lecture's clean transcript and withholding the classification
  the question asks for; stems point at the case rather than at the lecture. Options, `answers` and
  `diagnoses` are unchanged. Audited across all 816 questions in two passes — deictic phrasing and
  proper nouns — and the defect exists nowhere else in the bank. Evidence:
  `evidence/2026-08-14/t6-example-questions-show-their-example/verification.md`. Watch item: fifteen
  of the twenty MSQ stems still ask what "the lecture" said rather than what is true, which trains
  recall of a session instead of the idea.

- **I-EXPLOIT (2026-08-12)** — Issue: the examiner's results dashboard told candidates that ticking
  generously under negative marking "is rational on this shape", and it was right about the mock and
  wrong about the exam. Cause: all eight authored SPMS multiple-select items carry 3 correct options
  of 4, so with the floor, ticking everything scores full marks — verified live at `16 / 16` with no
  Section A answered at all. The advice was computed from the items in front of it without asking
  whether those items reproduced the real paper's trade-off. Fix: the analysis now computes whether
  tick-everything is optimal across the paper's items and, when it is, renders it as a **defect
  notice** rather than a strategy, telling the candidate not to carry the habit into the real paper.
  The bank itself still needs a spread of 1-, 2-, and 3-correct shapes. Recorded as **LAW-53**.
  Evidence: `evidence/2026-08-12/t6-examiner-product-and-insights/verification.md`.
- **I-OVERCLAIM (2026-08-12)** — Issue: the "where it broke down" panel told learners things the
  paper had not measured — "you can say what it means but not use it on a case" — when explaining had
  never been tested. Cause: the diagnosis was written as a five-rung ladder and the copy for each
  rung asserted that every rung below it had been cleared. Measured against the bank, scored items
  only ever ask for rungs 3–5; recognise and explain belong to primers, which never appear on a
  paper, so two of the five strings were unreachable and the third was an inference presented as an
  observation. Fix: the panel reports the observed pair only — the hardest thing answered right and
  the easiest thing answered wrong — and where nothing was cleared it says that instead of inventing
  a floor. Same evidence file.

- **I-DARK (2026-08-12)** — Issue: every explanatory hover in the app showed nothing. Cause: all
  seven used the native `title` attribute, which waits ~1s, never fires on keyboard focus, and never
  fires on touch — so each marker's `cursor: help` and `:focus-visible` ring promised an explanation
  to three input methods and delivered to at most one. On a phone, every explanation in the product
  was unreachable. Fix: one shared `.tip` bubble on `data-tip`, hover/focus/tap/Esc, with the
  accessible name left on the trigger so nothing is announced twice. Recorded as **LAW-51**.
  Evidence: `evidence/2026-08-12/t6-dark-mode-and-mobile/verification.md`.
- **I-STATE (2026-08-12)** — Issue: the four evidence states were four identical circles differing
  only in fill, against a standing rule that they stay distinguishable without colour or motion.
  Cause: the rule was being satisfied indirectly, by the text label beside each dot, so the mark
  itself carried nothing a reader had not already been told — and the hues could not have carried it
  anyway (measured: within 1.2:1 in grayscale; 0.05 OKLab apart under deuteranopia). Fix: four
  silhouettes — filled disc, half-filled disc, diamond, empty ring — with hues unchanged and
  reinforcing. `tools/check-palette.mjs` now asserts shape-distinctness, so the four cannot quietly
  collapse back into four circles.
- **I-MOBILE (2026-08-12)** — Issue: answering a question on a phone meant scrolling 370px past the
  last option to reach Submit, with the first option starting past the half-way line. Cause: desktop
  density carried onto a phone — two stacked headers costing 140px, of which the top one showed the
  brand, a Term 6 sparkline, and the appearance control mid-question, plus a sticky-bar hint about
  arrow keys shown to thumbs. Fix: global header hidden while a question is open, action bar made
  sticky, keyboard hint keyed to `pointer: coarse`. Submit is now reachable without scrolling.
  Measured before and after at 375x812 with `tools/browser-checks/ui-audit.js`.
- **I-SCALE (2026-08-12)** — Issue: a documented four-step corner scale had drifted back to nineteen
  literal radii, and the type scale to eighteen literal sizes including 9px and 10px. Cause: the
  scale lived in a comment, which describes an intention rather than enforcing one; each new rule
  copied a nearby value at no cost and left no trace. Fix: tokens for both, and a grep-able check in
  **LAW-52** plus `radiiOffScale` in the UI audit probe.
- **I1 (2026-07-16)** — Issue: product art direction was coherent for the homepage but incomplete
  across market, questions, feedback, motion, completion, and results. Cause: the creative thesis
  had not been translated into product-wide state rules. Fix: added `docs/design/ART_DIRECTION_SYSTEM.md`.
  Evidence: `docs/design/ART_DIRECTION_SYSTEM.md`; implementation is `IMPLEMENTED` and visual acceptance is
  `WAITING_REAL_BROWSER`.
- **I2 (2026-07-16)** — Issue: full experience lacked a canonical route/state/test contract.
  Cause: prototype behavior and learning-engine behavior evolved separately. Fix: added
  `docs/design/GAME_UX_LOOP.md` with state flags, invariants, scenarios, goals, and release gate. Evidence:
  `docs/design/GAME_UX_LOOP.md`; real-browser acceptance is `WAITING_REAL_BROWSER`.
- **I3 (2026-07-16)** — Issue: overlapping creative, UX, prototype, engine, persona, and historical
  documents had no explicit authority order. Cause: briefs arrived across phases and tools. Fix:
  added `docs/governance/DESIGN_SOURCE_INDEX.md` and its conflict register. Evidence:
  `docs/governance/DESIGN_SOURCE_INDEX.md`.
- **I4 (2026-07-16)** — Issue: project memory depended on a short Claude-specific file and
  conversation context. Cause: no Codex-native living index, evidence vocabulary, or close-out
  ritual. Fix: installed `AGENTS.md`, ledgers, changelog, evidence rules, and coordination charter.
  Evidence: `evidence/2026-07-16/admin-system-verification.md`.
- **I5 (2026-07-16)** — Issue: moving only the project folder to macOS could leave launch steps,
  browser-local prototype state, and optional art dependencies ambiguous. Cause: the old transfer
  note predates the web vertical slice and current operating system. Fix: added `docs/ops/MAC_TRANSFER.md`,
  a portable `tools/start-mac.sh`, Mac-targeted launch configuration, and integrity checks.
  Evidence: `evidence/2026-07-16/mac-transfer-prep.md`.
- **I6 (2026-08-10)** — Issue: the broad product slice put cinematic identity, character,
  currency, market, setup, and quests before a learner could reach exam practice. Cause: product
  breadth was treated as the active goal before the revision loop proved it could carry a course.
  Fix: installed `docs/briefs/T6_REVISION_FALLBACK.md` and the verified BRGSA ten-run route with direct
  cold-mock access, source IDs, immediate feedback, cross-surface repairs, chain-break synthesis,
  local isolation, and guarded readiness. Evidence:
  `evidence/2026-08-10/t6-brgsa-fallback/verification.md`.
- **I7 (2026-08-10)** — Issue: Browser acceptance found a repaired miss labeled as still queued and
  a completed-run count that lagged on results. Cause: destination summaries were derived from a
  historical response or only refreshed when another screen rendered. Fix: derive repair labels
  from the current queue and update all destination summaries immediately after the state mutation.
  Evidence: `evidence/2026-08-10/t6-brgsa-fallback/verification.md`; prevention: `docs/governance/BUG-LAWS.md`
  LAW-11.
- **I8 (2026-08-10)** — Issue: the first fallback still asked students to interpret runs, Resolve,
  chain breaks, and an unavailable three-subject roadmap before they could understand the size of
  Term 6 or the next useful action. Cause: useful repetition mechanics were presented through the
  old product metaphor, while progress lived at the course/run level rather than the concept
  level. Fix: replaced the active route with a four-subject, 64-concept dashboard using Strong,
  Developing, Needs practice, and Not started; added one-click weak-first practice, causal bridges,
  later different-perspective re-attempts, clickable concept practice, ten study sets and direct
  full mocks for every subject, consistent result states, narrow layouts, and automatic resume.
  Evidence: `evidence/2026-08-10/t6-dashboard-all-subjects/verification.md`; prevention:
  `docs/governance/DESIGN_SOURCE_INDEX.md` C12 and `docs/governance/BUG-LAWS.md` LAW-11 through LAW-13.
- **I9 (2026-08-11; revised 2026-08-11)** — Issue: two quick correct answers could produce Strong,
  confidence was unknown, and conventional MCQs exposed answer-shape cues while offering little
  framework construction. Cause: the first dashboard optimised visible movement before defining a
  durable evidence threshold or item pedigree. Fix: installed five-attempt / four-correct /
  three-type / two-block gates, sampled confidence, time qualifiers, mixed formats, least-recent
  rotation, and a 728-item bank whose 565 active items quarantine every detected legacy
  option-shape risk. Applied evidence can now come from a new case or a valid unassisted reasoning
  step; whole-chain completion remains separately visible instead of being a permanent universal
  gate. Evidence: `evidence/2026-08-11/t6-research-integration/verification.md`; prevention:
  `docs/governance/BUG-LAWS.md` LAW-14, LAW-16, and LAW-22.
- **I10 (2026-08-11)** — Issue: the dashboard showed too many surfaces at once, the concept list
  felt like inventory, and question cards duplicated internal metadata and decorative accents;
  one hierarchy pass also made the case larger than the actual task. Cause: information and visual
  emphasis were added independently instead of being ranked by the learner's next decision. Fix:
  staged the dashboard into three tabs, replaced the list with an honest evidence trend and one
  two-concept module, made the task the only question headline, kept genuine cases as quiet body
  text, removed fake match cases and ornamental borders, and hid audit-only metadata. Evidence:
  `evidence/2026-08-11/t6-evidence-challenges/verification.md`; prevention:
  `docs/governance/DESIGN_SOURCE_INDEX.md` C14–C15 and `docs/governance/BUG-LAWS.md` LAW-15.
- **I11 (2026-08-11)** — Issue: the first cleanup made case text quiet inside its own box while the
  bold dependent instruction sat outside, visually classifying the case as an optional note. Cause:
  size hierarchy was corrected without preserving the semantic dependency or recognising that the
  case is the substantive question. Fix: use one aligned prompt flow, larger semibold case text,
  and a compact bold instruction; case-free questions receive no redundant box and keep their
  large heading. Evidence:
  `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`; prevention:
  `docs/governance/DESIGN_SOURCE_INDEX.md` C15 and `docs/governance/BUG-LAWS.md` LAW-17.
- **I12 (2026-08-11)** — Issue: every selected subject displayed “Recommended now,” and unanswered
  boss/prompt surfaces used cyan without a state meaning. Cause: a subject-local next action was
  worded like a single global recommendation and guidance color became category decoration. Fix:
  remove the global claim, use action-specific labels, neutralise unanswered practice surfaces,
  and retain color only for selection, primary action, progress, focus, and feedback. Evidence:
  `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`; prevention:
  `docs/governance/DESIGN_SOURCE_INDEX.md` C16 and `docs/governance/BUG-LAWS.md` LAW-18.
- **I13 (2026-08-11)** — Issue: even after the case/task hierarchy was corrected, a tinted prompt
  panel, a redundant “Reasoning chain” strip, and separate bordered cards for every response step
  created distance without changing meaning or interaction. Cause: semantic grouping was expressed
  through repeated containers instead of alignment and rhythm. Fix: place the case, directive, and
  response work directly on one warm-white surface; remove the redundant strip; flatten boss,
  match, and cloze wrappers; retain only bounded inputs, post-answer feedback, and subtle dividers
  between dependent steps. Evidence:
  `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`; prevention:
  `docs/governance/DESIGN_SOURCE_INDEX.md` C15 and `docs/governance/BUG-LAWS.md` LAW-19.
- **I14 (2026-08-11)** — Issue: a first-cohort student needed practice that could span recognition,
  cases, explanation, and connected reasoning, but an “exam simulation” would invent unsupported
  T6 timing, scoring, and section rules. Cause: generic practice and exact-paper fidelity were
  treated as one decision. Fix: added learner-selected recognition, application, generation, and
  mixed practice with immediate-teaching or end-held feedback, while repeatedly naming it generic
  practice rather than a paper replica or score prediction. Evidence:
  `evidence/2026-08-11/tester-launch/verification.md`; prevention: `docs/governance/DESIGN_SOURCE_INDEX.md` C17.
- **I15 (2026-08-11)** — Issue: written practice was absent, while automatic browser grading would
  make a false precision claim and held-feedback mode initially exposed the rubric before results.
  Cause: generation and scoring were coupled, and the feedback boundary covered selected answers
  but not answer-shaped self-review material. Fix: added 64 source-grounded short-answer surfaces
  with write-first rubrics and exemplars, recorded them as unscored self-review, denied independent
  Strong credit, and deferred the rubric/exemplar in held-feedback mode. Evidence:
  `evidence/2026-08-11/tester-launch/verification.md`; prevention: `docs/governance/BUG-LAWS.md` LAW-20.
- **I16 (2026-08-11)** — Issue: potential-user access needed stable delivery and a usable feedback
  loop without accidentally publishing live learner state, owner sources, CLA analysis, or adding
  silent telemetry. Cause: the local prototype had no explicit public-asset boundary or cohort
  operating policy. Fix: added an allowlisted build, production worker, health and security
  headers, release tests, privacy/security/tester policies, and a moderated WhatsApp community
  playbook while keeping progress browser-local. Evidence:
  `evidence/2026-08-11/tester-launch/verification.md`; prevention: `docs/governance/DESIGN_SOURCE_INDEX.md` C19.
- **I17 (2026-08-11)** — Issue: confidence appeared after every scored question and an early
  direction considered deliberately reducing confidence after a confident error. Cause:
  metacognitive diagnosis, motivational feedback, and punishment were treated as one mechanism.
  Fix: sample behavioural confidence only on high-value diagnostic events, reveal it only after a
  response exists, allow a penalty-free skip, and route confident errors to contrastive correction
  plus independent repairs. Confidence changes neither correctness, score, rewards, secret
  difficulty, nor identity. Evidence: `evidence/2026-08-11/t6-research-integration/verification.md`;
  prevention: `docs/governance/BUG-LAWS.md` LAW-22.
- **I18 (2026-08-11)** — Issue: boss grading either promoted a broken chain or risked erasing valid
  steps. Cause: one boolean represented both concept-level reasoning and whole-chain completion.
  Fix: persist passed and failed steps separately, allow a valid unassisted applied step to count
  for the concept it tests, keep failed steps open, and display whole-chain completion separately.
  Evidence: `evidence/2026-08-11/t6-research-integration/verification.md`; prevention:
  `docs/governance/BUG-LAWS.md` LAW-14.
- **I19 (2026-08-11)** — Issue: short-answer practice could imply an automatic grade and leak its
  rubric during held-feedback practice. Cause: generation, scoring, and feedback timing were
  coupled. Fix: require writing before criteria, expose criteria before the exemplar only in
  learning mode, store self-review as unscored, exclude it from Strong and percentages, and defer
  all answer-shaped material to final review in a held-feedback check. Evidence:
  `evidence/2026-08-11/t6-research-integration/verification.md`; prevention: `docs/governance/BUG-LAWS.md` LAW-20
  and LAW-23.
- **I20 (2026-08-11)** — Issue: a first-cohort practice check could leak correctness through the
  dashboard before the final review even when explanations were hidden. Cause: attempts were
  written to the learner profile as each response was saved. Fix: stage every held-feedback
  response in the active session, show neutral save confirmation, and commit evidence only when
  the final review opens. Evidence: `evidence/2026-08-11/t6-research-integration/verification.md`;
  prevention: `docs/governance/BUG-LAWS.md` LAW-24.
- **I21 (2026-08-11)** — Issue: opening the app to testers could expose the complete client bank to
  anonymous students, shared caches, and search indexing, while a shared password would be hard to
  revoke safely. Cause: the local prototype had no cohort identity boundary and the current
  browser scheduler loads complete bank scripts. Fix: selected one-time email Access with
  individual revocation, owner-only administration, no-index responses, private caching, edge rate
  limiting, and an explicit no-DRM claim boundary. The exact protected route is now live and the
  allowlist contains only the owner bootstrap address; tester access still waits for owner-supplied
  emails. Evidence: `evidence/2026-08-11/tester-access-admin/verification.md` and
  `evidence/2026-08-11/cloudflare-protected-domain/verification.md`; prevention:
  `docs/governance/DESIGN_SOURCE_INDEX.md` C20–C21 and `docs/governance/BUG-LAWS.md` LAW-25.
- **I22 (2026-08-11)** — Issue: tester access, release health, feedback instructions, and
  announcements were scattered across provider dashboards and documents. Cause: the release had
  no truthful owner operations surface. Fix: added the Dungeon Control Room with live
  health/manifest checks, an access/revocation workflow, release checklist, structured feedback
  template, and an announcement composer that copies but never sends automatically. It shows
  unavailable dependencies as failures instead of fabricating usage or tester counts. Evidence:
  `evidence/2026-08-11/tester-access-admin/verification.md`.
- **I23 (2026-08-11)** — Issue: the private production Control Room reported Healthy but could not
  load its release manifest. Cause: the build wrote owner-visible metadata to the package root
  while the static service exposed only the client root. Fix: emit the same secret-free manifest
  into both locations and verify it through the deployed dashboard. Evidence:
  `evidence/2026-08-11/tester-access-admin/verification.md`; prevention: `docs/governance/BUG-LAWS.md` LAW-27.
- **I24 (2026-08-11)** — Issue: cohort scale suggests useful automated review, but activating
  agents before consented data, retention/deletion, owner review, and access adapters would create
  unsafe invisible authority. Cause: agent roles were easier to name than their data and action
  boundaries. Fix: added three paused charters, versioned pseudonymous contracts, synthetic-only
  fixtures, forbidden personal/raw-response fields, and an activation check that intentionally
  fails until every backend/consent/review/owner gate is true. Three deployment schedules are now
  registered but paused; the initial create operation persisted them as ACTIVE despite a paused
  request, so they were explicitly corrected and re-read before any interval elapsed. No run or
  external action occurred. Evidence: `evidence/2026-08-11/tester-agent-readiness/verification.md`;
  prevention: `docs/governance/BUG-LAWS.md` LAW-28–29.
- **I25 (2026-08-11)** — Issue: the owner dashboard explained tester access but still sent the
  owner to Cloudflare for every grant and revocation. Cause: no server-side authority boundary
  connected an owner-only control to the dedicated Access group. Fix: added direct email
  add/list/revoke controls and a prepared edge endpoint with owner JWT/email validation,
  same-origin writes, email-only group invariants, protected owner membership, credential-free
  browser code, and truthful setup/unavailable states. The edge secret and group are now live;
  exact-domain owner interaction remains waiting on the owner's Access sign-in and a real owner-
  approved tester address. Evidence:
  `evidence/2026-08-11/tester-dashboard-access-management/verification.md` and
  `evidence/2026-08-11/cloudflare-protected-domain/verification.md`; prevention: `docs/governance/BUG-LAWS.md`
  LAW-30.
- **I26 (2026-08-11)** — Issue: the prepared Cloudflare proxy still depended on a private hosting
  origin and bypass credential, while tester and owner paths needed different identity boundaries.
  Cause: the first deployment design reused the existing Sites artifact instead of making the
  Cloudflare release self-contained. Fix: deployed the allowlisted assets directly with the
  Worker, kept every owner asset/API under the more-specific admin Access application, blocked
  legacy admin aliases, stored only the group credential as an edge secret, deleted the temporary
  deployment token, and added rapid-request containment. Anonymous learner, bank, and admin denial
  are verified at the edge; the exact-domain owner Control Room is Browser-verified Healthy,
  Connected, Allowlisted, and empty. The learner route reaches its emailed-code screen; post-code
  learner acceptance remains explicit. Evidence:
  `evidence/2026-08-11/cloudflare-protected-domain/verification.md`; prevention: `docs/governance/BUG-LAWS.md`
  LAW-25, LAW-30, and LAW-31.
- **I27 (2026-08-11)** — Issue: the live owner dashboard showed health and release metadata as
  unavailable even while tester management was connected. Cause: relative requests escaped the
  owner Access path and entered the learner application's distinct sign-in audience. Fix: added
  owner-path health and manifest routes, selected them only on `/dungeon/admin`, preserved local
  fallbacks, and redeployed the embedded allowlist. The second Browser pass reported Healthy,
  Connected, Allowlisted, and zero testers. Evidence:
  `evidence/2026-08-11/cloudflare-protected-domain/verification.md`; prevention: `docs/governance/BUG-LAWS.md`
  LAW-34.
- **I28 (2026-08-11)** — Issue: the owner could reach the learner login but not enter the site.
  Cause: the learner group contained only the protected Cloudflare bootstrap address; the separate
  owner/browser address had never been registered. Fix: added the known owner/browser address to
  the same exact-email group managed by the Control Room and configured a concise ask-for-access
  denial for verified but unapproved emails. The dashboard now reports one intended approved
  learner address, and allowlist status remains hidden until inbox verification. Evidence:
  `evidence/2026-08-11/cloudflare-protected-domain/verification.md`; prevention: `docs/governance/BUG-LAWS.md`
  LAW-35.

- **I29 (2026-08-11)** — Issue: on the live first-login agreement step the email form was set
  `hidden` in the DOM but still painted 174 pixels of operable controls under the agreement.
  Cause: `app/login.css` set `display: grid` on the `form` element selector, and an author type
  selector outranks the user-agent `[hidden]` rule. Fix: added `[hidden] { display: none !important; }`
  to `app/login.css`, matching the guard `app/t6.css` already carried, and confirmed on the live
  page that the stale form collapses to zero height at desktop and at 390 pixels. Truthful
  interaction axis: a gate that renders as partly dismissed invites the learner to bypass it.
  Evidence: `evidence/2026-08-11/learner-backend-and-agreement/verification.md`; prevention:
  `docs/governance/BUG-LAWS.md` LAW-36.
- **I30 (2026-08-11)** — Change: learner progress moved from browser-only storage to per-email
  Cloudflare D1 records, with the local copy retained as an offline fallback and a dirty-flag
  reconciliation so an unsynced local run is never overwritten by a staler server copy. Persistence
  safety axis: progress now survives a cleared browser and a device change, and revocation deletes
  a tester's sessions and server-side progress in the same action. Sign-out flushes the pending save
  chain before releasing the single-browser lock. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`.
- **I31 (2026-08-11)** — Change: admission is now a single binary allowlist check with no emailed
  code, and the first approved login is held at a plain-language agreement step. Truthful
  interaction axis: the denial states one fixed private message and never reveals whether an
  address is on the list; the agreement records only version and acceptance time, and the owner
  direction uses acknowledgement controls rather than a signature. Country locking is deliberately
  country-level, is described to testers as an owner review prompt, and is never claimed as proof
  of misconduct. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`.
- **I32 (2026-08-11)** — Change: the closed tester agreement is verified through the complete
  production lifecycle rather than only at the gate. A fresh temporary approved address was held
  at the two required acknowledgements, entered the learner dashboard with `Saved online`, signed
  out, and was revoked; the owner list returned to its original nine testers. Truthful interaction
  and persistence axes: acceptance is a real stored gate, online state is visible, and cleanup did
  not touch any real tester account. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`.

- **I33 (2026-08-11)** — Issue: a one-click learning run could begin with a concept the learner had
  never seen, while dumping all prerequisite information up front would make the run another study
  page. Cause: scheduling had repair and rotation but no temporary knowledge-layer state. Fix:
  added 64 source-traceable, support-only primers interleaved one new primary concept at a time;
  level 1 gives the minimum fact/connection, misses restore applied and misconception layers, and
  two harder successes or Strong evidence suppress support. Primer responses never create mastery
  evidence or enter held-feedback checks. Learning-integrity axis: assistance is explicit and
  intentionally fickle. Evidence: `evidence/2026-08-11/t6-adaptive-primer-community/verification.md`;
  prevention: `docs/governance/BUG-LAWS.md` LAW-37.
- **I34 (2026-08-11)** — Issue: the most important evidence was split between the hero, subject
  cards, and a trend hidden under Concepts. Cause: the staged dashboard treated the trend as
  inspection detail rather than orientation. Fix: placed a five-axis Term 6 mastery matrix and the
  selected-subject trend directly after the next-action hero, with an accessible value list and
  concepts lower in the page. Visual/accessibility axis: the first two scrolls now carry action,
  breadth, and direction without making canvas the only representation. Evidence:
  `evidence/2026-08-11/t6-adaptive-primer-community/verification.md`.
- **I35 (2026-08-11)** — Issue: required WhatsApp participation needed a reminder workflow, but the
  web app cannot verify external membership and the first draft exposed the private invite inside
  anonymous HTML. Cause: link-opening, membership, reminder, and message-sending were initially
  collapsed into one implied state. Fix: disclose the invite only after approved-email admission,
  gate a separate self-attestation on opening it, record three minimal timestamps, show signed-in
  reminders, and add per-person/bulk Control Room bumps that copy rather than send. The 390-pixel
  tester rows were also changed to stack actions after Browser review exposed character-by-
  character email wrapping. Truthful interaction/privacy axis: no click is called verification and
  no copied reminder is called sent. Evidence:
  `evidence/2026-08-11/t6-adaptive-primer-community/verification.md`; prevention: `docs/governance/BUG-LAWS.md`
  LAW-38 and LAW-39.
- **I36 (2026-08-11)** — Issue: the homepage opened on a static `0 of 64` counter, put subject
  choice below the fold, and hid the most configurable part of the product inside a dialog. Cause:
  the staged layout optimised for one next action and treated everything else as secondary. Fix:
  subject rail first, a live evidence trendline and honest momentum sentence in the hero, an inline
  mix-and-match builder, a factual distance-travelled strip, and the holistic matrix and totals
  further down one continuous scroll. Truthful-interaction axis: momentum and story copy are
  computed from recorded attempts, name a dip as a dip, and never predict a result. Evidence:
  `evidence/2026-08-11/t6-dynamic-homepage/verification.md`.
- **I37 (2026-08-11)** — Issue: every builder control has to change the run, but pool filters can
  quietly collapse into each other. Cause: length targets clamp to the pool, and on a fresh profile
  "new ground" selects the same questions as "anything". Fix: compute each option's pool before
  rendering, disable an option that cannot narrow or lengthen anything with the reason shown, and
  collapse a selection that has become identical to a shorter one. Truthful-interaction axis:
  LAW-01 is enforced by construction rather than by copy. Evidence: same file.
- **I38 (2026-08-11)** — Issue: long-form matching repeated four long answer cards under every row,
  and a wrong selection painted as an ordinary selection after checking. Cause: the layout treated
  the long side as options, and `.choice:has(input:checked)` inherits its argument's specificity, so
  it outranked `.choice.wrong`. Fix: a matching board with statements side by side, one slot each,
  and a docked tray of label tablets placed by click, drag, or keyboard; resolved-state rules now
  restate the checked case. Readability and accessibility axes: reading load drops from four
  repetitions to one, and correctness is never the weaker visual signal. Evidence: same file;
  prevention: `docs/governance/BUG-LAWS.md` LAW-41.
- **I39 (2026-08-11)** — Issue: six active testers read as `Signed in`, `Has progress`, and
  `Not agreed yet` at once. Cause: the agreement version was compared only in the login handler, so
  sessions issued under superseded terms kept working until the cookie expired, and the Control Room
  chip could not tell "accepted older terms" from "never accepted". Fix: carry the accepted version
  on the session lookup, reject stale sessions with `AGREEMENT_REQUIRED`, and split the chip into
  `Agreed`, `Older terms`, and `Never agreed`. Truthful-interaction and consent axes: a terms change
  now actually reaches the cohort, and the owner view stops implying a breach that never happened.
  Evidence: same file; prevention: `docs/governance/BUG-LAWS.md` LAW-40.
- **I40 (2026-08-12)** — Issue: a wrong answer gave a verdict and no reason. The panel showed
  `Not yet — this idea will return`, restated the concept explanation, and hid the correct answer
  behind a disclosure, never referring to what the learner had chosen; on `match` questions the
  explanation is the two principles concatenated, so it restated both answers and diagnosed nothing.
  Cause: `question.misconceptions` was a per-option slot that was validated, captured, and used for
  scheduling, but filled with placeholder strings and never rendered — three of four pipeline stages
  were built and the last was missing. Fix: derive each distractor's meaning from provenance the
  generator already holds (distractors are borrowed from other concepts), author the 78 with no
  provenance, and rebuild the panel as verdict → what this choice assumed → catch it earlier → what
  governs this → the complete answer → why it connects. Learning-integrity axis: feedback now names
  the gap a specific choice reveals instead of reporting only correctness. 2,943 diagnoses on the
  active bank, zero generic fallbacks. Evidence:
  `evidence/2026-08-12/t6-option-diagnoses/verification.md`; prevention: `docs/governance/BUG-LAWS.md` LAW-43 and
  LAW-44, plus a build gate in `tools/validate_t6_bank.js`.
- **I41 (2026-08-12)** — Issue: rebuilding the panel to explain more made it repeat itself — the
  governing principle appeared in the diagnosis, again as `What governs this question`, and again in
  the answer key, with the causal chain appearing twice more. Cause: each block was written to stand
  alone without accounting for what the surrounding panel already prints. Fix: diagnosis copy names
  the confusion and contrast only, and the governing line is suppressed when the answer key already
  states it verbatim. Readability axis: explaining more is not the same as printing more, and a
  learner who reads the same sentence three times stops reading the panel. Evidence: same file.

- **I42 (2026-08-12)** — Issue: the match board's label tray read as unfinished, and the board
  gave no answer to "where do I look first". Cause: `.tray-items` wrapped `inline-grid` tablets
  sized by their own text, producing `193/268/191/266`px across two ragged rows, with each tablet
  wider than the 162px slot it drops into; and four equally weighted 7-line statement columns
  carried no stated order. Fix: the tray now shares the statements' grid track via
  `--statement-count` on `.match-board` with matched gaps, so every tablet is one width and sits
  directly under its slot; statements are numbered against lettered labels. Visual-coherence axis:
  an affordance that is visibly larger than its target contradicts the interaction it is teaching.
  Evidence: `evidence/2026-08-12/t6-ui-alignment-pass/verification.md`; prevention: `docs/governance/BUG-LAWS.md`
  LAW-45.
- **I43 (2026-08-12)** — Issue: a UI audit run by impression would have "fixed" two things that
  were not broken. Cause: `align-items: baseline` gives items of different heights different `top`
  values, which a row-detecting probe reads as a wrap; and layouts measured mid-render report touch
  targets that do not exist once settled. Fix: both were re-measured on a settled layout and
  rejected before any change. Truthful-reporting axis: an audit that cannot distinguish its own
  artifacts from defects will quietly damage a working layout. Evidence: same file.

- **I44 (2026-08-12)** — Issue: the app could measure a learner but could not teach one, so it only
  served people who had already studied. Cause: the bank generates ~12.8 surfaces per concept by
  recombining four harvested sentences, and the "primer" meant to introduce each idea drew its text
  from a different seed question than the case it preceded — measured at 19% mean vocabulary overlap
  with the case it was supposed to prepare, 0% in 10 of 64 cases. Fix: added a lecture-grain teaching
  layer (`app/sets/t6_lessons.js`, `tools/build_t6_lessons.mjs`) and made teach-before-test a
  scheduling invariant in `layeredQueue()`; lessons are unscored and create no evidence. Evidence:
  `evidence/2026-08-12/t6-teaching-layer/verification.md`. BRGSA is complete at 50 of 50 lectures
  (152 of 152 scheduled questions taught); 233 of 283 lectures across IBM/SCLM/SPMS remain, and the
  validator reports that backlog rather than hiding it. Content stays
  `WAITING_OWNER_CONTENT_ACCEPTANCE`.
- **I45 (2026-08-12)** — Issue: applied questions were answerable by topic matching and not by
  reasoning, and reinforced the wrong lecture when answered correctly. Cause: distractor selection
  ranked candidates purely by word-count distance to defeat a length cue, evicting authored
  same-concept wrong answers in 59 of 64 case questions; and `conceptData()` drew the explanation
  from a different seed question than the case. Fix: `relevantWrong()` maximises relevance subject to
  the length guard rather than instead of it, and case questions now carry `caseSource`,
  `caseExplanation`, and `caseLink`. Result: 0 of 64 with zero same-concept distractors, 64 of 64
  with at least two, option-shape errors still zero. Evidence: same file. Laws: LAW-47, LAW-48.
- **I46 (2026-08-12)** — Issue: learner-facing copy used terminology the course never uses
  ("pre-registered stopping rule", 0 occurrences in 50 BRGSA transcripts). Cause: nothing checked
  question or teaching vocabulary against the source material. Fix: a vocabulary gate in
  `tools/validate_t6_bank.js` measuring first use against the lossless `graph_source/` chunks in
  course order; it caught three authoring errors in the pilot lessons during the same session.
  The originating instance is now closed: `sample_logic`'s correct answer reads "Run the test to
  completion at the pre-calculated sample size", the M02 lecture's own phrasing. The shorter answer
  also cleared a length cue that had been excluding the question from scheduling entirely
  (`excludedLegacyMcqs` 37 → 36, scheduled 151 → 152) — so vocabulary accuracy and answerability
  turned out to be the same fix. Deferred: `18 visitors per arm` remains, covered by the gloss.
  Law: LAW-49.
- **I47 (2026-08-12)** — Issue: a batch of six lesson records failed to parse, and the file could not
  be validated at all until every one was found. Cause: `explainer: [ … ]` closed with `},` instead of
  `],` — eight times across three authoring batches — because arrays and objects sit at the same
  indent inside a lesson record, and `SyntaxError` names only the first failure. Fix: scan the whole
  file for the defect class with one `awk` pass after any batch edit instead of parse-fix-repeat.
  Truthful-reporting axis: a file that does not parse yields no validator signal, so a green run is
  unavailable rather than merely absent — the failure mode is silence, not a warning. Evidence:
  `evidence/2026-08-12/t6-teaching-layer/verification.md`. Law: LAW-50.
- **I48 (2026-08-12)** — Issue: a primer could still run ahead of its own lecture's lesson, which is
  the exact defect the teaching layer exists to prevent. Cause: `layeredQueue()` computed pending
  lessons from the *scored question* and then pushed the primer without checking the primer's own
  `sourceIds`; the two differ routinely (`brgsa_m1_demand_primer` cites M01-L01, the `survey_bias` it
  introduces cites M01-L05), so the primer appeared at step 4 against a lesson arriving at step 9.
  The code comment asserted the primer was covered while the implementation never inspected it.
  Fix: extracted `teachFirst(surface, conceptId)` and applied it to the primer on its own terms.
  Learning-integrity axis: the invariant was believed rather than measured for a full session.
  Found by executing LAW-47's own verify step across a live queue instead of trusting the comment —
  now re-run across all 9 BRGSA study sets and the mixed builder from an empty `lessonsRead`, zero
  violations. Evidence: `evidence/2026-08-12/t6-teaching-layer/verification.md`. Law: LAW-47.

- **I49 (2026-08-12)** — Issue: eight of ten newly authored IBM lessons are undeliverable — no learner
  will ever see them. Cause: a lesson reaches a session only via `layeredQueue()` placing it ahead of
  a scored question that cites its lecture, and the bank cites just 16 of IBM's 78 lectures (two per
  module). Authoring by module rather than by citation produces ~2 useful lessons per 10. Found by
  checking which lecture ids the banks actually cite, then confirming in the browser that only
  `IBM-M01-L03` and `IBM-M01-L07` are ever queued. Fix: `tools/check_lesson_file.mjs` now loads the
  banks, warns when authored lessons are undeliverable, and prints the remaining **cited** lectures
  as the work queue; the protocol leads with the distinction. Truthful-reporting axis: "10 lessons
  authored" read as progress while 8 of them moved no coverage. Remaining work for full scored
  coverage is 46 lectures, not 233. BRGSA carries 17 undeliverable lessons from the same cause,
  retained because that subject is deliberately complete. Evidence:
  `evidence/2026-08-12/t6-teaching-layer/verification.md`.

- **I50 (2026-08-12)** — Issue: the teaching layer could only be met one lesson at a time inside
  practice, and nothing in the app said whether a given lesson was reachable at all. Fix: a
  `Read the lessons` dashboard tab listing every lecture per subject, expandable to the full lesson,
  each labelled *Taught in practice* / *Read-only* / *No lesson yet*. Learning-integrity axis:
  reading here does not write `profile.lessonsRead`, because that map is the teach-before-test gate
  and recording a skim would disable the gate for every lesson skimmed — verified by opening all 50
  BRGSA lessons and confirming `lessonsRead` stayed 0. Truthful-reporting axis: the first cut counted
  any citing question and reported 44 reachable BRGSA lectures; 11 are cited only by
  `optionShapeRisk` questions that no scheduling path serves, so the honest number is 33, matching
  the validator. Evidence: `evidence/2026-08-12/t6-teaching-layer/verification.md`.
- **I51 (2026-08-12)** — Issue: an ad-hoc LAW-47 check reported 31 violations across BRGSA and IBM
  set 9 that did not exist. Cause: two harness defects, not app defects — the first captured set
  buttons before switching dashboard tabs, so `#set-list` re-rendered and the captured nodes were
  detached; the second omitted the `read[lectureId]` condition, flagging lessons already legitimately
  taught by earlier sets in the same walk. Built cleanly, set 9 has 43 items with 19 correctly placed
  lessons. Fix: use the checked-in `tools/browser-checks/teach-before-test.js`, which re-queries
  buttons per iteration and includes the already-taught condition; re-run clean across 36 sets in all
  four subjects, zero violations. Truthful-reporting axis: a verification script is itself code and
  can report a failure that is not there — a red result needs the same scrutiny as a green one before
  it is acted on or reported. Law: LAW-47.
- **I52 (2026-08-12)** — Issue: the homepage offered the same action several times in different
  places, and the reason to take an action lived apart from the control that took it. Generic
  practice had three entry points all calling `openPracticeSetup()`; sixteen concepts were listed
  twice, with the missing-evidence explanation only in the copy that had no Practise button;
  "N of 16 strong" appeared twice; hide/show nested three levels deep. Cause: five sessions of
  ordering work (C15, C26, C27, C28) each added or moved furniture, and none removed the previous
  arrangement — the disclosures added after C27 had already broken its own "nothing hides" rule.
  Fix: four blocks answering one question each, the inspector merged onto the concept row, and
  `renderRecommendation()` withdrawing whichever route the hero already offers so a duplicate
  cannot reappear as state changes. Visual/motion-coherence axis: an interface accretes duplicates
  one reasonable addition at a time, so periodically **counting** how many ways a single action can
  be reached is worth more than judging any one addition. Accessibility axis: `#subject-sort` was
  measured at 32px against the 44px floor the rest of the dashboard holds, and fixed. Laws:
  LAW-19, LAW-36, LAW-46. Evidence:
  `evidence/2026-08-12/t6-homepage-four-questions/verification.md`.

- **I-TWO-PRODUCTS (2026-08-13)** — Issue: the examiner had become a second product with no way to
  move between the two sides except a button on one dashboard, which made it read as a mode of the
  learning system rather than a place of its own. Cause: it grew out of the learning system, so
  every route into it was an outbound link rather than navigation. Fix: a header Learn/Exam switch
  with a view transition between the sides. **Visual/motion-coherence axis:** motion here carries
  one piece of meaning — direction of travel — so it follows the switch (the examiner is to the
  right, so arriving there moves that way) and the header is pulled out of the moving picture,
  because furniture on both sides that travels with the page says the whole app changed when only
  the content did. Crossings animate and same-side moves do not, so the animation keeps meaning
  something. **Accessibility axis:** three findings, all fixed. The switch was first written as a
  `role="tablist"`, which promises arrow-key movement and one panel per tab, and the examiner side
  is two screens deep — it is now a labelled `role="group"` of two `aria-pressed` buttons. Its
  halves measured 38px against the 44px floor and are now 44, by moving the pill-in-a-pill inset
  from the container's padding onto the thumb rather than by growing the control. And the
  reduced-motion form keeps the browser's cross-fade, shortened, rather than removing the
  transition: less motion, not no signal. **Truthful-interaction axis:** which side the switch
  reports is derived inside `showScreen` from the screen on show, so it cannot drift from the page;
  and the recommended-paper hero repeats the bank shortfall rather than being the one surface where
  the honest warning goes quiet. Laws: LAW-51, LAW-55, LAW-56. Evidence:
  `evidence/2026-08-13/t6-dual-facing-and-sittings/verification.md`.

- **I-MEASUREMENT-FOUNDATION (2026-08-13)** — Issue: Strong could be earned from answer-shaped
  recognition with no signal that a response was too fast to be independent retrieval, while the
  product still had no measured item parameters. Cause: attempts recorded outcomes and confidence
  but had no render/response timing boundary. Fix: an ephemeral monotonic response clock, coarse
  duration bands, and a rapid-response Strong-eligibility gate. **Learning-integrity axis:** speed
  never changes correctness, feedback, scheduling, or confidence and slowness is never penalised;
  it only limits the product's claim. A later audit fixed the edge case where a rapid-correct latest
  attempt could erase an already-earned Strong state; the latest eligible attempt now owns the
  recency gate, while rapid wrong answers still affect the ordinary error rules. **Persistence/privacy axis:** raw milliseconds never enter the
  profile or D1, historical attempts remain eligible, and restored complete responses are unknown
  rather than falsely instant. The threshold remains a labelled hypothesis until real data can
  calibrate it. Law: LAW-57. Evidence:
  `evidence/2026-08-13/t6-measurement-foundation/verification.md`.

- **I-LOCAL-WRITTEN-AUTHORITY (2026-08-13)** — Issue: source-traceable constructed responses still
  ended in learner self-review, so Dungeon could expose a gap but could not proactively judge it or
  route the next repair. Cause: treating every machine judgement as equally unsafe collapsed a
  bounded owner-local practice decision into the same category as official grading and Strong
  evidence. Fix: an owner-authorised local criterion authority with question-bound retrieval, one
  compact structured judgement followed by deterministic citation, schema, English-script, and
  literal answer-evidence validation, with abstention into the existing rubric path. A second call
  to the same checkpoint had doubled latency without creating independent authority.
  **Learning-integrity axis:** the accepted mark is final only for
  Dungeon practice, remains unscored and Strong-ineligible, and an accepted gap schedules another
  question; the examiner never calls it. **Persistence/privacy axis:** the server and model endpoint
  are loopback-only, candidate answers are not written by the grader or calibration report, the
  exact owner-approved model id must match before the local HTTP authority exists, and it never
  serves a LAN client. **Truthful-interaction axis:** model id, evidence, criteria, authority
  boundary, and abstention are visible; a fake-model pass is labelled plumbing evidence rather than
  grading validation. **Accessibility axis:** the new result surface passes the existing responsive
  audit at 1280×800 and 375×812, and genuine 32px controls found during the audit were raised to the
  44px floor. **Real-model follow-through:** the exact owner-approved checkpoint now runs on the M4
  Pro Mac through a private Windows→Mac SSH loopback forward. The first live pass exposed a truthful-
  evidence defect—the model wrapped a literal quote in commentary—so the prompt and schema now
  demand the shortest raw answer substring and the strict validator remains intact. A later owner
  example exposed a separate item-authority mismatch: the landing-page case came from M01-L03 while
  the generated short answer cited only M01-L01 and demanded an unrelated pre-declared-test reason.
  Generated practical questions now ask for a judgement directly, carry both principle and applied
  sources, and use two compact criteria (course understanding; judgement and case evidence). Course
  evidence is prepared after an idle pause without sending partial candidate text; the answer is
  sent only on Check. The one-pass latency and corrected example are re-measured in the newer
  practical-written-answer evidence. The real accepted path and interruption path
  passed at desktop and 375×812 with no horizontal overflow. Synthetic agreement was 26/36 criteria
  with one disputable IBM label retained for owner review; it is not presented as calibration. The
  same review fixed interruption recovery and a separate measurement regression where a rapid
  correct retry could erase an already Strong state. Law: LAW-58. Evidence:
  `evidence/2026-08-13/t6-local-written-authority/verification.md`.

- **I-HOSTED-WRITTEN-AUTHORITY (2026-08-13)** — Issue: a local question-bound marker could not
  serve the website without making the Mac a production dependency, and an early scaffold exposed
  an arbitrary-question coach instead of Dungeon-owned written practice. Cause: internal retrieval
  evaluation and the learner product had been conflated, while local model routing and public
  inference had been treated as the same runtime. Fix: the learner path is now four authored prompts
  with criterion marks only for server-owned rubric questions; the subject-wide analyzer remains
  unlinked internal tooling with no public Worker route. The authored contract is implemented over
  both the private LM Studio path and native Cloudflare Workers AI + Vectorize. **Learning-integrity
  axis:** candidate text is excluded from retrieval, every course claim must survive an independent
  source verifier, invented citations abstain, authored marks remain Strong-ineligible, and the
  examiner has no route. Stray CJK/mojibake triggers one regeneration and then abstention under
  LAW-60. **Persistence/privacy axis:** the
  hosted Worker is session- and same-origin-bound, request-bounded, and limited to 20 checks per
  tester per UTC day; D1 stores only the usage counter and the Worker never logs content. **Truthful-
  interaction axis:** written practice remains usable through transparent rubric fallback while
  machine checking stays unavailable until activation, exact model approval, and corpus approval
  agree; local calibration cannot be claimed for the hosted
  checkpoint. **Performance/cost axis:** native bindings avoid a laptop relay and the per-tester cap
  creates a measurable ceiling before activation. Current evidence is automated and dry-run only;
  transcript upload, actual hosted-model calibration, updated consent, remote D1 migration,
  deployment, and real-Browser acceptance remain waiting. Law: LAW-59. Evidence:
  `evidence/2026-08-13/t6-hosted-written-authority/verification.md`.

- **I-PROACTIVE-WRITTEN-ADAPTATION (2026-08-13)** — Issue: Dungeon chose written prompts only by
  least-recent use, its main recommendation ignored accepted criterion misses, and the only response
  was a later concept question. The checker could comment, but the learning system did not remember
  which writing move remained open or teach it before asking for transfer. The header also exposed an
  empty subject select during a fixed-subject practice run. Cause: written authority had been wired
  to feedback and concept re-attempts without a separate writing-evidence state or support surface.
  Fix: accepted criterion outcomes now update a separate `writtenPractice` profile; a miss opens two
  fresh confirmations, inserts a deterministic unscored repair, targets the next authored written
  prompt, and promotes the open move into Dungeon's main **Next** recommendation. The run selects
  unseen prompts with weak concepts first and removes the redundant subject select. **Learning-
  integrity axis:** Qwen outcomes remain `scored:false`, never alter Strong, abstentions create no
  written evidence, and merely seeing the repair closes nothing. **Persistence/privacy axis:** the
  added summary stores criterion decisions, question ids, timestamps, and counters but no additional
  learner prose. **Truthful-interaction axis:** Dungeon states why it chose the prompt, why it changed
  the run, and how many confirmations remain; it reports an open writing move rather than a permanent
  ability label. **Accessibility/layout axis:** the real Browser path has zero horizontal overflow,
  no visible sub-44px target, and no subject control during practice. Law: LAW-58. Evidence:
  `evidence/2026-08-13/t6-proactive-written-adaptation/verification.md`.

- **I-WRITTEN-TRANSFER-AND-EXAMINER-FORENSICS (2026-08-13)** — Issue: written practice appeared in
  subjects whose papers do not ask for prose, criterion misses could not distinguish omission from
  misunderstanding, and Examiner stopped at vocabulary/rubric self-review. Fix: BRGSA/IBM receive
  short and case writing for every concept; SPMS/SCLM do not. Every authored criterion owns bounded
  gap codes which drive deterministic repair and repeated fresh transfer. After submission only,
  Examiner runs a source-bound rubric pass plus an independently verified larger-budget coach, then
  sends failed requirements into `examMisses` and the written corrective pool. **Learning integrity:**
  mock success closes nothing, the machine score excludes prose, and all model judgements remain
  practice guidance. **Privacy/persistence:** answers and narrative reviews stay page-lifetime; the
  profile stores codes/counters only. **Performance:** the deep pass is deliberately slower and runs
  sequentially after the clock stops. **Transport:** explicit UTF-8 plus a browser script gate closes
  post-model mojibake. Evidence:
  `evidence/2026-08-13/t6-written-transfer-and-examiner-forensics/verification.md`.

## Watch Items

- Painterly production target is confirmed; current pixel-like Door media remains interim.
- The first slice now uses two Resolve; future modes must not reintroduce a conflicting default.
- Economy, cosmetics, quests, and power-ups are defined locally for the product slice but not yet
  part of the core learning engine.
- The T6 learning path supports immediate feedback; generic practice checks can hold every
  answer-shaped cue until a complete end review.
- Persona and rank must not display before engine evidence thresholds are met.
- Large frame/output directories need manifests/contact sheets rather than individual index rows.
- URL scenarios isolate major states, but no checked-in automated interaction suite covers all 40
  study sets.
- All four course banks are source-traceable, but transcript-derived question content needs
  owner/faculty acceptance before the route is `DONE`.
- This is a first-cohort final with no same-course paper to await. Keep the current assessment
  envelope explicit; do not convert generic practice into an exam replica or score prediction.
- Constructed prompts, rubrics, and exemplars are source-traceable but still require owner/faculty
  acceptance; self-review must never be described as an automatic grade.
- Identity gating prevents anonymous access, not copying by approved testers. Server-side item
  delivery remains necessary before claiming stronger authorised-user scrape resistance.
- Approved-email entry is a binary admission check, not identity proof. Anyone holding an approved
  address can enter as that tester; this is a deliberate exam-season trade and must never be
  described to testers or in documents as verified identity.
- Country locking can fire on legitimate travel, VPN, mobile-network, or routing changes. Keep it an
  owner review prompt with a human unlock path; never automate a permanent ban from it alone.
- Every tester-visible change now needs a change announcement when it reaches production. See
  `docs/community/COMMUNITY_PLAYBOOK.md`; a silent release is a quality failure, not only a communication one.
- Builder practice stays inside one subject. A cross-subject run would need a course id on every
  queue item; do not imply mixed-subject practice in copy until that exists.
- The momentum and distance-travelled copy is generated. Any new sentence added there must stay
  derivable from recorded attempts and must not become praise, prediction, or a learner label.
