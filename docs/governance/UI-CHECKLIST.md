# UI checklist

Run this before calling any UI change done. Every row exists because the defect it names
**shipped**, and most of them shipped past a green `ui-audit.js`.

Read with `docs/governance/BUG-LAWS.md` (LAW-51, LAW-52, LAW-64) — this is the checklist,
the laws are the reasoning.

**To take the screenshots this checklist keeps asking for, read `docs/governance/SCREENSHOTS.md`.**
The Browser pane's screenshot does not work here; `node tools/screenshot.mjs --port <port>` does.
And before trusting *any* transition reading taken in the pane, check the timeline is not frozen —
a pane that composites no frames pins `document.timeline` at 0, so every transition reads as its
start value and a correct rule looks broken. That doc carries the one-line probe.

**The rule that produced this file:** a clean report from a probe blind to the defect class
reads exactly like a clean screen. Every time a defect is found by eye, either a detector
gets added or a row gets added here saying it cannot be detected and must be looked at.

---

## A. Before you change anything

- [ ] **Reproduce it at the size it was reported at.** Three of the defects below only
      exist at 375, and one only at 1280×900. A screen you did not open is a screen you
      did not check.
- [ ] **Measure the defect before fixing it.** Every fix below was aimed by a number:
      `108px viewport over 266px of content`, `10px on a 22px chip is 45%`. A fix aimed at
      an impression usually moves something else.
- [ ] **Check the probe first if a probe reported it.** Several probes have been wrong.

## B. Automated — must be run

- [ ] `node tools/check-palette.mjs` — contrast pairs both themes, and the four **mastery
      dot** silhouettes. *Note: this does NOT cover the exam palette chips.*
- [ ] `node tools/build-site.mjs`
- [ ] `tools/browser-checks/ui-audit.js` in the page, at **375 and 1280**, on **every
      screen the change can reach** — dashboard, lesson, question, examiner home, and a
      **paper mid-question**. Zero `overflow`, `clipped`, `circleFit`, `overlaps`,
      `ragged`, `cutRows`, `hiddenScroll`, `barInset`.
- [ ] `tools/browser-checks/optical-audit.js` in the page, at **375 and 1280**. Zero
      `deadShadow`, zero `flatSurface`. Read `nearMiss` and `insetDrift` — those two
      report, they do not pass or fail, and a finding in them can be a deliberate
      decision. See section F.
- [ ] `node tools/screenshot.mjs --port <p>` — 16/16, **and then open them.** Three
      defects in this file were found by looking at a picture after the numbers were green.
- [ ] `node tools/screenshot.mjs --port <p> --optical` — the same scenes with the
      gridlines drawn over them, written as `_grid` files. Open these too when the change
      moved anything horizontally.
- [ ] **When the probe reports your new component, read the detector before you touch it —
      and when you do touch it, re-introduce the original defect as a fixture and confirm it
      still fires.** The standard normal table (2026-08-15) tripped three detectors and only
      one of the three responses was the same. `overflow` was right by design and the
      container simply had not used the existing `[data-scroll]` hook. `cutRows` was firing
      on a single 836px child that can never be shown whole at any scroll position, which is
      a document being scrolled and not a row drawn in half — refined, then **verified
      against a live 12×51px-in-100px fixture reproducing the original palette defect**,
      which still fires. `hiddenScroll` at 44% hidden on a phone was simply **correct**, and
      the fix was to the page: eleven columns became two six-column halves that stack. A
      probe you weaken without a fixture is a probe you have blinded.

## C. Layout

- [ ] **Does any scrollable strip hide more than it shows?** A horizontal scroller squeezed
      by its siblings is not navigation. *Shipped: `.exam-sections` at 375 had a 108px
      viewport over 266px of content — Sections B and C were gone, question counts
      included.* Detector: `hiddenScroll`.
- [ ] **Is a fixed-height grid a whole number of rows?** A `max-height` in `vh` almost
      never lands on a row boundary. *Shipped: `46vh` resolved to 414px and cut row nine of
      the exam palette through the middle of the chips at 1280×900.* Use
      `calc(round(down, <h> + <gap>, <row>) - <gap>)`. Detector: `cutRows` — and note it
      flags only a child drawn **in half**, not spare pixels landing in a gap, which is why
      the mobile `100px` in the same component was never a visible defect.
- [ ] **Do stacked bars share one inset?** Two bars read as one block. *Shipped:
      `.app-header` used `clamp(16px,3vw,40px)` and `.exam-bar` `clamp(12px,2.5vw,22px)`,
      so the logo began at x=38.4 and the section tabs beneath it at x=22.* Detector:
      `barInset`.
- [ ] **Did anything move when a sibling was hidden or wrapped?** Flex packs to the start.
      *Shipped: moving the section tabs to their own row left the clock alone on the first
      row, and it jumped from the trailing edge to the leading one.*
- [ ] **Is any reserved space still reserving for something that is gone?** *Shipped:
      76px and 82px of `padding-inline-end` survived the control they were holding a place
      for and skewed both bars.*
- [ ] **How much chrome sits above the content?** *Shipped: 141px of a 812px phone screen
      before a word of the question.* Hide furniture that is unusable in that state.
- [ ] **Is the gap you set the gap the eye sees?** A margin lands on the next element's
      **box**; the reader measures to its **ink**. When the next thing is a control band, the
      band's own dead space is added to your margin and only to that side. *Shipped: 26px
      under `.block-heading` plus 16.5px of centring inside a 44px `.rail-heading` put
      "Choose a subject" **42.5px** below the title and **29.5px** above the cards it
      names — a section label floating nearer to nothing than to its own content.* Measure
      heading-bottom → label-top and label-bottom → first-child-top and compare. No detector;
      look at the two numbers.
- [ ] **Does the spacing value name a rule, or a pixel?** The fix above is `13px` because
      that is `.subject-rail`'s own `gap`, and `9px` in the ≤768px block for the same reason —
      so the rule is *the control band sits in the rail's rhythm* and survives a gap change.
      A number that only happens to look right is a number the next change breaks.

## D. Shape, size and type

- [ ] **Is every data graph an actual component from the selected chart system?** LAW-80. A
      hand-authored SVG that copies a library example is still a separate geometry and
      accessibility implementation. Check the DOM for the library's chart surface at desktop and
      phone widths, then check empty and single-point data. Icons and decorative SVGs are not data
      graphs and stay outside this rule.

- [ ] **Is an absolute radius applied to a component rendered at more than one size?**
      *Shipped: `--r-panel` at 10px on a chip class rendered at 44px, 26px and 22px — 23%
      of one and 45% of another, which warps the small one.* Use a percentage, or size the
      radius per context.
- [ ] **Are asymmetric radii doing work that a regular shape could do?** An asymmetrically
      rounded box reads as a distorted square at every size. Prefer square vs circle, plus
      an orthogonal mark, over a warped outline.
- [ ] **Is a state mark drawn with a property that changes the box?** LAW-70. A `border`
      or `padding` used as decoration resizes exactly the members of a set that carry the
      state. *Shipped: `.course-card.day-start` had `border-left: 3px` against the other
      cards' 1px, so two of four subject cards had a 160px content box against 162px and
      their text started 2px further in — outer widths identical, so no probe fired.* Paint
      it with `box-shadow: inset`, `outline` or a pseudo-element, and remember `box-shadow`
      **replaces rather than merges** when a card is in two states at once. Check by
      comparing *content* boxes across the row, not outer widths.
- [ ] **Does text fit its box?** Not `scrollWidth` — glyph runs via
      `Range.getClientRects()`. LAW-64. Detector: `clipped`.
- [ ] **Does a rule inside a media query still describe what that media query renders?**
      Read the whole block before adding to it: a later rule in the same block can destroy
      the arrangement an earlier one was written for. *Shipped: `.compact-heading > p` kept
      `max-width: 180px`, `--t-micro` and `text-align: right` — the shape of a right-hand
      column — while `.section-heading` goes to `flex-direction: column` 31 lines below in
      the same block. At 375 it was 55% of the width, ragged-left under a left-aligned serif
      title, in the size reserved for labels. Full width made it shorter, not longer:
      68 → 60px.* No detector; it renders "correctly" at every size.
- [ ] **Round containers measured against the chord**, not the bounding box. Detector:
      `circleFit`.
- [ ] **Tap targets ≥ 44px** for anything of ours. A 1×1 input inside a large label is
      fine; the label is the target.
- [ ] **Corner radii come from the scale.** LAW-52.

## E. State, colour and motion

- [ ] **Is every state distinguishable without colour?** Shape, mark, or text — not hue.
      The exam palette's five states are square vs circle crossed with bar vs no bar.
- [ ] **Is every hover explanation reachable by keyboard and touch?** LAW-51: seven
      `title` tooltips were reachable by neither.
- [ ] **Does it survive both themes?** `--deep` is near-black in both, which made a filled
      panel vanish on a dark page.
- [ ] **Reduced motion** has a real path, not just a shortened one.

## F. Optical — what the reader sees, not what the box says

Boxes were right in every defect in this section. `ui-audit.js` cannot catch any of them;
`optical-audit.js` measures glyph runs instead and is the probe for all of it.

- [ ] **Does the ink line up, or only the boxes?** Two things share a gridline or they
      clearly do not. What reads as broken is the near miss — 1–24px off, close enough to
      look intended and far enough to look failed. *Shipped: the coin's `Learn` and the
      block heading `Your next step`, both Georgia, both boxes on the column, 21px of ink
      apart because one is inside a padded panel.* Detector: `nearMiss` — and note it
      ranks by the **strength** of the line missed, because a 4px miss on a minor line
      matters less than a 21px miss on the column everything else sits on.
- [ ] **How many text insets does the page have?** One is a system. *Shipped: eight —
      14, 15, 18, 19, 20, 21, 23, 33, 41 — with the coin holding its own private 20.*
      Detector: `insetDrift`. A panel's text cannot sit on the column without its own
      edge leaving it, so insetting is correct; **disagreeing** about the inset is not.
- [ ] **When you change an inset, re-measure rather than compute it.** The panel's own
      border counts. *Setting the coin to 14px to match the cards' 14px put it 1px off,
      because the coin draws a 1px border the cards' 14 already includes.*
- [ ] **Does every surface separate from what is behind it?** Background difference, a
      border, a shadow, or a blur — at least one. *Shipped: the resume bar over the hero
      had the same background, a border that was the same colour as both, and a dead
      shadow.* Detector: `flatSurface`. Check it against a **floating** element over the
      panel it overlaps, not just against its parent.
- [ ] **Do the shadows exist?** LAW-71: all four shadow tokens were invalid and every
      shadow in the app computed to `none`, silently, for as long as they had existed.
      Detector: `deadShadow`. Must be zero.
- [ ] **Does text in one row share a baseline?** Detector: `baselineDrift`.
- [ ] **Look at a `_grid` shot.** `node tools/screenshot.mjs --optical`. A number says 21;
      a gridline shows you the two words that do not sit on it.

## G. After

- [ ] **Look at the screenshots.** Again. Numbers do not show redundancy, crowding, or a
      shape that reads as broken.
- [ ] **Did the fix create the defect it was fixing, elsewhere?** *Shipped: closing the
      absolutes gap by appending clauses made the correct answer the longest option 66% of
      the time.*
- [ ] **Add the detector, or add the row.** If it cannot be automated, it goes in this file
      so the next session reads it instead of rediscovering it.
