# UI checklist

Run this before calling any UI change done. Every row exists because the defect it names
**shipped**, and most of them shipped past a green `ui-audit.js`.

Read with `docs/governance/BUG-LAWS.md` (LAW-51, LAW-52, LAW-64) — this is the checklist,
the laws are the reasoning.

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
- [ ] `node tools/screenshot.mjs --port <p>` — 16/16, **and then open them.** Three
      defects in this file were found by looking at a picture after the numbers were green.

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

## D. Shape, size and type

- [ ] **Is an absolute radius applied to a component rendered at more than one size?**
      *Shipped: `--r-panel` at 10px on a chip class rendered at 44px, 26px and 22px — 23%
      of one and 45% of another, which warps the small one.* Use a percentage, or size the
      radius per context.
- [ ] **Are asymmetric radii doing work that a regular shape could do?** An asymmetrically
      rounded box reads as a distorted square at every size. Prefer square vs circle, plus
      an orthogonal mark, over a warped outline.
- [ ] **Does text fit its box?** Not `scrollWidth` — glyph runs via
      `Range.getClientRects()`. LAW-64. Detector: `clipped`.
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

## F. After

- [ ] **Look at the screenshots.** Again. Numbers do not show redundancy, crowding, or a
      shape that reads as broken.
- [ ] **Did the fix create the defect it was fixing, elsewhere?** *Shipped: closing the
      absolutes gap by appending clauses made the correct answer the longest option 66% of
      the time.*
- [ ] **Add the detector, or add the row.** If it cannot be automated, it goes in this file
      so the next session reads it instead of rediscovering it.
