/*
 * Assert the taught-vocabulary gate, in both directions.
 *
 * The gate is a ratchet over a recorded backlog, which is the shape most likely to rot
 * quietly: a baseline that silently absorbs new violations, or one that keeps entries
 * it has already cleared, both print green. So these tests check that it fails when a
 * new untaught term appears AND when the baseline goes stale — the two ways a ratchet
 * stops measuring anything.
 *
 * The RICE case is pinned by name because it is the finding that motivated the tool:
 * 13 questions test an idea the course teaches in its module 7 revision sheet and no
 * lesson mentions, and LAW-47 passes over it because the citation resolves.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOOL = path.join(ROOT, "tools", "check-taught-vocabulary.mjs");
const BASELINE = path.join(ROOT, "data", "syllabus", "taught-vocabulary-baseline.json");
const ALLOWLIST = path.join(ROOT, "data", "syllabus", "taught-vocabulary-allowlist.json");

function run(args = []) {
  try {
    return { code: 0, stdout: execFileSync(process.execPath, [TOOL, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }) };
  } catch (error) {
    return { code: error.status ?? 1, stdout: (error.stdout || "") + (error.stderr || "") };
  }
}

function report() {
  const { code, stdout } = run(["--json"]);
  assert.equal(code, 0);
  return JSON.parse(stdout).report;
}

test("the gate passes against its recorded baseline", () => {
  const { code, stdout } = run(["--gate"]);
  assert.match(stdout, /TAUGHT VOCABULARY GATE: PASS/);
  assert.equal(code, 0);
});

test("every subject is measured, and over real questions", () => {
  const entries = report();
  assert.equal(entries.length, 4, "all four subjects must be checked");
  for (const entry of entries) {
    assert.ok(entry.questionsChecked > 100, `${entry.courseId} checked only ${entry.questionsChecked} questions — did the bank load?`);
  }
});

/* The three ideas fix A3 authored. This is the regression guard for that work: each
 * was tested by SPMS questions and taught by no SPMS lesson, which is the defect the
 * whole tool exists to catch, and RICE alone accounted for 13 questions. If any of
 * them reappears in the report, the teaching has been edited out from under the bank. */
test("the ideas A3 authored are taught, and stay taught", () => {
  const spms = report().find((entry) => entry.courseId === "SPMS");
  const reported = new Set(spms.rows.map((row) => row.term));
  for (const term of ["RICE", "Traceability", "Vanity metrics"]) {
    assert.ok(
      !reported.has(term),
      `${term} must be taught by an SPMS lesson — it was authored in 2026-08-17 fix A3 and is tested by scored questions`
    );
  }
});

/* The fixture is DERIVED, not named.
 *
 * Two earlier versions of this test hardcoded a backlog term — first RICE, then
 * "Marginal cost" — and both were taught within the same day's authoring, so the test
 * failed for the best possible reason and had to be rewritten twice. A guard on the
 * ratchet must not break every time the backlog shrinks, which is the whole point of
 * the backlog. So it takes whatever term the report currently carries. */
test("the gate fails when a new untaught term appears", (t) => {
  const original = fs.readFileSync(BASELINE, "utf8");
  t.after(() => fs.writeFileSync(BASELINE, original));

  const entries = report();
  const withRows = entries.find((entry) => entry.rows.length);
  assert.ok(withRows, "no untaught vocabulary anywhere — this test needs a live entry to drop");
  const dropped = withRows.rows[0].term;

  const baseline = JSON.parse(original);
  baseline.accepted[withRows.courseId] = (baseline.accepted[withRows.courseId] || [])
    .filter((term) => term.toLowerCase() !== dropped.toLowerCase());
  fs.writeFileSync(BASELINE, JSON.stringify(baseline, null, 2));

  const { code, stdout } = run(["--gate"]);
  assert.match(stdout, /FAIL — new untaught vocabulary/);
  assert.ok(stdout.includes(dropped), `the gate should name the term it caught (${dropped})`);
  assert.notEqual(code, 0);
});

test("the gate fails when the baseline keeps an entry it has already cleared", (t) => {
  const original = fs.readFileSync(BASELINE, "utf8");
  t.after(() => fs.writeFileSync(BASELINE, original));

  const baseline = JSON.parse(original);
  baseline.accepted.SPMS = [...baseline.accepted.SPMS, "Lean Canvas"]; // taught; must not sit in the backlog
  fs.writeFileSync(BASELINE, JSON.stringify(baseline, null, 2));

  const { code, stdout } = run(["--gate"]);
  assert.match(stdout, /the baseline is stale/);
  assert.notEqual(code, 0);
});

/* Tests the allowlist MECHANISM with a synthetic entry rather than a real one.
 *
 * The first version broke the real "Shared value" entry and asserted the violation
 * returned. That entry stopped being load-bearing once IBM reached full coverage and
 * the term resolved through a syllabus alias instead, so the test failed while the
 * mechanism was working perfectly. Which real entries carry weight changes as content
 * lands; the mechanism does not. */
test("an allowlist entry suppresses a violation only while its taughtAs is real", (t) => {
  const original = fs.readFileSync(ALLOWLIST, "utf8");
  t.after(() => fs.writeFileSync(ALLOWLIST, original));

  const before = report();
  const subject = before.find((entry) => entry.rows.length);
  assert.ok(subject, "need at least one reported term to exercise the allowlist");
  const term = subject.rows[0].term;

  const write = (taughtAs) => {
    const allowlist = JSON.parse(original);
    allowlist.entries.push({
      courseId: subject.courseId,
      term,
      taughtAs,
      reason: "Synthetic entry written by tests/taught-vocabulary.test.mjs; restored afterwards.",
    });
    fs.writeFileSync(ALLOWLIST, JSON.stringify(allowlist, null, 2));
  };

  // A taughtAs the lessons genuinely contain: the violation should disappear.
  write(["the"]);
  const suppressed = report().find((e) => e.courseId === subject.courseId);
  assert.ok(!suppressed.rows.some((r) => r.term === term), `allowlisting "${term}" with a real name should suppress it`);

  // A taughtAs no lesson uses: the entry must stop holding and the violation return.
  write(["a name no lesson uses anywhere at all"]);
  const restored = report().find((e) => e.courseId === subject.courseId);
  assert.ok(restored.rows.some((r) => r.term === term), "an allowlist entry whose taughtAs is absent must not suppress anything");
});

test("every allowlist entry states a reason", () => {
  const allowlist = JSON.parse(fs.readFileSync(ALLOWLIST, "utf8"));
  for (const entry of allowlist.entries) {
    assert.ok(entry.reason && entry.reason.length > 30, `allowlist entry "${entry.term}" needs a real reason`);
    assert.ok((entry.taughtAs || []).length, `allowlist entry "${entry.term}" must say what the lesson calls it`);
  }
});
