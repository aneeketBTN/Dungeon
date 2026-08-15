# Round 2 — the three big issues, and a harness that replaces 390 tool calls

`VERIFIED(REAL_BROWSER + AUTOMATED)` · 2026-08-15 · branch `codex/measurement-foundation`

Continues `verification.md` in this folder. Merges against
`evidence/2026-08-14/t6-three-student-cram-test/verification.md`. New findings from **F-46**.

---

## F-02 — BRGSA Section B · CLOSED

**Two bugs, not one.** All 16 BRGSA case-cloze questions carry `blanks` (two each, four
options apiece) and no `options` and no `answer`. `examQuestionMarkup` shared the mcq
branch for case-cloze, so it read `question.options`, got `undefined`, and mapped an
empty array — caselet, task line, then an empty `div.exam-options`. **20 of 80 marks
with no control of any kind.** `scoreExamItem` had the same fault
(`item.response === question.answer`), so even a student who could somehow have
answered would have scored zero.

Both branches now exist. Verified in a live paper: *Section B · Question 1 of 4 · 5
marks*, two selects labelled "Choose the decision" / "Choose the framework", four
options each, zero empty option divs. Answered all four from the key and submitted:

> **Section B 20 / 20 · 4 of 4 attempted**

The false diagnosis dies at source — the questions are answerable, so the results
screen can no longer invent four weak concepts out of its own render failure.

**F-46 (new) · A renderer that cannot draw a question now says so.** The old default
branch was the written textarea, so any future type mismatch produces a plausible
answer box rather than an error, and case-cloze did not even reach it. Unknown types
now render a red panel naming the format and stating the marks are excluded and that
this is Dungeon's fault. The class of bug that produced F-02 is silent by design;
it no longer is.

---

## F-05 — the fake stem · CLOSED

`makeQuestion`'s `connect` family used a **constant stem and a constant caselet, shared
by all 64 concepts**, and three distractors from a shared `CONNECT_WRONG` pool — every
one of them opening on a referentless "It". The correct answer is the concept's
`bridge`, which necessarily names syllabus content, so the whole family reduced to
"pick the only sentence that mentions the subject".

Fixed at the generator: the stem names the concept, the caselet names the concept, and
each distractor is bound to the concept instead of "It". The three misconceptions are
kept — a local optimum, a decision closed to later evidence, an idea treated as
context-free are real ways to get this wrong; they are now specific false claims
*about this concept* rather than free-floating generalities.

Measured on the harness, repeated visible prompts per paper:

| | before | after |
|---|---|---|
| SPMS | 44 distinct of 55, largest group **12**, 12 marks | **55 of 55**, largest group **1**, **0 marks** |
| SCLM | 40 distinct of 57, largest group **16**, 22 marks | **55 of 57**, largest group **3**, 6 marks |

---

## F-08 — Learn items in the mocks · MEASURED, DISCLOSED, NOT CLOSED

The report described some items leaking. The measurement is worse and simpler:

> **100% of every paper is drawable in Learn. All four subjects. There is one bank and
> no reservation at any point.**

It cannot be closed by scheduling. Three sections have no slack to partition with —
SCLM Section A needs 50 from a pool of 52 — so an examiner-only slice is bank growth,
which is content work and stays for the owner. Making the draw learner-dependent was
rejected: it would mean two students sit different papers, which breaks what a mock is.

What is fixed is the score concealing it. The pre-clock cover now states how many of
this paper's questions the candidate has already answered in Learn, and that a mark on
those shows recall rather than fresh knowledge. Same principle as the shortfall notice:
if the number cannot be fixed yet, it must at least be true and said.

---

## F-47 (new) · The bank gate had never seen the newest content

Caught by the harness's own drift guard, not by looking. `tools/export-persona-run.mjs`
mirrors the paper builder, so it stamps a digest and the browser recomputes it from the
app's own builder. Two of four disagreed — **BRGSA and IBM, the two subjects with
written sections.**

Cause: `t6_integrated.js` was missing from the load list of `validate_t6_bank.js`,
`check_exam_readiness.mjs`, and both measurement scripts. `build-site.mjs` and
`t6.html` do load it, so the deploy was never affected — but **the bank validator had
never once validated the eight integrated scenarios**, the newest content in the
product and the only assessment content all three students independently rated best.

Adding it made the validator fail immediately: 8 errors, all eight scenarios, all
"does not declare whether it is short-form or case-based writing". The content was
right and the **gate was stale** — it predated `writtenMode: "integrated"` and had
never fired to say so because it had never seen the file. Gate widened. Bank now
validates clean including the scenarios, for the first time.

---

## The harness

`tools/export-persona-run.mjs` writes two files per subject:
`<SUBJECT>-set1.json` (candidate view) and `<SUBJECT>-set1.key.json` (answers).

**Blind by construction.** The candidate file carries no answer index, no `answers`
array, no per-blank answer, no diagnoses, no rubric text, no explanation. The previous
run's blindness rested on a persona choosing not to read the bank, which is not a
control. This is.

**Faithful by check, not by assertion.** The paper builder is mirrored in Node, which
is exactly the drifting second copy `teach-before-test.js` warns about — so it is not
trusted. Every file carries a digest over `section:questionId` in order, and
`tools/browser-checks/export-run.js` recomputes it from the app's own
`window.__dungeonExport.paper()`. All four match:

```
SPMS   node 15ce71d8 | browser 15ce71d8 MATCH
BRGSA  node 387e97e0 | browser 387e97e0 MATCH
SCLM   node 9c323ea0 | browser 9c323ea0 MATCH
IBM    node 20a66748 | browser 20a66748 MATCH
```

That guard is what found F-47 on its first run.

**Cost:** 5–56 KB per subject, one read. It replaces ~390 navigation calls per persona.
The Learn queue is deliberately not mirrored — `layeredQueue` carries far more rules
and depends on learner state, so `export-run.js` exports that half from the live app.

---

## The persona run

`tools/run-persona-strategies.mjs` states each reported exploit as code and scores it
against the key. Ties resolve to the expected value of a random pick among survivors,
so narrowing four options to two scores 0.5 rather than 1.

Percentage of MCQ marks, **chance = 25%**:

| Strategy | SPMS | BRGSA | SCLM |
|---|---|---|---|
| on-topic only (**F-05**) | **17.1** | 25.0 | **17.0** |
| always B (**F-07**) | 22.9 | 20.0 | 24.0 |
| longest option | 32.1 | 28.8 | 11.0 |
| eliminate unethical options | 27.1 | 26.7 | 25.8 |
| **eliminate absolutes (F-06)** | **43.8** | **36.2** | **36.0** |
| all rules combined | 36.4 | 40.0 | 29.3 |

**F-05's exploit now scores worse than chance** — with every option naming the concept,
the rule actively misleads. F-07 stays closed. But this also names the largest
surviving hole precisely, which the personas could not: **eliminating options carrying
`only / all / every / never / always` still pays 36–44%.** That is F-06's real
mechanism and it is **not fixed**. It is the next piece of bank work.

One caveat stated plainly: these are *mechanical* rules. The personas scored higher
because a person combines them with judgement. These numbers bound single rules, not a
human using craft.

---

## Gates

| Gate | Result |
|---|---|
| `npm test` | **78 / 78** |
| `validate_t6_bank.js` | `ok: true`, 0 errors — **now including t6_integrated.js** |
| `check-palette.mjs` | clean |
| `build-site.mjs` | builds |
| harness digest vs live app | **4 / 4 match** |
| live BRGSA paper, Section B | **20 / 20, 4 of 4 attempted** |

---

## Open

- **F-06 · absolutes in distractors, 36–44% against 25% chance.** Largest remaining
  gameable surface. Bank content work.
- **F-08 · one bank, no reservation.** Disclosed, not closed. Needs bank growth.
- Pixel acceptance still owed; the pane composited geometry but no screenshots.
- Not merged, not pushed, not deployed.

---

## Addendum — F-08 corrected, and where the next work starts

**I overstated F-08 and am correcting it.** "100% of every paper is drawable in Learn"
is true but is not the number that matters. Learn *delivers* 88 questions from pools
holding 168–207, so a learner who completes all ten study sets actually meets roughly
**40–53%** of their paper (SPMS 26/55, BRGSA 11/26, SCLM 30/57, IBM 4/10) — and far
less after one set, which was the students' case. The `alreadyMet` disclosure measures
actual attempts, so it was always reporting the right thing; the headline was wrong.

That correction exposes the lever: **Learn has slack and the examiner has none.** So
Learn yields. `examReservedIds()` collects every id used by mock sets 1–3 and
`selectQuestionsFromPool` uses it as a **late tiebreaker** — after never-attempted,
format spread and concept coverage, before recency. A hard exclusion was rejected: it
would let the examiner's draw starve a module of its best surfaces, trading a small
honesty problem for a real teaching one. Reserved counts: SPMS 71, BRGSA 58, SCLM 61,
IBM 22.

**The owner's reframing supersedes this as the real fix.** Sparse question families are
not a constraint of theoretical subjects — scenarios, situations and individual cases
can all test one concept differently. The CLAs supplied for that
(`docs/course-material/`, gitignored, extracted to `SCLM-CLA.txt` / `BRGSA-CLA.txt`)
hold **152 real course questions with answers** — SCLM 72, BRGSA 80, eight modules
each — written scenario-first in exactly that style ("A founder wants to avoid spending
months building a product before discovering whether anyone will pay…").

They are the source for both open findings at once: they roughly triple SCLM's MCQ pool,
which is what F-08 needs to give the examiner genuine slack, and they are a supply of
correct answers that carry absolutes, which is what F-06 needs to close the 36–44% gap
without watering down distractors that are over-claims on purpose.

**Not started, and deliberately not half-started:** mapping CLA items to concept ids and
adding them as a bank family. It changes scheduled coverage, needs the LAW-47 and
vocabulary gates re-run, and is content, so it will carry
`WAITING_OWNER_CONTENT_ACCEPTANCE`.

**The learning-environment harness is half-built.** The paper half is done and
digest-verified. The learn half cannot yet select its own subject — it clears the
profile, and a bare `{selectedCourse}` object is normalised back to defaults at load,
so it starts the wrong subject's run and every step resolves to `unknown`. It now
**refuses and says so** rather than emitting a plausible-looking empty run, which is
the same lesson as the reteach-check defect: a broken probe that stays quiet is worse
than no probe. Finishing it means driving the subject rail through the UI and writing
per-subject run JSON with lessons, primers, questions and per-option feedback — the
feedback matters, because "am I learning?" is decided by what a student is told after
committing.
