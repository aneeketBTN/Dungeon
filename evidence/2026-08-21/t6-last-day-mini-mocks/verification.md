# Last-day teaching mini-mocks and release UI pass — 2026-08-21

## Outcome

- Examiner now leads with a **15-minute teaching mini-mock** and keeps the two-hour,
  exam-condition papers below it as a separate choice.
- A mini-mock is exactly **8 applied questions: one from every module**. It has no lesson detours,
  primer insertions, confidence prompt, reattempt insertion, or exam timer. Each submitted answer
  immediately teaches the better answer, why it works, what was missed, and a reusable method.
- `Need a way in?` opens a four-step reasoning scaffold before answering. Numerical questions reuse
  the Quick Notes numerical exoskeleton so setup, units, formula choice, and reasonableness checks
  come before arithmetic.
- The selector rotates through the existing authored bank, prioritises concepts not yet reached in
  the current cycle, and stores progress per subject. A completed round advances to the next fresh
  rotation; finishing the cycle begins a new one rather than collapsing into a fixed quiz.
- The complete concept cycles are SPMS **69 concepts in 7 rounds**, BRGSA **29 in 2**, IBM **85 in
  10**, and SCLM **36 in 5**. Every round still touches all eight modules.
- Full-paper mocks remain available and retain their real sections, marks, timing, confidence
  capture, and end-of-paper feedback. The mini result explicitly says it is a coached confidence
  round, not an exam prediction.

## Separation and alignment pass

- Dashboard subject cards, progress states, Exam cards, and mini-mock cards no longer depend on
  outline boxes. Tonal elevation, restrained shadows, small status tabs, and state silhouettes do
  the separation instead.
- The dashboard front door keeps one action. The floating resume bar no longer competes with it,
  and the Bag utility is absent there because it covered the mobile Start control; Bag still returns
  inside an active Learn run.
- Long dashboard and exam-readiness paragraphs were reduced to the decision the learner needs now.
- The three full-paper confidence controls were raised to the same 44px interaction floor used by
  the mini-mock.
- The optical flat-surface probe now excludes `.screen` page canvases while continuing to audit all
  descendant panels; otherwise a correct page background was falsely reported as an unseparated
  card.

## Rotation gate

`node tools/check-mini-mocks.mjs` verifies all four subjects over their complete cycles:

| Subject | Concepts | Rounds | Questions | Applied floor | Changes from round 1 |
| --- | ---: | ---: | ---: | ---: | --- |
| SPMS | 69 | 7 | 8 | 8 | 75%, 73% |
| BRGSA | 29 | 2 | 8 | 8 | 75%, 63% |
| IBM | 85 | 10 | 8 | 8 | 74%, 59% |
| SCLM | 36 | 5 | 8 | 8 | 80%, 70% |

The gate fails if a round is not eight questions, omits a module, contains a non-applied item,
duplicates an item, misses a concept by the end of the subject cycle, or changes less than 35% of
the question ids between sampled rotations. It runs directly, in `npm test`, and inside the combined
change review.

## Functional and visual verification

- `mini-result` completes all eight real submit → feedback → continue loops. This proved that hidden
  lessons, primers, repairs, or confidence steps cannot expand the interaction beyond eight coached
  questions.
- The layout gate tested Dashboard, Lesson, Learn question, Examiner home, full-paper question,
  mini question, mini feedback, mini result, and Quick Notes at **375×812 dark** and **1280×900
  light**: **18/18 PASS**. Every state reported zero horizontal overflow, clipping, overlaps, cut
  rows, hidden scroll, resume-bar inset errors, dead shadows, flat panels, and undersized targets.
- The final non-optical release sweep produced **24/24 valid captures** in
  `outputs/shots/release-final`, covering light/dark and desktop/mobile variants plus both SCLM and
  BRGSA real papers. All 24 were visually inspected.
- The optical sweep produced **24/24 captures** in `outputs/shots/prepush-optical-final`. The probe
  labels showed only deliberate badge, tab, and internal panel padding; no actionable misalignment
  remained.
- Earlier human inspection caught and fixed a mobile mini-question timeout frame, a Chrome network
  error frame, a stale view-transition layer over real papers, and a duplicate dashboard action.
  The screenshot runner now retries suspiciously small files and fails if the retry remains small.

## Full release verification

- `npm test` — **144/144 PASS**.
- `node tools/check_lesson_file.mjs` — 283/283 registered entries scheduled; 0 errors and 0 warnings.
- `node tools/validate_t6_bank.js "<Term 6 Clean Transcripts>"` — `ok: true`, 0 errors, populated
  lesson coverage for all four subjects, and no readable-only lessons. The 69 glossary warnings are
  extraction-unverified terms attached to source PDFs that the validator could not extract; the
  combined review reports them rather than hiding them.
- `node tools/review-changes.mjs --html` — all checks PASS, including naming, delivered-run craft,
  absolute bias, palette, mini-mock rotation, release build, and exam readiness.
- `node tools/check_exam_readiness.mjs` — 0 errors, 0 warnings.
- `node tools/check-palette.mjs` — all required contrast pairings pass in both themes; four evidence
  states remain shape-distinct.
- `node tools/build-site.mjs` — 20 public assets and the production worker prepared.
- `git diff --check` — PASS before release.

## Release

This is the pre-push evidence for the release commit sent to `main`, the deployment branch for the
live tester cohort.
