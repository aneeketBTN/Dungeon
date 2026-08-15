/*
 * T7 — does the dashboard report a regression? Run this in the page, not in Node.
 *
 * THE QUESTION
 * A learner who had a concept Strong and has since lost it is in a different position
 * from one who never had it, and the product's whole claim is that the dashboard tells
 * you where you stand. Nothing in `tools/` measured this, and the name of the nearest
 * probe is actively misleading: `measure-persona-regression.mjs` is regression TESTING
 * — a deterministic re-run against a baseline — and says nothing about what a learner
 * is shown.
 *
 * FOUR THINGS, because "reports regressions" is four different claims and the product
 * can pass some and fail others:
 *
 *   R1 DETECTED     the concept's own state moves back down. `conceptStatus` recomputes
 *                   from the whole attempt history rather than latching, so this should
 *                   hold — but it is the foundation of the other three and is worth
 *                   pinning rather than assuming.
 *   R2 REPORTED     at subject level. `renderMomentum` computes a delta from
 *                   `trendFromCourses`, which REPLAYS `evidenceFromAttempts` at each
 *                   past block boundary rather than reading a stored counter, so a
 *                   genuine decline should surface as a `down` chip.
 *   R3 DISTINGUISHED at concept level, and this is the one worth writing the probe for.
 *                   Measured as a DIFFERENTIAL rather than by hunting for a word like
 *                   "dropped": stage two learners whose CURRENT status is identical —
 *                   one who fell from Strong, one who was never Strong — and compare
 *                   what the dashboard says about that concept. If the two are
 *                   character-for-character identical, the dashboard cannot be
 *                   reporting the regression, whatever wording it might have used.
 *                   Keyword-hunting would have presumed an implementation; this does
 *                   not.
 *   R4 ACTED ON     the declined concept is routed forward. A product that silently
 *                   relabels but still sends you back to the material has a smaller
 *                   problem than one that forgets, so this is measured separately
 *                   rather than folded into R3.
 *
 * THE FIXTURE IS A REAL STRONG RECORD, NOT A FORCED LABEL
 * `evidenceFromAttempts` wants 5 eligible attempts, 4 correct, 3 distinct types, 2
 * distinct blocks, integrative evidence, and a correct latest eligible attempt. All of
 * that is staged honestly; confidence is held at "medium" throughout so neither the
 * confident-error nor the underconfident-correct gate fires and the only thing moving
 * the status is the evidence this probe is about. If the Strong fixture does not read
 * as Strong, the probe reports that and stops rather than measuring a decline from a
 * state that never existed.
 *
 * HOW TO RUN — staged and reloaded, three times; the app reads its profile once at load
 *   1. open the app on the dashboard, evaluate this file  → stages "strong"
 *   2. reload, evaluate again                             → stages "declined"
 *   3. reload, evaluate again                             → stages "never-strong"
 *   4. reload, evaluate again                             → reports
 */
(function () {
  "use strict";

  var KEY = "term6.revision.v2";
  var SCRATCH = "dungeon.regression-check";
  var COURSE = "SCLM";

  function read() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  function write(value) { localStorage.setItem(KEY, JSON.stringify(value)); }

  var course = (window.T6_COURSES || {})[COURSE];
  if (!course) return JSON.stringify({ok: false, error: "T6_COURSES." + COURSE + " unavailable"});
  var concept = (course.concepts || [])[0];
  if (!concept) return JSON.stringify({ok: false, error: "no concept to stage"});

  var base = Date.now() - 7 * 24 * 60 * 60 * 1000;

  function attempt(options) {
    return {
      questionId: options.id, variantFamily: options.id, perspective: options.perspective || "apply",
      type: options.type, skills: [], difficulty: 3, boss: false, scored: true,
      correct: options.correct, wholeItemCorrect: options.correct, partial: options.correct ? 1 : 0,
      /* medium keeps both confidence gates shut, so the status is moved by the
         evidence under test and by nothing else. */
      confidence: "medium", confidencePrompted: false, confidenceSkipped: false,
      misconception: null, hintUsed: false, assistanceUsed: false, revealedSteps: false,
      bossStepsPassed: 0, bossStepsFailed: 0, bossStepsTotal: 0,
      constructedScore: null, constructedTotal: null,
      transfer: !!options.transfer, isReattempt: false,
      durationBucket: "typical", rapidGuess: false, strongEligible: true,
      blockId: options.block, at: options.at
    };
  }

  /* Five eligible, four correct, three types, two blocks, one transfer, latest correct. */
  var STRONG = [
    attempt({id: "s1", type: "mcq", block: "blk-1", correct: true, at: base + 1000}),
    attempt({id: "s2", type: "cloze", block: "blk-1", correct: true, at: base + 2000}),
    attempt({id: "s3", type: "case-cloze", block: "blk-2", correct: true, at: base + 3000, transfer: true}),
    attempt({id: "s4", type: "mcq", block: "blk-2", correct: false, at: base + 4000}),
    attempt({id: "s5", type: "cloze", block: "blk-2", correct: true, at: base + 5000})
  ];

  /* Two recent wrong answers in a later block: wrongRecent reaches 2, which is the
     documented route back to "needs". */
  var DECLINE = [
    attempt({id: "d1", type: "mcq", block: "blk-3", correct: false, at: base + 6000}),
    attempt({id: "d2", type: "cloze", block: "blk-3", correct: false, at: base + 7000})
  ];

  /* Same current status, no history worth losing. */
  var NEVER = [
    attempt({id: "n1", type: "mcq", block: "blk-3", correct: false, at: base + 6000}),
    attempt({id: "n2", type: "cloze", block: "blk-3", correct: false, at: base + 7000})
  ];

  function stage(phase, attempts) {
    var profile = read();
    /* Same refusal as reteach-on-failure.js: a bare fixture over an empty key is
       normalised away by loadProfile and the probe then measures a learner it never
       created. */
    if (!profile || !profile.version) return false;
    profile.selectedCourse = COURSE;
    profile.conceptAttempts = profile.conceptAttempts || {};
    profile.conceptAttempts[COURSE] = {};
    profile.conceptAttempts[COURSE][concept.id] = attempts;
    delete profile.active;
    write(profile);
    return true;
  }

  /* Text a reader can see without opening anything. `textContent` walks hidden
     subtrees, and the concept's evidence sits in a `hidden` body behind the "Why"
     disclosure (`aria-expanded="false"`) — so the first version of this probe compared
     two strings that included content neither learner had been shown, and would have
     credited the dashboard for a distinction that is one click away. Both are measured
     now, and they are reported as separate cases because they are separate claims. */
  function visibleText(node) {
    if (!node) return null;
    var out = "";
    (function walk(element) {
      for (var i = 0; i < element.childNodes.length; i += 1) {
        var child = element.childNodes[i];
        if (child.nodeType === 3) { out += child.nodeValue; continue; }
        if (child.nodeType !== 1) continue;
        if (child.hidden || child.getAttribute("aria-hidden") === "true") continue;
        var style = window.getComputedStyle(child);
        if (style.display === "none" || style.visibility === "hidden") continue;
        walk(child);
      }
    })(node);
    return out.replace(/\s+/g, " ").trim();
  }

  /* What the dashboard says about this one concept, and what it says overall. */
  function observe() {
    var row = document.querySelector('[data-concept-id="' + concept.id + '"]');
    var state = row ? row.querySelector(".shelf-state") : null;
    var delta = document.getElementById("momentum-delta");
    var route = document.getElementById("practice-priority");
    return {
      status: state ? state.textContent.trim() : null,
      rowVisible: visibleText(row),
      rowText: row ? row.textContent.replace(/\s+/g, " ").trim() : null,
      momentumValue: (document.getElementById("momentum-value") || {}).textContent || null,
      momentumDelta: delta ? delta.textContent.trim() : null,
      momentumDirection: delta ? (delta.className.match(/\b(up|down|flat)\b/) || [])[1] || null : null,
      routeCopy: route ? route.textContent.replace(/\s+/g, " ").trim() : null
    };
  }

  var scratch = JSON.parse(localStorage.getItem(SCRATCH) || "null");

  if (!scratch) {
    if (!stage("strong", STRONG)) {
      return JSON.stringify({ok: false,
        error: "no app-written profile to stage onto — open the app first, then re-run"});
    }
    localStorage.setItem(SCRATCH, JSON.stringify({phase: "strong"}));
    return JSON.stringify({staged: "strong", concept: concept.id,
      next: "reload the page and evaluate this file again"});
  }

  if (scratch.phase === "strong") {
    var strongSeen = observe();
    stage("declined", STRONG.concat(DECLINE));
    localStorage.setItem(SCRATCH, JSON.stringify({phase: "declined", strong: strongSeen}));
    return JSON.stringify({measured: "strong", status: strongSeen.status,
      next: "reload the page and evaluate this file again"});
  }

  if (scratch.phase === "declined") {
    var declinedSeen = observe();
    stage("never", NEVER);
    localStorage.setItem(SCRATCH, JSON.stringify({
      phase: "never", strong: scratch.strong, declined: declinedSeen}));
    return JSON.stringify({measured: "declined", status: declinedSeen.status,
      next: "reload the page and evaluate this file again"});
  }

  var neverSeen = observe();
  localStorage.removeItem(SCRATCH);
  var strong = scratch.strong, declined = scratch.declined;

  /* The Strong fixture has to have read as Strong or nothing below means anything. */
  if (strong.status !== "Strong") {
    return JSON.stringify({ok: false,
      error: "the Strong fixture did not read as Strong (" + strong.status + ") — " +
        "measuring a decline from a state that never existed would be meaningless",
      observed: strong});
  }

  var cases = [
    {
      id: "R1-detected",
      why: "the concept's own state moves back down rather than latching at Strong",
      expected: "Strong → Needs practice",
      found: strong.status + " → " + declined.status,
      pass: declined.status === "Needs practice"
    },
    {
      id: "R2-reportedAtSubjectLevel",
      why: "the momentum chip carries a negative delta computed by replaying history",
      expected: "down",
      found: declined.momentumDirection + " (" + declined.momentumDelta + ")",
      pass: declined.momentumDirection === "down"
    },
    {
      id: "R3a-distinguishedOnTheOpenRow",
      why: "without opening anything, can a learner who fell from Strong be told from one who never had it",
      expected: "the visible rows differ",
      found: declined.rowVisible === neverSeen.rowVisible ? "character-for-character identical" : "differ",
      detail: {declined: declined.rowVisible, neverStrong: neverSeen.rowVisible},
      pass: declined.rowVisible !== neverSeen.rowVisible
    },
    {
      id: "R3b-distinguishedBehindWhy",
      why: "with the evidence disclosure open, the retained evidence tells the two apart",
      expected: "the full rows differ",
      found: declined.rowText === neverSeen.rowText ? "character-for-character identical" : "differ",
      detail: {declined: declined.rowText, neverStrong: neverSeen.rowText},
      pass: declined.rowText !== neverSeen.rowText
    },
    {
      id: "R4-actedOn",
      why: "the declined concept is routed forward rather than quietly forgotten",
      expected: "a needs-work route offered",
      found: declined.routeCopy,
      pass: /need/i.test(declined.routeCopy || "")
    }
  ];

  return JSON.stringify({
    ok: cases.every(function (row) { return row.pass; }),
    probe: "T7 — regression reporting",
    course: COURSE,
    concept: concept.id,
    cases: cases,
    observed: {strong: strong, declined: declined, neverStrong: neverSeen},
    note: "Profile NOT restored — this probe stages destructively. Clear localStorage before using the app."
  }, null, 2);
})();
