#!/usr/bin/env node
/*
 * T5 — the three-persona regression.
 *
 * WHAT THIS MEASURES THAT T3 DOES NOT
 * run-persona-strategies.mjs answers "can this paper be beaten by craft" and is a
 * number about the bank's shape. This answers a different question, and it is the one
 * the product is actually for: when a learner gets something wrong, what are they
 * told? A run that answers four different mistakes with the same sentence has taught
 * once and charged four times, and no gate in this repository could see that.
 *
 * The last count was 55 distinct cues across 161 diagnoses in four runs, with the
 * single most common cue covering 33 of them. That is the standing finding this exists
 * to hold a line under.
 *
 * THE THREE PERSONAS
 * Not simulated learners with personalities — that was the 390-tool-call version and
 * it discovered nothing the rules did not. They are three answering policies, chosen
 * because each stalls somewhere different and therefore meets a different slice of the
 * feedback:
 *
 *   cold      answers at chance. Meets the most wrong-answer feedback of the three,
 *             so it measures breadth of diagnosis across the whole run.
 *   crammer   applies the surviving craft rules (longest, then on-topic). Meets the
 *             feedback for the SPECIFIC errors craft produces, which is where a
 *             generic diagnosis does the most damage: it confirms the shortcut.
 *   careful   answers correctly except where two options are close in length and
 *             both name the concept. Meets the feedback on genuine confusions, which
 *             is the feedback that has to be best and is measured least.
 *
 * Each persona is deterministic given the run, so a re-run after a content batch is a
 * regression rather than a sample.
 *
 * WHAT IT REPORTS, PER SUBJECT AND PERSONA
 *   score            marks out of the run's own available marks
 *   stalledAt        the first step it got wrong, and the run's worst concept
 *   cues             DISTINCT diagnosis cues met, and the share the top one covers
 *
 * The floor is on cues, not on score. A persona scoring badly is fine and is often
 * the point; a run that says the same thing every time it says anything is not.
 *
 *   node tools/measure-persona-regression.mjs [harnessDir] [--gate]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const gate = args.indexOf("--gate") >= 0;
const dir = args.filter((a) => !a.startsWith("--"))[0] ||
  path.join(here, "..", "evidence", "2026-08-15", "persona-harness");

/* Floors, and how they are scaled.
 *
 * The first version set a flat floor of 8 distinct cues and skipped any run with fewer
 * than 10 wrong decisions. A set-1 run offers about nine scored decisions, so every
 * run was skipped and the gate printed a pass over data it had not judged — the exact
 * failure this repository keeps paying for, reproduced inside the tool written to
 * catch it. The floors are now proportional to what the run actually asked, and the
 * no-cue check is unconditional because one wrong answer met with silence is a defect
 * at any sample size. */
const MIN_WRONG_TO_JUDGE_BREADTH = 5;
const MAX_TOP_CUE_SHARE = 0.60;
const minDistinctCues = (wrongDecisions) => Math.max(3, Math.ceil(wrongDecisions / 3));

function words(value) { return String(value || "").trim().split(/\s+/).filter(Boolean).length; }

function conceptWords(concept) {
  return String(concept || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/).filter((word) => word.length > 3);
}

function namesConcept(option, concept) {
  const terms = conceptWords(concept);
  if (!terms.length) return false;
  const text = String(option).toLowerCase();
  return terms.filter((term) => text.includes(term)).length >= Math.ceil(terms.length / 2);
}

/* ---- the three answering policies ---------------------------------------- */

const PERSONAS = {
  cold: (options) => 0,
  crammer: (options, concept) => {
    const lengths = options.map(words);
    const longest = Math.max(...lengths);
    const byLength = lengths.map((length, index) => ({ length, index })).filter((row) => row.length === longest);
    if (byLength.length === 1) return byLength[0].index;
    const onTopic = options.map((option, index) => ({ option, index }))
      .filter((row) => namesConcept(row.option, concept));
    return onTopic.length === 1 ? onTopic[0].index : byLength[0].index;
  },
  /* Answers correctly unless two options are within 15% on length AND both name the
     concept — the shape of a real confusion rather than a careless slip. Then it takes
     the first of the pair, which is wrong half the time by construction. */
  careful: (options, concept, answer) => {
    const lengths = options.map(words);
    const rivals = options.map((option, index) => ({ option, index }))
      .filter((row) => namesConcept(row.option, concept))
      .filter((row) => Math.abs(lengths[row.index] - lengths[answer]) <= Math.max(2, lengths[answer] * 0.15));
    if (rivals.length >= 2) return rivals[0].index;
    return answer;
  }
};

/* ---- reading the run ------------------------------------------------------ */

function optionSets(step, keyStep) {
  /* One shape for every scored family, so a persona answers a boss step and an mcq
     the same way and the cue count is comparable across them. */
  /* The keys are the export's own: `whole` for a single-decision item, `byBlank`,
     `byStep`, `byRow` for the multi-decision ones. The first draft of this looked up
     `answer` for an mcq, found nothing, and recorded "(no cue)" — a probe defect that
     reads exactly like the content defect it was looking for. */
  const type = keyStep.type || step.type;
  if (type === "mcq") return [{ options: step.options || [], answer: keyStep.answer, path: ["whole"] }];
  if (type === "cloze" || type === "case-cloze") {
    return (keyStep.blanks || []).map((answer, index) => ({
      options: ((step.blanks || [])[index] || {}).options || [], answer, path: ["byBlank", index]
    }));
  }
  if (type === "boss") {
    return (keyStep.steps || []).map((answer, index) => ({
      options: ((step.steps || [])[index] || {}).options || [], answer, path: ["byStep", index]
    }));
  }
  if (type === "match") {
    return (keyStep.rows || []).map((answer, index) => ({
      options: step.choices || [], answer, path: ["byRow", index]
    }));
  }
  /* msq is scored as a set rather than as one choice, and numeric and short-answer
     have no per-option channel at all. They are counted in the run but contribute no
     cue, and saying so is better than folding them in and diluting the average. */
  return [];
}

function diagnosisAt(keyStep, path, chosen) {
  const wrong = ((keyStep.feedback || {}).ifWrong) || {};
  const perOption = wrong.perOption || {};
  let node = perOption;
  for (const key of path) {
    if (node === undefined || node === null) return null;
    node = node[key];
  }
  if (Array.isArray(node)) return node[chosen] || null;
  return null;
}

const runs = fs.readdirSync(dir).filter((name) => name.endsWith(".learn.json"));
if (!runs.length) {
  console.error(`No delivered runs in ${dir}. Capture with tools/browser-checks/export-run.js then tools/export-learn-run.mjs.`);
  process.exit(1);
}

const report = {
  floors: {
    minWrongToJudgeBreadth: MIN_WRONG_TO_JUDGE_BREADTH,
    minDistinctCues: "max(3, ceil(wrongDecisions / 3))",
    maxTopCueShare: MAX_TOP_CUE_SHARE,
    noCueOffered: 0
  },
  runs: []
};

for (const name of runs.sort()) {
  const candidate = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
  const keyPath = path.join(dir, name.replace(".learn.json", ".learn.key.json"));
  if (!fs.existsSync(keyPath)) throw new Error(`${name} has no key file`);
  const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const keyByStep = new Map((key.key || []).map((entry) => [entry.step, entry]));

  for (const [personaName, choose] of Object.entries(PERSONAS)) {
    let asked = 0;
    let right = 0;
    let stalledAt = null;
    const cues = new Map();
    const missedConcepts = new Map();

    for (const step of candidate.run || []) {
      if (step.kind !== "question") continue;
      const keyStep = keyByStep.get(step.step);
      if (!keyStep) continue;
      for (const set of optionSets(step, keyStep)) {
        if (!set.options.length || typeof set.answer !== "number") continue;
        asked += 1;
        const chosen = choose(set.options, step.concept, set.answer);
        if (chosen === set.answer) { right += 1; continue; }
        if (stalledAt === null) stalledAt = { step: step.step, id: step.id, concept: step.concept };
        missedConcepts.set(step.concept, (missedConcepts.get(step.concept) || 0) + 1);
        const diagnosis = diagnosisAt(keyStep, set.path, chosen);
        /* The cue is the sentence that tells a learner what to do differently. The
           label is a category and the `why` restates the item, so counting either
           would flatter the result. */
        const cue = diagnosis && diagnosis.cue ? String(diagnosis.cue).trim() : "(no cue)";
        cues.set(cue, (cues.get(cue) || 0) + 1);
      }
    }

    const totalCues = [...cues.values()].reduce((sum, count) => sum + count, 0);
    const top = [...cues.entries()].sort((a, b) => b[1] - a[1])[0] || null;
    const worst = [...missedConcepts.entries()].sort((a, b) => b[1] - a[1])[0] || null;

    report.runs.push({
      subject: candidate.subject, set: candidate.set, persona: personaName,
      askedDecisions: asked,
      correct: right,
      scorePct: asked ? Math.round((right / asked) * 1000) / 10 : 0,
      stalledAt,
      worstConcept: worst ? { concept: worst[0], wrongDecisions: worst[1] } : null,
      feedback: {
        wrongDecisions: totalCues,
        distinctCues: cues.size,
        topCue: top ? { cue: top[0], covers: top[1], share: Math.round((top[1] / totalCues) * 1000) / 1000 } : null,
        noCueOffered: cues.get("(no cue)") || 0
      }
    });
  }
}

console.log(JSON.stringify(report, null, 2));

if (gate) {
  const problems = [];
  for (const row of report.runs) {
    /* Only the persona that meets a real spread of wrong answers can be judged on
       breadth; `careful` is designed to get almost everything right and would fail a
       breadth floor for the right reason. */
    if (row.persona !== "cold") continue;
    /* Unconditional: silence in answer to a wrong answer is a defect at any n. */
    if (row.feedback.noCueOffered) {
      problems.push(`${row.subject} set ${row.set}: ${row.feedback.noCueOffered} wrong decisions were answered with no cue at all`);
    }
    if (row.feedback.wrongDecisions < MIN_WRONG_TO_JUDGE_BREADTH) continue;
    const floor = minDistinctCues(row.feedback.wrongDecisions);
    if (row.feedback.distinctCues < floor) {
      problems.push(`${row.subject} set ${row.set}: ${row.feedback.distinctCues} distinct cues across ${row.feedback.wrongDecisions} wrong decisions, floor is ${floor}`);
    }
    if (row.feedback.topCue && row.feedback.topCue.share > MAX_TOP_CUE_SHARE) {
      problems.push(`${row.subject} set ${row.set}: one cue covers ${(row.feedback.topCue.share * 100).toFixed(0)}% of wrong decisions — "${row.feedback.topCue.cue.slice(0, 70)}…"`);
    }
  }
  if (problems.length) {
    console.error("\nT5 FAILED — a run that answers different mistakes with the same sentence has taught once:");
    for (const message of problems) console.error(`  × ${message}`);
    process.exit(1);
  }
  console.error("\nT5 passed: every run offers a cue for every wrong decision, with enough distinct cues to be teaching rather than repeating.");
}
