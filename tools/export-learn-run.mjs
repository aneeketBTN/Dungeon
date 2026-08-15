/*
 * Persona harness — the LEARN half. Hydrates a run skeleton into two files.
 *
 * THE SPLIT, AND WHY IT IS HERE
 * Only the app can say what a learner is served: `layeredQueue` and
 * `selectQuestionsFromPool` live in a DOM-bound IIFE, depend on learner state, and
 * carry rules a second copy would drift from. So the ORDER comes from the browser —
 * `tools/browser-checks/export-run.js` drives the real subject rail, opens the real
 * set, and writes one line per step into `<SUBJECT>-set<N>.queue.json`.
 *
 * Everything behind that order is a lookup: the lesson prose, the primer, the stems,
 * the options and the per-option feedback all sit in `app/sets/*.js` as data. This
 * hydrates the skeleton against that data. No scheduling rule is re-implemented here,
 * which is the line `teach-before-test.js` draws and the reason the paper builder in
 * `export-persona-run.mjs` needs a digest check while this does not.
 *
 * BLIND BY CONSTRUCTION
 * `<SUBJECT>-set<N>.learn.json` is the candidate view: what is on screen BEFORE the
 * learner commits. It carries no answer index, no `answers`, no per-blank answer, no
 * diagnoses, no rubric text, no explanation, and — for a primer — no rule.
 * `<SUBJECT>-set<N>.learn.key.json` carries all of it, and carries the feedback with
 * it, for two reasons:
 *
 *   1. "Am I learning?" is decided by what you are told when you get it wrong. The
 *      cram test found correct-answer feedback restates the chosen option verbatim
 *      while the wrong-answer diagnosis is the best content in the product, so a
 *      persona judging the run needs both in front of them.
 *   2. A diagnosis array has a HOLE at the correct option — every scored distractor
 *      carries one and the answer carries none. Printing it beside the options hands
 *      over the answer as surely as the answer index would. It sat on the candidate
 *      side until 2026-08-15 under a comment saying it did not.
 *
 * IT REFUSES RATHER THAN GUESSES
 * An id the subject's bank does not carry is not written as `unknown`; it is a fatal
 * error naming the id. That is the exact failure the old export produced quietly when
 * it clicked the wrong subject's set list.
 *
 * USAGE
 *   node tools/export-learn-run.mjs [harnessDir]
 * Reads every `*-set*.queue.json` in the directory and writes the pair beside it.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(here, "..", "app");
const dir = process.argv[2] || path.join(here, "..", "evidence", "2026-08-15", "persona-harness");

/* t6_integrated.js BEFORE t6_challenges.js. It was missing from four load lists at
   once, so the eight integrated scenarios shipped unvalidated for weeks (F-47). */
const context = { window: {}, atob: (v) => Buffer.from(v, "base64").toString("binary") };
vm.createContext(context);
for (const rel of ["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_challenges.js"]) {
  const file = path.join(appRoot, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}
const courses = context.window.T6_COURSES;
const lessons = context.window.T6_LESSONS || {};

function fnv1a(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash = (hash ^ value.charCodeAt(i)) >>> 0;
    hash = (hash * 16777619) >>> 0;
  }
  return ("00000000" + hash.toString(16)).slice(-8);
}

function lectureIdsOf(question) {
  return (question.sourceIds?.length ? question.sourceIds : [question.source]).filter(Boolean);
}

/* The glossary a learner can open on the question — part of what they are given, and
   it materially changes what the item tests. `renderGlossaryBlock` prints `term` and
   `plain` as a definition list, so both are carried: an export listing the words
   without their meanings understates what the learner has in front of them. */
function termsFor(question) {
  const terms = [];
  const seen = new Set();
  for (const id of lectureIdsOf(question)) {
    for (const entry of lessons[id]?.glossary || []) {
      if (!entry?.term || seen.has(entry.term)) continue;
      seen.add(entry.term);
      terms.push({ term: entry.term, plain: entry.plain || "" });
    }
  }
  return terms;
}

function conceptNameOf(course, conceptId) {
  return (course.concepts || []).find((c) => c.id === conceptId)?.name || conceptId || null;
}

/* ---- what is on screen BEFORE the learner commits ---------------------------- */

function lessonView(step, handoff) {
  const lesson = lessons[step.lectureId];
  const view = {
    step: step.step, kind: "lesson", lectureId: step.lectureId,
    reteach: step.reteach,
    title: lesson.title, module: lesson.module, lectureNumber: lesson.order,
    objective: lesson.objective,
    explainer: (lesson.explainer || []).slice(),
    worked: lesson.worked ? JSON.parse(JSON.stringify(lesson.worked)) : null,
    /* The field is `plain`, not `definition` — the first version of this hydrator
       guessed, and quietly wrote `null` under every term in all four subjects. */
    glossary: (lesson.glossary || []).map((entry) => ({ term: entry.term, plain: entry.plain || "" })),
    /* The closing handoff as the APP prints it, not as the record stores it. The
       record promises "the next lecture"; the app prints a correction under that
       sentence when this run does not deliver it, and an export reading only the
       record reports a broken promise the product has already qualified.
       `window.__dungeonExport.handoffs()` is the app's own decision, carried through
       the skeleton — falling back to the raw string only if an older build had no
       such handle, and saying so. */
    handoff: handoff || { connects: lesson.connects || "", promisesNextLecture: null, kept: null, note: null, nextInRun: null, source: "lesson record only — the app's handoff was not exported" }
  };
  return view;
}

function primerView(step, question, course) {
  const level = step.primerLevel || 1;
  const carry = step.previousConceptId ? conceptNameOf(course, step.previousConceptId) : null;
  return {
    step: step.step, kind: "primer", id: question.id,
    concept: question.node,
    level,
    levelLabel: level === 1 ? "First contact · predict before you are told"
      : level === 2 ? "Primer returning · predict again"
      : "Primer strengthened · this one has caught you before",
    /* The panel renders exactly these, in this order. The rule is withheld until the
       learner commits a prediction (LAW-63), so it is not here. */
    carryForward: carry ? `Carry forward: ${carry}. Now add ${question.node}.` : null,
    whatHappens: question.primerCase || null,
    knownTrap: level >= 3 ? question.primerMisconception : null,
    stem: question.stem || "",
    response: "free text — a prediction in the learner's own words. Nothing is marked or recorded.",
    termsAvailable: termsFor(question)
  };
}

function questionView(step, question) {
  const type = question.type || "mcq";
  const view = {
    step: step.step, kind: "question", id: question.id, type,
    concept: question.node || null,
    caselet: typeof question.caselet === "string" && question.caselet ? question.caselet : null,
    stem: question.stem || question.prompt || "",
    prompt: (question.prompt && question.stem && question.prompt !== question.stem) ? question.prompt : null
  };
  if (type === "mcq" || type === "msq") view.options = (question.options || []).slice();
  if (type === "msq") view.marking = "+1 per right option, −1 per wrong, floored at zero.";
  if (type === "cloze" || type === "case-cloze") {
    view.blanks = (question.blanks || []).map((b) => ({ label: b.label || "", options: (b.options || []).slice() }));
  }
  if (type === "boss") {
    view.steps = (question.steps || []).map((s) => ({ label: s.label || "", prompt: s.prompt || "", options: (s.options || []).slice() }));
  }
  if (type === "match") {
    view.rows = (question.rows || []).map((r) => r.label || "");
    view.choices = (question.choices || []).slice();
  }
  if (type === "numeric") view.unit = question.unit || null;
  if (type === "short-answer") {
    view.writtenMode = question.writtenMode || null;
    view.rubricPointCount = (question.rubric || []).length;
    view.selfReviewOnly = !!question.selfReviewOnly;
  }
  view.termsAvailable = termsFor(question);
  return view;
}

/* ---- what the learner is shown AFTER committing ------------------------------- */

function diagnosisView(diagnosis) {
  if (!diagnosis) return null;
  return { label: diagnosis.label || "", why: diagnosis.why || "", cue: diagnosis.cue || "" };
}

/* One entry per selectable option, in option order, so a persona can read exactly what
   they would have been told for the choice they would have made. `null` marks the
   correct option — which is why this file is the key and not the candidate view. */
function perOptionFeedback(question) {
  const type = question.type || "mcq";
  if (type === "mcq" || type === "msq") {
    return { whole: (question.options || []).map((_, i) => diagnosisView((question.diagnoses || [])[i])) };
  }
  if (type === "cloze" || type === "case-cloze") {
    return { byBlank: (question.blanks || []).map((b) => (b.options || []).map((_, i) => diagnosisView((b.diagnoses || [])[i]))) };
  }
  if (type === "boss") {
    return { byStep: (question.steps || []).map((s) => (s.options || []).map((_, i) => diagnosisView((s.diagnoses || [])[i]))) };
  }
  if (type === "match") {
    return { byRow: (question.rows || []).map((r) => (question.choices || []).map((_, i) => diagnosisView((r.diagnoses || [])[i]))) };
  }
  if (type === "numeric") {
    return {
      nearMisses: (question.nearMisses || []).map((miss) => ({ value: miss.value, diagnosis: diagnosisView(miss.diagnosis || miss) })),
      onAnyOtherFigure: diagnosisView(question.missDiagnosis)
    };
  }
  return {};
}

/* The text the "complete answer" panel prints. Derived from the same indices the app
   marks against, so it is the answer as shown rather than a paraphrase of it. */
function answerText(question) {
  const type = question.type || "mcq";
  if (type === "mcq") return [question.options?.[question.answer]].filter(Boolean);
  if (type === "msq") return (question.answers || []).map((i) => question.options?.[i]).filter(Boolean);
  if (type === "cloze" || type === "case-cloze") return (question.blanks || []).map((b) => b.options?.[b.answer]).filter(Boolean);
  if (type === "boss") return (question.steps || []).map((s) => s.options?.[s.answer]).filter(Boolean);
  if (type === "match") return (question.rows || []).map((r) => `${r.label} → ${question.choices?.[r.answer]}`);
  if (type === "numeric") return [String(question.answer) + (question.unit ? " " + question.unit : "")];
  return [];
}

function questionKey(step, question) {
  const type = question.type || "mcq";
  const key = {
    step: step.step, id: question.id, type,
    conceptId: question.conceptId,
    supportingConceptIds: (question.supportingConceptIds || []).slice(),
    sourceIds: lectureIdsOf(question),
    difficulty: question.difficulty ?? null
  };
  if (type === "mcq") key.answer = question.answer;
  if (type === "msq") key.answers = (question.answers || question.correct || []).slice();
  if (type === "cloze" || type === "case-cloze") key.blanks = (question.blanks || []).map((b) => b.answer);
  if (type === "boss") key.steps = (question.steps || []).map((s) => s.answer);
  if (type === "match") key.rows = (question.rows || []).map((r) => r.answer);
  if (type === "numeric") { key.answer = question.answer; key.tolerance = question.tolerance || 0; }
  if (type === "short-answer") { key.rubric = (question.rubric || []).slice(); key.exemplar = question.exemplar || null; }

  /* The whole after-commit surface, in the order the panel prints it. */
  key.feedback = {
    ifCorrect: question.explanation || "",
    ifWrong: {
      perOption: perOptionFeedback(question),
      whatGovernsThisQuestion: question.explanation || "",
      completeAnswer: answerText(question)
    },
    whyItConnects: question.link || ""
  };
  return key;
}

function primerKey(step, question) {
  const level = step.primerLevel || 1;
  return {
    step: step.step, id: question.id, type: "primer",
    conceptId: question.conceptId,
    sourceIds: lectureIdsOf(question),
    scored: false,
    /* The reveal, as `renderPrimerResolved` prints it. Nothing is marked, so there is
       no answer — but the rule is withheld until the learner commits, so it belongs
       here and not in the candidate file. */
    revealedAfterPredicting: {
      heading: "Here is the rule you were reaching for",
      rule: question.primerFact || "",
      useItLikeThis: level >= 2 ? question.primerApplication : null,
      doNotConfuseItWith: level >= 3 ? question.primerMisconception : null,
      connectionToKeep: question.primerConnection || "",
      note: "Compare that against what you wrote."
    }
  };
}

/* ---- run ---------------------------------------------------------------------- */

const skeletons = fs.readdirSync(dir).filter((name) => name.endsWith(".queue.json")).sort();
if (!skeletons.length) {
  console.error(`No *.queue.json in ${dir}. Export them first with tools/browser-checks/export-run.js.`);
  process.exit(1);
}

const summary = [];
const errors = [];

for (const name of skeletons) {
  const skeleton = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
  if (skeleton.ok === false) { errors.push(`${name}: the browser export refused — ${skeleton.error}`); continue; }
  const course = courses[skeleton.subject];
  if (!course) { errors.push(`${name}: unknown subject ${skeleton.subject}`); continue; }

  const candidateSteps = [];
  const keySteps = [];
  const handoffs = Object.fromEntries((skeleton.handoffs || []).map((entry) => [entry.lectureId, entry]));
  for (const step of skeleton.queue) {
    if (step.kind === "lesson") {
      if (!lessons[step.lectureId]) { errors.push(`${name} step ${step.step}: no lesson for ${step.lectureId}`); continue; }
      candidateSteps.push(lessonView(step, handoffs[step.lectureId]));
      continue;
    }
    const question = (course.questions || {})[step.id];
    if (!question) { errors.push(`${name} step ${step.step}: ${skeleton.subject} carries no question ${step.id}`); continue; }
    if (step.kind === "primer") {
      candidateSteps.push(primerView(step, question, course));
      keySteps.push(primerKey(step, question));
    } else {
      candidateSteps.push(questionView(step, question));
      keySteps.push(questionKey(step, question));
    }
  }

  /* Recomputed from the skeleton, so a candidate file and a key file can be checked
     against each other and against the browser's own stamp. A mismatch means one of
     the three is from a different draw. */
  const digest = fnv1a(skeleton.queue.map((s) => s.kind + ":" + (s.lectureId || s.id)).join("|"));
  if (skeleton.queueDigest && skeleton.queueDigest !== digest) {
    errors.push(`${name}: skeleton digest ${skeleton.queueDigest} but its own queue hashes to ${digest}`);
  }

  /* ---- blindness, asserted rather than asserted-in-a-comment ------------------
   * The thing this got wrong before was not the data, it was the confidence: the
   * feedback sat on the candidate side under a comment saying it did not. So the
   * candidate object is searched for the shapes that would give the answer away —
   * by property name, and by the one string a primer must never print early. A hit
   * is fatal; a persona handed a leaky file is not a blind persona. */
  const LEAKY_KEYS = ["answer", "answers", "diagnoses", "diagnosis", "rubric", "exemplar",
    "explanation", "link", "misconceptions", "primerFact", "primerApplication",
    "primerConnection", "feedback", "_feedback", "nearMisses", "missDiagnosis", "tolerance"];
  (function scan(node, trail) {
    if (Array.isArray(node)) return node.forEach((item, i) => scan(item, `${trail}[${i}]`));
    if (!node || typeof node !== "object") return;
    for (const [prop, value] of Object.entries(node)) {
      if (LEAKY_KEYS.includes(prop)) errors.push(`${name}: candidate view carries '${prop}' at ${trail}`);
      scan(value, `${trail}.${prop}`);
    }
  })({ run: candidateSteps }, "candidate");

  /* LAW-63 in the export: the rule is what the learner predicts, so it cannot be on
     the primer's own surface before they commit.
     SCOPED TO THAT SURFACE ON PURPOSE. The first version searched the whole run and
     fired on all eight primers in four subjects — and was wrong every time. The rule
     is the concept's summary, so it is also the correct option of the `_explain` and
     `_repair_cloze` items LATER in the same run. A lesson or reveal preceding a
     scored question is LAW-47 doing its job, and a gate that calls it a leak forbids
     teaching. What the Law forbids is one surface holding both the question and its
     answer, so that is what this measures. (The three-strings-one-run observation is
     real and is reported in the persona findings, not enforced here.) */
  for (const view of candidateSteps) {
    if (view.kind !== "primer") continue;
    const primer = course.questions[view.id];
    if (primer.primerFact && JSON.stringify(view).includes(primer.primerFact)) {
      errors.push(`${name}: primer ${view.id} prints its own rule before the prediction`);
    }
  }

  const base = path.join(dir, `${skeleton.subject}-set${skeleton.set}`);
  const candidate = {
    subject: skeleton.subject, subjectTitle: skeleton.subjectTitle, set: skeleton.set,
    half: "learn", queueDigest: digest,
    schedule: skeleton.schedule,
    ladder: skeleton.schedule?.ladder || null,
    run: candidateSteps
  };
  fs.writeFileSync(`${base}.learn.json`, JSON.stringify(candidate, null, 1));
  fs.writeFileSync(`${base}.learn.key.json`, JSON.stringify({
    subject: skeleton.subject, set: skeleton.set, half: "learn", queueDigest: digest, key: keySteps
  }, null, 1));

  summary.push({
    subject: skeleton.subject, steps: candidateSteps.length,
    lessons: candidateSteps.filter((s) => s.kind === "lesson").length,
    primers: candidateSteps.filter((s) => s.kind === "primer").length,
    questions: candidateSteps.filter((s) => s.kind === "question").length,
    queueDigest: digest,
    candidateBytes: fs.statSync(`${base}.learn.json`).size,
    keyBytes: fs.statSync(`${base}.learn.key.json`).size
  });
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, dir, files: summary }, null, 2));
