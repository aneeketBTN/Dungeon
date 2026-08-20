# Work order — lessons that teach the wrong lecture

**Status: closed, 2026-08-18. 11 of 12 fixed; the twelfth is an owner decision that has been made
and recorded.** Nothing here is outstanding work. Keep the file as the record of what the defect
class looked like and how it was cleared — and read §"What is still true" before trusting a green
run of the gate.

Evidence: `evidence/2026-08-18/t6-misfiled-lessons-cleared/verification.md`.

---

## What this was

`tools/check-lesson-lecture-match.mjs` (built 2026-08-18) tests the claim a `lectureId` makes: does
this lesson teach *that* lecture? Nothing tested it before, and two shipped SCLM lessons had been
teaching the wrong lectures for as long as they existed. Run it:

```bash
node tools/check-lesson-lecture-match.mjs "C:/Users/knigh/OneDrive/Desktop/exam/Term 6 Clean Transcripts" --gate
```

Useful flags: `--subject SPMS` to narrow, `--explain <lectureId>` for one lesson's numbers,
`--calibrate` for the distribution, `--dump` for the full ranking.

**Do not recalibrate it against the shipped corpus.** The corpus contained the defect; the threshold
is anchored on the confirmed fixture instead. `LAW-75` explains why.

---

## Resolved

| lesson | was teaching | now teaches |
| --- | --- | --- |
| `SCLM-M01-L02` | L01's supply chain surplus | design / planning / operations decision phases |
| `SCLM-M01-L03` | L02's decision phases + half of its own | cycle view, push-pull boundary, CRM / ISCM / SRM |
| `SCLM-M02-L03` | L04's method families and error metrics | the four features of a forecast, the six-step process |
| `SCLM-M02-L04` | L02's push/pull opening + the components half | five demand patterns, `Et = At − Ft`, bias, MAD, MSE, MAPE |
| `SCLM-M01-L05` | L04's strategic fit | ROE / ROA / ROFL, margin × turnover, cash-to-cash in weeks |
| `SCLM-M01-L08` | L05's financial material | facilities, inventory, transportation in depth; Little's Law |
| `SCLM-M05-L01` | M05-L02 and L05's material | the FarmAid case setup and its two prioritised questions |
| `SPMS-M01-L03` | L02's kinds of software product | family vs platform vs product line |
| `SPMS-M01-L04` | L03's family/platform/line | the definition of SPM, and its eras |
| `SPMS-M01-L06` | L04's SPM eras | the startup definition and the three types |
| `SPMS-M01-L08` | L09's product thinking | the validation phase, steps 4–6, and what counts as proof |
| `SPMS-M04-L01` | M04-L02's pricing pyramid | what a price communicates; Spotify's segments |
| `SPMS-M05-L03` | M05-L02's blue ocean strategy | marketing sub-functions, PMM's work, value articulation |
| `SPMS-M07-L06` | M07-L05's roadmaps | the six lifecycle stages and what changes at each |
| `SPMS-M08-L01` | M08-L03's metric frameworks | orchestrating with sales and fulfilment |

**Two lectures gained a lesson that had none:** `SPMS-M01-L09` (Product Thinking) and
`SPMS-M07-L05` (Product Roadmap Part 2). File 243 → 245; SPMS backlog 40 → 38.

`SPMS-M04-L01` was never in the queue — see §"The eleventh".

---

## The one that stays: `SPMS-M01-L01`

Its `lectureId` names a 685-character *"Key Takeaways Module 1"* card, not a lecture; every other
one of the 283 lectures across four subjects runs over 1,500 characters.

**Option 3 was checked first, as this file asked, and the answer is no.** The transcript is not
missing a first lecture: `SPMS_M01_SUM_TRANSCRIPT.txt` and `SPMS_MEGA_TRANSCRIPT.txt` independently
hold exactly ten module 1 sections, agreeing on their order and titles. The lesson's content is not
orphaned either — `parties involved` and `defined rights` both occur in
`Software Product Management\Detailed Notes\module 1.txt`. It is real course material from the
revision sheets, sitting under an id that names a takeaways card.

**The owner's decision (2026-08-18): leave the lesson in place and record the finding.** So the gate
will keep flagging it at 0.000 own support, the lowest in the file, and

> **a `FAIL` naming exactly `SPMS-M01-L01` and nothing else is the expected state of this gate.**

Anything else in the output is new and should be read. Do not "fix" this flag by writing a summary
lesson for the card without going back to the owner — 685 characters cannot carry the contract's
~220-word explainer honestly, which is why option 1 was declined.

---

## The eleventh, and the trap in it

`SPMS-M04-L01` was not in the handover queue. It appeared after the SPMS module 1 work, on a lesson
that had never been edited:

```
before:  margin +0.0944   flagged: false
after:   margin +0.100    flagged: true      (MARGIN_MIN = 0.10)
```

The gate scores a lesson's *distinctive* vocabulary, and distinctiveness is defined against the rest
of the subject's lessons — so editing part of the corpus re-scores all of it, and a borderline case
crossed the line. It was still a real misfile once read. **`LAW-76` 🟡**: diff a new flag against the
previous file before assuming either blame or noise, and re-run the gate after every batch rather
than once at the end.

---

## What is still true, and worth more than the table above

- **Read the lecture before writing.** It is the only thing that finds this defect class, and it
  found the one the gate structurally cannot: `SPMS-M01-L07` teaches its own lecture *and*
  pre-teaches the next one's validation phase. The gate never flagged it and never will.
- **The gate's scope limit is real.** It finds a lesson written from *another* lecture. It cannot
  find one written from half of its own — `tests/fixtures/mismapped-lessons.js` holds both cases and
  the gate correctly flags only the first. A PASS means "nothing looks misfiled", never "everything
  is covered".
- **SPMS module 1 was described here as an off-by-one. It was not.** `L02`, `L05`, `L07` and `L10`
  were already correct; the displacement ran as a broken chain, not a constant offset. Fixing `L03`
  forced `L02` to widen, because the content `L03` gave up belongs to `L02`'s own lecture. Expect a
  misfiling repair to reach lessons the gate never flagged.
- **Coverage is a ratchet, and rewriting silently drops whatever vocabulary only that lesson
  carried.** Nine terms fell out across this work. Teach each back at the lecture that introduces
  it — do not add an alias and do not lower a floor.
- **A coverage miss is as often a naming drift as a teaching hole.** The tool needs a named idea to
  appear as its name, contiguously, so "Product against project" reads as untaught where the
  syllabus says "Product vs project". Check which of the two you have before reaching for an alias.
- **Grep-verify every figure and glossary term** against the module transcript, and check the exact
  form. Four traps of this shape are on record: `backward integration` (the lecture says "backward
  **integrated**"), `days payable outstanding` ("days**'** payable outstanding"), `now next later`
  ("now**,** next**,** later"), and `self-determination` ("selfdetermination").
- **Measure before committing.** Seven explainers in this batch came in over the ~300-word house
  ceiling and three paragraphs over the ~695-character maximum; all were trimmed before commit.
  `worked.because` runs 62–521 characters.
- **Check the `connects` of the lesson above any insertion or replacement — and then read the whole
  module chain anyway.** Nineteen instances are now recorded, and five of this batch's seven were
  only visible from the whole chain. A prefix-anchored string replacement also leaves the old tail
  behind; that produced a duplicated sentence here, caught by the same re-read.
- **Never write a tracked file in a language's text mode.** Use Node's `fs.writeFileSync` and check
  `(src.match(/\r\n/g)||[]).length === 0`. `LAW-74`.

## Gates

```bash
node tools/check_lesson_file.mjs "<transcripts>"
node tools/validate_t6_bank.js "<transcripts>"
node tools/check-lesson-lecture-match.mjs "<transcripts>" --gate
node tools/measure-syllabus-coverage.mjs --gate
node tools/check-taught-vocabulary.mjs --gate
npm test && node tools/build-site.mjs
```

All green as of 2026-08-18 except the match gate, which fails on `SPMS-M01-L01` alone, by design.

## State at close

245 lessons. BRGSA 50/50, IBM 78/78, SCLM 71/71 complete; **SPMS 46 of 84**, and its 38-lecture
backlog is the whole remaining teaching-layer backlog. All prose since 2026-08-18 carries
`WAITING_OWNER_CONTENT_ACCEPTANCE`. Branch `fix/theme-switch-and-login-theming`, not merged, not
deployed.
