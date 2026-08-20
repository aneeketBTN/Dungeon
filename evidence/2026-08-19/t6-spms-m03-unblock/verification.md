# Module 3 unblocked, and the content acceptance is recorded

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed.

## Content acceptance

The owner accepted all outstanding `WAITING_OWNER_CONTENT_ACCEPTANCE` surfaces in chat — 105 at the
time of approval. It clears the gate that blocked `DONE`. **It is not faculty review and creates no
subject-matter authority.**

**Recorded with the discrepancy visible, because there is one.** Owner decision 1 of the same day
was *every lesson per module needs a reading*, with sampling explicitly offered and rejected. That
reading did not happen before this approval. So the acceptance is a **release decision rather than a
completed review**, and the per-lesson reading is now an optional quality activity rather than a gate
anything is blocked on. The resumable checklist that decision 1 called for is therefore not built and
no longer blocking. Stated here rather than smoothed over, because the index would otherwise carry a
claim its own protocol contradicts.

## Module 3 — the second unblock, same template as module 7

| lecture | what happened |
| --- | --- |
| `SPMS-M03-L07` — Delivery Model | **authored** (17,333 ch) |
| `SPMS-M03-L10` — Sourcing Strategy | **authored** (17,602 ch) |
| `SPMS-M03-L08` — Tailorability | **composite rewritten** against its own lecture |

Registered entries **254 → 256**; SPMS **55 → 57 of 84**; backlog **29 → 27**.

## The repair, measured

`SPMS-M03-L08` was titled *"Delivery models, tailorability, and sourcing"* — three lectures, with
its own as the middle third.

| lesson | ownLift before | ownLift after | margin before | margin after |
| --- | --- | --- | --- | --- |
| `SPMS-M03-L08` | **0.115** | **0.589** | **+0.024** | **−0.482** |
| `SPMS-M03-L07` | — | 0.512 | — | −0.403 |
| `SPMS-M03-L10` | — | 0.362 | — | −0.256 |

`L08` moved from the p05 region to own **0.687**, between the p75 (0.625) and p95 (0.718) of the
corpus. Both new lessons clear the p25.

## Two syllabus terms were at risk and were carried deliberately

The composite held two tracked module-3 ideas that its own lecture does not supply. Checked
**before** stripping rather than discovered by the gate afterwards:

- **`Software delivery models`** — the old first paragraph was the only place the phrase occurred.
  `L07`'s opening now reads "the three software delivery models are settled by more than
  convenience".
- **`Sourcing strategy`** — the old glossary carried it. `L10`'s glossary heading is now
  `sourcing strategy` rather than the bare `sourcing`; both forms occur in the transcript.

Coverage held at **116/116, 100%**, with no alias added and no floor touched.

## A spelling trap, handled as the house does

The course spells it **`customization`** — 7 occurrences, while the British `customisation` occurs
**0 times** — but house prose style is British throughout the lesson file. The glossary heading uses
the course's spelling because LAW-49 scores headings against the transcript, and the gloss says so
plainly. Same treatment as `Earlyvangelists` and `BrainKraft`. This is the sixth source trap
recorded.

## A fifth false handoff

`SPMS-M03-L08` promised *"That closes the strategy module. The next module turns to what the product
should cost"* while `L09` and `L10` still followed it. **The promise was moved, not rewritten** — it
now sits on `L10`, which really is the module's last lecture — and `L08` hands off to the service
strategy that actually follows it. Five of these have now been found in five batches, every one
written when its lesson was the last authored one in its module.

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
SPMS-M03-L07  because=471  paras=601,599,569  explainerWords=274
SPMS-M03-L08  because=490  paras=572,544,551  explainerWords=260
SPMS-M03-L10  because=470  paras=581,544,645  explainerWords=259
```

All inside the distribution first time — no trim needed, unlike the previous two batches.

## Real browser

All six titles from this session's module 3 and module 7 work render in the SPMS lesson index (56
rows), and **both old composite titles are absent**. `ui-audit` fetched from the server: **0 on every
detector** at 1035×910 and 375×812.

**A third probe artefact, recorded because the pattern is now the point.** Two checks reported the
new titles missing when they were present: the first was reading SCLM's index after a reload changed
subject, and the second used `document.body.innerText`, which omits text inside collapsed
`<details>`. Both were the instrument, not the code, and both were settled by querying the DOM
directly. Together with the uppercase-label miss earlier today that is three in one session — a
standing reminder that a probe's negative result needs the same scepticism as its positive one.

## Still open

- **One composite still blocked:** `SPMS-M06-L09` needs `M06-L10`+`L11` (~40k). Same template, twice
  proven.
- **Four sweep candidates unread** — `SCLM-M06-L02`, `IBM-M02-L04`, `SPMS-M04-L09`, `SCLM-M04-L02`.
- **27 lectures remain** in the SPMS backlog.
- No screenshots; no LAW-47 run (all uncited, no delivery order changed).
