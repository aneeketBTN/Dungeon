/*
 * The standard normal table the SCLM paper supplies.
 *
 * T6_EXAM_PATTERN.md says the real paper provides these tables. Dungeon provided none,
 * and the consequence was that four of SCLM Section B's six numericals could exist and
 * two could not: every remaining method in the syllabus — safety stock, the reorder
 * point, the service level a policy is achieving — needs Phi, and a candidate with no
 * table cannot produce it. So the table is a paper provision, and its numbers are now
 * load-bearing for four scored questions.
 *
 * Phi is computed rather than stored as 310 literals. That is one place to be wrong
 * instead of 310, but it is also one place a silent approximation error would sit
 * behind four questions marked to a tolerance of 1 unit. So the values are pinned here
 * against the ones every printed table agrees on, and against the z values the lecture
 * itself reads off (0.55 at 70%, 1.65 at 95%, 2.05 at 98%).
 *
 * The extraction is deliberately textual: app/t6.js is a DOM-bound IIFE that cannot be
 * imported, and re-implementing normalCdf here would test the copy, which is the
 * mistake teach-before-test.js exists to warn about.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const appSource = fs.readFileSync(path.join(root, "app", "t6.js"), "utf8");

/* Lift the shipped function out of the IIFE and evaluate exactly those lines, so this
   tests the code the app runs rather than a second copy of the same idea. */
function loadShippedNormalCdf() {
  const match = appSource.match(/function normalCdf\(z\) \{[\s\S]*?\n {2}\}/);
  assert.ok(match, "app/t6.js must define normalCdf");
  return new Function(match[0] + "; return normalCdf;")();
}

test("normalCdf matches the published standard normal table to four decimals", () => {
  const normalCdf = loadShippedNormalCdf();
  const published = [
    [0.00, 0.5000], [0.25, 0.5987], [0.50, 0.6915], [0.55, 0.7088],
    [1.00, 0.8413], [1.28, 0.8997], [1.50, 0.9332], [1.645, 0.9500],
    [1.65, 0.9505], [1.96, 0.9750], [2.05, 0.9798], [2.33, 0.9901],
    [2.58, 0.9951], [3.00, 0.9987]
  ];
  for (const [z, expected] of published) {
    const actual = normalCdf(z);
    assert.ok(Math.abs(actual - expected) < 5e-5,
      `Phi(${z}) should be ${expected}, tabulated as ${actual.toFixed(4)}`);
  }
});

test("normalCdf is symmetric and monotonic across the printed range", () => {
  const normalCdf = loadShippedNormalCdf();
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-9, "Phi(0) must be exactly a half");
  let previous = -Infinity;
  for (let step = 0; step <= 300; step += 1) {
    const z = step / 100;
    const value = normalCdf(z);
    assert.ok(value > previous, `Phi must increase with z; it did not at ${z}`);
    assert.ok(Math.abs(value + normalCdf(-z) - 1) < 1e-6,
      `Phi(${z}) + Phi(-${z}) must be 1`);
    previous = value;
  }
});

/* The four questions this table exists for. If a figure here moves, the near misses
   authored against these methods stop describing the errors they name. */
test("the shipped z values reproduce the authored SCLM answers", () => {
  const normalCdf = loadShippedNormalCdf();
  const inverse = (target) => {
    let low = -5, high = 5;
    for (let i = 0; i < 200; i += 1) {
      const mid = (low + high) / 2;
      if (normalCdf(mid) < target) low = mid; else high = mid;
    }
    return (low + high) / 2;
  };
  /* Reorder point at 95%: mu_DLT 160, sigma_DLT 12*sqrt(4) = 24. */
  const rop = 160 + inverse(0.95) * 24;
  assert.ok(Math.abs(rop - 199.6) <= 1, `ROP at 95% should be within tolerance of 199.6, got ${rop.toFixed(2)}`);
  /* Service level of a reorder point in force: z = (495 - 450) / 45 = 1. */
  const achieved = normalCdf((495 - 450) / (15 * Math.sqrt(9))) * 100;
  assert.ok(Math.abs(achieved - 84.1) <= 0.5, `achieved service level should be near 84.1%, got ${achieved.toFixed(2)}`);
  /* Raising 90% to 99% on sigma_DLT = 20*sqrt(4) = 40. */
  const rise = (inverse(0.99) - inverse(0.90)) * 40;
  assert.ok(Math.abs(rise - 42) <= 2, `safety stock rise should be within tolerance of 42, got ${rise.toFixed(2)}`);
});

test("the SCLM paper declares the table its real paper supplies", () => {
  const spec = appSource.match(/SCLM: \{[\s\S]*?sections: \[/);
  assert.ok(spec, "app/t6.js must define an SCLM paper spec");
  assert.match(spec[0], /tables: \["standard-normal"\]/,
    "SCLM must declare the standard normal table; without it every z-based item is unanswerable");
  assert.match(appSource, /\$\("exam-table-toggle"\)\.hidden = \(exam\.paper\.spec\.tables \|\| \[\]\)/,
    "the examiner must show the table control from the paper spec, not unconditionally");
});
