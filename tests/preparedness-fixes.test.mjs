/* Regression coverage for the three-persona preparedness audit of 2026-08-20. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "app");
const context = { window: {}, atob: (value) => Buffer.from(value, "base64").toString("binary") };
vm.createContext(context);
for (const file of ["t6_lessons", "t6_diagnoses", "t6_brgsa", "t6_catalog", "t6_integrated", "t6_ibm_case", "t6_challenges"]) {
  vm.runInContext(fs.readFileSync(path.join(appDir, "sets", `${file}.js`), "utf8"), context, { filename: file });
}
const courses = context.window.T6_COURSES;
const lessons = context.window.T6_LESSONS;

test("all 283 registered lecture entries are scheduled by the eight-step course path", () => {
  assert.equal(Object.keys(lessons).length, 283);
  for (const [courseId, course] of Object.entries(courses)) {
    const modules = new Set(course.runs.filter((run) => run.module >= 1 && run.module <= 8).map((run) => run.module));
    const registered = Object.values(lessons).filter((lesson) => lesson.courseId === courseId);
    const unscheduled = registered.filter((lesson) => !modules.has(lesson.module));
    assert.equal(unscheduled.length, 0, `${courseId} leaves ${unscheduled.length} authored lecture entries readable-only`);
  }
  const app = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
  assert.match(app, /lessonIds:\s*moduleLessonIdsForStudySet\(courseId, definition\)/,
    "starting a module set must pass its complete lesson schedule into the session");
  assert.match(app, /lessonIds:\s*details\.lessonIds \|\| \[\]/,
    "the layered queue must receive the module lesson schedule");
});

test("module practice uses each paper's answer shape where that format exists", () => {
  for (const run of courses.IBM.runs.filter((item) => item.module <= 8)) {
    assert.deepEqual(Array.from(run.formatQuotas, (quota) => `${quota.type}:${quota.count}`), ["short-answer:4"]);
  }
  for (const run of courses.BRGSA.runs.filter((item) => item.module <= 8)) {
    assert.deepEqual(Array.from(run.formatQuotas, (quota) => quota.type).sort(), ["case-cloze", "short-answer"]);
  }
  for (const run of courses.SPMS.runs.filter((item) => item.module <= 8)) {
    assert.deepEqual(Array.from(run.formatQuotas, (quota) => `${quota.type}:${quota.count}`), ["msq:2"]);
  }
  const sclmNumericModules = Array.from(courses.SCLM.runs.filter((item) => item.module <= 8 && item.formatQuotas.length),
    (item) => item.module);
  assert.deepEqual(sclmNumericModules, [2, 3]);
});

test("authored cases explain the case that was actually shown", () => {
  const demand = courses.BRGSA.concepts.find((concept) => concept.id === "brgsa_m1_demand");
  const question = courses.BRGSA.questions.brgsa_m1_demand_case_cloze;
  assert.equal(question.explanation, demand.summary);
  assert.doesNotMatch(question.explanation, /contaminated|traffic|landing page/i,
    "demand validation feedback must not drift to a borrowed traffic case");
});

test("reported teaching contradictions are removed at their source", () => {
  const catalog = fs.readFileSync(path.join(appDir, "sets", "t6_catalog.js"), "utf8");
  assert.doesNotMatch(catalog, /model always sustains itself/i);
  assert.doesNotMatch(catalog, /measured by its strongest/i);
  assert.match(catalog, /10–12 million people enter the workforce/);
  assert.match(catalog, /5–6 million new jobs/);
});

test("SCLM mock matching questions no longer repeat one stem", () => {
  const matches = Object.values(courses.SCLM.questions).filter((question) => question.type === "match");
  assert.ok(new Set(matches.map((question) => question.stem)).size >= 5);
});

test("Learn keeps fresh cases available and coverage cycles retain paper craft", () => {
  const app = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
  const harness = fs.readFileSync(path.join(root, "tools", "export-persona-run.mjs"), "utf8");
  assert.match(app, /if \(nonReserved\.length >= count - selectedIds\.length\) candidates = nonReserved;/);
  assert.match(app, /leftReserved - rightReserved/,
    "written practice must prefer non-reserved cases when the repair target permits it");
  for (const [label, source] of [["app", app], ["persona harness", harness]]) {
    assert.match(source, /function takeLengthBalanced\(/, `${label} must use the same MCQ length-balancing selector`);
    assert.match(source, /longestOptionPayoff/, `${label} must measure the longest-option strategy while selecting`);
    assert.match(source, /moduleCoverage/, `${label} must preserve module breadth before length balancing`);
  }

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dungeon-preparedness-"));
  try {
    execFileSync(process.execPath, [path.join(root, "tools", "export-persona-run.mjs"), temp], { cwd: root });
    const expected = {
      SPMS: {sets: 3, concepts: 69},
      BRGSA: {sets: 4, concepts: 29},
      IBM: {sets: 7, concepts: 65},
      SCLM: {sets: 3, concepts: 36}
    };
    for (const [subject, target] of Object.entries(expected)) {
      const setNumbers = fs.readdirSync(temp).map((name) => {
        const match = new RegExp(`^${subject}-set(\\d+)\\.json$`).exec(name);
        return match ? Number(match[1]) : null;
      }).filter((value) => value != null).sort((a, b) => a - b);
      assert.deepEqual(setNumbers, Array.from({length: target.sets}, (_, index) => index + 1),
        `${subject} must stop at its measured complete coverage cycle`);
      const reached = new Set();
      for (const set of setNumbers) {
        const candidate = JSON.parse(fs.readFileSync(path.join(temp, `${subject}-set${set}.json`), "utf8"));
        const key = JSON.parse(fs.readFileSync(path.join(temp, `${subject}-set${set}.key.json`), "utf8"));
        assert.equal(candidate.instructions.coverageCycle.sets, target.sets);
        assert.equal(candidate.instructions.coverageCycle.paperRelevantConcepts, target.concepts);
        key.key.forEach((question) => [question.conceptId].concat(question.supportingConceptIds || [])
          .filter(Boolean).forEach((conceptId) => reached.add(conceptId)));
        const modules = new Set(key.key.flatMap((question) => question.sourceIds || [])
          .map((sourceId) => /-M(\d\d)-/.exec(sourceId))
          .filter(Boolean).map((match) => Number(match[1])));
        assert.equal(modules.size, 8, `${subject} set ${set} must retain all eight modules`);
      }
      assert.equal(reached.size, target.concepts,
        `${subject} coverage cycle must surface every paper-relevant concept`);
    }
    const strategies = execFileSync(process.execPath,
      [path.join(root, "tools", "run-persona-strategies.mjs"), temp, "--gate"],
      { cwd: root, encoding: "utf8" });
    assert.match(strategies, /"longest": 2[45]\.?\d*/,
      "fresh papers must keep the longest-option strategy around chance");
  } finally {
    if (temp.startsWith(os.tmpdir())) fs.rmSync(temp, { recursive: true, force: true });
  }
});

test("Examiner offers a separate Learn-evidence weakest-links diagnostic", () => {
  const app = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
  assert.match(app, /function buildWeakestLinksPaper\(courseId\)/);
  assert.match(app, /examWeaknessScore\(courseId, question\)/);
  assert.match(app, /conceptPriority\(courseId, concept\)\.score/,
    "the diagnostic must use Learn's existing evidence priority rather than mock scores");
  assert.match(app, /class='exam-set exam-set-weak'/);
  assert.match(app, /It changes when your Learn evidence changes, so it is not part of the common coverage cycle/);
  assert.match(app, /if \(analysis\.attempt\.setIndex === EXAM_WEAKEST_SET\)/,
    "dynamic diagnostic sittings must not be compared as if they were the same fixed paper");
});

test("mock confidence is optional, persisted for diagnosis, and submit uses an in-page dialog", () => {
  const app = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
  const html = fs.readFileSync(path.join(appDir, "t6.html"), "utf8");
  assert.match(app, /confidenceRecorded:\s*confidenceRecorded/);
  assert.match(app, /unsureCorrect:\s*unsureCorrect/);
  assert.match(app, /confidentWrong:\s*confidentWrong/);
  assert.match(html, /id="exam-submit-dialog"/);
  assert.doesNotMatch(app, /window\.confirm\(/,
    "native confirmation blocks deterministic browser use and cannot carry the app's accessible flow");
  assert.doesNotMatch(app, /leavingLivePaperRefused/,
    "all dashboard exits must use the in-page requestLeaveLivePaper flow");
});

test("linked-question repairs follow the concept that failed", () => {
  const app = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
  assert.match(app, /function ensureReattempt\(question, reason, targetConceptId\)/);
  assert.match(app, /evaluation\.conceptResults\[conceptId\] === false/);
  assert.match(app, /questionSurfaces\(session\.courseId, targetConceptId\)/);
});
