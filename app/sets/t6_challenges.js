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

  /* Attribute a claim to a named concept (CONTENT-RULES R3, "on-topic-ness").
   *
   * R3 says every option must name the concept, or none may. Measured 2026-08-15, the
   * families below broke it in the same way: the correct answer named the concept and
   * the distractors named somebody else's, so "keep the option that mentions the thing
   * this set is called" paid 82-100%. The rule is `argmax`, so a distractor that names
   * the concept less densely than the correct answer is still eliminated — presence is
   * not enough, the density has to match.
   *
   * Two directions were measured before either was written. Stripping each concept's
   * name out of its own prose reaches the same numbers and was REJECTED: it produces
   * "Lean this idea asks whether real people will take a real action" and takes
   * `connect` from 0.5% to 26.6%. Moving a metric by destroying the sentence is the
   * mirror of watering down a distractor.
   *
   * This is the other direction, and it is `connect`'s — the one family already at
   * 0.5%, which reaches it by naming the concept in EVERY option. Attaching a
   * neighbour's claim to this concept does not make the claim true; it makes it a
   * specific false claim ABOUT this concept, which is what a distractor is for.
   *
   * The colon form is deliberate. It is grammatical for any head noun, singular or
   * plural ("Decision errors: A Type I error scales..."), and it changes no letter
   * case, so acronyms survive — an earlier draft lower-cased the first word and
   * produced "cAC carries no decision meaning". */
  function attributeTo(text, fromName, toName) {
    var body = String(text || "").trim().replace(/\.$/, "");
    if (!body) return "";
    /* The label goes on EVERY option unchanged, including the one that already opens on
       its own name. An earlier draft pronounced that self-reference as "It" to avoid
       "Strategic fit: Strategic fit aligns the supply chain...", and it cost more than
       it bought: it fires on 11 of 64 summaries, all of them correct answers, so it
       shortened the correct option by three or four words while its distractors kept
       theirs. That is an R3 LENGTH cue traded for an R3 NAME cue — SPMS crossed the
       validator's rank-3 threshold and earned a new warning the moment it was added.
       Uniform labelling adds the same words to every option, so length ranks are
       preserved exactly and the redundant reading on those 11 is the price. */
    return toName + ": " + ensureSentence(body);
  }

  /* Every option in one set, rewritten as a claim about the same concept, so no option
     can be picked out by which one mentions the syllabus. `entries` is [{text, owner}]. */
  function attributedChoices(entries, conceptName) {
    return entries.map(function (entry) {
      return attributeTo(entry.text, entry.owner, conceptName);
    });
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

  function assessmentMode(course, concept) {
    return concept.assessmentMode || (course.id === "IBM" || course.id === "BRGSA" ? "mixed" : "objective");
  }

  function conceptData(course, concept) {
    var surfaces = questionsForConcept(course, concept.id);
    var seed = surfaces.filter(function (question) { return question.explanation && Array.isArray(question.options); })[0] || surfaces[0] || {};
    var applicationSeed = surfaces.filter(function (question) { return question.caselet && Array.isArray(question.options); })[0] || surfaces.filter(function (question) { return question.perspective === "apply" && Array.isArray(question.options); })[0] || seed;
    var wrong = Array.isArray(seed.options) ? seed.options.filter(function (_, index) { return index !== seed.answer; }) : [];
    var applicationWrong = Array.isArray(applicationSeed.options) ? applicationSeed.options.filter(function (_, index) { return index !== applicationSeed.answer; }) : wrong;
    var authoredCase = typeof concept.caselet === "string" && concept.caselet.trim().length > 0;
    return {
      id: concept.id,
      module: concept.module,
      source: concept.source || seed.source,
      name: concept.name || seed.node,
      summary: concept.summary || seed.explanation || seed.link,
      confusions: concept.confusions || wrong,
      caselet: concept.caselet || applicationSeed.caselet || brgsaCaseOverrides[concept.id] || applicationSeed.stem,
      caseEvidence: concept.caseEvidence || "",
      application: concept.application || (Array.isArray(applicationSeed.options) ? applicationSeed.options[applicationSeed.answer] : seed.explanation),
      applicationWrong: concept.applicationWrong || applicationWrong,
      bridge: concept.bridge || seed.link || seed.explanation,
      /*
       * A concept is stitched from more than one authored question: `seed`
       * supplies the principle, `applicationSeed` supplies the case and the
       * decision. When those are different lectures, a case question that
       * explained `seed.explanation` was reinforcing a lecture the learner had
       * not just reasoned about — nine case questions did exactly that, e.g. a
       * sample-size case answered correctly and then explained with the null
       * hypothesis. The case's own lecture is carried here so applied surfaces
       * can explain, link, and cite what they actually tested.
       */
      caseSource: authoredCase ? (concept.source || applicationSeed.source || seed.source) : (applicationSeed.source || concept.source || seed.source),
      caseExplanation: authoredCase ? (concept.caseExplanation || concept.summary || seed.explanation) : (applicationSeed.explanation || concept.summary || seed.explanation),
      caseLink: authoredCase ? (concept.caseLink || concept.bridge || seed.link) : (applicationSeed.link || concept.bridge || seed.link)
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

  /*
   * Distractor selection has two duties that pull against each other: the option
   * set must not cue the answer by length, and it must not be answerable by
   * topic alone. `comparableWrong` honours only the first — it sorts every
   * candidate by word-count distance, which systematically evicted the authored
   * same-concept wrong answers (short and pointed) in favour of other concepts'
   * decision sentences (long, and structurally similar because they come from
   * the same template). Measured before this change: 59 of 64 case questions
   * carried no same-concept distractor at all, so the reasoning actually under
   * test was "which of these four sentences is about A/B testing" — answerable
   * without understanding, and unanswerable by understanding alone.
   *
   * Relevance now wins, with length parity kept as the tiebreaker inside each
   * tier. Cross-concept options still backfill when a concept does not carry
   * enough authored wrong answers of its own, so breadth is never lost.
   */
  /*
   * The two duties genuinely conflict for this bank, because the authored
   * correct decisions carry qualifiers ("...unless a pre-registered rule
   * applies") while the authored wrong ones are punchy ("Delete Variant A from
   * the report"). Taking only same-concept distractors makes the correct answer
   * the longest option in 130 places, which is a different way of giving the
   * answer away.
   *
   * So relevance is maximised subject to the length guard rather than instead of
   * it: fill from the same concept first, and only if the set would still cue by
   * length, trade the shortest relevant option for the longest available
   * cross-concept one — one swap at a time, stopping the moment the cue is gone.
   * A case that cannot be made safe with three same-concept distractors still
   * keeps two, which is enough to force reasoning rather than topic-matching.
   */
  function shapeSafe(correct, wrongs) {
    if (!wrongs.length) return false;
    var longest = Math.max.apply(null, wrongs.map(wordCount));
    var correctLength = wordCount(correct);
    return !(correctLength > longest * 1.35 && correctLength - longest >= 4);
  }

  function relevantWrong(correct, preferred, fallback, count) {
    var limit = count || 3;
    var chosen = comparableWrong(correct, preferred, limit);
    var used = {};
    chosen.concat([correct]).forEach(function (value) { used[String(value)] = true; });
    var spare = unique(fallback || []).filter(function (value) {
      return value !== correct && !used[String(value)];
    });

    while (chosen.length < limit && spare.length) {
      var next = comparableWrong(correct, spare, 1)[0];
      if (!next) break;
      chosen.push(next);
      spare = spare.filter(function (value) { return value !== next; });
    }

    while (!shapeSafe(correct, chosen) && spare.length) {
      var longest = spare.slice().sort(function (a, b) { return wordCount(b) - wordCount(a); })[0];
      chosen.sort(function (a, b) { return wordCount(a) - wordCount(b); });
      chosen.shift();
      chosen.push(longest);
      spare = spare.filter(function (value) { return value !== longest; });
    }
    return chosen;
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

  /* The fallback fires when an option is not authored, not a known confusion, and has
   * no provenance — so it cannot say WHY this particular option is wrong. It can still
   * say what the slot was asking for, and until now it threw that away.
   *
   * Measured by T5 (tools/measure-persona-regression.mjs): this one sentence answered
   * 55-100% of every wrong decision in a set-1 run on all four subjects. A learner who
   * makes four different mistakes and is told the same thing four times has been
   * taught once. `targetRole` is already computed at the call site for facetMix, so
   * the four cues below are information the function had and discarded, not variety
   * manufactured to move a number. */
  var FALLBACK_CUE = {
    summary: "The slot is asking what the idea claims is true. Check this option against the definition clause by clause — a statement that sounds right about the topic is not the same as the claim this idea makes.",
    application: "The slot is asking what the idea tells you to do. Check that this option is an action, and that it is the action this idea licenses rather than generally sensible practice.",
    bridge: "The slot is asking why the idea changes the outcome. Check that this option gives a reason, not a restatement of what the idea is.",
    name: "The slot is asking which idea governs. Match the situation's symptom to the idea that explains it, rather than to the idea whose vocabulary the option borrows."
  };

  function fallbackDiagnosis(self, targetRole) {
    return {
      tag: "Departed from " + self.name,
      label: "Answered from a different rule",
      why: "This choice does not follow from " + self.name + ", which is the idea this question is testing.",
      cue: FALLBACK_CUE[targetRole] ||
        "Return to the governing idea and check the option against it directly before selecting."
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
    return fallbackDiagnosis(self, targetRole);
  }

  // The correct option's own provenance tells us which facet the slot is asking
  // for, which is what makes a same-concept wrong-facet choice diagnosable.
  function targetRoleFor(options, answer, provenance) {
    if (answer < 0 || !options[answer]) return null;
    return (provenance[String(options[answer]).trim()] || {}).role || null;
  }

  /* What the question asks for, when provenance cannot say.
   *
   * `targetRoleFor` looks the correct answer up by exact text, and misses on two
   * whole classes: authored options that were never built from a concept field, and
   * generated ones that `attributeTo` has since rewritten into "Concept: claim" for
   * the name-matching fix. On those it returns null, which used to mean every
   * unrecognised distractor got the same sentence — measured by T5 at 55-100% of all
   * wrong decisions in a set-1 run.
   *
   * `perspective` is set on every question at build time and says what the item is
   * for, so it answers the same question less precisely and never misses. It is a
   * fallback, not a replacement: provenance is exact where it fires. */
  var ROLE_BY_PERSPECTIVE = {
    explain: "summary",
    recognise: "summary",
    apply: "application",
    decide: "application",
    diagnose: "application",
    connect: "bridge",
    distinguish: "name",
    generate: "application"
  };

  function askedRole(question, fromProvenance) {
    return fromProvenance || ROLE_BY_PERSPECTIVE[question.perspective] || null;
  }

  function diagnoseGroup(options, answer, self, provenance, hints, authored, questionId, defaultRole) {
    var targetRole = targetRoleFor(options, answer, provenance) || defaultRole || null;
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
        var rowRole = askedRole(question, targetRoleFor(question.choices, row.answer, provenance));
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
        step.diagnoses = diagnoseGroup(step.options, step.answer, stepSelf, provenance, step.diagnosisHints || hints, authored, question.id, askedRole(question, null));
      });
      question.misconceptions = question.steps.map(function (step) {
        return (step.diagnoses.filter(Boolean)[0] || {}).tag || "broken-reasoning-step";
      });
      return;
    }
    if (question.type === "cloze" || question.type === "case-cloze") {
      question.blanks.forEach(function (blank) {
        blank.diagnoses = diagnoseGroup(blank.options, blank.answer, self, provenance, hints, authored, question.id, askedRole(question, null));
      });
      question.misconceptions = question.blanks.map(function (blank) {
        return (blank.diagnoses.filter(Boolean)[0] || {}).tag || "wrong-blank";
      });
      return;
    }
    /* Multiple-select has no single `question.answer`, so the generic path below
     * would treat every option as a distractor — including the correct ones — and
     * overwrite the authored diagnosis with a generated placeholder whose text is
     * undefined. That shipped once: the wrong-answer panel rendered blank because
     * `diagnoses[i].text` existed but held nothing.
     *
     * Correct options get null. Wrong options keep whatever the author wrote and
     * only fall back to generation when the author left a gap. Authored text wins
     * here in a way it does not elsewhere, because an MSQ distractor is wrong in a
     * specific way the generator cannot infer from provenance. */
    if (question.type === "msq") {
      var answerSet = question.answers || [];
      var existing = question.diagnoses || [];
      var role = askedRole(question, targetRoleFor(question.options, answerSet[0], provenance));
      question.diagnoses = question.options.map(function (option, index) {
        if (answerSet.indexOf(index) >= 0) return null;
        if (existing[index] && (existing[index].why || existing[index].label)) return existing[index];
        return diagnoseOption(option, self, provenance, hints, authored, question.id, index, role);
      });
      question.misconceptions = question.diagnoses.map(function (diagnosis) {
        return diagnosis ? diagnosis.tag : null;
      });
      return;
    }
    if (Array.isArray(question.options)) {
      /* Same rule the msq branch states, for the same reason: a hand-written
       * distractor is wrong in a specific way the generator cannot infer from
       * provenance, so an authored diagnosis is kept and only a gap is filled.
       * Generated questions carry none, so for them this is a no-op. */
      var authoredHere = question.diagnoses || [];
      var generated = diagnoseGroup(question.options, question.answer, self, provenance, hints, authored, question.id, askedRole(question, null));
      question.diagnoses = generated.map(function (diagnosis, index) {
        if (index === question.answer) return null;
        var own = authoredHere[index];
        return (own && (own.why || own.label)) ? own : diagnosis;
      });
      question.misconceptions = question.diagnoses.map(function (diagnosis) {
        return diagnosis ? diagnosis.tag : null;
      });
    }
  }

  /* Where the correct answer sits.
   *
   * `rotateOptions` spreads the generated families evenly — SPMS, IBM and SCLM
   * each land on a flat 25/25/25/25. It only governs questions the generator
   * builds. Authored questions carry the answer wherever the author put it, and
   * an author reaches for the same slot far more often than chance does: BRGSA's
   * hand-written MCQs place it at index 1 in 85% of cases, with a run of fifteen
   * consecutive. Three test students independently noticed and answered the rest
   * of that section by pressing B without reading it. One scored 40/40 that way.
   *
   * So the guard belongs after every path that can add a question rather than
   * inside any one of them. This runs last, over the whole course.
   *
   * The permutation is a hash of the question id and nothing else, so it is the
   * same on every reload, every build and every device. That matters beyond
   * tidiness: the frozen evidence pack, a learner's saved responses and the
   * answer keys quoted in the ledgers all address options by index, and an order
   * that drifted between sessions would silently invalidate them.
   *
   * Everything index-addressed moves together — the answer, the parallel
   * `diagnoses` array and the `misconceptions` derived from it — because the
   * option-level diagnosis is the best writing in the product and it is attached
   * by position. Reordering options without it would leave every wrong answer
   * explained as though it were a different wrong answer. */
  function idHash(value) {
    var text = String(value);
    var hash = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  // Fisher-Yates driven by a small LCG, seeded from the id alone.
  function permutationFor(seedText, length) {
    var seed = idHash(seedText) || 1;
    var order = [];
    for (var i = 0; i < length; i += 1) order.push(i);
    for (var j = length - 1; j > 0; j -= 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      var k = seed % (j + 1);
      var held = order[j];
      order[j] = order[k];
      order[k] = held;
    }
    return order;
  }

  function reorder(list, order) {
    if (!Array.isArray(list)) return list;
    return order.map(function (from) { return list[from]; });
  }

  /* `order` lists the old index now sitting at each new position, so the inverse
   * is what an answer index needs: where did old slot n end up. */
  function inverseOf(order) {
    var where = [];
    order.forEach(function (from, to) { where[from] = to; });
    return where;
  }

  function debiasGroup(holder, seedText) {
    if (!Array.isArray(holder.options) || holder.options.length < 2) return;
    var order = permutationFor(seedText, holder.options.length);
    var where = inverseOf(order);
    holder.options = reorder(holder.options, order);
    if (Array.isArray(holder.diagnoses)) holder.diagnoses = reorder(holder.diagnoses, order);
    if (Array.isArray(holder.misconceptions) && holder.misconceptions.length === order.length) {
      holder.misconceptions = reorder(holder.misconceptions, order);
    }
    if (typeof holder.answer === "number" && holder.answer >= 0) holder.answer = where[holder.answer];
    if (Array.isArray(holder.answers)) {
      holder.answers = holder.answers.map(function (index) { return where[index]; }).sort(function (a, b) { return a - b; });
    }
  }

  function debiasOptionOrder(question) {
    if (question.type === "match") {
      /* Rows keep their order; only the choice list is permuted. The four-label
       * matching items ran slot1=B, slot2=C, slot3=D, slot4=A in all four
       * subjects, which is a single fixed key a learner meets sixteen times. */
      if (!Array.isArray(question.choices) || question.choices.length < 2) return;
      var order = permutationFor(question.id + ":choices", question.choices.length);
      var where = inverseOf(order);
      question.choices = reorder(question.choices, order);
      question.rows.forEach(function (row) {
        if (Array.isArray(row.diagnoses)) row.diagnoses = reorder(row.diagnoses, order);
        if (typeof row.answer === "number" && row.answer >= 0) row.answer = where[row.answer];
      });
      return;
    }
    if (question.type === "boss") {
      (question.steps || []).forEach(function (step, index) {
        debiasGroup(step, question.id + ":step" + index);
      });
      return;
    }
    if (question.type === "cloze" || question.type === "case-cloze") {
      (question.blanks || []).forEach(function (blank, index) {
        debiasGroup(blank, question.id + ":blank" + index);
      });
      return;
    }
    debiasGroup(question, question.id);
  }

  /* Shuffling alone is not enough.
   *
   * A per-question shuffle removes the authored bias but re-introduces drift:
   * over 52 questions a fair shuffle lands one letter near 38% often enough to
   * be worth guessing, and "pick C" is the same exploit as "pick B" with a
   * smaller edge. The generated families were already exactly flat before any of
   * this, and that property is worth keeping rather than trading for randomness.
   *
   * So the correct answer's slot is dealt, not rolled: each option-count group
   * gets equal numbers of every slot, and which question receives which slot is
   * a deterministic shuffle of that dealt list. Exactly uniform, and with no
   * cycle to read off — the failure mode of a plain rotation.
   *
   * Distractor order still comes from debiasOptionOrder above; this only decides
   * where the correct one sits, by swapping it into place. */
  function swapInto(holder, target) {
    var from = holder.answer;
    if (from === target) return;
    var limit = Math.max(from, target);
    function swap(list) {
      if (!Array.isArray(list) || list.length <= limit) return;
      var held = list[from];
      list[from] = list[target];
      list[target] = held;
    }
    swap(holder.options);
    swap(holder.diagnoses);
    if (Array.isArray(holder.misconceptions) && holder.misconceptions.length === holder.options.length) {
      swap(holder.misconceptions);
    }
    holder.answer = target;
  }

  function balanceAnswerPositions(course) {
    var groups = {};
    Object.keys(course.questions).sort().forEach(function (id) {
      var question = course.questions[id];
      // Single-answer MCQs only. Multi-select has no one slot to balance, and the
      // nested shapes are dealt with per holder by debiasOptionOrder.
      if (question.type && question.type !== "mcq") return;
      if (Array.isArray(question.answers)) return;
      if (!Array.isArray(question.options) || typeof question.answer !== "number") return;
      if (question.options.length < 2) return;
      var size = question.options.length;
      groups[size] = groups[size] || [];
      groups[size].push(question);
    });
    Object.keys(groups).forEach(function (key) {
      var list = groups[key];
      var size = Number(key);
      var targets = list.map(function (ignored, index) { return index % size; });
      var order = permutationFor(course.id + ":slots:" + size, targets.length);
      targets = order.map(function (from) { return targets[from]; });
      list.forEach(function (question, index) { swapInto(question, targets[index]); });
    });
  }

  function addQuestion(course, question) {
    if (course.questions[question.id]) throw new Error("Duplicate T6 challenge question ID: " + question.id);
    course.questions[question.id] = question;
  }

  /* Authored multiple-select items for SPMS Section B.
   *
   * The paper's Section B is 20 MSQs worth 40 of its 75 marks, negatively marked
   * at +1 per right option and -1 per wrong, floored at zero per question. No
   * generated surface can stand in for that: an MSQ needs several defensibly
   * correct options and at least one plausible wrong one, which is an authoring
   * job. Each item sits on a lecture that already has a lesson, so LAW-47 holds
   * without any extra scheduling work. */
  /* ---------------------------------------------------------------------
   * The examiner-only multi-selects.
   *
   * SPMS Section B needs twenty and the pool held exactly twenty, so the "three
   * seeded sets" were one set printed three times across 40 of the paper's 75
   * marks — a candidate re-sitting set 2 after set 1 met the identical Section B.
   * That is the section with no slack at all, and it is also the only negatively
   * marked one in the term, so it is the worst place in the product to be serving
   * a paper the learner has already answered.
   *
   * These eight are `examOnly`: hard-reserved out of every study pool, and
   * additive, so nothing Learn could reach yesterday has been taken away. They
   * carry one concept per module so the reservation is spread across the paper
   * rather than concentrated in one part of the course.
   *
   * Every P-type item has exactly two correct options. The live paper allows at most
   * two selections and awards 2 for the exact pair, 1 for one correct option with no
   * wrong option, and 0 once any wrong option is selected. Option positions still
   * vary so the pair cannot be learned without reading the question.
   * ------------------------------------------------------------------- */
  var SPMS_MULTI_EXAM_ONLY = [
    {concept: "spms_dfv", source: "SPMS-M01-L05", node: "Desirability, feasibility, viability", examOnly: true, variant: "exam",
     caselet: "A logistics startup has built a route-planning tool. Drivers who trialled it completed their rounds sooner and asked to keep it. The engineering team ships updates weekly on existing map infrastructure. The company charges ₹400 per driver per month; the support and mapping licence cost per driver is ₹430, and neither falls with volume.",
     stem: "Select every statement this case supports.",
     options: [
       "Desirability holds: the people who used it wanted to carry on using it",
       "Feasibility holds: it is being built and shipped with technology that exists now",
       "The idea fails on viability, because each additional driver deepens the loss",
       "The idea is proven overall, since two of the three checks are clearly passed",
       "Viability can be assumed from the drivers' enthusiasm, because demand sets price"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Averaged the three checks", label: "Treated two passes as an overall pass",
       why: "This choice assumed the three checks trade off against each other. They do not: a product has to clear all three, and the one that fails here is the one that decides whether the business can continue at all. Two out of three is a description of where the problem is, not a verdict that there is none.",
       cue: "Name the check that fails before judging the idea. There is no score across the three — a failure in one is a failure."},
       4: {tag: "Read desirability as viability", label: "Used enthusiasm as evidence about economics",
         why: "This choice assumed that wanting something establishes what it can be sold for. The drivers' enthusiasm is desirability evidence. Viability is a separate question answered by the ₹400 against ₹430, and the case says that gap does not close with volume.",
         cue: "Enthusiasm is design evidence. Only a number about cost and price can answer viability."}},
     explanation: "Desirability and feasibility both hold; viability fails, because ₹400 of revenue against ₹430 of cost means every additional driver loses money and the case states the cost does not fall with scale. All three checks have to clear."},

    {concept: "spms_tamsam", source: "SPMS-M02-L04", node: "TAM, SAM, and SOM", examOnly: true, variant: "exam",
     caselet: "A company sells compliance software to licensed pharmacies. There are 900,000 licensed pharmacies worldwide. Its product is certified only under Indian regulation, which covers 90,000 of them. Of those, 62,000 already run a competing system on multi-year contracts, and the firm's sales capacity can reach about 4,000 pharmacies in the coming year.",
     stem: "Select every statement that sizes this market correctly.",
     options: [
       "The 900,000 figure is the total addressable market",
       "Regulatory certification is what narrows the total to a serviceable 90,000",
       "About 4,000 is the obtainable share, because reach and competition bound it",
       "The 62,000 on competing contracts should be counted in the serviceable market as switchable demand",
       "The obtainable figure should be the 90,000 serviceable pharmacies, since sales capacity can be hired"
     ], answers: [0, 1, 2],
     wrong: {4: {tag: "Sized ambition instead of reach", label: "Removed the constraint by assuming it away",
       why: "This choice assumed a constraint stops counting once you plan to remove it. Capacity can indeed be hired, and until it is, the obtainable figure is what the firm can actually reach - a plan built on 90,000 rests on a hire that has not happened.",
       cue: "Size what is true now. A constraint you intend to lift still binds the number you are committing to."},
       3: {tag: "Counted locked demand as serviceable", label: "Sized what could not be served",
       why: "This choice assumed a pharmacy under a multi-year contract with a competitor is available to serve. It may become available later, and a plan may target it, but the serviceable figure is what the firm can actually sell to now — counting it inflates the number the plan rests on.",
       cue: "Ask what stops you serving each group. A live contract is a constraint like any other."}},
     explanation: "Total is everyone the product could in principle serve, 900,000. Certification is a real constraint that narrows it to 90,000 serviceable. The obtainable figure is bounded by both competition and the firm's own reach, which is why 4,000 is the number a plan should be built on."},

    {concept: "spms_lean_canvas", source: "SPMS-M03-L02", node: "Lean Canvas", examOnly: true, variant: "exam",
     stem: "Select every statement that is true of what a Lean Canvas is for.",
     options: [
       "It records the assumptions a business rests on so they can be tested",
       "It replaces the Business Model Canvas boxes that suit an established company with ones a startup needs",
       "It is a document to be completed once and then held stable for the investor conversation",
       "Its value is that a wrong box is cheap to discover and cheap to change",
       "A box left empty is a failure of the exercise and should be filled before the canvas is used"
     ], answers: [0, 1, 3],
     wrong: {4: {tag: "Filled a box to look complete", label: "Treated a gap as untidiness rather than as information",
       why: "This choice assumed a canvas is finished when every box has words in it. An empty box records that nothing is known there yet, which is the most useful thing it can tell you; filling it to look complete replaces a known gap with an invented answer.",
       cue: "An empty box is a finding. Ask what would have to be true to fill it, rather than filling it."},
       2: {tag: "Treated the canvas as a deliverable", label: "Made a working instrument into a document",
       why: "This choice assumed the canvas is finished once written. It is a record of what is still uncertain, so a box that survives contact with evidence is worth keeping and one that does not is the finding — holding it stable removes the only thing it is for.",
       cue: "Ask what happens when a box turns out to be wrong. If the answer is nothing, it is being used as a document."}},
     explanation: "The canvas exists to make assumptions explicit and cheap to change. Holding it stable to look consistent is the one use that removes its value."},

    {concept: "spms_unit_economics", source: "SPMS-M04-L07", node: "Unit economics", examOnly: true, variant: "exam",
     caselet: "A subscription business earns ₹1,800 of gross profit per customer per year. It spends ₹5,400 to acquire one. Customers stay an average of four years. The finance lead reports that the business is profitable per customer and proposes raising acquisition spend.",
     stem: "Select every statement this case supports.",
     options: [
       "Acquisition cost is recovered in the third year of the relationship",
       "Lifetime gross profit of about ₹7,200 exceeds the ₹5,400 acquisition cost",
       "A payback measured in years is a cash-flow risk the profitability statement does not show",
       "Because lifetime value exceeds acquisition cost, raising spend carries no additional risk",
       "Profitability per customer is established as soon as the first year's gross profit is earned"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Read a ratio as a licence to scale", label: "Ignored what payback costs in cash",
       why: "This choice assumed a healthy lifetime-to-acquisition ratio settles the spending decision. It does not: three years of payback means the money is out of the business for three years per customer, and raising spend multiplies that exposure long before the returns arrive.",
       cue: "A ratio says whether a customer is worth buying. Payback says whether you can afford to buy many at once."},
       4: {tag: "Called back the acquisition cost too early", label: "Declared profit before it was recovered",
         why: "This choice assumed the first year's ₹1,800 makes the customer profitable. The ₹5,400 was spent once and has to be recovered before anything is profit, which takes three years at this rate.",
         cue: "Profit per customer starts after acquisition cost is recovered, not after the first payment."}},
     explanation: "₹1,800 a year against ₹5,400 is a three-year payback, and four years of retention gives about ₹7,200 of lifetime gross profit. Both facts are true at once, and the second does not remove the cash risk the first creates."},

    {concept: "spms_alternatives", source: "SPMS-M05-L02", node: "Competition and alternatives", examOnly: true, variant: "exam",
     caselet: "A team building an expense-reporting tool lists two rival products in its competitive review. Interviews find that of forty finance teams, twenty-six use a spreadsheet template, nine ask an assistant to compile receipts by hand, and five have decided the problem is not worth solving and simply absorb the errors.",
     stem: "The review already lists the two rival products. Select every further alternative this case shows the product is really competing against.",
     options: [
       "The spreadsheet template twenty-six teams currently rely on",
       "The manual compilation nine teams pay an assistant to do",
       "The decision by five teams to do nothing about the problem",
       "The two rival products, which should be counted again as the primary competition",
       "The other finance software these teams already pay for that does not touch expenses"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Re-counted what was already on the review", label: "Answered a question the team had already answered",
       why: "This choice assumed the rival products are the answer. They are already on the review, and the stem asks what it missed - which is the finding, since forty teams were interviewed and thirty-five of them use neither rival.",
       cue: "Read what the stem excludes. Naming what is already counted adds nothing to the competitive picture."},
       4: {tag: "Counted adjacent software as an alternative", label: "Confused nearby with competing",
         why: "This choice assumed anything the customer already pays for competes. An alternative is what they would otherwise do about THIS job; software that does not touch expenses is not another way of reporting expenses, however much of the budget it takes.",
         cue: "Ask whether the option would do the same job. Sharing a buyer is not the same as serving the same need."}},
     explanation: "Competition is whatever the customer would otherwise do about this job - here a spreadsheet, a person, and doing nothing at all, which between them cover thirty-five of the forty teams. Adjacent software serving a different need is not an alternative."},

    {concept: "spms_traceability", source: "SPMS-M06-L08", node: "Requirements traceability", examOnly: true, variant: "exam",
     caselet: "A hospital group tells a software vendor: \"Our nurses waste time at shift handover and patients are at risk when something is missed.\" The vendor's product team decides the product will carry a structured handover record. The delivery team breaks that into a template editor for one release and an audit trail for the next.",
     stem: "Select every statement that classifies this chain correctly.",
     options: [
       "The hospital's statement is a customer requirement: a business need, not a specification",
       "The structured handover record is the product requirement",
       "The template editor and the audit trail are project requirements for particular releases",
       "The hospital's statement is a project requirement, since it came from the party paying for the work",
       "Standardising means building exactly what this hospital described, for this hospital"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Classified by who spoke", label: "Used the source instead of the content",
       why: "This choice assumed the level of a requirement is set by who stated it. It is set by what it describes: the hospital described a business problem and a risk, which is a customer requirement however senior the person saying it.",
       cue: "Read what the sentence describes, not who said it. A need is a customer requirement even when the customer is paying."},
       4: {tag: "Built for one customer and called it a product", label: "Skipped the generalising step",
         why: "This choice assumed standardising means implementing the stated need literally. Standardising generalises one customer's need so that other customers of that kind are served by the same product, which is what makes it a product rather than a bespoke build.",
         cue: "If the result serves exactly one customer, the generalising step has not happened."}},
     explanation: "Customer requirements are business needs and aspirations; the product requirement is what the product will do about them; project requirements break that down for a release. Standardising is what turns one hospital's need into something many can buy."},

    {concept: "spms_roadmap", source: "SPMS-M07-L04", node: "Product roadmap", examOnly: true, variant: "exam",
     stem: "Select every statement that is true of a product roadmap.",
     options: [
       "It sequences development, release and evolution against a time axis",
       "What has been deliberately left out is part of the decision it records",
       "It is the inventory of every capability the product will eventually contain",
       "It follows from a product strategy, which it turns into releases",
       "Once published it should be held fixed, since changing it undermines the commitments made from it"
     ], answers: [0, 1, 3],
     wrong: {4: {tag: "Froze the sequence", label: "Confused a commitment with a plan",
       why: "This choice assumed a roadmap's value is that it does not move. Its value is that it is the best ordering given what is known, and evidence arriving is the ordinary case rather than a failure - a sequence that cannot change is a promise, and the product has stopped learning from it.",
       cue: "Ask what happens when evidence contradicts the order. If the answer is nothing, it is a commitment, not a roadmap."},
       2: {tag: "Made the roadmap a feature list", label: "Recorded contents instead of order",
       why: "This choice assumed a roadmap enumerates what the product will hold. It is an ordering decision, and an inventory has no order in it — which is exactly the information a roadmap exists to carry.",
       cue: "If the list could be rearranged without changing its meaning, it is an inventory rather than a roadmap."}},
     explanation: "A roadmap translates strategy into a sequence of releases on a time axis. Deferral is part of that decision, which is why an inventory of eventual contents is a different artefact."},

    {concept: "spms_metrics", source: "SPMS-M08-L03", node: "Actionable product metrics", examOnly: true, variant: "exam",
     caselet: "A six-month-old product reports to its board each month on registered accounts, page views, and press mentions. All three rise steadily. Weekly active use has been flat since month two, and no one has been asked to act on any of the three reported numbers.",
     stem: "Select every criticism this reporting fairly attracts.",
     options: [
       "The reported measures rise whatever happens, so they cannot separate progress from activity",
       "No number carries an owner or a threshold, so none of them can require a decision",
       "The measure that would show whether the product is working is the one not being reported",
       "The reporting is appropriate, since a board is entitled to see growth figures at this stage",
       "Registered accounts is the right headline measure, because it is the figure that has grown most"
     ], answers: [0, 1, 2],
     wrong: {4: {tag: "Chose the measure that moved most", label: "Let the largest number decide what to report",
       why: "This choice assumed the fastest-rising figure is the most informative. Registered accounts can only rise, so its growth carries no information about whether the product works - the size of a movement says nothing when the measure cannot move the other way.",
       cue: "Ask whether the number could fall if the product got worse. If not, its rise means nothing."},
       3: {tag: "Defended the metrics by the audience", label: "Confused who reads a number with whether it means anything",
       why: "This choice assumed the board's entitlement settles which measures to use. It settles that there should be reporting, not that these are the right figures — and at six months the governing problem is uncertainty, which registered accounts and press mentions do not reduce.",
       cue: "Ask what decision changes if the number moves. If none does, the audience is not the justification."}},
     explanation: "Registrations, page views and press mentions accumulate and cannot fall, so they cannot tell progress from activity. Flat weekly active use is the figure that would answer whether the product works, and a number with no owner and no threshold cannot trigger anything."}
  ];

  var SPMS_MULTI = [
    {concept: "spms_dfv", source: "SPMS-M01-L05", node: "Desirability, feasibility, viability",
     stem: "Select every statement that is true of testing an idea for desirability, feasibility and viability.",
     options: [
       "Desirability is validated with design skills and empathy for the customer",
       "Feasibility asks whether the product can be built with the technology available today",
       "A product that is desirable and feasible but not viable is unsustainable",
       "Viability is settled once a working prototype exists",
       "Feasibility is confirmed by customer interviews showing people want the product"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Read viability as buildability", label: "Answered the feasibility question and stopped",
       why: "This choice assumed that proving the product can be made also proves it should be. A prototype demonstrates the technology exists, which is the feasibility check; viability asks the separate question of whether it can profit or fund the business.",
       cue: "When a check passes, name which of the three it was. If the evidence is technical, it cannot be viability."},
       4: {tag: "Checked desirability and called it feasibility", label: "Used the wrong evidence for the question",
         why: "This choice assumed wanting the product is evidence it can be built. Interviews establish desirability — that customers want it — which the lecture pairs with design skills and empathy. Feasibility is the engineering question of whether today's technology can deliver it.",
         cue: "Ask which skill produced the evidence. Design evidence answers desirability; engineering evidence answers feasibility."}},
     explanation: "Each area needs a different skill — design for desirability, engineering for feasibility, business for viability. A prototype proves you can build it, which is the feasibility question; viability asks whether it can profit or fund the business."},

    /* The case is the doctor's own answers, and deliberately not the three labels the
     * lecture puts on them — naming the functional, emotional, and social layers in the
     * case would hand over the option set. The cost line is there because the lecture
     * uses it to show where price actually enters, which is the fourth option's trap. */
    {concept: "spms_jtbd", source: "SPMS-M01-L10", node: "Jobs to be done",
     caselet: "A doctor has just finished her residency. She walks into a hardware shop and asks for a drilling bit and a drilling machine.\n\nAsk her what she is hanging, and it turns out to be photos — one photo, really: her MD certificate. Ask why it has to go up on the wall, and the answer moves again. Her patients see it. New ones especially, she says, want to know they are with a qualified doctor. Ten years of her life went into earning it, and she is proud of it.\n\nWhat she is buying is a drill bit, a frame, and a hole in the wall.",
     stem: "Select every need this purchase actually serves.",
     options: [
       "Functional — the certificate has to go onto the wall",
       "Emotional — pride in more than a decade of study",
       "Social — new patients gain confidence they are seeing a qualified doctor",
       "Financial — the drill costs less than hiring someone to do it",
       "Habitual — the purchase repeats often enough that no decision is taken"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Added a layer the lecture does not use", label: "Treated price as one of the layers of the job",
       why: "This choice assumed cost is one of the needs stacked inside the purchase. The lecture names functional, emotional, and social. Cost enters somewhere else entirely — through customer value, which is benefit minus cost.",
       cue: "List the three layers before answering. A candidate that is not one of them belongs to the value calculation instead."},
       4: {tag: "Invented a fourth layer", label: "Added a need the framework does not name",
         why: "This choice assumed repetition is one of the needs stacked inside a purchase. The lecture names three — functional, emotional, social. A certificate framed once is not a habitual purchase at all, which is what makes this a fourth layer imported from elsewhere.",
         cue: "Count the layers the lecture names. If your answer needs a fourth, it is not this framework."}},
     explanation: "This one purchase stacks a functional, an emotional, and a social need. Cost enters only through customer value, which is benefit minus cost — it is not one of the layers of the job."},

    /* The case gives the three populations and the two constraints that separate them,
     * and never names TAM, SAM or SOM — mapping the funnel onto them is the question.
     * The two wrong options are claims about the method, so they stay unanswerable from
     * the case alone and the item still needs the framework. */
    {concept: "spms_tamsam", source: "SPMS-M02-L04", node: "TAM, SAM, and SOM",
     caselet: "Zerodha is an online investment platform. In principle anyone, anywhere, who wants to buy exchange traded securities or mutual funds could use it.\n\nIn practice not everyone can. Cross-border investing carries its own regulatory framework, which leaves the platform serving online retail investors in India.\n\nAnd not all of those are available either. Twenty to forty lakh of them already have a broker — Kotak Securities, ICICI Direct, HDFC Securities. What is genuinely open is the cost-conscious investor who would rather save the brokerage and do their own research.",
     stem: "Select every statement that sizes this market correctly.",
     options: [
       "TAM is every retail investor who could use the product, worldwide",
       "Regulation on cross-border investing narrows SAM to online retail investors in India",
       "SOM narrows further because incumbent brokerages already serve those investors",
       "SOM is the figure to quote as the market when raising funds",
       "TAM is calculated last, by scaling the achievable share back up"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Turned a sizing step into a pitch number", label: "Read the funnel as a headline figure",
       why: "This choice assumed one of the three is the number you present. The lecture uses them as successive narrowing constraints — what could exist, what you may reach, what you can take against incumbents — not as a figure to quote.",
       cue: "Ask what each step removes. A step that removes nothing is being used as a claim rather than an analysis."},
       4: {tag: "Ran the funnel backwards", label: "Derived the whole market from the reachable share",
         why: "This choice assumed the sizing builds upward from what you can win. It narrows downward: TAM is everyone who could use the product, SAM is what regulation and reach permit, SOM is what remains against incumbents. Scaling up from SOM would make the prize a function of your own weakness.",
         cue: "Check the direction. Each step should remove people, never add them back."}},
     explanation: "TAM measures the prize, SAM what you are permitted and able to reach, SOM what you can take given who already holds it. They are narrowing constraints, not a headline figure."},

    {concept: "spms_chasm", source: "SPMS-M02-L10", node: "Crossing the chasm",
     stem: "Select every strategy that helps a product cross from its early market to the mainstream.",
     options: [
       "Focus on a narrow beachhead market rather than spray and pray",
       "Simplify onboarding and the interface for mainstream users",
       "Build trust through uptime, security, support, compliance, and social proof",
       "Raise the price at launch so mainstream buyers read it as quality",
       "Address the early market and the mainstream at the same time to build volume faster"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Substituted a signal for risk reduction", label: "Answered a risk problem with a pricing move",
       why: "This choice assumed mainstream buyers read a high price as quality. The lecture's premise is that mainstream customers avoid risk, so all four strategies lower perceived risk — beachhead focus, simplification, trust, ecosystem fit. Pricing is not among them.",
       cue: "Name which of the four a candidate belongs to. If it fits none of them, it is not part of the crossing."},
       4: {tag: "Answered the chasm by ignoring it", label: "Served both markets instead of crossing between them",
         why: "This choice assumed breadth speeds the crossing. It is the spray-and-pray the lecture names as the failure — the two markets buy for opposite reasons, and a product addressing both at once reduces risk for neither. Beachhead focus is deliberately narrow for that reason.",
         cue: "Ask who the message is for. If it is written for two audiences with opposite attitudes to risk, it convinces neither."}},
     explanation: "The four are beachhead focus, simplification, trust and reliability, and ecosystem fit. Mainstream customers avoid risk, so the work is lowering perceived risk rather than signalling through price."},

    {concept: "spms_lean_canvas", source: "SPMS-M03-L06", node: "Lean Canvas",
     stem: "Select every box that appears on the Lean Canvas but not on the Business Model Canvas.",
     options: ["Problem", "Solution", "Unfair advantage", "Customer segments", "Channels"],
     answers: [0, 1, 2],
     wrong: {3: {tag: "Counted a shared box as an addition", label: "Read a carried-over box as new",
       why: "This choice assumed customer segments is unique to the Lean Canvas. It carries across from the Business Model Canvas, along with channels, cost structure, and revenue structure. The additions are problem, solution, key metrics, and unfair advantage.",
       cue: "Build two lists before answering — what carries over, and what replaces it. The question only asks about the second."},
       4: {tag: "Counted a second shared box as an addition", label: "Read another carried-over box as new",
         why: "This choice assumed channels is one of the Lean Canvas additions. It carries across from the Business Model Canvas alongside customer segments, cost structure, and revenue structure. The additions are problem, solution, key metrics, and unfair advantage.",
         cue: "Name the four additions before you look at the options. Anything outside that list carries over."}},
     explanation: "Problem, solution, key metrics, and unfair advantage are the Lean Canvas additions. Customer segments, channels, cost structure, and revenue structure carry across from the Business Model Canvas."},

    {concept: "spms_unit_economics", source: "SPMS-M04-L07", node: "Unit economics",
     stem: "Select every business type correctly paired with the unit its economics should be measured on.",
     options: [
       "SaaS — one customer or account",
       "Ride-sharing — one ride",
       "E-commerce — one order",
       "Marketplace — one customer lifetime",
       "The unit is whichever one makes the economics look strongest to investors"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Applied the SaaS unit to a transactional model", label: "Chose a unit the relationship does not support",
       why: "This choice assumed the marketplace acquires a customer who then transacts repeatedly across a lifetime. The unit follows the customer relationship model, and a marketplace relationship is transactional — so the unit is one transaction.",
       cue: "Ask whether the business acquires a relationship or completes a transaction. That answer names the unit."},
       4: {tag: "Chose the unit for the audience", label: "Picked a unit to flatter the numbers",
         why: "This choice assumed the unit is a presentational decision. It follows the customer relationship model, and it is not optional — choosing a unit the relationship does not support produces economics that describe a business you are not running.",
         cue: "Ask what the business actually sells one of. That is the unit, whatever it does to the figures."}},
     explanation: "The unit follows the customer relationship model. SaaS acquires a customer who transacts repeatedly, so the account is the unit; a marketplace relationship is transactional, so the transaction is."},

    {concept: "spms_alternatives", source: "SPMS-M05-L02", node: "Competition and alternatives",
     stem: "Select everything that genuinely competes for this customer's decision.",
     options: [
       "Rival products in the same category",
       "Manual alternatives such as spreadsheets, consultants, or internal tools",
       "The customer deciding to carry on doing nothing",
       "Only the firms the startup has publicly named as competitors",
       "An alternative counts only once the customer has formally evaluated it"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Let the vendor define the comparison", label: "Set the competitive field from the inside",
       why: "This choice assumed competition is whatever the startup declares it to be. The lecture is explicit that customers decide the comparison — and in enterprise the most frequent alternative is inertia, the buyer carrying on exactly as they are.",
       cue: "Ask what the customer would do if you did not exist. Whatever that is, it is the competition, named or not."},
       4: {tag: "Required a formal process before counting a rival", label: "Waited for the customer to run a comparison",
         why: "This choice assumed competition begins at evaluation. Inertia is the most frequent enterprise alternative precisely because nobody evaluates it — the buyer carries on as they are without ever running a comparison, and that decision still costs you the deal.",
         cue: "Ask whether the alternative needs a decision to win. Doing nothing wins by default."}},
     explanation: "Customers set the comparison, and in enterprise the most common alternative is inertia — doing nothing at all. Defining competition early and narrowly is named as the biggest mistake."},

    {concept: "spms_privacy", source: "SPMS-M08-L05", node: "Privacy by design",
     stem: "Select every statement that is correct about these data-protection regimes.",
     options: [
       "GDPR protects any personal data irrespective of its sensitivity",
       "GDPR was enacted in May 2018 and became a model for Switzerland, Canada, and Australia",
       "US data protection leaves employee data outside its data protection regulations",
       "Data protection by design means the customer must request that their data be protected",
       "US data protection is a single federal regime covering every category of data alike"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Read a standing obligation as opt-in", label: "Made protection something the user has to ask for",
       why: "This choice assumed the duty begins when a customer requests it. By design means the obligation applies the moment you offer the service, which is why a customer never has to confirm that their data is protected.",
       cue: "Ask when the duty starts. If the answer is 'once they ask', it is not protection by design."},
       4: {tag: "Gave the US regime GDPR's shape", label: "Read a category-based regime as a blanket one",
         why: "This choice assumed both regimes work the same way. GDPR is the one that protects personal data irrespective of sensitivity; US protection is category-based, which is exactly why employee data falls outside it.",
         cue: "Ask what the regime keys on. GDPR keys on the data being personal; the US regime keys on which category it falls in."}},
     explanation: "GDPR covers all personal data regardless of sensitivity, while US protection is category-based and excludes employee data. Protection by design is never something a customer has to ask for."},

    /* ---- the twelve that complete Section B ----------------------------------
     *
     * Authored 2026-08-12 to close LAW-53. The eight above were all
     * three-correct-of-four with the wrong option at index 3, which made the section
     * free twice over: ticking every option scored full marks, and so did ticking
     * A, B and C without reading a word.
     *
     * These vary on both axes deliberately. Correct counts run one, two, and three of
     * four, so counting once tells a candidate nothing, and the correct positions move,
     * so no fixed pattern pays. The one-of-four items are the important shape — ticking
     * everything on one scores 1 − 3 = −2, floored to zero — because they are what put
     * a real cost back on a speculative tick.
     *
     * Every item sits on a lecture that already has a lesson, so LAW-47 holds with no
     * extra scheduling, and each follows its own lesson's vocabulary rather than a
     * paraphrase of it (LAW-49). */

    {concept: "spms_positioning", source: "SPMS-M03-L02", node: "Product definition and positioning",
     stem: "Select every statement that correctly separates what a product definition is from what positioning is.",
     options: [
       "Product definition is what the product does, and is largely internal — the team and its partners build against it",
       "Product positioning is how the product impacts users, and why they should use it",
       "Positioning is written first, and the product vision is derived from it afterwards",
       "Definition and positioning are two names for the same customer-facing statement"
     ], answers: [0, 1],
     wrong: {
       2: {tag: "Inverted the order of the three artefacts", label: "Derived the vision from the positioning",
         why: "This choice assumed positioning is the starting point. The lecture puts vision first precisely because definition and positioning are both translations of it — a positioning statement with no vision behind it has nothing to be strategic about.",
         cue: "Ask which statement the other two are translations of. That one is the vision, and it comes first."},
       3: {tag: "Collapsed two artefacts with different readers", label: "Merged the internal brief with the external claim",
         why: "This choice assumed one statement can serve both readers. They answer different questions: definition tells partners exactly what is being built, positioning tells a customer why they should care. Collapsing them produces a definition that reads like marketing, or a positioning nobody can build from.",
         cue: "Ask who the sentence is for. If the answer is 'both', two artefacts have been written as one."}},
     explanation: "Vision comes first, and the other two translate it. Definition is what the product does, written for the team and its partners; positioning is how it impacts users and why they should use it."},

    {concept: "spms_value_pricing", source: "SPMS-M04-L02", node: "Value-based pricing",
     stem: "Select every statement that is true of cost-based pricing.",
     options: [
       "It prices your own inputs rather than the customer's outcome",
       "It is the method to prefer once the product has a measurable economic value peg",
       "Billing by engineer hours at $50 or $200 an hour is the familiar software-services case",
       "It is the fallback for when you do not know how the product will be deployed, or what it does to the customer's business",
       "It is what the lecture recommends for software products in particular"
     ], answers: [0, 2, 3],
     wrong: {
       4: {tag: "Reversed the lecture's recommendation", label: "Recommended the fallback for the case it argues against",
         why: "This choice assumed software is the case where costing your inputs works best. It is the opposite: the lecture raises software services as the familiar example of hourly billing and then argues that the real value of products lies in understanding and delivering value, which is why value-based pricing matters for software in particular.",
         cue: "Ask what the lecture is arguing for. The example it opens with is usually the thing it is about to replace."},
       1: {tag: "Promoted the fallback over the method", label: "Kept costing after the value became measurable",
       why: "This choice assumed cost-based pricing stays appropriate once you can measure impact. The lecture calls it defensible in ignorance — it is what you use when the deployment and the customer impact are unknown. An economic value peg is exactly what removes that ignorance, so it is the point at which you stop.",
       cue: "Ask what you now know that you did not before. A peg means you can price the outcome, so pricing the inputs is a choice to leave money on the table."}},
     explanation: "Cost-based pricing prices your inputs — hourly billing worked back from salary — and is defensible only in ignorance of deployment and impact. A measurable peg is what lets you price the outcome instead."},

    {concept: "spms_buyer_journey", source: "SPMS-M05-L04", node: "Buyer journey communication",
     stem: "Select every failure that follows from communicating value badly.",
     options: [
       "Communicating too late, after the decision has already been taken",
       "Pricing the product below the nearest competitor",
       "Using the wrong channels to carry the message",
       "Publishing the product vision before the product definition"
     ], answers: [0, 2],
     wrong: {
       1: {tag: "Substituted a pricing decision for a communication one", label: "Answered a different discipline's question",
         why: "This choice assumed the failure is in the price. The lecture is explicit that startups fail not for lack of value but because the value was never articulated well enough to be understood — undercutting a competitor does not make an unarticulated value proposition legible.",
         cue: "Ask whether the customer understood the offer. If they never understood it, price was not what failed."},
       3: {tag: "Borrowed an ordering rule from the positioning lecture", label: "Applied a rule from a different session",
         why: "This choice assumed the failure is one of sequence between artefacts. Vision does precede definition, but that belongs to the positioning session; the failures named here are about timing relative to the customer's decision, the channel, and the fit of the message.",
         cue: "Check whose timeline the failure sits on. These three are on the customer's, not the team's."}},
     explanation: "The named failures are communicating too late, using the wrong channels, and sending a message that does not match the customer's need. Good products fizzle when the value is never articulated, not when it is mispriced."},

    {concept: "spms_requirements", source: "SPMS-M06-L05", node: "Functional and quality requirements",
     stem: "A customer says the product must send a message, and must deliver it within 200 milliseconds. Select every statement that classifies this correctly.",
     options: [
       "Sending the message is a functional requirement — an action the product performs",
       "The 200-millisecond bound is functional, because it describes what the product does",
       "Both halves are non-functional, because the customer stated them in one sentence",
       "The 200-millisecond bound is non-functional — a quality, confirmed by measurement under load"
     ], answers: [0, 3],
     wrong: {
       1: {tag: "Read a quality as an action", label: "Classified a bound as behaviour",
         why: "This choice assumed anything the product must do is functional. Robertson and Robertson split on action versus quality: the action is sending, and the 200 milliseconds is a quality constraining how well that action is performed. They are verified differently — one by whether a message sends, the other by measurement under load.",
         cue: "Ask what confirms it. If you need a stopwatch or a load test rather than a yes or no, it is a quality."},
       2: {tag: "Let the sentence decide the classification", label: "Classified by how it was said, not by what it is",
         why: "This choice assumed one sentence carries one kind of requirement. Customers routinely state both together — that is the normal case, and it is why the split matters. Arriving in one breath does not make them one object.",
         cue: "Split the sentence at the verbs before classifying. Each clause gets its own answer."}},
     explanation: "The split is action versus quality. Sending is the action and so functional; the 200-millisecond bound is a quality and so non-functional, constraining architecture rather than behaviour."},

    {concept: "spms_traceability", source: "SPMS-M06-L08", node: "Requirements traceability",
     stem: "Select every statement that correctly traces a customer need into a project requirement.",
     options: [
       "Customer requirements arrive already standardised, because customers state system requirements",
       "Standardising generalises one customer's stated need so more customers of that nature are served by one product",
       "Project requirements break a product requirement down for a release across smaller teams",
       "Customer requirements describe business needs and aspirations rather than system specifications",
       "Project requirements are written by the customer and passed to engineering unchanged"
     ], answers: [1, 2, 3],
     wrong: {
       4: {tag: "Handed an internal artefact back to the customer", label: "Skipped both translations at once",
         why: "This choice assumed the customer's words travel intact to the development team. Project requirements are the last of three forms, not the first — they sit closest to the development team and are produced by breaking a standardised product requirement down for a release.",
         cue: "Count the translations between a business aspiration and a development task. There are two, and skipping them is what loses the traceability."},
       0: {tag: "Expected the customer to do the translation", label: "Treated non-standard input as a customer failure",
       why: "This choice assumed requirements arrive ready to build. The lecture is explicit that they do not, and that this is not a failure on the customer's part — they are describing business needs, not writing specifications. Converting them is the product manager's central competence here.",
       cue: "Ask whose job the translation is. If the answer is the customer's, the product manager has been written out of the step that defines the role."}},
     explanation: "Customer requirements arrive as business needs and aspirations. Standardising generalises one customer's need so the product serves many; project requirements are the internal breakdown engineering owns for a release."},

    {concept: "spms_priority", source: "SPMS-M07-L01", node: "MoSCoW and RICE prioritisation",
     stem: "Select every statement that is true of how MoSCoW is used.",
     options: [
       "Won't have is part of the method, and stating it is what makes scope control real",
       "It ranks every item against every other to produce one ordered list",
       "It works as a filtering criterion, closer to a triage than to a ranking",
       "Moscow refers to the capital city, where the technique was first formalised"
     ], answers: [0, 2],
     wrong: {
       1: {tag: "Read a filter as a ranking", label: "Expected an ordered list from a triage",
         why: "This choice assumed prioritisation always means sequencing. MoSCoW sorts into four buckets to build common understanding of what is definitely in and definitely out; it does not order items within a bucket, which is why the lecture pairs it with other techniques.",
         cue: "Ask whether the output is a list or a set of buckets. Buckets filter; only a list ranks."},
       3: {tag: "Took an acronym for a place name", label: "Read the name as an origin story",
         why: "This choice assumed the technique is named after where it came from. The lecture says plainly that it is an acronym rather than a capital city: must have, should have, could have, won't have.",
         cue: "Expand the letters before assuming a name is geographic."}},
     explanation: "MoSCoW is an acronym — must, should, could, won't — used as a filter rather than a ranking. Naming what won't be done is the half that makes scope control real."},

    /* This one had the least to stand on: the lecture's ride-hailing bucket assignment
     * is not in the lesson either, so before the case existed the item could only be
     * answered by remembering the transcript. The case lists the candidates and the
     * release window and assigns nothing — the sorting is the question. */
    {concept: "spms_priority", variant: "buckets", source: "SPMS-M07-L01", node: "MoSCoW and RICE prioritisation",
     caselet: "A ride-hailing product has three months before its first release, and everyone wants something in it — customers, investors, the sales team.\n\nThe team writes down what it could build. Booking a ride. Taking payment. GPS tracking. Driver ratings, so a rider can choose between two drivers. Multi-stop planning, so they can drop someone off on the way. In-car entertainment that follows whoever is driving.\n\nSix candidates, one release, and MoSCoW to sort them: must have, should have, could have, won't have.",
     stem: "Select every capability that belongs in must have for this release.",
     options: [
       "Booking a ride",
       "Payments",
       "Driver ratings that help a customer choose between drivers",
       "GPS",
       "Multi-stop route planning"
     ], answers: [0, 1, 3],
     wrong: {
       4: {tag: "Promoted a could-have to a must", label: "Treated a refinement as foundational",
         why: "This choice assumed a capability that improves a journey belongs in must have. The lecture uses multi-stop planning as its could-have: a real improvement the product can ship without. Must have is only what the product cannot function without at all.",
         cue: "Ask whether the first version could launch without it. If yes, it is could have at best."},
       2: {tag: "Promoted a helpful feature to load-bearing", label: "Read valuable as essential",
       why: "This choice assumed anything that improves the experience is a must. The lecture puts ratings in should have: valuable, and genuinely useful for choosing between drivers, but the product still functions without them. Must have is reserved for capabilities without which there is no product at all.",
       cue: "Remove the feature and ask whether the product still works. If it does, it is not a must."}},
     explanation: "Must have covers what the product cannot function without — booking, payments, GPS. Ratings are should have: valuable, and not load-bearing."},

    {concept: "spms_roadmap", source: "SPMS-M07-L04", node: "Product roadmap",
     stem: "Select every statement that is true of a product roadmap.",
     options: [
       "It fixes the next three to six months and deliberately goes no further",
       "It translates product strategy into a series of releases on a time axis",
       "What has been deliberately deferred is as much a part of it as what has been scheduled",
       "It lists the features to build without ordering them, leaving sequence to the team"
     ], answers: [1, 2],
     wrong: {
       0: {tag: "Cut the strategic horizon to a release window", label: "Confused the roadmap with the release bucket",
         why: "This choice assumed a roadmap covers the same window as a release. The strategic timeframe runs to three or five years depending on the space — the three-to-six-month bucket is what prioritisation fills, and the roadmap is what says in which order.",
         cue: "Ask which question is being answered. 'What fits in this release' is the bucket; 'where should the product be in five years' is the roadmap."},
       3: {tag: "Removed the ordering that makes it a roadmap", label: "Reduced a sequence to a backlog",
         why: "This choice assumed a roadmap is a set of intentions. The time axis is exactly what distinguishes it — the lecture calls it a smart sequence for developing, releasing, and evolving a solution, and an unordered list is a backlog.",
         cue: "Look for the axis. Without one, nothing has been sequenced."}},
     explanation: "A roadmap translates strategy into releases along a time axis, over a three-to-five-year horizon. WhatsApp's iPhone-first launch, with Android around 2011, is the lecture's worked sequence."},

    /* The case has to carry the "they knew" fact, because that fact is the whole hinge:
     * the two wrong readings here are an oversight and a resourcing accident, and a
     * learner who cannot see what the team knew is guessing between three stories rather
     * than reading one. The framework option is not in the case, so it still costs
     * something to get right. */
    {concept: "spms_roadmap", variant: "sequence", source: "SPMS-M07-L04", node: "Product roadmap",
     caselet: "WhatsApp started in 2009, into a market that already had Skype, Yahoo Messenger, ICQ and plenty more.\n\nIt launched on iPhone. Android followed around the middle of 2011 — and the team already knew that a large share of the people it wanted were on Android, in Asia.\n\nThe rest arrived on its own schedule: message history search around 2011, chat backup after 2012. The company was acquired in 2014 still without end-to-end encryption.",
     stem: "Select every statement that reads this release history the way the course does.",
     options: [
       "Launching on iPhone first shows the team did not know where its users were",
       "The Android delay was a resourcing accident rather than a decision",
       "A roadmap is a set of releases with no strategic horizon behind it",
       "A roadmap is a smart sequence for developing, releasing, and evolving a solution",
       "The team launched on iPhone knowing a big chunk of its potential users were on Android in Asia"
     ], answers: [3, 4],
     wrong: {
       0: {tag: "Read a deliberate order as an oversight", label: "Mistook sequencing for ignorance",
         why: "This choice assumed launching where the users were not is a mistake. The lecture is explicit that the team knew a big chunk of its potential users were on Android in Asia and launched on iPhone anyway — which is what makes it a sequence rather than an accident.",
         cue: "Ask whether the team knew. A choice made with the information available is a decision, not an error."},
       1: {tag: "Explained a decision away as capacity", label: "Attributed ordering to resourcing",
         why: "This choice assumed the gap between platforms was whatever the team could manage. The point of the example is deliberate ordering — running the earlier step first and letting what it showed inform the next release.",
         cue: "Ask what the first release was for. If it produced information the second one used, the order was the plan."},
       2: {tag: "Kept the releases and dropped the strategy", label: "Left a roadmap with nothing to sequence toward",
         why: "This choice assumed a roadmap is just the release list. It is the translation of a product strategy — where the product should be in three or five years — and without that horizon nothing decides the order.",
         cue: "Ask what the sequence is aiming at. No destination means no roadmap."}},
     explanation: "The evolution is deliberate ordering, not accident: the team launched on iPhone knowing many users were on Android. A roadmap is a smart sequence for developing, releasing, and evolving a solution."},

    {concept: "spms_requirements", variant: "definition", source: "SPMS-M06-L05", node: "Functional and quality requirements",
     stem: "Select every statement that correctly defines a requirement.",
     options: [
       "It is only a capability a customer has explicitly asked for",
       "It is any feature already present in the product",
       "It is a wish or need for a future product capability, or a condition required by standards, contracts, or regulations",
       "Requirements are classified by which team will end up building them",
       "It describes a future capability, which is why requirements are elicited before anything is built"
     ], answers: [2, 4],
     wrong: {
       0: {tag: "Dropped the second origin", label: "Kept only the requirements someone requested",
         why: "This choice assumed every requirement traces to a customer request. The IEEE definition the lecture cites adds a second origin: a condition required by standards, contracts, or regulations. For a messaging product that is compliance nobody asked for and everybody is bound by.",
         cue: "Ask whether anything would still be required if no customer mentioned it. Regulation is the usual answer."},
       1: {tag: "Pointed the definition at the present", label: "Described the product instead of the need",
         why: "This choice assumed a requirement describes what exists. It is about a future capability — what the product should be doing once it exists — which is why requirements are elicited before they are built.",
         cue: "Check the tense. A requirement is about what should be, not what is."},
       3: {tag: "Classified by owner rather than by kind", label: "Used the team as the taxonomy",
         why: "This choice assumed the split follows the org chart. Robertson and Robertson split on what the requirement is — an action the product performs, or a quality it possesses — because the two are elicited, specified, and tested by different means.",
         cue: "Ask what distinguishes the two classes. If the answer names a team rather than a property, it is the wrong axis."}},
     explanation: "A requirement is a wish or need for a future capability, or a condition set by standards, contracts, or regulations. It is classified as an action or a quality, not by who builds it."},

    {concept: "spms_metrics", source: "SPMS-M08-L03", node: "Actionable product metrics",
     stem: "Select every statement that explains why metrics carry more weight in a startup than in a mature company.",
     options: [
       "They exist to reduce uncertainty as far as it can be reduced",
       "Top line, bottom line, and net promoter score assume a steadier state than an early product has",
       "A startup should report performance first and take up risk management once the business matures",
       "The fundamental difference from a mature company is the level of uncertainty",
       "They exist to report performance to investors on a fixed reporting cycle"
     ], answers: [0, 1, 3],
     wrong: {
       4: {tag: "Made metrics a reporting duty", label: "Pointed the measures at an audience instead of a decision",
         why: "This choice assumed metrics exist to be reported. The lecture is specific that they exist to reduce uncertainty, improve decision-making on a dynamic basis with whatever information is available, and identify risks early. A fixed cycle is the opposite of dynamic.",
         cue: "Ask what changes because of the number. If the answer is only that someone has been informed, it is reporting rather than measurement."},
       2: {tag: "Deferred the thing survival depends on", label: "Ordered risk management after performance",
       why: "This choice assumed risk management is a maturity activity. The lecture argues the opposite — risk matters more in a startup precisely because it does not yet know whether customers want the product, whether the model scales, or whether acquisition costs are sustainable. Those being open is why it bears on survival.",
       cue: "Ask what is still unknown. The more that is open, the earlier risk management belongs."}},
     explanation: "Metrics exist to reduce uncertainty and improve decisions with the information available. Standard performance measures assume a steadier state than an early-stage product has, which is why the startup case differs."},

    {concept: "spms_metrics", variant: "types", source: "SPMS-M08-L03", node: "Actionable product metrics",
     stem: "Select every metric correctly paired with what it measures.",
     options: [
       "Average revenue per user — revenue divided across the user base",
       "Gross margin — profitability measured after all below-the-line costs",
       "Customer lifetime value — what a customer is worth across the whole relationship, not one transaction",
       "Net promoter score — the startup-appropriate replacement for reducing uncertainty"
     ], answers: [0, 2],
     wrong: {
       1: {tag: "Moved the line the margin sits above", label: "Measured efficiency after the wrong costs",
         why: "This choice assumed gross margin nets off everything. It measures profitability efficiency before below-the-line costs — moving that line changes which decisions the number can inform.",
         cue: "Name the line the measure sits above. Gross sits above below-the-line costs, by definition."},
       3: {tag: "Made a mature-state measure the startup answer", label: "Offered NPS as the uncertainty tool",
         why: "This choice assumed net promoter score is the startup metric. The lecture lists it among the standard measures that assume a steadier state — it is one of the things an early product cannot yet lean on, not the replacement for reducing uncertainty.",
         cue: "Ask whether the measure needs a stable base to mean anything. If it does, it is not the early-stage answer."}},
     explanation: "ARPU spreads revenue across the user base and customer lifetime value covers the whole relationship. Gross margin sits before below-the-line costs, and NPS is one of the steadier-state measures a startup cannot yet lean on."}
  ];

  /* Why each item connects onward — the `link` line every question carries. */
  var SPMS_MULTI_LINKS = {
    spms_positioning: "Definition and positioning are what every later artefact quotes; a team that never separated them argues about scope and messaging as if they were one decision.",
    spms_value_pricing: "Pricing is where customer value becomes business value, so an unmeasured value proposition shows up here as a price nobody can defend.",
    spms_buyer_journey: "A value proposition nobody understands is worth what an absent one is worth, which is why communication sits between building value and capturing it.",
    spms_requirements: "The action-versus-quality split decides how a requirement is elicited, specified, and tested, so misclassifying one at the start misroutes it all the way to delivery.",
    spms_traceability: "Tracing a business aspiration to a project task is what keeps a release connected to why anyone asked for it.",
    spms_priority: "Prioritisation is what turns more demand than capacity into a release, and naming what is out is the half that holds scope.",
    spms_roadmap: "The roadmap is where strategy becomes an order of releases, so a sequence with no horizon behind it is a backlog with dates.",
    spms_metrics: "Metrics reduce the uncertainty a startup runs on, which is why the measure that suits a mature company can mislead an early product.",
    spms_dfv: "Every later decision assumes all three checks passed separately; skipping viability is what makes a product unsustainable rather than unbuildable.",
    spms_jtbd: "Reading the job underneath a request is what makes a value proposition specific rather than a feature list.",
    spms_tamsam: "Sizing decides who the first customers are, which is what the beachhead strategy then acts on.",
    spms_chasm: "Crossing depends on having something worth crossing with, which is what problem-solution and product-market fit establish.",
    spms_lean_canvas: "Choosing the canvas is choosing the question — whether the business runs well, or whether it should exist at all.",
    spms_unit_economics: "Per-unit profitability is the viability pillar made countable, and it feeds forecasting and funding decisions.",
    spms_alternatives: "What you are compared against sets the message, which is what value communication has to carry.",
    spms_privacy: "Privacy is a constraint on the product itself, not a clause added at launch."
  };

  /* The first SPMS multi-select bank predated the final P-type clarification and
   * twenty items carried three true statements. Silently truncating their keys would
   * make a true sentence score as wrong. Each repair therefore rewrites the removed
   * statement into a specific misconception and supplies the diagnosis that teaches
   * why it fails. The authored source remains readable above; this table is the
   * explicit migration into the now-authoritative exactly-two shape. */
  var SPMS_PTYPE_REPAIRS = {
    spms_dfv_msq: {answers:[1,2], optionIndex:3,
      option:"A product that is desirable and feasible is viable even when it cannot sustain the business",
      diagnosis:{tag:"Averaged the three checks", label:"Turned two passes into an overall pass", why:"Desirability and feasibility do not compensate for failed economics. Viability is a separate condition, and the product remains unsustainable until it clears it.", cue:"Test all three independently; two passes never erase the failed check."}},
    spms_jtbd_msq: {answers:[2,4], optionIndex:3,
      option:"The pride attached to the qualification is outside the job because emotional needs are not functional",
      diagnosis:{tag:"Dropped the emotional job", label:"Treated functional as the only real need", why:"Jobs can be functional, emotional and social at the same time. Pride in the qualification is precisely the emotional layer of this purchase.", cue:"Ask what the customer wants to feel as well as what they need to do."}},
    spms_tamsam_msq: {answers:[0,2], optionIndex:3,
      option:"SOM ignores incumbent brokerages because an obtainable market is based only on the firm's ambition",
      diagnosis:{tag:"Removed the competitive bound", label:"Sized ambition instead of obtainable share", why:"SOM is narrowed by what the firm can realistically win, including customers already held by incumbents. Ambition does not remove that constraint.", cue:"For SOM, keep every current limit on reach and capture in the number."}},
    spms_chasm_msq: {answers:[1,3], optionIndex:4,
      option:"Keep the expert interface complex so mainstream users can see the product is powerful",
      diagnosis:{tag:"Made complexity a quality signal", label:"Raised the adoption risk for mainstream users", why:"Mainstream adoption depends on lowering perceived risk and effort. Preserving expert complexity makes onboarding harder and widens the chasm.", cue:"Ask whether the change makes a cautious user safer and faster on first use."}},
    spms_lean_canvas_msq: {answers:[2,3], optionIndex:4,
      option:"Solution is unique to the Business Model Canvas and is removed from the Lean Canvas",
      diagnosis:{tag:"Reversed the canvas difference", label:"Removed a Lean Canvas box", why:"Solution is one of the startup-specific Lean Canvas boxes, alongside problem, key metrics and unfair advantage.", cue:"Lean Canvas makes the proposed problem-solution pair explicit so it can be tested."}},
    spms_unit_economics_msq: {answers:[2,3], optionIndex:4,
      option:"Ride-sharing — one driver lifetime, because the platform acquires drivers rather than rides",
      diagnosis:{tag:"Changed the economic unit", label:"Measured a transaction business as a lifetime", why:"Ride-sharing economics resolve per ride. A driver lifetime mixes many transactions and hides whether an individual ride contributes or loses money.", cue:"Choose the smallest repeatable transaction whose revenue and variable cost belong together."}},
    spms_alternatives_msq: {answers:[0,4], optionIndex:1,
      option:"Rival products count only after the customer has formally shortlisted them",
      diagnosis:{tag:"Waited for a formal shortlist", label:"Made competition depend on procurement paperwork", why:"A rival competes whenever it is a credible way the customer may do the job. It need not appear on a formal shortlist before it shapes the decision.", cue:"Competition is set by the customer's alternatives, not by the stage of the buying process."}},
    spms_privacy_msq: {answers:[1,4], optionIndex:0,
      option:"GDPR protects only European Union citizens, so any other resident's personal data falls outside it",
      diagnosis:{tag:"Made protection depend on citizenship", label:"Used nationality as the scope test", why:"GDPR scope is not a citizenship test. It protects personal data in the regulated processing context, irrespective of whether the person holds European Union citizenship.", cue:"Check where and how the data is processed; do not substitute nationality for scope."}},
    spms_value_pricing_msq: {answers:[0,1], optionIndex:3,
      option:"Billing by engineer hours is value-based pricing because a higher hourly rate signals greater customer value",
      diagnosis:{tag:"Renamed an input price", label:"Mistook a costly input for a customer outcome", why:"Hourly billing prices the supplier's time and cost base. A higher rate does not turn it into value-based pricing unless the price is pegged to the customer's outcome.", cue:"Ask whether the unit being priced belongs to the supplier or the customer result."}},
    spms_traceability_msq: {answers:[2,4], optionIndex:3,
      option:"Project requirements stay at product level and should not be broken down for a particular release",
      diagnosis:{tag:"Stopped the trace too early", label:"Kept a product requirement away from delivery", why:"Project requirements are precisely the release-level breakdown that smaller delivery teams can build and verify. Refusing the breakdown breaks the trace to execution.", cue:"Follow the chain from business need to product response to release-level work."}},
    spms_priority_msq_buckets: {answers:[0,3], optionIndex:2,
      option:"Payments belong in should have because booking alone is enough for a ride-hailing product to launch",
      diagnosis:{tag:"Removed the commercial transaction", label:"Called a load-bearing capability optional", why:"A ride-hailing product that cannot take payment cannot complete its core exchange. Payments is a must-have, so describing it as optional is the mistake.", cue:"Remove the capability and ask whether the core transaction can still finish."}},
    spms_metrics_msq: {answers:[1,4], optionIndex:2,
      option:"The main difference from a mature company is reporting cadence rather than uncertainty",
      diagnosis:{tag:"Changed the governing difference", label:"Made timing more important than uncertainty", why:"The startup's defining condition is unresolved uncertainty about demand, scale and economics. Reporting cadence does not explain why its measures must work differently.", cue:"Ask what remains unknown, not how often the dashboard is sent."}},
    spms_dfv_msq_exam: {answers:[0,2], optionIndex:1,
      option:"Feasibility holds because drivers want the tool, so no separate technical evidence is needed",
      diagnosis:{tag:"Read demand as buildability", label:"Used desirability evidence for feasibility", why:"Drivers wanting the tool proves desirability. Feasibility needs evidence that the team can build and operate it with available technology.", cue:"Keep customer evidence and engineering evidence in their own checks."}},
    spms_tamsam_msq_exam: {answers:[0,2], optionIndex:1,
      option:"Regulatory certification narrows SOM but leaves the serviceable market at the worldwide 900,000",
      diagnosis:{tag:"Put regulation at the wrong layer", label:"Left an unserviceable market inside SAM", why:"Certification decides which customers the product can legally serve, so it narrows TAM to SAM before sales capacity and competition narrow SOM.", cue:"Apply legal and capability constraints before the obtainable-share constraints."}},
    spms_lean_canvas_msq_exam: {answers:[0,3], optionIndex:1,
      option:"It keeps the Business Model Canvas boxes unchanged because startups and established firms answer the same questions",
      diagnosis:{tag:"Erased the startup adaptation", label:"Treated both canvases as interchangeable", why:"Lean Canvas replaces several established-business boxes with startup questions such as problem, solution, key metrics and unfair advantage.", cue:"Choose the canvas by the uncertainty it is meant to expose."}},
    spms_unit_economics_msq_exam: {answers:[1,2], optionIndex:0,
      option:"Acquisition cost is recovered in the second year of the relationship",
      diagnosis:{tag:"Shortened the payback", label:"Recovered ₹5,400 with only ₹3,600", why:"At ₹1,800 gross profit per year, two years recover ₹3,600. The ₹5,400 acquisition cost is recovered only after three years.", cue:"Divide acquisition cost by annual gross profit before naming the payback year."}},
    spms_alternatives_msq_exam: {answers:[0,2], optionIndex:1,
      option:"Manual compilation should be excluded because a non-software process cannot compete with software",
      diagnosis:{tag:"Excluded the current workaround", label:"Defined competition by product category", why:"The assistant's manual process is what the customer currently uses to do the same job. It competes even though it is not software.", cue:"Ask what the customer would do instead, not what category the alternative belongs to."}},
    spms_traceability_msq_exam: {answers:[0,2], optionIndex:1,
      option:"The structured handover record is already a project requirement because it names a feature",
      diagnosis:{tag:"Collapsed product into project", label:"Skipped the release-level breakdown", why:"The structured record is the product's general response to the need. Template editor and audit trail are the release-specific project requirements.", cue:"A product requirement says what the product will do; a project requirement says what a release team will build."}},
    spms_roadmap_msq_exam: {answers:[0,3], optionIndex:1,
      option:"What has been left out is irrelevant once the scheduled releases are clear",
      diagnosis:{tag:"Dropped the deferral decision", label:"Read only the visible release list", why:"A roadmap allocates scarce time. What is deliberately deferred is part of the strategy because it protects the sequence from becoming an inventory of wishes.", cue:"A real roadmap says both now and not now."}},
    spms_metrics_msq_exam: {answers:[0,1], optionIndex:2,
      option:"Weekly active use is irrelevant because only cumulative measures can show whether a young product is growing",
      diagnosis:{tag:"Preferred accumulation to use", label:"Rejected the measure that can reveal decline", why:"Weekly active use can rise or fall and therefore distinguishes real use from accumulating registrations. Cumulative totals can look healthy even when the product has stalled.", cue:"Prefer a measure that can worsen when the product worsens."}}
  };

  function addAuthoredMultiSelect(course) {
    if (course.id !== "SPMS") return;
    SPMS_MULTI.concat(SPMS_MULTI_EXAM_ONLY).forEach(function (item, index) {
      var concept = (course.concepts || []).filter(function (entry) { return entry.id === item.concept; })[0];
      if (!concept) return;
      var questionId = item.concept + "_msq" + (item.variant ? "_" + item.variant : "");
      var repair = SPMS_PTYPE_REPAIRS[questionId] || null;
      var options = item.options.slice();
      var answers = item.answers.slice();
      var wrong = Object.assign({}, item.wrong || {});
      if (repair) {
        options[repair.optionIndex] = repair.option;
        answers = repair.answers.slice();
        wrong[repair.optionIndex] = repair.diagnosis;
      }
      addQuestion(course, {
        /* A concept may carry more than one multiple-select item — Section B needs
           twenty and only sixteen SPMS lectures have a lesson to sit one on — so the
           id takes an optional variant. Without it the second item on a concept
           silently overwrote the first. */
        id: questionId,
        courseId: course.id,
        conceptId: item.concept,
        supportingConceptIds: [],
        module: concept.module,
        source: item.source,
        sourceIds: [item.source],
        node: item.node,
        pattern: "Select every correct answer",
        perspective: "retrieve",
        type: "msq",
        skills: ["recognise", "distinguish"],
        difficulty: 3,
        variantFamily: item.concept + "_msq",
        boss: false,
        /* Reserved to the examiner. Additive only — see t6_integrated.js. */
        examOnly: !!item.examOnly,
        /* Four of these items are read off a case the lecture tells rather than a
         * framework it states, and they used to name that case without showing it
         * ("In the drilling-machine example…"). A caselet is the field the question
         * surface already renders above the stem, and the examiner renders too — which
         * matters more here than anywhere else, because Section B is sat with no lesson
         * in front of it. Items that state a rule rather than read a case leave it
         * null and render exactly as before. */
        caselet: item.caselet || null,
        stem: item.stem,
        options: options,
        answers: answers,
        diagnoses: options.map(function (_, optionIndex) {
          return wrong[optionIndex] || null;
        }),
        explanation: item.explanation,
        link: SPMS_MULTI_LINKS[item.concept] || concept.bridge || concept.summary
      });
    });
  }

  /* Authored numericals for SCLM Section B.
   *
   * Six questions, 4 marks each, 24 of that paper's 80 — and the paper is explicit
   * that marks go to the final figure within a tolerance, with none for working.
   * No generated surface can stand in: a numerical needs a scenario whose numbers
   * resolve cleanly and a tolerance chosen for the quantity's kind.
   *
   * Scenario figures are fresh rather than lifted from the lectures, because the
   * skill tested is applying the method, and the paper states every question is
   * self-contained. The *methods* are the course's own, taken from the lessons
   * already authored against these lectures: Ft = Ft−1 + α(At−1 − Ft−1); EOQ from
   * D, K, and h distinguished by their units; the critical ratio from underage
   * over the total mismatch cost.
   *
   * `nearMisses` name the figure a specific wrong method produces, so a learner
   * who is 40 out because they dropped the 2 under the root is told that, rather
   * than just "wrong". */
  var SCLM_NUMERIC = [
    {concept: "sclm_smoothing", source: "SCLM-M02-L06", node: "Exponential smoothing",
     stem: "A regional warehouse forecast 1,200 units for last month. Actual demand came in at 1,320 units. The smoothing constant in use is 0.2.",
     prompt: "What is the forecast for this month?", unit: "units", answer: 1224, tolerance: 1,
     nearMisses: [
       {value: 1176, tolerance: 1, tag: "Subtracted the correction", label: "Moved the forecast away from the error",
        why: "This choice assumed the correction is subtracted. Actual demand exceeded the forecast, so the error is positive and the next forecast has to rise towards it. Ft = 1200 + 0.2 × (1320 − 1200) = 1224.",
        cue: "Sanity-check the direction before the arithmetic: if actual came in above forecast, the new forecast must be higher than the old one."},
       {value: 1320, tolerance: 1, tag: "Used the actual as the forecast", label: "Let last month's outcome become the prediction",
        why: "This choice assumed the next forecast is simply what just happened. That is exponential smoothing with alpha set to 1, which carries the whole error — including all the noise — into the next period.",
        cue: "If your answer equals the actual, you have used alpha = 1 whatever the question stated."}
     ],
     explanation: "Exponential smoothing adds a proportion of the last forecast error to the last forecast: Ft = Ft−1 + α(At−1 − Ft−1). Here that is 1200 + 0.2 × (1320 − 1200) = 1200 + 24 = 1224 units.",
     link: "Alpha is a choice about responsiveness, not a fitting parameter — which is why the same data can justify different forecasts."},

    {concept: "sclm_eoq", source: "SCLM-M03-L03", node: "Economic order quantity",
     stem: "A distributor expects steady annual demand of 12,000 units. Each order placed costs ₹600 regardless of its size. Holding one unit for a year costs ₹40.",
     prompt: "What order quantity minimises the total of ordering and holding cost?", unit: "units", answer: 600, tolerance: 1,
     nearMisses: [
       {value: 424, tolerance: 3, tag: "Dropped the 2 under the root", label: "Left the factor of 2 out of the formula",
        why: "This choice assumed the quantity is the root of D·K/h. The 2 comes from average cycle stock being Q/2 rather than Q — you hold half an order on average across the cycle, not all of it.",
        cue: "The 2 is not decoration. If it is missing, the answer is low by a factor of about 1.41."},
       {value: 40, tolerance: 2, tag: "Swapped the ordering and holding costs", label: "Put the costs in the wrong places",
        why: "This choice assumed K and h are interchangeable. They are told apart by their units: K is currency per order, charged once however large the order; h is currency per unit per year, charged on stock you are holding.",
        cue: "Read the units before substituting. Per order and per unit per year cannot swap places."}
     ],
     explanation: "EOQ = √(2DK/h) = √(2 × 12,000 × 600 ÷ 40) = √360,000 = 600 units. The purchase cost drops out because it does not depend on the order size.",
     link: "The order size fixes how often you reorder, which is what the next decision — when to place the order — is built on."},

    {concept: "sclm_eoq", source: "SCLM-M03-L03", node: "Economic order quantity",
     /* Was "The same distributor…", pointing back at a distributor that exists only in
        a different question — and on a paper the draw can order any way it likes, so
        "the same" was frequently the first mention a candidate ever saw. LAW-61. */
     stem: "A distributor settles on an order quantity of 600 units against annual demand of 12,000 units, an ordering cost of ₹600 per order, and a holding cost of ₹40 per unit per year.",
     prompt: "What is the total annual ordering plus holding cost at that order quantity?", unit: "₹", answer: 24000, tolerance: 50,
     nearMisses: [
       {value: 36000, tolerance: 50, tag: "Charged holding on the whole order", label: "Held the full order quantity all year",
        why: "This choice assumed holding cost applies to Q rather than Q/2. Stock is drawn down between deliveries, so the average holding across a cycle is half the order quantity — which is also where the 2 in the EOQ formula comes from.",
        cue: "Holding cost is always charged on average stock. If you used Q, your answer is high by (Q/2)·h."}
     ],
     explanation: "Ordering cost is (D/Q)·K = (12,000 ÷ 600) × 600 = ₹12,000. Holding cost is (Q/2)·h = 300 × 40 = ₹12,000. Total ₹24,000. That the two halves are equal is not a coincidence — it is the property that defines the EOQ.",
     link: "Equal ordering and holding cost at the optimum is the quickest check that a computed EOQ is right."},

    {concept: "sclm_newsvendor", source: "SCLM-M03-L05", node: "Newsvendor decision",
     stem: "A seasonal item sells for ₹900 and costs ₹500 to buy. There is one buying opportunity, and anything unsold at the end of the season clears at ₹200.",
     prompt: "What is the critical ratio? Give it as a decimal.", unit: "", dimensionless: true, answer: 0.57, tolerance: 0.01,
     nearMisses: [
       {value: 0.43, tolerance: 0.01, tag: "Inverted the ratio", label: "Divided the overage cost by the total instead",
        why: "This choice assumed the ratio is built from the cost of having too many. It is built from underage — the margin lost on a sale you could not fulfil — over the total mismatch cost. Cu = 900 − 500 = 400, Co = 500 − 200 = 300, so the ratio is 400/700.",
        cue: "Ask which mistake hurts more. When underage exceeds overage the ratio must be above 0.5, so you order generously."},
       {value: 1.33, tolerance: 0.02, tag: "Took the ratio of the two costs", label: "Compared the costs instead of taking a share",
        why: "This choice assumed the critical ratio is Cu divided by Co. It is a share of total mismatch cost, so it always falls between 0 and 1 — a value above 1 cannot be a position in a demand distribution.",
        cue: "The critical ratio is a probability. Anything outside 0 to 1 is the wrong construction."}
     ],
     explanation: "Underage is Cu = P − C = 900 − 500 = ₹400. Overage is C − salvage = 500 − 200 = ₹300. The critical ratio is Cu ÷ (Cu + Co) = 400 ÷ 700 = 0.571, so you order at roughly the 57th percentile of demand.",
     link: "The ratio sets how far up the demand distribution to order, which is where the supplied normal table is used."},

    /* Safety stock and the reorder point — SCLM-M03-L06, the lecture that unblocked
     * the last two numericals on this paper.
     *
     * Section B sat at 4 of 6 for months and the missing two were both z-based, which
     * was not a coincidence: the app supplied no standard normal table, so no question
     * needing one could be answered. The table is now a paper provision (see
     * `tables` on the SCLM spec), and these four follow.
     *
     * `sourceIds` carries two lectures each. The reorder-point items reuse the EOQ
     * machinery for how much to order and add the when — which is the lecture's own
     * framing — and the service-level items extend newsvendor's z. LAW-47 gates on
     * `sourceIds`, so declaring both is what stops one being scheduled before the
     * lecture teaching the half it actually tests.
     *
     * Figures are fresh, per the note above. The error that costs the most marks here
     * is scaling the standard deviation by L instead of √L, so every item carries that
     * specific wrong figure as a named near miss rather than a generic "wrong". */
    {concept: "sclm_eoq", source: "SCLM-M03-L06", sourceIds: ["SCLM-M03-L03", "SCLM-M03-L06"],
     node: "Reorder point with safety stock", reference: "standard-normal",
     stem: "A spare-parts depot reviews inventory continuously. Weekly demand is normally distributed with a mean of 40 units and a standard deviation of 12 units. The replenishment lead time is a constant 4 weeks, and the depot wants a 95% cycle service level.",
     prompt: "What reorder point achieves that service level?", unit: "units", answer: 199.6, tolerance: 1,
     nearMisses: [
       {value: 239.2, tolerance: 2, tag: "Scaled the deviation by the lead time", label: "Multiplied the standard deviation by L instead of √L",
        why: "This choice assumed σ over four weeks is 12 × 4 = 48. Variances add over independent weeks, not standard deviations, so σ_DLT = 12 × √4 = 24. Using L instead of √L doubles the buffer here and overstocks the depot permanently.",
        cue: "Add variances, then take the root. The lead-time deviation is always σ_d√L and is therefore smaller than σ_d·L."},
       {value: 179.8, tolerance: 2, tag: "Used the weekly deviation", label: "Buffered one week instead of the lead time",
        why: "This choice assumed the 12 in the stem is the deviation to buffer against. It is the weekly figure; the exposure is the whole 4-week lead time, so the deviation has to be converted first: 12 × √4 = 24.",
        cue: "The deviation the stem gives you is almost never the one the formula wants. Convert to the protection period before multiplying by z."},
       {value: 160, tolerance: 1, tag: "Left out the safety stock", label: "Covered average demand and nothing more",
        why: "This choice assumed the reorder point is mean demand during lead time. That is exactly the level at which you stock out about half the time, because demand exceeds its own mean half the time. The buffer is the whole point of the model.",
        cue: "A reorder point equal to μ_DLT is a 50% service level whatever the stem asked for."}
     ],
     explanation: "Mean demand during lead time is 40 × 4 = 160. The deviation over that period is σ_d√L = 12 × √4 = 24. A 95% cycle service level reads z = 1.65 off the table, so safety stock is 1.65 × 24 = 39.6 and ROP = 160 + 39.6 = 199.6 units.",
     link: "The buffer protects the lead time only, because that is the stretch you cannot react during once the order is placed."},

    {concept: "sclm_newsvendor", source: "SCLM-M03-L06", sourceIds: ["SCLM-M03-L05", "SCLM-M03-L06"],
     node: "Service level of a policy in force", reference: "standard-normal",
     stem: "A distributor watches inventory continuously and places an order whenever inventory position falls to 495 units. Daily demand is normally distributed with a mean of 50 units and a standard deviation of 15 units. The replenishment lead time is a constant 9 days. Nobody can say what service level this policy was chosen to deliver.",
     prompt: "What cycle service level does the current reorder point actually achieve?", unit: "%", answer: 84.1, tolerance: 0.5,
     nearMisses: [
       {value: 15.9, tolerance: 0.5, tag: "Reported the stockout probability", label: "Gave the risk instead of the service level",
        why: "This choice read the area to the right of z. The cycle service level is the probability of NOT stocking out, which is the area to the left — the figure the table prints. 1 − 0.8413 = 0.1587 is the complement, so the policy stocks out about 16% of cycles.",
        cue: "The table gives Φ(z), the left tail, and that is already the service level. Subtracting from 1 turns a good answer into its opposite."},
       {value: 99.9, tolerance: 0.5, tag: "Used the daily deviation", label: "Compared against one day's variability",
        why: "This choice assumed σ = 15. The reorder point covers nine days of exposure, so the comparison has to use σ_DLT = 15 × √9 = 45. With 15 the z comes out at 3.0 and the policy looks far safer than it is.",
        cue: "A z above 3 from ordinary figures almost always means the deviation was never converted to the lead time."},
       {value: 63.1, tolerance: 0.5, tag: "Scaled the deviation by the lead time", label: "Multiplied the deviation by L instead of √L",
        why: "This choice used σ_DLT = 15 × 9 = 135. Variances add over independent days, so the deviation grows with √L: 15 × √9 = 45. Inflating it to 135 drags z down to about 0.33 and makes a reasonable policy look careless.",
        cue: "√L, never L. It is the same slip whichever direction you are working in."}
     ],
     explanation: "Mean demand during lead time is 50 × 9 = 450 and σ_DLT = 15 × √9 = 45. The policy holds 495 − 450 = 45 units of safety stock, so z = 45 ÷ 45 = 1.00. The table gives Φ(1.00) = 0.8413, so the reorder point in force is buying a 84.1% cycle service level.",
     link: "Reading a policy backwards is the same relation as setting one, and it is how you find out what a reorder point inherited from somebody else is really worth."},

    {concept: "sclm_newsvendor", source: "SCLM-M03-L06", sourceIds: ["SCLM-M03-L05", "SCLM-M03-L06"],
     node: "Cost of a higher service level", reference: "standard-normal",
     stem: "A distributor of transformer spares holds safety stock for a 90% cycle service level. Weekly demand is normally distributed with a mean of 60 units and a standard deviation of 20 units, and the replenishment lead time is a constant 4 weeks. A contract penalty has made the firm decide to run at 99% instead.",
     prompt: "By how many units must the safety stock rise?", unit: "units", answer: 42, tolerance: 2,
     nearMisses: [
       {value: 93.2, tolerance: 2, tag: "Gave the new buffer, not the increase", label: "Answered a different question",
        why: "This choice computed the safety stock at 99% — 2.33 × 40 = 93.2 — and stopped. The firm already holds 1.28 × 40 = 51.2, so the rise is the difference between the two, not the new level.",
        cue: "When a stem asks by how much something changes, the answer is a difference. Compute both levels and subtract."},
       {value: 84, tolerance: 2, tag: "Scaled the deviation by the lead time", label: "Multiplied the standard deviation by L instead of √L",
        why: "This choice used σ_DLT = 20 × 4 = 80. Variances add over independent weeks, so σ_DLT = 20 × √4 = 40, and the increment is (2.33 − 1.28) × 40.",
        cue: "The lead-time deviation is σ_d√L. With L = 4 the difference between 40 and 80 is the whole error."},
       {value: 21, tolerance: 1, tag: "Never converted the deviation", label: "Buffered one week instead of four",
        why: "This choice used the weekly deviation of 20 directly. The exposure is the four-week lead time, so the deviation to buffer is 20 × √4 = 40 and every figure built on it doubles.",
        cue: "Convert σ to the protection period first. Every later step inherits that number."}
     ],
     explanation: "σ_DLT = 20 × √4 = 40. The table gives z = 1.28 at 90% and z = 2.33 at 99%, so the safety stock moves from 1.28 × 40 = 51.2 to 2.33 × 40 = 93.2 — a rise of 42 units. Nine points of service level cost 82% more buffer, which is why service level is a commercial decision and not a default.",
     link: "The buffer rises faster than the service level does, so the last few points of protection are the expensive ones."},

    {concept: "sclm_eoq", source: "SCLM-M03-L06", sourceIds: ["SCLM-M03-L03", "SCLM-M03-L06"],
     node: "Inventory position",
     stem: "A depot operates a continuous review policy with a reorder point of 700 units. The shelf holds 480 units. Two purchase orders of 125 units each were placed last week and are still in transit. Customers are owed 90 units, which they have agreed to receive late rather than cancel.",
     prompt: "What figure should be compared against the reorder point?", unit: "units", answer: 640, tolerance: 1,
     nearMisses: [
       {value: 480, tolerance: 1, tag: "Used on-hand stock only", label: "Ignored the stock already on its way",
        why: "This choice compared the shelf against the reorder point. On-hand keeps falling while an order is in transit, so a depot watching only the shelf reorders against a delivery it has already paid for — the double-ordering the inventory position exists to prevent.",
        cue: "If the answer equals what is physically in the building, the pipeline has been left out."},
       {value: 730, tolerance: 1, tag: "Ignored the backorders", label: "Counted stock that is already promised away",
        why: "This choice took on-hand plus on-order and stopped. The 90 units owed to customers are committed: they will leave the moment they can, so they cannot also be available to meet new demand. Backorders are subtracted.",
        cue: "Anything already promised to a customer is not yours to count."},
       {value: 820, tolerance: 1, tag: "Added the backorders", label: "Treated demand owed as stock held",
        why: "This choice added the 90 units instead of subtracting them. A backorder is unfilled demand — a claim against inventory, not a source of it — so it moves the position down, and getting the sign wrong here overstates cover by twice the backlog.",
        cue: "Check the direction: backorders make you worse off, so they cannot raise the figure."}
     ],
     explanation: "Inventory position is on-hand, plus what is on order and not yet arrived, minus backorders: 480 + (2 × 125) − 90 = 640 units. That sits 60 below the reorder point of 700, so an order is due now. The comparison is always against inventory position, never against the shelf.",
     link: "Comparing the shelf against a reorder point is the most common way a continuous review policy orders twice for the same shortfall."}
  ];

  function addAuthoredNumeric(course) {
    if (course.id !== "SCLM") return;
    var seen = {};
    SCLM_NUMERIC.forEach(function (item) {
      var concept = (course.concepts || []).filter(function (entry) { return entry.id === item.concept; })[0];
      if (!concept) return;
      seen[item.concept] = (seen[item.concept] || 0) + 1;
      addQuestion(course, {
        id: item.concept + "_numeric" + (seen[item.concept] > 1 ? "_" + seen[item.concept] : ""),
        courseId: course.id,
        conceptId: item.concept,
        supportingConceptIds: [],
        module: concept.module,
        source: item.source,
        /* Every lecture the question actually needs, not just its home one. LAW-47
           gates each surface on its own `sourceIds`, so a safety-stock item that
           reuses the EOQ machinery has to declare both — otherwise it can be
           scheduled before the lecture that teaches the half it is really testing. */
        sourceIds: unique(item.sourceIds || [item.source]),
        node: item.node,
        reference: item.reference || null,
        pattern: "Enter the final figure",
        perspective: "apply",
        type: "numeric",
        skills: ["apply", "compute"],
        difficulty: 4,
        variantFamily: item.concept + "_numeric",
        boss: false,
        caselet: item.stem,
        stem: item.stem,
        prompt: item.prompt,
        unit: item.unit,
        dimensionless: !!item.dimensionless,
        answer: item.answer,
        tolerance: item.tolerance,
        nearMisses: item.nearMisses,
        missDiagnosis: {
          tag: "Final figure did not land",
          label: "The method may be right, but the figure is not",
          why: "This section awards marks for the final answer within a tolerance and none for working, so an approach that is nearly right scores the same as one that is wrong. The full calculation is set out below.",
          cue: "Recompute from the stated numbers before moving on. Reading a figure back from the working is where most of these are lost."
        },
        explanation: item.explanation,
        link: item.link
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Course-assessment items — one concept, several genuinely different questions.
   *
   * WHY THESE EXIST
   * Two findings close here at once. **F-08**: SCLM Section A draws 50 questions
   * from a pool of 52, so the examiner has no slack, every paper question is
   * reachable in Learn, and there has never been a reserved slice. **F-06**:
   * "eliminate every option carrying only/all/every/never/always" pays 36–44%
   * against 25% chance, because in the generated families the correct answer is a
   * hedged definition and the distractors are over-claims.
   *
   * The bank was sparse because it treated roughly three question families per
   * concept as a ceiling. These subjects are theoretical, so one idea supports many
   * different questions — a definition, a scenario, a numeric case, a judgement
   * call are four questions about one concept, not one question four times.
   *
   * SOURCE, AND WHAT WAS AND WAS NOT TAKEN FROM IT
   * The owner's own course assessments (`docs/course-material/`, gitignored) are the
   * reference for style, coverage and difficulty — **not** a bank to copy. Nothing
   * here is one of their questions. What was taken is the shape: BRGSA's are
   * scenario-led ("A founder wants to avoid spending months building a product
   * before discovering whether anyone will pay…"), SCLM's mix definition, small
   * computation and case reading. Every item is written against a lecture that
   * already has a lesson, so LAW-47 holds with no extra scheduling work, and every
   * fact is one the lesson states.
   *
   * ON ABSOLUTES, MEASURED BEFORE AUTHORING
   * The instruction was to state correct answers with the absolutes the course
   * itself uses. Measured against the real assessments, the course barely uses them
   * there: correct options carry one 3% of the time in the SCLM paper and 7.5% in
   * the BRGSA paper, against 12% in this bank — **lower than what is being fixed**.
   * So copying their phrasing cannot close the gap, and the honest rule is narrower:
   * where the lecture's own claim is genuinely universal, say it universally, and do
   * not manufacture one where it is not. "Shorter lead times, higher variety, more
   * channels, higher service levels and faster innovation ALL raise implied demand
   * uncertainty" is the lecture's sentence. "His advantage was NEVER the location"
   * is the lecture's sentence. Thirteen of these thirty-two correct answers carry an
   * absolute because thirteen of the underlying claims are absolute.
   *
   * The other half of the same fix is on the distractor side and is not a watering
   * down: a wrong option here is often a *hedged, plausible, wrong* claim rather
   * than an over-claim, so eliminating the absolutes no longer eliminates the
   * distractors. Over-claims that are load-bearing are kept as over-claims —
   * "transportation speed alone determines performance" needs "alone" or it stops
   * being the error it exists to catch.
   *
   * WHY THIS SITS IN THIS FILE RATHER THAN A NEW ONE
   * `t6_integrated.js` was added as its own file and was missing from four load
   * lists at once, so eight scenarios shipped unvalidated for weeks (F-47). Every
   * list that loads this file already loads it. The ids all end `_cla<n>` so the
   * tranche stays greppable, and `tools/measure-absolute-bias.js` reports it as its
   * own family.
   *
   * All of this prose is new and is WAITING_OWNER_CONTENT_ACCEPTANCE.
   * ------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------
   * SCLM's examiner-only slice.
   *
   * Section A draws 50 mcqs from a pool of 84 and every one of them was also
   * reachable in Learn, so T4 reported 100% overlap and no concept with a distinct
   * examiner surface. These sixteen are `examOnly` — one per concept, so every
   * concept the paper can test has at least one item the candidate cannot have met
   * while studying — and additive, so no teaching surface was withdrawn.
   *
   * Scenario-led, because that is the register the course's own assessments use and
   * the one the owner asked for: a situation carrying real figures, then the
   * decision, with the concept never named in the stem. Following the existing
   * `_cla` tranche, no option names the concept either — R3 is satisfied on the
   * "none of them" branch, which is what keeps the name-matching family inside its
   * limit.
   * ------------------------------------------------------------------- */
  var SCLM_EXAM_ONLY = [
    {concept: "sclm_fit", source: "SCLM-M01-L04", node: "Strategic fit", mode: "scenario", examOnly: true,
     caselet: "A appliance maker promises next-day delivery on a range it has just widened from 40 to 260 variants, while keeping its existing quarterly production runs, single central warehouse and cheapest-quote carrier contracts.",
     stem: "What is the most defensible reading?",
     options: [
       "The promise and the operating design now describe different businesses, so one of the two has to move",
       "The wider range is the problem on its own, and cutting variants back to 40 restores the position without touching the production runs or the warehouse",
       "The carrier contract is the weak link, and re-tendering it will deliver the promise, since the days are lost in transit rather than before it",
       "Nothing needs to change, because demand variability has not risen and the forecast is unchanged, and the uncertainty a chain absorbs is a property of its customers"
     ], answer: 0,
     wrong: {
       1: {tag: "Treated variety as the only lever", label: "Fixed one driver and left the promise standing",
         why: "This choice assumed range is the cause. Range is one of several things that raised what the chain has to absorb; the quarterly runs, the single warehouse and the cheapest-carrier choice all point the other way from a next-day promise, so cutting variants alone leaves a design that still cannot deliver it.",
         cue: "List every driver the promise touches. If only one is being changed, ask whether the rest still contradict it."},
       2: {tag: "Blamed the last link in the chain", label: "Localised a system problem to one contract",
         why: "This choice assumed transport is where the promise is lost. A carrier cannot recover time that batching and a single stocking point have already spent, so re-tendering buys a small improvement against a structural gap.",
         cue: "Trace where the days actually go. The visible stage is rarely the one holding the total."},
       3: {tag: "Read uncertainty as demand variation alone", label: "Ignored what the promise itself adds",
         why: "This choice assumed the uncertainty a chain must absorb is a property of demand. Shorter promised lead times, wider variety, more channels and higher service levels all raise it, so a firm can multiply its own uncertainty with a stable forecast.",
         cue: "Ask what the firm has promised, not only what customers have done."}},
     explanation: "Responsiveness is not a preference but a design: a next-day promise on 260 variants requires the batching, stocking and transport decisions to be built for it. Either the operating design changes or the promise does.",
     link: "A promise the chain is not built to keep fails at the customer, whatever the forecast says."},

    {concept: "sclm_drivers", source: "SCLM-M01-L06", node: "Six supply-chain drivers", mode: "scenario", examOnly: true,
     caselet: "A retailer wants to cut delivery time to stores. It is considering three options: adding two regional warehouses, moving a third of volume from rail to road, or raising the safety stock held at the existing single warehouse.",
     stem: "Which reading of these three options is correct?",
     options: [
       /* Every option names the concept. R3's "none of them" branch was the stated
          rule for this tranche and this item broke it: the answer was the only option
          containing "drivers", so the set paid 100% to a candidate who read the
          section heading and nothing else. Fixed in `connect`'s direction — name the
          concept everywhere, never strip it from the answer (CONTENT-RULES R3) — and
          in place, because appending is what pushed IBM's "pick the longest" to 66%. */
       "They are three different drivers of the same outcome, and the choice is a cost trade rather than a ranking",
       "These are three drivers of one outcome, but facilities is what counts, since delivery time is set by where stock sits",
       "Whichever of the three drivers costs least should be chosen, since each reaches the same delivery time and the decision is purely a question of price",
       "Transportation is always the best of these drivers, because moving faster is the only real lever on time"
     ], answer: 0,
     wrong: {
       1: {tag: "Reduced the chain to one driver", label: "Kept facilities and discarded the rest",
         why: "This choice assumed location settles delivery time. Facilities, inventory and transportation each move it, and they trade against each other — which is why an option set like this one exists at all.",
         cue: "Name every driver the outcome depends on before choosing between options."},
       2: {tag: "Chose on cost without comparing effect", label: "Assumed equal outcomes to make the decision easy",
         why: "This choice assumed the three options deliver the same result. They do not: more stock nearer the customer, more locations and faster movement reach different delivery times at different costs, and the comparison is the decision.",
         cue: "Compare what each option buys before comparing what it costs."},
       3: {tag: "Made one driver a rule", label: "Treated speed as the only route to time",
         why: "This choice assumed transport is the lever for delivery time. Holding stock closer removes distance entirely, which can beat moving faster over the same distance and often costs less.",
         cue: "Time can be bought by moving faster or by starting closer. Compare both."}},
     explanation: "Facilities, inventory and transportation are separate levers on the same outcome, and each carries a different cost and a different responsiveness. Choosing between them is the design decision.",
     link: "The drivers trade against each other, so a chain is described by the balance struck rather than by any one setting."},

    {concept: "sclm_smoothing", source: "SCLM-M02-L06", node: "Exponential smoothing", mode: "scenario", examOnly: true,
     caselet: "A planner has used a smoothing constant of 0.1 for two years. A competitor's exit has permanently lifted weekly demand, and for six weeks the forecast has sat well below actual demand every week.",
     stem: "What should the planner do?",
     options: [
       "Raise the constant so the forecast catches the level shift, accepting that it will also track noise more closely",
       "Keep the constant, because a low value is what protects a forecast from over-reacting, and that protection is worth more than a faster response to any single run",
       "Switch to using last week's actual demand as next week's forecast until the gap closes, since the most recent figure is the best available estimate of the new level",
       "Leave the method alone, since six weeks of error is normal variation around a forecast and reacting to a short run is how planners end up chasing noise"
     ], answer: 0,
     wrong: {
       1: {tag: "Defended the setting against the evidence", label: "Treated a parameter as a principle",
         why: "This choice assumed a low constant is always the safer choice. It is the right choice when demand is stable and the wrong one after a level shift, because it corrects by only a tenth of each error and takes many periods to arrive.",
         cue: "A smoothing constant is a decision about responsiveness. Re-ask it when the level moves."},
       2: {tag: "Went to the other extreme", label: "Set the constant to one without saying so",
         why: "This choice assumed the fastest correction is the best. Using last week's actual is smoothing with the constant at 1, which carries every piece of noise straight into the next forecast — the error the low value was protecting against.",
         cue: "If your forecast equals last period's actual, you have chosen alpha = 1."},
       3: {tag: "Read a one-sided run as noise", label: "Missed the direction of the errors",
         why: "This choice assumed six weeks of error is ordinary. Random error falls on both sides; six consecutive weeks in the same direction is a level the forecast has not reached, which is a bias rather than variation.",
         cue: "Check the sign of the errors. Consistently one-sided means the method is behind the level."}},
     explanation: "Exponential smoothing corrects by a fraction of the last error, so a small constant is slow to reach a new level. Six one-sided errors indicate a shift, not noise, and the constant is the parameter that decides how fast the forecast follows.",
     link: "Alpha is a choice about how much of each error to believe, and the right choice depends on whether the level is moving."},

    {concept: "sclm_sop", source: "SCLM-M02-L12", node: "Sales and operations planning", mode: "scenario", examOnly: true,
     caselet: "Sales forecasts 40,000 units for the quarter, operations has capacity for 28,000 and plans to that, and finance has budgeted revenue on 36,000. Each number is circulated separately and none is reconciled before the quarter starts.",
     stem: "What is the most defensible reading?",
     options: [
       "Three functions are committing the firm to three different quarters, and the reconciliation is the missing step",
       "Sales should reduce its forecast to 28,000, since capacity is the hard limit and the rest is aspiration",
       "Operations should build to 40,000, because the plan must serve whatever sales can sell",
       "The spread is acceptable because a forecast is uncertain and each function needs its own working figure"
     ], answer: 0,
     wrong: {
       1: {tag: "Resolved the conflict by deferring to capacity", label: "Made the constraint the plan",
         why: "This choice assumed the smallest number wins. Capacity is a constraint to be reconciled against demand, not a decision — and if demand really is 40,000, the right output may be to add capacity or to choose which demand to serve rather than to lower the forecast.",
         cue: "Reconciling means deciding what the firm will do about the gap, not adopting the lowest figure."},
       2: {tag: "Resolved it by deferring to demand", label: "Committed to capacity the firm does not have",
         why: "This choice assumed operations should match whatever sales forecasts. Building to an unreconciled forecast is how inventory and overtime costs arrive without anyone deciding to spend them.",
         cue: "A plan that ignores the constraint is a wish. The gap is the thing to decide about."},
       3: {tag: "Accepted the divergence as uncertainty", label: "Confused forecast error with a planning failure",
         why: "This choice assumed the spread reflects honest uncertainty. It reflects three functions planning independently: a single uncertain number is a forecast, three different committed numbers is an unreconciled plan, and the costs land in inventory, service and cash.",
         cue: "Ask whether the numbers differ because the future is uncertain or because nobody agreed one."}},
     explanation: "The point of the process is one agreed demand, supply and financial plan. Three separate numbers mean the firm has committed to three different quarters, and the cost appears as stockouts, idle capacity or a revenue miss.",
     link: "One plan the functions have agreed is worth more than three accurate ones they have not."},

    {concept: "sclm_eoq", source: "SCLM-M03-L03", node: "Economic order quantity", mode: "scenario", examOnly: true,
     caselet: "A buyer is told the supplier has cut the fixed charge per order from ₹4,000 to ₹1,000. Annual demand and holding cost are unchanged.",
     stem: "What should happen to the order quantity, and why?",
     options: [
       "It should fall to half, because the quantity moves with the square root of the ordering cost",
       "It should fall to a quarter, because the ordering cost has fallen to a quarter",
       "It should not change, because the order quantity is set by annual demand, which the supplier's charge does not affect in either direction",
       "It should rise, because cheaper ordering makes larger orders more attractive and the saving is best captured by buying in bulk"
     ], answer: 0,
     wrong: {
       1: {tag: "Scaled the quantity linearly", label: "Moved the answer with the input",
         why: "This choice assumed the order quantity is proportional to the ordering cost. The cost sits under a square root, so a fall to a quarter reduces the quantity to a half — a factor of two, not four.",
         cue: "The formula takes a root. A fourfold change in an input is a twofold change in the answer."},
       2: {tag: "Fixed the quantity to demand", label: "Treated one input as the whole formula",
         why: "This choice assumed demand alone sets the order size. Demand, the ordering cost and the holding cost all enter, which is why a change in any one of them moves the answer.",
         cue: "Three inputs, not one. Ask which have moved before concluding nothing has."},
       3: {tag: "Got the direction wrong", label: "Read cheaper ordering as a reason to order more",
         why: "This choice assumed cheap orders justify big ones. It is the opposite: when ordering is cheap you can afford to order more often, so each order gets smaller and less stock is held between deliveries.",
         cue: "Cheap ordering buys frequency. Expensive ordering is what forces large batches."}},
     explanation: "The quantity varies with the square root of the ordering cost, so cutting that cost to a quarter cuts the order size to a half. Cheaper ordering means ordering more often in smaller amounts.",
     link: "Every input enters under a root, so the answer moves far less than the input that caused it."},

    {concept: "sclm_newsvendor", source: "SCLM-M03-L05", node: "Newsvendor decision", mode: "scenario", examOnly: true,
     caselet: "A bakery makes a celebration cake for one weekend only. Each sells for ₹1,200 and costs ₹400 to make. Anything unsold is given away at the end of the weekend and returns nothing.",
     stem: "What does this cost structure imply about the quantity to bake?",
     options: [
       "Bake well above expected demand, because a missed sale costs twice what an unsold cake does",
       "Bake exactly expected demand, since that is the quantity which minimises the total mismatch cost on either side",
       "Bake below expected demand, because unsold stock returns nothing at all and a zero salvage value is the strongest argument for caution",
       "The quantity cannot be decided without knowing how many were sold last year, since the costs alone cannot indicate a quantity"
     ], answer: 0,
     wrong: {
       1: {tag: "Ordered at the mean", label: "Treated the average as the optimum",
         why: "This choice assumed expected demand is the right quantity. It is only right when the two mistakes cost the same; here a missed sale costs ₹800 of margin and an unsold cake costs ₹400, so the cheaper mistake is to have one too many.",
         cue: "Order at the mean only when overage and underage cost the same. Compare them first."},
       2: {tag: "Followed the salvage value instead of the margin", label: "Weighted the visible loss over the invisible one",
         why: "This choice assumed a zero salvage value means order cautiously. Zero salvage makes overage cost ₹400, which is still less than the ₹800 lost on a sale that could not be made — the loss you never see is the larger one.",
         cue: "An unsold unit costs what you paid. A missed sale costs the margin you gave up."},
       3: {tag: "Waited for data before reasoning", label: "Confused the distribution with the rule",
         why: "This choice assumed history is needed to decide. History sets where expected demand is; the cost structure decides how far above or below it to order, and that part is answerable from the figures given.",
         cue: "The costs give the position in the distribution. Data gives the distribution."}},
     explanation: "Underage is ₹1,200 − ₹400 = ₹800 and overage is ₹400, so the critical ratio is 800 ÷ 1,200 = 0.67 and the right quantity sits at about the 67th percentile of demand — comfortably above the mean.",
     link: "Which mistake hurts more decides which side of expected demand to sit on."},

    {concept: "sclm_portfolio", source: "SCLM-M04-L04", node: "Tailored sourcing portfolio", mode: "scenario", examOnly: true,
     caselet: "A firm sources two components from one low-cost offshore supplier: a stable, high-volume fastener, and a fast-changing electronic module whose design revises every few months and whose demand swings sharply.",
     stem: "What is the most defensible sourcing change?",
     options: [
       "Keep the fastener offshore and move the module to a responsive supplier nearer the market",
       "Move both to the responsive supplier, since a single relationship is simpler to manage and the coordination saved outweighs the premium paid on the stable part",
       "Keep both offshore, because the cost advantage applies to everything the firm buys, whatever the design revision rate or the demand pattern of the part",
       "Move both onshore, because offshore sourcing carries disruption risk in every category, and that exposure settles the question ahead of any cost comparison"
     ], answer: 0,
     wrong: {
       1: {tag: "Optimised for simplicity", label: "Paid responsiveness prices for a stable part",
         why: "This choice assumed one supplier type should serve both. The fastener is stable and predictable, which is exactly what a low-cost source is for; paying responsiveness rates for it spends money on flexibility the part never uses.",
         cue: "Match the source to the part. One supplier for everything means one of the parts is wrong."},
       2: {tag: "Applied cost logic to a volatile part", label: "Ignored what variety and change cost offshore",
         why: "This choice assumed the cost advantage is universal. A design revising every few months over a long lead time means obsolete stock in transit, and demand swings mean the wrong quantity arriving weeks late.",
         cue: "Low cost buys stability. Ask whether the part is stable before buying it."},
       3: {tag: "Made disruption risk a blanket rule", label: "Treated a real risk as a decision",
         why: "This choice assumed offshore exposure settles the question everywhere. It is one factor weighed against labour content and cost differential, and for a stable, high-volume fastener that trade usually still favours the low-cost source.",
         cue: "Risk is an input to the trade, not a verdict on it."}},
     explanation: "Different products need different supplier strengths. Stable, high-volume, low-variety parts suit a low-cost source; volatile, fast-changing, high-value ones suit a responsive one. Combining them deliberately is the portfolio.",
     link: "The question is not which supplier is best but which mix fits which product."},

    {concept: "sclm_bullwhip", source: "SCLM-M04-L05", node: "Bullwhip effect", mode: "scenario", examOnly: true,
     caselet: "End-customer sales of a household product have varied by about 5% month to month for two years. Retailer orders to the distributor vary by 20%, distributor orders to the manufacturer by 45%, and the manufacturer's production schedule by 70%.",
     stem: "What is the most defensible interpretation?",
     options: [
       "Each stage is adding distortion by ordering from the stage in front of it rather than from real demand",
       "The manufacturer's planning is at fault, since its swing is the largest of the four and the biggest number in a chain marks where the problem is created",
       "End demand must be more variable than the sales figures show, since orders reflect it and a 70% swing could not arise from demand varying by 5%",
       "The pattern is expected, because orders further from the customer are naturally less accurate"
     ], answer: 0,
     wrong: {
       1: {tag: "Blamed the stage with the biggest number", label: "Read the symptom as the cause",
         why: "This choice assumed the largest swing is the source. The manufacturer sees the distributor's orders, which already carry the retailer's distortion — it is the last stage in the chain and therefore shows the accumulated amplification rather than creating it.",
         cue: "Amplification grows along the chain. The largest swing is furthest downstream of the cause, not at it."},
       2: {tag: "Doubted the demand data", label: "Explained the distortion away",
         why: "This choice assumed orders are a reliable picture of demand. The whole finding is that they are not: batching, forecast updates and incentives make orders diverge from the sales that triggered them, which is why the two series differ.",
         cue: "Orders are decisions. Sales are demand. Do not use one to correct the other."},
       3: {tag: "Naturalised the amplification", label: "Accepted a systematic effect as inevitable",
         why: "This choice assumed distance from the customer explains it. Distance is why the information is poor, not why it is amplified — the amplification comes from specific causes, and sharing the demand signal is what removes them.",
         cue: "Ask what produces the swing. If the answer is a practice, it can be changed."}},
     explanation: "Order batching, forecast updating, price promotions and rationing each add variance, and each stage passes an already-distorted signal to the next. Sharing the actual demand signal is what stops it.",
     link: "The swing grows because every stage reacts to orders rather than to demand."},

    {concept: "sclm_reengineering", source: "SCLM-M05-L06", node: "Supply-chain re-engineering", mode: "scenario", examOnly: true,
     caselet: "A firm's order-to-delivery time is 19 days. Measured stage by stage, actual work accounts for about 3 days; the rest is orders waiting for the next batch run, for credit approval, and for a weekly despatch window.",
     stem: "Where should the redesign start?",
     options: [
       "With the waiting between stages, since that is where sixteen of the nineteen days are",
       "With the three days of actual work, because that is the part the firm directly controls",
       "With the despatch window alone, since it is the last delay before the customer and therefore the one they actually experience",
       "With adding capacity at each stage, so that work is completed faster everywhere"
     ], answer: 0,
     wrong: {
       1: {tag: "Optimised the work rather than the flow", label: "Attacked the smallest share of the time",
         why: "This choice assumed effort should go where the work is. Even halving three days of work saves a day and a half of nineteen; the waiting is not anybody's task, which is why it belongs to no function and survives every functional improvement.",
         cue: "Compare the size of each share before choosing. Work you can see is not always the time you are spending."},
       2: {tag: "Fixed one queue", label: "Removed a delay and left the chain of them",
         why: "This choice assumed the last delay is the decisive one. Removing the despatch window leaves batching and credit approval intact, and the order still waits — a single queue removed from a chain of queues changes little.",
         cue: "Map the whole flow before choosing a stage. Delays in series all have to go."},
       3: {tag: "Bought capacity for a queueing problem", label: "Treated waiting as insufficient throughput",
         why: "This choice assumed more capacity shortens the wait. These orders are not waiting for capacity, they are waiting for a batch, an approval and a scheduled window — none of which more capacity reaches, and all of which more capacity costs money to leave in place.",
         cue: "Ask what each order is waiting FOR. Only some waits are queues for capacity."}},
     explanation: "Sixteen of nineteen days are waiting rather than work, and waiting sits between functions where no single function owns it. Redesigning the connected process is what removes it; optimising each function separately cannot.",
     link: "Time lost between stages belongs to no department, which is why it survives every departmental improvement."},

    {concept: "sclm_stockyard", source: "SCLM-M05-L13", node: "Stockyard location trade-off", mode: "scenario", examOnly: true,
     caselet: "A firm sited four stockyards when road freight cost ₹4 per tonne-km and each yard could serve a 90 km radius economically. Freight is now ₹9 per tonne-km, the economic radius has fallen to about 55 km, and demand has grown in two districts that sit at the edge of two existing yards.",
     stem: "What is the most defensible response?",
     options: [
       "Re-run the siting decision on the new cost, radius and demand together, since all three inputs have changed",
       "Keep the sites, because a stockyard is a long-lived asset and moving it destroys the investment already committed to building and equipping it",
       "Add a yard in each of the two growing districts and leave the existing four unchanged",
       "Close the two least-used yards, since higher freight cost makes fewer, larger sites cheaper to run and consolidation is the standard response to dearer transport"
     ], answer: 0,
     wrong: {
       1: {tag: "Defended the asset instead of the decision", label: "Let sunk cost decide the network",
         why: "This choice assumed the existing investment settles the question. What has been spent cannot be recovered by either answer, so it is not a reason to keep a network whose economics have changed underneath it.",
         cue: "Ask what the network should be if nothing were built yet, then price the move against that."},
       2: {tag: "Answered the demand change only", label: "Solved one of the three changes",
         why: "This choice assumed growth is the only input that moved. The economic radius has fallen from 90 km to 55 km, which changes what every existing yard can serve — adding two sites onto an outdated network optimises around a shape that no longer holds.",
         cue: "Count what has changed. A decision with three moved inputs is not answered by addressing one."},
       3: {tag: "Got the direction of the cost effect wrong", label: "Consolidated when freight got dearer",
         why: "This choice assumed higher freight favours fewer, larger sites. It is the reverse: when moving goods costs more, distance is what you want less of, which argues for more sites closer to demand, not fewer.",
         cue: "Dearer freight buys proximity. Cheaper freight is what makes consolidation attractive."}},
     explanation: "Cost structure, coverage limit and demand location all enter the siting decision, and all three have moved. A higher freight cost shrinks the economic radius, which argues for more sites nearer demand rather than fewer.",
     link: "A network is right for a cost structure, so it should be re-decided when the cost structure changes."},

    {concept: "sclm_coldstore", source: "SCLM-M06-L05", node: "Cold-storage expansion", mode: "scenario", examOnly: true,
     caselet: "A cold-store owner runs at 95% occupancy for four months of the year and 30% for the other eight. A neighbouring plot is available. Adding a chamber would cost ₹1.4 crore, and the additional produce is available only in the same four-month window.",
     stem: "What is the most defensible reading?",
     options: [
       "The new chamber would be idle for eight months, so its case rests on what the peak four months alone can cover",
       "Occupancy averages about 52% across the year, so there is spare capacity and no case for building until the annual average approaches the physical limit of the site",
       "The expansion is justified, because turning away produce in the peak is a lost sale",
       "The plot should be bought regardless, since land beside an existing site rarely becomes available twice and the option is worth more than the analysis that would delay it"
     ], answer: 0,
     wrong: {
       1: {tag: "Averaged a seasonal load", label: "Used a mean where the pattern is the point",
         why: "This choice assumed the annual average describes the constraint. It does not: capacity has to be sized against the peak, and an average of 52% across a 95%/30% split describes a year that never happens.",
         cue: "For seasonal capacity, read the peak and the trough. The mean is between two states rather than a state."},
       2: {tag: "Counted the revenue and not the idle months", label: "Priced the peak and ignored the year",
         why: "This choice assumed turned-away produce settles the case. The chamber is paid for over twelve months and earns in four, so the peak revenue has to cover the whole year's capital and running cost before the expansion is worth making.",
         cue: "Match the earning window against the paying window before approving capacity."},
       3: {tag: "Bought the option rather than the case", label: "Let availability substitute for a decision",
         why: "This choice assumed scarcity of land is the argument. It may be a reason to move quickly once the case holds, and it is not a case: the question is whether four months of demand supports ₹1.4 crore of year-round cost.",
         cue: "Scarcity affects timing. It does not answer whether the investment pays."}},
     explanation: "Occupancy of 95% for four months and 30% for eight means the asset earns in a third of the year and is paid for across all of it. The expansion has to be justified by peak-season revenue alone, or by finding a use for the idle months.",
     link: "Seasonal capacity is sized on the peak and paid for over the whole year, which is the whole difficulty."},

    {concept: "sclm_turnaround", source: "SCLM-M06-L07", node: "Transport turnaround", mode: "scenario", examOnly: true,
     caselet: "A fleet operator pays drivers a fixed sum per trip. Average round-trip time is 46 hours, of which 19 are spent waiting to load and unload. The operator is considering buying four more trucks to raise the number of trips completed each week.",
     stem: "What should be examined before the purchase?",
     options: [
       "Whether removing part of the 19 waiting hours would raise trips per truck without buying anything",
       "Whether the drivers can be paid more per trip, since faster driving would shorten the round trip",
       "Whether four trucks is the right number, given that the fleet is the binding constraint",
       "Whether fuel cost per trip can be reduced, since that is the largest variable cost of a round trip"
     ], answer: 0,
     wrong: {
       1: {tag: "Went after driving time", label: "Sought speed where the hours are not being spent",
         why: "This choice assumed the road time is where the trip is lost. Nineteen of forty-six hours are spent stationary at loading points, and paying for faster driving buys risk against the smaller share of the clock.",
         cue: "Split the cycle into moving and waiting before deciding what to shorten."},
       2: {tag: "Accepted the constraint as stated", label: "Sized the purchase instead of testing it",
         why: "This choice assumed the fleet is what limits trips. Each truck is idle for 19 hours a cycle, so capacity is being lost inside the trucks the operator already owns — adding four more buys four more sets of waiting hours.",
         cue: "Before adding an asset, ask how much of the existing asset is actually working."},
       3: {tag: "Optimised a cost rather than the cycle", label: "Reduced the price of a trip instead of the number of hours in it",
         why: "This choice assumed fuel is the lever. Cheaper fuel lowers the cost of the trips being made; it does not change how many trips a truck completes, which is what the purchase is meant to address.",
         cue: "Match the lever to the objective. Cost per trip and trips per truck are different problems."}},
     explanation: "Nineteen of forty-six hours are turnaround rather than travel, so a large share of fleet capacity is standing still. Cutting waiting raises trips per truck at no capital cost, and should be tested before the fleet is enlarged.",
     link: "A truck earns while it moves, so the hours it spends stationary are the cheapest capacity in the business."},

    {concept: "sclm_multimodal", source: "SCLM-M07-L06", node: "Multimodal cost trade-off", mode: "scenario", examOnly: true,
     caselet: "Moving a consignment by road costs ₹210,000 and takes 4 days. By rail and coastal shipping combined it costs ₹96,000 and takes 13 days. The consignment is a spare part held as insurance stock against a breakdown that halts a ₹40 lakh-a-day production line.",
     stem: "Which mode should be chosen, and on what basis?",
     options: [
       "Road, because the nine days saved are worth far more than the ₹114,000 difference given what a stoppage costs",
       "Rail and coastal, because it is less than half the freight cost and the saving is certain while the breakdown it guards against may never happen at all",
       "Rail and coastal, because slower modes are the correct default for heavy or bulky consignments",
       "Either, since freight cost is the only figure that separates two modes carrying the same goods to the same destination in the same condition"
     ], answer: 0,
     wrong: {
       1: {tag: "Compared freight bills only", label: "Optimised the cost that appears on an invoice",
         why: "This choice assumed the cheaper freight is the cheaper decision. The saving is ₹114,000; the exposure is a line losing ₹40 lakh a day, so nine extra days of waiting for an insurance part risks far more than the freight saved.",
         cue: "Add what the time costs to what the transport costs. The invoice is only one of the two."},
       2: {tag: "Applied a mode rule", label: "Chose by category instead of by consequence",
         why: "This choice assumed heavy goods default to slow modes. That default holds when time is cheap; here the item exists specifically to prevent a stoppage, which is what makes the time expensive.",
         cue: "Ask what the cargo is for. The same goods can justify different modes in different roles."},
       3: {tag: "Ignored time as a cost at all", label: "Treated the two options as equivalent apart from price",
         why: "This choice assumed identical goods make identical decisions. Nine days is the whole difference, and for an insurance part its value is the risk it removes during those days.",
         cue: "Two modes differ in cost and in time. A comparison using one of the two is incomplete."}},
     explanation: "The freight saving is ₹114,000 and the risk carried is a line worth ₹40 lakh a day. Mode choice trades transport cost against transit time, and here the time is worth far more than the money.",
     link: "The cheapest freight is not the cheapest decision once the cost of waiting is on the same page."},

    {concept: "sclm_ports", source: "SCLM-M07-L07", node: "Ports and PPP", mode: "scenario", examOnly: true,
     caselet: "A state wants to raise container throughput at a public port. Average vessel turnaround is 2.4 days against 0.9 at a nearby private terminal; the public port's cranes are older and its yard is congested, and the state has limited capital to invest.",
     stem: "What is the most defensible route?",
     options: [
       "Bring in private capital and operating discipline for the terminal while the state keeps the port's public role",
       "Fund new cranes from the state budget, because ownership must stay entirely public for a strategic asset whatever the capital constraint the state is working under",
       "Sell the port outright, since the private terminal already performs better on turnaround and ownership is what produced that difference",
       "Accept the difference, because turnaround is decided by vessel size and cargo mix rather than by operations, so equipment and yard management cannot close it"
     ], answer: 0,
     wrong: {
       1: {tag: "Made ownership the objective", label: "Protected the structure instead of the performance",
         why: "This choice assumed a strategic asset requires full public funding. The state's own constraint is capital, and partnership is the arrangement that brings investment and operating practice without giving up the port's public function.",
         cue: "Separate what must stay public from what must be paid for. They are rarely the same list."},
       2: {tag: "Went from partnership to disposal", label: "Solved the capital problem by removing the public role",
         why: "This choice assumed better private performance argues for sale. Performance can be brought in under a concession; selling outright also transfers the public obligations the port exists to carry, which is a different decision from funding a terminal.",
         cue: "Ask what is being bought — capital and operating practice, or the asset itself."},
       3: {tag: "Explained the gap away", label: "Attributed an operating difference to cargo",
         why: "This choice assumed turnaround is set by what arrives. The case names older cranes and a congested yard, which are operating and investment matters — and a 2.4 against 0.9 day gap at neighbouring ports is too large to be composition alone.",
         cue: "Look for the stated cause before reaching for an external one."}},
     explanation: "Turnaround responds to equipment, yard management and operating practice, all of which need capital the state says it does not have. Partnership brings both while the public role is retained under the concession.",
     link: "The choice is not public or private but which functions each side is better placed to carry."},

    {concept: "sclm_leads", source: "SCLM-M08-L01", node: "LEADS index", mode: "scenario", examOnly: true,
     caselet: "A state has risen four places in the national logistics ranking. Its industry association reports that road quality and warehousing availability scores improved, while its members' own freight costs and delivery times are unchanged.",
     stem: "What is the most defensible reading?",
     options: [
       "The index measures the environment a supply chain operates in, so a better score need not yet show in firms' own costs",
       "The ranking must be wrong, because the outcome that matters to firms has not moved, and a measure that does not track members' freight costs is measuring nothing useful",
       "The improvement proves logistics performance has risen, and firms will be reporting savings shortly, since better roads and warehousing pass through to costs automatically",
       "The index measures firm-level outcomes directly, so the two findings cannot both be true and one of the two reports has to be withdrawn"
     ], answer: 0,
     wrong: {
       1: {tag: "Rejected the measure on the wrong test", label: "Judged an environment index by a firm's costs",
         why: "This choice assumed the ranking should track members' freight bills. It ranks the conditions a state provides — infrastructure, services, regulatory environment — which shape what is possible rather than what any firm has yet achieved.",
         cue: "Read what an index measures before deciding it is wrong. A mismatch may be the wrong comparison."},
       2: {tag: "Promised the outcome", label: "Treated a better environment as a result already earned",
         why: "This choice assumed improvement flows through automatically. Better roads and warehousing make lower costs achievable, and realising them takes network and operating decisions firms have not necessarily made.",
         cue: "An enabling condition is not an outcome. Ask what a firm still has to do."},
       3: {tag: "Misread the unit of measurement", label: "Confused a state-level index with firm-level data",
         why: "This choice assumed the two findings contradict. They are measurements of different things — the state's conditions and the members' operations — so both can be accurate at once.",
         cue: "Check the unit. State-level and firm-level measures are not alternatives."}},
     explanation: "The index scores the logistics environment a state offers — infrastructure, services and regulatory conditions — and exists to drive policy competition between states. Firm-level costs respond later and only where firms act on the change.",
     link: "Measuring the environment is how a government improves it; it is not a measure of any one firm's performance."},

    {concept: "sclm_akshaya", source: "SCLM-M08-L03", node: "Akshaya Patra meal logistics", mode: "scenario", examOnly: true,
     caselet: "A meal programme cooks 90,000 portions from one kitchen each morning and must deliver to 480 schools before 12:30. Cooking finishes at 07:30. Its 42 vehicles average 11 schools each per run, and last month 26 schools received meals after 12:30 on at least four days.",
     stem: "Where is the constraint on this operation?",
     options: [
       "In the distribution window between 07:30 and 12:30, since cooking is already complete before dispatch begins",
       "In kitchen capacity, since 90,000 portions from one kitchen is the largest number in the case and scale of that order is what limits any operation",
       "In the number of schools, since 480 destinations is more than 42 vehicles can reasonably serve",
       "In the vehicles, since more of them would remove the late deliveries directly and additional capacity is the fastest route to serving the whole list on time"
     ], answer: 0,
     wrong: {
       1: {tag: "Chose the largest number", label: "Read scale as the constraint",
         why: "This choice assumed the biggest figure marks the bottleneck. Cooking finishes at 07:30, before distribution starts, so the kitchen is not what makes 26 schools late — a stage that has completed its work on time is not the constraint.",
         cue: "A constraint is the stage that limits the outcome, not the stage with the biggest number."},
       2: {tag: "Named the workload", label: "Described the task rather than the limit",
         why: "This choice assumed the number of destinations is the problem. Most of the 480 are served on time, so the network is largely working; the question is what makes the tail late.",
         cue: "If most of the load is served, the total load is not the constraint."},
       3: {tag: "Bought capacity before finding the limit", label: "Solved it with vehicles without checking the clock",
         why: "This choice assumed more vehicles is the fix. It may be part of one, and the binding factor is the five-hour window with routes averaging 11 schools each — sequencing, routing and staggered dispatch may recover the time at no capital cost.",
         cue: "Establish what limits the outcome before choosing what to buy."}},
     explanation: "Cooking completes at 07:30 and delivery must finish by 12:30, so the operation is bounded by a five-hour distribution window across 480 schools. The late tail is a routing and sequencing problem inside that window.",
     link: "Perishable food and a fixed delivery deadline make the window, not the kitchen, the thing to design around."}
  ];


  /* SPMS's examiner-only Section A tranche.
   *
   * The eight concepts the examiner-only multi-selects do not reach, so that every
   * SPMS concept the paper can test has at least one item a learner cannot have met
   * while studying. Same rules as the SCLM tranche: scenario-led, concept never named
   * in the stem, no option naming it either, and additive to what Learn already has.
   *
   * Option lengths are deliberately spread rather than left to fall out of the
   * writing. Authoring a fully-reasoned correct answer against terser wrong ones puts
   * the answer at the longest or second-longest almost every time — measured on the
   * first draft of the SCLM tranche, 13 of 16 — which hands over a shape cue that has
   * nothing to do with the idea being tested.
   */
  var SPMS_EXAM_ONLY = [
    {concept: "spms_jtbd", source: "SPMS-M01-L10", node: "Jobs to be done", mode: "scenario", examOnly: true,
     caselet: "A commuter buys a coffee from the same stall every weekday at 07:40. Asked why, he says the queue is short so he is not late, the cup gives him something to hold on a crowded platform, and arriving at his desk with it makes him feel the day has started properly.",
     stem: "What is this purchase actually serving?",
     options: [
       "Getting to work on time, having something to do while waiting, and starting the day feeling ready",
       "A caffeine requirement, which is what any coffee purchase fundamentally comes down to in the end",
       "A habit formed by repetition, since the same purchase made at the same time each weekday has become automatic behaviour requiring no decision",
       "Price sensitivity, because a stall is cheaper than the cafe and cost is what decides a daily purchase"
     ], answer: 0,
     wrong: {
       1: {tag: "Reduced the purchase to the product category", label: "Answered with what is being sold",
         why: "This choice assumed the drink explains the purchase. The commuter's own answers are about lateness, occupying his hands and feeling ready — none of which a description of the beverage reaches, and all of which a competitor could serve differently.",
         cue: "Read what the customer says they get. If your answer is the product name, the job has not been found."},
       2: {tag: "Named the pattern instead of the need", label: "Described the frequency and stopped",
         why: "This choice assumed regularity is the explanation. Repetition is evidence that something is being served well enough to repeat; it does not say what that something is, which is the whole question.",
         cue: "Habit describes how often. It never answers what for."},
       3: {tag: "Substituted price for the job", label: "Explained the choice by cost alone",
         why: "This choice assumed cost decides. Price enters through value, which is benefit against cost, and the benefits the commuter names are speed, something to hold, and readiness — a cheaper stall serving none of those would not win this purchase.",
         cue: "Cost is one side of value. Name the benefit before letting price explain anything."}},
     explanation: "One purchase can stack a functional need, an emotional one and a social one at once, and the commuter names all three without using the words. Naming the product, the frequency or the price answers a different question.",
     link: "People hire a product to make progress, so the job is described by what changes for them."},

    {concept: "spms_chasm", source: "SPMS-M02-L10", node: "Crossing the chasm", mode: "scenario", examOnly: true,
     caselet: "A workflow tool has 300 enthusiastic customers, mostly small technical teams who tolerate rough edges and configure it themselves. Growth has stalled. Interviews with larger non-technical buyers find they want references from firms like their own, a guaranteed uptime figure, and someone to set it up for them.",
     stem: "What should the team do?",
     options: [
       "Pick one narrow segment of those buyers and build the complete offer that segment needs, references included",
       "Keep improving the product for the existing 300, since they are the customers who actually understand it",
       "Market to the whole non-technical buyer population at once so the reference base builds as fast as possible",
       "Raise the price so the product reads as enterprise-grade, which is what the larger buyers are looking for"
     ], answer: 0,
     wrong: {
       1: {tag: "Stayed with the early market", label: "Served the customers who are already served",
         why: "This choice assumed the existing customers are the route forward. They are why the product exists and they are not why it has stalled — the mainstream buyer wants something structurally different, and improving for the 300 does not produce it.",
         cue: "Ask who is not buying and what they said they need. That is the gap, not the current base."},
       2: {tag: "Sprayed across the whole market", label: "Attacked everywhere and dominated nowhere",
         why: "This choice assumed breadth builds references faster. References work because they come from firms like the buyer, so a thin presence across many segments produces no credible reference anywhere — a narrow beachhead is what makes them possible.",
         cue: "A reference is only persuasive to someone who recognises the referee. Concentrate to earn one."},
       3: {tag: "Priced for the signal", label: "Sent a message instead of removing the risk",
         why: "This choice assumed the barrier is perception. The buyers named uptime, references and setup — three concrete forms of risk — and raising the price without addressing them makes the same unproven product more expensive.",
         cue: "Answer what the buyer actually said. Positioning cannot substitute for the whole product they asked for."}},
     explanation: "The mainstream buyer needs a complete offer: the product plus references, reliability and support. Concentrating on one narrow segment is what makes that complete offer achievable and the references credible.",
     link: "Early adopters buy potential; the mainstream buys proof, and proof has to be built for someone specific."},

    {concept: "spms_positioning", source: "SPMS-M03-L02", node: "Product definition and positioning", mode: "scenario", examOnly: true,
     caselet: "A team writes: \"A cloud-native, event-driven ingestion pipeline with pluggable transformation stages and horizontal autoscaling.\" It is used on the website homepage, in the sales deck, and in the engineering backlog.",
     stem: "What is the most defensible criticism?",
     options: [
       "One statement is doing two different jobs, and it is written for the team rather than the buyer",
       "The statement is too technical, and rewriting it in simpler words for all three uses would resolve it",
       "There is nothing wrong: a single consistent description across all channels is what alignment means",
       "It should be shortened, because a homepage cannot carry a sentence of that length effectively"
     ], answer: 0,
     wrong: {
       1: {tag: "Fixed the register and kept the conflation", label: "Simplified one sentence instead of writing two",
         why: "This choice assumed vocabulary is the problem. A simpler single sentence still asks one statement to specify the build and persuade the buyer, and the engineering team genuinely needs the precise version — the fault is that there is one sentence, not that it is hard.",
         cue: "Count the audiences. Two audiences with different needs require two statements."},
       2: {tag: "Read consistency as correctness", label: "Made sameness the goal",
         why: "This choice assumed one description everywhere is alignment. Alignment is the two statements agreeing about the same product; using one text for both simply means one of the two audiences is being handed a document written for the other.",
         cue: "Ask whether both audiences are served. Identical is not the same as aligned."},
       3: {tag: "Made it a length problem", label: "Edited for the page rather than for the reader",
         why: "This choice assumed the sentence is too long for a homepage. A short version of an internal specification is still an internal specification, and the buyer still learns nothing about what changes for them.",
         cue: "Ask what the reader takes away. Length is a symptom when the content is aimed elsewhere."}},
     explanation: "Definition is what the product does and is largely internal, for the team and its partners to build against. Positioning is how it changes things for the user and why they should care. One sentence cannot be both.",
     link: "The internal specification and the buyer's reason to care are different statements about the same product."},

    {concept: "spms_value_pricing", source: "SPMS-M04-L02", node: "Value-based pricing", mode: "scenario", examOnly: true,
     caselet: "A tool cuts a mid-size insurer's claims-handling time by 12,000 staff-hours a year, worth about ₹2.4 crore. Building and running it costs the vendor ₹40 lakh a year. The vendor proposes a price of ₹52 lakh, reached by adding a 30% margin to cost.",
     stem: "What is the most defensible criticism of the pricing?",
     options: [
       "The price is anchored to what the vendor spends rather than to the ₹2.4 crore the customer gains",
       "The 30% margin is too thin for software, and a higher percentage on the same base would fix it",
       "The price is too high, because ₹52 lakh is more than the ₹40 lakh the product actually costs to deliver",
       "Nothing is wrong, since a price that covers cost and leaves a margin is a sustainable price"
     ], answer: 0,
     wrong: {
       1: {tag: "Adjusted the multiplier", label: "Kept the wrong base and changed the number on it",
         why: "This choice assumed the margin percentage is the decision. Any percentage applied to the vendor's own cost still prices the vendor's inputs; with ₹2.4 crore of value on the table, the gap is not closed by moving 30% to 50%.",
         cue: "Ask what the price is a percentage OF. Changing the rate cannot fix the wrong base."},
       2: {tag: "Read margin as overcharging", label: "Compared the price with the cost and stopped",
         why: "This choice assumed cost sets the ceiling. Cost sets a floor below which the vendor loses money; what the price should reflect is the outcome the customer buys, which here is roughly forty-six times the proposed price.",
         cue: "Cost is a floor. The customer's outcome is what sets the range above it."},
       3: {tag: "Accepted sustainability as sufficiency", label: "Confirmed the price would not lose money",
         why: "This choice assumed covering cost makes a price right. It makes it survivable. Pricing on cost when the value is known and large hands the customer the entire gain and leaves the vendor unable to fund the next version.",
         cue: "Ask what the price leaves on the table, not only whether it stays above cost."}},
     explanation: "Cost-based pricing is the fallback for when the deployment and the customer's economics are unknown. Here both are known and quantified, so the price should be set against the ₹2.4 crore of value created.",
     link: "Price what the customer gets. Cost tells you only how low you can go."},

    {concept: "spms_buyer_journey", source: "SPMS-M05-L02", node: "Buyer journey communication", mode: "scenario", examOnly: true,
     caselet: "A first outbound email opens with a feature comparison table against three named competitors and a customer testimonial, and closes by asking the recipient to book a demo. Open rates are healthy; replies are close to zero.",
     stem: "What is the most defensible diagnosis?",
     options: [
       "The message answers questions a buyer only asks later, and never establishes the problem it solves",
       "The email is too long, and cutting it to three sentences would raise the reply rate",
       "The competitor comparison is the error, because naming rivals gives them free attention",
       "The channel is wrong, since outbound email no longer produces replies from any buyer segment"
     ], answer: 0,
     wrong: {
       1: {tag: "Edited for length", label: "Shortened a message aimed at the wrong stage",
         why: "This choice assumed brevity is the fix. A short comparison table is still a comparison table, and a reader who has not yet agreed they have a problem has no use for a shorter answer to a question they are not asking.",
         cue: "Ask what question the message answers, then ask whether the reader is asking it yet."},
       2: {tag: "Objected to the competitors by name", label: "Found a real risk that is not the cause",
         why: "This choice assumed naming rivals is what silences the reply. Comparison belongs in the journey, once the buyer is choosing between options; the failure here is that it arrives before they have decided there is anything to choose.",
         cue: "Sequence before content. The same material can be right later and wrong now."},
       3: {tag: "Blamed the channel", label: "Discarded the medium instead of the message",
         why: "This choice assumed email is the problem. Open rates are healthy, so the message is reaching people and being looked at — what fails is what it says, which no change of channel repairs.",
         cue: "If it is being opened and not answered, the delivery is working and the content is not."}},
     explanation: "Value has to be communicated in the order the buyer moves through: make the problem and the relevant value understandable first, then introduce alternatives and proof as the decision approaches. Arriving with proof first is arriving too early.",
     link: "The right message at the wrong stage reads as noise, however accurate it is."},

    {concept: "spms_requirements", source: "SPMS-M06-L05", node: "Functional and quality requirements", mode: "scenario", examOnly: true,
     caselet: "A specification reads: \"The system shall export a payroll file. The export shall complete within 30 seconds for 5,000 employees. The export shall be available to users with the finance role only.\"",
     stem: "How should these three statements be classified?",
     options: [
       /* Same R3 repair as `sclm_drivers_cla3`. The concept name is three words —
          functional, quality, requirements — and only the answer carried all three,
          so argmax picked it out without anybody reading the clauses. Each distractor
          now names all three too, with its own claim unchanged: 1+1+design decision,
          all-functional, all-quality. */
       "One functional requirement and two quality requirements constraining how well it must be done",
       "Three functional requirements, since each describes something the system must do rather than a quality it must have",
       "One functional requirement, one quality requirement, and one design decision that is not among the requirements",
       "Three quality requirements, because none of them is functional and all constrain the finished system"
     ], answer: 0,
     wrong: {
       1: {tag: "Called every clause functional", label: "Counted sentences rather than kinds",
         why: "This choice assumed anything written as \"shall\" is a function. The first names a capability; the other two constrain how well and under what conditions that capability must work, which is a different kind of requirement and is usually where a system is judged.",
         cue: "Ask whether the clause adds a capability or constrains one. Only the first kind is functional."},
       2: {tag: "Demoted a constraint to a design choice", label: "Confused a requirement with an implementation",
         why: "This choice assumed access restriction is a design decision. Restricting the export to a role is a security constraint on the capability — a requirement the system must satisfy; how it is implemented is the design decision that follows.",
         cue: "Separate what must hold from how it will be achieved. The first is a requirement whoever builds it."},
       3: {tag: "Called every clause a quality", label: "Removed the capability from the specification",
         why: "This choice assumed all three constrain. If none of them were functional, nothing here would say what the system does — the first statement is the capability the other two are about.",
         cue: "A set of constraints needs something to constrain. Find the capability first."}},
     explanation: "Functional requirements say what the system does; quality requirements — performance, security, availability — say how well and under what conditions. The 30-second bound and the role restriction constrain the export the first statement introduces.",
     link: "Systems are usually accepted or rejected on the qualities, and specified mostly on the functions."},

    {concept: "spms_priority", source: "SPMS-M07-L01", node: "MoSCoW and RICE prioritisation", mode: "scenario", examOnly: true,
     caselet: "A release has capacity for six items. A regulator has mandated an audit log for the same date. Every one of the eleven candidate items has been marked Must have by the stakeholder who proposed it, and no item is marked Won't have.",
     stem: "What is the most defensible criticism of this prioritisation?",
     options: [
       "Marking everything Must have removes the method's only output, and refusing to name any Won't have is what allows it",
       "The regulator's audit log should be ranked alongside the others, since a scoring method treats all items alike",
       "The problem is that eleven items is too many to score, and the list should be cut before prioritising",
       "Nothing is wrong, since the stakeholders are closest to their own items and know their true importance"
     ], answer: 0,
     wrong: {
       1: {tag: "Scored a non-negotiable", label: "Compared something that cannot lose",
         why: "This choice assumed everything belongs in the same comparison. A mandated capability with a fixed date is not competing for a slot — it is a constraint on the release, and scoring it invites a result that says not to do it.",
         cue: "Separate what is required from what is chosen. Only the second is ranked."},
       2: {tag: "Made it a volume problem", label: "Shortened the list instead of sorting it",
         why: "This choice assumed eleven is too many. Eleven against six capacity is an ordinary prioritisation problem, and cutting the list before applying a method is prioritising by whoever wields the pen.",
         cue: "The method exists for exactly this. Cutting first replaces it with an unstated one."},
       3: {tag: "Deferred to the proposer", label: "Treated ownership as evidence of priority",
         why: "This choice assumed proximity settles importance. Everyone is closest to their own item, which is why every item is marked Must have — a method that returns whatever the proposer already believed has added nothing.",
         cue: "Ask what the method changed. If the answer is nothing, it was not applied."}},
     explanation: "The method sorts necessity, and it only works if the categories are used: naming what will not be done is what makes the ordering real. A regulatory mandate is a constraint on the release rather than a candidate within it.",
     link: "A prioritisation that ranks nothing below the line has not prioritised."},

    {concept: "spms_privacy", source: "SPMS-M08-L03", node: "Privacy by design", mode: "scenario", examOnly: true,
     caselet: "A fitness product plans to collect location traces continuously so that a route-suggestion feature can be built later. There is no route feature yet. Users are asked to accept a privacy policy at signup that mentions location among fourteen other categories, and the data will be processed by a vendor outside the company.",
     stem: "What is the most defensible criticism?",
     options: [
       "Data is being collected for a purpose that does not yet exist, under a consent that does not identify it, and passed to a vendor whose handling has not been established",
       "The privacy policy needs to be shorter, so that users can reasonably read all fifteen categories before accepting, after which the collection described in it becomes properly consented",
       "Location data should never be collected by a fitness product under any circumstances, since the category is sensitive enough that no purpose could justify holding it",
       "The plan is acceptable, since the user has accepted a policy that does mention location collection, and consent given at signup covers whatever is later built from the data"
     ], answer: 0,
     wrong: {
       1: {tag: "Made it a readability problem", label: "Improved the notice and kept the practice",
         why: "This choice assumed the fault is comprehension. A shorter notice still asks consent for a purpose nobody has defined, and still leaves the vendor unchecked — the collection is what needs justifying, not the prose describing it.",
         cue: "Ask whether the practice would be defensible if the notice were perfectly clear."},
       2: {tag: "Banned the category", label: "Replaced a purpose test with a blanket rule",
         why: "This choice assumed location is impermissible. A route feature is a legitimate purpose for location data; what is missing is that the purpose exists, is stated, and is limited to what it needs.",
         cue: "Judge the purpose and the limits, not the data type."},
       3: {tag: "Accepted consent as sufficient", label: "Treated acceptance as the whole obligation",
         why: "This choice assumed a signed policy settles it. Consent is one requirement among several: collection has to be limited to a stated purpose, protection has to be built in rather than requested, and a processor's handling remains the controller's responsibility.",
         cue: "Ask what else is owed beyond consent. Acceptance does not transfer the other duties."}},
     explanation: "Collection should be limited to a stated purpose, protection built in by default rather than on request, and a third-party processor's compliance verified before data reaches it. Collecting now for a feature that may never exist fails the first of those.",
     link: "Protection is a design decision taken before collection, not a setting offered afterwards."}
  ];


  /* BRGSA's two remaining concepts. Its Section C slice is reserved and its Section A
     had none, so `brgsa_m3_cohort` and `brgsa_m6_churn` were the last two concepts on
     any paper with no examiner surface a learner could not have met. */
  var BRGSA_EXAM_ONLY = [
    {concept: "brgsa_m3_cohort", source: "BRGSA-M03-L01", node: "Cohorts and retention", mode: "scenario", examOnly: true,
     caselet: "A subscription product reports that overall month-3 retention has held at 38% for a year, and the team is treating the product as stable. Split by signup month, the January cohort retained 47% at month three, April 39%, July 33% and October 28%. Monthly signups have roughly tripled over the same year.",
     stem: "What is the most defensible reading?",
     options: [
       "Each new cohort is retaining worse than the one before it, and rising signup volume is holding the blended figure flat",
       "Retention is stable, since the aggregate figure has not moved across a full year of trading and that is the measure of the product",
       "The October cohort is simply too young to judge, so the fall is an artefact of measuring groups at different ages",
       "Signups tripling is the finding, and the retention split is a consequence of serving a larger and more varied market than before"
     ], answer: 0,
     wrong: {
       1: {tag: "Read the blend as the truth", label: "Trusted an aggregate that volume is propping up",
         why: "This choice assumed a flat overall number means nothing is changing. The aggregate mixes cohorts of different ages and different sizes, so tripling the newest and worst cohorts can hold the blend still while every individual group performs worse than the last.",
         cue: "A stable blended figure over rising volume is the classic place a decline hides. Split it before believing it."},
       2: {tag: "Dismissed the comparison as unfair", label: "Objected to a comparison that was already at equal age",
         why: "This choice assumed the cohorts are being compared at different points in their life. They are not — every figure quoted is month-three retention, which is the whole point of reading cohorts at equal age.",
         cue: "Check what age each figure is measured at. If they match, the comparison is valid."},
       3: {tag: "Explained the decline away by mix", label: "Used growth to excuse the pattern it produced",
         why: "This choice assumed a broader market accounts for the fall. It may be part of the cause, and it is not a reason to stop: six months of monotonic decline means each cohort is worth less than the last, which is a finding about acquisition quality rather than a reason to accept it.",
         cue: "A cause is not a defence. Ask what the pattern means for the value of the next cohort."}},
     explanation: "Read at equal age, retention has fallen from 47% to 28% across four consecutive cohorts. The aggregate is flat only because the newest and weakest cohorts are also the largest, which is exactly what a blended figure conceals.",
     link: "Cohorts are read at equal age because an aggregate mixes groups of different ages and different sizes."},

    {concept: "brgsa_m6_churn", source: "BRGSA-M06-L05", node: "Referral and network effects", mode: "scenario", examOnly: true,
     caselet: "A B2B tool loses 4% of accounts a month. Exit interviews with 30 leavers find 19 never completed the initial data import, 7 left when their internal champion changed job, and 4 said a competitor was cheaper. The team is preparing a discount offer for accounts showing low usage.",
     stem: "What should the team do instead?",
     options: [
       "Fix the import and build a second contact inside each account, since price explains four of thirty departures",
       "Proceed with the discount, because price is the only cause a company can act on directly and quickly",
       "Survey the remaining accounts before acting, since thirty interviews is too small a base for any decision",
       "Accept 4% as the market rate for this category and concentrate the effort on winning replacement accounts"
     ], answer: 0,
     wrong: {
       1: {tag: "Acted on the smallest cause", label: "Chose the lever that was easiest to pull",
         why: "This choice assumed price is where a company can act. Four of thirty left over price and twenty-six left for reasons the team controls more directly than pricing — a discount pays every remaining account to fix a cause behind 13% of the departures.",
         cue: "Rank the causes by size before choosing a response. Ease of action is not evidence."},
       2: {tag: "Deferred on sample size", label: "Waited for precision the decision does not need",
         why: "This choice assumed thirty is too few. Nineteen of thirty pointing at one specific step is not a marginal signal needing tighter confidence intervals, and the cost of the delay is another month at 4%.",
         cue: "Ask whether more data would change the action. If the largest cause is unambiguous, it would not."},
       3: {tag: "Naturalised the churn", label: "Treated a diagnosed cause as a market condition",
         why: "This choice assumed the rate is structural. The interviews have already located most of it in an incomplete onboarding step, which is a product problem with a known fix, and replacing accounts that will churn for the same reason refills the same leak.",
         cue: "A rate with a named cause is not a market rate. Ask what the leavers actually said."}},
     explanation: "Nineteen of thirty never reached first value, and seven were lost with a single relationship. Both are addressable, and both are larger than price — a discount would spend money on the cause behind four departures.",
     link: "Churn is diagnosed before it is priced; the reason people leave is rarely the reason it is cheapest to address."}
  ];

  var COURSE_ASSESSMENT_ITEMS = {SCLM: [
    /* ---- Module 1 ---------------------------------------------------- */
    {concept: "sclm_fit", source: "SCLM-M01-L04", node: "Strategic fit", mode: "definition",
     stem: "What raises the implied demand uncertainty a supply chain has to absorb?",
     options: [
       "Shorter lead times, wider variety, more channels, higher service levels and faster innovation all raise it.",
       "Only the variability of the underlying demand raises it, since the promise made about it is a marketing matter.",
       "Nothing raises it except a forecast error large enough to cause a stockout in the current period.",
       "It rises when suppliers are chosen on price rather than on reliability, and falls again when they are not."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Confused demand variation with implied uncertainty", label: "Read the demand, not the promise",
           why: "Implied demand uncertainty is the uncertainty the chain faces because of the promise it made, not how variable demand is. A product with perfectly stable demand still creates high implied uncertainty if you promise it in two hours.",
           cue: "Ask what was promised before asking how demand moves. The promise is what the chain has to absorb."},
       2: {tag: "Treated uncertainty as an outcome", label: "Named a consequence as the cause",
           why: "A stockout is one of the things high implied uncertainty makes likelier — higher forecast error, more stockouts, more markdowns. It is downstream of the uncertainty, not what creates it.",
           cue: "Separate what raises the uncertainty from what the uncertainty then costs you."},
       3: {tag: "Substituted a driver decision", label: "Named a sourcing choice instead",
           why: "Choosing suppliers on price is a sourcing decision that sets where the chain sits between efficiency and responsiveness. It changes what the chain can absorb, not how much the promise asks it to absorb.",
           cue: "Implied uncertainty is set by the customer promise. Driver choices decide whether you can meet it."}
     },
     explanation: "Implied demand uncertainty is the uncertainty the supply chain must absorb because of the promise it made. Shorter lead times, higher variety, more channels, higher service levels and faster innovation all raise it, which is why a stable-demand product promised in two hours still needs responsiveness.",
     link: "The level of implied uncertainty is what decides whether responsiveness or efficiency is the right design, so it is read first."},

    {concept: "sclm_fit", source: "SCLM-M01-L04", node: "Strategic fit", mode: "scenario",
     caselet: "A value retailer promises low prices and dependable availability on a stable range of staples. Its distribution runs on full truckloads, long production batches and suppliers selected mainly on landed cost. A new leadership team wants to add two-hour delivery in eight cities without changing sourcing, transport or the range.",
     stem: "What does this proposal do to the retailer's strategic fit?",
     options: [
       "It leaves fit intact, because the range and the suppliers are unchanged and the promise is what customers judge.",
       "It improves fit, since faster service is a stronger customer promise than dependable availability at a low price.",
       "It breaks fit, because a two-hour promise raises implied uncertainty while the chain is still built for efficiency.",
       "It has no bearing on fit, which is decided by the competitive strategy on its own rather than by the chain."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Held the chain constant and the promise variable", label: "Changed the promise and called the chain unaffected",
           why: "The promise is exactly what the chain has to be built for. Changing it while holding sourcing, transport and range fixed is what a loss of fit is; the unchanged half is the problem, not the reassurance.",
           cue: "When one of the two halves moves, check the other. Fit is a relation, not a property of either side."},
       1: {tag: "Ranked promises instead of matching them", label: "Treated one promise as better than another",
           why: "There is no ranking of customer promises in this framework. A value retailer promising low prices and availability can be in perfect fit; the question is whether the chain is built for the promise, not which promise is superior.",
           cue: "The framework never asks which promise is better. It asks whether this chain matches this promise."},
       3: {tag: "Dropped the supply chain side", label: "Made fit a property of strategy alone",
           why: "Fit is alignment between the competitive strategy and the supply chain strategy. A competitive strategy on its own cannot be in or out of fit — there is nothing for it to be aligned with.",
           cue: "Name both sides before judging fit. If you have only named one, you have not tested anything."}
     },
     explanation: "A two-hour promise shortens lead times sharply, which raises implied demand uncertainty. Full truckloads, long batches and price-selected suppliers are efficiency choices that suit low implied uncertainty. The chain would then be optimised for a different promise than the one being sold, which is what a loss of fit looks like from the inside.",
     link: "The repair is either to rebuild distribution and sourcing for the promised responsiveness, or to change the promise."},

    {concept: "sclm_drivers", source: "SCLM-M01-L06", node: "Six supply-chain drivers", mode: "definition",
     stem: "Why is pricing treated as a supply chain driver rather than only as a marketing decision?",
     options: [
       "Because a lower price reduces the cost of goods sold and therefore the cost the chain has to carry.",
       "Because it shapes when demand arrives, so it changes volumes and replenishment needs the chain must serve.",
       "Because prices are set by the cost of transportation and facilities rather than by what customers will pay.",
       "Because discounting is the fastest way to clear inventory once a facility decision has gone wrong."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Confused price with cost", label: "Read the price as an input cost",
           why: "Price is what the firm charges, not what it pays. Lowering it does not reduce the cost of goods sold; it changes revenue and, more importantly here, the timing and size of demand.",
           cue: "Ask which side of the transaction the number sits on before reasoning about it."},
       2: {tag: "Reversed the direction", label: "Made cost set the price",
           why: "The claim runs backwards. Pricing is a driver because of what it does to demand timing, not because transport and facility costs determine it — and cost-plus pricing is not what the lecture describes.",
           cue: "A driver is a lever the manager pulls. Ask what pulling it changes, not what set it."},
       3: {tag: "Named a symptom", label: "Reduced pricing to a clearance tactic",
           why: "Clearing stock with a discount is one use of price, but it does not explain why pricing is one of the six. Pricing express delivery higher sorts customers by what they value, and a promotion is a supply chain event that moves volumes and replenishment.",
           cue: "Ask what the lever does routinely, not what it can rescue occasionally."}
     },
     explanation: "Pricing is one of the six drivers because it shapes when demand arrives. Pricing express delivery higher sorts customers by what they value; a promotion is a supply chain event that changes volumes and replenishment needs. Facilities, inventory, transportation, information, sourcing and pricing together set the balance between responsiveness and efficiency.",
     link: "Information is often the largest driver because it improves every other one, and pricing is the one most often left out of the list."},

    {concept: "sclm_drivers", source: "SCLM-M01-L06", node: "Six supply-chain drivers", mode: "judgement",
     caselet: "A grocery chain cuts inventory hard across its regional warehouses to release working capital. Six weeks later, working capital is down as planned and lost sales have risen sharply in the same regions.",
     stem: "Which reading of this outcome is most defensible?",
     options: [
       "The inventory reduction was executed badly; the same cut done properly would have released capital without lost sales.",
       "The inventory driver was moved without moving the transport and information that would let replenishment keep up.",
       "The lost sales are a forecasting failure, because the cut would have been safe against a more accurate forecast.",
       "Inventory should be raised back to its previous level, since the trial shows this chain cannot run on less stock."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Blamed execution for a structural trade", label: "Called an expected trade-off an implementation fault",
           why: "The drivers interact, so a decision on one usually forces a change in at least one other. Cutting inventory improves working capital and raises lost sales unless transport and information can replenish faster. That is the trade, not a botched rollout.",
           cue: "Before blaming execution, ask which second driver the first one was going to move."},
       2: {tag: "Reached for forecasting", label: "Explained a driver interaction as forecast error",
           why: "A better forecast would help, but the mechanism here is that cover was removed without shortening replenishment. Attributing it to forecasting skips the driver that actually changed.",
           cue: "Name the lever that moved before naming the analysis that might have softened it."},
       3: {tag: "Reverted instead of rebalancing", label: "Undid the decision rather than completing it",
           why: "Restoring stock returns to the original position and learns nothing. The framework's point is that the right combination depends on the competitive strategy and the uncertainty faced, so the useful move is to pair the inventory cut with faster transport or better information.",
           cue: "A driver decision is a set, not a single dial. Ask what has to move with it, not whether to move it back."}
     },
     explanation: "Cutting inventory improves working capital, but lost sales rise unless transportation and information can replenish faster. The drivers interact, so a decision on one usually forces a change in at least one other, and there is no best combination in general — the right one depends on the competitive strategy and the uncertainty being faced.",
     link: "Information is often the largest driver precisely because it is what lets the others be set more aggressively."},

    /* ---- Module 2 ---------------------------------------------------- */
    {concept: "sclm_smoothing", source: "SCLM-M02-L06", node: "Exponential smoothing", mode: "definition",
     stem: "In exponential smoothing, what is the smoothing constant actually deciding?",
     options: [
       "How many past periods are averaged before the mean of that window is taken as the next forecast.",
       "The proportion of the last forecast error carried into the next forecast, so every forecast is the previous one corrected.",
       "The width of the tolerance band inside which a forecast counts as having been accurate.",
       "How far ahead the forecast can be projected before it must be recalculated from scratch."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Substituted a moving average", label: "Described a different method",
           why: "A moving average is built from a window of past actuals. Exponential smoothing never re-forecasts from scratch: it takes the previous forecast and corrects it by part of its own error.",
           cue: "Look for the previous forecast in the formula. If your method does not use it, it is not this one."},
       2: {tag: "Confused alpha with a tolerance", label: "Read the constant as an accuracy threshold",
           why: "Alpha is a proportion applied to the error, not a band around the answer. It decides how much of the miss is carried forward, which is a responsiveness choice.",
           cue: "Alpha multiplies the error. A tolerance would be compared with it."},
       3: {tag: "Confused alpha with a horizon", label: "Read the constant as a forecast horizon",
           why: "Nothing in Ft = Ft−1 + α(At−1 − Ft−1) refers to how far ahead you are forecasting. Alpha decides how much of the last error to absorb, period by period.",
           cue: "Read what alpha is multiplied by. It is the error term, not a time index."}
     },
     explanation: "Ft = Ft−1 + α(At−1 − Ft−1). Every forecast is the previous forecast plus a proportion of the error it made. Alpha is that proportion, which makes it a choice about responsiveness: a high alpha chases recent actuals and reacts fast to a real shift and to noise, a low alpha stays smooth and is slow to notice a genuine change.",
     link: "Because alpha is a judgement about why demand moves, the same data can justify two different forecasts."},

    {concept: "sclm_smoothing", source: "SCLM-M02-L06", node: "Exponential smoothing", mode: "numeric",
     caselet: "A depot forecast 500 units for last month. Actual demand came in at 560. The smoothing constant in use is 0.25.",
     stem: "What is this month's forecast?",
     options: ["485 units", "515 units", "530 units", "560 units"],
     answer: 1,
     wrong: {
       0: {tag: "Subtracted the correction", label: "Moved the forecast away from the error",
           why: "Actual demand came in above the forecast, so the error is positive and the next forecast has to move up towards it. 500 + 0.25 × (560 − 500) = 515.",
           cue: "Check the direction before the arithmetic. Actual above forecast means the new forecast rises."},
       2: {tag: "Halved the gap", label: "Used an alpha the stem did not give",
           why: "530 is 500 plus half the 60-unit error, which is alpha = 0.5. The stem gives 0.25, so only a quarter of the miss is carried forward.",
           cue: "Substitute the stated alpha rather than the one the gap looks like it wants."},
       3: {tag: "Used the actual as the forecast", label: "Let last month's outcome become the prediction",
           why: "Taking the actual is exponential smoothing with alpha set to 1, which carries the whole error — including all the noise — into the next period.",
           cue: "If your answer equals the actual, you have used alpha = 1 whatever the question stated."}
     },
     explanation: "Ft = Ft−1 + α(At−1 − Ft−1) = 500 + 0.25 × (560 − 500) = 500 + 15 = 515 units. Ft−1 is the previous forecast, not the previous actual; reversing the two is the error the arithmetic will never reveal.",
     link: "A quarter of the miss is carried forward because alpha is a deliberate choice about how much of a surprise to believe."},

    {concept: "sclm_sop", source: "SCLM-M02-L12", node: "Sales and operations planning", mode: "definition",
     stem: "Which lever separates a chase strategy from a level strategy in aggregate planning?",
     options: [
       "Chase varies capacity to follow demand; level holds production steady and lets inventory absorb the swings.",
       "Chase plans over a shorter horizon than level, which is why it is used for seasonal products.",
       "Chase is used by service firms and level by manufacturers, which is the whole of the distinction.",
       "Chase relies on subcontracting while level relies on overtime, and neither uses inventory as a buffer."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Confused strategy with horizon", label: "Made the difference a matter of timing",
           why: "Both strategies plan across the same 3-to-18-month aggregate horizon. What separates them is which buffer absorbs the mismatch — capacity for chase, inventory for level.",
           cue: "Ask which lever moves, not how far ahead the plan runs."},
       2: {tag: "Turned a tendency into the definition", label: "Read an example as the rule",
           why: "Services often suit chase and commodities often suit level, but that is a consequence of which buffer is cheap in each setting, not the definition. Most real firms run a hybrid.",
           cue: "An industry is where a strategy tends to fit. It is not what the strategy is."},
       3: {tag: "Mixed up the levers", label: "Assigned both strategies to capacity",
           why: "Subcontracting and overtime are both capacity moves, so this describes two versions of chase. Level's defining move is holding production and workforce steady while stock or backlog absorbs the swings.",
           cue: "If both halves of your answer change capacity, you have not found the level strategy."}
     },
     explanation: "Chase uses capacity — hiring, shifts, overtime, subcontracting — so production follows demand. Flexibility uses utilisation, holding installed capacity steady while hours vary. Level uses inventory: production and workforce stay steady and stock or backlog absorbs the swings. Which fits is a question about which buffer is cheap in that industry.",
     link: "Level is dangerous in fashion or short-life electronics, where the inventory buffer obsoletes or forces markdowns."},

    {concept: "sclm_sop", source: "SCLM-M02-L12", node: "Sales and operations planning", mode: "scenario",
     caselet: "Ahead of the festive season a packaged food brand's marketing team plans a large promotion, operations plans stable production to avoid overtime, procurement plans a bulk packaging buy, and finance plans to hold working capital down. Each plan is signed off inside its own function.",
     stem: "What is the failure this situation describes?",
     options: [
       "One of the four functions has misread the demand forecast, and the other three are correct exactly as they stand.",
       "The promotion should be cancelled, because a supply chain cannot support a demand spike it did not create.",
       "Every function is right on its own terms, and the firm has four defensible plans where it needs one agreed plan.",
       "Working capital targets should always outrank promotional plans, since inventory is the most expensive buffer."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Looked for a wrong function", label: "Assumed one plan must be the error",
           why: "Nothing in the four plans is a mistake. The promotion is genuine revenue, stable production genuinely is cheaper, bulk buying genuinely lowers unit cost and lower working capital genuinely is healthier. The failure is that they were made separately.",
           cue: "When every plan defends itself, stop looking for the wrong one and look for the missing agreement."},
       1: {tag: "Removed the conflict instead of resolving it", label: "Cancelled the demand rather than planning for it",
           why: "S&OP exists to answer what promotion can be supported without breaking service levels, not to rule promotions out. The output is one committed plan checked against real capacity and supply constraints.",
           cue: "Ask what size of promotion the chain can carry before asking whether to run one."},
       3: {tag: "Ranked the functions", label: "Made one function's objective the tie-breaker",
           why: "Standing rules about which function wins reproduce the problem one level up. S&OP aligns the demand plan, the supply plan and the financial plan into one answer rather than deciding in advance whose number matters most.",
           cue: "A cross-functional process is not a hierarchy. Look for the shared plan, not the senior objective."}
     },
     explanation: "S&OP is a cross-functional process, not a meeting. Without it each function optimises its own objective and the chain wins on one metric while losing on another. Every plan here is right on its own terms, which is exactly why four defensible plans are worse than one agreed plan checked for feasibility against real capacity and supply constraints.",
     link: "The output is a single committed demand, supply and financial plan, which is what makes the promotion size a decision rather than a surprise."},

    /* ---- Module 3 ---------------------------------------------------- */
    {concept: "sclm_eoq", source: "SCLM-M03-L03", node: "Economic order quantity", mode: "numeric",
     caselet: "A retailer sells 8,000 units of a stable line each year. Placing an order costs ₹250 whatever its size, and holding one unit for a year costs ₹10.",
     stem: "What order quantity minimises the total of ordering and holding cost?",
     options: ["283 units", "400 units", "632 units", "800 units"],
     answer: 2,
     wrong: {
       0: {tag: "Dropped the 2 under the root", label: "Left the factor of 2 out of the formula",
           why: "283 is the root of D·K/h. The 2 comes from average cycle stock being Q/2 rather than Q — you hold half an order on average across the cycle, not all of it.",
           cue: "The 2 is not decoration. Leaving it out makes the answer low by a factor of about 1.41."},
       1: {tag: "Divided demand by a round number", label: "Chose a convenient order size",
           why: "400 is a tenth of annual demand, which is a reasonable-looking policy and not the one that minimises cost. EOQ is fixed by D, K and h together, not by a round number of orders.",
           cue: "Substitute into √(2DK/h) rather than reasoning about how many orders feel right."},
       3: {tag: "Swapped the ordering and holding costs", label: "Put the costs in the wrong places",
           why: "Using ₹10 as the ordering cost and ₹250 as the holding cost gives 800. K and h are told apart by their units: K is currency per order, charged once however large the order; h is currency per unit per year.",
           cue: "Read the units before substituting. Per order and per unit per year cannot swap places."}
     },
     explanation: "EOQ = √(2DK/h) = √(2 × 8,000 × 250 ÷ 10) = √400,000 ≈ 632 units. The purchase cost drops out because it contains no Q at all, so it cannot affect which order quantity is cheapest.",
     link: "The order size fixes how often you reorder, which is what the reorder-point decision is then built on."},

    {concept: "sclm_eoq", source: "SCLM-M03-L03", node: "Economic order quantity", mode: "judgement",
     caselet: "A stem gives annual demand, a figure of ₹90 described as a cost, and a second figure of ₹4 also described as a cost.",
     stem: "How should the two cost figures be assigned to K and h?",
     options: [
       "The larger figure is always the ordering cost, since a fixed charge levied per order exceeds the cost of holding a single unit for a year.",
       "Only the units separate them: currency per order is K, currency per unit per year is h, and the size of the figure decides nothing.",
       "Assign them either way and take whichever assignment produces the smaller order quantity, which is the safer policy.",
       "The figure quoted first is K, because a stem states the fixed cost before the variable one."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Used magnitude as the test", label: "Sorted the costs by size",
           why: "Nothing fixes the relative size of an ordering cost and a unit-year holding cost; they measure different things. Both figures in an EOQ stem are costs, and only their units say which is which.",
           cue: "A rule about which number is bigger is a rule about this stem, not about the formula."},
       2: {tag: "Chose by outcome", label: "Picked the assignment with the answer you preferred",
           why: "Swapping K and h changes the answer without producing anything that looks wrong, which is exactly why it has to be settled from the units rather than from the result. A smaller order quantity is not automatically safer either.",
           cue: "Fix the mapping before computing. An answer cannot validate the assumption that produced it."},
       3: {tag: "Used stem order as the test", label: "Read the sequence as the assignment",
           why: "There is no convention about which cost a stem states first, and a real question will vary it. The unit is the only reliable signal.",
           cue: "Read the unit attached to the number, not its position in the sentence."}
     },
     explanation: "D is annual demand in units per year, K is the fixed ordering cost in currency per order charged once regardless of size, and h is the annual holding cost in currency per unit per year, often modelled as i·C. Two of these are 'cost' and a stem will give you both; only the unit tells you which is which, which is where marks are actually lost.",
     link: "Mapping before computing is the same discipline the newsvendor stem needs, where every clause is doing classification work."},

    {concept: "sclm_newsvendor", source: "SCLM-M03-L05", node: "Newsvendor decision", mode: "definition",
     stem: "What does the critical ratio tell you, and what range can it take?",
     options: [
       "It is the ratio of underage to overage cost, and it rises without limit as margins improve.",
       "It is the share of expected demand that has to be met to break even, and it lies somewhere between the unit cost and the selling price.",
       "It is a share of total mismatch cost, so it always lies between 0 and 1 and sets how far up the demand distribution to order.",
       "It is the probability that a season sells out, which is estimated from last season's actual sales."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Took the ratio of the two costs", label: "Compared the costs instead of taking a share",
           why: "Cu ÷ Co can exceed 1, and a value above 1 cannot be a position in a demand distribution. The critical ratio is Cu ÷ (Cu + Co) — a share of the total mismatch cost.",
           cue: "The critical ratio is a probability. Anything outside 0 to 1 is the wrong construction."},
       1: {tag: "Confused it with break-even", label: "Read the ratio as a volume target",
           why: "Break-even is about covering fixed cost with contribution. The critical ratio is built from underage and overage and answers a different question: how far up the demand distribution to order given one buying opportunity.",
           cue: "Ask what the ratio is made of. If it is not Cu and Co, it is not the critical ratio."},
       3: {tag: "Confused it with an estimate", label: "Treated the ratio as an observation",
           why: "The ratio is computed from costs, not estimated from history. Past sales inform the demand distribution the ratio is then applied to, which is a separate input.",
           cue: "Separate the ratio from the distribution it is used against."}
     },
     explanation: "Underage is Cu = P − C, the margin lost on a sale you could not fulfil. Overage is cost less salvage, what you lose on a unit that does not sell. The critical ratio is Cu ÷ (Cu + Co), a share of total mismatch cost, so it always falls between 0 and 1 and sets how far up the demand distribution to order.",
     link: "High underage relative to overage means stockouts hurt more than leftovers, so you order generously; the reverse means you order cautiously."},

    {concept: "sclm_newsvendor", source: "SCLM-M03-L05", node: "Newsvendor decision", mode: "scenario",
     caselet: "A buyer places one pre-season order for a printed festive range. Demand for the print is uncertain, there is no chance to reorder once the season starts, and unsold stock is cleared at well below cost afterwards.",
     stem: "Which model does this description specify, and which clause settles it?",
     options: [
       "Economic order quantity, settled by the fact that stock is being ordered in a batch rather than continuously.",
       "Exponential smoothing, settled by the uncertainty in demand, which is what a forecast exists to handle.",
       "Aggregate planning, settled by the seasonal pattern, which is what a chase, flexibility or level strategy is chosen against each season.",
       "The newsvendor model, settled by there being one buying opportunity with no replenishment and a salvage value below cost."
     ],
     answer: 3,
     wrong: {
       0: {tag: "Reached for EOQ", label: "Applied a repeating-order model to a single order",
           why: "EOQ answers how much to order at a time when demand is steady and orders repeat. Here nothing repeats, so there is no ordering-cost-versus-holding-cost trade to make.",
           cue: "EOQ needs a repeating order. One buying opportunity rules it out before any arithmetic."},
       1: {tag: "Named a forecasting method", label: "Answered the demand question instead of the decision",
           why: "Smoothing produces a demand estimate; it does not say how much to order under a one-shot decision with salvage. The uncertain demand is an input to the newsvendor decision, not the model itself.",
           cue: "Ask whether the method outputs a quantity to order or a number to expect."},
       2: {tag: "Matched on seasonality", label: "Classified by the season rather than the structure",
           why: "Aggregate planning sets capacity, production and inventory across a 3-to-18-month horizon. It does not answer how many units of one uncertain-demand item to buy when there is a single order.",
           cue: "Seasonality appears in several models. Classify on the ordering structure instead."}
     },
     explanation: "One buying opportunity means single period; uncertain demand means no fixed D; clearing below cost means leftover units have a salvage value under cost. That is the newsvendor signature, so the move is to build Cu and the overage cost and take the critical ratio.",
     link: "Every clause in a stem like this is doing classification work, and reading them as scene-setting is how the wrong model gets applied."},

    /* ---- Module 4 ---------------------------------------------------- */
    {concept: "sclm_portfolio", source: "SCLM-M04-L04", node: "Tailored sourcing portfolio", mode: "scenario",
     caselet: "A components buyer supplies two lines. Line A is a mature part with high volume and stable weekly demand. Line B is a new variant with uncertain demand and frequent design changes. The buyer wants to consolidate both onto one offshore supplier to simplify management.",
     stem: "What does tailored sourcing say about that consolidation?",
     options: [
       "Consolidation is right, because a single supplier operating at scale lowers unit cost on both lines and simplifies coordination for the buying team.",
       "Split them, because no single supplier suits every product: A fits a low-cost source and B needs a responsive one.",
       "Move both onshore instead, since offshore sourcing is unsuitable wherever design changes are expected at all.",
       "Keep both offshore but hold extra inventory of each, which covers the lead time without changing supplier."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Optimised for management simplicity", label: "Bought coordination with responsiveness",
           why: "Consolidation does lower coordination effort and often unit cost. It also puts a variant with uncertain demand and frequent design changes on a long lead time with no engineering support nearby, which is what tailored sourcing exists to avoid.",
           cue: "Ask what each product needs before asking what the buyer would prefer to manage."},
       2: {tag: "Turned a factor into a ban", label: "Made offshore wrong in general",
           why: "The lecture is explicit that this is not a rule that offshore is good or bad. An innovative product can be offshored if the firm modularises the design, freezes interfaces early and keeps final differentiation near the market.",
           cue: "Align the choice with uncertainty, lead time and the cost of being wrong, rather than with a standing preference."},
       3: {tag: "Hedged with the wrong instrument", label: "Used inventory against a design risk",
           why: "Inventory is the simpler hedge for stable, low-value items that do not go obsolete. A variant with frequent design changes obsoletes exactly the stock being held, so the hedge does not match the risk.",
           cue: "Match the hedge to the risk type: inventory for stable items, a second source for supply risk, contracts for price risk."}
     },
     explanation: "Tailored sourcing deliberately combines supplier types because different products need different strengths. A stable, mature, predictable line suits a low-cost source, possibly offshore, on long runs. A volatile line with frequent design changes suits a responsive source, onshore or nearshore, with smaller lots and more engineering support.",
     link: "The same logic decides the hedge: multiple sourcing, inventory and contracts each cover a different kind of sourcing risk."},

    {concept: "sclm_portfolio", source: "SCLM-M04-L04", node: "Tailored sourcing portfolio", mode: "judgement",
     stem: "A firm qualifies a second supplier as a backup but routes no volume to it. What is the most likely consequence?",
     options: [
       "The backup stops investing and drifts out of qualification, so the hedge is weaker than the paperwork suggests.",
       "The backup becomes cheaper over time, since it competes for the volume it is not currently receiving.",
       "Sourcing risk is fully removed, because a qualified supplier can be activated whenever the primary fails.",
       "Procurement cost falls immediately, as the primary supplier lowers its price against a visible alternative."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Assumed competitive pressure without volume", label: "Expected a supplier to compete for nothing",
           why: "Competition needs something to win. A supplier receiving no volume and no prospect of it has little reason to hold price, and multiple sourcing carries qualification and coordination cost regardless.",
           cue: "Ask what the second supplier is actually being paid to do before predicting how it will behave."},
       2: {tag: "Treated a hedge as removal", label: "Read a backup as the elimination of risk",
           why: "Multiple sourcing reduces sourcing risk; it does not remove it, and it is not free — qualification cost, coordination cost and possibly higher unit cost all apply. A backup that has not run recently may not be usable when it is needed.",
           cue: "A hedge changes the size of a loss. It rarely removes the exposure."},
       3: {tag: "Claimed an unearned saving", label: "Assumed leverage from an unused alternative",
           why: "A price concession is possible but is not what the lecture identifies as the consequence to plan for. The named cost is that a backup receiving no volume will not invest or stay qualified.",
           cue: "Ask what happens to the hedge itself, not what it might extract from the incumbent."}
     },
     explanation: "Multiple sourcing gives you a backup, but it is not free: qualification cost, coordination cost, possibly higher unit cost, and a backup that receives no volume will not invest or stay qualified. The hedge has to be maintained to remain a hedge.",
     link: "Where the risk is obsolescence-free and low value, inventory is the simpler hedge; where it is price or exchange rate, contracts are."},

    {concept: "sclm_bullwhip", source: "SCLM-M04-L05", node: "Bullwhip effect", mode: "definition",
     stem: "Which statement describes the bullwhip effect correctly?",
     options: [
       "End-customer demand becomes more volatile as a product matures, which upstream stages then have to absorb.",
       "Order variability grows at each stage moving upstream, so a modest change in retail sales becomes a large swing in supplier orders.",
       "Retail prices swing more than wholesale prices, because retailers pass promotions through faster than manufacturers.",
       "Replenishment lead times lengthen in proportion to the number of stages, which is what makes a long chain expensive to run and slow to refill."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Located the amplification in demand", label: "Made real demand the thing that swings",
           why: "The bullwhip is about order variability, not demand variability. The defining observation is that consumer sales stay relatively stable while orders upstream swing hard.",
           cue: "Separate how much real demand moves from how much a stage's orders move."},
       2: {tag: "Substituted a pricing effect", label: "Described price rather than order flow",
           why: "Promotions do move orders, and are one contributing cause, but the effect itself is amplification of order variability upstream, not of prices downstream.",
           cue: "Ask what quantity is being amplified and in which direction it travels."},
       3: {tag: "Substituted lead-time growth", label: "Named a consequence as the definition",
           why: "Replenishment lead time does rise as congestion and priority shifts set in, and that raises safety stock again. It is one of the costs the bullwhip creates rather than what the bullwhip is.",
           cue: "Distinguish the amplification itself from the costs it produces."}
     },
     explanation: "The bullwhip effect is demand amplification moving upstream: order fluctuations become larger and more volatile from retailer to wholesaler to manufacturer to supplier. The name is the analogy — a small movement of the handle creates a large movement at the tip.",
     link: "Its costs run in one direction: manufacturing, inventory, lead time, transport and handling all rise while product availability falls."},

    {concept: "sclm_bullwhip", source: "SCLM-M04-L05", node: "Bullwhip effect", mode: "scenario",
     caselet: "A manufacturer's order book swings violently while the retailer's consumer sales barely move. Each stage in between says it is simply ordering against what it can see, and none has changed its ordering rule.",
     stem: "What is the most defensible diagnosis?",
     options: [
       "One stage is over-ordering deliberately to protect itself, and the swings will settle once that stage has been identified.",
       "The forecasts are poor; better forecasting at each stage would remove most of the amplification.",
       "The chain is structural: delay, partial information and local ordering rules produce this even when every stage orders rationally.",
       "Consumer demand must in fact be moving somewhere, since order swings this large cannot arise from genuinely stable end demand."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Looked for a culprit stage", label: "Explained a system property as one actor's behaviour",
           why: "Every stage doing what is locally best is the mechanism, not an exception to it. The beer distribution game shows decision-makers creating oscillation even when the environment is simple and nobody is protecting themselves.",
           cue: "When no stage has changed its rule, the explanation is in the structure connecting them."},
       1: {tag: "Diagnosed a forecasting failure", label: "Treated amplification as prediction error",
           why: "The lecture is explicit that this should not be diagnosed as bad forecasting. Information sharing and coordination attack the cause; better local forecasts against a distorted signal do not.",
           cue: "Trace the signal before improving the estimate made from it."},
       3: {tag: "Denied the observation", label: "Rejected the data to keep the model",
           why: "Stable consumer sales alongside violent upstream orders is the observation the effect is named for — Procter & Gamble's Pampers chain is the standard instance. The gap is the finding, not an inconsistency.",
           cue: "When the data contradicts the assumption, check whether the effect being described is exactly that contradiction."}
     },
     explanation: "The bullwhip is a structural outcome of multi-stage systems with delay, partial information and local decision rules. Incentives conflict across stages because ownership differs, and information is delayed and distorted as it moves, so no stage sees true end demand — only a transformed version of it.",
     link: "That is why the repair is coordination and information sharing rather than a better forecast at any single stage."},

    /* ---- Module 5 ---------------------------------------------------- */
    {concept: "sclm_reengineering", source: "SCLM-M05-L06", node: "Supply-chain re-engineering", mode: "definition",
     caselet: "Two customer groups buy one product. One group accepts delivery any time within a few days. The other needs it inside a narrow window each morning.",
     stem: "Which customer-profile attribute separates these two groups?",
     options: [
       "Order size, since a customer needing a fixed time is usually buying in smaller quantities.",
       "Cost sensitivity, because a narrow delivery window is a premium service and is priced as one.",
       "Timeliness, which is a separate attribute from response time and is what decides the design here.",
       "Reverse logistics needs, since tighter delivery windows generate more returns and repeat visits."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Reached for order size", label: "Named a different profile attribute",
           why: "Order size is a real segmentation attribute — typically larger in B2B than B2C — but nothing in the description bears on quantity. The difference stated is about when delivery has to land.",
           cue: "Match the attribute to what the description actually varies."},
       1: {tag: "Reached for cost sensitivity", label: "Explained the requirement by its price",
           why: "How a service is priced does not identify which attribute distinguishes the segments. The stated difference is a narrow band versus a window, which is timeliness.",
           cue: "Segment on what the customer needs, then decide what it costs to serve."},
       3: {tag: "Reached for reverse logistics", label: "Invented a consequence to fit an attribute",
           why: "Reverse logistics covers returns, repairs and drop-and-pick. Nothing here suggests flows back from the customer, and a tight window does not by itself create them.",
           cue: "Check that the attribute you name appears in the description rather than being implied by it."}
     },
     explanation: "Customer profile is a set of attributes you can segment on: value addition sought, order size, response time, timeliness, delivery location, reverse logistics needs, reliability and cost sensitivity. Timeliness — needing a product at a specific time or narrow band — is deliberately kept separate from response time, because collapsing the two throws away the distinction that decides the design.",
     link: "Customer profile is the first of five motivations for re-engineering, alongside inventory, cost, facilitating technologies and the attitudes of the actors."},

    {concept: "sclm_reengineering", source: "SCLM-M05-L06", node: "Supply-chain re-engineering", mode: "judgement",
     caselet: "A redesign is presented with a costed inventory reduction, a technology plan and a clear customer segmentation. The distributors and transporters who would have to change how they work were not involved and have said they will not.",
     stem: "How should the redesign be judged?",
     options: [
       "It is sound, since the analysis covers inventory, technology and customer profile, which are the substantive parts.",
       "It fails on the attitudes of the actors, which is one of the five motivations and not a soft addition to them.",
       "It should proceed and treat the objections as a change-management task, separate from the supply chain design and handled after approval.",
       "It should be replaced with a cost-reduction plan, because costs are the only motivation that does not depend on cooperation."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Counted three of five", label: "Judged a redesign on its analysis alone",
           why: "The five motivations are customer profile, inventory management, costs, facilitating technologies and attitudes. A redesign the actors will not cooperate with does not happen, whatever the other four say.",
           cue: "Check the list you are working from is complete before declaring the analysis covered."},
       2: {tag: "Deferred the constraint", label: "Moved the binding condition out of scope",
           why: "Willingness to coordinate is listed as a motivation for re-engineering, not as an implementation detail after it. Treating it as a separate workstream is what leaves a design on paper.",
           cue: "If a factor can stop the redesign happening, it belongs inside the design decision."},
       3: {tag: "Retreated to cost", label: "Assumed one motivation escapes cooperation",
           why: "Cost reduction across a chain also needs the actors to change what they do, so it is no more immune than the others. Retreating to cost avoids the objection rather than answering it.",
           cue: "Ask whether the alternative plan needs the same people to act differently."}
     },
     explanation: "The five motivations for improving or re-engineering a chain are customer profile, inventory management, costs, facilitating technologies, and attitudes — the willingness of the different actors to coordinate and to empathise with one another. The last one is not decoration: a redesign that the actors will not cooperate with does not happen.",
     link: "Facilitating technologies showed up repeatedly in the module's cases as the thing that made a redesign possible; attitudes are what make it real."},

    {concept: "sclm_stockyard", source: "SCLM-M05-L13", node: "Stockyard location trade-off", mode: "judgement",
     caselet: "A location model returns several stockyard configurations whose monthly totals fall between about ₹8.5 and ₹8.75 lakhs. One configuration requires two new sites; another uses one site that already operates and one new one.",
     stem: "How should the recommendation be made?",
     options: [
       "Rank the configurations by cost and take the lowest, since that is what the model was built to identify.",
       "Re-run the model with tighter data, because a recommendation cannot rest on differences this small.",
       "Treat differences inside that band as noise at the available data accuracy and choose on managerial practicality.",
       "Choose the configuration with the most sites, since more stocking points always shorten the secondary distance travelled."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Ranked inside the noise", label: "Read a difference the data cannot support",
           why: "The model narrows the field; it never picks the winner. At the accuracy the data actually supports, totals between roughly ₹8.5 and ₹8.75 lakhs are not meaningfully different, so ranking them is reading precision that is not there.",
           cue: "Ask what difference the data can actually resolve before ordering results by it."},
       1: {tag: "Deferred the decision to better data", label: "Asked for precision instead of a judgement",
           why: "The scenarios are what you reason with, and their spread is the finding. More precise inputs would not change that several configurations are equivalent on cost and different on practicality.",
           cue: "When results cluster, the next question is a managerial one, not a modelling one."},
       3: {tag: "Adopted a standing rule", label: "Preferred more sites regardless of the scenario",
           why: "The number of stockyards moves with the constraints — a 350-kilometre secondary limit wants three, a minimum-throughput constraint collapses the current structure onto one. There is no standing rule that more is better.",
           cue: "Let the constraints decide the count. That is what varying them was for."}
     },
     explanation: "The model returns solutions for scenarios rather than one answer, and most of them land inside a band too narrow for the data to separate. The recommendation is the practical one: use the site that already operates and open only the one that has to be new.",
     link: "The same pattern repeats across states, and it is always a move away from the marketing office towards the demand geography."},

    {concept: "sclm_stockyard", source: "SCLM-M05-L13", node: "Stockyard location trade-off", mode: "scenario",
     caselet: "A network study finds that removing the secondary-distance limit gives the lowest total cost of any scenario. Overnight service to dealers requires secondary movement to stay inside 350 kilometres.",
     stem: "What follows for the recommendation?",
     options: [
       "The unconstrained solution should be adopted, since it is the lowest total cost the model was able to find.",
       "The 350-kilometre solution should be adopted and its extra cost read as the price of the overnight promise.",
       "The service promise should be dropped, because the model has shown the constraint to be expensive.",
       "The two results should be averaged, since the true optimum must lie somewhere between an unconstrained and a constrained run."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Ignored the binding constraint", label: "Took an infeasible optimum",
           why: "The unconstrained run is naturally the cheapest because it is not required to do the job. A solution that cannot deliver overnight service is not a candidate for a network that has promised it.",
           cue: "Check feasibility before cost. The cheapest infeasible answer is not an answer."},
       2: {tag: "Reversed the decision order", label: "Let the model choose the service level",
           why: "The service promise is a commercial decision that the model is asked to cost, not one it is asked to make. What the constrained run supplies is the price of keeping the promise, which is the input to that decision.",
           cue: "Models price promises. They do not decide which promises to make."},
       3: {tag: "Averaged incomparable runs", label: "Blended a feasible and an infeasible result",
           why: "The two runs answer different questions — one with the overnight requirement, one without. There is no sense in which the truth lies between them.",
           cue: "Only average results that answer the same question under the same constraints."}
     },
     explanation: "Adding the 350-kilometre secondary limit — what overnight servicing requires — moves the model onto a three-stockyard solution at a higher cost than the unconstrained run. That difference is what the overnight promise costs, which is exactly what a scenario model is for.",
     link: "Constraints are added one at a time precisely so the cost of each commitment can be read off separately."},

    /* ---- Module 6 ---------------------------------------------------- */
    {concept: "sclm_coldstore", source: "SCLM-M06-L05", node: "Cold-storage expansion", mode: "judgement",
     caselet: "An operator runs four profitable cold storage facilities in one city, in a sector where rivals have closed on rising electricity costs, weak capacity utilisation and poor management. A candidate city offers the largest addressable demand of the three under consideration, but would need him to run the site through a manager he could visit rarely.",
     stem: "What should carry most weight in the decision?",
     options: [
       "The size of the addressable demand in that city, which is what ultimately determines the revenue a facility can earn.",
       "The subsidy available in the candidate state, since it is the one input that directly reduces the investment needed at the outset.",
       "Whether the site can be run the way the existing four are, because his advantage was never the location.",
       "The prevailing land price, because in a capital-intensive sector it is the largest single cost of entry."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Ranked on demand alone", label: "Chose the biggest market",
           why: "The evaluation deliberately runs on investment requirement, land prices, subsidy policies, infrastructure and competition — not market size alone. Demand that cannot be served at high utilisation with close involvement does not become profit.",
           cue: "Ask what turns demand into margin in this business before ranking demand."},
       1: {tag: "Elevated one input", label: "Let a subsidy decide the site",
           why: "Subsidy policy is one of several factors, alongside investment requirement, land price, infrastructure and competition. It lowers entry cost without addressing whether the operating model survives the move.",
           cue: "A subsidy changes what entry costs, not whether the business works once entered."},
       3: {tag: "Elevated land price", label: "Optimised the cheapest input",
           why: "Land price is on the list, but rivals in this sector failed on electricity costs, utilisation and management rather than on what they paid for land.",
           cue: "Look at what actually killed comparable businesses before deciding which cost matters most."}
     },
     explanation: "His advantage was never the location. It was capacity utilisation, cost discipline and trader relationships, in a sector where rivals failed on electricity costs and weak management. A city that offers demand but prevents him reproducing high utilisation and close personal involvement removes the thing that made four facilities profitable.",
     link: "At roughly 25:75 equity to debt, the borrowing still has to be serviced whether or not the operating model transfers."},

    {concept: "sclm_coldstore", source: "SCLM-M06-L05", node: "Cold-storage expansion", mode: "scenario",
     stem: "Why is geographical diversification treated as more than a way of reaching new demand in this sector?",
     options: [
       "Because it reduces business risk, in an industry with seasonal demand patterns and volatile profitability.",
       "Because operating in several states removes the exposure to electricity costs that closed competing facilities.",
       "Because a larger footprint qualifies an operator for central subsidies that a single-city operator cannot claim.",
       "Because spreading sites lowers the equity share needed, since lenders price a diversified borrower differently."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Claimed a risk was removed", label: "Turned diversification into immunity",
           why: "Electricity cost is an operating exposure at every site. Spreading locations reduces dependence on one local market's swings; it does not remove a cost that applies wherever the facility runs.",
           cue: "Ask which risk is local and which follows the business everywhere."},
       2: {tag: "Invented a qualifying rule", label: "Attributed the move to a subsidy threshold",
           why: "Subsidy policy varies by state and is one of the evaluation criteria for choosing a city. Nothing makes a multi-city footprint a condition of claiming it.",
           cue: "Check whether the mechanism you are naming appears in the case at all."},
       3: {tag: "Reached for financing", label: "Explained the strategy by the gearing",
           why: "The equity-to-debt ratio sat near 25:75 across ventures, before and independent of any diversification. The stated purpose of spreading facilities is risk, not a change in how borrowing is priced.",
           cue: "Separate what the strategy is for from what happened to be true of the balance sheet."}
     },
     explanation: "Cold storage is characterised by high operating costs, seasonal demand patterns and volatile profitability. Geographical diversification is meant to reduce business risk as much as to capture new demand, which is why the candidate cities are scored on investment requirement, land price, subsidy policy, infrastructure and competition rather than on demand alone.",
     link: "The operating discipline that produced profit in one city is what has to survive the move, and that is a separate test from the scoring."},

    {concept: "sclm_turnaround", source: "SCLM-M06-L07", node: "Transport turnaround", mode: "numeric",
     caselet: "A rake cycle of 99 hours breaks down as loading 3.5 hours, idle before loading 7.5, waiting for a locomotive after loading 13, transit out 34, transit back 30, and unloading and readying about 9.75.",
     stem: "Which element is the largest single inefficiency to attack, as opposed to the largest block of time?",
     options: [
       "Transit out at 34 hours, which is the largest element in the cycle and therefore the biggest prize.",
       "Unloading and readying at about 9.75 hours, which is the element most directly under the plant's control.",
       "Idle time before loading at 7.5 hours, which is pure waiting and adds nothing to the movement.",
       "Waiting for a locomotive at 13 hours, which is detention created by the engine being reassigned elsewhere."
     ],
     answer: 3,
     wrong: {
       0: {tag: "Ranked by size, not by slack", label: "Attacked the largest number",
           why: "Transit is the biggest element and is the movement itself — it is the distance being covered, not waste inside the cycle. Attacking it would need faster running, not a scheduling change.",
           cue: "Separate time spent moving from time spent waiting before ranking targets."},
       1: {tag: "Chose by controllability", label: "Picked the most convenient element",
           why: "Unloading and readying is under the plant's control and is worth improving, but at about 9.75 hours it is smaller than the 13-hour detention and is doing productive work.",
           cue: "Rank by recoverable hours, not by how easy the element is to reach."},
       2: {tag: "Chose the smaller wait", label: "Found waiting but not the biggest waiting",
           why: "Idle time before loading is genuine waiting and worth removing, but it is 7.5 hours against 13 hours of locomotive detention, which is the single largest inefficiency in the cycle.",
           cue: "When two elements are both waste, compare their sizes before choosing."}
     },
     explanation: "The 13-hour wait for a locomotive after loading was the single largest inefficiency. The locomotive that delivered the empty rake was routinely reassigned to other railway operations, and neighbouring stations serving other industries were competing for the same engines.",
     link: "That is what the engine-on-load system addresses: the locomotive stays attached instead of being detached and re-summoned."},

    {concept: "sclm_turnaround", source: "SCLM-M06-L07", node: "Transport turnaround", mode: "judgement",
     caselet: "A plant needs monthly despatch to rise from 52,000 tons to 70,000. Three routes are on the table: redesign wagons to carry more per trip, add rakes to make more trips, or cut the 99-hour rake cycle so the existing rakes make more trips.",
     stem: "Why is the third route the one to take first?",
     options: [
       "Because it is the only route that increases throughput, the first two merely moving the same tonnage differently.",
       "Because all of the extra throughput is already inside the existing cycle as waiting time, and the other two need capital and fresh stock.",
       "Because railway agreements are easier to obtain than rolling stock, which makes it the fastest route to implement.",
       "Because wagon redesign and extra rakes both raise fixed cost, and fixed cost is always the wrong lever in logistics whatever the throughput target."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Denied the alternatives work", label: "Claimed the other routes do nothing",
           why: "Bigger loads per trip and more rakes both genuinely raise throughput. What separates them is that each needs capital expenditure and fresh stock, while the cycle route needs only a change to how the locomotive is scheduled.",
           cue: "Compare what the options cost, not whether they work."},
       2: {tag: "Assumed the agreement was easy", label: "Rated the route by how simple it looked",
           why: "The agreement carried a three-hour loading window and a ₹3,800-per-hour penalty, and the trial still ran into engine withdrawals. An agreement on paper is not yet the practice.",
           cue: "Read what the option commits you to before calling it the easy one."},
       3: {tag: "Adopted a standing rule about cost", label: "Made fixed cost wrong in general",
           why: "Nothing here says capacity should never be bought. The argument is specific: the throughput was already sitting inside the cycle as waiting time, so buying more assets pays for capacity you already have.",
           cue: "Check whether the capacity is genuinely absent before deciding whether to buy it."}
     },
     explanation: "Alternatives one and two both need capital expenditure and fresh stock; the third needs only a change to how the locomotive is scheduled. Expected turnaround fell from 99 hours to about 80 and monthly trips rose from 21 to around 27 — roughly 12,000 additional tons a month, without new rolling stock.",
     link: "Reading a cycle breakdown for where capacity already sits is the move; buying assets is what you do when it genuinely is not there."},

    /* ---- Module 7 ---------------------------------------------------- */
    {concept: "sclm_multimodal", source: "SCLM-M07-L06", node: "Multimodal cost trade-off", mode: "judgement",
     caselet: "Sea transport lands a year's ore far below the rail cost, but moves the whole quantity in one or two shipments and therefore holds far more inventory. Several other options sit between the two on both counts.",
     stem: "How should the inventory carrying cost be brought into the comparison?",
     options: [
       "Compute it for every option, since a ranking cannot be trusted until each of them has been costed on the same basis over the same period.",
       "Leave it out, because carrying cost is an accounting charge rather than a cash cost of moving the material.",
       "Compute it only for the option holding the most inventory: if even that still wins, no other option can overturn the ranking.",
       "Apply a standard percentage to each option's transport cost, which keeps the comparison consistent across modes."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Costed everything", label: "Did the work the bound made unnecessary",
           why: "Computing every option is not wrong, only unnecessary. The single-shipment option holds the most stock by construction, so its carrying cost is the largest any option could incur; if the worst case still wins, the rest cannot change the ranking.",
           cue: "Ask whether a bound settles the question before costing every branch."},
       1: {tag: "Excluded a real cost", label: "Treated inventory as free",
           why: "Sea buys its transport saving by holding inventory — cycle stock averaging half the shipment, a month of buffer, and pipeline stock building at the loading end. Ignoring that is what makes the cheap mode look cheaper than it is.",
           cue: "If an option's saving comes from holding more, the holding has to be priced."},
       3: {tag: "Applied a flat rate", label: "Scaled inventory by transport spend",
           why: "Carrying cost depends on how much stock each option holds and for how long, not on what its transport costs. A percentage of freight would charge the dearest mode the most while it is the cheapest mode that holds the stock.",
           cue: "Price the inventory each option creates, not the freight bill it generates."}
     },
     explanation: "This is a bounding argument, not a shortcut. Evaluate the option carrying the most inventory — the whole year's requirement landed in one go — and if that still comes in below the dearer-to-move alternatives, stop. The same logic already removed the road variant on the inbound leg, which was dominated on cost with nothing else to weigh.",
     link: "Cycle stock, buffer stock and pipeline stock are the three components that make a single large shipment expensive to hold."},

    {concept: "sclm_multimodal", source: "SCLM-M07-L06", node: "Multimodal cost trade-off", mode: "definition",
     stem: "What are standing charges in a chartered-shipping cost build-up?",
     options: [
       "The cost of hiring the vessel for the period, which accrues whether or not it is moving.",
       "The port fees charged for a berth, which are levied once per call regardless of tonnage handled.",
       "The demurrage that becomes payable when loading or unloading runs beyond the laytime agreed in the charter.",
       "The fixed component of the barge operating cost, prorated across the days the barges are actually worked."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Named a port charge", label: "Located the cost at the berth",
           why: "Port fees are a separate line. Standing charges are the hire cost of the vessel across the whole cycle, which is why a longer cycle time raises them even if nothing else changes.",
           cue: "Ask what the charge is for: the ship's time, or the port's service."},
       2: {tag: "Named a penalty", label: "Confused hire with overrun",
           why: "Demurrage is a penalty for exceeding agreed time. Standing charges accrue as a matter of course for the period the vessel is on hire, whether or not anything goes wrong.",
           cue: "Separate what is always payable from what is payable only on an overrun."},
       3: {tag: "Attached it to the barges", label: "Assigned the vessel's cost to the transfer craft",
           why: "Barge operating cost is its own line and is prorated across the unloading days. Standing charges belong to the hired vessel and run across the full cycle.",
           cue: "Trace each cost line to the asset it belongs to before naming it."}
     },
     explanation: "The sea option is assembled from fuel, loading, unloading, barge operating cost, and standing charges — the cost of hiring the vessel for the period. Because they accrue across the whole cycle, travel plus port time is what sets them, which is why cycle time rather than sailing time is the figure to work with.",
     link: "Longer cycle time raises both the hire cost and the inventory held, which is why the two have to be evaluated together."},

    {concept: "sclm_ports", source: "SCLM-M07-L07", node: "Ports and PPP", mode: "definition",
     stem: "How does India's use of shipping compare with the global pattern?",
     options: [
       "India ships a smaller share of its trade by volume than the world average, but a larger share by value.",
       "India ships over 95% of its trade by volume against a global 80%, but only 65% by value against a global 70%.",
       "India's volume and value shares are both close to the global figures, so its port profile is unremarkable.",
       "India ships almost all of its trade by sea on both measures at once, which is what distinguishes it from other large coastal economies."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Reversed both shares", label: "Inverted the comparison",
           why: "It is the other way round on both measures. India is well above the global figure on volume and below it on value, which is what widens the gap between the two.",
           cue: "Check the direction of each share separately before comparing them."},
       2: {tag: "Flattened the difference", label: "Called a wide gap unremarkable",
           why: "The gap between volume share and value share is much wider for India than globally, and the lecture poses that specifically as a question worth reflecting on.",
           cue: "Compare the gap, not just each share against its own benchmark."},
       3: {tag: "Collapsed value into volume", label: "Applied one share to both measures",
           why: "Volume share is over 95%, but value share is 65% — below the global 70%. Treating them as the same number is exactly what hides the finding.",
           cue: "Volume and value are different questions about the same cargo."}
     },
     explanation: "Globally, shipping moves 70% of trade by value and 80% by volume. India moves over 95% by volume and 65% by value, so the gap between the two is far wider than the global one. That points at what is being shipped — dense low-value bulk — rather than at how well it is being shipped.",
     link: "Value share runs below volume share everywhere, because high-value goods can justify air or land; what is distinctive here is the size of the gap."},

    {concept: "sclm_ports", source: "SCLM-M07-L07", node: "Ports and PPP", mode: "scenario",
     stem: "What does the major/non-major split say about how Indian port capacity is governed?",
     options: [
       "Non-major ports are small feeder facilities, so the central government effectively governs national throughput along the whole coastline.",
       "Non-major ports are state-driven and now handle roughly 46% of traffic, a share that has risen over the past decade.",
       "The split is administrative only, since both categories are operated under one central concession framework and reported against a single standard.",
       "Private operators are confined to the non-major ports, which is what has allowed that category to grow so quickly over the past decade."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Understated the non-major share", label: "Treated state ports as marginal",
           why: "Non-major ports handled about 740 million tons against 854 for major ports — near a 46/54 split. The Gujarat Maritime Board alone accounts for 30% of national traffic.",
           cue: "Check the tonnage before deciding which category is the small one."},
       2: {tag: "Denied the governance difference", label: "Called the split purely administrative",
           why: "Major ports are driven by the central government and non-major by state governments, which is a real difference in who sets policy and investment. Public private partnerships now run over 74% of traffic across both.",
           cue: "Ask who drives each category before deciding the distinction is nominal."},
       3: {tag: "Confined private operation", label: "Restricted PPP to one category",
           why: "Adani Ports and Special Economic Zone operates in both major and non-major ports and carried about 28% of national port traffic. Private participation is not confined to the state-driven group.",
           cue: "Check whether the operators named appear on both sides of the split."}
     },
     explanation: "Roughly 1,600 million tons moved through Indian ports in 2024-25. Major ports, driven by the central government, handled 854 million tons; non-major ports, driven by state governments, about 740 — a 46% share that has risen over the past decade. The public private partnership share is over 74%.",
     link: "India's top seven ports carry more than half the national throughput, and the largest global port alone handles more than three-quarters of India's total."},

    /* ---- Module 8 ---------------------------------------------------- */
    {concept: "sclm_leads", source: "SCLM-M08-L01", node: "LEADS index", mode: "definition",
     stem: "What does LEADS measure, and how is it collected?",
     options: [
       "Export performance by state, compiled from customs declarations and port throughput records filed by each state government each year.",
       "The financial performance of the largest logistics companies, ranked from the audited accounts they file at the end of each year.",
       "Logistics efficiency across all states and union territories, collected as a perception survey of service providers and users.",
       "Road and rail infrastructure quality, measured directly by survey teams sent out to each state in turn every second year."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Confused it with trade statistics", label: "Read the index as an export measure",
           why: "LEADS is about logistics efficiency, not export volume. Its stated purpose is to identify strengths and improvement areas in state-level logistics performance.",
           cue: "Ask what the index is trying to change. LEADS exists to move state policy, not to count trade."},
       1: {tag: "Confused states with firms", label: "Ranked companies rather than states",
           why: "The unit of comparison is the state, because state governments control infrastructure, services and the regulatory context. Publishing a state-by-state comparison is what creates the competitive environment.",
           cue: "Identify what is being ranked before deciding what the data must be."},
       3: {tag: "Confused perception with direct measurement", label: "Made the original method an objective survey",
           why: "The method is a perception-based survey capturing responses from logistics stakeholders. Objectively examinable measures, including secondary infrastructure and regulatory data, were added over the years rather than being the original design.",
           cue: "Ask who is being asked. A perception index collects ratings, not measurements."}
     },
     explanation: "Logistics Ease Across Different States is an index evaluating logistics efficiency across Indian states, built as a perception-based survey of logistics service providers and users across all states and union territories. It exists because the central government's lever on state logistics is competition.",
     link: "It builds on the World Bank's Logistics Performance Index, which runs the same idea across countries."},

    {concept: "sclm_leads", source: "SCLM-M08-L01", node: "LEADS index", mode: "judgement",
     caselet: "On the Logistics Performance Index a country scores 3.6 on timeliness and 3.0 on customs, on a 5.0 scale. Its rank is 47 on customs and 47 on infrastructure, against an overall rank of 38.",
     stem: "What do the ranks add that the scores do not?",
     options: [
       "They show where other countries are clustered above, so they locate where improvement buys the most position.",
       "They correct the reported scores for the different number of survey respondents each pillar happens to receive.",
       "They convert the pillar scores onto one common scale, which the 5.0 ratings are not otherwise comparable on.",
       "They indicate which of the six pillars are measured objectively, since only those pillars can be placed in a ranking."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Invented a statistical correction", label: "Read the rank as an adjustment",
           why: "A rank is a position among other countries, not a weighting or a correction. Nothing about it accounts for sample size.",
           cue: "Ask what a rank is computed from: everyone else's scores, not this country's data quality."},
       2: {tag: "Confused rank with normalisation", label: "Treated the scores as incomparable",
           why: "The scores already share one 5.0 scale across pillars. What a rank adds is relative position, which is a different fact from the absolute level.",
           cue: "A score is absolute; a rank is relative. Both are readable, and they say different things."},
       3: {tag: "Tied ranking to measurement type", label: "Made ranking depend on objectivity",
           why: "All six pillars are ranked, including the perception-based ones. How a pillar is measured does not decide whether a position among countries can be reported.",
           cue: "Separate how a number was collected from what can be computed with it."}
     },
     explanation: "A score is absolute; a rank is relative to everyone else. Customs and infrastructure scores are not dramatically low, but ranks of 47 against an overall rank of 38 show other countries clustered above on exactly those pillars, which is where improvement buys the most position.",
     link: "That is the same mechanism LEADS applies inside India — publishing a state-by-state comparison is what creates the competition."},

    {concept: "sclm_akshaya", source: "SCLM-M08-L03", node: "Akshaya Patra meal logistics", mode: "scenario",
     caselet: "One vehicle carries containers for fourteen to eighteen schools on a fixed route. The meal has to still be hot at the last stop.",
     stem: "How should the vehicle be loaded?",
     options: [
       "Heaviest containers first, so the load is stable and the vehicle can be driven at route speed.",
       "By school size, largest first, so the biggest deliveries are cleared while the food is at its hottest.",
       "In the order the containers left the kitchen, which keeps the staging area and the loaded vehicle in step all morning.",
       "Last in, first out: the first school on the route is loaded last, never by what is convenient at the kitchen."
     ],
     answer: 3,
     wrong: {
       0: {tag: "Optimised for the vehicle", label: "Loaded for stability rather than for unloading",
           why: "Load stability matters, but the sequence is dictated by the unloading order. Time spent digging for the right container at one school is time the rest of the load spends cooling.",
           cue: "Ask what the loading sequence is for. Here it is the unloading sequence, not the drive."},
       1: {tag: "Ranked by delivery size", label: "Sequenced by quantity instead of by route",
           why: "Container sizes are already matched to each school's quantity. Ordering by size cuts across the route sequence, so a large early school and a large late school end up beside each other.",
           cue: "Sequence by where a stop falls on the route, not by how much it takes."},
       2: {tag: "Followed the kitchen", label: "Let production order set delivery order",
           why: "This is exactly the convenience the design rejects. Rotis are made in one building while rice and vegetables are cooked in another, so kitchen order and route order have no reason to agree.",
           cue: "Staging is where production order is turned into route order. That is what it is for."}
     },
     explanation: "Cooked food goes into containers sized to each school's quantity, labelled with school name and route number, then staged near the loading platforms in route-wise sequence. The loading sequence is dictated by the unloading sequence, never by what is convenient at the kitchen.",
     link: "The fleet split works on the same margin: owned vehicles carry insulation and container racks, hired vehicles carry neither."},

    {concept: "sclm_akshaya", source: "SCLM-M08-L03", node: "Akshaya Patra meal logistics", mode: "judgement",
     caselet: "An automated rotimaking machine is rated at 40,000 rotis an hour and delivers closer to 35,000. Atta arrives as a rectangular sheet and the rotis cut from it are circular.",
     stem: "What does the shortfall point to?",
     options: [
       "A maintenance problem, since a machine running below its rated capacity is by definition not being serviced adequately by its contractor.",
       "Alignment issues and rejected rotis that return for reuse, with the circular cut from a rectangular sheet leaving unused portions.",
       "An under-specified machine, so the answer is a second line rated above the required throughput.",
       "A staffing shortfall, because a rated capacity assumes a trained operator standing at every station along the whole line."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Assumed a maintenance cause", label: "Read any shortfall as poor upkeep",
           why: "A rated capacity is what the machine can do under ideal conditions. Alignment and rejects account for the difference here, and rejected rotis go back for reuse rather than being lost.",
           cue: "Ask what the rating assumes before treating a shortfall as a fault."},
       2: {tag: "Bought capacity", label: "Solved a yield problem with a second line",
           why: "Adding a line pays for capacity the existing one is losing to alignment and cut geometry. The lecture's own question is whether a triangular or rectangular roti would waste less of the sheet.",
           cue: "Fix the yield before buying the throughput again."},
       3: {tag: "Attributed it to staffing", label: "Explained a mechanical yield loss by labour",
           why: "Nothing in the constraint is about operators. The named causes are alignment issues, rejects returning for reuse, and the geometry of cutting circles from a rectangle.",
           cue: "Check whether the cause you name is in the description before adopting it."}
     },
     explanation: "The rotimaking machine is rated at 40,000 rotis an hour and delivers closer to 35,000, because of alignment issues and rejected rotis that go back for reuse. Atta arrives as a rectangular sheet, so cutting circular rotis leaves unused portions — a design question the lecture draws out of the shortfall.",
     link: "Layout adds its own drag: rotis are made in one building while rice and vegetables are cooked in another, which complicates loading at dispatch."}
  ],

  /* BRGSA's own assessments are scenario-led — a situation, then "which reading is
     most defensible" — so these follow that shape rather than the definitional one
     SCLM's use. One per concept: sixteen items, on the sixteen lectures that already
     carry a lesson. */
  BRGSA: [
    {concept: "brgsa_m1_demand", source: "BRGSA-M01-L01", node: "Demand validation", mode: "scenario",
     caselet: "A founder has budgeted six months to build an AI meeting recorder and a marketing campaign to launch it. A colleague suggests putting up a page with the real offer and seeing whether anyone acts on it, before any of that starts.",
     stem: "What is the strongest argument for running the page first?",
     options: [
       "Every plan that goes straight to build carries an untested demand assumption, and the test buys that certainty in days rather than months.",
       "A landing page produces marketing material the launch campaign is going to need anyway, so none of the work is wasted either way.",
       "Building first is the more reliable route to learning, because real usage data from a working product is stronger evidence than a page view.",
       "The page removes the risk from the build, since a positive result means the product can be scoped with confidence."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Justified the test by its by-products", label: "Kept the test for the wrong reason",
           why: "Reusable creative is a side benefit. The reason to test first is that the whole plan rests on an assumption nobody has checked, and checking it costs seven to fourteen days against six to eighteen months.",
           cue: "Ask what the test is deciding. If your reason survives a negative result unchanged, it is not the reason."},
       2: {tag: "Inverted the cost of learning", label: "Preferred the expensive way to buy the same information",
           why: "Usage data is stronger, and it arrives after the money is spent. The build is the expensive way to buy the same information later; the test is the cheap way to buy it now.",
           cue: "Compare what each route costs to be wrong, not which produces the better data."},
       3: {tag: "Overclaimed what a test removes", label: "Read validation as risk elimination",
           why: "A positive signal narrows the risk; it does not remove it, and a signal produced by a warm audience can be a false positive that creates confidence in the wrong direction.",
           cue: "A test changes what you know. Ask who produced the signal before deciding what it settles."}
     },
     explanation: "Most products fail because nobody checked whether anyone wanted the thing before the building started. Lean validation answers that one question as quickly and cheaply as possible: seven to fourteen days and a few thousand rupees, against six to eighteen months and lakhs.",
     link: "Building feels like progress and testing feels like delay, which is exactly backwards on cost."},

    {concept: "brgsa_m1_evidence", source: "BRGSA-M01-L04", node: "Pre-sales commitment and evidence strength", mode: "scenario",
     caselet: "A team reports 200 positive survey responses, 30 wait-list signups and 4 refundable deposits taken under stated terms. The founder wants to lead the investor update with the 200.",
     stem: "How should the three signals be weighted?",
     options: [
       "By volume, since 200 responses is a far larger sample than four deposits and is therefore the more reliable number to lead with.",
       "Equally, because each is a genuine expression of interest and discarding any of them throws away information.",
       "By what each cost the person to give, which makes the four deposits the primary evidence and the survey background.",
       "By recency, taking whichever signal was collected most recently as the best guide to current demand."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Ranked by sample size", label: "Preferred the larger number of weaker signals",
           why: "Sample size does not upgrade a costless signal. Praise in a survey costs nothing to give, which is what makes 200 of them weaker evidence than four responses where somebody parted with money.",
           cue: "Ask what each respondent gave up. A large sample of free actions is still a sample of free actions."},
       1: {tag: "Refused to rank", label: "Treated all interest as equivalent",
           why: "The commitment spectrum exists precisely to rank them. A person who clicks is curious, a person who signs up is interested, and a person who pays even a small deposit is behaving like a customer.",
           cue: "Keeping every signal is fine. Weighting them equally is what the spectrum rules out."},
       3: {tag: "Ranked by recency", label: "Used timing as the strength test",
           why: "When a signal was collected says nothing about what it cost to produce. A survey taken this morning is still a survey.",
           cue: "Strength here is about cost to the respondent, not about the date on the response."}
     },
     explanation: "Evidence is only as strong as the cost of producing it. Praise, likes and email opens cost nothing; a signup costs a little attention; a letter of intent costs reputation; a payment — even a partial, refundable one — costs money, and money is the hardest commitment to fake.",
     link: "When you need the highest confidence before committing to a build, you ask for the costliest signal you can reasonably request."},

    {concept: "brgsa_m2_design", source: "BRGSA-M02-L01", node: "Null hypothesis and test design", mode: "scenario",
     caselet: "A team wants to test whether a new call-to-action improves signups. One member proposes stating the hypothesis as \"the new wording feels more natural to users\".",
     stem: "What is wrong with that as a hypothesis?",
     options: [
       "It names the wrong metric, since signups are what the team cares about rather than how the wording feels.",
       "It should predict a larger effect, because a small improvement is not worth the cost of running a test at all.",
       "It is not falsifiable: every experiment starts from a stated no-difference position that a specific, measurable claim can argue against.",
       "It fails to say which variant is the control, without which the two groups cannot be compared."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Fixed the metric, not the form", label: "Swapped the measure and left the hunch",
           why: "Changing the metric to signups helps, but \"feels more natural\" would still be a hunch. What separates a hypothesis from a hunch is being specific, measurable and falsifiable.",
           cue: "Ask whether a result could show the claim wrong. If not, no metric rescues it."},
       1: {tag: "Confused effect size with testability", label: "Made the problem the size of the claim",
           why: "How large an effect to look for is the minimum detectable effect question, decided separately. A vague claim is untestable at any effect size.",
           cue: "Separate what you are claiming from how big the claim is."},
       3: {tag: "Named a design detail", label: "Answered with a setup step",
           why: "Identifying the control matters for running the test, but the hypothesis would still be unfalsifiable with a control named. The defect is in the statement itself.",
           cue: "Fix the claim before fixing the apparatus that will test it."}
     },
     explanation: "Every experiment starts from a boring assumption: nothing changed. The null is that the change makes no difference. The alternative has to be specific enough to be shown wrong — \"raises signup rate by at least 10% within 30 days\" can be falsified; \"feels better\" cannot.",
     link: "A test does not try to prove the null. It gathers enough evidence to reject it, and failing to do so is not proof the two options are identical."},

    {concept: "brgsa_m2_error", source: "BRGSA-M02-L03", node: "Decision errors", mode: "judgement",
     caselet: "A pricing change that genuinely improves conversion is tested on far too few users. The test reports no difference and the team drops the change.",
     stem: "What has happened, and what follows?",
     options: [
       "A Type I error: the test has reported a result that was not real, so the alpha level should be tightened before anyone retests it.",
       "A Type II error: the test was underpowered and missed a real effect, so it should be re-run with an adequate sample.",
       "Neither error: the test returned the correct result for the data it had, so the decision to drop the change stands.",
       "A measurement error: the conversion metric must have been defined inconsistently across the two groups."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Named the opposite error", label: "Called a missed effect a false positive",
           why: "A Type I error reports an improvement that is not there. Here a real improvement was missed, which is a false negative. Tightening alpha would make that outcome more likely, not less.",
           cue: "Ask what the test claimed. Claiming too much is Type I; claiming too little is Type II."},
       2: {tag: "Accepted the null as proof", label: "Read no evidence as evidence of nothing",
           why: "Failing to reject the null means you did not earn the right to claim a difference. It is not the same as showing there is none, and an underpowered test cannot see a real effect even when one is there.",
           cue: "Separate 'no evidence of an effect' from 'evidence of no effect'."},
       3: {tag: "Reached for instrumentation", label: "Explained a power problem as a definition problem",
           why: "Nothing here suggests the metric differed between groups. The stated cause is sample size, and sample size is what protects against false negatives.",
           cue: "Check whether the cause you name appears in the description before adopting it."}
     },
     explanation: "A Type II error is a false negative: a real improvement exists and the test misses it, so something that worked gets abandoned. Alpha controls the false-positive rate; sample size is what protects against false negatives.",
     link: "Which error costs more is a business judgement, not a statistical one — abandoning a pricing model that genuinely worked is expensive."},

    {concept: "brgsa_m3_cohort", source: "BRGSA-M03-L01", node: "Cohorts and retention", mode: "scenario",
     caselet: "A product reports 10,000 users and signups growing 15% month on month. Eight thousand of those users joined more than six months ago and have not opened the product since January.",
     stem: "What does the reported growth actually show?",
     options: [
       "Genuine growth, since the total is accurate and rising and the dormant users may still return later.",
       "An acquisition problem, because 15% monthly signup growth is too slow to replace users at this rate of loss.",
       "A pricing problem, since users who stop opening a product are usually signalling that it is not worth what they pay.",
       "Acquisition refilling a leaking bucket: the total is real and only cohorts show whether the bucket itself improved."
     ],
     answer: 3,
     wrong: {
       0: {tag: "Trusted the total", label: "Took an accurate number as a correct conclusion",
           why: "The total is accurate. The conclusion drawn from it is still wrong, because the total hides the composition — which is the whole point of the cricket-bench example, where ten bowlers turn out to be nearly all spinners.",
           cue: "An accurate aggregate and a sound conclusion are different things. Ask what the sum is hiding."},
       1: {tag: "Diagnosed the wrong stage", label: "Read a retention failure as an acquisition shortfall",
           why: "Acquisition is working — that is what is carrying the total. The problem is that each cohort decays, which more acquisition cannot fix and can only hide for longer.",
           cue: "Ask which stage the evidence is actually about before naming the fix."},
       2: {tag: "Guessed a cause", label: "Named a reason the data does not reach",
           why: "Price may be involved, but nothing here separates it from onboarding, fit or habit. A cohort view is what turns \"users leave\" into a question you can answer.",
           cue: "Get the shape of the decay before choosing an explanation for it."}
     },
     explanation: "A cohort is a group defined by a shared starting event and tracked over time. Instead of asking how many users there are, you ask how many of March's joiners are still there in month three, and compare that with April and May. Acquisition can refill a leaking bucket indefinitely, and only cohorts show whether the bucket itself improved.",
     link: "The same trap runs through every aggregate: the total was accurate and the conclusion drawn from it was still wrong."},

    {concept: "brgsa_m3_economics", source: "BRGSA-M03-L04", node: "CAC and LTV", mode: "judgement",
     caselet: "A founder refuses to compute lifetime value, saying the company is only eight months old and any figure would be a guess.",
     stem: "What is the strongest response?",
     options: [
       "Estimate it now from the inputs you already have, state the lifespan you assumed, and update it as cohorts mature.",
       "Use the industry average lifespan for the category, which removes the guesswork from the estimate entirely.",
       "Wait until twelve to eighteen months of cohort data exist, since an early figure would mislead any decision that was built on it.",
       "Compute it from revenue rather than gross profit, which avoids depending on a margin the company cannot yet measure."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Borrowed someone else's assumption", label: "Replaced a stated assumption with a hidden one",
           why: "An industry average is still an assumed lifespan, only one nobody in the company can challenge or update. The point is to write the assumption down beside the number, not to source it externally.",
           cue: "Ask whether the assumption is visible. A borrowed one is not more certain, only less examined."},
       2: {tag: "Deferred the estimate", label: "Waited for data before making a comparison",
           why: "This is exactly the misconception the lecture removes. CAC on its own cannot tell you whether to spend; it needs an LTV to be compared against, and that comparison is needed now rather than in a year.",
           cue: "Ask what decision is waiting on the number. If one is, an estimate with a stated assumption beats no number."},
       3: {tag: "Changed the definition", label: "Used revenue where gross profit is required",
           why: "LTV is total gross profit, not revenue. Money collected and immediately paid out to serve the customer never belonged to you, so a revenue-based figure overstates the value of every customer.",
           cue: "Check which line the definition names before substituting an easier one."}
     },
     explanation: "LTV is ARPU × average customer lifespan × gross margin, and it is estimated now rather than waited for. An LTV without its stated lifespan is a number nobody can challenge or update — which makes it a claim rather than an estimate.",
     link: "The estimate exists to complete a comparison: a ratio above about 3:1 against CAC says acquisition cost is not the binding constraint."},

    {concept: "brgsa_m4_constraint", source: "BRGSA-M04-L04", node: "Growth constraint", mode: "numeric",
     caselet: "A funnel runs 10,000 visitors, 1,200 signups, 400 activations and 30 paying customers.",
     stem: "Where is the constraint?",
     options: [
       "Visitor to signup, where 8,800 people are lost — by far the largest fall anywhere in the funnel.",
       "Activation to paid, at 7.5%, which is the lowest conversion rate of the three stages shown.",
       "Signup to activation at 33%, since only the slowest stage sets the pace and effort on any other adds nothing.",
       "Nowhere yet, because a funnel with four stages needs a much longer observation window before any constraint in it can fairly be named."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Read the absolute drop", label: "Took the biggest number as the biggest problem",
           why: "The largest numeric fall is usually at the top simply because the top is the widest. 12% visitor-to-signup is a good benchmark, so this stage is performing, not failing.",
           cue: "Compare step conversion rates, not the count of people lost at each step."},
       1: {tag: "Took the lowest rate", label: "Ranked by conversion without a benchmark",
           why: "7.5% activation-to-paid is low as a bare number, and a paid-conversion rate is expected to be. What identifies a constraint is the stage furthest from what it should be, and 33% signup-to-activation is the one holding the system back.",
           cue: "A rate needs a benchmark before it can be called slow."},
       3: {tag: "Deferred the diagnosis", label: "Asked for more data than the decision needs",
           why: "The figures already show step conversion at each join, which is what identifies the constraint. Waiting spends the time the constraint is costing.",
           cue: "Ask whether the data in front of you can answer the question before requesting more of it."}
     },
     explanation: "A constraint is the slowest stage in a system — the one that sets the pace. Making a non-constraint faster will not increase overall output. Here 12% visitor-to-signup is a good benchmark, so the constraint is signup-to-activation at 33%.",
     link: "The largest absolute drop and the slowest stage are different questions, and only step conversion answers the second."},

    {concept: "brgsa_m4_customers", source: "BRGSA-M04-L02", node: "Early-stage and scale-stage growth", mode: "judgement",
     caselet: "A company that has raised a large round wants to triple paid acquisition spend. Asked for its payback period, the team cannot state one.",
     stem: "How should the request be handled?",
     options: [
       "Approve it, since a large raise is exactly the capital that paid acquisition is meant to deploy at this stage.",
       "Approve a third of it as a controlled test, which produces the payback figure that is currently missing.",
       "Treat the company as early stage despite the funding, and find the repeatable channel and retention shape first.",
       "Refuse on principle, because paid acquisition is a scale-stage tool and this company has not reached that stage."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Let funding settle the stage", label: "Read money in the bank as readiness",
           why: "Money in the bank does not settle which game the company is playing. A company with a large raise and no repeatable channel is still early stage; a company with 5,000 users can already be scaling.",
           cue: "Ask what is known, not what is funded."},
       1: {tag: "Bought the answer at a discount", label: "Ran the same unproven motion smaller",
           why: "A smaller version of an unproven motion produces a payback figure for a channel nobody has yet shown repeats. The missing work is the search, not a smaller instance of the scale.",
           cue: "Ask whether the spend answers the open question or only shrinks it."},
       3: {tag: "Turned a diagnosis into a ban", label: "Made a tool wrong by stage",
           why: "The stage is not a rule about which tools are allowed. It is a statement about what is known, and the useful reply is to establish the channel and retention rather than to forbid a category of spend.",
           cue: "Answer 'are we ready' with what to establish next, not with a prohibition."}
     },
     explanation: "Early stage is search mode and scale stage is scale mode. The test is whether you can say with a straight face that for every rupee in you get a known multiple back within a known period — cohort analysis done, payback period known, LTV:CAC measured. If you cannot, the manual work is the job.",
     link: "Spending into an unproven motion buys volume that does not survive, and hides the search still to be done."},

    {concept: "brgsa_m5_channel", source: "BRGSA-M05-L01", node: "Channel fit", mode: "scenario",
     caselet: "A team spends ₹2,00,000 on a paid channel. Their average contract value is ₹1,000 a month and their acquisition cost on that channel lands near ₹8,000.",
     stem: "What should the team do?",
     options: [
       "Improve the creative and the targeting first, since a high acquisition cost usually reflects a weak campaign rather than the channel.",
       "Keep the channel and raise the price, since a contract worth more would make the same acquisition cost acceptable.",
       "Stop the channel on price-point mismatch, because that arithmetic is settled before any creative decision is taken.",
       "Continue for a full quarter, because paid channels need time before their true cost per customer can be judged."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Optimised past the arithmetic", label: "Treated a structural mismatch as a creative one",
           why: "Eight thousand rupees to win a thousand-rupee-a-month contract cannot be rescued by optimisation. The channel and the price point were never compatible, and better creative moves the cost, not the order of magnitude.",
           cue: "Check whether the gap is a percentage or a multiple before reaching for optimisation."},
       1: {tag: "Changed the product to fit the channel", label: "Let the channel set the price",
           why: "Raising price to justify a channel inverts the decision. Channel-market fit asks whether the channel matches the product, the ICP and the price point — the price is an input to that test, not an output of it.",
           cue: "Fit the channel to the business. A channel that requires you to change the business has failed the test."},
       3: {tag: "Waited out a settled result", label: "Bought time the arithmetic had already priced",
           why: "Time refines an estimate that is close. Here the cost per customer is eight times the monthly contract value, which no reasonable revision brings into range.",
           cue: "Ask what a longer run could plausibly change before paying for it."}
     },
     explanation: "Channel-market fit asks whether this channel matches your product, your ICP and — the filter that gets skipped — your price point. A channel with a high cost per acquired customer cannot serve a low average contract value however good the targeting is; the arithmetic decides before the creative does.",
     link: "Quality also differs from volume, and channels differ in whether they scale at all — founder-led sales stops at a hard ceiling."},

    {concept: "brgsa_m5_activation", source: "BRGSA-M05-L05", node: "Activation and onboarding friction", mode: "judgement",
     caselet: "Onboarding asks a new user a multiple-choice preference question before they can proceed. The product team argues it is helpful because it personalises the experience.",
     stem: "How should the step be judged?",
     options: [
       "Keep it, since personalisation raises long-term retention and the cost of answering one question is small against that eventual gain.",
       "Keep it but move it later in the flow, which preserves the personalisation while reducing the number of early steps.",
       "Replace it with a smart default unless the answer is required to reach the aha, since only that justifies a step.",
       "Remove it and every other optional step, because onboarding should contain nothing but the single shortest path."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Justified a step by being helpful", label: "Used general usefulness as the test",
           why: "A step is not justified by being helpful in general, only by moving the user toward first value. Reading, considering and answering costs about thirty seconds of attention and moves nobody closer to the aha.",
           cue: "Ask what the step contributes to reaching first value, not whether it is a good idea."},
       1: {tag: "Moved the friction", label: "Relocated a step instead of testing it",
           why: "Moving it later reduces early friction, which helps. It still leaves the question unanswered: does answering it help the user reach value? If not, a smart default serves better wherever it sits.",
           cue: "Apply the test to the step itself before deciding where to put it."},
       3: {tag: "Over-corrected into a rule", label: "Stripped the flow rather than scoring it",
           why: "The audit scores each step by what it costs and what it contributes — a required integration scores high on cost because nothing works without it, and still belongs. A blanket removal discards the steps that earn their place.",
           cue: "Score the steps. A rule that removes all of them is not an audit."}
     },
     explanation: "Onboarding friction is anything between signup and the aha that costs a user time, attention or effort without contributing to reaching the aha. Cognitive, behavioural, technical and emotional friction each cost differently, and well-meaning onboarding is the usual culprit.",
     link: "By the time a user has clicked through twelve helpful steps, half of them are gone."},

    {concept: "brgsa_m6_habit", source: "BRGSA-M06-L01", node: "Habit and lifecycle", mode: "scenario",
     caselet: "A subscription product finds from customer conversations that its main reason for churn is not dissatisfaction. Customers simply stopped remembering to use it. The team's plan is to increase the frequency of reminder emails.",
     stem: "What is the weakness of that plan?",
     options: [
       "Reminder emails have low open rates, so the increase would reach too few of the lapsed customers to matter.",
       "A product that only ever fires external triggers has rented its retention, since each nudge costs something every time.",
       "Reminders should be sent to new users rather than lapsed ones, since a habit cannot be restarted once it is lost.",
       "The team should discount instead, because a lapsed customer responds to price more reliably than to a reminder."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Attacked the channel's efficiency", label: "Argued about reach rather than dependency",
           why: "Open rates would make the plan weaker, not wrong. What makes it a weakness is that an external trigger has to be fired again every time and never becomes self-sustaining.",
           cue: "Ask what happens when you stop sending. That answer separates a rented habit from a built one."},
       2: {tag: "Invented a rule about lapsed users", label: "Ruled out recovery",
           why: "Nothing says a habit cannot be restarted. The lecture's move is to attach the action to a routine the user already has, which works for lapsed users as well as new ones.",
           cue: "Look for the routine to attach to before deciding who can be recovered."},
       3: {tag: "Substituted price for habit", label: "Answered a routine failure with a discount",
           why: "The customers did not leave over price; they lost the routine. A discount changes the cost of a product they are not opening.",
           cue: "Match the intervention to the reason given, not to the easiest lever available."}
     },
     explanation: "A habit has four phases — trigger, action, reward, investment — and triggers come in two kinds. External triggers are notifications and emails: you own them and they cost you something every time. Internal triggers are the user's own situation reminding them.",
     link: "An external nudge that lands on a real internal moment can become an internal trigger; one that lands at random stays a cost forever."},

    {concept: "brgsa_m6_churn", source: "BRGSA-M06-L05", node: "Referral and network effects", mode: "judgement",
     caselet: "A marketplace has few buyers because it has few sellers, and few sellers because it has few buyers. The team plans a marketing campaign aimed equally at both groups.",
     stem: "What does the framework suggest instead?",
     options: [
       "Name it a two-sided network with a cold start, and subsidise one side deliberately until the other becomes self-sustaining.",
       "Raise the referral incentive on both sides at once, since a higher K-factor is what breaks a stalled marketplace open.",
       "Focus on product quality first, because a network that is not yet valuable cannot be marketed to either group.",
       "Treat it as a direct network effect, where any user added on either side raises the value for everyone else equally."
     ],
     answer: 0,
     wrong: {
       1: {tag: "Reached for virality", label: "Applied a spread mechanism to a value problem",
           why: "Referral makes a product spread; a network effect makes it more valuable as users join. Referring people to a marketplace with nothing on the other side does not create the value they were referred for.",
           cue: "Ask whether the problem is spread or value. They are not the same claim."},
       2: {tag: "Deferred to product quality", label: "Answered a structural problem with polish",
           why: "The product is not failing on quality; it is least valuable exactly when it most needs people to join. That is the cold start problem, and it is solved by giving one side a reason to arrive first.",
           cue: "Ask why the product is not valuable yet. If the answer is 'nobody is here', quality is not the constraint."},
       3: {tag: "Named the wrong kind", label: "Called a two-sided network a direct one",
           why: "A direct network is one where users benefit from other users of the same kind. Here two distinct groups need each other, which is what makes marketing to both equally the wrong move.",
           cue: "Count the groups. Two distinct groups that need each other is two-sided, not direct."}
     },
     explanation: "There are four kinds of network effect — direct, two-sided, indirect and data-driven — and each has a different cold start problem. Two-sided cold starts are not solved by marketing both sides equally; someone has to be given a reason to arrive before the value exists.",
     link: "Value scales roughly with the square of the number of users, because value lives in the connections rather than in the accounts."},

    {concept: "brgsa_m7_pricing", source: "BRGSA-M07-L01", node: "Pricing structure and NRR", mode: "scenario",
     caselet: "Two companies each average $10,000 in annual revenue per account. One charges a flat rate; the other charges per seat. A year later the second has grown revenue per account substantially and the first has not, with no change in either customer base.",
     stem: "What explains the difference?",
     options: [
       "The per-seat company raised its list price during the year, which the flat-rate company chose not to do.",
       "The per-seat company's customers were larger organisations to begin with, so the same structure produced more revenue from each of them.",
       "The structures make different promises about growth: per-seat revenue grows as a customer's team grows, flat rate does not.",
       "The flat-rate company has better retention, which it bought by holding its price steady through the year."
     ],
     answer: 2,
     wrong: {
       0: {tag: "Explained it by the number", label: "Attributed a structural difference to a price change",
           why: "Both companies started at the same revenue per account and neither changed customer base. The difference is what happens as a customer succeeds, which is a property of the structure and not of the list price.",
           cue: "Ask what changed. If the customer base did not, look at how the structure responds to their growth."},
       1: {tag: "Assumed different customers", label: "Changed the premise to explain the result",
           why: "The two started at the same average revenue per account, so size is controlled for. Per-seat pricing grows with the customer's headcount; flat rate is unchanged by it.",
           cue: "Check what the case has already held constant before proposing it as the cause."},
       3: {tag: "Swapped in retention", label: "Explained expansion by churn",
           why: "Retention would keep the base intact; it would not raise revenue per account. Expansion inside existing accounts is what a per-seat structure produces and a flat rate does not.",
           cue: "Separate keeping a customer from growing one. They are different metrics."}
     },
     explanation: "Pricing is an engineered structure, not a number. Each structure makes a different promise about how revenue grows as the customer succeeds: per-seat grows with the team, flat rate does not, and identical revenue today can carry completely different futures.",
     link: "A 5% improvement in pricing structure beats a 5% improvement in acquisition nearly every time, because it applies to every existing customer immediately."},

    {concept: "brgsa_m7_pipeline", source: "BRGSA-M07-L04", node: "Sales integration and payback", mode: "scenario",
     caselet: "Marketing reports four times more qualified leads than last year. Sales reports its revenue target. Customer success reports renewals. Headcount has grown and total revenue is flat.",
     stem: "What is the most defensible diagnosis?",
     options: [
       "One of the three teams is misreporting, since three honest reports cannot coexist with flat revenue.",
       "Marketing's lead quality has fallen, which is the usual cause when volume rises and revenue does not.",
       "The market has softened, so the same motion is producing less revenue than it did a year ago.",
       "Every handoff between the teams is a place the motion loses revenue that nobody records as lost."
     ],
     answer: 3,
     wrong: {
       0: {tag: "Looked for a false report", label: "Assumed the numbers must disagree",
           why: "All three reports can be true at once. That is what makes the leak invisible: each team reports its own success honestly while the integrated motion loses money at every join.",
           cue: "When each report is defensible, look between them rather than inside them."},
       1: {tag: "Blamed the input", label: "Named lead quality without measuring a join",
           why: "Lead quality is one candidate, and it is a hypothesis about one join. What the situation calls for is measuring conversion and elapsed time at each handoff before naming any of them.",
           cue: "Measure the joins before choosing which one to blame."},
       2: {tag: "Externalised the cause", label: "Explained an internal leak by the market",
           why: "A softer market is possible and is not what the evidence points at. Volume rose sharply and revenue did not move, which is the shape of a motion losing what it is given.",
           cue: "Prefer an explanation that accounts for the volume increase, not one that ignores it."}
     },
     explanation: "Revenue passes through several pairs of hands — marketing to sales, sales to account executive, account executive to customer success — and every handoff is a place the motion can lose revenue that nobody records as lost. Shared definitions and an SLA between teams are the correctives.",
     link: "Volume poured into a leaking motion increases the loss proportionally; only the joins decide how much reaches revenue."},

    {concept: "brgsa_m8_priority", source: "BRGSA-M08-L01", node: "Prioritisation", mode: "judgement",
     caselet: "A team's easiest idea — a homepage headline test shippable in an afternoon — ranks fourth on ICE behind three slower activation experiments. Activation is the team's primary constraint.",
     stem: "What should the team do?",
     options: [
       "Run the headline test first, since shipping something quickly builds momentum for the slower experiments behind it.",
       "Run the activation experiments first, because impact is scored against the primary constraint and ease is one input of three.",
       "Re-score the headline test, since an experiment shippable in an afternoon should score higher on ease than it evidently did.",
       "Run all four in parallel, which removes the need to rank them and produces four results in the same period."
     ],
     answer: 1,
     wrong: {
       0: {tag: "Let ease decide", label: "Used the tiebreaker as the ranking",
           why: "The ranking feeling wrong is the framework working. Ease is one input of three, not a tiebreaker that overrides the other two, and impact is scored against the constraint the team is actually limited by.",
           cue: "Ask which of the three inputs you are letting decide, and whether the other two agree."},
       2: {tag: "Adjusted the score to fit the preference", label: "Re-scored until the answer changed",
           why: "Ease covers building and measuring together, and the headline test may already be scored correctly. Re-scoring to reach a preferred ranking is how ICE becomes decorative.",
           cue: "Change a score when the evidence changes, not when the ranking disappoints."},
       3: {tag: "Refused to prioritise", label: "Ran everything instead of ranking",
           why: "Prioritisation exists because a team has many more ideas than capacity. Running four at once splits the capacity and usually contaminates the measurement of the constraint.",
           cue: "Ask what running everything costs. If capacity were free, there would be nothing to prioritise."}
     },
     explanation: "Impact is scored against the primary constraint, never against any metric that happens to be movable. Confidence is scored on evidence, and ease covers building and measuring together. A healthy list is spread across the range; if everything scores alike, the prioritisation is decorative.",
     link: "The ranking will sometimes feel wrong, and that is the discipline doing its job rather than failing."},

    {concept: "brgsa_m8_decision", source: "BRGSA-M08-L03", node: "Decision rules", mode: "scenario",
     caselet: "An experiment hypothesised activation moving from 34% to 45%. It lands at 38%, and the team wants to keep iterating.",
     stem: "What settles whether to continue?",
     options: [
       "Whether 38% is a statistically significant improvement over 34%, which is what decides if the effect is real.",
       "Whether the team has capacity, since a live experiment that is improving the number is worth keeping while resources allow.",
       "Whether another variation could plausibly close the remaining gap, which is the test for a worthwhile iteration.",
       "The thresholds written before the experiment went live, since all four parts of the rule are agreed in advance."
     ],
     answer: 3,
     wrong: {
       0: {tag: "Reached for significance", label: "Answered a decision question with a statistical one",
           why: "38% may well be a real improvement and still be below the level worth maintaining. Significance says whether the effect exists; the kill threshold says whether it is worth the engineering time and infrastructure it costs.",
           cue: "Separate 'is it real' from 'is it worth keeping'. Both can be answered and they can disagree."},
       1: {tag: "Let capacity decide", label: "Used available resource as the criterion",
           why: "Capacity is exactly what a kill threshold protects. A live experiment costs engineering time and infrastructure whether or not it is working, and a successful kill returns that capacity to the queue.",
           cue: "Ask what the experiment is displacing, not whether it can be afforded."},
       2: {tag: "Iterated without a bound", label: "Retried with no limit set in advance",
           why: "A bounded iterate is a second attempt with a limit agreed beforehand. An unbounded one is the same experiment retried indefinitely because nobody wrote down when to stop.",
           cue: "If you are iterating, say now how many attempts and to what threshold."}
     },
     explanation: "All four parts of the decision rule are written before the experiment goes active: the metric, the scale threshold, the kill threshold, and a time or sample bound. Once the numbers are agreed in advance, the arriving data settles the question, because the argument happened while nobody knew the answer.",
     link: "Deciding after the data arrives is how teams end up picking the cohort that flatters the result."}
  ]};

  function addCourseAssessmentItems(course) {
    var items = (COURSE_ASSESSMENT_ITEMS[course.id] || [])
      .concat(course.id === "SCLM" ? SCLM_EXAM_ONLY : [])
      .concat(course.id === "SPMS" ? SPMS_EXAM_ONLY : [])
      .concat(course.id === "BRGSA" ? BRGSA_EXAM_ONLY : []);
    if (!items.length) return;
    var seen = {};
    items.forEach(function (item) {
      var concept = (course.concepts || []).filter(function (entry) { return entry.id === item.concept; })[0];
      /* Silence here would be the F-47 failure again — a scenario that resolves to
         nothing and is never missed. An unresolvable concept id is a defect in the
         item, so say so rather than dropping it. */
      if (!concept) throw new Error("Course-assessment item names an unknown concept: " + item.concept + " in " + course.id);
      seen[item.concept] = (seen[item.concept] || 0) + 1;
      addQuestion(course, {
        id: item.concept + "_cla" + seen[item.concept],
        courseId: course.id,
        conceptId: item.concept,
        supportingConceptIds: [],
        module: concept.module,
        source: item.source,
        sourceIds: [item.source],
        node: item.node,
        pattern: item.mode === "numeric" ? "Compute and choose"
          : item.mode === "definition" ? "State the idea precisely"
          : item.mode === "scenario" ? "Read the situation" : "Make the call",
        /* The perspective drives format/variety spread in selection, so a definition
           and a judgement call on one concept are treated as the different questions
           they are rather than as two of the same. */
        perspective: item.mode === "definition" ? "explain" : item.mode === "numeric" ? "apply" : "decide",
        type: "mcq",
        skills: item.mode === "numeric" ? ["apply", "compute"] : item.mode === "definition" ? ["recognise", "distinguish"] : ["apply", "judge"],
        difficulty: item.mode === "definition" ? 2 : item.mode === "numeric" ? 4 : 3,
        variantFamily: item.concept + "_cla_" + item.mode,
        boss: false,
        examOnly: !!item.examOnly,
        caselet: item.caselet || null,
        stem: item.stem,
        options: item.options,
        answer: item.answer,
        diagnoses: item.options.map(function (_, index) {
          return (item.wrong && item.wrong[index]) || null;
        }),
        explanation: item.explanation,
        link: item.link
      });
    });
  }

  /* Retired: `_term_cloze`, replaced by `_contrast`. Owner decision, 2026-08-15.
   *
   * The old item printed the concept's summary with its name blanked out and asked the
   * learner to pick that name from four concept names. Measured over the built bank it
   * paid **100% on 62 of 62 option sets** — and a label-selection item cannot be
   * repaired by choosing better distractors, because exactly one option can be the
   * concept's name. Worse, the run's own orientation copy prints that name several
   * steps earlier ("Carry forward: X. Now add Y"), so the answer was already on the
   * screen the learner came from. Suppressing the name on the step would have moved
   * the number without changing what the learner already knew, which is gaming the
   * probe rather than fixing the item.
   *
   * The replacement keeps the same job — tell this concept apart from the ones beside
   * it — and makes it answerable only by reading. All four options are claims about
   * THIS concept; three of them are neighbouring concepts' claims wearing its label.
   * Simulated before it was written: 96.9% -> 24.2%.
   *
   * Deleting the family outright was not an option: the bank floor is 792 items and
   * every concept must keep at least 10 surfaces, 8 variant families, 10 actively
   * scheduled surfaces and 6 active families. A retirement that drops a surface per
   * concept fails all four gates, so this replaces rather than removes. */
  function addContrastCheck(course, concept, data, allData) {
    var neighbours = nearbyConcepts(course, concept);
    var byId = {};
    (allData || []).forEach(function (entry) { byId[entry.id] = entry; });

    /* Neighbours first, length guard as a constraint — `relevantWrong`'s existing
       contract (LAW-48). Taking the three module siblings unconditionally made
       `sclm_smoothing`'s summary tower over theirs and exposed the answer by length, so
       relevance is maximised subject to the shape guard rather than instead of it. */
    var preferred = neighbours.map(function (neighbour) {
      var source = byId[neighbour.id];
      return source && source.summary;
    }).filter(Boolean);
    var fallback = (allData || []).filter(function (entry) {
      return entry.id !== concept.id && entry.summary;
    }).map(function (entry) { return entry.summary; });
    var wrongSummaries = relevantWrong(data.summary, preferred, fallback);

    var ownerOf = {};
    (allData || []).forEach(function (entry) {
      if (entry.summary) ownerOf[String(entry.summary).trim()] = entry.name;
    });
    var entries = [{text: data.summary, owner: data.name}].concat(wrongSummaries.map(function (text) {
      return {text: text, owner: ownerOf[String(text).trim()]};
    }));
    /* A concept with too few neighbours carrying a summary would silently ship a
       two-option item. Loudly is better than quietly (see LAW-65). */
    if (entries.length < 4) throw new Error(course.id + "/" + concept.id + " has only " + entries.length + " summaries for a contrast check; a silent short option set is how content ships and is never served");

    var attributed = attributedChoices(entries, data.name);
    var correct = attributed[0];
    var choices = choiceSet(correct, attributed.slice(1), stableNumber(concept.id));
    addQuestion(course, {
      id: concept.id + "_contrast",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.source,
      sourceIds: [data.source],
      node: data.name,
      pattern: "Tell it from its neighbours",
      perspective: "retrieve",
      type: "cloze",
      skills: ["recognise", "distinguish"],
      difficulty: 2,
      variantFamily: concept.id + "_contrast",
      /* No caselet. The old one was the summary with the name blanked, which is now
         the correct option — the case would have printed the answer (LAW-63). */
      caselet: "",
      stem: "Three of these attach a neighbouring idea's claim to " + data.name + ". Which one is actually true of it?",
      template: ["The claim that holds is", ""],
      blanks: [{label: "Choose the claim that holds", options: choices.options, answer: choices.answer}],
      explanation: data.summary,
      link: data.bridge,
      misconceptions: choices.options.map(function (option, index) { return index === choices.answer ? null : "neighbouring-concept:" + option; }),
      repairId: concept.id + "_case_cloze"
    });
  }

  /* The primer, inverted (LAW-63).
   *
   * It used to print the principle — "Know this: <summary>" — and then ask the learner
   * to pick that same sentence out of four options. All 64 of them, with the answer on
   * the same screen, and with distractors borrowed from other concepts, so the task was
   * to match a string: answerable without reading and unanswerable by reasoning. First
   * contact with every idea in the course was spent doing that.
   *
   * It now runs the other way round. The learner meets the concrete case first and
   * commits to what they think is going on, in their own words, before anything names
   * the rule. The principle then arrives as the answer to their own prediction.
   *
   * Missing is the point, which is why nothing here is marked, scored, keyed, or turned
   * into evidence — there is no answer to be wrong about. The support ladder is driven
   * by the concept's scored questions through `updatePrimerFromChallenge`, which is the
   * signal that was worth reading all along. */
  function addPrimer(course, concept, data) {
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
      skills: ["predict"],
      difficulty: 1,
      variantFamily: concept.id + "_primer",
      boss: false,
      primerOnly: true,
      // Shown before the learner commits: the situation, and nothing that names the rule.
      primerCase: data.caselet,
      // Shown only after they have committed, as the answer to their own prediction.
      primerFact: data.summary,
      primerApplication: data.application,
      primerConnection: data.bridge,
      primerMisconception: (data.confusions || [])[0] || "A nearby idea can look similar without using the same rule.",
      caselet: "",
      stem: "Before anything names it: what rule do you think this case is showing, and why?",
      explanation: data.summary,
      link: data.bridge
    });
  }

  function addBridgeCloze(course, concept, data, allData) {
    /* Was: four different concepts' bridges, so the only option carrying this concept's
       vocabulary was the correct one. Now every option is a causal explanation offered
       FOR this concept, three of them borrowed from a neighbour — the learner has to
       read the causality rather than spot the topic. (R3; measured 48.5% before.) */
    var others = allData.filter(function (entry) { return entry.id !== concept.id && entry.bridge; });
    var nearest = comparableWrong(data.bridge, others.map(function (entry) { return entry.bridge; }));
    var ownerOf = {};
    others.forEach(function (entry) { ownerOf[String(entry.bridge).trim()] = entry.name; });
    var entries = [{text: data.bridge, owner: data.name}].concat(nearest.map(function (text) {
      return {text: text, owner: ownerOf[String(text).trim()]};
    }));
    var attributed = attributedChoices(entries, data.name);
    var choices = balancedChoiceSet(attributed[0], attributed.slice(1), stableNumber(concept.id + "bridge"), concept.id + "_bridge_choice");
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
    /* Was: four different concepts' principles, which made "the correction" findable by
       spotting the one sentence about this topic — 81.9%, the second worst family in the
       bank. Now all four corrections are offered for THIS concept, so the learner has to
       know which principle actually repairs the classmate's claim. (R3.) */
    var others = allData.filter(function (entry) { return entry.id !== concept.id && entry.summary; });
    var nearest = comparableWrong(data.summary, others.map(function (entry) { return entry.summary; }));
    var ownerOf = {};
    others.forEach(function (entry) { ownerOf[String(entry.summary).trim()] = entry.name; });
    var entries = [{text: data.summary, owner: data.name}].concat(nearest.map(function (text) {
      return {text: text, owner: ownerOf[String(text).trim()]};
    }));
    var attributed = attributedChoices(entries, data.name);
    var choices = balancedChoiceSet(attributed[0], attributed.slice(1), stableNumber(concept.id + "repair"), concept.id + "_repair_choice");
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
    var actionWrong = relevantWrong(data.application, data.applicationWrong || [], nearbyApplications(data, allData));
    var actionChoices = choiceSet(data.application, actionWrong, stableNumber(concept.id + "case"));
    /* The decision blank carries the concept as a TRAILING tag, not a leading label, and
       the difference was found by reading the rendered screen rather than the number.
       Leading labels made the case-cloze print eight options — two blanks of four — each
       opening on the same 36-character prefix ("Desirability, feasibility, viability:
       ..."), which buries the words that actually differ behind identical text. The rule
       this defends against matches a substring anywhere in the option, so position is
       free: the distinguishing decision leads, the tag trails, and the density is
       equalised exactly as a prefix would. The framework blank below keeps the leading
       form, because there the option IS a claim about the framework and reads correctly.
       Dropping the tag entirely was measured too and costs 3-6 points (SPMS 25.0 ->
       30.8, IBM 32.7 -> 34.6), so this keeps both the reading and the number. */
    actionChoices.options = actionChoices.options.map(function (text) {
      var body = String(text || "").trim();
      if (!body) return text;
      return ensureSentence(body) + " (" + data.name + ")";
    });
    /* The framework blank was the retired `_term_cloze`'s defect in a second place: pick
       this concept's NAME out of four concept names, which is 100% name-matchable by
       construction because exactly one option can be the concept's label. It now asks
       what the framework requires rather than what it is called, so the options are
       claims and the learner has to know which test this framework actually applies.
       The concept's name stays in the template line above the blank, so the item still
       reads as "the framework that justifies it is ...". */
    var frameworkPreferred = nearbyConcepts(course, concept).map(function (entry) {
      var neighbour = (allData || []).filter(function (candidate) { return candidate.id === entry.id; })[0];
      return neighbour && neighbour.summary;
    }).filter(Boolean);
    var frameworkFallback = (allData || []).filter(function (entry) {
      return entry.id !== concept.id && entry.summary;
    }).map(function (entry) { return entry.summary; });
    var frameworkOwner = {};
    (allData || []).forEach(function (entry) {
      if (entry.summary) frameworkOwner[String(entry.summary).trim()] = entry.name;
    });
    var frameworkEntries = [{text: data.summary, owner: data.name}].concat(
      relevantWrong(data.summary, frameworkPreferred, frameworkFallback).map(function (text) {
        return {text: text, owner: frameworkOwner[String(text).trim()]};
      }));
    if (frameworkEntries.length < 4) throw new Error(course.id + "/" + concept.id + " has only " + frameworkEntries.length + " summaries for the framework blank; a silent short option set is how content ships and is never served");
    var framework = attributedChoices(frameworkEntries, data.name);
    var termChoices = choiceSet(framework[0], framework.slice(1), stableNumber(concept.id + "term2"));
    addQuestion(course, {
      id: concept.id + "_case_cloze",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.caseSource || data.source,
      sourceIds: unique([data.caseSource || data.source]),
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
      explanation: data.caseExplanation || data.summary,
      link: data.caseLink || data.bridge,
      misconceptions: ["wrong-decision", "wrong-framework"],
      repairId: concept.id + "_bridge_cloze"
    });
  }

  function writtenGap(id, criterionId, kind, scope, label, repair) {
    return {id: id, criterionId: criterionId, kind: kind, scope: scope, label: label, repair: repair};
  }

  function addShortAnswer(course, concept, data) {
    addQuestion(course, {
      id: concept.id + "_short_answer",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      source: data.source,
      sourceIds: unique([data.source]),
      node: data.name,
      pattern: "Short-form explanation",
      perspective: "generate",
      type: "short-answer",
      skills: ["explain", "apply", "generate"],
      difficulty: 3,
      variantFamily: concept.id + "_short-form-response",
      boss: false,
      estimatedMinutes: 3,
      selfReviewOnly: true,
      writtenMode: "short",
      caselet: null,
      stem: "In two to three sentences, how would you explain " + data.name + " in your own words, and what kind of decision should it change?",
      rubric: [
        {id: "understanding", label: "Course understanding", description: "Explains " + data.name + " accurately in the learner's own words; the exact term is optional when the idea is clear."},
        {id: "judgement", label: "Decision use", description: "Explains when the idea should change a decision, consistently with this course move: " + ensureSentence(data.application)}
      ],
      writtenGaps: [
        writtenGap("concept-missing", "understanding", "missing", "concept", "Course idea not explained", "State the idea in plain language before naming what it changes."),
        writtenGap("concept-inaccurate", "understanding", "misunderstood", "concept", "Course idea used inaccurately", "Return to the course anchor and correct what the idea permits you to conclude."),
        writtenGap("decision-use-missing", "judgement", "missing", "writing", "Decision use is missing", "Name the decision this idea should change, not only its definition."),
        writtenGap("decision-use-inaccurate", "judgement", "misunderstood", "concept", "Decision use is inaccurate", "Check that the proposed decision follows from the course idea rather than merely sounding related.")
      ],
      exemplar: ensureSentence(data.summary) + " " + ensureSentence(data.application),
      explanation: data.summary,
      link: data.bridge,
      misconceptions: [],
      repairId: concept.id + "_bridge_cloze"
    });
  }

  function addCaseAnswer(course, concept, data) {
    addQuestion(course, {
      id: concept.id + "_case_answer",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [],
      module: concept.module,
      /* The principle can come from the concept's opening lecture while the case,
       * defensible decision, and causal link come from a later applied lecture.
       * A case answer needs both authorities. */
      source: data.caseSource || data.source,
      sourceIds: unique([data.source, data.caseSource || data.source]),
      node: data.name,
      pattern: "Case-based written response",
      perspective: "generate",
      type: "short-answer",
      skills: ["explain", "apply", "evaluate", "generate"],
      difficulty: 4,
      variantFamily: concept.id + "_case-response",
      boss: false,
      estimatedMinutes: course.id === "IBM" ? 6 : 5,
      selfReviewOnly: true,
      writtenMode: "case",
      caselet: data.caselet,
      stem: "What should be done in this case? State the governing course idea, make a clear decision, and explain how a specific case fact supports it in " + (course.id === "IBM" ? "five to eight" : "four to six") + " sentences.",
      rubric: [
        {id: "understanding", label: "Course understanding", description: "Applies " + data.name + " accurately to this case; the exact term need not be named if the idea is clearly used."},
        {id: "judgement", label: "Decision", description: ensureSentence(data.application)},
        {id: "case_evidence", label: "Case evidence and reasoning", description: "Uses a specific fact from the case and explains why it supports the decision: " + ensureSentence(data.caseLink || data.bridge)}
      ],
      writtenGaps: [
        writtenGap("concept-missing", "understanding", "missing", "concept", "Course idea not applied", "State the governing idea and show what it changes in this case."),
        writtenGap("concept-inaccurate", "understanding", "misunderstood", "concept", "Course idea applied inaccurately", "Return to the course anchor and correct what the framework permits you to conclude."),
        writtenGap("decision-missing", "judgement", "missing", "writing", "Decision is missing", "Make the recommendation explicit before defending it."),
        writtenGap("decision-unsupported", "judgement", "misunderstood", "concept", "Decision does not follow", "Check that the recommendation follows from the governing idea and not from an unrelated preference."),
        writtenGap("case-fact-missing", "case_evidence", "missing", "writing", "Decisive case fact is missing", "Name the fact that carries the recommendation rather than referring to the case generally."),
        writtenGap("case-fact-misread", "case_evidence", "misunderstood", "concept", "Case evidence is misread", "Re-read what the case fact actually shows before using it as support."),
        writtenGap("causal-link-missing", "case_evidence", "missing", "writing", "Fact-to-decision link is missing", "Add the because step: explain why that fact makes this decision stronger, weaker, safer, or riskier.")
      ],
      /* The exemplar has to satisfy the criteria it is shown beside.
       *
       * It previously read name + application + bridge + summary and never
       * touched the caselet, so it could not meet "uses a specific fact from the
       * case" - and the marker refused that criterion on 12 of 27 case exemplars,
       * evenly across both subjects, while every other criterion tracked the
       * subject's authoring quality. `caseEvidence` is the authored sentence that
       * names the deciding fact and says why it carries the decision, which is
       * exactly what the criterion asks a learner to produce. */
      exemplar: "The governing course idea is " + data.name + ". " + ensureSentence(data.application) + " " +
        (data.caseEvidence ? ensureSentence(data.caseEvidence) + " " : "") +
        ensureSentence(data.caseLink || data.bridge) + " " + ensureSentence(data.caseExplanation || data.summary),
      explanation: data.caseExplanation || data.summary,
      link: data.caseLink || data.bridge,
      misconceptions: [],
      repairId: concept.id + "_case_cloze"
    });
  }

  /* A written-only framework still has to belong to the concept graph. Linking it
   * through an objective boss would violate its declared assessment mode, so it
   * receives a linked case response with the nearest non-objective idea. It stays
   * `case`, not `integrated`: the latter is reserved for the few whole authored
   * scenarios that fill IBM's ten-mark section ahead of generated practice. */
  function addWrittenLinkAnswer(course, concept, partner, data, partnerData) {
    addQuestion(course, {
      id: concept.id + "_written_link",
      courseId: course.id,
      conceptId: concept.id,
      supportingConceptIds: [partner.id],
      module: concept.module,
      source: data.source,
      sourceIds: unique([data.source, partnerData.source]),
      node: data.name + " → " + partnerData.name,
      pattern: "Written framework connection",
      perspective: "generate",
      type: "short-answer",
      skills: ["explain", "apply", "connect", "generate"],
      difficulty: 4,
      variantFamily: concept.id + "_written-link",
      boss: false,
      estimatedMinutes: 7,
      selfReviewOnly: true,
      writtenMode: "case",
      caselet: ensureSentence(data.caselet) + " A second decision in the same organisation raises " + partnerData.name + ": " + ensureSentence(partnerData.caselet),
      stem: "Write a connected recommendation. Explain what " + data.name + " settles first, what " + partnerData.name + " settles next, and why one framework cannot substitute for the other.",
      rubric: [
        {id: "first_idea", label: data.name, description: "Uses the first framework accurately and states the decision it governs: " + ensureSentence(data.application)},
        {id: "second_idea", label: partnerData.name, description: "Uses the connected idea accurately and states its different decision: " + ensureSentence(partnerData.application)},
        {id: "integration", label: "Connection", description: "Explains the order or dependency between the two decisions instead of listing the ideas separately."}
      ],
      writtenGaps: [
        writtenGap("first-missing", "first_idea", "missing", "concept", "First framework is missing", "State what the first framework permits you to conclude before moving to the second decision."),
        writtenGap("first-inaccurate", "first_idea", "misunderstood", "concept", "First framework is inaccurate", "Return to the first course anchor and correct what it permits you to conclude."),
        writtenGap("second-missing", "second_idea", "missing", "concept", "Connected idea is missing", "Name the second decision and apply the idea that actually governs it."),
        writtenGap("second-inaccurate", "second_idea", "misunderstood", "concept", "Connected idea is inaccurate", "Separate the second idea from the first and correct its decision rule."),
        writtenGap("connection-missing", "integration", "missing", "writing", "Ideas are listed, not connected", "Add the because step that shows how the first decision enables, limits, or changes the second."),
        writtenGap("connection-reversed", "integration", "misunderstood", "concept", "Reasoning order is reversed", "Rebuild the chain in teaching order so the earlier decision does not depend on its own consequence.")
      ],
      exemplar: ensureSentence(data.summary) + " " + ensureSentence(data.application) + " " + ensureSentence(partnerData.summary) + " " + ensureSentence(partnerData.application) + " Together, the first decision sets the condition under which the second can work; " + ensureSentence(data.bridge) + " " + ensureSentence(partnerData.bridge),
      explanation: data.summary,
      link: data.bridge + " " + partnerData.bridge,
      misconceptions: [],
      repairId: concept.id + "_case_answer"
    });
  }

  /* Integrated scenarios are authored whole, not generated from concept fields.
   *
   * Every other written family is assembled — stem from the concept name, rubric
   * from its application, exemplar from summary plus application. That assembly
   * is exactly what produced model answers whose closing sentence did not follow
   * from the question, and it cannot produce a situation that spans four
   * concepts without naming any of them. So these carry their own caselet, task,
   * criteria and exemplar, and this function only resolves the evidence
   * boundary: the union of the declared concepts' lectures. */
  function addIntegratedScenarios(course) {
    var scenarios = (window.T6_INTEGRATED || {})[course.id] || [];
    scenarios.forEach(function (scenario) {
      /* Was a silent `return` on any unresolvable conceptId, which is how authored
       * content ships and is never served — the failure mode §5 of the overhaul brief
       * names first. A scenario that cannot resolve its concepts is a defect in the
       * bank, so it stops the build and says which id it could not find. */
      var missing = scenario.conceptIds.filter(function (id) {
        return !course.concepts.some(function (concept) { return concept.id === id; });
      });
      if (missing.length) {
        throw new Error("Integrated scenario " + scenario.id + " (" + course.id + ") names concept id(s) that do not exist: " + missing.join(", "));
      }
      var concepts = scenario.conceptIds.map(function (id) {
        return course.concepts.filter(function (concept) { return concept.id === id; })[0];
      });
      var primary = concepts[0];
      addQuestion(course, {
        id: scenario.id,
        courseId: course.id,
        conceptId: primary.id,
        supportingConceptIds: concepts.slice(1).map(function (concept) { return concept.id; }),
        module: scenario.module,
        source: primary.source,
        sourceIds: unique(concepts.map(function (concept) { return concept.source; })),
        node: scenario.title,
        pattern: "Integrated case response",
        perspective: "generate",
        type: "short-answer",
        skills: ["explain", "apply", "evaluate", "generate"],
        difficulty: 5,
        variantFamily: scenario.id,
        boss: false,
        estimatedMinutes: 12,
        selfReviewOnly: true,
        writtenMode: "integrated",
        /* The examiner-only slice. `examReservedIds` is a late tiebreaker and depends
           on Learn having slack; this is the hard reservation, and it is only safe
           because these items are additional to a Learn surface set that is already
           complete without them. Nothing shared is excluded — see §4.2 of the brief. */
        examOnly: !!scenario.examOnly,
        releasedCase: !!scenario.releasedCase,
        caselet: scenario.caselet,
        stem: scenario.task,
        rubric: scenario.rubric.map(function (criterion) {
          return {id: criterion.id, label: criterion.label, description: criterion.description};
        }),
        writtenGaps: [
          writtenGap("ideas-missing", "diagnosis", "missing", "concept", "Governing ideas not named", "Say which course ideas this situation calls for before recommending anything."),
          writtenGap("ideas-wrong", "diagnosis", "misunderstood", "concept", "Wrong ideas applied", "Re-read the situation for the symptom each framework is meant to explain."),
          writtenGap("evidence-missing", "evidence", "missing", "writing", "Case figures not used", "Quote the numbers that carry your argument rather than describing the case."),
          writtenGap("evidence-misread", "evidence", "misunderstood", "concept", "Case figures misread", "Check what each figure actually shows before resting a conclusion on it."),
          writtenGap("integration-missing", "integration", "missing", "writing", "Ideas listed, not connected", "Show how one finding causes or constrains the next instead of covering them in turn."),
          writtenGap("decision-missing", "decision", "missing", "writing", "No decision stated", "Commit to what should be done; an analysis without a recommendation scores nothing here."),
          writtenGap("decision-unsupported", "decision", "misunderstood", "concept", "Decision does not follow", "Check the recommendation follows from the diagnosis rather than from general good practice."),
          writtenGap("limit-missing", "limit", "missing", "writing", "No condition or cost named", "Say what would change your recommendation, or what it costs to follow it.")
        ],
        exemplar: scenario.exemplar,
        explanation: scenario.title,
        link: primary.bridge || "",
        misconceptions: [],
        repairId: primary.id + "_bridge_cloze"
      });
    });
  }

  /* `suffix` distinguishes the second and later pairs in a module that holds more than two
   * concepts. The first pair keeps the original unsuffixed id, so no question that has ever
   * shipped changes its identity — history, evidence files and run definitions all key on ids. */
  function addModuleMatch(course, module, pair, dataById, suffix) {
    var first = dataById[pair[0].id];
    var second = dataById[pair[1].id];
    var choices = rotate([
      first.summary,
      second.summary,
      first.application,
      second.application
    ], module % 4);
    function answerFor(value) { return choices.indexOf(value); }
    var matchStems = [
      "Pair each framework label with the principle or decision that belongs to it.",
      "Separate the two ideas by matching every row to the course statement it requires.",
      "Match each principle and decision row to the statement that correctly completes it.",
      "Distinguish the paired frameworks: assign each claim or action to the correct row.",
      "For each row, choose the precise explanation or action governed by that framework."
    ];
    addQuestion(course, {
      id: course.id.toLowerCase() + "_m" + module + "_match" + (suffix || ""),
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
      stem: matchStems[stableNumber(course.id + "|" + module + "|" + (suffix || "first")) % matchStems.length],
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

  function addModuleBoss(course, module, pair, dataById, variant, suffix) {
    var first = dataById[pair[0].id];
    var second = dataById[pair[1].id];
    variant = variant || 1;
    var allData = Object.keys(dataById).map(function (id) { return dataById[id]; });
    // A boss tests telling the module's two concepts apart, so the paired
    // concept's decision is a relevant distractor here rather than a borrowed one.
    var firstWrong = relevantWrong(first.application, (first.applicationWrong || []).concat([second.application]), nearbyApplications(first, allData));
    var secondWrong = relevantWrong(second.application, (second.applicationWrong || []).concat([first.application]), nearbyApplications(second, allData));
    /* A boss `node` is "First → Second", so the name-matching rule keys on both names
       at once and step 1's correct decision carried the first concept's vocabulary while
       one of its distractors carried the second's. Measured 41.3% over 480 option sets —
       the largest family in the bank, and one no earlier probe had broken out. Each
       step's options are now labelled with that step's own concept, so every option in
       the set carries the same name and the step is decided by the decision, not the
       label. (R3; step 3 already names both concepts in all four options.) */
    var firstChoices = choiceSet(first.application, firstWrong, stableNumber(course.id + module + "a" + variant));
    var secondChoices = choiceSet(second.application, secondWrong, stableNumber(course.id + module + "b" + variant));
    firstChoices.options = attributedChoices(firstChoices.options.map(function (text) {
      return {text: text, owner: text === first.application ? first.name : null};
    }), first.name);
    secondChoices.options = attributedChoices(secondChoices.options.map(function (text) {
      return {text: text, owner: text === second.application ? second.name : null};
    }), second.name);
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
      id: course.id.toLowerCase() + "_m" + module + "_boss_" + variant + (suffix || ""),
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
    /* `examOnly` leaves here and nowhere else: this is the one place study-set pools
       are built, so excluding it once keeps every Learn route out of the reserved
       slice without a second filter drifting from this one. */
    var activeQuestions = questions.filter(function (question) { return !question.optionShapeRisk && !question.primerOnly && !question.examOnly; });
    var bossIds = activeQuestions.filter(function (question) { return question.boss; }).map(function (question) { return question.id; });
    course.runs.forEach(function (run) {
      if (run.module >= 1 && run.module <= 8) {
        run.questionPoolIds = activeQuestions.filter(function (question) { return question.module === run.module; }).map(function (question) { return question.id; });
        run.questionCount = 8;
        run.bossIds = run.questionPoolIds.filter(function (id) { return course.questions[id].boss; });
        /* Practise the answer shape the real paper rewards inside the module where
         * the idea is taught. A quota only exists when that module actually has the
         * format, so this never invents prose for an objective paper or a numerical
         * task for material that does not support one. */
        var quotaShape = course.id === "IBM" ? {type:"short-answer", count:4}
          : course.id === "BRGSA" ? {type:"short-answer", count:2}
          : course.id === "SCLM" ? {type:"numeric", count:2}
          : {type:"msq", count:2};
        var quotaAvailable = run.questionPoolIds.filter(function (id) {
          return (course.questions[id].type || "mcq") === quotaShape.type;
        }).length;
        run.formatQuotas = quotaAvailable ? [{type:quotaShape.type, count:Math.min(quotaShape.count, quotaAvailable)}] : [];
        if (course.id === "BRGSA") {
          var caseAvailable = run.questionPoolIds.filter(function (id) { return course.questions[id].type === "case-cloze"; }).length;
          if (caseAvailable) run.formatQuotas.push({type:"case-cloze", count:1});
        }
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
      var mode = assessmentMode(course, concept);
      addPrimer(course, concept, dataById[concept.id]);
      if (mode !== "written") {
        addContrastCheck(course, concept, dataById[concept.id], allData);
        addBridgeCloze(course, concept, dataById[concept.id], allData);
        addMisconceptionRepair(course, concept, dataById[concept.id], allData);
        addCaseCloze(course, concept, dataById[concept.id], allData);
      }
      /* The final-paper contract has prose responses only in BRGSA and IBM.
       * Those subjects receive both fast framework fluency and full case transfer.
       * SPMS and SCLM still carry case-based objective/numeric work, but inventing
       * prose practice for them would train a format their papers do not ask for. */
      if ((course.id === "BRGSA" || course.id === "IBM") && mode !== "objective") {
        addShortAnswer(course, concept, dataById[concept.id]);
        addCaseAnswer(course, concept, dataById[concept.id]);
      }
    });
    course.concepts.forEach(function (concept, index) {
      if (assessmentMode(course, concept) !== "written") return;
      var candidates = course.concepts.filter(function (other) {
        return other.id !== concept.id && assessmentMode(course, other) !== "objective";
      }).sort(function (a, b) {
        var aModule = a.module === concept.module ? 0 : 1;
        var bModule = b.module === concept.module ? 0 : 1;
        return aModule - bModule || Math.abs(course.concepts.indexOf(a) - index) - Math.abs(course.concepts.indexOf(b) - index);
      });
      if (!candidates.length) throw new Error(course.id + "/" + concept.id + " has no non-objective partner for written linkage");
      addWrittenLinkAnswer(course, concept, candidates[0], dataById[concept.id], dataById[candidates[0].id]);
    });
    /* After the per-concept families, because these span several of them. */
    if (course.id === "BRGSA" || course.id === "IBM") addIntegratedScenarios(course);
    /* CHAIN THE MODULE, DO NOT JUST TAKE THE FIRST TWO.
     *
     * The module match and the boss steps are the only generated surfaces that carry
     * `supportingConceptIds`, so they are the entire link mechanism `conceptLinks()` reads.
     * While every module held exactly two concepts, `pair.slice(0, 2)` was invisible. It is
     * not harmless: a third concept in a module was born with no link at all, and — because
     * the slice takes array order — whichever concept sorted third **lost the links it already
     * had**, silently, with `groupWeaknesses()` reporting it isolated for ever.
     *
     * Chaining consecutive pairs gives every concept a link to its neighbour and reads as the
     * sequence the module teaches.
     *
     * BOTH the match and the boss are chained, and the first attempt chained only the match.
     * The bank validator rejected that immediately and was right to: it requires every concept
     * to carry boss coverage and at least ten actively scheduled surfaces, and a concept with
     * only its nine per-concept surfaces has neither. Leaving the boss on the first pair would
     * have given the second and later concepts in a module a thinner deal than the first two,
     * which is exactly the inequality the widening exists to remove.
     *
     * The surface count grows with the concept count, and that is correct rather than a cost to
     * manage here: bank size and session length are different things. Runs select from the
     * bank, so how long a learner sits is decided by run composition, not by how much the
     * generators produced. */
    for (var module = 1; module <= 8; module += 1) {
      var moduleConcepts = course.concepts.filter(function (concept) {
        return concept.module === module && assessmentMode(course, concept) !== "written";
      });
      if (moduleConcepts.length < 2) continue;
      for (var step = 0; step + 1 < moduleConcepts.length; step += 1) {
        var stepPair = [moduleConcepts[step], moduleConcepts[step + 1]];
        var stepSuffix = step === 0 ? "" : "_" + (step + 1);
        addModuleMatch(course, module, stepPair, dataById, stepSuffix);
        for (var bossVariant = 1; bossVariant <= 5; bossVariant += 1) {
          addModuleBoss(course, module, stepPair, dataById, bossVariant, stepSuffix);
        }
      }
    }

    // Runs last, over every question in the course — authored MCQs included — so a
    // question added by any path is diagnosed without its author wiring anything up.
    addAuthoredMultiSelect(course);
    addAuthoredNumeric(course);
    addCourseAssessmentItems(course);

    var provenance = buildProvenance(allData);
    Object.keys(course.questions).forEach(function (id) {
      attachDiagnoses(course.questions[id], dataById, provenance, authoredDiagnoses);
      // Strictly after diagnosis, which addresses options by their authored index.
      debiasOptionOrder(course.questions[id]);
    });
    balanceAnswerPositions(course);

    configureRuns(course);
  });

  window.T6_COURSES = courses;
})();
