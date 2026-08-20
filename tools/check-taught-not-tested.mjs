#!/usr/bin/env node
/*
 * THE MIRROR OF LAW-47.
 *
 * `tools/browser-checks/teach-before-test.js` verifies that no surface a learner
 * meets precedes the lesson for the lecture it cites — that whatever we TEST was
 * TAUGHT first. Nothing verified the other direction, and that is the direction the
 * standing brief's fourth promise runs in: *"If Examiner feels foreign — that's
 * Dungeon Learn's failure."*
 *
 * When this was written the teaching layer reached 359 of 359 named syllabus ideas
 * and the question bank reached 126 — so a learner could finish every study set, sit
 * the mock, score well, and still meet the real paper cold on two thirds of the
 * syllabus. Every existing gate was green over that.
 *
 * WHAT IT MEASURES
 * For each named idea in `data/syllabus/<SUBJ>.terms.json`, does any question in the
 * subject's bank NAME it — in the stem, an option, the explanation, the caselet, or
 * the concept label? Same phrase-contiguous whole-word matcher as
 * `measure-syllabus-coverage.mjs`, pointed at the bank instead of the lessons, so the
 * two numbers are directly comparable and neither can be made to look better by
 * loosening its own matching.
 *
 * WHAT IT DOES NOT MEASURE — read this before quoting a pass.
 *   - It asks whether the bank NAMES the idea, not whether it tests it WELL. One
 *     passing mention in a distractor counts.
 *   - It reads the whole bank, not the scheduled subset. A question in no run still
 *     counts here, the same way an unscheduled lesson counts for lesson coverage.
 *   - A question that genuinely tests an idea under a different name reads as a miss.
 *     That is the point of --triage, and it is the first thing to run on any miss.
 *
 * FLOORS, AND WHY THESE ARE NOT LAW-75's MISTAKE
 * `data/syllabus/tested-floors.json` holds the values measured the day this was
 * written. They are a RATCHET BASELINE, not a quality threshold: the gate fails when
 * a number goes DOWN, so authoring can only add. LAW-75 warns against calibrating a
 * defect DETECTOR on the population it polices — a threshold drawn through
 * contaminated data sits where the defects already are. That does not apply to a
 * set-membership ratchet, which makes no judgement about what is good: 35% is
 * recorded precisely because it is bad, so it cannot silently get worse while the
 * real target is 100%.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const APP = path.join(ROOT, "app");
const SYLLABUS_DIR = path.join(ROOT, "data", "syllabus");
const FLOORS_PATH = path.join(SYLLABUS_DIR, "tested-floors.json");
const COURSE_IDS = ["BRGSA", "IBM", "SCLM", "SPMS"];

const BANK_FILES = [
  "sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js",
  "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_challenges.js",
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

/* Identical to measure-syllabus-coverage.mjs. If one is changed the other must be,
 * or the taught and tested numbers stop being comparable — which is the whole point
 * of this tool existing beside that one. */
const normalise = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeWord = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Phrase-contiguous, whole-word, plural-tolerant on the final word only.
 * See coverage-floors.json for the three matching bugs this shape exists to prevent:
 * RICE inside "price", scattered-token matching, and dropped interior function words. */
function phrasePattern(term) {
  const body = normalise(term).split(" ").map(escapeWord).join("\\s+");
  return new RegExp(`\\b${body}(?:e?s)?\\b`, "i");
}

function corpusFor(course) {
  const bank = course.questions || course.bank || {};
  return normalise(
    Object.values(bank)
      .map((q) =>
        [q.stem, (q.options || []).join(" "), q.explanation, q.caselet, q.node].join(" ")
      )
      .join(" ")
  );
}

function termsFor(courseId) {
  const file = path.join(SYLLABUS_DIR, `${courseId}.terms.json`);
  const modules = JSON.parse(fs.readFileSync(file, "utf8")).modules;
  const out = [];
  for (const mod of Object.keys(modules).sort((a, b) => Number(a) - Number(b))) {
    for (const entry of modules[mod]) {
      const term = typeof entry === "string" ? entry : entry.term;
      const aliases = (typeof entry === "object" && entry.aliases) || [];
      out.push({ module: Number(mod), term, forms: [term, ...aliases] });
    }
  }
  return out;
}

/* Naming drift or a real hole?
 *
 * A miss where the bank names the idea differently — "landing page" occurs 15 times
 * while the syllabus says "Landing page validation" — is a wording decision. A miss
 * where the idea is simply not there is authoring. Reporting them in one list is what
 * makes a 233-item queue feel unstartable.
 *
 * MEASURED PER QUESTION, NOT PER CORPUS, and that is the whole correctness of it.
 * The first version asked whether each distinctive word appeared anywhere in the
 * subject's bank. Across 236 questions that is nearly free: "Return on assets" was
 * called drift because "return" appears 7 times and "assets" 5 times, in unrelated
 * questions, while the bank never says ROA or return on assets at all. Requiring the
 * words to land in the SAME question is what separates "we call it something else"
 * from "these are two common English words".
 *
 * It is still a hint, not a verdict. Read the item before acting on either label. */
const WEAK = new Set(["the", "and", "for", "with", "that", "this", "are", "not", "but", "its",
  "versus", "vs", "of", "in", "on", "to", "or", "a", "an", "by", "at", "as", "is"]);

function triage(questionTexts, forms) {
  let best = 0;
  for (const form of forms) {
    const words = normalise(form).split(" ").filter((w) => w.length > 2 && !WEAK.has(w));
    if (!words.length) continue;
    const patterns = words.map((w) => phrasePattern(w));
    for (const text of questionTexts) {
      const present = patterns.filter((p) => p.test(text)).length;
      const share = present / words.length;
      if (share > best) best = share;
      if (best === 1) return "drift";   // one question carries every word, in another order
    }
  }
  if (best === 0) return "absent";
  return "partial";
}

function measure(courses) {
  return COURSE_IDS.map((courseId) => {
    const course = courses[courseId];
    const corpus = corpusFor(course);
    const bank = course.questions || course.bank || {};
    /* One normalised string per question, for the per-question triage above. */
    const questionTexts = Object.values(bank).map((q) =>
      normalise([q.stem, (q.options || []).join(" "), q.explanation, q.caselet, q.node].join(" "))
    );
    const terms = termsFor(courseId);
    const misses = [];
    let reached = 0;
    for (const t of terms) {
      if (t.forms.some((f) => phrasePattern(f).test(corpus))) reached += 1;
      else misses.push({ ...t, kind: triage(questionTexts, t.forms) });
    }
    return {
      courseId,
      questions: Object.keys(bank).length,
      concepts: Object.keys(course.concepts || {}).length,
      ideas: terms.length,
      reached,
      percent: Math.round((reached / terms.length) * 100),
      misses,
    };
  });
}

/* `triage` is exported so its per-question rule can be tested against synthetic
 * input rather than against whichever syllabus term happens to be untested today.
 * The first version of that test named "Return on assets" as its live fixture and
 * failed the moment a concept record closed it — a test calibrated on the population
 * it polices, which is the shape LAW-75 warns about. Everything below the guard is
 * CLI output, so importing this module runs no measurement. */
export { triage };

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {

// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const wantGate = args.includes("--gate");
const wantMissing = args.includes("--missing");
const wantTriage = args.includes("--triage");
const only = (() => {
  const i = args.indexOf("--subject");
  return i >= 0 ? args[i + 1] : null;
})();

const results = measure(loadCourses()).filter((r) => !only || r.courseId === only);

console.log("Taught, but never tested — does any question name what the lessons teach?");
console.log("=".repeat(78));
console.log("subject   questions  concepts   syllabus ideas   named by a question");
for (const r of results) {
  console.log(
    r.courseId.padEnd(10) +
    String(r.questions).padStart(9) +
    String(r.concepts).padStart(10) +
    String(r.ideas).padStart(17) +
    String(r.reached).padStart(14) + "  " + String(r.percent).padStart(3) + "%"
  );
}
const totalIdeas = results.reduce((a, r) => a + r.ideas, 0);
const totalReached = results.reduce((a, r) => a + r.reached, 0);
console.log("-".repeat(78));
console.log(
  "ALL".padEnd(10) +
  String(results.reduce((a, r) => a + r.questions, 0)).padStart(9) +
  String(results.reduce((a, r) => a + r.concepts, 0)).padStart(10) +
  String(totalIdeas).padStart(17) +
  String(totalReached).padStart(14) + "  " +
  String(Math.round((totalReached / totalIdeas) * 100)).padStart(3) + "%"
);

if (wantTriage) {
  console.log("\nMisses by kind — these need different work, so do not queue them together.");
  console.log("  drift    every distinctive word appears, the phrase does not — a wording fix");
  console.log("  partial  some words appear — read the item before deciding");
  console.log("  absent   nothing appears — genuine authoring");
  for (const r of results) {
    const by = { drift: [], partial: [], absent: [] };
    for (const m of r.misses) by[m.kind].push(`M${m.module} ${m.term}`);
    console.log(`\n${r.courseId} — ${r.misses.length} missing of ${r.ideas}`);
    for (const kind of ["drift", "partial", "absent"]) {
      if (!by[kind].length) continue;
      console.log(`  ${kind} (${by[kind].length}):`);
      for (const t of by[kind]) console.log(`     ${t}`);
    }
  }
} else if (wantMissing) {
  for (const r of results) {
    console.log(`\n${r.courseId} — ${r.misses.length} missing of ${r.ideas}`);
    for (const m of r.misses) console.log(`   M${m.module} ${m.term}  [${m.kind}]`);
  }
} else {
  console.log("\nRun with --triage to split the misses into wording fixes and real authoring,");
  console.log("or --missing to list them flat.");
}

if (wantGate) {
  const floors = JSON.parse(fs.readFileSync(FLOORS_PATH, "utf8"));
  const failures = [];
  for (const r of results) {
    const floor = floors.floors[r.courseId];
    if (floor === undefined) failures.push(`${r.courseId}: no floor recorded — add one to tested-floors.json`);
    else if (r.percent < floor) failures.push(`${r.courseId}: ${r.percent}% is below its floor of ${floor}%`);
  }
  console.log("\n" + "-".repeat(78));
  if (failures.length) {
    console.log("TAUGHT-NOT-TESTED GATE: FAIL");
    for (const f of failures) console.log("  " + f);
    console.log("\nThis gate ratchets upward. A drop means a question stopped naming an idea it");
    console.log("used to name. Do not lower a floor to make a run green.");
    process.exit(1);
  }
  console.log("TAUGHT-NOT-TESTED GATE: PASS");
  for (const r of results) {
    console.log(`  ${r.courseId.padEnd(6)} ${String(r.percent).padStart(3)}% (floor ${floors.floors[r.courseId]}%)`);
  }
  console.log("\nPASS means named-idea coverage did not regress. It does NOT mean equal depth,");
  console.log(`faculty review, or exam prediction — the bank currently names ${Math.round((totalReached / totalIdeas) * 100)}% of the syllabus.`);
}

}
