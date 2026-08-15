# Dungeon
> **Both craft exploits closed, measured by persona on both surfaces (2026-08-15; newest):**
> name-matching and "eliminate the absolutes" now pay at or under chance in every family.
> **Paper** (mean sets 1–3): SPMS combined 34.5 → **16.3**, BRGSA 37.8 → **15.3**, SCLM 24.5 →
> **20.1**. **Delivered study run**: SPMS 50 → **19.2**, BRGSA 37.8 → **28.2**, SCLM 48.2 →
> **22.0**, **IBM 67.3 → 23.1**. Name-matching: **324 → 23** option sets paying 100%.
> F-06: `apply` 45.8 → **20.0**, `explain` 43.1 → **16.5**, `boss` 33.1 → **23.6**, `authored`
> 31.4 → **23.7**. Both `--gate`s exit 0 and the bank validator is **0 errors and 0 warnings**
> — the standing IBM length warning cleared too.
> **The absolutes fix used two honest levers and refused a third.** 23 filler removals
> (`simply` is an intensifier, and `\ball\b`/`\bany\b` were matching "at all" and "in any way",
> which are not quantifiers — only **9.6%** of absolute-carrying distractors; the other 90.4%
> are load-bearing and were left alone), plus **76 correct answers restated at the course's
> real strength**, every added universal lifted from that concept's own accepted `bridge`.
> Nothing was manufactured and no distractor was watered down. `bridge_cloze` needed nothing
> because lecture-derived prose already carries absolutes 40.6% of the time; `summary` and
> `application` were hedged by *house style*, which is the artefact the tool exists to isolate.
> **Five defects came from verification rather than from the gates**, and each is a standing
> lesson: an "It" substitution firing on 11 of 64 summaries traded the name cue for a **length**
> cue; labelling `case_cloze`'s decision blank printed eight options behind one 36-character
> prefix and misattributed a *decision* to a framework name (fixed as a **trailing** tag, since
> the rule matches a substring anywhere); **appending** universals pushed IBM's "pick the
> longest" to **66%**, worse than the exploit being fixed, so all 76 rewrites were redone *in
> place* and IBM's rank-3 share went 0.50 → **0.38**; two option-shape errors on
> `sclm_smoothing`; and unlabelling `explain` on the plausible theory that the rewrites had
> evened its density sent it to **61.9%** — the label is load-bearing and stays.
> **Three owner-reported UI defects fixed the same session.** The **bag is gone from the
> Examiner** (a Learn tool; the paper carries its own Calculator and countdown), which ends a
> defect class rather than relocating it — the bag was docked into the paper's corner because
> it covered Submit, and docking then covered all but 18px of the theme toggle. The **two
> header bars now align** (`.app-header` used `clamp(16px,3vw,40px)`, `.exam-bar`
> `clamp(12px,2.5vw,22px)`, so the logo began at x=38.4 and "Section A" beneath it at x=22; the
> 76px/82px reservations existed only for the docked launcher). And the **palette no longer
> cuts a row in half** — `max-height: 46vh` is an arbitrary slice that landed mid-chip on
> SCLM's 50-question section, now `calc(round(down, 46vh + 7px, 51px) - 7px)`, a whole eight
> rows, **0 chips cut** at 375 and 1280. **Three further mobile defects, all measured on a
> live paper at 375:** the exam was top-heavy at **141px of chrome** (66px header over a
> 75px bar) with `.exam-sections` showing a **108px viewport over 266px** — Sections B and C
> gone with their question counts — so the header now hides during a running paper as it
> already did mid-question on the practice screen, and the freed row buys the tabs full
> width (**343/343**); moving those tabs onto their own row then sent the **clock from the
> trailing edge to the leading one**, because flex packs to the start; and the state chips
> read as distorted squares. On the chips, a percentage radius fixed the *scaling* and not
> the *look*, so they are now **regular shapes** — square vs circle for marked-for-review,
> underline vs none for answered — which keeps all five readable without colour.
> `check-palette.mjs`'s shape assertion covers the four `.dot` mastery states, **not** these
> chips, so it was never what held the tab silhouettes in place.
> **`ui-audit.js` gained three detectors and the repo gained
> `docs/governance/UI-CHECKLIST.md`**, because all three UI reports were found by eye on a
> screen the probe had just called clean: `hiddenScroll`, `cutRows` and `barInset`, each
> reintroduced as a live fixture and confirmed to fire *and* to go quiet on restore. That
> discipline immediately caught a factual error of my own — the mobile `100px` was **not**
> cutting a chip, its spare pixels fall in a gap — which is corrected in the ledgers.
> `VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)` at
> `evidence/2026-08-15/t6-bank-overhaul/verification.md`: **83/83**, LAW-47 0 violations, 0
> layering descents, `answerableFromTheConceptName: []`, `paperDigestMatch: true`,
> **screenshots 16/16 and read**, and 0 overflow / clipped / overlaps / ragged at 375 and 1280
> across practice **and** exam. **New `npm run review`** prints every gate beside the real
> option text. **Not done: no new items, no examiner-only slice, no SCLM-M03-L06 lesson,
> T1/T2/T4/T5.** 76 rewritten answers are `WAITING_OWNER_CONTENT_ACCEPTANCE`. Not merged or
> deployed.
>
> **The bank stops answering to its own heading (2026-08-15; the first half of the fix above):** name-matching —
> "keep the options that name the thing this set is called, then guess" — is closed in every
> generated family. **324 → 28** option sets pay 100%. Per family: `term_cloze` 100.0 → **retired**,
> `repair_cloze` 81.9 → **25.0**, `case_cloze` 70.8 → **25.0**, `explain` 66.0 → **25.0**,
> `bridge_cloze` 48.5 → **25.0**, `boss` 41.3 → **31.2**, `apply` 36.2 → **25.0**, `connect`
> **0.5 → 0.5** (untouched — it was already right and is the pattern the rest now follow).
> Learn-side through the real app: SPMS 53.8 → **25.0**, BRGSA 44.9 → **26.9**, SCLM 46.4 →
> **26.8**, IBM 59.6 → **32.7**. **IBM is still over the 32 limit and its residue is absolutes
> (37.8), not name-matching** — that is F-06 and it needs the concept-string rewrite, which was
> *not* done. `npm run review` exits non-zero on it rather than hiding it.
> **`term_cloze` was retired to `contrast` on an owner decision**: a label-selection item is 100%
> name-matchable *by construction*, because exactly one option can be the concept's name. Deleting
> it was not available — the bank floor is 792 items and every concept needs ≥10 surfaces and ≥8
> families — so `contrast` replaces it, keeping the job and making it answerable only by reading.
> **The fix is `connect`'s direction and the opposite was measured and rejected:** stripping each
> concept's name from its own prose reaches the same numbers and produces "Lean this idea asks
> whether real people will take a real action", and takes `connect` from 0.5% to 26.6%. Nothing
> shipped changes an authored word — the label is added, the prose untouched, over-claims keep
> their "alone". **Three defects came from verification, not from the gates:** an "It" substitution
> that fired on 11 of 64 summaries, all correct answers, traded the name cue for a **length** cue
> and earned SPMS a new validator warning (`lengthRankShares` are now byte-identical to baseline);
> labelling `case_cloze`'s decision blank printed **eight options each opening on the same
> 36-character prefix** and misattributed a decision to a framework name, fixed as a *trailing* tag
> since the rule matches a substring anywhere; and taking module siblings unconditionally failed
> the shape guard twice on `sclm_smoothing`, fixed via `relevantWrong()` (LAW-48).
> `VERIFIED(REAL_BROWSER + AUTOMATED)` at `evidence/2026-08-15/t6-bank-overhaul/verification.md`:
> **83/83**, bank `ok` 0 errors, name-matching gate **exit 0**, LAW-47 0 violations, 0 layering
> descents over 40 sets / 257 pairs, `primer-prediction` now reports
> **`answerableFromTheConceptName: []`**, `paperDigestMatch: true`, and 0 overflow / clipped /
> circleFit / overlaps / ragged at 375 and 1280 with new options on screen. The failsafes fired:
> `export-learn-run.mjs` refused a stale skeleton **naming the ids** rather than emitting
> `unknown`. **New `npm run review`** prints every gate plus the real option text, because a green
> gate says nothing about whether the sentences read well. **Not done: the 64 summary/application
> strings, so F-06 is untouched; no new items; no examiner-only slice; no SCLM-M03-L06 lesson;
> T1/T2/T4/T5/T6; screenshots still owed.** Not merged or deployed.
>
> **A third of the bank answers to its own heading, and the prescribed fix was wrong (2026-08-15;
> the audit that preceded the fix above):** name-matching had been measured at 45–60% over the ~13 selectable parts of one set-1
> run per subject — enough to know it leaks, not enough to know where. Measured over **every option
> set in the built bank (1049)**, `tools/measure-name-matching.js` puts **324 of them — a third of
> the bank — at a 100% payoff**, meaning the correct answer is the only option naming the concept.
> Per family: `term_cloze` **100.0**, `repair_cloze` 81.9, `case_cloze` 70.8, `explain` 66.0,
> `bridge_cloze` 48.5, **`boss` 41.3**, `apply` 36.2, `connect` **0.5**. **`boss` is the largest
> family in the bank at 480 option sets and had never been measured** — the craft tool samples about
> twelve boss steps in one run, and the earlier per-family cut folded boss into "other".
> **The standing diagnosis did not survive the measurement.** It attributed the exploit to
> distractors borrowed from other concepts and prescribed `relevantWrong()` everywhere; but
> `explain` and `apply` already use authored **same-concept** distractors and still leak 66.0% and
> 36.2%. The rule is `argmax`, not presence — **195 of 384** of their distractors do name the
> concept and lose anyway for naming it *less densely* than the correct answer. Cross-concept
> borrowing is real but confined to `repair_cloze` and `bridge_cloze`. **`connect` at 0.5% is the
> worked example**: it names the concept in *every* option, and that is the direction that fixes
> this without touching prose. The mirror fix was simulated before anything was edited and
> **rejected** — stripping each concept's name from its own prose drives every family to 21.8–27.1%
> but produces "Lean this idea asks whether real people will take a real action", "a payment or
> signed it is a different category" and "starts from the this idea position", and it takes
> `connect` from 0.5% to **26.6%**. Moving a metric by destroying the sentence is the mirror of
> watering down a distractor. **`term_cloze` and `case_cloze`'s framework blank are unfixable as
> items** — they ask for the concept's own name among four concept names, so the payoff is 100% by
> construction and no distractor choice changes it; retiring or rewriting them changes scheduled
> coverage and is an **owner call**. R3's on-topic-ness row said "Gate: none yet" since it was
> written; `--gate` now exits non-zero above 32% per family (10% for `connect`), and
> `tests/name-matching-gate.test.mjs` asserts the gate itself — every bank file the app loads,
> `t6_brgsa.js` before `t6_catalog.js`, all four subjects, `connect` held at ≤10%, and the exit code
> agreeing with the report in both directions. **78/78 → 83/83.** `VERIFIED(AUTOMATED)` at
> `evidence/2026-08-15/t6-bank-overhaul/verification.md`. **No bank content was edited and nothing
> learner-visible changed**, so no rehaul, no new items, no examiner-only slice, no rewrite of the
> 64 summary/application strings, and no SCLM-M03-L06 lesson — a half-applied distractor rule leaves
> the measurement describing neither bank. Two probe defects were caught before they became
> findings: reading `.coverage` instead of `.lessons.coverage`, and loading the catalog without
> `t6_brgsa.js`, which yields 48 concepts instead of 64 and made BRGSA report 100% on `explain`
> while showing "0 of 96 distractors missing the name" — **BRGSA carries no `confusions` and no
> `applicationWrong` fields at all**. Not merged or deployed.
>
> **A learn run you can read, and the CLAs measured before they were used (2026-08-15):**
> the persona harness's learn half had been refusing to run rather than emit wrong data. Three
> faults were stacked: it wrote `{selectedCourse}` into storage **after load**, and the app reads
> its profile from storage exactly once at load; it called `window.__dungeonSelectSubject`, which
> does not exist; so it clicked whichever set list was on screen and looked those ids up in a
> different subject's bank, where every step resolved to `unknown`. It now **drives the real
> subject rail** — find the card by its `.course-code`, click it, assert the app moved, open the
> set, assert the run that started is the one asked for — and an id the bank does not carry is a
> fatal error naming the id. The order comes from the app as a ~1 KB skeleton and
> `tools/export-learn-run.mjs` hydrates it into a 21–24 KB candidate run plus its key, so **no
> scheduling rule is re-implemented in Node**; the paper guard now compares digests *in the page*
> and is **4 / 4 MATCH**. `REDLINE` **LAW-65**: the per-option feedback sat on the *candidate* side
> under a comment saying it did not, and a diagnosis array has a hole at the correct option — **216
> of 216** MCQs have `diagnoses[answer] === null` — so it was an answer key. Blindness is now
> asserted by a walk over the candidate object. Two probe defects were caught before they became
> findings: the glossary field is `plain`, not `definition`, and the LAW-63 assertion fired on all
> eight primers and was **wrong every time** (a primer's rule is the concept summary, so it is
> legitimately a later question's correct option — that is teach-before-test, not a leak).
> **48 new items from the owner's CLAs** — SCLM 32, BRGSA 16 — authored into `t6_challenges.js`
> rather than a new file, because `t6_integrated.js` was added as one and was missing from four
> load lists at once. **The premise was measured first and did not survive:** the course's own
> papers put an absolute in the correct answer **3.0%** (SCLM) and **7.5%** (BRGSA) of the time,
> *less* often than the 12% bank being fixed, so copying their phrasing would have widened the gap;
> the rule applied instead is to state a claim universally only where the lecture's own claim is.
> The same measurement found something larger: **"pick the longest option" pays 53.7% and 86.7% on
> the real papers** against 11–32% here, so the most gameable property of this course's assessment
> is one the product already fixed. **F-08:** SCLM Section A's pool went 52 → 84 against a 50-question
> section — from two spare to thirty-four, an examiner-reserved slice for the first time. **F-06:
> closed on SCLM, not on BRGSA, and the reason is stated** — mean of sets 1–3, SCLM 36.0 → **29.5**
> (its own paper pays 32.6) with all rules combined at **24.5**, while BRGSA sits at 36.6 because
> its section draws 20 from 76 so only about four are new, and SPMS is untouched at 41.2.
> `run-persona-strategies.mjs` now reports the **mean of sets 1–3**, because one seed cannot tell a
> bank change from a draw. New `tools/measure-learn-craft.mjs` reports the exploit the mock cannot
> see: **inside a study set, name-matching the concept pays 45–60%**, reaching 67.3% on IBM.
> `VERIFIED(REAL_BROWSER + AUTOMATED)` at `evidence/2026-08-15/t6-harness-and-bank/verification.md`:
> 78/78, bank `ok` with 0 errors, palette clean, LAW-47 clean over 12 routes in each of SPMS, SCLM
> and BRGSA, 0 layering descents, reteach 3/3, and 0 overflow/clipped/circleFit/overlaps/sub-44px at
> 375 and 1280 with a new item on screen — which also caught a **LAW-64 recurrence**: the exam
> legend's chip carries a 44px tap floor inside a 26px grid track and painted 9×17px across its own
> label on five rows at every desktop width, on a screen the previous sweep never visited. F-25 is
> corrected to 9 of 32 rather than universal. New content is `WAITING_OWNER_CONTENT_ACCEPTANCE`;
> not merged or deployed.
>
> **The ladder was in the bank and not in the product (2026-08-15):** the owner asked for a
> step-by-step system where concepts layer, testing feels connected, mistakes bring back the lessons
> you need, and the Examiner tests what has been taught — *"If Examiner feels foreign, that's Dungeon
> Learn's failure."* Measuring first changed the job. `tools/measure-learn-exam-coverage.js` walks
> each subject's sets in order: **sets 1–8 are modules 1–8, two concepts each, and finishing them in
> order carries a learner from a tenth of their paper to all of it** — SPMS 10.7% → 100%, BRGSA 8.8%,
> SCLM 9.7%, IBM 10%. Every concept's source lecture has a lesson. So the three students' F-16 ("the
> recommended set teaches a fraction of what its mock examines") is **not a content gap; it is the
> expected state after one step of eight, which the product never said.** Ten identical cards under
> "You do not have to complete all ten", no position, nothing separating the eight that build the
> subject from the two that revisit it. Fixed by saying what the bank already knew: `courseLadder()`
> gives every set a step number, what it adds, and what it rests on; `examReadiness()` states on the
> paper card, the hero and the pre-clock cover how much of *this* paper Learn has taught — "2 of the
> 16 concepts this paper draws on — about 10% of this set's 72 marks" — with **Teach me that first**
> crossing back into the next rung, because a readiness figure with no route out of it is just a
> discouraging number. `lessonsRead` was a **one-way latch**, so a lecture met once was never taught
> again *including by the routes that exist for nothing else* — `conceptRepairIds` is commented
> "taught first", `startExamRepair` prints it on screen, and both were true only for first contact.
> Re-teaching is now driven by evidence and scoped hard (remediation only; only on errors recorded
> *after* the read; only while the gap is open, so wrong-then-right is left alone). F-19's ordering
> half was already fixed — 40 sets, 253 pairs, **0 descents** — but the **promise** half was never in
> scope and the layering check cannot see it: `tools/measure-lesson-handoffs.js` finds **12 of
> BRGSA's 15 handoffs and 2 of IBM's** promising "the next lecture" across a skip, agreeing with the
> blind student findings on all four subjects including SCLM being clean. Fixed in code rather than
> by rewriting fourteen sentences, because different routes deliver different subsets so **no fixed
> sentence is true of every run**. Also closed: F-34 (the hero read a stale four-item seed list while
> the card read the real count — one set, three numbers, one screen), F-19a ("Module 1 · lesson 5" on
> the first lesson sent a careful reader hunting for four he never missed), F-31 (a re-attempt
> counter that was honest under a caption that was not — a *correct* answer schedules one), and F-33
> (**course vocabulary scored 3/3 on the one lecture Learn delivered and under a third across the
> nine it did not — it measures delivery almost perfectly and was billing it to the student**).
> `VERIFIED(REAL_BROWSER + AUTOMATED)` at `evidence/2026-08-15/t6-ladder-and-readiness/verification.md`:
> 78/78, bank `ok`, palette clean, LAW-47 re-run **because this change adds lessons to queues that had
> none** (12 routes, 0 violations), layering 0 descents, new `reteach-on-failure.js` 3/3, and 0
> overflow / clipped / overlaps / sub-44px at 375 and 1280 over dashboard, examiner home and lesson.
> **The verification also caught a defect in itself:** the first `reteach-on-failure.js` staged its
> fixture over an empty key, `loadProfile` normalised it away on the reload, and it reported the
> re-teach broken while the app was doing it correctly — a red report from a broken probe reads
> exactly like a broken app, so it now refuses to run without a profile to stage onto. **Untouched and
> still the biggest holes:** F-02 (BRGSA Section B renders four unanswerable questions and bills them
> to the student), F-05 (the fake stem, 12–16 marks a paper) and F-08 (Learn items reprinted verbatim
> in mocks). Pixel acceptance still owed; not merged or deployed.
>
> **Text that did not fit its box, and the probe that could not see it (2026-08-14):** the
> owner sent a screenshot of the results ring printing "16 scored questions" across its own stroke,
> with a standing instruction that overlapping and mis-sized text cannot happen and readability on
> desktop and mobile is paramount. `tools/browser-checks/ui-audit.js` had reported that screen clean
> twice in the same session — correctly, for what it measured: viewport edge, tap size, corner radii,
> paragraph length, font floor, row raggedness, and **nothing about whether content fits its
> container**. So the probe was extended before anything was fixed, and it found two more defects
> behind the reported one. `REDLINE` **LAW-64**. Three detectors: `clipped` (text runs painted
> outside the box laying them out), `circleFit` (text in a round container against the **chord** at
> the height it sits — a circle is narrower than its box everywhere but the middle), `overlaps`.
> `clipped` measures **glyph runs** through `Range.getClientRects()`, never `scrollWidth`, which on an
> inline box describes its containing block — the first version buried two real defects under forty
> false ones. Fixed: the ring caption moved **out** of the circle (it needed 118px where the circle is
> 110px wide at that height); the **mastery key**, whose row was `grid-template-columns: auto
> minmax(0,1fr)` around *three* children, so at 375px the columns resolved to 274px and 28.7px, "Needs
> practice" wrapped inside 28.7px and ran **19px past the panel** with its description on the row
> below — now a hanging indent; and three tap targets under the floor, including the Tele-MANAS crisis
> link at 35×16. Swept at **320, 375 and 1280** over every screen in fixed-width same-origin iframes:
> **0 findings**. The lesson worth keeping is that a clean report from a probe blind to the defect
> class reads exactly like a clean screen.
>
> **Three levels instead of four dials (2026-08-14):** "Build your own practice" opens on
> three cards named for the stretch of marks each is built for — `0 → 60` cover everything once,
> `60 → 80` test each idea properly, `80 → 100` only the hardest surfaces — and the four dials that
> used to be the front door are unchanged, still connected, and folded into a disclosure. **A preset
> is exactly a set of the dials and the lit card is read back from them**, never stored beside them,
> so pressing a chip afterwards lands on "Custom mix" rather than leaving a card describing a run the
> queue will not deliver. Two dials are new and both were things the presets had to turn: **How
> hard** exposes the `difficulty` every scheduled question has carried since the bank was built and
> which nothing on the learn side could ever ask for, and **How long → Every concept** is a coverage
> rule whose target is the subject's concept count. `0 → 60` selects its own questions —
> `selectQuestionsFromPool` ranks format spread above concept spread, so asking it for sixteen from a
> sixteen-concept subject returns *about* one each — and `sweepSelection` hands its picks to
> `orderForDelivery`, the ordering rule factored out so both routes sequence a run identically and
> LAW-47 holds by construction. The time claim is now made against the **queue**: a first `0 → 60` is
> 16 questions and 32 lessons and primers, and counting only questions understated it by every lesson
> in the subject. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-14/t6-practice-presets/verification.md`: each card's printed sentence asserted
> against the real queue — 16/16 concepts, 3 bosses, 5 formats, no question outside its band — LAW-47
> clean across all three presets, 78/78, 0 overflow and 0 sub-44px targets at both viewports. Pixel
> acceptance still owed; the pane was not compositing.
>
> **The primer predicts instead of printing its own answer (2026-08-14; same session):** the owner
> reported "a primer is just tapping the same mcq as the question verbatim", and the measurement was
> worse — `renderPrimerPanel` printed `Know this: <primerFact>` directly above options whose correct
> entry was that same string, **64 of 64**, with distractors borrowed from other concepts so the item
> stayed topic-matchable even with the panel covered. First contact with every idea in the course was
> spent matching a string. `REDLINE` **LAW-63**, written narrowly on purpose: teaching a principle
> before a later scored question is LAW-47 doing its job, and the indefensible thing is **one surface
> holding both the question and its answer**. Fixed as **predict, then reveal** (owner's choice of
> three shapes): the panel carries the concept's caselet and withholds the rule, the learner writes
> what they think it shows, and the principle arrives afterwards as the answer to their own
> prediction with their words quoted above it. No key, no marking, no evidence — **being wrong is the
> mechanism**, which is why it can ask for reasoning at first contact where a keyed question could
> only ask for recall of something never taught. A keyed two-step was rejected on measurement, not
> taste: every same-concept string is already spoken for (`confusions` → `_explain`,
> `applicationWrong` → `_apply`, `bridge` → `_connect`), so it would pre-answer a scored question,
> and **BRGSA carries no same-concept near-misses at all**. `recordPrimerAttempt` no longer moves the
> support ladder — it was reading whether somebody could match a string — so the ladder is now driven
> entirely by `updatePrimerFromChallenge`, the concept's scored questions. The bank gate now
> **forbids** options on a primer. `tools/browser-checks/primer-prediction.js` is the standing check:
> `ok: true`, 16/16 primers. **Reported and not fixed:** `_term_cloze` and `_case_cloze`'s framework
> blank answer with the concept's own *name*, which the layering copy must print — **32 scheduled
> questions per subject, 128 in all**. Outside LAW-63, reported separately, and an owner call because
> the fix changes scheduled coverage. Also fixed: `teach-before-test.js` reported clean over three
> routes instead of twelve when a saved run resumed into the practice screen, so an unreached route
> now makes the result not-ok.
>
> **Weaknesses are linked or explicitly alone (2026-08-14):** the weakness route used to be
> eight unrelated repairs. It now pairs two weak concepts **when the bank genuinely connects them**,
> closes the pair with the surface that tests both, and reports every other gap as standing on its
> own. "Close enough" is defined by the bank rather than by proximity: an edge exists only where one
> authored surface tests both concepts, because a link with no surface behind it is a claim the
> product cannot honour. There is no Term 6 concept graph to lean on — `data/graphs/` holds BEHECON,
> GER, MACRO, NABM and NPD — so this was measured from the question set: **each concept has exactly
> one partner, its module sibling** (a `_match` question plus five boss steps), and SCLM adds two
> real cross-module edges through `sclm_syn_inventory`. Nothing else, so **isolation is the common
> case and is a first-class outcome, not a fallback**. A weakness pairs only when its partner is
> *also* weak — a link to something already Strong is not a shared gap. Pairing is greedy in priority
> order so the weakest concept chooses first, and inside a pair the earlier lecture still leads. Run
> length went 8 → 10 because a pair costs three items. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-14/t6-weakness-linking/verification.md`: three seeded fixtures — all-paired,
> all-isolated, mixed — plus `tools/browser-checks/weakness-linking.js` asserting no invented link,
> every claimed pair actually checked, and isolated never folded into a pair. Two defects it caught:
> the run delivered 12 items against a stated cap of 10, and the "Both together" label was first
> written into `.question-meta`, which is `display: none`. Layering and LAW-47 re-run clean; 78/78.
>
> **Concepts are layered (2026-08-14):** a run now walks the course's own teaching order, so
> each lesson builds on the one before it. It did not before — lecture position was not an input to
> scheduling anywhere. `layeredQueue()` places a lesson immediately before the first surface citing
> it, so lesson order was a by-product of question order; and `selectQuestionsFromPool()` ordered
> questions by never-attempted → format variety → concept variety → least-recent → a **hash of the
> question id**. On a fresh profile the first four keys tie, so the opening question of a run — and
> the first lesson a learner ever met — was picked by that hash. Meanwhile the primer had been
> printing *"Carry forward: `<previous>`. Now add `<this>`"* and the header *"builds on what you just
> did"* against a sequence nothing had sequenced. **Selection is untouched** — format spread, concept
> coverage and weak-first all stay — and only delivery changed: selected questions are sorted by
> teaching rank, and `layeredQueue` commits to the run's whole lesson list up front and drains it in
> order, so lesson delivery is monotonic by construction and LAW-47 holds a fortiori.
> `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-14/t6-lesson-order-diagnosis/verification.md`: across all 40 sets in four
> subjects, **94 descents over 37 of 40 sets → 0**, with the consecutive-pair count identical at 253
> before and after — the proof selection did not move. BRGSA set 9 runs 18 lessons from M01-L01 to
> M08-L01 with zero backward steps. Official LAW-47 check clean, 78/78, palette and build clean.
> `startPriorityPractice` is deliberately excluded: it is remediation ordered by need and says so on
> screen. The measurement also cost a `WATCH` law — **LAW-62**: rendering a lesson marks it read *in
> memory*, so a probe opening several sets in one page load contaminates itself, and the first
> version of this measurement reported 53 LAW-47 violations that did not exist. Tester-visible and
> not merged.
>
> **Questions that name an example now show it (2026-08-14):** a stem read "In the
> drilling-machine example, select every need the purchase actually serves" and no drilling machine
> appeared anywhere on the page. All 816 questions were audited in two passes — sixteen deictic
> phrasings, then a proper-noun sweep over every stem shipping no caselet — and the defect is
> confined to SPMS Section B's twenty authored multiple-select items: `addAuthoredMultiSelect` had no
> `caselet` field, so none of them could carry a case even when the stem named one. **Four do name
> one** (drilling machine, Zerodha, ride-hailing MoSCoW, WhatsApp) and all four now display it,
> written from their own lecture's clean transcript and withholding the classification the question
> asks for. The authoring had been leaning on teach-before-test to supply the example, which is not
> what LAW-47 guarantees: `SPMS-M07-L01`'s lesson does not contain the bucket assignment its question
> asks for, and **the examiner delivers no lesson at all** — Section B is these same twenty items sat
> cold. Options, `answers` and `diagnoses` are byte-identical, so marking, per-option diagnoses and
> the LAW-53 shape spread are untouched. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-14/t6-example-questions-show-their-example/verification.md`: all four render on
> the examiner (targeted through the seeded palette) and the drilling-machine item reached through a
> real concept run on the learn surface, 0 horizontal overflow and 0 sub-44px targets at 375×812,
> `check:exam SPMS` clean, 78/78. Logged as `REDLINE` LAW-61. **Reported and deliberately not
> changed:** fifteen of the twenty MSQ stems still ask what *"the lecture"* said rather than what is
> true, which trains recall of a session instead of the idea. New prose stays
> `WAITING_OWNER_CONTENT_ACCEPTANCE`; not merged or deployed.
>
> **Hosted written checking is deployable and unmeasured (2026-08-14):** the hosted marker no
> longer needs a vector index. Retrieval never reads the candidate answer, so each question's course
> evidence is a constant; it is now frozen at build time — 380 chunks over all 64 questions, 511 KiB,
> zero lecture-boundary violations, 155.92 KiB gzipped against a 3 MiB free ceiling. Vectorize and the
> embedding model are gone from the request path, course transcripts stay out of any hosted store, and
> creating the index and uploading 3,470 chunks is no longer an owner action. `COURSE_RAG` was a
> binding to an index that never existed and would have failed every deploy; it is removed.
> `DUNGEON_HOSTED_WRITTEN_CORPUS` is now the pack's own content digest, so approval cannot drift from
> the text the marker quotes. Two gaps between promise and code were closed: the hosted runtime
> imported the distress helpers and never called them, so the privacy notice's "not sent to any AI
> provider, not marked, not stored" was unkept on the runtime testers use; and the written-answer
> retention the agreement asks consent for did not exist. Answers now carry a per-row 92-day expiry
> deleted by a daily cron, revocation deletes them explicitly, and the owner has a per-tester
> "Delete answers" control. `VERIFIED(AUTOMATED)` at
> `evidence/2026-08-14/t6-frozen-evidence-and-answer-retention/verification.md`. Automated suite:
> 78/78. **Marking quality is the open question, not infrastructure:** IBM exemplars reach full marks
> 22/32 (short-form 14/16) for 63/80 of available marks; BRGSA reaches 13/32 for 45/80, and five of
> the eight questions flagged for concept-label/exemplar mismatch are in that failure list. Zero false
> awards across 64 content-free answers in every run. The hosted checkpoint has never been run.
> Activation remains off; `WAITING_OWNER_CALIBRATION + WAITING_OWNER_CONTENT_ACCEPTANCE`.
>
> **Written transfer throughout Learn; forensic review after Examiner (2026-08-13):** prose
> practice now follows the published paper rather than appearing in every subject. BRGSA and IBM
> each carry **32 authored prompts** — one short framework explanation and one full case response
> for every concept — while SPMS and SCLM keep their applied work in the objective, MSQ, numerical,
> and matching formats their papers actually use. Each written rubric owns a bounded taxonomy of
> missing versus misunderstood gaps. Qwen must select those server-owned codes; only accepted codes
> enter `writtenPractice.gaps`. Dungeon then shows the exact repair, schedules another written
> surface on the concept later in the run, and keeps recommending fresh wording/cases until two
> accepted transfer confirmations close the gap. **Examiner uses the slower counterpart only after
> submission:** one source-bound rubric judgement plus a separately generated and verified deep
> coach. The mock score is already frozen; misses open lesson-plan targets and `examMisses`, while
> successes never close a gap or create mastery. Candidate prose and deep-review prose are not
> added to the saved profile. The real path also caught a citation-envelope mismatch: accepted
> point-level citations are now canonicalised into the top-level source list before browser
> validation. The real browser/local-model path also caught Windows decoding UTF-8
> punctuation through the system code page; `server.py` now fixes the subprocess and response
> charset, with a second browser-side script guard. `VERIFIED(REAL_BROWSER + REAL_LOCAL_MODEL +
> AUTOMATED)` at `evidence/2026-08-13/t6-written-transfer-and-examiner-forensics/verification.md`.
> Automated suite: 63/63. Academic authority remains `WAITING_LOCAL_MODEL_CALIBRATION`; hosted
> activation remains off.
>
> **Dungeon now owns written repair (2026-08-13; newest):** authored written practice no longer
> means “pick the four least recently seen prompts and let Qwen comment.” Accepted criterion
> judgements build a **separate written-practice profile** for course understanding and judgement +
> evidence; it never enters `conceptAttempts` and never creates Strong. A miss opens two fresh
> confirmations, inserts a deterministic unscored repair immediately, labels the next authored case
> as the transfer check, and keeps the existing different-family concept question later in the run.
> The weakest open writing move can now become the homepage's one **Next** recommendation, with the
> remaining confirmations stated; otherwise Dungeon starts with untested prompts and weak concepts.
> During any practice run the header subject select is gone—the run already owns its subject—which
> also closes the blank restored-dropdown defect. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-13/t6-proactive-written-adaptation/verification.md`: recommendation → accepted
> miss → inserted teaching → fresh transfer prompt, 0 horizontal overflow, 0 visible sub-44px
> targets, subject control hidden, 62/62 tests. The model is still practice-only and local quality
> remains `WAITING_LOCAL_MODEL_CALIBRATION`; hosted corpus, consent, calibration, and deployment wait.
>
> **Practical written answers corrected and accelerated (2026-08-13; newest):** the reported
> landing-page answer was reasonable; the item contract was not. Its case and defensible decision
> came from BRGSA M01-L03 while the generated written item declared only M01-L01 and demanded an
> unrelated pre-declared-test reason. All generated practical prompts now ask what should be done
> and why the case supports it, cite both principle and applied lectures, and use two transparent
> criteria — course understanding; judgement and case evidence. Per-answer marking is one compact
> Qwen judgement followed by deterministic schema, English-script, declared-citation, and literal-
> answer-evidence checks; a second call to the same checkpoint is calibration/audit, not independent
> authority. After 900 ms idle, local Dungeon prepares question-only evidence and sends no partial
> draft; the answer leaves the browser only on Check. The exact owner response now returns 2/2 in
> 24.937s (old path: 46.9s and abstain), with evidence prepared in 497ms. The translucent bag is
> docked in reserved header space during practice, so saved drag coordinates cannot cover learning
> copy. `VERIFIED(REAL_BROWSER + REAL_MAC_MODEL + AUTOMATED)` at
> `evidence/2026-08-13/t6-practical-written-answer/verification.md`: 62/62 tests, real-transcript
> bank/lesson gates, palette and release build pass; 375×812 has zero horizontal overflow and no
> bag/question intersection. Calibration, owner content acceptance, hosted corpus/consent, PR,
> merge, and deployment remain waiting.
>
> **Authored written practice, compact authority, clean model prose (2026-08-13; newest):** the
> learner product is **Practise written answers**, not an open question/answer box. Dungeon selects
> four authored short-answer prompts, preserves teach-before-test, owns each rubric and lecture
> boundary, and lets Qwen check the learner's application criterion by criterion. The subject-wide
> analyzer remains unlinked local evaluation tooling and has no public Worker route. Learner-facing
> evidence is now a compact subject/module tag such as `BRGSA M1`; exact lecture/chunk citations
> remain inside the validated authority result. A real Mac-checkpoint retry confirmed that the stray
> CJK/mojibake seen in earlier Qwen prose no longer survives: model-authored English is instructed to
> use plain ASCII punctuation, validated for unexpected scripts, regenerated once, then safely
> withheld if corruption recurs (LAW-60). Evidence:
> `evidence/2026-08-13/t6-hosted-written-authority/verification.md`. Hosted AI activation remains
> `WAITING_HOSTED_CORPUS + WAITING_OWNER_CALIBRATION + WAITING_OWNER_CONSENT + WAITING_OWNER_DEPLOY`.
>
> **Local written-response authority (2026-08-13; branch):** the owner authorised Qwen to issue
> Dungeon's final criterion mark for **local practice writing**, not an official IIMB grade and not
> Strong evidence. `tools/local-grader.mjs` loads the real bank, retrieves only from the question's
> declared lectures, runs one compact structured judgement through loopback LM Studio, and accepts it
> only when schema, script, citations and awarded answer text validate. Every other outcome abstains
> into the existing rubric/exemplar self-review. An accepted missing criterion proactively places a
> different question later. `tools/server.py` exposes the route only when explicitly enabled, only
> to loopback and same origin, one request at a time; production, LAN clients and the timed examiner
> have no model path. `VERIFIED(REAL_BROWSER + REAL_MAC_MODEL + AUTOMATED)` on
> `codex/measurement-foundation` at
> `evidence/2026-08-13/t6-local-written-authority/verification.md`: 50 tests, deterministic boundary
> coverage, and a real Browser run through the exact owner-approved Mac checkpoint
> `qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled` over a private Windows→Mac SSH loopback
> forward. Real BRGSA and SCLM exemplars returned accepted source-cited 3/3 marks; the live waiting
> state is explicit and responsive. A 12-case, four-subject synthetic smoke recorded 72.22%
> criterion agreement, 66.67% exact cases, 2.78% apparent false awards, 25% abstention, safe 0/3 on
> all injection-shaped cases, and 43.25s mean latency. This is operating evidence, **not academic
> calibration**. `WAITING_LOCAL_MODEL_CALIBRATION` remains until the same exact checkpoint passes an
> owner-marked 48-answer multi-subject set. The server enforces exact configured/approved model-id
> equality before local HTTP authority exists. The high-effort audit also fixed a measurement defect: a later rapid-correct
> answer no longer demotes an already Strong concept; it adds no Strong evidence and erases none.
>
> **Two sides of one coin (2026-08-13; newest):** the crossing between the learning system and the
> examiner is a slim two-panel band at the top of both home pages — Learn left, Examiner right, one
> object split down the middle. The side you are on is filled in its own colour (`--ink`, which
> flips with the theme, and saffron) and is inert and `aria-current`; the other side is the whole
> panel as a button. It replaced the dashboard's dark mock invite and the examiner's return button.
> The header switch is now its shorthand: it folds away while a coin is on screen and unfolds as one
> scrolls off, animating width rather than opacity, and it is withheld entirely while a paper is
> running. The header itself lost its sparkline — "Term 6 progress", a percentage, and
> `N blocks practised`. **The bag is tools only and floats:** the focus timer and the examiner's
> calculator (both keypads, switchable, persisted), in a rounded card above the corner with no
> scrim, left where you put it. The resume bar rises and fades instead of blinking, via
> `allow-discrete` + `@starting-style`. Same evidence file as below, second half. **Screenshots
> exist for these surfaces** — the pane began compositing mid-session and the coin was reviewed in
> all four theme/side combinations, which immediately caught a dark-mode defect no DOM check would
> have (`--deep` is near-black in both themes, so the filled side vanished on a dark page). Saved
> artefacts are still owed. **Measurement foundation (2026-08-13; branch):**
> `codex/measurement-foundation` adds an ephemeral response clock, saves only a coarse duration
> band plus `rapidGuess` / `strongEligible`, and makes an explicitly rapid answer keep its result
> without supplying Strong evidence. Slowness is never penalised, historical attempts remain
> eligible, and a restored complete response has unknown timing. `VERIFIED(REAL_BROWSER +
> AUTOMATED)` at `evidence/2026-08-13/t6-measurement-foundation/verification.md`; not merged or
> deployed, and its provisional 10%-of-expected threshold remains a real-data calibration target.
>
> **One switch between two products (2026-08-13):** the header carries a Learn / Exam
> segmented control, and moving between the two sides runs through `document.startViewTransition` —
> the old page leaves the way you came from, the new one arrives from the side you pressed, and the
> header is held still by its own `view-transition-name` because furniture on both sides should not
> travel. Direction, duration, and the reduced-motion form (the browser's cross-fade, shortened, with
> the travel dropped) are in `app/t6.css` beside the switch; the script only decides *when* a move is
> a crossing. **Which side you are on is derived from the screen, never stored:** `showScreen` sets
> `data-mode` and both `aria-pressed` values from a table of the examiner's screen ids, so routes
> written long before the switch cannot disagree with it. It is a `role="group"` of two pressed
> buttons rather than a tablist, since the examiner side is two screens deep and the tab contract
> would be a lie. The examiner's home now leads with **one recommended paper** — a paper you have
> never met before a second set of one you have, in seat order, then your weakest paper, with IBM
> last because its self-marked percentage is not the same kind of number and would otherwise win
> "weakest" forever. Post-mock repair arrives in **sittings of four concepts**, stamped so the next
> sitting moves on, and the **bag** holds a timestamp-driven 25/5 focus timer and eight pieces of
> guidance. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-13/t6-dual-facing-and-sittings/verification.md`: thumb centred within 0.4px of
> both labels at 375 and 1280, 9.9:1 on the saffron half, 0 overflow from 320 to 1600, 0 sub-44px
> targets of ours, 39/39 tests, palette gate clean. Two defects were found by that verification and
> fixed — a skipped transition rejected `ready` unhandled, and a fast double-press landed on the
> wrong side. **Still no screenshots, and the cause is now measured rather than assumed:** an
> undisplayed Browser pane composites no frames, so `document.timeline.currentTime` is pinned at 0
> and every CSS transition reads as its start value — which twice looked exactly like a CSS bug.
> Drive `getAnimations()` to the end and measure layout in fixed-width same-origin iframes. Pixel
> acceptance remains owed.
>
> **The examiner is a product, and its dashboard is the point (2026-08-12):** the examiner
> now has its own front door at `app/t6.html#exam-home-screen` — four papers, three seeded sets each,
> openable with no learning state at all. A set's seed is subject + set index, never the clock, so a
> paper survives a refresh and set 2 is genuinely a different draw from set 1. The shortfalls and
> IBM's caveat are stated **on the card, before the clock**, not after. The results screen is now a
> diagnostic: pacing against the paper's own per-question budget, *where knowledge breaks down* per
> concept, the cost of speculative ticking, second thoughts and what they were worth, and — for
> written work — course-vocabulary use against rubric points. Each breakdown row routes into a taught
> single-concept run (`LESSON → primer → questions`, so LAW-47 holds). Attempt summaries persist and
> a re-sit of the *same* set is compared, since two draws differ in difficulty as well as in study.
> `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-12/t6-examiner-product-and-insights/verification.md`: `conceptAttempts` and
> `totalAnswers` both still **0** after three submitted mocks, legend and palette agree in every
> section, 0 overflow / 0 sub-44px tap targets / 0 off-scale radii at 375×812, 39/39 tests, palette
> gate clean. **Two defects the examiner exposed, both bank-content and neither fixed here:**
> `REDLINE` **LAW-53** — all eight SPMS MSQs are 3-correct-of-4, so ticking every option scores full
> marks (verified `16/16` with nothing answered in Section A) while the paper's stated rule says the
> opposite; the dashboard now reports this as a defect instead of endorsing it. And **16 of 50** SCLM
> Section A questions share a character-identical caselet *and* stem, with the pool at 52 for a
> section needing 50, so only clustering could be fixed (longest identical run is now 1). `WATCH`
> **LAW-54** covers the legend that counted the whole paper above a one-section grid. Telemetry:
> `tester-event.schema.json` is `1.1` with six examiner event types, banded-only fields, and a
> **separate consent scope**, enforced in both directions; the app shapes and locally buffers events
> behind a flag defaulting **off** and **there is no transmission path**. `profile.examAttempts`
> syncs to D1 with the rest of the profile, which `docs/community/PRIVACY.md` now discloses. No
> screenshots — the Browser pane was not compositing — so pixel acceptance is still owed.
>
> **Two products, one bank (2026-08-12):** Dungeon is now **the learning system**
> (learn by failing: teach before test, weak-first, feedback on every answer) and **the examiner**
> (`app/t6.html#exam-screen`), a mocks platform that deliberately does none of that. The examiner
> builds a paper strictly from `docs/briefs/T6_EXAM_PATTERN.md` — sections, counts, per-question
> marks, 120 minutes, negative marking, calculator — and spreads questions randomly rather than
> pedagogically, with a seeded shuffle so a reload does not reshuffle the paper. It ships the exam
> furniture a candidate expects: section tabs, countdown with a per-question timer, a five-state
> question palette (answered / not answered / not visited / marked / answered-and-marked, each with
> its own **shape** as well as colour), mark-for-review, clear response, and submit with auto-submit
> at zero. Scoring is the paper's own: SPMS Section B is +1 per right option, −1 per wrong, floored
> at zero **and capped at the question's marks**; match is all-or-nothing because the paper states no
> partial credit; written answers are excluded from the machine total and returned for self-review.
> **Where the bank cannot fill a section the brief says so before the clock starts** and scores out
> of what is actually there — SPMS Section B has 8 of 20 MSQs, SCLM Section B 4 of 6 numericals — and
> IBM carries a caveat that its paper is ten written answers on an unseen caselet, so a mock cannot
> reproduce it. **The two products are linked in one direction only:** concepts missed under exam
> conditions are stored in `profile.examMisses` and become a curated revision route
> ("Fix what the mock exposed"), taught before being tested again. Mock answers deliberately never
> touch `conceptAttempts` — a timed, unassisted, uncoached paper is not the condition the evidence
> model is calibrated on, so misses **prioritise and never score**. `VERIFIED(REAL_BROWSER)`:
> `conceptAttempts` and `totalAnswers` both stay 0 after a submitted mock.
>
> **Design system, dark mode, and the mobile pass (2026-08-12):** every colour in `app/t6.css` is a
> token and every token a `light-dark()` pair — 85 hex values, 46 `white` keywords, and 32 rgba
> literals are now **zero** below `:root`. The theme switch is one `color-scheme` change, so native
> controls follow. `--ink` was split from `--deep` (it was both text and the hero's fill). The
> palette is measured by `tools/check-palette.mjs`, which found that the *existing* state hues
> cannot carry state without colour — green/amber/red sit within 1.2:1 in grayscale and 0.05 OKLab
> apart under deuteranopia — so the four evidence states are now four silhouettes with hues
> unchanged. All seven `title`-based hover explanations were unreachable by keyboard and touch and
> are now one real tooltip (**LAW-51**). A documented four-step corner scale had drifted back to
> nineteen literal radii (**LAW-52**). On mobile the submit button sat 370px below the fold and is
> now sticky, with the global header hidden mid-question. Evidence:
> `evidence/2026-08-12/t6-dark-mode-and-mobile/verification.md`. Learners can now move device
> themselves: `releaseOtherDevice` ends the other session and claims this one, progress intact,
> still one active browser, and a country lock is not bypassable by it.
>
> **Teaching layer — the 0→80 path (2026-08-12) — collapsed to its outcome.** The app could measure a
> learner but could not teach one. `app/sets/t6_lessons.js` added 106 authored lecture-grain lessons
> (BRGSA 50 of 50 lectures; IBM, SCLM and SPMS each 16 of 16 *cited* lectures) and teach-before-test
> became a scheduling invariant in `layeredQueue()` — **LAW-47**, verified over 595 queue items with
> zero violations, 724 of 724 scheduled questions fully taught. `relevantWrong()` restored reasoning
> to applied questions (**LAW-48**) and a transcript-backed vocabulary gate caught three real
> authoring errors (**LAW-49**). The lesson worth keeping: first contact with every idea had been a
> scored item in vocabulary nothing had introduced, and one shipped answer used a phrase appearing **0
> times** in 50 BRGSA transcripts. Lectures no question cites remain unauthored by design. Full
> narration: `docs/governance/CHANGELOG.md`; evidence:
> `evidence/2026-08-12/t6-teaching-layer/verification.md` and
> `evidence/2026-08-12/t6-teaching-layer-complete/verification.md`. Lesson prose stays
> `WAITING_OWNER_CONTENT_ACCEPTANCE`. **Deployed (2026-08-12):** `reorg/structure` merged to `main`
> as `a8f90bc` carrying the complete teaching layer to the live cohort; PR #1 (`3c69d1e`) had shipped
> only the restructure and the first 80 lessons. These are tester-visible and **owe a change
> announcement** — draft at `outputs/ANNOUNCEMENT-2026-08-12-lessons.md` (untracked). Confirm the
> deployed version in Workers → Deployments; a push to `main` starts a build, it does not prove one
> finished.
>
> **Workspace restructure (2026-08-12) — collapsed to its outcome.** The directory layout this file
> documents is the result: `app/` ships, `tools/` builds, `legacy/` references, `cloudflare/` deploys
> and must not move. Two latent hazards fixed in passing are still worth knowing: `core.autocrlf=true`
> was rewriting LF files to CRLF, and path-anchored ignore rules stop matching once their directory
> moves. Full narration: `docs/governance/CHANGELOG.md`; evidence:
> `evidence/2026-08-12/workspace-restructure/verification.md`.
>
> **Diagnosis revision (2026-08-12):** Every distractor a scheduled question can present now
> states the specific gap choosing it reveals. `VERIFIED(REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-12/t6-option-diagnoses/verification.md`: 2,943 diagnoses across the active bank
> with zero generic fallbacks, derived from generator provenance for 92.3% of slots and hand-authored
> in `app/sets/t6_diagnoses.js` for the remaining 78 texts. The wrong-answer panel was rebuilt as
> verdict → what this choice assumed → catch it earlier → what governs this question → the complete
> answer (no longer collapsed) → why it connects. `tools/validate_t6_bank.js` now fails the build when
> a scheduled distractor lacks a diagnosis, so questions drafted later inherit the contract in
> `docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md`. Two defects were repaired: a raw
> `selected-belief:` tag reaching learner copy in the concept inspector (LAW-43) and a per-option
> value indexed by part rather than by option (LAW-44). The authored diagnoses are new content and
> stay `WAITING_OWNER_CONTENT_ACCEPTANCE`. `GET /dungeon/admin/access-check` was added as an
> unauthenticated, secret-free Access self-check for the reported Control Room login loop; it
> diagnoses the loop but does not fix it, since the cause is in Access application configuration.
> **Deployed (2026-08-12):** commit `0cc2c6d` is live as Worker version `c602c4b3` at 100% traffic
> with a 0% error rate, carrying the diagnosis revision and the UI alignment pass below. The earlier
> claim that production served `475837f` was stale: `809fced` deployed as `4e9a3287` roughly an hour
> before this release, so the dynamic homepage, practice builder, matching board, and the enforced
> agreement version have all been live since then and the `WAITING_OWNER_DEPLOY` gate is closed.
> Verify deployment state in Workers → Deployments rather than from this file.
>
> **UI alignment pass (2026-08-12) and the Access login loop (2026-08-12) — collapsed.** The layout
> pass established that irregularity is *measured* with an injected probe per screen and per
> viewport rather than eyeballed, which is the practice `tools/browser-checks/ui-audit.js` now
> carries; it left the boss, case-cloze, constructed-response and results screens unaudited, and
> **that gap is still how LAW-64 keeps recurring** — a sweep is only as wide as the screens it
> visits. The Access bounce was an identity-provider configuration on the `Dungeon Owner Dashboard`
> application, not Worker code; owner action outstanding is confirming sign-in on the live domain.
> Full narration: `docs/governance/CHANGELOG.md`; evidence:
> `evidence/2026-08-12/t6-ui-alignment-pass/verification.md`.
>
> **Open, not yet acted on:** a bank-volume audit found only 32.5% of taught lectures carry any
> question (IBM 20.5%, SCLM 22.5%, SPMS 19%, BRGSA 88%) — 191 of 283 lectures have none. Match
> choices also span 13–179 characters, which layout cannot reconcile; both belong to the bank work.
>
> **Current status (2026-08-11; supersedes older status notes):** The active plain-language Term 6
> dashboard for BRGSA, IBM, SCLM, and SPMS is `VERIFIED` in a real Browser at
> `evidence/2026-08-11/t6-evidence-challenges/verification.md`, with the latest question hierarchy,
> neutral unanswered-state, and scoped subject-action refinement verified at
> `evidence/2026-08-11/t6-unified-prompt-hierarchy/verification.md`. Applied questions use one
> aligned warm-white surface: hierarchy, spacing, and restrained dividers connect the case, task,
> and response steps; only controls and feedback introduce nested boundaries. It carries an
> evidence-over-time graph with one module visible at a time, confidence-aware and inspectable
> four-state progress, weak-first varied re-attempts, and a
> 792-surface source-traceable bank: 728 scored challenges plus 64 support-only primers. Active
> scheduling has 565 scored items after excluding 163 older MCQs
> whose answer length could cue correctness; every concept retains at least eleven active surfaces,
> five formats, seven independent families, and module boss coverage. Case, cloze, match, MCQ,
> short-answer, and three-step boss paths are responsive and keyboard-operable, with local
> save/resume/reset. Time-horizon plans distinguish
> same-day current evidence from delayed retrieval. The report-backed confidence, boss-step,
> constructed-response, priority, and practice-path revision is verified at
> `evidence/2026-08-11/t6-research-integration/verification.md`; the privacy-scoped release boundary
> remains verified at `evidence/2026-08-11/tester-launch/verification.md`.
> The adaptive-primer revision is `VERIFIED(LIVE_EDGE + REAL_BROWSER + AUTOMATED + REMOTE_D1)` at
> `evidence/2026-08-11/t6-adaptive-primer-community/verification.md`: a one-click run introduces
> only the next new concept, the support fades after easy or harder success, misses restore applied
> and misconception layers, and primers never create mastery evidence. A dynamic homepage,
> mix-and-match practice builder, enforced agreement version, and matching board are
> `VERIFIED(REAL_BROWSER + AUTOMATED)` at `evidence/2026-08-11/t6-dynamic-homepage/verification.md`
> and `WAITING_OWNER_DEPLOY`. Subjects sit at the top as a fast switcher; the hero pairs the
> subject-local next action with a live evidence trendline and a computed momentum sentence; the
> header shows a Term 6 sparkline instead of a `0 of 64` counter; an inline builder configures
> shape/focus/length/feedback with every unusable option disabled and explained; a factual
> distance-travelled strip, the mastery matrix, Term 6 totals, and the staged panels form one
> continuous scroll. Long-form matching uses a resizable board: statements side by side, one slot
> each, and a docked tray of label tablets placed by click, drag, or keyboard. (This paragraph used to
> claim production still served commit `475837f`; that was stale and is corrected in the
> **Deployed (2026-08-12)** note above — `0cc2c6d` is live as Worker version `c602c4b3`, so this
> revision has shipped.) Every tester-visible change ships with a change announcement; the format is in
> `docs/community/COMMUNITY_PLAYBOOK.md`.
> Student-facing game/proprietary vocabulary and diagnostic question metadata are removed from the
> learning view. Sixty-four constructed-response surfaces use transparent self-review without
> automatic correctness or Strong credit. Exact final-paper structure is **known as of 2026-08-12**
> and recorded in `docs/briefs/T6_EXAM_PATTERN.md`, which closed
> `EXAM_PATTERN_UNCERTAIN_FIRST_COHORT`; structure may be stated as fact, but question content,
> difficulty, topic weighting, a likely score, and pass probability remain unclaimable. Owner/faculty
> content acceptance remains open, so the route is not `DONE` or an exam-score prediction. The privacy-scoped release wrapper, worker health route,
> security/no-index/private-cache headers, release tests, owner control room, and community
> operating documents are verified at
> `evidence/2026-08-11/tester-access-admin/verification.md`; the owner-JWT-verified Cloudflare group
> controller at `evidence/2026-08-11/tester-dashboard-access-management/verification.md`. Exact
> `https://aneeketdas.com/dungeon/` routing, direct Worker static assets, the more-specific owner
> admin application, anonymous learner/bank/admin denial, the least-privilege group secret, and
> rapid-request rate limiting are `VERIFIED(CLOUDFLARE_API + ANONYMOUS_EDGE)` at
> `evidence/2026-08-11/cloudflare-protected-domain/verification.md`. The private Sites version 5
> remains an owner-only backup and is no longer an origin dependency. The owner Control Room is
> `VERIFIED(BROWSER)` on the exact domain: health is Healthy, Access is Connected, and the release
> is Allowlisted. The Control Room allowlist is the
> only admission check: an approved email enters immediately with an opaque server-side session, an
> unapproved email receives one fixed private `Ask Aneeket to add you in.` denial that never
> discloses the allowlist, and a first approved login is held at a one-time agreement step that
> records version, acceptance time, and minimal WhatsApp invite-open/join-acknowledgement/reminder
> timestamps. Progress is stored per email in Cloudflare D1 with the
> browser copy kept as an offline fallback. One active browser per email is enforced, and a country
> change locks the account for owner review. Onboarding also requires joining the private WhatsApp
> tester group; the invite is disclosed only after approved-email admission, the join tick stays
> disabled until the invite opens, and membership then remains an explicit self-attestation because
> WhatsApp exposes no membership proof to the page. Admission, denial, the agreement gate, and the
> 390-pixel agreement layout are
> `VERIFIED(LIVE_EDGE + REAL_BROWSER + AUTOMATED)` at
> `evidence/2026-08-11/learner-backend-and-agreement/verification.md`. The Control Room adds cohort
> paste-onboarding, a `Clear lock` recovery that forgives a country lock without deleting progress,
> per-tester and bulk **force sign-out** that ends browser sessions so a tester must sign in again
> while keeping approval and every byte of progress — unlike `Revoke`, which cascades and deletes
> their saved work — with live session counts shown on each row so the control has something visible
> to act on,
> per-tester state chips, two panels computed from real saved progress (Participation and Where
> testers struggle), and per-person or bulk `Bump` actions for missing group acknowledgements; a bump
> records an in-app reminder and copies a firm manual message, but never claims to send it or
> removes access automatically. D1 migration `0004_community_acknowledgement.sql` is applied, and the
> full live onboarding path has been exercised end to end with a temporary address.
> `aneeketBTN/Dungeon` (private) is connected to Workers Builds, so a push to `main` builds and
> deploys. The first external cohort is active with eight approved tester addresses at the latest
> Control Room read; that read also showed six testers holding the superseded agreement version,
> which the enforcement fix above addresses. GitHub and the private
> WhatsApp tester group are active. The Learning Signal Auditor, Question Bank Steward, and Tester
> Cohort Steward are `PREPARED_NOT_ACTIVATED`: schedules registered and verified `PAUSED`,
> repository declarations disabled, activation preflight intentionally failing, no run history, and
> no tester data touched. Evidence:
> `evidence/2026-08-11/tester-agent-readiness/verification.md`. The earlier
> cinematic/Ari/economy product slice remains at `legacy/rogue/rogue.html` as an `IMPLEMENTED` legacy
> reference and still lacks complete real-Browser route acceptance.
>
> Static HTML/CSS/JavaScript prototypes in `app/`; procedural learning engine and state in root
> JSON/Markdown structures; a shared learner backend in Cloudflare D1; current phase: observe the
> active cohort without over-reading small samples,
> continue owner/faculty content acceptance, and calibrate the learning model from genuine use.

## Start Here — Required Order

1. Read this file top-to-bottom.
2. Read `docs/governance/DESIGN_SOURCE_INDEX.md` before product, art, UX, learning, or gameplay decisions.
3. Skim `docs/governance/BUG-LAWS.md` before implementing or changing anything.
4. Read `docs/governance/CONTENT-RULES.md` before authoring or changing any question, case, or option.
5. If the task affects UI, art, motion, accessibility, learning integrity, persistence, or
   performance, skim `docs/governance/QUALITY-LOG.md`.
6. Check Known Gaps and active `WAITING_*` gates before beginning dependent work.

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
| `docs/governance/BUG-LAWS.md` | Living REDLINE/WATCH bug-prevention rules and exact comply/verify paths. | 2026-08-11 |
| `docs/governance/QUALITY-LOG.md` | Experience-quality practices, issue/cause/fix history, and watch items. | 2026-08-11 |
| `docs/governance/CHANGELOG.md` | Newest-first, append-only history of sessions that changed the workspace. | 2026-08-11 |
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
| `cloudflare/src/index.mjs` | Exact-path router, admission/sessions, agreement/community state, D1 progress, signed owner Access, tester management, the per-tester and cohort written-check ceilings, the written-answer archive with its per-row expiry, and the daily `scheduled` purge that keeps retention running after the cohort goes quiet. | 2026-08-14 |
| `cloudflare/migrations/` | Applied D1 history for auth/progress, browser/country locks, agreement acceptance, community timestamps, per-tester and cohort written-check metering, and `0007_written_answer_archive.sql` — the only table holding a learner's own prose, with the expiry and cascade that make the three-month promise and withdrawal real. | 2026-08-14 |
| `db/schema.ts` | Readable mirror of tester, session, progress, agreement, and community-state table shapes. | 2026-08-11 |
| `app/login.html` | Approved-email entry and the one-time agreement/group step with private invite placeholder and two acknowledgements. | 2026-08-11 |
| `app/login.css` | Login and agreement presentation, the `[hidden]` guard required by LAW-36, and the narrow-viewport layout. | 2026-08-11 |
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
| `tests/cloudflare-access.test.mjs` | Owner auth, tester management, agreement/community state, bump, routing, health, cache checks, the cohort spend ceiling, and one test per promise the privacy notice makes about stored answers: the stated expiry, distress never stored, deletion on request, deletion on withdrawal, and a mark that survives a storage failure. | 2026-08-14 |
| `tests/agent-readiness.test.mjs` | Proves the tester-agent scaffold is healthy, privacy-bounded, and not deployable. | 2026-08-11 |
| `app/admin.html` | Owner control room for tester management, per-person/bulk group bumps, release health, and feedback triage. | 2026-08-11 |
| `app/admin.css` | Responsive control-room status/actions, including narrow stacked tester rows. | 2026-08-11 |
| `app/admin.js` | Cohort onboarding, revoke/unlock, per-tester and bulk **force sign-out** with live session counts, per-tester **Delete answers** for a deletion request that is not a withdrawal, community bumps, agreed/older-terms/never-agreed chips, learning signals, and manual copy helpers. | 2026-08-14 |
| `app/theme.js` | Theme bootstrap loaded synchronously in `<head>`: reads the stored appearance before first paint, exposes `T6Theme` (get/set/next/resolved/onChange), and follows the system setting when unset. Separate from t6.js because the release serves `script-src self`, so the usual inline head script is blocked. | 2026-08-12 |
| `tools/check_exam_readiness.mjs` | **Exam-pattern gate and authoring worklist.** `npm run check:exam [SUBJECT]`. Reads `EXAM_PAPERS` out of `app/t6.js` (one source of truth, not a copy) and multiplies it by the bank: which sections cannot be filled and what that costs in marks, whether a negatively marked section is free to a candidate who ticks everything (LAW-53), and how many questions are *forced* to share one visible prompt. Prints "N × type for SUBJECT Section X", soonest paper first. Run it before authoring and after. | 2026-08-12 |
| `tools/check-palette.mjs` | Palette gate. Parses the `light-dark()` pairs out of `app/t6.css` itself and measures 140 contrast pairings, grayscale separation, and three colour-vision simulations in both themes, then asserts the four evidence states are shape-distinct. Run after touching any colour token. | 2026-08-12 |
| `tools/browser-checks/ui-audit.js` | UI audit probe, evaluated **in the page**: overflow, tap targets under 44px, corner radii off the four-step scale, paragraph density, type scale, and ragged rows. Used for the mobile pass; re-run per screen and per viewport. | 2026-08-12 |
| `app/t6.html` | Four-question homepage (what am I doing / where can I start / how am I doing / additional resources), subject rail, hero with the one next action and distance to goal, single-entry practice builder, matrix/trend/totals, one concept list, lesson surface, layered questions, in-question glossary, plans, results, the header Learn/Exam switch, the bag drawer, and the examiner home's recommended-paper hero. | 2026-08-13 |
| `app/t6.css` | Homepage block rhythm and the four-question layout, chip builder, concept-shelf rows with inline evidence, matching board, lesson/glossary presentation, flat primer/question hierarchy across desktop and narrow layouts, the case/task split (named case, named ask, one rule between material and instruction, 62ch measure), and the two-product switch: thumb geometry, the `::view-transition` direction rules and their reduced-motion form, and the ≤760 header compaction that keeps the switch from overflowing a phone. In the exam palette legend a chip is a swatch and no longer inherits the 44px tap floor, which was overflowing its own 26px grid track onto the label beside it at every desktop width (LAW-64). | 2026-08-15 |
| `app/t6.js` | Teach-before-test queue invariant, **concept layering** (selection stays variety-driven; delivery is sorted by teaching rank and `layeredQueue` drains a pre-committed lesson list so lesson order is monotonic by construction), **weakness linking** (`conceptLinks` derives edges from co-tested surfaces only; `groupWeaknesses` pairs a weak concept with a weak partner and reports the rest as isolated), lessons/primers, eight-gate mastery with ephemeral response timing and banded Strong eligibility, persistence, deterministic scenarios, the floating bag, product crossing, and the examiner's seeded papers, analysis, repair sittings, and locally-buffered non-transmitting telemetry shaper. `lessonHandoff()` is separated from its markup and exposed through `window.__dungeonExport.handoffs()`, so the harness reads the app's own run-relative correction to a lesson's "the next lecture" promise instead of the raw `connects` string. | 2026-08-15 |
| `app/sets/t6_brgsa.js` | Original BRGSA ten-set bank with 60 grounded questions. | 2026-08-10 |
| `app/sets/t6_catalog.js` | Four-course catalogue, 64 dashboard concepts, three-perspective surfaces, and 156 IBM/SCLM/SPMS questions. | 2026-08-10 |
| `app/sets/t6_challenges.js` | Mixed-format augmentation, 64 adaptive primers, bosses/constructed responses, scored pools, relevance-first distractor selection, case-lecture provenance, the option-diagnosis pass (an authored MCQ diagnosis now survives it, as an MSQ one already did), and the authored SPMS multiple-select, SCLM numeric, and **48 course-assessment `_cla` items** (SCLM 32, BRGSA 16). The multi-select builder carries `caselet` (LAW-61). New families live here rather than in a new file on purpose — `t6_integrated.js` was added as one and was missing from four load lists at once. | 2026-08-15 |
| `app/sets/t6_diagnoses.js` | 78 authored option diagnoses for distractors with no machine-knowable provenance, plus the authoring rules. | 2026-08-12 |
| `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` | Handoff procedure for the teaching layer: sources, lesson contract, batch procedure, gates, the four traps already paid for, and per-subject definition of done. Read before authoring any lesson. | 2026-08-12 |
| `app/sets/t6_lessons.js` | Teaching layer: 106 authored lecture-grain lessons (objective, explainer, worked example, glossary, handoff) that must be delivered before anything about that lecture is scored. All four subjects complete on cited lectures; 724 of 724 scheduled questions taught. | 2026-08-12 |
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

1. Rewrite the Current Status paragraph.
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

- [ ] **`WAITING_OWNER_CONTENT_ACCEPTANCE` — 48 course-assessment items authored 2026-08-15.**
  SCLM 32 (two per concept: definition, scenario, numeric, judgement) and BRGSA 16 (one per
  concept, scenario-led), with 144 authored option diagnoses. Drawn from the owner's own CLAs for
  style, coverage and difficulty; none is one of their questions, every item sits on a lecture that
  already has a lesson, and every claim is one its lesson states. Nobody has read the prose.
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
- [ ] **Fifteen of the twenty SPMS multiple-select stems ask what "the lecture" said, not what is
  true.** "as the lecture presents them", "every failure the lecture names", "on the lecture's
  definition", "how the lecture uses MoSCoW". No caselet fixes these — they name no example, so they
  are outside LAW-61 — but a stem that asks a candidate to recall a session trains recognition of
  that session rather than the idea, and the exam does not ask it that way. The rewrite is per item:
  ask which statements are correct. One item already has the right shape and is the model
  (`spms_requirements_msq`, which states its own case in the stem). Related and smaller:
  `spms_roadmap_msq` carries "WhatsApp launched first on iPhone, with the Android version arriving
  around 2011" as a **correct option** — a date recall sitting among framework claims.
- [~] **`WAITING_OWNER_CONTENT_ACCEPTANCE` — four SPMS multiple-select caselets and their revised
  stems were authored on 2026-08-14; the owner has not read the prose.** They close LAW-61: the
  drilling-machine, Zerodha, ride-hailing MoSCoW, and WhatsApp items named an example the learner
  never saw. Each case is drawn from its own lecture's clean transcript, but drawn from the
  transcript is not accepted. Tester-visible, so it also owes the change announcement drafted at
  `outputs/ANNOUNCEMENT-2026-08-14-example-questions.md`.
- [~] **`WAITING_OWNER_CONTENT_ACCEPTANCE` — BRGSA concept records and the case exemplar were
  authored on 2026-08-14; the owner has not yet read the prose.** BRGSA previously had an authored
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
- [ ] **The last two SCLM numericals are blocked on one lesson.** `SCLM-M03-L06` carries the method
  and the worked example — daily demand ~N(60, 7), lead time 6 days, K = ₹10, h = ₹0.5/unit/year,
  current Q = 1,200 and ROP = 360 — which yields the two missing items directly: the reorder point
  for a 95% cycle service level (`360 + 1.645 × 7 × √6 ≈ 388`) and the service level the current
  policy actually achieves (ROP equals mean lead-time demand, so z = 0 and it is 50%). **But
  `SCLM-M03-L06` has no lesson**, and a scored question citing an untaught lecture breaks LAW-47.
  Author that lesson first via `docs/authoring/LESSON-AUTHORING-PROTOCOL.md`, then the two items.
- [~] **SCLM numeric entry built; 4 of 6 items authored.** `VERIFIED(REAL_BROWSER)`: a typed figure
  is graded against a per-question tolerance, comma and ₹ formatting is parsed, and the verdict states
  the entry against the accepted band. A wrong figure matching a known wrong method names that method
  (`nearMisses`) instead of reporting a bare "wrong". Items cover exponential smoothing, EOQ quantity,
  EOQ total cost, and the newsvendor critical ratio. **Two more are needed** to match Section B's six,
  and the obvious candidates are safety stock and service level — the paper supplies standard normal
  tables, which points there — but *it is not yet confirmed that SCLM teaches the z-based formula*.
  Verify that against the transcripts before authoring, rather than assuming the standard form.
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
- [ ] `WAITING_OWNER_CONTENT_ACCEPTANCE`: all 792 surfaces are source-traceable and structurally
  verified, but transcript-derived content, the 64 support-only primers, the 64 constructed-
  response rubrics/exemplars, and the 106 authored lessons still need owner/faculty acceptance
  before `DONE`. This is now the largest single block of unaccepted content in the product.
- [x] **The 0→80 path reaches every scheduled question — closed 2026-08-12.** 724 of 724 are
  taught, verified in a real browser at
  `evidence/2026-08-12/t6-teaching-layer-complete/verification.md`. What remains is *acceptance*,
  not coverage. Do not quote coverage numbers from this file; run
  `node tools/check_lesson_file.mjs "<transcripts>"`. Note that 177 uncited lectures across IBM,
  SCLM, and SPMS have no lesson and no question citing them — authoring those is optional work that
  moves no coverage, and lessons for them are never delivered.
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
- [ ] The vocabulary gate cannot match a singular glossary term against a plural-only occurrence:
  it builds `\b<term>\b`, so `public private partnership` was reported absent although
  `public private partnerships` appears three times. It reports this as *invented vocabulary*, which
  is a false accusation rather than a missed check. Use the course's own form; treat that warning as
  a prompt to grep before deleting a term.
- [ ] IBM's option lengths still cue the answer: sorting each question's options by length puts the
  correct one at rank 3 of 4 in **45%** of 68 sampled questions against a 25% baseline, so "pick the
  second-longest" is a working strategy. The validator reports this as a warning, not an error. Vary
  how many distractors run longer than the correct answer rather than lengthening a fixed number.
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
  **Still over budget and known to be so.** On 2026-08-15 the workspace-restructure, UI-alignment
  and Access-login paragraphs were collapsed to their durable outcomes plus links, as the previous
  note asked, and one new paragraph was added. **Net, the block is barely smaller** — collapsing
  three and adding one is not a strategy, it is a stall. The next session should cut the
  2026-08-12 block to a single paragraph before writing anything new, and should treat "one
  paragraph per session, forever" as the actual defect.
