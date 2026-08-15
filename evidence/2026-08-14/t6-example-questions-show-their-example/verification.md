# Questions that name an example now show it

- **Goal:** every scheduled question whose visible prompt points at a specific example must display
  that example. Audit the whole bank for the defect, then close it.
- **Status transition:** `DIAGNOSED → VERIFIED(REAL_BROWSER + AUTOMATED)` on branch
  `codex/measurement-foundation`. Content acceptance is **not** granted:
  `WAITING_OWNER_CONTENT_ACCEPTANCE`.
- **Changed files:** `app/sets/t6_challenges.js` (the four cases), `app/t6.js` (`caseParagraphs`),
  `app/t6.html` (`#caselet` is a `div` so it can hold paragraphs), `app/t6.css` (case/task
  hierarchy and measure).
- **Environment:** Windows 11, in-app Browser pane, `python tools/server.py 8099`, dark theme,
  1280×720 and 375×812.
- **Reported by:** the owner, from a screenshot of the SPMS multiple-select item
  "In the drilling-machine example, select every need the purchase actually serves." — a stem naming
  an example that nothing on the page contained.

## The audit

The whole active bank was loaded the way `tools/validate_t6_bank.js` loads it (`vm` context over the
five set files) and **all 816 questions** were scanned, not just the reported one. Two passes:

1. **Deictic phrasing** — 16 patterns for a stem that promises a shared referent (`the <X> example`,
   `this example`, `the lecture's <X>`, `the lecture uses/gives/presents/names`, `the case above`,
   `the same scenario`, …) plus a named-company list.
2. **Proper nouns** — every capitalised, non-sentence-initial token in a stem that ships no caselet,
   minus framework acronyms. This is the pass that would catch an example the first pass had no
   pattern for.

Scripts: `scratchpad/audit-examples.js`, `scratchpad/dump-stems.js` (not committed — they read the
bank, hold no state, and the check they perform is now a standing entry in `BUG-LAWS.md`).

### Result

**Every instance is in SPMS Section B's twenty authored multiple-select items**, and nowhere else.
580 of the bank's 816 questions ship a caselet already; the MSQ builder was the one family that
had no way to carry one.

Of the twenty, the stems split three ways:

| Class | Count | Reading |
| --- | --- | --- |
| Names a concrete example the learner never sees | **4** | The defect. Fixed here. |
| Cites "the lecture" as authority for a framework | 15 | Weaker, not the same thing. Reported below, not changed. |
| States its own case in the stem | 1 | `spms_requirements_msq` — the shape the four now match. |

The four:

| id | Old stem | Example it pointed at |
| --- | --- | --- |
| `spms_jtbd_msq` | "In the drilling-machine example, select every need the purchase actually serves." | SPMS-M01-L10 — the doctor, the drill, the ladder of whys |
| `spms_tamsam_msq` | "…that matches the lecture's Zerodha market sizing." | SPMS-M02-L04 — Zerodha's three populations |
| `spms_priority_msq_buckets` | "For the ride-hailing product the lecture uses, select every capability it places in must have." | SPMS-M07-L01 — the MoSCoW feature list |
| `spms_roadmap_msq_sequence` | "…that reads WhatsApp's evolution the way the lecture does." | SPMS-M07-L04 — iPhone before Android |

`spms_jtbd_msq` was the worst of them: its options name "the certificate", "more than a decade of
study" and "new patients" — three definite references to a story nothing on screen had told.

### Why the lesson did not cover it

Three of the four examples survive, compressed, in the lecture's authored lesson, which
teach-before-test guarantees is delivered earlier in the run. That is not the same as showing it:

- **The fourth does not exist anywhere in the app.** `SPMS-M07-L01`'s lesson teaches the four MoSCoW
  levels and the won't-have discipline; it does not carry the ride-hailing bucket assignment the
  question asks for. Before this change that item was answerable only from the transcript.
- **The examiner delivers no lesson at all.** All twenty MSQs are SPMS Section B, sat cold under a
  clock. That is the surface where the defect is total, and it is the surface these items exist for.
- A lesson read fifteen minutes and four questions earlier is memory, not evidence on the page.

## The fix

`addAuthoredMultiSelect` now passes `caselet` through, and the four items carry one. `caselet` is
the field both surfaces already render — `renderQuestion` (case block, `is-long` past 240
characters, "Then decide" kicker) and `buildExamHead` (`.exam-caselet`) — so nothing in `app/t6.js`
changed and every item without one renders exactly as before.

Each case was written from the clean transcript for its own lecture and **withholds the answer**:

- The doctor's own words, not the words *functional*, *emotional*, *social*.
- Zerodha's three populations and the two constraints between them, never labelled TAM/SAM/SOM.
- The candidate features and the three-month bucket, with nothing sorted.
- WhatsApp's dates **and** what the team knew — that fact is the hinge the two wrong readings
  (an oversight, a resourcing accident) turn on, so a learner who cannot see it is choosing between
  three stories rather than reading one.

Stems were re-pointed at the case in front of the learner ("Select every need **this purchase**
actually serves"). **Options, `answers` and `diagnoses` are byte-identical** — the marking contract,
the per-option diagnoses and the LAW-53 shape spread are untouched.

## Second pass — the case had to read like a case (owner, same day)

The first cut was faithful and badly written. `spms_jtbd_msq` ran three parallel reported-speech
clauses — "Asked why she needs them, she says… Asked which photos, she says… Asked why the degree
has to be on display, she says…" — in one 557-character block. It read like minutes of the lecture,
which is what it was.

**Prose.** All four rewritten as scenarios in three beats — situation, what happens, what it costs —
separated by blank lines. The facts and figures are unchanged; only the telling is. The drilling
machine now puts the learner in the shop asking the questions, which is the position the lecture
puts them in and the position the item is testing.

**Rendering.** `caseParagraphs()` splits a caselet on blank lines into paragraphs, escaped, and both
surfaces use it. A case written as one block still renders as one paragraph, so nothing else in the
bank changes. `#caselet` became a `div` because a `p` cannot contain paragraphs.

**Hierarchy.** Three things were wrong and all three were in the CSS, not the content:

| Was | Now |
| --- | --- |
| `.case-label` was screen-reader-only — a sighted learner met an unheralded slab of serif with nothing saying it was the case | Visible **THE CASE** eyebrow, muted micro-caps, the same idiom as `.lesson-kicker` / `.worked-head` |
| `.task-prompt > span { display: none }` hid the kicker globally, so the "Then decide" that JS had computed since the case block was built never reached the page | Shown when `.has-case`, as a **THEN DECIDE** eyebrow |
| Case, provenance chip, vocabulary disclosure and question sat at one even rhythm, so nothing grouped | A 1px rule above the task prompt: everything above it is material, everything below is the ask. A divider, not a nested card — the design rules reserve cards for controls and state changes |

**Measure.** `.caselet.is-long` was unbounded and ran past 100 characters per line on a wide card.
Now `max-width: 62ch` at 16–18px/1.66, measured at **71 characters per line** on the learn surface;
`.exam-caselet` capped at 64ch.

### Verified in a real Browser after the second pass

- Learn, 1280-class viewport: 3 paragraphs, 16px/26.56px, 71 chars/line, `THE CASE` visible,
  kicker `Then decide` visible, 1px rule above the task, overflow 0. Screenshot captured.
- Learn, **375 × 812**: overflow 0, overflowing nodes 0, sub-44px targets 0. Screenshot captured.
- Examiner, Section B: `.exam-caselet` renders 3 paragraphs at 15.5px/25.42px, 609px wide,
  overflow 0. Screenshot captured.
- `node tools/check-palette.mjs` — all pairings within tolerance in both themes, four states
  shape-distinct. (Run because the eyebrows introduce `--muted` text at micro size; no token changed.)
- `node tools/build-site.mjs` — release artifact builds, 18 assets, no new file added to `app/`.

## Verification

### Automated

| Gate | Command | Result |
| --- | --- | --- |
| Syntax | `node --check app/sets/t6_challenges.js` | pass |
| Bank | `node tools/validate_t6_bank.js "<clean transcripts>"` | `ok: true`, **0 errors**, 1 pre-existing warning (IBM option length) |
| Lecture gate really ran | same run, `lessons.coverage` | populated for all four subjects (BRGSA 203/203, IBM 193/193, SCLM 168/168, SPMS 184/184 taught). A no-argument control run was executed alongside and produced the documented empty-`coverage` / extra-warning signature, so the green run above is not that failure mode. |
| Exam pattern | `npm run check:exam SPMS` | exit 0. Section B **20 of 20**; shapes still `3-of-5 ×12, 2-of-4 ×6, 2-of-5 ×2` — LAW-53 holds |
| Suite | `npm test` | **78 / 78** |
| Re-audit | `scratchpad/audit-examples.js` | referential-with-no-case: **12 → 8**, and all four fixed items are gone from it |

### Real Browser — examiner (SPMS Set 1, clock running)

Section B order is seeded and was reproduced offline to target the four items directly; the live
paper agreed (Q1 = `spms_chasm_msq`, as computed).

| Palette | Item | `.exam-caselet` | Stem |
| --- | --- | --- | --- |
| Q10 | `spms_tamsam_msq` | present, 543 ch | "Select every statement that sizes this market correctly." |
| Q11 | `spms_priority_msq_buckets` | present, 493 ch | "Select every capability that belongs in must have for this release." |
| Q14 | `spms_roadmap_msq_sequence` | present, 423 ch | "Select every statement that reads this release history the way the course does." |
| Q19 | `spms_jtbd_msq` | present, 557 ch | "Select every need this purchase actually serves." |

`document.scrollWidth − clientWidth = 0` at Q19 and Q14. Screenshot of Q19 in the running paper
captured — case panel above the stem, options below, palette showing 19 current.

### Real Browser — learn surface

Reached `spms_jtbd_msq` through a genuine run, not a scenario hook: dashboard → concept shelf →
"Practise Jobs to be done on its own" → lesson → primer → lesson → primer → **Question 2 of 5**.

- `case-block.hidden` = `false`, `#caselet` holds the doctor case
- `#caselet.is-long` = `true` (557 ch > 240, so body type not display type)
- `#prompt-flow.has-case` = `true`, `#task-kicker` = **"Then decide"**
- A framework MSQ checked in the same session (`spms_dfv_msq`, via
  `?scenario=measurement-msq-question`) still reports `case-block.hidden = true` — no regression for
  the sixteen items without a case.

At **375 × 812**: horizontal overflow **0**, overflowing nodes **0**, tap targets under 44px **0**,
caselet at 15px/24.3px. Screenshots captured at both viewports.

## Not verified

- **Committing an answer on a changed item was not exercised in the browser.** The pane's input
  driver stopped accepting clicks part-way through (page JS stayed live and screenshots kept
  updating; every `computer` click timed out). The evaluation path is untouched by this change —
  options, `answers` and `diagnoses` are identical and `check:exam SPMS` confirms the scoring shapes
  — but it is not claimed as browser-verified.
- **Light theme** was not re-checked. No colour token changed and the case block is an existing
  component; the palette gate was not re-run for that reason.

## Remaining gates

- `WAITING_OWNER_CONTENT_ACCEPTANCE` — four new caselets and four revised stems are course content
  shown to testers as fact. The owner has not read them. Each is drawn from its own lecture's clean
  transcript, but "drawn from the transcript" is not "accepted".
- Tester-visible, so it owes a change announcement. Draft:
  `outputs/ANNOUNCEMENT-2026-08-14-example-questions.md`.
- Not merged, not deployed.

## Still open, deliberately not changed here

Fifteen of the twenty MSQ stems cite **"the lecture"** as the authority for a framework — "as the
lecture presents them", "every failure the lecture names", "on the lecture's definition". These do
not promise an example and no case would fix them, so they are outside what was reported. They are
still worth a pass: a stem asking what a lecture *said* trains recall of a session, and the same
item asking which statements are *correct* trains the idea. That is authoring work, item by item.

One related defect found in passing and left alone: `spms_roadmap_msq` carries
"WhatsApp launched first on iPhone, with the Android version arriving around 2011" as a **correct
option**. It is a date recall, not a reasoning step, and it sits in a question whose other options
are all framework claims.
