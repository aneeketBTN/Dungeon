# T6 classified coverage — verification

Date: 2026-08-20  
Branch: `fix/theme-switch-and-login-theming`  
State: working tree only; not merged, not deployed

## Owner direction implemented

IBM's 73 uncovered syllabus ideas are implemented by idea type:

| Authored type | New records | Assessment contract |
| --- | ---: | --- |
| Foundational layer | 20 | written + MCQ/objective |
| Named framework/model | 29 | written only, with a written concept link |
| Bounded concept/distinction | 20 | MCQ/objective only, with boss linkage |

The original sixteen IBM records remain layer concepts, making the complete IBM catalogue 36
layer / 29 framework / 20 concept = 85 records. Four of the 73 misses were honest wording repairs
on those existing layers (Grameen Bank, Aravind Eye Hospital, volume output and credit access), so
the remaining 69 are new records. Generic lesson-grounded caselets are practice and do not claim
to reproduce the unreleased examination case.

## Coverage

Command:

```text
npm run check:tested
```

Result:

```text
BRGSA   417 questions   29 concepts    69/69   100%
IBM     936 questions   85 concepts    90/90   100%
SCLM    516 questions   36 concepts    84/84   100%
SPMS    958 questions   69 concepts   116/116  100%
ALL    2827 questions  219 concepts   359/359  100%
TAUGHT-NOT-TESTED GATE: PASS
```

`data/syllabus/tested-floors.json` is ratcheted to 100 for all four subjects. No syllabus alias was
added and no floor was lowered.

## Bank structure and craft

Command:

```text
node tools/validate_t6_bank.js "C:\Users\knigh\OneDrive\Desktop\exam\Term 6 Clean Transcripts"
npm run check:spine
npm run review
```

Result:

- Bank validator: 0 errors.
- IBM: 936 questions, 240 bosses, 167 constructed responses.
- IBM correct-answer length rank: 23% / 26% / 23% / 28%; spread 0.03.
- IBM spine: 107 edges, 27 cross-module, 0 isolated; surfaces per concept 4/14/18.
- Whole spine: 219 concepts, 0 isolated.
- Review: bank, naming, delivered-run craft, absolute bias, palette, release build and exam
  readiness all PASS.
- The generated written framework link uses `writtenMode: case`; `integrated` remains reserved for
  the four authored whole IBM scenarios, and every seeded IBM paper still leads with all four.

## Tests and release checks

```text
npm test
```

Result: **129 tests, 129 pass, 0 fail**.

The added regression walks all 85 IBM records and proves:

- layer concepts have active written and objective surfaces;
- frameworks have only short-answer surfaces, including short, case and a linked written surface;
- atomic concepts have no short answer and do have linked boss coverage.

Additional results:

- `npm run build`: 19 public assets prepared.
- `npm run check:syllabus`: 359/359 taught, PASS.
- `npm run check:taught`: PASS against the accepted six-term backlog.
- `npm run check:names`: all nine families within their limits.
- `npm run check:exam`: 0 errors; one pre-existing SCLM repeated-match-prompt warning.
- `check_lesson_file`: 0 errors; 101 lessons remain readable-only.
- lesson-to-lecture match: expected-state FAIL naming `SPMS-M01-L01` only.

## Browser verification

The rebuilt local app was opened on a clean local origin and read from the rendered DOM.

- Subject rail: `0/69 concepts Strong` SPMS, `0/29` BRGSA, `0/85` IBM, `0/36` SCLM.
- IBM hero: `0 / 85`, `concepts Strong`.
- IBM concept section: `IBM · 85 concepts · 100% of the syllabus`.
- IBM module steps list the 85 records in lecture order, including the repaired Grameen Bank and
  Aravind Eye Hospital wording.
- The old sentence “Each step teaches two concepts” is absent; the current copy says each step
  gathers one module's concepts and rests on the ones before it.

The rail number is a learner-mastery denominator over concept records. It is deliberately separate
from named-idea coverage, whose denominator is the 90-item IBM syllabus list.
