# Verification — every promise the product makes, measured against the product

`VERIFIED(REAL_BROWSER + AUTOMATED)` · 2026-08-15 · branch `feat/bank-rehaul-completion`
· not merged, not deployed.

The ask was to measure everything the site was built to do and say whether it delivers.
The promises are taken from the repo rather than invented here — `AGENTS.md`'s statement
of the owner direction:

> a step-by-step system where concepts layer, testing feels connected, mistakes bring
> back the lessons you need, and the Examiner tests what has been taught — *"If Examiner
> feels foreign, that's Dungeon Learn's failure."*

Plus the standing quality floor (the bank cannot be answered by craft, the feedback
teaches) and the owner's standing UI instruction on readability.

Two probes did not exist and were written for this pass:
`tools/browser-checks/exam-repair.js` (T6) and
`tools/browser-checks/regression-reporting.js` (T7). Server port **58108**.

---

## Verdict

| Promise | Verdict |
| --- | --- |
| P1 Concepts layer | **Delivers** |
| P2 Testing feels connected | **Delivers**, with a known prose caveat |
| P3 Mistakes bring back the lessons you need | **Half** — holds in Learn, fails after a mock |
| P4 Examiner tests what has been taught | **Delivers**, bounded by pool arithmetic |
| Bank cannot be answered by craft | **Delivers**, one new leak |
| Feedback teaches rather than repeats | **Delivers** |
| Dashboard reports regressions | **Partial** — detected and acted on, invisible on the row |
| Readability | **Clean except two standing items**, one of which disables a detector |

Three findings are new and none was reachable by any existing gate.

---

## P1 — Concepts layer · delivers

| Probe | Result |
| --- | --- |
| `lesson-layering.js` | `ok: true` — 40 sets, **255 consecutive pairs, 0 descents**, 0 sets out of order |
| `teach-before-test.js` × SPMS / BRGSA / SCLM / IBM | **12 routes each, 0 violations, 0 skipped** |
| T1 `measure-cold-learner.mjs --gate` | 32 scored items, **32 fully taught**, 0 resting on an undefined term |

Re-run against the current delivered order, which matters: the previous evidence for
these was measured before three bank commits and described an order that no longer
existed (see `../t6-persona-rerun/verification.md` §1).

**Caveat, unchanged and not a regression:** the handoff *prose* still promises "the next
lecture" across a skip — **12 sentences on BRGSA, 2 on IBM**. The app mitigates at
runtime with an explanatory note rather than fixing the sentences, and that note was
present in all four run exports.

## P2 — Testing feels connected · delivers

| Probe | Result |
| --- | --- |
| `primer-prediction.js` (LAW-63) | `ok: true` — **16/16 primers**, 0 findings, `answerableFromTheConceptName: []` |
| `weakness-linking.js` | `ok: true` — 0 invented links, 0 unchecked pairs, 0 misreported; both seeded fixtures behave |
| `practice-presets.js` | `ok: true`, 0 findings |
| `written-adaptation.js` | `ok: true`, 0 horizontal overflow; repair → 3 teaching steps → fresh transfer prompt |

A LAW-62 note worth keeping: `primer-prediction.js` run **twice in one page load** reported
`ok: false` with `primersChecked: 2`. That is the documented contamination — rendering a
lesson marks it read in memory — not a defect. Reloaded and re-run, it is 16/16. Any probe
in this family gets one page load.

## P3 — Mistakes bring back the lessons you need · half

The Learn half holds. `reteach-on-failure.js`, all three cases:

| Case | Expected | Found | Pass |
| --- | --- | --- | --- |
| open failure — read, wrong, nothing right since | 1 re-teach | 1 | yes |
| recovered — wrong then right | 0 | 0 | yes |
| discovery — same gap, opened as a study set | 0 | 0 | yes |

**The mock half does not.** New probe `exam-repair.js`, staging 11 missed concepts:

| Case | Expected | Found | Pass |
| --- | --- | --- | --- |
| `sittingCap` | 4 | 4 | yes |
| `worstFirst` | the four heaviest | the four heaviest | yes |
| **`taughtFirst`** | **read 2 / first-contact 2** | **read 0 / first-contact 2** | **NO** |
| `secondSittingMovesOn` | 0 overlap | 0 | yes |
| `missesNeverScore` | attempts unchanged | unchanged | yes |

For the two concepts whose lecture the learner had **already read**, `lessonAt: -1` — the
lesson never enters the queue at all. The learner goes straight back to the question.
For the two at first contact, the lesson arrives ahead of the question exactly as
promised.

`startExamRepair` prints **"Taught first, then tested again"** on that screen, and
`conceptRepairIds` is commented "One concept, several surfaces, taught first". Both are
false for a learner who studied before sitting the mock, which is the intended user.

**Cause established by control, not by reading the code.** Same concept, same
`lessonsRead`, same `examMiss`, plus one wrong `conceptAttempt` after the read:

```
without the conceptAttempt   [ sclm_fit_contrast ]
with the conceptAttempt      [ LESSON:SCLM-M01-L04 (reteach), primer:sclm_fit_primer, sclm_fit_contrast ]
```

`lessonNeedsReteach` reads `attemptsFor()` — `conceptAttempts` — and `recordExamMisses`
writes only `examMisses`, deliberately, because misses "prioritise and never score". The
two stores are disjoint, so the re-teach latch cannot see a mock.

This is the same defect `AGENTS.md` records as fixed on 2026-08-15 — *"`lessonsRead` was a
one-way latch… `startExamRepair` printed 'Taught first, then tested again' on screen. Both
were true only for first contact."* The fix closed the Learn half and left the mock half
open, and no gate covered it because `reteach-on-failure.js` stages the store the mock
does not write.

**Suggested fix (not applied):** let `lessonNeedsReteach` also count an `examMisses` entry
stamped after `readAt`. It is a scheduling change affecting learners, so it is an owner
call.

## P4 — Examiner tests what has been taught · delivers, bounded

| subject | overlap ladder / anyRoute | distinct examiner surface |
| --- | --- | --- |
| SPMS | 68 / 68 | 16/16 |
| BRGSA | 69.2 / 70 | 16/16 |
| SCLM | 80 / 80 | 16/16 |
| IBM | 60 / 60 | 16/16 |

BRGSA Section C: pool 42, drawn 2, **0% overlap** — fully reserved.
`check_exam_readiness.mjs` exit 0. `measurement-evidence.js` on both seeded scenarios
(`measurement-evidence`, `measurement-established-strong`) `ok: true`, with the rapid-response
reason surfacing on the right concepts.

The bound is real and worth stating: 60–80% of paper marks are still drawn from items a
learner could have met in Learn. Part of that is arithmetic (SPMS Section B draws 20 from
a pool of 28), part is slack going unused.

## Quality floor · delivers, one new leak

| Probe | Result |
| --- | --- |
| T3 `run-persona-strategies.mjs --gate` | every mechanical rule at or under its limit |
| T3b `measure-learn-craft.mjs` | all four subjects ≤ 30.6 |
| T5 `measure-persona-regression.mjs --gate` | `noCueOffered: 0` on all twelve runs |
| `measure-self-containment.mjs --gate` | passed |
| `measure-absolute-bias.js` | no family over the 30% threshold |
| `validate_t6_bank.js "<transcripts>"` | **0 errors, 0 warnings**, coverage 4/4 |
| `npm test` | **103/103** |

**The leak:** `measure-name-matching.js` passes its gate, but 25 option sets pay 100% —
up from 23 — and the two additions are newly authored examiner-only reserved items,
`sclm_drivers_cla3` and `spms_requirements_cla1`, both contradicting the authoring rule
in their own header comment. Full working in `../t6-persona-rerun/verification.md` §4.

## Dashboard reports regressions · partial

New probe `regression-reporting.js`. A concept is staged to a genuine Strong record
(5 eligible attempts, 4 correct, 3 types, 2 blocks, integrative evidence), then declined
with two recent wrong answers, then compared against a learner who was **never** Strong
and now has the identical current status.

| Case | Found | Pass |
| --- | --- | --- |
| R1 detected — the state moves back down | Strong → Needs practice | yes |
| R2 reported at subject level | `down`, **"-6 this block"** | yes |
| **R3a distinguished on the open row** | **character-for-character identical** | **NO** |
| R3b distinguished behind "Why" | differ | yes |
| R4 acted on — routed forward | "Practise 1 concepts that need work" | yes |

The momentum chip is honest work: `trendFromCourses` **replays** `evidenceFromAttempts`
at each past block boundary rather than reading a stored counter, so the decline is
computed rather than asserted, and the never-Strong learner correctly shows `flat` /
"16 to go" instead.

What a learner sees on the concept row, though, is this — for **both** learners:

```
Strategic fit   Needs practice   Practise   Lesson
```

Open "Why" and they separate properly — `4 of 7 scored attempts correct · 3 distinct
question types passed · 2 of 2 required practice blocks passed` against `0 of 2 · 0 · 0`.
So the information is present, honest and one click away; it is never *stated*, and the
reader has to infer the loss from retained evidence counts.

**Probe note, recorded because it nearly produced a false pass:** the first version compared
`textContent`, which walks hidden subtrees, so it read the collapsed evidence body and
reported the two learners "differ" — crediting the dashboard for a distinction no one had
been shown. R3 is now split into visible (R3a) and disclosed (R3b).

**Also spotted:** `"Practise 1 concepts that need work"` — unconditional plural at
`app/t6.js` in `setRouteCopy`.

## Readability · clean except two standing items

`ui-audit.js` on the dashboard, `?scenario=dashboard-progress`:

| | 375×812 | 1280×900 |
| --- | --- | --- |
| overflow / clipped / circleFit / overlaps | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| tapTargets / ragged / cutRows / barInset | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| radiiOffScale / density | 0 / 0 | 0 / — |
| page scrolls sideways | no | no |
| `hiddenScroll` | **1** | 0 |
| `typeTooSmall` | **10 (capped)** | **10 (capped)** |

`hiddenScroll` is `#course-grid` showing 355px of 768px — **54% hidden**. Pre-existing,
deliberate (the swipeable subject rail), and already recorded as reported-not-fixed in
both of today's UI evidence files. Unchanged, and still open.

**`typeTooSmall` is the new finding, and it is about the probe.** `ui-audit.js` sets
`TYPE_FLOOR = 12`; `app/t6.css` sets `--t-micro: 11px` and documents it as *"the smallest
thing we ask anyone to read"*. They disagree by one pixel, and nothing reconciles them.
Counted directly, **111 text-bearing elements render at 11px on this one screen**; none
render below it. The reported "10" is the detector's own `.slice(0, 10)`.

So `typeTooSmall` is non-empty on every run of every screen, which means it can never
report a regression — a drop to 10px would land in a list that is already full. Both UI
verification files written today enumerate the classes they found empty and **neither
lists `typeScale`**, so this has been quietly non-empty the whole time. Either the CSS
floor rises to 12 or the probe's floor drops to 11; leaving them disagreeing is the one
option that buys nothing.

---

## Files

```
evidence/2026-08-15/t6-promise-suite/
  verification.md
  t6-exam-repair.json           new probe result + the control that established cause
  t7-regression-reporting.json  new probe result + all three observed dashboard states
tools/browser-checks/
  exam-repair.js                new
  regression-reporting.js       new
```

Node-side gate outputs for this pass are in `../t6-persona-rerun/`.

## 9 — All five fixed, and re-verified

The owner accepted the content block and asked for the findings to be fixed in the same
pass. Everything above is the *before*; this is the *after*, measured the same way.

| # | Finding | Fix | Re-measured |
| --- | --- | --- | --- |
| 1 | mock miss did not re-teach an already-read lesson | `examMissNeedsReteach` counts a miss stamped after `readAt` | T6 `taughtFirst` **read 0/2 → 2/2**, first contact 2/2; whole probe **5/5** |
| 2 | declined concept invisible on the row | `conceptPeakStatus` + `"was Strong"` on the row | T7 **R3a fail → pass**; whole probe **5/5** |
| 3 | type-floor detector inert | floor read from `--t-micro`; count reported beside the list | `typeTooSmallCount` **111 → 7 → 0** |
| 4 | two reserved items name-matchable | R3 repair in `connect`'s direction | **25 → 23** sets paying 100% |
| 5 | `"Practise 1 concepts"` | singular-aware, both sentences | "Practise 1 concept that needs work" |

### What the fixes cost, and what they nearly cost

**The re-teach fix needed a negative case, so one was added.** Counting an exam miss
unconditionally would re-teach that lesson on every sitting for ever — the
"re-teach everything on every slip" product that is worse than never re-teaching. The
RECOVERED rule is now applied to the mock as well: a miss stops counting once the
learner has answered that idea correctly since. `exam-repair.js` gained a second phase
asserting it, because the branch was written in the same edit as the fix.

**`skipped` deliberately does not trigger a re-teach.** Running out of time is a timing
signal, not evidence the idea was lost, and `examMissList` already weights it lower.

**Finding 2's first implementation broke an existing probe.** Nesting the decline inside
`.shelf-state` made its `textContent` read `"Needs practicewas Strong"`, and
`measurement-evidence.js` matches that string with exact equality — so a UI change
would have failed a probe about something else entirely. The status now sits in a
wrapper cell and `.shelf-state` carries the label and nothing else. Both measurement
scenarios re-run `ok: true`.

**Finding 3's fix immediately found what it had been hiding.** With the floor read from
the token, `typeTooSmallCount` fell from 111 to **7** — and those seven were real: SVG
axis labels on the trend chart at 10px, the only type in the product below its own
declared scale. Now on the scale, and the count is **0**.

### Full re-verification

| Gate | Result |
| --- | --- |
| `npm test` | **103/103** |
| `validate_t6_bank.js "<transcripts>"` | `ok: true`, **0 errors, 0 warnings** |
| `teach-before-test.js` × 4 subjects | **12 routes each, 0 violations, 0 skipped** |
| `lesson-layering.js` | 40 sets, **255 pairs, 0 descents** |
| `reteach-on-failure.js` | 3/3 — the Learn loop is unchanged by the mock fix |
| `exam-repair.js` | **5/5** + recovered case |
| `regression-reporting.js` | **5/5** |
| `primer-prediction.js` | 16/16, 0 findings |
| `measurement-evidence.js` × 2 scenarios | both `ok: true` |
| `measure-name-matching.js --gate` | exit 0, **23** sets at 100% |
| T1 / T3 / T3b / T5 / self-containment / absolutes / transfer / readiness | all exit 0 |
| `ui-audit.js` @ 375 and 1280 | every detector **0**, `typeFloor: 11`, except the deliberate `#course-grid` rail |
| paper digests | **unchanged** on all four subjects |

T3's paper rules are byte-identical after the two item edits on all three subjects with
MCQ marks — the repair changed which options name the concept, not their lengths.

---

## Standing after this pass

**Closed:** all five findings above.

**Content acceptance:** `WAITING_OWNER_CONTENT_ACCEPTANCE` is cleared. It clears the gate
that blocked `DONE` and is **not** faculty review — the standing accuracy caveats in
`AGENTS.md` are unchanged.

**Open and unchanged:** `#course-grid` 54% hidden at 375 (deliberate rail, affordance
still an open question); BRGSA's 12 and IBM's 2 handoff sentences promising a skipped
lecture, mitigated at runtime rather than rewritten; 60–80% paper overlap; the 64
summary/application strings. Not merged, not deployed.
