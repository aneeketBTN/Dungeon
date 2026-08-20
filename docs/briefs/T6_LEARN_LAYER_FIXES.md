# Learn layer — fix list

Companion to `T6_LEARN_LAYER_AUDIT.md`. Every item is independently executable: it names its own
files, its own done-condition, and its own gate. Work them in order within a phase; phases A and B
can run in parallel with C.

**Standing constraints**
- `docs/course-material/` is gitignored and must stay that way. No extract, transcript, or verbatim
  passage from it enters the repo. Authored prose only — the existing contract in
  `docs/authoring/LESSON-AUTHORING-PROTOCOL.md`.
- Nothing from `iimbdbe.rahulkhatri.com` is copied. It is a third party's site.
- All new prose is `WAITING_OWNER_CONTENT_ACCEPTANCE`.
- Owner go-ahead required before any merge or deploy.

Effort: **S** ≈ under an hour · **M** ≈ a session · **L** ≈ multiple sessions.

---

## Phase A — DONE (2026-08-17)

All four items are implemented, gated, and tested. `npm test` **104 → 120**, all four standing
gates exit 0, build unchanged in shape at 19 assets (18 + `t6_coverage.js`), `ui-audit` clean on
every detector at 375 and 1280 in both themes, and contrast on the new elements is 4.88:1 light /
6.77:1 dark against an AA floor of 4.5.

| Item | What landed |
|---|---|
| **A1** | `tools/measure-syllabus-coverage.mjs`, `data/syllabus/*.terms.json` (360 curated terms, names only), `coverage-floors.json` ratchet, `npm run check:syllabus`, 9 tests |
| **A2** | `tools/check-taught-vocabulary.mjs`, allowlist + baseline ratchet, `npm run check:taught`, 7 tests. Found **23 terms over 195 questions**; 6 were naming variants, the rest real |
| **A3** | RICE, requirements traceability, and the vanity/actionable metric contrast authored into `SPMS-M07-L01`, `SPMS-M06-L08`, `SPMS-M08-L03`. Cleared 35 questions; SPMS coverage 36% → 39% |
| **A4** | Coverage stated on the concept shelf, the reading surface, and per module, from generated `app/sets/t6_coverage.js` |

Three things worth carrying forward:

- **The measurement was wrong three times before it was right**, each time in the direction that
  flattered the product. See the correction note in the audit. Both new gates now pin those bugs
  with probe terms rather than with live content, after fix A3 broke the first version of the
  tests by making its fixtures true.
- **A2's finding is the sharpest in the audit**: RICE is on the course's own module 7 revision
  sheet, tested by 13 scored questions, and taught by no lesson. LAW-47 passed over it because it
  checks lecture *citation* and never lesson *content*. That is the second recorded recurrence of
  "a gate that structurally cannot see the defect it is named for" and belongs in `BUG-LAWS.md`.
- **14 terms over 76 questions remain** in the accepted backlog, including `Marginal cost` and
  `Payback period` on the SPMS paper. The gate now fails on anything new.

**Not done in Phase A:** no second reader on the three authored lessons; all new prose is
`WAITING_OWNER_CONTENT_ACCEPTANCE`. Not merged, not deployed.

---

## Phase A (original scope, for reference)

These are cheap, they are honest, and they prevent the gap from widening while B and C run.

### A1 · Build the syllabus-coverage gate — **M**
The audit's central measurement has no permanent home, so nothing stops coverage regressing.

- Add `tools/measure-syllabus-coverage.mjs`.
- Add `data/syllabus/{SPMS,SCLM,IBM,BRGSA}.terms.json` — the examinable term list per module,
  authored from the course revision sheets. **Terms only** (a name and its module), never the
  course's prose. This is what makes the gate committable without shipping course material.
- Report per subject: terms, covered, missing, percentage. `--gate` exits non-zero below a floor.
- Set the initial floor at **today's measured value minus nothing** — BRGSA 88, SCLM 54, SPMS 52,
  IBM 20 — so the gate ratchets upward and can never silently fall.
- Wire into `package.json` as `check:syllabus`.

**Done when:** `npm run check:syllabus` prints the four numbers and exits 0; lowering any subject's
authored coverage makes it exit non-zero.

### A2 · Close the teach-before-test hole LAW-47 cannot see — **M**
LAW-47 checks that a cited lecture *has* a lesson, never that the lesson *contains the idea*.
Currently: RICE 0 lessons / 20 questions; traceability 0 / 23; vanity metrics 0 / 13.

- Extend `tools/validate_t6_bank.js` (or a new `tools/check-taught-vocabulary.mjs`): for every
  scored question, extract its distinctive terms — acronyms, capitalised framework names, and the
  concept's own name tokens — and assert each appears in the prose of a lesson delivered before it.
- Seed an explicit allowlist for legitimate synonym pairs, with a reason per entry
  (`privacy by design` ↔ `data protection by design`).
- Run it across all four subjects and record the full violation list.

**Done when:** the check exists, fails on RICE/traceability/vanity today, and passes once A3 lands.
Log as a REDLINE law in `docs/governance/BUG-LAWS.md` — this is the second recurrence of
"a gate that structurally cannot see the defect".

### A3 · Teach the three ideas that are tested but never taught — **S**
Smallest possible content fix; unblocks A2.

- **RICE** into `SPMS-M07-*`: reach, impact, confidence, effort; the score as a quotient; why it
  ranks where MoSCoW only sorts. The concept is *named* "MoSCoW and RICE prioritisation" — the
  lesson must carry both.
- **Requirements traceability** into `SPMS-M06-L08`: the word, and the customer→product→project
  requirement chain it names.
- **Actionable vs vanity metrics** into `SPMS-M08-L03`: the contrast, which is the examinable half.

**Done when:** A2 passes on all three; `npm run validate:bank` clean.

### A4 · Say what Learn does and does not cover — **S**
The product presents 16 concepts as the subject. The lesson file's own header knows better.

- On the subject card and the readiness line, state coverage from A1's data: *"Learn teaches 16 of
  this subject's ~50 lectures — the ones the paper draws on most. Module 7 is not covered yet."*
- On the reading surface, mark modules with no lesson as **Not written yet**, rather than omitting
  them silently. `renderLessonIndex` already computes a `missing` count (`app/t6.js:2146`) — it is
  currently only reachable when a question cites an unwritten lecture.

**Done when:** a cold learner can see, without opening anything, which modules Learn cannot teach
them. `ui-audit` clean at 375 and 1280 in both themes.

---

## Phase B — Make reading a first-class surface

This is the user's direct ask. None of it requires new content.

### B1 · Promote reading out of "Everything else" — **S**
Currently 7,096px down a 10,402px page — 8.7 phone screens — under a heading that says it is
peripheral.

- Move the reading surface from `§4 Everything else` to its own top-level section beside
  `§2 Ways in`, in `app/t6.html` (block at `:375`).
- Name it **Read the notes**, not "Additional resources".
- Keep the run-first recommendation as the primary action; reading is the parallel route, not a
  footnote.

**Done when:** the surface is reachable in under two screens on a 375px viewport from a fresh load.

### B2 · Count reading as progress — **M**
The sharpest contradiction in the product: the one surface built for reading is the one the
progress model refuses to count. A learner who reads all sixteen lessons still sees "0 of 16".

- Call `markLessonRead` from the index path too (`appendLessonBody`, `app/t6.js:1904`), not only
  from `renderLesson` (`app/t6.js:3908`).
- Introduce a distinct state — **Read**, ahead of *Not started* and behind *Developing* — so
  reading is visibly not the same as demonstrated evidence. Do not let it create Strong.
- Update the surface's note to say what is now true: reading is recorded, and evidence still comes
  from questions.
- Re-run the re-teach probes: `lessonNeedsReteach` (`app/t6.js:592`) must not treat an index read as
  remediation already delivered.

**Done when:** reading a lesson from the index moves that concept to Read; `tests/` covers the
Read→Developing→Strong ordering; `reteach-on-failure.js` still 3/3.

### B3 · Continuous reading mode — **S**
Sixteen collapsed `<details>` means 17 clicks to read a subject.

- Add **Read all** — expand every lesson in module order into one continuous document.
- Persist the expanded state for the session so a scroll position survives a re-render.

**Done when:** one click yields the whole subject as one scrollable read; `ui-audit` clean at 375
and 1280.

### B4 · Print and offline — **S**
`@media print` count in `app/t6.css` is currently **0**. A crammer wants these on paper or on a
phone in a corridor.

- Add a print stylesheet: lesson prose, worked examples and glossary only; drop chrome, buttons,
  and progress furniture; page-break between lessons.
- **Print this subject** on the reading surface.

**Done when:** printing SPMS yields a clean multi-page document with no UI furniture.

### B5 · Search across lessons — **S**
No search exists. A learner who half-remembers "bullwhip" has 17 clicks and no other route.

- A single filter box over lesson titles, objectives, glossary terms and explainer prose, scoped to
  the selected subject.
- Match in the glossary should be first-class: the glossary is already the best-shaped asset in the
  layer and is currently unreachable except by opening the lesson that owns it.

**Done when:** typing a term surfaces every lesson mentioning it, with the glossary hit ranked first.

---

## Phase C — Close the content gap

The real work. 183 named ideas are untaught. Sequence by exam date and by damage.

### C1 · IBM, modules 5–8 — **L** · *highest damage*
20% coverage, the worst of the four. M5 is 0 of 8 and M6 is 0 of 9 — SELCO, LabourNet, waste
enterprise. IBM's paper is heavily case-based and the case specifics are exactly what is missing.

- Author to BRGSA's density: six lectures per module, not two.
- **Blocked on readable source.** All four IBM detailed-note PDFs are scanned images (56 pages, 0
  extractable words). Resolve C0 first.

### C2 · SPMS and SCLM module 1 — **M** · *highest frequency*
Module 1 is what a cold learner opens first, and it is the most broken module in both subjects.

- **SPMS M1:** product definition (parties, value, defined rights, commercial interests); physical
  vs software (marginal cost is the most-tested distinction); family / platform / line; startup
  stages and MVP; `Value = Benefits − (Money + Time + Effort + Risk)`.
- **SCLM M1:** what a supply chain *is*; the three flows; decision phases; the cycle view; ROA
  decomposition; `C2C = DIO + DSO − DPO`.

**Done when:** A1 shows both subjects' M1 at 100%, and a cold learner meets the definition of a
supply chain before being asked to reason about one.

### C3 · SCLM modules 6, 7, 8 — **M**
Three modules at **0%**: Own Your Wagon, Engine on Load, Landlord Port Model, PM Gati Shakti, ULIP,
Dedicated Freight Corridors, Postponement, Kitting, Cross-Docking. Standard examinable terms, all
absent.

### C4 · SPMS modules 5 and 7 — **M**
40% and 35%. Missing: Blue Ocean / value innovation, keystone-dominator-niche ecosystem roles, the
Kano model, PLM's six stages, planning horizons, AARRR and HEART.

### C5 · BRGSA M8 and the two stragglers — **S**
The only subject near done. Growth Operating Systems, Golden Rule, Master Loop (M8); PLG vs SLG and
Revenue Architecture (M7); Brand Snapshot & ICP (M3). Six terms and BRGSA is at 100%.

### C0 · Unblock the scanned source material — **M** · *partly done; still blocks C1*

Attempted 2026-08-17. Tesseract 5.4 at 300 dpi over all nine files recovered 20,390 words, and
**most of it is unusable**. The finding that matters: **seven of the nine files are photographs of
handwritten notebooks**, not scanned print. Share of tokens that are ordinary English words:

| File | Kind | Legibility | Verdict |
|---|---|---:|---|
| SPMS Detailed Notes module 2 | slide deck | 21.2% | usable |
| SPMS Detailed Notes module 1 | slide deck | 7.8% | marginal |
| IBM M1-2, M3-4, M5-6, M7 | handwritten | 3.1–3.9% | noise |
| SCLM Modules 1-2, 3-4, 5 | handwritten | 1.7–1.9% | noise |

Conventional OCR cannot read handwriting, so no amount of tuning fixes the seven. They are fully
legible to a person or a vision model — a sample SCLM page clearly carries the three flows and
`Supply Chain Surplus = Customer Value − Supply Chain Cost`, which is exactly the M1 content the
audit found missing.

- **Remaining work:** read the seven handwritten files visually, page by page, during authoring,
  writing structured notes into the gitignored tree. That is ~155 pages.
- The two SPMS slide decks are extracted and in the scratchpad already.
- Record in `AGENTS.md` which modules were authored from OCR, from visual reading, or from native
  text — a lesson authored from a mis-read table is worse than no lesson.
- Do **not** re-run Tesseract on the handwritten files expecting a different result.

---

## Phase D — Shape, once the words exist

### D1 · Let a lesson carry a table — **M**
Zero of 107 lessons can hold a table; the course's own revision notes are built on them, and 128
appear across the same syllabus on the public notes companion.

- Add an optional `table: {caption, headers, rows}` to the lesson schema; render in
  `appendLessonBody` (`app/t6.js:1904`) and in `renderLesson`.
- First uses: physical vs software products, efficient vs responsive supply chains, MoSCoW vs RICE
  vs Kano, the three decision phases.
- Must pass `ui-audit`'s `hiddenScroll` and `cutRows` at 375 — the eleven-column normal table
  already forced a two-half stack; a lesson table must stack the same way rather than scroll
  sideways.

### D2 · Draw the nineteen shapes the prose already names — **M**
Nineteen lessons invoke a Venn, a canvas, a curve, a frontier or a figure; none renders one.

- Inline SVG, theme-aware via existing tokens — no external assets, no raster images.
- Start with the four that are pure shape: DFV's Venn, the Lean Canvas grid, the
  cost-responsiveness frontier, retention curves.
- Every figure needs a text alternative carrying the same information; the prose stays sufficient
  on its own.

**Done when:** no lesson names a visual it does not show; contrast and type gates clean in both
themes at 375 and 1280.

### D3 · A cram route that matches the real calendar — **S**
The seven-day plan is generic advice. It never mentions that there are four papers, that SPMS and
BRGSA fall on Aug 22 and IBM and SCLM on Aug 23, or that reading is a step.

- Drive the plan from the real exam dates already on the dashboard.
- Make **read the notes** an explicit first step for a subject with no evidence recorded.
- State the honest cost: reading all four subjects end to end is about 2 hours 50 minutes.

---

## Suggested order

1. **A1, A2, A3, A4** — measure, gate, and tell the truth. Cheap, and everything else depends on A1.
2. **B1, B2, B3, B4, B5** — the reading surface. No new content needed; this is the direct ask.
3. **C0**, then **C2, C5, C3, C4, C1** — content by damage and by unblock order.
4. **D1, D2, D3** — shape, once there are enough words to shape.

A1 + A4 + B1 + B2 alone would change the product a cold learner meets in a single session: they
would be told what is and is not covered, the notes would be somewhere findable, and reading them
would count.
