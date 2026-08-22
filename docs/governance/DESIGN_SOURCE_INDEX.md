# Dungeon — Design Source Index and Conflict Register

Status: working source-of-truth map

Purpose: ensure product, art, UX, learning, progression, and implementation briefs are all read
before an autonomous design/build loop begins. A file's existence or modification date alone does
not make it authoritative.

## Required reading order

1. **Current explicit user direction**
   - The current task and any newly supplied brief.
   - Wins over every project file when the user intentionally changes a decision.
   - Exam-season fallback (2026-08-10): `docs/briefs/T6_REVISION_FALLBACK.md`, grounded in the
     owner-supplied `C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack`. This direction
     strips non-learning layers and proprietary vocabulary from the critical path and makes the
     plain ten-step T6 revision dashboard the active product priority.
   - Learning-evidence correction (2026-08-11):
     `docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` replaces quick streak-based Strong labels
     with inspectable multi-format, multi-block, boss, time, and confidence evidence. It also owns
     the mixed-format and boss-question authoring contract.
   - Research-review implementation (2026-08-11):
     `docs/briefs/T6_RESEARCH_REVIEW_IMPLEMENTATION.md` owns sampled optional confidence, ethical
     confident-error repair, boss-step credit, constructed self-review, generic practice shapes,
     and the first-cohort assessment-envelope boundary.
   - Measurement and machine-judgement direction (2026-08-13):
     `docs/briefs/DUNGEON_MEASUREMENT_AND_JUDGEMENT.md` owns the move from self-report toward
     banded response latency, the rapid-response Strong gate, the small-cohort claim boundary,
     comparative criterion-level written-work direction, and the rule that a Mac local model is an
     offline lab rather than production infrastructure.
   - Controlled tester launch (2026-08-11): expose only the active T6 learning assets, keep
     learner progress browser-local, publish privacy/security/tester guidance, create a private
     GitHub source repository, and operate tester discussion, feedback, and announcements through
     an owner-administered WhatsApp community.
- Protected domain and owner operations (2026-08-11):
     `docs/briefs/TESTER_ACCESS_AND_ADMIN.md` owns the exact `aneeketdas.com/dungeon` route, per-email
     access, anti-harvesting claim boundary, self-contained protected edge, and owner control room.
   - Prepared tester-agent operations (2026-08-11): `.agents/README.md`, the three charters and
     `.agents/deployment.json` own data contracts, evidence thresholds, review authority and the
     activation sequence. Registered schedules are paused and do not supersede privacy gates.
   - Adaptive primer and evidence-first dashboard (2026-08-11): learning runs introduce one
     minimum source-traceable concept layer before its first challenge, fade that support after
     success, strengthen it after misses, and keep it outside mastery evidence. The next-action
     hero is followed by a four-subject-plus-connections matrix and selected-subject trend.
   - WhatsApp participation (2026-08-11): opening the supplied invite must precede a tester's
     explicit membership acknowledgement. The page records those actions but never claims it can
     independently verify WhatsApp membership; the owner can record in-app bumps and manually send
     the copied reminder before removing a non-participating tester.
   - IBM testing taxonomy (2026-08-20, superseding the earlier pause): implement every remaining
     course-grounded idea without pretending to know the then-unreleased exam case. Foundational layer
     ideas receive subjective + MCQ practice; named frameworks/models receive subjective practice
     only; bounded concepts and distinctions receive MCQ practice only. Generic lesson-grounded
     caselets are practice, never a claim about the examination case.
   - BRGSA post-paper feedback (2026-08-22):
     `docs/research/BRGSA_EXAM_FEEDBACK_2026-08-22.md` is the canonical first-party record of the
     direct ten-mark and Section B shapes the owner observed, plus the later Case → Answer / deeper-
     why authoring direction. It explicitly keeps IBM and SCLM similarity as an unverified working
     assumption rather than paper evidence.
   - SPMS objective-pattern feedback (2026-08-22):
     `docs/research/SPMS_OBJECTIVE_QUESTION_FEEDBACK_2026-08-22.md` preserves the owner-observed MCQ
     and multiple-right families: recall, anatomy, purpose, statement verification, directional and
     mixed-signal interpretation, distinctions, best fit and case recommendation. Cross-subject use
     is a labelled authoring assumption, not evidence of another paper's format.
   - Final-revision and Examiner separation (2026-08-22, refined 2026-08-23): keep two-hour Full
     mocks as one first choice for one week or more out. Consolidate the coached Speedrun and the
     25–30 minute Mini under one `Exam time` first choice, with their distance-to-exam labels inside
     that route. Speedruns must not be
     buried inside full-paper cards. The released IBM prompt receives its own fixed ten-question
     paper; numbered IBM sets remain transfer cycles. On the Learn home, the full subject cards
     remain the first-load state and fold into an animated, clearly selected subject rail only
     after a subject is chosen. Both short routes must also survive the established learner-persona
     audit: gaming resistance for Brilliant-but-lazy, immediate teaching/completeness for Average
     Joe, and whole-cycle/module coverage plus bounded answer spines for Dumb-but-diligent. A
     written Speedrun answer is one coached interaction, not submission followed by a second rubric.
   - Personal-access controls (2026-08-22, superseding the 2026-08-11 device/country enforcement):
     retain personal access and one-browser-at-a-time as tester terms, but do not enforce a device
     ceiling or country lock. Concurrent sessions are allowed; coarse country is neither stored
     nor used to deny access. Owner/admin routes are excluded from learner burst limiting.
   - Next-term weekly study system (2026-08-22; planning only):
     `docs/briefs/NEXT_TERM_WEEKLY_STUDY_SYSTEM.md` makes the academic week the shared organising
     object across Learn, Examiner and Quick Notes. Its core loop is Learn → Check → Repair → Close;
     Full mocks become milestones, Speedrun becomes per-subject seven-day coverage closure, and
     Minis remain the final 25–30-minute retrieval pass. It explicitly forbids a fourth dashboard
     and treats notifications as optional delivery over one next action.
   - Dashboard chart system (2026-08-20): owner direction replaces every handmade data graph with
     the actual shadcn chart component structure and Recharts primitives. Official area and radar
     registries define the implementation reference; Dungeon supplies its own data, tokens and
     content. Icon SVGs are not data graphs and remain ordinary components.

2. **Project operating system**
   - `AGENTS.md`
   - `docs/briefs/PROJECT_OPERATING_SYSTEM.md`
   - Governs source loading, evidence claims, status gates, session rituals, ledgers, and
     coordination. It does not decide product taste or learning mechanics.

3. **Product experience contracts**
   - `docs/design/GAME_UX_LOOP.md`
   - `docs/design/ART_DIRECTION_SYSTEM.md`
   - These define the proposed full-product flow, UI states, test loop, screen grammar, motion,
     asset gates, and release criteria.

4. **Creative thesis**
   - `docs/design/ART_DIRECTION.md`
   - Canonical source for the Door, Ari, saffron/cyan identity, solemn emotional register,
     environmental materials, composition, threats, and painterly target.

5. **Learning and progression engine**
   - `docs/engine/PROMPT.md`
   - Canonical source for question grounding, graph traversal, subject rules, HP/reset behavior,
     difficulty, weak-node scheduling, breakdowns, transfer probes, learner profiles, personas,
     proficiency ranks, stats, saves, and admin commands.

6. **Engine history and rationale**
   - `docs/engine/REVIEW_LOG.md`
   - Use to understand why engine decisions were made. It does not override the current
     `docs/engine/PROMPT.md`.
   - `docs/design/personalities.md`
   - Contains historical reinforcement/persona briefs and implementation instructions. Use for
     rationale and omitted context; the implemented current form in `docs/engine/PROMPT.md` wins when they
     differ.

7. **Student-facing operational contract**
   - `README.md`
   - Canonical for documented setup and commands only when consistent with `docs/engine/PROMPT.md`.

8. **Current implementation evidence**
   - `legacy/prototypes/index.html`, `legacy/rogue/rogue.html`, `legacy/rogue/rogue.css`, `legacy/rogue/rogue.js`, and other mock pages.
   - These show what exists. They are not automatically product requirements.

9. **Current visual evidence and research**
   - `outputs/`, `work/`, and `work/art-direction-research/`.
   - Existing assets are references and prototypes unless promoted through the asset acceptance
     gate. Third-party research is inspiration, never a source to copy.

10. **Content and live data**
   - `data/graphs/`, `data/state/`, and `data/history/`.
   - Canonical for available subject content, current player state, and learning history. Do not
     rewrite or erase real player data to create a test scenario.

## Brief domains already present

| Domain | Primary source | Product surfaces affected |
|---|---|---|
| Project administration | `AGENTS.md`; `docs/briefs/PROJECT_OPERATING_SYSTEM.md` | status, evidence, ledgers, rituals, coordination |
| Creative/art direction | `docs/design/ART_DIRECTION.md` | homepage, world, Ari, Door, threats, color, material |
| Product art/UI/motion | `docs/design/ART_DIRECTION_SYSTEM.md` | all screens, controls, animation, market, dashboard |
| Flow, flags, and testing | `docs/design/GAME_UX_LOOP.md` | route state machine, edge cases, iteration and release |
| Learning rules | `docs/engine/PROMPT.md` | questions, feedback, difficulty, failure, scheduling |
| Reinforcement | `docs/engine/PROMPT.md` §7.5+ | weak signals, resurfacing, confirmation, graduation |
| Teaching/breakdowns | `docs/engine/PROMPT.md` §7.6+ | explanations, primers, recovery experience |
| Transfer probes | `docs/engine/PROMPT.md` §7.7+ | varied question surfaces and boss behavior |
| Learner personas | `docs/engine/PROMPT.md` §7.8; `docs/design/personalities.md` history | profile and adaptive routing |
| Proficiency rank | `docs/engine/PROMPT.md` §17 | profile, dashboard, reassurance language |
| Subject-specific exams | `docs/engine/PROMPT.md` §4 and graphs | setup, question formats, scoring, dashboard |
| Persistence/stats | `docs/engine/PROMPT.md`, `data/state/` | resume, results, recommendations, player history |
| Prototype interaction | `app/rogue.*` | current Hall/run/results behavior |
| T6 exam fallback | `docs/briefs/T6_REVISION_FALLBACK.md`; `docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md`; `docs/briefs/T6_RESEARCH_REVIEW_IMPLEMENTATION.md`; owner-supplied T6 AI-ready pack | four-subject dashboard, evidence-based progress, adaptive repetition, mixed formats, confidence, constructed response, first-cohort boundary |
| Controlled tester release | current owner direction; `docs/briefs/TESTER_ACCESS_AND_ADMIN.md`; `docs/community/TESTER_GUIDE.md`; `docs/community/PRIVACY.md`; `SECURITY.md`; `docs/community/COMMUNITY_PLAYBOOK.md` | hosting boundary, identity access, source publication, feedback, moderation, announcements, incident intake |
| Teaching layer | `docs/authoring/LESSON-AUTHORING-PROTOCOL.md`; `docs/briefs/TEACHING_LAYER_AUTHORING_PLAN.md`; `docs/briefs/MISFILED_LESSONS_WORK_ORDER.md` | lesson authoring contract, per-subject backlog, and the misfiled-lesson record |
| Vision-to-build route | `docs/briefs/DUNGEON_VISION_TO_BUILD.md` (proposed 2026-08-18, owner decisions open) | measures the four standing promises against the build; owns the taught-vs-tested finding and the phased route to close it |
| Legacy practice portal | `legacy/prototypes/index.html` and other mock pages | content inventory and old navigation |

## Conflict register

These must be resolved explicitly or represented as open product decisions. Do not silently pick
one side.

### C1 — HP / Resolve count

- Learning engine: player starts each level with **2 HP** by default.
- Historical flow prototype: player started with **3 Resolve**.
- First-slice resolution (2026-07-16): use **2 Resolve**, matching the engine default. Any
  mode-specific variation requires a new explicit rule.

### C2 — Pixel prototype versus painterly production

- Existing Door composite and character implementation retain a pixel-like finish.
- Current creative brief targets crisp, graphic, painterly 2D with no visible pixel grid.
- Resolution (2026-07-16): owner confirmed the painterly brief. Existing Door assets remain
  interim identity/composition/motion references until production replacements pass the asset gate.

### C3 — Product economy versus learning engine

- User/product flow requires Embers, cosmetics market, quests, and power-ups.
- The learning engine does not currently define their durable economy or learning effects.
- First-slice resolution: the browser-local product layer defines one scarf market, one quest, and
  Insight/Compass/Anchor without changing difficulty, grading, scheduling, or persona detection.
  Durable core-engine integration remains deferred.

### C4 — Difficulty vocabulary and behavior

- Engine: numeric levels including an exact Exam Sim mode with subject-specific rules.
- First-slice resolution: only Practice + Applied II is enabled; unsupported choices are visibly
  unavailable. Broader numeric/exam mapping remains deferred.

### C5 — Chapter/Dungeon selection

- Engine: graph neighbourhoods and concept clusters.
- First-slice resolution: only The Transmission Stair is enabled and it owns one fixed
  Macroeconomics question set. Graph-backed chapter breadth remains deferred.

### C6 — Feedback timing

- Historical prototype offered Immediate, Checkpoint, and End options without implementing them.
- Engine is built around evaluation and teaching after each question.
- First-slice resolution: Immediate feedback only. Other timings remain unavailable until their
  pedagogy and engine behavior are defined.

### C7 — Persona and rank visibility

- Engine has eight data-derived personas, a calibration threshold, profile patterns, and four
  proficiency ranks with strict language rules.
- First-slice resolution: persona and rank are omitted. Future dashboards may show them only when
  the engine's minimum evidence threshold is met; never use a self-report identity quiz or expose
  hidden rank thresholds.

### C8 — Product identity

- Creative direction uses **Dungeon**.
- Historical prototype used **The Ascent — flow prototype**.
- Legacy portal uses **Open Mock**.
- Resolution: **Dungeon** is the product identity; **The Ascent** labels the in-run climb/world
  visualization.

### C9 — Character roster

- Creative direction makes Ari the central identity anchor.
- First-slice resolution: Ari only, with scarf cosmetics. Additional explorers require distinct
  readable silhouettes and full animation coverage.

### C10 — Real player data versus fresh-user testing

- Existing state, stats, history, weak nodes, personas, and ranks may represent real learning.
- Fresh-user usability requires clean deterministic conditions.
- Required rule: test through a separate profile or scenario loader. Never clear real state to
  simulate onboarding.

### C11 — Broad product slice versus exam-season fallback

- The 2026-07-16 product slice leads with cinematic identity, Ari, a Hall, cosmetics, currency,
  quests, power-ups, and one Macroeconomics route.
- Current owner direction requires a last-minute T6 revision tool whose learning path earns the
  product layers later.
- Resolution (2026-08-10): the T6 fallback is the active default route. It removes all non-learning
  gates from the critical path, keeps configurable generic practice one click away, and preserves the broad product
  slice at `legacy/rogue/rogue.html` as a legacy reference rather than deleting it.

### C12 — Game-system vocabulary versus student comprehension

- The earlier fallback exposed runs, Resolve, chain breaks, and other game-system ideas in the
  active revision path.
- Current owner direction requires a student who knows nothing about the product to understand
  their progress and next action immediately.
- Resolution (2026-08-10; revised 2026-08-11): the active route uses only study sets, configurable
  practice checks, concepts,
  Strong, Developing, Needs practice, Not started, feedback, and re-attempts. The useful learning
  properties remain underneath: cumulative module order, causal explanations, priority scheduling,
  and a later different-perspective question after a miss. Legacy vocabulary may remain only in
  preserved legacy files and historical records.

### C13 — Quick encouragement versus trustworthy Strong evidence

- The first fallback promoted a concept to Strong after two recent correct answers from two
  perspectives. This made progress move quickly but overstated the evidence.
- Current owner direction requires longer-term development, confidence calibration, and a visible
  explanation of why a concept is judged Strong, Developing, or Needs practice.
- Resolution (2026-08-11): follow
  `docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md`. Strong requires repeated correct evidence
  across formats and practice blocks, applied evidence from a new case or valid reasoning step,
  and no open misconception, confident error, uncertain-correct confirmation, or relevant failed
  reasoning step. Whole-chain completion remains separate. Time evidence is reported separately
  so same-day fluency is never described as retained proof.

### C14 — Concept list versus evidence-over-time trend

- A full 16-concept list made the Concepts view feel like another inventory and encouraged the
  learner to read activity as progress.
- Current owner direction prefers a graph that gives a visible sense of growth without rewarding
  empty repetition.
- Resolution (2026-08-11): graph demonstrated understanding, not attempt count. Needs practice
  contributes zero, Developing partial credit, and Strong full credit; the line may plateau or dip.
  Show only one two-concept module at a time and reveal the reason/evidence panel only when the
  learner selects a concept.

### C15 — Decorative hierarchy versus functional pixels

- Applied-question cards accumulated repeated format, count, status, concept, source, instruction,
  borders, and accent rules. A case was first in reading order but incorrectly became the largest
  headline, while the actual decision was visually secondary.
- Current owner direction: every pixel must earn its place.
- Resolution (2026-08-11, revised after Browser review): the case and the instruction it governs
  form one aligned prompt flow directly on the main warm-white question surface, not a nested
  tinted panel. Because the case contains the substantive problem, it is the larger primary
  reading text; the answer instruction is a compact bold directive beneath it. Dependent steps
  use spacing and restrained dividers instead of repeated cards. Only controls, feedback, or a
  genuine change of interaction/state should introduce another boundary. A case-free question
  keeps its large question heading and receives no extra prompt box. Format/count/status/concept/
  source metadata remains available in DOM/data for audit but is hidden from learners. Matching
  instructions are not presented as cases. Ornament is permitted only when it communicates
  hierarchy, dependency, feedback, navigation, or accessibility state.

### C16 — Selected-subject focus versus a global recommendation

- The focus panel said “Recommended now” for every subject because switching the selected subject
  recomputed a local next action. The label implied four simultaneous global recommendations.
- Unanswered prompt and reasoning-chain surfaces also used guidance cyan without a student-facing
  state that the color explained.
- Resolution (2026-08-11): do not use a global recommendation label for a subject-local action.
  Name only the selected subject and use action-specific buttons: resume, start this study set,
  practise these concepts, or choose a generic practice check. Keep unanswered learning surfaces neutral;
  reserve color for selection, action, progress, accessibility focus, and answer/status feedback.

### C17 — Useful first-cohort practice versus an invented final-paper replica

- No same-course T6 final exists to copy, while the public programme policy permits several broad
  assessment families.
- Resolution (2026-08-11): let learners choose recognition, application, generation, or mixed
  generic practice and immediate or end-held feedback. Label every such route as practice, never
  a final-paper simulation or score prediction. The absence of a first-cohort paper does not block
  useful generic practice. Exact-paper uncertainty is the standing
  `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` boundary, not a prerequisite this cohort can wait for.

### C18 — Constructed practice versus opaque automatic grading

- Source-grounded generation is useful, but browser keyword matching cannot validly grade the
  quality of an open response.
- Resolution (2026-08-11): require the learner to write before seeing a rubric, then expose
  explicit criteria and a grounded exemplar for self-review. Store it as unscored practice and do
  not let it independently create correctness or Strong evidence. In held-feedback mode, both the
  rubric and grounded exemplar wait until results.

### C19 — Tester access versus unnecessary learner-data infrastructure

- Opening Dungeon to potential users creates a need for stable hosting, health checks, security,
  feedback, moderation, and release communication, but does not by itself justify collecting
  accounts, analytics, academic records, or server-side learner histories.
- Resolution (2026-08-11): deploy an allowlisted static learning bundle behind a small worker with
  a health route and response security headers; keep progress browser-local; publish privacy,
  security, tester, and community policies; exclude live/local data and owner source packs from
  source and deployment; use WhatsApp for voluntary cohort conversation and structured feedback.
  Any telemetry or account backend requires a separate purpose, consent, retention, and deletion
  decision.
- Superseding owner decision (2026-08-11, same day): testers must keep their revision progress
  across devices and a cleared browser, and the owner must be able to see obvious account sharing.
  A minimal shared backend is now justified and built: per-email tester records, opaque
  session-token hashes, progress rows, first-login country, agreement version/time, and community
  invite-opened, membership-acknowledged, and owner-reminder timestamps in Cloudflare D1. It stays
  minimal on purpose — no analytics, no academic records, no raw responses
  beyond the learner's own saved revision state, no precise location. The browser copy remains an
  offline fallback, revocation deletes a tester's sessions and progress, and the collection notice
  is stated in `docs/community/PRIVACY.md` and the tester agreement. Telemetry and the paused cohort agents remain
  separate, still-unmade decisions.
- Superseding owner decision (2026-08-22): persistence remains, but first-country and device-lock
  enforcement are retired. New sessions clear legacy lock/country state, and migration `0008`
  clears it for existing rows. Personal access remains a contractual and manually reviewable
  boundary rather than an automated region/device verdict.

### C20 — Anti-harvesting intent versus the limits of a client-side bank

- The owner does not want unrelated students scraping the authored bank, but approved testers must
  still receive learning content in a browser and the current scheduler loads allowlisted teaching,
  bank, mock, and final-revision scripts.
- Resolution (2026-08-11, amended the same day when the emailed code was dropped): use individual
  approved-email admission, session-gated learner assets, owner-only administration, revocation,
  no-index responses, private cache controls, edge rate limiting, one active browser per email, and
  a country lock to prevent anonymous/casual collection and contain abuse. Never call this perfect
  anti-scraping or DRM: an approved technical tester can still download visible client assets, and
  the admission check proves possession of an approved address, not identity. Stronger protection
  requires a separate server-side, per-session item-delivery architecture.
- Superseding owner decision (2026-08-22): remove the one-browser and country-lock enforcement from
  that control set. Approved-email admission, signed sessions, revocation, private caching,
  no-index responses, and learner-path rate limiting remain; the authenticated admin path is
  explicitly excluded from learner burst limiting so its own API fan-out cannot lock out the owner.

### C21 — Exact path routing versus a private origin

- `aneeketdas.com/dungeon` needs Cloudflare path routing, while exposing the Sites origin publicly
  would let visitors bypass the domain gate.
- Resolution (2026-08-11, superseding the prepared origin proxy): deploy the allowlisted assets
  directly with the Cloudflare Worker, so the Sites release can remain owner-only without any
  origin bypass credential. Put the broader tester Access policy on `/dungeon*` and the more-
  specific owner-only policy on `/dungeon/admin*`; the Worker blocks direct public admin asset
  aliases. The owner dashboard manages the dedicated email-only Access group through an owner-JWT-
  verified edge endpoint and never calls Cloudflare from browser code. The owner bootstrap email
  is not revocable there, and any mixed-selector group fails closed for manual review.

### C22 — Helpful cohort agents versus consent and owner authority

- Learning-signal, question-bank, and cohort review could reduce owner workload, but no consented
  event backend, retention/deletion flow, review queue, or access adapter exists yet.
- Resolution (2026-08-11): keep all three agents prepared but disabled. Contracts exclude direct
  identity, IP, user agent, raw text, and written responses; outputs are proposals only. Activation
  checks fail closed until every gate in `.agents/deployment.json` is true and the owner explicitly
  approves activation. Three schedules may be registered for deployment readiness only when both
  their stored Codex status is `PAUSED` and the repository declaration remains `enabled: false`.
  Registration is not activation.

### C23 — Confidence as diagnosis versus confidence as punishment

- The owner initially explored reducing confidence after confident errors. The research review
  found support for precise correction and later transfer checks, not humiliation, artificial
  difficulty, rewards, or covertly easier work.
- Resolution (2026-08-11): confidence is sampled, behaviorally anchored, and optional. A confident
  error receives a contrastive explanation and different-family diagnostic, then closes after two
  independent repairs. Confidence never changes correctness, earns points, defines a personality,
  or secretly changes difficulty. Aggregate language requires 20 judgments across three blocks
  and two formats before any provisional overall summary.

### C24 — Primer support versus false mastery

- Showing minimum information before a first challenge can make a run learnable, but awarding
  mastery for rereading that information would turn assistance into false evidence.
- Resolution (2026-08-11): generate one source-traceable primer per concept and interleave only the
  next new primary concept before its challenge. Primer state fades after easy success, disappears
  after two harder correct challenges or Strong evidence, and returns at applied/misconception
  levels after misses. Primer answers never enter scored attempts, result percentages, cohort
  analytics, or Strong gates, and held-feedback simulations contain no primers.

### C25 — Required WhatsApp membership versus unverifiable external state

- Group membership is required for updates and feedback, but the browser has no truthful WhatsApp
  membership API and must not present a link click as proof of joining.
- Resolution (2026-08-11): disable the join acknowledgement until the actual invite link is opened,
  then require a separate explicit self-attestation. Store the open, acknowledgement, and bump
  timestamps; say plainly that membership cannot be independently verified. The Control Room can
  bump all missing acknowledgements or one tester, but only records the in-app reminder and copies
  a message for manual sending. Removal remains an owner action after reminders and never uses
  academic accuracy.

### C26 — Concept inventory versus first-two-scroll decision evidence

- Subject cards, module controls, concept details, and the trend competed with the next learning
  action, while placing the trend under Concepts hid the evidence learners need to orient quickly.
- Resolution (2026-08-11): keep the next-action hero first, then show a five-axis Term 6 mastery
  matrix (BRGSA, IBM, SCLM, SPMS, Connections) and the selected-subject evidence trend. Preserve an
  accessible value list beside the canvas. Subject selection follows and concept inspection stays
  lower in the staged dashboard.
- **Ordering superseded by C30 (2026-08-12).** The matrix, the trend, and the accessible value
  list remain; "concept inspection stays lower" no longer holds, because the inspector was
  merged into the concept row.

### C27 — Staged evidence dashboard versus a dynamic homepage

- C26 put the next-action hero first, then the mastery matrix and the selected-subject trend, with
  subject choice below and the staged panels hiding the hero.
- Owner direction (2026-08-11, later the same day): subjects belong at the top for fast switching;
  the homepage should carry a trendline rather than a `0 of x` counter; it should invite the learner
  to mix and match a practice check, reassure them about how far they have come, and only then open
  into the holistic view further down the scroll.
- Resolution: order the dashboard as subject rail → next-action hero with a live evidence
  trendline and a data-derived momentum line → practice builder → "How far you have come" →
  mastery matrix and Term 6 four-state totals → staged Subject focus / Concepts / Study plan
  panels. The persistent header carries a Term 6 sparkline instead of the strong-concept counter,
  and the detailed evidence graph moves next to concept inspection. Nothing hides when a panel is
  opened: the page is one continuous scroll. Reassurance copy is derived from recorded attempts and
  never converts activity into praise or predicts a result.
- **Ordering superseded by C30 (2026-08-12).** The staged panels and the "nothing hides" rule
  are withdrawn — the rule had already been broken by the three disclosures added after this
  entry. Still in force: subjects at the top, a trendline rather than a counter, the header
  sparkline, and the reassurance-copy restriction.

### C28 — Configurable practice as a modal versus a homepage builder

- The practice setup lived in a dialog reached from two places, so the most configurable part of the
  product was invisible until a learner went looking for it.
- Owner direction: the homepage should encourage mixing and matching a check.
- Resolution (2026-08-11): one inline builder on the homepage owns generic practice, and the dialog
  is removed. Shape, concept focus, length, and feedback timing each change the generated run.
  LAW-01 applies literally: a combination with no questions, a narrowing focus that would select the
  whole pool, and a length that cannot add questions over a shorter one are each disabled with the
  reason shown before selection. The summary states the real count and time estimate. The exam-
  pattern boundary is stated in the builder itself.
- **Reinforced by C30 (2026-08-12).** The builder remains the single owner of generic practice
  and every rule above still holds. What changed is that it had acquired three entry points,
  which is the same failure this entry was written to fix, one level up: it now has one.

### C29 — Row-by-row matching versus a matching board

- Long-form matching listed every long answer card under every row, so a four-row question made the
  learner read the same four paragraphs four times. An intermediate version showed each statement
  once with a radio list beneath it; that was shorter but still stacked, so statements could not be
  compared and the labels sat away from the text they described.
- Resolution (2026-08-11): when the answer cards carry the substance and the row labels are short,
  render a board. Statements sit side by side in one row, each has a slot directly underneath, and
  the unplaced label tablets wait in a tray docked to the bottom of a resizable board. Placement
  works by choose-then-place, by drag, and by keyboard, and each label is used once. The stored
  response stays row-indexed, so partial credit, concept results, misconceptions, and the answer
  review are unchanged. Short-choice matching keeps its compact select layout.

### C30 — A staged dashboard versus four questions asked once

- C26, C27, and C28 each moved the homepage's furniture without reducing it. The result was
  a page that answered the same question in several places: three doors to the practice
  builder (a disclosure summary, a "Mix your own practice" button, and the hero call to
  action whenever the recommendation happened to be a mock), two lists of the same sixteen
  concepts where only the list that could **not** act on them explained why they needed
  work, "N of 16 strong" in two places, the same evidence drawn eight ways, and hide/show
  nesting three levels deep. C27's "nothing hides" rule was already broken in practice by
  the three disclosures added after it.
- Owner direction (2026-08-12): the homepage should answer **what am I doing → where can I
  start → how am I doing → additional resources**, collapse options that appear more than
  once, and reduce the cognitive load of the current UI.
- Resolution (2026-08-12): four labelled blocks in that order, each answering its question
  once. Only "Additional resources" collapses, and every collapsed thing keeps a visible
  Show/Hide affordance. **Supersedes C26, C27, and C28's ordering**; C28's substance is
  strengthened rather than reversed — the inline builder is still the single owner of
  generic practice, and it now has exactly one entry point instead of three.
- Preserved from the superseded entries: the next action stays first inside its block
  (C26/C27), reassurance copy stays derived from recorded attempts and never becomes praise
  or prediction (C27), and every builder option still states its effect before selection
  (C28, LAW-01).
- Nothing was removed as a *capability*. The module stepper and concept inspector were
  deleted as a **duplicate view**; their content — the concept summary, the evidence still
  missing, and the confidence note — now sits on the concept row it describes.
- Evidence: `evidence/2026-08-12/t6-homepage-four-questions/verification.md`. Pixel-level
  acceptance is still owed; the Browser pane was not compositing when this was verified.

### C31 — Do not infer from speed versus use latency to guard a learning claim

- The 2026-08-11 evidence brief prohibited inferring an unknown learner state from speed. That
  remains correct: response speed is not confidence, ability, motivation, or answer correctness.
- The owner-supplied 2026-08-13 measurement brief asks for a narrower use: detect responses too
  rapid to serve as independent evidence for the claim **Strong**, while preserving the response
  and every consequence of its correctness.
- Resolution (2026-08-13): start an ephemeral monotonic timer at render and compute elapsed time
  when the learner commits the response. Persist no raw time — only a coarse duration band and
  derived flags. A rapid
  correct answer stays correct, receives normal feedback, and can schedule normally, but is
  excluded from Strong-eligible counts. A slow answer is never penalised. Historical attempts with
  no timing remain eligible rather than being silently downgraded. Restored complete responses have
  unknown timing because the true start moment cannot be reconstructed. The threshold is explicitly
  provisional until item/format means exist, and it may gate only the claim, never the learner.

### C32 — Qwen may own a local practice mark, while mastery and official grading remain separate

- Earlier production work made constructed responses transparent self-review because a thin
  browser keyword check could not validly judge reasoning (LAW-23). The owner has now explicitly
  asked for course-grounded RAG with Qwen as the answer authority.
- Resolution (2026-08-13): on an explicitly enabled loopback-only development origin, Qwen may
  issue Dungeon's final criterion mark for written **practice** when two blinded passes agree and
  every decision survives server-side schema, answer-quote, lecture-boundary and citation checks.
  A missing criterion proactively schedules another surface. Any uncertainty or failure abstains
  into the existing visible self-review path.
- This does not change examiner marking, publish a model endpoint, transmit live tester answers,
  claim an official course grade, or make constructed work Strong evidence. The saved local record
  remains `scored:false`.
- Owner resolution (2026-08-13): the exact installed LM Studio identifier
  `qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled` is approved for the local practice path. It
  is reached from the authoritative Windows checkout through a private SSH loopback forward and is
  never relabelled as an official base checkpoint. A real Browser 3/3 path and 12-case synthetic
  smoke verify operation; academic quality remains waiting on the 48-answer owner-marked set.
  Deterministic and synthetic fixtures do not establish marking validity.

## Conflict handling protocol

Before implementing a slice:

1. inventory all brief files available in the workspace and connected sources;
2. record each source's domain and authority;
3. identify contradictions affecting the planned slice;
4. resolve from explicit current user direction where available;
5. ask only when the unresolved choice materially changes the product;
6. document the chosen resolution and affected files;
7. test the implementation against every source it claims to satisfy.

If a new external brief is added later, insert it into this index before implementation. Do not
silently merge contradictory requirements.

## External brief status

The owner-supplied Project Operating System brief has been adapted and stored at
`docs/briefs/PROJECT_OPERATING_SYSTEM.md`. On 2026-07-16, the owner confirmed that the “other design
briefs” previously referenced are the existing `docs/design/ART_DIRECTION.md` and
`work/art-direction-research/` set. The active brief inventory is therefore complete and
`WAITING_OWNER_BRIEFS` is cleared. Any newly supplied brief must still be indexed before it affects
implementation.

On 2026-08-10 the owner supplied the external `Term 6 AI-Ready Pack` as the active T6 course
evidence layer and explicitly reprioritised the product around last-minute exam readiness. The
durable product and source mapping is recorded in `docs/briefs/T6_REVISION_FALLBACK.md`. BRGSA, IBM,
SCLM, and SPMS now have source-traceable ten-set banks and a shared verified dashboard. Exact
paper structure is `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`; that boundary does not block generic
practice. Transcript-derived question quality still requires owner/faculty acceptance before
`DONE`.

On 2026-08-11 the owner rejected quick Strong classifications and requested confidence-aware,
explainable progress plus harder boss and mixed-format questions. The uncertainty audit, primary
research frame, prior-term pattern audit, evidence gates, item schema, and seven-day scheduling
contract are recorded in `docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md`; implementation and
real-Browser evidence are at `evidence/2026-08-11/t6-evidence-challenges/verification.md`.

On 2026-08-11 the owner directed a controlled potential-user launch with backend infrastructure,
an owner-GitHub repository, and an owner-administered WhatsApp tester community. The privacy-first
release boundary is recorded in C19 and the launch evidence at
`evidence/2026-08-11/tester-launch/verification.md`. The private repository and WhatsApp group are
active for the eight-address cohort at the latest Control Room read; broader public access remains
outside the closed-test scope.
