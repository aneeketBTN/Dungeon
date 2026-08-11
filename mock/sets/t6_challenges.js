(function () {
  "use strict";

  var courses = window.T6_COURSES || {};
  var courseIds = ["BRGSA", "IBM", "SCLM", "SPMS"];
  var brgsaCaseOverrides = {
    brgsa_m1_demand: "A team gets enthusiastic interview comments, then tests a landing page with a stated price and a deposit button before building the product.",
    brgsa_m1_evidence: "Two hundred people say they like the idea, thirty join a wait-list, and only four accept a paid deposit. The founder wants to report the survey as the strongest demand signal.",
    brgsa_m2_design: "A team compares two onboarding flows but sends experienced users to A, new users to B, and declares a winner before setting a sample or success threshold.",
    brgsa_m2_error: "A test fails to detect a real improvement, keeps the weaker flow, and the missed gain would have been valuable at scale.",
    brgsa_m3_cohort: "The blended retention rate looks stable, but each newer signup cohort retains fewer users after week four than the cohort before it.",
    brgsa_m3_economics: "Acquisition cost is rising while gross contribution and retention are falling, even though total signups continue to grow.",
    brgsa_m4_constraint: "Traffic doubles after a campaign, but activation remains flat and most users still abandon the same setup step.",
    brgsa_m4_customers: "A founder hires a sales team before personally learning why the first ten customers buy, object, or leave.",
    brgsa_m5_channel: "A product spreads naturally through team invitations, but the company shifts most budget to a costly channel whose customers retain poorly.",
    brgsa_m5_activation: "Registrations rise sharply, yet most users leave before completing the action that creates the product's first real value.",
    brgsa_m6_habit: "A team copies a daily streak mechanic into a product customers only need during an occasional high-stakes event.",
    brgsa_m6_churn: "A referral campaign produces a signup spike, but referred users churn before reaching value and rarely invite anyone else.",
    brgsa_m7_pricing: "A subscription loses some accounts but retained customers expand enough that recurring revenue still grows; the team reports only logo churn.",
    brgsa_m7_pipeline: "Marketing generates qualified leads, but handoffs stall for days and acquisition spend is recovered only after a long payback period.",
    brgsa_m8_priority: "A high-visibility feature scores well on enthusiasm but has weak evidence, high effort, and no clear effect on the current growth constraint.",
    brgsa_m8_decision: "A dashboard celebrates visits and downloads, but no metric has an owner, threshold, or pre-declared action when the number changes."
  };

  function unique(values) {
    return values.filter(function (value, index) { return value && values.indexOf(value) === index; });
  }

  function wordCount(value) {
    return String(value || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function stableNumber(value) {
    return String(value).split("").reduce(function (total, character) {
      return ((total * 31) + character.charCodeAt(0)) >>> 0;
    }, 7);
  }

  function rotate(values, shift) {
    if (!values.length) return values;
    var amount = ((shift % values.length) + values.length) % values.length;
    return values.slice(amount).concat(values.slice(0, amount));
  }

  function hideTerm(copy, term) {
    var escaped = String(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return String(copy || "").replace(new RegExp(escaped, "ig"), "this idea");
  }

  function ensureSentence(copy) {
    var value = String(copy || "").trim();
    return value && !/[.!?]$/.test(value) ? value + "." : value;
  }

  function paralleliseOptions(question) {
    if (!Array.isArray(question.options) || question.options.length < 3 || typeof question.answer !== "number") return;
    var correctLength = wordCount(question.options[question.answer]);
    var longestWrong = Math.max.apply(null, question.options.filter(function (_, index) { return index !== question.answer; }).map(wordCount));
    question.optionShapeRisk = correctLength > longestWrong * 1.35 && correctLength - longestWrong >= 4;
    if (question.optionShapeRisk) question.qualityTier = "legacy-shape-risk";
  }

  function tagExistingQuestion(question) {
    question.type = question.type || "mcq";
    question.skills = question.skills || [question.perspective === "apply" ? "apply" : question.perspective === "connect" ? "connect" : question.perspective === "synthesis" ? "evaluate" : "distinguish"];
    question.difficulty = question.difficulty || (question.perspective === "synthesis" ? 4 : question.perspective === "apply" ? 3 : 2);
    question.variantFamily = question.variantFamily || question.id;
    question.supportingConceptIds = question.supportingConceptIds || [];
    question.sourceIds = question.sourceIds || [question.source];
    question.boss = false;
    if (Array.isArray(question.options)) {
      paralleliseOptions(question);
      question.misconceptions = question.options.map(function (_, index) {
        if (index === question.answer) return null;
        return "selected-belief:" + question.options[index];
      });
    }
  }

  function questionsForConcept(course, conceptId) {
    return Object.keys(course.questions).map(function (id) { return course.questions[id]; })
      .filter(function (question) { return question.conceptId === conceptId; });
  }

  function conceptData(course, concept) {
    var surfaces = questionsForConcept(course, concept.id);
    var seed = surfaces.filter(function (question) { return question.explanation && Array.isArray(question.options); })[0] || surfaces[0] || {};
    var applicationSeed = surfaces.filter(function (question) { return question.caselet && Array.isArray(question.options); })[0] || surfaces.filter(function (question) { return question.perspective === "apply" && Array.isArray(question.options); })[0] || seed;
    var wrong = Array.isArray(seed.options) ? seed.options.filter(function (_, index) { return index !== seed.answer; }) : [];
    var applicationWrong = Array.isArray(applicationSeed.options) ? applicationSeed.options.filter(function (_, index) { return index !== applicationSeed.answer; }) : wrong;
    return {
      id: concept.id,
      module: concept.module,
      source: concept.source || seed.source,
      name: concept.name || seed.node,
      summary: concept.summary || seed.explanation || seed.link,
      confusions: concept.confusions || wrong,
      caselet: concept.caselet || applicationSeed.caselet || brgsaCaseOverrides[concept.id] || applicationSeed.stem,
      application: concept.application || (Array.isArray(applicationSeed.options) ? applicationSeed.options[applicationSeed.answer] : seed.explanation),
      applicationWrong: concept.applicationWrong || applicationWrong,
      bridge: concept.bridge || seed.link || seed.explanation
    };
  }

  function choiceSet(correct, wrong, shift) {
    var values = unique([correct].concat(wrong || [])).slice(0, 4);
    var rotated = rotate(values, shift);
    return {options: rotated, answer: rotated.indexOf(correct)};
  }

  function balancedChoiceSet(correct, wrong, shift, id) {
    var set = choiceSet(correct, wrong, shift);
    var holder = {id: id, options: set.options, answer: set.answer};
    paralleliseOptions(holder);
    return {options: holder.options, answer: holder.answer, optionShapeRisk: holder.optionShapeRisk};
  }

  function comparableWrong(correct, values, count) {
    return unique(values || []).filter(function (value) { return value !== correct; }).sort(function (a, b) {
      return Math.abs(wordCount(a) - wordCount(correct)) - Math.abs(wordCount(b) - wordCount(correct));
    }).slice(0, count || 3);
  }

  function nearbyConcepts(course, concept) {
    var same = course.concepts.filter(function (entry) { return entry.id !== concept.id && entry.module === concept.module; });
    var other = course.concepts.filter(function (entry) { return entry.id !== concept.id && entry.module !== concept.module; });
    return same.concat(other).slice(0, 3);
  }

  /* ---------------------------------------------------------------------
   * Option-level diagnosis
   *
   * Distractors in this bank are not invented: they are borrowed from other
   * concepts. `comparableWrong(data.summary, otherSummaries)` hands the learner
   * another concept's principle. Because the generator knows exactly where each
   * wrong option came from, it can state exactly what selecting it assumed —
   * truthfully, by construction rather than by guess.
   *
   * Every diagnosis carries:
   *   tag   — stable identity used by the scheduler to detect a recurring
   *           misconception, and shown to the learner in the concept inspector.
   *   label — headline of the gap.
   *   why   — the belief the choice assumed, then what the source holds instead.
   *   cue   — what to look for so the distinction is caught earlier next time.
   * ------------------------------------------------------------------- */

  var ROLE_LABEL = {summary: "governing principle", application: "decision", bridge: "causal explanation", name: "label"};

  function buildProvenance(allData) {
    var index = {};
    allData.forEach(function (data) {
      ["summary", "application", "bridge", "name"].forEach(function (role) {
        var value = data[role];
        if (!value) return;
        var key = String(value).trim();
        // First writer wins: concept fields are unique across the bank, and a
        // collision must not silently rewrite an earlier concept's provenance.
        if (!index[key]) index[key] = {conceptId: data.id, name: data.name, role: role, module: data.module};
      });
    });
    return index;
  }

  function sameModule(owner, self) {
    return owner.module && self.module && owner.module === self.module;
  }

  /*
   * The panel already carries the governing principle and the wider connection
   * below the diagnosis. These strings therefore name the confusion and the
   * contrast only — repeating the full principle here made the panel read as the
   * same sentence three times.
   */
  function crossConceptDiagnosis(owner, self) {
    var neighbour = sameModule(owner, self) ? "a neighbouring idea in the same module" : "an idea from another module";
    if (owner.role === "name") {
      return {
        tag: "Confused " + self.name + " with " + owner.name,
        label: "Named a different concept",
        why: "This choice named " + owner.name + ", " + neighbour + ". The description given here belongs to " + self.name + ".",
        cue: "Match the description to the idea it uniquely fits. " + owner.name + " and " + self.name + " sit close together, so read for the detail only one of them explains."
      };
    }
    if (owner.role === "application") {
      return {
        tag: "Applied the decision rule of " + owner.name,
        label: "Right kind of move, wrong governing idea",
        why: "This is the decision " + owner.name + " calls for. This case is governed by " + self.name + ", and the defensible move has to follow from that rule instead.",
        cue: "Name the governing idea before choosing an action. The action follows the rule; picking a plausible action first is what lets a neighbouring framework slip in."
      };
    }
    if (owner.role === "bridge") {
      return {
        tag: "Used the causal chain of " + owner.name,
        label: "Borrowed another idea's reasoning",
        why: "This choice explains why " + owner.name + " matters. The chain that makes " + self.name + " matter runs through a different step.",
        cue: "Follow the causal step this case actually depends on rather than one that sounds correct about a related idea."
      };
    }
    return {
      tag: "Confused " + self.name + " with " + owner.name,
      label: "Used another idea's governing principle",
      why: "This choice states the principle behind " + owner.name + ", " + neighbour + ". This question turns on " + self.name + ", which is a different rule answering a different question.",
      cue: "Ask which idea the case is testing before selecting a principle. " + owner.name + " and " + self.name + " are easy to swap when only the topic is read and not the claim."
    };
  }

  /*
   * Same concept, different facet. A match board offers an idea's principle and its
   * decision side by side, so a learner can hold the right concept and still place
   * what it claims where what it tells you to do belongs. That is a precise gap and
   * deserves a precise answer, not the generic fallback.
   */
  var FACET_QUESTION = {
    summary: "what the idea claims is true",
    application: "what the idea tells you to do",
    bridge: "why the idea changes the outcome",
    name: "what the idea is called"
  };

  function facetMixDiagnosis(owner, self, targetRole) {
    return {
      tag: "Confused the " + ROLE_LABEL[owner.role] + " of " + self.name + " with its " + ROLE_LABEL[targetRole],
      label: "Right idea, wrong part of it",
      why: "This choice is genuinely part of " + self.name + " — it states " + FACET_QUESTION[owner.role] + " — but the slot asks for " + FACET_QUESTION[targetRole] + ". Both belong to the same idea and answer different questions, so one cannot stand in for the other.",
      cue: "Read what the slot is asking for before matching content to it. A principle states what holds; a decision states what to do because it holds."
    };
  }

  function selfErrorDiagnosis(option, self, kind) {
    if (kind === "application") {
      return {
        tag: "Chose an action the case does not support",
        label: "Picked a move the evidence does not justify",
        why: "This choice recommends an action the case gives no support for. It is about the right idea, but " + self.name + " does not license this particular move on these facts.",
        cue: "Point to the fact in the case that would have to be true for this action to be right. If it is not there, the action is not supported."
      };
    }
    return {
      tag: "Held a claim the source corrects",
      label: "Stated a belief the source rejects",
      why: "This choice states a claim about " + self.name + " that the source material specifically contradicts. It is a common way to describe the idea, and it is the version being corrected here.",
      cue: "Check the claim word by word against the precise definition rather than against the general sense of the topic."
    };
  }

  function fallbackDiagnosis(self) {
    return {
      tag: "Departed from " + self.name,
      label: "Answered from a different rule",
      why: "This choice does not follow from " + self.name + ", which is the idea this question is testing.",
      cue: "Return to the governing idea and check the option against it directly before selecting."
    };
  }

  function diagnoseOption(option, self, provenance, hints, authored, questionId, optionIndex, targetRole) {
    var text = String(option).trim();
    if (hints && hints[text]) return hints[text];
    var byQuestion = authored.byQuestion[questionId];
    if (byQuestion && byQuestion[optionIndex]) return byQuestion[optionIndex];
    if (authored.byText[text]) return authored.byText[text];
    var owner = provenance[text];
    if (owner && owner.conceptId !== self.id) return crossConceptDiagnosis(owner, self);
    if (owner && targetRole && owner.role !== targetRole) return facetMixDiagnosis(owner, self, targetRole);
    if ((self.applicationWrong || []).indexOf(option) >= 0) return selfErrorDiagnosis(option, self, "application");
    if ((self.confusions || []).indexOf(option) >= 0) return selfErrorDiagnosis(option, self, "summary");
    return fallbackDiagnosis(self);
  }

  // The correct option's own provenance tells us which facet the slot is asking
  // for, which is what makes a same-concept wrong-facet choice diagnosable.
  function targetRoleFor(options, answer, provenance) {
    if (answer < 0 || !options[answer]) return null;
    return (provenance[String(options[answer]).trim()] || {}).role || null;
  }

  function diagnoseGroup(options, answer, self, provenance, hints, authored, questionId) {
    var targetRole = targetRoleFor(options, answer, provenance);
    return options.map(function (option, index) {
      if (index === answer) return null;
      return diagnoseOption(option, self, provenance, hints, authored, questionId, index, targetRole);
    });
  }

  function attachDiagnoses(question, dataById, provenance, authored) {
    var self = dataById[question.conceptId];
    if (!self) return;
    var hints = question.diagnosisHints || null;
    if (question.type === "match") {
      // A match is an assignment problem: the same choice means something
      // different depending on which row it lands in, so each row carries its
      // own diagnosis for every choice it could wrongly receive.
      question.rows.forEach(function (row) {
        var rowSelf = dataById[row.conceptId] || self;
        var rowRole = targetRoleFor(question.choices, row.answer, provenance);
        row.diagnoses = question.choices.map(function (choice, index) {
          if (index === row.answer) return null;
          return diagnoseOption(choice, rowSelf, provenance, hints, authored, question.id, index, rowRole);
        });
      });
      question.misconceptions = question.rows.map(function (row) {
        return (row.diagnoses.filter(Boolean)[0] || {}).tag || "match-mismatch";
      });
      return;
    }
    if (question.type === "boss") {
      question.steps.forEach(function (step) {
        var stepSelf = dataById[(step.conceptIds || [])[0]] || self;
        step.diagnoses = diagnoseGroup(step.options, step.answer, stepSelf, provenance, step.diagnosisHints || hints, authored, question.id);
      });
      question.misconceptions = question.steps.map(function (step) {
        return (step.diagnoses.filter(Boolean)[0] || {}).tag || "broken-reasoning-step";
      });
      return;
    }
    if (question.type === "cloze" || question.type === "case-cloze") {
      question.blanks.forEach(function (blank) {
        blank.diagnoses = diagnoseGroup(blank.options, blank.answer, self, provenance, hints, authored, question.id);
      });
      question.misconceptions = question.blanks.map(function (blank) {
        return (blank.diagnoses.filter(Boolean)[0] || {}).tag || "wrong-blank";
      });
      return;
    }
    if (Array.isArray(question.options)) {
      question.diagnoses = diagnoseGroup(question.options, question.answer, self, provenance, hints, authored, question.id);
      question.misconceptions = question.diagnoses.map(function (diagnosis) {
        return diagnosis ? diagnosis.tag : null;
      });
    }
  }

  function addQuestion(course, question) {
    if (course.questions[question.id]) throw new Error("Duplicate T6 challenge question ID: " + question.id);
    course.questions[question.id] = question;
  }

  function addTermCloze(course, concept, data) {
    var choices = choiceSet(data.name, nearbyConcepts(course, concept).map(function (entry) { return entry.name; }), stableNumber(concept.id));
    addQuestion(course, {
      id: concept.id + "_term_cloze",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.source,
      sourceIds: [data.source],
      node: data.name,
      pattern: "Fill the key term",
      perspective: "retrieve",
      type: "cloze",
      skills: ["recognise", "distinguish"],
      difficulty: 2,
      variantFamily: concept.id + "_term",
      boss: false,
      caselet: hideTerm(data.summary, data.name),
      stem: "Complete the sentence with the concept that best fits the description.",
      template: ["The concept is", ""],
      blanks: [{label: "Choose the concept", options: choices.options, answer: choices.answer}],
      explanation: data.summary,
      link: data.bridge,
      misconceptions: choices.options.map(function (option, index) { return index === choices.answer ? null : "neighbouring-concept:" + option; }),
      repairId: concept.id + "_case_cloze"
    });
  }

  function addPrimer(course, concept, data, allData) {
    var nearby = comparableWrong(data.summary, allData.filter(function (entry) {
      return entry.id !== concept.id;
    }).map(function (entry) { return entry.summary; }));
    var choices = choiceSet(data.summary, nearby, stableNumber(concept.id + "primer"));
    addQuestion(course, {
      id: concept.id + "_primer",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.source,
      sourceIds: [data.source],
      node: data.name,
      pattern: "Primer",
      perspective: "primer",
      type: "primer",
      skills: ["recognise"],
      difficulty: 1,
      variantFamily: concept.id + "_primer",
      boss: false,
      primerOnly: true,
      primerFact: data.summary,
      primerApplication: data.application,
      primerConnection: data.bridge,
      primerMisconception: (data.confusions || [])[0] || "A nearby idea can look similar without using the same rule.",
      caselet: "",
      stem: "Which principle should you carry into the next question?",
      options: choices.options,
      answer: choices.answer,
      explanation: data.summary,
      link: data.bridge,
      misconceptions: choices.options.map(function (option, index) {
        return index === choices.answer ? null : "primer-neighbour:" + option;
      })
    });
  }

  function addBridgeCloze(course, concept, data, allData) {
    var otherBridges = comparableWrong(data.bridge, allData.filter(function (entry) { return entry.id !== concept.id; }).map(function (entry) { return entry.bridge; }));
    var choices = balancedChoiceSet(data.bridge, otherBridges, stableNumber(concept.id + "bridge"), concept.id + "_bridge_choice");
    addQuestion(course, {
      id: concept.id + "_bridge_cloze",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.source,
      sourceIds: [data.source],
      node: data.name,
      pattern: "Complete the reasoning",
      perspective: "connect",
      type: "cloze",
      skills: ["explain", "connect"],
      difficulty: 3,
      variantFamily: concept.id + "_bridge",
      boss: false,
      caselet: data.caselet,
      stem: "Complete the causal explanation, not just the label.",
      template: ["This decision matters because", ""],
      blanks: [{label: "Choose the causal explanation", options: choices.options, answer: choices.answer}],
      explanation: data.summary,
      link: data.bridge,
      misconceptions: choices.options.map(function (option, index) { return index === choices.answer ? null : "selected-belief:" + option; }),
      repairId: concept.id + "_case_cloze"
    });
  }

  function addMisconceptionRepair(course, concept, data, allData) {
    var otherSummaries = comparableWrong(data.summary, allData.filter(function (entry) { return entry.id !== concept.id; }).map(function (entry) { return entry.summary; }));
    var choices = balancedChoiceSet(data.summary, otherSummaries, stableNumber(concept.id + "repair"), concept.id + "_repair_choice");
    addQuestion(course, {
      id: concept.id + "_repair_cloze",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.source,
      sourceIds: [data.source],
      node: data.name,
      pattern: "Repair the misconception",
      perspective: "diagnose",
      type: "cloze",
      skills: ["diagnose", "explain"],
      difficulty: 3,
      variantFamily: concept.id + "_misconception-repair",
      boss: false,
      caselet: "A classmate writes: “" + ensureSentence((data.confusions || [])[0] || "The most visible signal settles the whole decision") + "”",
      stem: "Replace the flawed claim with the precise principle.",
      template: ["The correction is", ""],
      blanks: [{label: "Choose the corrected principle", options: choices.options, answer: choices.answer}],
      explanation: data.summary,
      link: data.bridge,
      misconceptions: choices.options.map(function (option, index) { return index === choices.answer ? null : "selected-belief:" + option; }),
      repairId: concept.id + "_case_cloze"
    });
  }

  function nearbyApplications(data, allData) {
    return allData.filter(function (entry) { return entry.id !== data.id; }).sort(function (a, b) {
      return Math.abs(wordCount(a.application) - wordCount(data.application)) - Math.abs(wordCount(b.application) - wordCount(data.application)) ||
        Math.abs(a.module - data.module) - Math.abs(b.module - data.module);
    }).map(function (entry) { return entry.application; });
  }

  function addCaseCloze(course, concept, data, allData) {
    var actionWrong = comparableWrong(data.application, (data.applicationWrong || []).concat(nearbyApplications(data, allData)));
    var actionChoices = choiceSet(data.application, actionWrong, stableNumber(concept.id + "case"));
    var termChoices = choiceSet(data.name, nearbyConcepts(course, concept).map(function (entry) { return entry.name; }), stableNumber(concept.id + "term2"));
    addQuestion(course, {
      id: concept.id + "_case_cloze",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.source,
      sourceIds: [data.source],
      node: data.name,
      pattern: "Complete the case",
      perspective: "apply",
      type: "case-cloze",
      skills: ["apply", "explain"],
      difficulty: 4,
      variantFamily: concept.id + "_case-chain",
      boss: false,
      caselet: data.caselet,
      stem: "Fill both parts of the recommendation so the action and framework agree.",
      template: ["The best first decision is", "The framework that justifies it is", ""],
      blanks: [
        {label: "Choose the decision", options: actionChoices.options, answer: actionChoices.answer},
        {label: "Choose the framework", options: termChoices.options, answer: termChoices.answer}
      ],
      explanation: data.summary,
      link: data.bridge,
      misconceptions: ["wrong-decision", "wrong-framework"],
      repairId: concept.id + "_bridge_cloze"
    });
  }

  function addShortAnswer(course, concept, data) {
    addQuestion(course, {
      id: concept.id + "_short_answer",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.source,
      sourceIds: [data.source],
      node: data.name,
      pattern: "Construct a response",
      perspective: "generate",
      type: "short-answer",
      skills: ["explain", "apply", "generate"],
      difficulty: 4,
      variantFamily: concept.id + "_constructed-response",
      boss: false,
      estimatedMinutes: 4,
      selfReviewOnly: true,
      caselet: data.caselet,
      stem: "Write a two-to-four sentence recommendation. Name the governing idea, state the decision, and explain why the case evidence supports it.",
      rubric: [
        {id: "principle", label: "Governing idea", description: "Uses " + data.name + " accurately rather than only naming a nearby concept."},
        {id: "decision", label: "Decision", description: data.application},
        {id: "reason", label: "Causal reason", description: data.bridge}
      ],
      exemplar: "Use " + data.name + " to frame the response. " + ensureSentence(data.application) + " " + ensureSentence(data.bridge),
      explanation: data.summary,
      link: data.bridge,
      misconceptions: [],
      repairId: concept.id + "_case_cloze"
    });
  }

  function addModuleMatch(course, module, pair, dataById) {
    var first = dataById[pair[0].id];
    var second = dataById[pair[1].id];
    var choices = rotate([
      first.summary,
      second.summary,
      first.application,
      second.application
    ], module % 4);
    function answerFor(value) { return choices.indexOf(value); }
    addQuestion(course, {
      id: course.id.toLowerCase() + "_m" + module + "_match",
      courseId: course.id,
      conceptId: pair[0].id,
      supportingConceptIds: [pair[1].id],
      module: module,
      source: first.source,
      sourceIds: unique([first.source, second.source]),
      node: first.name + " and " + second.name,
      pattern: "Match the framework",
      perspective: "distinguish",
      type: "match",
      skills: ["distinguish", "apply"],
      difficulty: 4,
      variantFamily: course.id.toLowerCase() + "_m" + module + "_match",
      boss: false,
      caselet: null,
      stem: "Match each prompt to the precise explanation or action.",
      choices: choices,
      rows: [
        {label: first.name + " — principle", answer: answerFor(first.summary), conceptId: pair[0].id},
        {label: second.name + " — principle", answer: answerFor(second.summary), conceptId: pair[1].id},
        {label: first.name + " — decision", answer: answerFor(first.application), conceptId: pair[0].id},
        {label: second.name + " — decision", answer: answerFor(second.application), conceptId: pair[1].id}
      ],
      explanation: first.summary + " " + second.summary,
      link: first.bridge + " " + second.bridge,
      misconceptions: ["swapped-principles", "swapped-decisions"],
      repairId: pair[0].id + "_case_cloze"
    });
  }

  function addModuleBoss(course, module, pair, dataById, variant) {
    var first = dataById[pair[0].id];
    var second = dataById[pair[1].id];
    variant = variant || 1;
    var allData = Object.keys(dataById).map(function (id) { return dataById[id]; });
    var firstWrong = comparableWrong(first.application, (first.applicationWrong || []).concat([second.application]).concat(nearbyApplications(first, allData)));
    var secondWrong = comparableWrong(second.application, (second.applicationWrong || []).concat([first.application]).concat(nearbyApplications(second, allData)));
    var firstChoices = choiceSet(first.application, firstWrong, stableNumber(course.id + module + "a" + variant));
    var secondChoices = choiceSet(second.application, secondWrong, stableNumber(course.id + module + "b" + variant));
    var integrationCorrect = "Use " + first.name + " for the first decision and " + second.name + " for the second; neither result replaces the other.";
    var integrationSwap = "Use " + second.name + " for the first decision and " + first.name + " for the second; the labels can be swapped without changing the logic.";
    var integrationForward = "Use " + first.name + " for both decisions; once the first issue is solved, the second can be treated as the same problem.";
    var integrationBackward = "Use " + second.name + " for both decisions; the later issue should determine the earlier diagnosis as well.";
    var integration = choiceSet(integrationCorrect, [integrationSwap, integrationForward, integrationBackward], stableNumber(course.id + module + "c" + variant));
    // The integration step's three wrong options are constructed here, so their
    // meaning is known exactly rather than inferred from provenance.
    var integrationHints = {};
    integrationHints[integrationSwap] = {
      tag: "Swapped " + first.name + " and " + second.name,
      label: "Applied both frameworks to the wrong decisions",
      why: "This choice assumed the two labels are interchangeable. They are not: the first decision is governed by " + first.name + " and the second by " + second.name + ", and swapping them changes what each decision is allowed to conclude.",
      cue: "Anchor each framework to the decision it answers before integrating. Ask what question each half of the case is asking."
    };
    integrationHints[integrationForward] = {
      tag: "Stretched " + first.name + " over both decisions",
      label: "Let the first framework settle the second decision",
      why: "This choice assumed solving the first issue makes the second the same problem. " + first.name + " does not answer the second decision; " + second.name + " does, and collapsing them drops the distinction the case is built on.",
      cue: "Check whether the second decision would change if the first had gone the other way. If it would not, they are separate questions."
    };
    integrationHints[integrationBackward] = {
      tag: "Let the later decision determine the earlier one",
      label: "Reversed the order of the reasoning chain",
      why: "This choice assumed the second issue governs the first diagnosis. The chain runs forward: " + first.name + " settles the first decision, and " + second.name + " then applies to what follows — reading it backwards makes the earlier diagnosis depend on its own consequence.",
      cue: "Establish the order of the decisions before joining them. The earlier diagnosis cannot rest on a later result."
    };
    var frames = [
      "One recommendation must resolve two linked decisions. First: " + ensureSentence(first.caselet) + " Then: " + ensureSentence(second.caselet),
      "A draft answer recommends “" + ensureSentence(first.applicationWrong[0] || first.confusions[0]) + "” It also recommends “" + ensureSentence(second.applicationWrong[0] || second.confusions[0]) + "” Test both claims against these facts: " + ensureSentence(first.caselet) + " " + ensureSentence(second.caselet),
      "The first decision will be made before the second, and the board asks whether one rule can settle both. First case: " + ensureSentence(first.caselet) + " Second case: " + ensureSentence(second.caselet),
      "An exam response has swapped the two frameworks. Repair the response using the actual cases: " + ensureSentence(first.caselet) + " " + ensureSentence(second.caselet),
      "New evidence forces a final recommendation across two connected issues. Issue one: " + ensureSentence(first.caselet) + " Issue two: " + ensureSentence(second.caselet)
    ];
    var stems = [
      "Build the reasoning chain. All three steps must agree before the conclusion is secure.",
      "Repair the draft by diagnosing both errors and rebuilding the final recommendation.",
      "Decide where each framework applies, then explain why one cannot replace the other.",
      "Correct the framework swap before you accept the final conclusion.",
      "Use the new evidence to build a defensible two-framework recommendation."
    ];
    addQuestion(course, {
      id: course.id.toLowerCase() + "_m" + module + "_boss_" + variant,
      courseId: course.id,
      conceptId: pair[0].id,
      supportingConceptIds: [pair[1].id],
      module: module,
      source: first.source,
      sourceIds: unique([first.source, second.source]),
      node: first.name + " → " + second.name,
      pattern: "Boss question · reasoning chain",
      perspective: "synthesis",
      type: "boss",
      skills: ["diagnose", "apply", "connect", "evaluate"],
      difficulty: 5,
      variantFamily: course.id.toLowerCase() + "_m" + module + "_boss",
      boss: true,
      estimatedMinutes: 4,
      caselet: frames[variant - 1],
      stem: stems[variant - 1],
      steps: [
        {label: "Step 1 · Diagnose the first decision", prompt: "What should happen first?", options: firstChoices.options, answer: firstChoices.answer, conceptIds: [pair[0].id]},
        {label: "Step 2 · Apply the second framework", prompt: "What should happen next?", options: secondChoices.options, answer: secondChoices.answer, conceptIds: [pair[1].id]},
        {label: "Step 3 · Join the reasoning", prompt: "Which final explanation keeps both decisions consistent?", options: integration.options, answer: integration.answer, conceptIds: [pair[0].id, pair[1].id], diagnosisHints: integrationHints}
      ],
      frameworkSteps: ["diagnose", "apply", "integrate"],
      explanation: "The first decision uses " + first.name + "; the second uses " + second.name + ". A strong answer preserves both distinctions before integrating them.",
      link: first.bridge + " " + second.bridge,
      misconceptions: ["framework-swap", "single-framework-overreach", "broken-integration"],
      repairId: pair[0].id + "_case_cloze"
    });
  }

  function configureRuns(course) {
    var questions = Object.keys(course.questions).map(function (id) { return course.questions[id]; });
    var activeQuestions = questions.filter(function (question) { return !question.optionShapeRisk && !question.primerOnly; });
    var bossIds = activeQuestions.filter(function (question) { return question.boss; }).map(function (question) { return question.id; });
    course.runs.forEach(function (run) {
      if (run.module >= 1 && run.module <= 8) {
        run.questionPoolIds = activeQuestions.filter(function (question) { return question.module === run.module; }).map(function (question) { return question.id; });
        run.questionCount = 8;
        run.bossIds = run.questionPoolIds.filter(function (id) { return course.questions[id].boss; });
        run.minutes = 12;
      } else if (run.id === 9) {
        run.questionPoolIds = activeQuestions.filter(function (question) {
          return question.type === "match" || question.perspective === "connect" || question.type === "case-cloze";
        }).map(function (question) { return question.id; });
        run.questionCount = 12;
        run.bossIds = [];
        run.minutes = 16;
      } else if (run.id === 10) {
        run.questionPoolIds = activeQuestions.map(function (question) { return question.id; });
        run.questionCount = 12;
        run.bossIds = bossIds;
        run.bossQuota = 3;
        run.minutes = 24;
        run.title = "Flexible practice check";
        run.subtitle = "Choose the feedback timing and assessment mix";
      }
    });
  }

  var authoredDiagnoses = window.T6_AUTHORED_DIAGNOSES || {byQuestion: {}, byText: {}};

  courseIds.forEach(function (courseId) {
    var course = courses[courseId];
    if (!course) return;
    Object.keys(course.questions).forEach(function (id) { tagExistingQuestion(course.questions[id]); });
    var dataById = {};
    var allData = course.concepts.map(function (concept) {
      var data = conceptData(course, concept);
      dataById[concept.id] = data;
      return data;
    });
    course.concepts.forEach(function (concept) {
      addPrimer(course, concept, dataById[concept.id], allData);
      addTermCloze(course, concept, dataById[concept.id]);
      addBridgeCloze(course, concept, dataById[concept.id], allData);
      addMisconceptionRepair(course, concept, dataById[concept.id], allData);
      addCaseCloze(course, concept, dataById[concept.id], allData);
      addShortAnswer(course, concept, dataById[concept.id]);
    });
    for (var module = 1; module <= 8; module += 1) {
      var pair = course.concepts.filter(function (concept) { return concept.module === module; });
      if (pair.length < 2) continue;
      addModuleMatch(course, module, pair.slice(0, 2), dataById);
      for (var bossVariant = 1; bossVariant <= 5; bossVariant += 1) addModuleBoss(course, module, pair.slice(0, 2), dataById, bossVariant);
    }

    // Runs last, over every question in the course — authored MCQs included — so a
    // question added by any path is diagnosed without its author wiring anything up.
    var provenance = buildProvenance(allData);
    Object.keys(course.questions).forEach(function (id) {
      attachDiagnoses(course.questions[id], dataById, provenance, authoredDiagnoses);
    });

    configureRuns(course);
  });

  window.T6_COURSES = courses;
})();
