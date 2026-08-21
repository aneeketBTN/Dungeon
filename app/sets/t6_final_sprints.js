/* Dungeon Minis — accelerated, objective final revision.
 *
 * A Mini is not a blank-page worksheet and it is not a shortened mock. It is an
 * eight-question coached pass through the subject: one question per module,
 * selectable answers, and teaching immediately after every response. Full mocks
 * remain the place where the exact written paper is reproduced.
 *
 * The selector lives here so the browser and the release gate execute the same
 * rules. `rotation` changes question families on a repeat without changing the
 * subject's promised format mix.
 */
(function (global) {
  "use strict";

  var PACKS = {
    SPMS: {
      title: "Eight product decisions. No blank page.",
      focus: "Five single-choice questions and three real P-type MSQs, with the correction immediately after every answer.",
      paperReality: "Section B behaviour is exact: two options are correct, at most two may be selected, and the score is 2 / 1 / 0 with no direct negative marking.",
      formats: ["mcq", "msq", "mcq", "msq", "mcq", "mcq", "msq", "mcq"],
      traps: [
        "For P-type MSQs, one correct option with no wrong option earns 1 mark; adding one wrong option makes the question worth 0.",
        "Once two options are selected, uncheck one or clear the response before changing the pair.",
        "A framework name is not enough: use the distinction that makes one option right and its nearest rival wrong."
      ]
    },
    BRGSA: {
      title: "Eight evidence decisions. Tap, check, correct.",
      focus: "Rapid MCQs and selectable case decisions replace prose while keeping the evidence, constraint and action logic of the course.",
      paperReality: "This is an objective translation for final revision. The full mock still reproduces BRGSA's written Sections B and C.",
      formats: ["mcq", "case-cloze", "mcq", "case-cloze", "mcq", "case-cloze", "mcq", "case-cloze"],
      traps: [
        "Engagement is not commitment; rank evidence by what the customer risks.",
        "Optimising a non-constraint can look busy while the system stays unchanged.",
        "Never interpret a test whose threshold and action were chosen afterwards."
      ]
    },
    IBM: {
      title: "Eight inclusion decisions. One coherent model.",
      focus: "Rapid MCQs and selectable cases test whether inclusion, operations and financial sustainability survive together—without asking for last-minute prose.",
      paperReality: "This is an objective translation for recall. IBM's real paper is written; the Released case full mock remains the paper-faithful practice.",
      formats: ["mcq", "case-cloze", "mcq", "case-cloze", "mcq", "case-cloze", "mcq", "case-cloze"],
      traps: [
        "‘Poor people’ is not a segment. Name the livelihood, constraint and agency of the people served.",
        "A lower price is not a model if finance, service and distribution still fail.",
        "Impact claims need governance and measurement, but measurement must not consume delivery."
      ]
    },
    SCLM: {
      title: "Eight supply-chain decisions. Set up before solving.",
      focus: "Six MCQs, one authentic numerical and one matching question recover the setup, units and system boundary without a prose worksheet.",
      paperReality: "The format mix samples all three real sections: MCQ, final-answer numerical and match-the-following.",
      formats: ["mcq", "numeric", "mcq", "mcq", "mcq", "match", "mcq", "mcq"],
      traps: [
        "Write units beside every numerical input before touching the calculator.",
        "Freight rate, order cost or site count alone never captures the whole decision.",
        "A local improvement is not a system improvement until the next bottleneck moves."
      ]
    }
  };

  function stableOrder(value) {
    return String(value).split("").reduce(function (total, character) {
      return ((total * 33) + character.charCodeAt(0)) >>> 0;
    }, 17);
  }

  function eligible(question, type, moduleNumber) {
    return question && Number(question.module) === moduleNumber && (question.type || "mcq") === type &&
      !question.primerOnly && !question.repairOnly && !question.examOnly && !question.optionShapeRisk;
  }

  function appliedRank(question) {
    return question.caselet || question.perspective === "apply" || (question.skills || []).indexOf("apply") >= 0 ? 1 : 0;
  }

  function words(value) {
    return String(value || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function decisionSets(question) {
    var type = question.type || "mcq";
    if (type === "mcq") return [{options:question.options || [], answer:question.answer}];
    if (type === "case-cloze") return (question.blanks || []).map(function (blank) { return {options:blank.options || [], answer:blank.answer}; });
    if (type === "match") return (question.rows || []).map(function (row) { return {options:question.choices || [], answer:row.answer}; });
    return [];
  }

  function craftRisk(question) {
    var sets = decisionSets(question);
    if (!sets.length) return 0;
    return sets.reduce(function (risk, set) {
      var lengths = set.options.map(words);
      var maximum = Math.max.apply(Math, lengths);
      var longestCount = lengths.filter(function (length) { return length === maximum; }).length;
      var longestHit = lengths[set.answer] === maximum ? 1 / Math.max(1, longestCount) : 0;
      return risk + (set.answer === 0 ? 1 : 0) + longestHit;
    }, 0) / sets.length;
  }

  function build(courseId, rotation) {
    var course = (global.T6_COURSES || {})[courseId];
    var pack = PACKS[courseId];
    if (!course || !pack) return null;
    rotation = Math.max(0, Number(rotation) || 0);
    var all = Object.keys(course.questions || {}).map(function (id) { return course.questions[id]; });
    var usedFamilies = {};
    var questions = pack.formats.map(function (type, index) {
      var moduleNumber = index + 1;
      var pool = all.filter(function (question) { return eligible(question, type, moduleNumber); });
      pool.sort(function (left, right) {
        var leftFamilyUsed = usedFamilies[left.variantFamily || left.id] ? 1 : 0;
        var rightFamilyUsed = usedFamilies[right.variantFamily || right.id] ? 1 : 0;
        return leftFamilyUsed - rightFamilyUsed || craftRisk(left) - craftRisk(right) || appliedRank(right) - appliedRank(left) ||
          stableOrder(left.id) - stableOrder(right.id) ||
          String(left.id).localeCompare(String(right.id));
      });
      if (!pool.length) return null;
      var applied = pool.filter(function (question) { return appliedRank(question); });
      var tier = applied.length ? applied : pool;
      tier.sort(function (left, right) { return craftRisk(left) - craftRisk(right) || stableOrder(left.id) - stableOrder(right.id); });
      var bestRisk = craftRisk(tier[0]);
      var safest = tier.filter(function (question) { return craftRisk(question) <= bestRisk + .001; });
      var picked = safest[rotation % safest.length];
      usedFamilies[picked.variantFamily || picked.id] = true;
      return picked;
    });
    return {
      courseId: courseId,
      rotation: rotation,
      questionIds: questions.filter(Boolean).map(function (question) { return question.id; }),
      questions: questions,
      modules: questions.filter(Boolean).map(function (question) { return Number(question.module); }),
      types: questions.filter(Boolean).map(function (question) { return question.type || "mcq"; })
    };
  }

  var api = {roundSize: 8, build: build};
  Object.keys(PACKS).forEach(function (courseId) { api[courseId] = PACKS[courseId]; });
  global.T6_FINAL_SPRINTS = api;
})(window);
