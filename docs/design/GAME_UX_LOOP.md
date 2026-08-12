# Dungeon — Game/UX Flow, Flags, and Iteration Loop

Status: proposed product contract and autonomous test loop

## North-star contract

At every point, the player should be able to answer:

1. Where am I?
2. What is my current goal?
3. What can I do now?
4. What changed because of my last action?
5. What did I learn?

If any answer is missing, the state is not ready for art polish.

For every state, review four experience dimensions:

- **See** — hierarchy, available action, status, and consequence.
- **Interact** — target, control, keyboard/touch behavior, cancellation, and recovery.
- **Feel** — intended emotion, pacing, and perceived fairness.
- **Learn** — concept, rule, mistake, progress, or next recommendation.

## Canonical player flows

### New player

`BOOT → PRELOAD_IF_NEEDED → HOME_NEW → CHARACTER_SELECT → SUBJECT_SELECT →
CHAPTER_SELECT → GUIDED_RUN_SETUP → RUN_ENTRY → QUESTION_LOOP → RUN_COMPLETE →
RESULTS → HOME_RETURNING`

The cosmetics market is visible from the homepage but not required before the first run. It
becomes contextually highlighted after the player earns enough Embers to understand its purpose.

### Returning player

`BOOT → PRELOAD_IF_NEEDED → HOME_RETURNING → CONTINUE_RUN | NEW_RUN | MARKET |
ARCHIVE | SETTINGS`

### Question loop

`QUESTION_ENTER → QUESTION_ACTIVE → OPTIONAL_POWER_UP → ANSWER_COMMIT →
ANSWER_RESOLVED_{SECURE|PARTIAL|MISSED} → WORLD_REACTION → QUEST_REACTION →
NEXT_QUESTION`

Feedback copy appears before or with the world reaction. The player never waits for animation to
learn whether the answer was correct.

### End conditions

- Success: `FINAL_ANSWER_RESOLVED → SUMMIT_SEQUENCE → RESULTS → RECOMMENDED_NEXT |
  REVIEW | HOME`
- Resolve exhausted: `ANSWER_RESOLVED_MISSED → FAILURE_BEAT → RETRY_CHECKPOINT |
  REVIEW_CAUSE | HOME`
- Voluntary exit: `LEAVE_REQUESTED → CONFIRM_IF_PROGRESS_WOULD_BE_LOST → SAVE_AND_HOME |
  ABANDON | CANCEL`
- Interrupted: persist a resumable snapshot, then route to `CONTINUE_RUN` on return.

## State model

Use one explicit state machine. CSS classes may render state but must not be the source of truth.

### App and navigation

| Flag | Type / values | Drives |
|---|---|---|
| `app.phase` | `boot, loading, ready, offline, fatal` | preload, retry, offline UI |
| `route.current` | screen ID | active screen and title |
| `route.previous` | screen ID or null | intentional back behavior |
| `route.transition` | `idle, entering, leaving` | duplicate-input lock |
| `assets.requiredReady` | boolean | whether entry can proceed |
| `save.status` | `none, resumable, complete, corrupt` | homepage primary CTA |
| `player.isReturning` | boolean | new/returning homepage |
| `settings.reducedMotion` | boolean | motion variants |
| `settings.highContrast` | boolean | contrast variants |
| `settings.audio` | `off, effects, full` | audio behavior |
| `network.status` | `online, offline, retrying` | sync and fallback messaging |

Invariant: every route has a visible title or accessible name, one intended primary action, and a
valid forward or back path.

### Onboarding and character

| Flag | Type / values | Drives |
|---|---|---|
| `onboarding.introSeen` | boolean | intro replay/skip |
| `onboarding.characterConfirmed` | boolean | access to run setup |
| `onboarding.firstRunComplete` | boolean | guidance and market timing |
| `character.selectedId` | ID or null | character preview |
| `character.confirmedId` | ID or null | persisted character |
| `character.previewCosmetics` | slot → item ID | temporary market preview |
| `character.equippedCosmetics` | slot → item ID | rendered loadout |

Invariant: temporary previews never overwrite the equipped loadout until explicitly equipped.

### Economy and market

| Flag | Type / values | Drives |
|---|---|---|
| `economy.embers` | non-negative integer | balance displays and affordability |
| `economy.insight` | non-negative integer | power-up inventory |
| `market.introSeen` | boolean | first-visit teaching |
| `market.selectedItemId` | ID or null | details and preview |
| `market.purchaseStatus` | `idle, confirming, pending, success, error` | transaction UI |
| `market.ownedItemIds` | ID set | owned labels |
| `market.equippedBySlot` | slot → item ID | equip state |
| `market.filter` | category / owned / affordable | browsing |

Invariants:

- Currency changes once per transaction.
- Owned items cannot be repurchased.
- Unaffordable items can be previewed but not confirmed.
- Closing a preview restores the actual equipped appearance.

### Curriculum and setup

| Flag | Type / values | Drives |
|---|---|---|
| `curriculum.subjectId` | ID or null | realm, graph, title |
| `curriculum.chapterId` | ID or null | route, question pool |
| `curriculum.recommendationId` | ID or null | suggested route and rationale |
| `curriculum.masteryByChapter` | chapter ID → summary | readiness display |
| `curriculum.lockByChapter` | chapter ID → reason/null | lock UI |
| `setup.mode` | `practice, mock, endless` | rules and feedback |
| `setup.difficulty` | declared level | question selection |
| `setup.length` | supported integer | run size and estimate |
| `setup.feedbackMode` | `immediate, checkpoint, end` | when explanations appear |
| `setup.isValid` | boolean | entry CTA |
| `setup.invalidReason` | string or null | inline correction |

Invariant: every visible selection changes the resulting run, or it is visibly unavailable before
selection. No decorative setting may pretend to be functional.

### Run

| Flag | Type / values | Drives |
|---|---|---|
| `run.status` | `idle, entering, active, paused, resolving, complete, failed, abandoned` | run lifecycle |
| `run.id` | stable ID | persistence and analytics |
| `run.questionIndex` | integer | question and progress |
| `run.questionCount` | integer | progress denominator |
| `run.resolve` | integer | health state |
| `run.scoreSecure` | integer | secure result |
| `run.scorePartial` | number | partial result |
| `run.streak` | integer | quest progress |
| `run.answerState` | `unanswered, committing, secure, partial, missed` | answer UI |
| `run.assistanceUsed` | power-up IDs | assisted result label |
| `run.animationState` | `idle, secure, partial, missed, powerUp, summit` | world reaction |
| `run.inputLocked` | boolean | duplicate prevention |
| `run.snapshotStatus` | `clean, dirty, saving, saved, error` | safe interruption |

Invariants:

- Ari advances only for awarded progress.
- Resolve cannot fall below zero or exceed its declared maximum.
- A question can commit exactly once.
- The question index advances exactly once.
- Text feedback is available even if motion is disabled or interrupted.
- Resume restores question, selections, inventory, quest, timing policy, and world position.

### Quest

| Flag | Type / values | Drives |
|---|---|---|
| `quest.id` | ID or null | quest identity |
| `quest.status` | `inactive, active, complete, failed, claimed` | quest presentation |
| `quest.current` | number | progress |
| `quest.target` | number | goal |
| `quest.reward` | typed reward | preview and grant |
| `quest.rewardGranted` | boolean | idempotent reward |
| `quest.announcement` | `hidden, intro, progress, completion` | temporary emphasis |

Invariant: reset creates a clean quest state and removes all prior completion presentation.

### Power-ups

Each power-up uses:

`id`, `count`, `availability`, `target`, `effectPreview`, `useStatus`, `usedOnQuestionId`,
`resultModifier`, and `animationState`.

`availability` should distinguish `available`, `empty`, `blocked_by_mode`, and
`blocked_after_commit`. A use is idempotent and recorded in response review.

Suggested first set:

- **Insight** — conceptual hint; result is marked assisted.
- **Anchor** — protect one Resolve after a missed answer; activates after miss.
- **Second Look** — clear an uncommitted MCQ choice once; unavailable after commit.

Do not add a power-up until its learning purpose and dashboard treatment are defined.

### Results

| Flag | Type / values | Drives |
|---|---|---|
| `results.secureCount` | integer | mastery summary |
| `results.partialCount` | integer | developing summary |
| `results.missedCount` | integer | review summary |
| `results.assistedCount` | integer | assisted distinction |
| `results.questOutcomes` | list | quest summary |
| `results.powerUpsUsed` | list | run context |
| `results.strongConcepts` | list | evidence |
| `results.weakConcepts` | list | recovery routing |
| `results.recommendation` | typed next action + reason | dashboard primary CTA |
| `results.reviewRows` | complete response records | exact review |
| `results.summitSeen` | boolean | completion replay/skip |

Invariant: labels match the math. Partial credit is never described as “secure.”

## UI guidelines

- One primary action per screen or decision region.
- Keep forward action placement stable across question states.
- Do not hide irreversible consequences behind icon-only controls.
- A disabled control must explain why; a locked control must explain how to unlock it.
- Use player language in the UI and diagnostic language in test tools.
- Touch targets are at least 44 × 44 CSS pixels.
- Keyboard order follows visual order; radio groups support arrow keys; popovers close with Escape.
- Focus is restored to the next meaningful heading/control after screen transitions.
- Live announcements include answer outcome, Resolve change, quest completion, and run completion.
- Never make animation completion a prerequisite for the next accessible state.
- Confirm leaving only when unsaved or meaningful run progress would be lost.

## Autonomous iteration loop

### Inputs

- `docs/design/ART_DIRECTION.md` and `docs/design/ART_DIRECTION_SYSTEM.md`;
- this flow/state contract;
- a route/state inventory;
- deterministic test scenarios;
- the current build;
- an issue log with evidence and severity.

### One iteration

1. Reset to a declared persona and clean persistence state.
2. Run one complete path without implementation knowledge influencing choices.
3. Capture every route, transition, overlay, answer outcome, quest, power-up, and end state.
4. Record `See / Interact / Feel / Learn` for each state.
5. Run keyboard, narrow viewport, reduced-motion, refresh/resume, slow-load, empty-resource, and
   repeated-click cases.
6. Classify findings:
   - `P0` data loss, dead end, inaccessible core action, wrong learning result;
   - `P1` misleading state, broken progression, unreadable content, false affordance;
   - `P2` friction, weak feedback, inconsistent art or motion;
   - `P3` polish and optional delight.
7. Fix at most three related high-impact findings as one coherent slice.
8. Generate or revise assets only after the state and acceptance criteria are stable.
9. Re-run affected scenarios plus the golden first-run path.
10. Update the issue log and route/state coverage. Repeat until the exit gate passes.

The loop should never use “looks better” as its only acceptance criterion. Every change names the
player problem and the state it resolves.

## Fresh-player personas

Run the golden path with:

1. first-time player, no game vocabulary;
2. exam-stressed player seeking the fastest useful run;
3. returning player with a resumable run;
4. keyboard-only player;
5. narrow-screen touch player;
6. reduced-motion player;
7. low-resource player trying the market and a power-up;
8. player who gets every answer wrong;
9. player who gets every answer correct;
10. mixed/partial player who uses assistance.

An AI evaluator cannot fully substitute for real naïve users because it knows the product model.
Use clean state and the rubric to reduce bias, then run a human milestone check after the first
complete vertical slice and before final polish.

## Deterministic scenario flags

Development builds should expose a non-production scenario loader, not scattered manual toggles:

- `fresh-new-player`
- `returning-with-save`
- `market-empty`
- `market-can-afford`
- `powerup-empty`
- `all-correct`
- `all-wrong`
- `partial-and-assisted`
- `quest-completes-with-heal`
- `quest-completes-at-full-resolve`
- `last-question-correct`
- `last-question-wrong-but-survives`
- `resolve-exhausted`
- `refresh-before-commit`
- `refresh-after-commit`
- `save-error`
- `slow-assets`
- `offline`
- `reduced-motion`
- `narrow-viewport`

The loader sets the same real state fields the product uses; it must not create test-only rendering
branches.

## Goal system and exit gates

### G0 — State coverage

- 100% of declared routes and overlays inventoried.
- Correct, partial, missed, quest, power-up, failure, and completion states captured.
- No UI state exists only as an untracked CSS class.

### G1 — First-run clarity

- A fresh player reaches the first meaningful question without outside explanation.
- Character, subject, chapter, and run choices state their consequence.
- The market is discoverable but does not obstruct first value.

### G2 — Learning feedback

- Every answer explains why.
- Correct/partial/missed are distinguishable without color or motion.
- The player understands Resolve, quest, reward, assistance, and the next action.

### G3 — Continuity and resilience

- No dead ends or false affordances.
- Duplicate taps/clicks cannot double-spend or double-submit.
- Refresh/resume and leave/cancel behavior are defined and tested.
- Unsupported modes/settings cannot start a misleading run.

### G4 — Art and motion coherence

- Every surface passes the product art-system gate.
- All required Ari and VFX states exist.
- Completion and failure are authored beats.
- Reduced-motion states preserve meaning.

### G5 — Useful results

- Dashboard math and labels are correct.
- Response review contains the player answer, correct/model answer, explanation, assistance, and
  outcome.
- The primary recommendation is specific, evidence-based, and starts the promised run.
- Returning home reflects rewards, progression, and current recommendation.

### Release gate

Release a full vertical slice only when G0–G5 pass for one subject/chapter, one character, one
market category, three power-ups, one quest family, all answer outcomes, failure, completion,
results, and return home. Expand content only after this slice is stable.

## Current prototype audit — implementation review

Reviewed: `legacy/prototypes/index.html`, `legacy/rogue/rogue.html`, `legacy/rogue/rogue.js`, relevant animation styles, current
Door composite/plane sheets, and the existing art-direction document.

This is not yet a browser-verified usability pass.

### Keep

- The character → Hall → run → results spine.
- Mixed MCQ, written, and route-choice questions.
- Immediate explanations and self-assessment rubric.
- Persistent peripheral climb, Recovery Trial, Resolve, Insight, and Embers as testable concepts.
- Distinct correct/incorrect step treatments, visible focus styling, and reduced-motion CSS.
- The Door/Ari scale relationship and cyan/saffron identity.

### P1 findings

1. The legacy homepage and the game flow are visually and structurally separate; the game starts at
   character select, so preload/home/return-home is absent.
2. Length, difficulty, selected Dungeon, and feedback controls can change visibly without changing
   the five-question run. A 10/20-question selection can still start a five-question run.
3. The run header and question content remain hard-coded to one Dungeon after other Macro routes are
   selected.
4. Quest presentation is not reset: completion class/copy can survive into a new run.
5. Ari’s position advances after a missed answer because world position uses `answered`, not awarded
   progress.
6. No persisted save, onboarding, character, setup, economy, market, or resume state exists.
7. The final answer jumps to results without a summit/Door completion state.
8. “Review every response” does not show the actual selected/written answer, correct/model answer,
   explanation, assistance, or response timing.

### P2 findings

1. Player-facing character-select copy calls the experience a flow check and its figures
   placeholders, breaking the fiction.
2. Resources appear before they are taught; the market and earning/spending loop do not exist.
3. Partial responses animate as wrong while also advancing and coloring a step as done.
4. Quest completion copy promises Resolve restoration even when Resolve is already full.
5. Leaving a run has no confirmation or save/resume treatment.
6. “Focus changes” is foregrounded as a result metric without explaining how it helps the player.
7. Subject/mode options look selectable before the player learns they are disconnected.
8. The stair visualization is hidden from assistive technology without an equivalent announced
   floor/quest change.

## Recommended first implementation slice

Build and verify one honest end-to-end path before expanding the market or content:

1. connect a production-style homepage to the flow;
2. persist new/returning state and selected character;
3. make one subject + one chapter + one five-question setup truthful;
4. repair secure/partial/missed world movement and quest reset;
5. add a deterministic summit transition;
6. replace results with a complete, accurate response review and evidence-based next action;
7. return home with the run’s rewards and recommendation visibly reflected.

After this passes, add the market and additional power-ups against the same state and test contract.
