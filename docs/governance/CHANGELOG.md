# Changelog

## 2026-08-22 — Final revision becomes a real route, IBM receives its released case, and access stops locking people out

Branch `fix/theme-switch-and-login-theming`. Not merged or deployed; the live Cloudflare rate rule
is the one operational exception described below. Evidence:
`evidence/2026-08-22/t6-final-revision-released-ibm/verification.md`.

**Examiner now asks how far away the exam is.** Full mocks, Speedrun and Minis are three explicit
tabs rather than one long page with short practice hidden inside paper cards. Full mocks preserve
the real two-hour conditions for a week or more out. Speedruns are eight-question, all-module
coached rounds for the final week. Minis are a 3/16/6-minute retrieval
routine with **32 authored prompts** — eight per subject and exactly one per module — each carrying
a course-grounded answer spine and a near-miss check, plus three high-cost traps per subject. A new gate fails missing
subjects/modules, weak prompts, unresolved concept links or incomplete answer/check fields.

**The IBM case is no longer guessed or dismissed.** The 21 August prompt is preserved verbatim and
treated honestly as an open design brief: it supplies no firm, sector, beneficiary, evidence,
constraint or figures. Dungeon states those missing assumptions, builds one coherent farmer-owned
`Kisan Saathi Hubs` model, and supplies a fixed ten-question / 100-mark Released case paper across
ten course lenses. Its **10 examiner-only responses** carry full rubrics and exemplars, never enter
Learn, and are excluded from the seven numbered IBM transfer sets. IBM is now 946 questions and 177
constructed responses; the whole bank is **2,837 questions / 219 linked concepts**. Quick Notes
module 1 carries the same case pack, assumptions, mechanics and answer shape.

**The subject choice now changes shape after it has done its job.** First load still presents the
four full subject cards. The first selection animates them into a compact sticky rail using the
self-hosted GSAP runtime; the current subject has a persistent mark and inactive subjects recede,
with full detail available on hover/focus. Reduced-motion users get the settled state immediately.
Live Browser testing verified the real transition rather than only its static fallback.

**Personal access remains a term, not an unreliable automatic verdict.** Login/session handling no
longer enforces a two-device ceiling or first-country lock, and the retired unlock flow is removed
from the learner and Control Room. Concurrent sessions retain the same D1 progress; revocation and
owner sign-out remain. Migration `0008_remove_device_and_country_enforcement.sql` clears legacy
lock fields and must run against remote D1 immediately before or with the Worker release. The live
Cloudflare burst rule now excludes `/dungeon/admin` and descendants, stopping the Control Room's
own API fan-out from rate-limiting the owner while learner-path protection remains at 40 requests
per 10 seconds.

**The revision routes were run through the established learner personalities.** Brilliant-but-lazy
checks whether Speedrun answers can be gamed by option length or answer position; Average Joe checks
that every Speedrun teaches immediately and every Mini supplies all eight prompts; Dumb-but-diligent
checks complete concept-cycle coverage, literal module spread and bounded final answer spines. This
pass exposed a genuine timing defect: IBM written Speedrun questions opened a second self-marking
rubric after submission. They now finish in one interaction and reveal a 40–85-word, case-grounded
answer spine without grading or manufacturing Strong evidence. All three personalities pass all
four subjects in both routes.

**Verification:** full suite **147/147**; Minis/released-case, Speedrun, revision-persona, syllabus, taught,
tested, spine, naming, palette, craft and exam-readiness gates PASS; transcript-backed validator
2,837 questions / 0 errors / expected 69 extraction-unverified warnings; lesson gate 283/283;
authenticated Wrangler dry run PASS; release build **23 assets**. The expanded layout runner checks
16 scenes at phone/dark and desktop/light: **32/32 PASS** with zero overflow, clipping, overlap,
cut-row, hidden-scroll, dead-shadow, flat-panel or tap-target failures. Regular and optical suites
each produced **36/36** valid captures. Visual inspection caught and repaired a false IBM-labelled
SPMS Mini capture, a released-case shutter firing before navigation, whole-pool readiness copy
on the fixed paper, the old `1 of 8` text contradicting Learn's nine-run path, and a first draft of
the IBM Speedrun answer spine that was too generic to teach transfer.

## 2026-08-21 — Last-day mocks teach in eight questions, rotate through the whole bank, and the UI clears release

Evidence: `evidence/2026-08-21/t6-last-day-mini-mocks/verification.md`.

**A mini-mock is now a coached confidence round rather than a short imitation exam.** Each one is
exactly eight applied questions — one per module — with immediate correction and an optional
four-step way-in before answering. There are no lesson, primer, repair, confidence or reattempt
insertions, so the interaction stays bounded at fifteen minutes. Numerical questions reuse the
Quick Notes setup/units/formula/check exoskeleton. The result names this as teaching rather than an
exam prediction and hands the learner to the next fresh round.

**The rich bank is a rotation, not a random draw.** The selector prioritises concepts the current
cycle has not reached and persists progress per subject. Its shortest whole-concept cycles are
SPMS **69 concepts / 7×8**, BRGSA **29 / 2×8**, IBM **85 / 10×8**, and SCLM **36 / 5×8**. Every
round still spans all eight modules and every selected item is applied. A new gate fails missing
modules, non-applied or duplicate questions, incomplete cycle coverage, or sampled rotations below
35% id change; observed changes are SPMS 75/73%, BRGSA 75/63%, IBM 74/59%, SCLM 80/70%.

**The release UI separates by tone, lift, and status marks instead of drawing boxes around
everything.** Dashboard, progress, Exam and mini cards use tonal elevation, restrained shadows and
small status tabs. The dashboard Bag utility stopped covering the mobile Start action, the duplicate
resume action is absent at the front door, long readiness copy is reduced to the next useful step,
and the real-paper confidence targets now meet 44px. The alignment runner audits nine scenes at
mobile/dark and desktop/light: **18/18 PASS**, with zero overflow, clipping, overlaps, cut rows,
hidden scroll, dead shadows, flat panels or undersized targets. A fresh regular sweep and an optical
sweep each produced **24/24** valid, manually inspected captures.

**Verification:** `npm test` **144/144**; mini rotation gate PASS; lesson gate 283/283 scheduled;
transcript-backed bank validator `ok: true`, 0 errors and populated four-subject coverage; combined
craft review, naming, palette and exam readiness PASS; production build **20 assets**. The validator
also reports 69 extraction-unverified glossary warnings for source PDFs it cannot extract; they are
visible in the review and are not introduced question-bank errors.

## 2026-08-21 — The dashboard is actually smaller, Quick Notes covers the course, and corrections teach

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-21/t6-dashboard-purge-quick-notes/verification.md`.

**Progressive disclosure had become a way to keep everything.** This pass removes rather than
relocates: three dashboard charts and their shipped runtime, the five-dial custom builder, lesson
index, time plan, exam-plan panel, prediction disclaimer, duplicate status coins and the header
subject dropdown. Learn now keeps the fixed-run action, one four-number progress glance, replay,
concept detail, one Focused practice disclosure that responds to actual evidence, and a quiet reset.
The four subject cards are the only subject switch and still start or resume revision directly.

**Quick Notes turns the completed teaching layer into one readable course.** The new third top-level
destination renders all **283 authored teaching entries** in subject, module and lecture order, with
the lesson objective, layered explanation, worked move, glossary and course connection intact.
Each module starts with its assessed concept map. Search jumps to a matching lecture, and Print
subject / save PDF expands the complete selected subject. Eleven reusable numerical guides — BRGSA
3, SCLM 5, SPMS 2, IBM 1 — teach the theory, unit setup, question exoskeleton and reasonableness
checks rather than rehearsing a bank answer.

**A wrong answer now explains the correction, not Dungeon's scheduler.** `The idea will return` and
confident-error repair mechanics are gone from learner feedback. The panel reads `Not quite`, Better
answer, Why, What your answer missed, Use this check and How it fits. Live Browser testing also
caught two stale scenario fixtures and the redundant header dropdown causing 74px mobile overflow;
both fixtures were repaired and the dropdown was removed. Desktop routes and Notes search pass with
zero console errors; Dashboard and Notes both have zero overflow at 375 × 812.

**Verification:** full suite **142/142**; focused release suite 11/11; lesson gate 283/283 scheduled,
0 errors / 0 warnings; review, palette and exam readiness PASS; build **19 public assets** after the
chart runtime left the allowlist; JavaScript syntax and whitespace checks clean. Local Browser
verified dashboard disclosure, subject → lesson → return, Notes subjects/modules/search/numerical
guides, the wrong-answer hierarchy, and responsive layout. No merge or deployment was performed.

## 2026-08-21 — Learn becomes one sequenced front door, and every run ends with a quick look

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-21/t6-learn-streamlining/verification.md`.

**"Right now" and "Where can I start" are one decision now.** The Learn home no longer opens
with a recommendation followed by five alternative routes and ten selectable set cards. The four
subject cards spend their click on revision — start or resume — and the selected subject has one
matching primary action. Exam order is fixed rather than exposed as another sort to manage. The
ordinary path is the nine authored non-builder runs: the first uncleared run is the only new run
shown, completing it unlocks the next, future runs stay absent, and only completed runs appear in
the Replay disclosure. A fixed path still responds to evidence: at most two concepts currently
marked Needs practice are repeated on a fresh question family inside the next run without replacing
its authored questions or changing which run unlocks.

**The dashboard is progressive rather than encyclopaedic.** Subject stats, the three existing real
Recharts graphs, confidence explanation and the concept shelf move behind `Your stats`; the
concept-by-concept rows require a second deliberate disclosure. Weakest-first, written and custom
practice move behind `More practice options`. Cleared replays remain separate and are hidden until
one exists. The default page therefore shows subjects, the one open run and its fixed-path progress,
while preserving every specialist surface for the learner who asks for it.

**A completed run now produces a two-column quick look.** The left side states run accuracy, first-
attempt results, concepts improved, what was learned, what caused difficulty and exactly which run
unlocked next. The right side is an accessible three-bar comparison of subject evidence before the
run, now and the all-Strong goal. When an unresolved concept will be carried into the next run, the
debrief names it as the likely repeat. Concept cards and full answer review remain below as optional
detail rather than interrupting the handoff.

**Verification:** `npm test` **140/140**; the focused release suite 9/9; `npm run review` all PASS;
palette PASS; build 20 public assets; JavaScript syntax and whitespace checks clean. The new release
regression pins the single sequenced front door, hidden future/replay contract, two-item carry-forward
seam, progressive disclosures and learned/struggled/next chart debrief. No Browser inspection or
deployment was performed in this change.

## 2026-08-20 — Mock sets become coverage cycles, and Learn can issue a weakest-links paper

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-20/t6-preparedness-personas/verification.md`.

**The three fixed mocks were samples, not a complete rotation.** Their visible coverage counters
stopped at SPMS 52/69, BRGSA 18/29, IBM 31/65 written-relevant records and SCLM 36/36. Numbered
mocks are now deterministic, subject-sized coverage cycles: each later paper prioritises concepts
not reached by an earlier paper while retaining the real section counts, marks, clocks, authored
format mix, all eight modules and the option-craft limits. The shortest complete cycles are **SPMS
3 sets, BRGSA 4, IBM 7 and SCLM 3**. Their final cumulative counters are respectively **69/69,
29/29, 65/65 and 36/36**; every one of the seventeen papers fills and spans eight modules. Cards
show both the new concepts on a paper and cumulative progress through the cycle.

**IBM's denominator stays honest.** Its real paper is ten written responses, so the cycle covers
all 65 layer/framework records that generate written assessment. The other twenty records are
objective-only by authored taxonomy and remain in Learn; inserting them into the paper to make an
85/85 counter would falsify the exam format. Across the complete cycles, longest-option payoff is
SPMS **25.2%**, BRGSA **25.1%** and SCLM **25.0%**, and every executable strategy gate passes.

**Weakest links is a separate, personal diagnostic rather than another common set.** Each subject
now offers a paper with the same sections, marks and clock as its real mock, rebuilt from the
learner's current Learn evidence using `conceptPriority()`. With no answers it honestly starts from
untested concepts; after mistakes it targets the weakest evidenced records first. It is excluded
from cumulative coverage and like-for-like re-sit comparisons because its contents change when the
learner changes. Mock scores do not influence its selection.

**Verification:** seventeen fresh candidate/key exports, 100% of paper-relevant records by each
subject's final set, zero section shortfalls, eight modules per paper and complete-cycle craft gate
PASS; `npm test` **139/139**; preparedness regressions 9/9; bank validator, lesson, syllabus,
taught, tested, spine, naming, palette, review and exam-readiness gates pass; build 20 public assets.
Local Browser checks covered the 3/4/7/3 card counts, cumulative counters and the separate Weakest
links preflight. A post-change Average Joe subagent could not acquire an independent Browser session;
its explicit structural fallback passed the focused suite 9/9 and reconciled all seventeen papers
without inconsistency. The owner-approved lesson-match exception remains unchanged.

## 2026-08-20 — The preparedness defects are fixed, and the whole teaching layer now enters Learn

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-20/t6-preparedness-personas/verification.md`.

**The delivery gap is closed: 283/283 registered lecture entries now enter ordinary Learn runs.**
The module lesson schedule is passed into the layered queue, unread lessons drain in teaching order,
and a host marks its add-ins read with it. The lesson index says `Scheduled in module practice`, not
the old question-citation proxy. `check_lesson_file` now reports BRGSA 50/50, IBM 78/78, SCLM 71/71
and SPMS 84/84 with zero readable-only warnings; the bank validator carries the same contract and
fails if `lessonsReadableOnly` rises above zero. Static named-idea coverage remains **359/359** and
all **219/219** concept records have a derived link; delivery coverage and phrase coverage are now
reported separately rather than substituted for each other.

**The recommended path now rehearses the paper it claims to prepare.** Module runs carry authored
format quotas: four IBM written responses, two BRGSA written plus one case-cloze, two SPMS MSQ, and
up to two SCLM numeric items where those calculations exist. IBM leads with `Start with the answer
shape this paper uses`; Learn and written practice prefer non-reserved cases so Examiner cases stay
fresh. Time estimates include unread lesson prose, worked examples, glossary material, primers and
questions — live first-set examples now read roughly 30–55 minutes instead of an implausible twelve.

**The diligent learner can trust the teaching again.** IBM demographic bottleneck is consistently
the gap between 10–12m workforce entrants and 5–6m jobs; inclusive business requires a credible path
to financial sustainability rather than `always sustains itself`; SPMS teaches that the weakest
unresolved constraint can fail the product. Generated case feedback now uses the authored case's own
summary/application instead of a neighbouring concept. A linked-question miss queues repair and
confirmation for the exact failed concept, while evidence copy distinguishes all correct response
types from the narrower Strong-eligible set.

**Examiner now records the uncertainty the Average Joe persona exposed.** Optional confidence is
stored per item and the review reports correct-but-unsure and confident-wrong responses. Submit and
leave use accessible in-page dialogs, removing the native confirmation that blocked browser review;
save-and-return uses the same flow. SCLM match questions rotate five stems, leaving three distinct
stems on each fresh paper and taking exam readiness to 0 errors / 0 warnings. Coverage copy says the
honest 100% claim: every named idea is reached, while repeated transfer depth still differs.

**The first craft fix caused a coverage regression and was rejected.** A greedy length-balancing draw
made one BRGSA paper span seven modules and cut cross-set rotation. The adopted selector preserves the
seeded draw, fills any missing module, then makes the minimum swaps that move longest-option payoff to
chance. Every one of the twelve fresh papers spans eight modules with zero shortfalls. Across sets
1–3, longest-option payoff is SPMS **25.2%**, BRGSA **25.0%**, SCLM **25.0%**; all executable strategy
gates pass. Across-three concept reach remains broad without pretending to be a certificate: SPMS
52/69 (75.4%), BRGSA 18/29 (62.1%), IBM 31/85 (36.5%; 31/65 written-relevant), SCLM 36/36 (100%).
Learn schedules the whole course; each mock samples it.

**Verification:** `npm test` **138/138**; preparedness regressions 8/8; bank validator 0 errors;
lesson check 283/283 scheduled with zero readable-only warnings; syllabus and tested coverage 359/359;
spine 219 linked / 0 isolated; exam readiness 0/0; craft gate PASS; build 20 public assets. Local
Browser checks covered full lesson delivery, honest duration, IBM written-first, confidence controls,
submit/leave dialogs and save/return. The owner-approved lesson-match exception remains unchanged.

## 2026-08-20 — Every dashboard graph is now a shadcn/Recharts component

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-20/t6-shadcn-charts/verification.md`.

**All three graph surfaces were replaced, not restyled.** The momentum route and selected-subject
history are real Recharts `AreaChart`s following shadcn's gradient-area structure; the evidence
matrix is a real `RadarChart`. A shared React island owns `ChartContainer` /
`ResponsiveContainer`, horizontal or polygon grids, accessible chart layers, shadcn-shaped
tooltips and reduced-motion behaviour. Dungeon's existing application stays framework-free and
hands data to the island through `window.DungeonCharts`.

This removes three separate amateur chart mechanisms: an SVG route stretched with
`preserveAspectRatio="none"`, a hand-painted canvas radar, and an application function that wrote
trend SVG paths itself. The route's radio-like dots are replaced by Lucide flag, person and door
marks. The chart bundle is self-hosted; the CSP permits inline **style attributes** because
Recharts' responsive container writes dimensions there, without widening script or stylesheet
sources.

At 1280×900 the three charts measure 327.5×176, 308×340 and 507×220; at 375×812 they measure
298×132, 300×280 and 310×180. Neither width scrolls sideways, no graph crosses the viewport, all
three expose an accessible Recharts layer, and the page carries zero canvas or legacy trend-path
elements. Browser console warnings/errors: 0. The empty-history chart remains a Recharts surface
with a plain first-block prompt. The release screenshot sweep is **16/16** and the dashboard optical
sweep **4/4**, both opened and read.

**Verification:** `npm test` **130/130**; `npm run review` all PASS; palette PASS; build **20
assets**; screenshot sweep 16/16; dashboard optical sweep 4/4. `tests/site-release.test.mjs` pins
the three chart hosts, actual Recharts primitives, local bundle, CSP support and removal of the old
canvas/path implementations; the protected-worker suite pins the same CSP allowance on its route.
**LAW-80:** chart-shaped drawings are not a chart system.

## 2026-08-20 — The mocks rotate the expanded bank, and no persona feels whole-subject ready

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-20/t6-preparedness-personas/verification.md`.

**Three existing learner personalities ran on three isolated browser origins after the mocks were
updated:** Average Joe (normal effort, calls out guesses), Brilliant-but-lazy (skips teaching and
uses craft), and Dumb-but-diligent (reads every served line and trusts the app). All four subjects
were sampled in Learn and Examiner, and all twelve blind candidate papers (sets 1-3) were inspected.
**None felt prepared for any whole subject after the sampled recommended path.** The current result
is not the old false-readiness failure: written, case, numeric and negative-marking formats now stop
the lazy persona, every mock spans all eight modules, and preflight honestly states how little of the
paper Learn has taught. The remaining problem is enough durable, format-matched depth.

**IBM's expanded written bank was present but its mocks barely rotated it.** Eight legacy
`integrated` prompts occupied eight of ten slots on every seeded paper. The paper selector now keeps
four deep whole cases and assigns six slots to focused `case` responses. Across three mocks, unique
questions move **14 -> 22**, reached concepts **22/85 -> 31/85** (or **31/65**, 47.7%, of the
written-relevant layer/framework records), focused slots are **18/18 unique**, and pairwise overlap
falls from eight questions to the four intentionally reserved cases. App, export harness and tests
share the rule.

**Mock coverage is broad but not a certificate.** Across three papers: SPMS reaches **53/69 concept
records (76.8%)** and 49/84 source lessons; BRGSA **18/29 (62.1%)** and 35/50; IBM **31/85 (36.5%)**
and 19/78; SCLM **36/36 (100%)** and 37/71. Every individual paper spans eight modules and every
published section fills. Static phrase coverage remains 359/359, while **101 of 283 lessons remain
readable-only**, so complete authoring is still not complete scheduled delivery.

**The personalities separate three risks.** Lazy can still ride the immediate primer reveal and
repeated wording inside Learn, but live SPMS craft produced 16% and written/numeric/case formats
defeated him. Joe's five correct SPMS mock answers included at least two guesses, which Examiner
cannot distinguish because it captures no confidence. Diligent found the highest-trust defect:
generated IBM surfaces give incompatible definitions of demographic bottleneck and accept `the
model always sustains itself` after a lesson requiring demonstrated sustainability; BRGSA can give
feedback about a neighbouring concept. The prose is strong enough that he considers SPMS, BRGSA and
SCLM plausibly preparatory after full completion, but IBM needs trust repairs first.

**Verification also found two delivery/test-infrastructure defects.** The new chart bundle was
referenced and built but missing from the Cloudflare learner route, now mapped. Syllabus tests mutate
shared JSON fixtures; parallel `node --test` let probes leak between files, so the explicit runner is
now serial. Final state: bank validator 0 errors; `npm test` **130/130**; review and all structural
gates pass; build 20 assets; exam readiness 0 errors / the one pre-existing SCLM repeated-match-prompt
warning; lesson check 0 errors / 101 readable-only warnings; lesson-match output contains exactly
the owner-approved `SPMS-M01-L01` exception.

## 2026-08-20 — The whole syllabus is reached, and IBM's idea type determines its assessment

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-20/t6-ibm-classified-coverage/verification.md`.

**The coverage result:** `check:tested` moves from **126/359 (35%) to 359/359 (100%)**. BRGSA is
69/69, IBM 90/90, SCLM 84/84 and SPMS 116/116. The bank moves from 64 concepts / 920 questions to
**219 / 2,827**: BRGSA 29/417, IBM 85/936, SCLM 36/516, SPMS 69/958. Every concept has a derived
link; IBM has 107 edges, 27 cross-module, zero isolated. This is named-idea coverage rather than
the adopted one-record-per-idea depth target: 219 records still stand in for 359 ideas, and 101
lessons remain readable-only.

**IBM's 73-idea queue is implemented under an authored assessment taxonomy, not poured into the
wrong paper format.** Owner direction on 2026-08-20 superseded the historical pause: foundational
layer ideas receive subjective + MCQ practice, named frameworks/models receive subjective practice
only, and bounded concepts/distinctions receive MCQ practice only. The 73 misses became **69 new
records plus four wording repairs** on existing layers (Grameen Bank, Aravind Eye Hospital, volume
output, credit access). New-record mix: 20 layer / 29 framework / 20 concept; with the existing
sixteen layers IBM totals 36/29/20. `conceptKind` maps to `assessmentMode` in the generator and is
enforced by the bank validator. Objective and mixed records retain the ≥10 active-surface and boss
contract; written-only frameworks carry primer, short, case and linked case-response families, no
objective surface and no boss. Constructed responses rise **40 → 167**.

The new caselets are generic practice situations grounded in the existing IBM lessons. They teach
evidence, decision and transfer without predicting, naming or fabricating the unreleased exam case.
A written-only framework still joins the concept graph through a short-answer surface carrying
`supportingConceptIds`. The first version labelled that generated link `writtenMode: integrated`,
which silently promoted 33 generated links into the special ten-mark exam-case priority and broke
the four authored whole scenarios' reservation. It is now a linked `case`; `integrated` remains the
class for authored whole scenarios, and all four again lead every seeded IBM paper.

**The generator now understands compact expansion records without manufacturing generic
distractors.** Their six authored teaching sentences — summary, case, evidence, application and
bridge around the named/source fields — generate the surfaces; when a compact record omits manual
wrong answers, the base objective pair draws relevant wrong principles and decisions from adjacent
course records in the same module. Existing hand-authored distractors remain untouched. IBM's
correct-answer length ranks finish 23% / 26% / 23% / 28% (spread 0.03), and the whole review passes
name matching, absolute bias and delivered-run craft.

**Two tests were stale in different ways and both failed usefully.** The Examiner-slice test still
required ten Learn-reachable surfaces from every record, including written-only frameworks; it now
uses the mode-specific contract instead of forcing frameworks back into MCQs (LAW-79). The
taught-not-tested failure fixture set IBM's floor to 100, which stopped being a failure when IBM
legitimately reached 100%; it now uses the impossible 101 and stays independent of live content.
The new regression walks all 85 IBM records and proves layer → both formats, framework → written
only + linked, concept → objective only + boss.

**The UI metric is clarified.** The owner spotted the subject rail's 69/29/16/36 beside the 100%
report. Those are concept-record mastery denominators, not syllabus-idea coverage; the pill's terse
`0/69 Strong` made the distinction implicit. It now reads `0/69 concepts Strong`. Browser
verification after rebuild shows SPMS 69 / BRGSA 29 / IBM 85 / SCLM 36 and the separate IBM line
`85 concepts · 100% of the syllabus`.

**Verification:** bank validator 0 errors; `npm test` **129/129**; review all checks PASS; build 19
assets; syllabus, taught vocabulary, tested coverage, spine and naming gates PASS; exam readiness
0 errors / one pre-existing SCLM repeated-match-prompt warning. `check_lesson_file` reports 0 errors
and 101 readable-only lessons. The lesson-to-lecture match gate retains exactly its owner-approved
expected exception, `SPMS-M01-L01`, and nothing else.

## 2026-08-19 — The spine is widened for the first time, and the craft gates caught what the structural ones passed

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spine-first-widening/verification.md`.

Steps 0 and 2 of `docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md`. SPMS module 1 goes from **2 to 8
concepts**, SPMS from 16 to **22**, questions 216 to **300**, link edges 8 to **14** with none
isolated, and tested coverage **30% to 34%** with the floor raised to match.

**Step 0 — `pair.slice(0, 2)` is generalised, and it was verified as a no-op before being verified
as a fix.** The module match and boss are the only generated surfaces carrying
`supportingConceptIds`, so they are the whole link mechanism; they now chain consecutive pairs.
With every module still at two concepts the bank came out identical — 920 questions, the same edge
counts in all four subjects, `npm test` 128/128 — and existing ids are untouched, because only the
second and later pairs take a suffix. Then the probe that previously produced `FAIL — 1 concept(s)
have no link` and orphaned **`spms_jtbd`**, a real shipped concept, now gives edges 8 → 9 and
**isolated 0**.

**The first attempt chained only the match and the bank validator rejected it outright** — ten
errors, `has no boss coverage` and `has only 7 actively scheduled surfaces`. Every concept must
carry boss coverage and at least ten scheduled surfaces, so leaving the boss on the first pair would
have given the third and later concepts in a module a thinner deal than the first two, which is the
exact inequality the widening exists to remove. Both chain now. The surface count grows with the
concept count and that is correct: **bank size and session length are different things**, since runs
select from the bank.

**Step 2 — six concept records, and no questions written by hand.** Physical vs software products,
Marginal cost, Embedded product, Product family, Product platform, Product line, authored into
`t6_catalog.js` in teaching order from `SPMS-M01-L02`/`-L03`. Each record is ten fields, six of them
prose; the generators produced **84 surfaces** from them, and seven module-1 match questions now
exist, one per consecutive pair. **Those six syllabus ideas went from untested to tested without a
question being authored** — the whole argument for widening the spine before writing questions one
at a time. Floor in `tested-floors.json` raised 30 → 34 with the reason recorded.

**A tester-visible consequence, recorded rather than discovered later:** inserting in teaching order
put the taxonomy concepts ahead of `spms_dfv` and `spms_jtbd`, so module 1's five boss questions now
test Physical-vs-software against Marginal cost rather than DFV against JTBD. The ids are unchanged;
the content is not. Arguably a correction — module 1's boss should test module 1's opening ideas —
but a change all the same.

**Every structural gate passed the first authored draft and the prose was still defective.** Bank
validator 0 errors, spine gate PASS, LAW-47 clean, 128/128. Meanwhile **the correct answer was the
longest option in 6 of 6 `explain` questions**, 77.8% across all 18 new option sets against a 25%
chance baseline, where the existing SPMS concepts sit at 33.3%. The cause is systematic rather than
careless: a summary written to be complete runs 28–85 characters longer than distractors written to
be wrong. SPMS `longestOptionScore` went **0.23 → 0.38**.

Two rounds of repair, both in place, neither by padding. Trimming summaries and lengthening
distractors toward each other took it to 61.1% and cut the margins from 30–80 characters to 1–12.
Then making one distractor per set deliberately longer than the correct answer — a plausible wrong
explanation deserves the same detail as the right one — took it to **33.3%, exact parity with the
existing concepts**.

**Reported rather than hidden: SPMS finishes at 0.29 against its own 0.23 baseline.** That is level
with BRGSA's shipped 0.29 and no longer the worst of the four, but the subject did move. The residue
is in the boss and cloze families, which derive from the same `application` strings and cannot be
balanced by editing a distractor list. **Anyone adding the next batch should measure this before and
after** — the structural gates passed the defective draft without a word.

Gates: lesson file 0 errors; bank validator 0 errors over 300 SPMS questions, 8 pre-existing
warnings; syllabus/taught/tested/spine all PASS; name-matching and absolute-bias both exit 0; match
gate FAILs naming `SPMS-M01-L01` alone, the expected state; `npm test` **128/128**; build 19 assets;
LAW-47 **12 routes × 4 subjects, 0 violations**; screenshots 3/3.

Left open deliberately: **nine of module 1's seventeen ideas are still not concepts**, this batch
being the L02/L03 taxonomy cluster only so the pipeline could be verified at a size that fits in one
review; **run composition is untouched**, and SPMS study set 1 is now 16 questions against roughly
34 at the full module, which is Blocker 3 and needs deciding before the module is finished; and the
layer's proposed `elaborates` parents are still not written into the catalogue.

## 2026-08-19 — The concept layer exists, and the spine was never modelled

Branch `fix/theme-switch-and-login-theming`. Tooling and planning; no content authored.
`tools/build-concept-layer.mjs` / `npm run build:layer`, plus §3.5 of
`docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md`.

Owner direction: *"every concept is surfaced, but importance is how much this concept contributes
to the entire course as a whole, and other supplementary concepts can help fill the picture. I just
need proper layer."*

**Importance is now contribution to the COURSE, measured as module reach** — how many of a
subject's eight modules return to the idea. `measure-concept-importance` used raw lecture count,
which rewards an idea hammered thirty times inside one module exactly as much as one the course
returns to throughout; only the second is a contribution to the whole. Mark share still scales the
result because it answers a different question (*what is worth testing*), and the two are reported
separately rather than conflated.

**The finding that matters: today's 64 concepts are not the spine, and the spine has never been
modelled.** They were chosen two per module, so they are module-local by construction — only **2 of
16** SPMS concepts reach six or more modules, and 8 of 16 sit in two or fewer; SCLM manages **1 of
16**. The ideas the course actually returns to — `Startup` (81 of 84 SPMS lectures, all 8 modules),
`Business model`, `Supply chain`, `Inclusive business` — **are not concepts at all**. That is the
reason nothing in the product can express one idea resting on another: the things everything rests
on were never represented.

**The layer, as emitted.** Every named syllabus idea now gets a position (the lecture where it
first appears), a role (`spine` root or `supplementary`), and a parent (the higher-contribution idea
it elaborates). **324 ideas placed, 35 unmatched, 76 roots**; spine per subject BRGSA 14, SCLM 17,
SPMS 16, IBM 29. Every idea is surfaced — **the role sets its place in the layer, never whether it
is tested**, which is what keeps this distinct from the tiering owner decision 2 rejected.

**Why the parent is the point.** Links are derived from surfaces, so an idea with nothing above it
is isolated and `groupWeaknesses()` can never pair it. Giving every supplementary idea a parent
makes the layer a forest with no dangling nodes — and because spine ideas span modules,
**cross-module links fall out of the structure** instead of being hand-authored one at a time. That
answers the SPMS zero-cross-module-links problem recorded earlier today.

**Three corrections the derivation needed, each measured and each the same shape as a defect
already in this ledger.**

- **Spine by rank, not threshold.** "Reaches ≥70% of modules" put **40 of 115** SPMS ideas in the
  spine. A threshold meaningful in SCLM is meaningless in SPMS, whose vocabulary is broadly
  distributed.
- **Parents found in a window, not a lecture.** The first cut gave `Funding stages → Value
  innovation` and `Dark patterns → Product metrics` — in a 20,000-character lecture everything
  co-occurs with everything. **Identical to the foundational-tie failure earlier today** (78% of
  ideas at a flat 100) and it took the identical fix, a 1,200-character window.
- **Rank by how often the course states two ideas together, not by proximity in the syllabus.**
  Preferring the nearest qualifying parent gave `Payback period → Growth strategies` while `Unit
  economics` sat in the same lecture. Co-occurrence count measures *elaborates*; teaching adjacency
  measures nothing. After the fix: `GDPR → Data privacy`, `CCPA → GDPR`, `DPDP → GDPR`,
  `Heartbeat principle → Release planning`.

**Reported honestly: roughly three-quarters of parents read defensibly and the rest do not** —
`Gross margin → Growth strategies` is still wrong. The layer emits as data with an overridable
`tier` and is not written into the catalogue, because the owner pass is the point of emitting it.

**A naming constraint for the ~295 records to come.** Matching is lexical and a compound name fails
if any token misses: `MoSCoW and RICE prioritisation` scores zero reach because the course spells it
*prioritization* with a z, while MoSCoW and RICE each appear in three lectures. **35 ideas are
unmatched for this reason and none is genuinely absent from the course.** Same class as the
British/American spelling traps already recorded in the authoring ledger.

Also this session, and worth naming because it recurred three times: **a backslash passed through a
shell into a JavaScript string is a different character.** The two-character escape became the
backspace control character, so a probe regex matched nothing and briefly reported `MoSCoW` and
`RICE` as absent from a lecture whose `indexOf` finds them at offsets 3172 and 3380. The same class
produced the mojibake repaired earlier today. Regex sources are now built from normalised tokens
that need no escaping, and literal edits are used instead of string injection.

## 2026-08-19 — The concept spine is specified, and two of its three blockers are code

Branch `fix/theme-switch-and-login-theming`. Planning and tooling, no content authored.
`docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md` is the plan; `tools/measure-concept-spine.mjs` /
`npm run check:spine` is the instrument.

**Two corrections to the adopted vision doc, found by reading the source rather than the brief.**
`DUNGEON_VISION_TO_BUILD.md` defines a finished concept as one with "a `chain` position plus an
authored `linkedConceptIds` pairing". **Neither is a field anyone can author.** `chain` is
`config.modules` — the eight module titles, identical for every concept in the subject; what
actually orders concepts is `conceptTeachingRank()`, reading the concept's `source` lecture. And
`linkedConceptIds` is a **derived function** over `conceptLinks()`, which builds an edge only where
a question names one concept in `conceptId` and another in `supportingConceptIds`. **The thing you
author is a question, not a concept field.**

**The cost is reframed, and this is the most useful number in the plan.** A concept is a record of
ten fields, six of them prose — and that record *generates* its surfaces: **10 from the record
alone** (retrieve ×3, apply ×2, connect ×2, explain, primer, diagnose), plus **6 more** if it is one
of its module's first two (the match and five boss steps). Measured: 64 concepts → 920 questions,
14.4 each; one SPMS concept carries 16, every one generated. So Phase 2's ~2,000–4,000 questions is
the right *output* count and the wrong *labour* estimate — the unit is **~295 concept records**, about
1,800 authored sentences, not 3,000 hand-written questions.

**Blocker 1, and it is a one-line code fix that gates everything else.**

```js
addModuleMatch(course, module, pair.slice(0, 2), dataById);   // t6_challenges.js:4086
```

The module match (`distinguish`) and the five boss steps (`synthesis`) are **the only generated
surfaces carrying `supportingConceptIds`** — they are the entire link mechanism. `slice(0, 2)` means
a third concept in any module is **born isolated**: 10 surfaces, no edge, `groupWeaknesses()`
reporting it isolated for ever. Every module holds exactly two today, so the spine reads
`isolated: 0` and looks healthy.

**Demonstrated rather than argued.** A probe concept was injected into SPMS module 1, the gate run,
and the file restored from git. `check:spine` went PASS → **`FAIL — 1 concept(s) have no link`**,
exit 1. **The orphan was `spms_jtbd`, a real shipped concept, not the probe** — `slice(0, 2)` takes
the first two in array order, so whichever concept sorts third loses its match and all five boss
steps. **Adding a concept can silently strip an existing one of every link it had**, and the only
symptom is `groupWeaknesses()` quietly calling it isolated.

**Blocker 2: the link graph is a by-product of written cases, and one subject has none.** Measured
edges — BRGSA 49 (**41 cross-module**), IBM 35 (**27**), SCLM 10 (**2**), **SPMS 8 (0)**. Every
cross-module edge in BRGSA and IBM comes from `generate`, the integrated written case prompts added
by `addIntegratedScenarios()`, which runs **only for those two subjects**. SCLM's two come from one
hand-authored item, `sclm_syn_inventory` — the only concept-linking question in the repository
written by hand. **SPMS has neither, so promise 1 — "concepts build on one another" — is
structurally unavailable in the subject with the most syllabus ideas and 75 of 75 objective marks.**
The fix is not written cases there (that repeats the error refused for IBM MCQs, optimising against
the exam) but an authored cross-module **`synthesis` MCQ** carrying both concepts. Note its
`sourceIds` must name **every** lecture involved, since LAW-47 gates each surface on its own — which
the completed teaching layer has just made satisfiable for the first time.

**Blocker 3:** runs 9 and 10 split the concept list by index parity, clean at 16 and uneven at any
other count. Not breaking, but a composition decision to make deliberately and the natural place
for the importance weighting to enter.

`tools/measure-concept-spine.mjs` is committed rather than left as scratch, because
`concepts with NO link` is precisely the assertion that would have caught `slice(0, 2)` before it
mattered. `--gate` asserts a structural invariant rather than a calibrated threshold, so it does not
repeat `LAW-75`, and it has now been seen failing and passing.

## 2026-08-19 — The teaching layer is complete: 283 lectures, 283 taught

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-teaching-layer-complete/verification.md`.

Five lessons finishing SPMS module 4 — `L03` pricing strategies, `L05` pricing diagnosis, `L06`
revenue models, `L08` financial management and forecasting, and `L10`, the Sriraman guest session at
**48,232 characters, the longest lecture in the course**. Then `M04-L04` and `M04-L09` rewritten.
Entries **278 → 283**, SPMS **79 → 84 of 84**, backlog **5 → 0**.

**Every lecture in the course now has a lesson** — BRGSA 50, IBM 78, SCLM 71, SPMS 84, all four
reported COMPLETE by `check_lesson_file`. 283 registered entries over 283 lectures: 282 lessons plus
one add-in. **It closes the authoring backlog and is not the same as the course being tested** —
184 entries are still readable-only because no scored question cites their lecture, which is Phase
2's work. Content stays owner-accepted rather than faculty-reviewed.

**Module 4 held the last two composites, and both had positive margins** — a rival genuinely beat
them — so unlike every case found earlier today the *original* Step 4c query would have caught
either. Both had been sitting in the sweep's output unread since it was first run this session.
`M04-L09` **announced itself in its title** like `M08-L08` did: "Revenue models, funding stages, and
forecasting" against a lecture called **Funding Considerations**, borrowing from **three** lectures
(`L06` revenue models, `L08` forecasting, `L07` unit economics). Own lift **0.181 → 0.456**, margin
**+0.024 → −0.337**. `M04-L04` took two of three paragraphs from `M04-L01` — `Spotify` appears 28
times there and **0 times in `L04`'s own transcript**. Own lift **0.204 → 0.467**, margin **+0.026 →
−0.271**.

**A limit of the match gate, found by reading.** `M04-L04`'s flagged rival was `M04-L03`, not
`M04-L01` where the text actually came from — because the rival is where *vocabulary* overlaps
most, which was `L03`'s pricing language inside `L04`'s one genuinely-own paragraph. **The rival
names a neighbour, not necessarily the source.**

**Nine for nine: the backlog caused the composites.** Every confirmed composite in the record
borrowed from a lecture that had no lesson when it was written — `M05-L06`, `M02-L07`, `M07-L08`,
`M03-L08`, `M06-L09`, `M06-L01`, `M08-L08`, `M04-L04`, `M04-L09`. The defect is produced by the
backlog rather than incidental to it: an author facing an unwritten neighbour absorbs its material
rather than leaving a gap. Two of the nine also duplicated *authored* neighbours, so the mechanism
is not purely gap-filling — but with the backlog at zero, the condition that generated all nine no
longer exists for new work.

**Seven terms rehomed in the same edits, three of which were never where they sat.** `one-time
charge` and `subscription` to `L06`; `payback period`, `gross margin` and `churn rate` to `L07`
(Unit Economics, where the course actually teaches them); `penetration pricing` to `L03`; and
`superforecasting` to `L08`, since Tetlock's *super forecasting* is in **L08's** transcript and not
`L09`'s. **Three phrases occur nowhere in SPMS at all** — `funding stages`, `superforecasting` and
`churn rate` — joining `AI bias`, `Requirement lifecycle` and `Team roles` as syllabus-sheet
wording the lectures never use; they pass LAW-49 via the module notes and must stay present
somewhere or the ratchet fires.

**A standing vocabulary warning was cleared as a side effect:** `L04` glossed `liquidity pricing`,
invented vocabulary and one of the nine long-standing warnings. The bank validator now reports
**8**.

Five of seven new lessons clear p25 (0.471 across the finished 283-lesson corpus). `L08` (0.394) and
`L10` (0.427) fall below with very wide margins — rivals at 0.090 and 0.034 — fitting patterns
already recorded: a short lecture in a vocabulary-dense neighbourhood, and a 48k conversational
guest session whose breadth dilutes distinctiveness. `L10`'s explainer came in at **326 words**, was
caught by `check_lesson_file`, and was trimmed to **296**.

Gates: `check_lesson_file` 0 errors and all four subjects COMPLETE; bank validator 0 errors over 283
entries, warnings 9 → **8**; syllabus/taught/tested all PASS; match gate `FAIL`s naming
`SPMS-M01-L01` alone, the expected state; `npm test` **128/128**; build 19 assets; screenshots
**16/16**; LAW-47 **12 routes × 4 subjects, 0 violations, 0 skipped**. Browser check confirms both
stale composite titles gone and **zero mojibake and zero literal markdown** across the whole index —
both Step-5-only defect classes found earlier today were scanned for explicitly.

## 2026-08-19 — SPMS module 8 is complete, and the worst composite in the corpus is repaired

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spms-m08-complete/verification.md`.

Six lessons: `M08-L02` delivery and support, `L04` legal aspects, `L06` strategic management, `L07`
competitive strategy, `L09` the ISPMA startup framework, `L10` responsible product management. Then
`M08-L08` rewritten. Entries **272 → 278**, SPMS **73 → 79 of 84**, backlog **11 → 5**. **Module 8 is
complete**, the seventh SPMS module — **everything remaining is module 4.**

**The composite announced itself in its own title.** `SPMS-M08-L08`'s lesson was called *"Market
analysis and responsible product management"*, and `L10` **is** Responsible Product Management. Two
of its three paragraphs, its worked example and four of six glossary terms were `L10`'s material;
only the Magic Quadrant paragraph was its own, and its `connects` claimed to close SPMS with two
lectures still to follow. Repaired: own lift **0.203 → 0.519** (raw 0.308 → 0.623), margin **−0.074
→ −0.475**, rival moved off `M08-L10` entirely. **The largest single repair of the five composites
fixed so far** — it started at roughly p05, the bottom twentieth of 272 lessons.

**Third margin floor in one day proved too tight, so the sweep now leads on own support.** The
original Step 4c query floored at `>0`; `SPMS-M06-L01` (−0.011) forced it to `>-0.06` this morning;
`SPMS-M08-L08` at **−0.074** is outside that too. **The margin is the fragile half and own support
is the robust one:** a composite splits its vocabulary between two lectures, so own support
collapses reliably while the margin lands wherever the borrowed half falls. The protocol now sorts
by own support and reads the bottom of the list, using margin only to explain what turns up. Two
structural exceptions are documented beside it — a **"Part 2" lecture** shares vocabulary with its
Part 1, and a **synthesis lecture** that spans the subject is distinctive against none of it
(`M08-L09`); both give low own support without being composites.

**Four tracked terms rehomed in the same edit that stripped them**, so no ratchet fired — and one
had never belonged to `L08` at all. `dark patterns`, `explainability` and `AI bias` moved to `L10`
where the lecture teaches them. **`data fiduciary` moved to `M08-L05`, which is its actual home: 6
occurrences in that lecture, 0 in `L08`'s** — so a term from one lecture had been sitting in another
lecture's lesson while its own went without it. Noted for the record: **`AI bias` occurs zero times
anywhere in SPMS**; it is a syllabus-sheet phrase the course never says (like `Requirement
lifecycle` and `Team roles`) and passes LAW-49 through the module notes, before and after the move.

**A defect I introduced, that every automated gate passed and the browser caught in one look.** The
`L08` block was assembled inside a Python script that round-tripped it through
`.encode().decode("unicode_escape")`, turning eight em-dashes into `â\x80\x94`. `check_lesson_file`,
the bank validator, the match gate, all three ratchets, `npm test` and the build stayed green — they
parse the JavaScript, not the rendered output. The running app showed `the industry analysts â
Gartner` immediately. **Same shape as the literal-`**` finding earlier today**, and the second
instance in one session of a defect only Step 5 can see. Repaired in place (8 sequences, 0 residual,
1,444 em-dashes intact, still LF) and re-verified at zero mojibake across the whole lesson index.
The avoidable cause: the other three batches this session wrote their blocks with the file-write
tool and are byte-clean; only the one built through shell escaping was damaged. Added to the
protocol's traps table.

Five of seven lessons clear p25 (0.469) and `L04` clears p50 at 0.566. `L02` (0.402) and `L09`
(0.401) fall below for the structural reasons above. **Zero untouched lessons moved by ≥0.02** —
third consecutive batch with no collateral re-scoring.

Gates: `check_lesson_file` 0 errors; bank validator 0 errors over 278 entries, the only M08 warning
pre-existing; syllabus/taught/tested all PASS; match gate `FAIL`s naming `SPMS-M01-L01` alone, the
expected state; `npm test` **128/128**; build 19 assets; screenshots **16/16**; LAW-47 **12 routes ×
4 subjects, 0 violations, 0 skipped**.

## 2026-08-19 — SPMS module 7 is complete, and two handoffs promised a lecture nobody had written

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spms-m07-complete/verification.md`.

Five lessons completing module 7, the cheapest remaining module at ~79k of transcript against M4's
~108k and M8's ~126k: `M07-L03` requirements lifecycle, `L07` product lifecycle management part 2,
`L09` scrum in practice, `L12` product engineering, `L13` user experience. Entries **267 → 272**,
SPMS **68 → 73 of 84**, backlog **16 → 11**. **Six SPMS modules complete** — 1, 2, 3, 5, 6, 7 — and
what remains is M4 ×5 and M8 ×6.

**Two consecutive `connects` promised the same absent lecture.** `M07-L01` said the next session
"puts the surviving list on a time axis as a roadmap" and `M07-L02` said it "places it on a time
axis". The module runs L01 Prioritisation Part 1, L02 Prioritisation Part 2, **L03 Requirements
Lifecycle**, L04 Product Roadmap Part 1 — so both skipped L03 and pointed at L04.

**Seventh and eighth false handoffs, and a new variant of the defect.** The module 6 case earlier
today was false *because the lesson was a composite* — its material was already spent, so it had
nothing to hand to. This pair is false *because the next lecture did not exist yet*: each author
wrote a handoff to the next lesson **in the file** rather than the next lecture **in the course**.
That variant is self-reinforcing — an unauthored lecture is invisible in the lesson file, so every
neighbouring handoff written from the file skips it and the gap closes over. **Read the module's
lecture list, not the lesson file, before writing a `connects`.**

**Two of five land just under p25 and both are "Part 2" lectures**, which is structural rather than
a defect: a Part 2 shares vocabulary with its Part 1, diluting distinctiveness. `L09` (0.462) sits
beside `L08`, `L07` (0.456) beside `L06`, and the margins settle it — the rivals trail at 0.069 and
0.104, the widest gaps in the batch. Neither meets the Step 4c sweep condition, which requires a
*near-tied* margin alongside weak own support. Recorded rather than smoothed over. The other three
run 0.512–0.561 against p25 0.468 and p50 0.551, and **zero untouched lessons moved by ≥0.02** —
second consecutive batch with no collateral re-scoring.

**`Verification versus validation` is a tracked module 6 syllabus term whose home lecture is
`M07-L03`.** The sheet files it under module 6; the course teaches it inside the requirements
lifecycle. Coverage is measured subject-wide so nothing breaks, but it is not where the sheet says.

Three neighbouring lessons already held terms this batch would otherwise have duplicated — `L08`
has `scrum master`/`retrospectives`/`sprint planning`, `L10` has `product owner`/`backlog`/`user
stories`, `L06` has `product lifecycle management`/`sunset` — so `L09` glosses the practices and
leaves the roles to `L10`. **Four terms glossed in the plural** because the course never uses the
singular (`mood boards`, `wireframes`, `ceremonies`, `user stories`); `platform shift` dropped at 0
occurrences and carried in prose instead.

Gates: `check_lesson_file` 0 errors; bank validator 0 errors over 272 entries; syllabus/taught/
tested all PASS; match gate `FAIL`s naming `SPMS-M01-L01` alone, the expected state; `npm test`
**128/128**; build 19 assets; screenshots **16/16**; LAW-47 **12 routes × 4 subjects, 0 violations,
0 skipped**. The one M07 vocabulary warning (`cost-value prioritisation` on `L02`) is pre-existing.

## 2026-08-19 — IBM is descoped, and the testing queue is much smaller than the headline

Owner direction: *"we can forget IBM for now."* Recorded because it changes the measured queue
rather than merely the priority order.

IBM carried **73 of the 233** missing syllabus ideas and **24 of the 51** genuine zeros — the
largest block in every column, and the one where an objective question earns nothing, since its
paper is ten written answers on a caselet released two days prior. Excluding it:

| scope | ideas | reached | drift | partial | absent |
| --- | ---: | ---: | ---: | ---: | ---: |
| all four | 359 | 126 (35%) | 39 | 143 | 51 |
| **without IBM** | **269** | **109 (41%)** | **35** | **98** | **27** |

So the real objective-bearing queue is **27 genuine zeros**, not 233 and not 51, and coverage
starts from 41% rather than 35%. `--written` remains in
`tools/measure-concept-importance.mjs` for when IBM returns; nothing was deleted.

## 2026-08-19 — SPMS module 6 is complete, and the sweep query could not have found its composite

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spms-m06-complete/verification.md`.

Five lessons chosen to **complete module 6**, the cheapest remaining module completion at ~66k
characters: `SPMS-M06-L02` (customer insights), `L03` and `L04` (the four product-planning
scenarios), `L06` (types of requirement) and `L07` (sources of requirement). Entries **262 → 267**,
SPMS **63 → 68 of 84**, backlog **21 → 16**. **SPMS modules 1, 2, 3, 5 and 6 are now complete**;
what remains is M4 ×5, M7 ×5 and M8 ×6.

**The sweep that exists to find composites could not have found this one, for two independent
reasons.** `SPMS-M06-L01` took its entire third paragraph and its **whole worked example** from
`M06-L02`'s lecture — the Ford faster-horses illustration and the data-versus-insight distinction,
neither of which appears anywhere in `L01`'s own transcript. The documented Step 4c query is
`awk '$1>0 && $1<0.10 && $3<0.35'`, and it fails twice over:

- **The margin floor was wrong in principle.** `L01` scored own **0.284** against `L02`'s **0.270**:
  a margin of **−0.011**, so it was *winning* against the lecture it had plagiarised and `$1>0`
  skipped it. This generalises — **a composite converges toward a tie with the neighbour it borrowed
  from, not toward a loss**, because half its vocabulary is its own. Being narrowly ahead is the
  signature, not the exoneration. Floor is now `>-0.06`.
- **The `0.35` was a stale constant.** It was p25 when written; `--calibrate` now reports p25 =
  **0.460** over 267 lessons and it has risen with every batch. A percentile pasted into a script
  becomes a magic number with no owner, and an under-selecting query returns fewer rows, which
  reads as good news. **LAW-78** is this, generalised past the tool: recompute a
  distribution-derived threshold in the same run, or print it beside the result.

Repaired: `L01` own **0.165 → 0.369** lift, margin **−0.011 → −0.236**, and its nearest rival moved
off `L02` entirely. The replacement is `L01`'s own unused material — the four named sources of a
requirements-driven plan, and the lecture's actual thesis that the goal is not more features but
customer and business value under uncertainty. **The forced order paid out a fourth time:** `L01`
was unrepairable until `L02` existed, and `L02` was in this batch.

**The false handoff had a cause worth recording.** `L01`'s `connects` promised "the next session is
how the requirement gets written down"; the next session is *Customer Insights*, and requirements
are not written down until `L05`. Sixth false handoff found this way — but this one was false
*because* the lesson was a composite: having spent `L02`'s material inside `L01`, the author had
nothing to hand off to. **A broken `connects` above a composite is the composite's fingerprint**,
and it is cheaper to check than the match gate.

**All five new lessons clear p25** (0.476–0.596 against p25 0.460, median 0.545), and the pre/post
dump diff shows **zero untouched lessons moved by ≥0.02** — the first batch on record with no
collateral re-scoring at all. `data` and `insight` were rehomed from `L01` to `L02` in the same edit
that removed them, so no ratchet fired. Two terms had to be glossed in the **plural** because the
course never uses the singular (`channel partners`, `personas`) — the `<term>` quirk caught in
advance rather than as a false accusation afterwards.

Gates: `check_lesson_file` 0 errors; bank validator 0 errors, 267 authored, **9 vocabulary warnings
none of which names a `SPMS-M06` lesson**; syllabus/taught/tested all PASS at floor; match gate
`FAIL`s naming `SPMS-M01-L01` and nothing else, the expected state; `npm test` **128/128**; build 19
assets; screenshots **16/16**; LAW-47 **12 routes × 4 subjects, 0 violations, 0 skipped**.

**A correction to how `AGENTS.md` describes the bank validator's silent-skip trap.** The warning is
real and reproducible — with the transcript path, coverage populates and 9 warnings appear; without
it, coverage is `{}` and there are 0 warnings. But the field sits at **`lessons.coverage`**, not top
level, and this session's first probe read the wrong level and briefly took a passing run for a
skipped one. Probe artefact, not a code defect; the path is now stated.

## 2026-08-19 — The testing layer has a measured queue and an importance ranking to order it

Branch `fix/theme-switch-and-login-theming`. Planning and tooling, no content authored.
`docs/briefs/TESTING_LAYER_BUILD_PLAN.md` is the plan; `tools/measure-concept-importance.mjs` and
`npm run measure:importance` are the instrument.

**The mirror gate's 35% merges three kinds of miss that need different work, and the split changes
the plan.** `--triage` over all four subjects: **233 missing, of which 39 drift, 143 partial, and
only 51 absent.** So the headline implies 233 ideas nobody tests; the measurement says **51**. That
separates two costs the vision doc had bundled: *coverage* is a much smaller job than the
~2,000–4,000 questions, which is the cost of **depth** — 8–14 surfaces with a `chain` position and
an authored `linkedConceptIds` pairing. Both are still owed; they are not the same work.

**The importance ranking is built against the owner's own definition of importance.** Owner
direction the same day, verbatim: *"terms and concepts that repeat get importance, especially if
theyre tied to a foundational concept + if theyre numerical. Basically frameworks, logic gates,
anything multi step is important."* Four signals, implemented as
`mark share x (0.30 repetition + 0.20 foundational-tie + 0.25 numerical + 0.25 multi-step)` — the
last two carrying half the weight between them, because that sentence is the direction's own
summary of itself.

**A first cut had already been built and the direction corrected it.** That version was
`mark share x (spread + generic linkage)`, and it ranked `Startup` (81 of 84 SPMS lectures) and
`Software product management` (80) top against a median spread of 8 — so those sixteen ubiquitous
terms were **set aside as "background vocabulary"**. Wrong twice over: ubiquity had first been
mistaken for importance, then over-corrected into dismissal. Repetition genuinely does confer
importance. The ubiquitous terms are the subject's **foundational** concepts — they rank on their
own repetition, and they double as the yardstick for every other idea's foundational-tie score.

**Two components were measured, found degenerate, and changed.** Same shape both times — a
plausible proxy that did not discriminate:

- **Foundational tie at lecture granularity put 78% of all non-IBM ideas at a flat 100.** A
  subject's foundational concepts are in most of its lectures by definition, so "shares a lecture
  with `Startup`" is true of nearly everything in SPMS; 20% of the weight was doing no work.
  Re-measured in an **800-character window** around each mention: p10 0 / p50 ~43 / p90 100, and it
  separates real cases — `Supply chain surplus` ties tightly to `Supply chain`, while `exponential
  smoothing` and `MAPE` tie loosely because they are self-contained techniques. Right for both; a
  numerical technique earns importance from the numerical signal, not this one.
- **"Step" vocabulary was measured and then deleted.** `first`, `then`, `next`, `stage` run at 9-15
  per thousand words across *every* lecture in the course. That is how people talk, not a marker of
  a staged framework. It discriminated nothing, and keeping it would have added noise wearing the
  shape of evidence.

And the repository's oldest trap, re-bought during construction: a substring probe matched `RICE`
in **126** SPMS sentences, every one of them the word **price**. Whole words only.

**The detectors check out.** Numerical head: payback period, gross margin, CAC, sample size, unit
economics, MAD, MAPE, exponential smoothing. Multi-step head: Lean Canvas, master loop, value
proposition canvas, inverted pyramid, requirement lifecycle, replenishment cycle, Kano model.
`Multiplicative model` scores high on both, which is correct — it is a numerical framework.

**The direction changed answers, not just the formula.** In SPMS module 6, `Requirement lifecycle`
moved from bottom of the module (8.0) to 20.9 and `Change control board` from 11.7 to 30.2 — a
staged process and a decision procedure, which is precisely what the direction says to weight.

**IBM's paper has zero objective marks** — ten written answers on a caselet released two days
prior — and IBM also has the *lowest* tested-coverage at 19%. Ranking by coverage gap would have
directed the largest block of new MCQ authoring (73 missing ideas, 24 genuine zeros) into the one
paper where an MCQ earns nothing. Because that zeroes every IBM row, **`--written` was added**: the
same four signals scaled by the written column instead (IBM 100, BRGSA 40, SCLM 24, SPMS 0). Under
it IBM orders as `Inclusive business`, `Open-source innovation`, `Bottom of the pyramid`, `Inverted
pyramid` — framework-forward, which is what an unseen caselet rewards.

It is a **measurement, not a gate** (`LAW-75`) and exits 0 always. The anti-gaming boundary is
written into the plan and is not negotiable: rewording a *question* that already tests an idea is
legitimate and pedagogically right; adding an alias to the term list or lowering a floor is the
exact move the ratchet exists to prevent. **Every drift repair must name the questions it touched.**

## 2026-08-19 — SPMS modules 2 and 3 complete, and three defects the gates caught in my own work

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spms-m02-m03-complete/verification.md`.

Four lessons chosen to **complete two modules** rather than to shrink the backlog fastest:
`SPMS-M02-L12` (the Kittlaus guest session), `SPMS-M03-L03` (go-to-market), `SPMS-M03-L05` (the
business model canvas) and `SPMS-M03-L09` (service strategy). Entries **258 → 262**, SPMS **59 → 63
of 84**, backlog **25 → 21**. **SPMS modules 1, 2, 3 and 5 are now complete.**

**A forward-reference the gate caught and my own check did not.** `M03-L05` glossed `key partners`;
the bank validator failed with *"the course does not use it until `SPMS-M03-L10`"*. The verification
had counted occurrences in module 3 without checking **where** — and the single occurrence is four
lectures later. LAW-49 requires a term at **or before** its lecture, and the protocol's instruction
is a first-appearance check mirroring `firstUse()`. Every evidence file this session has praised
doing exactly that; this batch skipped it. Term removed, idea kept in prose.

**Literal markdown in an explainer, which no content gate looks for.** `M02-L12` carried `**…**`
around its key sentence. The renderer sets `textContent`, so those asterisks would have rendered
verbatim to a learner — invisible to every gate, because they parse the JavaScript rather than the
output. Removed; a scan confirms zero such sequences in the file. Only the browser check would have
caught this, which is the argument for Step 5 in one line.

**An over-length explainer that took two trims.** `M02-L12` came in at 311 words, went to 301 —
still over — and then to 298. Recorded because the first trim was insufficient and the measurement
had to be re-run: the ~300 ceiling is not something to approach from above once and assume cleared.

**Content note.** The guest session's most examinable idea is that a services business is managed on
**utilization rate** and daily rate, and that keeping utilization rate as the main measure **kills a
product business** — it scores a developer improving the standard product as idle. Named in the
lecture as a repeated real failure, so it became the worked example. `utilization` is the course's
spelling (British form 0×), the third spelling decision this session after `customization` and
`BrainKraft`.

Gates: `check_lesson_file` **0 errors**; bank validator **0 errors** after the fix, 9 pre-existing
warnings; match gate at its **expected state**; all three ratchets **PASS**; `npm test`
**128/128**; build 19 assets; LF preserved. Real browser: 62 rows in the SPMS index, all four
titles present, **no literal asterisks rendered**, `ui-audit` **0 on every detector** at 375×812.

**Still open:** 21 lectures — M4 ×5 (including the 48k Sriraman session, the course's longest), M6
×5, M7 ×5, M8 ×6, with **M8 the heaviest untouched module**. Nine sweep candidates unread. The
concept spine is untouched at 35% of the syllabus, and the importance ranking that would order it
still does not exist.

## 2026-08-19 — Module 6 unblocked: every composite the sweep found is now repaired

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spms-m06-unblock/verification.md`.

`SPMS-M06-L10` and `SPMS-M06-L11` (release planning, both parts) authored, **then** the composite
`SPMS-M06-L09` rewritten against its own lecture. Entries **256 → 258**, SPMS **57 → 59 of 84**,
backlog **27 → 25**.

**The sweep is now clean of everything it found.** Re-running the detector confirms none of the
three appears in the leaning list any more:

| composite | ownLift | margin |
| --- | --- | --- |
| `SPMS-M07-L08` | 0.113 → **0.395** | +0.048 → **−0.243** |
| `SPMS-M03-L08` | 0.115 → **0.589** | +0.024 → **−0.482** |
| `SPMS-M06-L09` | 0.130 → **0.481** | +0.035 → **−0.311** |

**A correction to the sweep's own diagnosis, in a useful direction.** The sweep recorded
`M06-L09`'s displaced content as belonging entirely to `L10`/`L11`. Reading the lectures showed the
requirement states and triage — the composite's *first* paragraph — come from `M06-L09`'s **own**
lecture, the ISPMA framework. That is why its ownLift was 0.130 rather than near zero, and it means
the rewrite expanded what was already right rather than replacing it wholesale.

**Six tracked ideas were held by that one lesson and each was located before stripping.**
`Requirement lifecycle` turned out to occur **0 times in both M06 and M07** — a syllabus-sheet
phrase the course never says, exactly like `Team roles` — so it is carried in `L09`'s prose and
deliberately not as a glossary heading. `Verification versus validation` carries aliases and was
already satisfied by `M06-L05`. The rest moved to the lectures that teach them. Coverage held at
**116/116** with no alias and no floor touched: **second consecutive batch to get ahead of the
ratchet** instead of being caught by it.

Gates: `check_lesson_file` **0 errors**; bank validator **0 errors / 9 pre-existing warnings**;
match gate at its **expected state**; `check:syllabus`, `check:taught`, `check:tested` **PASS**;
`npm test` **128/128**; build 19 assets. Prose inside the distribution first time. Real browser: 58
rows in the SPMS index, all three new titles present, **no composite title surviving anywhere**,
`ui-audit` **0 on every detector** at 375×812.

**Two notes for whoever continues.** The sweep list **shifted** between runs — `SPMS-M04-L04` and
two BRGSA entries moved as the corpus changed, which is `LAW-76` behaving as documented, so compare
against a pre-batch dump before treating a new entry as a new defect. And the nine remaining
candidates are spread across all four subjects rather than concentrated in SPMS, so the composite
pattern may not be an SPMS-only artefact. 25 lectures remain in the backlog.

## 2026-08-19 — Content accepted, and module 3 unblocked

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spms-m03-unblock/verification.md`.

**`WAITING_OWNER_CONTENT_ACCEPTANCE` is cleared.** The owner accepted all 105 outstanding surfaces
in chat. It clears the gate that blocked `DONE`; it is **not** faculty review and creates no
subject-matter authority.

**Recorded with the discrepancy visible.** Owner decision 1, taken the same day, was *every lesson
per module needs a reading*, with sampling offered and rejected — and that reading did not happen
before this approval. So the acceptance is a **release decision rather than a completed review**,
the per-lesson reading becomes an optional quality activity rather than a gate, and the resumable
checklist decision 1 called for is neither built nor blocking. Written down rather than smoothed
over, because the index would otherwise carry a claim its own protocol contradicts.

**Module 3 unblocked on the module 7 template.** `SPMS-M03-L07` (delivery models) and `SPMS-M03-L10`
(sourcing) authored, **then** the composite `SPMS-M03-L08` rewritten against its own lecture. Its
own-lecture support went **0.115 → 0.589** and its margin **+0.024 → −0.482**, landing between the
corpus p75 and p95. Entries **254 → 256**, SPMS **55 → 57 of 84**, backlog **29 → 27**.

**Two tracked syllabus terms were at risk and were carried deliberately rather than discovered
missing.** The composite was the only place `Software delivery models` occurred, and its glossary
held `Sourcing strategy`; both were checked against `data/syllabus/SPMS.terms.json` **before**
stripping and rehomed into the new lessons' prose and glossary. Coverage held at 116/116 with no
alias and no floor touched — the first batch this session where the ratchet did not have to fire to
find the problem.

**A sixth source trap.** The course spells it `customization` (7 occurrences; the British form
occurs **0** times) while house prose is British throughout. The glossary heading uses the course's
spelling, because LAW-49 scores headings against the transcript, and the gloss says so — the same
treatment already given `Earlyvangelists` and `BrainKraft`.

**A fifth false handoff**, and again the promise was **moved rather than rewritten**: `M03-L08`
claimed to close the strategy module while `L09` and `L10` still followed, so the closing promise
now sits on `L10` and `L08` hands off to service strategy. Five in five batches, every one written
when its lesson was the last authored in its module.

**Three probe artefacts in one session, which is now the finding.** Two checks reported the new
titles missing when they were present — one was reading SCLM's index after a reload switched
subject, the other used `innerText`, which omits collapsed `<details>` — following the
uppercase-label miss earlier. All three were the instrument rather than the code. A probe's negative
result needs the same scepticism as its positive one.

Gates: `check_lesson_file` **0 errors**; bank validator **0 errors / 9 pre-existing warnings**;
match gate at its **expected state**; `check:syllabus` **PASS** at 100% × 4; `check:taught` and
`check:tested` **PASS**; `npm test` **128/128**; build 19 assets. Prose inside the house
distribution **first time, no trim needed**. Real browser: all six titles from this session's module
3 and module 7 work render, both composite titles absent, `ui-audit` **0 on every detector** at
1035×910 and 375×812.

**Still open:** one composite blocked — `SPMS-M06-L09` needs `M06-L10`+`L11` (~40k). Four sweep
candidates unread. 27 lectures remain in the SPMS backlog.

## 2026-08-19 — Module 7 unblocked: two lessons authored, and the corpus's worst composite repaired

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spms-m07-unblock/verification.md`.

**The forced order, executed deliberately for the first time.** The sweep proved three composites
blocked: rewriting one strips content whose home lecture has no lesson, which drops coverage.
Module 7 was the cheapest complete unblock and held the worst offender, so this batch authors
`SPMS-M07-L10` (product manager and product owner) and `SPMS-M07-L11` (orchestration and the
architecture product management owns), **then** rewrites `SPMS-M07-L08` against its own lecture.
Entries **252 → 254**, SPMS **53 → 55 of 84**, backlog **31 → 29**.

**The repair is the largest single quality move on record here.** `M07-L08` had the **third-lowest
own support of all 252 lessons** — it taught PM-versus-PO, business and offering architecture, and
UI-versus-UX, while its own lecture is about Agile and only the "sweet spot" came from it. Its
own-lecture support went **0.113 → 0.395** and its margin **+0.048 → −0.243**, moving it from the
bottom of the corpus to above the median. The two new lessons land at 0.500 and 0.482, near the p75.

**Not everything displaced needed a home, and that was checked rather than assumed.** The composite
also carried UI-versus-UX (`M07-L13`, backlog) and DevOps (`M07-L09`, backlog). Read against
`data/syllabus/SPMS.terms.json` first: module 7 tracks prioritisation, MoSCoW, RICE, Kano,
cost-value, roadmap, release plan, planning horizons, product lifecycle management, **team roles**
and **Agile** — neither `user interface` nor `DevOps` among them. So they cost no coverage and
return when their own lectures are written.

**`Team roles` was held up by a lesson title, and the phrase does not occur in the course.** It is a
tracked syllabus idea with **0 occurrences** in the M07 transcripts; the only thing satisfying it
was the composite's title. Retitling would have dropped it. It now sits in `L10`'s opening sentence
as **prose and deliberately not a glossary heading**, because LAW-49 governs headings and the
course never says it. Coverage held at 116/116.

**A fourth false handoff.** `M07-L08` promised the final module came next while **five lectures**
still followed it inside module 7 — written, like the three before it, when it was the last authored
lesson in its module. Repaired forward.

**One length repair, and the fix was rebalancing rather than cutting.** `L11`'s second paragraph came
in at **770 characters**, over the ceiling and the longest in the file; the offering-architecture
sentence moved into the short third paragraph, so nothing was lost to a limit.

Gates: `check_lesson_file` **0 errors**; bank validator **0 errors / 9 pre-existing warnings**, none
naming a new or rewritten lesson; match gate at its **expected state**; `check:syllabus` **PASS** at
100% × 4; `check:taught` and `check:tested` **PASS**; `npm test` **128/128**; build 19 assets. Real
browser: all three titles render, the composite title is gone, `ui-audit` **0 on every detector** at
375×812.

**Still open:** two composites remain blocked — `SPMS-M03-L08` needs `M03-L07`+`L10` (~35k),
`SPMS-M06-L09` needs `M06-L10`+`L11` (~40k), same order, this batch is the template. Four sweep
candidates unread. **105** surfaces now `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## 2026-08-19 — The composite sweep: three more found, and the backlog is what unblocks them

Measurement only — **no lesson prose changed**. Branch `fix/theme-switch-and-login-theming`.
Evidence: `evidence/2026-08-19/t6-composite-sweep/verification.md`.

**The query exists and needed no new code.** The near-miss data was already behind an undocumented
`--dump`; the signature is two conditions together — a rival beats the lesson's own lecture by
*less* than the 0.10 flag threshold, **and** its own support sits below the p25 of 0.348. Both are
needed: 18 lessons lean, only 8 also match their own lecture weakly, and margin alone is mostly
topic adjacency (`SCLM-M07-L04` leans by 0.042 while scoring 0.509 on its own lecture). Documented
as Step 4c of the authoring protocol, deliberately as a **recipe rather than a gate** — the list
contains at least one correct lesson, so failing a build on it would calibrate a detector on the
population it polices (`LAW-75`).

**Three more composites confirmed, one candidate cleared.** `SPMS-M07-L08` teaches
product-manager-versus-product-owner and architecture ownership while its own lecture is
*Developmental Methodologies Part 1* — and it has the **third-lowest own support of all 252
lessons**. `SPMS-M03-L08` teaches delivery models and sourcing with tailorability as the middle
third. `SPMS-M06-L09` teaches release planning and appears not to teach ISPMA at all. All three
share one tell: **the lesson title names two or three lectures.** `SPMS-M02-L03` is the useful
negative — low own support, leaning, and genuinely correct, because market definition and market
sizing are adjacent topics. The list is a reading queue, not a verdict. Four candidates remain
unread.

**The finding that changes the plan: composite repair order is forced, and the backlog sets it.**
A composite teaches its neighbours' material, so rewriting it *removes* that material — and the
coverage ratchet reads every lesson, cited or not. The two repaired earlier today were only
repairable **because the same session had just authored the four lessons carrying their halves**,
and stripping them still dropped `Competitive advantage` until it was taught back. Checked for all
three new ones: **every home lecture is still in the backlog** — `M07-L10`/`L11`, `M03-L07`/`L10`,
`M06-L10`/`L11`, six lectures, none authored. So none of the three can be repaired yet, and
attempting it would drop vocabulary with nowhere to go.

**This reframes the 31-lecture SPMS backlog.** It is not only coverage work: each backlog pair also
repairs a known-defective lesson, and three of the five composites found today are waiting on it.
Cheapest complete unblock is **module 7** — `M07-L10` (11,095 characters) and `M07-L11` (12,883),
about 24k of transcript, which frees the worst composite in the corpus. Module 3 costs ~35k, module
6 ~40k.

Gates unchanged and re-confirmed: `check_lesson_file` **0 errors**, bank validator **0 errors / 9
pre-existing warnings**, match gate at its **expected state**, all three ratchets **PASS**,
`npm test` **128/128**.

## 2026-08-19 — The two composite lessons are rewritten, and the reason for deferring them was false

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-composites-rewritten/verification.md`.

**Both composites now teach their own lectures.** `SPMS-M05-L06` taught launch-as-process, UX
versus CX and advantage while its own lecture is the assess → objectives → customers → positioning
framework; `SPMS-M02-L07` taught MVPs, loops and pivots while its own lecture is *Metrics for
Learning Loop*. Rewritten against their own transcripts, and **the improvement is measured rather
than asserted**: `M05-L06`'s own-lecture match went **0.263 → 0.530** with its margin against the
best rival moving **+0.052 → −0.262**, and `M02-L07` now reads own **0.447** against 0.153.

**Correction: the stated reason for deferring these was wrong.** Both were recorded — in
`AGENTS.md`, this file, the QUALITY-LOG and two evidence files — as **cited and scheduled**, which
was given as why rewriting them touched scored coverage and had to be an owner call. **Both are
uncited and unscheduled**, verified against `check_lesson_file`'s own never-scheduled list, so the
rewrite touched neither scored coverage, nor LAW-47, nor the scheduler that never delivers them.
Corrected in place in every one of those files rather than quietly dropped.

**The real risk was the coverage ratchet, and it fired exactly where predicted.**
`measure-syllabus-coverage` reads every lesson regardless of citation, so stripping the borrowed
halves dropped **`Competitive advantage`** and the gate failed at **SPMS 99% against a floor of
100%**. Repaired the way the standing rule demands — **taught back where its lecture makes it**, in
`SPMS-M05-L08`, whose transcript says plainly that customer experience *is* a competitive
advantage. No alias, no lowered floor; coverage back to 100% on all four.

**The finding worth carrying forward: a composite becomes rewritable only once its borrowed halves
have somewhere to live.** These two were genuinely unfixable earlier the same day — rewriting
`M05-L06` in the morning would have dropped the entire customer-experience vocabulary. They became
safe only after `M05-L07`, `M05-L08`, `M02-L05` and `M02-L06` were authored to carry it. Sequence,
not effort, was the blocker.

**A fifth source trap, and the gate caught my handling of it.** The launch framework is spelled
**both** `BrainKraft` and `Braincraft` in adjacent lectures. Glossing it as "BrainKraft framework"
drew a correct vocabulary warning — that phrase occurs nowhere; the course says *"a framework by a
company called BrainKraft"*. The heading is now the form the course uses, with both spellings noted
in the gloss, the same treatment the file already gives `Earlyvangelists`. One paragraph also came
in at **745 characters**, over the 695 ceiling and the longest in the file; trimmed to 651 before
commit.

Gates: `check_lesson_file` **0 errors**; bank validator **0 errors, 9 warnings all pre-existing**;
match gate at its **expected state**; `check:syllabus` **PASS** after being properly repaired;
`check:taught` and `check:tested` **PASS**; `npm test` **128/128**; build 19 assets. Real browser:
both new titles render, **both old composite titles are gone**, the re-homed competitive-advantage
sentence renders in `M05-L08`, and `ui-audit` reports **0 on every detector** at 375×812.

**Still open, and it is the obvious next check:** nothing has swept the other 62 subject-lessons
authored in the same era for the same defect. The signature is now known — a positive match margin
*below* the 0.10 flag threshold means a lesson leans toward a neighbour — but the gate does not
report near-misses, so that query does not yet exist.

## 2026-08-19 — Lessons become processes, and a lecture can now be folded into its neighbour

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Evidence:
`evidence/2026-08-19/t6-spms-m02-addins/verification.md`.

**Owner direction on lesson shape:** teach a process a learner can follow, keep the explainer
small, make the lessons synergistic, and where a lecture does not warrant a lesson of its own, fold
it into one it belongs with rather than padding it out or leaving it untaught.

**Add-ins are now a real mechanism, not a convention.** `lesson()` expands each `addIns` entry into
a real entry in `window.T6_LESSONS` — the single map every consumer reads: the app's scheduler and
its LAW-47 walk, `check_lesson_file`, both coverage gates and the match gate. So a folded-in lecture
counts as taught **everywhere at once**. The alternative considered and rejected was a pointer the
gates could not see, which would have read as an unauthored lecture for ever — the "optional work"
trap in a new hat. The contract is lighter by design (no `worked`, no `connects`; those belong to
the host, which is the unit a learner reads), but it carries **its own** prose and glossary rather
than aliasing the host's, so the match gate still scores it against its own lecture and the claim
stays falsifiable.

**Two gates judge lesson shape and both had to be taught the contract — the second one caught me.**
`check_lesson_file.mjs` was updated first. `tools/validate_t6_bank.js` keeps an independent set of
shape checks, and it went `ok: false` with two errors the moment the first add-in existed, naming
the missing worked example and handoff. Found by running the gate rather than by reasoning about
it, which is the whole argument for running them.

**Three lessons and the first add-in, finishing the learning-loop and market-expansion arcs of SPMS
module 2** — `L05` (the learning loop), `L06` (laddering MVPs across loops), `L09` (Moore's adoption
curve and the chasm), with `L08` (market expansion) folded into `L09`. Registered entries
**248 → 252**, SPMS **49 → 53 of 84**, backlog **35 → 31**. **`L05` and `L06` were assessed as a
fold-in pair and refused**: on size alone L05 looks like an add-in, but it teaches the loop and the
pivot decision while L06 teaches the ladder of successive MVPs — different skills, so two lessons.
The fold-in went where the relation is genuinely setup-to-topic.

**The small-explainer direction is measurable, not a feeling:** the new pair runs **256 words** with
paragraphs of 444–577 characters, against 277–296 words and up to 676 in the batch before it.

**Two more false handoffs, both pre-existing, and this pair pointed at each other.** `L07` promised
the next session names the two fits — that is `L11`, with `L08`, `L09` and `L10` in between — while
`L11` promised the gap between the two, which is `L10` and comes *before* it. A learner following
the handoffs would have looped. Both repaired forward. **Three false handoffs in two batches**, each
written when its lesson was the last authored one in its module.

**A probe error of my own, recorded because it is the house failure mode.** The first render check
reported the add-in's label missing. It was present, visible and correct — `.lesson-read-label` is
`text-transform: uppercase`, and `innerText` returns rendered text, so a mixed-case search could
never match. The instrument was wrong, not the code; settled by reading the DOM.

Gates: `check_lesson_file` **0 errors**; bank validator **0 errors** (after the fix) with all nine
warnings pre-existing; match gate at its **expected state**, 252 scored, **the add-in did not
flag**; `check:syllabus` / `check:taught` / `check:tested` **PASS**; `npm test` **128/128**; build 19
assets. Real browser, everything expanded, **175,340 characters**: the add-in renders inside its
host and takes no index row of its own, and `ui-audit` reports **0 on every detector** at 375×812.

**Not done:** no screenshots; no LAW-47 run (uncited lectures, no delivery order changed); no second
reader — **102** surfaces now `WAITING_OWNER_CONTENT_ACCEPTANCE`. **Owner call outstanding:**
`SPMS-M02-L07`'s lesson is a composite of the same class as `SPMS-M05-L06` — it teaches L05's and
L06's material while its own lecture is *Metrics for Learning Loop*. Cited and scheduled, so
rewriting it touches scored coverage.

## 2026-08-19 — SPMS module 5 is complete, and the handoff above the insertion point was already false

First authoring batch under the new policy. Branch `fix/theme-switch-and-login-theming`. Not
merged, not deployed. Evidence: `evidence/2026-08-19/t6-spms-m05-complete/verification.md`.

**Three lessons finish SPMS module 5, 8 of 8** — `SPMS-M05-L05` (value communication, the
customer's journey), `L07` (product launch: plan, accelerate, review) and `L08` (customer
experience as the advantage). Lesson file **245 → 248**, SPMS **46 → 49 of 84**, backlog
**38 → 35**, still entirely SPMS. These are the first lectures authored under the 2026-08-19
decision that uncited is not optional.

**The insertion defect was caught before a word was written.** `SPMS-M05-L06`'s handoff read *"That
closes the market-facing module. The next turns inward, to how requirements are gathered and
written"* — false, because L06 is Product Launch Part 1 and two lectures follow it inside module 5.
It had been written when L06 was the last authored lesson in the module. Checking the `connects`
above the insertion point is now a standing protocol step precisely because inserting a lesson is
the most reliable way this repository creates a defect, and this time the step paid before the cost
was incurred rather than after. Repaired as prescribed — **the promise was moved, not rewritten**:
it now sits on `L08`, which really is the module's last lecture.

**A fourth source trap, and it was refused.** The M05 lecture says *"we talked about **modes** in a
startup context… customer experience can be a great **mode**"* — `moat` occurs **0** times in M05,
but **1×** in M02 and **3×** in M03. So the idea is genuinely taught earlier and the word is
legitimate prior vocabulary: it is used in L08's prose and deliberately **not** made a glossary
heading, since this lecture does not introduce it. Same class as `hub-andspoke` and
`selfdetermination`; the ~one-per-module prediction continues to hold. Two hedged figures were also
handled conservatively — Dropbox's referral growth is spoken as *"more than close to 4000%"* and its
storage rewards as *"I think… as of the last I knew"*, so the two-sided referral mechanism is taught
and the double-hedged megabyte figures are not stated as fact.

**My own prose broke the house style twice and the measurement caught it before commit.** `L08`'s
first paragraph came in at **712 characters — the longest in the entire file** — and its explainer
at **306 words** against the ~300 ceiling; trimmed to 608 and 291, and the file's longest paragraph
is once again a pre-existing lesson at 695. This is the discipline the IBM-M02 batch paid for, where
four density findings were all mine and held the top seven slots; this time `ui-audit`'s density
list is ten paragraphs of which **exactly one is mine**, ranked 6th, inside the distribution.

Gates: `check_lesson_file` **0 errors**; bank validator **0 errors** with all nine warnings
pre-existing and **none naming a new lesson**; match gate at its **expected state** (`SPMS-M01-L01`
alone — no new flags and no LAW-76 corpus-shift casualties); `check:syllabus`, `check:taught` and
`check:tested` **PASS**; `npm test` **128/128**; build 19 assets; LF preserved. Real browser at
8099 with every disclosure expanded, **165,304 characters rendered**: all three titles present and
correctly labelled `Read-only — no question cites this`, `L08` read end to end as a learner sees it
(3,375 characters), and `ui-audit` **fetched from the server** reporting **0 on every detector** at
1280×720 and 375×812.

**Not done, stated rather than implied:** no screenshots (text-only addition through an existing
render path); no LAW-47 run, because these lectures are uncited so no delivery order changed; no
second reader. All three lessons are `WAITING_OWNER_CONTENT_ACCEPTANCE`, making **98 unread**.

**Also fixed: the gate string that told authors the old policy.** `check_lesson_file.mjs` closed its
SPMS note with *"uncited lectures remain and are optional"* — the same shape as the header this tool
carried until 2026-08-18, which had been telling every author since 2026-08-12 that the work was
dead. It now states the current decision and points at what actually makes these schedulable.

**Finding for the owner, not fixed:** `SPMS-M05-L06`'s lesson is a **composite**. Titled *"Launches,
customer experience, and advantage"*, it teaches launch-as-process, UX-versus-CX and advantage,
while its own lecture — Product Launch Part 1 — is the framework of assessment, objectives, segments
and positioning, which it barely touches; the CX half belongs to `L08`, which now has its own
lesson. It reads that way because it was the only lesson standing in for this whole area.
**This is exactly the class the match gate structurally cannot see** — a lesson written from half
its own lecture — and it did not flag. *(Corrected: this paragraph originally closed "it is cited
and scheduled, so rewriting it touches scored coverage… which makes it an owner call". The lesson
is **uncited**, so none of that was true. It was rewritten later the same day — see the
2026-08-19 composites entry at the top of this file.)*

## 2026-08-19 — The four decisions are answered: the whole course, at depth, every lesson read

Owner decisions recorded in chat; documents aligned to them. No product code, no content,
nothing tester-visible. Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed.

`docs/briefs/DUNGEON_VISION_TO_BUILD.md` is **ADOPTED**. The answers changed the plan's shape,
not just its go-ahead, and two of them reverse standing policy:

1. **Acceptance is per-lesson.** Sampled per-module acceptance was offered and **rejected** —
   every lesson gets read. The Phase 0 deliverable is now a resumable checklist with one row per
   lesson, rendered from `app/sets/t6_lessons.js` so it cannot drift from the file it describes
   (`LAW-72`), sequenced by importance so a partial pass releases the most examinable material.
2. **Breadth *and* depth; the tiering is rejected.** The proposed 3–4-surface "breadth" and
   "recognition" tiers are gone: every syllabus idea becomes a concept at **8–14 surfaces**. The
   owner's reasoning is the design constraint — depth is what *links* concepts, and linked
   material is what keeps prep short and accessible. So **a concept is not finished when it has
   surfaces; it is finished when it has a `chain` position and an authored `linkedConceptIds`
   pairing `groupWeaknesses()` can use.**
3. **Scope is the entire course, and importance orders it.** Not a subset and not the paper's
   weighting alone. Stated goal: *the student should never be taken off guard by the test or the
   final exam; they should know everything.* The second half is a new requirement — **mocks
   interchange topics by importance**, so successive sittings rotate across the syllabus instead
   of resampling the same 16 concepts.
4. **Uncited lectures are not optional.** *If it is in the course, it needs to be taught.* The
   authoring protocol's §0 had told every author since 2026-08-12 that these were optional work
   that "moves no coverage"; that policy is reversed in place, with the mechanics kept, because
   they still matter — authoring alone does not move *scored* coverage, and **retagging a question
   at an unscheduled lesson to fake it breaks the ladder, LAW-47 and the readiness figures
   silently.**

**The cost is stated rather than discovered.** Decisions 2 and 3 together mean ~359 concepts at
8–14 surfaces: roughly **2,000–4,000 new questions** against today's 920. That is not an argument
to revisit the decision — it is why decision 3's importance ranking is load-bearing. **Importance
does not reduce the scope, it orders it**, so the most crucial concepts are deepest first and
"never taken off guard" arrives by degrees. It becomes a field derived from paper marks, lecture
touches and inbound links, owner-corrected before ~3,000 questions are ordered by it, and used
three times: authoring order, reading order, mock rotation. **That ranking is the next move**, and
nothing downstream should start before it.

**One tension flagged rather than implemented.** Decision 4 also authorises researching missing
course material on the web. This repository's content gates assume every term traces to a
transcript — the LAW-49 vocabulary gate and `check-lesson-lecture-match` both score against the
lecture corpus — so **web-sourced material fails them correctly**, being indistinguishable from
invented vocabulary. Recorded as a provenance rule in the brief, `CONTENT-RULES` R11 and the
authoring protocol: never lower a floor or add an alias to make it pass, never file it under a
`lectureId` as though the lecture said it, and **until a provenance mechanism exists — it does
not — flag the gap for the owner instead of filling it.**

Also updated: `CONTENT-RULES.md` R11 (scope settled, the linking requirement, author-in-importance-
order), the lesson protocol's §0 (policy reversal, in place with a dated note), `AGENTS.md` Known
Gaps ×3 and the stale "optional work that moves no coverage" line,
`docs/briefs/SYSTEMS_IMPROVEMENT_PLAN.md` items 3 and 4. Gates: `npm test` **128/128**
unchanged — nothing this session touches code, lessons or the bank.

## 2026-08-19 — The gate that kept the fourth promise honest had never run

Doc and test-harness session; no product code, no content, nothing tester-visible. Branch
`fix/theme-switch-and-login-theming`. Not merged, not deployed.

**`tests/taught-not-tested.test.mjs` existed, passed 5/5 by hand, and was absent from
`package.json`'s `test` script — so it had never run once.** It asserts
`check-taught-not-tested`, the mirror of LAW-47 and the only gate watching the direction the
standing brief's fourth promise runs in (*"If Examiner feels foreign — that's Dungeon Learn's
failure"*). Every green `npm test` on record was green over a population that excluded it. This
is the second drift in that list and the first in this direction; on 2026-08-15 two paths were
listed **before** the files existed and `node --test` skipped both at exit 0. Neither was ever
caught by a failure — both were found by hand while counting.

**`npm test` does not discover tests; it names them, and a path it never sees is silence.**
Logged as **LAW-77** 🔴, with the argument that it is LAW-67's shape relocated into the runner
itself, where it silently voids any check anyone adds — including the checks written to catch
other silent failures.

**New backstop: `tests/test-runner-completeness.test.mjs`.** Set equality between
`tests/*.test.mjs` and the paths the script names, **both directions**, over a floored population
so a broken glob fails instead of passing vacuously — the LAW-67 correction applied to the
backstop itself. It was **demonstrated failing in both directions** before being trusted: removing
`taught-not-tested` from the list names it as never-run, and adding a nonexistent path names it as
missing. `npm test` **120 → 128** (five from the wired gate, three from the backstop), and
`npm run check:tested` is now a named script beside its siblings.

**The authoring documents are aligned to the vision in the direction they were missing.**
`CONTENT-RULES.md` had ten rules, every one about whether a question is *fair*, and none about
whether the course is *covered* — so an author following it exactly could keep the bank at 35% of
the syllabus for ever. New **R11 — what is taught must eventually be tested**: the ratchet is
regression-only (35% is recorded because it is bad; the target is 100%), `--triage` comes before
authoring because a miss is as often naming drift as a hole, and widening the concept spine stays
an owner decision rather than something an author invents concepts to satisfy. The lesson
protocol's Step 4 now names `check:syllabus` and `check:taught`, which fire on lesson **edits**
and bit four times in one session through innocent rewording — with the standing rule that a term
that falls out is taught back where its lecture makes it, never aliased and never floored down.
`DUNGEON_VISION_TO_BUILD.md` Phase 1 is marked **done** rather than proposed, and its "treat 35%
as measured once by hand" caveat is retired.

QUALITY-LOG **I-UNRUN-GATE** and **I-AUTHORING-DOCS-UNALIGNED**. Gates: `npm test` **128/128**,
`npm run check:tested` PASS at floors (BRGSA 67 / IBM 19 / SCLM 33 / SPMS 30). No content gate
run — nothing this session touches lessons or the bank.

## 2026-08-18 — The index halves, and the stall its own metadata named is broken

Doc-only session; no product code, no content, nothing tester-visible. Branch
`fix/theme-switch-and-login-theming`. Not merged, not deployed.

**`AGENTS.md`'s ~1,100-line status blockquote is compressed to a Current Status section plus a
one-line-per-session ledger — 184 KiB → ~90 KiB.** The file's own metadata had recorded the
defect for three sessions ("one paragraph per session, forever, is the actual defect") and the
prescribed fix had stalled. Before cutting anything, every story block was matched against this
file by date and title — **all of them already have a full CHANGELOG entry**, so the compression
points at history rather than deleting it. The close ritual now says: new sessions add a ledger
line and a CHANGELOG entry, **never** a new story block.

**Two Known Gaps entries contradicted themselves or their neighbours and are repaired** (the
self-maintenance rule is "never leave an entry known to be false"). The closed "SCLM numericals
unblocked" entry still ended "but `SCLM-M03-L06` has no lesson — author it first", a tail that
predated the 71/71 completion it sits beside; and the `[~]` numeric-entry entry still said the
z-based formula was unconfirmed, contradicting the 2026-08-13 confirmation two entries above it.
Both now state the current truth and note what they used to say.

**`docs/briefs/SYSTEMS_IMPROVEMENT_PLAN.md` is new**: a cheap-first, ordered backlog written to
be executable by smaller models — standing constraints (budget, `main` deploys, the
validator's silent-pass trap, the expected `SPMS-M01-L01` FAIL, the rejected-fixes list), then
eight items ordered by cost with per-item verification, and a parked list that needs the owner.
Per LAW-72 it declares that the ledgers win wherever it disagrees.

Health check at session start: `npm test` **120/120**. No other gate run — nothing this session
touches gated surfaces.

## 2026-08-18 — Four "open" gaps were already closed, and the bank tests a third of what we teach

Brief: `docs/briefs/DUNGEON_VISION_TO_BUILD.md`. Branch `fix/theme-switch-and-login-theming`. Not
merged, not deployed.

**The Known Gaps list had drifted from the code, and the drift was the finding.** Asked to cover the
gaps, I re-measured the four I had named as actionable and **all four were already fixed** — the
work shipped in earlier sessions and the checkboxes were never ticked. `SCLM-M03-L06` has had a
lesson since SCLM completed 71/71, so the two SCLM numericals are ordinary bank work rather than a
blocked dependency. The vocabulary gate's plural blind spot is gone: `wordPattern()` stems each word
and appends an optional plural, so `public private partnership` now resolves to `SCLM-M05-L07` and
no warning fires. The option-length cue is repaired on **all four** subjects, not just IBM —
`lengthRankSpread` reads 0.05 / 0.07 / 0.07 / 0.05 against a 0.15 limit. And all 28 SPMS `msq` stems
now ask what is *true*; a scan of all 916 questions finds **zero** stems referencing "the lecture",
and `spms_roadmap_msq` no longer carries the WhatsApp date as a correct option. All four marked `[x]`
with the measurement, so the next session does not re-derive fixes that already shipped — this is
`LAW-72`'s shape appearing in the gap list rather than in a brief.

**A measurement trap worth keeping.** A hand-rolled sort that awards the correct answer rank 1
whenever it *ties* for longest reports 37–46% and looks alarming; `longestOptionScore()` splits
credit across tied ranks and reports 0.18–0.29 against chance at 0.25. Trust the validator's figure.

**The headline finding is on the other side of the product: we teach the whole course and test about
a third of it.** Everything hangs off a `conceptId` — questions, mastery, weakness pairing, the
re-teach latch, the mock. There are **16 concepts per subject, two per module, 64 in total**, and
that number has not moved while the teaching layer grew to **245 lessons across all 283 lectures**.
Pointing the coverage gate's own matcher at the question bank instead of the lessons: the lessons
reach **359 of 359** named syllabus ideas, the bank reaches **126** — BRGSA 67%, SCLM 33%, SPMS 30%,
**IBM 19%**. 146 of the 245 lessons are never scheduled into any run.

**That is the standing brief's fourth promise failing in the direction nothing checks.** LAW-47
verifies that whatever we test was taught first; **nothing verifies that what we taught is ever
tested**, so a learner can finish every set, sit the mock, score well, and meet the real paper cold
on two-thirds of the syllabus. The proposed first move is the mirror of the gate we have —
`check-taught-not-tested` — because it turns "expand the mocks" into a work queue with a number.

**One caution recorded with it:** the 35% is a strict phrase test, and a sample shows two kinds of
miss needing different fixes — naming drift (`landing page` appears 15 times but the syllabus says
*Landing page validation*) and genuine zeros (`A/B testing`, `bottom of the pyramid`, `Little's
Law`, `north star`, `AARRR`, `Kano` — each taught by a lesson and asked by no question). Triage
before authoring. Same distinction that cost four coverage repairs earlier the same day.

`docs/briefs/DUNGEON_VISION_TO_BUILD.md` carries the full measurement, a five-phase route, and the
four decisions it needs from the owner. Registered in `DESIGN_SOURCE_INDEX.md`; **proposed, not
adopted.**

## 2026-08-18 — The misfiled-lesson queue is cleared, and the twelfth is the owner's call

Evidence: `evidence/2026-08-18/t6-misfiled-lessons-cleared/verification.md`. Queue:
`docs/briefs/MISFILED_LESSONS_WORK_ORDER.md`. Branch `fix/theme-switch-and-login-theming`. Not
merged, not deployed.

**Ten queued lessons, nine rewritten against their own transcripts.** `SCLM-M01-L05` and `L08` were
entangled — the financial material sat at L08 and belonged at L05 — and are now Financial Measures
(ROE, ROA, the margin × turnover split, cash-to-cash in weeks, Amazon's own numbers) and the three
logistical drivers in depth, with Little's Law on the lecture's own 60 × 10 = 600 example.
`SCLM-M05-L01` is now the FarmAid case setup, scoped to the engagement and its two prioritised
questions because `L10`–`L13` already own the industry figures, the carrying cost, the dispatch yard
and the stockyard model. Four SPMS module 1 lessons, three SPMS singles, and two lessons that did
not exist — `SPMS-M01-L09` (Product Thinking; the module's only unauthored id and the head of the
SPMS backlog) and `SPMS-M07-L05` (Product Roadmap Part 2, authored to receive the roadmap material
displaced from `M07-L06`). File **243 → 245**, SPMS **44 → 46**, backlog **40 → 38**.

**SPMS module 1 was not an off-by-one, and the repair had to reach further than the flags.** The
work order described a systematic shift; reading all ten lectures showed `L02`, `L05`, `L07` and
`L10` were already correct and the displacement runs as a broken chain, not a constant offset.
Because `L03` had to give up the four kinds of software product, and C01 is the lecture that teaches
them, `L02` was widened to carry both halves of its own lecture. `L07` was also found pre-teaching
C07's validation phase — a lesson written from its own lecture *plus* a neighbour's, which is
precisely the class `check-lesson-lecture-match` says it cannot see, and it never flagged it. Found
by reading the lectures, which remains the only thing that finds this.

**An eleventh lesson surfaced, and the first job was proving whose fault it was.** `SPMS-M04-L01`
was not in the queue and was never edited, but flagged after the module 1 work. Measured against
the pre-batch file it had scored **+0.0944** and afterwards **+0.100**, against a `MARGIN_MIN` of
0.10 — the corpus statistics the gate's lift is computed from had shifted under it. That makes it a
pre-existing borderline case the edit revealed, not a regression; it was then diagnosed rather than
dismissed, and is a real misfile, since every level of the pricing pyramid it taught first occurs in
`M04-L02`'s lecture. **`LAW-76` 🟡**: diff the score against the previous file before assuming
either blame or noise, and re-run a corpus-relative gate after every batch.

**Coverage is a ratchet and it bit four times — nine terms fell out and every one was taught back
where its lecture makes it, with no alias added and no floor lowered.** `efficient supply chain`
and `responsive supply chain` went to `SCLM-M01-L04`, whose lecture says both; `shipper decision
horizons` and `macro ecosystem actors` to `SCLM-M05-L07`, whose lesson already taught both ideas
without naming them; `decision phases` to `SCLM-M01-L02`, whose lecture is *titled* that; blue ocean
and value innovation to `SPMS-M05-L02`, the only SPMS lecture that says them; the pricing pyramid
levels to `SPMS-M04-L02`; `AARRR` to `SPMS-M08-L03`. Four SPMS misses were **phrase-match failures
from rewording** rather than dropped teaching — the coverage tool needs a named idea to appear as
its name, contiguously, so "Product against project" reads as untaught where the syllabus says
"Product vs project". Fixed by using the course's own form. Two standing vocabulary warnings
cleared as a side effect: `value equation` and `startup stages` were glossed on `SPMS-M01-L08` and
appear in neither the transcripts nor the notes; both survive in prose, neither is a heading now.

**Seven more handoff repairs makes nineteen recorded.** All seven were falsified by the misfiling
rather than by the rewrite, and five were found by reading the whole module chain rather than only
the lesson above each edit. One was self-inflicted and caught the same way: a prefix-anchored string
replacement left the old tail in place, so `SPMS-M05-L02` shipped a duplicated sentence for the
length of one gate run.

**`SPMS-M01-L01` stays, on an owner decision, and option 3 is answered.** Its `lectureId` names a
685-character *Key Takeaways Module 1* card. The work order asked whether the transcript was missing
a first lecture: it is not — `SPMS_M01_SUM_TRANSCRIPT.txt` and `SPMS_MEGA_TRANSCRIPT.txt`
independently hold exactly ten module 1 sections, agreeing on order and titles. The lesson's content
is not orphaned either; `parties involved` and `defined rights` are both in the module 1 detailed
notes. It is real course material under an id that names a takeaways card, the owner chose to leave
it, and the gate's remaining flag is now **expected rather than outstanding**.

**Prose was measured before commit and seven drafts failed it.** Explainers came in at 360, 342,
331, 314, 313, 310 and 302 words against a ~300 house ceiling, with three paragraphs over the
695-character house maximum; all trimmed with arguments intact before anything was committed. About
90 figures and terms were grep-verified first, each through a first-appearance check mirroring the
validator's own `firstUse()`. Gates: `check_lesson_file` **0 errors**, bank validator **errors: 0**,
coverage and taught-vocabulary **PASS**, `npm test` **120/120**, build 19 assets, screenshots
**20/20**, LAW-47 **12 routes × 4 subjects, 0 violations, 0 skipped** — reloaded between subjects so
LAW-62 cannot carry. The match gate reports **FAIL on exactly one lesson**, by design.

New and rewritten prose stays `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## 2026-08-18 — Two of the twelve misfiled lessons fixed, and a work order for the rest

Evidence: `evidence/2026-08-18/t6-lesson-lecture-match-gate/verification.md`. Queue:
`docs/briefs/MISFILED_LESSONS_WORK_ORDER.md`. Branch `fix/theme-switch-and-login-theming`. Not
merged, not deployed.

**`SCLM-M01-L02` and `SCLM-M01-L03` now teach their own lectures.** L02 was teaching L01's supply
chain surplus and now teaches the design / planning / operations decision phases; L03 was teaching
L02's decision phases plus half of its own and now teaches the cycle view, the push-pull boundary
and the CRM / ISCM / SRM macro processes. `SCLM-M01-L01` absorbed the displaced surplus content,
which its own lecture teaches anyway, and its handoff was repointed. Both dropped off the match
gate; coverage held at 100% and the validator stayed at 0 errors.

**The diagnosis reads as a compression rather than a clean shift.** SCLM module 1's lessons had
folded five lectures' content into four lessons, leaving *Process View*'s macro processes and
*Logistics Drive* untaught. SPMS module 1 is a genuine off-by-one, and its cause is structural:
`SPMS-M01-L01` is a 685-character "Key Takeaways" card rather than a lecture, unique among 283
lectures, so module 1 appears to have been numbered from the first real lecture.

**The remaining ten are diagnosed but not written**, with the lecture each one should teach and the
traps specific to it recorded in the work order. `SCLM-M01-L05` and `L08` must be done as a pair
— the financial-measures content currently sits at L08 and belongs at L05, which leaves L08 needing
fresh prose on the three logistical drivers. `SPMS-M01-L09` must not be authored until the module-1
shift is resolved, or it will duplicate `SPMS-M01-L08`'s lesson.

Gates: `check_lesson_file` 0 errors, validator 0 errors, coverage and taught-vocabulary PASS,
`npm test` 120/120, build 19 assets. Match gate FAILs on the 10 outstanding, by design.

## 2026-08-18 — A gate for the defect no gate could see, and eleven more lessons it found

Evidence: `evidence/2026-08-18/t6-lesson-lecture-match-gate/verification.md`.
`VERIFIED(AUTOMATED + FIXTURE)`, branch `fix/theme-switch-and-login-theming`. Not merged, not
deployed.

**`tools/check-lesson-lecture-match.mjs` tests the claim a `lectureId` makes.** It scores each
lesson's distinctive vocabulary against its own lecture and against every other lecture in the
subject, and flags a lesson that some rival explains better. Until now nothing tested that claim:
the id was checked against the manifest, the glossary against the transcripts, delivery order by
LAW-47, and coverage at subject level — and a lesson teaching the wrong lecture satisfies all four.

**The gate reported PASS on its own regression case twice while being built, and the committed
fixture caught it both times.** First, discounting words found in the course notes — right for the
vocabulary gate, fatal here, because a revision sheet covers a module and cannot resolve to a
lecture, so every miss was laundered into a pass: the known-bad lesson went from 0.178 own support
to **0.871, above the median of the correctly-mapped file**. Second, computing each lecture's
background rate from the two-lesson fixture instead of the shipped corpus, which let the fixture's
own defect become the baseline it was measured against. A third trap was caught by inspection
rather than by the fixture: raw coverage rewards lecture length, and **six of sixteen first-run
flags named the same 48,000-character guest session** as the rival — not the source of six lessons,
just the biggest bag of words in the subject. Every lecture now carries the mean score it achieves
against all other lessons, and that background is subtracted.

**The threshold is anchored on the confirmed defect rather than on the shipped distribution, and
that inverts this repository's usual method for a reason worth keeping.** Calibrating on the
population assumes the population is correct — safe for a style measure, circular for a defect
detector, because **the shipped corpus contains undiagnosed instances of the very defect**. A line
drawn through that distribution sits exactly where the existing mistakes already are. **`LAW-75`.**

**Eleven shipped lessons flag, and four are confirmed misfiled by reading the lecture titles.**
`SPMS-M01-L04`'s lesson teaches *Product Family Platform Productline*, which is L03's lecture;
`SCLM-M01-L05`'s teaches *Strategic Fit*, which is L04's; `SCLM-M01-L08`'s teaches *Financial
Measures*, which is L05's; and `SCLM-M05-L01`'s teaches logistics and decision horizons against a
lecture that is the FarmAid Tractors case. **SCLM module 1 is shifted by one** across at least L05
and L08 — the same shape as the module-2 defect fixed earlier today. The other seven are unread and
are claims about where to look, not verdicts.

**A structural finding underneath: `SPMS-M01-L01` is not a lecture.** It is a 685-character "Key
Takeaways Module 1" card, and every other one of the 283 lectures across four subjects runs over
1,500 characters. **This blocks SPMS authoring**: `SPMS-M01-L09` (*Product Thinking*) is first on
the backlog, and `SPMS-M01-L08`'s existing lesson already teaches product thinking and scores its
best match against L09 — so authoring the backlog item as listed would duplicate it. Recorded in
Known Gaps; no SPMS lessons were authored in this stretch.

**What the gate cannot see, stated in its own header.** The fixture holds two defects and it finds
one. `SCLM-M02-L03` was written from another lecture, so a rival explains it better and the
comparison fires. `SCLM-M02-L04` was written from its own lecture's first half plus a neighbour's
opening, so no single rival dominates and it scores −0.079. **A PASS means "nothing looks written
from a different lecture", never "every lesson covers its lecture"** — read the second way it would
retire the suspicion that finds the rest.

Wired in as `npm run check:lesson-match`, added to the authoring protocol's batch gates and to
`AGENTS.md`'s baseline checks. It is not in `npm test`, because it needs the external transcripts
that cannot be committed; without a path it exits 2 rather than reporting a green tick over zero
checks. `npm test` 120/120, build 19 assets, `check_lesson_file` 0 errors.

## 2026-08-18 — The two forecasting lessons that taught the wrong lectures, rewritten

Evidence: `evidence/2026-08-18/t6-sclm-subject-complete/verification.md` §R1 (now closed).
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, branch
`fix/theme-switch-and-login-theming`. Not merged, not deployed.

Follow-up to the SCLM completion entry below, on the owner's instruction to fix the reported
content-mapping defect rather than leave it open.

**It was two lessons, not one.** `SCLM-M02-L03` taught L04's method families and error metrics, as
reported. Re-reading `SCLM-M02-L04` while fixing it showed the drift ran further: **L04's first
paragraph taught L02's push/pull material**, and its remaining two covered only the demand
components — so the *forecast accuracy* half of a lecture titled "Demand Components and Forecast
Accuracy" was taught nowhere by the lesson carrying that id. The whole module-2 opening was sitting
one lecture off.

**Both rewritten against their own transcripts.** `SCLM-M02-L03` now teaches what its lecture
teaches: the four features true of every forecast (the past-continues assumption, never exact, more
accurate for groups than items, accuracy falling with horizon), the seven elements of a good
forecast, and the six-step process as a loop. `SCLM-M02-L04` now teaches both of its halves — the
five demand patterns including the horizontal and irregular ones no lesson had covered, and the
accuracy machinery: `Et = At − Ft`, mean error as bias, MAD, MSE and MAPE, with the lecture's own
eight-day dark-store example (MAD 22 ÷ 8 = 2.75, MSE 76 ÷ 8 = 9.5, MAPE 10.26 ÷ 8 = 1.28%).

**A third gap surfaced while checking where the displaced content should live.** `SCLM-M02-L05`'s
lesson opened straight into the four qualitative methods and never stated the split its lecture
opens on — qualitative against quantitative, and quantitative dividing into time series and
associative. That paragraph is now written, and `qualitative forecasting` and
`quantitative forecasting` are glossed where the course introduces them.

**The pre-existing L04-before-L03 file inversion is gone.** Both blocks were being replaced anyway,
so they went back in course order. That inversion is the most plausible cause of the mix-up — the
two lessons read as having been written from L04's transcript in the order it was read — so removing
it removes the condition as well as the symptom. Module 2 now runs L02 → L12 in order, with
`SCLM-M02-L01` still filed deliberately between L10 and L11 for the reason its comment gives.

**Coverage caught the one thing the rewrite dropped, and the fix was to teach it.**
`Systematic component` had lived only in the old L04 glossary, and SCLM fell to 99% against a 100%
floor the moment it went. The floor is a ratchet and the guidance is explicit that a dropped term is
not an aliasing problem, so the idea went back into L04's prose where the lecture actually makes it
— the patterns are the part a model can learn, and what remains is random variation. Back to 100%.

Gates after the rewrite: `check_lesson_file` **0 errors**, bank validator **errors: 0** with no
warning naming either lesson, syllabus coverage **PASS** (SCLM 100%), taught-vocabulary **PASS**,
`npm test` **120/120**, build 19 assets, screenshots **16/16**, LAW-47 **12 routes on SCLM, 0
violations, 0 skipped**, `ui-audit` **0 on every detector**. Both rewritten lessons sit inside the
shipped distribution — 301 and 318 explainer words against a file median of 234 and max of 318, and
no paragraph above 669. Both remain uncited and read-only, so nothing scored moved. They carry
`WAITING_OWNER_CONTENT_ACCEPTANCE` like the rest.

## 2026-08-18 — SCLM is the second complete subject: 71 of 71 lectures

Evidence: `evidence/2026-08-18/t6-sclm-subject-complete/verification.md`.
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, branch
`fix/theme-switch-and-login-theming`. Not merged, not deployed.

**Every SCLM lecture now has a lesson.** 33 lessons complete modules 2, 3, 5, 6 and 7; 1, 4 and 8
were already done. File **210 → 243**, backlog **73 → 40**, and the backlog is now entirely SPMS.
Scored coverage does not move — SCLM's 17 cited lectures were already taught — so what this buys is
continuity: the lesson index renders **71 per-lesson disclosures** for SCLM and reads
"17 taught in practice, **54 readable here only**".

**Source fidelity held across all 33.** Roughly **250 figures and phrases** grep-verified against
the module transcripts before any prose was written, plus a first-appearance check mirroring the
validator's own `firstUse()` for every intended glossary heading. Zero misses, and none of the
validator's ten standing warnings names a lesson written today. **One term was refused before it was
written**: `backward integration` does not occur in the SCLM transcripts — the lecture says the
federation "backward **integrated**", and the gate's plural tolerance does not bridge that — so the
idea stayed in the prose and only `forward integration` became a heading. Two transcript slips were
not reproduced: an arithmetic misspeak in `SCLM-M02-L09` (24 said, 28 computed) and a
self-correction in `SCLM-M05-L12`.

**LAW-50 recurred in six blocks at once, and was caught before the file was touched.** Six
`explainer: [ … ]` arrays in the SCLM-M02 batch were closed with `},`. The house-style measurement
script parses the explainer to count words, so the mis-closed arrays came back at 467–561 words
against a ~250 budget — the regex had run past the array into the glossary. **A length measurement
is also a structure measurement**; the script now checks the closer directly rather than inferring
it from an implausible word count. Fourth recorded recurrence, and the first caught before the file
was written.

**A Python text write flipped the whole lesson file to CRLF, and a build would have shipped it.**
`io.open(path, 'w')` on Windows translates `\n` to `\r\n`, so two handoff repairs rewrote all
**6,448 lines** of `app/sets/t6_lessons.js`. `.gitattributes` states exactly why that matters: the
release build copies files straight from the working tree into `dist/client`, so a line-ending
conversion changes the bytes the Worker serves and every asset hash with them. Git would have
normalised the commit; a build from that working tree would not. It surfaced only because the next
insertion could not match its `\n`-anchored insertion point. Converted back, verified at 0 CRLF, and
every later edit made with Node instead. **`LAW-74`**.

**Nine paragraphs sat outside the house distribution and the measurement said so.** `ui-audit`'s
`density` detector fired on ten paragraphs, all mine — and the detector alone settles nothing, since
81 shipped lessons already exceed its threshold. What decided it was the existing distribution:
across **634 paragraphs shipped before today the median is 454 characters, the 99th percentile 673,
and exactly one exceeds 700**. Nine of my 99 did, and eight of the file's top eleven paragraphs were
mine. Trimmed in two passes to a maximum of **695**. Total explainer word counts were inside budget
throughout (235–298 against a ~300 gate) — the imbalance was *within* lessons, one long paragraph
and two short ones, which a word count cannot see.

**Six more handoff repairs**, bringing this defect to twelve recorded instances and confirming it as
the most reliable failure in the work: `SCLM-M03-L01`, `SCLM-M06-L02`, `SCLM-M05-L01`,
`SCLM-M05-L06`, `SCLM-M02-L03` and `SCLM-M02-L06`.

**Reported, not fixed — `SCLM-M02-L03`'s lesson does not teach `SCLM-M02-L03`'s lecture.** The
shipped lesson teaches method families, the multiplicative seasonal model and MAD/MSE/MAPE; that
material is in L04's transcript, and `MAD` and `MAPE` do not appear in L03's at all. L03 actually
teaches the four common features of all forecasts, the elements of a good forecast, and the six-step
process — taught nowhere. Both lessons are uncited and read-only, so no scored path is affected and
LAW-47 still passes; the defect is content mapping, not gating. Rewriting shipped lesson prose is a
separate decision from authoring the backlog, so it is reported rather than fixed.

**`SCLM-M02`'s transcript order is not its teaching order.** `SCLM-M02-L01` (*Associative
Techniques*) opens "so far we have mostly used time series methods … even with seasonality now" and
closes the forecasting arc. Its lesson is therefore filed between L10 and L11, with a comment at the
insertion point saying why, so the module reads as a path and every handoff is true of what follows
it; `lectureId`, `module` and `order` still match the manifest exactly.

Gates: `check_lesson_file` **0 errors**, bank validator **errors: 0**, coverage and
taught-vocabulary **PASS**, `npm test` **120/120**, build 19 assets, screenshots **16/16**, LAW-47
**12 routes on SCLM, 0 violations, 0 skipped**, `ui-audit` **0 on every detector** at 1280 light and
375 dark with all 71 SCLM lessons expanded. All 33 lessons stay
`WAITING_OWNER_CONTENT_ACCEPTANCE`, making **79 unread**. Not merged, not deployed.

## 2026-08-18 — IBM is the first complete subject: 78 of 78 lectures

Evidence: `evidence/2026-08-18/t6-ibm-subject-complete/verification.md`.
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, branch
`fix/theme-switch-and-login-theming`. Not merged, not deployed.

**Every IBM lecture now has a lesson.** 32 more lessons complete modules 3, 5, 7 and 8; modules 2,
4 and 6 were finished earlier the same day. File **178 → 210**, backlog **105 → 73** (SCLM 33,
SPMS 40). Scored coverage does not move — it was already 100% — so what this buys is continuity,
and all 78 are readable in the lesson index, which now renders **78 per-lesson disclosures** and a
coverage line reading "16 taught in practice, 62 readable here only".

**Source fidelity held across all 32.** Roughly **330 candidate terms and figures** grep-verified
against the module transcripts before any prose was written, with first-appearance position, and
**zero misses**; the bank validator reports 0 errors with none of its ten standing warnings naming a
new lesson. Two of the M08 transcripts embed Hindi and Marathi voiceover transcription; those runs
were stripped before reading and none of it reproduced.

**The house-style length check earned its keep.** Eight `worked.because` drafts came in above the
521-character house maximum and were measured and trimmed **before** commit rather than found
afterwards. No lesson in the file now exceeds the range.

**A mechanical defect nearly shipped silently, and the gate order caught it.** An insert script
built em dashes by concatenation inside what was actually a single Python literal, so **17 glossary
entries were written into the JS as concatenation against an undefined variable**.
`check_lesson_file.mjs` reported `parse failed: D is not defined` immediately — which is exactly
the LAW-50 argument for running the structural gate before the bank validator, since a file that
does not parse tells the validator nothing at all.

**Six handoff repairs in one day makes this the most reliable defect in the work.** Inserting into a
module keeps falsifying the `connects` of the lesson above the insertion point: `IBM-M03-L05`,
`IBM-M05-L07`, `IBM-M05-L10`, `IBM-M07-L05`, `IBM-M08-L01` and `IBM-M08-L05`, on top of
`IBM-M06-L02` and `SCLM-M04-L02` earlier. Where the promise was still true of a later lesson it was
moved there rather than rewritten — "Module 6 turns to skills and waste" now closes `IBM-M05-L12`,
and "IBM is complete" now closes `IBM-M08-L08`.

Gates: `check_lesson_file` **0 errors**, bank validator **errors: 0**, syllabus coverage and
taught-vocabulary **PASS**, `npm test` **120/120**, build 19 assets, screenshots **16/16**. LAW-47
**12 routes on IBM, 0 violations, 0 skipped**. `ui-audit` **0 on every detector** at 1280 with the
lesson index open. All 32 stay `WAITING_OWNER_CONTENT_ACCEPTANCE`, which with the earlier batches
makes **46 lessons unread by anyone**.

## 2026-08-18 — SCLM modules 1, 4 and 8

Evidence: `evidence/2026-08-18/t6-subject-rail-screenshots-ibm-m04-m06/verification.md` (same
session, extended). `VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, branch
`fix/theme-switch-and-login-theming`. Not merged, not deployed.

Seven more lessons, and **three more complete modules**: SCLM M01 9/9, M04 8/8, M08 4/4. File
**171 → 178**, backlog **112 → 105** (IBM 32, SCLM 33, SPMS 40). Six modules are now complete
across two subjects.

`SCLM-M01-L07` KPI tree; `SCLM-M01-L09` the three cross-functional drivers; `SCLM-M04-L03` supply
contracts and procurement; `SCLM-M04-L06` the five coordination obstacles; `SCLM-M04-L07` CRP, VMI
and CPFR; `SCLM-M04-L08` the mid-course recap; `SCLM-M08-L02` Akshaya Patra's constraints.

**Two source traps, both refused rather than papered over.** `push versus pull` scores zero because
the transcript says "the push versus **the** pull systems", and `days payable outstanding` scores
zero because the course writes "days**'** payable outstanding" — so neither became a glossary
heading; `push system` and `pull system`, which do verify, were used instead. Same class as the
`hub-andspoke` and `selfdetermination` traps already recorded. Every other candidate verified with
first-appearance position before writing, and the bank validator raised **zero**
invented-vocabulary warnings against the new lessons.

**A second handoff repair, and it is now clearly a pattern.** `SCLM-M04-L02` promised "what happens
across the whole chain when they do not", which pointed at the bullwhip lecture and became false
the moment `L03` was inserted between them. Repaired, exactly as `IBM-M06-L02` was earlier in the
session. **Inserting a lesson is the standard way this defect gets created**, and the plan now says
to check the `connects` above every insertion point.

**Prose length was measured, and one draft failed it.** `SCLM-M04-L08`'s `worked.because` came in at
**534** against a house maximum of **521**, and was trimmed to 468 rather than argued for. The
remaining six landed 463-502 first time. The check is now routine rather than a post-mortem.

**The file is not reliably in course order.** SCLM module 1 sits L01-L05, **L08, L06** — a
pre-existing inversion. Left alone rather than reordered (large diff, readability-only gain) and
recorded in the plan so the next author does not assume sorted neighbours.

Gates: `check_lesson_file` **0 errors**, bank validator **errors: 0**, syllabus coverage and
taught-vocabulary **PASS**, `npm test` **120/120**, build 19 assets, screenshots **16/16**. LAW-47
**12 routes on SCLM, 0 violations, 0 skipped**. `ui-audit` **0 on every detector** with all seven
new lessons expanded, and five string probes confirm full bodies rather than titles. All seven stay
`WAITING_OWNER_CONTENT_ACCEPTANCE`.

## 2026-08-18 — The subject rail, screenshots written down, and IBM modules 4 and 6

Evidence: `evidence/2026-08-18/t6-subject-rail-screenshots-ibm-m04-m06/verification.md`.
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

**The subject rail hid two of its four subjects on a phone.** `ui-audit`'s `hiddenScroll` had
reported `div#course-grid` at **355px of 768px, 54% hidden**, and measuring per card showed that was
not detail: SPMS visible, BRGSA cut at the edge, **IBM and SCLM entirely off-screen** — on the one
control whose job is choosing between four subjects. A swipe rail earns its keep for a long or
unknown list; this list is four, fixed and known at build time. The phone layout now falls back to
the two-column grid the `<=900px` rule already defines, so it is 2×2: **hidden 54% → 0%**, all four
visible at 320 and 375, desktop untouched at four across. **The cost is +106px and is stated rather
than hidden**, on a dashboard running about 6,700px on a phone; the original comment's fear was a
vertical stack of four at ~410px, and two rows is not that. Card heights are identical at 320, so
the old defect where SPMS laid out differently because it alone carries a negative-marking flag has
not returned.

**The edge fade was not broken — the instrument was.** Reading it first gave `opacity: 0` where the
CSS says `1`, and it survived a full audit: the element matched the selector, the rule existed with
winning specificity, no `!important`, and a **recursive** walk of every stylesheet including media
queries found no override. The cause was `document.timeline.currentTime` **pinned at 0** while
`performance.now()` advanced 511ms — an undisplayed Browser pane composites no frames, so every CSS
transition reads as its start value for ever. **Third time this artefact has cost this repository**,
and the closest call yet, since the false reading survived a specificity audit and a 700ms wait.
Logged as **LAW-73 🟡**. The first probe written to investigate it had the non-recursive
stylesheet walk `LAW-71` already records.

**Screenshots now work and are written down.** `tools/screenshot.mjs` has existed since 2026-08-15
and ran first time: **16 shots, 16 ok, 0 failed**. The problem was never capability but
discoverability — the knowledge sat in a Key Files row, a *closed* Known Gaps checkbox, and the
tool's own header, none of which is where a session looks when it wants a picture. New
`docs/governance/SCREENSHOTS.md` carries the command, why the pane cannot work, the frozen-timeline
probe, and what a picture still cannot tell you; pointed at from `AGENTS.md`'s required-reading
order and Key Files, `UI-CHECKLIST.md`, the authoring protocol's browser step, and `CLAUDE.md`.
Shots were **read, not counted**: the 375 dashboard in both themes and the 375 lesson screen.

**IBM modules 4 and 6 authored — both now complete** (6/6 and 5/5). Seven lessons, file **164 →
171**, backlog **119 → 112**. 64 M04 and 88 M06 candidates grep-verified against the transcripts
before writing, with first-appearance position: **zero misses in both passes**, zero
invented-vocabulary warnings. **Prose length was measured before committing this time** — the lesson
the previous batch paid for — so all seven `worked.because` fields landed at **430–506** characters
inside the house range of 62–521. **One handoff had to be repaired:** `IBM-M06-L02` promised "the
next lecture finds value in something everyone else was throwing away", true while the waste lecture
followed it and false once `L03` was inserted between; the promise moved to `L03`. Inserting a
lesson is exactly when an across-a-skip handoff is created, and the plan now says to check the
`connects` above every insertion point.

Gates: `check_lesson_file` **0 errors**, bank validator **errors: 0**, syllabus coverage and
taught-vocabulary **PASS**, `npm test` **120/120**, build 19 assets, screenshots **16/16**. LAW-47
**12 routes on IBM, 0 violations, 0 skipped**. `ui-audit` **0 on every detector** at 320, 375 and
1280 with all seven new lessons expanded.

**The seven IBM-M02 lessons are `ACCEPTED`** — the owner approved that prose in chat. That clears
their content gate and is not faculty review. The seven in this batch were written *after* that
approval, so they stay `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## 2026-08-18 — IBM module 2 finished, and the brief that contradicted the ledger

Evidence: `evidence/2026-08-18/t6-teaching-layer-ibm-m02/verification.md`.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

The ask was to follow the teaching-layer plan and keep authoring. Module taken: **IBM module 2**,
its last seven lectures — `IBM-M02-L11` to `L17` — which **completes the module at 17 of 17**. The
lesson file goes **157 → 164** and IBM's backlog **46 → 39**, all of it now in modules 3 to 8.

**The plan's §0 is wrong, and it contradicted this repository's own ledger.** It states "there is no
browse or library view" and that lessons for uncited lectures are "never shown to a learner" —
which is the premise the whole 130-lecture backlog is framed on. `QUALITY-LOG.md` **I50**, logged
**2026-08-12**, records shipping exactly that view: the `Read the lessons` dashboard disclosure
(`renderLessonIndex()`, `app/t6.js:2166`), which renders every authored lesson in full and already
labels the uncited ones `Read-only — no question cites this`. The brief was written 2026-08-17 and
contradicted a five-day-old entry. `tools/check_lesson_file.mjs` carried the same claim in its
header and its warning string, written for I49 on 2026-08-12 and falsified by I50 the same day, so
**the tool has been telling every author since that this work is dead**. Measured in the running
app: the disclosure renders 106,661 characters across 39 IBM lessons, all seven new titles present,
coverage reading "16 taught in practice · **23 readable here only**", with seven string probes
confirming full bodies rather than titles. Corrected in the plan, the protocol, and the tool, whose
warning now reads "never scheduled into a run (they remain readable in the lesson index)". Logged as
**LAW-72 🟡** — a self-contained brief is a second source of truth and drifts from the ledger. It was
found only because protocol Step 5.3 asks the author to read a new lesson as a learner would, which
the plan's own premise said was impossible; **a procedure step you cannot carry out is evidence
about the premise, not a step to skip.** `layeredQueue()` still never schedules these, so scored
coverage is unmoved — what changes is the claim that nobody can read them, and therefore what the
owner's 2026-08-17 decision was actually buying.

**My own prose was outside the house style and the probe caught it.** `ui-audit`'s `density`
detector fired on four paragraphs at 1280, all mine. The threshold alone settles nothing — 81 of the
157 existing lessons already exceed it — so the test applied was the existing distribution:
`worked.because` runs **62 to 521** characters across the shipped lessons, median 274, and the first
draft of these seven came in at **618 to 763**, every one longer than every existing lesson and
occupying the top seven slots in the file. Rewritten to **460–508**, arguments intact and
restatements gone; the longest `because` in the file is once again a pre-existing lesson. It was
deliberately **not** chased under 260, where the field stops being reasoning. The plan now records
the distribution and the method, since no content gate measures this field at all.

**Source fidelity.** 68 figures and 41 glossary terms grep-verified against the module transcript
*before* writing, with first-appearance position so nothing is glossed ahead of the course's own
usage. All 41 cleared the vocabulary gate with **zero** invented-vocabulary warnings — the ten
standing warnings all name pre-existing lessons. `self-determination` was refused: the L16 transcript
spells it `selfdetermination`, its only occurrence, the same class as the `hub-andspoke` typo at L07,
and unlike that case there is no later lecture spelling it properly, so the idea is carried in plain
words with a comment recording why. The L07 comment's prediction is **discharged**: clean-spelled
`hub and spoke` occurs exactly once in the module, in L11, and L11's lesson glosses it. A transcript
slip — L11 narrating Aravind's founding problem as a shortage of *cardiac* surgeons — was not
reproduced.

Gates: `check_lesson_file` **0 errors**, bank validator **errors: 0**, syllabus coverage **PASS**
(all four subjects 100%), taught-vocabulary **PASS**, `npm test` **120/120**, build 19 assets.
LAW-47 via the committed browser check, driving the real subject rail from an empty `lessonsRead`
and reloading between subjects so LAW-62 contamination cannot carry: **12 routes × 4 subjects, 0
violations, 0 skipped**. `ui-audit` fetched from the server and evaluated in the page rather than
pasted as a copy, with all seven new lessons expanded: **0** overflow / clipped / circleFit /
overlaps / tapTargets / ragged / cutRows / barInset / sub-floor type at 1280 light and 375 dark, no
sideways scroll, worst contrast in the lesson index **6.77:1**. **Two findings reported and not
fixed, neither mine:** `hiddenScroll` on `div#course-grid` at 375 (355px of 768px, 54% hidden), and
eight of the ten remaining `density` paragraphs are pre-existing lessons. **No screenshot** — the
Browser pane was not compositing, so pixel acceptance is still owed. All seven lessons are new prose
and stay `WAITING_OWNER_CONTENT_ACCEPTANCE`; no second reader.

## 2026-08-15 — The theme toggle, the route it never had, and the door to the product

Evidence: `evidence/2026-08-15/t6-theme-switch/verification.md`.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

Started as a question — "is the light/dark mode not working?" — and found three defects at three
depths, having been wrong about two of them at first.

**`app/theme.js` had no route and had been deployed that way.** It is in the build allowlist and
in `t6.html`'s `<head>`, so it shipped and every signed-in learner requested it; `learnerAssetPath()`
in `cloudflare/src/index.mjs` never mapped a URL to it, so every request fell through to the
router's closing 404. `window.T6Theme` was therefore undefined on the live domain and
`t6.js`'s `if (!button || !window.T6Theme) return;` made the toggle **a button that does nothing**.
It stayed invisible because `light-dark()` needs no JavaScript: the app kept following the
operating system, so it only looked broken to someone who pressed the button. The route now sits
above the session gate beside `login.css`, because the signed-out pages read the same stored
choice and the file carries no learner data. The discriminator that proves it — **401 means a
route exists and is gated, 404 means no URL reaches the file** — is now a test that resolves
every shipped page's local `src`/`href` against the URL that page is served at; with the route
removed it fails and names all three pages. The build allowlist proves a file is *deployed* and
never proved a URL *reaches* it. `LAW-69`.

**A transitioned property does not follow a `light-dark()` re-resolution.** Changing
`color-scheme` re-resolves every token except on a property being transitioned, which keeps the
previous theme's value until something else forces a recalculation — still wrong two seconds
later. **34 of the 35** visible elements with a background transition on the dashboard kept the
old fill across a switch: every button on screen, which is what "the toggle only half works"
looks like. A five-probe control shows `all`, `background` and `background-color` all freeze and
only *no* transition follows, so it is the animated property, not a shorthand quirk. Fixed by
suppressing transitions across the switch (`repaint()` in `theme.js`, one-frame rule in both
stylesheets), released on a frame callback **and** a timer because a non-compositing tab never
gets a frame and would keep the suppression for ever — which happened during verification.
**Two of this session's own measurements were wrong and are recorded as such:** a synchronous
read after `set()` reports the old value because no frame has elapsed, and injecting
`transition: none` to establish ground truth *forces the very recalculation that repairs the
defect*, which is how the first sweep reported "0 of 513 stuck" on a screen with 34. `LAW-68`.

**The login and privacy pages ignored the theme entirely.** `login.css` pinned
`color-scheme: light` and none of `login.html`, `privacy.html` or `admin.html` loaded `theme.js`,
so the **first screen anyone sees** met a dark-phone learner with a full white page, and threw
anyone who had chosen dark back to light on sign-out. The palette is now paired on `t6.css`'s
contract: **16 one-theme literals tokenised, none left**, dark branch lifted from `t6.css` rather
than invented. The literal that mattered was `.brand-mark { color: white }` over an `--ink` fill —
give `--ink` a dark branch and the fill goes pale under a white mark — so a fill and the text on
it are separate tokens by rule. **Every light value is byte-identical**, so the light theme did
not move. 51 text-bearing elements measured per theme with all hidden panels revealed: **0 below
AA**, worst 4.73:1 light and 5.97:1 dark; the two dark failures found on the first pass (1.22:1
and 2.21:1 on the agreement checkboxes) were the transition freeze, and cleared when it was fixed
rather than by adjusting any colour. `ui-audit` clean on all detectors at 375 and 1280 in both
themes.

`npm test` **103 → 104**, palette gate clean, build unchanged at 18 assets.
**Not done: `app/admin.css`**, still pinned to light with 38 one-theme literals — owner-scoped
out, internal tool. No second reader.

## 2026-08-15 — Content accepted, and the four things measuring the promises found

Evidence: `evidence/2026-08-15/t6-persona-rerun/verification.md` and
`evidence/2026-08-15/t6-promise-suite/verification.md`.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, same branch.

**`WAITING_OWNER_CONTENT_ACCEPTANCE` is cleared.** The owner accepted the standing block in
chat: the transcript-derived bank across all 792 surfaces, 64 primers, 64 rubrics and
exemplars, 106 lessons, the 48 CLA-derived items, the 44 examiner-reserved items, the SPMS
caselets and rewritten stems, the BRGSA concept records, and the ~76 restated answers.
Acceptance clears the gate that blocked `DONE`; it is **not** faculty review and creates no
subject-matter authority. The two R3 defects below were repaired *before* acceptance so the
gate did not close over known-broken prose.

**The persona suite was re-run and its learn half had been measured on a stale order.** The
committed queue skeletons predated three bank commits, so every learn-side number in the last
evidence file described a delivered order that no longer existed. Re-exported through the real
app: SPMS, BRGSA and SCLM all moved; IBM did not. A control run (old order, current bank)
isolates the cause — **every movement is the schedule, none is the bank**. BRGSA now delivers
`case_validate`, the integrated slot working in a real queue for the first time.

Four defects, none of which any existing gate could see:

- **A mock miss did not re-teach a lesson the learner had already read.** `lessonNeedsReteach`
  read `conceptAttempts`; `recordExamMisses` writes only `examMisses`, deliberately, because
  misses "prioritise and never score". The two stores are disjoint, so a paper could not reach
  the re-teach latch: `lessonAt: -1`, straight back to the question, under a kicker reading
  "Taught first, then tested again". First contact worked, which is the same shape this latch
  was fixed for once already — the earlier fix closed the Learn half and left this one open.
  `examMissNeedsReteach` now counts a miss stamped after `readAt` (`missed` or `written`, not
  `skipped` alone — running out of time is a timing signal), and applies the RECOVERED rule
  symmetrically so one bad paper does not re-teach for ever. New probe
  `tools/browser-checks/exam-repair.js`, **5 cases + the recovered case, all passing**; cause
  established by control, not by reading the code.
- **A concept that fell from Strong was indistinguishable from one never learned.** Same label,
  same actions, character-for-character identical on the row; the difference existed only behind
  the "Why" disclosure as evidence counts the reader had to interpret. `conceptPeakStatus`
  replays the evidence rule over the attempt history — never a stored high-water mark — and the
  row now says **"was Strong"** under the current state, in words rather than colour. New probe
  `tools/browser-checks/regression-reporting.js`, **5 cases**, including a differential that
  compares a declined learner against a never-strong one rather than hunting for a keyword.
- **`ui-audit`'s type check had never been able to fail.** Its floor was hard-coded at 12 while
  `--t-micro` declared 11, so it listed **111 compliant elements** on one screen, truncated at
  ten, and buried the seven that actually broke the rule. The floor is now read from the token,
  the full count travels with the truncated list, and the seven — SVG axis labels at 10px, the
  only type in the product under the scale — are on the scale. **0 at 375 and 1280.**
- **Two examiner-reserved items answered to their own heading.** `sclm_drivers_cla3` (the answer
  was the only option containing "drivers") and `spms_requirements_cla1` (the only option naming
  all of functional/quality/requirements), both contradicting the R3 rule stated in their own
  header comment. Repaired in `connect`'s direction — name the concept in every option, in place,
  never stripped from the answer. **25 → 23** option sets paying 100%.

Also: `"Practise 1 concepts that need work"` and `"1 need practice"` are now singular-aware.

Gates after the work: `npm test` **103/103**; bank validator **0 errors, 0 warnings**; LAW-47
**12 routes × 4 subjects, 0 violations, 0 skipped** (re-run because the re-teach change adds
lessons to queues that had none); layering **40 sets, 255 pairs, 0 descents**; LAW-63 16/16;
name-matching, absolutes, self-containment, exam-readiness and exam-transfer gates all exit 0;
T1 32/32; T3 every rule at or under limit; T5 no wrong decision without a cue; `ui-audit` clean
at 375 and 1280 but for the deliberate `#course-grid` rail. Paper digests unchanged.

Not merged, not deployed.

## 2026-08-15 — An optical layer, and the shadows that had never once rendered

Evidence: `evidence/2026-08-15/t6-dashboard-rhythm/verification.md` and
`evidence/2026-08-15/t6-optical-layer/verification.md`.
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME)`, same branch, not merged.

Five defects, all on screens `ui-audit.js` had just reported clean, and all of the same
kind: **the boxes were right and the ink was wrong.** That is now its own probe.

- **`tools/browser-checks/optical-audit.js`** — measures glyph runs through
  `Range.getClientRects()` instead of boxes, clusters them into the gridlines the page's
  ink actually forms, and reports what sits *near* a line without sitting *on* it.
  Six checks: `gridlines`, `nearMiss`, `insetDrift`, `flatSurface`, `deadShadow`,
  `baselineDrift`. `optical.overlay()` draws the grid on the page and
  `node tools/screenshot.mjs --optical` writes a `_grid` shot of every scene through it.
  New section F in `UI-CHECKLIST.md`.
- **Every shadow in the app was dead, and had always been.** All four shadow tokens wrapped
  a whole `box-shadow` in `light-dark()`, which is a *colour* function — so the declaration
  never parsed and sixteen rules computed to `none`. Three elements on the dashboard painted
  a shadow before this; **43** after. Nobody reported it, and no probe reading elements
  could: an invalid value leaves nothing behind to distinguish "lost" from "never asked
  for". **LAW-71.**
- **The resume bar had no depth** — reported by the owner. `--deep` on a `--deep` hero at
  **1.00:1**, a `--deep-edge` border whose light value *was* `--deep`, and the dead shadow
  above: three separations, all three absent at once. Now on a `--deep-raised` surface with
  a real edge. `check-palette.mjs`'s below-target list drops 17 → 16.
- **`Learn` did not line up with `Your next step`** — also reported by the owner. Both boxes
  on the column, 21px of ink apart. `insetDrift` found the page carrying **eight different
  panel text insets** with the coin holding its own private 20px; the ≤768px block had said
  14 all along. The coin's title now shares a gridline with the four subject cards beneath
  it. The remaining drift (14/15/18/19/23) is reported and left for the owner.
- **A day marker drawn as a `border-left`** gave two of four subject cards a 160px content
  box against 162px — outer widths identical, so nothing fired. Now an inset shadow.
  **LAW-70.**
- **A section label 42.5px below its heading and 29.5px above its content**, because the
  next box was a 44px control band with an 11px label centred in it. The margin was correct;
  the gap the reader saw was not.
- **`ui-audit.js` was reporting a control that cannot be painted** — a 6px overflow on the
  header switch while it is collapsed to `max-width: 0` inside `overflow: hidden`. Now
  suppressed by intersecting with clipping ancestors, verified against three fixtures
  including two that must still fire.
- **The new probe was wrong twice before it was right**, both recorded: `nearMiss` ranked by
  nearest line and buried the 21px defect it was written for under a 4px one, and
  `deadShadow` reported zero on a page where all sixteen were dead — because a
  `CSSStyleRule` now carries an *empty* `cssRules` list, and an empty list is truthy.

## 2026-08-15 — A reserved slice on every paper, and the exploit the defence created

Evidence: `evidence/2026-08-15/t6-rehaul-completion/verification.md` §8–§13.
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, same branch, not merged. Closes
the four items the entry below left open.

- **44 reserved items across all four subjects.** Every concept on every paper now has an
  examiner surface a learner cannot have met while studying — **16/16 × 4**, from 0/16 on
  three of them — and overlap fell from 100% to 60–80%. Additive throughout: nothing Learn
  could reach before was withdrawn, asserted by re-checking each concept's surface floor
  with the slice removed.
- **SPMS Section B had zero slack** — 20 drawn from a pool of 20, so three "different"
  seeded sets were identical across 40 of that paper's 75 marks, on the term's only
  negatively marked section. Pool now 28.
- **"Pick the second-longest" was the real shape exploit, on all four subjects.** The brief
  recorded it as an IBM rank-3 warning; measured, SPMS 38.5%, IBM 35.9%, BRGSA and SCLM
  32.9%. It exists *because* the defence against "pick the longest" created it —
  `comparableWrong` selects distractors closest in length to the answer, which beat
  `longest` and left the answer one rank below the top. A structural fix was tested and
  rejected: three selection variants gave byte-identical numbers, because the mcq families
  have exactly three authored distractors. 23 distractors made more specific instead →
  26.9 / 22.4 / 27.0 / 28.2, `longest` unmoved, **the standing length warning cleared**.
- **`fixedB` is now reported and not gated**, with the reason recorded: slots are dealt
  flat by construction and the validator confirms 0.25 × 4, so gating a 50-of-100 draw
  measures sampling noise rather than the bank.
- **A reserved item's shape bias is never diluted**, because it appears on every paper. Two
  new BRGSA mcqs moved `combinedWithLength` from 24% to 33.6% while the pool sat at 26%.
  A new test caught nine such items, seven of them written in this session.
- **LAW-53 returned during authoring** — four of eight new multi-selects were 3-of-4 and one
  4-of-4, so ticking everything scored full marks. Caught by hand, now a test.
- **LAW-67 recurred inside the tool written to catch it**: `--gate` was taken as the harness
  directory, so T3 reported a pass over an empty report.
- **14 of 20 SPMS multiple-select stems** asked what "the lecture" said rather than what is
  true (the brief records fifteen). All rewritten. `spms_roadmap_msq` no longer carries a
  WhatsApp release date as a *correct* option among framework claims.
- **BRGSA self-containment audited for the first time**: 0 items require a brand figure the
  page does not carry, 0 name a case they do not show. Three probe narrowings were needed
  first — the first draft would have reported 25 non-defects.

## 2026-08-15 — The five open items, and the four gates that judge them

Evidence: `evidence/2026-08-15/t6-rehaul-completion/verification.md`.
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, branch `feat/bank-rehaul-completion`,
not merged. Picks up exactly what the entry below listed as not done.

- **`check_exam_readiness` exits 0 for the first time.** SCLM Section B is **8 of 6**
  numericals; the 8 marks it could not award are awardable. `SCLM-M03-L06` (Q model) authored
  from the transcript with every glossary term grepped first and the lecture's own worked
  example verified figure by figure.
- **The second blocker had never been named.** `T6_EXAM_PATTERN.md` says the real SCLM paper
  supplies standard normal tables; Dungeon supplied none. That is why *both* missing items were
  z-based — without a table no z-based question is answerable, so none could be authored. Added
  as a paper provision, computed via A&S 26.2.17 rather than stored as 310 literals, pinned by
  `tests/normal-table.test.mjs`. Mounted twice: the examiner's paper hands it over, and a Learn
  numeric declaring `reference: "standard-normal"` carries it inline.
- **Four SCLM numericals**, each naming the `σ_d·L` instead of `σ_d√L` error as a near miss
  with the figure it produces.
- **The BRGSA integrated-scenario diagnosis is corrected.** They were not "never served":
  `brgsa_case_false_win` reaches set 2, `ibm_case_hospital_growth` reaches IBM set 2. Three of
  four never reach an offered set. The cause is composition — Section C is two **ten-mark**
  slots drawing 2 from 36 written items of which 32 run three to five minutes. On the Learn
  side they were unreachable by construction, because the rotation's fallback only fires for a
  concept carrying neither a short nor a case prompt, and none exists. Fixed with a section
  `prefer` order and an `integrated` slot whose concept-uniqueness rule is relaxed.
- **`addIntegratedScenarios` no longer drops silently.** It throws, naming the unresolvable id.
- **An examiner-only slice for BRGSA.** Six new reserved scenarios, hard-excluded from every
  study pool and from written practice, and **additive** — nothing shared was withdrawn, which
  is what makes the hard reservation defensible. Section C overlap **100% → 0%**. Four reserved
  items put sets 1 and 2 on an identical pair, so six were authored.
- **T1** (`measure-cold-learner.mjs`) — every course term in a correct answer must be
  introduced earlier in the same run. Found `smoke_signal` resting on "prospects", defined in a
  lecture the item does not cite: **LAW-47 gates on cited lectures and structurally cannot see
  this.** 32/32 after the fix.
- **T2** — `measure-learn-exam-coverage.js` now asserts the ladder instead of only measuring
  it, and **refuses to score** the handoff half without the app's own `handoffs()` answer.
  0 broken over 64 promises; reading `lesson.connects` would have reported 14 false ones.
- **T4** (`measure-exam-transfer.mjs`) — overlap plus same-concept-different-surface. Could not
  use "all ten sets": set 10's pool is the entire bank, so the first version reported 100%
  whatever anybody authored. Split into ladder and anyRoute.
- **T5** (`measure-persona-regression.mjs`) — what a learner is told when wrong. Failed
  correctly: one sentence answered 55–100% of every wrong decision. `fallbackDiagnosis` was
  discarding `targetRole`; four cues drawn from what the slot asks took top-cue share to
  **27–36%**.
- **Three defects came from building the probes, two of them mine.** An MCQ diagnosis read from
  `perOption.answer` when the export writes `perOption.whole`; and a T5 gate whose floors
  skipped every run and printed a pass over data it never judged.
- **`ui-audit.js` caught the new table three times and was right twice.** `hiddenScroll` at 44%
  on a phone was real: the eleven-column table is now two six-column halves that stack — 310
  cells, no sideways scroll at any width. The one refinement (`cutRows` ignoring a child taller
  than its container) was verified against a live fixture of the original palette defect.
- `npm test` **87 → 100**. The runner gave up a finding of its own: two files listed in
  `package.json` before they existed were silently skipped at exit 0.

## 2026-08-15 — Both craft exploits closed, and the bag leaves the Examiner

Evidence: `evidence/2026-08-15/t6-bank-overhaul/verification.md`.
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, branch only. Supersedes the two
entries below, which recorded the audit and the first half of the fix.

- **Personas, both surfaces, all four subjects.** Paper: SPMS combined 34.5 → **16.3**,
  BRGSA 37.8 → **15.3**, SCLM 24.5 → **20.1**. Delivered study run: SPMS 50 → **19.2**,
  BRGSA 37.8 → **28.2**, SCLM 48.2 → **22.0**, **IBM 67.3 → 23.1**. Every rule at or under
  chance; both gates exit 0.
- **F-06 closed.** `apply` 45.8 → **20.0**, `explain` 43.1 → **16.5**, `boss` 33.1 →
  **23.6**, `authored` 31.4 → **23.7**, `case_cloze` 31.5 → **22.2**. Two honest levers:
  23 filler removals (`simply`, and `\ball\b`/`\bany\b` matching "at all" / "in any way",
  which are not quantifiers — only **9.6%** of absolute-carrying distractors, the other
  90.4% being load-bearing and left alone), and **76 correct answers restated at the
  course's real strength**, every added universal taken from that concept's own accepted
  `bridge`. No absolute was manufactured and no distractor was watered down.
- **Name-matching closed**: 324 → **23** option sets paying 100%; `term_cloze` retired to
  `contrast` on an owner decision, since a label-selection item is 100% name-matchable by
  construction and the bank floor forbids deleting a surface per concept.
- **Five defects came from verification rather than from the gates.** An "It" substitution
  firing on 11 of 64 summaries traded the name cue for a **length** cue; labelling
  `case_cloze`'s decision blank printed eight options on one 36-character prefix and
  misattributed a decision to a framework name (fixed as a *trailing* tag);
  **appending** universals pushed IBM's "pick the longest" to **66%**, so all 76 rewrites
  were redone in place and IBM's rank-3 share went 0.50 → **0.38**, flatter than baseline;
  two option-shape errors on `sclm_smoothing`; and unlabelling `explain` on a plausible
  hypothesis sent it to **61.9%**, so the label stays.
- **The bag is gone from the Examiner** (owner). It is a Learn tool and the paper carries
  its own Calculator and countdown. This ends a defect class rather than relocating it:
  the bag was docked into the paper's corner because it covered Submit, and docking then
  covered all but 18px of the theme toggle.
- **The two header bars align.** `.app-header` used `clamp(16px,3vw,40px)` and `.exam-bar`
  `clamp(12px,2.5vw,22px)`, so the logo started at x=38.4 and "Section A" beneath it at
  x=22. The 76px/82px `padding-inline-end` reservations existed only for the docked
  launcher and were reserving empty space against nothing.
- **The question palette no longer cuts a row in half.** `max-height: 46vh` is an
  arbitrary slice of the window; on SCLM's 50-question section at 1280×900 it resolved to
  414px and cut row nine through the chips. A row is 44px + 7px gap, so it is now
  `calc(round(down, 46vh + 7px, 51px) - 7px)` = 401px, a whole eight rows. 0 chips cut at
  375 and 1280. The mobile rule carried the same defect independently (`100px` cuts 5px
  into a third row) and is now `calc(2 * 51px - 7px)` = 95px.
- **The mobile paper is no longer top-heavy and its sections are no longer cut off.** At
  375 a 66px header above a 75px bar was **141px of chrome** before a word of the question,
  and `.exam-sections` had a **108px viewport over 266px of content** — Sections B and C
  were gone entirely, question counts included. The header now hides during a running paper
  as it already did mid-question on the practice screen, and the freed row pays for the
  section tabs going full width: **343/343, all three visible**.
- **Every state chip is a regular shape now.** The tab silhouettes used a flat
  `var(--r-panel)` of 10px, and the same chip class renders at 44px (palette), 26px
  (desktop legend) and **22px (mobile legend)** — 23% of one and **45%** of another, where
  the top corners met in a near-semicircle above a square bottom. Restating it as a
  percentage fixed the scaling and **not the look**: an asymmetrically rounded box reads as
  a distorted square at any size. The distinction moved off the outline onto two regular
  orthogonal signals — **square vs circle** for marked-for-review, **underline vs none** for
  answered — so the five states stay readable without colour. `check-palette.mjs`'s
  shape assertion covers the four `.dot` mastery states, not these chips.
- **The clock went back to the trailing edge** — a regression from the row-wrap above:
  flex packs to the start, so moving the section tabs to their own row sent the timer from
  the right edge to the left.
- **Three new `ui-audit.js` detectors and `docs/governance/UI-CHECKLIST.md`.** All three of
  the owner's UI reports were found by eye on a screen the probe had just called clean.
  `hiddenScroll` (a scroller showing <60% of its content), `cutRows` (a container drawing a
  child in half) and `barInset` (stacked bars with different content insets) each were
  reintroduced as a live fixture, confirmed to fire, and confirmed to go quiet on restore.
  `cutRows` staying correctly quiet when spare pixels fall in a *gap* is what caught a
  factual error in this file's own previous entry: the mobile `100px` was **not** cutting a
  chip, and that claim is corrected.
- **Bank validator is now 0 errors AND 0 warnings** — the pre-existing IBM length warning
  cleared. 83/83, palette clean, build clean, **screenshots 16/16 and read**, LAW-47 clean,
  0 layering descents, `answerableFromTheConceptName: []`, `paperDigestMatch: true`.
- **Still not done:** no new items, no examiner-only slice, no SCLM-M03-L06 lesson, T1/T2/
  T4/T5 not built.

## 2026-08-15 — The bank stops answering to its own heading

Evidence: `evidence/2026-08-15/t6-bank-overhaul/verification.md`.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only. Supersedes the entry below, which
recorded the audit before the fix was built.

- **324 → 28** option sets where name-matching pays 100%. Per family: `term_cloze`
  100.0 → retired; `repair_cloze` 81.9 → **25.0**; `case_cloze` 70.8 → **25.0**;
  `explain` 66.0 → **25.0**; `bridge_cloze` 48.5 → **25.0**; `boss` 41.3 → **31.2**;
  `apply` 36.2 → **25.0**; `connect` 0.5 → **0.5** (untouched, it was already right).
- **Learn-side, through the real app:** SPMS 53.8 → **25.0**, BRGSA 44.9 → **26.9**,
  SCLM 46.4 → **26.8**, IBM 59.6 → **32.7**. IBM is still over the 32 limit and its
  residue is absolutes (37.8), not name-matching — F-06, which needs the concept-string
  rewrite. `npm run review` exits non-zero on it rather than hiding it.
- **`term_cloze` retired to `contrast` (owner decision).** A label-selection item is
  100% name-matchable *by construction* — exactly one option can be the concept's name.
  Deleting it was not available: the bank floor is 792 items and every concept needs ≥10
  surfaces and ≥8 families, so a retirement that drops one surface per concept fails four
  gates. `contrast` keeps the job and makes it answerable only by reading — all four
  options are claims about this concept, three of them neighbours' claims wearing its
  label. 96.9% → 25.0%.
- **The fix is `connect`'s direction, and the opposite one was measured and rejected.**
  Stripping each concept's name from its own prose hits the same numbers and produces
  "Lean this idea asks whether real people will take a real action" and "a payment or
  signed it is a different category", and takes `connect` from 0.5% to 26.6%. No authored
  word was changed by what shipped: the label is added, the prose is untouched, and
  over-claims keep their "alone" and "only".
- **Three defects caught by verification rather than by the gates.** (1) A first draft
  pronounced a self-reference as "It", which fires on 11 of 64 summaries — all correct
  answers — shortening only the correct option and trading a name cue for a LENGTH cue;
  SPMS earned a new validator warning the moment it was added, and `lengthRankShares` are
  now byte-identical to baseline. (2) Labelling `case_cloze`'s decision blank printed
  eight options each opening on the same 36-character prefix, and misattributed a
  *decision* to a framework name; fixed as a trailing tag, since the rule matches a
  substring anywhere so position is free. (3) Taking module siblings unconditionally made
  `sclm_smoothing`'s summary tower over theirs and failed the shape guard twice; fixed by
  routing selection through `relevantWrong()` (LAW-48's existing contract).
- **`primer-prediction.js` now reports `answerableFromTheConceptName: []`** — it was the
  standing report of this defect. LAW-47 clean over the real app, 0 layering descents
  across 40 sets and 257 pairs, `paperDigestMatch: true`, and 0 overflow / clipped /
  circleFit / overlaps / ragged at 375 and 1280 with new options on screen.
- **The failsafes fired as designed:** `export-learn-run.mjs` refused the stale SCLM
  skeleton and named the ids (`SCLM carries no question sclm_fit_term_cloze`) instead of
  emitting `unknown`, and `export-run.js` refused a second run in one page load (LAW-62).
- **New: `npm run review`** — one command for every gate plus a readable page of the
  actual option text per family, because a green gate says nothing about whether the
  sentences still read well. Defect (2) is exactly what it exists to catch.
- **Still not done:** the 64 `summary`/`application` strings are not rewritten, so F-06
  is untouched (18.6% / 39.3%); no new items; no examiner-only slice; no SCLM-M03-L06
  lesson; T1/T2/T4/T5/T6 not built; screenshots still owed.

## 2026-08-15 — A third of the bank answers to its own heading, and R3 finally has a gate

Evidence: `evidence/2026-08-15/t6-bank-overhaul/verification.md`.
`VERIFIED(AUTOMATED)`, branch only. No bank content edited; nothing learner-visible changed.

- **R3's on-topic-ness row has said "Gate: none yet" since it was written.**
  `tools/measure-name-matching.js` closes it: every option set in the built bank — **1049** of
  them — scored per family with `measure-learn-craft.mjs`'s exact rule, so the numbers are
  comparable. `--gate` exits non-zero above 32% per family, 10% for `connect`.
- **324 option sets — a third of the bank — pay 100%**, meaning the correct answer is the only
  option naming the concept. Per family: `term_cloze` **100.0**, `repair_cloze` 81.9,
  `case_cloze` 70.8, `explain` 66.0, `bridge_cloze` 48.5, **`boss` 41.3**, `apply` 36.2,
  `connect` **0.5**.
- **`boss` is new information and is the largest family in the bank** — 480 option sets, 41.3%.
  It was invisible to every earlier measurement: the craft tool samples about twelve boss steps
  in a single run, and the previous per-family cut folded boss into "other".
- **The prescribed diagnosis did not survive measurement.** The standing brief attributes
  name-matching to distractors borrowed from other concepts and prescribes `relevantWrong()`
  everywhere. But `explain` and `apply` already use authored **same-concept** distractors and
  still leak 66.0% and 36.2%. The rule is `argmax`: **195 of 384** of their distractors name the
  concept and are eliminated anyway for naming it less densely than the correct answer. The
  cross-concept borrowing is real but confined to `repair_cloze` and `bridge_cloze`.
- **`connect` at 0.5% is the worked example, and it was measured, not assumed.** It names the
  concept in every option. The mirror fix — stripping each concept's name from its own prose —
  was simulated before anything was edited: it drives every family to 21.8–27.1% and produces
  "Lean this idea asks whether real people will take a real action", "a payment or signed it is
  a different category" and "starts from the this idea position". **Rejected on readability**,
  which is the mirror of watering down a distractor, and because it takes `connect` from 0.5%
  to 26.6%. Recorded in CONTENT-RULES so it is not re-derived.
- **A label-selection item is 100% name-matchable by construction.** `term_cloze` and
  `case_cloze`'s framework blank ask for the concept's own name among four concept names, so no
  distractor choice can help. Retiring or rewriting them changes scheduled coverage and is an
  owner call. Suppressing the name on the step would move the metric without changing what the
  learner already read three steps earlier, and was not done.
- **`tests/name-matching-gate.test.mjs`** asserts the gate itself, because both of this
  session's own probe errors were load-order faults: the gate must load every bank file
  `app/t6.html` loads, must load `t6_brgsa.js` before `t6_catalog.js`, must reach all four
  subjects, must hold `connect` at ≤10%, and `--gate`'s exit code must agree with its report
  in both directions. 78/78 → **83/83**.
- **Two probe defects caught before they became findings** (§7 earning its keep twice): reading
  `.coverage` instead of `.lessons.coverage` made a healthy validator look like the
  empty-coverage failure; and loading the catalog without `t6_brgsa.js` yielded 48 concepts
  instead of 64, which made BRGSA score 100% on `explain` while reporting "0 of 96 distractors
  missing the name" — the contradiction resolved when it turned out **BRGSA carries no
  `confusions` and no `applicationWrong` fields at all**.
- **Deliberately not done:** no rehaul, no new items, no examiner-only slice, no rewrite of the
  64 summary/application strings, no SCLM-M03-L06 lesson. A half-applied distractor rule leaves
  the measurement describing neither bank, so nothing was half-applied.

## 2026-08-15 — Screenshots, at last, and the two defects they found in the first sweep

Evidence: `evidence/2026-08-15/t6-harness-and-bank/verification.md`, closing section.
`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)`, branch only. **LAW-64** recurrence ×2.

- **Pixel acceptance has been owed since 2026-08-12** because an undisplayed Browser pane
  composites no frames: its `screenshot` times out, `document.timeline.currentTime` stays pinned at
  0, and every CSS transition reads as its start value. The fix goes round the pane rather than
  through it. Headless Chrome has no pane to display — but `chrome --screenshot` photographs a page
  as it loads and cannot click, so on its own it only ever captures a landing screen.
- **`tools/shots/frame.html` is the way round that.** It is same-origin with the app, so it opens
  `/app/t6.html` in a fixed-width iframe and drives the real UI exactly as the browser checks do in
  the pane — the LAW-64 iframe technique used for pictures instead of numbers — then holds still.
  Chrome photographs the frame. No CDP, no WebSocket, no dependency, no extension.
- **Everything waits.** The first version drove on the iframe's `load` event and failed 14 of 16
  scenes with "no subject card reads 'SPMS'": the dashboard renders after the app's own boot, and
  crossing to the examiner runs through `document.startViewTransition`. Every step now waits for
  the thing it is about to press.
- **And everything settles.** The first version finished animations once and waited 120ms, and the
  mobile dashboard still came back with the resume bar's "Start this study set / Go →" ghosted
  under the real button — the bar renders and hides itself when it finds no run to resume, and the
  shutter landed inside that. Finishing one animation can start another, so it now finishes
  repeatedly until two consecutive checks find nothing running.
- **`tools/screenshot.mjs`** takes 16 shots over 5 screens × 2 viewports × both themes. It reads
  each frame's `<title>` back to fail a shot whose scene did not complete — its own first version
  searched the DOM for the failure banner's text and condemned four good screenshots, because that
  text also appears in the frame's source comment explaining the banner.
- **`REDLINE` LAW-64 (a) — the Bag launcher sat on top of the theme toggle during a paper.** The
  launcher docks top-right on both the practice screen and a running paper, but the
  `padding-inline-end` that reserves its space was written for `.app-header` on practice and for
  `.exam-bar` on the paper — and the theme toggle is in `.app-header`. Measured at 1280: the bag
  covered all but 18px of a 44px control. This is F-01 one bar higher up. `ui-audit`'s `overlaps`
  compares text-bearing siblings; these are two icon-only buttons in different stacking contexts.
- **`REDLINE` LAW-64 (b) — the subject cards laid out differently depending on the bank.**
  `.course-head` wraps, and in a 186px card the content needs 166px against 164px available — so
  the date wrapped onto its own line and right-aligned, but **only on the subject carrying the
  `-1` negative-marking chip**. Four cards in one rail, one different, because of a two-pixel
  overflow. The date now gets its own row on every card, so they are identical whatever the bank
  says about the paper. `ragged` did not fire because the cards do share a height.
- **The general lesson, recorded in the Law:** a DOM audit compares things it knows are siblings.
  It cannot see two independently-positioned layers colliding, and it cannot see a layout that is
  self-consistent but different from the card beside it. Both are obvious in a picture. Screenshots
  do not replace `ui-audit.js` — they fail differently, which is the whole point.
- **Two briefs written for the next sessions:** `docs/briefs/PROMPT-BANK-OVERHAUL.md` (the full
  bank re-check / rehaul / recreate plus an examiner-only slice, with six acceptance tests to
  build) and `docs/briefs/PROMPT-EXPERIENCE-AND-TELEMETRY.md` (the student-experience check and a
  decision-first dashboard, organised so every panel exists because a decision waits on it). The
  second records the owner's authorisation to update the privacy policy, and the cost that comes
  with it: bumping the agreement version sends every active tester back through the acceptance gate,
  and the papers are sat 22–23 August.
- Gates re-run after the CSS changes: 78/78, palette clean, 18 assets, 16/16 shots.

## 2026-08-15 — A learn run you can read, and the CLAs measured before they were used

Evidence: `evidence/2026-08-15/t6-harness-and-bank/verification.md`.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only. New content is
`WAITING_OWNER_CONTENT_ACCEPTANCE`. `REDLINE` **LAW-65**; **LAW-64** recurrence.

- **The learn half of the persona harness works.** It had refused to run rather than emit wrong
  data, which was right; the cause was three faults stacked. It wrote `{selectedCourse}` into
  storage *after load*, and the app reads its profile from storage exactly once, at load. It called
  `window.__dungeonSelectSubject`, which does not exist. So it clicked whichever set list was on
  screen and looked those ids up in a different subject's bank, where every one of them resolved to
  `unknown`. It now drives the real subject rail — find the card by its `.course-code`, click it,
  **assert the app moved**, then open the set and assert the run that started is the one asked for.
- **The order comes from the app; the prose comes from the bank.** `export-run.js` returns a ~1 KB
  skeleton — one line per step — and `tools/export-learn-run.mjs` hydrates it into a 21–24 KB
  candidate run plus its key. Nothing about scheduling is re-implemented in Node, which is the line
  `teach-before-test.js` draws and the reason the paper mirror needs a digest check and this does
  not. An id the subject's bank does not carry is a fatal error naming the id, never an `unknown`
  row. The paper guard now compares digests **in the page**, fetching the Node-written file over the
  dev server rather than handing a hash back to be eyeballed: **4 / 4 MATCH.**
- **`REDLINE` LAW-65 — the per-option feedback was on the candidate side, under a comment saying it
  was not.** A diagnosis array has a hole at the correct option — 216 of 216 single-answer MCQs have
  `diagnoses[answer] === null` — so printing it beside the options is an answer key. Moved to the
  key file, where it belongs anyway: what a learner is told **after** committing is how "am I
  learning?" is decided. Blindness is now asserted by a walk over the candidate object, not by prose.
- **Two probe defects caught before they became findings.** The lesson glossary field is `plain`;
  the first hydrator guessed and wrote `null` under every term in four subjects. And the LAW-63
  assertion fired on all eight primers and was wrong every time — it searched the whole run for the
  primer's rule, which is the concept summary and therefore legitimately the correct option of the
  `_explain` and `_repair_cloze` items later in that run. Scoped to the primer's own surface: 0 hits.
- **The handoff is read from the app, not from the lesson record.** `lessonHandoff()` is separated
  from its markup and exposed through `window.__dungeonExport.handoffs()`. The first export printed
  `connects` verbatim and reported a broken promise the product had already qualified on screen.
- **48 new single-answer items from the CLAs — SCLM 32, BRGSA 16.** In `t6_challenges.js` beside the
  SPMS multiple-selects and the SCLM numericals, deliberately **not** in a new file: `t6_integrated.js`
  was added as one and was missing from four load lists at once (F-47). Ids end `_cla<n>`. Two per
  SCLM concept rotating definition / scenario / numeric / judgement; one per BRGSA concept,
  scenario-led in the CLAs' own shape. Nothing is one of their questions.
- **The premise did not survive measurement, and is corrected.** F-06 was to be closed by "stating
  correct answers with the absolutes the course itself uses". The course's own papers put an
  absolute in the correct answer **3.0% (SCLM) and 7.5% (BRGSA)** of the time — *less often than the
  12% bank being fixed*. Copying their phrasing would have widened the gap. The rule applied instead
  is narrow: state a claim universally where the lecture's own claim is universal, and nowhere else.
- **The same measurement found something larger.** "Pick the longest option" pays **53.7%** on the
  real SCLM paper and **86.7%** on the real BRGSA paper against 25% chance, where Dungeon's own
  papers pay 11–32% because `checkOptionShape` and the bank-wide length guard exist. "Always press
  B" pays 31–36% there against Dungeon's dealt-flat slots. **The most gameable property of this
  course's assessment is one the product already fixed.**
- **F-08 — the examiner has a reserved slice for the first time.** SCLM Section A draws 50 from a
  pool that went **52 → 84**: from two spare questions to thirty-four. BRGSA 60 → 76.
- **F-06 — closed on SCLM, not on BRGSA, and the reason is stated.** Mean of sets 1–3:
  "eliminate the absolutes" on SCLM **36.0 → 29.5**, beating its own course paper's 32.6, with all
  rules combined at **24.5** — the craft now misleads. BRGSA sits at 36.6 because Section A draws 20
  from 76, so about four are new and the rest are legacy items whose correct answers carry an
  absolute 0 of 20 times on the drawn paper. SPMS is untouched at 41.2 — no items were added there.
- **`run-persona-strategies.mjs` now measures sets 1–3 and reports the mean.** One seed cannot tell a
  bank change from a draw: the sixteen BRGSA items moved set 1 from 36.2 to 46.3 *while the
  bank-wide bias fell*, purely because the reshuffled draw picked up four items where all three
  distractors carry an absolute.
- **Length was a defect introduced and then measured out.** First draft put the correct answer
  longest in 18 of 32 SCLM items — under `checkOptionShape`'s threshold, and enough to move the
  paper's "pick the longest" score from 11.0 to 31.5. Fixed by making distractors more specific
  rather than by trimming answers: rank shares now `0.24 / 0.26 / 0.36 / 0.14`.
- **`tools/measure-learn-craft.mjs` is new, and reports the exploit the mock cannot see.** Inside a
  study set the dominant strategy is not absolutes but **name-matching the concept: 45–60%** against
  25% chance, reaching 67.3% on IBM with both rules together. A mock spans sixteen concepts; a set
  is one or two deep, so a learner who has read only the set's title can eliminate on vocabulary.
- **`REDLINE` LAW-64 recurrence — the exam legend overlapped itself at every desktop width.**
  `.exam-legend li` is `grid-template-columns: 26px 1fr` and `.exam-chip` carries `min-width: 44px`
  for the tap floor, so the chip overflowed its 26px cell and painted 9×17px across its own label on
  all five rows. Invisible at 375 (the narrow block sizes it to 22px) and never audited, because the
  2026-08-14 sweep covered the dashboard, examiner *home* and lesson — not a paper mid-question.
- **F-25 corrected.** Correct-answer feedback restating the chosen option is **9 of 32** scored items
  across the four runs, not "every time": it is the `_repair_cloze` family plus two `_explain` items.
  The wrong-answer panel remains the best content in the product and is thinner than it reads — 161
  diagnoses in those runs draw on **55 distinct cues**, the top one covering 33 of them.
- Gates: 78/78, bank `ok: true` with 0 errors against the transcripts, palette clean, 18 assets
  built, LAW-47 clean over 12 routes in each of SPMS, SCLM and BRGSA, 0 layering descents, reteach
  3/3, and 0 overflow / clipped / circleFit / overlaps / sub-44px on the exam and learn surfaces at
  375 and 1280 with a new item on screen. Pixel acceptance still owed: `resize_window` works but the
  pane is not displayed, so `screenshot` times out.

## 2026-08-14 — Text that did not fit its box, and the probe that could not see it

Evidence: `evidence/2026-08-14/t6-practice-presets/verification.md`, third section.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only. Tester-visible. `REDLINE` **LAW-64**.

- Owner screenshot: the results ring printing "16 scored questions" across its own stroke, with the
  standing instruction that overlapping and mis-sized text cannot happen and readability on desktop
  and mobile is paramount. `ui-audit.js` had reported that screen clean twice in the same session.
- **The probe was extended before anything was fixed.** It measured the viewport edge, tap size,
  corner radii, paragraph length, font floor and row raggedness — and nothing about whether content
  fits its container. Three detectors added: `clipped` (text runs painted outside the box laying them
  out), `circleFit` (text in a round container against the **chord** at the height it sits), and
  `overlaps` (two text-bearing siblings intersecting).
- `clipped` measures **glyph runs** via `Range.getClientRects()`, not `scrollWidth` — `scrollWidth`
  on an inline box describes its containing block, so the first version reported every bold word in
  a wrapped sentence as overflowing and buried two real defects in forty false ones. `circleFit` uses
  cap height either side of the run's centre, not the line box, or every icon badge in the app reads
  as a zero-width circle. Visually-hidden labels are excluded by shape, not class name.
- **Fixed 1 — the ring.** The caption moved out of the circle into a `.score-block` stack beneath it.
  At 122px inner width it fitted the box; the circle is 110px wide at the height it sat and the text
  needed 118px. A circle has no width a runtime-length string can be guaranteed to fit.
- **Fixed 2 — the mastery key, and the worst of the three.** Each entry is
  `<i><b>Label</b> — description</i>`, three children in a row styled
  `grid-template-columns: auto minmax(0,1fr)`. A grid assigns columns per child, so at 375px the
  columns resolved to 274px and 28.7px: "Needs practice" wrapped inside 28.7px and ran **19px past
  the panel edge** with its description on the row below. Now a hanging indent.
- **Fixed 3 — three tap targets under the floor**, visible once the noise cleared: answer-review
  disclosures at 23px (twelve to a review), `horizon-choice` at 43px (`min-height: 42px` plus a 1px
  border), and the Tele-MANAS crisis link at 35×16, now 44px through padding with an equal negative
  margin so its sentence does not move.
- Swept at **320, 375 and 1280** across every screen — dashboard, all six practice surfaces, primer,
  feedback, results, simulation results, written repair, the builder with its dials expanded, exam
  home, a running paper and its results — in fixed-width same-origin iframes. **0 findings.**
  78/78, palette, build and bank clean; LAW-01 and LAW-63 re-run `ok: true`. Screenshots still owed.

## 2026-08-14 — Three levels replace four dials in the practice builder

Evidence: `evidence/2026-08-14/t6-practice-presets/verification.md`.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only. Tester-visible.

- "Build your own practice" now opens on three cards named for the stretch of marks each is built
  for — `0 → 60` cover everything once, `60 → 80` test each idea properly, `80 → 100` only the
  hardest surfaces. The four dials that used to be the front door are unchanged, still connected,
  and folded into a "Change the details" disclosure.
- **A preset is exactly a set of the dials, and the lit card is read back from them.** A stored
  preset id would be a second source of truth that drifts the moment a chip is pressed, so pressing
  a chip after a card lands on "Custom mix" rather than leaving a card describing a run the queue
  will not deliver (LAW-01).
- Two new dials, both things the presets were going to turn anyway. **How hard** exposes the
  `difficulty` every scheduled question has carried since the bank was built and which nothing on the
  learn side could ever ask for — Plainest (d2–3), Applied (d3–4), Hardest (d4–5), Any, overlapping
  on purpose. **How long → Every concept** is a coverage rule rather than a size, so its target is
  the subject's concept count.
- `0 → 60` selects its own questions. `selectQuestionsFromPool` ranks format spread above concept
  spread, so asking it for sixteen from a sixteen-concept subject returns *about* one each — fine for
  a mixed run, not a promise. `sweepSelection` takes each concept's plainest surface and hands it to
  `orderForDelivery`, the ordering rule factored out of `selectQuestionsFromPool` so both routes
  sequence a run identically and LAW-47 holds by construction. `80 → 100` names three module bosses
  as anchors, since the selector admits bosses only as anchors and the card counts them.
- The time claim is now made against the **queue** rather than the question count: a first `0 → 60`
  is 16 questions and 32 lessons and primers, and counting only questions understated it by every
  lesson in the subject. The 1.25 min/item constant is untouched and still uncalibrated.
- New standing check `tools/browser-checks/practice-presets.js` reads each card's printed sentence
  and asserts it against `profile.active.queue` — count, concept coverage, boss count, format count,
  band compliance, run header. `ok: true`. `teach-before-test.js` now loops all three presets:
  0/0/0 violations across 40, 41 and 27 items. 78/78, palette clean, build clean, 0 overflow and 0
  sub-44px targets at 1280×800 and 375×812. No screenshots — the pane was not compositing.
## 2026-08-14 — The primer asks for a prediction instead of printing its own answer

Same evidence file, second half. `VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only. Tester-visible.
New prose stays `WAITING_OWNER_CONTENT_ACCEPTANCE`.

- Owner report: "a primer is just tapping the same mcq as the question verbatim." Measured, and
  worse: `renderPrimerPanel` printed `Know this: <primerFact>` directly above options whose correct
  entry was that same string — **64 of 64** — and the distractors were other concepts' summaries, so
  with the panel covered the item was still answerable by topic-matching. First contact with every
  idea in the course was spent matching a string. `REDLINE` **LAW-63**.
- **Predict, then reveal**, chosen by the owner from three shapes. The panel now carries the
  concept's caselet and withholds the rule; the learner writes what they think the case shows; the
  principle arrives afterwards as the answer to their own prediction, with their words quoted above
  it. No key, no marking, no evidence — being wrong is the mechanism, which is also why it can ask
  for reasoning at first contact where a keyed question could only ask for unrecalled recall. An
  honest escape ("I would be guessing — just show me") reveals without claiming a prediction.
- The reveal carries **no verdict** and takes the cyan guidance colour rather than the green
  "correct" treatment it used to inherit: nothing compared their prose to a key.
- **Why not a two-step keyed build:** every same-concept string is already spoken for — `confusions`
  are `_explain`'s distractors, `applicationWrong` is `_apply`'s option set, `bridge` is
  `_connect`'s answer — so a keyed primer built from them pre-answers a scored question. And BRGSA
  carries no same-concept near-misses at all, so 16 of 64 concepts would need transcript-grounded
  authoring first.
- `recordPrimerAttempt` no longer moves the support ladder. It was reading whether the learner could
  match a string printed above the options; the ladder is now driven entirely by
  `updatePrimerFromChallenge` — how the concept's *scored* questions went — and the primer records
  `shown` and `predicted` only.
- The bank gate now **forbids** options on a primer rather than checking their shape, since an
  options array needs a key and the key was the leak.
- New standing check `tools/browser-checks/primer-prediction.js`: over every concept in a subject,
  nothing on screen before the commit is a correct answer to any scheduled question on that concept,
  no options or keyed answer exist, an empty prediction is refused, the commit moves neither
  `conceptAttempts` nor `totalAnswers` (as a delta, not an absolute — the first version of the check
  got this wrong), and the reveal still carries what the panel withheld. `ok: true`, 16/16.
- **Reported, not fixed:** `_term_cloze` and `_case_cloze`'s framework blank take the concept's own
  name as their answer, while the layering copy has to print that name for a run to read as a
  sequence — **32 scheduled questions per subject, 128 in all**. Not a support-surface defect and
  outside LAW-63; the check reports it under `answerableFromTheConceptName`. Fixing it changes
  scheduled coverage, so it is an owner call.
- **A defect in this session's own check:** `teach-before-test.js` reported `ok: true` over three
  routes instead of twelve, because a saved run resumes into the practice screen, the dashboard
  never renders, and every set button it looks for is absent. It now records what it could not reach
  and an unreached route makes the result not-ok. Same family as LAW-62.
- After the rework: LAW-47 clean across sets 1–9 and all three presets with `skipped: []`, preset
  check unchanged, 0 overflow and 0 sub-44px targets on both the prediction and reveal screens at
  375×812 and 1280×800, 78/78, palette and build clean, `validate_t6_bank.js` `ok: true`. The bank
  validator ran **without the lecture transcripts**, so its coverage block is empty and the LAW-49
  vocabulary gate did not execute — a skipped check, not a passed one.

## 2026-08-14 — Linked weaknesses are practised together; isolated ones are named

Evidence: `evidence/2026-08-14/t6-weakness-linking/verification.md`.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only. Tester-visible.

- The weakness route now pairs two weak concepts when the bank genuinely connects them and checks
  the pair with a surface that tests both, and reports every other weakness as standing on its own.
- **"Close enough" is defined by the bank, not by proximity.** An edge exists only where one authored
  surface tests both concepts (`conceptId` + `supportingConceptIds`). `data/graphs/` holds no Term 6
  graph — its files are BEHECON, GER, MACRO, NABM, NPD — and concept records carry prose, not links,
  so same-module or adjacent-lecture heuristics would have been claims with no surface to exercise.
  Measured: each concept has exactly one partner, its module sibling, joined by a `_match` question
  and five boss steps; SCLM adds two real cross-module edges through `sclm_syn_inventory`. Nothing
  else. The graph is sparse and isolation is the common case.
- A weakness is paired **only when its partner is also weak** — a link to something already Strong is
  not a shared weakness. Pairing is greedy in priority order so the weakest concept gets first choice
  of partner, and inside a pair the earlier lecture still comes first.
- A linked unit runs *repair A → repair B → the surface that tests both*; a joint question is
  preferred over a boss. If no joint surface is available the pair is **not claimed as linked**.
- Run length 8 → 10 (`PRIORITY_RUN_LENGTH`), since a pair costs three items; the two homepage strings
  that said "Up to 8 questions" now read the constant. `startPriorityPractice` stays the one route
  ordered by weakness rather than teaching sequence — its kicker states that contract.
- The kicker reports the shape ("2 linked pairs, 4 on their own") and a joint surface is labelled
  **BOTH TOGETHER · A + B**. That label first went into `#question-pattern`, which lives inside
  `.question-meta { display: none }`, so it passed a `textContent` assertion while being invisible;
  it now uses the task kicker via a `has-kicker` class generalised from the case work.
- Two defects found by the verification and fixed: the run delivered **12 items against a stated cap
  of 10** because the budget asked "is there room" rather than "does this unit fit"; and the first
  version of the standing check seeded two fixtures in one page session and got the same answer
  twice, from neither of them (LAW-62).
- New standing check `tools/browser-checks/weakness-linking.js`: no invented links, every claimed
  pair actually checked, isolated never folded into a pair. `ok: true`. Layering and LAW-47 checks
  re-run clean; 78/78, `check:exam SPMS` clean, bank/palette/build clean.

## 2026-08-14 — Questions that name an example now show it

Evidence: `evidence/2026-08-14/t6-example-questions-show-their-example/verification.md`
(branch only; `WAITING_OWNER_CONTENT_ACCEPTANCE` — four new caselets and four revised stems are
course content shown to testers as fact and the owner has read none of it).

- Audited **all 816 questions** in the active bank for a stem that points at an example the learner
  never sees, in two passes: sixteen deictic phrasings plus a proper-noun sweep over every stem
  shipping no caselet. The defect is confined to SPMS Section B's twenty authored multiple-select
  items and appears nowhere else; 580 of the 816 already carry a caselet.
- Of those twenty, **four** name a concrete example — `spms_jtbd_msq` (the drilling machine),
  `spms_tamsam_msq` (Zerodha), `spms_priority_msq_buckets` (ride-hailing MoSCoW), and
  `spms_roadmap_msq_sequence` (WhatsApp). `addAuthoredMultiSelect` had no `caselet` field, so none
  of them could have shown one. All four now do.
- The lesson was not covering this. `SPMS-M07-L01`'s lesson does not contain the ride-hailing bucket
  assignment its question asks for, so that item was answerable only from the transcript — and the
  examiner, which is where all twenty are sat, delivers no lesson at all.
- Each case is written from its own lecture's clean transcript and withholds what the question asks
  for: the doctor's own words but not the words *functional*, *emotional*, *social*; Zerodha's three
  populations but no TAM/SAM/SOM labels; the candidate features and the three-month bucket with
  nothing sorted. WhatsApp's case does state what the team knew, because that fact is the hinge its
  two wrong readings turn on.
- Options, `answers`, and `diagnoses` are byte-identical, so the marking contract, per-option
  diagnoses, and the LAW-53 shape spread (`3-of-5 ×12, 2-of-4 ×6, 2-of-5 ×2`) are untouched.
  `npm run check:exam SPMS` exits 0, `npm test` 78/78, bank validator `ok: true` with the lecture
  gate confirmed live.
- **Second pass, same day:** the first cut was faithful and badly written — three parallel
  "Asked why…, she says…" clauses in one 557-character block. All four rewritten as scenarios in
  three beats. `caseParagraphs()` renders blank-line-separated beats as paragraphs on both surfaces;
  a case written as one block is unaffected. Hierarchy fixed in CSS: the **THE CASE** label was
  screen-reader-only, the **THEN DECIDE** kicker was computed by JS and then hidden by a global
  `display: none`, and nothing separated material from ask — now an eyebrow, an eyebrow, and a 1px
  rule (a divider, not a nested card). `.caselet.is-long` was unbounded and ran past 100 characters
  per line; capped at 62ch and measured at 71.
- Logged as `REDLINE` **LAW-61** and `I-INVISIBLE-EXAMPLE` in the quality log. Left open and
  reported rather than changed: fifteen of the twenty MSQ stems still ask what *"the lecture"* said
  rather than what is true, and `spms_roadmap_msq` carries a date recall as a correct option.

## 2026-08-14 — Concepts are layered: a run walks the course's own order

Evidence: `evidence/2026-08-14/t6-lesson-order-diagnosis/verification.md`.
`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only. Tester-visible — the order of every run changes.

- **The defect:** SPMS study set 1 taught `M01-L10` before `M01-L05`, in the run the homepage
  captions *"in the order the subject teaches it"*. Lecture position was not an input to scheduling
  anywhere. `layeredQueue()` places a lesson immediately before the first surface citing it, so
  lesson order was a by-product of question order; `selectQuestionsFromPool()` ordered questions by
  never-attempted → format variety → concept variety → least-recent → a hash of the question id. On
  a fresh profile the first four keys tie, so the opening question of a run — and the first lesson a
  learner ever meets — was chosen by that hash (`spms_jtbd_explain`, 205,902,689, lowest in a
  23-question pool). Neither chained for layering nor random: deterministic, and arbitrary with
  respect to teaching.
- **The app was already promising the build it did not have.** A primer following another concept
  prints "Carry forward: `<previous>`. Now add `<this>`", and the step header reads "builds on what
  you just did". That copy has shipped against a sequence nothing had sequenced.
- **The fix, in two parts, both in `app/t6.js`.** Selection is untouched — format spread, concept
  coverage and weak-first are deliberate and stay. The selected questions are then sorted by teaching
  rank (`module * 1000 + lecture`, ranked by the *last* lecture a question cites, stable so variety
  survives within a lecture, bosses and constructed responses still last). And `layeredQueue` now
  commits to the run's whole lesson list up front and drains it in order — ordering the questions
  alone still left 4 backward steps, because a boss held to the end can be the first surface to owe
  an early lecture's lesson. Lesson delivery is now monotonic by construction, and LAW-47 holds a
  fortiori.
- **Measured across all 40 sets in four subjects: 94 descents over 37 of 40 sets → 0.** Consecutive
  pair count identical at 253 before and after, which is the proof selection did not move. BRGSA set
  9 now runs 18 lessons from `M01-L01` to `M08-L01` with zero backward steps; the SPMS set 9
  carry-forward chain reads as the syllabus in order.
- `startPriorityPractice` is deliberately excluded: it is remediation ordered by need and its kicker
  states that order to the learner.
- New standing check `tools/browser-checks/lesson-layering.js`. Official LAW-47 check still
  `ok: true`. 78/78, `check:exam SPMS` clean, bank validator `ok: true`, palette clean, build clean.
- Logged as `I-LAYERING`, plus `WATCH` **LAW-62** for the measurement trap this exposed: rendering a
  lesson marks it read *in memory*, so a probe that opens several sets in one page load contaminates
  itself — the first version of this measurement reported 53 LAW-47 violations that did not exist.

## 2026-08-14 — BRGSA concept records, corrected anchors, and case exemplars that quote the case

Evidence: `evidence/2026-08-14/t6-frozen-evidence-and-answer-retention/verification.md`
(branch only; `WAITING_OWNER_CONTENT_ACCEPTANCE` — the owner has read none of this prose, and the
concept renames are visible to testers, so it needs acceptance and a change announcement before it
reaches the cohort).

- Authored `summary`, `application`, `bridge`, `caselet` and `caseEvidence` for all 16 BRGSA
  concepts, which previously carried only a name and a lecture id. Written practice for the subject
  was entirely derived from stitched multiple-choice text as a result.
- Corrected five concept names that described something other than their anchor lecture, which is
  the only evidence the marker is shown. Module 4's two concepts had simply been exchanged and were
  fixed by swapping their sources back; the other four were renamed to the topic their lecture
  actually teaches.
- Fixed the case exemplar, which read `name + application + bridge + summary` and never quoted the
  caselet — so it could not satisfy its own "uses a specific fact from the case" criterion. That
  criterion failed on 12 of 27 case exemplars, 6/13 BRGSA and 6/14 IBM: the only criterion where
  IBM's authoring advantage bought it nothing. Concepts now carry an authored `caseEvidence`
  sentence that names the deciding fact and says why it carries the decision.
- Expanded IBM's caselets from roughly 120 to roughly 550 characters, giving each a named setting,
  concrete figures and a decision tension. The paper this practises is ten written answers on one
  elaborate case released two days beforehand, and a one-sentence caselet contained almost nothing
  specific enough to cite.
- Rebuilt the frozen evidence pack against the corrected anchors: 380 chunks, 64 questions, 514 KiB,
  zero out-of-lecture chunks. New digest `frozen-918efdc8b6a1ccf9`, which keeps hosted marking off
  until the pack is approved by name.

## 2026-08-14 — Frozen course evidence, hosted distress interception, and answer retention

Evidence: `evidence/2026-08-14/t6-frozen-evidence-and-answer-retention/verification.md`
(`VERIFIED(AUTOMATED)`, branch only; `WAITING_OWNER_CALIBRATION + WAITING_OWNER_CONTENT_ACCEPTANCE +
WAITING_OWNER_DEPLOY`; nothing pushed, merged, or deployed, and hosted written checking stays
fail-closed).

- Froze each question's course evidence at build time and removed Vectorize and the embedding model
  from the hosted path entirely. Retrieval never reads the candidate answer, so a question's evidence
  was a constant that a per-request vector search recomputed. 380 chunks over all 64 questions,
  511 KiB, zero lecture-boundary violations, 155.92 KiB gzipped in the bundle against a 3 MiB free
  ceiling. Course transcripts now stay out of any hosted store, and creating the index and uploading
  3,470 chunks is no longer an owner action.
- Made `DUNGEON_HOSTED_WRITTEN_CORPUS` the pack's own content digest, so approval cannot drift from
  the course text the marker quotes; re-freezing the evidence switches hosted marking off until the
  new pack is approved by name.
- Removed the `COURSE_RAG` binding, which referenced an index that was never created and would have
  failed every `wrangler deploy`.
- Fixed a gap where the hosted runtime imported the distress helpers and never called them. Only the
  local grader intercepted, while the hosted worker is the runtime testers use — so the privacy
  notice's "not sent to any AI provider, not marked, not stored" was not being kept where it counted.
  Both hosted entry points now check ahead of the activation gate, the length bound, the evidence and
  any model call. The local grader's ordering was corrected the same way, since distress previously
  sat behind the 20-character minimum and the shortest messages got a validation error.
- Implemented the written-answer retention the tester agreement now asks consent for. Each row
  carries its own 92-day expiry, a daily cron deletes on it so the window keeps running after the
  exam season, revoking a tester deletes their answers explicitly, and the owner has a per-tester
  "Delete answers" control for a deletion request that is not a withdrawal. A support response is
  never written, and a storage failure still returns the learner their mark.
- Pointed `tools/evaluate-hosted-grader.mjs` at `gradeHostedAnswer` itself instead of a parallel
  two-pass implementation, so hosted calibration measures the shipped path — same frozen evidence,
  acceptance gates, token ceiling and retry — and needs only a Workers AI token.
- Traced the BRGSA/IBM marking gap to its cause and corrected an earlier diagnosis. BRGSA has an
  authored `application` on 0 of 16 concepts against IBM's 16 of 16, so `conceptData` falls back to a
  case question's correct multiple-choice option — a scenario-specific answer choice used as though
  it were a general decision rule. Both written generators consume that field directly, so all 32
  BRGSA prompts carry an exemplar ending in a non-sequitur and a rubric demanding the learner match
  it. The marker refusing them is correct behaviour. This supersedes the earlier
  "concept-label/exemplar mismatch" reading, which named roughly the right prompts for the wrong
  reason. No code change was made: the repair is sixteen authored sentences and needs owner content
  acceptance.

## 2026-08-13 — Written transfer across Learn and post-submit Examiner forensics

Evidence: `evidence/2026-08-13/t6-written-transfer-and-examiner-forensics/verification.md`

- Aligned authored prose with the final papers: BRGSA and IBM now each have short-form and case-based
  written practice on all sixteen concepts; SPMS and SCLM have no invented prose route.
- Added server-owned missing/misunderstood gap codes per rubric criterion. Accepted Qwen judgements
  update a separate corrective pool, insert exact deterministic teaching, and schedule fresh written
  transfer until two later confirmations close each gap. They remain `scored:false` and never Strong.
- Added automatic post-submit Examiner review for attempted written answers. It runs the bounded
  rubric authority, then a larger-budget two-pass coach against the authored question's declared
  lectures and rubric. Failed criteria prioritise Dungeon lessons/re-tests; passed mock criteria do
  not close gaps or award mastery. Written work remains excluded from the machine score.
- Fixed UTF-8 decoding at the Windows Python-to-Node boundary after a real run transformed an em dash
  into CJK-looking mojibake. Browser validation now also rejects unexpected script after transport.
- Canonicalised every accepted point-level coaching citation into the response's top-level citation
  list. A real Browser rerun caught the former mismatch when server validation accepted a supplied
  nested citation but the browser correctly withheld the inconsistent response.
- Hosted code has the same authored post-submit route but remains fail-closed and undeployed pending
  exact-model/corpus approval, consent, calibration, and owner merge.

Newest first. Add one entry for every session that changes the workspace. Each entry records what
changed, decisions, verification/evidence, and deferrals.

## 2026-08-13 — Dungeon-owned written diagnosis and teaching repair

Evidence: `evidence/2026-08-13/t6-proactive-written-adaptation/verification.md`
(`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only; `WAITING_LOCAL_MODEL_CALIBRATION +
WAITING_HOSTED_CORPUS + WAITING_OWNER_CALIBRATION + WAITING_OWNER_DEPLOY`; nothing committed,
pushed, merged, or deployed).

- Replaced least-recent-only written scheduling with a separate criterion-level practice profile.
  Accepted misses open two fresh confirmations; later accepted successes close them one at a time.
  This state changes written selection and recommendations but remains separate from concept mastery.
- Promoted an open writing move into Dungeon's main **Next** recommendation. It names the dimension,
  explains the intervention, states the remaining confirmation count, and withdraws the duplicate
  written route.
- Inserted a deterministic, unscored repair immediately after a missing criterion. It teaches a
  three-move answer structure, then labels the next fresh authored prompt as the transfer check. The
  existing different-family concept repair is retained later in the run.
- Removed the header subject select during active practice. The run has already fixed its subject;
  the empty dropdown was both a resume defect and a control that could not honestly change the run.
- Corrected a stale brief that still described two sequential generations after the one-pass latency
  correction. Added a real-page scenario/check for recommendation, repair, transfer, zero overflow,
  target size, and hidden fixed-subject control. Automated suite remains 62/62.

## 2026-08-13 — Practical written judgements: correct authority, half the model path

Evidence: `evidence/2026-08-13/t6-practical-written-answer/verification.md`
(`VERIFIED(REAL_BROWSER + REAL_MAC_MODEL + AUTOMATED)`, branch only;
`WAITING_LOCAL_MODEL_CALIBRATION + WAITING_HOSTED_CORPUS + WAITING_OWNER_CALIBRATION +
WAITING_OWNER_DEPLOY`; nothing committed, pushed, merged, or deployed).

- Reproduced the owner's landing-page answer and found that the generated item cited the general
  M01-L01 validation lecture while its case and correct decision came from M01-L03. It also demanded
  an unrelated pre-declared-test reason. Generated written items now carry principle plus applied
  sources and ask a direct, practical decision question.
- Reduced the transparent rubric to the two things the prompt is actually trying to observe:
  course understanding, and judgement supported by case evidence. The exact course term is optional
  when the response applies the idea accurately.
- Replaced two sequential generations from the same checkpoint with one compact Qwen judgement plus
  deterministic schema, English-script, declared-citation, and literal-answer-evidence validation.
  The exact previously rejected answer now receives 2/2 in 24.937 seconds rather than abstaining in
  46.9 seconds.
- Added question-only evidence preparation after a 900 ms writing pause. Partial drafts never leave
  the browser; the candidate answer is sent only on Check. Preparation measured 497 ms.
- Made the bag launcher translucent and docked it into reserved header space during practice, so a
  stored drag position cannot cover learning copy. Real Browser verification passed at desktop and
  375×812 with zero horizontal overflow and no bag/question intersection.
- Automated gates: 62/62 tests, real-transcript bank and lesson gates, palette gate, and release
  build pass. Local and hosted 48-answer owner calibration, corpus setup, consent, PR merge, and
  deployment remain waiting.

## 2026-08-13 — Authored written practice and fail-closed website authority

Evidence: `evidence/2026-08-13/t6-hosted-written-authority/verification.md`
(`IMPLEMENTED + VERIFIED(AUTOMATED + WORKER_DRY_RUN)`, branch only;
`WAITING_HOSTED_CORPUS + WAITING_OWNER_CALIBRATION + WAITING_OWNER_DEPLOY`; no Cloudflare resource
was created or changed, no transcript was uploaded, and nothing was committed, pushed, merged, or
deployed).

- Narrowed the learner product to Dungeon-authored short-answer practice behind one validation
  contract. **Practise written answers** selects four owned prompts, preserves teach-before-test,
  and may issue a source-cited criterion mark. The subject-wide analyzer remains unlinked
  internal evaluation tooling and has no public Worker route.
- Added hybrid subject retrieval locally using the loaded
  `text-embedding-nomic-embed-text-v1.5` model, with a lexical fallback. Candidate answers are
  deliberately excluded from retrieval queries so untrusted claims cannot choose their own
  authority material. The Windows launcher now verifies both exact local model IDs.
- Added an authenticated same-origin Cloudflare Worker implementation using
  `@cf/qwen/qwen3-30b-a3b-fp8`, `@cf/qwen/qwen3-embedding-0.6b`, and a filtered 1,024-dimensional
  Vectorize binding. Server-owned rubric/source boundaries, deterministic structured validation,
  citation validation, abstention, 16 KiB requests, and the examiner exclusion remain intact.
- Added content-free D1 metering with a default 20-check per learner daily limit. The Worker stores
  no candidate answer, retrieved course text, or model output and does not log them.
- Added an authored **Practise written answers** dashboard route. Machine checking remains
  fail-closed until feature, exact model approval, exact corpus approval, bindings, and a non-empty
  corpus all agree; the learner route remains usable through the transparent rubric fallback.
- Collapsed learner-facing evidence into subject/module tags such as `BRGSA M1`, while retaining
  exact lecture/chunk citations inside the validated authority result. Added LAW-60: model-authored
  English is checked for stray CJK/mojibake, regenerated once, and safely abstains on recurrence.
- Added deterministic generation of the 64-question server manifest, a private transcript-to-
  Vectorize NDJSON builder, and a hosted calibration runner that talks to the exact Workers AI model
  and actual Vectorize corpus. The current 283-lecture pack produces 3,470 bounded chunks without
  being copied into the repository.
- Added LAW-59, privacy disclosure, runbook, and 61 passing automated checks, including encoding
  retry/abstention coverage, plus a
  successful Worker dry-run showing AI and Vectorize bindings while activation vars remain off,
  unapproved, and unindexed.
- Deferred: creating the Vectorize resource and metadata indexes, uploading the external corpus,
  48-case hosted rubric calibration, updated tester agreement, remote
  D1 migration, real-Browser/pixel acceptance, owner PR merge, and deployment.

## 2026-08-13 — Local written-response authority and high-effort audit

Evidence: `evidence/2026-08-13/t6-local-written-authority/verification.md`
(`VERIFIED(REAL_BROWSER + REAL_MAC_MODEL + AUTOMATED)`, branch only;
`WAITING_LOCAL_MODEL_CALIBRATION`; not committed, pushed, merged, or deployed).

- Implemented the owner's decision that local Qwen may issue Dungeon's final **practice**
  criterion mark for a written response. It remains an internal Dungeon judgement: not an IIMB
  grade, not an exam prediction, and never Strong evidence. The timed examiner has no model path.
- Added a dependency-free local grader that loads the real bank, confines retrieval to the
  question's declared lectures, and runs two blinded structured passes through loopback LM Studio.
  A mark is accepted only on exact per-criterion agreement with validated source citations and
  literal answer evidence; malformed output, disagreement, unsupported evidence, timeout, and
  interruption abstain into the existing rubric/exemplar self-review.
- Added a deliberately narrow local HTTP boundary: explicitly enabled, loopback client and model
  endpoint, exact same browser origin, no CORS, 32 KiB request cap, and one grading request at a
  time. Production and LAN clients receive no grader route. The model sees no client-supplied bank,
  rubric, or lecture ids; it sees only the server's authoritative question and retrieved evidence.
- Added the proactive product loop: accepted missing criteria place a different question later in
  practice. Accepted machine marks remain `scored: false` and `strongEligible: false`. Abstention
  leaves a visible, usable manual self-review route.
- The requested higher-effort review found and fixed two real defects. A rapid-but-correct latest
  attempt could erase an already Strong state; recency now uses the latest Strong-eligible attempt.
  And leaving while the local grader was running could persist a stuck grading state; interruption
  now restores ready-to-grade and ignores the late result.
- The final audit found a third boundary defect: exact checkpoint approval was documented as
  mandatory but the launcher did not enforce it. The local HTTP authority now remains disabled
  until an owner-set approved model id exactly matches the configured model id; the offline
  evaluator needs no such approval, so a candidate can be measured before its ID is authorised.
- Added grader tests, a deterministic OpenAI-compatible fixture, aggregate-only calibration
  tooling, responsive Browser verification, and LAW-58. Current gates: 50/50 tests, build pass,
  palette pass, source-backed bank validation pass, and expected unchanged SCLM examiner shortfall.
- Updated the Mac handoff with ChatGPT Computer Use permissions, LM Studio configuration, health
  checks, launch commands, the private owner-marked calibration workflow, and Windows→Mac SSH
  workspace setup without VNC or a public tunnel. A real Windows Connections screenshot corrected
  the earlier direction error: **Control this PC** authorises controllers of Windows and does not
  accept a code generated by the Mac; desktop-to-desktop access belongs in the adjacent **SSH** tab.
  The local access point was then proven to isolate peers despite common-subnet ARP, so the handoff
  now carries a least-privilege Tailscale fallback. Windows and Mac are verified connected with no
  exit node, advertised routes, Tailscale SSH, or posture reporting.
  Native SSH was then proven over the Tailscale peer after isolating Mullvad's terminal PF kill-
  switch rule as the dropped-SYN cause; no ACL weakening, public tunnel, exit node, route advert, or
  Tailscale SSH was introduced.
- The owner selected the already installed exact LM Studio identifier
  `qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled`. Added
  `tools/start-windows-mac-grader.ps1`: it keeps Windows as the authoritative checkout, opens a
  loopback-only SSH forward to Mac LM Studio, checks the exact ID and 283-lecture source pack, and
  launches the guarded site. Real BRGSA and SCLM exemplars returned accepted source-cited 3/3 marks.
  The first live output exposed commentary-wrapped answer evidence; the prompt/schema now require
  the shortest raw literal substring and a regression preserves the strict validator.
- Added an honest two-pass waiting surface based on measured real-model performance. A 12-case
  four-subject synthetic smoke issued 9/12, safely marked all four injection-shaped answers 0/3,
  and recorded 72.22% criterion agreement, 66.67% exact cases, 2.78% apparent false awards, 25%
  abstention, 43.25s mean latency, and 48.45s p95. The in-app Browser completed the real model path
  and the interruption path at desktop and 375×812 without overflow.
- Deferred: the 48-answer owner-marked calibration set, empirical academic acceptance, and any
  hosted or production inference path. The exact checkpoint is operational and owner-approved;
  deterministic and synthetic evidence prove the bounded system contract, not marking validity.

## 2026-08-13 — Measurement foundation and Mac workstation handoff

Evidence: `evidence/2026-08-13/t6-measurement-foundation/verification.md`
(`VERIFIED(REAL_BROWSER + AUTOMATED)`, branch only; not merged or deployed).

- Added an ephemeral monotonic response clock. Explicit answer commit fixes the elapsed time;
  the profile receives only the existing contract's coarse duration band plus `rapidGuess` and
  `strongEligible`. Raw milliseconds never enter a saved session, local profile, or D1 payload.
- Added the eighth Strong gate. A rapid response keeps its correctness, diagnosis, feedback, and
  scheduling effect but cannot supply or erase Strong evidence. A high-effort audit caught and
  fixed the edge case where a later rapid-correct attempt could demote an already Strong concept;
  recency now reads the newest eligible attempt while rapid wrong answers still reach ordinary
  error handling. Slowness is never penalised, historical
  untimed attempts stay eligible, and a complete response restored after reload is recorded with
  unknown timing instead of being falsely classified from the few seconds after reload.
- Added isolated Browser fixtures for the Strong/Developing comparison, established-Strong
  non-demotion, live rapid response, normal response, and restored-response path. The deterministic pair differs only in the fifth
  response's eligibility and renders one Strong, one Developing, with the reason named.
- Indexed the owner-supplied measurement research as
  `docs/briefs/DUNGEON_MEASUREMENT_AND_JUDGEMENT.md`, resolved its speed-language conflict as C31,
  updated the eight-gate evidence and technical briefs, and documented LAW-57. The privacy notice
  now states the coarse band, purpose, and raw-time prohibition; the existing collection purpose
  and attempt category are unchanged.
- Rebuilt the Mac handoff around a private Git checkout, local server, ChatGPT Computer Use macOS
  permissions and copy-ready prompt, LAN-only development access, `@Chrome` for an existing signed-
  in session, and a hard boundary between an offline loopback local-model lab and Cloudflare
  production. No package or model download was initiated.
- Deferred: live D1 coverage audit, empirical threshold calibration, confidence-curve UI,
  retention forecasting, post-exam debrief collection, machine-created Strong evidence, and any
  production model path. The latter two remain owner decisions; no telemetry transmission path was
  added.

## 2026-08-13 — One switch between two products; repair arrives in sittings; the bag

Evidence: `evidence/2026-08-13/t6-dual-facing-and-sittings/verification.md`
(`VERIFIED(REAL_BROWSER + AUTOMATED)`, 320→1600px; no screenshots — see below, the cause is now
measured rather than assumed).

- **The site is dual-facing, and the switch is in the header.** Learn and Exam, a segmented control
  with a sliding thumb, and a `document.startViewTransition` between the two sides: the old page
  leaves in the direction you came from and the new one arrives from the side you pressed. The
  header is pulled out of the moving picture with its own `view-transition-name`, because furniture
  present on both sides should not travel. Direction, duration, and the reduced-motion form live in
  the stylesheet next to the switch; the script only decides *when* a move is a crossing.
- **Which side you are on is derived from the screen, never stored.** `showScreen` sets `data-mode`
  and both `aria-pressed` values from a table of the examiner's screen ids, so every route written
  before the switch existed — the dashboard's way in, backing out of a brief, the two repair routes,
  leaving a paper — keeps the switch agreeing with the page. Crossings animate; moves that stay on
  one side do not, since animating those would say "you have gone somewhere else" when you have not.
- **The switch is a group of two pressed buttons, not a tablist.** A tablist promises arrow-key
  movement between tabs and one panel per tab, and the examiner side is two screens deep, so the tab
  contract would have been a lie to a screen reader.
- **Two defects found while verifying, both fixed.** A view transition skipped before it animates
  rejects `ready`; nothing caught it, so a working app printed twelve
  `InvalidStateError: Transition was aborted` lines. And because the update callback runs a frame
  later, a fast double-press read the pre-press mode and was dropped as "already there" — pressing
  Exam then Learn quickly landed you on Exam. A `pendingMode` now records where a flying transition
  is heading.
- **The examiner's home leads with one recommended paper.** A paper you have never met beats a
  second set of one you have, in seat order; after that it is your weakest paper, and within it an
  unseen set before a re-sit. Two rules came out of driving six seeded profiles through it: a caveat
  paper cannot win "weakest" (IBM's mock is self-marked against a rubric, so at 40% it beat BRGSA's
  55% and would have become the only thing ever recommended), and a paper's standing is its *best*
  result while the *set* to sit is chosen separately. The hero repeats the bank shortfall rather
  than being the one honest surface that goes quiet, via an `examShortfalls` helper now shared with
  the paper cards.
- **Repair after a mock arrives in sittings of four concepts** (built the previous turn, documented
  here). Concepts taken into a sitting are stamped `repairedAt`, so the next sitting moves on rather
  than repeating, and once every miss has been through it falls back to a second pass. Verified
  across sittings: 4, then 4 more, no overlap. Kicker: "4 concepts this sitting · 9 waiting for the
  next". A sixty-step run is the wrong thing to hand someone who has just finished two hours.
- **The bag** (same turn, same gap now closed): a header drawer holding a 25/5 focus timer that runs
  off a timestamp rather than a countdown — so changing screens or opening a paper does not reset
  it, and the header carries a live chip while it runs — and eight pieces of guidance written from
  what this app actually does. One bug fixed in testing: skipping to the break showed 25:00 because
  stopping the timer recomputed the remaining time from the still-running clock.
- **Mobile.** With the switch in it the header overflowed 375px by 123px, and briefly by 17px at
  721. Below 760 the header now drops the wordmark and the evidence figure — the figure is the first
  thing on the dashboard directly beneath, so the duplicate goes and the fact stays — and the switch
  narrows without shortening. 0 overflow at every width from 320 to 1600.
- **The 44px floor.** The project's own `ui-audit.js` flagged the switch halves at 38px. The
  pill-in-a-pill inset moved from the container's padding onto the thumb, so each half is now a
  full-height 44px target inside the same 46px control. `button#brand-home` is still 42px on
  desktop; it is pre-existing and was left alone.
- **Why there are still no screenshots, measured this time.** The Browser pane is not displayed, so
  its tab composites no frames: `document.timeline.currentTime` reads 0 and stays there, every CSS
  transition sits frozen at its start value, `resize_window` does not change `innerWidth`, and
  screenshots time out at 5s. Twice this looked exactly like a CSS bug — the thumb "not moving", the
  two labels' colours "swapped" — and both were the frozen clock. The evidence file records the
  technique that gives a real answer (drive `getAnimations()` to the end, measure layout in
  fixed-width same-origin iframes). The Chrome-extension path was tried at the owner's suggestion
  and reported "not connected" three times. **Pixel acceptance remains owed.**
- **The crossing became a coin, and the header switch became its shorthand.** A slim two-panel
  band is now the first thing on both home pages — Learn on the left, Examiner on the right, one
  object split down the middle with a single border around both halves. The side you are on is
  filled in its own colour (ink for the learning system, saffron for the examiner) and is inert and
  `aria-current`; the other side is the whole panel as a button. It replaced the dark "Sit a full
  mock" invite and the examiner's "← The learning system" button, both of which were a second door
  to a place the coin already goes. The header switch now folds away while a coin is on screen and
  unfolds as it scrolls off — width animates rather than opacity, because a fade left a 158px hole
  in the header and a removal jumped everything beside it.
- **A dark-mode defect the first screenshot of the session caught.** The filled "you are here" side
  used `--deep`, which is near-black in *both* themes, so on a dark page it was a black panel on a
  near-black background — the one signal the design asked colour to carry, invisible. It uses
  `--ink` now, which flips with the theme.
- **The header says progress and shows no chart.** "Term 6 evidence" is "Term 6 progress", the
  sparkline is gone, and the note is `N blocks practised`. `sparklineMarkup` and
  `trendDirectionCopy` went with it — the header was their only caller — and the count is taken
  directly instead of rebuilding the evidence model at every historical block to plot a 96px line.
- **The bag is tools only, and it floats.** The eight guidance notes are gone: it was half toolbox
  and half manual, and the manual half is read once and in the way every time after. What is left
  is what you reach for *during* work — the focus timer, and the examiner's calculator, extracted
  to `buildCalculator(mount, kind)` and mounted twice with separate buffers so both keypads are
  available while practising (which one you are allowed is a fact about the paper). It is a rounded
  card floating above the corner with no scrim, since a dimmed page says "deal with this first" and
  these are for using *while* reading what is behind them. Where you leave it is where it stays.
- **The resume bar arrives and leaves instead of blinking.** It is toggled with `hidden`, and
  `display: none` cannot be transitioned the ordinary way; it now rises and fades via
  `transition-behavior: allow-discrete` with `@starting-style`. Traced frame by frame: 13px→0 and
  opacity 0.02→1 over ~190ms in, reversed out, with `pointer-events` dropped at the *start* of the
  exit rather than the end.
- **The two sides now sit on the same margins.** The dashboard was 1120px wide and the examiner
  1000px with different side padding, so crossing slid every left edge on the page. Two products
  may look different; if they sit on different margins the switch reads as a page reload rather
  than a turn of the same page.
- **The header reports the side you are on.** On the examiner it is "Mocks completed" and the
  average score, because the learning system's numbers are the wrong ones there twice over: mocks
  deliberately never touch your evidence, so that percentage would sit unmoved however many papers
  you sat, and a practice-block count belongs to a product you are not currently in.
- **The examiner has the floating offer too.** Its page is twelve set buttons long, so the
  recommendation scrolls away exactly as the learning system's does. Same component, same rule —
  it clicks the hero's own button, so one thing still decides what is next.
- **The primary action on a near-black panel stopped being saffron.** Saffron was chosen when it
  meant nothing in particular; it means the examiner now, so a gold button on the learning system's
  hero pointed at the wrong product. It is the inverted pair instead — the panel's text colour as
  the button's surface — which is the sharpest thing that can sit on that background in either
  theme and claims neither product's colour.
- **The top bar was rebuilt as two clusters and the product is called Dungeon in it.** Brand and
  figures on the left separated by a rule, tools on the right pushed by one auto margin, and only
  the gap between them resizes — `space-between` across three children had been putting the figures
  wherever the window happened to leave room and sliding them the whole way at every width between.
  The figures are one label, one value, one note, in that order and that shape whichever side they
  report on.
- **Subject switching moved into the top bar.** The rail on the dashboard is where you *compare*
  subjects; the header control is where you *change* the one you are on, from anywhere — including
  halfway down a page where the rail is long gone. Both read and write `profile.selectedCourse`, so
  whichever you use the other follows. It hides on the examiner, where the unit is a paper.
- **The bag left the header and became a floating launcher.** The header says what the page is; the
  bag is a tool you pick up and put down, so it now sits next to where it opens and steps aside
  while the panel is out. It also freed the width that let the header stop growing.
- **The coin on a phone is a switch, not two panels.** Stacked with the other side floated to the
  top it was 190px of the first screenful, and the thing under your thumb changed meaning every
  time you used it — you could tap one spot repeatedly and be thrown back and forth between two
  products. One row now, fixed order, names only, 52px. The subject cards lose the full course
  title on a phone and the description paragraph goes with them, which is what makes room for the
  hero rather than moving it: the picker belongs above the thing it changes.
- **The two sides start at the same place, vertically as well as horizontally.** Three separate
  causes, all found by measuring rather than looking: the examiner's wrapper was 1000px against the
  dashboard's 1120 (now one shared rule, since keeping them apart is what let them drift twice);
  `.home-block:first-of-type` stopped matching once the coin — also a `<section>` — was put above
  it, so one side collapsed a 56px margin under the coin and the other used 26; and between 760 and
  900 the header grew from 70px to 82 on the learning side only, which, being sticky, pushed that
  side's whole page down 12px. Verified equal at 320, 375, 768, 900 and 1280.
- **The bag can be carried, thrown away, and fetched back.** It drags anywhere with pointer
  events, remembers where it was put, re-clamps into view when the window changes size, and opens
  its panel from whichever corner it is nearest. Dragging it over the bin that appears during a
  drag throws it away entirely; a bag button appears in the header — the one place always on
  screen — to fetch it back to where it was left. Nothing counts as a drag until the pointer has
  travelled 6px, so a tap still opens it.
- **Three ordering bugs in that, all found by driving it:** the panel measured the launcher *after*
  hiding it and so opened in the opposite corner from a zero-sized box; throwing the bag away
  immediately un-hid it, because the close it triggered re-decided the launcher's visibility; and
  restoring put it back where the bin was rather than where it had been left.
- **The learning side keeps the examiner's spacing.** It had been running 18 / 13 / 8 / 29 / 54
  between its parts against the examiner's flat 26, which is why it read as airier and less
  deliberate. One rhythm now: 26 inside a block, 40 between blocks.
- **The audit is clean for the first time.** `button#brand-home` had been reported under the 44px
  floor since before this pass and is now 44 at every width. Zero overflow, zero tap-target, zero
  radius and zero ragged findings at 375 and 1280 with the bag open.
- **Three more defects, all found by verification.** Two tap targets under the project's 44px floor
  — the calculator's Normal/Scientific toggle at 30px and the bag's close button at 29px — which
  the first audit missed because it ran with the bag shut. And `has-resume-bar` outlived the
  dashboard, so anything positioned around that bar went on making room for a bar that was not
  there.
- **Deferred, by the owner's instruction ("everything except SCLM"):** the two SCLM Section B
  numericals still blocked behind authoring `SCLM-M03-L06`'s lesson, and the two SCLM prompt-variety
  warnings (Section A forces 14 questions to share one prompt, Section C forces 3).
  `npm run check:exam` names all four every run; nothing outside SCLM is outstanding.
- Gates: `node --check app/t6.js`, `npm test` **39/39**, `npm run check:palette` clean in both
  themes, `tools/validate_t6_bank.js` `ok: true`.

## 2026-08-13 — SPMS Section B completed and un-broken; the exam-pattern gate that found it

- **`npm run check:exam` — a gate and an authoring worklist in one.** `tools/check_exam_readiness.mjs`
  reads `EXAM_PAPERS` out of `app/t6.js` rather than keeping a copy, and multiplies the paper by the
  bank: sections that cannot be filled and what they cost in marks, negatively marked sections that
  are free, uniform answer shapes, positional cues, and prompts *forced* to repeat. It prints
  `N × type for SUBJECT Section X`, soonest paper first. Built before authoring, on purpose.
  Its first version passed SCLM Section A — the very section whose 16 identical prompts motivated it —
  because a 60%-distinct ratio hides forced repeats; it now measures forced repeats directly.
- **Section B is 20 of 20 and no longer free (LAW-53 closed).** Twelve items authored on the eight
  SPMS lectures that had a lesson but no MSQ, some carrying a second item on a different aspect, with
  `SPMS_MULTI` gaining an optional `variant` so two items can share a concept without the second
  silently overwriting the first.
- **The section was gameable two ways and both are shut.** Every one of the original eight was
  3-correct-of-4 *with the wrong option at index 3*, so ticking everything scored full marks and so
  did ticking A, B, C without reading. With 4 options and 2 marks a 3-of-4 pays `min(2, 3−1) = 2`;
  every 3-correct item therefore gained a fifth option, since 3-of-5 pays 1. Shapes are now
  `3-of-5 ×12, 2-of-4 ×6, 2-of-5 ×2` with varied positions. **Verified in a browser: ticking every
  option on all twenty and answering nothing in Section A scored 12 / 40, down from 16 / 16.**
- Two items were first written as 1-of-4 — not free, but the bank validator rightly rejects a
  select-all with one answer as a single-answer question in disguise. They became 2-of-5, which is
  also not free. `validate_t6_bank.js` is `ok: true` against the transcripts, LAW-49 vocabulary gate
  included; 39/39 tests pass.
- **SCLM's z-based method is confirmed taught** — `SCLM-M03-L06` ("Q Model"), with standard normal
  tables and a full worked continuous-review example. That closes a standing uncertainty. The two
  outstanding numericals follow from its own figures, but **`SCLM-M03-L06` has no lesson**, so they
  are blocked behind authoring one rather than being written against an untaught lecture.

## 2026-08-12 — The examiner becomes a product, and its dashboard says where knowledge breaks down

Evidence: `evidence/2026-08-12/t6-examiner-product-and-insights/verification.md`
(`VERIFIED(REAL_BROWSER + AUTOMATED)`, 1280×720 and 375×812; no screenshots — the Browser pane was
not compositing, so pixel-level acceptance is still owed).

- **The examiner has its own front door.** `exam-home-screen`: four papers, three seeded sets each,
  reachable without any learning state — "jump straight in". Both honest warnings moved *ahead* of
  the clock: IBM's caveat and the bank shortfalls (SPMS Section B has 8 of 20, SCLM Section B 4 of 6)
  are stated on the card before a candidate commits two hours. A set's seed comes from subject + set
  index, never the clock, so a paper survives a refresh; verified that sets 0/1/2 are different
  papers and that set 0 rebuilds identically.
- **A diagnostic dashboard, not a score.** Pacing against the paper's own per-question budget;
  *where knowledge breaks down* per concept, read off the `skills` each question exercises (100% of
  the 804-question bank carries them); the cost of speculative ticking under negative marking; second
  thoughts and their value; and, for written answers, course-vocabulary use and rubric points. Each
  block ends in a verdict a learner can act on.
- **The diagnosis only claims what the paper tested.** The scored bank asks for apply / distinguish /
  connect; recognise and explain belong to primers, which never appear on a paper. The first draft
  told learners "you can say what it means but not use it on a case" when nothing had tested saying
  what it means. It now reports the observed pair — hardest thing right, easiest thing wrong — and
  says only that.
- **Per-concept route back into the learning system.** Each breakdown row starts a taught run for
  that one concept. Verified the queue is `LESSON → primer → questions`: LAW-47 holds on the new
  route. The bulk "what the mock exposed" button remains.
- **Attempt history**, and a comparison shown only when the *same* set is re-sat, since two different
  draws differ in difficulty as well as in study. Stored as summaries, never responses.
- **`REDLINE` LAW-53 — Section B is free.** All eight authored SPMS MSQs are 3-correct-of-4, so
  ticking every option scores full marks. Verified in the browser: all four options ticked on all
  eight questions, nothing answered in Section A, `Section B 16 / 16`. The paper's stated rule says
  the opposite, and the dashboard had been calling it "rational". The bank fix needs transcripts and
  owner acceptance and is **not done**; what is done is that the examiner now detects the condition
  and warns the candidate it is a defect in the mock, not a strategy for the exam.
- **`WATCH` LAW-54 — the legend counted the whole paper above a one-section grid** ("42 Not visited"
  over 35 chips). Fixed; legend and palette now agree in every section.
- **Sixteen questions on one paper shared a character-identical caselet and stem.** Measured on SCLM
  Section A: 50 questions, 22 distinct caselets, 20 distinct stems. The pool holds 52 for a section
  needing 50, so selection cannot fix it — a bank-volume gap, recorded. The draw is now round-robined
  across identical visible prompts, which cut the longest run of identical stems to 1.
- **Telemetry contract extended to the examiner, and still not transmitting.**
  `tester-event.schema.json` → `1.1`: six examiner event types, banded-only fields, and a **separate
  consent scope** so agreeing to learning telemetry does not enrol a tester in exam-performance
  collection. A contract rule and a matching validator check reject a scope/event mismatch in both
  directions. The app shapes and locally buffers events behind a flag defaulting to **off**; there is
  no fetch, beacon, or drain. An event captured from a real attempt validates with zero unknown or
  forbidden fields. `deployable: false` unchanged; 39/39 tests and the palette gate pass.
- **Disclosure:** `profile.examAttempts` syncs to D1 with the rest of the profile, so mock summaries
  now reach the learner backend. `docs/community/PRIVACY.md` updated.

## 2026-08-12 — Dungeon, the examiner: a mocks platform beside the learning system (branch, not merged)

- **Two products, one bank.** The learning system sequences to teach — lecture before test,
  weak-first, feedback on every answer. The examiner does none of that on purpose: no primers, no
  lessons, no feedback while the clock runs, and questions spread randomly rather than
  pedagogically, because acclimatising to an exam means meeting a question you were not prepared
  for. Seeded shuffle, so a reload does not reshuffle the paper mid-attempt.
- **The paper shape is `docs/briefs/T6_EXAM_PATTERN.md` and nothing else.** Sections, counts,
  per-question marks, 120 minutes, negative marking, and calculator rules are all read from the
  authority. SPMS gets no calculator, BRGSA a normal one, SCLM a scientific one — offering a tool
  the real paper forbids would train a habit the exam then removes.
- **The furniture a candidate expects**: section tabs, countdown plus per-question timer, the
  five-state question palette, mark-for-review, clear response, previous / save-and-next, submit
  with confirmation, and auto-submit at zero. Each palette state carries its own **shape** as well
  as its own colour — this is the densest colour-coding in the product and the worst case for
  relying on hue alone.
- **Scored by the paper's rules.** SPMS Section B: +1 per right option, −1 per wrong, floored at
  zero per question **and capped at the question's marks**, so an item carrying three correct
  options cannot pay out more than the two marks the paper says it is worth. Match is
  all-or-nothing, because the paper states no partial credit and inventing one would teach a wrong
  expectation about the real thing. Written answers are excluded from the machine total and
  returned for self-review rather than guessed at.
- **It says when it cannot be a full mock.** SPMS Section B has 8 of 20 MSQs and SCLM Section B has
  4 of 6 numericals; the brief states this before the clock starts and the result scores out of
  what is actually there, not out of the paper's nominal total. IBM carries a caveat instead of a
  paper: ten written answers on a caselet released two days beforehand cannot be mocked, because
  the case *is* the paper. Padding an MSQ section with MCQs would have been the worst option
  available — it is the only negatively marked section in the term.
- **The one link back to learning.** Concepts missed under exam conditions are recorded in
  `profile.examMisses` and become a curated route, "Fix what the mock exposed", ordered by weight
  (a wrong answer counts double a blank) and taught before being tested again. They are stored
  **apart from `conceptAttempts`** deliberately: a timed, unassisted, uncoached paper is the
  opposite of the conditions the evidence model is calibrated on, so a bad afternoon cannot rewrite
  a mastery record and a lucky guess cannot award Strong. Misses prioritise; they never score.
  Verified: `conceptAttempts` and `totalAnswers` are both 0 after a submitted mock.
- **Defects found and fixed while building it**: match questions use `rows`/`choices`, not `pairs`,
  so Section C rendered zero rows; `caselet` is null on some question families and `typeof null` is
  `"object"`; numeric items carry the scenario in `stem` and the actual ask in `prompt`, and showing
  only one lost either the context or the question; and the repair run called `renderQuestion()`
  and `showScreen()` directly instead of `beginPractice()`, so it opened with the markup's
  placeholder "Title" still in the header.
- **Graph draw-on was missing for exactly the person who sees it first.** A learner with no data
  gets the empty state of every chart, and those are dashed placeholder paths — which had been
  excluded from tracing because `stroke-dasharray` already carries meaning on them (the distance
  still to go). They are wiped instead: an animating clip reveals them left to right and leaves
  every dash untouched. The trend chart's empty branch also returned before `drawOnce`. One caught
  defect worth naming: the first version held the clipped state on the rule itself and ended on a
  negative `inset()`, which is invalid — so the animation was dropped and the lines stayed clipped
  to nothing. The hidden state now lives only inside the keyframes, the same rule the block
  reveals already follow.
- **Verified** at 375×812 and desktop, both themes, across the brief, runner, and result: 0
  overflow, 0 tap targets under 44px, 0 off-scale radii, submit reachable without scrolling, and
  the palette moved above the question on mobile — it had been landing at y=772, below every
  option, so jumping to question 40 of 55 meant scrolling the whole of question 1 first. 39/39
  tests pass.

## 2026-08-12 — Dark mode, real tooltips, motion, device switching, mobile pass (branch, not merged)

- **Every colour in `app/t6.css` is now a token, and every token is a light/dark pair.** The file
  held 85 distinct hex values across 113 occurrences, 46 bare `white` keywords, and 32 `rgba()`
  literals. Ten of those greys all meant "secondary text on the dark hero" and nine all meant
  "hover hairline". Below `:root` there are now **zero** literal colours. Themes are declared once
  with `light-dark()` rather than as a second copy of the palette; the switch is a single
  `color-scheme` change on `:root`, which also darkens native controls, scrollbars, and the caret.
  Depending on `light-dark()` is safe here because the answer feedback already relies on `:has()`,
  which shipped later in every engine.
- **`--ink` was doing two jobs that move in opposite directions** — text colour *and* the fill of
  the hero, results hero, resume bar, toast, mock set card, and brand mark. Split into `--ink` and
  `--deep`/`--on-deep`. In the dark theme the deep panel goes *below* the page rather than above it
  and carries `--deep-edge`, because at night the luminance step alone (1.07:1) cannot draw a shape.
- **`--focus` was used at t6.css:542 and never defined**, so the match-board focus ring had been
  falling back to `currentColor`. Defined and applied.
- **The palette is measured, not eyeballed.** `tools/check-palette.mjs` parses the `light-dark()`
  pairs out of the real stylesheet — not a copy, which would pass forever after the CSS moved on —
  and runs 140 checks per run: WCAG AA on every text/surface pairing the UI actually draws, 3:1 on
  marks and focus rings, plus grayscale and the three Machado colour-vision simulations. All
  required checks pass in both themes.
- **It failed on the *existing* light palette, and that finding stands.** Green, amber, and red sit
  within 1.2:1 of each other in luminance, and under deuteranopia Developing and Needs practice are
  0.05 apart in OKLab — not a visible difference. So the four evidence states are now four
  silhouettes: filled disc, half-filled disc, diamond, empty ring. The hues are unchanged (re-hueing
  an accepted, deployed palette is not a side effect dark mode gets to have); shape carries the
  state and colour reinforces it. The checker asserts the four remain shape-distinct.
- **The reported "hovers on the i's show nothing" was real and worse than reported.** Recorded as
  **LAW-51**. All seven explanatory affordances used the native `title` attribute, which never fires
  on keyboard focus or touch — so every explanation in the app was unreachable on a phone. Replaced
  with one shared `.tip` bubble: hover after 120ms, focus immediately, tap, Esc to dismiss, clamped
  to the viewport with an arrow that tracks the trigger. `title` count is now 0.
- **Appearance control**: three states, so "follow my device" survives being pressed once. Bootstrapped
  from a new `app/theme.js` loaded synchronously in `<head>` — it cannot be inline because the
  release serves `script-src 'self'`, and it cannot wait for `t6.js` at the end of `<body>` without
  rendering the wrong theme first. Stored outside the learner profile on purpose: the profile syncs
  to D1, and a theme belongs to the device you are reading on.
- **Canvas cannot inherit a custom property, and `getPropertyValue('--blue')` returns the literal
  string `light-dark(...)`** rather than resolving it. The radar reads its palette through a hidden
  probe element at paint time and repaints on theme change, including a system change at sunset.
- **Motion**: one entrance cascade over what is already on screen, SVG line-drawing for the charts,
  a radar that grows from the centre, and press feedback. Deliberately *not* scroll-triggered — a
  dashboard opened many times a day fails the frequency-of-use rule, and any safety net generous
  enough to rescue a stuck node also fires before the learner scrolls to it. Nothing is hidden by
  default: `.reveal-pending` is applied by script immediately before use, so a blocked script leaves
  the page fully readable. `.route-full` is excluded from tracing because `.draw-in` would overwrite
  the dashes that mean "distance still to go".
- **A learner can move between devices without waiting for the owner.** Progress already followed
  the email through D1, but the one-active-browser rule answered with "sign out there", which nobody
  can do from a device they did not bring. `releaseOtherDevice` ends the other session and claims
  this one; progress is untouched, and it is still exactly one active browser. The country lock is
  checked first and is deliberately not bypassable — tested both ways.
- **Buttons no longer stack their label above their arrow.** `.button` is `inline-flex` with
  `nowrap`; the resume bar's "Go →" went from 48×56 (three lines) to 67×44.
- **Mobile pass, measured with a new `tools/browser-checks/ui-audit.js`.** At 375×812 the first
  option began at y=533 and the submit button sat at y=1183 — 370px below the fold — with 140px
  spent on two stacked headers showing the brand, a sparkline, and the appearance control
  mid-question. The global header is now hidden while a question is open, the action is a sticky
  footer, and the keyboard hint ("1–4 or arrow keys") is hidden on `pointer: coarse`, where it was
  34px of a sticky bar telling a thumb about arrow keys. The action bar is 76px and the submit
  button is reachable without scrolling.
- **Scale drift, recorded as LAW-52.** Nineteen literal corner radii against a four-step scale
  documented in a comment, and eighteen literal font sizes including 9px and 10px. All corners are
  now tokens; the type floor is 11px.
- **Verified** at 1280×800, 966×910, and 375×812 in both themes on the dashboard and question
  surfaces: 0 overflow, 0 tap targets under the floor, 0 off-scale radii, 0 ragged rows, no
  horizontal scroll. 39/39 tests pass (two new). Evidence:
  `evidence/2026-08-12/t6-dark-mode-and-mobile/verification.md`.
- **Owed:** no screenshots — the Browser pane was not compositing, so pixel-level acceptance is
  still outstanding, as it was for the lesson surface. `app/login.css` and `app/admin.css` keep
  their own light-only palettes and have not been ported. Tester-visible, so it owes a change
  announcement.

## 2026-08-12 — Homepage restructured around four questions (branch, not merged)

- **The homepage now asks four questions and answers each once:** what am I doing, where can I
  start, how am I doing, additional resources. Owner direction, recorded as **C30** in
  `DESIGN_SOURCE_INDEX.md`, superseding the C26/C27 ordering and reinforcing C28.
- **Counted the duplication before removing it.** Generic practice had three entry points that all
  called `openPracticeSetup()`; "Build your own practice" appeared as a summary and again as the
  `<h2>` immediately inside it; sixteen concepts were listed twice, and the evidence explaining why
  one needed work lived **only** in the copy that could not act on it; "N of 16 strong" appeared
  twice; subject identity in seven places; hide/show nested three deep.
- **Deleted as duplicate views, not as features.** `stage-tabs`/`stage-panels` with
  `setDashboardView()` and `bindStageTabs()`; `renderConceptMap()`, `showConceptInspector()`, the
  module stepper and the inspector panel; `#start-selected-mock`; the second "N of 16 strong";
  the four story-stat cards; the `.momentum-card` nested inside the dark hero. Every capability
  survives — the inspector's summary, evidence list, and confidence note now sit on the concept
  row itself, behind the concept's own name.
- **The hero withdraws its own duplicate.** `renderRecommendation()` hides whichever "way in" the
  call to action is already offering, so the same action is never presented twice. Verified in
  both states: priority withdrawn on a seeded profile, "start from the beginning" withdrawn on a
  fresh one.
- **Verified.** Injected layout probe at 1280×800 and 375×812: **0 findings** at both. One real
  defect found and fixed (`#subject-sort` was a 32px tap target, under the 44px floor; pre-existing).
  17 candidates rejected as probe artifacts under LAW-46 — all inside the deliberate `.course-grid`
  swipe scroller, with the document proven not to scroll horizontally. LAW-36 measured in both
  directions on all three toggles: `hidden` ⟺ `height: 0`. LAW-47 in-page: `ok: true`, 0 violations
  across sets 1–9 and the mixed builder. `npm test` 37/37, build clean, net −21 lines.
  Evidence: `evidence/2026-08-12/t6-homepage-four-questions/verification.md`.
- **Owner review, same day, two rounds.** Block 1's heading became **"Your next step"** — chosen
  over "Today's focus" because the app models three time horizons, so "today" is wrong for anyone
  on the seven-day plan, and because the results screen already uses the phrase. The radar had
  **no axis labels at all**: five unlabelled spokes where the fifth is not a subject. Names are now
  drawn at each vertex (inline, not hover — hover does not exist on touch), values deliberately left
  to the list beside it so the same fact is not stated twice, and the labels are clamped into the
  canvas because "Connections" is 70px against a 21px "IBM" and is clamped at every size tested.
  The canvas was also an unnamed `role="img"`; it now carries a real `aria-label` that says plainly
  Connections is not a subject.
- **Mobile pass.** The subject swipe row had no cue that more cards existed — an edge fade now
  paints only on the side that still has cards behind it, and not at all where the row does not
  scroll. Mastery values went 11px/12px → 12px/14px below 700px with the column minimum widened so
  nothing is pushed out. A `.resume-bar` re-offers the recommended action once the hero scrolls
  away; it reads its label from the hero button and delegates the click to it, so it is a shortcut
  and not a second recommendation.
- **Two measurement artifacts recorded** under LAW-46, both of which nearly became false fixes: CSS
  opacity sampled at time zero of a 180ms transition, and `scrollIntoView({behavior:'auto'})`
  appearing to do nothing because `scroll-behavior: smooth` wins.
- **Deferred.** No screenshots — the Browser pane was not compositing, so acceptance is DOM and
  computed-style level and a pixel pass is still owed. The route chart's new dark-surface colours
  were reasoned, not contrast-measured. Nothing is pushed, merged, or deployed; the branch is
  `redesign/homepage-four-questions` and the live cohort is untouched. A change announcement is
  drafted and owed when this ships.

## 2026-08-12 — Numeric entry for SCLM Section B

- **Added the second missing format.** SCLM Section B is 6 numericals worth 24 marks — 30% of that
  paper — and the app had no way to take a typed figure. Marks there go to the final answer within a
  stated tolerance, with none for working, so the surface grades exactly that: a number against a
  per-question tolerance, no options to eliminate and no credit for method.
- **Tolerance is per question and must exceed zero.** Exact float equality would fail honest
  arithmetic, so the validator rejects a tolerance of zero rather than letting one ship.
- **`nearMisses` name the method, not just the miss.** A figure matching a known wrong approach gets
  that approach explained — dropping the 2 under the EOQ root, charging holding on the full order
  rather than Q/2, inverting the critical ratio, carrying the smoothing correction the wrong way. The
  validator rejects a near-miss that overlaps the accepted band, since that would mark a right answer
  wrong.
- Four items authored: exponential smoothing, EOQ quantity, EOQ total cost, and the newsvendor
  critical ratio. Scenario numbers are fresh — the paper states every question is self-contained —
  but the *methods* are the course's own, taken from the lessons already authored against those
  lectures rather than from standard textbook forms.
- **A dimensionless answer must say so.** The critical ratio has no unit, and the first draft of the
  gate demanded one unconditionally. Rather than invent a fake unit, a question may declare itself
  dimensionless, and must then say in its prompt what form to enter. An omission and a ratio should
  not look identical to the gate.
- `VERIFIED(REAL_BROWSER)`: the input renders with its unit and tolerance, commit stays disabled
  until a figure is present, `1,176` parses through the comma and is diagnosed as the specific wrong
  method, and `1224.4` is accepted inside a ±1 band. No console errors.
- Deferred: two more items are needed for Section B's six. Safety stock and service level are the
  obvious candidates since the paper supplies standard normal tables, but it is **not yet confirmed
  that SCLM teaches the z-based formula** — that must be checked against the transcripts first.

## 2026-08-12 — Subjects ordered by the timetable, and by where the learner is weakest

- **The subject rail is now a timetable.** Order defaults to the order the papers are sat — SPMS
  (Sat 22 Aug 09:00), BRGSA (Sat 22 Aug 13:00), IBM (Sun 23 Aug 09:00), SCLM (Sun 23 Aug 13:00) —
  and each card carries its day, sitting time, and total marks. A new profile now opens on **SPMS**
  rather than BRGSA: the first paper sat, not the first alphabetically. Both papers on a day run back
  to back, so the sitting order is a real constraint on revision, not a preference.
- **Negative marking is a permanent mark on the card**, not a line of copy to remember. SPMS is the
  only paper with it, and it is the one rule that changes how you answer.
- **A second order, "Hardest for you"**, sorts by weakest evidence first using the learner's own
  attempts, with the sitting order as a stable tie-break so the list is not accidentally alphabetical
  before any practice exists. Sorting is presentation only — it never changes what is scheduled
  inside a subject, so switching it cannot alter anyone's practice or evidence. The choice persists.
- The day-boundary marker only renders in exam order, where it means something; in any other order it
  would mislead.
- `VERIFIED(REAL_BROWSER)`: exam order renders the full timetable with the boundary at IBM; seeding
  BRGSA and SCLM with evidence moves IBM ahead of BRGSA and SCLM last under "Hardest for you", while
  exam order stays fixed. Preference persists across reload. No console errors. Synthetic data was
  seeded on the `127.0.0.1` origin and cleared afterwards, so the owner's `localhost` session was
  never touched.

## 2026-08-12 — Control Room: force sign-out that preserves progress

- **Added a sign-out control that is deliberately narrower than revoke.** `revokeTester` deletes the
  tester row, and both `learner_progress` and `learner_sessions` cascade from it, so revoking has
  always destroyed the learner's saved work. The new `signOutTester` / `signOutTesters` clear session
  rows only: the tester stays approved, every byte of progress survives, and their next visit is a
  normal sign-in that resumes where they were. The country lock is deliberately untouched — signing
  someone out is routine, clearing a lock is a security decision with its own control.
- **Per-tester and bulk.** A row-level `Sign out`, and a toolbar `Sign everyone out` for the
  "release changed, send everyone back through sign-in" case. The bulk path excludes the owner, so a
  mistake cannot lock the owner out of the Control Room that issued it.
- **Live session counts are surfaced in the same payload the row already renders**
  (`countActiveSessions`), because otherwise `Sign out` is a control with nothing to act on — the
  owner could not tell whether it would do anything or whether it already had. A tester with one
  session shows `Signed in`; more than one shows `Signed in ×N` in alert styling, since that means
  the same email is open in several browsers. With zero sessions the button is not rendered at all
  rather than offered as a no-op.
- Two tests added (35 → 37). The first proves the actual promise end to end: write progress, sign
  out, confirm the old cookie is rejected with 401, sign back in, and assert the restored state is
  byte-identical. The second proves the bulk path clears tester sessions and never includes the
  owner. The memory store mirrors the real contract — sign-out touches sessions and nothing else — so
  the test exercises the guarantee rather than a convenient fake.
- `VERIFIED(REAL_BROWSER)` for the UI: rows with 1, 3, and 0 sessions render the chip and control
  correctly. Console 404s during that check are the Worker-backed API routes absent from the static
  dev server, not a regression.

## 2026-08-12 — Exam pattern received; coverage plan reversed before authoring

- **`EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` is closed.** The owner supplied the Batch 1 pattern for all
  four papers. Recorded as authority in `docs/briefs/T6_EXAM_PATTERN.md`. Structure — sections,
  counts, marks, duration, negative marking, calculators — may now be stated as fact. Question
  content, difficulty, topic weighting, a likely score, and pass probability remain unclaimable.
- **The plan to author 191 uncited lectures was stopped before any of it was written.** Checked
  against the pattern, uniform lecture coverage is the wrong instrument. Three findings:
- **Two required formats do not exist in the app, and they carry 64 marks.** SPMS Section B is 20
  negatively marked multiple-select questions — 40 marks, **53% of that paper** — and SCLM Section B
  is 6 tolerance-graded numericals worth 24 marks, 30%. The bank supports MCQ, cloze, case-cloze,
  match, short-answer, and boss; it has neither MSQ nor numeric entry. Building those two beats any
  volume of further MCQ authoring.
- **IBM's paper has no objective section at all** — ten subjective answers on a caselet released two
  days before. Its 196 MCQ-derived surfaces contribute nothing to it, and the 62 uncited IBM
  lectures I was about to author would have added zero marks. That was the single most expensive
  assumption in the previous plan.
- **Two alignment defects logged against the existing bank.** BRGSA's paper guarantees every question
  is self-contained with no Clairo or Zoko figure to recall, so bank items testing recall of one
  train a skill the exam excludes; the bank has not been audited for this. And SCLM carries 24 marks
  of computation with supplied normal-distribution tables, while only 3 of its 16 cited lectures
  carry arithmetic.
- Also measured, and the reason the question came up: the bank asks about **92 of 283 lectures
  (32.5%)**. IBM, SCLM, and SPMS each concentrate ~196 questions onto 16 lectures — a median of 15
  each — while 62 to 68 lectures get none. BRGSA is the healthier shape at 44 lectures, median 2.
  Corrected a mistaken assumption while measuring: concepts are assigned by a module-scoped regex
  (`t6_catalog.js`), so new questions bucket into existing concepts and broader coverage needs **no**
  concept-model change.
- Nothing authored this session beyond the record itself. Exams are 22–23 August 2026.

## 2026-08-12 — Teaching layer complete: every scheduled question is now taught

- **Closed the 0→80 path.** SCLM and SPMS were the two subjects still untaught. 26 lessons authored
  from the clean transcripts takes SCLM from 6 of 16 cited lectures to 16 of 16, and SPMS from 0 to
  16 — so scheduled questions fully taught goes from **433 of 724 to 724 of 724**, and 106 lessons
  are authored in total. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
  `evidence/2026-08-12/t6-teaching-layer-complete/verification.md`.
- **LAW-47 verified across all four subjects**, not just the one that changed: the teach-before-test
  check evaluated in the page from an empty `lessonsRead`, across all 9 study sets per subject plus
  the mixed builder — 595 queue items, zero violations. SPMS study set 1 now opens
  `lesson:SPMS-M01-L10` before its primer and every scored question.
- **Every figure was grepped against its lecture before being written.** Rajashree Cement's 99-hour
  rake cycle with 13 hours of locomotive detention inside it, the ₹3,800/hour penalty and the
  142,800 extra tons a year; Laxmi Transformers at ₹548 a ton by rail against ₹260.3 by sea, and the
  bounding argument that computes inventory only for the highest-inventory option; FarmAid's
  scenarios clustering between ₹8.5 and ₹8.75 lakhs, where the recommendation turns on Ahmedabad
  already existing rather than on cost; Akshaya Patra's 40,000-rated roti machine running at 35,000.
- **Three defects found while doing it.** (1) LAW-50 recurred — an `explainer` array closed with
  `},` — caught by `check_lesson_file.mjs` before the bank validator, which is exactly why the
  protocol orders the gates that way. (2) The vocabulary gate raised a **false** invented-vocabulary
  warning: it builds `\b<term>\b`, so the singular `public private partnership` could not match the
  plural-only `public private partnerships` that occurs three times in the SCLM transcripts. Fixed
  in the lesson by using the course's own plural; the gate limitation is recorded as a Known Gap.
  (3) `SPMS-M06-L08` is titled "Traceability" but the word appears only in its header — the body
  teaches the customer → product → project requirements chain. The lesson was authored for what the
  lecture teaches rather than inventing content to match its label.
- Regression: 35 tests pass, `build-site.mjs` prepares 15 assets, `validate_t6_bank.js` reports 0
  errors and 1 warning (the pre-existing IBM option-length cue), no console errors.
- Deferred: no screenshots — the Browser pane was not compositing, so pixel acceptance of the lesson
  surface is still owed. 177 uncited lectures across IBM, SCLM, and SPMS remain unauthored by
  choice; no question cites them, so a lesson there is never delivered. All 106 lessons stay
  `WAITING_OWNER_CONTENT_ACCEPTANCE`, now the largest block of unaccepted content in the product.

## 2026-08-12 — Collaboration handoff: `AGENTS.md` corrected, branch published

- **Published `reorg/structure` to GitHub so a second contributor can work.** Nothing merged to
  `main`, so nothing deployed and the live cohort is untouched. Verified before committing: 35 tests
  pass, `node tools/build-site.mjs` prepares 15 public assets, `node --check` clean on all five T6
  scripts, and `node tools/validate_t6_bank.js "<transcripts>"` reports **0 errors and 3 warnings**.
- **Corrected the index against the working tree, which had moved past it.** `AGENTS.md` still
  described a mid-session state: it claimed 50 lessons and "233 of 283 lectures still have no
  lesson", with IBM/SCLM/SPMS at 100% untaught. The real numbers are **80 lessons authored** — BRGSA
  50 of 50 lectures, IBM 16 of 16 *cited* lectures, SCLM 6 of 16, SPMS 0 of 16 — and **433 of 724
  scheduled questions fully taught**. BRGSA and IBM are complete for everything a learner can reach.
  Known Gaps, Key Files, and the status paragraph now carry those figures with an instruction to run
  the gates rather than quote the file.
- **Repointed the documented source of truth from the AI-Ready Pack to the clean transcripts.** The
  code had already moved (`tools/lib/clean_transcripts.js` is now the single loader) but the index
  still sent a reader to `graph_source/`, `dense/`, and `indexes/` — the layer LAW-49 exists to catch
  content authored against. The Directory Map now documents the transcript layout, that a lecture's
  identity is its **position** in the module file rather than its recording code, and that the old
  pack remains readable but is not authority.
- **Found and documented a silently-green gate.** `node tools/validate_t6_bank.js` with *no* path
  argument returns `ok: true` with an empty `"coverage": {}`: the entire lecture-source block is
  skipped, including the LAW-49 vocabulary gate, while still reporting success. A wrong path
  correctly fails. `npm run validate:bank` passes no argument, so the script a new contributor would
  naturally run is the one that verifies nothing. Documented in the baseline checks and the new
  collaborator section; the tool contract itself is **not** changed here and is filed as follow-up.
  Same failure family as I47 — the failure mode is silence, not a warning.
- **Added a collaborator section to `AGENTS.md`**: `main` is the deploy trigger and must not be
  pushed to directly; what runs straight from a clone (`npm test`, `build-site.mjs`, `server.py`);
  what needs the external transcripts and why they cannot be committed; and that absent
  `data/state/` is by design, not a bug.
- **Corrected a stale production claim** left inside the 2026-08-11 status paragraph, which still
  said the live site served `475837f`. The 2026-08-12 deploy note above it already recorded `0cc2c6d`
  live as Worker version `c602c4b3`; the two now agree.
- Deferred: the IBM option-length cue (correct answer at length-rank 3 in 45% of 68 sampled
  questions against a 25% baseline) is recorded as a Known Gap, not fixed. The 8 IBM lessons for
  uncited lectures are harmless but are never delivered and must not be counted as coverage. Lesson
  pixel-level acceptance is still owed.

## 2026-08-12 — Teaching layer: the 0→80 path

- **Diagnosed why the app only served people who had already studied.** The bank generates ~12.8
  surfaces per concept by recombining four harvested sentences, so a cold learner's first contact
  with any idea was a scored item in vocabulary nothing had introduced. Measured: a case question's
  own primer introduced **19%** of that case's vocabulary on average, none at all in 10 of 64 cases;
  **59 of 64** case questions had zero same-concept distractors, making them answerable by topic
  matching and unanswerable by reasoning; 9 explained a different lecture than they tested; and the
  correct answer to one shipped question used "stopping rule", a phrase appearing **0 times** in 50
  BRGSA transcripts.
- **The teaching material already existed and was ~2% used.** The external Term 6 pack holds 92,489
  dense words for BRGSA alone across 50 lectures, each with key terms, objectives, and worked
  examples with real numbers. Added `tools/build_t6_lessons.mjs` to extract candidates and
  `app/sets/t6_lessons.js` to hold authored lecture-grain lessons — objective, explainer, worked
  example, glossary, handoff. **BRGSA is complete: 50 lectures across all 8 modules.** Every lesson
  is written from that lecture's own transcript, using its own numbers — Clairo's ₹3,200 blended CAC
  against ₹10,000 on LinkedIn, the 33% signup-to-activation constraint, the 70/20/10 capacity split,
  the 12-week roadmap's five columns. The extractor supplies candidates and provenance; the prose is
  authored, because the dense files are transcript bullets and some are incoherent out of context.
- **Teach before testing is now a scheduling invariant.** `layeredQueue()` places a lecture's lesson
  ahead of the first scored question citing it, ahead of the primer. Lessons are unscored, create no
  evidence, and are recorded per lecture in `profile.lessonsRead`.
- **Distractors compete on reasoning again.** `relevantWrong()` fills from the same concept first and
  only trades a relevant option for a length-matched foreign one while the set would otherwise cue
  the answer by length. Result: 0 of 64 case questions have zero same-concept distractors (was 59),
  all 64 carry at least two, and the option-shape guard still passes with zero errors.
- **Applied questions explain what they tested.** `conceptData()` now carries `caseSource`,
  `caseExplanation`, and `caseLink`, so a case cites and reinforces the lecture its case came from.
  The originating example moved from `BRGSA-M02-L01` to `BRGSA-M02-L02` and its correct-answer
  feedback changed from the null hypothesis to sample-size noise.
- **A vocabulary gate keeps it true for lectures authored later.** `tools/validate_t6_bank.js`
  measures first use against the lossless `graph_source/` transcripts rather than the concept index,
  which is unreliable for this (it reports "sample size" first seen at M02-L03 when M02-L02 is the
  lecture titled "Sample Size Logic"). The gate caught three real authoring errors this session,
  including an invented "sampling bias" — the course names social desirability, hypothetical,
  acquiescence, leading question, and researcher confirmation.
- **Repaired the question this work started from.** `sample_logic` asked what to do when a variant
  leads after 18 visitors, and its *correct* answer read "Continue to the planned sample bound unless
  a pre-registered stopping rule applies" — "stopping rule" appears 0 times in all 50 BRGSA
  transcripts, and "sample bound" is not used until M08-L03, six modules after the question. Rewrote
  it in the course's own M02 words: "Run the test to completion at the pre-calculated sample size"
  (the lecture says *sample size should be pre-calculated, you should test run to completion, no
  peeking*). The shorter answer also cleared the length cue that had been excluding the question —
  `excludedLegacyMcqs` 37 → 36, scheduled questions 151 → 152.
- **Closed a hole in the invariant itself.** Re-running LAW-47's verify step against a live queue
  (rather than trusting the code comment) showed a primer could still precede its own lecture's
  lesson: `layeredQueue()` gated on the scored question's lectures and then pushed the primer
  unchecked, but a primer is separately authored and cites different lectures —
  `brgsa_m1_demand_primer` cites M01-L01 while the `survey_bias` it introduces cites M01-L05, so the
  primer ran at step 4 against a lesson arriving at step 9. Extracted `teachFirst(surface, conceptId)`
  and applied it to the primer on its own terms. Verified from an empty `lessonsRead` across all 9
  BRGSA sets and the mixed builder: zero violations.
- **Coverage is reported, never rounded up.** The validator prints the untaught backlog: **BRGSA 0 of
  152** scheduled questions untaught, 33 of 33 cited lectures taught; IBM/SCLM/SPMS still 100%.
- **Verification.** `VERIFIED(REAL_BROWSER + AUTOMATED)` at
  `evidence/2026-08-12/t6-teaching-layer/verification.md`. 35 tests pass, the bank validator is
  clean, the build ships 15 assets. One defect was found in the browser and fixed: `ensureReattempt`
  treated a lesson as a re-attemptable surface and put a sample-size case ahead of its own lesson.
- **Made the work handoff-able, because one session cannot finish 283 lectures.** The procedure had
  been living in session context — which figures to grep, which gates in which order, why the browser
  check cannot be a unit test. Three artifacts move it into the repository:
  `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` (sources, lesson contract, batch procedure, gates,
  the four traps already paid for, per-subject definition of done);
  `tools/check_lesson_file.mjs`, which reports **every** structural defect in one pass instead of the
  parse-fix-reparse loop that cost this session the most time, and — given the pack — prints the
  exact next batch of lectures to author, so a cold session can resume mid-subject; and
  `tools/browser-checks/teach-before-test.js`, LAW-47's verification as a checked-in script evaluated
  in the page. It stays a browser check deliberately: re-implementing `layeredQueue()` in Node would
  create a second copy of the scheduling rules that reports green while the app is broken.
  `check_lesson_file.mjs` was negative-tested — three deliberately broken brackets, all three
  reported at once.
- **IBM is complete on the measure that matters: 16 of 16 cited lectures, 140 of 140 scheduled
  questions taught.** Authored against the citation list rather than the module list. The
  verification step earned itself repeatedly: `shared value` appears **0** times in the IBM
  transcripts — the course says *value sharing*, Porter and Kramer's term — and `public good`
  singular fails the word-boundary gate because the course says *public goods*. Both were caught
  before shipping. Figures come from the lectures: Aravind's 1,200–2,400 surgeries per
  ophthalmologist against a national 220–250; Grameen's 94% poor-owned equity and 96%+ repayment;
  Andhra Pradesh's 935 loans per 100 households; SELCO's ₹15/day kerosene against ₹10/day solar;
  44,000 FPOs by March 2025.
- **Added read-through mode** (`Read the lessons`, fourth dashboard tab). Lessons were previously
  reachable only inside practice, one at a time. The panel lists every lecture a subject knows about,
  grouped by module, each expandable to the full lesson. Reading here deliberately does **not** write
  `profile.lessonsRead` — that map drives the teach-before-test gate, so recording a skim would
  silently disable the gate for every lesson skimmed. Verified: opening all 50 BRGSA lessons leaves
  `lessonsRead` at 0.
- **The panel labels deliverability, which nothing else did.** Each row reads *Taught in practice*,
  *Read-only — no question cites this*, or *No lesson yet*. Building it caught an over-report in my
  own first cut: counting every citing question gave BRGSA 44 reachable lectures, but 11 of those are
  cited only by `optionShapeRisk` questions, which no scheduling path serves. Filtering those lands
  on 33, matching the validator exactly. The *No lesson yet* rows are the live authoring queue.
- **Deferred.** No screenshots — the Browser pane was not compositing in this environment, so visual
  acceptance stays DOM- and computed-style-level. SCLM and SPMS remain: 32 cited lectures. 233 of 283 lectures still have no lesson: IBM,
  SCLM, and SPMS are untouched, and their dense layers carry almost no faculty objectives, so those
  lessons will need objectives authored from scratch rather than extracted. Authored question copy
  still says "18 visitors per arm"; the gloss covers `arm`. All lesson prose is new and stays
  `WAITING_OWNER_CONTENT_ACCEPTANCE`. Nothing pushed or deployed.

## 2026-08-12 — Lossless workspace restructure for collaboration

- **Reorganized the repository in seven verified phases**, no behaviour changes intended and none
  observed. Every phase ran the same six gates before the next began: the test suite, `node --check`
  across all source scripts, the bank validator against the real pack, a build whose `dist/client`
  hashes were compared against a pre-reorg golden snapshot, a whole-tree SHA-256 content manifest
  proving no file was silently lost, and a real-browser pass.
- **Entries below this one are not rewritten.** A changelog entry records what a past session did;
  rewriting its paths to match the new layout would turn a true historical statement into a false
  one. Read older entries against this map:

  | Was | Is now |
  | --- | --- |
  | `mock/` (t6, login, admin, sets, robots) | `app/` |
  | `mock/rogue.*` | `legacy/rogue/` |
  | `mock/` older prototypes and their sets | `legacy/prototypes/` |
  | `mock/CLAs/` | `legacy/CLAs/` (untracked) |
  | `mock/server.py`, launchers, `validate_t6_bank.js` | `tools/` |
  | `scripts/` | `tools/` |
  | `site/` | `sites-backup/` |
  | `state/`, `history/`, `graphs/` | `data/state/`, `data/history/`, `data/graphs/` |
  | root Markdown, `briefs/` | `docs/{governance,briefs,engine,design,community,ops}/` |

  `evidence/` and `_TRANSFER/` are frozen for the same reason. `cloudflare/`, `db/`, `tests/`,
  `outputs/`, `work/`, and `coordination/` did not move.
- **`cloudflare/` was deliberately left in place.** Workers Builds deploys from it and its root
  directory is configured in the Cloudflare dashboard, outside this repository. Moving it would have
  broken auto-deploy in a way no local check could catch.
- **Public URLs are unchanged.** Testers reach `/dungeon/`, `/dungeon/t6.html`, and
  `/dungeon/admin/`, none of which contained the renamed directory. The legacy `/dungeon/mock/...`
  aliases are kept as accepted public URLs and now resolve to `app/` assets; a new test walks four
  of those bookmark URLs and asserts each still serves its asset.
- **`site/worker.mjs` was documented as production and is not.** `wrangler.jsonc` deploys
  `cloudflare/src/index.mjs`; nothing references the `dist/server/index.js` this file builds to. It
  is the private Sites entrypoint, unchanged since `d92e06a` while the live Worker moved through
  four releases. Renamed to `sites-backup/` with a README recording the divergence — most seriously
  that it has no agreement gate, so promoting it as-is would admit testers without acceptance.
- **`graph_source/` was never missing.** It is a directory of the external owner-supplied pack at
  `C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack` (283 chunks, matching the documented
  283 lectures), correctly untracked. `AGENTS.md` cited it among repo-relative paths, which read as
  a missing repository directory; the Directory Map now states the boundary.
- **Two latent hazards found and fixed, neither caused by the restructure.** `core.autocrlf=true`
  rewrote checked-out files from LF to CRLF — the release build copies from the working tree, so
  that silently changes deployed asset bytes; pinned with `core.autocrlf=false` and a
  `.gitattributes` that holds for every contributor. And the path-anchored ignore rules
  (`mock/CLAs/`, `mock/tunnel-out.txt`, `mock/leaderboard.json`) stopped matching the moment their
  directory moved, which briefly re-tracked the private course material; rewritten as directory- and
  file-name patterns, and verified absent from history.
- **Verification.** 35 tests pass (34 baseline plus the bookmark test), 32 syntax checks, bank
  validator reports zero errors and zero warnings, and `dist/client` is byte-identical to the
  pre-reorg golden snapshot with only the URL prefix renamed. Real browser on the dev server: `/`
  redirects to `/app/t6.html`, all fourteen assets return 200 with no console errors, a study set
  opens and renders a primer from the bank, and login and admin load their siblings.
  Backup: `C:\Users\knigh\Dungeon-backup\2026-08-12-pre-reorg`, 576 files verified byte-identical by
  SHA-256, plus git tag `pre-reorg-abfd606`.
- **Not done.** No push and no deploy — the live cohort is untouched by this work until the branch
  `reorg/structure` is merged. Live-edge re-verification is owner-gated on that merge.

## 2026-08-12 — Measured UI alignment pass and the Access login loop fixed at source

- **Fixed the Cloudflare Access login loop locking the owner out of the Control Room.** The
  Worker was cleared first — its admin path has no redirect loop. Inspection of the account found
  a single Access application, so the overlapping-application theory was wrong. The real cause: the
  app accepted only the `- cloudflare` identity provider, `Apply instant authentication` was on, and
  **no Google provider exists on the account at all**. With one accepted method and instant auth on,
  Access skipped the chooser and redirected straight into a flow a Google session can never satisfy,
  then redirected again — no chooser, no error, bouncing until timeout. With owner approval: enabled
  the existing `Dungeon one-time email code` provider alongside `- cloudflare` and turned instant
  authentication off. `Accept all available identity providers` deliberately left off so the gate
  does not auto-accept future providers. Destination, policy, and session duration unchanged.
- **Ran the UI pass against measurements rather than impressions.** An audit probe was injected per
  screen at 1280×800 and 375×812, reporting overflow, ragged wrap containers, sub-44px touch
  targets, and clipped text. Two candidate findings were rejected as artifacts: `.momentum-figure`
  reports two rows only because `align-items: baseline` gives differently-sized items different
  tops, and several sub-44px hits appeared only in mid-render states.
- **Match label tray** — the reported defect. Tablets measured `193/268/191/266`px wrapping
  3-then-1, and a tablet was *wider than the 162px slot it drops into*. `--statement-count` moved to
  `.match-board` so the tray shares the statements' grid track, with gaps matched. All four tablets
  are now `162px` on one row, each left edge exactly on its slot's.
- **Match reading order** — four equally weighted 7-line columns gave the eye no entry point.
  Statements are now numbered `1–4` against lettered `A–D` labels, so the task reads as "put a
  letter under each number". The badge reuses the existing `.option-key` treatment rather than
  inventing a shape. Not fixed: match choices span 13–179 characters, which layout cannot reconcile;
  that is a generator constraint for the bank work.
- **Mastery key legend** — widths `444/332/383/81`px each on its own row; now a two-column grid with
  the status dots aligned, collapsing to one column on mobile.
- **Subject actions** — two buttons at `257`/`187`px wrapping ragged inside a 370px column at
  desktop width; now an `auto-fit minmax(200px,1fr)` grid, equal width stacked or side by side.
- **Touch targets** — `brand-home` (38px), `skip-link` (43.3px) and `label-tablet` (40px) raised to
  44px. Zero sub-44px targets remain on the audited screens.
- Verification: 0 findings on dashboard, primer/MCQ, cloze, match, and feedback at both viewports;
  no horizontal overflow; `npm test` 34 passing; validator `ok: true`; build 14 assets. Evidence:
  `evidence/2026-08-12/t6-ui-alignment-pass/verification.md`.
- Deferred and stated plainly: boss, case-cloze, and constructed-response surfaces were not reached
  in a driven session (synthetic label clicks do not register with the app's selection handler), so
  they carry only a static check. The results screen, `login.html`, and `admin.html` were not
  audited in this pass.

## 2026-08-12 — Option-level diagnoses, a wrong-answer panel that explains itself, and an Access self-check

- **Rebuilt the wrong-answer panel.** It printed a verdict and no reason: `Not yet — this idea will
  return`, the concept explanation, and the correct answer hidden behind a `Show the complete answer`
  disclosure, with nothing referring to what the learner had chosen. For `match` questions the
  explanation is just the two principles concatenated, so the panel restated both answers and
  diagnosed nothing. The panel now reads verdict → what this choice assumed → catch it earlier →
  what governs this question → the complete answer → why it connects → return note. The complete
  answer is no longer collapsed, and the governing line is suppressed when the answer key already
  states it verbatim.
- **Every distractor now diagnoses a specific gap.** Audited all 3,240 distractor slots. The bank is
  generated, so distractors are borrowed from other concepts and the generator already knew what each
  wrong option meant — it was discarding that. `mock/sets/t6_challenges.js` now builds a provenance
  index from the derived concept data and runs a diagnosis pass over every question after generation.
  Six recognised families: another concept's principle, decision, causal chain, or label; the same
  concept's wrong facet; and the three constructed boss-integration errors. Provenance was checked
  for collisions across all 256 indexed concept texts — zero ambiguous, so each diagnosis is true by
  construction rather than inferred.
- **Added `mock/sets/t6_diagnoses.js`** with 78 hand-authored diagnoses for the distractors carrying
  no machine-knowable provenance: 3 shared across the catalogue `connect` questions covering 84
  slots, and 75 across 25 MCQs. Result: **2,943 diagnoses across the active bank with zero generic
  fallbacks — 100% specific.** The 90 remaining fallbacks sit inside the 163 legacy MCQs already
  excluded from scheduling.
- **Fixed a live user-visible defect.** `evidence.reasons` is rendered in the concept inspector and
  interpolated the raw misconception tag, so a learner repeating an error across two variant families
  saw `The same misconception returned across independent evidence: selected-belief:It estimates the
  total market before speaking to buyers.` Tags are now readable noun phrases.
- **Fixed a latent indexing bug.** Multi-part items read the misconception as
  `misconceptions[partResults.indexOf(false)]` — the part index, not the chosen option. For a
  single-blank cloze that is always `0`, so every wrong option reported the same misconception.
  `diagnosisFor` now indexes by the selected option within the failing part.
- **Made the contract enforceable rather than advisory.** `mock/validate_t6_bank.js` fails the build
  when a scheduled distractor lacks a diagnosis, when any of `tag`/`label`/`why`/`cue` is empty, when
  a `why` restates the correct answer, or when a `why` addresses the learner instead of the reasoning.
  A question added through any path picks this up automatically, because the diagnosis pass runs over
  the whole course rather than inside each generator. The authoring contract is recorded in
  `briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md`. The gate caught two of this session's own
  strings before they shipped.
- **Added an Access self-check for the admin login loop.** The owner reported the Control Room
  bouncing between the site and Cloudflare until timeout. The Worker's admin path contains no
  redirect loop — the bounce is at the Access layer, where the Worker had no way to report anything.
  `GET /dungeon/admin/access-check` now returns booleans and a coarse reason
  (`NO_JWT_AT_ORIGIN`, `AUDIENCE_MISMATCH`, `ISSUER_MISMATCH`, `TOKEN_EXPIRED`,
  `SIGNATURE_OR_JWKS_FAILURE`, `OWNER_EMAIL_MISMATCH`, `OK`). It sits outside the owner gate by
  design, since requiring the gate to diagnose the gate would be useless, and never echoes the
  audience tag, team domain, or any address. This is a diagnostic, not a fix: the root cause is in
  the Access application configuration and needs the dashboard.
- `mock/server.py` now falls back to `$PORT` when no port argument is given, so the preview harness
  can run it alongside another session's server. `argv` still wins and the default is still 8099.
- Verification: `node mock/validate_t6_bank.js` → `ok: true`, 0 errors over 792 questions;
  `npm test` → 34 passing; `npm run build` → 14 allowlisted assets; real-browser acceptance of the
  rebuilt panel and of the `sclm_m1_match` question from the owner's report. Evidence:
  `evidence/2026-08-12/t6-option-diagnoses/verification.md`.
- Deferred: the 78 authored diagnoses are new learning content and carry the existing
  `WAITING_OWNER_CONTENT_ACCEPTANCE` boundary. The 163 excluded legacy MCQs keep generic fallbacks.
  A bank-volume audit run this session is reported separately and no expansion was built.

## 2026-08-11 — Dynamic homepage, practice builder, enforced agreement version, and readable matching

- Rebuilt the dashboard around the owner's direction: subjects move to the top as a compact
  switcher, the hero pairs the subject-local next action with a live evidence trendline and a
  data-derived momentum message, and the persistent header shows a Term 6 evidence sparkline instead
  of a `0 of 64` counter. The detailed evidence graph moved beside concept inspection; the mastery
  matrix, the four-state Term 6 totals, and the staged panels now read as one continuous scroll
  instead of hiding the hero.
- Added the inline **Build your own practice** builder and retired the practice-setup dialog. Shape,
  concept focus (anything / needs work / new ground), length (quick / standard / deep), and feedback
  timing each change the generated run. Combinations that cannot narrow anything are disabled with
  their reason, a length that cannot add questions collapses to the shorter run that matches it, and
  the live summary states the real question count and estimate. Selections persist per learner.
- Added the **How far you have come** strip: answers recorded, practice blocks, concepts with
  evidence, and subjects started, all counted from real attempts with deduplicated multi-concept
  questions. Copy stays factual and never converts activity into praise.
- Inverted long-form matching. When answer cards carry the substance and the row labels are short,
  each statement now appears once with the short labels as compact choices, instead of repeating
  four paragraphs under every row. Stored responses, partial credit, concept results, and the answer
  review keep the row-indexed shape.
- Fixed the tester agreement gate: the accepted version is now carried on the session lookup and
  re-checked on every authenticated request, so a session issued under older terms is rejected with
  `AGREEMENT_REQUIRED` instead of running unchallenged until the cookie expires. The Control Room now
  separates `Agreed`, `Older terms`, and `Never agreed`, which was the source of the misleading
  "signed in with progress but not agreed" reading.
- Fixed answer feedback losing to selection styling: `:has(input:checked)` inherits its argument's
  specificity and outranked `.choice.wrong`, so a wrong match choice painted as an ordinary selection.
- Added the standing change-announcement ritual to `COMMUNITY_PLAYBOOK.md` and the close-out
  checklist: every tester-visible change ships with one `What changed` / `What to try` post.
- Verification: 33 automated release/access/agent tests, `node --check` on the app and Control Room,
  the 792-surface bank validator against the owner pack, and real-Browser desktop plus 390-pixel
  passes over the new homepage order, builder availability rules, generated runs, held-feedback runs,
  the inverted match interaction, and its resolved styling. Evidence:
  `evidence/2026-08-11/t6-dynamic-homepage/verification.md`.
- Deferred: cross-subject practice in one run, and deployment of this revision (a push to `main`
  publishes it and will require the cohort to accept the current agreement again).

## 2026-08-11 — Adaptive primers, evidence-first dashboard, and tester group bumps

- Added one source-traceable primer per T6 concept. Learning runs introduce only the next new
  primary concept before its challenge; correct work fades support quickly, harder successful
  challenges suppress it, and misses restore applied/misconception layers. Primer responses are
  unscored, excluded from the 565-item mastery pool and held-feedback practice, and stored in a
  separate per-concept support state. The complete bank is now 792 tagged surfaces: 728 scored
  challenges plus 64 adaptive primers.
- Reordered the dashboard's first two scrolls around the next-action hero, a five-axis Term 6
  mastery matrix (four subjects plus Connections), and the selected-subject evidence trend. Subject
  choice and concept inspection follow. Canvas values have a complete text equivalent.
- Added the approved-email WhatsApp gate and owner bump workflow. The private invite is absent from
  anonymous login assets and returned only after the allowlist check; the join tick stays disabled
  until the invite opens and remains an explicit self-attestation, not claimed verification.
  Signed-in missing testers receive an in-app reminder. The Control Room can bump one or every
  missing tester, record the reminder, and copy a firm message for manual sending without
  autonomous messaging or removal.
- Added D1 migration `0004_community_acknowledgement.sql`, applied it remotely, and confirmed no
  migrations remain. Updated the privacy notice, tester guide, community playbook, agreement source,
  two-page DOCX/PDF deliverables, Cloudflare contract, and owner/learning briefs.
- Verification: 31 automated release/access/agent tests, syntax checks, the 792-surface source/bank
  validator, allowlisted build, Wrangler dry run, standalone bundle, real-Browser desktop and
  390-pixel primer/dashboard/login/admin paths, and Word-native PDF render inspection all pass.
  Commit `475837f` deployed as Cloudflare version `98f1bb5b-e5f5-4f08-9340-e102dc79be50`; the exact
  live health/login/admin paths passed and the Control Room showed the bump workflow. It listed
  eight approved external testers; verification did not change any tester state. The configured
  owner-only Sites project was not visible to the current connector, so private backup version 5
  was not refreshed and remains non-origin. Evidence:
  `evidence/2026-08-11/t6-adaptive-primer-community/verification.md`. Remaining boundary: the
  changed agreement version intentionally requires each tester to re-accept on next login;
  WhatsApp membership remains self-attested and owner-reviewed.

## 2026-08-11 — Closed tester agreement verified end to end on production

- Deployed the current agreement-enabled Worker and confirmed the active D1 migration history
  includes learner state, country/single-session security, and agreement acceptance.
- Used a fresh temporary approved address to verify the complete production path: approval,
  first-login agreement, both required acknowledgements, learner dashboard entry with `Saved
  online`, sign-out, and revocation. The temporary account was removed and the Control Room
  returned from ten to the original nine approved testers.
- Refreshed the two-page DOCX/PDF agreement so its group-membership section and two quoted
  acknowledgements match the live first-login gate; Word-native export and visual review found no
  orphan page, clipping, or signature fields.
- Closed the stale `WAITING_OWNER_DEPLOY`, `WAITING_OWNER_TESTER_EMAILS`, and incomplete end-to-end
  onboarding notes. The first cohort and private WhatsApp group are active; small learning samples
  remain observational only. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`.

## 2026-08-11 — Cohort onboarding, lock recovery, learning signal, and push-to-deploy

- Connected `aneeketBTN/Dungeon` (private) to Workers Builds. Root directory `cloudflare`, build
  `npm --prefix .. run build`, deploy `npx wrangler deploy`, production branch `main`. The
  dashboard's auto-filled config was wrong for this repo: root `/` would have left wrangler unable
  to find `cloudflare/wrangler.jsonc` and the worker's `jose` dependency uninstalled. Verified the
  corrected shape locally first — `build-site.mjs` resolves from `import.meta.url`, so it is
  location-independent. First Git-triggered build deployed version `6ebc486b` and is attributed to
  the commit rather than `Manually deployed`.
- Owner accepted that push now equals publish, after the tradeoff was stated twice: a
  work-in-progress commit reaches testers. Mitigation in practice is to hold commits until a change
  is complete.
- Required the WhatsApp tester group at onboarding. The agreement step now gates on two
  acknowledgements — the closed tester terms and confirmation of joining the group — and the full
  terms gained a membership clause. Verified live that ticking only the terms still blocks entry.
- Replaced the single-email tester field with a paste area accepting a whole cohort separated by
  commas, spaces, or newlines. `POST` takes an `emails` array, writes the Access group once
  atomically, and reports added, already-approved, and rejected addresses separately.
- Added lock recovery. `PATCH` with `action: "unlock"` clears a country lock and re-baselines
  `first_country` without touching the Access group or the tester's saved progress. Before this the
  only remedy was revoke-and-re-add, which deletes progress — the wrong answer for a signal that
  fires on ordinary travel, VPNs, and mobile routing. A test asserts progress survives.
- Added two dashboard panels that replace what was previously scoped as scheduled agents, both
  reading real saved progress rather than inferring from reports: Participation (answers, concepts
  touched, first-attempt accuracy, time since last answer) and Where testers struggle (concepts
  ranked by unassisted first-attempt accuracy, with hint rate and tester count). Aggregation counts
  only scored, non-reattempt records, excludes the owner, skips unparseable rows, and labels
  samples under ten attempts as low rather than hiding them.
- Deliberately did not build a Question Bank Steward panel. Authoring replacement question families
  is generative work that needs the source checked; the dashboard surfaces which concepts are weak
  and the rewriting stays a reviewed session.
- Tester rows now show signed-in, agreement-accepted, has-progress, first-login country, and last
  activity. `npm test` passes 27/27, including a new aggregation test covering owner exclusion,
  corrupt rows, retries, and unscored practice. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`.

## 2026-08-11 — Approved-email entry, shared learner backend, and the closed tester agreement

- Replaced the emailed-code learner challenge with a single binary admission check. The Control
  Room allowlist is now the only gate: an approved email enters immediately with a signed opaque
  session cookie, and an unapproved email receives one fixed private denial,
  `Ask Aneeket to add you in.`, that never reveals the allowlist. The owner dashboard keeps its
  separate, stronger Cloudflare Access boundary.
- Added the shared learner backend. Cloudflare D1 stores per-email tester records, opaque
  session-token hashes, and progress rows; `cloudflare/migrations/` holds the three applied
  migrations and `db/schema.ts` mirrors the current shape. Progress now survives a cleared browser
  and a device change, the browser copy remains an offline fallback, and a dirty-flag check stops a
  staler server copy from overwriting an unsynced local run.
- Added the anti-sharing controls the owner asked for, with one deliberate softening: one active
  browser per approved email, and a hard lock when an account appears from a different country.
  City and region changes are not used, because mobile networks, VPNs, travel, and routing make them
  unreliable grounds for an automatic permanent ban. A lock is an owner review prompt in the Control
  Room, which now shows active-session, first-country, and lock state per tester.
- Held the first approved login at a one-time agreement step. Acceptance records only the agreement
  version and time; a returning tester on the same version enters directly. Revocation deletes that
  tester's sessions and server-side progress.
- Owner direction during this session: the agreement is a gentlemen's agreement, not a signed
  contract. Removed the tester-name, approved-email, and both signature blocks from
  `DUNGEON_CLOSED_TESTER_AGREEMENT.md` and the document builder; section 8 now states that no
  signature is needed and that ticking the acknowledgement box at first login is the acceptance.
  Rebuilt `outputs/Dungeon_Closed_Tester_Agreement.docx` and exported the deliverable PDF; the
  two-page render is read at
  `evidence/2026-08-11/closed-tester-agreement/render-acknowledgement/`.
- Live edge verified from both sides of the boundary: health reports `cloudflare-d1`, the anonymous
  route serves only the login page, an anonymous bank fetch is `401`, an unapproved email is `403`
  with the private denial, and the approved owner/browser address is held at `428
  AGREEMENT_REQUIRED` with no session or state written. Deployed `login.js` and `login.css` are
  byte-identical to source.
- Found and repaired a real defect during the live Browser pass: `mock/login.css` set
  `display: grid` on the `form` element selector, which outranks the user-agent `[hidden]` rule, so
  the email form stayed 174 pixels tall under the agreement step while reporting `hidden === true`.
  Added the `[hidden]` guard `mock/t6.css` already carried and confirmed the collapse live at
  desktop and at 390 pixels. The repair is in source and both release builds but is
  `WAITING_OWNER_DEPLOY`: this session had no Cloudflare deployment credential.
- `npm test` passes 23/23, `npm run build` produces 13 allowlisted assets plus the worker, and the
  standalone bundle embeds 14 assets in 391,652 bytes. Evidence:
  `evidence/2026-08-11/learner-backend-and-agreement/verification.md`. Bugs: `BUG-LAWS.md` LAW-36
  and the LAW-35 amendment. Quality: `QUALITY-LOG.md` I29, I30, and I31.

## 2026-08-11 — Protected Cloudflare domain deployed

- Saved and deployed private Sites version 5 from commit
  `bec2c2af7e1b9b4f9fcd854ee2e19f239e7fd131`; it remains an owner-only rollback surface while the
  exact domain uses the self-contained Cloudflare edge.
- Activated the exact `https://aneeketdas.com/dungeon/` Worker route with direct static-asset
  delivery; the private Sites release remains an owner-only backup and no origin bypass token is
  needed.
- Created one-time-code tester identity, the email-only `Dungeon Testers` group, a broader learner
  Access application, and a more-specific owner-only `/dungeon/admin*` application. The protected
  bootstrap address and the owner's browser/learner address are present; no external tester was
  granted access without an address from the owner.
- Stored a least-privilege Access-group read/write credential as the Worker `CF_API_TOKEN` secret.
  A temporary deployment credential was used once and deleted immediately after the route and
  secret were deployed.
- Added an enabled zone rate-limit rule that blocks above 40 `/dungeon` requests per IP/colo pair
  in 10 seconds for 10 seconds. The first 60-second rule attempt was rejected by the plan and did
  not create a stale rule.
- Replaced the prepared private-origin proxy with an explicit static asset router: learner and
  admin paths are allowlisted, direct public admin aliases fail closed, assets are private/no-store
  and no-index, and the owner endpoint retains JWT, email, same-origin, size, and group invariants.
- Added and verified an embedded-asset fallback build for upload paths without an Assets binding;
  it uses the same allowlist and still runs the Worker authentication checks.
- Public DNS, Worker/secret/API configuration, and anonymous edge checks pass. Anonymous learner,
  bank-script, and admin requests all redirect to the correct Access audience. A production
  Browser pass now loads the exact-domain owner Control Room as Healthy, Connected, and
  Allowlisted. It reports the registered owner/browser learner address as one approved tester. The
  learner path reaches the emailed-code login and remains
  `WAITING_OWNER_LEARNER_SIGNIN`. Tester grants remain
  `WAITING_OWNER_TESTER_EMAILS`. Evidence:
  `evidence/2026-08-11/cloudflare-protected-domain/verification.md`.
- Added a reproducible standalone packaging path for authenticated API deployment when a
  non-interactive Wrangler shell lacks credentials; the bundle embeds only the same allowlisted
  client assets. Production acceptance caught health/manifest checks crossing into the learner
  Access app; both now stay under `/dungeon/admin/*` and use the owner audience. `npm test` passes
  21/21, the 728-item bank validator has no errors, both Worker packaging paths pass, and the
  repaired production upload is version `bb7ead71-46e6-4fd3-a2d6-ab25498cdcec`.
- Diagnosed the owner's failed learner sign-in: the second known owner/browser address had never
  been added to the dedicated learner group. Registered it through the same group used by the
  Control Room and added a short custom denial message for verified but unapproved emails. The
  policy still withholds allowlist status until inbox ownership is proven.

## 2026-08-11 — Direct tester management in the Control Room

- Added a full-width owner access panel with email entry, approved tester list, refresh, explicit
  tester count, and confirmation-backed one-person revocation. Website access is kept visibly
  separate from WhatsApp membership.
- Added the prepared `aneeketdas.com/dungeon` edge controller. It validates the admin Access JWT
  and exact owner email, requires same-origin mutations, bounds JSON input, edits only a dedicated
  exact-email group, protects the owner bootstrap member, and strips access/origin credentials
  while proxying to the private Sites origin.
- Kept the browser credential-free. Cloudflare and Sites tokens are runtime bindings only; missing
  bindings, unsafe group selectors, a missing owner rule, or failed authentication all fail closed.
- Added seven focused edge tests plus a Sites setup-required test. Sixteen tests pass overall;
  Wrangler 4.120.1 generated current types and a successful dry-run bundle; the Sites release
  remains the same ten-file allowlist. Evidence:
  `evidence/2026-08-11/tester-dashboard-access-management/verification.md`.
- Saved and deployed private Sites version 4 from commit
  `8cf19b620013a4a75afa4aef5f445ddfa8234658`. The owner-only production dashboard now contains the
  controls and truthfully reports setup required until its Cloudflare edge is activated.
- Live route, secrets, group, tester grants, and revocation remain
  `WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS`; no tester or access policy changed in this session.

## 2026-08-11 — Identity-gated tester design and Dungeon Control Room

- Selected per-email, one-time-code tester access with individual revocation instead of a shared
  cohort password. Designed a higher-priority owner-only policy for `/dungeon/admin*`, a broader
  tester policy for `/dungeon*`, a private origin, and edge rate limiting.
- Added `briefs/TESTER_ACCESS_AND_ADMIN.md` and recorded the honest protection boundary: identity,
  audit, no-index, private caching, and throttling prevent anonymous/casual harvesting, but an
  approved technical tester can still download the current client bank. Server-side item delivery
  is required before any stronger anti-scraping claim.
- Added the responsive Dungeon Control Room with production health/release checks, tester
  add/revoke guidance, a release checklist, structured feedback copy, and a change-announcement
  composer. It never fabricates tester/usage counts or sends an announcement without another
  explicit action.
- Expanded the allowlisted release from six to ten assets for learner, admin, and `robots.txt`;
  added learner/admin redirects, global no-index and same-origin headers, and private caching for
  question-bearing scripts. Five release tests now cover the protected boundary.
- Provisioned and deployed the Sites origin, then returned it to custom owner-only access after the
  owner requested a tester gate. No tester was invited and no public domain route was left active.
- Installed the Cloudflare connection and opened the authenticated account for `aneeketdas.com`.
  Zero Trust Free advertises $0 and 50 seats, but activation requires terms acceptance and
  authorisation to charge the saved card for over-limit usage. No checkbox or Activate action was
  completed; exact `/dungeon` routing is `WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS`.
- Admin JavaScript/worker syntax, the ten-asset build, five release tests, desktop Browser layout,
  truthful unavailable-service states, announcement preview, and no horizontal overflow passed.
  Evidence: `evidence/2026-08-11/tester-access-admin/verification.md`.
- Production Browser acceptance caught the manifest outside the served asset root: health passed
  but release status stayed unavailable. The build now emits secret-free release metadata into the
  served client root as well, with `BUG-LAWS.md` LAW-27 preventing recurrence.
- Owner-only Sites version 3, built from `9c9e322a2e8a920a0101681faaad88e42b9928c5`, passed the
  corrected production re-check: unauthenticated `/admin` required sign-in; the authenticated
  dashboard reported Healthy, Allowlisted, ten public assets/no learner state, and automated checks
  passed, with no overflow or Dungeon application errors.
- Added a deliberately inert three-agent cohort control plane: Learning Signal Auditor, Question
  Bank Steward, and Tester Cohort Steward. Registered their intended hourly/daily project
  schedules, models, and prompts, then verified all three persisted as `PAUSED`; repository
  declarations remain disabled. The scheduler initially stored ACTIVE despite the paused create
  request, so the definitions were explicitly corrected and re-read before any interval elapsed.
  Versioned contracts reject direct identity/raw responses and the activation check fails until
  backend, consent, retention/deletion, owner review, adapters, synthetic acceptance, and explicit
  owner approval are complete. No run or external action occurred. Evidence:
  `evidence/2026-08-11/tester-agent-readiness/verification.md`.

## 2026-08-11 — Research-review integration and confidence-safe adaptation

- Read and mapped the owner-supplied substantive literature review into implemented, prototype,
  wait-for-data, and prohibited decisions in `briefs/T6_RESEARCH_REVIEW_IMPLEMENTATION.md`.
- Replaced universal confidence polling with sampled, staged, behavioural confidence on high-value
  diagnostics. Added a penalty-free skip and prohibited confidence grinding, rewards, secret
  difficulty changes, sparse personality labels, and fake probability scores.
- Added contrastive confident-error feedback, prerequisite bridges for uncertain misses, one
  new-family confirmation for uncertain correct answers, and two independent repair checks for a
  confident error. Learner-facing priority copy now explains the evidence reason for practice.
- Preserved valid unassisted boss steps as applied concept evidence while keeping failed steps and
  whole-chain completion separate. A permanent universal boss gate is deferred until learner data
  supports it.
- Added 64 write-first, source-grounded short-answer items with transparent rubric self-review and
  exemplars. They remain unscored, cannot independently create Strong, and expose no answer-shaped
  cue before final review in held-feedback practice.
- Added learner-selected recognition, application, generation, and mixed practice with immediate
  learning feedback or fully deferred review; held responses remain session-local and do not
  mutate dashboard evidence until completion. MCQs may use three or four plausible options.
- Added optional one-, three-, and seven-day plans with breaks, sleep protection, and honest
  same-day versus delayed-retrieval language. Reframed the absent first-cohort paper as
  `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`, a claim boundary rather than a blocked dependency.
- JavaScript syntax, the 728-item/source/breadth validator, release tests, desktop and 390-pixel
  staged confidence, constructed self-review, boss partial evidence, practice setup, held review,
  study horizon, accessibility labels, overflow, and Browser logs passed. Evidence:
  `evidence/2026-08-11/t6-research-integration/verification.md`.
- Deferred: faculty/owner item and rubric acceptance, real-learner calibration of confidence
  cadence and mastery thresholds, cognitive interviews, psychometric models, and a checked-in
  interaction suite across all 40 sets.

## 2026-08-11 — Controlled tester release, generic practice, and constructed self-review

- Expanded the bank from 664 to 728 source-traceable items by adding one constructed-response
  surface per concept. Active scheduling is now 565 items after the same 163 answer-shape-risk
  MCQs remain quarantined; every concept has at least eleven active surfaces, five formats, seven
  families, and boss coverage.
- Added learner-selected generic practice across recognition, application, generation, and mixed
  shapes with immediate-teaching or end-held feedback. Added one-, three-, and seven-day plans
  that protect breaks and sleep and do not relabel same-day performance as retention.
- Kept constructed practice truthful: learners write before seeing a source-grounded rubric and
  exemplar; self-review is unscored and cannot independently create Strong evidence. Corrected the
  held-feedback route so a saved short answer exposes neither rubric nor exemplar before results.
- Added a dependency-free, allowlisted tester build and a production worker with a health route,
  security headers, and cache policy. Added release tests plus `TESTER_GUIDE.md`, `PRIVACY.md`,
  `SECURITY.md`, and `COMMUNITY_PLAYBOOK.md`; live `state/`, `history/`, owner source packs, CLA
  analysis, work outputs, and local secrets are excluded from source publication and deployment.
- Provisioned an owner-only Sites project for production verification. A private GitHub repository
  and WhatsApp community are staged in the owner's authenticated accounts but not created pending
  explicit confirmation; public tester access remains unapproved.
- JavaScript syntax, the 728-item/source/breadth validator, allowlisted build, four release tests,
  desktop learning and held-feedback paths, generation self-review, end-of-check answer review,
  and 390-pixel no-overflow checks passed in a real Browser. Evidence:
  `evidence/2026-08-11/tester-launch/verification.md`.
- Boundary/deferred: `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` prohibits exact-paper claims for this
  cohort; faculty/owner content and rubric acceptance, empirical cohort statistics, and a checked-
  in interaction suite for all 40 study sets remain deferred.

## 2026-08-11 — Unified neutral prompts and scoped subject actions

- Corrected the applied-question hierarchy after owner review: a genuine case and its answer
  instruction now share one aligned flow on the main warm-white question surface. The substantive
  case is the larger semibold reading text, the instruction is a compact bold directive, and
  case-free questions retain their large heading without a redundant box.
- Removed the remaining non-functional containers: the tinted prompt panel, redundant reasoning-
  chain strip, bordered boss-step cards, cloze panel, and matching-row cards. Spacing and subtle
  dividers now carry sequence; only controls and post-answer feedback retain boundaries.
- Removed the misleading “Recommended now” label from the selected-subject focus. The UI now names
  BRGSA/IBM/SCLM/SPMS only and uses action-specific buttons: resume saved practice, start this study
  set, practise these concepts, or open what was then called the full practice mock. That label was
  later replaced by the configurable generic practice check.
- Neutralised unanswered practice: prompt groups, step labels, practice
  metadata, and focus metadata no longer use cyan as category decoration. Semantic color remains
  for selection, primary action, progress, accessibility focus, and answer/status feedback.
- Added `DESIGN_SOURCE_INDEX.md` C16, `QUALITY-LOG.md` I11–I13, and `BUG-LAWS.md` LAW-17–19 so
  dependency grouping, functional pixels, color meaning, and recommendation scope remain durable.
- JavaScript syntax, all four subject switches, context-specific button copy, boss/case-fill/match
  layouts, transparent wrapper styles, shared left alignment, desktop and 390-pixel widths, and
  empty Browser logs passed.
  Evidence: `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`.

## 2026-08-11 — Evidence-based progress, mixed challenges, and staged question UI

- Replaced the two-answer Strong shortcut with inspectable evidence gates: at least five attempts,
  four correct, three formats, two practice blocks, an unassisted boss pass, latest-answer success,
  and no unresolved high-confidence or boss error. Added low/fair/high confidence to every attempt,
  honest same-day/delayed qualifiers, and dashboard reasons for every state. The research-review
  revision above later replaced universal confidence polling and the permanent boss gate.
- Reworked the dashboard into staged Overview, Concepts, and Study plan surfaces. Replaced the
  16-item concept list with an evidence-over-time trend that can plateau or dip, one two-concept
  module at a time, and an on-demand explanation/practice inspector.
- Added `briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` after auditing known/unknown uncertainty,
  primary retrieval/spacing/relearning/confidence research, IIMB's public assessment-family
  boundary, and locally held prior-term item patterns.
- Added `mock/sets/t6_challenges.js`: the complete bank now has 664 tagged source-traceable items,
  including cloze, case-cloze, match, and 160 three-step boss questions. Active scheduling contains
  501 items; 163 legacy MCQs with detected correct-answer length cues are quarantined. Every concept
  retains at least ten active surfaces, four formats, six families, and boss coverage.
- Added `mock/validate_t6_bank.js` for schema, source ID, concept breadth, format, boss, option-shape,
  and run-pool validation. Question choice prefers unseen IDs, families, and formats, then the
  least-recently used surface; full mocks select three least-recent boss items.
- Cleaned the learner-facing question hierarchy under the owner rule “every pixel earns its
  place”: a genuine case is quiet body text in reading order, the task is the sole headline,
  matching instructions are not fake cases, and duplicated format/count/status/concept/source
  metadata remains available for audit but is hidden from learners. Removed decorative case rules
  and fixed long native-select overflow.
- Corrected a Browser-discovered boss-credit bug where a partially correct chain could satisfy a
  covered concept's boss gate. Added `BUG-LAWS.md` LAW-14–16, `QUALITY-LOG.md` I9–I10, and
  `DESIGN_SOURCE_INDEX.md` C14–C15.
- JavaScript syntax, the 664-item/source/breadth validator, desktop and 390-pixel layouts, graph and
  concept explanations, MCQ arrows, confidence gating, cloze/match/boss controls, high-confidence
  partial-boss repair, isolated save/resume, console health, and unchanged hashes for all nine live
  `state/`/`history/` files passed. Evidence:
  `evidence/2026-08-11/t6-evidence-challenges/verification.md`.
- At this stage, exact-paper fidelity and subjective-response practice were deferred. The research-
  review revision above superseded that state with an explicit first-cohort uncertainty boundary
  and transparent constructed self-review. Empirical item statistics, owner/faculty acceptance,
  and a checked-in end-to-end suite across all 40 study sets remain deferred.

## 2026-08-10 — Plain all-subject T6 dashboard and adaptive concept practice

- Replaced the active game-system wrapper with a student-readable revision dashboard: Strong,
  Developing, Needs practice, Not started, study sets, the then-named full practice mocks,
  feedback, and
  re-attempts are now the complete active vocabulary. Recorded the precedence in
  `DESIGN_SOURCE_INDEX.md` C12 and rewrote `briefs/T6_REVISION_FALLBACK.md`.
- Built a 64-concept dashboard across BRGSA, IBM, SCLM, and SPMS with all-subject and per-subject
  progress, eight-module concept maps, clickable focused practice, ten short study sets per
  subject, direct full mock access, and an explicit best-next-step card.
- Authored and grounded the remaining IBM, SCLM, and SPMS banks. The complete catalogue now has
  216 unique questions: 60 BRGSA and 52 each for IBM, SCLM, and SPMS. Every question cites an
  existing supplied lecture file and includes an explanation plus causal concept bridge.
- Implemented weak-first scheduling, later different-perspective re-attempts after misses or
  incomplete correct evidence, a two-perspective Strong rule, truthful results, automatic
  save/resume including resolved feedback, confirmed local reset, keyboard answers, responsive
  layouts, and reduced-motion behavior.
- Fixed three Browser-discovered failures: a root alias that broke relative assets, answer-state
  badges/counts that lagged re-attempt scheduling, and saved sessions that were not restored on
  page load. Added `BUG-LAWS.md` LAW-12–13 and expanded LAW-11; logged the product-quality change
  as `QUALITY-LOG.md` I8.
- Updated `README.md`, `MAC_TRANSFER.md`, `AGENTS.md`, the server root redirect, source index,
  ledgers, and deterministic scenarios. Preserved the legacy cinematic route and all live
  learning-engine state/history.
- Syntax, 216-question structure, source-file references, HTTP/root loading, all four subject
  maps and mocks, real adaptive practice, keyboard flow, desktop/390px layouts, save/resume/reset,
  console health, and nine-file live-data isolation passed. Evidence:
  `evidence/2026-08-10/t6-dashboard-all-subjects/verification.md`.
- At this stage, exact-paper fidelity and grounded subjective responses were deferred; the current
  research-review revision supersedes those two points with the first-cohort uncertainty boundary
  and transparent constructed self-review. Owner/faculty acceptance and a checked-in interaction
  suite for all 40 study sets remain deferred.

## 2026-08-10 — T6 exam-season fallback and verified BRGSA route

- Reprioritised the active product around last-minute Term 6 readiness and recorded the durable
  contract/source boundary in `briefs/T6_REVISION_FALLBACK.md` plus `DESIGN_SOURCE_INDEX.md` C11.
- Replaced the default browser entry path with a stripped T6 experience: direct Run 1 and cold-mock
  access, all ten BRGSA runs, 60 source-traceable MCQ/caselet questions, two Resolve, immediate
  explanations, injected different-surface repairs, two-miss chain synthesis, results, and a
  guarded practice-readiness signal.
- Preserved the broad cinematic/Ari/economy slice at `mock/rogue.html` as a legacy reference rather
  than deleting it; removed its layers from the active exam-season critical path.
- Rewrote `README.md` and updated `MAC_TRANSFER.md` for the T6 launch, browser-storage boundary,
  deterministic scenarios, and legacy routes.
- Kept IBM, SCLM, and SPMS visibly unavailable instead of filling them with placeholder questions;
  at that stage exact-paper fidelity and subjective practice were deferred. Later all-subject and
  research-review revisions superseded both points.
- Fixed two state-truth bugs found in Browser acceptance—stale repair status and lagging completed
  count—and added `BUG-LAWS.md` LAW-11 plus `QUALITY-LOG.md` I6–I7.
- Syntax, 60-question structure, 44 lecture-ID references, local HTTP, pointer/keyboard flows,
  repair/chain-break logic, full cold mock, guarded readiness, save/resume/reset, desktop/narrow
  layout, console health, and live-data isolation passed. Evidence:
  `evidence/2026-08-10/t6-brgsa-fallback/verification.md`.

## 2026-08-04 — npm tunnel launcher hardened

- Replaced the optional Windows tunnel launcher's unpinned `npx -y localtunnel` execution with a
  fail-closed check for an explicitly installed LocalTunnel CLI at exactly version `2.0.2`.
- The launcher now resolves and displays the executable path, validates the version before
  starting either child process, and refuses missing or mismatched installations with exit code 1.
- Confirmed that Dungeon has no npm manifest, lockfile, `node_modules`, named affected-package
  reference, global affected package, or affected package in its cached `npx` dependency trees.
- Missing-CLI and wrong-version runtime checks passed without opening a server or public tunnel;
  automatic package-manager execution is absent from the hardened launcher.
- Added `BUG-LAWS.md` LAW-10 to prevent optional helpers from silently fetching executable
  dependencies in the future. Evidence: `evidence/2026-08-04/npm-tunnel-hardening.md`.
- Deferred: the public-tunnel success path requires an explicitly reviewed LocalTunnel 2.0.2
  installation and was intentionally not opened during the security check.

## 2026-07-16 — Mac transfer prep and vertical-slice handoff

- Added `MAC_TRANSFER.md` with full-folder copy scope, Mac launch commands, Codex startup prompt,
  state-preservation boundary, deterministic scenario URLs, optional art dependencies, and a
  post-copy verification check.
- Added `mock/start-mac.sh` and changed the Claude launch configuration to macOS `python3`.
- Confirmed the web prototype and server have no hard-coded Windows user path, no npm/build step,
  no case-insensitive filename collisions, and no symlink/reparse dependencies.
- Removed an empty `.git` directory that was not a repository and would be misleading after copy.
- Preserved all `state/`, `history/`, `graphs/`, art source, rendered media, and research files.
- Recorded that browser-local prototype state does not transfer with the folder.
- Validation passed for JavaScript syntax, all Python source parses, all JSON files, local routes,
  scenario URLs, Door video/poster, and leaderboard API. Evidence:
  `evidence/2026-07-16/mac-transfer-prep.md`.
- Deferred: real Browser visual/usability acceptance on the Mac.

## 2026-07-16 — Complete local vertical slice implemented

- Rebuilt `mock/rogue.html`, `mock/rogue.css`, and `mock/rogue.js` into a full local loop:
  preload, home, Ari selection, truthful Hall setup, optional scarf market, five-question run,
  climb, secure/developing/missed feedback, quest, three power-ups, summit/failure, evidence-led
  results, recovery action, Archive, Settings, and return home.
- Added isolated browser-storage persistence, save/resume/abandon behavior, reduced motion, and
  deterministic URL state scenarios without touching live learning-engine data.
- Updated `mock/server.py` to serve project-root media portably.
- Product slice uses Dungeon identity, Ari only, two Resolve, The Transmission Stair, Applied II,
  five questions, Immediate feedback, and current Door media as interim art.
- Secondary syntax and HTTP checks passed; visual/browser acceptance remains
  `WAITING_REAL_BROWSER`.

## 2026-07-16 — Project operating system foundation

- Added the Codex-native living index in `AGENTS.md`, including status gates, directory map, Key
  Files, conventions, session rituals, known gaps, and self-maintenance rules.
- Added `BUG-LAWS.md` with seven initial Laws earned from the implementation/source audit.
- Added `QUALITY-LOG.md` for truthful UX, learning integrity, accessibility, art/motion coherence,
  persistence safety, and user-visible performance.
- Added this changelog, `evidence/`, and the multi-agent/tool coordination charter.
- Adapted the owner-supplied Claude-oriented operating-system template to Codex: `AGENTS.md` is the
  automatically loaded project instruction surface; `CLAUDE.md` remains a compatibility entry.
- Recorded the operating-system brief under `briefs/` and added it to
  `DESIGN_SOURCE_INDEX.md`.
- Preserved current product gates: external brief inventory, real Browser, Computer Use, and
  owner product conflicts.
- Verification passed: all 11 operating-system artifacts exist, all 16 indexed Key File
  references resolve, and `AGENTS.md` is 12,304 bytes—below Codex's normal 32 KiB project
  instruction limit. Evidence: `evidence/2026-07-16/admin-system-verification.md`.
- Close-out caught and corrected a stale pre-final byte measurement; added `BUG-LAWS.md` LAW-08
  so future evidence metrics are recorded only after final artifact edits.
- Deferred: production game changes, visual/browser acceptance, and resolution of C1–C9.
