# Module 6 unblocked — the last blocked composite is repaired

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

| lecture | what happened |
| --- | --- |
| `SPMS-M06-L10` — Release Planning Part 1 | **authored** (17,543 ch) |
| `SPMS-M06-L11` — Release Planning Part 2 | **authored** (22,320 ch) |
| `SPMS-M06-L09` — ISPMA Framework | **composite rewritten** against its own lecture |

Registered entries **256 → 258**; SPMS **57 → 59 of 84**; backlog **27 → 25**.

## The repair, measured — and the sweep is now clean

| lesson | ownLift before | after | margin before | after |
| --- | --- | --- | --- | --- |
| `SPMS-M06-L09` | **0.130** | **0.481** | **+0.035** | **−0.311** |
| `SPMS-M06-L10` | — | 0.444 | — | −0.282 |
| `SPMS-M06-L11` | — | 0.406 | — | −0.283 |

**All three composites found by the sweep are now repaired**, and re-running the detector confirms
it: `SPMS-M07-L08`, `SPMS-M03-L08` and `SPMS-M06-L09` no longer appear in the leaning list at all.

Full arc across the three unblocks, every figure measured rather than asserted:

| composite | ownLift | margin |
| --- | --- | --- |
| `SPMS-M07-L08` | 0.113 → **0.395** | +0.048 → **−0.243** |
| `SPMS-M03-L08` | 0.115 → **0.589** | +0.024 → **−0.482** |
| `SPMS-M06-L09` | 0.130 → **0.481** | +0.035 → **−0.311** |

## A correction to the sweep's own diagnosis

The sweep recorded that `SPMS-M06-L09`'s displaced content belonged to `M06-L10`/`L11`. Reading the
lectures showed that was **partly wrong in a useful direction**: the requirement states and triage —
the composite's *first* paragraph — come from `M06-L09`'s **own** lecture, the ISPMA framework. So
that lesson was roughly one-third correct, which is exactly why its ownLift was 0.130 rather than
near zero. The rewrite therefore *expanded* what was already right (atomic requirements, the
repository's fields, the eight states, triage, the specified-to-selected line and deselection) and
moved only the release-planning and compatibility material out.

## Coverage

Module 6 tracks fourteen ideas, six of which the composite alone was holding — `Requirement
lifecycle`, `Triage`, `Release planning`, `Heartbeat principle`, `Change control board` and
`Verification versus validation`. Each was located before stripping:

- **`Requirement lifecycle` occurs 0 times in both M06 and M07** — a syllabus-sheet phrase the
  course never says, the same case as `Team roles`. Carried deliberately in `L09`'s prose ("the
  requirement lifecycle runs bottom-left to top-right"), **not** as a glossary heading, since
  LAW-49 governs headings.
- `Triage` stays in `L09` (its own lecture teaches it). `Heartbeat principle`, `Change control
  board` and `Release planning` move to `L10`/`L11`, whose lectures carry them.
- `Verification versus validation` carries aliases `verification` and `validation`, and
  `SPMS-M06-L05`'s lesson already uses the first — so it never depended on the composite.

Coverage held at **116/116, 100%**. No alias added, no floor touched. Second consecutive batch to
get ahead of the ratchet rather than be caught by it.

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | **0 errors** |
| `validate_t6_bank.js` | **0 errors**, **9 warnings — all pre-existing**, none naming a new or rewritten lesson |
| `check-lesson-lecture-match.mjs --gate` | **expected state** — `SPMS-M01-L01` alone |
| `npm run check:syllabus` | **PASS** — 100% × 4 |
| `npm run check:taught` / `check:tested` | **PASS** |
| `npm test` | **128 / 128** |
| build | 19 assets |

## House style

```
SPMS-M06-L09  because=422  paras=604,656,579  explainerWords=287
SPMS-M06-L10  because=438  paras=604,536,552  explainerWords=271
SPMS-M06-L11  because=426  paras=553,584,580  explainerWords=274
```

Inside the distribution first time; longest paragraph 656 against the 695 ceiling.

## Real browser

SPMS lesson index renders 58 rows including all three new titles, and **none of the three composite
titles survives anywhere**. `ui-audit` fetched from the server: **0 on every detector** at 375×812.

## What the sweep still lists

Nine candidates remain, none of them read. Highest margins first: `SCLM-M04-L02` (+0.071),
`BRGSA-M02-L06` (+0.066), `IBM-M01-L02` (+0.043), `SPMS-M02-L03` (+0.033 — **already read and
cleared**, it teaches its own lecture), `IBM-M02-L04`, `SPMS-M04-L04`, `SPMS-M04-L09`,
`SCLM-M06-L02`, `BRGSA-M07-L04`, `BRGSA-M05-L04`.

Two notes for whoever picks this up. The list **shifted** between runs — `SPMS-M04-L04` and two
BRGSA entries moved as the corpus changed, which is `LAW-76` behaving exactly as documented, so
compare against a pre-batch dump rather than assuming a new entry is a new defect. And the
remaining entries are spread across all four subjects rather than concentrated in SPMS, so the
composite pattern may not be an SPMS-only artefact.

## Still open

- **25 lectures remain** in the SPMS backlog: M2 ×1, M3 ×3, M4 ×5, M6 ×4, M7 ×5, M8 ×6.
- Nine sweep candidates unread.
- No screenshots; no LAW-47 run (all uncited, no delivery order changed).
