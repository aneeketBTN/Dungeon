# Three students sat Dungeon

**Report 1 of 2.** Blind cram-test of Term 6 Learn + Mocks by three student personas, 2026-08-14, branch `codex/measurement-foundation`.

Findings carry stable IDs (`F-01`…). A second session's report merges against these; continue new findings from **F-46**.

---

## What was done

Three personas ran on three isolated origins (ports 8091/8092/8093, separate `localStorage`, no cross-contamination). Each sat the same protocol per subject: **the app's own recommended study set** — the hero "Start this study set", i.e. Set 1, the easiest — **then Mock Set 1 of the same subject.**

| Persona | Method |
|---|---|
| **Average Joe** | Normal effort. Reads the lessons, answers honestly, records when a "correct" answer was actually a guess. |
| **Brilliant but lazy** | Skips every lesson on principle. Attacks papers with test-craft only: eliminate absolutes, eliminate the unethical option, spot the only on-topic sentence, spot the answer printed elsewhere on the page. |
| **Dumb but diligent** | Reads every line, memorises glossaries and checks them against the prose, writes long answers, assumes every contradiction is his own fault. |

**Constraint, enforced throughout:** browser only. No repo files, no question banks, no answer keys, no `localStorage` inspection, no looking up course material. None of the three had seen the syllabus.

**Coverage: 4 subjects × 3 students × (1 study set + 1 mock) = 24 sittings.** All complete.

---

## The headline

| | SPMS Mock | BRGSA Mock | IBM Mock | SCLM Mock |
|---|---|---|---|---|
| **Joe** (reads everything) | **75/75 · 100%** in 4m24s | 40/40 answerable | 0 of 0 markable | **72/72 · 100%** |
| **Lazy** (read nothing) | 58/75 · 77% \* | 40/40 answerable | 0 of 0 markable | 53/72 · 74% \*\* |
| **Diligent** (read every line) | **75/75 · 100%** in 7m29s | 40/40 answerable | 0 of 0 markable | **72/72 · 100%** in 19m56s |

\* Lazy spent SPMS Section B Q11–20 on a select-all experiment. Craft scored 20/20 on Q1–10. Craft throughout = 75/75.
\*\* Lazy spent SCLM Section A Q26–50 pressing B blind. Craft scored 25/25 on Q1–25. Craft throughout = 72/72.

**Two students who had never read the syllabus scored 100% on two full papers. The third scored 100% on every question he chose to answer with technique instead of knowledge.**

### The thesis

**Dungeon's measurement is honest. The thing it measures is not.**

The diagnostic engine is genuinely sophisticated — better than most commercial revision software. It refuses to call a perfect score "Strong". It downgrades a confident mistake and demands two independent repairs. It measures whether written answers use the course's vocabulary. It states plainly that self-marking "cannot create Strong evidence without independent checking" rather than faking an AI grade.

That engine is being fed signal from items answerable by shape alone. So the app builds a confident, precisely-reasoned, **wrong** model of what a student knows — and then schedules their revision from it.

**Corollary: the app only teaches when you fail, and it is built so you almost never fail.** Correct-answer feedback restates the correct option verbatim. Wrong-answer feedback is the best content in the product. Across 24 sittings the total volume of real teaching received amounts to a handful of sentences, because the students kept getting things right for the wrong reasons.

---

## S1 — Blocking

### F-01 · The Bag widget covers the exam Submit button
*All three students, multiple subjects.*

The floating "Bag" launcher and the exam Submit button are both pinned bottom-right and overlap. Three independent measurements agree:

- Hit-testing at Submit's own centre returns the Bag's label (Joe, Diligent).
- It covers **37 of the button's 44 pixels including the entire centre**, at every viewport tried (Lazy).
- `position: fixed; bottom: 18px; right: 18px; z-index: 40` — collides at every window size **including mobile** (Diligent).

Pressing Submit opens the Bag. The Bag panel then leaves a layer over the **whole paper** that swallows every click — footer *and* question palette — while the exam clock runs. Only Escape escapes. Time lost: ~4 min (Diligent), ~5 min (Diligent, SCLM), 6m40s of failed clicks (Joe).

**F-01a · This is an accessibility failure, not just a misplaced button.** The only way to move the Bag off Submit is to **drag** it to a drop zone. There is no button for it: "Put the bag away" merely closes the panel and leaves the launcher on Submit, and "Bring the bag back" is hidden while the bag is out. **A keyboard-only user cannot clear it, and therefore cannot submit.**

**F-01b · It bites hardest on the one paper that needs it.** SCLM is the only paper granted a scientific calculator, and the calculator lives in the Bag — so on the paper with four numeric free-entry questions, the keypad is what receives every Submit click.

> **Methodology note.** Submit is *also* gated on a native `confirm("Submit the paper?")`, which our harness auto-dismisses or suppresses. Part of "Submit did nothing" in these runs was environmental, and we say so. The overlap itself is not — it was measured three ways. A native `confirm()` on a timed exam is separately a poor choice, and combined with the overlap it is severe.

### F-02 · BRGSA Section B renders 4 unanswerable questions, then bills them to the student
*All three students.*

All four Section B questions (**20 of 80 marks**) draw the caselet and the instruction "Fill both parts of the recommendation so the action and framework agree", then an empty `div.exam-options`. No radio, no dropdown, no textarea. Unanswerable by any means.

The results screen then converts the app's own rendering failure into a diagnosis of the student:

> ATTEMPTED 22 of 26 — 4 never answered
> **What this paper exposed:** Pre-sales commitment (1 left blank) · Cohorts and retention (1 left blank) · Prioritisation (1 left blank) · Activation and onboarding friction (1 left blank)
> *Each one is taught before it is tested again.*

**This is the worst defect in the product.** It is not merely broken output — the app has decided the student is weak in four topics because its own questions did not draw, and has committed their revision time to that fiction. Diligent, who trusts the app: *"That is the worst thing I have seen."*

**F-02a · The same product already handles this correctly.** SCLM has the same shortfall — only 4 of 6 Section B questions banked — and **discloses it twice before the clock starts** ("scored out of what is actually here, not out of 80"), labels the section tab "4 × 4", and marks out of 72. Same codebase, opposite behaviour. BRGSA's silent blanking is a fixable choice, not a constraint.

### F-03 · A completed study set silently deletes its own teaching
*Diligent, SCLM.*

Re-opening a set already marked complete gives **"0 of 8 steps" and goes straight into a question** — no lessons, no primers. An untouched set gives "0 of 12 steps" and opens with a lesson. **The four missing steps are the teaching.**

The app's own **"Start from the beginning — Study set 1, in the order the subject is taught"** also returns 8 steps and no lessons. Nothing on screen says the teaching was removed, and no door restores it.

For the exact user this product is for — a student revisiting a topic before an exam — **the lessons are gone and the app does not admit it.** Diligent had to read both Module 1 lectures from the read-only Teaching layer instead; all his SCLM lesson findings come from there rather than from the set he was served.

### F-04 · The IBM paper cannot be scored at all
*All three students.*

**"0 of 0 machine-marked marks"** after 100 marks of writing. The paper is 100% written and the written review is unavailable, so **100 of 100 marks go unassessed** — see F-44 for why that is narrower than it looks.

---

## S2 — What the mocks failed to test

The papers do not measure subject knowledge. Ranked by how many marks they give away.

### F-05 · The fake stem: one question, printed twelve to sixteen times
*All three students, SPMS + SCLM.*

Identical stem, verbatim: *"A student understands the definition but needs to explain why the idea changes the next decision. / Which explanation best connects this idea to the wider subject?"*

- **SPMS: Q1 + Q25–Q35 = 12 of 35 marks.**
- **SCLM: Q1 + Q36–Q50 = 16 of 50 marks** — fifteen consecutive.

**The stem names no concept.** It is literally unanswerable as written. It does not matter, because three of four options are always drawn from the same pool of three boilerplate anti-answers:

- "It works independently of the people, the constraints, and the decisions around it"
- "It improves one local measure, so effects elsewhere stop mattering"
- "Once this choice has been made, later evidence should not be allowed to reopen it"

The correct answer is always the only sentence naming anything from the syllabus. In SCLM: *"pick the only sentence that mentions supply chain."* Joe answered all twelve SPMS instances in about 30 seconds without reading a stem.

### F-06 · Craft beats content — the controlled experiment
*Lazy, SCLM.* The single most useful number in the exercise.

Section A, 50 marks, no negative marking:

| Method | Score |
|---|---|
| Q1–Q25, test-craft | **25/25 — 100%** |
| Q26–Q50, pressing B blind | **6/25 — 24% (chance)** |

The six blind hits were exactly the six where he had pre-noted "craft says B too." **All fifty craft calls were correct**, including the nineteen he deliberately threw away. Craft on all fifty = **72/72, having learned nothing.**

The mechanism is consistent across all four subjects: three distractors carrying absolutes (*only / all / every / always / never / entirely / automatically / simply / itself proof of*) or a plainly unethical action (*Hide, Delete, Ignore, Double-count*), against one balanced, hedged, on-topic sentence.

### F-07 · The BRGSA Section A key is option B twenty times out of twenty
*All three students.* Never shuffled. Lazy noticed at Q6, Diligent at Q8; both ticked B down the column for 40 marks. Joe's independent craft reading also produced B on all twenty — position and content agree perfectly, so even a student not looking for the pattern is carried by it.

**Fixed in SCLM** (F-31).

### F-08 · Learn questions are reprinted verbatim in the mocks
*All three students.*

- SPMS Section A Q4, Q5 and Section B Q19 are word-for-word Learn Set 1 items — same stem, same options, same order. Joe met B Q19 twenty minutes after answering it.
- SCLM: three Section A items are verbatim Learn Set 1 duplicates, option order unchanged.
- BRGSA Section C Q2 (**10 marks**) is the identical prompt Learn had already set as homework.
- IBM Mock Q1 (**10 marks**) is word-for-word the written question Learn had just asked.

**The key is not reshuffled between Learn and Exam.**

### F-09 · Structural keys that never vary across subjects
*Lazy, corroborated by Joe and Diligent.*

- **Matching items:** the permutation is slot1=B, slot2=C, slot3=D, slot4=A in **all four subjects**. Statement order is always principle-A / decision-A / decision-B / principle-B. Matching is also solvable on grammar alone — principle vs decision splits on whether the sentence opens with an imperative verb (*Treat* / *Design* = decision).
- **Three-step chain items:** step 3's correct option is the one ending **"…neither result replaces the other"** in all four subjects. In SCLM it is worse — all three wrong options confess in their own final clause.
- Exam Section C *does* rotate its key. **The exam shuffles what the Learn side never does.**

### F-10 · The papers leak their own answers
*Joe, Diligent, Lazy.*

- SPMS Section A Q8 and Q9 hand you Section B Q1 (crossing the chasm).
- SPMS Section B Q14's caselet states the WhatsApp iPhone/Android fact that is a correct option in B Q17, three questions later.
- SPMS Section B Q10's stem narrates its answer in order: the Zerodha passage walks worldwide → India retail → cost-conscious, and options 1/2/3 restate it in that same order.
- **SCLM Section B Q2 prints Q4's answer** — it states the 600-unit order quantity that Q4 asks you to derive for 4 marks — and refers to "the same distributor" before any distributor has been introduced. Fallout from the two missing bank questions.
- SCLM Section A Q3's correct option is a worked example of Section B Q1's formula.

### F-11 · Much of Section A is not course content at all
Several SPMS items are pure common sense with no syllabus in them: hide the roadmap change from stakeholders? keep using data outside consent? collect everything and decide the purpose later? Nobody fails these. BRGSA's distractors are jokes — *"Double-count repeat visitors to finish sooner"*, *"Delete Variant A from the final written report"*, *"Remove the denominators from every chart"*, *"Rename the marketing team as the growth team."*

### F-12 · The only genuinely hard items were arithmetic or raw recall
Not subject reasoning: ₹1,000 CAC ÷ ₹100/month = ten-month payback; ₹3,00,000 ÷ 120 = ₹2,500 CAC; and GDPR's "enacted May 2018 … a model for Switzerland, Canada, Australia", which nothing in Learn goes near.

### F-13 · Duplicate coverage inside one paper
IBM Q6 and Q7 are both group-based microfinance, back to back — **20 of 100 marks on one untaught concept**, and having written Q6 you can write Q7 from it.

### F-14 · Ten-mark questions asking for two to three sentences
Seven of IBM's ten and both of BRGSA's Section C use the Learn homework prompt verbatim — *"In two to three sentences, how would you explain X in your own words, and what kind of decision should it change?"* — at ten marks each. IBM's other four ask for five to eight sentences for the same ten marks.

### F-15 · IBM promises a caselet that does not exist
The paper's instructions say *"Ten written answers, every one of them on the caselet released two days before the exam."* **There is no caselet.** The ten questions are ten unrelated scenarios.

---

## S3 — What Learn failed to teach

### F-16 · The transfer gap, measured
The recommended set teaches a small fraction of what its own mock examines.

| Subject | Concepts taught by Set 1 | Concepts tested by the mock | Marks on untaught material |
|---|---|---|---|
| **SCLM** | 2 of 16 | 16 | **~62–65 of 72** |
| **IBM** | 1 of 10 examined | 10 | **90 of 100** |
| **SPMS** | 2 of 16 | 14+ | majority |

SCLM's untaught-but-examined list: exponential smoothing, S&OP, EOQ, newsvendor/critical ratio, tailored sourcing, bullwhip, re-engineering, stockyard location, cold storage, transport turnaround, multimodal, ports/PPP, LEADS, Akshaya Patra. What Learn actually drilled is worth about **7 marks**.

**And the students still scored 100%.** That is the damning half: the gap never surfaces as a bad score, so nothing tells the student — or the app — that it exists.

### F-17 · The promised lecture that was skipped, then examined for ten marks
*Diligent, IBM.* The most damning chain in the exercise.

IBM served **Lesson 3, then Lesson 7** — skipping 4, 5 and 6. Lesson 3 closes: *"Several kinds of organisation claim this territory. The next lecture sorts them."* The very next screen breaks that promise.

The skipped lecture is **"Understanding social organisations"** — the one defining social business, social enterprise and CSR. Then:

- Learn Q1 carries a distractor, *"Treat it as ordinary CSR…"*, using a term from the skipped lecture.
- **The mock asks him to explain Social business for 10 marks.**

A traceable line from a broken promise to a lost mark.

### F-18 · The inverse: what Learn drilled hardest is never tested
*Diligent, IBM.* Bottom-of-the-pyramid design appeared in **five of his seven** scored Learn questions and is **not asked once** in the mock.

**SCLM does this right** and deserves the contrast: the two concepts its Set 1 teaches *are* tested, across seven mock questions.

### F-19 · Lessons arrive out of order, and each one lies about what comes next
*Joe, Diligent.*

- **BRGSA** ran **1 → 4 → 3**. Lesson 1 ends *"The next lecture is the cheapest one: the smoke test"* → next screen is pre-sales. Lesson 4 ends *"what are surveys for? The next lecture answers that"* → next screen is landing pages. Lesson 3 is badged **"BUILDS ON WHAT YOU JUST DID"** while *preceding* what you just did.
- **IBM** ran **3 → 7** (F-17).
- **SCLM is the best of the four** — every "the next lecture" sentence is true: fit→drivers, drivers→forecasting, S&OP→EOQ, EOQ→newsvendor.

Both Joe and Diligent stopped and went back, convinced they had skipped something. Neither had.

**F-19a · Unexplained lesson numbering survives everywhere.** The first lesson of the first set is headed "MODULE 1 · LESSON 5" (SPMS), "LESSON 3" (IBM), and SCLM's Module 2 opens on "LESSON 6". Diligent went looking for the four he had missed.

### F-20 · Right answers and rubric criteria contain ideas no lesson delivered
*Diligent, corroborated by Joe.*

- **BRGSA:** the correct decision option requires *"a decision threshold declared in advance"*. No lesson in the set says this. The written rubric then demands it too. Diligent ticked it honestly and still wrongly — *"I ticked it anyway because it felt like the same idea."* Self-marking failing exactly where the design predicts. **Root cause is already documented in-repo — see F-43.**
- **IBM SELCO:** the rubric requires bundling *"a suitable **light**"* — nothing anywhere says SELCO sells lights; the concept card says "customised solar products" — plus "linking repayment to the customer's savings or added income", a mechanism never delivered.
- **IBM Replicating rural services:** requires "certification", mentioned nowhere.
- **SCLM:** Learn passes this test cleanly. The only gap is in the mock — Section B Q2 needs `(D/Q)K + (Q/2)h`, which the EOQ lecture never writes down.

### F-21 · Glossaries disagree with the prose — in both directions
*Diligent.* Resolved across all four subjects: **two short, two clean. A defect, not the design.**

| Subject | Term used but never defined |
|---|---|
| SPMS | **emotional need** — though the objective promises "functional, emotional, and social layers" and the primer uses the word. The middle layer is only ever illustrated as "pride in more than a decade of study". |
| BRGSA | **researcher confirmation bias** — the lesson names five biases in prose, the glossary lists four. |
| IBM | *clean* |
| SCLM | *clean* |

The mirror fault is real too: IBM defines "market forces" and never uses it; SCLM defines **"tailored supply chain", "supply chain surplus", "dual sourcing"** and uses none of them in the prose.

**F-21a · Undefined vocabulary inside scored questions.** "BPO" is never expanded anywhere in the course. "FPO" appears cold inside an exam caselet. **"Portfolio-at-risk" is used in a 10-mark question and defined nowhere.** IBM also writes "roughly 4 billion people earning less than $1,500" with **no time period** — a year? a month? The sentence does not say.

**F-21b · "Terms used here (n)" is mislabelled.** On IBM's flour case it lists three terms that appear nowhere in that case. It means "terms from the lecture behind this question".

### F-22 · The predict-primer invites a specific error, then confirms it
*Diligent, SPMS + IBM.* The sharpest pedagogical finding in the exercise.

**SPMS:** the lesson names two of three intersections — D+F without V (unsustainable), D+V without F (space travel). The primer's case is **F+V without D**, the third, which the lesson never names. Diligent wrote a long prediction and mislabelled it. The reveal printed a *generic* rule — "strength in only two dimensions leaves a predictable failure" — then said *"compare that against what you wrote."* He compared, and concluded he was right.

**IBM:** he reasoned properly about the Sanjeevani case (at 94% capacity every dermatology slot must displace a ₹120 consultation, so the proposal substitutes against the mission rather than funding it). **The reveal did not engage with any of it** — it printed the dashboard's one-line concept blurb, never mentioning the dermatology line, the 94%, or the three-day wait.

**The mechanism is excellent and the follow-through is absent.** "Compare that against what you wrote" is the whole payoff, and nothing compares anything. Lazy typed a deliberately wrong prediction and the app headed it **"Here is the rule you were reaching for"** — and that wrong prediction was almost verbatim the trap option on the next question. He also pressed "just show me" and got the full rule with no penalty, so the prediction step is optional in practice.

**F-22a · SCLM's primer defeats itself on the page.** It renders the full lesson — including the worked example *and its answer* — directly above the prediction box, then reuses that same worked example as the thing to predict.

### F-23 · Rich cases attached to questions that don't need them
*Joe, Lazy, Diligent, IBM.* The Sanjeevani caselet is the best writing in the product — 94% capacity, three-day wait, a consultant pushing ₹4,000 cosmetic dermatology. The question attached is "is this an inclusive business?", which needs none of it. Joe: *"I read and reasoned about the dermatology decision and was asked something else entirely."*

### F-24 · The distractors taught more than the lessons
*Joe, IBM.* He got the vocabulary for IBM's four good mock questions — impact investing, the Grameen group-lending model — from **wrong answer options in the Learn set**. Good teaching material is sitting in the discard pile.

### F-25 · Feedback on a correct answer is the correct answer, restated
Every time, all four subjects. It adds nothing. Combined with F-06, this is why 24 sittings produced almost no teaching.

### F-26 · Content repeated to the point of noise
*Diligent, IBM.* One sentence appeared **six times** in a single set: primer rule, Q3 option C, Q3 feedback, Q5 feedback, Q6 option C, Q6 feedback. Q6's distractor D is word-for-word Q3's flawed claim.

### F-27 · A "precise principle" that does not rebut the claim it replaces
*Diligent, IBM.* Q3's flawed claim is about very high margins per customer; the replacement principle says nothing about margin or volume. He read it three times looking for the connection.

---

## S4 — Measurement and reporting

The results screens are the most sophisticated surface in the app, and they are full of statements that are not true.

### F-28 · "And it was still wrong" — printed on unmarked papers and on correct answers
*All three students, all subjects.* **"LONGEST QUESTION 1m 12s — And it was still wrong."** Printed on papers where nothing is machine-marked (the same screen says so twice) and on questions the student got right.

**Correction from Diligent:** the sentence has a **working correct branch** — SCLM printed "And you got it right, time well spent." So this is a **wrong-branch bug, not a missing feature.** Narrower and easier to fix than it first appeared.

### F-29 · The post-mortem contradicts itself and the marks
*Lazy, SCLM.* "Where it broke down" and "What this paper exposed" name **different six-concept sets**; their wrong-answer counts total 11 when he got 19 wrong; and the text claims "work to do on 14 concepts (4 now, other 10 queued)" above a list of six. SPMS does the same: "work to do on 8 concepts", then lists six. "Where it broke down" also prints the **same paragraph six times verbatim**, all labelled "UNRELIABLE AT TELL IT APART FROM A NEIGHBOURING IDEA" — including for concepts scored 3-right-1-wrong.

### F-30 · The gap reporter fails in both directions
- **BRGSA over-reports:** four concepts invented from its own broken renderer (F-02).
- **IBM reports nothing:** after ten questions on ten concepts, nine untaught, with vocabulary scores of 0-of-3 and 0-of-4 sitting directly above it, **"What this paper exposed" is empty.**

### F-31 · Counters that lie
- **"Re-attempts due" increments after correct answers** — 0→1→0→1→2→1 across seven correct answers with none missed (all students, all subjects). The sidebar explains it as "a missed idea returns in a different question".
- **"Re-attempts passed 3"** when nothing was ever re-attempted.
- **"Distinct question types passed" decrements**: 3 → 2 → 3.
- **"CHANGED YOUR MIND 20 — 5 of them moved from a right answer to a wrong one."** Nobody changed an answer; it counts option toggles inside multi-select items as decision reversals.
- **"Mocks completed 0 / No score yet"** in the header *after* a scored submission; Examiner record reading "PAPERS SAT 1 / BEST 0%".

### F-32 · "Review every question" prints the mark value where the question number goes
*Joe.* Proven across three sections: all 50 SCLM Section A items read "1 of 1", the 4 Section B items "4 of 4", the 3 Section C items "2 of 2". SPMS: all 35 read "Section A · 1 of 1". **57 questions, none identifiable.**

### F-33 · COURSE VOCABULARY measures the app's own gap and bills it to the student
*Diligent, IBM.* Terms of each lecture appearing in his writing:

| Lecture | Taught? | Score |
|---|---|---|
| Inclusive business | **yes** | **3 of 3** |
| Replicating rural services | no | 0 of 3 |
| Rural BPO model | no | 1 of 3 |
| Impact investing | no | 0 of 4 |
| Social business | no *(the skipped one)* | 1 of 2 |
| Group-based microfinance ×2 | no | 1 of 4 |
| Responsible lending | no | 0 of 3 |
| Farmer Producer Organisation | no | 2 of 3 |
| SELCO affordability system | no | 0 of 3 |

**On the one lecture he was given: full marks. On the nine he was not: under a third.** The metric tracks whether the lecture was *delivered*, almost perfectly. It is a real measurement and the product should be proud of it — but it is measuring its own gap and reporting it as the student's.

**F-33a · It is a literal substring match.** Diligent made all three required impact-investing points — intent (the 70% target), measurement (occupancy reporting vs sales value), return (9%, so capital recycles) — and scored **0 of 4**. Lazy scored 2 of 3 only because he typed the letters "FPO" and "aggregate".

**F-33b · The rubric contradicts itself on the same screen.** The card says *"the exact term is optional when the idea is clear"*; the footer scolds *"You answered in your own words rather than the course's. Examiners look for the framework's vocabulary."* Diligent: *"Which is it? I would not know what to do next."*

### F-34 · Four different counts for one study set
*All three students — the first thing every one of them saw.* Hero "4 questions · ~7 minutes" / set list "8 questions · ~12 min" / runner "0 of 12 steps" / results "8 scored questions". On IBM the results figure was **7**, disagreeing with the advertised 8 as well. Still present on any unfinished set.

### F-35 · The "Developing" status is explained inconsistently
*Diligent.* IBM graded both concepts "Developing" with the reason *"An unassisted whole reasoning chain is complete"* — which reads like an achievement, not a debt. The app's own status guide says Developing means "some evidence, **with a named next proof**", and **no next proof is named**. SPMS did name one ("1 fast response kept its result but did not count toward Strong evidence"). Same status, two explanations, one of which sounds like a pass.

### F-36 · Progress is lost between sessions
*Joe and Diligent.* Both returned to "Nothing is recorded yet", Not started 64, prior subjects back to 0/16. Diligent lost SPMS and BRGSA twice. *Cause partly ambiguous — our server restarts may contribute — but Diligent also found a set marked "Best 100%" from a run he never did, so the state layer is not merely empty, it is wrong.*

### F-37 · The app contradicts its own strategy advice, and the results screen is the honest one
Pre-exam: *"Choosing every option is strictly worse than choosing only the ones you are sure of."* Post-exam: *"On the items in this mock a random tick pays on average, because they carry more correct options than wrong ones."* **The second statement is true and the first is not.** Lazy tested it: select-all scored 3/20, so the exploit is weak — but the pre-exam advice is still wrong, and the app diagnosing its own exploit unprompted is to its credit.

### F-38 · The two halves of the app disagree about the negative marking
The paper list says SPMS has negative marking; the instructions page says Section A has none. That changes how a candidate sits it.

### F-39 · The two halves of the app disagree about the names of the subjects
*Precision from Diligent:* two are genuinely different subjects, two are trivial.

| | Learn | Examiner |
|---|---|---|
| SPMS | Software Product Management **and Strategy** | Software Product Management **for Startups** |
| BRGSA | Business Research, **Growth Strategies and Analytics** | Business Research and **Growth Systems Architecture** |
| IBM | Inclusive Business Model**s** | Inclusive Business Model |
| SCLM | *differs by one ampersand* | |

Diligent: *"I genuinely did not know which one is the subject I am sitting."*

### F-40 · Smaller interaction defects
- Matching screen prints **"EVERY LABEL IS PLACED"** directly above **"Every statement needs a label before checking"**, at the same moment (SPMS, IBM).
- The bottom hint never updates after answering — still "Choose every blank before checking" on the feedback screen.
- Every SCLM Section B scenario stem is **printed twice**.
- SCLM Section B says "inside the stated tolerance" with **no tolerance stated anywhere**.
- The header "Exam" button is dead on the STUDY SET COMPLETE screen in SPMS and BRGSA, and `#exam-home-screen` does not route. **Fixed by SCLM.**
- The dashboard pushes a **WhatsApp "join the tester group"** invite. Left unclicked — joining an external group is not an action to take on a user's behalf — but flagged as a design note: a revision dashboard sitting in a student's study path is an odd surface for an outbound group-join CTA.
- The teaching layer claims all 16 concepts are **"Taught in practice"** while the map directly above reads **"Not started"**.

---

## What is genuinely good — protect these

The remediation is to raise the item bank to the level of the engine, not to rebuild the engine.

- **G-01 · The predict-primer mechanism.** Commit a guess in your own words, then get the rule, then meet the same case as a scored question. Real pedagogy, not a quiz wrapper. It needs the reveal to respond to what was actually typed (F-22).
- **G-02 · The wrong-answer feedback — the best content in the product.** *"Right kind of move, wrong governing idea."* / *"Catch it earlier: name the governing idea before choosing an action. The action follows the rule; picking a plausible action first is what lets a neighbouring framework slip in."* / *"Point to the fact in the case that would have to be true for this action to be right. If it is not there, the action is not supported."* Diligent called the last **"the best sentence the app has given me"** — a transferable method, not a fact. Joe: *"the only moment the app taught me something I did not already have."*
- **G-03 · The refusal to over-credit.** A perfect score returned "Developing", not "Strong", because "1 fast response kept its result but did not count toward Strong evidence." An app that declines to flatter a fast right answer is rare. **SCLM awarded the first Strong grades in four subjects** — so the bar is real and reachable.
- **G-04 · "One confident mistake needs two independent checks."** It caught Diligent claiming he could explain a choice and then getting it wrong, and downgraded him. He called it the best thing the app had done.
- **G-05 · The honest written-answer contract.** *"This is a transparent self-check, not an automatic grade."* / *"cannot create Strong evidence without independent checking."* No fake AI marking anywhere.
- **G-06 · Mocks change no concept states**, matching the app's own claim that mocks are not evidence. Consistent and honest (Diligent, SCLM).
- **G-07 · The vocabulary check**, despite the substring implementation. Lazy — who was gaming everything — called it **"the best feature in the product"**, and it was the one thing that caught him.
- **G-08 · SCLM's numeric free-entry Section B — the only format in four subjects that defeated craft.** Four questions, "enter the final figure only". No options, nothing to eliminate, no absolutes, no length tell, no position. Lazy scored 16/16 by actually computing exponential smoothing, EOQ total cost and the newsvendor critical ratio — arithmetic he brought with him. **A student who skipped everything scores zero.** This is the design answer to F-06, and it already exists in the product.
- **G-09 · IBM's four integrated caselets.** 16% developer margin against a 70% income covenant; a PAR of 1.2% masked by 38% loan recycling; 900 farmers against a 200-tonne minimum. **All three students independently named exactly these four the best assessment content in the app** — see F-41. Q8 is the best question in the product: portfolio-at-risk reads 1.2% only because refinancing keeps accounts current, so the headline metric has been made incapable of showing the problem.
- **G-10 · Real transfer, when the lecture is delivered.** Diligent answered IBM Q4 from the "primary objective" rule Learn actually taught. The design works; the delivery is the gap.
- **G-11 · The best sentence in any lesson**, from IBM's bottom-of-pyramid lecture: a sachet *"does not make shampoo cheaper per wash; it makes the purchase fit a daily cash flow rather than requiring a lump sum."* Joe: the only thing from hours of study he could reproduce cold a week later.
- **G-12 · SCLM's Section B honesty** (F-02a), **SCLM's lesson ordering** (F-19), **IBM's clean glossaries and clean boss chain**, and **IBM's written criteria referring to things actually taught** — each proves the corresponding defect elsewhere is a defect, not the design.
- **G-13 · Fixed during this test window:** the confidence question no longer eats the first press of "Check answer" (Diligent's clearest SPMS complaint); the header Exam button works from the set-complete screen in SCLM.

---

## Engineering notes

*Added after the student runs, from the repo. The student evidence above is blind and stands on its own; this section exists only to connect it to recent commits.*

### F-41 · The newest content work landed, and the students validated it blind
Commit `8477519` authored **eight integrated scenarios — four BRGSA, four IBM** (`app/sets/t6_integrated.js`), each spanning three or four concepts, carrying figures, and deliberately **never naming a concept in the stem**. They enter the bank as written `short-answer`, `selfReviewOnly: true`, `writtenMode: "integrated"`, difficulty 5 (`t6_challenges.js:1304`).

**IBM Mock Set 1 served four caselets. All three students, independently and knowing nothing was new, named exactly those four the best assessment content in the app** — while being scathing about everything around them. The student who beat every other format in four subjects on craft alone could not game them.

**Whatever principle produced `t6_integrated.js` is the one to apply everywhere else.**

### F-42 · BRGSA's four authored scenarios never reached the paper
BRGSA Mock Set 1 served **none** of its four. Its only two written slots (Section C) went to the old generic prompts, one a verbatim Learn copy, at ten marks each.

The obvious cause was **checked and ruled out**: `addIntegratedScenarios` silently drops a scenario when any declared conceptId fails to resolve (`t6_challenges.js:1310`), and the BRGSA renames in `19cae26` made that plausible. **All fifteen referenced conceptIds resolve.** Nothing is being dropped — the scenarios are in the bank and the BRGSA paper is not selecting them, most likely because its paper shape has two written slots against IBM's ten. One look at paper composition. *Caveat: only Set 1 was sat; other sets may differ.*

### F-43 · A known-but-unfixed diagnosis, independently rediscovered by a student
Commit `0f8ef39` documents that BRGSA has an authored `application` on **0 of 16** concepts, so `conceptData` falls back to `applicationSeed.options[answer]` — the correct multiple-choice option from a case question — and both written generators state the judgement criterion as "consistently with this course move: *<that option>*". It closes: *"No code changed… it waits for owner acceptance."*

**Diligent hit exactly this, blind** (F-20), and supplied the human cost: the criterion demanded a "decision threshold declared in advance", no lesson taught it, and he ticked it anyway "because it felt like the same idea". This is a merge point confirming a live diagnosis, not a new bug.

### F-44 · Two things that should not be reported as defects
- **"Dungeon's deep written review is unavailable"** — flagged by all three students. `ab4bbba` states "Branch only; hosted checking stays fail-closed." The real defect is narrower and still real: **the paper's own instructions promise the review** ("after submission Dungeon can issue a course-grounded practice review"), and on IBM the fallback leaves 100 of 100 marks unassessed with no guidance. Fix the promise and the fallback, not the marker.
- **The Tele-MANAS block** (`bc32cef`) is deliberate and well-designed — it matches first-person intent, never topic, precisely so a correct answer about the Andhra Pradesh collapse does not trigger it. The students' complaint is **frequency and placement** (three times in five minutes), not the safety logic. Repetition is how a safety message becomes furniture.

### F-45 · One charge withdrawn
An earlier note recorded IBM's dashboard "2 concepts are already building. 16 still need enough evidence" as an arithmetic error (2 + 16 = 18 > 16). **It is not** — the 2 are a subset of the 16. Confusing wording only. Recorded so the merged report does not carry it forward.

---

## Coverage and merge notes

**Covered by this report:** SPMS, BRGSA, IBM, SCLM — Learn Set 1 + Mock Set 1, each by all three personas. Branch `codex/measurement-foundation`, 2026-08-14.

**Not covered — candidates for report 2:**

- **Study sets 2+ and mock sets 2+.** Everything here is Set 1. F-42's caveat depends on this, and F-03 (deleted teaching) was only observed on a completed set.
- **The four BRGSA integrated scenarios** — authored, in the bank, never served to a student. Nobody has sat them.
- **The remaining IBM/BRGSA concepts** — 14 of 16 SCLM concepts and 9 of 10 IBM mock concepts were examined but never taught; no student has seen those lessons.
- **Keyboard-only and screen-reader paths.** F-01a is inferred from the absence of a non-drag control, not from an assistive-technology run.
- **The Bag drag-to-drop-zone flow.** Never exercised — screenshots were unavailable in this pane, so the workaround was never confirmed to work.
- **Mobile.** Geometry was inspected at mobile width (F-01), but no full sitting was run there.
- **Written marking quality.** The hosted marker is fail-closed on this branch (F-44), so no student received a machine mark on any written answer.

**Merging:** finding IDs `F-01`–`F-45` and `G-01`–`G-13` are stable. Continue new findings from **F-46** / **G-14**. Where report 2 contradicts a finding here, prefer report 2 if it sat more sets — most findings here are single-set observations, and several (F-07, F-19, F-21, F-31) already resolved differently across subjects.

**Methodology caveats, stated plainly:** part of the Submit failure was a native `confirm()` the harness auto-dismisses (F-01); progress loss (F-36) may be partly our server restarts; and all SCLM *lesson* findings come from the read-only Teaching layer, because the set had deleted its own lessons (F-03).
