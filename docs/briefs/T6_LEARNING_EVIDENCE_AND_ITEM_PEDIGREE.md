# T6 Learning Evidence and Question Pedigree

Status: `VERIFIED(evidence/2026-08-11/tester-launch/verification.md)` for sampled optional
confidence, contrastive repair, boss-step evidence, constructed self-review, generic practice
shapes, first-cohort uncertainty language, and the earlier evidence model and question hierarchy.
No same-course final exists, so generic practice can proceed without inventing its blueprint;
`EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` is the standing boundary against exact-paper claims, not a
work-blocking gate.

Decision date: 2026-08-11

## Why this contract exists

The first T6 dashboard promoted a concept to **Strong** after two recent correct answers from two
question perspectives. That was useful as immediate encouragement, but it was not enough evidence
for the word Strong. The revision route must distinguish a promising start from broad, repeated,
and retained understanding, and it must show the learner why it reached that conclusion.

The question bank also relied too heavily on conventional MCQs. Some correct options were more
complete than their distractors, so students could sometimes answer by option shape rather than by
understanding. Harder practice must require selection of a framework, execution of its steps, and
an explanation of what the evidence changes.

## The uncertainty audit

### Known knowns

- The owner-supplied T6 pack contains 283 traceable lecture chunks across 32 modules and four
  courses. It is the correctness boundary for T6 authoring.
- The baseline product tracked 64 visible concepts and 216 questions. The implemented augmentation
  now contains 792 tagged surfaces: 728 scored challenges, including 64 constructed responses,
  plus 64 adaptive primers. Every surface has a stable ID,
  course, concept, lecture source,
  explanation, and causal link.
- Locally held previous-term BEHECON and GER CLA material gives a useful assessment-style sample.
  The examiner repeatedly uses scenario-to-concept decisions, Roman-numeral statement sets,
  calculation cascades, structural matrices, sequencing, matching, and precise case decisions.
- The strongest prior-term distractors are not random wrong answers. They encode a neighbouring
  concept, a reversed relationship, an omitted calculation step, the wrong denominator, or an
  over-broad statement.
- IIMB's public BBA(DBE) policy names MCQ, caselet, and subjective assessment families for final
  exams. It does not publish the T6 section order, duration, marks, option rule, or
  negative-marking rule.
- Retrieval practice improves delayed retention relative to repeated study in experiments with
  prose materials, including tests after two days and one week.
- Reaching a correct-recall criterion again in later sessions is more durable than treating a
  single learning session as mastery.
- For a one-week target, the spacing evidence places a useful review gap around one to several
  days; it does not justify pretending that two answers a minute apart are long-term evidence.
- Corrective feedback matters for wrong answers and for correct answers given with low
  confidence.

### Known unknowns

- The exact T6 final-paper blueprint and course-specific scoring rules.
- Whether the final T6 papers will actually use every public assessment family.
- Item difficulty, discrimination, and guessing rates for this student population. These require
  real response data; they cannot be credibly invented before release.
- Each learner's prior knowledge, exam date, available study blocks, anxiety, and accessibility
  needs.
- The degree to which transcript errors or lecturer phrasing affect an otherwise traceable item.
- The number of questions a learner can complete without fatigue in a one-day revision sprint.

### Unknown knowns

These are facts the system can elicit from a learner but does not know at first launch:

- which neighbouring concepts the learner confuses;
- whether a correct answer was a confident retrieval or a tentative recognition;
- whether the learner can apply the idea in a new case after recognising its definition;
- whether the learner can select and execute a framework without answer-shape clues;
- whether yesterday's successful answer can be retrieved again today;
- whether a mistake was repaired or merely avoided when the same wording returned.

The product should expose these through varied tagged questions and confidence checks, not infer
them from speed, personality labels, or a two-answer streak.

### Unknown unknowns

- Unanticipated ambiguities where more than one framework reasonably applies.
- Learners gaming confidence selections or learning a small rotating pool by position.
- Accessibility accommodations changing completion patterns in ways that look like difficulty.
- New examiner framings not represented in the prior-term sample.
- Exposure effects once students share question wording.
- Multi-concept failures whose true prerequisite is outside the 64 visible concept set.

These remain reasons to keep explanations inspectable, collect item-level evidence, rotate
surface forms, and avoid claiming a psychometric precision the product has not earned.

## Evidence consulted

The design uses the following primary research as a frame of reference, not as a claim that one
laboratory schedule transfers perfectly to every T6 learner:

- Roediger and Karpicke (2006) found repeated testing produced better delayed retention than
  repeated study after two days and one week, despite restudy producing greater confidence:
  [Test-enhanced learning](https://pubmed.ncbi.nlm.nih.gov/16507066/).
- Cepeda et al. (2008) found an interaction between the review gap and the intended retention
  interval; for a one-week delay, the useful gap was roughly 20–40% of that delay:
  [Spacing effects in learning](https://doi.org/10.1111/j.1467-9280.2008.02209.x).
- Rawson and Dunlosky (2011) found large efficiency gains from reaching a correct-recall criterion
  and then relearning to criterion in later spaced sessions:
  [Optimizing schedules of retrieval practice](https://pubmed.ncbi.nlm.nih.gov/21707204/).
- Rawson et al. (2018) found substantial advantages for successive relearning over single-session
  learning:
  [Investigating successive relearning](https://pubmed.ncbi.nlm.nih.gov/29431462/).
- Butler, Karpicke, and Roediger (2008) found feedback doubled later retention for correct answers
  initially given with low confidence:
  [Correcting a metacognitive error](https://pubmed.ncbi.nlm.nih.gov/18605878/).
- Butterfield and Metcalfe (2006) found high-confidence errors were especially correctable when
  correct-answer feedback was supplied. A confident mistake should therefore trigger a clear
  correction and later verification, not a punitive label:
  [The correction of errors committed with high confidence](https://doi.org/10.1007/s11409-006-6894-z).
- Rohrer and Taylor (2007) found better one-week problem-solving performance after mixed rather
  than blocked practice in their mathematics experiment:
  [The shuffling of mathematics problems improves learning](https://eric.ed.gov/?id=EJ786797).
- Kang, McDermott, and Roediger (2007) found a benefit for the more demanding short-answer format
  when feedback supported successful retrieval:
  [Test format and corrective feedback](https://doi.org/10.1080/09541440601056620).
- Little et al. (2012) showed that MCQs can still foster productive retrieval when all alternatives
  are plausible enough to require knowing why each one is right or wrong:
  [Multiple-choice tests exonerated](https://pubmed.ncbi.nlm.nih.gov/23034566/).

The public programme boundary is recorded by IIMB at
[BBA DBE Academics](https://dbe.iimb.ac.in/academics_v4/). The prior-term style analysis is local
evidence at `legacy/CLAs/_analysis/findings.md`; it guides item framing, not exact T6-paper claims.

## Public progress model

The dashboard keeps four ordinary-language states, but Strong now requires a body of evidence.

### Not started

No scored attempt exists for this concept.

### Needs practice

Use this when any of the following is true:

- the learner has attempted the concept but has not yet answered one item correctly;
- at least two of the most recent three attempts are wrong;
- a high-confidence error has not yet been repaired across two independent families and blocks;
- a failed boss question exposes an unresolved framework or prerequisite error.

A single miss after established Strong evidence lowers the concept to Developing with a review
due; it does not erase the entire history. A second recent miss moves it to Needs practice.

### Developing

Some correct evidence exists, but one or more Strong gates remain open. The dashboard must name
the missing evidence, such as “needs another question type,” “new case still needed,” or “retest
in a later study block.”

### Strong

Strong is a guarded claim. All of these gates must pass:

1. at least five scored attempts for the concept;
2. at least four correct attempts;
3. at least three distinct question types or cognitive perspectives answered correctly;
4. correct evidence from at least two separate practice blocks;
5. applied evidence from a new case or a valid unassisted reasoning step;
6. the most recent attempt is correct;
7. no unresolved recurring misconception, high-confidence error, uncertain-correct confirmation,
   or relevant failed reasoning step remains.

Whole-chain boss completion remains separately visible and valuable, but it is not treated as a
permanent universal Strong gate without learner data. Valid boss steps update the concepts they
actually test even when another step breaks the overall chain.

The first implementation uses rule-based gates because the bank has no calibrated item parameters.
It must not present an unvalidated Bayesian or item-response score as scientific precision.

### Time and retention qualifier

Strong always means **strong current evidence**, not permanent mastery or a score prediction. The
dashboard separately explains the time evidence:

- **Same-day evidence** — the gates were met, but no correct retrieval occurred at least 20 hours
  after the first successful block.
- **Retested later** — the learner retrieved the concept correctly after a gap of at least 20
  hours.
- **Refresh due** — the last successful retrieval is more than four days old during the seven-day
  revision window.

This preserves a visible one-day finish line without describing same-day fluency as long-term
retention.

## Confidence contract

Confidence is sampled on high-value diagnostic events rather than required after every routine
question. It is asked after the learner has made a response and before feedback on:

- the first diagnostic for a concept;
- a delayed retrieval;
- a sampled new-family transfer;
- a boss or constructed response;
- a misconception or uncertain-correct repair check.

The prototype uses three behavioral anchors plus a penalty-free skip:

- Guessing / not sure
- Narrowed it down, but unsure
- Could explain my choice
- Skip confidence

Confidence never changes correctness, earns rewards, unlocks easier work, or creates a learner
personality. It changes the next diagnostic action:

- **Correct + guessing/not sure:** preserve correctness and schedule a new-family confirmation.
- **Wrong + guessing/not sure:** give a short prerequisite bridge and supported retrieval.
- **Wrong + could explain:** identify the selected assumption, refute it with the governing
  distinction and cue, then schedule a different-family check after intervening items.
- **Skipped or not sampled:** grade normally and make no confidence inference.

A confident error closes only after two independent repairs across different families and blocks.
An uncertain correct answer closes after a correct new-family confirmation. Raw history remains;
only scheduling relevance may eventually decay after validation.

Overall calibration language requires at least 20 diagnostic judgments across three blocks and
two formats. The dashboard shows counts and insufficiency language; it does not translate verbal
categories into probabilities or Brier scores.

## Attempt evidence schema

Every new attempt records:

- question ID and variant family;
- course, one primary concept, and any supporting concepts;
- question type and cognitive skill tags;
- difficulty and boss status;
- correctness or partial-credit result;
- selected diagnostic confidence or skip, plus whether confidence was prompted;
- misconception tag matched, if any;
- hint/revealed-step use;
- initial attempt or re-attempt;
- practice-block ID and timestamp.

Historical version-2 attempts remain valid as limited evidence. Missing tags are shown as unknown;
they are never silently upgraded into boss, confidence, format, or delayed evidence.

## Question pedigree

Every authored or generated item must declare:

- `source` and any additional `sourceIds`;
- `conceptId` and `supportingConceptIds`;
- `type`: currently `primer`, `mcq`, `cloze`, `match`, `case-cloze`, `short-answer`, or `boss`;
  primer is support-only and does not count as scored format coverage, while `multi-select` and
  `sequence` remain reserved future formats;
- `skills`: recognise, distinguish, explain, apply, calculate, diagnose, connect, or evaluate;
- `difficulty` from 1 to 5;
- `variantFamily`, so wording variants do not masquerade as independent evidence;
- `misconceptions`, mapping each wrong response to a specific error;
- `diagnoses`, the option-level diagnosis contract below;
- `frameworkSteps` for multi-step items;
- `estimatedMinutes` and whether a hint/revealed step was used.

### Option-level diagnosis contract

**Every distractor a scheduled question can present must be able to say what choosing it
revealed.** A wrong answer that produces only a verdict — "Not yet, this idea will return" —
tells a learner they were wrong and nothing about where their understanding broke. Each option
is a hypothesis about the learner's model, so each wrong option carries the diagnosis of the
specific gap it exposes.

Every distractor slot carries four fields:

| Field | Holds | Rule |
| --- | --- | --- |
| `tag` | Stable short identity | Scheduler recurrence key **and** learner-visible in the concept inspector. Keep it stable once shipped; a reworded tag silently resets recurrence detection. |
| `label` | Headline of the gap | The learner's words, not the marker's. |
| `why` | The belief the choice assumed, then what the source holds | Name the wrong belief **first**. A `why` that only restates the correct answer explains the verdict, not the error. |
| `cue` | What to look for next time | A discriminating test, not a restatement of the principle. |

Authoring rules:

- **Diagnose the reasoning, never the learner.** "This choice assumed…" is the register.
  No "you failed to", no praise, no blame.
- **Do not repeat what the panel already prints.** The panel renders the governing principle
  and the wider connection beneath the diagnosis; repeating either turns one explanation into
  the same sentence three times.
- **Stay inside the indexed lecture sources.** A diagnosis may not introduce a claim the
  source material does not support.

Most of the bank satisfies this without authoring. Distractors are borrowed from other concepts —
`comparableWrong(data.summary, otherSummaries)` hands the learner another concept's principle — so
`mock/sets/t6_challenges.js` derives the diagnosis from provenance it already holds, exactly rather
than by inference. The recognised families are: another concept's principle, decision, causal chain,
or label; the same concept's wrong facet (a match board offering an idea's principle and its decision
side by side); and the three constructed boss-integration errors (framework swap, single-framework
overreach, reversed determination). Hand-written distractors with no machine-knowable provenance are
diagnosed in `mock/sets/t6_diagnoses.js`, keyed by question id and option index.

**Enforcement.** `tools/validate_t6_bank.js` fails the build when any scheduled distractor lacks a
diagnosis, when any of the four fields is empty, when a `why` restates the correct answer, or when a
`why` addresses the learner instead of the reasoning. A new question cannot ship without this; adding
one through any path picks the contract up automatically, because the diagnosis pass runs over every
question in the course after generation rather than inside each generator.

Support-only primers and self-reviewed constructed responses are exempt: neither presents a scored
wrong option. Legacy items excluded from scheduling for option-shape risk are also exempt, since
repairing them is a separate decision from scheduling them.

### Boss-question contract

A boss question is not merely a longer MCQ. It must:

1. present a new case, dataset, or decision;
2. require at least two concepts or two dependent reasoning steps;
3. make the learner choose or construct the framework before applying it;
4. include plausible failure paths tied to named misconceptions;
5. preserve the learner's earlier work across steps;
6. grade each covered concept step and the completed chain separately; valid unassisted step
   evidence survives an incomplete chain;
7. explain which step failed and why the final decision changes.

Each taught module needs at least one boss family. Full mocks mix boss families across modules.

### Mixed-format contract

- **Cloze:** the missing term or relationship carries conceptual meaning; it is not a trivia word.
- **Match:** pair concepts with mechanisms, evidence, formulas, or consequences; distractor
  arrangements swap plausible neighbours and cannot be solved from one obvious pair.
- **Case-cloze:** fill a passage's dependent reasoning steps so an early choice constrains the
  later conclusion.
- **Short answer:** write before seeing the rubric, self-check explicit source-grounded criteria,
  and then compare with an exemplar. Self-review never becomes opaque correctness credit.
- **Sequence:** order a real process where swapped adjacent steps represent authentic mistakes.
- **MCQ:** options must be parallel in length and specificity. Every distractor must map to a
  neighbouring concept, reversed direction, omitted step, wrong denominator, or over-broad rule.
- **Accessibility:** drag interactions are never drag-only. Every word bank also supports keyboard
  selection and labelled select controls; order and matching tasks expose complete instructions
  and a non-pointer path.

### Adaptive primer contract

A `primer` is a source-traceable teaching surface, not a seventh scored format and not mastery
evidence. Each concept has one primer family with four parts: the minimum fact, a concrete use,
the nearest named misconception, and a causal connection to carry into the next challenge.

- Learning runs insert at most one new primary-concept primer immediately before that concept's
  first challenge. They never front-load a bundle of prerequisites.
- Level 1 shows the minimum fact and connection. One recent miss or Needs practice raises support
  to level 2 and adds the application. Two recent misses raise level 3 and add the misconception.
- A correct primer answer reduces support immediately. Two successful difficulty-3-or-harder
  challenges, or Strong concept evidence, suppress future primers for that concept.
- Any later scored miss can restore support. The original response history remains untouched.
- Primer answers are stored only in `primerState`; they never enter `conceptAttempts`, correctness
  totals, Strong gates, result percentages, or cohort difficulty analytics.
- Generic held-feedback simulations contain no primers. A teaching aid cannot leak an answer or
  mutate evidence inside an assessment-shaped check.
- The next challenge must apply, distinguish, or connect the primed idea instead of simply asking
  the same definition again. Later primers explicitly name the prior concept to carry forward.

## Seven-day practice protocol

The scheduler uses a short-horizon successive-relearning pattern:

1. a miss returns after at least two intervening items, using a different surface;
2. a correct but fragile concept returns in a later block the same day when possible;
3. the first delayed check is due about one day later;
4. another mixed check is due around day three;
5. a final refresh or boss check is due around day six, before a day-seven exam target;
6. Needs practice is selected before Developing; due refreshes are selected before untouched
   Strong material;
7. question choice prefers unused variant families and types before recycling old wording.

These are defaults, not guarantees. If the learner has only one day, the product compresses
practice into separate blocks and labels the evidence Same-day. It does not fabricate a delayed
retrieval.

## Bank breadth target and rotation

The bank target is at least eight meaningfully different surfaces per visible concept across
definition, distinction, application, connection, construction, and synthesis, plus at least one
boss family per module. A learner should not see the same question ID twice until all eligible
unused types and variant families for that concept have been tried.

Parameter changes count as new questions only when they force a fresh calculation or decision.
Cosmetic name changes do not count as independent mastery evidence.

Automated bank validation must reject:

- duplicate IDs;
- missing or invalid lecture sources;
- untagged answer choices;
- a correct MCQ option materially longer or more specific than every distractor;
- MCQs with fewer than three or more than four options;
- malformed four-way matching tasks;
- boss questions with fewer than two reasoning steps or fewer than two covered concepts;
- fewer than ten active surfaces, four active formats, or six active families for a concept;
- a quarantined option-shape-risk item appearing in any active run pool.

Authoring review additionally rejects inaccessible interaction paths, repeated positional
patterns, cloze blanks with multiple reasonable answers, recurring distractor syntax, and cosmetic
variants that do not force a new decision. The evidence algorithm allows a variant family to contribute only one unit of
independent Strong evidence within a practice block.

## Implemented bank and learner-facing hierarchy

`mock/sets/t6_challenges.js` expands the 216-item baseline to 792 tagged surfaces: 728 scored
challenges, including five
boss variants for each of 32 modules and one source-grounded constructed-response surface for each
of 64 concepts, plus one source-traceable adaptive primer per concept. Active scored scheduling
contains 565 items after excluding 163 retained legacy MCQs
whose correct answer can be cued by length. Every visible concept has at least eleven active
surfaces, five active formats, seven active variant families, and a boss family.
Question selection prefers unseen IDs, families, and types, then the least-recently used surface.

The learner-facing question card shows only what changes the student's decision: a genuine case
when one exists, its answer instruction, response controls, confidence, and feedback. A case and
its dependent instruction share one aligned flow directly on the main warm-white question
surface. The case contains the substantive exam problem, so it is the larger primary reading
text; the instruction is compact and bold beneath it. The case is never isolated as a note while
its instruction floats outside, and the pair is not wrapped in a nested tinted panel. Boss steps,
matching rows, and cloze sentences use spacing and restrained dividers rather than repeated
cards; inputs and post-answer feedback retain boundaries because those boundaries carry function.
Questions without a case receive no extra box and keep their large question heading. Format,
count, internal status, concept, and lecture IDs remain in the DOM/data for audit but are not
allowed to compete with the question. Matching instructions are not presented as fake cases.
Before an answer is checked, prompts and step labels remain neutral; success/error and evidence
states own the semantic feedback colors.

## Verified acceptance

- deterministic dashboard and question scenarios covering Strong, Developing, Needs practice,
  delayed evidence, every implemented format, partial boss failure, sampled confidence, practice
  setup, and deferred-feedback results;
- dashboard reasons that agree with the underlying attempt evidence;
- at least one accessible real-Browser path for every question type;
- labelled keyboard-operable native controls for matching, cloze, case-cloze, and boss tasks,
  plus arrow-key MCQ selection;
- miss, correction, delayed re-attempt, and boss-credit paths;
- bank/source/tag/schema validation and option-shape checks;
- save/resume compatibility with version-2 learner data and no writes to `data/state/` or `data/history/`;
- desktop and 390-pixel narrow-layout acceptance without horizontal overflow.

Evidence: `evidence/2026-08-11/t6-evidence-challenges/verification.md`, with the later prompt
hierarchy refinement at `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`.
