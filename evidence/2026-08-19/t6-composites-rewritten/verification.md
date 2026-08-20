# The two composite lessons, rewritten against their own lectures

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed. New prose is `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## What was wrong

Two lessons taught their neighbours' material instead of their own, each because it was authored
when it was the only lesson standing in for its whole area:

| lesson | its own lecture | what it actually taught |
| --- | --- | --- |
| `SPMS-M05-L06` | *Product Launch Part 1* — the assess → objectives → customers → positioning framework | launch-as-process, UX vs CX, competitive advantage, NPS/CSAT |
| `SPMS-M02-L07` | *Metrics for Learning Loop* — vanity vs actionable metrics | MVPs, learning loops, the three pivots |

**Neither flagged, and neither could.** `check-lesson-lecture-match` finds a lesson written from
*another* lecture; it cannot see one written from half its own. That blind spot is documented in
its own header and has now cost twice.

## Two corrections to the record

**1. The stated reason for deferring was false.** Both entries — in `AGENTS.md`, the CHANGELOG, the
QUALITY-LOG and two evidence files — said these were *cited and scheduled*, and gave that as why a
rewrite touched scored coverage and had to be an owner call. **Both lessons are uncited and
unscheduled**, verified against `check_lesson_file`'s own never-scheduled list. So the rewrite
touched neither scored coverage, nor LAW-47, nor the scheduler, which never delivers them. The
overstatement is corrected in place in every one of those files rather than quietly dropped.

**2. The real risk was the coverage ratchet, and it fired.** `measure-syllabus-coverage` reads
**every** lesson regardless of citation, so stripping the borrowed halves dropped
**`Competitive advantage`** out of module 5 and the gate failed at **SPMS 99% against a floor of
100%**. Fixed the way the standing rule requires — **taught back where its lecture makes it**, in
`SPMS-M05-L08`, whose transcript says plainly that customer experience *is* a competitive
advantage. No alias added, no floor lowered. Coverage back to **100% on all four**.

## The finding worth keeping

**A composite becomes rewritable only once its borrowed halves have somewhere to live.** These two
were genuinely unfixable before this session: rewriting `M05-L06` in the morning would have dropped
the whole customer-experience vocabulary, and rewriting `M02-L07` would have dropped MVPs, loops and
pivots. They became safe to fix only after `M05-L07`, `M05-L08`, `M02-L05` and `M02-L06` were
authored to carry that material. Sequence, not effort, was the blocker.

## The improvement is measured, not asserted

`--explain` before and after, on each lesson's own lecture against its best rival:

| lesson | own (before → after) | best rival | margin (before → after) |
| --- | --- | --- | --- |
| `SPMS-M05-L06` | **0.263 → 0.530** | 0.325 → 0.278 (`M05-L07`) | **+0.052 → −0.262** |
| `SPMS-M02-L07` | → **0.447** | 0.153 (`M02-L06`) | → **−0.310** |

`M05-L06` had been leaning at +0.052 — a real lean toward Product Launch *Part 2*, under the 0.10
flag threshold and therefore invisible to the gate. Both now match their own lecture roughly twice
as well as any rival.

## Source verification

Both lectures read in full before rewriting. Terms grepped against `SPMS_M05_SUM_TRANSCRIPT.txt`
and `SPMS_M02_SUM_TRANSCRIPT.txt`: `positioning` (9), `obstacles` (2), `anchor customer` (1),
`qualified leads` (1), `beachhead` (1), `battle card` (2), `competitive advantage` (1),
`vanity metric` (2), `causality` (1), `predictive power` (1), `active users` (1), `outcome` (3),
`units sold` (1).

**A fifth source trap, and the gate caught my handling of it.** The launch framework is spelled
**both** `BrainKraft` (M05-L06) and `Braincraft` (M05-L07) — the same framework, two spellings in
adjacent lectures. I first glossed it as *"BrainKraft framework"*, and the vocabulary gate correctly
warned that the phrase appears nowhere: the transcript says *"a framework by a company called
BrainKraft"*. The heading is now `BrainKraft`, the form the course actually uses, with both
spellings noted in the gloss — the same treatment the file already gives `Earlyvangelists`. Warnings
back to the **9 pre-existing**.

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | **0 errors** |
| `validate_t6_bank.js` | **0 errors**, **9 warnings — all pre-existing**, none naming either rewrite |
| `check-lesson-lecture-match.mjs --gate` | **expected state** — `SPMS-M01-L01` alone; neither rewrite flags, and both improved sharply |
| `npm run check:syllabus` | **PASS**, 100% × 4 — after failing at 99% and being repaired properly |
| `npm run check:taught` / `check:tested` | **PASS** |
| `npm test` | **128 / 128** |
| build | 19 assets |

## House style

```
SPMS-M05-L06  because=483  paras=575,651,519  explainerWords=276
SPMS-M02-L07  because=412  paras=390,504,528  explainerWords=240
```

Both inside the distribution. One trim was needed before commit: `M05-L06`'s second paragraph came
in at **745 characters**, over the 695 ceiling and the longest in the file; now 651.

## Real browser

Local server, everything expanded. Both new titles render (*"Planning a launch: assess, objectives,
customers, positioning"* and *"Metrics that can drive a pivot"*), **both old composite titles are
gone**, and the re-homed sentence — *"Customer experience is a competitive advantage"* — renders in
`M05-L08`. `ui-audit` fetched from the server at 375×812: **0 on every detector**.

## Still open

- **No sweep for further composites.** Two were found by reading, not by searching, and the
  detectable signature is now known: a positive margin *below* the 0.10 flag threshold means a
  lesson leans toward a neighbour. Nothing yet runs that query across the other 62 subject-lessons
  authored in the same era, and the gate does not report near-misses. That is the obvious next
  check and it was not done here.
- No second reader; both rewrites are `WAITING_OWNER_CONTENT_ACCEPTANCE`.
