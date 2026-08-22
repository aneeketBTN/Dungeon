(function () {
  "use strict";

  var COURSES = window.T6_COURSES || {};
  var COURSE_IDS = ["BRGSA", "IBM", "SCLM", "SPMS"];

  /* The Batch 1 timetable, from docs/briefs/T6_EXAM_PATTERN.md.
   *
   * Two papers a day, back to back, and the gap between the first and last is
   * about 28 hours — so the order you revise in is a real constraint, not a
   * preference. `seat` is the sitting order across both days and is what the
   * default sort uses: whatever you sit first is what you can least afford to
   * leave until the end. */
  var EXAM_SCHEDULE = {
    SPMS:  {seat: 1, day: "Sat 22 Aug", short: "Aug 22", full: "Saturday 22 August", start: "09:00", end: "11:00", marks: 75,  negative: false, note: "35 MCQs + 20 P-type MSQs"},
    BRGSA: {seat: 2, day: "Sat 22 Aug", short: "Aug 22", full: "Saturday 22 August", start: "13:00", end: "15:00", marks: 80,  negative: false, note: "20 MCQs + 4 cases + 2 written"},
    IBM:   {seat: 3, day: "Sun 23 Aug", short: "Aug 23", full: "Sunday 23 August",   start: "09:00", end: "11:00", marks: 100, negative: false, note: "10 written answers on a released caselet"},
    SCLM:  {seat: 4, day: "Sun 23 Aug", short: "Aug 23", full: "Sunday 23 August",   start: "13:00", end: "15:00", marks: 80,  negative: false, note: "50 MCQs + 6 numericals + 3 matches"}
  };

  var EXAM_ORDER = COURSE_IDS.slice().sort(function (a, b) {
    return (EXAM_SCHEDULE[a] || {}).seat - (EXAM_SCHEDULE[b] || {}).seat;
  });

  /* BRGSA is complete and deliberately absent from the current Examiner front
   * door. IBM and SCLM lead every exam chooser; SPMS remains available after them.
   * This is presentation priority only — it does not delete papers, history, or the
   * archived BRGSA paper-pattern pack. */
  var EXAM_HOME_ORDER = ["IBM", "SCLM", "SPMS"];

  /* Only these papers ask for prose. SPMS and SCLM still use applied cases,
   * numericals, matching, and multi-select practice, but Dungeon must not invent a
   * written format the published paper does not contain. */
  var WRITTEN_PRACTICE_SUBJECTS = {BRGSA:true, IBM:true};

  function writtenPracticeAvailable(courseId) {
    return WRITTEN_PRACTICE_SUBJECTS[courseId] === true;
  }

  var SORT_MODES = {
    exam: {label: "Exam order", hint: "The order you sit them."},
    hardest: {label: "Hardest for you", hint: "Least evidence first, using your own attempts."}
  };

  /* Sort is presentation only — it never changes what is scheduled inside a
   * subject, so switching it cannot alter anyone's practice or evidence. */
  function orderedCourseIds(mode) {
    if (mode !== "hardest") return EXAM_ORDER.slice();
    return EXAM_ORDER.slice().sort(function (a, b) {
      var left = courseStats(a);
      var right = courseStats(b);
      // Weakest first. Ties fall back to the sitting order, so the list is stable
      // before any practice exists rather than alphabetical by accident.
      if (left.weighted !== right.weighted) return left.weighted - right.weighted;
      return EXAM_SCHEDULE[a].seat - EXAM_SCHEDULE[b].seat;
    });
  }
  var STORAGE_KEY = "term6.revision.v2";
  var LEGACY_CLAIM_KEY = "term6.revision.v2.claimed-by";
  var BACKEND_ACTIVE = window.location.pathname.indexOf("/dungeon") === 0;
  var LOCAL_GRADER_HOST = ["localhost", "127.0.0.1", "::1", "[::1]"].indexOf(window.location.hostname) >= 0;
  var writtenAuthority = {available:false, model:null, provider:null, reason:null, capabilities:[]};
  var WRITTEN_AUTHORITY_ENDPOINT = BACKEND_ACTIVE ? "api/written-authority" : "/api/written-authority";
  var writtenEvidenceWarm = {};
  var writtenEvidenceTimer = null;
  var SESSION_ENDPOINT = "api/session";
  var PROGRESS_ENDPOINT = "api/progress";
  var COMMUNITY_ENDPOINT = "api/community";
  var STATUS_ORDER = {unseen: 0, needs: 1, developing: 2, strong: 3};
  var STATUS_LABEL = {unseen: "Not started", needs: "Needs practice", developing: "Developing", strong: "Strong"};
  var profile;
  var session = null;
  var selected = null;
  var confidence = null;
  /* Response timing is deliberately ephemeral. The saved profile receives only a
     coarse duration band plus the rapid-response classification; raw millisecond
     timing would become identified behavioural data when the profile syncs to D1. */
  var responseTiming = {key: null, startedAt: 0};
  var lastFinished = null;
  var scenarioMode = false;
  var toastTimer = null;
  var learnerEmail = null;
  var backendReady = false;
  var serverRevision = 0;
  var localChangeSequence = 0;
  var saveChain = Promise.resolve();
  var communityState = {joined:true, inviteOpenedAt:null, reminderAt:null};
  var HORIZON_PLANS = {
    today: {
      title: "A focused day, with recovery time",
      steps: ["Begin with a 15–20 minute broad diagnostic.", "Use 60–75 minutes for unfamiliar foundations, then take a 10–15 minute break.", "Spend 45–60 minutes comparing concepts you confuse, then take another short break.", "Use 45–60 minutes for cases and reasoning chains.", "Finish with a 30–45 minute mixed practice check and 20–30 minutes on open flags."],
      note: "Protect at least seven hours of sleep where possible. Same-day success is labelled current evidence, not delayed retention."
    },
    three: {
      title: "Three distinct retrieval days",
      steps: ["Day 0: diagnose, build short foundations, and repair misses on a different surface.", "Day 1: retrieve closed-book after a genuine gap, compare confusable ideas, and write short responses.", "Day 2: take a mixed generic practice check, classify errors, and revisit only unresolved causes.", "Exam day: briefly retrieve open flags and core distinctions."],
      note: "Do not import guessing, timing, or negative-marking rules that have not been published for this final."
    },
    seven: {
      title: "A seven-day evidence cycle",
      steps: ["Day 0: diagnose and retrieve foundations.", "Day 1: delayed retrieval and misconception repair.", "Day 2: weak concepts, one constructed response, and one case.", "Day 3: interleave useful contrasts and try a new case.", "Days 4–5: open flags, untouched coverage, and failed reasoning steps only.", "Day 6: whole-chain reasoning and a mixed practice check.", "Day 7: a brief refresh of core distinctions."],
      note: "The nine-run path remains available, but later practice should narrow instead of forcing every replay."
    }
  };

  /* Calculation notes teach the reusable setup rather than rehearsing one bank
   * item. They sit beside the authored lesson sequence, while the theory and worked
   * examples continue to come directly from T6_LESSONS. */
  var NUMERICAL_METHODS = {
    BRGSA: [
      {
        module: 2,
        source: "BRGSA-M02-L04",
        title: "Experiment numbers without fooling yourself",
        theory: "A rate is evidence only when the numerator, denominator, sample rule, and decision threshold were fixed before the result was inspected.",
        steps: [
          "Write the decision first: what would make you keep A, switch to B, or collect more data?",
          "Name the numerator and denominator for each variant. Keep the populations and time windows comparable.",
          "Compute each rate as outcomes ÷ eligible observations. Compare rates, not raw wins.",
          "Check the pre-declared sample and stopping rule before interpreting the gap.",
          "State the error trade-off: a false positive ships a non-improvement; a false negative discards a real one."
        ],
        checks: ["Never stop because an early line looks persuasive.", "A larger sample cannot repair a biased sample or a changed metric."],
        example: "For two onboarding flows, first define activation and who counts as eligible. Only then compare activation rates at the planned sample."
      },
      {
        module: 3,
        source: "BRGSA-M03-L04",
        title: "Growth rates, cohorts, CAC, LTV, and payback",
        theory: "Growth arithmetic is useful only when it preserves the population and the unit. Totals can rise while every new cohort becomes less valuable.",
        steps: [
          "Write the unit beside every figure: users, customers, rupees, months, or percentage points.",
          "For a funnel rate, divide the later stage by the immediately eligible earlier stage and multiply by 100.",
          "For growth, use (new − old) ÷ old × 100. Do not divide by the new value.",
          "For CAC, divide the acquisition cost included in scope by the new customers attributable to that scope.",
          "Estimate LTV as ARPU × expected lifespan × gross margin, with the lifespan assumption written beside it.",
          "Estimate payback as CAC ÷ monthly gross profit per customer, then compare the answer with expected retention."
        ],
        checks: ["Percent and percentage-point change are different.", "Revenue is not gross profit; acquired signups are not acquired customers."],
        example: "If retention falls by cohort while total accounts rise, diagnose the cohort before celebrating the total."
      },
      {
        module: 4,
        source: "BRGSA-M04-L04",
        title: "Find a constraint from a funnel",
        theory: "The biggest absolute loss is usually near the top because the top is widest. The constraint is the stage furthest below the rate it should achieve.",
        steps: [
          "Convert every hand-off into a step conversion rate.",
          "Place the relevant benchmark beside each rate.",
          "Compute the gap to benchmark, keeping direction clear.",
          "Choose the binding gap, then ask whether improving it changes end-to-end output.",
          "Recalculate the whole funnel under the proposed improvement before moving budget."
        ],
        checks: ["Do not rank stages by the count lost.", "Do not call the lowest raw rate the constraint without a benchmark."],
        example: "A 12% visitor-to-signup rate can be healthy while a 33% signup-to-activation rate is the real bottleneck if its benchmark is much higher."
      }
    ],
    SCLM: [
      {
        module: 2,
        source: "SCLM-M02-L06",
        title: "Forecasting and exponential smoothing",
        theory: "Exponential smoothing moves the old forecast partway toward the latest actual. Alpha controls responsiveness: high alpha follows new information faster and also follows noise faster.",
        steps: [
          "Write the relation before substituting: new forecast = old forecast + α × (actual − old forecast).",
          "Compute the forecast error in brackets and keep its sign.",
          "Multiply only the error by alpha.",
          "Add the correction to the old forecast.",
          "Check direction: actual above forecast must move the new forecast up; actual below must move it down."
        ],
        checks: ["The new forecast should lie between the old forecast and the latest actual when 0 < α < 1.", "If the answer equals the actual, you effectively used α = 1."],
        example: "Set out forecast, actual, error, weighted error, then new forecast as five labelled lines."
      },
      {
        module: 3,
        source: "SCLM-M03-L03",
        title: "EOQ and the annual cost at an order quantity",
        theory: "EOQ balances a cost paid per order against a cost paid per unit held per year. The factor of two exists because average cycle stock is Q/2.",
        steps: [
          "Identify units first: D is units/year, K is currency/order, and h is currency/unit/year.",
          "Substitute into EOQ = √(2DK ÷ h). Keep the whole numerator under the root.",
          "Round only after taking the square root, and only as the question permits.",
          "If cost is requested, calculate ordering cost as (D ÷ Q)K and holding cost as (Q ÷ 2)h.",
          "Add only the relevant costs. Purchase cost drops out when it does not change with Q."
        ],
        checks: ["At the EOQ, annual ordering and holding costs should be approximately equal.", "K and h can never swap: their units are different."],
        example: "Build a small units table before touching the calculator; it catches most EOQ substitutions."
      },
      {
        module: 3,
        source: "SCLM-M03-L05",
        title: "Newsvendor and the critical ratio",
        theory: "The critical ratio turns the pain of being short and the pain of being long into a position in the demand distribution.",
        steps: [
          "Compute underage cost Cu = selling price − purchase cost.",
          "Compute overage cost Co = purchase cost − salvage value.",
          "Compute critical ratio = Cu ÷ (Cu + Co).",
          "Use that probability to locate the required percentile or z-value when a distribution is supplied.",
          "Translate the distribution position back into an order quantity."
        ],
        checks: ["A critical ratio must be between 0 and 1.", "If underage hurts more than overage, the ratio must exceed 0.5."],
        example: "Label the two mistakes—one unit too few and one unit too many—before writing either cost."
      },
      {
        module: 3,
        source: "SCLM-M03-L06",
        title: "Safety stock, reorder point, and service level",
        theory: "A reorder point covers expected demand during the time you cannot react, plus a buffer for variability during that same protection period.",
        steps: [
          "Convert the mean to lead time: μDLT = mean demand per period × lead time.",
          "Convert variability to lead time: σDLT = σ per period × √lead time. Variances add; standard deviations do not.",
          "Read z for the required service level, or work backwards from a policy using z = (ROP − μDLT) ÷ σDLT.",
          "Compute safety stock = z × σDLT.",
          "Compute reorder point = μDLT + safety stock.",
          "Compare the reorder point with inventory position: on hand + on order − backorders."
        ],
        checks: ["A reorder point equal to mean lead-time demand buys only about 50% cycle service.", "Use √L, never L, when independent-period standard deviations are supplied."],
        example: "Draw a three-line bridge: protection-period mean, protection-period deviation, then buffer and reorder point."
      },
      {
        module: 6,
        source: "SCLM-M06-L07",
        title: "Cycle time, waiting, and throughput",
        theory: "The largest block of time is not automatically waste. Separate productive movement or processing from waiting before choosing the lever.",
        steps: [
          "List every component of the cycle in one unit.",
          "Classify each as value-creating, necessary support, or avoidable wait.",
          "Add the components to reconcile to the reported total before diagnosing anything.",
          "Rank recoverable waiting, not all time, and identify the resource causing it.",
          "Translate hours removed into cycles per period and then into capacity."
        ],
        checks: ["A faster transit assumption is not a scheduling improvement.", "The answer must reconcile back to the original cycle total."],
        example: "A 34-hour transit can be necessary while a 13-hour locomotive wait is the largest removable loss."
      },
      {
        module: 7,
        source: "SCLM-M07-L01",
        title: "Material balance, shipment stock, and landed cost",
        theory: "A logistics comparison starts with the tonnes the process actually needs. A cheaper mode can then create a second cost by delivering larger batches or holding material in transit for longer.",
        steps: [
          "Build the material balance first: output × input required per unit for every inbound material, then add the flows.",
          "Put every transport option on the same quantity and period before comparing freight.",
          "For a batch of Q consumed steadily, average cycle stock is Q/2.",
          "Add buffer, pipeline, and known seasonality stock separately; they arise for different reasons.",
          "Apply the annual carrying rate to the average inventory value, then add handling and stockyard cost to freight.",
          "If the highest-inventory option still has the lowest total cost, use that bound instead of calculating dominated alternatives."
        ],
        checks: ["Inbound tonnage can exceed finished output when the conversion requires more than one tonne of input.", "Shipment size creates cycle stock; transit time creates pipeline stock."],
        example: "A 62,000-tonne annual shipment creates 31,000 tonnes of average cycle stock before any buffer or pipeline stock is added."
      },
      {
        module: 8,
        source: "SCLM-M08-L03",
        title: "Time-window and route-capacity arithmetic",
        theory: "A route is feasible only if its last stop stays inside every hard service constraint. Capacity at the kitchen or vehicle cannot compensate for missing the consumption-time or temperature limit.",
        steps: [
          "Write the allowed cook-to-consume interval in minutes.",
          "Convert the actual finish and last-consumption times to one elapsed-time figure.",
          "Compute slack as allowance minus elapsed time.",
          "For a proposed stop, add its travel and service minutes to the current elapsed time.",
          "Check the temperature constraint separately; unused time does not prove the food remains hot enough.",
          "If either hard constraint fails, redesign the route, dispatch time, or production sequence before adding the stop."
        ],
        checks: ["Elapsed time and slack are opposites; read which one the question asks for.", "Check the last stop, because that is where both time and temperature constraints are tightest."],
        example: "Cooking at 07:30 and consumption at 12:45 uses 315 of the permitted 360 minutes, leaving 45 minutes of time slack."
      }
    ],
    SPMS: [
      {
        module: 4,
        source: "SPMS-M04-L07",
        title: "Market size and unit economics without false precision",
        theory: "A market number is a sequence of narrowing assumptions. Unit economics asks whether value captured per customer can repay what it costs to acquire and serve that customer.",
        steps: [
          "State the population, period, geography, and spending unit before estimating TAM.",
          "Narrow to SAM using constraints the product can actually serve, then to SOM using a defensible reach assumption.",
          "Keep price, revenue, gross margin, contribution, CAC, and LTV on separate labelled lines.",
          "Test the result with a top-down estimate and a bottom-up estimate.",
          "Name the assumption that would change the decision most and vary it before presenting the number."
        ],
        checks: ["A precise answer built on an unnamed reach assumption is still a guess.", "Use gross profit—not revenue—when comparing customer value with acquisition cost."],
        example: "Show a range when the input is a range; do not compress uncertain assumptions into one impressive total."
      },
      {
        module: 7,
        source: "SPMS-M07-L01",
        title: "RICE and cost-value prioritisation",
        theory: "A score makes assumptions visible; it does not replace judgement. Non-negotiable work is classified before discretionary work is ranked.",
        steps: [
          "Separate true Must work—legal, safety, or viability—from discretionary candidates.",
          "For each candidate, define reach, impact, confidence, and effort on the same scales.",
          "Compute RICE = reach × impact × confidence ÷ effort.",
          "Rank the scores, then inspect which assumption created the order.",
          "Run a sensitivity check: change the least certain input and see whether the ranking survives."
        ],
        checks: ["Confidence belongs in the arithmetic; optimism is not evidence.", "A high score cannot overrule a true Must or a dependency."],
        example: "If two features switch order when confidence moves slightly, the next action is research, not pretending the ranking is settled."
      }
    ],
    IBM: [
      {
        module: 8,
        source: "IBM-M08-L04",
        title: "Use numbers as evidence in a written case",
        theory: "IBM is an all-written paper. The numerical skill is interpretation: preserve denominators, compare like with like, and connect the number to inclusion, viability, or impact.",
        steps: [
          "Name what the figure measures and whose outcome it represents.",
          "Recover the denominator and time period before comparing percentages or totals.",
          "Separate reach, depth of benefit, commercial viability, and impact; one figure rarely proves all four.",
          "Use the number in a reasoning sentence: evidence → implication → decision.",
          "State what the number cannot prove and what evidence would close the gap."
        ],
        checks: ["A larger beneficiary count can hide a thinner benefit.", "An output is not automatically an outcome, and an outcome is not automatically attributable impact."],
        example: "Write: ‘Because X changed from A to B for this group over this period, the model suggests C; however, D remains untested.’"
      }
    ]
  };

  var PRACTICE_SHAPES = [
    {id: "mixed", label: "Mixed formats", hint: "Recognition, cases, writing, and reasoning", runTitle: "Mixed-format practice"},
    {id: "recognition", label: "Recognition", hint: "Multiple choice and precise recall", runTitle: "Recognition practice"},
    {id: "application", label: "Cases and application", hint: "Decisions, matching, and reasoning chains", runTitle: "Case and application practice"},
    {id: "generation", label: "In your own words", hint: "Short answers with a visible rubric", runTitle: "Explain in your own words"}
  ];
  var PRACTICE_FOCUS = [
    {id: "all", label: "Anything", hint: "Every concept in this subject", summary: "anything in the subject"},
    {id: "weak", label: "What needs work", hint: "Open misses and missing evidence first", summary: "concepts that need work"},
    {id: "new", label: "New ground", hint: "Concepts you have not started", summary: "concepts you have not started"}
  ];
  /* "Every concept" is a coverage rule wearing a length's clothes: it asks for one
   * question per eligible concept, so its size is the subject's, not a fixed number.
   * It lives under "How long" because that is the question it answers for a learner
   * — as long as it takes to touch each idea once. */
  var PRACTICE_LENGTHS = [
    {id: "quick", label: "Quick", target: 6},
    {id: "standard", label: "Standard", target: 12},
    {id: "deep", label: "Deep", target: 18},
    {id: "sweep", label: "Every concept", target: null, sweep: true}
  ];
  var PRACTICE_MODES = [
    {id: "learning", label: "After each answer", hint: "Explanation and repair straight away"},
    {id: "simulation", label: "Held to the end", hint: "Answers and rubrics wait for the review"}
  ];

  /* Difficulty was always in the bank — every scheduled question carries 2 to 5 —
   * and nothing on the learn side had ever let anyone ask for it. It is the dial the
   * three presets actually turn, so it is a real chip row rather than something the
   * presets do behind the panel's back: a preset is a saved position of these dials
   * and nothing more. Bands overlap on purpose. A 3 is the top of the ground-covering
   * band and the floor of the applied one, because the same question is a stretch for
   * someone starting and a warm-up for someone finishing. */
  var PRACTICE_BANDS = [
    {id: "foundation", label: "Plainest", hint: "The direct surfaces: recall and one-step reading", min: 2, max: 3, summary: "the plainest surfaces"},
    {id: "applied", label: "Applied", hint: "Cases, matching and short answers on a single idea", min: 3, max: 4, summary: "applied questions"},
    {id: "hardest", label: "Hardest", hint: "Module bosses and synthesis across two ideas at once", min: 4, max: 5, summary: "the hardest surfaces"},
    {id: "any", label: "Any", hint: "Draw from every difficulty in the subject", min: 0, max: 9, summary: "any difficulty"}
  ];

  /* The three ways in, named for the stretch of marks each is built for. Every preset
   * is exactly a set of the dials above, so the panel can never disagree with the card
   * a learner pressed, and tinkering after pressing one simply lands on "Custom"
   * instead of leaving a lit card describing a run that is no longer the one queued. */
  var PRACTICE_PRESETS = [
    {
      id: "foundation",
      range: "0 → 60",
      label: "Cover everything once",
      promise: "Every concept in the subject, one question each, on its plainest surface.",
      settings: {band: "foundation", shape: "mixed", focus: "all", length: "sweep", mode: "learning"}
    },
    {
      id: "applied",
      range: "60 → 80",
      label: "Test each idea properly",
      promise: "The same ideas from several angles — cases, matching, and writing rather than recognition.",
      settings: {band: "applied", shape: "mixed", focus: "all", length: "deep", mode: "learning"}
    },
    {
      id: "hardest",
      range: "80 → 100",
      label: "Only the hardest surfaces",
      promise: "Module bosses and synthesis questions that need two ideas at once and the subject behind them.",
      settings: {band: "hardest", shape: "mixed", focus: "all", length: "standard", mode: "learning"}
    }
  ];
  var BUILDER_DIALS = ["band", "shape", "focus", "length", "mode"];
  var DEFAULT_BUILDER = clone(PRACTICE_PRESETS[0].settings);

  function $(id) { return document.getElementById(id); }
  function $all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function writtenAuthorityName() {
    return writtenAuthority.provider === "cloudflare-workers-ai" ? "Dungeon Qwen" : "local Qwen";
  }

  var UNEXPECTED_MODEL_SCRIPT = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef\ufffd]/u;
  function modelProseValid(value) {
    return typeof value === "string" && !UNEXPECTED_MODEL_SCRIPT.test(value);
  }

  async function probeWrittenAuthority() {
    if (!LOCAL_GRADER_HOST && !BACKEND_ACTIVE) return writtenAuthority;
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeout = window.setTimeout(function () { if (controller) controller.abort(); }, 4000);
    try {
      var response = await fetch(WRITTEN_AUTHORITY_ENDPOINT + "/health", {
        cache:"no-store",
        credentials:"same-origin",
        signal:controller ? controller.signal : undefined
      });
      var payload = await response.json();
      writtenAuthority = {
        available:response.ok && payload.available === true,
        model:payload.model || null,
        provider:payload.provider || (LOCAL_GRADER_HOST ? "local-lm-studio" : null),
        capabilities:Array.isArray(payload.capabilities) ? payload.capabilities : [],
        reason:payload.reason || null
      };
    } catch (error) {
      writtenAuthority = {available:false, model:null, provider:null, capabilities:[], reason:"Written checking is unavailable."};
    } finally {
      window.clearTimeout(timeout);
    }
    return writtenAuthority;
  }

  function writtenGradingApplies(question) {
    return writtenAuthority.available && writtenAuthority.capabilities.indexOf("rubric-mark") >= 0 && session &&
      session.mode !== "simulation" && session.kind !== "confidence-sprint" && question && question.type === "short-answer";
  }

  function defaultProfile() {
    return {
      version: 2,
      // The first paper sat, not the first alphabetically. A learner opening this
      // for the first time should land on the subject with the least time left.
      selectedCourse: EXAM_ORDER[0],
      subjectSort: "exam",
      conceptAttempts: {},
      /* What the examiner exposed, kept apart from conceptAttempts on purpose — see
         recordExamMisses. */
      examMisses: {},
      /* One record per submitted paper, so a second sitting of the same set can be
         compared against the first. Summary only — no responses, no question text —
         because the useful question is "did this move" and storing the paper back
         would make a saved profile a copy of the bank. */
      examAttempts: {},
      /* Minis are deliberately outside mastery evidence. This only rotates their
         eight objective surfaces and remembers the last result. */
      finalSprintProgress: {},
      /* One compact record per finished Speedrun. The cycle definition is
         deterministic and rebuildable from its rotation, so responses and question
         text never need to be copied into the profile. */
      miniMockProgress: {},
      completed: {},
      lastMock: {},
      active: null,
      totalAnswers: 0,
      blockSequence: 0,
      horizon: "today",
      /* Which keypad the bag opens on, and whether it is out. Both read defensively
         everywhere they are used, so a profile saved before they existed needs no
         migration. It starts put away: a first-time learner should meet the page, not
         a panel sitting on top of it. */
      bagCalculator: "basic",
      bagOpen: false,
      builder: clone(DEFAULT_BUILDER),
      primerState: {},
      lessonsRead: {},
      /* Criterion-level practice evidence for authored written answers. This is
         deliberately separate from conceptAttempts: Qwen can diagnose a missing
         writing move, but its practice judgement must never manufacture mastery. */
      writtenPractice: {}
    };
  }

  function optionById(options, id) {
    return options.filter(function (option) { return option.id === id; })[0] || null;
  }

  function validBuilder(candidate) {
    return Boolean(candidate) && Boolean(optionById(PRACTICE_SHAPES, candidate.shape)) &&
      Boolean(optionById(PRACTICE_FOCUS, candidate.focus)) && Boolean(optionById(PRACTICE_LENGTHS, candidate.length)) &&
      Boolean(optionById(PRACTICE_MODES, candidate.mode));
  }

  /* Difficulty arrived after the builder shipped, so a profile saved before it has
   * four dials and not five. That is a missing field, not a corrupt one: fill it and
   * keep everything the learner had chosen, rather than throwing their settings away
   * for the sake of a key that did not exist when they made them. */
  function normalizeBuilder(candidate) {
    if (!validBuilder(candidate)) return clone(DEFAULT_BUILDER);
    if (!optionById(PRACTICE_BANDS, candidate.band)) candidate.band = "any";
    return candidate;
  }

  /* Which card lights up is read back from the dials, never stored beside them. A
   * stored preset id is a second source of truth that drifts the moment one chip is
   * pressed, and a card claiming a run the queue will not deliver is exactly the
   * lying control LAW-01 exists to prevent. */
  function presetFor(settings) {
    return PRACTICE_PRESETS.filter(function (preset) {
      return BUILDER_DIALS.every(function (dial) { return preset.settings[dial] === settings[dial]; });
    })[0] || null;
  }

  function validProfile(candidate) {
    return candidate && candidate.version === 2 && COURSE_IDS.indexOf(candidate.selectedCourse) >= 0 &&
      candidate.conceptAttempts && candidate.completed && (!candidate.active || validSession(candidate.active));
  }

  function validSession(candidate) {
    return candidate && COURSES[candidate.courseId] && Array.isArray(candidate.queue) &&
      typeof candidate.index === "number" && Array.isArray(candidate.responses);
  }

  function normalizeProfileShape(candidate) {
    candidate.primerState = candidate.primerState && typeof candidate.primerState === "object" ? candidate.primerState : {};
    /* Added after version 2 shipped, so it is normalised rather than validated: an
       existing saved profile has no examMisses and must not be thrown away for it. */
    candidate.examMisses = candidate.examMisses && typeof candidate.examMisses === "object" ? candidate.examMisses : {};
    candidate.examAttempts = candidate.examAttempts && typeof candidate.examAttempts === "object" ? candidate.examAttempts : {};
    candidate.miniMockProgress = candidate.miniMockProgress && typeof candidate.miniMockProgress === "object" ? candidate.miniMockProgress : {};
    candidate.finalSprintProgress = candidate.finalSprintProgress && typeof candidate.finalSprintProgress === "object" ? candidate.finalSprintProgress : {};
    candidate.writtenPractice = candidate.writtenPractice && typeof candidate.writtenPractice === "object" ? candidate.writtenPractice : {};
    candidate.builder = normalizeBuilder(candidate.builder);
    if (candidate.active) {
      /* A model request cannot survive a page lifetime. If the page closed while
         grading, restore the answer as ready to submit instead of resuming a
         permanent spinner with no request behind it. */
      if (candidate.active.subjectiveStage === "grading") candidate.active.subjectiveStage = null;
      candidate.active.baseCount = candidate.active.baseCount || candidate.active.queue.filter(function (item) {
        var question = getQuestion(candidate.active.courseId, item.id);
        return question && question.type !== "primer" && question.type !== "lesson" && question.type !== "written-repair";
      }).length;
      candidate.active.supportCount = candidate.active.queue.length - candidate.active.baseCount;
    }
    return candidate;
  }

  function profileStorageKey() {
    return learnerEmail ? STORAGE_KEY + "." + learnerEmail : STORAGE_KEY;
  }

  function syncMetaKey() {
    return learnerEmail ? STORAGE_KEY + ".sync." + learnerEmail : null;
  }

  function readSyncMeta() {
    var key = syncMetaKey();
    if (!key) return null;
    try { return JSON.parse(localStorage.getItem(key)); } catch (error) { return null; }
  }

  function writeSyncMeta(dirty) {
    var key = syncMetaKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({email:learnerEmail, serverRevision:serverRevision, dirty:Boolean(dirty)}));
    } catch (error) {}
  }

  function writeLocalProfile(value) {
    try { localStorage.setItem(profileStorageKey(), JSON.stringify(value)); } catch (error) {}
  }

  function loadProfile() {
    try {
      var raw = localStorage.getItem(profileStorageKey());
      if (!raw && learnerEmail) {
        var claimedBy = localStorage.getItem(LEGACY_CLAIM_KEY);
        var legacy = localStorage.getItem(STORAGE_KEY);
        if (legacy && (!claimedBy || claimedBy === learnerEmail)) {
          raw = legacy;
          localStorage.setItem(LEGACY_CLAIM_KEY, learnerEmail);
        }
      }
      var parsed = JSON.parse(raw);
      if (!validProfile(parsed)) return defaultProfile();
      if (parsed.active && parsed.active.kind === "mock") {
        parsed.active.kind = "practice-shape";
        parsed.active.mode = "learning";
        parsed.active.shape = "mixed";
        parsed.active.title = "Mixed-format practice";
        parsed.active.kicker = "Learning mode · feedback after each answer";
      }
      return normalizeProfileShape(parsed);
    } catch (error) {
      return defaultProfile();
    }
  }

  function setSyncStatus(copy) {
    var node = $("sync-status");
    if (node) node.textContent = copy;
  }

  function queueBackendSave(snapshot) {
    if (!backendReady || scenarioMode) return;
    var sequence = ++localChangeSequence;
    writeSyncMeta(true);
    setSyncStatus("Saving…");
    saveChain = saveChain.catch(function () {}).then(async function () {
      var response = await fetch(PROGRESS_ENDPOINT, {
        method: "PUT",
        credentials: "same-origin",
        cache: "no-store",
        keepalive: true,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({state:snapshot})
      });
      var payload = {};
      try { payload = await response.json(); } catch (error) {}
      if (!response.ok) throw new Error(payload.message || "Progress could not be saved online.");
      serverRevision = Number(payload.revision || serverRevision);
      if (sequence === localChangeSequence) {
        writeSyncMeta(false);
        setSyncStatus("Saved online");
      }
    }).catch(function () {
      setSyncStatus("Saved on this device");
    });
  }

  function saveProfile() {
    if (scenarioMode) return;
    writeLocalProfile(profile);
    queueBackendSave(clone(profile));
  }

  async function loadBackendProfile() {
    var sessionResponse = await fetch(SESSION_ENDPOINT, {cache:"no-store", credentials:"same-origin"});
    if (!sessionResponse.ok) {
      window.location.replace("./");
      return defaultProfile();
    }
    var identity = await sessionResponse.json();
    learnerEmail = identity.email;
    communityState = identity.community || {joined:false, inviteOpenedAt:null, reminderAt:null};
    backendReady = true;
    $("account-controls").hidden = false;

    var localProfile = loadProfile();
    try {
      var progressResponse = await fetch(PROGRESS_ENDPOINT, {cache:"no-store", credentials:"same-origin"});
      if (!progressResponse.ok) throw new Error("Progress could not be loaded.");
      var remote = await progressResponse.json();
      serverRevision = Number(remote.revision || 0);
      var meta = readSyncMeta();
      var localIsUnsynced = meta && meta.email === learnerEmail && meta.dirty === true && Number(meta.serverRevision || 0) === serverRevision;

      if (remote.state && validProfile(remote.state) && !localIsUnsynced) {
        remote.state = normalizeProfileShape(remote.state);
        writeLocalProfile(remote.state);
        writeSyncMeta(false);
        setSyncStatus("Saved online");
        return remote.state;
      }

      profile = localProfile;
      writeLocalProfile(localProfile);
      queueBackendSave(clone(localProfile));
      await saveChain;
      return localProfile;
    } catch (error) {
      setSyncStatus("Saved on this device");
      return localProfile;
    }
  }

  /* The examiner's screens. Which product you are in is derived from the screen on
     show rather than stored, so the header switch can never drift out of step with
     the page behind it — including on the routes that were written long before the
     switch existed. */
  var EXAM_SCREENS = {"exam-home-screen": true, "exam-screen": true};

  function showScreen(id) {
    window.clearTimeout(writtenEvidenceTimer);
    writtenEvidenceTimer = null;
    $all(".screen").forEach(function (screen) { screen.classList.toggle("active", screen.id === id); });
    document.body.classList.toggle("is-study-reader", id === "notes-screen");
    var coachedMockScreen = (id === "practice-screen" && session && ["confidence-sprint", "final-sprint", "paper-pattern"].indexOf(session.kind) >= 0) ||
      (id === "results-screen" && lastFinished && ["confidence-sprint", "final-sprint", "paper-pattern"].indexOf(lastFinished.kind) >= 0);
    markMode((EXAM_SCREENS[id] || coachedMockScreen) ? "exam" : "learn");
    syncModeSwitchVisibility();
    /* After markMode, not before: the header reports the side you are on, and the
       screen's own render runs before this and would compute it from the side you
       were on a moment ago. */
    renderHeaderStats();
    /* Each floating offer lives inside its own screen, so changing screens hides it —
       but the body class outlived it, and anything positioned around the bar (the bag)
       went on making room for a bar that was not there. Cleared on every change; the
       observer on the newly shown screen puts it back if its own hero is out of view,
       which after a scroll reset it never is. */
    document.body.classList.remove("has-resume-bar");
    window.scrollTo(0, 0);
  }

  function getCourse(courseId) { return COURSES[courseId]; }
  function getConcept(courseId, conceptId) {
    return getCourse(courseId).concepts.filter(function (concept) { return concept.id === conceptId; })[0] || null;
  }
  /* ------------------------------------------------------------------
   * Teaching layer
   *
   * A lesson is the surface that makes 0→80 possible: one lecture, taught once,
   * before anything about that lecture is scored. The scheduling invariant is
   * enforced in layeredQueue — a scored question citing lecture L cannot appear
   * before L's lesson has been delivered — so a cold learner never meets a
   * graded item in vocabulary nobody introduced.
   *
   * Lesson queue items encode their lecture and concept in the id
   * ("lesson:<lectureId>|<conceptId>") because the live session is cloned into
   * profile.active and must survive save/resume as plain JSON.
   * ---------------------------------------------------------------- */
  var LESSONS = window.T6_LESSONS || {};

  /* How much of each subject the teaching layer actually covers.
   *
   * Generated by tools/measure-syllabus-coverage.mjs --emit against the course's own
   * revision sheets. It exists because every count the app already showed described
   * the BANK — "16 concepts", "0 of 16 Strong" — and a learner has no way to know the
   * bank is a selection rather than the subject. Measured 2026-08-17: BRGSA 78%, SPMS
   * 39%, SCLM 32%, IBM 19%. Presenting 16 of 16 as a finished subject while under half
   * the examinable ideas are untaught is the product overstating itself, and the file
   * header of app/sets/t6_lessons.js has said so since it was written.
   *
   * Absent or malformed, every helper below returns null and the UI simply omits the
   * line — a missing generated file must not blank a working dashboard. */
  var COVERAGE = window.T6_COVERAGE || {};

  function coverageFor(courseId) {
    var entry = COVERAGE[courseId];
    if (!entry || typeof entry.percent !== "number" || !entry.ideas) return null;
    return entry;
  }

  function coverageModuleFor(courseId, moduleNumber) {
    var entry = coverageFor(courseId);
    if (!entry || !Array.isArray(entry.modules)) return null;
    for (var i = 0; i < entry.modules.length; i += 1) {
      if (entry.modules[i].module === Number(moduleNumber)) return entry.modules[i];
    }
    return null;
  }

  /* One sentence a learner can act on, not a percentage on its own. A bare number
   * discourages without telling anyone what to do about it, which is the mistake the
   * readiness figure already made once and was fixed for. */
  function coverageSentence(courseId) {
    var entry = coverageFor(courseId);
    if (!entry) return "";
    if (entry.taught >= entry.ideas) {
      return "Learn teaches all " + entry.ideas + " named ideas in this subject's revision notes. " +
        "Every idea is reached; repeated transfer depth still differs by concept.";
    }
    return "Learn teaches " + entry.taught + " of the " + entry.ideas +
      " ideas this subject's own revision notes name — about " + entry.percent + "%. " +
      "What it does cover is the part the paper leans on hardest.";
  }

  function lessonFor(lectureId) { return LESSONS[lectureId] || null; }

  function lessonsReadMap() {
    if (!profile.lessonsRead || typeof profile.lessonsRead !== "object") profile.lessonsRead = {};
    return profile.lessonsRead;
  }

  function lessonIsRead(lectureId) { return !!lessonsReadMap()[lectureId]; }

  function markLessonRead(lectureId) {
    if (!lectureId) return;
    lessonsReadMap()[lectureId] = Date.now();
    /* An add-in is delivered inside its host lesson. Marking only the host made the
       folded lecture remain permanently "unread" even after its full prose had been
       on screen, which in turn made coverage and later re-teach decisions disagree
       with the learner's experience. */
    var host = lessonFor(lectureId);
    (host && host.addIns || []).forEach(function (addIn) {
      lessonsReadMap()[addIn.lectureId] = Date.now();
    });
    saveProfile();
  }

  function lectureIdsFor(question) {
    if (!question) return [];
    return unique((question.sourceIds && question.sourceIds.length ? question.sourceIds : [question.source]) || [])
      .filter(Boolean);
  }

  /* Where a lecture sits in the course's own teaching sequence.
   *
   * A lecture id is `<SUBJECT>-M<NN>-L<NN>`, and both numbers are positional: the
   * modules run in teaching order and the Nth section of a module file is L<N>.
   * So module-then-lecture *is* the order the course builds its ideas in, and
   * nothing else needs inventing — there is no separate prerequisite graph, and
   * the concept records carry prose (`bridge`) rather than links.
   *
   * An unparseable id sorts last rather than first: an unknown position must not
   * silently claim to be the foundation everything else builds on. */
  function lectureTeachingRank(lectureId) {
    var parsed = /-M(\d+)-L(\d+)$/.exec(String(lectureId || ""));
    return parsed ? (Number(parsed[1]) * 1000) + Number(parsed[2]) : Number.MAX_SAFE_INTEGER;
  }

  /* A surface's place in the sequence is the LAST lecture it needs, not the first.
   * A question citing M01-L05 and M01-L10 cannot be asked until both are taught,
   * so ranking it by L05 would drag L10's lesson forward into the middle of L05's
   * block and undo the layering this ordering exists to create. */
  function teachingRankOf(question) {
    var ranks = lectureIdsFor(question).map(lectureTeachingRank);
    return ranks.length ? Math.max.apply(null, ranks) : Number.MAX_SAFE_INTEGER;
  }

  function conceptIdsOf(question) {
    if (!question) return [];
    return unique([question.conceptId].concat(question.supportingConceptIds || [])).filter(Boolean);
  }

  /* A lesson the learner has read, whose idea their answers since say they did not
   * take away.
   *
   * `lessonsRead` was a one-way latch and `pendingLessonsFor` filtered on it, so a
   * lecture met once was never taught again — including by the routes that exist for
   * nothing else. `conceptRepairIds` is commented "One concept, several surfaces,
   * taught first"; `startExamRepair` prints "Taught first, then tested again" on
   * screen; the re-attempt path below says "must not overtake its own teaching". All
   * three were true only for a learner meeting the lecture for the first time. For
   * everybody else the lesson was dropped and the repair run opened on a question —
   * which is the one case where the learner has just proved they need the material.
   *
   * Re-teaching is scoped narrowly on purpose, because the failure on the other side
   * is making somebody re-read a page they know every time they slip:
   *
   *   - only where the caller asks for it: remediation and in-run re-attempts, never
   *     a fresh study set, the sweep, or the examiner;
   *   - only on evidence recorded AFTER the lesson was read, so the errors that sent
   *     them to the lesson cannot immediately send them back to it;
   *   - only while the gap is still open — a wrong answer already followed by a right
   *     one is somebody who recovered, and re-teaching that is noise, not help.
   *
   * The last scored answer being wrong is the whole test. It is deliberately about
   * the concept rather than the question: getting the same item wrong twice and
   * getting two different items on one idea wrong are the same gap. */
  /* A mock counts too, and until 2026-08-15 it did not.
   *
   * `recordExamMisses` writes `examMisses` and deliberately never writes an attempt —
   * misses "prioritise and never score". This function read `attemptsFor` alone, so
   * the two stores were disjoint and a paper could not reach the re-teach latch. The
   * effect was precise and invisible: a learner who read the lesson, sat a mock and
   * lost the marks was sent straight back to the question with no lesson, under a
   * kicker reading "Taught first, then tested again". First contact worked, which is
   * exactly the shape this latch was fixed for once already.
   *
   * `missed` and `written` count; `skipped` alone does not. Running out of time is a
   * timing signal, not evidence the idea was lost, and `examMissList` already weights
   * it lower for the same reason. */
  function examMissNeedsReteach(courseId, conceptId, readAt) {
    var entry = ((profile.examMisses || {})[courseId] || {})[conceptId];
    if (!entry || !entry.at) return false;
    var missedAt = Date.parse(entry.at);
    if (!missedAt || missedAt <= readAt) return false;
    if (!((Number(entry.missed) || 0) > 0 || (Number(entry.written) || 0) > 0)) return false;
    /* The RECOVERED rule, applied to the mock as well. A learner who lost the marks
       and has since answered the idea correctly is not sent back to the page — the
       same judgement `reteach-on-failure.js` case 2 holds the Learn side to. Without
       this the miss would re-teach on every sitting for ever, which is the "re-teach
       everything on every slip" product that is worse than never re-teaching. */
    return !attemptsFor(courseId, conceptId).some(function (attempt) {
      return attempt.scored !== false && attempt.correct === true && attempt.at > missedAt;
    });
  }

  function lessonNeedsReteach(courseId, lectureId, conceptIds) {
    var readAt = lessonsReadMap()[lectureId];
    if (!readAt) return false;
    return (conceptIds || []).some(function (conceptId) {
      if (examMissNeedsReteach(courseId, conceptId, readAt)) return true;
      var since = attemptsFor(courseId, conceptId).filter(function (attempt) {
        return attempt.scored !== false && attempt.correct !== null && attempt.at > readAt;
      });
      if (!since.length) return false;
      return since[since.length - 1].correct === false;
    });
  }

  /* Lessons a question depends on that the learner has not been taught yet — or, when
   * `reteachCourseId` is supplied, has been taught and demonstrably has not kept. */
  function pendingLessonsFor(question, reteachCourseId) {
    var conceptIds = reteachCourseId ? conceptIdsOf(question) : [];
    return lectureIdsFor(question).filter(function (lectureId) {
      if (!lessonFor(lectureId)) return false;
      if (!lessonIsRead(lectureId)) return true;
      return Boolean(reteachCourseId) && lessonNeedsReteach(reteachCourseId, lectureId, conceptIds);
    });
  }

  function lessonItemId(lectureId, conceptId) { return "lesson:" + lectureId + "|" + conceptId; }

  function writtenRepairItemId(questionId, sequence) { return "written-repair:" + questionId + "|" + sequence; }

  function parseWrittenRepairItemId(questionId) {
    if (String(questionId).indexOf("written-repair:") !== 0) return null;
    var body = String(questionId).slice("written-repair:".length).split("|");
    return {originId:body[0]};
  }

  function parseLessonItemId(questionId) {
    if (String(questionId).indexOf("lesson:") !== 0) return null;
    var body = String(questionId).slice("lesson:".length).split("|");
    return {lectureId: body[0], conceptId: body[1] || null};
  }

  /* A lesson is presented as a synthetic question so the existing session
   * machinery — topic list, progress, save/resume — keeps working unchanged.
   * It is never scored and never creates evidence. */
  function lessonQuestion(courseId, questionId) {
    var parsed = parseLessonItemId(questionId);
    if (!parsed) return null;
    var data = lessonFor(parsed.lectureId);
    if (!data) return null;
    return {
      id: questionId,
      courseId: courseId,
      conceptId: parsed.conceptId,
      supportingConceptIds: [],
      module: data.module,
      source: data.lectureId,
      sourceIds: [data.lectureId],
      node: data.title,
      pattern: "Lesson",
      perspective: "learn",
      type: "lesson",
      skills: ["recognise"],
      difficulty: 0,
      variantFamily: data.lectureId + "_lesson",
      boss: false,
      lessonOnly: true,
      lesson: data,
      caselet: null,
      stem: data.objective,
      explanation: data.objective,
      link: data.connects || "",
      misconceptions: []
    };
  }

  /* A criterion repair is support, not a question. It is generated from the
   * authored rubric and course explanation after an accepted authority result,
   * then placed inside the queue so save/resume and the teaching order remain
   * truthful. No learner answer or model prose is copied into this item. */
  function writtenRepairQuestion(courseId, questionId) {
    var parsed = parseWrittenRepairItemId(questionId);
    if (!parsed) return null;
    var origin = getCourse(courseId).questions[parsed.originId];
    if (!origin) return null;
    return {
      id:questionId,
      courseId:courseId,
      conceptId:origin.conceptId,
      supportingConceptIds:[],
      module:origin.module,
      source:origin.source,
      sourceIds:lectureIdsFor(origin),
      node:origin.node,
      pattern:"Dungeon intervention",
      perspective:"learn",
      type:"written-repair",
      skills:["apply", "generate"],
      difficulty:0,
      variantFamily:origin.variantFamily + "_written-repair",
      boss:false,
      repairOnly:true,
      originQuestion:origin,
      caselet:null,
      stem:"Repair a missing written-answer criterion",
      explanation:origin.explanation,
      link:origin.link,
      misconceptions:[]
    };
  }

  function isSupportItem(item) { return !!(item && (item.lesson || item.writtenRepair)); }

  function getQuestion(courseId, questionId) {
    if (String(questionId).indexOf("lesson:") === 0) return lessonQuestion(courseId, questionId);
    if (String(questionId).indexOf("written-repair:") === 0) return writtenRepairQuestion(courseId, questionId);
    var paperPatternQuestion = window.T6_PAPER_PATTERN && typeof window.T6_PAPER_PATTERN.question === "function"
      ? window.T6_PAPER_PATTERN.question(courseId, questionId) : null;
    if (paperPatternQuestion) return paperPatternQuestion;
    return getCourse(courseId).questions[questionId] || null;
  }
  function getStudySet(courseId, setId) {
    return getCourse(courseId).runs.filter(function (item) { return item.id === Number(setId); })[0] || null;
  }

  function attemptsFor(courseId, conceptId) {
    var courseAttempts = profile.conceptAttempts[courseId] || {};
    return courseAttempts[conceptId] || [];
  }

  function writtenPracticeMap() {
    if (!profile.writtenPractice || typeof profile.writtenPractice !== "object") profile.writtenPractice = {};
    return profile.writtenPractice;
  }

  function writtenCoursePractice(courseId) {
    var store = writtenPracticeMap();
    if (!store[courseId] || typeof store[courseId] !== "object") {
      store[courseId] = {accepted:0, lastAt:0, criteria:{}, questions:{}, gaps:{}};
    }
    var course = store[courseId];
    if (!course.criteria || typeof course.criteria !== "object") course.criteria = {};
    if (!course.questions || typeof course.questions !== "object") course.questions = {};
    if (!course.gaps || typeof course.gaps !== "object") course.gaps = {};
    course.accepted = Number(course.accepted) || 0;
    return course;
  }

  function writtenCriterionLabel(courseId, criterionId) {
    var questions = Object.keys(getCourse(courseId).questions).map(function (id) { return getQuestion(courseId, id); });
    for (var questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
      var rubric = questions[questionIndex] && questions[questionIndex].rubric || [];
      for (var criterionIndex = 0; criterionIndex < rubric.length; criterionIndex += 1) {
        if (rubric[criterionIndex].id === criterionId) return rubric[criterionIndex].label;
      }
    }
    return criterionId;
  }

  function writtenGapDefinition(question, gapCode) {
    return (question.writtenGaps || []).filter(function (gap) { return gap.id === gapCode; })[0] || null;
  }

  function writtenGapKey(question, gap) {
    return gap.scope === "writing" ? "writing::" + gap.id : question.conceptId + "::" + gap.id;
  }

  function openWrittenGap(course, question, gap, source) {
    var key = writtenGapKey(question, gap);
    var now = Date.now();
    var record = course.gaps[key] || {
      key:key, code:gap.id, criterionId:gap.criterionId, kind:gap.kind,
      scope:gap.scope, label:gap.label, conceptId:gap.scope === "concept" ? question.conceptId : null,
      misses:0, confirmationsNeeded:0, lastAt:0, source:"practice"
    };
    record.misses = (Number(record.misses) || 0) + 1;
    record.confirmationsNeeded = 2;
    record.lastAt = now;
    record.source = source === "exam" ? "exam" : record.source || "practice";
    record.lastQuestionId = question.id;
    course.gaps[key] = record;
  }

  /* A miss opens two transfer confirmations. One later success is encouraging;
   * two fresh successful answers close the gap. The stored record contains only
   * criterion outcomes and question ids — never the learner's prose. */
  function recordWrittenPracticeEvidence(courseId, question, grade) {
    var course = writtenCoursePractice(courseId);
    var now = Date.now();
    course.accepted += 1;
    course.lastAt = now;
    var questionRecord = course.questions[question.id] || {attempts:0, lastAt:0, lastScore:0, missing:[]};
    questionRecord.attempts += 1;
    questionRecord.lastAt = now;
    questionRecord.lastScore = grade.score;
    questionRecord.missing = grade.criteria.filter(function (criterion) { return criterion.decision !== "met"; }).map(function (criterion) { return criterion.id; });
    course.questions[question.id] = questionRecord;
    grade.criteria.forEach(function (criterion) {
      var record = course.criteria[criterion.id] || {attempts:0, met:0, confirmationsNeeded:0, lastAt:0, recent:[]};
      record.attempts += 1;
      if (criterion.decision === "met") {
        record.met += 1;
        record.confirmationsNeeded = Math.max(0, (Number(record.confirmationsNeeded) || 0) - 1);
      } else {
        record.confirmationsNeeded = 2;
      }
      record.lastAt = now;
      record.recent = (record.recent || []).concat([{questionId:question.id, met:criterion.decision === "met", at:now}]).slice(-8);
      course.criteria[criterion.id] = record;

      if (criterion.decision === "met") {
        Object.keys(course.gaps).forEach(function (key) {
          var gapRecord = course.gaps[key];
          var applies = gapRecord.criterionId === criterion.id &&
            (gapRecord.scope === "writing" || gapRecord.conceptId === question.conceptId);
          if (applies) gapRecord.confirmationsNeeded = Math.max(0, (Number(gapRecord.confirmationsNeeded) || 0) - 1);
        });
      } else {
        (criterion.gapCodes || []).forEach(function (code) {
          var gap = writtenGapDefinition(question, code);
          if (gap && gap.criterionId === criterion.id) openWrittenGap(course, question, gap, "practice");
        });
      }
    });
  }

  /* Examiner diagnoses only open targets. A mock success cannot close one: the
   * paper is uncoached evidence used for prioritisation, not a mastery update. */
  function recordExamWrittenDiagnosis(courseId, question, grade) {
    var course = writtenCoursePractice(courseId);
    var failed = 0;
    grade.criteria.forEach(function (criterion) {
      if (criterion.decision === "met") return;
      failed += 1;
      (criterion.gapCodes || []).forEach(function (code) {
        var gap = writtenGapDefinition(question, code);
        if (gap && gap.criterionId === criterion.id) openWrittenGap(course, question, gap, "exam");
      });
    });
    if (failed) {
      var examStore = profile.examMisses[courseId] || (profile.examMisses[courseId] = {});
      var entry = examStore[question.conceptId] || (examStore[question.conceptId] = {missed:0, skipped:0, written:0, at:null});
      entry.written = (Number(entry.written) || 0) + failed;
      entry.at = new Date().toISOString();
    }
    saveProfile();
  }

  function recordExamWrittenUnreviewable(courseId, question) {
    var examStore = profile.examMisses[courseId] || (profile.examMisses[courseId] = {});
    var entry = examStore[question.conceptId] || (examStore[question.conceptId] = {missed:0, skipped:0, written:0, at:null});
    entry.written = (Number(entry.written) || 0) + 1;
    entry.at = new Date().toISOString();
    saveProfile();
  }

  function writtenPracticeSummary(courseId) {
    var course = writtenCoursePractice(courseId);
    var criteria = Object.keys(course.criteria).map(function (id) {
      var record = course.criteria[id];
      return {
        id:id,
        label:writtenCriterionLabel(courseId, id),
        attempts:Number(record.attempts) || 0,
        met:Number(record.met) || 0,
        confirmationsNeeded:Number(record.confirmationsNeeded) || 0,
        lastAt:Number(record.lastAt) || 0
      };
    }).sort(function (left, right) {
      var leftRate = left.attempts ? left.met / left.attempts : 1;
      var rightRate = right.attempts ? right.met / right.attempts : 1;
      return right.confirmationsNeeded - left.confirmationsNeeded || leftRate - rightRate || right.lastAt - left.lastAt;
    });
    var open = criteria.filter(function (criterion) { return criterion.confirmationsNeeded > 0; });
    var openGaps = Object.keys(course.gaps).map(function (key) {
      var record = course.gaps[key];
      return {
        key:key, code:record.code, criterionId:record.criterionId, kind:record.kind,
        scope:record.scope, label:record.label, conceptId:record.conceptId || null,
        misses:Number(record.misses) || 0,
        confirmationsNeeded:Number(record.confirmationsNeeded) || 0,
        lastAt:Number(record.lastAt) || 0,
        source:record.source || "practice"
      };
    }).filter(function (gap) { return gap.confirmationsNeeded > 0; }).sort(function (left, right) {
      return right.confirmationsNeeded - left.confirmationsNeeded ||
        (left.kind === "misunderstood" ? -1 : 0) - (right.kind === "misunderstood" ? -1 : 0) ||
        right.lastAt - left.lastAt;
    });
    var confirmationTotal = openGaps.length
      ? openGaps.reduce(function (sum, gap) { return sum + gap.confirmationsNeeded; }, 0)
      : open.reduce(function (sum, criterion) { return sum + criterion.confirmationsNeeded; }, 0);
    return {
      accepted:course.accepted,
      criteria:criteria,
      open:open,
      openGaps:openGaps,
      confirmationsNeeded:confirmationTotal,
      focus:openGaps[0] || open[0] || null
    };
  }

  function attemptType(attempt) {
    if (attempt.type) return attempt.type;
    if (attempt.perspective === "apply") return "mcq-apply";
    if (attempt.perspective === "connect") return "mcq-connect";
    return "legacy-mcq";
  }

  function attemptBlock(attempt) {
    return attempt.blockId || "legacy-history";
  }

  function durationBucket(durationMs) {
    if (!isFinite(durationMs) || durationMs < 0) return "unknown";
    if (durationMs < 5000) return "under-5s";
    if (durationMs < 15000) return "5-15s";
    if (durationMs < 30000) return "15-30s";
    if (durationMs < 60000) return "30-60s";
    if (durationMs < 3 * 60 * 1000) return "1-3m";
    if (durationMs < 10 * 60 * 1000) return "3-10m";
    return "over-10m";
  }

  /* Until empirical item means exist, use the authored estimate when present and
     conservative format defaults otherwise. Ten per cent of that estimate, capped
     at ten seconds, is a provisional Strong-eligibility threshold — never a claim
     that the answer itself is invalid. */
  function expectedResponseMinutes(question) {
    if (Number(question.estimatedMinutes) > 0) return Number(question.estimatedMinutes);
    return {
      mcq: 1,
      msq: 2,
      numeric: 3,
      cloze: 1.5,
      "case-cloze": 2,
      match: 2,
      boss: 4,
      "short-answer": 4
    }[question.type || "mcq"] || 1;
  }

  function rapidResponseThresholdMs(question) {
    return Math.min(10000, Math.max(3000, Math.round(expectedResponseMinutes(question) * 60 * 1000 * .1)));
  }

  function responseTimingKey(item) {
    return session ? [session.blockId || "block", session.index, item.id].join("|") : null;
  }

  function responseClockNow() {
    return window.performance && typeof window.performance.now === "function" ? window.performance.now() : Date.now();
  }

  function startResponseTiming(item, question) {
    if (!session || session.answered) return;
    var key = responseTimingKey(item);
    if (responseTiming.key === key) return;
    /* A response restored from saved active state has no trustworthy start time in
       this page lifetime. Keep its timing unknown instead of calling a fast commit
       a rapid guess. */
    if (question && hasCompleteResponse(question)) {
      responseTiming = {key: key, startedAt: 0};
      return;
    }
    /* Primers are teaching support, not scored retrieval. Do not collect a
       duration band for them merely because they share the response controls. */
    responseTiming = {key: key, startedAt: question && question.type === "primer" ? 0 : responseClockNow()};
  }

  function responseTimingMeta(question) {
    if (!session || responseTiming.key !== responseTimingKey(currentItem()) || !responseTiming.startedAt) {
      return {durationBucket: "unknown", rapidGuess: false, strongEligible: true};
    }
    var elapsed = Math.max(0, responseClockNow() - responseTiming.startedAt);
    /* Constructed responses remain self-reviewed and never create Strong evidence;
       primers are support. Rapid-response classification is for scored retrieval. */
    var canRapidGuess = question.type !== "short-answer" && question.type !== "primer" && question.type !== "lesson";
    var rapidGuess = canRapidGuess && elapsed < rapidResponseThresholdMs(question);
    return {durationBucket: durationBucket(elapsed), rapidGuess: rapidGuess, strongEligible: !rapidGuess};
  }

  function unresolvedAttempt(attempts, predicate, resolver) {
    for (var index = attempts.length - 1; index >= 0; index -= 1) {
      if (!predicate(attempts[index])) continue;
      return !attempts.slice(index + 1).some(function (later) { return resolver(later, attempts[index]); });
    }
    return false;
  }

  function confidenceWasDiagnostic(attempt) {
    return ["low", "medium", "high"].indexOf(attempt.confidence) >= 0 && attempt.confidencePrompted !== false && attempt.scored !== false;
  }

  function confidentErrorRemainsOpen(attempts) {
    for (var index = attempts.length - 1; index >= 0; index -= 1) {
      var error = attempts[index];
      if (error.scored === false || error.correct || error.confidence !== "high") continue;
      var repairs = attempts.slice(index + 1).filter(function (later) {
        return later.scored !== false && later.correct && (later.variantFamily || later.questionId) !== (error.variantFamily || error.questionId);
      });
      if (unique(repairs.map(function (attempt) { return attempt.variantFamily || attempt.questionId; })).length < 2 || unique(repairs.map(attemptBlock)).length < 2) return true;
    }
    return false;
  }

  function recurringMisconception(attempts) {
    var wrong = attempts.filter(function (attempt) { return attempt.scored !== false && !attempt.correct && attempt.misconception; });
    return unique(wrong.map(function (attempt) { return attempt.misconception; })).filter(function (tag) {
      var events = wrong.filter(function (attempt) { return attempt.misconception === tag; });
      return unique(events.map(function (attempt) { return attempt.variantFamily || attempt.questionId; })).length >= 2 || unique(events.map(attemptBlock)).length >= 2;
    })[0] || null;
  }

  function evidenceFromAttempts(attempts, now) {
    now = now || Date.now();
    var scored = attempts.filter(function (attempt) { return attempt.scored !== false; });
    var constructed = attempts.filter(function (attempt) { return attempt.scored === false && attempt.type === "short-answer"; });
    var correct = scored.filter(function (attempt) { return attempt.correct; });
    /* Historical attempts predate response timing and remain eligible. Only an
       explicit rapid-response classification can withhold Strong credit. */
    var strongEligible = scored.filter(function (attempt) { return attempt.strongEligible !== false && !attempt.rapidGuess; });
    var strongCorrect = strongEligible.filter(function (attempt) { return attempt.correct; });
    var rapidResponses = scored.filter(function (attempt) { return attempt.rapidGuess; });
    var latest = scored[scored.length - 1] || null;
    var latestStrongEligible = strongEligible[strongEligible.length - 1] || null;
    var recent = scored.slice(-3);
    var wrongRecent = recent.filter(function (attempt) { return !attempt.correct; }).length;
    var correctTypes = unique(strongCorrect.map(attemptType));
    var allCorrectTypes = unique(correct.map(attemptType));
    var correctBlocks = unique(strongCorrect.map(attemptBlock).filter(function (block) { return block !== "legacy-history"; }));
    var bossStepEvidence = scored.some(function (attempt) { return attempt.boss && !attempt.hintUsed && (attempt.bossStepsPassed > 0 || (attempt.bossStepsPassed === undefined && attempt.correct)); });
    var wholeChainSuccess = scored.some(function (attempt) { return attempt.boss && !attempt.hintUsed && (attempt.wholeItemCorrect === true || (attempt.wholeItemCorrect === undefined && attempt.correct)); });
    var strongBossStepEvidence = strongEligible.some(function (attempt) { return attempt.boss && !attempt.hintUsed && (attempt.bossStepsPassed > 0 || (attempt.bossStepsPassed === undefined && attempt.correct)); });
    var transferCorrect = strongCorrect.some(function (attempt) {
      return attempt.transfer || attempt.boss || attempt.type === "case-cloze" || ["apply", "connect", "evaluate", "synthesis"].indexOf(attempt.perspective) >= 0;
    });
    var integrativeEvidence = transferCorrect || strongBossStepEvidence;
    var openConfidentError = confidentErrorRemainsOpen(scored);
    var openUnderconfidentCorrect = unresolvedAttempt(scored, function (attempt) {
      return attempt.correct && attempt.confidence === "low";
    }, function (later, event) {
      return later.correct && (later.variantFamily || later.questionId) !== (event.variantFamily || event.questionId);
    });
    var recurringError = recurringMisconception(scored);
    var openBossFailure = unresolvedAttempt(scored, function (attempt) {
      return attempt.boss && (attempt.bossStepsFailed > 0 || (attempt.bossStepsFailed === undefined && !attempt.correct));
    }, function (later) { return later.boss && later.correct && !later.hintUsed; });
    var status = "developing";
    if (!attempts.length) status = "unseen";
    else if (scored.length && (!correct.length || wrongRecent >= 2 || openConfidentError || recurringError || openBossFailure)) status = "needs";
    /* A rapid response contributes no Strong evidence, but it also cannot erase a
       Strong body that already existed. Recency is therefore evaluated against the
       latest eligible attempt. Incorrect rapid responses still affect the ordinary
       error gates above: speed never invalidates the answer itself. */
    else if (strongEligible.length >= 5 && strongCorrect.length >= 4 && correctTypes.length >= 3 && correctBlocks.length >= 2 && integrativeEvidence && !openUnderconfidentCorrect && latestStrongEligible && latestStrongEligible.correct) status = "strong";

    var firstCorrectAt = strongCorrect.length ? strongCorrect[0].at : 0;
    var delayedCorrect = strongCorrect.some(function (attempt) { return firstCorrectAt && attempt.at - firstCorrectAt >= 20 * 60 * 60 * 1000; });
    var lastCorrectAt = strongCorrect.length ? strongCorrect[strongCorrect.length - 1].at : 0;
    var refreshDue = !!lastCorrectAt && now - lastCorrectAt > 4 * 24 * 60 * 60 * 1000;
    var confidenceAttempts = scored.filter(confidenceWasDiagnostic);
    var highAttempts = confidenceAttempts.filter(function (attempt) { return attempt.confidence === "high"; });
    var lowCorrect = confidenceAttempts.filter(function (attempt) { return attempt.confidence === "low" && attempt.correct; }).length;
    var highAccuracy = highAttempts.length ? highAttempts.filter(function (attempt) { return attempt.correct; }).length / highAttempts.length : null;
    var confidenceBlocks = unique(confidenceAttempts.map(attemptBlock));
    var confidenceTypes = unique(confidenceAttempts.map(attemptType));
    var enoughConfidenceEvidence = confidenceAttempts.length >= 20 && confidenceBlocks.length >= 3 && confidenceTypes.length >= 2;
    var confidenceLabel = "Not enough diagnostic confidence evidence yet (" + confidenceAttempts.length + " of 20 checks)";
    if (openConfidentError) confidenceLabel = "One confident mistake needs two independent checks";
    else if (enoughConfidenceEvidence && lowCorrect >= Math.ceil(confidenceAttempts.filter(function (attempt) { return attempt.confidence === "low"; }).length / 2)) confidenceLabel = "Your confidence is still catching up to demonstrated results";
    else if (enoughConfidenceEvidence && (highAccuracy === null || highAccuracy >= .75)) confidenceLabel = "Your confidence broadly matches your demonstrated results";

    var reasons = [];
    if (status === "unseen") reasons.push("No scored attempt yet.");
    else {
      reasons.push(correct.length + " of " + scored.length + " scored attempts correct.");
      if (constructed.length) reasons.push(constructed.length + " constructed response" + (constructed.length === 1 ? "" : "s") + " self-reviewed; these do not receive automatic correctness credit.");
      if (allCorrectTypes.length === correctTypes.length) {
        reasons.push(correctTypes.length + " distinct question type" + (correctTypes.length === 1 ? "" : "s") + " passed toward Strong (3 required)." );
      } else {
        reasons.push(allCorrectTypes.length + " distinct question type" + (allCorrectTypes.length === 1 ? " was" : "s were") +
          " correct; " + correctTypes.length + " currently count toward Strong (3 required). Fast answers keep their scores but need confirmation." );
      }
      reasons.push(correctBlocks.length + " of 2 required practice blocks passed.");
      reasons.push(integrativeEvidence ? "Applied evidence is present from a new case or reasoning step." : "A new case or successful reasoning step is still needed.");
      if (bossStepEvidence && !wholeChainSuccess) reasons.push("A boss step supports this concept; the whole reasoning chain remains open.");
      else if (wholeChainSuccess) reasons.push("An unassisted whole reasoning chain is complete.");
      if (openConfidentError) reasons.push("One ‘could explain’ mistake needs two independent repairs before it closes.");
      else if (openUnderconfidentCorrect) reasons.push("A correct guessing/not-sure answer needs one independent new-family confirmation.");
      else if (recurringError) reasons.push("The same misconception returned across independent evidence: " + recurringError + ".");
      else if (openBossFailure) reasons.push("A failed reasoning step still needs a later whole-chain check.");
      else if (status === "strong" && refreshDue) reasons.push("Strong evidence is more than four days old; a short refresh is due.");
      else if (status === "strong") reasons.push(delayedCorrect ? "Recalled again after a gap of at least 20 hours." : "Strong current evidence; a later retest will check retention.");
      else if (latest && !latest.correct) reasons.push("The latest answer was wrong; one miss does not erase earlier evidence.");
      if (rapidResponses.length) reasons.push(rapidResponses.length + " fast response" + (rapidResponses.length === 1 ? " kept its result" : "s kept their results") + " but did not count toward Strong evidence.");
    }
    return {
      status: status,
      attempts: scored.length,
      correct: correct.length,
      strongEligibleAttempts: strongEligible.length,
      rapidResponses: rapidResponses.length,
      constructed: constructed.length,
      allCorrectTypes: allCorrectTypes.length,
      correctTypes: correctTypes.length,
      correctBlocks: correctBlocks.length,
      bossStepEvidence: bossStepEvidence,
      wholeChainSuccess: wholeChainSuccess,
      transferCorrect: transferCorrect,
      integrativeEvidence: integrativeEvidence,
      openConfidentError: openConfidentError,
      openUnderconfidentCorrect: openUnderconfidentCorrect,
      recurringMisconception: recurringError,
      openBossFailure: openBossFailure,
      delayedCorrect: delayedCorrect,
      refreshDue: refreshDue,
      confidenceCount: confidenceAttempts.length,
      confidenceLabel: confidenceLabel,
      reasons: reasons,
      latestAt: latest ? latest.at : 0
    };
  }

  function conceptEvidence(courseId, conceptId) {
    return evidenceFromAttempts(attemptsFor(courseId, conceptId));
  }

  function conceptStatus(courseId, conceptId) {
    return conceptEvidence(courseId, conceptId).status;
  }

  /* The best state this concept ever held, replayed from its own attempt history.
   *
   * WHY IT IS REPLAYED AND NOT STORED
   * The same reason `trendFromCourses` replays: a stored high-water mark is a second
   * copy of the evidence rule that drifts from it, and a learner whose attempts are
   * edited or reloaded would keep a peak the evidence no longer supports. Replaying
   * costs one pass per concept and can only ever say what the current rule says.
   *
   * WHY IT EXISTS
   * Until 2026-08-15 a concept that fell from Strong was character-for-character
   * identical on the shelf to one that had never been learned — same label, same
   * actions — and the difference was visible only behind the "Why" disclosure, as
   * evidence counts the reader had to interpret. Detected, acted on, and never said.
   */
  function conceptPeakStatus(courseId, conceptId) {
    var attempts = attemptsFor(courseId, conceptId);
    var peak = "unseen";
    for (var i = 1; i <= attempts.length; i += 1) {
      var at = attempts[i - 1].at;
      var status = evidenceFromAttempts(attempts.slice(0, i), at).status;
      if (STATUS_ORDER[status] > STATUS_ORDER[peak]) peak = status;
    }
    return peak;
  }

  /* Present tense only: a concept currently below its own best. Returns null when
     nothing was lost, so callers can treat it as "is there something to say". */
  function conceptDecline(courseId, conceptId, currentStatus) {
    var peak = conceptPeakStatus(courseId, conceptId);
    if (STATUS_ORDER[peak] <= STATUS_ORDER[currentStatus]) return null;
    return {from: peak, fromLabel: STATUS_LABEL[peak]};
  }

  function courseStats(courseId) {
    var counts = {strong: 0, developing: 0, needs: 0, unseen: 0};
    getCourse(courseId).concepts.forEach(function (concept) { counts[conceptStatus(courseId, concept.id)] += 1; });
    counts.total = getCourse(courseId).concepts.length;
    counts.weighted = Math.round((counts.strong + counts.developing * .5) / counts.total * 100);
    return counts;
  }

  function overallStats() {
    return COURSE_IDS.reduce(function (total, courseId) {
      var stats = courseStats(courseId);
      total.strong += stats.strong;
      total.developing += stats.developing;
      total.needs += stats.needs;
      total.unseen += stats.unseen;
      total.total += stats.total;
      return total;
    }, {strong: 0, developing: 0, needs: 0, unseen: 0, total: 0});
  }

  function overallConfidenceSummary() {
    var seen = {};
    var attempts = [];
    COURSE_IDS.forEach(function (courseId) {
      getCourse(courseId).concepts.forEach(function (concept) {
        attemptsFor(courseId, concept.id).forEach(function (attempt) {
          var key = courseId + "|" + attempt.questionId + "|" + attemptBlock(attempt) + "|" + attempt.at;
          if (!seen[key]) { seen[key] = true; attempts.push(attempt); }
        });
      });
    });
    var diagnostic = attempts.filter(confidenceWasDiagnostic);
    var blocks = unique(diagnostic.map(attemptBlock));
    var types = unique(diagnostic.map(attemptType));
    if (diagnostic.length < 20 || blocks.length < 3 || types.length < 2) return "Confidence is sampled on diagnostic questions. An overall summary needs 20 checks across three study blocks and two formats; " + diagnostic.length + " are available.";
    var high = diagnostic.filter(function (attempt) { return attempt.confidence === "high"; });
    var highWrong = high.filter(function (attempt) { return !attempt.correct; }).length;
    var low = diagnostic.filter(function (attempt) { return attempt.confidence === "low"; });
    var lowCorrect = low.filter(function (attempt) { return attempt.correct; }).length;
    if (highWrong) return "Across diagnostic checks, " + highWrong + " of " + high.length + " ‘could explain’ answers were wrong. Those concepts receive contrastive repair; this is not a learner label.";
    if (lowCorrect >= 2) return lowCorrect + " of " + low.length + " guessing/not-sure answers were correct. New-family checks will test whether that knowledge is reliable.";
    return "Diagnostic confidence and scored results are broadly aligned so far. Counts remain visible and no personality or permanent trait is inferred.";
  }

  function questionSurfaces(courseId, conceptId) {
    var surfaces = Object.keys(getCourse(courseId).questions).map(function (id) { return getCourse(courseId).questions[id]; })
      .filter(function (question) {
        return !question.primerOnly && (question.conceptId === conceptId || (question.supportingConceptIds || []).indexOf(conceptId) >= 0);
      });
    var activeSurfaces = surfaces.filter(function (question) { return !question.optionShapeRisk; });
    return activeSurfaces.length ? activeSurfaces : surfaces;
  }

  /* Which concepts are genuinely connected, derived from the bank rather than asserted.
   *
   * An edge exists only where an authored surface tests both concepts at once — the
   * question's own concept plus its `supportingConceptIds`. That is a deliberately
   * strict definition, and it is strict for a reason: a link is only useful to a
   * learner if there is something to practise it ON. Two ideas that merely sit in the
   * same module, or on neighbouring lectures, would be a claim with no surface behind
   * it, and the product would be asserting a relationship it cannot then exercise.
   *
   * Measured on the shipped bank, that yields each concept's module partner (a match
   * question plus five boss steps, six surfaces), and in SCLM two real cross-module
   * edges through `sclm_syn_inventory`, which tests EOQ, newsvendor and smoothing
   * together. Nothing else. So the graph is sparse and honest, and the isolated case
   * below is the common one rather than an afterthought.
   *
   * Built once per course and cached: the bank does not change at runtime. */
  var conceptLinkCache = {};
  function conceptLinks(courseId) {
    if (conceptLinkCache[courseId]) return conceptLinkCache[courseId];
    var edges = {};
    var course = getCourse(courseId);
    Object.keys(course.questions).forEach(function (questionId) {
      var question = course.questions[questionId];
      if (question.primerOnly) return;
      var ids = unique([question.conceptId].concat(question.supportingConceptIds || [])).filter(Boolean);
      for (var a = 0; a < ids.length; a += 1) {
        for (var b = a + 1; b < ids.length; b += 1) {
          [[ids[a], ids[b]], [ids[b], ids[a]]].forEach(function (pair) {
            var from = edges[pair[0]] || (edges[pair[0]] = {});
            (from[pair[1]] || (from[pair[1]] = [])).push(question);
          });
        }
      }
    });
    conceptLinkCache[courseId] = edges;
    return edges;
  }

  function linkedConceptIds(courseId, conceptId) {
    return Object.keys(conceptLinks(courseId)[conceptId] || {});
  }

  /* The surface that actually joins two concepts. A boss is three steps and heavy for
   * a repair run, so a plain joint question wins when the bank offers one — which,
   * measured, it always does. The boss is the fallback rather than the default. */
  function linkSurface(courseId, aId, bId, avoidIds) {
    var candidates = ((conceptLinks(courseId)[aId] || {})[bId] || [])
      .filter(function (question) { return (avoidIds || []).indexOf(question.id) < 0; });
    if (!candidates.length) return null;
    var ranked = candidates.slice().sort(function (a, b) {
      return (a.boss ? 1 : 0) - (b.boss ? 1 : 0)
        || questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id);
    });
    return ranked[0];
  }

  /* Pair the weaknesses that are connected; report the rest as isolated.
   *
   * Greedy in priority order, which is the property that matters: the weakest concept
   * gets first choice of partner, so pairing never demotes the thing the learner most
   * needs. A concept is paired ONLY with another concept that is itself in the weak
   * set — a link to something already Strong is not a shared weakness, and treating it
   * as one would practise a gap the learner does not have. Everything left over is
   * isolated, and is returned as such rather than quietly pretended into a group. */
  function groupWeaknesses(courseId, orderedConcepts) {
    var remaining = orderedConcepts.slice();
    var units = [];
    while (remaining.length) {
      var concept = remaining.shift();
      var partnerIds = linkedConceptIds(courseId, concept.id);
      var partnerIndex = -1;
      remaining.forEach(function (candidate, index) {
        if (partnerIndex >= 0) return;
        if (partnerIds.indexOf(candidate.id) >= 0) partnerIndex = index;
      });
      if (partnerIndex < 0) {
        units.push({kind: "isolated", concepts: [concept]});
        continue;
      }
      var partner = remaining.splice(partnerIndex, 1)[0];
      /* Inside a pair the earlier lecture still comes first: a shared weakness is no
       * reason to stop building in the order the course builds. */
      var pair = [concept, partner].sort(function (a, b) {
        return conceptTeachingRank(courseId, a.id) - conceptTeachingRank(courseId, b.id);
      });
      units.push({kind: "linked", concepts: pair, leadConceptId: concept.id});
    }
    return units;
  }

  function conceptTeachingRank(courseId, conceptId) {
    var concept = getConcept(courseId, conceptId);
    return concept ? lectureTeachingRank(concept.source) : Number.MAX_SAFE_INTEGER;
  }

  function questionLastAttemptAt(courseId, questionId) {
    var question = getQuestion(courseId, questionId);
    if (!question) return 0;
    var conceptIds = [question.conceptId].concat(question.supportingConceptIds || []);
    var attempts = conceptIds.reduce(function (all, conceptId) {
      return all.concat(attemptsFor(courseId, conceptId).filter(function (attempt) { return attempt.questionId === questionId; }));
    }, []);
    attempts.sort(function (a, b) { return a.at - b.at; });
    return attempts.length ? attempts[attempts.length - 1].at : 0;
  }

  function chooseQuestion(courseId, conceptId, avoidId, queuedIds) {
    var attempts = attemptsFor(courseId, conceptId);
    var usedTypes = attempts.map(attemptType);
    var usedFamilies = attempts.map(function (attempt) { return attempt.variantFamily || attempt.questionId; });
    var surfaces = questionSurfaces(courseId, conceptId).filter(function (question) {
      return question.id !== avoidId && queuedIds.indexOf(question.id) < 0;
    });
    if (!surfaces.length) surfaces = questionSurfaces(courseId, conceptId).filter(function (question) { return question.id !== avoidId; });
    if (!surfaces.length) return null;
    surfaces.sort(function (a, b) {
      var aFamilyNew = usedFamilies.indexOf(a.variantFamily || a.id) < 0 ? 0 : 1;
      var bFamilyNew = usedFamilies.indexOf(b.variantFamily || b.id) < 0 ? 0 : 1;
      var aTypeNew = usedTypes.indexOf(a.type || "mcq") < 0 ? 0 : 1;
      var bTypeNew = usedTypes.indexOf(b.type || "mcq") < 0 ? 0 : 1;
      return aFamilyNew - bFamilyNew || aTypeNew - bTypeNew || questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id);
    });
    return surfaces[0];
  }

  function recordAttempt(courseId, question, outcome, confidenceValue, item, blockId, timing) {
    var evaluation = typeof outcome === "boolean" ? {correct: outcome, partial: outcome ? 1 : 0, conceptResults: {}} : outcome;
    timing = timing || {durationBucket: "unknown", rapidGuess: false, strongEligible: true};
    var conceptIds = unique([question.conceptId].concat(question.supportingConceptIds || []));
    profile.conceptAttempts[courseId] = profile.conceptAttempts[courseId] || {};
    conceptIds.forEach(function (conceptId) {
      var attempts = profile.conceptAttempts[courseId][conceptId] || [];
      var hasConceptResult = Object.prototype.hasOwnProperty.call(evaluation.conceptResults || {}, conceptId);
      var conceptCorrect = hasConceptResult ? evaluation.conceptResults[conceptId] : evaluation.correct;
      var relevantBossSteps = [];
      if (question.boss && Array.isArray(evaluation.partResults)) question.steps.forEach(function (step, index) {
        if ((step.conceptIds || []).indexOf(conceptId) >= 0) relevantBossSteps.push(evaluation.partResults[index]);
      });
      var scored = evaluation.scored !== false;
      attempts.push({
        questionId: question.id,
        variantFamily: question.variantFamily || question.id,
        perspective: question.perspective || "explain",
        type: question.type || "mcq",
        skills: question.skills || [],
        difficulty: question.difficulty || 2,
        boss: !!question.boss,
        scored: scored,
        correct: scored ? !!conceptCorrect : null,
        wholeItemCorrect: scored ? !!evaluation.correct : null,
        partial: evaluation.partial || 0,
        confidence: confidenceValue || null,
        confidencePrompted: item && typeof item.askConfidence === "boolean" ? item.askConfidence : ["low", "medium", "high", "skipped"].indexOf(confidenceValue) >= 0,
        confidenceSkipped: confidenceValue === "skipped",
        misconception: evaluation.misconception || null,
        hintUsed: !!evaluation.hintUsed,
        assistanceUsed: !!evaluation.assistanceUsed,
        revealedSteps: !!evaluation.revealedSteps,
        bossStepsPassed: relevantBossSteps.filter(Boolean).length,
        bossStepsFailed: relevantBossSteps.filter(function (result) { return !result; }).length,
        bossStepsTotal: relevantBossSteps.length,
        constructedScore: evaluation.constructedScore === undefined ? null : evaluation.constructedScore,
        constructedTotal: evaluation.constructedTotal === undefined ? null : evaluation.constructedTotal,
        transfer: question.boss || question.type === "case-cloze" || ["apply", "connect", "evaluate", "synthesis"].indexOf(question.perspective) >= 0,
        isReattempt: !!(item && item.isReattempt),
        durationBucket: timing.durationBucket || "unknown",
        rapidGuess: !!timing.rapidGuess,
        strongEligible: timing.strongEligible !== false && !timing.rapidGuess,
        blockId: blockId || (session && session.blockId) || null,
        at: item && item.at ? item.at : Date.now()
      });
      profile.conceptAttempts[courseId][conceptId] = attempts.slice(-60);
      updatePrimerFromChallenge(courseId, conceptId, question, scored ? !!conceptCorrect : null);
    });
    profile.totalAnswers += 1;
  }

  function primerStateFor(courseId, conceptId) {
    profile.primerState = profile.primerState || {};
    profile.primerState[courseId] = profile.primerState[courseId] || {};
    profile.primerState[courseId][conceptId] = profile.primerState[courseId][conceptId] || {
      support: 1,
      easyStreak: 0,
      shown: 0,
      correct: 0,
      wrong: 0,
      lastAt: 0
    };
    return profile.primerState[courseId][conceptId];
  }

  function primerQuestionFor(courseId, conceptId) {
    return getQuestion(courseId, conceptId + "_primer");
  }

  function primerSupportLevel(courseId, conceptId) {
    var state = primerStateFor(courseId, conceptId);
    var attempts = attemptsFor(courseId, conceptId).filter(function (attempt) { return attempt.scored !== false; });
    var recent = attempts.slice(-2);
    if (conceptStatus(courseId, conceptId) === "strong" || state.easyStreak >= 2 || (recent.length === 2 && recent.every(function (attempt) { return attempt.correct && attempt.difficulty >= 3; }))) return 0;
    if (!attempts.length) return Math.max(1, Math.min(3, state.support || 1));
    var misses = recent.filter(function (attempt) { return !attempt.correct; }).length;
    if (misses === 2) return 3;
    if (misses === 1 || conceptStatus(courseId, conceptId) === "needs") return Math.max(2, Math.min(3, state.support || 1));
    return Math.max(0, Math.min(3, state.support || 0));
  }

  /* A primer records that it was shown, and nothing else.
   *
   * It used to move the support ladder on whether the learner picked the right option
   * — an option that was printed on the same screen (LAW-63), so the ladder was reading
   * whether somebody could match a string. The ladder's real input was always
   * `updatePrimerFromChallenge`: how the concept's *scored* questions went. That is the
   * only thing that moves it now. `predicted` is kept apart from `shown` because
   * "I would be guessing" is a legitimate answer at first contact and should not read
   * as a missed prediction. */
  function recordPrimerAttempt(courseId, question, predicted) {
    var state = primerStateFor(courseId, question.conceptId);
    state.shown += 1;
    state.predicted = (state.predicted || 0) + (predicted ? 1 : 0);
    state.lastAt = Date.now();
  }

  function updatePrimerFromChallenge(courseId, conceptId, question, correct) {
    if (correct === null || question.primerOnly) return;
    var state = primerStateFor(courseId, conceptId);
    if (!correct) {
      state.easyStreak = 0;
      state.support = Math.min(3, Math.max(2, state.support + 1));
      return;
    }
    if ((question.difficulty || 2) >= 3) state.easyStreak += 1;
    state.support = state.easyStreak >= 2 ? 0 : Math.max(0, state.support - 1);
  }

  function renderDashboard(options) {
    options = options || {};
    /* The disclosed numbers belong to the subject the learner picked. The previous
       version mixed whole-term counts into a subject-specific page, making the first
       four figures require interpretation before they were useful. */
    var selectedStats = courseStats(profile.selectedCourse);
    $("overall-strong").textContent = String(selectedStats.strong);
    $("overall-developing").textContent = String(selectedStats.developing);
    $("overall-needs").textContent = String(selectedStats.needs);
    $("overall-unseen").textContent = String(selectedStats.unseen);
    renderCourseCards();
    renderHeaderStats();
    renderSelectedSubject();
    renderRecommendation();
    renderProgressStory();
    renderCommunityReminder();
    renderConceptShelf();
    // The row is rebuilt above, so its scrollable width has just changed.
    updateRailScrollCue();
  }

  // Blocks are the honest unit of this line: one practice block moves it at most once, so repeating
  // the same questions inside a block cannot inflate it.
  function trendFromCourses(courseIds) {
    var blocks = {};
    var conceptTotal = 0;
    courseIds.forEach(function (courseId) {
      getCourse(courseId).concepts.forEach(function (concept) {
        conceptTotal += 1;
        attemptsFor(courseId, concept.id).forEach(function (attempt) {
          var id = attemptBlock(attempt);
          blocks[id] = blocks[id] || {id: id, at: attempt.at};
          blocks[id].at = Math.max(blocks[id].at, attempt.at);
        });
      });
    });
    var ordered = Object.keys(blocks).map(function (id) { return blocks[id]; })
      .sort(function (a, b) { return a.at - b.at; }).slice(-12);
    return ordered.map(function (block) {
      var total = 0;
      courseIds.forEach(function (courseId) {
        getCourse(courseId).concepts.forEach(function (concept) {
          var past = attemptsFor(courseId, concept.id).filter(function (attempt) { return attempt.at <= block.at; });
          var status = evidenceFromAttempts(past, block.at).status;
          total += status === "strong" ? 1 : status === "developing" ? .5 : 0;
        });
      });
      return {at: block.at, value: Math.round(total / Math.max(1, conceptTotal) * 100)};
    });
  }

  /* How many distinct practice blocks are on record. Counted directly rather than
     taken from trendFromCourses, which rebuilds the evidence model at every block in
     history to plot a line — real work for a number that is just "how many". */
  function practiceBlockCount() {
    var blocks = {};
    COURSE_IDS.forEach(function (courseId) {
      getCourse(courseId).concepts.forEach(function (concept) {
        attemptsFor(courseId, concept.id).forEach(function (attempt) { blocks[attemptBlock(attempt)] = true; });
      });
    });
    return Object.keys(blocks).length;
  }

  /* The header reports the side you are on.
   *
   * On the learning system it is progress and the work behind it. On the examiner
   * those numbers are the wrong ones twice over: mocks deliberately never touch your
   * evidence, so the percentage would sit there unmoved however many papers you sat,
   * and a block count belongs to a product you are not currently in. The examiner's
   * own two numbers are how many papers you have finished and what they averaged. */
  function renderHeaderStats() {
    var label = $("header-stat-label");
    if ($("notes-screen") && $("notes-screen").classList.contains("active")) {
      if (label) label.textContent = "Study";
      $("header-trend-value").textContent = String(Object.keys(LESSONS).length);
      $("header-trend-note").textContent = "course entries";
      return;
    }
    if (currentMode() === "exam") {
      var attempts = [];
      Object.keys(profile.examAttempts || {}).forEach(function (courseId) {
        attempts = attempts.concat(profile.examAttempts[courseId] || []);
      });
      var average = attempts.length
        ? Math.round(attempts.reduce(function (sum, row) { return sum + examPercent(row); }, 0) / attempts.length)
        : null;
      if (label) label.textContent = "Mocks completed";
      $("header-trend-value").textContent = String(attempts.length);
      $("header-trend-note").textContent = average === null ? "No score yet" : "Average score " + average + "%";
      return;
    }
    var overall = overallStats();
    var current = Math.round((overall.strong + overall.developing * .5) / Math.max(1, overall.total) * 100);
    if (label) label.textContent = "Term 6 progress";
    $("header-trend-value").textContent = current + "%";
    var blocks = practiceBlockCount();
    $("header-trend-note").textContent = blocks + " block" + (blocks === 1 ? "" : "s") + " practised";
  }

  /* The route to Strong is the official shadcn gradient-area chart pattern, bundled
   * with the other dashboard charts in t6-chart.js. Dungeon remains framework-free
   * outside this island, and the measure remains evidence rather than a prediction. */
  function renderGoalChart(node, course, stats) {
    var label = course.shortTitle + ": " + stats.strong + " of " + stats.total +
      " concepts Strong. " + Math.round(stats.weighted) + "% along the evidence route.";
    node.setAttribute("aria-label", label);
    if (window.DungeonCharts && window.DungeonCharts.renderMomentum) {
      window.DungeonCharts.renderMomentum(node, {
        progress: stats.weighted,
        label: label,
        reducedMotion: prefersReducedMotion()
      });
      return;
    }
    node.textContent = Math.round(stats.weighted) + "% along the evidence route";
  }

  function goalMessage(course, stats) {
    var remaining = stats.total - stats.strong;
    if (!remaining) return "Every concept in " + course.shortTitle + " is Strong. This subject is as far as the evidence goes.";
    if (!stats.strong && !stats.developing) {
      return remaining + " concepts stand between here and a complete " + course.shortTitle + ". One short block starts the climb.";
    }
    if (!stats.strong) {
      return stats.developing + " concepts are already building. " + remaining + " still need enough evidence to reach Strong.";
    }
    return stats.strong + " of " + stats.total + " are Strong" +
      (stats.developing ? ", " + stats.developing + " are close behind" : "") +
      ". " + remaining + " to go.";
  }

  function renderMomentum(courseId) {
    var course = getCourse(courseId);
    var stats = courseStats(courseId);
    var points = courseTrend(courseId);
    var delta = points.length > 1 ? points[points.length - 1].value - points[points.length - 2].value : null;
    $("momentum-scope").textContent = course.shortTitle;
    $("momentum-value").textContent = stats.strong + " / " + stats.total;
    var deltaNode = $("momentum-delta");
    deltaNode.className = "momentum-delta " + (delta === null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat");
    /* The chip carries movement when there is movement to report, and the target
     * when there is not — so the card is never reduced to announcing an absence. */
    deltaNode.textContent = delta === null
      ? (stats.strong === stats.total ? "complete" : (stats.total - stats.strong) + " to go")
      : delta > 0 ? "+" + delta + " this block" : delta < 0 ? delta + " this block" : "held level";
    renderGoalChart($("hero-trend"), course, stats);
    $("momentum-message").textContent = goalMessage(course, stats);
  }


  function progressStory(courseId) {
    var seen = {};
    var blocks = {};
    var story = {answers: 0, blocks: 0, touched: 0, latest: 0};
    getCourse(courseId).concepts.forEach(function (concept) {
      var attempts = attemptsFor(courseId, concept.id);
      if (attempts.length) story.touched += 1;
      attempts.forEach(function (attempt) {
        blocks[attemptBlock(attempt)] = true;
        if (attempt.at > story.latest) story.latest = attempt.at;
        // One question can carry several concepts; count the answer once.
        var key = courseId + "|" + attempt.questionId + "|" + attemptBlock(attempt) + "|" + attempt.at;
        if (seen[key]) return;
        seen[key] = true;
        story.answers += 1;
      });
    });
    story.blocks = Object.keys(blocks).length;
    return story;
  }

  function relativeDay(timestamp) {
    if (!timestamp) return "not yet";
    var hours = Math.floor((Date.now() - timestamp) / 3600000);
    if (hours < 1) return "within the hour";
    if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
    var days = Math.floor(hours / 24);
    return days === 1 ? "yesterday" : days + " days ago";
  }

  /* What you have done, in one line.
   *
   * This was four bordered stat cards — answers, blocks, concepts touched, subjects
   * started — sitting above four more bordered stat cards for the concept states.
   * Eight boxes of numbers before the learner reached anything they could act on.
   * The same four facts read as a sentence, and the boxes below now carry the only
   * numbers that describe evidence rather than effort. Still strictly factual: no
   * praise, and activity is never presented as progress. */
  function renderProgressStory() {
    var courseId = profile.selectedCourse;
    var story = progressStory(courseId);
    var course = getCourse(courseId);
    if (!story.answers) {
      $("story-stats").textContent = "Nothing is recorded in " + course.shortTitle + " yet. Its first run fills in these numbers.";
      return;
    }
    $("story-stats").textContent = story.answers + " answer" + (story.answers === 1 ? "" : "s") +
      " across " + story.blocks + " practice block" + (story.blocks === 1 ? "" : "s") + ". " +
      story.touched + " of " + course.concepts.length + " concepts have evidence. Last answer " + relativeDay(story.latest) + ".";
  }

  /* Everything the theme switch cannot reach through CSS. */
  function repaintThemedSurfaces() {
    if ($("mastery-radar")) renderMasteryRadar();
  }

  /* The four subjects plus their cross-course connections use shadcn's official
   * Recharts radar component. Recharts now owns geometry, animation, tooltips and
   * responsive resizing; this function owns only Dungeon's evidence data and copy. */
  function renderMasteryRadar() {
    var chart = $("mastery-radar");
    if (!chart) return;
    var connections = 0;
    var conceptCount = 0;
    var axes = COURSE_IDS.map(function (courseId) {
      return {label:getCourse(courseId).shortTitle, value:courseStats(courseId).weighted};
    });
    COURSE_IDS.forEach(function (courseId) {
      getCourse(courseId).concepts.forEach(function (concept) {
        conceptCount += 1;
        if (conceptEvidence(courseId, concept.id).integrativeEvidence) connections += 1;
      });
    });
    axes.push({label:"Connections", value:Math.round(connections / Math.max(1, conceptCount) * 100)});
    $("mastery-values").innerHTML = axes.map(function (axis) {
      return "<li><span>" + escapeHtml(axis.label) + "</span><b>" + axis.value + "%</b></li>";
    }).join("");
    var label = "Radar chart with five axes: " +
      axes.map(function (axis) { return axis.label; }).join(", ") +
      ". Connections is not a subject. The value for each is listed beside the chart.";
    chart.setAttribute("aria-label", label);
    if (window.DungeonCharts && window.DungeonCharts.renderRadar) {
      window.DungeonCharts.renderRadar(chart, {axes:axes, label:label, reducedMotion:prefersReducedMotion()});
    } else {
      chart.textContent = axes.map(function (axis) { return axis.label + " " + axis.value + "%"; }).join(" · ");
    }
    $("mastery-radar-copy").textContent = "Subject values reflect Strong and Developing evidence. Connections shows concepts already used in a case, link, or reasoning step.";
  }

  function renderCommunityReminder() {
    var reminder = $("community-reminder");
    if (!reminder) return;
    reminder.hidden = !BACKEND_ACTIVE || !!communityState.joined;
    if (reminder.hidden) return;
    $("community-reminder-title").textContent = communityState.reminderAt ? "Aneeket bumped this reminder" : "Join the tester group to keep testing";
    $("community-reminder-copy").textContent = "Open the WhatsApp invite, join the group, and share feedback during testing. Testers who do not join and participate will be removed from the cohort.";
    $("community-joined").disabled = !communityState.inviteOpenedAt;
    $("community-joined").textContent = communityState.inviteOpenedAt ? "I joined the group" : "Open the invite first";
  }

  /* ------------------------------------------------------------------
   * Read-through mode.
   *
   * A lesson normally reaches a learner only because layeredQueue() puts it
   * ahead of a scored question citing its lecture. That is the right default —
   * teaching arrives just before it is tested — but it has two consequences
   * this panel exists to answer.
   *
   * For the learner: there was no way to read the material as a course, only to
   * meet it one lesson at a time inside practice.
   *
   * For whoever is authoring: a lesson for a lecture no question cites is never
   * delivered to anyone, and nothing in the app said so. IBM module 1 was
   * authored in full before that was noticed; 8 of its 10 lessons are
   * unreachable in practice. This panel labels each lesson with whether
   * practice can actually deliver it, and lists cited lectures that have no
   * lesson yet, which is the authoring queue.
   *
   * Reading here is deliberately NOT recorded. profile.lessonsRead drives the
   * teach-before-test gate, so writing to it here would let someone skim the
   * index and silently disable the gate for every lesson they skimmed.
   * ------------------------------------------------------------------ */
  /* Which lectures can practice actually reach?
   *
   * Module study sets schedule the complete authored module, not merely the subset
   * of lectures cited by their eight sampled questions. Question citations still
   * enforce teach-before-test on focused and repair runs; the module schedule is
   * what makes the entire teaching layer reachable on the main 1→8 course path. */
  function scheduledLectureIds(courseId) {
    var course = getCourse(courseId);
    var scheduled = {};
    if (!course) return scheduled;
    var liveModules = {};
    (course.runs || []).forEach(function (run) {
      if (run.module >= 1 && run.module <= 8) liveModules[run.module] = true;
    });
    Object.keys(LESSONS).forEach(function (lectureId) {
      var lesson = LESSONS[lectureId];
      if (lesson.courseId === courseId && liveModules[lesson.module]) scheduled[lectureId] = true;
    });
    return scheduled;
  }

  function lessonStatusFor(lectureId, scheduled) {
    if (!LESSONS[lectureId]) return {key: "missing", label: "No lesson yet"};
    if (scheduled[lectureId]) return {key: "live", label: "Scheduled in module practice"};
    return {key: "readonly", label: "Readable here — not scheduled yet"};
  }

  function appendLessonBody(container, data) {
    function block(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      container.appendChild(node);
      return node;
    }

    if (data.objective) block("p", "lesson-read-objective", "After this you can: " + data.objective);
    (data.explainer || []).forEach(function (paragraph) { block("p", null, paragraph); });

    if (data.worked) {
      block("h5", "lesson-read-label", "Worked through");
      var worked = block("div", "lesson-read-worked");
      [["Situation", data.worked.setup], ["Move", data.worked.move], ["Why", data.worked.because]]
        .forEach(function (pair) {
          if (!pair[1]) return;
          var line = document.createElement("p");
          var name = document.createElement("b");
          name.textContent = pair[0] + ". ";
          line.appendChild(name);
          line.appendChild(document.createTextNode(pair[1]));
          worked.appendChild(line);
        });
    }

    if ((data.glossary || []).length) {
      block("h5", "lesson-read-label", "Words this lecture introduces");
      var list = document.createElement("dl");
      list.className = "lesson-read-glossary";
      data.glossary.forEach(function (entry) {
        var term = document.createElement("dt");
        term.textContent = entry.term;
        var plain = document.createElement("dd");
        plain.textContent = entry.plain;
        list.appendChild(term);
        list.appendChild(plain);
      });
      container.appendChild(list);
    }

    /* Add-ins read inside their host, because that is the point of them: a lecture
     * that does not warrant a lesson of its own is taught where it belongs rather
     * than padded out or dropped. Each one still says which lecture it covers, so a
     * learner looking for that lecture can see it was not skipped. */
    (data.addIns || []).forEach(function (addIn) {
      block("h5", "lesson-read-label", "Also covered here: " + addIn.title);
      if (addIn.objective) block("p", "lesson-read-objective", "After this you can: " + addIn.objective);
      (addIn.explainer || []).forEach(function (paragraph) { block("p", null, paragraph); });
      if ((addIn.glossary || []).length) {
        var addInList = document.createElement("dl");
        addInList.className = "lesson-read-glossary";
        addIn.glossary.forEach(function (entry) {
          var addInTerm = document.createElement("dt");
          addInTerm.textContent = entry.term;
          var addInPlain = document.createElement("dd");
          addInPlain.textContent = entry.plain;
          addInList.appendChild(addInTerm);
          addInList.appendChild(addInPlain);
        });
        container.appendChild(addInList);
      }
    });

    if (data.connects) block("p", "lesson-read-connects", data.connects);
  }

  /* The concept shelf.
   *
   * Everything a learner needs per concept used to be split across two places: the
   * shelf listed every concept with Practise and Lesson, while a separate module
   * browser paged through the same concepts eight at a time and opened an inspector
   * panel holding the one thing the shelf lacked — the evidence still missing.
   * Two lists of the same 16 concepts, and the reason to act on one of them was
   * only in the list that could not act.
   *
   * The shelf is now the only concept list. The evidence, the summary, and the
   * confidence note moved onto the row they describe, behind the concept's own
   * name, so inspecting a concept is not a place you navigate to.
   *
   * It does not re-render lesson prose — Lesson jumps to the existing lesson row
   * and opens it, so there is one copy of that content, not two that can drift. */
  function openLessonFor(lectureId) {
    // The lesson index lives in a disclosure, so open it before scrolling —
    // otherwise the scroll and focus below land inside a collapsed element.
    revealDisclosure("lessons-disclosure");
    var row = document.querySelector('.lesson-row[data-lecture="' + lectureId + '"]');
    if (!row) return;
    if (row.tagName === "DETAILS") row.open = true;
    row.scrollIntoView({block: "center", behavior: "smooth"});
    var head = row.querySelector(".lesson-row-head");
    if (head && head.focus) head.focus({preventScroll: true});
  }

  function renderConceptShelf() {
    var host = $("concept-shelf-list");
    if (!host) return;
    host.textContent = "";
    var courseId = profile.selectedCourse;
    var course = getCourse(courseId);
    /* "SPMS · 16 concepts" is true of the BANK and reads as the whole subject, which
     * is the single most misleading count on the dashboard: a learner who takes all
     * sixteen to Strong has covered well under half of what the paper can examine.
     * The concepts are still the right unit of work — they are what the bank measures
     * — so the count stays and the scope is stated beside it. */
    var label = $("concept-shelf-label");
    if (label) {
      var shelfCoverage = coverageFor(courseId);
      label.textContent = (course.shortTitle || courseId) + " · " + (course.concepts || []).length + " concepts" +
        (shelfCoverage ? " · " + shelfCoverage.percent + "% syllabus" : "");
    }

    var byModule = {};
    (course.concepts || []).forEach(function (concept) {
      (byModule[concept.module] = byModule[concept.module] || []).push(concept);
    });

    Object.keys(byModule).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (moduleKey) {
      var group = document.createElement("div");
      group.className = "shelf-group";
      var heading = document.createElement("p");
      heading.className = "shelf-module";
      heading.textContent = "Module " + moduleKey;
      group.appendChild(heading);

      byModule[moduleKey].forEach(function (concept) {
        var evidence = conceptEvidence(courseId, concept.id);
        var status = evidence.status;
        var row = document.createElement("div");
        row.className = "shelf-row";
        row.dataset.conceptId = concept.id;

        /* The name is the disclosure control. Toggling with an explicit `hidden`
         * sibling rather than <details> is deliberate: the row is a grid whose
         * state and actions must stay visible while the evidence is collapsed,
         * and a closed <details> hides every non-summary child in the UA layer
         * where author CSS cannot reliably reach it (the LAW-36 shape). */
        var bodyId = "shelf-evidence-" + courseId + "-" + concept.id;
        var name = document.createElement("button");
        name.type = "button";
        name.className = "shelf-name";
        name.setAttribute("aria-expanded", "false");
        name.setAttribute("aria-controls", bodyId);
        name.innerHTML = "<i class='dot " + status + "' aria-hidden='true'></i><b>" + escapeHtml(concept.name) + "</b>" +
          "<span class='shelf-why' aria-hidden='true'>Why</span>";
        row.appendChild(name);

        /* The status cell is a wrapper so `.shelf-state` keeps EXACTLY the status
           label and nothing else. Nesting the decline inside it made
           `.shelf-state.textContent` read "Needs practicewas Strong", which quietly
           broke `measurement-evidence.js`'s exact-equality match on "Strong" — a
           probe failing because of a UI change it was not about is the worst kind of
           false signal. The wrapper occupies the same grid column, so the row's
           three-column layout is unchanged. */
        var statusCell = document.createElement("span");
        statusCell.className = "shelf-status-cell";

        var state = document.createElement("span");
        state.className = "shelf-state " + status;
        state.textContent = STATUS_LABEL[status] || status;
        statusCell.appendChild(state);

        /* Say the loss on the row rather than leaving it to be inferred from evidence
           counts behind the disclosure. Words, not colour or an arrow: the four
           mastery states must stay distinguishable without either, and a decline is
           no different. */
        var decline = conceptDecline(courseId, concept.id, status);
        if (decline) {
          var lost = document.createElement("small");
          lost.className = "shelf-lost";
          lost.textContent = "was " + decline.fromLabel;
          statusCell.appendChild(lost);
        }
        row.appendChild(statusCell);

        var actions = document.createElement("span");
        actions.className = "shelf-actions";

        var practise = document.createElement("button");
        practise.type = "button";
        practise.className = "button compact primary";
        practise.textContent = "Practise";
        practise.setAttribute("aria-label", "Practise " + concept.name + " on its own");
        practise.addEventListener("click", function () { startConceptPractice(courseId, concept.id); });
        actions.appendChild(practise);

        // Only offer a lesson where one actually exists; a dead button that
        // explains nothing is worse than no button.
        var lectureId = concept.source;
        if (lectureId && LESSONS[lectureId]) {
          var lesson = document.createElement("button");
          lesson.type = "button";
          lesson.className = "button compact quiet";
          lesson.textContent = "Lesson";
          lesson.setAttribute("aria-label", "Read the lesson for " + concept.name + ", unscored");
          lesson.addEventListener("click", function () { openLessonFor(lectureId); });
          actions.appendChild(lesson);
        }

        row.appendChild(actions);

        // The evidence that used to live in the separate inspector panel: what the
        // concept is, what is still missing before Strong, and what the sampled
        // confidence checks do and do not say.
        var body = document.createElement("div");
        body.className = "shelf-body";
        body.id = bodyId;
        body.hidden = true;

        var surfaces = questionSurfaces(courseId, concept.id);
        var explained = surfaces.filter(function (question) { return question.explanation; })[0];
        var summaryLine = document.createElement("p");
        summaryLine.className = "shelf-summary";
        summaryLine.textContent = concept.summary || (explained ? explained.explanation : "Practise this concept to build visible evidence.");
        body.appendChild(summaryLine);

        var reasons = document.createElement("ul");
        reasons.className = "shelf-evidence";
        reasons.innerHTML = evidence.reasons.map(function (reason) {
          return "<li>" + escapeHtml(reason) + "</li>";
        }).join("");
        body.appendChild(reasons);

        var confidence = document.createElement("p");
        confidence.className = "shelf-confidence";
        confidence.textContent = evidence.openConfidentError ? evidence.confidenceLabel
          : evidence.confidenceCount ? evidence.confidenceCount + " diagnostic confidence check" +
            (evidence.confidenceCount === 1 ? "" : "s") + " on this concept; no stable trait is inferred."
          : "No diagnostic confidence check for this concept yet.";
        body.appendChild(confidence);

        name.addEventListener("click", function () {
          var open = body.hidden;
          body.hidden = !open;
          name.setAttribute("aria-expanded", String(open));
        });

        row.appendChild(body);
        group.appendChild(row);
      });
      host.appendChild(group);
    });
  }

  function renderLessonIndex() {
    var host = $("lesson-index");
    var summary = $("lesson-coverage");
    if (!host || !summary) return;
    host.textContent = "";
    summary.textContent = "";

    var courseId = profile.selectedCourse;
    var course = getCourse(courseId);
    var label = $("lessons-course-label");
    if (label) label.textContent = (course ? course.shortTitle || course.id : courseId) + " · Teaching layer";

    var scheduled = scheduledLectureIds(courseId);
    // Every lecture this subject knows about: one with a lesson, one a run schedules, or both.
    // Add-ins are deliberately not their own row — they are read inside their host lesson, and
    // listing them twice would tell a learner there are more lessons here than there are.
    var lectureIds = unique(Object.keys(LESSONS)
      .filter(function (id) { return LESSONS[id].courseId === courseId && !LESSONS[id].addInOf; })
      .concat(Object.keys(scheduled).filter(function (id) { return id.indexOf(courseId) === 0 && !(LESSONS[id] && LESSONS[id].addInOf); })));

    if (!lectureIds.length) {
      summary.textContent = "No lessons have been authored for this subject yet.";
      return;
    }

    var counts = {live: 0, readonly: 0, missing: 0};
    lectureIds.forEach(function (id) { counts[lessonStatusFor(id, scheduled).key] += 1; });
    var scheduledLectures = Object.keys(scheduled).length;

    var coverage = coverageFor(courseId);
    [
      scheduledLectures + " lectures scheduled in practice" + (scheduledLectures !== counts.live ? " · " + counts.live + " lesson surfaces" : ""),
      counts.readonly ? counts.readonly + " readable here only" : null,
      counts.missing ? counts.missing + " still to write" : null,
      coverage ? coverage.percent + "% of the syllabus" : null
    ].filter(Boolean).forEach(function (text, index) {
      var chip = document.createElement("span");
      chip.className = "lesson-coverage-chip" + (index === 0 ? " primary" : "");
      chip.textContent = text;
      summary.appendChild(chip);
    });

    /* Say the size of the gap in words, under the chips.
     *
     * The chips describe the lessons that exist; this describes what they leave out.
     * Both belong here rather than only in a report, because the person revising from
     * this screen is the one who most needs to know that finishing it is not the same
     * as finishing the subject. */
    if (coverage) {
      var scope = document.createElement("p");
      scope.className = "lesson-coverage-scope";
      scope.textContent = coverageSentence(courseId);
      summary.appendChild(scope);
    }

    // Group by module, using the lesson's own module when we have one and the
    // lecture id when we do not.
    var modules = {};
    lectureIds.forEach(function (id) {
      var lesson = LESSONS[id];
      var match = /-M(\d+)-/.exec(id);
      var moduleNumber = lesson ? lesson.module : (match ? Number(match[1]) : 0);
      modules[moduleNumber] = modules[moduleNumber] || [];
      modules[moduleNumber].push(id);
    });

    Object.keys(modules).map(Number).sort(function (a, b) { return a - b; }).forEach(function (moduleNumber) {
      var group = document.createElement("section");
      group.className = "lesson-module";

      var heading = document.createElement("h4");
      heading.textContent = "Module " + moduleNumber;
      group.appendChild(heading);

      /* Per-module coverage, because the subject figure hides where the holes are.
       * SCLM is 32% overall, but modules 7 and 8 are near-empty while module 3 is
       * nearly complete — and a learner revising module 7 needs to know that the
       * absence is Dungeon's, not their own memory failing. */
      var moduleCoverage = coverageModuleFor(courseId, moduleNumber);
      if (moduleCoverage && moduleCoverage.ideas) {
        var note = document.createElement("p");
        var short = moduleCoverage.ideas - moduleCoverage.taught;
        note.className = "lesson-module-scope" + (moduleCoverage.taught === 0 ? " none" : short ? " partial" : "");
        note.textContent = moduleCoverage.taught === 0
          ? "None of the " + moduleCoverage.ideas + " ideas this module names are taught here yet — revise it from your own notes."
          : short
            ? "Teaches " + moduleCoverage.taught + " of the " + moduleCoverage.ideas + " ideas this module names."
            : "Teaches all " + moduleCoverage.ideas + " ideas this module names.";
        group.appendChild(note);
      }

      modules[moduleNumber]
        .sort(function (a, b) {
          var left = LESSONS[a], right = LESSONS[b];
          if (left && right) return left.order - right.order;
          return a < b ? -1 : 1;
        })
        .forEach(function (lectureId) {
          var data = LESSONS[lectureId];
          var status = lessonStatusFor(lectureId, scheduled);

          var row = document.createElement(data ? "details" : "div");
          row.className = "lesson-row " + status.key;
          // Lets the concept shelf open this exact lesson rather than reprinting it.
          row.setAttribute("data-lecture", lectureId);

          var head = document.createElement(data ? "summary" : "div");
          head.className = "lesson-row-head";

          var title = document.createElement("span");
          title.className = "lesson-row-title";
          title.textContent = data ? data.title : lectureId;
          head.appendChild(title);

          var pill = document.createElement("span");
          pill.className = "lesson-row-pill " + status.key;
          pill.textContent = status.label;
          head.appendChild(pill);

          var source = document.createElement("small");
          source.className = "lesson-row-source course-evidence-tag";
          source.textContent = courseEvidenceLabel(lectureId, courseId, moduleNumber);
          head.appendChild(source);

          row.appendChild(head);

          if (data) {
            var body = document.createElement("div");
            body.className = "lesson-row-body";
            appendLessonBody(body, data);
            row.appendChild(body);
          }

          group.appendChild(row);
        });

      host.appendChild(group);
    });
  }

  /* Opens a disclosure and brings its contents into view.
   *
   * The four staged tabs are gone, so nothing on this page is mutually exclusive
   * any more; sending a learner somewhere is now only ever "open this, then scroll
   * to it". LAW-42 applies — the scroll has to wait a frame so a screen swap's own
   * reset does not outlive it. */
  function revealDisclosure(id) {
    var host = $(id);
    if (!host) return null;
    if (host.tagName === "DETAILS") host.open = true;
    return host;
  }

  /* Quick Notes ---------------------------------------------------------------
   *
   * The note reader is a view over the authored teaching layer, not a parallel set
   * of summaries. That gives it all 283 registered entries, in lecture order, and
   * means a better explanation written for Learn becomes a better note immediately. */
  var notesState = {courseId:null, module:1, query:"", printing:null};

  function notesDownloadIconHtml() {
    return "<svg viewBox='0 0 20 20' aria-hidden='true' focusable='false'><path d='M10 2.75v9.5m0 0 3.5-3.5M10 12.25l-3.5-3.5M3.25 14.5v2.75h13.5V14.5'/></svg>";
  }

  function notesCourseId() {
    return notesState.courseId && getCourse(notesState.courseId)
      ? notesState.courseId
      : profile && getCourse(profile.selectedCourse) ? profile.selectedCourse : EXAM_ORDER[0];
  }

  function notesModuleTitle(course, module) {
    if (course.modules && course.modules[module - 1]) return course.modules[module - 1];
    var run = (course.runs || []).filter(function (entry) { return entry.module === module; })[0];
    return run ? run.title : "Module " + module;
  }

  function notesLessons(courseId, module) {
    return Object.keys(LESSONS).map(function (lectureId) { return LESSONS[lectureId]; })
      .filter(function (entry) { return entry.courseId === courseId && (!module || entry.module === module); })
      .sort(function (left, right) {
        return left.module - right.module || Number(left.order || 0) - Number(right.order || 0) ||
          String(left.lectureId).localeCompare(String(right.lectureId));
      });
  }

  function notesModuleCount(courseId) {
    return Math.max.apply(null, notesLessons(courseId).map(function (entry) { return entry.module; }).concat([1]));
  }

  function notesSearchText(entry) {
    var values = [entry.title, entry.objective, entry.connects, entry.brands].concat(entry.explainer || []);
    (entry.glossary || []).forEach(function (item) { values.push(item.term, item.plain); });
    if (entry.worked) values.push(entry.worked.setup, entry.worked.move, entry.worked.because);
    return values.join(" ").toLowerCase();
  }

  function notesStickyScrollOffset() {
    return [document.querySelector(".app-header"), document.querySelector(".notes-masthead")].reduce(function (offset, element) {
      if (!element) return offset;
      var style = window.getComputedStyle(element);
      if (style.position !== "sticky" && style.position !== "fixed") return offset;
      var top = parseFloat(style.top);
      if (!Number.isFinite(top)) top = 0;
      return Math.max(offset, top + element.getBoundingClientRect().height + 16);
    }, 16);
  }

  function scrollToNotesTarget(target) {
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - notesStickyScrollOffset();
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth"});
    var heading = target.querySelector("[data-notes-anchor-title]");
    if (heading && heading.focus) heading.focus({preventScroll:true});
    if (window.history && window.history.replaceState) window.history.replaceState(null, "", "#" + target.id);
  }

  function resetNotesScroll() {
    var reset = function () { window.scrollTo({top:0, behavior:"auto"}); };
    reset();
    /* Replacing a long module can make the browser preserve its old scroll anchor
       after the click handler returns. One frame later the new reader has its final
       height, so the second reset reliably exposes the module heading. */
    window.requestAnimationFrame(reset);
  }

  function notesLessonHtml(entry) {
    var explainer = Array.isArray(entry.explainer) ? entry.explainer : [entry.explainer];
    var termCount = (entry.glossary || []).length;
    var worked = entry.worked
      ? "<section class='notes-worked' aria-label='Worked example'><div class='notes-worked-head'><h4>Worked move</h4><span>Case → answer</span></div>" +
        "<p><b>Case.</b> " + escapeHtml(entry.worked.setup) + "</p>" +
        "<p><b>Answer.</b> " + escapeHtml(entry.worked.move) + "</p>" +
        "<details><summary>Why this answer works</summary><p>" + escapeHtml(entry.worked.because) + "</p></details></section>"
      : "";
    var glossary = (entry.glossary || []).length
      ? "<section class='notes-key-terms' id='terms-" + escapeHtml(entry.lectureId) + "' aria-labelledby='terms-title-" + escapeHtml(entry.lectureId) + "'><h4 id='terms-title-" + escapeHtml(entry.lectureId) + "' data-notes-anchor-title tabindex='-1'>Key terms</h4><dl class='notes-glossary'>" + (entry.glossary || []).map(function (item) {
        return "<dt>" + escapeHtml(item.term) + "</dt><dd>" + escapeHtml(item.plain) + "</dd>";
      }).join("") + "</dl></section>"
      : "";
    var connection = entry.connects
      ? "<aside class='notes-context notes-context--next'><b>Next connection</b><span>" + escapeHtml(entry.connects) + "</span></aside>"
      : entry.addInOf
        ? "<aside class='notes-context notes-context--next'><b>Folded into</b><span>" + escapeHtml(entry.addInHostTitle || entry.addInOf) + "</span></aside>"
        : "";
    var brands = entry.brands
      ? "<aside class='notes-context notes-context--course'><b>Course context</b><span>" + escapeHtml(entry.brands) + "</span></aside>"
      : "";
    var lessonTools = "<aside class='notes-lesson-tools' aria-label='Tools for " + escapeHtml(entry.title) + "'>" +
      "<section class='notes-tool-outcome'><b>After this layer</b><p>" + escapeHtml(entry.objective) + "</p></section>" +
      (termCount ? "<a class='notes-tool-link' href='#terms-" + escapeHtml(entry.lectureId) + "'><span><b>Key terms</b><small>" + termCount + " term" + (termCount === 1 ? "" : "s") + "</small></span><svg viewBox='0 0 20 20' aria-hidden='true'><path d='m7.5 4.5 5 5.5-5 5.5'/></svg></a>" : "") +
      "<button class='notes-tool-download' type='button' data-print-lecture='" + escapeHtml(entry.lectureId) + "'>" + notesDownloadIconHtml() + "<span>Download lecture</span></button></aside>";
    return "<section class='notes-lesson' id='notes-" + escapeHtml(entry.lectureId) + "'>" +
      "<header class='notes-lesson-head'><div class='notes-lesson-meta'><span>" + (entry.addInOf ? "Add-in" : "Lecture " + escapeHtml(entry.order)) +
      "</span><span>" + escapeHtml(entry.lectureId) + "</span></div><div class='notes-lesson-title-row'><h3>" + escapeHtml(entry.title) + "</h3>" +
      "<button class='notes-lecture-download' type='button' data-print-lecture='" + escapeHtml(entry.lectureId) + "' aria-label='Download " + escapeHtml(entry.title) + " as a PDF' title='Download this lecture as a PDF'>" + notesDownloadIconHtml() + "<span class='sr-only'>Download this lecture as a PDF</span></button></div></header>" +
      "<div class='notes-lesson-main'><div class='notes-prose'>" + explainer.filter(Boolean).map(function (paragraph) {
        return "<p>" + escapeHtml(paragraph) + "</p>";
      }).join("") + "</div>" + worked + notesMethodsHtml(entry) + glossary + brands + notesConceptAnchorHtml(entry) + connection + "</div>" + lessonTools + "</section>";
  }

  function notesConceptAnchorHtml(entry) {
    var concepts = getCourse(entry.courseId).concepts.filter(function (concept) { return concept.source === entry.lectureId; });
    if (!concepts.length) return "";
    return "<aside class='notes-lesson-anchor' aria-label='What to retain from " + escapeHtml(entry.title) + "'>" +
      "<div class='notes-anchor-head'><h4>Keep from this lecture</h4><span>" + concepts.length + " assessed idea" + (concepts.length === 1 ? "" : "s") + "</span></div>" +
      "<ul class='notes-lesson-concepts'>" + concepts.map(function (concept) {
        return "<li><b>" + escapeHtml(concept.name) + "</b><span>" + escapeHtml(concept.summary) + "</span></li>";
      }).join("") + "</ul></aside>";
  }

  function notesMethodsHtml(entry) {
    return (NUMERICAL_METHODS[entry.courseId] || []).filter(function (method) { return method.source === entry.lectureId; })
      .map(function (method) {
        return "<section class='notes-method'><p class='notes-section-label'>How to solve it</p><h4>" + escapeHtml(method.title) + "</h4><p>" + escapeHtml(method.theory) + "</p>" +
          "<div class='notes-method-grid'><div><h5>Question exoskeleton</h5><ol>" + method.steps.map(function (step) {
            return "<li>" + escapeHtml(step) + "</li>";
          }).join("") + "</ol></div><aside class='method-checks'><h5>Checks before you commit</h5>" + method.checks.map(function (check) {
            return "<p>" + escapeHtml(check) + "</p>";
          }).join("") + "<p><b>Pattern example.</b> " + escapeHtml(method.example) + "</p></aside></div></section>";
      }).join("");
  }

  function notesReleasedCaseHtml(courseId, module) {
    var released = window.T6_IBM_RELEASED_CASE;
    if (courseId !== "IBM" || module !== 1 || !released) return "";
    var caseAnswerOpen = notesState.printing ? " open" : "";
    return "<section class='notes-case-pack' aria-labelledby='notes-released-case'>" +
      "<header><p class='notes-section-label'>IBM · released caselet · 21 August</p><h3 id='notes-released-case' tabindex='-1'>Case-based answers</h3>" +
      "<p>These ten questions use the exact released brief. The worked model is one defensible implementation, not a fact supplied by the examiner: disclose its assumptions, keep it coherent, and apply the named course lens directly.</p></header>" +
      "<blockquote>“" + escapeHtml(released.prompt) + "”</blockquote>" +
      "<div class='notes-case-model'><div><small>Working model</small><h4>" + escapeHtml(released.model.name) + "</h4><p>" +
        escapeHtml(released.model.thesis) + "</p></div><div><small>Exam discipline</small><p>" + escapeHtml(released.interpretation) + "</p></div></div>" +
      "<div class='notes-case-columns'><div><h4>Assumptions you disclose</h4><ul>" + released.assumptions.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") + "</ul></div><div><h4>Model mechanics</h4><ul>" + released.model.operatingModel.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") + "</ul></div></div>" +
      "<h4>How to solve every answer</h4><ol class='notes-answer-shape'>" + released.answerShape.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") + "</ol>" +
      "<h4>Ten course lenses</h4>" +
      "<div class='notes-case-lenses'>" + released.lenses.map(function (lens) {
        return "<article><span>" + lens.number + "</span><div><b>" + escapeHtml(lens.title) + "</b><p>" + escapeHtml(lens.cue) + "</p></div></article>";
      }).join("") + "</div>" +
      "<div class='notes-case-answer-list'><div class='notes-case-answer-head'><div><p class='notes-section-label'>Question → course lens → model answer</p><h4>Work through all ten.</h4></div><p>Attempt the question first. Open the model answer to check the decision, case evidence, causal link, and closing condition.</p></div>" +
      released.questions.map(function (question, index) {
        var conceptNames = (question.conceptIds || []).map(function (conceptId) {
          var concept = getConcept("IBM", conceptId);
          return concept ? concept.name : conceptId;
        });
        return "<details class='notes-case-answer'" + caseAnswerOpen + "><summary><span>Question " + (index + 1) + " · Module " + question.module + "</span><b>" + escapeHtml(question.title) + "</b><small>Open question and model answer</small></summary>" +
          "<div class='notes-case-answer-body'><section><p class='notes-section-label'>Question</p><p class='notes-case-task'>" + escapeHtml(question.task) + "</p>" +
          "<div class='notes-case-concepts'>" + conceptNames.map(function (name) { return "<span>" + escapeHtml(name) + "</span>"; }).join("") + "</div></section>" +
          "<section><p class='notes-section-label'>Model answer</p><p>" + escapeHtml(question.exemplar) + "</p></section></div></details>";
      }).join("") + "</div>" +
      "<button class='button primary compact notes-case-action' type='button' data-open-released-case='IBM'>Sit the 10-question released case</button>" +
      "</section>";
  }

  function notesReleasedCaseJumpHtml(courseId, module) {
    if (courseId !== "IBM" || module !== 1 || !window.T6_IBM_RELEASED_CASE) return "";
    return "<aside class='notes-case-jump' aria-label='IBM released case-based answers'><div><p class='notes-section-label'>Released IBM caselet</p>" +
      "<h3>Case-based answers</h3><p>Ten exact-brief questions, one coherent working model, and a model answer for every course lens.</p></div>" +
      "<div><a class='button secondary' href='#notes-released-case'>Read the answer pack</a>" +
      "<button class='button primary' type='button' data-open-released-case='IBM'>Practice all 10</button></div></aside>";
  }

  /* A chamber samples the module; it is not a smaller version of the old Learn run.
   * IBM and BRGSA finish with a bounded case response. SCLM uses the paper format
   * that belongs here — a numerical where one exists, otherwise matching. SPMS
   * finishes with an exact two-answer P-type item. Repeating rotates the sample, so
   * four questions do not quietly become a claim of complete concept coverage. */
  function moduleChamberState(courseId, module) {
    var root = profile.moduleChambers || (profile.moduleChambers = {});
    var key = courseId + "-M" + module;
    return root[key] || (root[key] = {attempts:0, best:null, last:null, at:null, missedConceptIds:[]});
  }

  function chamberQuestions(courseId, module) {
    var course = getCourse(courseId);
    return Object.keys(course.questions).map(function (id) { return getQuestion(courseId, id); })
      .filter(function (question) { return question && question.module === module && !question.examOnly && !question.releasedCase; });
  }

  function chamberPick(pool, rotation, usedConceptIds) {
    var ordered = pool.slice().sort(function (left, right) {
      return stableQuestionOrder(left.id) - stableQuestionOrder(right.id) || left.id.localeCompare(right.id);
    });
    if (!ordered.length) return null;
    var shifted = ordered.slice(rotation % ordered.length).concat(ordered.slice(0, rotation % ordered.length));
    return shifted.filter(function (question) { return usedConceptIds.indexOf(question.conceptId) < 0; })[0] || shifted[0];
  }

  function moduleChamberQuestionIds(courseId, module, rotation) {
    var pool = chamberQuestions(courseId, module);
    var used = [], chosen = [];
    function take(filter, offset) {
      var question = chamberPick(pool.filter(filter), rotation + offset, used);
      if (!question || chosen.some(function (row) { return row.id === question.id; })) return;
      chosen.push(question);
      used.push(question.conceptId);
    }
    take(function (question) { return (question.type || "mcq") === "mcq" && question.perspective === "explain"; }, 0);
    take(function (question) { return (question.type || "mcq") === "mcq" && question.perspective === "apply"; }, 1);
    take(function (question) {
      return (question.type || "mcq") === "mcq" && question.perspective === (courseId === "BRGSA" ? "apply" : "connect");
    }, 2);
    if (chosen.length < 3) take(function (question) { return (question.type || "mcq") === "mcq"; }, 4);
    if (courseId === "IBM" || courseId === "BRGSA") {
      take(function (question) { return question.type === "short-answer" && question.pattern === "Case-based written response"; }, 3);
    } else if (courseId === "SCLM") {
      var numerical = pool.some(function (question) { return question.type === "numeric"; });
      take(function (question) { return question.type === (numerical ? "numeric" : "match"); }, 3);
    } else {
      take(function (question) { return question.type === "msq"; }, 3);
    }
    return chosen.map(function (question) { return question.id; });
  }

  function notesChamberHtml(courseId, module) {
    var state = moduleChamberState(courseId, module);
    var concepts = getCourse(courseId).concepts.filter(function (concept) { return concept.module === module; });
    var lastMisses = (state.missedConceptIds || []).filter(function (conceptId) {
      return concepts.some(function (concept) { return concept.id === conceptId; });
    });
    var openMisses = concepts.filter(function (concept) { return conceptStatus(courseId, concept.id) === "needs"; })
      .map(function (concept) { return concept.id; });
    var repairIds = unique(lastMisses.concat(openMisses)).slice(0, 4);
    var formats = {
      IBM: ["Definition", "Choose the decision", "Connect the idea", "One case paragraph"],
      SCLM: ["Definition", "Choose the decision", "Connect the idea", chamberQuestions(courseId, module).some(function (question) { return question.type === "numeric"; }) ? "One numerical" : "One matching set"],
      SPMS: ["Definition", "Choose the decision", "Connect the idea", "One P-type · select two"],
      BRGSA: ["Direct recall", "Choose the decision", "Interpret a result", "One case recommendation"]
    };
    var format = formats[courseId] || formats.SPMS;
    return "<section class='notes-chamber' aria-labelledby='notes-chamber-" + courseId + "-" + module + "'><div class='notes-chamber-head'><div>" +
      "<p class='notes-section-label'>End of module " + module + " · four-question chamber</p><h3 id='notes-chamber-" + courseId + "-" + module + "'>Test what stayed with you.</h3>" +
      "<p>Direct recall and application first. A miss becomes a named repair; a clean answer does not create more work.</p></div>" +
      "<button class='button primary' type='button' data-start-chamber='" + courseId + "' data-chamber-module='" + module + "'>" + (state.attempts ? "Retest module " + module : "Enter chamber") + "</button></div>" +
      "<ul class='notes-chamber-shape'>" + format.map(function (label, index) { return "<li><b>Q" + (index + 1) + "</b>" + escapeHtml(label) + "</li>"; }).join("") + "</ul>" +
      (repairIds.length ? "<div class='notes-repairs'><p><b>Targeted repair.</b> These ideas currently need another look:</p><div class='notes-repair-list'>" + repairIds.map(function (conceptId) {
        var concept = getConcept(courseId, conceptId);
        return "<button type='button' data-repair-concept='" + escapeHtml(conceptId) + "'>Repair " + escapeHtml(concept ? concept.name : conceptId) + "</button>";
      }).join("") + "</div></div>" : "") + "</section>";
  }

  function notesModuleHtml(courseId, module, includeNavigation) {
    var course = getCourse(courseId);
    var lessons = notesLessons(courseId, module);
    var moduleCount = notesModuleCount(courseId);
    var title = notesModuleTitle(course, module);
    var first = lessons[0], last = lessons[lessons.length - 1];
    var intro = lessons.length
      ? "Read " + lessons.length + " course entr" + (lessons.length === 1 ? "y" : "ies") + " in order, from " + first.title + " to " + last.title + "."
      : "This module has no registered teaching entries.";
    var navigation = includeNavigation
      ? "<nav class='notes-chapter-nav' aria-label='Move between modules'>" +
        (module > 1 ? "<button type='button' data-notes-module='" + (module - 1) + "'>← Module " + (module - 1) + "</button>" : "<span></span>") +
        (module < moduleCount ? "<button type='button' data-notes-module='" + (module + 1) + "'>Module " + (module + 1) + " →</button>" : "<span></span>") +
        "</nav>"
      : "";
    var downloadFooter = includeNavigation
      ? "<section class='notes-download-footer' aria-label='Offline module copy'><div><p class='notes-section-label'>Offline copy</p><h3>Take this module with you.</h3><p>The PDF keeps every lecture in teaching order.</p></div><button class='button secondary' type='button' data-print-module>Download module PDF</button></section>"
      : "";
    var chamber = notesChamberHtml(courseId, module);
    var ending = includeNavigation
      ? "<footer class='notes-module-end'>" + chamber + "<div class='notes-end-row'>" + downloadFooter + navigation + "</div></footer>"
      : chamber;
    return "<section class='notes-print-module'><header class='notes-chapter-head'><p class='notes-module-meta'>" + escapeHtml(course.shortTitle) +
      " · Module " + module + " of " + moduleCount + "</p><h2>" + escapeHtml(title) + "</h2><p>" + escapeHtml(intro) + "</p></header>" +
      notesReleasedCaseJumpHtml(courseId, module) + lessons.map(notesLessonHtml).join("") + notesReleasedCaseHtml(courseId, module) + ending + "</section>";
  }

  function notesLecturePrintHtml(courseId, module, lectureId) {
    var course = getCourse(courseId);
    var entry = notesLessons(courseId, module).filter(function (lesson) { return lesson.lectureId === lectureId; })[0];
    if (!entry) return "";
    return "<section class='notes-print-module notes-print-lecture'><header class='notes-print-context'><p class='notes-module-meta'>" + escapeHtml(course.shortTitle) +
      " · Module " + module + " · " + (entry.addInOf ? "Add-in" : "Lecture " + escapeHtml(entry.order)) + "</p><h2>" + escapeHtml(notesModuleTitle(course, module)) +
      "</h2></header>" + notesLessonHtml(entry) + "</section>";
  }

  function renderNotesSearch(courseId, query) {
    var course = getCourse(courseId);
    var matches = notesLessons(courseId).filter(function (entry) { return notesSearchText(entry).indexOf(query) >= 0; });
    $("notes-reader").innerHTML = "<header class='notes-search-head'><p class='notes-module-meta'>" + escapeHtml(course.shortTitle) +
      " search</p><h2>" + matches.length + " result" + (matches.length === 1 ? "" : "s") + "</h2><p>Matches search the complete explanations, worked moves, and glossary in this subject.</p></header>" +
      "<div class='notes-search-results'>" + matches.map(function (entry) {
        return "<button class='notes-search-result' type='button' data-notes-result='" + escapeHtml(entry.lectureId) + "' data-notes-result-module='" + entry.module + "'>" +
          "<span>Module " + entry.module + " · " + escapeHtml(notesModuleTitle(course, entry.module)) + "</span><span><b>" + escapeHtml(entry.title) +
          "</b><small>" + escapeHtml(entry.objective) + "</small></span></button>";
      }).join("") + "</div>";
  }

  function renderNotesNavigation() {
    var courseId = notesCourseId();
    var course = getCourse(courseId);
    var moduleCount = notesModuleCount(courseId);
    $("notes-course-code").textContent = course.shortTitle;
    $("notes-toc-label").textContent = "Contents";
    $("notes-course-title").textContent = course.title;
    $("notes-course-description").textContent = course.description || "Theory, examples, and methods in the sequence the course teaches them.";

    $("notes-subjects").innerHTML = ["IBM", "SCLM", "SPMS", "BRGSA"].map(function (id, index) {
      var selectedCourse = id === courseId;
      return "<button class='notes-subject-tab " + (index < 2 ? "is-priority" : "is-secondary") + "' type='button' role='tab' data-notes-course='" + id + "' aria-selected='" + selectedCourse + "'>" +
        escapeHtml(getCourse(id).shortTitle) + "</button>";
    }).join("");

    var moduleButtons = [];
    for (var module = 1; module <= moduleCount; module += 1) {
      moduleButtons.push("<button type='button' data-notes-module='" + module + "' aria-current='" + (module === notesState.module) + "'>" +
        "<span>" + module + "</span>" + escapeHtml(notesModuleTitle(course, module)) + "</button>");
    }
    $("notes-module-nav").innerHTML = moduleButtons.join("");
  }

  function renderNotesReader() {
    var courseId = notesCourseId();
    var host = $("notes-reader");
    if (notesState.printing) {
      host.innerHTML = notesState.printing.type === "lecture"
        ? notesLecturePrintHtml(courseId, notesState.module, notesState.printing.lectureId)
        : notesModuleHtml(courseId, notesState.module, false);
      return;
    }
    var query = String(notesState.query || "").trim().toLowerCase();
    if (query) renderNotesSearch(courseId, query);
    else host.innerHTML = notesModuleHtml(courseId, notesState.module, true);
  }

  function renderNotes() {
    notesState.courseId = notesCourseId();
    var count = notesModuleCount(notesState.courseId);
    notesState.module = Math.max(1, Math.min(count, Number(notesState.module) || 1));
    renderNotesNavigation();
    renderNotesReader();
  }

  function openNotes(options) {
    options = options || {};
    if (options.courseId && getCourse(options.courseId)) {
      notesState.courseId = options.courseId;
      profile.selectedCourse = options.courseId;
    }
    if (options.module) notesState.module = Number(options.module) || 1;
    requestLeaveLivePaper(function () {
      crossProducts("learn", function () {
        renderNotes();
        showScreen("notes-screen");
        $("notes-reader").focus({preventScroll:true});
        if (options.anchor) window.setTimeout(function () {
          scrollToNotesTarget($(options.anchor));
        }, 0);
        else resetNotesScroll();
      });
    });
  }

  function startModuleChamber(courseId, module, rotation) {
    module = Math.max(1, Math.min(notesModuleCount(courseId), Number(module) || 1));
    if (profile.active && profile.active.kind === "module-chamber" && profile.active.courseId === courseId && profile.active.studyModule === module && rotation == null) return resumeActive();
    var state = moduleChamberState(courseId, module);
    rotation = rotation == null ? state.attempts : Math.max(0, Number(rotation) || 0);
    var questionIds = moduleChamberQuestionIds(courseId, module, rotation);
    if (questionIds.length !== 4) return toast("This module chamber is missing one of its four direct checks.");
    profile.selectedCourse = courseId;
    notesState.courseId = courseId;
    notesState.module = module;
    session = createSession(courseId, {
      kind:"module-chamber",
      mode:"learning",
      studyModule:module,
      chamberRotation:rotation,
      title:"Module " + module + " chamber",
      kicker:(courseId === "IBM" || courseId === "BRGSA")
        ? "Direct recall + framework application · one short response · no hidden reattempts"
        : "Direct recall + paper-format check · immediate correction · no hidden reattempts",
      skipLessons:true,
      skipPrimers:true
    }, questionIds);
    session.queue.forEach(function (item) { item.askConfidence = false; });
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function printNotes(target) {
    var courseId = notesCourseId();
    var lectureId = target && target.lectureId;
    var entry = lectureId ? notesLessons(courseId, notesState.module).filter(function (lesson) { return lesson.lectureId === lectureId; })[0] : null;
    if (lectureId && !entry) return toast("That lecture could not be prepared for download.");
    var previousTitle = document.title;
    notesState.printing = lectureId ? {type:"lecture", lectureId:lectureId} : {type:"module"};
    document.body.classList.add("printing-notes");
    document.body.classList.toggle("printing-lecture", !!lectureId);
    document.title = lectureId
      ? getCourse(courseId).shortTitle + " — " + entry.title
      : getCourse(courseId).shortTitle + " — Module " + notesState.module + " — " + notesModuleTitle(getCourse(courseId), notesState.module);
    renderNotesReader();
    function restoreNotesAfterPrint() {
      notesState.printing = null;
      document.body.classList.remove("printing-notes");
      document.body.classList.remove("printing-lecture");
      document.title = previousTitle;
      renderNotesReader();
    }
    window.addEventListener("afterprint", restoreNotesAfterPrint, {once:true});
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { window.print(); });
    });
  }

  function printNotesModule() {
    printNotes({type:"module"});
  }

  function printNotesLecture(lectureId) {
    printNotes({type:"lecture", lectureId:lectureId});
  }

  /* The header's subject control, kept in step with the rail rather than competing
     with it: both read and write the same `profile.selectedCourse`, and this one is
     rebuilt from the same ordering, so whichever you use the other agrees. */
  function renderHeaderSubject() {
    var select = $("header-subject");
    if (!select) return;
    var order = orderedCourseIds("exam");
    /* The code alone. The strong-count belongs to the rail, which shows all four at
       once and can be compared; repeating it here bought a number you cannot compare
       against anything and cost the width that keeps this control on a 320px phone. */
    select.innerHTML = order.map(function (courseId) {
      return "<option value='" + escapeHtml(courseId) + "'" +
        (profile.selectedCourse === courseId ? " selected" : "") + ">" +
        escapeHtml(getCourse(courseId).shortTitle) + "</option>";
    }).join("");
  }

  /* The four large cards are the front door. Once the learner chooses one they fold
   * into a persistent subject rail, freeing the page for the selected subject while
   * keeping all four switches visible. This is deliberately session-only: a fresh
   * homepage load always begins with the full cards and their timetable context. */
  var subjectRailFolded = false;
  var subjectRailAnimating = false;

  function commitSubjectSelection(courseId, animateIn) {
    profile.selectedCourse = courseId;
    subjectRailFolded = true;
    saveProfile();
    renderDashboard();
    if (!animateIn || !window.gsap || prefersReducedMotion()) return;
    window.requestAnimationFrame(function () {
      var cards = $all("#course-grid .course-card");
      window.gsap.fromTo(cards,
        {y: 12, scale: .96, autoAlpha: .35},
        {y: 0, scale: 1, autoAlpha: 1, duration: .34, stagger: .045, ease: "power2.out", clearProps: "transform,opacity,visibility"});
      var selected = document.querySelector("#course-grid .course-card.selected");
      if (selected) window.gsap.fromTo(selected, {scale: .96}, {scale: 1, duration: .42, ease: "back.out(1.8)", clearProps: "transform"});
    });
  }

  function selectSubjectFromCard(courseId) {
    if (subjectRailAnimating) return;
    if (subjectRailFolded || !window.gsap || prefersReducedMotion()) {
      commitSubjectSelection(courseId, subjectRailFolded);
      return;
    }
    var cards = $all("#course-grid .course-card");
    subjectRailAnimating = true;
    window.gsap.timeline({
      defaults: {ease: "power2.in"},
      onComplete: function () {
        subjectRailAnimating = false;
        commitSubjectSelection(courseId, true);
      }
    }).to(cards, {y: -12, scale: .92, autoAlpha: 0, duration: .24, stagger: .035});
  }

  function renderCourseCards() {
    renderHeaderSubject();
    var grid = $("course-grid");
    var rail = document.querySelector(".subject-rail");
    grid.classList.toggle("is-folded", subjectRailFolded);
    if (rail) rail.classList.toggle("is-folded", subjectRailFolded);
    var subjectTitle = $("subjects-title");
    if (subjectTitle) subjectTitle.textContent = subjectRailFolded ? "Current subject · switch anytime" : "Choose your subject";
    grid.innerHTML = "";
    /* Exam order is the one stable order now. A sort control asked the learner to
       manage the dashboard before revising; the path inside each subject already
       decides what comes next. */
    var mode = "exam";
    var order = orderedCourseIds(mode);
    var previousDay = null;
    order.forEach(function (courseId) {
      var course = getCourse(courseId);
      var path = courseRunPath(courseId);
      var exam = EXAM_SCHEDULE[courseId] || {};
      var button = document.createElement("button");
      button.type = "button";
      button.className = "course-card" + (profile.selectedCourse === courseId ? " selected" : "");
      /* In exam order the cards read as a timetable, so mark where the day turns
       * over. In any other order that boundary is meaningless and would mislead. */
      if (mode === "exam" && exam.day && exam.day !== previousDay) button.classList.add("day-start");
      previousDay = exam.day;
      button.setAttribute("aria-pressed", String(profile.selectedCourse === courseId));
      if (profile.selectedCourse === courseId) button.setAttribute("aria-current", "true");
      /* The visible card compresses the timetable to "Aug 22 · 09:00" and puts the
       * rest on a tooltip, which is mouse-only — so the button's own label carries
       * the full sitting details for anyone reading by keyboard or screen reader.
       * (This previously prefixed "Sat " onto a day that already began "Sat".) */
      var pathAction = profile.active && profile.active.courseId === courseId
        ? "Continue saved run"
        : path.current
          ? (path.cleared.length ? "Continue with run " : "Start run ") + path.current.step + " of " + path.steps
          : "Learning path cleared";
      button.setAttribute("aria-label", course.shortTitle + ", " + course.title + ". " +
        (exam.full ? exam.full + ", " + exam.start + " to " + exam.end + ", " + exam.marks + " marks" +
          (exam.negative ? ", negative marking in Section B" : "") + ". " : "") +
        path.cleared.length + " of " + path.steps + " runs cleared. " + pathAction + ".");
      /* The card carries four facts and nothing else: which subject, when it is
       * sat, how far along you are, and whether it punishes a wrong answer.
       *
       * The acronym leads because it is what a learner calls the subject; the
       * full name sits under it in lighter weight, so a clipped title reads as
       * secondary detail rather than as a sentence cut off mid-word. Date and
       * time collapse to one meta line, with the full slot on hover and focus —
       * two lines of timetable per card was more than the rail needed to say.
       *
       * Progress is a single pill whose fill *is* the bar, so the count, the
       * remaining work, and the visual are one element instead of three. */
      var slot = exam.full ? exam.full + ", " + exam.start + "–" + exam.end + ", " + exam.marks + " marks" : "";
      var pillCopy = path.cleared.length + "/" + path.steps + " runs cleared";
      if (subjectRailFolded) {
        button.setAttribute("data-tip", course.shortTitle + " · " + course.title +
          (slot ? " · " + slot : "") + " · " + pillCopy + " · " + pathAction);
      }
      button.innerHTML =
        "<span class='course-head'>" +
          "<b class='course-code'>" + escapeHtml(course.shortTitle) + "</b>" +
          "<span class='course-current'>Current</span>" +
          (exam.negative ? "<em class='course-flag' data-tip='Negative marking in Section B: −1 per wrong answer'>−1</em>" : "") +
          (exam.short ? "<span class='course-meta' data-tip='" + escapeHtml(slot) + "'>" + escapeHtml(exam.short) + " · " + escapeHtml(exam.start) + "</span>" : "") +
        "</span>" +
        "<span class='course-name'>" + escapeHtml(course.title) + "</span>" +
        "<span class='course-pill'><i class='pill-fill' aria-hidden='true' style='width:" +
          Math.round(path.cleared.length / Math.max(1, path.steps) * 100) + "%'></i>" +
          "<span class='pill-label'>" + escapeHtml(pillCopy) + "</span></span>" +
        "<span class='course-action'>" + escapeHtml(pathAction) + " <i aria-hidden='true'>→</i></span>";
      button.addEventListener("click", function () {
        selectSubjectFromCard(courseId);
      });
      grid.appendChild(button);
    });
  }

  /* The subject row's edge fade.
   *
   * The fade is drawn only on the side that actually has more to reach, and disappears at
   * each end — an affordance that stays on when there is nothing left to scroll to is
   * just decoration that lies.
   *
   * As of 2026-08-18 that is every width: the phone layout was a swipe row hiding 54% of
   * itself (two of four subjects off-screen) and is now a two-by-two grid, so there is no
   * slack anywhere and this writes "none" every time. Kept rather than deleted because it
   * is self-correcting — if the rail ever returns, or a fifth subject arrives, the cue
   * comes back on its own without anyone remembering to re-add it. */
  function updateRailScrollCue() {
    var scroller = $("course-grid");
    var wrap = $("rail-scroll");
    if (!scroller || !wrap) return;
    // clientWidth and scrollWidth are equal when the row is not scrollable at all,
    // which is every desktop width — so this reports "none" and paints nothing.
    var slack = scroller.scrollWidth - scroller.clientWidth;
    if (slack <= 1) return wrap.setAttribute("data-scroll", "none");
    var atStart = scroller.scrollLeft <= 1;
    var atEnd = scroller.scrollLeft >= slack - 1;
    wrap.setAttribute("data-scroll", atStart ? "start" : atEnd ? "end" : "middle");
  }

  /* The recommended action, re-offered after it scrolls away.
   *
   * The dashboard runs to roughly 6,700px on a phone, so a learner who reaches the
   * concept list has to scroll the whole way back to act on the recommendation. This
   * is deliberately not a second recommendation: the copy is read from the hero and
   * the click is delegated to it, so there is exactly one place that decides what the
   * next step is (LAW-04, LAW-18 — the scope is named). */
  function bindFloatingOffer(barId, heroId, goId, fill, observeId) {
    var bar = $(barId);
    var hero = $(heroId);
    var observed = observeId ? $(observeId) : hero;
    if (!bar || !hero || !observed || !window.IntersectionObserver) return;
    $(goId).addEventListener("click", function () { hero.click(); });
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // A hidden source has no usable geometry, and a source still below the
        // viewport has not been read. Re-offer it only once at least three
        // quarters have passed above the sticky header.
        var away = entry.boundingClientRect.height > 0
          && entry.boundingClientRect.top <= 72
          && entry.intersectionRatio < 0.25;
        /* The Speedrun recommendation lives inside one Examiner tab. A hidden tab
           is technically outside the viewport, but that must not resurrect its
           floating action over Minis or Full mocks. */
        if (barId === "exam-resume-bar" && (examHomeMode !== "exam" || examTimeMode !== "speedrun")) away = false;
        bar.hidden = !away;
        document.body.classList.toggle("has-resume-bar", away);
        if (away) fill(hero);
      });
    }, {threshold: [0, 0.25]}).observe(observed);
  }

  function bindResumeBar() {
    bindFloatingOffer("resume-bar", "start-recommended", "resume-bar-go", function (hero) {
      $("resume-bar-scope").textContent = $("selected-course-code").textContent;
      /* The button's label, not the hero heading. The heading is a sentence
       * ("Practise the concepts that need work first") and truncated to an
       * ellipsis in this width; the button already says the same thing as an
       * action in four words, and it is the thing this bar clicks. */
      $("resume-bar-title").textContent = hero.textContent.replace(/\s*→\s*$/, "").trim();
    }, "learn-focus");
    /* The examiner's own. The visible hero recommends a coached Speedrun, so the
       floating copy must name that round rather than silently borrowing the separate
       full-paper recommendation. */
    bindFloatingOffer("exam-resume-bar", "exam-pick-start", "exam-resume-go", function (hero) {
      var pick = recommendedMiniMock();
      $("exam-resume-scope").textContent = pick ? pick.courseId + " · Speedrun" : "Speedrun";
      $("exam-resume-title").textContent = hero.textContent.replace(/\s*→\s*$/, "").trim();
    }, "exam-pick");
  }

  // A route's label and its one-line description are set together, so the two can
  // never disagree about what the button will do (LAW-04).
  function setRouteCopy(id, label, note) {
    var route = $(id);
    if (!route) return;
    route.querySelector("b").textContent = label;
    route.querySelector("small").textContent = note;
  }

  function renderSelectedSubject() {
    var courseId = profile.selectedCourse;
    var course = getCourse(courseId);
    var stats = courseStats(courseId);
    var path = courseRunPath(courseId);
    $("selected-course-code").textContent = course.shortTitle;
    // Not the title: the selected card, the hero eyebrow, and the goal column all
    // already name this subject. Only the description is new information here.
    $("subject-description").textContent = course.description;
    $("run-progress-value").textContent = path.cleared.length + " of " + path.steps + " runs cleared";
    $("run-progress-fill").style.width = Math.round(path.cleared.length / Math.max(1, path.steps) * 100) + "%";
    $("run-progress-note").textContent = path.current
      ? "Run " + path.current.step + " is open. Future runs unlock one at a time; cleared runs become replayable."
      : "The fixed path is clear. Replay any run or use a focused practice option.";
    setRouteCopy("practice-priority",
      stats.needs ? "Practise " + stats.needs + " concept" + (stats.needs === 1 ? "" : "s") + " that need" + (stats.needs === 1 ? "s" : "") + " work"
        : stats.developing ? "Build stronger evidence"
        : stats.unseen ? "Start the next new concepts" : "Refresh strong concepts",
      subjectProgressCopy(stats));
    renderSetList(courseId);
  }

  function subjectProgressCopy(stats) {
    if (stats.strong === stats.total) return "Every core concept has broad current evidence. Use a generic practice check and later retrieval to keep it fresh.";
    if (stats.needs) return stats.needs === 1
      ? "1 needs practice; it appears first when you practise this subject."
      : stats.needs + " need practice; these appear first when you practise this subject.";
    if (stats.developing) return stats.developing === 1
      ? "1 is developing; open it to see exactly which evidence is still missing."
      : stats.developing + " are developing; open one to see exactly which evidence is still missing.";
    return "Start the open run, or inspect a concept if you need the detail first.";
  }

  function courseTrend(courseId) {
    return trendFromCourses([courseId]);
  }

  function renderTrend(courseId) {
    var points = courseTrend(courseId);
    var current = courseStats(courseId).weighted;
    $("trend-current").textContent = current + "%";
    var chart = $("progress-trend");
    var chartPoints = points.map(function (point, index) { return {block:index + 1, value:point.value}; });
    var label = getCourse(courseId).shortTitle + " evidence by practice block. Current evidence " + current + " percent.";
    chart.setAttribute("aria-label", label);
    if (window.DungeonCharts && window.DungeonCharts.renderTrend) {
      window.DungeonCharts.renderTrend(chart, {points:chartPoints, label:label, reducedMotion:prefersReducedMotion()});
    } else {
      chart.textContent = chartPoints.length
        ? chartPoints.map(function (point) { return "Block " + point.block + ": " + point.value + "%"; }).join(" · ")
        : "Your first practice block will start the chart";
    }
    if (!points.length) {
      $("trend-description").textContent = "No practice block is recorded yet. The line will reflect demonstrated evidence, not raw effort.";
      return;
    }
    var direction = points.length > 1 && points[points.length - 1].value < points[points.length - 2].value ? "The latest block revealed a dip, so the recommendation will revisit the affected concept." : "Correct evidence moves the line; misses can create an honest plateau or dip.";
    $("trend-description").textContent = points.length + " practice block" + (points.length === 1 ? "" : "s") + " shown. " + direction;
  }

  /* renderConceptMap() and showConceptInspector() were deleted here.
   *
   * They drew a second copy of the same concept list — eight at a time behind a
   * module stepper — and an inspector panel that was the only place the missing
   * evidence appeared. renderConceptShelf() now carries both on the row itself. */

  /* What a set actually delivers.
   *
   * `questionIds` is a four-item seed list left over from before the sets drew from
   * module pools; `questionCount` is what `questionIdsForSet` really selects. Both
   * were being read — the set card used the second and the homepage recommendation
   * used the first — so the same set was advertised as 4 questions in one place and
   * 8 in another, on the same screen. */
  function setQuestionCount(definition) {
    return definition.questionCount || (definition.questionIds || []).length;
  }

  /* The ordinary Learn path is a sequence, not a catalogue. The nine authored
   * non-builder runs are fixed; a completion record clears a run, the first uncleared
   * run is the only new one available, and completed runs are the only replay choices.
   * Evidence still adapts inside a run, but it no longer decides which door appears. */
  function courseRunPath(courseId) {
    var records = (profile.completed && profile.completed[courseId]) || {};
    var sequence = getCourse(courseId).runs.filter(function (definition) { return !definition.mock; })
      .map(function (definition, index) {
        var record = records[String(definition.id)] || null;
        return {definition:definition, step:index + 1, record:record, complete:Boolean(record)};
      });
    return {
      sequence: sequence,
      cleared: sequence.filter(function (run) { return run.complete; }),
      current: sequence.filter(function (run) { return !run.complete; })[0] || null,
      steps: sequence.length
    };
  }

  /* The eight course steps own the complete teaching sequence for their module.
   * Add-ins are not separate cards: their prose is rendered inside the host lesson,
   * so scheduling both would make the learner read the same material twice. */
  function moduleLessonIdsForStudySet(courseId, definition) {
    if (!definition || !(definition.module >= 1 && definition.module <= 8)) return [];
    return Object.keys(LESSONS).filter(function (lectureId) {
      var lesson = LESSONS[lectureId];
      return lesson.courseId === courseId && lesson.module === definition.module && !lesson.addInOf;
    }).sort(function (a, b) { return lectureTeachingRank(a) - lectureTeachingRank(b); });
  }

  function textWordCount(value) {
    return String(value || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function lessonReadingMinutes(data) {
    if (!data) return 0;
    var parts = [data.objective].concat(data.explainer || [], data.connects || "");
    if (data.worked) parts = parts.concat([data.worked.setup, data.worked.move, data.worked.because]);
    (data.glossary || []).forEach(function (entry) { parts.push(entry.term, entry.plain); });
    (data.addIns || []).forEach(function (addIn) {
      parts.push(addIn.objective);
      parts = parts.concat(addIn.explainer || []);
      (addIn.glossary || []).forEach(function (entry) { parts.push(entry.term, entry.plain); });
    });
    return Math.max(1, Math.ceil(textWordCount(parts.join(" ")) / 180));
  }

  function studySetEstimate(courseId, definition) {
    var lessonIds = moduleLessonIdsForStudySet(courseId, definition).filter(function (lectureId) {
      return !lessonIsRead(lectureId);
    });
    var ids = definition.mock ? [] : questionIdsForSet(courseId, definition);
    var minutes = ids.reduce(function (sum, id) {
      var question = getQuestion(courseId, id);
      return sum + (question ? expectedResponseMinutes(question) : 0);
    }, 0);
    minutes += lessonIds.reduce(function (sum, lectureId) {
      return sum + lessonReadingMinutes(lessonFor(lectureId));
    }, 0);
    /* Primers and transitions are short but real. One minute per newly introduced
       concept keeps the estimate honest without pretending to predict reading speed. */
    minutes += unique(ids.map(function (id) {
      var question = getQuestion(courseId, id);
      return question && primerSupportLevel(courseId, question.conceptId) > 0 ? question.conceptId : null;
    }).filter(Boolean)).length;
    return {
      minutes: Math.max(3, Math.ceil(minutes / 5) * 5),
      lessons: lessonIds.length
    };
  }

  function conceptIsTaught(courseId, conceptId) {
    var concept = getConcept(courseId, conceptId);
    return Boolean(concept && lessonFor(concept.source) && lessonIsRead(concept.source));
  }

  /* The course's own ladder, which the bank has always had and the product never
   * showed.
   *
   * Sets 1–8 are modules 1–8, two concepts each, and they are a sequence rather than
   * a menu. Measured across all four subjects (tools/measure-learn-exam-coverage.js),
   * walking them in order carries a learner from about a tenth of their paper's marks
   * to all of them: SPMS 10.7% → 100%, BRGSA 8.8% → 100%, SCLM 9.7% → 100%, IBM 10%
   * → 100%. Sets 9 and 10 sit outside the ladder deliberately — 9 tests connections
   * between concepts already met and 10 is the builder — so neither introduces
   * anything and neither is a step.
   *
   * What a learner saw instead was ten identical cards under "Ten study sets are
   * available" and "You do not have to complete all ten": no position, no statement
   * of what each set adds or rests on, and nothing separating the eight that build
   * the subject from the two that revisit it. Someone who finished set 1 had been
   * taught two concepts of sixteen and the product gave them no way to know it.
   *
   * `taught` here is the lesson having been read, not the questions having gone well.
   * Those are different claims and this is deliberately the weaker: it says what has
   * been put in front of the learner. What they can do with it is `conceptStatus`,
   * which the evidence panels already report and which this never folds in. */
  function courseLadder(courseId) {
    var course = getCourse(courseId);
    var rungs = [];
    var carried = [];
    course.runs.forEach(function (definition) {
      if (!(definition.module >= 1 && definition.module <= 8)) return;
      var concepts = course.concepts.filter(function (concept) { return concept.module === definition.module; });
      var taught = concepts.filter(function (concept) { return conceptIsTaught(courseId, concept.id); });
      rungs.push({
        definition: definition,
        step: rungs.length + 1,
        concepts: concepts,
        taughtCount: taught.length,
        complete: taught.length === concepts.length && concepts.length > 0,
        restsOn: carried.slice()
      });
      carried = carried.concat(concepts);
    });
    /* The first rung not yet fully taught is where the learner is. Everything before
       it is behind them; everything after builds on ground they have not covered. */
    var current = rungs.filter(function (rung) { return !rung.complete; })[0] || null;
    rungs.forEach(function (rung) {
      rung.state = rung.complete ? "done" : current && rung.step === current.step ? "current" : "later";
    });
    return {
      rungs: rungs,
      current: current,
      steps: rungs.length,
      taughtConcepts: rungs.reduce(function (sum, rung) { return sum + rung.taughtCount; }, 0),
      totalConcepts: course.concepts.length
    };
  }

  function conceptNameList(concepts) {
    var names = concepts.map(function (concept) { return concept.name; });
    if (names.length <= 1) return names.join("");
    return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  }

  function renderSetList(courseId) {
    var holder = $("set-list");
    var path = courseRunPath(courseId);
    var replay = $("replay-disclosure");
    var headingEl = $("sets-title");
    var noteEl = $("sets-note");
    replay.hidden = path.cleared.length === 0;
    if (headingEl) headingEl.textContent = path.cleared.length + " cleared run" + (path.cleared.length === 1 ? "" : "s");
    if (noteEl) noteEl.textContent = "Only cleared runs appear here. The next new run stays on the main button.";

    holder.innerHTML = "";
    path.cleared.forEach(function (run) {
      var definition = run.definition;
      var record = run.record;
      var active = profile.active && profile.active.courseId === courseId && profile.active.setId === definition.id;
      var state = active ? "Resume replay" : "Best " + record.best + "%";
      var button = document.createElement("button");
      button.type = "button";
      button.className = "set-card complete";

      button.setAttribute("aria-label",
        "Replay run " + run.step + " of " + path.steps + ": " + definition.title + ". " + state);
      var estimate = studySetEstimate(courseId, definition);
      button.innerHTML = "<span class='set-number'>" + run.step + "</span>" +
        "<span class='set-body'><b>" + escapeHtml(definition.title) + "</b>" +
        "<small class='set-cost'>" + setQuestionCount(definition) + " questions" +
        (estimate.lessons ? " · " + estimate.lessons + " unread lesson" + (estimate.lessons === 1 ? "" : "s") : "") +
        " · ~" + estimate.minutes + " min</small></span>" +
        "<span class='set-meta'><span class='set-step'>Run " + run.step + " of " + path.steps + "</span><span class='set-state'>" + state + "</span></span>";
      button.addEventListener("click", function () { startStudySet(courseId, definition.id); });
      holder.appendChild(button);
    });
  }

  function renderHorizonPlan(key) {
    var plan = HORIZON_PLANS[key] || HORIZON_PLANS.today;
    $all(".horizon-choice").forEach(function (button) {
      var selectedChoice = button.dataset.horizon === key;
      button.classList.toggle("selected", selectedChoice);
      button.setAttribute("aria-pressed", String(selectedChoice));
    });
    $("horizon-plan").innerHTML = "<h3>" + escapeHtml(plan.title) + "</h3><ol>" + plan.steps.map(function (step) { return "<li>" + escapeHtml(step) + "</li>"; }).join("") + "</ol><p class='rest-note'>" + escapeHtml(plan.note) + "</p>";
  }

  function recommendation(courseId) {
    if (profile.active && profile.active.courseId === courseId) {
      return {kind:"resume", title:"Continue " + profile.active.title, copy:"Your run is saved at question " + (profile.active.index + 1) + ".", minutes:"Saved", questions:(profile.active.queue.length - profile.active.index) + " left"};
    }
    var path = courseRunPath(courseId);
    if (path.current) {
      var definition = path.current.definition;
      var estimate = studySetEstimate(courseId, definition);
      var carry = plannedCarryForward(courseId, questionIdsForSet(courseId, definition), 2);
      var carryMinutes = carry.ids.reduce(function (sum, id) {
        var question = getQuestion(courseId, id);
        return sum + (question ? expectedResponseMinutes(question) : 0);
      }, 0);
      return {
        kind:"set", setId:definition.id, step:path.current.step, steps:path.steps,
        title:"Run " + path.current.step + " of " + path.steps + ": " + definition.title,
        copy:(path.current.step === 1
          ? "This is the first run. Finish it once to unlock run 2."
          : path.current.step < path.steps
            ? "This is the only new run open. Finish it once to unlock run " + (path.current.step + 1) + "."
            : "This is the final run. Finish it once to clear the learning path.") +
          (carry.names.length ? " It also checks " + conceptNameList(carry.names.map(function (name) { return {name:name}; })) + " again from your last run." : ""),
        minutes:"~" + Math.max(3, Math.ceil((estimate.minutes + carryMinutes) / 5) * 5) + " minutes",
        questions:(setQuestionCount(definition) + carry.ids.length) + " questions" +
          (estimate.lessons ? " · " + estimate.lessons + " unread lesson" + (estimate.lessons === 1 ? "" : "s") : "")
      };
    }
    return {kind:"priority", title:"All nine runs are clear", copy:"Use a focused check built from your weakest or stalest evidence, or replay a cleared run.", minutes:"About 12 minutes", questions:"Weakest evidence first"};
  }

  function renderRecommendation() {
    var courseId = profile.selectedCourse;
    var rec = recommendation(courseId);
    $("next-step-title").textContent = rec.title;
    $("next-step-copy").textContent = rec.copy;
    $("next-step-meta").innerHTML = "<span>" + escapeHtml(rec.minutes) + "</span><span>" + escapeHtml(rec.questions) + "</span>";
    $("start-recommended").innerHTML = recommendationActionLabel(rec) + " <span aria-hidden='true'>→</span>";

    /* Withdraw whichever way in the hero is already offering. The recommendation
     * runs the same function as one of these routes in three of its four states,
     * so without this the page shows the identical action twice — once as the one
     * call to action and again in the list of alternatives to it. */
    var duplicated = rec.kind === "priority" ? "priority"
      : rec.kind === "mock" ? "mock"
      : rec.kind === "written" ? "written-practice"
      : rec.kind === "set" && rec.setId === 1 ? "course" : null;
    $all("#route-list .route").forEach(function (route) {
      route.hidden = route.dataset.route === duplicated;
    });
    /* The mock-repair route exists only when a mock has actually cost marks. Offering
       it empty would be a control that cannot change the run, which the setup rule
       forbids. */
    var misses = examMissList(profile.selectedCourse);
    var repairRoute = $("practice-exam-repair");
    if (repairRoute) {
      repairRoute.hidden = misses.length === 0;
      if (misses.length) {
        $("exam-repair-route-note").textContent = misses.length + " concept" +
          (misses.length === 1 ? "" : "s") + " you lost marks on under exam conditions" +
          (misses[0].concept ? ", starting with " + misses[0].concept.name : "") + ".";
      }
    }
    renderWrittenPracticeRoute(courseId);
  }

  function renderWrittenPracticeRoute(courseId) {
    var route = $("written-practice-route");
    if (!route) return;
    if (!writtenPracticeAvailable(courseId)) {
      route.hidden = true;
      return;
    }
    var title = route.querySelector("b");
    var note = route.querySelector("small");
    var summary = writtenPracticeSummary(courseId);
    if (summary.focus) {
      title.textContent = "Repair: " + summary.focus.label;
      note.textContent = "Dungeon found " + summary.openGaps.length + " open answer gap" + (summary.openGaps.length === 1 ? "" : "s") + " and will teach them, then check transfer across fresh prompts.";
    } else if (summary.accepted) {
      title.textContent = "Maintain written application";
      note.textContent = "Observed practice: " + summary.criteria.map(function (criterion) {
        return criterion.label + " " + criterion.met + "/" + criterion.attempts;
      }).join(" · ") + ". Dungeon will choose fresh prompts from weak or untested concepts.";
    } else {
      title.textContent = "Let Dungeon diagnose a written answer";
      note.textContent = "Dungeon chooses four source-grounded prompts and tracks course understanding separately from judgement and evidence.";
    }
  }

  function recommendationActionLabel(rec) {
    if (rec.kind === "resume") return "Resume saved practice";
    if (rec.kind === "set") return "Start run " + rec.step;
    if (rec.kind === "mock") return "Mix your own practice";
    if (rec.kind === "written") return "Strengthen this writing move";
    return "Practise these concepts";
  }

  function executeRecommendation() {
    var rec = recommendation(profile.selectedCourse);
    if (rec.kind === "resume") return resumeActive();
    if (rec.kind === "set") return startStudySet(profile.selectedCourse, rec.setId);
    if (rec.kind === "mock") return startPriorityPractice(profile.selectedCourse);
    if (rec.kind === "written") return startWrittenPractice(profile.selectedCourse);
    startPriorityPractice(profile.selectedCourse);
  }

  /* Questions the examiner will use, so Learn can leave them alone.
   *
   * There is one bank, and every question on every paper is drawable in Learn. The
   * damage that does is small per item and large in aggregate: a candidate who meets
   * an item they answered in a study set scores a mark for recall, and the mock
   * reports it as knowledge — the same over-crediting the evidence model refuses to
   * do everywhere else.
   *
   * It cannot be fixed on the examiner's side. Three sections have no slack (SCLM
   * Section A needs 50 mcqs from a pool of 52), and making the draw depend on the
   * learner would mean two students sit different papers, which is not a mock.
   *
   * Learn is the side with room. Measured across the four subjects, a learner who
   * completes all ten study sets is delivered 88 questions out of pools holding
   * 168–207, so Learn is already choosing a minority of what it could serve. It can
   * choose a different minority.
   *
   * Deliberately a LATE tiebreaker rather than a filter. Never-attempted, format
   * spread and concept coverage all still decide first and are unchanged; this only
   * separates candidates those rules rank equally. A hard exclusion would let the
   * examiner's draw quietly starve a module of its best surfaces, which trades a
   * small honesty problem for a real teaching one. */
  var examReservedCache = {};

  function examReservedIds(courseId) {
    if (examReservedCache[courseId]) return examReservedCache[courseId];
    var reserved = {};
    if (EXAM_PAPERS[courseId]) {
      for (var set = 0; set < examSetCount(courseId); set++) {
        var paper = examPaperForSet(courseId, set);
        if (!paper) continue;
        paper.questions.forEach(function (entry) { reserved[entry.question.id] = true; });
      }
    }
    examReservedCache[courseId] = reserved;
    return reserved;
  }

  function selectQuestionsFromPool(courseId, poolIds, count, requiredIds) {
    var selectedIds = [];
    var reserved = examReservedIds(courseId);
    var required = (requiredIds || []).slice().sort(function (a, b) {
      return (reserved[a] ? 1 : 0) - (reserved[b] ? 1 : 0) ||
        questionLastAttemptAt(courseId, a) - questionLastAttemptAt(courseId, b) ||
        stableQuestionOrder(a) - stableQuestionOrder(b);
    });
    required.slice(0, Math.min(required.length, count)).forEach(function (id) {
      if (selectedIds.indexOf(id) < 0) selectedIds.push(id);
    });
    var candidates = unique(poolIds).filter(function (id) {
      var question = getQuestion(courseId, id);
      return question && selectedIds.indexOf(id) < 0 && (!(requiredIds || []).length || !question.boss);
    });
    /* The mocks reserve their deterministic coverage cycle. Learn has far larger
       pools, so a normal
       module set uses the non-reserved remainder whenever it can still fill the run.
       Paper-shaped quotas may backfill from the reserved slice when the format itself
       has no slack (notably SCLM numericals and SPMS multi-select). */
    var nonReserved = candidates.filter(function (id) { return !reserved[id]; });
    if (nonReserved.length >= count - selectedIds.length) candidates = nonReserved;
    while (selectedIds.length < count && candidates.length) {
      var usedTypes = selectedIds.map(function (id) { return getQuestion(courseId, id).type || "mcq"; });
      var usedConcepts = selectedIds.reduce(function (values, id) {
        var question = getQuestion(courseId, id);
        return values.concat([question.conceptId].concat(question.supportingConceptIds || []));
      }, []);
      candidates.sort(function (aId, bId) {
        var a = getQuestion(courseId, aId), b = getQuestion(courseId, bId);
        var aNew = questionLastAttemptAt(courseId, aId) ? 1 : 0;
        var bNew = questionLastAttemptAt(courseId, bId) ? 1 : 0;
        var aTypeUsed = usedTypes.indexOf(a.type || "mcq") >= 0 ? 1 : 0;
        var bTypeUsed = usedTypes.indexOf(b.type || "mcq") >= 0 ? 1 : 0;
        var aConceptUsed = usedConcepts.indexOf(a.conceptId) >= 0 ? 1 : 0;
        var bConceptUsed = usedConcepts.indexOf(b.conceptId) >= 0 ? 1 : 0;
        /* After coverage, before recency: two questions the teaching rules rank
           equally should not both be ones the examiner is holding. */
        var aReserved = reserved[aId] ? 1 : 0;
        var bReserved = reserved[bId] ? 1 : 0;
        return aNew - bNew || aTypeUsed - bTypeUsed || aConceptUsed - bConceptUsed || aReserved - bReserved || questionLastAttemptAt(courseId, aId) - questionLastAttemptAt(courseId, bId) || stableQuestionOrder(aId) - stableQuestionOrder(bId);
      });
      selectedIds.push(candidates.shift());
    }
    return orderForDelivery(courseId, selectedIds);
  }

  /* Selection is variety-driven and stays that way — which questions a run contains
   * is chosen for format spread, concept coverage and weak-first, and all of that is
   * deliberate. This is only the order they arrive in, which is why every route that
   * chooses its own questions (the sweep included) hands them through here rather
   * than sequencing them itself.
   *
   * Concepts are layered: the run walks the course's own sequence, so each lesson
   * builds on the one before it. That was the intent all along and the app already
   * says so out loud — a primer that follows another concept prints "Carry forward:
   * <previous>. Now apply <this>", and the step header reads "builds on what you just
   * did". Until this sort existed those lines were fed whatever order fell out of
   * `stableQuestionOrder`, a hash of the question id, so the promise was made to a
   * sequence nothing had sequenced.
   *
   * The sort is stable, so whatever ordering the caller established survives within a
   * lecture. Constructed responses and bosses stay at the end: they synthesise across
   * the whole run, so they belong after everything they draw on. */
  function orderForDelivery(courseId, selectedIds) {
    var bossIds = selectedIds.filter(function (id) { return getQuestion(courseId, id).boss; });
    var constructedIds = selectedIds.filter(function (id) { return getQuestion(courseId, id).type === "short-answer"; });
    var ordered = selectedIds
      .filter(function (id) { return bossIds.indexOf(id) < 0 && constructedIds.indexOf(id) < 0; })
      .sort(function (aId, bId) {
        return teachingRankOf(getQuestion(courseId, aId)) - teachingRankOf(getQuestion(courseId, bId));
      });
    return ordered.concat(constructedIds, bossIds);
  }

  function stableQuestionOrder(value) {
    return String(value).split("").reduce(function (total, character) { return ((total * 33) + character.charCodeAt(0)) >>> 0; }, 11);
  }

  function questionIdsForSet(courseId, definition) {
    if (!definition.questionPoolIds) return definition.questionIds.slice();
    var count = definition.questionCount || definition.questionIds.length;
    var required = [];
    if (definition.bossIds && definition.bossIds.length) {
      var quota = definition.bossQuota || 1;
      required = definition.bossIds.slice().sort(function (a, b) {
        return questionLastAttemptAt(courseId, a) - questionLastAttemptAt(courseId, b);
      }).slice(0, quota);
    }
    (definition.formatQuotas || []).forEach(function (formatQuota) {
      var eligible = definition.questionPoolIds.filter(function (id) {
        var question = getQuestion(courseId, id);
        return question && (question.type || "mcq") === formatQuota.type && required.indexOf(id) < 0;
      }).sort(function (a, b) {
        var reserved = examReservedIds(courseId);
        return (reserved[a] ? 1 : 0) - (reserved[b] ? 1 : 0) ||
          questionLastAttemptAt(courseId, a) - questionLastAttemptAt(courseId, b) ||
          stableQuestionOrder(a) - stableQuestionOrder(b);
      });
      eligible.slice(0, formatQuota.count).forEach(function (id) { required.push(id); });
    });
    return selectQuestionsFromPool(courseId, definition.questionPoolIds, count, required);
  }

  /* A fixed run can still remember what the previous one exposed. At most two
   * currently weak concepts are carried into the next run with a fresh question
   * family. They do not replace the run's authored questions and they do not unlock
   * a different level; they are the small adaptive seam inside the fixed sequence. */
  function plannedCarryForward(courseId, baseIds, limit) {
    var represented = {};
    baseIds.forEach(function (id) {
      conceptIdsOf(getQuestion(courseId, id)).forEach(function (conceptId) { represented[conceptId] = true; });
    });
    var candidates = getCourse(courseId).concepts.filter(function (concept) {
      return conceptStatus(courseId, concept.id) === "needs" && !represented[concept.id];
    }).sort(function (a, b) {
      return conceptPriority(courseId, b).score - conceptPriority(courseId, a).score;
    });
    var ids = [];
    var names = [];
    candidates.some(function (concept) {
      if (ids.length >= limit) return true;
      var question = chooseQuestion(courseId, concept.id, null, baseIds.concat(ids));
      if (!question || baseIds.indexOf(question.id) >= 0 || ids.indexOf(question.id) >= 0) return false;
      ids.push(question.id);
      names.push(concept.name);
      conceptIdsOf(question).forEach(function (conceptId) { represented[conceptId] = true; });
      return ids.length >= limit;
    });
    return {ids:ids, names:names};
  }

  /* Which runs re-teach a lesson the learner has already read. Remediation does,
   * because it exists because something went wrong; discovery does not, because a
   * study set is where the material is met rather than repaired. */
  var RETEACHING_KINDS = ["priority", "exam-repair", "concept"];

  function layeredQueue(courseId, questionIds, mode, options) {
    var queue = [];
    var introduced = [];
    var taughtHere = [];
    var previousConceptId = null;
    var reteachIn = (options && options.reteach) ? courseId : null;

    /* Every lecture this run will owe a lesson for, in the course's teaching order.
     *
     * Ordering the questions is not enough on its own to make the lessons layer.
     * Two surfaces break the correspondence: a boss or a constructed response is
     * deliberately held to the end of the run, and a question ranks by the LAST
     * lecture it cites — so either can be the first surface to owe a lesson for an
     * EARLY lecture, which would then be introduced after material that builds on
     * it. Measured across the four subjects, that produced four backward steps,
     * including a module-3 foundation taught last because only the boss cited it.
     *
     * So the run commits to the whole list up front and drains it in order: when a
     * surface needs lecture X, everything still owed at or before X is taught, X
     * included. Lesson order is then monotonic by construction rather than by
     * accident, and LAW-47 holds a fortiori — a lesson can only ever come earlier
     * than the surface that triggered it, never later. */
    var owed = [];
    if (mode !== "simulation" && !(options && options.skipLessons)) {
      (options && options.lessonIds || []).forEach(function (lectureId) {
        if (lessonFor(lectureId) && !lessonIsRead(lectureId) && owed.indexOf(lectureId) < 0) owed.push(lectureId);
      });
      questionIds.forEach(function (id) {
        var question = getQuestion(courseId, id);
        if (!question) return;
        var surfaces = [question];
        var primer = primerSupportLevel(courseId, question.conceptId) > 0
          ? primerQuestionFor(courseId, question.conceptId)
          : null;
        if (primer) surfaces.push(primer);
        surfaces.forEach(function (surface) {
          pendingLessonsFor(surface, reteachIn).forEach(function (lectureId) {
            if (owed.indexOf(lectureId) < 0) owed.push(lectureId);
          });
        });
      });
      owed.sort(function (a, b) { return lectureTeachingRank(a) - lectureTeachingRank(b); });
    }

    questionIds.forEach(function (id) {
      var question = getQuestion(courseId, id);
      if (!question) return;
      var conceptIds = [question.conceptId];

      /* Teach before testing. Any surface citing a lecture the learner has never
       * been taught gets that lecture's lesson placed ahead of it. This is the
       * invariant the whole 0→80 path rests on.
       *
       * It applies to the primer on its own terms, not by inheritance from the
       * question it precedes. A primer is a separate authored surface with its
       * own sourceIds, and they routinely differ: `brgsa_m1_demand_primer` cites
       * M01-L01 while the `survey_bias` it introduces cites M01-L05. Gating only
       * on the scored question let that primer run five steps ahead of its own
       * lesson — the original defect in miniature. */
      function teachFirst(surface, conceptId) {
        if (mode === "simulation" || (options && options.skipLessons)) return;
        var needed = pendingLessonsFor(surface, reteachIn);
        /* Drain the owed list up to the latest lecture this surface needs. Anything
         * earlier that is still outstanding is a foundation this surface is about to
         * be tested on top of, so it goes first. */
        var surfaceRank = teachingRankOf(surface);
        var dueFromSchedule = owed.some(function (lectureId) {
          return lectureTeachingRank(lectureId) <= surfaceRank && taughtHere.indexOf(lectureId) < 0;
        });
        if (!needed.length && !dueFromSchedule) return;
        var upTo = needed.length ? Math.max.apply(null, needed.map(lectureTeachingRank)) : surfaceRank;
        if (surfaceRank < Number.MAX_SAFE_INTEGER) upTo = Math.max(upTo, surfaceRank);
        owed.filter(function (lectureId) {
          return lectureTeachingRank(lectureId) <= upTo && taughtHere.indexOf(lectureId) < 0;
        }).forEach(function (lectureId) {
          queue.push({
            id: lessonItemId(lectureId, conceptId),
            initial: false,
            isReattempt: false,
            origin: null,
            lesson: true,
            lectureId: lectureId,
            /* Read before this run put it back. Recorded here rather than derived at
               render time, because rendering the first re-taught lesson re-stamps
               `lessonsRead` and every one after it would then read as first contact. */
            reteach: lessonIsRead(lectureId),
            previousConceptId: previousConceptId
          });
          taughtHere.push(lectureId);
        });
      }

      teachFirst(question, question.conceptId);

      if (mode !== "simulation" && !(options && options.skipPrimers)) conceptIds.forEach(function (conceptId) {
        if (introduced.indexOf(conceptId) >= 0 || primerSupportLevel(courseId, conceptId) <= 0) return;
        var primer = primerQuestionFor(courseId, conceptId);
        if (!primer) return;
        teachFirst(primer, conceptId);
        queue.push({
          id: primer.id,
          initial: false,
          isReattempt: false,
          origin: null,
          primer: true,
          primerLevel: primerSupportLevel(courseId, conceptId),
          previousConceptId: previousConceptId
        });
        introduced.push(conceptId);
        previousConceptId = conceptId;
      });
      queue.push({id:id, initial:true, isReattempt:false, origin:null});
      if (introduced.indexOf(question.conceptId) < 0) introduced.push(question.conceptId);
      previousConceptId = question.conceptId;
    });
    /* A module can end with lectures no sampled question cites. They are still part
       of the authored module and therefore still belong to its study step. Appending
       the remaining lessons makes the main course path complete without inventing a
       question citation merely to make teaching reachable. */
    owed.filter(function (lectureId) { return taughtHere.indexOf(lectureId) < 0; })
      .forEach(function (lectureId) {
        queue.push({
          id: lessonItemId(lectureId, previousConceptId),
          initial: false,
          isReattempt: false,
          origin: null,
          lesson: true,
          lectureId: lectureId,
          reteach: lessonIsRead(lectureId),
          previousConceptId: previousConceptId
        });
        taughtHere.push(lectureId);
      });
    return queue;
  }

  function createSession(courseId, details, questionIds) {
    var initialStatuses = {};
    getCourse(courseId).concepts.forEach(function (concept) { initialStatuses[concept.id] = conceptStatus(courseId, concept.id); });
    var queue = layeredQueue(courseId, questionIds, details.mode || "learning",
      {reteach: RETEACHING_KINDS.indexOf(details.kind) >= 0, lessonIds: details.lessonIds || [],
        skipLessons:Boolean(details.skipLessons), skipPrimers:Boolean(details.skipPrimers)});
    return {
      courseId: courseId,
      kind: details.kind,
      mode: details.mode || "learning",
      band: details.band || null,
      shape: details.shape || null,
      focus: details.focus || null,
      length: details.length || null,
      writtenFocus: details.writtenFocus || [],
      setId: details.setId || null,
      conceptId: details.conceptId || null,
      confidenceRotation: details.confidenceRotation == null ? null : Number(details.confidenceRotation),
      confidenceRound: details.confidenceRound == null ? null : Number(details.confidenceRound),
      confidenceCycleRounds: details.confidenceCycleRounds == null ? null : Number(details.confidenceCycleRounds),
      finalSprintRotation: details.finalSprintRotation == null ? null : Number(details.finalSprintRotation),
      studyModule: details.studyModule == null ? null : Number(details.studyModule),
      chamberRotation: details.chamberRotation == null ? null : Number(details.chamberRotation),
      title: details.title,
      kicker: details.kicker,
      /* Set by the weakness route: which surface checks which pair of linked concepts,
       * and which weaknesses had no linked partner. Both are needed at render time to
       * say honestly what a given step is doing. */
      linkChecks: details.linkChecks || {},
      isolatedConceptNames: details.isolatedConceptNames || [],
      scheduledLessonIds: (details.lessonIds || []).slice(),
      queue: queue,
      baseCount: questionIds.length,
      supportCount: queue.length - questionIds.length,
      index: 0,
      answered: false,
      selected: null,
      confidence: null,
      subjectiveStage: null,
      rubricSelection: [],
      responses: [],
      initialStatuses: initialStatuses,
      blockId: "block-" + Date.now().toString(36) + "-" + String(profile.blockSequence = (profile.blockSequence || 0) + 1),
      startedAt: Date.now()
    };
  }

  /* The builder is reached from exactly one control.
   *
   * It previously had three doors — a disclosure summary, a "Mix your own practice"
   * button one section further down, and the hero call to action whenever the
   * recommendation happened to be a mock. All three landed here, so the same
   * feature was advertised three times on one screen. "Build your own practice" in
   * the Ways in list is now the only one, and the hero withdraws its duplicate
   * (see renderRecommendation). */
  function setBuilderOpen(open) {
    var builder = $("practice-builder");
    var toggle = $("builder-toggle");
    if (!builder || !toggle) return;
    builder.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (!open) return;
    /* The dials open only when they are already carrying settings no card describes —
     * a learner who left the builder mid-tinker should find their mix where they left
     * it rather than behind a closed disclosure. Set on opening the section and never
     * on re-render, so a panel opened by hand stays open while chips are pressed. */
    var details = $("builder-details");
    if (details) details.open = !presetFor(builderSettings());
    renderPracticeBuilder();
  }

  function openPracticeSetup(courseId) {
    if (courseId && courseId !== profile.selectedCourse) {
      profile.selectedCourse = courseId;
      saveProfile();
      renderDashboard();
    }
    // showScreen resets the scroll position, and with smooth scrolling that animation would
    // outlive and override the jump to the builder (LAW-42).
    if (!$("dashboard-screen").classList.contains("active")) showScreen("dashboard-screen");
    var advanced = $("advanced-disclosure");
    if (advanced) advanced.open = true;
    setBuilderOpen(true);
    var builder = $("practice-builder");
    if (!builder) return;
    builder.focus({preventScroll: true});
    window.requestAnimationFrame(function () { builder.scrollIntoView({block: "center", behavior: "smooth"}); });
  }

  function conceptStatusMap(courseId) {
    var statuses = {};
    getCourse(courseId).concepts.forEach(function (concept) { statuses[concept.id] = conceptStatus(courseId, concept.id); });
    return statuses;
  }

  function shapeMatches(shape, question) {
    if (shape === "recognition") return question.type === "mcq" || question.type === "cloze" || question.type === "msq";
    if (shape === "application") return question.type === "case-cloze" || question.type === "match" || question.type === "boss" || question.type === "numeric" || question.perspective === "apply";
    if (shape === "generation") return question.type === "short-answer" || question.type === "cloze" || question.type === "case-cloze";
    return true;
  }

  function focusMatches(focus, question, statuses) {
    if (focus === "weak") {
      return [question.conceptId].concat(question.supportingConceptIds || []).some(function (conceptId) {
        return statuses[conceptId] === "needs" || statuses[conceptId] === "developing";
      });
    }
    if (focus === "new") return statuses[question.conceptId] === "unseen";
    return true;
  }

  function bandMatches(bandId, question) {
    var band = optionById(PRACTICE_BANDS, bandId) || optionById(PRACTICE_BANDS, "any");
    var difficulty = question.difficulty || 2;
    return difficulty >= band.min && difficulty <= band.max;
  }

  function practiceCandidates(courseId, settings, statuses) {
    statuses = statuses || conceptStatusMap(courseId);
    var course = getCourse(courseId);
    return Object.keys(course.questions).map(function (id) { return course.questions[id]; })
      .filter(function (question) {
        return !question.optionShapeRisk && !question.primerOnly &&
          shapeMatches(settings.shape, question) && focusMatches(settings.focus, question, statuses) &&
          bandMatches(settings.band, question);
      });
  }

  function practiceAnchors(courseId, settings, pool) {
    function oldestFirst(questions, limit) {
      return questions.slice().sort(function (a, b) {
        return questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id);
      }).slice(0, limit).map(function (question) { return question.id; });
    }
    /* A module boss is the hardest thing the bank can ask — three steps telling two
     * concepts apart — and `selectQuestionsFromPool` deliberately admits bosses only
     * as anchors. So the hardest band has to name them, or the run advertised as the
     * hardest surfaces would contain at most one of them by accident. Three is the
     * quota a study set uses for the same reason. */
    if (settings.band === "hardest") {
      var bosses = oldestFirst(pool.filter(function (question) { return question.boss; }), 3);
      if (bosses.length) return bosses;
    }
    if (settings.shape === "application") return oldestFirst(pool.filter(function (question) { return question.boss; }), 2);
    if (settings.shape === "generation") return oldestFirst(pool.filter(function (question) { return question.type === "short-answer"; }), 4);
    if (settings.shape !== "mixed") return [];
    var anchors = [];
    ["mcq", "cloze", "case-cloze", "match", "short-answer", "boss"].forEach(function (type) {
      var candidate = oldestFirst(pool.filter(function (question) { return question.type === type; }), 1)[0];
      if (candidate) anchors.push(candidate);
    });
    return anchors;
  }

  function lengthIsSweep(id) {
    return Boolean((optionById(PRACTICE_LENGTHS, id) || {}).sweep);
  }

  /* A sweep's size is the subject's, so it can only be answered against a pool. Every
   * other length is the number printed on the chip. */
  function lengthTarget(id, pool) {
    var option = optionById(PRACTICE_LENGTHS, id) || PRACTICE_LENGTHS[1];
    if (!option.sweep) return option.target;
    return unique((pool || []).map(function (question) { return question.conceptId; })).length;
  }

  function estimateMinutes(count) {
    return Math.max(3, Math.round(count * 1.25));
  }

  /* One question per concept, taking each concept's plainest available surface.
   *
   * The generic selector cannot make this promise. Its variety keys rank format
   * spread above concept spread, so asking it for sixteen questions from a
   * sixteen-concept subject returns *about* one each — which is fine for a mixed run
   * and useless for a card that says "every concept in the subject, one question
   * each". A promise that specific has to be selected for, not hoped for. */
  function sweepSelection(courseId, pool) {
    var byConcept = {};
    pool.forEach(function (question) {
      (byConcept[question.conceptId] = byConcept[question.conceptId] || []).push(question);
    });
    return Object.keys(byConcept).map(function (conceptId) {
      return byConcept[conceptId].slice().sort(function (a, b) {
        var aSeen = questionLastAttemptAt(courseId, a.id) ? 1 : 0;
        var bSeen = questionLastAttemptAt(courseId, b.id) ? 1 : 0;
        return (a.difficulty || 2) - (b.difficulty || 2) || aSeen - bSeen ||
          questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id) ||
          stableQuestionOrder(a.id) - stableQuestionOrder(b.id);
      })[0].id;
    });
  }

  function practicePlan(courseId, settings, statuses) {
    var pool = practiceCandidates(courseId, settings, statuses);
    var poolIds = pool.map(function (question) { return question.id; });
    var target = Math.min(lengthTarget(settings.length, pool), pool.length);
    if (lengthIsSweep(settings.length)) {
      var swept = orderForDelivery(courseId, sweepSelection(courseId, pool));
      return {ids: swept, poolSize: pool.length, count: swept.length, concepts: swept.length};
    }
    var anchors = practiceAnchors(courseId, settings, pool).slice(0, target);
    var ids = target ? selectQuestionsFromPool(courseId, poolIds, target, anchors) : [];
    return {ids: ids, poolSize: pool.length, count: ids.length};
  }

  function practiceShapeQuestionIds(courseId, shape) {
    return practicePlan(courseId, {shape: shape, focus: "all", length: "standard", band: "any"}).ids;
  }

  function builderSettings() {
    profile.builder = normalizeBuilder(profile.builder);
    return profile.builder;
  }

  function renderChipGroup(holderId, options, selectedId, describe, onSelect) {
    var holder = $(holderId);
    holder.innerHTML = "";
    options.forEach(function (option) {
      var state = describe(option);
      var chosen = option.id === selectedId;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chip-option" + (chosen ? " selected" : "");
      button.disabled = !state.available && !chosen;
      button.setAttribute("aria-pressed", String(chosen));
      button.innerHTML = "<b>" + escapeHtml(state.label || option.label) + "</b><small>" + escapeHtml(state.note) + "</small>";
      button.addEventListener("click", function () { if (!button.disabled && !chosen) onSelect(option.id); });
      holder.appendChild(button);
    });
  }

  function withDials(base, overrides) {
    var merged = {};
    BUILDER_DIALS.forEach(function (dial) { merged[dial] = base[dial]; });
    Object.keys(overrides || {}).forEach(function (dial) { merged[dial] = overrides[dial]; });
    return merged;
  }

  /* What a plan is, said in facts a learner can check against the run they get. The
   * three cards each earn their sentence from their own plan rather than from the
   * label on the card, so a subject whose bank cannot honour a level says so on the
   * card instead of quietly delivering a different run. */
  function planFacts(courseId, plan, settings) {
    if (!plan.count) return "";
    var questions = plan.count + " question" + (plan.count === 1 ? "" : "s");
    if (lengthIsSweep(settings.length)) return questions + " · one per concept";
    var bosses = plan.ids.filter(function (id) { return getQuestion(courseId, id).boss; }).length;
    if (bosses) return questions + " · " + bosses + " module boss" + (bosses === 1 ? "" : "es");
    return questions + " · " + unique(plan.ids.map(function (id) { return getQuestion(courseId, id).type || "mcq"; })).length + " formats";
  }

  // LAW-01: a builder choice must change the run. Unavailable combinations are disabled with the
  // reason, and a length that cannot add questions collapses to the shorter one that matches it.
  function renderPracticeBuilder() {
    var section = $("practice-builder");
    // Nothing below is visible while the section is folded away, and all of it costs
    // pool scans and a full plan per preset. The dashboard renders often; this does not.
    if (!section || section.hidden) return;
    var courseId = profile.selectedCourse;
    var settings = builderSettings();
    var statuses = conceptStatusMap(courseId);
    function poolFor(overrides) { return practiceCandidates(courseId, withDials(settings, overrides), statuses); }
    function poolSize(overrides) { return poolFor(overrides).length; }

    // A narrowing choice that selects the whole pool is not a real choice, so it collapses to
    // "Anything" instead of pretending to filter.
    var wholePool = poolSize({focus: "all"});
    if (settings.focus !== "all" && poolSize({}) >= wholePool) settings.focus = "all";
    if (!poolSize({})) settings.focus = "all";
    if (!poolSize({})) settings.shape = "mixed";
    // Reachable only from a restored profile: every impossible combination is disabled below
    // before it can be pressed, so this is the net under a bank that changed after a save.
    if (!poolSize({})) settings.band = "any";
    var pool = poolFor({});
    var available = pool.length;
    function achievable(lengthId) { return Math.min(lengthTarget(lengthId, pool), available); }
    PRACTICE_LENGTHS.forEach(function (option) {
      if (option.sweep || lengthIsSweep(settings.length)) return;
      if (option.target >= lengthTarget(settings.length, pool)) return;
      if (achievable(option.id) === achievable(settings.length)) settings.length = option.id;
    });

    renderPresetCards(courseId, settings, statuses);

    renderChipGroup("builder-band", PRACTICE_BANDS, settings.band, function (option) {
      var size = poolSize({band: option.id});
      return {available: size > 0, note: size ? option.hint + " · " + size + " to draw from" : "Nothing at this difficulty tests what you chose above"};
    }, function (id) { settings.band = id; commitBuilderChange(); });

    renderChipGroup("builder-shape", PRACTICE_SHAPES, settings.shape, function (option) {
      var size = poolSize({shape: option.id});
      return {available: size > 0, note: size ? option.hint : "None of these are left at this difficulty"};
    }, function (id) { settings.shape = id; commitBuilderChange(); });

    renderChipGroup("builder-focus", PRACTICE_FOCUS, settings.focus, function (option) {
      var size = poolSize({focus: option.id});
      var whole = poolSize({focus: "all"});
      if (option.id === "all") return {available: size > 0, note: size ? option.hint + " · " + size + " to draw from" : "No question matches this combination"};
      if (!size) return {available: false, note: option.id === "weak" ? "Nothing in this subject needs work yet" : "No untouched concept is left here"};
      if (size >= whole) return {available: false, note: option.id === "weak" ? "Every concept here needs work, so this is the same as anything" : "Nothing is started yet, so this is the same as anything"};
      return {available: true, note: option.hint + " · " + size + " to draw from"};
    }, function (id) { settings.focus = id; commitBuilderChange(); });

    renderChipGroup("builder-length", PRACTICE_LENGTHS, settings.length, function (option) {
      var count = achievable(option.id);
      /* A sweep is never "the same run as" a fixed length that happens to be the same
       * size: one takes each concept once, the other takes whatever the variety keys
       * pick. Same count, different run, so neither collapses into the other. */
      var duplicateOf = option.sweep ? null : PRACTICE_LENGTHS.filter(function (other) {
        return !other.sweep && other.target < option.target && achievable(other.id) === count;
      })[0];
      return {
        available: count > 0 && !duplicateOf,
        note: !count ? "No questions available"
          : duplicateOf ? "Only " + count + " here, the same run as " + duplicateOf.label.toLowerCase()
          : option.sweep ? count + " concepts · one question each"
          : count + " questions"
      };
    }, function (id) { settings.length = id; commitBuilderChange(); });

    renderChipGroup("builder-mode", PRACTICE_MODES, settings.mode, function (option) {
      return {available: true, note: option.hint};
    }, function (id) { settings.mode = id; commitBuilderChange(); });

    var preset = presetFor(settings);
    $("builder-details-note").textContent = preset
      ? "Difficulty, format, focus, length, feedback"
      : "Custom mix · no preset matches these settings";

    var plan = practicePlan(courseId, settings, statuses);
    /* The one time claim on the screen, and it is made against the run that will
     * actually be queued — lessons and primers included. Counting only the scored
     * questions understated a first run through a subject by every lesson in it. */
    var items = plan.count ? layeredQueue(courseId, plan.ids, settings.mode).length : 0;
    var support = items - plan.count;
    $("builder-start").disabled = !plan.count;
    $("builder-summary").textContent = !plan.count
      ? "No question matches this combination yet. Change one choice above."
      : plan.count + " question" + (plan.count === 1 ? "" : "s") + " from " + getCourse(courseId).shortTitle + " · " +
        optionById(PRACTICE_BANDS, settings.band).summary +
        (settings.shape === "mixed" ? "" : " · " + optionById(PRACTICE_SHAPES, settings.shape).label.toLowerCase()) + " · " +
        optionById(PRACTICE_FOCUS, settings.focus).summary + " · explanations " +
        optionById(PRACTICE_MODES, settings.mode).label.toLowerCase() + " · about " + estimateMinutes(items) + " minutes" +
        (support > 0 ? ", including " + support + " short lesson" + (support === 1 ? "" : "s") + " and primer" + (support === 1 ? "" : "s") + " placed before the questions that need them." : ".");
  }

  function renderPresetCards(courseId, settings, statuses) {
    var holder = $("builder-presets");
    if (!holder) return;
    var active = presetFor(settings);
    holder.innerHTML = "";
    PRACTICE_PRESETS.forEach(function (preset) {
      var plan = practicePlan(courseId, preset.settings, statuses);
      var chosen = Boolean(active) && active.id === preset.id;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "preset-card" + (chosen ? " selected" : "");
      button.disabled = !plan.count && !chosen;
      button.setAttribute("aria-pressed", String(chosen));
      button.innerHTML = "<span class='preset-range'>" + escapeHtml(preset.range) + "</span>" +
        "<b>" + escapeHtml(preset.label) + "</b>" +
        "<small>" + escapeHtml(preset.promise) + "</small>" +
        "<span class='preset-count'>" + escapeHtml(plan.count
          ? planFacts(courseId, plan, preset.settings)
          : "This subject has nothing left at this level") + "</span>";
      button.addEventListener("click", function () {
        if (button.disabled || chosen) return;
        BUILDER_DIALS.forEach(function (dial) { settings[dial] = preset.settings[dial]; });
        commitBuilderChange();
      });
      holder.appendChild(button);
    });
  }

  function commitBuilderChange() {
    saveProfile();
    renderPracticeBuilder();
  }

  function startBuiltPractice(override) {
    var courseId = profile.selectedCourse;
    var settings = validBuilder(override) ? normalizeBuilder(override) : builderSettings();
    var plan = practicePlan(courseId, settings);
    if (!plan.ids.length) return toast("No question matches that combination yet.");
    var shape = optionById(PRACTICE_SHAPES, settings.shape);
    var focus = optionById(PRACTICE_FOCUS, settings.focus);
    var preset = presetFor(settings);
    var simulation = settings.mode === "simulation";
    session = createSession(courseId, {
      kind: simulation ? "practice-check" : "practice-shape",
      mode: settings.mode,
      band: settings.band,
      shape: settings.shape,
      focus: settings.focus,
      length: settings.length,
      // The run is named for the card that started it, so the header a learner reads
      // mid-run is the promise they pressed rather than a description of the dials.
      title: preset ? preset.label : shape.runTitle + (settings.focus === "all" ? "" : " · " + focus.summary),
      kicker: (preset ? preset.range + " · " : "") +
        (simulation ? "Explanations held to the end" : "Explanations after each answer") + " · " + plan.count + " questions"
    }, plan.ids);
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function startWrittenPractice(courseId) {
    if (!writtenPracticeAvailable(courseId)) return toast("This paper does not use prose answers. Dungeon will use its case, numerical, matching, or multi-select formats instead.");
    var writtenSummary = writtenPracticeSummary(courseId);
    var courseRecord = writtenCoursePractice(courseId);
    var reservedForExam = examReservedIds(courseId);
    var questions = Object.keys(getCourse(courseId).questions).map(function (id) {
      return getQuestion(courseId, id);
    }).filter(function (question) {
      return question && question.type === "short-answer" && !question.optionShapeRisk && !question.primerOnly && !question.examOnly;
    }).sort(function (left, right) {
      var leftRecord = courseRecord.questions[left.id] || {attempts:0, lastAt:0};
      var rightRecord = courseRecord.questions[right.id] || {attempts:0, lastAt:0};
      var focus = writtenSummary.openGaps[0];
      var leftGapFit = focus && focus.scope === "concept" ? (left.conceptId === focus.conceptId ? 0 : 1) : 0;
      var rightGapFit = focus && focus.scope === "concept" ? (right.conceptId === focus.conceptId ? 0 : 1) : 0;
      var leftReserved = reservedForExam[left.id] ? 1 : 0;
      var rightReserved = reservedForExam[right.id] ? 1 : 0;
      var leftFresh = leftRecord.attempts ? 1 : 0;
      var rightFresh = rightRecord.attempts ? 1 : 0;
      var statusOrder = {needs:0, developing:1, unseen:2, strong:3};
      return leftGapFit - rightGapFit || leftReserved - rightReserved || leftFresh - rightFresh ||
        statusOrder[conceptStatus(courseId, left.conceptId)] - statusOrder[conceptStatus(courseId, right.conceptId)] ||
        (Number(leftRecord.lastAt) || questionLastAttemptAt(courseId, left.id)) - (Number(rightRecord.lastAt) || questionLastAttemptAt(courseId, right.id));
    });
    /* First pass: one prompt per concept, alternating fast explanation and case
     * transfer where possible. A second pass fills any remaining slots.
     *
     * The rotation used to be short/case/short/case, and the consequence was that the
     * integrated scenarios could not be reached at all: the fallback only fires when
     * no unchosen concept has a prompt in the requested mode, and every one of these
     * subjects' concepts carries both a short and a case prompt, so it never fired.
     * Four authored ten-mark scenarios sat in the bank unreachable by any Learn route
     * while the examiner's Section C is exactly that surface — which is the shape of
     * "if Examiner feels foreign, that is Learn's failure". The last slot is now the
     * integrated one, placed last because it costs twelve minutes and rests on the
     * concepts the three before it have just exercised. */
    var chosen = [];
    var chosenConcepts = {};
    ["short", "case", "short", "integrated"].forEach(function (mode) {
      var question = questions.filter(function (candidate) {
        return !chosenConcepts[candidate.conceptId] && candidate.writtenMode === mode && chosen.indexOf(candidate) < 0;
      })[0];
      /* One concept per prompt is the right rule for the per-concept modes and the
         wrong one for this mode: an integrated scenario spans four concepts and is
         filed under the first, so the uniqueness test can reject the only surface of
         its kind because a three-minute prompt on one of its four concepts was taken
         two slots earlier. Only four scenarios exist per subject, so that collision is
         common rather than theoretical. This slot therefore relaxes uniqueness before
         it gives the slot up. */
      if (!question && mode === "integrated") {
        question = questions.filter(function (candidate) {
          return candidate.writtenMode === mode && chosen.indexOf(candidate) < 0;
        })[0];
      }
      if (!question) {
        question = questions.filter(function (candidate) {
          return !chosenConcepts[candidate.conceptId] && chosen.indexOf(candidate) < 0;
        })[0];
      }
      if (question) { chosen.push(question); chosenConcepts[question.conceptId] = true; }
    });
    questions.forEach(function (question) { if (chosen.length < 4 && chosen.indexOf(question) < 0) chosen.push(question); });
    var ids = chosen.slice(0, 4).map(function (question) { return question.id; });
    if (!ids.length) return toast("No written prompts are available for this subject yet.");
    profile.selectedCourse = courseId;
    session = createSession(courseId, {
      kind: "written-practice",
      mode: "learning",
      shape: "generation",
      focus: "all",
      length: "written",
      writtenFocus:writtenSummary.open.map(function (criterion) { return criterion.id; }),
      writtenGapFocus:writtenSummary.openGaps.map(function (gap) { return gap.key; }),
      title: writtenSummary.focus ? "Written repair · " + writtenSummary.focus.label : "Written application diagnosis",
      kicker: ids.length + " Dungeon-chosen prompts · " + (writtenSummary.focus ? "weakest writing move first" : "diagnosis across two criteria")
    }, ids);
    session.writtenFocus = writtenSummary.open.map(function (criterion) { return criterion.id; });
    session.writtenGapFocus = writtenSummary.openGaps.map(function (gap) { return gap.key; });
    session.writtenReason = writtenSummary.focus ? "Dungeon is checking whether the last repair transfers to fresh course material." : "Dungeon is establishing separate evidence for course understanding and supported judgement.";
    if (session.writtenFocus.length) {
      var firstWritten = session.queue.filter(function (item) { return getQuestion(courseId, item.id).type === "short-answer"; })[0];
      if (firstWritten) {
        firstWritten.writtenFocus = session.writtenFocus.slice();
        firstWritten.writtenGapFocus = session.writtenGapFocus.slice();
      }
    }
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function startStudySet(courseId, setId) {
    var definition = getStudySet(courseId, setId);
    if (!definition) return;
    if (definition.mock) return openPracticeSetup(courseId);
    profile.selectedCourse = courseId;
    if (profile.active && profile.active.courseId === courseId && profile.active.setId === Number(setId)) {
      session = clone(profile.active);
    } else {
      var coreIds = questionIdsForSet(courseId, definition);
      var carry = plannedCarryForward(courseId, coreIds, 2);
      session = createSession(courseId, {
        kind: "set",
        setId: definition.id,
        title: definition.title,
        kicker: "Run " + definition.id + " of " + courseRunPath(courseId).steps +
          (carry.names.length ? " · repeats " + carry.names.join(" + ") : ""),
        carryForwardConceptNames:carry.names,
        lessonIds: moduleLessonIdsForStudySet(courseId, definition)
      }, coreIds.concat(carry.ids));
      session.carryForwardConceptNames = carry.names.slice();
      profile.active = clone(session);
      saveProfile();
    }
    beginPractice();
  }

  function startConceptPractice(courseId, conceptId) {
    var concept = getConcept(courseId, conceptId);
    var surfaceIds = questionSurfaces(courseId, conceptId).map(function (question) { return question.id; });
    var ids = selectQuestionsFromPool(courseId, surfaceIds, Math.min(5, surfaceIds.length), []);
    if (!ids.length) return;
    profile.selectedCourse = courseId;
    session = createSession(courseId, {kind:"concept", conceptId:conceptId, title:concept.name, kicker:"Focused concept practice"}, ids);
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function conceptPriority(courseId, concept) {
    var evidence = conceptEvidence(courseId, concept.id);
    var score = evidence.status === "needs" ? 100 : evidence.status === "developing" ? 60 : evidence.status === "unseen" ? 45 : evidence.refreshDue ? 30 : 0;
    if (evidence.openConfidentError) score += 35;
    if (evidence.openUnderconfidentCorrect) score += 12;
    if (evidence.recurringMisconception) score += 30;
    if (evidence.attempts && !evidence.delayedCorrect) score += 18;
    if (evidence.attempts && !evidence.integrativeEvidence) score += 15;
    if (evidence.openBossFailure) score += 12;
    var attempts = attemptsFor(courseId, concept.id);
    if (attempts.slice(-3).length >= 3 && attempts.slice(-3).every(function (attempt) { return attemptBlock(attempt) === attemptBlock(attempts[attempts.length - 1]); })) score -= 12;
    var reason = evidence.openConfidentError ? "a confident error needs two independent repairs" : evidence.openUnderconfidentCorrect ? "a correct but uncertain answer needs a new-family confirmation" : evidence.recurringMisconception ? "the same misconception returned" : evidence.status === "needs" ? "recent errors are still open" : evidence.attempts && !evidence.delayedCorrect ? "it has not yet been retrieved after a genuine delay" : evidence.attempts && !evidence.integrativeEvidence ? "it still needs a new case or reasoning step" : evidence.status === "unseen" ? "it has no diagnostic evidence yet" : evidence.refreshDue ? "its last success is due for refresh" : "it has the least recent independent evidence";
    return {score:score, reason:reason};
  }

  /* Room for the joint checks. A linked pair costs three items — one repair each, then
   * the surface that tests them together — where an isolated weakness costs one, so a
   * run of eight would have bought the links by dropping concepts. */
  var PRIORITY_RUN_LENGTH = 10;

  function startPriorityPractice(courseId) {
    var course = getCourse(courseId);
    profile.selectedCourse = courseId;
    var concepts = course.concepts.slice().sort(function (a, b) {
      var priorityDifference = conceptPriority(courseId, b).score - conceptPriority(courseId, a).score;
      if (priorityDifference) return priorityDifference;
      var aAttempts = attemptsFor(courseId, a.id);
      var bAttempts = attemptsFor(courseId, b.id);
      var aTime = aAttempts.length ? aAttempts[aAttempts.length - 1].at : 0;
      var bTime = bAttempts.length ? bAttempts[bAttempts.length - 1].at : 0;
      return aTime - bTime;
    });
    var targets = concepts.slice(0, 8);

    /* Weaknesses that are connected are repaired together and then checked together;
     * weaknesses that are not are repaired alone and SAID to be alone. The second half
     * matters as much as the first — an isolated gap dressed up as part of a group
     * teaches a connection the learner has no evidence for. */
    var units = groupWeaknesses(courseId, targets);
    var ids = [];
    var linkChecks = {};
    var linkedNames = [];
    var isolatedNames = [];

    units.forEach(function (unit) {
      /* Check the whole unit fits before starting it, not just that there is one slot
       * left. A pair costs three items, so testing for "any room" let a run that
       * promised ten deliver twelve. A unit that does not fit is dropped rather than
       * split: half a pair is an isolated repair mislabelled as a link. */
      var cost = unit.kind === "linked" ? 3 : 1;
      if (ids.length + cost > PRIORITY_RUN_LENGTH) return;
      var chosen = unit.concepts.map(function (concept) {
        var question = chooseQuestion(courseId, concept.id, null, ids) || questionSurfaces(courseId, concept.id)[0];
        return question || null;
      }).filter(Boolean);
      if (!chosen.length) return;

      if (unit.kind === "isolated") {
        ids.push(chosen[0].id);
        isolatedNames.push(unit.concepts[0].name);
        return;
      }

      var joint = linkSurface(courseId, unit.concepts[0].id, unit.concepts[1].id, ids.concat(chosen.map(function (q) { return q.id; })));
      /* Without a joint surface there is nothing to check, so the pair is not claimed
       * as linked — the two are simply practised, and reported as standing alone. */
      if (!joint) {
        chosen.forEach(function (question) { ids.push(question.id); });
        unit.concepts.forEach(function (concept) { isolatedNames.push(concept.name); });
        return;
      }
      chosen.forEach(function (question) { ids.push(question.id); });
      ids.push(joint.id);
      linkChecks[joint.id] = unit.concepts.map(function (concept) { return concept.name; });
      linkedNames.push(unit.concepts[0].name + " + " + unit.concepts[1].name);
    });

    var firstPriority = targets.length ? conceptPriority(courseId, targets[0]) : null;
    var shape = [];
    if (linkedNames.length) shape.push(linkedNames.length === 1 ? "one linked pair" : linkedNames.length + " linked pairs");
    if (isolatedNames.length) shape.push(isolatedNames.length === 1 ? "one on its own" : isolatedNames.length + " on their own");
    var kicker = firstPriority ? "Starts here because " + firstPriority.reason : "Based on your concept evidence";
    if (shape.length) kicker += " · " + shape.join(", ");

    session = createSession(courseId, {
      kind: "priority",
      title: "Focused practice",
      kicker: kicker,
      linkChecks: linkChecks,
      isolatedConceptNames: isolatedNames
    }, ids);
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function resumeActive() {
    if (!profile.active) return;
    session = clone(profile.active);
    if (!session.blockId) {
      session.blockId = "block-" + Date.now().toString(36) + "-" + String(profile.blockSequence = (profile.blockSequence || 0) + 1);
      profile.active = clone(session);
      saveProfile();
    }
    profile.selectedCourse = session.courseId;
    beginPractice();
  }

  function beginPractice() {
    selected = session.selected;
    confidence = session.confidence || null;
    renderPracticeShell();
    renderQuestion();
    showScreen("practice-screen");
  }

  function currentItem() { return session.queue[session.index]; }
  function currentQuestion() { return getQuestion(session.courseId, currentItem().id); }

  function isRevisionSprint(value) {
    return Boolean(value) && ["confidence-sprint", "final-sprint", "paper-pattern"].indexOf(value.kind) >= 0;
  }

  function shouldAskConfidence(question, item) {
    if (question.type === "primer" || question.type === "lesson" || question.type === "written-repair") return false;
    /* Eight questions and immediate teaching is the Speedrun's entire time budget.
       Confidence sampling remains in Learn and the full mock analysis; it is not a
       ninth interaction repeated eight times here. */
    if (isRevisionSprint(session) || session.kind === "module-chamber") return false;
    if (typeof item.askConfidence === "boolean") return item.askConfidence;
    var attempts = attemptsFor(session.courseId, question.conceptId).filter(function (attempt) { return attempt.scored !== false; });
    var latest = attempts[attempts.length - 1];
    var usedFamilies = attempts.map(function (attempt) { return attempt.variantFamily || attempt.questionId; });
    var newFamily = usedFamilies.indexOf(question.variantFamily || question.id) < 0;
    var highValue = question.boss || question.type === "short-answer" || ["confident-error", "misconception-repair", "low-confidence-correct", "uncertain-error"].indexOf(item.reason) >= 0;
    var delayed = latest && Date.now() - latest.at >= 20 * 60 * 60 * 1000;
    var firstDiagnostic = !attempts.length;
    var sampledTransfer = newFamily && stableQuestionOrder(question.id + session.blockId) % 100 < 30;
    item.askConfidence = !!(highValue || delayed || firstDiagnostic || sampledTransfer);
    return item.askConfidence;
  }

  function confidenceReady() {
    return !shouldAskConfidence(currentQuestion(), currentItem()) || !!confidence;
  }

  function renderPracticeShell() {
    $("practice-screen").classList.toggle("is-final-sprint", session.kind === "final-sprint");
    $("practice-screen").classList.toggle("is-paper-pattern", session.kind === "paper-pattern");
    $("practice-screen").classList.toggle("is-module-chamber", session.kind === "module-chamber");
    $("practice-kicker").textContent = session.kicker;
    $("practice-title").textContent = getCourse(session.courseId).shortTitle + " · " + session.title;
    $("leave-practice").textContent = session.kind === "confidence-sprint" ? "← Save and return to Speedruns" : session.kind === "final-sprint" ? "← Save and return to Minis" : session.kind === "paper-pattern" ? "← Save and return to BRGSA patterns" : session.kind === "module-chamber" ? "← Save and return to module " + session.studyModule : "← Save and return home";
    $("leave-practice").setAttribute("aria-label", session.kind === "module-chamber" ? "Save and return to Study module " + session.studyModule : $("leave-practice").textContent.replace(/^←\s*/, ""));
    $("leave-practice").classList.toggle("to-mocks", isRevisionSprint(session));
    $("leave-practice").classList.toggle("to-study", session.kind === "module-chamber");
    var dueBox = document.querySelector(".due-box");
    if (dueBox) dueBox.hidden = isRevisionSprint(session) || session.kind === "module-chamber";
    renderTopicList();
    updatePracticeProgress();
  }

  function renderTopicList() {
    var holder = $("topic-list");
    holder.innerHTML = "";
    if (isRevisionSprint(session)) {
      session.queue.forEach(function (item, index) {
        var question = getQuestion(session.courseId, item.id);
        var li = document.createElement("li");
        var patternStep = session.kind === "paper-pattern" ? paperPatternStep(question.id) : null;
        li.textContent = patternStep ? "M" + question.module + " · " + patternStep.label : "M" + question.module + " · " + question.node;
        if (index === session.index) li.className = "active";
        else if (index < session.index) li.className = "done";
        holder.appendChild(li);
      });
      return;
    }
    var conceptIds = unique(session.queue.reduce(function (values, item) {
      var question = getQuestion(session.courseId, item.id);
      return values.concat([question.conceptId].concat(question.supportingConceptIds || []));
    }, []));
    var answeredIds = unique(session.responses.reduce(function (values, response) { return values.concat(response.conceptIds || [response.conceptId]); }, []));
    var currentConceptId = session.index < session.queue.length ? currentQuestion().conceptId : null;
    conceptIds.forEach(function (conceptId) {
      var concept = getConcept(session.courseId, conceptId);
      var li = document.createElement("li");
      li.textContent = concept ? concept.name : getQuestion(session.courseId, session.queue.filter(function (item) { return getQuestion(session.courseId, item.id).conceptId === conceptId; })[0].id).node;
      if (conceptId === currentConceptId) li.className = "active";
      else if (answeredIds.indexOf(conceptId) >= 0) li.className = "done";
      holder.appendChild(li);
    });
  }

  function courseEvidenceLabel(sourceId, fallbackCourseId, fallbackModule) {
    var match = String(sourceId || "").toUpperCase().match(/^([A-Z][A-Z0-9]*)-M0*(\d+)/);
    if (match) return match[1] + " M" + Number(match[2]);
    if (fallbackModule) return String(fallbackCourseId || "Course") + " M" + Number(fallbackModule);
    return String(fallbackCourseId || "Course");
  }

  function courseEvidenceTagsHtml(sourceIds, fallbackCourseId, fallbackModule) {
    return unique((sourceIds || []).map(function (sourceId) {
      return courseEvidenceLabel(sourceId, fallbackCourseId, fallbackModule);
    })).map(function (label) {
      return "<span class='course-evidence-tag'>" + escapeHtml(label) + "</span>";
    }).join("");
  }

  function renderCourseEvidence(sourceIds, fallbackCourseId, fallbackModule) {
    var holder = $("source-ref");
    var labels = unique((sourceIds || []).map(function (sourceId) {
      return courseEvidenceLabel(sourceId, fallbackCourseId, fallbackModule);
    }));
    holder.innerHTML = "<span class='sr-only'>Course evidence: </span>" + labels.map(function (label) {
      return "<span class='course-evidence-tag'>" + escapeHtml(label) + "</span>";
    }).join("");
    holder.setAttribute("aria-label", "Course evidence: " + labels.join(", "));
  }

  function confidenceMethodFor(question) {
    var type = question.type || "mcq";
    if (type === "numeric") {
      var methods = (NUMERICAL_METHODS[session.courseId] || []).filter(function (method) {
        return Number(method.module) === Number(question.module);
      });
      var questionWords = String([question.node, question.stem, question.explanation].join(" ")).toLowerCase()
        .match(/[a-z]{4,}/g) || [];
      methods.sort(function (left, right) {
        function overlap(method) {
          var text = String([method.title, method.theory].concat(method.steps || []).join(" ")).toLowerCase();
          return unique(questionWords).filter(function (word) { return text.indexOf(word) >= 0; }).length;
        }
        return overlap(right) - overlap(left);
      });
      var method = methods[0] || (NUMERICAL_METHODS[session.courseId] || [])[0];
      if (method) return {
        title: method.title,
        intro: method.theory,
        steps: method.steps.slice(0, 4),
        check: method.checks && method.checks[0]
      };
    }
    if (type === "short-answer") return {
      title: "Build the answer in four moves",
      intro: "A strong short answer is a visible chain from framework to evidence to decision.",
      steps: [
        "Name the exact decision or claim the prompt asks you to make.",
        "Choose the one framework that governs it and state the rule in plain language.",
        "Apply at least one case fact: because this evidence is present, the framework implies this.",
        "Close with the action, trade-off, or missing evidence that follows."
      ],
      check: "If the answer would still read the same with the case facts removed, it has not applied the framework yet."
    };
    if (question.caselet || ["case-cloze", "boss", "match"].indexOf(type) >= 0) return {
      title: "Turn the case into a decision",
      intro: "Do not hunt for a remembered phrase. Reduce the situation to the rule that changes the next action.",
      steps: [
        "State what is being decided, compared, or diagnosed.",
        "Underline the case fact that makes one course idea relevant.",
        "Apply the idea as a because → therefore chain.",
        "Check the tempting alternative: name the fact or rule it contradicts."
      ],
      check: "A defensible choice should use both the course rule and a fact from this exact case."
    };
    return {
      title: "Find the governing distinction",
      intro: "The fastest reliable route is to decide what each option would have to be true about.",
      steps: [
        "Rewrite the task as one decision in your own words.",
        "Recall the shortest usable rule for the named idea.",
        "Test the options against that rule, not against which wording feels familiar.",
        "Before committing, explain why the nearest alternative fails."
      ],
      check: "If two options still look possible, find the single word or condition that separates their rules."
    };
  }

  function confidenceMethodHtml(question, heading) {
    var method = confidenceMethodFor(question);
    return "<p class='confidence-method-title'>" + escapeHtml(heading || method.title) + "</p>" +
      "<p>" + escapeHtml(method.intro) + "</p><ol>" + method.steps.map(function (step) {
        return "<li>" + escapeHtml(step) + "</li>";
      }).join("") + "</ol>" + (method.check ? "<p class='confidence-method-check'><b>Final check:</b> " + escapeHtml(method.check) + "</p>" : "");
  }

  function renderConfidenceGuide(question) {
    var guide = $("confidence-guide");
    var shown = session && session.kind === "confidence-sprint" && question && question.type !== "primer";
    guide.hidden = !shown;
    guide.open = false;
    if (!shown) { $("confidence-guide-body").innerHTML = ""; return; }
    $("confidence-guide-body").innerHTML = confidenceMethodHtml(question);
  }

  function renderQuestion() {
    if (!session || session.index >= session.queue.length) return finishSession();
    var item = currentItem();
    var question = currentQuestion();
    if (question && question.type === "lesson") return renderLesson(question, item);
    if (question && question.type === "written-repair") return renderWrittenRepair(question, item);
    shouldAskConfidence(question, item);
    selected = session.answered ? session.selected : (session.selected === undefined ? null : session.selected);
    confidence = session.answered ? (session.confidence || (session.responses.length && session.responses[session.responses.length - 1].confidence) || null) : (session.confidence || null);
    startResponseTiming(item, question);
    var isPrimer = question.type === "primer";
    $("question-card").classList.remove("is-correct", "is-wrong", "is-primer", "is-lesson");
    $("question-card").classList.toggle("is-primer", isPrimer);
    // Leaving a lesson: restore the question layout the lesson surface hid.
    $("lesson-panel").hidden = true;
    $("task-prompt").hidden = false;
    renderGlossaryBlock(question);
    renderConfidenceGuide(question);
    var focusLabels = (item.writtenFocus || []).map(function (id) { return writtenCriterionLabel(session.courseId, id); });
    /* A joint surface in the weakness route is doing something the learner cannot see
     * from the question alone: checking two gaps against each other. Naming both makes
     * the step legible, and the names come from the pairing that actually happened
     * rather than from anything the question asserts about itself. */
    var linkedPair = (session.linkChecks || {})[question.id];
    $("question-pattern").textContent = isPrimer ? "Predict first"
      : session.kind === "confidence-sprint" ? "Module " + question.module + " · Speedrun"
      : session.kind === "final-sprint" ? "Module " + question.module + " · Mini"
      : session.kind === "paper-pattern" ? "Module " + question.module + " · " + (paperPatternStep(question.id) || {label:"Paper-pattern drill"}).label
      : focusLabels.length ? "Dungeon re-check · " + focusLabels.join(" + ")
      : linkedPair ? "Both together · " + linkedPair.join(" + ")
      : item.isReattempt ? "Re-attempt · new perspective"
      : question.pattern;
    $("question-count").textContent = isPrimer ? "Primer before the next challenge" : "Question " + Math.min(challengePosition(), session.baseCount) + " of " + session.baseCount;
    $("question-node").textContent = question.node;
    var status = conceptStatus(session.courseId, question.conceptId);
    $("question-status").className = "status-pill " + status;
    $("question-status").textContent = STATUS_LABEL[status];
    $("question-title").textContent = question.stem;
    $("source-ref").hidden = false;
    renderCourseEvidence(lectureIdsFor(question), session.courseId);
    $("case-block").hidden = isPrimer || !question.caselet;
    $("caselet").innerHTML = caseParagraphs(question.caselet);
    /* A one-line caselet is a prompt and reads well set large; a full case is a
     * document. At 20px/650 a 537-character IBM case filled two thirds of a
     * 375px screen before the question, so long cases drop to body type. */
    $("caselet").classList.toggle("is-long", String(question.caselet || "").length > 240);
    $("prompt-flow").classList.toggle("has-case", !isPrimer && !!question.caselet);
    renderPrimerPanel(question, item);
    /* The kicker is the one eyebrow a learner actually sees — `.question-meta`, where
     * the pattern line lives, is `display: none` by design so diagnostic metadata does
     * not compete with the question. A joint check has to be named here or it is not
     * named at all: without it the step looks like an ordinary question and the reason
     * two weaknesses were brought together stays invisible. */
    $("task-kicker").textContent = linkedPair ? "Both together · " + linkedPair.join(" + ")
      : session.kind === "confidence-sprint" ? "Apply it"
      : session.kind === "final-sprint" ? "Choose, then check"
      : session.kind === "paper-pattern" ? (paperPatternStep(question.id) || {label:"Choose, then check"}).label
      : question.caselet ? "Then decide"
      : "Your task";
    $("prompt-flow").classList.toggle("has-kicker", !isPrimer && (!!question.caselet || !!linkedPair || session.kind === "paper-pattern"));
    $("feedback").className = "feedback";
    $("feedback").innerHTML = "";
    $("commit-answer").hidden = false;
    // "Check primer" described marking something. Nothing here is checked against a key.
    $("commit-answer").textContent = isPrimer ? "Show me the rule" : question.type === "short-answer" && session.mode === "simulation" ? "Save response" : question.type === "short-answer" && ["confidence-sprint", "module-chamber"].indexOf(session.kind) >= 0 ? "Reveal answer spine" : question.type === "short-answer" && session.subjectiveStage === "grading" ? "Checking with " + writtenAuthorityName() + "…" : question.type === "short-answer" && session.subjectiveStage === "rubric" ? "Compare with exemplar" : writtenGradingApplies(question) ? "Check with " + writtenAuthorityName() : question.type === "short-answer" ? "Review with rubric" : "Check answer";
    $("commit-answer").disabled = !hasCompleteResponse(question) || !confidenceReady() || session.answered || session.subjectiveStage === "grading";
    $("next-question").hidden = true;
    renderResponseControl(question);
    renderConfidenceControl();
    if (session.answered && session.responses.length) renderResolved(question, session.responses[session.responses.length - 1]);
    renderTopicList();
    updatePracticeProgress();
  }

  // Lessons and primers are support, not challenges, so neither advances the
  // "Question N of M" count the learner is pacing themselves against.
  function challengePosition() {
    return session.queue.slice(0, session.index + 1).filter(function (item) {
      var question = getQuestion(session.courseId, item.id);
      return question && question.type !== "primer" && question.type !== "lesson" && question.type !== "written-repair";
    }).length;
  }

  function renderWrittenRepair(question, item) {
    var origin = question.originQuestion;
    var missing = (item.missingCriteria || []).map(function (criterionId) {
      var criterion = (origin.rubric || []).filter(function (candidate) { return candidate.id === criterionId; })[0];
      return criterion || {id:criterionId, label:writtenCriterionLabel(session.courseId, criterionId), description:"Use this criterion explicitly in the next answer."};
    });
    var gaps = (item.gapCodes || []).map(function (code) { return writtenGapDefinition(origin, code); }).filter(Boolean);
    var card = $("question-card");
    card.classList.remove("is-correct", "is-wrong", "is-primer");
    card.classList.add("is-lesson");
    $("question-pattern").textContent = "Dungeon intervention";
    $("question-count").textContent = "Teaching repair before the next written answer";
    $("question-node").textContent = origin.node;
    $("question-status").className = "status-pill lesson";
    $("question-status").textContent = "Repair before re-check";
    $("source-ref").hidden = true;
    $("lesson-panel").hidden = false;
    $("primer-panel").hidden = true;
    $("case-block").hidden = true;
    $("glossary-block").hidden = true;
    $("task-prompt").hidden = true;
    $("options").innerHTML = "";
    $("confidence-check").hidden = true;
    $("feedback").className = "feedback";
    $("feedback").innerHTML = "";
    $("prompt-flow").classList.remove("has-case");
    $("lesson-kicker").innerHTML = "<span>Written application · Dungeon changed the run</span>" + courseEvidenceTagsHtml(lectureIdsFor(origin), session.courseId, origin.module);
    $("lesson-heading").textContent = "Repair: " + (gaps.length ? gaps.map(function (gap) { return gap.label; }) : missing.map(function (criterion) { return criterion.label; })).join(" + ");
    $("lesson-objective").innerHTML = "<b>Why this appeared:</b> The accepted practice judgement identified " + escapeHtml(gaps.length === 1 ? "this answer gap" : "these answer gaps") + ". Dungeon will check the same move in fresh wording or a fresh case.";
    $("lesson-body").innerHTML = (gaps.length ? gaps.map(function (gap) {
      return "<p><b>" + escapeHtml(gap.kind === "misunderstood" ? "Misunderstood · " : "Missed · ") + escapeHtml(gap.label) + ".</b> " + escapeHtml(gap.repair) + "</p>";
    }) : missing.map(function (criterion) {
      var move = criterion.id === "understanding"
        ? "State the governing course idea in plain language, then show what that idea changes in this case. Naming a term alone is not application."
        : criterion.id === "judgement"
          ? "Use Decision → case fact → implication. A fact supports a judgement only when you explain why it makes the decision stronger, weaker, safer, or riskier."
          : criterion.description;
      return "<p><b>" + escapeHtml(criterion.label) + ".</b> " + escapeHtml(move) + "</p>";
    })).join("") + "<p><b>Course anchor.</b> " + escapeHtml(origin.explanation) + "</p>";
    $("lesson-worked").innerHTML = origin.writtenMode === "short"
      ? "<p class='worked-head'>Build the next short answer</p><p><b>1. Idea.</b> Explain the governing idea in plain language.</p><p><b>2. Use.</b> Name the decision it should change and why.</p>"
      : "<p class='worked-head'>Build the next case answer</p><p><b>1. Idea.</b> State the governing course idea.</p><p><b>2. Decision.</b> Say what should be done.</p><p><b>3. Because.</b> Point to the decisive case fact and explain its implication.</p>";
    $("lesson-glossary").innerHTML = "";
    $("lesson-connects").textContent = "This repair is unscored and creates no Strong evidence. The next authored prompt checks whether the writing move transfers.";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = "Use this in the next answer <span aria-hidden='true'>→</span>";
    $("question-help").textContent = "Dungeon inserted this support because a criterion was open; it is not another mark.";
    session.answered = true;
    profile.active = clone(session);
    saveProfile();
    renderTopicList();
    updatePracticeProgress();
    $("lesson-heading").focus({preventScroll:true});
  }

  /* The lesson surface. It teaches and then gets out of the way: no options, no
   * confidence prompt, no correctness, and no evidence. Reading it is not an
   * achievement to be scored — it is the precondition for the questions that
   * follow being answerable at all. */
  function renderLesson(question, item) {
    var data = question.lesson;
    var card = $("question-card");
    card.classList.remove("is-correct", "is-wrong", "is-primer");
    card.classList.add("is-lesson");
    var reteach = Boolean(item && item.reteach);
    $("question-pattern").textContent = reteach ? "Lesson · again" : "Lesson";
    $("question-node").textContent = data.title;
    $("question-status").className = "status-pill lesson";
    $("question-status").textContent = reteach ? "Back because you needed it" : "Teaching first";
    $("source-ref").hidden = true;

    $("lesson-panel").hidden = false;
    $("primer-panel").hidden = true;
    $("case-block").hidden = true;
    $("glossary-block").hidden = true;
    $("task-prompt").hidden = true;
    $("options").innerHTML = "";
    $("confidence-check").hidden = true;
    $("feedback").className = "feedback";
    $("feedback").innerHTML = "";
    $("prompt-flow").classList.remove("has-case");

    /* Where this lesson sits in THIS RUN, not in the module file.
     *
     * `data.order` is the lecture's position inside its module, so the first lesson
     * of the first study set was headed "Module 1 · lesson 5" and a learner reading
     * carefully went looking for lessons 1 to 4. They do not exist as far as he is
     * concerned: the course has fifty-odd lectures per subject and the bank cites
     * sixteen, so the numbers are necessarily sparse. The sparse number is still
     * worth printing — it is how you find the lecture in the real course — but it
     * cannot be the headline, because as a headline it reads as a gap. */
    var lessonItems = session.queue.filter(function (entry) { return entry.lesson; });
    var lessonPlace = lessonItems.map(function (entry) { return entry.lectureId; }).indexOf(data.lectureId) + 1;
    $("lesson-kicker").innerHTML = "<span>" +
      (lessonPlace > 0 ? "Lesson " + lessonPlace + " of " + lessonItems.length + " in this run · " : "") +
      "module " + escapeHtml(data.module) + ", lecture " + escapeHtml(data.order) +
      (reteach ? " · you have read this before" : item && item.previousConceptId ? " · builds on what you just did" : "") + "</span>" +
      courseEvidenceTagsHtml([data.lectureId], session.courseId, data.module);
    $("lesson-heading").textContent = data.title;
    $("lesson-objective").innerHTML = "<b>After this you can:</b> " + escapeHtml(data.objective);
    $("lesson-body").innerHTML = (data.explainer || []).map(function (paragraph) {
      return "<p>" + escapeHtml(paragraph) + "</p>";
    }).join("");

    var worked = data.worked;
    $("lesson-worked").innerHTML = worked
      ? "<p class='worked-head'>Worked through</p>" +
        "<p><b>Situation.</b> " + escapeHtml(worked.setup) + "</p>" +
        "<p><b>Move.</b> " + escapeHtml(worked.move) + "</p>" +
        "<p><b>Why.</b> " + escapeHtml(worked.because) + "</p>"
      : "";

    $("lesson-glossary").innerHTML = (data.glossary || []).length
      ? "<p class='glossary-head'>Words this lecture introduces</p><dl>" + (data.glossary || []).map(function (entry) {
          return "<dt>" + escapeHtml(entry.term) + "</dt><dd>" + escapeHtml(entry.plain) + "</dd>";
        }).join("") + "</dl>"
      : "";

    $("lesson-connects").innerHTML = lessonHandoffHtml(data, item);

    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = (reteach ? "Read again" : "I have read this") + " <span aria-hidden='true'>→</span>";
    /* A lesson that reappears without saying why reads as the app losing track of
       you. It is here because the evidence asked for it, so it says that. */
    $("question-help").textContent = reteach
      ? "Nothing here is scored. This lecture is back because your last answer on it was wrong — the question after it comes from here."
      : "Nothing here is scored. The questions after it use these words.";

    // Reading is recorded immediately: the learner has been shown the material,
    // and the queue must not re-teach it on resume.
    markLessonRead(data.lectureId);
    session.answered = true;

    renderTopicList();
    updatePracticeProgress();
    $("lesson-heading").focus({preventScroll: true});
  }

  /* A lesson's closing handoff, made true of the run the learner is actually in.
   *
   * Every lesson ends by pointing forward, and twelve of BRGSA's fifteen handoffs
   * and two of IBM's name "the next lecture" specifically
   * (tools/measure-lesson-handoffs.js). The bank cites 16 lectures where BRGSA has
   * 50 authored, so the lecture being promised is usually one no run will ever
   * deliver: "The next lecture is the cheapest one: the smoke test" is followed by
   * pre-sales, and IBM's "The next lecture sorts them" is followed by lecture 7 —
   * whose skipped material was then examined for ten marks.
   *
   * The delivered order is not the problem and was fixed separately (0 descents
   * over 40 sets). The problem is the sentence, and it cannot be fixed by rewriting
   * it: a priority run, a study set and the sweep deliver different subsets, so no
   * fixed sentence is true of all of them. It has to be computed against this run.
   *
   * Two readers stopped and went back convinced they had skipped something. Neither
   * had. That is the cost being paid — not a wrong fact, but a learner losing trust
   * in the sequence, which is the one thing a step-by-step course cannot afford. */
  var PROMISES_NEXT_LECTURE = /\bthe next lecture\b|\bnext lecture\b|\bthe next one\b/i;

  /* The decision, separated from the markup so the persona harness can read exactly
     what a learner is told without a second copy of the rule. `nextLectureId` is the
     next LESSON in this run, or null when the lecture is followed by its questions. */
  function lessonHandoff(data, nextLectureId) {
    var connects = String(data.connects || "");
    var nextData = nextLectureId ? lessonFor(nextLectureId) : null;

    /* Is the promised lecture the one arriving? The course's own next authored
       lecture is the one the prose means; anything else falsifies it. */
    var promises = PROMISES_NEXT_LECTURE.test(connects);
    var courseNext = null;
    if (promises) {
      var here = lectureTeachingRank(data.lectureId);
      Object.keys(LESSONS).forEach(function (lectureId) {
        if (String(lectureId).indexOf(String(data.lectureId).split("-")[0] + "-") !== 0) return;
        var rank = lectureTeachingRank(lectureId);
        if (rank > here && (courseNext === null || rank < lectureTeachingRank(courseNext))) courseNext = lectureId;
      });
    }
    var kept = !promises || (nextLectureId && nextLectureId === courseNext);
    return {
      connects: connects,
      promisesNextLecture: promises,
      kept: !!kept,
      /* Said rather than hidden. The sentence is the lecture's own and is true of
         the course; it is this run that departs from it, and a learner who has been
         told that can stop looking for the lecture they did not miss. */
      note: (promises && !kept)
        ? "That is the course's order. This run does not follow it here — it delivers only the lectures your questions rest on" +
          (courseNext && LESSONS[courseNext] ? ", so " + LESSONS[courseNext].title + " is not part of it." : ".")
        : null,
      nextInRun: nextData ? nextData.title : "the questions this lecture answers"
    };
  }

  function lessonHandoffHtml(data, item) {
    var queue = (session && session.queue) || [];
    var position = queue.indexOf(item);
    var nextLectureId = null;
    for (var i = position + 1; i >= 0 && i < queue.length; i++) {
      if (queue[i].lesson) { nextLectureId = queue[i].lectureId; break; }
    }
    var handoff = lessonHandoff(data, nextLectureId);
    var html = handoff.connects
      ? "<p class='lesson-connects-body" + (handoff.kept ? "" : " is-superseded") + "'>" + escapeHtml(handoff.connects) + "</p>"
      : "";
    if (handoff.note) html += "<p class='lesson-handoff-note'>" + escapeHtml(handoff.note) + "</p>";
    html += "<p class='lesson-handoff-next'><b>Next in this run:</b> " + escapeHtml(handoff.nextInRun) + "</p>";
    return html;
  }

  /* On a scored question, the lecture's glossary stays one disclosure away. A
   * learner who met "MDE" once should not have to abandon the question to
   * recover what it meant. */
  function renderGlossaryBlock(question) {
    var block = $("glossary-block");
    var terms = [];
    lectureIdsFor(question).forEach(function (lectureId) {
      var data = lessonFor(lectureId);
      if (data) terms = terms.concat(data.glossary || []);
    });
    if (!terms.length) {
      block.hidden = true;
      return;
    }
    block.hidden = false;
    $("glossary-summary").textContent = "Terms used here (" + terms.length + ")";
    $("glossary-list").innerHTML = terms.map(function (entry) {
      return "<dt>" + escapeHtml(entry.term) + "</dt><dd>" + escapeHtml(entry.plain) + "</dd>";
    }).join("");
  }

  function primerLevelOf(item) {
    return Math.max(1, Math.min(3, item.primerLevel || 1));
  }

  /* Before the learner commits, this panel carries the situation and nothing that
   * names the rule. It used to open with "Know this: <primerFact>" — the exact string
   * the question then asked them to pick out of four options (LAW-63). The principle
   * now lives in `renderPrimerReveal`, on the other side of their own answer. */
  function renderPrimerPanel(question, item) {
    var panel = $("primer-panel");
    var visible = question.type === "primer";
    panel.hidden = !visible;
    if (!visible) return;
    var level = primerLevelOf(item);
    $("primer-level").textContent = level === 1 ? "First contact · predict before you are told"
      : level === 2 ? "Primer returning · predict again"
      : "Primer strengthened · this one has caught you before";
    var parts = [];
    if (item.previousConceptId) {
      var previous = getConcept(session.courseId, item.previousConceptId);
      if (previous) parts.push("<p class='primer-carry'><b>Carry forward:</b> " + escapeHtml(previous.name) + ". Now apply " + escapeHtml(question.node) + ".</p>");
    }
    if (question.primerCase) parts.push("<p><b>What happens:</b> " + escapeHtml(question.primerCase) + "</p>");
    /* At the strengthened level the learner has already missed this concept, so the
     * trap is named up front. It is a warning about a wrong reading, not the right
     * one, so it still gives away nothing the prediction is for. */
    if (level >= 3) parts.push("<p class='primer-trap'><b>Last time this looked like:</b> " + escapeHtml(question.primerMisconception) + "</p>");
    $("primer-content").innerHTML = parts.join("");
  }

  /* One prediction, in the learner's own words, before anything names the rule.
   *
   * Nothing here is marked. A prediction that misses is what makes the reveal land, so
   * there is no answer key, no score, and no evidence — which is also why it can ask
   * for reasoning at first contact, when a keyed question could only ask for recall of
   * something never taught. */
  function renderPrediction(question) {
    var holder = prepareResponseHolder("prediction-options");
    var label = document.createElement("label");
    label.className = "prediction-label";
    label.innerHTML = "<span>Your prediction</span><small>Nothing here is marked or recorded as evidence. Being wrong is useful — committing to a guess is what makes the answer stick.</small>";
    var textarea = document.createElement("textarea");
    textarea.setAttribute("aria-label", "What rule do you think this case shows");
    textarea.placeholder = "I think the rule is… because in this case…";
    textarea.value = typeof selected === "string" ? selected : "";
    textarea.disabled = !!session.answered;
    textarea.addEventListener("input", function () {
      selected = textarea.value;
      session.selected = selected;
      updateCommitState();
    });
    label.appendChild(textarea);
    holder.appendChild(label);
    /* Every other response control writes this line, so a primer that did not inherited
     * whatever the previous surface left — on a first run that is the lesson's "the
     * questions after it use these words", describing something else entirely. */
    $("question-help").textContent = "There is no right answer to match. Commit to a guess, then the rule appears next to it.";
    if (session.answered) return;
    var skip = document.createElement("button");
    skip.type = "button";
    skip.className = "button secondary compact prediction-skip";
    skip.textContent = "I would be guessing — just show me";
    skip.addEventListener("click", function () {
      session.primerSkipped = true;
      selected = typeof selected === "string" ? selected : "";
      commitAnswer();
    });
    holder.appendChild(skip);
  }

  function hasCompleteResponse(question) {
    if (question.type === "short-answer") return session.subjectiveStage === "rubric" ? true : typeof selected === "string" && selected.trim().length >= 20;
    /* A primer has no keyed answer, so "complete" means a prediction was committed to,
     * or the learner said out loud that they would be guessing. Both reveal the same
     * material; only one of them claims a prediction was made. */
    if (question.type === "primer") return Boolean(session.primerSkipped) || (typeof selected === "string" && selected.trim().length > 0);
    if (question.type === "mcq" || !question.type) return typeof selected === "number";
    /* MSQ: any selection is a complete response. Selecting nothing is not — under
     * the paper's marking a blank scores zero either way, but committing an empty
     * answer is almost always a mis-click rather than a decision. */
    if (question.type === "msq") return Array.isArray(selected) && selected.length > 0;
    if (question.type === "numeric") return parseNumericEntry(selected) !== null;
    var count = question.type === "boss" ? question.steps.length : question.type === "match" ? question.rows.length : question.blanks.length;
    return Array.isArray(selected) && selected.length === count && selected.every(function (value) { return typeof value === "number" && value >= 0; });
  }

  function updateCommitState() {
    if (!session || session.answered) return;
    $("commit-answer").disabled = !hasCompleteResponse(currentQuestion()) || !confidenceReady() || session.subjectiveStage === "grading";
    renderConfidenceControl();
  }

  function renderResponseControl(question) {
    if (question.type === "primer") return renderPrediction(question);
    if (question.type === "short-answer") return renderShortAnswer(question);
    if (question.type === "cloze" || question.type === "case-cloze") return renderCloze(question);
    if (question.type === "match") return renderMatch(question);
    if (question.type === "boss") return renderBoss(question);
    if (question.type === "msq") return renderMultiOptions(question);
    if (question.type === "numeric") return renderNumeric(question);
    renderOptions(question);
  }

  function prepareResponseHolder(className) {
    var holder = $("options");
    holder.innerHTML = "";
    holder.className = "options " + className;
    holder.removeAttribute("role");
    holder.removeAttribute("aria-label");
    return holder;
  }

  /* Multiple-select, for SPMS Section B.
   *
   * Exactly two options are correct and the paper allows at most two selections.
   * The mark is 2 for the exact pair, 1 for one correct option with no wrong one,
   * and 0 once any wrong option is selected. The control reproduces the real
   * uncheck-or-clear behaviour instead of letting a learner tick a third option. */
  function msqSelection() {
    return Array.isArray(selected) ? selected : [];
  }

  function scorePTypeSelection(chosen, answers) {
    chosen = Array.isArray(chosen) ? chosen : [];
    answers = Array.isArray(answers) ? answers : [];
    var right = chosen.filter(function (index) { return answers.indexOf(index) >= 0; }).length;
    var wrong = chosen.length - right;
    return {awarded: wrong ? 0 : right >= 2 ? 2 : right === 1 ? 1 : 0, right:right, wrong:wrong};
  }

  function renderMultiOptions(question) {
    var holder = prepareResponseHolder("msq-options");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", "P-type question: select up to two options");
    var chosen = msqSelection();
    var answers = question.answers || [];
    question.options.forEach(function (copy, index) {
      var picked = chosen.indexOf(index) >= 0;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "option option-multi";
      button.setAttribute("role", "checkbox");
      button.setAttribute("aria-checked", String(picked));
      button.disabled = !!session.answered || (!picked && chosen.length >= 2);
      button.classList.toggle("selection-locked", !session.answered && !picked && chosen.length >= 2);
      button.innerHTML = "<span class='option-box' aria-hidden='true'></span><span>" + escapeHtml(copy) + "</span>";
      if (session.answered && session.mode !== "simulation") {
        var isAnswer = answers.indexOf(index) >= 0;
        if (isAnswer) button.classList.add("correct");
        if (picked && !isAnswer) button.classList.add("wrong");
        if (!picked && isAnswer) button.classList.add("missed");
      }
      button.addEventListener("click", function () { toggleOption(index); });
      holder.appendChild(button);
    });
    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "button quiet compact msq-clear";
    clear.textContent = "Clear response";
    clear.disabled = !!session.answered || !chosen.length;
    clear.addEventListener("click", clearMsqResponse);
    holder.appendChild(clear);
    $("question-help").textContent = "Exactly two options are correct. Select at most two: both correct = 2 marks; one correct and no wrong option = 1; any wrong option = 0. Uncheck or clear before changing a full pair.";
  }

  function toggleOption(index) {
    if (!session || session.answered) return;
    var chosen = msqSelection().slice();
    var at = chosen.indexOf(index);
    if (at >= 0) chosen.splice(at, 1);
    else if (chosen.length < 2) chosen.push(index);
    else return;
    chosen.sort(function (a, b) { return a - b; });
    selected = chosen;
    session.selected = chosen;
    $all(".option-multi").forEach(function (button, optionIndex) {
      var picked = chosen.indexOf(optionIndex) >= 0;
      button.setAttribute("aria-checked", String(picked));
      button.disabled = !picked && chosen.length >= 2;
      button.classList.toggle("selection-locked", !picked && chosen.length >= 2);
    });
    var clear = document.querySelector(".msq-clear");
    if (clear) clear.disabled = !chosen.length;
    updateCommitState();
    saveProfile();
  }

  function clearMsqResponse() {
    if (!session || session.answered) return;
    selected = [];
    session.selected = [];
    $all(".option-multi").forEach(function (button) {
      button.setAttribute("aria-checked", "false");
      button.disabled = false;
      button.classList.remove("selection-locked");
    });
    var clear = document.querySelector(".msq-clear");
    if (clear) clear.disabled = true;
    updateCommitState();
    saveProfile();
  }

  function renderOptions(question) {
    var holder = prepareResponseHolder("mcq-options");
    holder.setAttribute("role", "radiogroup");
    holder.setAttribute("aria-label", "Answer options");
    question.options.forEach(function (copy, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(selected === index));
      button.tabIndex = selected === index || (selected === null && index === 0) ? 0 : -1;
      button.disabled = !!session.answered;
      button.innerHTML = "<span class='option-key'>" + String.fromCharCode(65 + index) + "</span><span>" + escapeHtml(copy) + "</span>";
      if (session.answered && session.mode !== "simulation") {
        if (index === question.answer) button.classList.add("correct");
        if (selected === index && selected !== question.answer) button.classList.add("wrong");
      }
      button.addEventListener("click", function () { selectOption(index); });
      holder.appendChild(button);
    });
    $("question-help").textContent = "Keyboard: 1–" + question.options.length + " or arrow keys to choose";
  }

  function selectOption(index) {
    if (!session || session.answered) return;
    selected = index;
    session.selected = index;
    $all(".option").forEach(function (button, optionIndex) {
      button.setAttribute("aria-checked", String(optionIndex === index));
      button.tabIndex = optionIndex === index ? 0 : -1;
    });
    session.selected = selected;
    updateCommitState();
  }

  // A native select popup is sized by the operating system, so prose-length options overflow the
  // card and run off screen. Anything beyond a short phrase becomes wrapping choice cards instead.
  var LONG_OPTION_CHARS = 60;
  var liftedLabel = null;
  var matchLabels = [];
  var matchAnswerRows = [];
  var choiceGroupSeq = 0;

  function hasLongOptions(options) {
    return (options || []).some(function (copy) { return String(copy).length > LONG_OPTION_CHARS; });
  }

  function renderChoiceGroup(container, options, partIndex, groupLabel, correctAnswer) {
    var group = document.createElement("div");
    group.className = "choice-group";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", groupLabel);
    var name = "choice-" + (choiceGroupSeq += 1);
    (options || []).forEach(function (copy, index) {
      var choice = document.createElement("label");
      var input = document.createElement("input");
      var key = document.createElement("span");
      var text = document.createElement("span");
      var chosen = Array.isArray(selected) && selected[partIndex] === index;
      choice.className = "choice";
      input.type = "radio";
      input.name = name;
      input.value = String(index);
      input.checked = chosen;
      input.disabled = !!session.answered;
      key.className = "option-key";
      key.textContent = String.fromCharCode(65 + index);
      text.textContent = copy;
      if (session.answered && session.mode !== "simulation") {
        if (index === correctAnswer) choice.classList.add("correct");
        if (chosen && index !== correctAnswer) choice.classList.add("wrong");
      }
      input.addEventListener("change", function () {
        if (!input.checked) return;
        selectResponsePart(partIndex, index);
        var slot = $all(".blank-slot")[partIndex];
        if (slot) slot.classList.add("filled");
      });
      choice.appendChild(input);
      choice.appendChild(key);
      choice.appendChild(text);
      group.appendChild(choice);
    });
    container.appendChild(group);
    return group;
  }

  // Inverted match board. Statements sit side by side, each with a slot underneath, and the unused
  // labels wait in a tray docked to the bottom of the board. The part index is still the row, so
  // stored responses, grading, and the answer review keep the row-first shape.
  function renderMatchBoard(question, labels, holder) {
    liftedLabel = null;
    var board = document.createElement("div");
    var columns = document.createElement("div");
    var tray = document.createElement("div");
    var trayLabel = document.createElement("p");
    var trayItems = document.createElement("div");
    board.className = "match-board";
    columns.className = "match-columns";
    // One row, one column per statement: the comparison is the task, so they must be side by side.
    // The count lives on the board so the tray can share the same column track as the
    // statements above it — a tablet then sits directly under the slot it can fill,
    // and every tablet is the same width instead of sized by its own text.
    board.style.setProperty("--statement-count", String(question.choices.length));
    tray.className = "match-tray";
    trayLabel.className = "tray-label";
    trayItems.className = "tray-items";
    tray.appendChild(trayLabel);
    tray.appendChild(trayItems);

    question.choices.forEach(function (statement, choiceIndex) {
      var column = document.createElement("div");
      var index = document.createElement("span");
      var text = document.createElement("p");
      var slot = document.createElement("button");
      column.className = "match-column";
      // Statements are numbered and labels are lettered, so the task reads as
      // "put a letter under each number" instead of four equally weighted blocks
      // with no stated order to work through them.
      index.className = "statement-index";
      index.setAttribute("aria-hidden", "true");
      index.textContent = String(choiceIndex + 1);
      text.className = "match-statement";
      text.textContent = statement;
      slot.type = "button";
      slot.className = "match-slot";
      slot.dataset.choiceIndex = String(choiceIndex);
      slot.disabled = !!session.answered;
      slot.addEventListener("click", function () { dropOnSlot(choiceIndex); });
      slot.addEventListener("dragover", function (event) { if (liftedLabel !== null) event.preventDefault(); });
      slot.addEventListener("drop", function (event) { event.preventDefault(); dropOnSlot(choiceIndex); });
      column.appendChild(index);
      column.appendChild(text);
      column.appendChild(slot);
      columns.appendChild(column);
    });

    board.appendChild(columns);
    board.appendChild(tray);
    holder.appendChild(board);
    matchLabels = labels;
    matchAnswerRows = question.choices.map(function (_, choiceIndex) {
      var correctRow = null;
      question.rows.forEach(function (row, rowIndex) { if (row.answer === choiceIndex) correctRow = rowIndex; });
      return correctRow;
    });
    syncMatchBoard();
  }

  function labelTablet(rowIndex, inSlot) {
    var tablet = document.createElement(inSlot ? "span" : "button");
    var key = document.createElement("span");
    var text = document.createElement("span");
    tablet.className = "label-tablet" + (liftedLabel === rowIndex ? " lifted" : "");
    key.className = "option-key";
    key.textContent = String.fromCharCode(65 + rowIndex);
    text.textContent = matchLabels[rowIndex];
    tablet.appendChild(key);
    tablet.appendChild(text);
    if (inSlot) return tablet;
    tablet.type = "button";
    tablet.dataset.rowIndex = String(rowIndex);
    tablet.disabled = !!session.answered;
    tablet.setAttribute("aria-pressed", String(liftedLabel === rowIndex));
    tablet.setAttribute("aria-label", matchLabels[rowIndex] + ". Choose this label, then choose the statement it belongs to.");
    if (!session.answered) tablet.draggable = true;
    tablet.addEventListener("click", function () {
      liftedLabel = liftedLabel === rowIndex ? null : rowIndex;
      syncMatchBoard();
    });
    tablet.addEventListener("dragstart", function (event) {
      liftedLabel = rowIndex;
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      syncMatchBoard();
    });
    tablet.addEventListener("dragend", function () { syncMatchBoard(); });
    return tablet;
  }

  function dropOnSlot(choiceIndex) {
    if (session.answered) return;
    var occupant = selected.indexOf(choiceIndex);
    if (liftedLabel === null) {
      // An empty slot with nothing in hand does nothing; a full one returns its label to the tray.
      if (occupant >= 0) { selected[occupant] = null; commitMatchSelection(); }
      return;
    }
    if (occupant >= 0 && occupant !== liftedLabel) selected[occupant] = null;
    selected[liftedLabel] = choiceIndex;
    liftedLabel = null;
    commitMatchSelection();
  }

  function commitMatchSelection() {
    session.selected = selected.slice();
    syncMatchBoard();
    updateCommitState();
  }

  function syncMatchBoard() {
    var trayItems = document.querySelector(".match-tray .tray-items");
    var trayLabel = document.querySelector(".match-tray .tray-label");
    if (!trayItems) return;
    var resolved = session.answered && session.mode !== "simulation";
    $all(".match-slot").forEach(function (slot) {
      var choiceIndex = Number(slot.dataset.choiceIndex);
      var holderRow = selected.indexOf(choiceIndex);
      var correctRow = matchAnswerRows[choiceIndex];
      slot.innerHTML = "";
      slot.className = "match-slot" + (holderRow >= 0 ? " filled" : "") + (liftedLabel !== null && !session.answered ? " ready" : "");
      if (holderRow >= 0) {
        slot.appendChild(labelTablet(holderRow, true));
        slot.setAttribute("aria-label", "Holds " + matchLabels[holderRow] + ". Choose again to take it back.");
      } else {
        var empty = document.createElement("span");
        empty.className = "slot-empty";
        empty.textContent = liftedLabel !== null && !session.answered ? "Place " + String.fromCharCode(65 + liftedLabel) + " here" : "No label yet";
        slot.appendChild(empty);
        slot.setAttribute("aria-label", liftedLabel !== null ? "Empty. Place " + matchLabels[liftedLabel] + " here." : "Empty slot. Choose a label first.");
      }
      if (resolved) {
        slot.classList.add(holderRow === correctRow ? "correct" : "wrong");
        if (holderRow !== correctRow) {
          var truth = document.createElement("small");
          truth.className = "slot-truth";
          truth.textContent = "Belongs to " + matchLabels[correctRow];
          slot.appendChild(truth);
        }
      }
    });
    // Rebuilding the tray destroys the button a keyboard user just activated, so put focus back on
    // the same label if it is still there.
    var focusedRow = document.activeElement && document.activeElement.parentNode === trayItems
      ? document.activeElement.dataset.rowIndex : null;
    trayItems.innerHTML = "";
    var unused = matchLabels.map(function (_, rowIndex) { return rowIndex; })
      .filter(function (rowIndex) { return selected[rowIndex] === null || selected[rowIndex] === undefined; });
    unused.forEach(function (rowIndex) { trayItems.appendChild(labelTablet(rowIndex, false)); });
    if (focusedRow !== null) {
      var restored = trayItems.querySelector("[data-row-index='" + focusedRow + "']");
      if (restored) restored.focus();
    }
    trayLabel.textContent = session.answered ? (unused.length ? "Never placed" : "Every label was placed")
      : unused.length ? "Labels to place · " + unused.length + " left"
      : "Every label is placed";
  }

  function renderChoiceField(holder, label, options, partIndex, correctAnswer) {
    var field = document.createElement("div");
    var legend = document.createElement("p");
    field.className = "choice-field";
    legend.className = "choice-legend";
    legend.textContent = label;
    field.appendChild(legend);
    renderChoiceGroup(field, options, partIndex, label, correctAnswer);
    holder.appendChild(field);
    return field;
  }

  function renderSelectOptions(select, options, value) {
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose…";
    placeholder.disabled = true;
    placeholder.selected = typeof value !== "number";
    select.appendChild(placeholder);
    options.forEach(function (copy, index) {
      var option = document.createElement("option");
      option.value = String(index);
      option.textContent = copy;
      option.selected = value === index;
      select.appendChild(option);
    });
  }

  function selectResponsePart(partIndex, value) {
    if (!Array.isArray(selected)) selected = [];
    selected[partIndex] = Number(value);
    session.selected = selected.slice();
    updateCommitState();
  }

  /* Numeric entry, for SCLM Section B.
   *
   * The paper is explicit: enter the requested final numerical answer, marks are
   * awarded for the final answer within a stated grading tolerance, and no marks
   * are given for working. So this surface takes a number and grades it against a
   * tolerance — no options to eliminate, no partial credit for method. A learner
   * who reaches the right approach and fumbles the arithmetic scores zero here,
   * exactly as they would in the hall, which is the point of practising it.
   *
   * Tolerance is per question because the quantities differ in kind: a reorder
   * point in units rounds differently from a cost in rupees or a z-value. */
  function parseNumericEntry(value) {
    // Accept what a learner actually types off a calculator: 1,240 · ₹1240 · 1240.5
    var cleaned = String(value == null ? "" : value).replace(/[₹,\s]/g, "");
    if (!cleaned || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
    var parsed = Number(cleaned);
    return isFinite(parsed) ? parsed : null;
  }

  function renderNumeric(question) {
    var holder = prepareResponseHolder("numeric-entry");
    var label = document.createElement("label");
    label.className = "numeric-label";
    label.innerHTML = "<span>" + escapeHtml(question.prompt || "Your answer") + "</span>" +
      "<small>Enter the final figure only. Working is not marked, here or in the paper.</small>";
    var row = document.createElement("span");
    row.className = "numeric-row";
    var input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.setAttribute("aria-label", question.prompt || "Your numerical answer");
    input.value = typeof selected === "string" ? selected : "";
    input.disabled = !!session.answered;
    input.addEventListener("input", function () {
      selected = input.value;
      session.selected = selected;
      updateCommitState();
    });
    row.appendChild(input);
    if (question.unit) {
      var unit = document.createElement("b");
      unit.className = "numeric-unit";
      unit.textContent = question.unit;
      row.appendChild(unit);
    }
    label.appendChild(row);
    holder.appendChild(label);
    /* A question that needs the table carries it, because the paper hands one over and
       practising the method without the instrument teaches half of it. */
    if (question.reference === "standard-normal") {
      var details = document.createElement("details");
      details.className = "numeric-reference";
      details.innerHTML = "<summary>Standard normal table</summary><div id='learn-normal-table'></div>";
      holder.appendChild(details);
      buildNormalTable("learn-normal-table");
    }
    $("question-help").textContent = question.tolerance
      ? "Marked on the final figure, within ±" + question.tolerance + (question.unit ? " " + question.unit : "") + ". A scientific calculator is allowed in this paper."
      : "Marked on the final figure only.";
  }

  function renderShortAnswer(question) {
    var holder = prepareResponseHolder("short-answer-options");
    if (session.kind === "written-practice") {
      var item = currentItem();
      var focusLabels = (item.writtenFocus || []).map(function (id) { return writtenCriterionLabel(session.courseId, id); });
      var gapLabels = (item.writtenGapFocus || []).map(function (key) {
        var gap = writtenCoursePractice(session.courseId).gaps[key];
        return gap ? gap.label : null;
      }).filter(Boolean);
      var courseRecord = writtenCoursePractice(session.courseId);
      var questionRecord = courseRecord.questions[question.id];
      var plan = document.createElement("div");
      plan.className = "written-plan";
      plan.setAttribute("role", "note");
      plan.innerHTML = focusLabels.length || gapLabels.length
        ? "<b>Dungeon is re-checking: " + escapeHtml((gapLabels.length ? gapLabels : focusLabels).join(" + ")) + "</b><span>This uses fresh wording" + (question.writtenMode === "case" ? " and a case" : "") + ". A successful criterion judgement counts as one transfer confirmation.</span>"
        : "<b>Dungeon chose this prompt</b><span>" + escapeHtml(!questionRecord ? "There is no accepted written answer on this concept yet." : "It is one of your least-recent written prompts on a concept that still benefits from application practice.") + "</span>";
      holder.appendChild(plan);
    }
    var label = document.createElement("label");
    label.className = "short-answer-label";
    label.innerHTML = "<span>Your response</span><small>" + (writtenGradingApplies(question)
      ? (writtenAuthority.provider === "cloudflare-workers-ai"
          ? "Checked by Dungeon Qwen against the cited course lectures. The hosted authority can abstain; its mark is practice guidance, not an official grade."
          : "Checked privately on your machines by " + escapeHtml(writtenAuthority.model || "local Qwen") + " against the cited course lectures. Course evidence is prepared while you write; your answer is sent only when you press Check.")
      : ["confidence-sprint", "module-chamber"].indexOf(session.kind) >= 0
        ? "Say or write a compact answer first. One check reveals the course-grounded spine; this is coached retrieval, not a mark."
        : "Write before opening the rubric. Your wording is not graded by an opaque model.") + "</small>";
    var textarea = document.createElement("textarea");
    textarea.setAttribute("aria-label", "Your constructed response");
    textarea.placeholder = question.writtenMode === "short" ? "Explain the idea and the decision it should change…" : "Make your judgement and explain what in the case supports it…";
    textarea.value = typeof selected === "string" ? selected : "";
    textarea.disabled = !!session.answered || session.subjectiveStage === "rubric" || session.subjectiveStage === "grading";
    textarea.addEventListener("input", function () {
      selected = textarea.value;
      session.selected = selected;
      updateCommitState();
      scheduleWrittenEvidenceWarm(question, textarea.value);
    });
    label.appendChild(textarea);
    holder.appendChild(label);
    /* A standing line wherever free text is collected, not only when something trips
       a detector. Somebody who never types it into the box should still see it. */
    var support = document.createElement("p");
    support.className = "written-support-line";
    support.innerHTML = "Revision is heavy going sometimes. If you are struggling with more than the syllabus, " +
      "<b>Tele-MANAS</b> is free, confidential and open around the clock on " +
      "<a href=\"tel:14416\">14416</a>.";
    holder.appendChild(support);
    if (session.subjectiveStage === "support") {
      var offered = document.createElement("div");
      offered.className = "written-support-response";
      offered.setAttribute("role", "status");
      offered.setAttribute("aria-live", "polite");
      offered.setAttribute("tabindex", "-1");
      offered.innerHTML = "<b>This one is not going to be marked.</b>" +
        "<span>Nothing about it was recorded, and it was not sent anywhere to be checked. " +
        "If you are having a hard time, please talk to someone you trust.</span>" +
        "<span>Tele-MANAS — free, confidential, 24 hours — <a href=\"tel:14416\">14416</a> " +
        "or <a href=\"tel:18008914416\">1800-891-4416</a>.</span>" +
        "<small>Your writing is still in the box. Nothing here has been scored or scheduled.</small>";
      holder.appendChild(offered);
    }
    if (session.subjectiveStage === "grading") {
      var waiting = document.createElement("div");
      waiting.className = "local-grade-wait";
      waiting.setAttribute("role", "status");
      waiting.setAttribute("aria-live", "polite");
      waiting.innerHTML = "<b>Checking the judgement against the course</b><span>" + (writtenAuthority.provider === "cloudflare-workers-ai" ? "Keep this page open while Dungeon Qwen checks the answer." : "The cited evidence was prepared while you wrote; Qwen is now checking the response.") + " If the result loses its source or exact answer evidence, Dungeon will show the rubric instead of issuing a mark.</span><small>One compact Qwen judgement, followed by Dungeon’s citation, schema, and exact-quote checks.</small>";
      holder.appendChild(waiting);
    }
    if (session.localGradeFallback && session.subjectiveStage === "rubric") {
      var fallback = document.createElement("p");
      fallback.className = "local-grade-fallback";
      fallback.textContent = session.localGradeFallback;
      holder.appendChild(fallback);
    }
    var resolvedResponse = session.answered && session.responses.length ? session.responses[session.responses.length - 1] : null;
    if (session.mode !== "simulation" && session.kind !== "confidence-sprint" && session.kind !== "module-chamber" && (session.subjectiveStage === "rubric" || session.answered) && !(resolvedResponse && resolvedResponse.machineGraded)) {
      var rubric = document.createElement("fieldset");
      rubric.className = "rubric-check";
      rubric.id = "subjective-rubric";
      rubric.innerHTML = "<legend>Check your response against the rubric</legend><p>Select only what your answer already contained. The exemplar appears after this step.</p>";
      (question.rubric || []).forEach(function (criterion, index) {
        var criterionLabel = document.createElement("label");
        var input = document.createElement("input");
        input.type = "checkbox";
        input.checked = (session.rubricSelection || []).indexOf(index) >= 0;
        input.disabled = !!session.answered;
        input.addEventListener("change", function () {
          var values = session.rubricSelection || [];
          if (input.checked && values.indexOf(index) < 0) values.push(index);
          if (!input.checked) values = values.filter(function (value) { return value !== index; });
          session.rubricSelection = values;
        });
        var copy = document.createElement("span");
        copy.innerHTML = "<b>" + escapeHtml(criterion.label) + "</b><small>" + escapeHtml(criterion.description) + "</small>";
        criterionLabel.appendChild(input);
        criterionLabel.appendChild(copy);
        rubric.appendChild(criterionLabel);
      });
      holder.appendChild(rubric);
    }
    $("question-help").textContent = session.mode === "simulation" ? "Write at least a short recommendation. The rubric and exemplar appear at the end" : ["confidence-sprint", "module-chamber"].indexOf(session.kind) >= 0 ? "Give the decision and its reason, then reveal the answer spine" : session.subjectiveStage === "grading" ? "Qwen is checking your judgement against the prepared course evidence" : session.subjectiveStage === "rubric" ? "Self-check against the visible criteria, then compare with the exemplar" : writtenGradingApplies(question) ? "The practice mark checks course understanding plus judgement and evidence; it never creates Strong evidence" : "Write at least a short recommendation before reviewing the rubric";
  }

  /* Retrieval depends on the authored question, never on candidate wording. After a
   * learner pauses, the local server can therefore prepare the declared lecture
   * evidence without transmitting a partial draft or judging an unfinished thought. */
  function scheduleWrittenEvidenceWarm(question, draft) {
    if (writtenAuthority.provider !== "local-lm-studio" || String(draft || "").trim().length < 12) return;
    var key = session.courseId + ":" + question.id;
    if (writtenEvidenceWarm[key]) return;
    window.clearTimeout(writtenEvidenceTimer);
    writtenEvidenceTimer = window.setTimeout(function () {
      writtenEvidenceTimer = null;
      if (!session || currentQuestion().id !== question.id || writtenEvidenceWarm[key]) return;
      writtenEvidenceWarm[key] = "pending";
      fetch(WRITTEN_AUTHORITY_ENDPOINT + "/prepare", {
        method:"POST",
        credentials:"same-origin",
        cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({courseId:session.courseId, questionId:question.id})
      }).then(function (response) {
        writtenEvidenceWarm[key] = response.ok ? "ready" : null;
      }).catch(function () { writtenEvidenceWarm[key] = null; });
    }, 900);
  }

  function renderCloze(question) {
    var holder = prepareResponseHolder("cloze-options");
    var blanks = question.blanks || [];
    var longForm = blanks.some(function (blank) { return hasLongOptions(blank.options); });
    var sentence = document.createElement("div");
    sentence.className = "cloze-sentence";
    (question.template || []).forEach(function (copy, index) {
      sentence.appendChild(document.createTextNode(copy));
      var blank = blanks[index];
      if (!blank) return;

      if (longForm) {
        // The sentence keeps its shape; the choosing happens in readable cards below it.
        var slot = document.createElement("span");
        slot.className = "blank-slot";
        slot.textContent = blank.label;
        if (Array.isArray(selected) && typeof selected[index] === "number") slot.classList.add("filled");
        sentence.appendChild(slot);
        return;
      }

      var label = document.createElement("label");
      label.className = "inline-blank";
      var hidden = document.createElement("span");
      hidden.className = "sr-only";
      hidden.textContent = blank.label + ": ";
      var select = document.createElement("select");
      select.disabled = !!session.answered;
      select.setAttribute("aria-label", blank.label);
      renderSelectOptions(select, blank.options, Array.isArray(selected) ? selected[index] : null);
      if (session.answered && session.mode !== "simulation") select.classList.add(Array.isArray(selected) && selected[index] === blank.answer ? "correct" : "wrong");
      select.addEventListener("change", function () { selectResponsePart(index, select.value); });
      label.appendChild(hidden);
      label.appendChild(select);
      sentence.appendChild(label);
    });
    holder.appendChild(sentence);

    if (longForm) {
      blanks.forEach(function (blank, index) {
        renderChoiceField(holder, blank.label, blank.options, index, blank.answer);
      });
    }
    $("question-help").textContent = blanks.length > 1
      ? "Choose every blank before checking"
      : "Choose an answer before checking";
  }

  function renderMatch(question) {
    var labels = question.rows.map(function (row) { return row.label; });
    var longChoices = hasLongOptions(question.choices);
    var longLabels = hasLongOptions(labels);
    // When the answer cards carry the substance, listing all of them under every row makes the
    // learner reread the same paragraphs once per row. Show each statement once instead and let
    // them name the short label it belongs to.
    var inverted = longChoices && !longLabels;
    var holder = prepareResponseHolder("match-options" + (inverted ? " match-invert" : ""));
    var intro = document.createElement("p");
    intro.className = "format-note";
    intro.textContent = inverted
      ? "Each label is used once. Name the one that each statement belongs to."
      : longChoices
        ? "Each answer is used once. Choose one card per row."
        : "Each answer is used once. Keyboard users can complete every row with the select controls.";
    holder.appendChild(intro);
    if (inverted) {
      if (!Array.isArray(selected) || selected.length !== question.rows.length) {
        selected = question.rows.map(function () { return null; });
        session.selected = selected.slice();
      }
      intro.textContent = "Place one label under each statement. Choose a label then a statement, or drag it across.";
      renderMatchBoard(question, labels, holder);
      $("question-help").textContent = "Every statement needs a label before checking";
      return;
    }
    if (longChoices) {
      question.rows.forEach(function (row, index) {
        renderChoiceField(holder, row.label, question.choices, index, row.answer);
      });
      $("question-help").textContent = "Complete all matching rows before checking";
      return;
    }
    question.rows.forEach(function (row, index) {
      var label = document.createElement("label");
      label.className = "match-row";
      var prompt = document.createElement("span");
      prompt.textContent = row.label;
      var select = document.createElement("select");
      select.disabled = !!session.answered;
      select.setAttribute("aria-label", "Match for " + row.label);
      renderSelectOptions(select, question.choices, Array.isArray(selected) ? selected[index] : null);
      if (session.answered && session.mode !== "simulation") select.classList.add(Array.isArray(selected) && selected[index] === row.answer ? "correct" : "wrong");
      select.addEventListener("change", function () { selectResponsePart(index, select.value); });
      label.appendChild(prompt);
      label.appendChild(select);
      holder.appendChild(label);
    });
    $("question-help").textContent = "Complete all matching rows before checking";
  }

  function renderBoss(question) {
    var holder = prepareResponseHolder("boss-options");
    question.steps.forEach(function (step, index) {
      if (hasLongOptions(step.options)) {
        var field = document.createElement("div");
        field.className = "boss-step";
        var stepHeading = document.createElement("b");
        stepHeading.textContent = step.label;
        var stepPrompt = document.createElement("span");
        stepPrompt.textContent = step.prompt;
        field.appendChild(stepHeading);
        field.appendChild(stepPrompt);
        renderChoiceGroup(field, step.options, index, step.label + ". " + step.prompt, step.answer);
        holder.appendChild(field);
        return;
      }
      var label = document.createElement("label");
      label.className = "boss-step";
      var heading = document.createElement("b");
      heading.textContent = step.label;
      var prompt = document.createElement("span");
      prompt.textContent = step.prompt;
      var select = document.createElement("select");
      select.disabled = !!session.answered;
      select.setAttribute("aria-label", step.label + ". " + step.prompt);
      renderSelectOptions(select, step.options, Array.isArray(selected) ? selected[index] : null);
      if (session.answered && session.mode !== "simulation") select.classList.add(Array.isArray(selected) && selected[index] === step.answer ? "correct" : "wrong");
      select.addEventListener("change", function () { selectResponsePart(index, select.value); });
      label.appendChild(heading);
      label.appendChild(prompt);
      label.appendChild(select);
      holder.appendChild(label);
    });
    $("question-help").textContent = "Complete all three reasoning steps before checking";
  }

  function renderConfidenceControl() {
    var show = shouldAskConfidence(currentQuestion(), currentItem()) && (session.answered || hasCompleteResponse(currentQuestion())) && session.subjectiveStage !== "rubric";
    $("confidence-check").hidden = !show;
    $all("input[name='confidence']").forEach(function (input) {
      input.checked = confidence === input.value;
      input.disabled = !!session.answered;
    });
    $("skip-confidence").disabled = !!session.answered;
    $("skip-confidence").setAttribute("aria-pressed", String(confidence === "skipped"));
    $("confidence-check").classList.toggle("resolved", !!session.answered);
    if (show && !session.answered && $("question-help").textContent.indexOf("confidence description") < 0) $("question-help").textContent += ". Then choose the confidence description or skip it";
  }

  function setConfidence(value) {
    if (!session || session.answered) return;
    confidence = value;
    session.confidence = value;
    updateCommitState();
  }

  // The diagnosis for a wrong response lives on the option the learner actually
  // chose, so it must be looked up by selected option index within the failing
  // part — not by the part index, which for a single-blank cloze is always 0 and
  // would report the same diagnosis whichever wrong option was picked.
  function partDiagnoses(question, partIndex) {
    if (question.type === "boss") return (question.steps[partIndex] || {}).diagnoses;
    if (question.type === "match") return (question.rows[partIndex] || {}).diagnoses;
    if (question.type === "cloze" || question.type === "case-cloze") return (question.blanks[partIndex] || {}).diagnoses;
    return question.diagnoses;
  }

  function diagnosisFor(question, response) {
    if (!question || !response || response.correct) return null;
    // A prediction has no keyed wrong option, so there is no belief to name.
    if (question.type === "primer") return null;
    if (question.type === "mcq" || !question.type) {
      return (question.diagnoses || [])[response.selected] || null;
    }
    /* MSQ indexes diagnoses by option, but `selected` is the set the learner
     * picked and `partResults` tracks the answer indices — neither lines up with
     * the generic part logic below. Explain the first wrongly selected option,
     * because one wrong choice is what turns either one- or two-option response
     * into zero. */
    if (question.type === "msq") {
      var answers = question.answers || [];
      var wrongPick = (response.selected || []).filter(function (index) { return answers.indexOf(index) < 0; })[0];
      if (wrongPick === undefined) return null;
      return (question.diagnoses || [])[wrongPick] || null;
    }
    /* A numeric answer has no option to diagnose, so the diagnosis comes from the
     * figure itself: a value matching a known wrong method gets that method named.
     * Anything else falls back to the question's general miss, if one is authored. */
    if (question.type === "numeric") {
      var entry = response.numericEntry || {};
      if (entry.trap) return entry.trap;
      return question.missDiagnosis || null;
    }
    var failedIndex = (response.partResults || []).indexOf(false);
    if (failedIndex < 0) return null;
    var chosen = (response.selected || [])[failedIndex];
    return (partDiagnoses(question, failedIndex) || [])[chosen] || null;
  }

  function evaluateResponse(question) {
    /* A prediction has no key, so it has no verdict. `correct: null` is the same shape
     * a constructed response uses and every consumer already reads it as "not scored"
     * — `updatePrimerFromChallenge` returns on it, and the results screen counts only
     * `scored` responses. */
    if (question.type === "primer") return {correct: null, partial: 0, partResults: [], conceptResults: {}, misconception: null};
    if (question.type === "mcq" || !question.type) {
      var mcqCorrect = selected === question.answer;
      var mcqDiagnosis = mcqCorrect ? null : (question.diagnoses || [])[selected];
      return {correct: mcqCorrect, partial: mcqCorrect ? 1 : 0, partResults: [mcqCorrect], conceptResults: {}, misconception: mcqCorrect ? null : (mcqDiagnosis ? mcqDiagnosis.tag : (question.misconceptions || [])[selected] || "wrong-option")};
    }
    if (question.type === "numeric") {
      /* All or nothing, within the tolerance, because that is the paper's rule:
       * marks for the final answer only, none for working. The diagnosis is
       * chosen by *how* the figure is wrong — a near miss is a rounding problem,
       * a value matching a known wrong method is a method problem, and those need
       * different corrections. `nearMisses` lets an author name the specific
       * wrong figure a common mistake produces. */
      var given = parseNumericEntry(selected);
      var target = Number(question.answer);
      var tolerance = Number(question.tolerance || 0);
      var numericCorrect = given !== null && Math.abs(given - target) <= tolerance;
      var trap = null;
      if (!numericCorrect && given !== null) {
        (question.nearMisses || []).some(function (entry) {
          if (Math.abs(given - Number(entry.value)) <= Number(entry.tolerance || tolerance)) { trap = entry; return true; }
          return false;
        });
      }
      return {
        correct: numericCorrect,
        partial: numericCorrect ? 1 : 0,
        partResults: [numericCorrect],
        conceptResults: {},
        numericEntry: {given: given, target: target, tolerance: tolerance, unit: question.unit || "", trap: trap},
        misconception: numericCorrect ? null : (trap ? trap.tag : given === null ? "no-figure-entered" : "wrong-figure")
      };
    }
    if (question.type === "msq") {
      /* Scored exactly as the P-type paper scores it: the exact pair earns 2; one
       * correct option with no wrong option earns 1; any wrong option earns 0.
       * Mastery evidence remains stricter than marks — `correct` requires the pair. */
      var answers = question.answers || [];
      var picked = msqSelection();
      var hits = picked.filter(function (index) { return answers.indexOf(index) >= 0; });
      var misses = picked.filter(function (index) { return answers.indexOf(index) < 0; });
      var pType = scorePTypeSelection(picked, answers);
      var awarded = pType.awarded;
      var exact = hits.length === 2 && answers.length === 2 && misses.length === 0;
      var firstWrong = misses.length ? misses[0] : null;
      var msqDiagnosis = firstWrong === null ? null : (question.diagnoses || [])[firstWrong];
      return {
        correct: exact,
        partial: awarded / 2,
        partResults: answers.map(function (index) { return picked.indexOf(index) >= 0; }),
        conceptResults: {},
        msqMarks: {awarded: awarded, available: 2, hits: hits.length, misses: misses.length},
        misconception: exact ? null : (msqDiagnosis ? msqDiagnosis.tag : (misses.length ? "over-selected" : "under-selected"))
      };
    }
    var parts = question.type === "boss" ? question.steps : question.type === "match" ? question.rows : question.blanks;
    var partResults = parts.map(function (part, index) { return selected[index] === part.answer; });
    var correctCount = partResults.filter(Boolean).length;
    var conceptResults = {};
    unique([question.conceptId].concat(question.supportingConceptIds || [])).forEach(function (conceptId) {
      var relevant = [];
      if (question.type === "boss") question.steps.forEach(function (step, index) { if ((step.conceptIds || []).indexOf(conceptId) >= 0) relevant.push(partResults[index]); });
      else if (question.type === "match") question.rows.forEach(function (row, index) { if (row.conceptId === conceptId) relevant.push(partResults[index]); });
      else relevant = partResults.slice();
      conceptResults[conceptId] = relevant.length ? relevant.every(Boolean) : partResults.every(Boolean);
    });
    var failedPart = partResults.indexOf(false);
    var partDiagnosis = failedPart < 0 ? null : (partDiagnoses(question, failedPart) || [])[selected[failedPart]];
    return {
      correct: partResults.every(Boolean),
      partial: correctCount / Math.max(1, partResults.length),
      partResults: partResults,
      conceptResults: conceptResults,
      misconception: partResults.every(Boolean) ? null : (partDiagnosis ? partDiagnosis.tag : (question.misconceptions || [])[failedPart] || "broken-reasoning-step")
    };
  }

  function ensureReattempt(question, reason, targetConceptId) {
    targetConceptId = targetConceptId || question.conceptId;
    var responsesForConcept = session.responses.filter(function (response) {
      return (response.conceptIds || [response.conceptId]).indexOf(targetConceptId) >= 0;
    }).length;
    if (responsesForConcept >= 4) return false;
    var laterIndex = -1;
    for (var index = session.index + 1; index < session.queue.length; index += 1) {
      // A lesson carries the concept id of the question it precedes, so without
      // this guard the re-attempt scheduler treats teaching as a re-attemptable
      // surface and drags it out of position — which is how a sample-size case
      // ended up scheduled ahead of the sample-size lesson.
      if (isSupportItem(session.queue[index])) continue;
      var laterQuestion = getQuestion(session.courseId, session.queue[index].id);
      if (conceptIdsOf(laterQuestion).indexOf(targetConceptId) >= 0 && laterQuestion.id !== question.id && (laterQuestion.variantFamily || laterQuestion.id) !== (question.variantFamily || question.id)) { laterIndex = index; break; }
    }
    var item;
    if (laterIndex >= 0) {
      item = session.queue.splice(laterIndex, 1)[0];
    } else {
      var queuedIds = session.queue.slice(session.index + 1).map(function (entry) { return entry.id; });
      var alternative = questionSurfaces(session.courseId, targetConceptId).filter(function (candidate) {
        return candidate.id !== question.id && queuedIds.indexOf(candidate.id) < 0 && (candidate.variantFamily || candidate.id) !== (question.variantFamily || question.id);
      }).sort(function (a, b) {
        var aFit = reason === "machine-graded-gap" ? (a.type === "short-answer" ? 0 : 1) : reason === "confident-error" ? (["diagnose", "apply"].indexOf(a.perspective) >= 0 ? 0 : 1) : reason === "uncertain-error" ? (a.difficulty <= 3 ? 0 : 1) : reason === "low-confidence-correct" ? (a.type === "case-cloze" || a.boss ? 0 : 1) : 0;
        var bFit = reason === "machine-graded-gap" ? (b.type === "short-answer" ? 0 : 1) : reason === "confident-error" ? (["diagnose", "apply"].indexOf(b.perspective) >= 0 ? 0 : 1) : reason === "uncertain-error" ? (b.difficulty <= 3 ? 0 : 1) : reason === "low-confidence-correct" ? (b.type === "case-cloze" || b.boss ? 0 : 1) : 0;
        return aFit - bFit || questionLastAttemptAt(session.courseId, a.id) - questionLastAttemptAt(session.courseId, b.id);
      })[0];
      if (!alternative) return false;
      item = {id: alternative.id, initial: false, isReattempt: true, origin: question.id};
    }
    item.isReattempt = true;
    item.origin = question.id;
    item.reason = reason;
    item.targetConceptId = targetConceptId;
    var insertAt = Math.min(session.queue.length, session.index + 3);

    /* Bringing a question forward must not overtake its own teaching. Any lesson
     * the re-attempt depends on is placed immediately ahead of it, and removed
     * from wherever it was queued later so it is not delivered twice.
     *
     * This is the sharpest case for re-teaching and it asks for it by name: the
     * learner got this idea wrong seconds ago and the app is about to ask them
     * again. Sending them back into the question with nothing in between is how the
     * second attempt becomes a second guess. */
    var reattemptQuestion = getQuestion(session.courseId, item.id);
    pendingLessonsFor(reattemptQuestion, session.courseId).forEach(function (lectureId) {
      var alreadyRead = lessonIsRead(lectureId);
      for (var scan = session.queue.length - 1; scan > session.index; scan -= 1) {
        if (session.queue[scan].lesson && session.queue[scan].lectureId === lectureId) {
          session.queue.splice(scan, 1);
          if (scan < insertAt) insertAt -= 1;
        }
      }
      session.queue.splice(insertAt, 0, {
        id: lessonItemId(lectureId, targetConceptId),
        initial: false,
        isReattempt: false,
        origin: null,
        lesson: true,
        lectureId: lectureId,
        reteach: alreadyRead,
        previousConceptId: targetConceptId
      });
      insertAt += 1;
    });

    session.queue.splice(insertAt, 0, item);
    return true;
  }

  function insertWrittenRepair(question, grade) {
    var missing = grade.criteria.filter(function (criterion) { return criterion.decision !== "met"; }).map(function (criterion) { return criterion.id; });
    if (!missing.length) return false;
    var item = {
      id:writtenRepairItemId(question.id, session.responses.length + 1),
      initial:false,
      isReattempt:false,
      origin:question.id,
      writtenRepair:true,
      missingCriteria:missing,
      gapCodes:unique(grade.criteria.reduce(function (codes, criterion) { return codes.concat(criterion.gapCodes || []); }, [])),
      previousConceptId:question.conceptId
    };
    session.queue.splice(session.index + 1, 0, item);
    session.supportCount = (session.supportCount || 0) + 1;
    return true;
  }

  function tagNextWrittenConfirmation(summary) {
    summary = summary || writtenPracticeSummary(session.courseId);
    var open = summary.open.map(function (criterion) { return criterion.id; });
    var openGaps = summary.openGaps.map(function (gap) { return gap.key; });
    if (!open.length) return false;
    for (var index = session.index + 1; index < session.queue.length; index += 1) {
      var later = getQuestion(session.courseId, session.queue[index].id);
      if (later && later.type === "short-answer") {
        session.queue[index].writtenFocus = open.slice();
        session.queue[index].writtenGapFocus = openGaps.slice();
        return true;
      }
    }
    return false;
  }

  function beginSubjectiveReview() {
    if (!session || session.answered || currentQuestion().type !== "short-answer" || !hasCompleteResponse(currentQuestion()) || !confidenceReady()) return;
    session.subjectiveStage = "rubric";
    session.selected = selected;
    session.confidence = confidence;
    session.rubricSelection = session.rubricSelection || [];
    profile.active = clone(session);
    saveProfile();
    renderQuestion();
    var rubric = $("subjective-rubric");
    if (rubric) rubric.focus({preventScroll:true});
  }

  function validatedWrittenGrade(payload, question) {
    if (!payload || payload.abstain || ["dungeon-local-practice", "dungeon-hosted-practice"].indexOf(payload.authority) < 0 || !modelProseValid(payload.feedback || "")) return null;
    var rubric = question.rubric || [];
    if (!Array.isArray(payload.criteria) || payload.criteria.length !== rubric.length) return null;
    if (!Number.isInteger(payload.score) || payload.score < 0 || payload.score > rubric.length || payload.maxScore !== rubric.length) return null;
    var retrieval = Array.isArray(payload.retrieval) ? payload.retrieval.map(function (item) {
      return {
        citation:String(item.citation || "").slice(0, 120),
        lectureId:String(item.lectureId || "").slice(0, 120),
        title:String(item.title || "").slice(0, 240)
      };
    }) : [];
    var citations = retrieval.map(function (item) { return item.citation; });
    var gapById = {};
    (question.writtenGaps || []).forEach(function (gap) { gapById[gap.id] = gap; });
    var criteria = rubric.map(function (rubricCriterion) {
      var matches = payload.criteria.filter(function (criterion) { return criterion && criterion.id === rubricCriterion.id; });
      if (matches.length !== 1 || ["met", "not_met"].indexOf(matches[0].decision) < 0) return null;
      if (!modelProseValid(matches[0].reason || "")) return null;
      var sourceCitations = Array.isArray(matches[0].sourceCitations) ? unique(matches[0].sourceCitations.map(String)) : [];
      /* An award must cite retrieved course evidence. A refusal must not be forced to:
         it reports what the answer does not contain, and no lecture chunk evidences an
         absence. Demanding one here rejected correct not_met criteria and abstained the
         whole question. Anything actually cited must still be a chunk the server sent. */
      if (matches[0].decision === "met" && !sourceCitations.length) return null;
      if (sourceCitations.some(function (citation) { return citations.indexOf(citation) < 0; })) return null;
      var gapCodes = Array.isArray(matches[0].gapCodes) ? unique(matches[0].gapCodes.map(String)) : [];
      if (matches[0].decision === "met" && gapCodes.length) return null;
      if (matches[0].decision === "not_met" && (!gapCodes.length || gapCodes.length > 2 || gapCodes.some(function (code) {
        return !gapById[code] || gapById[code].criterionId !== rubricCriterion.id;
      }))) return null;
      return {
        id:rubricCriterion.id,
        label:rubricCriterion.label,
        decision:matches[0].decision,
        marksAwarded:matches[0].decision === "met" ? 1 : 0,
        gapCodes:gapCodes,
        answerEvidence:String(matches[0].answerEvidence || "").slice(0, 600),
        sourceCitations:sourceCitations,
        reason:String(matches[0].reason || "").slice(0, 900)
      };
    });
    if (criteria.some(function (criterion) { return !criterion; })) return null;
    if (criteria.filter(function (criterion) { return criterion.decision === "met"; }).length !== payload.score) return null;
    return {
      authority:payload.authority,
      model:String(payload.model || writtenAuthority.model || writtenAuthorityName()).slice(0, 160),
      score:payload.score,
      maxScore:rubric.length,
      criteria:criteria,
      feedback:String(payload.feedback || "The response was checked against the cited rubric criteria.").slice(0, 1200),
      retrieval:retrieval
    };
  }

  function fallBackFromWrittenGrade(copy) {
    session.subjectiveStage = "rubric";
    session.localGradeFallback = copy || "Dungeon’s written authority abstained, so no machine mark was issued. Use the transparent rubric and exemplar instead.";
    profile.active = clone(session);
    saveProfile();
    renderQuestion();
    var rubric = $("subjective-rubric");
    if (rubric) rubric.focus({preventScroll:true});
  }

  async function requestWrittenGrade() {
    var question = currentQuestion();
    if (!writtenGradingApplies(question) || session.answered || !hasCompleteResponse(question) || !confidenceReady()) return beginSubjectiveReview();
    var gradingSession = session;
    session.subjectiveStage = "grading";
    session.selected = selected;
    session.confidence = confidence;
    session.localGradeFallback = null;
    profile.active = clone(session);
    saveProfile();
    renderQuestion();
    try {
      var response = await fetch(WRITTEN_AUTHORITY_ENDPOINT + "/grade", {
        method:"POST",
        credentials:"same-origin",
        cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({courseId:session.courseId, questionId:question.id, answer:selected})
      });
      var payload = {};
      try { payload = await response.json(); } catch (error) {}
      if (session !== gradingSession || !session || session.answered || currentQuestion().id !== question.id) return;
      if (!response.ok) throw new Error(payload.message || payload.error || "Dungeon could not check this response.");
      /* Checked before the abstention branch on purpose. A support response also
         carries abstain:true, and routing it there would answer someone in trouble
         with a note about schema and answer-evidence checks. */
      if (payload.kind === "written-support" && payload.supportOffered === true) return showWrittenSupport();
      if (payload.abstain) return fallBackFromWrittenGrade("Dungeon’s written authority abstained because the judgement did not pass every source, schema, and answer-evidence check. No machine mark was issued; use the visible rubric and exemplar instead.");
      var grade = validatedWrittenGrade(payload, question);
      if (!grade) return fallBackFromWrittenGrade("The result failed Dungeon’s citation or schema checks. No machine mark was recorded; use the visible rubric and exemplar instead.");
      return finalizeWrittenGradedAnswer(grade);
    } catch (error) {
      if (session !== gradingSession || !session || session.answered) return;
      return fallBackFromWrittenGrade("The written authority was unavailable, so no machine mark was recorded. Use the visible rubric and exemplar instead.");
    }
  }

  /* No mark, no attempt, no repair routing, no advance. The response is left in the
     box and the question stays open, because the one thing this moment must not do
     is score somebody and move on. */
  function showWrittenSupport() {
    session.subjectiveStage = "support";
    session.writtenSupport = true;
    session.localGradeFallback = null;
    profile.active = clone(session);
    saveProfile();
    renderQuestion();
    var holder = $("response-holder");
    if (holder) {
      var note = holder.querySelector(".written-support-response");
      if (note) note.focus();
    }
  }

  function finalizeWrittenGradedAnswer(grade) {
    var item = currentItem();
    var question = currentQuestion();
    var before = conceptStatus(session.courseId, question.conceptId);
    var selectedCriteria = grade.criteria.map(function (criterion, index) { return criterion.decision === "met" ? index : null; }).filter(function (index) { return index !== null; });
    var evaluation = {scored:false, correct:null, partial:grade.maxScore ? grade.score / grade.maxScore : 0, conceptResults:{}, constructedScore:grade.score, constructedTotal:grade.maxScore};
    var timing = responseTimingMeta(question);
    recordAttempt(session.courseId, question, evaluation, confidence, item, session.blockId, timing);
    recordWrittenPracticeEvidence(session.courseId, question, grade);
    var scheduled = grade.score < grade.maxScore && ensureReattempt(question, "machine-graded-gap");
    var repairInserted = insertWrittenRepair(question, grade);
    var writtenSummary = writtenPracticeSummary(session.courseId);
    var confirmationTargeted = tagNextWrittenConfirmation(writtenSummary);
    var after = conceptStatus(session.courseId, question.conceptId);
    var response = {
      id:question.id,
      conceptId:question.conceptId,
      conceptIds:unique([question.conceptId].concat(question.supportingConceptIds || [])),
      node:question.node,
      source:unique(question.sourceIds || [question.source]).join(" + "),
      selected:selected,
      confidence:confidence,
      confidencePrompted:!!item.askConfidence,
      correct:null,
      scored:false,
      subjective:true,
      machineGraded:true,
      localGrade:grade,
      rubricSelection:selectedCriteria,
      rubricScore:grade.score,
      rubricTotal:grade.maxScore,
      rubricDeferred:false,
      durationBucket:timing.durationBucket,
      rapidGuess:false,
      strongEligible:false,
      evaluation:evaluation,
      isReattempt:!!item.isReattempt,
      initial:!!item.initial,
      perspective:question.perspective || "generate",
      statusBefore:before,
      statusAfter:after,
      scheduled:scheduled,
      repairInserted:repairInserted,
      confirmationTargeted:confirmationTargeted,
      writtenConfirmationsRemaining:writtenSummary.confirmationsNeeded,
      explanation:question.explanation,
      link:question.link
    };
    session.subjectiveStage = "graded";
    session.answered = true;
    session.selected = selected;
    session.confidence = confidence;
    session.responses.push(response);
    profile.active = clone(session);
    saveProfile();
    renderResolved(question, response);
    renderTopicList();
    updatePracticeProgress();
    $("next-question").focus({preventScroll:true});
  }

  function finalizeSubjectiveAnswer(options) {
    options = options || {};
    var item = currentItem();
    var question = currentQuestion();
    var before = conceptStatus(session.courseId, question.conceptId);
    var selectedCriteria = options.deferRubric ? [] : (session.rubricSelection || []).slice();
    var evaluation = {scored:false, correct:null, partial:0, conceptResults:{}, constructedScore:selectedCriteria.length, constructedTotal:(question.rubric || []).length};
    var timing = responseTimingMeta(question);
    if (session.mode !== "simulation") recordAttempt(session.courseId, question, evaluation, confidence, item, session.blockId, timing);
    var after = conceptStatus(session.courseId, question.conceptId);
    var response = {
      id: question.id,
      conceptId: question.conceptId,
      conceptIds: unique([question.conceptId].concat(question.supportingConceptIds || [])),
      node: question.node,
      source: unique(question.sourceIds || [question.source]).join(" + "),
      selected: selected,
      confidence: confidence,
      confidencePrompted: !!item.askConfidence,
      correct: null,
      scored: false,
      subjective: true,
      rubricSelection: selectedCriteria,
      rubricScore: selectedCriteria.length,
      rubricTotal: (question.rubric || []).length,
      rubricDeferred: !!options.deferRubric,
      durationBucket: timing.durationBucket,
      rapidGuess: timing.rapidGuess,
      strongEligible: timing.strongEligible,
      evaluation: evaluation,
      isReattempt: !!item.isReattempt,
      initial: !!item.initial,
      perspective: question.perspective || "generate",
      statusBefore: before,
      statusAfter: after,
      explanation: question.explanation,
      link: question.link
    };
    session.answered = true;
    session.selected = selected;
    session.confidence = confidence;
    session.responses.push(response);
    profile.active = clone(session);
    saveProfile();
    renderResolved(question, response);
    renderTopicList();
    updatePracticeProgress();
    $("next-question").focus({preventScroll:true});
  }

  function commitAnswer() {
    if (!session || session.answered || !hasCompleteResponse(currentQuestion()) || !confidenceReady()) return;
    if (currentQuestion().type === "short-answer" && session.mode === "simulation") return finalizeSubjectiveAnswer({deferRubric:true});
    /* A final-week Speedrun has two minutes per module. A written prompt therefore
       uses one honest retrieval commitment followed by the answer spine; making the
       learner perform a second rubric-marking interaction turns eight questions into
       an unadvertised sixteen-step activity and makes IBM's written course impossible
       to finish in the stated time. It remains unscored and cannot create Strong. */
    if (currentQuestion().type === "short-answer" && session.kind === "confidence-sprint") return finalizeSubjectiveAnswer({deferRubric:true});
    if (currentQuestion().type === "short-answer" && session.kind === "module-chamber") return finalizeSubjectiveAnswer({deferRubric:true});
    if (currentQuestion().type === "short-answer" && writtenGradingApplies(currentQuestion()) && session.subjectiveStage !== "rubric") return requestWrittenGrade();
    if (currentQuestion().type === "short-answer" && session.subjectiveStage !== "rubric") return beginSubjectiveReview();
    if (currentQuestion().type === "short-answer") return finalizeSubjectiveAnswer();
    var item = currentItem();
    var question = currentQuestion();
    var evaluation = evaluateResponse(question);
    var correct = evaluation.correct;
    var timing = responseTimingMeta(question);
    var before = conceptStatus(session.courseId, question.conceptId);
    var predicted = question.type === "primer" && !session.primerSkipped && typeof selected === "string" && selected.trim().length > 0;
    if (question.type === "primer") recordPrimerAttempt(session.courseId, question, predicted);
    else if (session.mode !== "simulation" && !isRevisionSprint(session)) recordAttempt(session.courseId, question, evaluation, confidence, item, session.blockId, timing);
    var after = conceptStatus(session.courseId, question.conceptId);
    var failedConceptIds = Object.keys(evaluation.conceptResults || {}).filter(function (conceptId) {
      return evaluation.conceptResults[conceptId] === false;
    });
    var reattemptConceptId = failedConceptIds[0] || question.conceptId;
    var afterEvidence = conceptEvidence(session.courseId, reattemptConceptId);
    var scheduled = false;
    if (question.type !== "primer" && session.mode !== "simulation" && !isRevisionSprint(session) && !correct) scheduled = session.kind !== "module-chamber" && ensureReattempt(question, confidence === "high" ? "confident-error" : confidence === "low" ? "uncertain-error" : "missed", reattemptConceptId);
    else if (question.type !== "primer" && session.mode !== "simulation" && !isRevisionSprint(session) && conceptStatus(session.courseId, reattemptConceptId) !== "strong" && (confidence === "low" || afterEvidence.correct < 3)) scheduled = session.kind !== "module-chamber" && ensureReattempt(question, confidence === "low" ? "low-confidence-correct" : "developing", reattemptConceptId);

    var response = {
      id: question.id,
      conceptId: question.conceptId,
      conceptIds: unique([question.conceptId].concat(question.supportingConceptIds || [])),
      node: question.node,
      source: unique(question.sourceIds || [question.source]).join(" + "),
      selected: selected,
      confidence: confidence,
      confidencePrompted: !!item.askConfidence,
      correct: correct,
      scored: question.type !== "primer",
      primer: question.type === "primer",
      primerPredicted: predicted,
      primerLevel: item.primerLevel || null,
      durationBucket: timing.durationBucket,
      rapidGuess: timing.rapidGuess,
      strongEligible: timing.strongEligible,
      partial: evaluation.partial,
      partResults: evaluation.partResults,
      conceptResults: evaluation.conceptResults,
      msqMarks: evaluation.msqMarks || null,
      numericEntry: evaluation.numericEntry || null,
      misconception: evaluation.misconception,
      isReattempt: !!item.isReattempt,
      initial: !!item.initial,
      perspective: question.perspective || "explain",
      statusBefore: before,
      statusAfter: after,
      scheduled: scheduled,
      reattemptConceptId: scheduled ? reattemptConceptId : null,
      explanation: question.explanation,
      link: question.link
    };
    session.answered = true;
    session.selected = Array.isArray(selected) ? selected.slice() : selected;
    session.confidence = confidence;
    session.responses.push(response);
    profile.active = clone(session);
    saveProfile();
    renderResolved(question, response);
    renderTopicList();
    updatePracticeProgress();
    $("next-question").focus({preventScroll: true});
  }

  function correctAnswerKey(question) {
    // A primer is not keyed; its principle is revealed by renderPrimerResolved.
    if (question.type === "primer") return [];
    if (question.type === "mcq" || !question.type) return [question.options[question.answer]];
    if (question.type === "msq") return (question.answers || []).map(function (index) { return question.options[index]; });
    if (question.type === "numeric") return [String(question.answer) + (question.unit ? " " + question.unit : "")];
    if (question.type === "match") return question.rows.map(function (row) { return row.label + " → " + question.choices[row.answer]; });
    if (question.type === "boss") return question.steps.map(function (step) { return step.label + ": " + step.options[step.answer]; });
    if (question.type === "short-answer") return [question.exemplar];
    return question.blanks.map(function (blank) { return blank.label + ": " + blank.options[blank.answer]; });
  }

  // Superseded by the per-option diagnosis in `diagnosisFor`, which names the
  // specific belief a chosen option encodes rather than quoting the option back.

  function bossStepFeedback(question, response) {
    if (!question.boss || response.correct || !Array.isArray(response.partResults)) return "";
    var passed = response.partResults.map(function (result, index) { return result ? question.steps[index].label.replace(/ ·.*/, "") : null; }).filter(Boolean);
    var failedIndex = response.partResults.indexOf(false);
    var failed = question.steps[failedIndex];
    return (passed.length ? passed.join(" and ") + " still count as evidence. " : "") + "The chain first breaks at " + failed.label.replace(/ ·.*/, "") + ": " + failed.prompt;
  }

  function renderDeferred(question, response) {
    var feedback = $("feedback");
    feedback.className = "feedback visible deferred";
    feedback.innerHTML = "<span class='feedback-label'>Answer saved</span><p>Correctness and explanations are held until the end of this generic practice check.</p>";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish and review <span aria-hidden='true'>→</span>" : "Next question <span aria-hidden='true'>→</span>";
  }

  function renderSubjectiveResolved(question, response) {
    var selectedCriteria = response.rubricSelection || [];
    if (session.kind === "module-chamber" && response.rubricDeferred) {
      var chamberCriteria = (question.rubric || []).map(function (criterion) {
        return "<li>" + escapeHtml(criterion.label) + "</li>";
      }).join("");
      var chamberSpine = speedrunWrittenSpine(question);
      var chamberFeedback = $("feedback");
      chamberFeedback.className = "feedback visible reviewed";
      chamberFeedback.innerHTML = "<span class='feedback-label'>Compare with the answer spine</span><p>This paragraph is retrieval practice, not a grade. Check the framework, decision, case fact, and causal reason.</p><p class='bridge'><b>Answer spine:</b> " + escapeHtml(chamberSpine) + "</p><p><b>Did you cover:</b></p><ul>" + chamberCriteria + "</ul><p class='return-note'>Nothing was scored or queued from this paragraph.</p>";
      $("commit-answer").hidden = true;
      $("next-question").hidden = false;
      $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish this chamber <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
      return;
    }
    if (session.kind === "confidence-sprint" && response.rubricDeferred) {
      var speedrunCriteria = (question.rubric || []).map(function (criterion) {
        return "<li>" + escapeHtml(criterion.label) + "</li>";
      }).join("");
      var speedrunSpine = speedrunWrittenSpine(question);
      var speedrunFeedback = $("feedback");
      speedrunFeedback.className = "feedback visible reviewed";
      speedrunFeedback.innerHTML = "<span class='feedback-label'>Compare with the answer spine</span><p>This is coached retrieval, not a grade. Check whether your response made the same decision and causal link.</p><p class='bridge'><b>Answer spine:</b> " + escapeHtml(speedrunSpine) + "</p><p><b>Did you cover:</b></p><ul>" + speedrunCriteria + "</ul>" +
        "<div class='confidence-method-result'>" + confidenceMethodHtml(question, "Next-time method") + "</div>" +
        "<p class='return-note'>The response is recorded as constructed practice only; it cannot create Strong evidence without independent checking.</p>";
      $("commit-answer").hidden = true;
      $("next-question").hidden = false;
      $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish this Speedrun <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
      return;
    }
    var criteria = (question.rubric || []).map(function (criterion, index) {
      return "<li><b>" + (selectedCriteria.indexOf(index) >= 0 ? "Included: " : "Still missing: ") + escapeHtml(criterion.label) + "</b> — " + escapeHtml(criterion.description) + "</li>";
    }).join("");
    var feedback = $("feedback");
    feedback.className = "feedback visible reviewed";
    feedback.innerHTML = "<span class='feedback-label'>Self-review recorded: " + response.rubricScore + " of " + response.rubricTotal + " criteria</span><p>This is a transparent self-check, not an automatic grade.</p><ul>" + criteria + "</ul><p class='bridge'><b>Grounded exemplar:</b> " + escapeHtml(question.exemplar) + "</p>" +
      (session.kind === "confidence-sprint" ? "<div class='confidence-method-result'>" + confidenceMethodHtml(question, "Next-time method") + "</div>" : "") +
      "<p class='return-note'>This constructed response is recorded as practice, but it cannot create Strong evidence without independent checking.</p>";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish this set <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
  }

  /* A ten-mark exemplar is often 250–350 words. It is excellent after a full paper
     and unusable inside a two-minute Speedrun slot. Keep complete opening sentences
     until the excerpt has enough substance to model the decision, then stop before
     the next sentence would push it beyond the rapid-review budget. */
  function speedrunWrittenSpine(question) {
    var exemplar = String(question.exemplar || "").trim();
    var sentences = exemplar.match(/[^.!?]+[.!?]+(?:[”'\"])?/g) || (exemplar ? [exemplar] : []);
    var selectedSentences = [];
    var wordCount = 0;
    sentences.some(function (sentence) {
      var clean = sentence.trim();
      var sentenceWords = clean.split(/\s+/).filter(Boolean).length;
      if (selectedSentences.length && wordCount >= 45 && wordCount + sentenceWords > 85) return true;
      selectedSentences.push(clean);
      wordCount += sentenceWords;
      return wordCount >= 55;
    });
    var spine = selectedSentences.join(" ");
    var link = String(question.link || "").trim();
    var linkWords = link.split(/\s+/).filter(Boolean).length;
    if (wordCount < 45 && link && spine.indexOf(link) < 0 && wordCount + linkWords <= 85) spine += (spine ? " " : "") + link;
    return spine || [question.explanation, question.link].filter(Boolean).join(" ");
  }

  function renderLocalGradedResolved(question, response) {
    var grade = response.localGrade;
    var authorityLabel = grade.authority === "dungeon-hosted-practice" ? "Dungeon Qwen" : "Local Qwen";
    var criteria = grade.criteria.map(function (criterion) {
      var verdict = criterion.decision === "met" ? "Met" : "Not yet";
      var gaps = (criterion.gapCodes || []).map(function (code) { return writtenGapDefinition(question, code); }).filter(Boolean);
      var gapHtml = gaps.length ? "<small class='written-gap-list'>" + gaps.map(function (gap) {
        return "<span>" + escapeHtml(gap.kind === "misunderstood" ? "Misunderstood · " : "Missed · ") + escapeHtml(gap.label) + "</span>";
      }).join("") + "</small>" : "";
      return "<li class='local-grade-criterion " + (criterion.decision === "met" ? "met" : "missing") + "'><b>" + verdict + ": " + escapeHtml(criterion.label) + "</b><span>" + escapeHtml(criterion.reason) + "</span>" + gapHtml + "<small class='criterion-evidence'><span class='sr-only'>Course evidence: </span>" + courseEvidenceTagsHtml(criterion.sourceCitations, session.courseId) + "</small></li>";
    }).join("");
    var feedback = $("feedback");
    feedback.className = "feedback visible reviewed local-graded";
    feedback.innerHTML = "<span class='feedback-label'>" + authorityLabel + " rubric mark: " + grade.score + " of " + grade.maxScore + "</span>" +
      "<p>Dungeon accepted this as the practice mark because the criterion judgement cited the retrieved course evidence and passed its deterministic authority checks.</p>" +
      "<ul class='local-grade-criteria'>" + criteria + "</ul>" +
      "<p class='bridge'><b>Feedback:</b> " + escapeHtml(grade.feedback) + "</p>" +
      "<p><b>Grounded exemplar:</b> " + escapeHtml(question.exemplar) + "</p>" +
      (response.repairInserted ? "<p class='return-note'>Dungeon inserted a brief teaching repair next, then marked a fresh written prompt to check the exact gap again. " + response.writtenConfirmationsRemaining + " gap confirmation" + (response.writtenConfirmationsRemaining === 1 ? " remains" : "s remain") + " open.</p>" :
        response.confirmationTargeted ? "<p class='return-note'>Dungeon marked the next fresh written prompt to confirm this result. " + response.writtenConfirmationsRemaining + " gap confirmation" + (response.writtenConfirmationsRemaining === 1 ? " remains" : "s remain") + " open.</p>" :
        response.writtenConfirmationsRemaining ? "<p class='return-note'>This run has no fresh written prompt left. The next written run will start with the open writing move.</p>" : "") +
      (response.scheduled ? "<p class='return-note'>A different question on this course idea has also been placed later in the set.</p>" : "") +
      "<p class='return-note'>This is Dungeon’s practice judgement, not an official IIMB grade. It cannot create Strong evidence.</p>";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish this set <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
  }

  function renderResolved(question, response) {
    selected = Array.isArray(response.selected) ? response.selected.slice() : response.selected;
    confidence = response.confidence || null;
    renderResponseControl(question);
    renderConfidenceControl();
    $("question-status").className = "status-pill " + response.statusAfter;
    $("question-status").textContent = STATUS_LABEL[response.statusAfter];
    if (response.primer) return renderPrimerResolved(question, response);
    if (session.mode === "simulation") return renderDeferred(question, response);
    if (response.subjective && response.machineGraded) return renderLocalGradedResolved(question, response);
    if (response.subjective) return renderSubjectiveResolved(question, response);
    var feedback = $("feedback");
    feedback.className = "feedback visible" + (response.correct ? "" : " wrong");
    var partCount = response.partResults ? response.partResults.length : 1;
    var partCorrect = response.partResults ? response.partResults.filter(Boolean).length : (response.correct ? 1 : 0);
    var label = response.correct ? "Correct" : (partCorrect ? "Almost — " + partCorrect + " of " + partCount + " parts were right" : "Not quite");
    var returnCopy = "";
    if (response.correct) {
      var evidence = conceptEvidence(session.courseId, question.conceptId);
      if (session.kind === "module-chamber") returnCopy = "Correct in this sample. No additional work was queued.";
      else if (response.statusAfter === "strong") returnCopy = evidence.delayedCorrect ? "Strong evidence: varied formats, more than one block, applied work, and a later retest are present." : "Strong current evidence: varied formats, more than one block, and applied work are present. A later retest will check retention.";
      else if (response.confidence === "low") returnCopy = "The answer was right. One new-family check will test the distinction again before relying on it.";
      else if (response.scheduled) returnCopy = "Good progress. Another question of a different type is placed later in this set.";
      else returnCopy = evidence.reasons.filter(function (reason) { return /needed|required|retest|block|type/i.test(reason); })[0] || "Keep applying this idea in the rest of the run.";
    }
    var answerKey = correctAnswerKey(question);
    var diagnosis = diagnosisFor(question, response);
    var bossCopy = bossStepFeedback(question, response);

    // A wrong answer is explained in the order a learner needs it: the better
    // answer, why it is better, what their choice missed, and one reusable check.
    // Scheduling remains internal; it does not help a learner understand the idea.
    var body;
    if (response.correct) {
      body = "<p>" + escapeHtml(question.explanation) + "</p>";
    } else if (diagnosis) {
      // For a repair cloze the correct option is the governing principle itself, so
      // the answer key already states it. Printing both says the same sentence twice.
      var governingIsInAnswer = answerKey.join(" ").indexOf(String(question.explanation).trim()) >= 0;
      body =
        (governingIsInAnswer ? "" : "<p class='governing'><b>Why:</b> " + escapeHtml(question.explanation) + "</p>") +
        "<div class='diagnosis'>" +
          "<p class='diagnosis-head'>What your answer missed</p>" +
          "<p><b>" + escapeHtml(diagnosis.label) + ".</b> " + escapeHtml(diagnosis.why) + "</p>" +
          (diagnosis.cue ? "<p class='diagnosis-cue'><b>Use this check:</b> " + escapeHtml(diagnosis.cue) + "</p>" : "") +
        "</div>";
    } else {
      body = "<p>" + escapeHtml(question.explanation) + "</p>";
    }

    /* Multiple-select is the one format where "wrong" is not the whole story: one
     * correct option with no wrong option earns a real mark, while adding any wrong
     * option drops the response to zero. */
    /* Numeric feedback states the figure entered against the accepted band, so a
     * near miss is legible as a near miss rather than a flat "wrong". */
    var numeric = response.numericEntry;
    var numericCopy = "";
    if (numeric) {
      var unitCopy = numeric.unit ? " " + numeric.unit : "";
      numericCopy = response.correct
        ? "You entered " + numeric.given + unitCopy + ". Accepted: " + numeric.target + unitCopy +
          (numeric.tolerance ? " ± " + numeric.tolerance : "") + "."
        : (numeric.given === null ? "No figure was read from your answer." : "You entered " + numeric.given + unitCopy + ".") +
          " The answer is " + numeric.target + unitCopy +
          (numeric.tolerance ? ", accepted within ± " + numeric.tolerance : "") +
          ". This section marks the final figure only, so there is no part credit for method.";
    }

    var marks = response.msqMarks;
    var marksCopy = marks
      ? marks.awarded + " of " + marks.available + " marks — " +
        (marks.awarded === 2 ? "both correct options selected." : marks.awarded === 1 ? "one correct option and no wrong option selected." : marks.misses ? "an incorrect option was selected, so the question scores zero." : "no correct option selected.")
      : "";

    var answerKeyHtml = !response.correct ? "<div class='answer-key'><p class='answer-key-head'>Better answer</p><ul>" + answerKey.map(function (answer) { return "<li>" + escapeHtml(answer) + "</li>"; }).join("") + "</ul></div>" : "";
    var methodCopy = session.kind === "confidence-sprint"
      ? "<div class='confidence-method-result'>" + confidenceMethodHtml(question, "Next-time method") + "</div>"
      : "";
    var bridgeCopy = session.kind === "paper-pattern" ? ""
      : "<p class='bridge'><b>How it fits:</b> " + escapeHtml(question.link) + "</p>";
    feedback.innerHTML = "<span class='feedback-label'>" + escapeHtml(label) + "</span>" +
      (marksCopy ? "<p class='msq-marks'>" + escapeHtml(marksCopy) + "</p>" : "") +
      (numericCopy ? "<p class='numeric-verdict'>" + escapeHtml(numericCopy) + "</p>" : "") + answerKeyHtml + body +
      (bossCopy ? "<p class='still-valid'><b>What remains valid:</b> " + escapeHtml(bossCopy) + "</p>" : "") +
      bridgeCopy +
      methodCopy +
      (returnCopy ? "<p class='return-note'>" + escapeHtml(returnCopy) + "</p>" : "");
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish this set <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
  }

  /* The reveal: the principle, arriving as the answer to the learner's own prediction.
   *
   * There is deliberately no verdict. Nothing compared their words to a key, so calling
   * a prediction right or wrong would be a claim the app cannot support — and the
   * prediction is worth making either way. Their own words are quoted back above the
   * rule so the comparison is theirs to draw, which is the whole mechanism. */
  function renderPrimerResolved(question, response) {
    var level = primerLevelOf(currentItem());
    var feedback = $("feedback");
    feedback.className = "feedback visible primer-pass";
    var parts = ["<span class='feedback-label'>" + (response.primerPredicted ? "Here is the rule you were reaching for" : "Here is the rule") + "</span>"];
    if (response.primerPredicted) {
      parts.push("<p class='primer-said'><b>You said:</b> " + escapeHtml(String(response.selected).trim()) + "</p>");
    }
    parts.push("<p class='primer-rule'><b>The rule:</b> " + escapeHtml(question.primerFact) + "</p>");
    if (level >= 2) parts.push("<p><b>Use it like this:</b> " + escapeHtml(question.primerApplication) + "</p>");
    if (level >= 3) parts.push("<p><b>Do not confuse it with:</b> " + escapeHtml(question.primerMisconception) + "</p>");
    parts.push("<p class='bridge'><b>Connection to keep:</b> " + escapeHtml(question.primerConnection) + "</p>");
    if (response.primerPredicted) {
      parts.push("<p class='primer-note'>Compare that against what you wrote. The gap between the two is the thing worth remembering — it is not marked and nothing about it was recorded.</p>");
    }
    feedback.innerHTML = parts.join("");
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = "Use it in the next challenge <span aria-hidden='true'>→</span>";
  }

  function nextQuestion() {
    if (!session || !session.answered) return;
    session.index += 1;
    session.answered = false;
    session.selected = null;
    session.confidence = null;
    session.primerSkipped = false;
    session.subjectiveStage = null;
    session.rubricSelection = [];
    session.localGradeFallback = null;
    selected = null;
    confidence = null;
    if (session.index >= session.queue.length) return finishSession();
    profile.active = clone(session);
    saveProfile();
    renderQuestion();
    // renderLesson moves focus to its own heading, so do not pull it back to a
    // question title the lesson surface has hidden.
    var next = currentQuestion();
    if (next && next.type !== "lesson" && next.type !== "written-repair") (next.caselet ? $("case-block") : $("question-title")).focus({preventScroll: true});
  }

  function updatePracticeProgress() {
    if (!session) return;
    // Lessons never produce a response, so they are counted as steps completed
    // once passed; otherwise the progress bar could never reach the end.
    var passedSupport = session.queue.slice(0, session.index).filter(isSupportItem).length;
    var answered = session.responses.length + passedSupport;
    var total = session.queue.length;
    var question = session.index < total ? currentQuestion() : null;
    $("practice-progress-text").textContent = Math.min(answered, total) + " of " + total + " steps";
    $("question-count").textContent = question && question.type === "lesson" ? "Lesson before the first question on it"
      : question && question.type === "written-repair" ? "Teaching repair before the next written answer"
      : question && question.type === "primer" ? "Primer before the next challenge"
      : "Question " + Math.min(challengePosition(), session.baseCount) + " of " + session.baseCount;
    $("practice-progress-fill").style.width = (total ? answered / total * 100 : 0) + "%";
    var queued = session.queue.slice(session.index + 1).filter(function (item) { return item.isReattempt; });
    $("due-count").textContent = String(queued.length);
    $("due-note").textContent = reattemptSummary(queued);
  }

  /* What is actually queued, rather than one fixed sentence about misses.
   *
   * The count was honest and its caption was not. A correct answer schedules a
   * re-attempt whenever confidence was low or the concept has fewer than three
   * correct behind it — deliberately, and it is one of the better things the engine
   * does — but the box underneath read "A missed idea returns in a different
   * question" whatever was in it. Students watched the number climb through a run
   * they were getting right and concluded the tracking was broken. It was not; it
   * was mislabelled, which from the outside is the same thing.
   *
   * The distinction the caption has to carry is repair versus confirmation, because
   * a learner seeing "2 due" is entitled to know whether that means they got two
   * things wrong. */
  function reattemptSummary(items) {
    var confirmations = items.filter(function (item) {
      return ["low-confidence-correct", "developing"].indexOf(item.reason) >= 0;
    }).length;
    var repairs = items.length - confirmations;
    if (!items.length) return "Nothing queued yet. Repairs and confirmation checks will be named separately.";
    if (!confirmations) return repairs === 1
      ? "One missed idea returns in a different question."
      : repairs + " missed ideas return in different questions.";
    if (!repairs) return confirmations === 1
      ? "You got this one right. It returns once in a different question to confirm it."
      : "You got these right. They return in different questions to confirm it.";
    return repairs + " to repair, " + confirmations + " you got right that return once to confirm it.";
  }

  function recordModuleChamberProgress(completedSession, percent) {
    if (!completedSession || completedSession.kind !== "module-chamber") return;
    var state = moduleChamberState(completedSession.courseId, completedSession.studyModule);
    var misses = unique(completedSession.responses.filter(function (response) {
      return response.initial && response.scored !== false && !response.correct;
    }).reduce(function (ids, response) { return ids.concat(response.conceptIds || [response.conceptId]); }, []));
    state.attempts += 1;
    state.last = percent;
    state.best = state.best == null ? percent : Math.max(state.best, percent);
    state.at = new Date().toISOString();
    state.missedConceptIds = misses;
  }

  function finishSession() {
    if (!session) return;
    if (session.mode === "simulation") session.responses.forEach(function (response, responseIndex) {
      if (response.evidenceRecorded) return;
      var question = getQuestion(session.courseId, response.id);
      var item = session.queue.filter(function (entry) { return entry.id === response.id; })[0] || {id:response.id, initial:response.initial, isReattempt:response.isReattempt};
      var evaluation = response.evaluation || {scored:response.scored !== false, correct:response.correct, partial:response.partial || 0, partResults:response.partResults || [], conceptResults:response.conceptResults || {}, misconception:response.misconception || null, constructedScore:response.rubricScore, constructedTotal:response.rubricTotal};
      recordAttempt(session.courseId, question, evaluation, response.confidence, item, session.blockId, {
        durationBucket: response.durationBucket || "unknown",
        rapidGuess: !!response.rapidGuess,
        strongEligible: response.strongEligible !== false
      });
      response.evidenceRecorded = true;
      response.statusAfter = conceptStatus(session.courseId, response.conceptId);
    });
    var completedSession = clone(session);
    var initialResponses = completedSession.responses.filter(function (response) { return response.initial; });
    var scoredInitial = initialResponses.filter(function (response) { return response.scored !== false; });
    var initialCorrect = scoredInitial.filter(function (response) { return response.correct; }).length;
    var percent = Math.round(initialCorrect / Math.max(1, scoredInitial.length) * 100);
    if (completedSession.kind === "final-sprint") {
      var miniPossible = scoredInitial.reduce(function (sum, response) { return sum + (response.msqMarks ? 2 : 1); }, 0);
      var miniAwarded = scoredInitial.reduce(function (sum, response) {
        return sum + (response.msqMarks ? response.msqMarks.awarded : response.correct ? 1 : 0);
      }, 0);
      percent = Math.round(miniAwarded / Math.max(1, miniPossible) * 100);
    }
    recordMiniMockProgress(completedSession, percent, scoredInitial.length);
    recordFinalSprintProgress(completedSession, percent);
    recordModuleChamberProgress(completedSession, percent);
    if (completedSession.setId) {
      profile.completed[completedSession.courseId] = profile.completed[completedSession.courseId] || {};
      var record = profile.completed[completedSession.courseId][String(completedSession.setId)] || {attempts: 0, best: 0};
      record.attempts += 1;
      record.last = percent;
      record.best = Math.max(record.best, percent);
      profile.completed[completedSession.courseId][String(completedSession.setId)] = record;
    }
    if (completedSession.kind === "practice-check") profile.lastMock[completedSession.courseId] = {percent: percent, shape:completedSession.shape, generic:true, at:new Date().toISOString()};
    profile.active = null;
    saveProfile();
    lastFinished = completedSession;
    renderDashboard();
    renderResults(completedSession, percent);
    showScreen("results-screen");
  }

  function renderResults(completedSession, percent) {
    var initialResponses = completedSession.responses.filter(function (response) { return response.initial; });
    var scoredInitial = initialResponses.filter(function (response) { return response.scored !== false; });
    var constructed = initialResponses.filter(function (response) { return response.subjective; });
    var machineGraded = constructed.filter(function (response) { return response.machineGraded; });
    var initialCorrect = scoredInitial.filter(function (response) { return response.correct; }).length;
    var initialMissed = scoredInitial.filter(function (response) { return !response.correct; }).length;
    var reattempts = completedSession.responses.filter(function (response) { return response.isReattempt && response.correct; }).length;
    var evidenceResponses = completedSession.responses.filter(function (response) { return !response.primer; });
    var touched = unique(evidenceResponses.reduce(function (values, response) { return values.concat(response.conceptIds || [response.conceptId]); }, []));
    var improved = touched.filter(function (conceptId) {
      return STATUS_ORDER[conceptStatus(completedSession.courseId, conceptId)] > STATUS_ORDER[completedSession.initialStatuses[conceptId]];
    }).length;
    var isMiniMock = completedSession.kind === "confidence-sprint";
    var isFinalMini = completedSession.kind === "final-sprint";
    var isPaperPattern = completedSession.kind === "paper-pattern";
    var isModuleChamber = completedSession.kind === "module-chamber";
    var partMarked = scoredInitial.filter(function (response) { return response.msqMarks && response.msqMarks.awarded === 1; }).length;
    var miniPossible = scoredInitial.reduce(function (sum, response) { return sum + (response.msqMarks ? 2 : 1); }, 0);

    var course = getCourse(completedSession.courseId);
    var path = courseRunPath(completedSession.courseId);
    var completedRun = path.sequence.filter(function (run) { return run.definition.id === completedSession.setId; })[0] || null;
    var nextRun = path.current;
    var nextCarry = nextRun
      ? plannedCarryForward(completedSession.courseId, questionIdsForSet(completedSession.courseId, nextRun.definition), 2)
      : {ids:[], names:[]};

    function evidencePercentFromStatuses(statuses) {
      var points = course.concepts.reduce(function (sum, concept) {
        var status = statuses[concept.id] || "unseen";
        return sum + (status === "strong" ? 1 : status === "developing" ? .5 : 0);
      }, 0);
      return Math.round(points / Math.max(1, course.concepts.length) * 100);
    }

    var beforeEvidence = evidencePercentFromStatuses(completedSession.initialStatuses || {});
    var nowEvidence = courseStats(completedSession.courseId).weighted;
    var improvedConcepts = improved ? touched.filter(function (conceptId) {
      return STATUS_ORDER[conceptStatus(completedSession.courseId, conceptId)] > STATUS_ORDER[completedSession.initialStatuses[conceptId]];
    }).map(function (conceptId) { return getConcept(completedSession.courseId, conceptId); }).filter(Boolean) : [];
    var correctConcepts = unique(scoredInitial.filter(function (response) { return response.correct; }).reduce(function (ids, response) {
      return ids.concat(response.conceptIds || [response.conceptId]);
    }, [])).map(function (conceptId) { return getConcept(completedSession.courseId, conceptId); }).filter(Boolean);
    var struggledConcepts = unique(scoredInitial.filter(function (response) { return !response.correct; }).reduce(function (ids, response) {
      return ids.concat(response.conceptIds || [response.conceptId]);
    }, [])).map(function (conceptId) { return getConcept(completedSession.courseId, conceptId); }).filter(Boolean);

    $("results-kicker").textContent = isPaperPattern
      ? "BRGSA pattern drill complete"
      : isFinalMini
      ? "Mini complete"
      : isMiniMock
      ? "Speedrun complete"
      : completedRun
      ? "Run " + completedRun.step + " of " + path.steps + " complete"
      : completedSession.kind === "written-practice" ? "Written practice complete" : "Practice complete";
    $("results-title").textContent = isPaperPattern
      ? "Eight modules, six recurring ways of being asked."
      : isFinalMini
      ? "Eight fast decisions, eight immediate corrections."
      : isMiniMock
      ? "You touched all eight modules. Keep the method, not the score."
      : completedRun ? "Run " + completedRun.step + " is clear. Here’s the quick look." : "Here’s what this practice changed.";
    $("results-copy").textContent = isPaperPattern
      ? "This was an SPMS-derived revision lens for BRGSA Section A, not an exam prediction. It does not alter mastery evidence; keep the question moves that exposed a weak distinction."
      : isFinalMini
      ? "This was accelerated revision, not an exam prediction. It does not alter mastery evidence; carry the corrected distinctions into the paper."
      : isMiniMock
      ? "This was a coached final-week Speedrun, not an exam prediction. Use the misses below as a short list of distinctions to carry into the next rotation."
      : nowEvidence > beforeEvidence
      ? "Your subject evidence moved from " + beforeEvidence + "% to " + nowEvidence + "%."
      : "Your evidence held at " + nowEvidence + "%. The useful change is knowing exactly what still needs another check.";

    var accuracyLabel = document.querySelector(".result-stats article:first-child small");
    if (accuracyLabel) accuracyLabel.textContent = isPaperPattern ? "Drill score" : isFinalMini ? "Mini score" : scoredInitial.length ? "Accuracy" : "Review mode";
    $("result-score").textContent = scoredInitial.length ? percent + "%" : "Self-check";
    $("score-caption").textContent = isPaperPattern
      ? "8 questions across all 8 BRGSA modules"
      : isFinalMini
      ? miniPossible + " available marks across 8 questions"
      : scoredInitial.length
      ? scoredInitial.length + " scored question" + (scoredInitial.length === 1 ? "" : "s")
      : constructed.length + " written response" + (constructed.length === 1 ? "" : "s");
    var resultLabels = $all(".result-stats article small");
    if (resultLabels[1]) resultLabels[1].textContent = isPaperPattern || isFinalMini ? "Fully correct" : "Correct first try";
    if (resultLabels[2]) resultLabels[2].textContent = isPaperPattern || isFinalMini ? "Needs correction" : "Missed first try";
    if (resultLabels[3]) resultLabels[3].textContent = isPaperPattern ? "Question moves" : isFinalMini ? "One-mark MSQs" : "Concepts improved";
    $("result-correct").textContent = String(initialCorrect);
    $("result-missed").textContent = String(initialMissed);
    $("result-third-label").textContent = constructed.length ? (completedSession.mode === "simulation" ? "Written responses" : machineGraded.length ? "Written responses checked" : "Responses self-reviewed") : "Re-attempts passed";
    $("result-reattempts").textContent = String(constructed.length || reattempts);
    $("result-improved").textContent = String(isPaperPattern ? 6 : isFinalMini ? partMarked : improved);
    $("result-learned").textContent = isPaperPattern
      ? correctConcepts.length ? "You handled " + conceptNameList(correctConcepts.slice(0, 3)) + (correctConcepts.length > 3 ? " and " + (correctConcepts.length - 3) + " more" : "") + " through the new question patterns." : "Use the immediate corrections as your short revision list."
      : isFinalMini
      ? correctConcepts.length ? "You applied " + conceptNameList(correctConcepts.slice(0, 3)) + (correctConcepts.length > 3 ? " and " + (correctConcepts.length - 3) + " more" : "") + " cleanly." : "The useful result is the correction you just saw after every answer."
      : improvedConcepts.length
      ? conceptNameList(improvedConcepts.slice(0, 3)) + (improvedConcepts.length > 3 ? " and " + (improvedConcepts.length - 3) + " more" : "") + " gained a stronger evidence state."
      : correctConcepts.length
        ? "You applied " + conceptNameList(correctConcepts.slice(0, 3)) + " correctly; their evidence state held."
        : "This run established a baseline. No concept moved up an evidence state yet.";
    $("result-struggled").textContent = struggledConcepts.length
      ? conceptNameList(struggledConcepts.slice(0, 3)) + (struggledConcepts.length > 3 ? " and " + (struggledConcepts.length - 3) + " more" : "") + " caused a first-attempt miss."
      : "No scored concept caused a first-attempt miss in this run.";
    var nextMini = isMiniMock ? nextMiniMock(completedSession.courseId) : null;
    $("result-next").textContent = isPaperPattern
      ? "Use DEAL for each 5-mark case and PACER for each 10-mark descriptive answer; both structures are waiting on the Examiner home."
      : isFinalMini
      ? "A fresh Mini keeps the same subject format mix and rotates the question families."
      : isMiniMock
      ? nextMini.freshRotation
        ? "The complete concept cycle is clear. The next Speedrun starts a fresh rotation with different question families."
        : "Speedrun " + (nextMini.round.index + 1) + " of " + nextMini.cycle.rounds.length + " is next; it prioritises concepts this rotation has not reached yet."
      : nextRun
      ? "Run " + nextRun.step + " unlocks: " + nextRun.definition.title + "." +
        (nextCarry.names.length ? " Likely repeat: " + nextCarry.names.join(" and ") + "." : " No open difficulty needs carrying into it.")
      : "The nine-run path is clear. Replays and focused practice are now fully available.";

    var resultChart = document.querySelector(".result-chart");
    if (resultChart) resultChart.hidden = isFinalMini || isPaperPattern;
    var conceptReview = document.querySelector(".result-review-section");
    if (conceptReview) conceptReview.hidden = isFinalMini || isPaperPattern;
    $("result-before-bar").style.width = beforeEvidence + "%";
    $("result-now-bar").style.width = nowEvidence + "%";
    $("result-before-value").textContent = beforeEvidence + "%";
    $("result-now-value").textContent = nowEvidence + "%";
    $("result-bars").setAttribute("aria-label", course.shortTitle + " evidence was " + beforeEvidence +
      " percent before this run, is " + nowEvidence + " percent now, and the all-Strong evidence goal is 100 percent.");
    $("result-chart-note").textContent = nowEvidence > beforeEvidence
      ? "This run added " + (nowEvidence - beforeEvidence) + " evidence point" + (nowEvidence - beforeEvidence === 1 ? "" : "s") + ". The 100% line means every concept Strong, not a predicted exam score."
      : "The chart held level because no concept crossed an evidence-state boundary. The 100% goal means every concept Strong, not a predicted exam score.";

    var review = $("result-review");
    review.innerHTML = "";
    review.closest("details").open = false;
    touched.forEach(function (conceptId) {
      var concept = getConcept(completedSession.courseId, conceptId);
      var response = evidenceResponses.filter(function (item) { return (item.conceptIds || [item.conceptId]).indexOf(conceptId) >= 0; }).slice(-1)[0];
      var status = conceptStatus(completedSession.courseId, conceptId);
      var evidence = conceptEvidence(completedSession.courseId, conceptId);
      var confidenceCopy = evidence.openConfidentError ? evidence.confidenceLabel : evidence.confidenceCount ? evidence.confidenceCount + " diagnostic confidence check" + (evidence.confidenceCount === 1 ? "" : "s") + " recorded" : "No confidence inference from this concept";
      var article = document.createElement("article");
      article.className = "review-item " + status;
      article.innerHTML = "<small>" + STATUS_LABEL[status] + "</small><div class='review-evidence'>" + courseEvidenceTagsHtml(String(response.source || "").split(/\s+\+\s+/), completedSession.courseId) + "</div><b>" + escapeHtml(concept ? concept.name : response.node) + "</b><p>" + escapeHtml(evidence.reasons[evidence.reasons.length - 1] || response.link) + "</p><span>" + escapeHtml(confidenceCopy) + "</span>";
      review.appendChild(article);
    });
    if (!touched.length) review.innerHTML = "<p>No concept response was recorded.</p>";
    renderAnswerReview(completedSession);
    $("results-home").textContent = isPaperPattern ? "← Back to BRGSA paper patterns" : isFinalMini ? "← Back to Minis" : isMiniMock ? "← Back to Speedruns" : "← Revision home";
    $("result-primary").innerHTML = isPaperPattern
      ? "Review the written-answer playbook <span aria-hidden='true'>→</span>"
      : isFinalMini
      ? "Start a fresh Mini <span aria-hidden='true'>→</span>"
      : isMiniMock
      ? (nextMini.freshRotation ? "Start fresh rotation" : "Start next Speedrun") + " <span aria-hidden='true'>→</span>"
      : recommendationActionLabel(recommendation(completedSession.courseId)) + " <span aria-hidden='true'>→</span>";
    $("result-primary").onclick = isPaperPattern
      ? openBrgsaWritingPlaybook
      : isFinalMini
      ? function () { startFinalSprint(completedSession.courseId); }
      : isMiniMock
      ? function () { startConfidenceSprint(completedSession.courseId, nextMini.round.index, nextMini.rotation); }
      : function () { executeRecommendation(); };
    $("repeat-set").textContent = isPaperPattern ? "Repeat this drill" : isFinalMini ? "Repeat this Mini" : isMiniMock ? "Repeat this Speedrun" : completedSession.kind === "practice-check" || completedSession.kind === "practice-shape" || completedSession.kind === "written-practice" ? "Repeat this practice" : "Replay this run";
    $("repeat-set").onclick = repeatFinished;

    if (isModuleChamber) {
      var missedIds = unique(scoredInitial.filter(function (response) { return !response.correct; }).reduce(function (ids, response) {
        return ids.concat(response.conceptIds || [response.conceptId]);
      }, []));
      $("results-kicker").textContent = completedSession.courseId + " · Module " + completedSession.studyModule + " chamber complete";
      $("results-title").textContent = missedIds.length ? "The chamber found a short repair list." : "This sample is clear. Keep reading forward.";
      $("results-copy").textContent = "This was a four-question module sample, not a claim that every concept was tested. Scored misses write diagnostic evidence; the IBM paragraph remains an ungraded answer-spine check.";
      if (accuracyLabel) accuracyLabel.textContent = "Direct checks";
      $("score-caption").textContent = scoredInitial.length + " scored checks" + (constructed.length ? " + 1 answer paragraph" : "") + " from this module";
      if (resultLabels[1]) resultLabels[1].textContent = "Clear";
      if (resultLabels[2]) resultLabels[2].textContent = "Repair";
      if (resultLabels[3]) resultLabels[3].textContent = "Repair suggestions";
      $("result-third-label").textContent = constructed.length ? "Answer spines revealed" : "No hidden reattempts";
      $("result-reattempts").textContent = String(constructed.length);
      $("result-improved").textContent = String(missedIds.length);
      $("result-learned").textContent = correctConcepts.length
        ? conceptNameList(correctConcepts.slice(0, 3)) + " held up in direct recall or application."
        : "Use the immediate corrections; this chamber did not find a clean scored check yet.";
      $("result-struggled").textContent = missedIds.length
        ? conceptNameList(missedIds.map(function (id) { return getConcept(completedSession.courseId, id); }).filter(Boolean).slice(0, 3)) + " should be repaired from its exact course layer."
        : "No scored concept caused a miss in this sample.";
      $("result-next").textContent = missedIds.length
        ? "Repair only the named misses, then retest this module on a rotated four-question sample."
        : "Return to the module notes or continue to the next module; no extra practice has been queued.";
      if (resultChart) resultChart.hidden = true;
      if (conceptReview) conceptReview.hidden = false;
      if (review.closest("details")) review.closest("details").open = true;
      touched.forEach(function (conceptId, index) {
        if (missedIds.indexOf(conceptId) < 0 || !review.children[index]) return;
        var repair = document.createElement("button");
        repair.type = "button";
        repair.className = "chamber-repair";
        repair.textContent = "Repair this concept";
        repair.addEventListener("click", function () { startConceptPractice(completedSession.courseId, conceptId); });
        review.children[index].appendChild(repair);
      });
      $("results-home").textContent = "← Back to module " + completedSession.studyModule + " study";
      $("result-primary").innerHTML = "Return to module notes <span aria-hidden='true'>→</span>";
      $("result-primary").onclick = function () { openNotes({courseId:completedSession.courseId, module:completedSession.studyModule}); };
      $("repeat-set").textContent = "Retest with a rotated sample";
      $("repeat-set").onclick = function () { startModuleChamber(completedSession.courseId, completedSession.studyModule); };
    }
  }

  function selectedAnswerList(question, response) {
    if (response.subjective) return [response.selected];
    if (question.type === "primer") return [String(response.selected || "").trim() || "No prediction made"];
    if (question.type === "mcq" || !question.type) return [question.options[response.selected] || "No answer recorded"];
    if (question.type === "match") return question.rows.map(function (row, index) { return row.label + " → " + question.choices[response.selected[index]]; });
    if (question.type === "boss") return question.steps.map(function (step, index) { return step.label + ": " + step.options[response.selected[index]]; });
    return question.blanks.map(function (blank, index) { return blank.label + ": " + blank.options[response.selected[index]]; });
  }

  function renderAnswerReview(completedSession) {
    var section = $("answer-review-section");
    var holder = $("answer-review");
    if (completedSession.mode !== "simulation") {
      section.hidden = true;
      holder.innerHTML = "";
      return;
    }
    section.hidden = false;
    holder.innerHTML = "";
    completedSession.responses.filter(function (response) { return response.initial; }).forEach(function (response, index) {
      var question = getQuestion(completedSession.courseId, response.id);
      var article = document.createElement("article");
      article.className = response.subjective ? "reviewed" : response.correct ? "correct" : "wrong";
      var chosen = selectedAnswerList(question, response);
      var correct = correctAnswerKey(question);
      var rubric = response.subjective ? "<p><b>Rubric</b></p><ul>" + (question.rubric || []).map(function (criterion) { return "<li><b>" + escapeHtml(criterion.label) + ":</b> " + escapeHtml(criterion.description) + "</li>"; }).join("") + "</ul>" : "";
      var writtenResult = response.machineGraded
        ? "<b>Dungeon written-authority mark:</b> " + response.rubricScore + " of " + response.rubricTotal + ". Source-cited practice judgement; not official and not Strong evidence."
        : response.rubricDeferred
          ? "This response was held for comparison at the end and was not automatically graded."
          : "<b>Self-review:</b> " + response.rubricScore + " of " + response.rubricTotal + " criteria selected. This is not an automatic grade.";
      article.innerHTML = "<h3>" + (index + 1) + ". " + escapeHtml(question.stem) + "</h3>" +
        (response.subjective ? "<p><b>Your response:</b> " + escapeHtml(response.selected) + "</p><p>" + writtenResult + "</p>" : "<p><b>Result:</b> " + (response.correct ? "Correct" : "Needs repair") + "</p>") +
        "<details" + (response.subjective ? " open" : "") + "><summary>Compare the response and explanation</summary><p><b>Your answer</b></p><ul>" + chosen.map(function (copy) { return "<li>" + escapeHtml(copy) + "</li>"; }).join("") + "</ul><p><b>Grounded answer</b></p><ul>" + correct.map(function (copy) { return "<li>" + escapeHtml(copy) + "</li>"; }).join("") + "</ul>" + rubric + "<p>" + escapeHtml(question.explanation) + "</p></details>";
      holder.appendChild(article);
    });
  }

  function repeatFinished() {
    if (!lastFinished) return goDashboard();
    if (lastFinished.kind === "module-chamber") return startModuleChamber(lastFinished.courseId, lastFinished.studyModule);
    if (lastFinished.kind === "paper-pattern") return startPaperPatternRevision(lastFinished.courseId);
    if (lastFinished.kind === "final-sprint") return startFinalSprint(lastFinished.courseId, lastFinished.finalSprintRotation);
    if (lastFinished.kind === "confidence-sprint") return startConfidenceSprint(lastFinished.courseId, lastFinished.confidenceRound, lastFinished.confidenceRotation);
    if (lastFinished.setId) return startStudySet(lastFinished.courseId, lastFinished.setId);
    if (lastFinished.kind === "concept") return startConceptPractice(lastFinished.courseId, lastFinished.conceptId);
    if (lastFinished.kind === "written-practice") return startWrittenPractice(lastFinished.courseId);
    if (lastFinished.kind === "practice-check" || lastFinished.kind === "practice-shape") {
      profile.selectedCourse = lastFinished.courseId;
      return startBuiltPractice({
        // A run saved before difficulty was a dial has no band, and "any" is exactly
        // what it drew from, so repeating it repeats the same pool.
        band: lastFinished.band || "any",
        shape: lastFinished.shape || "mixed",
        focus: lastFinished.focus || "all",
        length: lastFinished.length || "standard",
        mode: lastFinished.mode || "learning"
      });
    }
    startPriorityPractice(lastFinished.courseId);
  }

  function goDashboard() {
    requestLeaveLivePaper(function () {
      if (profile && profile.active && profile.active.subjectiveStage === "grading") {
        profile.active.subjectiveStage = null;
        saveProfile();
      }
      session = null;
      selected = null;
      confidence = null;
      /* The brand button is in the header, so this is also the way home from the
         examiner — which makes it a crossing, and it should look like one. */
      crossProducts("learn", function () { renderNotes(); showScreen("notes-screen"); });
    });
  }

  function leavePractice() {
    if (session) {
      profile.active = clone(session);
      saveProfile();
    }
    if (isRevisionSprint(session)) return openExamHome();
    if (session && session.kind === "module-chamber") return openNotes({courseId:session.courseId, module:session.studyModule});
    goDashboard();
  }

  function leaveResults() {
    if (isRevisionSprint(lastFinished)) return openExamHome();
    if (lastFinished && lastFinished.kind === "module-chamber") return openNotes({courseId:lastFinished.courseId, module:lastFinished.studyModule});
    goDashboard();
  }

  function confirmReset() {
    try { localStorage.removeItem(profileStorageKey()); } catch (error) {}
    profile = defaultProfile();
    session = null;
    lastFinished = null;
    saveProfile();
    $("reset-dialog").close();
    renderDashboard();
    showScreen("dashboard-screen");
    toast("Your Term 6 progress was reset.");
  }

  async function signOut() {
    if (!BACKEND_ACTIVE) return;
    setSyncStatus("Signing out…");
    try { await saveChain; } catch (error) {}
    try {
      await fetch(SESSION_ENDPOINT, {
        method:"DELETE",
        credentials:"same-origin",
        cache:"no-store"
      });
    } catch (error) {}
    window.location.replace("./");
  }

  async function markCommunityOpened() {
    if (!BACKEND_ACTIVE || communityState.joined) return;
    $("community-joined").disabled = true;
    $("community-joined").textContent = "Recording invite click…";
    try {
      var response = await fetch(COMMUNITY_ENDPOINT, {
        method:"PATCH",
        credentials:"same-origin",
        cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"opened"})
      });
      var payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "The invite click could not be recorded.");
      communityState = payload.community;
      renderCommunityReminder();
    } catch (error) {
      $("community-joined").textContent = "Open the invite again";
      toast(error.message || "The invite click could not be recorded.");
    }
  }

  async function acknowledgeCommunity() {
    if (!BACKEND_ACTIVE || communityState.joined || !communityState.inviteOpenedAt) return;
    $("community-joined").disabled = true;
    $("community-joined").textContent = "Saving…";
    try {
      var response = await fetch(COMMUNITY_ENDPOINT, {
        method:"PATCH",
        credentials:"same-origin",
        cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"acknowledge"})
      });
      var payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "The acknowledgement could not be saved.");
      communityState = payload.community;
      renderCommunityReminder();
      toast("WhatsApp group acknowledgement saved.");
    } catch (error) {
      renderCommunityReminder();
      toast(error.message || "The acknowledgement could not be saved.");
    }
  }

  function toast(copy) {
    var node = $("toast");
    node.textContent = copy;
    node.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { node.classList.remove("show"); }, 2200);
  }

  function seedScenarioProgress() {
    var now = Date.now();
    COURSE_IDS.forEach(function (courseId, courseIndex) {
      getCourse(courseId).concepts.forEach(function (concept, index) {
        var surfaces = questionSurfaces(courseId, concept.id);
        if (!surfaces.length) return;
        var mode = (index + courseIndex) % 4;
        var byType = function (type) { return surfaces.filter(function (question) { return question.type === type; })[0]; };
        var picks = unique([byType("mcq"), byType("cloze"), byType("case-cloze"), byType("match"), byType("boss")].filter(Boolean));
        if (!picks.length) return;
        if (mode === 0 && picks.length >= 5) {
          picks.slice(0, 3).forEach(function (question, pickIndex) { recordAttempt(courseId, question, true, pickIndex ? "medium" : "low", {at:now - (28 - pickIndex) * 60 * 60 * 1000}, "scenario-early-" + courseId); });
          recordAttempt(courseId, picks[3], false, "low", {at:now - 3 * 60 * 60 * 1000}, "scenario-late-" + courseId);
          recordAttempt(courseId, picks[4], true, "high", {at:now - 60 * 60 * 1000}, "scenario-late-" + courseId);
        } else if (mode === 1) {
          recordAttempt(courseId, picks[0], true, "low", {at:now - 2 * 60 * 60 * 1000}, "scenario-building-" + courseId);
          recordAttempt(courseId, picks[Math.min(1, picks.length - 1)], true, "medium", {at:now - 60 * 60 * 1000}, "scenario-building-" + courseId);
        } else if (mode === 2) {
          recordAttempt(courseId, picks[0], true, "medium", {at:now - 3 * 60 * 60 * 1000}, "scenario-needs-" + courseId);
          recordAttempt(courseId, picks[Math.min(1, picks.length - 1)], false, "high", {at:now - 2 * 60 * 60 * 1000}, "scenario-needs-" + courseId);
          recordAttempt(courseId, picks[Math.min(2, picks.length - 1)], false, "medium", {at:now - 60 * 60 * 1000}, "scenario-needs-" + courseId);
        }
      });
    });
  }

  function seedMeasurementEvidenceScenario(includeEstablishedStrong) {
    var courseId = "BRGSA";
    var concepts = getCourse(courseId).concepts.slice(0, 2);
    var now = Date.now();
    profile.selectedCourse = courseId;
    profile.conceptAttempts[courseId] = {};

    concepts.forEach(function (concept, conceptIndex) {
      profile.conceptAttempts[courseId][concept.id] = ["mcq", "cloze", "case-cloze", "match", "mcq"].map(function (type, index) {
        var rapidGuess = conceptIndex === 1 && index === 4;
        return {
          questionId: "measurement-" + conceptIndex + "-" + index,
          variantFamily: "measurement-family-" + index,
          perspective: index === 2 ? "apply" : "explain",
          type: type,
          skills: [],
          difficulty: index === 2 ? 3 : 2,
          boss: false,
          scored: true,
          correct: true,
          wholeItemCorrect: true,
          partial: 1,
          confidence: "medium",
          confidencePrompted: true,
          confidenceSkipped: false,
          misconception: null,
          hintUsed: false,
          assistanceUsed: false,
          revealedSteps: false,
          bossStepsPassed: 0,
          bossStepsFailed: 0,
          bossStepsTotal: 0,
          transfer: index === 2,
          isReattempt: index === 4,
          durationBucket: rapidGuess ? "under-5s" : "15-30s",
          rapidGuess: rapidGuess,
          strongEligible: !rapidGuess,
          blockId: index < 3 ? "measurement-early" : "measurement-late",
          at: now - (30 - index * 7) * 60 * 60 * 1000
        };
      });
    });
    if (includeEstablishedStrong) {
      var established = concepts[0];
      profile.conceptAttempts[courseId][established.id].push({
        questionId: "measurement-established-rapid",
        variantFamily: "measurement-established-rapid",
        perspective: "explain",
        type: "mcq",
        skills: [],
        difficulty: 2,
        boss: false,
        scored: true,
        correct: true,
        wholeItemCorrect: true,
        partial: 1,
        confidence: "medium",
        confidencePrompted: true,
        confidenceSkipped: false,
        misconception: null,
        hintUsed: false,
        assistanceUsed: false,
        revealedSteps: false,
        bossStepsPassed: 0,
        bossStepsFailed: 0,
        bossStepsTotal: 0,
        transfer: false,
        isReattempt: true,
        durationBucket: "under-5s",
        rapidGuess: true,
        strongEligible: false,
        blockId: "measurement-latest",
        at: now
      });
    }
    profile.totalAnswers = includeEstablishedStrong ? 11 : 10;
  }

  function demoSelection(question, shouldBeCorrect) {
    if (question.type === "short-answer") return "I would name the governing idea, make a recommendation from the case evidence, and explain the causal reason behind that decision.";
    if (question.type === "primer") return "I think this is about committing to a decision rule before the evidence arrives, so the result cannot be reinterpreted afterwards.";
    if (question.type === "mcq" || !question.type) return shouldBeCorrect ? question.answer : (question.answer + 1) % question.options.length;
    var parts = question.type === "boss" ? question.steps : question.type === "match" ? question.rows : question.blanks;
    return parts.map(function (part, index) {
      if (shouldBeCorrect || index > 0) return part.answer;
      var options = question.type === "match" ? question.choices : part.options;
      return (part.answer + 1) % options.length;
    });
  }

  function openQuestionScenario(courseId, question, resolved) {
    session = createSession(courseId, {kind:"concept",conceptId:question.conceptId,title:question.node,kicker:question.pattern}, [question.id]);
    profile.selectedCourse = courseId;
    profile.active = clone(session);
    beginPractice();
    if (resolved) {
      selected = demoSelection(question, false);
      session.selected = Array.isArray(selected) ? selected.slice() : selected;
      setConfidence("high");
      commitAnswer();
      if (question.type === "short-answer" && session.subjectiveStage === "rubric") {
        session.rubricSelection = [0, 1];
        commitAnswer();
      }
    }
  }

  function openMeasurementQuestionScenario(restored, type) {
    type = type || "mcq";
    var courseId = type === "msq" ? "SPMS" : "BRGSA";
    var question = Object.keys(getCourse(courseId).questions).map(function (id) {
      return getQuestion(courseId, id);
    }).filter(function (candidate) { return candidate.type === type; })[0];
    session = createSession(courseId, {kind:"concept", conceptId:question.conceptId, title:question.node, kicker:"Measurement check"}, [question.id]);
    /* This is a deterministic instrumentation fixture, not a learner route. Keep
       only the scored item so the Browser can commit inside the rapid threshold. */
    session.queue = [{id:question.id, initial:true, isReattempt:false, origin:null, askConfidence:false}];
    session.baseCount = 1;
    if (restored) session.selected = question.answer;
    profile.selectedCourse = courseId;
    profile.active = clone(session);
    beginPractice();
  }

  function openRoutineQuestionScenario() {
    var question = Object.keys(getCourse("BRGSA").questions).map(function (id) { return getQuestion("BRGSA", id); }).filter(function (item) { return item.type === "mcq"; })[0];
    session = createSession("BRGSA", {kind:"concept",conceptId:question.conceptId,title:question.node,kicker:"Routine retrieval"}, [question.id]);
    session.queue[0].askConfidence = false;
    profile.selectedCourse = "BRGSA";
    profile.active = clone(session);
    beginPractice();
  }

  function openMiniMockScenario(resolved) {
    var requested = new URLSearchParams(window.location.search).get("course");
    var courseId = EXAM_PAPERS[requested] ? requested : "SPMS";
    startConfidenceSprint(courseId, 0, 0);
    if (!resolved) return;
    var question = currentQuestion();
    selected = demoSelection(question, false);
    session.selected = Array.isArray(selected) ? selected.slice() : selected;
    commitAnswer();
    if (question.type === "short-answer" && session.subjectiveStage === "rubric") {
      session.rubricSelection = [0, 1];
      commitAnswer();
    }
  }

  function renderSimulationResultsScenario() {
    var courseId = "IBM";
    var ids = practiceShapeQuestionIds(courseId, "mixed");
    session = createSession(courseId, {kind:"practice-check",mode:"simulation",shape:"mixed",title:"Mixed-format practice",kicker:"Generic practice check · feedback at the end"}, ids);
    profile.selectedCourse = courseId;
    session.queue.forEach(function (item, index) {
      var question = getQuestion(courseId, item.id);
      var before = conceptStatus(courseId, question.conceptId);
      var confidenceValue = index % 3 === 0 ? (index % 2 ? "high" : "low") : null;
      item.askConfidence = !!confidenceValue;
      if (question.type === "short-answer") {
        var subjectiveEvaluation = {scored:false,correct:null,partial:0,conceptResults:{},constructedScore:2,constructedTotal:question.rubric.length};
        session.responses.push({id:question.id,conceptId:question.conceptId,conceptIds:[question.conceptId],node:question.node,source:question.source,selected:"A concise recommendation that names the framework, applies it to the case, and gives the causal reason.",confidence:confidenceValue,confidencePrompted:!!confidenceValue,correct:null,scored:false,subjective:true,rubricSelection:[0,2],rubricScore:2,rubricTotal:question.rubric.length,evaluation:subjectiveEvaluation,isReattempt:false,initial:true,perspective:question.perspective,statusBefore:before,statusAfter:before,explanation:question.explanation,link:question.link});
        return;
      }
      selected = demoSelection(question, index % 3 !== 1);
      var evaluation = evaluateResponse(question);
      session.responses.push({id:question.id,conceptId:question.conceptId,conceptIds:unique([question.conceptId].concat(question.supportingConceptIds || [])),node:question.node,source:unique(question.sourceIds || [question.source]).join(" + "),selected:Array.isArray(selected) ? selected.slice() : selected,confidence:confidenceValue,confidencePrompted:!!confidenceValue,correct:evaluation.correct,scored:true,partial:evaluation.partial,partResults:evaluation.partResults,conceptResults:evaluation.conceptResults,misconception:evaluation.misconception,isReattempt:false,initial:true,perspective:question.perspective,statusBefore:before,statusAfter:before,explanation:question.explanation,link:question.link});
    });
    session.index = session.queue.length;
    finishSession();
  }

  function seedWrittenRecommendationScenario() {
    profile.selectedCourse = "BRGSA";
    profile.writtenPractice.BRGSA = {
      accepted:2,
      lastAt:Date.now(),
      criteria:{
        understanding:{attempts:2, met:2, confirmationsNeeded:0, lastAt:Date.now(), recent:[]},
        judgement:{attempts:2, met:0, confirmationsNeeded:2, lastAt:Date.now(), recent:[]}
      },
      questions:{}
    };
    renderDashboard();
    showScreen("dashboard-screen");
  }

  function openWrittenRepairScenario() {
    var courseId = "BRGSA";
    var questions = Object.keys(getCourse(courseId).questions).map(function (id) { return getQuestion(courseId, id); })
      .filter(function (question) { return question.type === "short-answer"; }).slice(0, 2);
    session = createSession(courseId, {
      kind:"written-practice",
      mode:"learning",
      shape:"generation",
      focus:"all",
      length:"written",
      title:"Written application diagnosis",
      kicker:"2 Dungeon-chosen prompts · diagnosis across two criteria"
    }, questions.map(function (question) { return question.id; }));
    /* Scenario instrumentation needs the actual grading and adaptive queue path,
       not the unrelated first-contact lessons and primers. */
    session.queue = questions.map(function (question) { return {id:question.id, initial:true, isReattempt:false, origin:null, askConfidence:false}; });
    session.baseCount = questions.length;
    session.supportCount = 0;
    profile.selectedCourse = courseId;
    profile.active = clone(session);
    beginPractice();
    selected = "I would make a decision, but this deliberately incomplete scenario answer does not apply or support it.";
    session.selected = selected;
    confidence = "medium";
    session.confidence = confidence;
    var source = lectureIdsFor(questions[0])[0];
    finalizeWrittenGradedAnswer({
      authority:"dungeon-local-practice",
      model:"scenario-authority",
      score:0,
      maxScore:questions[0].rubric.length,
      criteria:questions[0].rubric.map(function (criterion) {
        var gap = (questions[0].writtenGaps || []).filter(function (candidate) { return candidate.criterionId === criterion.id; })[0];
        return {id:criterion.id, label:criterion.label, decision:"not_met", marksAwarded:0, gapCodes:gap ? [gap.id] : [], answerEvidence:"", sourceCitations:[source], reason:"The answer leaves this criterion open."};
      }),
      feedback:"Name the governing idea, then connect one decisive case fact to the recommendation.",
      retrieval:[{citation:source, lectureId:source, title:"Scenario evidence"}]
    });
  }

  function openExamWrittenReviewScenario() {
    try {
      var courseId = "BRGSA";
      var question = Object.keys(getCourse(courseId).questions).map(function (id) { return getQuestion(courseId, id); })
        .filter(function (candidate) { return candidate.type === "short-answer" && candidate.writtenMode === "case"; })[0];
      var paper = examPaperForSet(courseId, 0);
      exam = {
        paper:paper, courseId:courseId, setIndex:0,
        items:[{index:0, section:"C", marks:10, question:question,
          response:question.exemplar, marked:false, visited:true,
          seconds:220, visits:1, changes:0, firstResponse:question.exemplar, firstResponseSeconds:220}],
        current:0, section:"C", remaining:EXAM_MINUTES * 60 - 220,
        started:true, submitted:true
      };
      showScreen("exam-screen");
      $("exam-brief").hidden = true;
      renderExamResult(false);
    } catch (error) {
      document.body.setAttribute("data-scenario-error", String(error && (error.stack || error.message) || error));
      throw error;
    }
  }

  function openExamQuestionScenario() {
    var requested = new URLSearchParams(window.location.search).get("course");
    var courseId = EXAM_PAPERS[requested] ? requested : "SCLM";
    openExaminer(courseId, 0);
    beginExam();
    renderCalculator();
  }

  function applyScenario(name) {
    scenarioMode = true;
    profile = defaultProfile();
    document.body.setAttribute("data-scenario", name);
    if (name === "dashboard-progress") {
      seedScenarioProgress();
      renderDashboard();
      return showScreen("dashboard-screen");
    }
    if (name === "measurement-evidence") {
      seedMeasurementEvidenceScenario();
      renderDashboard();
      return showScreen("dashboard-screen");
    }
    if (name === "measurement-established-strong") {
      seedMeasurementEvidenceScenario(true);
      renderDashboard();
      return showScreen("dashboard-screen");
    }
    if (name === "written-recommendation") return seedWrittenRecommendationScenario();
    if (name === "written-repair") return openWrittenRepairScenario();
    if (name === "exam-written-review") return openExamWrittenReviewScenario();
    if (name === "exam-question") return openExamQuestionScenario();
    if (name === "exam-home") {
      examHomeMode = "exam";
      examTimeMode = "speedrun";
      renderExamHome();
      return showScreen("exam-home-screen");
    }
    if (name === "exam-mini") {
      examHomeMode = "exam";
      examTimeMode = "speedrun";
      renderExamHome();
      return showScreen("exam-home-screen");
    }
    if (name === "exam-final") {
      var finalCourse = new URLSearchParams(window.location.search).get("course");
      if (EXAM_PAPERS[finalCourse]) {
        profile.selectedCourse = finalCourse;
        finalSprintCourse = finalCourse;
      }
      examHomeMode = "exam";
      examTimeMode = "mini";
      renderExamHome();
      return showScreen("exam-home-screen");
    }
    if (name === "exam-full") {
      examHomeMode = "full";
      renderExamHome();
      return showScreen("exam-home-screen");
    }
    if (name === "exam-released") return openExaminer("IBM", EXAM_RELEASED_SET);
    if (name === "notes") {
      notesState.courseId = "SCLM";
      notesState.module = 1;
      renderNotes();
      return showScreen("notes-screen");
    }
    /* Print instrumentation renders the exact document the production buttons send
       to the browser's PDF dialog. It is deliberately scenario-only: release checks
       can generate and inspect an A4 module or one lecture without adding a learner
       route or duplicating the print markup. */
    if (name === "notes-print") {
      var printParams = new URLSearchParams(window.location.search);
      var printCourse = getCourse(printParams.get("course")) ? printParams.get("course") : "IBM";
      var printModule = Math.max(1, Math.min(notesModuleCount(printCourse), Number(printParams.get("module")) || 1));
      var printLecture = printParams.get("lecture");
      notesState.courseId = printCourse;
      notesState.module = printModule;
      notesState.printing = printLecture ? {type:"lecture", lectureId:printLecture} : {type:"module"};
      document.body.classList.add("printing-notes");
      document.body.classList.toggle("printing-lecture", !!printLecture);
      renderNotes();
      return showScreen("notes-screen");
    }
    if (name === "mini-question") return openMiniMockScenario(false);
    if (name === "mini-feedback") return openMiniMockScenario(true);
    /* These two scenarios used to select a tab. Nothing is mutually exclusive on the
     * homepage any more, so they open the matching block and scroll to it instead —
     * the same destination, reached the way a learner now reaches it. */
    if (name === "dashboard-concepts" || name === "dashboard-plan") {
      seedScenarioProgress();
      renderDashboard();
      showScreen("dashboard-screen");
      if (name === "dashboard-concepts") revealDisclosure("concepts-disclosure");
      var target = name === "dashboard-concepts" ? $("concept-shelf-title") : $("next-step-title");
      if (target) window.requestAnimationFrame(function () { target.scrollIntoView({block: "start", behavior: "smooth"}); });
      return;
    }
    if (name === "practice-setup") {
      seedScenarioProgress();
      renderDashboard();
      showScreen("dashboard-screen");
      return startPriorityPractice("BRGSA");
    }
    if (name === "simulation-results") return renderSimulationResultsScenario();
    if (name === "question") return startStudySet("SPMS", 1);
    if (name === "question-primer" || name === "question-primer-recovery") {
      var primerTarget = getQuestion("SPMS", getStudySet("SPMS", 1).questionIds[0]);
      var primerConcept = getConcept("SPMS", primerTarget.conceptId);
      profile.primerState.SPMS = {};
      profile.primerState.SPMS[primerConcept.id] = {support:3,easyStreak:0,shown:1,correct:0,wrong:1,lastAt:Date.now() - 1000};
      startStudySet("SPMS", 1);
      if (currentQuestion().type === "primer") {
        session.queue[0].primerLevel = 3;
        renderQuestion();
      }
      if (name === "question-primer-recovery") {
        // The reveal state: a prediction committed to, the rule shown against it.
        selected = demoSelection(currentQuestion(), false);
        session.selected = selected;
        commitAnswer();
      }
      return;
    }
    if (name === "question-routine") return openRoutineQuestionScenario();
    if (name === "question-mcq") return openQuestionScenario("BRGSA", Object.keys(getCourse("BRGSA").questions).map(function (id) { return getQuestion("BRGSA", id); }).filter(function (question) { return question.type === "mcq"; })[0], false);
    if (name === "measurement-question") return openMeasurementQuestionScenario(false, "mcq");
    if (name === "measurement-msq-question") return openMeasurementQuestionScenario(false, "msq");
    if (name === "measurement-restored-question") return openMeasurementQuestionScenario(true, "mcq");
    if (name === "question-cloze") return openQuestionScenario("IBM", Object.keys(getCourse("IBM").questions).map(function (id) { return getQuestion("IBM", id); }).filter(function (question) { return question.type === "case-cloze"; })[0], false);
    if (name === "question-match") return openQuestionScenario("SCLM", Object.keys(getCourse("SCLM").questions).map(function (id) { return getQuestion("SCLM", id); }).filter(function (question) { return question.type === "match"; })[0], false);
    if (name === "question-boss") return openQuestionScenario("SPMS", Object.keys(getCourse("SPMS").questions).map(function (id) { return getQuestion("SPMS", id); }).filter(function (question) { return question.type === "boss"; })[0], false);
    if (name === "question-boss-review") return openQuestionScenario("SPMS", Object.keys(getCourse("SPMS").questions).map(function (id) { return getQuestion("SPMS", id); }).filter(function (question) { return question.type === "boss"; })[0], true);
    if (name === "question-short-answer") return openQuestionScenario("BRGSA", Object.keys(getCourse("BRGSA").questions).map(function (id) { return getQuestion("BRGSA", id); }).filter(function (question) { return question.type === "short-answer"; })[0], false);
    if (name === "question-short-answer-review") return openQuestionScenario("BRGSA", Object.keys(getCourse("BRGSA").questions).map(function (id) { return getQuestion("BRGSA", id); }).filter(function (question) { return question.type === "short-answer"; })[0], true);
    if (name === "feedback") {
      var feedbackQuestion = Object.keys(getCourse("SCLM").questions).map(function (id) { return getQuestion("SCLM", id); })
        .filter(function (question) { return question.type === "mcq"; })[0];
      session = createSession("SCLM", {kind:"concept", conceptId:feedbackQuestion.conceptId, title:feedbackQuestion.node, kicker:"Feedback check"}, [feedbackQuestion.id]);
      /* Keep this browser fixture on the scored surface. Ordinary learner runs
       * still begin with the lesson that gives the question its vocabulary. */
      session.queue = [{id:feedbackQuestion.id, initial:true, isReattempt:false, origin:null, askConfidence:true}];
      session.baseCount = 1;
      profile.selectedCourse = "SCLM";
      profile.active = clone(session);
      beginPractice();
      selected = demoSelection(feedbackQuestion, false);
      session.selected = selected;
      setConfidence("high");
      return commitAnswer();
    }
    if (name === "priority") {
      var course = getCourse("IBM");
      recordAttempt("IBM", questionSurfaces("IBM", course.concepts[0].id)[0], false, "high", {at:Date.now() - 1000}, "priority-seed");
      recordAttempt("IBM", questionSurfaces("IBM", course.concepts[1].id)[0], true, "low", {at:Date.now()}, "priority-seed");
      return startPriorityPractice("IBM");
    }
    if (name === "results") {
      profile.selectedCourse = "IBM";
      session = createSession("IBM", {kind:"set",setId:1,title:getStudySet("IBM",1).title,kicker:"Study set 1 of 10"}, getStudySet("IBM",1).questionIds);
      session.queue.forEach(function (item, index) {
        var question = getQuestion("IBM", item.id);
        var correct = index !== 1;
        var before = conceptStatus("IBM", question.conceptId);
        recordAttempt("IBM", question, correct, correct ? "medium" : "high", {at:Date.now() + index}, session.blockId);
        session.responses.push({id:question.id,conceptId:question.conceptId,node:question.node,source:question.source,correct:correct,confidence:correct ? "medium" : "high",isReattempt:false,initial:true,perspective:question.perspective,statusBefore:before,statusAfter:conceptStatus("IBM",question.conceptId),link:question.link});
      });
      session.index = session.queue.length;
      return finishSession();
    }
    renderDashboard();
    showScreen("dashboard-screen");
  }

  /* ==========================================================================
   * Dungeon, the examiner
   * ==========================================================================
   *
   * A second product sharing one bank. The learning system's whole job is to order
   * questions so you can succeed at them — lecture before test, weak concepts first,
   * feedback after every answer. This one deliberately does none of that, because
   * what it is for is the opposite: meeting the paper cold, at length, on a clock.
   *
   * The paper shapes below are docs/briefs/T6_EXAM_PATTERN.md, which is the authority
   * for structure and outranks anything else in the repo. Nothing here is invented:
   * sections, counts, per-question marks, duration, marking rules, and calculator
   * rules are all from that file. Where the bank cannot fill a section, the brief
   * says so in the learner's own terms rather than padding with the wrong format —
   * an MSQ section quietly filled with MCQs would train the wrong interaction and
   * scoring instinct on the real P-type section.
   */
  var EXAM_MINUTES = 120;
  var EXAM_PAPERS = {
    SPMS: {
      title: "Software Product Management for Startups",
      sat: "22 August, 09:00–11:00",
      total: 75,
      calculator: null,
      sections: [
        {id: "A", label: "Section A", type: "mcq", count: 35, marks: 1,
         rule: "One correct option. One mark each. No negative marking."},
        {id: "B", label: "Section B", type: "msq", count: 20, marks: 2, negative: false,
         rule: "P-type MSQ: exactly two options are correct and at most two may be selected. Both correct = 2 marks; one correct with no wrong option = 1; any response containing a wrong option = 0. No direct negative marking."}
      ]
    },
    BRGSA: {
      title: "Business Research and Growth Systems Architecture",
      sat: "22 August, 13:00–15:00",
      total: 80,
      calculator: "basic",
      sections: [
        {id: "A", label: "Section A", type: "mcq", count: 20, marks: 2,
         rule: "One correct option. Two marks each. No negative marking."},
        {id: "B", label: "Section B", type: "case-cloze", count: 4, marks: 5,
         rule: "A short scenario, then a task. Address every part of the task directly."},
        /* `prefer` was the fix for a section drawing the wrong KIND of item.
         *
         * Section C is two ten-mark structured responses. Its pool is 36 written
         * items, of which 32 are per-concept prompts running three to five minutes
         * ("in two to three sentences, explain X in your own words") and four are the
         * integrated scenarios built for exactly this slot. A flat draw took two of
         * 36, so the odds were four in five that a ten-mark slot was filled by a
         * three-minute prompt, and three of the four scenarios written for this
         * section reached no set the product offers. That is a paper-composition
         * defect, not a missing-content one — the content was there all along. */
        {id: "C", label: "Section C", type: "short-answer", count: 2, marks: 10,
         prefer: ["integrated", "case", "short"],
         rule: "A complete structured response. No feedback during the paper; after submission Dungeon can issue a course-grounded practice review, never an official mark."}
      ]
    },
    SCLM: {
      title: "Supply Chain & Logistics Management",
      sat: "23 August, 13:00–15:00",
      total: 80,
      calculator: "scientific",
      /* The real paper supplies these. Withholding one makes every z-based question
         unanswerable, which is a different exam, not a harder one. */
      tables: ["standard-normal"],
      sections: [
        {id: "A", label: "Section A", type: "mcq", count: 50, marks: 1,
         rule: "One correct option. One mark each. No negative marking."},
        {id: "B", label: "Section B", type: "numeric", count: 6, marks: 4,
         rule: "Enter the final figure only. Marks are for the answer inside the stated tolerance; no marks are given for working."},
        {id: "C", label: "Section C", type: "match", count: 3, marks: 2,
         rule: "Match every pair. Two marks each."}
      ]
    },
    IBM: {
      title: "Inclusive Business Model",
      sat: "23 August, 09:00–11:00",
      total: 100,
      calculator: null,
      sections: [
        {id: "A", label: "Section A", type: "short-answer", count: 10, marks: 10,
         /* Same reasoning as BRGSA Section C: ten-mark slots should lead with the
            items written at ten-mark length. Two whole integrated scenarios keep the
            mock's synthesis practice; eight direct, named-framework cases now match
            the observed paper level and rotate the wider authored bank. Without the
            explicit mix, all eight
            legacy integrated scenarios outrank every newly authored case response.
            The coverage cycle now rotates every written-relevant record while this
            per-paper mix preserves depth without making most questions multi-lens. */
         prefer: ["integrated", "case", "short"],
         modeCounts: {integrated: 2, case: 8},
         rule: "Ten direct framework-application answers. Name or use the supplied framework, decide, cite one case fact, and justify the link."}
      ],
      releaseNote: "The released text is an open design brief rather than a factual case. The Released case paper keeps the exact brief, states its missing assumptions, and applies ten course lenses to one coherent model. Numbered sets remain framework-transfer practice."
    }
  };

  /* Deterministic shuffle. The spread has to be random — that is the point, and
     ordering by concept or module would rebuild the teaching sequence the exam does
     not have — but it also has to survive a reload mid-paper, so it is seeded from
     the attempt rather than from Math.random(). */
  function examShuffle(items, seed) {
    var out = items.slice();
    var state = seed >>> 0 || 1;
    for (var i = out.length - 1; i > 0; i--) {
      state = (state * 1664525 + 1013904223) >>> 0;
      var j = state % (i + 1);
      var swap = out[i]; out[i] = out[j]; out[j] = swap;
    }
    return out;
  }

  function examPool(courseId, type) {
    var course = getCourse(courseId);
    var pool = [];
    Object.keys(course.questions).forEach(function (key) {
      var group = course.questions[key];
      (Array.isArray(group) ? group : [group]).forEach(function (question) {
        var questionType = question.type || "mcq";
        /* Primers teach. They have no place on a paper. */
        if (questionType === "primer") return;
        /* The released IBM brief has its own fixed, like-for-like paper. Letting its
           ten answers leak into numbered sets would both distort the deterministic
           coverage cycle and make a nominal transfer set partly a memory test. */
        if (question.releasedCase) return;
        if (questionType === type) pool.push(question);
      });
    });
    return pool;
  }

  /* Spread repeated stems apart.
   *
   * The bank generates about three surfaces per concept from a handful of templates,
   * so a section needing most of its pool necessarily repeats stems: SCLM Section A
   * wants 50 MCQs, the pool holds 52, and between them they carry 22 distinct stems —
   * one of which covers 16 questions. Selection cannot fix that. It is a bank-content
   * gap and is recorded as one.
   *
   * It is worse than a repeated task line, too: measured on SCLM Section A, sixteen
   * of the fifty questions carry a character-identical caselet *and* stem — the
   * generator's filler prompt, "A student understands the definition but needs to
   * explain why the idea changes the next decision" — and differ only in their
   * options. Those sixteen are genuinely different items, but they present with
   * nothing to tell them apart.
   *
   * What selection can fix is the clustering. A candidate who meets the same sentence
   * three times in a row reads it as a broken paper; the same three spread across
   * forty questions reads as a familiar phrasing, which is what it actually is. So the
   * draw is round-robined across groups of identical *visible prompt* — caselet and
   * stem together, since that is what the candidate reads — largest group first,
   * leaving the order within each group exactly as the seed shuffled it. */
  function spreadByStem(questions) {
    var groups = [];
    var index = {};
    questions.forEach(function (question) {
      var key = String(question.caselet || "") + "|" + String(question.stem || question.prompt || question.id);
      if (!(key in index)) { index[key] = groups.length; groups.push([]); }
      groups[index[key]].push(question);
    });
    if (groups.length < 2) return questions;
    groups.sort(function (a, b) { return b.length - a.length; });
    var out = [];
    for (var i = 0; out.length < questions.length; i++) {
      /* eslint-disable-next-line no-loop-func */
      groups.forEach(function (group) { if (group[i]) out.push(group[i]); });
    }
    return out;
  }

  /* Rank a shuffled pool by the section's declared preference, keeping the shuffle
   * inside each band.
   *
   * Two keys, in this order and not the other one. The section's declared mode comes
   * first, because a ten-mark slot needs a ten-mark item and an examiner-only
   * three-minute prompt would still be the wrong shape for it. Reservation breaks the
   * tie inside a band: among items the section wants equally, the ones Learn cannot
   * reach are the ones the paper should spend its slots on.
   *
   * Stable by construction — the sort only compares the two band indices, so items
   * equal on both stay in the order the seed put them, which is what keeps three
   * seeded sets genuinely different draws. A section with no `prefer` is untouched,
   * and an unnamed mode lands after every named one rather than being dropped, so a
   * section still fills when its preferred items run out. */
  function examCoverageGain(question, covered) {
    return conceptIdsOf(question).filter(function (id) { return !covered.has(id); }).length;
  }

  function examSelectionCoverageGain(questions, covered) {
    var ids = new Set();
    questions.forEach(function (question) {
      conceptIdsOf(question).forEach(function (id) { if (!covered.has(id)) ids.add(id); });
    });
    return ids.size;
  }

  function examPrefer(questions, prefer, covered, ranker, usedQuestions) {
    /* Reservation applies to every section, with or without a declared mode order: an
       examiner-only item exists to be on the paper, whatever format the section takes.
       Only the mode band is opt-in, because only some sections have a length their
       slot is worth. */
    var hasReserved = questions.some(function (question) { return question.examOnly; });
    if ((!prefer || !prefer.length) && !hasReserved && !covered && !ranker && !usedQuestions) return questions;
    var band = function (question) {
      if (!prefer || !prefer.length) return 0;
      var index = prefer.indexOf(question.writtenMode);
      return index < 0 ? prefer.length : index;
    };
    var reserved = function (question) { return question.examOnly ? 0 : 1; };
    return questions.map(function (question, index) { return {question: question, index: index}; })
      .sort(function (a, b) {
        return band(a.question) - band(b.question) ||
          reserved(a.question) - reserved(b.question) ||
          (ranker ? ranker(b.question) - ranker(a.question) : 0) ||
          (covered ? examCoverageGain(b.question, covered) - examCoverageGain(a.question, covered) : 0) ||
          (usedQuestions ? Number(usedQuestions.has(a.question.id)) - Number(usedQuestions.has(b.question.id)) : 0) ||
          a.index - b.index;
      })
      .map(function (entry) { return entry.question; });
  }

  /* Keep "always choose one of the longest options" at chance on every MCQ draw.
   * The selector does not rewrite options or manufacture a new cue; it chooses among
   * the already-seeded pool while preserving examiner-only items and first reserving
   * one item from every module available to the section. Craft must not buy its fix by
   * silently narrowing the paper's syllabus breadth. */
  function longestOptionPayoff(question) {
    if (!Array.isArray(question.options) || !question.options.length || !Number.isInteger(question.answer)) return 0;
    var lengths = question.options.map(textWordCount);
    var longest = Math.max.apply(null, lengths);
    var longestIds = lengths.map(function (length, index) { return length === longest ? index : -1; }).filter(function (index) { return index >= 0; });
    return longestIds.indexOf(question.answer) >= 0 ? 1 / longestIds.length : 0;
  }

  function takeLengthBalanced(pool, count, covered) {
    covered = covered || new Set();
    var taken = pool.slice(0, count);
    var candidates = pool.slice(count);
    var payoff = taken.reduce(function (sum, question) { return sum + longestOptionPayoff(question); }, 0);
    var target = taken.length * .25;
    function moduleCounts() {
      var counts = {};
      taken.forEach(function (question) {
        if (question.module != null) counts[question.module] = (counts[question.module] || 0) + 1;
      });
      return counts;
    }
    var moduleCoverage = pool.map(function (question) { return question.module; })
      .filter(function (module, index, all) { return module != null && all.indexOf(module) === index; })
      .sort(function (left, right) { return left - right; });
    function bestSwap(requiredModule, mustImprove, minimumCoverage) {
      var counts = moduleCounts();
      var currentDistance = Math.abs(payoff - target);
      var best = null;
      candidates.forEach(function (addition, addIndex) {
        if (requiredModule != null && addition.module !== requiredModule) return;
        taken.forEach(function (removal, removeIndex) {
          if (removal.examOnly) return;
          if (removal.module != null && removal.module !== addition.module && counts[removal.module] <= 1) return;
          var nextPayoff = payoff - longestOptionPayoff(removal) + longestOptionPayoff(addition);
          var distance = Math.abs(nextPayoff - target);
          if (mustImprove && distance >= currentDistance - .0001) return;
          var nextSelection = taken.slice();
          nextSelection[removeIndex] = addition;
          var nextCoverage = examSelectionCoverageGain(nextSelection, covered);
          if (minimumCoverage != null && nextCoverage < minimumCoverage) return;
          if (!best || nextCoverage > best.coverage ||
              (nextCoverage === best.coverage && distance < best.distance - .0001) ||
              (nextCoverage === best.coverage && Math.abs(distance - best.distance) < .0001 && addIndex < best.addIndex)) {
            best = {addition:addition, addIndex:addIndex, removal:removal, removeIndex:removeIndex,
              payoff:nextPayoff, distance:distance, coverage:nextCoverage};
          }
        });
      });
      if (!best) return false;
      taken[best.removeIndex] = best.addition;
      candidates[best.addIndex] = best.removal;
      payoff = best.payoff;
      return true;
    }
    moduleCoverage.forEach(function (module) {
      if (!moduleCounts()[module]) bestSwap(module, false, null);
    });
    while (bestSwap(null, true, examSelectionCoverageGain(taken, covered))) {
      /* Move toward chance without surrendering a new concept selected for this cycle. */
    }
    while (taken.length && payoff / taken.length > .30 && bestSwap(null, true, null)) {
      /* Craft remains a paper-level gate; a later set receives sacrificed coverage first. */
    }
    return taken;
  }

  /* Take an authored format mix before the ordinary backfill.
   *
   * `prefer` orders quality bands, but it cannot express a cap. That mattered only
   * after IBM's written bank widened: eight integrated scenarios occupied eight of ten
   * slots on every seeded paper, leaving the 69 newly classified records two chances
   * between them. `modeCounts` now keeps two full integrated cases and eight direct,
   * named-framework case responses. A short pool still backfills honestly if a requested band is ever
   * underfilled; the paper never loses a question merely because its preferred mix is
   * unavailable. */
  function takeExamSection(pool, section, covered) {
    if (!section.modeCounts) return section.type === "mcq"
      ? takeLengthBalanced(pool, section.count, covered)
      : pool.slice(0, section.count);
    var taken = [];
    var used = {};
    Object.keys(section.modeCounts).forEach(function (mode) {
      var want = section.modeCounts[mode];
      var modePool = pool.filter(function (question) { return question.writtenMode === mode; });
      var modeModules = {};
      function takeModeQuestion(question) {
        if (want <= 0 || taken.length >= section.count || used[question.id]) return;
        taken.push(question);
        used[question.id] = true;
        if (question.module != null) modeModules[question.module] = true;
        want -= 1;
      }
      /* A format quota must not silently collapse topic breadth. Take one question
         from each available module in that mode first; only then use the seeded order
         to fill the remaining quota. IBM's eight direct case slots therefore span all
         eight modules while its two integrated slots keep their authored depth. */
      modePool.forEach(function (question) {
        if (question.module == null || modeModules[question.module]) return;
        takeModeQuestion(question);
      });
      modePool.forEach(takeModeQuestion);
    });
    pool.forEach(function (question) {
      if (taken.length >= section.count || used[question.id]) return;
      taken.push(question);
      used[question.id] = true;
    });
    return taken;
  }

  /* Builds the paper, and reports honestly on what it could not fill. */
  function buildExamPaper(courseId, seed, coveredBefore, usedQuestionIds) {
    var spec = EXAM_PAPERS[courseId];
    if (!spec) return null;
    var covered = new Set(coveredBefore || []);
    var questions = [];
    var shortfalls = [];
    spec.sections.forEach(function (section) {
      var pool = examPrefer(examShuffle(examPool(courseId, section.type), seed + section.id.charCodeAt(0)), section.prefer, covered, null, usedQuestionIds);
      var taken = takeExamSection(pool, section, covered);
      if (taken.length < section.count) {
        shortfalls.push({section: section.id, want: section.count, have: taken.length, type: section.type});
      }
      taken.forEach(function (question) {
        conceptIdsOf(question).forEach(function (id) { covered.add(id); });
      });
      taken = spreadByStem(taken);
      taken.forEach(function (question) {
        questions.push({question: question, section: section.id, marks: section.marks});
      });
    });
    return {courseId: courseId, spec: spec, questions: questions, shortfalls: shortfalls,
      /* The paper's own marks, not the bank's: a section short of items is worth
         less, and saying it scored out of the full paper would be a lie. */
      available: questions.reduce(function (sum, item) { return sum + item.marks; }, 0)};
  }

  /* The concepts this subject's real paper can honestly examine. IBM deliberately
   * excludes its twenty objective-only records here: its real paper is written, so
   * silently putting MCQs into a coverage cycle would close a counter by breaking the
   * mock. Those concepts remain fully available in Learn. */
  function examRelevantConceptIds(courseId) {
    var ids = new Set();
    var spec = EXAM_PAPERS[courseId];
    spec.sections.forEach(function (section) {
      var pool = examPool(courseId, section.type);
      if (section.modeCounts) {
        var modes = Object.keys(section.modeCounts);
        pool = pool.filter(function (question) { return modes.indexOf(question.writtenMode) >= 0; });
      }
      pool.forEach(function (question) {
        conceptIdsOf(question).forEach(function (id) { ids.add(id); });
      });
    });
    return ids;
  }

  /* A deterministic coverage cycle, not an endless random-paper generator.
   *
   * Each set is still a complete paper under the subject's real section counts and
   * authored format mix. The only extra rule is across sets: an item carrying a
   * paper-relevant concept no earlier set has reached wins its band. The cycle keeps
   * the original minimum of three sets and then stops at the first set that completes
   * coverage. A refresh therefore rebuilds the same cycle and two candidates receive
   * the same Set N. */
  var EXAM_SET_MIN = 3;
  var EXAM_SET_MAX = 24;
  var examCoverageCycleCache = {};

  function buildExamCoverageCycle(courseId) {
    var target = examRelevantConceptIds(courseId);
    var covered = new Set();
    var usedQuestionIds = new Set();
    var papers = [];
    var stagnant = 0;
    for (var setIndex = 0;
         setIndex < EXAM_SET_MAX && (setIndex < EXAM_SET_MIN || covered.size < target.size);
         setIndex += 1) {
      var before = covered.size;
      var paper = buildExamPaper(courseId, examSeed(courseId, setIndex), covered, usedQuestionIds);
      var introduced = new Set();
      paper.questions.forEach(function (entry) {
        usedQuestionIds.add(entry.question.id);
        conceptIdsOf(entry.question).forEach(function (id) {
          if (!target.has(id)) return;
          if (!covered.has(id)) introduced.add(id);
          covered.add(id);
        });
      });
      paper.setIndex = setIndex;
      paper.newConceptIds = Array.from(introduced);
      paper.coverageAfter = covered.size;
      paper.coverageTarget = target.size;
      papers.push(paper);
      stagnant = covered.size === before ? stagnant + 1 : 0;
      if (stagnant >= 3) break;
    }
    return {papers:papers, target:target, covered:covered, complete:covered.size === target.size};
  }

  function examCoverageCycle(courseId) {
    if (!examCoverageCycleCache[courseId]) examCoverageCycleCache[courseId] = buildExamCoverageCycle(courseId);
    return examCoverageCycleCache[courseId];
  }

  function examSetCount(courseId) {
    return examCoverageCycle(courseId).papers.length;
  }

  function examPaperForSet(courseId, setIndex) {
    return examCoverageCycle(courseId).papers[setIndex] || null;
  }

  /* A separate paper built from Learn's evidence, not from earlier mock results.
   *
   * The numbered sets above remain common, paper-authentic coverage instruments. This
   * diagnostic is deliberately personal: every format pool is ranked by the weakest
   * concept it exercises according to the same evidence model that orders Focused
   * practice. It keeps the real section counts, marks and format mix, but it does not
   * force eight-module breadth or claim a place in the coverage cycle — doing either
   * would spend slots on syllabus balance rather than the learner's weakest links. */
  /* Negative values cannot collide with numbered coverage sets. Telemetry maps the
     diagnostic and released case to reserved non-cycle indices at the reporting boundary. */
  var EXAM_WEAKEST_SET = -1;
  var EXAM_RELEASED_SET = -2;

  function buildReleasedCasePaper(courseId) {
    if (courseId !== "IBM") return null;
    var spec = EXAM_PAPERS.IBM;
    var questions = [];
    Object.keys(getCourse("IBM").questions).forEach(function (key) {
      var group = getCourse("IBM").questions[key];
      (Array.isArray(group) ? group : [group]).forEach(function (question) {
        if (question.releasedCase) questions.push(question);
      });
    });
    var expected = spec.sections[0].count;
    var taken = questions.slice(0, expected);
    return {
      courseId: courseId,
      spec: spec,
      questions: taken.map(function (question) {
        return {question: question, section: "A", marks: spec.sections[0].marks};
      }),
      shortfalls: taken.length < expected ? [{section:"A", want:expected, have:taken.length, type:"short-answer"}] : [],
      setIndex: EXAM_RELEASED_SET,
      releasedCase: true,
      available: taken.length * spec.sections[0].marks
    };
  }

  function examWeaknessScore(courseId, question) {
    return conceptIdsOf(question).reduce(function (score, conceptId) {
      var concept = getConcept(courseId, conceptId);
      return concept ? Math.max(score, conceptPriority(courseId, concept).score) : score;
    }, 0);
  }

  function takeWeakLengthBalanced(courseId, pool, count) {
    var taken = pool.slice(0, count);
    var candidates = pool.slice(count);
    var payoff = taken.reduce(function (sum, question) { return sum + longestOptionPayoff(question); }, 0);
    var target = taken.length * .25;
    function bestSwap() {
      var currentDistance = Math.abs(payoff - target);
      var best = null;
      candidates.forEach(function (addition, addIndex) {
        taken.forEach(function (removal, removeIndex) {
          if (removal.examOnly) return;
          /* Craft may break a tie between equally weak surfaces. It may not replace a
             more urgent Learn target merely to make the option-length statistic tidy. */
          if (examWeaknessScore(courseId, addition) < examWeaknessScore(courseId, removal)) return;
          var nextPayoff = payoff - longestOptionPayoff(removal) + longestOptionPayoff(addition);
          var distance = Math.abs(nextPayoff - target);
          if (distance >= currentDistance - .0001) return;
          if (!best || distance < best.distance - .0001 ||
              (Math.abs(distance - best.distance) < .0001 && addIndex < best.addIndex)) {
            best = {addition:addition, addIndex:addIndex, removal:removal,
              removeIndex:removeIndex, payoff:nextPayoff, distance:distance};
          }
        });
      });
      if (!best) return false;
      taken[best.removeIndex] = best.addition;
      candidates[best.addIndex] = best.removal;
      payoff = best.payoff;
      return true;
    }
    while (bestSwap()) { /* Improve the cue only inside the same weakness band. */ }
    return taken;
  }

  function takeWeakExamSection(courseId, pool, section) {
    if (!section.modeCounts) return section.type === "mcq"
      ? takeWeakLengthBalanced(courseId, pool, section.count)
      : pool.slice(0, section.count);
    var taken = [];
    var used = {};
    Object.keys(section.modeCounts).forEach(function (mode) {
      var want = section.modeCounts[mode];
      pool.forEach(function (question) {
        if (want <= 0 || taken.length >= section.count || used[question.id]) return;
        if (question.writtenMode !== mode) return;
        taken.push(question);
        used[question.id] = true;
        want -= 1;
      });
    });
    pool.forEach(function (question) {
      if (taken.length >= section.count || used[question.id]) return;
      taken.push(question);
      used[question.id] = true;
    });
    return taken;
  }

  function weakestLearnConcepts(courseId, count) {
    return getCourse(courseId).concepts.slice().sort(function (left, right) {
      var difference = conceptPriority(courseId, right).score - conceptPriority(courseId, left).score;
      if (difference) return difference;
      var leftAttempts = attemptsFor(courseId, left.id);
      var rightAttempts = attemptsFor(courseId, right.id);
      var leftAt = leftAttempts.length ? leftAttempts[leftAttempts.length - 1].at : 0;
      var rightAt = rightAttempts.length ? rightAttempts[rightAttempts.length - 1].at : 0;
      return leftAt - rightAt || conceptTeachingRank(courseId, left.id) - conceptTeachingRank(courseId, right.id);
    }).slice(0, count || 3);
  }

  function buildWeakestLinksPaper(courseId) {
    var spec = EXAM_PAPERS[courseId];
    if (!spec) return null;
    var questions = [];
    var shortfalls = [];
    var seed = examSeed(courseId, EXAM_WEAKEST_SET);
    var ranker = function (question) { return examWeaknessScore(courseId, question); };
    spec.sections.forEach(function (section) {
      var pool = examPrefer(examShuffle(examPool(courseId, section.type),
        seed + section.id.charCodeAt(0)), section.prefer, null, ranker);
      var taken = takeWeakExamSection(courseId, pool, section);
      if (taken.length < section.count) {
        shortfalls.push({section:section.id, want:section.count, have:taken.length, type:section.type});
      }
      taken = spreadByStem(taken);
      taken.forEach(function (question) {
        questions.push({question:question, section:section.id, marks:section.marks});
      });
    });
    var evidenceConcepts = getCourse(courseId).concepts.filter(function (concept) {
      return attemptsFor(courseId, concept.id).length > 0;
    }).length;
    return {courseId:courseId, spec:spec, questions:questions, shortfalls:shortfalls,
      setIndex:EXAM_WEAKEST_SET, personalized:true, evidenceConcepts:evidenceConcepts,
      weakConceptIds:weakestLearnConcepts(courseId, 8).map(function (concept) { return concept.id; }),
      available:questions.reduce(function (sum, item) { return sum + item.marks; }, 0)};
  }

  /* ---- exam runtime ------------------------------------------------------- */

  var exam = null;          /* the live attempt, or null outside the examiner */
  var examTicker = null;

  var EXAM_STATES = [
    {id: "answered", label: "Answered"},
    {id: "not-answered", label: "Not answered"},
    {id: "not-visited", label: "Not visited"},
    {id: "marked", label: "Marked for review"},
    {id: "answered-marked", label: "Answered and marked (still scored)"}
  ];

  function examStateOf(index) {
    var item = exam.items[index];
    var answered = examHasResponse(item);
    if (item.marked) return answered ? "answered-marked" : "marked";
    if (answered) return "answered";
    return item.visited ? "not-answered" : "not-visited";
  }

  function examHasResponse(item) {
    if (item.response === null || item.response === undefined) return false;
    if (Array.isArray(item.response)) return item.response.length > 0;
    if (typeof item.response === "string") return item.response.trim() !== "";
    if (typeof item.response === "object") return Object.keys(item.response).length > 0;
    return true;
  }

  /* ---- mock sets ----------------------------------------------------------------
   *
   * One paper per subject was a rehearsal you could memorise. A coverage-sized cycle
   * gives genuinely different draws from the same bank under the same rules, and the
   * final set exists only when an earlier set still left a paper-relevant concept out.
   *
   * The seed is derived from the subject and the set number, never from the clock:
   * a paper has to survive a refresh halfway through, so Set 2 of SCLM must be the
   * same 59 questions in the same order tomorrow as it is now.
   */
  function examSeed(courseId, setIndex) {
    var base = 2166136261;
    for (var i = 0; i < courseId.length; i++) {
      base = (base ^ courseId.charCodeAt(i)) >>> 0;
      base = (base * 16777619) >>> 0;
    }
    return (base + (setIndex + 1) * 2654435761) >>> 0;
  }

  function openExaminer(courseId, setIndex) {
    var set = typeof setIndex === "number" ? setIndex : 0;
    var paper = set === EXAM_RELEASED_SET
      ? buildReleasedCasePaper(courseId)
      : set === EXAM_WEAKEST_SET
        ? buildWeakestLinksPaper(courseId)
        : examPaperForSet(courseId, set);
    if (!paper || !paper.questions || !paper.questions.length) {
      return toast("That mock could not be prepared. Return to Examiner and try another set.");
    }
    exam = {
      paper: paper,
      courseId: courseId,
      setIndex: set,
      items: paper.questions.map(function (entry, index) {
        return {index: index, section: entry.section, marks: entry.marks, question: entry.question,
          response: null, confidence: null, marked: false, visited: false,
          /* Telemetry, captured while the paper runs because none of it can be
             reconstructed afterwards. `seconds` is time with the question actually on
             screen; `visits` counts returns to it; `changes` counts how often the
             answer moved; `firstResponse` is what they put down before any second
             thoughts, which is the only way to tell a corrected slip from a coin flip.
             All of it lives on the attempt and none of it reaches conceptAttempts. */
          seconds: 0, visits: 0, changes: 0, firstResponse: null, firstResponseSeconds: null};
      }),
      current: 0,
      section: paper.spec.sections[0].id,
      remaining: EXAM_MINUTES * 60,
      started: false,
      submitted: false
    };
    showScreen("exam-screen");
    renderExamBrief();
  }

  function renderExamBrief() {
    var spec = exam.paper.spec;
    $("exam-brief").hidden = false;
    $("exam-runner").hidden = true;
    $("exam-result").hidden = true;
    $("exam-paper-title").textContent = spec.title;
    $("exam-brief-lede").textContent = exam.paper.releasedCase
      ? spec.releaseNote
      : exam.paper.personalized
      ? "A personalised diagnostic: every slot starts from your weakest Learn evidence while keeping this paper's real sections, marks and clock. It changes when your Learn evidence changes, so it is not part of the common coverage cycle." +
        (spec.releaseNote ? " " + spec.releaseNote : "")
      : spec.releaseNote ||
        "Sat " + spec.sat + ". Once the clock starts nothing is explained until you submit, and the questions arrive in the paper's order rather than a teaching order.";
    var sat = examAttemptsFor(exam.courseId, exam.setIndex);
    $("exam-facts").innerHTML =
      "<div><dt>Paper</dt><dd>" + examSetLabel(exam.setIndex) +
        (sat.length ? " · sat " + sat.length + "×" : " · not sat") + "</dd></div>" +
      "<div><dt>Duration</dt><dd>" + EXAM_MINUTES + " minutes</dd></div>" +
      "<div><dt>Total marks</dt><dd>" + spec.total + "</dd></div>" +
      "<div><dt>Questions</dt><dd>" + spec.sections.reduce(function (n, s) { return n + s.count; }, 0) + "</dd></div>" +
      "<div><dt>Calculator</dt><dd>" + (spec.calculator === "scientific" ? "Scientific" : spec.calculator === "basic" ? "Normal" : "Not allowed") + "</dd></div>";
    $("exam-rules").innerHTML = spec.sections.map(function (section) {
      return "<div class='exam-rule'><b>" + escapeHtml(section.label) + " · " + section.count +
        " × " + section.marks + " mark" + (section.marks === 1 ? "" : "s") + "</b>" +
        "<p>" + escapeHtml(section.rule) + "</p></div>";
    }).join("");
    /* Readiness against this exact draw, not the paper in general — this is the
       screen where somebody commits two hours to one set, so the number has to be
       that set's. Measured on a profile that had done the first study set and
       nothing else, every paper here was ~90% untaught and no screen said so. */
    var readiness = examReadiness(exam.courseId, exam.setIndex);
    var readinessNote = $("exam-readiness");
    if (readinessNote) {
      readinessNote.hidden = !readiness || !readiness.total;
      if (readiness && readiness.total) {
        readinessNote.className = "exam-readiness" + (readiness.allTaught ? " is-ready" : "");
        var seen = readiness.marks && readiness.marks.alreadyMet
          ? " " + readiness.marks.alreadyMet + " of this paper's " + readiness.marks.total +
            " questions (" + readiness.marks.alreadyMetMarks + " marks) are ones you have already answered in Learn — Dungeon draws both from one bank, so a mark on those shows recall rather than fresh knowledge."
          : "";
        readinessNote.textContent = examReadinessCopy(readiness) +
          (readiness.allTaught ? "" : " Sitting it now is a fair thing to do — it will show you the shape of the paper — but a low score here is Learn not having happened yet, not a verdict on you.") +
          seen;
      }
    }
    var shortfalls = exam.paper.shortfalls;
    var note = $("exam-shortfall");
    note.hidden = shortfalls.length === 0;
    if (shortfalls.length) {
      /* Said plainly, and before the clock starts. A learner is entitled to know that
         a section is short before they decide to spend two hours on it. */
      note.textContent = "This mock is not full length yet. " + shortfalls.map(function (s) {
        return "Section " + s.section + " asks for " + s.want + " " + s.type + " questions and the bank has " + s.have;
      }).join("; ") + ". You will be scored out of what is actually here, not out of " + spec.total + ".";
    }
    $("exam-begin").textContent = "Start the clock · " + EXAM_MINUTES + " minutes";
  }

  function beginExam() {
    exam.started = true;
    syncModeSwitchVisibility();
    $("exam-brief").hidden = true;
    $("exam-runner").hidden = false;
    exam.items[0].visited = true;
    renderExamSections();
    renderExamQuestion();
    startExamClock();
    $("exam-question").focus({preventScroll: true});
  }

  function startExamClock() {
    window.clearInterval(examTicker);
    examTicker = window.setInterval(function () {
      if (!exam || exam.submitted) return;
      exam.remaining -= 1;
      exam.items[exam.current].seconds += 1;
      renderExamClock();
      /* The clock is the exam. When it runs out the paper is taken, answered or not. */
      if (exam.remaining <= 0) submitExam(true);
    }, 1000);
  }

  function formatClock(totalSeconds) {
    var s = Math.max(0, totalSeconds);
    var m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  function renderExamClock() {
    var left = $("exam-time-left");
    left.textContent = formatClock(exam.remaining);
    /* Under five minutes the clock stops being furniture. */
    left.classList.toggle("urgent", exam.remaining <= 300);
    $("exam-time-question").textContent = "On this question " + formatClock(exam.items[exam.current].seconds);
  }

  function renderExamSections() {
    $("exam-sections").innerHTML = exam.paper.spec.sections.map(function (section) {
      var count = exam.items.filter(function (i) { return i.section === section.id; }).length;
      if (!count) return "";
      return "<button type='button' role='tab' class='exam-section-tab" +
        (section.id === exam.section ? " active" : "") + "' data-section='" + section.id +
        "' aria-selected='" + (section.id === exam.section) + "'>" +
        escapeHtml(section.label) + "<small>" + count + " × " + section.marks + "</small></button>";
    }).join("");
    $all(".exam-section-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var first = exam.items.filter(function (i) { return i.section === tab.dataset.section; })[0];
        if (first) goExamQuestion(first.index);
      });
    });
  }

  function renderExamPalette() {
    var sectionItems = exam.items.filter(function (i) { return i.section === exam.section; });
    /* Counted over the section the palette is showing, not the whole paper. They
       disagreed before — the legend said "42 not visited" above a grid of 35 — which
       makes the one number a candidate uses to decide where to spend the next ten
       minutes quietly wrong. */
    var counts = {};
    EXAM_STATES.forEach(function (state) { counts[state.id] = 0; });
    sectionItems.forEach(function (item) { counts[examStateOf(item.index)] += 1; });
    $("exam-legend").innerHTML = EXAM_STATES.map(function (state) {
      return "<li><i class='exam-chip " + state.id + "'>" + counts[state.id] + "</i><span>" + escapeHtml(state.label) + "</span></li>";
    }).join("");
    $("exam-palette").innerHTML = sectionItems.map(function (item) {
      var withinSection = sectionItems.indexOf(item) + 1;
      return "<button type='button' class='exam-chip " + examStateOf(item.index) +
        (item.index === exam.current ? " current" : "") + "' data-index='" + item.index +
        "' aria-label='Question " + withinSection + ", " + examStateOf(item.index).replace("-", " ") + "'>" +
        withinSection + "</button>";
    }).join("");
    $all("#exam-palette .exam-chip").forEach(function (chip) {
      chip.addEventListener("click", function () { goExamQuestion(Number(chip.dataset.index)); });
    });
  }

  function goExamQuestion(index) {
    if (index < 0 || index >= exam.items.length) return;
    exam.current = index;
    exam.section = exam.items[index].section;
    if (!exam.items[index].visited) exam.items[index].visited = true;
    exam.items[index].visits += 1;
    renderExamSections();
    renderExamQuestion();
    $("exam-question").focus({preventScroll: true});
  }

  function renderExamQuestion() {
    var item = exam.items[exam.current];
    var question = item.question;
    var sectionItems = exam.items.filter(function (i) { return i.section === item.section; });
    $("exam-qnumber").textContent = "Section " + item.section + " · Question " + (sectionItems.indexOf(item) + 1) + " of " + sectionItems.length;
    $("exam-qmarks").textContent = item.marks + " mark" + (item.marks === 1 ? "" : "s");
    $("exam-question-body").innerHTML = examQuestionMarkup(question, item) + examConfidenceMarkup(item);
    bindExamResponse(item);
    renderExamPalette();
    renderExamClock();
    $("exam-prev").disabled = exam.current === 0;
    $("exam-next").textContent = exam.current === exam.items.length - 1 ? "Save" : "Save & next";
    var calculator = exam.paper.spec.calculator;
    $("exam-calc-toggle").hidden = !calculator;
    $("exam-table-toggle").hidden = (exam.paper.spec.tables || []).indexOf("standard-normal") < 0;
  }

  function examQuestionMarkup(question, item) {
    var type = question.type || "mcq";
    var head = "";
    /* `caselet` is a string on some question families and null on others, and null is
       typeof "object" — so this checks the type rather than truthiness alone. */
    if (typeof question.caselet === "string" && question.caselet) {
      head += "<div class='exam-caselet'>" + caseParagraphs(question.caselet) + "</div>";
    }
    head += "<h2 class='exam-stem'>" + escapeHtml(question.stem || question.prompt || "") + "</h2>";
    /* Numeric items carry the scenario in `stem` and the actual ask in `prompt`; only
       showing one of them loses either the context or the question. */
    if (question.prompt && question.stem && question.prompt !== question.stem) {
      head += "<p class='exam-prompt'>" + escapeHtml(question.prompt) + "</p>";
    }
    if (type === "mcq") {
      return head + "<div class='exam-options' role='radiogroup'>" + (question.options || []).map(function (option, index) {
        return "<button type='button' class='exam-option" + (item.response === index ? " chosen" : "") +
          "' role='radio' aria-checked='" + (item.response === index) + "' data-choice='" + index + "'>" +
          "<span class='option-key'>" + "ABCDEFGH"[index] + "</span><span>" + escapeHtml(option) + "</span></button>";
      }).join("") + "</div>";
    }
    /* A case-cloze is a scenario with two blanks, each carrying its own four options.
     * It was sharing the mcq branch, which reads `question.options` — a field no
     * case-cloze has — so BRGSA's whole Section B drew its caselet, drew the task
     * line, and then drew an empty `div.exam-options`. Twenty of eighty marks with
     * no radio, no select, no textarea: unanswerable by any means, on every sitting.
     *
     * The scorer had the same fault (`item.response === question.answer`, against an
     * `answer` that lives on each blank rather than the question), so even a student
     * who could somehow have answered would have scored zero.
     *
     * Selects rather than buttons, matching the `match` branch: two grouped choices
     * belong to one question, and a radiogroup per blank inside one item is the shape
     * that misleads a candidate about how it is marked. */
    if (type === "case-cloze") {
      var blanks = question.blanks || [];
      var chosenBlanks = item.response && typeof item.response === "object" ? item.response : {};
      if (!blanks.length) return head + examUnrenderable(question);
      return head + "<p class='exam-hint'>Both parts must be right for the marks. No partial credit.</p>" +
        "<div class='exam-cloze'>" + blanks.map(function (blank, index) {
          return "<div class='exam-cloze-row'><label for='exam-cloze-" + index + "'>" +
            escapeHtml(blank.label || ("Part " + (index + 1))) + "</label>" +
            "<select id='exam-cloze-" + index + "' data-blank='" + index + "'>" +
            "<option value=''>Choose</option>" +
            (blank.options || []).map(function (option, optionIndex) {
              return "<option value='" + optionIndex + "'" +
                (String(chosenBlanks[index]) === String(optionIndex) ? " selected" : "") + ">" +
                escapeHtml(option) + "</option>";
            }).join("") + "</select></div>";
        }).join("") + "</div>";
    }
    if (type === "msq") {
      var chosen = Array.isArray(item.response) ? item.response : [];
      return head + "<p class='exam-msq-note'>Exactly two options are correct. Select at most two. Both correct = 2; one correct with no wrong option = 1; any wrong option = 0. Uncheck or use Clear response before changing a full pair.</p>" +
        "<div class='exam-options'>" + (question.options || []).map(function (option, index) {
          var picked = chosen.indexOf(index) >= 0;
          return "<button type='button' class='exam-option multi" + (picked ? " chosen" : "") +
            "' role='checkbox' aria-checked='" + picked + "' data-choice='" + index + "'" +
            (!picked && chosen.length >= 2 ? " disabled aria-disabled='true'" : "") + ">" +
            "<span class='option-box'></span><span>" + escapeHtml(option) + "</span></button>";
        }).join("") + "</div>";
    }
    if (type === "numeric") {
      return head + "<label class='exam-numeric'><span>Final answer" + (question.unit ? " (" + escapeHtml(question.unit) + ")" : "") + "</span>" +
        "<input id='exam-numeric-input' type='text' inputmode='decimal' autocomplete='off' value='" +
        escapeHtml(item.response === null ? "" : String(item.response)) + "'></label>" +
        "<p class='exam-hint'>Enter the figure only. No marks are given for working.</p>";
    }
    if (type === "match") {
      /* The bank's shape: `rows` are the prompts and each carries `answer`, an index
         into the shared `choices` list. There is nothing to shuffle — the choices are
         already one fixed list, which is how the paper presents them. */
      var rows = question.rows || [];
      var choices = question.choices || [];
      var picked = item.response && typeof item.response === "object" ? item.response : {};
      return head + "<div class='exam-match'>" + rows.map(function (row, index) {
        return "<div class='exam-match-row'><span>" + escapeHtml(row.label || "") + "</span>" +
          "<select data-pair='" + index + "' aria-label='Match for " + escapeHtml(row.label || "") + "'>" +
          "<option value=''>Choose</option>" +
          choices.map(function (choice, choiceIndex) {
            return "<option value='" + choiceIndex + "'" +
              (String(picked[index]) === String(choiceIndex) ? " selected" : "") + ">" +
              escapeHtml(choice) + "</option>";
          }).join("") + "</select></div>";
      }).join("") + "</div>";
    }
    if (type === "short-answer") {
      return head + "<label class='exam-written'><span>Your answer</span>" +
        "<textarea id='exam-written-input' rows='12' placeholder='Write your full answer here.'>" +
        escapeHtml(item.response === null ? "" : String(item.response)) + "</textarea></label>" +
        "<p class='exam-hint'>Written answers are not machine-marked. After you submit you will review this against the rubric yourself.</p>";
    }
    /* Anything the renderer does not know how to draw.
     *
     * The old default was the written textarea, so a type mismatch produced a
     * plausible-looking answer box rather than an error — and case-cloze did not even
     * reach it, because it fell into the mcq branch and drew an empty div. Either way
     * the paper looked fine and could not be answered. A candidate is owed the
     * knowledge that this question is broken, and so is whoever has to fix it. */
    return head + examUnrenderable(question);
  }

  function examConfidenceMarkup(item) {
    var choices = [
      {id:"low", label:"Guessing / not sure"},
      {id:"medium", label:"Narrowed it down"},
      {id:"high", label:"Could explain or defend it"}
    ];
    return "<fieldset class='exam-confidence'><legend>Confidence <small>optional · used only in your post-paper diagnosis</small></legend>" +
      "<div>" + choices.map(function (choice) {
        return "<button type='button' data-exam-confidence='" + choice.id + "' aria-pressed='" + (item.confidence === choice.id) +
          "' class='" + (item.confidence === choice.id ? "chosen" : "") + "'>" + escapeHtml(choice.label) + "</button>";
      }).join("") + "</div></fieldset>";
  }

  function examUnrenderable(question) {
    return "<p class='exam-unrenderable'><b>This question cannot be shown.</b> Its format (" +
      escapeHtml(question.type || "unknown") + ") did not render, so it cannot be answered and is " +
      "excluded from the marks available on this paper. This is a fault in Dungeon, not in your answer.</p>";
  }

  /* Every response passes through here so the history is captured once, in one place.
     The first answer is kept separately from the final one: a learner who puts down B
     in nine seconds and leaves it is doing something different from one who puts down
     B, thinks, and moves to C — and only the first-answer record can tell them apart
     afterwards. */
  function recordExamResponse(item, value) {
    var had = examHasResponse(item);
    item.response = value;
    if (!had && examHasResponse(item)) {
      item.firstResponse = Array.isArray(value) ? value.slice() : value;
      item.firstResponseSeconds = item.seconds;
    } else if (had) {
      item.changes += 1;
    }
  }

  function bindExamResponse(item) {
    var type = item.question.type || "mcq";
    $all("#exam-question-body .exam-option").forEach(function (button) {
      button.addEventListener("click", function () {
        var choice = Number(button.dataset.choice);
        if (type === "msq") {
          var chosen = Array.isArray(item.response) ? item.response.slice() : [];
          var at = chosen.indexOf(choice);
          if (at >= 0) chosen.splice(at, 1);
          else if (chosen.length < 2) chosen.push(choice);
          else return;
          recordExamResponse(item, chosen);
        } else {
          recordExamResponse(item, choice);
        }
        renderExamQuestion();
      });
    });
    var numeric = $("exam-numeric-input");
    if (numeric) numeric.addEventListener("input", function () { recordExamResponse(item, numeric.value); renderExamPalette(); });
    var written = $("exam-written-input");
    if (written) written.addEventListener("input", function () { recordExamResponse(item, written.value); renderExamPalette(); });
    $all("#exam-question-body select[data-pair]").forEach(function (select) {
      select.addEventListener("change", function () {
        var picked = item.response && typeof item.response === "object" ? item.response : {};
        if (select.value === "") delete picked[select.dataset.pair];
        else picked[select.dataset.pair] = select.value;
        recordExamResponse(item, picked);
        renderExamPalette();
      });
    });
    /* Case-cloze blanks. Same object-keyed shape as `match` above, so the palette,
       `examHasResponse` and the change-tracking all treat them alike. */
    $all("#exam-question-body select[data-blank]").forEach(function (select) {
      select.addEventListener("change", function () {
        var picked = item.response && typeof item.response === "object" ? item.response : {};
        if (select.value === "") delete picked[select.dataset.blank];
        else picked[select.dataset.blank] = select.value;
        recordExamResponse(item, picked);
        renderExamPalette();
      });
    });
    $all("#exam-question-body [data-exam-confidence]").forEach(function (button) {
      button.addEventListener("click", function () {
        item.confidence = item.confidence === button.dataset.examConfidence ? null : button.dataset.examConfidence;
        renderExamQuestion();
      });
    });
  }

  /* Scoring, by the paper's rules rather than the learning system's.
     SPMS Section B is P-type: exact pair = 2, one correct with no wrong = 1,
     and any response containing a wrong option = 0. */
  function scoreExamItem(item) {
    var question = item.question;
    var type = question.type || "mcq";
    if (type === "msq") {
      var correct = question.answers || question.correct || [];
      var chosen = Array.isArray(item.response) ? item.response : [];
      var pType = scorePTypeSelection(chosen, correct);
      return {awarded: pType.awarded, possible: item.marks, machine: true};
    }
    if (type === "mcq") {
      return {awarded: item.response === question.answer ? item.marks : 0, possible: item.marks, machine: true};
    }
    /* Every blank or nothing, for the same reason `match` is all-or-nothing: the paper
       gives Section B five marks and states no partial-credit rule, and inventing one
       the examiner has not stated teaches a wrong expectation about the real paper.
       Five marks over two blanks does not divide evenly either. */
    if (type === "case-cloze") {
      var blanks = question.blanks || [];
      var picked = item.response && typeof item.response === "object" ? item.response : {};
      var filled = blanks.filter(function (blank, index) { return String(picked[index]) === String(blank.answer); }).length;
      return {awarded: blanks.length && filled === blanks.length ? item.marks : 0, possible: item.marks, machine: true};
    }
    if (type === "numeric") {
      var value = parseFloat(String(item.response === null ? "" : item.response).replace(/[,₹\s]/g, ""));
      var target = Number(question.answer);
      var tolerance = Number(question.tolerance || 0);
      var hit = isFinite(value) && Math.abs(value - target) <= tolerance;
      return {awarded: hit ? item.marks : 0, possible: item.marks, machine: true};
    }
    if (type === "match") {
      /* Every row or nothing. The paper gives a match question two marks and says
         nothing about partial credit, and inventing a marking rule the examiner has
         not stated would teach a wrong expectation about the real paper. */
      var rows = question.rows || [];
      var picked = item.response && typeof item.response === "object" ? item.response : {};
      var hits = rows.filter(function (row, index) { return String(picked[index]) === String(row.answer); }).length;
      return {awarded: rows.length && hits === rows.length ? item.marks : 0, possible: item.marks, machine: true};
    }
    /* Written answers are not machine-marked, and a mock must not pretend otherwise.
       They are excluded from the machine total and reported separately for self-review. */
    return {awarded: 0, possible: item.marks, machine: false, written: true};
  }

  function submitExam(automatic, confirmed) {
    if (!exam || exam.submitted) return;
    if (!automatic && !confirmed) {
      var unanswered = exam.items.filter(function (item) { return !examHasResponse(item); }).length;
      var confirmCopy = unanswered
        ? unanswered + " question" + (unanswered === 1 ? " is" : "s are") + " unanswered. Submit the paper anyway?"
        : "Submit the paper?";
      $("exam-submit-copy").textContent = confirmCopy;
      $("exam-submit-dialog").showModal();
      return;
    }
    exam.submitted = true;
    window.clearInterval(examTicker);
    syncModeSwitchVisibility();
    renderExamResult(automatic);
  }

  /* What the paper exposed, carried back into the learning system.
   *
   * The two products share a bank, and this is the one place they should share a
   * signal: a concept you could not do under exam conditions is the best evidence
   * anywhere in the product about what to study next.
   *
   * It is stored apart from `conceptAttempts` deliberately, and that separation is
   * the whole design. A mock is unassisted, uncoached, against the clock, with no
   * lesson before it and no feedback during it — the exact opposite of the conditions
   * the evidence model is calibrated on. Writing mock answers into conceptAttempts
   * would let a bad afternoon rewrite a learner's mastery record, and a lucky guess
   * award Strong. So misses here **prioritise** and never **score**: they change the
   * order of what is offered, and nothing else. */
  function recordExamMisses(scores) {
    var courseId = exam.courseId;
    var store = profile.examMisses[courseId] || (profile.examMisses[courseId] = {});
    var stamped = new Date().toISOString();
    exam.items.forEach(function (item, index) {
      var score = scores[index];
      /* A submitted written answer waits for the deep review below. A blank one is
       * already a real exam-condition signal and can be queued immediately. */
      if (!score.machine) {
        if (!examHasResponse(item) && item.question.conceptId) {
          var blankEntry = store[item.question.conceptId] || (store[item.question.conceptId] = {missed:0, skipped:0, written:0, at:null});
          blankEntry.skipped += 1;
          blankEntry.at = stamped;
        }
        return;
      }
      if (score.awarded === score.possible) return;
      var conceptId = item.question.conceptId;
      if (!conceptId) return;
      var entry = store[conceptId] || (store[conceptId] = {missed: 0, skipped: 0, at: null});
      if (examHasResponse(item)) entry.missed += 1; else entry.skipped += 1;
      entry.at = stamped;
    });
    saveProfile();
  }

  /* One sitting's worth of repair.
   *
   * A randomised trial exposed the problem this fixes: a learner who does badly enough
   * to expose eleven concepts got a run that started at 28 items and grew to 63 as
   * wrong answers scheduled re-attempts, and was still unfinished 44 steps in. The
   * compounding ran exactly the wrong way — the worse the paper went, the longer the
   * repair — so the learner this exists for hit a wall straight after a two-hour mock.
   *
   * Four concepts is a sitting a tired person can finish, and finishing is what makes
   * them come back. The rest are not dropped; they stay queued, worst first, for the
   * next sitting. */
  var EXAM_REPAIR_SITTING = 4;

  /* The concepts a mock exposed, worst first. Skipped counts for less than answered
     and wrong: running out of time is not the same as not knowing it. Concepts already
     taken into a sitting drop behind the ones that have not been, so a second sitting
     picks up where the first stopped rather than repeating it. */
  function examMissList(courseId) {
    var store = (profile.examMisses && profile.examMisses[courseId]) || {};
    return Object.keys(store).map(function (conceptId) {
      var entry = store[conceptId];
      return {conceptId: conceptId, concept: getConcept(courseId, conceptId),
        weight: entry.missed * 2 + entry.skipped + (Number(entry.written) || 0) * 2,
        missed: entry.missed, skipped: entry.skipped, written:Number(entry.written) || 0,
        repairedAt: entry.repairedAt || null};
    }).filter(function (row) { return row.concept && row.weight > 0; })
      .sort(function (a, b) {
        if (Boolean(a.repairedAt) !== Boolean(b.repairedAt)) return a.repairedAt ? 1 : -1;
        return b.weight - a.weight;
      });
  }

  /* One concept, several surfaces, taught first. This is what the depth list routes
     into: a learner who has just been told they can use an idea but cannot tell it
     from its neighbour wants that idea now, not a tour of all eight things they lost
     marks on. `layeredQueue` puts the lesson and primer in front either way. */
  function conceptRepairIds(courseId, conceptId, want) {
    var ids = [];
    var hasWrittenGap = writtenPracticeSummary(courseId).openGaps.some(function (gap) {
      return gap.scope === "writing" || gap.conceptId === conceptId;
    });
    if (hasWrittenGap && writtenPracticeAvailable(courseId)) {
      questionSurfaces(courseId, conceptId).filter(function (question) {
        return question.type === "short-answer";
      }).sort(function (left, right) {
        return (left.writtenMode === "short" ? 0 : 1) - (right.writtenMode === "short" ? 0 : 1) ||
          questionLastAttemptAt(courseId, left.id) - questionLastAttemptAt(courseId, right.id);
      }).forEach(function (question) {
        if (ids.length < (want || 3) && ids.indexOf(question.id) < 0) ids.push(question.id);
      });
    }
    for (var i = 0; i < (want || 3); i++) {
      var question = chooseQuestion(courseId, conceptId, null, ids);
      if (!question || ids.indexOf(question.id) >= 0) break;
      ids.push(question.id);
    }
    return ids.slice(0, want || 3);
  }

  function startExamRepair(courseId, conceptId) {
    profile.selectedCourse = courseId;
    var ids, details;
    if (conceptId) {
      ids = conceptRepairIds(courseId, conceptId, 3);
      var concept = getConcept(courseId, conceptId);
      details = {kind: "exam-repair", conceptId: conceptId,
        title: concept ? concept.name : "What the mock exposed",
        kicker: "Taught first, then tested again — from what the mock exposed"};
    } else {
      var pending = examMissList(courseId);
      /* Take from the concepts no sitting has covered yet. Once every one has been
         through, fall back to the full list — a second pass over the same misses is
         legitimate revision, not a bug. */
      var untouched = pending.filter(function (row) { return !row.repairedAt; });
      var source = untouched.length ? untouched : pending;
      var misses = source.slice(0, EXAM_REPAIR_SITTING);
      if (!misses.length) return;
      ids = misses.map(function (row) {
        return conceptRepairIds(courseId, row.conceptId, 1)[0];
      }).filter(Boolean);
      /* Stamped as taken so the next sitting moves on. The miss itself is kept — it is
         still what the paper proved, and it still orders future practice. */
      var stamp = new Date().toISOString();
      var store = profile.examMisses[courseId] || {};
      misses.forEach(function (row) { if (store[row.conceptId]) store[row.conceptId].repairedAt = stamp; });
      var left = Math.max(0, untouched.length - misses.length);
      details = {kind: "exam-repair", title: "What the mock exposed",
        kicker: left
          ? misses.length + " concepts this sitting · " + left + " waiting for the next"
          : "The concepts you lost marks on, taught before they are tested again"};
    }
    if (!ids.length) return;
    session = createSession(courseId, details, ids);
    /* The same four steps every other run uses. Calling renderQuestion() and
       showScreen() directly skipped beginPractice(), which is what writes the session
       header — so the run started with the markup's placeholder "Title" still in it. */
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  /* ---- where knowledge breaks down --------------------------------------------
   *
   * A score says how many marks. It does not say what went wrong, and "revise
   * Demand validation" is not much better — a learner who can define an idea but
   * cannot use it needs something completely different from one who can use it but
   * confuses it with its neighbour.
   *
   * The bank already carries the metadata to tell those apart. Every question
   * declares the `skills` it exercises, and those sort into a ladder: recognising an
   * idea is not explaining it, explaining is not applying, applying is not telling it
   * from the idea next to it, and none of that is combining two. So for each concept
   * we find the highest rung answered correctly and the lowest rung answered wrongly.
   * The gap between them is the breakdown point, and it names the fix.
   */
  var SKILL_LADDER = [
    {id: "recognise", rung: 1, label: "recognise it"},
    {id: "explain", rung: 2, label: "explain it"},
    {id: "apply", rung: 3, label: "apply it"},
    {id: "compute", rung: 3, label: "compute with it"},
    {id: "distinguish", rung: 4, label: "tell it from its neighbours"},
    {id: "diagnose", rung: 4, label: "spot it going wrong"},
    {id: "evaluate", rung: 5, label: "judge it"},
    {id: "connect", rung: 5, label: "connect it to other ideas"},
    {id: "generate", rung: 5, label: "produce it yourself"}
  ];
  var RUNG_OF = {};
  SKILL_LADDER.forEach(function (entry) { RUNG_OF[entry.id] = entry; });

  function questionRung(question) {
    /* The hardest thing a question asks for is what it actually tests. */
    var best = null;
    (question.skills || []).forEach(function (skill) {
      var entry = RUNG_OF[skill];
      if (entry && (!best || entry.rung > best.rung)) best = entry;
    });
    return best || RUNG_OF.apply;
  }

  /* What each rung asks for, in a learner's words rather than the taxonomy's. */
  var RUNG_ASK = {
    1: "pick it out of a list",
    2: "say what it claims",
    3: "use it on a case",
    4: "tell it apart from a neighbouring idea",
    5: "hold it alongside another idea"
  };

  /* The diagnosis, stated so that it claims only what this paper actually observed.
   *
   * This is the part that is easy to get wrong and worth being careful about. The
   * scored bank asks for rung 3, 4, and 5 only — recognising and explaining are what
   * the *primers* do, and primers never appear on a paper. So a dashboard that says
   * "you can explain it but cannot apply it" after a mock would be inventing the
   * first half of that sentence: nothing on the paper tested explaining. What can be
   * said is the pair actually seen — the hardest thing that went right, and the
   * easiest thing that went wrong — and when only one of those exists, only that one
   * is said. `cleared` is 0 when nothing about the concept went right. */
  function breakdownCopy(cleared, failed, connectionOnly) {
    if (connectionOnly) {
      return {name: "Holds alone, not alongside",
        fix: "You answered this correctly on its own and lost it when it shared a question with another idea. The gap is combining, not the idea itself — work the questions that put two ideas together."};
    }
    if (!cleared) {
      return {name: "Nothing landed",
        fix: "Every question on this went wrong, including asking you to " + RUNG_ASK[failed] +
          ". Treat this as first contact and start from the lesson, not from more questions."};
    }
    if (cleared < failed) {
      return {name: "Stops at " + RUNG_ASK[cleared],
        fix: "You could " + RUNG_ASK[cleared] + " but not " + RUNG_ASK[failed] +
          ". That is the step to practise — going over the definition again will not move it."};
    }
    /* Right and wrong at the same level, or right above and wrong below. Unstable
       rather than absent, and it is a different fix: not new material, more reps. */
    return {name: "Unreliable at " + RUNG_ASK[failed],
      fix: "You managed to " + RUNG_ASK[cleared] + " on one question and lost it on another at the same level. " +
        "It is not missing, it is not dependable yet — repetition is what fixes this, not a new lesson."};
  }

  /* One attempt, fully analysed. Everything the dashboard shows comes from here. */
  function analyseExamAttempt(attempt) {
    var items = attempt.items;
    var scores = items.map(scoreExamItem);
    var machine = items.filter(function (_, i) { return scores[i].machine; });
    var durations = items.filter(function (i) { return i.seconds > 0; }).map(function (i) { return i.seconds; }).sort(function (a, b) { return a - b; });
    var median = durations.length ? durations[Math.floor(durations.length / 2)] : 0;

    /* Per-concept ladder positions. */
    var concepts = {};
    items.forEach(function (item, index) {
      var score = scores[index];
      if (!score.machine) return;
      var conceptId = item.question.conceptId;
      if (!conceptId) return;
      var entry = concepts[conceptId] || (concepts[conceptId] = {
        conceptId: conceptId, concept: getConcept(attempt.courseId, conceptId),
        highestRight: 0, lowestWrong: 99, right: 0, wrong: 0, skipped: 0,
        soloRight: 0, soloWrong: 0, integrativeRight: 0, integrativeWrong: 0, seconds: 0
      });
      var rung = questionRung(item.question).rung;
      var integrative = (item.question.supportingConceptIds || []).length > 0;
      entry.seconds += item.seconds;
      if (!examHasResponse(item)) { entry.skipped += 1; return; }
      if (score.awarded === score.possible) {
        entry.right += 1;
        if (rung > entry.highestRight) entry.highestRight = rung;
        if (integrative) entry.integrativeRight += 1; else entry.soloRight += 1;
      } else {
        entry.wrong += 1;
        if (rung < entry.lowestWrong) entry.lowestWrong = rung;
        if (integrative) entry.integrativeWrong += 1; else entry.soloWrong += 1;
      }
    });

    /* The breakdown is the pair actually observed: the easiest thing that went wrong,
       and the hardest thing that went right. Neither is inferred from the other. */
    var breakdowns = Object.keys(concepts).map(function (id) {
      var entry = concepts[id];
      if (!entry.concept || entry.lowestWrong === 99) return null;
      var failed = Math.min(5, Math.max(1, entry.lowestWrong));
      var cleared = entry.highestRight;
      /* Right on its own and wrong alongside another idea is a connection failure
         whatever the rungs say, and it is the one a score sheet never surfaces. */
      var connectionOnly = entry.soloRight > 0 && entry.integrativeWrong > 0 && entry.integrativeRight === 0;
      return {conceptId: id, concept: entry.concept, rung: connectionOnly ? 5 : failed,
        cleared: cleared, failed: failed,
        copy: breakdownCopy(cleared, failed, connectionOnly),
        right: entry.right, wrong: entry.wrong, skipped: entry.skipped, seconds: entry.seconds,
        connectionOnly: connectionOnly};
    }).filter(Boolean).sort(function (a, b) {
      /* Nothing-landed first, then the lowest step failed, then the most marks lost. */
      if (!a.cleared !== !b.cleared) return a.cleared ? 1 : -1;
      if (a.rung !== b.rung) return a.rung - b.rung;
      return b.wrong - a.wrong;
    });

    /* Pacing. */
    var spent = items.reduce(function (n, i) { return n + i.seconds; }, 0);
    var slowest = items.map(function (item, index) { return {item: item, score: scores[index]}; })
      .filter(function (row) { return row.item.seconds > 0; })
      .sort(function (a, b) { return b.item.seconds - a.item.seconds; }).slice(0, 3);
    var attempted = items.filter(examHasResponse).length;

    /* Guessing. A fast wrong answer that was never revisited is the signature; a
       question answered in under a third of this learner's own median time is fast
       *for them*, which is the only baseline that means anything. */
    var guessThreshold = Math.max(6, Math.round(median / 3));
    var guesses = items.filter(function (item, index) {
      return scores[index].machine && examHasResponse(item) &&
        scores[index].awarded < scores[index].possible &&
        item.seconds > 0 && item.seconds <= guessThreshold && item.changes === 0;
    });
    var changedMind = items.filter(function (item, index) {
      return scores[index].machine && item.changes > 0 && examHasResponse(item);
    });
    var changedToWrong = changedMind.filter(function (item) {
      var index = items.indexOf(item);
      var first = item.firstResponse;
      if (first === null) return false;
      var wouldHaveScored = scoreExamItem({question: item.question, marks: item.marks, response: first});
      return wouldHaveScored.awarded > scores[index].awarded;
    });
    var confidenceRecorded = items.filter(function (item) {
      return examHasResponse(item) && ["low", "medium", "high"].indexOf(item.confidence) >= 0;
    });
    var unsureCorrect = confidenceRecorded.filter(function (item) {
      var index = items.indexOf(item);
      return item.confidence === "low" && scores[index].machine && scores[index].awarded === scores[index].possible;
    });
    var confidentWrong = confidenceRecorded.filter(function (item) {
      var index = items.indexOf(item);
      return item.confidence === "high" && scores[index].machine && scores[index].awarded < scores[index].possible;
    });

    return {
      attempt: attempt, scores: scores, concepts: concepts, breakdowns: breakdowns,
      median: median, spent: spent, remaining: attempt.remaining, attempted: attempted,
      total: items.length, slowest: slowest, guesses: guesses,
      changedMind: changedMind, changedToWrong: changedToWrong,
      confidenceRecorded: confidenceRecorded, unsureCorrect: unsureCorrect, confidentWrong: confidentWrong,
      machineAwarded: scores.filter(function (s) { return s.machine; }).reduce(function (n, s) { return n + s.awarded; }, 0),
      machinePossible: scores.filter(function (s) { return s.machine; }).reduce(function (n, s) { return n + s.possible; }, 0),
      pType: pTypeAnalysis(items, scores)
    };
  }

  /* ---- two products, one switch --------------------------------------------------
   *
   * The learning system and the examiner are separate products that happen to share a
   * bank, and the switch has to feel like moving between two rooms rather than
   * toggling a setting — otherwise the examiner reads as a mode of the learning
   * system, which is the thing the whole design is trying not to be.
   *
   * The transition uses `document.startViewTransition`, which takes a snapshot of the
   * page before and after the change and animates between the two on the compositor.
   * Two things matter about using it correctly:
   *
   *   - The DOM change must happen *inside* the callback. Mutating before the call
   *     means the "old" snapshot is already the new state and nothing animates.
   *   - Where the API is missing, the swap still has to happen. The transition is
   *     decoration; the navigation is not.
   *
   * What the animation actually looks like — direction, duration, and what it becomes
   * for someone who has asked for less motion — is in the stylesheet, next to the
   * switch it belongs to.
   */

  /* Runs a navigation inside a view transition. Everything that crosses between the
     two products goes through here — the header switch, the dashboard's way in, and
     every way out of the examiner — so the move looks the same whichever door was
     used. Moves that stay on one side are left alone: within the examiner, going
     from the papers to a brief is an ordinary screen change, and animating it would
     say "you have gone somewhere else" when you have not. */
  var pendingMode = null;   /* the side a transition is on its way to, while it flies */

  function crossProducts(target, navigate) {
    if ((pendingMode || currentMode()) === target || !document.startViewTransition) {
      pendingMode = null;
      navigate();
      return;
    }
    /* The update callback runs a frame or two later, so for that gap the page still
       says "learn" while the learner has already asked for the examiner. Recording
       where we are heading keeps a second press during that gap from being read as a
       press for the side we are already on and silently dropped. */
    pendingMode = target;
    var transition = document.startViewTransition(function () { pendingMode = null; navigate(); });
    /* A transition can be skipped before it ever animates — a background tab, a
       window that is not compositing, or a second switch pressed during the first.
       That is a normal outcome and the navigation has still happened, but `ready`
       rejects, and an unhandled rejection would report a working app as broken.
       `updateCallbackDone` is deliberately left alone: if the navigation itself
       threw, that is a real fault and should still be loud. */
    if (transition && transition.ready) transition.ready.catch(function () {});
  }

  function currentMode() { return document.documentElement.getAttribute("data-mode") || "learn"; }

  /* Called by showScreen, never directly: which side you are on is a fact about the
     screen you are looking at, so the switch cannot disagree with the page. */
  function markMode(mode) {
    document.documentElement.setAttribute("data-mode", mode);
    $all("#mode-switch .mode-option").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.mode === mode ? "true" : "false");
    });
  }

  /* Every in-app way out of a running paper goes through here. The callback waits
     behind an app-owned dialog so keyboard users, touch users, and deterministic
     browser checks all receive the same reachable decision. */
  var pendingExamExit = null;
  function requestLeaveLivePaper(callback) {
    if (!exam || exam.submitted) { callback(); return; }
    pendingExamExit = callback;
    $("exam-leave-dialog").showModal();
  }

  function switchMode(mode) {
    if ((pendingMode || currentMode()) === mode) return;
    if (mode === "exam") { openExamHome(); return; }
    openNotes();
  }

  function bindModeSwitch() {
    if (!$("mode-switch")) return;
    $all("#mode-switch .mode-option").forEach(function (button) {
      button.addEventListener("click", function () { switchMode(button.dataset.mode); });
    });
    watchCoinForSwitch();
  }

  /* When the header switch is allowed to exist at all.
   *
   * Two rules, and they are different kinds of thing. It is *forbidden* on a paper
   * that is running: there it would be a one-press way to lose two hours, sitting in
   * the furniture beside an unrelated theme button. It is merely *unnecessary* while
   * the coin is on screen, because the coin is the same control at full size two
   * inches below it — so the header stays quiet at the top of a home page and the
   * switch takes over as the coin scrolls away.
   *
   * Each coin records its own visibility on itself, and only the one inside the
   * screen currently showing is consulted — the other lives in an inactive screen,
   * which is display:none and never intersects anything. A screen with no coin at all
   * (a lesson, a paper) therefore keeps the switch, which is the point of having it. */
  function activeCoin() {
    var screen = document.querySelector(".screen.active");
    return screen ? screen.querySelector(".coin") : null;
  }

  function syncModeSwitchVisibility() {
    var control = $("mode-switch");
    if (!control) return;
    var live = Boolean(exam && exam.started && !exam.submitted);
    control.hidden = live;
    var coin = activeCoin();
    /* Unset reads as visible: a home page renders its coin at the top, and assuming
       otherwise for the one frame before the observer first fires would flash the
       switch on and straight back off. */
    var covered = Boolean(coin) && coin.dataset.onScreen !== "0";
    document.body.classList.toggle("coin-in-view", !live && covered);
  }

  /* The handoff. The coin does not literally become the switch — nothing morphs a
     band into a pill across a scroll — but the switch arrives slightly wide and
     settles, which is what a collapse looks like, and it arrives exactly as the coin
     leaves, which is what sells it. */
  function watchCoinForSwitch() {
    if (!window.IntersectionObserver) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.dataset.onScreen = entry.isIntersecting ? "1" : "0";
      });
      syncModeSwitchVisibility();
    }, {threshold: 0});
    $all(".coin").forEach(function (node) { observer.observe(node); });
  }

  /* ---- the coin -------------------------------------------------------------------
   *
   * The two sides shown as one object split down the middle, first on both home pages.
   * Two lines each: the name, and the one thing waiting for you on that side.
   *
   * Where you are is carried by colour — the side you are on is filled in its own
   * colour, ink for the learning system and saffron for the examiner — so it is
   * answered at a glance rather than read. Colour is never the only signal though: the
   * side you are on is inert and carries `aria-current`, and the side you are not on is
   * the whole panel as a button with an arrow on it, which is what a screen reader and
   * a keyboard get. A half-page target should not require aiming at a link inside it.
   *
   * Both faces are built by the same function, so what differs between the dashboard's
   * render and the examiner's is only which half is standing.
   */
  var COIN = {learn: {name: "Learn"}, exam: {name: "Examiner"}};

  function coinNextLearn() {
    var rec = recommendation(profile.selectedCourse);
    return recommendationActionLabel(rec) + " · " + rec.minutes;
  }

  function coinNextExam() {
    return "Choose by time left";
  }

  function renderCoin(mountId, side) {
    var mount = $(mountId);
    if (!mount) return;
    var next = {learn: coinNextLearn, exam: coinNextExam};
    mount.innerHTML = ["learn", "exam"].map(function (which) {
      var here = which === side;
      var copy = COIN[which];
      var body =
        "<p class='coin-name'>" + escapeHtml(copy.name) +
        (here ? "" : " <span class='coin-go' aria-hidden='true'>→</span>") + "</p>" +
        "<p class='coin-next'><small>Next</small>" + escapeHtml(next[which]()) + "</p>";
      return here
        ? "<div class='coin-side coin-" + which + " is-here' aria-current='true'>" + body + "</div>"
        : "<button type='button' class='coin-side coin-" + which + " is-there' data-coin='" + which +
          "' aria-label='Go to " + escapeHtml(copy.name) + "'>" + body + "</button>";
    }).join("");
    $all("#" + mountId + " [data-coin]").forEach(function (button) {
      button.addEventListener("click", function () { switchMode(button.dataset.coin); });
    });
  }

  /* Which paper to sit next.
   *
   * The rule is per paper, not per set: a paper you have never met comes before a
   * second set of one you have, in the order the papers are actually sat, because a
   * candidate with three weeks left learns more from meeting all four once than from
   * three goes at the same one. Once every paper has been met it is the weakest
   * result, since that is where the marks are.
   *
   * IBM's released-case paper is deliberately separate from the numbered coverage
   * cycle. Recommendations still rotate the numbered papers so one fixed case does
   * not crowd out framework transfer. */
  function recommendedMock() {
    var papers = EXAM_HOME_ORDER.filter(function (courseId) { return EXAM_PAPERS[courseId]; })
      .map(function (courseId) {
        var spec = EXAM_PAPERS[courseId];
        var sets = [];
        for (var set = 0; set < examSetCount(courseId); set++) {
          var history = examAttemptsFor(courseId, set);
          sets.push({
            set: set, sittings: history.length,
            best: history.reduce(function (top, row) { return !top || examPercent(row) > examPercent(top) ? row : top; }, null)
          });
        }
        var sat = sets.filter(function (row) { return row.sittings; });
        return {
          courseId: courseId, spec: spec, sets: sets, sittings: sat.length,
          /* A paper's standing is its best result, not its worst: the worst set says
             something about that set, the best says what the paper is worth to you
             now. Which *set* to sit is decided separately, below. */
          best: sat.reduce(function (top, row) {
            return top === null ? examPercent(row.best) : Math.max(top, examPercent(row.best));
          }, null),
          caveat: Boolean(spec.caveat)
        };
      });

    /* Within a paper, a set you have not seen beats one you have: same paper, same
       rules, but a set you have already sat is partly a memory test. */
    function nextSet(paper) {
      var fresh = paper.sets.filter(function (row) { return !row.sittings; })[0];
      if (fresh) return fresh;
      return paper.sets.slice().sort(function (a, b) { return examPercent(a.best) - examPercent(b.best); })[0];
    }
    function first(list) { return list.length ? {paper: list[0], set: nextSet(list[0]), reason: "unmet"} : null; }

    var unmet = first(papers.filter(function (p) { return !p.sittings && !p.caveat; }))
      || first(papers.filter(function (p) { return !p.sittings; }));
    if (unmet) return unmet;
    /* A self-reviewed written paper can dominate weakest-first recommendations, so
       any future caveated paper stays out of that comparison. IBM's numbered sets
       now participate normally; its fixed Released case remains a separate choice. */
    var met = papers.filter(function (p) { return p.sittings && !p.caveat; });
    if (!met.length) met = papers.filter(function (p) { return p.sittings; });
    if (!met.length) return null;
    met.sort(function (a, b) { return a.best - b.best; });
    return {paper: met[0], set: nextSet(met[0]), reason: "weakest"};
  }

  /* How much of a paper the learner has actually been taught.
   *
   * The examiner is meant to be where somebody goes to be tested on what they have
   * been taught, and it had no idea what that was. `buildExamPaper` draws from the
   * whole bank; nothing anywhere compared that against the learner's own progress.
   * Measured on a fresh profile that had finished study set 1 — the first thing the
   * product recommends — the paper it then offered was 90% material nobody had
   * taught them: SPMS 8 of 75 marks reachable, BRGSA 7 of 80, SCLM 7 of 72, IBM 10
   * of 100. That is not the examiner being hard. That is Learn not having happened
   * yet, and the examiner is the only screen positioned to say so.
   *
   * Two numbers, because they answer different questions. `concepts` is
   * seed-independent and describes the paper as a whole, so it can be shown on a
   * card that offers its coverage-sized cycle. `marks` is the real built paper for
   * one set, and is
   * shown where somebody is about to commit two hours to that exact draw.
   *
   * "Taught" is the same weak claim the ladder makes — the lesson has been read.
   * Deliberately not "answered well": telling a candidate they are 60% ready because
   * their evidence is strong would be a prediction, and this product does not make
   * those. It says what has been put in front of them. */
  function examReadiness(courseId, setIndex) {
    var spec = EXAM_PAPERS[courseId];
    if (!spec) return null;
    var course = getCourse(courseId);
    var onPaper = {};
    spec.sections.forEach(function (section) {
      examPool(courseId, section.type).forEach(function (question) {
        conceptIdsOf(question).forEach(function (id) { if (getConcept(courseId, id)) onPaper[id] = true; });
      });
    });
    var selectedPaper = null;
    if (typeof setIndex === "number") {
      selectedPaper = setIndex === EXAM_RELEASED_SET
        ? buildReleasedCasePaper(courseId)
        : setIndex === EXAM_WEAKEST_SET
          ? buildWeakestLinksPaper(courseId)
          : examPaperForSet(courseId, setIndex);
      if (selectedPaper) {
        onPaper = {};
        selectedPaper.questions.forEach(function (entry) {
          conceptIdsOf(entry.question).forEach(function (id) {
            if (getConcept(courseId, id)) onPaper[id] = true;
          });
        });
      }
    }
    var paperConcepts = Object.keys(onPaper);
    var taughtConcepts = paperConcepts.filter(function (id) { return conceptIsTaught(courseId, id); });

    var marks = null;
    if (selectedPaper) {
      var paper = selectedPaper;
      if (paper) {
        /* A question resting on one taught concept and one untaught one is not a
           taught question. Counting it as half-ready would overstate exactly the
           thing this exists to stop overstating. */
        var reachable = paper.questions.filter(function (entry) {
          var ids = conceptIdsOf(entry.question);
          return ids.length && ids.every(function (id) {
            return !getConcept(courseId, id) || conceptIsTaught(courseId, id);
          });
        });
        marks = {
          taught: reachable.reduce(function (sum, entry) { return sum + entry.marks; }, 0),
          available: paper.available
        };
        marks.percent = marks.available ? Math.round((marks.taught / marks.available) * 100) : 0;

        /* How much of this paper the learner has already answered in Learn.
         *
         * There is one bank. Measured across all four subjects, **100% of every
         * paper is drawable in Learn** — not a leak of a few items, no reservation
         * at any point — and three sections have no slack to partition with (SCLM
         * Section A needs 50 from a pool of 52). Reserving an examiner-only slice is
         * bank growth, which is content work.
         *
         * What can be fixed without inventing content is the score concealing it. A
         * candidate who meets an item they answered twenty minutes ago and scores
         * the mark has demonstrated recall, and a mock that reports that as
         * knowledge is the same over-crediting the evidence model refuses to do
         * everywhere else. So it is counted and said. */
        var met = paper.questions.filter(function (entry) {
          return questionLastAttemptAt(courseId, entry.question.id) > 0;
        });
        marks.alreadyMet = met.length;
        marks.alreadyMetMarks = met.reduce(function (sum, entry) { return sum + entry.marks; }, 0);
        marks.total = paper.questions.length;
      }
    }

    /* Point back to the same nine-run path the Learn home shows. The older eight-rung
       teaching ladder omitted the synthesis run and made this briefing say “1 of 8”
       while the learner-facing path said “1 of 9”. */
    var ladder = courseRunPath(courseId);
    return {
      courseId: courseId,
      taught: taughtConcepts.length,
      total: paperConcepts.length,
      allTaught: paperConcepts.length > 0 && taughtConcepts.length === paperConcepts.length,
      none: taughtConcepts.length === 0,
      marks: marks,
      nextStep: ladder.current,
      ladderSteps: ladder.steps
    };
  }

  /* One sentence, used on the card, the hero and the cover. It names the gap and,
     when there is one, the specific next Learn step that closes part of it — a
     readiness figure with no route out of it is just a discouraging number. */
  function examReadinessCopy(readiness) {
    if (!readiness || !readiness.total) return "";
    if (readiness.allTaught) {
      return "You have been taught all " + readiness.total + " concepts this paper draws on" +
        (readiness.marks ? ", covering every one of its " + readiness.marks.available + " marks." : ".");
    }
    var head = readiness.none
      ? "Learn has not taught you any of the " + readiness.total + " concepts this paper draws on yet"
      : "You have been taught " + readiness.taught + " of the " + readiness.total + " concepts this paper draws on";
    var middle = readiness.marks
      ? " — about " + readiness.marks.percent + "% of this set's " + readiness.marks.available + " marks"
      : "";
    var tail = readiness.nextStep
      ? ". Learn run " + readiness.nextStep.step + " of " + readiness.ladderSteps + " is next: " +
        readiness.nextStep.definition.title + "."
      : ".";
    return head + middle + tail;
  }

  /* What a section cannot fill from the bank. Seed-independent, so it can be told
     before a paper is built — and told here as well as on the card, because the hero
     is where most people will start from and it must not be the one honest place
     that goes quiet. */
  function examShortfalls(courseId) {
    var spec = EXAM_PAPERS[courseId];
    return spec.sections.map(function (section) {
      var have = examPool(courseId, section.type).length;
      return have < section.count ? {section: section, have: have} : null;
    }).filter(Boolean);
  }

  function renderExamPick() {
    var pick = recommendedMiniMock();
    var block = $("exam-pick");
    block.hidden = !pick;
    if (!pick) return;
    var course = getCourse(pick.courseId);
    var next = pick.next;
    var cycleTotal = next.cycle.targetConceptIds.length;
    $("exam-pick-title").textContent = course.shortTitle + " · " + (pick.active
      ? "resume your Speedrun"
      : "Speedrun " + (next.round.index + 1) + " of " + next.cycle.rounds.length);
    $("exam-pick-why").textContent = pick.active
      ? "Your eight-question round is saved exactly where you left it. Continue for immediate teaching feedback and one applied question from every module."
      : next.freshRotation
        ? "You completed a full " + cycleTotal + "-concept cycle. This starts a fresh rotation with different question families while keeping all eight modules in view."
        : "This cycle has reached " + next.covered + " of " + cycleTotal + " concepts. The next round prioritises ideas not yet seen in the cycle while still touching every module.";
    $("exam-pick-facts").innerHTML =
      "<span>8 questions</span><span>All 8 modules</span><span>15 minutes tops</span><span>Teaching after every answer</span>";
    $("exam-pick-start").textContent = pick.active ? "Resume Speedrun" : next.freshRotation ? "Start fresh rotation" : "Start Speedrun";
    $("exam-pick-start").onclick = pick.active ? resumeActive : function () {
      startConfidenceSprint(pick.courseId, next.round.index, next.rotation);
    };
  }

  /* ---- the bag ------------------------------------------------------------------
   *
   * A drawer holding the two things a learner wants mid-session and should not leave
   * the page for: a focus timer, and the handful of facts about how this app works
   * that change how much they get out of it.
   *
   * The timer is deliberately plain. It does not gamify, it does not nag, and it
   * writes nothing to the profile — a study aid that quietly became another thing to
   * keep a streak on would be working against the learner. It survives navigation
   * because it runs off a timestamp rather than a countdown variable, so switching
   * screens or opening a paper does not reset it. */
  var POMODORO = {focus: 25 * 60, break: 5 * 60};
  var pomodoro = {phase: "focus", remaining: POMODORO.focus, endsAt: null, running: false, completed: 0};
  var pomodoroTicker = null;

  function pomodoroSecondsLeft() {
    if (!pomodoro.running) return pomodoro.remaining;
    return Math.max(0, Math.round((pomodoro.endsAt - Date.now()) / 1000));
  }

  function renderPomodoro() {
    var left = pomodoroSecondsLeft();
    var mins = Math.floor(left / 60), secs = left % 60;
    var clock = mins + ":" + (secs < 10 ? "0" : "") + secs;
    var display = $("pomodoro-clock");
    if (!display) return;
    display.textContent = clock;
    $("pomodoro-phase").textContent = (pomodoro.phase === "focus" ? "Focus" : "Break") + " · " +
      (pomodoro.running ? "running" : left === (pomodoro.phase === "focus" ? POMODORO.focus : POMODORO.break) ? "not started" : "paused");
    $("pomodoro-toggle").textContent = pomodoro.running ? "Pause" : left < (pomodoro.phase === "focus" ? POMODORO.focus : POMODORO.break) ? "Resume" : "Start";
    $("pomodoro-skip").textContent = pomodoro.phase === "focus" ? "Skip to break" : "Back to focus";
    document.querySelector(".pomodoro").classList.toggle("is-break", pomodoro.phase === "break");
    $("pomodoro-count").textContent = pomodoro.completed
      ? pomodoro.completed + " focus block" + (pomodoro.completed === 1 ? "" : "s") + " finished today."
      : "No focus blocks finished yet.";
    /* The chip on the header button is the only part visible with the bag shut, so a
       learner can leave it closed and still know where they are. */
    var chip = $("bag-timer-chip");
    chip.hidden = !pomodoro.running;
    chip.textContent = clock;
  }

  function pomodoroTick() {
    if (!pomodoro.running) return;
    if (pomodoroSecondsLeft() > 0) { renderPomodoro(); return; }
    /* Phase over. Roll to the other one, stopped — a break you have to start is a
       break you noticed. */
    if (pomodoro.phase === "focus") { pomodoro.completed += 1; pomodoro.phase = "break"; pomodoro.remaining = POMODORO.break; }
    else { pomodoro.phase = "focus"; pomodoro.remaining = POMODORO.focus; }
    pomodoro.running = false;
    pomodoro.endsAt = null;
    window.clearInterval(pomodoroTicker);
    pomodoroTicker = null;
    renderPomodoro();
  }

  function setPomodoroRunning(running) {
    if (running) {
      pomodoro.endsAt = Date.now() + pomodoro.remaining * 1000;
      pomodoro.running = true;
      if (!pomodoroTicker) pomodoroTicker = window.setInterval(pomodoroTick, 1000);
    } else {
      pomodoro.remaining = pomodoroSecondsLeft();
      pomodoro.running = false;
      window.clearInterval(pomodoroTicker);
      pomodoroTicker = null;
    }
    renderPomodoro();
  }

  /* No scrim any more. A dimmed page said "deal with this first", which is the wrong
     thing to say about a timer and a calculator — both are for using *while* reading
     the thing behind them. */
  function setBagOpen(open, restoring) {
    /* Measured while it is still on screen, for placeBagPanel below. */
    var anchor = $("bag-open").hidden ? null : $("bag-open").getBoundingClientRect();
    $("bag-panel").hidden = !open;
    /* The launcher stands where the panel opens, so it steps aside while the panel is
       there — two bags in the same corner, one of them a button for opening the bag
       that is already open, is not a choice anyone needs. */
    $("bag-open").hidden = open || Boolean(bagPrefs().thrown);
    $("bag-open").setAttribute("aria-expanded", open ? "true" : "false");
    if (open) placeBagPanel(anchor);
    /* Where it was left is where it stays. A floating tool that shut itself every time
       you changed screens would have to be reopened once per lesson, which is most of
       the reason a floating tool is worth having. */
    if (profile.bagOpen !== open) {
      profile.bagOpen = open;
      saveProfile();
    }
    /* Focus moves only when a person pressed something. Restoring the bag on load
       must not steal focus from the page. */
    if (restoring) return;
    if (open) $("bag-panel").focus({preventScroll: true});
    else $("bag-open").focus({preventScroll: true});
  }

  /* The bag's calculator. Which keypad you are allowed is a fact about the paper, so
     both are here and the toggle is one press — and the choice sticks, because
     someone practising SCLM numericals wants the scientific pad every time, not once.
     Rebuilding the pad clears the buffer, which is why the toggle is a no-op when it
     is already on that mode: pressing "Normal" twice should not wipe a number. */
  function setBagCalculator(kind) {
    if (!$("bag-calculator")) return;
    if (profile.bagCalculator !== kind) {
      profile.bagCalculator = kind;
      saveProfile();
    } else if ($("bag-calculator").children.length) return;
    $all("#bag-calc-modes .calc-mode").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.calcMode === kind ? "true" : "false");
    });
    buildCalculator("bag-calculator", kind);
  }

  /* ---- carrying the bag around --------------------------------------------------
   *
   * It is a bag. You should be able to put it where it is not in the way, throw it
   * away when you do not want it, and fetch it back from the header — which is the
   * one place that is always on screen and therefore the only honest place to keep
   * the way back.
   *
   * Three details that matter more than the dragging itself:
   *
   *   - A drag must not eat the click. Nothing counts as a drag until the pointer has
   *     travelled 6px, so a tap still opens the bag and a nudge is not a move.
   *   - The position is stored, and re-clamped on every resize. A bag left at the
   *     bottom of a tall window is otherwise off-screen in a short one, with no way
   *     to reach it.
   *   - Pointer events, not mouse events, so it works under a thumb.
   */
  var BAG_EDGE = 12;
  var bagDrag = null;

  function bagPrefs() {
    if (!profile.bag || typeof profile.bag !== "object") profile.bag = {};
    return profile.bag;
  }

  function placeBag() {
    var launcher = $("bag-open");
    if (!launcher) return;
    var prefs = bagPrefs();
    if (typeof prefs.x !== "number" || typeof prefs.y !== "number") {
      launcher.classList.remove("is-placed");
      return;
    }
    launcher.classList.add("is-placed");
    var width = launcher.offsetWidth, height = launcher.offsetHeight;
    var x = Math.max(BAG_EDGE, Math.min(prefs.x, window.innerWidth - width - BAG_EDGE));
    var y = Math.max(BAG_EDGE, Math.min(prefs.y, window.innerHeight - height - BAG_EDGE));
    launcher.style.insetInlineStart = x + "px";
    launcher.style.insetBlockStart = y + "px";
  }

  /* The panel opens from whichever corner the bag is nearest, so it never has to
     travel across the screen to appear, and never opens off the edge. */
  function placeBagPanel(anchor) {
    var panel = $("bag-panel"), launcher = $("bag-open");
    if (!panel || panel.hidden || !launcher) return;
    if (!launcher.classList.contains("is-placed")) {
      panel.style.insetInlineStart = "";
      panel.style.insetBlockStart = "";
      panel.style.insetInlineEnd = "";
      panel.style.insetBlockEnd = "";
      return;
    }
    /* Measured before the launcher was hidden and passed in: a hidden element has no
       box, and reading one gives 0,0 — which put the panel in the opposite corner
       from the bag it was supposed to be opening out of. */
    anchor = anchor || launcher.getBoundingClientRect();
    var width = panel.offsetWidth, height = panel.offsetHeight;
    var right = anchor.left + anchor.width / 2 > window.innerWidth / 2;
    var below = anchor.top + anchor.height / 2 > window.innerHeight / 2;
    var x = right ? anchor.right - width : anchor.left;
    var y = below ? anchor.top - height - 10 : anchor.bottom + 10;
    panel.style.insetInlineStart = Math.max(BAG_EDGE, Math.min(x, window.innerWidth - width - BAG_EDGE)) + "px";
    panel.style.insetBlockStart = Math.max(BAG_EDGE, Math.min(y, window.innerHeight - height - BAG_EDGE)) + "px";
    panel.style.insetInlineEnd = "auto";
    panel.style.insetBlockEnd = "auto";
  }

  /* Order matters here: close first, because setBagOpen decides the launcher's own
     visibility, then record the state, then let both buttons follow it. */
  function setBagThrownAway(thrown) {
    bagPrefs().thrown = thrown;
    saveProfile();
    if (thrown) setBagOpen(false, true);
    document.body.classList.toggle("bag-thrown-away", thrown);
    $("bag-open").hidden = thrown;
    $("bag-restore").hidden = !thrown;
    /* Coming back, it comes back where you left it — not where the bin was. The drag
       that ended in the bin left its own inline position behind. */
    if (!thrown) placeBag();
  }

  function bindBagDrag() {
    var launcher = $("bag-open"), trash = $("bag-trash");
    if (!launcher || !trash || !window.PointerEvent) return;
    launcher.addEventListener("pointerdown", function (event) {
      if (event.button) return;
      var rect = launcher.getBoundingClientRect();
      bagDrag = {id: event.pointerId, moved: false, locked: Boolean($("practice-screen") && $("practice-screen").classList.contains("active")), dx: event.clientX - rect.left, dy: event.clientY - rect.top};
      launcher.setPointerCapture(event.pointerId);
    });
    launcher.addEventListener("pointermove", function (event) {
      if (!bagDrag || event.pointerId !== bagDrag.id || bagDrag.locked) return;
      var x = event.clientX - bagDrag.dx, y = event.clientY - bagDrag.dy;
      if (!bagDrag.moved) {
        var rect = launcher.getBoundingClientRect();
        if (Math.abs(x - rect.left) < 6 && Math.abs(y - rect.top) < 6) return;
        bagDrag.moved = true;
        launcher.classList.add("is-dragging", "is-placed");
        trash.hidden = false;
        setBagOpen(false, true);
      }
      launcher.style.insetInlineStart = Math.max(BAG_EDGE, Math.min(x, window.innerWidth - launcher.offsetWidth - BAG_EDGE)) + "px";
      launcher.style.insetBlockStart = Math.max(BAG_EDGE, Math.min(y, window.innerHeight - launcher.offsetHeight - BAG_EDGE)) + "px";
      trash.classList.toggle("is-over", overTrash(event));
    });
    var finish = function (event) {
      if (!bagDrag || event.pointerId !== bagDrag.id) return;
      var dropped = bagDrag.moved;
      var binned = dropped && overTrash(event);
      bagDrag = null;
      launcher.classList.remove("is-dragging");
      trash.hidden = true;
      trash.classList.remove("is-over");
      if (!dropped) { setBagOpen($("bag-panel").hidden); return; }
      if (binned) { setBagThrownAway(true); return; }
      var rect = launcher.getBoundingClientRect();
      var prefs = bagPrefs();
      prefs.x = Math.round(rect.left);
      prefs.y = Math.round(rect.top);
      saveProfile();
    };
    launcher.addEventListener("pointerup", finish);
    launcher.addEventListener("pointercancel", finish);
    /* A window that changes size can put a placed bag out of reach, so it is clamped
       back in — and the panel with it, if it happens to be open. */
    window.addEventListener("resize", function () { placeBag(); placeBagPanel(); });
  }

  function overTrash(event) {
    var trash = $("bag-trash");
    if (!trash || trash.hidden) return false;
    var rect = trash.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  function bindBag() {
    if (!$("bag-open")) return;
    $("bag-panel").setAttribute("tabindex", "-1");
    /* Opening is handled by the drag binding's pointerup, which knows whether the
       press was a tap or a move. The click listener stays for keyboard activation,
       which never sets a drag. */
    $("bag-open").addEventListener("click", function (event) {
      if (event.detail) return;
      setBagOpen($("bag-panel").hidden);
    });
    $("bag-close").addEventListener("click", function () { setBagOpen(false); });
    $("bag-restore").addEventListener("click", function () {
      setBagThrownAway(false);
      setBagOpen(true);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !$("bag-panel").hidden) setBagOpen(false);
    });
    $all("#bag-calc-modes .calc-mode").forEach(function (button) {
      button.addEventListener("click", function () { setBagCalculator(button.dataset.calcMode); });
    });
    setBagCalculator(profile.bagCalculator === "scientific" ? "scientific" : "basic");
    bindBagDrag();
    setBagThrownAway(Boolean(bagPrefs().thrown));
    placeBag();
    if (profile.bagOpen && !bagPrefs().thrown) setBagOpen(true, true);
    $("pomodoro-toggle").addEventListener("click", function () { setPomodoroRunning(!pomodoro.running); });
    /* Clear `running` *before* setting the new duration. setPomodoroRunning(false)
       recomputes `remaining` from the live end-time, so leaving the timer marked as
       running here overwrote the phase's fresh duration with whatever was left on the
       old clock — skipping to a five-minute break showed 25:00. */
    $("pomodoro-reset").addEventListener("click", function () {
      pomodoro.running = false;
      pomodoro.remaining = pomodoro.phase === "focus" ? POMODORO.focus : POMODORO.break;
      setPomodoroRunning(false);
    });
    $("pomodoro-skip").addEventListener("click", function () {
      pomodoro.running = false;
      pomodoro.phase = pomodoro.phase === "focus" ? "break" : "focus";
      pomodoro.remaining = pomodoro.phase === "focus" ? POMODORO.focus : POMODORO.break;
      setPomodoroRunning(false);
    });
    renderPomodoro();
  }

  /* ---- product telemetry, shaped but not sent ------------------------------------
   *
   * Two different things get called telemetry and only one of them is here.
   *
   * Everything above this line is the learner's own analysis: it is computed on their
   * device, shown to them, saved in their profile, and goes nowhere. This block is the
   * other kind — what the owner would need to make the product better — and it is
   * deliberately built as far as it can honestly go and no further.
   *
   * It shapes events against `.agents/contracts/tester-event.schema.json` and puts
   * them in a bounded local buffer. It does not transmit. There is no endpoint in this
   * file, no fetch, and no queue that drains anywhere, because the things that must
   * exist before a single event may leave a tester's machine do not exist yet:
   * explicit consent for *this* scope, pseudonymous identity mapping, a retention and
   * deletion path, and owner activation. Those are tracked in `.agents/` and the
   * collection stays off until they land.
   *
   * So the flag defaults to off, and with it off nothing is computed or stored at all.
   * What this buys today is that the contract is executable and verified rather than
   * aspirational: the events are the real shape, from a real attempt, validated
   * against the real schema.
   */
  var TELEMETRY_FLAG = "t6.telemetry.local";
  var telemetryBuffer = [];

  function telemetryEnabled() {
    try { return window.localStorage.getItem(TELEMETRY_FLAG) === "on"; }
    catch (error) { return false; }
  }

  function band(value, bands) {
    for (var i = 0; i < bands.length; i++) if (value <= bands[i][0]) return bands[i][1];
    return bands[bands.length - 1][1];
  }

  function percentBand(percent) {
    return band(percent, [[19, "0-19"], [39, "20-39"], [59, "40-59"], [79, "60-79"], [100, "80-100"]]);
  }

  /* Bands, never exact values. The cohort is eight people: an exact mark on a named
     paper on a known date is close to an identifier, and a raw duration is a
     behavioural fingerprint. The product questions — is anyone finishing, is negative
     marking being handled, does the diagnosis get clicked — all survive banding. */
  function examTelemetryEvents(analysis, automatic) {
    var attempt = analysis.attempt;
    var courseId = attempt.courseId;
    var sittings = examAttemptsFor(courseId, attempt.setIndex || 0).length;
    var shortfall = attempt.paper.shortfalls.length > 0;
    var scorePercent = analysis.machinePossible
      ? Math.round(analysis.machineAwarded / analysis.machinePossible * 100) : 0;
    var attemptedPercent = analysis.total
      ? Math.round(analysis.attempted / analysis.total * 100) : 0;
    var guessPercent = analysis.total
      ? Math.round(analysis.guesses.length / analysis.total * 100) : 0;
    var budget = EXAM_MINUTES * 60;

    var base = {
      schema_version: "1.1",
      consent_scope: "tester-examiner-events-v1",
      synthetic: false,
      course_id: courseId,
      exam_set_index: attempt.setIndex === EXAM_WEAKEST_SET ? 9
        : attempt.setIndex === EXAM_RELEASED_SET ? 8
          : (attempt.setIndex || 0)
    };

    var events = [{
      event_type: "exam_attempt_submitted",
      exam_sitting_number: Math.max(1, sittings),
      exam_paper_shortfall: shortfall,
      exam_outcome: automatic ? "auto-submitted" : "submitted",
      exam_score_band: analysis.machinePossible ? percentBand(scorePercent) : "not-scored",
      exam_attempted_band: percentBand(attemptedPercent),
      exam_pacing_band: attempt.remaining <= 0 ? "ran-out"
        : band(analysis.spent / budget * 100, [[50, "well-under"], [85, "under"], [100, "on-pace"], [1e9, "over"]]),
      exam_guess_band: guessPercent === 0 ? "none"
        : band(guessPercent, [[9, "under-10pct"], [25, "10-25pct"], [1e9, "over-25pct"]]),
      exam_wrong_ticks: analysis.pType ? analysis.pType.wrongTicks : 0,
      exam_changed_to_wrong: analysis.changedToWrong.length,
      exam_revisit_band: band(attempt.items.reduce(function (n, i) { return n + Math.max(0, i.visits - 1); }, 0),
        [[0, "none"], [analysis.total, "few"], [1e9, "many"]]),
      exam_breakdown_count: analysis.breakdowns.length
    }];

    /* One per concept that broke down. This is the signal that says which ideas the
       bank teaches badly rather than which learner studied badly — the same rung
       failing across many testers is a content defect, not eight coincidences. */
    analysis.breakdowns.forEach(function (row) {
      events.push({
        event_type: "exam_breakdown_identified",
        concept_ids: [row.conceptId],
        exam_breakdown_rung: row.rung,
        exam_breakdown_kind: row.connectionOnly ? "connection-only"
          : !row.cleared ? "nothing-landed"
          : row.cleared < row.failed ? "stops-below" : "unreliable"
      });
    });

    return events.map(function (event) {
      var merged = {};
      Object.keys(base).forEach(function (key) { merged[key] = base[key]; });
      Object.keys(event).forEach(function (key) { merged[key] = event[key]; });
      return merged;
    });
  }

  /* Buffered locally and bounded. No transmission path exists, by design. */
  function bufferExamTelemetry(analysis, automatic) {
    if (!telemetryEnabled()) return;
    try {
      examTelemetryEvents(analysis, automatic).forEach(function (event) { telemetryBuffer.push(event); });
      while (telemetryBuffer.length > 200) telemetryBuffer.shift();
      window.T6_TELEMETRY_BUFFER = telemetryBuffer;
    } catch (error) { /* telemetry must never break a paper */ }
  }

  /* ---- the examiner's front door ------------------------------------------------ */

  function examAttemptsFor(courseId, setIndex) {
    var log = (profile.examAttempts && profile.examAttempts[courseId]) || [];
    return typeof setIndex === "number"
      ? log.filter(function (row) { return row.setIndex === setIndex; })
      : log.slice();
  }

  /* Summary only. The paper is rebuildable from its seed, so storing responses would
     buy nothing and cost a learner's saved profile the size of the bank. */
  function recordExamAttempt(analysis, automatic) {
    var courseId = analysis.attempt.courseId;
    var log = profile.examAttempts[courseId] || (profile.examAttempts[courseId] = []);
    var rungs = {};
    analysis.breakdowns.forEach(function (row) { rungs[row.rung] = (rungs[row.rung] || 0) + 1; });
    log.push({
      setIndex: analysis.attempt.setIndex || 0,
      at: new Date().toISOString(),
      awarded: analysis.machineAwarded, possible: analysis.machinePossible,
      attempted: analysis.attempted, total: analysis.total,
      spent: analysis.spent, median: analysis.median,
      guesses: analysis.guesses.length,
      confidenceRecorded: analysis.confidenceRecorded.length,
      unsureCorrect: analysis.unsureCorrect.length,
      confidentWrong: analysis.confidentWrong.length,
      changedToWrong: analysis.changedToWrong.length,
      wrongTicks: analysis.pType ? analysis.pType.wrongTicks : 0,
      breakdowns: analysis.breakdowns.length, rungs: rungs,
      autoSubmitted: Boolean(automatic)
    });
    /* Two dozen papers is more than a term's worth; older ones stop being evidence. */
    while (log.length > 24) log.shift();
    saveProfile();
  }

  /* Cross to Learn and open the step that closes part of the gap just quoted. The
     whole point of stating readiness on the examiner is that Learn owns the fix, so
     the control goes there and starts the work rather than dropping somebody on a
     dashboard to find it themselves. */
  function startNextLadderStep(courseId) {
    var path = courseRunPath(courseId);
    profile.selectedCourse = courseId;
    crossProducts("learn", function () {
      if (path.current) return startStudySet(courseId, path.current.definition.id);
      renderDashboard();
      showScreen("dashboard-screen");
    });
  }

  /* A read-only handle for tools/browser-checks/export-run.js.
   *
   * The persona harness has to serve the EXACT paper a candidate would sit — same
   * draw, same order — and `buildExamPaper` lives in this closure. The alternative
   * was to mirror it in the harness, which is the drifting second copy of the rules
   * that teach-before-test.js exists to warn about: a persona would then be testing
   * the copy rather than the app.
   *
   * It discloses nothing new. Every question, option and answer it can reach is
   * already sitting in `window.T6_COURSES` for anyone with a console open, so this
   * adds no surface — it only saves the harness from reimplementing the seed and the
   * section spec. Read-only by construction: each call builds a fresh object and
   * none of them touch `exam`, the profile, or the screen. */
  window.__dungeonExport = {
    paper: function (courseId, setIndex) {
      var spec = EXAM_PAPERS[courseId];
      var index = typeof setIndex === "number" ? setIndex : 0;
      var built = index === EXAM_RELEASED_SET
        ? buildReleasedCasePaper(courseId)
        : index === EXAM_WEAKEST_SET
          ? buildWeakestLinksPaper(courseId)
          : examPaperForSet(courseId, index);
      if (!built) return null;
      return {
        courseId: courseId, setIndex: index, minutes: EXAM_MINUTES,
        total: spec.total, available: built.available, shortfalls: built.shortfalls,
        coverageCycle: built.releasedCase || built.personalized ? null : {
          sets:examSetCount(courseId), newConceptsThisSet:built.newConceptIds.length,
          conceptsReachedAfterThisSet:built.coverageAfter, paperRelevantConcepts:built.coverageTarget
        },
        releasedCase: Boolean(built.releasedCase),
        releaseNote: spec.releaseNote || null,
        caveat: spec.caveat || null,
        sections: spec.sections.map(function (section) {
          return {id: section.id, label: section.label, type: section.type,
            count: section.count, marks: section.marks, rule: section.rule};
        }),
        items: built.questions.map(function (entry) {
          return {section: entry.section, marks: entry.marks, question: entry.question};
        })
      };
    },
    readiness: function (courseId, setIndex) { return examReadiness(courseId, setIndex); },
    miniMocks: function (courseId, rotation) {
      return window.T6_MINI_MOCKS ? window.T6_MINI_MOCKS.build(courseId, rotation || 0) : null;
    },
    paperPattern: function (courseId) {
      return window.T6_PAPER_PATTERN && typeof window.T6_PAPER_PATTERN.build === "function"
        ? window.T6_PAPER_PATTERN.build(courseId) : null;
    },
    ladder: function (courseId) { return courseLadder(courseId); },
    /* What a lesson's closing handoff actually SAYS in a given run — the prose plus
       the correction the app prints when the run departs from the course's order.
       Exported rather than left to the harness because the first version of the
       harness printed the raw `connects` string and so reported a promise the app had
       already qualified on screen. `lectureIds` is the run's lessons in order. */
    handoffs: function (lectureIds) {
      var ids = (lectureIds || []).slice();
      return ids.map(function (lectureId, index) {
        var data = lessonFor(lectureId);
        if (!data) return {lectureId: lectureId, missing: true};
        var handoff = lessonHandoff(data, ids[index + 1] || null);
        handoff.lectureId = lectureId;
        return handoff;
      });
    }
  };

  function examSetLabel(index) {
    return index === EXAM_RELEASED_SET ? "Released case" : index === EXAM_WEAKEST_SET ? "Weakest links" : "Set " + (index + 1);
  }

  function examPercent(row) {
    return row.possible ? Math.round((row.awarded / row.possible) * 100) : 0;
  }

  function miniMockState(courseId) {
    if (!profile.miniMockProgress || typeof profile.miniMockProgress !== "object") profile.miniMockProgress = {};
    var state = profile.miniMockProgress[courseId];
    if (!state || typeof state !== "object") {
      state = {rotation:0, completed:{}, cyclesCompleted:0, totalRounds:0};
      profile.miniMockProgress[courseId] = state;
    }
    state.rotation = Math.max(0, Number(state.rotation) || 0);
    state.completed = state.completed && typeof state.completed === "object" ? state.completed : {};
    state.cyclesCompleted = Math.max(0, Number(state.cyclesCompleted) || 0);
    state.totalRounds = Math.max(0, Number(state.totalRounds) || 0);
    return state;
  }

  function miniMockCycle(courseId, rotation) {
    return window.T6_MINI_MOCKS && window.T6_MINI_MOCKS.build(courseId, rotation || 0);
  }

  function miniMockCovered(courseId, cycle, completed) {
    var covered = {};
    cycle.rounds.forEach(function (round) {
      if (!completed[String(round.index)]) return;
      round.newConceptIds.forEach(function (id) { covered[id] = true; });
    });
    return Object.keys(covered).length;
  }

  function nextMiniMock(courseId) {
    var state = miniMockState(courseId);
    var cycle = miniMockCycle(courseId, state.rotation);
    if (!cycle) return null;
    var next = cycle.rounds.filter(function (round) { return !state.completed[String(round.index)]; })[0];
    if (next) return {
      courseId:courseId, state:state, cycle:cycle, round:next, rotation:state.rotation,
      covered:miniMockCovered(courseId, cycle, state.completed), freshRotation:false
    };
    var fresh = miniMockCycle(courseId, state.rotation + 1);
    return {
      courseId:courseId, state:state, cycle:fresh, round:fresh.rounds[0], rotation:state.rotation + 1,
      covered:cycle.targetConceptIds.length, freshRotation:true
    };
  }

  function recommendedMiniMock() {
    if (profile.active && profile.active.kind === "confidence-sprint" && EXAM_HOME_ORDER.indexOf(profile.active.courseId) >= 0) {
      return {courseId:profile.active.courseId, active:true, next:nextMiniMock(profile.active.courseId)};
    }
    var courseId = EXAM_HOME_ORDER.filter(function (id) {
      var next = nextMiniMock(id);
      return next && !next.freshRotation;
    })[0] || EXAM_HOME_ORDER[0];
    return {courseId:courseId, active:false, next:nextMiniMock(courseId)};
  }

  function startConfidenceSprint(courseId, roundIndex, rotation) {
    var state = miniMockState(courseId);
    rotation = Math.max(0, Number(rotation) || 0);
    if (rotation !== state.rotation) {
      state.rotation = rotation;
      state.completed = {};
    }
    var cycle = miniMockCycle(courseId, rotation);
    var round = cycle && cycle.rounds[Number(roundIndex) || 0];
    if (!round) return toast("That Speedrun is not available.");
    profile.selectedCourse = courseId;
    session = createSession(courseId, {
      kind:"confidence-sprint",
      mode:"learning",
      title:"Speedrun " + (round.index + 1),
      kicker:"Within a week · 15-minute Speedrun " + (round.index + 1) + " of " + cycle.rounds.length + " · feedback after every answer",
      skipLessons:true,
      skipPrimers:true,
      confidenceRotation:rotation,
      confidenceRound:round.index,
      confidenceCycleRounds:cycle.rounds.length
    }, round.questionIds);
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function recordMiniMockProgress(completedSession, percent, scoredCount) {
    if (!completedSession || completedSession.kind !== "confidence-sprint") return;
    var state = miniMockState(completedSession.courseId);
    if (state.rotation !== completedSession.confidenceRotation) return;
    var key = String(completedSession.confidenceRound);
    var previous = state.completed[key] || {attempts:0, best:null};
    previous.attempts += 1;
    previous.last = scoredCount ? percent : null;
    previous.best = scoredCount ? (previous.best == null ? percent : Math.max(previous.best, percent)) : previous.best;
    previous.at = new Date().toISOString();
    state.completed[key] = previous;
    state.totalRounds += 1;
    var cycle = miniMockCycle(completedSession.courseId, state.rotation);
    if (cycle && cycle.rounds.every(function (round) { return state.completed[String(round.index)]; })) {
      state.cyclesCompleted = Math.max(state.cyclesCompleted, state.rotation + 1);
    }
  }

  /* Every route into the examiner goes through the same door, so arriving from the
     dashboard, from the switch, or from backing out of a brief all look alike. */
  function openExamHome() {
    crossProducts("exam", function () { renderExamHome(); showScreen("exam-home-screen"); });
  }

  var examHomeMode = "exam";
  var examTimeMode = "speedrun";
  var finalSprintCourse = null;

  function setExamHomeMode(mode) {
    if (["exam", "full"].indexOf(mode) < 0) mode = "exam";
    examHomeMode = mode;
    var screen = $("exam-home-screen");
    if (screen) screen.setAttribute("data-exam-home-mode", mode);
    $all("#exam-mode-switch [data-exam-mode]").forEach(function (button) {
      var selectedMode = button.dataset.examMode === mode;
      button.setAttribute("aria-selected", String(selectedMode));
      button.tabIndex = selectedMode ? 0 : -1;
    });
    ["exam", "full"].forEach(function (name) {
      var panel = $("exam-mode-" + name);
      if (panel) panel.hidden = name !== mode;
    });
    if (mode === "exam") setExamTimeMode(examTimeMode);
    if (mode !== "exam" || examTimeMode !== "speedrun") {
      $("exam-resume-bar").hidden = true;
      document.body.classList.remove("has-resume-bar");
    }
  }

  function setExamTimeMode(mode) {
    if (["speedrun", "mini"].indexOf(mode) < 0) mode = "speedrun";
    examTimeMode = mode;
    $all("#exam-time-switch [data-exam-time-mode]").forEach(function (button) {
      var selectedMode = button.dataset.examTimeMode === mode;
      button.setAttribute("aria-pressed", String(selectedMode));
    });
    $("exam-mode-mini").hidden = mode !== "speedrun";
    $("exam-mode-final").hidden = mode !== "mini";
    if (mode === "mini") renderFinalSprint();
    if (mode !== "speedrun") {
      $("exam-resume-bar").hidden = true;
      document.body.classList.remove("has-resume-bar");
    }
  }

  function renderExamHome() {
    renderCoin("coin-exam", "exam");
    renderExamPick();
    renderExamRecord();
    $("exam-mini-grid").innerHTML = EXAM_HOME_ORDER.filter(function (courseId) { return EXAM_PAPERS[courseId]; })
      .map(renderMiniMockCard).join("");
    $("exam-papers").innerHTML = EXAM_HOME_ORDER.filter(function (courseId) { return EXAM_PAPERS[courseId]; })
      .map(renderExamPaperCard).join("");
    var releasedHistory = examAttemptsFor("IBM", EXAM_RELEASED_SET);
    var releasedLast = releasedHistory[releasedHistory.length - 1];
    $("exam-case-priority-status").textContent = releasedLast
      ? examPercent(releasedLast) + "% last · " + releasedHistory.length + " sitting" + (releasedHistory.length === 1 ? "" : "s")
      : "Exact released brief · 100 marks";
    var patternStart = $("brgsa-pattern-start");
    if (patternStart) patternStart.innerHTML = isCurrentPaperPatternSession(profile.active, "BRGSA")
      ? "Resume BRGSA drill <span aria-hidden='true'>→</span>"
      : "Start BRGSA drill <span aria-hidden='true'>→</span>";
    $all("#exam-mini-grid [data-mini-mock-course]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (profile.active && profile.active.kind === "confidence-sprint" && profile.active.courseId === button.dataset.miniMockCourse) return resumeActive();
        startConfidenceSprint(button.dataset.miniMockCourse, Number(button.dataset.miniMockRound), Number(button.dataset.miniMockRotation));
      });
    });
    /* These controls are replaced on every render, so bind the fresh controls here.
       A container-level listener looked correct in source but failed on the live
       chooser: the button visibly pressed without opening a paper. */
    $all("#exam-papers [data-exam-set]").forEach(function (button) {
      button.addEventListener("click", function () {
        openExaminer(button.dataset.examCourse, Number(button.dataset.examSet));
      });
    });
    $all("#exam-papers [data-teach-course]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startNextLadderStep(button.dataset.teachCourse);
      });
    });
    setExamHomeMode(examHomeMode);
  }

  function renderMiniMockCard(courseId) {
    var course = getCourse(courseId);
    var mini = nextMiniMock(courseId);
    var target = mini.cycle.targetConceptIds.length;
    var active = profile.active && profile.active.kind === "confidence-sprint" && profile.active.courseId === courseId;
    var action = active ? "Resume saved Speedrun" : mini.freshRotation ? "Start new rotation" : "Start Speedrun " + (mini.round.index + 1);
    var copy = mini.freshRotation
      ? "Full " + target + "-concept cycle complete. The next rotation changes question families."
      : mini.covered + " of " + target + " concepts reached in this rotation · Speedrun " + (mini.round.index + 1) + " of " + mini.cycle.rounds.length + ".";
    var progress = mini.freshRotation ? 100 : Math.round(mini.covered / Math.max(1, target) * 100);
    return "<article class='exam-mini-card" + (active ? " is-active" : "") + "'>" +
      "<header><p class='eyebrow'>" + escapeHtml(course.shortTitle) + "</p><h3>" + escapeHtml(course.title) + "</h3></header>" +
      "<p>8 applied questions · all 8 modules · correction after every answer</p>" +
      "<div class='exam-mini-progress'><i aria-hidden='true' style='width:" + progress + "%'></i></div>" +
      "<small>" + escapeHtml(active ? "A saved round is waiting exactly where you left it." : copy) + "</small>" +
      "<button type='button' class='button primary compact' data-mini-mock-course='" + escapeHtml(courseId) +
        "' data-mini-mock-round='" + mini.round.index + "' data-mini-mock-rotation='" + mini.rotation + "'>" + escapeHtml(action) + "</button>" +
      "</article>";
  }

  function finalSprintData(courseId) {
    return window.T6_FINAL_SPRINTS && window.T6_FINAL_SPRINTS[courseId];
  }

  function paperPatternBuild(courseId) {
    return window.T6_PAPER_PATTERN && typeof window.T6_PAPER_PATTERN.build === "function"
      ? window.T6_PAPER_PATTERN.build(courseId) : null;
  }

  function paperPatternStep(questionId) {
    var built = paperPatternBuild("BRGSA");
    return built && built.route.filter(function (step) { return step.id === questionId; })[0] || null;
  }

  function isCurrentPaperPatternSession(value, courseId) {
    var built = paperPatternBuild(courseId || "BRGSA");
    return Boolean(value && built && value.kind === "paper-pattern" && value.courseId === courseId
      && value.paperPatternVersion === built.version && value.baseCount === built.questionIds.length);
  }

  function startPaperPatternRevision(courseId) {
    courseId = courseId || "BRGSA";
    if (isCurrentPaperPatternSession(profile.active, courseId)) return resumeActive();
    var built = paperPatternBuild(courseId);
    if (!built || built.questionIds.length !== 29) return toast("The BRGSA concept-by-concept drill is not ready yet.");
    profile.selectedCourse = courseId;
    session = createSession(courseId, {
      kind:"paper-pattern",
      mode:"learning",
      title:"Direct concept revision",
      kicker:"BRGSA concept revision · 29 direct questions · immediate correction",
      skipLessons:true,
      skipPrimers:true
    }, built.questionIds);
    session.paperPatternVersion = built.version;
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function openBrgsaWritingPlaybook() {
    openExamHome();
    window.setTimeout(function () {
      var playbook = $("brgsa-writing-playbook");
      if (!playbook) return;
      playbook.open = true;
      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      playbook.scrollIntoView({behavior: reduced ? "auto" : "smooth", block:"start"});
      var summary = playbook.querySelector("summary");
      if (summary) summary.focus({preventScroll:true});
    }, 180);
  }

  function finalSprintState(courseId) {
    var root = profile.finalSprintProgress || (profile.finalSprintProgress = {});
    return root[courseId] || (root[courseId] = {attempts:0, best:null, last:null, at:null});
  }

  function finalSprintBuild(courseId, rotation) {
    return window.T6_FINAL_SPRINTS && typeof window.T6_FINAL_SPRINTS.build === "function"
      ? window.T6_FINAL_SPRINTS.build(courseId, rotation) : null;
  }

  function finalFormatLabel(type) {
    return {mcq:"Single choice", msq:"P-type MSQ", "case-cloze":"Scenario choices", numeric:"Numerical", match:"Match"}[type] || type;
  }

  function startFinalSprint(courseId, rotation) {
    if (profile.active && profile.active.kind === "final-sprint" && profile.active.courseId === courseId && rotation === undefined) return resumeActive();
    var state = finalSprintState(courseId);
    rotation = rotation === undefined ? state.attempts : Math.max(0, Number(rotation) || 0);
    var built = finalSprintBuild(courseId, rotation);
    if (!built || built.questionIds.length !== 8) return toast("This Mini is missing one of its eight module questions.");
    profile.selectedCourse = courseId;
    session = createSession(courseId, {
      kind:"final-sprint",
      mode:"learning",
      title:"25-minute Mini",
      kicker:"Last 25–30 minutes · 8 rapid questions · immediate correction · no prose worksheet",
      skipLessons:true,
      skipPrimers:true,
      finalSprintRotation:rotation
    }, built.questionIds);
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function recordFinalSprintProgress(completedSession, percent) {
    if (!completedSession || completedSession.kind !== "final-sprint") return;
    var state = finalSprintState(completedSession.courseId);
    state.attempts += 1;
    state.last = percent;
    state.best = state.best == null ? percent : Math.max(state.best, percent);
    state.at = new Date().toISOString();
  }

  function renderFinalSprint() {
    var host = $("final-sprint");
    if (!host || !window.T6_FINAL_SPRINTS) return;
    if (finalSprintCourse && EXAM_HOME_ORDER.indexOf(finalSprintCourse) < 0) finalSprintCourse = null;
    if (!finalSprintCourse || !finalSprintData(finalSprintCourse)) {
      finalSprintCourse = null;
      host.innerHTML = "<section class='final-choice-head'><p class='eyebrow'>Last 25–30 minutes</p><h2>Which exam are you about to sit?</h2><p>Choose one subject. Dungeon will collapse this menu and load only its eight-question Mini.</p></section>" +
        "<section class='final-choice-grid' aria-label='Choose a Mini subject'>" + EXAM_HOME_ORDER.map(function (courseId) {
          var choiceCourse = getCourse(courseId);
          return "<button type='button' class='final-choice-card' data-final-course='" + escapeHtml(courseId) + "'>" +
            "<span>" + escapeHtml(choiceCourse.shortTitle) + "</span><b>" + escapeHtml(choiceCourse.title) + "</b><small>" +
            "8 questions · one per module</small><em>Load Mini <span aria-hidden='true'>→</span></em></button>";
        }).join("") + "</section>";
      return;
    }
    var pack = finalSprintData(finalSprintCourse);
    var course = getCourse(finalSprintCourse);
    var state = finalSprintState(finalSprintCourse);
    var active = profile.active && profile.active.kind === "final-sprint" && profile.active.courseId === finalSprintCourse;
    var rotation = active ? profile.active.finalSprintRotation : state.attempts;
    var built = finalSprintBuild(finalSprintCourse, rotation);
    var subjects = EXAM_HOME_ORDER.map(function (courseId) {
      return "<button type='button' role='tab' data-final-course='" + courseId + "' aria-selected='" +
        (courseId === finalSprintCourse) + "'>" + escapeHtml(getCourse(courseId).shortTitle) + "</button>";
    }).join("");
    var route = (built ? built.questions : []).map(function (question) {
      var concept = getConcept(finalSprintCourse, question.conceptId);
      return "<article class='final-route-step'><span>Module " + question.module + "</span><b>" +
        escapeHtml(concept ? concept.name : question.node) + "</b><small>" + escapeHtml(finalFormatLabel(question.type || "mcq")) + "</small></article>";
    }).join("");
    var scoreLine = state.attempts ? "Last " + state.last + "% · best " + state.best + "% · next start rotates the questions." : "No Mini completed yet. Your first pass is ready.";
    host.innerHTML =
      "<nav class='final-subjects is-folded' role='tablist' aria-label='Mini subject'>" + subjects + "</nav>" +
      "<section class='final-hero'><div><p class='eyebrow'>" + escapeHtml(course.shortTitle) + " · last 25–30 minutes</p><h2>" +
        escapeHtml(pack.title) + "</h2><p>" + escapeHtml(pack.focus) + "</p></div>" +
        "<div class='final-start-card'><strong>8 questions</strong><span>One per module · correction after each answer</span><small>" + escapeHtml(scoreLine) + "</small>" +
        "<button class='button primary' type='button' data-final-start='" + escapeHtml(finalSprintCourse) + "'>" + (active ? "Resume saved Mini" : "Start accelerated Mini") + "</button></div></section>" +
      "<div class='final-paper-rule'><b>How this relates to the paper</b><p>" + escapeHtml(pack.paperReality) + "</p></div>" +
      "<details class='final-disclosure'><summary><span><b>Preview the eight-module route</b><small>Optional · the questions stay hidden</small></span><span class='disclosure-action'>Open</span></summary>" +
        "<section class='final-route' aria-label='Eight-module Mini route'>" + route + "</section></details>" +
      "<details class='final-disclosure final-protection'><summary><span><b>Open the last-minute traps</b><small>Optional · three checks before the paper</small></span><span class='disclosure-action'>Open</span></summary>" +
        "<aside class='final-traps'><p class='eyebrow'>Last-minute protection</p><h3>Do not donate these marks.</h3><ul>" +
        pack.traps.map(function (trap) { return "<li>" + escapeHtml(trap) + "</li>"; }).join("") + "</ul></aside></details>";
  }

  function renderExamPaperCard(courseId) {
    var spec = EXAM_PAPERS[courseId];
    var cycle = examCoverageCycle(courseId);
    var questions = spec.sections.reduce(function (n, s) { return n + s.count; }, 0);
    /* What this build can actually fill, computed from the pools rather than from a
       built paper: the shortfall does not depend on the seed, and a candidate is
       owed it before they commit two hours, not at the end. */
    var short = examShortfalls(courseId);
    var negative = spec.sections.some(function (s) { return s.negative; });
    var readiness = examReadiness(courseId);
    var readinessLine = readiness && readiness.total
      ? "<p class='exam-paper-readiness" + (readiness.allTaught ? " is-ready" : "") + "'>" +
        escapeHtml(examReadinessCopy(readiness)) +
        (readiness.allTaught ? "" : " <button type='button' class='link-button' data-teach-course='" +
          escapeHtml(courseId) + "'>Teach me that first</button>") + "</p>"
      : "";

    var weakConcepts = weakestLearnConcepts(courseId, 3);
    var weakEvidence = getCourse(courseId).concepts.filter(function (concept) {
      return attemptsFor(courseId, concept.id).length > 0;
    }).length;
    var weakHistory = examAttemptsFor(courseId, EXAM_WEAKEST_SET);
    var weakLast = weakHistory[weakHistory.length - 1];
    var weakCopy = weakEvidence
      ? "Starts with " + weakConcepts.map(function (concept) { return concept.name; }).join(" · ")
      : "No Learn answers yet · starts with untested concepts";
    var sets = "";
    if (courseId === "IBM" && window.T6_IBM_RELEASED_CASE) {
      var releasedHistory = examAttemptsFor(courseId, EXAM_RELEASED_SET);
      var releasedLast = releasedHistory[releasedHistory.length - 1];
      sets += "<button type='button' class='exam-set exam-set-released' data-exam-set='" +
        EXAM_RELEASED_SET + "' data-exam-course='IBM'>" +
        "<b>Released case</b>" +
        (releasedLast ? "<span>" + examPercent(releasedLast) + "% last</span>" : "<span>Exact released brief</span>") +
        "<small>10 lenses · one shared model · assumptions made explicit</small></button>";
    }
    sets += "<button type='button' class='exam-set exam-set-weak' data-exam-set='" +
      EXAM_WEAKEST_SET + "' data-exam-course='" + escapeHtml(courseId) + "'>" +
      "<b>Weakest links</b>" +
      (weakLast ? "<span>" + examPercent(weakLast) + "% last</span>" : "<span>Personalised diagnostic</span>") +
      "<small>" + escapeHtml(weakCopy) + "</small></button>";
    for (var i = 0; i < cycle.papers.length; i++) {
      var cyclePaper = cycle.papers[i];
      var history = examAttemptsFor(courseId, i);
      var best = history.reduce(function (top, row) {
        return !top || examPercent(row) > examPercent(top) ? row : top;
      }, null);
      var last = history[history.length - 1];
      sets += "<button type='button' class='exam-set' data-exam-set='" + i + "' data-exam-course='" +
        escapeHtml(courseId) + "'>" +
        "<b>" + examSetLabel(i) + "</b>" +
        (history.length
          ? "<span>" + examPercent(last) + "% last" + (history.length > 1 ? " · " + examPercent(best) + "% best" : "") + "</span>" +
            "<small>" + history.length + " sitting" + (history.length === 1 ? "" : "s") + "</small>"
          : "<span>Not sat</span><small>" + cyclePaper.newConceptIds.length + " new · " +
            cyclePaper.coverageAfter + "/" + cyclePaper.coverageTarget + " covered</small>") +
        "</button>";
    }

    return "<article class='exam-paper'>" +
      "<header><h2>" + escapeHtml(spec.title) + "</h2>" +
      "<p class='exam-paper-meta'>" + escapeHtml(spec.sat) + " · " + spec.total + " marks · " +
      questions + " questions · " +
      (spec.calculator === "scientific" ? "Scientific calculator" : spec.calculator === "basic" ? "Normal calculator" : "No calculator") +
      (negative ? " · Negative marking" : "") + "</p></header>" +
      "<ul class='exam-paper-sections'>" + spec.sections.map(function (section) {
        return "<li><b>" + escapeHtml(section.label) + "</b><span>" + section.count + " × " +
          section.marks + " mark" + (section.marks === 1 ? "" : "s") + "</span></li>";
      }).join("") + "</ul>" +
      /* The released-case interpretation and any shortfall stay visible before a
         candidate commits to the two-hour paper. */
      (spec.releaseNote ? "<p class='exam-paper-caveat'>" + escapeHtml(spec.releaseNote) + "</p>" : "") +
      (spec.caveat ? "<p class='exam-paper-caveat'>" + escapeHtml(spec.caveat) + "</p>" : "") +
      (short.length ? "<p class='exam-paper-short'>" + short.map(function (row) {
        return row.section.label + " has " + row.have + " of " + row.section.count + " questions in the bank";
      }).join("; ") + ". This mock scores out of what is actually here, not out of " + spec.total + ".</p>" : "") +
      /* Third thing said before the click, for the same reason as the other two: a
         candidate is owed it. The difference is that this one is about them rather
         than about the bank, and it is the only one Learn can close. */
      readinessLine +
      "<p class='exam-cycle-copy'>" + cycle.papers.length + "-set coverage cycle · all " +
        cycle.target.size + " paper-relevant concepts appear by the final set. " +
        (courseId === "IBM" ? "These numbered sets widen framework transfer; Released case stays fixed for like-for-like re-sits." : "Each set still keeps the real paper shape.") + "</p>" +
      "<div class='exam-sets'>" + sets + "</div></article>";
  }

  function renderExamRecord() {
    var all = [];
    Object.keys(profile.examAttempts || {}).forEach(function (courseId) {
      (profile.examAttempts[courseId] || []).forEach(function (row) {
        all.push({courseId: courseId, row: row});
      });
    });
    $("exam-record-block").hidden = all.length === 0;
    if (!all.length) return;
    var papers = all.length;
    var best = all.reduce(function (top, entry) {
      return !top || examPercent(entry.row) > examPercent(top.row) ? entry : top;
    }, null);
    var finished = all.filter(function (e) { return !e.row.autoSubmitted; }).length;
    var unfinished = all.filter(function (e) { return e.row.attempted < e.row.total; }).length;

    /* Improvement is only meaningful within one set — a better score on an easier
       draw is not progress. So it is measured on sets sat more than once. */
    var repeated = [];
    Object.keys(profile.examAttempts || {}).forEach(function (courseId) {
      var bySet = {};
      (profile.examAttempts[courseId] || []).forEach(function (row) {
        if (row.setIndex === EXAM_WEAKEST_SET) return;
        (bySet[row.setIndex] = bySet[row.setIndex] || []).push(row);
      });
      Object.keys(bySet).forEach(function (setIndex) {
        var rows = bySet[setIndex];
        if (rows.length > 1) repeated.push({first: rows[0], last: rows[rows.length - 1], courseId: courseId});
      });
    });
    var improved = repeated.filter(function (p) { return examPercent(p.last) > examPercent(p.first); }).length;

    $("exam-record").innerHTML = [
      {label: "Papers sat", value: String(papers), note: finished === papers ? "All submitted before time." : (papers - finished) + " ran out of clock."},
      {label: "Best", value: examPercent(best.row) + "%", note: (EXAM_PAPERS[best.courseId] ? EXAM_PAPERS[best.courseId].title.split(" ").slice(0, 2).join(" ") : best.courseId) + " · " + examSetLabel(best.row.setIndex)},
      {label: "Finished the paper", value: (papers - unfinished) + " of " + papers, note: unfinished ? "The rest had questions left blank at the end." : "Nothing left unattempted."},
      repeated.length
        ? {label: "Sets re-sat", value: improved + " of " + repeated.length, note: "improved on the second sitting of the same paper"}
        : {label: "Sets re-sat", value: "—", note: "Sitting one set twice is how you tell study from luck."}
    ].map(function (card) {
      return "<div class='insight-card'><small>" + escapeHtml(card.label) + "</small><b>" +
        escapeHtml(card.value) + "</b><span>" + escapeHtml(card.note) + "</span></div>";
    }).join("");

    $("exam-record-verdict").textContent = repeated.length
      ? (improved >= repeated.length / 2
        ? "You are scoring better on papers you have sat before. That is worth exactly as much as the studying you did between them — the second sitting of a set you remember is not a clean measurement."
        : "Re-sitting has not moved your score yet. A set you have already seen only measures what you did between the two sittings, so this is a question about the studying, not the paper.")
      : "Nothing here is a prediction of your real result. It is what these questions, under this clock, showed about what you can and cannot do yet.";
  }

  /* ---- P-type answer behaviour --------------------------------------------------
   *
   * Exactly two answers are correct, and at most two may be selected. The strategic
   * distinction is not negative marking: a clean single correct option earns 1,
   * while adding any wrong option turns the whole response into 0. This analysis
   * shows that trade-off without inventing expected-value advice for a rule the
   * actual paper does not use. */
  function pTypeAnalysis(items, scores) {
    var rows = [];
    items.forEach(function (item, index) {
      if ((item.question.type || "") !== "msq") return;
      var correct = item.question.answers || item.question.correct || [];
      var chosen = Array.isArray(item.response) ? item.response : [];
      var right = chosen.filter(function (choice) { return correct.indexOf(choice) >= 0; }).length;
      var wrong = chosen.length - right;
      rows.push({right:right, wrong:wrong, chosen:chosen.length, awarded:scores[index].awarded});
    });
    if (!rows.length) return null;
    var answered = rows.filter(function (row) { return row.chosen > 0; });
    return {
      totalItems: rows.length,
      questions: answered.length,
      exactPairs: answered.filter(function (row) { return row.right === 2 && row.wrong === 0; }).length,
      safeSingles: answered.filter(function (row) { return row.right === 1 && row.wrong === 0; }).length,
      zeroedByWrong: answered.filter(function (row) { return row.wrong > 0; }).length,
      wrongTicks: answered.reduce(function (sum, row) { return sum + row.wrong; }, 0),
      lostToWrongTicks: answered.reduce(function (sum, row) {
        return sum + (row.wrong ? Math.min(2, row.right) : 0);
      }, 0)
    };
  }

  function renderExamResult(automatic) {
    $("exam-runner").hidden = true;
    $("exam-result").hidden = false;
    var scores = exam.items.map(scoreExamItem);
    recordExamMisses(scores);
    var machine = scores.filter(function (s) { return s.machine; });
    var written = scores.filter(function (s) { return !s.machine; });
    var awarded = machine.reduce(function (n, s) { return n + s.awarded; }, 0);
    var possible = machine.reduce(function (n, s) { return n + s.possible; }, 0);
    var writtenMarks = written.reduce(function (n, s) { return n + s.possible; }, 0);

    $("exam-result-title").textContent = automatic ? "Time ran out — paper taken as it stood" : "Your mock result";
    $("exam-result-lede").textContent = writtenMarks
      ? "Machine-marked sections only. " + writtenMarks + " marks of written work are excluded from that score; Dungeon now reviews them after submission for rubric evidence, exact answer gaps, and a corrective plan."
      : "Every section on this paper is machine-marked.";
    $("exam-score").innerHTML = "<b>" + awarded + "</b><span>of " + possible + " machine-marked marks</span>" +
      (possible ? "<small>" + Math.round(awarded / possible * 100) + "%</small>" : "");

    $("exam-section-breakdown").innerHTML = exam.paper.spec.sections.map(function (section) {
      var indexes = exam.items.map(function (item, i) { return item.section === section.id ? i : -1; }).filter(function (i) { return i >= 0; });
      if (!indexes.length) return "";
      var sectionScores = indexes.map(function (i) { return scores[i]; });
      var isWritten = sectionScores.some(function (s) { return !s.machine; });
      var got = sectionScores.reduce(function (n, s) { return n + s.awarded; }, 0);
      var out = sectionScores.reduce(function (n, s) { return n + s.possible; }, 0);
      var attempted = indexes.filter(function (i) { return examHasResponse(exam.items[i]); }).length;
      return "<div class='exam-section-score'><b>" + escapeHtml(section.label) + "</b>" +
        "<span>" + (isWritten ? "Post-submit review · " + out + " marks excluded" : got + " / " + out) + "</span>" +
        "<small>" + attempted + " of " + indexes.length + " attempted</small></div>";
    }).join("");
    var analysis = analyseExamAttempt(exam);
    renderExamInsights(analysis);
    /* Recorded after the analysis so the stored row is the same numbers the learner
       was just shown, and before the comparison below reads the log. */
    recordExamAttempt(analysis, automatic);
    bufferExamTelemetry(analysis, automatic);
    renderExamProgress(analysis);

    renderExamRepairPlan();
    $("exam-review-list").innerHTML = "";
    startExamWrittenReview(analysis);
  }

  function renderExamRepairPlan() {
    /* The most useful thing on this screen is not the score. It is the list of things
       the paper just proved you cannot do yet, and a way straight into them. */
    var misses = examMissList(exam.courseId);
    var repair = $("exam-repair");
    repair.hidden = misses.length === 0;
    if (misses.length) {
      /* Say what the run actually contains. `startExamRepair` takes the worst eight, so
         a paper that exposed eleven concepts produces a run covering eight of them —
         and the first version of this sentence said all eleven were in it, which a
         trial caught by finding three that never appeared. The rest are genuinely
         prioritised for later runs, so that is what it now says. */
      var inRun = Math.min(misses.length, EXAM_REPAIR_SITTING);
      $("exam-repair-copy").textContent = "This paper exposed work to do on " + misses.length +
        " concept" + (misses.length === 1 ? "" : "s") + ". " +
        (misses.length > inRun
          ? "One sitting takes the " + inRun + " that cost you most, each taught before it is tested again. The other " +
            (misses.length - inRun) + " are queued for the sittings after it — short enough to finish is the point."
          : "Each one is taught before it is tested again.");
      $("exam-repair-list").innerHTML = misses.slice(0, 6).map(function (row) {
        return "<li><b>" + escapeHtml(row.concept.name) + "</b><small>" +
          (row.missed ? row.missed + " answered wrong" : "") +
          (row.missed && (row.skipped || row.written) ? " · " : "") +
          (row.skipped ? row.skipped + " left blank" : "") +
          (row.skipped && row.written ? " · " : "") +
          (row.written ? row.written + " written requirement" + (row.written === 1 ? "" : "s") + " missing or misunderstood" : "") + "</small></li>";
      }).join("");
    }
  }

  function clockWords(seconds) {
    var s = Math.max(0, Math.round(seconds));
    if (s < 60) return s + "s";
    var m = Math.floor(s / 60);
    return m + "m " + (s % 60) + "s";
  }

  function signed(n, suffix) {
    return (n > 0 ? "+" : n < 0 ? "−" : "±") + Math.abs(n) + (suffix || "");
  }

  /* Same set, sat again. This is the only comparison in the product that is close to
     like-for-like, and even then it is not clean: the second sitting is against a
     paper you have seen. The verdict says so rather than congratulating a learner for
     remembering answers. */
  function renderExamProgress(analysis) {
    var courseId = analysis.attempt.courseId;
    var block = $("exam-progress-block");
    /* The weakest-links paper is rebuilt from current Learn evidence. Two sittings
       can contain different questions, so the like-for-like comparison below would
       manufacture a progress claim. Its result still appears in the record. */
    if (analysis.attempt.setIndex === EXAM_WEAKEST_SET) {
      block.hidden = true;
      return;
    }
    var history = examAttemptsFor(courseId, analysis.attempt.setIndex || 0);
    block.hidden = history.length < 2;
    if (history.length < 2) return;
    var now = history[history.length - 1];
    var before = history[history.length - 2];
    var deltaScore = examPercent(now) - examPercent(before);
    var deltaTime = Math.round((now.spent - before.spent) / 60);
    var deltaBlanks = (now.total - now.attempted) - (before.total - before.attempted);
    var deltaBroken = now.breakdowns - before.breakdowns;

    $("exam-progress-body").innerHTML = [
      {label: "Score", value: signed(deltaScore, "%"), note: examPercent(before) + "% → " + examPercent(now) + "%"},
      {label: "Time on the paper", value: signed(deltaTime, "m"), note: clockWords(before.spent) + " → " + clockWords(now.spent)},
      {label: "Left blank", value: signed(deltaBlanks), note: (before.total - before.attempted) + " → " + (now.total - now.attempted) + " questions"},
      {label: "Concepts breaking down", value: signed(deltaBroken), note: before.breakdowns + " → " + now.breakdowns + " on this paper"}
    ].map(function (card) {
      return "<div class='insight-card'><small>" + escapeHtml(card.label) + "</small><b>" +
        escapeHtml(card.value) + "</b><span>" + escapeHtml(card.note) + "</span></div>";
    }).join("");

    $("exam-progress-verdict").textContent = deltaScore > 0
      ? "Better than last time on the same paper. Some of that is study and some of it is recognition — you have seen these questions before, so treat the gain as an upper bound rather than a measurement."
      : deltaScore < 0
        ? "Lower than last time on a paper you have already seen, which is the one result that cannot be explained by an unlucky draw. Look at the pacing above before concluding anything about what you know."
        : "The same score on the same paper. Whatever you did between the two sittings has not reached these questions yet.";
  }

  function renderExamInsights(analysis) {
    var spec = analysis.attempt.paper.spec;

    /* Pacing. The useful comparison is not "how long did you take" but "how does that
       sit against the clock you will actually have". */
    var perQuestion = analysis.total ? analysis.spent / analysis.total : 0;
    var budget = analysis.total ? (EXAM_MINUTES * 60) / analysis.total : 0;
    $("exam-pacing").innerHTML = [
      {label: "Attempted", value: analysis.attempted + " of " + analysis.total,
       note: analysis.attempted === analysis.total ? "Nothing left blank." : (analysis.total - analysis.attempted) + " never answered."},
      {label: "Time used", value: clockWords(analysis.spent),
       note: analysis.remaining > 0 ? clockWords(analysis.remaining) + " left on the clock." : "The clock ran out."},
      {label: "Per question", value: clockWords(perQuestion),
       note: perQuestion > budget * 1.15 ? "Above the " + clockWords(budget) + " this paper allows each." :
             perQuestion < budget * 0.5 ? "Well under the " + clockWords(budget) + " available. Time was not your constraint." :
             "Comfortably inside the " + clockWords(budget) + " available."},
      {label: "Longest question", value: analysis.slowest.length ? clockWords(analysis.slowest[0].item.seconds) : "—",
       note: analysis.slowest.length ? (analysis.slowest[0].score.awarded === analysis.slowest[0].score.possible ? "And you got it right — time well spent." : "And it was still wrong. That is the one to have left and come back to.") : ""}
    ].map(function (card) {
      return "<div class='insight-card'><small>" + escapeHtml(card.label) + "</small><b>" +
        escapeHtml(card.value) + "</b><span>" + escapeHtml(card.note) + "</span></div>";
    }).join("");

    /* Where knowledge breaks down. */
    var depth = analysis.breakdowns.slice(0, 6);
    $("exam-depth-block").hidden = depth.length === 0;
    $("exam-depth-list").innerHTML = depth.map(function (row) {
      return "<li class='depth-row rung-" + row.rung + "'>" +
        "<div class='depth-head'><b>" + escapeHtml(row.concept.name) + "</b>" +
        "<span class='depth-tag'>" + escapeHtml(row.copy.name) + "</span></div>" +
        "<p>" + escapeHtml(row.copy.fix) + "</p>" +
        "<small>" + row.right + " right · " + row.wrong + " wrong" +
        (row.skipped ? " · " + row.skipped + " blank" : "") + " · " + clockWords(row.seconds) + " spent</small>" +
        /* The route back, per concept. The examiner diagnoses and the learning system
           teaches; this is the door between them, one idea at a time. */
        "<button type='button' class='button compact secondary depth-route' data-repair-concept='" +
        escapeHtml(row.conceptId) + "'>Teach me this again</button></li>";
    }).join("");
    $all("#exam-depth-list [data-repair-concept]").forEach(function (button) {
      button.addEventListener("click", function () {
        var courseId = analysis.attempt.courseId;
        var conceptId = button.dataset.repairConcept;
        /* Leaving the examiner properly on the way out: the attempt is finished with,
           and a stale `exam` would leave the next paper's clock running against it. */
        window.clearInterval(examTicker);
        exam = null;
        crossProducts("learn", function () { startExamRepair(courseId, conceptId); });
      });
    });

    /* P-type behaviour, where the paper has it. */
    var pType = analysis.pType;
    $("exam-negative-block").hidden = !pType;
    if (pType) {
      $("exam-negative-body").innerHTML =
        "<div class='insight-grid'>" +
        "<div class='insight-card'><small>Exact pairs</small><b>" + pType.exactPairs + "</b><span>earned both marks</span></div>" +
        "<div class='insight-card'><small>Safe single answers</small><b>" + pType.safeSingles + "</b><span>earned one mark with no wrong option selected</span></div>" +
        "<div class='insight-card'><small>Zeroed by a wrong option</small><b>" + pType.zeroedByWrong + "</b><span>one wrong option makes the response worth zero</span></div>" +
        "</div>" +
        "<p class='insight-verdict'>" + escapeHtml(pType.zeroedByWrong
          ? "You selected a wrong option on " + pType.zeroedByWrong + " P-type response" + (pType.zeroedByWrong === 1 ? "" : "s") + ". The useful rule is simple: one option you can defend earns 1; do not add a second unless you can defend that too."
          : "No P-type response was zeroed by a wrong option. Keep using the distinction between a safe one-mark answer and a defensible two-mark pair.") + "</p>" +
        "<p class='insight-note'>There is no direct negative mark. The risk is losing the one mark a clean correct selection would have earned when a wrong option is added.</p>";
    }

    /* Answer behaviour. */
    var behaviour = [];
    if (analysis.guesses.length) {
      behaviour.push("<div class='insight-card'><small>Fast and wrong</small><b>" + analysis.guesses.length +
        "</b><span>answered in under " + clockWords(Math.max(6, Math.round(analysis.median / 3))) +
        " and never revisited — your own median is " + clockWords(analysis.median) + "</span></div>");
    }
    if (analysis.changedMind.length) {
      behaviour.push("<div class='insight-card'><small>Changed your mind</small><b>" + analysis.changedMind.length +
        "</b><span>" + (analysis.changedToWrong.length
          ? analysis.changedToWrong.length + " of them moved from a right answer to a wrong one"
          : "and none of them moved away from a right answer") + "</span></div>");
    }
    if (analysis.confidenceRecorded.length) {
      behaviour.push("<div class='insight-card'><small>Confidence recorded</small><b>" + analysis.confidenceRecorded.length +
        " of " + analysis.attempted + "</b><span>" + analysis.unsureCorrect.length + " correct while guessing/not sure · " +
        analysis.confidentWrong.length + " confident error" + (analysis.confidentWrong.length === 1 ? "" : "s") + "</span></div>");
    }
    $("exam-behaviour-block").hidden = behaviour.length === 0;
    if (behaviour.length) {
      $("exam-behaviour-body").innerHTML = "<div class='insight-grid'>" + behaviour.join("") + "</div>" +
        "<p class='insight-verdict'>" + escapeHtml(
          analysis.confidentWrong.length
            ? analysis.confidentWrong.length + " answer" + (analysis.confidentWrong.length === 1 ? " was" : "s were") + " wrong despite high confidence. Repair those before treating the score as secure knowledge."
          : analysis.unsureCorrect.length
            ? analysis.unsureCorrect.length + " correct answer" + (analysis.unsureCorrect.length === 1 ? " was" : "s were") + " marked guessing/not sure. The mark counts; a fresh question should confirm whether it was recall or luck."
          : analysis.changedToWrong.length > analysis.changedMind.length / 2 && analysis.changedMind.length > 2
            ? "Your first instinct was better than your second more often than not on this paper. That is worth knowing before you sit the real one."
            : analysis.guesses.length > analysis.total * 0.15
              ? "A sixth of your answers went down fast and stayed wrong. Those are the ones to mark for review rather than commit to."
              : "Nothing alarming in how you committed to answers."
        ) + "</p>";
    }

    /* Written answers: vocabulary is computable, the rubric is self-review. */
    var written = analysis.attempt.items.filter(function (item) {
      return (item.question.type || "") === "short-answer" && examHasResponse(item);
    });
    $("exam-written-block").hidden = written.length === 0;
    if (written.length) {
      $("exam-written-body").innerHTML = written.map(function (item) {
        var text = String(item.response || "");
        var words = text.trim().split(/\s+/).filter(Boolean).length;
        var terms = lessonVocabulary(item.question);
        var used = terms.filter(function (term) { return new RegExp("\\b" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?\\b", "i").test(text); });
        var rubric = item.question.rubric || [];
        /* Whether the learner was ever given this lecture.
         *
         * Measured on a real sitting: on the one lecture Learn had delivered, the
         * candidate scored 3 of 3 on its vocabulary; across the nine it had not, under
         * a third. The metric tracks DELIVERY almost perfectly and was reporting it as
         * the candidate's failing, then telling them "examiners look for the
         * framework's vocabulary" about words no screen had ever shown them.
         *
         * The measurement is good and stays. What changes is whose gap it is. */
        var untaught = lectureIdsFor(item.question).filter(function (lectureId) {
          return lessonFor(lectureId) && !lessonIsRead(lectureId);
        });
        return "<article class='written-review'>" +
          "<b>" + escapeHtml(item.question.node || item.question.stem || "Written answer") + "</b>" +
          "<div class='insight-grid'>" +
            "<div class='insight-card'><small>Length</small><b>" + words + "</b><span>words, " + clockWords(item.seconds) + " spent</span></div>" +
            (terms.length ? "<div class='insight-card" + (untaught.length ? " is-untaught" : "") + "'><small>Course vocabulary</small><b>" +
              used.length + " of " + terms.length + "</b><span>" +
              (untaught.length
                ? "Learn has not taught you this lecture yet, so this is our gap, not yours"
                : used.length ? escapeHtml(used.slice(0, 4).join(", ")) : "none of this lecture's terms appear") +
              "</span></div>" : "") +
            (rubric.length ? "<div class='insight-card'><small>Rubric points</small><b>" + rubric.length + "</b><span>to check your answer against below</span></div>" : "") +
          "</div>" +
          (rubric.length ? "<ul class='rubric-points'>" + rubric.map(function (point) {
            return "<li><b>" + escapeHtml(point.label) + "</b><span>" + escapeHtml(point.description) + "</span></li>";
          }).join("") + "</ul>" : "") +
          /* The scolding only applies to somebody who was given the words. Telling a
             candidate to use a framework's vocabulary when no screen has shown them
             that framework is the app blaming them for its own gap — and it sat
             directly under a rubric card saying the exact term is optional. */
          (terms.length && used.length < Math.ceil(terms.length / 2)
            ? (untaught.length
              ? "<p class='insight-verdict'>Learn has not delivered this lecture yet, so its vocabulary was never put in front of you. Teaching it is on us — the count above is a gap in your revision plan, not a mark against this answer.</p>"
              : "<p class='insight-verdict'>You answered in your own words rather than the course's. Examiners look for the framework's vocabulary, because it is the evidence you are using the framework and not describing it from outside.</p>")
            : "") +
          "</article>";
      }).join("");
    }
  }

  function validatedExamCoach(payload, answer) {
    if (!payload || payload.abstain || ["dungeon-local-practice-coach", "dungeon-hosted-practice-coach"].indexOf(payload.authority) < 0 ||
        !modelProseValid(payload.answerSummary || "") || !modelProseValid(payload.suggestedAnswer || "")) return null;
    var citations = Array.isArray(payload.sourceCitations) ? unique(payload.sourceCitations.map(String)) : [];
    if (!citations.length || typeof payload.answerSummary !== "string" || typeof payload.suggestedAnswer !== "string") return null;
    function items(values, needsQuote) {
      if (!Array.isArray(values) || values.length > 4) return null;
      var clean = values.map(function (item) {
        if (!item || typeof item.point !== "string" || !modelProseValid(item.point)) return null;
        var evidence = String(item.answerEvidence || "");
        var refs = Array.isArray(item.sourceCitations) ? unique(item.sourceCitations.map(String)) : [];
        if (!refs.length || refs.some(function (citation) { return citations.indexOf(citation) < 0; })) return null;
        if (needsQuote ? (evidence.trim().length < 3 || String(answer).indexOf(evidence) < 0) : evidence.length > 0) return null;
        return {point:item.point.slice(0, 800), answerEvidence:evidence.slice(0, 600), sourceCitations:refs};
      });
      return clean.some(function (item) { return !item; }) ? null : clean;
    }
    var strengths = items(payload.strengths, true);
    var gaps = items(payload.gaps, false);
    if (!strengths || !gaps || payload.suggestedAnswer.trim().length < 20 || !/[.!?]$/.test(payload.suggestedAnswer.trim())) return null;
    return {
      authority:payload.authority,
      model:String(payload.model || writtenAuthority.model || "Qwen").slice(0, 160),
      answerSummary:payload.answerSummary.slice(0, 1200),
      strengths:strengths,
      gaps:gaps,
      suggestedAnswer:payload.suggestedAnswer.slice(0, 2400),
      sourceCitations:citations
    };
  }

  async function examAuthorityRequest(operation, body) {
    var response = await fetch(WRITTEN_AUTHORITY_ENDPOINT + "/" + operation, {
      method:"POST", credentials:"same-origin", cache:"no-store",
      headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    var payload = {};
    try { payload = await response.json(); } catch (error) {}
    if (!response.ok) throw new Error(payload.message || payload.error || "Dungeon's written review was unavailable.");
    return payload;
  }

  function examWrittenReviewHtml(item, index, grade, coach, note) {
    var question = item.question;
    var criteria = grade ? grade.criteria.map(function (criterion) {
      var gaps = (criterion.gapCodes || []).map(function (code) { return writtenGapDefinition(question, code); }).filter(Boolean);
      return "<li class='local-grade-criterion " + (criterion.decision === "met" ? "met" : "missing") + "'><b>" +
        escapeHtml(criterion.decision === "met" ? "Evidenced · " : "Not yet · ") + escapeHtml(criterion.label) + "</b>" +
        "<span>" + escapeHtml(criterion.reason) + "</span>" +
        (gaps.length ? "<small class='written-gap-list'>" + gaps.map(function (gap) {
          return "<span>" + escapeHtml(gap.kind === "misunderstood" ? "Misunderstood · " : "Missed · ") + escapeHtml(gap.label) + "</span>";
        }).join("") + "</small>" : "") + "</li>";
    }).join("") : "";
    var coachHtml = coach ?
      "<p class='exam-answer-summary'>" + escapeHtml(coach.answerSummary) + "</p>" +
      (coach.strengths.length ? "<div class='exam-review-column'><b>What held up</b><ul>" + coach.strengths.map(function (point) {
        return "<li>" + escapeHtml(point.point) + (point.answerEvidence ? " <q>" + escapeHtml(point.answerEvidence) + "</q>" : "") + "</li>";
      }).join("") + "</ul></div>" : "") +
      (coach.gaps.length ? "<div class='exam-review-column'><b>How the answer could be stronger</b><ul>" + coach.gaps.map(function (point) {
        return "<li>" + escapeHtml(point.point) + "</li>";
      }).join("") + "</ul></div>" : "") +
      "<p class='bridge'><b>A stronger course-grounded answer:</b> " + escapeHtml(coach.suggestedAnswer) + "</p>" +
      "<small class='criterion-evidence'><span class='sr-only'>Course evidence: </span>" + courseEvidenceTagsHtml(coach.sourceCitations, exam.courseId, question.module) + "</small>"
      : "";
    return "<article class='written-review exam-forensic-review'><small>Written answer " + (index + 1) + " · " + escapeHtml(question.writtenMode === "case" ? "case transfer" : "short form") + "</small>" +
      "<h5>" + escapeHtml(question.node || "Written response") + "</h5>" +
      (grade ? "<p><b>Rubric requirements evidenced: " + grade.score + " of " + grade.maxScore + "</b> — not an official mark.</p><ul class='local-grade-criteria'>" + criteria + "</ul>" : "") +
      coachHtml + (note ? "<p class='insight-warning'>" + escapeHtml(note) + "</p>" : "") + "</article>";
  }

  async function startExamWrittenReview(analysis) {
    var written = analysis.attempt.items.filter(function (item) {
      return (item.question.type || "") === "short-answer" && examHasResponse(item);
    });
    var deep = $("exam-deep-review");
    var status = $("exam-deep-status");
    var body = $("exam-deep-body");
    if (!deep || !written.length) return;
    deep.hidden = false;
    body.innerHTML = "";
    var capable = writtenAuthority.available &&
      writtenAuthority.capabilities.indexOf("rubric-mark") >= 0 &&
      writtenAuthority.capabilities.indexOf("subject-coach") >= 0;
    if (!capable) {
      status.textContent = "Dungeon's deep written review is unavailable. The transparent rubrics above remain available; no answer was sent anywhere.";
      return;
    }
    var token = "exam-written-" + Date.now().toString(36);
    exam.writtenReviewToken = token;
    for (var index = 0; index < written.length; index += 1) {
      if (!exam || exam.writtenReviewToken !== token) return;
      var item = written[index];
      var question = item.question;
      var answer = String(item.response || "").trim();
      status.textContent = "Dungeon is reviewing written answer " + (index + 1) + " of " + written.length + ". The paper is already submitted; this cannot change the machine score.";
      if (answer.length < 20) {
        recordExamWrittenUnreviewable(analysis.attempt.courseId, question);
        body.insertAdjacentHTML("beforeend", examWrittenReviewHtml(item, index, null, null, "This response was too short for a reliable source-bound review. The concept has been added to Dungeon's corrective plan."));
        continue;
      }
      var grade = null;
      var coach = null;
      var note = "";
      try {
        var gradePayload = await examAuthorityRequest("grade", {courseId:analysis.attempt.courseId, questionId:question.id, answer:answer});
        grade = validatedWrittenGrade(gradePayload, question);
        if (grade) recordExamWrittenDiagnosis(analysis.attempt.courseId, question, grade);
        else note = "The rubric judgement abstained or failed Dungeon's source and schema checks, so it did not alter the corrective pool.";
      } catch (error) {
        note = "The rubric judgement was unavailable, so it did not alter the corrective pool.";
      }
      try {
        var coachPayload = await examAuthorityRequest("coach", {courseId:analysis.attempt.courseId, questionId:question.id, prompt:question.stem, caselet:question.caselet || "", answer:answer});
        coach = validatedExamCoach(coachPayload, answer);
        if (!coach) note += (note ? " " : "") + "The independent coaching pass abstained.";
      } catch (error) {
        note += (note ? " " : "") + "The independent coaching pass was unavailable.";
      }
      if (!exam || exam.writtenReviewToken !== token) return;
      body.insertAdjacentHTML("beforeend", examWrittenReviewHtml(item, index, grade, coach, note));
    }
    if (!exam || exam.writtenReviewToken !== token) return;
    renderExamRepairPlan();
    var gaps = writtenPracticeSummary(analysis.attempt.courseId).openGaps.length;
    status.textContent = "Deep review complete. " + gaps + " corrective answer gap" + (gaps === 1 ? " is" : "s are") + " now feeding Dungeon's lesson and fresh-case plan; mock success did not award mastery.";
  }

  /* The terms the lecture behind a question actually introduced. */
  function lessonVocabulary(question) {
    var lessons = window.T6_LESSONS || {};
    var ids = question.sourceIds || (question.source ? [question.source] : []);
    var terms = [];
    ids.forEach(function (id) {
      var lesson = lessons[id];
      if (!lesson || !lesson.glossary) return;
      lesson.glossary.forEach(function (entry) {
        if (entry && entry.term && terms.indexOf(entry.term) < 0) terms.push(entry.term);
      });
    });
    return terms;
  }

  function renderExamReview() {
    var scores = exam.items.map(scoreExamItem);
    $("exam-review-list").innerHTML = "<div class='exam-review'>" + exam.items.map(function (item, index) {
      var score = scores[index];
      var state = !examHasResponse(item) ? "skipped" : score.machine ? (score.awarded === score.possible ? "right" : score.awarded > 0 ? "part" : "wrong") : "written";
      return "<article class='exam-review-item " + state + "'>" +
        "<small>Section " + item.section + " · " + (score.machine ? score.awarded + " of " + score.possible : "self-review") + "</small>" +
        "<b>" + escapeHtml(item.question.stem || item.question.prompt || "") + "</b>" +
        (item.question.explanation ? "<p>" + escapeHtml(item.question.explanation) + "</p>" : "") +
        "</article>";
    }).join("") + "</div>";
    $("exam-review").hidden = true;
  }

  function leaveExaminer() {
    window.clearInterval(examTicker);
    exam = null;
    crossProducts("learn", function () { renderNotes(); showScreen("notes-screen"); });
  }

  /* The calculator the paper allows, and only that one. SPMS permits none, so the
     control is not rendered there at all rather than shown and disabled — offering a
     tool the real paper forbids would train a habit the exam then removes. */
  var CALC_KEYS = {
    basic: [["7","8","9","÷"],["4","5","6","×"],["1","2","3","−"],["0",".","=","+"],["C","⌫"]],
    scientific: [["√","x²","1/x","%"],["7","8","9","÷"],["4","5","6","×"],["1","2","3","−"],["0",".","=","+"],["C","⌫"]]
  };

  /* One calculator, mounted twice: the examiner hands you the keypad its paper allows,
     and the bag carries both so the same arithmetic is there while you practise. The
     buffer is per mount, so the two never share a running total. */
  function buildCalculator(mountId, kind) {
    var node = $(mountId);
    if (!node || !CALC_KEYS[kind]) return;
    node.innerHTML = "<output class='calc-display' aria-live='polite'>0</output>" +
      CALC_KEYS[kind].map(function (row) {
        return "<div class='calc-row'>" + row.map(function (key) {
          return "<button type='button' class='calc-key' data-key='" + escapeHtml(key) + "'>" + escapeHtml(key) + "</button>";
        }).join("") + "</div>";
      }).join("");
    var display = node.querySelector(".calc-display");
    var buffer = "";
    var show = function (value) { display.textContent = value === "" ? "0" : value; };
    $all("#" + mountId + " .calc-key").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.dataset.key;
        try {
          if (key === "C") { buffer = ""; }
          else if (key === "⌫") { buffer = buffer.slice(0, -1); }
          else if (key === "=") {
            /* Arithmetic only: the expression is rebuilt from the digits and operators
               this keypad can produce, so nothing else can reach the evaluator. */
            var safe = buffer.replace(/÷/g, "/").replace(/×/g, "*").replace(/−/g, "-");
            if (!/^[0-9+\-*/.() ]*$/.test(safe)) throw new Error("bad");
            buffer = String(Math.round(Function("return (" + safe + ")")() * 1e10) / 1e10);
          }
          else if (key === "√") { buffer = String(Math.sqrt(parseFloat(buffer) || 0)); }
          else if (key === "x²") { buffer = String(Math.pow(parseFloat(buffer) || 0, 2)); }
          else if (key === "1/x") { buffer = String(1 / (parseFloat(buffer) || 1)); }
          else if (key === "%") { buffer = String((parseFloat(buffer) || 0) / 100); }
          else buffer += key;
        } catch (error) { buffer = ""; display.textContent = "Error"; return; }
        show(buffer);
      });
    });
  }

  function renderCalculator() {
    var kind = exam.paper.spec.calculator;
    if (kind) buildCalculator("exam-calculator", kind);
    if ((exam.paper.spec.tables || []).indexOf("standard-normal") >= 0) buildNormalTable("exam-normal-table");
  }

  /* The standard normal table, because the paper supplies one.
   *
   * T6_EXAM_PATTERN.md is explicit that SCLM candidates are given standard normal
   * distribution tables. Dungeon had no such provision, and the consequence was not
   * cosmetic: every z-based question in the syllabus — safety stock, the reorder
   * point, the service level a policy achieves — is unanswerable without it, which is
   * why SCLM Section B sat at 4 of 6 numericals with the two missing ones both z-based.
   * A mock that withholds a tool the real paper hands out is testing a different exam.
   *
   * Phi is computed rather than stored as 310 literals, so there is one place to be
   * wrong and tests/normal-table.test.mjs checks it against the values every printed
   * table agrees on (0.5000 at 0, 0.8413 at 1, 0.9500 at 1.645, 0.9750 at 1.96).
   * Abramowitz & Stegun 26.2.17, whose error bound is 7.5e-8 — four orders below the
   * fourth decimal place a table prints. */
  function normalCdf(z) {
    var sign = z < 0 ? -1 : 1;
    var x = Math.abs(z) / Math.SQRT2;
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
  }

  /* One table, mounted twice — the examiner's paper hands it over, and a Learn
     numeric that needs it carries it inline, so the method is practised with the same
     instrument the exam supplies. */
  /* Split into two five-column halves rather than one eleven-column table.
   *
   * The conventional printed layout is z plus 0.00-0.09 in one row of columns, and it
   * is 584px wide at a readable type size. On a 375px phone that scrolls sideways
   * showing 325 of 584 — `ui-audit.js` reported it as `hiddenScroll` at 44% hidden,
   * and it was right: a candidate under a clock sees columns up to 0.05 with nothing
   * telling them 0.06 to 0.09 exist. Shrinking the type to fit would have crossed the
   * 12px readable floor. Two halves of six columns are ~190px each, so they sit side
   * by side on a desktop and stack on a phone, and nothing needs scrolling sideways at
   * either width. The lookup rule is unchanged. */
  function normalTableHalf(from, to) {
    var columns = [];
    for (var c = from; c <= to; c += 1) columns.push(c);
    var rows = "";
    for (var whole = 0; whole <= 30; whole += 1) {
      var base = whole / 10;
      rows += "<tr><th scope='row'>" + base.toFixed(1) + "</th>" + columns.map(function (hundredth) {
        return "<td>" + normalCdf(base + hundredth / 100).toFixed(4) + "</td>";
      }).join("") + "</tr>";
    }
    return "<table class='normal-table'><caption class='sr-only'>Standard normal cumulative distribution, " +
      "second decimal 0.0" + from + " to 0.0" + to + "</caption><thead><tr><th scope='col'>z</th>" +
      columns.map(function (hundredth) { return "<th scope='col'>0.0" + hundredth + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function buildNormalTable(mountId) {
    var node = $(mountId);
    if (!node || node.dataset.built === "1") return;
    node.innerHTML = "<p class='normal-table-note'>Cumulative probability &Phi;(z) — the area to the left of z. " +
      "Read the row for the first decimal and the column for the second.</p>" +
      "<div class='normal-table-split'>" + normalTableHalf(0, 4) + normalTableHalf(5, 9) + "</div>";
    node.dataset.built = "1";
  }

  function bindExaminer() {
    var open = $("open-exam");
    /* The examiner opens on its own home, not on one subject's brief. It is a
       separate product and the learner's current subject is the learning system's
       state, not the examiner's. */
    if (open) open.addEventListener("click", openExamHome);
    /* Back from a brief returns to the papers, not out of the product entirely. */
    $("exam-leave-brief").addEventListener("click", function () {
      window.clearInterval(examTicker);
      exam = null;
      openExamHome();
    });
    $("exam-begin").addEventListener("click", function () { beginExam(); renderCalculator(); });
    $("exam-prev").addEventListener("click", function () { goExamQuestion(exam.current - 1); });
    $("exam-next").addEventListener("click", function () { goExamQuestion(Math.min(exam.current + 1, exam.items.length - 1)); });
    $("exam-clear").addEventListener("click", function () {
      /* Clearing is a change of answer like any other, and it goes through the same
         recorder — otherwise "answered, then wiped it" reads afterwards as a question
         that was never touched. */
      recordExamResponse(exam.items[exam.current], null);
      exam.items[exam.current].confidence = null;
      renderExamQuestion();
    });
    $("exam-mark").addEventListener("click", function () {
      exam.items[exam.current].marked = !exam.items[exam.current].marked;
      if (exam.items[exam.current].marked && exam.current < exam.items.length - 1) goExamQuestion(exam.current + 1);
      else renderExamQuestion();
    });
    $("exam-submit").addEventListener("click", function () { submitExam(false); });
    $("cancel-exam-submit").addEventListener("click", function () { $("exam-submit-dialog").close(); });
    $("confirm-exam-submit").addEventListener("click", function () {
      $("exam-submit-dialog").close();
      submitExam(false, true);
    });
    $("cancel-exam-leave").addEventListener("click", function () {
      pendingExamExit = null;
      $("exam-leave-dialog").close();
    });
    $("confirm-exam-leave").addEventListener("click", function () {
      var leave = pendingExamExit;
      pendingExamExit = null;
      $("exam-leave-dialog").close();
      window.clearInterval(examTicker);
      exam = null;
      syncModeSwitchVisibility();
      if (leave) leave();
    });
    $("exam-result-home").addEventListener("click", leaveExaminer);
    $("exam-result-papers").addEventListener("click", function () {
      window.clearInterval(examTicker);
      exam = null;
      openExamHome();
    });
    $("exam-review").addEventListener("click", renderExamReview);
    /* The most-used crossing in the app: a paper has just told you what you lost, and
       this walks you out of the examiner and into the lesson. It should look like
       leaving the exam hall. */
    $("exam-repair-start").addEventListener("click", function () {
      var courseId = exam.courseId;
      window.clearInterval(examTicker);
      exam = null;
      crossProducts("learn", function () { startExamRepair(courseId); });
    });
    $("practice-exam-repair").addEventListener("click", function () { startExamRepair(profile.selectedCourse); });
    $("exam-calc-toggle").addEventListener("click", function () {
      var panel = $("exam-calculator");
      panel.hidden = !panel.hidden;
      $("exam-calc-toggle").setAttribute("aria-expanded", String(!panel.hidden));
    });
    $("exam-table-toggle").addEventListener("click", function () {
      var panel = $("exam-normal-table");
      panel.hidden = !panel.hidden;
      $("exam-table-toggle").setAttribute("aria-expanded", String(!panel.hidden));
    });
    /* Leaving mid-paper is a real risk of losing two hours, so it asks. */
    window.addEventListener("beforeunload", function (event) {
      if (exam && exam.started && !exam.submitted) { event.preventDefault(); event.returnValue = ""; }
    });
  }

  /* Entrance orchestration.
   *
   * Runs once, on first load. The dashboard re-renders on every answer and every
   * subject switch; replaying the cascade each time would charge a 400ms flourish
   * hundreds of times a session, which the motion language explicitly forbids for
   * anything seen often.
   *
   * The groups below are ordered the way the page is read — the four questions, top
   * to bottom. Items inside a group stagger against each other; groups do not
   * stagger against each other, because they are screens apart and each one waits
   * until it is actually scrolled to. */
  var REVEAL_GROUPS = [
    ".home-block > .block-heading",
    ".subject-rail",
    ".focus-panel",
    ".route-list > .route",
    ".set-block > *",
    ".evidence-pair > *",
    ".overall-stats > .stat",
    ".concept-shelf-list > .shelf-group",
    ".home-block > .disclosure"
  ];
  var STAGGER_MS = 55;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Only what the learner can already see is animated.
   *
   * The first build of this revealed on scroll, which was wrong twice over. It left
   * everything below the fold sitting at opacity 0 waiting for an intersection, so a
   * fast scroll arrived at blank space; and any safety net generous enough to rescue
   * a stuck node also fired before the learner had scrolled to it, which cancelled
   * the effect it was protecting. Scroll reveal also fails the frequency-of-use rule
   * badly here — this is a dashboard opened many times a day, and animating a block
   * every time it is scrolled past turns a flourish into a toll.
   *
   * So: one cascade, on load, over the elements already in view. Everything further
   * down is never hidden and simply exists when the learner reaches it. There is
   * nothing to rescue, because nothing else was ever put at risk. */
  function setupReveals() {
    if (prefersReducedMotion()) return;
    var fold = window.innerHeight * 1.1;
    var order = [];
    REVEAL_GROUPS.forEach(function (selector) {
      $all(selector).forEach(function (node) {
        var top = node.getBoundingClientRect().top;
        if (top >= 0 && top < fold) order.push({node: node, top: top});
      });
    });
    /* Cascaded down the page rather than through the selector list, so the motion
       follows the reading order a learner's eye is already taking. */
    order.sort(function (a, b) { return a.top - b.top; });
    order.forEach(function (item, index) {
      var node = item.node;
      node.classList.add("reveal-pending");
      /* Capped: past about half a second the cascade stops reading as one motion and
         starts reading as the page being slow. */
      var delay = Math.min(index * STAGGER_MS, 440);
      window.setTimeout(function () {
        node.classList.remove("reveal-pending");
        node.classList.add("reveal-in");
        /* Dropped once played, so a later re-render of the same node does not
           inherit an animation that has already been paid for. */
        window.setTimeout(function () { node.classList.remove("reveal-in"); }, 600);
      }, delay);
    });
  }

  /* On-demand explanations.
   *
   * These were the browser's own `title` tooltip, which is why the "i" markers read
   * as dead: `title` waits about a second, never fires on keyboard focus, and never
   * fires on touch. One shared bubble replaces all seven of them — the two "i"
   * markers, the negative-marking flag, and the four exam-slot marks.
   *
   * The bubble is aria-hidden on purpose. Every trigger already carries this text,
   * either as its own aria-label or (for the marks inside a subject card) on the
   * card button's label, so announcing the bubble as well would read it twice. */
  var tipNode = null;
  var tipTimer = null;
  var tipTrigger = null;

  function tipTarget(node) {
    return node && node.closest ? node.closest("[data-tip]") : null;
  }

  function hideTip() {
    window.clearTimeout(tipTimer);
    if (tipTrigger) { tipTrigger.removeAttribute("data-tip-open"); tipTrigger = null; }
    if (tipNode) tipNode.removeAttribute("data-open");
  }

  function placeTip(trigger) {
    if (!tipNode) {
      tipNode = document.createElement("div");
      tipNode.className = "tip";
      tipNode.setAttribute("aria-hidden", "true");
      document.body.appendChild(tipNode);
    }
    tipNode.textContent = trigger.getAttribute("data-tip");
    /* Measure at the origin before placing: a bubble still sitting at its last
       position can be clamped by the wrong edge and report the wrong height. */
    tipNode.style.left = "0px";
    tipNode.style.top = "0px";
    var rect = trigger.getBoundingClientRect();
    var box = tipNode.getBoundingClientRect();
    var margin = 12;
    var gap = 9;
    /* Above by default, below when there is no room above. */
    var side = rect.top - box.height - gap >= margin ? "top" : "bottom";
    var top = side === "top" ? rect.top - box.height - gap : rect.bottom + gap;
    /* Clamped to the viewport. Both "i" markers sit near the right edge — the sort
       hint about 100px in, the goal legend about 145px — so a centred bubble would
       hang off the page at either one. */
    var wanted = rect.left + rect.width / 2 - box.width / 2;
    var left = Math.max(margin, Math.min(wanted, window.innerWidth - box.width - margin));
    tipNode.style.left = Math.round(left) + "px";
    tipNode.style.top = Math.round(top) + "px";
    tipNode.setAttribute("data-side", side);
    /* The arrow follows the trigger rather than the bubble, so a clamped bubble
       still points at the thing it is explaining. */
    var arrow = rect.left + rect.width / 2 - left;
    tipNode.style.setProperty("--tip-arrow", Math.round(Math.max(13, Math.min(arrow, box.width - 13))) + "px");
    tipNode.setAttribute("data-open", "");
    trigger.setAttribute("data-tip-open", "");
    tipTrigger = trigger;
  }

  function showTip(trigger, delay) {
    window.clearTimeout(tipTimer);
    if (!trigger.getAttribute("data-tip")) return;
    if (!delay) { placeTip(trigger); return; }
    tipTimer = window.setTimeout(function () { placeTip(trigger); }, delay);
  }

  function bindTips() {
    /* Delegated: most triggers are rendered after this runs, and the subject cards
       are rebuilt on every sort change and every answer. */
    document.addEventListener("pointerover", function (event) {
      if (event.pointerType === "touch") return;
      var trigger = tipTarget(event.target);
      if (trigger === tipTrigger) return;
      if (!trigger) { hideTip(); return; }
      /* 120ms — the "acknowledge" step in the motion language. Long enough not to
         flicker while the pointer crosses the row, short enough to feel answered. */
      showTip(trigger, 120);
    });
    /* Focus opens with no delay: a keyboard user has already committed to the
       element, and waiting there reads as the control being dead. */
    document.addEventListener("focusin", function (event) {
      var trigger = tipTarget(event.target);
      if (trigger) showTip(trigger, 0); else hideTip();
    });
    document.addEventListener("focusout", function (event) {
      if (tipTrigger && tipTrigger === tipTarget(event.target)) hideTip();
    });
    /* Touch: tap opens, tap elsewhere closes. `title` offered nothing here at all,
       which meant every explanation in the app was unreachable on a phone. */
    document.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "touch") return;
      var trigger = tipTarget(event.target);
      if (!trigger || trigger === tipTrigger) { hideTip(); return; }
      showTip(trigger, 0);
    }, true);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && tipTrigger) hideTip();
    });
    /* A fixed bubble does not travel with the page or survive a reflow. */
    window.addEventListener("scroll", hideTip, true);
    window.addEventListener("resize", hideTip);
  }

  /* The appearance control. Three states rather than two, so "follow my device"
     survives being pressed once. The sr-only span is the button's accessible name
     and reports the state; the tooltip says what pressing it will do next. */
  var THEME_COPY = {
    system: {state: "Appearance: following your device", tip: "Following your device's light or dark setting. Press to stay on light."},
    light: {state: "Appearance: light", tip: "Held on light. Press to stay on dark."},
    dark: {state: "Appearance: dark", tip: "Held on dark. Press to go back to following your device."}
  };

  function renderThemeToggle() {
    var button = $("theme-toggle");
    if (!button || !window.T6Theme) return;
    var copy = THEME_COPY[T6Theme.get()] || THEME_COPY.system;
    button.setAttribute("data-theme-mode", T6Theme.get());
    button.setAttribute("data-tip", copy.tip);
    var label = $("theme-toggle-state");
    if (label) label.textContent = copy.state;
  }

  function bindEvents() {
    bindResumeBar();
    bindTips();
    bindExaminer();
    bindBag();
    bindModeSwitch();
    renderThemeToggle();
    $("exam-mode-switch").addEventListener("click", function (event) {
      var button = event.target.closest("[data-exam-mode]");
      if (!button) return;
      setExamHomeMode(button.dataset.examMode);
    });
    $("exam-mode-switch").addEventListener("keydown", function (event) {
      if (["ArrowLeft", "ArrowRight"].indexOf(event.key) < 0) return;
      var tabs = $all("#exam-mode-switch [data-exam-mode]");
      var current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      var next = (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      setExamHomeMode(tabs[next].dataset.examMode);
    });
    $("exam-time-switch").addEventListener("click", function (event) {
      var button = event.target.closest("[data-exam-time-mode]");
      if (button) setExamTimeMode(button.dataset.examTimeMode);
    });
    $("exam-case-priority-start").addEventListener("click", function () { openExaminer("IBM", EXAM_RELEASED_SET); });
    $("exam-case-priority-study").addEventListener("click", function () {
      openNotes({courseId:"IBM", module:1, anchor:"notes-released-case"});
    });
    $("brgsa-pattern-start").addEventListener("click", function () { startPaperPatternRevision("BRGSA"); });
    $("final-sprint").addEventListener("click", function (event) {
      var courseButton = event.target.closest("[data-final-course]");
      if (courseButton) {
        finalSprintCourse = courseButton.dataset.finalCourse;
        profile.selectedCourse = finalSprintCourse;
        saveProfile();
        return renderFinalSprint();
      }
      var startButton = event.target.closest("[data-final-start]");
      if (startButton) startFinalSprint(startButton.dataset.finalStart);
    });
    if (window.T6Theme) {
      $("theme-toggle").addEventListener("click", function () {
        T6Theme.set(T6Theme.next());
        hideTip();
      });
      /* Subscribed rather than called after the click, so the button cannot drift out
         of step with the theme it reports — the icon and the label follow whoever
         changed it, including the device switching over at sunset. Canvas is repainted
         from the same signal because it cannot inherit a CSS custom property. */
      T6Theme.onChange(function () {
        renderThemeToggle();
        repaintThemedSurfaces();
      });
    }
    $("course-grid").addEventListener("scroll", updateRailScrollCue, {passive: true});
    window.addEventListener("resize", updateRailScrollCue);
    $("brand-home").addEventListener("click", goDashboard);
    $("start-recommended").addEventListener("click", executeRecommendation);
    $("practice-priority").addEventListener("click", function () { startPriorityPractice(profile.selectedCourse); });
    $("written-practice-route").addEventListener("click", function () { startWrittenPractice(profile.selectedCourse); });
    $("notes-subjects").addEventListener("click", function (event) {
      var button = event.target.closest("[data-notes-course]");
      if (!button) return;
      notesState.courseId = button.dataset.notesCourse;
      profile.selectedCourse = notesState.courseId;
      notesState.module = 1;
      notesState.query = "";
      $("notes-search").value = "";
      $("notes-subjects").classList.remove("show-secondary");
      $("notes-more-subjects").setAttribute("aria-expanded", "false");
      saveProfile();
      renderNotes();
      $("notes-reader").focus({preventScroll:true});
      resetNotesScroll();
    });
    $("notes-more-subjects").addEventListener("click", function () {
      var subjects = $("notes-subjects");
      var open = !subjects.classList.contains("show-secondary");
      subjects.classList.toggle("show-secondary", open);
      $("notes-more-subjects").setAttribute("aria-expanded", String(open));
    });
    $("notes-module-nav").addEventListener("click", function (event) {
      var button = event.target.closest("[data-notes-module]");
      if (!button) return;
      notesState.module = Number(button.dataset.notesModule) || 1;
      notesState.query = "";
      $("notes-search").value = "";
      $("notes-toc").classList.remove("is-open");
      $("notes-toc-toggle").setAttribute("aria-expanded", "false");
      renderNotes();
      $("notes-reader").focus({preventScroll:true});
      resetNotesScroll();
    });
    $("notes-toc-toggle").addEventListener("click", function () {
      var toc = $("notes-toc");
      var open = !toc.classList.contains("is-open");
      toc.classList.toggle("is-open", open);
      $("notes-toc-toggle").setAttribute("aria-expanded", String(open));
    });
    $("notes-toc").addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      $("notes-toc").classList.remove("is-open");
      $("notes-toc-toggle").setAttribute("aria-expanded", "false");
      $("notes-toc-toggle").focus();
    });
    $("notes-reader").addEventListener("click", function (event) {
      var inPageLink = event.target.closest(".notes-tool-link[href^='#terms-'], .notes-case-jump a[href^='#']");
      if (inPageLink) {
        event.preventDefault();
        scrollToNotesTarget(document.getElementById(inPageLink.getAttribute("href").slice(1)));
        return;
      }
      var lectureDownload = event.target.closest("[data-print-lecture]");
      if (lectureDownload) {
        printNotesLecture(lectureDownload.dataset.printLecture);
        return;
      }
      if (event.target.closest("[data-print-module]")) {
        printNotesModule();
        return;
      }
      var chamberButton = event.target.closest("[data-start-chamber]");
      if (chamberButton) {
        startModuleChamber(chamberButton.dataset.startChamber, Number(chamberButton.dataset.chamberModule));
        return;
      }
      var repairButton = event.target.closest("[data-repair-concept]");
      if (repairButton) {
        startConceptPractice(notesCourseId(), repairButton.dataset.repairConcept);
        return;
      }
      var releasedButton = event.target.closest("[data-open-released-case]");
      if (releasedButton) {
        openExaminer(releasedButton.dataset.openReleasedCase, EXAM_RELEASED_SET);
        return;
      }
      var moduleButton = event.target.closest("[data-notes-module]");
      if (moduleButton) {
        notesState.module = Number(moduleButton.dataset.notesModule) || 1;
        renderNotes();
        $("notes-reader").focus({preventScroll:true});
        resetNotesScroll();
        return;
      }
      var result = event.target.closest("[data-notes-result]");
      if (!result) return;
      notesState.module = Number(result.dataset.notesResultModule) || 1;
      notesState.query = "";
      $("notes-search").value = "";
      renderNotes();
      var target = $("notes-" + result.dataset.notesResult);
      if (target) window.requestAnimationFrame(function () { target.scrollIntoView({block:"start", behavior:"smooth"}); });
    });
    $("notes-search").addEventListener("input", function (event) {
      notesState.query = event.target.value;
      renderNotesReader();
    });
    $("notes-print").addEventListener("click", printNotesModule);
    $("leave-practice").addEventListener("click", leavePractice);
    $("commit-answer").addEventListener("click", commitAnswer);
    $("next-question").addEventListener("click", nextQuestion);
    $("results-home").addEventListener("click", leaveResults);
    $("reset-progress").addEventListener("click", function () { $("reset-dialog").showModal(); });
    $("cancel-reset").addEventListener("click", function () { $("reset-dialog").close(); });
    $("confirm-reset").addEventListener("click", confirmReset);
    $("sign-out").addEventListener("click", signOut);
    $("community-link").addEventListener("click", markCommunityOpened);
    $("community-joined").addEventListener("click", acknowledgeCommunity);
    $("skip-confidence").addEventListener("click", function () { setConfidence("skipped"); renderConfidenceControl(); });
    $all("input[name='confidence']").forEach(function (input) {
      input.addEventListener("change", function () { if (input.checked) { setConfidence(input.value); renderConfidenceControl(); } });
    });
    document.addEventListener("keydown", function (event) {
      if (!session || !$("practice-screen").classList.contains("active")) return;
      if (event.target && /^(SELECT|INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
      if (event.target && event.target.tagName === "BUTTON" && (!event.target.classList.contains("option") || event.key === "Enter")) return;
      var question = currentQuestion();
      // A primer takes typed prose, so arrow keys belong to the caret, not to options.
      var isMcq = !question.type || question.type === "mcq";
      if (!session.answered && isMcq && /^(ArrowRight|ArrowDown|ArrowLeft|ArrowUp)$/.test(event.key)) {
        event.preventDefault();
        var direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        var optionCount = question.options.length;
        var currentIndex = selected === null ? (direction > 0 ? -1 : 0) : selected;
        var arrowIndex = (currentIndex + direction + optionCount) % optionCount;
        selectOption(arrowIndex);
        $all(".option")[arrowIndex].focus();
      } else if (!session.answered && isMcq && /^[1-4]$/.test(event.key)) {
        var index = Number(event.key) - 1;
        if (index < question.options.length) selectOption(index);
      } else if (event.key === "Enter" && !session.answered && hasCompleteResponse(question) && confidenceReady()) {
        event.preventDefault();
        commitAnswer();
      } else if (event.key === "Enter" && session.answered) {
        event.preventDefault();
        nextQuestion();
      }
    });
    /* Recharts' ResponsiveContainer owns chart resizing. No window listener is
       needed, so dragging a viewport does not recompute course evidence per pixel. */
  }

  function unique(values) { return values.filter(function (value, index) { return values.indexOf(value) === index; }); }
  /* A case is read, not glanced at, and a 500-character single block is where a
   * reader loses their place. Authored cases separate their beats with a blank
   * line — setting up the situation, then what happens, then what it costs — and
   * this turns each beat into its own paragraph. A case written as one block still
   * renders as one paragraph, so older content is unaffected. Escaped, because the
   * caller assigns the result as HTML. */
  function caseParagraphs(text) {
    return String(text || "")
      .split(/\n{2,}/)
      .map(function (part) { return part.trim(); })
      .filter(Boolean)
      .map(function (part) { return "<p>" + escapeHtml(part) + "</p>"; })
      .join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[character];
    });
  }

  async function init() {
    if (COURSE_IDS.some(function (courseId) { return !COURSES[courseId] || !COURSES[courseId].questions || !COURSES[courseId].concepts; })) {
      document.body.innerHTML = "<main><h1>Term 6 content failed to load.</h1><p>Please restart the local server and refresh.</p></main>";
      return;
    }
    var scenario = new URLSearchParams(window.location.search).get("scenario");
    document.body.setAttribute("aria-busy", "true");
    profile = BACKEND_ACTIVE && !scenario ? await loadBackendProfile() : loadProfile();
    bindEvents();
    /* Both runtimes expose the same authority contract. On localhost this reaches
       the private Windows–Mac path; under /dungeon it reaches the authenticated,
       activation-gated Workers AI route. Neither can silently substitute a model. */
    await probeWrittenAuthority();
    if (scenario) applyScenario(scenario);
    else if (profile.active) {
      resumeActive();
    } else openNotes({courseId:profile.selectedCourse});
    document.body.removeAttribute("aria-busy");
    startEntrance();
  }

  /* Called after the first render, never again. Everything it does is optional
     decoration on a page that is already complete and readable, which is why it is
     the last thing to happen and why nothing above it waits on it. */
  function startEntrance() {
    if ($("dashboard-screen").classList.contains("active")) {
      setupReveals();
    }
  }

  init().catch(function (error) {
    /* A startup failure still yields a usable local dashboard, but keeping the
       original exception in developer tools is essential for scenario and Mac
       smoke-test diagnosis. No learner answer is included in this error path. */
    if (window.console && typeof window.console.error === "function") console.error("Dungeon startup failed", error);
    document.body.setAttribute("data-startup-error", String(error && (error.stack || error.message) || error));
    document.body.removeAttribute("aria-busy");
    profile = loadProfile();
    bindEvents();
    renderNotes();
    showScreen("notes-screen");
    setSyncStatus("Saved on this device");
    startEntrance();
  });
})();
