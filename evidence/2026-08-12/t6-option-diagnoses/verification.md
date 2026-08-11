# Option-level diagnoses and the rebuilt wrong-answer panel

**Date:** 2026-08-12
**Status:** `VERIFIED(REAL_BROWSER + AUTOMATED)` for the mechanism and the panel;
content remains `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## What was wrong

A wrong answer produced a verdict with no reason. The panel printed
`Not yet — this idea will return`, then `question.explanation`, then hid the correct answer
behind a `Show the complete answer` disclosure. Nothing referred to what the learner had
actually chosen. For a `match` question — the case in the owner's report —
`explanation` is `first.summary + " " + second.summary`, so the panel restated both answers
and diagnosed nothing.

Two defects sat underneath it:

1. **The diagnosis slot existed and was never filled or shown.** `question.misconceptions`
   was validated, captured per attempt, and already drove scheduling
   (`recurringMisconception`), but held placeholder strings of the form
   `"selected-belief:" + optionText` and was never rendered.
2. **A live user-visible defect.** `evidence.reasons` is rendered in the concept inspector
   ([mock/t6.js:1023](../../../mock/t6.js)), and interpolates the raw tag. A learner
   repeating a wrong option across two variant families or two blocks saw:
   `The same misconception returned across independent evidence: selected-belief:It
   estimates the total market before speaking to buyers.`
3. **A latent indexing bug.** For multi-part items the misconception was read as
   `misconceptions[partResults.indexOf(false)]` — the *part* index, not the chosen option.
   For a single-blank cloze that is always `0`, so every wrong option reported the same
   misconception regardless of which was picked.

## Audit that sized the work

The bank is generated, not hand-written: 64 concepts × 4 authored fields expand to 792
surfaces. Distractors are borrowed from other concepts, so the generator already knows what
each wrong option means.

| Distractor class (active bank) | Slots | Derivable |
| --- | ---: | --- |
| Another concept's decision | 1,168 | yes |
| Boss integration template (3 fixed) | 480 | yes |
| Another concept's label | 384 | yes |
| Another concept's principle | 256 | yes |
| Another concept's causal chain | 192 | yes |
| Hand-written, no provenance | 207 | no — 78 distinct texts |

2,480 of 2,687 active slots (92.3%) were derivable with no authoring. Provenance was checked
for collisions across all 256 indexed concept texts: **zero ambiguous**, so every lookup
resolves to exactly one concept and one role and the diagnosis is true by construction.

## What changed

- `mock/sets/t6_challenges.js` — provenance index built from the derived concept data at
  generation time, and a diagnosis pass that runs over every question in a course after
  generation. Six recognised families: cross-concept principle / decision / causal chain /
  label, same-concept wrong facet, and the three constructed boss-integration errors.
- `mock/sets/t6_diagnoses.js` (new) — 78 hand-authored diagnoses for distractors with no
  machine-knowable provenance: 3 shared across the catalogue `connect` questions (84 slots)
  and 75 across 25 MCQs.
- `mock/t6.js` — `diagnosisFor` indexes by the chosen option within the failing part, fixing
  the latent bug above. The panel is rebuilt as: verdict → what this choice assumed → catch it
  earlier → what governs this question → the complete answer → why it connects → return note.
  The complete answer is no longer collapsed. The governing line is suppressed when the answer
  key already states it verbatim. `contrastiveFeedback` / `selectedAnswerCopy` are removed,
  superseded by the per-option diagnosis.
- `mock/validate_t6_bank.js` — build gate. Fails when a scheduled distractor lacks a
  diagnosis, when any of `tag`/`label`/`why`/`cue` is empty, when a `why` restates the correct
  answer, or when a `why` addresses the learner rather than the reasoning.
- `briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md` — the authoring contract, so questions
  drafted later inherit it.

## Result

- `node mock/validate_t6_bank.js` → `ok: true`, 0 errors over 792 questions
  (`validator-output.json`).
- **2,943 diagnoses across the active bank; 0 generic fallbacks — 100% specific**
  (`diagnosis-coverage.json`). The 90 remaining generic fallbacks are all inside the 163
  legacy MCQs excluded from scheduling.
- `npm test` → 34 passing.
- `npm run build` → 14 allowlisted assets including `mock/sets/t6_diagnoses.js`.

## Real-browser acceptance

Local server, Chromium, `SCLM → Start this study set`, primer answered correctly, then the
repair cloze answered with a different concept's principle. Rendered panel:

> **Not yet — this idea will return**
>
> **Used another idea's governing principle**
> This choice states the principle behind Bullwhip effect, an idea from another module. This
> question turns on Strategic fit, which is a different rule answering a different question.
>
> **Catch it earlier:** Ask which idea the case is testing before selecting a principle.
> Bullwhip effect and Strategic fit are easy to swap when only the topic is read and not the
> claim.
>
> **The complete answer**
> Choose the corrected principle: Strategic fit aligns the supply chain's efficiency and
> responsiveness with the customer promise and its implied uncertainty.
>
> **Why it connects:** The customer promise creates operating requirements; performance fails
> when the network is built for a different promise.
>
> A different question on the same idea is placed later in this set — not immediately after
> this one.

The `sclm_m1_match` question from the owner's report was checked directly: all three wrong
choices in row 1 now carry distinct diagnoses — `Used another idea's governing principle`,
`Right idea, wrong part of it`, and `Right kind of move, wrong governing idea`. Before this
change the second of those fell through to generic copy.

## Boundary

The mechanism is verified. The 78 authored diagnoses are new learning content and carry the
same `WAITING_OWNER_CONTENT_ACCEPTANCE` boundary as the rest of the transcript-derived bank.
No claim is made that these diagnoses are pedagogically calibrated against real learner
errors; that needs cohort data.
