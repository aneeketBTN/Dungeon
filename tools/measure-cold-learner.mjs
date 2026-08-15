#!/usr/bin/env node
/*
 * T1 — "Does it teach?" · the cold-learner test.
 *
 * THE QUESTION
 * A learner arrives knowing nothing. For every scored item in a delivered run, could
 * they have understood the correct answer from what the run had already said? Not
 * "could they have guessed it" — that is T3's craft ceiling — but "is the answer
 * written in vocabulary this run has introduced".
 *
 * WHY THIS IS NOT A GENERAL WORD CHECK
 * The first draft of this compared every non-stopword in the correct answer against
 * everything said earlier, and drowned two real findings in a few hundred reports of
 * "sustainable", "predictable" and "meaningful". Ordinary English is not what a
 * learner lacks on day one. What they lack is the course's own vocabulary, and this
 * repository already has a definition of that which is not my opinion: LAW-49 says
 * course vocabulary is decided by the transcripts and surfaces as lesson glossary
 * terms. So the unit here is a GLOSSARY TERM or a CONCEPT NAME — the words the course
 * itself stopped to define — and the test is whether the run defined it before
 * resting a scored answer on it.
 *
 * WHAT COUNTS AS "SAID"
 * Everything visible strictly earlier in the same run: a lesson's objective,
 * explainer, worked example and glossary; a primer's caselet and its revealed rule;
 * an earlier question's caselet, stem and options. Plus the current item's own
 * caselet and stem, because those are on screen while the learner answers and a
 * caselet exists precisely to supply its own context. Nothing else — not the subject's
 * other lessons, and not a later step.
 *
 * INPUT
 * Real delivered runs, never a re-implementation of the queue. `layeredQueue` and
 * `selectQuestionsFromPool` live in a DOM-bound IIFE and a second copy would drift,
 * so the order comes from tools/browser-checks/export-run.js and the prose from
 * tools/export-learn-run.mjs. This reads that pair.
 *
 * It refuses rather than guesses: a run whose key does not resolve to option text is
 * a fatal error naming the step, not a skipped item.
 *
 *   node tools/measure-cold-learner.mjs [harnessDir] [--gate]
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(here, "..", "app");
const args = process.argv.slice(2);
const gate = args.indexOf("--gate") >= 0;
const dir = args.filter((a) => !a.startsWith("--"))[0] ||
  path.join(here, "..", "evidence", "2026-08-15", "persona-harness");

/* t6_integrated.js before t6_challenges.js — it was missing from four load lists at
   once and shipped unvalidated for weeks. */
const context = { window: {}, atob: (v) => Buffer.from(v, "base64").toString("binary") };
vm.createContext(context);
for (const rel of ["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_challenges.js"]) {
  const file = path.join(appRoot, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}
const COURSES = context.window.T6_COURSES;
const LESSONS = context.window.T6_LESSONS || {};

/* ---- the course's own vocabulary, per subject ---------------------------- */

function courseVocabulary(courseId) {
  const terms = new Map();
  const add = (term, source) => {
    const value = String(term || "").trim().toLowerCase();
    if (value.length < 4) return;             /* "TAM" style acronyms are handled below */
    if (!terms.has(value)) terms.set(value, source);
  };
  for (const lesson of Object.values(LESSONS)) {
    if (lesson.courseId !== courseId) continue;
    for (const entry of lesson.glossary || []) add(entry.term, lesson.lectureId);
  }
  for (const concept of COURSES[courseId].concepts) add(concept.name, concept.source);
  return terms;
}

/* Match a term the way a reader would: whole words, case-insensitively, tolerating a
   trailing plural. The gate's own quirk is documented in the authoring protocol — a
   singular term cannot match a plural-only occurrence — so this fixes that here
   rather than reporting a false accusation. */
function mentions(haystack, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}(?:s|es)?\\b`, "i").test(haystack);
}

/* ---- reading a delivered run --------------------------------------------- */

function visibleText(step) {
  const parts = [];
  const push = (value) => {
    if (!value) return;
    if (Array.isArray(value)) return value.forEach(push);
    if (typeof value === "object") return Object.values(value).forEach(push);
    parts.push(String(value));
  };
  if (step.kind === "lesson") {
    push([step.title, step.objective, step.explainer, step.worked, step.handoff]);
    for (const entry of step.glossary || []) push([entry.term, entry.plain]);
  } else if (step.kind === "primer") {
    push([step.concept, step.carryForward, step.whatHappens, step.knownTrap, step.stem]);
  } else {
    push([step.concept, step.caselet, step.stem, step.prompt]);
    push((step.options || []));
    for (const blank of step.blanks || []) push([blank.label, blank.options]);
    push(step.choices || []);
    for (const row of step.rows || []) push(row.label || row);
    for (const inner of step.steps || []) push([inner.stem, inner.prompt, inner.options]);
  }
  return parts.join(" ¶ ");
}

/* The revealed rule is what a primer teaches, and it arrives only after the learner
   has predicted — so it is legitimately "said" for everything after it. It lives on
   the key side, because printing it beside the prediction would hand over the answer. */
function primerRevealed(keyStep) {
  const revealed = keyStep && keyStep.revealedAfterPredicting;
  if (!revealed) return "";
  return [revealed.rule, revealed.useItLikeThis, revealed.doNotConfuseItWith, revealed.connectionToKeep]
    .filter(Boolean).join(" ¶ ");
}

/* Resolve the correct answer's TEXT from the candidate view plus the key's indices.
   Refuses on a mismatch: an unresolvable answer silently skipped is how a probe
   reports a clean run over items it never looked at. */
function correctAnswerText(step, keyStep, label) {
  const at = (options, index) => {
    if (!Array.isArray(options) || typeof index !== "number" || !options[index]) {
      throw new Error(`${label}: cannot resolve the correct option (index ${index} of ${Array.isArray(options) ? options.length : "none"})`);
    }
    return String(options[index]);
  };
  const type = keyStep.type || step.type;
  if (type === "mcq") return [at(step.options, keyStep.answer)];
  if (type === "msq") return (keyStep.answers || []).map((index) => at(step.options, index));
  if (type === "cloze" || type === "case-cloze") {
    return (keyStep.blanks || []).map((index, position) => at((step.blanks || [])[position] || {}, index, position)
      || at(((step.blanks || [])[position] || {}).options, index));
  }
  if (type === "match") return (keyStep.rows || []).map((index) => at(step.choices, index));
  if (type === "boss") return (keyStep.steps || []).map((index, position) => at(((step.steps || [])[position] || {}).options, index));
  if (type === "numeric") return [String(keyStep.answer === undefined ? "" : keyStep.answer)];
  if (type === "short-answer") return [String(keyStep.exemplar || "")];
  throw new Error(`${label}: unsupported scored type ${type}`);
}

/* cloze blanks need the options array, not the blank object — keep the resolver above
   honest by normalising here rather than by a clever fallback inside it. */
function clozeAnswers(step, keyStep, label) {
  return (keyStep.blanks || []).map((index, position) => {
    const blank = (step.blanks || [])[position];
    if (!blank || !Array.isArray(blank.options) || !blank.options[index]) {
      throw new Error(`${label}: blank ${position + 1} does not resolve to an option`);
    }
    return String(blank.options[index]);
  });
}

function scoredAnswers(step, keyStep, label) {
  const type = keyStep.type || step.type;
  if (type === "cloze" || type === "case-cloze") return clozeAnswers(step, keyStep, label);
  return correctAnswerText(step, keyStep, label);
}

/* ---- the measurement ------------------------------------------------------ */

const runs = fs.readdirSync(dir).filter((name) => name.endsWith(".learn.json"));
if (!runs.length) {
  console.error(`No delivered runs in ${dir}. Capture them with tools/browser-checks/export-run.js, then tools/export-learn-run.mjs.`);
  process.exit(1);
}

const report = { runsRead: [], perItem: [], summary: {} };

for (const name of runs.sort()) {
  const candidate = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
  const keyPath = path.join(dir, name.replace(".learn.json", ".learn.key.json"));
  if (!fs.existsSync(keyPath)) throw new Error(`${name} has no key file; a run without one cannot be scored`);
  const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const courseId = candidate.subject;
  const vocabulary = courseVocabulary(courseId);
  const keyByStep = new Map((key.key || []).map((entry) => [entry.step, entry]));

  let said = "";
  const items = [];
  for (const step of candidate.run || []) {
    const keyStep = keyByStep.get(step.step);
    const label = `${courseId} set ${candidate.set} step ${step.step} (${step.id || step.lectureId})`;

    if (step.kind === "question" && keyStep) {
      /* The item's own caselet and stem are on screen while it is answered. */
      const available = `${said} ¶ ${step.caselet || ""} ¶ ${step.stem || ""}`;
      const answers = scoredAnswers(step, keyStep, label);
      const undefinedTerms = [];
      for (const [term, source] of vocabulary) {
        if (!answers.some((answer) => mentions(answer, term))) continue;
        if (mentions(available, term)) continue;
        undefinedTerms.push({ term, definedIn: source });
      }
      items.push({
        subject: courseId, set: candidate.set, step: step.step, id: step.id, type: step.type,
        ok: undefinedTerms.length === 0,
        undefinedTerms
      });
    }

    said += ` ¶ ${visibleText(step)}`;
    if (step.kind === "primer") said += ` ¶ ${primerRevealed(keyStep)}`;
  }

  report.runsRead.push({ file: name, subject: courseId, set: candidate.set, steps: (candidate.run || []).length, scored: items.length });
  report.perItem.push(...items);
}

const failing = report.perItem.filter((item) => !item.ok);
report.summary = {
  scoredItems: report.perItem.length,
  itemsFullyTaught: report.perItem.length - failing.length,
  itemsRestingOnAnUndefinedTerm: failing.length,
  terms: [...new Set(failing.flatMap((item) => item.undefinedTerms.map((entry) => entry.term)))].sort()
};

console.log(JSON.stringify(report, null, 2));

if (gate) {
  if (failing.length) {
    console.error(`\nT1 FAILED — ${failing.length} of ${report.perItem.length} scored items rest on a course term the run had not introduced:`);
    for (const item of failing) {
      console.error(`  × ${item.subject} set ${item.set} step ${item.step} ${item.id}: ` +
        item.undefinedTerms.map((entry) => `"${entry.term}" (defined in ${entry.definedIn})`).join(", "));
    }
    process.exit(1);
  }
  console.error(`\nT1 passed: ${report.perItem.length} scored items, every course term in every correct answer introduced earlier in its own run.`);
}
