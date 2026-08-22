import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, "..", "app");
const files = [
  "t6_lessons.js", "t6_diagnoses.js", "t6_brgsa.js", "t6_catalog.js",
  "t6_integrated.js", "t6_ibm_case.js", "t6_challenges.js",
];

function loadBank() {
  const win = { window: null, structuredClone: global.structuredClone };
  win.window = win;
  const context = vm.createContext({ window: win, console, structuredClone: global.structuredClone });
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(appDir, "sets", file), "utf8"), context, { filename: file });
  }
  return { courses: win.T6_COURSES, lessons: win.T6_LESSONS };
}

const bank = loadBank();
const courses = bank.courses;
const lessons = bank.lessons;
const app = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
const html = fs.readFileSync(path.join(appDir, "t6.html"), "utf8");

function chamberPool(courseId, module) {
  return Object.values(courses[courseId].questions).filter((question) =>
    question.module === module && !question.examOnly && !question.releasedCase);
}

test("Study replaces the separate Learn and Notes front doors", () => {
  assert.match(html, /id="mode-learn"[\s\S]*?<span>Study<\/span>/);
  assert.doesNotMatch(html, /id="mode-notes"/);
  assert.match(app, /else openNotes\(\{courseId:profile\.selectedCourse\}\)/);
  assert.match(app, /crossProducts\("learn", function \(\) \{ renderNotes\(\); showScreen\("notes-screen"\); \}\)/);
});

test("Study introduces assessed ideas and methods at their source lectures", () => {
  const concepts = Object.values(courses).flatMap((course) => course.concepts);
  assert.equal(concepts.length, 219);
  for (const concept of concepts) {
    assert.ok(lessons[concept.source], `${concept.id} has no exact source lecture`);
  }

  assert.doesNotMatch(app, /function notesConceptMapHtml|Start with the map/);
  assert.match(app, /function notesConceptAnchorHtml\(entry\)/);
  assert.match(app, /concept\.source === entry\.lectureId/);
  assert.match(app, /function notesMethodsHtml\(entry\)/);
  assert.match(app, /method\.source === entry\.lectureId/);
  assert.match(app, /lessons\.map\(notesLessonHtml\)\.join\(""\) \+ notesReleasedCaseHtml\(courseId, module\) \+ ending/);
  assert.match(app, /class='notes-key-terms'/);
  assert.match(app, /class='notes-context notes-context--next'/);
  assert.match(app, /<b>Case\.<\/b>/);
  assert.match(app, /<b>Answer\.<\/b>/);
  assert.match(app, /<summary>Why this answer works<\/summary>/);
  assert.match(lessons["BRGSA-M03-L03"].worked.setup, /Blended CAC rises from ₹3,200 to ₹4,100/);
  assert.match(lessons["BRGSA-M07-L05"].worked.move, /₹9,000 ÷ ₹600 = 15 months/);

  const methodHomes = [
    ["BRGSA-M02-L04", "Experiment numbers without fooling yourself"],
    ["BRGSA-M03-L04", "Growth rates, cohorts, CAC, LTV, and payback"],
    ["BRGSA-M04-L04", "Find a constraint from a funnel"],
    ["SCLM-M02-L06", "Forecasting and exponential smoothing"],
    ["SCLM-M03-L03", "EOQ and the annual cost at an order quantity"],
    ["SCLM-M03-L05", "Newsvendor and the critical ratio"],
    ["SCLM-M03-L06", "Safety stock, reorder point, and service level"],
    ["SCLM-M06-L07", "Cycle time, waiting, and throughput"],
    ["SPMS-M04-L07", "Market size and unit economics without false precision"],
    ["SPMS-M07-L01", "RICE and cost-value prioritisation"],
    ["IBM-M08-L04", "Use numbers as evidence in a written case"],
  ];
  for (const [source, title] of methodHomes) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(app, new RegExp(`source: "${source}"[\\s\\S]{0,80}title: "${escapedTitle}"`));
  }
});

test("every IBM module can supply the four direct chamber shapes", () => {
  for (let module = 1; module <= 8; module += 1) {
    const pool = chamberPool("IBM", module);
    for (const perspective of ["explain", "apply", "connect"]) {
      assert.ok(pool.some((question) => (question.type || "mcq") === "mcq" && question.perspective === perspective),
        `IBM module ${module} has no direct ${perspective} choice`);
    }
    const paragraphs = pool.filter((question) =>
      question.type === "short-answer" && question.pattern === "Case-based written response");
    assert.ok(paragraphs.length, `IBM module ${module} has no bounded case paragraph`);
    assert.ok(paragraphs.every((question) => /^Using .+, what should be done\? Give the decision first, then use one case fact/.test(question.stem)),
      `IBM module ${module} case paragraph does not name the framework and bound the direct answer parts`);
  }
});

test("every SCLM module can supply three direct checks and one honest paper-format check", () => {
  for (let module = 1; module <= 8; module += 1) {
    const pool = chamberPool("SCLM", module);
    for (const perspective of ["explain", "apply", "connect"]) {
      assert.ok(pool.some((question) => (question.type || "mcq") === "mcq" && question.perspective === perspective),
        `SCLM module ${module} has no direct ${perspective} choice`);
    }
    const paperFormat = pool.filter((question) => question.type === (pool.some((row) => row.type === "numeric") ? "numeric" : "match"));
    assert.ok(paperFormat.length, `SCLM module ${module} cannot fill its fourth chamber slot`);
  }
});

test("every SPMS module can supply three direct checks and one exact P-type check", () => {
  for (let module = 1; module <= 8; module += 1) {
    const pool = chamberPool("SPMS", module);
    for (const perspective of ["explain", "apply", "connect"]) {
      assert.ok(pool.some((question) => (question.type || "mcq") === "mcq" && question.perspective === perspective),
        `SPMS module ${module} has no direct ${perspective} choice`);
    }
    const pTypes = pool.filter((question) => question.type === "msq");
    assert.ok(pTypes.length, `SPMS module ${module} has no P-type check`);
    assert.ok(pTypes.every((question) => question.answers.length === 2),
      `SPMS module ${module} includes a P-type item without exactly two correct answers`);
  }
});

test("every BRGSA module can supply direct recall, two applications, and one case recommendation", () => {
  for (let module = 1; module <= 8; module += 1) {
    const pool = chamberPool("BRGSA", module);
    assert.ok(pool.some((question) => (question.type || "mcq") === "mcq" && question.perspective === "explain"),
      `BRGSA module ${module} has no direct recall choice`);
    assert.ok(pool.filter((question) => (question.type || "mcq") === "mcq" && question.perspective === "apply").length >= 2,
      `BRGSA module ${module} cannot supply two applied choices`);
    assert.ok(pool.some((question) => question.type === "short-answer" && question.pattern === "Case-based written response"),
      `BRGSA module ${module} has no bounded case recommendation`);
  }
});

test("the Study footer renders a four-question chamber after every subject module", () => {
  const chamberSource = app.slice(app.indexOf("function moduleChamberQuestionIds"), app.indexOf("function printNotes"));
  assert.doesNotMatch(chamberSource, /\["IBM", "SCLM"\]\.indexOf\(courseId\) < 0/);
  assert.match(app, /SPMS: \["Definition", "Choose the decision", "Connect the idea", "One P-type · select two"\]/);
  assert.match(app, /BRGSA: \["Direct recall", "Choose the decision", "Interpret a result", "One case recommendation"\]/);
  assert.match(app, /class='notes-module-end'/);
  assert.match(app, /notesReleasedCaseHtml\(courseId, module\) \+ ending/);
});

test("the SCLM numerical bank covers the calculation families the course actually teaches", () => {
  const numericals = Object.values(courses.SCLM.questions).filter((question) => question.type === "numeric");
  assert.equal(numericals.length, 20);
  assert.ok(numericals.every((question) => question.stem === question.prompt),
    "the paper stem must show the authored calculation task");
  assert.ok(numericals.every((question) => question.caselet !== question.stem),
    "the numerical must not repeat its scenario where the task belongs");
  assert.deepEqual([...new Set(numericals.map((question) => question.module))].sort(), [2, 3, 6, 7, 8]);
  assert.deepEqual([...new Set(numericals.map((question) => question.source))].sort(), [
    "SCLM-M02-L06", "SCLM-M03-L03", "SCLM-M03-L05", "SCLM-M03-L06", "SCLM-M06-L07",
    "SCLM-M07-L01", "SCLM-M07-L06", "SCLM-M08-L02",
  ]);
  assert.match(app, /title: "Forecasting and exponential smoothing"/);
  assert.match(app, /title: "EOQ and the annual cost at an order quantity"/);
  assert.match(app, /title: "Newsvendor and the critical ratio"/);
  assert.match(app, /title: "Safety stock, reorder point, and service level"/);
  assert.match(app, /title: "Cycle time, waiting, and throughput"/);
  assert.match(app, /title: "Material balance, shipment stock, and landed cost"/);
  assert.match(app, /title: "Time-window and route-capacity arithmetic"/);
});

test("chambers diagnose without confidence tax or hidden same-run reattempts", () => {
  assert.match(app, /session\.queue\.forEach\(function \(item\) \{ item\.askConfidence = false; \}\)/);
  assert.match(app, /scheduled = session\.kind !== "module-chamber" && ensureReattempt/g);
  assert.match(app, /recordModuleChamberProgress\(completedSession, percent\)/);
  assert.match(app, /Nothing was scored or queued from this paragraph/);
  assert.match(app, /Correct in this sample\. No additional work was queued\./);
  assert.match(app, /Save and return to Study module/);
  assert.match(app, /data-repair-concept/);
  assert.match(app, /Retest with a rotated sample/);
});
