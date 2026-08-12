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
       "Viability is settled once a working prototype exists"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Read viability as buildability", label: "Answered the feasibility question and stopped",
       why: "This choice assumed that proving the product can be made also proves it should be. A prototype demonstrates the technology exists, which is the feasibility check; viability asks the separate question of whether it can profit or fund the business.",
       cue: "When a check passes, name which of the three it was. If the evidence is technical, it cannot be viability."}},
     explanation: "Each area needs a different skill — design for desirability, engineering for feasibility, business for viability. A prototype proves you can build it, which is the feasibility question; viability asks whether it can profit or fund the business."},

    {concept: "spms_jtbd", source: "SPMS-M01-L10", node: "Jobs to be done",
     stem: "In the drilling-machine example, select every need the purchase actually serves.",
     options: [
       "Functional — the certificate has to go onto the wall",
       "Emotional — pride in more than a decade of study",
       "Social — new patients gain confidence they are seeing a qualified doctor",
       "Financial — the drill costs less than hiring someone to do it"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Added a layer the lecture does not use", label: "Treated price as one of the layers of the job",
       why: "This choice assumed cost is one of the needs stacked inside the purchase. The lecture names functional, emotional, and social. Cost enters somewhere else entirely — through customer value, which is benefit minus cost.",
       cue: "List the three layers before answering. A candidate that is not one of them belongs to the value calculation instead."}},
     explanation: "The example stacks a functional, an emotional, and a social need in one purchase. Cost enters only through customer value, which is benefit minus cost — it is not one of the layers of the job."},

    {concept: "spms_tamsam", source: "SPMS-M02-L04", node: "TAM, SAM, and SOM",
     stem: "Select every statement that matches the lecture's Zerodha market sizing.",
     options: [
       "TAM is every retail investor who could use the product, worldwide",
       "Regulation on cross-border investing narrows SAM to online retail investors in India",
       "SOM narrows further because incumbent brokerages already serve those investors",
       "SOM is the figure to quote as the market when raising funds"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Turned a sizing step into a pitch number", label: "Read the funnel as a headline figure",
       why: "This choice assumed one of the three is the number you present. The lecture uses them as successive narrowing constraints — what could exist, what you may reach, what you can take against incumbents — not as a figure to quote.",
       cue: "Ask what each step removes. A step that removes nothing is being used as a claim rather than an analysis."}},
     explanation: "TAM measures the prize, SAM what you are permitted and able to reach, SOM what you can take given who already holds it. They are narrowing constraints, not a headline figure."},

    {concept: "spms_chasm", source: "SPMS-M02-L10", node: "Crossing the chasm",
     stem: "Select every strategy the lecture gives for crossing the chasm.",
     options: [
       "Focus on a narrow beachhead market rather than spray and pray",
       "Simplify onboarding and the interface for mainstream users",
       "Build trust through uptime, security, support, compliance, and social proof",
       "Raise the price at launch so mainstream buyers read it as quality"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Substituted a signal for risk reduction", label: "Answered a risk problem with a pricing move",
       why: "This choice assumed mainstream buyers read a high price as quality. The lecture's premise is that mainstream customers avoid risk, so all four strategies lower perceived risk — beachhead focus, simplification, trust, ecosystem fit. Pricing is not among them.",
       cue: "Name which of the four a candidate belongs to. If it fits none of them, it is not part of the crossing."}},
     explanation: "The four are beachhead focus, simplification, trust and reliability, and ecosystem fit. Mainstream customers avoid risk, so the work is lowering perceived risk rather than signalling through price."},

    {concept: "spms_lean_canvas", source: "SPMS-M03-L06", node: "Lean Canvas",
     stem: "Select every box that appears on the Lean Canvas but not on the Business Model Canvas.",
     options: ["Problem", "Solution", "Unfair advantage", "Customer segments"],
     answers: [0, 1, 2],
     wrong: {3: {tag: "Counted a shared box as an addition", label: "Read a carried-over box as new",
       why: "This choice assumed customer segments is unique to the Lean Canvas. It carries across from the Business Model Canvas, along with channels, cost structure, and revenue structure. The additions are problem, solution, key metrics, and unfair advantage.",
       cue: "Build two lists before answering — what carries over, and what replaces it. The question only asks about the second."}},
     explanation: "Problem, solution, key metrics, and unfair advantage are the Lean Canvas additions. Customer segments, channels, cost structure, and revenue structure carry across from the Business Model Canvas."},

    {concept: "spms_unit_economics", source: "SPMS-M04-L07", node: "Unit economics",
     stem: "Select every business type paired with the unit the lecture assigns it.",
     options: [
       "SaaS — one customer or account",
       "Ride-sharing — one ride",
       "E-commerce — one order",
       "Marketplace — one customer lifetime"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Applied the SaaS unit to a transactional model", label: "Chose a unit the relationship does not support",
       why: "This choice assumed the marketplace acquires a customer who then transacts repeatedly across a lifetime. The unit follows the customer relationship model, and a marketplace relationship is transactional — so the unit is one transaction.",
       cue: "Ask whether the business acquires a relationship or completes a transaction. That answer names the unit."}},
     explanation: "The unit follows the customer relationship model. SaaS acquires a customer who transacts repeatedly, so the account is the unit; a marketplace relationship is transactional, so the transaction is."},

    {concept: "spms_alternatives", source: "SPMS-M05-L02", node: "Competition and alternatives",
     stem: "Select everything that counts as competition on the lecture's definition.",
     options: [
       "Rival products in the same category",
       "Manual alternatives such as spreadsheets, consultants, or internal tools",
       "The customer deciding to carry on doing nothing",
       "Only the firms the startup has publicly named as competitors"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Let the vendor define the comparison", label: "Set the competitive field from the inside",
       why: "This choice assumed competition is whatever the startup declares it to be. The lecture is explicit that customers decide the comparison — and in enterprise the most frequent alternative is inertia, the buyer carrying on exactly as they are.",
       cue: "Ask what the customer would do if you did not exist. Whatever that is, it is the competition, named or not."}},
     explanation: "Customers set the comparison, and in enterprise the most common alternative is inertia — doing nothing at all. Defining competition early and narrowly is named as the biggest mistake."},

    {concept: "spms_privacy", source: "SPMS-M08-L05", node: "Privacy by design",
     stem: "Select every statement that is correct about the privacy regimes as the lecture presents them.",
     options: [
       "GDPR protects any personal data irrespective of its sensitivity",
       "GDPR was enacted in May 2018 and became a model for Switzerland, Canada, and Australia",
       "US data protection leaves employee data outside its data protection regulations",
       "Data protection by design means the customer must request that their data be protected"
     ], answers: [0, 1, 2],
     wrong: {3: {tag: "Read a standing obligation as opt-in", label: "Made protection something the user has to ask for",
       why: "This choice assumed the duty begins when a customer requests it. By design means the obligation applies the moment you offer the service, which is why a customer never has to confirm that their data is protected.",
       cue: "Ask when the duty starts. If the answer is 'once they ask', it is not protection by design."}},
     explanation: "GDPR covers all personal data regardless of sensitivity, while US protection is category-based and excludes employee data. Protection by design is never something a customer has to ask for."}
  ];

  /* Why each item connects onward — the `link` line every question carries. */
  var SPMS_MULTI_LINKS = {
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
        id: item.concept + "_msq",
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
    addAuthoredMultiSelect(course);

    var provenance = buildProvenance(allData);
    Object.keys(course.questions).forEach(function (id) {
      attachDiagnoses(course.questions[id], dataById, provenance, authoredDiagnoses);
    });

    configureRuns(course);
  });

  window.T6_COURSES = courses;
})();
