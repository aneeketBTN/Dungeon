# SPMS module 2 — three lessons, the first add-in, and the mechanism behind it

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed. All new prose is `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## What was authored

Under the owner's 2026-08-19 direction: teach a **process**, keep the explainer **small**, make the
lessons **synergistic**, and **fold in** a lecture that does not warrant a lesson of its own.

| lecture | how it is taught | source |
| --- | --- | --- |
| `SPMS-M02-L05` | lesson — *The learning loop* | 5,106 ch |
| `SPMS-M02-L06` | lesson — *Laddering MVPs across loops* | 9,657 ch |
| `SPMS-M02-L09` | lesson — *Moore's adoption curve and the chasm* | 11,390 ch |
| `SPMS-M02-L08` | **add-in**, folded into `L09` — *Market expansion* | 5,919 ch |

Registered entries **248 → 252**; SPMS **49 → 53 of 84**; backlog **35 → 31**.

**L05 and L06 were assessed as a fold-in pair and refused.** On size alone L05 (5,106 characters)
looks like an add-in to L06. Reading them says otherwise: L05 is the loop and the pivot/persevere
decision, L06 is the ladder of successive MVPs and when to stop climbing. Different skills, so two
lessons. The add-in went where the relationship really is setup-to-topic: `L08` into `L09`.

## The add-in mechanism

`lesson()` in `app/sets/t6_lessons.js` expands each `addIns` entry into a real entry in
`window.T6_LESSONS`. That map is the single thing every consumer reads — the app's scheduler and its
LAW-47 walk, `check_lesson_file`, `measure-syllabus-coverage`, `check-taught-vocabulary`,
`check-taught-not-tested` and `check-lesson-lecture-match` — so one change makes a folded-in lecture
count as taught **everywhere at once**. The rejected alternative was a pointer the gates could not
see, which would have read as an unauthored lecture for ever: the "optional work" trap in a new hat.

The contract is lighter by design — no `worked`, no `connects`, since those belong to the host,
which is the unit a learner reads end to end. Everything that keeps the claim falsifiable is still
required: its own objective, its own prose (~80–190 words), its own glossary. It carries **its own**
text rather than aliasing the host's, so the match gate still scores it against its own lecture.

**Two gates judge lesson shape and both had to be taught the contract.** `check_lesson_file.mjs` was
updated first. `tools/validate_t6_bank.js` has an independent set of shape checks, and it **caught
the omission** the moment the first add-in was written — `ok: false`, two errors, naming the missing
worked example and handoff. Found by running the gate, not by reasoning about it.

## Handoffs — two more false ones, both pre-existing

Checking the `connects` above every insertion point again paid, and module 2 held **two**:

- **`SPMS-M02-L07`** promised *"The next session names the two fits that answers"* — pointing at
  `L11` (problem-solution fit and product-market fit) while `L08`, `L09` and `L10` sit between.
- **`SPMS-M02-L11`** promised *"The next session is the gap between the two"* — the chasm, which is
  `L10` and comes **before** it. The two lessons pointed at each other, so a learner following the
  handoffs would have looped.

Both repaired forward: `L07` now hands off to market expansion and the adoption curve, and `L11` to
the guest session that actually follows it. With the module 5 repair this makes **three false
handoffs found in two batches**, all of them written when the lesson was the last authored one in
its module.

## Source verification before writing

Every glossary heading and figure grepped against `SPMS_M02_SUM_TRANSCRIPT.txt` first: `learning
loop` (7), `validated learning` (4), `early evangelist` (5), `persevere` (1), `product pivot` (2),
`segment pivot` (1), `value pivot` (2), `vanity metrics` (2), `activation` (1), `conversion` (1),
`minimum viable product` (3), `hypothesis` (3), `chasm` (5), `innovators` (1), `early adopters` (6),
`early majority` (3), `late majority` (2), `laggards` (2), `Geoffrey Moore` (4), `Everett Rogers`
(1), `market expansion` (3). The one figure used — 84 features where 12 or 14 are needed — was read
back in context rather than recalled.

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | **0 errors**; SPMS 53; add-in counted as authored |
| `validate_t6_bank.js` | **0 errors** after teaching it the add-in contract (2 errors before); 9 warnings, all pre-existing, **none naming a new lesson** |
| `check-lesson-lecture-match.mjs --gate` | **expected state** — `SPMS-M01-L01` alone. 252 scored, and **the add-in did not flag**, so its own prose does match its own lecture |
| `npm run check:syllabus` | **PASS** — SPMS 116/116, 100% on all four |
| `npm run check:taught` | **PASS** |
| `npm run check:tested` | **PASS** at floors |
| `npm test` | **128 / 128** |
| `node tools/build-site.mjs` | 19 assets |

## House-style measurement

```
SPMS-M02-L05  because=414  paras=444,577,448  explainerWords=256
SPMS-M02-L06  because=420  paras=517,513,467  explainerWords=256
```

Both inside the house distribution and **deliberately tighter than the previous batch** (277–296
words, paragraphs to 676), which is the owner's "small explainer" direction made measurable.

## Real browser

Local dev server on 8099, every disclosure expanded, **175,340 characters rendered**.

- All three new lesson titles present in the index.
- **The add-in renders inside its host** — heading *"Also covered here: Market expansion"*, its
  objective, both paragraphs and both glossary terms, followed by the host's own handoff — and it
  does **not** get its own index row, which would have told a learner there are more lessons here
  than there are.
- `ui-audit.js` fetched from the server, run with everything expanded at **375×812**: **0 on every
  detector** — overflow, clipped, hiddenScroll, cutRows, overlaps, ragged, barInset, circleFit,
  tapTargets, typeTooSmall, no sideways scroll.

**A probe error of my own, recorded because it is the house failure mode.** The first check reported
the add-in label as missing. The label was present, visible and correct; `.lesson-read-label` is
styled `text-transform: uppercase` and `innerText` returns rendered text, so a mixed-case search for
"Also covered here" could never match. The instrument was wrong, not the code — the same shape as
the frozen-timeline artefact (`LAW-73`), and it was settled by reading the DOM rather than by
trusting the string search.

## Not done

- No screenshots; no LAW-47 run (these lectures are uncited, so no delivery order changed).
- No second reader. Four more surfaces are `WAITING_OWNER_CONTENT_ACCEPTANCE`, making **102**.
- `SPMS-M02-L07`'s lesson is a **composite** — titled *"MVPs, learning loops, and pivots"*, it
  teaches L05's and L06's material while its own lecture is *Metrics for Learning Loop*. Same class
  as `SPMS-M05-L06`, same reason (it was the only lesson standing in for the area), and the match
  gate cannot see it.

  > **CORRECTED and RESOLVED the same day.** This first said the lesson was "cited and scheduled,
  > so it is an owner call". **It is uncited and unscheduled** — verified against
  > `check_lesson_file`'s never-scheduled list — so the rewrite touched neither scored coverage nor
  > LAW-47. Rewritten against its own lecture:
  > `evidence/2026-08-19/t6-composites-rewritten/verification.md`.
