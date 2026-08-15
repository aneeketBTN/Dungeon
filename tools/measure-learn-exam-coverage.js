"use strict";

/*
 * How much of the examiner has Learn actually taught?
 *
 * The owner's fourth goal is that "Examiner needs to stand where students go to
 * get tested on topics they've been taught. So it doesn't feel foreign." This
 * measures the gap between the two sides directly, per subject:
 *
 *   - what each study set introduces (its concepts, in teaching order)
 *   - what the examiner's pool draws from (every concept in the bank)
 *   - the share of exam marks a learner has been taught after set 1, set 2, ...
 *
 * examPool() and examShuffle() are mirrored from app/t6.js rather than imported,
 * because t6.js is a DOM-bound IIFE with no exports. They are ten lines each and
 * deterministic; the paper composition this prints is cross-checked against the
 * real app in the browser. Do not grow this mirror — anything subtler belongs in
 * tools/browser-checks/ against the real queue.
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
var COURSE_IDS = ["SPMS", "BRGSA", "SCLM", "IBM"];

/* Mirrored from app/t6.js EXAM_PAPERS — section shape only. */
var PAPERS = {
  SPMS: {sections: [{id: "A", type: "mcq", count: 35, marks: 1}, {id: "B", type: "msq", count: 20, marks: 2}]},
  BRGSA: {sections: [{id: "A", type: "mcq", count: 20, marks: 2}, {id: "B", type: "case-cloze", count: 4, marks: 5}, {id: "C", type: "short-answer", count: 2, marks: 10}]},
  SCLM: {sections: [{id: "A", type: "mcq", count: 50, marks: 1}, {id: "B", type: "numeric", count: 6, marks: 4}, {id: "C", type: "match", count: 3, marks: 2}]},
  IBM: {sections: [{id: "A", type: "short-answer", count: 10, marks: 10}]}
};

function examShuffle(items, seed) {
  var out = items.slice();
  var state = seed >>> 0 || 1;
  for (var i = out.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    var j = state % (i + 1);
    var swap = out[i]; out[i] = out[j]; out[j] = swap;
  }
  return out;
}

function examSeed(courseId, setIndex) {
  var base = 2166136261;
  for (var i = 0; i < courseId.length; i++) {
    base = (base ^ courseId.charCodeAt(i)) >>> 0;
    base = (base * 16777619) >>> 0;
  }
  return (base + (setIndex + 1) * 2654435761) >>> 0;
}

function examPool(course, type) {
  return Object.keys(course.questions).map(function (k) { return course.questions[k]; })
    .filter(function (q) { return (q.type || "mcq") !== "primer" && (q.type || "mcq") === type; });
}

function conceptsOf(question) {
  return [question.conceptId].concat(question.supportingConceptIds || []).filter(Boolean);
}

var report = {};

COURSE_IDS.forEach(function (courseId) {
  var course = courses[courseId];
  var spec = PAPERS[courseId];
  var conceptOrder = course.concepts.slice().sort(function (a, b) { return a.module - b.module; });
  var conceptById = {};
  course.concepts.forEach(function (c) { conceptById[c.id] = c; });

  /* What each study set introduces. Set N (1..8) is module N's pool; 9 and 10 are
     cross-cutting, so they are reported but not treated as a teaching step. */
  var setConcepts = [];
  course.runs.forEach(function (run) {
    var ids = {};
    (run.questionPoolIds || []).forEach(function (qid) {
      conceptsOf(course.questions[qid]).forEach(function (cid) { if (conceptById[cid]) ids[cid] = true; });
    });
    setConcepts.push({set: run.id, module: run.module || null, title: run.title,
      count: run.questionCount, concepts: Object.keys(ids)});
  });

  /* The real paper, set 1. */
  var paper = [];
  spec.sections.forEach(function (section) {
    var pool = examShuffle(examPool(course, section.type), examSeed(courseId, 0) + section.id.charCodeAt(0));
    pool.slice(0, section.count).forEach(function (q) {
      paper.push({section: section.id, marks: section.marks, concepts: conceptsOf(q), id: q.id});
    });
  });
  var availableMarks = paper.reduce(function (s, r) { return s + r.marks; }, 0);

  /* Marks reachable after finishing sets 1..N, where "taught" means every concept
     the question rests on has been introduced. A question testing a taught concept
     and an untaught one is not a taught question. */
  var taught = {};
  var ladder = [];
  setConcepts.filter(function (s) { return s.module >= 1 && s.module <= 8; }).forEach(function (s) {
    s.concepts.forEach(function (cid) { taught[cid] = true; });
    var reachable = paper.filter(function (row) {
      return row.concepts.length && row.concepts.every(function (cid) { return taught[cid]; });
    });
    ladder.push({afterSet: s.set, conceptsTaught: Object.keys(taught).length,
      marksReachable: reachable.reduce(function (sum, r) { return sum + r.marks; }, 0),
      questionsReachable: reachable.length});
  });

  var paperConcepts = {};
  paper.forEach(function (r) { r.concepts.forEach(function (c) { paperConcepts[c] = true; }); });

  report[courseId] = {
    conceptsInCourse: course.concepts.length,
    conceptsOnPaper: Object.keys(paperConcepts).length,
    paperQuestions: paper.length,
    availableMarks: availableMarks,
    afterSet1: ladder.length ? {
      taught: ladder[0].conceptsTaught,
      marks: ladder[0].marksReachable,
      pct: Math.round((ladder[0].marksReachable / availableMarks) * 1000) / 10
    } : null,
    ladder: ladder.map(function (row) {
      return "set " + row.afterSet + ": " + row.conceptsTaught + " concepts taught → " +
        row.marksReachable + "/" + availableMarks + " marks (" +
        Math.round((row.marksReachable / availableMarks) * 1000) / 10 + "%)";
    }),
    sets: setConcepts.map(function (s) {
      return "set " + s.set + (s.module ? " (module " + s.module + ")" : " (" + s.title + ")") +
        ": " + s.concepts.length + " concepts, " + s.count + " questions";
    })
  };
});

console.log(JSON.stringify(report, null, 2));
