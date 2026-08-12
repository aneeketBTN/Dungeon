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

## What is NOT verified

- **No screenshots.** The Browser pane was not compositing frames in this session — the same
  limitation recorded for the lesson surface on 2026-08-12. Acceptance here is DOM and
  computed-style level only; **a pixel-level pass is still owed** before this reaches testers.
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
