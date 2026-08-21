/* Run on app/t6.html?scenario=written-repair. This exercises the real page queue. */
(function () {
  "use strict";
  var subject = document.getElementById("header-subject-wrap");
  var initialFeedback = document.getElementById("feedback").textContent;
  var next = document.getElementById("next-question");
  var initial = {
    subjectHidden:!subject || getComputedStyle(subject).display === "none",
    repairAnnounced:/inserted a brief teaching repair/i.test(initialFeedback),
    reattemptAnnounced:/different question on this course idea/i.test(initialFeedback)
  };
  next.click();
  var repair = {
    pattern:document.getElementById("question-pattern").textContent.trim(),
    heading:document.getElementById("lesson-heading").textContent.trim(),
    supportOnly:/unscored and creates no Strong evidence/i.test(document.getElementById("lesson-connects").textContent),
    responseControlHidden:document.getElementById("options").children.length === 0
  };
  var teachingSteps = 0;
  while (!/^Dungeon re-check/.test(document.getElementById("question-pattern").textContent.trim()) && teachingSteps < 4) {
    next.click();
    teachingSteps += 1;
  }
  var transfer = {
    pattern:document.getElementById("question-pattern").textContent.trim(),
    note:(document.querySelector(".written-plan") || {}).textContent || "",
    prompt:document.getElementById("question-title").textContent.trim()
  };
  var result = {
    scenario:document.body.dataset.scenario || null,
    initial:initial,
    repair:repair,
    teachingSteps:teachingSteps,
    transfer:transfer,
    overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ok:initial.subjectHidden && initial.repairAnnounced && initial.reattemptAnnounced &&
      repair.pattern === "Dungeon intervention" && /^Repair:/.test(repair.heading) &&
      repair.supportOnly && repair.responseControlHidden &&
      teachingSteps > 0 && teachingSteps < 4 &&
      /^Dungeon re-check/.test(transfer.pattern) && /fresh wording and a case/i.test(transfer.note) &&
      Boolean(transfer.prompt) && document.documentElement.scrollWidth === document.documentElement.clientWidth
  };
  return JSON.stringify(result, null, 2);
})()
