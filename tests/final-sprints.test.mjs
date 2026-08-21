import assert from "node:assert/strict";
import test from "node:test";

import {auditFinalSprints} from "../tools/check-final-sprints.mjs";

test("last-minute Minis cover every subject and module with grounded answer spines", () => {
  const report = auditFinalSprints();
  assert.deepEqual(report.errors, []);
  assert.equal(report.ok, true);
  assert.equal(report.subjects.length, 4);
  assert.ok(report.subjects.every((subject) => subject.questions === 8 && subject.modules === 8));
});

test("the released IBM brief remains a ten-lens fixed written case", () => {
  const report = auditFinalSprints();
  assert.equal(report.releasedQuestions, 10);
  assert.equal(report.ok, true);
});
