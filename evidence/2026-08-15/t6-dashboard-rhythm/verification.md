# Verification — the dashboard's vertical rhythm, and a probe that could not see a clip

`VERIFIED(REAL_BROWSER)` · 2026-08-15 · branch `feat/bank-rehaul-completion` · not merged,
not deployed.

Four changes, all found by eye on a screen `ui-audit.js` reported clean, and all measured
before and after in the page. Three are layout; the fourth is the probe itself, which was
reporting a 6px overflow on a control that cannot be painted at all.

- Server: `python tools/server.py`, port **50885** (8099 and the rest of the block taken).
- Screen: `#dashboard-screen`, default state, SPMS selected, **Exam order**.
- Method: measure the shipped state, then re-introduce the previous declaration through an
  injected stylesheet and measure again in the same evaluation. Both numbers therefore come
  from the same layout pass, which is what LAW-46 asks for.

---

## 1 — The section label was floating nearer to nothing than to the cards it names

`.block-heading` owes a paragraph 26px. What follows this one on `#home-now` is not a
paragraph: `.rail-heading` is a **44px control band**, because it holds a native `<select>`
and the dashboard's tap floor is 44. The 11px label sits centred in that band, so it carried
**16.5px of the band's own dead space** on top of the 26px.

| 1280×900 | Gap above the label | Gap below it |
| --- | --- | --- |
| Before (`margin-bottom: 26px`) | **42.5px** | 29.5px |
| After (`margin-bottom: 13px`) | **29.5px** | 29.5px |

| 375×812 | Gap above the label | Gap below it |
| --- | --- | --- |
| Before | **42.5px** | 25.5px |
| After | **25.5px** | 25.5px |

The value is not a magic number in either place: it is `.subject-rail`'s own `gap` —
13px in the base sheet, 9px inside the ≤768px block — so the rule is *the heading band sits
in the rail's rhythm*, and it stays true if the gap changes. Measured dead space inside the
band is 16.5px above and 16.5px below the label, which is why 13 + 16.5 lands on the same
29.5 the rail already produces below it.

On a phone the same change is also **16px off the height of everything above the hero**,
which is what that media block exists to do.

## 2 — A day marker drawn as a border made two cards a different size

`.course-card.day-start` marked where the exam day turns over with `border-left: 3px`. A
border is part of the box, so the two cards that open a day — SPMS and IBM in exam order —
had 3px of left border against the other two cards' 1px.

Measured at **375**, all four cards 186px wide:

| Card | Before: content box | Before: content x | After: content box | After: content x |
| --- | --- | --- | --- | --- |
| SPMS (`day-start selected`) | **160px** | 24 | 162px | 22 |
| BRGSA | 162px | 216 | 162px | 216 |
| IBM (`day-start`) | **160px** | 412 | 162px | 410 |
| SCLM | 162px | 604 | 162px | 604 |

Before, the content of two cards started 2px further in than the other two and the steps
between them ran 192 / 196 / 192. After, the steps are an even **194 / 194 / 194** and every
content box is 162px. At **1280** all four are 272.5px wide with a 244.5px content box, and
`border-left` is 1px on all four.

Nothing was misaligned by much. It was misaligned by *exactly the marker*, on *exactly the
cards that carry it*, which is the kind of 2px that reads as "these cards are not the same"
without saying why.

Drawn now as `box-shadow: inset 3px 0 0`, which paints in the same place, follows the corner
radius, and costs the content nothing. `box-shadow` replaces rather than merges, so the
selected day-start card composes all three layers explicitly. Confirmed in the page:

| Card | Computed `box-shadow` |
| --- | --- |
| SPMS (`selected day-start`) | marker + 1px inset ring + 3px soft glow |
| IBM (`day-start`) | marker only |
| BRGSA, SCLM | `none` |

## 3 — A note styled for an arrangement its own media query destroys

`.compact-heading > p` was given `max-width: 180px`, `--t-micro`, `text-align: right`
inside the ≤768px block. `.section-heading` goes to `flex-direction: column` **31 lines
below in the same block**, so by the time that rule applies the note is no longer beside the
title — but it kept the width and alignment of something sitting in a right-hand column.

Measured at 375 with the practice builder open (`#builder-toggle`):

| | Width | % of parent | Size | Align | Height |
| --- | --- | --- | --- | --- | --- |
| Before | 180px | **55.4%** of 325px | 11px | right | **68.2px** |
| After | 325px | 100% | 13px | start | **60.4px** |

Ragged-left under a left-aligned serif title, at the size the token above reserves for
labels and eyebrows, for a sentence of guidance. It now takes `--t-meta` like every other
note on this screen and starts where its own title starts. Full width makes it **shorter,
not longer**: 68 → 60px.

## 4 — The probe was reporting a control that cannot be painted

`ui-audit.js` reported `overflow` on `button#mode-exam` — right 381 against a 375 viewport,
6px over — on the dashboard's default state, while `documentElement.scrollWidth` sat at
exactly **375**. Scroll the coin out of view and the same probe went quiet, which is the
intermittency LAW-46 is about.

The header's Learn/Examiner switch collapses to `max-width: 0; opacity: 0` while the coin at
the top of the page is in view, because the coin is already offering that choice. Its two
53px buttons keep their natural width inside a 0px box with `overflow: hidden`. Their own
rects are past the edge; nothing is drawn there.

`clippedShortOfTheEdge` now walks the clipping ancestors and asks whether the **intersection**
crosses the viewport. Reproduced as a fixture — the collapsed switch, forced to
`max-width: 0` — at 375, `documentElement.scrollWidth` 375, `pageScrollsSideways: false`:

| | `overflow` |
| --- | --- |
| Without the new check | `button#mode-exam` left 328, right 381, **over 6** |
| With it | *(empty)* |

**And the detector is not blinded.** Three fixtures, all built at the *left* edge so the
fixture cannot widen the document and change `innerWidth` underneath the probe — the first
attempt did exactly that, pushing `innerWidth` from 375 to 555 and making the probe measure
its own fixture:

| Fixture | Expected | Result |
| --- | --- | --- |
| A — real overflow, no clipping ancestor | must fire | fires: left −60, right 140 |
| B — clipping ancestor that **itself** crosses the edge | must fire | fires: left −80, right 320 |
| C — clipping ancestor stopping short of the edge | must stay silent | silent |

The scroller allowlist below it is unchanged and stays: it says which scrollers are
deliberate, which is a different claim.

## 5 — Gates

| Check | Result |
| --- | --- |
| `node tools/check-palette.mjs` | All required pairings within tolerance in both themes; all four states shape-distinct. Same 17 below-target-but-not-required pairs as before this change. |
| `node tools/build-site.mjs` | 18 public assets and the production worker. |
| `node tools/screenshot.mjs --port 50885` | **16/16**, 0 failed — and opened. |
| `ui-audit.js` @ **1280×900**, dashboard | `overflow` `clipped` `circleFit` `overlaps` `ragged` `cutRows` `hiddenScroll` `barInset` `tapTargets` `radiiOffScale` all empty. |
| `ui-audit.js` @ **375×812**, dashboard | All of the above empty **except `hiddenScroll`** — see below. |

### The one finding that is not clean, and why it is not this change's

At 375, `hiddenScroll` reports `div#course-grid` showing 355px of 768px — **54% hidden**.
That is the deliberate swipeable subject rail with the edge fade, the same one recorded in
the changelog as "the deliberate `.course-grid`". It is reported here rather than waved
through, and it was proved to be untouched by this work: with both CSS changes reverted in
the page, the scroller measures **355 / 768** exactly as it does with them applied.

### What the pictures show

`outputs/shots/dashboard_SPMS_1280x900_light.png` — the four cards are one size, their text
starts on one line, SPMS carries the teal marker *and* the selection ring, IBM carries the
marker alone, BRGSA and SCLM carry neither, and the label band sits between the heading and
the cards rather than under the heading.
`dashboard_SPMS_375x812_light.png` — same rhythm at phone width.

---

## Not done here

- The `#course-grid` 54% `hiddenScroll` above is pre-existing and untouched. Either the fade
  is the answer and the detector needs to know that scroller is deliberate, or it is not and
  the rail needs a different shape. Neither was decided in this pass.
- Only the dashboard was audited at both widths. The lesson, question, examiner-home and
  mid-paper screens were covered by the 16/16 screenshot run but not by a per-screen
  `ui-audit.js` pass, because none of the four changes can reach them: three are scoped to
  `#home-now` or `.compact-heading`, and the fourth only removes findings.
