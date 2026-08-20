# Verification — a gate for the defect class no gate could see

`VERIFIED(AUTOMATED + FIXTURE)` · 2026-08-18 · branch `fix/theme-switch-and-login-theming` ·
not merged, not deployed.

The ask was to build the gate the previous session said was missing: nothing compared a lesson's
body against its own lecture, so two lessons taught the wrong lectures for as long as they existed
while every gate reported green. `tools/check-lesson-lecture-match.mjs` is that gate.

---

## Verdict

| Claim | Verdict |
| --- | --- |
| The gate detects the confirmed defect | **Yes** — `SCLM-M02-L03` flags at +0.117 from `tests/fixtures/mismapped-lessons.js` |
| It detects the *other* half of the fixture | **No, and by design** — see "What it cannot see" |
| It found defects nobody knew about | **Yes** — 11 shipped lessons flagged, 4 confirmed by reading |
| The thresholds are justified rather than chosen | **Yes, and unusually** — anchored on the fixture, not on the population, for a stated reason |

---

## How it works

For each lesson, take the **distinctive** words of its body — words appearing in at most 30% of
the subject's lectures, so subject house-words like "supply", "chain" and "customer" carry no
weight. Score the fraction present in its own lecture, and the same fraction for every other
lecture in the subject. A lesson written from its transcript beats every rival; a misfiled one
loses to the lecture it was actually written from.

Three design decisions did the work, and each was forced by a measurement rather than chosen:

### 1. The course notes are excluded, though every other gate uses them

The first version discounted words found in the module notes, copying `validate_t6_bank.js`.
**The fixture proved that destroys the measurement**: the known-bad lesson scored 0.178 against its
own lecture and **0.871** once the notes could excuse the misses — above the median of the
correctly-mapped file. The gate reported PASS on the exact defect it was built for.

The reason is structural. The notes answer "does the course use this word at all", which is what
the vocabulary gate asks. They cannot answer "which lecture does this word belong to", because a
revision sheet covers a module or a pair of modules and has no lecture-level resolution. Consulting
a source that cannot discriminate, on a question entirely about discrimination, launders every miss
into a pass.

### 2. Every lecture is corrected by its own background rate

Raw coverage rewards length. The first comparative run flagged 16 lessons and **six of them named
the same rival** — `SPMS-M04-L10`, a 48,000-character guest session. It was not the source of six
lessons; it is the biggest bag of words in the subject. Each lecture now carries the mean score it
achieves against all *other* lessons in its subject, and that background is subtracted, so a lecture
that explains everything earns no credit for explaining one more thing.

### 3. The background is computed from the shipped corpus even when scoring a fixture

Scoring the two-lesson fixture in isolation made the gate pass its own regression case again: the
fixture's bad `L04` became the entire "background" for L04 and cancelled the signal. A probe is
scored against the population; it is not a population.

---

## Why the cut is anchored on the fixture, not the distribution

Every other measurement in this repository is calibrated against what already shipped, and that is
usually right. It is wrong here, and the reason is worth keeping: **the shipped population contains
undiagnosed instances of the defect.** Calibrating a misfiling detector on a partly-misfiled corpus
sets the bar at whatever the existing mistakes reach — precisely the level that hides them.

So `MARGIN_MIN` sits just below the one case confirmed by reading both transcripts (+0.117). The
margin distribution shows why no clean line exists in the population:

```
0.370  SPMS-M01-L04      0.147  SPMS-M07-L06
0.344  SPMS-M01-L01      0.143  SPMS-M08-L01
0.282  SCLM-M01-L05      0.133  SCLM-M01-L02
0.268  SPMS-M01-L03      ---- flag line 0.10 ----
0.257  SCLM-M01-L08      0.095  SPMS-M01-L08
0.232  SPMS-M05-L03      0.094  SPMS-M04-L01
0.201  SCLM-M05-L01      0.072  SPMS-M02-L07
0.180  SPMS-M01-L06      0.072  SCLM-M04-L02
```

---

## What it found — a triage list, not a verdict

11 shipped lessons flag. **Four verified by reading the lecture titles**, and all four are real:

| lesson | its lesson teaches | its lecture actually is | the lecture it matches |
| --- | --- | --- | --- |
| `SPMS-M01-L04` | Family, platform, and product line | Software Product Management Definition and Evolution | `SPMS-M01-L03` — *Product Family Platform Productline* |
| `SCLM-M01-L05` | Efficient and responsive supply chains | Financial Measures | `SCLM-M01-L04` — *Strategic Fit* |
| `SCLM-M01-L08` | Measuring a supply chain financially | Logistics Drive | `SCLM-M01-L05` — *Financial Measures* |
| `SCLM-M05-L01` | Logistics, efficiency, and decision horizons | Case Study FarmAid Tractors Limited | not FarmAid at all |

**SCLM module 1 is shifted by one** across at least L05 and L08 — the same class as the module-2
defect fixed earlier today. The remaining seven are unread and are claims about where to look.

### A structural finding underneath it

`SPMS-M01-L01` is not a lecture. It is a **685-character "Key Takeaways Module 1" card** — every
other one of the 283 lectures across four subjects is over 1,500 characters. Its lesson teaches what
a product is, which is real course content that sits nowhere near that position. This is why the
gate scores it at 0.000 own support, the lowest in the file.

---

## What it cannot see

The fixture holds two defects and the gate finds one. `SCLM-M02-L03` was written *from another
lecture*, so a rival explains it better and the comparison fires. `SCLM-M02-L04` was written from
its own lecture's first half plus a neighbour's opening — no single rival dominates, and it does
not flag (−0.079). A partially-authored lesson is a different defect from a misfiled one and only
the misfiled kind is detectable this way.

**A PASS means "no lesson looks written from a different lecture". It does not mean "every lesson
covers its lecture".** That distinction is in the tool's header so the next reader cannot mistake
one for the other.

---

## Gates

| gate | result |
| --- | --- |
| fixture, `--lessons tests/fixtures/mismapped-lessons.js` | **FAIL, 1 flagged** — the confirmed defect, as required |
| shipped file | **FAIL, 11 flagged** — the triage list above |
| no transcript argument | exits **2** with a refusal, rather than a green tick over zero checks |
| `npm test` | **120/120** |
| `node tools/build-site.mjs` | 19 assets |

Wired in as `npm run check:lesson-match -- "<transcripts>" --gate`.

---

## Not done

- **The 11 flags are not fixed.** Four are confirmed misfiled; seven are unread. Fixing them means
  rewriting shipped lesson prose across SCLM module 1, SPMS module 1, and three others.
- **The gate is not in `npm test`**, because it needs the external transcripts, which are not in
  the repository and cannot be. It is a manual gate like the bank validator.
- **`SPMS-M01-L01`'s "Key Takeaways" position is unresolved** — see the SPMS authoring note in
  `docs/briefs/TEACHING_LAYER_AUTHORING_PLAN.md`.
