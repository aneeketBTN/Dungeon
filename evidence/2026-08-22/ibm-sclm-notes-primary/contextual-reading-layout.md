# Contextual Study reading layout

Date: 2026-08-22
Branch: `codex/notes-primary-chambers`
Deployment: local only; not pushed or deployed

## Reading-order change

- Removed the module-opening `Start with the map` block.
- Verified that every one of the 219 concept records names an exact authored lecture.
- Render each concept summary in `Keep from this lecture` after that source lecture.
- Gave all eleven numerical exoskeletons an explicit source lecture and render them inside that
  lecture after its worked explanation.
- Moved the IBM released-case pack after module 1's lessons. The module chamber remains last.
- Print/PDF keeps the same contextual reading order and continues to hide interactive chambers.

## Lecture structure

- Prose, worked move, Key terms, assessed recap and connection share a 760px reading edge.
- Worked moves use top and bottom rules instead of a padded inset card, removing the mismatched left
  edge visible in the reported dark-theme screen.
- Key terms now has a visible heading and a stable term/definition grid.
- Course context and Next connection are semantic labelled rows rather than loose italic paragraphs.
- At 720px and below, context rows and term definitions become a single column.

## Worked-example density

- Every authored worked move leads with a compact `Case` followed by `Answer`.
- The existing deeper `because` content is reused inside a closed `Why this answer works` disclosure,
  so revision stays fast without deleting the teaching layer.
- Print/PDF expands the disclosed reasoning automatically.
- `BRGSA-M03-L03` now asks the observed direct diagnostic shape: blended CAC rises while cohort
  retention, ARPU and customer quality stay unchanged; the answer separates channel mix, media
  cost, funnel conversion and sales effort.
- `BRGSA-M07-L05` now calculates monthly gross profit and payback before giving bounded ways to
  shorten payback without changing CAC.
- This is a presentation and targeted-authorship refinement, not another exam-prep section.

## Source homes for methods

| Subject | Method | Source lecture |
| --- | --- | --- |
| BRGSA | Experiment numbers without fooling yourself | BRGSA-M02-L04 |
| BRGSA | Growth rates, cohorts, CAC, LTV, and payback | BRGSA-M03-L04 |
| BRGSA | Find a constraint from a funnel | BRGSA-M04-L04 |
| SCLM | Forecasting and exponential smoothing | SCLM-M02-L06 |
| SCLM | EOQ and annual cost | SCLM-M03-L03 |
| SCLM | Newsvendor and critical ratio | SCLM-M03-L05 |
| SCLM | Safety stock, reorder point and service level | SCLM-M03-L06 |
| SCLM | Cycle time, waiting and throughput | SCLM-M06-L07 |
| SPMS | Market size and unit economics | SPMS-M04-L07 |
| SPMS | RICE and cost-value prioritisation | SPMS-M07-L01 |
| IBM | Numbers as evidence in a written case | IBM-M08-L04 |

## Verification

- Complete explicit suite: **158 tests, 158 pass, 0 fail**.
- Dedicated Study check: **219/219** concept sources resolve to authored lectures and **11/11**
  numerical methods retain their declared source homes.
- Production build: **24 public assets** and production worker prepared.
- Palette: all required light/dark pairings pass and all four evidence states remain shape-distinct.
