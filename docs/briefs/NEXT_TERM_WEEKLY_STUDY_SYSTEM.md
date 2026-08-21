# Dungeon next term — the weekly study system

Status: product direction for next-term design; not implemented in the current exam-season build.

Decision date: 2026-08-22

## Remember this in 30 seconds

Dungeon should stop behaving primarily like somewhere a student visits when the exam becomes urgent.
Its normal unit should be **one academic week**.

Each week gives the student one coherent route:

> **Learn the assigned material → retrieve it without help → test it under held feedback → repair
> what broke → close the week with evidence.**

Learn and Examiner are not separate products in that route. Learn creates understanding and repairs
mistakes; Examiner independently checks whether the understanding holds. Quick Notes opens the exact
source passage needed by either one.

The three exam horizons remain, but sit on top of the weekly system:

- **Full mocks** are periodic exam-condition milestones once enough of the course has been taught.
- **Speedrun** is the final seven-day coverage-closure plan for one subject, relative to that
  subject's exam date.
- **Minis** are the final 25–30-minute retrieval pass immediately before the paper.

The product promise is not “Dungeon predicts that you will pass.” It is:

> **You can see what this week required, what evidence you produced, what still needs repair, and
> exactly what to do next.**

The most important design constraint: **do not add another dashboard or another menu.** Make the
week the organising object behind the three existing surfaces, and show one next action at a time.

## The fundamental reframing

Today's product is organised mainly by subject, run and distance to the exam. Next term should add a
calendar-shaped curriculum layer above those mechanics:

```text
Term plan
└── Academic week
    ├── assigned lessons and readings
    ├── concepts introduced or revisited
    ├── Learn blocks
    ├── one held-feedback Examiner checkpoint
    ├── repairs and delayed confirmations
    └── a truthful close state
```

The week references existing lessons, concepts, questions and evidence. It must not duplicate their
content or invent a second mastery system.

### What changes about the surfaces

| Surface | Next-term job |
| --- | --- |
| **Learn** | Read, understand, practise with teaching feedback, and repair evidenced mistakes. |
| **Examiner** | Run the week's independent checkpoint, periodic cumulative checks, Full mocks, final-week Speedrun and pre-exam Minis. |
| **Quick Notes** | Open the precise reading or numerical scaffold required by the current weekly task; remain searchable and printable. |

Examiner should therefore open on **This week's check** during the term, not on a catalogue of
papers. The full catalogue can remain available as a secondary view.

## The weekly contract

A week is a finite playlist across all enrolled subjects, not four separate dashboards the learner
must coordinate manually.

### Default rhythm

The system should support different timetables, but its default rhythm can be:

| Moment | Student action | Product behaviour |
| --- | --- | --- |
| **Start** | Read the week's lessons and do a brief recall after each cluster. | Learn opens the exact reading, then a low-stakes retrieval check. |
| **Middle** | Apply and connect the new ideas. | Learn mixes current material with a small sample of prior-week concepts. |
| **Close** | Sit one short held-feedback checkpoint. | Examiner samples the week's material cumulatively and withholds feedback until submission. |
| **Repair** | Fix only what the checkpoint exposed. | Learn creates a bounded repair route with a fresh question family. |
| **Leave** | Review the close state and next appointment. | Dungeon says what is secure, what carries forward and when to return. |

A default week should fit into roughly **three appointments of 20–35 minutes**, but the unit of
planning is available minutes rather than a fixed number of sessions. A student with two long
blocks and a student with five short blocks should be able to cover the same contract.

### A week is “secure enough to move on” only when

1. every scheduled lesson has been opened and followed by an active-recall action; scrolling or
   leaving a tab open is not treated as proof of reading;
2. every new concept has at least one scored retrieval after its teaching surface;
3. the held-feedback weekly checkpoint is complete;
4. mistakes that expose a governing misconception have a repair scheduled or completed;
5. the week includes a small cumulative sample from earlier material;
6. the close screen names any carryover debt instead of hiding it behind a completion badge.

This is a weekly workflow state, not a new evidence rank. **Strong** retains its existing guarded
meaning, including multiple formats, separate blocks, transfer and delayed retrieval.

### The consistency dividend

Dungeon should reward consistency by giving a prepared student **less unnecessary work**, not by
building another currency or punishing a broken streak.

- Current Strong evidence removes redundant drills from the weekly route.
- A clean checkpoint produces a lighter repair block.
- Delayed retrieval that holds reduces final-week load.
- Missing a day replans the remaining week; it does not erase a streak or manufacture guilt.
- The durable status is “weeks secured” and “carryover closed,” not consecutive login days.

The reward for studying on time is that revision becomes shorter and calmer later.

## One home screen, not more information

The weekly model should solve the information-density problem by changing the order of disclosure.

### First screen: only what the student needs now

The home screen should contain:

1. **This week** — date range, a plain status and one finish line;
2. **Next action** — action, subject, estimated minutes and why it is next;
3. **Week strip** — Learn → Check → Repair → Close, with the current stage marked;
4. **Subject switcher** — compact after selection, preserving the current fold behaviour;
5. one quiet disclosure for the full week plan and one for longer-term course progress.

It should not simultaneously show a run catalogue, mock catalogue, concept table, charts,
notifications, resources and term totals. Those remain reachable through progressive disclosure.

### The same vocabulary everywhere

Use four verbs across Learn, Examiner, notifications and results:

- **Learn** — supported reading and first practice;
- **Check** — held-feedback independent retrieval;
- **Repair** — targeted teaching after evidence of a gap;
- **Close** — the week's truthful handoff.

Avoid making students translate between “run,” “set,” “round,” “checkpoint,” “route” and “quest”
when those labels describe the same weekly movement.

### Results should collapse, not expand, the decision

Every completion screen should answer only:

- What changed?
- What remains open?
- What is the next appointment?

Deep evidence, rubrics and question history can remain inspectable without competing with those
three answers.

## Examiner inside the term

Examiner needs more than final papers, but it should remain the place where support is withdrawn.

### Weekly checkpoint

The default checkpoint should be short enough to repeat every week and different from a coached
Learn run:

- held feedback until submission;
- no primers or answer spines while answering;
- questions only on material already taught;
- a suggested composition of **60% current week, 30% previous weeks and 10% foundational links**;
- at least one application or transfer item when the source supports it;
- a result that diagnoses readiness without predicting a mark.

The exact mix should flex when a week introduces very little material or when a prior misconception
is still open. The percentages are composition defaults, not learner-visible scientific precision.

### Periodic cumulative checkpoints

Every third or fourth week, the normal checkpoint can widen rather than creating a new product:

- more prior-week retrieval;
- cross-module connections;
- one longer written or numerical response where the subject requires it;
- explicit comparison with the learner's previous evidence, never cohort ranking.

### Full mocks

Full mocks become milestone events, not weekly homework. Offer them only when enough relevant
material has been taught and there is time to repair the result—normally at least seven days before
the paper. Their feedback remains held until submission and their misses feed Learn's next repair
route without changing mastery directly.

## Speedrun: seven-day coverage closure

Speedrun should remain distinct from the weekly term rhythm. It activates **seven days before each
subject's own exam**, because four papers may have different dates.

Its promise is not “do random short questions every day.” It is:

> **Across seven days, deliberately touch the complete examinable concept set, revisit the weak
> evidence, practise the real response shapes and finish with no invisible coverage hole.**

### Suggested seven-day arc

| Relative day | Purpose |
| --- | --- |
| **D−7** | Baseline map: what is Strong, stale, weak or untouched; build the seven-day route. |
| **D−6 to D−4** | Close coverage gaps by module and concept importance; teach immediately after each response. |
| **D−3** | Cumulative application and cross-module transfer. |
| **D−2** | Full or shortened paper-condition checkpoint, depending on time and subject format. |
| **D−1** | Repair only the remaining high-cost gaps, then stop early enough to protect sleep. |
| **Exam day** | Offer the Mini, not another Speedrun. |

“Everything covered” must mean every concept receives an appropriate retrieval touch across the
cycle—not that every bank question is served. Weak and stale concepts receive more than one touch;
current Strong concepts receive the minimum needed confirmation.

If a day is missed, Dungeon should recompute the remaining route by marks risk, concept importance,
staleness and unresolved misconceptions. It should never stack two days into an impossible wall of
work.

## Minis: the final 25–30 minutes

Minis remain a deliberately small pre-paper tool:

- touch all eight modules through eight objective decisions;
- mix single-choice with the subject's rapid numerical, matching or multi-select forms;
- correct every answer immediately with the governing rule and near-miss distinction;
- keep paper alignment and last-minute traps available only when requested;
- end with a calm “carry these into the room” list.

Minis should not introduce new concepts, open lengthy remediation, produce a readiness percentage,
or create Strong evidence. They are an orientation and retrieval surface, not another exam.

## Notifications without nagging

Notifications should be an optional delivery layer over the weekly plan. The product must still
work perfectly when every notification is disabled.

### Notification events worth having

1. **Weekly plan ready** — one message with the week's total time and first action.
2. **Appointment reminder** — only for a time the student chose.
3. **Checkpoint available** — after the required Learn work is complete.
4. **Week at risk** — one actionable message when unfinished work can still realistically fit.
5. **Repair due** — for a delayed confirmation, not immediately after every mistake.
6. **Speedrun begins** — seven days before that subject's exam.
7. **Mini available** — once, shortly before the paper, only if the student opted in.

Every message must state the action and its estimated duration. Completed work cancels its pending
reminders.

### Learner controls and safety

- explicit opt-in per channel;
- chosen study days and quiet hours;
- timezone-aware delivery;
- a weekly frequency cap;
- snooze, reschedule and “not this week” without penalty;
- no public streaks, shame copy or false urgency;
- no academic detail in lock-screen text unless the student opts into it;
- one-click path to the exact task, not the dashboard in general.

### Sensible delivery order

1. in-app weekly inbox and calendar export;
2. opt-in email;
3. browser push only after permission, delivery and unsubscribe behaviour are tested;
4. WhatsApp only through a legitimate opt-in service and clear operational ownership—never by
   pretending the existing community reminder can verify or automate messaging.

## What to deepen

The strongest next-term expansion is depth across time, not more content surfaces.

### 1. Curriculum scheduling

Author a term manifest containing:

- academic week and date range;
- subject and module;
- lecture/lesson IDs released that week;
- concepts introduced, revisited and assumed;
- estimated reading and practice time;
- checkpoint specification;
- subject exam date and any blackout/holiday dates.

The manifest references the existing catalogue. A rescheduled lecture should change one calendar
record, not require rewriting lessons or question sets.

### 2. Retention across real gaps

Make delayed evidence part of the weekly close and next week's opening. A concept should be
recalled after sleep and again in a later week before Dungeon describes it as retained. The
existing Same-day / Retested later / Refresh due qualifiers already supply the right foundation.

### 3. Reading that produces retrieval

Break long lessons into meaningful reading stops with one recall or explanation action—not a quiz
after every paragraph. Record completion only after the action. Preserve the complete lesson and
printable Notes for students who prefer uninterrupted reading.

### 4. Carryover debt

An unfinished week should create a small, prioritised carryover lane. Cap how much can roll into the
next week; when the cap is exceeded, Dungeon must replan or ask the student to choose what to defer
rather than silently making the plan impossible.

### 5. Honest workload estimates

Estimate reading from authored lesson length and testing from actual response shapes. Compare
estimate with broad completion bands, not invasive exact-second telemetry. Recalibrate the next
week when a student's ordinary blocks consistently run long.

### 6. Authoring and quality gates

Next-term content is not schedulable until:

- the lesson exists and is source-grounded;
- every tested concept is taught before the checkpoint;
- the week fits its declared time budget;
- current and cumulative checkpoint pools can fill;
- answer feedback is complete;
- a missed week and an exam-date change both replan deterministically;
- no lesson, concept or examinable idea becomes readable-only or invisible to testing.

## What to broaden—and what not to broaden yet

Useful breadth after the core weekly loop works:

- multiple term calendars and subject-specific exam dates;
- timetable import or `.ics` export;
- accessibility and low-bandwidth/offline reading;
- owner tools for moving a lecture between weeks and previewing workload;
- a student-facing term map showing secured, current and upcoming weeks;
- an optional weekly summary export the student can share with a tutor.

Do **not** begin with social feeds, competitive leaderboards, cohort rankings, instructor analytics,
AI-generated weekly plans, more currencies, or another navigation surface. They broaden operations
before the central promise has been proven and recreate the density problem in a new form.

## Minimal data model

The durable new object is a weekly plan, not another copy of the course:

```js
WeeklyPlan {
  id,
  termId,
  weekIndex,
  startsAt,
  endsAt,
  examDatesBySubject,
  availableMinutes,
  lessonIds,
  conceptIds,
  checkpointSpec,
  appointments,
  status,            // planned | learning | check_due | repair | secure | carried
  evidenceAtOpen,
  evidenceAtClose,
  carryoverConceptIds
}
```

Lesson, concept, question and evidence records remain authoritative in their existing stores. The
plan holds references and scheduling state only.

## Recovery paths the design must handle

- student joins in week 4;
- one or several weeks were missed;
- a lecture is cancelled, delayed or released late;
- the student has only half the expected time;
- one subject is far behind while others are secure;
- the exam date moves;
- the student completes the week's work early;
- the student is offline when an appointment is due;
- notifications are denied or ignored;
- a checkpoint exposes that reading did not become retrievable knowledge.

The answer should always be a smaller revised plan, never a red wall of overdue tasks.

## Persona acceptance tests

Keep the current personality audit and add weekly-system versions:

### Brilliant-but-lazy

- cannot close a week by merely opening lessons;
- cannot game checkpoints by answer position, length or repeated questions;
- receives a short route when evidence is genuinely strong, so shortcut-seeking is not punished
  with pointless volume.

### Average Joe

- always sees one next action, its duration and why it matters;
- can leave after any block and resume without reconstructing the plan;
- receives plain explanations when a week is not secure.

### Dumb-but-diligent

- cannot spend hours over-drilling already secure concepts;
- reaches a visible stop state;
- is protected from an ever-growing carryover backlog.

### Add two operational personas

- **Inconsistent but returning** — misses days, returns, and receives a realistic replan rather
  than a punishment.
- **Quiet high performer** — finishes early, receives delayed confirmations and is released from
  redundant work rather than being given infinite extras.

## Success measures

Measure whether the system reduces uncertainty and supports retention:

- percentage of weeks with a completed held-feedback checkpoint;
- percentage of newly taught concepts retrieved again after at least one sleep and in a later week;
- carryover created versus carryover closed;
- checkpoint gaps repaired before the next cumulative checkpoint;
- plan estimate bands versus observed completion bands;
- notification opt-in, snooze and disable rates;
- Speedrun coverage reached before each paper;
- student answer to “Do you know what to do next?”

Do not optimise raw logins, notification clicks, time in app or streak length. Those can rise while
learning quality falls.

## Build sequence

### Phase 0 — map one real term

Create the weekly manifest for one completed term using the actual lecture-release and exam
calendar. Measure workload before designing screens.

### Phase 1 — weekly orchestration, no notifications

Build the weekly plan and one-next-action home over the current Learn, Examiner and Notes content.
Prove resumption, carryover and reduced-density behaviour first.

### Phase 2 — weekly and cumulative checkpoints

Add held-feedback weekly checks, close states, repair handoffs and evidence snapshots. Run the five
personas over complete multi-week simulations.

### Phase 3 — opt-in reminders

Start with in-app reminders and calendar export, then email. Add quiet hours, caps, cancellation and
delivery observability before browser push.

### Phase 4 — relative exam clock

Generate per-subject seven-day Speedruns from the term's accumulated evidence. Keep Minis as the
exam-day endpoint and Full mocks as scheduled milestones.

### Phase 5 — pilot and tune

Pilot with a small cohort for at least four academic weeks. Review workload, false reassurance,
carryover, notification fatigue and whether students can explain the Learn/Examiner relationship.

## Decisions to settle before implementation

1. Who owns the official weekly lecture/exam calendar and its changes?
2. What is the default weekly time budget, and may students change it freely?
3. How long should the default weekly checkpoint be by subject format?
4. What carryover cap forces a replan?
5. Which notification channel is operationally supportable next term?
6. Does “week” follow the institution's calendar, the student's chosen start day, or both?
7. At what taught-coverage threshold does a Full mock become useful rather than discouraging?

## Prompt for a future ChatGPT/Codex session

Paste or reference this file and say:

> Read `docs/briefs/NEXT_TERM_WEEKLY_STUDY_SYSTEM.md` and the current Dungeon status. Remind me of
> the weekly Learn → Check → Repair → Close vision, identify what is still only proposed, and help
> me decide or implement the next unchecked phase without expanding information density.

## Final product test

A student should be able to say:

> “Every week Dungeon gives me the reading, checks whether I can actually use it, fixes the gaps and
> tells me when I can stop. By the final week I am closing coverage, not discovering the course.”

If the product cannot make that sentence true without opening several dashboards, the weekly system
is not finished.
