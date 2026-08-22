# IBM and SCLM — Notes-primary study system

**Adopted from the 22 August 2026 BRGSA paper observation**, preserved in
`docs/research/BRGSA_EXAM_FEEDBACK_2026-08-22.md`. The observed paper was materially more
direct than Dungeon had modelled: definitions and frameworks were recalled explicitly, short cases
asked for one method or diagnosis, and ten-mark responses asked for a bounded application plus a
causal justification. This is evidence about BRGSA, not proof of the unseen IBM or SCLM questions.
The owner has directed Dungeon to use the same working assumption for IBM and SCLM.

## Product contract

The primary learning loop is now:

1. **Read the module.** Study presents the complete authored notes in teaching order, including the
   worked move and numerical exoskeleton where one exists.
2. **Enter the module chamber.** Four direct questions sample the module. The chamber does not require
   every concept to be read and tested as a pair, and it does not claim complete module coverage.
3. **Diagnose.** Scored misses write ordinary concept evidence. Correct answers do not schedule extra
   confirmation work, and chamber misses do not insert hidden same-run reattempts.
4. **Repair narrowly.** Only named misses offer the existing focused concept practice. The full Learn
   dashboard is no longer the default front door; its evidence and re-teaching machinery become the
   repair layer behind Study.
5. **Retest on a rotated sample.** A repeat keeps the same four direct shapes but rotates the concepts.

Examiner remains separate. A module chamber is diagnosis after reading; a mock is a complete paper.

Study does not open a module with a concept inventory. Each assessed idea appears in a compact
“Keep from this lecture” recap after the exact lecture that teaches it. Numerical methods follow
their source lecture, while released cases and the chamber sit after the module reading. The reader
therefore teaches before it summarises or tests.

Worked examples serve both revision and understanding without becoming two separate blocks. Show
the **Case → Answer** first, using one bounded task in the observed Section B style; reuse the fuller
causal explanation under “Why this answer works.” The disclosure is optional on screen but expanded
in print/PDF. Do not add a second exam-example panel when the existing worked move can carry both.

## IBM chamber shape

IBM is all written in the published paper, so the chamber preserves generation without turning every
module check into a forty-minute worksheet:

- one direct definition choice;
- one direct case decision;
- one direct concept connection;
- one short case paragraph, followed immediately by the prepared answer spine.

The three choices diagnose course distinctions. The paragraph is deliberately ungraded: it practises
framework → decision → case fact → causal reason without pretending that a self-check is an official
ten-mark score. IBM has ample source material for this rotation: 85 concept records, 946 bank
questions and 177 constructed-response surfaces, including the fixed released-case paper.

## SCLM chamber shape and numerical audit

SCLM uses three direct objective checks followed by the paper format that the module can honestly
supply. Modules 2 and 3 use a numerical; the other modules use matching. The chamber must not invent a
calculation family merely to make every module look symmetrical.

The authored numerical teaching is sufficient for every **currently shipped** numerical family:

| Family | Bank source | Study exoskeleton |
| --- | --- | --- |
| Exponential smoothing | M02-L06, 1 item | Forecasting and exponential smoothing |
| EOQ and annual cost | M03-L03, 2 items | EOQ and the annual cost at an order quantity |
| Newsvendor critical ratio | M03-L05, 1 item | Newsvendor and the critical ratio |
| Safety stock, reorder point, service level and inventory position | M03-L06, 4 items | Safety stock, reorder point, and service level |

This closes a method-explanation check, not a breadth claim. All eight SCLM numericals still come from
four lectures: one in module 2 and seven in module 3. The module 6 cycle-time exoskeleton teaches a
useful numerical way of thinking but currently has no tolerance-graded bank item. Expanding numerical
breadth is future authorship work and should be driven by the actual SCLM paper or faculty evidence,
not by a desire for even module counts.

## Mock re-authoring rule

Future IBM and SCLM mocks should prefer the most direct defensible wording:

- name or expand the framework when the real question would do so;
- give every number, denominator and constraint needed in the prompt;
- ask one explicit task per mark-bearing part;
- make the exemplar answer the exact task before adding nuance;
- keep SCLM working instruction in Study even though the published marking rule awards the numerical
  marks for the final answer within tolerance.

Do not infer topic weight, exact questions or difficulty from the BRGSA observation alone.

### Implemented paper mix and launch contract

The first mock re-authoring pass now makes the rule concrete:

- IBM numbered papers use **2 integrated cases + 8 direct named-framework cases**. The direct
  cases take one source module each before any backfill, so a paper keeps all eight modules while
  most questions still ask one bounded framework move. The complete 65-record written-relevant
  rotation remains seven papers.
- SCLM numericals display the scenario once as the givens and the authored calculation prompt as
  the question. `caselet` and `stem` must never be the same string on a numerical.
- The paper chooser binds launches at the stable container, not to whichever buttons happened to
  exist during one render. A missing paper must produce a visible error; a click must never fail
  silently.

## Reader navigation and PDF contract

On desktop the reader stays centered independently of navigation. A compact `Contents` control
aligns with the module heading and reveals the course/module channel on hover, keyboard focus or
click without changing the text width. At tablet widths it becomes an in-flow horizontal bar; on
phones it stacks above the reader. Reduced-motion preferences remove the transition without
removing the reveal. The active lecture's outcome, Key terms and download utility may follow the
scroll on desktop, but must stay in flow on narrower screens. Key-term jumps must calculate the live
sticky-header offset rather than assume one fixed margin.

Printing has two scopes:

- **Module:** the action appears at the top and bottom of the module and includes the complete
  module in teaching order.
- **Lecture:** a compact icon beside the lecture title prints that lecture only.

Both use the same authored HTML but a dedicated A4 stylesheet. Interactive controls, chambers,
navigation, shadows and skip links are absent; worked explanations are expanded; headings stay with
their opening content; long lectures may flow naturally across pages; glossary and recap columns
retain a shared edge.
