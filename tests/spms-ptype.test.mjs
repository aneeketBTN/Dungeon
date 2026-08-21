import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadBank() {
  const context = {window:{}, atob:(value) => Buffer.from(value, "base64").toString("binary")};
  vm.createContext(context);
  for (const file of ["t6_lessons.js", "t6_diagnoses.js", "t6_brgsa.js", "t6_catalog.js", "t6_integrated.js", "t6_ibm_case.js", "t6_challenges.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, "app", "sets", file), "utf8"), context, {filename:file});
  }
  return context.window.T6_COURSES;
}

function extractedFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0) {
      return Function(`return (${source.slice(start, index + 1)});`)();
    }
  }
  throw new Error(`${name} is unbalanced`);
}

test("every SPMS Section B item is an exactly-two P-type question", () => {
  const courses = loadBank();
  const questions = Object.values(courses.SPMS.questions).filter((question) => question.type === "msq");
  assert.equal(questions.length, 28);
  assert.ok(questions.every((question) => question.answers.length === 2));
  assert.ok(new Set(questions.map((question) => question.answers.slice().sort().join(","))).size >= 5);
});

test("P-type scoring is exactly 2 / 1 / 0", () => {
  const source = fs.readFileSync(path.join(root, "app", "t6.js"), "utf8");
  const score = extractedFunction(source, "scorePTypeSelection");
  const answers = [0, 1];
  assert.equal(score([], answers).awarded, 0);
  assert.equal(score([0], answers).awarded, 1);
  assert.equal(score([2], answers).awarded, 0);
  assert.equal(score([0, 1], answers).awarded, 2);
  assert.equal(score([0, 2], answers).awarded, 0);
  assert.equal(score([2, 3], answers).awarded, 0);
});

test("learning and full-mock controls enforce the two-selection cap and clearing", () => {
  const source = fs.readFileSync(path.join(root, "app", "t6.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "app", "t6.html"), "utf8");
  assert.match(source, /else if \(chosen\.length < 2\) chosen\.push\(index\)/);
  assert.match(source, /else if \(chosen\.length < 2\) chosen\.push\(choice\)/);
  assert.match(source, /clear\.textContent = "Clear response"/);
  assert.match(html, /id="exam-clear"/);
  assert.match(source, /one correct with no wrong option = 1; any wrong option = 0/i);
});
