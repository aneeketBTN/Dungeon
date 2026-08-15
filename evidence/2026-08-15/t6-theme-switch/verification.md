# Verification — the theme switch, the route it never had, and the door to the product

`VERIFIED(REAL_BROWSER + AUTOMATED)` · 2026-08-15 · branch `fix/theme-switch-and-login-theming`
· not merged, not deployed.

The ask was a question: "is the light/dark mode not working?" The answer turned out to be three
defects at three different depths, and the first measurement taken was wrong about two of them.
Server port **57843**.

---

## Verdict

| Claim | Verdict |
| --- | --- |
| The toggle changes the theme in the app | **Locally yes, in production no** — the script it needs 404s |
| A switch repaints everything on screen | **No** — 34 of 35 transitioned surfaces kept the old theme |
| The login and privacy pages follow the theme | **No** — both pinned `color-scheme: light` |
| Light theme is unchanged by this work | **Yes** — every light value is byte-identical |

---

## D1 · `theme.js` shipped for three days with no route

`app/theme.js` is in the build allowlist (`tools/build-site.mjs`) and in `t6.html`'s `<head>`,
so it deployed and every signed-in learner requested it. `cloudflare/src/index.mjs` never mapped
a URL to it: `learnerAssetPath()` lists `t6.html`, `t6.css`, `t6.js`, `release-manifest.json`,
`robots.txt` and `sets/`, and nothing else, so the request fell through to the router's closing
404.

The discriminator is **404 against 401**. A gated asset answers `LOGIN_REQUIRED` to a signed-out
request, which proves a route exists and the session gate is doing its job. Only `NOT_FOUND`
means no URL reaches the file at all. Measured against the real worker, signed out:

| Path | Before | After |
| --- | --- | --- |
| `/dungeon/t6.css` | 401 `LOGIN_REQUIRED` | 401 `LOGIN_REQUIRED` |
| `/dungeon/t6.js` | 401 `LOGIN_REQUIRED` | 401 `LOGIN_REQUIRED` |
| `/dungeon/login.css` | 200 | 200 |
| **`/dungeon/theme.js`** | **404 `NOT_FOUND`** | **200** |

Consequence in production: `window.T6Theme` undefined, so `t6.js`'s
`if (!button || !window.T6Theme) return;` made the toggle a button that does nothing. The app
still followed the operating system, because `light-dark()` needs no JavaScript — so the failure
was invisible to anyone whose system already matched what they wanted, which is most people
most of the time.

The route is placed above the session gate beside `login.css` and `login.js`, because the login
and privacy pages read the same stored choice. Nothing learner-identifying is exposed: the file
is a theme bootstrap and holds no profile.

**Gate:** `tests/cloudflare-access.test.mjs` — "every local asset a shipped page references has
a route" parses each shipped page for local `src`/`href`, resolves each against the URL that page
is actually served at, and fails on 404. **Negative control run:** with the new route deleted the
test fails and names all three pages —

```
app/t6.html asks for theme.js -> /dungeon/theme.js (404)
app/login.html asks for theme.js -> /dungeon/theme.js (404)
app/privacy.html asks for theme.js -> /dungeon/theme.js (404)
```

The build allowlist proves a file is **deployed**; it has never proved a URL **reaches** it.
Nothing in the repo asserted the second thing until now.

## D2 · A transitioned property does not follow a `light-dark()` re-resolution

Flipping `color-scheme` re-resolves every `light-dark()` token — unless that property is being
transitioned, in which case it keeps the previous theme's value and **stays wrong until something
else forces a style recalculation**. Not a flicker; still wrong two seconds later.

Controlled experiment, five identical probe elements with `background: light-dark(#fff, #000)`,
system flipped to dark, read after 1.2s (correct answer `rgb(0,0,0)`):

| `transition` | Result |
| --- | --- |
| *(none)* | `rgb(0,0,0)` — follows the theme |
| `.15s ease` (i.e. `all`) | **stuck** on `rgb(255,255,255)` |
| `background-color .15s ease` | **stuck** on `rgb(255,255,255)` |
| `background .15s ease` | **stuck** on `rgb(255,255,255)` |
| `border-color .15s, background .15s` | **stuck** on `rgb(255,255,255)` |

So it is any transition covering the property, not a shorthand quirk.

On the real dashboard, of the 35 visible elements carrying a background transition, **34 kept the
previous theme's fill across a switch** — every `.button` on screen. That is what "the theme
toggle only half works" looks like from outside.

**Two earlier measurements in this session were wrong and are corrected here**, because both
failure modes are worth knowing:

1. A synchronous read immediately after `T6Theme.set()` reports the *old* value for any
   transitioned property, because no frame has elapsed. That produced a false positive on
   `.toast`, which I then wrongly dismissed as pure artefact.
2. Injecting a `transition: none !important` stylesheet to establish ground truth **forces the
   very recalculation that repairs the frozen value**, so the "before" and "after" snapshots
   agree and the probe reports 0 defects. This is how the first sweep concluded "0 of 513 stuck"
   on a screen with 34 stuck elements. Measuring the same property before and after a flip,
   without touching the stylesheet, is the version that can actually fail.

**Fix:** `repaint()` in `app/theme.js` sets `data-theme-switching` on `:root`, changes the
attribute, reads `offsetWidth` to force the recalculation while transitions are still suppressed,
then releases. `t6.css` and `login.css` each carry the one-frame rule. Release is by
`requestAnimationFrame` **and** a 100ms timer: a tab that is not compositing never receives a
frame callback, and the attribute disables every transition on the page while set, so a switch in
a background tab would otherwise leave the product with no animation at all. Confirmed necessary
— during verification the pane was not compositing and the rAF-only version left the attribute on
the root permanently.

Measured after the fix, same probe, no stylesheet injected:

| | Before | After |
| --- | --- | --- |
| Visible elements with a background transition | 35 | 35 |
| Frozen on the old theme across a switch | **34** | **0** |
| Round-trips light → dark → light | — | yes |
| `data-theme-switching` released | — | yes |
| Transitions still work afterwards | — | yes |

## D3 · The door to the product ignored the theme entirely

`app/login.css` pinned `color-scheme: light` at line 2 and declared one hex per token;
`login.html`, `privacy.html` and `admin.html` never loaded `theme.js`. Measured on the login page
with `dark` stored:

```
storedThemeChoice: "dark"     systemPrefersDark: true
themeJsLoaded:     false      rootColorScheme:   "light"
bodyBg:            rgb(244, 241, 232)   ← light; both signals ignored
```

Login is the **first** screen, so a learner on a dark phone met a full white page before reaching
any control, and one who had chosen dark inside the app was thrown back to light on sign-out or
on the privacy notice.

Fixed by pairing the palette on the same contract as `t6.css`: 9 tokens became `light-dark()`
pairs, 7 more were added for things that had been literals, and **16 one-theme literals across
the file were tokenised, leaving none**. The dark branch is lifted from `t6.css` rather than
invented, so the two halves are one product at night.

The literal that mattered was `.brand-mark { color: white }` over a `background: var(--ink)`
fill. Give `--ink` a dark branch and that fill turns pale while the mark stays white — invisible.
It is now `--on-ink`, and a fill and the text on it are separate tokens by rule.

**Every light value is exactly what it was before**, which is the property that lets this ship
without re-accepting the light theme: panel `#fffdf7`, paper `#f4f1e8`, brand mark white on
`#10231d`, measured in the page after the change.

### Contrast, all 51 text-bearing elements, both themes

Every `[hidden]` panel was revealed and every `<details>` opened first, so the agreement, group
and device-switch surfaces are audited in their shown state rather than only their hidden one.
Effective background is composited up the ancestor chain through translucent fills.

| | Light | Dark |
| --- | --- | --- |
| Elements checked | 51 | 51 |
| Below WCAG AA | **0** | **0** |
| Worst ratio | 4.73:1 (need 4.5) | 5.97:1 (need 4.5) |

The dark column found two real failures on the first pass — the agreement checkbox labels at
**1.22:1** and **2.21:1** — which were D2 in miniature: `.agreement-check` transitions
`background`, so it held the light panel colour under dark text. They are the reason D2 was found
at all, and they are clean now because D2 is fixed, not because the colours were adjusted.

### House UI probe on the login page

`tools/browser-checks/ui-audit.js` evaluated in the page, both themes, both viewports:

| | 375×812 dark | 375×812 light | 1280 |
| --- | --- | --- | --- |
| overflow / clipped / circleFit / overlaps | 0 | 0 | 0 |
| tapTargets / density / typeTooSmall | 0 | 0 | 0 |
| ragged / hiddenScroll / cutRows / barInset | 0 | 0 | 0 |
| sideways scroll | false | false | false |

`radiiOffScale` reports a 14px radius on `.brand-mark` and three siblings, identically in both
themes and at both widths. It is pre-existing — `login.css` has always used its own radii and no
geometry was touched here — and is left alone rather than folded into a colour change.

### Theme states, measured on `privacy.html`

| Stored choice | System | Result |
| --- | --- | --- |
| none | dark | dark — follows the system |
| none | light | light — follows the system |
| `dark` | light | dark — the pin wins |
| back to `system` | light | light |

---

## Automated

| Gate | Result |
| --- | --- |
| `npm test` | **104/104** (103 before; +1 new route gate) |
| Route gate, negative control | fails with the fix removed, names all three pages |
| `node tools/check-palette.mjs` | all required pairings within tolerance in both themes |
| `node tools/build-site.mjs` | 18 public assets, unchanged |
| `node --check app/theme.js`, `app/t6.js` | clean |

---

## Not done

- **`app/admin.css` is untouched** and still pins `color-scheme: light` with 38 one-theme
  literals and no `theme.js`. The owner scoped it out explicitly; it is an internal tool, and the
  new route gate does not fail on it because `admin.html` references no missing asset.
- **No second reader** on any of this.
- The `radiiOffScale` finding above is reported, not fixed.
