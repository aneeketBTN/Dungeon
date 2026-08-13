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
      caseSource: applicationSeed.source || concept.source || seed.source,
      caseExplanation: applicationSeed.explanation || concept.summary || seed.explanation,
      caseLink: applicationSeed.link || concept.bridge || seed.link
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
      var role = targetRoleFor(question.options, answerSet[0], provenance);
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

  /* Authored multiple-select items for SPMS Section B.
   *
   * The paper's Section B is 20 MSQs worth 40 of its 75 marks, negatively marked
   * at +1 per right option and -1 per wrong, floored at zero per question. No
   * generated surface can stand in for that: an MSQ needs several defensibly
   * correct options and at least one plausible wrong one, which is an authoring
   * job. Each item sits on a lecture that already has a lesson, so LAW-47 holds
   * without any extra scheduling work. */
  var SPMS_MULTI = [
    {concept: "spms_dfv", source: "SPMS-M01-L05", node: "Desirability, feasibility, viability",
     stem: "Select every statement that matches how the lecture presents the three-way framework.",
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

    {concept: "spms_jtbd", source: "SPMS-M01-L10", node: "Jobs to be done",
     stem: "In the drilling-machine example, select every need the purchase actually serves.",
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
     explanation: "The example stacks a functional, an emotional, and a social need in one purchase. Cost enters only through customer value, which is benefit minus cost — it is not one of the layers of the job."},

    {concept: "spms_tamsam", source: "SPMS-M02-L04", node: "TAM, SAM, and SOM",
     stem: "Select every statement that matches the lecture's Zerodha market sizing.",
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
     stem: "Select every strategy the lecture gives for crossing the chasm.",
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
     stem: "Select every business type paired with the unit the lecture assigns it.",
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
     stem: "Select everything that counts as competition on the lecture's definition.",
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
     stem: "Select every statement that is correct about the privacy regimes as the lecture presents them.",
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
     stem: "Select every statement that matches how the lecture separates definition from positioning.",
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
     stem: "Select every statement that matches how the lecture treats cost-based pricing.",
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
     stem: "Select every failure the lecture names when value is communicated badly.",
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
     stem: "Select every statement that matches how the lecture traces a need into a requirement.",
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
     stem: "Select every statement that matches how the lecture uses MoSCoW.",
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

    {concept: "spms_priority", variant: "buckets", source: "SPMS-M07-L01", node: "MoSCoW and RICE prioritisation",
     stem: "For the ride-hailing product the lecture uses, select every capability it places in must have.",
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
     stem: "Select every statement that matches the lecture's account of a roadmap.",
     options: [
       "It fixes the next three to six months and deliberately goes no further",
       "It translates product strategy into a series of releases on a time axis",
       "WhatsApp launched first on iPhone, with the Android version arriving around 2011",
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

    {concept: "spms_roadmap", variant: "sequence", source: "SPMS-M07-L04", node: "Product roadmap",
     stem: "Select every statement that reads WhatsApp's evolution the way the lecture does.",
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
     stem: "Select every statement that matches the lecture's definition of a requirement.",
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
     stem: "Select every statement that matches why the lecture says metrics matter more in a startup.",
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
     stem: "Select every metric paired with what the lecture says it measures.",
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

  function addAuthoredMultiSelect(course) {
    if (course.id !== "SPMS") return;
    SPMS_MULTI.forEach(function (item, index) {
      var concept = (course.concepts || []).filter(function (entry) { return entry.id === item.concept; })[0];
      if (!concept) return;
      addQuestion(course, {
        /* A concept may carry more than one multiple-select item — Section B needs
           twenty and only sixteen SPMS lectures have a lesson to sit one on — so the
           id takes an optional variant. Without it the second item on a concept
           silently overwrote the first. */
        id: item.concept + "_msq" + (item.variant ? "_" + item.variant : ""),
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
        stem: item.stem,
        options: item.options,
        answers: item.answers,
        diagnoses: item.options.map(function (_, optionIndex) {
          return item.wrong[optionIndex] || null;
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
     stem: "The same distributor settles on an order quantity of 600 units against annual demand of 12,000 units, an ordering cost of ₹600 per order, and a holding cost of ₹40 per unit per year.",
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
     link: "The ratio sets how far up the demand distribution to order, which is where the supplied normal table is used."}
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
        sourceIds: [item.source],
        node: item.node,
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
    var actionWrong = relevantWrong(data.application, data.applicationWrong || [], nearbyApplications(data, allData));
    var actionChoices = choiceSet(data.application, actionWrong, stableNumber(concept.id + "case"));
    var termChoices = choiceSet(data.name, nearbyConcepts(course, concept).map(function (entry) { return entry.name; }), stableNumber(concept.id + "term2"));
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
      exemplar: "The governing course idea is " + data.name + ". " + ensureSentence(data.application) + " " + ensureSentence(data.caseLink || data.bridge) + " " + ensureSentence(data.caseExplanation || data.summary),
      explanation: data.caseExplanation || data.summary,
      link: data.caseLink || data.bridge,
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
    // A boss tests telling the module's two concepts apart, so the paired
    // concept's decision is a relevant distractor here rather than a borrowed one.
    var firstWrong = relevantWrong(first.application, (first.applicationWrong || []).concat([second.application]), nearbyApplications(first, allData));
    var secondWrong = relevantWrong(second.application, (second.applicationWrong || []).concat([first.application]), nearbyApplications(second, allData));
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
      /* The final-paper contract has prose responses only in BRGSA and IBM.
       * Those subjects receive both fast framework fluency and full case transfer.
       * SPMS and SCLM still carry case-based objective/numeric work, but inventing
       * prose practice for them would train a format their papers do not ask for. */
      if (course.id === "BRGSA" || course.id === "IBM") {
        addShortAnswer(course, concept, dataById[concept.id]);
        addCaseAnswer(course, concept, dataById[concept.id]);
      }
    });
    for (var module = 1; module <= 8; module += 1) {
      var pair = course.concepts.filter(function (concept) { return concept.module === module; });
      if (pair.length < 2) continue;
      addModuleMatch(course, module, pair.slice(0, 2), dataById);
      for (var bossVariant = 1; bossVariant <= 5; bossVariant += 1) addModuleBoss(course, module, pair.slice(0, 2), dataById, bossVariant);
    }

    // Runs last, over every question in the course — authored MCQs included — so a
    // question added by any path is diagnosed without its author wiring anything up.
    addAuthoredMultiSelect(course);
    addAuthoredNumeric(course);

    var provenance = buildProvenance(allData);
    Object.keys(course.questions).forEach(function (id) {
      attachDiagnoses(course.questions[id], dataById, provenance, authoredDiagnoses);
    });

    configureRuns(course);
  });

  window.T6_COURSES = courses;
})();
