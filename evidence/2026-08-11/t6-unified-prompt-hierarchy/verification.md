# Unified case/instruction hierarchy and neutral subject focus

Date: 2026-08-11  
Status: `VERIFIED` for the question-hierarchy, neutral unanswered-state, and selected-subject
action refinements described here. This evidence supersedes the learner-facing prompt hierarchy
shown in screenshots 03–08 under `evidence/2026-08-11/t6-evidence-challenges/`; the underlying
learning/evidence-bank verification there remains valid.

## Accepted hierarchy

- A genuine case and its answer instruction are one aligned prompt flow, not a note plus a
  floating headline or a tinted panel nested inside the question card.
- The case contains the substantive exam problem and owns the larger reading type.
- The dependent instruction is a compact bold directive beneath the case.
- A question without a case receives no prompt box and keeps its large question heading.
- Boss steps, matching rows, and cloze content are transparent wrappers on the same warm-white
  surface. Alignment, spacing, and one-pixel dividers carry sequence; answer controls and
  post-answer feedback retain visible boundaries because those boundaries have a function.
- The redundant “Reasoning chain” description strip is absent.
- Format, count, internal status, concept, and source metadata remain hidden from learners.

## Accepted scope and color rules

- The selected-subject panel no longer says “Recommended now.” It names only BRGSA, IBM, SCLM, or
  SPMS and uses an action-specific button: resume saved practice, start this study set, practise
  these concepts, or open the full practice mock.
- Unanswered prompts, step labels, dividers, and practice metadata are neutral. Color is reserved
  for selection, primary action, progress, accessibility focus, and answer/evidence feedback.

## Real Browser observations

Routes:

```text
?scenario=dashboard-progress
?scenario=question-boss
?scenario=question-cloze
?scenario=question-match
```

- Boss desktop at 1280 × 720: the main question surface was `rgb(255, 254, 250)`; the prompt and all
  three step wrappers were transparent with zero side padding. The obsolete reasoning-chain strip
  was absent. The prompt, steps, and controls shared the same 413.5 px left edge; only the second
  and third steps had a one-pixel top divider. Document width was 1265, with no horizontal overflow.
- Boss narrow at 390 × 844: case 20 px; dependent instruction 18 px. Prompt, options, and all three
  steps shared the 15 px left edge. Document width was 375 at inner width 390; no horizontal
  overflow.
- Case-fill desktop: prompt, cloze content, and response controls shared the 413.5 px left edge;
  the cloze wrapper was transparent, borderless, and unpadded.
- Case-fill narrow: prompt, cloze content, and controls shared the 15 px left edge; cloze padding
  remained zero and controls remained inside the 345 px reading column.
- No-case match narrow: `has-case` was false, the actual question retained its 30 px heading, and
  all four transparent rows were 345 px wide at the 15 px left edge. One-pixel dividers separated
  rows without creating cards.
- Switching all four course cards kept the dashboard active and produced BRGSA, IBM, SCLM, and
  SPMS focus labels. Every action was “Practise these concepts” in the seeded fixture, and none of
  the four focus panels contained “recommended.”
- A clean `?scenario=empty` profile displayed BRGSA, “Start the next part of the subject,” and the
  concrete button “Start this study set”; it also contained no “recommended” claim.

## Source and isolation checks

```text
node --check mock/t6.js                         PASS
node --check mock/sets/t6_challenges.js        PASS
node mock/validate_t6_bank.js "<T6 pack>"      PASS (664 items; 0 errors; 0 warnings)
```

All nine `state/` and `history/` SHA-256 values matched the previous verified pass. Browser work
used deterministic scenario profiles and did not change live learner files. Final Browser
developer logs were empty.

## Visual artifacts

- `01-boss-unified-desktop.png`
- `02-boss-unified-narrow.png`
- `03-case-fill-unified-desktop.png`
- `04-case-fill-unified-narrow.png`
- `05-subject-focus-neutral.png`
- `06-no-case-question-narrow.png`
- `07-match-flat-desktop.png`
