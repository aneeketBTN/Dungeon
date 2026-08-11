# UI alignment pass and Access login repair

**Date:** 2026-08-12
**Status:** `VERIFIED(REAL_BROWSER + CLOUDFLARE_DASHBOARD)`

## Method

Irregularity was measured rather than eyeballed. A audit probe was injected into the
running page and run per screen at 1280×800 and 375×812, reporting: document overflow,
elements escaping the viewport, wrap containers whose children differ in width, touch
targets under 44px, and text clipped without ellipsis. Every finding below is a measured
number, and the fixes were re-measured after the change.

Two candidate findings were **rejected** as audit artifacts rather than defects:

- `.momentum-figure` reported two rows because `align-items: baseline` gives items of
  different heights different `top` values on the same visual row.
- Several `h: 1` and `h: 13` touch targets appeared only in states captured mid-render and
  did not reproduce on a settled layout.

## Findings and fixes

### 1. Match label tray was ragged — the reported defect

Measured at 1280: tablet widths `193 / 268 / 191 / 266`px wrapping 3-then-1 across two
rows, because `.tray-items` was `flex-wrap: wrap` over `inline-grid` tablets sized by their
own text. A tablet was also **wider than the 162px slot it drops into**, so the object being
picked up was visibly larger than the hole it belongs in.

Fixed by giving the tray the same grid track as the statements above it. `--statement-count`
moved from `.match-columns` to `.match-board` so both share it, and the tray gap was matched
to the column gap so the tracks line up exactly.

After: all four tablets `162px`, one row, and each tablet's left edge equals its slot's left
edge (`xAligned: [true, true, true, true]`). At 375px both collapse to a single column at
`319px`, still aligned.

### 2. No entry point in the match board — the "where do I look first" problem

Four statements of equal visual weight, each 7 lines in a 162px column, with nothing stating
an order to work through them. Statements are now numbered `1–4` with a `.statement-index`
badge while labels stay lettered `A–D`, so the task reads as "put a letter under each number"
and each side has an identity to refer to. The number badge reuses the existing
`--grey-soft` / `22px` / `radius 7px` treatment already used by `.option-key` rather than
introducing a new shape.

Content note, not fixed here: match choices span **13 to 179 characters** in BRGSA (a 14×
ratio). Layout can equalise the boxes, and now does, but boxes holding 13 and 179 characters
will never read as siblings. That is a generator constraint and belongs with the bank work.

### 3. Mastery key legend was four ragged lines

Measured widths `444 / 332 / 383 / 81`px, each on its own row under `flex-wrap`. Now a
two-column grid with the status dots aligned into two columns, collapsing to one column at
375px. Dots are baseline-corrected with `margin-top: 5px` against the first text line.

### 4. Subject actions stacked unequally at desktop width

`.subject-actions` sits in a 370px heading column but held buttons of `257px` and `187px`,
so they wrapped onto two rows at ragged widths at 1280 — reading as an accident rather than
a decision. Now a grid track (`repeat(auto-fit, minmax(200px, 1fr))`): equal width whether
side by side or stacked. After: both `248px`.

### 5. Touch targets under 44px on mobile

- `button#brand-home.brand` — `38px`. The brand mark shrinks on narrow screens, but the
  button is a real tap target; given `min-height: 44px` independent of the art inside it.
- `a.skip-link` — `43.3px`. Keyboard affordance rather than a touch target, but brought to
  44px for consistency.
- `button.label-tablet` — `40px`. These are dragged and tapped in the matching interaction;
  raised to `44px` at narrow widths.

After: zero sub-44px targets on the dashboard and practice screens at 375×812.

## Result

| Screen | 1280×800 | 375×812 |
| --- | --- | --- |
| Dashboard | 0 findings | 0 findings |
| Practice — primer / MCQ | 0 findings | 0 findings |
| Practice — cloze | 0 findings | 0 findings |
| Practice — match | 0 findings | 0 findings |
| Feedback panel | 0 findings | 0 findings |

No horizontal page overflow at either viewport. `node --check mock/t6.js` clean,
`node mock/validate_t6_bank.js` `ok: true` with 0 errors, `npm test` 34 passing,
`npm run build` 14 assets.

## Not covered

Boss, case-cloze, and constructed-response surfaces were not reached in a driven session —
synthetic label clicks do not register with the app's own selection handler, so the sweep
stalled before those types appeared. Their containers were checked statically against the
same defect class (auto-width wrap containers, sub-44px targets) and none of the six
`flex-wrap` containers in the stylesheet showed the pattern. This is weaker than the
measured acceptance above and should be closed with a real-input pass.

The results screen and the separate `login.html` / `admin.html` pages were also not audited
in this pass.

## Cloudflare Access login loop — fixed

The owner reported the Control Room bouncing between the site and Cloudflare until timeout.
The Worker was cleared first: its admin path contains no redirect loop, which is why the
earlier `access-check` diagnostic was added.

Inspection of the account (`c9ad5ea00fe0040b372163daf10ea235`) found a single Access
application, `Dungeon Owner Dashboard` → `aneeketdas.com/dungeon/admin*`, so the
overlapping-application hypothesis was wrong. The actual cause:

- `Accept all available identity providers` — **Off**
- accepted providers — **only `- cloudflare`**
- `Apply instant authentication` — **On**
- and **no Google identity provider exists on the account at all**

With exactly one accepted method and instant authentication on, Access skipped the provider
chooser and redirected straight into the Cloudflare flow. A Google session can never satisfy
that application, so the browser was redirected again immediately — no chooser, no error
page, bouncing until timeout.

Fix applied with owner approval: enabled the existing
`Dungeon one-time email code - onetimepin` provider alongside `- cloudflare`, and turned
`Apply instant authentication` **off** so the chooser is shown. `Accept all available
identity providers` was deliberately left **off**, so the gate does not auto-accept providers
added later. Destination, policy, and the 8h session duration are unchanged.

Verified by reloading the application: the provider field now carries two IdP ids
(`9c4f0251-…`, `eadaa9ba-…`) and instant authentication reads `Off`. The one-time code is
delivered to `beyondthenoisestudios@gmail.com`, which is the configured `OWNER_EMAIL`.

Owner action outstanding: sign in at `https://aneeketdas.com/dungeon/admin/` and confirm the
chooser appears and the emailed code admits. If anything still fails,
`GET /dungeon/admin/access-check` now names the reason.
