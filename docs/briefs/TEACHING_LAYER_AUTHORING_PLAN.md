# Teaching-layer authoring — run plan

> **Status — COMPLETE and scheduling mechanics superseded, 2026-08-20.** All 283 lecture entries
> are authored and scheduled in their module runs. The queue and cited-only scheduling discussion
> below is a historical baseline, not current application behaviour. Use
> `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` for repairs.

130 lectures have no lesson. This is the plan for writing them. It is self-contained: a fresh
session on any account can take a module, follow it, and produce lessons indistinguishable from
the ones already shipped.

`AGENTS.md` outranks this file, and `docs/authoring/LESSON-AUTHORING-PROTOCOL.md` is the
governing procedure — **read that protocol before authoring**. This plan adds the current work
queue, the decision already taken, and the traps found while authoring the first four.

---

## 0. Read this first — these lessons are readable, but never scheduled

> **Corrected 2026-08-18.** This section previously said "these lessons reach nobody today" and
> that "there is no browse or library view". **That was wrong**, and it contradicted this
> repository's own ledger: `QUALITY-LOG.md` **I50** logged the "Read the lessons" browse tab on
> **2026-08-12**, five days before this plan was written. Re-measured in the running app —
> evidence: `evidence/2026-08-18/t6-teaching-layer-ibm-m02/verification.md`.
>
> Treat this as a warning about the file you are reading. A brief written to be self-contained is a
> second source of truth, and this one drifted from the ledger inside a week. Where it makes a
> factual claim about the app, check the app.

A lesson is **scheduled** only through a scored question citing its lecture: `layeredQueue()`
(line ~486) places it ahead of the first surface citing it, and `lessonVocabulary(question)`
(line ~8817) keys off `sourceIds` too. An uncited lecture's lesson never enters a study run.

But there is a **third** consumer, and it is a browse surface. `renderLessonIndex()`
(`app/t6.js:2166`) fills `#lesson-index`, inside the dashboard disclosure headed **"Read the
lessons"** (`app/t6.html:376`). It renders every authored lesson for the selected subject, in full —
objective, explainer, worked example, glossary, handoff — and it already carries a status for this
exact case: `Read-only — no question cites this` (`app/t6.js:1941`). With IBM selected it reports
"16 taught in practice · 23 readable here only".

So:

- **Every cited lecture is already authored** — BRGSA 50/50, IBM 16/16, SCLM 17/17, SPMS 16/16.
  Scored coverage is complete and none of this work moves it.
- The lectures below are **uncited**. Their lessons are never scheduled into a run, never
  precede a scored question, and never count toward coverage.
- They **are** readable today, from the dashboard, correctly labelled as read-only.

**The owner decided on 2026-08-17 to author them anyway**, for continuity — so each module reads as
a continuous course rather than isolated case studies with gaps. That decision was taken on the
older, mistaken understanding that nobody could read the result; the reality is better than the
decision assumed, so it stands a fortiori. Do not silently re-litigate it. But do not repeat the
old claim either, and do not mistake this for the accident protocol §0 warns about — IBM module 1
was authored in full before anyone checked the citation pattern, which is where its 8
never-scheduled lessons came from.

If the goal ever becomes **scheduled delivery** rather than readability, the lever is questions
citing these lectures — not more authoring, and not a browse surface, which already exists.

---

## 1. Sources, and which is authoritative

| What | Where | Status |
|---|---|---|
| **Clean transcripts — the authority** | `C:\Users\knigh\OneDrive\Desktop\exam\Term 6 Clean Transcripts` | one file per module, lectures behind `## code \| title` |
| **Course notes — second authority** | `docs/course-material/` (gitignored) | all 9 image-only scans now transcribed; zero blind spots |
| ~~AI-Ready Pack~~ | — | **deprecated.** Its dense layer is what LAW-49 exists to catch |

**`tools/build_t6_lessons.mjs` is broken for this job.** It still expects the old pack layout
(`graph/LECTURE_MANIFEST.jsonl`) and throws against the clean transcripts. The
`work/t6_lessons/*_LESSON_CANDIDATES.json` files are stale, built from the deprecated pack. Ignore
both and read the transcripts directly:

```bash
node -e "
var m=require('./tools/lib/clean_transcripts.js').loadLectures('C:/Users/knigh/OneDrive/Desktop/exam/Term 6 Clean Transcripts').lectures;
['IBM-M02-L06','IBM-M02-L07'].forEach(function(id){
  var e=m.find(function(x){return x.lecture_id===id;});
  console.log('==== '+id+' :: '+e.title+' ====');
  console.log(e.text.replace(/\s+/g,' '));
});
"
```

---

## 2. The one rule

**Author from the source. Never invent, never paste.**

This layer exists because the question bank shipped answers built on phrases appearing nowhere in
the course. Re-creating that defect here would be worse, because a lesson is what a learner trusts.

Before writing a lesson, grep-verify **every figure and every intended glossary term** against that
module's transcript. This step is not optional — it is the step that stops the teaching layer
recreating the defect it exists to fix.

```bash
cd "C:/Users/knigh/OneDrive/Desktop/exam/Term 6 Clean Transcripts/IBM"
F=IBM_M02_SUM_TRANSCRIPT.txt
for t in "total cost of healthcare" "primary care" "inverted pyramid"; do
  printf '  %-30s %s\n' "$t" "$(grep -oic "$t" $F)"
done
```

**A term with a count of 0 does not go in the glossary.** No exceptions, no "but it obviously
means the same thing".

This caught a real defect within minutes of starting: the transcript says **"total cost of
healthcare" 4 times and "total cost of care" zero times** — and "total cost of care" was the
glossary heading in the already-shipped `IBM-M02-L04` lesson *and* an entry in `IBM.terms.json`.
Both were realigned. Expect to find more of these; when you do, fix the existing content too.

Where the transcript and the notes use different words, prefer the one the learner will meet in the
exam, and name both in the `plain` text. Precedent: the SPMS slides print **Earlyvangelists** (one
word, abbreviated EVG) while a later document says "early evangelists" — the lesson leads with the
slide form and mentions the other.

---

## 3. Lesson shape

Insert into `app/sets/t6_lessons.js` in **course order** — a lesson for L05 goes after the L04
block and before L06. Order matters for readability only, but reviewers rely on it.

```js
  lesson({
    lectureId: "IBM-M02-L06",
    courseId: "IBM",
    module: 2,
    order: 6,
    title: "Short, concrete, not the lecture's title verbatim",
    objective: "One sentence: what the learner can do after reading. Starts with a verb.",
    explainer: [
      "Paragraph one — roughly 70-75 words.",
      "Paragraph two.",
      "Paragraph three."
    ],
    worked: {
      setup: "A concrete situation, one sentence.",
      move: "The single decision or reading that resolves it.",
      because: "Why that move is right — the reasoning, not a restatement. This is the longest field."
    },
    glossary: [
      {term: "verified term", plain: "Definition in plain language, at point of use."}
    ],
    connects: "One sentence handing off to the next lecture."
  });
```

Hard requirements the gate enforces:

- **`explainer` ≈ 220 words total.** Above ~300 it is rejected as "likely a lecture summary rather
  than a lesson". My first two drafts came in at 322 and 334 and had to be cut. Budget ~70-75 words
  a paragraph and write to it.
- **At least two glossary terms**, every one grep-verified, **no duplicates within a lesson**.
  Renaming a term can silently collide with an existing entry — that happened twice and
  `check_lesson_file` caught it.
- `worked` needs all three of `setup`, `move`, `because`.

---

## 4. Gate every batch — in this order

```bash
node tools/check_lesson_file.mjs
```

Fast, needs no pack, reports every structural defect in one pass. **Run it first** — if the file
does not parse, the bank validator can tell you nothing. Expect one standing warning listing the
lessons no run schedules; that is §0, not a defect. Any *other* warning is yours.

```bash
node tools/validate_t6_bank.js "C:/Users/knigh/OneDrive/Desktop/exam/Term 6 Clean Transcripts"
```

Must be `errors: 0`. This is the vocabulary gate — it is what catches invented terms
automatically, checking each glossary heading against the transcripts **and** the module's own
notes. Never pass it without the pack path: with no argument it now errors rather than reporting a
green tick over zero checks.

```bash
node tools/check-lesson-lecture-match.mjs "C:/Users/knigh/OneDrive/Desktop/exam/Term 6 Clean Transcripts" --gate
node tools/measure-syllabus-coverage.mjs --gate
node tools/check-taught-vocabulary.mjs --gate
npm test
```

All must pass. If coverage drops after you rename a term, the fix is an alias in
`data/syllabus/<SUBJ>.terms.json` naming the lesson's wording — **not** a lowered floor.

**When the validator fires, suspect the matcher before the content.** Across this project it has
been wrong more often than the lessons: ligatures, `-ise/-ize` folding, plural direction
(`carbon markets` vs `carbon market`), and judging notes-derived vocabulary by transcript order.
Four tool defects against three real content defects. Check what the course actually says before
editing a lesson.

---

## 5. Batch size and pace

Six to ten lectures per batch, gated after each. Larger batches multiply bracket defects and exceed
what can be held accurately.

Measured rate when working carefully: **2–4 lessons per turn**, dominated by reading the transcript
and grep-verifying. Budget accordingly — 130 lessons is not a one-sitting job.

If parallelising across sessions, **take one module per session** and say which in your first
message, so two sessions do not edit the same region of `t6_lessons.js`. The file is one big
literal; concurrent edits to adjacent blocks conflict badly.

---

## 6. Done so far

| lecture | title |
|---|---|
| `IBM-M02-L01` | What inclusive healthcare has to cover |
| `IBM-M02-L02` | The inverted pyramid of Indian healthcare |
| `IBM-M02-L03` | Krishna's study: how families actually fall into poverty |
| `IBM-M02-L05` | Staffing a rural hospital: the three incentives |
| `IBM-M02-L06` | Cutting the price without losing the trust |
| `IBM-M02-L07` | Where the Vaatsalya model stopped |
| `IBM-M02-L09` | Why volume is the engine, not the by-product |
| `IBM-M02-L10` | Narayana Heart: cardiac care as an economics problem |
| `IBM-M02-L11` | Three healthcare models, three A's |
| `IBM-M02-L12` | What the education numbers actually say |
| `IBM-M02-L13` | Why the market skips the market it is largest in |
| `IBM-M02-L14` | The demand side: why families ration education |
| `IBM-M02-L15` | Gyanshala: separating design from delivery |
| `IBM-M02-L16` | Three more models, and the skills-versus-education choice |
| `IBM-M02-L17` | Why cross-subsidy does not transfer to a classroom |
| `IBM-M04-L01` | The employment problem RuralShores was built for |
| `IBM-M04-L02` | What a BPO is, and why the urban one leaks people |
| `IBM-M04-L03` | What breaks when you move a BPO to a village |
| `IBM-M04-L06` | Where rural BPO plateaued, and what impact sourcing means |
| `IBM-M06-L01` | Who the informal workforce is, and why nobody speaks for them |
| `IBM-M06-L03` | Four explanations for LabourNet's struggle, and the one it answered |
| `IBM-M06-L04` | Hasiru Dala: a price that changes behaviour, a franchise that changes status |
| `SCLM-M01-L07` | The KPI tree: from a financial number down to a driver you can move |
| `SCLM-M01-L09` | Information, sourcing and pricing: the three that cut across departments |
| `SCLM-M04-L03` | Contracts as incentive design, not price negotiation |
| `SCLM-M04-L06` | Five reasons coordination fails, and the lever for each |
| `SCLM-M04-L07` | CRP, VMI and CPFR: coordination as a working arrangement |
| `SCLM-M04-L08` | The first half in one line, and what the second half changes |
| `SCLM-M08-L02` | Akshaya Patra: the constraints a meal supply chain runs inside |
| `SCLM-M02-L01` | Associative forecasting: when demand is driven by something else |
| `SCLM-M02-L02` | Why supply chain planning starts with a forecast |
| `SCLM-M02-L05` | Judgement methods, and the averaging family |
| `SCLM-M02-L07` | Comparing three methods on one data set |
| `SCLM-M02-L08` | The linear trend equation |
| `SCLM-M02-L09` | Holt's method: a slope that keeps updating |
| `SCLM-M02-L10` | Seasonal relatives: stripping the wave out and putting it back |
| `SCLM-M02-L11` | Aggregate planning: the middle horizon |
| `SCLM-M03-L02` | The four inventory costs, and where to spend attention |
| `SCLM-M03-L04` | The newsstand: what changes when demand is uncertain |
| `SCLM-M03-L07` | Periodic review, and why its buffer has to be bigger |
| `SCLM-M03-L08` | Pooling: shrinking the uncertainty instead of buffering it |
| `SCLM-M05-L02` | Milk: what integrating a supply chain actually changed |
| `SCLM-M05-L03` | Tea, paint and organised retail: three redesigns |
| `SCLM-M05-L04` | Bicycles, cement and Benetton: postponing in space and in time |
| `SCLM-M05-L05` | The four flows, and what a supply chain is for |
| `SCLM-M05-L07` | The ecosystem, and who decides what |
| `SCLM-M05-L08` | Principles for an aspiring supply chain |
| `SCLM-M05-L09` | Measuring the interface, and what mass customization merges |
| `SCLM-M05-L10` | FarmAid: an industry that built more capacity than demand |
| `SCLM-M05-L11` | FarmAid: what a day of inventory costs, and planning the season |
| `SCLM-M05-L12` | FarmAid: the dispatch yard, and where the stockyards go |
| `SCLM-M06-L01` | Cold storage: an industry where most operators lose money |
| `SCLM-M06-L03` | The service provider's side of the chain |
| `SCLM-M06-L04` | When a client removes a layer and the work lands on you |
| `SCLM-M06-L06` | Indian Railways as a service provider, and a closed circuit |
| `SCLM-M06-L08` | Shreeji: route economics, and incentives that reward the wrong thing |
| `SCLM-M06-L09` | Seth Dhaniram's decision: leave the account, or change the business |
| `SCLM-M06-L10` | Professionalising a family logistics business |
| `SCLM-M07-L01` | Laxmi Transformers: the tonnage the plant creates |
| `SCLM-M07-L03` | Trucking in India: the structure behind the price |
| `SCLM-M07-L04` | Why Alibag, and what a delivery term decides |
| `SCLM-M07-L05` | Four inventories, and the four decisions that matter |

**245 lessons in the file. IBM (78/78) and SCLM (71/71) are COMPLETE — two subjects, all sixteen
modules between them** (2026-08-18). Backlog: **SPMS 38 — and that is the whole backlog.**

**Updated 2026-08-18 (later the same day).** `SPMS-M01-L09` and `SPMS-M07-L05` were authored while
clearing `docs/briefs/MISFILED_LESSONS_WORK_ORDER.md` — both received content displaced from lessons
that had been teaching the wrong lecture — so **neither is on the backlog any more**, and the
per-module tables below still list them. Run `node tools/check_lesson_file.mjs "<transcripts>"` for
the live list rather than reading the tables. Next by the thinnest-first rule is now `SPMS-M05` (3),
then `SPMS-M02` (5), `SPMS-M03` (5) and `SPMS-M04` (5).

**Read the work order before authoring anything in SPMS module 1 or module 7.** Seven of module 1's
ten lessons were teaching the wrong lecture, in a broken chain rather than a constant offset, and
`SPMS-M01-L01`'s id names a 685-character takeaways card rather than a lecture — left in place by
owner decision, so the match gate flags it permanently and by design.

**Three things the SCLM run proved worth doing every time.** First, measure before committing —
`worked.because` against 62–521 characters *and* each explainer paragraph against the shipped
distribution, not just the explainer's total word count. Second, run `check_lesson_file.mjs` first,
as §4 orders. Third, **make every scripted edit with Node, never with a language's text-mode
write** — see the CRLF trap below.

**Measure paragraphs, not only totals.** The pre-commit check used here measured `worked.because`
characters and total explainer words, and both passed on every one of the 33 lessons (235–298 words
against a ~300 gate). `ui-audit`'s `density` detector then fired on ten paragraphs and all ten were
mine. The detector alone settles nothing — 81 shipped lessons already exceed its 260-character
threshold — so the test is the **existing distribution**, and it is unambiguous:

| | n | median | p90 | p99 | max |
| --- | ---: | ---: | ---: | ---: | ---: |
| paragraphs shipped before 2026-08-18 | 634 | 454 | 568 | 673 | 799 |

**Exactly one of 634 exceeded 700 characters.** Nine of my 99 did, and eight of the file's top
eleven paragraphs were mine, while the word-count total stayed green throughout — because the
imbalance was *within* each lesson, one long paragraph and two short ones. Budget ~70–75 words a
paragraph and check the longest one, not the sum.

**LAW-50 recurred in six blocks at once, and a length check caught it before insertion.** Six
`explainer: [ … ]` arrays in the SCLM-M02 batch were closed with `},`. The house-style script parses
the explainer to count words, so those blocks reported 467–561 words against a ~250 budget — the
regex had run past the mis-closed array into the glossary. **A length measurement is also a
structure measurement.** If a word count comes back implausibly high, suspect the bracket before the
prose.

**A Python text write flipped the whole lesson file to CRLF.** `io.open(path, 'w')` on Windows
translates `\n` to `\r\n`, so a two-line `connects` repair rewrote all 6,448 lines.
`.gitattributes` says why that is serious: the build copies files straight from the working tree
into `dist/client`, so a line-ending conversion changes the bytes the Worker serves and every asset
hash with them — git normalises the *commit*, not the *build*. Every content gate passed over the
CRLF file, because they all parse the JavaScript rather than compare bytes; it surfaced only when a
`\n`-anchored string search failed. Use `fs.writeFileSync` and check
`(src.match(/\r\n/g)||[]).length === 0` after any scripted edit. **`LAW-74`.**

**Inserting a lesson falsifies the handoff above it — twelve recorded instances now.** Six more in
this run: `SCLM-M03-L01`, `SCLM-M06-L02`, `SCLM-M05-L01`, `SCLM-M05-L06`, `SCLM-M02-L03` and
`SCLM-M02-L06`. Check the `connects` of the lesson above **every** insertion point; this is the most
reliable defect in the work and it is created by authoring, not found by it.

**Check the term's *form*, not just its presence.** The first-appearance check that mirrors
`validate_t6_bank.js`'s `firstUse()` refused `backward integration` before it was written: the
lecture says the federation "backward **integrated**", and the gate's plural tolerance does not
bridge `integrated` → `integration`. The idea went into the explainer prose and only
`forward integration`, which does occur, became a heading. This is the same class as the
`hub-andspoke` and `selfdetermination` traps and the `push versus pull` and `days payable
outstanding` refusals — **now six of them, so expect roughly one per module** and check the exact
form before assuming a term is missing.

**A lecture's transcript position is not always its place in the teaching arc.** `SCLM-M02-L01`
(*Associative Techniques*) opens "so far we have mostly used time series methods … even with
seasonality now" and closes the forecasting arc; positions L02 through L12 form a coherent ascending
sequence and only L01 is displaced. Its lesson is filed **between L10 and L11** with a comment at
the insertion point saying why, so the module reads as a path and every handoff is true of what
follows it. The `lectureId`, `module` and `order` fields still match the manifest exactly — that is
non-negotiable; only the position in the file moved.

**Two shipped lessons did not teach their own lectures, and no gate tests that.** `SCLM-M02-L03`'s
lesson taught L04's method families and error metrics, and L04's opened on L02's push/pull material
while teaching none of its own accuracy half — the module-2 opening sat one lecture off. Both were
rewritten on 2026-08-18 (QUALITY-LOG **I54**), `L05` gained the two-family split it had skipped, and
the L04-before-L03 inversion that most plausibly caused it was removed. **The general point survives
the fix:** the gates check the id against the manifest and the glossary against the transcripts, and
never the body against its own lecture, so both lessons passed every gate for as long as they
existed. Read the lecture you are labelling — this is the one defect class the tooling cannot see.

**The file is not reliably in course order, whatever §3 says.** SCLM module 1 sits L01-L05, **L08,
L06**; SCLM module 2 sits **L04 before L03** (both pre-existing, both left alone) and then carries
L01 deliberately between L10 and L11. Insert yours in the right place relative to its neighbours and
do not assume the surrounding blocks are sorted. The §7 table below has not been regenerated and
still lists finished lectures — trust the live query at the end of this section over it.

Regenerate the live queue at any time — trust this over the table below, which ages:

```bash
node -e "
var m=require('./tools/lib/clean_transcripts.js').loadLectures('C:/Users/knigh/OneDrive/Desktop/exam/Term 6 Clean Transcripts').lectures;
var fs=require('fs');var w={};new Function('window',fs.readFileSync('app/sets/t6_lessons.js','utf8'))(w);
['IBM','SCLM','SPMS'].forEach(function(s){
  var miss=m.filter(function(e){return e.subject===s&&!w.T6_LESSONS[e.lecture_id];});
  console.log(s+': '+miss.length+' remaining');
  miss.sort(function(a,b){return a.module-b.module||a.order-b.order;})
      .forEach(function(e){console.log('   '+e.lecture_id+'  '+e.title);});
});
"
```

---

## 7. The queue — 130 lectures

Suggested order: finish IBM module 2 first (it is half-built and the healthcare arc is coherent),
then take whole modules. Thinnest modules first gives the biggest readability gain per lesson.

### IBM — 50 lessons

**M2 — 11 lectures**

| lecture | title | chars |
|---|---|---:|
| `IBM-M02-L06` | Strategies for Affordable Healthcare | 10898 |
| `IBM-M02-L07` | Challenges in Scaling Healthcare | 7566 |
| `IBM-M02-L09` | Economies of Scale | 7542 |
| `IBM-M02-L10` | Narayana Heart Hospital | 12650 |
| `IBM-M02-L11` | Comparison of the 3 Healthcare Models | 9905 |
| `IBM-M02-L12` | State of Education in India | 9076 |
| `IBM-M02-L13` | Indian Education Market | 6986 |
| `IBM-M02-L14` | Selective Investment in Education | 9043 |
| `IBM-M02-L15` | The Gyanshala Case Study | 14710 |
| `IBM-M02-L16` | Education Models for Rural Empowerment | 10343 |
| `IBM-M02-L17` | Inclusive Healthcare vs Inclusive Education Model | 10102 |

**M3 — 10 lectures**

| lecture | title | chars |
|---|---|---:|
| `IBM-M03-L01` | Microfinance for the Underserved | 5395 |
| `IBM-M03-L02` | Economic Dependence and Lending | 11315 |
| `IBM-M03-L04` | Evolution of the Grameen Model | 11532 |
| `IBM-M03-L06` | Technology Enabled Social Lending | 10577 |
| `IBM-M03-L07` | Rang De Adapting for Greater Impact | 11481 |
| `IBM-M03-L08` | The Impact of Sustainable Microfinance | 9688 |
| `IBM-M03-L09` | Transforminig Lives Through Agriculture | 10906 |
| `IBM-M03-L10` | How IDE Worked for Smallholders | 5536 |
| `IBM-M03-L11` | Building a Sustainable Agricultural Ecosystem | 14431 |
| `IBM-M03-L12` | Evaluating IDE s Business Model | 5772 |

**M4 — 4 lectures**

| lecture | title | chars |
|---|---|---:|
| `IBM-M04-L01` | India s Employment Challenges 2 | 7260 |
| `IBM-M04-L02` | Business Process Outsourcing 2 | 8598 |
| `IBM-M04-L03` | Challenges Faced By RuralShore 2 | 8057 |
| `IBM-M04-L06` | The Future of Rural BPOs and Impact Sourcing 2 | 6276 |

**M5 — 10 lectures**

| lecture | title | chars |
|---|---|---:|
| `IBM-M05-L01` | Understanding the Farmer Income Gap | 5236 |
| `IBM-M05-L02` | Large Corporations Entering the Agricultural Supply Chain | 3415 |
| `IBM-M05-L03` | Reliance s Inclusive Supply Chain Model | 5711 |
| `IBM-M05-L04` | Improving Farmer Productivity and Marker Access | 9414 |
| `IBM-M05-L05` | How Did Reliance Create Value for Farmers | 5831 |
| `IBM-M05-L06` | Potential Concerns and Case Insights | 7757 |
| `IBM-M05-L08` | Building Sustainable Agri Tech Models | 3232 |
| `IBM-M05-L09` | Understanding Energy Poverty | 4480 |
| `IBM-M05-L11` | The Economics of Serving the Base of the Pyramid | 14569 |
| `IBM-M05-L12` | Leadership and Organisational Evolution at SELCO | 17301 |

**M6 — 3 lectures**

| lecture | title | chars |
|---|---|---:|
| `IBM-M06-L01` | Understanding India s Unorganised Workforce | 12705 |
| `IBM-M06-L03` | Key Learnings from the LabourNet Case | 19112 |
| `IBM-M06-L04` | Transforming Waste into Social Value | 22442 |

**M7 — 6 lectures**

| lecture | title | chars |
|---|---|---:|
| `IBM-M07-L01` | Interview with Monappa N Part 1 | 20344 |
| `IBM-M07-L02` | Interview with Monappa N Part 2 | 30455 |
| `IBM-M07-L03` | Interview with Monappa N Part 3 | 10423 |
| `IBM-M07-L06` | GNFC s Neem Initiative | 8801 |
| `IBM-M07-L07` | Impact and Success of GNFC s Neem Initiative | 9324 |
| `IBM-M07-L08` | Challenges and Lessons from GNFC | 18362 |

**M8 — 6 lectures**

| lecture | title | chars |
|---|---|---:|
| `IBM-M08-L02` | Exploring Case Studies in Impact Investment | 12297 |
| `IBM-M08-L03` | Interview with Sanchayan Chakraborty | 26125 |
| `IBM-M08-L04` | Assessing Social Venture Impact | 19610 |
| `IBM-M08-L06` | The Environmental Dimension of Impact | 15077 |
| `IBM-M08-L07` | Inclusive Business Models for Climate Action | 20129 |
| `IBM-M08-L08` | Concluding Inclusive Business Model | 24651 |

### SCLM — 40 lessons

**M1 — 2 lectures**

| lecture | title | chars |
|---|---|---:|
| `SCLM-M01-L07` | KPI Tree | 4681 |
| `SCLM-M01-L09` | Cross Functional Drivers | 18805 |

**M2 — 8 lectures**

| lecture | title | chars |
|---|---|---:|
| `SCLM-M02-L01` | Associative Techniques | 8792 |
| `SCLM-M02-L02` | Role of Forecasting | 8411 |
| `SCLM-M02-L05` | Forecasting Approaches | 17237 |
| `SCLM-M02-L07` | Comparing Methods | 9094 |
| `SCLM-M02-L08` | Techniques for Trend | 13930 |
| `SCLM-M02-L09` | Trend Adjusted Smoothing | 14492 |
| `SCLM-M02-L10` | Seasonality | 16114 |
| `SCLM-M02-L11` | Aggregate Planning | 7112 |

**M3 — 4 lectures**

| lecture | title | chars |
|---|---|---:|
| `SCLM-M03-L02` | Inventory Costs and Classification Systems | 18826 |
| `SCLM-M03-L04` | Newsvendor Motivation | 17843 |
| `SCLM-M03-L07` | P Model | 19191 |
| `SCLM-M03-L08` | Pooling | 15352 |

**M4 — 4 lectures**

| lecture | title | chars |
|---|---|---:|
| `SCLM-M04-L03` | Supply Contracts and Procurement Process | 15044 |
| `SCLM-M04-L06` | Understanding Coordination Obstacles | 14965 |
| `SCLM-M04-L07` | Practical Tools for Supply Chain Coordination | 13972 |
| `SCLM-M04-L08` | Supply Chain Foundations Mid Course Recap | 8152 |

**M5 — 10 lectures**

| lecture | title | chars |
|---|---|---:|
| `SCLM-M05-L02` | Supply Chain Management An Integrated Perspective | 8404 |
| `SCLM-M05-L03` | Supply Chain Re engineering through Industry Cases | 13359 |
| `SCLM-M05-L04` | Re engineering Supply Chains for Cost and Flexibility | 9974 |
| `SCLM-M05-L05` | Supply Chain Flows and Value Creation | 11060 |
| `SCLM-M05-L07` | Supply Chain Ecosystem and Decision Makers | 19062 |
| `SCLM-M05-L08` | Multifunctional Coordination in Supply Chains | 8975 |
| `SCLM-M05-L09` | Performance Measures and Mass Customization in Supply Chains | 5707 |
| `SCLM-M05-L10` | Farm Aid Tractors Industry Context and Logistics Challenges | 5591 |
| `SCLM-M05-L11` | FarmAid Tractors Inventory Planning Stockyard Location Decisions I | 15171 |
| `SCLM-M05-L12` | FarmAid Tractors Inventory Planning and Stockyard Location Decisions II | 16980 |

**M6 — 7 lectures**

| lecture | title | chars |
|---|---|---:|
| `SCLM-M06-L01` | Hasmukhbhai Cold Storage Entrepreneur | 17372 |
| `SCLM-M06-L03` | Seth Dhaniram Service Provider Perspective in Supply Chains | 6380 |
| `SCLM-M06-L04` | Seth Dhaniram C FA Operations and Distribution Challenges | 11126 |
| `SCLM-M06-L06` | Rajashree Cement EOL Experiment and Logistics Turnaround | 13189 |
| `SCLM-M06-L08` | Shreeji Transport Services Role Economics And Driver Incentives | 12172 |
| `SCLM-M06-L09` | Seth Dhaniram C FA | 12697 |
| `SCLM-M06-L10` | Shreeji Transport Services Private Limited 1 | 8695 |

**M7 — 4 lectures**

| lecture | title | chars |
|---|---|---:|
| `SCLM-M07-L01` | Laxmi Transformers | 15945 |
| `SCLM-M07-L03` | Trucking in India Industry Structure and Strategic Challenges | 19547 |
| `SCLM-M07-L04` | Lakshmi Transformers Raw Material Procurement and Distribution Logistics | 7736 |
| `SCLM-M07-L05` | Laxmi Transformers Transportation made Choice and Logistics Cost Analysis | 14825 |

**M8 — 1 lectures**

| lecture | title | chars |
|---|---|---:|
| `SCLM-M08-L02` | Akshaya Patra Foundation Logistics of the Midday Meal Programme I | 9384 |

### SPMS — 40 lessons

**M1 — 1 lectures**

| lecture | title | chars |
|---|---|---:|
| `SPMS-M01-L09` | Product Thinking | 12362 |

**M2 — 5 lectures**

| lecture | title | chars |
|---|---|---:|
| `SPMS-M02-L05` | Learning Loops | 5106 |
| `SPMS-M02-L06` | MVP Strategies for Learning Loops | 9657 |
| `SPMS-M02-L08` | Market Expansion | 5919 |
| `SPMS-M02-L09` | Moore s Tech Market Development Model Market Segment | 11390 |
| `SPMS-M02-L12` | Guest Session 01 with Hans Bernd Kittlaus | 21664 |

**M3 — 5 lectures**

| lecture | title | chars |
|---|---|---:|
| `SPMS-M03-L03` | GTM Practices | 16682 |
| `SPMS-M03-L05` | Business Model Canvas | 11002 |
| `SPMS-M03-L07` | Delivery Model | 17333 |
| `SPMS-M03-L09` | Service Strategy | 18951 |
| `SPMS-M03-L10` | Sourcing Strategy | 17602 |

**M4 — 5 lectures**

| lecture | title | chars |
|---|---|---:|
| `SPMS-M04-L03` | Pricing Strategies | 10052 |
| `SPMS-M04-L05` | Pricing Diagnosis | 20297 |
| `SPMS-M04-L06` | Revenue Models | 20572 |
| `SPMS-M04-L08` | Financial Management and Forecasting | 8516 |
| `SPMS-M04-L10` | Guest Session 02 with Venkataramanan Sriraman | 48232 |

**M5 — 3 lectures**

| lecture | title | chars |
|---|---|---:|
| `SPMS-M05-L05` | Value Communication Customer s Journey | 11415 |
| `SPMS-M05-L07` | Product Launch Part 2 | 24474 |
| `SPMS-M05-L08` | Customer Experience | 19125 |

**M6 — 7 lectures**

| lecture | title | chars |
|---|---|---:|
| `SPMS-M06-L02` | Customer Insights | 19152 |
| `SPMS-M06-L03` | Product Planning Scenarios Part 1 | 13386 |
| `SPMS-M06-L04` | Product Planning Scenarios Part 2 | 12990 |
| `SPMS-M06-L06` | Types of Requirements | 9823 |
| `SPMS-M06-L07` | Sources of Requirements | 10868 |
| `SPMS-M06-L10` | Release Planning Part 1 | 17543 |
| `SPMS-M06-L11` | Release Planning Part 2 | 22320 |

**M7 — 8 lectures**

| lecture | title | chars |
|---|---|---:|
| `SPMS-M07-L03` | Requirements Lifecycle | 15592 |
| `SPMS-M07-L05` | Product Roadmap Part 2 | 17160 |
| `SPMS-M07-L07` | Product Lifecycle Management Part 2 | 11595 |
| `SPMS-M07-L09` | Developmental Methodologies Part 2 | 13657 |
| `SPMS-M07-L10` | Product Manager vs Product Owner | 11095 |
| `SPMS-M07-L11` | Orchestration Product Development Architecture | 12883 |
| `SPMS-M07-L12` | Product Development | 19001 |
| `SPMS-M07-L13` | User Experience | 18899 |

**M8 — 6 lectures**

| lecture | title | chars |
|---|---|---:|
| `SPMS-M08-L02` | Orchestration of Delivery and Support | 22582 |
| `SPMS-M08-L04` | Legal Aspects | 22843 |
| `SPMS-M08-L06` | Strategic Management | 19070 |
| `SPMS-M08-L07` | Competitive Strategy | 20065 |
| `SPMS-M08-L09` | ISPMA Framework for Startups | 21165 |
| `SPMS-M08-L10` | Responsible Product Management | 20259 |
