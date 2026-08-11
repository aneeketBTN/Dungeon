window.T6_COURSE = {
  id: "BRGSA",
  title: "Business Research, Growth Strategies and Analytics",
  shortTitle: "BRGSA",
  chain: ["Validate", "Experiment", "Read evidence", "Acquire", "Activate", "Retain", "Monetize", "Operate"],
  runs: [
    {id: 1, module: 1, title: "Prove demand before you build", subtitle: "Lean validation · commitments · bias", minutes: 7,
      questionIds: ["val_definition", "smoke_signal", "landing_trust", "commit_strength", "survey_bias"]},
    {id: 2, module: 2, title: "Run experiments that do not lie", subtitle: "Nulls · sample logic · error costs", minutes: 8,
      questionIds: ["null_logic", "sample_logic", "type_one", "type_two", "proxy_metric"]},
    {id: 3, module: 3, title: "Read whether growth is real", subtitle: "Cohorts · retention · CAC · LTV", minutes: 8,
      questionIds: ["cohort_truth", "retention_shape", "cac_scope", "ltv_early", "scale_iterate_pivot"]},
    {id: 4, module: 4, title: "Find the constraint; win the first customers", subtitle: "Stage fit · founder traction · acquisition", minutes: 8,
      questionIds: ["growth_discipline", "stage_fit", "founder_led", "primary_constraint", "first_customers"]},
    {id: 5, module: 5, title: "Turn acquisition into activation", subtitle: "Channel fit · loops · aha · activation", minutes: 8,
      questionIds: ["channel_fit", "outbound_system", "organic_loop", "aha_event", "activation_metric"]},
    {id: 6, module: 6, title: "Make value recur", subtitle: "Habits · lifecycle · retention · churn", minutes: 8,
      questionIds: ["habit_loop", "lifecycle_fit", "retention_unit", "referral_network", "churn_diagnostic"]},
    {id: 7, module: 7, title: "Monetize without leaking the base", subtitle: "Pricing · NRR · pipeline · payback", minutes: 9,
      questionIds: ["pricing_structure", "nrr_meaning", "pipeline_stage", "handoff_sla", "payback_period"]},
    {id: 8, module: 8, title: "Operate the growth system", subtitle: "ICE · backlog · rules · allocation", minutes: 8,
      questionIds: ["ice_priority", "backlog_system", "decision_rule", "vanity_metric", "allocation_rule"]},
    {id: 9, module: 9, title: "Connect the whole subject", subtitle: "Eight cross-module case decisions", minutes: 12,
      questionIds: ["case_validate", "case_experiment", "case_cohort", "case_constraint", "case_activation", "case_network", "case_nrr", "case_operate"]},
    {id: 10, module: 10, title: "Full practice mock", subtitle: "Twelve mixed MCQs and caselets", minutes: 18, mock: true,
      questionIds: ["mock_commit", "mock_type_one", "mock_cohort", "mock_growth", "mock_channel", "mock_friction", "mock_churn", "mock_payback", "mock_motion", "mock_rule", "mock_full_case", "mock_chain_order"]}
  ],
  questions: {
    val_definition: {
      id: "val_definition", module: 1, source: "BRGSA-M01-L01", node: "Lean validation", pattern: "Concept MCQ",
      stem: "What makes lean validation different from simply doing more market research?",
      options: ["It estimates the total market before speaking to buyers", "It turns the demand assumption into a test with a decision threshold before a full build", "It replaces customer evidence with founder judgment", "It begins only after the product is complete"], answer: 1,
      explanation: "Lean validation tests whether demand is actually present before costly building or campaigning. The test and its decision threshold matter more than collecting agreeable opinions.",
      link: "Validation converts uncertainty into a pre-declared test before resources are committed.", repairId: "case_validate"
    },
    smoke_signal: {
      id: "smoke_signal", module: 1, source: "BRGSA-M01-L02", node: "Smoke tests", pattern: "Application MCQ",
      stem: "A startup publishes a credible landing page with a real ‘Join waitlist’ action before the product exists. What is it primarily testing?",
      options: ["Whether the engineering plan is feasible", "Whether exposed prospects take a behavioural step toward the offer", "Whether respondents say the idea sounds good", "Whether the brand has a complete marketing funnel"], answer: 1,
      explanation: "A smoke test is a fake door: the product is not yet behind it, but the measured click or signup is a behavioural demand signal.",
      link: "A smoke test observes behaviour at a fake door; it does not pretend the product already exists.", repairId: "mock_commit"
    },
    landing_trust: {
      id: "landing_trust", module: 1, source: "BRGSA-M01-L03", node: "Validation landing pages", pattern: "Caselet",
      caselet: "Two landing pages report the same 8% signup rate. Page A was shown to the stated ICP through targeted traffic. Page B was sent to friends, employees, and a prize-seeking giveaway list.",
      stem: "Which conclusion is defensible?",
      options: ["Both pages prove equal demand because the rate is identical", "Page B is stronger because its audience is larger", "Page A carries the more trustworthy demand signal because the traffic matches the intended market", "Neither page can ever be used for validation"], answer: 2,
      explanation: "A conversion rate is only as trustworthy as the traffic that produced it. Incentivised or socially connected visitors create a contaminated signal.",
      link: "Signal quality depends on who had the chance to act, not only on the displayed percentage.", repairId: "case_validate"
    },
    commit_strength: {
      id: "commit_strength", module: 1, source: "BRGSA-M01-L04", node: "Commitment strength", pattern: "Decision MCQ",
      stem: "Which response is the strongest evidence that a customer is likely to buy?",
      options: ["‘This is a great idea’ in a survey", "A like on the announcement", "A refundable pre-order placed under clear terms", "Opening the product email"], answer: 2,
      explanation: "The commitment spectrum gets stronger as the prospect gives up something real—money, time, reputation, or access. A pre-order dominates praise, likes, and opens.",
      link: "Stronger evidence asks the prospect to incur a real cost or commitment.", repairId: "mock_commit"
    },
    survey_bias: {
      id: "survey_bias", module: 1, source: "BRGSA-M01-L05", node: "Survey bias", pattern: "Application MCQ",
      stem: "Why is ‘Would you buy this?’ a weak primary validation question?",
      options: ["People cannot understand products before launch", "Stated intention under social pressure predicts actual purchase behaviour poorly", "Surveys always require more than 1,000 responses", "Only competitors may conduct surveys"], answer: 1,
      explanation: "Respondents may be sincere and still mispredict their future behaviour. Surveys are useful tools, but hypothetical willingness is weak purchase evidence.",
      link: "Use surveys to learn language and problems; use behaviour or commitment to validate demand.", repairId: "case_validate"
    },

    null_logic: {
      id: "null_logic", module: 2, source: "BRGSA-M02-L01", node: "Null hypothesis", pattern: "Concept MCQ",
      stem: "For an A/B landing-page test, which plain-language null hypothesis is best formed?",
      options: ["Variant B will definitely win", "There is no meaningful difference between A and B unless the evidence is strong enough to reject that position", "Both variants must receive identical conversions", "The team prefers Variant A"], answer: 1,
      explanation: "The null is the default no-effect or no-difference position. Evidence must earn the right to reject it.",
      link: "Start from no meaningful effect; let adequate evidence move the decision.", repairId: "case_experiment"
    },
    sample_logic: {
      id: "sample_logic", module: 2, source: "BRGSA-M02-L02", node: "Sample-size logic", pattern: "Caselet",
      caselet: "Variant B leads after 18 visitors per arm. The pre-set sample target is 1,000 per arm.",
      stem: "What is the sound next action?",
      options: ["Stop and ship B before the lead disappears", "Continue to the planned sample bound unless a pre-registered stopping rule applies", "Delete Variant A from the report", "Double-count repeat visitors to finish sooner"], answer: 1,
      explanation: "A tiny early lead is noisy. Stopping because a preferred result appeared inflates false positives and breaks the original test logic.",
      link: "Sample bounds are declared before the result so excitement cannot rewrite the test.", repairId: "case_experiment"
    },
    type_one: {
      id: "type_one", module: 2, source: "BRGSA-M02-L03", node: "Type I error", pattern: "Concept MCQ",
      stem: "A test declares a new onboarding flow better when there is actually no real improvement. Which error occurred?",
      options: ["Type I: false positive", "Type II: false negative", "Sampling frame only", "Cohort decay"], answer: 0,
      explanation: "A Type I error rejects a true null: the test reports an effect that is not really there.",
      link: "Type I means acting on a false win; Type II means missing a real win.", repairId: "mock_type_one"
    },
    type_two: {
      id: "type_two", module: 2, source: "BRGSA-M02-L03", node: "Type II error", pattern: "Application MCQ",
      stem: "A useful pricing change genuinely improves conversion, but an underpowered test concludes that nothing changed. Which error is this?",
      options: ["Type I error", "Type II error", "Survivorship bias only", "No error because the result was not significant"], answer: 1,
      explanation: "A Type II error fails to reject a false null: a real effect is missed, often because the signal or sample is too weak.",
      link: "False positive spends on a fake effect; false negative abandons a real effect.", repairId: "case_experiment"
    },
    proxy_metric: {
      id: "proxy_metric", module: 2, source: "BRGSA-M02-L04", node: "Proxy metrics", pattern: "Decision MCQ",
      stem: "A low-traffic startup cannot wait for long-term revenue. Which proxy is most defensible for an onboarding experiment?",
      options: ["Whichever metric moves most", "A faster behaviour with a documented causal link to the target outcome", "Total page views because the number is large", "Founder excitement after launch"], answer: 1,
      explanation: "A proxy is useful only when its relationship to the real outcome is defensible and its failure conditions are recorded.",
      link: "A proxy shortens feedback time; it does not remove the duty to connect it to the outcome.", repairId: "case_experiment"
    },

    cohort_truth: {
      id: "cohort_truth", module: 3, source: "BRGSA-M03-L01", node: "Cohort analysis", pattern: "Caselet",
      caselet: "Monthly active users rose from 10,000 to 14,000 after a large campaign. Each new signup cohort, however, retains fewer users by week four than the cohort before it.",
      stem: "What does the cohort view reveal?",
      options: ["Retention is improving because the total is larger", "Acquisition volume is masking deteriorating retention", "The campaign has proven product-market fit", "Cohorts cannot be compared across time"], answer: 1,
      explanation: "Aggregate totals can rise while every cohort becomes less healthy. Cohorts hold entry time constant and expose the leak.",
      link: "Acquisition can refill a leaking bucket; cohort curves show whether the bucket improved.", repairId: "case_cohort"
    },
    retention_shape: {
      id: "retention_shape", module: 3, source: "BRGSA-M03-L02", node: "Retention curves", pattern: "Interpretation MCQ",
      stem: "A retention curve falls sharply, then settles into a stable plateau. What is the most useful interpretation?",
      options: ["Every user will eventually churn", "Early activation is weak, but a retained core appears to find durable value", "Acquisition cost must be zero", "The product should scale immediately regardless of economics"], answer: 1,
      explanation: "The early cliff points to onboarding/activation loss; the plateau suggests a segment receives recurring value.",
      link: "Curve shape translates behaviour over time into a product or growth decision.", repairId: "case_cohort"
    },
    cac_scope: {
      id: "cac_scope", module: 3, source: "BRGSA-M03-L03", node: "Customer acquisition cost", pattern: "Calculation MCQ",
      stem: "A team spends ₹3,00,000 on a channel and acquires 120 paying customers attributable to it. What is channel CAC?",
      options: ["₹250", "₹2,500", "₹3,600", "₹25,000"], answer: 1,
      explanation: "CAC = acquisition cost ÷ acquired customers = ₹3,00,000 ÷ 120 = ₹2,500.",
      link: "CAC must match a defined cost scope and a defined acquired-customer denominator.", repairId: "case_cohort"
    },
    ltv_early: {
      id: "ltv_early", module: 3, source: "BRGSA-M03-L04", node: "Early LTV", pattern: "Decision MCQ",
      stem: "Why estimate LTV before 18 months of mature data exists?",
      options: ["To claim precise future revenue", "Because CAC has no decision meaning without an estimate of the value it buys", "To replace retention measurement", "Because all customers have the same lifetime"], answer: 1,
      explanation: "Early LTV is an assumption-bearing estimate, not prophecy. It completes the unit-economics comparison and should be updated as cohorts mature.",
      link: "CAC tells what growth costs; LTV estimates what that cost purchases.", repairId: "case_cohort"
    },
    scale_iterate_pivot: {
      id: "scale_iterate_pivot", module: 3, source: "BRGSA-M03-L05", node: "Scale, iterate, or pivot", pattern: "Caselet",
      caselet: "A product has a small but stable retention plateau and acceptable unit economics among one narrow segment. Its broad campaign performs poorly.",
      stem: "Which decision is best supported?",
      options: ["Scale the broad campaign immediately", "Iterate around the retained segment before considering a full pivot", "Pivot away from the product without segment analysis", "Ignore retention and optimize impressions"], answer: 1,
      explanation: "A retained core suggests real value exists somewhere. The next step is to refine segment, message, or experience—not confuse weak breadth with zero value.",
      link: "Scale follows repeatable retention and economics; iterate repairs a link; pivot changes a failed premise.", repairId: "case_cohort"
    },

    growth_discipline: {
      id: "growth_discipline", module: 4, source: "BRGSA-M04-L01", node: "Marketing, product, and growth", pattern: "Concept MCQ",
      stem: "Which description best distinguishes growth from marketing and product?",
      options: ["Growth is another word for paid advertising", "Growth owns the cross-functional system that connects acquisition, product value, retention, and revenue", "Growth only ships features", "Growth reports total followers"], answer: 1,
      explanation: "Marketing brings and shapes demand; product creates/delivers value; growth joins the transitions and measures the system.",
      link: "Growth diagnoses the system across team boundaries, not a renamed channel team.", repairId: "mock_growth"
    },
    stage_fit: {
      id: "stage_fit", module: 4, source: "BRGSA-M04-L02", node: "Early- vs scale-stage growth", pattern: "Decision MCQ",
      stem: "An early startup has no repeatable channel and uncertain retention. Which move fits its stage?",
      options: ["Build a large specialist growth org", "Run founder-close, high-learning tests to find repeatability", "Maximize automation before customer contact", "Optimize quarterly media efficiency at scale"], answer: 1,
      explanation: "Early-stage growth is discovery under uncertainty. Scale-stage systems assume validated motions and optimize repeatability and throughput.",
      link: "Match the growth system to the uncertainty and repeatability of the current stage.", repairId: "case_constraint"
    },
    founder_led: {
      id: "founder_led", module: 4, source: "BRGSA-M04-L03", node: "Founder-led traction", pattern: "Application MCQ",
      stem: "Why can founder-led acquisition outperform an early hired growth function?",
      options: ["Founders always have lower salaries", "Founders can compress product, customer, and message learning into each conversation", "Hired teams cannot sell", "Founder outreach automatically scales"], answer: 1,
      explanation: "In the earliest stage, the point is rapid learning as much as volume. Founders carry context and can change the product or proposition directly.",
      link: "Founder-led does not mean founder forever; it means learning stays close to authority while the motion is unknown.", repairId: "case_constraint"
    },
    primary_constraint: {
      id: "primary_constraint", module: 4, source: "BRGSA-M04-L04", node: "Primary constraint", pattern: "Caselet",
      caselet: "Traffic is healthy, signup conversion is healthy, but only 12% of new accounts complete the first value event. The team proposes buying more ads.",
      stem: "What should the growth diagnosis prioritize?",
      options: ["More traffic", "Activation—the narrowest current constraint", "A rebrand", "A lower sample target"], answer: 1,
      explanation: "Funnel math identifies the bottleneck. Pouring more users into a broken activation step scales waste rather than growth.",
      link: "The primary constraint is the highest-leverage broken link, not the loudest team's metric.", repairId: "case_constraint"
    },
    first_customers: {
      id: "first_customers", module: 4, source: "BRGSA-M04-L06", node: "First-customer playbooks", pattern: "Decision MCQ",
      stem: "Which pairing best fits the course's early customer-acquisition logic?",
      options: ["B2B: mass TV; B2C: enterprise demos", "B2B: focused founder-led sales; B2C: concentrated cohort launch with seeding, proof, and repurchase", "Both: nationwide paid scale on day one", "Both: wait for organic search only"], answer: 1,
      explanation: "The first customers come from concentrated, learnable motions matched to buying behaviour—not from premature channel scale.",
      link: "Early acquisition must produce learning and proof, not merely gross reach.", repairId: "case_constraint"
    },

    channel_fit: {
      id: "channel_fit", module: 5, source: "BRGSA-M05-L01", node: "Channel-market fit", pattern: "Caselet",
      caselet: "A high-ACV B2B tool sells to heads of sales at 50–200 employee companies. A cheap, broad-interest video channel brings many views but almost no qualified meetings.",
      stem: "What is the core diagnosis?",
      options: ["The product cannot have product-market fit", "The channel's targeting and output properties do not match the product's economics and ICP", "The view count is proof the channel works", "All B2B products require television"], answer: 1,
      explanation: "Channel-market fit asks whether a channel's targeting, control, input, output, time, and economics match the product and ICP.",
      link: "A good product in a mismatched channel can still lose money.", repairId: "mock_channel"
    },
    outbound_system: {
      id: "outbound_system", module: 5, source: "BRGSA-M05-L02", node: "B2B outbound", pattern: "Decision MCQ",
      stem: "Which change most clearly turns cold email activity into an outbound system?",
      options: ["Sending more generic messages", "Defining the ICP, list quality, sequence, qualification, and stage metrics as one repeatable flow", "Counting every open as a sales opportunity", "Changing copy daily without a hypothesis"], answer: 1,
      explanation: "Outbound becomes controllable when inputs, stages, qualification, follow-up, and decisions are explicit—not when volume alone increases.",
      link: "A system names its stages and conversion logic; a campaign merely sends.", repairId: "case_constraint"
    },
    organic_loop: {
      id: "organic_loop", module: 5, source: "BRGSA-M05-L03", node: "B2C organic loops", pattern: "Concept MCQ",
      stem: "What separates an organic loop from a one-off viral campaign?",
      options: ["A loop always uses no creative work", "The output of one cycle becomes an input that can bring or activate the next user", "A loop has more impressions", "A campaign cannot use referrals"], answer: 1,
      explanation: "A loop is self-feeding by design. A spike can be large and still end when the campaign ends.",
      link: "Funnel output exits; loop output re-enters as input.", repairId: "case_network"
    },
    aha_event: {
      id: "aha_event", module: 5, source: "BRGSA-M05-L04", node: "Aha moment", pattern: "Application MCQ",
      stem: "Which is the strongest definition of an aha moment for analytics?",
      options: ["When users feel the magic", "A specific, timestamped event where a user first experiences the promised value", "When a user sees an ad", "Any completed signup"], answer: 1,
      explanation: "An aha moment must be observable or defensibly proxied. Vague feelings, interest, purchase, and signup are not automatically value-realisation events.",
      link: "Acquisition gets the user in; aha is the first experienced proof of the promise.", repairId: "case_activation"
    },
    activation_metric: {
      id: "activation_metric", module: 5, source: "BRGSA-M05-L06", node: "Activation metric design", pattern: "Application MCQ",
      stem: "Which activation metric is fully formed?",
      options: ["4,000 activated users", "Users who liked onboarding", "Percentage of verified free signups who receive their first automated follow-up within 7 days", "Total follow-up emails ever sent"], answer: 2,
      explanation: "A well-formed metric contains an event, time window, cohort, and denominator. The percentage of a named cohort within a bounded window supplies all four.",
      link: "Activation event is one occurrence; activation metric aggregates those events for a defined cohort and window.", repairId: "case_activation"
    },

    habit_loop: {
      id: "habit_loop", module: 6, source: "BRGSA-M06-L01", node: "Habit loops", pattern: "Concept MCQ",
      stem: "Why does the course place habit loops beneath retention, referral, and lifecycle work?",
      options: ["Because habits eliminate the need for value", "Because a repeatable cue-action-reward cycle can make return behaviour recur without reacquiring the user each time", "Because all products should send daily notifications", "Because habits are a pricing model"], answer: 1,
      explanation: "A habit loop explains recurring behaviour. It must deliver value; repeated prompting without value is not a durable loop.",
      link: "Retention becomes durable when the product's value recurs through a repeatable behaviour cycle.", repairId: "case_network"
    },
    lifecycle_fit: {
      id: "lifecycle_fit", module: 6, source: "BRGSA-M06-L02", node: "Lifecycle engagement", pattern: "Decision MCQ",
      stem: "A team sends the same weekly email to every user, regardless of their stage. What is missing?",
      options: ["More email volume", "Lifecycle engagement matched to the user's current state and next value action", "A larger top-of-funnel", "A referral discount"], answer: 1,
      explanation: "Lifecycle engagement supports the loop by helping users at the relevant moment. A generic drip is activity without state logic.",
      link: "Lifecycle messaging should move a specific state transition, not merely occupy a calendar.", repairId: "case_network"
    },
    retention_unit: {
      id: "retention_unit", module: 6, source: "BRGSA-M06-L03", node: "B2B vs B2C retention", pattern: "Application MCQ",
      stem: "For a team-based B2B SaaS product, which retention unit is usually more decision-useful than counting individual logins alone?",
      options: ["The paying account or team", "Total website visitors", "Social followers", "Every employee in the market"], answer: 0,
      explanation: "B2B retention often lives at account/team and decision-maker level; B2C retention usually follows an individual buyer or repeat-use unit.",
      link: "Measure retention at the unit that pays, adopts, and can churn.", repairId: "mock_churn"
    },
    referral_network: {
      id: "referral_network", module: 6, source: "BRGSA-M06-L05", node: "Referral vs network effects", pattern: "Concept MCQ",
      stem: "Which statement correctly separates referral from a network effect?",
      options: ["They are the same whenever users invite friends", "Referral acquires another user; a network effect makes the product more valuable as relevant users join", "Network effects require paid incentives", "Referral always improves value for existing users"], answer: 1,
      explanation: "Referral is an acquisition mechanism. Network effects change product value with network participation; an invite can occur without that value change.",
      link: "Referral changes who arrives; network effects change the value experienced after arrival.", repairId: "case_network"
    },
    churn_diagnostic: {
      id: "churn_diagnostic", module: 6, source: "BRGSA-M06-L06", node: "Churn diagnostics", pattern: "Decision MCQ",
      stem: "Which view best helps locate when and for whom churn occurs?",
      options: ["All-time customer count", "Cohort retention plus time-to-churn distribution, segmented by the relevant customer unit", "Total emails sent", "Quarterly impressions"], answer: 1,
      explanation: "Churn diagnostics combines rates and timing. Gross churn, NRR, cohort retention, and time-to-churn answer different parts of the leak.",
      link: "Diagnose churn by cohort, unit, reason, and time—not by one cumulative count.", repairId: "mock_churn"
    },

    pricing_structure: {
      id: "pricing_structure", module: 7, source: "BRGSA-M07-L01", node: "Pricing models", pattern: "Concept MCQ",
      stem: "Why does the course call pricing a structure rather than just a number?",
      options: ["Because the price should never change", "Because tiers, units, limits, and packaging shape customer behaviour and the expansion path", "Because only finance teams set it", "Because a lower number is always better"], answer: 1,
      explanation: "Pricing architecture determines how customers enter, use, upgrade, and expand—not only what one transaction costs.",
      link: "Price communicates and engineers a route through value, not merely a charge.", repairId: "case_nrr"
    },
    nrr_meaning: {
      id: "nrr_meaning", module: 7, source: "BRGSA-M07-L02", node: "Net revenue retention", pattern: "Calculation MCQ",
      stem: "A cohort starts with ₹10 lakh MRR, adds ₹2 lakh expansion, loses ₹1 lakh to churn, and ₹0.5 lakh to downgrades. What is NRR?",
      options: ["85%", "95%", "105%", "115%"], answer: 2,
      explanation: "NRR = (10 + 2 − 1 − 0.5) ÷ 10 × 100 = 105%. The starting cohort grows without counting new customers.",
      link: "NRR isolates whether the existing revenue base expands or shrinks.", repairId: "case_nrr"
    },
    pipeline_stage: {
      id: "pipeline_stage", module: 7, source: "BRGSA-M07-L03", node: "B2B pipeline logic", pattern: "Application MCQ",
      stem: "Why must a B2B pipeline define entry and exit criteria for each stage?",
      options: ["To make the CRM look complete", "So conversion and blockage reflect real buyer progress rather than subjective sales labels", "To increase email opens", "To avoid speaking to customers"], answer: 1,
      explanation: "A stage should represent a real change in buyer commitment or qualification. Otherwise pipeline math cannot locate the constraint.",
      link: "Pipeline stages are evidence states, not decorative columns.", repairId: "case_constraint"
    },
    handoff_sla: {
      id: "handoff_sla", module: 7, source: "BRGSA-M07-L04", node: "Sales integration", pattern: "Caselet",
      caselet: "Marketing marks a lead qualified, sales waits nine days, and customer success receives no record of the promised use case after purchase.",
      stem: "What system fix is highest leverage?",
      options: ["More top-of-funnel traffic", "Explicit handoff definitions, required context, owner, and response-time SLAs", "A new logo", "Remove the CRM"], answer: 1,
      explanation: "Growth leaks at transitions when teams optimize locally. Shared definitions and SLAs make the marketing→sales→success chain operable.",
      link: "Revenue integration is only as strong as the context and accountability crossing each handoff.", repairId: "case_nrr"
    },
    payback_period: {
      id: "payback_period", module: 7, source: "BRGSA-M07-L05", node: "Payback period", pattern: "Decision MCQ",
      stem: "Two channels have the same CAC. Channel A recovers it in 6 months; Channel B in 18 months, with similar retention risk. Why is A easier to scale?",
      options: ["It guarantees higher LTV", "Capital returns sooner and can be reinvested with less cash exposure", "It has no acquisition cost", "Payback never affects growth"], answer: 1,
      explanation: "Payback measures how long acquisition cash remains tied up. Faster recovery increases the rate at which the same capital can fund the next cohort.",
      link: "CAC size is incomplete without knowing how quickly gross profit earns it back.", repairId: "mock_payback"
    },

    ice_priority: {
      id: "ice_priority", module: 8, source: "BRGSA-M08-L01", node: "ICE prioritisation", pattern: "Application MCQ",
      stem: "What keeps an ICE score from becoming a polished opinion?",
      options: ["Scoring every idea 10", "Tying impact to the current constraint, confidence to evidence, and ease to real capacity", "Letting the most senior person set all three values", "Removing written assumptions"], answer: 1,
      explanation: "ICE is disciplined only when its three judgments are explicit and anchored to the constraint and available evidence.",
      link: "Prioritisation is a claim about leverage under uncertainty and capacity.", repairId: "case_operate"
    },
    backlog_system: {
      id: "backlog_system", module: 8, source: "BRGSA-M08-L02", node: "Growth backlog", pattern: "Concept MCQ",
      stem: "When does a list of experiment ideas become an operating backlog?",
      options: ["When it has more than 100 rows", "When each item carries the fields needed to prioritize, run, own, and decide it", "When ideas are sorted alphabetically", "When nobody removes an idea"], answer: 1,
      explanation: "A backlog is a decision and execution system. Ideas without hypothesis, metric, owner, score, status, and decision logic remain a wish list.",
      link: "A backlog connects an idea to evidence, capacity, ownership, and a decision date.", repairId: "case_operate"
    },
    decision_rule: {
      id: "decision_rule", module: 8, source: "BRGSA-M08-L03", node: "Pre-registered decision rules", pattern: "Application MCQ",
      stem: "Which rule is strongest before an activation experiment begins?",
      options: ["If the result looks promising, discuss scaling", "After the sample bound, scale at ≥45%, kill at <35%, otherwise iterate; use the named activation metric", "Ship if the founder likes the chart", "Choose the threshold after seeing the control"], answer: 1,
      explanation: "A pre-registered rule locks one metric, scale and kill thresholds, and a sample bound before the data can tempt post-hoc storytelling.",
      link: "The rule protects the decision from the result, not the result from scrutiny.", repairId: "mock_rule"
    },
    vanity_metric: {
      id: "vanity_metric", module: 8, source: "BRGSA-M08-L04", node: "Vanity metrics", pattern: "Decision MCQ",
      stem: "Which metric is least suitable for an operating decision rule?",
      options: ["Weekly activation rate by signup cohort", "Contribution margin per order", "All-time app downloads", "Day-30 repurchase rate by delivery cohort"], answer: 2,
      explanation: "All-time downloads can only rise and may sit several unvalidated hops from revenue, retention, or margin. It is true but not decision-useful.",
      link: "A real operating metric is comparable, two-directional, actionable, and close to a business outcome.", repairId: "case_operate"
    },
    allocation_rule: {
      id: "allocation_rule", module: 8, source: "BRGSA-M08-L05", node: "Resource allocation", pattern: "Concept MCQ",
      stem: "What is the purpose of a 70/20/10 portfolio split across known winners, new bets, and exploratory options?",
      options: ["To guarantee every experiment succeeds", "To balance exploitation with learning under constrained capacity", "To spend 70% on the newest idea", "To prevent mid-quarter reallocation"], answer: 1,
      explanation: "The split protects the proven engine while reserving capacity for adjacent and exploratory learning. Evidence can justify later reallocation.",
      link: "Capacity allocation is a portfolio decision: protect returns without starving discovery.", repairId: "case_operate"
    },

    case_validate: {
      id: "case_validate", module: 1, source: "BRGSA-M01-L06", node: "Validation decision", pattern: "Cross-module caselet",
      caselet: "A founder has 600 survey responses saying a meal-planning service is useful, 22 waitlist signups from 40 highly targeted visitors, and zero payment commitments. Building the full app would take six months.",
      stem: "What is the best next experiment?",
      options: ["Build the full app because survey volume is high", "Run a clearly described pre-sale or concierge commitment test with a declared threshold", "Buy broad traffic to raise total visits", "Treat the waitlist rate as final proof"], answer: 1,
      explanation: "The targeted waitlist is encouraging but not strong enough to justify the full build. A pre-sale or concierge test increases commitment while keeping cost low.",
      link: "Escalate evidence strength before escalating build cost.", repairId: "commit_strength"
    },
    case_experiment: {
      id: "case_experiment", module: 2, source: "BRGSA-M02-L06", node: "A/B decision", pattern: "Cross-module caselet",
      caselet: "An activation test reaches its pre-set sample. Variant B moves the named activation metric from 34% to 39%, inside the pre-registered iterate band of 37–42%. Revenue has not matured yet.",
      stem: "What should the team do?",
      options: ["Call B a winner because it improved", "Iterate according to the rule and continue tracking the defensible downstream link", "Move the scale threshold to 39%", "Ignore the activation metric and choose total clicks"], answer: 1,
      explanation: "The result belongs to the iterate band. Rewriting the threshold or metric after the result destroys the protection the rule created.",
      link: "A trustworthy experiment produces the pre-declared decision, including an unglamorous iterate.", repairId: "decision_rule"
    },
    case_cohort: {
      id: "case_cohort", module: 3, source: "BRGSA-M03-L05", node: "Scale decision", pattern: "Cross-module caselet",
      caselet: "Paid acquisition doubled signups. CAC rose from ₹1,800 to ₹3,100, week-8 retention fell from 32% to 17%, and the early LTV estimate is ₹2,700.",
      stem: "Which decision is most defensible?",
      options: ["Scale because signups doubled", "Stop scaling; diagnose segment/channel and retention before more spend", "Ignore LTV until 18 months pass", "Replace cohort retention with total users"], answer: 1,
      explanation: "CAC now exceeds estimated LTV and retention deteriorated. Volume is masking worsening economics and customer quality.",
      link: "Scale requires a repeatable retained customer whose value can repay acquisition.", repairId: "scale_iterate_pivot"
    },
    case_constraint: {
      id: "case_constraint", module: 4, source: "BRGSA-M04-L04", node: "Constraint diagnosis", pattern: "Cross-module caselet",
      caselet: "A B2B tool gets 70 qualified meetings per month, 40 trials, 25 paid accounts, but only 4 accounts are active after 90 days. Marketing proposes doubling outbound volume.",
      stem: "Where should the next growth cycle focus?",
      options: ["Outbound volume", "Post-sale adoption/retention and the handoff into customer success", "A broader ICP", "More meeting-booked incentives"], answer: 1,
      explanation: "Acquisition and conversion are not the binding constraint. The system loses accounts after purchase; more meetings accelerate the leak.",
      link: "Find the narrowest broken transition before adding flow upstream.", repairId: "primary_constraint"
    },
    case_activation: {
      id: "case_activation", module: 5, source: "BRGSA-M05-L06", node: "Activation design", pattern: "Cross-module caselet",
      caselet: "Users who complete a 12-step profile are retained, so the team calls profile completion the aha moment. New-user recordings show most people leave before experiencing the product's core output.",
      stem: "What is the best response?",
      options: ["Add more profile fields to strengthen commitment", "Identify the first value event, move/remove pre-value friction, and define activation around that event", "Use completed profiles as the denominator", "Measure all-time profiles"], answer: 1,
      explanation: "Profile completion may correlate because only motivated survivors finish it. The team must locate the actual value event and reduce friction before it.",
      link: "Do not confuse the effort a survivor endured with the value that caused retention.", repairId: "activation_metric"
    },
    case_network: {
      id: "case_network", module: 6, source: "BRGSA-M06-L05", node: "Loop diagnosis", pattern: "Cross-module caselet",
      caselet: "A fitness app gives ₹100 for each invite. Invites spike, but the product is no more useful to existing users when friends join, and the spike ends when the reward stops.",
      stem: "What was built?",
      options: ["A durable network effect", "An incentivised referral campaign, not a network effect", "A habit loop by definition", "A pricing expansion engine"], answer: 1,
      explanation: "The reward acquired users temporarily. Existing-user value did not rise with network participation, so there is no demonstrated network effect.",
      link: "Acquisition incentive, recurring behaviour, and network value are different mechanisms.", repairId: "referral_network"
    },
    case_nrr: {
      id: "case_nrr", module: 7, source: "BRGSA-M07-L02", node: "Expansion architecture", pattern: "Cross-module caselet",
      caselet: "A SaaS company grows 35% through new sales, but the starting cohort falls from ₹20 lakh to ₹16 lakh MRR after expansion, churn, and downgrades.",
      stem: "What does the cohort's NRR say?",
      options: ["NRR is 125%; the base compounds", "NRR is 80%; acquisition is masking a shrinking base", "NRR cannot be calculated without new sales", "NRR is 35%"], answer: 1,
      explanation: "₹16 lakh ÷ ₹20 lakh = 80% NRR. New-customer growth must not be smuggled into the existing cohort's performance.",
      link: "Headline growth can coexist with a structurally leaking revenue base.", repairId: "nrr_meaning"
    },
    case_operate: {
      id: "case_operate", module: 8, source: "BRGSA-M08-L07", node: "Integrated growth engine", pattern: "Cross-module caselet",
      caselet: "A Monday growth meeting reviews 40 ideas, celebrates total signups, and starts five tests. None has an owner, sample bound, decision date, or link to the activation bottleneck.",
      stem: "Which intervention repairs the operating system first?",
      options: ["Add 40 more ideas", "Create a scored backlog tied to the constraint, assign owners/capacity, and pre-register decisions", "Replace signups with followers", "Run every test in parallel"], answer: 1,
      explanation: "The team lacks the bridge from evidence to prioritisation, execution, and decisions. More activity compounds the disorder.",
      link: "A growth engine closes the loop from constraint → hypothesis → experiment → decision → reallocation.", repairId: "backlog_system"
    },

    mock_commit: {
      id: "mock_commit", module: 1, source: "BRGSA-M01-L04", node: "Evidence strength", pattern: "Mock MCQ",
      stem: "Which evidence should receive the greatest weight in a build/no-build decision?",
      options: ["High survey enthusiasm", "A large number of ad impressions", "Commitments from target customers under an offer with real terms", "Founder confidence"], answer: 2,
      explanation: "Target-customer commitments expose real trade-offs and therefore dominate passive or hypothetical signals.",
      link: "Evidence strength rises with relevance and real commitment.", repairId: "commit_strength"
    },
    mock_type_one: {
      id: "mock_type_one", module: 2, source: "BRGSA-M02-L03", node: "Experiment error", pattern: "Mock caselet",
      caselet: "A team checks results every hour and stops the first time p < 0.05. The apparent win disappears in the next full cohort.",
      stem: "Which risk did the stopping behaviour inflate?",
      options: ["Type I false positive", "Type II false negative only", "Customer lifetime", "Network density"], answer: 0,
      explanation: "Repeated unplanned peeking and stopping on a favourable result increases the chance of declaring a fake effect.",
      link: "The sample/stopping plan protects the false-positive rate.", repairId: "sample_logic"
    },
    mock_cohort: {
      id: "mock_cohort", module: 3, source: "BRGSA-M03-L01", node: "Cohort interpretation", pattern: "Mock MCQ",
      stem: "Which dashboard change most directly prevents new acquisition from hiding a retention decline?",
      options: ["Show larger total-user numbers", "Plot retention by signup cohort and time since entry", "Remove denominators", "Combine all customers into one average"], answer: 1,
      explanation: "Cohort-by-age views compare like with like and reveal whether new groups hold value better or worse.",
      link: "Cohorts separate growth in inflow from improvement in staying power.", repairId: "cohort_truth"
    },
    mock_growth: {
      id: "mock_growth", module: 4, source: "BRGSA-M04-L01", node: "Growth ownership", pattern: "Mock caselet",
      caselet: "Paid traffic converts, but new users fail activation and churn. Marketing hits its lead target; product ships features; neither owns the transition.",
      stem: "What would a growth diagnosis do first?",
      options: ["Celebrate both team targets", "Own the cross-functional activation/retention transition and define one shared constraint metric", "Buy more traffic", "Rename marketing as growth"], answer: 1,
      explanation: "Local output targets can be green while the system fails. Growth must connect the customer transition across functional boundaries.",
      link: "System health outranks isolated team output.", repairId: "growth_discipline"
    },
    mock_channel: {
      id: "mock_channel", module: 5, source: "BRGSA-M05-L01", node: "Channel economics", pattern: "Mock MCQ",
      stem: "A channel reaches the ICP precisely but takes 14 months to yield results; the startup has three months of runway. Which channel-fit property fails most directly?",
      options: ["Targeting", "Time to result relative to the business constraint", "Message clarity only", "Product desirability by definition"], answer: 1,
      explanation: "A channel can fit the audience yet fail the company's timing and resource reality. Fit is multi-dimensional.",
      link: "Channel fit includes targeting, control, input, output, time, and economics.", repairId: "channel_fit"
    },
    mock_friction: {
      id: "mock_friction", module: 5, source: "BRGSA-M05-L05", node: "Onboarding friction", pattern: "Mock caselet",
      caselet: "Seven onboarding steps each lose only a small percentage of users, but fewer than one-third reach the first value event.",
      stem: "Which principle best explains the result?",
      options: ["Small losses cannot compound", "Reasonable step-level friction compounds across the whole path to aha", "The aha moment must be signup", "Adding more explanatory steps always fixes cognitive load"], answer: 1,
      explanation: "Each drop applies to the remaining users, so multiple modest frictions can destroy total activation. Remove or defer nonessential pre-value work.",
      link: "Audit the complete new-user path, not each step in isolation.", repairId: "aha_event"
    },
    mock_churn: {
      id: "mock_churn", module: 6, source: "BRGSA-M06-L06", node: "Retention evidence", pattern: "Mock MCQ",
      stem: "Which pair most directly separates ‘how much revenue left’ from ‘when customer groups disengage’?",
      options: ["Total customers and impressions", "Gross revenue churn and cohort/time-to-churn analysis", "Email sends and open rate", "CAC and ad reach"], answer: 1,
      explanation: "Revenue churn measures the loss magnitude; cohort retention and time-to-churn locate its pattern across customer groups and age.",
      link: "Use multiple aligned views because churn has size, timing, segment, and cause.", repairId: "churn_diagnostic"
    },
    mock_payback: {
      id: "mock_payback", module: 7, source: "BRGSA-M07-L05", node: "Payback decision", pattern: "Mock calculation",
      stem: "CAC is ₹12,000 and monthly gross profit per customer is ₹2,000. Ignoring churn, what is the simple payback period?",
      options: ["4 months", "6 months", "10 months", "24 months"], answer: 1,
      explanation: "₹12,000 ÷ ₹2,000 monthly gross profit = 6 months.",
      link: "Payback divides acquisition cash by the recurring gross profit available to repay it.", repairId: "payback_period"
    },
    mock_motion: {
      id: "mock_motion", module: 7, source: "BRGSA-M07-L06", node: "PLG vs SLG", pattern: "Mock caselet",
      caselet: "A complex enterprise product needs security review, multi-stakeholder approval, custom integration, and a high annual contract.",
      stem: "Which primary motion is better matched?",
      options: ["Pure self-serve PLG with no human support", "Sales-led growth supported by product experience", "Consumer referral coupons only", "No acquisition motion"], answer: 1,
      explanation: "High complexity, risk, contract value, and stakeholder count favour a sales-led motion. Product can still assist evaluation and adoption.",
      link: "Choose PLG or SLG from buying complexity and economics, not fashion.", repairId: "pipeline_stage"
    },
    mock_rule: {
      id: "mock_rule", module: 8, source: "BRGSA-M08-L03", node: "Decision integrity", pattern: "Mock MCQ",
      stem: "Why include both scale and kill thresholds before an experiment starts?",
      options: ["To ensure every result is extreme", "To create a genuine middle iterate zone and prevent post-hoc binary storytelling", "To remove the need for a metric", "To maximize sample peeking"], answer: 1,
      explanation: "Two thresholds create three decisions—scale, iterate, kill—and keep ambiguous evidence from being forced into a convenient win/loss story.",
      link: "Good rules make uncertainty actionable without pretending it vanished.", repairId: "decision_rule"
    },
    mock_full_case: {
      id: "mock_full_case", module: 9, source: "BRGSA-M08-L07", node: "Full growth engine", pattern: "Mock caselet",
      caselet: "A D2C brand validates demand with paid pre-orders. Its first cohort activates through a 21-day routine, repurchase predicts retention, and acquisition is profitable. The team now has ten experiment ideas but capacity for two.",
      stem: "Which sequence best protects the evidence chain?",
      options: ["Choose the two highest-reach ideas", "Name the current constraint, score ideas against it with evidence/capacity, pre-register decisions, then reallocate after results", "Run all ten with smaller samples", "Optimize total followers"], answer: 1,
      explanation: "The operating layer must preserve the evidence accumulated from validation, activation, retention, and economics. Constraint-led prioritisation connects them.",
      link: "The full engine turns validated customer behaviour into constrained, repeatable decisions.", repairId: "ice_priority"
    },
    mock_chain_order: {
      id: "mock_chain_order", module: 10, source: "BRGSA-M08-L07", node: "Causal sequence", pattern: "Mock synthesis",
      stem: "Which order best represents the course's defensible growth chain?",
      options: ["Scale → validate → retain → choose a metric", "Validate demand → run trustworthy experiments → read cohorts/economics → fix constraint → activate/retain → monetize → operate", "Acquire → count signups → add pricing → survey", "Build fully → choose a channel → define the customer"], answer: 1,
      explanation: "The course builds from evidence of demand into trustworthy learning, system diagnosis, customer value, economics, and finally an operating cadence.",
      link: "Later growth machinery is only as sound as the evidence links beneath it.", repairId: "val_definition"
    }
  }
};
