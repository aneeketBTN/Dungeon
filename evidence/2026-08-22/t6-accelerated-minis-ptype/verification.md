# Accelerated Minis and exact SPMS P-type behaviour

## Owner clarification

Minis are the last 25–30 minutes before an exam. They are accelerated, objective revision: the
learner chooses an answer, checks it, receives the correction immediately, and moves on. They are
not blank-page worksheets, short full mocks, or mastery evidence.

For SPMS Section B, exactly two options are correct and at most two may be selected. Both correct
earns 2 marks; one correct with no wrong option earns 1; any selected wrong option earns 0. There is
no direct negative mark. A full pair must be changed by unchecking one option or using Clear
Response.

## What shipped

The old 32 static prompt/answer/check cards were replaced by an interactive selector over the
course-grounded bank. Every Mini has exactly eight questions and one question from each module.

| Subject | Mini shape | Boundary |
|---|---|---|
| SPMS | 5 single-choice + 3 P-type MSQ | P-type uses the exact 2 / 1 / 0 rule and two-selection cap |
| BRGSA | 4 single-choice + 4 scenario-choice | Rapid application; the full paper keeps its written sections |
| IBM | 4 single-choice + 4 scenario-choice | Objective translation for revision; the real paper remains written |
| SCLM | 6 single-choice + 1 numerical + 1 match | Rapid recognition plus the paper's numerical/matching forms |

The selector excludes primers, repair steps and examiner-only material, rotates question families,
and changes at least six of eight sampled question ids on the next pass. Mini answers teach
immediately but do not write mastery evidence or manufacture Strong status.

## Progressive disclosure

1. First load shows only four subject choices, each reduced to the subject name and “8 questions ·
   one per module.”
2. Selecting a subject folds the chooser into a compact four-subject strip and gives the selected
   Mini the visual focus.
3. Paper alignment remains visible; the eight-module route and last-minute traps remain closed
   disclosures until requested.
4. Starting the Mini removes the shared eight-topic sidebar and centres only the current question.
5. Motion has a reduced-motion fallback and the release uses cache-busted CSS and JavaScript URLs.

## SPMS bank repair

The bank contained 28 P-type questions: eight already had exactly two correct answers and twenty
had three. Each of the twenty was repaired explicitly by replacing the surplus true statement with
a specific misconception and authored diagnosis; no answer array was silently truncated. The
result is 28/28 exactly-two questions, with 22 using two-of-five and six using two-of-four shapes and
varied correct-answer positions.

## Verification

- Browser, desktop: four-card chooser only; selection folds to four compact subject controls;
  selected SPMS state persists; both optional disclosures start closed.
- Browser, active Mini: topic sidebar hidden, question centred, immediate teaching visible.
- Browser, P-type: one selection enables checking and clearing; two selections disable only the
  remaining options; unchecking re-enables them; Clear Response clears all choices; one clean
  correct selection visibly earns 1/2.
- Browser, 375×812: no horizontal overflow in chooser or active question; the question action stays
  reachable in its sticky footer.
- `npm run check:final-sprints`: PASS for all four subjects; rotation changes SPMS 7/8, BRGSA 6/8,
  IBM 6/8 and SCLM 7/8.
- `npm run check:revision-personas`: PASS for Brilliant-but-lazy, Average Joe and
  Dumb-but-diligent across Speedruns and Minis.
- `npm run check:exam`: 0 errors / 0 warnings; all 28 SPMS P-type questions are exactly-two.
- Transcript-backed bank validator: 2,837 questions, 0 errors, expected 69 extraction-unverified
  glossary warnings.
- Full automated suite: 150/150 PASS.
- Release build: 23 allowlisted assets.

