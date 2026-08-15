/*
 * Weakness linking — run this in the page, not in Node.
 *
 * WHAT IT ASSERTS
 * The weakness route ("Practise what needs work") pairs two weak concepts only when the
 * bank actually connects them, checks a paired unit with a surface that tests both, and
 * reports every other weakness as standing on its own. Three properties, in order of how
 * badly they fail if broken:
 *
 *   1. No invented links. Every pair the run claims must share an authored surface.
 *   2. Every claimed pair is followed by a surface that really tests both concepts.
 *   3. A weakness with no weak partner is reported as isolated, never folded into a pair.
 *
 * It drives the real route rather than reimplementing the pairing, which depends on
 * `conceptPriority`, the link graph and the run budget together. The bank's edges ARE
 * recomputed here from the question set, on purpose: this check exists to catch the app
 * claiming a link the bank does not contain, so it must not ask the app what the links
 * are.
 *
 * WHY IT RUNS IN STAGES ACROSS RELOADS
 * The route computes priorities from the profile held **in memory**, and the app reads
 * that profile once, at load (LAW-62). Writing a fixture to `localStorage` therefore does
 * nothing to the running page — the first version of this check seeded two different
 * fixtures in one session and got the same answer twice, from neither of them. So each
 * fixture is seeded, the page is reloaded, and only then is the route driven.
 *
 * HOW TO RUN
 * Open the app on the plain route — NOT with `?scenario=`, which puts the app in scenario
 * mode where `saveProfile` is a no-op and the seeded profile is discarded. Then evaluate
 * this file's contents, and keep evaluating it until it returns a verdict: it reloads the
 * page between stages and reports which stage it is on.
 *
 *   Expected: { "ok": true, "invented": [], "unchecked": [], "misreported": [] }
 *
 * Restores the profile it found before returning the verdict.
 */
(function () {
  "use strict";

  var KEY = "term6.revision.v2";
  var STATE = "__weaknessLinkingCheck";
  var COURSE = "SPMS";

  var FIXTURES = [
    {
      label: "paired",
      /* Every concept of four modules, so each weak concept's partner is weak too. */
      weak: ["spms_dfv", "spms_jtbd", "spms_tamsam", "spms_chasm",
             "spms_positioning", "spms_lean_canvas", "spms_value_pricing", "spms_unit_economics"],
      expectPairs: true
    },
    {
      label: "isolated",
      /* One concept from each of eight modules, so no two are partners. This is the
       * fixture that matters: the honest answer is "these do not connect", and the
       * failure worth guarding against is a product that reaches for a link anyway. */
      weak: ["spms_dfv", "spms_tamsam", "spms_positioning", "spms_value_pricing",
             "spms_alternatives", "spms_requirements", "spms_priority", "spms_metrics"],
      expectPairs: false
    }
  ];

  function read() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  function write(next) { localStorage.setItem(KEY, JSON.stringify(next)); }
  function course() { return (window.T6_COURSES || {})[COURSE] || {}; }

  function state() {
    try { return JSON.parse(sessionStorage.getItem(STATE) || "null"); } catch (error) { return null; }
  }
  function setState(next) { sessionStorage.setItem(STATE, JSON.stringify(next)); }

  function bankEdges() {
    var edges = {};
    var questions = course().questions || {};
    Object.keys(questions).forEach(function (id) {
      var question = questions[id];
      if (question.primerOnly) return;
      var ids = [question.conceptId].concat(question.supportingConceptIds || []).filter(Boolean);
      ids = ids.filter(function (value, index) { return ids.indexOf(value) === index; });
      for (var a = 0; a < ids.length; a += 1) {
        for (var b = 0; b < ids.length; b += 1) {
          if (a === b) continue;
          (edges[ids[a]] || (edges[ids[a]] = {}))[ids[b]] = true;
        }
      }
    });
    return edges;
  }

  function seed(weakConceptIds) {
    var profile = read();
    var questions = course().questions || {};
    var now = Date.now();
    profile.conceptAttempts = profile.conceptAttempts || {};
    profile.conceptAttempts[COURSE] = {};
    weakConceptIds.forEach(function (conceptId, index) {
      var surface = Object.keys(questions).map(function (id) { return questions[id]; })
        .filter(function (q) { return q.conceptId === conceptId && !q.boss && (q.type || "mcq") === "mcq"; })[0];
      if (!surface) return;
      profile.conceptAttempts[COURSE][conceptId] = [{
        questionId: surface.id, variantFamily: surface.variantFamily || surface.id,
        perspective: surface.perspective || "explain", type: "mcq", skills: surface.skills || [],
        difficulty: 2, boss: false, scored: true, correct: false, wholeItemCorrect: false, partial: 0,
        confidence: "high", confidencePrompted: true, confidenceSkipped: false,
        misconception: "check-fixture", hintUsed: false, assistanceUsed: false, revealedSteps: false,
        bossStepsPassed: 0, bossStepsFailed: 0, at: now - (index + 1) * 60000,
        blockId: "weakness-linking-check", durationBucket: "normal", rapidGuess: false, strongEligible: true
      }];
    });
    profile.selectedCourse = COURSE;
    profile.active = null;
    write(profile);
  }

  function judge(fixture, session, edges, out) {
    if (!session) { out.misreported.push(fixture.label + ": route produced no session"); return null; }
    var questions = course().questions || {};
    var conceptIdByName = {};
    (course().concepts || []).forEach(function (concept) { conceptIdByName[concept.name] = concept.id; });

    var links = session.linkChecks || {};
    var claimed = Object.keys(links);

    claimed.forEach(function (questionId) {
      var pair = links[questionId].map(function (name) { return conceptIdByName[name]; });
      if (!pair[0] || !pair[1] || !(edges[pair[0]] || {})[pair[1]]) {
        out.invented.push(fixture.label + ": " + links[questionId].join(" + ") + " is not connected in the bank");
        return;
      }
      var question = questions[questionId];
      var covers = question ? [question.conceptId].concat(question.supportingConceptIds || []) : [];
      if (!question || covers.indexOf(pair[0]) < 0 || covers.indexOf(pair[1]) < 0) {
        out.unchecked.push(fixture.label + ": " + questionId + " does not test both of " + links[questionId].join(" + "));
      }
    });

    var isolated = session.isolatedConceptNames || [];
    if (fixture.expectPairs && !claimed.length) out.misreported.push("paired fixture produced no linked pair");
    if (!fixture.expectPairs && claimed.length) out.misreported.push("isolated fixture produced " + claimed.length + " linked pair(s)");
    if (!fixture.expectPairs && !isolated.length) out.misreported.push("isolated fixture reported nothing as isolated");
    var pairedNames = [];
    claimed.forEach(function (id) { pairedNames = pairedNames.concat(links[id]); });
    pairedNames.forEach(function (name) {
      if (isolated.indexOf(name) >= 0) out.misreported.push(name + " is reported as both linked and isolated");
    });

    return {
      fixture: fixture.label,
      kicker: session.kicker,
      linkedPairs: claimed.map(function (id) { return links[id].join(" + "); }),
      isolated: isolated
    };
  }

  var current = state();

  if (!current) {
    /* Stage 0: remember the learner's own profile, seed the first fixture, reload. */
    setState({stage: 0, saved: localStorage.getItem(KEY), results: [], out: {invented: [], unchecked: [], misreported: []}});
    seed(FIXTURES[0].weak);
    setTimeout(function () { location.reload(); }, 0);
    return JSON.stringify({stage: "seeded fixture 1 of " + FIXTURES.length + " (" + FIXTURES[0].label + "); reloading — evaluate this file again"}, null, 2);
  }

  var edges = bankEdges();
  var fixture = FIXTURES[current.stage];
  var button = document.getElementById("practice-priority");
  if (!button) {
    sessionStorage.removeItem(STATE);
    return JSON.stringify({ok: false, error: "the weakness route button (#practice-priority) is not on this screen"}, null, 2);
  }
  button.click();
  var row = judge(fixture, read().active || null, edges, current.out);
  if (row) current.results.push(row);

  if (current.stage + 1 < FIXTURES.length) {
    current.stage += 1;
    setState(current);
    seed(FIXTURES[current.stage].weak);
    setTimeout(function () { location.reload(); }, 0);
    return JSON.stringify({stage: "seeded fixture " + (current.stage + 1) + " of " + FIXTURES.length + " (" + FIXTURES[current.stage].label + "); reloading — evaluate this file again"}, null, 2);
  }

  if (current.saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, current.saved);
  sessionStorage.removeItem(STATE);

  return JSON.stringify({
    ok: !current.out.invented.length && !current.out.unchecked.length && !current.out.misreported.length,
    invented: current.out.invented,
    unchecked: current.out.unchecked,
    misreported: current.out.misreported,
    report: current.results,
    note: "Profile restored. Reload before continuing to use the app."
  }, null, 2);
})();
