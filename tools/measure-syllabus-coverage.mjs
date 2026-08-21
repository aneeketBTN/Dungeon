/*
 * How much of the course does the teaching layer actually teach?
 *
 * WHY THIS EXISTS
 * The bank is measured from every angle — name-matching, option length, layering,
 * teach-before-test — and every one of those asks whether the QUESTIONS are fair.
 * None of them asks whether a learner arriving cold is ever told the thing. Until
 * this tool there was no list in the repository of what the course examines, so
 * "does Learn teach the subject" had no answer and no gate, and the honest answer
 * turned out to be about half.
 *
 * Measured 2026-08-17 over the course's own revision sheets: 175 of 358 named ideas
 * present anywhere in the teaching layer. BRGSA 88%, SCLM 54%, SPMS 52%, IBM 20%.
 * That spread is not random — it tracks lessons-per-module exactly. BRGSA was
 * authored at six lectures per module and reaches 88%; the other three were authored
 * at two. `app/sets/t6_lessons.js`'s own header has said so since it was written
 * ("BRGSA complete … IBM, SCLM, and SPMS outstanding"). Nothing enforced it.
 *
 * WHAT IT MEASURES
 * For every term in data/syllabus/*.terms.json: does a learner reading ONLY this
 * subject's lessons meet those words anywhere — title, objective, explainer, worked
 * example, glossary, or handoff? That is a deliberately generous bar. It does not ask
 * whether the idea is taught WELL, or in the right module, or before it is tested
 * (that is check-taught-vocabulary.mjs). It asks whether the words appear at all, and
 * roughly half of them do not.
 *
 * MATCHING IS LEXICAL, AND THAT CUTS BOTH WAYS
 * A term counts as taught when every distinctive token of its name — or of any alias —
 * appears in the corpus. So an idea taught thoroughly under a name the list does not
 * carry reads as absent, which is what `aliases` exists to fix: the SPMS lesson teaches
 * GDPR's "data protection by design", and "Privacy by design" is the same idea, so it
 * is an alias rather than a second term. When a term reads absent and the idea is
 * genuinely taught, add the alias — do not lower the floor.
 *
 * THE FLOOR RATCHETS
 * coverage-floors.json holds the value measured when this tool was written. --gate
 * exits non-zero if any subject falls below its floor, so coverage can rise and can
 * never quietly fall. Raise a floor when authoring lands; never lower one to make a
 * run green.
 *
 * WHY THE TERM LIST IS COMMITTABLE AND THE SOURCE IS NOT
 * docs/course-material/ is owner-supplied and gitignored. A term is a label, not
 * content — no definition, sentence, or table from the course is reproduced in
 * data/syllabus/. See data/syllabus/README.md.
 *
 * USAGE
 *   node tools/measure-syllabus-coverage.mjs                 report all four subjects
 *   node tools/measure-syllabus-coverage.mjs --gate          exit non-zero below a floor
 *   node tools/measure-syllabus-coverage.mjs --course SPMS   one subject
 *   node tools/measure-syllabus-coverage.mjs --missing       list every untaught term
 *   node tools/measure-syllabus-coverage.mjs --json          machine-readable
 *   node tools/measure-syllabus-coverage.mjs --emit          write app/sets/t6_coverage.js
 *
 * --emit exists because the learner is the person with the most right to this number
 * and the least access to it. The app ships counts (16 concepts, 0 Strong) that read
 * as a whole subject, while the teaching layer covers well under half of what the
 * course examines. The emitted file carries ONLY aggregate counts per subject and
 * module — never a term, never a definition — so shipping it keeps the source
 * material out of the client exactly as it stays out of the repository.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SYLLABUS_DIR = path.join(ROOT, "data", "syllabus");
const FLOORS_PATH = path.join(SYLLABUS_DIR, "coverage-floors.json");

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? null : argv[i + 1];
};

/* ------------------------------------------------------------------ *
 * Load the lesson layer exactly the way the app does.
 * ------------------------------------------------------------------ */

function loadLessons() {
  const win = {};
  // t6_brgsa.js before t6_catalog.js: loading the catalog alone yields 48 concepts
  // instead of 64 and silently drops a whole subject (recorded 2026-08-15).
  const files = ["t6_lessons.js", "t6_brgsa.js", "t6_catalog.js", "t6_integrated.js", "t6_ibm_case.js", "t6_challenges.js"];
  for (const file of files) {
    const full = path.join(ROOT, "app", "sets", file);
    if (!fs.existsSync(full)) continue;
    // eslint-disable-next-line no-new-func
    new Function("window", fs.readFileSync(full, "utf8"))(win);
  }
  if (!win.T6_LESSONS) throw new Error("app/sets/t6_lessons.js did not define window.T6_LESSONS");
  return win.T6_LESSONS;
}

const normalise = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* Everything a learner reads for one subject, as one lowercase string. */
function corpusFor(lessons, courseId) {
  return normalise(
    Object.values(lessons)
      .filter((lesson) => lesson.courseId === courseId)
      .map((lesson) =>
        [
          lesson.title,
          lesson.objective,
          (lesson.explainer || []).join(" "),
          lesson.worked ? [lesson.worked.setup, lesson.worked.move, lesson.worked.because].join(" ") : "",
          (lesson.glossary || []).map((entry) => entry.term + " " + entry.plain).join(" "),
          lesson.connects,
        ].join(" ")
      )
      .join(" ")
  );
}

/* Tokens too common to carry meaning on their own. A term made only of these
 * would match anything, so it is treated as taught rather than reported. */
const WEAK = new Set(["the", "and", "for", "with", "that", "this", "are", "not", "but", "its",
  "versus", "vs", "of", "in", "on", "to", "or", "a", "an", "by", "at", "as", "is"]);

function tokensOf(term) {
  return normalise(term).split(" ").filter((token) => token.length > 2 && !WEAK.has(token));
}

/* WHOLE WORDS ONLY — this is not a detail.
 *
 * The first version of this tool used String.includes and reported RICE as taught
 * across SPMS, because "rice" is a substring of "price" and every pricing lesson
 * contains it. The same trap swallows SAM inside "same", SOM inside "some", TAM
 * inside "total addressable market" only by luck, and PLM inside nothing at all.
 * A three-letter acronym is exactly the shape this course examines and exactly the
 * shape substring matching cannot see, so the measurement would have declared the
 * single worst gap in the bank — 20 questions on an idea no lesson teaches — closed.
 *
 * Singular/plural tolerance is kept, but bounded the same way: "curves" matches
 * "curve", "strategies" matches "strategy", and neither matches a longer word that
 * merely contains them.
 */
const WORD_CACHE = new Map();
function wordsOf(corpus) {
  let set = WORD_CACHE.get(corpus);
  if (!set) {
    set = new Set(corpus.split(" "));
    WORD_CACHE.set(corpus, set);
  }
  return set;
}

function corpusHas(corpus, token) {
  const words = wordsOf(corpus);
  if (words.has(token)) return true;
  if (words.has(token + "s")) return true;
  if (token.endsWith("s") && words.has(token.slice(0, -1))) return true;
  if (token.endsWith("ies") && words.has(token.slice(0, -3) + "y")) return true;
  if (token.endsWith("y") && words.has(token.slice(0, -1) + "ies")) return true;
  return false;
}

/* THE PHRASE, NOT ITS WORDS SCATTERED ACROSS THE SUBJECT.
 *
 * Second measurement bug in this same function, caught the same session. After
 * whole-word matching was fixed, RICE was STILL reported as taught — because its
 * alias "reach impact confidence effort" was tested as four independent tokens, and
 * across 7,000 words of product-management prose "reach", "impact", "confidence" and
 * "effort" each appear somewhere by coincidence. Any multi-word name built from
 * ordinary English words will match a large enough corpus that way, which makes the
 * check weakest exactly where the course's vocabulary is plainest.
 *
 * A named idea appears as its name. So the phrase must appear contiguously, with
 * plural tolerance on its final word. That is deliberately strict, and the strictness
 * points the safe way: a false "not taught" costs one alias in data/syllabus/, while a
 * false "taught" hides a real hole and the gate goes green over it.
 */
/* Match the phrase AS WRITTEN, small words included.
 *
 * Third correction to this function. Dropping "to" and "be" before matching turned
 * "Jobs to Be Done" — which is the title of an SPMS lesson — into the token pair
 * "jobs done", which appears nowhere, so the tool reported the course's best-taught
 * concept as untaught. Interior function words are part of a name; only leading and
 * trailing noise is worth trimming.
 *
 * So: normalise the whole name and look for it contiguously, with plural tolerance on
 * the final word. Single words still get whole-word matching with plural tolerance.
 */
function corpusHasPhrase(corpus, name) {
  const phrase = normalise(name);
  if (!phrase) return true;
  const parts = phrase.split(" ");
  if (parts.length === 1) return corpusHas(corpus, parts[0]);

  const padded = " " + corpus + " ";
  const head = parts.slice(0, -1).join(" ");
  const last = parts[parts.length - 1];
  const variants = new Set([last, last + "s"]);
  if (last.endsWith("s")) variants.add(last.slice(0, -1));
  if (last.endsWith("y")) variants.add(last.slice(0, -1) + "ies");
  if (last.endsWith("ies")) variants.add(last.slice(0, -3) + "y");
  return [...variants].some((tail) => padded.includes(" " + head + " " + tail + " "));
}

function isTaught(entry, corpus) {
  const names = [entry.term, ...(entry.aliases || [])];
  return names.some((name) => corpusHasPhrase(corpus, name));
}

/* ------------------------------------------------------------------ *
 * Measure
 * ------------------------------------------------------------------ */

function readSyllabus() {
  if (!fs.existsSync(SYLLABUS_DIR)) throw new Error("missing data/syllabus/");
  return fs
    .readdirSync(SYLLABUS_DIR)
    .filter((file) => file.endsWith(".terms.json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(SYLLABUS_DIR, file), "utf8")))
    .sort((a, b) => a.courseId.localeCompare(b.courseId));
}

function measure(lessons, syllabus) {
  const corpus = corpusFor(lessons, syllabus.courseId);
  const lessonCount = Object.values(lessons).filter((l) => l.courseId === syllabus.courseId).length;
  const modules = [];

  for (const [moduleNumber, rawTerms] of Object.entries(syllabus.modules)) {
    const terms = rawTerms.map((raw) => (typeof raw === "string" ? { term: raw } : raw));
    const missing = terms.filter((entry) => !isTaught(entry, corpus)).map((entry) => entry.term);
    modules.push({
      module: Number(moduleNumber),
      total: terms.length,
      taught: terms.length - missing.length,
      missing,
    });
  }
  modules.sort((a, b) => a.module - b.module);

  const total = modules.reduce((sum, m) => sum + m.total, 0);
  const taught = modules.reduce((sum, m) => sum + m.taught, 0);
  return {
    courseId: syllabus.courseId,
    title: syllabus.title,
    lessonCount,
    corpusWords: corpus ? corpus.split(" ").length : 0,
    total,
    taught,
    missing: total - taught,
    percent: total ? Math.round((taught / total) * 100) : 0,
    modules,
  };
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

const lessons = loadLessons();
let syllabi = readSyllabus();
const only = valueOf("--course");
if (only) syllabi = syllabi.filter((s) => s.courseId.toUpperCase() === only.toUpperCase());
if (!syllabi.length) {
  console.error(only ? `No syllabus for "${only}".` : "No data/syllabus/*.terms.json files found.");
  process.exit(2);
}

const results = syllabi.map((s) => measure(lessons, s));

if (has("--emit")) {
  const payload = {};
  for (const r of results) {
    payload[r.courseId] = {
      lessons: r.lessonCount,
      ideas: r.total,
      taught: r.taught,
      percent: r.percent,
      modules: r.modules.map((m) => ({ module: m.module, ideas: m.total, taught: m.taught })),
    };
  }
  const banner = [
    "/*",
    " * GENERATED — do not edit by hand.",
    " *   node tools/measure-syllabus-coverage.mjs --emit",
    " *",
    " * How much of each subject's examinable content the teaching layer actually covers,",
    " * so the app can say so instead of presenting 16 concepts as a whole subject.",
    " *",
    " * Counts only. No term, definition, or sentence from the course material appears here,",
    " * which is what makes this safe to ship to a browser and to commit.",
    " */",
    "(function () {",
    '  "use strict";',
    "  window.T6_COVERAGE = " + JSON.stringify(payload, null, 2).split("\n").join("\n  ") + ";",
    "}());",
    "",
  ].join("\n");
  const out = path.join(ROOT, "app", "sets", "t6_coverage.js");
  fs.writeFileSync(out, banner);
  console.log(`wrote ${path.relative(ROOT, out)}`);
  for (const r of results) console.log(`  ${r.courseId.padEnd(6)} ${r.taught}/${r.total} (${r.percent}%)`);
  process.exit(0);
}

if (has("--json")) {
  console.log(JSON.stringify({ generated: "measure-syllabus-coverage", results }, null, 2));
} else {
  console.log("Syllabus coverage — does the teaching layer contain what the course examines?\n");
  for (const r of results) {
    console.log("=".repeat(78));
    console.log(`${r.courseId} — ${r.title}`);
    console.log(`${r.lessonCount} lessons, ${r.corpusWords} words of teaching prose`);
    console.log("=".repeat(78));
    for (const m of r.modules) {
      const pct = m.total ? Math.round((m.taught / m.total) * 100) : 0;
      const bar = pct === 0 ? "  <- nothing" : pct === 100 ? "" : "";
      console.log(`  M${m.module}  ${String(m.taught).padStart(3)}/${String(m.total).padEnd(3)} ${String(pct).padStart(3)}%${bar}`);
      if (m.missing.length && has("--missing")) {
        console.log(`        not taught: ${m.missing.join(" · ")}`);
      }
    }
    console.log(`\n  >>> ${r.courseId}: ${r.taught}/${r.total} named ideas taught — ${r.percent}%\n`);
  }

  const total = results.reduce((sum, r) => sum + r.total, 0);
  const taught = results.reduce((sum, r) => sum + r.taught, 0);
  console.log("=".repeat(78));
  console.log("subject    lessons    ideas    taught    missing    coverage");
  for (const r of results) {
    console.log(
      r.courseId.padEnd(11),
      String(r.lessonCount).padStart(7),
      String(r.total).padStart(8),
      String(r.taught).padStart(9),
      String(r.missing).padStart(10),
      (r.percent + "%").padStart(12)
    );
  }
  console.log(
    "\n" + "ALL".padEnd(11),
    String(Object.keys(lessons).length).padStart(7),
    String(total).padStart(8),
    String(taught).padStart(9),
    String(total - taught).padStart(10),
    (Math.round((taught / total) * 100) + "%").padStart(12)
  );
  if (!has("--missing")) console.log("\nRun with --missing to list every untaught term.");
}

/* ------------------------------------------------------------------ *
 * Gate
 * ------------------------------------------------------------------ */

if (has("--gate")) {
  if (!fs.existsSync(FLOORS_PATH)) {
    console.error(`\n--gate needs ${path.relative(ROOT, FLOORS_PATH)}, which does not exist.`);
    process.exit(2);
  }
  const floors = JSON.parse(fs.readFileSync(FLOORS_PATH, "utf8"));
  const failures = [];
  for (const r of results) {
    const floor = floors.floors[r.courseId];
    if (floor === undefined) {
      failures.push(`${r.courseId}: no floor recorded — add one to coverage-floors.json`);
      continue;
    }
    if (r.percent < floor) failures.push(`${r.courseId}: ${r.percent}% is below its floor of ${floor}%`);
  }

  console.log("\n" + "-".repeat(78));
  if (failures.length) {
    console.log("SYLLABUS COVERAGE GATE: FAIL");
    failures.forEach((line) => console.log("  " + line));
    console.log("\nCoverage ratchets upward. If a term now reads as untaught because the lesson");
    console.log("uses a different name for it, add an alias in data/syllabus/. Do not lower a floor.");
    process.exit(1);
  }
  console.log("SYLLABUS COVERAGE GATE: PASS");
  for (const r of results) console.log(`  ${r.courseId.padEnd(6)} ${String(r.percent).padStart(3)}% (floor ${floors.floors[r.courseId]}%)`);
}
