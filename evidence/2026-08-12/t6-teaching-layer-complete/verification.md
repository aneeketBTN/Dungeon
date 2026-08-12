# Teaching layer complete — all four subjects

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-12, branch `reorg/structure`.

Completes the 0→80 path started earlier the same day. SCLM and SPMS were the two subjects still
untaught; both are now authored to full scored coverage. **Every scheduled question in the bank is
now preceded by teaching for every lecture it cites.**

## What changed

26 lessons authored from the clean lecture transcripts:

| Subject | Before | After | Scheduled questions taught |
| --- | --- | --- | --- |
| BRGSA | 50 of 50 lectures | unchanged | 187 / 187 |
| IBM | 16 of 16 cited | unchanged | 177 / 177 |
| SCLM | 6 of 16 cited | **16 of 16 cited** | 69 → **180 / 180** |
| SPMS | 0 of 16 cited | **16 of 16 cited** | 0 → **180 / 180** |

Total: **433 → 724 of 724** scheduled questions fully taught. 106 lessons authored overall.

SCLM (10): M04-L04 sourcing portfolio, M04-L05 bullwhip, M05-L06 re-engineering drivers, M05-L13
FarmAid stockyards, M06-L05 Hasmukhbhai expansion, M06-L07 Rajashree engine-on-load, M07-L06 Laxmi
multimodal, M07-L07 Indian ports, M08-L01 LEADS, M08-L03 Akshaya Patra.

SPMS (16): M01-L05 DFV, M01-L10 Jobs to Be Done, M02-L04 TAM/SAM/SOM, M02-L10 crossing the chasm,
M03-L02 definition and positioning, M03-L06 Lean Canvas, M04-L02 value-based pricing, M04-L07 unit
economics, M05-L02 competition and alternatives, M05-L04 buyer's journey, M06-L05 requirements
engineering, M06-L08 customer→product→project requirements, M07-L01 MoSCoW, M07-L04 roadmap,
M08-L03 metrics and risk, M08-L05 data privacy.

## Automated results

```
node tools/check_lesson_file.mjs "<transcripts>"   → 0 structural errors
  BRGSA: COMPLETE — all 50 lectures
  IBM:   every CITED lecture authored (16 of 16)
  SCLM:  every CITED lecture authored (16 of 16)
  SPMS:  every CITED lecture authored (16 of 16)

node tools/validate_t6_bank.js "<transcripts>"     → ok: true, errors: 0, warnings: 1
npm test                                            → 35 passed, 0 failed
node tools/build-site.mjs                           → 15 public assets
node --check app/sets/t6_lessons.js                 → clean
```

The single remaining warning is pre-existing and unrelated to lessons: IBM option lengths place the
correct answer at length-rank 3 in 45% of 68 sampled questions against a 25% baseline.

## Real-browser results

Server `python tools/server.py 8099`, checked on `http://127.0.0.1:8099` rather than `localhost` so
the owner's saved session on the localhost origin could not be touched.

**LAW-47, all four subjects** — `tools/browser-checks/teach-before-test.js` logic evaluated in the
page, from an empty `lessonsRead` (the strictest case), across all 9 study sets per subject plus the
mixed builder:

```
BRGSA: 9 sets, mixed 20 items, 153 queue items
IBM:   9 sets, mixed 22 items, 148 queue items
SCLM:  9 sets, mixed 21 items, 147 queue items
SPMS:  9 sets, mixed 20 items, 147 queue items
→ ok: true, violations: []
```

595 queue items inspected, zero violations.

**Lesson delivery** — SPMS study set 1 builds as
`lesson:SPMS-M01-L10 → spms_jtbd_primer → spms_jtbd_explain → spms_jtbd_repair_cloze → lesson:SPMS-M01-L05`,
so a newly authored lesson is step 1 of 12, ahead of both its primer and every scored question.

**Lesson surface renders complete**: module/lesson label, title, "After this you can:" objective,
three explainer paragraphs, worked example, glossary entries, the handoff sentence, and the footer
"Nothing here is scored. The questions after it use these words."

**Console**: no errors.

## Defects found and fixed during this work

1. **LAW-50 recurrence.** `explainer: [ … ]` closed with `},` in the SPMS-M05-L04 record. Caught by
   `check_lesson_file.mjs` before the bank validator, exactly as the protocol orders the gates.
2. **False "invented vocabulary" warning.** The vocabulary gate builds `\b<term>\b`
   ([tools/validate_t6_bank.js:391](../../../tools/validate_t6_bank.js)), so a singular glossary term
   cannot match a plural-only occurrence. `public private partnership` was reported as absent from
   the SCLM transcripts although `public private partnerships` occurs three times. Resolved by using
   the course's own plural form, which is what LAW-49 asks for anyway. **The gate limitation itself
   remains** — a singular term against plural-only source still warns falsely.
3. **A lecture whose title does not describe its content.** `SPMS-M06-L08` is titled "Traceability",
   but the word appears only in its header; the body teaches the customer → product → project
   requirements chain. The lesson was authored for what the lecture teaches and titled accordingly,
   rather than inventing traceability content to match the label.

## Not verified

- **No screenshots.** The Browser pane was not compositing frames, so pixel-level acceptance of the
  lesson surface is still owed. Verification is DOM- and text-level.
- **Content acceptance.** All 106 lessons are new prose and remain `WAITING_OWNER_CONTENT_ACCEPTANCE`.
- **Uncited lectures.** 54 IBM, 55 SCLM, and 68 SPMS lectures have no lesson and no question citing
  them; they are never delivered. Coverage is complete for what a learner can reach, not for the
  whole course.
- **Not deployed.** This work sits on `reorg/structure` above commit `3c69d1e`. PR #1 merged
  `3c69d1e` into `main` at 11:20 IST on 2026-08-12, so the live cohort has the restructure and the
  first 80 lessons (BRGSA and IBM), but **not** the SCLM and SPMS lessons verified here. A change
  announcement is owed for what did ship.
