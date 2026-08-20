# Verification — SCLM is the second complete subject: 71 of 71 lectures

`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)` · 2026-08-18 · branch
`fix/theme-switch-and-login-theming` · not merged, not deployed.

The ask was to continue the teaching-layer plan, with SCLM named as the next subject. **SCLM is
finished** — all 71 lectures now have lessons, the second subject to reach that state after IBM.
Server port **64229** (8099 was in use; `autoPort` assigned it).

---

## Verdict

| Claim | Verdict |
| --- | --- |
| SCLM complete | **Yes** — 71/71 lectures, all 8 modules |
| Source fidelity held across 33 lessons | **Yes** — every figure and term grep-verified first; 0 invented-vocabulary warnings against a new lesson |
| Prose stayed inside the house range | **Yes, after two corrections** — 5 `because` fields and 9 explainer paragraphs were measured out of range and trimmed before close |
| Two shipped lessons taught the wrong lectures | **Found, then fixed** — see §R1; it was two, not the one first reported |
| Scheduling still correct | **Yes** — LAW-47, 12 routes on SCLM, 0 violations, 0 skipped |
| Nothing pre-existing was broken | **Yes** — 243 lessons parse, `npm test` 120/120, build 19 assets |

---

## What was authored

**33 lessons**, completing SCLM modules 2, 3, 5, 6 and 7. Modules 1, 4 and 8 were already complete.

| module | lectures added | module state |
| --- | --- | --- |
| M02 — forecasting | L01, L02, L05, L07, L08, L09, L10, L11 | **12/12** |
| M03 — inventory | L02, L04, L07, L08 | **8/8** |
| M05 — re-engineering, FarmAid | L02, L03, L04, L05, L07, L08, L09, L10, L11, L12 | **13/13** |
| M06 — service providers | L01, L03, L04, L06, L08, L09, L10 | **10/10** |
| M07 — transport, Laxmi Transformers | L01, L03, L04, L05 | **7/7** |

The lesson file went **210 → 243**. Backlog **73 → 40**, all of it SPMS.

Scored coverage does not move — SCLM's 17 cited lectures were already taught. What this buys is
continuity: the lesson index now renders **71 per-lesson disclosures** for SCLM and its coverage
line reads "**17 taught in practice · 54 readable here only**".

---

## Source fidelity

Every batch was grep-verified against its module transcript **before** any prose was written. Two
checks per batch:

1. `grep -oic "<term>"` on the module file for each intended figure and phrase — roughly **250
   figures and phrases** across the five modules, zero misses.
2. A first-appearance check mirroring `validate_t6_bank.js`'s own `firstUse()` (same
   normalisation, same symmetric plural tolerance) for every intended glossary heading, so no term
   was glossed before the course uses it.

That second check caught one term before it was written: **`backward integration` does not occur in
the SCLM transcripts.** `SCLM-M05-L02`'s lecture says the federation "backward **integrated** into
animal husbandry", and the gate's plural tolerance does not bridge `integrated` → `integration`. The
idea is carried in the explainer prose and only `forward integration`, which does occur, became a
heading.

Two transcript slips were **not** reproduced:

- `SCLM-M02-L09` says "It is simply 24 spread across 3 changes" and then computes `28 ÷ 3 = 9.33`.
  The lesson uses 28 and 9.33.
- `SCLM-M05-L12` says "That gave 5 rupees 3 rupees, sorry, 3 rupees per tractor per kilometer".
  The lesson uses ₹3 (= ₹15 ÷ 5).

Bank validator: `errors: 0`, and of its ten standing warnings **none names a lesson written today**.
The one SCLM warning names `SCLM-M03-L01` (`inventory functions`), which predates this session.

---

## Defects found and fixed in this session

### D1 — LAW-50 recurred, in six blocks at once, and the pre-commit measurement caught it

Six `explainer: [ … ]` arrays in the SCLM-M02 batch were closed with `},` instead of `],`. The
structural gate would have caught it, but only after the file had been written. It was caught
**before insertion** because the house-style measurement script parses the explainer to count its
words, and the word counts came back at 467–561 against a ~250 budget — the regex had run past the
mis-closed array into the glossary.

The lesson is that a length measurement is also a structure measurement. `measure.js` now checks the
closer directly rather than inferring it from an implausible word count. **This is LAW-50's fourth
recorded recurrence** and the first caught before the file was touched.

### D2 — a Python text write flipped the whole lesson file to CRLF

Two handoff repairs were applied with `io.open(path, 'w')` in Python, which on Windows translates
`\n` to `\r\n`. That rewrote **all 6,448 lines** of `app/sets/t6_lessons.js` to CRLF.

`.gitattributes` says why this matters, in its own words: the repository is LF-native because
`tools/build-site.mjs` copies files straight from the working tree into `dist/client`, so a
line-ending conversion changes the bytes the Worker serves and every asset hash with them. Git
would have normalised the commit, but a build run from that working tree would not have.

It surfaced because the next insertion could not find its `\n`-anchored insertion point. Converted
back to LF, verified at 0 CRLF, and every subsequent edit was made with Node instead. New law
proposed as **LAW-74**.

### D3 — nine explainer paragraphs sat outside the existing distribution

`ui-audit`'s `density` detector fired on ten paragraphs at 1280 light, and all ten were mine. As the
plan's own note says, the detector alone settles nothing — 81 of the shipped lessons already exceed
its 260-character threshold. So the test applied was the **existing distribution**:

| | n | median | p90 | p99 | max |
| --- | ---: | ---: | ---: | ---: | ---: |
| paragraphs shipped before today | 634 | 454 | 568 | 673 | 799 |
| my first draft | 99 | 541 | 695 | 880 | 880 |

**Exactly one of 634 pre-existing paragraphs exceeded 700 characters. Nine of my 99 did**, and eight
of the file's top eleven paragraphs were mine. Trimmed in two passes; the longest new paragraph is
now **695**, inside the existing p99, and the density list is again a mix of new and pre-existing
prose. Total explainer word counts were inside budget the whole time (235–298 against a ~300 gate) —
the imbalance was *within* lessons, one long paragraph and two short ones, which the word-count
check cannot see.

### D4 — four handoffs were falsified by insertion, as usual

`SCLM-M03-L01`, `SCLM-M06-L02`, `SCLM-M05-L01` and `SCLM-M05-L06` each promised something about
"the next session" that stopped being true once a lesson was inserted between. Two more,
`SCLM-M02-L03` and `SCLM-M02-L06`, were falsified the same way. All six repaired. That is now
**twelve** recorded instances of this defect; it is the most reliable failure in this work.

---

## Pre-existing defects found in passing

### R1 — two lessons did not teach their own lectures (reported, then fixed)

Found while checking handoffs. The shipped lesson for `SCLM-M02-L03` is titled *"Forecasting methods
and error metrics"* and teaches qualitative-versus-quantitative methods, the multiplicative seasonal
model, and MAD/MSE/MAPE. Its lecture teaches none of that. `SCLM-M02-L03` (*Forecasting Features*)
covers the four common features of all forecasts, the seven elements of a good forecast, and the
six-step forecasting process — and the error metrics belong to `SCLM-M02-L04` (*Demand Components
and **Forecast Accuracy***), which also has its own lesson.

Measured: `MAD` and `MAPE` occur in L04's transcript and **not at all** in L03's.

Consequences are bounded. Both lessons are uncited and read-only, so no scored path is affected and
LAW-47 still passes — the defect is content mapping, not gating.

**Closed the same day, on owner instruction — and it was worse than first reported.** Rewriting L03
meant reading L04, which showed the drift ran further: L04's opening paragraph taught L02's
push/pull material, and its other two covered only the demand components, so the *forecast accuracy*
half of a lecture titled "Demand Components and Forecast **Accuracy**" was taught by no lesson at
all. The whole module-2 opening sat one lecture off.

| lesson | now teaches |
| --- | --- |
| `SCLM-M02-L03` | the four features true of every forecast, the seven elements of a good one, and the six-step process as a loop |
| `SCLM-M02-L04` | the five demand patterns, then `Et = At − Ft`, mean error as bias, MAD, MSE and MAPE, with the lecture's own eight-day dark-store example (MAD 2.75, MSE 9.5, MAPE 1.28%) |
| `SCLM-M02-L05` | gained the qualitative/quantitative split its lecture opens on, which the first draft skipped |

The pre-existing L04-before-L03 file inversion was removed while both blocks were being replaced —
it is the most plausible cause, since the two lessons read as having been written from L04's
transcript in the order it was read. **The coverage gate caught the one thing the rewrite dropped:**
`Systematic component` had lived only in the old L04 glossary, SCLM fell to 99% against a 100%
floor, and the idea was taught back into L04's prose rather than aliased, per the standing rule that
a floor is a ratchet.

Re-gated after the rewrite: `check_lesson_file` **0 errors**, validator **0 errors** with no warning
naming either lesson, coverage **PASS at 100%**, taught-vocabulary **PASS**, `npm test` **120/120**,
build 19 assets, screenshots **16/16**, LAW-47 **12 routes on SCLM, 0 violations**, `ui-audit` **0 on
every detector**. Both rewrites sit inside the shipped distribution — 301 and 318 explainer words
against a file median of 234 and a max of 318, with no paragraph above 669. Both lessons were read
end to end in the running app.

**What this does not fix:** no gate checks a lesson's body against its own lecture. The id is
checked against the manifest and the glossary against the transcripts, and both passed throughout on
a lesson teaching the wrong material. Only reading the lecture finds this class of defect.

### R2 — `SCLM-M02`'s transcript order is not its teaching order

`SCLM-M02-L01` (*Associative Techniques*) opens "so far we have mostly used time series methods …
even with seasonality now" and closes the forecasting arc — its content belongs after L10 and before
L11. Positions L02 through L12 form a coherent ascending arc; only L01 is displaced.

Its lesson is therefore filed in the file **between L10 and L11**, with a comment at the insertion
point saying why, so the module reads as a path and every `connects` is true of what follows it. The
`lectureId`, `module` and `order` fields still match the manifest exactly. This is the third recorded
ordering anomaly in the lesson file, after SCLM module 1's L08/L06 inversion and M02's own
pre-existing L04/L03 inversion, which was left alone.

---

## Gates

| gate | result |
| --- | --- |
| `node --check app/sets/t6_lessons.js` | pass |
| `node tools/check_lesson_file.mjs "<transcripts>"` | `ok: true`, **errors: []** |
| `node tools/validate_t6_bank.js "<transcripts>"` | `ok: true`, **errors: 0**, 10 standing warnings, none naming a new lesson |
| `node tools/measure-syllabus-coverage.mjs --gate` | **PASS** — BRGSA/IBM/SCLM/SPMS all 100% |
| `node tools/check-taught-vocabulary.mjs --gate` | **PASS** — no new untaught vocabulary |
| `npm test` | **120/120** |
| `node tools/build-site.mjs` | 19 public assets |
| `node tools/screenshot.mjs --port 64229` | **16 shots, 16 ok** |

### LAW-47 — teach before test

Run in the page with SCLM selected, from an empty `lessonsRead`, after a reload so LAW-62 cannot
carry:

```json
{ "ok": true, "law": "LAW-47", "violations": [], "skipped": [],
  "checked": ["set 1: 12 items, 0 violations", "… set 9: 31 items, 0 violations",
              "builder 0 → 60: 40 items, 0 violations",
              "builder 60 → 80: 42 items, 0 violations",
              "builder 80 → 100: 29 items, 0 violations"] }
```

**12 routes, 0 violations, 0 skipped.**

### `ui-audit`, fetched from the server rather than pasted, all 71 SCLM lessons expanded

| detector | 1280×900 light | 375×812 dark |
| --- | ---: | ---: |
| barInset, circleFit, clipped, cutRows | 0 | 0 |
| hiddenScroll, overflow, overlaps, ragged | 0 | 0 |
| radiiOffScale, tapTargets, typeTooSmall | 0 | 0 |
| `pageScrollsSideways` | false | false |
| density | 10 (see D3; after trimming, a mix of new and pre-existing) | 10 |

`hiddenScroll` is **0** at 375 — the subject-rail fix from earlier today holds with 71 lesson
disclosures expanded on the page.

---

## Read in the running app

- 71 lesson disclosures for SCLM; index text **229,076 characters**.
- Coverage line: "**17 taught in practice · 54 readable here only**".
- String probes for the new lessons' titles, figures and derived values all present: `480.8`,
  `229.8`, `747.73`, `₹600 million`, `h = i·C`, `order-up-to level`, `unholy equilibrium`,
  `Kamadhenu`.
- `SCLM-M03-L07` read end to end as a learner sees it — objective, three paragraphs, worked example
  with all three fields, five glossary terms, handoff, and the `Read-only — no question cites this`
  label.
- Console: the only errors are five 404s on `/api/written-authority/health`, an endpoint the static
  dev server does not provide. Pre-existing and unrelated. Every app asset loads 200/304.

### Screenshots

16 of 16, read rather than counted. `lesson_SCLM_1280x900_light.png` shows the lesson screen
rendering correctly; the lesson it shows is `SCLM-M01-L04`, because the screenshot tool drives a
**study set** and none of today's lessons is scheduled — they are uncited by construction. Pixel
acceptance of the new prose is therefore the lesson-index reading above, not a shot.
`dashboard_SPMS_375x812_dark.png` confirms all four subjects visible at 375 with nothing clipped.

---

## Not done

- **No second reader.** The 33 new lessons plus the three rewritten ones carry
  `WAITING_OWNER_CONTENT_ACCEPTANCE`. With the 46 already waiting, **79 lessons are unread by any
  human**, and the three rewrites replace prose that had been accepted in an earlier batch.
- **The hole that hid R1 is still open.** No gate compares a lesson body against its own lecture.
  The manifest check and the vocabulary gate both passed throughout on lessons teaching the wrong
  material; only reading the lecture found it. A gate for this would need a similarity measure
  between lesson prose and transcript, which is a real piece of work and is not attempted here.
- Not merged, not deployed.
