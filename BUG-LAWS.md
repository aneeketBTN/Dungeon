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
- **Origin:** 2026-07-16 source audit: `personalities.md`, `REVIEW_LOG.md`, `PROMPT.md`, prototype
  behavior, and newer product briefs overlap and sometimes differ.
- **Why:** Reading order can accidentally change product decisions.
- **Comply:** Follow `DESIGN_SOURCE_INDEX.md`; put unresolved contradictions in its conflict
  register before implementation.
- **Verify:** Every implementation plan names the source files and conflicts governing its slice.

### LAW-06 🔴 — Fresh-user testing must never erase real learner data

- **Tier/Status:** 🔴 · ACTIVE
- **Origin:** 2026-07-16 operating-system installation: current `state/` and `history/` may contain
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
  storage while the learning engine stores durable state under `state/` and `history/`.
- **Why:** A folder transfer can appear complete while onboarding, cosmetics, currency, or an
  unfinished prototype run silently remains on the old machine.
- **Comply:** Document storage boundaries in every machine-transfer handoff; never imply that
  browser-local profile data is included in the folder.
- **Verify:** The handoff names both storage systems and explicitly states which one resets.

### LAW-10 🟡 — Optional helpers must not auto-download executable dependencies

- **Tier/Status:** 🟡 · ACTIVE
- **Origin:** 2026-08-04 npm supply-chain audit found that `mock/serve-tunnel.cmd` used
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
  `mock/t6.html` at `/`, so the browser resolved `sets/t6_catalog.js` from `/sets/` and the route
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
  held-feedback mode, reveal neither rubric nor exemplar until the final review.
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
