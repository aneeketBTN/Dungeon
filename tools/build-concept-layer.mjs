/*
 * The concept layer: every syllabus idea, where it enters, what it rests on.
 *
 * WHY THIS EXISTS
 * Owner direction, 2026-08-19: *"every concept is surfaced, but importance is how much this
 * concept contributes to the entire course as a whole, and other supplementary concepts can
 * help fill the picture. I just need proper layer."*
 *
 * Three things follow from that and none of them existed:
 *
 *  1. **Contribution is to the COURSE, not to the paper.** The earlier importance measure
 *     scaled everything by exam marks. That answers "what is worth testing"; it does not
 *     answer "what does the course rest on". The measure here is **module reach** — how many
 *     of a subject's eight modules return to the idea. `Startup` appears in 81 of 84 SPMS
 *     lectures across all 8 modules; `Crossing the chasm` sits in one. Those are different
 *     kinds of thing and the layer has to say so.
 *
 *  2. **Today's 64 concepts are not the spine.** They were chosen two per module, so they are
 *     module-local by construction: only 2 of 16 SPMS concepts span 6 or more modules, and 8
 *     of 16 sit in two or fewer. The ideas the course actually returns to — `Startup`,
 *     `Business model`, `Supply chain`, `Inclusive business` — **are not concepts at all**.
 *     The spine has never been modelled, which is why nothing in the product can express that
 *     one idea rests on another.
 *
 *  3. **A concept needs a parent, and that is the layer.** Links are derived from surfaces
 *     (`conceptId` + `supportingConceptIds`), so a concept with nothing above it is isolated
 *     and `groupWeaknesses()` can never pair it. Assigning each idea the higher-contribution
 *     idea it elaborates gives every concept a link by construction, and gives cross-module
 *     links for free wherever a module-6 detail attaches to a spine idea spanning 1 to 8.
 *
 * WHAT IT EMITS
 * For every named syllabus idea: its tier, the lecture where it first appears (its position in
 * the layer), its module reach, and the idea it elaborates. That is the layer, as data, so it
 * can be read and corrected before ~295 concept records are authored against it.
 *
 * IT PROPOSES, IT DOES NOT DECIDE. Parent assignment is derived — the highest-contribution
 * idea that co-occurs with this one and is taught no later than it. That is a defensible first
 * cut and nothing more; the owner pass is the point of emitting it.
 *
 * MATCHING IS LEXICAL AND COMPOUND NAMES ARE FRAGILE. An idea counts as present in a lecture
 * when every distinctive token of its name appears there. `MoSCoW and RICE prioritisation`
 * scores zero reach because the course spells it *prioritization* with a z, even though MoSCoW
 * and RICE are each in three lectures. Whole words only, for the RICE-inside-price reason
 * recorded in measure-concept-importance.mjs. Ideas that match nothing are reported separately
 * rather than silently dropped.
 *
 * USAGE
 *   node tools/build-concept-layer.mjs "<Term 6 Clean Transcripts>"
 *   node tools/build-concept-layer.mjs "<transcripts>" --course SPMS
 *   node tools/build-concept-layer.mjs "<transcripts>" --tier spine
 *   node tools/build-concept-layer.mjs "<transcripts>" --json
 *   node tools/build-concept-layer.mjs "<transcripts>" --unmatched
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const SYLLABUS_DIR = path.join(ROOT, "data", "syllabus");

/* SPINE SIZE IS A RANK, NOT A THRESHOLD, AND THAT WAS A CORRECTION.
 *
 * The first cut made spine mean "reaches >= 70% of the subject's modules". Measured, that put
 * **40 of 115 SPMS ideas** in the spine, which is not a spine — SPMS vocabulary is broadly
 * distributed, so a threshold that means something in SCLM means nothing here. A rank keeps the
 * spine the same size in every subject and lets the subjects differ in how far the rest fall
 * behind it. Twelve is roughly one and a half per module, which is the density of attachment
 * points a module can actually use. */
const SPINE_SIZE = 12;

/* PARENTS ARE FOUND IN A WINDOW, NOT IN A LECTURE, AND THAT WAS THE SAME CORRECTION AGAIN.
 *
 * The first cut assigned each idea the highest-reach idea sharing any lecture with it. In a
 * 20,000-character lecture almost everything co-occurs with almost everything, so it produced
 * `Funding stages -> Value innovation` and `Dark patterns -> Product metrics` — pairs with no
 * elaboration relationship at all. This is the identical failure that made lecture-granularity
 * foundational-tie score 78% of ideas at a flat 100 in measure-concept-importance.mjs, and it
 * takes the identical fix: require the two to appear within 1,200 characters of each other, so
 * the parent is an idea the course states *beside* this one rather than merely in the same
 * hour. */
const PARENT_WINDOW = 1200;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const OPTS = new Set(["--course", "--tier"]);
const transcriptRoot = args.find((a, i) => !a.startsWith("--") && !OPTS.has(args[i - 1]));

if (!transcriptRoot) {
  console.error("Pass the clean-transcripts root as the first argument.");
  process.exit(2);
}

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

const { loadLectures } = require(path.join(ROOT, "tools", "lib", "clean_transcripts.js"));
const loaded = loadLectures(transcriptRoot);
const lectures = loaded.lectures || loaded;
if (!lectures.length) { console.error("No lectures loaded — check the transcripts path."); process.exit(2); }

const wordsByLecture = new Map(lectures.map((l) => [l.lecture_id, wordSetOf(l.text)]));
const normByLecture = new Map(lectures.map((l) => [l.lecture_id, " " + normalise(l.text) + " "]));

/* Character offsets where an idea is stated, so a parent can be required to sit beside it. */
/* Tokens are already normalised to [a-z0-9 ], so nothing needs escaping — which also keeps
 * this free of the backslash-through-a-shell problem that produced a backspace character
 * instead of a word boundary while this file was being written. */
const RX = (token, flags) => new RegExp("\\b" + token + "\\b", flags || "");
function mentionOffsets(text, name) {
  const tk = tokensOf(name);
  if (!tk.length) return [];
  const out = [];
  const anchor = RX(tk[0], "g");
  let m;
  while ((m = anchor.exec(text))) {
    const lo = Math.max(0, m.index - PARENT_WINDOW / 2);
    const win = text.slice(lo, m.index + PARENT_WINDOW / 2);
    if (tk.every((t) => RX(t).test(win))) out.push(m.index);
  }
  return out;
}

function readSyllabus() {
  return fs.readdirSync(SYLLABUS_DIR).filter((f) => f.endsWith(".terms.json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(SYLLABUS_DIR, f), "utf8")));
}

const layers = [];
const unmatched = [];

for (const subject of readSyllabus()) {
  const courseId = subject.courseId;
  const subjectLectures = lectures.filter((l) => l.subject === courseId)
    .sort((a, b) => a.module - b.module || a.order - b.order);
  if (!subjectLectures.length) continue;
  const moduleCount = new Set(subjectLectures.map((l) => l.module)).size;
  const positionOf = new Map(subjectLectures.map((l, i) => [l.lecture_id, i]));

  const entries = [];
  for (const [moduleNo, terms] of Object.entries(subject.modules || {}))
    for (const t of terms) entries.push(typeof t === "string" ? { term: t, homeModule: +moduleNo } : { ...t, homeModule: +moduleNo });

  /* Where each idea appears. An alias counts as the idea. */
  const rows = [];
  for (const e of entries) {
    const names = [e.term, ...(e.aliases || [])];
    const hits = subjectLectures.filter((l) => names.some((n) => {
      const tk = tokensOf(n);
      return tk.length > 0 && tk.every((x) => wordsByLecture.get(l.lecture_id).has(x));
    }));
    if (!hits.length) { unmatched.push({ courseId, term: e.term, homeModule: e.homeModule }); continue; }
    const modules = new Set(hits.map((l) => l.module));
    const first = hits[0];
    rows.push({
      courseId,
      term: e.term,
      homeModule: e.homeModule,
      lectureCount: hits.length,
      moduleReach: modules.size,
      reachShare: modules.size / moduleCount,
      firstSeen: first.lecture_id,
      firstSeenModule: first.module,
      position: positionOf.get(first.lecture_id),
      lectureIds: new Set(hits.map((l) => l.lecture_id)),
      offsets: new Map(hits.map((l) => [l.lecture_id, mentionOffsets(normByLecture.get(l.lecture_id), names.find((n) => {
        const tk = tokensOf(n);
        return tk.length && tk.every((x) => wordsByLecture.get(l.lecture_id).has(x));
      }) || e.term)])),
      ownerTier: typeof e.tier === "string" ? e.tier : null,
    });
  }

  /* Spine by rank: the SPINE_SIZE highest-contribution ideas. Everything else is
   * supplementary — it fills the picture in, which is the owner's own word for it. An
   * authored `tier` on the term entry always wins. */
  const ranked = rows.slice().sort((a, b) => b.moduleReach - a.moduleReach || b.lectureCount - a.lectureCount || a.position - b.position);
  const spineSet = new Set(ranked.slice(0, SPINE_SIZE).map((r) => r.term));
  for (const r of rows) {
    r.tier = r.ownerTier || (spineSet.has(r.term) ? "spine" : "supplementary");
    r.tierSource = r.ownerTier ? "owner" : "derived";
  }

  /* PARENT ASSIGNMENT — the layer itself.
   *
   * A concept elaborates the highest-contribution idea that (a) shares at least one lecture
   * with it, and (b) is taught no later than it, so nothing rests on something a learner has
   * not met. Spine ideas are roots and take no parent. Ties break toward the idea introduced
   * closest before, which keeps a chain local rather than jumping to the subject's most
   * generic idea every time. */
  const byReach = rows.slice().sort((a, b) => b.moduleReach - a.moduleReach || a.position - b.position);
  for (const r of rows) {
    if (r.tier === "spine") { r.parent = null; r.parentWhy = "root"; continue; }
    let best = null;
    let bestTogether = 0;
    for (const cand of byReach) {
      if (cand === r) continue;
      if (cand.position > r.position) continue;
      /* Higher contribution, OR equal contribution but taught earlier.
       *
       * The equal-reach branch is not a nicety. SPMS has twenty ideas reaching all eight
       * modules and the spine is twelve, so on a strict "higher reach" rule the other eight
       * had nothing above them and came out unparented — orphaned by a tie, not by structure.
       * Allowing an equal-reach parent that enters earlier resolves those against teaching
       * order, which is the order the layer is built in anyway. */
      if (cand.moduleReach < r.moduleReach) continue;
      if (cand.moduleReach === r.moduleReach && cand.position >= r.position) continue;
      /* Beside, not merely in the same lecture: count how often the two are stated together
       * within the window. The count is the ranking signal, not just a yes/no. */
      let together = 0;
      for (const id of cand.lectureIds) {
        if (!r.lectureIds.has(id)) continue;
        const mine = r.offsets.get(id) || [];
        const theirs = cand.offsets.get(id) || [];
        for (const a of mine) for (const b of theirs) if (Math.abs(a - b) <= PARENT_WINDOW) { together += 1; break; }
      }
      if (!together) continue;
      /* RANK BY CO-OCCURRENCE STRENGTH, NOT BY PROXIMITY IN THE SYLLABUS.
       *
       * The first cut preferred the qualifying candidate introduced closest before this one.
       * That picks whatever the course happened to mention most recently, and it produced
       * `Payback period -> Growth strategies` when `Unit economics` was in the same lecture:
       * both qualified, and Growth strategies merely entered later. How often the course
       * states two ideas together is a direct measure of "this elaborates that", where
       * teaching adjacency is not a measure of anything. Position now only breaks ties. */
      if (!best || together > bestTogether
        || (together === bestTogether && cand.position > best.position)) { best = cand; bestTogether = together; }
    }
    r.parent = best ? best.term : null;
    r.parentWhy = best ? `${best.moduleReach} modules, enters ${best.firstSeen}` : "nothing higher-reach stated beside it earlier";
  }

  /* AN IDEA WITH NOTHING ABOVE IT IS A ROOT, NOT AN ERROR.
   *
   * The rank cut picks the twelve highest-contribution ideas, but contribution ties: SPMS has
   * twenty ideas reaching all eight modules. Some of the eight outside the cut enter at the
   * very first lecture, so there is nothing earlier for them to rest on either. Those are
   * structurally roots — that is what a root is — so they join the spine and are marked as
   * promoted, rather than being reported as a failure the owner has to resolve by hand. The
   * spine is therefore "the roots of the layer", which is a truer definition than "the top
   * twelve" and leaves the forest with no dangling nodes. */
  for (const r of rows) {
    if (r.tier !== "spine" && !r.parent) {
      r.tier = "spine";
      r.tierSource = r.tierSource === "owner" ? "owner" : "promoted";
      r.parentWhy = "root — nothing above it in the layer";
    }
  }

  rows.sort((a, b) => a.position - b.position);
  layers.push({ courseId, moduleCount, rows });
}

const only = value("--course", null);
const tierFilter = value("--tier", null);
const shown = layers.filter((l) => !only || l.courseId === only.toUpperCase());

if (flag("--json")) {
  console.log(JSON.stringify({
    generated: "build-concept-layer",
    tiers: { spineSize: SPINE_SIZE, parentWindow: PARENT_WINDOW },
    subjects: shown.map((l) => ({
      courseId: l.courseId,
      rows: l.rows.filter((r) => !tierFilter || r.tier === tierFilter)
        .map(({ lectureIds, offsets, ...rest }) => rest),
    })),
    unmatched,
  }, null, 2));
  process.exit(0);
}

if (flag("--unmatched")) {
  console.log("Syllabus ideas whose name matches no lecture — naming, not absence");
  console.log("=".repeat(78));
  console.log("A compound name fails if ANY token misses. `MoSCoW and RICE prioritisation`");
  console.log("scores zero because the course spells it `prioritization` with a z.\n");
  for (const u of unmatched) console.log(`  ${u.courseId}  M${u.homeModule}  ${u.term}`);
  console.log(`\n${unmatched.length} of ${unmatched.length + layers.reduce((n, l) => n + l.rows.length, 0)} ideas unmatched.`);
  process.exit(0);
}

console.log("The concept layer — every idea, where it enters, what it rests on");
console.log("=".repeat(78));
console.log("Contribution to the course is MODULE REACH: how many of the subject's modules");
console.log("return to the idea. Tier follows from it; the parent is the higher-contribution");
console.log("idea it elaborates. A PROPOSAL, for correction — see --json to take it as data.\n");

for (const layer of shown) {
  const rows = layer.rows.filter((r) => !tierFilter || r.tier === tierFilter);
  const counts = {};
  for (const r of layer.rows) counts[r.tier] = (counts[r.tier] || 0) + 1;
  const promoted = layer.rows.filter((r) => r.tierSource === "promoted").length;
  console.log(`\n${layer.courseId} — ${layer.rows.length} ideas placed | `
    + Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")
    + (promoted ? ` (of the spine, ${promoted} promoted as roots)` : ""));
  console.log("-".repeat(78));
  console.log("reach  role   enters        idea  ->  elaborates");
  for (const r of rows) {
    const tierMark = r.tier === "spine" ? "SPINE" : "  .  ";
    const head = `${String(r.moduleReach).padStart(2)}/${layer.moduleCount}  ${tierMark}  ${r.firstSeen.padEnd(13)} ${r.term}`;
    console.log(head + (r.parent ? `  ->  ${r.parent}` : "  ->  (root)"));
  }
}

const totalRoots = layers.reduce((n, l) => n + l.rows.filter((r) => !r.parent).length, 0);
console.log("\n" + "=".repeat(78));
console.log(`${layers.reduce((n, l) => n + l.rows.length, 0)} ideas placed, ${unmatched.length} unmatched (--unmatched), ${totalRoots} of them roots.`);
console.log("Every idea is surfaced. Tier sets its role in the layer, never whether it is tested.");
console.log("Correct a role by adding \"tier\": \"spine\" or \"supplementary\" to the term entry in");
console.log("data/syllabus/<SUBJ>.terms.json; an owner value always wins and reports as `owner`.");
console.log("Plan: docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md");
