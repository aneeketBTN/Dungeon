# Linked weaknesses are practised together; isolated ones are named as isolated

- **Goal:** in the weakness route, pair two weak concepts when they are genuinely close,
  check the pair with a surface that tests both, and treat an isolated weakness as isolated —
  including saying so.
- **Status transition:** `UNSTARTED → VERIFIED(REAL_BROWSER + AUTOMATED)` on
  `codex/measurement-foundation`. Not merged, not deployed.
- **Reported by:** the owner — "I'd like weaknesses to also be linked, maybe a way to dynamically
  link 2 weak concepts together if they're close enough? If not, weaknesses that are isolated need
  to be treated as such."
- **Changed files:** `app/t6.js`, `app/t6.css`. New check: `tools/browser-checks/weakness-linking.js`.

## What "close enough" is allowed to mean

Measured before designing anything, because the wrong definition here invents relationships.

`data/graphs/` holds concept graphs for **BEHECON, GER, MACRO, NABM, NPD** — none of the Term 6
subjects. There is no dependency graph for BRGSA, IBM, SCLM or SPMS, and the concept records carry
prose (`bridge`) rather than links. So closeness had to come from the bank itself.

The definition used: **an edge exists where one authored surface tests both concepts at once** —
a question's own `conceptId` plus its `supportingConceptIds`. Deliberately strict, because a link is
only useful if there is something to practise it *on*. Same module, or neighbouring lectures, would
be a claim with no surface behind it.

What that yields on the shipped bank:

| Subject | Concepts | Distinct linked pairs | Concepts with no partner |
| --- | --- | --- | --- |
| BRGSA | 16 | 8 | 0 |
| IBM | 16 | 8 | 0 |
| SCLM | 16 | 10 | 0 |
| SPMS | 16 | 8 | 0 |

Each concept has exactly one partner — its module sibling — joined by a `_match` question and five
boss steps, six surfaces in all. SCLM adds two genuine cross-module edges through
`sclm_syn_inventory`, which tests EOQ, newsvendor and exponential smoothing together. **Nothing
else.** The graph is sparse, so the isolated case is the common one rather than an afterthought.

## The rule

A weakness is paired **only when its linked partner is also weak**. A link to something already
Strong is not a shared weakness, and practising it would repair a gap the learner does not have.
Everything else is isolated, and is reported as isolated rather than quietly grouped.

- `conceptLinks(courseId)` derives the edges from the bank, cached per course.
- `groupWeaknesses` walks the priority-ranked weak set greedily, so the **weakest concept gets first
  choice of partner** — pairing never demotes what the learner most needs. Inside a pair the earlier
  lecture goes first: a shared weakness is no reason to stop building in the course's order.
- A linked unit emits *repair A → repair B → the surface that tests both*. `linkSurface` prefers a
  plain joint question over a boss, since a three-step boss is heavy for a repair run; measured, a
  non-boss joint surface exists for every pair.
- An isolated unit emits one repair, as before.
- If a pair has no available joint surface, it is **not claimed as linked** — the two are practised
  and reported as standing alone. Nothing is asserted that cannot then be checked.

Run length went 8 → **10** (`PRIORITY_RUN_LENGTH`), because a pair costs three items where an
isolated weakness costs one, and at 8 the joint checks would have been bought by dropping concepts.
The two homepage strings that stated "Up to 8 questions" now read the constant instead of restating
it.

`startPriorityPractice` remains the only route ordered by weakness rather than by teaching sequence —
its kicker states the first item's reason, and that contract is unchanged.

## What the learner sees

The kicker now states the shape of the run, e.g.
`Starts here because a confident error needs two independent repairs · 2 linked pairs, 4 on their own`.

A joint surface is labelled **BOTH TOGETHER · TAM, SAM, AND SOM + CROSSING THE CHASM** above the
question.

**That label nearly shipped invisible.** It first went into `#question-pattern`, which sits inside
`.question-meta { display: none }` — hidden by design so diagnostic metadata does not compete with
the question. The DOM check passed on `textContent` and the screenshot showed nothing. It now uses
the task kicker, the eyebrow a learner actually sees, via a `has-kicker` class generalised from the
`has-case` rule added earlier the same day. This is the second time in one session that a computed
label was suppressed by a global rule; `I-CASE-READABILITY` already carries the watch item.

## Verification

### Real Browser — three seeded fixtures through the real route

| Fixture | Weak set | Result |
| --- | --- | --- |
| **Paired** | every concept of four modules | 3 linked pairs, 0 isolated, 9 items — each pair as *repair, repair, link check* |
| **Isolated** | one concept from each of eight modules | **0 pairs, 8 isolated**, 8 items, kicker reads "8 on their own" |
| **Mixed** | two whole modules + four lone concepts | 2 linked pairs, 4 on their own, exactly 10 items |

Fixtures are seeded into the profile and the page reloaded before driving the route — the app reads
its profile once at load (LAW-62), and a first attempt that seeded two fixtures in one session got
the same answer twice, from neither of them.

The paired fixture originally produced **12 items against a stated cap of 10**: the budget was
checked as "is there any room left" rather than "does this unit fit", so a pair starting at 9 ran to
12. A unit that does not fit is now dropped whole rather than split, because half a pair is an
isolated repair mislabelled as a link.

### Standing check — `tools/browser-checks/weakness-linking.js`

Drives the real route across two fixtures, staged over page reloads, and asserts three things:
no claimed pair is absent from the bank's edges; every claimed pair is followed by a surface that
really tests both; and an isolated weakness is never folded into a pair. It recomputes the bank's
edges itself rather than asking the app, since the app is what it is checking.

```
{ "ok": true, "invented": [], "unchecked": [], "misreported": [] }
```

### Gates after the change

| Gate | Result |
| --- | --- |
| `tools/browser-checks/weakness-linking.js` | `ok: true` |
| `tools/browser-checks/lesson-layering.js` | `ok: true` — 40 sets, 253 pairs, 0 descents |
| `tools/browser-checks/teach-before-test.js` (LAW-47) | `ok: true` — 9 sets + mixed builder, 0 violations |
| `npm test` | 78 / 78 |
| `npm run check:exam SPMS` | 0 errors, 0 warnings |
| `node tools/validate_t6_bank.js "<transcripts>"` | `ok: true`, 0 errors, coverage all four subjects |
| `node tools/check-palette.mjs` | all pairings in tolerance, four states shape-distinct |
| `node tools/build-site.mjs` | builds, 18 assets |

Regression checked explicitly: a case question still shows **THE CASE**, its paragraphs, the divider
and **THEN DECIDE** (`prompt-flow` carries `has-case has-kicker`), and horizontal overflow is 0 on
both the link-check and case surfaces.

## Honest limits

- **The link graph is almost entirely module pairs.** Outside SCLM's two cross-module edges, "linked"
  currently means "same module". That is a real relationship the bank can exercise, but it is not a
  rich prerequisite graph, and the feature will only get more interesting when more cross-cutting
  surfaces are authored. Do not describe this as a concept map.
- **Isolation here is relative to the run, not to the subject.** A concept is isolated when none of
  its linked partners are *also weak*. The same concept can be paired in a later run. The copy says
  "on their own", not "unconnected", for that reason.
- Evidence crediting is unchanged: `recordAttempt` already credits every concept a question cites,
  so a joint surface produces evidence for both — which is also why it can close the
  `integrativeEvidence` gate that `conceptPriority` scores at +15.
- Not merged, not deployed. Tester-visible: the weakness route changes shape and length.
  Announcement draft: `outputs/ANNOUNCEMENT-2026-08-14-linked-weaknesses.md`.
