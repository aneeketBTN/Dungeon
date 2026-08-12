# Dungeon
> **Teaching layer — the 0→80 path (2026-08-12; newest):** The app could measure a learner but could
> not teach one, so it only served people who had already studied the course.
> `VERIFIED(REAL_BROWSER + AUTOMATED)` at `evidence/2026-08-12/t6-teaching-layer/verification.md`.
> The bank generates ~12.8 surfaces per concept by recombining four harvested sentences, so first
> contact with every idea was a scored item in vocabulary nothing had introduced: a case question's
> own primer supplied **19%** of that case's words on average and **none** in 10 of 64 cases; **59 of
> 64** case questions had zero same-concept distractors, making them answerable by topic-matching and
> unanswerable by reasoning; nine explained a different lecture than they tested; and one shipped
> correct answer used "stopping rule", a phrase appearing **0 times** in 50 BRGSA transcripts. The
> teaching material already existed and was ~2% used — the external pack holds 92,489 dense words for
> BRGSA alone. Added `app/sets/t6_lessons.js` (authored lecture-grain lessons: objective, explainer,
> worked example with the course's real numbers, glossary, handoff) and `tools/build_t6_lessons.mjs`
> (candidate extraction). **Teach-before-test is now a scheduling invariant** in `layeredQueue()`:
> a lecture's lesson precedes the first scored question citing it, ahead of the primer, unscored and
> creating no evidence (LAW-47). `relevantWrong()` restored reasoning to applied questions — 0 of 64
> now have zero same-concept distractors, all 64 carry at least two, and the option-shape guard still
> passes (LAW-48). Case questions cite and explain the lecture their case came from. A vocabulary
> gate measures first use against the clean lecture transcripts, not the concept index, which is
> unreliable for this (LAW-49); it caught three real authoring errors during the session.
> **All four subjects are now complete for every lecture a learner can actually reach**
> (`evidence/2026-08-12/t6-teaching-layer-complete/verification.md`). 106 lessons are authored:
> BRGSA 50 of 50 lectures; IBM, SCLM, and SPMS each 16 of 16 *cited* lectures. Each
> lesson is authored from its own lecture's transcript and carries that lecture's real figures; every
> number and framework was grepped against the source before it was written down. The originating
> defect is closed with it: `sample_logic`'s correct answer no longer says "stopping rule" or "sample
> bound" but *"Run the test to completion at the pre-calculated sample size"*, the lecture's own
> phrasing, which also cleared a length cue that had been excluding the question.
> **724 of 724 scheduled questions are fully taught** — BRGSA 187, IBM 177, SCLM 180, SPMS 180.
> `VERIFIED(REAL_BROWSER)`: LAW-47 checked from an empty `lessonsRead` across all 9 study sets in
> every subject plus the mixed builder — 595 queue items, zero violations. Run the gates rather than
> quoting these counts from this file. 54 IBM, 55 SCLM, and 68 SPMS lectures remain unauthored, but
> no question cites them, so they would never be delivered; coverage is complete for what a learner
> can reach, not for the whole course. All lesson prose is new and stays
> `WAITING_OWNER_CONTENT_ACCEPTANCE`. No screenshots — the Browser pane was not compositing — so
> pixel-level acceptance is still owed. **Partly deployed (2026-08-12):** PR #1 merged
> `reorg/structure` commit `3c69d1e` into `main` at 11:20 IST, which carries the workspace
> restructure and the first 80 lessons (BRGSA and IBM complete) to the live cohort through Workers
> Builds. The SCLM and SPMS lessons landed after that merge and are **not** on `main`, so testers
> currently get teaching on BRGSA and IBM only. This is a tester-visible change and **owes a change
> announcement** — see Session Hygiene. Confirm the deployed version in Workers → Deployments rather
> than from this file.
>
> **Workspace restructure (2026-08-12):** The repository was reorganized for collaboration
> in seven verified phases on branch `reorg/structure`, with no behaviour change intended and none
> observed. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-12/workspace-restructure/verification.md`. The live app is now `app/` and holds
> exactly the files the build ships (fourteen at the time of the restructure, fifteen since the
> teaching layer was added above); `legacy/` holds the rogue slice and older prototypes;
> `tools/` holds every build and dev script; `data/` holds live learner state; `docs/` holds all
> documentation; and `site/` became `sites-backup/` because it is the private Sites entrypoint, not
> the deployed Worker. `cloudflare/` did not move: Workers Builds deploys from that path using a
> dashboard-side root-directory setting. Public URLs are unchanged and the legacy `/dungeon/mock/...`
> bookmark aliases still resolve. `dist/client` is byte-identical to the pre-reorg golden snapshot
> with only its URL prefix renamed. Two latent hazards were fixed in passing: `core.autocrlf=true`
> was rewriting LF working-tree files to CRLF, which would have changed deployed asset bytes, and
> the path-anchored ignore rules stopped matching once their directory moved. `evidence/`,
> `_TRANSFER/`, and older `CHANGELOG.md` entries are deliberately frozen rather than path-rewritten.
> Nothing is pushed or deployed; the live cohort is untouched until the branch is merged.
>
> **Diagnosis revision (2026-08-12):** Every distractor a scheduled question can present now
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
> each, and a docked tray of label tablets placed by click, drag, or keyboard. (This paragraph used to
> claim production still served commit `475837f`; that was stale and is corrected in the
> **Deployed (2026-08-12)** note above — `0cc2c6d` is live as Worker version `c602c4b3`, so this
> revision has shipped.) Every tester-visible change ships with a change announcement; the format is in
> `docs/community/COMMUNITY_PLAYBOOK.md`.
> Student-facing game/proprietary vocabulary and diagnostic question metadata are removed from the
> learning view. Sixty-four constructed-response surfaces use transparent self-review without
> automatic correctness or Strong credit. Exact final-paper structure is **known as of 2026-08-12**
> and recorded in `docs/briefs/T6_EXAM_PATTERN.md`, which closed
> `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`; structure may be stated as fact, but question content,
> difficulty, topic weighting, a likely score, and pass probability remain unclaimable. Owner/faculty
> content acceptance remains open, so the route is not `DONE` or an exam-score prediction. The privacy-scoped release wrapper, worker health route,
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

## Collaborators — Read Before Your First Push

**`main` is the deploy trigger.** `aneeketBTN/Dungeon` is connected to Cloudflare Workers Builds, so
a push to `main` builds and publishes to the live domain, where a real tester cohort is active. There
is no staging step between the two. Work on a branch, open a pull request, and let the owner merge.
Never push or merge to `main` yourself. A bad version is rollback-able from Workers → Deployments,
but the testers will have seen it.

**Clone and run — no install step, no credentials.** These work immediately after cloning:

```text
npm test                     # 35 release-boundary, routing, access, and header checks
node tools/build-site.mjs    # produces the deployment artifact in dist/client
python tools/server.py 8099  # local dev server; open http://localhost:8099/
```

**The content gates need the external lecture transcripts, which are not in the repo and cannot be.**
`tools/validate_t6_bank.js`, `tools/check_lesson_file.mjs`, and `tools/build_t6_lessons.mjs` each
take the transcript root as their first argument (see Directory Map for the layout). **Mind the
failure mode:** given a *wrong* path the bank validator reports `ok: false` / `Missing lecture
source`, but given *no argument at all* it returns `ok: true` with an empty `"coverage": {}` — it has
silently skipped every lecture check, including the entire LAW-49 vocabulary gate. A green run with
an empty coverage block means nothing was verified, not that everything passed. Always pass the path,
and ask the owner for a copy of the transcripts before taking any bank or lesson-authoring task.
Everything else in the repo is self-contained.

**Live learner data is deliberately absent.** `data/state/`, `data/history/`, `work/`, `outputs/`,
and the tester CLAs are ignored by git and stay on the owner's machine. Do not add fixtures under
those paths, and do not treat an empty `data/state/` as a bug.

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

Root holds only what tools and GitHub discover by convention: `AGENTS.md`, `CLAUDE.md`,
`README.md`, `SECURITY.md`, `package.json`, `.gitignore`, and `.gitattributes`. Everything else
lives under a named directory.

**What ships to learners**

- `app/` — the live T6 route and nothing else: exactly the fifteen files in the build allowlist.
  A file here reaches production. If it should not, it does not belong in this directory.
- `tools/` — release build, bank validator, lesson-file check, lesson candidate extractor,
  agent-readiness check, and the local dev server and launchers. Nothing executable lives in `app/`.
  `tools/browser-checks/` holds checks that must run **in the page** rather than in Node, because the
  property under test belongs to the running app — evaluate the file's contents in the browser.
  `tools/lib/` holds code shared between tools; anything that reads the external lecture source goes
  through `tools/lib/clean_transcripts.js` so the three gates cannot disagree about what a lecture is.
- `cloudflare/` — the **deployed** Worker: exact-path router, approved-email learner sessions, the
  agreement gate, signed owner Access validation, tester allowlist controller, applied D1
  migrations, and standalone packaging fallback. Workers Builds deploys from this path; its root
  directory is configured in the Cloudflare dashboard, so **do not move this directory** without
  changing that setting first.
- `sites-backup/` — the private Sites entrypoint. **Not** the deployed Worker, and diverged from it;
  read `sites-backup/README.md` before treating it as a fallback.
- `db/` — readable mirror of the learner-backend tables; applied history is `cloudflare/migrations/`.
- `tests/` — release-boundary, routing, access-management, and security-header checks.

**Documentation**

- `docs/governance/` — ledgers and authority: `DESIGN_SOURCE_INDEX.md`, `BUG-LAWS.md`,
  `QUALITY-LOG.md`, `CHANGELOG.md`.
- `docs/briefs/` — owner-supplied briefs and durable implementation mappings. Add each new external
  brief here or index its connected-source location in `docs/governance/DESIGN_SOURCE_INDEX.md`.
- `docs/authoring/` — repeatable content-production procedures. `LESSON-AUTHORING-PROTOCOL.md` is the
  handoff for the 0→80 teaching layer: source material, the lesson contract, the batch procedure, the
  gates, the traps already paid for, and the definition of done per subject. **Read it before
  authoring any lesson**, including when resuming mid-subject.
- `docs/engine/` — `PROMPT.md` (procedural-engine authority) and `REVIEW_LOG.md` (rationale).
- `docs/design/` — art direction, the proposed product-wide system, the legacy UX loop, personas.
- `docs/community/` — tester guide, community playbook, privacy, and the closed-test agreement.
- `docs/ops/` — machine transfer and local launch notes.

**Data, evidence, and history — treat as records, not working files**

- `data/state/` — live game and learner state. Real player data; do not clear for testing.
- `data/history/` — real question and flag history. Do not repurpose as test fixtures.
- `data/graphs/` — generated subject concept graphs. Do not hand-edit during product/UI work.
- `evidence/` — named acceptance evidence by date/task. **Frozen**: entries describe what was true
  on their date, so their paths are not rewritten when directories move.
- `legacy/` — `rogue/` (the cinematic slice), `prototypes/` (older subject pages and their sets),
  and the untracked `CLAs/` source material. Reference only; nothing here ships.

**Working material and control planes**

- `outputs/` — rendered/candidate media and separated production assets.
- `work/` — source research, animation frames, scripts, and intermediate art outputs. `work/t6_lessons/`
  holds generated lesson candidates from the Term 6 pack; they are an authoring aid, not shipped content.
- `.agents/` — paused tester-agent charters, consent-safe data contracts, synthetic fixtures, and
  fail-closed activation gates; three project schedules are registered `PAUSED` and none is running.
- `.claude/` — Claude-specific configuration and the state-manager agent.
- `.openai/` — Sites project binding; contains no runtime secrets.
- `coordination/` — authority charter and append-only agent/tool exchange notes.
- `_TRANSFER/` — historical transfer/setup memory; not current product authority, and frozen for
  the same reason as `evidence/`.

The Term 6 lecture source is **external** — not part of this repository, and not distributable
through it. The authority is the clean transcripts:

`C:\Users\knigh\OneDrive\Desktop\exam\Term 6 Clean Transcripts`

laid out as `<root>/<SUBJECT>/<SUBJECT>_M<NN>_SUM_TRANSCRIPT.txt`: one file per module, holding its
lectures in teaching order behind `## <code> | <title>` headers. A lecture's identity is its
**position** in that file (the Nth section is `L<N>`), not the recording code in the header — module
2 runs C10, C01, C02 … C12, so the codes are not even monotonic. `tools/lib/clean_transcripts.js` is
the loader; `tools/validate_t6_bank.js` and `tools/check_lesson_file.mjs` go through it and take this
root as their first argument.

**`tools/build_t6_lessons.mjs` is the exception and still requires the old pack.** It reads
`graph/LECTURE_MANIFEST.jsonl` and the `dense/` layer directly and has not been migrated to the
loader, so it must be given the AI-Ready Pack root instead; pointed at the clean transcripts it dies
with `ENOENT ... LECTURE_MANIFEST.jsonl`. It is an authoring aid that writes candidates to
`work/t6_lessons/`, not a gate, so this does not affect verification — but do not assume one path
argument serves all three tools.

The older `Term 6 AI-Ready Pack` (`graph_source/`, `graph/LECTURE_MANIFEST.jsonl`, `dense/`,
`subject_core/`, `indexes/`) is still *readable* so existing invocations do not hard-fail, but it is
**no longer the source of truth**: its dense layer produced lines that are incoherent out of context,
and its concept index is by its own README a retrieval-candidate list rather than course vocabulary.
Authoring against it is precisely what LAW-49 exists to catch. Prefer the clean transcripts.

If a directory grows beyond roughly 20 meaningful files without an index, flag it. Frame sequences
and generated outputs are exempt when their parent has a manifest/contact sheet.

## Key Files

| Path | Controls | Verified |
| --- | --- | --- |
| `AGENTS.md` | Codex living index, status, gates, rituals, source rules, and project conventions. | 2026-08-12 |
| `CLAUDE.md` | Claude compatibility entry; points to this operating index and preserves engine startup facts. | 2026-07-16 |
| `docs/governance/DESIGN_SOURCE_INDEX.md` | Authority order, brief inventory, and unresolved product conflicts. | 2026-08-11 |
| `docs/briefs/PROJECT_OPERATING_SYSTEM.md` | Durable requirements and Codex adaptation of the owner-supplied admin-system brief. | 2026-07-16 |
| `docs/briefs/T6_EXAM_PATTERN.md` | **Authority for paper structure.** Batch 1 sections, counts, marks, negative marking, calculators, and what remains unclaimable. Closed `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`. | 2026-08-12 |
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
| `tools/build-site.mjs` | Allowlists the fifteen learner/admin/protection assets and produces the deployment artifact. | 2026-08-12 |
| `tools/validate-agent-readiness.mjs` | Validates paused charters, synthetic consented events, forbidden fields, and activation blockers. | 2026-08-11 |
| `sites-backup/worker.mjs` | Private Sites backup entrypoint, **not** the deployed Worker: learner/admin redirects, health response, static delivery, and security headers. Diverged from `cloudflare/src/index.mjs` and has no agreement gate. | 2026-08-12 |
| `sites-backup/README.md` | Records why this worker is not production and what must be reconciled before promoting it. | 2026-08-12 |
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
| `app/t6.html` | Subject rail, trendline hero, inline practice builder, distance-travelled strip, holistic matrix/totals, lesson surface, layered questions, in-question glossary, plans, and results. | 2026-08-12 |
| `app/t6.css` | Dynamic homepage, chip builder, matching board, lesson/glossary presentation, and flat primer/question hierarchy across desktop and narrow layouts. | 2026-08-12 |
| `app/t6.js` | Teach-before-test queue invariant, lesson surface and read-state, adaptive primers, evidence-gated mastery, sparkline/momentum copy, builder pool rules, matching board, persistence, and scenarios. | 2026-08-12 |
| `app/sets/t6_brgsa.js` | Original BRGSA ten-set bank with 60 grounded questions. | 2026-08-10 |
| `app/sets/t6_catalog.js` | Four-course catalogue, 64 dashboard concepts, three-perspective surfaces, and 156 IBM/SCLM/SPMS questions. | 2026-08-10 |
| `app/sets/t6_challenges.js` | Mixed-format augmentation, 64 adaptive primers, bosses/constructed responses, 565-item scored pools, relevance-first distractor selection, case-lecture provenance, and the option-diagnosis pass. | 2026-08-12 |
| `app/sets/t6_diagnoses.js` | 78 authored option diagnoses for distractors with no machine-knowable provenance, plus the authoring rules. | 2026-08-12 |
| `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` | Handoff procedure for the teaching layer: sources, lesson contract, batch procedure, gates, the four traps already paid for, and per-subject definition of done. Read before authoring any lesson. | 2026-08-12 |
| `app/sets/t6_lessons.js` | Teaching layer: 106 authored lecture-grain lessons (objective, explainer, worked example, glossary, handoff) that must be delivered before anything about that lecture is scored. All four subjects complete on cited lectures; 724 of 724 scheduled questions taught. | 2026-08-12 |
| `tools/lib/clean_transcripts.js` | The one loader for the external lecture source. Reads the clean transcripts (position in the module file is a lecture's identity, not its recording code) and still accepts the old AI-Ready Pack layout; `sourceKind` says which was read. | 2026-08-12 |
| `tools/build_t6_lessons.mjs` | Extracts lesson candidates from the external lecture source — objectives, glossary terms with first-use, worked-example lines, provenance — into `work/t6_lessons/`. Extraction only; prose is authored. | 2026-08-12 |
| `tools/check_lesson_file.mjs` | Authoring-time gate: reports every structural defect in one pass (bracket class, record shape, prose limits) and, given the pack, prints the exact next batch of lectures to author. Run between batches, before the bank validator. | 2026-08-12 |
| `tools/browser-checks/teach-before-test.js` | LAW-47 verification, evaluated in the page: walks every study set and the mixed builder from an empty `lessonsRead` and asserts no surface precedes a lecture it cites. Not a Node test — re-implementing `layeredQueue()` would drift from the real scheduler. | 2026-08-12 |
| `tools/validate_t6_bank.js` | Four-course source/schema, primer, breadth, format, boss, option-shape, scored-pool, option-diagnosis, lesson-structure, and transcript-backed vocabulary validator; reports the untaught-question backlog. | 2026-08-12 |
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
  `docs/briefs/T6_REVISION_FALLBACK.md`, and the external clean lecture transcripts (see Directory
  Map); that transcript root is not a directory of this repo and cannot be committed to it.
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
- `app/` shows implemented behavior, not intended behavior — and it is what production serves. Every
  file in it ships. `legacy/` is the reference-only counterpart and ships nothing.
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
    `node --check app/sets/t6_brgsa.js`, `node --check app/sets/t6_catalog.js`,
    `node --check app/sets/t6_challenges.js`, and `node --check app/sets/t6_lessons.js`
  - Lesson candidates: `node tools/build_t6_lessons.mjs "<Term 6 AI-Ready Pack>" [SUBJECT]`
    — the old pack, not the clean transcripts; this tool still reads `graph/LECTURE_MANIFEST.jsonl`.
  - Lesson file, and what to author next: `node tools/check_lesson_file.mjs "<Term 6 Clean Transcripts>"`
    — run this *before* the bank validator; a lesson file that does not parse makes the validator
    report nothing at all.
  - T6 bank: `node tools/validate_t6_bank.js "<Term 6 Clean Transcripts>"`
    — always with the path. `npm run validate:bank` passes **no** argument, so it returns `ok: true`
    with an empty `"coverage": {}` having skipped every lecture check and the LAW-49 vocabulary gate.
    Treat that script as a schema-only check, never as bank verification.
  - Teach-before-test (LAW-47): evaluate `tools/browser-checks/teach-before-test.js` in the page and
    expect `violations: []`. Automated gates do not cover scheduling.
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

- [x] `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` — **closed 2026-08-12.** The owner supplied the Batch 1
  pattern; it is recorded in `docs/briefs/T6_EXAM_PATTERN.md`, which is now authority for paper
  structure. Sections, counts, marks, duration, negative marking, and calculator rules may be stated
  as fact. Still not claimable: question content, difficulty, topic weighting within a section, the
  IBM caselet's subject, a likely score, or a pass probability.
- [ ] **Two required formats do not exist in the app, and they are worth 64 marks.** SPMS Section B
  is 20 negatively marked multiple-select questions (40 marks, **53% of that paper**) and SCLM
  Section B is 6 tolerance-graded numericals (24 marks, 30%). The bank has neither an MSQ nor a
  numeric-entry surface. Building these outranks any further MCQ authoring.
- [ ] **IBM's paper contains no objective questions at all** — ten subjective answers on a caselet
  released two days beforehand. Its 196 MCQ-derived surfaces contribute nothing to it, and authoring
  its 62 uncited lectures would add zero marks. Do not spend bank effort there; the useful work is
  framework fluency and structured written answers against an unseen case.
- [ ] **BRGSA self-containment.** The paper states that no question requires memorising a Clairo or
  Zoko figure. Bank items that test recall of one are training a skill the exam explicitly excludes.
  Teaching with those numbers is fine; testing recall of them is not. The bank has not been audited
  against this.
- [ ] **SCLM is under-weighted on computation.** Section B is 24 marks of numericals with a
  scientific calculator and supplied normal-distribution tables, pointing at safety stock, service
  level, and newsvendor. Only 3 of its 16 cited lectures carry arithmetic today.
- [ ] `WAITING_OWNER_CONTENT_ACCEPTANCE`: all 792 surfaces are source-traceable and structurally
  verified, but transcript-derived content, the 64 support-only primers, the 64 constructed-
  response rubrics/exemplars, and the 106 authored lessons still need owner/faculty acceptance
  before `DONE`. This is now the largest single block of unaccepted content in the product.
- [x] **The 0→80 path reaches every scheduled question — closed 2026-08-12.** 724 of 724 are
  taught, verified in a real browser at
  `evidence/2026-08-12/t6-teaching-layer-complete/verification.md`. What remains is *acceptance*,
  not coverage. Do not quote coverage numbers from this file; run
  `node tools/check_lesson_file.mjs "<transcripts>"`. Note that 177 uncited lectures across IBM,
  SCLM, and SPMS have no lesson and no question citing them — authoring those is optional work that
  moves no coverage, and lessons for them are never delivered.
- [ ] The vocabulary gate cannot match a singular glossary term against a plural-only occurrence:
  it builds `\b<term>\b`, so `public private partnership` was reported absent although
  `public private partnerships` appears three times. It reports this as *invented vocabulary*, which
  is a false accusation rather than a missed check. Use the course's own form; treat that warning as
  a prompt to grep before deleting a term.
- [ ] IBM's option lengths still cue the answer: sorting each question's options by length puts the
  correct one at rank 3 of 4 in **45%** of 68 sampled questions against a 25% baseline, so "pick the
  second-longest" is a working strategy. The validator reports this as a warning, not an error. Vary
  how many distractors run longer than the correct answer rather than lengthening a fixed number.
- [ ] Authored question copy still contains vocabulary the course does not use — "pre-registered
  stopping rule" (0 occurrences in BRGSA; the course says *decision rule*) and "18 visitors per arm"
  on a lecture that says *per variant*. The glossary covers `arm`; the rest is content backlog under
  the same acceptance gate. Run `node tools/validate_t6_bank.js "<pack>" --vocab-report` for the
  review list, and read it as candidates — n-gram scanning cannot separate jargon from ordinary
  English.
- [ ] Lesson visual acceptance is DOM- and computed-style-level only. The Browser pane was not
  compositing frames in the verifying session, so no screenshots exist for the lesson surface at
  either viewport. A pixel-level pass is still owed.
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
- Last verified: 2026-08-12 (workspace restructure verified lossless; 792 source-traceable T6 surfaces, 64 adaptive primers, 724 scheduled
  scored items of which 433 are fully taught, 80 authored lessons, evidence-gated progress, sampled
  optional confidence, boss-step/whole-chain
  separation, constructed self-review, held feedback, mixed formats and boss grading, the dynamic
  homepage with its trendline hero and mix-and-match builder, the matching board, real-Browser
  desktop/390-pixel interaction, isolated save/resume, live-state preservation, 35 passing
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
  **Currently 52 KiB — over budget and known to be so.** The status block at the top has accreted one
  paragraph per session and is the place to cut: the three superseded 2026-08-11/08-12 paragraphs are
  already narrated in full in `CHANGELOG.md` and should collapse to the current state plus links. Do
  this before adding another status paragraph, not after.
