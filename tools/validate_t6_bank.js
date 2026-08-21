"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

// The validator lives in tools/; the question bank it reads lives in the app directory.
var root = path.join(__dirname, "..", "app");
var context = {window: {}, atob: function (value) { return Buffer.from(value, "base64").toString("binary"); }};
vm.createContext(context);
["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_ibm_case.js", "sets/t6_challenges.js"].forEach(function (relative) {
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

/* LAW-61, enforced instead of audited.
 *
 * "In the drilling-machine example, select every need the purchase actually serves" —
 * with no drilling machine anywhere on the page. The law has been a REDLINE since
 * 2026-08-14 and had NO gate behind it: the fix was a manual two-pass audit of all 816
 * questions, so nothing stopped the next one. An item like this validates, schedules
 * and marks correctly; it is simply unanswerable by reasoning, which is invisible to
 * every other check here.
 *
 * Two detectors, both on what the candidate can actually see:
 *
 *   DANGLING   the stem points at a specific example, case or scenario and the
 *              question ships no caselet to point at. On the examiner there is no
 *              lesson at all, so the referent has never existed.
 *   ORPHAN     the stem says "the same X" / "this X" where X never appears in the
 *              caselet. This is what put "The same distributor settles on an order
 *              quantity of 600 units" in SCLM Section B ahead of any distributor.
 *
 * Deliberately narrow. It fires on a pointing phrase plus a missing referent, never on
 * a stem that merely contains the word "case", because a gate that cries wolf gets
 * switched off and this one has to survive.
 */
var POINTS_AT_AN_EXAMPLE = /\b(in|from|for) the ([a-z][a-z-]* ){0,3}(example|case|caselet|scenario|situation|passage|extract|vignette)\b|\bthe (above|earlier|previous|preceding|foregoing) \w+|\bas (described|shown|given|stated) (above|earlier|previously)\b/i;
var NAMES_A_PRIOR_THING = /\bthe same ([a-z][a-z-]*(?: [a-z][a-z-]*)?)\b/i;

function visibleText(question) {
  return [question.caselet, question.stem, question.prompt]
    .filter(function (value) { return typeof value === "string"; }).join(" ");
}

function checkReferents(question) {
  var stem = [question.stem, question.prompt]
    .filter(function (v) { return typeof v === "string"; }).join(" ");
  if (!stem) return;
  var caselet = typeof question.caselet === "string" ? question.caselet : "";

  if (POINTS_AT_AN_EXAMPLE.test(stem) && !caselet.trim()) {
    errors.push(question.id + " points at an example its stem never shows (LAW-61): \"" +
      stem.slice(0, 90) + "\"");
  }

  var sameMatch = NAMES_A_PRIOR_THING.exec(stem);
  if (sameMatch) {
    /* Two very different uses of "the same X" share a shape:
     *
     *   ANAPHORIC     "The same distributor settles on an order quantity of 600" —
     *                 pointing back at a distributor this question never introduced.
     *                 The real defect, and it sat in SCLM Section B.
     *   DISTRIBUTIVE  "sends the same weekly email to every user, regardless of
     *                 their stage" — one thing given to many, introduced right here.
     *                 Perfectly answerable, and the first version of this check
     *                 flagged it.
     *
     * They separate on two things: a distributive reading carries a to/for/across
     * every|each|all marker, and an anaphoric one has its noun appear nowhere else in
     * what the candidate can see. Requiring BOTH keeps the gate quiet enough to stay
     * switched on. */
    /* The head noun is the FIRST word after "the same" — "the same distributor
       settles" is a distributor, not a settles. Taking the last word of the capture
       named the verb that followed it. */
    var phrase = sameMatch[1].trim().split(/\s+/);
    var noun = phrase[0];
    var tail = stem.slice(sameMatch.index, sameMatch.index + sameMatch[0].length + 40);
    var distributive = /\b(to|for|across|with)\s+(every|each|all|both|any)\b/i.test(tail);
    var seenElsewhere = visibleText(question)
      .toLowerCase()
      .split(sameMatch[0].toLowerCase()).join(" ")
      .indexOf(noun.toLowerCase()) >= 0;
    if (noun && noun.length > 3 && !distributive && !seenElsewhere) {
      errors.push(question.id + " says \"the same " + sameMatch[1] +
        "\" but nothing the candidate can see introduces that " + noun + " (LAW-61)");
    }
  }
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

/* Answer POSITION spread — where the correct answer sits in the list as printed.
 *
 * The two checks above watch how long the correct answer is. Neither watches
 * where it is, and that is the hole a real exploit went through: BRGSA's
 * hand-authored MCQs placed the answer at slot B in 85% of cases, with fifteen
 * consecutive. Three test students found it independently, and one scored 40/40
 * on a section of a subject he had never studied by pressing B down the column.
 *
 * Chance is 1/n. This errors rather than warns, because unlike the length checks
 * it passes today and a regression here is silently worth free marks. Grouped by
 * option count so a five-option item is judged against 20%, not 25%. */
var SLOT_BIAS_LIMIT = 0.35;

function answerSlotSpread(questions) {
  var groups = {};
  questions.forEach(function (question) {
    if (question.type && question.type !== "mcq") return;
    if (Array.isArray(question.answers)) return;
    if (!Array.isArray(question.options) || typeof question.answer !== "number") return;
    if (question.options.length < 2) return;
    var size = question.options.length;
    groups[size] = groups[size] || {counts: [], total: 0};
    groups[size].counts[question.answer] = (groups[size].counts[question.answer] || 0) + 1;
    groups[size].total += 1;
  });
  var worst = {share: 0, slot: null, size: null, total: 0};
  var shares = {};
  Object.keys(groups).forEach(function (size) {
    var group = groups[size];
    var list = [];
    for (var slot = 0; slot < Number(size); slot += 1) {
      var share = (group.counts[slot] || 0) / group.total;
      list.push(Math.round(share * 100) / 100);
      if (share > worst.share) worst = {share: share, slot: slot, size: Number(size), total: group.total};
    }
    shares[size] = list;
  });
  return {shares: shares, worst: worst};
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
    checkReferents(question);
    if (!Array.isArray(question.skills) || !question.skills.length) errors.push(question.id + " has no skill tags");
    if (!Array.isArray(question.sourceIds) || !question.sourceIds.length) errors.push(question.id + " has no sourceIds");
    if (question.type === "primer") {
      /* LAW-63. A primer asks for a prediction and reveals the rule afterwards, so an
       * options array is not a shape variation here — it is the defect: an option list
       * needs a key, and the key was the same sentence the panel had already printed.
       * The gate therefore forbids options outright rather than checking their shape,
       * and requires the case that the prediction is made against. */
      if (question.options !== undefined || question.answer !== undefined) errors.push(question.id + " must not offer options; a primer takes a prediction and has no keyed answer");
      if (!question.primerOnly || !question.primerCase || !question.primerFact || !question.primerApplication || !question.primerConnection) errors.push(question.id + " lacks adaptive primer content");
      if (question.primerCase && question.primerCase.indexOf(question.primerFact) >= 0) errors.push(question.id + " prints its own principle inside the case it asks about");
    } else if (question.type === "mcq") {
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
      /* `integrated` is the third mode, added with the eight cross-concept scenarios
         in t6_integrated.js. The gate predated them and was never widened — and it
         never fired to say so, because this validator did not load that file at all
         (fixed above). The whole of the newest and best-rated content in the product
         was passing a check that had never seen it. */
      if (["short", "case", "integrated"].indexOf(question.writtenMode) < 0) errors.push(question.id + " does not declare whether it is short-form, case-based or integrated writing");
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
    var mode = concept.assessmentMode || (["BRGSA", "IBM"].indexOf(courseId) >= 0 ? "mixed" : "objective");
    if (["mixed", "written", "objective"].indexOf(mode) < 0) errors.push(courseId + "/" + concept.id + " has unsupported assessmentMode " + mode);
    if (courseId === "IBM" && concept.conceptKind) {
      var expectedMode = concept.conceptKind === "layer" ? "mixed" : concept.conceptKind === "framework" ? "written" : concept.conceptKind === "concept" ? "objective" : null;
      if (!expectedMode) errors.push(courseId + "/" + concept.id + " has unsupported conceptKind " + concept.conceptKind);
      else if (mode !== expectedMode) errors.push(courseId + "/" + concept.id + " declares " + concept.conceptKind + " but uses assessmentMode " + mode + " instead of " + expectedMode);
    }
    if (mode === "written") {
      if (surfaces.length < 4) errors.push(courseId + "/" + concept.id + " has only " + surfaces.length + " written surfaces");
      if (activeSurfaces.length < 3) errors.push(courseId + "/" + concept.id + " has only " + activeSurfaces.length + " actively scheduled written surfaces");
      if (families.size < 4 || activeFamilies.size < 3) errors.push(courseId + "/" + concept.id + " lacks independent written practice families");
      if (activeSurfaces.some(function (question) { return question.type !== "short-answer"; })) errors.push(courseId + "/" + concept.id + " is written-only but appears on an objective surface");
      if (surfaces.some(function (question) { return question.boss; })) errors.push(courseId + "/" + concept.id + " is written-only but appears in an objective boss");
      if (!surfaces.some(function (question) {
        return question.type === "short-answer" && (question.supportingConceptIds || []).length;
      })) errors.push(courseId + "/" + concept.id + " has no linked written practice");
    } else {
      if (surfaces.length < 10) errors.push(courseId + "/" + concept.id + " has only " + surfaces.length + " surfaces");
      if (types.size < 5) errors.push(courseId + "/" + concept.id + " has only " + types.size + " question types");
      if (families.size < 8) errors.push(courseId + "/" + concept.id + " has only " + families.size + " independent variant families");
      if (activeSurfaces.length < 10) errors.push(courseId + "/" + concept.id + " has only " + activeSurfaces.length + " actively scheduled surfaces");
      if (activeTypes.size < 4) errors.push(courseId + "/" + concept.id + " has only " + activeTypes.size + " actively scheduled question types");
      if (activeFamilies.size < 6) errors.push(courseId + "/" + concept.id + " has only " + activeFamilies.size + " actively scheduled variant families");
      if (!surfaces.some(function (question) { return question.boss; })) errors.push(courseId + "/" + concept.id + " has no boss coverage");
    }
    if (mode === "objective" && activeSurfaces.some(function (question) { return question.type === "short-answer"; })) errors.push(courseId + "/" + concept.id + " is objective-only but appears on a written surface");
    if (["BRGSA", "IBM"].indexOf(courseId) >= 0 && mode !== "objective") {
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
  /* An add-in teaches a lecture inside a neighbouring lecture's lesson (owner decision
   * 2026-08-19). The worked example and the handoff belong to its HOST — that is what
   * makes it a fold-in rather than a thin lesson — so requiring them here would force
   * every add-in to be padded back to lesson shape, which is the thing the mechanism
   * exists to avoid. Everything that keeps the teaching checkable is still required of
   * it: its own objective, its own prose, and its own glossary, whose terms this file's
   * LAW-49 gate still scores against the transcripts exactly as it does a lesson's. */
  var isAddIn = Boolean(lesson.addInOf);
  var label = (isAddIn ? "add-in " : "lesson ") + lectureId;
  if (lesson.lectureId !== lectureId) errors.push(label + " disagrees with its own key");
  if (courseIds.indexOf(lesson.courseId) < 0) errors.push(label + " has unknown courseId " + lesson.courseId);
  if (isAddIn && !lessons[lesson.addInOf]) errors.push(label + " names host " + lesson.addInOf + ", which has no lesson");
  if (!lesson.objective || String(lesson.objective).trim().length < 20) errors.push(label + " has no usable objective");
  if (!Array.isArray(lesson.explainer) || lesson.explainer.length < 2) errors.push(label + " needs at least two explainer paragraphs");
  if (!isAddIn && (!lesson.worked || !lesson.worked.setup || !lesson.worked.move || !lesson.worked.because)) errors.push(label + " needs a worked example with setup, move and reason");
  var minGlossary = isAddIn ? 1 : 2;
  if (!Array.isArray(lesson.glossary) || lesson.glossary.length < minGlossary) errors.push(label + " needs at least " + minGlossary + " glossary term" + (minGlossary === 1 ? "" : "s"));
  (lesson.glossary || []).forEach(function (entry, index) {
    if (!entry || !entry.term || !entry.plain) errors.push(label + " glossary entry " + index + " is incomplete");
    else if (String(entry.plain).trim().length < 15) errors.push(label + " glossary term \"" + entry.term + "\" has no real definition");
  });
  if (!isAddIn && !lesson.connects) errors.push(label + " does not hand off to what comes next");
});

/* Lecture source. The clean transcripts are the authority; the old AI-Ready Pack
 * is still readable so existing invocations do not break, but content authored
 * against its dense layer is what LAW-49 exists to catch. See tools/lib/. */
var lectureSource = require("./lib/clean_transcripts.js");
/* The path may come from the environment so `npm run validate:bank` is not a
 * different, weaker check than the one the protocol documents. Without a path this
 * script used to skip the lecture checks and the whole vocabulary gate and still
 * report ok:true — a green tick over nothing, which is worse than no gate at all,
 * because it is quoted as evidence. Absent a path it is now an error. */
var packPath = process.argv[2] || process.env.T6_PACK;

/* The course notes, as a second authority beside the lectures. Optional, because the
 * material is owner-supplied and gitignored — but its absence is reported on every
 * finding it would have settled, so a run without it can never be mistaken for a
 * clean one. Nothing read here is written anywhere: see tools/lib/course_notes.js on
 * why this is loaded live rather than precomputed into an index. */
var courseNotes = require("./lib/course_notes.js");
var notesPath = process.argv[3] || process.env.T6_NOTES ||
  (fs.existsSync(path.join(__dirname, "..", "docs", "course-material"))
    ? path.join(__dirname, "..", "docs", "course-material") : null);
var notes = {available: false, sources: []};
if (notesPath) {
  try {
    notes = courseNotes.loadNotes(notesPath);
  } catch (error) {
    warnings.push("Could not read course notes at " + notesPath + ": " + error.message);
  }
}
if (!notes.available) {
  warnings.push("No course-notes source read, so every vocabulary finding below is judged on the lecture transcripts alone. The lessons were authored from the revision sheets too, so findings may be artefacts. Pass the course-material path as the third argument or set T6_NOTES.");
}

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
     * for the same reason — naming a concept in the title is teaching it.
     *
     * -ise/-ize is folded for the same reason, and folded the same way on BOTH sides.
     * The transcripts are transcribed to US spelling and the lessons are written in
     * British; without this, "decentralised model", "social mobilisation", "local
     * optimisation" and "randomised controlled trial" are all reported as invented
     * vocabulary while the course teaches every one of them. The fold does not have to
     * be linguistically correct — it turns "advertise" into "advertize" too — because
     * it is applied to the term and the transcript alike, so the comparison still holds.
     * It must never be applied to only one side. */
    function normaliseForVocab(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[‐-―\-\/]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/is(ation|ations|e|es|ed|ing)\b/g, "iz$1")
        .trim();
    }

    /* Plural tolerance has to work in BOTH directions. The first version appended an
     * optional plural to each word, which matched a singular heading against a plural
     * source — but not the reverse. So "carbon markets" failed against notes that say
     * "carbon market", and the gate reported a term the course does teach as absent from
     * its own module notes. Stemming the trailing plural off the heading first, then
     * allowing an optional one, makes the comparison symmetric. Words of three letters or
     * fewer are left alone so "gas" or "ops" are not stemmed into noise. */
    function wordPattern(word) {
      var stem = word.length > 3 ? word.replace(/(es|s)$/, "") : word;
      return stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:e?s)?";
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

    /* A glossary heading is singular ("pain reliever", "actionable metric") and the
     * lecture says it in the plural. A bare \bterm\b misses that — it reported six
     * terms as invented while the course used every one of them, one of them in the
     * very lecture the lesson describes. Each word may therefore carry an optional
     * plural. The tolerance is deliberately only a plural, not a general suffix:
     * \w* here would match "market" inside "marketing" and quietly stop the gate
     * catching the invented terminology it exists for. */
    function firstUse(courseId, term) {
      var needle = normaliseForVocab(term);
      if (!needle) return null;
      var body = needle.split(" ").map(wordPattern).join("\\s+");
      var pattern = new RegExp("\\b" + body + "\\b", "i");
      var texts = lectureTexts(courseId);
      for (var index = 0; index < texts.length; index += 1) {
        if (pattern.test(texts[index].text)) return texts[index].lectureId;
      }
      return null;
    }

    /* The notes are the second authority, and without them this gate manufactures
     * failures. `data/syllabus/README.md` says the term lists come from the course's
     * revision sheets, and the lessons were authored from those sheets as much as from
     * the lectures. A term the module notes introduce either has no transcript position
     * or has one that says nothing about where the course teaches it — "CSR trap",
     * "BOP scale paradox", "policy ripple effect" and "career aspiration bottleneck"
     * all read as invented vocabulary until the IBM short notes were searched, and all
     * four are in them.
     *
     * A term is available to a lesson when the module's OWN notes carry it, judged on
     * the first module of the file's range so a two-module file cannot smuggle a term
     * one module early. Crucially, a miss against a file that could not be extracted is
     * UNKNOWN and never an error: 9 of 49 note files here are image scans at 0
     * characters a page, and treating those as absence would fail lessons for material
     * nobody searched. */
    var notesBySubject = {};
    var unsearchableBySubject = {};
    if (notes.available) notes.sources.forEach(function (source) {
      if (source.searchable) {
        (notesBySubject[source.subject] = notesBySubject[source.subject] || [])
          .push({firstModule: source.firstModule, text: normaliseForVocab(source.text), file: source.file});
      } else {
        (unsearchableBySubject[source.subject] = unsearchableBySubject[source.subject] || [])
          .push({firstModule: source.firstModule, file: source.file});
      }
    });

    function inNotes(courseId, term, module) {
      var needle = normaliseForVocab(term);
      if (!needle) return null;
      var body = needle.split(" ").map(wordPattern).join("\\s+");
      var pattern = new RegExp("\\b" + body + "\\b", "i");
      var pool = notesBySubject[courseId] || [];
      for (var index = 0; index < pool.length; index += 1) {
        var source = pool[index];
        if (source.firstModule !== null && source.firstModule > module) continue;
        if (pattern.test(source.text)) return source.file;
      }
      return null;
    }
    /* Is there material covering this module that we could not read? */
    function blindSpot(courseId, module) {
      return (unsearchableBySubject[courseId] || []).filter(function (source) {
        return source.firstModule === null || source.firstModule <= module;
      })[0] || null;
    }

    Object.keys(lessons).forEach(function (lectureId) {
      var lesson = lessons[lectureId];
      (lesson.glossary || []).forEach(function (entry) {
        var term = String(entry.term || "").trim();
        var seen = firstUse(lesson.courseId, term);
        var premature = seen && lectureRank(seen) > lectureRank(lectureId);
        if (seen && !premature) return;

        // Either absent from the transcripts, or ahead of its first use in them.
        // Both are settled by the module's own notes before anything is reported.
        var note = notes.available ? inNotes(lesson.courseId, term, lesson.module) : null;
        if (note) return;

        var blind = notes.available ? blindSpot(lesson.courseId, lesson.module) : null;
        if (!notes.available) {
          // No notes given at all: fall back to the transcript-only judgement, but say so.
          if (premature) errors.push("lesson " + lectureId + " defines \"" + term + "\" but the course does not use it until " + seen + " (no notes source given; pass one to check the revision sheets before treating this as a defect)");
          else if (term.split(/\s+/).length > 1) warnings.push("lesson " + lectureId + " defines \"" + term + "\", which does not appear in the " + lesson.courseId + " transcripts — confirm it is not invented vocabulary.");
          return;
        }
        if (blind) {
          warnings.push("lesson " + lectureId + " defines \"" + term + "\", which is in neither the " + lesson.courseId + " transcripts nor the searchable notes — but " + blind.file + " covering this module could not be extracted, so this is unverified rather than wrong.");
          return;
        }
        if (premature) {
          errors.push("lesson " + lectureId + " defines \"" + term + "\" but the course does not use it until " + seen + ", and the module's own notes do not carry it either");
        } else if (term.split(/\s+/).length > 1) {
          warnings.push("lesson " + lectureId + " defines \"" + term + "\", which appears in neither the " + lesson.courseId + " transcripts nor the module's notes — confirm it is not invented vocabulary.");
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
      var runModules = new Set((courses[courseId].runs || []).filter(function (run) {
        return run.module >= 1 && run.module <= 8;
      }).map(function (run) { return run.module; }));
      var registeredLessons = Object.keys(lessons).filter(function (lectureId) {
        return lessons[lectureId].courseId === courseId;
      });
      var lessonsScheduledInModuleRuns = registeredLessons.filter(function (lectureId) {
        return runModules.has(lessons[lectureId].module);
      });
      lessonCoverage[courseId] = {
        scheduledQuestions: scheduled.length,
        questionsFullyTaught: taught.length,
        questionsWithoutLesson: scheduled.length - taught.length,
        lecturesCited: lectures.size,
        lecturesWithLesson: taughtLectures.length,
        registeredLessons: registeredLessons.length,
        lessonsScheduledInModuleRuns: lessonsScheduledInModuleRuns.length,
        lessonsReadableOnly: registeredLessons.length - lessonsScheduledInModuleRuns.length
      };
      if (taught.length < scheduled.length) {
        warnings.push(courseId + ": " + (scheduled.length - taught.length) + " of " + scheduled.length +
          " scheduled questions still have no lesson for at least one lecture they cite (0→80 backlog).");
      }
      if (lessonsScheduledInModuleRuns.length < registeredLessons.length) {
        errors.push(courseId + ": " + (registeredLessons.length - lessonsScheduledInModuleRuns.length) +
          " registered lesson(s) are readable only and never scheduled by sets 1–8.");
      }
    });
  }
} else errors.push("No lecture source given, so lecture existence, the LAW-49 vocabulary gate, and lesson coverage were all skipped. Pass the clean-transcripts path as the first argument or set T6_PACK. This is an error, not a warning: a run without it proves nothing.");

var total = courseIds.reduce(function (sum, courseId) { return sum + Object.keys(courses[courseId].questions).length; }, 0);
/* A floor, not an equality. The original check pinned the bank at exactly 792 so
 * that a generator regression silently dropping surfaces would fail loudly — but
 * it also fails every time an authored item is legitimately added, which makes the
 * gate an obstacle to the work rather than a guard on it. A floor still catches the
 * regression it was written for. Growth is expected; shrinkage is the bug. */
if (total < 792) errors.push("Bank shrank to " + total + " items; the floor is 792 (728 generated challenges + 64 adaptive primers). A drop means the generator lost surfaces.");

var LETTERS = ["A", "B", "C", "D", "E", "F"];
courseIds.forEach(function (courseId) {
  var questions = Object.keys(courses[courseId].questions).map(function (id) { return courses[courseId].questions[id]; });
  var worst = answerSlotSpread(questions).worst;
  if (!worst.total || worst.share <= SLOT_BIAS_LIMIT) return;
  errors.push(
    courseId + ": the correct answer sits at option " + (LETTERS[worst.slot] || worst.slot) +
    " in " + Math.round(worst.share * 100) + "% of " + worst.total + " " + worst.size +
    "-option questions (chance is " + Math.round((1 / worst.size) * 100) + "%), so \"always pick " +
    (LETTERS[worst.slot] || worst.slot) + "\" is a strategy. Answer position must be dealt evenly, " +
    "not left wherever the author happened to put it."
  );
});

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
      lengthRankSpread: Math.round(spread.spread * 100) / 100,
      // Where the correct answer sits as printed. Flat is the target; one tall
      // bar is "always pick that letter", which is worth free marks.
      answerSlotShares: answerSlotSpread(questions).shares
    };
    return result;
  }, {}),
  errors: errors,
  warnings: warnings
}, null, 2));

if (errors.length) process.exitCode = 1;
