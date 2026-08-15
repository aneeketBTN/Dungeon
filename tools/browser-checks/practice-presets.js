/* Practice-preset check — LAW-01, run in the page.
 *
 * The three cards on the builder each make a specific, checkable promise. This asserts
 * the run a card actually queues against the sentence printed on it:
 *
 *   0 → 60    one question per concept, every concept in the subject, plainest first
 *   60 → 80   the applied difficulty band and more than one format
 *   80 → 100  the hardest band, with the module bosses the card counts
 *
 * and, for all three, that the queue's scored questions never leave the band the panel
 * claims to be drawing from.
 *
 * Run this once per page load, from the dashboard, with the builder reachable. It
 * starts real runs, so it saves the profile first and restores it at the end; reload
 * before using the app again. LAW-62 applies — rendering a lesson marks it read in
 * memory — so the queue is read from the saved profile immediately after each start
 * and nothing here re-measures a lesson list after a render.
 */
(function () {
  var KEY = "term6.revision.v2";
  var saved = localStorage.getItem(KEY);

  function profile() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  function write(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
  var BANDS = {"0 → 60": [2, 3], "60 → 80": [3, 4], "80 → 100": [4, 5]};
  var findings = [];
  var results = [];

  function openBuilder() {
    var builder = document.getElementById("practice-builder");
    if (builder && builder.hidden) document.getElementById("builder-toggle").click();
  }

  var cards = (function () {
    openBuilder();
    return Array.prototype.slice.call(document.querySelectorAll("#builder-presets .preset-card"));
  })();

  cards.forEach(function (card, index) {
    var range = card.querySelector(".preset-range").textContent.trim();
    var claim = card.querySelector(".preset-count").textContent.trim();

    /* Every preset is measured from the same starting point — a profile with no
     * attempts and nothing read — because "one per concept" and "3 module bosses"
     * are claims about a fresh run, and a run started after the previous one has
     * already banked attempts is a different draw. */
    var base = profile();
    base.active = null;
    base.conceptAttempts = {};
    base.lessonsRead = {};
    base.primerState = {};
    write(base);

    openBuilder();
    Array.prototype.slice.call(document.querySelectorAll("#builder-presets .preset-card"))[index].click();
    var start = document.getElementById("builder-start");
    if (start.disabled) { findings.push(range + ": start button disabled"); return; }
    start.click();

    var active = profile().active || {};
    var queue = active.queue || [];
    var courseId = active.courseId;
    var course = window.T6_COURSES[courseId];
    var scored = queue.filter(function (item) { return !item.lesson && !item.primer; })
      .map(function (item) { return course.questions[item.id]; })
      .filter(Boolean);

    var band = BANDS[range];
    var outOfBand = scored.filter(function (question) {
      var difficulty = question.difficulty || 2;
      return difficulty < band[0] || difficulty > band[1];
    });
    if (outOfBand.length) {
      findings.push(range + ": " + outOfBand.length + " of " + scored.length + " questions outside difficulty " +
        band.join("-") + " (" + outOfBand.slice(0, 4).map(function (q) { return q.id + "@" + (q.difficulty || 2); }).join(", ") + ")");
    }

    var concepts = {};
    scored.forEach(function (question) { concepts[question.conceptId] = (concepts[question.conceptId] || 0) + 1; });
    var conceptCount = Object.keys(concepts).length;
    var bosses = scored.filter(function (question) { return question.boss; }).length;
    var formats = Object.keys(scored.reduce(function (types, question) {
      types[question.type || "mcq"] = true;
      return types;
    }, {})).length;

    // The card's own sentence, checked against the queue rather than against itself.
    var claimedCount = Number((/^(\d+)/.exec(claim) || [])[1]);
    if (claimedCount !== scored.length) findings.push(range + ": card says " + claimedCount + " questions, queue has " + scored.length);
    if (/one per concept/.test(claim)) {
      var repeated = Object.keys(concepts).filter(function (id) { return concepts[id] > 1; });
      if (repeated.length) findings.push(range + ": claims one per concept, but " + repeated.join(", ") + " appear more than once");
      if (conceptCount !== course.concepts.length) {
        findings.push(range + ": claims every concept, covers " + conceptCount + " of " + course.concepts.length);
      }
    }
    var claimedBosses = Number((/(\d+) module boss/.exec(claim) || [])[1] || 0);
    if (claimedBosses && claimedBosses !== bosses) findings.push(range + ": card says " + claimedBosses + " bosses, queue has " + bosses);
    var claimedFormats = Number((/(\d+) formats/.exec(claim) || [])[1] || 0);
    if (claimedFormats && claimedFormats !== formats) findings.push(range + ": card says " + claimedFormats + " formats, queue has " + formats);

    // The run header is what a learner reads once the cards are gone.
    var header = (document.getElementById("practice-title") || {}).textContent || "";
    if (header && header.indexOf(card.querySelector("b").textContent.trim()) < 0) {
      findings.push(range + ": run header reads \"" + header + "\" rather than the card pressed");
    }

    results.push({
      preset: range,
      subject: courseId,
      claim: claim,
      questions: scored.length,
      concepts: conceptCount + " of " + course.concepts.length,
      bosses: bosses,
      formats: formats,
      difficulties: scored.map(function (q) { return q.difficulty || 2; }).sort().join(""),
      support: queue.length - scored.length,
      header: header
    });

    // Leave the run before the next preset is measured.
    var back = document.getElementById("leave-practice");
    if (back) back.click();
  });

  if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved);

  return JSON.stringify({
    ok: findings.length === 0,
    law: "LAW-01",
    results: results,
    findings: findings,
    note: "Profile restored. Reload the page before continuing to use the app."
  }, null, 2);
})();
