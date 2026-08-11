"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = __dirname;
var context = {window: {}};
vm.createContext(context);
["sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_challenges.js"].forEach(function (relative) {
  var filename = path.join(root, relative);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, {filename: filename});
});

var courses = context.window.T6_COURSES;
var courseIds = ["BRGSA", "IBM", "SCLM", "SPMS"];
var errors = [];
var warnings = [];
var seenIds = new Set();

function words(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function checkOptionShape(question, label, options, answer, allowExcludedLegacy) {
  var questionId = question.id;
  if (!Array.isArray(options) || answer < 0 || answer >= options.length) {
    errors.push(questionId + " has an invalid answer in " + label);
    return;
  }
  var correctLength = words(options[answer]);
  var longestWrong = Math.max.apply(null, options.filter(function (_, index) { return index !== answer; }).map(words));
  if (correctLength > longestWrong * 1.35 && correctLength - longestWrong >= 4) {
    if (!allowExcludedLegacy || question.qualityTier !== "legacy-shape-risk" || !question.optionShapeRisk) {
      errors.push(questionId + " exposes the correct " + label + " by option length");
    }
  }
}

function questionConceptIds(question) {
  return [question.conceptId].concat(question.supportingConceptIds || []);
}

courseIds.forEach(function (courseId) {
  var course = courses[courseId];
  if (!course) {
    errors.push("Missing course " + courseId);
    return;
  }
  var questions = Object.keys(course.questions).map(function (id) { return course.questions[id]; });
  questions.forEach(function (question) {
    ["id", "courseId", "conceptId", "source", "sourceIds", "type", "skills", "difficulty", "variantFamily", "explanation", "link"].forEach(function (field) {
      if (question[field] === undefined || question[field] === null || question[field] === "") errors.push(courseId + "/" + question.id + " is missing " + field);
    });
    if (seenIds.has(question.id)) errors.push("Duplicate question ID " + question.id);
    seenIds.add(question.id);
    if (!Array.isArray(question.skills) || !question.skills.length) errors.push(question.id + " has no skill tags");
    if (!Array.isArray(question.sourceIds) || !question.sourceIds.length) errors.push(question.id + " has no sourceIds");
    if (question.type === "mcq") {
      if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 4) errors.push(question.id + " must use three or four plausible MCQ options");
      checkOptionShape(question, "MCQ answer", question.options, question.answer, true);
      if (!Array.isArray(question.misconceptions) || question.misconceptions.length !== question.options.length) errors.push(question.id + " lacks option-level misconception tags");
    } else if (question.type === "cloze" || question.type === "case-cloze") {
      if (!Array.isArray(question.blanks) || !question.blanks.length || !Array.isArray(question.template) || question.template.length !== question.blanks.length + 1) errors.push(question.id + " has an invalid cloze structure");
      (question.blanks || []).forEach(function (blank, index) { checkOptionShape(question, "blank " + (index + 1), blank.options, blank.answer, false); });
    } else if (question.type === "match") {
      if (!Array.isArray(question.rows) || question.rows.length !== 4 || !Array.isArray(question.choices) || question.choices.length !== 4) errors.push(question.id + " must be a 4-by-4 match");
      if (new Set((question.rows || []).map(function (row) { return row.answer; })).size !== 4) errors.push(question.id + " does not use each match answer once");
    } else if (question.type === "boss") {
      if (!question.boss || !Array.isArray(question.steps) || question.steps.length < 3 || !(question.supportingConceptIds || []).length) errors.push(question.id + " is not a multi-concept, three-step boss");
      (question.steps || []).forEach(function (step, index) { checkOptionShape(question, "boss step " + (index + 1), step.options, step.answer, false); });
    } else if (question.type === "short-answer") {
      if (!question.selfReviewOnly || !Array.isArray(question.rubric) || question.rubric.length < 3 || !question.exemplar) errors.push(question.id + " lacks a transparent self-review rubric or exemplar");
      if ((question.options || question.answer) !== undefined) errors.push(question.id + " must not imply opaque automatic grading");
    } else {
      errors.push(question.id + " has unsupported type " + question.type);
    }
  });

  course.concepts.forEach(function (concept) {
    var surfaces = questions.filter(function (question) { return questionConceptIds(question).indexOf(concept.id) >= 0; });
    var activeSurfaces = surfaces.filter(function (question) { return !question.optionShapeRisk; });
    var types = new Set(surfaces.map(function (question) { return question.type; }));
    var families = new Set(surfaces.map(function (question) { return question.variantFamily; }));
    var activeTypes = new Set(activeSurfaces.map(function (question) { return question.type; }));
    var activeFamilies = new Set(activeSurfaces.map(function (question) { return question.variantFamily; }));
    if (surfaces.length < 10) errors.push(courseId + "/" + concept.id + " has only " + surfaces.length + " surfaces");
    if (types.size < 5) errors.push(courseId + "/" + concept.id + " has only " + types.size + " question types");
    if (families.size < 8) errors.push(courseId + "/" + concept.id + " has only " + families.size + " independent variant families");
    if (activeSurfaces.length < 10) errors.push(courseId + "/" + concept.id + " has only " + activeSurfaces.length + " actively scheduled surfaces");
    if (activeTypes.size < 4) errors.push(courseId + "/" + concept.id + " has only " + activeTypes.size + " actively scheduled question types");
    if (activeFamilies.size < 6) errors.push(courseId + "/" + concept.id + " has only " + activeFamilies.size + " actively scheduled variant families");
    if (!surfaces.some(function (question) { return question.boss; })) errors.push(courseId + "/" + concept.id + " has no boss coverage");
  });

  for (var module = 1; module <= 8; module += 1) {
    var moduleBosses = questions.filter(function (question) { return question.module === module && question.boss; });
    if (moduleBosses.length < 5) errors.push(courseId + " module " + module + " has fewer than five boss surfaces");
  }

  course.runs.forEach(function (run) {
    if (!Array.isArray(run.questionPoolIds) || run.questionPoolIds.length < (run.questionCount || 0)) errors.push(courseId + " set " + run.id + " has an invalid rotation pool");
    (run.questionPoolIds || []).forEach(function (id) { if (!course.questions[id]) errors.push(courseId + " set " + run.id + " cites missing question " + id); });
    (run.questionPoolIds || []).forEach(function (id) {
      if (course.questions[id] && course.questions[id].optionShapeRisk) errors.push(courseId + " set " + run.id + " schedules legacy option-shape risk " + id);
    });
  });
});

var packPath = process.argv[2];
if (packPath) {
  var manifestPath = path.join(packPath, "graph", "LECTURE_MANIFEST.jsonl");
  if (!fs.existsSync(manifestPath)) errors.push("Missing lecture manifest at " + manifestPath);
  else {
    var sourceIds = new Set(fs.readFileSync(manifestPath, "utf8").trim().split(/\r?\n/).map(function (line) { return JSON.parse(line).lecture_id; }));
    courseIds.forEach(function (courseId) {
      Object.keys(courses[courseId].questions).forEach(function (id) {
        courses[courseId].questions[id].sourceIds.forEach(function (sourceId) {
          if (!sourceIds.has(sourceId)) errors.push(courseId + "/" + id + " cites unknown lecture " + sourceId);
        });
      });
    });
  }
} else warnings.push("Lecture-source existence was not checked; pass the T6 pack path to enable it.");

var total = courseIds.reduce(function (sum, courseId) { return sum + Object.keys(courses[courseId].questions).length; }, 0);
if (total !== 728) errors.push("Expected 728 bank items, found " + total);

console.log(JSON.stringify({
  ok: errors.length === 0,
  totals: courseIds.reduce(function (result, courseId) {
    var questions = Object.keys(courses[courseId].questions).map(function (id) { return courses[courseId].questions[id]; });
    result[courseId] = {
      questions: questions.length,
      bosses: questions.filter(function (question) { return question.boss; }).length,
      constructedResponses: questions.filter(function (question) { return question.type === "short-answer"; }).length,
      excludedLegacyMcqs: questions.filter(function (question) { return question.optionShapeRisk; }).length
    };
    return result;
  }, {}),
  errors: errors,
  warnings: warnings
}, null, 2));

if (errors.length) process.exitCode = 1;
