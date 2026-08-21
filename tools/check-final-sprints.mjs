import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const bankFiles = [
  "t6_lessons.js", "t6_diagnoses.js", "t6_brgsa.js", "t6_catalog.js",
  "t6_integrated.js", "t6_ibm_case.js", "t6_challenges.js", "t6_final_sprints.js"
];

function loadRelease() {
  const context = {window: {}, atob: (value) => Buffer.from(value, "base64").toString("binary")};
  vm.createContext(context);
  for (const file of bankFiles) {
    vm.runInContext(fs.readFileSync(path.join(root, "app", "sets", file), "utf8"), context, {filename: file});
  }
  return context.window;
}

export function auditFinalSprints() {
  const win = loadRelease();
  const errors = [];
  const subjects = [];
  const expectedSubjects = ["SPMS", "BRGSA", "IBM", "SCLM"];
  const objectiveTypes = new Set(["mcq", "msq", "case-cloze", "numeric", "match"]);

  for (const courseId of expectedSubjects) {
    const course = win.T6_COURSES?.[courseId];
    const pack = win.T6_FINAL_SPRINTS?.[courseId];
    const build = win.T6_FINAL_SPRINTS?.build;
    if (!course || !pack || typeof build !== "function") {
      errors.push(`${courseId}: missing course, Mini pack, or selector`);
      continue;
    }
    const first = build(courseId, 0);
    const second = build(courseId, 1);
    if (!first || first.questionIds?.length !== 8) errors.push(`${courseId}: first Mini does not contain 8 questions`);
    if (!second || second.questionIds?.length !== 8) errors.push(`${courseId}: repeat Mini does not contain 8 questions`);
    if (!first || !second) continue;

    const modules = [...new Set(first.modules)].sort((a, b) => a - b).join(",");
    if (modules !== "1,2,3,4,5,6,7,8") errors.push(`${courseId}: module coverage is ${modules || "empty"}`);
    if (first.types.join(",") !== pack.formats.join(",")) {
      errors.push(`${courseId}: delivered ${first.types.join(",")} instead of promised ${pack.formats.join(",")}`);
    }
    if (new Set(first.questionIds).size !== 8) errors.push(`${courseId}: duplicate question in one Mini`);
    for (const question of first.questions) {
      if (!question) { errors.push(`${courseId}: selector left a module empty`); continue; }
      if (!objectiveTypes.has(question.type || "mcq")) errors.push(`${question.id}: Mini asks for prose or a non-rapid response`);
      if (!course.questions[question.id]) errors.push(`${question.id}: is not grounded in the subject bank`);
      if (!course.concepts.some((concept) => concept.id === question.conceptId)) errors.push(`${question.id}: has no known concept`);
      if (!question.explanation || !question.sourceIds?.length) errors.push(`${question.id}: cannot teach immediately from grounded evidence`);
    }
    if (!pack.title || !pack.focus || !pack.paperReality) errors.push(`${courseId}: Mini has no focused framing or paper boundary`);
    if (pack.traps?.length !== 3) errors.push(`${courseId}: expected exactly three optional last-minute traps`);

    if (courseId === "SPMS") {
      const msqs = first.questions.filter((question) => question.type === "msq");
      if (msqs.length !== 3) errors.push(`SPMS: expected 3 P-type MSQs in the eight-question mix, got ${msqs.length}`);
      const bankMsqs = Object.values(course.questions).filter((question) => question.type === "msq");
      const wrongShape = bankMsqs.filter((question) => question.answers?.length !== 2);
      if (wrongShape.length) errors.push(`SPMS: ${wrongShape.length} bank MSQs are not exactly-two P-type items`);
    }

    const rotationChanges = first.questionIds.filter((id, index) => id !== second.questionIds[index]).length;
    if (rotationChanges < 6) errors.push(`${courseId}: repeat changes only ${rotationChanges} of 8 questions`);
    subjects.push({courseId, questions:first.questionIds.length, modules:first.modules.length,
      types:first.types, rotationChanges});
  }

  const released = win.T6_IBM_RELEASED_CASE;
  const releasedBank = Object.values(win.T6_COURSES?.IBM?.questions || {}).filter((question) => question.releasedCase);
  if (!released) errors.push("IBM: released case pack is absent");
  else {
    if (released.questions?.length !== 10) errors.push(`IBM: released case needs 10 lenses, got ${released.questions?.length ?? 0}`);
    if (released.lenses?.length !== 10) errors.push(`IBM: released case needs 10 lens summaries, got ${released.lenses?.length ?? 0}`);
    if (releasedBank.length !== 10) errors.push(`IBM: released case built ${releasedBank.length} paper questions instead of 10`);
    for (const question of releasedBank) {
      if (!question.examOnly || question.type !== "short-answer" || question.writtenMode !== "integrated") {
        errors.push(`${question.id}: released case must remain an examiner-only integrated written response`);
      }
      if (!question.caselet?.includes(released.prompt)) errors.push(`${question.id}: lost the exact released prompt`);
      if ((question.rubric || []).length < 5) errors.push(`${question.id}: rubric has fewer than five criteria`);
      if (String(question.exemplar || "").length < 400) errors.push(`${question.id}: exemplar is too thin for a ten-mark answer`);
    }
  }

  return {ok: errors.length === 0, errors, subjects, releasedQuestions: releasedBank.length};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditFinalSprints();
  for (const subject of report.subjects) {
    console.log(`${subject.courseId}: ${subject.questions} questions / ${subject.modules} modules / ${subject.types.join(", ")} / ${subject.rotationChanges} changed on repeat`);
  }
  console.log(`IBM released case: ${report.releasedQuestions}/10 questions`);
  if (report.errors.length) {
    for (const error of report.errors) console.error(`ERROR ${error}`);
    process.exitCode = 1;
  } else console.log("Accelerated Mini and released-case gate: PASS");
}
