/*
 * Re-teaching — run this in the page, not in Node.
 *
 * WHAT IT ASSERTS
 * A lesson the learner has read comes back when their evidence says they did not
 * keep it, and does not come back otherwise. Three cases, all required:
 *
 *   1. OPEN FAILURE   lesson read, then a wrong answer on its concept, nothing
 *                     right since → remediation re-teaches it.
 *   2. RECOVERED      lesson read, wrong, then RIGHT → no re-teach. A learner who
 *                     recovered does not get sent back to the page.
 *   3. DISCOVERY      the same open failure, but opened as a study set rather than
 *                     remediation → no re-teach. A study set is where material is
 *                     met, not where it is repaired.
 *
 * WHY THIS IS A BROWSER CHECK AND NOT A UNIT TEST
 * Same reason as teach-before-test.js: the rule lives in `pendingLessonsFor` and
 * `layeredQueue` inside t6.js's IIFE with no export, and the thing under test is a
 * property of the built queue. Re-implementing it in Node would create a second
 * copy of the scheduling rules that drifts from the real one and reports green
 * while the app is broken.
 *
 * WHY IT EXISTS AT ALL
 * `lessonsRead` was a one-way latch. Once read, a lesson was never served again —
 * including by the routes that exist for nothing else. `conceptRepairIds` was
 * commented "One concept, several surfaces, taught first"; `startExamRepair` printed
 * "Taught first, then tested again" on screen. Both were true only for a learner
 * meeting the lecture for the first time. A comment claiming an invariant is not the
 * invariant, and neither is a kicker.
 *
 * The negative cases are not decoration. Re-teaching everything on every slip is a
 * worse product than never re-teaching, and only cases 2 and 3 stop this becoming
 * that.
 *
 * HOW TO RUN
 * Open the app on the dashboard, then evaluate this file's contents in the page.
 * It returns a JSON string and restores whatever profile it found.
 *
 *   Expected: { "ok": true, "cases": [...3 passing...] }
 */
(function () {
  "use strict";

  var KEY = "term6.revision.v2";
  var saved = localStorage.getItem(KEY);
  var COURSE = "SCLM";

  function read() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  function write(value) { localStorage.setItem(KEY, JSON.stringify(value)); }

  var course = (window.T6_COURSES || {})[COURSE];
  if (!course) return JSON.stringify({ok: false, error: "T6_COURSES." + COURSE + " unavailable"});

  /* Module 1's first concept: it leads its subject, so a study set opened on it is
     genuinely the discovery case rather than a run that happens to teach nothing. */
  var concept = course.concepts.filter(function (row) { return row.module === 1; })[0];
  var readAt = Date.now() - 60000;

  function attempt(correct, offsetMs) {
    return {
      questionId: "reteach-check", variantFamily: "reteach-check", perspective: "apply",
      type: "mcq", skills: [], difficulty: 3, boss: false, scored: true,
      correct: correct, wholeItemCorrect: correct, partial: correct ? 1 : 0,
      confidence: "medium", confidencePrompted: false, confidenceSkipped: false,
      misconception: null, hintUsed: false, assistanceUsed: false, revealedSteps: false,
      bossStepsPassed: 0, bossStepsFailed: 0, bossStepsTotal: 0,
      constructedScore: null, constructedTotal: null, transfer: true, isReattempt: false,
      durationBucket: "typical", rapidGuess: false, strongEligible: true,
      blockId: null, at: readAt + offsetMs
    };
  }

  /* The app reads its profile once at load, so every case has to be staged into
     localStorage and then reached through a reload. This check therefore stages one
     case, and the caller re-runs it after each reload — see `stage` below.

     Staging must build on a profile the app has already written. Writing a bare
     fixture over an empty key produces an object `loadProfile` normalises against
     its defaults, and the first version of this check did exactly that: the fixture
     was discarded on the reload, the run it then measured had no failed concept in
     it, and the check reported the re-teach broken while the app was doing it
     correctly. A gate that fails that way is worse than no gate, so it refuses to
     run rather than staging over nothing. */
  function stage(caseId) {
    var profile = read();
    if (!profile || !profile.version) return null;
    profile.selectedCourse = COURSE;
    profile.lessonsRead = {};
    profile.lessonsRead[concept.source] = readAt;
    profile.conceptAttempts = profile.conceptAttempts || {};
    profile.conceptAttempts[COURSE] = {};
    profile.conceptAttempts[COURSE][concept.id] = caseId === "recovered"
      ? [attempt(false, 20000), attempt(true, 40000)]
      : [attempt(false, 30000)];
    delete profile.active;
    write(profile);
    return caseId;
  }

  function reteachCount() {
    var active = read().active || {};
    return (active.queue || []).filter(function (item) {
      return item.lesson && item.reteach;
    }).length;
  }

  function startRemediation() {
    var button = document.getElementById("practice-priority");
    if (!button) return false;
    button.click();
    return true;
  }

  function startStudySet() {
    var card = document.querySelectorAll("#set-list .set-card")[0];
    if (!card) return false;
    card.click();
    return true;
  }

  /* Each case needs its own page load, so the check runs one case per invocation and
     records where it is in `sessionStorage`. Evaluate it three times in a row,
     reloading between, or call it once per staged reload from a driver. */
  var STEP_KEY = "dungeon.reteach-check.step";
  var RESULT_KEY = "dungeon.reteach-check.results";
  var step = Number(sessionStorage.getItem(STEP_KEY) || "0");
  var results = JSON.parse(sessionStorage.getItem(RESULT_KEY) || "[]");

  var cases = [
    {id: "open-failure", start: startRemediation, expect: 1, why: "read, then wrong, nothing right since — remediation must re-teach"},
    {id: "recovered", start: startRemediation, expect: 0, why: "wrong then right — the learner recovered, so no re-teach"},
    {id: "discovery", start: startStudySet, expect: 0, why: "a study set is discovery, not repair, so no re-teach"}
  ];

  if (step >= cases.length) {
    sessionStorage.removeItem(STEP_KEY);
    sessionStorage.removeItem(RESULT_KEY);
    if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved);
    return JSON.stringify({
      ok: results.every(function (row) { return row.pass; }),
      invariant: "a read lesson returns exactly when the evidence says it was not kept",
      concept: concept.id + " (" + concept.source + ")",
      cases: results,
      note: "Profile restored. Re-load the page before continuing to use the app."
    }, null, 2);
  }

  var current = cases[step];
  /* The stage for THIS case was written on the previous invocation; measure it, then
     stage the next one and ask the caller to reload. */
  var measured = null;
  if (step === 0 && !sessionStorage.getItem(RESULT_KEY)) {
    if (!stage(current.id)) {
      return JSON.stringify({
        ok: false,
        error: "no saved profile to stage onto — load the app normally once (so it writes its own profile), then run this check without clearing localStorage first"
      }, null, 2);
    }
    sessionStorage.setItem(RESULT_KEY, "[]");
    return JSON.stringify({staged: current.id, next: "reload the page and evaluate this file again"});
  }
  if (!current.start()) {
    measured = {id: current.id, pass: false, detail: "could not reach the start control — is the dashboard on screen?"};
  } else {
    var found = reteachCount();
    measured = {id: current.id, why: current.why, expected: current.expect, found: found, pass: found === current.expect};
  }
  results.push(measured);
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(results));
  sessionStorage.setItem(STEP_KEY, String(step + 1));
  if (step + 1 < cases.length) stage(cases[step + 1].id);
  return JSON.stringify({measured: measured, next: "reload the page and evaluate this file again"});
})();
