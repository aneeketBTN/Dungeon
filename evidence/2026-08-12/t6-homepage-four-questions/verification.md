# Homepage restructured around four questions, with duplicate entry points removed

**Date:** 2026-08-12
**Status:** `VERIFIED(REAL_BROWSER + AUTOMATED)` — DOM and computed-layout level; no screenshots
**Branch:** `redesign/homepage-four-questions` (not merged, not deployed)

## Owner direction

> "What am I doing — where can I start — how am I doing — additional resources. I want to
> collapse redundant options that appear multiple times, and streamline the UI to dissolve
> the cognitive load of the UI currently."

This supersedes the C27/C28 dashboard order and the "nothing hides" rule that went with it.
The new resolution is recorded as **C30** in `docs/governance/DESIGN_SOURCE_INDEX.md`; C26,
C27, and C28 are marked superseded there rather than deleted.

## What was actually duplicated

Counted from the pre-change source, not estimated:

| Duplicate | Where it appeared |
| --- | --- |
| Generic practice, 3 entry points | `builder-disclosure` summary, `#start-selected-mock`, and the hero CTA whenever `rec.kind === "mock"` — all three called `openPracticeSetup()` |
| "Build your own practice", twice adjacent | disclosure `<summary><b>` and `<h2 id="builder-title">` immediately inside it |
| The concept list, twice | `#concept-shelf-list` (all 16, actionable) and `#concept-map` (same 16, paged 2 at a time, not actionable) — and the evidence explaining *why* a concept needed work existed **only** in the list that could not act on it |
| "N of 16 strong", twice | `#momentum-value` in the hero and `#subject-strong` in the subject panel |
| The same evidence, 8 renderings | header sparkline, hero goal route, 4 story-stat cards, radar, 4 state counters, subject progress bar, full trend chart, per-concept dots |
| Subject identity, 7 places | `#selected-course-code`, `#subject-title`, `#subject-finish-title`, `#concepts-course-label`, `#sets-title`, `#lessons-course-label`, `#momentum-scope` |
| Hide/show nesting, 3 deep | `details.disclosure` → `nav.stage-tabs` (4 tabs) → `details.explain-details` |

## What changed

**Structure.** Four `.home-block` sections, each answering one question once:
`#home-now` (subject rail + full subject name + the one next action + distance to goal),
`#home-start` (deduped routes + the builder + study sets), `#home-progress` (four-state
totals + matrix + trend + the concept list), `#home-more` (lessons, plan, exam boundary,
settings — the only collapsed section, each with a visible Show/Hide affordance).

**Removed as duplicates,** with no capability lost:

- `#start-selected-mock` — the builder now has exactly one door.
- The 4-tab `stage-tabs` nav and `stage-panels`, plus `setDashboardView()` and
  `bindStageTabs()`. Nothing on the page is mutually exclusive any more.
- `renderConceptMap()`, `showConceptInspector()`, the module stepper, `#concept-map`,
  `#concept-inspector`. Their content — concept summary, the evidence still missing, and
  the confidence note — moved **onto the shelf row it describes**, behind the concept's
  own name. Verified present: 5 evidence items and the confidence sentence render on expand.
- `.subject-finish` and its second "N of 16 strong"; the hero already states it.
- The four `.story-stat` cards, now one factual sentence. Still no praise, still activity
  and not progress: *"12 answers across 3 practice blocks. 5 of 64 concepts have evidence,
  in 2 of 4 subjects. Last answer 2 hours ago."*
- The `.momentum-card` — a pale card inside the dark hero. Its content sits on the hero
  itself now, separated by a hairline rather than a second surface (LAW-19).

**New behaviour.** `renderRecommendation()` withdraws whichever route the hero is already
offering, so the identical action is never shown twice. Confirmed in both states below.

## Verification

Local dev server, real Browser, `?scenario=dashboard-progress` (seeded) and
`?scenario=dashboard-fresh` (default profile). No real learner state was cleared — C10 and
LAW-06 respected by using the scenario loader.

**Injected layout probe, both viewports** — document overflow, elements escaping the
viewport, sub-44px targets, and `[hidden]` elements that still paint:

- **1280×800: 0 findings.** Hero grid `779.594px 340.391px`. Block gaps `56 / 56 / 56`px
  against 12–18px inside a block — better than the 2× inter/intra ratio the layout pass calls for.
- **375×812: 0 findings** after artifact rejection. Hero collapses to one column (`355px`);
  `.focus-goal` correctly swaps `border-inline-start` → `border-top`. Gaps `40 / 40 / 40`px.

**One real finding, fixed:** `#subject-sort` measured **32px** tall, under the 44px floor the
rest of the dashboard holds to. Now 44px. This was pre-existing, not introduced here.

**17 candidate findings rejected as probe artifacts (LAW-46).** All were `.course-card` and
its children reporting `right` past the viewport at 375px. They sit inside `.course-grid`,
which is a deliberate swipe scroller at ≤700px. Decisive counter-evidence: the document does
not scroll horizontally (`scrollWidth 375` vs `clientWidth 375`) and the scroller itself
fits (`right: 365`). The probe was corrected to walk ancestors for an `overflow-x` scroller;
it then reported 0.

**LAW-36 — `hidden` must mean zero pixels.** Measured in both directions, not read off the
property:

| Element | Closed | Open |
| --- | --- | --- |
| `#practice-builder` | `hidden: true`, `h: 0` | `hidden: false`, `h: 563`, 12 chips |
| `.shelf-body` | `hidden: true`, `h: 0` | `hidden: false`, `h: 179` |
| withdrawn `.route` | `hidden: true`, `h: 0` | — |

`aria-expanded` tracked correctly on every toggle in both directions.

**Route dedupe, both states.** Seeded profile: hero recommends priority practice → the
`priority` route is withdrawn (`hidden: true, h: 0`), `course` and `mock` remain. Fresh
profile: hero offers study set 1 → the `course` route is withdrawn, the other two remain.

**Lesson jump.** A shelf row's `Lesson` opens `#lessons-disclosure`, opens the matching
`.lesson-row`, and lands on the right lecture ("Desirability, feasibility, viability" for
the SPMS first concept). One copy of the lesson prose, as before.

**LAW-47 teach-before-test**, evaluated in the page from an empty `lessonsRead`:

```
ok: true, violations: []
sets 1–9 (12/12/12/12/12/12/12/12/31 items) + mixed builder (21 items) — 0 violations
```

**Automated:** `node --check app/t6.js` clean, `node tools/build-site.mjs` prepared 15
assets, `npm test` **37 passed / 0 failed**. Net `419 insertions, 440 deletions` across
`app/t6.html`, `app/t6.css`, `app/t6.js` — the page does more with less code.

**Zero dead references:** a DOM sweep for every removed id and class
(`stage-tabs`, `concept-map`, `concept-inspector`, `start-selected-mock`, `subject-strong`,
`panel-overview`) returns empty, and no console errors on load in any state exercised.

## Follow-up pass (same day, owner review of the first draft)

**1. Block 1 heading was passive.** "What am I doing" sat directly above the one call to action
and described a state rather than pointing at it. Now **"Your next step"**. Chosen over the other
candidate, "Today's focus", because the app models three time horizons (under 24 hours, three days,
seven days) — "today" is simply wrong for a learner on the seven-day plan — and because the results
screen already says *"Your next step is clear."*, so this matches a phrase the product uses. The
numbered eyebrow ("1 — Right now") is unchanged and still carries the ordering. Blocks 2–4 keep
their question form; making the whole set active is a separate call and was not taken unilaterally.

**2. The radar had no axis labels at all.** Confirmed in source, not assumed: `renderMasteryRadar()`
drew four grid polygons, five spokes, the data polygon, and five vertex dots, and nothing else. The
only way to learn which vertex was which was to read the value list beside the canvas and infer that
the order runs clockwise from twelve o'clock. The fifth axis is the one that most needed it —
four subjects plus "Connections" reads as five subjects until something says otherwise.

Fixed by drawing the name at each vertex. Inline rather than on hover, because hover does not exist
on a touch screen. Only the name is drawn, never the value: the list beside the canvas already
carries the numbers, and repeating them would put the same fact twice on one screen. Radius pulled
from `.34` to `.30` to make room.

Labels are clamped into the canvas, and the clamp is load-bearing rather than defensive —
"Connections" is 70px against a 21px "IBM", sits on an outer vertex, and **is clamped at every
size tested**, so without it the label would be cut off at the edge. Geometry re-derived from the
running canvas and every label box measured:

| Canvas | All labels fit | Overlaps | Clamped |
| --- | --- | --- | --- |
| 308px (desktop, live) | yes | none | Connections `[4–74]` |
| 280px (375px viewport, live) | yes | none | Connections `[4–74]` |
| 240px (the `Math.max` floor) | yes | none | Connections `[4–74]` |

**3. The canvas was an unnamed `role="img"`.** It carried `aria-describedby` but no accessible
name, so assistive technology announced an unlabelled image. It now carries an `aria-label` naming
all five axes and stating plainly that *Connections is not a subject*, and pointing at the list that
holds the values — deliberately without reciting the numbers, which would make a screen-reader user
hear the whole dataset twice. The `<ul id="mastery-values" aria-label="Mastery matrix values">`
remains the accessible value path required by C26.

Re-verified after these changes: layout probe **0 findings** at 375×812 and 1280×800, no console
errors, no horizontal page scroll, `npm test` 37/37, build clean.

## Mobile pass (same day, second owner review)

**4. The subject row was a scroller with no cue.** Below 700px the four cards become a swipe
row, and cards were being clipped at the right edge with nothing to say more existed — a direct
miss against "progressive disclosure needs a visible affordance; content hidden with zero cue may
as well not exist". Added an edge fade on `.rail-scroll`, drawn **only on the side that still has
cards behind it**, because an affordance that stays lit when there is nothing left to reach is
decoration that lies. Measured with transitions disabled so the readings are settled values:

| Scroll position | Left fade | Right fade |
| --- | --- | --- |
| At start | 0 | 1 |
| Mid-scroll | 1 | 1 |
| At end | 1 | 0 |
| Not scrollable (any desktop width) | 0 | 0 |

At 1280 the row reports `data-scroll="none"` and paints no fade at all.

**5. Mastery values were desktop density on a phone.** `.mastery-values` label/value were
11px/12px at every width. These five rows are the only place the exact percentages are stated, so
they are read rather than glanced at: now 12px/14px below 700px, with the column minimum widened
`115px → 126px` so the larger text cannot push anything out of the card. Verified: every row fits
without truncation (`scrollWidth <= clientWidth` on all five), the list's right edge sits inside
the card (`350` vs `365`), and the page still does not scroll horizontally.

**6. A recommended action that scrolls out of reach.** The dashboard runs to ~6,800px on a phone,
so a learner in the concept list had to scroll the whole way back to act. Added `.resume-bar`, a
fixed bar shown only while the hero button is off screen (IntersectionObserver on
`#start-recommended`).

It is deliberately **not a second recommendation**: the label is read from the hero button and the
click is delegated to it, so one place decides the next step (LAW-04), and the subject is named so
the scope is explicit (LAW-18, C16). It carries the button's label rather than the hero heading —
the heading is a sentence that ellipsised at this width, while the button already states the same
thing as an action. Verified: label `"Practise these concepts"` **identical** to the hero button
and not truncated; scope `SPMS` matches; the Go control is 56px; the bar sits inside the viewport
inset 10px each side with `env(safe-area-inset-bottom)` honoured; `body.has-resume-bar` adds 96px
of bottom padding so it never covers the last concept row (checked at maximum scroll:
row bottom `287` against bar top `722`); clicking it enters practice; and because it lives inside
`.dashboard-screen` it measures **zero height on the practice screen**, so no fixed element leaks
between screens.

Re-verified after all three: layout probe **0 findings** at 375×812 and 1280×800, scanned both at
the top of the page *and* scrolled down with the resume bar showing. No console errors.
`npm test` 37/37, build clean.

**A second measurement artifact, recorded because it nearly became a false fix.** The first fade
reading reported identical opacities in all three scroll states, which looked like broken CSS. It
was the 180ms transition being sampled at time zero. The same shape appeared again when
`scrollIntoView({behavior:'auto'})` moved nothing — `html { scroll-behavior: smooth }` wins, so
`scrollY` read 0 while the animation was still running. Both are LAW-46: settle the layout, or
disable the transition, before believing a probe.

## Visual pass (third owner review — first actual pixels seen)

The owner supplied a desktop screenshot of block 1 and reported it looked "wonky" and
"undercooked". This is the **first pixel-level input this work has had**, since the Browser pane
never composited. Every item below was then measured in the running page rather than eyeballed
from the image, and re-measured after the fix.

| Measured before | Defect | After |
| --- | --- | --- |
| `.focus-goal` 287px tall in a 505px panel, `align-self: center` | The hairline divider ran **57%** of the panel and stopped in mid-air — the clearest unfinished tell on the block | `align-self: stretch` with `align-content: center`; divider spans **100%** and terminates on both edges |
| `identityBold` === `.course-card.selected .course-name` | The subject identity line repeated the selected card **verbatim** — a duplicate introduced by the restructure that removed duplicates | `<b id="subject-title">` deleted along with its JS write; the line now carries only the description, which is the one thing the card does not say |
| `#subject-description` capped at `520px` inside a 1120px row | Wrapped early with ~600px of dead space beside it, reading as an orphaned fragment | Dropped from the shared `.compact-heading > p, .section-note, #subject-description` rule — an id selector there out-specified the new class rule. Now `62ch` as a caption |
| Gaps 18 / 13 / 14px | Flat rhythm: the description floated equidistant between the cards and the hero, belonging to neither | 8px above, 28px below — a **3.5×** inter/intra ratio, so space alone says it describes the cards |
| CTA 664px in a 780px column (**85%**) | A saffron slab reading as a banner rather than a button | Sized to its label: 272px (**35%**). Still full width below 700px, where a thumb-width target is the point |
| `.hero-trend` 54px | The route read as a stray diagonal in a large dark field | 72px |

`.section-note` was removed from that shared rule at the same time — it has had no markup since the
staged panels were deleted.

**Re-verified:** all five left edges in block 1 agree at `73px` (block heading, rail label, first
card, description, hero panel). Layout probe **0 findings** at 1280×800 and 375×812, scanned at the
top and scrolled with the resume bar showing. On the narrow stack the divider correctly swaps
`border-inline-start: 0` → `border-top: 1px` and the CTA returns to full width (315 of 315). No
console errors. `npm test` 37/37, build clean.

## What is NOT verified

- **No screenshots taken by this session.** The Browser pane never composited frames — the same
  limitation recorded for the lesson surface on 2026-08-12. One owner-supplied screenshot of block 1
  was reviewed and produced six measured defects (see the visual pass above), which is itself the
  argument that DOM measurement does not substitute for looking: **every one of those six passed a
  clean 0-finding layout probe.** A probe catches overflow, clipping, and undersized targets; it
  cannot see a rule that stops in mid-air or a line of text that repeats the card above it.
  **A full pixel pass across all four blocks and both viewports is still owed** before this reaches
  testers; only block 1 at desktop has been seen.
- Contrast of the route chart's new dark-surface colours was reasoned, not measured. The
  three meanings are unchanged (green goal, cyan position, dashed remainder); only luminance
  moved. Measure before merge.
- Not exercised: the practice and results screens (untouched by this change), `login.html`,
  `admin.html`, and any real-device touch interaction.
- Content acceptance is unaffected and still `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## Design sources applied

Routed through the `ui-skills` registry at the owner's request: `pbakaus/distill` (remove
what does not earn its place; one primary action; never nest cards) and
`jakubkrehel/better-layout` (group with space not lines; order by importance; progressive
disclosure needs a visible affordance). Both are advisory craft sources, subordinate to
`AGENTS.md`, the ledgers, and the conflict register.
