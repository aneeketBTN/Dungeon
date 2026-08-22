/* SPMS-derived, BRGSA-first paper-pattern revision.
 *
 * This is deliberately a retrieval route, not another transfer gauntlet. Every
 * BRGSA concept gets one short, single-move MCQ in teaching order. The shapes come
 * from the owner's SPMS paper report; applying them to BRGSA remains a revision
 * lens rather than a prediction of its unseen objective paper.
 */
(function (global) {
  "use strict";

  function directQuestion(spec) {
    var explanation = spec.explanation;
    var misconceptions = spec.options.map(function (_, index) {
      return index === spec.answer ? null : "Missed the direct course rule";
    });
    var diagnoses = spec.options.map(function (_, index) {
      if (index === spec.answer) return null;
      return {
        tag:"Missed the direct course rule",
        label:"Applied the wrong rule",
        why:"That choice conflicts with the course rule being recalled here. " + explanation,
        cue:"Name the one concept in the stem, then match its exact objective, components or relationship."
      };
    });
    return {
      id:spec.id,
      courseId:"BRGSA",
      conceptId:spec.conceptId,
      supportingConceptIds:[],
      module:spec.module,
      source:spec.source,
      sourceIds:[spec.source],
      node:spec.node,
      pattern:spec.family + " · direct MCQ",
      perspective:spec.perspective || "explain",
      type:"mcq",
      skills:spec.skills || ["recall"],
      difficulty:1,
      variantFamily:spec.id,
      boss:false,
      examOnly:true,
      stem:spec.stem,
      options:spec.options,
      answer:spec.answer,
      explanation:explanation,
      link:spec.link || explanation,
      misconceptions:misconceptions,
      diagnoses:diagnoses,
      optionShapeRisk:false
    };
  }

  var SPECS = [
    {
      id:"brgsa_direct_m1_demand", conceptId:"brgsa_m1_demand", module:1,
      source:"BRGSA-M01-L01", node:"Lean validation",
      label:"Identify the objective", family:"Statements & objectives", skills:["recall"],
      stem:"What is the main objective of lean validation?",
      options:[
        "Estimate market size using only secondary data",
        "Test real demand before committing the full build cost",
        "Improve retention after the product has scaled",
        "Replace customer evidence with founder judgement"
      ],
      answer:1,
      explanation:"Lean validation tests whether real people will act on a real offer before the full product is built."
    },
    {
      id:"brgsa_direct_m1_evidence", conceptId:"brgsa_m1_evidence", module:1,
      source:"BRGSA-M01-L04", node:"Strength of evidence",
      label:"Interpret the signal", family:"Change & interpretation", skills:["interpret"],
      stem:"Likes increase, but paid pre-orders do not. What does this most directly mean?",
      options:[
        "Demand has definitely strengthened",
        "The price is definitely too high",
        "Attention rose, but commitment evidence did not",
        "Product-market fit has been reached"
      ],
      answer:2,
      explanation:"Likes are weak attention signals; unchanged paid pre-orders mean costly commitment has not increased."
    },
    {
      id:"brgsa_direct_m1_landing", conceptId:"brgsa_landing_validation", module:1,
      source:"BRGSA-M01-L03", node:"Landing-page validation",
      label:"Judge the evidence", family:"Relevance & truth", skills:["judge"],
      stem:"Which landing-page result gives the stronger demand signal?",
      options:[
        "8% conversion from cold, targeted visitors",
        "40% conversion from friends asked to support the founder",
        "Many comments with no call-to-action clicks",
        "High impressions from an untargeted audience"
      ],
      answer:0,
      explanation:"Cold, targeted traffic supplies a more credible demand signal than warm-network politeness or untargeted attention."
    },
    {
      id:"brgsa_direct_m1_mvp", conceptId:"brgsa_low_resource_mvp", module:1,
      source:"BRGSA-M01-L06", node:"Low-resource MVP validation",
      label:"Recall the components", family:"Recall & anatomy", skills:["recall"],
      stem:"Before building a low-resource MVP, which evidence should be present?",
      options:[
        "A logo, a brand name and a launch date",
        "A full product and a large advertising budget",
        "Social engagement from any available audience",
        "Behavioural interest, costly commitment and repeatable customer access"
      ],
      answer:3,
      explanation:"Low-resource MVP validation combines behavioural interest, a costly commitment and a repeatable route to the customer."
    },
    {
      id:"brgsa_direct_m2_design", conceptId:"brgsa_m2_design", module:2,
      source:"BRGSA-M02-L01", node:"Experiment design",
      label:"Recall the test setup", family:"Recall & anatomy", skills:["recall"],
      stem:"What must an experiment define before results are seen?",
      options:[
        "Only the preferred variant",
        "Only the conversion metric",
        "The null, planned sample and decision rule",
        "The winning explanation after the test"
      ],
      answer:2,
      explanation:"A defensible experiment pre-defines the null position, sample and rule for deciding whether the variant wins."
    },
    {
      id:"brgsa_direct_m2_error", conceptId:"brgsa_m2_error", module:2,
      source:"BRGSA-M02-L03", node:"Type I and Type II errors",
      label:"Distinguish outcomes", family:"Concept distinctions", skills:["distinguish"],
      stem:"A test reports a winner when no real effect exists. Which error occurred?",
      options:[
        "Type I error: false positive",
        "Type II error: false negative",
        "Sampling-frame error",
        "Cohort decay"
      ],
      answer:0,
      explanation:"Reporting an effect that does not exist is a Type I error, or false positive."
    },
    {
      id:"brgsa_direct_m2_significance", conceptId:"brgsa_ab_significance", module:2,
      source:"BRGSA-M02-L02", node:"A/B-test significance",
      label:"Judge the method", family:"Relevance & truth", skills:["judge"],
      stem:"Which practice makes an A/B-test result statistically defensible?",
      options:[
        "Stop as soon as one variant leads",
        "Change alpha after seeing the result",
        "Select the higher conversion rate at any sample",
        "Fix baseline, MDE, alpha and sample size before running"
      ],
      answer:3,
      explanation:"Baseline, minimum detectable effect, alpha and sample size must be fixed before either result is visible."
    },
    {
      id:"brgsa_direct_m2_modes", conceptId:"brgsa_test_modes", module:2,
      source:"BRGSA-M02-L04", node:"Directional and conclusive tests",
      label:"Choose the test mode", family:"Framework selection", skills:["apply"],
      stem:"Which situation most requires a conclusive test?",
      options:[
        "Choosing a draft headline for tomorrow",
        "Making an expensive, hard-to-reverse rollout",
        "Exploring two low-cost creative ideas",
        "Collecting an early directional signal"
      ],
      answer:1,
      explanation:"High-stakes, expensive decisions need a valid test run to its planned sample; low-stakes choices may use directional evidence."
    },
    {
      id:"brgsa_direct_m3_cohort", conceptId:"brgsa_m3_cohort", module:3,
      source:"BRGSA-M03-L01", node:"Cohort analysis",
      label:"Identify the objective", family:"Statements & objectives", skills:["recall"],
      stem:"Why are cohorts compared at the same age?",
      options:[
        "To compare retention without mixing new users with older survivors",
        "To make every cohort the same size",
        "To remove the need for a retention metric",
        "To include new acquisition in LTV"
      ],
      answer:0,
      explanation:"Equal-age cohort comparison reveals retention patterns that aggregate totals hide by mixing users of different ages."
    },
    {
      id:"brgsa_direct_m3_economics", conceptId:"brgsa_m3_economics", module:3,
      source:"BRGSA-M03-L04", node:"CAC and LTV",
      label:"Interpret the movement", family:"Change & interpretation", skills:["interpret"],
      stem:"CAC rises while expected LTV stays unchanged. What happens to acquisition economics?",
      options:[
        "They improve because more was spent",
        "They remain unchanged",
        "They worsen because each unit of value costs more",
        "LTV automatically rises with CAC"
      ],
      answer:2,
      explanation:"If CAC increases while expected LTV is flat, the value bought per acquisition rupee falls and economics worsen."
    },
    {
      id:"brgsa_direct_m3_readiness", conceptId:"brgsa_growth_readiness", module:3,
      source:"BRGSA-M03-L06", node:"Growth-readiness brief",
      label:"Recall the framework", family:"Recall & anatomy", skills:["recall"],
      stem:"What belongs in a growth-readiness brief?",
      options:[
        "Only the founder's preferred growth idea",
        "Brand snapshot, AARRR metrics, primary constraint and known unknowns",
        "Only revenue and monthly ad spend",
        "A list of tactics with no evidence status"
      ],
      answer:1,
      explanation:"A growth-readiness brief combines the brand snapshot, one metric per AARRR stage, the constraint and known unknowns."
    },
    {
      id:"brgsa_direct_m4_constraint", conceptId:"brgsa_m4_constraint", module:4,
      source:"BRGSA-M04-L04", node:"Primary constraint",
      label:"Recommend from the case", family:"Case recommendation", skills:["apply"],
      stem:"Traffic and signup are healthy, but activation is low. What should be fixed first?",
      options:[
        "Traffic volume",
        "Brand colours",
        "The sample-size target",
        "Activation"
      ],
      answer:3,
      explanation:"Activation is the narrowest stage, so improving it has more leverage than adding users above the bottleneck."
    },
    {
      id:"brgsa_direct_m4_stages", conceptId:"brgsa_m4_customers", module:4,
      source:"BRGSA-M04-L02", node:"Early-stage and scale-stage growth",
      label:"Distinguish growth stages", family:"Concept distinctions", skills:["distinguish"],
      stem:"What distinguishes early-stage growth from scale-stage growth?",
      options:[
        "Early stage buys more traffic; scale stage stops measuring",
        "Early stage uses only founders; scale stage uses only agencies",
        "Early stage searches for repeatability; scale stage optimises a proven motion",
        "There is no meaningful difference"
      ],
      answer:2,
      explanation:"Early-stage growth searches close to the founder for a repeatable motion; scale-stage growth optimises one already evidenced."
    },
    {
      id:"brgsa_direct_m4_zero_budget", conceptId:"brgsa_zero_budget", module:4,
      source:"BRGSA-M04-L05", node:"Zero-budget traction",
      label:"Choose the best fit", family:"Framework selection", skills:["apply"],
      stem:"A founder has trusted niche expertise but no ad budget. Which lever fits best?",
      options:[
        "Founder-led content for that niche",
        "Mass television advertising",
        "Paid referrals before any customers exist",
        "A broad rebrand with no distribution plan"
      ],
      answer:0,
      explanation:"A zero-budget lever should fit the founder's existing audience, credibility and time; trusted niche expertise supports founder-led content."
    },
    {
      id:"brgsa_direct_m5_channel", conceptId:"brgsa_m5_channel", module:5,
      source:"BRGSA-M05-L01", node:"Channel fit",
      label:"Judge channel fit", family:"Case recommendation", skills:["judge"],
      stem:"A channel reaches the right buyer after the company's runway ends. Is it a fit?",
      options:[
        "Yes, because targeting is the only criterion",
        "Yes, because eventual revenue is enough",
        "Yes, if impressions are high",
        "No, because time to result also determines fit"
      ],
      answer:3,
      explanation:"Channel fit includes targeting, cost, output quality, control, timing and economics; failing timing makes the channel unfit."
    },
    {
      id:"brgsa_direct_m5_activation", conceptId:"brgsa_m5_activation", module:5,
      source:"BRGSA-M05-L05", node:"Activation",
      label:"Identify activation", family:"Statements & objectives", skills:["recall"],
      stem:"Which event counts as activation?",
      options:[
        "Any account signup",
        "The first observable experience of promised value",
        "The first marketing impression",
        "Any completed profile field"
      ],
      answer:1,
      explanation:"Activation is the first observable moment the user experiences the product's promised value, not merely signup or setup."
    },
    {
      id:"brgsa_direct_m5_aha", conceptId:"brgsa_time_to_aha", module:5,
      source:"BRGSA-M05-L04", node:"Time to AHA",
      label:"Interpret the result", family:"Change & interpretation", skills:["interpret"],
      stem:"Time to AHA falls and retention rises. What does this suggest?",
      options:[
        "Longer onboarding is improving retention",
        "Signup volume is causing churn",
        "Reaching promised value sooner is helping retention",
        "The AHA event should be removed"
      ],
      answer:2,
      explanation:"The pattern suggests that shortening the path to the first countable value event is helping more users remain."
    },
    {
      id:"brgsa_direct_m6_habit", conceptId:"brgsa_m6_habit", module:6,
      source:"BRGSA-M06-L01", node:"Habit loop",
      label:"Recall the framework", family:"Recall & anatomy", skills:["recall"],
      stem:"Which sequence forms the habit loop?",
      options:[
        "Trigger → action → variable reward → investment",
        "Awareness → acquisition → revenue → referral",
        "Price → promotion → place → product",
        "Reach → impressions → clicks → spend"
      ],
      answer:0,
      explanation:"The habit loop is trigger, action, variable reward and investment; durable retention comes from repeating that loop."
    },
    {
      id:"brgsa_direct_m6_network", conceptId:"brgsa_m6_churn", module:6,
      source:"BRGSA-M06-L05", node:"Referral and network effects",
      label:"Distinguish close concepts", family:"Concept distinctions", skills:["distinguish"],
      stem:"Which statement correctly distinguishes referral from a network effect?",
      options:[
        "Both always require a paid incentive",
        "Referral adds users; network effects increase product value as relevant users join",
        "Referral always increases value for existing users",
        "They are two names for the same mechanism"
      ],
      answer:1,
      explanation:"Referral is an acquisition mechanism; a network effect changes the product's value as relevant participation grows."
    },
    {
      id:"brgsa_direct_m6_churn", conceptId:"brgsa_churn_diagnostics", module:6,
      source:"BRGSA-M06-L06", node:"Churn diagnostics",
      label:"Interpret the change", family:"Change & interpretation", skills:["interpret"],
      stem:"Payment failures rise while customer cancellations stay flat. Which churn increased?",
      options:[
        "Voluntary churn",
        "Logo expansion",
        "Activation loss",
        "Involuntary churn"
      ],
      answer:3,
      explanation:"Payment failure causes involuntary churn; voluntary churn reflects a customer's decision to leave."
    },
    {
      id:"brgsa_direct_m6_referral", conceptId:"brgsa_referral_mechanics", module:6,
      source:"BRGSA-M06-L04", node:"Referral mechanics",
      label:"Recommend from the case", family:"Case recommendation", skills:["apply"],
      stem:"Users naturally create useful reports. Which referral move should be tried first?",
      options:[
        "Make those reports easy to share",
        "Pay every user before testing natural sharing",
        "Remove the reports and add display ads",
        "Ask an unrelated audience for referrals"
      ],
      answer:0,
      explanation:"Start with the referral mechanism the product already produces naturally: make its useful, shareable output easy to pass on."
    },
    {
      id:"brgsa_direct_m7_pricing", conceptId:"brgsa_m7_pricing", module:7,
      source:"BRGSA-M07-L01", node:"Pricing structure and NRR",
      label:"Interpret mixed signals", family:"Change & interpretation", skills:["interpret"],
      stem:"NRR is 112% even though some customers churn. What does this mean?",
      options:[
        "New sales were counted in NRR",
        "Customer count must have increased",
        "Expansion from retained customers more than offset lost recurring revenue",
        "Churn has no effect on revenue"
      ],
      answer:2,
      explanation:"NRR excludes new customers, so 112% means expansion in the existing base more than offset churn and contraction."
    },
    {
      id:"brgsa_direct_m7_pipeline", conceptId:"brgsa_m7_pipeline", module:7,
      source:"BRGSA-M07-L04", node:"Revenue handoffs",
      label:"Recall the handoff rule", family:"Recall & anatomy", skills:["recall"],
      stem:"What should every revenue handoff specify?",
      options:[
        "Only the final revenue target",
        "Only the next team's name",
        "A new pricing tier",
        "Entry criterion, owner, context and response-time SLA"
      ],
      answer:3,
      explanation:"A reliable revenue handoff needs an entry criterion, owner, transferred context and response-time service level."
    },
    {
      id:"brgsa_direct_m7_threshold", conceptId:"brgsa_scaling_threshold", module:7,
      source:"BRGSA-M07-L05", node:"Scaling threshold",
      label:"Identify the threshold", family:"Direct recall", skills:["recall"],
      stem:"What is the usual payback threshold for scaling a typical funded company?",
      options:[
        "Less than 24 months",
        "Less than 12 months",
        "Exactly 18 months",
        "Any period if revenue is growing"
      ],
      answer:1,
      explanation:"The usual scaling threshold is payback below twelve months, so acquisition cash can be recycled before growth exhausts it."
    },
    {
      id:"brgsa_direct_m7_architecture", conceptId:"brgsa_revenue_architecture", module:7,
      source:"BRGSA-M07-L06", node:"Revenue architecture",
      label:"Choose the best fit", family:"Framework selection", skills:["apply"],
      stem:"Which revenue motion best fits high-volume, lower-value transactions?",
      options:[
        "Enterprise sales-led growth with long negotiations",
        "Field sales for every transaction",
        "Product-led growth",
        "A channel with no self-service path"
      ],
      answer:2,
      explanation:"Product-led growth fits high-volume, lower-value transactions; sales-led growth fits fewer, higher-value and more complex deals."
    },
    {
      id:"brgsa_direct_m8_ice", conceptId:"brgsa_m8_priority", module:8,
      source:"BRGSA-M08-L01", node:"ICE prioritisation",
      label:"Recall the framework", family:"Recall & anatomy", skills:["recall"],
      stem:"What does ICE stand for?",
      options:[
        "Impact, confidence and ease",
        "Interest, conversion and engagement",
        "Input, cost and efficiency",
        "Impact, control and evidence"
      ],
      answer:0,
      explanation:"ICE scores an idea on impact, confidence and ease to turn an unordered list into a prioritised backlog."
    },
    {
      id:"brgsa_direct_m8_decision", conceptId:"brgsa_m8_decision", module:8,
      source:"BRGSA-M08-L03", node:"Pre-declared decision rule",
      label:"Identify the decision rule", family:"Statements & objectives", skills:["recall"],
      stem:"When should a metric's owner, threshold and action be agreed?",
      options:[
        "After the team sees which result it prefers",
        "Only when the experiment fails",
        "At the end of the quarter",
        "Before the experiment begins"
      ],
      answer:3,
      explanation:"The decision rule is set before the experiment: metric, owner, threshold and action are agreed without seeing the result."
    },
    {
      id:"brgsa_direct_m8_roadmap", conceptId:"brgsa_90_day_roadmap", module:8,
      source:"BRGSA-M08-L06", node:"90-day growth roadmap",
      label:"Recall the components", family:"Recall & anatomy", skills:["recall"],
      stem:"What does a 90-day growth roadmap add to an experiment backlog?",
      options:[
        "Only more experiment ideas",
        "Timing, capacity, decision dates and dependencies",
        "A guarantee that every test will win",
        "A ban on changing priorities"
      ],
      answer:1,
      explanation:"The roadmap turns a backlog into scheduled work by assigning timing, capacity, decision dates and dependencies."
    },
    {
      id:"brgsa_direct_m8_system", conceptId:"brgsa_growth_system", module:8,
      source:"BRGSA-M08-L07", node:"Growth operating system",
      label:"Identify the objective", family:"Statements & objectives", skills:["recall"],
      stem:"What is the objective of a growth operating system?",
      options:[
        "Replace AARRR with a single revenue metric",
        "Run isolated experiments without resource decisions",
        "Connect metrics, experiments, decisions and allocation in a repeatable loop",
        "Keep the roadmap fixed when evidence changes"
      ],
      answer:2,
      explanation:"A growth operating system connects AARRR, prioritisation, experiments, decision rules, allocation and the roadmap into one repeatable loop."
    }
  ];

  var QUESTIONS = SPECS.map(directQuestion);
  var QUESTION_BY_ID = QUESTIONS.reduce(function (index, question) {
    index[question.id] = question;
    return index;
  }, {});

  var PACKS = {
    BRGSA: {
      version:"brgsa-direct-1",
      title:"Direct BRGSA revision, concept by concept.",
      boundary:"SPMS confirms these question shapes. Their use for BRGSA Section A is a working revision lens, not a prediction of the unseen paper.",
      questionIds:QUESTIONS.map(function (question) { return question.id; }),
      questions:QUESTIONS,
      route:SPECS.map(function (spec) {
        return {id:spec.id, conceptId:spec.conceptId, label:spec.label, family:spec.family};
      })
    }
  };

  function build(courseId) {
    var pack = PACKS[courseId];
    var course = (global.T6_COURSES || {})[courseId];
    if (!pack || !course) return null;
    var knownConcepts = course.concepts.reduce(function (index, concept) {
      index[concept.id] = true;
      return index;
    }, {});
    if (pack.questions.some(function (question) { return !knownConcepts[question.conceptId]; })) return null;
    return {
      courseId:courseId,
      version:pack.version,
      questionIds:pack.questionIds.slice(),
      questions:pack.questions.slice(),
      conceptIds:pack.questions.map(function (question) { return question.conceptId; }),
      modules:pack.questions.map(function (question) { return Number(question.module); }),
      route:pack.route.map(function (step) {
        return {id:step.id, conceptId:step.conceptId, label:step.label, family:step.family};
      })
    };
  }

  function question(courseId, questionId) {
    return courseId === "BRGSA" ? QUESTION_BY_ID[questionId] || null : null;
  }

  global.T6_PAPER_PATTERN = {
    sourceCourse:"SPMS",
    availableCourseIds:["BRGSA"],
    BRGSA:PACKS.BRGSA,
    build:build,
    question:question
  };
})(window);
