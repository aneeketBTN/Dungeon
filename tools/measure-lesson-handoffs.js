"use strict";

/*
 * Does a lesson's closing sentence describe the lesson that actually comes next?
 *
 * `lesson-layering.js` proves the delivered order is monotone in the course's own
 * sequence — 40 sets, 253 pairs, 0 descents. That is a different claim from the one
 * the prose makes. Every lesson closes with a handoff ("the next lecture sorts
 * them", "the next lecture answers that"), and the bank cites 16 lectures out of
 * fifty-odd per subject, so the lecture a lesson hands off TO is very often one no
 * run will ever deliver. Order can be perfect while every promise in it is broken.
 *
 * Students hit exactly this: BRGSA's lesson 1 closed "The next lecture is the
 * cheapest one: the smoke test" and the next screen was pre-sales; IBM's lesson 3
 * closed "The next lecture sorts them" and the next screen was lesson 7 — and the
 * skipped lecture's material was then examined for ten marks. Two of three readers
 * stopped and went back convinced they had missed something.
 *
 * This measures the structural fact behind the prose: for each subject, walk the
 * cited lectures in teaching order and count the steps that skip at least one
 * lecture that has an authored lesson. A skip is where a handoff can be broken.
 */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..", "app");
var context = {window: {}, atob: function (v) { return Buffer.from(v, "base64").toString("binary"); }};
vm.createContext(context);
["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_challenges.js"].forEach(function (rel) {
  var file = path.join(root, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, {filename: file});
});

var courses = context.window.T6_COURSES;
var lessons = context.window.T6_LESSONS || {};

function rank(id) {
  var m = /-M(\d+)-L(\d+)$/.exec(String(id || ""));
  return m ? Number(m[1]) * 1000 + Number(m[2]) : Number.MAX_SAFE_INTEGER;
}

/* Prose that promises the very next thing, as opposed to prose that merely points
   somewhere. Only the first kind can be falsified by a skip. */
var PROMISES_NEXT = /\bthe next lecture\b|\bnext lecture\b|\bnext, we\b|\bthe next one\b/i;

var report = {};
["SPMS", "BRGSA", "SCLM", "IBM"].forEach(function (courseId) {
  var course = courses[courseId];
  var cited = [];
  course.concepts.forEach(function (concept) {
    if (cited.indexOf(concept.source) < 0) cited.push(concept.source);
  });
  cited.sort(function (a, b) { return rank(a) - rank(b); });

  var authored = Object.keys(lessons).filter(function (id) { return id.indexOf(courseId + "-") === 0; })
    .sort(function (a, b) { return rank(a) - rank(b); });

  var steps = [];
  for (var i = 0; i < cited.length - 1; i++) {
    var from = cited[i], to = cited[i + 1];
    var skipped = authored.filter(function (id) { return rank(id) > rank(from) && rank(id) < rank(to); });
    var lesson = lessons[from] || {};
    var connects = String(lesson.connects || "");
    steps.push({
      from: from, to: to,
      skippedAuthored: skipped.length,
      promisesNext: PROMISES_NEXT.test(connects),
      /* A promise made across a skip is the falsifiable case. */
      atRisk: skipped.length > 0 && PROMISES_NEXT.test(connects),
      connects: connects.slice(0, 110)
    });
  }

  report[courseId] = {
    citedLectures: cited.length,
    authoredLessons: authored.length,
    handoffSteps: steps.length,
    stepsThatSkip: steps.filter(function (s) { return s.skippedAuthored > 0; }).length,
    promisesTheNextLecture: steps.filter(function (s) { return s.promisesNext; }).length,
    brokenPromises: steps.filter(function (s) { return s.atRisk; }).length,
    examples: steps.filter(function (s) { return s.atRisk; }).slice(0, 3).map(function (s) {
      return s.from + " → " + s.to + " (skips " + s.skippedAuthored + "): \"" + s.connects + "…\"";
    })
  };
});

console.log(JSON.stringify(report, null, 2));
