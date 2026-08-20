# The spine is widened for the first time — and the craft gates caught what the structural ones passed

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

Step 0 and Step 2 of `docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md`, executed and verified.

| what | result |
| --- | --- |
| `pair.slice(0, 2)` generalised | module match **and** boss now chain consecutive pairs |
| six concept records authored | SPMS module 1: 2 → **8** concepts |
| SPMS concepts | 16 → **22** |
| SPMS questions | 216 → **300** |
| SPMS link edges | 8 → **14**, isolated **0** |
| SPMS tested coverage | **30% → 34%**, floor raised to 34 |

---

## Step 0 — the code fix, and it is a no-op until it is needed

`app/sets/t6_challenges.js` took only the first two concepts of a module into the match and boss
generators, which are the **only** generated surfaces carrying `supportingConceptIds` and therefore
the whole link mechanism. It now chains consecutive pairs.

**Verified as a no-op at today's shape first.** With every module still holding two concepts the
bank was byte-identical in every measure that matters — 920 questions, BRGSA 49 edges, IBM 35,
SCLM 10, SPMS 8, `npm test` 128/128. Existing ids are unchanged: the first pair keeps the
unsuffixed `_match` / `_boss_<n>` id and only second and later pairs take a suffix, because history,
evidence and run definitions all key on ids.

**Then verified as a fix.** A probe concept injected as a third in SPMS module 1 previously produced
`FAIL — 1 concept(s) have no link` and orphaned **`spms_jtbd`**, a real shipped concept. After the
change the same probe gives edges 8 → 9 and **isolated 0**.

### The first attempt chained only the match, and the bank validator rejected it

Reasoning that the boss is the heaviest family and one match per pair is enough to create the edge,
the boss was left on the first pair. The validator disagreed immediately and was right:

```
SPMS/spms_embedded_product has only 7 actively scheduled surfaces
SPMS/spms_embedded_product has no boss coverage
… 10 errors
```

Every concept must carry boss coverage and at least ten actively scheduled surfaces. Leaving the
boss on the first pair would have given the third and later concepts in a module a thinner deal than
the first two — the exact inequality the widening exists to remove. Both are chained now.

**Bank size and session length are different things** and separating them is what makes the growth
acceptable: runs select from the bank, so how long a learner sits is a run-composition decision, not
a consequence of how much the generators produced.

---

## Step 2 — six concept records, and what one record actually buys

Authored into `app/sets/t6_catalog.js` in teaching order, from `SPMS-M01-L02` and `-L03` and their
already-accepted lessons: **Physical vs software products, Marginal cost, Embedded product, Product
family, Product platform, Product line.**

Each record is ten fields, six of them prose. **No questions were written by hand.** The generators
produced 84 new surfaces from those six records — 9 per concept plus the chained match and boss —
and seven module-1 match questions now exist (`spms_m1_match` through `_7`), one per consecutive
pair, so every module-1 concept links to its neighbour.

**Those six syllabus ideas went from untested to tested without a question being authored**, which
is the whole argument for widening the spine before writing questions one at a time. SPMS
tested-coverage 30% → **34%**; whole bank 35% → **36%**. The floor in
`data/syllabus/tested-floors.json` is raised to 34 with the reason recorded, per the standing rule
that a floor rises when authoring lands.

### A consequence to be explicit about

Inserting in teaching order put the taxonomy concepts ahead of `spms_dfv` and `spms_jtbd`, so the
five module-1 boss questions now test **Physical vs software products against Marginal cost**
rather than DFV against JTBD. **The ids are unchanged; the content is not.** That is arguably a
correction — module 1's boss should test module 1's opening ideas rather than its last two — but it
is a tester-visible change and is recorded as one rather than discovered later.

---

## What the structural gates passed and the craft gates caught

Every structural gate was green on the first authored draft: bank validator 0 errors, spine gate
PASS, LAW-47 clean, `npm test` 128/128. The prose was still defective.

**The correct answer was the longest option in 6 of 6 `explain` questions**, and 77.8% across all
18 new option sets against a 25% chance baseline — while the existing SPMS concepts sit at 33.3%.
Measured per subject, SPMS's `longestOptionScore` went **0.23 → 0.38**. The cause was systematic
rather than incidental: a summary written to be complete runs 28–85 characters longer than
distractors written to be wrong.

Two rounds of repair, both in place and neither by padding:

1. **Trim the summaries and lengthen the distractors toward each other.** 77.8% → 61.1%, and the
   remaining margins fell from 30–80 characters to 1–12.
2. **Make one distractor per set deliberately longer than the correct answer.** A plausible wrong
   explanation deserves the same detail as the right one, so this adds substance rather than
   filler. **61.1% → 33.3% — exact parity with the existing concepts.**

| | longestOptionScore |
| --- | ---: |
| SPMS baseline, before this work | **0.23** |
| after the first authored draft | 0.38 |
| after repair | **0.29** |
| BRGSA (shipped) | 0.29 |
| IBM / SCLM (shipped) | 0.23 / 0.18 |

**Reported rather than hidden: 0.29 is still above SPMS's own 0.23 baseline.** It is level with
BRGSA, no longer the worst of the four, and the new concepts are at parity with the old ones — but
the subject did move. The residue sits in the boss and cloze families, which derive from the same
`application` strings and cannot be balanced by editing a distractor list. Anyone adding the next
batch of concepts should measure this before and after rather than trusting the structural gates,
which passed the defective draft without comment.

---

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | `ok: true`, 0 errors |
| `validate_t6_bank.js "<transcripts>"` | `ok: true`, **0 errors**, 8 warnings (all pre-existing) |
| `npm run check:syllabus` | **PASS** — all four at 100% |
| `npm run check:taught` | **PASS** — no new untaught vocabulary |
| `npm run check:tested` | **PASS** — SPMS 34% against a raised floor of 34 |
| `npm run check:spine` | **PASS** — every concept has at least one link |
| `npm run check:names` | exit 0 — no family over its limit |
| `measure-absolute-bias --gate` | exit 0 |
| `check-lesson-lecture-match --gate` | FAIL naming `SPMS-M01-L01` alone — the expected state |
| `npm test` | **128 / 128** |
| `node tools/build-site.mjs` | 19 assets |
| `teach-before-test.js` | **`ok: true`, 12 routes × 4 subjects, 0 violations, 0 skipped** |
| `node tools/screenshot.mjs --only question` | 3 / 3, 0 failed |

### Browser verification

22 SPMS concepts and 300 questions loaded in the running app. Module 1 renders its eight concepts
in teaching order. A generated `explain` and `apply` were read as a learner sees them — both are
proper questions with plausible distractors, and `spms_product_line_explain` now has the correct
answer at 175 characters against a distractor at 177, so the longest option is not the answer.
Console carries no JS errors; the only failing request is the hosted-marking health probe the static
dev server does not implement.

---

## What this does not do

- **Nine of module 1's seventeen syllabus ideas are still not concepts** — this batch took the
  L02/L03 taxonomy cluster only, to prove the pipeline at a size that could be verified properly.
- **Run composition is untouched.** Study set 1 for SPMS is now 16 questions; at all seventeen ideas
  it would be roughly 34. That is Blocker 3 in the plan and it needs deciding before the module is
  finished, not after.
- **The layer's parent assignments are not written into the catalogue.** These six were authored
  against the lectures directly; `elaborates` is still a proposal in `build-concept-layer`.
- Content remains **owner-accepted, not faculty-reviewed**, and the new records have had no owner
  pass at all.
