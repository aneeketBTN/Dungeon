# Dashboard purge, Quick Notes, and clearer corrections — 2026-08-21

## Outcome

- Learn keeps one visible progress glance, the fixed run action, Replay after a run is cleared,
  concept detail on demand, one evidence-led Focused practice disclosure, and a quiet progress reset.
- The three dashboard charts, chart runtime, five-dial custom builder, lesson index, time-plan panel,
  exam-plan panel, prediction disclaimer, duplicate status coins, and header subject dropdown are no
  longer in the learner UI. They were removed from the DOM rather than folded into more menus.
- The four subject cards remain the single subject control and start or resume the fixed nine-run path.
- Quick Notes is a third top-level destination beside Learn and Exam. It reads the 283 authored
  teaching entries in subject → module → lecture order and carries each objective, explanation,
  worked move, glossary, course connection, and the assessed concept map for the module.
- Subject search opens the matching lecture. Printing renders the complete selected subject so the
  browser can print it or save it as a PDF.
- Eleven numerical guides teach a reusable question exoskeleton, theory, setup, unit checks, and
  reasonableness checks: BRGSA 3, SCLM 5, SPMS 2, IBM 1.
- A wrong objective answer now reads `Not quite` → `Better answer` → `Why` → `What your answer
  missed` → `Use this check` → `How it fits`. Scheduling rules such as `The idea will return` are
  not shown in the correction.

## Browser verification

- Desktop Learn: four subject cards, one progress glance, and only Concept details, Focused practice,
  and Account and progress as visible disclosures; legacy charts and custom builder absent.
- Desktop Notes: four subject tabs and eight module controls; BRGSA module 1 rendered six sequential
  lecture notes. SCLM module 3 rendered eight notes plus EOQ, newsvendor, and safety-stock numerical
  exoskeletons. Searching `safety stock` opened the matching lecture and cleared the search.
- Feedback fixture: `Not quite`, Better answer, diagnosis, reusable check, and course connection all
  visible; no return/retest/practice-block language; zero console errors.
- Functional route: opening Focused practice exposed only the evidence-relevant action; an SPMS
  subject card started its lesson-led run; Save and return home restored the same dashboard.
- Responsive pass at 375 × 812: Dashboard and Notes both reported zero horizontal overflow, all four
  subject controls remained available, the three-way Learn / Exam / Notes switch fit, and the Notes
  reader collapsed to one 340px column. Zero console errors.
- The stale `feedback` and `dashboard-progress` browser fixtures were repaired when live inspection
  exposed assumptions that no longer held after lesson-first runs and the expanded IBM bank.

## Automated verification

- `node --check app/t6.js` — PASS.
- `node --test tests/site-release.test.mjs` — 11/11 PASS.
- Full package test command executed directly with Node — **142/142 PASS**. The machine's global
  `npm` launcher is missing its CLI module; direct execution used the exact test file list in the
  package script.
- `node tools/check_lesson_file.mjs` — 283/283 scheduled, 0 errors, 0 warnings.
- `node tools/review-changes.mjs --html` — all checks PASS; bank validator 0 errors and coverage for
  4/4 subjects; naming, craft, palette, release build, and exam readiness PASS.
- `node tools/check-palette.mjs` — all required pairings within tolerance and four state silhouettes
  distinct in both themes.
- `node tools/build-site.mjs` — 19 public assets and the production worker prepared; `t6-chart.js`
  is not in the release allowlist.
- `git diff --check` — PASS.

## Release note

Branch `fix/theme-switch-and-login-theming`; not merged and not deployed. The live tester deployment
was deliberately left unchanged.
