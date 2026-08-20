# Shadcn chart system — verification

Date: 2026-08-20  
Branch: `fix/theme-switch-and-login-theming`  
State: local working tree; not merged or deployed.

## Scope

The dashboard had three data-graph surfaces and all three now use the shadcn chart component
structure with Recharts primitives:

1. The subject momentum route is a gradient `AreaChart` with `CartesianGrid`, tooltip, natural
   curves and Lucide `Flag`, `PersonStanding` and `DoorOpen` reference marks.
2. The selected-subject evidence history is a gradient `AreaChart` with axes, horizontal grid,
   tooltip, a real empty state and a Lucide diamond for a single observation.
3. The cross-subject evidence matrix is a `RadarChart` with polygon grid, axes and tooltip.

The implementation follows the official shadcn registry examples rather than drawing chart paths
in application code:

- <https://ui.shadcn.com/r/styles/new-york-v4/chart-area-gradient.json>
- <https://ui.shadcn.com/r/styles/new-york-v4/chart-area-default.json>
- <https://ui.shadcn.com/r/styles/new-york-v4/chart-radar-default.json>

`app/t6-chart.jsx` owns the shared `ChartContainer` / `ResponsiveContainer` boundary and the three
charts. `tools/build-chart.mjs` bundles React, Recharts and Lucide into the self-hosted
`app/t6-chart.js` island; the rest of Dungeon remains framework-free. `app/t6.js` supplies chart
data through `window.DungeonCharts` and no longer calculates SVG paths or paints a radar canvas.

## Defects removed

- The momentum route no longer relies on a hand-authored SVG stretched with
  `preserveAspectRatio="none"`, which deformed its circular/radio-like points as the container
  changed shape.
- The mastery radar no longer uses a manually painted canvas.
- The evidence trend no longer manufactures SVG path strings and point circles in `t6.js`.
- Data graphs now share one responsive geometry owner, tooltip grammar, accessibility layer and
  reduced-motion contract.
- The chart bundle is local. Recharts sizes its responsive wrapper through inline style
  attributes, so the release CSP explicitly permits `style-src-attr 'unsafe-inline'` while script
  and stylesheet sources remain self-hosted.

## Browser measurements

Scenario: `measurement-evidence`, all three graphs populated.

| Surface | 1280×900 | 375×812 |
|---|---:|---:|
| Momentum | 327.5 × 176 | 298 × 132 |
| Mastery radar | 308 × 340 | 300 × 280 |
| Evidence trend | 507 × 220 | 310 × 180 |

At both widths:

- three `[data-slot="chart"]` surfaces and three accessible Recharts layers;
- zero `canvas` elements;
- zero legacy `.trend-line`, `.trend-area` or `.trend-empty` graph elements;
- zero graph overflows and no document-level horizontal scroll;
- zero console warnings or errors.

The no-history state was also opened: the chart grid remains a Recharts surface and the learner
sees “Your first practice block will start the chart”, with no error.

## Gates

- `npm test` — **130/130 pass**.
- `npm run build` — PASS; chart island built and **20 public assets** prepared.
- `npm run review` — all checks PASS: bank validator, name matching, delivered-run craft,
  absolute bias, palette, release build and exam readiness.
- `npm run check:palette` — all required light/dark pairs pass; four evidence states remain
  shape-distinct.
- `node tools/screenshot.mjs --port 8099` — **16/16**, failed 0; the four dashboard light/dark
  desktop/phone images were opened and read.
- `node tools/screenshot.mjs --port 8099 --only dashboard --optical` — **4/4**, failed 0; desktop
  and phone overlays were opened and read.
- `tests/site-release.test.mjs` pins all three chart hosts, the Recharts/shadcn primitives, the
  bundle allowlist, release CSP support and removal of the old graph implementations;
  `tests/cloudflare-access.test.mjs` pins the same CSP support on the protected delivery route.
