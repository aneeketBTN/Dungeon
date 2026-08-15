/*
 * Can the concept's own name pick the answer?  (CONTENT-RULES R3, "on-topic-ness")
 *
 * WHY THIS EXISTS
 * R3 has said since it was written that "every option must name the concept, or none
 * may", and its gate column said **none yet**. A rule with no gate behind it is a rule
 * that comes back — which is how LAW-61 recurred after an 816-question manual audit.
 * `tools/measure-learn-craft.mjs` sees this exploit, but only over the ~13 selectable
 * parts of one delivered set-1 run per subject, so a family that leaks 100% across the
 * whole bank can hide behind a run that happened to schedule two of its items.
 *
 * This measures every option set in the built bank — 1000+ of them — and reports the
 * payoff per FAMILY, because a bank-wide average hides a family that leaks 50%. It is
 * the standing gate for the "on-topic-ness" row of R3.
 *
 * WHAT IT MEASURES
 * The rule a learner can apply having read only the set's heading: "keep the options
 * that name the thing this set is about, and guess among those." Scoring matches
 * measure-learn-craft.mjs exactly — same stop list, same >3-character content words,
 * same substring test, same argmax, same expected-value-over-survivors — so the two
 * numbers are comparable and a change here means the same thing there.
 *
 * ARGMAX, NOT PRESENCE. The rule keeps only the options scoring highest. A distractor
 * that mentions the concept less densely than the correct answer still loses, so
 * "every distractor mentions it" is not the bar; matching its density is. Measured
 * 2026-08-15: 195 of 384 explain/apply distractors named their concept and the family
 * still paid 66%.
 *
 * WHY NOT JUST NEUTRALISE THE NAMES
 * Rejected on evidence, 2026-08-15. Stripping each concept's name from its own prose
 * drives every family to 21.8-27.1%, and produces "Lean this idea asks whether real
 * people will take a real action", "a payment or signed it is a different category"
 * and "starts from the this idea position". That moves the metric by destroying the
 * sentence, which is the mirror of watering down a distractor. It also takes `connect`
 * from 0.5% to 26.6%, because connect is already correct and the fix is not universal.
 * The direction that preserves prose is connect's: name the concept in EVERY option.
 *
 * USAGE
 *   node tools/measure-name-matching.js            # report
 *   node tools/measure-name-matching.js --gate     # exit 1 if any family is over
 *   node tools/measure-name-matching.js --json
 */

"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.join(__dirname, "..");

/* The real load order. t6_catalog.js builds BRGSA's course only once t6_brgsa.js has
   defined window.T6_COURSE, so loading the catalog alone silently yields 48 concepts
   instead of 64 and every BRGSA number reads as absent rather than wrong. */
var LOAD_ORDER = [
  "app/sets/t6_brgsa.js",
  "app/sets/t6_catalog.js",
  "app/sets/t6_integrated.js",
  "app/sets/t6_challenges.js"
];

/* Per-family ceilings. 32% is measure-learn-craft's topicMatch threshold and sits just
   above the 25% four-option chance line; a family at or under it is not offering the
   rule anything. `connect` is held to a tighter 10% because it already measures 0.5%
   and a regression there is the most likely way this fix gets undone. */
var THRESHOLD = 32;
var THRESHOLDS = {connect: 10};

var STOP = ["the","a","an","and","or","of","to","in","for","is","are","be","on","at","it",
  "its","as","by","that","this","with","from","not","but","than"];
var STOP_SET = {};
STOP.forEach(function (word) { STOP_SET[word] = true; });

function contentWords(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/)
    .filter(function (word) { return word.length > 3 && !STOP_SET[word]; });
}

function score(option, words) {
  var text = String(option).toLowerCase();
  return words.filter(function (word) { return text.indexOf(word) >= 0; }).length;
}

/* Expected value of the rule, not a hit/miss. Narrowing four options to two scores 50,
   which is what the rule actually achieves — the same convention measure-learn-craft
   uses, so the numbers stay comparable. */
function payoff(options, answer, conceptName) {
  var words = contentWords(conceptName);
  if (!words.length || !Array.isArray(options) || options.length < 2) return null;
  if (typeof answer !== "number" || answer < 0 || answer >= options.length) return null;
  var scores = options.map(function (option) { return score(option, words); });
  var best = Math.max.apply(null, scores);
  if (!best) return 100 / options.length;
  var survivors = scores.filter(function (value) { return value === best; }).length;
  return scores[answer] === best ? 100 / survivors : 0;
}

/* `contrast` replaced the retired `term_cloze` on 2026-08-15. `term_cloze` stays in the
   pattern so a reintroduction is reported under its own name rather than silently
   folded into "other" — which is what happened to `boss` for three sessions. */
var FAMILY_PATTERN = /_(contrast|term_cloze|case_cloze|bridge_cloze|repair_cloze|explain|apply|connect|short_answer|primer)$/;

/* Every new content family needs its own row here, so a template fault can be told
   from an authoring one. An id matching nothing lands in "other" rather than being
   dropped — a silently skipped family is how a leak survives a green gate. */
function familyOf(id) {
  var match = String(id || "").match(FAMILY_PATTERN);
  if (match) return match[1];
  if (/_boss(_|$)/.test(id)) return "boss";
  if (/_match(_|$)/.test(id)) return "match";
  return "other";
}

function loadCourses() {
  var sandbox = {window: {}, console: console};
  vm.createContext(sandbox);
  LOAD_ORDER.forEach(function (relative) {
    var full = path.join(ROOT, relative);
    if (!fs.existsSync(full)) {
      throw new Error("missing bank file " + relative + " — every load list must carry it");
    }
    vm.runInContext(fs.readFileSync(full, "utf8"), sandbox, {filename: relative});
  });
  var courses = sandbox.window.T6_COURSES;
  if (!courses || !Object.keys(courses).length) throw new Error("no courses built from " + LOAD_ORDER.join(", "));
  return courses;
}

/* One selectable option set per entry, flattened so every format is measured the same
   way: an mcq's options, each cloze blank, each boss step. */
function optionSets(question) {
  var sets = [];
  if (Array.isArray(question.options) && typeof question.answer === "number") {
    sets.push({options: question.options, answer: question.answer, part: "options"});
  }
  (question.blanks || []).forEach(function (blank, index) {
    if (Array.isArray(blank.options) && typeof blank.answer === "number") {
      sets.push({options: blank.options, answer: blank.answer, part: "blank" + index});
    }
  });
  (question.steps || []).forEach(function (step, index) {
    if (Array.isArray(step.options) && typeof step.answer === "number") {
      sets.push({options: step.options, answer: step.answer, part: "step" + index});
    }
  });
  return sets;
}

function measure() {
  var courses = loadCourses();
  var families = {};
  var subjects = {};
  var worst = [];
  var measured = 0;

  Object.keys(courses).forEach(function (courseId) {
    var course = courses[courseId];
    Object.keys(course.questions || {}).forEach(function (questionId) {
      var question = course.questions[questionId];
      /* The concept name as the learner meets it. `node` is what the run prints and
         what the export hands a persona, so it is the right string to key on. */
      var conceptName = question.node || "";
      optionSets(question).forEach(function (set) {
        var value = payoff(set.options, set.answer, conceptName);
        if (value === null) return;
        measured++;
        var family = familyOf(question.id);

        families[family] = families[family] || {family: family, sets: 0, total: 0, hundred: 0};
        families[family].sets++;
        families[family].total += value;
        if (value === 100) families[family].hundred++;

        var key = courseId + "|" + family;
        subjects[key] = subjects[key] || {courseId: courseId, family: family, sets: 0, total: 0};
        subjects[key].sets++;
        subjects[key].total += value;

        if (value === 100) {
          worst.push({courseId: courseId, id: question.id, family: family, part: set.part,
            answer: String(set.options[set.answer]).slice(0, 70)});
        }
      });
    });
  });

  var rows = Object.keys(families).map(function (name) {
    var entry = families[name];
    var limit = Object.prototype.hasOwnProperty.call(THRESHOLDS, name) ? THRESHOLDS[name] : THRESHOLD;
    return {
      family: name,
      sets: entry.sets,
      percent: Math.round((entry.total / entry.sets) * 10) / 10,
      hundredPayoffSets: entry.hundred,
      threshold: limit,
      over: (entry.total / entry.sets) > limit
    };
  }).sort(function (a, b) { return b.percent - a.percent; });

  var perSubject = Object.keys(subjects).map(function (key) {
    var entry = subjects[key];
    return {courseId: entry.courseId, family: entry.family, sets: entry.sets,
      percent: Math.round((entry.total / entry.sets) * 10) / 10};
  }).sort(function (a, b) { return b.percent - a.percent; });

  return {optionSetsMeasured: measured, chanceForFourOptions: 25, byFamily: rows,
    bySubjectFamily: perSubject, hundredPayoffExamples: worst.slice(0, 40),
    hundredPayoffTotal: worst.length};
}

var report = measure();
var failing = report.byFamily.filter(function (row) { return row.over; });

if (process.argv.indexOf("--json") >= 0) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Name-matching payoff (CONTENT-RULES R3) — " + report.optionSetsMeasured +
    " option sets, chance is 25%\n");
  console.log("FAMILY".padEnd(14) + "SETS".padStart(6) + "PAYOFF".padStart(9) +
    "LIMIT".padStart(7) + "  100%-SETS");
  report.byFamily.forEach(function (row) {
    console.log(row.family.padEnd(14) + String(row.sets).padStart(6) +
      (row.percent + "%").padStart(9) + (row.threshold + "%").padStart(7) +
      String(row.hundredPayoffSets).padStart(11) + (row.over ? "   OVER" : ""));
  });
  console.log("\n" + report.hundredPayoffTotal + " option sets where the rule pays 100% " +
    "(the correct answer is the only option naming the concept).");
  if (failing.length) {
    console.log("\nOver the limit: " + failing.map(function (row) { return row.family; }).join(", "));
  }
}

if (process.argv.indexOf("--gate") >= 0 && failing.length) {
  console.error("\nFAIL: " + failing.length + " family/families over the R3 name-matching limit.");
  process.exit(1);
}
