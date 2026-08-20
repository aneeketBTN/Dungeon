# SPMS module 7 is complete, and two false handoffs pointed at the same missing lecture

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

| lecture | chars | what happened |
| --- | --- | --- |
| `SPMS-M07-L03` — Requirements Lifecycle | 15,592 | **authored** |
| `SPMS-M07-L07` — Product Lifecycle Management Part 2 | 11,595 | **authored** |
| `SPMS-M07-L09` — Developmental Methodologies Part 2 | 13,657 | **authored** |
| `SPMS-M07-L12` — Product Development | 19,001 | **authored** |
| `SPMS-M07-L13` — User Experience | 18,899 | **authored** |
| `SPMS-M07-L01`, `L02` | — | **false `connects` repaired** |

Registered entries **267 → 272**; SPMS **68 → 73 of 84**; backlog **16 → 11**. **Module 7 is
complete (13 of 13)**, the sixth complete SPMS module after 1, 2, 3, 5 and 6. Remaining: M4 ×5,
M8 ×6.

Module 7 was chosen as the cheapest remaining module completion — ~79k of transcript against M4's
~108k (which carries the 48,232-character Sriraman guest session) and M8's ~126k.

---

## The finding: two consecutive handoffs promising the same absent lecture

`SPMS-M07-L01`'s `connects` read *"the next session puts the surviving list on a time axis as a
roadmap"*. `SPMS-M07-L02`'s read *"the next session places it on a time axis"*. Neither is true:

| position | lecture |
| --- | --- |
| L01 | Prioritisation Technique **Part 1** |
| L02 | Prioritisation Technique **Part 2** |
| L03 | **Requirements Lifecycle** ← was unauthored |
| L04 | Product Roadmap Part 1 ← the "time axis" both were pointing at |

So both lessons skipped over `L03` and promised `L04`. These are the **seventh and eighth** false
handoffs found by checking the `connects` above an insertion point, and they add a new variant to
the record:

- The module 6 case (`M06-L01`) was false **because the lesson was a composite** — its material had
  already been spent, so it had nothing to hand off to.
- This case is false **because the next lecture did not exist yet**. Two authors in sequence looked
  at what was authored rather than at what the module contains, and each wrote a handoff to the
  next lesson *in the file* rather than the next lecture *in the course*.

**That second variant is the one worth guarding against, because it is self-reinforcing:** an
unauthored lecture is invisible in the lesson file, so every neighbouring handoff written from the
file will skip it, and the gap closes over. Read the module's lecture list, not the lesson file,
before writing a `connects`. Repaired to point at Part 2 and at the requirements lifecycle
respectively; the full 13-link chain now reads correctly end to end.

---

## Scores

| lesson | ownLift | margin | nearest rival |
| --- | --- | --- | --- |
| `SPMS-M07-L13` | **0.561** | −0.463 | `M06-L02` |
| `SPMS-M07-L12` | **0.526** | −0.422 | `M08-L09` |
| `SPMS-M07-L03` | **0.512** | −0.419 | `M06-L06` |
| `SPMS-M07-L09` | **0.462** | −0.392 | `M07-L08` |
| `SPMS-M07-L07` | **0.456** | −0.352 | `M07-L06` |

p25 = 0.468, p50 = 0.551 across 272 lessons.

**Two land just below p25 and both are "Part 2" lectures, which is structural rather than a
defect.** `L09` (Developmental Methodologies Part 2) sits next to `L08` Part 1, and `L07` (PLM
Part 2) next to `L06` Part 1; a Part 2 necessarily shares vocabulary with its Part 1, which dilutes
distinctiveness. The margins say it is not a composite in either case — the rivals trail at 0.069
and 0.104, among the widest gaps in the batch. Recorded rather than smoothed over: neither enters
the Step 4c sweep, whose condition is a *near-tied* margin (`> -0.06`) alongside weak own support.

**LAW-76 diff, pre-batch against post-batch: zero untouched lessons moved by ≥0.02.** Second
consecutive batch with no collateral re-scoring.

---

## Content notes worth keeping

- **`Verification versus validation` is a tracked *module 6* syllabus term whose home lecture is
  `M07-L03`.** The syllabus sheet files it under module 6; the course teaches it here, inside the
  requirements lifecycle. Coverage is measured over the whole subject corpus so nothing breaks, but
  anyone hunting for where it is taught should look in module 7.
- **Three neighbouring lessons already held terms this batch would otherwise have re-glossed.**
  `M07-L08` carries `scrum master`, `retrospectives` and `sprint planning`; `M07-L10` carries
  `product owner`, `backlog` and `user stories`; `M07-L06` carries `product lifecycle management`,
  `sunset`, `maturity` and `decline`. All avoided, so `L09` glosses the *practices* (`sprint`,
  `sprint backlog`, `product backlog`, `daily standup`, `ceremonies`, `DevOps`) and leaves the roles
  to `L10`, which is the synergistic shape the owner asked for.
- **Four terms had to be glossed in the plural**, because the course never uses the singular:
  `mood boards`, `wireframes`, `ceremonies`, and `user stories` (the last already held by `L10`).
  That is the `\b<term>\b` gate quirk, caught in advance for the second batch running.
- **`platform shift` was dropped from `L07`'s glossary** — 0 occurrences in its transcript. The idea
  is taught in prose (camera makers failing to move to digital) without being glossed, the same
  handling as `Team roles`.
- `L12`'s lecture names a list of AI tools and explicitly calls them *"indicative and not
  recommendations"*. The lesson teaches the caution — validate what a model produces, because it
  can "accelerate and accentuate your errors" — and does not reproduce the tool list as doctrine.

---

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | `ok: true`, **0 errors**; SPMS 73 lessons |
| `validate_t6_bank.js "<transcripts>"` | `ok: true`, **0 errors**; 272 authored; coverage populated for all 4 subjects |
| `npm run check:syllabus` | **PASS** — SPMS 116/116, all four subjects 100% against 100% floors |
| `npm run check:taught` | **PASS** — no new untaught vocabulary |
| `npm run check:tested` | **PASS** — all four at floor |
| `check-lesson-lecture-match --gate` | **FAIL naming `SPMS-M01-L01` and nothing else** — the expected state |
| `npm test` | **128 / 128** |
| `node tools/build-site.mjs` | 19 assets |
| `tools/browser-checks/teach-before-test.js` | **`ok: true`, 12 routes × 4 subjects, 0 violations, 0 skipped** |
| `node tools/screenshot.mjs --port 8099` | **16 / 16**, 0 failed |

The single M07 vocabulary warning — `cost-value prioritisation` on `M07-L02` — is **pre-existing**
and was in the standing set of nine before this batch. Not introduced here, not addressed here.

### Browser verification

Read in the running app at `http://127.0.0.1:8099/app/t6.html` (the owner's own `localhost` origin
left alone), 272 lessons loaded. All five new titles render inside the **"Read the lessons"**
disclosure carrying `Read-only — no question cites this`, which is correct — module 7 is uncited.
`SPMS-M07-L09` was read end to end as a learner sees it: objective, three paragraphs, worked
example, glossary, handoff. **Zero literal-markdown sequences** across the whole index.

Console carries no JS errors. The only failing request is `/api/written-authority/health` → 404,
the hosted-marking probe the static dev server does not implement; unrelated to this batch and
present on a clean load.

---

## Remaining backlog — 11, all SPMS

**M4 ×5** — `L03` Pricing Strategies (10,052), `L05` Pricing Diagnosis (20,297), `L06` Revenue
Models (20,572), `L08` Financial Management and Forecasting (8,516), `L10` the Sriraman guest
session (**48,232 — the longest lecture in the course**).

**M8 ×6** — `L02` Orchestration of Delivery and Support (22,582), `L04` Legal Aspects (22,843),
`L06` Strategic Management (19,070), `L07` Competitive Strategy (20,065), `L09` ISPMA Framework for
Startups (21,165), `L10` Responsible Product Management (20,259).

M4 is the cheaper completion at ~108k but carries the guest-session outlier; M8 is ~126k spread
evenly across six lectures of 19–23k.
