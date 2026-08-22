# Study reader alignment, module chambers, and Examiner finish

Date: 2026-08-23
Branch: `codex/notes-primary-chambers`
Deployment state: branch only; no production publish was performed.

## What changed

- Study is a centered reading desk. On desktop a fixed `Contents` control aligns with the module
  heading and reveals the eight-module channel on hover, focus or click without shifting the text.
  At 721–960px it becomes a full-width in-flow bar; at 720px and below it stacks above the reader.
- The lecture utility card (`After this layer`, `Key terms`, `Download lecture`) is sticky beside
  the active lecture on desktop. Its Key terms link calculates the current sticky masthead offset
  before scrolling, then focuses the destination heading. Tablet and phone layouts keep it in flow.
- The module ending is one centered 960px system: a four-question chamber, the offline-PDF action
  and previous/next module navigation. All four subjects now receive a chamber. SPMS includes its
  exact-two P-type shape, SCLM uses numerical or matching work where authored, and IBM/BRGSA include
  direct application plus a compact case-answer spine.
- IBM Study module 1 and the top of Examiner share the exact released case, an assumption/model
  method, ten course lenses and ten question-to-model-answer disclosures.
- Examiner now has two top-level choices: `Full mocks` and `Exam time`; `Speedrun` and `Mini` live
  inside Exam time. IBM/SCLM remain the active priorities and BRGSA stays hidden.
- Full mocks launch again. The visible paper buttons were bound after each render, then a live
  browser run exposed the remaining root cause: `openExaminer()` called the removed
  `pauseFinalSprint()` function. Removing that stale call restored the paper and timer route.

## Browser and responsive evidence

The live app at `http://localhost:8099/app/t6.html` was checked in the signed-in in-app browser.

- 1280px: reader `x=120`, `width=1025`; module heading `x=192`, `y=200`; Contents control
  `x=14`, `y=200`, `width=104`. The control and heading share the same top edge and the reader has
  no horizontal overflow.
- 900px: Contents bar `x=20`, `width=845`; reader `x=63`, `width=760`; opening the channel changes
  its height without moving or narrowing the reader.
- 375px: reader, lecture utilities, chamber and ending each use the same 18px page inset; no
  horizontal overflow or detached right-hand footer remains.
- While the first desktop lecture scrolls, the utility card holds at `y=158` without covering the
  text or Contents control. IBM's released-case anchor also lands at `y=158`, immediately below the
  sticky masthead.
- Full mocks → IBM Set 1 opens `Inclusive Business Model`; `Start the clock · 120 minutes` loads
  Question 1. The browser console reported zero errors.

## Print/PDF evidence

IBM module 1 was printed with Chromium's production markup and A4 CSS, then all pages were rendered
and inspected. The complete case answer pack is forced open only while printing.

- 22 A4 pages.
- 10 released-case question headings and 10 `Model answer` bodies; Question 10 is present.
- No Contents control, lecture download action, chamber, navigation or other interactive artifact.
- No clipped text, overlap, broken glossary row or split question/model-answer heading.

## Acceptance-harness finding

The first 36/36 screenshot count was not accepted by itself. Visual inspection showed that the
newly repurposed historical `lesson` and `question` scene names reached Study correctly but could
ignore the requested subject, producing SPMS under an SCLM filename. The frame driver now selects
and verifies `data-notes-course=<subject>` and `#notes-course-code` before declaring the scene ready.
The complete layout and screenshot suites were rerun after that correction. The final SCLM lecture
shows `Strategy and performance drivers`; its chamber shows an SCLM demand-uncertainty question.

## Gates

- `npm test`: **164/164 PASS**.
- `node tools/check-ui-layout.mjs --port 8099`: **32/32 PASS**, 0 failures.
- Regular screenshot sweep: **36/36 valid captures**.
- Optical-grid screenshot sweep: **36/36 valid captures**.
- `npm run build`: **24 public assets**.
- Transcript-backed lesson gate: **283/283 scheduled**, 0 errors, 0 warnings.
- Transcript-backed bank validator: **0 errors**, four populated subject coverages, 69 standing
  extraction-unverified glossary warnings retained.
- Named syllabus coverage: **359/359**. Tested bank: BRGSA 417, IBM 946, SCLM 528, SPMS 958 =
  **2,849 questions / 219 concept records**.
- Examiner readiness: **0 errors / 0 warnings**.
- Naming, syllabus, taught-vocabulary, tested-vocabulary, concept-spine, palette, Mini rotation,
  final-sprint and revision-persona gates: PASS.
- Authenticated Wrangler 4.120.1 dry run: 28 static assets read; D1, AI, assets and variables
  recognized; exited without publishing.
- Expected exception only: the lesson–lecture match gate names `SPMS-M01-L01`, the documented
  owner-approved exception. No second lecture appears.
