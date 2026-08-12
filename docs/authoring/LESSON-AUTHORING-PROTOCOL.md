# Lesson Authoring Protocol — the 0→80 teaching layer

**Read this before authoring any lesson.** It is written so a session with no memory of the earlier
work can pick up mid-subject and produce lessons indistinguishable from the ones already shipped.

`AGENTS.md` remains the living index and outranks this file. This is the procedure for one specific
job: turning a lecture into a lesson in `app/sets/t6_lessons.js`.

---

## 0. Read this before deciding what to author

**A lesson only reaches a learner if a scored question cites its lecture.** Lessons enter a session
exclusively through `layeredQueue()`, which places them ahead of the first question citing that
lecture. A lesson for an uncited lecture is authored, validated, shipped in the bundle, and **never
delivered to anyone**.

The bank does not cite every lecture. It cites:

| Subject | Lectures in the pack | Lectures the bank cites | Authored |
| --- | --- | --- | --- |
| BRGSA | 50 | 33 | 50 (17 undeliverable) |
| IBM | 78 | 16 (two per module) | 24 (8 undeliverable) |
| SCLM | 71 | 16 | 0 |
| SPMS | 84 | 16 | 0 |

So **full scored coverage needs 32 more lectures, not 233.** Authoring a complete module of IBM
produces roughly two deliverable lessons and eight that no learner will see. This was learned the
expensive way — IBM module 1 was authored in full before the citation pattern was checked.

`node tools/check_lesson_file.mjs "<pack>"` prints the remaining **cited** lectures per subject, in
course order. That list is the work queue. It also warns when authored lessons are undeliverable.

**When to author uncited lectures anyway:** only on an explicit decision that the module should read
as a continuous course, or in anticipation of new questions. It is real work with real value, but it
does not move coverage and no learner sees it today. Never do it by accident.

---

---

## 1. What this job is

The scored bank is a **measurement instrument**. It generates ~12.8 surfaces per concept by
recombining four harvested sentences, so a learner arriving cold met a graded item before anything
explained the idea or the words it was written in. The teaching layer is the fix: one lesson per
lecture, delivered before anything about that lecture is scored.

The material to teach from **already exists** and was ~2% used — the external Term 6 AI-Ready Pack
holds a dense summary and a lossless transcript per lecture. Your job is to author from that source,
not to invent, and not to paste.

**Status:** BRGSA and IBM are both complete on cited lectures (33/33 and 16/16). SCLM and SPMS
remain: 32 cited lectures between them.

---

## 2. Source material

The pack is **external to this repository**. Nothing under it is checked in.

| What | Where |
| --- | --- |
| Pack root | `<T6 pack>` — see the Directory Map in `AGENTS.md` |
| Lecture manifest | `<pack>/graph/LECTURE_MANIFEST.jsonl` — id, subject, module, order, title |
| Dense summary | `<pack>/dense/lectures/<SUBJ>/<MOD>/<LECTURE>_DENSE.txt` |
| Lossless transcript | `<pack>/graph_source/<SUBJ>/<MOD>/<LECTURE>.txt` — **the authority** |
| Clean transcripts (per module) | a separate folder of `<SUBJ>_<MOD>_SUM_TRANSCRIPT.txt` files, convenient for grep |

**The lossless transcript is the authority for what the course says.** The dense file is a bullet
digest and some of its lines are incoherent out of context ("Since, 21% of 38 is nearly 8, 38 plus 8
makes it 46"). The concept index is **not** an authority — its own README calls the terms retrieval
candidates, and it reports "sample size" as first appearing in M02-L03 when M02-L02 is the lecture
*titled* "Sample Size Logic" (LAW-49).

---

## 3. What a lesson is

```js
lesson({
  lectureId: "BRGSA-M08-L01",   // must match the manifest exactly
  courseId: "BRGSA",
  module: 8,                    // must match the manifest
  order: 1,                     // must match the manifest
  title: "ICE prioritisation",
  objective: "Score an experiment on impact, confidence, and ease without inflating any of the three.",
  explainer: [                  // ~150-220 words total, usually 3 paragraphs
    "...",
  ],                            // ← an ARRAY. Closing this with '},' is LAW-50.
  worked: {                     // one concrete case, run end to end
    setup: "...",
    move: "...",
    because: "..."
  },
  glossary: [                   // at least 2; every term the lecture introduces
    {term: "ICE score", plain: "An idea's rank from impact, confidence, and ease scored together."}
  ],
  connects: "Scoring produces a ranked list. The next lecture is what that list has to look like."
});
```

### The authoring contract

- **Prose is authored, never extracted.** The extractor supplies candidates and provenance; you write
  the sentences. Pasted dense bullets do not teach.
- **Use the lecture's own numbers.** Clairo's ₹3,200 blended CAC against ₹10,000 on LinkedIn; the 33%
  signup-to-activation constraint; the 70/20/10 split. Grep each figure against the transcript before
  writing it down. A lesson with invented numbers is worse than no lesson.
- **Every glossary term must appear in the transcripts at or before this lecture.** This is enforced
  as a hard error (LAW-49). A plain-language label for an idea the course teaches without naming is
  allowed, and surfaces as a warning for confirmation.
- **`connects` hands off to the next lecture** so a module reads as a path, not a pile.
- Content stays `WAITING_OWNER_CONTENT_ACCEPTANCE`. All lesson prose is new writing and the owner has
  not accepted it.

---

## 4. The procedure

### Step 0 — find the edge

```bash
node tools/check_lesson_file.mjs "<T6 pack>"
```

Prints, per subject, how many of the **cited** lectures are authored and the exact remaining list, in
course order. That list is the work queue — see §0 for why cited is the only count that moves
coverage. This is how you resume without reading the whole lesson file.

### Step 1 — extract candidates (once per subject)

```bash
node tools/build_t6_lessons.mjs "<T6 pack>" IBM
```

Writes `work/t6_lessons/IBM_LESSON_CANDIDATES.json` — objectives, definition and example lines,
glossary candidates with first-seen provenance, per lecture. Read the batch's candidates rather than
the full transcripts; the transcripts are far too large to hold a module at a time.

### Step 2 — verify before you write

Grep every figure, list, and framework you intend to state, against that module's transcript:

```bash
grep -oiE "[^.]{0,140}(binding currency|70, 20|known winners)[^.]{0,160}\." "<pack or clean transcripts>/IBM_M01_SUM_TRANSCRIPT.txt"
```

And confirm each intended glossary term actually occurs:

```bash
for t in "term one" "term two"; do printf '%-24s %s\n' "$t" "$(grep -oic "$t" "<transcript>")"; done
```

A term with a count of 0 does not go in the glossary. This step is not optional — it is the step
that stops the teaching layer recreating the defect it exists to fix.

### Step 3 — author one module per batch

Six to ten lectures at a time. Larger batches multiply bracket defects (LAW-50) and exceed what you
can hold accurately.

### Step 4 — gate the batch

```bash
node tools/check_lesson_file.mjs
```

Fast, needs no pack, and reports **every** structural defect in one pass — bracket class, missing
fields, malformed worked examples, thin or bloated explainers. Run it after every batch. If the file
does not parse, the bank validator can tell you nothing at all, so this comes first.

```bash
node tools/validate_t6_bank.js "<T6 pack>"
```

Must be `errors: 0`. This enforces the vocabulary gate, manifest agreement, and coverage. Add
`--vocab-report` for the opt-in answer-copy review — it is noisy by design and is **not** a build
signal, because n-gram scanning cannot separate terminology from ordinary English word order.

### Step 5 — verify in the browser

Never skip this because the automated gates are green; they do not cover scheduling.

1. `preview_start` the dev server, open `app/t6.html`.
2. Evaluate `tools/browser-checks/teach-before-test.js` in the page. Expect
   `{ "ok": true, ..., "violations": [] }`. Any violation is a REDLINE failure (LAW-47).
3. Open one newly authored lesson in a study set and read it as a learner would — objective, three
   paragraphs, worked example, glossary, handoff, and the unscored footer.
4. Check the console for errors.

> If the owner is using the app on `localhost:<port>`, run your checks on `http://127.0.0.1:<port>`
> instead. Same server, different localStorage origin, so you cannot corrupt their session.

### Step 6 — full regression

```bash
npm test && node tools/build-site.mjs
```

35 tests, 15 assets. Then update the ledgers per `AGENTS.md`: `CHANGELOG.md`, `QUALITY-LOG.md`, any
new law in `BUG-LAWS.md`, and the evidence file.

---

## 5. Traps that have already caught someone

| Law | Trap |
| --- | --- |
| **LAW-47** | A surface may not precede the teaching of a lecture it cites — and **each surface is gated on its own `sourceIds`, never inherited from the surface it accompanies**. A primer is separately authored and routinely cites different lectures than the question it introduces. This exact hole shipped once, with a comment above it claiming the primer was covered. |
| **LAW-48** | Distractor relevance is a constraint, not a residue of length matching. Do not "fix" a length cue by sorting the pool on word count. |
| **LAW-49** | Course vocabulary is decided by the transcripts, not the concept index, and not by what sounds like a term of art. |
| **LAW-50** | `explainer: [ … ]` closed with `},` instead of `],`. Arrays and objects sit at the same indent inside a lesson record. The failure mode is a file that does not parse, which yields *no* validator signal — silence, not a warning. |

**The meta-trap:** a comment asserting an invariant is not the invariant. LAW-47's hole survived
review because the code said it was handled. Only executing the check found it.

---

## 6. Subject notes

| Subject | Cited lectures | Authored | Note |
| --- | --- | --- | --- |
| BRGSA | 33 | **33/33 complete** | The worked reference. Read a few of its lessons before authoring elsewhere. |
| IBM | 16 | **16/16 complete** | Module 1 was also authored in full before the citation rule was known; 8 of those are undeliverable. Case-heavy — verify every figure against the lecture. |
| SCLM | 16 | 3/16 | Manifest titles carry typos ("Ojectives", "Sypply") — use them verbatim as ids, fix only the lesson `title`. **Not** heavily quantitative, despite an earlier note here saying so: only 3 of its 16 cited lectures carry arithmetic (exponential smoothing M02-L06, EOQ M03-L03, newsvendor M03-L05) and those three are the three already authored. **All 13 remaining are decision cases** — cold storage, cement rail logistics, transformer multimodal, ports/PPP, LEADS, Akshaya Patra, FarmAid stockyard — plus conceptual frameworks (strategic fit, drivers, S&OP, sourcing portfolio, bullwhip, re-engineering). Do not go hunting for numbers that are not there; a `worked` example for these runs the lecture's own case decision end to end, not a calculation. |
| SPMS | 16 | 0/16 | Framework-dense (JTBD, TAM/SAM/SOM, Lean Canvas, crossing the chasm). Check whether the course uses a framework's standard vocabulary or its own before glossing. |

**The one real difference from BRGSA:** BRGSA had faculty-written objectives in 25 of its 50 dense
lectures, which could be extracted and sharpened. IBM, SCLM, and SPMS have almost none, so each
`objective` must be inferred from the lecture's content and authored from scratch. Expect this to be
the slowest part of each lesson, and keep the objective behavioural — *what the learner can now do*,
not *what the lecture covered*.

---

## 7. Definition of done, per subject

- `node tools/check_lesson_file.mjs "<pack>"` reports `SUBJECT: COMPLETE`.
- `node tools/validate_t6_bank.js "<pack>"` reports `errors: 0` and the subject has dropped off the
  untaught-backlog warnings.
- `tools/browser-checks/teach-before-test.js` returns `ok: true`.
- `npm test` passes and `node tools/build-site.mjs` succeeds.
- Ledgers updated and an evidence file written under `evidence/<date>/`.
