# Building the concept spine — what a concept is, what it costs, and what breaks first

**Written 2026-08-19** on branch `fix/theme-switch-and-login-theming`, the day the teaching layer
closed (283 lectures, 283 taught). This is Stream D of
`docs/briefs/TESTING_LAYER_BUILD_PLAN.md` built out to the level someone can execute: that file
says *widen the concept spine* and sizes it; this one says what a concept actually is in this
codebase, what one costs, and which three things break the moment you add the 65th.

`AGENTS.md` outranks this. **`LAW-72` applies** — every number below was measured today with a
named command, and a disagreement means this file is stale, not that the code is wrong.

**Continuation status — 2026-08-20.** The three breakpoints documented below have now been
exercised rather than merely planned. Module matches **and all five boss steps** chain consecutive
pairs; `configureRuns()` selects from pooled questions at fixed counts (module sets 8, runs 9/10
12) instead of growing sessions with the bank; and authored synthesis surfaces supply cross-module
edges. The current bank is **219 concepts / 2,827 questions** with no isolated concept, and every
one of the 359 named syllabus ideas is reached. IBM's historical pause was superseded by owner
direction the same day: its 73 misses became 69 classified records and four wording repairs.
Foundational layer ideas generate written + objective practice, named frameworks generate written
practice only, and atomic concepts generate objective practice only. A written framework link
carries `supportingConceptIds` without forcing that framework through an objective boss. Sections
below preserve the measured starting point and the failure probes that led to the implementation;
do not read them as current status or as a claim of equal depth per syllabus idea.

---

## 1. Two corrections to the adopted plan, before anything is built

`docs/briefs/DUNGEON_VISION_TO_BUILD.md` defines a finished concept as one that "has a `chain`
position plus an authored `linkedConceptIds` pairing". **Neither of those is a field you can
author.** Measured in the source:

- **`chain` is the module title array.** `course.chain = config.modules` — eight strings, the same
  for every concept in the subject (`app/sets/t6_catalog.js:259`, reassigned at `:404`). There is
  no per-concept chain position. What actually orders concepts is `conceptTeachingRank()`, which
  reads the concept's `source` lecture and looks up its teaching position
  (`app/t6.js:1327`). **The orderable field is `source`, and it already exists.**
- **`linkedConceptIds` is a derived function, not data** (`app/t6.js:1276`). It reads
  `conceptLinks()`, which builds edges by walking every question and pairing its `conceptId` with
  its `supportingConceptIds`. **The thing you author is a question carrying
  `supportingConceptIds`.** There is no concept-level link field anywhere.

Neither correction changes the intent — a concept should be ordered and it should be linked — but
both change what a batch actually writes. **A concept is finished when some question names it in
`supportingConceptIds` alongside another concept.** Nothing else creates a link.

---

## 2. What a concept is, and what one yields

A concept is a single record in `app/sets/t6_catalog.js`. Ten fields, six of them prose:

```js
{id:"brgsa_m1_demand", module:1, source:"BRGSA-M01-L01", name:"Demand validation",
 match:/lean|validat|landing|smoke|survey/i,
 summary:"...",        // the idea in one sentence — drives `explain`, and is the answer explanation
 application:"...",    // the decision rule — drives `apply`, and is the written rubric's criterion
 bridge:"...",         // why it follows — drives `connect` and the repair surface
 caselet:"...",        // one concrete situation
 caseEvidence:"..."}   // what in the caselet settles it
```

**That record generates its own surfaces. You do not write questions.** Measured over the shipped
bank:

| what | surfaces |
| --- | ---: |
| from the record alone | **10** — retrieve ×3, apply ×2, connect ×2, explain, primer, diagnose |
| if it is one of its module's **first two** concepts | **+6** — `distinguish` (module match) ×1, `synthesis` (boss steps) ×5 |
| if a written case names it (BRGSA/IBM only) | +`generate` |

At the measured baseline, 64 concepts produced **920 questions, 14.4 per concept**. An SPMS concept measured end to
end (`spms_dfv`) carries 16 surfaces, every one of them generated.

### This reframes the cost the vision doc states

That document sizes Phase 2 as "roughly 2,000–4,000 new questions". **The unit of work is not a
question — it is a concept record of about six authored sentences.** Taking its own target of one
concept per named syllabus idea:

| | records to author | surfaces they generate |
| --- | ---: | ---: |
| today | 64 | 920 |
| every syllabus idea a concept | **~359** | **~3,600–5,700** |
| the increment | **~295 records** | ~2,700–4,800 |

The question count in the vision doc is right. **The labour it implies is not** — 295 records at six
sentences is roughly 1,800 authored sentences, not 3,000 authored questions. That is the single
most important number in this plan, and it is why the spine is worth widening before anything else
in the testing layer.

**The catch, and it is the whole of §3:** that "+6" line only fires for the first two concepts in a
module, and the +6 is where every link comes from.

---

## 3. Three things break at the 65th concept

### 3.1 `pair.slice(0, 2)` — the third concept in a module gets no link at all

```js
// app/sets/t6_challenges.js:4086
var pair = course.concepts.filter(function (concept) { return concept.module === module; });
if (pair.length < 2) continue;
addModuleMatch(course, module, pair.slice(0, 2), dataById);
for (var bossVariant = 1; bossVariant <= 5; bossVariant += 1) addModuleBoss(course, module, pair.slice(0, 2), dataById, bossVariant);
```

Every module currently holds exactly two concepts, so this reads as harmless. It is not. The module
match (`distinguish`) and the five boss steps (`synthesis`) are **the only generated surfaces that
carry `supportingConceptIds`** — they are what makes `conceptLinks()` produce an edge. So a third
concept added to any module today gets **10 surfaces and zero links**, and
`groupWeaknesses()` will report it `isolated` for ever.

That is why the spine measurement currently shows *"concepts with NO link: 0"* in all four
subjects. It is an artefact of every module holding exactly two, not evidence the mechanism scales.

> **Demonstrated, not inferred.** A probe concept was inserted into SPMS module 1, the gate was run,
> and the file restored. `measure-concept-spine --gate` went from PASS to
> **`FAIL — 1 concept(s) have no link`**, exit 1.
>
> **And the concept it orphaned was `spms_jtbd` — a real, shipped concept, not the one added.**
> `slice(0, 2)` takes the first two in array order, so whichever concept ends up third loses its
> module match and all five boss steps. **Adding a concept to a module can silently strip an
> existing one of every link it had**, and the only visible symptom is that
> `groupWeaknesses()` starts calling it isolated. Insert position is not cosmetic until the call
> site is fixed.

**This is the first code change and it gates everything else.** Two defensible options:

- **Chain the module** — pair concept 1–2, 2–3, 3–4, so every concept links to its neighbours and
  the module reads as a sequence. Cheapest, and it matches how the course teaches.
- **Pair every combination** — n(n−1)/2 matches and 5× that in boss steps. Generates a lot of
  surfaces fast and most of them are low-value; not recommended above three concepts.

Either way, `addModuleMatch` and `addModuleBoss` take a `pair` of exactly two and rotate four
strings (`first.summary`, `second.summary`, `first.application`, `second.application`), so the
generalisation is at the *call site*, not inside them. Neither function needs rewriting.

### 3.2 The link graph is a by-product of written cases, and SPMS has none

Measured edges, and they are nothing like uniform:

| subject | link edges | of which cross-module | objective marks on its paper |
| --- | ---: | ---: | ---: |
| BRGSA | 49 | **41** | 40 of 80 |
| IBM | 35 | **27** | 0 of 100 |
| SCLM | 10 | **2** | 56 of 80 |
| SPMS | 8 | **0** | 75 of 75 |

Every cross-module edge in BRGSA and IBM comes from the `generate` family — integrated written
case prompts, added by `addIntegratedScenarios()`, which runs **only for those two subjects**
(`app/sets/t6_challenges.js:4084`). SCLM's two come from one hand-authored item,
`sclm_syn_inventory`, which is the only concept-linking question in the repository written by hand.
SPMS has neither, so **SPMS has no cross-module links at all.**

**So promise 1 — "concepts build on one another and the sum is greater than the parts" — is
structurally unavailable in SPMS today.** `groupWeaknesses()` can only ever pair an SPMS weakness
with its module partner; across modules it returns `isolated` every time. That is not a content
gap, it is a missing surface class.

**And the fix is not to author written cases for SPMS.** Its paper is 75 objective marks and zero
written, so case prompts there would repeat the error already refused for IBM MCQs: optimising the
gate against the exam. The link surface for an objective paper is an **authored cross-module
`synthesis` MCQ** — one stem, one correct option, testing two concepts at once, carrying both in
`supportingConceptIds`. `sclm_syn_inventory` is the only worked example in the codebase and should
be read before writing the second:

```js
{id:"sclm_syn_inventory", conceptId:"sclm_newsvendor",
 sourceIds:["SCLM-M03-L05","SCLM-M03-L03","SCLM-M02-L06"],
 supportingConceptIds:["sclm_eoq","sclm_smoothing"],
 caselet:"…", stem:"Which model fits best and why?", correct:"…", wrong:[…]}
```

Note `sourceIds` carries **every** lecture involved, not just the primary — LAW-47 gates each
surface on its own `sourceIds`, so a link question is only schedulable once every lecture it names
has a lesson. Since 2026-08-19 that is always true, which is the first thing the completed teaching
layer unblocks.

### 3.3 Study-set composition assumes an even concept count

`app/sets/t6_catalog.js:216-250` builds runs 1–8 from each module's concepts (this adapts on its
own), then:

- run 9 "Connect the whole subject" takes `_connect` from every **even-indexed** concept;
- run 10 "Full practice mock" takes `_connect` from every **odd-indexed** concept plus the synthesis
  items.

With 16 concepts that is a clean 8/8 split. With an odd count the two runs go uneven, and with
many more concepts each becomes far too long — run 9 is budgeted at 11 minutes and run 10 at 18.
Neither breaks, so this is not a blocker; it is a composition decision to make deliberately rather
than discover. It is also the natural place for Phase 4's importance weighting to enter, since
`npm run measure:importance` already produces the ordering.

---

## 3.5 The layer itself — owner direction, 2026-08-19

> *"every concept is surfaced, but importance is how much this concept contributes to the entire
> course as a whole, and other supplementary concepts can help fill the picture. I just need
> proper layer."*

That settles three things this plan had left open, and one of them contradicts what the product
does today.

**Importance is contribution to the COURSE, not to the paper.** The measure is **module reach** —
how many of a subject's eight modules return to the idea. `Startup` appears in 81 of 84 SPMS
lectures across all eight modules; `Crossing the chasm` sits in one. `measure-concept-importance`
now uses module reach for its first component instead of raw lecture count, because volume inside
one module is not a contribution to the whole. Mark share still scales the result — that answers a
different question, *what is worth testing* — and the two are reported separately.

**Today's 64 concepts are not the spine, and the spine has never been modelled.** They were chosen
two per module, so they are module-local by construction:

| subject | concepts reaching ≥6 modules | concepts confined to ≤2 |
| --- | ---: | ---: |
| SPMS | **2 of 16** | 8 of 16 |
| BRGSA | 5 of 16 | 7 of 16 |
| SCLM | **1 of 16** | 11 of 16 |

The ideas the course actually returns to — `Startup`, `Business model`, `Supply chain`,
`Inclusive business` — **are not concepts at all**. That is why nothing in the product can express
that one idea rests on another: the things everything rests on were never modelled.

### The layer, as built

`npm run build:layer -- "<transcripts>"` emits it. Every named syllabus idea gets:

- a **position** — the lecture where it first appears, which is its place in the teaching order;
- a **role** — `spine` (a root of the layer) or `supplementary` (fills the picture in);
- a **parent** — the higher-contribution idea it elaborates.

**324 ideas placed, 35 unmatched, 76 roots.** Spine per subject: BRGSA 14, SCLM 17, SPMS 16,
IBM 29. Roles are derived and an authored `"tier"` on the term entry always wins.

**Every idea is surfaced. The role sets its place in the layer, never whether it is tested** —
which is what keeps this distinct from the tiering owner decision 2 rejected.

**Why the parent is the whole point.** Links are derived from surfaces, so an idea with nothing
above it is isolated and `groupWeaknesses()` can never pair it. Giving every supplementary idea a
parent makes the layer a forest with no dangling nodes, and — because spine ideas span modules —
**cross-module links fall out of the structure** rather than needing to be hand-authored one at a
time. That is the answer to §3.2's SPMS problem.

### Three corrections the derivation needed, all measured

1. **Spine by rank, not threshold.** "Reaches ≥70% of modules" put **40 of 115** SPMS ideas in the
   spine. SPMS vocabulary is broadly distributed, so a threshold meaningful in SCLM is meaningless
   here. A rank of 12 keeps the spine comparable across subjects.
2. **Parents found in a window, not a lecture.** Assigning the highest-reach idea sharing *any*
   lecture produced `Funding stages → Value innovation` and `Dark patterns → Product metrics`. In a
   20,000-character lecture everything co-occurs with everything. This is the identical failure
   that made lecture-granularity foundational-tie score 78% of ideas at a flat 100, and it took the
   identical fix: a 1,200-character window.
3. **Rank candidates by how often the course states them together, not by proximity in the
   syllabus.** Preferring the nearest qualifying parent gave `Payback period → Growth strategies`
   when `Unit economics` was in the same lecture — both qualified and Growth strategies merely
   entered later. Co-occurrence count directly measures *elaborates*; teaching adjacency measures
   nothing. After the fix: `GDPR → Data privacy`, `CCPA → GDPR`, `DPDP → GDPR`,
   `Heartbeat principle → Release planning`.

**It proposes; it does not decide.** After all three fixes roughly three-quarters of parents read
defensibly and the rest do not — `Gross margin → Growth strategies` is still wrong. That is what
the owner pass is for, and why the layer emits as data (`--json`) with an overridable field rather
than being written straight into the catalogue.

**A naming constraint for the ~295 new records.** Matching is lexical and a compound name fails if
any token misses. `MoSCoW and RICE prioritisation` scores zero reach because the course spells it
*prioritization* with a z — while MoSCoW and RICE each appear in three lectures. 35 ideas are
currently unmatched for this reason (`--unmatched`); none is genuinely absent from the course.

---

## 4. The build order

Each step is independently shippable and each one is verifiable before the next.

**Step 0 — generalise the module pairing.** Change the `pair.slice(0, 2)` call site to chain
consecutive concepts. Verify by adding one throwaway third concept and confirming
`conceptLinks()` gives it an edge; the spine harness in §6 reports `concepts with NO link`.
Without this every concept added from Step 2 onward is born isolated.

**Step 1 — give SPMS its first cross-module link.** One authored `synthesis` MCQ on the
`sclm_syn_inventory` pattern, joining two SPMS concepts in different modules. This is the smallest
change that makes `groupWeaknesses()` capable of a cross-module pairing in SPMS at all, and it
proves the surface class before it is used at volume. Expect the SPMS cross-module edge count to go
0 → 1.

**Step 2 — widen one module, end to end, and stop.** Pick the highest-importance module by
`npm run measure:importance -- "<transcripts>" --course SPMS`, take it from two concepts to its full
set of syllabus ideas, and run every gate. One module is the right batch because the failure modes
here are structural: if the ladder, the run lengths, or the readiness copy read wrongly at five
concepts in a module, that shows up at module scale and is cheap to undo.

**Step 3 — decide run 9/10 composition** with real numbers in hand from Step 2, and wire the
importance ranking into it rather than index parity.

**Step 4 — author by importance, module by module.** Only now is this a volume exercise. Order
comes from `measure:importance`, which still wants the owner pass recorded in
`TESTING_LAYER_BUILD_PLAN.md` §2.

**Streams A–C of the testing plan run in parallel and are unblocked by none of this** — drift
repair, partial resolution and the 27 genuine zeros are all edits to questions that already exist.

---

## 5. What a new concept record must satisfy

- **`source` must name a lecture that has a lesson.** Always true since 2026-08-19; re-check with
  `node tools/check_lesson_file.mjs "<transcripts>"` if the lesson file has been edited.
- **All six prose fields authored, `application` especially.** There is a documented precedent:
  BRGSA's concepts once lacked `application`, `conceptData` fell back to a case question's correct
  option, and every BRGSA written prompt shipped a model answer whose last sentence did not follow
  from the question — while IBM, with all sixteen authored, marked at 88% on the identical
  generator. The comment recording this sits at `app/sets/t6_catalog.js:265`.
- **`name` must describe the anchor lecture**, because that lecture is the only evidence the marker
  is shown. Five BRGSA concepts failed this and had to be renamed or have their sources swapped.
- **Prose is authored from the transcript**, under the same rules as a lesson —
  `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` §3, LAW-49 on vocabulary, and no invented figures.
- **`match` is a regex** used to attach material to the concept. Keep it narrow; the RICE-inside-price
  trap recorded in `tools/measure-concept-importance.mjs` applies to any loose pattern.

---

## 6. How every number here was produced

```bash
node tools/check_lesson_file.mjs "<transcripts>"          # lessons behind each concept's source
node tools/check-taught-not-tested.mjs --triage           # what the bank names vs the syllabus
npm run measure:importance -- "<transcripts>"             # the authoring order
npm test && node tools/build-site.mjs
```

```bash
node tools/measure-concept-spine.mjs                      # the table in §2 and §3.2
node tools/measure-concept-spine.mjs --gate               # fails if any concept has no link
```

`tools/measure-concept-spine.mjs` was written for this plan and **is committed**. It loads the six
bank files through `node:vm` with a `window` shim, exactly as `tools/check-taught-not-tested.mjs`
does, and mirrors `conceptLinks()` rather than re-deriving it. `--gate` asserts a structural
invariant — every concept is reachable by `groupWeaknesses()` — rather than a calibrated
threshold, so it does not repeat `LAW-75`. It has been demonstrated failing (§3.1) and passing.

---

## 7. What this plan does not cover

- **Question quality at volume.** The generated families inherit whatever the record says, so a
  weak `summary` becomes a weak `explain` in three places. The standing measurements —
  name-matching, absolutes, option length — should be re-run after the first widened module, not
  after three hundred concepts.
- **The wrong-answer panel's repetition** (161 diagnoses over 55 distinct cues) gets worse in
  proportion to concept count, since the generated `why` is a template with the name slotted in.
- **Phase 3 and 4** of the vision doc, which consume this pool rather than build it.
- The **owner pass on the importance weighting**, still outstanding.
