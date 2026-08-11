# Changelog

Newest first. Add one entry for every session that changes the workspace. Each entry records what
changed, decisions, verification/evidence, and deferrals.

## 2026-08-11 — Identity-gated tester design and Dungeon Control Room

- Selected per-email, one-time-code tester access with individual revocation instead of a shared
  cohort password. Designed a higher-priority owner-only policy for `/dungeon/admin*`, a broader
  tester policy for `/dungeon*`, a private origin, and edge rate limiting.
- Added `briefs/TESTER_ACCESS_AND_ADMIN.md` and recorded the honest protection boundary: identity,
  audit, no-index, private caching, and throttling prevent anonymous/casual harvesting, but an
  approved technical tester can still download the current client bank. Server-side item delivery
  is required before any stronger anti-scraping claim.
- Added the responsive Dungeon Control Room with production health/release checks, tester
  add/revoke guidance, a release checklist, structured feedback copy, and a change-announcement
  composer. It never fabricates tester/usage counts or sends an announcement without another
  explicit action.
- Expanded the allowlisted release from six to ten assets for learner, admin, and `robots.txt`;
  added learner/admin redirects, global no-index and same-origin headers, and private caching for
  question-bearing scripts. Five release tests now cover the protected boundary.
- Provisioned and deployed the Sites origin, then returned it to custom owner-only access after the
  owner requested a tester gate. No tester was invited and no public domain route was left active.
- Installed the Cloudflare connection and opened the authenticated account for `aneeketdas.com`.
  Zero Trust Free advertises $0 and 50 seats, but activation requires terms acceptance and
  authorisation to charge the saved card for over-limit usage. No checkbox or Activate action was
  completed; exact `/dungeon` routing is `WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS`.
- Admin JavaScript/worker syntax, the ten-asset build, five release tests, desktop Browser layout,
  truthful unavailable-service states, announcement preview, and no horizontal overflow passed.
  Evidence: `evidence/2026-08-11/tester-access-admin/verification.md`.
- Production Browser acceptance caught the manifest outside the served asset root: health passed
  but release status stayed unavailable. The build now emits secret-free release metadata into the
  served client root as well, with `BUG-LAWS.md` LAW-27 preventing recurrence.
- Added a deliberately inert three-agent cohort control plane: Learning Signal Auditor, Question
  Bank Steward, and Tester Cohort Steward. All remain disabled with no automation IDs; versioned
  contracts reject direct identity/raw responses and the activation check fails until backend,
  consent, retention/deletion, owner review, adapters, synthetic acceptance, and explicit owner
  approval are complete. Evidence:
  `evidence/2026-08-11/tester-agent-readiness/verification.md`.

## 2026-08-11 — Research-review integration and confidence-safe adaptation

- Read and mapped the owner-supplied substantive literature review into implemented, prototype,
  wait-for-data, and prohibited decisions in `briefs/T6_RESEARCH_REVIEW_IMPLEMENTATION.md`.
- Replaced universal confidence polling with sampled, staged, behavioural confidence on high-value
  diagnostics. Added a penalty-free skip and prohibited confidence grinding, rewards, secret
  difficulty changes, sparse personality labels, and fake probability scores.
- Added contrastive confident-error feedback, prerequisite bridges for uncertain misses, one
  new-family confirmation for uncertain correct answers, and two independent repair checks for a
  confident error. Learner-facing priority copy now explains the evidence reason for practice.
- Preserved valid unassisted boss steps as applied concept evidence while keeping failed steps and
  whole-chain completion separate. A permanent universal boss gate is deferred until learner data
  supports it.
- Added 64 write-first, source-grounded short-answer items with transparent rubric self-review and
  exemplars. They remain unscored, cannot independently create Strong, and expose no answer-shaped
  cue before final review in held-feedback practice.
- Added learner-selected recognition, application, generation, and mixed practice with immediate
  learning feedback or fully deferred review; held responses remain session-local and do not
  mutate dashboard evidence until completion. MCQs may use three or four plausible options.
- Added optional one-, three-, and seven-day plans with breaks, sleep protection, and honest
  same-day versus delayed-retrieval language. Reframed the absent first-cohort paper as
  `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`, a claim boundary rather than a blocked dependency.
- JavaScript syntax, the 728-item/source/breadth validator, release tests, desktop and 390-pixel
  staged confidence, constructed self-review, boss partial evidence, practice setup, held review,
  study horizon, accessibility labels, overflow, and Browser logs passed. Evidence:
  `evidence/2026-08-11/t6-research-integration/verification.md`.
- Deferred: faculty/owner item and rubric acceptance, real-learner calibration of confidence
  cadence and mastery thresholds, cognitive interviews, psychometric models, and a checked-in
  interaction suite across all 40 sets.

## 2026-08-11 — Controlled tester release, generic practice, and constructed self-review

- Expanded the bank from 664 to 728 source-traceable items by adding one constructed-response
  surface per concept. Active scheduling is now 565 items after the same 163 answer-shape-risk
  MCQs remain quarantined; every concept has at least eleven active surfaces, five formats, seven
  families, and boss coverage.
- Added learner-selected generic practice across recognition, application, generation, and mixed
  shapes with immediate-teaching or end-held feedback. Added one-, three-, and seven-day plans
  that protect breaks and sleep and do not relabel same-day performance as retention.
- Kept constructed practice truthful: learners write before seeing a source-grounded rubric and
  exemplar; self-review is unscored and cannot independently create Strong evidence. Corrected the
  held-feedback route so a saved short answer exposes neither rubric nor exemplar before results.
- Added a dependency-free, allowlisted tester build and a production worker with a health route,
  security headers, and cache policy. Added release tests plus `TESTER_GUIDE.md`, `PRIVACY.md`,
  `SECURITY.md`, and `COMMUNITY_PLAYBOOK.md`; live `state/`, `history/`, owner source packs, CLA
  analysis, work outputs, and local secrets are excluded from source publication and deployment.
- Provisioned an owner-only Sites project for production verification. A private GitHub repository
  and WhatsApp community are staged in the owner's authenticated accounts but not created pending
  explicit confirmation; public tester access remains unapproved.
- JavaScript syntax, the 728-item/source/breadth validator, allowlisted build, four release tests,
  desktop learning and held-feedback paths, generation self-review, end-of-check answer review,
  and 390-pixel no-overflow checks passed in a real Browser. Evidence:
  `evidence/2026-08-11/tester-launch/verification.md`.
- Boundary/deferred: `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` prohibits exact-paper claims for this
  cohort; faculty/owner content and rubric acceptance, empirical cohort statistics, and a checked-
  in interaction suite for all 40 study sets remain deferred.

## 2026-08-11 — Unified neutral prompts and scoped subject actions

- Corrected the applied-question hierarchy after owner review: a genuine case and its answer
  instruction now share one aligned flow on the main warm-white question surface. The substantive
  case is the larger semibold reading text, the instruction is a compact bold directive, and
  case-free questions retain their large heading without a redundant box.
- Removed the remaining non-functional containers: the tinted prompt panel, redundant reasoning-
  chain strip, bordered boss-step cards, cloze panel, and matching-row cards. Spacing and subtle
  dividers now carry sequence; only controls and post-answer feedback retain boundaries.
- Removed the misleading “Recommended now” label from the selected-subject focus. The UI now names
  BRGSA/IBM/SCLM/SPMS only and uses action-specific buttons: resume saved practice, start this study
  set, practise these concepts, or open what was then called the full practice mock. That label was
  later replaced by the configurable generic practice check.
- Neutralised unanswered practice: prompt groups, step labels, practice
  metadata, and focus metadata no longer use cyan as category decoration. Semantic color remains
  for selection, primary action, progress, accessibility focus, and answer/status feedback.
- Added `DESIGN_SOURCE_INDEX.md` C16, `QUALITY-LOG.md` I11–I13, and `BUG-LAWS.md` LAW-17–19 so
  dependency grouping, functional pixels, color meaning, and recommendation scope remain durable.
- JavaScript syntax, all four subject switches, context-specific button copy, boss/case-fill/match
  layouts, transparent wrapper styles, shared left alignment, desktop and 390-pixel widths, and
  empty Browser logs passed.
  Evidence: `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`.

## 2026-08-11 — Evidence-based progress, mixed challenges, and staged question UI

- Replaced the two-answer Strong shortcut with inspectable evidence gates: at least five attempts,
  four correct, three formats, two practice blocks, an unassisted boss pass, latest-answer success,
  and no unresolved high-confidence or boss error. Added low/fair/high confidence to every attempt,
  honest same-day/delayed qualifiers, and dashboard reasons for every state. The research-review
  revision above later replaced universal confidence polling and the permanent boss gate.
- Reworked the dashboard into staged Overview, Concepts, and Study plan surfaces. Replaced the
  16-item concept list with an evidence-over-time trend that can plateau or dip, one two-concept
  module at a time, and an on-demand explanation/practice inspector.
- Added `briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` after auditing known/unknown uncertainty,
  primary retrieval/spacing/relearning/confidence research, IIMB's public assessment-family
  boundary, and locally held prior-term item patterns.
- Added `mock/sets/t6_challenges.js`: the complete bank now has 664 tagged source-traceable items,
  including cloze, case-cloze, match, and 160 three-step boss questions. Active scheduling contains
  501 items; 163 legacy MCQs with detected correct-answer length cues are quarantined. Every concept
  retains at least ten active surfaces, four formats, six families, and boss coverage.
- Added `mock/validate_t6_bank.js` for schema, source ID, concept breadth, format, boss, option-shape,
  and run-pool validation. Question choice prefers unseen IDs, families, and formats, then the
  least-recently used surface; full mocks select three least-recent boss items.
- Cleaned the learner-facing question hierarchy under the owner rule “every pixel earns its
  place”: a genuine case is quiet body text in reading order, the task is the sole headline,
  matching instructions are not fake cases, and duplicated format/count/status/concept/source
  metadata remains available for audit but is hidden from learners. Removed decorative case rules
  and fixed long native-select overflow.
- Corrected a Browser-discovered boss-credit bug where a partially correct chain could satisfy a
  covered concept's boss gate. Added `BUG-LAWS.md` LAW-14–16, `QUALITY-LOG.md` I9–I10, and
  `DESIGN_SOURCE_INDEX.md` C14–C15.
- JavaScript syntax, the 664-item/source/breadth validator, desktop and 390-pixel layouts, graph and
  concept explanations, MCQ arrows, confidence gating, cloze/match/boss controls, high-confidence
  partial-boss repair, isolated save/resume, console health, and unchanged hashes for all nine live
  `state/`/`history/` files passed. Evidence:
  `evidence/2026-08-11/t6-evidence-challenges/verification.md`.
- At this stage, exact-paper fidelity and subjective-response practice were deferred. The research-
  review revision above superseded that state with an explicit first-cohort uncertainty boundary
  and transparent constructed self-review. Empirical item statistics, owner/faculty acceptance,
  and a checked-in end-to-end suite across all 40 study sets remain deferred.

## 2026-08-10 — Plain all-subject T6 dashboard and adaptive concept practice

- Replaced the active game-system wrapper with a student-readable revision dashboard: Strong,
  Developing, Needs practice, Not started, study sets, the then-named full practice mocks,
  feedback, and
  re-attempts are now the complete active vocabulary. Recorded the precedence in
  `DESIGN_SOURCE_INDEX.md` C12 and rewrote `briefs/T6_REVISION_FALLBACK.md`.
- Built a 64-concept dashboard across BRGSA, IBM, SCLM, and SPMS with all-subject and per-subject
  progress, eight-module concept maps, clickable focused practice, ten short study sets per
  subject, direct full mock access, and an explicit best-next-step card.
- Authored and grounded the remaining IBM, SCLM, and SPMS banks. The complete catalogue now has
  216 unique questions: 60 BRGSA and 52 each for IBM, SCLM, and SPMS. Every question cites an
  existing supplied lecture file and includes an explanation plus causal concept bridge.
- Implemented weak-first scheduling, later different-perspective re-attempts after misses or
  incomplete correct evidence, a two-perspective Strong rule, truthful results, automatic
  save/resume including resolved feedback, confirmed local reset, keyboard answers, responsive
  layouts, and reduced-motion behavior.
- Fixed three Browser-discovered failures: a root alias that broke relative assets, answer-state
  badges/counts that lagged re-attempt scheduling, and saved sessions that were not restored on
  page load. Added `BUG-LAWS.md` LAW-12–13 and expanded LAW-11; logged the product-quality change
  as `QUALITY-LOG.md` I8.
- Updated `README.md`, `MAC_TRANSFER.md`, `AGENTS.md`, the server root redirect, source index,
  ledgers, and deterministic scenarios. Preserved the legacy cinematic route and all live
  learning-engine state/history.
- Syntax, 216-question structure, source-file references, HTTP/root loading, all four subject
  maps and mocks, real adaptive practice, keyboard flow, desktop/390px layouts, save/resume/reset,
  console health, and nine-file live-data isolation passed. Evidence:
  `evidence/2026-08-10/t6-dashboard-all-subjects/verification.md`.
- At this stage, exact-paper fidelity and grounded subjective responses were deferred; the current
  research-review revision supersedes those two points with the first-cohort uncertainty boundary
  and transparent constructed self-review. Owner/faculty acceptance and a checked-in interaction
  suite for all 40 study sets remain deferred.

## 2026-08-10 — T6 exam-season fallback and verified BRGSA route

- Reprioritised the active product around last-minute Term 6 readiness and recorded the durable
  contract/source boundary in `briefs/T6_REVISION_FALLBACK.md` plus `DESIGN_SOURCE_INDEX.md` C11.
- Replaced the default browser entry path with a stripped T6 experience: direct Run 1 and cold-mock
  access, all ten BRGSA runs, 60 source-traceable MCQ/caselet questions, two Resolve, immediate
  explanations, injected different-surface repairs, two-miss chain synthesis, results, and a
  guarded practice-readiness signal.
- Preserved the broad cinematic/Ari/economy slice at `mock/rogue.html` as a legacy reference rather
  than deleting it; removed its layers from the active exam-season critical path.
- Rewrote `README.md` and updated `MAC_TRANSFER.md` for the T6 launch, browser-storage boundary,
  deterministic scenarios, and legacy routes.
- Kept IBM, SCLM, and SPMS visibly unavailable instead of filling them with placeholder questions;
  at that stage exact-paper fidelity and subjective practice were deferred. Later all-subject and
  research-review revisions superseded both points.
- Fixed two state-truth bugs found in Browser acceptance—stale repair status and lagging completed
  count—and added `BUG-LAWS.md` LAW-11 plus `QUALITY-LOG.md` I6–I7.
- Syntax, 60-question structure, 44 lecture-ID references, local HTTP, pointer/keyboard flows,
  repair/chain-break logic, full cold mock, guarded readiness, save/resume/reset, desktop/narrow
  layout, console health, and live-data isolation passed. Evidence:
  `evidence/2026-08-10/t6-brgsa-fallback/verification.md`.

## 2026-08-04 — npm tunnel launcher hardened

- Replaced the optional Windows tunnel launcher's unpinned `npx -y localtunnel` execution with a
  fail-closed check for an explicitly installed LocalTunnel CLI at exactly version `2.0.2`.
- The launcher now resolves and displays the executable path, validates the version before
  starting either child process, and refuses missing or mismatched installations with exit code 1.
- Confirmed that Dungeon has no npm manifest, lockfile, `node_modules`, named affected-package
  reference, global affected package, or affected package in its cached `npx` dependency trees.
- Missing-CLI and wrong-version runtime checks passed without opening a server or public tunnel;
  automatic package-manager execution is absent from the hardened launcher.
- Added `BUG-LAWS.md` LAW-10 to prevent optional helpers from silently fetching executable
  dependencies in the future. Evidence: `evidence/2026-08-04/npm-tunnel-hardening.md`.
- Deferred: the public-tunnel success path requires an explicitly reviewed LocalTunnel 2.0.2
  installation and was intentionally not opened during the security check.

## 2026-07-16 — Mac transfer prep and vertical-slice handoff

- Added `MAC_TRANSFER.md` with full-folder copy scope, Mac launch commands, Codex startup prompt,
  state-preservation boundary, deterministic scenario URLs, optional art dependencies, and a
  post-copy verification check.
- Added `mock/start-mac.sh` and changed the Claude launch configuration to macOS `python3`.
- Confirmed the web prototype and server have no hard-coded Windows user path, no npm/build step,
  no case-insensitive filename collisions, and no symlink/reparse dependencies.
- Removed an empty `.git` directory that was not a repository and would be misleading after copy.
- Preserved all `state/`, `history/`, `graphs/`, art source, rendered media, and research files.
- Recorded that browser-local prototype state does not transfer with the folder.
- Validation passed for JavaScript syntax, all Python source parses, all JSON files, local routes,
  scenario URLs, Door video/poster, and leaderboard API. Evidence:
  `evidence/2026-07-16/mac-transfer-prep.md`.
- Deferred: real Browser visual/usability acceptance on the Mac.

## 2026-07-16 — Complete local vertical slice implemented

- Rebuilt `mock/rogue.html`, `mock/rogue.css`, and `mock/rogue.js` into a full local loop:
  preload, home, Ari selection, truthful Hall setup, optional scarf market, five-question run,
  climb, secure/developing/missed feedback, quest, three power-ups, summit/failure, evidence-led
  results, recovery action, Archive, Settings, and return home.
- Added isolated browser-storage persistence, save/resume/abandon behavior, reduced motion, and
  deterministic URL state scenarios without touching live learning-engine data.
- Updated `mock/server.py` to serve project-root media portably.
- Product slice uses Dungeon identity, Ari only, two Resolve, The Transmission Stair, Applied II,
  five questions, Immediate feedback, and current Door media as interim art.
- Secondary syntax and HTTP checks passed; visual/browser acceptance remains
  `WAITING_REAL_BROWSER`.

## 2026-07-16 — Project operating system foundation

- Added the Codex-native living index in `AGENTS.md`, including status gates, directory map, Key
  Files, conventions, session rituals, known gaps, and self-maintenance rules.
- Added `BUG-LAWS.md` with seven initial Laws earned from the implementation/source audit.
- Added `QUALITY-LOG.md` for truthful UX, learning integrity, accessibility, art/motion coherence,
  persistence safety, and user-visible performance.
- Added this changelog, `evidence/`, and the multi-agent/tool coordination charter.
- Adapted the owner-supplied Claude-oriented operating-system template to Codex: `AGENTS.md` is the
  automatically loaded project instruction surface; `CLAUDE.md` remains a compatibility entry.
- Recorded the operating-system brief under `briefs/` and added it to
  `DESIGN_SOURCE_INDEX.md`.
- Preserved current product gates: external brief inventory, real Browser, Computer Use, and
  owner product conflicts.
- Verification passed: all 11 operating-system artifacts exist, all 16 indexed Key File
  references resolve, and `AGENTS.md` is 12,304 bytes—below Codex's normal 32 KiB project
  instruction limit. Evidence: `evidence/2026-07-16/admin-system-verification.md`.
- Close-out caught and corrected a stale pre-final byte measurement; added `BUG-LAWS.md` LAW-08
  so future evidence metrics are recorded only after final artifact edits.
- Deferred: production game changes, visual/browser acceptance, and resolution of C1–C9.
