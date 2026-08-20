# The composite sweep — three more found, and all three are blocked

`VERIFIED(AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`. Measurement only:
**no lesson prose was changed by this work.**

## Why it was run

Two composite lessons — teaching a neighbour's material instead of their own — were found by
*reading* on 2026-08-19 and rewritten. Neither had ever flagged, because
`check-lesson-lecture-match` finds a lesson written from *another* lecture and structurally cannot
see one written from half its own. The open question was whether there were more.

## The query

The signature is **two conditions together**, and the tool already had the data behind an
undocumented `--dump`:

```bash
node tools/check-lesson-lecture-match.mjs "<transcripts>" --dump > /tmp/dump.txt
awk -F'\t' '$1>0 && $1<0.10 && $3<0.35' /tmp/dump.txt
```

- **Leaning** — a rival lecture beats the lesson's own, by less than the 0.10 flag threshold.
- **Weak own support** — `ownLift` below the p25 of 0.348 (`--calibrate` over all 252 lessons:
  p05 0.175, p25 0.348, p50 0.442, p75 0.509, p95 0.589).

**Both are needed.** Margin alone is mostly topic adjacency: `SCLM-M07-L04` leans by 0.042 while
scoring 0.509 on its own lecture — a lesson doing its job beside a similar one. 18 lessons lean;
only 8 also match their own lecture weakly.

## Result — 8 candidates, 3 confirmed, 1 cleared by reading

| lesson | ownLift | margin | its own lecture | what the lesson is titled | verdict |
| --- | --- | --- | --- | --- | --- |
| `SPMS-M07-L08` | 0.113 | +0.048 | Developmental Methodologies Part 1 | Team roles, architecture ownership, and Agile | **composite** |
| `SPMS-M03-L08` | 0.115 | +0.024 | Tailorability | Delivery models, tailorability, and sourcing | **composite** |
| `SPMS-M06-L09` | 0.130 | +0.035 | ISPMA Framework | Requirement lifecycle, triage, and release planning | **composite** |
| `SPMS-M02-L03` | 0.151 | +0.032 | Markets and Customer Segments | What a market actually is | **cleared — on topic** |
| `SCLM-M06-L02` | 0.152 | +0.021 | — | — | not yet read |
| `IBM-M02-L04` | 0.175 | +0.025 | — | — | not yet read |
| `SPMS-M04-L09` | 0.177 | +0.024 | — | — | not yet read |
| `SCLM-M04-L02` | 0.193 | +0.071 | — | — | not yet read |

`SPMS-M07-L08` has the **third-lowest own support of all 252 lessons** (raw 0.196), behind only
`SPMS-M01-L01` (the known 0.000 case, owner-decided) and `IBM-M01-L04`.

The three confirmed all share one shape: **the lesson title names two or three lectures.** M07-L08
teaches product-manager-versus-product-owner (`M07-L10`'s lecture) and architecture ownership
(`M07-L11`'s) while its own lecture is *Developmental Methodologies Part 1*. M03-L08 teaches
delivery models (`M03-L07`) and sourcing (`M03-L10`) with tailorability as the middle third.
M06-L09 teaches release planning (`M06-L10`/`L11`) and does not appear to teach ISPMA at all.

`SPMS-M02-L03` is the useful negative: low own support, leaning at +0.032, and genuinely correct —
"What a market actually is" teaches *Markets and Customer Segments*, and shares vocabulary with the
sizing lecture next door because the topics are adjacent. **The list is a reading queue, not a
verdict.**

## The finding that changes the plan: composite repair order is forced by the backlog

A composite teaches its neighbours' material, so rewriting it **removes** that material — and
`measure-syllabus-coverage` reads every lesson, cited or not. So a composite is only rewritable once
the lectures it borrowed from have their own lessons. That is not a theory: `SPMS-M05-L06` and
`SPMS-M02-L07` were rewritable on 2026-08-19 **only because the same session had just authored** the
four lessons carrying their halves, and stripping them still dropped `Competitive advantage` and
failed the ratchet until it was taught back.

Checked for all three new ones — **every home lecture is still in the backlog**:

| composite | displaced content belongs to | state |
| --- | --- | --- |
| `SPMS-M07-L08` | `SPMS-M07-L10` (Product Manager vs Product Owner), `SPMS-M07-L11` (Orchestration / Architecture) | both **unauthored** |
| `SPMS-M03-L08` | `SPMS-M03-L07` (Delivery Model), `SPMS-M03-L10` (Sourcing Strategy) | both **unauthored** |
| `SPMS-M06-L09` | `SPMS-M06-L10` (Release Planning Part 1), `SPMS-M06-L11` (Part 2) | both **unauthored** |

**So none of the three can be repaired now**, and attempting it would drop vocabulary with nowhere
to go. The order is: author the two home lectures, *then* rewrite the composite. Cheapest complete
unblock is **module 7** — `M07-L10` (11,095 characters) plus `M07-L11` (12,883) = ~24k, which frees
the worst composite in the corpus. Module 3 costs ~35k, module 6 ~40k.

This reframes the 31-lecture SPMS backlog: it is not only coverage work. **Each backlog pair also
repairs a known-defective lesson**, and three of the five composites found so far are waiting on it.

## Gates

Nothing was authored, so nothing moved. Re-run at the end of the sweep for confirmation:
`check_lesson_file` **0 errors**, bank validator **0 errors / 9 pre-existing warnings**, match gate
at its **expected state** (`SPMS-M01-L01` alone), `check:syllabus` / `check:taught` / `check:tested`
**PASS**, `npm test` **128/128**.

## Not done

- **Four candidates unread** — `SCLM-M06-L02`, `IBM-M02-L04`, `SPMS-M04-L09`, `SCLM-M04-L02`. Each
  needs its lecture read; the score only nominates.
- **The sweep is a recipe, not a gate.** `--dump` plus `awk` is documented in the authoring protocol
  (Step 4c) rather than built into `--gate`, deliberately: the list contains at least one correct
  lesson, so failing a build on it would be calibrating a detector on the population it polices
  (`LAW-75`).
- `IBM-M01-L04` sits at own 0.190 with margin **−0.053** — it matches nothing well but nothing beats
  it, which is a different diagnosis from leaning and is not covered by this sweep.
