# Verification — the persona suite re-run after the rehauls, and the one thing that moved

`VERIFIED(REAL_BROWSER + AUTOMATED)` · 2026-08-15 · branch `feat/bank-rehaul-completion`
· not merged, not deployed.

The ask was to re-run the persona tests across all four subjects after the rehauls and
say how they differ from the runs recorded under `evidence/`. Baseline throughout is
`evidence/2026-08-15/t6-rehaul-completion/`, with `after-name-matching.json`,
`after-absolute-bias.json` and `after-lesson-handoffs.json` from that directory noted
separately because **they were recorded at 08:24 and never re-run against the two bank
commits that landed after them** (`7947dbd` 16:34, `7b94a7d` 17:05).

- Server: `python tools/server.py`, port **55104**.
- Harness: `evidence/2026-08-15/t6-persona-rerun/persona-harness/` (fresh export).
- Control: `evidence/2026-08-15/t6-persona-rerun/control-oldqueue/` (see §3).

---

## 1 — What was actually stale, and what was not

The working tree's uncommitted changes are `app/t6.css`, `ui-audit.js`, `screenshot.mjs`,
`frame.html` and docs — optical work, no bank content. So the first question was whether
anything the personas measure had moved at all.

**The paper had not.** `node tools/export-persona-run.mjs` into a fresh directory
reproduces all twelve papers with byte-identical digests:

| | set 1 | set 2 | set 3 |
| --- | --- | --- | --- |
| SPMS | `2d3b8628` = | `e393aef8` = | `4ab20a78` = |
| BRGSA | `e0e82430` = | `1e9121d0` = | `151cc4d0` = |
| SCLM | `98287990` = | `6947ec98` = | `1d4a10c8` = |
| IBM | `986eb8a8` = | `6fbb8998` = | `3d5329d0` = |

**The learn half had.** The committed queue skeletons are dated 07:25 and 08:12 —
*before* `533f4bb` (08:29), `7947dbd` (16:34) and `7b94a7d` (17:05). Every learn-side
number in the recorded baseline was therefore computed against a delivered order that
predates the three bank commits it was filed to verify. The `*.learn.json` files were
re-hydrated at 16:56, which mixed new prose onto an old order and made the staleness
harder to see rather than easier.

So the learn runs were re-exported through the real app — one subject per page load,
`localStorage.clear()` between — and `paperDigestMatch: true` on all four.

| subject | queue digest | delivered order |
| --- | --- | --- |
| SPMS | `b527c517` → `4d51c3f8` | moved |
| BRGSA | `ff3339d8` → `b6604398` | moved |
| SCLM | `41549910` → `8c496c68` | moved |
| IBM | `e42c1230` = | unchanged |

What changed in the delivered set-1 runs:

| subject | dropped | added |
| --- | --- | --- |
| SPMS | `spms_jtbd_explain` | `spms_dfv_explain` |
| BRGSA | `BRGSA-M01-L02`, `smoke_signal` | `BRGSA-M01-L06`, `case_validate` |
| SCLM | `sclm_drivers_cla2` | `sclm_drivers_connect` |
| IBM | — | — |

**BRGSA now delivers an integrated scenario.** `case_validate` arrives at step 11 of a
real run. That is the `integrated` rotation slot from `533f4bb` working on the learn
surface for the first time in a measured export — previously it was asserted from the
rotation code and never seen in a delivered queue.

---

## 2 — The gates

Every one exits 0.

| Probe | Result |
| --- | --- |
| T1 `measure-cold-learner.mjs --gate` | 32 scored items, 32 fully taught, 0 resting on an undefined term |
| T2 `measure-lesson-handoffs.js` | identical to baseline |
| T3 `run-persona-strategies.mjs --gate` | every rule at or under its limit |
| T3b `measure-learn-craft.mjs` | all four subjects at or under 30.6 |
| T4 `measure-exam-transfer.mjs --gate` | identical to baseline; 16/16 distinct examiner surfaces on all four |
| T5 `measure-persona-regression.mjs --gate` | every wrong decision offered a cue; `noCueOffered: 0` everywhere |
| `measure-self-containment.mjs --gate` | passed |
| `measure-name-matching.js --gate` | passed — but see §4 |
| `validate_t6_bank.js "<transcripts>"` | `ok: true`, **0 errors, 0 warnings**, coverage 4/4 |
| `check_exam_readiness.mjs` | exit 0 |
| `npm test` | **103/103** |

### T3 — the paper craft ceiling, unmoved

Mean of sets 1–3, % of MCQ marks, chance 25. Every figure identical to baseline, which
is the expected result of an identical paper and is the point of reporting it:

| rule | SPMS | BRGSA | SCLM | IBM |
| --- | --- | --- | --- | --- |
| longest | 20.3 | 23.6 | 13.5 | n/a |
| secondLongest | 21.2 | 21.9 | 16.9 | n/a |
| fixedB | 27.6 | 25.0 | 30.7 | n/a |
| onTopic | 18.1 | 25.0 | 21.2 | n/a |
| noAbsolutes | 24.9 | 23.6 | 25.3 | n/a |
| ethical | 26.7 | 26.0 | 25.2 | n/a |
| combined | 18.1 | 24.4 | 22.7 | n/a |
| combinedWithLength | 11.0 | 28.6 | 21.2 | n/a |

IBM's paper is 10 questions and 100 marks with **zero MCQ marks**, so none of these
rules has a surface on it. `craftCannotReach: 100`.

### T4 — transfer, unmoved

| subject | paper overlap (ladder / anyRoute) | distinct examiner surface |
| --- | --- | --- |
| SPMS | 68 / 68 | 16/16 |
| BRGSA | 69.2 / 70 | 16/16 |
| SCLM | 80 / 80 | 16/16 |
| IBM | 60 / 60 | 16/16 |

BRGSA Section C still 0% overlap on a pool of 42 drawing 2 — fully reserved.

---

## 3 — Separating the bank from the schedule

The learn-side numbers moved, but "the bank changed" and "the delivered order changed"
would both produce that, and they call for different responses. So the old queue
skeletons were re-hydrated against **today's** bank and measured as a control:

- **A** — recorded baseline (old queue, old bank)
- **B** — old queue, today's bank → isolates the bank rehauls
- **C** — new queue, today's bank → adds the schedule change

Every single learn-side movement is **B = A**, and lands between B and C.

T3b learn craft (% of selectable parts, chance 25):

| | rule | A | B | C | cause |
| --- | --- | --- | --- | --- | --- |
| BRGSA | longest | 33.3 | 33.3 | **29.2** | schedule |
| SCLM | noAbsolutes | 20.2 | 20.2 | 20.8 | schedule |
| SCLM | topicMatch | 26.8 | 26.8 | **25.0** | schedule |
| SCLM | combined | 22.0 | 22.0 | **20.2** | schedule |

T5 three-persona regression, movers only:

| run | metric | A | B | C | cause |
| --- | --- | --- | --- | --- | --- |
| SPMS/cold | score% | 15.4 | 15.4 | 7.7 | schedule |
| SPMS/cold | cues | 5 | 5 | 6 | schedule |
| SPMS/careful | cues | 2 | 2 | **3** | schedule |
| SPMS/careful | topShare | **0.600** | 0.600 | **0.500** | schedule |
| BRGSA/cold | cues | 6 | 6 | 5 | schedule |
| BRGSA/crammer | score% | 41.7 | 41.7 | 33.3 | schedule |
| BRGSA/crammer | topShare | 0.286 | 0.286 | 0.375 | schedule |
| SCLM/careful | cues | 3 | 3 | 4 | schedule |
| SCLM/careful | topShare | 0.500 | 0.500 | 0.429 | schedule |

`SPMS/careful` was sitting **exactly on** the 0.60 top-cue limit in the baseline and is
now 0.50, on more wrong decisions (5 → 6). That is the only floor anything was touching.

The finding worth keeping is the negative one: **the bank rehauls did not change the
learn side of any subject.** That is consistent with what they claimed — the 44 reserved
items are `examOnly` and hard-excluded from Learn, so an additive examiner slice should
be invisible here, and it is. But it also means the 23 distractor rewrites from
`7947dbd` did not land on a single item that set 1 delivers, so nothing in the craft
work is exercised by the learn-side probes.

### T1's standing finding is no longer covered

`smoke_signal` — the item that produced T1's new defect class, whose answer used
"prospects" from a lecture it does not cite — **is no longer delivered in BRGSA set 1**.
It reads `ok: true` in the recorded baseline, so nothing regressed. But T1's coverage of
it is now zero, and a fix that is only ever confirmed on a run that no longer contains
the item is not confirmed by that run. Worth a targeted check rather than trusting the
32/32.

---

## 4 — What actually regressed: two reserved items are name-matchable

This is the one substantive difference, and the stale-baseline problem is how it stayed
hidden. `after-name-matching.json` was written at 08:24; the bank has grown by 26 option
sets since.

```
                     baseline (08:24)      today
option sets                    1049         1075
100%-paying sets                 23           25
family "other"        29.8% / 13      29.5% / 15
family "boss"         29.6% / 10      29.1% / 10
```

Re-running the same tool against the bank as of `533f4bb` and diffing the id lists gives
exactly two additions and no removals:

- `SCLM:sclm_drivers_cla3`
- `SPMS:spms_requirements_cla1`

Both are **newly authored examiner-only reserved items** from `7b94a7d` — their ids are
generated (`concept + "_cla" + counter`), which is why neither string appears in that
commit's diff.

The rule is `argmax` over content words of the concept's `node` name. For
`sclm_drivers_cla3`, concept **"Six supply-chain drivers"**:

```
[   0  ] Whichever option costs least should be chosen, since each of them reaches …
[ANSWER] They are three different drivers of the same outcome, and the choice is a …
[   2  ] The warehouse option is the one that counts, because delivery time is …
[   3  ] The transport change is always the best of the three, because moving faster …
```

The answer is the **only** option containing "drivers". A candidate who reads the section
heading and nothing else scores it.

For `spms_requirements_cla1`, concept **"Functional and quality requirements"**, the
answer is the only option naming all three of *functional* / *quality* / *requirements*;
the three distractors each name two.

This contradicts the authoring rule stated in these items' own header comment at
[app/sets/t6_challenges.js:1612](app/sets/t6_challenges.js:1612):

> …no option names the concept either — R3 is satisfied on the "none of them" branch,
> which is what keeps the name-matching family inside its limit.

**The gate cannot see it.** `other` is 144 sets, so two items paying 100% move the family
from 29.8% to 29.5% — *down*, because the other 24 new sets dilute it — and the 32% limit
holds. `--gate` exits 0. This is the repository's own recurring shape: a per-family
aggregate passing while individual items leak, the same reason `boss` went unmeasured for
three sessions.

Not fixed here, because it is authored prose on items that are already
`WAITING_OWNER_CONTENT_ACCEPTANCE`. Two candidate responses, both owner calls:

1. Rewrite the two answers so the naming is not unique — the `connect` direction, which
   is the pattern the rest of the bank follows.
2. Add a per-item assertion to `tests/examiner-slice.test.mjs` so a reserved item that
   pays 100% fails on its own rather than inside a family average.

---

## 5 — F-06, unchanged and diluted

`measure-absolute-bias.js`, 1064 → 1090 option sets. No family over the 30% threshold.

| family | questions | eliminationPayoff |
| --- | --- | --- |
| boss | 480 = | 23.6 → 23.7 |
| authored | 120 → 146 | 23.7 → **25.7** |
| case_cloze | 128 = | 22.2 → 23.1 |
| contrast | 64 = | 24.0 = |
| bridge_cloze | 64 = | 27.0 = |
| repair_cloze | 64 = | 26.0 = |
| explain | 48 = | 16.5 = |
| apply | 48 = | 20.0 → 22.0 |
| connect | 48 = | 20.1 = |

`authored` grew by the 26 new reserved items and its payoff rose 2 points to just above
the 25% chance line — the largest single move in this pass, still 4.3 points under the
threshold. `apply`, `case_cloze` and `boss` moved on identical question counts, which is
the `7947dbd` distractor rewrites showing up where they were aimed.

---

## 6 — Files

```
evidence/2026-08-15/t6-persona-rerun/
  persona-harness/            fresh paper + learn export, 4 subjects
  control-oldqueue/           old queue order hydrated against today's bank
  t1-cold-learner.json        + .txt
  t2-lesson-handoffs.json
  t3-paper-strategies.json    + .txt
  t3-learn-craft.json
  t4-transfer.json            + .txt
  t5-persona-regression.json  + .txt
  control-t1-cold-learner.json / control-t3-learn-craft.json / control-t5-*.json
  name-matching.json          + name-matching.detail.json
  absolute-bias.json
  self-containment.json       + .txt
  validate.json
  exam-readiness.txt
  npm-test.txt
```

---

## 7 — Three follow-up claims, checked separately

Asked afterwards whether concepts layer, the dashboard reports regressions, and mocks
strengthen weak points. None of those is answered by §2–§6, so they were checked on
their own. Server port **62353**.

**Layering — re-verified, and it needed to be.** `lesson-layering.js` and
`teach-before-test.js` were *not* re-run in the last three commits, and §1 showed the
delivered order moved in three of four subjects. The recorded "0 descents" therefore
described an order that no longer exists. Re-run against the current one:

| Check | Result |
| --- | --- |
| `lesson-layering.js` | `ok: true` — **40 sets, 255 consecutive pairs, 0 descents, 0 sets out of order** |
| `teach-before-test.js` SPMS | 12 routes, 0 violations, 0 skipped |
| `teach-before-test.js` BRGSA | 12 routes, 0 violations, 0 skipped |
| `teach-before-test.js` SCLM | 12 routes, 0 violations, 0 skipped |
| `teach-before-test.js` IBM | 12 routes, 0 violations, 0 skipped |

The pair count moved 257 → **255**, which is the queue change from §1 showing up.

Caveat: layering asserts *question* order (last cited lecture, non-decreasing) and
lesson order follows by construction. The handoff **prose** is a separate matter and is
unchanged — T2 still reports **12 broken promises on BRGSA and 2 on IBM**, sentences
promising "the next lecture" across a skip. The app mitigates that at runtime with an
explanatory note rather than by fixing the sentences, and the note was visible in all
four exports in §1.

**Dashboard regression reporting — not measured, by anything.** There is no probe for it
in `tools/`, and `app/t6.js` carries no regression surface beyond the four mastery labels
(`Not started` / `Needs practice` / `Developing` / `Strong`). Naming hazard worth
recording: **T5 is `measure-persona-regression.mjs`, which is regression *testing* — a
deterministic re-run compared against a baseline. It says nothing about whether the
dashboard tells a learner they have slipped.** No claim either way is supported.

**Mocks strengthening weak points — half verified.** `reteach-on-failure.js`, all three
cases, re-run today:

| Case | Expected | Found | Pass |
| --- | --- | --- | --- |
| open failure — read, wrong, nothing right since | 1 re-teach | 1 | yes |
| recovered — wrong then right | 0 | 0 | yes |
| discovery — same gap, opened as a study set | 0 | 0 | yes |

That is the **Learn** loop, driven by `conceptAttempts`. The **mock** loop is a different
path — `examMisses` → `conceptRepairIds` → `startExamRepair`, which prints "Taught first,
then tested again" — and **no probe follows a mock miss through to remediation**.
`reteach-on-failure.js` stages `conceptAttempts`, not `examMisses`. So the mock→repair
loop is asserted in code and has never been measured end to end.

Two things bear on how good that signal is even once it fires. In its favour, T4 gives
16/16 concepts a distinct examiner surface on all four subjects, so a miss is a real gap
rather than a failure to recall a studied item. Against it, paper overlap is still
**60–80%** (SPMS 68, BRGSA 69.2, SCLM 80, IBM 60), so most of what a mock tests is
material the learner could already have met — part arithmetic from pool sizes, part
slack going unused.

---

## 8 — Standing after this pass

**Closed by measurement:** the learn half of the persona suite is no longer measured on a
stale order; BRGSA's integrated slot is confirmed in a delivered run.

**Open and new:** `sclm_drivers_cla3` and `spms_requirements_cla1` pay 100% on
name-matching against their own authoring rule, and no gate reports it per item.

**Open and unchanged:** no second reader on any of the 44 reserved items, 14 rewritten
stems or ~60 adjusted distractors; BRGSA Sections A and B at 88.3%/100% ladder overlap;
SCLM's match-prompt warning; the 64 summary/application strings. All new content stays
`WAITING_OWNER_CONTENT_ACCEPTANCE`. Not merged, not deployed.
