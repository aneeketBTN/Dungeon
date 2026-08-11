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
- Opening a tester cohort does not justify collecting learner data that the product does not need.

## Issue → Cause → Fix

- **I1 (2026-07-16)** — Issue: product art direction was coherent for the homepage but incomplete
  across market, questions, feedback, motion, completion, and results. Cause: the creative thesis
  had not been translated into product-wide state rules. Fix: added `ART_DIRECTION_SYSTEM.md`.
  Evidence: `ART_DIRECTION_SYSTEM.md`; implementation is `IMPLEMENTED` and visual acceptance is
  `WAITING_REAL_BROWSER`.
- **I2 (2026-07-16)** — Issue: full experience lacked a canonical route/state/test contract.
  Cause: prototype behavior and learning-engine behavior evolved separately. Fix: added
  `GAME_UX_LOOP.md` with state flags, invariants, scenarios, goals, and release gate. Evidence:
  `GAME_UX_LOOP.md`; real-browser acceptance is `WAITING_REAL_BROWSER`.
- **I3 (2026-07-16)** — Issue: overlapping creative, UX, prototype, engine, persona, and historical
  documents had no explicit authority order. Cause: briefs arrived across phases and tools. Fix:
  added `DESIGN_SOURCE_INDEX.md` and its conflict register. Evidence:
  `DESIGN_SOURCE_INDEX.md`.
- **I4 (2026-07-16)** — Issue: project memory depended on a short Claude-specific file and
  conversation context. Cause: no Codex-native living index, evidence vocabulary, or close-out
  ritual. Fix: installed `AGENTS.md`, ledgers, changelog, evidence rules, and coordination charter.
  Evidence: `evidence/2026-07-16/admin-system-verification.md`.
- **I5 (2026-07-16)** — Issue: moving only the project folder to macOS could leave launch steps,
  browser-local prototype state, and optional art dependencies ambiguous. Cause: the old transfer
  note predates the web vertical slice and current operating system. Fix: added `MAC_TRANSFER.md`,
  a portable `mock/start-mac.sh`, Mac-targeted launch configuration, and integrity checks.
  Evidence: `evidence/2026-07-16/mac-transfer-prep.md`.
- **I6 (2026-08-10)** — Issue: the broad product slice put cinematic identity, character,
  currency, market, setup, and quests before a learner could reach exam practice. Cause: product
  breadth was treated as the active goal before the revision loop proved it could carry a course.
  Fix: installed `briefs/T6_REVISION_FALLBACK.md` and the verified BRGSA ten-run route with direct
  cold-mock access, source IDs, immediate feedback, cross-surface repairs, chain-break synthesis,
  local isolation, and guarded readiness. Evidence:
  `evidence/2026-08-10/t6-brgsa-fallback/verification.md`.
- **I7 (2026-08-10)** — Issue: Browser acceptance found a repaired miss labeled as still queued and
  a completed-run count that lagged on results. Cause: destination summaries were derived from a
  historical response or only refreshed when another screen rendered. Fix: derive repair labels
  from the current queue and update all destination summaries immediately after the state mutation.
  Evidence: `evidence/2026-08-10/t6-brgsa-fallback/verification.md`; prevention: `BUG-LAWS.md`
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
  `DESIGN_SOURCE_INDEX.md` C12 and `BUG-LAWS.md` LAW-11 through LAW-13.
- **I9 (2026-08-11)** — Issue: two quick correct answers could produce Strong, confidence was
  unknown, and conventional MCQs exposed answer-shape cues while offering little framework
  construction. Cause: the first dashboard optimised visible movement before defining a durable
  evidence threshold or item pedigree. Fix: installed confidence-tagged attempts, five-attempt /
  four-correct / three-type / two-block / unassisted-boss Strong gates, time qualifiers, complete
  status reasons, whole-chain boss grading, mixed formats, least-recent rotation, and a 728-item
  tagged bank whose 565 active items quarantine every detected legacy option-shape risk. Evidence:
  `evidence/2026-08-11/t6-evidence-challenges/verification.md`; prevention: `BUG-LAWS.md` LAW-14
  and LAW-16.
- **I10 (2026-08-11)** — Issue: the dashboard showed too many surfaces at once, the concept list
  felt like inventory, and question cards duplicated internal metadata and decorative accents;
  one hierarchy pass also made the case larger than the actual task. Cause: information and visual
  emphasis were added independently instead of being ranked by the learner's next decision. Fix:
  staged the dashboard into three tabs, replaced the list with an honest evidence trend and one
  two-concept module, made the task the only question headline, kept genuine cases as quiet body
  text, removed fake match cases and ornamental borders, and hid audit-only metadata. Evidence:
  `evidence/2026-08-11/t6-evidence-challenges/verification.md`; prevention:
  `DESIGN_SOURCE_INDEX.md` C14–C15 and `BUG-LAWS.md` LAW-15.
- **I11 (2026-08-11)** — Issue: the first cleanup made case text quiet inside its own box while the
  bold dependent instruction sat outside, visually classifying the case as an optional note. Cause:
  size hierarchy was corrected without preserving the semantic dependency or recognising that the
  case is the substantive question. Fix: use one aligned prompt flow, larger semibold case text,
  and a compact bold instruction; case-free questions receive no redundant box and keep their
  large heading. Evidence:
  `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`; prevention:
  `DESIGN_SOURCE_INDEX.md` C15 and `BUG-LAWS.md` LAW-17.
- **I12 (2026-08-11)** — Issue: every selected subject displayed “Recommended now,” and unanswered
  boss/prompt surfaces used cyan without a state meaning. Cause: a subject-local next action was
  worded like a single global recommendation and guidance color became category decoration. Fix:
  remove the global claim, use action-specific labels, neutralise unanswered practice surfaces,
  and retain color only for selection, primary action, progress, focus, and feedback. Evidence:
  `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`; prevention:
  `DESIGN_SOURCE_INDEX.md` C16 and `BUG-LAWS.md` LAW-18.
- **I13 (2026-08-11)** — Issue: even after the case/task hierarchy was corrected, a tinted prompt
  panel, a redundant “Reasoning chain” strip, and separate bordered cards for every response step
  created distance without changing meaning or interaction. Cause: semantic grouping was expressed
  through repeated containers instead of alignment and rhythm. Fix: place the case, directive, and
  response work directly on one warm-white surface; remove the redundant strip; flatten boss,
  match, and cloze wrappers; retain only bounded inputs, post-answer feedback, and subtle dividers
  between dependent steps. Evidence:
  `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`; prevention:
  `DESIGN_SOURCE_INDEX.md` C15 and `BUG-LAWS.md` LAW-19.
- **I14 (2026-08-11)** — Issue: a first-cohort student needed practice that could span recognition,
  cases, explanation, and connected reasoning, but an “exam simulation” would invent unsupported
  T6 timing, scoring, and section rules. Cause: generic practice and exact-paper fidelity were
  treated as one decision. Fix: added learner-selected recognition, application, generation, and
  mixed practice with immediate-teaching or end-held feedback, while repeatedly naming it generic
  practice rather than a paper replica or score prediction. Evidence:
  `evidence/2026-08-11/tester-launch/verification.md`; prevention: `DESIGN_SOURCE_INDEX.md` C17.
- **I15 (2026-08-11)** — Issue: written practice was absent, while automatic browser grading would
  make a false precision claim and held-feedback mode initially exposed the rubric before results.
  Cause: generation and scoring were coupled, and the feedback boundary covered selected answers
  but not answer-shaped self-review material. Fix: added 64 source-grounded short-answer surfaces
  with write-first rubrics and exemplars, recorded them as unscored self-review, denied independent
  Strong credit, and deferred the rubric/exemplar in held-feedback mode. Evidence:
  `evidence/2026-08-11/tester-launch/verification.md`; prevention: `BUG-LAWS.md` LAW-20.
- **I16 (2026-08-11)** — Issue: potential-user access needed stable delivery and a usable feedback
  loop without accidentally publishing live learner state, owner sources, CLA analysis, or adding
  silent telemetry. Cause: the local prototype had no explicit public-asset boundary or cohort
  operating policy. Fix: added an allowlisted build, production worker, health and security
  headers, release tests, privacy/security/tester policies, and a moderated WhatsApp community
  playbook while keeping progress browser-local. Evidence:
  `evidence/2026-08-11/tester-launch/verification.md`; prevention: `DESIGN_SOURCE_INDEX.md` C19.

## Watch Items

- Painterly production target is confirmed; current pixel-like Door media remains interim.
- The first slice now uses two Resolve; future modes must not reintroduce a conflicting default.
- Economy, cosmetics, quests, and power-ups are defined locally for the product slice but not yet
  part of the core learning engine.
- The first slice exposes Immediate feedback only; other timing modes remain deferred.
- Persona and rank must not display before engine evidence thresholds are met.
- Large frame/output directories need manifests/contact sheets rather than individual index rows.
- URL scenarios isolate major states, but no checked-in automated interaction suite covers all 40
  study sets.
- All four course banks are source-traceable, but transcript-derived question content needs
  owner/faculty acceptance before the route is `DONE`.
- Exact T6 final-paper structure is not public in the consulted policy; do not convert the current
  pattern-family mock into an exam replica without an owner-supplied paper/instruction source.
- Constructed prompts, rubrics, and exemplars are source-traceable but still require owner/faculty
  acceptance; self-review must never be described as an automatic grade.
