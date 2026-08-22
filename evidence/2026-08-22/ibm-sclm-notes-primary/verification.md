# IBM/SCLM notes-primary Study verification

Date: 2026-08-22
Branch: `codex/notes-primary-chambers`
Deployment: local only; not pushed or deployed

## Delivered contract

- Study is the static and runtime first screen; persistent navigation is Study / Exam.
- All 283 authored entries, subject search, print/PDF, concept maps, worked moves and numerical
  exoskeletons remain in the Study reader.
- Every IBM and SCLM module ends in a rotating four-question chamber.
- IBM shape: definition choice, case decision, concept connection, short case paragraph.
- The IBM paragraph reveals one course-grounded answer spine. It has no second rubric step and writes
  no score or repair evidence from the paragraph itself.
- SCLM shape: three direct objective checks plus a numerical in modules 2–3 or matching elsewhere.
- Chamber misses write normal concept evidence and offer focused concept practice. Correct answers
  schedule nothing; misses do not create a hidden same-run reattempt.
- Leaving or finishing returns to the exact Study module. Repeating rotates the four-item sample.

## Numerical authorship audit

The current SCLM bank contains eight tolerance-graded numerical items, and each family has a Study
method:

| Family | Items | Source | Study method |
| --- | ---: | --- | --- |
| Exponential smoothing | 1 | M02-L06 | Forecasting and exponential smoothing |
| EOQ and annual cost | 2 | M03-L03 | EOQ and the annual cost at an order quantity |
| Newsvendor critical ratio | 1 | M03-L05 | Newsvendor and the critical ratio |
| Safety stock, reorder point, service level, inventory position | 4 | M03-L06 | Safety stock, reorder point, and service level |

All eight items are in modules 2–3. The module 6 cycle-time Study method is useful teaching but does
not yet have a tolerance-graded bank question. This change does not invent one.

## Automated verification

- Explicit full suite: **157 tests, 157 pass, 0 fail**.
- Production build: **24 public assets** and production worker prepared.
- Exam readiness: **0 errors, 0 warnings**; IBM 177 short-answer surfaces and SCLM 8 numerical
  surfaces remain available to the paper builder.
- Full change review: PASS for bank validation, R3 naming, Learn-side craft, absolute bias, palette,
  Mini rotation, release build and exam readiness.
- Revision-persona gate: PASS for all four subjects.
- Palette gate: all required pairings pass in light and dark; all evidence states remain
  shape-distinct.
- Dedicated regression coverage asserts the four IBM chamber shapes for all eight modules, the
  direct SCLM shapes for all eight modules, the exact eight-item numerical boundary, and the absence
  of confidence collection or hidden chamber reattempts.

## Browser verification

- Desktop: Study opens as the primary reader with only Study and Exam in persistent navigation.
- IBM module 1: three direct objective checks lead to one short case paragraph; reveal shows
  `Compare with the answer spine`, does not show `Check your response against the rubric`, and says
  `Nothing was scored or queued from this paragraph.`
- Phone, 375×812: SCLM module 1 shows a direct single-task prompt, reachable answer controls and
  `← Study` in the compact return control. Visual inspection found no horizontal overflow or clipped
  active control.

## Claim boundary

The directness assumption is transferred from the observed BRGSA paper at the owner's direction. It
does not claim knowledge of unseen IBM/SCLM questions, exact topic weights or faculty marking. The
chambers are samples for diagnosis; Examiner remains the complete-paper surface.
