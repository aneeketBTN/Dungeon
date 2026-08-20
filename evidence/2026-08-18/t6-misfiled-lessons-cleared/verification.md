# Verification — the misfiled-lesson queue is cleared, 11 of 12

`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)` · 2026-08-18 · branch
`fix/theme-switch-and-login-theming` · not merged, not deployed.

The ask was to continue `docs/briefs/MISFILED_LESSONS_WORK_ORDER.md`, which handed over 10 remaining
lessons that `tools/check-lesson-lecture-match.mjs` flags as written from a lecture other than the
one their `lectureId` names. Server port **63992** (8099 was in use; `autoPort` assigned it).

---

## Verdict

| Claim | Verdict |
| --- | --- |
| The queued 10 are resolved | **Yes** — 9 rewritten, 1 left by owner decision (`SPMS-M01-L01`) |
| An 11th was found and fixed | **Yes** — `SPMS-M04-L01`, see §F1 |
| Every rewrite was authored against its own transcript | **Yes** — each lecture read in full before writing; ~90 figures and terms grep-verified |
| Coverage held at 100% | **Yes, after four repairs** — 9 terms fell out during rewriting and were taught back, not aliased (§C) |
| Prose stayed inside the house range | **Yes, after two rounds** — 7 explainers measured over the ceiling and trimmed **before** commit |
| Handoffs stayed true | **Yes, after seven repairs** — §H |
| Scheduling still correct | **Yes** — LAW-47, 12 routes × 4 subjects, 0 violations, 0 skipped |
| Nothing pre-existing was broken | **Yes** — 245 lessons parse, `npm test` 120/120, build 19 assets |
| Match gate now passes | **No, by design** — 1 flag remains, owner-accepted (§D) |

---

## The queue, and what happened to each

| id | its lecture | was teaching | now teaches |
| --- | --- | --- | --- |
| `SCLM-M01-L05` | C07 Financial Measures | L04's strategic fit | ROE/ROA/ROFL, the margin × turnover split, cash-to-cash in weeks, Amazon's numbers |
| `SCLM-M01-L08` | C10 Logistics Drive | L05's financial material | facilities, inventory and transportation in depth; Little's Law on the lecture's own example |
| `SCLM-M05-L01` | RESOURCE FarmAid case | M05-L02/L05's material | the case setup: the engagement, the two prioritised questions, the end-of-month order defect |
| `SPMS-M01-L03` | C02 Family/Platform/Line | L02's kinds of software product | family vs platform vs product line |
| `SPMS-M01-L04` | C03 SPM Definition and Evolution | L03's family/platform/line | the definition of SPM, and the eras |
| `SPMS-M01-L06` | C05 Startup Attributes and Types | L04's SPM eras | the startup definition and the three types |
| `SPMS-M01-L08` | C07 Product Evolution | L09's product thinking | the validation phase, steps 4–6, and what counts as proof |
| `SPMS-M05-L03` | C03 Product Marketing Management | blue ocean strategy | the marketing sub-functions, PMM's work, value articulation |
| `SPMS-M07-L06` | C06 Product Lifecycle Part 1 | roadmaps + the lifecycle | the six lifecycle stages and what changes at each |
| `SPMS-M08-L01` | C01 Orchestration of Sales | AARRR/HEART/north star | orchestrating with sales and fulfilment |
| `SPMS-M04-L01` | C01 Pricing Foundations | the six-level pricing pyramid | what a price communicates; Spotify's segments |
| `SPMS-M01-L01` | RESOURCE Key Takeaways (685 chars) | "what makes something a product" | **unchanged — owner decision, §D** |

**Two lessons authored that did not exist:** `SPMS-M01-L09` (C08 Product Thinking) — the module's
only unauthored id and the first item on the SPMS backlog — and `SPMS-M07-L05` (C05 Product Roadmap
Part 2), authored to receive the roadmap material displaced from `M07-L06`. File **243 → 245**;
SPMS **44 → 46**; backlog **40 → 38**.

---

## F1 — an eleventh lesson, surfaced by the corpus shift

`SPMS-M04-L01` was **not** in the handover queue. It appeared after the SPMS module 1 work, and the
first question was whether the rewrites had caused it. Measured against the pre-batch file:

```
before batch C:  margin +0.0944   flagged: false
after  batch C:  margin +0.100    flagged: true
```

`MARGIN_MIN` is 0.10. The lesson itself was never touched — its distinctiveness score moved because
adding a lesson and rewriting several changes the corpus statistics the lift is computed against. So
it was a borderline pre-existing case revealed by the shift, not a regression.

It was then diagnosed the same way as the rest rather than dismissed as a threshold artefact, and it
is a real misfile: every level of the pricing pyramid its lesson taught — `price structure`,
`pricing policy`, `price-value communication`, `offering design`, `price level` — first occurs in
**C02 Value Based Pricing**, which is `M04-L02`, not in its own lecture.

**A gate whose scores are corpus-relative moves other lessons when you edit one.** Re-run it after
every batch, and diff a new flag against the previous file before assuming either blame or noise.

---

## C — coverage is a ratchet, and nine terms fell out

Rewriting a lesson silently drops whatever vocabulary only it carried. `measure-syllabus-coverage`
caught this four separate times, and in every case the term was taught back **at the lecture that
actually introduces it** — no alias was added and no floor was lowered.

| term(s) | had been carried only by | taught back at | why there |
| --- | --- | --- | --- |
| `efficient supply chain`, `responsive supply chain` | the misfiled `SCLM-M01-L05` | `SCLM-M01-L04` | C06 Strategic Fit says both phrases and tabulates what each looks like |
| `shipper decision horizons`, `macro ecosystem actors` | the misfiled `SCLM-M05-L01` | `SCLM-M05-L07` | C06 Ecosystem and Decision Makers; its lesson already taught both ideas without naming them |
| `decision phases` | a passing clause in `SCLM-M05-L01` | `SCLM-M01-L02` | its lecture is *titled* Decision Phases of Supply Chain |
| `Product vs project`, `evolution of software product management`, `Physical vs software products`, `Need versus value` | SPMS module 1 lessons, before rewriting | `SPMS-M01-L04`, `L02`, `L10` | all four are the course's own phrasings; verified present in the transcripts |
| `blue ocean strategy`, `value innovation`, `red ocean` | the misfiled `SPMS-M05-L03` | `SPMS-M05-L02` | C02 Competition and Alternatives is the only SPMS lecture that says them (11 uses) |
| `price structure`, `price-value communication`, `pricing policy`, `price level` | the misfiled `SPMS-M04-L01` | `SPMS-M04-L02` | all first occur in C02 Value Based Pricing |
| `AARRR` | the misfiled `SPMS-M08-L01` | `SPMS-M08-L03` | C03 Metrics, whose lesson already carried HEART and the north star |

The last four SPMS misses were **phrase-match failures caused by rewording**, not by dropped
teaching: the coverage tool requires a named idea to appear as its name, contiguously. Writing
"Product against project" where the syllabus says "Product vs project" reads as untaught. The fix
was to use the course's own form, which is what the sheets and the lectures say anyway.

**Two standing vocabulary warnings were also cleared** as a side effect: `value equation` and
`startup stages` had been glossed on `SPMS-M01-L08` and appear in neither the transcripts nor the
notes. Both concepts survive in prose; neither is a glossary heading now.

---

## H — seven handoff repairs

Twelve instances were on record before today; this adds seven, all of them falsified by the
misfiling rather than by the rewrite.

| lesson | promised | the next lecture actually is |
| --- | --- | --- |
| `SCLM-M01-L04` | "those levers are the next lecture" | C07 Financial Measures |
| `SCLM-M01-L06` | "the next lecture asks how that signal is produced" | C09 KPI Tree |
| `SCLM-M01-L09` | "brings all six drivers together" | nothing — it is the module's last lecture |
| `SPMS-M01-L01` | "what changes when the product is software" | C01, which also sorts the four kinds |
| `SPMS-M01-L04` | "the organisation that practises it: the startup" | C04 the DFV framework |
| `SPMS-M01-L07` | "what a product is worth to the person buying it" | C07 Product Evolution |
| `SPMS-M05-L02` | — | *(duplicated sentence introduced by a prefix replacement; caught by re-reading the chain and fixed)* |

Reading the whole module chain after a batch — not just the lesson above the edit — is what found
five of these. The last one is a reminder that a string edit anchored on a prefix leaves the tail.

---

## D — `SPMS-M01-L01` stays, on an owner decision

The work order asked that option 3 be checked first: is the transcript missing a first lecture?

**It is not.** `SPMS_M01_SUM_TRANSCRIPT.txt` and `SPMS_MEGA_TRANSCRIPT.txt` independently hold
exactly ten module 1 sections, agreeing on order and titles, and the first is the 685-character
`RESOURCE | Key Takeaways Module 1` card. Nothing is absent from the source.

The lesson's content is not orphaned either: `parties involved` and `defined rights` both occur in
`Software Product Management\Detailed Notes\module 1.txt`. It is real course material from the
revision sheets, sitting under an id that names a takeaways card.

Given that, the owner chose to leave the lesson in place and record the finding. The gate will keep
flagging it at 0.000 own support — the lowest in the file — and that flag is now **expected**, not
outstanding. The match gate therefore reports FAIL with exactly one lesson, by design.

---

## The module 1 shift was not an off-by-one

The work order described SPMS module 1 as "a systematic off-by-one". Reading all ten lectures shows
it is not uniform — `L02`, `L05`, `L07` and `L10` were already correct, and the displacement runs in
a broken chain rather than a constant offset:

```
L01  takeaways card   <- notes-sourced prose (left)
L02  C01              <- correct, but taught only half of C01
L03  C02              <- held C01's other half
L04  C03              <- held C02's material
L05  C04              <- correct
L06  C05              <- held C03's material
L07  C06              <- correct, but also pre-taught C07
L08  C07              <- held C08's material
L09  C08              <- NO LESSON
L10  C09              <- correct
```

Because `L03` had to give up the four kinds of software product, and C01 is the lecture that teaches
them, `L02` was widened to carry both halves of its own lecture. That is why the repair reaches
lessons the gate never flagged. The owner approved the full-module scope before it was done.

---

## Gates

Everything below was run after the last edit.

```
node tools/check_lesson_file.mjs "<transcripts>"          ok: true, errors: 0
node tools/validate_t6_bank.js "<transcripts>"            ok: true, errors: 0
node tools/measure-syllabus-coverage.mjs --gate           PASS — BRGSA/IBM/SCLM/SPMS all 100%
node tools/check-taught-vocabulary.mjs --gate             PASS — no new untaught vocabulary
node tools/check-lesson-lecture-match.mjs "<t>" --gate    FAIL — 1 lesson (SPMS-M01-L01, §D)
npm test                                                  120/120
node tools/build-site.mjs                                 19 assets
node tools/screenshot.mjs --port 63992                    20 shots, 0 empty
```

`tools/browser-checks/teach-before-test.js`, evaluated in the running app from an empty
`lessonsRead`, reloading between subjects so LAW-62 cannot carry:

| subject | routes | violations | skipped |
| --- | --- | --- | --- |
| SPMS | 12 | 0 | 0 |
| SCLM | 12 | 0 | 0 |
| IBM | 12 | 0 | 0 |
| BRGSA | 12 | 0 | 0 |

The SCLM run first returned `ok: false` with nine routes skipped — the previous subject's run was
still active in the profile, so the dashboard never rendered and no set button existed. The check
reported that rather than a clean pass over three routes, which is exactly the behaviour its own
header describes. Cleared `active` and re-ran.

**Read in the app, not just gated:** the lesson index rendered `SPMS-M01-L09` in full — objective,
three paragraphs, worked example, glossary, handoff, and the `Read-only — no question cites this`
label — and the SCLM index carried all three rewritten titles with Little's Law's 600-unit figure
intact. Console clean apart from `/api/written-authority/health` 404ing once per load, which the
static dev server does not serve and which predates this work.

`outputs/shots/lesson_SCLM_1280x900_light.png` was opened and read, not counted.

---

## LAW-74

Every write went through Node's `fs.writeFileSync` with a CRLF assertion before and after. Final
state: **0 CRLF pairs, 0 bare CR, 6801 lines**.

---

## Not done

- **No second reader.** Same limitation as every prior batch.
- **`SPMS-M01-L01` is unresolved by design**, and the match gate will not go green until the owner
  revisits it.
- **The gate's scope limit still applies.** It finds a lesson written from *another* lecture, never
  one written from half of its own — `SPMS-M01-L07` was exactly that case (it pre-taught C07's
  validation phase) and the gate never flagged it. It was found by reading the lectures.
- All new and rewritten prose stays `WAITING_OWNER_CONTENT_ACCEPTANCE`.
