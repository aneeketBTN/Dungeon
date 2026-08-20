# Verification — IBM module 2 finished, and the browse surface the plan said did not exist

`VERIFIED(REAL_BROWSER + AUTOMATED)` · 2026-08-18 · branch `fix/theme-switch-and-login-theming`
· not merged, not deployed.

The task was "follow the teaching layer plan and continue authoring". Module taken: **IBM module
2**, its last seven lectures, which completes the module. Server port **8099**, checks run on
`http://127.0.0.1:8099` so the owner's `localhost` session could not be touched.

The authoring is the smaller half of this file. The larger half is that the plan's §0 rests on a
factual claim about the app that is **wrong**, and the correction changes what this work is worth.

---

## Verdict

| Claim | Verdict |
| --- | --- |
| Seven lessons authored for IBM-M02-L11 … L17 | **Yes** — module 2 is 17 of 17, file 157 → 164 |
| Every figure and glossary term verified against the source | **Yes** — 41 terms + 68 figures grepped before writing; 0 validator vocabulary warnings on the new lessons |
| These lessons reach nobody, as the plan states | **No** — they render today in a browse surface logged since 2026-08-12 (I50) that the plan says does not exist |
| The new prose matches the shipped house style | **Not at first** — all seven `worked.because` fields were longer than all 157 existing ones; corrected |
| LAW-47 still holds | **Yes** — 12 routes × 4 subjects, 0 violations, 0 skipped |

---

## What was authored

| lecture | lesson title |
| --- | --- |
| `IBM-M02-L11` | Three healthcare models, three A's |
| `IBM-M02-L12` | What the education numbers actually say |
| `IBM-M02-L13` | Why the market skips the market it is largest in |
| `IBM-M02-L14` | The demand side: why families ration education |
| `IBM-M02-L15` | Gyanshala: separating design from delivery |
| `IBM-M02-L16` | Three more models, and the skills-versus-education choice |
| `IBM-M02-L17` | Why cross-subsidy does not transfer to a classroom |

IBM module 2 is now **17 of 17**. The lesson file is **157 → 164**. IBM's remaining backlog is
**46 → 39** lectures, all in modules 3 to 8.

---

## D1 · The plan's §0 contradicted a ledger entry five days older than itself

**This is documentation drift, not a discovery.** The browse surface was built, verified and logged
on **2026-08-12** as `QUALITY-LOG.md` **I50** — "a `Read the lessons` dashboard tab listing every
lecture per subject, expandable to the full lesson, each labelled *Taught in practice* /
*Read-only* / *No lesson yet*", including the check that reading there does not write
`profile.lessonsRead`. The authoring plan was written on **2026-08-17** and asserted the opposite.
I inherited that assertion and worked under it until protocol Step 5.3 — "open one newly authored
lesson and read it as a learner would" — made me look at the app, where it should have been
impossible.

`tools/check_lesson_file.mjs` carried the same stale claim in its header comment and its warning
string ("so they are never delivered"), written for I49 on 2026-08-12 and made obsolete by I50 the
same day. Nobody updated it, so the tool has been telling every author since that this work is dead.
Both are now corrected.

The rest of this section is the measurement that settled it.

`docs/briefs/TEACHING_LAYER_AUTHORING_PLAN.md` §0 states:

> There are exactly two consumers of `window.T6_LESSONS` in `app/t6.js`: `layeredQueue()` and
> `lessonVocabulary(question)`, and both key off a question's `sourceIds`. **There is no browse or
> library view.**

and concludes that all 130 queued lectures are "authored, validated, shipped in the bundle, and
never shown to a learner", with the note that *if* delivery ever became the goal, the cheaper path
would be "a browse surface (unlocks all 180 at once)".

There is a third consumer. `renderLessonIndex()` at `app/t6.js:2166` populates `#lesson-index`,
which sits inside a `<details>` disclosure on the dashboard headed **"Read the lessons"**
(`app/t6.html:376`). It renders *every* authored lesson for the selected subject, and it already
has a status vocabulary for exactly this case — `app/t6.js:1941` returns
`{key: "readonly", label: "Read-only — no question cites this"}`.

Measured in the running app rather than read off the source, IBM selected:

| Probe | Result |
| --- | --- |
| Disclosure opens and renders | yes, **106,661 characters** of lesson content |
| Per-lesson disclosures in the index | **39** — one per authored IBM lesson |
| New lesson titles present | **7 of 7** |
| Coverage line | "16 taught in practice · **23 readable here only** · 100% of the syllabus" |
| Full body rendered, not just titles | yes — objective, explainer, worked example, glossary and handoff all confirmed by string probe |

Seven probes into the rendered text, one per field type, all hit: the L15 figure
"331 room schools serving 8,000 children", the L15 `because`, the L15 glossary term
"non-routine component", the L11 objective, the L12 worked setup, the L17 `connects`, and the L16
gloss "Bunker Roy's Tilonia model".

**So the premise is inverted.** The owner's 2026-08-17 decision to author uncited lectures was
recorded as buying *continuity only*, at the price of work no learner sees. In fact the work is
readable the moment it is authored — read-only, correctly labelled, reachable from the dashboard.
This does not change scored coverage, and `layeredQueue()` still never schedules them; it changes
only the claim that nobody can read them. The decision stands a fortiori, but it was taken on worse
information than the repository already held.

Corrected in four places: the plan's §0 and §6, the protocol's §0 and subject table, and
`check_lesson_file.mjs`'s comment and warning string. The warning now reads "never scheduled into a
run (they remain readable in the lesson index)".

**The lesson worth keeping:** a brief written to be self-contained is a second source of truth, and
this one drifted from the ledger within five days and then propagated into a session's working
assumptions. The existing guard — "a comment asserting an invariant is not the invariant" — covers
code comments. This is the same failure one level up, in a document whose whole purpose was to let a
fresh session skip reading the ledgers.

---

## D2 · My own prose was outside the house style, and the probe found it

`ui-audit`'s `density` detector fired on four paragraphs at 1280, all of them my `worked.because`
fields. The question is whether that is a defect or the shape of the field — the plan calls
`because` "the longest field", and **81 of the 157 existing lessons** already exceed the detector's
260-character threshold, so the threshold alone proves nothing.

Measured against the existing distribution instead:

| | min | median | max |
| --- | ---: | ---: | ---: |
| 157 existing lessons | 62 | 274 | **521** |
| my 7, as first written | 618 | 712 | **763** |

All seven of mine were longer than **every one** of the 157 shipped lessons, and occupied the top
seven slots in the entire file. That is a real drift from "indistinguishable from the ones already
shipped", introduced by me, and it was rewritten rather than argued away:

| | min | median | max |
| --- | ---: | ---: | ---: |
| my 7, after rewrite | 460 | 486 | **508** |

The longest `because` in the file is once again a pre-existing lesson (`IBM-M02-L06`, 521). My
seven now interleave with the shipped ones. No reasoning was dropped — each field keeps its
argument; the restatements and trailing summaries went.

**The threshold was deliberately not chased to zero.** Cutting `because` under 260 characters would
break the field's stated purpose ("the reasoning, not a restatement") and make the new lessons
distinguishable in the other direction. The standard applied is the existing range, not the
detector's generic floor.

---

## D3 · Source fidelity — the step that is not optional

Every figure and every intended glossary term was grepped against the module transcript **before**
writing, with first-appearance position, so nothing is glossed ahead of the course's own usage.
**68 figures and 41 terms** checked. All 41 terms cleared the bank validator's vocabulary gate with
**zero** "confirm it is not invented vocabulary" warnings against the new lessons — the ten standing
warnings all name pre-existing lessons.

Two findings from that pass:

**`self-determination` does not go in the glossary.** L16's transcript reads "the power of
selfdetermination" — one word, its only occurrence in the module — so normalisation cannot match
the clean spelling. This is the same class as the `hub-andspoke` typo at L07. Glossing the typo puts
a misspelling in front of a learner; glossing the clean form defines a heading the course never
spells. The explainer carries the idea as "it gives choices" and a comment in the file records why,
so the next author does not re-add it.

**The L07 comment's prediction was correct and is now discharged.** That comment said the clean
spelling of `hub and spoke` first appears in L11 and that L11 should own the term. Verified: exactly
one occurrence in the module, in L11. It is glossed there.

**A transcript slip was not reproduced.** L11's narration of Aravind's founding problem says "there
aren't enough cardiac surgeons ... to deal with the cardiac problem" while describing Dr V's eye
hospital. The lesson states the capacity problem and the demand-supply mismatch without carrying
the slip across.

---

## Gates

| Gate | Result |
| --- | --- |
| `node tools/check_lesson_file.mjs` | `ok: true`, **0 errors**, 1 warning (the standing §0 undeliverable list) |
| `node tools/validate_t6_bank.js "<transcripts>"` | **errors: 0**, 10 warnings, none naming the new lessons |
| `node tools/measure-syllabus-coverage.mjs --gate` | **PASS** — BRGSA/IBM/SCLM/SPMS all 100% |
| `node tools/check-taught-vocabulary.mjs --gate` | **PASS** — no new untaught vocabulary |
| `npm test` | **120/120** |
| `node tools/build-site.mjs` | 19 assets |

All gates re-run after the D2 rewrite; the figures above are the post-rewrite run.

## Real browser

LAW-47 via the committed `tools/browser-checks/teach-before-test.js`, driving the real subject rail
(card located by `.course-code`, click asserted against `selectedCourse` before measuring), from an
empty `lessonsRead`, reloading between subjects so the LAW-62 in-memory contamination cannot carry:

| Subject | Routes | Violations | Skipped |
| --- | ---: | ---: | ---: |
| IBM | 12 | **0** | 0 |
| SPMS | 12 | **0** | 0 |
| BRGSA | 12 | **0** | 0 |
| SCLM | 12 | **0** | 0 |

**48 routes, 0 violations, 0 skipped.** Re-run on IBM after the D2 rewrite: 12 routes, 0 violations.

`ui-audit` was run by fetching `/tools/browser-checks/ui-audit.js` and evaluating it in the page,
rather than pasting a copy — a second copy is the drift this repository has been bitten by before.
Dashboard, IBM selected, teaching-layer disclosure open, **all seven new lessons expanded**:

| Detector | 1280 light | 375 dark |
| --- | ---: | ---: |
| overflow / clipped / circleFit / overlaps | 0 / 0 / 0 / 0 | 0 / 0 / — / 0 |
| tapTargets / radiiOffScale / ragged | 0 / 0 / 0 | 0 / 0 / 0 |
| typeTooSmall / cutRows / barInset | 0 / 0 / 0 | 0 / 0 / 0 |
| `pageScrollsSideways` | false | false |

Worst text contrast anywhere in the lesson index in dark: **6.77:1**, above AA.

**Two findings that are not mine, reported rather than silently fixed:**

- `hiddenScroll` fires at 375 on `div#course-grid.course-grid` — the subject rail — showing 355px
  of 768px, **54% hidden**. A lesson-file edit cannot reach the course grid; this is pre-existing
  and outside this task's scope.
- `density` still reports 10 paragraphs at 375. **Eight are pre-existing lessons** (593, 566, 549,
  534, 526, 525, 520, 518 characters); the two that are mine sit at 528 and 517, mid-pack.

**Not done:** no screenshot — the Browser pane was not compositing frames, so pixel acceptance is
still owed, as it has been for several sessions. Console is clean apart from six
`/api/written-authority/health` 404s, one per page load, from the deliberately-off hosted endpoint.

---

## Status

All seven lessons are new prose and carry `WAITING_OWNER_CONTENT_ACCEPTANCE`. No second reader.
Not merged, not deployed.

**The read-only browse finding changes what the remaining backlog is worth**, and the owner may want
to revisit it: the 2026-08-17 decision was taken on the understanding that this work reaches nobody.
It reaches anyone who opens "Read the lessons". 39 IBM lectures remain, plus 40 SCLM and 40 SPMS.
