import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const appDir = path.join(root, "app");

function loadRelease() {
  const context = {window: {}, atob: (value) => Buffer.from(value, "base64").toString("binary")};
  vm.createContext(context);
  for (const file of [
    "t6_lessons.js", "t6_diagnoses.js", "t6_brgsa.js", "t6_catalog.js",
    "t6_integrated.js", "t6_ibm_case.js", "t6_challenges.js", "t6_paper_pattern.js"
  ]) {
    vm.runInContext(fs.readFileSync(path.join(appDir, "sets", file), "utf8"), context, {filename:file});
  }
  return context.window;
}

test("SPMS-derived paper-pattern revision gives every BRGSA concept one direct question", () => {
  const win = loadRelease();
  const pack = win.T6_PAPER_PATTERN;
  const built = pack.build("BRGSA");
  const courseConceptIds = Array.from(win.T6_COURSES.BRGSA.concepts, (concept) => concept.id).sort();

  assert.equal(pack.sourceCourse, "SPMS");
  assert.deepEqual(Array.from(pack.availableCourseIds), ["BRGSA"]);
  assert.equal(pack.build("SPMS"), null);
  assert.equal(built.version, "brgsa-direct-1");
  assert.equal(built.questionIds.length, 29);
  assert.equal(new Set(built.questionIds).size, 29);
  assert.deepEqual(Array.from(built.conceptIds).sort(), courseConceptIds);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8].map((module) => built.modules.filter((value) => value === module).length), [4, 4, 3, 3, 3, 4, 4, 4]);
  assert.ok(new Set(built.route.map((step) => step.family)).size >= 7);
  assert.ok(built.questions.every((question) =>
    question.type === "mcq" && question.difficulty === 1 && question.options.length === 4 &&
    !question.caselet && !question.blanks && question.explanation && question.sourceIds?.length === 1 &&
    question.stem.trim().split(/\s+/).length <= 16 && pack.question("BRGSA", question.id) === question));
  assert.ok(built.questions.every((question) => !win.T6_COURSES.BRGSA.questions[question.id]), "revision-only questions must not inflate the Learn bank");
  const answerPositions = [0, 1, 2, 3].map((position) => built.questions.filter((question) => question.answer === position).length);
  assert.deepEqual(answerPositions, [7, 7, 8, 7]);
});

test("Examiner states the claim boundary and provides DEAL and PACER writing guides", () => {
  const html = fs.readFileSync(path.join(appDir, "t6.html"), "utf8");
  const app = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");

  assert.match(html, /id="exam-paper-pattern"/);
  assert.match(html, /SPMS-derived · BRGSA first/);
  assert.match(html, /not as a prediction/);
  assert.match(html, /29 questions/);
  assert.match(html, /Every BRGSA concept/);
  assert.match(html, /Section B · 4 × 5 marks/);
  assert.match(html, /Case answer: DEAL/);
  assert.match(html, /Section C · 2 × 10 marks/);
  assert.match(html, /Descriptive answer: PACER/);
  assert.match(html, /Interpret[\s\S]*Distinguish[\s\S]*Recommend[\s\S]*Evaluate \/ justify/);
  assert.match(app, /kind:"paper-pattern"/);
  assert.match(app, /paperPatternVersion/);
  assert.match(app, /T6_PAPER_PATTERN\.question/);
  assert.match(app, /classList\.toggle\("is-paper-pattern", session\.kind === "paper-pattern"\)/);
  assert.match(app, /session\.kind === "paper-pattern" \? ""/);
  assert.match(app, /!isRevisionSprint\(session\)\) recordAttempt/);
});
