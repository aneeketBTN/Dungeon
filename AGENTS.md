# Dungeon
> **Current status (2026-08-11; supersedes older status notes):** The active plain-language Term 6
> dashboard for BRGSA, IBM, SCLM, and SPMS is `VERIFIED` in a real Browser at
> `evidence/2026-08-11/t6-evidence-challenges/verification.md`, with the latest question hierarchy,
> neutral unanswered-state, and scoped subject-action refinement verified at
> `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`. Applied questions now use one
> aligned warm-white surface: hierarchy, spacing, and restrained dividers connect the case, task,
> and response steps; only controls and feedback introduce nested boundaries. It uses a staged Overview →
> Concepts → Study plan path, an evidence-over-time graph with one module visible at a time,
> confidence-aware and inspectable four-state progress, weak-first varied re-attempts, and a
> 728-item source-traceable bank. Active scheduling has 565 items after excluding 163 older MCQs
> whose answer length could cue correctness; every concept retains at least eleven active surfaces,
> five formats, seven independent families, and module boss coverage. Case, cloze, match, MCQ,
> short-answer, and three-step boss paths are responsive and keyboard-operable, with local
> save/resume/reset. Generic practice can vary recognition, application, generation, or mixed
> work and can show feedback immediately or hold it until the end; time-horizon plans distinguish
> same-day current evidence from delayed retrieval. The report-backed confidence, boss-step,
> constructed-response, priority, and practice-path revision is verified at
> `evidence/2026-08-11/t6-research-integration/verification.md`; the privacy-scoped release boundary
> remains verified at `evidence/2026-08-11/tester-launch/verification.md`.
> Student-facing game/proprietary vocabulary and diagnostic question metadata are removed from the
> learning view. Sixty-four constructed-response surfaces use transparent self-review without
> automatic correctness or Strong credit. Exact final-paper structure is
> `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`: it is an explicit claim boundary, not a prerequisite this
> cohort can wait for. Owner/faculty content acceptance remains open, so the route is not
> `DONE` or an exam-score prediction. A privacy-scoped tester release wrapper, worker health route,
> security/no-index/private-cache headers, release tests, owner control room, and community
> operating documents are verified at
> `evidence/2026-08-11/tester-access-admin/verification.md`. Direct email add/list/revoke controls
> and a fail-closed, owner-JWT-verified Cloudflare group controller are `IMPLEMENTED` and
> synthetically verified at
> `evidence/2026-08-11/tester-dashboard-access-management/verification.md`. Exact
> `https://aneeketdas.com/dungeon/` routing, direct Worker static assets, one-time-code tester
> Access, the more-specific owner admin application, anonymous learner/bank/admin denial, the
> least-privilege group secret, and rapid-request rate limiting are
> `VERIFIED(CLOUDFLARE_API + ANONYMOUS_EDGE)` at
> `evidence/2026-08-11/cloudflare-protected-domain/verification.md`. The private Sites version 5
> remains an owner-only backup and is no longer an origin dependency. The declared Browser now
> resolves the production URL and reaches the more-specific Cloudflare owner login challenge;
> production dashboard interaction is `WAITING_OWNER_ACCESS_SIGNIN` because Browser automation is
> not permitted to complete that authentication challenge. Individual
> grants are `WAITING_OWNER_TESTER_EMAILS`. GitHub and WhatsApp creation remain
> staged owner-confirmed actions. The Learning Signal Auditor, Question Bank Steward, and Tester
> Cohort Steward are `PREPARED_NOT_ACTIVATED`: their project schedules are registered and verified
> `PAUSED`, repository declarations remain disabled, activation preflight intentionally fails, no
> run history exists, and no tester data or external action was touched. Evidence:
> `evidence/2026-08-11/tester-agent-readiness/verification.md`. The earlier
> cinematic/Ari/economy product slice remains at `mock/rogue.html` as an `IMPLEMENTED` legacy
> reference and still lacks complete real-Browser route acceptance.
>
> Static HTML/CSS/JavaScript prototypes in `mock/`; procedural learning engine and state in root
> JSON/Markdown structures; current phase: have the owner complete the open Access sign-in, finish
> the production Browser pass, collect tester emails, create the community/repository, then continue
> owner/faculty content acceptance and learner calibration.

## Start Here — Required Order

1. Read this file top-to-bottom.
2. Read `DESIGN_SOURCE_INDEX.md` before product, art, UX, learning, or gameplay decisions.
3. Skim `BUG-LAWS.md` before implementing or changing anything.
4. If the task affects UI, art, motion, accessibility, learning integrity, persistence, or
   performance, skim `QUALITY-LOG.md`.
5. Check Known Gaps and active `WAITING_*` gates before beginning dependent work.

## Ledgers — Read Before Implementing

`BUG-LAWS.md` is a living, tiered decision aid, not a veto list:

- 🔴 **REDLINE**: a severe demonstrated failure. Follow its comply path.
- 🟡 **WATCH**: a recurring or credible gotcha. Run its verification check.

REDLINEs constrain HOW, never WHETHER. If a Law blocks a good idea, revise the Law and preserve
the safety property.

`QUALITY-LOG.md` owns the costly quality axes: truthful interaction, learning integrity,
accessibility, visual/motion coherence, persistence safety, and user-visible performance.
Standing owner rule: never improve polish, speed, or engagement by weakening answer correctness,
question readability, state truthfulness, accessibility, or real player data.

## Evidence Gates and Status Vocabulary

Every tracked goal, route, scene, or feature carries exactly one status:

`UNSTARTED → DIAGNOSED → IMPLEMENTED → VERIFIED(<evidence>) → DONE`

or `WAITING_<GATE>`, such as:

- `WAITING_OWNER_BRIEFS`
- `WAITING_REAL_BROWSER`
- `WAITING_COMPUTER_USE`
- `WAITING_OWNER_DECISION`
- `WAITING_OWNER_ASSETS`
- `WAITING_PROD_DATA`
- `WAITING_OWNER_CONTENT_ACCEPTANCE`

Rules:

- “Fixed,” “verified,” “ready,” and “done” require a pointer to evidence in `evidence/`.
- Source inspection and synthetic/local checks are secondary evidence.
- Visual/interaction acceptance requires the declared real Browser or Computer Use path.
- A dependent task does not start while its required gate is waiting.
- If new evidence contradicts an earlier claim, the evidence wins. Correct the status,
  `CHANGELOG.md`, and relevant ledger in the same session.
- DONE means all named acceptance sources passed, not merely that code was written.

## Directory Map

- `/` — operating index, design contracts, learning engine, project documentation, and ledgers.
  Root Markdown files are hand-maintained unless explicitly marked generated; `README.md` now
  launches the active T6 fallback and preserves the older engine as a legacy path.
- `briefs/` — owner-supplied briefs and durable implementation mappings. Add each new external
  brief here or index its connected-source location in `DESIGN_SOURCE_INDEX.md`.
- `mock/` — active T6 revision route, legacy static prototypes, content sets, and local server.
- `.openai/` — Sites project binding; contains no runtime secrets.
- `.agents/` — paused tester-agent charters, consent-safe data contracts, synthetic fixtures, and
  fail-closed activation gates; three project schedules are registered `PAUSED` and none is
  running.
- `scripts/` — deterministic public-release build scripts.
- `site/` — production worker entrypoint, health route, and response security policy.
- `cloudflare/` — deployed exact-path static edge, signed Access validation, owner-only tester
  allowlist controller, standalone packaging fallback, and non-source runtime secrets.
- `tests/` — release-boundary, routing, access-management, and security-header checks.
- `graphs/` — generated subject concept graphs. Do not hand-edit during product/UI work.
- `state/` — live game and learner state. Treat as real player data; do not clear for testing.
- `history/` — real question and flag history. Do not repurpose as test fixtures.
- `outputs/` — rendered/candidate media and separated production assets.
- `work/` — source research, animation frames, scripts, and intermediate art outputs.
- `evidence/` — named acceptance evidence, organized by date/task.
- `coordination/` — authority charter and append-only agent/tool exchange notes.
- `_TRANSFER/` — historical transfer/setup memory; not current product authority.
- `.claude/` — Claude-specific compatibility/configuration and the legacy state-manager agent.

If a directory grows beyond roughly 20 meaningful files without an index, flag it. Frame sequences
and generated outputs are exempt when their parent has a manifest/contact sheet.

## Key Files

| Path | Controls | Verified |
| --- | --- | --- |
| `AGENTS.md` | Codex living index, status, gates, rituals, source rules, and project conventions. | 2026-08-11 |
| `CLAUDE.md` | Claude compatibility entry; points to this operating index and preserves engine startup facts. | 2026-07-16 |
| `DESIGN_SOURCE_INDEX.md` | Authority order, brief inventory, and unresolved product conflicts. | 2026-08-11 |
| `briefs/PROJECT_OPERATING_SYSTEM.md` | Durable requirements and Codex adaptation of the owner-supplied admin-system brief. | 2026-07-16 |
| `briefs/T6_REVISION_FALLBACK.md` | Active plain-language dashboard contract, T6 source boundary, mastery/repetition model, and acceptance. | 2026-08-11 |
| `briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` | Research-grounded confidence, evidence-state, boss, mixed-format, rotation, and short-horizon retest contract. | 2026-08-11 |
| `briefs/T6_RESEARCH_REVIEW_IMPLEMENTATION.md` | Owner-supplied first-cohort research review mapped to confidence, construction, practice-shape, accessibility, and evidence decisions. | 2026-08-11 |
| `briefs/TESTER_ACCESS_AND_ADMIN.md` | Live identity gate, anti-harvesting limits, exact-domain routing, owner dashboard, and remaining tester gates. | 2026-08-11 |
| `BUG-LAWS.md` | Living REDLINE/WATCH bug-prevention rules and exact comply/verify paths. | 2026-08-11 |
| `QUALITY-LOG.md` | Experience-quality practices, issue/cause/fix history, and watch items. | 2026-08-11 |
| `CHANGELOG.md` | Newest-first, append-only history of sessions that changed the workspace. | 2026-08-11 |
| `ART_DIRECTION.md` | Creative thesis and canonical world/art identity. | 2026-07-16 |
| `ART_DIRECTION_SYSTEM.md` | Proposed product-wide art, UI, character, asset, and motion system. | 2026-07-16 |
| `GAME_UX_LOOP.md` | Proposed broad-product player flow; retained as legacy direction while the T6 fallback owns the active exam-season path. | 2026-08-10 |
| `MAC_TRANSFER.md` | Mac copy, active T6 launch, current challenge-bank files, browser-storage boundaries, state preservation, and verification handoff. | 2026-08-11 |
| `PROMPT.md` | Current procedural learning engine, subject rules, scheduling, personas, ranks, and save contracts. | 2026-07-16 |
| `REVIEW_LOG.md` | Historical engineering rationale for the learning engine. | 2026-07-16 |
| `personalities.md` | Historical reinforcement/persona design brief; `PROMPT.md` wins when implemented behavior differs. | 2026-07-16 |
| `README.md` | Student-facing active T6 launch, loop, exam-pattern boundary, progress isolation, scenarios, and legacy paths. | 2026-08-11 |
| `TESTER_GUIDE.md` | Controlled-cohort test scope, structured feedback format, privacy boundary, and known limits. | 2026-08-11 |
| `PRIVACY.md` | Tester-facing browser-local data and telemetry boundary. | 2026-08-11 |
| `SECURITY.md` | Private vulnerability-reporting and release-safety policy. | 2026-08-11 |
| `COMMUNITY_PLAYBOOK.md` | WhatsApp community structure, moderation, announcements, and feedback triage. | 2026-08-11 |
| `.openai/hosting.json` | Opaque Sites project binding only; runtime credentials never belong here. | 2026-08-11 |
| `.agents/README.md` | Paused tester-agent control plane, authority boundary, and activation order. | 2026-08-11 |
| `.agents/deployment.json` | Fail-closed activation gates, paused automation IDs, models, cadence, and non-running declarations. | 2026-08-11 |
| `package.json` | Dependency-free release build, validation, and test commands. | 2026-08-11 |
| `scripts/build-site.mjs` | Allowlists ten learner/admin/protection assets and produces the deployment artifact. | 2026-08-11 |
| `scripts/validate-agent-readiness.mjs` | Validates paused charters, synthetic consented events, forbidden fields, and activation blockers. | 2026-08-11 |
| `site/worker.mjs` | Production learner/admin redirects, health response, static delivery, no-index/security headers, and private-cache policy. | 2026-08-11 |
| `cloudflare/src/index.mjs` | Deployed exact-path static router plus owner-JWT-verified, same-origin, email-only tester group management. | 2026-08-11 |
| `cloudflare/scripts/build-standalone.mjs` | Embeds the allowlisted release and bundles the Worker for authenticated API deployment fallback. | 2026-08-11 |
| `cloudflare/wrangler.jsonc` | Deployed Worker asset binding, exact domain route, Access identifiers, and observability configuration; no secret values. | 2026-08-11 |
| `cloudflare/README.md` | Live route, runtime-secret, Access-policy, owner-bootstrap, and rate-limit contract. | 2026-08-11 |
| `cloudflare/scripts/build-standalone.mjs` | Builds the same protected allowlist as an embedded-asset fallback when an Assets upload path is unavailable. | 2026-08-11 |
| `tests/site-release.test.mjs` | Automated release-boundary, privacy, routing, header, and setup-required checks. | 2026-08-11 |
| `tests/cloudflare-access.test.mjs` | Synthetic owner authentication, group invariant, grant, revoke, static allowlist, admin-isolation, health, and private-cache checks. | 2026-08-11 |
| `tests/agent-readiness.test.mjs` | Proves the tester-agent scaffold is healthy, privacy-bounded, and not deployable. | 2026-08-11 |
| `mock/admin.html` | Owner control room for direct tester management, release health, feedback triage, and announcement drafting. | 2026-08-11 |
| `mock/admin.css` | Responsive, accessible control-room layout and status presentation. | 2026-08-11 |
| `mock/admin.js` | Health/manifest checks, tester add/list/revoke flow, copy helpers, and announcement preview without autonomous sending. | 2026-08-11 |
| `mock/t6.html` | Staged dashboard, time-horizon plan, generic practice setup, evidence graph, feedback, results, reset, and exam-boundary surfaces. | 2026-08-11 |
| `mock/t6.css` | Flat single-surface question hierarchy plus low-density, responsive, accessible desktop/narrow revision presentation. | 2026-08-11 |
| `mock/t6.js` | Evidence-gated mastery, time-horizon plans, selectable practice shapes, held-feedback checks, constructed self-review, rotation, persistence, and scenarios. | 2026-08-11 |
| `mock/sets/t6_brgsa.js` | Original BRGSA ten-set bank with 60 grounded questions. | 2026-08-10 |
| `mock/sets/t6_catalog.js` | Four-course catalogue, 64 dashboard concepts, three-perspective surfaces, and 156 IBM/SCLM/SPMS questions. | 2026-08-10 |
| `mock/sets/t6_challenges.js` | Tagged mixed-format augmentation, 160 boss items, 64 constructed responses, 565-item active pools, option-shape exclusions, and rotation configuration. | 2026-08-11 |
| `mock/validate_t6_bank.js` | Four-course schema, source, breadth, format, boss, option-shape, and active-pool validator. | 2026-08-11 |
| `mock/rogue.html` | Legacy character → Hall → run → failure/results product-flow markup. | 2026-08-10 |
| `mock/rogue.js` | Legacy product-slice state transitions, questions, rewards, quest, and outcome behavior. | 2026-08-10 |
| `mock/rogue.css` | Legacy product-slice responsive presentation, feedback states, and animation behavior. | 2026-08-10 |
| `mock/server.py` | Portable local static/media server; `/` now opens the active T6 route; legacy leaderboard API remains. | 2026-08-10 |
| `mock/start-mac.sh` | Dependency-free macOS launcher for the local prototype server. | 2026-07-16 |
| `mock/serve-tunnel.cmd` | Fail-closed Windows launcher for the server and an explicitly installed LocalTunnel 2.0.2 CLI. | 2026-08-04 |
| `evidence/README.md` | Evidence naming, acceptance-source hierarchy, and artifact requirements. | 2026-07-16 |
| `coordination/CHARTER.md` | Owner/agent/tool authority and delivery protocol. | 2026-07-16 |

## Design System and Domain Rules

- Read and follow the authority order in `DESIGN_SOURCE_INDEX.md`; never reconcile conflicts
  silently.
- Current proposed production style is crisp, graphic, painterly 2D. Existing pixel-like assets
  are references until the owner confirms the conflict resolution.
- Saffron means player agency/earned progress; cyan means guidance/insight; hostile coral means
  error/danger. Do not use these as arbitrary decoration.
- Unanswered learning content is neutral. Color must communicate selection, action, progress,
  accessibility focus, or feedback. A subject-local next action must not claim to be the one global
  recommendation.
- Every selectable setup control must change the resulting run or be visibly unavailable before
  selection.
- Every visible pixel must earn its place through meaning, hierarchy, feedback, navigation, or
  accessibility; diagnostic metadata stays available to maintainers without competing with the
  learner's question.
- Default question content to one surface. Do not add a nested card unless it marks a control,
  feedback/state change, navigation boundary, or materially separate interaction.
- Ari advances only when progress is awarded.
- Strong, Developing, Needs practice, and Not started states must remain distinguishable without
  color or motion.
- Procedural-engine correctness, grading, spaced repetition, persona detection, and subject rules
  remain governed by `PROMPT.md`. The active authored T6 bank instead follows the owner direction,
  `briefs/T6_REVISION_FALLBACK.md`, and the indexed `graph_source/` lecture sources.
- Cosmetics may not alter learning power. A power-up must declare its learning effect, result
  labeling, persistence, and dashboard treatment before implementation.
- Persona and rank displays must obey the evidence thresholds and language restrictions in
  `PROMPT.md`.
- Test profiles and scenario loaders must be separate from `state/` and `history/`.

## Conventions

- Current explicit owner direction wins over project files. Record durable decisions in the
  relevant brief and `DESIGN_SOURCE_INDEX.md`.
- `PROMPT.md` is current procedural-engine authority; the T6 fallback's authored questions follow
  its indexed pack and brief. `REVIEW_LOG.md` and `personalities.md` are rationale and history.
- `mock/` shows implemented behavior, not intended behavior.
- Do not edit `graphs/`, `state/`, or `history/` during UI testing unless the task explicitly
  authorizes engine/data changes and a backup-safe plan exists.
- Do not call an asset production-ready without the acceptance gate in
  `ART_DIRECTION_SYSTEM.md`.
- Do not claim browser verification from HTML/CSS/JS inspection.
- Preserve user changes and unrelated files. Avoid destructive source-control or filesystem
  operations unless explicitly requested.
- Run the smallest relevant verification after each coherent change. Current baseline checks:
  - JavaScript syntax: `node --check mock/rogue.js`
  - T6 JavaScript syntax: `node --check mock/t6.js`,
    `node --check mock/sets/t6_brgsa.js`, `node --check mock/sets/t6_catalog.js`, and
    `node --check mock/sets/t6_challenges.js`
  - T6 bank: `node mock/validate_t6_bank.js "<Term 6 AI-Ready Pack>"`
  - Python server syntax on macOS: `python3 -m py_compile mock/server.py`
  - Local server on macOS: `python3 mock/server.py 8099`
  - UI acceptance: declared scenarios in a real Browser; Computer Use for Windows-level flows.
- A bug hit during build/debugging is logged in `BUG-LAWS.md` before close-out.
- A change to a tracked quality axis is logged in `QUALITY-LOG.md` before close-out.

## Session Hygiene

### Open

1. Read `AGENTS.md`.
2. Read `DESIGN_SOURCE_INDEX.md` for product/design work.
3. Skim the relevant ledgers.
4. Check Known Gaps and gates.
5. State the evidence required to advance the task's status.

### Close — Required After Any Workspace Change

1. Rewrite the Current Status paragraph.
2. Update touched Key Files descriptions and Verified dates.
3. Fix Directory Map and Known Gaps.
4. Add a newest-first `CHANGELOG.md` entry with evidence paths.
5. Grade and log bugs in `BUG-LAWS.md`.
6. Log tracked quality changes in `QUALITY-LOG.md`.
7. Verify all changed references and record evidence.
8. Never end with a document contradiction you already know about.

## Known Gaps

- [ ] `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`: no same-course final exists to supply an exact
  blueprint. This is a standing claim boundary, not a work-blocking gate. Practise the documented
  assessment envelope; do not claim exact sections, duration, marks, options, negative marking,
  likely score, or pass probability. The first real final can inform later cohorts.
- [ ] `WAITING_OWNER_CONTENT_ACCEPTANCE`: all 728 questions are source-traceable and structurally
  verified, but transcript-derived content and the 64 constructed-response rubrics/exemplars still
  need owner/faculty acceptance before `DONE`.
- [ ] `WAITING_OWNER_ACCESS_SIGNIN`: exact routing, Access applications, anonymous denial,
  direct-bank denial, static delivery, group authority, and rate limiting are live and edge/API
  verified. The declared Browser resolves the production URL and reached the owner Cloudflare login
  challenge, but its security policy prevents automated completion. The owner must sign in in the
  open tab, then the live Control Room connected/list pass can be verified.
- [ ] `WAITING_OWNER_TESTER_EMAILS`: no tester should receive access until the owner supplies the
  addresses. GitHub and WhatsApp community creation remain staged pending confirmation.
- [ ] The identity-gated client bundle prevents anonymous/casual harvesting but cannot stop an
  approved technical tester from downloading visible bank scripts. Server-side item delivery is
  `UNSTARTED`; do not claim perfect anti-scraping or DRM.
- [ ] Tester agents are `PREPARED_NOT_ACTIVATED`. Backend events, explicit tester consent,
  pseudonymous identity mapping, retention/deletion, owner review queues, notification/access
  adapters, synthetic end-to-end acceptance, and owner activation are all required before any
  registered schedule may be unpaused. Their repository declarations must also be enabled in the
  same reviewed activation change.
- [ ] `WAITING_REAL_BROWSER`: the legacy cinematic/Ari/economy route still has no complete
  real-Browser new-player acceptance. This gate no longer applies to the verified T6 BRGSA route.
- [ ] `WAITING_COMPUTER_USE`: Computer Use instructions are installed, but the control runtime was
  not available in this task. Re-enable its server and skill in the Mac app when desktop-level
  interaction is needed; use built-in Browser first for this web prototype.
- [ ] Legacy production breadth remains deferred in C3 and C7. Current fallback precedence is
  recorded in C11 and `briefs/T6_REVISION_FALLBACK.md`.
- [ ] Deterministic T6 and legacy URL scenarios cover main fixtures, but no checked-in automated
  interaction suite validates all 40 study sets. Add one before broad student release.
- [ ] Sampled confidence cadence, fixed thresholds, practice-shape weights, confidence recovery,
  and any future mastery model remain product hypotheses until real learner data and cognitive
  interviews support calibration.

## Self-Maintenance Rules

- If a file contradicts this index, update the index or record an unresolved conflict before
  continuing.
- New architecturally significant file: add it to Key Files.
- Deleted or renamed file: repair references immediately.
- New directory: add it to Directory Map.
- Resolved gap: remove it in the same session and preserve the story in `CHANGELOG.md`.
- Never leave an entry known to be false.
- After a changed session, update touched file biographies and Verified dates.
- Repeatedly-read non-indexed files should be promoted to Key Files.
- After debugging or a bug during build, update `BUG-LAWS.md`; merge near-duplicates and downgrade,
  supersede, or retire stale Laws when a permanent backstop exists.
- After tracked quality work, update `QUALITY-LOG.md`.
- Ledgers must not make the project timid: use comply paths, run WATCH checks, and preserve
  ambition.

## Metadata

- Generated: 2026-07-16
- Last verified: 2026-08-11 (728-item T6 bank and source IDs, 565 active items, evidence-gated
  progress, sampled optional confidence, boss-step/whole-chain separation, constructed
  self-review, selectable practice shapes, held feedback,
  mixed formats and boss grading, staged dashboard, evidence graph, real-Browser desktop/narrow
  interaction, isolated save/resume, live-state preservation, release-boundary tests, no-index and
  private-cache controls, the desktop owner control room, 20 passing release/access/agent tests,
  the live Cloudflare Worker route, distinct learner/admin Access audiences, anonymous edge denial,
  a least-privilege group secret, and rapid-request rate limiting)
- Confidence: high for file inventory, operating rules, all-subject implementation, structural
  grounding, and observed Browser behavior; medium for transcript-derived content pending
  owner/faculty acceptance; low for exact exam-paper structure
- Budget: keep this file below 32 KiB and preferably below ~4,000 tokens. Move history to
  `CHANGELOG.md` and detail to linked ledgers/briefs.
