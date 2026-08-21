# Dungeon

## Current Status (2026-08-21)

**Product.** Dungeon is three surfaces over one course — **Learn** (layered study sets, primers,
lessons, re-teach on evidenced mistakes), **Examiner** (timed mocks on the real Batch 1 paper
pattern, `docs/briefs/T6_EXAM_PATTERN.md`) and **Quick Notes** (the complete authored course in
teaching order, searchable and printable) — across four subjects (SPMS, BRGSA, SCLM, IBM), **219
concept records and 2,827 questions**. A real tester cohort is live and **a push to `main` deploys** (see
Collaborators). Every claim in this section has its full story in
`docs/governance/CHANGELOG.md`, newest first; the ledger below names the entries.

**Teaching layer — COMPLETE (2026-08-19).** **283 registered teaching entries over the 283-lecture
course: every lecture in all four subjects has a lesson.** BRGSA 50/50, IBM 78/78, SCLM 71/71,
SPMS 84/84, each reported `COMPLETE` by `check_lesson_file`. That is 282 lessons plus one
**add-in** — a lecture folded into a neighbour's lesson rather than padded out or left untaught
(owner direction 2026-08-19; the mechanism is in `lesson()` and every gate understands it).
**Every one of the 283 entries is now scheduled into its module's ordinary Learn run**: readable-only
entries are 0 in every subject, and both the lesson gate and bank validator fail if one returns.
This closes teaching delivery, not equal testing depth. Every named idea is reached by a question,
but a mention is a lower bar than a dedicated concept record or repeated transfer practice (see
Known Gaps).

**Testing-layer coverage — COMPLETE at the phrase gate (2026-08-20).** `check:tested` now reports
**359/359 named syllabus ideas (100%)**: BRGSA 69/69, IBM 90/90, SCLM 84/84, SPMS 116/116. The bank
holds BRGSA 29 concepts / 417 questions, IBM 85 / 936, SCLM 36 / 516, SPMS 69 / 958; every one of
the 219 concepts has a derived link. This is coverage, **not** the adopted one-record-per-idea depth
target. The IBM direction changed on 2026-08-20 and supersedes its historical descoping: its
73-idea queue became **69 new records plus four honest wording repairs**. The new IBM records are
classified by what they are: **20 foundational layer ideas** generate written + MCQ practice,
**29 named frameworks/models** generate written practice only, and **20 bounded concepts** generate
MCQ practice only. The original sixteen records remain layer concepts, so IBM totals 36 layer / 29
framework / 20 concept records, **167 constructed responses**, and no isolated concept. Generic
course-grounded caselets teach transfer; nothing claims to reproduce the unreleased exam case.

**Mock coverage — COMPLETE at the paper-relevant record level (2026-08-20).** Numbered mocks are
deterministic coverage cycles rather than three unrelated draws. SPMS closes in **3 sets at 69/69**
records, BRGSA in **4 at 29/29**, IBM in **7 at 65/65 written-relevant** layer/framework records and
SCLM in **3 at 36/36**. Every one of the seventeen papers preserves the real paper shape, fills its
sections and spans all eight modules. IBM's twenty objective-only records deliberately stay in
Learn rather than being forced into its all-written paper. A separate **Weakest links** diagnostic
uses current Learn evidence to target weak or untested records; it is excluded from the common
coverage cycle and like-for-like re-sit comparisons because its contents are dynamic.

**Last-day mini-mocks — LIVE (2026-08-21).** Examiner leads with a coached **8-question / all-8-
module / 15-minute-top** round and leaves the two-hour real-pattern papers below it. Every answer
teaches immediately; an optional four-step way-in and the Quick Notes numerical exoskeleton teach
how to start before calculation. Mini-mocks rotate deterministically through the complete concept
library, prioritising unseen-in-cycle records: SPMS **69 concepts in 7×8**, BRGSA **29 in 2×8**,
IBM **85 in 10×8**, SCLM **36 in 5×8**. The rotation gate enforces eight applied questions, one per
module, uniqueness, complete-cycle coverage and at least 35% sampled id change.

**Learn front door — PURGED AND STREAMLINED (2026-08-21).** The four subject cards start or resume
revision directly. Each subject has a fixed **nine-run** path with one uncleared run visible at a
time; future runs stay absent and completed runs alone become replay choices. Up to two
Needs-practice concepts can carry into the next run on a fresh family without changing the sequence.
The dashboard keeps one four-number progress glance; concept evidence, cleared replay and focused
practice disclose only when useful. The three charts, custom builder, resource/settings stack,
duplicate status surfaces and header subject dropdown were removed rather than moved into menus.
Finishing a run still opens the compact learned / struggled / next-run debrief.

**Quick Notes — COMPLETE FIRST PASS (2026-08-21).** Learn / Exam / Notes is the persistent three-way
navigation. Notes renders all **283 course entries** by subject, module and lecture, carries the
authored explanations, worked moves, glossary and connections, adds assessed concept maps, and
provides subject search plus whole-subject print/PDF. **Eleven numerical exoskeletons** teach setup,
units, formulas, thinking order and checks across BRGSA 3 / SCLM 5 / SPMS 2 / IBM 1. Wrong-answer
feedback now teaches Better answer → Why → What your answer missed → Use this check, with internal
return/retest scheduling language removed.

**UI separation and alignment — RELEASE GREEN (2026-08-21).** Dashboard, progress, Exam and mini
cards separate through tonal lift, restrained shadow and status silhouettes instead of outline-box
grids. The dashboard has no competing floating action or Bag overlap; full-paper confidence targets
meet 44px. The release runner checks nine scenes at 375×812 dark and 1280×900 light: **18/18 PASS**
with zero overflow, clipping, overlap, cut-row, hidden-scroll, inset, dead-shadow, flat-panel or
tap-target failures. The final regular and optical sweeps each produced **24/24** valid captures and
all were visually inspected.

**Gates, last full run 2026-08-21 — all green:** `check_lesson_file` 283/283 scheduled / 0 errors /
0 readable-only warnings; bank validator 0 errors and populated coverage for all four subjects
(**pass the transcript path** — the silent-skip signature is `lessons.coverage: {}` and 0 warnings,
and the field is nested, not top level). Its 69 current warnings are extraction-unverified glossary
terms from PDFs the validator cannot extract, reported rather than hidden. Syllabus,
taught-vocabulary, taught-not-tested, spine, naming, palette, mini-rotation and craft gates PASS;
full test suite **144/144**; build 20 assets; exam readiness 0 errors / 0 warnings. The automated
layout gate is 18/18 and both screenshot sweeps are 24/24. The dashboard chart runtime is
intentionally no longer shipped.
**Expected-state exception:** the
lesson–lecture match gate `FAIL`s naming `SPMS-M01-L01` and nothing else, by owner decision —
anything *else* in that output is new.

**Waiting.** `WAITING_OWNER_CONTENT_ACCEPTANCE` is **cleared** — the owner accepted all 105
outstanding surfaces in chat on 2026-08-19. That is a release decision, not a completed review:
the per-lesson reading set out in decision 1 did not happen, and acceptance is still not faculty
review. The 2026-08-21 release is authorised for and sent through `main`, the tester deployment
branch.

## Session Ledger — full stories in `docs/governance/CHANGELOG.md`

Each line is a pointer, not the record: the CHANGELOG entry of the same date and title carries
the numbers, the defects found, and the evidence paths. Do not re-derive a claim from a line
here — read the entry.

- **2026-08-21 — Last-day mocks teach in eight questions, rotate through the whole bank, and the UI clears release**
  (Eight applied questions, one per module, immediate teaching, optional four-step scaffold and
  numerical exoskeleton; no hidden interaction expansion. Complete concept cycles: SPMS 7×8,
  BRGSA 2×8, IBM 10×8, SCLM 5×8. Tonal/shadow/status separation replaces outline-box grids;
  dashboard overlap removed; 44px paper controls. Mini gate, 18/18 UI states, two 24/24 screenshot
  sweeps, 144/144 tests, 283/283 lessons and 20-asset build green. Evidence:
  `evidence/2026-08-21/t6-last-day-mini-mocks/verification.md`.)
- **2026-08-21 — The dashboard is actually smaller, Quick Notes covers the course, and corrections teach**
  (Removed three charts/runtime, custom builder, lesson/time/exam resource panels, duplicate coins
  and the redundant header subject dropdown. Kept one progress glance, the fixed run action, replay,
  concept detail, focused practice and reset. Notes renders all 283 entries sequentially with search,
  print/PDF, concept maps and 11 numerical exoskeletons. Wrong feedback now gives Better answer →
  Why → What was missed → reusable check, without scheduler language. Browser desktop/mobile green;
  142/142 tests; lesson 283/283; review/palette/build green. Evidence:
  `evidence/2026-08-21/t6-dashboard-purge-quick-notes/verification.md`.)
- **2026-08-21 — Learn becomes one sequenced front door, and every run ends with a quick look**
  (Right now / Ways in merged into one subject-to-run action. Four subject cards start or resume;
  nine fixed runs unlock one at a time; future runs are absent and cleared runs alone replay. Up to
  two Needs-practice concepts carry into the next run. Stats, three charts, concept rows and custom
  tools are progressive disclosures. Run completion shows learned / struggled / next on the left
  and before / now / all-Strong evidence bars on the right. `npm test` 140/140; review, palette and
  build green. Evidence: `evidence/2026-08-21/t6-learn-streamlining/verification.md`.)
- **2026-08-20 — Mock sets become coverage cycles, and Learn can issue a weakest-links paper**
  (the fixed three-set ceiling is replaced by the shortest deterministic cycle that reaches every
  paper-relevant record: SPMS **3 / 69/69**, BRGSA **4 / 29/29**, IBM **7 / 65/65** written-relevant,
  SCLM **3 / 36/36**. All seventeen papers fill, span eight modules, preserve real formats and pass
  complete-cycle craft checks. IBM's 20 objective-only records stay honestly in Learn. Every subject
  also has a dynamic Weakest links paper selected only from current Learn evidence and excluded from
  common coverage/re-sit comparisons. `npm test` 139/139; build 20; structural gates green. Evidence:
  `evidence/2026-08-20/t6-preparedness-personas/verification.md`.)
- **2026-08-20 — The preparedness defects are fixed, and the whole teaching layer now enters Learn**
  (the three-persona audit's actionable findings are remediated. All **283/283** registered lecture
  entries are scheduled in module runs, readable-only 101 -> **0**; honest estimates include lesson
  reading; early Learn carries IBM writing, BRGSA case/written work, SPMS MSQ and available SCLM
  numeric work. Content contradictions and neighbouring feedback are repaired; exact failed-concept
  repair, confidence capture and accessible in-page paper dialogs are live. SCLM match prompts rotate;
  exam readiness is 0/0. Mock selection keeps eight modules while taking longest-option payoff to
  SPMS 25.2%, BRGSA 25.0%, SCLM 25.0%. The then-current three-set sample reached 75.4% / 62.1% /
  36.5% / 100%; the coverage-cycle entry above closes that remaining gap. `npm test` now 139/139;
  build 20;
  structural gates green. Evidence: `evidence/2026-08-20/t6-preparedness-personas/verification.md`.)
- **2026-08-20 — Every dashboard graph is now a shadcn/Recharts component** (all three graph
  surfaces replaced: momentum and evidence history use actual gradient `AreaChart`s; the evidence
  matrix uses an actual `RadarChart`. One self-hosted React island owns responsive geometry,
  grids, tooltips, accessibility and reduced motion. Lucide flag/person/door marks replace the
  radio-like route dots. At 1280 and 375: three accessible chart surfaces, zero overflow, zero
  canvas/legacy graph paths, zero console errors. `npm test` 130/130; review/palette/build green;
  screenshots 16/16 plus optical 4/4. Evidence:
  `evidence/2026-08-20/t6-shadcn-charts/verification.md`.)
- **2026-08-20 — The mocks rotate the expanded bank, and no persona feels whole-subject ready**
  (three existing personalities, isolated browser state, all four subjects, plus all 12 blind mock
  exports. None felt ready after the sampled recommended path. IBM's eight-of-ten legacy scenario
  lock is replaced by four deep whole cases + six rotating focused cases: across three mocks unique
  questions 14 -> **22**, concept reach 22/85 -> **31/85** (31/65 written-relevant), all 18 focused
  slots unique, pair overlap 8 -> **4**. Across-three concept reach: SPMS 76.8%, BRGSA 62.1%, IBM
  36.5%, SCLM 100%; every individual paper spans eight modules, while 101 lessons stay readable-only.
  Lazy is defeated by the real formats, Joe exposes unrecorded guesses, Diligent exposes IBM/BRGSA
  feedback contradictions. Chart route repaired; fixture-mutating tests serialised. `npm test`
  130/130, build 20, gates green, expected lesson-match exception unchanged. Evidence:
  `evidence/2026-08-20/t6-preparedness-personas/verification.md`.)
- **2026-08-20 — The whole syllabus is now reached, and IBM's idea type determines its assessment**
  (owner direction superseded the 2026-08-19 IBM descoping. The 73 IBM misses became **69 new
  records plus four wording repairs** on existing layers: 20 new layer / 29 framework / 20 atomic
  concept. Layer → written + MCQ, framework → written-only, concept → MCQ-only, enforced in both
  generator and validator and regression-tested over all 85 IBM records. IBM 16 → **85 concepts**,
  220 → **936 questions**, constructed responses 40 → **167**, phrase coverage 17/90 → **90/90**;
  all four subjects and the whole 359-idea course now read 100%. Framework linkage uses written
  case responses rather than objective bosses and does not enter the special integrated exam-case
  priority. All 219 concepts linked, IBM isolated 0, correct-length rank spread 0.03. The UI now
  says `concepts Strong`, because 69/29/85/36 is mastery-record count, not coverage percentage.
  `npm test` 129/129, review/build/gates green, expected match exception unchanged. Evidence:
  `evidence/2026-08-20/t6-ibm-classified-coverage/verification.md`.)
- **2026-08-19 — The spine is widened for the first time, and the craft gates caught what the
  structural ones passed** (Steps 0 and 2 of the spine plan. **`pair.slice(0, 2)` generalised** —
  match and boss now chain consecutive pairs; verified as a **no-op at two concepts per module**
  first (identical 920 questions, same edges, ids untouched), then as a fix: the probe that used to
  orphan **`spms_jtbd`** now leaves isolated 0. **The first attempt chained only the match and the
  bank validator rejected it** — every concept needs boss coverage and ≥10 scheduled surfaces.
  **Six concept records authored into SPMS module 1** (the L02/L03 taxonomy cluster) — 2 → **8**
  concepts, SPMS 16 → **22**, questions 216 → **300**, edges 8 → **14**, tested coverage **30% →
  34%** with the floor raised. **No questions written by hand**: six records generated 84 surfaces,
  and six syllabus ideas went from untested to tested — the argument for widening the spine before
  authoring questions singly. **Every structural gate passed a defective draft**: the correct answer
  was longest in **6 of 6** explain questions, 77.8% against 25% chance, SPMS `longestOptionScore`
  **0.23 → 0.38**. Two in-place repairs (trim summaries toward distractors; then make one distractor
  per set longer than the answer) took it to **33.3%, parity with existing concepts**, and the
  subject to **0.29 — level with BRGSA but above its own 0.23 baseline, reported not hidden**.
  Module 1's boss now tests its opening two concepts rather than DFV/JTBD: ids unchanged, content
  changed. Evidence: `evidence/2026-08-19/t6-spine-first-widening/verification.md`.)
- **2026-08-19 — The concept layer exists, and the spine was never modelled**
  (owner direction: *"every concept is surfaced, but importance is how much this concept
  contributes to the entire course as a whole … I just need proper layer."* **Importance is now
  contribution to the COURSE — module reach**, not raw repetition and not exam marks; mark share
  still scales but is reported separately. **The finding: today's 64 concepts are module-local by
  construction** — chosen two per module, so only **2 of 16** SPMS and **1 of 16** SCLM concepts
  reach six modules, and `Startup`, `Business model`, `Supply chain` **are not concepts at all**.
  That is why nothing can express one idea resting on another. `npm run build:layer` emits position,
  role and parent for every idea: **324 placed, 35 unmatched, 76 roots**. Every idea is surfaced —
  role sets place in the layer, never whether it is tested. **Parents make cross-module links fall
  out of the structure**, answering the SPMS zero-links problem. Three measured corrections: spine
  by **rank not threshold** (a threshold put 40 of 115 SPMS ideas in the spine); parents found in a
  **1,200-char window not a lecture** (identical to the foundational-tie failure); and ranking by
  **how often the course states two ideas together**, not syllabus proximity. **~3/4 of parents read
  defensibly and the rest do not** — emitted as data for an owner pass, not written into the
  catalogue.)
- **2026-08-19 — The concept spine is specified, and two of its three blockers are code**
  (`docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md` plus `tools/measure-concept-spine.mjs` /
  `npm run check:spine`. **Two corrections to the adopted vision doc**: `chain` is the module-title
  array, not a per-concept position — ordering comes from `source` via `conceptTeachingRank()`; and
  `linkedConceptIds` is a **derived function, not a field** — what you author is a question carrying
  `supportingConceptIds`. **The cost is reframed**: a concept record of ~6 sentences *generates*
  ~10–16 surfaces, so Phase 2's unit is **~295 records**, not ~3,000 hand-written questions.
  **Blocker 1:** `pair.slice(0, 2)` in `t6_challenges.js` — the module match and five boss steps are
  the only generated surfaces carrying links, so a third concept in a module is born isolated. Shown
  by probe: the gate went PASS → **FAIL, exit 1**, and **the orphan was `spms_jtbd`, a shipped
  concept, not the one added** — insert position silently strips links. **Blocker 2:** cross-module
  edges come only from written case prompts (`addIntegratedScenarios`, BRGSA/IBM only), so
  **SPMS has 0** and `groupWeaknesses()` can never pair across modules there — promise 1 is
  structurally unavailable in the subject with the most objective marks. Fix is an authored
  cross-module `synthesis` MCQ; `sclm_syn_inventory` is the only worked example in the repo.
  **Blocker 3:** runs 9/10 split concepts by index parity. Measured: 64 concepts, 920 questions,
  14.4 each; edges BRGSA 49/IBM 35/SCLM 10/SPMS 8.)
- **2026-08-19 — The teaching layer is complete: 283 lectures, 283 taught**
  (five lessons finishing SPMS module 4, including `M04-L10`, the **48,232-character Sriraman guest
  session, the longest lecture in the course**; then `M04-L04` and `M04-L09` rewritten. Entries
  278 → **283**, SPMS 79 → **84/84**, backlog → **0**. **Every lecture in all four subjects now has
  a lesson.** It closes authoring, **not testing** — 184 entries stay readable-only. **Module 4 held
  the last two composites and both had *positive* margins**, so the original sweep query would have
  caught either; both had sat unread in its output all session. `M04-L09` borrowed from **three**
  lectures and named two of them in its own title (0.181 → **0.456**); `M04-L04` took two of three
  paragraphs from `M04-L01`, where `Spotify` appears 28 times against **0** in its own transcript
  (0.204 → **0.467**). **A limit of the gate:** `L04`'s flagged rival was `L03`, not `L01` where the
  text came from — **the rival names where vocabulary overlaps, not the source.** **Nine for nine:
  every confirmed composite borrowed from a lecture that had no lesson when it was written** — the
  backlog produced the defect rather than merely blocking its repair. Seven terms rehomed; three
  (`funding stages`, `superforecasting`, `churn rate`) occur **nowhere in SPMS** and pass via module
  notes. Invented `liquidity pricing` removed — vocabulary warnings 9 → **8**. Evidence:
  `evidence/2026-08-19/t6-teaching-layer-complete/verification.md`.)
- **2026-08-19 — SPMS module 8 is complete, and the worst composite in the corpus is repaired**
  (six lessons: `M08-L02`, `L04`, `L06`, `L07`, `L09`, `L10`, then `M08-L08` rewritten. Entries
  272 → **278**, SPMS 73 → **79/84**, backlog → **5**; **every SPMS module complete except M4**.
  **The composite named itself**: `M08-L08`'s title was "Market analysis *and responsible product
  management*" and `L10` **is** Responsible Product Management. Own lift **0.203 → 0.519**, margin
  **−0.074 → −0.475** — the largest of five composite repairs, starting at about p05. **Third margin
  floor in one day proved too tight**, so the Step 4c sweep now **leads on own support** and treats
  margin as corroboration; two structural exceptions documented (a "Part 2" lecture, and a
  **synthesis lecture** that spans the subject). Four tracked terms rehomed in the same edit — and
  **`data fiduciary` was never `L08`'s: its home is `M08-L05`, 6 occurrences there and 0 in L08**.
  **`AI bias` occurs 0 times anywhere in SPMS** — a syllabus-sheet phrase passing via module notes.
  **A mojibake defect I introduced passed every automated gate and the browser caught it instantly**
  — a Python `unicode_escape` round-trip mangled 8 em-dashes; the gates parse the JavaScript, not
  the output. Second Step-5-only defect in one session. Evidence:
  `evidence/2026-08-19/t6-spms-m08-complete/verification.md`.)
- **2026-08-19 — SPMS module 7 is complete, and two handoffs promised a lecture nobody had written**
  (five lessons, ~79k of transcript: `M07-L03`, `L07`, `L09`, `L12`, `L13`. Entries 267 → **272**,
  SPMS 68 → **73/84**, backlog → **11**; **six SPMS modules complete**, leaving M4 ×5 and M8 ×6.
  **`M07-L01` and `L02` both promised the roadmap at `L04` and skipped the unauthored `L03`** —
  seventh and eighth false handoffs, and **a new variant**: module 6's was false because the lesson
  was a *composite*, this pair because the next lecture *did not exist yet*. Each author wrote a
  handoff to the next lesson **in the file** rather than the next lecture **in the course**, which
  is self-reinforcing — an unauthored lecture is invisible in the file, so every neighbouring
  handoff skips it. **Read the module's lecture list, not the lesson file, before writing a
  `connects`.** Two of five land just under p25 and both are "Part 2" lectures sharing vocabulary
  with their Part 1 — structural, and the margins (rivals at 0.069 and 0.104) settle it. Zero
  untouched lessons moved ≥0.02, second batch running. `Verification versus validation` is a
  tracked *module 6* term whose home lecture is `M07-L03`. Evidence:
  `evidence/2026-08-19/t6-spms-m07-complete/verification.md`.)
- **2026-08-19 — IBM is descoped, and the testing queue is much smaller than the headline**
  (owner direction: *"we can forget IBM for now."* Recorded because it changes the measured queue,
  not just its order. IBM carried **73 of the 233** missing ideas and **24 of the 51** genuine
  zeros — the largest block in every column, and the paper where an objective question earns
  nothing. Without it: **269 ideas, 109 reached (41%), 35 drift, 98 partial, 27 absent**. The real
  objective-bearing queue is **27 genuine zeros**, and coverage starts at 41% rather than 35%.
  `--written` stays in the importance tool for when IBM returns; nothing was deleted.)
- **2026-08-19 — SPMS module 6 is complete, and the sweep query could not have found its composite**
  (five lessons completing the cheapest remaining module, ~66k of transcript: `M06-L02`, `L03`,
  `L04`, `L06`, `L07`. Entries 262 → **267**, SPMS 63 → **68/84**, backlog → **16**; **modules 1, 2,
  3, 5 and 6 complete**. **`SPMS-M06-L01` was a composite the documented Step 4c query could not
  catch, for two independent reasons** — its margin was **−0.011**, so `$1>0` skipped it, and the
  `0.35` threshold was a stale p25 that is now **0.460**. The general form: **a composite converges
  toward a *tie* with the lecture it borrowed from, not a loss**, so being narrowly ahead is the
  signature rather than the exoneration. Repaired 0.165 → **0.369** own lift. **LAW-78**: a
  threshold copied out of a calibration is a snapshot, not a rule. Sixth false handoff, and this one
  was false *because* the lesson was a composite — a broken `connects` is a composite's fingerprint.
  All five new lessons clear p25; **zero untouched lessons moved ≥0.02**, a first. Evidence:
  `evidence/2026-08-19/t6-spms-m06-complete/verification.md`.)
- **2026-08-19 — The testing layer has a measured queue and an importance ranking to order it**
  (planning and tooling, no content authored. `--triage` splits the mirror gate's 233 misses into
  **39 drift / 143 partial / 51 absent** — so *coverage* is a far smaller job than *depth*, and the
  vision doc's ~2,000–4,000 questions is the price of the latter. `tools/measure-concept-importance.mjs`
  implements **owner direction of 2026-08-19** — repetition, foundational tie, numerical, multi-step,
  the last two carrying half the weight. **Its sharpest output is a refusal: IBM's paper has zero
  objective marks and the lowest coverage at 19%**, so gap-ranking would have poured the biggest MCQ
  batch into the paper where an MCQ earns nothing; **`--written`** exists to order IBM's actual work.
  **A first cut was corrected by the direction**: it had set 16 ubiquitous terms aside as "background
  vocabulary", which mistook ubiquity for importance and then over-corrected into dismissal — they
  are the subject's **foundational** concepts, they rank, and they are the yardstick for everything
  else. **Two components were measured, found degenerate and changed** — lecture-granularity
  foundational tie put 78% of ideas at a flat 100 (fixed by an 800-char window), and "step"
  vocabulary runs at 9–15 per thousand words in *every* lecture because that is how people talk
  (deleted). `RICE` matched 126 SPMS sentences via the word **price** — whole words only.
  Measurement not gate (`LAW-75`); exits 0. The weighting is a reading of the direction rather than a
  measurement, so **an owner pass is still wanted**. `docs/briefs/TESTING_LAYER_BUILD_PLAN.md`.)
- **2026-08-19 — SPMS modules 2 and 3 complete, and three defects the gates caught in my own work**
  (four lessons chosen to *complete modules* rather than shrink the backlog fastest: `M02-L12`
  Kittlaus, `M03-L03` go-to-market, `M03-L05` business model canvas, `M03-L09` service strategy.
  Entries 258 → **262**, SPMS 59 → **63/84**, backlog → **21**; **modules 1, 2, 3 and 5 complete**.
  **A forward-reference the gate caught and I did not** — `key partners` is first used four lectures
  later, and I counted occurrences without checking position, which is exactly the `firstUse()`
  check the protocol demands. **Literal `**` markdown in an explainer** would have rendered as
  asterisks to a learner: no content gate looks for it, since they parse the JS not the output —
  only the browser check finds it. **An over-length explainer took two trims** (311 → 301 → 298).
  Evidence: `evidence/2026-08-19/t6-spms-m02-m03-complete/verification.md`.)
- **2026-08-19 — Module 6 unblocked: every composite the sweep found is now repaired** (`M06-L10`
  and `L11` authored, **then** composite `M06-L09` rewritten — **0.130 → 0.481**, margin **+0.035 →
  −0.311**. Entries 256 → **258**, SPMS 57 → **59/84**, backlog → **25**. Re-running the detector
  shows **none of the three composites still leans**: `M07-L08` 0.113 → 0.395, `M03-L08` 0.115 →
  0.589, `M06-L09` 0.130 → 0.481. **The sweep's own diagnosis was partly wrong, usefully:**
  `M06-L09`'s first paragraph came from its *own* lecture, so the rewrite expanded rather than
  replaced. **`Requirement lifecycle` occurs 0× in the whole course** — carried in prose, not as a
  glossary heading, like `Team roles`. Coverage held at 116/116; second batch running ahead of the
  ratchet. **Nine candidates remain unread and span all four subjects**, so the pattern may not be
  SPMS-only; the list also **shifted between runs** (`LAW-76`) — diff a pre-batch dump before
  treating a new entry as a new defect. Evidence:
  `evidence/2026-08-19/t6-spms-m06-unblock/verification.md`.)
- **2026-08-19 — Content accepted, and module 3 unblocked** (**`WAITING_OWNER_CONTENT_ACCEPTANCE`
  cleared** — owner accepted all 105 surfaces in chat; not faculty review. **Recorded with its
  discrepancy visible:** decision 1 the same day said every lesson gets read and that did not
  happen, so this is a *release decision, not a completed review*, and the reading is now optional
  rather than blocking. Module 3 unblocked on the module 7 template: `M03-L07` and `M03-L10`
  authored, **then** composite `M03-L08` rewritten — own-lecture support **0.115 → 0.589**, margin
  **+0.024 → −0.482**. Entries 254 → **256**, SPMS 55 → **57/84**, backlog → **27**. **Two tracked
  terms rehomed *before* stripping**, so the ratchet never fired — first batch that got ahead of it.
  Sixth source trap: the course spells it `customization`, British form 0×. Fifth false handoff,
  promise moved not rewritten. **Three probe artefacts in one session** — all instrument, not code.
  Evidence: `evidence/2026-08-19/t6-spms-m03-unblock/verification.md`.)
- **2026-08-19 — Module 7 unblocked: two lessons authored, and the corpus's worst composite
  repaired** (the forced order executed deliberately: author `SPMS-M07-L10` and `L11`, **then**
  rewrite `SPMS-M07-L08`. Its own-lecture support went **0.113 → 0.395**, margin **+0.048 →
  −0.243** — third-lowest of 252 to above the median; the new pair land at 0.500 and 0.482.
  Entries 252 → **254**, SPMS 53 → **55/84**, backlog → **29**. **UI/UX and DevOps were displaced
  with no home and that was fine** — checked against the syllabus terms first, neither is tracked.
  **`Team roles` was held up by the old lesson's title** and occurs **0 times** in the course, so it
  moved into `L10`'s prose, deliberately not a glossary heading. Fourth false handoff repaired. One
  770-char paragraph fixed by **rebalancing, not cutting**. Evidence:
  `evidence/2026-08-19/t6-spms-m07-unblock/verification.md`.)
- **2026-08-19 — The composite sweep: three more found, and the backlog is what unblocks them**
  (measurement only, no prose changed. The query needed no new code — `--dump` plus two conditions
  together: **leaning** (rival beats own by *under* the 0.10 flag threshold) **and weak own
  support** (below p25 = 0.348). Both are needed; 18 lean, 8 also match their own lecture weakly.
  Confirmed: `SPMS-M07-L08` (third-lowest own support of all 252), `SPMS-M03-L08`, `SPMS-M06-L09` —
  all three titled after two or three lectures. **`SPMS-M02-L03` cleared by reading**, so the list
  is a queue, not a verdict; four candidates unread. **Forced order, and it reframes the backlog:**
  a composite is only rewritable once the lectures it borrowed from have lessons, and **all six home
  lectures are unauthored** (`M07-L10`/`L11`, `M03-L07`/`L10`, `M06-L10`/`L11`) — so none can be
  repaired yet. Cheapest unblock is module 7, ~24k of transcript, freeing the worst composite.
  Recipe is protocol Step 4c, deliberately **not** a gate (`LAW-75`). Evidence:
  `evidence/2026-08-19/t6-composite-sweep/verification.md`.)
- **2026-08-19 — The two composite lessons are rewritten, and the reason for deferring them was
  false** (`SPMS-M05-L06` and `SPMS-M02-L07` now teach their own lectures; own-lecture match
  **0.263 → 0.530** and margin **+0.052 → −0.262** on the first, **0.447 vs 0.153** on the second.
  **Correction: both were recorded as "cited and scheduled" and are neither** — uncited, so the
  rewrite touched no scored coverage, no LAW-47, no scheduling; corrected in place across four
  files. The real risk was the coverage ratchet and it **fired** — `Competitive advantage` dropped,
  SPMS 99% against a 100% floor, taught back in `M05-L08` where its lecture makes the claim, no
  alias and no lowered floor. **A composite is only rewritable once its borrowed halves have
  homes** — these were unfixable before the same session authored the four lessons that carry them.
  Fifth source trap: the framework is spelled `BrainKraft` *and* `Braincraft`. Evidence:
  `evidence/2026-08-19/t6-composites-rewritten/verification.md`. **Open: nothing has swept the
  other 62 same-era lessons** for the defect — the signature is a positive margin *under* the 0.10
  flag threshold, and the gate does not report near-misses.)
- **2026-08-19 — Lessons become processes, and a lecture can now be folded into its neighbour**
  (owner direction: process-shaped, **small** explainer, synergistic. **Add-ins** are a real
  mechanism — `lesson()` registers them into `T6_LESSONS`, the one map the app, the scheduler,
  LAW-47 and every gate read, so a folded-in lecture counts as taught everywhere at once; a
  gate-invisible pointer was rejected as the "optional work" trap in a new hat. Lighter contract,
  but its own prose and glossary so the match gate still scores it. **Both shape-judging gates had
  to be taught it and the bank validator caught the omission.** Three lessons + the first add-in:
  entries 248 → **252**, SPMS 49 → **53/84**, backlog → **31**. `L05`/`L06` were assessed as a
  fold-in pair and **refused** — different skills. Explainers **256 words** vs 277–296 before.
  **Two more false handoffs, pointing at each other**, repaired. Evidence:
  `evidence/2026-08-19/t6-spms-m02-addins/verification.md`. Found here and **rewritten the same
  day**: `M02-L07`'s lesson was a composite, same class as `M05-L06` — see the entry above.)
- **2026-08-19 — SPMS module 5 is complete, and the handoff above the insertion point was already
  false** (three lessons: `SPMS-M05-L05`, `L07`, `L08`; file 245 → **248**, SPMS 46 → **49/84**,
  backlog 38 → **35**. First batch under the new policy. `L06`'s `connects` claimed to close the
  module with two lectures still to follow — **found before writing** by checking the insertion
  point, and the promise was **moved to `L08`**, not rewritten. Fourth source trap refused: the
  lecture says "modes", `moat` is 0× in M05 but 1× M02 / 3× M03, so it is prior vocabulary used in
  prose and **not** glossed. My own `L08` paragraph was **712 chars — the file's longest** — and
  trimmed before commit. Evidence:
  `evidence/2026-08-19/t6-spms-m05-complete/verification.md`. Found here and **rewritten the same
  day**: `M05-L06`'s lesson was a composite teaching half of `L08`'s lecture and little of its own —
  the class the match gate cannot see. It was recorded here as *cited*, which was **wrong**; it is
  uncited. See the entry above.)
- **2026-08-19 — The four decisions are answered: the whole course, at depth, every lesson read**
  (`DUNGEON_VISION_TO_BUILD.md` **ADOPTED**. Per-lesson acceptance, sampling rejected; the thin
  concept tiers rejected — every syllabus idea a concept at 8–14 surfaces, **finished only when it
  links**; scope is the entire course with **importance ordering it** and driving mock rotation;
  **uncited lectures are no longer optional** — a policy reversal in the authoring protocol's §0.
  ~2,000–4,000 new questions, stated up front. **Next move: the importance ranking.** Web-sourced
  material gets a provenance rule, and the mechanism does not exist yet — flag gaps, do not fill
  them.)
- **2026-08-19 — The mirror gate existed and never ran, and now the runner cannot lose a test
  again** (`tests/taught-not-tested.test.mjs` was on disk, passed 5/5 by hand, and was absent from
  `npm test`'s file list — **LAW-77**, the runner names its tests rather than discovering them, so
  a missing one is silence. Wired, plus `npm run check:tested`; then
  `tests/test-runner-completeness.test.mjs` asserts set equality between the list and the
  directory in both directions, demonstrated failing in both. `npm test` 120 → **128**).
  Authoring docs aligned both directions: **CONTENT-RULES R11** binds question authors to the
  tested-coverage ratchet, the lesson protocol's Step 4 names the `check:syllabus`/`check:taught`
  ratchets, and `DUNGEON_VISION_TO_BUILD.md` Phase 1 is marked done. Same session, earlier:
  `AGENTS.md` halved (story block → this ledger), two contradictory Known Gaps entries repaired,
  `docs/briefs/SYSTEMS_IMPROVEMENT_PLAN.md` written.
- **2026-08-18 — The misfiled-lesson queue is cleared** (10 flagged → 1 expected-state;
  nine rewritten against their own transcripts, `SPMS-M04-L01` found outside the queue; lessons
  243 → 245). Traps kept in `docs/briefs/MISFILED_LESSONS_WORK_ORDER.md`. **LAW-76**: the
  corpus is an input to every match score — diff before assuming blame, re-run after every
  batch.
- **2026-08-18 — SCLM is the second complete subject, 71/71** (33 lessons). **LAW-74**: a
  Windows text write flipped the lesson file to CRLF, and the build ships working-tree bytes.
- **2026-08-18 — IBM is the first complete subject, 78/78** (32 lessons; broken `connects`
  handoffs confirmed as the most reliable defect in authoring work — check the `connects`
  above every insertion point).
- **2026-08-18 — SCLM modules 1, 4 and 8** (six complete modules across two subjects; expect
  roughly one transcript-typo term per module — check occurrence counts before assuming a term
  is missing from the course rather than misspelled in it).
- **2026-08-18 — The subject rail, screenshots written down, and IBM modules 4 and 6** (phone
  rail hid two of four subjects, now the grid; **LAW-73**: a non-compositing pane freezes
  `document.timeline` so every CSS transition reads as its start value;
  `docs/governance/SCREENSHOTS.md` created).
- **2026-08-18 — IBM module 2 finished, and the brief that contradicted the ledger**
  (**LAW-72**: a self-contained brief is a second source of truth and drifts — it is read
  *instead of* the code; the authoring plan's §0 contradicted QUALITY-LOG I50).
- **2026-08-15 — The theme toggle, the route it never had** (`theme.js` shipped but no route
  mapped a URL to it — **LAW-69**: the build allowlist proves a file is deployed, never that a
  URL reaches it; **LAW-68**: a transitioned property does not follow a `light-dark()`
  re-resolution; login/privacy pages now themed; `app/admin.css` scoped out by owner).
- **2026-08-15 — Content accepted, and the four things measuring the promises found** (owner
  accepted the standing block in chat — not faculty review; the re-teach latch read a field
  never written; "was Strong" is now words, not colour; `ui-audit`'s type floor could never
  fail; two R3 items repaired before acceptance).
- **2026-08-15 — A reserved slice on every paper** (44 reserved items across all four
  subjects; "pick the second-longest" closed — the defence against "pick the longest" had
  manufactured it; a reserved item's bias is never diluted, it is on every paper).
- **2026-08-15 — The five open items, and the four gates that judge them** (T1/T2/T4/T5 built
  and each found something; the standard-normal table is a paper provision; BRGSA integrated
  slot reachable; two probe defects were the probes' own).
- **2026-08-15 — Both craft exploits closed, and the bag leaves the Examiner** (absolutes and
  name-matching at or under chance in every family; `docs/governance/UI-CHECKLIST.md` created;
  `npm run review` prints every gate beside the real option text).
- **2026-08-15 — The bank stops answering to its own heading** (324 → 28 option sets paying
  100%; `term_cloze` retired to `contrast` on owner decision; the mirror fix — stripping each
  concept's name from its own prose — is rejected and **must not be retried**).
- **2026-08-15 — A third of the bank answers to its own heading** (measured over all 1049
  option sets; the standing `relevantWrong()` diagnosis did not survive measurement; the
  name-matching gate now exits non-zero above 32% per family).
- **2026-08-15 — A learn run you can read, and the CLAs measured before they were used** (the
  harness drives the real subject rail; **LAW-65**: a diagnosis array with a hole at the
  correct option is an answer key; 48 CLA-derived items authored; the real papers' own largest
  exploit is "pick the longest", which the product had already fixed).
- **2026-08-15 — The ladder was in the bank and not in the product** (`courseLadder()` gives
  every set a step number, `examReadiness()` states paper coverage with a route out;
  evidence-driven re-teach replaced the one-way `lessonsRead` latch).
- **2026-08-14 — seven entries, one session arc:** text-fit probe; three levels replace four
  dials in the practice builder; the primer predicts instead of printing its answer;
  weaknesses practised linked or explicitly alone; **concepts layered** (94 descents over 37
  of 40 sets → 0, `lesson-layering.js` is the standing check); questions that name an example
  now show it (LAW-61); hosted written checking deployable and unmeasured.
- **2026-08-13 — the written-answer arc:** written transfer across Learn plus post-submit
  Examiner forensics; Dungeon-owned written diagnosis and repair; local Qwen
  criterion authority for practice only (cannot create Strong; hosted calibration still owed);
  the Learn/Exam switch; SPMS Section B completed and un-broken (LAW-53: multi-select shapes
  must not pay full marks for ticking everything).
- **2026-08-12 — the Examiner becomes a product:** mocks platform beside the learning system
  with a breakdown dashboard; design system, dark mode, mobile pass; **teaching layer 0→80
  complete** (724/724 scheduled questions taught); lossless workspace restructure;
  option-level diagnoses and a wrong-answer panel that explains itself; commit `0cc2c6d`
  deployed as Worker version `c602c4b3`.
- **2026-08-11 — foundation:** protected Cloudflare domain; approved-email admission with the
  one-time agreement gate; shared learner backend in D1; owner Control Room (force sign-out,
  lock recovery, participation panels); tester agents `PREPARED_NOT_ACTIVATED`; first external
  cohort active.

## Start Here — Required Order

1. Read this file top-to-bottom.
2. Read `docs/governance/DESIGN_SOURCE_INDEX.md` before product, art, UX, learning, or gameplay decisions.
3. Skim `docs/governance/BUG-LAWS.md` before implementing or changing anything.
4. Read `docs/governance/CONTENT-RULES.md` before authoring or changing any question, case, or option.
5. If the task affects UI, art, motion, accessibility, learning integrity, persistence, or
   performance, skim `docs/governance/QUALITY-LOG.md`.
6. Check Known Gaps and active `WAITING_*` gates before beginning dependent work.
7. **Need a screenshot? Read `docs/governance/SCREENSHOTS.md` first, not the Browser pane's
   screenshot tool, which cannot work here.** One command: `node tools/screenshot.mjs --port <port>`.
   The pane composites no frames unless a human is looking at it, which also **freezes
   `document.timeline` at 0 and makes every CSS transition read as its start value** — three
   sessions have re-derived this, and the artefact has been filed as a CSS bug twice and
   nearly a third time (`LAW-73`).

## Collaborators — Read Before Your First Push

**`main` is the deploy trigger.** `aneeketBTN/Dungeon` is connected to Cloudflare Workers Builds, so
a push to `main` builds and publishes to the live domain, where a real tester cohort is active. There
is no staging step between the two. Work on a branch, open a pull request, and let the owner merge.
Never push or merge to `main` yourself. A bad version is rollback-able from Workers → Deployments,
but the testers will have seen it.

**Clone and run — no install step, no credentials.** These work immediately after cloning:

```text
npm test                     # 35 release-boundary, routing, access, and header checks
node tools/build-site.mjs    # produces the deployment artifact in dist/client
python tools/server.py 8099  # local dev server; open http://localhost:8099/
```

**The content gates need the external lecture transcripts, which are not in the repo and cannot be.**
`tools/validate_t6_bank.js`, `tools/check_lesson_file.mjs`, and `tools/build_t6_lessons.mjs` each
take the transcript root as their first argument (see Directory Map for the layout). **Mind the
failure mode:** given a *wrong* path the bank validator reports `ok: false` / `Missing lecture
source`, but given *no argument at all* it returns `ok: true` with an empty `"coverage": {}` — it has
silently skipped every lecture check, including the entire LAW-49 vocabulary gate. A green run with
an empty coverage block means nothing was verified, not that everything passed. Always pass the path,
and ask the owner for a copy of the transcripts before taking any bank or lesson-authoring task.
Everything else in the repo is self-contained.

**Live learner data is deliberately absent.** `data/state/`, `data/history/`, `work/`, `outputs/`,
and the tester CLAs are ignored by git and stay on the owner's machine. Do not add fixtures under
those paths, and do not treat an empty `data/state/` as a bug.

## Ledgers — Read Before Implementing

`docs/governance/BUG-LAWS.md` is a living, tiered decision aid, not a veto list:

- 🔴 **REDLINE**: a severe demonstrated failure. Follow its comply path.
- 🟡 **WATCH**: a recurring or credible gotcha. Run its verification check.

REDLINEs constrain HOW, never WHETHER. If a Law blocks a good idea, revise the Law and preserve
the safety property.

`docs/governance/QUALITY-LOG.md` owns the costly quality axes: truthful interaction, learning integrity,
accessibility, visual/motion coherence, persistence safety, and user-visible performance.
Standing owner rule: never improve polish, speed, or engagement by weakening answer correctness,
question readability, state truthfulness, accessibility, or real player data.

## Evidence Gates and Status Vocabulary

Every tracked goal, route, scene, or feature carries exactly one status:

`UNSTARTED → DIAGNOSED → IMPLEMENTED → VERIFIED(<evidence>) → DONE`

or `WAITING_<GATE>`, such as:

- `WAITING_OWNER_BRIEFS`
- `WAITING_REAL_BROWSER`
- `WAITING_COMPUTER_USE`
- `WAITING_OWNER_DECISION`
- `WAITING_OWNER_ASSETS`
- `WAITING_PROD_DATA`
- `WAITING_OWNER_CONTENT_ACCEPTANCE`

Rules:

- “Fixed,” “verified,” “ready,” and “done” require a pointer to evidence in `evidence/`.
- Source inspection and synthetic/local checks are secondary evidence.
- Visual/interaction acceptance requires the declared real Browser or Computer Use path.
- A dependent task does not start while its required gate is waiting.
- If new evidence contradicts an earlier claim, the evidence wins. Correct the status,
  `docs/governance/CHANGELOG.md`, and relevant ledger in the same session.
- DONE means all named acceptance sources passed, not merely that code was written.

## Directory Map

Root holds only what tools and GitHub discover by convention: `AGENTS.md`, `CLAUDE.md`,
`README.md`, `SECURITY.md`, `package.json`, `.gitignore`, and `.gitattributes`. Everything else
lives under a named directory.

**What ships to learners**

- `app/` — the live T6 route and nothing else: exactly the files in the build allowlist, which
  `node tools/build-site.mjs` reports as it runs (18 on 2026-08-14; this entry said "sixteen" until
  then, and the count has moved twice since it was written — read it from the build, not from here).
  A file here reaches production. If it should not, it does not belong in this directory.
- `tools/` — release build, bank validator, lesson-file check, lesson candidate extractor,
  agent-readiness check, and the local dev server and launchers. Nothing executable lives in `app/`.
  `tools/browser-checks/` holds checks that must run **in the page** rather than in Node, because the
  property under test belongs to the running app — evaluate the file's contents in the browser.
  `tools/lib/` holds code shared between tools; anything that reads the external lecture source goes
  through `tools/lib/clean_transcripts.js` so the three gates cannot disagree about what a lecture is.
- `cloudflare/` — the **deployed** Worker: exact-path router, approved-email learner sessions, the
  agreement gate, signed owner Access validation, tester allowlist controller, applied D1
  migrations, and standalone packaging fallback. Workers Builds deploys from this path; its root
  directory is configured in the Cloudflare dashboard, so **do not move this directory** without
  changing that setting first.
- `sites-backup/` — the private Sites entrypoint. **Not** the deployed Worker, and diverged from it;
  read `sites-backup/README.md` before treating it as a fallback.
- `db/` — readable mirror of the learner-backend tables; applied history is `cloudflare/migrations/`.
- `tests/` — release-boundary, routing, access-management, and security-header checks.

**Documentation**

- `docs/governance/` — ledgers and authority: `DESIGN_SOURCE_INDEX.md`, `BUG-LAWS.md`,
  `QUALITY-LOG.md`, `CHANGELOG.md`.
- `docs/briefs/` — owner-supplied briefs and durable implementation mappings. Add each new external
  brief here or index its connected-source location in `docs/governance/DESIGN_SOURCE_INDEX.md`.
- `docs/authoring/` — repeatable content-production procedures. `LESSON-AUTHORING-PROTOCOL.md` is the
  handoff for the 0→80 teaching layer: source material, the lesson contract, the batch procedure, the
  gates, the traps already paid for, and the definition of done per subject. **Read it before
  authoring any lesson**, including when resuming mid-subject.
- `docs/engine/` — `PROMPT.md` (procedural-engine authority) and `REVIEW_LOG.md` (rationale).
- `docs/design/` — art direction, the proposed product-wide system, the legacy UX loop, personas.
- `docs/community/` — tester guide, community playbook, privacy, and the closed-test agreement.
- `docs/ops/` — machine transfer and local launch notes.

**Data, evidence, and history — treat as records, not working files**

- `data/state/` — live game and learner state. Real player data; do not clear for testing.
- `data/history/` — real question and flag history. Do not repurpose as test fixtures.
- `data/graphs/` — generated subject concept graphs. Do not hand-edit during product/UI work.
- `evidence/` — named acceptance evidence by date/task. **Frozen**: entries describe what was true
  on their date, so their paths are not rewritten when directories move.
- `legacy/` — `rogue/` (the cinematic slice), `prototypes/` (older subject pages and their sets),
  and the untracked `CLAs/` source material. Reference only; nothing here ships.

**Working material and control planes**

- `outputs/` — rendered/candidate media and separated production assets.
- `work/` — source research, animation frames, scripts, and intermediate art outputs. `work/t6_lessons/`
  holds generated lesson candidates from the Term 6 pack; they are an authoring aid, not shipped content.
- `.agents/` — paused tester-agent charters, consent-safe data contracts, synthetic fixtures, and
  fail-closed activation gates; three project schedules are registered `PAUSED` and none is running.
- `.claude/` — Claude-specific configuration and the state-manager agent.
- `.openai/` — Sites project binding; contains no runtime secrets.
- `coordination/` — authority charter and append-only agent/tool exchange notes.
- `_TRANSFER/` — historical transfer/setup memory; not current product authority, and frozen for
  the same reason as `evidence/`.

The Term 6 lecture source is **external** — not part of this repository, and not distributable
through it. The authority is the clean transcripts:

`C:\Users\knigh\OneDrive\Desktop\exam\Term 6 Clean Transcripts`

laid out as `<root>/<SUBJECT>/<SUBJECT>_M<NN>_SUM_TRANSCRIPT.txt`: one file per module, holding its
lectures in teaching order behind `## <code> | <title>` headers. A lecture's identity is its
**position** in that file (the Nth section is `L<N>`), not the recording code in the header — module
2 runs C10, C01, C02 … C12, so the codes are not even monotonic. `tools/lib/clean_transcripts.js` is
the loader; `tools/validate_t6_bank.js` and `tools/check_lesson_file.mjs` go through it and take this
root as their first argument.

**`tools/build_t6_lessons.mjs` is the exception and still requires the old pack.** It reads
`graph/LECTURE_MANIFEST.jsonl` and the `dense/` layer directly and has not been migrated to the
loader, so it must be given the AI-Ready Pack root instead; pointed at the clean transcripts it dies
with `ENOENT ... LECTURE_MANIFEST.jsonl`. It is an authoring aid that writes candidates to
`work/t6_lessons/`, not a gate, so this does not affect verification — but do not assume one path
argument serves all three tools.

The older `Term 6 AI-Ready Pack` (`graph_source/`, `graph/LECTURE_MANIFEST.jsonl`, `dense/`,
`subject_core/`, `indexes/`) is still *readable* so existing invocations do not hard-fail, but it is
**no longer the source of truth**: its dense layer produced lines that are incoherent out of context,
and its concept index is by its own README a retrieval-candidate list rather than course vocabulary.
Authoring against it is precisely what LAW-49 exists to catch. Prefer the clean transcripts.

If a directory grows beyond roughly 20 meaningful files without an index, flag it. Frame sequences
and generated outputs are exempt when their parent has a manifest/contact sheet.

## Key Files

| Path | Controls | Verified |
| --- | --- | --- |
| `AGENTS.md` | Codex living index, status, gates, rituals, source rules, and project conventions. | 2026-08-13 |
| `CLAUDE.md` | Claude compatibility entry; points to this operating index and preserves engine startup facts. | 2026-07-16 |
| `docs/governance/DESIGN_SOURCE_INDEX.md` | Authority order, brief inventory, and unresolved product conflicts, including C31's narrow response-latency resolution. | 2026-08-13 |
| `docs/briefs/PROJECT_OPERATING_SYSTEM.md` | Durable requirements and Codex adaptation of the owner-supplied admin-system brief. | 2026-07-16 |
| `docs/briefs/T6_EXAM_PATTERN.md` | **Authority for paper structure.** Batch 1 sections, counts, marks, negative marking, calculators, and what remains unclaimable. Closed `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`. | 2026-08-12 |
| `docs/briefs/T6_REVISION_FALLBACK.md` | Active dashboard, adaptive-primer, source-boundary, mastery/repetition, and acceptance contract. | 2026-08-11 |
| `docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` | Confidence, eight-gate evidence state, adaptive-primer, boss, mixed-format, rotation, timing, and retest contract. | 2026-08-13 |
| `docs/briefs/T6_RESEARCH_REVIEW_IMPLEMENTATION.md` | Owner-supplied first-cohort research review mapped to confidence, construction, practice-shape, accessibility, and evidence decisions. | 2026-08-11 |
| `docs/briefs/DUNGEON_MEASUREMENT_AND_JUDGEMENT.md` | Measurement direction, small-cohort claims, local Qwen criterion-authority contract, two-machine architecture, calibration gate, and remaining owner decisions. | 2026-08-13 |
| `docs/briefs/TESTER_ACCESS_AND_ADMIN.md` | Admission, private group-invite disclosure, community acknowledgements/bumps, owner operations, and remaining boundaries. | 2026-08-11 |
| `docs/governance/BUG-LAWS.md` | Living REDLINE/WATCH bug-prevention rules and exact comply/verify paths. Newest is `LAW-76` on corpus-relative gates. | 2026-08-18 |
| `tools/check-lesson-lecture-match.mjs` | Does each lesson teach the lecture its id names? Scores a lesson's distinctive vocabulary against its own lecture and every other lecture in the subject, and flags one that a rival explains better. The only gate on that claim; needs the transcript path. Its scope limit is in its header — it finds misfiled lessons, not half-written ones. **Its scores are corpus-relative, so editing one lesson re-scores the rest (`LAW-76`), and a `FAIL` naming `SPMS-M01-L01` alone is the expected state.** | 2026-08-18 |
| `tools/measure-concept-importance.mjs` | Ranks every syllabus idea against owner direction of 2026-08-19 — **repetition, tie to a foundational concept, numerical, multi-step**, the last two carrying half the weight. `npm run measure:importance`; `--why "<term>"` explains one, `--course`/`--module` narrow, `--json` for machines. **A measurement, not a gate** (`LAW-75`); exits 0 always. Three things to know: **IBM scores 0 throughout because its paper has no objective section** — use **`--written`** to order IBM and BRGSA's written work; the 16 `[foundational]` terms rank on their own repetition *and* are the yardstick for everything else's tie score; and an owner-authored `"importance"` on a term entry always beats the derivation. Two components were measured, found degenerate and changed — see its header before adding a fifth. | 2026-08-19 |
| `tools/measure-concept-spine.mjs` | The shape everything else hangs off: concepts, surfaces per concept, link edges, cross-module edges, isolated concepts. `npm run check:spine`. **Links are derived, never authored** — an edge exists only where one surface names two concepts via `conceptId` + `supportingConceptIds`. `--gate` asserts a structural invariant (every concept reachable by `groupWeaknesses()`), not a calibrated threshold, so it does not repeat `LAW-75`; demonstrated failing and passing. Two findings it exists for: **`pair.slice(0, 2)` means a third concept in a module is born unlinked — and orphans whichever existing concept sorts third**, and **SPMS has zero cross-module links**. | 2026-08-19 |
| `tools/build-concept-layer.mjs` | **The layer**: every syllabus idea's position (first lecture), role (`spine` root or `supplementary`) and parent (the higher-contribution idea it elaborates). `npm run build:layer`. Importance here is **contribution to the course** — module reach — per owner direction 2026-08-19, not exam marks. 324 placed, 35 unmatched, 76 roots. **It proposes and does not decide**: about three-quarters of parents read defensibly, so an authored `"tier"` on the term entry always wins. Two traps in its header: a spine set by *threshold* put 40 of 115 SPMS ideas in it, and co-occurrence at *lecture* granularity parents everything to everything. | 2026-08-19 |
| `tools/measure-syllabus-coverage.mjs` | Do the LESSONS reach every named syllabus idea? Phrase-contiguous ratchet over `data/syllabus/<SUBJ>.terms.json`; currently 359/359 and floored — rewording can drop a term, teach it back rather than alias. `npm run check:syllabus`; in `npm test`. | 2026-08-18 |
| `tools/check-taught-vocabulary.mjs` | Does a lesson TEACH what its questions ask, not just cite the lecture? Closes the LAW-47 citation-vs-content hole (RICE: 20 questions, 0 teaching lessons, all gates green). `npm run check:taught`; in `npm test`. | 2026-08-18 |
| `tools/check-taught-not-tested.mjs` | The mirror of LAW-47: does the BANK ever name each taught syllabus idea? All four ratchet floors are now 100%; `--triage` splits any future miss into naming drift vs genuine holes. Binds question authors via CONTENT-RULES R11. `npm run check:tested`; in `npm test`. | 2026-08-20 |
| `tests/test-runner-completeness.test.mjs` | Asserts set equality between `tests/*.test.mjs` and the paths `package.json`'s `test` script names, both directions, over a floored population. Exists because `npm test` **names** its tests rather than discovering them, and the list has drifted both ways without ever failing (`LAW-77`). Add a test file *and* its path, or this fails. | 2026-08-19 |
| `docs/governance/QUALITY-LOG.md` | Experience-quality practices, issue/cause/fix history, and watch items. | 2026-08-18 |
| `docs/governance/CHANGELOG.md` | Newest-first, append-only history of sessions that changed the workspace. | 2026-08-18 |
| `docs/design/ART_DIRECTION.md` | Creative thesis and canonical world/art identity. | 2026-07-16 |
| `docs/design/ART_DIRECTION_SYSTEM.md` | Proposed product-wide art, UI, character, asset, and motion system. | 2026-07-16 |
| `docs/design/GAME_UX_LOOP.md` | Proposed broad-product player flow; retained as legacy direction while the T6 fallback owns the active exam-season path. | 2026-08-10 |
| `docs/ops/MAC_TRANSFER.md` | Verified Mac/Computer Use setup, exact LM Studio checkpoint, private Windows→Mac SSH loopback launcher, Mullvad boundary, calibration, and local/production separation. | 2026-08-13 |
| `docs/engine/PROMPT.md` | Current procedural learning engine, subject rules, scheduling, personas, ranks, and save contracts. | 2026-07-16 |
| `docs/engine/REVIEW_LOG.md` | Historical engineering rationale for the learning engine. | 2026-07-16 |
| `docs/design/personalities.md` | Historical reinforcement/persona design brief; `docs/engine/PROMPT.md` wins when implemented behavior differs. | 2026-07-16 |
| `README.md` | Student-facing active T6 launch, loop, exam-pattern boundary, progress isolation, scenarios, and legacy paths. | 2026-08-11 |
| `docs/community/TESTER_GUIDE.md` | Controlled-cohort entry, primer expectations, group participation, structured feedback, and known limits. | 2026-08-11 |
| `docs/community/PRIVACY.md` | Tester-facing D1/browser data, coarse response-time disclosure, local loopback-grader separation, community timestamps, location security, retention, and telemetry boundary. | 2026-08-13 |
| `SECURITY.md` | Private vulnerability-reporting and release-safety policy. | 2026-08-11 |
| `docs/community/COMMUNITY_PLAYBOOK.md` | WhatsApp structure, join/bump protocol, human removal review, the required change-announcement format, and feedback triage. | 2026-08-11 |
| `.openai/hosting.json` | Opaque Sites project binding only; runtime credentials never belong here. | 2026-08-11 |
| `.agents/README.md` | Paused tester-agent control plane, authority boundary, and activation order. | 2026-08-11 |
| `.agents/deployment.json` | Fail-closed activation gates, paused automation IDs, models, cadence, and non-running declarations. | 2026-08-11 |
| `.agents/contracts/tester-event.schema.json` | Consented pseudonymous event contract, `1.1`. Learning **and** examiner event types under **separate consent scopes**, enforced both ways by an `allOf` rule; examiner fields are banded or bounded, never exact, because the cohort is small enough for an exact mark to identify. | 2026-08-12 |
| `tools/validate-agent-readiness.mjs` | Validates paused charters, synthetic consented events, forbidden fields, and activation blockers. Reads allowed versions/scopes from the contract rather than restating them, and rejects any event whose consent scope does not match its type. | 2026-08-12 |
| `package.json` | Dependency-free release build, validation, 50-test suite, and local-grader calibration commands. | 2026-08-13 |
| `tools/build-site.mjs` | Allowlists the learner/admin/protection assets and produces the deployment artifact; prints the count it shipped (18 on 2026-08-14). | 2026-08-14 |
| `sites-backup/worker.mjs` | Private Sites backup entrypoint, **not** the deployed Worker: learner/admin redirects, health response, static delivery, and security headers. Diverged from `cloudflare/src/index.mjs` and has no agreement gate. | 2026-08-12 |
| `sites-backup/README.md` | Records why this worker is not production and what must be reconciled before promoting it. | 2026-08-12 |
| `cloudflare/src/index.mjs` | Exact-path router (**a file in `app/` needs a route here as well as a place in the build allowlist — `theme.js` had the second and not the first and 404'd in production; LAW-69**), admission/sessions, agreement/community state, D1 progress, signed owner Access, tester management, the per-tester and cohort written-check ceilings, the written-answer archive with its per-row expiry, and the daily `scheduled` purge that keeps retention running after the cohort goes quiet. | 2026-08-15 |
| `cloudflare/migrations/` | Applied D1 history for auth/progress, browser/country locks, agreement acceptance, community timestamps, per-tester and cohort written-check metering, and `0007_written_answer_archive.sql` — the only table holding a learner's own prose, with the expiry and cascade that make the three-month promise and withdrawal real. | 2026-08-14 |
| `db/schema.ts` | Readable mirror of tester, session, progress, agreement, and community-state table shapes. | 2026-08-11 |
| `app/login.html` | Approved-email entry and the one-time agreement/group step with private invite placeholder and two acknowledgements. Loads `theme.js` before the stylesheet, because it is the first screen anyone sees and a stored dark choice must not flash white here. | 2026-08-15 |
| `app/login.css` | Login and agreement presentation for `login.html` **and** `privacy.html`, the `[hidden]` guard required by LAW-36, and the narrow-viewport layout. Palette paired on t6.css's contract — every colour a `light-dark()` token, no literal outside the block, light values byte-identical to the unpaired version — plus the one-frame `data-theme-switching` rule (LAW-68). | 2026-08-15 |
| `app/login.js` | Admission, approved-only invite binding, open-before-join gate, agreement submission, and recovery. | 2026-08-11 |
| `docs/community/DUNGEON_CLOSED_TESTER_AGREEMENT.md` | Closed-test agreement source with group participation, reminder, and owner-reviewed removal terms. | 2026-08-11 |
| `work/build_tester_agreement.py` | Builds the verified two-page agreement DOCX for Word/PDF delivery. | 2026-08-11 |
| `cloudflare/tools/build-standalone.mjs` | Embeds the allowlisted release and bundles the Worker for authenticated API deployment fallback. | 2026-08-11 |
| `cloudflare/wrangler.jsonc` | Deployed Worker asset binding, exact domain route, Access identifiers, the daily retention cron, the inert written-authority activation vars, and observability configuration; no secret values and deliberately no Vectorize binding. | 2026-08-14 |
| `cloudflare/src/written-authority.mjs` | Hosted marking and coaching: activation gates keyed to the exact model and the evidence pack's own digest, distress interception ahead of every other check, frozen-evidence lookup, bounded structured completion with one retry, and abstention as the default. No Vectorize, no embedding call. | 2026-08-14 |
| `cloudflare/src/generated/written-evidence.mjs` | Generated, do not hand-edit. Each question's frozen course evidence — 380 chunks over 64 questions, 511 KiB — plus the content digest that `DUNGEON_HOSTED_WRITTEN_CORPUS` must name before hosted marking runs. | 2026-08-14 |
| `tools/build_written_authority_assets.mjs` | Builds the hosted question manifest and freezes each question's course evidence, stamping the pack with its own digest. Without `DUNGEON_TRANSCRIPTS` it keeps the committed pack, so a checkout without the private lecture material still runs the gates. | 2026-08-14 |
| `tools/evaluate-hosted-grader.mjs` | Hosted calibration. Calls `gradeHostedAnswer` itself with only `env.AI.run` swapped for the REST endpoint, so it measures the shipped path rather than a parallel implementation. Needs a Workers AI token and nothing else. | 2026-08-14 |
| `cloudflare/README.md` | Live route, runtime-secret, Access-policy, owner-bootstrap, and rate-limit contract. | 2026-08-11 |
| `cloudflare/tools/build-standalone.mjs` | Builds the same protected allowlist as an embedded-asset fallback when an Assets upload path is unavailable. | 2026-08-11 |
| `tests/site-release.test.mjs` | Release-boundary, anonymous-invite secrecy, privacy, routing, header, and setup checks. | 2026-08-11 |
| `tests/cloudflare-access.test.mjs` | Owner auth, tester management, agreement/community state, bump, routing, health, cache checks, the assertion that every local asset a shipped page references actually resolves to a route (LAW-69), the cohort spend ceiling, and one test per promise the privacy notice makes about stored answers: the stated expiry, distress never stored, deletion on request, deletion on withdrawal, and a mark that survives a storage failure. | 2026-08-14 |
| `tests/agent-readiness.test.mjs` | Proves the tester-agent scaffold is healthy, privacy-bounded, and not deployable. | 2026-08-11 |
| `app/admin.html` | Owner control room for tester management, per-person/bulk group bumps, release health, and feedback triage. | 2026-08-11 |
| `app/admin.css` | Responsive control-room status/actions, including narrow stacked tester rows. | 2026-08-11 |
| `app/admin.js` | Cohort onboarding, revoke/unlock, per-tester and bulk **force sign-out** with live session counts, per-tester **Delete answers** for a deletion request that is not a withdrawal, community bumps, agreed/older-terms/never-agreed chips, learning signals, and manual copy helpers. | 2026-08-14 |
| `app/theme.js` | Theme bootstrap loaded synchronously in `<head>`: reads the stored appearance before first paint, exposes `T6Theme` (get/set/next/resolved/onChange), and follows the system setting when unset. `repaint()` suppresses transitions across a switch and forces the recalculation while they are off, because a transitioned property otherwise keeps the previous theme's value indefinitely (LAW-68); it is released on a frame callback *and* a timer, since a non-compositing tab never gets a frame. Separate from t6.js because the release serves `script-src self`, so the usual inline head script is blocked. Loaded by `t6.html`, `login.html` and `privacy.html`. | 2026-08-15 |
| `tools/check_exam_readiness.mjs` | **Exam-pattern gate and authoring worklist.** `npm run check:exam [SUBJECT]`. Reads `EXAM_PAPERS` out of `app/t6.js` (one source of truth, not a copy) and multiplies it by the bank: which sections cannot be filled and what that costs in marks, whether a negatively marked section is free to a candidate who ticks everything (LAW-53), and how many questions are *forced* to share one visible prompt. Prints "N × type for SUBJECT Section X", soonest paper first. Run it before authoring and after. | 2026-08-12 |
| `tools/check-palette.mjs` | Palette gate. Parses the `light-dark()` pairs out of `app/t6.css` itself and measures 140 contrast pairings, grayscale separation, and three colour-vision simulations in both themes, then asserts the four evidence states are shape-distinct. Run after touching any colour token. | 2026-08-12 |
| `tools/browser-checks/ui-audit.js` | UI audit probe, evaluated **in the page**: overflow, tap targets under 44px, corner radii off the four-step scale, paragraph density, type scale, and ragged rows. Used for the mobile pass; re-run per screen and per viewport. | 2026-08-12 |
| `app/t6.html` | Four-question homepage (what am I doing / where can I start / how am I doing / additional resources), subject rail, hero with the one next action and distance to goal, single-entry practice builder, matrix/trend/totals, one concept list, lesson surface, layered questions, in-question glossary, plans, results, the header Learn/Exam switch, the bag drawer, and the examiner home's recommended-paper hero. | 2026-08-13 |
| `app/t6.css` | Homepage block rhythm and the four-question layout, chip builder, concept-shelf rows with inline evidence, matching board, lesson/glossary presentation, flat primer/question hierarchy across desktop and narrow layouts, the case/task split (named case, named ask, one rule between material and instruction, 62ch measure), and the two-product switch: thumb geometry, the `::view-transition` direction rules and their reduced-motion form, and the ≤760 header compaction that keeps the switch from overflowing a phone. In the exam palette legend a chip is a swatch and no longer inherits the 44px tap floor, which was overflowing its own 26px grid track onto the label beside it at every desktop width (LAW-64). Carries the one-frame `data-theme-switching` rule that suppresses transitions across a theme change, without which every button keeps the previous theme's fill (LAW-68). | 2026-08-15 |
| `app/t6.js` | Teach-before-test queue invariant, **concept layering** (selection stays variety-driven; delivery is sorted by teaching rank and `layeredQueue` drains a pre-committed lesson list so lesson order is monotonic by construction), **weakness linking** (`conceptLinks` derives edges from co-tested surfaces only; `groupWeaknesses` pairs a weak concept with a weak partner and reports the rest as isolated), lessons/primers, eight-gate mastery with ephemeral response timing and banded Strong eligibility, persistence, deterministic scenarios, the floating bag, product crossing, and the examiner's seeded papers, analysis, repair sittings, and locally-buffered non-transmitting telemetry shaper. `lessonHandoff()` is separated from its markup and exposed through `window.__dungeonExport.handoffs()`, so the harness reads the app's own run-relative correction to a lesson's "the next lecture" promise instead of the raw `connects` string. | 2026-08-15 |
| `app/sets/t6_brgsa.js` | Original BRGSA ten-set bank with 60 grounded questions. | 2026-08-10 |
| `app/sets/t6_catalog.js` | Four-course catalogue, 64 dashboard concepts, three-perspective surfaces, and 156 IBM/SCLM/SPMS questions. | 2026-08-10 |
| `app/sets/t6_challenges.js` | Mixed-format augmentation, 64 adaptive primers, bosses/constructed responses, scored pools, relevance-first distractor selection, case-lecture provenance, the option-diagnosis pass (an authored MCQ diagnosis now survives it, as an MSQ one already did), and the authored SPMS multiple-select, SCLM numeric, and **48 course-assessment `_cla` items** (SCLM 32, BRGSA 16). The multi-select builder carries `caselet` (LAW-61). New families live here rather than in a new file on purpose — `t6_integrated.js` was added as one and was missing from four load lists at once. | 2026-08-15 |
| `app/sets/t6_diagnoses.js` | 78 authored option diagnoses for distractors with no machine-knowable provenance, plus the authoring rules. | 2026-08-12 |
| `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` | Handoff procedure for the teaching layer: sources, lesson contract, batch procedure, gates, the traps already paid for, and per-subject definition of done. IBM and SCLM are complete; SPMS is the whole remaining backlog. Read before authoring any lesson. | 2026-08-18 |
| `app/sets/t6_lessons.js` | Teaching layer: **262** registered entries (objective, explainer, worked example, glossary, handoff) that must be delivered before anything about that lecture is scored. **`lesson()` also expands `addIns`** — a lecture folded into a neighbour's lesson — into real entries here, which is why every gate and the scheduler see them; the lighter add-in contract is in the authoring protocol. All four subjects complete on cited lectures; 724 of 724 scheduled questions taught. **BRGSA, IBM and SCLM are complete on every lecture**; **21 SPMS lectures remain** (modules 1, 2, 3 and 5 complete), readable-but-unscheduled until the concept spine widens — **no longer optional** (owner decision 2026-08-19). Not sorted by lecture order — see the authoring plan before assuming a neighbour. | 2026-08-19 |
| `tools/lib/clean_transcripts.js` | The one loader for the external lecture source. Reads the clean transcripts (position in the module file is a lecture's identity, not its recording code) and still accepts the old AI-Ready Pack layout; `sourceKind` says which was read. | 2026-08-12 |
| `tools/build_t6_lessons.mjs` | Extracts lesson candidates from the external lecture source — objectives, glossary terms with first-use, worked-example lines, provenance — into `work/t6_lessons/`. Extraction only; prose is authored. | 2026-08-12 |
| `tools/check_lesson_file.mjs` | Authoring-time gate: reports every structural defect in one pass (bracket class, record shape, prose limits) and, given the pack, prints the exact next batch of lectures to author. Run between batches, before the bank validator. | 2026-08-12 |
| `tools/browser-checks/teach-before-test.js` | LAW-47 verification, evaluated in the page: walks every study set and the mixed builder from an empty `lessonsRead` and asserts no surface precedes a lecture it cites. Not a Node test — re-implementing `layeredQueue()` would drift from the real scheduler. | 2026-08-12 |
| `tools/browser-checks/measurement-evidence.js` | Browser-side fixture check proving one otherwise-identical body of evidence is Strong while one with a rapid fifth response remains Developing and states why. | 2026-08-13 |
| `tools/browser-checks/weakness-linking.js` | Weakness-linking check, evaluated in the page and staged across reloads (LAW-62). Drives the real weakness route with an all-paired and an all-isolated fixture and asserts three things: no pair is claimed that the bank does not connect, every claimed pair is closed by a surface testing both, and an isolated weakness is never folded into a pair. Recomputes the bank's edges itself rather than asking the app, since the app is what it checks. | 2026-08-14 |
| `tools/browser-checks/lesson-layering.js` | Concept-layering check, evaluated in the page: asserts every study set in all four subjects delivers its scored questions in non-decreasing lecture order (a question ranks by the last lecture it cites; bosses and constructed responses excluded). Measures questions rather than lessons on purpose — see LAW-62 — and explains why in the file. Run it beside `teach-before-test.js`: layering says the order is the course's, LAW-47 says nothing is tested before it is taught. | 2026-08-14 |
| `tools/screenshot.mjs` | **Pixel acceptance.** Drives headless Chrome (or Edge) against `tools/shots/frame.html` and writes 16 shots over 5 screens × 2 viewports × both themes into `outputs/shots/`. No CDP, no WebSocket, no dependency. Reads each frame's `<title>` back to fail a shot whose scene did not complete, so a red panel is reported rather than filed. `--port` is required; `--only <scene>`, `--out`, `--chrome` optional. | 2026-08-15 |
| `tools/shots/frame.html` | The driver frame the screenshot tool photographs. Same-origin with the app, so it opens `/app/t6.html` in a fixed-width iframe and walks it to the requested screen through the real controls — the LAW-64 iframe technique used for pictures instead of numbers. Every step **waits** for what it is about to press (the dashboard renders after boot; crossing to the examiner is a view transition), then finishes every animation repeatedly until two consecutive checks find nothing running. Outside the build allowlist, so it cannot ship. | 2026-08-15 |
| `docs/briefs/PROMPT-BANK-OVERHAUL.md` | The full brief for the bank re-check / rehaul / recreate and the examiner-only slice: prerequisites, the four questions the work is judged against, the measured before-state, the six acceptance tests to build, failsafes, every trap already paid for, and the open items to pick up. | 2026-08-15 |
| `docs/briefs/PROMPT-EXPERIENCE-AND-TELEMETRY.md` | The brief for the student-experience check and the Term Dungeon decision dashboard: what to measure and why each figure changes a decision, the two-phase privacy path (Phase 1 needs no policy change; Phase 2 costs a re-acceptance gate), how to get item-level signal from eight testers, and what not to build. | 2026-08-15 |
| `tools/browser-checks/export-run.js` | **Persona harness, learn half**, evaluated in the page. Drives the real subject rail (click the card, assert the app moved, open the set, assert the run is the right subject's), refuses on a profile that has already been taught (LAW-62), and returns a ~1 KB ordered skeleton rather than the run's prose. Also recomputes the paper digest from the app's own builder and compares it against the Node-written file **in the page**. One subject per page load; reload between subjects. | 2026-08-15 |
| `tools/export-learn-run.mjs` | Hydrates that skeleton into `<SUBJECT>-set<N>.learn.json` (candidate view) and `.learn.key.json` (answers **and the per-option feedback**). No scheduling rule is re-implemented — every field is a lookup in `app/sets/*.js`. Fails on an unresolvable id, on a queue/digest mismatch, and on any leaky field in the candidate object (LAW-65). | 2026-08-15 |
| `tools/export-persona-run.mjs` | **Persona harness, paper half.** Mirrors the exam paper builder in Node and writes sets 1–3 per subject, blind file plus key. The mirror is allowed because `export-run.js` checks its digest against the live app; that guard is what found F-47. | 2026-08-15 |
| `tools/run-persona-strategies.mjs` | The reported exploits stated as code and scored against the key, over **sets 1–3 with the mean as the headline** — one seed cannot tell a bank change from a draw. Ties resolve to the expected value of a random pick among survivors. The standing F-06 / F-07 gate. | 2026-08-15 |
| `tools/measure-learn-craft.mjs` | The same idea inside a **study set**, over every selectable part (cloze blank, match row, boss step, mcq). Companion to the above, not comparable with it. Reports the exploit a mock cannot see: name-matching the concept pays 45–60%. | 2026-08-15 |
| `tools/measure-name-matching.js` | **R3's on-topic-ness gate**, the one that said "none yet". Scores "keep the options naming the concept" over **every option set in the built bank** (1049), per family and per subject, with `measure-learn-craft.mjs`'s exact rule so the numbers are comparable. `--gate` exits non-zero above 32% per family, 10% for `connect`. Currently **exits 0**: 28 sets pay 100%, down from 324. | 2026-08-15 |
| `docs/governance/SCREENSHOTS.md` | **Read before trying to screenshot anything.** The Browser pane's screenshot cannot work here and no retry, reload, resize or tab-select fixes it — an undisplayed pane composites no frames. `node tools/screenshot.mjs --port <port>` goes round it via headless Chrome. Carries the trap that costs more than the picture: a non-compositing pane freezes `document.timeline` at 0, so every CSS transition reads as its start value and correct rules look broken, plus the one-liner that detects it. | 2026-08-18 |
| `docs/governance/UI-CHECKLIST.md` | **Run before calling any UI change done.** Every row names a defect that shipped, most of them past a green `ui-audit.js`. Carries the checks that still need a person — reproduce at the reported size, measure before fixing, look at the screenshots, and ask whether the fix created its own defect elsewhere. | 2026-08-15 |
| `tools/review-changes.mjs` · `npm run review` | **One command to check a bank change.** Runs the real gates as subprocesses (so it cannot drift from them) and writes a readable page of the actual option text per family. Exists because a green gate says nothing about whether the sentences still read well — it was reading the screen that caught eight options opening on the same 36-character prefix. | 2026-08-15 |
| `tests/name-matching-gate.test.mjs` | Asserts the gate itself — every bank file `app/t6.html` loads, `t6_brgsa.js` **before** `t6_catalog.js` (the wrong order silently yields 48 concepts instead of 64), all four subjects reached, `connect` held at ≤10%, and `--gate`'s exit code agreeing with its report in both directions. | 2026-08-15 |
| `tools/measure-absolute-bias.js` | Separates a load-bearing over-claim from a house-style artefact by measuring, per question family, the share of correct and of wrong options carrying an absolute. A family where both shares match leaks nothing however many it contains. | 2026-08-15 |
| `docs/governance/CONTENT-RULES.md` | The authoring checklist behind LAW-47/53/61/63: what a question may assume the learner can see, the shape rules, and the CLA-benchmarked target for absolutes and option length. Read before authoring or changing any question, case, or option. | 2026-08-15 |
| `tools/validate_t6_bank.js` | Four-course source/schema, primer, breadth, format, boss, option-shape, scored-pool, option-diagnosis, lesson-structure, and transcript-backed vocabulary validator; reports the untaught-question backlog. | 2026-08-12 |
| `legacy/rogue/rogue.html` | Legacy character → Hall → run → failure/results product-flow markup. | 2026-08-10 |
| `legacy/rogue/rogue.js` | Legacy product-slice state transitions, questions, rewards, quest, and outcome behavior. | 2026-08-10 |
| `legacy/rogue/rogue.css` | Legacy product-slice responsive presentation, feedback states, and animation behavior. | 2026-08-10 |
| `tools/server.py` | Portable local server; optional loopback/same-origin written-grader health and POST routes, bounded and serialised; legacy leaderboard remains. | 2026-08-13 |
| `tools/local-grader.mjs` | Loads the real bank and external lectures, performs question-bound lexical RAG, runs two structured LM Studio passes, validates agreement/citations/answer evidence, and abstains closed. | 2026-08-13 |
| `tools/evaluate-local-grader.mjs` | Validates complete owner-marked JSONL, runs it through the local grader, and reports false awards, abstention, exact agreement, coverage, latency, and the provisional authority-review gate without echoing answers. | 2026-08-13 |
| `tests/local-grader.test.mjs` | Source-bound retrieval, dual-pass merge, exact answer evidence, invented-citation, prompt-injection, repair-routing, complete calibration input, aggregate-only output, and latency regressions. | 2026-08-13 |
| `tools/start-windows-mac-grader.ps1` | Verifies or opens the private Windows-loopback→Mac-LM-Studio SSH forward, checks the exact approved model and source health, and launches the guarded local server. | 2026-08-13 |
| `tools/start-mac.sh` | Dependency-free macOS launcher for the local prototype server. | 2026-07-16 |
| `tools/serve-tunnel.cmd` | Fail-closed Windows launcher for the server and an explicitly installed LocalTunnel 2.0.2 CLI. | 2026-08-04 |
| `evidence/README.md` | Evidence naming, acceptance-source hierarchy, and artifact requirements. | 2026-07-16 |
| `coordination/CHARTER.md` | Owner/agent/tool authority and delivery protocol. | 2026-07-16 |

## Design System and Domain Rules

- Read and follow the authority order in `docs/governance/DESIGN_SOURCE_INDEX.md`; never reconcile conflicts
  silently.
- Current proposed production style is crisp, graphic, painterly 2D. Existing pixel-like assets
  are references until the owner confirms the conflict resolution.
- Saffron means player agency/earned progress; cyan means guidance/insight; hostile coral means
  error/danger. Do not use these as arbitrary decoration.
- Unanswered learning content is neutral. Color must communicate selection, action, progress,
  accessibility focus, or feedback. A subject-local next action must not claim to be the one global
  recommendation.
- Every selectable setup control must change the resulting run or be visibly unavailable before
  selection.
- Every visible pixel must earn its place through meaning, hierarchy, feedback, navigation, or
  accessibility; diagnostic metadata stays available to maintainers without competing with the
  learner's question.
- Default question content to one surface. Do not add a nested card unless it marks a control,
  feedback/state change, navigation boundary, or materially separate interaction.
- Ari advances only when progress is awarded.
- Strong, Developing, Needs practice, and Not started states must remain distinguishable without
  color or motion.
- Procedural-engine correctness, grading, spaced repetition, persona detection, and subject rules
  remain governed by `docs/engine/PROMPT.md`. The active authored T6 bank instead follows the owner direction,
  `docs/briefs/T6_REVISION_FALLBACK.md`, and the external clean lecture transcripts (see Directory
  Map); that transcript root is not a directory of this repo and cannot be committed to it.
- Cosmetics may not alter learning power. A power-up must declare its learning effect, result
  labeling, persistence, and dashboard treatment before implementation.
- Persona and rank displays must obey the evidence thresholds and language restrictions in
  `docs/engine/PROMPT.md`.
- Test profiles and scenario loaders must be separate from `data/state/` and `data/history/`.

## Conventions

- Current explicit owner direction wins over project files. Record durable decisions in the
  relevant brief and `docs/governance/DESIGN_SOURCE_INDEX.md`.
- `docs/engine/PROMPT.md` is current procedural-engine authority; the T6 fallback's authored questions follow
  its indexed pack and brief. `docs/engine/REVIEW_LOG.md` and `docs/design/personalities.md` are rationale and history.
- `app/` shows implemented behavior, not intended behavior — and it is what production serves. Every
  file in it ships. `legacy/` is the reference-only counterpart and ships nothing.
- Do not edit `data/graphs/`, `data/state/`, or `data/history/` during UI testing unless the task explicitly
  authorizes engine/data changes and a backup-safe plan exists.
- Do not call an asset production-ready without the acceptance gate in
  `docs/design/ART_DIRECTION_SYSTEM.md`.
- Do not claim browser verification from HTML/CSS/JS inspection.
- Preserve user changes and unrelated files. Avoid destructive source-control or filesystem
  operations unless explicitly requested.
- Run the smallest relevant verification after each coherent change. Current baseline checks:
  - JavaScript syntax: `node --check legacy/rogue/rogue.js`
  - T6 JavaScript syntax: `node --check app/t6.js`,
    `node --check app/sets/t6_brgsa.js`, `node --check app/sets/t6_catalog.js`,
    `node --check app/sets/t6_challenges.js`, and `node --check app/sets/t6_lessons.js`
  - Lesson candidates: `node tools/build_t6_lessons.mjs "<Term 6 AI-Ready Pack>" [SUBJECT]`
    — the old pack, not the clean transcripts; this tool still reads `graph/LECTURE_MANIFEST.jsonl`.
  - Lesson file, and what to author next: `node tools/check_lesson_file.mjs "<Term 6 Clean Transcripts>"`
    — run this *before* the bank validator; a lesson file that does not parse makes the validator
    report nothing at all.
  - Exam-pattern readiness and the authoring worklist: `npm run check:exam` — needs no transcripts,
    so run it first. Non-zero exit means a section cannot be filled or a negatively marked section
    is free. `npm run check:exam SPMS` narrows it to one paper.
  - T6 bank: `node tools/validate_t6_bank.js "<Term 6 Clean Transcripts>"`
    — always with the path. `npm run validate:bank` passes **no** argument, so it returns `ok: true`
    with an empty `"coverage": {}` having skipped every lecture check and the LAW-49 vocabulary gate.
    Treat that script as a schema-only check, never as bank verification.
  - Does each lesson teach its own lecture?
    `node tools/check-lesson-lecture-match.mjs "<Term 6 Clean Transcripts>" --gate` — the only
    gate on that claim, and the one no other gate covers. Eleven pre-existing lessons currently
    flag (Known Gaps), so expect a FAIL until those are triaged; `--subject SPMS` narrows it.
  - Teach-before-test (LAW-47): evaluate `tools/browser-checks/teach-before-test.js` in the page and
    expect `violations: []`. Automated gates do not cover scheduling.
  - Python server syntax on macOS: `python3 -m py_compile tools/server.py`
  - Local server on macOS: `python3 tools/server.py 8099`
  - UI acceptance: declared scenarios in a real Browser; Computer Use for Windows-level flows.
- A bug hit during build/debugging is logged in `docs/governance/BUG-LAWS.md` before close-out.
- A change to a tracked quality axis is logged in `docs/governance/QUALITY-LOG.md` before close-out.

## Session Hygiene

### Open

1. Read `AGENTS.md`.
2. Read `docs/governance/DESIGN_SOURCE_INDEX.md` for product/design work.
3. Skim the relevant ledgers.
4. Check Known Gaps and gates.
5. State the evidence required to advance the task's status.

### Close — Required After Any Workspace Change

1. Rewrite the Current Status section, and add one Session Ledger line pointing at your
   CHANGELOG entry — never a new story block (see Metadata budget note).
2. Update touched Key Files descriptions and Verified dates.
3. Fix Directory Map and Known Gaps.
4. Add a newest-first `docs/governance/CHANGELOG.md` entry with evidence paths.
5. Grade and log bugs in `docs/governance/BUG-LAWS.md`.
6. Log tracked quality changes in `docs/governance/QUALITY-LOG.md`.
7. Verify all changed references and record evidence.
8. If the change is visible to testers, draft the change announcement (see below) and hand it to the
   owner ready to paste.
9. Never end with a document contradiction you already know about.

### Change announcements — required for every tester-visible change

Testers are running a live cohort. A change they can see ships with one announcement in the
Announcements group when it reaches production; there are no silent releases. The template, rules,
and paste format live in `docs/community/COMMUNITY_PLAYBOOK.md`. Draft it from two questions:

1. **What changed?** One plain sentence in a learner's words.
2. **What should testers do?** One specific action, not "have a look".

Say plainly when the change asks something of the tester — signing in again, re-accepting the
agreement, or losing a saved position — and never describe practice as exam prediction. Post it
after the version is live, since a push to `main` deploys.

## Known Gaps

- [x] **Screenshots are documented — closed 2026-08-18.** The capability had existed since
  2026-08-15 and sessions kept concluding it was impossible, because the knowledge lived only in a
  Key Files row, a closed checkbox and a tool header. `docs/governance/SCREENSHOTS.md` is now the
  one page, reachable from the required-reading order, Key Files, `UI-CHECKLIST.md`, the authoring
  protocol and `CLAUDE.md`. `node tools/screenshot.mjs --port <port>`; 16/16 on the latest run.
- [x] **The seven `IBM-M02` lessons are content-accepted — 2026-08-18.** Owner approval in chat.
  This clears `WAITING_OWNER_CONTENT_ACCEPTANCE` for that batch only; it is not faculty review and
  creates no subject-matter authority.
- [x] **The mirror-coverage gap is closed — 2026-08-20.** Lessons and questions both reach
  **359/359 named syllabus ideas**: BRGSA 69/69, IBM 90/90, SCLM 84/84, SPMS 116/116, with every
  tested floor ratcheted to 100%. The bank widened from 64 to **219 concepts** and from 920 to
  **2,827 questions** without adding syllabus aliases or lowering a floor. IBM's 73 misses became
  69 classified records plus four wording repairs: layer → subjective + MCQ, framework →
  subjective-only, atomic concept → MCQ-only. The unreleased IBM exam case was not invented.
  Evidence: `evidence/2026-08-20/t6-ibm-classified-coverage/verification.md`.
- [ ] **Coverage is not the adopted depth target.** The 219 concept records still stand in for 359
  named ideas. All 283 teaching entries are scheduled, but the mirror gate only proves a question
  names each idea; it does not prove one record per idea, equal 8–14-surface depth, faculty-reviewed
  accuracy, or enough cross-module transfer. Continue Stream D from
  `docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md`, ordered by the measured importance report rather than
  by whichever phrase is easiest to add.
- [x] **`WAITING_OWNER_CONTENT_ACCEPTANCE` — the 105 surfaces are ACCEPTED, owner approval in chat
  2026-08-19.** Covers everything outstanding: the 79 lessons already waiting, the 16 rewritten or
  authored while clearing the misfiled queue, and the SPMS module 5, module 2 and module 7 batches
  (including the add-in and the three composite rewrites). It clears the gate that blocked `DONE`.
  **It is not faculty review and creates no subject-matter authority** — the standing accuracy
  caveats are unchanged.
  **Recorded honestly, because it does not match the protocol this repository wrote down eight
  hours earlier.** Owner decision 1 of 2026-08-19 was *every lesson per module needs a reading*,
  with sampling explicitly offered and rejected; that reading did not happen before this approval.
  So the acceptance is a **release decision, not a completed review**, and the per-lesson reading is
  now a quality activity the owner may still want rather than a gate anything is blocked on. The
  resumable per-lesson checklist described under decision 1 is therefore **not built and no longer
  blocking** — build it if and when the reading is actually wanted.
- [x] **The misfiled-lesson queue is cleared — closed 2026-08-18.** The gate flagged **10** at the
  start of the session and flags **1** at the end. Nine were rewritten against their own
  transcripts, `SPMS-M01-L01` was left by owner decision, and `SPMS-M04-L01` — never in the queue —
  was found and fixed after the corpus shift exposed it. `SPMS-M01-L09` and `SPMS-M07-L05` were
  authored to receive displaced content. Record and the traps worth keeping:
  `docs/briefs/MISFILED_LESSONS_WORK_ORDER.md`. QUALITY-LOG **I56**; evidence
  `evidence/2026-08-18/t6-misfiled-lessons-cleared/verification.md`. **The general hole stays
  open** — the gate finds a lesson written from *another* lecture and cannot find one written from
  half of its own, and `SPMS-M01-L07` was exactly that case and never flagged.
- [x] **`SPMS-M01-L01` is resolved — owner decision, 2026-08-18.** Its `lectureId` names a
  685-character "Key Takeaways Module 1" card, unique among 283 lectures. Option 3 was checked
  first and answered **no**: the source is not missing a first lecture — `SPMS_M01_SUM_TRANSCRIPT`
  and `SPMS_MEGA_TRANSCRIPT` independently hold exactly ten module 1 sections, agreeing on order
  and titles — and the lesson's content is real course material from the module 1 detailed notes.
  The owner chose to leave the lesson in place and record the finding, so **a `FAIL` naming
  `SPMS-M01-L01` and nothing else is the expected state of the match gate**; anything else in that
  output is new. SPMS authoring is no longer blocked: `SPMS-M01-L09` is authored.
- [x] **The two mis-mapped forecasting lessons are rewritten — closed 2026-08-18.** `SCLM-M02-L03`
  taught L04's error metrics, and L04 in turn opened on L02's push/pull material while teaching
  none of its own lecture's accuracy half — the module-2 opening sat one lecture off. Both are now
  written against their own transcripts, `SCLM-M02-L05` gained the qualitative/quantitative split
  its lecture opens on, and the pre-existing L04-before-L03 file inversion was removed. Coverage
  caught `Systematic component` falling out and it was taught back rather than aliased.
  QUALITY-LOG **I54**. **The general hole stays open:** no gate checks a lesson body against its
  own lecture — only reading the lecture finds this class of defect.
- [x] **The teaching-layer backlog is CLOSED — 2026-08-19. Every lecture in the course has a
  lesson**: BRGSA 50/50, IBM 78/78, SCLM 71/71, SPMS 84/84, 283 entries over 283 lectures. Re-run
  `check_lesson_file "<transcripts>"` to confirm rather than trusting this line. **What it does not
  close is equal testing depth** — delivery is now 283/283 scheduled, while record depth and
  repeated transfer remain Phase 2 (`docs/briefs/TESTING_LAYER_BUILD_PLAN.md`), and content is
  owner-accepted rather than faculty-reviewed. Evidence:
  `evidence/2026-08-19/t6-teaching-layer-complete/verification.md`. The other outlier to plan
  around is the Sriraman guest session (`SPMS-M04-L10`) at 48,232 characters, the longest lecture in
  the course. **Some of these are add-ins rather than lessons** — read the lecture before assuming
  it needs a full lesson, and see the protocol's add-in section for the test.
  **This backlog is not only coverage work: it unblocks composite repairs.** A composite cannot be
  rewritten until its borrowed halves have homes. **Module 7 is done** — `M07-L10`+`L11` authored
  and `SPMS-M07-L08` repaired (0.113 → 0.395); **module 3 likewise** — `M03-L07`+`L10` authored and
  `SPMS-M03-L08` repaired (0.115 → 0.589); **module 6 likewise** — `M06-L10`+`L11` authored and
  `SPMS-M06-L09` repaired (0.130 → 0.481); and **module 6 is now complete** — `M06-L02`, `L03`,
  `L04`, `L06`, `L07` authored and `SPMS-M06-L01` repaired (0.165 → 0.369). **All three composites
  the sweep found are repaired and none still leans** — but **the sweep query itself was wrong and
  is corrected** (`LAW-78`): its `>0` margin floor could not see `SPMS-M06-L01`, which was ahead of
  the lecture it plagiarised by 0.011, and its `0.35` was a stale p25 now measuring 0.460. The
  widened query returns ~28 unread candidates across all four subjects, not nine — run the
  corrected Step 4c sweep in the authoring protocol before assuming SPMS is the only affected
  subject, and read `--calibrate` before trusting any literal in it. See
  `docs/briefs/TEACHING_LAYER_AUTHORING_PLAN.md`, and trust its live query over its §7 table.
  **These are no longer optional** (owner decision 2026-08-19): uncited is unfinished course
  content, not a category. Authoring still does not move *scored* coverage on its own — that needs
  the concept spine — and **retagging an existing question at an unscheduled lesson to fake it
  breaks the ladder, LAW-47 and the readiness figures silently.**
- [ ] **`app/admin.css` still ignores the theme, by owner decision.** It pins `color-scheme: light` and carries 38 one-theme literals, and `admin.html` does not load `theme.js`, so the owner dashboard stays light whatever the device is set to. Scoped out when the login/privacy fix was approved on the grounds that it is an internal tool with one user. The route gate added for LAW-69 does not fail on it — `admin.html` references nothing that lacks a route — so this will not resurface on its own. Pairing it is the same shape as the `login.css` work: tokens to `light-dark()` pairs, literals out, `theme.js` in the head, and the `data-theme-switching` rule.
- [x] **`WAITING_OWNER_CONTENT_ACCEPTANCE` — 48 course-assessment items — ACCEPTED 2026-08-15.**
  SCLM 32 (two per concept: definition, scenario, numeric, judgement) and BRGSA 16 (one per
  concept, scenario-led), with 144 authored option diagnoses. Drawn from the owner's own CLAs for
  style, coverage and difficulty; none is one of their questions, every item sits on a lecture that
  already has a lesson, and every claim is one its lesson states. Released with the rest of the
  block above.
- [ ] **F-06 is closed on SCLM and open on BRGSA and SPMS, and the residual is located.** Mean of
  sets 1–3, "eliminate the absolutes": SCLM 36.0 → **29.5** (below its own course paper's 32.6),
  all rules combined **24.5**. BRGSA **36.6**, SPMS **41.2**. The leak lives in two places and
  neither is fixable by adding items: the `explain` family (correct carries an absolute 14.6%,
  wrong 58.3%) and `apply` (2.1% vs 51.4%) key on the 64 concept `summary` and `application`
  strings, and BRGSA Section A draws 20 of 76 so the 60 legacy `t6_brgsa.js` items dominate its
  papers with 0 of 20 correct answers carrying one. Both are owner-facing prose that also feeds
  match choices, boss steps and written rubrics, so rewriting them is a content decision, not a
  bank-growth one.
- [x] **Name-matching — closed 2026-08-15 in every generated family.** 324 → **28** option sets
  paying 100%; `tools/measure-name-matching.js --gate` now **exits 0**. `term_cloze` was retired to
  `contrast` on an owner decision, and the fix is `connect`'s direction (name the concept in every
  option). The mirror fix of stripping names is **rejected and must not be retried** — it destroys
  the prose and takes `connect` from 0.5% to 26.6% (CONTENT-RULES R3). **Still open on IBM only**,
  at 32.7 against a 32 limit, and its residue is absolutes rather than name-matching — see F-06.
- [x] **F-06 absolutes — closed 2026-08-15 across all four subjects.** `apply` 45.8 → **20.0**,
  `explain` 43.1 → **16.5**, `boss` 33.1 → **23.6**, `authored` 31.4 → **23.7**;
  `tools/measure-absolute-bias.js --gate` exits 0. Two levers only: filler removal (9.6% of
  absolute-carrying distractors; the load-bearing 90.4% were left alone) and 76 correct answers
  restated at the course's real strength, each universal taken from that concept's own `bridge`.
  **Manufacturing an absolute and watering down a distractor were both refused** and remain
  forbidden. Note for anyone extending this: **append nothing** — appending universals pushed
  IBM's "pick the longest" to 66%, so rewrites must be in place and length-neutral.
- [ ] **The wrong-answer panel repeats itself inside one run.** 161 per-option diagnoses across the
  four set-1 runs draw on **55 distinct cues**; the most common covers 33 of them, so a learner who
  misses four items can meet the same sentence three times. The generated `_explain` family's `why`
  is a template with the concept name slotted in. Correction while measuring it: F-25's
  "correct-answer feedback restates the answer, every time" is **9 of 32**, not universal.
- [x] **Concepts are layered — closed 2026-08-14.** Lecture position had not been an input to
  scheduling anywhere, so SPMS study set 1 taught `M01-L10` before `M01-L05` and the primer's
  "Carry forward: `<previous>`. Now add `<this>`" was written against an order chosen by a hash of
  the question id. Selection is unchanged; the selected questions are now sorted by teaching rank and
  `layeredQueue` drains a pre-committed lesson list in order, so delivery is monotonic by
  construction. **94 descents over 37 of 40 sets → 0**, pair count identical at 253.
  `tools/browser-checks/lesson-layering.js` is the standing check; run it beside the LAW-47 one.
  `startPriorityPractice` is deliberately excluded — it is remediation ordered by need and says so.
  Evidence: `evidence/2026-08-14/t6-lesson-order-diagnosis/verification.md`. Tester-visible and not
  merged; the announcement draft is `outputs/ANNOUNCEMENT-2026-08-14-layered-concepts.md`.
- [x] **The SPMS multiple-select stems are rewritten — verified 2026-08-18.** All **28** SPMS `msq`
  items now ask what is *true* ("Select every statement that is true of...", "Select every
  alternative this case shows..."), and a scan of all 916 questions in all four banks finds
  **zero** stems referencing "the lecture" or "the session". The named residual is gone too:
  `spms_roadmap_msq` no longer carries the WhatsApp iPhone/Android date as a correct option — its
  correct pair is now the deferral point and the strategy-to-releases translation. Original
  finding, kept because the reasoning is the standard: **fifteen of the twenty SPMS
  multiple-select stems asked what "the lecture" said, not what is
  true.** "as the lecture presents them", "every failure the lecture names", "on the lecture's
  definition", "how the lecture uses MoSCoW". No caselet fixes these — they name no example, so they
  are outside LAW-61 — but a stem that asks a candidate to recall a session trains recognition of
  that session rather than the idea, and the exam does not ask it that way. The rewrite is per item:
  ask which statements are correct. One item already has the right shape and is the model
  (`spms_requirements_msq`, which states its own case in the stem). Related and smaller:
  `spms_roadmap_msq` carries "WhatsApp launched first on iPhone, with the Android version arriving
  around 2011" as a **correct option** — a date recall sitting among framework claims.
- [x] **`WAITING_OWNER_CONTENT_ACCEPTANCE` — four SPMS multiple-select caselets — ACCEPTED
  2026-08-15.** They close LAW-61: the
  drilling-machine, Zerodha, ride-hailing MoSCoW, and WhatsApp items named an example the learner
  never saw. Each case is drawn from its own lecture's clean transcript, but drawn from the
  transcript is not accepted. Tester-visible, so it also owes the change announcement drafted at
  `outputs/ANNOUNCEMENT-2026-08-14-example-questions.md`.
- [x] **`WAITING_OWNER_CONTENT_ACCEPTANCE` — BRGSA concept records and the case exemplar —
  ACCEPTED 2026-08-15.** BRGSA previously had an authored
  `application` on 0 of its 16 concepts against IBM's 16 of 16, so `conceptData` fell back to a case
  question's correct multiple-choice option — a scenario-specific answer choice used as a general
  decision rule. Every BRGSA prompt therefore shipped an exemplar ending in a non-sequitur beside a
  rubric demanding the learner match it. All 16 now carry an authored `summary`, `application`,
  `bridge`, `caselet` and `caseEvidence`.

  Five concept names also described something other than their anchor lecture, which is the only
  evidence the marker sees. Module 4's two were exchanged and were fixed by swapping sources back;
  four were renamed to the topic their lecture teaches (`Experiment design` → `Null hypothesis and
  test design`, `Strength of evidence` → `Pre-sales commitment and evidence strength`, `Churn and
  referral` → `Referral and network effects`, `Pipeline and payback` → `Sales integration and
  payback`, and `First customers` → `Early-stage and scale-stage growth`).

  Separately, the case exemplar was `name + application + bridge + summary` and never quoted the
  caselet, so it could not satisfy its own third criterion — `case_evidence` failed on 12 of 27 case
  exemplars, 6/13 BRGSA and 6/14 IBM, the one criterion where IBM did no better. Concepts now carry
  an authored `caseEvidence` sentence naming the deciding fact, and IBM's caselets were expanded
  from about 120 to about 550 characters so there is a specific fact to cite.

  **Open:** the owner has read none of this prose. It is course content presented to testers as
  model answers, and the concept renames are visible in the dashboard, so this needs owner
  acceptance and a change announcement before it reaches the cohort.
- [ ] **`WAITING_OWNER_CALIBRATION` — the hosted checkpoint has never been run.** Every marking
  figure on record comes from the local 35B through the Windows→Mac loopback. Local calibration does
  not transfer. `tools/evaluate-hosted-grader.mjs` now calls `gradeHostedAnswer` itself so it
  measures the shipped path, and needs only a Workers AI token — no index, no upload. Until it runs,
  hosted quality and hosted latency are both unknown, and p50 on the local model is 28.3s.
- [ ] **The hosted `/coach` route is unreachable.** `coachHostedAnswer` is implemented and tested but
  has no route in `cloudflare/src/index.mjs`. Decide whether post-submit coaching ships hosted: it
  costs roughly 203 Neurons against about 34 for a rubric mark, so one IBM mock review is around
  2,340 Neurons of a 10,000/day free ceiling.
- [ ] **Stored written answers have no owner review path.** Rows accumulate under a 92-day expiry
  and reading them is manual. The purpose stated in the privacy notice — comparing machine marking
  against a human reading to correct the rubrics — is not yet a workflow anyone can perform.
- [~] **Measurement foundation is verified on `codex/measurement-foundation`, not merged or
  deployed.** The app now saves a coarse duration band and derived rapid/eligibility flags, never
  raw milliseconds; a rapid answer keeps its correctness while being excluded from Strong gates.
  The 10%-of-expected, 3–10 second threshold is explicitly provisional. Real D1 coverage audit,
  item/format calibration, confidence-curve UI, and retention forecasting are still unbuilt. The
  privacy notice now names the band and purpose; review that clarification and the change
  announcement before merging into the live cohort.
- [ ] **`WAITING_OWNER_DECISION` — post-exam debrief; `WAITING_LOCAL_MODEL_CALIBRATION` — written
  judgement.** Before 22 August,
  decide whether to collect the debrief and define its consent scope, retention, deletion, and
  identity boundary. Local Qwen criterion authority is implemented for practice and explicitly
  cannot create Strong; production and examiner writing remain self-reviewed. The exact installed
  checkpoint is owner-approved and operational through the private Windows→Mac loopback bridge, but
  must still pass the 48-answer owner-marked calibration set before its academic quality is accepted.
  No debrief data is collected.
- [ ] **`WAITING_OWNER_DECISION` — this repository is not ready to be made public, and the work to
  make it so has not been done.** As of 2026-08-14 that now includes
  `cloudflare/src/generated/written-evidence.mjs`: 511 KiB of verbatim lecture transcript passages,
  committed because the feature's whole design is that evidence ships inside the application rather
  than sitting in a hosted index. It is a deliberate escalation over `written-bank.mjs`, which holds
  only authored stems and rubrics. The NDJSON corpus rule is unchanged and those files stay ignored. Whenever the question comes up, it is a deliberate audit, not a
  visibility switch. Everything tracked here was written for an internal audience and some of it
  would be actively harmful in public: `docs/briefs/DUNGEON_TECHNICAL_OVERVIEW.md` names the
  product's bottlenecks and unvalidated claims in the plainest available language; the
  `docs/governance/` ledgers are a catalogue of defects with reproduction steps; `evidence/`
  records what was and was not verified; `.agents/` and `docs/briefs/TESTER_ACCESS_AND_ADMIN.md`
  describe the admission boundary; and `docs/community/` holds the tester agreement, the privacy
  statement, and the playbook naming a live cohort. None of this is secret from the people it is
  about, and all of it is written to be read by whoever is doing the work — but published beside a
  live product it becomes a map of where the product is weak, and cohort material becomes public
  information about identifiable students. **Before any public push:** decide file by file what
  goes, split the private set into a separate repository or history rather than deleting it (the
  ledgers are the institutional memory and deleting them costs more than keeping them private),
  and re-read the git history as well as the working tree, since removing a file today does not
  remove it from the commits behind it.
- [x] `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT` — **closed 2026-08-12.** The owner supplied the Batch 1
  pattern; it is recorded in `docs/briefs/T6_EXAM_PATTERN.md`, which is now authority for paper
  structure. Sections, counts, marks, duration, negative marking, and calculator rules may be stated
  as fact. Still not claimable: question content, difficulty, topic weighting within a section, the
  IBM caselet's subject, a likely score, or a pass probability.
- [~] **MSQ format built and verified; numerical still missing.** The multiple-select surface exists
  and is `VERIFIED(REAL_BROWSER)`: it renders as checkboxes with the marking rule stated, toggles,
  scores exactly as the paper does (+1 per right option, −1 per wrong, floored at zero per question),
  and marks each option `correct` / `wrong` / `missed` after checking. **All twenty** authored SPMS
  items ship, each on a lecture that already has a lesson, and they schedule into real study sets.
  (This entry said "eight" until 2026-08-14; the twelve that complete the section landed with the
  LAW-53 fix below and `npm run check:exam SPMS` reports `Section B · msq · 20 of 20`.) **Two gaps
  remain on it:** the per-option diagnosis does not surface in the wrong-answer panel for MSQ (the
  `diagnosisFor` MSQ branch was added but does not fire — likely `response.selected` is not carried
  for this type), and `msqMarks` is computed but never rendered, so the learner is not shown "1 of 3
  marks".
- [x] **`REDLINE` LAW-53 closed for SPMS Section B — 2026-08-13.** Section B is 20 of 20 and no longer
  free. Every 3-correct item gained a fifth option, because with 4 options and 2 marks a 3-of-4 pays
  `min(2, 3−1) = 2` — full marks — while 3-of-5 pays 1. Shapes are now `3-of-5 ×12, 2-of-4 ×6,
  2-of-5 ×2`, and the answer positions vary. Verified in a browser: ticking every option on all
  twenty questions and answering nothing in Section A scored **12 / 40**, down from **16 / 16**.
  The examiner's defect warning correctly stops appearing. `npm run check:exam SPMS` is clean and
  `tools/validate_t6_bank.js` reports `ok: true` against the transcripts.
- [x] **SCLM's z-based method is confirmed taught — 2026-08-13.** It is `SCLM-M03-L06` ("Q Model"):
  z value, standard normal tables, safety stock, cycle service level, and a full worked continuous-
  review example. The earlier uncertainty is resolved; the formula may be used.
- [x] **The last two SCLM numericals are unblocked — re-measured 2026-08-18.** The blocker was that
  `SCLM-M03-L06` had no lesson; it has had one since SCLM was completed 71/71 the same day
  (*Safety stock and the reorder point*, glossing reorder point, safety stock, protection period
  and cycle service level). **The two items themselves are still unauthored** — this is now
  ordinary bank work, not a blocked dependency. `SCLM-M03-L06` carries the method
  and the worked example — daily demand ~N(60, 7), lead time 6 days, K = ₹10, h = ₹0.5/unit/year,
  current Q = 1,200 and ROP = 360 — which yields the two missing items directly: the reorder point
  for a 95% cycle service level (`360 + 1.645 × 7 × √6 ≈ 388`) and the service level the current
  policy actually achieves (ROP equals mean lead-time demand, so z = 0 and it is 50%).
  (This entry used to close on "but `SCLM-M03-L06` has no lesson — author it first"; that tail
  predated the 71/71 completion and contradicted the re-measurement above, and is removed.)
- [~] **SCLM numeric entry built; 4 of 6 items authored.** `VERIFIED(REAL_BROWSER)`: a typed figure
  is graded against a per-question tolerance, comma and ₹ formatting is parsed, and the verdict states
  the entry against the accepted band. A wrong figure matching a known wrong method names that method
  (`nearMisses`) instead of reporting a bare "wrong". Items cover exponential smoothing, EOQ quantity,
  EOQ total cost, and the newsvendor critical ratio. **Two more are needed** to match Section B's six,
  and the candidates are safety stock and service level. The z-based method **is confirmed taught**
  (`SCLM-M03-L06`, closed entry above), the lesson exists, and the paper supplies standard normal
  tables — the only remaining work is authoring the two items; the unblocked entry above carries
  the exact figures. (This entry used to say the z-based formula was unconfirmed; that predated
  the 2026-08-13 confirmation and contradicted the two entries above it.)
- [x] **`REDLINE` LAW-53: SPMS Section B is free marks — superseded 2026-08-14.** This entry was a
  stale duplicate of the closed item above, which it directly contradicted: it still described eight
  MSQs at 3-of-4 scoring `16/16` on a speculative tick. That was fixed on 2026-08-13 and re-confirmed
  on 2026-08-14 — `npm run check:exam SPMS` exits 0 with shapes `3-of-5 ×12, 2-of-4 ×6, 2-of-5 ×2`
  and the examiner's defect warning no longer appears. Kept as a marker so the correction is visible
  rather than silently deleted; the live record is the closed entry above.
- [~] **SCLM Section A's pool: 52 → 84 on 2026-08-15, so the examiner has slack for the first
  time.** It draws 50, so 34 are now spare against 2, which is what `examReservedIds()` needed to
  reserve anything. The identical-prompt half was fixed separately at the generator (F-05: the
  `connect` family's constant stem and caselet), and prompt variety across the whole draw is now
  measured by the harness rather than estimated. BRGSA Section A went 60 → 76. What remains is
  SPMS, which received no new items.
- [ ] **IBM's paper contains no objective questions at all** — ten subjective answers on a caselet
  released two days beforehand. Its 196 MCQ-derived surfaces contribute nothing to it, and authoring
  its 62 uncited lectures would add zero marks. Do not spend bank effort there; the useful work is
  framework fluency and structured written answers against an unseen case.
- [ ] **BRGSA self-containment.** The paper states that no question requires memorising a Clairo or
  Zoko figure. Bank items that test recall of one are training a skill the exam explicitly excludes.
  Teaching with those numbers is fine; testing recall of them is not. The bank has not been audited
  against this.
- [ ] **SCLM is under-weighted on computation.** Section B is 24 marks of numericals with a
  scientific calculator and supplied normal-distribution tables, pointing at safety stock, service
  level, and newsvendor. Only 3 of its 16 cited lectures carry arithmetic today.
- [x] **`WAITING_OWNER_CONTENT_ACCEPTANCE` — ACCEPTED BY THE OWNER 2026-08-15.** The whole standing
  block is released: the transcript-derived bank across all 792 surfaces, the 64 support-only
  primers, the 64 constructed-response rubrics and exemplars, the 106 authored lessons, the 48
  course-assessment items from the owner's CLAs, the 44 examiner-reserved items, the four SPMS
  multiple-select caselets and their revised stems, the 14 rewritten SPMS stems, the BRGSA concept
  records and case exemplar, and the ~76 restated correct answers. Acceptance was given in chat
  and covers the prose as it stood after the two R3 repairs below — `sclm_drivers_cla3` and
  `spms_requirements_cla1` were fixed **before** acceptance rather than accepted and then
  corrected. **What acceptance does and does not mean:** it clears the gate that blocked `DONE`.
  It is not faculty review, and it does not convert any of this into verified subject-matter
  authority — the standing accuracy caveats below are unchanged and still apply.
- [x] **The 0→80 path reaches every scheduled question — closed 2026-08-12.** 724 of 724 are
  taught, verified in a real browser at
  `evidence/2026-08-12/t6-teaching-layer-complete/verification.md`. What remains is *acceptance*,
  not coverage. Do not quote coverage numbers from this file; run
  `node tools/check_lesson_file.mjs "<transcripts>"`. **The "uncited lectures are optional" note
  that used to close this entry is reversed by owner decision (2026-08-19)** — if it is in the
  course it gets taught; and uncited lessons are readable in the lesson index, never invisible.
- [ ] **Homepage four-question restructure is on a branch and not merged.**
  `redesign/homepage-four-questions` reorders the dashboard into what am I doing / where can I
  start / how am I doing / additional resources, and removes the duplicate entry points that had
  accumulated: three doors to the practice builder, two lists of the same concepts, "N of 16
  strong" twice, hide/show nested three deep. Recorded as C30 in `DESIGN_SOURCE_INDEX.md`,
  superseding the C26/C27 ordering. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
  `evidence/2026-08-12/t6-homepage-four-questions/verification.md` — 0 layout findings at 1280×800
  and 375×812, LAW-36 measured in both directions, LAW-47 clean, 37/37 tests. **Two things are
  owed before it merges:** a pixel-level pass (the Browser pane was not compositing, so there are
  no screenshots) and a contrast measurement of the goal chart's new dark-surface colours. It is
  tester-visible, so it also owes the change announcement drafted with it.
- [x] **The vocabulary gate's plural blind spot is fixed — verified 2026-08-18.** It used to build a
  bare `\b<term>\b`, so `public private partnership` was reported as invented although
  `public private partnerships` occurs three times. `wordPattern()` in `tools/validate_t6_bank.js`
  now stems each word and appends an optional plural, so the tolerance runs **both** ways — a
  singular heading matches a plural source and the reverse. Re-measured: `public private
  partnership` resolves to `SCLM-M05-L07` (4 uses over 3 lectures) and the validator emits no
  warning for it. The tolerance is deliberately only a plural, not a general suffix, so `market`
  still does not match `marketing`.
- [x] **The option-length cue is repaired across all four subjects — re-measured 2026-08-18.** IBM's
  correct answer used to land at rank 3 of 4 in 45% of sampled questions, so "pick the
  second-longest" worked. The validator now reports `lengthRankSpread` of **0.05 / 0.07 / 0.07 /
  0.05** for BRGSA / IBM / SCLM / SPMS against a `RANK_SPREAD_LIMIT` of 0.15, and
  `longestOptionScore` of 0.29 / 0.23 / 0.18 / 0.23 against chance at 0.25 — no warning fires on
  any subject. **A measurement note worth keeping:** a naive sort that gives the correct answer
  rank 1 whenever it *ties* for longest reports 37–46% and looks alarming. `longestOptionScore()`
  splits credit across tied ranks, which is why padding a distractor to match cannot launder the
  number — and why the naive version overstates. Trust the validator's figure, not a hand-rolled
  sort.
- [ ] Authored question copy still contains vocabulary the course does not use — "pre-registered
  stopping rule" (0 occurrences in BRGSA; the course says *decision rule*) and "18 visitors per arm"
  on a lecture that says *per variant*. The glossary covers `arm`; the rest is content backlog under
  the same acceptance gate. Run `node tools/validate_t6_bank.js "<pack>" --vocab-report` for the
  review list, and read it as candidates — n-gram scanning cannot separate jargon from ordinary
  English.
- [x] **Pixel acceptance exists — closed 2026-08-15.** Owed since 2026-08-12 because an undisplayed
  Browser pane composites no frames, so its `screenshot` times out and every CSS transition reads
  as its start value. The fix goes round it rather than through it: `node tools/screenshot.mjs
  --port <port>` drives headless Chrome, which has no pane to display, against
  `tools/shots/frame.html` — a same-origin driver frame that opens the app in a fixed-width
  iframe, walks it to the requested screen through the real controls, settles every animation, and
  holds still. 16 shots over 5 screens × 2 viewports × both themes, no extension, no dependency.
  **It earned its keep on the first sweep**, finding two defects the DOM audit could not: the Bag
  launcher docked on top of the theme toggle during a paper, and the subject cards laying
  themselves out differently depending on whether the subject has negative marking. Both fixed.
  What it still cannot see: hover, keyboard focus, transition *direction*, and screen readers —
  keep running `ui-audit.js` for the numbers.
- [ ] **Prompt variety in SCLM is still flagged and was deferred by owner instruction (2026-08-13).**
  `npm run check:exam` warns that Section A forces 14 of every paper's questions to share one prompt
  and Section C forces 3. Not a blocker for sitting the paper; it trains recognition of a stem rather
  than of an idea. Vary the caselet, not just the options.
- [ ] `button#brand-home` measures 42px tall on desktop, under the project's own 44px floor, and
  `tools/browser-checks/ui-audit.js` reports it on every screen. Pre-existing; the mobile block
  already raises it to 44. One line, but it moves header geometry, so it wants its own measurement.
- [ ] Push to `main` now publishes to the live domain through Workers Builds. Do not commit
  work-in-progress to `main` while testers are active; finish a change, then push. A bad version can
  be rolled back from Workers → Deployments.
- [ ] The two Control Room panels read real cohort data. Treat anything under ten first attempts as
  noise and never use accuracy alone for removal.
- [ ] Approved-email admission, the private denial, agreement acceptance, dashboard entry, online
  progress status, sign-out, and revocation are verified end to end on the live domain. Keep the
  agreement version fixed until the terms actually change; a new version intentionally asks every
  tester to accept again.
- [x] `WAITING_OWNER_DEPLOY` — **closed 2026-08-12.** The agreement-version re-check shipped in
  Worker version `4e9a3287`, so the active cohort has already been sent back through the agreement
  step once. Confirm the announcement for that terms change was actually posted; the deploy happened
  before this session and the gate had been recorded as still waiting.
- [ ] Approved-email entry is a binary admission check, not identity proof. Anyone holding an
  approved address can enter as that tester. Country locking is country-level only and can fire on
  legitimate travel, VPNs, mobile networks, or routing; keep it an owner review prompt with a human
  unlock path and never automate a permanent ban from it alone.
- [ ] Send `outputs/Dungeon_Closed_Tester_Agreement.pdf` with any future invitation; the tester also
  accepts the current version in-app at first login. WhatsApp membership is self-attested because the
  web app can only record invite-open and acknowledgement timestamps. Treat current dashboard samples
  as observational, not conclusive, until the per-concept attempt thresholds are met.
- [ ] The identity-gated client bundle prevents anonymous/casual harvesting but cannot stop an
  approved technical tester from downloading visible bank scripts. Server-side item delivery is
  `UNSTARTED`; do not claim perfect anti-scraping or DRM.
- [ ] Tester agents are `PREPARED_NOT_ACTIVATED`. Backend events, explicit tester consent,
  pseudonymous identity mapping, retention/deletion, owner review queues, notification/access
  adapters, synthetic end-to-end acceptance, and owner activation are all required before any
  registered schedule may be unpaused. Their repository declarations must also be enabled in the
  same reviewed activation change.
- [ ] `WAITING_REAL_BROWSER`: the legacy cinematic/Ari/economy route still has no complete
  real-Browser new-player acceptance. This gate no longer applies to the verified T6 BRGSA route.
- [ ] `WAITING_COMPUTER_USE`: the current macOS install, permissions, launch, local-routing, and
  copy-ready prompt are documented in `docs/ops/MAC_TRANSFER.md`; a real Mac permission/setup smoke
  pass is still owed. Use the built-in Browser first for this web prototype and Computer Use only
  for desktop-level interaction.
- [ ] Legacy production breadth remains deferred in C3 and C7. Current fallback precedence is
  recorded in C11 and `docs/briefs/T6_REVISION_FALLBACK.md`.
- [ ] Deterministic T6 and legacy URL scenarios cover main fixtures, but no checked-in automated
  interaction suite validates all 40 study sets. Add one before broad student release.
- [ ] Builder practice stays inside one subject. A single run mixing subjects needs a course id on
  every queue item and is `UNSTARTED`; do not imply mixed-subject practice in copy until it exists.
- [ ] Primer fade/recovery thresholds, the Connections matrix axis, sampled confidence cadence,
  fixed thresholds, practice-shape weights, confidence recovery, and any future mastery model
  remain product hypotheses until real learner data and cognitive interviews support calibration.

## Self-Maintenance Rules

- If a file contradicts this index, update the index or record an unresolved conflict before
  continuing.
- New architecturally significant file: add it to Key Files.
- Deleted or renamed file: repair references immediately.
- New directory: add it to Directory Map.
- Resolved gap: remove it in the same session and preserve the story in `docs/governance/CHANGELOG.md`.
- Never leave an entry known to be false.
- After a changed session, update touched file biographies and Verified dates.
- Repeatedly-read non-indexed files should be promoted to Key Files.
- After debugging or a bug during build, update `docs/governance/BUG-LAWS.md`; merge near-duplicates and downgrade,
  supersede, or retire stale Laws when a permanent backstop exists.
- After tracked quality work, update `docs/governance/QUALITY-LOG.md`.
- Ledgers must not make the project timid: use comply paths, run WATCH checks, and preserve
  ambition.

## Metadata

- Generated: 2026-07-16
- Last verified: 2026-08-13 (measurement/local-grader branch: 50 release/access/agent/grader tests,
  palette gate, transcript-backed bank gate, JavaScript/Python syntax, deterministic evidence and
  local-grader fixtures, rapid/normal/restored/non-demotion Browser paths, and real Mac-model
  HTTP/UI; the known SCLM 4-of-6 numeric shortfall and 48-answer owner calibration remain)
- Confidence: high for file inventory, operating rules, all-subject implementation, structural
  grounding, and observed Browser behavior; medium for transcript-derived content pending
  owner/faculty acceptance; low for exact exam-paper structure
- Budget: keep this file below 32 KiB and preferably below ~4,000 tokens. Move history to
  `docs/governance/CHANGELOG.md` and detail to linked ledgers/briefs.
  **2026-08-18: the story block is compressed.** The ~1,100-line status blockquote (≈92 KiB on
  its own) is now a Current Status section plus a one-line-per-session ledger; every collapsed
  block was first confirmed to have a full CHANGELOG entry of the same date and title, so the
  histories are pointed at, not deleted. File 184 KiB → ~90 KiB. **Still over the 32 KiB target
  and known to be so** — the remaining bulk is Known Gaps, which holds many closed `[x]` entries
  kept as markers. The standing rule that prevents the regression: **new sessions add a ledger
  line and a CHANGELOG entry, never a new story block here.** Closed gaps older than the current
  work may be trimmed to one line each once their story is confirmed in the CHANGELOG.
