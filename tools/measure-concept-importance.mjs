/*
 * How important is each syllabus idea — measured, so ~3,000 questions can be ordered by it.
 *
 * WHY THIS EXISTS
 * `docs/briefs/DUNGEON_VISION_TO_BUILD.md` was adopted on 2026-08-19 with owner decision 3:
 * scope is the entire course, and **importance orders it**. The plan is explicit that the
 * ranking is the blocking next move, because the same field is used three times — it sets
 * authoring order, it sequences the owner's Phase 0 reading, and it drives Phase 4's mock
 * rotation. Everything downstream is ordered wrongly without it, and "importance" cannot stay
 * a feeling in an author's head.
 *
 * WHAT COUNTS AS IMPORTANT — OWNER DIRECTION, 2026-08-19
 * Verbatim: *"terms and concepts that repeat get importance, especially if theyre tied to a
 * foundational concept + if theyre numerical. Basically frameworks, logic gates, anything multi
 * step is important."*
 *
 * That is four signals, and this tool implements those four:
 *
 *   1. repetition        how many of the subject's lectures return to the idea
 *   2. foundational tie  how many of the subject's foundational concepts it sits beside
 *   3. numerical         is it taught where the course computes
 *   4. multi-step        is it a framework, a canvas, a cycle, a staged process
 *
 * Scaled throughout by the marks the paper actually allocates to an objective question
 * (`docs/briefs/T6_EXAM_PATTERN.md` is the authority). Numerical and multi-step together carry
 * half the weight, because "frameworks, logic gates, anything multi step" is the direction's
 * own summary of itself.
 *
 * THIS SUPERSEDES THE FIRST CUT, WHICH GOT ITS TOP SIX WRONG
 * The first derivation was `mark share x (lecture spread + generic linkage)`. It ranked
 * `Startup` (81 of 84 SPMS lectures) and `Software product management` (80) highest against a
 * median spread of 8, and those were set aside as "background vocabulary" — ubiquity mistaken
 * for importance, then over-corrected into dismissal. **Both halves were wrong.** Owner
 * direction: repetition genuinely does confer importance. The ubiquitous terms are not noise,
 * they are the subject's **foundational** concepts, and their real value is as anchors — an idea
 * that sits beside many of them is tied into the subject rather than orbiting it. So they rank,
 * they are labelled `foundational`, and they are also the measuring stick for signal 2.
 *
 * THIS IS A MEASUREMENT, NOT A GATE — DELIBERATELY
 * `LAW-75`: a gate calibrated on the population it polices sets its bar where the defects
 * already are. An importance score derived from the corpus and then used to gate the corpus
 * would do exactly that. This tool prints a ranking and exits 0. Nothing fails on it.
 *
 * THE RANKING IS STILL A CUT FOR THE OWNER TO CORRECT
 * Every component prints beside the score, because a number you cannot argue with is a number
 * nobody will correct. Write corrections back as `importance` on the term entry in
 * data/syllabus/<SUBJ>.terms.json; an authored value always wins and reports as `owner`.
 *
 * USAGE
 *   node tools/measure-concept-importance.mjs "<transcripts>"                 ranked, all subjects
 *   node tools/measure-concept-importance.mjs "<transcripts>" --course SPMS   one subject
 *   node tools/measure-concept-importance.mjs "<transcripts>" --top 25        head of the list
 *   node tools/measure-concept-importance.mjs "<transcripts>" --module 6      one module
 *   node tools/measure-concept-importance.mjs "<transcripts>" --written      scale by WRITTEN marks
 *   node tools/measure-concept-importance.mjs "<transcripts>" --json          machine-readable
 *   node tools/measure-concept-importance.mjs "<transcripts>" --why "<term>"  one idea, explained
 *
 * `--course` and `--module` combine. `--written` is what orders IBM, which scores 0 without it.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const SYLLABUS_DIR = path.join(ROOT, "data", "syllabus");

/* Objective marks a BANK QUESTION can earn on each paper.
 *
 * Authority: docs/briefs/T6_EXAM_PATTERN.md, whose claim boundary is closed. Restated here as
 * data, and it is the one constant a human must maintain: if the pattern changes, this changes.
 *
 * SPMS  35 MCQ + 20 MSQ = 75 of 75      SCLM  50 MCQ + 3 match = 56 of 80
 * BRGSA 20 MCQ          = 40 of 80      IBM   no objective section at all = 0 of 100
 */
const OBJECTIVE_MARKS = { SPMS: 75, SCLM: 56, BRGSA: 40, IBM: 0 };
const WRITTEN_MARKS = { SPMS: 0, SCLM: 24, BRGSA: 40, IBM: 100 };
const PAPER_MARKS = { SPMS: 75, SCLM: 80, BRGSA: 80, IBM: 100 };

/* --written flips the scale to the marks a WRITTEN surface can earn.
 *
 * Without it IBM scores 0 on every row, which is right for bank authoring and useless for
 * IBM's actual work: its paper is ten written answers on a caselet, so framework fluency and
 * structured responses are exactly what it rewards — and "frameworks, logic gates, anything
 * multi step" is the owner's own description of what matters. The same four signals, scaled by
 * a different column of the same table. Objective is the default because the bank is the thing
 * being authored at scale; use --written to order IBM and BRGSA's written work. */
const flagWritten = process.argv.slice(2).includes("--written");
const SCALE = flagWritten ? WRITTEN_MARKS : OBJECTIVE_MARKS;
const scaleFor = (courseId) => SCALE[courseId] / PAPER_MARKS[courseId];

/* Owner direction weights. Numerical + multi-step = half, deliberately. */
const W = { repetition: 0.30, foundational: 0.20, numerical: 0.25, multiStep: 0.25 };

/* CONTRIBUTION IS TO THE COURSE, AND THAT REPLACED RAW REPETITION — owner direction 2026-08-19:
 * *"importance, again is how much this concept contributes to the entire course as a whole"*.
 *
 * The `repetition` component used to be the raw count of lectures mentioning the idea, divided
 * by the subject's maximum. That rewards an idea hammered thirty times inside one module exactly
 * as much as one the course returns to in every module, and only the second is a contribution to
 * the whole. It is now **module reach** — how many of the subject's modules come back to it —
 * which is the same signal the layer is built from (`tools/build-concept-layer.mjs`). The two
 * tools must agree on this or the ranking and the layer would order the same work differently. */

/* An idea in more than half its subject's lectures is FOUNDATIONAL — the thing the subject is
 * built on. It ranks on its own repetition, and it is the yardstick for every other idea's
 * "tied to a foundational concept". */
const FOUNDATIONAL_SPREAD = 0.5;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (n, d) => {
  const at = args.indexOf(n);
  return at >= 0 && args[at + 1] ? args[at + 1] : d;
};
const OPTS_WITH_VALUES = new Set(["--course", "--top", "--module", "--why"]);
const transcriptRoot = args.find((a, i) => !a.startsWith("--") && !OPTS_WITH_VALUES.has(args[i - 1]));

if (!transcriptRoot) {
  console.error("Pass the clean-transcripts root as the first argument.");
  console.error('  node tools/measure-concept-importance.mjs "<Term 6 Clean Transcripts>"');
  process.exit(2);
}

/* ---------------------------------------------------------------- term matching
 * Whole words only. The reason is written out in measure-syllabus-coverage.mjs and this tool
 * re-learned it the hard way while being built: a substring probe matched RICE in 126 SPMS
 * sentences, every one of them the word "price". */
const WEAK = new Set(["the", "and", "for", "with", "versus", "vs", "into", "from"]);
const normalise = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tokensOf = (t) => normalise(t).split(" ").filter((x) => x.length > 2 && !WEAK.has(x));

function wordSetOf(text) {
  const set = new Set();
  for (const w of normalise(text).split(" ")) {
    if (!w) continue;
    set.add(w);
    if (w.endsWith("s")) set.add(w.slice(0, -1));
    if (w.endsWith("ies")) set.add(w.slice(0, -3) + "y");
  }
  return set;
}

function touches(entry, words) {
  const names = [entry.term, ...(entry.aliases || [])];
  return names.some((name) => {
    const toks = tokensOf(name);
    return toks.length > 0 && toks.every((t) => words.has(t));
  });
}

/* ------------------------------------------------ "tied to a foundational concept"
 *
 * MEASURED IN A WINDOW, AND THAT WAS THE SECOND CORRECTION.
 * The first version asked whether an idea shares a LECTURE with a foundational concept.
 * Measured: 78% of all non-IBM ideas scored a flat 100. Of course they did — a subject's
 * foundational concepts are in most of its lectures by definition, so "same lecture as
 * `Startup`" is true of nearly everything in SPMS and discriminates nothing. It was 20% of
 * the weight doing no work.
 *
 * Asking instead whether the course discusses the idea *beside* a foundational concept —
 * within an 800-character window of a mention — gives p10 0 / p50 ~43 / p90 100 and separates
 * real cases: `Supply chain surplus` and `Responsive supply chain` tie tightly to `Supply
 * chain`, while `exponential smoothing`, `MAPE` and `ABC classification` tie loosely because
 * they are self-contained techniques. That is the correct answer for both — a numerical
 * technique earns its importance from signal 3, not from this one. */
const TIE_WINDOW = 800;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (t) => new RegExp("\\b" + escape(t) + "\\b");

function mentionWindows(normText, term) {
  const toks = tokensOf(term);
  if (!toks.length) return [];
  const out = [];
  const anchor = new RegExp("\\b" + escape(toks[0]) + "\\b", "g");
  let m;
  while ((m = anchor.exec(normText))) {
    const lo = Math.max(0, m.index - TIE_WINDOW / 2);
    const win = normText.slice(lo, Math.min(normText.length, m.index + TIE_WINDOW / 2));
    if (toks.every((t) => wordRe(t).test(win))) out.push(win);
  }
  return out;
}

/* ------------------------------------------------- the character of a lecture
 *
 * MEASURED PER LECTURE, NOT PER SENTENCE, AND THAT WAS A CORRECTION.
 * The first attempt looked for calculation words in the same sentence as the term and found
 * almost nothing: it scored `Little's Law`, `Newsvendor` and `Churn rate` at zero numerical.
 * Course transcripts are speech — the idea is named, and the arithmetic runs over the next
 * dozen sentences. A lecture that computes is a computing lecture and the ideas it teaches are
 * computational ideas, so the density is measured over the whole lecture.
 *
 * `step` DENSITY WAS MEASURED AND THEN DELETED. "first", "then", "next", "stage" run at 9-15
 * per thousand words across every lecture in the course, numerical and conceptual alike —
 * that is how people talk, not a marker of a staged framework. It discriminated nothing and
 * carrying it would have added noise wearing the shape of evidence. Multi-step is therefore
 * carried by FRAME (framework/canvas/cycle/matrix/funnel...) plus the term's own name. */
const CALC = /\b(calculat\w*|comput\w*|formula\w*|multipl\w*|divid\w*|percentage|per cent|ratio|equation|averag\w*|square root|standard deviation|subtract\w*|numerator|denominator|arithmetic|minus|plus|equals|per unit)\b/gi;
const DIGIT = /\b\d[\d,.]*\b/g;
const FRAME = /\b(framework|model|canvas|matrix|cycle|loop|funnel|pyramid|ladder|process|method|quadrant|two by two|2 by 2|dimension\w*|axis|axes)\b/gi;

/* The term's own name is evidence about itself, independent of any lecture. */
const FRAME_SHAPE = /\b(framework|model|canvas|matrix|cycle|loop|funnel|pyramid|ladder|lifecycle|life cycle|process|analysis|method|stages?|map|planning)\b/i;
const NUMBER_SHAPE = /\b(cost|rate|quantity|size|volume|score|ratio|metric|index|margin|price|pricing|forecast|demand|inventory|stock|significance|law|point|threshold|level)\b/i;

const densityOf = (text, re) => {
  const words = text.split(/\s+/).length || 1;
  return ((text.match(re) || []).length * 1000) / words;
};

const { loadLectures } = require(path.join(ROOT, "tools", "lib", "clean_transcripts.js"));
const loaded = loadLectures(transcriptRoot);
const lectures = loaded.lectures || loaded;
if (!lectures.length) {
  console.error("No lectures loaded — check the transcripts path.");
  process.exit(2);
}

const wordsByLecture = new Map();
const statsByLecture = new Map();
const normByLecture = new Map();
for (const l of lectures) {
  wordsByLecture.set(l.lecture_id, wordSetOf(l.text));
  normByLecture.set(l.lecture_id, " " + normalise(l.text) + " ");
  statsByLecture.set(l.lecture_id, {
    calc: densityOf(l.text, CALC),
    digit: densityOf(l.text, DIGIT),
    frame: densityOf(l.text, FRAME)
  });
}

function readSyllabus() {
  return fs
    .readdirSync(SYLLABUS_DIR)
    .filter((f) => f.endsWith(".terms.json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(SYLLABUS_DIR, f), "utf8")));
}

/* ---------------------------------------------------------------------- measure */
const rows = [];
for (const subject of readSyllabus()) {
  const courseId = subject.courseId;
  const subjectLectures = lectures.filter((l) => l.subject === courseId);
  if (!subjectLectures.length) continue;
  const subjectModuleCount = new Set(subjectLectures.map((l) => l.module)).size;

  const entries = [];
  for (const [moduleNo, terms] of Object.entries(subject.modules || {})) {
    for (const t of terms) {
      const entry = typeof t === "string" ? { term: t } : t;
      entries.push({ ...entry, module: Number(moduleNo) });
    }
  }

  const hitsByTerm = new Map();
  for (const e of entries) {
    hitsByTerm.set(
      e.term,
      subjectLectures.filter((l) => touches(e, wordsByLecture.get(l.lecture_id))).map((l) => l.lecture_id)
    );
  }

  /* Foundational set: the subject's own base concepts, by repetition. */
  const foundational = new Set(
    entries
      .filter((e) => hitsByTerm.get(e.term).length / subjectLectures.length > FOUNDATIONAL_SPREAD)
      .map((e) => e.term)
  );

  const lectureToTerms = new Map();
  for (const [term, ids] of hitsByTerm) {
    for (const id of ids) {
      if (!lectureToTerms.has(id)) lectureToTerms.set(id, new Set());
      lectureToTerms.get(id).add(term);
    }
  }

  const maxSpread = Math.max(1, ...entries.map((e) => hitsByTerm.get(e.term).length));

  /* Raw component values first, so each can be normalised within its own subject. A BRGSA
   * lecture is digit-heavier than an SPMS one throughout; comparing raw densities across
   * subjects would rank the subject, not the idea. */
  /* Pre-tokenise the foundational names once — this is the inner loop. */
  const foundationalToks = [...foundational].map((f) => ({ name: f, toks: tokensOf(f) }));

  const raw = [];
  for (const e of entries) {
    const ids = hitsByTerm.get(e.term);
    const stat = (k) => (ids.length ? ids.reduce((a, id) => a + statsByLecture.get(id)[k], 0) / ids.length : 0);

    let windows = 0;
    let beside = 0;
    const tiedTo = new Set();
    for (const id of ids) {
      for (const win of mentionWindows(normByLecture.get(id), e.term)) {
        windows += 1;
        let any = false;
        for (const f of foundationalToks) {
          if (f.name === e.term) continue;
          if (f.toks.every((t) => wordRe(t).test(win))) { any = true; tiedTo.add(f.name); }
        }
        if (any) beside += 1;
      }
    }

    raw.push({
      entry: e,
      ids,
      spread: ids.length,
      /* Module from the id's own `-M<NN>-` segment rather than a character offset, which
       * happens to work for all four subjects only because their prefixes differ in length. */
      moduleReach: new Set(ids.map((id) => (/-M(\d+)-/.exec(id) || [])[1])).size,
      tie: windows ? beside / windows : 0,
      windows,
      tiedNames: [...tiedTo],
      calc: stat("calc"),
      digit: stat("digit"),
      frame: stat("frame"),
      isFoundational: foundational.has(e.term)
    });
  }

  const cap = (k) => Math.max(1e-9, ...raw.map((r) => r[k]));
  const capCalc = cap("calc"), capDigit = cap("digit"), capFrame = cap("frame"), capTie = cap("tie");

  for (const r of raw) {
    const e = r.entry;
    /* Module reach, normalised by the subject's module count — contribution to the whole
     * course rather than volume inside one part of it. */
    const repetition = r.moduleReach / Math.max(1, subjectModuleCount);
    const foundationalTie = r.tie / capTie;

    /* Numerical: calculation vocabulary dominates, digits are a weaker corroborator (a
     * transcript full of years and percentages is not necessarily doing arithmetic), and the
     * term's own name contributes when it names a quantity. */
    const numerical = Math.min(1, 0.6 * (r.calc / capCalc) + 0.2 * (r.digit / capDigit) + (NUMBER_SHAPE.test(e.term) ? 0.2 : 0));

    /* Multi-step: framework vocabulary in the lectures that teach it, plus the term's own
     * name when the name itself declares a structure (canvas, cycle, matrix, lifecycle). */
    const multiStep = Math.min(1, 0.6 * (r.frame / capFrame) + (FRAME_SHAPE.test(e.term) ? 0.4 : 0));

    const markShare = scaleFor(courseId);
    const blended =
      W.repetition * repetition +
      W.foundational * foundationalTie +
      W.numerical * numerical +
      W.multiStep * multiStep;
    const derived = Math.round(1000 * markShare * blended) / 10;

    rows.push({
      courseId,
      module: e.module,
      term: e.term,
      spread: r.spread,
      spreadShare: Math.round((100 * r.spread) / subjectLectures.length),
      moduleReach: r.moduleReach,
      tieShare: Math.round(r.tie * 100),
      mentions: r.windows,
      tiedNames: r.tiedNames,
      lectures: r.ids,
      foundational: r.isFoundational,
      markShare: Math.round(markShare * 100),
      c: {
        repetition: Math.round(repetition * 100),
        foundational: Math.round(foundationalTie * 100),
        numerical: Math.round(numerical * 100),
        multiStep: Math.round(multiStep * 100)
      },
      derived,
      importance: typeof e.importance === "number" ? e.importance : derived,
      source: typeof e.importance === "number" ? "owner" : "derived"
    });
  }
}

/* ----------------------------------------------------------------------- report */
const why = value("--why", null);
if (why) {
  const hit = rows.find((r) => r.term.toLowerCase() === why.toLowerCase());
  if (!hit) {
    console.error(`No syllabus idea named "${why}".`);
    process.exit(2);
  }
  console.log(JSON.stringify(hit, null, 2));
  process.exit(0);
}

const only = value("--course", null);
const mod = value("--module", null);
let out = rows;
if (only) out = out.filter((r) => r.courseId === only.toUpperCase());
if (mod) out = out.filter((r) => r.module === Number(mod));
out.sort((a, b) => b.importance - a.importance || a.courseId.localeCompare(b.courseId));
const top = Number(value("--top", 0));
if (top > 0) out = out.slice(0, top);

if (flag("--json")) {
  console.log(JSON.stringify({ generated: "measure-concept-importance", weights: W, rows: out }, null, 2));
  process.exit(0);
}

console.log("Concept importance — measured against owner direction, 2026-08-19");
console.log("=".repeat(86));
console.log('"terms and concepts that repeat get importance, especially if theyre tied to a');
console.log(' foundational concept + if theyre numerical. Basically frameworks, logic gates,');
console.log(' anything multi step is important."\n');
console.log(`importance = objective mark share x (${W.repetition} course-reach + ${W.foundational} foundational-tie + ${W.numerical} numerical + ${W.multiStep} multi-step)`);
console.log("A MEASUREMENT, NOT A GATE. Nothing fails on this number.\n");

console.log((flagWritten ? "WRITTEN" : "Objective") + " marks a " + (flagWritten ? "written surface" : "bank question") + " can earn, per paper (T6_EXAM_PATTERN.md):");
for (const c of ["SPMS", "SCLM", "BRGSA", "IBM"]) {
  const note = SCALE[c] === 0 ? `   <-- earns nothing here, so every ${c} row scores 0` : "";
  console.log(`  ${c.padEnd(6)} ${String(SCALE[c]).padStart(3)} of ${String(PAPER_MARKS[c]).padStart(3)}${note}`);
}
if (!flagWritten) console.log("  (--written flips this to the written column: IBM 100, BRGSA 40, SCLM 24, SPMS 0)");
console.log("");
console.log("components 0-100: rep=course reach (modules)  fnd=foundational tie  num=numerical  stp=multi-step");
console.log("");
console.log(
  "score".padStart(6) + "  " + "subj".padEnd(6) + "mod".padStart(3) + "  " +
  "rep".padStart(4) + "fnd".padStart(4) + "num".padStart(4) + "stp".padStart(4) + "  " +
  "src".padEnd(8) + "idea"
);
console.log("-".repeat(86));
for (const r of out) {
  console.log(
    r.importance.toFixed(1).padStart(6) + "  " +
    r.courseId.padEnd(6) + String(r.module).padStart(3) + "  " +
    String(r.c.repetition).padStart(4) + String(r.c.foundational).padStart(4) +
    String(r.c.numerical).padStart(4) + String(r.c.multiStep).padStart(4) + "  " +
    r.source.padEnd(8) + r.term + (r.foundational ? "   [foundational]" : "")
  );
}

const ownerRanked = rows.filter((r) => r.source === "owner").length;
const foundationalCount = rows.filter((r) => r.foundational).length;
console.log("");
console.log(`${rows.length} ideas measured; ${ownerRanked} carry an owner-authored importance, ${rows.length - ownerRanked} are this tool's derivation.`);
console.log(`${foundationalCount} are marked [foundational] — in over ${FOUNDATIONAL_SPREAD * 100}% of their subject's lectures. They rank on their own repetition AND are the yardstick for every other idea's foundational-tie score.`);
console.log('Explain one: --why "<term>".   Correct one: add "importance": <number> to its entry in data/syllabus/<SUBJ>.terms.json.');
