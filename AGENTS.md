# Dungeon
> **Diagnosis revision (2026-08-12; newest):** Every distractor a scheduled question can present now
> states the specific gap choosing it reveals. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-12/t6-option-diagnoses/verification.md`: 2,943 diagnoses across the active bank
> with zero generic fallbacks, derived from generator provenance for 92.3% of slots and hand-authored
> in `app/sets/t6_diagnoses.js` for the remaining 78 texts. The wrong-answer panel was rebuilt as
> verdict → what this choice assumed → catch it earlier → what governs this question → the complete
> answer (no longer collapsed) → why it connects. `tools/validate_t6_bank.js` now fails the build when
> a scheduled distractor lacks a diagnosis, so questions drafted later inherit the contract in
> `docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md`. Two defects were repaired: a raw
> `selected-belief:` tag reaching learner copy in the concept inspector (LAW-43) and a per-option
> value indexed by part rather than by option (LAW-44). The authored diagnoses are new content and
> stay `WAITING_OWNER_CONTENT_ACCEPTANCE`. `GET /dungeon/admin/access-check` was added as an
> unauthenticated, secret-free Access self-check for the reported Control Room login loop; it
> diagnoses the loop but does not fix it, since the cause is in Access application configuration.
> **Deployed (2026-08-12):** commit `0cc2c6d` is live as Worker version `c602c4b3` at 100% traffic
> with a 0% error rate, carrying the diagnosis revision and the UI alignment pass below. The earlier
> claim that production served `475837f` was stale: `809fced` deployed as `4e9a3287` roughly an hour
> before this release, so the dynamic homepage, practice builder, matching board, and the enforced
> agreement version have all been live since then and the `WAITING_OWNER_DEPLOY` gate is closed.
> Verify deployment state in Workers → Deployments rather than from this file.
>
> **UI alignment pass (2026-08-12):** `VERIFIED(REAL_BROWSER)` at
> `evidence/2026-08-12/t6-ui-alignment-pass/verification.md`. Irregularity was measured with an
> injected audit probe per screen at 1280×800 and 375×812, not eyeballed. Fixed: the match label
> tray now shares the statements' grid track so every tablet is one width and sits on its slot's
> left edge (was `193/268/191/266`px wrapping 3-then-1, with tablets wider than the 162px slot);
> statements are numbered against lettered labels to give the board a reading order; the mastery key
> is a two-column grid (was four ragged lines); `.subject-actions` is an equal-width grid track (was
> `257`/`187`px stacked); and `brand-home`, `skip-link`, and `label-tablet` reach 44px on mobile.
> Dashboard, primer/MCQ, cloze, match, and feedback report **0 findings at both viewports** with no
> horizontal overflow. Two candidate findings were rejected as probe artifacts (LAW-46). Not
> audited: boss, case-cloze, and constructed-response surfaces (static check only), the results
> screen, `login.html`, and `admin.html`.
>
> **Access login loop fixed at source (2026-08-12):** the Control Room bounce was not in the Worker.
> The `Dungeon Owner Dashboard` Access application accepted only the `- cloudflare` provider with
> `Apply instant authentication` on, and **no Google provider exists on the account**, so Access
> skipped the chooser and redirected into a flow a Google session could never satisfy. With owner
> approval the existing one-time email-code provider was enabled alongside it and instant
> authentication turned off; `Accept all available identity providers` was deliberately left off.
> Owner action outstanding: confirm sign-in on the live domain.
>
> **Open, not yet acted on:** a bank-volume audit found only 32.5% of taught lectures carry any
> question (IBM 20.5%, SCLM 22.5%, SPMS 19%, BRGSA 88%) — 191 of 283 lectures have none. Match
> choices also span 13–179 characters, which layout cannot reconcile; both belong to the bank work.
>
> **Current status (2026-08-11; supersedes older status notes):** The active plain-language Term 6
> dashboard for BRGSA, IBM, SCLM, and SPMS is `VERIFIED` in a real Browser at
> `evidence/2026-08-11/t6-evidence-challenges/verification.md`, with the latest question hierarchy,
> neutral unanswered-state, and scoped subject-action refinement verified at
> `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`. Applied questions use one
> aligned warm-white surface: hierarchy, spacing, and restrained dividers connect the case, task,
> and response steps; only controls and feedback introduce nested boundaries. It carries an
> evidence-over-time graph with one module visible at a time, confidence-aware and inspectable
> four-state progress, weak-first varied re-attempts, and a
> 792-surface source-traceable bank: 728 scored challenges plus 64 support-only primers. Active
> scheduling has 565 scored items after excluding 163 older MCQs
> whose answer length could cue correctness; every concept retains at least eleven active surfaces,
> five formats, seven independent families, and module boss coverage. Case, cloze, match, MCQ,
> short-answer, and three-step boss paths are responsive and keyboard-operable, with local
> save/resume/reset. Time-horizon plans distinguish
> same-day current evidence from delayed retrieval. The report-backed confidence, boss-step,
> constructed-response, priority, and practice-path revision is verified at
> `evidence/2026-08-11/t6-research-integration/verification.md`; the privacy-scoped release boundary
> remains verified at `evidence/2026-08-11/tester-launch/verification.md`.
> The adaptive-primer revision is `VERIFIED(LIVE_EDGE + REAL_BROWSER + AUTOMATED + REMOTE_D1)` at
> `evidence/2026-08-11/t6-adaptive-primer-community/verification.md`: a one-click run introduces
> only the next new concept, the support fades after easy or harder success, misses restore applied
> and misconception layers, and primers never create mastery evidence. A dynamic homepage,
> mix-and-match practice builder, enforced agreement version, and matching board are
> `VERIFIED(REAL_BROWSER + AUTOMATED)` at `evidence/2026-08-11/t6-dynamic-homepage/verification.md`
> and `WAITING_OWNER_DEPLOY`. Subjects sit at the top as a fast switcher; the hero pairs the
> subject-local next action with a live evidence trendline and a computed momentum sentence; the
> header shows a Term 6 sparkline instead of a `0 of 64` counter; an inline builder configures
> shape/focus/length/feedback with every unusable option disabled and explained; a factual
> distance-travelled strip, the mastery matrix, Term 6 totals, and the staged panels form one
> continuous scroll. Long-form matching uses a resizable board: statements side by side, one slot
> each, and a docked tray of label tablets placed by click, drag, or keyboard. Production version
> `98f1bb5b-e5f5-4f08-9340-e102dc79be50` still serves commit `475837f`, so the live site does not yet
> show this revision. Every tester-visible change ships with a change announcement; the format is in
> `docs/community/COMMUNITY_PLAYBOOK.md`.
> Student-facing game/proprietary vocabulary and diagnostic question metadata are removed from the
> learning view. Sixty-four constructed-response surfaces use transparent self-review without
> automatic correctness or Strong credit. Exact final-paper structure is
> `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`: it is an explicit claim boundary, not a prerequisite this
> cohort can wait for. Owner/faculty content acceptance remains open, so the route is not
> `DONE` or an exam-score prediction. The privacy-scoped release wrapper, worker health route,
> security/no-index/private-cache headers, release tests, owner control room, and community
> operating documents are verified at
> `evidence/2026-08-11/tester-access-admin/verification.md`; the owner-JWT-verified Cloudflare group
> controller at `evidence/2026-08-11/tester-dashboard-access-management/verification.md`. Exact
> `https://aneeketdas.com/dungeon/` routing, direct Worker static assets, the more-specific owner
> admin application, anonymous learner/bank/admin denial, the least-privilege group secret, and
> rapid-request rate limiting are `VERIFIED(CLOUDFLARE_API + ANONYMOUS_EDGE)` at
> `evidence/2026-08-11/cloudflare-protected-domain/verification.md`. The private Sites version 5
> remains an owner-only backup and is no longer an origin dependency. The owner Control Room is
> `VERIFIED(BROWSER)` on the exact domain: health is Healthy, Access is Connected, and the release
> is Allowlisted. The Control Room allowlist is the
> only admission check: an approved email enters immediately with an opaque server-side session, an
> unapproved email receives one fixed private `Ask Aneeket to add you in.` denial that never
> discloses the allowlist, and a first approved login is held at a one-time agreement step that
> records version, acceptance time, and minimal WhatsApp invite-open/join-acknowledgement/reminder
> timestamps. Progress is stored per email in Cloudflare D1 with the
> browser copy kept as an offline fallback. One active browser per email is enforced, and a country
> change locks the account for owner review. Onboarding also requires joining the private WhatsApp
> tester group; the invite is disclosed only after approved-email admission, the join tick stays
> disabled until the invite opens, and membership then remains an explicit self-attestation because
> WhatsApp exposes no membership proof to the page. Admission, denial, the agreement gate, and the
> 390-pixel agreement layout are
> `VERIFIED(LIVE_EDGE + REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-11/learner-backend-and-agreement/verification.md`. The Control Room adds cohort
> paste-onboarding, a `Clear lock` recovery that forgives a country lock without deleting progress,
> per-tester state chips, two panels computed from real saved progress (Participation and Where
> testers struggle), and per-person or bulk `Bump` actions for missing group acknowledgements; a bump
> records an in-app reminder and copies a firm manual message, but never claims to send it or
> removes access automatically. D1 migration `0004_community_acknowledgement.sql` is applied, and the
> full live onboarding path has been exercised end to end with a temporary address.
> `aneeketBTN/Dungeon` (private) is connected to Workers Builds, so a push to `main` builds and
> deploys. The first external cohort is active with eight approved tester addresses at the latest
> Control Room read; that read also showed six testers holding the superseded agreement version,
> which the enforcement fix above addresses. GitHub and the private
> WhatsApp tester group are active. The Learning Signal Auditor, Question Bank Steward, and Tester
> Cohort Steward are `PREPARED_NOT_ACTIVATED`: schedules registered and verified `PAUSED`,
> repository declarations disabled, activation preflight intentionally failing, no run history, and
> no tester data touched. Evidence:
> `evidence/2026-08-11/tester-agent-readiness/verification.md`. The earlier
> cinematic/Ari/economy product slice remains at `legacy/rogue/rogue.html` as an `IMPLEMENTED` legacy
> reference and still lacks complete real-Browser route acceptance.
>
> Static HTML/CSS/JavaScript prototypes in `app/`; procedural learning engine and state in root
> JSON/Markdown structures; a shared learner backend in Cloudflare D1; current phase: observe the
> active cohort without over-reading small samples,
> continue owner/faculty content acceptance, and calibrate the learning model from genuine use.

## Start Here — Required Order

1. Read this file top-to-bottom.
2. Read `docs/governance/DESIGN_SOURCE_INDEX.md` before product, art, UX, learning, or gameplay decisions.
3. Skim `docs/governance/BUG-LAWS.md` before implementing or changing anything.
4. If the task affects UI, art, motion, accessibility, learning integrity, persistence, or
   performance, skim `docs/governance/QUALITY-LOG.md`.
5. Check Known Gaps and active `WAITING_*` gates before beginning dependent work.

## Ledgers — Read Before Implementing

`docs/governance/BUG-LAWS.md` is a living, tiered decision aid, not a veto list:

- 🔴 **REDLINE**: a severe demonstrated failure. Follow its comply path.
- 🟡 **WATCH**: a recurring or credible gotcha. Run its verification check.

REDLINEs constrain HOW, never WHETHER. If a Law blocks a good idea, revise the Law and preserve
the safety property.

`docs/governance/QUALITY-LOG.md` owns the costly quality axes: truthful interaction, learning integrity,
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
  `docs/governance/CHANGELOG.md`, and relevant ledger in the same session.
- DONE means all named acceptance sources passed, not merely that code was written.

## Directory Map

- `/` — operating index, design contracts, learning engine, project documentation, and ledgers.
  Root Markdown files are hand-maintained unless explicitly marked generated; `README.md` now
  launches the active T6 fallback and preserves the older engine as a legacy path.
- `docs/briefs/` — owner-supplied briefs and durable implementation mappings. Add each new external
  brief here or index its connected-source location in `docs/governance/DESIGN_SOURCE_INDEX.md`.
- `app/` — active T6 revision route, legacy static prototypes, content sets, and local server.
- `.openai/` — Sites project binding; contains no runtime secrets.
- `.agents/` — paused tester-agent charters, consent-safe data contracts, synthetic fixtures, and
  fail-closed activation gates; three project schedules are registered `PAUSED` and none is
  running.
- `tools/` — deterministic public-release build scripts.
- `site/` — production worker entrypoint, health route, and response security policy.
- `cloudflare/` — deployed exact-path static edge, approved-email learner sessions, the agreement
  gate, signed owner Access validation, owner-only tester allowlist controller, applied D1
  migrations, standalone packaging fallback, and non-source runtime secrets.
- `db/` — the current shared learner-backend table shapes as one readable reference; the applied
  change history lives in `cloudflare/migrations/`.
- `tests/` — release-boundary, routing, access-management, and security-header checks.
- `data/graphs/` — generated subject concept graphs. Do not hand-edit during product/UI work.
- `data/state/` — live game and learner state. Treat as real player data; do not clear for testing.
- `data/history/` — real question and flag history. Do not repurpose as test fixtures.
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
| `docs/governance/DESIGN_SOURCE_INDEX.md` | Authority order, brief inventory, and unresolved product conflicts. | 2026-08-11 |
| `docs/briefs/PROJECT_OPERATING_SYSTEM.md` | Durable requirements and Codex adaptation of the owner-supplied admin-system brief. | 2026-07-16 |
| `docs/briefs/T6_REVISION_FALLBACK.md` | Active dashboard, adaptive-primer, source-boundary, mastery/repetition, and acceptance contract. | 2026-08-11 |
| `docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` | Confidence, evidence-state, adaptive-primer, boss, mixed-format, rotation, and retest contract. | 2026-08-11 |
| `docs/briefs/T6_RESEARCH_REVIEW_IMPLEMENTATION.md` | Owner-supplied first-cohort research review mapped to confidence, construction, practice-shape, accessibility, and evidence decisions. | 2026-08-11 |
| `docs/briefs/TESTER_ACCESS_AND_ADMIN.md` | Admission, private group-invite disclosure, community acknowledgements/bumps, owner operations, and remaining boundaries. | 2026-08-11 |
| `docs/governance/BUG-LAWS.md` | Living REDLINE/WATCH bug-prevention rules and exact comply/verify paths. | 2026-08-11 |
| `docs/governance/QUALITY-LOG.md` | Experience-quality practices, issue/cause/fix history, and watch items. | 2026-08-11 |
| `docs/governance/CHANGELOG.md` | Newest-first, append-only history of sessions that changed the workspace. | 2026-08-11 |
| `docs/design/ART_DIRECTION.md` | Creative thesis and canonical world/art identity. | 2026-07-16 |
| `docs/design/ART_DIRECTION_SYSTEM.md` | Proposed product-wide art, UI, character, asset, and motion system. | 2026-07-16 |
| `docs/design/GAME_UX_LOOP.md` | Proposed broad-product player flow; retained as legacy direction while the T6 fallback owns the active exam-season path. | 2026-08-10 |
| `docs/ops/MAC_TRANSFER.md` | Mac copy, active T6 launch, current challenge-bank files, browser-storage boundaries, state preservation, and verification handoff. | 2026-08-11 |
| `docs/engine/PROMPT.md` | Current procedural learning engine, subject rules, scheduling, personas, ranks, and save contracts. | 2026-07-16 |
| `docs/engine/REVIEW_LOG.md` | Historical engineering rationale for the learning engine. | 2026-07-16 |
| `docs/design/personalities.md` | Historical reinforcement/persona design brief; `docs/engine/PROMPT.md` wins when implemented behavior differs. | 2026-07-16 |
| `README.md` | Student-facing active T6 launch, loop, exam-pattern boundary, progress isolation, scenarios, and legacy paths. | 2026-08-11 |
| `docs/community/TESTER_GUIDE.md` | Controlled-cohort entry, primer expectations, group participation, structured feedback, and known limits. | 2026-08-11 |
| `docs/community/PRIVACY.md` | Tester-facing D1/browser data, community timestamps, location security, retention, and telemetry boundary. | 2026-08-11 |
| `SECURITY.md` | Private vulnerability-reporting and release-safety policy. | 2026-08-11 |
| `docs/community/COMMUNITY_PLAYBOOK.md` | WhatsApp structure, join/bump protocol, human removal review, the required change-announcement format, and feedback triage. | 2026-08-11 |
| `.openai/hosting.json` | Opaque Sites project binding only; runtime credentials never belong here. | 2026-08-11 |
| `.agents/README.md` | Paused tester-agent control plane, authority boundary, and activation order. | 2026-08-11 |
| `.agents/deployment.json` | Fail-closed activation gates, paused automation IDs, models, cadence, and non-running declarations. | 2026-08-11 |
| `package.json` | Dependency-free release build, validation, and test commands. | 2026-08-11 |
| `tools/build-site.mjs` | Allowlists ten learner/admin/protection assets and produces the deployment artifact. | 2026-08-11 |
| `tools/validate-agent-readiness.mjs` | Validates paused charters, synthetic consented events, forbidden fields, and activation blockers. | 2026-08-11 |
| `sites-backup/worker.mjs` | Production learner/admin redirects, health response, static delivery, no-index/security headers, and private-cache policy. | 2026-08-11 |
| `cloudflare/src/index.mjs` | Exact-path router, admission/sessions, agreement/community state, D1 progress, signed owner Access, and tester management. | 2026-08-11 |
| `cloudflare/migrations/` | Applied D1 history for auth/progress, browser/country locks, agreement acceptance, and community timestamps. | 2026-08-11 |
| `db/schema.ts` | Readable mirror of tester, session, progress, agreement, and community-state table shapes. | 2026-08-11 |
| `app/login.html` | Approved-email entry and the one-time agreement/group step with private invite placeholder and two acknowledgements. | 2026-08-11 |
| `app/login.css` | Login and agreement presentation, the `[hidden]` guard required by LAW-36, and the narrow-viewport layout. | 2026-08-11 |
| `app/login.js` | Admission, approved-only invite binding, open-before-join gate, agreement submission, and recovery. | 2026-08-11 |
| `docs/community/DUNGEON_CLOSED_TESTER_AGREEMENT.md` | Closed-test agreement source with group participation, reminder, and owner-reviewed removal terms. | 2026-08-11 |
| `work/build_tester_agreement.py` | Builds the verified two-page agreement DOCX for Word/PDF delivery. | 2026-08-11 |
| `cloudflare/tools/build-standalone.mjs` | Embeds the allowlisted release and bundles the Worker for authenticated API deployment fallback. | 2026-08-11 |
| `cloudflare/wrangler.jsonc` | Deployed Worker asset binding, exact domain route, Access identifiers, and observability configuration; no secret values. | 2026-08-11 |
| `cloudflare/README.md` | Live route, runtime-secret, Access-policy, owner-bootstrap, and rate-limit contract. | 2026-08-11 |
| `cloudflare/tools/build-standalone.mjs` | Builds the same protected allowlist as an embedded-asset fallback when an Assets upload path is unavailable. | 2026-08-11 |
| `tests/site-release.test.mjs` | Release-boundary, anonymous-invite secrecy, privacy, routing, header, and setup checks. | 2026-08-11 |
| `tests/cloudflare-access.test.mjs` | Owner auth, tester management, agreement/community state, bump, routing, health, and cache checks. | 2026-08-11 |
| `tests/agent-readiness.test.mjs` | Proves the tester-agent scaffold is healthy, privacy-bounded, and not deployable. | 2026-08-11 |
| `app/admin.html` | Owner control room for tester management, per-person/bulk group bumps, release health, and feedback triage. | 2026-08-11 |
| `app/admin.css` | Responsive control-room status/actions, including narrow stacked tester rows. | 2026-08-11 |
| `app/admin.js` | Cohort onboarding, revoke/unlock, community bumps, agreed/older-terms/never-agreed chips, learning signals, and manual copy helpers. | 2026-08-11 |
| `app/t6.html` | Subject rail, trendline hero, inline practice builder, distance-travelled strip, holistic matrix/totals, layered questions, plans, and results. | 2026-08-11 |
| `app/t6.css` | Dynamic homepage, chip builder, matching board, and flat primer/question hierarchy across desktop and narrow layouts. | 2026-08-11 |
| `app/t6.js` | Adaptive primers, evidence-gated mastery, sparkline/momentum copy, builder pool rules, matching board, persistence, and scenarios. | 2026-08-11 |
| `app/sets/t6_brgsa.js` | Original BRGSA ten-set bank with 60 grounded questions. | 2026-08-10 |
| `app/sets/t6_catalog.js` | Four-course catalogue, 64 dashboard concepts, three-perspective surfaces, and 156 IBM/SCLM/SPMS questions. | 2026-08-10 |
| `app/sets/t6_challenges.js` | Mixed-format augmentation, 64 adaptive primers, bosses/constructed responses, 565-item scored pools, and the provenance-derived option-diagnosis pass. | 2026-08-12 |
| `app/sets/t6_diagnoses.js` | 78 authored option diagnoses for distractors with no machine-knowable provenance, plus the authoring rules. | 2026-08-12 |
| `tools/validate_t6_bank.js` | Four-course source/schema, primer, breadth, format, boss, option-shape, scored-pool, and option-diagnosis validator. | 2026-08-12 |
| `legacy/rogue/rogue.html` | Legacy character → Hall → run → failure/results product-flow markup. | 2026-08-10 |
| `legacy/rogue/rogue.js` | Legacy product-slice state transitions, questions, rewards, quest, and outcome behavior. | 2026-08-10 |
| `legacy/rogue/rogue.css` | Legacy product-slice responsive presentation, feedback states, and animation behavior. | 2026-08-10 |
| `tools/server.py` | Portable local static/media server; `/` now opens the active T6 route; legacy leaderboard API remains. | 2026-08-10 |
| `tools/start-mac.sh` | Dependency-free macOS launcher for the local prototype server. | 2026-07-16 |
| `tools/serve-tunnel.cmd` | Fail-closed Windows launcher for the server and an explicitly installed LocalTunnel 2.0.2 CLI. | 2026-08-04 |
| `evidence/README.md` | Evidence naming, acceptance-source hierarchy, and artifact requirements. | 2026-07-16 |
| `coordination/CHARTER.md` | Owner/agent/tool authority and delivery protocol. | 2026-07-16 |

## Design System and Domain Rules

- Read and follow the authority order in `docs/governance/DESIGN_SOURCE_INDEX.md`; never reconcile conflicts
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
  remain governed by `docs/engine/PROMPT.md`. The active authored T6 bank instead follows the owner direction,
  `docs/briefs/T6_REVISION_FALLBACK.md`, and the indexed `graph_source/` lecture sources.
- Cosmetics may not alter learning power. A power-up must declare its learning effect, result
  labeling, persistence, and dashboard treatment before implementation.
- Persona and rank displays must obey the evidence thresholds and language restrictions in
  `docs/engine/PROMPT.md`.
- Test profiles and scenario loaders must be separate from `data/state/` and `data/history/`.

## Conventions

- Current explicit owner direction wins over project files. Record durable decisions in the
  relevant brief and `docs/governance/DESIGN_SOURCE_INDEX.md`.
- `docs/engine/PROMPT.md` is current procedural-engine authority; the T6 fallback's authored questions follow
  its indexed pack and brief. `docs/engine/REVIEW_LOG.md` and `docs/design/personalities.md` are rationale and history.
- `app/` shows implemented behavior, not intended behavior.
- Do not edit `data/graphs/`, `data/state/`, or `data/history/` during UI testing unless the task explicitly
  authorizes engine/data changes and a backup-safe plan exists.
- Do not call an asset production-ready without the acceptance gate in
  `docs/design/ART_DIRECTION_SYSTEM.md`.
- Do not claim browser verification from HTML/CSS/JS inspection.
- Preserve user changes and unrelated files. Avoid destructive source-control or filesystem
  operations unless explicitly requested.
- Run the smallest relevant verification after each coherent change. Current baseline checks:
  - JavaScript syntax: `node --check legacy/rogue/rogue.js`
  - T6 JavaScript syntax: `node --check app/t6.js`,
    `node --check app/sets/t6_brgsa.js`, `node --check app/sets/t6_catalog.js`, and
    `node --check app/sets/t6_challenges.js`
  - T6 bank: `node tools/validate_t6_bank.js "<Term 6 AI-Ready Pack>"`
  - Python server syntax on macOS: `python3 -m py_compile tools/server.py`
  - Local server on macOS: `python3 tools/server.py 8099`
  - UI acceptance: declared scenarios in a real Browser; Computer Use for Windows-level flows.
- A bug hit during build/debugging is logged in `docs/governance/BUG-LAWS.md` before close-out.
- A change to a tracked quality axis is logged in `docs/governance/QUALITY-LOG.md` before close-out.

## Session Hygiene

### Open

1. Read `AGENTS.md`.
2. Read `docs/governance/DESIGN_SOURCE_INDEX.md` for product/design work.
3. Skim the relevant ledgers.
4. Check Known Gaps and gates.
5. State the evidence required to advance the task's status.

### Close — Required After Any Workspace Change

1. Rewrite the Current Status paragraph.
2. Update touched Key Files descriptions and Verified dates.
3. Fix Directory Map and Known Gaps.
4. Add a newest-first `docs/governance/CHANGELOG.md` entry with evidence paths.
5. Grade and log bugs in `docs/governance/BUG-LAWS.md`.
6. Log tracked quality changes in `docs/governance/QUALITY-LOG.md`.
7. Verify all changed references and record evidence.
8. If the change is visible to testers, draft the change announcement (see below) and hand it to the
   owner ready to paste.
9. Never end with a document contradiction you already know about.

### Change announcements — required for every tester-visible change

Testers are running a live cohort. A change they can see ships with one announcement in the
Announcements group when it reaches production; there are no silent releases. The template, rules,
and paste format live in `docs/community/COMMUNITY_PLAYBOOK.md`. Draft it from two questions:

1. **What changed?** One plain sentence in a learner's words.
2. **What should testers do?** One specific action, not "have a look".

Say plainly when the change asks something of the tester — signing in again, re-accepting the
agreement, or losing a saved position — and never describe practice as exam prediction. Post it
after the version is live, since a push to `main` deploys.

## Known Gaps

- [ ] `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`: no same-course final exists to supply an exact
  blueprint. This is a standing claim boundary, not a work-blocking gate. Do not claim exact
  sections, duration, marks, options, negative marking, likely score, or pass probability.
- [ ] `WAITING_OWNER_CONTENT_ACCEPTANCE`: all 792 surfaces are source-traceable and structurally
  verified, but transcript-derived content, the 64 support-only primers, and the 64 constructed-
  response rubrics/exemplars still need owner/faculty acceptance before `DONE`.
- [ ] Push to `main` now publishes to the live domain through Workers Builds. Do not commit
  work-in-progress to `main` while testers are active; finish a change, then push. A bad version can
  be rolled back from Workers → Deployments.
- [ ] The two Control Room panels read real cohort data. Treat anything under ten first attempts as
  noise and never use accuracy alone for removal.
- [ ] Approved-email admission, the private denial, agreement acceptance, dashboard entry, online
  progress status, sign-out, and revocation are verified end to end on the live domain. Keep the
  agreement version fixed until the terms actually change; a new version intentionally asks every
  tester to accept again.
- [x] `WAITING_OWNER_DEPLOY` — **closed 2026-08-12.** The agreement-version re-check shipped in
  Worker version `4e9a3287`, so the active cohort has already been sent back through the agreement
  step once. Confirm the announcement for that terms change was actually posted; the deploy happened
  before this session and the gate had been recorded as still waiting.
- [ ] Approved-email entry is a binary admission check, not identity proof. Anyone holding an
  approved address can enter as that tester. Country locking is country-level only and can fire on
  legitimate travel, VPNs, mobile networks, or routing; keep it an owner review prompt with a human
  unlock path and never automate a permanent ban from it alone.
- [ ] Send `outputs/Dungeon_Closed_Tester_Agreement.pdf` with any future invitation; the tester also
  accepts the current version in-app at first login. WhatsApp membership is self-attested because the
  web app can only record invite-open and acknowledgement timestamps. Treat current dashboard samples
  as observational, not conclusive, until the per-concept attempt thresholds are met.
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
  recorded in C11 and `docs/briefs/T6_REVISION_FALLBACK.md`.
- [ ] Deterministic T6 and legacy URL scenarios cover main fixtures, but no checked-in automated
  interaction suite validates all 40 study sets. Add one before broad student release.
- [ ] Builder practice stays inside one subject. A single run mixing subjects needs a course id on
  every queue item and is `UNSTARTED`; do not imply mixed-subject practice in copy until it exists.
- [ ] Primer fade/recovery thresholds, the Connections matrix axis, sampled confidence cadence,
  fixed thresholds, practice-shape weights, confidence recovery, and any future mastery model
  remain product hypotheses until real learner data and cognitive interviews support calibration.

## Self-Maintenance Rules

- If a file contradicts this index, update the index or record an unresolved conflict before
  continuing.
- New architecturally significant file: add it to Key Files.
- Deleted or renamed file: repair references immediately.
- New directory: add it to Directory Map.
- Resolved gap: remove it in the same session and preserve the story in `docs/governance/CHANGELOG.md`.
- Never leave an entry known to be false.
- After a changed session, update touched file biographies and Verified dates.
- Repeatedly-read non-indexed files should be promoted to Key Files.
- After debugging or a bug during build, update `docs/governance/BUG-LAWS.md`; merge near-duplicates and downgrade,
  supersede, or retire stale Laws when a permanent backstop exists.
- After tracked quality work, update `docs/governance/QUALITY-LOG.md`.
- Ledgers must not make the project timid: use comply paths, run WATCH checks, and preserve
  ambition.

## Metadata

- Generated: 2026-07-16
- Last verified: 2026-08-11 (792 source-traceable T6 surfaces, 64 adaptive primers, 565 active
  scored items, evidence-gated progress, sampled optional confidence, boss-step/whole-chain
  separation, constructed self-review, held feedback, mixed formats and boss grading, the dynamic
  homepage with its trendline hero and mix-and-match builder, the matching board, real-Browser
  desktop/390-pixel interaction, isolated save/resume, live-state preservation, 33 passing
  release/access/agent tests, the live Cloudflare Worker route, the owner admin Access audience,
  anonymous edge denial, rapid-request rate limiting, approved-email admission with its private
  denial, the agreement gate now enforced on every authenticated request, per-email D1 progress,
  single-browser and country locks, approved-only group-invite disclosure, community timestamps,
  and the verified two-page tester agreement document)
- Confidence: high for file inventory, operating rules, all-subject implementation, structural
  grounding, and observed Browser behavior; medium for transcript-derived content pending
  owner/faculty acceptance; low for exact exam-paper structure
- Budget: keep this file below 32 KiB and preferably below ~4,000 tokens. Move history to
  `docs/governance/CHANGELOG.md` and detail to linked ledgers/briefs.
