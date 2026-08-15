# Verification — an optical layer, and the three defects it found on a green screen

`VERIFIED(REAL_BROWSER + HEADLESS_CHROME)` · 2026-08-15 · branch
`feat/bank-rehaul-completion` · not merged, not deployed.

Two defects were reported by eye on a dashboard that `ui-audit.js` had just called
clean: the coin's `Learn` did not line up with `Your next step`, and the resume bar was
"the same colour as the background, which doesn't add depth". Both were real. Chasing
the second one turned up a third that nobody had reported and no probe could see.

The ask was for **an optical layer in the UI testing — check it looks right against
gridlines**, so the layer came first and the fixes were aimed with it.

- Server: `python tools/server.py`, port **50885**.
- Screen: `#dashboard-screen`, default state, SPMS selected, exam order.
- New probe: `tools/browser-checks/optical-audit.js`.

---

## 1 — Why a second probe

`ui-audit.js` measures boxes: crossing the viewport, escaping a container, overlapping a
sibling. Every defect below has correct boxes. Three times now the box has been right
and the ink wrong:

| Defect | Boxes | What the reader saw |
| --- | --- | --- |
| `.block-heading` spacing (earlier today) | 26px, as specified | 42.5px, because the next box was a 44px band with an 11px label centred in it |
| `.course-card.day-start` (earlier today) | all four cards 186px | two drew their text 2px further in |
| The coin's `Learn` (this pass) | every box on the column | two Georgia titles 21px apart |

A reader does not see boxes. They see ink, and whether it sits on a line. So the probe
throws the boxes away and measures glyph runs through `Range.getClientRects()`, clusters
them into the gridlines the page's ink actually forms, and reports what sits **near** a
line without sitting **on** it — close enough to look intended, far enough to look
failed. That band is 1–24px; below 0.75px is subpixel and counts as on the line.

Six checks: `gridlines`, `nearMiss`, `insetDrift`, `flatSurface`, `deadShadow`,
`baselineDrift`. `optical.overlay()` draws the grid onto the page, and
`node tools/screenshot.mjs --optical` writes a `_grid` shot of every scene through it.

### The probe was wrong twice before it was right

Recorded because a probe's own failures are the reason to distrust the next green
report, not a footnote.

1. **`nearMiss` took the nearest line instead of the strongest.** `Learn` sits 4px off a
   minor line and 21px off the page's main column. Nearest-first reported the 4px and
   sorted the actual defect out of the top twelve — the probe found the thing it was
   written for and then buried it. Now it takes the strongest line in range and sorts by
   that line's strength.
2. **`deadShadow` reported zero on a page where all sixteen shadows were dead.** The
   stylesheet walk guarded with `if (rule.cssRules) { walk(...); continue; }`. Since CSS
   nesting shipped, a plain `CSSStyleRule` carries its own `cssRules` — an **empty**
   list, which is an object and therefore truthy — so every style rule recursed into
   nothing and was skipped. `rule.cssRules && rule.cssRules.length`, and no `continue`.
3. `flatSurface` also read only `borderTopWidth`, so it called `.app-header` flat while
   it was separating itself with the `border-bottom` it has always had. All four sides
   now, and `backdrop-filter` counts as separation too.

## 2 — Every shadow in the app was dead

Not reported by anyone. Found by `deadShadow` on the way to the resume bar.

```
--shadow: light-dark(0 22px 60px rgba(35,45,38,.09), 0 22px 60px rgba(0,0,0,.5));
```

`light-dark()` is a **`<color>` function**. It cannot wrap a whole `box-shadow`
shorthand, so the declaration does not parse, and `box-shadow` falls back to `none`
with nothing left on the element to find. All four tokens were written this way.

| | Before | After |
| --- | --- | --- |
| `--shadow` computes to | `none` | `rgba(0,0,0,.5) 0 22px 60px` |
| `--shadow-lift` | `none` | `rgba(0,0,0,.45) 0 2px 7px` |
| `--shadow-deep` | `none` | `rgba(0,0,0,.62) 0 24px 80px` |
| `--shadow-primary` | `none` | `rgba(0,0,0,.45) 0 8px 22px` |
| Rules asking for a shadow | 16 | 16 |
| **Elements on the dashboard actually painting one** | **3** | **43** |

The three that worked were the `.course-card` markers written literally earlier today.
Every intended elevation in the product — the hero, the primary button, the question
card, the reset dialog, the toast, the exam calculator, the normal table, the result
card — has been flat for as long as the tokens have existed.

Fixed by putting only the colour inside `light-dark()` and leaving the geometry where
the property can parse it. `--shadow-lift` asked for 6px of blur in light and 8px in
dark; that cannot be expressed this way and has never rendered either value, so it is
7px in both, stated rather than silently dropped.

## 3 — The resume bar had no depth

The bar is `position: fixed` over whatever is scrolling under it, which on this screen
is `.focus-panel` — and both were `var(--deep)`.

| | Before | After |
| --- | --- | --- |
| Bar background | `rgb(7,11,13)` | `rgb(22,33,38)` (`--deep-raised`) |
| Backdrop (`.focus-panel`) | `rgb(7,11,13)` | `rgb(7,11,13)` |
| Contrast between them | **1.00:1** | 1.20:1 |
| Border | `--deep-edge`, **`#17221c` in light — identical to `--deep`** | `#2e3c35` light / `#263239` dark |
| Shadow | `none` (§2) | `rgba(0,0,0,.5) 0 22px 60px` |
| `optical-audit` `flatSurface` | reports it | empty |

Three separations, all three absent at once: same background, invisible border, dead
shadow. A drop shadow cannot rescue this on its own — black on near-black is nothing —
so the lift is in the surface, with the shadow still doing the work where the bar floats
over paper. `.toast` is the same shape and got the same treatment.

`--deep-edge`'s light value being `--deep` itself was already on `check-palette.mjs` as
`light: --deep-edge against --deep = 1.00:1, target 1.15`, sitting in the
"below target, reported not required" list where nobody had read it as a defect. It only
bit once something deep floated over something deep. That list is now **16 items,
down from 17**, and all required pairings still pass in both themes.

## 4 — `Learn` and `Your next step`

Measured at 1280: the coin's title at **93.5**, the block heading at **72.5**. Both
boxes on the column; 21px of ink apart, in the same serif, 60px apart vertically.

`insetDrift` explains why. Every panel insets its text from the column — that is the
system, and a panel's title cannot sit on the column without its own edge leaving it —
but the page had **eight different insets**, and the coin held the largest:

```
14px ×4 (.course-card)   15px ×10 (.set-card)   18px ×2 (.route)
19px ×4 (.stat)          20/21px (.coin-side)   23px (.trend-card)   33px   41px
```

`.coin-side` was `padding: 15px 20px 16px` on desktop while the ≤768px block had said
`0 14px` all along, so this is the desktop value catching up with the phone rather than
a new number. It is **13px**, not 14: the `.coin` draws its own 1px border, so 13 + 1 is
the card's 14. Setting 14 first put the title at 87.5 against the cards' 86.5 — the same
defect one pixel wide, caught by re-running the probe rather than by eye.

| | Before | After |
| --- | --- | --- |
| `.coin-name` ink | 93.5 | **86.5** |
| `.course-card .course-code` ink | 86.5 | **86.5** |
| Off the 72.5 column by | 21px | 14px, on a line the page already draws four times |

The title does not reach 72.5 and should not: panel edges are the stronger line and they
all sit on the column. What changed is that the coin stopped holding a value no other
panel used, and now shares a gridline with the four cards directly beneath it.

## 5 — Gates

| Check | Result |
| --- | --- |
| `node tools/check-palette.mjs` | All required pairings within tolerance in both themes; all four states shape-distinct. Below-target-not-required list **17 → 16**. |
| `node tools/build-site.mjs` | 18 public assets and the production worker. |
| `node tools/screenshot.mjs --port 50885` | **16/16**, 0 failed — and opened. |
| `node tools/screenshot.mjs --port 50885 --optical --only dashboard` | **4/4** `_grid` shots. |
| `ui-audit.js` @ 1280×900 | every class empty. |
| `ui-audit.js` @ 375×812 | every class empty **except** the pre-existing `#course-grid` `hiddenScroll` at 54% — the deliberate swipeable rail, unchanged by this work and proved unchanged in the previous pass. |
| `optical-audit.js` @ 1280×900 | `deadShadow` **0**, `flatSurface` **empty**, coin ink == card ink. |

### The pictures

`outputs/shots/dashboard_SPMS_1280x900_light.png` — `Learn` now starts on the same line
as `SPMS` in the card below it, and the resume bar reads as a panel floating over the
hero instead of a hole in it.
`dashboard_SPMS_1280x900_light_grid.png` and its three siblings — the same scene with
the gridlines drawn.

---

## Not done here

- **The remaining inset drift is measured but not normalised.** 14 / 15 / 18 / 19 / 23
  across `.course-card`, `.set-card`, `.route`, `.stat`, `.trend-card`. 14 and 15 are
  themselves a near-miss pair. Collapsing them is a design decision across five
  components, not a bug fix, and it is the owner's call — `insetDrift` now reports the
  whole table on every run.
- **`nearMiss` still returns 12 findings at 1280 and more at 375.** The ones this pass
  fixed are gone; the rest — the brand mark at 21.84, `Across all four subjects` at 23,
  the mastery labels at 19 — are unreviewed. Some will be deliberate.
- **Only the dashboard was audited optically.** The `_grid` shots exist for that scene
  only. Lesson, question, examiner home and mid-paper have not been through the new
  probe at all.
- `--shadow-lift`'s per-theme blur (6px light / 8px dark) is gone, unified at 7px. If
  the difference was wanted it needs a media query, since `light-dark()` cannot carry it.
