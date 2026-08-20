# Verification — IBM is the first subject complete: 78 of 78 lectures

`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)` · 2026-08-18 · branch
`fix/theme-switch-and-login-theming` · not merged, not deployed.

The ask was to keep authoring until one subject finished. **IBM is finished** — every one of its 78
lectures now has a lesson, the first subject to reach that state. Server port **8099**.

---

## Verdict

| Claim | Verdict |
| --- | --- |
| IBM complete | **Yes** — 78/78 lectures, all 8 modules |
| Source fidelity held across 32 lessons | **Yes** — every figure and term grep-verified first; 0 invented-vocabulary warnings |
| Prose stayed inside the house range | **Yes, after correction** — 8 drafts exceeded it and were trimmed before commit |
| Scheduling still correct | **Yes** — LAW-47 12 routes on IBM, 0 violations |

---

## What was authored

**32 lessons in this stretch**, completing modules 3, 5, 7 and 8 (2, 4 and 6 were finished earlier
today).

| module | lectures added | module state |
| --- | --- | --- |
| M03 — microfinance, Rang De, IDE | L01, L02, L04, L06, L07, L08, L09, L10, L11, L12 | **12/12** |
| M05 — Reliance banana chain, SELCO | L01–L06, L08, L09, L11, L12 | **12/12** |
| M07 — FPOs, GNFC neem | L01, L02, L03, L06, L07, L08 | **8/8** |
| M08 — impact investment, climate | L02, L03, L04, L06, L07, L08 | **8/8** |

The lesson file went **178 → 210**. Backlog **105 → 73** (SCLM 33, SPMS 40).

---

## Source fidelity

Every batch was grep-verified against its module transcript **before** any prose was written, with
first-appearance position so nothing is glossed ahead of the course's own usage. Roughly **330
candidate terms and figures** checked across the four modules, with **zero misses** — and the bank
validator reports **0 errors** with none of its ten standing warnings naming a new lesson.

Two source handling notes worth keeping:

- **`IBM-M08-L02` and `L03` embed Hindi and Marathi voiceover transcription.** Those runs were
  stripped before reading and none of it was reproduced; the lessons are written from the English
  argument only.
- The Aravind/cardiac slip in `IBM-M02-L11` and the Pratham example's own reversal (below) are both
  cases where the transcript's surface reading is not what the course means. Neither was copied
  through.

---

## The house-style check earned its place

Eight `worked.because` drafts across these batches came in above the 521-character house maximum —
`SCLM-M04-L08` at 534 earlier, then `IBM-M05-L05/L06/L09/L11`, `IBM-M07-L01/L06/L07`,
`IBM-M08-L03/L06/L07`. Every one was measured and trimmed **before** commit rather than found
afterwards. The check is now run as part of each insert, and no lesson in the file exceeds the
range.

One mechanical defect is worth recording because it nearly shipped silently. An insert script built
em dashes by string concatenation (`" + D + "`) inside what was actually a single Python literal, so
**17 glossary entries were written into the JS as concatenation against an undefined variable**.
`check_lesson_file.mjs` caught it immediately as `parse failed: D is not defined` — which is exactly
the LAW-50 argument for running the structural gate before the bank validator, since a file that
does not parse tells the validator nothing at all.

---

## Handoff repairs

Inserting into a module keeps falsifying the `connects` of the lesson above the insertion point.
Four more were repaired in this stretch, on top of the two earlier today:

| lesson | promised | why it broke |
| --- | --- | --- |
| `IBM-M03-L05` | "the next module builds livelihoods through work" | L06–L12 now follow it |
| `IBM-M05-L07` | "the next case shows an entrepreneur who designed around it" | that is SELCO at L10; L08/L09 now sit between |
| `IBM-M05-L10` | "Module 6 turns to skills and waste" | L11 and L12 now follow; the line moved to L12 |
| `IBM-M07-L05` | "Module 8 asks who funds all of this" | L06–L08 now follow; the line moved to L08 |
| `IBM-M08-L01` | "the last lecture is how" | L02–L04 now follow |
| `IBM-M08-L05` | "IBM is complete…" | L06–L08 now follow; the line moved to L08 |

Six instances in one day makes this the single most reliable defect in this work. The plan records
it; checking the `connects` above every insertion point is now part of the procedure.

---

## Gates

| Gate | Result |
| --- | --- |
| `node tools/check_lesson_file.mjs` | `ok: true`, **0 errors** |
| `node tools/validate_t6_bank.js "<transcripts>"` | **errors: 0**, 10 standing warnings, none on a new lesson |
| `node tools/measure-syllabus-coverage.mjs --gate` | **PASS**, all four subjects 100% |
| `node tools/check-taught-vocabulary.mjs --gate` | **PASS** |
| `npm test` | **120/120** |
| `node tools/build-site.mjs` | 19 assets |
| `node tools/screenshot.mjs --port 8099` | **16/16 ok, 0 failed** |

## Real browser

LAW-47 through the committed check, real subject rail, empty `lessonsRead`, IBM selected:
**12 routes, 0 violations, 0 skipped** — sets 1 to 9 and all three builder presets.

`ui-audit` fetched from the server and evaluated in the page, lesson index open with seven of the
new lessons expanded: **0** on overflow, clipped, circleFit, overlaps, tapTargets, ragged,
hiddenScroll, cutRows, barInset and sub-floor type at 1280; no sideways scroll.

The lesson index now renders **78 per-lesson disclosures for IBM** — one per lecture in the course —
and the coverage line reads "16 taught in practice · **62 readable here only** · 100% of the
syllabus". Four string probes confirm full bodies rather than titles: the biochar mechanism, the
10,000-to-1 staff ratio, the RBI 30-to-35% figure, and the 500-rupee transaction-cost argument.

---

## Status

**IBM is the first subject where every lecture has a lesson.** Scored coverage is unchanged at
100% — it already was — so what this buys is continuity: the module now reads as a course rather
than as isolated cases, and all 78 are readable in the lesson index.

All 32 lessons are new prose and carry `WAITING_OWNER_CONTENT_ACCEPTANCE`. Combined with the
fourteen from earlier today, **46 lessons are now unread by anyone**. Not merged, not deployed.

**Still open:** 73 lectures (SCLM 33, SPMS 40); no second reader on any lesson prose; the
pre-existing course-order inversions in the lesson file; `app/admin.css` still ignores the theme by
owner decision.
