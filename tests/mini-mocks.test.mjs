import assert from "node:assert/strict";
import test from "node:test";

import { auditMiniMocks } from "../tools/check-mini-mocks.mjs";

test("Speedrun cycles stay short, applied, rotating, and complete", () => {
  const report = auditMiniMocks();
  assert.deepEqual(report.errors, []);
  assert.equal(report.ok, true);
  for (const subject of report.subjects) {
    assert.equal(subject.questionsPerRound, 8);
    assert.ok(subject.rounds >= 1);
    assert.ok(subject.applicationFloor >= 6);
    assert.ok(subject.rotationChange.every((percent) => percent >= 35));
  }
});
