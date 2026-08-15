# Bug Laws — Living, Tiered Decision Aid

Two tiers:

- 🔴 **REDLINE** — a severe demonstrated failure; hard rule with a comply path.
- 🟡 **WATCH** — an avoidable gotcha; verify after related changes.

Statuses are living: `ACTIVE`, `DOWNGRADED`, `SUPERSEDED`, `RETIRED`.
REDLINEs constrain HOW, never WHETHER. Merge near-duplicates; do not hoard rules.

## Laws

### LAW-01 🔴 — Never ship a selectable control that lies about its effect

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-07-16 prototype audit: length, difficulty, Dungeon, and feedback controls can
  change visibly without changing the connected five-question run.
- **Why:** False affordances destroy setup trust and invalidate usability evidence.
- **Comply:** Connect each choice to real run configuration, or show it locked/disabled with its
  reason before selection.
- **Verify:** For every setup combination in the deterministic scenario matrix, capture selected
  values and assert matching run header, question count/pool, timing/scoring, and feedback behavior.

### LAW-02 🔴 — World progress must derive from awarded progress, not answer commitment

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-07-16 prototype audit: Ari's position advances after a missed answer because
  position is calculated from `answered`.
- **Why:** The game's central metaphor contradicts grading and makes failure look rewarded.
- **Comply:** Derive step/world position from explicit awarded progress. Give secure, partial, and
  missed outcomes separate state transitions.
- **Verify:** Run all-correct, all-wrong, and mixed/partial scenarios; compare score, completed
  steps, Ari position, Resolve, and result totals after every answer.

### LAW-03 🔴 — Reset semantic state and presentation state together

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-07-16 prototype audit: quest completion class and copy can survive into a new
  run after semantic quest state resets.
- **Why:** CSS/DOM residue displays rewards and progress that do not exist.
- **Comply:** Render presentation entirely from reset state, or explicitly clear every derived
  class/copy/animation token in one reset path.
- **Verify:** Complete a quest, return/retry, begin a second run, and capture the quest card before
  question one. Repeat after failure and successful completion.

### LAW-04 🟡 — Run labels must come from the same selected state as content

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-07-16 prototype audit: run header remains hard-coded after another Macro Dungeon
  is selected.
- **Why:** Parallel hard-coded labels drift from the question pool and results.
- **Comply:** Use one typed run configuration for Hall, transition, header, question selector,
  persistence, and results.
- **Verify:** Search for duplicated literal subject/chapter labels, then start every supported
  chapter and compare Hall, run, and dashboard metadata.

### LAW-05 🟡 — Historical documents never silently override current authority

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-07-16 source audit: `docs/design/personalities.md`, `docs/engine/REVIEW_LOG.md`, `docs/engine/PROMPT.md`, prototype
  behavior, and newer product briefs overlap and sometimes differ.
- **Why:** Reading order can accidentally change product decisions.
- **Comply:** Follow `docs/governance/DESIGN_SOURCE_INDEX.md`; put unresolved contradictions in its conflict
  register before implementation.
- **Verify:** Every implementation plan names the source files and conflicts governing its slice.

### LAW-06 🔴 — Fresh-user testing must never erase real learner data

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-07-16 operating-system installation: current `data/state/` and `data/history/` may contain
  real learner progress while the UX loop requires clean scenarios.
- **Why:** Clearing real state to test onboarding causes irreversible learning-history loss.
- **Comply:** Use an isolated test profile or deterministic scenario loader outside live data.
- **Verify:** Before and after UI tests, compare live-state file hashes/timestamps or run against a
  declared test-data path; evidence must name the isolation method.

### LAW-07 🟡 — Source inspection is not browser verification

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-07-16 initial audit completed without an exposed Browser/Computer Use runtime.
- **Why:** Layout, timing, focus, pointer behavior, responsive states, and animation cannot be
  accepted from source alone.
- **Comply:** Label source findings `DIAGNOSED`; promote only after declared real-browser evidence.
- **Verify:** Evidence includes Browser screenshots/video, viewport, input method, state fixture,
  and route steps.

### LAW-08 🟡 — Record generated measurements only after the final artifact change

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-07-16 admin-system close-out: `AGENTS.md` was measured, then edited to record
  DONE status, making the written byte count stale until the final audit caught it.
- **Why:** Evidence can become false when the measured artifact changes during close-out.
- **Comply:** Make status/content edits first, run final measurements last, then update only the
  evidence values that do not alter the measured artifact.
- **Verify:** Re-run the measurement after the final artifact edit and compare the observed value
  with every changelog/evidence claim.

### LAW-09 🟡 — Browser-only state does not travel with a copied project folder

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-07-16 Mac transfer audit: the web prototype stores its profile in browser local
  storage while the learning engine stores durable state under `data/state/` and `data/history/`.
- **Why:** A folder transfer can appear complete while onboarding, cosmetics, currency, or an
  unfinished prototype run silently remains on the old machine.
- **Comply:** Document storage boundaries in every machine-transfer handoff; never imply that
  browser-local profile data is included in the folder.
- **Verify:** The handoff names both storage systems and explicitly states which one resets.

### LAW-10 🟡 — Optional helpers must not auto-download executable dependencies

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-04 npm supply-chain audit found that `tools/serve-tunnel.cmd` used
  `npx -y localtunnel`, resolving and executing an unpinned package without review.
- **Why:** A convenience launcher can execute malicious install or runtime code even when the
  application itself has no npm dependency graph.
- **Comply:** Fail closed when the external tool is absent. Require an explicitly installed,
  reviewed version; resolve and display its executable path; validate its exact version before
  starting any server or network exposure; never add an automatic-download fallback.
- **Verify:** Search launchers for package-manager execution, run the missing-tool and
  wrong-version cases, confirm both exit nonzero before child processes start, and record any
  intentionally unrun network-exposure path.

### LAW-11 🟡 — Derive every destination summary after the state mutation it reports

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-10 real-Browser T6 acceptance: the results screen initially said a repaired
  miss was still queued, the global completed-run count lagged until the course map rendered, and
  the revised dashboard initially left the concept-status pill and growing question total stale
  immediately after scheduling a re-attempt.
- **Why:** A correct underlying state still becomes a lying product when headers, badges, or result
  labels are derived from the historical event or pre-mutation presentation.
- **Comply:** Commit the semantic mutation first, then render every visible destination from that
  same current state. Historical responses may explain what happened but may not independently
  declare whether a repair, reward, save, or completion remains active.
- **Verify:** Miss then close a repair and inspect results; complete an all-correct run and inspect
  the header before leaving results; save/resume/reset and compare the hero, route card, results,
  and global header after each transition.

### LAW-12 🟡 — A route alias must preserve the document's asset base

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-10 all-subject dashboard Browser acceptance: the server internally served
  `app/t6.html` at `/`, so the browser resolved `sets/t6_catalog.js` from `/sets/` and the route
  loaded without its course data.
- **Why:** Returning the right HTML bytes at a different URL does not preserve relative script,
  stylesheet, media, navigation, or module paths.
- **Comply:** Redirect aliases to the canonical document URL, use an explicit base URL, or make
  every dependent URL root-absolute. Prefer a redirect when the canonical route already exists.
- **Verify:** Open both the alias and canonical URL in a real Browser; confirm the final URL, all
  assets, route-relative links, and application data load without console errors.

### LAW-13 🟡 — Persistence is incomplete until loaded state becomes the visible state

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-10 all-subject dashboard Browser acceptance: unfinished practice was written
  correctly to local storage, but page initialisation always rendered the dashboard and ignored
  the saved active session.
- **Why:** A valid save that is not restored is indistinguishable from lost progress to a student.
- **Comply:** Validate saved state, restore the active model before rendering, and reproduce both
  unanswered and already-resolved question presentation. Keep reset scoped and explicit.
- **Verify:** Reload before answering, after choosing, after feedback, and after advancing; compare
  subject, set, question number, queue length, due re-attempts, selected answer, and feedback. Then
  confirm reset removes only the intended browser profile.

### LAW-14 🔴 — Partial multi-step evidence must neither disappear nor become a whole-chain pass

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 boss-question Browser pass: two correct steps initially credited a whole
  boss pass; the first repair then risked discarding those valid steps entirely.
- **Why:** Either error lies about the learner: a broken chain is not complete, but a valid
  unassisted reasoning step is still applied evidence for the concept it actually tests.
- **Comply:** Record passed and failed steps separately from the whole-chain result. A valid
  unassisted applied step may contribute concept evidence; a failed relevant step remains an open
  check, and only an all-step success closes the whole-chain state.
- **Verify:** Submit every one-step-wrong permutation; confirm valid steps remain visible, the
  whole chain remains open, the failed concept is not Strong, and no passed step is relabelled as
  a full boss success.

### LAW-15 🟡 — Native selects must not inherit the width of their longest option

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 case-cloze Browser pass: a plausible long option expanded an inline
  native select to 1,486 pixels and created horizontal scrolling.
- **Why:** Better distractors often need complete sentences; intrinsic control sizing must not make
  the question unreadable or hide actions off-screen.
- **Comply:** Put long-choice controls in a min-width-zero container and constrain both container
  and select to the available width. Let the open menu expose full option text.
- **Verify:** Use the longest active choice at desktop and 390 pixels; compare document and viewport
  widths and inspect every cloze, match, and boss select.

### LAW-16 🔴 — Removing an answer-shape cue must not create a new stylistic cue

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 bank hardening: an initial option-length repair padded distractors with a
  repeated generic reasoning tail, making options verbose and mechanically recognisable.
- **Why:** Cosmetic equalisation can make guessing easier while pretending the item improved.
- **Comply:** Build distractors from plausible neighbouring applications of comparable specificity.
  Quarantine legacy shape-risk items from active pools until rewritten; never pad with repeated
  filler.
- **Verify:** Validate option shape, assert quarantined IDs are absent from all run pools, inspect
  representative choices for recurring syntax, and require minimum active breadth per concept.

### LAW-17 🟡 — A dependent case and task must look like one prompt

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 question-hierarchy review: the case was normal text in an isolated box
  while its bold dependent question sat outside.
- **Why:** Visual containment can tell a student that required evidence is optional subtext.
- **Comply:** Put a genuine case and its instruction in one aligned prompt flow. Make the
  substantive case the larger semibold reading text and the instruction a compact bold directive;
  do not add a nested panel or that case-specific flow to case-free questions.
- **Verify:** Inspect boss and case-fill prompts at desktop and 390 pixels, then inspect a no-case
  question to confirm it has no empty or decorative wrapper.

### LAW-18 🟡 — Recommendation language must name its scope

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 dashboard review: every subject-local focus panel said “Recommended now,”
  implying several simultaneous global recommendations.
- **Why:** Vague priority language makes the dashboard look arbitrary and weakens trust in the
  practice order.
- **Comply:** Use “recommended” only when one cross-subject ranking actually selects a unique next
  action. Otherwise name the scope and concrete action without the claim.
- **Verify:** Switch through all four subjects and inspect the focus eyebrow, title, and button;
  none may claim a global recommendation and each button must match the returned action kind.

### LAW-19 🟡 — Do not express every hierarchy level as a card

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 applied-question review: a tinted prompt, a descriptive banner, and one
  bordered panel per reasoning step made a single task feel like several disconnected objects.
- **Why:** Repeated fills, borders, and radii create visual distance and imply interaction or state
  changes where none exist.
- **Comply:** Default to one warm-white question surface. Use alignment, spacing, type, and at most
  a restrained divider to connect dependent content. Add a box only when it identifies a control,
  feedback state, navigation boundary, or materially separate interaction.
- **Verify:** Inspect boss, case-fill, and match questions at desktop and 390 pixels. Prompt, cloze,
  boss-step, and match-row wrappers must be transparent and unboxed; no redundant descriptive strip
  may appear; controls and post-answer feedback must remain visibly bounded.

### LAW-20 🔴 — Held feedback must include every answer-shaped cue

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 generic-practice Browser pass: selected answers correctly withheld
  correctness, but a saved short answer initially exposed its rubric before the results screen.
- **Why:** A “feedback at the end” check becomes a different and easier task when criteria,
  exemplars, correctness styling, explanations, or evidence mutations reveal the answer early.
- **Comply:** In held-feedback mode, save responses without grading display or learning-state
  mutation. Reveal correctness, explanations, constructed rubrics, and exemplars only in the final
  review; keep written responses explicitly unscored.
- **Verify:** Complete recognition, application, generation, and mixed held-feedback checks. After
  every saved response inspect copy, classes, controls, rubric/exemplar visibility, and dashboard
  state; then confirm the complete review appears at results.

### LAW-21 🟡 — New release tooling must preserve legacy script semantics

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 release build: setting package-wide `type: module` made the existing
  CommonJS bank validator fail even though the new build script was the only ESM consumer.
- **Why:** A deployment wrapper can silently change how unrelated checked-in scripts load.
- **Comply:** Scope new module behavior with `.mjs` files or explicit per-file configuration; do
  not change package-wide semantics unless every existing script is intentionally migrated.
- **Verify:** Run syntax checks, the legacy bank validator, the release build, and release tests
  together after any package or module-loader change.

### LAW-22 🔴 — Confidence is diagnostic evidence, never a punishment or reward

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 research integration: an early direction considered grinding down
  confidence after confident errors, while universal confidence prompts also created ritual noise.
- **Why:** Humiliation, artificial difficulty, confidence rewards, and personality labels can
  distort reporting, reduce trust, and confuse metacognition with correctness.
- **Comply:** Sample confidence only on high-value diagnostic work after a response exists. Use
  behavioural anchors plus a penalty-free skip. Confidence may alter explanation and later
  diagnostic selection, never correctness, score, rewards, secret difficulty, or learner identity.
  Require at least 20 judgments across three blocks and two formats before provisional aggregate
  language.
- **Verify:** Confirm a routine item has no prompt; a sampled item stages the prompt after the
  response; skip enables checking with no penalty; and a confident error receives contrastive
  feedback plus later independent repair without difficulty or reward mutation.

### LAW-23 🔴 — Constructed self-review must not masquerade as automatic grading

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 research integration: adding short answers created pressure to convert
  browser keyword matching or rubric ticks into a correctness score.
- **Why:** A transparent practice aid becomes false precision when a thin client claims to judge
  reasoning quality it cannot validly assess.
- **Comply:** Require a substantive written response before showing criteria. Show the rubric
  before the exemplar in learning mode, record selected criteria as self-review, keep the response
  unscored, and exclude it from correctness percentages and independent Strong evidence. In
  held-feedback mode, reveal neither rubric nor exemplar until the final review. The only machine-
  marked exception is the explicitly enabled, source-bound local practice path governed by LAW-58;
  production and every abstention retain this self-review contract.
- **Verify:** Try empty and short responses, complete rubric self-review, inspect results and the
  concept dashboard, and confirm no automatic correct/incorrect label or Strong promotion exists.

### LAW-24 🔴 — Held-feedback practice must not mutate learning evidence before review

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 research integration: hiding answer explanations was insufficient because
  early attempt persistence could still reveal correctness through dashboard state.
- **Why:** A learner can leak the answer or mastery result by leaving a supposedly held-feedback
  check before its final review.
- **Comply:** Stage all selected and constructed responses inside the active session. Before the
  final screen, show neutral save confirmation only and do not write attempt evidence, correctness
  classes, rubrics, exemplars, or explanations to the learner profile.
- **Verify:** Save right and wrong answers, leave before completion, inspect dashboard evidence,
  resume, then finish; no answer-shaped cue or progress mutation may appear before final review,
  and the complete review must appear afterward.

### LAW-25 🔴 — A client-side bank is never perfect anti-scraping

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 tester-protection design: the owner wanted to prevent unrelated students
  scraping the authored bank, while the browser-local scheduler necessarily downloads its bank
  scripts after access.
- **Why:** Obfuscation, `robots.txt`, cache headers, or login language can create a false DRM claim;
  an approved technical user can still save any bytes their browser receives.
- **Comply:** Prevent anonymous access with individual identity, revocation, no-index responses,
  private caching, audit logs, and rate limits. State the authorised-user limit plainly. Require
  server-side per-session item delivery before claiming stronger scrape resistance.
- **Verify:** Confirm anonymous denial, approved access, one-person revocation, no-index/private-
  cache headers, and rate-limit behavior; inspect the shipped assets and document every complete
  content bundle still delivered to an authorised browser.

### LAW-26 🟡 — Git Bash packaging requires POSIX-style absolute paths

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 Sites packaging on Windows: passing `C:/...` to a Bash/tar helper made tar
  parse `C:` as a remote host and fail; `/c/...` succeeded.
- **Why:** A valid Windows path can change meaning inside a Unix-compatible tool and block a
  release after its build has already passed.
- **Comply:** Convert project and archive paths to Git-Bash `/c/...` form before invoking Bash
  packaging helpers. Keep the resulting archive outside the repository.
- **Verify:** Package from a path containing spaces, inspect the archive file count and hosting
  metadata, and confirm the saved version references the same pushed commit.

### LAW-27 🟡 — Owner-visible release metadata must live in the served asset root

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 production Control Room pass: the packager retained
  `dist/release-manifest.json`, but the static asset service exposed only `dist/client`, so health
  passed while the dashboard truthfully reported the release manifest unavailable.
- **Why:** Metadata can exist in an archive and still be unreachable to the production UI that
  depends on it.
- **Comply:** Write owner-visible metadata into the static client root as well as any packager root
  location. Keep the file private-cacheable and free of credentials or tester identities.
- **Verify:** Open the deployed owner dashboard, confirm health and manifest both pass, inspect the
  exact asset count, and request the manifest through the production origin rather than the local
  filesystem.

### LAW-28 🔴 — Prepared agents stay inert until every consent and authority gate passes

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 cohort-agent scaffold: useful roles could be described before their
  consented backend, retention/deletion flow, owner review queue, or external-action adapters
  existed.
- **Why:** A polished charter can conceal that an agent has no lawful data source or authorised
  action path.
- **Comply:** Keep `enabled: false`; any deployment-ready schedule must remain stored as `PAUSED`.
  Accept only versioned pseudonymous events, reject undeclared identity/raw-response fields, emit
  proposals rather than external actions, and fail activation until every declared gate plus
  explicit owner approval passes.
- **Verify:** `npm run agents:check` passes scaffold health; `npm run agents:activation-check`
  fails; every stored scheduler status is `PAUSED`; no run record exists; synthetic events
  validate; personal/raw fields are rejected.

### LAW-29 🔴 — Requested automation status is not evidence of persisted status

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 agent registration: the automation create call accepted `PAUSED` but the
  first persisted TOML definitions were `ACTIVE`.
- **Why:** Trusting requested arguments can start a consequential schedule while the product still
  lacks consent, data and authority gates.
- **Comply:** Immediately read the stored automation definition after create/update. If it differs,
  explicitly update the existing automation to `PAUSED`, re-read it, and confirm no run artifact
  exists. Repository preflight remains a second independent lock.
- **Verify:** All three stored definitions say `status = "PAUSED"`, `.agents/deployment.json` says
  `enabled: false`, `npm run agents:activation-check` exits nonzero, and the automation directory
  contains no run output.

### LAW-30 🔴 — Tester access credentials and authority never enter browser code

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 direct tester-management implementation: making add/revoke convenient
  could tempt a browser-side Cloudflare API call or a merely hidden token.
- **Why:** Any tester or page visitor could extract a client credential and grant themselves or
  others access, revoke the owner, or widen the cohort policy.
- **Comply:** Keep Cloudflare and private-origin credentials in edge secrets only. Protect the
  management endpoint with the narrower admin Access application, validate its JWT audience and
  exact owner email, require same-origin writes, retain the owner bootstrap rule, and reject
  mixed-selector groups instead of editing them.
- **Verify:** Source/manifest scans contain no credential; missing bindings return 503; missing
  owner authentication returns 403; grant/revoke tests preserve the owner; unsafe-selector tests
  return 409; mutation logs contain only action and count.

### LAW-31 🔴 — A broader Access app must never absorb owner routes

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-11 protected-domain deployment: `/dungeon*` serves testers while
  `/dungeon/admin*` mutates the tester allowlist.
- **Why:** A missing or less-specific owner application, or an admin asset that escapes the admin
  path, could expose operational controls or issue the learner JWT where the Worker expects the
  owner audience.
- **Comply:** Keep a more-specific owner application with a distinct audience; keep all dashboard
  HTML/CSS/JS/API paths under `/dungeon/admin*`; block legacy `/dungeon/mock/admin*` and
  `/dungeon/app/admin*` aliases; and
  validate both the admin audience and exact owner email inside the Worker.
- **Verify:** Anonymous edge redirects show different learner/admin audience IDs; routing tests
  prove direct admin aliases return 404; missing/wrong owner authentication returns 403; real-
  Browser acceptance confirms a tester cannot reach the owner surface.

### LAW-32 🟡 — Compound verification must not hide an earlier native-command failure

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 deployment verification: root build/test commands were accidentally run
  from `cloudflare/`, failed, and a later successful dry run made the compound shell exit zero.
- **Why:** The final process exit can make a verification transcript look green while an earlier
  required check never ran.
- **Comply:** Run checks from their declared working directories and either execute them separately
  or fail immediately after any non-zero native exit. Never infer a whole chain passed from only
  its final exit code.
- **Verify:** The final evidence names each command, working directory, and individual result; the
  root build/test/bank commands and the Cloudflare dry run all pass in their correct directories.

### LAW-33 🟡 — A dry-run-capable Wrangler shell may still be unable to deploy

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 exact-domain release: Wrangler built and dry-ran successfully, but its
  non-interactive production deploy exited before mutation because `CLOUDFLARE_API_TOKEN` was not
  available to that process.
- **Why:** Build success does not prove deployment authority, and improvising with a temporary
  workers.dev URL could create an unintended public surface or make a release irreproducible.
- **Comply:** Check non-interactive deployment authentication before the live step. Never use
  `--temporary` for production. Keep a checked-in standalone packager that embeds only the built
  allowlist, and use an authenticated provider API path when Wrangler lacks authority.
- **Verify:** The normal dry run and standalone bundle both pass; the live script version, exact
  route, Access applications, DNS record, disabled workers.dev surface, and anonymous denial are
  read back after deployment.

### LAW-34 🟡 — Owner status checks must stay inside the owner Access path

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 exact-domain Browser pass: the Control Room loaded under the admin Access
  application, but its `../health` and `../release-manifest.json` requests crossed into the broader
  learner application and appeared unavailable.
- **Why:** Two valid Access sessions can still use different audiences; crossing policy paths can
  make a healthy release look broken or prompt the owner for the learner login unexpectedly.
- **Comply:** Keep owner dashboard assets, APIs, health, and release metadata under
  `/dungeon/admin/*`; validate the admin audience at the Worker; retain local fallback URLs only
  outside the production prefix.
- **Verify:** Unit tests assert both owner status routes use the admin audience, and the real
  Control Room reports Healthy, Connected, and Allowlisted after deployment.

### LAW-35 🟡 — Access denial copy must fit the provider and resist email enumeration

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 learner-login repair: Cloudflare rejected the first custom denial because
  it exceeded the provider's 75-character limit.
- **Why:** An overlong message silently blocks configuration progress, while pre-verification
  “registered/not registered” feedback would expose the private allowlist to arbitrary visitors.
- **Comply:** Keep the Access custom denial at 75 characters or fewer. Let every visitor request an
  inbox code, and reveal the ask-for-access result only after they prove email ownership.
- **Verify:** Read back the configured message, allowed IdP, auto-redirect setting, group policy,
  and exact-email selectors; confirm the Control Room lists only intended non-bootstrap addresses.
- **Amended 2026-08-11:** the learner path no longer uses an emailed code, so the provider
  character limit applies to the owner application only. The enumeration half stands and now binds
  the Worker: an unapproved email gets one fixed private denial that never distinguishes
  “not on the list” from “wrong address”, and the allowlist is never returned to a learner.

### LAW-36 🟡 — An author element selector can silently defeat the `hidden` attribute

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-11 live agreement-screen Browser pass: `app/login.css` declared
  `form { display: grid; }`, which outranks the user-agent `[hidden] { display: none }` rule. The
  email form reported `hidden === true` while still painting 174 pixels of stale controls beneath
  the agreement step.
- **Why:** The DOM, the accessibility intent, and the pixels disagree. A screen that looks
  dismissed is still operable, and a step meant to be a hard gate reads as optional.
- **Comply:** Every stylesheet that sets `display` on an element or shared class selector must also
  carry `[hidden] { display: none !important; }` near the reset. `app/t6.css` is the reference.
- **Verify:** After any screen-swap change, assert in a real Browser that each element toggled
  `hidden` measures `getBoundingClientRect().height === 0`. Property state alone is not evidence.

### LAW-37 REDLINE — Teaching support must never masquerade as mastery evidence

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-11 adaptive-primer integration: the first implementation path called the
  ordinary attempt recorder before the primer-only branch was corrected.
- **Why:** A learner can select an answer immediately beside the supplied fact. Counting that as
  correctness would inflate progress, cohort accuracy, and Strong evidence from assistance rather
  than retrieval.
- **Comply:** Store primer state separately; exclude primer-only surfaces from active scored pools,
  concept attempts, result percentages, cohort analytics, and held-feedback simulations. A primer
  may change only how much support appears next time.
- **Verify:** Bank validation keeps 565 active scored items while accepting 64 support-only primers;
  Browser acceptance follows primer -> challenge; source/tests confirm `recordPrimerAttempt` is the
  only primer mutation and simulation queues contain no primers.

### LAW-38 REDLINE — A private external invite cannot be embedded in anonymous assets or called proof

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-11 WhatsApp-gate review: the supplied invite was initially hard-coded in
  anonymous `login.html`, even though only approved testers should receive it.
- **Why:** Hidden markup is still public source, and a browser click cannot prove membership in an
  external WhatsApp group.
- **Comply:** Return the invite only after an approved email reaches the agreement `428`; keep it
  absent from anonymous login HTML/JS. Disable join acknowledgement until the link opens, require a
  separate self-attestation, and label the limitation. Bump records state and copies a message; it
  never claims to send or verify membership.
- **Verify:** Release tests scan anonymous login assets for the invite token; Worker tests require
  open-before-acknowledge; Browser checks the disabled/enabled transition and limitation copy.

### LAW-39 WATCH — Randomised pools can invalidate a deterministic scenario's assumed first item

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-11 primer Browser acceptance: the level-3 fixture seeded the catalogue's
  first concept, but the study-set selector chose a different first item and rendered level 1.
- **Why:** A green-looking URL fixture can silently stop representing the state named in its URL as
  pool selection evolves.
- **Comply:** Bind scenario overrides to the queue item selected at runtime, after randomised or
  least-recent selection has completed.
- **Verify:** Reload `?scenario=question-primer-recovery` and require the visible level-3
  application and misconception layers, not merely the scenario parameter.

### LAW-40 REDLINE — A consent gate checked only at login is not enforced

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-11 Control Room read: six testers showed `Signed in`, `Has progress`, and
  `Not agreed yet` at the same time. They had accepted agreement `2026-08-11`; the deployed version
  required `2026-08-11-community-v2`. The version was compared only inside the login handler, so
  live sessions kept full learner and progress access under superseded terms for up to a day.
- **Why:** A terms change that the product never asks the current cohort to accept is not a terms
  change. Session lifetime silently becomes the enforcement delay.
- **Comply:** Carry the accepted version on the session lookup and re-check it on every
  authenticated request. Reject a stale session with its own code so the learner returns to the
  agreement step; never rely on cookie expiry to deliver a consent change.
- **Verify:** Sign in, change the stored accepted version underneath the live session, then call
  the identity and progress routes; both must fail with `AGREEMENT_REQUIRED`. `tests/cloudflare-access.test.mjs`
  covers this.

### LAW-41 WATCH — Answer feedback must outrank selection styling, including `:has()`

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-11 match-format Browser pass: a wrong selection kept the blue selected fill
  because `.choice:has(input:checked)` inherits the specificity of its argument and outranks the
  later `.choice.wrong` rule.
- **Why:** The learner reads their incorrect answer as merely chosen. Correctness must never be
  the weaker signal.
- **Comply:** Restate the checked case on every resolved-state rule
  (`.choice.wrong, .choice.wrong:has(input:checked)`), or keep selection styling at lower
  specificity than feedback styling.
- **Verify:** After answering a match, cloze, or boss question, read computed `backgroundColor` on
  the selected wrong control; it must be the error fill, not the selection fill.

### LAW-42 WATCH — A scroll reset and a scroll target cannot both be smooth

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-11 homepage builder: `showScreen` calls `window.scrollTo(0, 0)`, which
  becomes an animation under `html { scroll-behavior: smooth }` and outlived the following
  `scrollIntoView`, so "Mix your own practice" highlighted and focused the builder without moving
  the page.
- **Why:** The action looks broken while the DOM state says it worked, and the failure disappears
  in synchronous tests.
- **Comply:** Skip the screen reset when the target screen is already active, and issue the scroll
  to the destination on the next animation frame after focus.
- **Verify:** From the top of the dashboard, activate the control and assert `window.scrollY`
  actually changed after the animation, not merely that focus moved.

### LAW-43 REDLINE — A machine tag that reaches a learner must read as a sentence

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-12 diagnosis audit: `question.misconceptions` held internal strings of the
  form `"selected-belief:" + optionText`, and `evidence.reasons` interpolates that tag into learner
  copy rendered in the concept inspector. A learner repeating an error across two variant families
  read `The same misconception returned across independent evidence: selected-belief:It estimates
  the total market before speaking to buyers.`
- **Why:** It leaks internal vocabulary into the learning view, which the standing owner rule
  forbids, and it makes a correct diagnostic signal look like a bug at the exact moment the learner
  most needs to trust the feedback.
- **Comply:** Any field that can be interpolated into learner-visible copy is written as a readable
  noun phrase, never `prefix:payload`. Where a field must serve as both a machine key and display
  text — as the diagnosis `tag` does — the readable form is the key. Keep it stable once shipped: a
  reworded tag silently resets recurrence detection.
- **Verify:** Grep learner-facing render paths for interpolated identifier fields, then answer the
  same question wrongly twice across two variant families and read the concept inspector.

### LAW-44 REDLINE — Index a per-option value by the option, not by the part

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-12: multi-part evaluation read `misconceptions[partResults.indexOf(false)]`,
  mixing two coordinate systems. `misconceptions` was built per option, but was indexed by failing
  part. For a single-blank cloze that index is always `0`, so all four wrong options reported the
  same diagnosis.
- **Why:** It fails silently and plausibly. Feedback still appears, still looks specific, and is
  simply about a different mistake than the one made — which is worse than no feedback, because the
  learner has no reason to doubt it.
- **Comply:** Reaching a per-option value in a multi-part item takes two coordinates: the failing
  part, then the option selected within it (`partDiagnoses(question, part)[selected[part]]`). Never
  index an option-keyed array with a part index.
- **Verify:** Answer a single-blank cloze wrongly with each distractor in turn and assert the
  rendered diagnosis differs each time.

### LAW-45 🟡 — A draggable object must not be wider than the target it drops into

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-12 UI pass: match label tablets were sized by their own text
  (`193/268/191/266`px) while every slot was `162px`, so the object being picked up was visibly
  larger than the hole it belonged in, and the tray wrapped 3-then-1 into a ragged block.
- **Why:** The affordance contradicts the interaction it is teaching, and content-sized controls in
  a wrapped flex row will always look accidental when the content varies in length.
- **Comply:** Give a drag source and its drop target the same grid track. Share the track variable
  from a common ancestor (here `--statement-count` on `.match-board`) and match the gaps, so the
  columns compute identically instead of merely looking similar.
- **Verify:** Measure both sets in the browser: each source's width must equal its target's, and
  their left edges must be equal to the pixel at desktop and at 375px.

### LAW-46 🟡 — A layout probe must prove a defect on a settled layout before it is fixed

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-12 UI pass: a row-detecting audit flagged `.momentum-figure` as wrapping
  because `align-items: baseline` gives items of different heights different `top` values on one
  visual row, and reported sub-44px touch targets that existed only in mid-render states.
- **Why:** Acting on an artifact damages a working layout, and the change is hard to argue back out
  because it was made in the name of an audit.
- **Comply:** Detect rows by baseline-corrected geometry rather than raw `top`, and re-measure any
  finding on a settled layout before changing anything. Record rejected findings alongside accepted
  ones so the reasoning survives.
- **Verify:** Re-run the probe after the layout settles; a real finding reproduces, an artifact does
  not.

### LAW-47 🔴 — A scored question may not precede the teaching of the lecture it cites

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-12 teaching layer. A cold learner's first contact with every concept was a
  graded item. Measured: a case question's own primer introduced 19% of that case's vocabulary on
  average, and none of it in 10 of 64 cases. Learners reported guessing, which was the correct
  response to the material as presented.
- **Why:** Scoring someone on words nobody gave them measures prior study, not learning. It also
  poisons the evidence model: the mastery matrix reads "Needs practice" for a gap the app created.
- **Comply:** `layeredQueue()` places a lecture's lesson ahead of the first scored question citing
  it, ahead of the primer. Any scheduler that reorders the queue — `ensureReattempt()` today — must
  carry pending lessons with the question it moves, and must never select a lesson as a question.
  **Every surface is gated on its own `sourceIds`, never on the surface it accompanies.** A primer is
  separately authored and cites different lectures than the question it introduces; inheriting the
  question's lectures silently exempts it.
- **Verify:** Build a session in the browser and read the queue: for every scored item **and every
  primer**, each lecture in its own `sourceIds` that has a lesson appears earlier in the queue or is
  already in `profile.lessonsRead`. Run it across all study sets and the mixed builder, from an empty
  `lessonsRead` — the strictest case — not just the first set.
- **Recurrence 2026-08-12 (same session, caught by that verify step):** the gate computed pending
  lessons for the scored question only, then pushed the primer without checking it.
  `brgsa_m1_demand_primer` cites M01-L01 while the `survey_bias` it introduces cites M01-L05, so the
  primer ran at step 4 against a lesson that did not arrive until step 9. The code comment claimed
  the primer was covered — "ahead of the primer too, because the primer assumes the vocabulary the
  lesson introduces" — while the implementation never looked at it. Fixed by extracting `teachFirst`
  and calling it for the primer on its own terms. **A comment asserting an invariant is not the
  invariant; only an executed check is.**

### LAW-48 🔴 — Distractor relevance is a constraint, not a residue of length matching

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-12. `comparableWrong()` sorted every candidate by word-count distance to defeat
  the "longest option is correct" cue, which systematically evicted authored same-concept wrong
  answers (short, pointed) in favour of other concepts' decision sentences (long, template-shaped).
  59 of 64 case questions ended up with zero same-concept distractors.
- **Why:** A question whose distractors come from other topics is answerable by topic matching and
  unanswerable by reasoning. It teaches nothing whether the learner is right or wrong, and it reads
  as arbitrary — the same failure the length cue was fixing, pointing the other way.
- **Comply:** Fill distractors from the same concept first. Treat the option-shape guard as a
  constraint to satisfy, not a ranking: trade the shortest relevant option for a length-matched
  foreign one only while the set would otherwise cue the answer, one swap at a time.
- **Verify:** Every case-cloze decision blank keeps at least two same-concept distractors, and
  `tools/validate_t6_bank.js` reports zero "exposes the correct … by option length" errors.

### LAW-49 🟡 — Course vocabulary is decided by the transcripts, not by the concept index

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-12. A shipped correct answer used "pre-registered stopping rule"; "stopping
  rule" appears 0 times in 50 BRGSA transcripts, which say *pre-registered decision rule*. When the
  gate was first built on `indexes/*_CONCEPT_INDEX.tsv` it reported "sample size" as first seen in
  M02-L03 — the lecture *titled* "Sample Size Logic" is M02-L02.
- **Why:** Inventing terminology recreates the original defect one layer up: the learner is tested,
  or taught, in words the course never uses. The concept index is explicitly a retrieval candidate
  list in the pack's own README, so treating it as authority produces false positives and negatives.
- **Comply:** Measure first use against the lossless `graph_source/` chunks in course order. A lesson
  may not define a term earlier than the course uses it. Plain-language labels for unnamed ideas are
  allowed but surface as warnings for confirmation.
- **Verify:** `node tools/validate_t6_bank.js "<pack>"` with zero errors; `--vocab-report` for the
  answer-copy review list, which is opt-in because n-gram scanning cannot separate terminology from
  ordinary English.
- **Origin instance closed 2026-08-12:** rewritten to *"Run the test to completion at the
  pre-calculated sample size"*, the M02 lecture's own words. The law stays ACTIVE — it governs the
  233 lectures still unauthored.

### LAW-51 🔴 — `title` is not a tooltip; a hover affordance must answer focus and touch too

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-12, reported by the owner: "the hovers on 'i's around the site don't actually
  show anything." Seven affordances shipped explaining themselves only through the native `title`
  attribute — two `.info` markers, the negative-marking flag, and four exam-slot marks on the
  subject cards. `title` waits about a second before it appears, never appears on keyboard focus,
  and never appears on touch at all. Each marker was drawn with `cursor: help`, a hover colour
  change, and a `:focus-visible` ring, so it promised an explanation to three input methods and
  delivered to at most one — and only to a mouse that stopped moving. Every explanation in the app
  was unreachable on a phone.
- **Why:** `title` reads like a tooltip API and is not one. It is a last-resort accessible-name
  fallback rendered by browser chrome, with no styling, no focus behaviour, and no touch behaviour.
  Nothing in the markup shows the gap: the attribute is present, so the code looks finished.
- **Comply:** Explanatory content goes in `data-tip` and is rendered by the shared `.tip` bubble in
  `app/t6.js`, which opens on hover after 120ms, on focus immediately, and on tap. The trigger keeps
  its own `aria-label` (or its parent control's) so assistive technology is unaffected and the text
  is never announced twice. A `title` on a non-form element is now a defect.
- **Verify:** In the page, `document.querySelectorAll('[title]').length` is `0` on every screen, and
  every `[data-tip]` trigger opens the bubble under a synthetic `focusin` as well as `pointerover`.
  Note that `element.focus()` does not dispatch focus events while the Browser pane is not
  compositing, so test focus with a dispatched event, not with `.focus()` (see LAW-46's lesson about
  probe artifacts).

### LAW-52 🟡 — A scale documented in a comment is not a scale; it drifts back within one session

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-12. `app/t6.css` carried a comment declaring a deliberate four-step corner
  scale — written when sixteen radii were consolidated to four — and by this session the file held
  **nineteen** literal `border-radius` declarations again (2, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 20,
  21, plus three spellings of a pill). The same file had eighteen literal `font-size` values, two of
  them 9px and 10px, which a phone is where anyone actually has to read.
- **Why:** A comment describes an intention; a token enforces one. Each new rule was written by
  copying a nearby value, and no check compared a declaration against the documented scale, so drift
  cost nothing at the moment it happened and was invisible afterwards.
- **Comply:** Every corner is `var(--r-mark | --r-control | --r-card | --r-panel | --r-pill)` or
  `50%`; every size below reading size is `var(--t-micro | --t-small | --t-meta | --t-body)`. A new
  literal means the scale is wrong and needs a step, not that this rule is special.
- **Verify:** `grep -oE 'border-radius: [^;]+;' app/t6.css | grep -v 'var(--r-' | grep -vE '50%|: 0;'`
  prints nothing, and `grep -oE 'font-size: [0-9.]+px' app/t6.css` prints nothing below 15px. The
  rendered check is `tools/browser-checks/ui-audit.js`, whose `radiiOffScale` must be empty.

### LAW-53 🔴 — A scored section a candidate can beat without knowing anything is a broken section

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-08-12. All eight authored SPMS multiple-select items carry **3 correct options of
  4**. Under the paper's own rule (+1 right, −1 wrong, floored at zero, capped at the question's
  marks) ticking every option scores `min(2, 3−1) = 2` — full marks. Verified in a real browser:
  ticking all four options on all eight Section B questions, and answering nothing at all in Section
  A, returned `Section B 16 / 16`. The examiner was simultaneously displaying the paper's stated rule
  that *choosing every option is strictly worse than choosing only the ones you are sure of*, and the
  results dashboard was calling the exploit rational: "Ticking generously is rational on this shape."
- **Why:** The marking rule and the item shapes were authored separately and never multiplied
  together. A negative-marking rule only creates a trade-off when wrong options are common enough to
  make a speculative tick cost more than it pays; at 3-of-4 the floor absorbs the only wrong tick
  available. Nothing in the bank validator looks at the *interaction* between a section's rule and
  its items, so the section validated item-by-item while being collectively free.
- **Comply:** Any section with a per-question marking rule states, in the same place, the item shapes
  that make the rule bite, and the shapes are authored to a spread rather than a constant. Where a
  mock's items do not reproduce the trade-off, the product says so to the candidate rather than
  letting them find it — a discovered exploit becomes a habit, and the habit is what costs marks in
  the real paper.
- **Verify:** For every negatively marked item, `min(marks, max(0, correct − (options − correct))) <
  marks` must hold for at least some items, or the section is free. The examiner computes exactly
  this (`negativeMarkingAnalysis`, `exploitable`) and renders a defect warning when it is true for
  every item; the warning appearing at all means the bank still needs fixing.

### LAW-54 🟡 — A count beside a grid must be counted over the same set the grid is showing

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-12. The examiner's question palette showed one section (35 chips for SPMS
  Section A) while its legend counted the whole paper, so the rail read "42 Not visited" above a grid
  of 35. Caught from a screenshot, not from the DOM checks — the two numbers were individually
  correct and only the pairing was wrong.
- **Why:** The legend and the palette were rendered in one function from two different collections;
  the section filter was applied to the grid and, being two lines further down, never reached the
  tally above it. Each number is defensible alone, which is why review passes over it.
- **Comply:** Derive a summary and the thing it summarises from the *same* array in the same scope.
  If the grid filters, the count consumes the filtered result, not the source.
- **Verify:** In the running paper, the legend's counts sum to the number of palette chips on screen,
  in every section. Checked live for SPMS Section A (`4+0+31+0+0 = 35`, then `12+1+21+1+0 = 35`) and
  Section B (`8+0+0+0+0 = 8`).

### LAW-55 🟡 — An API that defers your DOM change makes the DOM a stale reading, and its promises reject on ordinary outcomes

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-13. Both halves showed up within minutes of each other on the Learn/Exam
  switch, which navigates inside `document.startViewTransition`. (a) A transition that is skipped
  before it animates — a background tab, a window not compositing, a second press during the first —
  rejects `ready`. Nothing was attached to it, so a perfectly working app printed twelve
  `InvalidStateError: Transition was aborted because of invalid state` lines. (b) The update
  callback runs a frame or two later, so during that gap `documentElement.dataset.mode` still said
  the side you had just left. A second press inside the gap compared against it, concluded "already
  there", and returned — pressing Exam then Learn quickly landed you on Exam.
- **Why:** Both are the same shape. The DOM is normally a truthful record of what the user asked
  for, and these APIs break that for a few frames by design. Guarding on the DOM inside that window
  reads intent that has not landed yet; ignoring the promises treats an expected outcome as
  impossible.
- **Comply:** Keep the intent in a variable for the life of the deferred call (`pendingMode`) and
  guard on `intent || domState`, not on the DOM alone. Attach a no-op `catch` to any promise the
  platform rejects on a *normal* path — but only that one: a promise that rejects because *your*
  callback threw must stay uncaught, or a real fault goes silent.
- **Verify:** Press the control twice as fast as the harness allows and assert the *last* press
  wins; press three times and assert the same. Listen for `unhandledrejection` across the whole
  interaction and assert zero. Both are cheap and neither is visible to a single-press test.

### LAW-56 🟡 — In a browser that is not compositing, an animated property reads as its start value

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-13. Verifying the switch in the Browser pane while the pane was not displayed:
  the thumb's computed transform stayed `matrix(1, 0, 0, 1, 0, 0)` at 60ms, 340ms and 1500ms after
  the press, and the two labels' colours read as exactly inverted — the unselected side wearing the
  selected colour. Both look precisely like a CSS defect, and one of them was "fixed" for several
  minutes before the cause was found. `document.timeline.currentTime` was `0` and stayed `0`.
- **Why:** An undisplayed tab composites no frames, so the document timeline never advances. Every
  CSS transition is registered and `playState: "running"`, and every one of them is pinned at t=0 —
  which is the value the property is animating *from*. `resize_window` and `screenshot` fail in the
  same conditions and for the same reason, which is the tell.
- **Comply:** Before trusting any reading of an animated property, check
  `document.timeline.currentTime`. If it is 0, drive the animation yourself —
  `getAnimations().forEach(a => a.currentTime = a.effect.getComputedTiming().duration)` — and read
  after that. For viewport-dependent layout, measure inside a fixed-width same-origin iframe, where
  media queries resolve against the frame rather than the dead viewport.
- **Verify:** The measured end state matches the geometry it should land on — for the switch, the
  thumb's centre within a pixel of the pressed label's centre, at every tested width.

### LAW-57 🔴 — Response speed may gate a claim, never the answer or the learner

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-13 measurement foundation. A new research direction proposed response latency
  as implicit evidence while the earlier evidence brief correctly prohibited inferring learner
  states from speed.
- **Why:** Raw latency is identified behavioural data once the profile syncs to D1, accessibility
  and interruption can make slow responses meaningless, and a fast expert response can be valid.
  Treating speed as correctness, confidence, effort, or ability would turn a weak signal into a
  learner judgement. Reloading a pre-selected response creates a second trap: the page sees only the
  time since reload and can falsely call an old answer instant.
- **Comply:** Time with a monotonic page-lifetime clock from render to explicit answer commit; save
  only the contract's coarse band and derived flags. A rapid response keeps its answer, feedback,
  misconception, and scheduling effects but cannot supply Strong evidence or erase Strong evidence
  already established by eligible attempts. Evaluate the latest-answer Strong gate against the
  newest eligible attempt; an incorrect rapid answer still reaches the ordinary error gates because
  speed never invalidates correctness. Never penalise
  slowness. Historical untimed attempts stay eligible. A restored complete response is `unknown`,
  not rapid. Keep the threshold provisional until real item/format evidence exists.
- **Verify:** In an isolated Browser fixture, an otherwise Strong body with a rapid fifth response
  stays Developing and names the reason; the same evidence without the flag becomes Strong. A
  correct response inside the threshold records the rapid reason, one outside it does not, and an
  immediately committed restored response also does not. Add a later rapid-correct response to an
  already Strong body and confirm it remains Strong; change that response to incorrect and confirm
  ordinary error rules still apply. Search the profile-writing path for raw millisecond fields and
  find none.

### LAW-58 🔴 — A local model earns criterion authority only through bounded evidence and abstention

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-13 local judgement slice. The owner authorised Qwen to check candidate written
  answers, which would otherwise let fluent output become an unexplained grade and make a laptop a
  covert production dependency. The first real-checkpoint pass also returned academically usable
  content but wrapped an exact candidate quote in `The candidate states ...`; accepting that wrapper
  would have made the purported evidence something the learner never wrote.
- **Why:** The model can hallucinate course claims, obey prompt injection inside an answer, invent a
  citation, produce malformed output, or repeat the same mistake in a second pass. A loopback server
  that binds to the LAN can also accidentally expose candidate answers or model access. Even a
  correct practice mark is not calibrated mastery or an official IIMB grade.
- **Comply:** Enable the grader only by explicit local launch after the owner approves the exact
  configured model ID and that ID is repeated in the approved-model setting; an ID mismatch keeps
  the HTTP authority absent. Keep exact-ID approval distinct from quality calibration: a provisional
  owner-local path may run while plainly `WAITING_LOCAL_MODEL_CALIBRATION`, but it cannot be called
  academically verified until the owner-marked gate passes. Accept grading calls only from a
  loopback client and same origin, one at a time; keep LM Studio itself on loopback. Retrieve only
  the question's declared lecture IDs, including the applied lecture that authored the case and
  decision rather than only the concept's opening lecture. Exclude candidate wording from retrieval
  so evidence can be prepared before submission. Treat the answer and retrieved text as untrusted
  data. Run one compact criterion judgement, then validate its complete schema, English-only output,
  citations against the actual retrieval, and awarded answer evidence as a raw literal substring of
  the submitted answer; abstain on uncertainty or any failed check. A second generation from the same
  checkpoint is an audit/calibration option, not a per-answer authority requirement. Label the model
  and authority boundary. Keep the attempt `scored:false`, prohibit Strong
  evidence and all feedback while an examiner paper is running. Post-submit examiner review may use
  the same authority only after the score and paper state are frozen; its misses may prioritise
  repair, while its successes never close gaps or award mastery. Schedule repair only from an
  accepted missing criterion. Keep criterion outcomes in a separate written-practice profile, not
  concept mastery. Require every `not_met` result to select one or two server-owned gap codes for
  that rubric criterion, distinguishing a missing move from a misunderstood one; free-form model
  prose never enters the corrective pool. A miss may open a bounded confirmation counter, insert an unscored deterministic repair, and target the next fresh
  authored written prompt; it may not infer a permanent ability trait or close from merely showing
  the lesson. Require two later accepted criterion successes to close a newly opened gap.
  Treat an in-flight model call as page-lifetime state: leaving or reloading cancels its authority,
  ignores any late result, and restores the saved answer as ready to check rather than a permanent
  spinner. For an awarded criterion, require the shortest raw literal substring from the submitted
  answer—no prefix, commentary, or added quotation marks. Keep `answerEvidence` empty for
  `not_met` and `uncertain`; do not loosen the validator to rescue persuasive model prose.
- **Verify:** Unit-test answer-independent source-bound retrieval, prompt-injection placement and uncertainty,
  invented citations, schema validation and repair routing. Through the real local HTTP and Browser
  path, confirm health is opt-in, missing or mismatched model approval returns no grader route, the result names the model and citations, a missing criterion
  queues a re-attempt plus an unscored repair and fresh-prompt confirmation, abstention creates no
  criterion evidence and reveals the self-review fallback, cross-origin POST is denied, and
  the public/normal local server exposes no grader route. Calibrate the real checkpoint separately;
  leaving during a delayed call must resume as ready to grade and ignore the late result. A fake
  OpenAI-compatible endpoint verifies plumbing only. Regression-test commentary-wrapped answer
  evidence as invalid. Record real-model latency and synthetic/adversarial smoke separately from the
  owner-marked 48-case gate, and never use a generated smoke set as its substitute.

### LAW-59 🔴 — Hosted answer checking must bind model, corpus, consent, and claim together

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-13 hosted written-authority slice. Moving the local Qwen contract onto the
  website creates four new failure classes at once: a different checkpoint can inherit local
  calibration it never earned; a stale or unfiltered vector index can become the source of truth;
  a public arbitrary-question endpoint can escape Dungeon's authored rubric boundary; and
  candidate answers can enter logs, storage, or unbounded paid inference.
- **Why:** “Qwen” is a family name, not evidence that two deployments behave alike. RAG only grounds
  an answer if retrieval is filtered to an approved corpus and its returned metadata is validated.
  A learner-facing judgement needs a Dungeon-owned prompt and rubric. Public inference also has a
  cost and privacy surface that the loopback path does not.
- **Comply:** The public route remains unavailable unless an explicit feature flag, exact configured
  and approved model IDs, exact corpus version, AI binding, and Vectorize binding all agree. Create
  metadata indexes before inserting transcript chunks; filter every query by course and corpus,
  and authored grading additionally by the server-owned lecture IDs. Exclude candidate text from
  retrieval queries. Validate returned metadata before putting it in a prompt. Use the same
  compact-judgement plus deterministic citation/schema/literal-answer-evidence contract as local marking, but calibrate the hosted
  checkpoint separately. Do not expose arbitrary-question coaching through the learner UI or public
  Worker API; internal evaluation tooling must never claim a numeric mark. Require an authenticated learner,
  same-origin POST, bounded JSON, daily per-email quota, updated tester consent, and a non-AI
  fallback. Store only the usage counter; never log or store candidate answer, retrieved text, or
  model output. Timed examiner papers never call the route before submission. An authored
  post-submit examiner review may call both the server-owned rubric route and the non-numeric coach,
  with question ID, lecture filters, quota, and the same no-storage boundary; arbitrary public
  questions remain unavailable. The browser never calls the
  Mac, Vectorize, or Workers AI directly.
- **Verify:** Unit-test disabled/mismatched activation, server-owned authored questions, course /
  corpus / lecture filters, 1,024-dimensional embeddings, invented citations, absent public coach
  output, same-origin and session boundaries, request size, quota exhaustion, and content-free
  metering. A Worker dry-run must show AI and Vectorize bindings while the committed vars stay off /
  unapproved / unindexed. Run the 48-case rubric set against the exact hosted checkpoint and actual
  Vectorize corpus before activation.
  Real-Browser acceptance must prove enabled, abstention, quota, mobile layout, and the manual
  fallback. Local calibration, mock bindings, or a non-empty index alone cannot close this gate.

### LAW-60 🔴 — Corrupted model script never reaches learner feedback

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-13 real-model Browser check. Qwen inserted stray CJK glyphs between otherwise
  English words in a suggested answer, making course guidance visibly corrupted.
- **Why:** Fluent surrounding prose can make an encoding/tokenisation defect look like a course term.
  Silently displaying it damages readability and trust; blindly stripping characters can join words
  or alter quoted candidate evidence.
- **Comply:** Tell every marking pass to write model-authored prose in English with plain ASCII
  punctuation. Validate generated feedback, reasons, summaries, strengths, gaps, and suggested
  answers for unexpected CJK scripts, while excluding exact candidate quotes from that check. Retry
  once with an explicit encoding-repair instruction; if corruption recurs, abstain and show the
  deterministic fallback. Apply the same contract locally and in Workers AI.
- **Verify:** Inject a CJK artifact into the first structured response and prove the second attempt is
  clean; inject it twice and prove the result abstains without returning corrupted learner copy.

### LAW-61 🔴 — A question that names an example must carry it, not borrow it from the lesson

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-14, owner screenshot. "In the drilling-machine example, select every need the
  purchase actually serves." — no drilling machine anywhere on the page, and options that then said
  "the certificate" and "more than a decade of study" as though something had introduced them. Four
  SPMS multiple-select items did this (drilling machine, Zerodha, ride-hailing MoSCoW, WhatsApp);
  the multi-select builder had no `caselet` field at all, so none of them could have shown one.
- **Why:** The authoring leaned on teach-before-test to supply the example, and that is not what
  LAW-47 guarantees. A lesson delivered four questions earlier is memory; a question is answered
  against what is on the page. Worse, the same items are SPMS Section B, and **the examiner delivers
  no lesson** — there the referent has never existed. One of the four was not in its lesson either,
  so it could only ever be answered from the transcript. The failure is invisible to every existing
  gate: the item validates, schedules, and marks correctly. It is simply unanswerable by reasoning.
- **Comply:** If a stem points at a specific example, case, product, company, or scenario, that
  question ships the example in `caselet`. Write it from the lecture's own clean transcript, and
  **withhold whatever the question asks the learner to supply** — a case that names the three layers
  is not a case, it is the answer set. Options, `answers`, and `diagnoses` stay unchanged, so the
  marking contract and any section shape spread are untouched. If a question family cannot carry a
  caselet, either give its builder one or do not write a referential stem for it. A stem that cites
  *"the lecture"* as authority for a framework ("as the lecture presents them") is a milder, separate
  problem and no caselet fixes it — rewrite it to ask what is true.
- **Verify:** Load the bank the way `tools/validate_t6_bank.js` does and scan every question with no
  caselet, twice: once for deictic phrasing (`the <X> example`, `this example`, `the lecture's <X>`,
  `the lecture uses/gives/presents/names`, `the case above`, `the same scenario`) and once for
  capitalised non-sentence-initial tokens minus framework acronyms, which catches an example no
  pattern anticipated. Every hit either shows its example or names no example. Then open one changed
  item on **both** surfaces — the learn question (`case-block.hidden === false`, kicker reads
  "Then decide") and the examiner (`.exam-caselet` present) — because they are separate render
  paths and the examiner is the one with no lesson behind it.

### LAW-63 🔴 — Support material never prints the answer to the question it supports

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-14, owner report — "a primer is just tapping the same mcq as the question
  verbatim" — measured while verifying the practice presets. Evidence:
  `evidence/2026-08-14/t6-practice-presets/verification.md`.
- **Why:** `renderPrimerPanel` prints `Know this: <primerFact>` directly above the options, and
  `addPrimer` sets `primerFact: data.summary` — the same string it makes the correct option. **64 of
  64 primers reveal their own answer on their own screen**, so the task is to find a sentence already
  on the page. The distractors cannot rescue it: they are other concepts' summaries, per the rule
  `t6_catalog.js` states for the whole bank — "distractors in this bank are not invented: they are
  borrowed from other concepts" — so with the panel covered the item is still answerable by
  topic-matching and unanswerable by reasoning, exactly what `relevantWrong()` fixed for case
  questions and was never applied here. The panel's four strings are also the correct answer to **493
  scored questions** across the bank; on a real fresh sweep, **14 of 16** SPMS questions had their
  answer printed on a screen the learner had already seen (BRGSA 0, SCLM 10, IBM 13). Nothing catches
  it: the primer creates no evidence, so it corrupts no score — it simply teaches nothing, and it
  spends the concept's first contact doing it.
- **Closed by:** the prediction primer, 2026-08-14. The panel now carries the case and withholds the
  rule; the learner commits a prediction in their own words; the principle arrives as the answer to
  it. Nothing is keyed, marked, or recorded as evidence, so there is no answer to print. Verified at
  `evidence/2026-08-14/t6-practice-presets/verification.md`.
- **Comply:** A support surface may print the *material* a principle is derived from — a case, a
  carry-forward, a named trap it has already fallen for — and must not print, before the learner
  commits, the answer to the question it is itself asking. Reveal it **after**, as the consequence of
  the learner's own reasoning. **Scope, deliberately narrow:** teaching a principle before a later
  scored question is LAW-47 doing its job, not a leak, and a rule forbidding it would forbid lessons.
  What this Law forbids is the same *surface* holding the question and its answer.
  If a support surface asks a keyed question at all, its distractors must be same-concept
  misreadings — a distractor borrowed from another concept makes the item topic-matchable and is not
  a distractor. Two collisions make that hard here and are worth knowing before designing one:
  `confusions` are already `_explain`'s distractors and `bridge` is already `_connect`'s answer, so
  asking for either moves the leak rather than closing it. Asking for a *prediction* — unkeyed,
  unmarked, no evidence — sidesteps the collision entirely and is what the primer now does.
- **Verify:** In the page, not in Node: only the running app knows what a panel renders. For every
  support surface, assert that no string on screen before the learner commits is a correct option,
  blank answer, or boss-step answer of any scheduled question sharing its `conceptId`, and that
  committing moves neither `conceptAttempts` nor `totalAnswers` — measured as a **delta across the
  commit**, since a run that answers scored questions between support surfaces has legitimate
  evidence by the second one. Then assert the reveal still carries what the panel withheld, or the
  fix has deleted the teaching rather than repositioning it.
  `tools/browser-checks/primer-prediction.js` does all of this over every concept in a subject.
- **Excluded, and reported separately:** the concept's own name. The layering copy has to print it —
  "Carry forward: <previous>. Now add <this>" is what makes a run read as a sequence — so **32
  scheduled questions per subject whose correct answer *is* that name** (`_term_cloze`, and the
  framework blank of `_case_cloze`) are answerable from orientation copy regardless of what any
  support surface does. That is a question-design problem, not a support-surface one; the check
  reports it under `answerableFromTheConceptName` rather than folding it into this Law.

### LAW-64 🔴 — Text has to fit the box that holds it, and the probe has to be able to see it

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-14, owner screenshot of the results ring: "16 scored questions" printed across
  the ring's own stroke. `tools/browser-checks/ui-audit.js` had reported that screen clean in the
  same session. Evidence: `evidence/2026-08-14/t6-practice-presets/verification.md`.
- **Why:** The probe measured the viewport edge, tap size, corner radii, paragraph length, font floor
  and row raggedness, and **nothing about whether content fits its container** — so the one class of
  defect a reader notices first was the one nothing could see. Two more were sitting behind it. The
  mastery key is `<i><b>Label</b> — description</i>`, three children in a row styled
  `grid-template-columns: auto minmax(0,1fr)`; a grid assigns columns per child, so at 375px the
  columns resolved to 274px and 28.7px, the bold label wrapped inside 28.7px and ran 19px past the
  panel, and its own description landed on the row below it. And the answer-review disclosures were
  23px targets, twelve to a review. A clean report from a probe that cannot see the defect class
  reads exactly like a clean screen.
- **Comply:** Never size a text container to the string it happens to hold today, and never put
  runtime-length text inside a round one — a circle is narrower than its box everywhere except the
  middle, so there is no width that can be guaranteed to fit. Put the caption outside the shape.
  Do not use `display: grid` or `flex` on an element whose children are an inline sentence: every
  child, including anonymous text runs, becomes an item and takes a cell. A hanging indent
  (`padding-left` + negative `text-indent`) is what "marker then flowing text" actually wants.
- **Verify:** `ui-audit.js` carries `clipped`, `circleFit` and `overlaps`, and every layout claim
  runs all three at 320, 375 and 1280 across each screen in fixed-width same-origin iframes.
  Measure **glyph runs** via `Range.getClientRects()`, never `scrollWidth`: `scrollWidth` on an
  inline box describes its containing block, so a wrapped `<b>` reports an overflow the width of its
  own second line and forty false findings bury two real ones. For a circle, test the chord
  `2·sqrt(r² − dy²)` at the text's height, using cap height either side of the run's centre rather
  than the line box — a 14px badge holding an 11px "i" on a 29px line otherwise reports its circle as
  zero wide. Exclude visually-hidden labels by **shape** (a ~1px box with `overflow: hidden` around a
  full sentence), not by class name, so the next one written is covered too.
- **Note:** the fix is the detector as much as the CSS. Three defects were live behind a probe that
  had reported those screens clean twice in the same session.
- **Recurrence 2026-08-15, and the reason it hid:** `.exam-legend li` is
  `grid-template-columns: 26px 1fr`, and `.exam-chip` carries `min-width: 44px` to meet the tap
  floor. The chip overflowed its own 26px cell, ate the 9px gap, and painted **9×17px across its
  own label** on all five legend rows at every width above the narrow breakpoint. It never showed
  at 375 because the narrow block already sizes the chip to 22px, and the 2026-08-14 sweep covered
  the dashboard, examiner **home** and lesson — never a paper mid-question. **A viewport sweep is
  only as wide as the screens it visits;** name the screens, not just the widths. Fixed by not
  inheriting the tap floor on a swatch: `li .exam-chip` was already `cursor: default`, which had
  been saying it is not a control for as long as the defect existed.
- **Note on tap size vs. layout:** raising something to 44px is a change to layout as well as to
  hit area. Every place a tap floor is applied inside a fixed grid track is a candidate for this,
  and the two rules never meet in the same file.
- **Recurrence 2026-08-15, twice, both found by the first real screenshots and neither visible to
  the probe.** Evidence: `evidence/2026-08-15/t6-harness-and-bank/verification.md`.
  **(a) The Bag launcher docked on top of the theme toggle during a paper.** The launcher is docked
  to the top-right on both the practice screen and a running paper, but the matching
  `padding-inline-end` that reserves its space was written for `.app-header` on practice and for
  `.exam-bar` on the paper — and the theme toggle lives in `.app-header`. Measured at 1280:
  launcher 1201–1247, toggle 1183–1227, so the bag covered all but 18px of a 44px control. This is
  F-01 (the bag over Submit) one bar higher up. `ui-audit.js` cannot see it: its `overlaps`
  detector compares text-bearing siblings, and these are two icon-only buttons in different
  stacking contexts.
  **(b) The subject cards laid themselves out differently depending on the bank.** `.course-head`
  is a wrapping flex row of code, negative-marking flag and date, with `margin-left: auto` pushing
  the date right. In a 186px card the content needs 166px and has 164px, so the date wrapped —
  but only on the one subject carrying the `-1` flag. SPMS's head measured 46px against 23px for
  the other three, so its date dropped to a second line and right-aligned under the code. Four
  cards in one rail, one laid out differently, because of a two-pixel overflow caused by a 21px
  chip only one subject has. `ragged` did not fire because the cards do share a height; the
  raggedness is *inside* them.
  **The general lesson:** a DOM audit compares things it knows are siblings. It cannot see two
  independently-positioned layers colliding, and it cannot see a layout that is *self-consistent
  but different from the card beside it*. Both are obvious in a picture and invisible in a
  measurement, which is the reason `tools/screenshot.mjs` now exists and the reason it does not
  replace `ui-audit.js`.

### LAW-65 🔴 — A blind file is blind by assertion, and the hole in a diagnosis array is an answer key

- **Tier/Status:** REDLINE · ACTIVE
- **Origin:** 2026-08-15, finishing the persona harness. `tools/browser-checks/export-run.js`
  attached `view._feedback` — the per-option diagnoses — to the candidate half of the export,
  directly beneath the comment *"Withheld from the candidate file and carried in the key."*
  Evidence: `evidence/2026-08-15/t6-harness-and-bank/verification.md`.
- **Why:** The array has a **hole at the correct option**: `validate_t6_bank.js` requires a
  diagnosis on every scored distractor and the answer carries none, so `diagnoses[answer]` is
  `null` in **216 of 216** single-answer MCQs. Printing it beside the options hands over the
  answer as reliably as the answer index would. The whole point of the blind file is that a
  persona's blindness stops resting on their choosing not to look — a leaked key silently
  restores the condition the previous run was criticised for, and every finding from that run
  becomes unfalsifiable. This is LAW-47's recurrence in a different file: *a comment asserting
  an invariant is not the invariant.*
- **Comply:** A candidate-facing export carries what is on screen **before the learner commits**
  and nothing else. Withholding is asserted in code, not in prose: walk the serialised candidate
  object for `answer`, `answers`, `diagnoses`, `rubric`, `exemplar`, `explanation`, `link`,
  `misconceptions`, `primerFact`, `tolerance`, `nearMisses`, `feedback`, and fail on a hit.
  Support surfaces get a second check by content, not by field name — a primer's rule must not
  appear on the primer's own step (LAW-63).
- **Verify:** `node tools/export-learn-run.mjs` exits non-zero on any leak and names the path it
  found it at. **Scope the content check to the surface**, not to the run: the first version
  searched every step for the primer's rule and fired on all eight primers in four subjects, all
  false — the rule is the concept summary, so it is legitimately the correct option of the
  `_explain` and `_repair_cloze` items later in the run, which is teach-before-test working.

### LAW-62 🟡 — One page load, one set: a rendered lesson is marked read in memory

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-14, measuring lesson order across all 40 study sets. The probe blanked
  `profile.lessonsRead` in `localStorage` before each set — exactly as
  `tools/browser-checks/teach-before-test.js` does — and reported 53 LAW-47 violations and 4 backward
  steps. Both were artefacts.
- **Why:** `renderLesson` calls `markLessonRead` the moment a lesson is displayed, deliberately, so a
  resume does not re-teach it. That write lands on the profile held **in memory**; the app reads its
  profile from storage once, at load. Blanking storage therefore changes nothing for the running
  page. Opening set 2 after set 1 gets a queue missing whatever set 1 displayed, and it compounds
  across a loop. The contamination is *order-dependent*, so it is not a constant offset that cancels
  between a before and an after — it varies with the ordering under test, which is the worst case
  for a comparison.
- **Comply:** Any probe that needs a first-time-learner queue opens **exactly one** run per page
  load: clear `lessonsRead`, reload, open one set, read `profile.active.queue`. To measure something
  across many sets in one session, measure a property that does not read `lessonsRead` — question
  selection and ordering do not — and say in the probe why that property was chosen.
- **Verify:** Assert `Object.keys(profile.lessonsRead).length === 0` immediately **before** the
  measured click, not at the start of the loop. If a multi-set loop is unavoidable, also read it
  after the loop and report it beside the result rather than assuming it stayed empty.
- **Note:** `teach-before-test.js` has this shape and still passes. Its result stands — a missing
  lesson can only add violations, never hide one — but it is measuring a thinner queue than a real
  first-time learner sees. It also skips set 10, whose card is labelled `P` rather than a number.

### LAW-50 🟡 — A lesson array closed with the wrong bracket is invisible until the file is parsed

- **Tier/Status:** WATCH · ACTIVE
- **Origin:** 2026-08-12. While authoring `app/sets/t6_lessons.js`, `explainer: [ … ]` was closed
  with `},` instead of `],` eight times across three authoring batches. Each occurrence threw a bare
  `SyntaxError: Unexpected token '}'` naming only the first failure, so a batch of six defects
  surfaced one at a time, and the validator could report nothing at all until the file parsed.
- **Why:** The lesson record mixes arrays (`explainer`, `glossary`) with objects (`worked`) at the
  same indent, so the closing bracket is the only thing distinguishing them and the eye supplies the
  wrong one. Authoring in large batches makes it systematic rather than occasional.
- **Comply:** After any batch edit to a lesson file, scan for the defect class directly rather than
  parsing and fixing one error at a time.
- **Verify:** `awk 'BEGIN{a=0} /^    (explainer|glossary): \[/{a=1;s=NR;next} a && /^    \},$/{print
  "BAD close "NR" (opened "s")"; a=0; next} a && /^    \],$/{a=0}' app/sets/t6_lessons.js` prints
  nothing, then `node tools/validate_t6_bank.js "<pack>"` reports zero errors.
