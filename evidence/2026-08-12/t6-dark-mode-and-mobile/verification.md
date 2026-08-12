# Dark mode, real tooltips, motion, device switching, mobile pass

Date: 2026-08-12 · Branch: `design/dungeon-ui-system` · Status: `VERIFIED(REAL_BROWSER + AUTOMATED)`

Not pixel-level: the Browser pane was not compositing frames, so there are no screenshots. Every
claim below is a measurement taken in the running page or from a checked-in tool.

## Automated

| Check | Result |
| --- | --- |
| `npm test` | 39/39 pass (2 new: device switch, country-lock takeover refusal) |
| `node tools/build-site.mjs` | 16 public assets (was 15; `app/theme.js` added) |
| `node --check app/t6.js` / `app/theme.js` / `app/login.js` | clean |
| `node tools/check-palette.mjs` | 140 contrast checks + 4 shape signatures; all required pass in both themes |
| literal colours below `:root` in `app/t6.css` | 0 hex, 0 rgba, 0 `white`/`black` keywords (was 85 / 32 / 46) |
| literal corner radii off the four-step scale | 0 (was 19 distinct) |
| literal font sizes below 15px | 0 (was 9px, 10px, 11px, 12px, 12.5px, 13px, 14px) |

## Palette

All required pairings pass in both themes: WCAG AA 4.5:1 on every text/surface pair the UI draws,
3:1 on marks and focus rings. Reported-not-required, and deliberately so: the state hues sit within
1.2:1 of each other in grayscale, and under deuteranopia Developing/Needs practice are 0.05 apart
in OKLab. That is why the four evidence states are four **silhouettes** — filled disc, half-filled
disc, diamond, empty ring — asserted shape-distinct by the checker. Hues were left unchanged; they
are an accepted, deployed decision and re-hueing them is not a side effect dark mode gets to have.

## Real browser

Measured at 1280x800, 966x910, and 375x812, in light and dark, on the dashboard and the question
surface.

| Property | Result |
| --- | --- |
| `light-dark()` resolution | light theme byte-identical to what shipped (`rgb(244,241,232)` / `rgb(23,34,28)`) |
| theme switch | `system` -> `light` -> `dark` -> `system`; `data-theme` set/removed; `localStorage` written/cleared |
| `[title]` count, every screen | 0 (was 7) |
| `[data-tip]` triggers | 8, all open the bubble on synthetic `focusin` and `pointerover` |
| tooltip transition | opacity 0 -> 0.26 at 30ms -> 1 at 150ms; clamped inside the viewport at both edge markers |
| entrance cascade | only above-fold elements get `.reveal-pending`; 0 elements left at opacity 0 |
| `.route-full` | keeps `6px, 6px` dashes; excluded from tracing so "distance still to go" stays dashed |
| radar canvas | 4181 ink pixels; repaints on theme change through the computed-style probe |
| overflow / tap targets / off-scale radii / ragged rows | 0 at every viewport and theme |

## Mobile, before and after (375x812, question surface)

| | Before | After |
| --- | --- | --- |
| chrome above the question | 140px (two stacked headers) | 74px (global header hidden mid-question) |
| first option top | y=533 | y=493 |
| submit button | y=1183, 370px below the fold | sticky, in view without scrolling |
| action bar height | 111px | 76px (keyboard hint hidden on `pointer: coarse`) |
| `glossary-summary` target | 19px | 44px |
| `.info` marker target | 16x16 | 28x44 hit area, 16px ink |
| resume bar "Go ->" button | 48x56, three lines | 67x44, one line |

## Device switching

`releaseOtherDevice` ends the other session and claims this one. Tested: progress written on device
one is byte-identical when read on device two; device one's cookie then returns 401, so it is still
exactly one active browser; and a country-locked account is refused with `LOCATION_LOCKED` even when
the release flag is set, so the switch cannot be used to walk past a lock.

## Owed

- Pixel-level acceptance (no screenshots; pane not compositing).
- `app/login.css` and `app/admin.css` keep their own light-only palettes and were not ported.
- Tester-visible, so it owes a change announcement.
