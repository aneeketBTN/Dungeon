/* Dungeon Speedruns (the internal API keeps its original mini-mock name).
 *
 * A Speedrun is deliberately not a shortened exam paper. It is an eight-question,
 * coached final-week round: one applied surface from every module, feedback after
 * every answer, and no clock. The complete sequence is a coverage cycle. Concepts
 * that have not appeared in the current cycle win selection first; after the cycle
 * reaches every concept, `rotation` changes the question families and begins again.
 *
 * This selector lives outside t6.js so the browser and tools/check-mini-mocks.mjs
 * execute the exact same rules. A copied gate would only prove its own copy.
 */
(function (global) {
  "use strict";

  var ROUND_SIZE = 8;

  function unique(values) {
    var seen = {};
    return values.filter(function (value) {
      if (!value || seen[value]) return false;
      seen[value] = true;
      return true;
    });
  }

  function conceptIds(question) {
    return unique([question && question.conceptId].concat(question && question.supportingConceptIds || []));
  }

  function stableOrder(value) {
    return String(value).split("").reduce(function (total, character) {
      return ((total * 33) + character.charCodeAt(0)) >>> 0;
    }, 11);
  }

  function applicationTier(question) {
    var type = question.type || "mcq";
    if (question.boss || type === "boss" || type === "numeric") return 4;
    if (["case-cloze", "match", "short-answer", "msq"].indexOf(type) >= 0) return 3;
    if (question.caselet || question.perspective === "apply" || (question.skills || []).indexOf("apply") >= 0) return 2;
    return 1;
  }

  function eligible(question) {
    return question && !question.primerOnly && !question.repairOnly && !question.optionShapeRisk &&
      question.type !== "primer" && question.type !== "lesson" && question.type !== "written-repair";
  }

  function build(courseId, rotation) {
    var courses = global.T6_COURSES || {};
    var course = courses[courseId];
    if (!course) return null;
    rotation = Math.max(0, Number(rotation) || 0);

    var concepts = course.concepts || [];
    var conceptById = {};
    concepts.forEach(function (concept) { conceptById[concept.id] = concept; });
    var targetIds = concepts.map(function (concept) { return concept.id; });
    var uncovered = {};
    targetIds.forEach(function (id) { uncovered[id] = true; });

    var questions = Object.keys(course.questions || {}).map(function (id) {
      return course.questions[id];
    }).filter(eligible);
    var moduleCount = (course.modules || []).length;
    var modules = [];
    for (var module = 1; module <= moduleCount; module += 1) modules.push(module);

    var usedQuestions = {};
    var covered = {};
    var rounds = [];
    var guard = Math.max(1, concepts.length * 2);

    function moduleNewIds(question, moduleNumber) {
      return conceptIds(question).filter(function (id) {
        return uncovered[id] && conceptById[id] && Number(conceptById[id].module) === moduleNumber;
      });
    }

    function rotationRank(question, roundIndex) {
      /* The multiplier is odd and intentionally much larger than a course cycle. It
       * shifts ties rather than merely reversing them, so rotation 2 does not fall
       * straight back to rotation 0. Family comes first: two textual variants from
       * one template should not masquerade as a genuinely fresh way of thinking. */
      var family = question.variantFamily || question.id;
      var value = stableOrder(family);
      var salt = ((((rotation + 1) * 2654435761) >>> 0) ^ (((roundIndex + 1) * 2246822519) >>> 0)) >>> 0;
      value = (value ^ salt) >>> 0;
      value = Math.imul(value ^ (value >>> 16), 2246822507) >>> 0;
      value = Math.imul(value ^ (value >>> 13), 3266489909) >>> 0;
      return (value ^ (value >>> 16)) >>> 0;
    }

    function choose(moduleNumber, roundIndex, alreadyPicked) {
      var pool = questions.filter(function (question) {
        return Number(question.module) === moduleNumber && !alreadyPicked[question.id];
      });
      if (!pool.length) return null;
      pool.sort(function (left, right) {
        var leftNew = moduleNewIds(left, moduleNumber).length;
        var rightNew = moduleNewIds(right, moduleNumber).length;
        return rightNew - leftNew ||
          (applicationTier(right) >= 2 ? 1 : 0) - (applicationTier(left) >= 2 ? 1 : 0) ||
          (usedQuestions[left.id] ? 1 : 0) - (usedQuestions[right.id] ? 1 : 0) ||
          rotationRank(left, roundIndex) - rotationRank(right, roundIndex) ||
          applicationTier(right) - applicationTier(left) ||
          String(left.id).localeCompare(String(right.id));
      });
      return pool[0];
    }

    while (Object.keys(uncovered).length && rounds.length < guard) {
      var picked = {};
      var selected = modules.map(function (moduleNumber) {
        var question = choose(moduleNumber, rounds.length, picked);
        if (question) picked[question.id] = true;
        return question;
      }).filter(Boolean);
      var before = Object.keys(uncovered).length;
      var newIds = [];
      selected.forEach(function (question) {
        usedQuestions[question.id] = true;
        conceptIds(question).forEach(function (id) {
          if (!uncovered[id]) return;
          delete uncovered[id];
          covered[id] = true;
          newIds.push(id);
        });
      });
      rounds.push({
        index: rounds.length,
        questionIds: selected.map(function (question) { return question.id; }),
        modules: selected.map(function (question) { return Number(question.module); }),
        newConceptIds: unique(newIds),
        coveredAfter: Object.keys(covered).length,
        applicationCount: selected.filter(function (question) { return applicationTier(question) >= 2; }).length
      });
      /* A named concept without a reachable question is a bank defect. Stop here and
       * let the gate name it rather than filling an endless sequence of pretty rounds. */
      if (Object.keys(uncovered).length === before) break;
    }

    return {
      courseId: courseId,
      rotation: rotation,
      roundSize: ROUND_SIZE,
      targetConceptIds: targetIds,
      rounds: rounds,
      uncoveredConceptIds: Object.keys(uncovered)
    };
  }

  global.T6_MINI_MOCKS = {
    roundSize: ROUND_SIZE,
    build: build,
    conceptIds: conceptIds,
    applicationTier: applicationTier
  };
})(window);
