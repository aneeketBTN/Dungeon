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

test("every subject has a reserved slice, and every reserved item is complete", () => {
  for (const courseId of Object.keys(COURSES)) {
    const reserved = reservedIn(courseId);
    assert.ok(reserved.length > 0, `${courseId} has no examiner-only items`);
    for (const question of reserved) {
      if (question.type === "short-answer") {
        assert.equal(question.writtenMode, "integrated");
        assert.ok(question.caselet && question.caselet.length > 400, `${question.id} has no substantial caselet`);
        assert.ok(question.exemplar && question.exemplar.length > 400, `${question.id} has no worked exemplar`);
        assert.ok(Array.isArray(question.rubric) && question.rubric.length >= 4,
          `${question.id} has too few criteria for a ten-mark response`);
        for (const criterion of question.rubric) {
          assert.ok((question.writtenGaps || []).some((gap) => gap.criterionId === criterion.id),
            `${question.id} cannot diagnose a gap on ${criterion.id}`);
        }
      } else {
        /* Objective reserved items still owe a diagnosis on every distractor: an
           examiner item routes into repair after the paper, and a wrong option with
           no diagnosis routes nowhere. */
        assert.ok(Array.isArray(question.options) && question.options.length >= 4,
          `${question.id} has too few options`);
        const answers = question.type === "msq" ? (question.answers || []) : [question.answer];
        (question.diagnoses || []).forEach((diagnosis, index) => {
          if (answers.indexOf(index) >= 0) return;
          assert.ok(diagnosis && diagnosis.why && diagnosis.cue,
            `${question.id} option ${index} is wrong with nothing to say about why`);
        });
      }
    }
  }
});

/* BRGSA's Section C is fully reserved, so it needs enough of them to draw three
   different papers from. Two slots drawn twice from four collided once already. */
test("BRGSA has enough reserved scenarios for three distinct Section C draws", () => {
  const scenarios = reservedIn("BRGSA").filter((q) => q.writtenMode === "integrated");
  assert.ok(scenarios.length >= 5,
    `Section C draws 2 and offers 3 sets; ${scenarios.length} reserved scenarios cannot make them distinct`);
});

/* A reserved item is on EVERY paper, so its shape bias is never diluted by the draw.
 *
 * Measured: adding two reserved BRGSA mcqs moved `combinedWithLength` on the drawn
 * paper from 24% to 33.6% while the 78-item pool sat at 26% — three independent seeds
 * all reading ~33, because one of the two was won outright by the rule and appeared on
 * all three sets. A shared item carrying the same bias would have been diluted to
 * roughly a quarter of that. Reserved items therefore have to be BETTER than average
 * on craft, not merely average, and this is the check that says so. */
test("no reserved objective item is won outright by a mechanical rule", () => {
  const ABSOLUTES = /\b(only|all|every|always|never|entirely|automatically|simply|any|no other|nothing else)\b/i;
  const UNETHICAL = /\b(hide|hiding|delete|deleting|ignore|ignoring|double-count|conceal|omit|misreport)\b/i;
  const words = (value) => String(value || "").trim().split(/\s+/).filter(Boolean).length;
  const offenders = [];
  for (const courseId of Object.keys(COURSES)) {
    for (const question of reservedIn(courseId)) {
      if (question.type !== "mcq" || !Array.isArray(question.options)) continue;
      let keep = question.options.map((_, i) => i);
      const drop = (test) => { const next = keep.filter((i) => !test(question.options[i])); if (next.length) keep = next; };
      drop((o) => ABSOLUTES.test(o));
      drop((o) => UNETHICAL.test(o));
      if (keep.length > 1) {
        const lengths = keep.map((i) => words(question.options[i]));
        const max = Math.max(...lengths);
        const below = lengths.filter((l) => l < max);
        if (below.length) {
          const second = Math.max(...below);
          const narrowed = keep.filter((i) => words(question.options[i]) === second);
          if (narrowed.length) keep = narrowed;
        }
      }
      if (keep.length === 1 && keep[0] === question.answer) offenders.push(`${courseId}/${question.id}`);
    }
  }
  assert.equal(offenders.length, 0,
    `these reserved items are answerable by eliminating absolutes then taking the second-longest, on every paper: ${offenders.join(", ")}`);
});

/* LAW-53, as a gate rather than as a memory.
 *
 * All eight original SPMS multi-selects were 3-correct-of-4, which on a section
 * scoring +1 per right option, -1 per wrong, floored at zero and capped at the
 * question's 2 marks, means ticking every option scores FULL marks. It was found by
 * submitting a paper with nothing answered in Section A and reading 16/16.
 *
 * Writing eight new examiner-only multi-selects re-introduced it immediately: four
 * came out 3-of-4 and one 4-of-4, and nothing failed — the shape was only caught by
 * printing the distribution by hand. A defect that returns the moment someone authors
 * in good faith is a defect that needs a test, not a law to remember. */
test("ticking every option never reaches full marks on the negatively marked section", () => {
  const MARKS = 2;
  const offenders = [];
  for (const question of questionsOf("SPMS")) {
    if (question.type !== "msq") continue;
    const right = (question.answers || []).length;
    const wrong = (question.options || []).length - right;
    const scored = Math.min(MARKS, Math.max(0, right - wrong));
    if (scored >= MARKS) {
      offenders.push(`${question.id} (${right}-of-${right + wrong} scores ${scored}/${MARKS})`);
    }
  }
  assert.equal(offenders.length, 0,
    `ticking everything must be strictly worse than answering: ${offenders.join(", ")}`);
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
      /* Written-only frameworks deliberately have three independent active
         families rather than ten objective variants; applying the objective floor
         here would force frameworks back into MCQs and break IBM's authored mode. */
      const floor = concept.assessmentMode === "written" ? 3 : 10;
      assert.ok(surfaces.length >= floor,
        `${courseId}/${concept.id} has only ${surfaces.length} Learn-reachable surfaces once the slice is removed (needs ${floor})`);
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
