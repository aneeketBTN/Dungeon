/*
 * The examiner-only slice, and the two ways it could do more harm than the problem.
 *
 * WHY A SLICE AT ALL
 * There is one bank. Every question on every paper was also drawable in Learn, so a
 * candidate meeting an item they had answered in a study set scored a mark for recall
 * and the mock reported it as understanding — the over-crediting the evidence model
 * refuses to do everywhere else. `examReservedIds()` mitigated it as a late tiebreaker,
 * which depends on Learn having slack and cannot reach a section with none.
 *
 * THE TWO FAILURE MODES THIS FILE GUARDS
 *   1. The reservation leaks: an examOnly item reaches a study-set pool or the written
 *      practice picker, and the slice quietly does nothing.
 *   2. The reservation starves Learn. §4.2 of the overhaul brief is explicit that
 *      shared items must NOT be hard-excluded, because the examiner's draw would then
 *      take a module's best teaching surfaces away — trading a small honesty problem
 *      for a real teaching one. The slice is only safe because it is ADDITIVE: every
 *      surface Learn had before it existed, it still has.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const appDir = path.join(root, "app");

const BANK_FILES = [
  "sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js",
  "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_challenges.js"
];

function loadBank() {
  const context = { window: {}, atob: (v) => Buffer.from(v, "base64").toString("binary") };
  vm.createContext(context);
  for (const rel of BANK_FILES) {
    vm.runInContext(fs.readFileSync(path.join(appDir, rel), "utf8"), context, { filename: rel });
  }
  return context.window;
}

const win = loadBank();
const COURSES = win.T6_COURSES;

function questionsOf(courseId) {
  const course = COURSES[courseId];
  return Object.keys(course.questions).map((id) => course.questions[id]);
}

function reservedIn(courseId) {
  return questionsOf(courseId).filter((question) => question.examOnly);
}

test("the slice exists and every reserved item is a real, complete question", () => {
  const reserved = reservedIn("BRGSA");
  assert.ok(reserved.length >= 5,
    `BRGSA needs at least five reserved items for three distinct Section C draws, has ${reserved.length}`);
  for (const question of reserved) {
    assert.equal(question.type, "short-answer");
    assert.equal(question.writtenMode, "integrated");
    assert.ok(question.caselet && question.caselet.length > 400, `${question.id} has no substantial caselet`);
    assert.ok(question.exemplar && question.exemplar.length > 400, `${question.id} has no worked exemplar`);
    assert.ok(Array.isArray(question.rubric) && question.rubric.length >= 4,
      `${question.id} has too few criteria for a ten-mark response`);
    /* Every criterion must be diagnosable, or a miss cannot route to a repair. */
    for (const criterion of question.rubric) {
      assert.ok((question.writtenGaps || []).some((gap) => gap.criterionId === criterion.id),
        `${question.id} cannot diagnose a gap on ${criterion.id}`);
    }
  }
});

test("no reserved item reaches any study-set pool", () => {
  for (const courseId of Object.keys(COURSES)) {
    const reserved = new Set(reservedIn(courseId).map((question) => question.id));
    if (!reserved.size) continue;
    for (const run of COURSES[courseId].runs || []) {
      for (const id of run.questionPoolIds || []) {
        assert.ok(!reserved.has(id),
          `${courseId} set ${run.id} schedules reserved item ${id}; the slice has leaked into Learn`);
      }
    }
  }
});

test("written practice filters the slice out on its own, not only via the pools", () => {
  /* startWrittenPractice reads course.questions directly rather than a run pool, so
     the pool exclusion above does not cover it. Two filters, both required. */
  const source = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
  const picker = source.match(/function startWrittenPractice[\s\S]*?\.sort\(function \(left, right\)/);
  assert.ok(picker, "startWrittenPractice must still select from course.questions");
  assert.match(picker[0], /!question\.examOnly/,
    "startWrittenPractice must exclude reserved items");
  const challenges = fs.readFileSync(path.join(appDir, "sets", "t6_challenges.js"), "utf8");
  assert.match(challenges, /var activeQuestions = questions\.filter\(function \(question\) \{ return !question\.optionShapeRisk && !question\.primerOnly && !question\.examOnly; \}\);/,
    "configureRuns must build study pools without reserved items");
});

test("the slice is additive: no shared item was hard-excluded from Learn", () => {
  /* §4.2. The reservation is only defensible because Learn lost nothing — so every
     item that is NOT reserved must still be reachable, and each concept's Learn-side
     surface count must still clear the bank's own floor without counting the slice. */
  for (const courseId of Object.keys(COURSES)) {
    const course = COURSES[courseId];
    const reachable = questionsOf(courseId)
      .filter((question) => !question.optionShapeRisk && !question.primerOnly && !question.examOnly);
    const pooled = new Set();
    for (const run of course.runs || []) for (const id of run.questionPoolIds || []) pooled.add(id);
    for (const concept of course.concepts) {
      const surfaces = reachable.filter((question) =>
        question.conceptId === concept.id ||
        (question.supportingConceptIds || []).indexOf(concept.id) >= 0);
      assert.ok(surfaces.length >= 10,
        `${courseId}/${concept.id} has only ${surfaces.length} Learn-reachable surfaces once the slice is removed`);
      assert.ok(surfaces.some((question) => pooled.has(question.id)),
        `${courseId}/${concept.id} has no surface in any study-set pool`);
    }
  }
});

test("every reserved item still teaches something Learn also covers", () => {
  /* An examiner item on a concept Learn never teaches would not be a hard mock, it
     would be an unfair one — the same complaint the readiness figures exist to answer.
     Same concepts, same lectures, different situation. */
  for (const courseId of Object.keys(COURSES)) {
    const course = COURSES[courseId];
    const taught = new Set(course.concepts.map((concept) => concept.id));
    for (const question of reservedIn(courseId)) {
      const concepts = [question.conceptId].concat(Array.from(question.supportingConceptIds || []));
      for (const conceptId of concepts) {
        assert.ok(taught.has(conceptId),
          `${question.id} tests ${conceptId}, which is not a concept of ${courseId}`);
      }
      for (const lectureId of Array.from(question.sourceIds || [])) {
        assert.ok(win.T6_LESSONS[lectureId],
          `${question.id} cites ${lectureId}, which has no lesson — the paper would test something never taught`);
      }
    }
  }
});

test("reserved scenarios are different situations, not reworded copies", () => {
  /* T4's second assertion, applied where it bites hardest: a Learn scenario and a
     reserved one on the same concepts must not share their wording. Trigram overlap
     rather than exact equality, because a reworded copy is still a copy. */
  const trigrams = (text) => {
    const words = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    const out = new Set();
    for (let i = 0; i + 2 < words.length; i += 1) out.add(words.slice(i, i + 3).join(" "));
    return out;
  };
  const jaccard = (a, b) => {
    let shared = 0;
    for (const value of a) if (b.has(value)) shared += 1;
    return shared / (a.size + b.size - shared || 1);
  };
  for (const courseId of Object.keys(COURSES)) {
    const integrated = questionsOf(courseId).filter((question) => question.writtenMode === "integrated");
    const learn = integrated.filter((question) => !question.examOnly);
    const reserved = integrated.filter((question) => question.examOnly);
    for (const exam of reserved) {
      const examText = trigrams(`${exam.caselet} ${exam.stem}`);
      for (const shared of learn) {
        const overlap = jaccard(examText, trigrams(`${shared.caselet} ${shared.stem}`));
        assert.ok(overlap < 0.10,
          `${exam.id} overlaps ${shared.id} at ${(overlap * 100).toFixed(1)}% of trigrams; a reworded copy is still a copy`);
      }
    }
  }
});
