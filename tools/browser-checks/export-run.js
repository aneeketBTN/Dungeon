/*
 * Persona harness — evaluate this file's contents IN THE PAGE.
 *
 * WHAT IT IS FOR
 * The three-student cram test cost roughly 390 tool calls per persona, almost all of
 * it navigation: click the palette, read the stem, click an option, click Save & next,
 * repeat 57 times. The test material is deterministic, so none of that clicking was
 * discovering anything. This exports exactly what a persona would be served — same
 * questions, same schedule, same order — so they can read a run instead of walking it.
 *
 * WHY IT RUNS IN THE PAGE AND NOT IN NODE
 * The same reason teach-before-test.js does. `layeredQueue`, `selectQuestionsFromPool`,
 * `buildExamPaper` and the readiness/ladder functions all live inside t6.js's IIFE with
 * no exports. A Node re-implementation would be a second copy of the scheduling rules
 * that drifts from the real one, and a persona would then be testing the copy. So this
 * drives the real app and reads the real queue and the real paper.
 *
 * WHAT IT RETURNS, AND WHY IT IS SMALL
 * The ORDER, not the prose. The queue is what only the app can produce; the lesson
 * text, primer, stems, options and per-option feedback behind it are plain lookups in
 * `app/sets/*.js`. So this returns a compact skeleton — one line per step — and
 * `tools/export-learn-run.mjs` hydrates it into the two persona files. That keeps the
 * scheduling rules in the app (nothing is re-implemented) while keeping a full run out
 * of a tool result. A subject's skeleton is ~1 KB; its hydrated run is 30–60 KB.
 *
 * BLIND BY CONSTRUCTION
 * The hydrator writes two files. The candidate file carries no answer index, no
 * `answers` array, no per-blank answer, no diagnoses, no rubric text, no explanation.
 * The key file carries them, and carries the per-option feedback with them — a
 * diagnosis array has a hole at the correct option, so printing it beside the options
 * hands over the answer as surely as the answer would. (It was on the candidate side
 * until 2026-08-15, under a comment saying it was not. A comment asserting an
 * invariant is not the invariant.)
 *
 * HOW TO RUN — one subject per page load, and it says so
 *   1. localStorage.clear(); location.reload();
 *   2. window.__EXPORT_SUBJECT = "SPMS";   // and optionally __EXPORT_SET
 *   3. evaluate this file; it returns a JSON string
 *   4. reload before the next subject
 * Rendering a lesson marks it read in the profile the app holds in MEMORY (LAW-62), and
 * the app reads its profile from storage exactly once, at load — so a second run in the
 * same page load is measured against a learner who has already been taught. This
 * refuses to run rather than emit that quietly.
 */
(function () {
  "use strict";

  var KEY = "term6.revision.v2";
  var COURSE = window.__EXPORT_SUBJECT || "SPMS";
  var SET_INDEX = Number(window.__EXPORT_SET || 0);

  var courses = window.T6_COURSES || {};
  var course = courses[COURSE];

  function refuse(reason, extra) {
    var out = {ok: false, subject: COURSE, error: reason};
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) out[k] = extra[k];
    return JSON.stringify(out);
  }

  /* The app's profile, as it last wrote it. Every path this check takes calls
     saveProfile() on the way through, so reading storage after an action reads the
     app's own memory rather than a guess about it. */
  function profile() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (error) { return {}; }
  }

  function fnv1a(value) {
    var hash = 2166136261;
    for (var i = 0; i < value.length; i++) {
      hash = (hash ^ value.charCodeAt(i)) >>> 0;
      hash = (hash * 16777619) >>> 0;
    }
    return ("00000000" + hash.toString(16)).slice(-8);
  }

  if (!course) return refuse("unknown subject " + COURSE, {known: Object.keys(courses)});

  /* ---- the fresh-learner precondition, checked before anything is clicked --------
   * LAW-62's verify step, applied literally: assert the empty `lessonsRead`
   * IMMEDIATELY BEFORE the measured click, not at the top of a loop. A run exported
   * from a profile that has already been taught is a different run — thinner, and
   * quietly so. */
  var before = profile();
  var taught = Object.keys(before.lessonsRead || {}).length;
  if (taught) {
    return refuse("this page has already taught " + taught + " lecture(s), so the queue would " +
      "be a returning learner's, not a first-time learner's. Run localStorage.clear() and reload, " +
      "then export one subject.", {lessonsRead: taught});
  }
  if (before.active) {
    return refuse("a run is already active (" + before.active.courseId + " set " + before.active.setId +
      "). Clear localStorage and reload before exporting.", {active: before.active.courseId});
  }

  /* ---- drive the subject rail through the real UI ------------------------------
   * The previous version wrote `{selectedCourse: COURSE}` into localStorage and called
   * `window.__dungeonSelectSubject`, which does not exist. Neither did anything: the
   * app reads its profile from storage ONCE at load, so a post-load write is invisible
   * to it, and a bare object is normalised back to defaults anyway. So the export
   * clicked whichever set list happened to be on screen — the previously selected
   * subject's — and then looked those ids up in the requested subject's bank, where
   * none of them exist. Every step came back "unknown" and the run read as empty
   * rather than as wrong.
   *
   * The rail is real UI, so use it. The cards carry the subject's short title in
   * `.course-code`, which is also what a learner reads. */
  var cards = Array.prototype.slice.call(document.querySelectorAll("#course-grid .course-card"));
  if (!cards.length) return refuse("no subject cards on screen — is the dashboard showing?");
  var wanted = course.shortTitle || COURSE;
  var target = cards.filter(function (card) {
    var code = card.querySelector(".course-code");
    return code && code.textContent.trim() === wanted;
  })[0];
  if (!target) {
    return refuse("no subject card reads '" + wanted + "'", {
      cards: cards.map(function (card) {
        var code = card.querySelector(".course-code");
        return code ? code.textContent.trim() : "?";
      })
    });
  }
  target.click();

  /* The click is the measurement, so check that it landed. `renderDashboard` re-renders
     the set list from the newly selected subject; if selection had silently failed we
     would be about to click the wrong subject's sets, which is the original defect. */
  var afterSelect = profile();
  if (afterSelect.selectedCourse !== COURSE) {
    return refuse("pressing the " + wanted + " card left the app on " +
      String(afterSelect.selectedCourse) + " — the rail did not take the selection");
  }

  var out = {
    ok: true,
    subject: COURSE,
    subjectTitle: course.title || COURSE,
    set: SET_INDEX + 1,
    exportedFor: "persona harness (learn half)",
    schedule: {},
    queue: null,
    paper: null
  };

  /* ---- the learn run ------------------------------------------------------------
   * Study set 1 from a fresh profile: what the app's own hero recommends and what all
   * three personas were served. */
  var setCards = document.querySelectorAll("#set-list .set-card");
  var setCard = setCards[SET_INDEX];
  if (!setCard) return refuse("no set card at index " + SET_INDEX + " (" + setCards.length + " on screen)");
  setCard.click();

  var active = (profile().active || {});
  if (!active.queue) {
    return refuse("pressing set card " + (SET_INDEX + 1) + " started no run — a mock/practice card has no queue");
  }
  if (active.courseId !== COURSE) {
    return refuse("the run that started is " + active.courseId + ", not " + COURSE);
  }

  out.schedule.setId = active.setId;
  out.schedule.title = active.title;
  out.schedule.kicker = active.kicker;
  out.schedule.steps = active.queue.length;
  out.schedule.scoredQuestions = active.baseCount;
  out.schedule.supportItems = active.supportCount;

  /* One line per step. `lesson` items are keyed by lectureId, everything else by
     question id — exactly what the hydrator needs to look the content up, and nothing
     it could look up itself. */
  out.queue = active.queue.map(function (item, index) {
    if (item.lesson) {
      return {step: index + 1, kind: "lesson", lectureId: item.lectureId, reteach: !!item.reteach,
        previousConceptId: item.previousConceptId || null};
    }
    return {step: index + 1, kind: item.primer ? "primer" : "question", id: String(item.id),
      primerLevel: item.primerLevel || null, isReattempt: !!item.isReattempt,
      previousConceptId: item.previousConceptId || null};
  });

  /* The tripwire that would have caught the original defect on its first run: if the
     rail had put us on the wrong subject, every id here would be foreign to this
     subject's bank. The hydrator refuses on an unresolvable id; this reports the count
     so a bad export is visible in the tool result rather than in a file nobody opened. */
  var unresolved = out.queue.filter(function (step) {
    if (step.kind === "lesson") return !(window.T6_LESSONS || {})[step.lectureId];
    return !(course.questions || {})[step.id];
  });
  out.schedule.unresolvedSteps = unresolved.length;
  if (unresolved.length) {
    return refuse("the run contains " + unresolved.length + " step(s) this subject's bank " +
      "does not carry — the wrong subject's set list was clicked", {unresolved: unresolved.slice(0, 5)});
  }

  out.queueDigest = fnv1a(out.queue.map(function (step) {
    return step.kind + ":" + (step.lectureId || step.id);
  }).join("|"));

  /* What each lesson's closing handoff says in THIS run. Taken from the app rather
     than from the lesson record: the record's `connects` promises "the next lecture",
     and the app prints a correction under it when the run does not deliver that
     lecture. Reading the record alone reports a broken promise the product has
     already qualified on screen. */
  if (window.__dungeonExport && typeof window.__dungeonExport.handoffs === "function") {
    out.handoffs = window.__dungeonExport.handoffs(out.queue
      .filter(function (step) { return step.kind === "lesson"; })
      .map(function (step) { return step.lectureId; }));
  }

  /* Lesson delivery is what LAW-62 warns about, so say what this page load actually
     taught. A caller who exports a second subject without reloading gets a refusal on
     the next run; this is the number that explains why. */
  out.schedule.lessonsReadAfter = Object.keys(profile().lessonsRead || {}).length;

  /* ---- the mock paper, and the drift guard --------------------------------------
   * tools/export-persona-run.mjs mirrors the paper builder so it can write the paper
   * JSON from Node without a browser. A mirror is only safe if something checks it, so
   * it stamps every file with a digest over `section:questionId` in order, and this
   * recomputes the same digest from the app's own builder. If they diverge, the
   * personas are sitting a paper the app does not serve, and every finding from that
   * run is about a file rather than about the product. That guard is what found F-47.
   *
   * FNV-1a on both sides: crypto.subtle is async and this check is synchronous by
   * design. It is a tripwire for a changed draw, not a signature. */
  var hook = window.__dungeonExport;
  if (!hook || typeof hook.paper !== "function") {
    out.paperError = "window.__dungeonExport is missing — is this an older build?";
  } else {
    var live = hook.paper(COURSE, SET_INDEX);
    if (!live) {
      out.paperError = "no paper for " + COURSE;
    } else {
      out.paper = {
        setIndex: live.setIndex, minutes: live.minutes, questions: live.items.length,
        available: live.available, total: live.total, shortfalls: live.shortfalls
      };
      var digestSource = live.items.map(function (entry) { return entry.section + ":" + entry.question.id; }).join("|");
      out.digest = fnv1a(digestSource);

      /* Do the comparison here rather than handing a hash back for someone else to
         eyeball. The Node-written paper file is served by the same dev server, so the
         check can read the mirror's own stamp and say MATCH or DRIFT itself. The full
         source string is emitted only when they disagree — it is 3 KB of ids, useful
         exactly once. */
      try {
        var request = new XMLHttpRequest();
        request.open("GET", "/evidence/2026-08-15/persona-harness/" + COURSE + "-set" + (SET_INDEX + 1) + ".json?t=" + String(Date.now()), false);
        request.send();
        if (request.status === 200) {
          var mirror = JSON.parse(request.responseText);
          out.paperDigestMirror = mirror.digest;
          out.paperDigestMatch = mirror.digest === out.digest;
          if (!out.paperDigestMatch) out.digestSource = digestSource;
        } else {
          out.paperDigestMirror = null;
          out.paperDigestMatch = null;
          out.paperDigestNote = "no exported paper to compare against (HTTP " + request.status + ") — run tools/export-persona-run.mjs";
        }
      } catch (error) {
        out.paperDigestMatch = null;
        out.paperDigestNote = String(error);
      }
    }
    /* Readiness and the ladder are measured on the SAME profile the learn run came
       from, so the numbers describe one coherent student rather than two.
       `examReadiness` returns the whole next rung including its concept records, which
       is several KB of prose the hydrator can look up itself — keep the figures. */
    var readiness = hook.readiness(COURSE, SET_INDEX);
    out.schedule.readiness = {
      conceptsTaught: readiness.taught, conceptsTotal: readiness.total,
      marks: readiness.marks, ladderSteps: readiness.ladderSteps,
      nextStep: readiness.nextStep ? {
        step: readiness.nextStep.step, set: readiness.nextStep.definition.id,
        title: readiness.nextStep.definition.title,
        adds: readiness.nextStep.concepts.map(function (concept) { return concept.name; })
      } : null
    };
    out.schedule.ladder = hook.ladder(COURSE).rungs.map(function (rung) {
      return {step: rung.step, set: rung.definition.id, title: rung.definition.title,
        adds: rung.concepts.map(function (concept) { return concept.name; }), state: rung.state};
    });
  }

  /* Deliberately NOT restoring the profile. The app read its own copy at load, so
     putting the old bytes back in storage would leave memory and storage disagreeing
     and the next run measured against a learner who has been taught. The contract is
     one subject per page load; reload before the next one. */
  out.reloadBeforeNextSubject = true;
  return JSON.stringify(out);
})();
