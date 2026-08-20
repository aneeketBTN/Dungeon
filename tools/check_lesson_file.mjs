/*
 * Authoring-time check for app/sets/t6_lessons.js — the fast gate an author runs
 * between batches, before the full bank validator.
 *
 * WHY THIS EXISTS SEPARATELY FROM validate_t6_bank.js
 * The bank validator loads the lesson file in a VM. If the file does not parse,
 * it reports one SyntaxError naming one line and nothing else — no vocabulary
 * gate, no coverage, no shape report. During the BRGSA authoring pass a single
 * batch carried six identical bracket defects, and the parse-fix-reparse loop
 * surfaced them one at a time (LAW-50). The failure mode of a broken lesson file
 * is silence, not a warning.
 *
 * So this tool scans the TEXT first and reports every structural defect in one
 * pass, then parses, then checks record shape. It needs no pack and no network,
 * so there is no reason not to run it after every batch.
 *
 * Usage:
 *   node tools/check_lesson_file.mjs                      # structure + shape
 *   node tools/check_lesson_file.mjs "<T6 pack>" IBM      # + what to author next
 *
 * Exit code is 1 on any error, so it can gate a commit.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const lessonPath = join(root, "app", "sets", "t6_lessons.js");
const packPath = process.argv[2];
const subjectFilter = process.argv[3];

const errors = [];
const warnings = [];
const notes = [];

const source = readFileSync(lessonPath, "utf8");
const lines = source.split(/\r?\n/);

/* ---------------------------------------------------------------- *
 * 1. Bracket integrity, every occurrence (LAW-50)
 *
 * A lesson record mixes arrays (explainer, glossary) with objects (worked) at
 * the same indent, so the closing bracket is the only thing distinguishing
 * them and the eye supplies the wrong one. Scan for the whole class.
 * ---------------------------------------------------------------- */
let openArray = null;
lines.forEach((line, index) => {
  const lineNo = index + 1;
  const opens = /^ {4}(explainer|glossary):\s*\[\s*$/.exec(line);
  if (opens) {
    if (openArray) errors.push(`line ${openArray.line}: ${openArray.key} array never closed before ${opens[1]} opened at line ${lineNo}`);
    openArray = { key: opens[1], line: lineNo };
    return;
  }
  if (!openArray) return;
  if (/^ {4}\],\s*$/.test(line)) { openArray = null; return; }
  if (/^ {4}\},\s*$/.test(line)) {
    errors.push(`line ${lineNo}: '${openArray.key}' opened at line ${openArray.line} is an array but closes with '},' — should be '],'`);
    openArray = null;
  }
});
if (openArray) errors.push(`line ${openArray.line}: '${openArray.key}' array is never closed`);

/* ---------------------------------------------------------------- *
 * 2. Parse
 * ---------------------------------------------------------------- */
let lessons = null;
const context = { window: {} };
vm.createContext(context);
try {
  vm.runInContext(source, context, { filename: "t6_lessons.js" });
  lessons = context.window.T6_LESSONS;
  if (!lessons) errors.push("file parsed but window.T6_LESSONS was never assigned");
} catch (error) {
  errors.push(`parse failed: ${error.message}`);
  if (errors.length) report();
}

/* ---------------------------------------------------------------- *
 * 3. Record shape
 *
 * The contract in the lesson file's own header: objective, explainer of roughly
 * 150-220 words, one worked example run end to end, a glossary that defines
 * every term the lecture introduces, and a handoff line.
 * ---------------------------------------------------------------- */
const REQUIRED = ["lectureId", "courseId", "module", "order", "title", "objective", "explainer", "worked", "glossary", "connects"];

/*
 * An add-in teaches a lecture inside a neighbouring lecture's lesson (owner decision
 * 2026-08-19). Its contract is deliberately lighter: the worked example and the
 * handoff belong to the host lesson, which is the unit a learner reads end to end.
 * Everything that makes the teaching checkable — its own objective, its own prose,
 * its own glossary — is still required, so the match gate can still score it against
 * its own lecture and the vocabulary gate still polices its terms.
 */
const REQUIRED_ADD_IN = ["lectureId", "courseId", "module", "order", "title", "objective", "explainer", "glossary"];
const WORKED_KEYS = ["setup", "move", "because"];

const byCourse = {};

if (lessons) Object.keys(lessons).forEach((lectureId) => {
  const lesson = lessons[lectureId];
  const isAddIn = Boolean(lesson.addInOf);
  const where = `${isAddIn ? "add-in" : "lesson"} ${lectureId}`;

  (isAddIn ? REQUIRED_ADD_IN : REQUIRED).forEach((key) => {
    const value = lesson[key];
    const empty = value === undefined || value === null || value === "" ||
      (Array.isArray(value) && !value.length);
    if (empty) errors.push(`${where}: missing or empty "${key}"`);
  });

  if (lesson.lectureId !== lectureId) errors.push(`${where}: keyed as ${lectureId} but lectureId says ${lesson.lectureId}`);
  if (lesson.courseId && !lectureId.startsWith(lesson.courseId)) errors.push(`${where}: courseId ${lesson.courseId} does not match the lecture id`);
  if (isAddIn && !lessons[lesson.addInOf]) errors.push(`${where}: names host ${lesson.addInOf}, which has no lesson`);

  if (Array.isArray(lesson.explainer)) {
    const words = lesson.explainer.join(" ").split(/\s+/).filter(Boolean).length;
    if (isAddIn) {
      // An add-in is short by design; the bands below would flag every one of them.
      // It still has to teach something — a two-line note is a mention, not teaching.
      if (words < 60) warnings.push(`${where}: add-in explainer is ${words} words, under the ~80 that teaches anything — either write it properly or fold the idea into the host's prose`);
      if (words > 190) warnings.push(`${where}: add-in explainer is ${words} words; at that length it warrants its own lesson rather than a fold-in`);
    } else {
      if (lesson.explainer.length < 2) warnings.push(`${where}: explainer is ${lesson.explainer.length} paragraph(s); the contract is a short path through the idea, usually 3`);
      if (words < 120) warnings.push(`${where}: explainer is ${words} words, below the ~150 the contract expects — likely under-taught`);
      if (words > 320) warnings.push(`${where}: explainer is ${words} words, well above the ~220 the contract expects — likely a lecture summary rather than a lesson`);
    }
  }

  if (lesson.worked && typeof lesson.worked === "object") {
    WORKED_KEYS.forEach((key) => {
      if (!lesson.worked[key]) errors.push(`${where}: worked example is missing "${key}"`);
    });
  }

  if (Array.isArray(lesson.glossary)) {
    const minTerms = isAddIn ? 1 : 2;
    if (lesson.glossary.length < minTerms) errors.push(`${where}: glossary has ${lesson.glossary.length} term(s); at least ${minTerms} ${minTerms === 1 ? "is" : "are"} required`);
    const seen = new Set();
    lesson.glossary.forEach((entry, i) => {
      if (!entry || !entry.term || !entry.plain) { errors.push(`${where}: glossary[${i}] needs both "term" and "plain"`); return; }
      const key = String(entry.term).toLowerCase();
      if (seen.has(key)) warnings.push(`${where}: glossary defines "${entry.term}" twice`);
      seen.add(key);
      if (String(entry.plain).split(/\s+/).length > 40) warnings.push(`${where}: gloss for "${entry.term}" is long enough to be an explainer paragraph`);
    });
  }

  const course = lesson.courseId || "?";
  byCourse[course] = byCourse[course] || [];
  byCourse[course].push(lesson);
});

/* ---------------------------------------------------------------- *
 * 4. Progress, and the next unit of work
 *
 * A handoff is only real if the next agent can see where the edge is without
 * reading the whole file. With the pack present this prints exactly which
 * lectures remain, in course order, so authoring can resume mid-subject.
 *
 * Sets 1–8 now own the complete lesson sequence for their module. Citations still
 * enforce teach-before-test on focused and repair runs, but they no longer decide
 * whether authored teaching is reachable on the main course path. This gate checks
 * both claims: every cited lecture has teaching, and every registered lesson belongs
 * to a module run that schedules it.
 * ---------------------------------------------------------------- */

/* Which lectures does the scored bank actually cite? Load the shipped banks the
 * same way the app does. Failure here is non-fatal — the report degrades to
 * "unknown" rather than lying about which work matters. */
const citedByCourse = {};
const scheduledByCourse = {};
try {
  const bankContext = { window: {} };
  vm.createContext(bankContext);
  for (const file of ["t6_lessons", "t6_diagnoses", "t6_brgsa", "t6_catalog", "t6_integrated", "t6_challenges"]) {
    const p = join(root, "app", "sets", `${file}.js`);
    if (existsSync(p)) {
      try { vm.runInContext(readFileSync(p, "utf8"), bankContext); } catch { /* partial bank is fine */ }
    }
  }
  const courses = bankContext.window.T6_COURSES || {};
  Object.keys(courses).forEach((courseId) => {
    const bank = courses[courseId].questions || courses[courseId].bank || {};
    const cited = new Set();
    Object.values(bank).forEach((question) => {
      const ids = (question.sourceIds && question.sourceIds.length) ? question.sourceIds : [question.source];
      ids.filter(Boolean).forEach((id) => cited.add(id));
    });
    citedByCourse[courseId] = cited;
    const modules = new Set((courses[courseId].runs || [])
      .filter((run) => run.module >= 1 && run.module <= 8)
      .map((run) => run.module));
    scheduledByCourse[courseId] = new Set(Object.keys(lessons || {}).filter((lectureId) => {
      const lesson = lessons[lectureId];
      return lesson.courseId === courseId && modules.has(lesson.module);
    }));
  });
} catch (error) {
  warnings.push(`could not read the question banks and module schedules: ${error.message}`);
}

// Authored but never scheduled — a release-blocking teaching coverage defect.
if (lessons && Object.keys(scheduledByCourse).length) {
  const unscheduled = Object.keys(lessons).filter((lectureId) => {
    const scheduled = scheduledByCourse[lessons[lectureId].courseId];
    return !scheduled || !scheduled.has(lectureId);
  });
  if (unscheduled.length) {
    errors.push(`${unscheduled.length} authored lesson(s) are not scheduled by a module run: ${unscheduled.sort().join(", ")}`);
  }
  Object.keys(scheduledByCourse).sort().forEach((courseId) => {
    const registered = Object.keys(lessons).filter((lectureId) => lessons[lectureId].courseId === courseId).length;
    notes.push(`${courseId}: ${scheduledByCourse[courseId].size}/${registered} registered lectures scheduled by sets 1–8`);
  });
}

Object.keys(byCourse).sort().forEach((course) => {
  const authored = byCourse[course];
  const modules = [...new Set(authored.map((l) => l.module))].sort((a, b) => a - b);
  notes.push(`${course}: ${authored.length} lessons authored, modules ${modules.join(", ")}`);
});

if (packPath) {
  if (!existsSync(packPath)) {
    warnings.push(`lecture source given but ${packPath} does not exist; skipping the work-queue report`);
  } else {
    // Clean transcripts are the authority; the old pack layout is still readable.
    const manifest = require("./lib/clean_transcripts.js").loadLectures(packPath).lectures;
    const subjects = subjectFilter ? [subjectFilter] : [...new Set(manifest.map((e) => e.subject))].sort();
    subjects.forEach((subject) => {
      const all = manifest
        .filter((entry) => entry.subject === subject)
        .sort((a, b) => a.module - b.module || a.order - b.order);
      const remaining = all.filter((entry) => !lessons || !lessons[entry.lecture_id]);
      const cited = citedByCourse[subject];
      const citedRemaining = cited ? remaining.filter((entry) => cited.has(entry.lecture_id)) : [];

      if (!remaining.length) {
        notes.push(`${subject}: COMPLETE — all ${all.length} lectures have lessons`);
        return;
      }

      if (cited && !citedRemaining.length) {
        // Owner decision 2026-08-19: uncited lectures are NOT optional — if it is in the
        // course, it gets taught. This string used to say "optional", which is how a tool
        // ends up telling every author their work is dead (the same defect LAW-72 records
        // for the header of this file). Author them; they become schedulable as the concept
        // spine widens. Never retag a question to fake it — that breaks LAW-47 silently.
        notes.push(`${subject}: every CITED lecture is authored (${cited.size} of ${cited.size}) — scored coverage is complete. ${remaining.length} uncited lectures remain and are still to be authored (owner decision 2026-08-19: not optional); until the concept spine widens their lessons are readable in the lesson index but not scheduled into a run.`);
        return;
      }

      notes.push(`${subject}: ${all.length - remaining.length}/${all.length} lectures authored` +
        (cited ? ` — ${cited.size - citedRemaining.length}/${cited.size} of the CITED lectures, which are the ones a run schedules` : ""));

      if (citedRemaining.length) {
        notes.push(`  author these next (cited by scored questions, ${citedRemaining.length} left):`);
        citedRemaining.slice(0, 20).forEach((entry) => notes.push(`    ${entry.lecture_id}  ${entry.title || ""}`));
      }
    });
  }
} else {
  notes.push("(pass the T6 pack path to see which lectures remain and what to author next)");
}

report();

function report() {
  const out = { ok: !errors.length, errors, warnings, notes };
  console.log(JSON.stringify(out, null, 2));
  process.exit(errors.length ? 1 : 0);
}
