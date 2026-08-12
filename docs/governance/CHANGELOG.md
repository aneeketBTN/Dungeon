# Changelog

Newest first. Add one entry for every session that changes the workspace. Each entry records what
changed, decisions, verification/evidence, and deferrals.

## 2026-08-12 — Teaching layer complete: every scheduled question is now taught

- **Closed the 0→80 path.** SCLM and SPMS were the two subjects still untaught. 26 lessons authored
  from the clean transcripts takes SCLM from 6 of 16 cited lectures to 16 of 16, and SPMS from 0 to
  16 — so scheduled questions fully taught goes from **433 of 724 to 724 of 724**, and 106 lessons
  are authored in total. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
  `evidence/2026-08-12/t6-teaching-layer-complete/verification.md`.
- **LAW-47 verified across all four subjects**, not just the one that changed: the teach-before-test
  check evaluated in the page from an empty `lessonsRead`, across all 9 study sets per subject plus
  the mixed builder — 595 queue items, zero violations. SPMS study set 1 now opens
  `lesson:SPMS-M01-L10` before its primer and every scored question.
- **Every figure was grepped against its lecture before being written.** Rajashree Cement's 99-hour
  rake cycle with 13 hours of locomotive detention inside it, the ₹3,800/hour penalty and the
  142,800 extra tons a year; Laxmi Transformers at ₹548 a ton by rail against ₹260.3 by sea, and the
  bounding argument that computes inventory only for the highest-inventory option; FarmAid's
  scenarios clustering between ₹8.5 and ₹8.75 lakhs, where the recommendation turns on Ahmedabad
  already existing rather than on cost; Akshaya Patra's 40,000-rated roti machine running at 35,000.
- **Three defects found while doing it.** (1) LAW-50 recurred — an `explainer` array closed with
  `},` — caught by `check_lesson_file.mjs` before the bank validator, which is exactly why the
  protocol orders the gates that way. (2) The vocabulary gate raised a **false** invented-vocabulary
  warning: it builds `\b<term>\b`, so the singular `public private partnership` could not match the
  plural-only `public private partnerships` that occurs three times in the SCLM transcripts. Fixed
  in the lesson by using the course's own plural; the gate limitation is recorded as a Known Gap.
  (3) `SPMS-M06-L08` is titled "Traceability" but the word appears only in its header — the body
  teaches the customer → product → project requirements chain. The lesson was authored for what the
  lecture teaches rather than inventing content to match its label.
- Regression: 35 tests pass, `build-site.mjs` prepares 15 assets, `validate_t6_bank.js` reports 0
  errors and 1 warning (the pre-existing IBM option-length cue), no console errors.
- Deferred: no screenshots — the Browser pane was not compositing, so pixel acceptance of the lesson
  surface is still owed. 177 uncited lectures across IBM, SCLM, and SPMS remain unauthored by
  choice; no question cites them, so a lesson there is never delivered. All 106 lessons stay
  `WAITING_OWNER_CONTENT_ACCEPTANCE`, now the largest block of unaccepted content in the product.

## 2026-08-12 — Collaboration handoff: `AGENTS.md` corrected, branch published

- **Published `reorg/structure` to GitHub so a second contributor can work.** Nothing merged to
  `main`, so nothing deployed and the live cohort is untouched. Verified before committing: 35 tests
  pass, `node tools/build-site.mjs` prepares 15 public assets, `node --check` clean on all five T6
  scripts, and `node tools/validate_t6_bank.js "<transcripts>"` reports **0 errors and 3 warnings**.
- **Corrected the index against the working tree, which had moved past it.** `AGENTS.md` still
  described a mid-session state: it claimed 50 lessons and "233 of 283 lectures still have no
  lesson", with IBM/SCLM/SPMS at 100% untaught. The real numbers are **80 lessons authored** — BRGSA
  50 of 50 lectures, IBM 16 of 16 *cited* lectures, SCLM 6 of 16, SPMS 0 of 16 — and **433 of 724
  scheduled questions fully taught**. BRGSA and IBM are complete for everything a learner can reach.
  Known Gaps, Key Files, and the status paragraph now carry those figures with an instruction to run
  the gates rather than quote the file.
- **Repointed the documented source of truth from the AI-Ready Pack to the clean transcripts.** The
  code had already moved (`tools/lib/clean_transcripts.js` is now the single loader) but the index
  still sent a reader to `graph_source/`, `dense/`, and `indexes/` — the layer LAW-49 exists to catch
  content authored against. The Directory Map now documents the transcript layout, that a lecture's
  identity is its **position** in the module file rather than its recording code, and that the old
  pack remains readable but is not authority.
- **Found and documented a silently-green gate.** `node tools/validate_t6_bank.js` with *no* path
  argument returns `ok: true` with an empty `"coverage": {}`: the entire lecture-source block is
  skipped, including the LAW-49 vocabulary gate, while still reporting success. A wrong path
  correctly fails. `npm run validate:bank` passes no argument, so the script a new contributor would
  naturally run is the one that verifies nothing. Documented in the baseline checks and the new
  collaborator section; the tool contract itself is **not** changed here and is filed as follow-up.
  Same failure family as I47 — the failure mode is silence, not a warning.
- **Added a collaborator section to `AGENTS.md`**: `main` is the deploy trigger and must not be
  pushed to directly; what runs straight from a clone (`npm test`, `build-site.mjs`, `server.py`);
  what needs the external transcripts and why they cannot be committed; and that absent
  `data/state/` is by design, not a bug.
- **Corrected a stale production claim** left inside the 2026-08-11 status paragraph, which still
  said the live site served `475837f`. The 2026-08-12 deploy note above it already recorded `0cc2c6d`
  live as Worker version `c602c4b3`; the two now agree.
- Deferred: the IBM option-length cue (correct answer at length-rank 3 in 45% of 68 sampled
  questions against a 25% baseline) is recorded as a Known Gap, not fixed. The 8 IBM lessons for
  uncited lectures are harmless but are never delivered and must not be counted as coverage. Lesson
  pixel-level acceptance is still owed.

## 2026-08-12 — Teaching layer: the 0→80 path

- **Diagnosed why the app only served people who had already studied.** The bank generates ~12.8
  surfaces per concept by recombining four harvested sentences, so a cold learner's first contact
  with any idea was a scored item in vocabulary nothing had introduced. Measured: a case question's
  own primer introduced **19%** of that case's vocabulary on average, none at all in 10 of 64 cases;
  **59 of 64** case questions had zero same-concept distractors, making them answerable by topic
  matching and unanswerable by reasoning; 9 explained a different lecture than they tested; and the
  correct answer to one shipped question used "stopping rule", a phrase appearing **0 times** in 50
  BRGSA transcripts.
- **The teaching material already existed and was ~2% used.** The external Term 6 pack holds 92,489
  dense words for BRGSA alone across 50 lectures, each with key terms, objectives, and worked
  examples with real numbers. Added `tools/build_t6_lessons.mjs` to extract candidates and
  `app/sets/t6_lessons.js` to hold authored lecture-grain lessons — objective, explainer, worked
  example, glossary, handoff. **BRGSA is complete: 50 lectures across all 8 modules.** Every lesson
  is written from that lecture's own transcript, using its own numbers — Clairo's ₹3,200 blended CAC
  against ₹10,000 on LinkedIn, the 33% signup-to-activation constraint, the 70/20/10 capacity split,
  the 12-week roadmap's five columns. The extractor supplies candidates and provenance; the prose is
  authored, because the dense files are transcript bullets and some are incoherent out of context.
- **Teach before testing is now a scheduling invariant.** `layeredQueue()` places a lecture's lesson
  ahead of the first scored question citing it, ahead of the primer. Lessons are unscored, create no
  evidence, and are recorded per lecture in `profile.lessonsRead`.
- **Distractors compete on reasoning again.** `relevantWrong()` fills from the same concept first and
  only trades a relevant option for a length-matched foreign one while the set would otherwise cue
  the answer by length. Result: 0 of 64 case questions have zero same-concept distractors (was 59),
  all 64 carry at least two, and the option-shape guard still passes with zero errors.
- **Applied questions explain what they tested.** `conceptData()` now carries `caseSource`,
  `caseExplanation`, and `caseLink`, so a case cites and reinforces the lecture its case came from.
  The originating example moved from `BRGSA-M02-L01` to `BRGSA-M02-L02` and its correct-answer
  feedback changed from the null hypothesis to sample-size noise.
- **A vocabulary gate keeps it true for lectures authored later.** `tools/validate_t6_bank.js`
  measures first use against the lossless `graph_source/` transcripts rather than the concept index,
  which is unreliable for this (it reports "sample size" first seen at M02-L03 when M02-L02 is the
  lecture titled "Sample Size Logic"). The gate caught three real authoring errors this session,
  including an invented "sampling bias" — the course names social desirability, hypothetical,
  acquiescence, leading question, and researcher confirmation.
- **Repaired the question this work started from.** `sample_logic` asked what to do when a variant
  leads after 18 visitors, and its *correct* answer read "Continue to the planned sample bound unless
  a pre-registered stopping rule applies" — "stopping rule" appears 0 times in all 50 BRGSA
  transcripts, and "sample bound" is not used until M08-L03, six modules after the question. Rewrote
  it in the course's own M02 words: "Run the test to completion at the pre-calculated sample size"
  (the lecture says *sample size should be pre-calculated, you should test run to completion, no
  peeking*). The shorter answer also cleared the length cue that had been excluding the question —
  `excludedLegacyMcqs` 37 → 36, scheduled questions 151 → 152.
- **Closed a hole in the invariant itself.** Re-running LAW-47's verify step against a live queue
  (rather than trusting the code comment) showed a primer could still precede its own lecture's
  lesson: `layeredQueue()` gated on the scored question's lectures and then pushed the primer
  unchecked, but a primer is separately authored and cites different lectures —
  `brgsa_m1_demand_primer` cites M01-L01 while the `survey_bias` it introduces cites M01-L05, so the
  primer ran at step 4 against a lesson arriving at step 9. Extracted `teachFirst(surface, conceptId)`
  and applied it to the primer on its own terms. Verified from an empty `lessonsRead` across all 9
  BRGSA sets and the mixed builder: zero violations.
- **Coverage is reported, never rounded up.** The validator prints the untaught backlog: **BRGSA 0 of
  152** scheduled questions untaught, 33 of 33 cited lectures taught; IBM/SCLM/SPMS still 100%.
- **Verification.** `VERIFIED(REAL_BROWSER + AUTOMATED)` at
  `evidence/2026-08-12/t6-teaching-layer/verification.md`. 35 tests pass, the bank validator is
  clean, the build ships 15 assets. One defect was found in the browser and fixed: `ensureReattempt`
  treated a lesson as a re-attemptable surface and put a sample-size case ahead of its own lesson.
- **Made the work handoff-able, because one session cannot finish 283 lectures.** The procedure had
  been living in session context — which figures to grep, which gates in which order, why the browser
  check cannot be a unit test. Three artifacts move it into the repository:
  `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` (sources, lesson contract, batch procedure, gates,
  the four traps already paid for, per-subject definition of done);
  `tools/check_lesson_file.mjs`, which reports **every** structural defect in one pass instead of the
  parse-fix-reparse loop that cost this session the most time, and — given the pack — prints the
  exact next batch of lectures to author, so a cold session can resume mid-subject; and
  `tools/browser-checks/teach-before-test.js`, LAW-47's verification as a checked-in script evaluated
  in the page. It stays a browser check deliberately: re-implementing `layeredQueue()` in Node would
  create a second copy of the scheduling rules that reports green while the app is broken.
  `check_lesson_file.mjs` was negative-tested — three deliberately broken brackets, all three
  reported at once.
- **IBM is complete on the measure that matters: 16 of 16 cited lectures, 140 of 140 scheduled
  questions taught.** Authored against the citation list rather than the module list. The
  verification step earned itself repeatedly: `shared value` appears **0** times in the IBM
  transcripts — the course says *value sharing*, Porter and Kramer's term — and `public good`
  singular fails the word-boundary gate because the course says *public goods*. Both were caught
  before shipping. Figures come from the lectures: Aravind's 1,200–2,400 surgeries per
  ophthalmologist against a national 220–250; Grameen's 94% poor-owned equity and 96%+ repayment;
  Andhra Pradesh's 935 loans per 100 households; SELCO's ₹15/day kerosene against ₹10/day solar;
  44,000 FPOs by March 2025.
- **Added read-through mode** (`Read the lessons`, fourth dashboard tab). Lessons were previously
  reachable only inside practice, one at a time. The panel lists every lecture a subject knows about,
  grouped by module, each expandable to the full lesson. Reading here deliberately does **not** write
  `profile.lessonsRead` — that map drives the teach-before-test gate, so recording a skim would
  silently disable the gate for every lesson skimmed. Verified: opening all 50 BRGSA lessons leaves
  `lessonsRead` at 0.
- **The panel labels deliverability, which nothing else did.** Each row reads *Taught in practice*,
  *Read-only — no question cites this*, or *No lesson yet*. Building it caught an over-report in my
  own first cut: counting every citing question gave BRGSA 44 reachable lectures, but 11 of those are
  cited only by `optionShapeRisk` questions, which no scheduling path serves. Filtering those lands
  on 33, matching the validator exactly. The *No lesson yet* rows are the live authoring queue.
- **Deferred.** No screenshots — the Browser pane was not compositing in this environment, so visual
  acceptance stays DOM- and computed-style-level. SCLM and SPMS remain: 32 cited lectures. 233 of 283 lectures still have no lesson: IBM,
  SCLM, and SPMS are untouched, and their dense layers carry almost no faculty objectives, so those
  lessons will need objectives authored from scratch rather than extracted. Authored question copy
  still says "18 visitors per arm"; the gloss covers `arm`. All lesson prose is new and stays
  `WAITING_OWNER_CONTENT_ACCEPTANCE`. Nothing pushed or deployed.

## 2026-08-12 — Lossless workspace restructure for collaboration

- **Reorganized the repository in seven verified phases**, no behaviour changes intended and none
  observed. Every phase ran the same six gates before the next began: the test suite, `node --check`
  across all source scripts, the bank validator against the real pack, a build whose `dist/client`
  hashes were compared against a pre-reorg golden snapshot, a whole-tree SHA-256 content manifest
  proving no file was silently lost, and a real-browser pass.
- **Entries below this one are not rewritten.** A changelog entry records what a past session did;
  rewriting its paths to match the new layout would turn a true historical statement into a false
  one. Read older entries against this map:

  | Was | Is now |
  | --- | --- |
  | `mock/` (t6, login, admin, sets, robots) | `app/` |
  | `mock/rogue.*` | `legacy/rogue/` |
  | `mock/` older prototypes and their sets | `legacy/prototypes/` |
  | `mock/CLAs/` | `legacy/CLAs/` (untracked) |
  | `mock/server.py`, launchers, `validate_t6_bank.js` | `tools/` |
  | `scripts/` | `tools/` |
  | `site/` | `sites-backup/` |
  | `state/`, `history/`, `graphs/` | `data/state/`, `data/history/`, `data/graphs/` |
  | root Markdown, `briefs/` | `docs/{governance,briefs,engine,design,community,ops}/` |

  `evidence/` and `_TRANSFER/` are frozen for the same reason. `cloudflare/`, `db/`, `tests/`,
  `outputs/`, `work/`, and `coordination/` did not move.
- **`cloudflare/` was deliberately left in place.** Workers Builds deploys from it and its root
  directory is configured in the Cloudflare dashboard, outside this repository. Moving it would have
  broken auto-deploy in a way no local check could catch.
- **Public URLs are unchanged.** Testers reach `/dungeon/`, `/dungeon/t6.html`, and
  `/dungeon/admin/`, none of which contained the renamed directory. The legacy `/dungeon/mock/...`
  aliases are kept as accepted public URLs and now resolve to `app/` assets; a new test walks four
  of those bookmark URLs and asserts each still serves its asset.
- **`site/worker.mjs` was documented as production and is not.** `wrangler.jsonc` deploys
  `cloudflare/src/index.mjs`; nothing references the `dist/server/index.js` this file builds to. It
  is the private Sites entrypoint, unchanged since `d92e06a` while the live Worker moved through
  four releases. Renamed to `sites-backup/` with a README recording the divergence — most seriously
  that it has no agreement gate, so promoting it as-is would admit testers without acceptance.
- **`graph_source/` was never missing.** It is a directory of the external owner-supplied pack at
  `C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack` (283 chunks, matching the documented
  283 lectures), correctly untracked. `AGENTS.md` cited it among repo-relative paths, which read as
  a missing repository directory; the Directory Map now states the boundary.
- **Two latent hazards found and fixed, neither caused by the restructure.** `core.autocrlf=true`
  rewrote checked-out files from LF to CRLF — the release build copies from the working tree, so
  that silently changes deployed asset bytes; pinned with `core.autocrlf=false` and a
  `.gitattributes` that holds for every contributor. And the path-anchored ignore rules
  (`mock/CLAs/`, `mock/tunnel-out.txt`, `mock/leaderboard.json`) stopped matching the moment their
  directory moved, which briefly re-tracked the private course material; rewritten as directory- and
  file-name patterns, and verified absent from history.
- **Verification.** 35 tests pass (34 baseline plus the bookmark test), 32 syntax checks, bank
  validator reports zero errors and zero warnings, and `dist/client` is byte-identical to the
  pre-reorg golden snapshot with only the URL prefix renamed. Real browser on the dev server: `/`
  redirects to `/app/t6.html`, all fourteen assets return 200 with no console errors, a study set
  opens and renders a primer from the bank, and login and admin load their siblings.
  Backup: `C:\Users\knigh\Dungeon-backup\2026-08-12-pre-reorg`, 576 files verified byte-identical by
  SHA-256, plus git tag `pre-reorg-abfd606`.
- **Not done.** No push and no deploy — the live cohort is untouched by this work until the branch
  `reorg/structure` is merged. Live-edge re-verification is owner-gated on that merge.

## 2026-08-12 — Measured UI alignment pass and the Access login loop fixed at source

- **Fixed the Cloudflare Access login loop locking the owner out of the Control Room.** The
  Worker was cleared first — its admin path has no redirect loop. Inspection of the account found
  a single Access application, so the overlapping-application theory was wrong. The real cause: the
  app accepted only the `- cloudflare` identity provider, `Apply instant authentication` was on, and
  **no Google provider exists on the account at all**. With one accepted method and instant auth on,
  Access skipped the chooser and redirected straight into a flow a Google session can never satisfy,
  then redirected again — no chooser, no error, bouncing until timeout. With owner approval: enabled
  the existing `Dungeon one-time email code` provider alongside `- cloudflare` and turned instant
  authentication off. `Accept all available identity providers` deliberately left off so the gate
  does not auto-accept future providers. Destination, policy, and session duration unchanged.
- **Ran the UI pass against measurements rather than impressions.** An audit probe was injected per
  screen at 1280×800 and 375×812, reporting overflow, ragged wrap containers, sub-44px touch
  targets, and clipped text. Two candidate findings were rejected as artifacts: `.momentum-figure`
  reports two rows only because `align-items: baseline` gives differently-sized items different
  tops, and several sub-44px hits appeared only in mid-render states.
- **Match label tray** — the reported defect. Tablets measured `193/268/191/266`px wrapping
  3-then-1, and a tablet was *wider than the 162px slot it drops into*. `--statement-count` moved to
  `.match-board` so the tray shares the statements' grid track, with gaps matched. All four tablets
  are now `162px` on one row, each left edge exactly on its slot's.
- **Match reading order** — four equally weighted 7-line columns gave the eye no entry point.
  Statements are now numbered `1–4` against lettered `A–D` labels, so the task reads as "put a
  letter under each number". The badge reuses the existing `.option-key` treatment rather than
  inventing a shape. Not fixed: match choices span 13–179 characters, which layout cannot reconcile;
  that is a generator constraint for the bank work.
- **Mastery key legend** — widths `444/332/383/81`px each on its own row; now a two-column grid with
  the status dots aligned, collapsing to one column on mobile.
- **Subject actions** — two buttons at `257`/`187`px wrapping ragged inside a 370px column at
  desktop width; now an `auto-fit minmax(200px,1fr)` grid, equal width stacked or side by side.
- **Touch targets** — `brand-home` (38px), `skip-link` (43.3px) and `label-tablet` (40px) raised to
  44px. Zero sub-44px targets remain on the audited screens.
- Verification: 0 findings on dashboard, primer/MCQ, cloze, match, and feedback at both viewports;
  no horizontal overflow; `npm test` 34 passing; validator `ok: true`; build 14 assets. Evidence:
  `evidence/2026-08-12/t6-ui-alignment-pass/verification.md`.
- Deferred and stated plainly: boss, case-cloze, and constructed-response surfaces were not reached
  in a driven session (synthetic label clicks do not register with the app's selection handler), so
  they carry only a static check. The results screen, `login.html`, and `admin.html` were not
  audited in this pass.

## 2026-08-12 — Option-level diagnoses, a wrong-answer panel that explains itself, and an Access self-check

- **Rebuilt the wrong-answer panel.** It printed a verdict and no reason: `Not yet — this idea will
  return`, the concept explanation, and the correct answer hidden behind a `Show the complete answer`
  disclosure, with nothing referring to what the learner had chosen. For `match` questions the
  explanation is just the two principles concatenated, so the panel restated both answers and
  diagnosed nothing. The panel now reads verdict → what this choice assumed → catch it earlier →
  what governs this question → the complete answer → why it connects → return note. The complete
  answer is no longer collapsed, and the governing line is suppressed when the answer key already
  states it verbatim.
- **Every distractor now diagnoses a specific gap.** Audited all 3,240 distractor slots. The bank is
  generated, so distractors are borrowed from other concepts and the generator already knew what each
  wrong option meant — it was discarding that. `mock/sets/t6_challenges.js` now builds a provenance
  index from the derived concept data and runs a diagnosis pass over every question after generation.
  Six recognised families: another concept's principle, decision, causal chain, or label; the same
  concept's wrong facet; and the three constructed boss-integration errors. Provenance was checked
  for collisions across all 256 indexed concept texts — zero ambiguous, so each diagnosis is true by
  construction rather than inferred.
- **Added `mock/sets/t6_diagnoses.js`** with 78 hand-authored diagnoses for the distractors carrying
  no machine-knowable provenance: 3 shared across the catalogue `connect` questions covering 84
  slots, and 75 across 25 MCQs. Result: **2,943 diagnoses across the active bank with zero generic
  fallbacks — 100% specific.** The 90 remaining fallbacks sit inside the 163 legacy MCQs already
  excluded from scheduling.
- **Fixed a live user-visible defect.** `evidence.reasons` is rendered in the concept inspector and
  interpolated the raw misconception tag, so a learner repeating an error across two variant families
  saw `The same misconception returned across independent evidence: selected-belief:It estimates the
  total market before speaking to buyers.` Tags are now readable noun phrases.
- **Fixed a latent indexing bug.** Multi-part items read the misconception as
  `misconceptions[partResults.indexOf(false)]` — the part index, not the chosen option. For a
  single-blank cloze that is always `0`, so every wrong option reported the same misconception.
  `diagnosisFor` now indexes by the selected option within the failing part.
- **Made the contract enforceable rather than advisory.** `mock/validate_t6_bank.js` fails the build
  when a scheduled distractor lacks a diagnosis, when any of `tag`/`label`/`why`/`cue` is empty, when
  a `why` restates the correct answer, or when a `why` addresses the learner instead of the reasoning.
  A question added through any path picks this up automatically, because the diagnosis pass runs over
  the whole course rather than inside each generator. The authoring contract is recorded in
  `briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md`. The gate caught two of this session's own
  strings before they shipped.
- **Added an Access self-check for the admin login loop.** The owner reported the Control Room
  bouncing between the site and Cloudflare until timeout. The Worker's admin path contains no
  redirect loop — the bounce is at the Access layer, where the Worker had no way to report anything.
  `GET /dungeon/admin/access-check` now returns booleans and a coarse reason
  (`NO_JWT_AT_ORIGIN`, `AUDIENCE_MISMATCH`, `ISSUER_MISMATCH`, `TOKEN_EXPIRED`,
  `SIGNATURE_OR_JWKS_FAILURE`, `OWNER_EMAIL_MISMATCH`, `OK`). It sits outside the owner gate by
  design, since requiring the gate to diagnose the gate would be useless, and never echoes the
  audience tag, team domain, or any address. This is a diagnostic, not a fix: the root cause is in
  the Access application configuration and needs the dashboard.
- `mock/server.py` now falls back to `$PORT` when no port argument is given, so the preview harness
  can run it alongside another session's server. `argv` still wins and the default is still 8099.
- Verification: `node mock/validate_t6_bank.js` → `ok: true`, 0 errors over 792 questions;
  `npm test` → 34 passing; `npm run build` → 14 allowlisted assets; real-browser acceptance of the
  rebuilt panel and of the `sclm_m1_match` question from the owner's report. Evidence:
  `evidence/2026-08-12/t6-option-diagnoses/verification.md`.
- Deferred: the 78 authored diagnoses are new learning content and carry the existing
  `WAITING_OWNER_CONTENT_ACCEPTANCE` boundary. The 163 excluded legacy MCQs keep generic fallbacks.
  A bank-volume audit run this session is reported separately and no expansion was built.

## 2026-08-11 — Dynamic homepage, practice builder, enforced agreement version, and readable matching

- Rebuilt the dashboard around the owner's direction: subjects move to the top as a compact
  switcher, the hero pairs the subject-local next action with a live evidence trendline and a
  data-derived momentum message, and the persistent header shows a Term 6 evidence sparkline instead
  of a `0 of 64` counter. The detailed evidence graph moved beside concept inspection; the mastery
  matrix, the four-state Term 6 totals, and the staged panels now read as one continuous scroll
  instead of hiding the hero.
- Added the inline **Build your own practice** builder and retired the practice-setup dialog. Shape,
  concept focus (anything / needs work / new ground), length (quick / standard / deep), and feedback
  timing each change the generated run. Combinations that cannot narrow anything are disabled with
  their reason, a length that cannot add questions collapses to the shorter run that matches it, and
  the live summary states the real question count and estimate. Selections persist per learner.
- Added the **How far you have come** strip: answers recorded, practice blocks, concepts with
  evidence, and subjects started, all counted from real attempts with deduplicated multi-concept
  questions. Copy stays factual and never converts activity into praise.
- Inverted long-form matching. When answer cards carry the substance and the row labels are short,
  each statement now appears once with the short labels as compact choices, instead of repeating
  four paragraphs under every row. Stored responses, partial credit, concept results, and the answer
  review keep the row-indexed shape.
- Fixed the tester agreement gate: the accepted version is now carried on the session lookup and
  re-checked on every authenticated request, so a session issued under older terms is rejected with
  `AGREEMENT_REQUIRED` instead of running unchallenged until the cookie expires. The Control Room now
  separates `Agreed`, `Older terms`, and `Never agreed`, which was the source of the misleading
  "signed in with progress but not agreed" reading.
- Fixed answer feedback losing to selection styling: `:has(input:checked)` inherits its argument's
  specificity and outranked `.choice.wrong`, so a wrong match choice painted as an ordinary selection.
- Added the standing change-announcement ritual to `COMMUNITY_PLAYBOOK.md` and the close-out
  checklist: every tester-visible change ships with one `What changed` / `What to try` post.
- Verification: 33 automated release/access/agent tests, `node --check` on the app and Control Room,
  the 792-surface bank validator against the owner pack, and real-Browser desktop plus 390-pixel
  passes over the new homepage order, builder availability rules, generated runs, held-feedback runs,
  the inverted match interaction, and its resolved styling. Evidence:
  `evidence/2026-08-11/t6-dynamic-homepage/verification.md`.
- Deferred: cross-subject practice in one run, and deployment of this revision (a push to `main`
  publishes it and will require the cohort to accept the current agreement again).

## 2026-08-11 — Adaptive primers, evidence-first dashboard, and tester group bumps

- Added one source-traceable primer per T6 concept. Learning runs introduce only the next new
  primary concept before its challenge; correct work fades support quickly, harder successful
  challenges suppress it, and misses restore applied/misconception layers. Primer responses are
  unscored, excluded from the 565-item mastery pool and held-feedback practice, and stored in a
  separate per-concept support state. The complete bank is now 792 tagged surfaces: 728 scored
  challenges plus 64 adaptive primers.
- Reordered the dashboard's first two scrolls around the next-action hero, a five-axis Term 6
  mastery matrix (four subjects plus Connections), and the selected-subject evidence trend. Subject
  choice and concept inspection follow. Canvas values have a complete text equivalent.
- Added the approved-email WhatsApp gate and owner bump workflow. The private invite is absent from
  anonymous login assets and returned only after the allowlist check; the join tick stays disabled
  until the invite opens and remains an explicit self-attestation, not claimed verification.
  Signed-in missing testers receive an in-app reminder. The Control Room can bump one or every
  missing tester, record the reminder, and copy a firm message for manual sending without
  autonomous messaging or removal.
- Added D1 migration `0004_community_acknowledgement.sql`, applied it remotely, and confirmed no
  migrations remain. Updated the privacy notice, tester guide, community playbook, agreement source,
  two-page DOCX/PDF deliverables, Cloudflare contract, and owner/learning briefs.
- Verification: 31 automated release/access/agent tests, syntax checks, the 792-surface source/bank
  validator, allowlisted build, Wrangler dry run, standalone bundle, real-Browser desktop and
  390-pixel primer/dashboard/login/admin paths, and Word-native PDF render inspection all pass.
  Commit `475837f` deployed as Cloudflare version `98f1bb5b-e5f5-4f08-9340-e102dc79be50`; the exact
  live health/login/admin paths passed and the Control Room showed the bump workflow. It listed
  eight approved external testers; verification did not change any tester state. The configured
  owner-only Sites project was not visible to the current connector, so private backup version 5
  was not refreshed and remains non-origin. Evidence:
  `evidence/2026-08-11/t6-adaptive-primer-community/verification.md`. Remaining boundary: the
  changed agreement version intentionally requires each tester to re-accept on next login;
  WhatsApp membership remains self-attested and owner-reviewed.

## 2026-08-11 — Closed tester agreement verified end to end on production

- Deployed the current agreement-enabled Worker and confirmed the active D1 migration history
  includes learner state, country/single-session security, and agreement acceptance.
- Used a fresh temporary approved address to verify the complete production path: approval,
  first-login agreement, both required acknowledgements, learner dashboard entry with `Saved
  online`, sign-out, and revocation. The temporary account was removed and the Control Room
  returned from ten to the original nine approved testers.
- Refreshed the two-page DOCX/PDF agreement so its group-membership section and two quoted
  acknowledgements match the live first-login gate; Word-native export and visual review found no
  orphan page, clipping, or signature fields.
- Closed the stale `WAITING_OWNER_DEPLOY`, `WAITING_OWNER_TESTER_EMAILS`, and incomplete end-to-end
  onboarding notes. The first cohort and private WhatsApp group are active; small learning samples
  remain observational only. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`.

## 2026-08-11 — Cohort onboarding, lock recovery, learning signal, and push-to-deploy

- Connected `aneeketBTN/Dungeon` (private) to Workers Builds. Root directory `cloudflare`, build
  `npm --prefix .. run build`, deploy `npx wrangler deploy`, production branch `main`. The
  dashboard's auto-filled config was wrong for this repo: root `/` would have left wrangler unable
  to find `cloudflare/wrangler.jsonc` and the worker's `jose` dependency uninstalled. Verified the
  corrected shape locally first — `build-site.mjs` resolves from `import.meta.url`, so it is
  location-independent. First Git-triggered build deployed version `6ebc486b` and is attributed to
  the commit rather than `Manually deployed`.
- Owner accepted that push now equals publish, after the tradeoff was stated twice: a
  work-in-progress commit reaches testers. Mitigation in practice is to hold commits until a change
  is complete.
- Required the WhatsApp tester group at onboarding. The agreement step now gates on two
  acknowledgements — the closed tester terms and confirmation of joining the group — and the full
  terms gained a membership clause. Verified live that ticking only the terms still blocks entry.
- Replaced the single-email tester field with a paste area accepting a whole cohort separated by
  commas, spaces, or newlines. `POST` takes an `emails` array, writes the Access group once
  atomically, and reports added, already-approved, and rejected addresses separately.
- Added lock recovery. `PATCH` with `action: "unlock"` clears a country lock and re-baselines
  `first_country` without touching the Access group or the tester's saved progress. Before this the
  only remedy was revoke-and-re-add, which deletes progress — the wrong answer for a signal that
  fires on ordinary travel, VPNs, and mobile routing. A test asserts progress survives.
- Added two dashboard panels that replace what was previously scoped as scheduled agents, both
  reading real saved progress rather than inferring from reports: Participation (answers, concepts
  touched, first-attempt accuracy, time since last answer) and Where testers struggle (concepts
  ranked by unassisted first-attempt accuracy, with hint rate and tester count). Aggregation counts
  only scored, non-reattempt records, excludes the owner, skips unparseable rows, and labels
  samples under ten attempts as low rather than hiding them.
- Deliberately did not build a Question Bank Steward panel. Authoring replacement question families
  is generative work that needs the source checked; the dashboard surfaces which concepts are weak
  and the rewriting stays a reviewed session.
- Tester rows now show signed-in, agreement-accepted, has-progress, first-login country, and last
  activity. `npm test` passes 27/27, including a new aggregation test covering owner exclusion,
  corrupt rows, retries, and unscored practice. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`.

## 2026-08-11 — Approved-email entry, shared learner backend, and the closed tester agreement

- Replaced the emailed-code learner challenge with a single binary admission check. The Control
  Room allowlist is now the only gate: an approved email enters immediately with a signed opaque
  session cookie, and an unapproved email receives one fixed private denial,
  `Ask Aneeket to add you in.`, that never reveals the allowlist. The owner dashboard keeps its
  separate, stronger Cloudflare Access boundary.
- Added the shared learner backend. Cloudflare D1 stores per-email tester records, opaque
  session-token hashes, and progress rows; `cloudflare/migrations/` holds the three applied
  migrations and `db/schema.ts` mirrors the current shape. Progress now survives a cleared browser
  and a device change, the browser copy remains an offline fallback, and a dirty-flag check stops a
  staler server copy from overwriting an unsynced local run.
- Added the anti-sharing controls the owner asked for, with one deliberate softening: one active
  browser per approved email, and a hard lock when an account appears from a different country.
  City and region changes are not used, because mobile networks, VPNs, travel, and routing make them
  unreliable grounds for an automatic permanent ban. A lock is an owner review prompt in the Control
  Room, which now shows active-session, first-country, and lock state per tester.
- Held the first approved login at a one-time agreement step. Acceptance records only the agreement
  version and time; a returning tester on the same version enters directly. Revocation deletes that
  tester's sessions and server-side progress.
- Owner direction during this session: the agreement is a gentlemen's agreement, not a signed
  contract. Removed the tester-name, approved-email, and both signature blocks from
  `DUNGEON_CLOSED_TESTER_AGREEMENT.md` and the document builder; section 8 now states that no
  signature is needed and that ticking the acknowledgement box at first login is the acceptance.
  Rebuilt `outputs/Dungeon_Closed_Tester_Agreement.docx` and exported the deliverable PDF; the
  two-page render is read at
  `evidence/2026-08-11/closed-tester-agreement/render-acknowledgement/`.
- Live edge verified from both sides of the boundary: health reports `cloudflare-d1`, the anonymous
  route serves only the login page, an anonymous bank fetch is `401`, an unapproved email is `403`
  with the private denial, and the approved owner/browser address is held at `428
  AGREEMENT_REQUIRED` with no session or state written. Deployed `login.js` and `login.css` are
  byte-identical to source.
- Found and repaired a real defect during the live Browser pass: `mock/login.css` set
  `display: grid` on the `form` element selector, which outranks the user-agent `[hidden]` rule, so
  the email form stayed 174 pixels tall under the agreement step while reporting `hidden === true`.
  Added the `[hidden]` guard `mock/t6.css` already carried and confirmed the collapse live at
  desktop and at 390 pixels. The repair is in source and both release builds but is
  `WAITING_OWNER_DEPLOY`: this session had no Cloudflare deployment credential.
- `npm test` passes 23/23, `npm run build` produces 13 allowlisted assets plus the worker, and the
  standalone bundle embeds 14 assets in 391,652 bytes. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`. Bugs: `BUG-LAWS.md` LAW-36
  and the LAW-35 amendment. Quality: `QUALITY-LOG.md` I29, I30, and I31.

## 2026-08-11 — Protected Cloudflare domain deployed

- Saved and deployed private Sites version 5 from commit
  `bec2c2af7e1b9b4f9fcd854ee2e19f239e7fd131`; it remains an owner-only rollback surface while the
  exact domain uses the self-contained Cloudflare edge.
- Activated the exact `https://aneeketdas.com/dungeon/` Worker route with direct static-asset
  delivery; the private Sites release remains an owner-only backup and no origin bypass token is
  needed.
- Created one-time-code tester identity, the email-only `Dungeon Testers` group, a broader learner
  Access application, and a more-specific owner-only `/dungeon/admin*` application. The protected
  bootstrap address and the owner's browser/learner address are present; no external tester was
  granted access without an address from the owner.
- Stored a least-privilege Access-group read/write credential as the Worker `CF_API_TOKEN` secret.
  A temporary deployment credential was used once and deleted immediately after the route and
  secret were deployed.
- Added an enabled zone rate-limit rule that blocks above 40 `/dungeon` requests per IP/colo pair
  in 10 seconds for 10 seconds. The first 60-second rule attempt was rejected by the plan and did
  not create a stale rule.
- Replaced the prepared private-origin proxy with an explicit static asset router: learner and
  admin paths are allowlisted, direct public admin aliases fail closed, assets are private/no-store
  and no-index, and the owner endpoint retains JWT, email, same-origin, size, and group invariants.
- Added and verified an embedded-asset fallback build for upload paths without an Assets binding;
  it uses the same allowlist and still runs the Worker authentication checks.
- Public DNS, Worker/secret/API configuration, and anonymous edge checks pass. Anonymous learner,
  bank-script, and admin requests all redirect to the correct Access audience. A production
  Browser pass now loads the exact-domain owner Control Room as Healthy, Connected, and
  Allowlisted. It reports the registered owner/browser learner address as one approved tester. The
  learner path reaches the emailed-code login and remains
  `WAITING_OWNER_LEARNER_SIGNIN`. Tester grants remain
  `WAITING_OWNER_TESTER_EMAILS`. Evidence:
  `evidence/2026-08-11/cloudflare-protected-domain/verification.md`.
- Added a reproducible standalone packaging path for authenticated API deployment when a
  non-interactive Wrangler shell lacks credentials; the bundle embeds only the same allowlisted
  client assets. Production acceptance caught health/manifest checks crossing into the learner
  Access app; both now stay under `/dungeon/admin/*` and use the owner audience. `npm test` passes
  21/21, the 728-item bank validator has no errors, both Worker packaging paths pass, and the
  repaired production upload is version `bb7ead71-46e6-4fd3-a2d6-ab25498cdcec`.
- Diagnosed the owner's failed learner sign-in: the second known owner/browser address had never
  been added to the dedicated learner group. Registered it through the same group used by the
  Control Room and added a short custom denial message for verified but unapproved emails. The
  policy still withholds allowlist status until inbox ownership is proven.

## 2026-08-11 — Direct tester management in the Control Room

- Added a full-width owner access panel with email entry, approved tester list, refresh, explicit
  tester count, and confirmation-backed one-person revocation. Website access is kept visibly
  separate from WhatsApp membership.
- Added the prepared `aneeketdas.com/dungeon` edge controller. It validates the admin Access JWT
  and exact owner email, requires same-origin mutations, bounds JSON input, edits only a dedicated
  exact-email group, protects the owner bootstrap member, and strips access/origin credentials
  while proxying to the private Sites origin.
- Kept the browser credential-free. Cloudflare and Sites tokens are runtime bindings only; missing
  bindings, unsafe group selectors, a missing owner rule, or failed authentication all fail closed.
- Added seven focused edge tests plus a Sites setup-required test. Sixteen tests pass overall;
  Wrangler 4.120.1 generated current types and a successful dry-run bundle; the Sites release
  remains the same ten-file allowlist. Evidence:
  `evidence/2026-08-11/tester-dashboard-access-management/verification.md`.
- Saved and deployed private Sites version 4 from commit
  `8cf19b620013a4a75afa4aef5f445ddfa8234658`. The owner-only production dashboard now contains the
  controls and truthfully reports setup required until its Cloudflare edge is activated.
- Live route, secrets, group, tester grants, and revocation remain
  `WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS`; no tester or access policy changed in this session.

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
- Owner-only Sites version 3, built from `9c9e322a2e8a920a0101681faaad88e42b9928c5`, passed the
  corrected production re-check: unauthenticated `/admin` required sign-in; the authenticated
  dashboard reported Healthy, Allowlisted, ten public assets/no learner state, and automated checks
  passed, with no overflow or Dungeon application errors.
- Added a deliberately inert three-agent cohort control plane: Learning Signal Auditor, Question
  Bank Steward, and Tester Cohort Steward. Registered their intended hourly/daily project
  schedules, models, and prompts, then verified all three persisted as `PAUSED`; repository
  declarations remain disabled. The scheduler initially stored ACTIVE despite the paused create
  request, so the definitions were explicitly corrected and re-read before any interval elapsed.
  Versioned contracts reject direct identity/raw responses and the activation check fails until
  backend, consent, retention/deletion, owner review, adapters, synthetic acceptance, and explicit
  owner approval are complete. No run or external action occurred. Evidence:
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
