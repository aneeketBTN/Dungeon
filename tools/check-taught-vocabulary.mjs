/*
 * Does a lesson TEACH the thing its questions ASK about?
 *
 * WHY THIS EXISTS — AND WHY LAW-47 IS NOT ENOUGH
 * LAW-47 ("teach before test") is enforced by walking a delivered queue and checking
 * that a lesson for each cited lecture arrives before the question citing it. It
 * checks the CITATION. It has never checked the CONTENT. So a question can cite
 * SPMS-M07-L02, a lesson can exist at SPMS-M07-L02, the gate goes green, and the
 * lesson can be about something else entirely.
 *
 * Measured 2026-08-17, the hole that opens:
 *   RICE                       0 lessons teach it, 20 questions test it
 *   Requirements traceability  0 lessons teach it, 23 questions test it
 *   Vanity metrics             0 lessons teach it, 13 questions test it
 *
 * The SPMS concept is literally called "MoSCoW and RICE prioritisation" and its
 * lesson is called "Prioritisation: MoSCoW". The course does teach RICE — it is in
 * the module 7 revision sheet, with a formula and a B2B/B2C distinction — so this is
 * not an off-syllabus question. It is an on-syllabus question with no teaching behind
 * it, which is the exact failure the product exists to prevent: "if Examiner feels
 * foreign, that is Learn's failure".
 *
 * This is the second recurrence of a gate that structurally cannot see the defect it
 * is named for. The first was T1's `smoke_signal`, whose answer used a term defined in
 * a lecture the item does not cite. Logged accordingly.
 *
 * WHAT IT MEASURES
 * Two high-precision signals per scored question, and deliberately nothing else:
 *   1. ACRONYMS in its stem, caselet, options, answer or link (RICE, EOQ, AARRR, NRR).
 *      Unambiguous, and exactly the shape this course examines.
 *   2. SYLLABUS TERMS from data/syllabus/*.terms.json that the question actually uses.
 *      Cross-referencing the two artifacts makes each finding precise and actionable:
 *      this idea is on the syllabus, this question tests it, no lesson teaches it.
 *
 * A first version also checked each question's concept label (`node`) and was useless:
 * BRGSA's labels are composite display strings — "Cohorts and retention → CAC and
 * LTV" — that no lesson can contain verbatim, so it reported 55 terms over 169
 * questions on a subject with 90% syllabus coverage. Precision matters more than
 * reach in a gate, because a gate nobody believes gets switched off.
 *
 * Matching is whole-word and phrase-contiguous, for the reasons recorded in
 * tools/measure-syllabus-coverage.mjs — substring matching puts RICE inside "price".
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * It does not check ordering; that is LAW-47's job and it already works. It checks
 * existence only: somewhere in this subject, is the idea taught at all?
 *
 * ALLOWLIST
 * Genuine synonyms live in data/syllabus/taught-vocabulary-allowlist.json, each with a
 * reason. A lesson teaching GDPR's "data protection by design" satisfies "privacy by
 * design". An allowlist entry is a claim that two names are the same idea — it is not
 * a way to silence a gap, and every entry has to say why.
 *
 * USAGE
 *   node tools/check-taught-vocabulary.mjs                report
 *   node tools/check-taught-vocabulary.mjs --gate         exit non-zero on any violation
 *   node tools/check-taught-vocabulary.mjs --course SPMS  one subject
 *   node tools/check-taught-vocabulary.mjs --json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWLIST_PATH = path.join(ROOT, "data", "syllabus", "taught-vocabulary-allowlist.json");

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? null : argv[i + 1];
};

function loadBank() {
  const win = {};
  for (const file of ["t6_lessons.js", "t6_brgsa.js", "t6_catalog.js", "t6_challenges.js", "t6_integrated.js"]) {
    const full = path.join(ROOT, "app", "sets", file);
    if (!fs.existsSync(full)) continue;
    // eslint-disable-next-line no-new-func
    new Function("window", fs.readFileSync(full, "utf8"))(win);
  }
  if (!win.T6_LESSONS || !win.T6_COURSES) throw new Error("bank did not load");
  return { lessons: win.T6_LESSONS, courses: win.T6_COURSES };
}

const normalise = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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

const wordCache = new Map();
function wordsOf(corpus) {
  let set = wordCache.get(corpus);
  if (!set) {
    set = new Set(corpus.split(" "));
    wordCache.set(corpus, set);
  }
  return set;
}

function corpusHasPhrase(corpus, name) {
  const phrase = normalise(name);
  if (!phrase) return true;
  const parts = phrase.split(" ");
  const words = wordsOf(corpus);
  if (parts.length === 1) {
    const token = parts[0];
    return words.has(token) || words.has(token + "s") || (token.endsWith("s") && words.has(token.slice(0, -1)));
  }
  const padded = " " + corpus + " ";
  const head = parts.slice(0, -1).join(" ");
  const last = parts[parts.length - 1];
  const variants = new Set([last, last + "s"]);
  if (last.endsWith("s")) variants.add(last.slice(0, -1));
  return [...variants].some((tail) => padded.includes(" " + head + " " + tail + " "));
}

/* Acronyms are the sharpest signal available: they are unambiguous, they are what
 * this course examines, and they are exactly what substring matching hides. Two to
 * six capitals, not at the start of a sentence by accident. */
const ACRONYM = /\b([A-Z]{2,6})\b/g;

/* Capitals that are ordinary words or house furniture rather than course terms. */
const NOT_A_TERM = new Set(["A", "I", "IT", "IS", "OR", "AND", "THE", "TO", "IN", "OF", "ON", "BY",
  "AN", "AS", "AT", "BE", "DO", "GO", "IF", "NO", "SO", "UP", "US", "WE", "ALL", "ANY", "ARE",
  "BUT", "CAN", "FOR", "HAS", "NOT", "ONE", "OUT", "TWO", "WHO", "WHY", "YOU", "NEW", "NOW",
  "NAME", "TRUE", "FALSE", "OK", "Q", "A1", "B2B", "B2C", "AI", "UI", "UX", "PM", "CEO", "CTO", "HR"]);

function acronymsIn(text) {
  const found = new Set();
  for (const match of String(text || "").matchAll(ACRONYM)) {
    const token = match[1];
    if (!NOT_A_TERM.has(token)) found.add(token);
  }
  return found;
}

/* Everything a learner must understand to answer this question. */
function questionText(question) {
  return [
    question.stem,
    question.caselet,
    (question.options || []).join(" "),
    question.explanation,
    question.link,
    question.template,
    (question.choices || []).join(" "),
    (question.steps || []).map((s) => (typeof s === "string" ? s : JSON.stringify(s))).join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

function loadAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return { entries: [] };
  return JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
}

const { lessons, courses } = loadBank();
const allowlist = loadAllowlist();
const allowed = new Map();
for (const entry of allowlist.entries || []) {
  const key = `${entry.courseId || "*"}:${normalise(entry.term)}`;
  allowed.set(key, entry);
}

function isAllowed(courseId, term, corpus) {
  const entry = allowed.get(`${courseId}:${normalise(term)}`) || allowed.get(`*:${normalise(term)}`);
  if (!entry) return false;
  // An allowlist entry only holds if the idea really is taught under the other name.
  return (entry.taughtAs || []).some((alias) => corpusHasPhrase(corpus, alias));
}

/* The curated per-module term lists A1 produced, flattened per subject. */
function syllabusTermsFor(courseId) {
  const file = path.join(ROOT, "data", "syllabus", `${courseId}.terms.json`);
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const out = [];
  for (const terms of Object.values(data.modules || {})) {
    for (const raw of terms) {
      const entry = typeof raw === "string" ? { term: raw } : raw;
      out.push({ term: entry.term, names: [entry.term, ...(entry.aliases || [])] });
    }
  }
  return out;
}

const only = valueOf("--course");
const courseIds = Object.keys(courses)
  .filter((id) => !only || id.toUpperCase() === only.toUpperCase())
  .sort();

const report = [];
for (const courseId of courseIds) {
  const course = courses[courseId];
  const corpus = corpusFor(lessons, courseId);
  const violations = new Map();

  // Syllabus terms this subject's lessons never teach. Only these can be violated,
  // so the untaught-term set is computed once rather than per question.
  const untaughtSyllabusTerms = syllabusTermsFor(courseId).filter(
    (entry) => !entry.names.some((name) => corpusHasPhrase(corpus, name))
  );

  for (const question of Object.values(course.questions || {})) {
    // A primer withholds its rule by design — it is the one surface allowed to
    // precede teaching, so it cannot be a teach-before-test violation.
    if (question.primerOnly) continue;

    const text = questionText(question);
    const questionCorpus = normalise(text);
    const terms = new Set();

    for (const acronym of acronymsIn(text)) terms.add(acronym);
    // A syllabus term counts against a question only if the question actually uses it.
    for (const entry of untaughtSyllabusTerms) {
      if (entry.names.some((name) => corpusHasPhrase(questionCorpus, name))) terms.add(entry.term);
    }

    for (const term of terms) {
      if (corpusHasPhrase(corpus, term)) continue;
      if (isAllowed(courseId, term, corpus)) continue;
      if (!violations.has(term)) violations.set(term, { term, questions: [], concepts: new Set() });
      const record = violations.get(term);
      record.questions.push(question.id);
      if (question.conceptId) record.concepts.add(question.conceptId);
    }
  }

  const rows = [...violations.values()]
    .map((v) => ({ term: v.term, questionCount: v.questions.length, concepts: [...v.concepts], examples: v.questions.slice(0, 4) }))
    .sort((a, b) => b.questionCount - a.questionCount);

  report.push({
    courseId,
    questionsChecked: Object.values(course.questions || {}).filter((q) => !q.primerOnly).length,
    untaughtTerms: rows.length,
    affectedQuestions: rows.reduce((sum, r) => sum + r.questionCount, 0),
    rows,
  });
}

if (has("--json")) {
  console.log(JSON.stringify({ generated: "check-taught-vocabulary", report }, null, 2));
} else {
  console.log("Taught vocabulary — is every idea a question tests taught somewhere in that subject?\n");
  for (const entry of report) {
    console.log("=".repeat(78));
    console.log(`${entry.courseId} — ${entry.questionsChecked} scored questions checked`);
    console.log("=".repeat(78));
    if (!entry.rows.length) {
      console.log("  no untaught vocabulary\n");
      continue;
    }
    console.log(`  ${entry.untaughtTerms} terms tested but never taught, across ${entry.affectedQuestions} questions\n`);
    console.log("  term                              questions  example ids");
    for (const row of entry.rows) {
      console.log(
        "  " + row.term.slice(0, 32).padEnd(33),
        String(row.questionCount).padStart(6),
        "    " + row.examples.slice(0, 3).join(", ")
      );
    }
    console.log("");
  }
  const totalTerms = report.reduce((sum, r) => sum + r.untaughtTerms, 0);
  const totalQuestions = report.reduce((sum, r) => sum + r.affectedQuestions, 0);
  console.log("=".repeat(78));
  console.log(`TOTAL: ${totalTerms} untaught terms across ${totalQuestions} questions`);
}

/* ------------------------------------------------------------------ *
 * Gate — a ratchet, not a cliff
 *
 * There are 18 untaught terms today over 120 questions. Failing outright would mean a
 * gate that is red from the day it is written, and a permanently red gate teaches
 * everyone to ignore it — which is how the standing IBM option-length warning went
 * un-actioned for weeks. So the known backlog is recorded in
 * taught-vocabulary-baseline.json and the gate fails on anything NEW, plus on any
 * baseline entry that has been fixed and not removed. The backlog can only shrink.
 * ------------------------------------------------------------------ */

if (has("--gate")) {
  const BASELINE_PATH = path.join(ROOT, "data", "syllabus", "taught-vocabulary-baseline.json");
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`\n--gate needs ${path.relative(ROOT, BASELINE_PATH)}, which does not exist.`);
    process.exit(2);
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  const known = new Set();
  for (const [courseId, terms] of Object.entries(baseline.accepted || {})) {
    for (const term of terms) known.add(`${courseId}:${normalise(term)}`);
  }

  const added = [];
  const current = new Set();
  for (const entry of report) {
    for (const row of entry.rows) {
      const key = `${entry.courseId}:${normalise(row.term)}`;
      current.add(key);
      if (!known.has(key)) added.push({ courseId: entry.courseId, term: row.term, questionCount: row.questionCount });
    }
  }
  // Only judge subjects this run actually measured, so --course does not look like a fix.
  const measured = new Set(report.map((entry) => entry.courseId));
  const fixed = [...known].filter((key) => measured.has(key.split(":")[0]) && !current.has(key));

  console.log("\n" + "-".repeat(78));
  if (added.length) {
    console.log("TAUGHT VOCABULARY GATE: FAIL — new untaught vocabulary");
    for (const row of added) {
      console.log(`  ${row.courseId}: "${row.term}" is tested by ${row.questionCount} question${row.questionCount === 1 ? "" : "s"} and taught by no lesson`);
    }
    console.log("\nEither teach the idea in the lesson that owns it, or — if it is genuinely the same");
    console.log("idea under another name — add it to data/syllabus/taught-vocabulary-allowlist.json");
    console.log("with a reason and the name the lesson actually uses. Adding it to the baseline is");
    console.log("only correct when it is a pre-existing gap being recorded, not a new one being hidden.");
    process.exit(1);
  }
  if (fixed.length) {
    console.log("TAUGHT VOCABULARY GATE: FAIL — the baseline is stale");
    console.log("  These are now taught and must be removed from taught-vocabulary-baseline.json:");
    for (const key of fixed) console.log(`      ${key.replace(":", " — ")}`);
    console.log("\n  A backlog that keeps entries it has already cleared stops measuring anything.");
    process.exit(1);
  }
  console.log("TAUGHT VOCABULARY GATE: PASS — no new untaught vocabulary");
  const backlog = report.reduce((sum, entry) => sum + entry.untaughtTerms, 0);
  const questions = report.reduce((sum, entry) => sum + entry.affectedQuestions, 0);
  console.log(`  accepted backlog: ${backlog} terms over ${questions} questions (see taught-vocabulary-baseline.json)`);
  for (const entry of report) {
    console.log(`  ${entry.courseId.padEnd(6)} ${String(entry.questionsChecked).padStart(3)} questions, ${entry.untaughtTerms} untaught term${entry.untaughtTerms === 1 ? "" : "s"}`);
  }
}
