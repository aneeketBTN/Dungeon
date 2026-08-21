/*
 * The concept spine: how many concepts, what each one yields, and which are isolated.
 *
 * WHY THIS EXISTS
 * Everything the product tracks hangs off a concept — mastery, weakness pairing, the
 * re-teach latch, the primer, the mock. There were measurements for what the LESSONS
 * cover (measure-syllabus-coverage) and for what the BANK names (check-taught-not-tested),
 * and none for the shape of the spine itself. So the facts that decide Phase 2 were not
 * visible to anyone: 64 concepts at 14.4 surfaces each, and a link graph that is
 * lopsided to the point of being absent in one subject.
 *
 * WHAT IT FOUND, AND WHY --gate EXISTS
 * Links are not a field. `conceptLinks()` (app/t6.js) derives an edge wherever a question
 * names one concept in `conceptId` and another in `supportingConceptIds`. Almost all of
 * those come from two generated families — the module match (`distinguish`) and the five
 * boss steps (`synthesis`). Before 2026-08-19 both were produced from this call site:
 *
 *     addModuleMatch(course, module, pair.slice(0, 2), dataById)      // t6_challenges.js
 *
 * `pair.slice(0, 2)` was harmless only while every module held exactly two concepts. A
 * probe proved that a third concept could orphan a shipped neighbour. Since 2026-08-19
 * the call site chains every consecutive pair for both families, so widening a module
 * retains neighbour links. The gate remains as the backstop for that invariant.
 *
 * That is a structural invariant rather than a calibrated threshold, so gating it does
 * not repeat LAW-75: this asserts "no concept is unreachable by the pairing mechanism",
 * which is true or false, not tuned. `--gate` exits non-zero when any concept has no
 * edge. It is the check that would have caught the slice before it mattered.
 *
 * THE OTHER FINDING, WHICH IS NOT GATED
 * Cross-module edges come almost entirely from the `generate` family — integrated written
 * case prompts — and `addIntegratedScenarios()` runs only for BRGSA and IBM. Measured:
 * BRGSA 41 cross-module edges, IBM 27, SCLM 2 (one hand-authored item), SPMS **0**. So
 * SPMS could not pair a weakness across modules at all. An authored roadmap/traceability
 * synthesis surface supplied its first cross-module edge on 2026-08-20. Zero is still
 * deliberately reported and not gated, because the fix is authoring rather than code and
 * because a subject may legitimately sit at zero for a while. See the spine build plan.
 *
 * USAGE
 *   node tools/measure-concept-spine.mjs              report every subject
 *   node tools/measure-concept-spine.mjs --gate       exit non-zero if any concept is isolated
 *   node tools/measure-concept-spine.mjs --course SPMS
 *   node tools/measure-concept-spine.mjs --json
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const APP = path.join(ROOT, "app");
const COURSE_IDS = ["BRGSA", "IBM", "SCLM", "SPMS"];

/* Same six files and the same shim as check-taught-not-tested.mjs. If one changes the
 * other must, or the two tools stop describing the same bank. */
const BANK_FILES = [
  "sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js",
  "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_ibm_case.js", "sets/t6_challenges.js",
];

function loadCourses() {
  const context = {
    window: {},
    atob: (value) => Buffer.from(value, "base64").toString("binary"),
  };
  vm.createContext(context);
  for (const relative of BANK_FILES) {
    const filename = path.join(APP, relative);
    vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
  }
  return context.window.T6_COURSES;
}

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
};

const courses = loadCourses();
const only = value("--course", null);
const wanted = only ? [only.toUpperCase()] : COURSE_IDS;

const report = [];
for (const courseId of wanted) {
  const course = courses[courseId];
  if (!course) continue;
  const concepts = course.concepts || [];
  const questions = course.questions || {};
  const questionIds = Object.keys(questions);

  const surfacesByConcept = {};
  const familyCounts = {};
  for (const id of questionIds) {
    const question = questions[id];
    const family = question.perspective || (question.boss ? "boss" : "other");
    familyCounts[family] = (familyCounts[family] || 0) + 1;
    if (question.conceptId) {
      surfacesByConcept[question.conceptId] = (surfacesByConcept[question.conceptId] || 0) + 1;
    }
  }

  /* Mirrors conceptLinks() in app/t6.js: an edge exists only where one surface names
   * both concepts. Primer-only items are excluded there and here. */
  const edges = new Set();
  const linked = new Set();
  const moduleOf = Object.fromEntries(concepts.map((c) => [c.id, c.module]));
  let crossModule = 0;
  for (const id of questionIds) {
    const question = questions[id];
    if (question.primerOnly) continue;
    const ids = [...new Set([question.conceptId, ...(question.supportingConceptIds || [])])].filter(Boolean);
    for (let a = 0; a < ids.length; a += 1) {
      for (let b = a + 1; b < ids.length; b += 1) {
        const key = [ids[a], ids[b]].sort().join("|");
        if (!edges.has(key)) {
          edges.add(key);
          if (moduleOf[ids[a]] !== undefined && moduleOf[ids[b]] !== undefined
            && moduleOf[ids[a]] !== moduleOf[ids[b]]) crossModule += 1;
        }
        linked.add(ids[a]);
        linked.add(ids[b]);
      }
    }
  }

  const isolated = concepts.filter((c) => !linked.has(c.id));
  const counts = concepts.map((c) => surfacesByConcept[c.id] || 0).sort((a, b) => a - b);

  /* Wide modules exercise the consecutive-pair generalisation. Report them even when
   * nothing is isolated so the backstop remains visible as the spine grows. */
  const byModule = {};
  for (const c of concepts) byModule[c.module] = (byModule[c.module] || 0) + 1;
  const wideModules = Object.entries(byModule).filter(([, n]) => n > 2).map(([m, n]) => `M${m}:${n}`);

  report.push({
    courseId,
    concepts: concepts.length,
    questions: questionIds.length,
    surfacesPerConcept: {
      min: counts[0] || 0,
      median: counts[Math.floor(counts.length / 2)] || 0,
      max: counts[counts.length - 1] || 0,
    },
    edges: edges.size,
    crossModuleEdges: crossModule,
    isolated: isolated.map((c) => c.id),
    wideModules,
    families: familyCounts,
  });
}

if (flag("--json")) {
  console.log(JSON.stringify({ generated: "measure-concept-spine", subjects: report }, null, 2));
  process.exit(report.some((r) => r.isolated.length) && flag("--gate") ? 1 : 0);
}

console.log("Concept spine — the shape everything else hangs off");
console.log("=".repeat(78));
console.log("An edge exists only where ONE surface names two concepts (conceptId +");
console.log("supportingConceptIds). Links are derived, never authored on the concept.\n");

console.log("subject   concepts  questions   surfaces/concept      edges  cross-module  isolated");
console.log("-".repeat(78));
let totalConcepts = 0, totalQuestions = 0, totalIsolated = 0;
for (const r of report) {
  totalConcepts += r.concepts;
  totalQuestions += r.questions;
  totalIsolated += r.isolated.length;
  console.log(
    r.courseId.padEnd(9) +
    String(r.concepts).padStart(8) + String(r.questions).padStart(11) + "   " +
    `${r.surfacesPerConcept.min}/${r.surfacesPerConcept.median}/${r.surfacesPerConcept.max}`.padEnd(18) +
    String(r.edges).padStart(5) + String(r.crossModuleEdges).padStart(14) +
    String(r.isolated.length).padStart(10)
  );
}
console.log("-".repeat(78));
console.log(`ALL      ${String(totalConcepts).padStart(8)}${String(totalQuestions).padStart(11)}   ` +
  `${(totalQuestions / Math.max(1, totalConcepts)).toFixed(1)} per concept`);

const zeroCross = report.filter((r) => r.crossModuleEdges === 0);
if (zeroCross.length) {
  console.log("");
  console.log("NO CROSS-MODULE LINKS: " + zeroCross.map((r) => r.courseId).join(", "));
  console.log("  groupWeaknesses() can only pair within a module there, so promise 1 —");
  console.log("  concepts building on one another — is structurally unavailable.");
  console.log("  The fix is an authored cross-module surface, not code. For an");
  console.log("  objective-only paper that means a `synthesis` MCQ carrying both concepts");
  console.log("  in supportingConceptIds; sclm_syn_inventory is the only worked example.");
}

const wide = report.filter((r) => r.wideModules.length);
if (wide.length) {
  console.log("");
  console.log("MODULES HOLDING MORE THAN TWO CONCEPTS:");
  for (const r of wide) console.log(`  ${r.courseId}: ${r.wideModules.join(" ")}`);
  console.log("  Since 2026-08-19 both the module match and all five boss steps chain");
  console.log("  consecutive pairs, so every concept links to at least one neighbour.");
}

if (totalIsolated) {
  console.log("");
  console.log("ISOLATED CONCEPTS — no surface links these to anything:");
  for (const r of report) {
    if (r.isolated.length) console.log(`  ${r.courseId}: ${r.isolated.join(", ")}`);
  }
}

console.log("");
if (flag("--gate")) {
  if (totalIsolated) {
    console.log(`CONCEPT SPINE GATE: FAIL — ${totalIsolated} concept(s) have no link.`);
    console.log("Every concept must be reachable by groupWeaknesses(). See");
    console.log("docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md §3.1.");
    process.exit(1);
  }
  console.log("CONCEPT SPINE GATE: PASS — every concept has at least one link.");
} else {
  console.log("A measurement. Add --gate to fail when a concept has no link at all.");
  console.log("Plan: docs/briefs/CONCEPT_SPINE_BUILD_PLAN.md");
}
