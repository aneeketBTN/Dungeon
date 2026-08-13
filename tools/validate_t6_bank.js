"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

// The validator lives in tools/; the question bank it reads lives in the app directory.
var root = path.join(__dirname, "..", "app");
var context = {window: {}, atob: function (value) { return Buffer.from(value, "base64").toString("binary"); }};
vm.createContext(context);
["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_challenges.js"].forEach(function (relative) {
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

/* Bank-level length bias.
 *
 * checkOptionShape() above is a PER-QUESTION guard: it fires when one correct
 * answer towers over its distractors. It cannot see that the whole bank leans
 * the same way. Measured 2026-08-12: every excluded question in IBM, SCLM, and
 * SPMS (125 of them) was excluded because the correct answer was longest, and
 * the questions that passed the per-question threshold leaned the same way —
 * SCLM's 10 scheduled MCQs were 10 for 10. So the guard was catching the tail
 * of a distribution whose whole body was skewed.
 *
 * The number that matters to a learner is simpler than any threshold: if I
 * always pick the longest option and never read the stem, what do I score? At
 * the time this check was written the answer was 80-84% against 25% chance,
 * across all four subjects. A bank that can be beaten that way produces
 * confident, false evidence of mastery, which is worse than producing none.
 *
 * Ties are counted fractionally — picking at random among equally-long options
 * is what the strategy actually does — so padding one distractor to match does
 * not game the metric.
 *
 * Currently a WARNING, not an error, because it fails today and a hard error
 * would block every unrelated run. Promote it to an error once the content is
 * repaired and the score sits under the threshold; that is the point of
 * recording the number in totals rather than only complaining about it. */
var LENGTH_BIAS_LIMIT = 0.4;

function longestOptionScore(questions) {
  var scored = 0;
  var wins = 0;
  questions.forEach(function (question) {
    if (!Array.isArray(question.options) || typeof question.answer !== "number") return;
    if (question.options.length < 2) return;
    var lengths = question.options.map(words);
    var longest = Math.max.apply(null, lengths);
    var tied = lengths.filter(function (length) { return length === longest; }).length;
    scored += 1;
    if (lengths[question.answer] === longest) wins += 1 / tied;
  });
  return scored ? {scored: scored, score: wins / scored} : {scored: 0, score: 0};
}

/* Length RANK spread — the generalisation of the check above.
 *
 * longestOptionScore() only watches rank 4. Repairing the bank against it alone
 * moved the tell rather than removing it: lengthening exactly one distractor past
 * each correct answer drove the correct answer to rank 3 in 64% of BRGSA and 49%
 * of SPMS, so "pick the second-longest option" replaced "pick the longest" and
 * scored nearly as well. The metric was satisfied while the defect survived.
 *
 * So measure the whole distribution: sort each question's options by length and
 * record which rank the correct answer lands on. A bank with no length signal is
 * uniform — 25% at each rank. What matters is the largest deviation from uniform,
 * because that is exactly the edge available to a learner who has noticed the
 * pattern and reads nothing else. Ties split their credit across the ranks they
 * span, so padding one option to match does not launder the number.
 *
 * Reported for four-option questions only; ranks are not comparable across
 * different option counts. */
var RANK_SPREAD_LIMIT = 0.15;

function lengthRankSpread(questions) {
  var bins = [0, 0, 0, 0];
  var scored = 0;
  questions.forEach(function (question) {
    if (!Array.isArray(question.options) || typeof question.answer !== "number") return;
    if (question.options.length !== 4) return;
    var lengths = question.options.map(words);
    var correct = lengths[question.answer];
    var sorted = lengths.slice().sort(function (a, b) { return a - b; });
    var ranks = [];
    sorted.forEach(function (value, index) { if (value === correct) ranks.push(index); });
    scored += 1;
    ranks.forEach(function (index) { bins[index] += 1 / ranks.length; });
  });
  if (!scored) return {scored: 0, spread: 0, shares: [0, 0, 0, 0]};
  var shares = bins.map(function (count) { return count / scored; });
  var spread = Math.max.apply(null, shares.map(function (share) { return Math.abs(share - 0.25); }));
  return {scored: scored, spread: spread, shares: shares};
}

function questionConceptIds(question) {
  return [question.conceptId].concat(question.supportingConceptIds || []);
}

/*
 * Every distractor a scheduled question can present must be able to say what
 * choosing it revealed. This gate is what keeps that true for questions that do
 * not exist yet: a new item with an undiagnosed wrong option fails the build
 * rather than shipping a "Not yet" verdict with no reason behind it.
 */
var DIAGNOSIS_FIELDS = ["tag", "label", "why", "cue"];

function checkDiagnoses(question, label, options, answer, diagnoses) {
  var questionId = question.id + " / " + label;
  if (!Array.isArray(diagnoses) || diagnoses.length !== options.length) {
    errors.push(questionId + " has no option-level diagnoses");
    return;
  }
  options.forEach(function (option, index) {
    var diagnosis = diagnoses[index];
    if (index === answer) {
      if (diagnosis) errors.push(questionId + " diagnoses its own correct answer at option " + index);
      return;
    }
    if (!diagnosis || typeof diagnosis !== "object") {
      errors.push(questionId + " is missing a diagnosis for option " + index);
      return;
    }
    DIAGNOSIS_FIELDS.forEach(function (field) {
      if (typeof diagnosis[field] !== "string" || !diagnosis[field].trim()) {
        errors.push(questionId + " option " + index + " has an empty diagnosis " + field);
      }
    });
    if (typeof diagnosis.why === "string" && answer >= 0 && options[answer]) {
      // A diagnosis that only restates the correct answer explains the verdict,
      // not the error. Name the wrong belief first.
      if (diagnosis.why.trim() === String(options[answer]).trim()) {
        errors.push(questionId + " option " + index + " restates the correct answer instead of diagnosing the error");
      }
    }
    // Diagnose the reasoning, not the person. This targets blame directed at the
    // learner; describing what a choice did ("this choice assumed") is the point.
    if (typeof diagnosis.why === "string" && /\byou (?:failed|forgot|should have|were wrong|misunderstood|clearly|obviously)\b/i.test(diagnosis.why)) {
      errors.push(questionId + " option " + index + " addresses the learner rather than the reasoning");
    }
  });
}

function checkQuestionDiagnoses(question) {
  // Support-only primers and self-reviewed constructed responses never present a
  // scored wrong option, so neither carries a diagnosis obligation.
  if (question.primerOnly || question.type === "short-answer") return;
  if (question.optionShapeRisk) return;
  if (question.type === "mcq") {
    checkDiagnoses(question, "MCQ", question.options || [], question.answer, question.diagnoses);
  } else if (question.type === "cloze" || question.type === "case-cloze") {
    (question.blanks || []).forEach(function (blank, index) {
      checkDiagnoses(question, "blank " + (index + 1), blank.options || [], blank.answer, blank.diagnoses);
    });
  } else if (question.type === "boss") {
    (question.steps || []).forEach(function (step, index) {
      checkDiagnoses(question, "step " + (index + 1), step.options || [], step.answer, step.diagnoses);
    });
  } else if (question.type === "match") {
    (question.rows || []).forEach(function (row, index) {
      checkDiagnoses(question, "row " + (index + 1), question.choices || [], row.answer, row.diagnoses);
    });
  }
}

courseIds.forEach(function (courseId) {
  var course = courses[courseId];
  if (!course) {
    errors.push("Missing course " + courseId);
    return;
  }
  var questions = Object.keys(course.questions).map(function (id) { return course.questions[id]; });

  var lengthBias = longestOptionScore(questions);
  if (lengthBias.scored && lengthBias.score > LENGTH_BIAS_LIMIT) {
    warnings.push(courseId + ": answering \"always pick the longest option\" without reading the stem scores " +
      Math.round(lengthBias.score * 100) + "% across " + lengthBias.scored + " option-questions (chance is 25%). " +
      "The correct answer is written as a full principle and the distractors as terse wrong claims, so length leaks the answer. " +
      "Lengthen the distractors rather than shortening the correct answer.");
  }

  var rankSpread = lengthRankSpread(questions);
  if (rankSpread.scored && rankSpread.spread > RANK_SPREAD_LIMIT) {
    var best = rankSpread.shares.indexOf(Math.max.apply(null, rankSpread.shares));
    var ordinal = ["shortest", "second-shortest", "second-longest", "longest"][best];
    warnings.push(courseId + ": sorting each question's options by length puts the correct answer at rank " +
      (best + 1) + " of 4 in " + Math.round(rankSpread.shares[best] * 100) + "% of " + rankSpread.scored +
      " questions (chance is 25%), so \"always pick the " + ordinal + " option\" is a strategy. " +
      "Shares by rank, shortest first: " + rankSpread.shares.map(function (share) { return Math.round(share * 100) + "%"; }).join(" / ") +
      ". Vary how many distractors run longer than the correct answer instead of lengthening a fixed number of them.");
  }

  questions.forEach(function (question) {
    ["id", "courseId", "conceptId", "source", "sourceIds", "type", "skills", "difficulty", "variantFamily", "explanation", "link"].forEach(function (field) {
      if (question[field] === undefined || question[field] === null || question[field] === "") errors.push(courseId + "/" + question.id + " is missing " + field);
    });
    if (seenIds.has(question.id)) errors.push("Duplicate question ID " + question.id);
    seenIds.add(question.id);
    if (!Array.isArray(question.skills) || !question.skills.length) errors.push(question.id + " has no skill tags");
    if (!Array.isArray(question.sourceIds) || !question.sourceIds.length) errors.push(question.id + " has no sourceIds");
    if (question.type === "mcq" || question.type === "primer") {
      if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 4) errors.push(question.id + " must use three or four plausible MCQ options");
      checkOptionShape(question, "MCQ answer", question.options, question.answer, true);
      if (!Array.isArray(question.misconceptions) || question.misconceptions.length !== question.options.length) errors.push(question.id + " lacks option-level misconception tags");
      if (question.type === "primer" && (!question.primerOnly || !question.primerFact || !question.primerApplication || !question.primerConnection)) errors.push(question.id + " lacks adaptive primer content");
    } else if (question.type === "cloze" || question.type === "case-cloze") {
      if (!Array.isArray(question.blanks) || !question.blanks.length || !Array.isArray(question.template) || question.template.length !== question.blanks.length + 1) errors.push(question.id + " has an invalid cloze structure");
      (question.blanks || []).forEach(function (blank, index) { checkOptionShape(question, "blank " + (index + 1), blank.options, blank.answer, false); });
    } else if (question.type === "match") {
      if (!Array.isArray(question.rows) || question.rows.length !== 4 || !Array.isArray(question.choices) || question.choices.length !== 4) errors.push(question.id + " must be a 4-by-4 match");
      if (new Set((question.rows || []).map(function (row) { return row.answer; })).size !== 4) errors.push(question.id + " does not use each match answer once");
    } else if (question.type === "boss") {
      if (!question.boss || !Array.isArray(question.steps) || question.steps.length < 3 || !(question.supportingConceptIds || []).length) errors.push(question.id + " is not a multi-concept, three-step boss");
      (question.steps || []).forEach(function (step, index) { checkOptionShape(question, "boss step " + (index + 1), step.options, step.answer, false); });
    } else if (question.type === "msq") {
      /* Multiple-select, for SPMS Section B. The paper marks it +1 per right
       * option and -1 per wrong, floored at zero. Two properties have to hold or
       * the format teaches the wrong reflex: there must be at least two correct
       * options, otherwise it is an MCQ wearing checkboxes and rewards picking
       * one; and at least one wrong option, otherwise selecting everything is
       * the optimal play and the negative marking never bites. */
      if (!Array.isArray(question.options) || question.options.length < 4 || question.options.length > 6) errors.push(question.id + " must offer four to six multiple-select options");
      if (!Array.isArray(question.answers) || question.answers.length < 2) errors.push(question.id + " must have at least two correct options, or it is a single-answer question");
      if ((question.answers || []).length >= (question.options || []).length) errors.push(question.id + " marks every option correct, so selecting all of them cannot be penalised");
      (question.answers || []).forEach(function (index) {
        if (typeof index !== "number" || index < 0 || index >= (question.options || []).length) errors.push(question.id + " has an answer index outside its options");
      });
      if (new Set(question.answers || []).size !== (question.answers || []).length) errors.push(question.id + " repeats an answer index");
      if (question.answer !== undefined) errors.push(question.id + " must not carry a single `answer`; multiple-select uses `answers`");
      (question.options || []).forEach(function (_, index) {
        if ((question.answers || []).indexOf(index) >= 0) return;
        if (!(question.diagnoses || [])[index]) errors.push(question.id + " option " + index + " is a distractor with no diagnosis");
      });
    } else if (question.type === "numeric") {
      /* SCLM Section B: enter the final figure, marks awarded within a stated
       * tolerance, none for working. A tolerance of zero would demand an exact
       * float match and fail honest arithmetic, so it must be present and above
       * zero. `nearMisses` are optional but must not overlap the accepted band —
       * a trap that is also a correct answer would mark a right answer wrong. */
      if (typeof question.answer !== "number" || !isFinite(question.answer)) errors.push(question.id + " has no numeric answer");
      if (typeof question.tolerance !== "number" || !(question.tolerance > 0)) errors.push(question.id + " needs a grading tolerance above zero; exact float equality fails honest arithmetic");
      if (!question.prompt) errors.push(question.id + " does not say what figure to enter");
      /* The learner has to know what form to type. Usually that is a unit; for a
       * genuinely dimensionless quantity like a critical ratio it is not, so the
       * question must say so deliberately rather than leaving the field blank —
       * an omission and a ratio should not look the same to this gate. */
      if (!question.unit && !question.dimensionless) errors.push(question.id + " does not state the unit of the answer, and is not marked dimensionless");
      if (question.dimensionless && !/decimal|ratio|proportion|percentage|fraction/i.test(String(question.prompt))) {
        errors.push(question.id + " is dimensionless but its prompt does not say what form to enter");
      }
      if (question.options !== undefined) errors.push(question.id + " must not offer options; the paper takes a typed figure");
      (question.nearMisses || []).forEach(function (entry, index) {
        if (typeof entry.value !== "number" || !isFinite(entry.value)) errors.push(question.id + " nearMiss " + index + " has no value");
        if (!entry.label || !entry.why) errors.push(question.id + " nearMiss " + index + " does not explain the method that produces it");
        if (Math.abs(Number(entry.value) - question.answer) <= question.tolerance) {
          errors.push(question.id + " nearMiss " + index + " sits inside the accepted tolerance, so it would mark a correct answer wrong");
        }
      });
    } else if (question.type === "short-answer") {
      if (!question.selfReviewOnly || !Array.isArray(question.rubric) || question.rubric.length < 2 || !question.exemplar) errors.push(question.id + " lacks a transparent self-review rubric or exemplar");
      if ((question.options || question.answer) !== undefined) errors.push(question.id + " must not imply opaque automatic grading");
      if (["BRGSA", "IBM"].indexOf(courseId) < 0) errors.push(question.id + " invents a written-response format outside the published paper pattern");
      if (["short", "case"].indexOf(question.writtenMode) < 0) errors.push(question.id + " does not declare whether it is short-form or case-based writing");
      var rubricIds = (question.rubric || []).map(function (criterion) { return criterion.id; });
      var gapIds = {};
      (question.writtenGaps || []).forEach(function (gap) {
        if (!gap.id || gapIds[gap.id]) errors.push(question.id + " has a missing or duplicate written gap code");
        gapIds[gap.id] = true;
        if (rubricIds.indexOf(gap.criterionId) < 0) errors.push(question.id + " maps written gap " + gap.id + " to an unknown criterion");
        if (["missing", "misunderstood"].indexOf(gap.kind) < 0 || ["writing", "concept"].indexOf(gap.scope) < 0 || !gap.label || !gap.repair) errors.push(question.id + " has an incomplete written gap " + gap.id);
      });
      rubricIds.forEach(function (criterionId) {
        if (!(question.writtenGaps || []).some(function (gap) { return gap.criterionId === criterionId; })) errors.push(question.id + " cannot diagnose gap codes for criterion " + criterionId);
      });
    } else {
      errors.push(question.id + " has unsupported type " + question.type);
    }
    checkQuestionDiagnoses(question);
  });

  course.concepts.forEach(function (concept) {
    var surfaces = questions.filter(function (question) { return questionConceptIds(question).indexOf(concept.id) >= 0; });
    var activeSurfaces = surfaces.filter(function (question) { return !question.optionShapeRisk && !question.primerOnly; });
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
    if (["BRGSA", "IBM"].indexOf(courseId) >= 0) {
      ["short", "case"].forEach(function (mode) {
        if (!surfaces.some(function (question) { return question.type === "short-answer" && question.writtenMode === mode; })) errors.push(courseId + "/" + concept.id + " has no exam-aligned " + mode + " written practice");
      });
    }
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

/* ---------------------------------------------------------------------------
 * Teaching-layer gates
 *
 * The bank can be structurally perfect and still be unusable by someone who has
 * not taken the course, because nothing in it explains anything. These checks
 * hold the 0→80 path open: a lesson must be real teaching, it must not teach a
 * word earlier than the course introduces it, and the share of scheduled
 * questions still shipping without a lesson is reported rather than hidden.
 * ------------------------------------------------------------------------- */
var lessons = context.window.T6_LESSONS || {};
var lessonCoverage = {};

Object.keys(lessons).forEach(function (lectureId) {
  var lesson = lessons[lectureId];
  var label = "lesson " + lectureId;
  if (lesson.lectureId !== lectureId) errors.push(label + " disagrees with its own key");
  if (courseIds.indexOf(lesson.courseId) < 0) errors.push(label + " has unknown courseId " + lesson.courseId);
  if (!lesson.objective || String(lesson.objective).trim().length < 20) errors.push(label + " has no usable objective");
  if (!Array.isArray(lesson.explainer) || lesson.explainer.length < 2) errors.push(label + " needs at least two explainer paragraphs");
  if (!lesson.worked || !lesson.worked.setup || !lesson.worked.move || !lesson.worked.because) errors.push(label + " needs a worked example with setup, move and reason");
  if (!Array.isArray(lesson.glossary) || lesson.glossary.length < 2) errors.push(label + " needs at least two glossary terms");
  (lesson.glossary || []).forEach(function (entry, index) {
    if (!entry || !entry.term || !entry.plain) errors.push(label + " glossary entry " + index + " is incomplete");
    else if (String(entry.plain).trim().length < 15) errors.push(label + " glossary term \"" + entry.term + "\" has no real definition");
  });
  if (!lesson.connects) errors.push(label + " does not hand off to what comes next");
});

/* Lecture source. The clean transcripts are the authority; the old AI-Ready Pack
 * is still readable so existing invocations do not break, but content authored
 * against its dense layer is what LAW-49 exists to catch. See tools/lib/. */
var lectureSource = require("./lib/clean_transcripts.js");
var packPath = process.argv[2];
if (packPath) {
  var loaded = null;
  try {
    loaded = fs.existsSync(packPath) ? lectureSource.loadLectures(packPath) : null;
  } catch (error) {
    errors.push("Could not read lecture source at " + packPath + ": " + error.message);
  }
  if (!loaded) errors.push("Missing lecture source at " + packPath);
  else {
    var manifest = loaded.lectures;
    var byLecture = {};
    manifest.forEach(function (entry) { byLecture[entry.lecture_id] = entry; });
    var sourceIds = new Set(Object.keys(byLecture));
    courseIds.forEach(function (courseId) {
      Object.keys(courses[courseId].questions).forEach(function (id) {
        courses[courseId].questions[id].sourceIds.forEach(function (sourceId) {
          if (!sourceIds.has(sourceId)) errors.push(courseId + "/" + id + " cites unknown lecture " + sourceId);
        });
      });
    });

    // A lesson must describe a real lecture, in the position the course puts it.
    Object.keys(lessons).forEach(function (lectureId) {
      var lesson = lessons[lectureId];
      var entry = byLecture[lectureId];
      if (!entry) {
        errors.push("lesson " + lectureId + " does not match any lecture in the pack");
        return;
      }
      if (entry.module !== lesson.module) errors.push("lesson " + lectureId + " claims module " + lesson.module + " but the pack says " + entry.module);
      if (entry.order !== lesson.order) errors.push("lesson " + lectureId + " claims order " + lesson.order + " but the pack says " + entry.order);
    });

    /* The vocabulary gate.
     *
     * "Is this word available to the learner yet" has to be decidable, or the
     * teaching layer drifts back into inventing terminology — the bank already
     * shipped a correct answer built on "pre-registered stopping rule", a phrase
     * that appears nowhere in the course.
     *
     * The concept index is NOT the authority for this. Its own README says the
     * terms are retrieval candidates, and it reports "sample size" as first seen
     * in M02-L03 when M02-L02 is the lecture *titled* "Sample Size Logic". The
     * lossless graph_source chunks are the immutable evidence layer, so first
     * use is measured there, in the course's own teaching order. */
    function lectureRank(lectureId) {
      var entry = byLecture[lectureId];
      return entry ? entry.module * 1000 + entry.order : Number.MAX_SAFE_INTEGER;
    }

    /* Compare on words, not on punctuation. A transcript writes "sales-led growth"
     * while a lesson glosses "sales led growth"; an exact substring match calls that
     * invented vocabulary and sends the author to delete a term the course teaches in
     * a lecture TITLE. Hyphens, slashes, and repeated whitespace all collapse to one
     * space on both sides before matching. The title is included in the searched text
     * for the same reason — naming a concept in the title is teaching it. */
    function normaliseForVocab(value) {
      return String(value || "").toLowerCase().replace(/[‐-―\-\/]+/g, " ").replace(/\s+/g, " ").trim();
    }

    var transcriptsBySubject = {};
    function lectureTexts(courseId) {
      if (transcriptsBySubject[courseId]) return transcriptsBySubject[courseId];
      var ordered = manifest
        .filter(function (entry) { return entry.subject === courseId; })
        .sort(function (a, b) { return a.module - b.module || a.order - b.order; })
        .map(function (entry) {
          return {
            lectureId: entry.lecture_id,
            text: normaliseForVocab((entry.title || "") + " \n " + (entry.text || ""))
          };
        });
      transcriptsBySubject[courseId] = ordered;
      return ordered;
    }

    function firstUse(courseId, term) {
      var needle = normaliseForVocab(term);
      if (!needle) return null;
      var pattern = new RegExp("\\b" + needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
      var texts = lectureTexts(courseId);
      for (var index = 0; index < texts.length; index += 1) {
        if (pattern.test(texts[index].text)) return texts[index].lectureId;
      }
      return null;
    }

    Object.keys(lessons).forEach(function (lectureId) {
      var lesson = lessons[lectureId];
      (lesson.glossary || []).forEach(function (entry) {
        var term = String(entry.term || "").trim();
        var seen = firstUse(lesson.courseId, term);
        if (!seen) {
          // A plain-language label for an idea the course teaches without naming
          // it is legitimate; a technical-sounding phrase the course never uses
          // is the defect this gate exists to catch.
          if (term.split(/\s+/).length > 1) {
            warnings.push("lesson " + lectureId + " defines \"" + term + "\", which does not appear in the " + lesson.courseId + " transcripts — confirm it is not invented vocabulary.");
          }
          return;
        }
        if (lectureRank(seen) > lectureRank(lectureId)) {
          errors.push("lesson " + lectureId + " defines \"" + term + "\" but the course does not use it until " + seen);
        }
      });
    });

    /* The same authority applied to answer copy. Pure n-gram scanning cannot
     * tell terminology ("pre-registered stopping rule") from ordinary English
     * ("placed under"), so this runs as an opt-in content report rather than a
     * build signal — a noisy warning stream would train everyone to ignore the
     * precise gates above. Enable with --vocab-report. */
    if (process.argv.indexOf("--vocab-report") >= 0) courseIds.forEach(function (courseId) {
      var taughtLectures = Object.keys(lessons).filter(function (lectureId) { return lessons[lectureId].courseId === courseId; });
      if (!taughtLectures.length) return;
      var glossed = {};
      taughtLectures.forEach(function (lectureId) {
        (lessons[lectureId].glossary || []).forEach(function (entry) { glossed[String(entry.term).toLowerCase()] = true; });
      });
      Object.keys(courses[courseId].questions).forEach(function (id) {
        var question = courses[courseId].questions[id];
        if (question.optionShapeRisk || question.primerOnly) return;
        if (!(question.sourceIds || []).some(function (sourceId) { return !!lessons[sourceId]; })) return;
        var answerText = [];
        if (Array.isArray(question.options) && typeof question.answer === "number") answerText.push(question.options[question.answer]);
        (question.blanks || []).forEach(function (blank) { answerText.push((blank.options || [])[blank.answer]); });
        answerText.filter(Boolean).forEach(function (copy) {
          // Technical-looking multi-word phrases only: two adjacent words of
          // four or more letters, which is where invented jargon lives.
          var phrases = String(copy).toLowerCase().match(/\b[a-z][a-z-]{3,}\s+[a-z][a-z-]{3,}\b/g) || [];
          phrases.forEach(function (phrase) {
            if (glossed[phrase]) return;
            if (firstUse(courseId, phrase)) return;
            warnings.push(courseId + "/" + id + " answers with \"" + phrase + "\", which appears nowhere in the course transcripts.");
          });
        });
      });
    });

    /* Coverage: how much of the scheduled bank a cold learner can currently
     * reach with teaching in front of it. Reported, never silently rounded up. */
    courseIds.forEach(function (courseId) {
      var scheduled = Object.keys(courses[courseId].questions)
        .map(function (id) { return courses[courseId].questions[id]; })
        .filter(function (question) { return !question.optionShapeRisk && !question.primerOnly; });
      var taught = scheduled.filter(function (question) {
        return (question.sourceIds || []).every(function (sourceId) { return !!lessons[sourceId]; });
      });
      var lectures = new Set();
      scheduled.forEach(function (question) { (question.sourceIds || []).forEach(function (sourceId) { lectures.add(sourceId); }); });
      var taughtLectures = Array.from(lectures).filter(function (lectureId) { return !!lessons[lectureId]; });
      lessonCoverage[courseId] = {
        scheduledQuestions: scheduled.length,
        questionsFullyTaught: taught.length,
        questionsWithoutLesson: scheduled.length - taught.length,
        lecturesCited: lectures.size,
        lecturesWithLesson: taughtLectures.length
      };
      if (taught.length < scheduled.length) {
        warnings.push(courseId + ": " + (scheduled.length - taught.length) + " of " + scheduled.length +
          " scheduled questions still have no lesson for at least one lecture they cite (0→80 backlog).");
      }
    });
  }
} else warnings.push("Lecture-source existence, the vocabulary gate, and lesson coverage were not checked; pass the T6 pack path to enable them.");

var total = courseIds.reduce(function (sum, courseId) { return sum + Object.keys(courses[courseId].questions).length; }, 0);
/* A floor, not an equality. The original check pinned the bank at exactly 792 so
 * that a generator regression silently dropping surfaces would fail loudly — but
 * it also fails every time an authored item is legitimately added, which makes the
 * gate an obstacle to the work rather than a guard on it. A floor still catches the
 * regression it was written for. Growth is expected; shrinkage is the bug. */
if (total < 792) errors.push("Bank shrank to " + total + " items; the floor is 792 (728 generated challenges + 64 adaptive primers). A drop means the generator lost surfaces.");

console.log(JSON.stringify({
  ok: errors.length === 0,
  lessons: {authored: Object.keys(lessons).length, coverage: lessonCoverage},
  totals: courseIds.reduce(function (result, courseId) {
    var questions = Object.keys(courses[courseId].questions).map(function (id) { return courses[courseId].questions[id]; });
    var bias = longestOptionScore(questions);
    var spread = lengthRankSpread(questions);
    result[courseId] = {
      questions: questions.length,
      bosses: questions.filter(function (question) { return question.boss; }).length,
      constructedResponses: questions.filter(function (question) { return question.type === "short-answer"; }).length,
      excludedLegacyMcqs: questions.filter(function (question) { return question.optionShapeRisk; }).length,
      // "Always pick the longest option, never read the stem." 25% is chance.
      longestOptionScore: Math.round(bias.score * 100) / 100,
      longestOptionSample: bias.scored,
      // Where the correct answer sits once options are sorted by length, shortest
      // first. Four 0.25s means length carries no signal at all; one tall bar is a
      // strategy, whichever rank it sits on. Watches what longestOptionScore cannot.
      lengthRankShares: spread.shares.map(function (share) { return Math.round(share * 100) / 100; }),
      lengthRankSpread: Math.round(spread.spread * 100) / 100
    };
    return result;
  }, {}),
  errors: errors,
  warnings: warnings
}, null, 2));

if (errors.length) process.exitCode = 1;
