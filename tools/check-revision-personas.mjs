/* Persona acceptance for the two short Examiner routes.
 *
 * These are the repository's three established experience lenses, expressed as
 * deterministic contracts rather than fictional learner scores:
 *
 * - Brilliant-but-lazy attacks Speedruns through visible option craft and tries to
 *   open a Mini without retrieving anything.
 * - Average Joe attempts each module normally and needs useful teaching immediately.
 * - Dumb-but-diligent completes everything offered and exposes hidden extra steps,
 *   bloated answer packs, or a route that mistakes activity for mastery.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const setDir = path.join(root, "app", "sets");
const files = [
  "t6_lessons.js", "t6_diagnoses.js", "t6_brgsa.js", "t6_catalog.js",
  "t6_integrated.js", "t6_ibm_case.js", "t6_challenges.js",
  "t6_final_sprints.js", "t6_mini_mocks.js"
];

function loadRelease() {
  const context = {window: {}, atob: (value) => Buffer.from(value, "base64").toString("binary")};
  vm.createContext(context);
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(setDir, file), "utf8"), context, {filename:file});
  return context.window;
}

function words(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function decisionSets(question) {
  const type = question.type || "mcq";
  if (type === "mcq") return [{options:question.options || [], answer:question.answer}];
  if (type === "boss") return (question.steps || []).map((step) => ({options:step.options || [], answer:step.answer}));
  if (type === "match") return (question.rows || []).map((row) => ({options:question.choices || [], answer:row.answer}));
  if (type === "cloze" || type === "case-cloze") return (question.blanks || []).map((blank) => ({options:blank.options || [], answer:blank.answer}));
  return [];
}

function speedrunWrittenSpine(question) {
  const exemplar = String(question.exemplar || "").trim();
  const sentences = exemplar.match(/[^.!?]+[.!?]+(?:[”'\"])?/g) || (exemplar ? [exemplar] : []);
  const selected = [];
  let count = 0;
  for (const sentence of sentences) {
    const clean = sentence.trim();
    const sentenceWords = words(clean);
    if (selected.length && count >= 45 && count + sentenceWords > 85) break;
    selected.push(clean);
    count += sentenceWords;
    if (count >= 55) break;
  }
  let spine = selected.join(" ");
  const link = String(question.link || "").trim();
  const linkWords = words(link);
  if (count < 45 && link && !spine.includes(link) && count + linkWords <= 85) spine += `${spine ? " " : ""}${link}`;
  return spine || [question.explanation, question.link].filter(Boolean).join(" ");
}

function strategyShare(sets, strategy) {
  if (!sets.length) return 0;
  let expected = 0;
  for (const set of sets) {
    const choices = strategy(set.options);
    if (choices.includes(set.answer)) expected += 1 / choices.length;
  }
  return Math.round(expected / sets.length * 1000) / 10;
}

const longest = (options) => {
  const lengths = options.map(words);
  const maximum = Math.max(...lengths);
  return lengths.map((length, index) => length === maximum ? index : -1).filter((index) => index >= 0);
};
const fixedFirst = (options) => options.length ? [0] : [];

export function auditRevisionPersonas() {
  const win = loadRelease();
  const app = fs.readFileSync(path.join(root, "app", "t6.js"), "utf8");
  const errors = [];
  const subjects = [];

  for (const courseId of ["SPMS", "BRGSA", "IBM", "SCLM"]) {
    const course = win.T6_COURSES?.[courseId];
    const cycle = win.T6_MINI_MOCKS?.build(courseId, 0);
    const pack = win.T6_FINAL_SPRINTS?.[courseId];
    const mini = win.T6_FINAL_SPRINTS?.build(courseId, 0);
    if (!course || !cycle || !pack || !mini) {
      errors.push(`${courseId}: missing Speedrun or Mini data`);
      continue;
    }

    const questionIds = cycle.rounds.flatMap((round) => round.questionIds);
    const questions = questionIds.map((id) => course.questions[id]).filter(Boolean);
    const decisions = questions.flatMap(decisionSets);
    const longestShare = strategyShare(decisions, longest);
    const fixedFirstShare = strategyShare(decisions, fixedFirst);

    /* Brilliant-but-lazy: neither familiar-looking length nor a fixed first click
       may beat the 30% craft ceiling across a complete Speedrun coverage cycle. */
    if (longestShare > 30) errors.push(`${courseId}: longest-option craft earns ${longestShare}% in Speedruns`);
    if (fixedFirstShare > 30) errors.push(`${courseId}: fixed-first craft earns ${fixedFirstShare}% in Speedruns`);

    /* Average Joe: every served question must have an immediate course explanation;
       written questions also need the exemplar used as the answer spine. */
    for (const question of questions) {
      if (!String(question.explanation || "").trim()) errors.push(`${question.id}: Speedrun has no immediate explanation`);
      if (question.type === "short-answer" && !String(question.exemplar || "").trim()) {
        errors.push(`${question.id}: written Speedrun has no answer spine`);
      }
      if (question.type === "short-answer") {
        const spineWords = words(speedrunWrittenSpine(question));
        if (spineWords < 40 || spineWords > 85) {
          errors.push(`${question.id}: written Speedrun spine is ${spineWords} words, outside the rapid-review budget`);
        }
      }
    }

    /* Dumb-but-diligent: the advertised eight-step shape stays literal, every round
       spans the course, and the full cycle really reaches every named concept. */
    for (const round of cycle.rounds) {
      if (round.questionIds.length !== 8) errors.push(`${courseId}: Speedrun ${round.index + 1} has ${round.questionIds.length}/8 questions`);
      if ([...new Set(round.modules)].sort((a, b) => a - b).join(",") !== "1,2,3,4,5,6,7,8") {
        errors.push(`${courseId}: Speedrun ${round.index + 1} does not span all modules`);
      }
    }
    if (cycle.uncoveredConceptIds.length) errors.push(`${courseId}: Speedrun cycle misses ${cycle.uncoveredConceptIds.join(", ")}`);

    /* Minis now deliberately expose selectable answers: the lazy learner still has
       to beat the same option-craft ceiling, while Joe gets the correction without
       producing prose and the diligent learner never finds a hidden ninth task. */
    const miniQuestions = mini.questions.filter(Boolean);
    const miniDecisions = miniQuestions.flatMap(decisionSets);
    const miniLongest = strategyShare(miniDecisions, longest);
    const miniFirst = strategyShare(miniDecisions, fixedFirst);
    if (miniLongest > 30) errors.push(`${courseId}: longest-option craft earns ${miniLongest}% in Minis`);
    if (miniFirst > 30) errors.push(`${courseId}: fixed-first craft earns ${miniFirst}% in Minis`);
    if (miniQuestions.length !== 8) errors.push(`${courseId}: Mini has ${miniQuestions.length}/8 questions`);
    if ([...new Set(mini.modules)].sort((a, b) => a - b).join(",") !== "1,2,3,4,5,6,7,8") {
      errors.push(`${courseId}: Mini does not span all modules`);
    }
    for (const question of miniQuestions) {
      if (["short-answer", "boss", "primer", "lesson"].includes(question.type)) errors.push(`${question.id}: Mini is not a rapid objective response`);
      if (!String(question.explanation || "").trim()) errors.push(`${question.id}: Mini has no immediate teaching`);
    }
    if (courseId === "SPMS") {
      const pTypes = miniQuestions.filter((question) => question.type === "msq");
      if (pTypes.length !== 3 || pTypes.some((question) => question.answers?.length !== 2)) {
        errors.push("SPMS: Mini does not carry three exactly-two P-type MSQs");
      }
    }

    subjects.push({
      courseId,
      brilliantButLazy:{longestOptionPct:longestShare, fixedFirstPct:fixedFirstShare, miniLongestOptionPct:miniLongest, miniFixedFirstPct:miniFirst},
      averageJoe:{speedrunQuestions:questions.length, immediateTeaching:questions.length, miniQuestions:miniQuestions.length},
      dumbButDiligent:{speedrunRounds:cycle.rounds.length, conceptsReached:cycle.targetConceptIds.length, miniSteps:miniQuestions.length}
    });
  }

  /* Browser behavior shared by all subjects: a constructed Speedrun is one commit;
     Minis progressively disclose one subject, enforce P-type controls, and never
     write mastery evidence. */
  if (!/session\.kind === "confidence-sprint"\) return finalizeSubjectiveAnswer\(\{deferRubric:true\}\)/.test(app)) {
    errors.push("Speedrun written answers still require a second rubric interaction");
  }
  if (!/Compare with the answer spine/.test(app) || !/cannot create Strong evidence without independent checking/.test(app)) {
    errors.push("Speedrun written feedback does not state its coaching and evidence limits");
  }
  if (!/function speedrunWrittenSpine\(question\)/.test(app)) errors.push("Written Speedruns do not bound their exemplar to a rapid answer spine");
  if (!/kind:"final-sprint"/.test(app)) errors.push("Minis do not start an interactive coached session");
  if (!/final-choice-grid/.test(app) || !/final-disclosure/.test(app)) errors.push("Mini information is not progressively disclosed after subject selection");
  if (!/else if \(chosen\.length < 2\) chosen\.push\(index\)/.test(app) || !/Clear response/.test(app)) {
    errors.push("P-type Minis do not enforce the two-selection cap and Clear response behaviour");
  }
  const miniRoute = app.slice(app.indexOf("function finalSprintData"), app.indexOf("function renderExamPaperCard"));
  if (/recordAttempt\(|recordWrittenPracticeEvidence\(|recordExamWrittenDiagnosis\(/.test(miniRoute)) {
    errors.push("Minis write learning or exam evidence despite being a last-minute self-check");
  }
  if (!/session\.kind !== "final-sprint"\) recordAttempt/.test(app)) errors.push("Interactive Minis are not explicitly excluded from mastery attempts");

  return {ok:errors.length === 0, errors, subjects};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditRevisionPersonas();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
