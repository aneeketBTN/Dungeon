# The bank stops answering to craft

`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)` · branch `codex/measurement-foundation` · 2026-08-15

Two exploits are closed across all four subjects. Name-matching — "keep the options that
name the thing this set is called" — paid **45–60%** inside a study set and **100% on 62
of 62** `term_cloze` option sets. Eliminating the absolutes paid **41.2%** on the SPMS
paper. Both now sit at or under chance in every family, on both surfaces.

**Quick check:** `npm run review`.

---

## Persona results — the measurable improvement

Every rule, both surfaces, all four subjects. Chance is 25%.

### The paper (mean of seeded sets 1–3)

| Subject | noAbsolutes | longest | combined |
|---|---|---|---|
| SPMS | 41.2 → **22.7** | 32.1 → **19.8** | 34.5 → **16.3** |
| BRGSA | 36.6 → **14.9** | 18.4 → 29.7 | 37.8 → **15.3** |
| SCLM | 29.5 → **25.2** | 15.2 → 22.5 | 24.5 → **20.1** |

`fixedB` and `onTopic` are unchanged by construction — slots are dealt flat and the paper
spans sixteen concepts.

### The delivered study run

| Subject | topicMatch | noAbsolutes | combined |
|---|---|---|---|
| SPMS | 53.8 → **25.0** | 28.8 → **19.2** | 50.0 → **19.2** |
| BRGSA | 44.9 → **26.9** | 24.4 → 26.3 | 37.8 → **28.2** |
| SCLM | 46.4 → **26.8** | 27.4 → **20.2** | 48.2 → **22.0** |
| IBM | 59.6 → **26.9** | 37.8 → **21.2** | 67.3 → **23.1** |

IBM's combined run went from beating two thirds of its own study set to below chance.

### Bank-wide, per family

| Family | sets | name-match | absolutes |
|---|---:|---|---|
| `term_cloze` → **`contrast`** | 62 | 100.0 → **25.0** | — → 24.0 |
| `repair_cloze` | 62 | 81.9 → **25.0** | 24.3 → 26.0 |
| `case_cloze` | 124 | 70.8 → **25.0** | 31.5 → **22.2** |
| `explain` | 47 | 66.0 → **25.0** | 43.1 → **16.5** |
| `bridge_cloze` | 62 | 48.5 → **25.0** | 27.0 |
| `boss` | 480 | 41.3 → **29.6** | 33.1 → **23.6** |
| `apply` | 47 | 36.2 → **25.0** | 45.8 → **20.0** |
| `authored` | 120 | 29.8 | 31.4 → **23.7** |
| `connect` | 47 | **0.5** (untouched) | 20.1 |

**324 → 23** option sets where name-matching pays 100%. Both gates exit 0.

---

## What the audit changed about the job

**The prescribed diagnosis did not survive measurement.** §3.1/§3.2.1 attribute
name-matching to distractors borrowed from other concepts and prescribe `relevantWrong()`
everywhere. But `explain` and `apply` already used authored **same-concept** distractors
and still paid 66.0% and 36.2%. The rule is `argmax`, not presence: **195 of 384** of
those distractors *do* name the concept and were eliminated anyway for naming it less
densely. Genuine cross-concept borrowing was confined to `repair_cloze` and
`bridge_cloze`.

**`boss` had never been measured** — 480 option sets, the largest family in the bank,
folded into "other" by every earlier cut.

**`connect` at 0.5% was the worked example.** It names the concept in every option. The
pattern was proven and shipped here; it had simply never been applied elsewhere.

---

## The fixes

**Name-matching — `connect`'s direction.** `attributeTo()` in `t6_challenges.js` and
`labelOptions()` in `t6_catalog.js` label every option in a set with the concept under
test. **No authored word changes**; over-claims keep their "alone" and "only".

**`term_cloze` retired → `contrast`** (owner decision). A label-selection item is 100%
name-matchable *by construction*. Deleting it was unavailable — the bank floor is 792
items and every concept needs ≥10 surfaces and ≥8 families — so `contrast` replaces it:
all four options are claims about *this* concept, three being neighbours' claims wearing
its label. 96.9% → 25.0%.

**Absolutes — two honest levers, and one that was refused.**

1. **Filler removal, 23 strings.** `simply` is an intensifier by definition, and `\ball\b`
   / `\bany\b` were matching "at all" and "in any way", which are not universal
   quantifiers. "The job is simply the list of features customers copy" states the
   identical misconception without it. Only **9.6%** of absolute-carrying distractors were
   filler; the other 90.4% are load-bearing and were left alone.
2. **Correct answers stated at the course's real strength, 76 strings.** Every added
   universal is the condition already stated in that concept's own accepted `bridge` —
   "becomes a market **only** when the offer removes the barriers", "works **only** when
   repayment capacity stays real". This recombines the course's words rather than
   inventing a claim.
3. **Refused: manufacturing absolutes, and watering down distractors.** Neither was done.
   `bridge_cloze` sits at 27% *because* its correct answers already carry absolutes 40.6%
   of the time — lecture-derived prose naturally does. `summary`/`application` were hedged
   by house style, which is the artefact the tool was built to separate from real
   over-claims.

**Rejected on evidence before anything was written: stripping concept names from prose.**
It reaches the same numbers and produces "Lean this idea asks whether real people will
take a real action" and "a payment or signed it is a different category", and takes
`connect` from 0.5% to **26.6%**. Recorded in CONTENT-RULES R3.

---

## Five defects found by verification, not by the gates

1. **A length cue traded for a name cue.** Pronouncing a self-reference as "It" fires on
   **11 of 64** summaries — all correct answers — shortening only the correct option. SPMS
   earned a new validator warning immediately. Removed.
2. **Eight options with the same 36-character prefix.** Labelling `case_cloze`'s decision
   blank buried the differing words and misattributed a *decision* to a framework name.
   Fixed as a **trailing** tag; the rule matches a substring anywhere, so position is free.
   Dropping it entirely was measured too and cost 3–6 points.
3. **Appending clauses made the correct answer the longest.** Strengthening IBM by
   appending pushed "pick the longest" to **66%** — worse than the exploit being fixed. All
   76 rewrites were redone **in place**; IBM's rank-3 share went 0.50 → 0.38, flatter than
   baseline, and every subject's distribution improved.
4. **Two option-shape errors.** Taking module siblings unconditionally made
   `sclm_smoothing`'s summary tower over theirs. Fixed by routing selection through
   `relevantWrong()` (LAW-48's existing contract).
5. **A hypothesis that failed.** Unlabelling `explain` — on the theory that rewriting the
   summaries had evened the density out — sent it to **61.9%** with 22 of 47 sets at 100%.
   The label is load-bearing and stays, redundancy with the stem accepted.

---

## Owner-reported UI defects, fixed the same session

- **The bag is gone from the Examiner.** It is a Learn tool; the paper carries its own
  Calculator in `.exam-bar` and its own countdown, so nothing the paper permits is lost.
  Hidden on `:root[data-mode="exam"]`, which `showScreen` derives from the screen id and
  never stores. This also **ended a defect class rather than relocating it**: the bag used
  to be docked into the paper's top-right because it covered Submit (three students, one
  stuck six minutes), and docking then covered all but 18px of the theme toggle.
- **The two header bars now align.** `.app-header` used `clamp(16px,3vw,40px)` and
  `.exam-bar` used `clamp(12px,2.5vw,22px)`, so at 1280 the logo started at x=38.4 and
  "Section A" directly beneath it at x=22. Both now 38.4. The `padding-inline-end`
  reservations of 76px and 82px existed **only** to keep the docked launcher clear; with no
  launcher they reserved empty space against nothing, which was skewing the right edge.
- **The palette no longer cuts a row in half.** `max-height: 46vh` is an arbitrary slice of
  the window and almost never lands on a row boundary — on SCLM's 50-question Section A at
  1280×900 it resolved to 414px and cut row nine through the middle of the chips. A row is
  44px + 7px gap, so the height is now `calc(round(down, 46vh + 7px, 51px) - 7px)` = 401px,
  a whole eight rows. **0 chips cut** at 375 and 1280. A mask-fade was tried first and only
  made a half-chip look deliberate. The mobile rule is now pinned to the same row
  arithmetic, `calc(2 * 51px - 7px)` = 95px — **correction: its previous 100px was not
  cutting a chip.** Measured, the five spare pixels fell in the gap above row three, so
  nothing was drawn in half there; it is pinned so it cannot drift into the desktop's
  defect, not because it had it.
- **The paper is no longer top-heavy on mobile, and the sections are no longer cut off.**
  Measured at 375 on a live paper: a 66px header above a 75px bar meant **141px of chrome**
  before a word of the question, and `.exam-sections` had a **108px viewport over 266px of
  content** — "Section A" showed, Sections B and C were gone entirely along with their
  question counts. The header now hides during a running paper exactly as it already did
  mid-question on the practice screen (it carries the brand, the mocks count and the
  appearance control; the Learn/Exam switch is already withheld, and Submit is in the
  sticky footer). The freed row pays for the section tabs going full width beneath the
  clock: **343px of 343px, all three sections visible.**
- **Every state chip is now a regular shape.** The states were told apart by warping the
  box — `0 0 10px 10px` and `10px 10px 0 0`, a pair of tabs. Two things were wrong. The
  radius was absolute while the same class renders at 44px (palette), 26px (desktop legend)
  and **22px (mobile legend)**, so 10px was 23% of one chip and **45%** of another, and at
  22px the top corners met in a near-semicircle over a square bottom. Restating it as a
  percentage fixed the scaling and **not the look** — an asymmetrically rounded box reads as
  a distorted square at any size, and the owner reported it a second time. The distinction
  now moves off the outline onto two regular, orthogonal signals: **square vs circle** for
  marked-for-review, and **underline bar vs none** for answered. Five states from regular
  shapes, still readable without colour. *Note: `check-palette.mjs`'s shape-distinctness
  assertion covers the four `.dot` mastery states, **not** these chips — so it was never
  the thing holding the tab silhouettes in place.*
- **The clock went back to the trailing edge.** Moving the section tabs onto their own row
  left the clock and Calculator alone on the first one, and flex packs to the start, so the
  timer jumped from the right edge to the left. A regression introduced by the previous fix
  in this same file, reported immediately. `margin-inline-start: auto` restores it.

---

## Gates

| Gate | Result |
|---|---|
| `npm test` | **83/83** (was 78; +5 new) |
| `node tools/validate_t6_bank.js "<transcripts>"` | `ok: true`, **0 errors, 0 warnings**, coverage 4/4 — the pre-existing IBM length warning is gone |
| `node tools/measure-name-matching.js --gate` | **exit 0** (was exit 1, 7 families over) |
| `node tools/measure-absolute-bias.js --gate` | **exit 0** (was 5 families over) |
| `node tools/check-palette.mjs` | clean, four states shape-distinct |
| `node tools/build-site.mjs` | 18 assets + production worker |
| `node tools/screenshot.mjs --port <p>` | **16/16**, and they were read |
| `node tools/check_exam_readiness.mjs` | exit 1 — **pre-existing**, 2 SCLM numericals short |

**In the real browser:**

| Check | Result |
|---|---|
| `teach-before-test.js` (LAW-47) | `ok: true`, **0 violations** |
| `lesson-layering.js` | 40 sets, 257 pairs, **0 descents** |
| `primer-prediction.js` (LAW-63) | 16/16 primers, 0 findings, **`answerableFromTheConceptName: []`** |
| `export-run.js` | `unresolvedSteps: 0`, **`paperDigestMatch: true`** |
| `ui-audit.js` @ 375 and 1280, practice **and** exam screens | **0** overflow / clipped / circleFit / overlaps / ragged / **hiddenScroll / cutRows / barInset**, 0 sub-44px targets of ours |

### Three new UI detectors, and a checklist

All three of the owner's UI reports were found by eye on a screen `ui-audit.js` had just
called clean — the standing lesson being that a clean report from a probe blind to the
defect class reads exactly like a clean screen. So each became a detector:

| Detector | Catches | Verified firing on |
|---|---|---|
| `hiddenScroll` | a horizontal scroller showing <60% of its content | 70px viewport over 175px → **60% hidden** |
| `cutRows` | a scroll container drawing a child in half | 120px palette → **6 chips cut** |
| `barInset` | stacked top bars whose content starts at different x | header at 12px vs bar at 22px → **10px step** |

Each was reintroduced as a live fixture, confirmed to fire, and confirmed to go quiet on
restore — a detector that cannot fail is not a detector. `cutRows` correctly stays quiet
when the spare pixels land in a gap rather than on a chip, which is how the mobile
`100px` claim above was caught and corrected.

`docs/governance/UI-CHECKLIST.md` carries the rest — the checks that still need a person,
each row naming the defect that shipped past a green probe.

The 8 `tapTargets` hits at 375 are pre-existing sr-only radios — 1×1 inputs inside
`.choice` labels measuring 345×121px. The real target is the label.

**The failsafes fired.** `export-learn-run.mjs` refused a stale skeleton and **named the
ids** (`SCLM carries no question sclm_fit_term_cloze`) rather than emitting `unknown`.
`export-run.js` refused a second run in one page load (LAW-62).

---

## Two probe defects, both mine, both caught before they became findings

1. Reading `.coverage` instead of `.lessons.coverage` made a healthy validator look like
   the empty-coverage failure §0 warns about.
2. Loading `t6_catalog.js` without `t6_brgsa.js` yielded 48 concepts instead of 64, and
   BRGSA then scored 100% on `explain` while reporting "0 of 96 distractors missing the
   name" — resolved when it turned out **BRGSA carries no `confusions` or
   `applicationWrong` at all**. Both are asserted against in the test file.

---

## Built

- `tools/measure-name-matching.js` — R3's on-topic-ness gate, whose column said "none yet".
- `tools/measure-absolute-bias.js` — extended from 264 MCQs to **all 1064 option sets**,
  now reporting elimination payoff per family with `--gate` and `--table`.
- `tests/name-matching-gate.test.mjs` — five assertions on the gate itself.
- `tools/review-changes.mjs` + `npm run review` — every gate plus a readable page of the
  real option text per family. Defect 2 above is what it exists to catch.

## Not done

- **No new items authored** (§3.3) — no definition/scenario/numeric/judgement/transfer
  expansion. The improvement here is to existing items, not new coverage.
- **No examiner-only slice** (§4). Learn/paper overlap untouched at ~40–53%.
- **SCLM-M03-L06 lesson and the 2 missing numericals** — not authored; readiness still
  exits 1 for the same pre-existing reason.
- **BRGSA's four integrated scenarios** — still never served.
- **T1, T2, T4, T5 not built.** T3's missing half exists as the two gates; T6's reading
  pass covered the changed families on screen at both viewports, which is where three of
  the five defects above came from.
- **Not merged, not deployed, `main` untouched.**

## Content acceptance

76 correct answers were rewritten and 23 distractors had filler removed. All are new
learner-facing prose and are `WAITING_OWNER_CONTENT_ACCEPTANCE`; `npm run review` is built
for that read. The 48 `_cla` items from earlier on 2026-08-15 remain unread.
