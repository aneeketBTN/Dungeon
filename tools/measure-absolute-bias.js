"use strict";

/*
 * Where does "eliminate the absolutes" get its 36-44% from?
 *
 * tools/run-persona-strategies.mjs measures the exploit end-to-end: dropping every
 * option carrying only / all / every / never / always / entirely / automatically /
 * simply scores 43.8% on SPMS, 36.2% on BRGSA and 36.0% on SCLM against 25% chance.
 * That says the rule works; it does not say where the signal is, and the fix depends
 * entirely on that.
 *
 * Two very different causes look identical from outside:
 *
 *   LOAD-BEARING   the misconception genuinely is an over-claim. "Transportation speed
 *                  ALONE determines performance" needs the word "alone" — strip it and
 *                  the distractor stops being the error it exists to catch.
 *   ARTEFACT       the correct answer is hedged and the distractors are absolute by
 *                  house style rather than by meaning, so the cue carries the answer
 *                  without carrying any content.
 *
 * The first is not a defect and must not be "fixed". The second is the whole exploit.
 * This separates them by measuring, per question family:
 *
 *   - the share of WRONG options carrying an absolute
 *   - the share of CORRECT options carrying one
 *   - the resulting signal: P(correct | no absolute) against the 25% baseline
 *
 * A family where both shares are similar leaks nothing however many absolutes it
 * contains. A family where wrong options are absolute and correct ones never are is
 * the artefact, and the fix is to make the correct answers carry them at the same rate
 * wherever that is true of the course — not to water the distractors down.
 */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..", "app");
var context = {window: {}, atob: function (v) { return Buffer.from(v, "base64").toString("binary"); }};
vm.createContext(context);
["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_ibm_case.js", "sets/t6_challenges.js"].forEach(function (rel) {
  var file = path.join(root, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, {filename: file});
});

var courses = context.window.T6_COURSES;
var ABSOLUTE = /\b(only|all|every|always|never|entirely|automatically|simply|any|no other|nothing else|cannot|must)\b/i;

/* A question's family, so a template fault can be told from an authoring one. The
   generated families end in a known suffix; anything else was hand-written. */
function familyOf(question) {
  var id = String(question.id);
  /* `_contrast` replaced the retired `_term_cloze` on 2026-08-15; both are listed so a
     template fault can be told from an authoring one either way. */
  var suffixes = ["_explain", "_apply", "_connect", "_contrast", "_term_cloze", "_bridge_cloze",
    "_repair_cloze", "_case_cloze", "_short_answer", "_case_answer", "_match", "_boss"];
  for (var i = 0; i < suffixes.length; i++) {
    if (id.indexOf(suffixes[i]) >= 0) return suffixes[i].replace(/^_/, "");
  }
  return "authored";
}

var families = {};
var overall = {correctWithAbsolute: 0, correctTotal: 0, wrongWithAbsolute: 0, wrongTotal: 0};

/* Every selectable option set, not only single-answer multiple choice.
 *
 * This used to measure `type === "mcq"` alone — 264 questions — because that is the
 * format the reported exploit was stated against. That left the cloze blanks and boss
 * steps unmeasured, and `boss` alone is 480 option sets: the largest family in the bank
 * and the one that hid for three sessions inside a bank-wide average. A family that is
 * never measured cannot be told from a family that is clean. */
function optionSetsOf(question) {
  var sets = [];
  if (Array.isArray(question.options) && typeof question.answer === "number") {
    sets.push({options: question.options, answer: question.answer});
  }
  (question.blanks || []).forEach(function (blank) {
    if (Array.isArray(blank.options) && typeof blank.answer === "number") {
      sets.push({options: blank.options, answer: blank.answer});
    }
  });
  (question.steps || []).forEach(function (step) {
    if (Array.isArray(step.options) && typeof step.answer === "number") {
      sets.push({options: step.options, answer: step.answer});
    }
  });
  return sets;
}

["SPMS", "BRGSA", "SCLM", "IBM"].forEach(function (courseId) {
  var course = courses[courseId];
  Object.keys(course.questions).forEach(function (id) {
    var question = course.questions[id];
    var family = familyOf(question);
    optionSetsOf(question).forEach(function (set) {
      if (set.options.length < 2) return;
      var row = families[family] || (families[family] = {
        questions: 0, correctWithAbsolute: 0, wrongWithAbsolute: 0, wrongTotal: 0,
        payoffTotal: 0, examples: []
      });
      if (row.payoffTotal === undefined) row.payoffTotal = 0;
      row.questions += 1;
      overall.correctTotal += 1;
      set.options.forEach(function (option, index) {
        var hasAbsolute = ABSOLUTE.test(option);
        if (index === set.answer) {
          if (hasAbsolute) { row.correctWithAbsolute += 1; overall.correctWithAbsolute += 1; }
        } else {
          row.wrongTotal += 1;
          overall.wrongTotal += 1;
          if (hasAbsolute) { row.wrongWithAbsolute += 1; overall.wrongWithAbsolute += 1; }
        }
      });
      /* The payoff the persona actually gets: drop every option carrying an absolute,
         then guess among what is left. Ties resolve to the expected value of a random
         pick among survivors — narrowing four to two scores 50, not 100 — which is the
         convention measure-learn-craft.mjs and measure-name-matching.js both use, so
         the three numbers mean the same thing. A rule that eliminates everything is a
         rule the candidate cannot apply, so it falls back to the full set. */
      var survivors = set.options.map(function (o, i) { return i; })
        .filter(function (i) { return !ABSOLUTE.test(set.options[i]); });
      if (!survivors.length) survivors = set.options.map(function (o, i) { return i; });
      row.payoffTotal += survivors.indexOf(set.answer) >= 0 ? 100 / survivors.length : 0;

      if (row.examples.length < 2 && !ABSOLUTE.test(set.options[set.answer])) {
        var absoluteWrongs = set.options.filter(function (o, i) { return i !== set.answer && ABSOLUTE.test(o); });
        if (absoluteWrongs.length === set.options.length - 1) {
          row.examples.push({id: question.id, correct: String(set.options[set.answer]).slice(0, 90)});
        }
      }
    });
  });
});

function pct(n, d) { return d ? Math.round((n / d) * 1000) / 10 : 0; }

var report = Object.keys(families).sort(function (a, b) {
  return families[b].questions - families[a].questions;
}).map(function (name) {
  var row = families[name];
  var correctShare = pct(row.correctWithAbsolute, row.questions);
  var wrongShare = pct(row.wrongWithAbsolute, row.wrongTotal);
  /* If a candidate drops every option carrying an absolute, what fraction of the
     time does the correct answer survive AND the distractors do not? */
  var cleanCorrect = row.questions - row.correctWithAbsolute;
  var cleanWrongPerQuestion = (row.wrongTotal - row.wrongWithAbsolute) / (row.questions || 1);
  var payoff = Math.round((row.payoffTotal / (row.questions || 1)) * 10) / 10;
  return {
    family: name,
    questions: row.questions,
    correctCarriesAbsolute: correctShare + "%",
    wrongCarriesAbsolute: wrongShare + "%",
    gap: Math.round((wrongShare - correctShare) * 10) / 10,
    eliminationPayoff: payoff,
    over: payoff > THRESHOLD,
    survivorsPerQuestion: Math.round((cleanCorrect / (row.questions || 1) + cleanWrongPerQuestion) * 100) / 100,
    examples: row.examples
  };
});

/* 30% is the T3 threshold for `noAbsolutes` and sits below the course's own SCLM paper
   (32.6), so a family at or under it leaks less than the assessment the student sits. */
var THRESHOLD = 30;
var failing = report.filter(function (row) { return row.eliminationPayoff > THRESHOLD; });

var output = {
  optionSetsMeasured: overall.correctTotal,
  chanceForFourOptions: 25,
  threshold: THRESHOLD,
  overall: {
    correctCarriesAbsolute: pct(overall.correctWithAbsolute, overall.correctTotal) + "%",
    wrongCarriesAbsolute: pct(overall.wrongWithAbsolute, overall.wrongTotal) + "%",
    questions: overall.correctTotal
  },
  byFamily: report
};

if (process.argv.indexOf("--table") >= 0) {
  console.log("Absolutes elimination payoff — " + output.optionSetsMeasured + " option sets, chance 25%\n");
  console.log("FAMILY".padEnd(14) + "SETS".padStart(6) + "PAYOFF".padStart(9) + "CORRECT%".padStart(10) + "WRONG%".padStart(9));
  report.forEach(function (row) {
    console.log(row.family.padEnd(14) + String(row.questions).padStart(6) +
      (row.eliminationPayoff + "%").padStart(9) + row.correctCarriesAbsolute.padStart(10) +
      row.wrongCarriesAbsolute.padStart(9) + (row.over ? "   OVER" : ""));
  });
} else {
  console.log(JSON.stringify(output, null, 2));
}

if (process.argv.indexOf("--gate") >= 0 && failing.length) {
  console.error("\nFAIL: " + failing.length + " family/families over the " + THRESHOLD + "% absolutes-elimination limit: " +
    failing.map(function (r) { return r.family + " " + r.eliminationPayoff + "%"; }).join(", "));
  process.exit(1);
}
