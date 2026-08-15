/*
 * Persona harness — writes the exact mock paper a candidate would sit, as JSON.
 *
 * WHY
 * The three-student cram test cost ~390 tool calls per persona, nearly all of it
 * navigation: open the palette, read a stem, click an option, Save & next, ×57. The
 * material is deterministic, so none of that clicking discovered anything. One read
 * of one file replaces it.
 *
 * BLIND BY CONSTRUCTION
 * Two files per subject. `<SUBJECT>-set<N>.json` is the candidate view and carries no
 * answer index, no `answers` array, no per-blank answer, no diagnoses, no rubric
 * text, no explanation. `<SUBJECT>-set<N>.key.json` carries them. A persona is handed
 * the first. The previous run's blindness rested on a persona choosing not to look at
 * the bank, which is not a control; this is.
 *
 * THE MIRROR, AND WHY IT IS ALLOWED HERE
 * `examSeed`, `examShuffle`, `examPool` and `spreadByStem` are reproduced from
 * app/t6.js because that file is a DOM-bound IIFE. teach-before-test.js is right that
 * a second copy of the scheduling rules drifts and then reports green while the app is
 * broken — so this mirror is not trusted on its own. It emits `digest`, and
 * tools/browser-checks/export-run.js recomputes the same digest from the app's own
 * `window.__dungeonExport.paper()` and fails if they differ. The mirror is allowed
 * because it is checked, not because it is small.
 *
 * The Learn queue is deliberately NOT mirrored here — `layeredQueue` and
 * `selectQuestionsFromPool` carry far more rules than the paper builder, and they
 * depend on learner state. export-run.js exports that half from the live app.
 *
 * USAGE
 *   node tools/export-persona-run.mjs [outputDir]
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(here, "..", "app");
const outDir = process.argv[2] || path.join(here, "..", "evidence", "2026-08-15", "persona-harness");

const context = { window: {}, atob: (v) => Buffer.from(v, "base64").toString("binary") };
vm.createContext(context);
for (const rel of ["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_challenges.js"]) {
  const file = path.join(appRoot, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}
const courses = context.window.T6_COURSES;
const lessons = context.window.T6_LESSONS || {};

/* Mirrored from app/t6.js — EXAM_PAPERS section shape and the paper builder. */
const PAPERS = {
  SPMS: { title: "Software Product Management for Startups", sat: "22 August, 09:00–11:00", total: 75, calculator: null, sections: [
    { id: "A", label: "Section A", type: "mcq", count: 35, marks: 1, rule: "One correct option. One mark each. No negative marking." },
    { id: "B", label: "Section B", type: "msq", count: 20, marks: 2, negative: true, rule: "Multiple correct options. +1 for each right option, −1 for each wrong one, and a question cannot score below zero." }] },
  BRGSA: { title: "Business Research and Growth Systems Architecture", sat: "22 August, 13:00–15:00", total: 80, calculator: "basic", sections: [
    { id: "A", label: "Section A", type: "mcq", count: 20, marks: 2, rule: "One correct option. Two marks each. No negative marking." },
    { id: "B", label: "Section B", type: "case-cloze", count: 4, marks: 5, rule: "A short scenario, then a task. Both parts must be right for the marks. No partial credit." },
    { id: "C", label: "Section C", type: "short-answer", count: 2, marks: 10, rule: "A complete structured response. Not machine-marked." }] },
  SCLM: { title: "Supply Chain & Logistics Management", sat: "23 August, 13:00–15:00", total: 80, calculator: "scientific", sections: [
    { id: "A", label: "Section A", type: "mcq", count: 50, marks: 1, rule: "One correct option. One mark each. No negative marking." },
    { id: "B", label: "Section B", type: "numeric", count: 6, marks: 4, rule: "Enter the final figure only. No marks for working." },
    { id: "C", label: "Section C", type: "match", count: 3, marks: 2, rule: "Match every pair. Two marks each. All or nothing." }] },
  IBM: { title: "Inclusive Business Model", sat: "23 August, 09:00–11:00", total: 100, calculator: null, sections: [
    { id: "A", label: "Section A", type: "short-answer", count: 10, marks: 10, rule: "Ten written answers on a caselet released two days before the exam." }],
    caveat: "A mock cannot reproduce this paper, because the case is the paper. This is timed writing practice against the frameworks." }
};

function examSeed(courseId, setIndex) {
  let base = 2166136261;
  for (let i = 0; i < courseId.length; i++) {
    base = (base ^ courseId.charCodeAt(i)) >>> 0;
    base = (base * 16777619) >>> 0;
  }
  return (base + (setIndex + 1) * 2654435761) >>> 0;
}

function examShuffle(items, seed) {
  const out = items.slice();
  let state = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    const swap = out[i]; out[i] = out[j]; out[j] = swap;
  }
  return out;
}

function examPool(course, type) {
  return Object.keys(course.questions).map((k) => course.questions[k])
    .filter((q) => (q.type || "mcq") !== "primer" && (q.type || "mcq") === type);
}

function spreadByStem(questions) {
  const groups = [];
  const index = {};
  for (const question of questions) {
    const key = String(question.caselet || "") + "|" + String(question.stem || question.prompt || question.id);
    if (!(key in index)) { index[key] = groups.length; groups.push([]); }
    groups[index[key]].push(question);
  }
  if (groups.length < 2) return questions;
  groups.sort((a, b) => b.length - a.length);
  const out = [];
  for (let i = 0; out.length < questions.length; i++) {
    for (const group of groups) if (group[i]) out.push(group[i]);
  }
  return out;
}

function buildPaper(courseId, setIndex) {
  const course = courses[courseId];
  const spec = PAPERS[courseId];
  const seed = examSeed(courseId, setIndex);
  const items = [];
  const shortfalls = [];
  for (const section of spec.sections) {
    const pool = examShuffle(examPool(course, section.type), seed + section.id.charCodeAt(0));
    let taken = pool.slice(0, section.count);
    if (taken.length < section.count) {
      shortfalls.push({ section: section.id, want: section.count, have: taken.length, type: section.type });
    }
    taken = spreadByStem(taken);
    for (const question of taken) items.push({ section: section.id, marks: section.marks, question });
  }
  return { items, shortfalls, available: items.reduce((sum, entry) => sum + entry.marks, 0) };
}

/* The glossary a candidate can open on a question — part of what they are given, and
   it materially changes what the item tests. */
function termsFor(question) {
  const ids = (question.sourceIds?.length ? question.sourceIds : [question.source]).filter(Boolean);
  const terms = [];
  for (const id of ids) {
    for (const entry of lessons[id]?.glossary || []) {
      if (entry?.term && !terms.includes(entry.term)) terms.push(entry.term);
    }
  }
  return terms;
}

function candidateView(question, number, section, marks) {
  const type = question.type || "mcq";
  const view = {
    number, section, marks, id: question.id, type,
    caselet: typeof question.caselet === "string" ? question.caselet : null,
    stem: question.stem || question.prompt || "",
    prompt: (question.prompt && question.stem && question.prompt !== question.stem) ? question.prompt : null
  };
  if (type === "mcq" || type === "msq") view.options = (question.options || []).slice();
  if (type === "case-cloze") {
    view.blanks = (question.blanks || []).map((b) => ({ label: b.label || "", options: (b.options || []).slice() }));
  }
  if (type === "boss") {
    view.steps = (question.steps || []).map((s) => ({ label: s.label || "", prompt: s.prompt || "", options: (s.options || []).slice() }));
  }
  if (type === "match") {
    view.rows = (question.rows || []).map((r) => r.label || "");
    view.choices = (question.choices || []).slice();
  }
  if (type === "numeric") view.unit = question.unit || null;
  if (type === "short-answer") view.rubricPointCount = (question.rubric || []).length;
  view.termsAvailable = termsFor(question);
  return view;
}

function answerKey(question) {
  const type = question.type || "mcq";
  const key = {
    id: question.id, type, conceptId: question.conceptId,
    supportingConceptIds: (question.supportingConceptIds || []).slice(),
    sourceIds: (question.sourceIds?.length ? question.sourceIds : [question.source]).filter(Boolean)
  };
  if (type === "mcq") key.answer = question.answer;
  if (type === "msq") key.answers = (question.answers || question.correct || []).slice();
  if (type === "case-cloze") key.blanks = (question.blanks || []).map((b) => b.answer);
  if (type === "boss") key.steps = (question.steps || []).map((s) => s.answer);
  if (type === "match") key.rows = (question.rows || []).map((r) => r.answer);
  if (type === "numeric") { key.answer = question.answer; key.tolerance = question.tolerance || 0; }
  if (type === "short-answer") key.rubric = (question.rubric || []).slice();
  key.explanation = question.explanation || null;
  return key;
}

function fnv1a(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash = (hash ^ value.charCodeAt(i)) >>> 0;
    hash = (hash * 16777619) >>> 0;
  }
  return ("00000000" + hash.toString(16)).slice(-8);
}

fs.mkdirSync(outDir, { recursive: true });
const summary = [];

for (const courseId of ["SPMS", "BRGSA", "SCLM", "IBM"]) {
  const spec = PAPERS[courseId];
  /* Three sets, not one.
   *
   * A paper is 20–50 questions drawn from a pool of 52–120, so what a single seed
   * happens to pull is noisy — and the noise is the size of the effect being measured.
   * Adding sixteen BRGSA items moved that subject's "eliminate the absolutes" score
   * from 36.2% to 46.3% on set 1 while the bank-wide bias fell, because set 1's
   * reshuffled draw picked up four items where all three distractors carry one. One
   * seed cannot tell a bank change from a draw. The examiner offers sets 1–3, so
   * measure all three and read the mean. */
  for (const setIndex of [0, 1, 2]) {
    const built = buildPaper(courseId, setIndex);
    const paper = built.items.map((entry, i) => candidateView(entry.question, i + 1, entry.section, entry.marks));
    const key = built.items.map((entry) => answerKey(entry.question));

    /* The digest is over question ids in order — the thing that must match the app.
       tools/browser-checks/export-run.js recomputes it from the live builder and the
       two are compared directly, so both sides use the same FNV-1a: the browser check
       is synchronous by design and crypto.subtle is not. It is a tripwire for a
       changed draw, not a signature, so collision strength is not the property
       wanted here. */
    const digest = fnv1a(built.items.map((e) => e.section + ":" + e.question.id).join("|"));

    const candidate = {
      subject: courseId, subjectTitle: spec.title, set: setIndex + 1,
      digest,
      instructions: {
        sat: spec.sat, minutes: 120, calculator: spec.calculator,
        marksOnTheRealPaper: spec.total,
        marksAvailableHere: built.available,
        sections: spec.sections.map((s) => ({ id: s.id, count: s.count, marks: s.marks, rule: s.rule })),
        shortfalls: built.shortfalls,
        caveat: spec.caveat || null
      },
      paper
    };
    const base = path.join(outDir, `${courseId}-set${setIndex + 1}`);
    fs.writeFileSync(`${base}.json`, JSON.stringify(candidate, null, 1));
    fs.writeFileSync(`${base}.key.json`, JSON.stringify({ subject: courseId, set: setIndex + 1, digest, key }, null, 1));

    summary.push({
      subject: courseId, questions: paper.length, marksAvailable: built.available,
      digest, shortfalls: built.shortfalls.length,
      candidateBytes: fs.statSync(`${base}.json`).size
    });
  }
}

console.log(JSON.stringify({ outDir, files: summary }, null, 2));
