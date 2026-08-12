# T6 Research Review — Product Decisions and Implementation Map

Status: `IMPLEMENTED`; real-Browser acceptance is recorded at
`evidence/2026-08-11/t6-research-integration/verification.md`.
`EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` is a standing claim boundary, not a prerequisite this cohort
can wait for.

Decision date: 2026-08-11

Source: owner-supplied independent report, *Evidence-based intensive revision for an uncertain
first-cohort final* (research date 2026-08-11). The report reviewed retrieval, spacing, feedback,
confidence prompts, interleaving, constructed response, online assessment, accessibility, and the
absence of a same-course Term 6 final.

## Product promise

The defensible promise is:

> This helps learners retrieve, explain, and apply the course across several plausible assessment
> formats.

It must never claim to know the section mix, marks, timing, negative-marking rule, or likely score
of the first Term 6 final.

## Implemented now

| Report recommendation | Product decision |
| --- | --- |
| Preserve retrieval, spacing, varied re-attempts | Retained. A miss returns after intervening items on a different variant family; later blocks and genuine delays remain distinct evidence. |
| Strengthen misconception repair | A confident error now receives selected-answer → governing-distinction → discriminating-cue feedback and a different-family check. It is not punished with harder questions. |
| Count valid boss steps | Each covered concept records passed and failed boss steps separately from the whole-chain result. Valid steps remain visible even when the chain is incomplete. |
| Permit three-option MCQs | The validator accepts three or four options and still requires option-level misconception tags and shape checks. No weak fourth distractor is required. |
| Preserve immediate learning feedback | Learning mode keeps immediate causal feedback and varied repair. |
| Protect accessibility and neutrality | Native labelled controls, keyboard paths, non-color status language, no learning timers, and flat question hierarchy remain mandatory. |
| Protect breaks and sleep | The Study plan contains optional less-than-24-hour, three-day, and seven-day schedules with breaks and a seven-hour sleep reminder. |
| Adopt first-cohort uncertainty | The old exact-mock framing is removed. The UI explains that no same-course final exists and works with an assessment envelope instead. |
| Provide several practice shapes | Recognition-heavy, case/application-heavy, generation-heavy, and mixed-format practice are available through a staged setup. |

## Prototypes that are implemented but not validated claims

### Sampled, optional confidence

Confidence is asked only for high-value diagnostic events: first diagnostic evidence, a genuine
delay, a sampled new-family transfer, a boss, a constructed response, or a repair check. It is
hidden until the learner has made a response.

The choices are behavioral rather than emotional:

- Guessing / not sure
- Narrowed it down, but unsure
- Could explain my choice
- Skip confidence

Skipping has no correctness, grading, scheduling, or reward penalty. Confidence changes feedback
and which independent check is useful next; it never changes correctness.

An overall confidence summary requires at least 20 diagnostic judgments across three study blocks
and two formats. Concept-level views show counts and open checks, not a personality. No verbal
category is converted into a fake probability or Brier score.

### Constructed response

The bank adds one source-grounded short-answer surface for each of 64 concepts. A learner writes
before seeing the rubric, then checks which explicit criteria the response already contained, and
only then sees a grounded exemplar. The product records the rubric selection as self-review.

There is no hidden model grade. Self-reviewed writing can move a concept out of “untouched,” but it
cannot create independent correctness or Strong evidence. Faculty-reviewed wording and rubrics
remain required before any stronger constructed-response claim.

### Generic practice check

Learning mode gives immediate feedback. Generic practice-check mode holds correctness and
explanations until the block ends, then reviews every response. It is explicitly labelled generic
and does not present a duration, mark scheme, or section mix as final-specific.

### Explainable priority

Internal routing uses an inspectable rule order: recent/open errors, confident-error repair,
recurring misconception, delayed-evidence gap, applied-evidence gap, unresolved reasoning step,
untouched coverage, refresh due, and same-block overexposure. Learner copy names the concrete
reason. The weights are product hypotheses, not calibrated psychometrics.

## Strong and boss evidence

Strong no longer permanently requires a whole boss success. It requires:

1. five scored attempts;
2. four correct scored attempts;
3. three correct question types;
4. correct evidence in two practice blocks;
5. applied evidence from a new case or a valid unassisted reasoning step;
6. a latest scored answer that is correct;
7. no open repeated misconception, confident error, uncertain-correct confirmation, or relevant
   failed reasoning step.

Whole-chain boss completion remains separately visible and valuable. This preserves valid partial
evidence without pretending that a partial chain is a complete one.

## Explicitly prohibited

- confidence grinding or humiliation;
- artificial difficulty intended to reduce confidence;
- easier questions secretly used to manufacture confidence;
- confidence-linked streaks, points, or rewards;
- learner personalities inferred from sparse behavior;
- pseudo-probabilities or Brier scores made from verbal labels;
- opaque automatic grading of constructed responses;
- erasure of valid boss-step evidence;
- exact-paper simulations presented as authoritative;
- pass, score, timing, guessing, or negative-marking predictions.

## Waiting for evidence or authority

- faculty acceptance of all transcript-derived questions and short-answer rubrics;
- learner data before fixed calibration thresholds, IRT, Bayesian mastery, confidence decay,
  differential-item analysis, or a permanent boss gate;
- cognitive interviews and controlled tests before choosing two versus three confidence choices
  or a permanent prompt rate;
- the first real Term 6 final as evidence for later cohorts, not as something this cohort can use.
