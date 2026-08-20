# Module 7 unblocked: two lessons authored, the worst composite repaired

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed. New prose is `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## The point of this batch

The composite sweep found three lessons teaching their neighbours' material, and proved all three
**blocked**: rewriting one removes content whose home lecture has no lesson, which drops coverage.
Module 7 was the cheapest complete unblock (~24k of transcript) and held the worst composite in the
corpus. This batch authors the two home lectures and then repairs the composite — the first time the
forced order has been executed deliberately rather than discovered.

| lecture | what happened |
| --- | --- |
| `SPMS-M07-L10` — Product Manager vs Product Owner | **authored** (11,095 ch) |
| `SPMS-M07-L11` — Orchestration / Product Development Architecture | **authored** (12,883 ch) |
| `SPMS-M07-L08` — Developmental Methodologies Part 1 | **composite rewritten** against its own lecture |

Registered entries **252 → 254**; SPMS **53 → 55 of 84**; backlog **31 → 29**.

## The repair, measured

`SPMS-M07-L08` held the **third-lowest own support of all 252 lessons**. It taught
product-manager-versus-product-owner (`L10`'s lecture), business and offering architecture
(`L11`'s) and user-interface-versus-experience (`L13`'s), while its own lecture — *Developmental
Methodologies Part 1* — is about Agile, and only the "sweet spot" sentence came from it.

| lesson | ownLift before | ownLift after | margin before | margin after |
| --- | --- | --- | --- | --- |
| `SPMS-M07-L08` | **0.113** | **0.395** | **+0.048** | **−0.243** |
| `SPMS-M07-L10` | — | 0.500 | — | −0.379 |
| `SPMS-M07-L11` | — | 0.482 | — | −0.364 |

`L08` moved from the bottom of the corpus to above its median (own 0.480 against a p50 of 0.442),
and its lean reversed. Both new lessons land near the p75 of 0.509. No lesson flags.

## Two content decisions worth recording

**Not everything displaced had a home, and it did not need one.** The composite also carried
user-interface-versus-experience (belongs to `M07-L13`, still backlog) and DevOps (`M07-L09`, still
backlog). Checked against `data/syllabus/SPMS.terms.json` before stripping: module 7's tracked ideas
are prioritisation, MoSCoW, RICE, Kano, cost-value, roadmap, release plan, planning horizons,
product lifecycle management, **team roles** and **Agile**. Neither `user interface` nor `DevOps` is
among them, so removing them costs no coverage — they return when their own lectures are authored.

**`Team roles` was held by a lesson *title*, and the phrase is not in the course at all.** It is a
tracked syllabus idea, it occurs **0 times** in the M07 transcripts, and the only thing satisfying
it was the composite's title, *"Team roles, architecture ownership, and Agile"*. Retitling would
have dropped it. It now lives in `L10`'s opening sentence — "different team roles rather than two
ranks of one" — as **prose, deliberately not a glossary heading**, since LAW-49 governs headings and
the course never says it. Coverage held at **116/116, 100%**.

## Source verification

Both lectures read in full before authoring, and `M07-L08`'s own lecture read before rewriting it —
which is what established that the Agile sweet spot genuinely is its content while everything else
in the old lesson was not. Terms grepped against `SPMS_M07_SUM_TRANSCRIPT.txt`: `product owner` (5),
`product manager` (8), `scrum master` (3), `user stories` (2), `backlog` (4), `business outcomes`
(2), `orchestration` (4), `business architecture` (3), `offering architecture` (3), `technical
architecture` (3), `tailorability` (3), `whole product` (4), `waterfall` (4), `Agile Manifesto` (1),
`working software` (3), `sprint planning` (3), `retrospectives` (2).

## A fourth false handoff

`M07-L08` promised *"That is who does what. The final module measures whether any of it worked"* —
pointing at module 8 while **five lectures** still follow it inside module 7. Written when it was the
last authored lesson in the module, exactly like the three before it. It now hands off to
*Developmental Methodologies Part 2*, and the two new lessons chain forward to `L12`.

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | **0 errors** |
| `validate_t6_bank.js` | **0 errors**, **9 warnings — all pre-existing**, none naming a new or rewritten lesson |
| `check-lesson-lecture-match.mjs --gate` | **expected state** — `SPMS-M01-L01` alone |
| `npm run check:syllabus` | **PASS** — SPMS 116/116, 100% × 4 |
| `npm run check:taught` / `check:tested` | **PASS** |
| `npm test` | **128 / 128** |
| build | 19 assets |

## House style

```
SPMS-M07-L08  because=442  paras=475,580,645  explainerWords=263
SPMS-M07-L10  because=448  paras=517,505,560  explainerWords=246
SPMS-M07-L11  because=514  paras=473,565,615  explainerWords=253
```

All inside the distribution. One repair before commit: `L11`'s second paragraph came in at **770
characters**, over the 695 ceiling and the longest in the file. Fixed by **rebalancing rather than
cutting** — the offering-architecture sentence moved to the third paragraph, which was short — so no
teaching was lost to a length limit.

## Real browser

All three titles render, the old composite title is **gone**, the `team roles` phrasing is present,
and `ui-audit` fetched from the server reports **0 on every detector** at 375×812.

## Still open

- **Two composites remain blocked**: `SPMS-M03-L08` needs `M03-L07`+`L10` (~35k), `SPMS-M06-L09`
  needs `M06-L10`+`L11` (~40k). Same forced order; this batch is the template.
- **Four sweep candidates still unread** — `SCLM-M06-L02`, `IBM-M02-L04`, `SPMS-M04-L09`,
  `SCLM-M04-L02`.
- No screenshots; no LAW-47 run (all three lectures uncited, so no delivery order changed). No
  second reader — **105** surfaces now `WAITING_OWNER_CONTENT_ACCEPTANCE`.
