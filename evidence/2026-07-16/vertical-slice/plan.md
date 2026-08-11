# Dungeon Vertical Slice — Frozen Plan

- **Status:** `IMPLEMENTED`; secondary checks are in `implementation-checks.md`, while visual and
  usability acceptance remains `WAITING_REAL_BROWSER`.
- **Scope:** one complete local product loop for Macroeconomics → The Transmission Stair.
- **Acceptance source:** real Browser for visual/interaction behavior; source checks are secondary.
- **Live learner data:** out of scope and protected. Product test state uses browser storage only.

## Governing sources

1. Current owner direction.
2. `AGENTS.md` and `DESIGN_SOURCE_INDEX.md`.
3. `GAME_UX_LOOP.md` and `ART_DIRECTION_SYSTEM.md`.
4. `ART_DIRECTION.md` and `work/art-direction-research/`.
5. `PROMPT.md` for learning rules.
6. Current `mock/rogue.*` behavior as implementation evidence only.

## Slice decisions

- Product identity: **Dungeon**.
- “The Ascent”: run-progress/world label, not the product name.
- Character: Ari only for the first slice.
- Art: painterly direction confirmed; current Door video/composite is interim and may not pass the
  final asset gate.
- Resolve: 2, matching the learning-engine default.
- Supported setup: Practice, Applied II, 5 questions, Immediate feedback.
- Unsupported modes/options: visibly disabled before selection.
- Chapter: The Transmission Stair only; all run metadata and questions share one configuration.
- Market: optional, one scarf category, local cosmetic ownership/equip state.
- Power-ups:
  - Insight: reveal conceptual hint; marks response assisted.
  - Compass: remove one incorrect MCQ option; marks response assisted.
  - Anchor: arm before commitment; prevents one Resolve loss but does not alter grading.
- Quest: two secure answers in a row; one Resolve restored only when missing, plus Embers.
- Persistence: local browser storage for product prototype only; no writes to `state/` or
  `history/`.
- Results: secure/developing/missed/assisted, response detail, evidence-based recovery action.

## Required routes

`PRELOAD → HOME → CHARACTER → HALL → RUN → SUMMIT | FAILURE → RESULTS → HOME`

Optional:

`HOME → MARKET → HOME`

`HOME → ARCHIVE → HOME`

`HOME → SETTINGS → HOME`

Resume:

`HOME_RETURNING → CONTINUE_RUN → RUN`

## Acceptance checks

- New, returning, and resumable homepage CTAs are truthful.
- Market preview/purchase/equip updates Ari and currency exactly once.
- Unsupported setup controls cannot be selected.
- Duplicate Door/answer/power-up activation cannot double-commit.
- Secure, partial, and missed answers have distinct textual and visual states.
- Ari never advances on missed answers.
- Quest resets completely between runs and grants its reward once.
- Anchor preserves Resolve without converting a missed answer into progress.
- Final question resolves before summit/failure transition.
- Results math and labels match response records.
- Review shows player answer, correct/model answer, explanation/rubric, assistance, and time.
- Recovery action starts only the uncertain questions it promises.
- Returning home shows updated Embers, last result, and recommendation.
- Keyboard focus, Escape behavior, reduced motion, and narrow layout are tested.
