/*
 * T6 — the mock→repair loop. Run this in the page, not in Node.
 *
 * THE QUESTION
 * `reteach-on-failure.js` asks whether a LEARN mistake brings back the lesson. This
 * asks the other half, which nothing has ever measured: after a mock, does the paper's
 * evidence turn into the right repair? That is the product's fourth promise — "mistakes
 * bring back the lessons you need" — on the surface the promise was written for.
 *
 * WHY IT IS NOT COVERED BY THE EXISTING PROBE
 * `reteach-on-failure.js` stages `conceptAttempts`. A mock writes `examMisses`, and
 * `recordExamMisses` says why in its own comment: misses "prioritise and never score",
 * so they deliberately create no attempt record. The two stores are disjoint, so a pass
 * on that probe says nothing at all about this path.
 *
 * FIVE ASSERTIONS, and each exists because the code makes a specific promise:
 *
 *   1. SITTING CAP       `EXAM_REPAIR_SITTING = 4`, added after a trial where a bad
 *                        paper produced a run that started at 28 items and grew to 63.
 *                        A learner who misses eleven concepts must still get four.
 *   2. WORST FIRST       `examMissList` weights missed×2 + skipped + written×2, so a
 *                        concept answered wrong outranks one that ran out of time.
 *                        The four served must be the four heaviest.
 *   3. TAUGHT FIRST      `startExamRepair` prints "Taught first, then tested again" and
 *                        `conceptRepairIds` is commented "One concept, several
 *                        surfaces, taught first". Measured, not read: does the lesson
 *                        actually appear ahead of the question?
 *   4. SECOND SITTING    `repairedAt` is stamped so a second sitting moves on rather
 *                        than repeating the first.
 *   5. NEVER SCORES      A miss must not create or destroy mastery evidence.
 *
 * ASSERTION 3 IS THE ONE THIS WAS WRITTEN FOR, and it is deliberately staged both ways.
 * Half the fixture's concepts have their lecture in `lessonsRead` (the normal case — a
 * learner who studied and then sat a mock) and half do not (first contact). If the
 * promise holds, both halves get the lesson. If re-teach is driven by a store the mock
 * does not write to, only the unread half will, and the kicker on screen will be false
 * for every learner who studied first. That is a claim about the product, so it is
 * measured on the real queue rather than inferred from `lessonNeedsReteach`.
 *
 * IT REFUSES RATHER THAN GUESSES
 * Staging must build on a profile the app has already written — `loadProfile`
 * normalises a bare fixture against its defaults and the first version of
 * `reteach-on-failure.js` reported a broken re-teach while the app was doing it
 * correctly, because its fixture had been discarded on the reload. Same failure shape,
 * same refusal here.
 *
 * HOW TO RUN — the app reads its profile once at load, so this is staged and reloaded
 *   1. open the app on the dashboard, evaluate this file  → it stages and says so
 *   2. reload, evaluate it again                          → it measures and reports
 *
 *   Expected: { "ok": true, "cases": [...5 passing...] }
 */
(function () {
  "use strict";

  var KEY = "term6.revision.v2";
  var SCRATCH = "dungeon.exam-repair-check";
  var COURSE = "SCLM";
  var SITTING = 4;

  function read() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  function write(value) { localStorage.setItem(KEY, JSON.stringify(value)); }

  var course = (window.T6_COURSES || {})[COURSE];
  if (!course) return JSON.stringify({ok: false, error: "T6_COURSES." + COURSE + " unavailable"});

  /* Concepts that actually carry a lesson. A concept whose lecture has no authored
     lesson cannot demonstrate anything about re-teaching either way, and including one
     would put an unexplained hole in the result. */
  var usable = (course.concepts || []).filter(function (concept) {
    return concept.source && window.T6_LESSONS && window.T6_LESSONS[concept.source];
  });
  if (usable.length < 11) {
    /* Fall back to source presence — the lesson map's global name has moved before, and
       a probe that silently measures 3 concepts instead of 11 is the F-47 shape. */
    usable = (course.concepts || []).filter(function (concept) { return concept.source; });
  }
  if (usable.length < 11) {
    return JSON.stringify({ok: false, error: "need 11 concepts with a source; found " + usable.length});
  }

  /* Eleven misses — the trial's own number. Weights are chosen so the top four are
     unambiguous and straddle the read/unread split: two of the four served must have
     had their lesson read already, and two must not. */
  var FIXTURE = usable.slice(0, 11).map(function (concept, index) {
    return {
      conceptId: concept.id,
      source: concept.source,
      /* index 0..3 are the heaviest and become the sitting; 0 and 1 are staged as
         already-read, 2 and 3 as first contact. */
      missed: index < 4 ? 4 - Math.floor(index / 2) : 1,
      skipped: index < 4 ? 0 : 1,
      lessonRead: index === 0 || index === 1
    };
  });

  function weightOf(row) { return row.missed * 2 + row.skipped; }

  function stage() {
    var profile = read();
    if (!profile || !profile.version) return null;
    profile.selectedCourse = COURSE;
    profile.lessonsRead = {};
    var readAt = Date.now() - 600000;
    FIXTURE.forEach(function (row) {
      if (row.lessonRead) profile.lessonsRead[row.source] = readAt;
    });
    /* No conceptAttempts at all. This is the honest shape of "sat a mock without
       having got anything wrong in Learn since reading the lesson", and it is exactly
       the state in which the two stores disagree. */
    profile.conceptAttempts = profile.conceptAttempts || {};
    profile.conceptAttempts[COURSE] = {};
    profile.examMisses = profile.examMisses || {};
    profile.examMisses[COURSE] = {};
    FIXTURE.forEach(function (row) {
      profile.examMisses[COURSE][row.conceptId] =
        {missed: row.missed, skipped: row.skipped, written: 0, at: new Date().toISOString()};
    });
    delete profile.active;
    write(profile);
    localStorage.setItem(SCRATCH, JSON.stringify({
      staged: true,
      conceptAttemptsBefore: JSON.stringify(profile.conceptAttempts[COURSE] || {})
    }));
    return true;
  }

  function activeRun() { return read().active || {}; }

  /* A queue item carries no concept — a scored step is `{id, initial, isReattempt,
     origin}` and nothing else, so the concept has to come from the bank. The first
     version of this probe read `item.conceptId`, got `undefined` for every step, and
     reported the run empty: a probe fault that reads exactly like a broken repair
     route. Resolve it, and refuse on an id the bank does not carry rather than
     dropping the step. */
  function conceptOf(item) {
    if (item.lesson || item.primer) return null;
    var question = (course.questions || {})[item.id];
    if (!question) return {unresolved: item.id};
    return {conceptId: question.conceptId || null};
  }

  function servedConcepts(run) {
    var seen = [], unresolved = [];
    (run.queue || []).forEach(function (item) {
      var resolved = conceptOf(item);
      if (!resolved) return;
      if (resolved.unresolved) { unresolved.push(resolved.unresolved); return; }
      if (resolved.conceptId && seen.indexOf(resolved.conceptId) < 0) seen.push(resolved.conceptId);
    });
    servedConcepts.unresolved = unresolved;
    return seen;
  }

  /* Did a lesson for this concept's lecture arrive BEFORE the concept's first scored
     step? That is what "taught first" means, and position is the whole claim. */
  function taughtFirst(run, conceptId, lectureId) {
    var queue = run.queue || [];
    var lessonAt = -1, questionAt = -1;
    for (var i = 0; i < queue.length; i += 1) {
      var item = queue[i];
      if (item.lesson && item.lectureId === lectureId && lessonAt < 0) lessonAt = i;
      var resolved = conceptOf(item);
      if (resolved && !resolved.unresolved && resolved.conceptId === conceptId && questionAt < 0) questionAt = i;
    }
    return {lessonAt: lessonAt, questionAt: questionAt,
      taught: lessonAt >= 0 && questionAt >= 0 && lessonAt < questionAt};
  }

  function clickRepair() {
    var button = document.getElementById("practice-exam-repair");
    if (!button) return false;
    button.click();
    return true;
  }

  function leave() {
    var button = document.getElementById("leave-practice");
    if (button) button.click();
  }

  /* ---- run ---------------------------------------------------------------- */

  /* The RECOVERED fixture: one concept, lesson read, missed on the mock, and then
     answered correctly in Learn afterwards. The mock-aware re-teach must NOT fire —
     otherwise a single bad paper re-teaches that lesson on every sitting for ever,
     which is the failure mode `reteach-on-failure.js` case 2 exists to prevent. This
     branch was written at the same time as the fix, so it is asserted rather than
     assumed. */
  function stageRecovered() {
    var profile = read();
    if (!profile || !profile.version) return false;
    var row = FIXTURE[0];
    var readAt = Date.now() - 600000;
    var missedAt = readAt + 60000;
    profile.selectedCourse = COURSE;
    profile.lessonsRead = {};
    profile.lessonsRead[row.source] = readAt;
    profile.examMisses = profile.examMisses || {};
    profile.examMisses[COURSE] = {};
    profile.examMisses[COURSE][row.conceptId] =
      {missed: 4, skipped: 0, written: 0, at: new Date(missedAt).toISOString()};
    profile.conceptAttempts = profile.conceptAttempts || {};
    profile.conceptAttempts[COURSE] = {};
    profile.conceptAttempts[COURSE][row.conceptId] = [{
      questionId: "recovered-check", variantFamily: "recovered-check", perspective: "apply",
      type: "mcq", skills: [], difficulty: 3, boss: false, scored: true,
      correct: true, wholeItemCorrect: true, partial: 1,
      confidence: "medium", confidencePrompted: false, confidenceSkipped: false,
      misconception: null, hintUsed: false, assistanceUsed: false, revealedSteps: false,
      bossStepsPassed: 0, bossStepsFailed: 0, bossStepsTotal: 0,
      constructedScore: null, constructedTotal: null, transfer: true, isReattempt: false,
      durationBucket: "typical", rapidGuess: false, strongEligible: true,
      blockId: null, at: missedAt + 60000
    }];
    delete profile.active;
    write(profile);
    return true;
  }

  var scratch = JSON.parse(localStorage.getItem(SCRATCH) || "null");
  if (!scratch || !scratch.staged) {
    if (!stage()) {
      return JSON.stringify({ok: false,
        error: "no app-written profile to stage onto — open the app first, then re-run"});
    }
    return JSON.stringify({staged: "11 exam misses on " + COURSE,
      next: "reload the page and evaluate this file again"});
  }

  if (scratch.phase === "recovered") {
    localStorage.removeItem(SCRATCH);
    var recoveredTaught = 0;
    if (clickRepair()) {
      var run = activeRun();
      recoveredTaught = (run.queue || []).filter(function (item) {
        return item.lesson && item.lectureId === FIXTURE[0].source;
      }).length;
      leave();
    }
    return JSON.stringify({
      ok: recoveredTaught === 0,
      probe: "T6 — mock→repair · recovered case",
      cases: [{
        id: "recoveredIsNotReTaught",
        why: "missed on the mock but answered correctly since — the learner recovered, so no re-teach",
        expected: 0, found: recoveredTaught, pass: recoveredTaught === 0
      }],
      note: "Profile NOT restored. Clear localStorage before using the app."
    }, null, 2);
  }

  localStorage.removeItem(SCRATCH);
  var cases = [];

  if (!clickRepair()) {
    return JSON.stringify({ok: false,
      error: "#practice-exam-repair not on the page — the repair route was unreachable, which is itself a failure of the promise"});
  }

  var run1 = activeRun();
  var served1 = servedConcepts(run1);
  var unresolved1 = (servedConcepts.unresolved || []).slice();

  /* An id the bank cannot resolve makes the whole result not-ok. A run measured with
     holes in it is not a run this probe has checked. */
  if (unresolved1.length) {
    return JSON.stringify({ok: false,
      error: "queue steps the bank does not carry: " + unresolved1.join(", ")});
  }

  /* 1 — sitting cap */
  cases.push({
    id: "sittingCap",
    why: "eleven concepts missed; a sitting is " + SITTING + " so the run stays finishable",
    expected: SITTING, found: served1.length, pass: served1.length === SITTING
  });

  /* 2 — worst first */
  var ranked = FIXTURE.slice().sort(function (a, b) { return weightOf(b) - weightOf(a); });
  var expectTop = ranked.slice(0, SITTING).map(function (row) { return row.conceptId; }).sort();
  cases.push({
    id: "worstFirst",
    why: "missed counts double skipped, so the heaviest four are served",
    expected: expectTop, found: served1.slice().sort(),
    pass: JSON.stringify(expectTop) === JSON.stringify(served1.slice().sort())
  });

  /* 3 — taught first, split by whether the lesson had been read */
  var byId = {};
  FIXTURE.forEach(function (row) { byId[row.conceptId] = row; });
  var taught = {read: {served: 0, taught: 0, detail: []}, unread: {served: 0, taught: 0, detail: []}};
  served1.forEach(function (conceptId) {
    var row = byId[conceptId];
    if (!row) return;
    var bucket = row.lessonRead ? taught.read : taught.unread;
    var result = taughtFirst(run1, conceptId, row.source);
    bucket.served += 1;
    if (result.taught) bucket.taught += 1;
    bucket.detail.push({conceptId: conceptId, lectureId: row.source,
      lessonAt: result.lessonAt, questionAt: result.questionAt, taught: result.taught});
  });
  cases.push({
    id: "taughtFirst",
    why: "'Taught first, then tested again' must hold for a learner who had already read the lesson, not only at first contact",
    expected: {lessonReadAlready: taught.read.served, firstContact: taught.unread.served},
    found: {lessonReadAlready: taught.read.taught, firstContact: taught.unread.taught},
    detail: taught,
    pass: taught.read.taught === taught.read.served && taught.unread.taught === taught.unread.served
  });

  /* 4 — second sitting moves on */
  leave();
  var served2 = [];
  if (clickRepair()) served2 = servedConcepts(activeRun());
  var overlap = served2.filter(function (id) { return served1.indexOf(id) >= 0; });
  cases.push({
    id: "secondSittingMovesOn",
    why: "repairedAt is stamped so the next sitting picks up rather than repeating",
    expected: 0, found: overlap.length, detail: {first: served1, second: served2},
    pass: served2.length > 0 && overlap.length === 0
  });

  /* 5 — misses prioritise, never score */
  var after = JSON.stringify((read().conceptAttempts || {})[COURSE] || {});
  cases.push({
    id: "missesNeverScore",
    why: "a mock reorders what is offered and creates no mastery evidence",
    expected: scratch.conceptAttemptsBefore, found: after,
    pass: after === scratch.conceptAttemptsBefore
  });

  leave();

  /* Hand over to the recovered fixture rather than ending here, so the negative case
     ships in the same probe as the positive one. */
  var handedOver = stageRecovered();
  if (handedOver) localStorage.setItem(SCRATCH, JSON.stringify({staged: true, phase: "recovered"}));

  return JSON.stringify({
    ok: cases.every(function (row) { return row.pass; }),
    probe: "T6 — mock→repair",
    course: COURSE,
    cases: cases,
    next: handedOver ? "reload and evaluate again for the recovered case" : null,
    note: "Profile NOT restored — this probe stages destructively. Clear localStorage before using the app."
  }, null, 2);
})();
