# T6 Exam-Season Revision Dashboard

Status: `VERIFIED(evidence/2026-08-11/tester-launch/verification.md)` for the staged
all-subject dashboard, evidence graph, sampled optional confidence, constructed self-review,
generic practice shapes, boss-step evidence, adaptive repair, persistence, and responsive Browser
paths. No same-course final exists, so the product targets a documented assessment envelope and
does not claim an exact first-final blueprint. `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` is a standing
claim boundary, not a prerequisite this cohort can wait for.

Decision date: 2026-08-10

## Owner direction

The active product is a plain revision tool. A student should be able to open it without knowing
the system, see the size of the job, start useful practice immediately, and understand what to do
next after every answer.

- Use ordinary student language. Do not expose game mechanics, proprietary labels, health,
  currencies, character setup, or failure-state jargon in the active route.
- Make generic practice checks immediately available without presenting one mix as the final.
- Organise each subject as ten available study sets: eight taught modules, one concept-connection
  set, and one configurable generic practice check. Ten is capacity, not compulsory completion.
- Show a truthful concept evidence graph with four states: **Strong**, **Developing**, **Needs practice**, and
  **Not started**.
- Practise Needs practice concepts before Developing concepts, and Developing concepts before
  untouched material.
- A miss must teach the causal distinction and return later as a different question, not repeat
  the same wording immediately.
- Make progress and remaining work equally visible so the student can see a finish line.
- Stage information as Overview, Concepts, and Study plan; do not show every control and metric at
  once.
- Order the homepage as subject rail, next-action hero with a live evidence trendline, practice
  builder, distance travelled, then the holistic mastery matrix and Term 6 totals, then the staged
  Subject focus / Concepts / Study plan panels. Subject switching is the first control on the page,
  the header carries a Term 6 sparkline rather than a strong-concept counter, and no section hides
  when a panel is opened. The detailed evidence graph sits beside concept inspection.
- Generic practice is configured inline on the homepage, not in a dialog. Shape, concept focus,
  length, and feedback timing each change the generated run; an option that cannot narrow or
  lengthen the run is disabled with its reason before selection.
- Reassurance is factual. Momentum and distance-travelled copy is computed from recorded attempts,
  names a dip as a dip, and never becomes praise, a learner label, or a predicted result.
- Long-form matching uses a board: statements side by side, one slot under each, and a docked tray
  of short label tablets placed by click, drag, or keyboard. Never repeat the same long answer cards
  under every row.
- Start learning runs with only the minimum concept primer the learner currently needs. Interleave
  one new-concept primer immediately before its first challenge, then layer later questions on
  earlier concepts. Primer support must fade quickly after easy success and strengthen after misses.
- Every visible pixel must earn its place. Question metadata may remain available for audit, but
  must not compete with the case, task, response, confidence, or feedback.
- A case and the answer instruction that depends on it are one prompt object: place both in one
  aligned flow on the main warm-white question surface, make the substantive case the larger
  reading text, and keep the instruction compact and bold. Do not add a nested prompt panel.
  Dependent response steps use spacing and subtle dividers; only controls and feedback need boxes.
  Case-free questions retain their large question heading.
- A subject-local next action must not be labelled as a global “Recommended now.” Name its concrete
  action, and keep unanswered question surfaces neutral until state or feedback gives color meaning.
- Confidence is sampled only on high-value diagnostics, appears after a response is made, uses
  behavioral anchors, and may be skipped without penalty. It never changes correctness or rewards.
- Constructed responses use a visible source-grounded rubric and exemplar. Self-review is recorded
  but is never presented as opaque automatic grading or independent correctness.

The broader cinematic and economy prototype remains available only as a legacy implementation
reference. It does not control the active exam-season interface.

## T6 source inventory

Owner-supplied course pack:

`C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack`

| Code | Course | Lecture chunks |
| --- | --- | ---: |
| BRGSA | Business Research, Growth Strategies and Analytics | 50 |
| IBM | Inclusive Business Models | 78 |
| SCLM | Supply Chain and Logistics Management | 71 |
| SPMS | Software Product Management and Strategy | 84 |

The pack contains 283 lossless lecture chunks across 32 modules. Question-authoring authority is:

1. `graph_source/` for correctness and nuance;
2. `graph/LECTURE_MANIFEST.jsonl` for stable ID, order, title, and provenance;
3. `dense/lectures/` and `dense/modules/` for retrieval;
4. `subject_core/` for broad mapping;
5. `indexes/` for candidate discovery only.

`AUDIT.json` reports unchanged sources, 283 graph chunks, 283 dense lectures, 32 dense modules,
and zero traceability failures. That proves pack structure and provenance, not faculty acceptance
of every transcript statement or authored question.

## Implemented course model

All four subjects now have:

- eight named modules;
- sixteen visible core concepts, two per module;
- ten study sets;
- a directly accessible practice setup with recognition, application, generation, and mixed shapes;
- lecture-ID provenance on every question;
- at least eleven actively scheduled surfaces, five formats, seven independent variant families, and
  boss coverage for every tracked concept.

The complete embedded bank contains 792 unique tagged learning surfaces: 728 scored challenges
plus one adaptive, source-traceable primer for each of the 64 concepts. The scored challenge totals
remain:

- BRGSA: 188, including 40 bosses and 16 constructed responses;
- IBM: 180, including 40 bosses and 16 constructed responses;
- SCLM: 180, including 40 bosses and 16 constructed responses;
- SPMS: 180, including 40 bosses and 16 constructed responses.

Active scored scheduling contains 565 questions. Primer-only surfaces are inserted by the support
layer and never enter ordinary mastery selection. The scored pool excludes 163 retained legacy MCQs where the
correct response is materially longer than every distractor: BRGSA 37, IBM 40, SCLM 43, and SPMS
43. These items remain source/audit evidence but cannot appear in learner practice until rewritten.
The active bank uses MCQ, cloze, case-cloze, four-way match, short-answer, and three-step boss
formats. Each of the 64 concepts has one source-grounded constructed-response surface. MCQs may
use three or four plausible options; a weak fourth distractor is not required.

Sets 1–8 introduce the taught modules. Set 9 connects ideas across the subject. Set 10 opens a
practice setup for feedback timing and assessment mix. Completion order is recommended, never
locked, and later work should narrow when sufficient evidence already exists.

## Mastery and repetition contract

The initial streak-based Strong rule in this brief is superseded by
`briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md`. The dashboard still uses **Not started**,
**Needs practice**, **Developing**, and **Strong**, but Strong now requires repeated correct
evidence across question types and practice blocks, an applied case or valid reasoning step, and
no unresolved misconception, confident error, uncertain-correct confirmation, or relevant failed
reasoning step. Whole-chain boss completion remains visible but is not a permanent universal gate.
The dashboard must explain the evidence and distinguish same-day performance from a later retest.

Recommended practice sorts concepts in this order:

1. Needs practice;
2. Developing;
3. Not started;
4. Strong only when everything else is secure.

After a wrong answer, the student receives:

1. the selected assumption and correct governing distinction;
2. a discriminating cue and causal bridge to the wider subject;
3. a visible Needs practice state;
4. a later re-attempt using another perspective.

A correct but uncertain answer schedules a new-family confirmation. A confident error schedules a
different-family diagnostic after intervening questions and closes only after two independent
repairs. A per-concept session limit prevents endless loops.

Primer state is separate from mastery evidence. An unseen concept begins with a level-1 fact and
connection. A primer answer can reduce or strengthen future support but cannot mark a concept
Developing or Strong. One miss raises the next primer to applied support; repeated misses add the
named misconception. Two successful harder challenges or Strong evidence suppress the primer.
Generic held-feedback simulations never insert primers because they are assessment-shaped checks,
not teaching runs.

## Student-facing progress contract

The dashboard must always answer four questions without requiring interpretation of a game system:

1. How much of Term 6 is Strong?
2. Which subject and concepts need attention?
3. What is the best next short action?
4. How much remains before all 64 tracked concepts are Strong?

The Overview places a five-axis mastery matrix directly after the next-action hero: BRGSA, IBM,
SCLM, SPMS, and cross-concept Connections. A text list exposes the same values without relying on
canvas, colour, or shape. The selected-subject evidence trend sits beside or immediately below it.
The Concepts view uses an evidence-over-time trend, not a raw-attempt graph. Needs practice adds no
upward credit, Developing adds partial credit, and Strong adds full credit, so misses can create an
honest plateau or dip. Only one two-concept module is shown at a time; selecting a concept opens an
evidence explanation and focused practice. Course cards, results, and the persistent header use
the same four-state vocabulary, never communicated by colour alone.

The dashboard is a practice-progress signal. It is not an exam-score prediction or a promise of
passing.

## Exam-pattern boundary

This cohort has no same-course Term 6 final. Public IIMB BBA(DBE) policy names MCQ, caselet, and
subjective assessment families but does not establish this final's proportions or rules. Therefore:

- current practice uses source-grounded MCQ, cloze, case-cloze, match, short-answer, and boss
  decisions;
- the UI does not claim an exact section order, marks, duration, option rule, or negative-marking
  rule;
- the generic practice setup may vary recognition, application, generation, and mixed work and
  may teach immediately or hold feedback until results, but it is not a replica of the final
  paper or a score prediction;
- the first real final becomes evidence for later cohorts, not a missing prerequisite this cohort
  can wait for.

Short answers require a response before exposing a source-grounded rubric and exemplar. The
learner can record a transparent self-review, but the system does not auto-grade the response or
use it as independent correctness or Strong evidence. In held-feedback practice, the rubric is a
pre-exemplar self-check; the grounded exemplar remains hidden until results.

## Persistence and privacy

Normal progress is stored locally in the current browser under:

`term6.revision.v2`

The internal storage name is not student-facing language. An unfinished question, including
resolved feedback, resumes on reload. Reset requires confirmation and removes only this T6 browser
profile. The active web route does not write to the learning engine's `state/` or `history/` files.
Deterministic `?scenario=` fixtures do not save normal progress.

## Acceptance

The route is `VERIFIED` because the following passed:

- syntax checks for the application, catalogue, BRGSA bank, and Python server;
- 792 unique tagged surfaces (728 scored challenges plus 64 adaptive primers) and 565 actively
  scheduled scored questions, valid answers/explanations/bridges, 64 constructed responses,
  at least eleven active scored surfaces per
  concept, 160 bosses, zero missing
  cited lecture IDs, and no option-shape-risk item in any active pool;
- HTTP root redirect, asset loading, and no-cache development headers;
- real-Browser desktop and 390-pixel-wide dashboard, question, feedback, result, keyboard, direct
  practice-setup, save/resume, and confirmed reset paths;
- all four subject cards, sixteen concepts, ten available sets, and four generic practice shapes;
- a real adaptive journey from a miss through a different-perspective re-attempt and updated
  dashboard state;
- an unscored primer-to-challenge handoff, quick primer fade after success, stronger level-3 repair
  after misses, and zero primer credit in mastery or held-feedback practice;
- unchanged hashes for all nine files under `state/` and `history/` after Browser practice and
  reset.

Primary evidence is recorded at
`evidence/2026-08-11/tester-launch/verification.md`. The earlier all-subject baseline is
preserved at `evidence/2026-08-10/t6-dashboard-all-subjects/verification.md`.

This route is not `DONE`: faculty/owner acceptance of transcript-derived content, constructed
prompts, rubrics, and exemplars remains open, and the confidence/boss/practice-shape prototypes
still need real learner validation. Exact first-final fidelity is an uncertainty boundary, not a
truthful current product claim.
