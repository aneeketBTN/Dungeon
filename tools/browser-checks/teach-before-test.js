/*
 * LAW-47 verification — run this in the page, not in Node.
 *
 * WHY THIS IS A BROWSER CHECK AND NOT A UNIT TEST
 * The invariant is a property of the *built queue*, and `layeredQueue()` lives
 * inside t6.js's IIFE with no export. Re-implementing it in Node would create a
 * second copy of the scheduling rules that drifts from the real one and reports
 * green while the app is broken. So this drives the actual app and reads the
 * actual queue out of the saved profile.
 *
 * WHY IT EXISTS AT ALL
 * LAW-47 says a learner may not meet a surface citing a lecture they have not
 * been taught. That was implemented, commented as done, and still had a hole:
 * the gate ran on the scored question's sourceIds and then pushed the primer
 * without checking the primer's own. The comment asserted the primer was
 * covered; only executing this check found otherwise. A comment claiming an
 * invariant is not the invariant.
 *
 * HOW TO RUN
 * Open the app, then evaluate this file's contents in the page — via the
 * Browser tool's javascript_tool, or pasted into DevTools. It returns a JSON
 * string. It runs from an EMPTY lessonsRead (the strictest case) and restores
 * whatever profile it found when it finishes.
 *
 *   Expected result: { "ok": true, "checked": [...], "violations": [] }
 *
 * Any violation is a REDLINE failure. Do not ship past it.
 */
(function () {
  "use strict";

  var KEY = "term6.revision.v2";
  var saved = localStorage.getItem(KEY);

  function profile() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  function write(next) { localStorage.setItem(KEY, JSON.stringify(next)); }

  function courseBank(courseId) {
    var courses = window.T6_COURSES || {};
    var course = courses[courseId] || window.T6_COURSE;
    return (course && (course.questions || course.bank)) || {};
  }

  function lecturesOf(question) {
    if (!question) return [];
    var ids = (question.sourceIds && question.sourceIds.length) ? question.sourceIds : [question.source];
    return ids.filter(Boolean);
  }

  /* The check itself: for every non-lesson surface in the queue — scored
   * question AND primer alike, each on its own sourceIds — any lecture that has
   * a lesson must already be read, or have its lesson earlier in the queue. */
  function inspect(courseId, label) {
    var state = profile();
    var queue = (state.active || {}).queue || [];
    var read = state.lessonsRead || {};
    var bank = courseBank(courseId);
    var lessons = window.T6_LESSONS || {};

    var lessonAt = {};
    queue.forEach(function (item, index) {
      var id = String(item.id);
      if (id.indexOf("lesson:") !== 0) return;
      var lectureId = id.slice("lesson:".length).split("|")[0];
      if (lessonAt[lectureId] === undefined) lessonAt[lectureId] = index;
    });

    var violations = [];
    queue.forEach(function (item, index) {
      var id = String(item.id);
      if (id.indexOf("lesson:") === 0) return;
      var question = bank[id];
      if (!question) return;
      lecturesOf(question).forEach(function (lectureId) {
        if (!lessons[lectureId]) return;          // nothing authored for it yet
        if (read[lectureId]) return;              // already taught
        if (lessonAt[lectureId] !== undefined && lessonAt[lectureId] < index) return;
        violations.push({
          where: label,
          surface: id,
          at: index,
          isPrimer: !!item.primer,
          citesUntaught: lectureId,
          lessonAt: lessonAt[lectureId] === undefined ? "absent from queue" : lessonAt[lectureId]
        });
      });
    });

    return { where: label, items: queue.length, violations: violations };
  }

  function startSet(setNumber) {
    var state = profile();
    state.active = null;
    state.lessonsRead = {};                        // strictest case: nothing taught
    write(state);
    var pattern = new RegExp("^" + setNumber + "(?![0-9])");
    var button = Array.prototype.slice.call(document.querySelectorAll("button")).filter(function (b) {
      var text = (b.textContent || "").trim();
      return pattern.test(text) && /questions/.test(text);
    })[0];
    if (!button) return false;
    button.click();
    return true;
  }

  var results = [];
  var violations = [];

  for (var setNumber = 1; setNumber <= 10; setNumber += 1) {
    if (!startSet(setNumber)) continue;
    var result = inspect((profile().active || {}).courseId || profile().selectedCourse, "set " + setNumber);
    results.push(result.where + ": " + result.items + " items, " + result.violations.length + " violations");
    violations = violations.concat(result.violations);
  }

  // The mixed builder takes a different path into layeredQueue, so check it too.
  var state = profile();
  state.active = null;
  state.lessonsRead = {};
  write(state);
  var mixed = Array.prototype.slice.call(document.querySelectorAll("button")).filter(function (b) {
    return /Start this practice/.test(b.textContent || "");
  })[0];
  if (mixed) {
    mixed.click();
    var mixedResult = inspect((profile().active || {}).courseId || profile().selectedCourse, "mixed builder");
    results.push(mixedResult.where + ": " + mixedResult.items + " items, " + mixedResult.violations.length + " violations");
    violations = violations.concat(mixedResult.violations);
  }

  if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved);

  return JSON.stringify({
    ok: violations.length === 0,
    law: "LAW-47",
    checked: results,
    violations: violations,
    note: "Profile restored. Re-load the page before continuing to use the app."
  }, null, 2);
})();
