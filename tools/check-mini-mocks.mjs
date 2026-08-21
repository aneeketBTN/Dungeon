/* Structural acceptance for Speedruns (the file name preserves the original API).
 *
 * This loads the shipped bank and the same selector the browser uses. It fails if a
 * confidence cycle stops short of a concept, if a round is not exactly one question
 * from every module, if application drops below six of eight questions, or if a new
 * rotation repeats most of the prior cycle despite the authored alternatives.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const setDir = path.join(root, "app", "sets");
const LOAD_ORDER = [
  "t6_lessons.js", "t6_diagnoses.js", "t6_brgsa.js", "t6_catalog.js",
  "t6_integrated.js", "t6_ibm_case.js", "t6_challenges.js", "t6_mini_mocks.js"
];

function loadBank() {
  const window = {};
  const context = vm.createContext({ window, console, Set, Map });
  for (const file of LOAD_ORDER) {
    vm.runInContext(fs.readFileSync(path.join(setDir, file), "utf8"), context, { filename: file });
  }
  return window;
}

export function auditMiniMocks() {
  const window = loadBank();
  const courses = window.T6_COURSES;
  const selector = window.T6_MINI_MOCKS;
  const errors = [];
  const subjects = [];

  for (const courseId of ["SPMS", "BRGSA", "IBM", "SCLM"]) {
    const course = courses[courseId];
    const rotations = [0, 1, 2].map((rotation) => selector.build(courseId, rotation));
    const baseline = rotations[0];
    const questionById = course.questions || {};

    rotations.forEach((cycle) => {
      if (cycle.uncoveredConceptIds.length) {
        errors.push(`${courseId} rotation ${cycle.rotation} misses ${cycle.uncoveredConceptIds.join(", ")}`);
      }
      const seenQuestionIds = new Set();
      cycle.rounds.forEach((round) => {
        const prefix = `${courseId} rotation ${cycle.rotation} round ${round.index + 1}`;
        if (round.questionIds.length !== selector.roundSize) {
          errors.push(`${prefix} has ${round.questionIds.length}/${selector.roundSize} questions`);
        }
        const expectedModules = Array.from({ length: course.modules.length }, (_, index) => index + 1);
        const actualModules = [...round.modules].sort((a, b) => a - b);
        if (JSON.stringify(actualModules) !== JSON.stringify(expectedModules)) {
          errors.push(`${prefix} modules are ${actualModules.join(",")} instead of ${expectedModules.join(",")}`);
        }
        if (round.applicationCount < 6) {
          errors.push(`${prefix} has only ${round.applicationCount}/8 applied questions`);
        }
        for (const id of round.questionIds) {
          if (!questionById[id]) errors.push(`${prefix} references missing question ${id}`);
          if (seenQuestionIds.has(id)) errors.push(`${prefix} repeats question ${id} inside one coverage cycle`);
          seenQuestionIds.add(id);
        }
      });
      const covered = new Set();
      cycle.rounds.forEach((round) => round.questionIds.forEach((id) => {
        selector.conceptIds(questionById[id]).forEach((conceptId) => covered.add(conceptId));
      }));
      for (const concept of course.concepts) {
        if (!covered.has(concept.id)) errors.push(`${courseId} rotation ${cycle.rotation} never reaches ${concept.id}`);
      }
    });

    const baselineIds = baseline.rounds.flatMap((round) => round.questionIds);
    const changes = rotations.slice(1).map((cycle) => {
      const ids = new Set(cycle.rounds.flatMap((round) => round.questionIds));
      const changed = baselineIds.filter((id) => !ids.has(id)).length;
      return baselineIds.length ? changed / baselineIds.length : 0;
    });
    changes.forEach((rate, index) => {
      if (rate < 0.35) errors.push(`${courseId} rotation ${index + 1} changes only ${Math.round(rate * 100)}% of questions`);
    });

    subjects.push({
      courseId,
      concepts: course.concepts.length,
      rounds: baseline.rounds.length,
      questionsPerRound: selector.roundSize,
      applicationFloor: Math.min(...baseline.rounds.map((round) => round.applicationCount)),
      rotationChange: changes.map((rate) => Math.round(rate * 100))
    });
  }

  return { ok: errors.length === 0, errors, subjects };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditMiniMocks();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
