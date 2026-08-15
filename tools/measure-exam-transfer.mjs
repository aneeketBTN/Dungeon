#!/usr/bin/env node
/*
 * T4 — "Does Examiner test understanding?" · the transfer test.
 *
 * The examiner and Learn draw from one bank, so a candidate can meet an item on the
 * paper that they answered in a study set. They score it from recall and the mock
 * reports it as knowledge — the same over-crediting the evidence model refuses to do
 * everywhere else. Two assertions, because the problem has two halves and closing one
 * without the other proves nothing.
 *
 *   OVERLAP. Per paper, the share of marks drawn from items a learner studying this
 *   subject could already have answered — reported at two levels, `ladder` (sets 1-8,
 *   the sequence everyone walks) and `anyRoute` (all ten). See learnReachable() for
 *   why one number was not enough. It is bounded by the bank: SPMS Section B needs 20
 *   msqs from a pool of 20, so some overlap is arithmetic rather than negligence, and
 *   the figure is reported per section with its slack so a section that cannot avoid
 *   overlap can be told from one with slack going unused.
 *
 *   SAME CONCEPT, DIFFERENT SURFACE. For every concept a paper tests, is there at
 *   least one examiner item whose caselet, stem and options are all distinct from
 *   every Learn item on that concept? Trigram overlap under a stated threshold, never
 *   exact equality, because a reworded copy is still a copy. This is the half that
 *   actually answers the question: overlap can be driven down by luck in the draw,
 *   but a genuinely different surface has to have been authored.
 *
 * The Learn side is NOT re-implemented here. `selectQuestionsFromPool` is a DOM-bound
 * IIFE with rules that depend on learner state; what this uses instead is the study
 * set POOLS, which are data the bank publishes (`run.questionPoolIds`). A pool is a
 * superset of what any learner is served, so overlap measured against it is an upper
 * bound — the honest direction for this number to be wrong in, and it is labelled as
 * such rather than presented as the delivered figure.
 *
 *   node tools/measure-exam-transfer.mjs [--gate]
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(here, "..", "app");
const gate = process.argv.indexOf("--gate") >= 0;

const context = { window: {}, atob: (v) => Buffer.from(v, "base64").toString("binary") };
vm.createContext(context);
for (const rel of ["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_challenges.js"]) {
  const file = path.join(appRoot, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}
const COURSES = context.window.T6_COURSES;
const COURSE_IDS = ["SPMS", "BRGSA", "SCLM", "IBM"];
const SET_COUNT = 3;

/* Mirrored from app/t6.js — section shape and the paper builder, including the
   preference ordering added with the examiner-only slice. Kept minimal on purpose;
   tools/browser-checks/export-run.js is what proves the mirror matches the app. */
const PREFER = ["integrated", "case", "short"];
const PAPERS = {
  SPMS: { sections: [{ id: "A", type: "mcq", count: 35, marks: 1 }, { id: "B", type: "msq", count: 20, marks: 2 }] },
  BRGSA: { sections: [{ id: "A", type: "mcq", count: 20, marks: 2 }, { id: "B", type: "case-cloze", count: 4, marks: 5 }, { id: "C", type: "short-answer", count: 2, marks: 10, prefer: PREFER }] },
  SCLM: { sections: [{ id: "A", type: "mcq", count: 50, marks: 1 }, { id: "B", type: "numeric", count: 6, marks: 4 }, { id: "C", type: "match", count: 3, marks: 2 }] },
  IBM: { sections: [{ id: "A", type: "short-answer", count: 10, marks: 10, prefer: PREFER }] }
};

function examSeed(courseId, setIndex) {
  let base = 2166136261;
  for (let i = 0; i < courseId.length; i += 1) {
    base = (base ^ courseId.charCodeAt(i)) >>> 0;
    base = (base * 16777619) >>> 0;
  }
  return (base + (setIndex + 1) * 2654435761) >>> 0;
}

function examShuffle(items, seed) {
  const out = items.slice();
  let state = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    const swap = out[i]; out[i] = out[j]; out[j] = swap;
  }
  return out;
}

function examPrefer(questions, prefer) {
  const hasReserved = questions.some((q) => q.examOnly);
  if ((!prefer || !prefer.length) && !hasReserved) return questions;
  const band = (question) => {
    if (!prefer || !prefer.length) return 0;
    const index = prefer.indexOf(question.writtenMode);
    return index < 0 ? prefer.length : index;
  };
  const reserved = (question) => (question.examOnly ? 0 : 1);
  return questions.map((question, index) => ({ question, index }))
    .sort((a, b) => band(a.question) - band(b.question) ||
      reserved(a.question) - reserved(b.question) || a.index - b.index)
    .map((entry) => entry.question);
}

function examPool(course, type) {
  return Object.keys(course.questions).map((id) => course.questions[id])
    .filter((question) => (question.type || "mcq") !== "primer" && (question.type || "mcq") === type);
}

function conceptsOf(question) {
  return [question.conceptId].concat(Array.from(question.supportingConceptIds || [])).filter(Boolean);
}

/* Two reachability levels, because measuring against one number hid the answer.
 *
 * The first version of this pooled all ten sets and reported 100% overlap on three of
 * four papers. That figure is true and useless, and the reason is worth writing down:
 * set 10 is the flexible builder and its pool is EVERY active question in the subject,
 * so "reachable in Learn" is satisfied by every non-reserved item by construction. A
 * measure that returns 100% whatever anybody authors cannot tell work from no work.
 *
 *   ladder    — sets 1..8, the sequence every learner walks. This is the number that
 *               answers "did the candidate already answer this while studying".
 *   anyRoute  — all ten, including the builder they may never open. The upper bound.
 *
 * Neither is the delivered set: pools are supersets of what selectQuestionsFromPool
 * serves, and that function is a DOM-bound IIFE this must not re-implement. Both
 * figures are therefore upper bounds, and are labelled as such. */
function learnReachable(courseId, ladderOnly) {
  const ids = new Set();
  for (const run of COURSES[courseId].runs || []) {
    if (ladderOnly && !(run.module >= 1 && run.module <= 8)) continue;
    for (const id of run.questionPoolIds || []) ids.add(id);
  }
  return ids;
}

function surfaceText(question) {
  const parts = [question.caselet || "", question.stem || "", question.prompt || ""];
  for (const option of question.options || []) parts.push(String(option));
  for (const blank of question.blanks || []) for (const option of blank.options || []) parts.push(String(option));
  for (const choice of question.choices || []) parts.push(String(choice));
  for (const step of question.steps || []) {
    parts.push(step.stem || "");
    for (const option of step.options || []) parts.push(String(option));
  }
  return parts.join(" ");
}

function trigrams(text) {
  const words = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + 2 < words.length; i += 1) out.add(words.slice(i, i + 3).join(" "));
  return out;
}

function jaccard(a, b) {
  let shared = 0;
  for (const value of a) if (b.has(value)) shared += 1;
  const union = a.size + b.size - shared;
  return union ? shared / union : 0;
}

/* Below this, two surfaces are different situations rather than one reworded twice.
   Stated here because a threshold nobody can see is not a threshold. */
const DISTINCT_BELOW = 0.20;

const report = { thresholds: { distinctBelow: DISTINCT_BELOW }, subjects: {} };

for (const courseId of COURSE_IDS) {
  const course = COURSES[courseId];
  const spec = PAPERS[courseId];
  const ladder = learnReachable(courseId, true);
  const anyRoute = learnReachable(courseId, false);

  /* ---- overlap, per section, meaned over the three seeded sets ---- */
  const sections = {};
  let paperMarks = 0;
  let paperLadder = 0;
  let paperAny = 0;
  for (const section of spec.sections) {
    let marks = 0;
    let seenLadder = 0;
    let seenAny = 0;
    let poolSize = 0;
    for (let set = 0; set < SET_COUNT; set += 1) {
      const pool = examPool(course, section.type);
      poolSize = pool.length;
      const taken = examPrefer(examShuffle(pool, examSeed(courseId, set) + section.id.charCodeAt(0)), section.prefer)
        .slice(0, section.count);
      for (const question of taken) {
        marks += section.marks;
        if (ladder.has(question.id)) seenLadder += section.marks;
        if (anyRoute.has(question.id)) seenAny += section.marks;
      }
    }
    sections[section.id] = {
      marksPerPaper: marks / SET_COUNT,
      ladderOverlapPct: marks ? Math.round((seenLadder / marks) * 1000) / 10 : 0,
      anyRouteOverlapPct: marks ? Math.round((seenAny / marks) * 1000) / 10 : 0,
      /* Slack is what makes a low overlap achievable at all. A section drawing its
         whole pool cannot avoid overlap and should not be read as negligent. */
      poolSize, drawn: section.count,
      slack: poolSize - section.count
    };
    paperMarks += marks;
    paperLadder += seenLadder;
    paperAny += seenAny;
  }

  /* ---- same concept, different surface ---- */
  const paperConcepts = new Map();
  for (const section of spec.sections) {
    for (let set = 0; set < SET_COUNT; set += 1) {
      const taken = examPrefer(examShuffle(examPool(course, section.type), examSeed(courseId, set) + section.id.charCodeAt(0)), section.prefer)
        .slice(0, section.count);
      for (const question of taken) {
        for (const conceptId of conceptsOf(question)) {
          if (!paperConcepts.has(conceptId)) paperConcepts.set(conceptId, new Set());
          paperConcepts.get(conceptId).add(question.id);
        }
      }
    }
  }

  const byId = course.questions;
  const learnTrigrams = new Map();
  const transfer = [];
  for (const [conceptId, examIds] of paperConcepts) {
    const learnItems = [...anyRoute].map((id) => byId[id])
      .filter((question) => question && conceptsOf(question).indexOf(conceptId) >= 0);
    for (const item of learnItems) {
      if (!learnTrigrams.has(item.id)) learnTrigrams.set(item.id, trigrams(surfaceText(item)));
    }
    let best = null;
    for (const examId of examIds) {
      const examText = trigrams(surfaceText(byId[examId]));
      let worst = 0;
      for (const item of learnItems) {
        worst = Math.max(worst, jaccard(examText, learnTrigrams.get(item.id)));
      }
      if (!best || worst < best.maxOverlap) best = { examId, maxOverlap: Math.round(worst * 1000) / 1000 };
    }
    transfer.push({
      conceptId,
      learnSurfaces: learnItems.length,
      bestExamItem: best ? best.examId : null,
      maxOverlapWithLearn: best ? best.maxOverlap : null,
      hasDistinctSurface: Boolean(best && best.maxOverlap < DISTINCT_BELOW)
    });
  }

  const withoutDistinct = transfer.filter((row) => !row.hasDistinctSurface);
  report.subjects[courseId] = {
    overlap: {
      note: "Upper bounds from study-set POOLS, not deliveries. ladder = sets 1-8, the sequence every learner walks. anyRoute = all ten, including set 10 whose pool is the entire subject.",
      paperLadderPct: paperMarks ? Math.round((paperLadder / paperMarks) * 1000) / 10 : 0,
      paperAnyRoutePct: paperMarks ? Math.round((paperAny / paperMarks) * 1000) / 10 : 0,
      sections
    },
    sameConceptDifferentSurface: {
      conceptsOnPaper: transfer.length,
      withADistinctExaminerSurface: transfer.length - withoutDistinct.length,
      without: withoutDistinct.map((row) => ({
        conceptId: row.conceptId, closest: row.bestExamItem, overlap: row.maxOverlapWithLearn
      }))
    },
    detail: transfer.sort((a, b) => b.maxOverlapWithLearn - a.maxOverlapWithLearn)
  };
}

console.log(JSON.stringify(report, null, 2));

if (gate) {
  /* Deliberately gated on the half that authoring controls. Overlap is bounded by
     pool slack the bank does not always have, so failing on it would make the gate a
     statement about SCLM Section A's pool size rather than about the work. Overlap is
     REPORTED per section, every time, so it cannot quietly drift upward unseen. */
  const problems = [];
  for (const courseId of COURSE_IDS) {
    const subject = report.subjects[courseId];
    const written = subject.overlap.sections.C || subject.overlap.sections.A;
    if (!written) problems.push(`${courseId} has no section to report`);
    if (courseId === "BRGSA" && subject.overlap.sections.C.anyRouteOverlapPct > 0) {
      problems.push(`BRGSA Section C overlap is ${subject.overlap.sections.C.anyRouteOverlapPct}% — the reserved slice should make it 0`);
    }
    /* Every concept a paper can test must have at least one examiner surface a
       learner cannot have met while studying. This is the assertion authoring
       controls, and it is the one that went from 0/16 on three subjects to 16/16 on
       all four — so it is the one worth holding, because it regresses silently the
       moment a concept is added without a reserved item to go with it. */
    const transfer = subject.sameConceptDifferentSurface;
    if (transfer.withADistinctExaminerSurface < transfer.conceptsOnPaper) {
      problems.push(`${courseId}: ${transfer.conceptsOnPaper - transfer.withADistinctExaminerSurface} concept(s) have no distinct examiner surface — ` +
        transfer.without.map((row) => row.conceptId).join(", "));
    }
  }
  if (problems.length) {
    console.error("\nT4 FAILED:");
    for (const message of problems) console.error(`  × ${message}`);
    process.exit(1);
  }
  console.error("\nT4 passed. Overlap and same-concept-different-surface reported above; BRGSA Section C is fully reserved.");
}
