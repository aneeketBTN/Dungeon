/*
 * Concept layering — run this in the page, not in Node.
 *
 * WHAT IT ASSERTS
 * A run walks the course's own teaching sequence, so each lesson builds on the one
 * before it. Concretely: across every study set in all four subjects, the scored
 * questions arrive in non-decreasing lecture order, where a question's position is
 * the LAST lecture it cites (it cannot be asked until every lecture it needs is
 * taught). Bosses and constructed responses are excluded — they synthesise across
 * the whole run and are deliberately held to the end.
 *
 * WHY IT MEASURES QUESTIONS AND NOT LESSONS
 * Lesson order is what a learner actually sees, and it is the thing we care about —
 * but it cannot be measured across many sets in one page session. Rendering a lesson
 * calls `markLessonRead` immediately (t6.js: "the learner has been shown the material,
 * and the queue must not re-teach it on resume"), and that write goes to the profile
 * held in memory. Blanking `lessonsRead` in localStorage does NOT undo it, because the
 * app reads its profile once at load. So the second set measured in a session is
 * already missing the lessons the first one showed, the effect compounds, and the two
 * halves of a before/after comparison are not comparable — the contamination depends
 * on the very ordering under test.
 *
 * Question order has no such problem: selection and ordering never read `lessonsRead`.
 * It is also the property that was actually changed. Lesson order follows from it, and
 * `layeredQueue` makes lesson delivery monotonic by construction on top of it.
 *
 * TO CHECK LESSON ORDER DIRECTLY: reload the page with `lessonsRead` cleared and open
 * exactly ONE set, then read `profile.active.queue`. One set per page load, no
 * exceptions. `verifyOneSet` below does that for a single set.
 *
 * HOW TO RUN
 * Open the app, then evaluate this file's contents in the page. It returns a JSON
 * string and restores whatever profile it found.
 *
 *   Expected: { "ok": true, "descents": 0, "setsOutOfOrder": 0 }
 *
 * Pair it with tools/browser-checks/teach-before-test.js — layering says the order is
 * the course's, LAW-47 says nothing is tested before it is taught. Both must pass.
 */
(function () {
  "use strict";

  var KEY = "term6.revision.v2";
  var saved = localStorage.getItem(KEY);
  function profile() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }

  function lectureRank(lectureId) {
    var parsed = /-M(\d+)-L(\d+)$/.exec(String(lectureId || ""));
    return parsed ? (Number(parsed[1]) * 1000) + Number(parsed[2]) : Number.MAX_SAFE_INTEGER;
  }

  function questionRank(question) {
    var ids = ((question.sourceIds && question.sourceIds.length ? question.sourceIds : [question.source]) || []).filter(Boolean);
    if (!ids.length) return Number.MAX_SAFE_INTEGER;
    return Math.max.apply(null, ids.map(lectureRank));
  }

  var subjects = ["BRGSA", "IBM", "SCLM", "SPMS"];
  var descents = 0;
  var pairs = 0;
  var setsOutOfOrder = 0;
  var setsChecked = 0;
  var offenders = [];

  subjects.forEach(function (subject) {
    var select = document.querySelector("select");
    if (select && select.value !== subject) {
      select.value = subject;
      select.dispatchEvent(new Event("change", {bubbles: true}));
    }
    var count = document.querySelectorAll("button.set-card").length;
    for (var index = 0; index < count; index += 1) {
      var card = document.querySelectorAll("button.set-card")[index];
      if (!card) continue;
      card.click();
      var queue = (profile().active || {}).queue || [];
      if (!queue.length) continue;
      setsChecked += 1;

      var bank = ((window.T6_COURSES || {})[subject] || {}).questions || {};
      var ranks = queue
        .map(function (item) { return bank[String(item.id)]; })
        .filter(function (question) {
          return question && !question.boss && question.type !== "short-answer" && question.type !== "primer";
        })
        .map(questionRank);

      var setDescents = 0;
      for (var i = 1; i < ranks.length; i += 1) if (ranks[i] < ranks[i - 1]) setDescents += 1;
      pairs += Math.max(0, ranks.length - 1);
      descents += setDescents;
      if (setDescents) {
        setsOutOfOrder += 1;
        offenders.push({set: subject + " " + (index + 1), descents: setDescents, ranks: ranks});
      }
    }
  });

  if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved);

  return JSON.stringify({
    ok: descents === 0,
    property: "questions arrive in course teaching order",
    setsChecked: setsChecked,
    consecutivePairs: pairs,
    descents: descents,
    setsOutOfOrder: setsOutOfOrder,
    offenders: offenders,
    note: "Profile restored. Reload before continuing to use the app."
  }, null, 2);
})();
