/*
 * Does the runner actually run every test in this directory?
 *
 * WHY THIS FILE EXISTS
 * `npm test` does not discover tests. It names them, one path at a time, in
 * `package.json`'s `test` script. That list has drifted from the directory twice, in
 * both possible directions, and **neither drift produced a failure**:
 *
 *   - 2026-08-15 — two files were listed BEFORE they existed. The runner skipped
 *     them and exited 0. Found while counting tests, not by any check.
 *   - 2026-08-19 — `tests/taught-not-tested.test.mjs` existed, passed 5/5 when run
 *     by hand, and was absent from the list. It had never run in CI. The gate it
 *     asserts — the mirror of LAW-47, the one that keeps the fourth promise honest —
 *     was therefore unguarded for as long as it had existed. Found while wiring it
 *     up, again not by a check.
 *
 * A test that never runs is indistinguishable from a test that passes: both are
 * silence. That is this repository's signature failure (LAW-67) applied to the
 * runner itself, so the backstop belongs here rather than in a habit.
 *
 * WHAT IT ASSERTS
 * Set equality, both directions, between `tests/*.test.mjs` on disk and the paths
 * named in the `test` script — plus a floor on the population, because an empty
 * glob would satisfy both directions trivially and print exactly the same green
 * line. That floor is the LAW-67 lesson: a check must name a non-zero number of
 * things judged.
 *
 * WHAT IT DOES NOT ASSERT
 * Nothing about whether a test is any good, or whether it can fail. A listed,
 * running, vacuous test still passes this. It only closes the gap between the
 * directory and the runner.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const packageJsonPath = path.join(repoRoot, "package.json");

/* The smallest population that is obviously not an accident. It exists so a
 * broken glob or a renamed directory fails loudly instead of passing over zero
 * files; it is not a target and should never be raised to match the count. */
const MIN_EXPECTED_TEST_FILES = 8;

function testFilesOnDisk() {
  return fs
    .readdirSync(here)
    .filter((name) => name.endsWith(".test.mjs"))
    .sort();
}

function testFilesInRunner() {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const script = pkg.scripts?.test ?? "";
  return script
    .split(/\s+/)
    .filter((token) => token.endsWith(".test.mjs"))
    .map((token) => path.basename(token))
    .sort();
}

test("the runner judges a real population, not an empty one", () => {
  const onDisk = testFilesOnDisk();
  assert.ok(
    onDisk.length >= MIN_EXPECTED_TEST_FILES,
    `found ${onDisk.length} test files in ${here}, expected at least ` +
      `${MIN_EXPECTED_TEST_FILES}. Either the directory moved or this check is ` +
      `reading the wrong place — both make the assertions below meaningless.`,
  );

  const inRunner = testFilesInRunner();
  assert.ok(
    inRunner.length >= MIN_EXPECTED_TEST_FILES,
    `package.json's test script names ${inRunner.length} test files, expected at ` +
      `least ${MIN_EXPECTED_TEST_FILES}. A script that names nothing exits 0.`,
  );
});

test("every test file on disk is named in package.json's test script", () => {
  const unrun = testFilesOnDisk().filter((name) => !testFilesInRunner().includes(name));

  assert.deepEqual(
    unrun,
    [],
    `these test files exist and never run — npm test does not discover tests, it ` +
      `names them:\n  ${unrun.join("\n  ")}\n` +
      `Add each to "scripts.test" in package.json. A test that never runs looks ` +
      `exactly like a test that passes.`,
  );
});

test("every test file named in the script exists on disk", () => {
  const onDisk = testFilesOnDisk();
  const missing = testFilesInRunner().filter((name) => !onDisk.includes(name));

  assert.deepEqual(
    missing,
    [],
    `package.json names test files that do not exist:\n  ${missing.join("\n  ")}\n` +
      `node --test skips a path it cannot find and still exits 0, so this reads as ` +
      `a pass. Create the file or remove the path.`,
  );
});
