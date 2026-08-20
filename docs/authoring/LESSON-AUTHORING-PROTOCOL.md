# Lesson Authoring Protocol — the 0→80 teaching layer

**Read this before authoring any lesson.** It is written so a session with no memory of the earlier
work can pick up mid-subject and produce lessons indistinguishable from the ones already shipped.

`AGENTS.md` remains the living index and outranks this file. This is the procedure for one specific
job: turning a lecture into a lesson in `app/sets/t6_lessons.js`.

---

## 0. Read this before deciding what to author

> **Current mechanics — 2026-08-20. Every authored lecture entry is scheduled in its module's
> ordinary Learn run.** `moduleLessonIdsForStudySet()` passes the complete module lesson list into
> `layeredQueue()`, which drains unread lessons in teaching order before the question ranks. Add-ins
> travel with their host. Question citations still attach concepts and repair evidence, but no
> longer decide whether a lesson can reach a learner. The lesson gate and bank validator both fail
> if a registered entry is readable-only.

The cited-only mechanics described in the historical correction below were superseded on
2026-08-20. Keep them as the reason the coverage distinction exists; do not use them to schedule or
defer current work.

**Historically, citation was a statement of mechanics rather than priority.** The correction below
records that earlier state; see the owner decision before concluding that an uncited lecture can be
skipped.

> **Corrected 2026-08-18.** This section used to say such a lesson is "**never delivered to
> anyone**". That is wrong. `renderLessonIndex()` (`app/t6.js:2166`) renders every authored lesson
> in full inside the dashboard's **"Read the lessons"** disclosure (`app/t6.html:376`), labelling
> the uncited ones `Read-only — no question cites this` (`app/t6.js:1941`). Verified in the running
> app: `evidence/2026-08-18/t6-teaching-layer-ibm-m02/verification.md`. At that point uncited lessons
> were **readable but unscheduled** — not invisible. Module scheduling superseded this on 2026-08-20.

The bank does not cite every lecture. It cites:

| Subject | Lectures in the course | Lectures the bank cites | Authored |
| --- | --- | --- | --- |
| BRGSA | 50 | 44 | **50 — complete** |
| IBM | 78 | 16 (two per module) | **78 — complete** |
| SCLM | 71 | 16 | **71 — complete** |
| SPMS | 84 | 16 | **84 — complete** |

*Authored counts read from `tools/check_lesson_file.mjs`. They move whenever anyone authors, so
re-run it rather than quoting this row.*

> ### The authoring backlog is CLOSED — 2026-08-19
>
> **Every lecture in the course has a lesson**: 283 registered entries over 283 lectures, all four
> subjects reported `COMPLETE`. This section's procedure now applies to **rewrites and repairs**
> rather than to new coverage. Evidence:
> `evidence/2026-08-19/t6-teaching-layer-complete/verification.md`.
>
> **What is still open is depth, not lesson delivery.** All 283 entries are scheduled. Phase 2 still
> owns one-record-per-idea depth, repeated transfer and cross-module synthesis. Content also remains
> owner-accepted rather than faculty-reviewed.

**Historical scored-coverage milestone:** by 2026-08-12 every then-cited lecture had a lesson and
724/724 then-scheduled questions were taught. Use the bank validator for the current 2,827-question
state.

> ### Uncited is no longer optional — owner decision, 2026-08-19
>
> This section used to call an uncited lecture optional work that "moves no coverage", and told
> you to author one only on an explicit decision. **That policy is reversed.** The owner's ruling:
> *if it is in the course, it needs to be taught* — no dividing the course into what counts and
> what does not. The 38 SPMS lectures outstanding when this was written were ordinary unfinished
> work, and **all of them were authored by 2026-08-19**. An uncited lesson is not a curiosity in
> the lesson index; it is teaching waiting for its concept.
>
> **The mechanics changed on 2026-08-20:** module scheduling reaches every authored lesson. A
> question citation still moves scored concept evidence, so authoring alone still does not create
> repeated testing depth. That is Phase 2 of `docs/briefs/DUNGEON_VISION_TO_BUILD.md` — widening
> the concept spine and its practice. **Do not manufacture depth by retagging an unrelated question.**
> That breaks the ladder, LAW-47 and the readiness figures, all silently.
>
> Historical note kept because it still costs: IBM module 1 was authored in full before the
> citation pattern was checked, which is where its 8 read-only lessons came from. Under the old
> policy that was waste; under this one it was early.

If you are resuming, **run the gate rather than trusting this table.** These counts move whenever a
question is added or retagged.

`node tools/check_lesson_file.mjs "<pack>"` prints every subject's registered/scheduled count and,
if the authoring backlog ever reopens, the missing lectures in course order. An authored lesson
outside sets 1–8 is now an error rather than a Phase 2 queue.

**Where the course material itself is missing or too thin to teach from**, the owner's decision 4
allows researching it on the web rather than dropping the topic — but web-sourced material breaks
the vocabulary gate and the lesson-lecture matcher **by design**, since neither can distinguish it
from invented content. Do not lower a floor, add an alias, or file it under a `lectureId` as
though the lecture said it. The provenance mechanism that would make it gateable **does not exist
yet**; until it does, flag the gap for the owner instead of filling it.

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

**Status (2026-08-19): the layer is complete.** 283 entries over all 283 lectures, in all four
subjects — not merely the cited ones. The remaining work on this layer is owner/faculty
**acceptance**, plus the repairs this document's Step 4c sweep keeps finding.

---

## 2. Source material

The pack is **external to this repository**. Nothing under it is checked in.

| What | Where |
| --- | --- |
| **Clean transcripts — the authority** | `<transcripts>/<SUBJ>/<SUBJ>_M<NN>_SUM_TRANSCRIPT.txt`, one file per module, lectures behind `## code \| title` headers |
| Old pack root | `<T6 pack>` — legacy, see the Directory Map in `AGENTS.md` |
| Lecture manifest (legacy) | `<pack>/graph/LECTURE_MANIFEST.jsonl` |
| Dense summary (legacy) | `<pack>/dense/lectures/<SUBJ>/<MOD>/<LECTURE>_DENSE.txt` |

**The clean transcripts are the authority for what the course says**, loaded through
`tools/lib/clean_transcripts.js`. A lecture's identity is its **position** in the module file — the
Nth section is `L<N>` — not the recording code in the header, which is not even monotonic.

Two things to know before you reach for the old pack. Its dense layer is a bullet digest and some
lines are incoherent out of context ("Since, 21% of 38 is nearly 8, 38 plus 8 makes it 46"), and its
concept index is **not** an authority — its own README calls the terms retrieval candidates, and it
reports "sample size" as first appearing in M02-L03 when M02-L02 is the lecture *titled* "Sample Size
Logic" (LAW-49). But `tools/build_t6_lessons.mjs` has **not** been migrated off it: that tool still
reads `graph/LECTURE_MANIFEST.jsonl` and needs the old pack path, while
`tools/validate_t6_bank.js` and `tools/check_lesson_file.mjs` take the clean transcripts. One path
argument does not serve all three.

For SCLM and SPMS the extractor is barely worth running — their dense layers produced almost no
objective or example candidates, and the glossary candidates were n-gram noise ("pampers", "finally
profitability"). Both subjects were authored by reading the transcripts directly.

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

### Shape — owner direction, 2026-08-19

Three instructions that change how a lesson is written, not just what it contains:

1. **Teach a process a learner can follow.** Prefer named steps in order over a description of a
   topic. "Build a small experiment, measure behaviour, learn — then persevere or pivot" is a
   process; "learning loops are important in validation" is a summary. The learner should be able
   to *do* the thing after reading, which is what the `objective` already promises.
2. **Keep the explainer small.** The measured house band is ~250–300 words; aim at the **lower**
   end. The batch authored under this direction runs 256 words with paragraphs of 444–577
   characters, against 277–296 words and up to 676 characters the batch before. Shorter is the
   point — this is prep material that has to stay quick.
3. **Make the lessons synergistic.** Depth exists to *link* ideas (owner decision 2, `§6` of
   `docs/briefs/DUNGEON_VISION_TO_BUILD.md`), so `connects` should name what the next lesson does
   with this one, and a lesson should lean on the vocabulary the module already introduced rather
   than restating it.

### Add-ins — when a lecture does not warrant its own lesson

Some lectures are the setup for a neighbour rather than a topic of their own. Padding one out to
lesson size is dishonest, and leaving it untaught now contradicts owner decision 4. Fold it in:

```js
lesson({
  lectureId: "SPMS-M02-L09",          // the host
  /* … normal lesson fields … */
  addIns: [
    {
      lectureId: "SPMS-M02-L08",       // the covered lecture
      module: 2,
      order: 8,
      title: "Market expansion",
      objective: "…",
      explainer: ["…", "…"],           // ~80–190 words
      glossary: [{term: "…", plain: "…"}]   // at least 1
    }
  ],
  connects: "…"
});
```

**Why it is registered rather than referenced.** `lesson()` in `app/sets/t6_lessons.js` expands
each add-in into a real entry in `window.T6_LESSONS`, which is the one map every consumer reads —
the app's scheduler and its LAW-47 walk, `check_lesson_file`, both coverage gates and the match
gate. So a folded-in lecture counts as taught **everywhere at once**. A pointer the gates could not
see would read as an unauthored lecture for ever, which is the "optional work" trap wearing a new
hat.

**The contract is lighter, deliberately.** No `worked` and no `connects` — those belong to the host,
which is the unit a learner reads end to end. Everything that keeps the teaching checkable is still
required: its own objective, its own prose, its own glossary. It carries **its own** text rather
than aliasing the host's, so `check-lesson-lecture-match` still scores it against its own lecture
and the claim stays falsifiable. Both `check_lesson_file.mjs` and `tools/validate_t6_bank.js` know
the lighter contract; **both had to be taught it**, and the bank validator caught the omission the
first time an add-in was written.

**When not to use one.** If the lecture has its own process, its own worked example, or more than
~190 words of distinct teaching, it is a lesson. `SPMS-M02-L05` and `L06` looked like a fold-in pair
on size alone and are not — L05 is the loop, L06 is the ladder of MVPs across loops, and they teach
different skills.

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
  **Read it from the module's lecture list, never from the lesson file.** Eight false handoffs have
  been found by checking the `connects` above an insertion point, and they come in two shapes.
  One: the lesson is a *composite* and has already spent the next lecture's material, so it promises
  something further along (`SPMS-M06-L01`). Two: the next lecture is *unauthored*, so it is invisible
  in the lesson file and the author writes a pointer to the next lesson **in the file** instead —
  `SPMS-M07-L01` and `L02` both skipped the unwritten `L03` and promised `L04`'s roadmap. The second
  shape is self-reinforcing: every neighbour written from the file skips the same gap, and it closes
  over. Also check the `connects` of the lesson *above* your insertion point, since it is the one
  now pointing at you.
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

```bash
npm run check:syllabus    # do the lessons still reach all 359 named syllabus ideas?
npm run check:taught      # does a lesson teach what its questions ask, not just cite it?
```

Both are ratchets and both fire on lesson **edits**, not just additions. The syllabus gate is
phrase-contiguous, so an innocent rewording drops a term — it bit four times in one session
("Product against project" reads as untaught where the syllabus says "Product vs project"). When a
term falls out, **teach it back where its lecture makes it — never add an alias, never lower a
floor.** These run inside `npm test` too, but running them per batch localises the failure to the
batch that caused it.

### Step 4b — does the lesson teach its own lecture?

```bash
node tools/check-lesson-lecture-match.mjs "<Term 6 Clean Transcripts>" --gate
```

The newest gate, and the only one that tests the claim your `lectureId` makes. It scores each
lesson's distinctive vocabulary against its own lecture and against every other lecture in the
subject, and flags one that a rival explains better. It exists because two shipped SCLM lessons
taught the wrong lectures for as long as they existed while every other gate stayed green — the id
was checked against the manifest, the glossary against the transcripts, delivery order by LAW-47,
and coverage at subject level, and a misfiled lesson satisfies all four.

**Read its scope limit before trusting a PASS.** It finds a lesson written from *another* lecture.
It cannot find one written from half of its own — the second case in
`tests/fixtures/mismapped-lessons.js` scores −0.079 and correctly does not flag. A PASS means
"nothing looks misfiled", never "everything is covered".

The queue it opened was cleared on 2026-08-18. **A `FAIL` naming `SPMS-M01-L01` and nothing else
is now the expected state** — its `lectureId` names a 685-character takeaways card rather than a
lecture, and the owner chose to leave the lesson there. Anything else in that output is new.
Use `--subject <SUBJ>` to narrow it to the one you are authoring, and `--explain <lectureId>` for
the numbers behind a single flag.

### Step 4c — the near-miss sweep the gate does not print

A `PASS` hides the defect this gate is worst at: a lesson written from **half** its own lecture,
which leans toward a neighbour without crossing the 0.10 flag threshold. Two were found by reading
in one day; the sweep below then found three more that nobody had noticed.

```bash
node tools/check-lesson-lecture-match.mjs "<transcripts>" --calibrate   # READ p05 AND p25 FIRST — both move
node tools/check-lesson-lecture-match.mjs "<transcripts>" --dump > /tmp/dump.txt

# LEAD ON OWN SUPPORT. Anything under p05 is a candidate whatever its margin says.
awk -F'\t' '$3<0.31' /tmp/dump.txt                  # margin, lectureId, ownLift, rival, rivalLift

# then the wider net: weak own support, margin only as corroboration
awk -F'\t' '$3<0.47' /tmp/dump.txt | sort -t$'\t' -k1 -gr | head -30
```

**Both conditions are needed.** A positive margin alone is mostly topic adjacency — `SCLM-M07-L04`
leans by 0.042 while scoring 0.509 on its own lecture, which is a lesson doing its job next to a
similar one. Weak own support alone can just be an abstract lecture. It is the combination — *a
rival is level with it or ahead and it barely matches its own* — that has found every confirmed
composite so far.

> **Corrected twice on 2026-08-19. Three composites in one day sat below successive margin
> floors, so the margin is now corroboration and own support is the test.**
>
> `SPMS-M08-L08` — the largest repair in the record, own **0.203 → 0.519** — had a margin of
> **−0.074**: outside the `>0` floor, and outside the `>-0.06` floor this same session had just
> widened it to. What it was *not* outside was **p05 on own support** — raw 0.308, the bottom
> twentieth of 272 lessons. A composite splits its vocabulary between two lectures, so its own
> support collapses reliably while its margin lands wherever the borrowed half happens to fall.
> **Sort by own support, read the bottom of the list, and use the margin only to explain what you
> find there.**
>
> Two structural cases give low own support without being composites, both confirmed by reading:
> a **"Part 2" lecture** shares vocabulary with its Part 1 (`M07-L07`, `M07-L09`), and a
> **synthesis lecture** whose job is to span the whole subject is distinctive against none of it
> (`M08-L09`). Low own support opens the question; only the lecture closes it.
>
> **The earlier correction, kept because both halves of the original query were wrong.**
>
> **The margin floor was `>0` and a real composite sat below it.** `SPMS-M06-L01` took its whole
> third paragraph and its entire worked example from `SPMS-M06-L02`'s lecture — the Ford
> faster-horses illustration and the data-versus-insight distinction, neither of which appears
> anywhere in `L01`'s own transcript. It scored own 0.284 against `L02`'s 0.270: a margin of
> **−0.011**, so it was *winning* by a hair and the `$1>0` test skipped it. A composite that
> borrows from one neighbour ends up **tied** with that neighbour, not behind it — being narrowly
> ahead of the lecture you plagiarised is the signature, not the exoneration. The floor is now
> `>-0.06`. Repaired the same day: own **0.284 → 0.369** raw, margin **−0.011 → −0.236**, and its
> nearest rival moved off `L02` entirely.
>
> **The 0.35 was a stale constant.** It was p25 when it was written; p25 is now **0.460** over 267
> lessons and the number moves with every batch (`LAW-76`). A hardcoded threshold in a
> corpus-relative query silently under-selects as the corpus grows, which is why `--calibrate` now
> runs *first* in the block above. Read p25 from it and substitute; do not trust the literal.
>
> The widened query returns roughly 28 rows against the old 10. That is a reading queue, not 28
> defects — see below.

**The list is a reading queue, not a verdict.** `SPMS-M02-L03` sits in it and is fine: "What a
market actually is" genuinely teaches *Markets and Customer Segments*, and shares vocabulary with
the sizing lecture next door. Only reading settles it, which is the same limit the gate's own header
states.

> **Nine for nine, and it reframes the defect — 2026-08-19.** Every confirmed composite in the
> record borrowed from a lecture that had **no lesson at the time it was written**: `M05-L06`,
> `M02-L07`, `M07-L08`, `M03-L08`, `M06-L09`, `M06-L01`, `M08-L08`, `M04-L04`, `M04-L09`. **The
> backlog produced the defect rather than merely blocking its repair** — an author facing an
> unwritten neighbour absorbs its material instead of leaving a gap. Two of the nine also duplicated
> *authored* neighbours (`M04-L01`, `M04-L07`), so the mechanism is not purely gap-filling; but with
> the backlog closed, the condition that generated all nine is gone for new authoring.
>
> **The flagged rival names where vocabulary overlaps, not where the text came from.** `M04-L04`'s
> rival was `M04-L03`, while its borrowed paragraphs measurably came from `M04-L01` — `Spotify`
> appears 28 times there and 0 times in `L04`'s own transcript. The rival pointed at `L03` because
> `L04`'s one genuinely-own paragraph used `L03`'s pricing vocabulary. **Use the rival to start
> reading, never to conclude.** Grep the borrowed phrases across the subject to find the real source.

**Composites are repaired in a forced order, and it is the backlog's order.** A composite teaches
its neighbours' material, so rewriting it *removes* that material — and the coverage ratchet reads
every lesson, cited or not. So **a composite is only rewritable once the lectures it borrowed from
have their own lessons.** `SPMS-M05-L06` and `SPMS-M02-L07` were rewritten on 2026-08-19 only
because the same session had just authored the four lessons carrying their borrowed halves. The
three found after them are blocked for exactly that reason: each needs two backlog lectures authored
first. Do not try to fix a composite by lowering a floor or adding an alias when its coverage falls
out — author the home lecture instead.

**Its scores are corpus-relative** (`LAW-76`): a lesson's distinctiveness is measured against the
rest of the subject, so editing one lesson re-scores the others and a borderline case can cross the
line on its own. If a lesson you did not touch flags, diff `--explain` against the pre-batch file
before assuming either blame or noise — then diagnose it anyway, because the one this happened to
(`SPMS-M04-L01`) turned out to be a real misfile. Re-run the gate after **every** batch, not once at
the end.

### Step 5 — verify in the browser

Never skip this because the automated gates are green; they do not cover scheduling.

> **Screenshots:** `node tools/screenshot.mjs --port <port>`. Do **not** reach for the Browser
> pane's screenshot — it cannot composite and no retry fixes it. See
> `docs/governance/SCREENSHOTS.md`, which also carries the frozen-timeline trap that makes correct
> CSS transitions read as broken in the pane.

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
| **LAW-50** | `explainer: [ … ]` closed with `},` instead of `],`. Arrays and objects sit at the same indent inside a lesson record. The failure mode is a file that does not parse, which yields *no* validator signal — silence, not a warning. **Recurred 2026-08-12** in `SPMS-M05-L04`; caught by `check_lesson_file.mjs` because it was run before the bank validator, exactly as Step 4 orders them. |
| *(gate quirk)* | The vocabulary gate builds `\b<term>\b`, so a **singular glossary term cannot match a plural-only occurrence**. `public private partnership` was reported as "does not appear in the SCLM transcripts — confirm it is not invented vocabulary" although `public private partnerships` occurs three times. That warning is a false accusation, not a missed check. Grep the transcript before deleting a term, and prefer the course's own form. |
| *(encoding)* | **Mojibake in lesson prose passes every content gate.** A block assembled through a shell or Python escape round-trip (`.encode().decode("unicode_escape")`) turned eight em-dashes into `â\x80\x94` and reached the working tree with `check_lesson_file`, the bank validator, the match gate, `npm test` and the build all green — they parse the JavaScript, not the rendered output. The browser showed `the industry analysts â Gartner` at once. **Write lesson blocks with the file-write tool, never through shell escaping**; LAW-74 is the same class in line endings. |
| *(source quirk)* | **A lecture's title does not always describe its content.** `SPMS-M06-L08` is titled "Traceability", but the word appears only in its header — the body teaches the customer → product → project requirements chain. Author what the lecture teaches and set the lesson `title` accordingly; never invent content to justify a label. The `lectureId`, `module`, and `order` must still match the source exactly. |

**The meta-trap:** a comment asserting an invariant is not the invariant. LAW-47's hole survived
review because the code said it was handled. Only executing the check found it.

---

## 6. Subject notes

| Subject | Cited lectures | Authored | Note |
| --- | --- | --- | --- |
| BRGSA | 44 | **complete** | The worked reference. Read a few of its lessons before authoring elsewhere. |
| IBM | 16 | **complete (78/78 lectures)** | Module 1 was also authored in full before the citation rule was known; 8 of those are read-only rather than scheduled. **Module 2 is complete, 17 of 17** (2026-08-18). Case-heavy — verify every figure against the lecture. |
| SCLM | 16 | **complete** | Titles carry typos ("Ojectives", "Sypply") — use them verbatim as ids, fix only the lesson `title`. **Not** heavily quantitative: only 3 of its 16 cited lectures carry arithmetic (exponential smoothing M02-L06, EOQ M03-L03, newsvendor M03-L05). The rest are decision cases — cold storage, cement rail logistics, transformer multimodal, ports/PPP, LEADS, Akshaya Patra, FarmAid stockyards — plus conceptual frameworks. Their `worked` examples run the lecture's own case decision end to end rather than a calculation, except FarmAid and Laxmi, which are genuinely numeric.  **The whole subject is complete, 71 of 71 lectures** (2026-08-18) — the second after IBM. Two ordering facts a resumer needs: module 1 sits L01-L05, L08, L06, and module 2 sits L04 before L03 (both pre-existing inversions, left alone) with L01 filed deliberately between L10 and L11, because the associative-techniques lecture closes the forecasting arc despite being first in the transcript file. Module 2 is also where two shipped lessons were found teaching the wrong lectures and were rewritten on 2026-08-18 (QUALITY-LOG I54); no gate catches that class, so read the lecture you are labelling.|
| SPMS | 16 | **complete** (46/84 lectures) | Framework-dense (JTBD, TAM/SAM/SOM, Lean Canvas, crossing the chasm). Check whether the course uses a framework's standard vocabulary or its own before glossing. Numbers are scarce; the `worked` examples lean on the lecture's own illustrations — the doctor's drill, Zerodha's market narrowing, WhatsApp's 2009 iOS launch. **Module 1 was repaired on 2026-08-18** — seven of its ten lessons taught the wrong lecture in a broken chain, not a constant offset, and `L01`'s id names a 685-character takeaways card rather than a lecture. Read `docs/briefs/MISFILED_LESSONS_WORK_ORDER.md` before touching module 1. |

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
