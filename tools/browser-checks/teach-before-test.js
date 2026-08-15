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
  var skipped = [];

  /* A saved run resumes straight into the practice screen, so the dashboard never
   * renders and every set button this looks for is absent. The loop below then finds
   * nothing, skips silently, and the result reads `ok: true` over three checks instead
   * of twelve — which is how this check reported clean while measuring a third of what
   * it claims to. Say so instead. */
  if (!document.getElementById("dashboard-screen").classList.contains("active")) {
    skipped.push("dashboard was not on screen — the app resumed into a saved run, so no set could be started");
  }

  /* Nine, not ten. Set 10's card is labelled `P` rather than a number (LAW-62's note),
     so it has never matched this loop — and now that an unreached route makes the
     result not-ok, asking for it would fail the check on a known absence rather than
     on a defect. It is reached through the builder instead. */
  for (var setNumber = 1; setNumber <= 9; setNumber += 1) {
    if (!startSet(setNumber)) { skipped.push("set " + setNumber + ": no matching set button"); continue; }
    var result = inspect((profile().active || {}).courseId || profile().selectedCourse, "set " + setNumber);
    results.push(result.where + ": " + result.items + " items, " + result.violations.length + " violations");
    violations = violations.concat(result.violations);
  }

  /* The builder takes a different path into layeredQueue, so check it too — once per
   * preset. The 0 → 60 sweep matters most here: it is the only route that selects its
   * own questions rather than going through `selectQuestionsFromPool`, and it is the
   * one that puts every concept in the subject into a single run, so it owes the
   * longest lesson list of anything the app builds. */
  var toggle = document.getElementById("builder-toggle");
  if (toggle && document.getElementById("practice-builder").hidden) toggle.click();
  var presetCount = document.querySelectorAll("#builder-presets .preset-card").length;
  for (var preset = 0; preset < presetCount; preset += 1) {
    var state = profile();
    state.active = null;
    state.lessonsRead = {};
    write(state);
    if (document.getElementById("practice-builder").hidden) toggle.click();
    var card = document.querySelectorAll("#builder-presets .preset-card")[preset];
    var range = card.querySelector(".preset-range").textContent.trim();
    card.click();
    var start = document.getElementById("builder-start");
    if (start.disabled) { skipped.push("builder " + range + ": start button disabled"); continue; }
    start.click();
    var presetResult = inspect((profile().active || {}).courseId || profile().selectedCourse, "builder " + range);
    results.push(presetResult.where + ": " + presetResult.items + " items, " + presetResult.violations.length + " violations");
    violations = violations.concat(presetResult.violations);
    var leave = document.getElementById("leave-practice");
    if (leave) leave.click();
  }

  if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved);

  return JSON.stringify({
    /* Coverage is part of the verdict. A pass over three routes is not the pass this
       check advertises, so anything it could not reach makes the result not-ok. */
    ok: violations.length === 0 && skipped.length === 0,
    law: "LAW-47",
    checked: results,
    violations: violations,
    skipped: skipped,
    note: "Profile restored. Re-load the page before continuing to use the app."
  }, null, 2);
})();
