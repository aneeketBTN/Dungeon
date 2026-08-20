# SPMS modules 2 and 3 complete

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

Four lessons, chosen to **complete two modules** rather than to reduce the backlog fastest:

| lecture | lesson | source |
| --- | --- | --- |
| `SPMS-M02-L12` | A practitioner's view: services against products | 21,664 ch guest session |
| `SPMS-M03-L03` | Go-to-market: two different funnels | 16,682 ch |
| `SPMS-M03-L05` | The business model canvas | 11,002 ch |
| `SPMS-M03-L09` | Service strategy: the rest of the whole product | 18,951 ch |

Registered entries **258 → 262**; SPMS **59 → 63 of 84**; backlog **25 → 21**.
**SPMS modules 1, 2, 3 and 5 are now complete.**

Match scores, all comfortably clear: `M02-L12` ownLift 0.331 (margin −0.236), `M03-L03` 0.483
(−0.370), `M03-L05` 0.546 (−0.270), `M03-L09` 0.387 (−0.254).

## Three defects in my own work, all caught before commit

**1. A forward-reference in the glossary — the gate caught what my check missed.** `SPMS-M03-L05`
glossed `key partners`, and the bank validator failed: *"the course does not use it until
`SPMS-M03-L10`"*. My verification had counted occurrences in module 3 (one) without checking
**where** — and that one occurrence is in L10, four lectures later. LAW-49 requires a term to appear
at **or before** its lecture, and the protocol's own instruction is a first-appearance check
mirroring `firstUse()`. Every evidence file this session has praised doing that check; this batch
skipped it and the gate caught it instead. Term removed; the canvas box is still taught in prose,
which LAW-49 does not govern.

**2. Literal markdown in an explainer.** `SPMS-M02-L12` carried `**…**` around its key sentence. The
renderer sets `textContent`, so those asterisks would have appeared verbatim on screen — a defect no
content gate looks for, since it parses the JavaScript rather than the rendered output. Removed, and
a scan confirms **zero** `**` sequences anywhere in the lesson file.

**3. Over-length explainer, twice.** `M02-L12` came in at **311 words**, trimmed to 301, still over,
and trimmed again to **298** against the ~300 ceiling. Worth recording that the first trim was
insufficient and the measurement had to be re-run — the ceiling is not a target to approach from
above once.

## Content notes

The guest session's most examinable idea is the business-model split: a services business is managed
on **utilization rate** and daily rate, and keeping utilization rate as the main measure **kills a
product business**, because it scores a developer improving the standard product as idle. That is
named in the lecture as a repeated real failure, not a hypothesis, and it became the worked example.

`utilization` is the course's spelling (the British form occurs **0** times), so the glossary heading
follows the course — the third such spelling decision this session, after `customization` and
`BrainKraft`.

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | **0 errors**; SPMS 63 lessons |
| `validate_t6_bank.js` | **0 errors** after the forward-reference fix (1 before); **9 warnings, all pre-existing** |
| `check-lesson-lecture-match.mjs --gate` | **expected state** — `SPMS-M01-L01` alone |
| `npm run check:syllabus` | **PASS** — 100% × 4 |
| `npm run check:taught` / `check:tested` | **PASS** |
| `npm test` | **128 / 128** |
| build | 19 assets; line endings LF |

## House style

```
SPMS-M02-L12  because=456  paras=622,661,598  explainerWords=298
SPMS-M03-L03  because=408  paras=553,666,564  explainerWords=271
SPMS-M03-L05  because=413  paras=472,567,435  explainerWords=247
SPMS-M03-L09  because=457  paras=628,604,456  explainerWords=255
```

All inside the distribution; longest paragraph 666 against the 695 ceiling.

## Real browser

SPMS lesson index renders **62 rows** including all four new titles, and **no literal asterisks**
appear in the rendered text. `ui-audit` fetched from the server: **0 on every detector** at 375×812.

## Still open

- **21 lectures remain**, all SPMS: M4 ×5 (including the 48,232-character Sriraman guest session,
  the longest lecture in the course), M6 ×5, M7 ×5, M8 ×6. **M8 is the heaviest untouched module** —
  six lectures, every one 19–23k.
- Nine composite-sweep candidates unread, spanning all four subjects.
- The concept spine is untouched: the bank still names 35% of the syllabus, and the importance
  ranking that would order that work does not exist.
