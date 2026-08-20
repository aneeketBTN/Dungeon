/*
 * Assert the syllabus-coverage gate, not just the coverage.
 *
 * WHY THIS FILE EXISTS
 * This repository has twice shipped a gate that printed a pass over data it never
 * judged — LAW-67 (`--gate` consumed as a directory, so T3 passed over an empty
 * report) and the T5 floors that skipped every run. A coverage gate is especially
 * easy to break that way, because "0 terms checked" and "0 terms missing" produce
 * the same green line.
 *
 * So these tests exercise the gate in BOTH directions: it must pass on the real
 * lesson layer, and it must fail when coverage drops or when the term list empties.
 *
 * They also pin the three matching bugs found while the baseline was taken, each of
 * which inflated coverage and each of which would silently return if the matcher were
 * rewritten:
 *   - substring matching ("rice" inside "price")
 *   - scattered-token matching (four common words matching four unrelated sentences)
 *   - interior function words dropped ("Jobs to Be Done" -> "jobs done")
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOOL = path.join(ROOT, "tools", "measure-syllabus-coverage.mjs");
const SYLLABUS_DIR = path.join(ROOT, "data", "syllabus");
const FLOORS = path.join(SYLLABUS_DIR, "coverage-floors.json");

function run(args = [], options = {}) {
  try {
    const stdout = execFileSync(process.execPath, [TOOL, ...args], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      ...options,
    });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.status ?? 1, stdout: (error.stdout || "") + (error.stderr || "") };
  }
}

function report() {
  const { code, stdout } = run(["--json"]);
  assert.equal(code, 0, "--json should exit 0");
  return JSON.parse(stdout);
}

test("every subject has a term list and a recorded floor", () => {
  const floors = JSON.parse(fs.readFileSync(FLOORS, "utf8")).floors;
  const { results } = report();
  assert.ok(results.length >= 4, `expected all four subjects, got ${results.length}`);
  for (const result of results) {
    assert.ok(result.total > 0, `${result.courseId} has an empty term list`);
    assert.ok(
      Object.prototype.hasOwnProperty.call(floors, result.courseId),
      `${result.courseId} has no floor in coverage-floors.json`
    );
  }
});

test("the gate passes on the committed lesson layer", () => {
  const { code, stdout } = run(["--gate"]);
  assert.match(stdout, /SYLLABUS COVERAGE GATE: PASS/);
  assert.equal(code, 0);
});

test("the gate fails when a floor is raised above actual coverage", (t) => {
  const original = fs.readFileSync(FLOORS, "utf8");
  t.after(() => fs.writeFileSync(FLOORS, original));

  // 101, not 100: every subject reached 100% on 2026-08-17, so a floor of 100 is
  // satisfied and this test would pass for the wrong reason. The fixture has to be
  // a floor that cannot be met however good the teaching gets.
  const floors = JSON.parse(original);
  for (const key of Object.keys(floors.floors)) floors.floors[key] = 101;
  fs.writeFileSync(FLOORS, JSON.stringify(floors, null, 2));

  const { code, stdout } = run(["--gate"]);
  assert.match(stdout, /SYLLABUS COVERAGE GATE: FAIL/);
  assert.notEqual(code, 0, "the gate must exit non-zero when coverage is below its floor");
});

test("the gate fails rather than passing when a subject has no floor", (t) => {
  const original = fs.readFileSync(FLOORS, "utf8");
  t.after(() => fs.writeFileSync(FLOORS, original));

  const floors = JSON.parse(original);
  delete floors.floors.SPMS;
  fs.writeFileSync(FLOORS, JSON.stringify(floors, null, 2));

  const { code, stdout } = run(["--gate"]);
  assert.match(stdout, /no floor recorded/);
  assert.notEqual(code, 0, "a missing floor must fail, not pass by default");
});

/* ---- the three matching bugs, pinned ----
 *
 * These use PROBE TERMS injected into the term list rather than real syllabus terms.
 * The first version of this file used RICE, Traceability and Vanity metrics as the
 * "untaught" fixtures — and then fix A3 taught all three the same day, so the tests
 * failed for the best possible reason and had to be rewritten. A guard on a matcher
 * should not depend on content that authoring is actively trying to change.
 */

const SPMS_TERMS = path.join(SYLLABUS_DIR, "SPMS.terms.json");

function withProbeTerms(t, probes) {
  const original = fs.readFileSync(SPMS_TERMS, "utf8");
  t.after(() => fs.writeFileSync(SPMS_TERMS, original));
  const data = JSON.parse(original);
  data.modules["1"] = [...data.modules["1"], ...probes];
  fs.writeFileSync(SPMS_TERMS, JSON.stringify(data, null, 2));
  const { results } = report();
  const spms = results.find((r) => r.courseId === "SPMS");
  return new Set(spms.modules.flatMap((m) => m.missing));
}

test("a short term is not matched inside a longer word", (t) => {
  // Each probe is a substring of words every SPMS lesson contains — "ice" inside
  // price/service/device, "duct" inside product, "usto" inside customer — and none is
  // a word in its own right. A substring matcher calls all three taught. This is the
  // bug that hid RICE behind "price".
  //
  // SAM and SOM were the obvious probes and are wrong: SPMS genuinely teaches them in
  // "TAM, SAM, SOM and early evangelists", so they are real terms, not false hits.
  const probes = ["Ice", "Duct", "Usto"];
  const missing = withProbeTerms(t, probes);
  for (const probe of probes) {
    assert.ok(
      missing.has(probe),
      `"${probe}" must read as untaught — matching has to be whole-word, not substring`
    );
  }
});

test("a multi-word name is not matched by its words scattered across the subject", (t) => {
  // Each of these words appears somewhere in SPMS prose, but never as this phrase.
  // Scattered-token matching is what let the alias "reach impact confidence effort"
  // declare RICE taught across four unrelated sentences.
  const missing = withProbeTerms(t, ["Product value customer effort", "Market team release confidence"]);
  for (const probe of ["Product value customer effort", "Market team release confidence"]) {
    assert.ok(missing.has(probe), `"${probe}" must read as untaught — the phrase itself never appears`);
  }
});

/* ---- the A3 authoring, pinned as a regression guard ---- */

test("the ideas fix A3 authored read as taught", () => {
  const { results } = report();
  const spms = results.find((r) => r.courseId === "SPMS");
  const missing = new Set(spms.modules.flatMap((m) => m.missing));
  for (const term of ["RICE", "Traceability", "Vanity metrics"]) {
    assert.ok(
      !missing.has(term),
      `${term} was authored into an SPMS lesson on 2026-08-17 and must stay taught`
    );
  }
});

test("interior function words do not break a name that IS taught", () => {
  const { results } = report();
  const spms = results.find((r) => r.courseId === "SPMS");
  const missing = new Set(spms.modules.flatMap((m) => m.missing));
  for (const term of ["Jobs to Be Done", "Desirability, feasibility, viability", "Lean Canvas", "MoSCoW"]) {
    assert.ok(
      !missing.has(term),
      `${term} is taught — it appears in a lesson title or body. A false 'untaught' here means ` +
        "small interior words are being stripped before the phrase is matched."
    );
  }
});

test("term lists carry names only, never course prose", () => {
  // The source material is gitignored and must not be reproduced. A term is a label:
  // short, and never a sentence. This is the check that keeps data/syllabus committable.
  for (const file of fs.readdirSync(SYLLABUS_DIR).filter((f) => f.endsWith(".terms.json"))) {
    const data = JSON.parse(fs.readFileSync(path.join(SYLLABUS_DIR, file), "utf8"));
    for (const [moduleNumber, terms] of Object.entries(data.modules)) {
      for (const raw of terms) {
        const entry = typeof raw === "string" ? { term: raw } : raw;
        for (const name of [entry.term, ...(entry.aliases || [])]) {
          assert.ok(
            name.split(/\s+/).length <= 8,
            `${file} M${moduleNumber}: "${name}" is too long to be a term — term lists carry names, not definitions`
          );
          assert.ok(
            !/[.!?]\s|[.!?]$/.test(name),
            `${file} M${moduleNumber}: "${name}" looks like a sentence from the course material`
          );
        }
      }
    }
  }
});
