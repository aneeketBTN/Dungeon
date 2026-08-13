# Two products, one switch; repair in sittings; the bag; the recommended paper

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-13

Local dev server (`tools/server.py`, port assigned by `autoPort`), Chromium via the
Browser pane, measured at 320 / 375 / 700 / 721 / 760 / 761 / 900 / 1280 / 1600 px.

**No screenshots, again, and this time the cause is measured rather than guessed:**
the Browser pane is not displayed, so the tab composites no frames —
`document.timeline.currentTime` reads **0** and stays there, every CSS transition
sits frozen at its start value, `resize_window` does not change `innerWidth`, and
`computer{action:"screenshot"}` times out after 5s. Two consequences worth recording
for whoever verifies here next:

1. Reading a computed style during a transition in this pane reports the value the
   property is animating **from**, not to. Twice during this session that looked
   exactly like a CSS bug — the switch thumb "not moving", and the two labels'
   colours "swapped". Both were the frozen clock. The technique that gives a real
   answer is to drive the animation yourself:
   `getAnimations().forEach(a => a.currentTime = a.effect.getComputedTiming().duration)`
   and read afterwards. Every colour and geometry figure below was taken that way.
2. Viewport-dependent layout was measured in same-origin iframes of fixed width,
   where media queries resolve against the frame, since the pane's own viewport
   cannot be resized.

**Pixel-level acceptance is still owed** — the same gate open since 2026-08-12. The
Chrome-extension path was tried this session at the owner's suggestion and reported
"not connected" on three attempts.

## What was built

- A header switch between the two products, with a view transition between them.
- The examiner's home reordered: one recommended paper, then the record, then the list.
- Post-mock repair delivered in sittings of four concepts (previous turn, undocumented
  until now).
- The bag: a focus timer and eight pieces of guidance (previous turn, same).

## Verified — the switch

- **Boot.** `role="group"`, `aria-label="Which side of Dungeon"`, `aria-pressed`
  `true/false`, `:root[data-mode]` = `learn`, dashboard showing.
- **It is the screen that decides the state, not the button.** `data-mode` and both
  `aria-pressed` values are set inside `showScreen`, from a table of the examiner's
  screen ids. Confirmed on the routes that predate the switch: the dashboard's
  `open-exam`, `exam-home-leave`, `exam-result-home`, backing out of a brief, and both
  repair routes all leave the switch agreeing with the page.
- **The transition really runs.** With `document.startViewTransition` wrapped in a
  spy, both directions reported 1 call each; skipping the API entirely still navigates.
- **Direction follows the switch.** Exam sits right of Learn, so arriving at the
  examiner sends the old page left and brings the new in from the right, and the
  return is the mirror. Selected by `:root[data-mode="exam"]`, which by the time the
  animation runs names the destination.
- **The header does not travel with the page.** `view-transition-name: app-header`
  takes it out of the root snapshot; its own old/new pseudo-elements have
  `animation: none`.
- **Reduced motion.** The direction rules live under
  `@media (prefers-reduced-motion: no-preference)`, so under `reduce` the browser's
  own cross-fade is what remains, shortened to `.14s`. The travel goes; the change
  stays legible.
- **Thumb geometry, driven to the end of its 320ms:** at 1280 the thumb centre lands
  1101.4 against the Exam label's 1101.8 and 1033.4 against Learn's 1033.7; at 375,
  276.4 / 276.7 and 223.1 / 223.4. Gaps at the ends are symmetric (4px).
- **Contrast, both themes, transitions driven to completion:** selected-on-saffron is
  `#17221c` on `#f3bf63` ≈ **9.9:1**; selected-on-deep is `#ffffff` on `#17221c`
  (light) and `#f0ece2` on `#070b0d` (dark); unselected is `--muted` on `--card-soft`.
  `npm run check:palette` clean in both themes.
- **A paper in progress is protected.** Pressing Learn mid-attempt asks
  "Leaving the examiner ends this attempt. Leave anyway?"; declining leaves you on
  `exam-screen` with the clock running, accepting clears the ticker, drops the attempt
  and lands on the dashboard.

### Two defects found by verification, both fixed here

- **Unhandled promise rejection on every skipped transition.** A view transition that
  is skipped before it animates — background tab, a window not compositing, a second
  press during the first — rejects `ready`. Nothing caught it, so the console filled
  with `InvalidStateError: Transition was aborted because of invalid state` (12
  instances). `ready` is now caught and ignored; `updateCallbackDone` is deliberately
  left uncaught so a genuine failure in the navigation is still loud. Re-tested: zero
  `unhandledrejection` events across six switches plus a double-press.
- **A fast double-press landed on the wrong side.** The update callback runs a frame
  or two after the call, so a second press inside that gap read the old mode and was
  dropped as "already there" — press Exam then Learn quickly and you ended on Exam.
  A `pendingMode` records where a flying transition is heading. Re-tested: double-press
  (exam→learn) ends on **learn**, triple-press ends on **exam**, pressing the current
  side is still a no-op.

## Verified — the examiner's home

Order on the page: header, **recommended paper**, record, "Every paper", the four cards.

The recommendation is per paper rather than per set — a paper you have never met beats
a second set of one you have — in seat order, and IBM comes last among unmet papers.
Driven through six seeded profiles:

| Profile | Recommends | Reason shown |
| --- | --- | --- |
| nothing sat | SPMS · Set 1 | not met yet |
| SPMS set 1 sat | BRGSA · Set 1 | not met yet (**not** SPMS set 2) |
| SPMS + BRGSA sat | SCLM · Set 1 | not met yet |
| three sat, IBM untouched | IBM · Set 1 | not met yet (caveat paper, last) |
| all four sat once, IBM lowest at 40% | BRGSA · Set 2 at 55% | weakest |
| weakest paper's three sets all sat | BRGSA · Set 3 (its 50% set) | weakest, CTA "Sit it again" |

Two rules the sweep produced and that are now in the code:

- **A caveat paper cannot win "weakest".** IBM's mock is self-marked against a rubric,
  so its percentage is not the same kind of number as a machine-marked paper's. Ranked
  together it won "weakest" at 40% over BRGSA's 55% and would have become the only
  thing ever recommended.
- **A paper's standing is its best result, not its worst set.** Which *set* to sit is
  decided separately (an unseen set first, otherwise the lowest-scoring one).

The hero repeats the shortfall warning rather than staying quiet about it, and
`examShortfalls` is now one function shared with the paper cards instead of two copies.

## Verified — repair in sittings, and the route out of the examiner

- Submitting a paper and pressing "Revise these concepts →" crosses to
  `practice-screen` with `data-mode` = `learn` and the switch flipped, kicker
  **"4 concepts this sitting · 9 waiting for the next"**.
- The per-concept route still works after being wrapped: 6 breakdown rows on a paper
  answered wrongly on purpose, "Teach me this again" on *Jobs to be done* → practice
  screen, mode `learn`, title "SPMS · Jobs to be done".
- Incidental re-confirmation of the 2026-08-13 Section B fix: ticking every option on
  eight MSQs scored **4 of 75**, not full marks.

## Verified — layout

`tools/browser-checks/ui-audit.js`, dashboard and examiner home, 375 and 1280:

- **overflow: 0** at every width from 320 to 1600 — including 721, where the full-size
  header briefly overflowed by 17px before the compact breakpoint was moved to 760.
- **radii: 0** off-scale, **ragged: 0**.
- **tapTargets:** the switch halves were 38px against the project's 44px floor and are
  now 44 — the pill-in-a-pill inset moved from the container's padding onto the thumb,
  so the control still measures 46px overall. The one remaining finding is
  `button#brand-home` at 42px on desktop, which is **pre-existing** and not touched here.
- On a phone the header drops the wordmark and the evidence figure to make room. The
  figure is the first thing on the dashboard directly beneath, so what is given up is a
  duplicate rather than a fact.

## Second pass, same day — the coin, the header, and the bag

The owner asked for the crossing to read as two sides of one thing rather than a
control in the corner, and for the bag to become a tool rather than a manual.

**Screenshots exist for this half.** Part-way through, the Browser pane was displayed
and the tab began compositing — `document.timeline.currentTime` started advancing and
`computer{action:"screenshot"}` returned. The coin was reviewed visually in all four
states (learn side / examiner side × light / dark), as was the floating bag. The
images were read in-session rather than written to this directory: the pane's
screenshot returns an image to the agent and has no path to disk. **A saved-artefact
pass is still owed**, but "nobody has looked at it" is no longer true of these
surfaces.

### The coin

- Renders on both home pages from one function; the dashboard face marks Learn as
  current and the examiner's marks the examiner, and the halves are exactly equal
  (559px each at 1280).
- Crossing works from either face and uses a view transition — the spy counted 1 per
  crossing, 2 for a there-and-back.
- The side you are on is `aria-current="true"` and inert; the other side is the whole
  panel as a `<button>` with an `aria-label`, so colour is never the only signal.
- **A dark-mode defect the screenshot caught.** The filled "you are here" side first
  used `--deep`, which is near-black in *both* themes: on a dark page it was a black
  panel on a near-black background and the signal was gone. It now uses `--ink`, which
  flips with the theme. Confirmed by eye in both themes after the change.
- On a phone the halves stack and the side you are *not* on comes first, so the useful
  half never needs a scroll.

### The header

- "Term 6 evidence" is "Term 6 progress"; the sparkline is gone from the markup, and
  `sparklineMarkup` and `trendDirectionCopy` went with it — their only caller was the
  header. The note is now `N blocks practised`, counted directly rather than by
  rebuilding the evidence model at every historical block to plot a line nobody read.
- The switch folds away while a coin is on screen and unfolds as it scrolls off,
  measured on both home pages: 0px wide at the top, 138px once past the coin, back to
  0 on the way up. Width is what animates, not opacity — fading alone left a 158px
  hole in the header, and removing it outright jumped everything beside it.

### The bag

- Two sections, Focus timer and Calculator. The eight guidance notes are gone.
- The calculator is the examiner's, extracted to `buildCalculator(mount, kind)` and
  mounted twice with separate buffers. Both keypads verified in the bag: `7 × 8 =`
  → **56** on normal, `√9` → **3** on scientific. The choice persists to the profile.
- It floats bottom-right with no scrim, lifts clear of the resume bar, and spans the
  width on a phone (10→350 at 375). Where it was left is where it stays, across
  screens and reloads.
- **Two tap targets under the 44px floor, both found by the project's own probe and
  both fixed:** the calculator's Normal/Scientific toggle at 30px, and the bag's close
  button at 29px. The audit had first run with the bag shut, which found neither —
  worth remembering: a panel that is closed is a panel that is not being audited.

### The resume bar

- It used to blink into existence, because it is toggled with `hidden` and
  `display: none` cannot be transitioned. It now rises and fades using
  `transition-behavior: allow-discrete` with `@starting-style`. Traced frame by frame:
  entry runs opacity 0.02→1 with translateY 13px→0 over ~190ms; exit reverses and
  `display` holds until the animation finishes.
- `pointer-events` is dropped at the *start* of the exit, not the end: for those 280ms
  it is still laid out, and a fading bar that can still take a tap is worse than one
  that pops.

### One more defect

`has-resume-bar` stayed on `<body>` after leaving the dashboard, so anything
positioning itself around the bar — now including the bag — made room for a bar that
was not on screen. Cleared in `showScreen`.

## Gates

- `node --check app/t6.js` clean.
- `npm test` — **39/39**.
- `npm run check:palette` — all pairings within tolerance in both themes.
- `node tools/validate_t6_bank.js` — `ok: true`.
- `npm run check:exam` — 1 error, 2 warnings, **all four SCLM**, all excluded from this
  session by the owner's instruction ("everything except SCLM"): Section B is 4 of 6
  numericals, Section A forces 14 shared prompts, Section C forces 3.
