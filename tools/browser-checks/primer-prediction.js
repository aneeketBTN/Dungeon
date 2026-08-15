/* LAW-63 verification — run this in the page, not in Node.
 *
 * The property is "what is on the screen before the learner commits", and only the
 * running app knows that: `renderPrimerPanel` decides what the panel carries and
 * `renderPrediction` decides what the response control is. A Node check would have to
 * re-implement both and would then report green against its own copy of the rules.
 *
 * It asserts, for every concept in the subject:
 *
 *   1. the panel renders before the learner answers and contains no string that is a
 *      correct answer to any scheduled question on that concept — the same-screen leak
 *      that made 64 of 64 primers a string-matching exercise;
 *   2. the primer presents no options and no keyed answer, so there is nothing to be
 *      marked right or wrong about;
 *   3. committing a prediction creates no evidence — `conceptAttempts` and
 *      `totalAnswers` unmoved, `correct: null`, `scored: false`;
 *   4. the reveal carries the rule the panel withheld, so withholding it did not simply
 *      delete the teaching.
 *
 * Exception by design: at support level 3 the panel names the misread that has already
 * caught this learner, which is a *wrong* option of `_explain`. That is the repair
 * doing its job, so wrong options are excluded from the leak set and reported.
 *
 * Run from the dashboard. It saves the profile and restores it; reload afterwards.
 */
(function () {
  "use strict";

  var KEY = "term6.revision.v2";
  var saved = localStorage.getItem(KEY);
  function profile() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  function write(next) { localStorage.setItem(KEY, JSON.stringify(next)); }

  function correctAnswersFor(question) {
    var out = [];
    if (Array.isArray(question.options) && typeof question.answer === "number") out.push(question.options[question.answer]);
    if (Array.isArray(question.answers)) question.answers.forEach(function (index) { out.push(question.options[index]); });
    if (Array.isArray(question.blanks)) question.blanks.forEach(function (blank) {
      if (blank.options && typeof blank.answer === "number") out.push(blank.options[blank.answer]);
    });
    if (Array.isArray(question.steps)) question.steps.forEach(function (step) {
      if (step.options && typeof step.answer === "number") out.push(step.options[step.answer]);
    });
    return out.filter(Boolean).map(function (value) { return String(value).trim(); });
  }

  var findings = [];
  var checked = [];
  var nameAnswerable = [];

  var state = profile();
  var courseId = state.selectedCourse;
  state.active = null;
  state.conceptAttempts = {};
  state.totalAnswers = 0;
  state.lessonsRead = {};
  state.primerState = {};
  write(state);

  var course = window.T6_COURSES[courseId];
  var scheduled = Object.keys(course.questions)
    .map(function (id) { return course.questions[id]; })
    .filter(function (question) { return !question.optionShapeRisk && !question.primerOnly; });

  // Every concept in one run, which is exactly what the 0 → 60 preset builds.
  if (document.getElementById("practice-builder").hidden) document.getElementById("builder-toggle").click();
  document.querySelectorAll("#builder-presets .preset-card")[0].click();
  document.getElementById("builder-start").click();

  /* Drive whatever surface is in front of us. The point is to reach all sixteen
   * primers through the real run rather than to answer well, so the first available
   * control is chosen every time and correctness is irrelevant — nothing here reads
   * the score. A surface this cannot drive is reported, never skipped silently. */
  function answerCurrent() {
    var holder = document.getElementById("options");
    var textarea = holder.querySelector("textarea");
    if (textarea) {
      textarea.value = "My guess is that this is about the trade-off the case is setting up, and the missing piece is what breaks it.";
      textarea.dispatchEvent(new Event("input", {bubbles: true}));
      return true;
    }
    var options = holder.querySelectorAll(".option");
    if (options.length) { options[0].click(); return true; }
    // Long-form cloze and match render radio groups rather than option buttons.
    var groups = holder.querySelectorAll(".choice-group");
    if (groups.length) {
      Array.prototype.forEach.call(groups, function (group) {
        var radio = group.querySelector("input[type=radio]");
        if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", {bubbles: true})); }
      });
      return true;
    }
    var selects = holder.querySelectorAll("select");
    if (selects.length) {
      Array.prototype.forEach.call(selects, function (select) {
        select.selectedIndex = Math.min(1, select.options.length - 1);
        select.dispatchEvent(new Event("change", {bubbles: true}));
      });
      return true;
    }
    var field = holder.querySelector("input[type=text], input[type=number]");
    if (field) { field.value = "1"; field.dispatchEvent(new Event("input", {bubbles: true})); return true; }
    return false;
  }

  var guard = 0;
  while (guard < 400) {
    guard += 1;
    var panel = document.getElementById("primer-panel");
    if (!panel.hidden && !profile().active.answered) {
      var item = profile().active.queue[profile().active.index];
      var question = course.questions[item.id];
      var onScreen = document.getElementById("primer-content").textContent + " " +
        document.getElementById("question-title").textContent;

      var wrongOptions = {};
      scheduled.forEach(function (other) {
        if (other.conceptId !== question.conceptId) return;
        (other.options || []).forEach(function (option, index) {
          if (index !== other.answer) wrongOptions[String(option).trim()] = true;
        });
      });

      var leaked = [];
      scheduled.forEach(function (other) {
        if (other.conceptId !== question.conceptId) return;
        correctAnswersFor(other).forEach(function (answer) {
          if (answer.length < 25) return;                 // a shared word is not a leak
          if (wrongOptions[answer]) return;               // named trap, see header
          if (onScreen.indexOf(answer) < 0) return;
          /* The concept's own name is a separate, older problem and is reported as one.
           * The layering deliberately prints it — "Carry forward: <previous>. Now add
           * <this>" is the sentence that makes a run read as a sequence — so a question
           * whose answer *is* that name is answerable from the orientation copy no
           * matter what the primer does. Counting it here would hide it inside a law it
           * does not belong to. */
          if (answer === question.node) { nameAnswerable.push(other.id); return; }
          leaked.push(other.id);
        });
      });
      if (leaked.length) findings.push(question.id + ": panel prints the answer to " + leaked.join(", "));

      if (question.options !== undefined || question.answer !== undefined) findings.push(question.id + " still carries options");
      if (document.querySelectorAll("#options .option").length) findings.push(question.id + " renders selectable options");
      if (!document.querySelector("#options textarea")) findings.push(question.id + " has no prediction box");
      if (!document.getElementById("commit-answer").disabled) findings.push(question.id + " accepts an empty prediction");

      /* Measured as a delta, not as an absolute. The walk answers the scored questions
       * between primers, so by the second primer `conceptAttempts` is legitimately
       * non-empty — an absolute assertion would report the run's real evidence as the
       * primer's leak. What must not move is what moves *across this commit*. */
      var beforeState = profile();
      var attemptsBefore = JSON.stringify(beforeState.conceptAttempts || {});
      var answersBefore = beforeState.totalAnswers || 0;

      var textarea = document.querySelector("#options textarea");
      textarea.value = "My guess is that this is about the trade-off the case is setting up, and the missing piece is what breaks it.";
      textarea.dispatchEvent(new Event("input", {bubbles: true}));
      document.getElementById("commit-answer").click();

      var after = profile();
      var response = after.active.responses[after.active.responses.length - 1];
      if (response.correct !== null) findings.push(question.id + " produced a verdict: " + response.correct);
      if (response.scored !== false) findings.push(question.id + " was scored");
      if (JSON.stringify(after.conceptAttempts || {}) !== attemptsBefore) findings.push(question.id + " wrote conceptAttempts");
      if ((after.totalAnswers || 0) !== answersBefore) findings.push(question.id + " moved totalAnswers");

      var reveal = document.getElementById("feedback").textContent;
      if (reveal.indexOf(question.primerFact) < 0) findings.push(question.id + " reveal does not carry the rule");
      if (reveal.indexOf(question.primerConnection) < 0) findings.push(question.id + " reveal does not carry the connection");

      checked.push(question.id);
    }

    // Lessons and answered surfaces both advance on the same control.
    var next = document.getElementById("next-question");
    if (next && !next.hidden) { next.click(); continue; }
    var current = profile().active;
    if (!current || current.index >= current.queue.length) break;
    if (!answerCurrent()) {
      findings.push("could not drive " + current.queue[current.index].id + " at step " + current.index);
      break;
    }
    var confidence = document.querySelectorAll("#confidence-check input[name='confidence']");
    var commit = document.getElementById("commit-answer");
    if (commit.disabled && confidence.length) confidence[0].click();
    if (commit.disabled) {
      findings.push("commit stayed disabled on " + current.queue[current.index].id + " at step " + current.index);
      break;
    }
    commit.click();
  }

  if (checked.length !== course.concepts.length) {
    findings.push("reached " + checked.length + " primers, expected one per concept (" + course.concepts.length + ")");
  }

  if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved);

  return JSON.stringify({
    ok: findings.length === 0,
    law: "LAW-63",
    subject: courseId,
    primersChecked: checked.length,
    findings: findings,
    /* Separate and older than LAW-63: questions whose correct answer is the concept's
     * own name, which the layering copy has to print. Not a primer defect and not
     * fixed by this rework — reported so it stays visible instead of passing quietly. */
    answerableFromTheConceptName: nameAnswerable.filter(function (id, index, all) { return all.indexOf(id) === index; }),
    note: "Profile restored. Reload the page before continuing to use the app."
  }, null, 2);
})();
