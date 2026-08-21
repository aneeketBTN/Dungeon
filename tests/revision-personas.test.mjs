import assert from "node:assert/strict";
import test from "node:test";

import {auditRevisionPersonas} from "../tools/check-revision-personas.mjs";

test("Speedruns and Minis hold for all three revision personas", () => {
  const report = auditRevisionPersonas();
  assert.deepEqual(report.errors, []);
  assert.equal(report.ok, true);
  assert.equal(report.subjects.length, 4);
  for (const subject of report.subjects) {
    assert.ok(subject.brilliantButLazy.longestOptionPct <= 30);
    assert.ok(subject.brilliantButLazy.fixedFirstPct <= 30);
    assert.equal(subject.brilliantButLazy.miniOptions, 0);
    assert.ok(subject.averageJoe.immediateTeaching >= 16);
    assert.equal(subject.averageJoe.miniPrompts, 8);
    assert.ok(subject.dumbButDiligent.speedrunRounds >= 2);
    assert.ok(subject.dumbButDiligent.miniAnswerWords <= 400);
  }
});
