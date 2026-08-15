# Three levels instead of four dials, and the primer defect the measurement found

- **Goal:** make "Build your own practice" one decision instead of four, using score-band presets —
  `0 → 60` cover everything, `60 → 80` tested in depth, `80 → 100` hardest only — with every existing
  option kept and reachable for anyone who wants to tinker.
- **Status transition:** `UNSTARTED → VERIFIED(REAL_BROWSER + AUTOMATED)` on
  `codex/measurement-foundation`. Not merged, not deployed.
- **Reported by:** the owner — "simplify build your practice/practice sets to 0-60 basically all
  concepts speedrun / 60-80 concepts tested, varied but in depth / 80-100 hardest concepts, requires
  huge breadth of experience with subject … as presets, every other option can be something they
  tinker with, but I want intuitive, makes sense control and overall reduce cognitive load."
- **Also in this session:** the primer rework below, on the owner's follow-up report. Same branch,
  same status.
- **Changed files:** `app/t6.html`, `app/t6.js`, `app/t6.css`, `app/sets/t6_challenges.js`,
  `tools/validate_t6_bank.js`. New checks: `tools/browser-checks/practice-presets.js`,
  `tools/browser-checks/primer-prediction.js`. Extended:
  `tools/browser-checks/teach-before-test.js`.

## What the presets are allowed to promise

The presets are score bands, so the first question was whether the bank can actually honour three
levels of difficulty in four subjects. Every scheduled question already carries a `difficulty` of
2–5 (`t6_challenges.js:66` assigns it from `perspective` where it is not authored), and nothing on
the learn side had ever let anyone ask for it. Measured across the scheduled bank:

| Subject | Scheduled | d2 | d3 | d4 | d5 | Concepts with a d2 surface |
| --- | --- | --- | --- | --- | --- | --- |
| BRGSA | 207 | 35 | 88 | 40 | 44 | 16 of 16 |
| IBM | 197 | 45 | 64 | 44 | 44 | 16 of 16 |
| SCLM | 168 | 48 | 48 | 32 | 40 | 16 of 16 |
| SPMS | 184 | 48 | 68 | 28 | 40 | 16 of 16 |

Every band is populated in every subject, and every concept in every subject has a plainest-surface
question — so "one question per concept, on its plainest surface" is a promise the bank can keep
rather than one it has to approximate.

## The shape

A preset is **exactly a set of the dials**, and the lit card is **read back from them** rather than
stored beside them. A stored preset id is a second source of truth that drifts the moment one chip
is pressed, and a card describing a run the queue will not deliver is the lying control LAW-01
exists to prevent. So pressing a chip after pressing a card simply lands on "Custom mix", and the
panel and the cards can never disagree.

Two dials are new, both of them things the presets were going to turn anyway:

- **How hard** — Plainest (d2–3), Applied (d3–4), Hardest (d4–5), Any. The bands overlap on purpose:
  a d3 is the top of the ground-covering band and the floor of the applied one, because the same
  question is a stretch for someone starting and a warm-up for someone finishing.
- **How long → Every concept** — a coverage rule rather than a size, so its target is the subject's
  concept count. It answers the question a learner is actually asking under that legend: as long as
  it takes to touch each idea once.

`0 → 60` is the only route that selects its own questions. `selectQuestionsFromPool` ranks format
spread above concept spread, so asking it for sixteen questions from a sixteen-concept subject
returns *about* one each — fine for a mixed run, useless for a card that says "every concept in the
subject, one question each". `sweepSelection` takes each concept's lowest-difficulty surface,
never-attempted first, and hands the result to `orderForDelivery` — the ordering rule factored out
of `selectQuestionsFromPool` so both routes sequence a run the same way and LAW-47 keeps holding by
construction.

`80 → 100` names three module bosses as anchors. A boss is the hardest thing the bank can ask, and
`selectQuestionsFromPool` deliberately admits bosses only as anchors, so without naming them a run
advertised as the hardest surfaces would contain at most one by accident.

## LAW-01 — every card checked against the run it queues

`tools/browser-checks/practice-presets.js`, real browser, fresh profile per preset. It reads the
sentence printed on each card and asserts it against `profile.active.queue`:

```
{ "ok": true, "law": "LAW-01", "findings": [] }
```

| Card | Claim printed | Questions queued | Concepts | Bosses | Formats | Difficulties |
| --- | --- | --- | --- | --- | --- | --- |
| 0 → 60 | 16 questions · one per concept | 16 | 16 of 16 | 0 | 2 | all d2 |
| 60 → 80 | 18 questions · 5 formats | 18 | 15 of 16 | 0 | 5 | 11×d3, 7×d4 |
| 80 → 100 | 12 questions · 3 module bosses | 12 | 10 of 16 | 3 | 4 | 9×d4, 3×d5 |

No question in any run fell outside the band its panel claimed to be drawing from. The run header
reads the card that was pressed (`SPMS · Cover everything once`) and the kicker carries the band
(`0 → 60 · Explanations after each answer · 16 questions`).

The time claim is now made against the **queue**, not the question count. A first pass at `0 → 60`
is 16 questions and 32 lessons and primers; counting only the questions understated it by every
lesson in the subject. The 1.25 min/item constant is unchanged and still uncalibrated — it treats a
lesson as costing what a boss costs — which is stated here rather than papered over.

## LAW-47 — teach before test, per preset

`tools/browser-checks/teach-before-test.js` now loops the presets instead of clicking the builder
once. From an empty `lessonsRead`:

```
builder 0 → 60: 40 items, 0 violations
builder 60 → 80: 41 items, 0 violations
builder 80 → 100: 27 items, 0 violations
```

plus study sets 1–9 clean, as before. LAW-62 applies to that loop and its note stands: a thinner
queue can add violations, never hide one.

## Layout

`tools/browser-checks/ui-audit.js`, both viewports, builder open and dials expanded:

| | 1280×800 | 375×812 |
| --- | --- | --- |
| horizontal overflow | 0 | 0 |
| tap targets under 44px | 0 | 0 |
| radii off the four-step scale | 0 | 0 |
| ragged sibling rows | 0 | 0 |
| preset cards | 349×168 ×3, equal | 325×152 ×3, stacked |
| disclosure row | 44px | 58px (wrapped) |

`node tools/check-palette.mjs` clean in both themes. `npm test` 78/78.
`node tools/build-site.mjs` prepared 18 public assets.

**No screenshots.** The Browser pane reported "not displayed, so the page is not compositing
frames" — the same condition recorded in earlier entries. Pixel acceptance is still owed.

---

# The primer printed its own answer. It now asks for a prediction instead.

Found while measuring the above, logged as `REDLINE` **LAW-63**, and fixed in the same session on
the owner's direction — "break down the question more, and have the students synthesize the
principle", then *Predict, then reveal* when the three shapes were put to them.

## The defect

The owner's observation was "a primer is just tapping the same mcq as the question verbatim". The
measurement is stronger than that.

**Every primer reveals its own answer on its own screen.** `renderPrimerPanel` prints
`Know this: <question.primerFact>` directly above the options, and `addPrimer` sets
`primerFact: data.summary` — the same string it makes the correct option. **64 of 64.** The task is
to find a sentence that is already on the page, which is string matching, not comprehension.

**The distractors cannot rescue it.** They are `comparableWrong(data.summary, <other concepts'
summaries>)` — other concepts' principles. `t6_catalog.js` states the rule for the whole bank:
"Distractors in this bank are not invented: they are borrowed from other concepts." So even with the
panel covered, the primer is answerable by topic-matching and unanswerable by reasoning — the same
defect `relevantWrong()` was written to fix for case questions, never applied here.

**And the panel hands over answers the run has not asked for yet.** The four strings the panel puts
on screen (`primerFact`, `primerApplication`, `primerMisconception`, `primerConnection`) are the
correct answer to **493 scored questions** across the bank:

| Subject | Primers | Scored questions whose answer the panel prints | Chiefly via |
| --- | --- | --- | --- |
| BRGSA | 16 | 88 | `primerApplication` (56) |
| IBM | 16 | 133 | `primerApplication` (72) |
| SCLM | 16 | 136 | `primerApplication` (72) |
| SPMS | 16 | 136 | `primerApplication` (72) |

Measured on real runs rather than left as a bank property — a fresh `0 → 60` sweep, all four
subjects, counting only answers shown *earlier in the same queue*:

| Subject | Queue | Scored | Primers | Answers already on screen |
| --- | --- | --- | --- | --- |
| BRGSA | 51 | 16 | 16 | 16 (all same-screen) |
| IBM | 48 | 16 | 16 | 29 (16 same-screen + 13 scored questions) |
| SCLM | 48 | 16 | 16 | 26 (16 + 10) |
| SPMS | 48 | 16 | 16 | 30 (16 + 14) |

So in a first run through SPMS, 14 of the 16 scored questions had their correct answer printed
verbatim on a screen the learner had already seen.

**Two of those three numbers are worse than the third, and the law says which.** A principle taught
before a later scored question is LAW-47 working as designed — that is what lessons are for — so
the "493" and the run-level counts are a bank-authoring concern about verbatim reuse, not a defect
on their own. What is indefensible is the 64 of 64: one surface holding both the question and its
answer. LAW-63 is written narrowly around that, deliberately, because the broad version would forbid
teaching.

## Why the obvious fixes do not work

A synthesis primer with options needs same-concept near-misses — a distractor borrowed from another
concept is precisely what makes the current item topic-matchable. Inventory of what is authored:

| Subject | `confusions` | `applicationWrong` | `caselet` |
| --- | --- | --- | --- |
| IBM | 3 per concept | 3 per concept | yes |
| SCLM | 3 per concept | 3 per concept | yes |
| SPMS | 3 per concept | 3 per concept | yes |
| BRGSA | **none** | **none** | yes |

Two blockers, and the second is the decisive one. BRGSA — the subject a learner meets first in exam
order — carries no same-concept near-misses at all, so 16 of 64 concepts would need new prose, which
is a bank task needing the external transcripts. And every same-concept string that *does* exist is
already spoken for: `confusions` are `_explain`'s distractors, `applicationWrong` is `_apply`'s
option set, `bridge` is `_connect`'s answer. Any keyed primer built from them pre-answers a scored
question. The defect moves; it does not close.

## What shipped: predict, then reveal

The primer stops being a question with an answer.

- **Before committing**, the panel carries the carry-forward line and `primerCase` — the concept's
  own caselet, a concrete situation — and nothing that names the rule. At support level 3 it also
  names the misread that has already caught this learner, which is a *wrong* option and so gives
  away nothing the prediction is for.
- **The learner writes a prediction** in their own words: *"Before anything names it: what rule do
  you think this case is showing, and why?"* There is no key, no marking, no score, and no evidence.
  An honest escape — *"I would be guessing — just show me"* — reveals without claiming a prediction
  was made, because "I don't know" is a legitimate state at first contact with a new idea.
- **The reveal** quotes their words back, then gives the rule, the application at level ≥2, the trap
  at level ≥3, and the connection. It carries no verdict: nothing compared their prose to a key, so
  calling it right or wrong would be a claim the app cannot support. It takes the cyan guidance
  colour rather than the green "correct" treatment it used to inherit.

Being wrong is the mechanism, not a failure state — which is also why a primer can now ask for
reasoning at first contact, where a keyed question could only ask for recall of something never
taught.

Two things fell out of removing the key. `recordPrimerAttempt` used to move the support ladder on
whether the learner picked the right option — an option printed on the same screen — so the ladder
was reading whether somebody could match a string; it now records `shown` and `predicted` only, and
the ladder is driven entirely by `updatePrimerFromChallenge`, i.e. by how the concept's *scored*
questions actually went. And the bank gate now **forbids** options on a primer rather than checking
their shape: an options array needs a key, and the key was the leak.

## LAW-63 — verified

`tools/browser-checks/primer-prediction.js`, real browser, every concept in the subject reached
through a real `0 → 60` run:

```
{ "ok": true, "law": "LAW-63", "primersChecked": 16, "findings": [] }
```

Per primer it asserts: nothing on screen before the commit is a correct answer to any scheduled
question on that concept; no options and no keyed answer are present; the prediction box refuses an
empty commit; committing moves neither `conceptAttempts` nor `totalAnswers` (as a **delta across the
commit** — the walk answers the scored questions in between, so an absolute assertion would report
the run's real evidence as the primer's leak, which is exactly what the first version of this check
did); and the reveal still carries the rule and the connection the panel withheld.

Manually, on the first SPMS primer: commit disabled until a prediction is typed, feedback class
`feedback visible primer-pass`, response saved as `correct: null` / `scored: false` /
`primerPredicted: true`, `conceptAttempts` `{}` and `totalAnswers` `0`, and `primerState.spms_dfv`
reading `shown: 1, predicted: 1` with `correct` and `wrong` untouched.

## Reported, not fixed: 32 questions per subject answerable from the concept's name

The check surfaced a second, older leak and reports it under its own key rather than inside LAW-63.
`_term_cloze` asks "the concept is ___" with the concept's name as the answer, and `_case_cloze`'s
second blank asks for the framework by name — while the layering copy has to print that name
("Carry forward: <previous>. Now add <this>") for the run to read as a sequence.

**32 scheduled questions in every subject** — 128 in all — have the concept's own name as a correct
answer. This is not a support-surface defect and the primer rework neither caused nor fixes it; the
fix is question design, and removing or rewriting `_term_cloze` changes scheduled coverage, so it is
the owner's call rather than a change to make in passing.

## Gates after the primer rework

- `tools/browser-checks/primer-prediction.js` — `ok: true`, 16 of 16 primers.
- `tools/browser-checks/practice-presets.js` — `ok: true`, unchanged by the rework.
- `tools/browser-checks/teach-before-test.js` — `ok: true`, 0 violations across sets 1–9 and all
  three presets, `skipped: []`.
- `ui-audit.js` on the prediction screen **and** the reveal screen, 375×812 and 1280×800 — 0
  overflow, 0 sub-44px targets, 0 off-scale radii, 0 ragged rows, 0 dense paragraphs.
- `npm test` 78/78; `node tools/check-palette.mjs` clean; `node tools/build-site.mjs` 18 assets;
  `node tools/validate_t6_bank.js` `ok: true`.

**The bank validator ran without the lecture transcripts**, so its `"coverage": {}` is empty and the
LAW-49 vocabulary gate did not execute — per `AGENTS.md`, that is a skipped check, not a passed one.
Nothing here changes lesson prose or a question's declared lectures, but the primer's new stem and
the prediction copy are unverified against the transcripts and stay
`WAITING_OWNER_CONTENT_ACCEPTANCE`.

---

# The UI overpass, and the three defects the probe could not see

- **Reported by:** the owner, with a screenshot of the results ring — "16 scored questions"
  running across the ring's own stroke — and the standing instruction: *"these things like things
  overlapping, text not being sized properly etc cannot happen. Readability on desktop + mobile is
  paramount."*

Every layout claim in this session had come from `tools/browser-checks/ui-audit.js`, and it had
reported the results screen clean. It was right about what it measured and blind to what was wrong:
it checked the viewport edge, tap size, corner radii, paragraph length, font floor and row raggedness
— and nothing about **whether text fits the box holding it**. So the probe was extended before
anything was fixed.

## Three detectors added

| Detector | What it measures | Why the old set missed it |
| --- | --- | --- |
| `clipped` | text runs painted outside the content box that lays them out | nothing compared content to container |
| `circleFit` | text inside a round container against the **chord** at the height it sits | a circle is narrower than its box everywhere but the middle |
| `overlaps` | two text-bearing siblings whose rects intersect | nothing looked at pairs |

`clipped` measures **glyph runs**, not `scrollWidth`. The first version used `scrollWidth >
clientWidth`, which describes an inline box's *containing block* — so every bold word inside a
wrapped sentence reported as overflowing by the width of its own second line, and two real defects
sat inside forty false ones. Ranges over the text nodes answer the actual question, including under
`overflow: hidden` where clipping happens at paint time and the run still reports where the glyphs
wanted to go. Visually-hidden labels are excluded by **shape** — a ~1px box with `overflow: hidden`
holding a whole sentence — rather than by class name, so `.sr-only` and `.bag-label` are both covered
and a third one written later is too.

`circleFit` measures cap height either side of the run's centre rather than the line box: a 14px
badge holding an 11px "i" on a 29px line has a run rect taller than the circle, and measuring that
rect says the circle is zero wide, which flags every icon badge in the app.

## What they found, and what was fixed

**1. The reported defect — the results ring.** `<small>` lived inside the ring. At 122px of inner
width the caption fitted the *box*; the circle at the height the caption sits (below centre, because
the percentage is above it) is only **110px** wide, and "16 scored questions" needs **118px** — the
detector reports `outsideBy: 8`. The caption now sits **under** the ring in a `.score-block` stack.
A circle has no width that a runtime-length string can be guaranteed to fit, so this removes the
defect class rather than tuning it away.

**2. The mastery key, mobile — the worst of the three.** Each entry is
`<i class="dot"><b>Label</b> — description</i>`: **three** children in a row styled
`grid-template-columns: auto minmax(0,1fr)`. A grid assigns columns per child, so the dot took
column 1, the bold label took column 2, and the description became an anonymous item on a second
row. At 375px the columns resolved to **274px and 28.7px**: "Needs practice" was squeezed into
28.7px, wrapped onto two lines, and ran **19px past the panel edge**, with its own description on
the line below it. Now a hanging indent — `padding-left: 18px; text-indent: -18px` — so dot, label
and description flow as one sentence. Measured after: dot at x=0, label at x=18, one line each, at
both 375px and 1280px.

**3. Two tap targets under the floor**, found by the existing detector once the noise was gone: the
answer-review disclosures on the simulation results screen at **23px**, twelve of them to a review;
and the `horizon-choice` buttons at **43px** — `min-height: 42px` plus a 1px border, one short.
The Tele-MANAS crisis link in the written-support line was **35×16**, and now carries a 44px hit
area through padding with an equal negative margin, so the sentence it sits in does not move.

## Sweep

Fixed-width same-origin iframes, one page load per screen, every detector:

| Width | Screens | Result |
| --- | --- | --- |
| 320 | results, mcq, match, feedback, primer | 0 findings |
| 375 | results, primer, mcq, cloze, match, boss, short-answer, feedback, practice-setup, priority, dashboard-concepts, dashboard-plan, simulation-results, written-repair, exam-written-review, primer-recovery, builder (dials expanded), exam home, exam paper, exam results | 0 findings |
| 1280 | the same set | 0 findings |

`npm test` 78/78, palette clean, build clean, bank `ok: true`. LAW-01 and LAW-63 re-run after the CSS
changes: both `ok: true`, all three preset claims still matching their queues.

**Still no screenshots** — the pane composites intermittently and did not when asked. Every number
above is a measurement, not a look, and pixel acceptance remains owed.

## A defect this session's own check had

The first version of `teach-before-test.js` reported `ok: true` over three routes instead of twelve.
A saved run resumes straight into the practice screen, the dashboard never renders, every set button
it looks for is absent, and the loop skipped all nine silently. It now records what it could not
reach and an unreached route makes the result **not-ok** — coverage is part of the verdict, not a
footnote. Same family as LAW-62: a check that measures less than it claims reads exactly like a
clean pass.
