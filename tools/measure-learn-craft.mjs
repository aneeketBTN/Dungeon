/*
 * Can a persona pass a study set without reading it?
 *
 * `tools/run-persona-strategies.mjs` answers that for the MOCK, and is the standing
 * gate for F-06. It deliberately covers single-answer multiple choice only, because
 * that is the format the reported exploits were stated against and because keeping its
 * numbers comparable across bank changes is the whole point of it.
 *
 * A study set is a different animal. Set 1 of any subject is mostly cloze, match and
 * boss — formats the mock barely uses — and those are where a run's craft surface
 * actually lives. This measures the LEARN half, over every selectable option set in
 * the delivered run: each cloze blank, each match row, each boss step, and any mcq or
 * msq. It is a companion to that tool, not a replacement, and its numbers are not
 * comparable with it.
 *
 * The two rules that matter here, and why they are separate:
 *
 *   noAbsolutes   drop every option carrying only / all / every / never / always …
 *                 The bank-wide exploit (F-06).
 *   topicMatch    keep only options naming the concept under test. A study set is one
 *                 or two concepts deep, so "which of these four sentences is about the
 *                 thing this set is called" is available to a learner who has read the
 *                 set TITLE and nothing else. On the paper this rule is weak because
 *                 fifty questions span sixteen concepts; inside a run it is not.
 *
 * Ties resolve to the expected value of a random pick among survivors, so narrowing
 * four options to two scores 0.5 rather than 1 — what the rule actually achieves.
 * Every part of a multi-part item counts as one part, so a three-step boss is three
 * chances, which is how a learner meets it.
 *
 * USAGE  node tools/measure-learn-craft.mjs [harnessDir]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2] || path.join(here, "..", "evidence", "2026-08-15", "persona-harness");

const ABSOLUTES = /\b(only|all|every|always|never|entirely|automatically|simply|any|no other|nothing else)\b/i;
const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "for", "is", "are", "be",
  "on", "at", "it", "its", "as", "by", "that", "this", "with", "from", "not", "but", "than"]);

function contentWords(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/)
    .filter((word) => word.length > 3 && !STOP.has(word));
}

function expected(survivors, answer, marks) {
  if (!survivors.length) return 0;
  return survivors.includes(answer) ? marks / survivors.length : 0;
}

/* One selectable option set, with the index that is correct. A run is flattened to a
   list of these so every format is measured the same way. */
function partsOf(view, key) {
  const parts = [];
  const type = view.type;
  if (type === "mcq") parts.push({ label: "mcq", options: view.options, answer: key.answer });
  if (type === "msq") {
    /* Multi-select has no single answer, so an elimination rule cannot be scored the
       same way. Report it, do not fold it into the number. */
    return [];
  }
  if (type === "cloze" || type === "case-cloze") {
    (view.blanks || []).forEach((blank, i) => parts.push({ label: blank.label, options: blank.options, answer: key.blanks[i] }));
  }
  if (type === "boss") {
    (view.steps || []).forEach((step, i) => parts.push({ label: step.label, options: step.options, answer: key.steps[i] }));
  }
  if (type === "match") {
    (view.rows || []).forEach((row, i) => parts.push({ label: row, options: view.choices, answer: key.rows[i] }));
  }
  return parts.filter((part) => Array.isArray(part.options) && part.options.length > 1 && typeof part.answer === "number");
}

const STRATEGIES = {
  noAbsolutes: (part) => {
    const keep = part.options.map((_, i) => i).filter((i) => !ABSOLUTES.test(part.options[i]));
    return keep.length ? keep : part.options.map((_, i) => i);
  },
  /* "Which of these is about the thing this set is called." The concept name comes
     from the item, not from the option, so this is a rule a learner can apply having
     read only the set's own heading. */
  topicMatch: (part, concept) => {
    const words = contentWords(concept);
    if (!words.length) return part.options.map((_, i) => i);
    const score = part.options.map((option) => {
      const text = String(option).toLowerCase();
      return words.filter((word) => text.includes(word)).length;
    });
    const best = Math.max(...score);
    if (!best) return part.options.map((_, i) => i);
    return score.map((value, i) => [value, i]).filter(([value]) => value === best).map(([, i]) => i);
  },
  longest: (part) => {
    const lengths = part.options.map((option) => String(option).trim().split(/\s+/).length);
    const max = Math.max(...lengths);
    return part.options.map((_, i) => i).filter((i) => lengths[i] === max);
  },
  combined: (part, concept) => {
    let keep = part.options.map((_, i) => i);
    const next = keep.filter((i) => !ABSOLUTES.test(part.options[i]));
    if (next.length) keep = next;
    const words = contentWords(concept);
    if (words.length) {
      const scored = keep.map((i) => [words.filter((word) => String(part.options[i]).toLowerCase().includes(word)).length, i]);
      const best = Math.max(...scored.map(([value]) => value));
      if (best) keep = scored.filter(([value]) => value === best).map(([, i]) => i);
    }
    return keep;
  }
};

const report = {};
for (const subject of ["SPMS", "BRGSA", "SCLM", "IBM"]) {
  const viewFile = path.join(dir, `${subject}-set1.learn.json`);
  const keyFile = path.join(dir, `${subject}-set1.learn.key.json`);
  if (!fs.existsSync(viewFile) || !fs.existsSync(keyFile)) continue;
  const view = JSON.parse(fs.readFileSync(viewFile, "utf8"));
  const key = JSON.parse(fs.readFileSync(keyFile, "utf8"));
  if (view.queueDigest !== key.queueDigest) throw new Error(`${subject}: run and key are from different draws`);
  const keyByStep = Object.fromEntries(key.key.map((entry) => [entry.step, entry]));

  const parts = [];
  const unscorable = [];
  for (const step of view.run) {
    if (step.kind !== "question") continue;
    const entry = keyByStep[step.step];
    if (!entry) continue;
    if (step.type === "short-answer" || step.type === "numeric" || step.type === "msq") {
      unscorable.push({ step: step.step, id: step.id, type: step.type });
      continue;
    }
    for (const part of partsOf(step, entry)) parts.push({ ...part, concept: step.concept || "" });
  }

  const scores = {};
  for (const [name, rule] of Object.entries(STRATEGIES)) {
    let got = 0;
    for (const part of parts) got += expected(rule(part, part.concept), part.answer, 1);
    scores[name] = parts.length ? Math.round((got / parts.length) * 1000) / 10 : null;
  }
  scores.chance = parts.length
    ? Math.round((parts.reduce((sum, part) => sum + 1 / part.options.length, 0) / parts.length) * 1000) / 10
    : null;

  report[subject] = {
    steps: view.run.length,
    lessons: view.run.filter((s) => s.kind === "lesson").length,
    primers: view.run.filter((s) => s.kind === "primer").length,
    scoredQuestions: view.run.filter((s) => s.kind === "question").length,
    selectableParts: parts.length,
    craftCannotReach: unscorable,
    percentOfSelectableParts: scores
  };
}

console.log(JSON.stringify(report, null, 2));
