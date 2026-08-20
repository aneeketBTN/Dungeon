# SPMS module 8 is complete, the worst composite in the corpus is repaired, and only the browser found my own defect

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

| lecture | chars | what happened |
| --- | --- | --- |
| `SPMS-M08-L02` — Orchestration of Delivery and Support | 22,582 | **authored** |
| `SPMS-M08-L04` — Legal Aspects | 22,843 | **authored** |
| `SPMS-M08-L06` — Strategic Management | 19,070 | **authored** |
| `SPMS-M08-L07` — Competitive Strategy | 20,065 | **authored** |
| `SPMS-M08-L09` — ISPMA Framework for Startups | 21,165 | **authored** |
| `SPMS-M08-L10` — Responsible Product Management | 20,259 | **authored** |
| `SPMS-M08-L08` — Market Analysis | 16,437 | **composite rewritten** |
| `SPMS-M08-L05` — Data Privacy | — | gained `data fiduciary`, its own term |

Registered entries **272 → 278**; SPMS **73 → 79 of 84**; backlog **11 → 5**. **Module 8 is complete
(10 of 10)**, the seventh complete SPMS module. **Everything remaining is module 4.**

---

## The composite: the largest repair in the record, and it announced itself in its own title

`SPMS-M08-L08`'s lesson was titled *"Market analysis and responsible product management"*. `L10`
**is** Responsible Product Management. Two of its three paragraphs, its worked example and four of
its six glossary terms came from `L10`'s lecture; only the Magic Quadrant material was its own. Its
`connects` claimed to close SPMS with two lectures still to follow.

The measurement agreed before any of that was read:

| | ownLift | raw own | margin | nearest rival |
| --- | ---: | ---: | ---: | --- |
| before | **0.203** | 0.308 | −0.074 | `SPMS-M08-L10` |
| after | **0.519** | **0.623** | **−0.475** | `SPMS-M02-L09` (0.044) |

Raw own support of 0.308 sat at roughly **p05** — the bottom twentieth of 272 lessons. Against the
five composites repaired to date this is the largest single move:

| composite | ownLift before → after |
| --- | --- |
| `SPMS-M07-L08` | 0.113 → 0.395 |
| `SPMS-M03-L08` | 0.115 → 0.589 |
| `SPMS-M06-L09` | 0.130 → 0.481 |
| `SPMS-M06-L01` | 0.165 → 0.369 |
| **`SPMS-M08-L08`** | **0.203 → 0.519** |

### Third time the sweep's margin floor was too tight, and the signal that would have worked

`SPMS-M08-L08`'s margin was **−0.074**. The protocol's original Step 4c floor was `>0`; this
session widened it to `>-0.06` after `SPMS-M06-L01` (margin −0.011). **−0.074 is outside the
widened floor too**, so the corrected query would still have missed this one.

Three composites in one day have now sat below successive margin floors. The margin is the fragile
half of the condition and **own support is the robust half**: this lesson was at p05 on own support
alone, which is a far louder signal than a margin hovering near zero. The protocol's sweep is
updated to lead on own support and treat margin as corroboration rather than as a gate.

### The forced order paid out again

`L08` was unrepairable until `L10` existed to take back the responsible-management material, and
`L10` was in this batch. That is the fifth time the backlog has turned out to be what unblocks a
composite.

---

## Coverage: three terms rehomed, and one that was never L08's to hold

Stripping `L08` would have dropped four tracked syllabus terms. Each was rehomed **in the same edit
that removed it**, so no ratchet fired:

| term | moved to | why |
| --- | --- | --- |
| `dark patterns` | `M08-L10` | 4 occurrences in L10's transcript; 0 in L08's. Also already held by `M01-L09`. |
| `explainability` | `M08-L10` | 2 occurrences in L10's transcript; 0 in L08's. |
| `AI bias` | `M08-L10` | **0 occurrences anywhere in SPMS** — see below. |
| `data fiduciary` | **`M08-L05`** | **6 occurrences in L05's own lecture, 0 in L08's.** |

**`data fiduciary` was never `L08`'s term at all.** Its home is `M08-L05` *Data Privacy*, whose
lesson did not gloss it — so a term from one lecture had been sitting in a second lecture's lesson
while its own lecture went without. Added to `L05` where the course actually teaches it.

**`AI bias` occurs zero times in the whole SPMS corpus.** It is a syllabus-sheet phrase the lectures
never say — the course says *bias*, *algorithmic bias*, *gender bias*. Same class as
`Requirement lifecycle` and `Team roles`. It passes the LAW-49 vocabulary gate through the module
notes rather than the transcripts, which it did at `L08` and continues to do at `L10`; verified by
the bank validator raising no warning on it after the move.

---

## The defect the gates could not see, and the browser could

The `L08` rewrite was built inside a Python script that round-tripped the block through
`.encode().decode("unicode_escape")`. That mangled every em-dash into `â\x80\x94` — the UTF-8 bytes
of `—` read one byte per codepoint. **Eight mojibake sequences shipped into the working tree.**

Every automated gate stayed green through it:

- `check_lesson_file` parses the JavaScript — mojibake is valid string content.
- the bank validator checks glossary terms against transcripts — it does not read prose bytes.
- the match gate scores words — `â` is not a word it weights.
- `npm test`, the build, and all three ratchets: unaffected.

It was caught by **reading the rendered lesson in the running app**, where it appeared as
`the industry analysts â Gartner`. That is the same shape as the literal-`**` defect found on
2026-08-19 in `M02-L12`: *the content gates parse the JavaScript, not the output, so only the
browser check sees what a learner sees.* Two independent instances now, which is the argument for
Step 5 in one line.

**The avoidable cause:** the other three batches this session wrote their blocks with the file-write
tool and are byte-clean; only the block assembled through a shell/Python escape round-trip was
damaged. Repaired in place — 8 sequences replaced, 0 remaining `U+00E2`, 1,444 em-dashes intact,
still LF throughout — and re-verified in the browser at zero mojibake across the whole lesson index.

---

## Scores

| lesson | ownLift | margin | nearest rival |
| --- | --- | --- | --- |
| `SPMS-M08-L04` | **0.566** | −0.451 | `M08-L06` |
| `SPMS-M08-L06` | **0.528** | −0.427 | `M08-L09` |
| `SPMS-M08-L08` *(repaired)* | **0.519** | −0.475 | `M02-L09` |
| `SPMS-M08-L10` | **0.487** | −0.409 | `M01-L09` |
| `SPMS-M08-L07` | **0.480** | −0.362 | `M05-L02` |
| `SPMS-M08-L02` | 0.402 | −0.287 | `M03-L09` |
| `SPMS-M08-L09` | 0.401 | −0.253 | `M08-L06` |

p25 = 0.469, p50 = 0.552 across 278 lessons. Five of seven clear p25; `L04` clears p50.

**Two land below p25 and both have structural reasons**, recorded rather than smoothed over:

- `L02` (Delivery and Support) shares services vocabulary with `M03-L09`, the service-strategy
  lecture, which is its nearest rival at 0.115 — a wide gap.
- `L09` (ISPMA Framework for Startups) is a **synthesis lecture**: it recaps the entire framework,
  so its vocabulary is deliberately shared with every other lecture in the subject. Low
  distinctiveness is inherent to a summary lecture and is not evidence of misfiling. This is a new
  entry in the same family as the "Part 2" case found in module 7 — **the metric structurally
  under-scores lectures whose job is to span others**, and neither meets the sweep's condition.

**LAW-76 diff: zero untouched lessons moved by ≥0.02.** Third consecutive batch with no collateral
re-scoring.

---

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | `ok: true`, **0 errors**; SPMS 79 lessons |
| `validate_t6_bank.js "<transcripts>"` | `ok: true`, **0 errors**; 278 authored; coverage populated for 4 subjects; 9 warnings, **the only M08 one pre-existing** (`operational fulfilment` on `L01`) |
| `npm run check:syllabus` | **PASS** — SPMS 116/116, all four at 100% against 100% floors |
| `npm run check:taught` | **PASS** — no new untaught vocabulary |
| `npm run check:tested` | **PASS** — all four at floor |
| `check-lesson-lecture-match --gate` | **FAIL naming `SPMS-M01-L01` and nothing else** — the expected state |
| `npm test` | **128 / 128** |
| `node tools/build-site.mjs` | 19 assets |
| `tools/browser-checks/teach-before-test.js` | **`ok: true`, 12 routes × 4 subjects, 0 violations, 0 skipped** |
| `node tools/screenshot.mjs --port 8099` | **16 / 16**, 0 failed |

Console carries no JS errors; the only failing request is `/api/written-authority/health` → 404,
the hosted-marking probe the static dev server does not implement.

### Chain

All ten module 8 handoffs read correctly end to end after the repair. `L08`'s false
close-of-subject claim is replaced by a handoff to `L09`, and the closing line — *"That closes
SPMS…"* — moved to `L10`, which is where the course actually ends.

---

## Remaining backlog — 5, all SPMS module 4

`L03` Pricing Strategies (10,052), `L05` Pricing Diagnosis (20,297), `L06` Revenue Models (20,572),
`L08` Financial Management and Forecasting (8,516), and `L10` the Sriraman guest session
(**48,232 — the longest lecture in the course**).

Four of the five are ordinary; the guest session is nearly as long as the other four combined and
should be planned as its own sitting.
