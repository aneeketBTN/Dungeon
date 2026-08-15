# Verification — finishing the bank overhaul

> **Second pass (same day) closed the four items this file originally listed as open.**
> The examiner-only slice now covers **all four subjects** — 44 reserved items, and every
> concept on every paper has a distinct examiner surface (**16/16 × 4**, from 0/16 on
> three of them). Overlap fell from 100% to **60–80%**. The 14 SPMS multiple-select stems
> that asked what "the lecture" said now ask what is true, and `spms_roadmap_msq`'s
> date-recall option is gone. BRGSA self-containment is **audited for the first time and
> clean**. And the standing IBM option-length warning turned out to be a bank-wide
> exploit the brief had mis-scoped: **"pick the second-longest" paid 32.9–38.5% on all
> four subjects**, is now measured, gated, and down to **18.9–28.2%**. Details in §8–§11
> below; the original pass follows from §0.

---

## The first pass — the blocked lesson, the reserved slice, and T1/T2/T4/T5

`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)` · 2026-08-15 · branch
`feat/bank-rehaul-completion` · not merged, not deployed.

This session picked up the five items the previous one listed as **not done**:

| Carried in as | State now |
| --- | --- |
| No `SCLM-M03-L06` lesson; `check_exam_readiness` exits 1 | Lesson authored and **delivered**; readiness exits **0** |
| SCLM Section B 4 of 6 numericals | **8 of 6** — four new items, real spare |
| BRGSA's four integrated scenarios never served | Served, and the diagnosis was **not the one recorded** — see §2 |
| No examiner-only slice | Six reserved BRGSA scenarios; Section C overlap **100% → 0%** |
| T1/T2/T4/T5 not built | All four built, all four gated, all four exit 0 |

Two things also moved that were not on that list, both because a new gate found them:
a scored item resting on a word its run had not taught (T1), and one feedback sentence
answering 55–100% of every wrong decision in a run (T5).

---

## 0 — Prerequisites

| # | Prerequisite | State |
| --- | --- | --- |
| 1 | Clean transcripts | Present. Validator prints a non-empty `coverage` block. |
| 2 | CLAs in `docs/course-material/` | Present (`SCLM-CLA.txt`, `BRGSA-CLA.txt`). |
| 3 | Dev server | `python tools/server.py`, port 53709 (8099 was taken). |
| 4 | Chrome | Present. `tools/screenshot.mjs` wrote **16/16**, 0 failed. |
| 5 | Required reading | `AGENTS.md`, `CONTENT-RULES.md`, `BUG-LAWS.md`, the authoring protocol, `PROMPT-BANK-OVERHAUL.md`. |
| 6 | Owner scope decision (§9) | **Not obtained** — non-interactive session. Assumptions stated in §7. |

---

## 1 — SCLM-M03-L06, and the provision that was actually blocking it

The brief located the two missing numericals behind one unauthored lesson. That is right,
and there was a second blocker underneath it nobody had named.

**The lecture.** `SCLM-M03-L06` is the Q model — continuous review, inventory position,
protection period, `ROP = μ_DLT + z·σ_DLT` with `σ_DLT = σ_d√L`. Lesson authored from the
transcript, all six glossary terms grepped against the module first (`inventory position` 5,
`safety stock` 11, `reorder point` 11, `cycle service level` 6, `continuous review` 10,
`protection period` 4). The worked example is the lecture's own discount-appliance store,
verified figure by figure: `√(2×520×45/12) = √3900 ≈ 62.5 → 63`, `σ_DLT = 8√3 = 13.86`,
`z(70%) = 0.55`, `ROP = 30 + 7.62 = 37.62 ≈ 38`.

**A correction to the brief.** §4 names the two items as "reorder point at 95% CSL, and the
service level the current policy achieves". Those exact figures are in **L07**'s worked
example (daily mean 60, σ 7, L 6, ROP 360), not L06's. The *method* both need is L06's, so
both items were authored against L06 with fresh figures — which is this file's own stated
policy for numericals, since the paper says every question is self-contained.

**The second blocker.** `T6_EXAM_PATTERN.md` says the real SCLM paper supplies standard
normal tables. Dungeon supplied none. That is why Section B sat at 4 of 6 and why *both*
missing items were z-based: with no table, no z-based question is answerable, so none could
be authored. A mock that withholds a tool the real paper hands out is a different exam, not
a harder one. The table is now a paper provision — `tables: ["standard-normal"]` on the SCLM
spec, a control beside the calculator, and the same table inline on any Learn numeric that
declares `reference: "standard-normal"`.

Φ is computed (Abramowitz & Stegun 26.2.17, error bound 7.5e-8) rather than stored as 310
literals, so there is one place to be wrong. `tests/normal-table.test.mjs` pins it against
the values every printed table agrees on and against the z values the lecture itself reads:

```
Φ(0)=0.5000  Φ(1)=0.8413  Φ(1.28)=0.8997  Φ(1.645)=0.9500
Φ(1.65)=0.9505  Φ(1.96)=0.9750  Φ(2.05)=0.9798  Φ(2.33)=0.9901  Φ(3)=0.9987
```

Read back off the **rendered** panel in the browser: `0.5000 / 0.8413 / 0.8997 / 0.9505 /
0.9798 / 0.9901`, 310 cells.

**The four items** (`sclm_eoq` ×2, `sclm_newsvendor` ×2), each citing two lectures so LAW-47
gates on both:

| Item | Asks | Answer |
| --- | --- | --- |
| reorder point at 95% CSL | μ 40/wk, σ 12, L 4 | 199.6 units |
| service level a policy achieves | ROP 495, μ 50/day, σ 15, L 9 | 84.1% |
| buffer to go 90% → 99% | μ 60/wk, σ 20, L 4 | 42 units |
| inventory position | 480 on hand, 250 in transit, 90 owed | 640 units |

Every one carries the `σ_d·L` instead of `σ_d√L` error as a **named** near miss with the
figure it produces, because that is where the marks actually go.

```
$ node tools/check_exam_readiness.mjs ; echo $?
  [ok  ] Section B · numeric · 8 of 6
  Every section can be filled. Remaining findings are quality, not volume.
  0 error(s), 1 warning(s).
0
```

The surviving warning is the pre-existing SCLM Section C match-prompt repetition. Untouched.

---

## 2 — BRGSA's integrated scenarios: the recorded diagnosis was wrong

The ledger said the four scenarios "have never been served to a student". Measured, that is
**not quite true and the reason matters**. `brgsa_case_false_win` *was* drawn — on set 2's
Section C — as was `ibm_case_hospital_growth` on IBM set 2. Three of four never reached any
set the product offers. The corrected statement is in §5 of this file and in the ledgers.

The brief said to check paper composition rather than the bank, and that was right:

- **Exam side.** BRGSA Section C is two **ten-mark structured responses**. Its pool was 36
  written items, of which **32 are three-to-five-minute per-concept prompts** ("in two to
  three sentences, explain X in your own words") and four were the scenarios built for that
  slot. A flat draw of 2 from 36 filled a ten-mark slot with a three-minute prompt four
  times in five. That is a composition defect; the content was there all along.
- **Learn side.** Never, and by construction. `startWrittenPractice` rotated
  `short/case/short/case`, and its fallback only fires when no unchosen concept has a prompt
  in the requested mode — which never happened, because every concept carries both. So the
  one surface the examiner's Section C is made of was the one surface Learn could not teach.
  That is the shape of *"if Examiner feels foreign, that is Learn's failure"*.

Fixed on both sides: sections gained a `prefer` order (`integrated → case → short`) on
BRGSA C and IBM A, and the Learn rotation's last slot is now `integrated` with the
one-concept-per-prompt rule relaxed for it — an integrated scenario spans four concepts and
is filed under the first, so uniqueness was rejecting the only surface of its kind.

Also fixed, from §5 of the brief: `addIntegratedScenarios` **dropped a scenario silently**
when a conceptId failed to resolve. It now throws, naming the id.
`tests/integrated-scenarios.test.mjs` asserts that by mutating a real id and requiring the
build to fail loudly.

---

## 3 — The examiner-only slice

Six new BRGSA integrated scenarios, `examOnly: true`, hard-reserved: excluded from every
study-set pool (`configureRuns`) and from written practice (`startWrittenPractice`).

This is only defensible because it is **additive**. §4.2 forbids hard-excluding shared items
from Learn, and nothing shared was excluded — the four original scenarios stay available,
and `tests/examiner-slice.test.mjs` asserts every concept still clears the bank's own
surface floor with the slice removed. What Learn lost access to is content that did not
exist yesterday.

Four was not enough and the reason was measured, not assumed: with two slots and three
seeded sets, four reserved items put sets 1 and 2 on an **identical pair** (probability 1 in
6 when you draw 2 from 4 twice — and it happened). Five separates them; six leaves headroom
and gives eight concepts a second situation.

```
BRGSA set 1 Section C -> brgsa_exam_delivery_app | brgsa_exam_paid_intent
BRGSA set 2 Section C -> brgsa_exam_roadmap_call | brgsa_exam_price_experiment
BRGSA set 3 Section C -> brgsa_exam_price_experiment | brgsa_exam_marketplace_leak
```

Preference ranks **mode first, reservation second** — a ten-mark slot needs a ten-mark item,
so an examiner-only three-minute prompt would still be the wrong shape for it.

---

## 4 — T1, T2, T4, T5

All four are new, all four gate, all four exit 0. T3 was already written and is re-run below.

### T1 — the cold-learner test · `tools/measure-cold-learner.mjs --gate`

For every scored item in a real delivered run, is every **course term** in the correct
answer introduced earlier in that same run?

The first draft compared every non-stopword and drowned two real findings under a few
hundred reports of "sustainable" and "meaningful". Ordinary English is not what a learner
lacks on day one. The unit is therefore a **glossary term or concept name** — LAW-49's own
definition of course vocabulary, extended rather than replaced, as §6 asks.

**It found one, and it is a new defect class.** `smoke_signal`'s correct answer read
"Whether exposed **prospects** take a behavioural step toward the offer". "Prospect" is
defined in `BRGSA-M01-L04`'s glossary; the item cites `M01-L02` and is delivered at step 5,
before L04. **LAW-47 gates on the lectures a surface cites, so it cannot see an answer using
vocabulary from a lecture the item does not cite.** Reworded to "people who see the page";
the distinction under test — a measured action against a stated opinion — is unchanged.

```
T1 passed: 32 scored items, every course term in every correct answer introduced
           earlier in its own run.
scoredItems 32 · itemsFullyTaught 32 · itemsRestingOnAnUndefinedTerm 0
```

### T2 — the ladder test · `measure-learn-exam-coverage.js --gate --handoffs=…`

Extended in place, as §6 asks. It measured the ladder and asserted nothing about it; it now
asserts four things — sets 1–8 are modules 1–8; no set schedules a question resting on a
concept a later set introduces; cumulative coverage never descends and reaches the whole
paper by set 8; every lesson's next-lecture promise is kept or corrected **on screen**.

The fourth cannot be answered in Node and this **refuses to score it** rather than pass it
by default. `lesson.connects` is the raw promise; reading it would report 12 BRGSA and 2 IBM
handoffs as broken when the app already qualifies every one of them. The answer comes from
`window.__dungeonExport.handoffs()`, captured in the browser to `handoffs.json`:

```
handoffPromises: SPMS pass (16 checked, 0 broken) · BRGSA pass (16, 0)
                 SCLM pass (16, 0) · IBM pass (16, 0)
T2 passed: sets 1-8 are modules 1-8, nothing rests on later ground,
           coverage reaches every paper, handoff promises checked in the app.
```

Without `--handoffs` every subject reads `not-run` and the gate **fails**, which is the
behaviour a probe that cannot stage its evidence owes.

### T3 — the craft ceiling (already written; re-run)

Mean of exam sets 1–3, against 25% chance. No regression from this session's content.

| | longest | fixedB | onTopic | noAbsolutes | ethical | combined |
| --- | --- | --- | --- | --- | --- | --- |
| SPMS | 19.8 | 23.8 | 17.4 | 22.7 | 27.0 | **16.3** |
| BRGSA | 29.7 | 23.3 | 25.0 | 14.9 | 25.7 | **15.3** |
| SCLM | 22.5 | 27.3 | 19.7 | 25.2 | 25.4 | **20.1** |

Learn side (`measure-learn-craft.mjs`), % of selectable parts: SPMS combined 22.0,
IBM 23.1, topicMatch 26.8/26.9. `measure-name-matching.js --gate` exits 0.

### T4 — the transfer test · `tools/measure-exam-transfer.mjs --gate`

Two assertions, and the first one taught me something before it measured anything.

**Overlap could not be measured against "all ten sets".** Set 10 is the flexible builder and
its pool is *every active question in the subject*, so "reachable in Learn" is satisfied by
every non-reserved item by construction, and the first version reported **100% on three of
four papers** whatever anybody authored. Split into `ladder` (sets 1–8, the sequence
everyone walks) and `anyRoute` (all ten). Both are upper bounds from pools, not deliveries —
`selectQuestionsFromPool` is a DOM-bound IIFE and must not be re-implemented — and are
labelled as such.

| | ladder | anyRoute | distinct examiner surface |
| --- | --- | --- | --- |
| SPMS | 100% | 100% | 0/16 concepts |
| **BRGSA** | **74.2%** | **75%** | **14/16 concepts** |
| SCLM | 100% | 100% | 0/16 |
| IBM | 100% | 100% | 0/16 |

BRGSA Section C: **0%** on both, against 100% for every other section. That is the whole
effect of the reserved slice, and the three rows of zeros are the honest statement that
**SPMS, SCLM and IBM have no examiner-only slice** — see §7.

Second assertion: trigram Jaccard under 0.20 between an examiner item and every Learn item
on the same concept. Gated on the half authoring controls; overlap is *reported* every run
so it cannot drift upward unseen.

### T5 — the three-persona regression · `tools/measure-persona-regression.mjs --gate`

Not T3 again. T3 asks whether the paper can be beaten by craft; this asks **what a learner
is told when they get something wrong**. Three deterministic answering policies (`cold`,
`crammer`, `careful`), each stalling somewhere different so each meets a different slice of
the feedback. Floors: every wrong decision gets a cue, distinct cues ≥ max(3, wrong/3), no
single cue over 60%.

**Two defects came out of building it, and one was mine.**

*The probe.* The first version looked up MCQ diagnoses under `perOption.answer`; the export
writes `perOption.whole`. It recorded "(no cue)" — a probe defect that reads exactly like the
content defect it was hunting. Fixed, with `byBlank` / `byStep` / `byRow` all handled.

*The gate.* The first version set a flat floor of 8 distinct cues and skipped any run with
fewer than 10 wrong decisions. A set-1 run offers about nine, so **every run was skipped and
the gate printed a pass over data it had not judged** — this repository's signature failure,
reproduced inside the tool written to catch it. Floors are now proportional and the no-cue
check is unconditional.

*The content.* With both fixed, T5 failed, correctly. One sentence — *"Return to the
governing idea and check the option against it directly before selecting."* — answered
55–100% of every wrong decision in every subject's set-1 run. `fallbackDiagnosis` fires when
an option has no provenance and no authored diagnosis, and it was **discarding information
it already had**: `targetRole`, the facet the slot is asking for. `targetRoleFor` misses on
options `attributeTo` has rewritten, so a `ROLE_BY_PERSPECTIVE` fallback was added — every
question carries `perspective`. Four cues instead of one, drawn from what the slot asks, not
manufactured to move a number.

| cold persona | before | after |
| --- | --- | --- |
| BRGSA set 1 | 5 distinct, top **54.5%** | 6 distinct, top **30.0%** |
| IBM set 1 | 3 distinct, top **66.7%** | 5 distinct, top **33.3%** |
| SCLM set 1 | 4 distinct, top **55.6%** | 5 distinct, top **33.3%** |
| SPMS set 1 | 4 distinct, top **63.6%** | 5 distinct, top **36.4%** |

Top-cue share roughly halved on every subject. 0 wrong decisions met with no cue.

### T6 — the reading pass

Every new item read cold by me: 4 SCLM numericals (with near misses and explanations), 6
integrated scenarios (caselet, task, 5 criteria, exemplar each), 1 lesson, 1 reworded MCQ
option. The `smoke_signal` finding came out of exactly this and is recorded above.
**No second reader.** Owner acceptance is owed on all of it.

---

## 5 — Gates

```
npm test                                          100/100        exit 0
node tools/validate_t6_bank.js "<transcripts>"    0 errors, 0 warnings, coverage non-empty
node tools/check_exam_readiness.mjs               0 errors       exit 0
node tools/check_lesson_file.mjs "<transcripts>"  ok:true        exit 0
node tools/check-palette.mjs                                     exit 0
node tools/build-site.mjs                                        exit 0
node tools/measure-name-matching.js --gate                       exit 0
node tools/measure-cold-learner.mjs --gate        T1             exit 0
node tools/measure-learn-exam-coverage.js --gate  T2             exit 0
node tools/export-persona-run.mjs && run-persona-strategies.mjs  T3
node tools/measure-exam-transfer.mjs --gate       T4             exit 0
node tools/measure-persona-regression.mjs --gate  T5             exit 0
node tools/screenshot.mjs --port 53709            16/16, 0 failed
```

`npm test` went 87 → **100**: three new files (`normal-table`, `integrated-scenarios`,
`examiner-slice`). **A finding on the runner itself:** two of those were listed in
`package.json` before they existed and `npm test` exited **0** — `node --test` silently
skipped the missing paths, while a lone missing file exits 1. A suite that passes over tests
that do not exist is worth knowing about; recorded in the quality log.

In the page, one subject per page load (LAW-62):

```
teach-before-test.js   SPMS 12 routes 0 violations · BRGSA 12/0 · SCLM 12/0 · IBM 12/0
lesson-layering.js     0 descents
primer-prediction.js   ok:true, answerableFromTheConceptName: [] on all four
export-run.js          paperDigestMatch TRUE on all four subjects
ui-audit.js            375 and 1280, exam mid-question with the table open:
                       0 overflow / clipped / circleFit / overlaps / cutRows /
                       hiddenScroll / barInset / ragged / sub-44px / off-scale radii
```

`paperDigestMatch: true` is the load-bearing one: it proves the persona harness's mirrored
paper builder still matches the app after `examPrefer` was added to both.

`export-run.js` refused to run at first — *"this page has already taught 65 lecture(s)"* —
which is LAW-62's guard doing its job after the teach-before-test sweep.

### The UI audit caught the new table three times, and was right twice

1. **12 `overflow` findings at 1280.** The detector already exempts deliberate scrollers via
   a `[data-scroll]` hook the new container did not use. Probe correct-by-design; hook added.
2. **1 `cutRows` finding.** The detector exists for the palette — many equal chip rows, the
   container height landing mid-chip. Here the single straddling child was the whole 836px
   table wrapper, which can never be shown whole at any scroll position. Refined to ignore a
   child taller than its container, and **verified against a live fixture** reproducing the
   original palette shape (12 rows of 51px in a 100px scroller): still fires, `childHeight
   51, containerHeight 100`. Goes quiet on the panel.
3. **`hiddenScroll` at 375 — a real defect, and the probe was right.** The conventional
   eleven-column table is 584px wide; at 375 it showed 325 of 584, **44% hidden**. A
   candidate under a clock would see up to 0.05 with nothing saying 0.06–0.09 exist.
   Shrinking the type would have crossed the 12px floor. Split into two six-column halves
   that sit side by side on a desktop and stack on a phone — 310 cells either way, no
   sideways scroll at any width. A first attempt using a CSS grid track was worse and was
   measured as such: a grid cell narrower than a table's min-content does not shrink the
   table, it overflows it, putting six columns 28px past the viewport edge at 1280. Flex
   wrap cannot do that.

Screenshots: `outputs/shots/`, 16 files, both themes at 375×812 and 1280×900. Read, not just
counted — `exam-question_SCLM_1280x900_light.png` shows **Section B · 6 × 4** and both
Calculator and Normal table controls; the 375 shot shows them on one row with the header
hidden mid-paper, as it should be.

---

## 6 — What was NOT done, and why

- **No owner scope decision (§9).** Non-interactive session. Assumed the smallest scope that
  finishes the named work: all four subjects touched only where a gate demanded it, the 64
  `summary`/`application` strings **not** rewritten, and new content shipped on a branch for
  acceptance rather than to testers before the 22–23 August papers.
- **No examiner-only slice for SPMS, SCLM or IBM.** T4 reports all three at 100% overlap and
  0/16 concepts with a distinct examiner surface. BRGSA was done because its Section C had
  the content and the composition defect; the other three need authoring that was not
  attempted. This is the largest thing still open.
- **IBM Section A** now leads with all four of its integrated scenarios, but they are
  **shared with Learn** and rely on the late tiebreaker. No IBM scenarios were authored.
- **The 64 concept `summary`/`application` strings** — untouched, as last session left them.
- **Fifteen of twenty SPMS MSQ stems** still ask what "the lecture" said. Untouched.
- **`spms_roadmap_msq`**'s date-recall option. Untouched.
- **IBM option lengths** at rank 3 of 4. Still a validator-level observation; untouched.
- **BRGSA self-containment** against the Clairo/Zoko rule — the six new scenarios were
  authored to it (invented firms, every figure inside the caselet); the **existing** bank has
  still never been audited against it.
- **No second reader on any new prose.** T6 is one person.
- **`AGENTS.md` is still over budget.** This session cut the 2026-08-12 block to one
  paragraph before adding its own, as §10 instructs.

## 7 — Status of new content

Everything authored here is `WAITING_OWNER_CONTENT_ACCEPTANCE`: one lesson, four SCLM
numericals with their near misses, six integrated scenarios, four fallback diagnosis cues,
one reworded MCQ option. Not merged, not deployed, `main` untouched.

---

# Second pass — closing the four items the section above left open

`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)` · same day, same branch.

## 8 — The examiner-only slice, now on all four subjects

44 reserved items, additive on every subject — nothing Learn could reach before was
withdrawn, which is what §4.2 requires and what `tests/examiner-slice.test.mjs` asserts
by re-checking each concept's surface floor **with the slice removed**.

| | reserved | shape |
| --- | --- | --- |
| SPMS | 16 | 8 multi-select, 8 mcq |
| SCLM | 16 | 16 mcq |
| BRGSA | 8 | 6 integrated scenarios, 2 mcq |
| IBM | 4 | 4 integrated scenarios |

**T4, before → after this pass:**

| | overlap (ladder) | concepts with a distinct examiner surface |
| --- | --- | --- |
| SPMS | 100% → **68%** | 0/16 → **16/16** |
| BRGSA | 74.2% → **69.2%** | 14/16 → **16/16** |
| SCLM | 100% → **80%** | 0/16 → **16/16** |
| IBM | 100% → **60%** | 0/16 → **16/16** |

T4's gate now holds the per-concept assertion, because that is the half authoring
controls and it regresses silently the moment a concept is added without a reserved item.

**SPMS Section B had no slack at all** — 20 drawn from a pool of 20 — so its "three
seeded sets" were one set printed three times across 40 of the paper's 75 marks, on the
only negatively marked section in the term. The pool is now 28 and Section B overlap is
60%.

**Reservation was generalised beyond written sections.** `examPrefer` previously ranked
reserved items only where a section declared a `writtenMode` order; it now applies to
every section type, because an examiner-only item exists to be on the paper whatever
format it takes. Mode band still decides first — a ten-mark slot needs a ten-mark item.

### A finding worth keeping: a reserved item's bias is never diluted

Adding two reserved BRGSA mcqs moved `combinedWithLength` on the drawn paper from 24% to
**33.6%** while the 78-item pool sat at 26% — and all three seeds read ~33, which is not
sampling noise. One of the two was won outright by the rule, and a reserved item is on
**every** paper, so its shape bias arrives undiluted where a shared item's would have
been cut to roughly a quarter. Fixing that single item took the figure to 28.6%.

`tests/examiner-slice.test.mjs` now asserts no reserved objective item is won outright by
"eliminate the absolutes, then take the second-longest". It caught **nine** on first run,
including seven I had just written. Each was fixed by removing a filler absolute (so a
distractor survives the filter) or by making a distractor more specific — never by
trimming a correct answer or weakening a load-bearing over-claim.

## 9 — "Pick the second-longest", which the brief had mis-scoped

§10 recorded this as *"IBM option lengths still put the correct answer at rank 3 of 4 in
50% of items"*. Measured properly it is **all four subjects**, and IBM is not the worst:

```
SPMS 38.5%   BRGSA 32.9%   SCLM 32.9%   IBM 35.9%      (chance 25%)
```

Two things were wrong with the original framing. The validator's `lengthRankShares`
counts the answer's exact position in a sort, which **a candidate cannot execute where
lengths tie** — resolving ties by guessing, as every other rule in the harness does,
moves the number by up to ten points. And the cause is not IBM-specific: it is
`comparableWrong`, which selects distractors *closest in length to the correct answer*.
That was the right move against "pick the longest" — which pays 20.7–29.5%, at or under
chance — and it clusters the four lengths so tightly that the answer lands one rank below
the top far more often than chance. **Defeating one shape cue manufactured its
neighbour**, and nothing was watching that rank.

**A structural fix was tested and rejected on measurement.** Three `comparableWrong`
variants — authored order, no length sort at all, and a stable-hash spread target —
produced **byte-identical numbers**, because the mcq families have exactly three authored
distractors and selection therefore has no freedom whatsoever. It is a prose job, and
knowing that before starting is worth the twenty minutes it took.

23 distractors were then made more specific — each now states the faulty reasoning it
stands for rather than only naming the wrong action:

```
SPMS 38.5 → 26.9    BRGSA 32.9 → 22.4    SCLM 32.9 → 27.0    IBM 35.9 → 28.2
longest unmoved on every subject; lengthRankSpread roughly halved everywhere
```

After the new tranches landed, the pools re-measured at SPMS 25.5, BRGSA 21.9, SCLM 18.9,
IBM 28.2. **The standing IBM length warning has cleared** — the bank validator now reports
0 errors and 0 warnings.

`secondLongest` and `combinedWithLength` are both in `run-persona-strategies.mjs` with
stated limits and a `--gate`. `combined` was deliberately **not** changed: its 32% limit
was calibrated against its three-rule form in the brief, and folding a fourth rule into it
would have made every earlier reading of that number incomparable with this one.

**`fixedB` is now reported and not gated, with the reason written down.** Answer slots are
dealt flat by construction and the bank validator confirms 0.25/0.25/0.25/0.25 on every
subject; what the harness measures is one 50-of-100 draw, where the standard error is
about 6 points. SCLM read 32 / 28 / 32 from a provably flat pool. Gating that sample
measures the draw, not the bank.

### LAW-67, a second time, in the tool written to catch it

Adding the strategy exposed it: `process.argv[2]` was taken as the harness directory, so
`--gate` became a directory name, every export lookup missed, and the gate **printed a
pass over a report containing nothing at all**. Fixed, and the tool now refuses outright
when no exports are found.

## 10 — SPMS multiple-select stems, and the date-recall option

**14 of 20** stems asked what *"the lecture"* said rather than what is true — the brief
records fifteen; the measured number is fourteen. All 14 rewritten to ask about the world:
*"Select every statement that matches how the lecture uses MoSCoW"* becomes *"Select every
statement that is true of how MoSCoW is used."*

`spms_roadmap_msq` carried *"WhatsApp launched first on iPhone, with the Android version
arriving around 2011"* as a **correct** option among framework claims. The release history
has a proper home in `spms_roadmap_msq_sequence`, which exists to read that case; the
option is replaced by the lesson's own strongest claim — *"What has been deliberately
deferred is as much a part of it as what has been scheduled."*

**LAW-53 returned the moment I authored, and is now a test.** Four of the eight new
examiner-only multi-selects came out 3-of-4 and one 4-of-4, which on +1/−1 scoring capped
at the question's 2 marks means **ticking every option scores full marks**. Nothing failed;
it was caught by printing the shape distribution by hand. `tests/examiner-slice.test.mjs`
now asserts ticking everything is strictly worse than answering. Shapes are
`{3-of-5: 20, 2-of-4: 6, 2-of-5: 2}`.

## 11 — BRGSA self-containment, audited for the first time

`tools/measure-self-containment.mjs --gate` — new, and the first check against the
guarantee `T6_EXAM_PATTERN.md` has made since it was written:

```
SPMS   brandFigureRecall 0   namesACaseItDoesNotShow 0
BRGSA  brandFigureRecall 0   namesACaseItDoesNotShow 0
SCLM   brandFigureRecall 0   namesACaseItDoesNotShow 0
IBM    brandFigureRecall 0   namesACaseItDoesNotShow 0
```

**Three probe narrowings were needed first, all verified against real items**, and the
first draft would have reported 25 defects that are not defects:

- **Computation is not recall.** `cac_scope` gives ₹3,00,000 and 120 customers and answers
  ₹2,500. A `derivable()` check over the four operations and a ratio-to-percentage
  distinguishes a figure the candidate can produce from one they must remember.
- **Small numbers are inputs even when they are not figures.** The carried-figure floor of
  10 excludes "the three checks" correctly, and excluded an alpha of 0.25 — which made a
  derivable answer (100 + 0.25 × 20 = 105) read as recall on eight SCLM surfaces.
- **A brand that is the concept's own name is a label.** *"Which statement best explains
  SELCO affordability system?"* names its subject; it does not point at a hidden case.

A third tier, `unreachedByThisCheck`, is reported and explicitly **not** a defect list —
12 SCLM items state a computed figure the check cannot reach in two operations. A probe
that reports its own reach as the bank's defect count costs exactly as much trust as one
that misses a defect.

## 12 — Gates, second pass

```
npm test                                        exit 0   (three new assertions)
node tools/validate_t6_bank.js "<transcripts>"  0 errors, 0 warnings
node tools/check_exam_readiness.mjs             exit 0
node tools/check_lesson_file.mjs                exit 0
node tools/check-palette.mjs                    exit 0
node tools/build-site.mjs                       exit 0
node tools/measure-name-matching.js --gate      exit 0
node tools/measure-self-containment.mjs --gate  exit 0   NEW
node tools/measure-cold-learner.mjs --gate      T1  exit 0
node tools/run-persona-strategies.mjs --gate    T3  exit 0  NEW gate
node tools/measure-exam-transfer.mjs --gate     T4  exit 0  tightened
node tools/measure-persona-regression.mjs --gate T5 exit 0
node tools/screenshot.mjs --port 8099           16/16, 0 failed
```

In the page, one subject per page load (LAW-62):

```
teach-before-test.js  SPMS 12/0 · BRGSA 12/0 · SCLM 12/0 · IBM 12/0
lesson-layering.js    0 descents
primer-prediction.js  ok:true, answerableFromTheConceptName: [] on all four
export-run.js         paperDigestMatch TRUE, 0 shortfalls, available 75/75
ui-audit.js           375 and 1280 on an SPMS paper mid-question, Section B (new
                      multi-selects on screen): 0 across all nine detectors
```

`paperDigestMatch: true` is again the load-bearing one — it proves the harness mirror
still matches the app after `examPrefer` was generalised to every section type.

## 13 — What is still not done

- **No second reader on any prose.** 44 reserved items, 14 rewritten stems and ~60
  adjusted distractors are all one person's reading. Owner acceptance is owed on all of it.
- **SCLM Section C's match warning** stands: 3 questions per paper share one prompt and the
  pool has 5 spare. It is the one surviving readiness warning.
- **BRGSA Section A and Section B overlap remain at 98.3% and 100%.** Its Section C is
  fully reserved and its two new mcqs closed the per-concept assertion, but the objective
  sections still draw almost entirely from shared items.
- **The 64 concept `summary`/`application` strings** — untouched, as in the first pass.
- **`unreachedByThisCheck`** — 16 items across three subjects that a person should glance
  at, listed in `self-containment.json`.
- All new content remains `WAITING_OWNER_CONTENT_ACCEPTANCE`. Not merged, not deployed.
