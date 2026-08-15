# Prompt — the student-experience check and the Term Dungeon decision dashboard

> Two halves of one job. The first asks *what is the experience actually like*; the
> second turns that into figures the owner can build the next Term's Dungeon from.
> Hand this to a fresh session verbatim.

---

## 0 — Prerequisites

| # | Prerequisite | Confirm by | If missing |
|---|---|---|---|
| 1 | Dev server running | `python tools/server.py 8099` → `/app/t6.html` loads | Nothing browser-side is verifiable |
| 2 | Chrome or Edge on disk | `node tools/screenshot.mjs --port 8099 --only dashboard` | No pixel evidence; say so |
| 3 | Read `AGENTS.md`, `docs/community/PRIVACY.md`, `docs/community/DUNGEON_CLOSED_TESTER_AGREEMENT.md`, `.agents/contracts/tester-event.schema.json`, `docs/briefs/DUNGEON_MEASUREMENT_AND_JUDGEMENT.md` | You can state what the cohort has consented to today | You will design a dashboard that cannot legally be filled |
| 4 | **Owner decision on the agreement version** — see §3 | Answered | Build Phase 1 only |
| 5 | Access to D1 (or an export of `learner_progress`) | The Control Room reads it today | Build against synthetic fixtures and say the numbers are synthetic |

**Hard constraints:**

- The cohort is **eight approved testers**. Any statistic about *people* is noise at that
  n. Statistics about *items* are not — see §4.1. Design accordingly.
- Never use accuracy alone to judge a tester. Treat anything under ten first attempts on a
  concept as noise. This is a standing project rule and it is in the tester agreement's
  spirit as well as its letter.
- Real learner data is not a fixture. Do not clear `data/state/` or `data/history/`.
- `main` deploys. Branch, and do not merge.

---

## 1 — Half one: check the student experience

This is not a survey. It is an instrumented walk-through with evidence, and it has a
harness already built for it.

### 1.1 Use what exists

- `tools/browser-checks/export-run.js` + `tools/export-learn-run.mjs` produce, per subject,
  a **blind candidate view of a full Learn run** and a key carrying the answers *and the
  per-option feedback a learner is shown after committing*. One read replaces ~390
  navigation calls.
- `tools/export-persona-run.mjs` does the same for the mock papers, sets 1–3, digest-checked
  against the live app.
- `tools/measure-learn-craft.mjs` and `tools/run-persona-strategies.mjs` score the reported
  exploits mechanically.
- `tools/screenshot.mjs` takes 16 shots across 5 screens × 2 viewports × both themes.

### 1.2 The three personas, and what to report

Sit every subject as each of:

- **Average Joe** — normal effort, reads the lessons, records when a "correct" answer was
  actually a guess.
- **Brilliant-but-lazy** — skips every lesson, attacks with craft only.
- **Dumb-but-diligent** — reads every line, memorises glossaries, trusts the app, assumes
  every contradiction is his own fault.

Report the **experience**, not just the score. At minimum, per subject:

1. Where each persona stalled, and on what.
2. **What they were told when wrong.** This is the whole product. Count distinct diagnosis
   cues per run; a run that says the same sentence four times has taught once.
3. What they were told when **right** — is it more than the option restated?
4. Repetition: how many times one sentence appears across a run as an option, a match
   choice, a boss option and a revealed rule.
5. Whether the run reads as a sequence: does step *n* need step *n−1*?
6. Every place the product says something untrue about itself — a count, a promise, a
   status label, a caption.

### 1.3 Add three things the harness does not yet do

- **A keyboard-only pass.** Tab from load to submitting a paper. Every control reachable,
  every affordance that opens on hover also opens on focus, no trap. Nothing about this
  has ever been verified; F-01a was inferred from the absence of a control, not observed.
- **A screen-reader name pass.** For every interactive element on the five main screens,
  assert an accessible name that describes the action. Cheap to automate from the DOM.
- **A returning-learner pass.** Every persona run to date has been a first-time learner on
  set 1. Sit set 1, leave, come back, sit set 2, and sit a re-attempt. The product's
  claims about re-teaching, resume and "Best 100%" have barely been exercised.

### 1.4 Deliverable

`evidence/<date>/<task>/verification.md` with findings continuing the stable ID sequence
(currently **F-50** onwards; `G-14` onwards for things that are good and must be
protected), each naming the persona, the subject, and whether an existing gate could have
caught it. Merge against
`evidence/2026-08-14/t6-three-student-cram-test/verification.md`.

---

## 2 — Half two: the dashboard. Start from the decisions, not from the data.

The owner's question is *"what should I build differently next term?"* — so the dashboard
is organised by decision, and every panel exists because a decision waits on it. **If a
figure does not change a decision, it does not go on the dashboard.** That rule is the
difference between this and an analytics page.

### 2.1 The decisions, and the figure each one needs

| # | Decision facing the next Term | The figure that informs it | Where the data is today |
|---|---|---|---|
| D1 | **How much teaching to author.** 106 lessons cost more than everything else combined. | Share of delivered lessons actually read to the end; median dwell; share of runs where the learner skipped straight to the questions | `profile.lessonsRead` (already synced); dwell needs an event |
| D2 | **Which formats teach.** Numeric free-entry defeated craft where every option format failed. | Per format: facility, discrimination, craft-vulnerability, and **subsequent** performance on the same concept in a different format | `profile.conceptAttempts` (synced) — format is derivable from the question id |
| D3 | **How many items per concept.** The bank treated ~3 families per concept as a ceiling. | Items per concept vs. whether the concept reached Strong; the point where extra items stop moving mastery | Synced |
| D4 | **Whether the mastery model is right.** The eight-gate model, the Strong criteria and the rapid-response band are all product hypotheses. | **Does Strong predict exam performance?** Compare mock scores on concepts marked Strong against Developing and Needs practice | `profile.examAttempts` + `conceptAttempts`, both synced |
| D5 | **Whether re-teaching works.** | For concepts that triggered a re-teach: accuracy before vs. after, against a matched set that did not trigger one | Synced |
| D6 | **How many study sets, and their shape.** Ten sets, eight rungs plus two. | Completion by rung; where the ladder is abandoned; whether set 9 and the practice check are ever opened | `profile.completed` (synced) |
| D7 | **Whether Examiner should be separate content.** | Share of paper marks from items the candidate had already answered in Learn, and the score difference between those and fresh ones | Synced |
| D8 | **What onboarding actually needs.** | Funnel: admitted → agreed → first set opened → first question answered → first set completed → second session | `testers` table + `profile` timestamps |
| D9 | **Which subject needs the work.** | Everything above, split four ways | Synced |
| D10 | **Whether written practice is worth its cost.** | Rubric-criterion pass rates, gap-closure rate, and the marker's agreement with a human read | `writtenPractice` in profile; `written_answer_archive` in D1 |

### 2.2 The one number to lead with

**Does the product's own evidence model predict the exam?** (D4.)

Everything else is diagnostics. This is the validity question, and it is the one that
decides whether next term's engine is a refinement or a rebuild. Put it at the top as a
single figure with its sample size beside it, and state the confidence interval rather
than the point estimate.

### 2.3 Research-grounded principles to build in

- **Frequency and spacing of retrieval beat time on task.** Student-directed retrieval
  practice predicts course performance where time spent does not, and early, frequent
  quizzing predicts higher grades *controlling for time spent quizzing*. So: count
  **retrieval events and their spacing**, and treat any "minutes in app" panel as
  decoration. If you build a time panel at all, build it as *spacing between sessions*.
- **Cohort curves, not totals.** Aggregate totals rise while every cohort decays — which
  is a thing this product literally teaches in BRGSA M3. Apply it to the product itself:
  group learners by the week they were admitted and plot survival, rather than reporting
  "N testers active".
- **Leading indicators, not just lagging.** A mock score is lagging and arrives once. The
  leading indicators are: did they open a second session, did they finish a first set, did
  they meet a re-teach.
- **A dashboard needs a theory.** The 2025 systematic reviews are blunt that dashboards
  without a learning-theory grounding do not change outcomes. The theory here already
  exists and is written down — teach before test, layer concepts, re-teach on error,
  Examiner must not feel foreign. **Every panel names which of those four it is testing.**
- **Predictive panels need a stated intervention.** The recurring finding in the review
  literature is dashboards that predict and then nobody acts. If a panel flags a learner
  or a concept, the panel says what to do about it.

### 2.4 What NOT to build

- Vanity totals: total questions answered, total minutes, total sessions.
- Leaderboards of any kind. Eight identifiable people.
- Anything that reports a per-tester accuracy as a judgement.
- A prediction of a real exam score. The project has never been allowed to claim one and
  this does not change that.
- Real-time anything. This is read weekly.

---

## 3 — The privacy path. The owner has authorised a policy update; here is how to spend it.

**Phase 1 needs no policy change at all.** `learner_progress.state_json` already syncs the
entire profile to D1 and `docs/community/PRIVACY.md` already discloses it. That covers
D1–D10 above at the *outcome* level: attempts, correctness, confidence, coarse duration
bands, mastery states, mock attempts, lessons read, sets completed. **Build the whole
dashboard from this first.** It is available today, it is already consented, and it
answers the lead question in §2.2.

**Phase 2 is the event stream, and it is what the policy update buys.**
`.agents/contracts/tester-event.schema.json` (`1.1`) already defines 60+ fields, banded by
design — `duration_bucket`, `exam_score_band`, `exam_pacing_band`, never an exact mark,
because a cohort of eight makes an exact mark identifying. The app already shapes and
locally buffers events behind a flag defaulting **off**, and **there is deliberately no
transmission path**. What Phase 2 adds that Phase 1 cannot give you:

- *Sequence and timing within a run* — where inside a set someone stops, how long a
  lesson held them, whether they re-read.
- *Abandonment* — Phase 1 only sees completed things.
- *Interaction that leaves no state* — option changes, palette jumps, glossary opens,
  primer skips.

**The order of work, and the cost to flag before starting:**

1. Extend `docs/community/PRIVACY.md` and the tester agreement to name the event stream,
   its purpose, its retention, and its deletion path — in the plain language the existing
   notice uses.
2. **Understand what a new agreement version costs.** The app enforces the accepted
   version, so bumping it sends **every active tester back through the acceptance gate at
   next sign-in**. That has happened before and six testers were found holding a
   superseded version. **The papers are sat 22–23 August.** Interrupting revision week
   with a consent gate is a real cost. Recommend shipping Phase 1 now and timing the
   agreement change for after the exams unless the owner says otherwise.
3. Build retention as machinery, not as a promise. The precedent is already in the
   repository and it is the right one: `written_answer_archive` carries a per-row 92-day
   expiry, a daily `scheduled` cron that purges, explicit deletion on revocation, and a
   per-tester "Delete answers" control in the Control Room. Match it.
4. Build the transmission path with the consent scope enforced **in both directions** —
   an event whose scope does not match its type is rejected. `tools/validate-agent-readiness.mjs`
   already tests exactly that; extend it rather than writing a second check.
5. Keep the flag defaulting off and make activation an explicit, reviewed change.

**Non-negotiable regardless of policy:** no exact marks in events, no free text, no
candidate prose, nothing that identifies a tester inside an event beyond the pseudonymous
`tester_id`, and no collection whose deletion is not implemented on the day it starts.

---

## 4 — How to get real signal from eight people

### 4.1 Analyse items, not people. This is the central move.

Eight testers is almost nothing. **Eight testers × ~800 surfaces is a lot of item-level
data**, and item-level statistics are what improve a bank. Classical test theory gives you
three, all computable from `conceptAttempts` today:

- **Facility (p-value)** — share of learners answering the item correctly. Below ~0.25 on
  a four-option item means it is broken or untaught, not hard. Above ~0.95 means it is
  free.
- **Discrimination** — does the item separate learners who did well overall from those who
  did not? A **negative** discrimination is the strongest signal a bank can produce: the
  people who understand the subject are getting it *wrong*, which almost always means the
  key is wrong, the stem is ambiguous, or a distractor is defensible. **Every negative
  discriminator is a defect ticket.** With n=8 this is directional, not significant — treat
  it as a queue to read, not a verdict.
- **Distractor analysis** — which wrong option pulled, and from whom. A distractor nobody
  ever picks is a wasted option and makes a four-option item a three-option item. A
  distractor that pulls the *strong* learners is a misconception worth teaching to.

Cross this with the craft measurements already in the repo: an item with high facility
**and** high craft-vulnerability is being answered by technique, and that is the pile to
rewrite first.

### 4.2 Say the uncertainty out loud

Every figure carries its n and an interval. A panel that shows "62%" from eleven attempts
and a panel that shows "62%" from four hundred must not look alike. Grey out or
explicitly label anything under the ten-attempt floor rather than hiding it — a hidden
panel reads as "no problem here".

### 4.3 Use the product's own history as a control

The repository records what was believed and when. Several product hypotheses are now
testable against real use — the primer's support-fade thresholds, the eight-gate mastery
model, the 10%-of-expected rapid-response threshold (explicitly provisional), the
practice-shape weights, the confidence-recovery rule. **Add a panel that scores the
product's own stated hypotheses against what happened.** That is the single most useful
artefact for building the next Term.

---

## 5 — Build it as a tool that writes a file, not as a service

- `tools/build-insight-report.mjs` reads a D1 export (or `data/state/` locally), computes
  everything, and writes **one self-contained HTML file** — inline CSS, inline SVG charts,
  no CDN, no fonts, no network. It must open from a file:// URL on any machine and survive
  being emailed.
- It also writes the same figures as JSON beside it, so a later run can diff against an
  earlier one and the report can say *what moved*.
- It takes `--anonymise` (default **on**), which replaces emails with stable pseudonyms
  before anything is computed, so the report can be shared without a redaction pass.
- It refuses to render a panel whose n is zero rather than drawing an empty axis, and says
  which panels it refused and why.
- Charts follow the project's palette tokens and its accessibility rule: state must be
  distinguishable without colour. Reuse `tools/check-palette.mjs`'s findings — the
  four evidence states are shape-distinct for a reason and the report must not undo that.
- Ship a `--synthetic` mode that fills it from generated fixtures, so the layout can be
  reviewed and screenshotted without touching real learner data. Use it for the evidence
  screenshots.

### 5.1 Suggested structure of the report

1. **The headline** — does Strong predict the mock? One number, its n, its interval, and a
   sentence saying what it means.
2. **The ladder** — completion by rung, per subject, and where it is abandoned.
3. **Teaching** — were the lessons read; did reading them change the next answer.
4. **Item quality** — the facility/discrimination scatter, with the negative-discrimination
   items listed by id underneath as a work queue.
5. **Craft** — the measured exploit payoffs beside whether real learners' answer patterns
   look like the exploits.
6. **Re-teaching** — before/after on concepts that triggered it.
7. **Examiner** — overlap with Learn, and the score difference between met and fresh items.
8. **Written** — criterion pass rates and gap closure.
9. **The product's own hypotheses** — each one, what it predicted, what happened.
10. **What this says for the next Term** — the only prose section, written last, three to
    five recommendations each pointing at the panel that supports it.

---

## 6 — Acceptance for this work

| Gate | What it proves |
|---|---|
| `npm test` (78/78 today) plus new tests for the report builder | Nothing regressed; the arithmetic is checked |
| The report renders from `--synthetic` with every panel populated | Layout works before real data touches it |
| The report renders from real data with `--anonymise` on, and contains **no** email, no free text, no exact mock mark | It is shareable |
| Every panel names which of the four product principles it tests | It has a theory, per §2.3 |
| Every figure shows its n | It cannot mislead at n=8 |
| `node tools/screenshot.mjs` of the rendered report at 1280 and 375, both themes | It is readable where it will be read |
| `ui-audit.js` over the report | 0 overflow / clipped / overlaps / sub-44px |
| A written statement of every question the data **cannot** answer | The gaps are known rather than implied |

---

## 7 — Traps specific to this work

- `learner_progress.state_json` is a blob written by the client. Treat every field as
  untrusted and versioned; a profile written by an older build will be missing fields
  added since. Fail a panel loudly rather than computing a wrong average over a partial
  population.
- Mock answers deliberately **never** touch `conceptAttempts`. That is by design — a
  timed, unassisted paper is not the condition the evidence model is calibrated on. Do not
  "fix" it by merging them; it would destroy the only clean comparison the product has,
  which is exactly the D4 headline.
- The rapid-response threshold is provisional and its band is coarse on purpose. Do not
  build a panel that implies millisecond precision.
- Coarse duration bands cannot be averaged into a mean. Report the band distribution.
- Progress loss between sessions has been observed and is not fully explained. Before
  reading any drop-off as behaviour, rule out state loss — a learner whose profile reset
  looks identical to a learner who gave up.
- Do not compute engagement from `updated_at` alone; the profile syncs on write, so a
  quiet learner and a broken sync look the same.
- If a figure surprises you, check the query before believing it. That rule has paid for
  itself repeatedly in this repository, in both directions.

---

## 8 — What to hand back

1. `tools/build-insight-report.mjs`, `tools/shots/` screenshots of the rendered report,
   and the report itself in `outputs/`.
2. `evidence/<date>/<task>/verification.md` — the experience findings from half one, the
   gates from §6, and the "what the data cannot answer" statement.
3. A privacy-notice and agreement diff **as a proposal for the owner to approve**, with
   the re-acceptance cost and the exam-week timing stated plainly. Do not ship a version
   bump without an explicit go-ahead.
4. Ledger updates: `AGENTS.md`, `docs/governance/CHANGELOG.md`,
   `docs/governance/QUALITY-LOG.md`, and `docs/governance/BUG-LAWS.md` for anything hit
   along the way.
5. The three-to-five recommendations for the next Term, written as decisions rather than
   observations.

---

## Sources consulted for §2.3

- [AI-powered learning analytics dashboards: a systematic review](https://link.springer.com/article/10.1007/s44217-025-00964-y)
- [Learning analytics dashboards are increasingly becoming about learning and not just analytics — a systematic review](https://dl.acm.org/doi/10.1007/s10639-023-12401-4)
- [Use of predictive analytics within learning analytics dashboards: a review of case studies](https://link.springer.com/article/10.1007/s10758-022-09613-x)
- [Learning analytics dashboard: a tool for providing actionable insights to learners](https://pmc.ncbi.nlm.nih.gov/articles/PMC8853217/)
- [Student-directed retrieval practice is a predictor of medical licensing examination performance](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4673073/)
- [Do students space their study? (ERIC)](https://files.eric.ed.gov/fulltext/ED616987.pdf)
- [Retrieval practice and spaced learning in an ecologically valid setting](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8793259/)
- [Learning analytics explained: how EdTech platforms measure engagement and outcomes](https://countly.com/blog/learning-analytics-explained-how-edtech-platforms-measure-student-engagement-and-outcomes)
- [North Star Metric framework](https://productschool.com/blog/analytics/north-star-metric)
