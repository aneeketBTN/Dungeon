/*
 * Assert the taught-not-tested GATE, not just the number it prints.
 *
 * WHY THIS FILE EXISTS
 * This repository has shipped a gate that printed a pass over data it never judged
 * more than once — LAW-67 (`--gate` consumed as a directory, so a subject passed over
 * an empty report) and the T5 floors that skipped every run. A coverage-shaped gate is
 * especially easy to break that way, because "0 ideas checked" and "0 ideas missing"
 * produce the same green line.
 *
 * So these exercise it in BOTH directions: it must pass on the real bank at today's
 * floors, and it must FAIL when a floor is raised above what the bank reaches. A gate
 * never demonstrated failing is a gate nobody has tested — the argument LAW-75 makes
 * about the lesson-lecture matcher, which reported PASS on its own regression case
 * twice during construction.
 *
 * They also pin the triage correction: "Return on assets" must NOT read as naming
 * drift. The first implementation asked whether each distinctive word appeared
 * anywhere in the subject's bank, so two common words in unrelated questions were
 * enough to call a genuine hole a wording problem.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { triage } from "../tools/check-taught-not-tested.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const TOOL = path.join(ROOT, "tools", "check-taught-not-tested.mjs");
const FLOORS = path.join(ROOT, "data", "syllabus", "tested-floors.json");

function run(args, { expectFail = false } = {}) {
  try {
    const out = execFileSync(process.execPath, [TOOL, ...args], { encoding: "utf8" });
    if (expectFail) assert.fail("expected a non-zero exit, got success");
    return out;
  } catch (error) {
    if (!expectFail) throw error;
    return String(error.stdout || "") + String(error.stderr || "");
  }
}

test("the gate passes on the real bank at the recorded floors", () => {
  const out = run(["--gate"]);
  assert.match(out, /TAUGHT-NOT-TESTED GATE: PASS/);
});

test("it judges a real population, not an empty one", () => {
  const out = run([]);
  /* 359 named ideas across four subjects when this was written. If the term files are
   * ever emptied or unreadable, this is the assertion that refuses the green line. */
  const total = /ALL\s+\d+\s+\d+\s+(\d+)\s+(\d+)/.exec(out);
  assert.ok(total, "no ALL row in the report");
  assert.ok(Number(total[1]) > 300, `only ${total[1]} ideas checked — the term lists look empty`);
  assert.ok(Number(total[2]) > 0, "no ideas reached at all — the bank looks unloaded");
});

test("it fails when a floor is raised above what the bank reaches", () => {
  const original = fs.readFileSync(FLOORS, "utf8");
  const raised = JSON.parse(original);
  /* Use an impossible value rather than a live subject percentage. IBM reached
     100% when its authored assessment taxonomy landed, which made the old
     `IBM = 100` fixture stop testing failure at all. */
  raised.floors.IBM = 101;
  const backup = path.join(os.tmpdir(), `tested-floors-${process.pid}.json`);
  fs.writeFileSync(backup, original, "utf8");
  try {
    fs.writeFileSync(FLOORS, JSON.stringify(raised, null, 2), "utf8");
    const out = run(["--gate"], { expectFail: true });
    assert.match(out, /TAUGHT-NOT-TESTED GATE: FAIL/);
    assert.match(out, /IBM: \d+% is below its floor of 101%/);
  } finally {
    fs.writeFileSync(FLOORS, original, "utf8");
    fs.rmSync(backup, { force: true });
  }
  /* The floors file must be byte-identical afterwards, or a failed run of this test
   * silently rewrites a tracked file — which is how LAW-74 shipped a whole-file
   * line-ending change once already. */
  assert.equal(fs.readFileSync(FLOORS, "utf8"), original);
});

test("triage measures per question, not across the corpus", () => {
  /* This used to assert against a live syllabus term — "Return on assets", which the
   * bank did not name on the day the test was written. It broke the moment a concept
   * record named it, which is a test calibrated on the population it polices. The
   * property under test is the RULE, so it is now asserted against synthetic input
   * and cannot go stale as authoring lands.
   *
   * The rule: every distinctive word of the term must land in ONE question before a
   * miss reads as naming drift. Per-corpus matching called "Return on assets" drift
   * because "return" appeared 7 times and "assets" 5 times in unrelated items. */
  const forms = ["Return on assets"];
  assert.equal(
    triage(["the return was strong this quarter", "assets were revalued at year end"], forms),
    "partial",
    "words spread across different questions must not read as drift"
  );
  assert.equal(
    triage(["which assets return the most cash", "an unrelated question"], forms),
    "drift",
    "every distinctive word inside one question, in another order, is drift"
  );
  assert.equal(triage(["a question about freight rates"], forms), "absent");
});

test("the matcher stays phrase-contiguous and whole-word", () => {
  /* The three bugs coverage-floors.json records, asserted here so a rewrite of this
   * tool's matcher cannot quietly reintroduce them. */
  const source = fs.readFileSync(TOOL, "utf8");
  assert.match(source, /\\\\b\$\{body\}\(\?:e\?s\)\?\\\\b/, "phrase pattern is no longer whole-word anchored");
  assert.match(source, /join\("\\\\s\+"\)/, "phrase pattern is no longer contiguous");
});
