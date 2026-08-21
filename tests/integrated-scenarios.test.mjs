/*
 * The integrated scenarios have to reach a student, and the paper has to draw the
 * kind of item its slot is worth.
 *
 * WHAT WENT WRONG, MEASURED
 * Four ten-mark BRGSA scenarios were authored, all their conceptIds resolved, the bank
 * validator passed them, and three of the four reached no set the product offers. The
 * cause was not the bank. BRGSA Section C draws 2 items from a short-answer pool of 36,
 * of which 32 are per-concept prompts running three to five minutes and four were the
 * scenarios built for that slot — so a flat draw filled a ten-mark slot with a
 * three-minute prompt four times in five. On the Learn side they were unreachable by
 * construction: `startWrittenPractice` rotated short/case/short/case and its fallback
 * only fires when no unchosen concept has a prompt in the requested mode, which never
 * happened because every concept carries both.
 *
 * So this file asserts the two halves separately. A scenario that cannot be drawn is
 * not served, and a scenario Learn can never teach makes the examiner foreign — which
 * is the failure the product exists to prevent.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const appDir = path.join(root, "app");

/* Load order matters and has cost a session before: t6_catalog.js only builds BRGSA
   once t6_brgsa.js has run, and t6_challenges.js reads T6_INTEGRATED while building. */
const BANK_FILES = [
  "sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js",
  "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_ibm_case.js", "sets/t6_challenges.js"
];

function loadBank(mutate) {
  const context = { window: {}, atob: (v) => Buffer.from(v, "base64").toString("binary") };
  vm.createContext(context);
  for (const rel of BANK_FILES) {
    let source = fs.readFileSync(path.join(appDir, rel), "utf8");
    if (mutate) source = mutate(rel, source);
    vm.runInContext(source, context, { filename: rel });
  }
  return context.window;
}

/* Mirrored from app/t6.js. tools/browser-checks/export-run.js is what keeps the
   persona harness's copy honest against the app; this one is checked against that
   harness's copy below, so a drift in either is visible. */
function examSeed(courseId, setIndex) {
  let base = 2166136261;
  for (let i = 0; i < courseId.length; i += 1) {
    base = (base ^ courseId.charCodeAt(i)) >>> 0;
    base = (base * 16777619) >>> 0;
  }
  return (base + (setIndex + 1) * 2654435761) >>> 0;
}

function examShuffle(items, seed) {
  const out = items.slice();
  let state = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    const swap = out[i]; out[i] = out[j]; out[j] = swap;
  }
  return out;
}

function examPrefer(questions, prefer) {
  if (!prefer || !prefer.length) return questions;
  const band = (question) => {
    const index = prefer.indexOf(question.writtenMode);
    return index < 0 ? prefer.length : index;
  };
  const reserved = (question) => (question.examOnly ? 0 : 1);
  return questions.map((question, index) => ({ question, index }))
    .sort((a, b) => band(a.question) - band(b.question) ||
      reserved(a.question) - reserved(b.question) || a.index - b.index)
    .map((entry) => entry.question);
}

function takeExamSection(pool, count, modeCounts) {
  if (!modeCounts) return pool.slice(0, count);
  const taken = [];
  const used = new Set();
  for (const [mode, wanted] of Object.entries(modeCounts)) {
    let remaining = wanted;
    for (const question of pool) {
      if (remaining <= 0 || taken.length >= count || used.has(question.id)) continue;
      if (question.writtenMode !== mode) continue;
      taken.push(question);
      used.add(question.id);
      remaining -= 1;
    }
  }
  for (const question of pool) {
    if (taken.length >= count || used.has(question.id)) continue;
    taken.push(question);
    used.add(question.id);
  }
  return taken;
}

const PREFER = ["integrated", "case", "short"];
const SET_COUNT = 3;

function sectionDraw(course, courseId, sectionId, type, count, prefer, modeCounts) {
  const pool = Object.keys(course.questions).map((id) => course.questions[id])
    .filter((question) => !question.releasedCase && (question.type || "mcq") === type);
  return Array.from({ length: SET_COUNT }, (_, set) =>
    takeExamSection(
      examPrefer(examShuffle(pool, examSeed(courseId, set) + sectionId.charCodeAt(0)), prefer),
      count,
      modeCounts
    ));
}

test("every authored integrated scenario resolves into the bank it was written for", () => {
  const win = loadBank();
  for (const [courseId, scenarios] of Object.entries(win.T6_INTEGRATED)) {
    const course = win.T6_COURSES[courseId];
    assert.ok(course, `${courseId} has integrated scenarios but no course`);
    for (const scenario of scenarios) {
      const built = course.questions[scenario.id];
      assert.ok(built, `${scenario.id} was authored but is not in the built bank`);
      assert.equal(built.writtenMode, "integrated");
      assert.equal(built.type, "short-answer");
      /* Every declared concept has to survive into the question, because both the
         evidence boundary and repair routing are built from them. */
      /* Joined rather than deep-compared: the bank is built inside a vm realm, so its
         arrays have a different Array.prototype and deepStrictEqual rejects them as
         different types even when every element matches. */
      const carried = [built.conceptId].concat(Array.from(built.supportingConceptIds || [])).join(",");
      assert.equal(carried, Array.from(scenario.conceptIds).join(","),
        `${scenario.id} lost concepts between authoring and the bank`);
    }
  }
});

test("an unresolvable conceptId stops the build and names the id", () => {
  /* §5: a silent drop is how content ships and is never served. This was a bare
     `return` for months, which is exactly how the four scenarios above went
     unnoticed — nothing anywhere said a scenario had been dropped. */
  assert.throws(
    () => loadBank((rel, source) => rel.endsWith("t6_integrated.js")
      ? source.replace('"brgsa_m3_cohort"', '"brgsa_m3_cohort_typo"')
      : source),
    /brgsa_m3_cohort_typo/,
    "a scenario naming a concept that does not exist must fail loudly and name it"
  );
});

test("BRGSA Section C spends every ten-mark slot on a ten-mark item", () => {
  const win = loadBank();
  const draws = sectionDraw(win.T6_COURSES.BRGSA, "BRGSA", "C", "short-answer", 2, PREFER);
  draws.forEach((taken, set) => {
    assert.equal(taken.length, 2, `set ${set + 1} did not fill Section C`);
    for (const question of taken) {
      assert.equal(question.writtenMode, "integrated",
        `set ${set + 1} filled a 10-mark slot with a ${question.writtenMode} prompt (${question.id})`);
    }
  });
});

test("the three seeded BRGSA Section C draws are genuinely different papers", () => {
  const win = loadBank();
  const draws = sectionDraw(win.T6_COURSES.BRGSA, "BRGSA", "C", "short-answer", 2, PREFER)
    .map((taken) => taken.map((question) => question.id).sort().join("+"));
  assert.equal(new Set(draws).size, SET_COUNT,
    `three sets must be three draws, got ${JSON.stringify(draws)}`);
});

test("IBM keeps full-case depth while rotating the expanded written bank", () => {
  const win = loadBank();
  const course = win.T6_COURSES.IBM;
  const draws = sectionDraw(course, "IBM", "A", "short-answer", 10, PREFER,
    { integrated: 4, case: 6 });
  const rotated = new Set();
  const concepts = new Set();
  draws.forEach((taken, set) => {
    const integrated = taken.filter((question) => question.writtenMode === "integrated").length;
    const cases = taken.filter((question) => question.writtenMode === "case").length;
    assert.equal(integrated, 4, `IBM set ${set + 1} must carry four whole cases`);
    assert.equal(cases, 6, `IBM set ${set + 1} must rotate six focused case responses`);
    assert.ok(taken.filter((question) => question.writtenMode === "integrated")
      .every((question) => question.examOnly),
    `IBM set ${set + 1} must spend its integrated slice on examiner-only cases first`);
    taken.filter((question) => question.writtenMode === "case")
      .forEach((question) => rotated.add(question.id));
    taken.forEach((question) => {
      concepts.add(question.conceptId);
      Array.from(question.supportingConceptIds || []).forEach((id) => concepts.add(id));
    });
  });
  assert.equal(rotated.size, 18,
    "the six expanded-bank slots must be different on all three IBM mocks");
  assert.ok(concepts.size >= 30,
    `three IBM mocks must now reach at least 30 concepts, got ${concepts.size}`);
});

test("IBM assessment surfaces follow the authored idea taxonomy", () => {
  const win = loadBank();
  const course = win.T6_COURSES.IBM;
  const expectedMode = { layer: "mixed", framework: "written", concept: "objective" };
  assert.equal(course.concepts.length, 85,
    "the original 16 IBM layer records plus 69 newly classified records must remain present");

  for (const concept of course.concepts) {
    assert.equal(concept.assessmentMode, expectedMode[concept.conceptKind],
      `${concept.id} maps ${concept.conceptKind} to the wrong assessment mode`);
    const active = Object.values(course.questions).filter((question) => {
      const carries = question.conceptId === concept.id || Array.from(question.supportingConceptIds || []).includes(concept.id);
      return carries && !question.primerOnly && !question.optionShapeRisk && !question.examOnly;
    });
    const written = active.filter((question) => question.type === "short-answer");
    const objective = active.filter((question) => question.type !== "short-answer");

    if (concept.conceptKind === "layer") {
      assert.ok(written.length, `${concept.id} is a layer concept without written practice`);
      assert.ok(objective.length, `${concept.id} is a layer concept without MCQ/objective practice`);
    } else if (concept.conceptKind === "framework") {
      assert.equal(objective.length, 0, `${concept.id} is a framework leaking into MCQ/objective practice`);
      const modes = new Set(written.map((question) => question.writtenMode));
      for (const mode of ["short", "case"]) {
        assert.ok(modes.has(mode), `${concept.id} framework is missing ${mode} written practice`);
      }
      assert.ok(written.some((question) => Array.from(question.supportingConceptIds || []).length),
        `${concept.id} framework has no linked written practice`);
    } else {
      assert.equal(written.length, 0, `${concept.id} is an atomic concept leaking into written practice`);
      assert.ok(objective.some((question) => question.boss), `${concept.id} has no linked boss coverage`);
    }
  }
});

test("Learn can reach an integrated scenario at all", () => {
  /* The app is a DOM-bound IIFE, so the reachable assertion is made against the
     selection rules themselves. Both halves are load-bearing: the rotation has to ask
     for the mode, and the slot has to survive the one-concept-per-prompt rule, which
     rejects the only surface of its kind whenever one of its four concepts was taken
     by an earlier slot. */
  const source = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
  assert.match(source, /\["short", "case", "short", "integrated"\]\.forEach/,
    "startWrittenPractice must ask for an integrated prompt in its rotation");
  assert.match(source, /if \(!question && mode === "integrated"\) \{/,
    "the integrated slot must relax concept-uniqueness before giving the slot up");
});

test("the persona harness's paper builder still matches the app's", () => {
  /* The harness mirrors the paper builder deliberately and the digest check is what
     licenses that. A rule added to one and not the other reports on a paper nobody
     sits, so preference ordering has to exist in both. */
  const app = fs.readFileSync(path.join(appDir, "t6.js"), "utf8");
  const harness = fs.readFileSync(path.join(root, "tools", "export-persona-run.mjs"), "utf8");
  for (const [label, source] of [["app/t6.js", app], ["export-persona-run.mjs", harness]]) {
    assert.match(source, /function examPrefer\(/, `${label} must define examPrefer`);
    assert.match(source, /function takeExamSection\(/, `${label} must define the authored format-mix selector`);
    assert.match(source, /examOnly \? 0 : 1/, `${label} must rank reserved items ahead of shared ones`);
    assert.match(source, /prefer: \["integrated", "case", "short"\]/,
      `${label} must declare the preference on its ten-mark sections`);
    assert.match(source, /modeCounts:\s*\{\s*integrated:\s*4,\s*case:\s*6\s*\}/,
      `${label} must keep four whole IBM cases while rotating six expanded-bank case responses`);
  }
});
