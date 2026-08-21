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
["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_ibm_case.js", "sets/t6_challenges.js"].forEach(function (rel) {
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
    .filter(function (q) {
      return !q.releasedCase && (q.type || "mcq") !== "primer" && (q.type || "mcq") === type;
    });
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

  /* ------------------------------------------------------------------ T2
   *
   * "Does it layer?" — the ladder test. Until now this file MEASURED the ladder and
   * asserted nothing about it, so a change that broke the sequence would have
   * printed a different set of numbers and exited 0. The four assertions are the
   * four claims the product makes on screen: the set list says a set is a step, the
   * paper card says how much of this paper Learn has taught, and both are lies if
   * the sequence has a hole in it.
   *
   * The fourth claim — that every lesson's "next lecture" promise is kept — cannot
   * be answered here. `lesson.connects` is the raw promise and the product already
   * qualifies it on screen when a route skips ahead, so reading the field would
   * report a defect the learner never sees. That answer belongs to the app, through
   * `window.__dungeonExport.handoffs()`, and this refuses to score it rather than
   * pass it by default. */
  var failures = [];

  /* 1 — sets 1..8 are modules 1..8, in order. */
  var steps = setConcepts.filter(function (s) { return s.module >= 1 && s.module <= 8; });
  if (steps.length !== 8) {
    failures.push("expected 8 laddered sets, found " + steps.length);
  }
  steps.forEach(function (s, index) {
    if (s.module !== index + 1) failures.push("set " + s.set + " is module " + s.module + ", expected " + (index + 1));
  });

  /* 2 — nothing rests on ground a later set covers.
   *
   * A set's questions may test concepts from earlier modules — that is layering
   * working. What must never happen is a set testing a concept first introduced
   * AFTER it, because the learner meets the surface before the idea. */
  var introducedAt = {};
  steps.forEach(function (s) {
    s.concepts.forEach(function (cid) {
      if (introducedAt[cid] === undefined) introducedAt[cid] = s.set;
    });
  });
  steps.forEach(function (s) {
    (course.runs.filter(function (run) { return run.id === s.set; })[0] || {questionPoolIds: []})
      .questionPoolIds.forEach(function (qid) {
        conceptsOf(course.questions[qid]).forEach(function (cid) {
          if (!conceptById[cid]) return;
          if (introducedAt[cid] > s.set) {
            failures.push("set " + s.set + " schedules " + qid + ", which rests on " + cid +
              " — first introduced in set " + introducedAt[cid]);
          }
        });
      });
  });

  /* 3 — cumulative coverage never descends and reaches the whole paper by set 8. */
  var previous = -1;
  ladder.forEach(function (row) {
    if (row.marksReachable < previous) {
      failures.push("coverage descends at set " + row.afterSet + ": " + row.marksReachable + " after " + previous);
    }
    previous = row.marksReachable;
  });
  var final = ladder[ladder.length - 1];
  if (!final || final.marksReachable !== availableMarks) {
    failures.push("set 8 reaches " + (final ? final.marksReachable : 0) + " of " + availableMarks +
      " marks; the ladder must carry a learner to the whole paper");
  }

  report[courseId].t2 = {
    laddered: steps.length,
    reachesWholePaper: Boolean(final && final.marksReachable === availableMarks),
    failures: failures
  };
});

/* The handoff half, which only the app can answer. Supply the JSON that
   `window.__dungeonExport.handoffs(lectureIds)` returned, per subject, and this
   scores it; without it the row reads `not-run` and the gate refuses to pass. A
   probe that cannot stage its evidence must not report a pass — three findings in
   this repository came from one that did. */
var handoffArg = process.argv.filter(function (a) { return a.indexOf("--handoffs=") === 0; })[0];
var handoffs = null;
if (handoffArg) {
  var handoffPath = handoffArg.slice("--handoffs=".length);
  handoffs = JSON.parse(fs.readFileSync(handoffPath, "utf8"));
}

report.handoffPromises = {};
COURSE_IDS.forEach(function (courseId) {
  if (!handoffs || !handoffs[courseId]) {
    report.handoffPromises[courseId] = {state: "not-run", note: "re-run with --handoffs=<file> from window.__dungeonExport.handoffs()"};
    return;
  }
  var rows = handoffs[courseId];
  var broken = rows.filter(function (row) {
    /* Field names are the app's own, read off `window.__dungeonExport.handoffs()`:
       `promisesNextLecture`, `kept`, and `note` — the correction the learner is shown
       when a run skips ahead. A promise is broken only when the lesson names the next
       lecture, the run does not deliver it, AND nothing on screen says so. Reading
       `lesson.connects` instead would report all fourteen of these as defects, which
       is the mistake §6 warns against. */
    return row.missing || (row.promisesNextLecture && !row.kept && !row.note);
  });
  report.handoffPromises[courseId] = {
    state: broken.length ? "fail" : "pass",
    checked: rows.length,
    broken: broken.map(function (row) { return row.lectureId; })
  };
});

console.log(JSON.stringify(report, null, 2));

if (process.argv.indexOf("--gate") >= 0) {
  var problems = [];
  COURSE_IDS.forEach(function (courseId) {
    (report[courseId].t2.failures || []).forEach(function (message) { problems.push(courseId + ": " + message); });
    var promises = report.handoffPromises[courseId];
    if (promises.state !== "pass") {
      problems.push(courseId + ": handoff promises " + promises.state +
        (promises.broken && promises.broken.length ? " (" + promises.broken.join(", ") + ")" : ""));
    }
  });
  if (problems.length) {
    console.error("\nT2 FAILED — the ladder does not hold:");
    problems.forEach(function (message) { console.error("  × " + message); });
    process.exit(1);
  }
  console.error("\nT2 passed: sets 1-8 are modules 1-8, nothing rests on later ground, coverage reaches every paper, handoff promises checked in the app.");
}
