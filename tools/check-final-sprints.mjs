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
  const ids = new Set();

  for (const courseId of expectedSubjects) {
    const course = win.T6_COURSES?.[courseId];
    const pack = win.T6_FINAL_SPRINTS?.[courseId];
    if (!course || !pack) {
      errors.push(`${courseId}: missing course or final-sprint pack`);
      continue;
    }
    if (pack.questions?.length !== 8) errors.push(`${courseId}: expected 8 questions, got ${pack.questions?.length ?? 0}`);
    const modules = new Set();
    for (const question of pack.questions || []) {
      if (!question.id || ids.has(question.id)) errors.push(`${courseId}: missing or duplicate id ${question.id || "(blank)"}`);
      ids.add(question.id);
      modules.add(question.module);
      if (String(question.prompt || "").length < 100) errors.push(`${question.id}: prompt is too thin for a self-contained retrieval task`);
      if (String(question.answer || "").length < 220) errors.push(`${question.id}: answer spine is too thin to teach the decision`);
      if (String(question.check || "").length < 80) errors.push(`${question.id}: final check is too thin to catch a near-miss`);
      if (!question.conceptIds?.length) errors.push(`${question.id}: carries no concept`);
      for (const conceptId of question.conceptIds || []) {
        const concept = course.concepts.find((entry) => entry.id === conceptId);
        if (!concept) errors.push(`${question.id}: unknown concept ${conceptId}`);
        else if (concept.module !== question.module) errors.push(`${question.id}: ${conceptId} belongs to module ${concept.module}, not ${question.module}`);
      }
    }
    const moduleList = [...modules].sort((a, b) => a - b).join(",");
    if (moduleList !== "1,2,3,4,5,6,7,8") errors.push(`${courseId}: module coverage is ${moduleList || "empty"}`);
    if (pack.traps?.length !== 3) errors.push(`${courseId}: expected exactly three last-minute traps`);
    subjects.push({courseId, questions: pack.questions?.length || 0, modules: modules.size});
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
  for (const subject of report.subjects) console.log(`${subject.courseId}: ${subject.questions} questions / ${subject.modules} modules`);
  console.log(`IBM released case: ${report.releasedQuestions}/10 questions`);
  if (report.errors.length) {
    for (const error of report.errors) console.error(`ERROR ${error}`);
    process.exitCode = 1;
  } else console.log("Final revision and released-case gate: PASS");
}
