# Do the learners feel prepared?

Branch `fix/theme-switch-and-login-theming`. Not merged, not deployed. Preparedness run and mock
coverage audit, 2026-08-20.

## Remediation status — complete

The audit below is preserved as the before-state. Every actionable product finding it raised has
now been addressed. The fixes change the honest answer to the preparedness question in an
important way: **one recommended set still should not make any persona feel ready for a whole
subject, but the complete Learn path now has a credible, paper-shaped route to readiness instead of
leaving authored teaching outside the run.**

### Preparedness verdict after the fixes

| Persona | What they should feel now |
| --- | --- |
| Brilliant-but-lazy | **Not prepared.** This is the correct outcome. Fresh cases, written work, calculations, negative-marking MSQ and length-balanced MCQ prevent option craft from masquerading as subject knowledge. |
| Average Joe | **Not after one module; plausibly prepared after completing Learn and sitting the mixed mocks.** The route now reaches every lesson, leads IBM with writing, records confidence so guesses are visible, and repairs the exact concept that failed. |
| Dumb-but-diligent | **Not after one module; credibly preparatory after full completion.** The contradictions and neighbouring-concept feedback that made trusting the product unsafe are fixed, every authored lesson is delivered, and estimates now admit the real reading load. IBM still prepares framework use against an unknown caselet; it cannot predict the unreleased case. |

This is a product-readiness conclusion, not a claim that a simulated learner completed all 283
lecture entries after remediation. The original sampled personas remain **not whole-subject ready**
after their short runs, exactly as an honest product should report. A real post-course learner
outcome still requires the tester cohort or a full longitudinal sitting.

### Coverage after remediation

| Layer | Coverage | By subject |
| --- | ---: | --- |
| Registered teaching entries scheduled into Learn | **283/283 (100%)** | BRGSA 50/50 · IBM 78/78 · SCLM 71/71 · SPMS 84/84 |
| Readable-only teaching entries | **0** | 0 in every subject |
| Named syllabus ideas reached by questions | **359/359 (100%)** | BRGSA 69/69 · IBM 90/90 · SCLM 84/84 · SPMS 116/116 |
| Concept records with a derived link | **219/219 (100%)** | BRGSA 29 · IBM 85 · SCLM 36 · SPMS 69 |
| Question bank | **2,827** | BRGSA 417 · IBM 936 · SCLM 516 · SPMS 958 |
| Coverage-cycle mock breadth | **8/8 on every one of 17 papers** | SPMS 3 sets · BRGSA 4 · IBM 7 · SCLM 3; zero section shortfalls |

Mock coverage is now deterministic across a subject-sized cycle. Each later set prioritises
paper-relevant concepts earlier sets did not reach, while each individual set preserves the real
section counts, authored format mix, all eight modules and the option-craft limits:

| Subject | Sets to complete | Paper-relevant concepts reached | Source lessons represented | Unique questions / slots |
| --- | ---: | ---: | ---: | ---: |
| SPMS | 3 | **69/69 (100%)** | 65/84 (77.4%) | 112/165 |
| BRGSA | 4 | **29/29 (100%)** | 44/50 (88.0%) | 73/104 |
| IBM | 7 | **65/65 written-relevant (100%)** | 27/78 (34.6%) | 45/70 |
| SCLM | 3 | **36/36 (100%)** | 37/71 (52.1%) | 110/177 |

IBM's other twenty records are objective-only by authored taxonomy and remain in Learn; putting
them into its all-written paper would make the counter green by making the mock false. A separate
**Weakest links** diagnostic is rebuilt from the current learner's Learn evidence. It keeps the
subject's real section counts, marks and clock, but is excluded from the common coverage cycle and
from same-paper progress comparisons because its questions change as the learner changes.

### Findings fixed

- All 283 lecture entries now enter their module run in teaching order; add-ins are marked read with
  their host. The lesson gate and bank validator fail if a readable-only entry returns.
- Study-card times now include unread lesson prose, worked examples, glossary material, questions
  and primer overhead. Live examples moved from implausible `~12 minutes` to roughly 30–55 minutes.
- Learn now rehearses the real answer shapes: IBM written responses, BRGSA case/written responses,
  SPMS MSQ and SCLM numeric work where the bank contains it. IBM's recommendation leads with writing.
- Ordinary Learn and written practice prefer fresh, non-reserved cases; Examiner-only cases remain
  available to the paper instead of leaking through the default learning sequence.
- Demographic bottleneck, inclusive-business sustainability and the SPMS weakest-constraint claim
  were corrected. Generated case feedback now explains the authored case that was actually shown.
- A linked-question miss queues repair and confirmation for the exact failed concept. Evidence copy
  distinguishes correct attempts from Strong-eligible evidence rather than reporting a misleading
  zero after rapid correct answers.
- Examiner records optional confidence and reports correct-but-unsure and confident-wrong answers.
  Submit and leave confirmation now use accessible in-page dialogs instead of native browser prompts.
- SCLM match prompts rotate five visible stems. Fresh SCLM papers have three distinct match stems and
  the exam-readiness check is now 0 errors / 0 warnings.
- MCQ selection preserves the seeded draw and all eight modules, then performs the minimum swaps
  needed to hold the executable longest-option strategy at chance: SPMS 25.2%, BRGSA 25.1%, SCLM
  25.0% across each subject's complete coverage cycle. Every gated mechanical strategy passes.
- Numbered mocks are coverage cycles rather than three unrelated random draws: SPMS closes at set
  3, BRGSA at 4, SCLM at 3 and IBM at 7. The card shows each set's new concepts and cumulative reach.
- Each subject also offers a dynamic Weakest links paper. Selection is driven only by Learn's
  `conceptPriority` evidence; it does not use mock scores or dilute the shared coverage report.
- Coverage copy now says what 100% means: every named idea is reached, while repeated transfer depth
  still differs by concept.

### Post-fix verification

- `npm test`: **139/139 pass**.
- `check_lesson_file`: 283/283 scheduled, 0 errors, 0 readable-only warnings.
- Bank validator: 0 errors; `lessonsReadableOnly` is 0 for all four subjects.
- `check:syllabus` and `check:tested`: 359/359; spine: 219 linked concepts, 0 isolated.
- `npm run check:exam`: 0 errors, 0 warnings; all published sections fill.
- Fresh candidate/key exports: seventeen papers, all eight modules, zero shortfalls, 100% of the
  paper-relevant concept records by each final set; complete-cycle craft gate PASS.
- Production build: 20 public assets. Local Browser checks covered lesson delivery, honest duration,
  IBM's written-first recommendation, confidence controls, submit/leave dialogs and save/return.
  The new live Examiner check additionally showed all 3/4/7/3 set counts, cumulative coverage copy,
  and the separate Weakest links preflight.
- Independent post-change check: the existing Average Joe subagent's Browser sandbox exposed no
  browser session, including after the primary tab was released, so it could not honestly repeat the
  visual experience. Its read-only structural fallback passed the focused preparedness suite 9/9
  and independently reconciled all seventeen papers, 3/4/7/3 cycle lengths, final 100% relevant
  coverage, eight modules per paper, zero section shortfalls, IBM's 65/65 denominator and the
  Weakest links isolation assertions. This is structural corroboration, not a second UX verdict.

Machine-readable roll-up: `remediation-coverage.json`; fresh-paper detail: `mock-coverage.json`;
candidate/key exports: `persona-harness/`.

## Original audit snapshot — before remediation

## The question

This run asks one question only: **after using Dungeon, does this learner feel prepared for the
subject?** It does not treat a green structural gate, a complete syllabus phrase count, or a high
score inside an adjacent Learn sequence as an answer to that question.

Three existing personas were used verbatim from
`docs/briefs/PROMPT-EXPERIENCE-AND-TELEMETRY.md`:

| Persona | Behaviour |
| --- | --- |
| Average Joe | Normal effort; reads lessons; records when a correct answer was a guess. |
| Brilliant-but-lazy | Skips every lesson and attacks with test craft only. |
| Dumb-but-diligent | Reads every line served, memorises glossaries, trusts the app, and assumes contradictions are his fault. |

They ran on isolated local origins at ports 8091, 8092 and 8093, so browser state did not cross
between them. Their experience evidence came from the visible Learn and Examiner surfaces. The
coverage numbers came separately from blind candidate exports for sets 1-3 in all four subjects;
answer keys were kept in separate files and used only after candidate inspection.

## Headline verdict

**None of the three simulated learners felt prepared for any whole subject after the sampled
recommended path.** This is not the old failure where craft produced false 100% papers: the current
paper shapes largely defeat craft, the mocks span every module, and the product now warns learners
how little of the paper their completed Learn work has reached. The remaining gap is between a good
local teaching sequence and enough durable, format-matched practice to face a mixed whole-subject
paper.

| Persona | SPMS | BRGSA | IBM | SCLM |
| --- | --- | --- | --- | --- |
| Average Joe | **Not whole-subject ready**; partly confident | **No** | **No** | **No** |
| Brilliant-but-lazy | **No** | **No** | **No** | **No** |
| Dumb-but-diligent | **No now**; plausible after full Learn | **No now**; plausible with written practice | **No**; trust repairs needed first | **No now**; plausible after full Learn + calculations |

## The mocks were updated first

The expanded bank already flowed into the seeded papers for SPMS, BRGSA and SCLM. IBM had one
selection defect that stopped its newly authored written practice from flowing through: eight
legacy `integrated` prompts occupied eight of every ten slots on every paper.

Before the change, three IBM mocks contained only **14 unique questions**, reached **22/85 concept
records (25.9%)**, and every pair of papers shared eight of ten questions. The selector now reserves
**four whole integrated cases plus six focused case responses**. After the change:

- the three mocks contain **22 unique questions** and reach **31/85 records (36.5%)**;
- all eighteen focused-case slots across the three mocks are distinct;
- pairwise overlap is exactly four questions, the four intentionally reserved whole cases;
- each mock still spans all eight modules and carries ten ten-mark written answers;
- the four whole cases remain Examiner-only and first-class rather than being diluted away.

For IBM's actual written paper, 65 records are assessment-relevant (36 layer + 29 framework); the
other 20 are deliberately objective-only concepts. Against that paper-relevant denominator, the
three mocks reach **31/65 (47.7%)**. No mock claims to reproduce the caselet released two days before
the real exam.

## Objective mock coverage

Every individual mock reaches all eight modules. That is breadth, not whole-subject coverage.
Concept reach counts the primary concept and linked supporting concepts carried by each question;
lesson reach counts distinct source lectures represented by those questions.

| Subject | One mock: concept records | Across all three mocks | Source lessons across three | Unique questions / slots |
| --- | ---: | ---: | ---: | ---: |
| SPMS | 32-36/69 (46.4-52.2%) | 53/69 (76.8%) | 49/84 (58.3%) | 106/165 |
| BRGSA | 15-17/29 (51.7-58.6%) | 18/29 (62.1%) | 35/50 (70.0%) | 59/78 |
| IBM | 20-22/85 (23.5-25.9%) | 31/85 (36.5%); 31/65 written-relevant (47.7%) | 19/78 (24.4%) | 22/30 |
| SCLM | 30/36 (83.3%) | 36/36 (100%) | 37/71 (52.1%) | 111/177 |

The paper shapes now fill without shortfall:

| Subject | Current seeded mock |
| --- | --- |
| SPMS | 35 MCQ + 20 negative-marking MSQ = 75 marks |
| BRGSA | 20 MCQ + 4 case-cloze + 2 written = 80 marks |
| IBM | 10 written answers = 100 marks |
| SCLM | 50 MCQ + 6 numeric + 3 match = 80 marks |

The bank's phrase gate is **359/359 named syllabus ideas**, but that is not the same claim. Of 283
registered teaching entries, **101 remain readable-only and never enter a scheduled Learn run**:
IBM 48, SCLM 34, SPMS 19, BRGSA 0. A learner can find every one in the lesson index, but ordinary
practice does not deliver every one.

## Brilliant-but-lazy

**Verdict: No in all four subjects.** Learn made this persona look knowledgeable after skipping;
Examiner exposed that the knowledge was not his.

| Subject | Experience | Felt prepared? |
| --- | --- | --- |
| SPMS | Repeated lesson wording made the local sequence easy. Longest-option craft averages 35% of MCQ marks, but a live longest-option sitting with all negative-marking MSQs blank recorded only 16% overall. | **No** |
| BRGSA | Name matching and the forced primer rule solved adjacent Learn items. Half the mock's marks are case-cloze or written, where craft stops. | **No** |
| IBM | A primer connection became an answer nearly verbatim. Examiner is ten written recommendations with no options or glossary to exploit. | **No** |
| SCLM | Grammar and explicit labels helped with Learn matching; fixed-B failed all three boss steps. Numeric work genuinely defeated craft. | **No** |

The main exploit is adjacency: `Skip` still reveals the rule immediately before the scored item,
and the same rule or connection is often repeated in the answer and feedback. Match items can also
expose a principle-versus-decision split through labels and grammar. The strongest defence is the
real paper shape: negative-marking MSQ, case work, written recommendations and calculations all
require more than option craft.

The best observed remediation was a wrong SCLM boss answer. The feedback named the first broken
step, distinguished the governing idea from the neighbouring rule, printed a complete corrected
chain, and explained the connection. It can teach a learner who reads it; this persona would skim
it.

## Average Joe

**Verdict: not prepared for any whole subject yet.** Dungeon provides a credible route, but the
recommended exposure sampled here is too narrow. Native submit confirmation prevented a final live
check of the post-submit review; paper content and preflight were still inspected in all subjects.

| Subject | Experience | Felt prepared? |
| --- | --- | --- |
| SPMS | Learn answers were explainable and one realistic principle/decision miss received strong diagnosis. His first five live mock MCQs were correct, but at least two were educated guesses on untaught material. Preflight said 6/69 concepts and about 8% of marks had been taught. | **Partly, not for the whole subject** |
| BRGSA | Confidence was limited to landing-page validation immediately after its rule. He had no basis for statistics, CAC/payback, retention or written synthesis. Preflight said 2/29 concepts and about 5% of marks had been taught. | **No** |
| IBM | The demographic-bottleneck primer was a guess. A sensible FPO response appeared to meet roughly four of five visible rubric requirements, but that was case-reading and general reasoning rather than secure framework recall. Preflight said 1/65 written-relevant concepts and approximately 0% of marks taught. | **No** |
| SCLM | Push/pull felt secure after the lesson; EOQ, safety stock, reorder point, newsvendor and smoothing did not. Preflight said 3/36 concepts and about 3% of marks taught. | **No** |

The best trust signal is the preflight's honesty: it names how many concepts and roughly how much of
the paper the learner has actually been taught, then says a low score means Learn has not happened
yet rather than that the student is incapable. The mock reaches all modules, so that warning is
substantive rather than decorative.

The main measurement problem is guesses. His SPMS 5/5 would be recorded exactly like five secure
answers even though two were inference on unseen material; Examiner has no confidence capture.
There is also direct case reuse: the SPMS banking-app example and SCLM paint-postponement example
both crossed from Learn into the mock. Those questions demonstrate familiarity, not fresh transfer.

The recommended path is particularly misaligned for IBM: the sampled default Learn route was
objective, while its paper is entirely written. A separate written-practice route exists, but the
default recommendation does not lead with it. Estimated-duration copy is also not credible for a
careful reader: the first SCLM set alone contains nine substantial lessons plus primers, questions,
confidence steps and re-attempts under a `~12 minutes` promise.

## Dumb-but-diligent

**Verdict: not exam-ready in any subject today.** The teaching prose is strong enough that full
completion could plausibly prepare this learner for SPMS, BRGSA and SCLM. IBM first needs its
contradictions repaired and its written practice made central.

| Subject | Experience | Felt prepared? |
| --- | --- | --- |
| SPMS | Completed Set 1: seven lessons, eight scored questions, fifteen confirmations, nine concepts improved, 100% first try. Mock content reused or transferred JTBD, physical/software products, marginal cost, product line and DFV. Yet perfect completion produced 0 Strong concepts; correct screens sometimes said `0 distinct question types passed`, and generated product feedback contradicted the lesson by saying a product is measured by its strongest dimension. | **No now; plausible after full Learn** |
| BRGSA | All four first-run lessons were read. Landing-page traffic quality, commitment strength and MVP validation mapped naturally to cases. A correct Demand validation answer then received feedback about contaminated landing-page traffic rather than the chosen principle. | **No now; plausible after full Learn + written practice** |
| IBM | Per-capita growth, inequality, inclusive-business priority and hidden-subsidy economics were clear. But `demographic bottleneck` had two incompatible definitions, and a match accepted `the model always sustains itself` as an inclusive-business decision despite the lesson saying sustainability must be demonstrated. | **No; repair trust before more practice** |
| SCLM | Five lessons formed a genuine reasoning chain across flows, decision horizons, cycle/push-pull, strategic fit and financial measures. The first three mock items immediately demanded PPP, seasonal cold-storage capacity and newsvendor reasoning; the app honestly warned that only 5/36 concepts and about 4% of marks had been taught. | **No now; plausible after full Learn + calculation drills** |

For this persona, wrong feedback is more dangerous than missing feedback. He deliberately trusts and
memorises the application, so a neighbouring BRGSA explanation or an IBM statement that conflicts
with the lesson does not merely confuse one answer—it corrupts the learner's study model. Conversely,
the product did not flatter his SPMS 100%: it reported about 2% overall and Developing rather than
turning one completed set into an exam-readiness claim.

## Findings that bear directly on preparedness

1. **Learn fluency is not yet safe evidence of exam readiness.** The primer -> reveal -> adjacent
   question sequence can reward recognition and exact short-term recall. Examiner's mixed paper is
   the first strong transfer check.
2. **The mocks now sample the expanded bank, but no single mock is a coverage certificate.** All
   eight modules appear; only SCLM reaches every concept record even across three papers.
3. **IBM is structurally honest but necessarily incomplete.** It now rotates the expanded written
   bank while retaining four deep whole cases, yet cannot simulate an unreleased caselet.
4. **101 readable-only lessons create a delivery gap.** Complete authoring and 100% phrase coverage
   do not mean a normal learner is scheduled through the full course.
5. **SPMS still has a craft signal.** Across three exports, selecting the longest option earns 35%
   of MCQ marks against 25% chance, above the adopted 30% family limit. The other gated strategies
   stay within their limits; IBM exposes no objective craft surface at all.
6. **SCLM has one remaining paper-quality warning.** Its three match questions repeat the same
   visible task prompt because the match family has one stem, although the selected content varies.
7. **Contradictory generated feedback is now the highest-trust content defect.** IBM's demographic
   bottleneck and inclusive-business decision surfaces conflict with their lessons; BRGSA can
   explain a neighbouring concept after a correct answer. A diligent learner is uniquely harmed.
8. **Format-matched practice is not yet the default path where it matters most.** IBM's recommended
   sample was objective before a 100% written mock, and BRGSA's early Learn exposure did not prepare
   its 40 written/case marks. SCLM does surface the calculations that make up 24 marks, but only after
   much more Learn than the sampled first path delivered.

## Verification

- Bank validator: 0 errors, with the real transcript path supplied.
- `npm run check:exam`: 0 errors; one pre-existing SCLM repeated-match-prompt warning.
- `check:syllabus`, `check:taught`, `check:tested`, `check:spine`, naming, palette, release and review
  gates: pass.
- `check_lesson_file`: 0 errors; 101 readable-only warnings.
- `npm test`: **130/130 pass**. The runner is now explicitly serial because several syllabus tests
  mutate shared JSON fixtures; parallel execution allowed test probes to leak between files.
- `npm run build`: 20 public assets.
- Lesson-to-lecture match: exactly the owner-approved `SPMS-M01-L01` exception and nothing else.
- All twelve candidate exports fill their published sections and marks with zero shortfalls.

The three candidate/key sets per subject, machine-readable coverage, export summary and craft
output are retained beside this report.
