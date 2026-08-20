# SPMS module 6 is complete — and the sweep query that was supposed to find its composite

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

| lecture | chars | what happened |
| --- | --- | --- |
| `SPMS-M06-L02` — Customer Insights | 19,152 | **authored** |
| `SPMS-M06-L03` — Product Planning Scenarios Part 1 | 13,386 | **authored** |
| `SPMS-M06-L04` — Product Planning Scenarios Part 2 | 12,990 | **authored** |
| `SPMS-M06-L06` — Types of Requirements | 9,823 | **authored** |
| `SPMS-M06-L07` — Sources of Requirements | 10,868 | **authored** |
| `SPMS-M06-L01` — Product Planning | — | **composite rewritten** against its own lecture |

Registered entries **262 → 267**; SPMS **63 → 68 of 84**; backlog **21 → 16**. **Module 6 is
complete (11 of 11)**, the fifth complete SPMS module after 1, 2, 3 and 5.

---

## The finding: the published sweep query could not have found this composite

`SPMS-M06-L01` took its entire third paragraph and its **whole worked example** from
`SPMS-M06-L02`'s lecture — the Henry Ford faster-horses illustration and the data-versus-insight
distinction. Neither appears anywhere in `L01`'s own transcript; grepping `L01` for `faster horses`
and `insight` returns one hit, and it is the phrase "market understanding and customer insight" in
a list of inputs.

It was never going to be caught by the recipe this repository wrote down:

```
awk -F'\t' '$1>0 && $1<0.10 && $3<0.35'     # the documented Step 4c sweep
```

`SPMS-M06-L01` scored **own 0.284 against `L02`'s 0.270** — a margin of **−0.011**. It was
*winning*, by a hair, against the very lecture it had borrowed from, so `$1>0` skipped it. Run
against the pre-batch dump the query returns ten rows and `SPMS-M06-L01` is not one of them.

**That is the general lesson, not a one-off.** A composite that borrows from a single neighbour
converges *toward a tie* with that neighbour. Being fractionally ahead of the lecture you
plagiarised is the signature, not the exoneration. The floor is now `>-0.06`.

**The second half of the query was stale too.** `0.35` was p25 when it was written. `--calibrate`
now reports p25 = **0.460** across 267 lessons, and it has moved every time the corpus grew
(`LAW-76`). A hardcoded threshold inside a corpus-relative query silently under-selects as the
corpus grows. `--calibrate` now runs *first* in the protocol block, and the literal is marked as a
value to substitute rather than trust.

Both corrections are written into `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` Step 4c.

### The repair, measured

| lesson | ownLift before | after | margin before | after | nearest rival |
| --- | --- | --- | --- | --- | --- |
| `SPMS-M06-L01` | **0.165** | **0.369** | **−0.011** | **−0.236** | `M06-L02` → `M07-L05` |

Own-lecture support more than doubled and the nearest rival moved off `L02` altogether. The
replacement paragraph is `L01`'s own unused material — the four named sources of a
requirements-driven plan (legal and regulatory, commodity features, technology, and the
vendor-or-customer-controlled environment where a bank already runs seventy or eighty systems).
The new worked example is the lecture's own thesis: *the goal is not to build more features, it is
to maximise customer and business value under uncertainty*.

**This is the forced order working as documented.** `L01` was unrepairable until `L02` existed to
receive the material, and `L02` was in this batch. That is the third time the backlog has turned
out to be what unblocks a composite.

### The five new lessons all clear p25

| lesson | ownLift | margin | nearest rival |
| --- | --- | --- | --- |
| `SPMS-M06-L03` | **0.596** | −0.410 | `M06-L04` |
| `SPMS-M06-L06` | **0.541** | −0.362 | `M06-L05` |
| `SPMS-M06-L02` | **0.495** | −0.317 | `M07-L13` |
| `SPMS-M06-L04` | **0.492** | −0.330 | `M06-L03` |
| `SPMS-M06-L07` | **0.476** | −0.398 | `M06-L01` |

p25 = 0.460, p50 = 0.545. All five are above p25; two are above the median.

**LAW-76 diff, pre-batch against post-batch: zero untouched lessons moved by ≥0.02** on either
margin or own support. The five new rows are the only additions. This is the first batch in the
record with no collateral re-scoring at all, which is worth knowing — it means a corpus this size
is no longer as volatile per-batch as the law's original case suggested.

---

## The false handoff, found before writing

`L01`'s `connects` read *"The next session is how the requirement gets written down."* The next
session is **Customer Insights**. Requirements are not written down until `L05`, four lectures
later.

This is the **sixth** false handoff found by checking the `connects` above an insertion point, and
it has a cause worth recording: the promise was false *because* the lesson was a composite. Having
already spent `L02`'s material inside `L01`, the author had nothing left to hand off to and wrote
a promise pointing past it. **A broken `connects` above a composite is not a second defect — it is
the composite's fingerprint.** Check the handoff first; it is cheaper than the match gate and it
pointed straight at this.

Repaired to: *"Planning decides what to build. The next session is how you get deeper than what
customers say they want."*

`L05 → L06` and `L08 → L09` were checked and are correct; no other handoff in the module moved.

---

## Coverage — two terms rehomed before stripping, so no ratchet fired

`data` and `insight` were glossary headings on `L01` and are `L02`'s material. They were moved
into `L02`'s glossary **in the same edit that removed them**, so the syllabus ratchet never saw a
gap. `L01` gained `commodity features` (1 occurrence in its own transcript) in their place.

Neither is a tracked SPMS syllabus term, so this was belt-and-braces rather than a rescue — but the
tracked module 6 terms `Product planning`, `Requirements-driven planning` and `Data-driven
planning` all sit in `L01` paragraphs 1 and 2, which were deliberately left untouched.

All 31 new glossary terms were verified as word-boundary matches in their own transcripts before
writing. Two had to be glossed in the **plural** because the course never uses the singular:
`channel partners` and `personas`. That is the documented `\b<term>\b` quirk, caught in advance
this time rather than as a false accusation afterwards.

---

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | `ok: true`, **0 errors**; SPMS 68 lessons |
| `validate_t6_bank.js "<transcripts>"` | `ok: true`, **0 errors**; 267 authored; **9 vocabulary warnings, none naming a `SPMS-M06` lesson** |
| `npm run check:syllabus` | **PASS** — all four subjects 100% against 100% floors |
| `npm run check:taught` | **PASS** — no new untaught vocabulary |
| `npm run check:tested` | **PASS** — BRGSA 67 / IBM 19 / SCLM 33 / SPMS 30, all at floor |
| `check-lesson-lecture-match --gate` | **FAIL naming `SPMS-M01-L01` and nothing else** — the expected state |
| `npm test` | **128 / 128** |
| `node tools/build-site.mjs` | 19 assets |
| `tools/browser-checks/teach-before-test.js` | **`ok: true`, 12 routes × 4 subjects, 0 violations, 0 skipped** |
| `node tools/screenshot.mjs --port 8099` | **16 / 16**, 0 failed |

### The bank validator's empty-coverage trap, and a correction to how it is described

`AGENTS.md` warns that a green run with an empty `"coverage": {}` means the vocabulary gate was
silently skipped. That warning is correct and it fired here — but the field is at
**`lessons.coverage`**, not top level, and this session's first probe read the wrong level and
briefly took a passing run for a skipped one.

Confirmed by running both ways:

- **with** the transcript path — `lessons.coverage` populated for all four subjects, **9**
  vocabulary warnings;
- **without** it — `lessons.coverage: {}`, **0** warnings.

So the documented failure mode is real and reproducible; only its path in the JSON is imprecise
in `AGENTS.md`. Probe artefact, not a code defect.

### Browser verification

Read in the running app at `http://127.0.0.1:8099/app/t6.html` (the owner's own origin left
alone), all 267 lessons loaded. All five new titles render inside the **"Read the lessons"**
disclosure and carry `Read-only — no question cites this`, which is correct — module 6 is uncited,
so these are readable and unscheduled until Phase 2 gives them concepts.

`SPMS-M06-L02` was read end to end as a learner sees it: objective, three paragraphs, worked
example, glossary, handoff. **No literal markdown** — the `**`-renders-as-asterisks defect that
only a browser check can find was scanned for across the whole index and returns zero hits.

Console carries no JS errors. The only failing request is `/api/written-authority/health` → 404,
which is the hosted-marking probe the static dev server does not implement; it is present on a
clean load of `main`-era code too and is unrelated to this batch.

---

## Open, and deliberately not done here

- **`SPMS-M06-L08` carries one clause of `L07`'s material.** Its closing line — "requirements made
  actionable for developers, in a consistent style, oriented towards a standard product" — is
  near-verbatim from `L07`'s transcript, and `L08`'s own transcript contains none of those phrases.
  `L08` is otherwise genuinely its own lecture (own 0.309, margin −0.183) so it is **not** a
  composite, and it is owner-accepted content. Flagged rather than rewritten; removing redundancy
  from accepted material is an owner call, not an authoring one.
- **The widened sweep returns ~28 rows** against the old query's 10. That is a reading queue across
  all four subjects, not 28 defects. Nothing in it has been read yet.
- **`AGENTS.md` records "screenshots 20/20"**; the tool's own documented default sweep is 16 and it
  produced 16. Likely counting an `--optical` grid pass. Not chased.

## Remaining backlog — 16, all SPMS

M4 ×5 (including the 48,232-character Sriraman guest session, the longest lecture in the course),
M6 ×0, M7 ×5, M8 ×6. **M8 is now the heaviest untouched module**, six lectures at 19–23k each.
