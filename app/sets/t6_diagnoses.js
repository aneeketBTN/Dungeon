/*
 * Authored option-level diagnoses for the T6 bank.
 *
 * Every distractor a learner can select must be able to explain the specific gap
 * that choosing it reveals. Most of the bank is generated, so most diagnoses are
 * derived from provenance in `t6_challenges.js`: a distractor borrowed from another
 * concept is diagnosed exactly, by construction.
 *
 * This file holds the remainder — hand-written MCQ distractors that carry no machine
 * knowable provenance. Each entry is keyed by question id, then by option index.
 *
 *   tag   — stable short identity. Repeats of the same tag across independent
 *           question families are what the scheduler treats as a recurring
 *           misconception, so keep it stable once shipped and keep it readable:
 *           it is shown to the learner in the concept inspector.
 *   label — the headline of the gap, in the learner's words.
 *   why   — the belief the choice assumed, and what the source material holds instead.
 *   cue   — what to look for next time so the same distinction is caught earlier.
 *
 * Authoring rules (enforced by `validate_t6_bank.js`):
 *   - `why` must not simply restate the correct answer. Name the wrong belief first.
 *   - Diagnose the reasoning, never the learner. No "you failed to", no praise, no blame.
 *   - Stay inside the indexed lecture sources; do not introduce new claims.
 *
 * Status: WAITING_OWNER_CONTENT_ACCEPTANCE, alongside the other transcript-derived
 * content in the bank.
 */
(function () {
  "use strict";

  // Three fixed distractors reused across every catalogue "connect" question.
  // One diagnosis each covers 84 option slots.
  var SHARED = {
    isolation: {
      tag: "Treated the idea as context-free",
      label: "Detached the idea from the system around it",
      why: "This choice assumed a framework holds the same way regardless of the people, constraints, and decisions surrounding it. In this subject an idea earns its force from the conditions it operates under; change the constraint and the same rule produces a different decision.",
      cue: "Before applying a framework, name the constraint it is responding to. If you cannot state what would have to be true for it to fail, you are treating it as context-free."
    },
    localOptimum: {
      tag: "Optimised one measure in isolation",
      label: "Improved a local number and stopped there",
      why: "This choice assumed that lifting one measure settles the question. A connected system moves elsewhere when one part of it is pushed, so a local gain can be paid for by an unmeasured loss somewhere else.",
      cue: "Ask what else moves when this number improves. A defensible answer names the second-order effect, not only the metric that went up."
    },
    evidenceClosed: {
      tag: "Closed the decision to later evidence",
      label: "Treated the decision as final once made",
      why: "This choice assumed a commitment stops responding to what happens next. Throughout this subject decisions are provisional: they are made on the evidence available and revised when better evidence arrives.",
      cue: "Ask what new result would change this decision. If nothing would, the decision is not being held to evidence."
    }
  };

  var AUTHORED = {
    smoke_signal: {
      0: {
        tag: "Confused a demand test with a feasibility test",
        label: "Read a demand test as an engineering question",
        why: "This choice assumed the landing page is checking whether the product can be built. A smoke test puts nothing behind the door: it cannot report on feasibility because no engineering work is being exercised. It reports whether people exposed to the offer act on it.",
        cue: "Ask what the test physically measures. A page that records clicks can only tell you about the people clicking, never about what sits behind it."
      },
      2: {
        tag: "Accepted stated opinion as behavioural evidence",
        label: "Counted what people say as what people do",
        why: "This choice assumed approval and action are the same signal. The waitlist action is behavioural precisely because it costs the prospect something — attention, an address, a place in a queue — which stated approval does not.",
        cue: "Ask what the person gave up. If the answer is nothing, you are looking at an opinion, not a demand signal."
      },
      3: {
        tag: "Judged an early test by mature-funnel completeness",
        label: "Applied a mature marketing standard to a first test",
        why: "This choice assumed the page is being assessed as a finished funnel. A smoke test is deliberately incomplete: it isolates one question — will exposed prospects step forward — and a complete funnel would confound that answer rather than sharpen it.",
        cue: "Ask what single question the artefact is built to answer. Early tests are narrow on purpose."
      }
    },
    commit_strength: {
      0: {
        tag: "Accepted stated opinion as behavioural evidence",
        label: "Ranked praise above a costly commitment",
        why: "This choice assumed enthusiasm in a survey indicates likely purchase. Praise is free to give and is often given to be agreeable, so it sits at the weak end of the commitment spectrum no matter how positive the wording.",
        cue: "Rank responses by what they cost the person: money, time, reputation, or access. Free responses rank lowest however warm they sound."
      },
      1: {
        tag: "Read a low-cost signal as a strong one",
        label: "Treated a near-free action as a purchase signal",
        why: "This choice assumed a like is meaningful because it is an action rather than a statement. It is an action, but a nearly costless one, so it barely separates people who would buy from people who merely approve.",
        cue: "Ask how much weaker the signal would be if the person had no interest at all. If they would plausibly do it anyway, it does not discriminate."
      },
      3: {
        tag: "Read a low-cost signal as a strong one",
        label: "Counted attention as intent",
        why: "This choice assumed opening an email indicates buying intent. An open measures curiosity at zero cost and reliably over-reports interest, which is why it belongs near the bottom of the commitment spectrum.",
        cue: "Separate signals of attention from signals of commitment. Opens, views, and impressions measure the first."
      }
    },
    survey_bias: {
      0: {
        tag: "Blamed comprehension for a prediction problem",
        label: "Located the weakness in understanding rather than prediction",
        why: "This choice assumed respondents cannot grasp an unlaunched product. The weakness is not comprehension: people commonly understand the offer perfectly and still mispredict their own future behaviour under no obligation to act.",
        cue: "Ask whether the problem is that people misunderstood, or that they answered sincerely and were still wrong about themselves."
      },
      2: {
        tag: "Treated sample size as the governing flaw",
        label: "Attributed a validity problem to sample size",
        why: "This choice assumed the question becomes trustworthy at sufficient volume. Hypothetical intent is a weak predictor at any sample size; adding responses makes an unreliable measure more precise, not more valid.",
        cue: "Separate precision from validity. More responses narrow the error around a number; they cannot fix a number that measures the wrong thing."
      },
      3: {
        tag: "Invented a procedural rule the source does not hold",
        label: "Answered with a rule about who may run surveys",
        why: "This choice assumed the flaw is procedural. The source treats surveys as legitimate and useful tools; the caution is specifically about hypothetical purchase questions as primary demand evidence, not about who administers them.",
        cue: "Check whether the option describes the reasoning failure or a rule about process. This question is about what the answer predicts."
      }
    },
    type_one: {
      1: {
        tag: "Reversed the two decision errors",
        label: "Named the opposite error",
        why: "This choice assumed a real effect was missed. Here the test reported an improvement that does not exist, which is a false positive. A false negative is the mirror case: a real effect present, and the test fails to detect it.",
        cue: "Fix the direction first. Ask what is true in the world, then what the test claimed. Claimed an effect that is not there means false positive."
      },
      2: {
        tag: "Answered with a study-design term instead of the error type",
        label: "Named a design property rather than the error",
        why: "This choice assumed the sampling frame classifies the mistake. The sampling frame describes who could enter the test; it can raise the risk of an error but it is not itself one of the two decision errors the question is asking you to name.",
        cue: "Separate causes from classifications. The question asks which error occurred, not what made it more likely."
      },
      3: {
        tag: "Reached for an unrelated growth concept",
        label: "Applied a retention concept to an inference question",
        why: "This choice assumed cohort decay is relevant here. Cohort decay describes how a group of users falls away over time; it belongs to retention analysis and says nothing about whether a test's conclusion was true or false.",
        cue: "Check which module the option belongs to. Inference errors concern the test's conclusion, not user behaviour over time."
      }
    },
    type_two: {
      0: {
        tag: "Reversed the two decision errors",
        label: "Named the opposite error",
        why: "This choice assumed the test claimed an effect that was not there. Here the improvement is genuine and the underpowered test failed to detect it, which is a false negative. A false positive is the mirror case.",
        cue: "Fix the direction first. A real effect that the test missed means false negative."
      },
      2: {
        tag: "Reached for a bias label instead of the error type",
        label: "Named a selection bias rather than the error",
        why: "This choice assumed survivorship bias describes the failure. Survivorship bias is about which cases are visible to the analysis; here every case was visible and the test simply lacked the power to detect a real difference.",
        cue: "Ask whether cases went missing, or whether the test lacked the sensitivity to see what was present."
      },
      3: {
        tag: "Treated a non-significant result as proof of no effect",
        label: "Read 'not significant' as 'nothing happened'",
        why: "This choice assumed that failing to reach significance establishes the absence of an effect. A non-significant result under low power is exactly what a missed real effect looks like; absence of evidence is not evidence of absence.",
        cue: "When a result is null, ask whether the test could have detected the effect if it were there. If not, the null is uninformative."
      }
    },
    cohort_truth: {
      0: {
        tag: "Read a rising total as improving health",
        label: "Inferred retention from the aggregate total",
        why: "This choice assumed a larger total implies better retention. The total can rise purely because more users are entering, while every individual cohort holds fewer users than the one before it — which is what the data here shows.",
        cue: "When a total rises, ask whether it rose because entry increased or because retention improved. Only the cohort view separates them."
      },
      2: {
        tag: "Claimed product-market fit from acquisition volume",
        label: "Treated campaign-driven volume as evidence of fit",
        why: "This choice assumed volume demonstrates product-market fit. Fit shows up as users staying, and each successive cohort here retains worse — the deteriorating signal, not a confirming one.",
        cue: "Test claims of fit against retention curves, not against acquisition counts."
      },
      3: {
        tag: "Rejected the tool that answers the question",
        label: "Dismissed cohort comparison as invalid",
        why: "This choice assumed cohorts cannot be compared across time. Holding entry time constant is precisely what makes them comparable: each cohort is measured at the same age, which is what exposes the decline here.",
        cue: "When comparing groups over time, check whether they are aligned by age rather than by calendar date. Aligned cohorts are comparable."
      }
    },
    cac_scope: {
      0: {
        tag: "Made an order-of-magnitude arithmetic slip",
        label: "Landed a factor of ten below the result",
        why: "This choice divides as though 1,200 customers were acquired rather than 120. The method is right and the scale is wrong, which matters because a CAC off by a factor of ten reverses the payback and LTV conclusions built on it.",
        cue: "Sanity-check the magnitude before accepting a unit-economics figure: ₹3,00,000 over roughly 100 customers must land near ₹3,000, not ₹300."
      },
      2: {
        tag: "Divided by the wrong denominator",
        label: "Used a denominator the case does not supply",
        why: "This choice does not come from the two figures given. CAC is the attributable spend divided by the customers that spend acquired; introducing any other denominator answers a different question than the one asked.",
        cue: "Write the formula before computing: cost ÷ customers acquired. Then check both inputs appear in the case."
      },
      3: {
        tag: "Made an order-of-magnitude arithmetic slip",
        label: "Landed a factor of ten above the result",
        why: "This choice divides as though 12 customers were acquired rather than 120. The method is right and the scale is wrong, and an inflated CAC would wrongly condemn a channel that is in fact viable.",
        cue: "Sanity-check the magnitude before accepting a unit-economics figure: ₹3,00,000 over roughly 100 customers must land near ₹3,000, not ₹25,000."
      }
    },
    scale_iterate_pivot: {
      0: {
        tag: "Scaled before the evidence supported it",
        label: "Scaled on a signal that has not been isolated",
        why: "This choice assumed the broad campaign deserves more spend. The broad campaign is the part performing poorly; the stable retention sits in one narrow segment, so scaling breadth spends against the weaker evidence.",
        cue: "Ask which part of the evidence is actually working. Scale the part that retains, not the part that reaches."
      },
      2: {
        tag: "Abandoned a working signal without diagnosis",
        label: "Pivoted away from evidence that value exists",
        why: "This choice assumed weak breadth means no value. A stable retention plateau with acceptable unit economics is positive evidence that value exists somewhere; a pivot discards it before establishing why it is confined to that segment.",
        cue: "Before pivoting, ask whether anyone is retaining. A retained core is a reason to narrow, not to leave."
      },
      3: {
        tag: "Substituted a reach metric for a value metric",
        label: "Replaced the decision-useful signal with exposure",
        why: "This choice assumed impressions should guide the decision. Retention is the signal that distinguishes the healthy segment from the unhealthy breadth; optimising impressions removes the only measure currently telling you where value lives.",
        cue: "When choosing what to optimise, keep the metric that separates your good cases from your bad ones."
      }
    },
    stage_fit: {
      0: {
        tag: "Applied a scale-stage system at the discovery stage",
        label: "Built scale machinery before finding what to scale",
        why: "This choice assumed structure creates repeatability. A specialist growth organisation is built to run a motion that already works; with no repeatable channel and uncertain retention there is nothing yet for it to execute.",
        cue: "Ask whether the motion being staffed has been shown to work. Organisations scale a known process; they do not discover one."
      },
      2: {
        tag: "Automated before the process was understood",
        label: "Removed customer contact at the learning stage",
        why: "This choice assumed automation should precede customer contact. Early-stage work is discovery under uncertainty, and automation fixes a process in place — locking in assumptions before the evidence that would correct them has been gathered.",
        cue: "Automate after you can describe the process precisely. If it is still being learned, contact is the point."
      },
      3: {
        tag: "Applied a scale-stage system at the discovery stage",
        label: "Optimised efficiency before establishing repeatability",
        why: "This choice assumed media efficiency is the early priority. Efficiency optimisation assumes a validated motion whose throughput is worth improving; here neither the channel nor retention is established, so there is no verified motion to make efficient.",
        cue: "Efficiency questions come after repeatability questions. Ask whether the thing being tuned reliably works yet."
      }
    },
    primary_constraint: {
      0: {
        tag: "Added volume upstream of the bottleneck",
        label: "Widened a stage that is not the constraint",
        why: "This choice assumed more traffic addresses the problem. Traffic and signup conversion are both healthy; adding users upstream of a step that loses 88% of them scales the loss rather than the growth.",
        cue: "Walk the funnel and find the narrowest stage. Effort spent upstream of it multiplies waste."
      },
      2: {
        tag: "Answered a funnel diagnosis with a brand action",
        label: "Reached for a broad action instead of the located problem",
        why: "This choice assumed a positioning problem. The funnel data locates the loss precisely at the first value event, after users have already chosen to sign up — which is behavioural, not a matter of how the product is perceived beforehand.",
        cue: "When the data locates a specific step, let the diagnosis be as specific as the data."
      },
      3: {
        tag: "Answered a diagnosis question with a measurement change",
        label: "Adjusted the measurement instead of the constraint",
        why: "This choice assumed a testing parameter is the issue. Lowering a sample target changes how confidently you can detect effects; it leaves the activation step exactly where it is and does not act on the bottleneck at all.",
        cue: "Separate changing the system from changing how you observe it. A diagnosis must name the step to fix."
      }
    },
    retention_unit: {
      1: {
        tag: "Chose a traffic measure over a retention unit",
        label: "Answered with an acquisition measure",
        why: "This choice assumed visitors indicate retention. Visitors describe who arrives, and retention asks who stays and keeps paying — for a team-based product that is the account, because the buying and renewal decision lives there.",
        cue: "Ask who makes the renewal decision. That is usually the right retention unit."
      },
      2: {
        tag: "Chose a reach measure over a retention unit",
        label: "Answered with an audience measure",
        why: "This choice assumed followers track product retention. Followers measure audience attention outside the product; a B2B account can retain and expand with almost no social following, and lose the account while its following grows.",
        cue: "Check whether the measure can move independently of paying and using the product. If it can, it is not a retention unit."
      },
      3: {
        tag: "Chose the addressable market as the retention unit",
        label: "Measured retention against the whole market",
        why: "This choice assumed the market defines the denominator. Every employee in the market includes people who never bought; retention is measured within the base that did buy, or the rate would be dominated by non-customers.",
        cue: "Retention denominators contain customers only. If non-buyers are inside it, you are measuring penetration."
      }
    },
    nrr_meaning: {
      0: {
        tag: "Dropped expansion from the retention calculation",
        label: "Counted the losses and omitted the gains",
        why: "This choice subtracts churn and downgrades but leaves out the ₹2 lakh of expansion. Net revenue retention is net precisely because expansion inside the existing cohort counts against its losses; omitting it turns NRR into a gross-loss measure.",
        cue: "Check that all four movements appear: starting base, expansion, churn, and downgrades."
      },
      1: {
        tag: "Partially applied the retention formula",
        label: "Included only part of the cohort's movement",
        why: "This choice reflects some but not all of the four movements the case supplies. Each of expansion, churn, and downgrade applies to the starting base, and leaving any one out shifts the result away from the 105% the figures give.",
        cue: "Compute the net change first — +2 − 1 − 0.5 = +0.5 — then divide by the ₹10 lakh starting base."
      },
      3: {
        tag: "Dropped the reductions from the retention calculation",
        label: "Counted the gains and omitted the losses",
        why: "This choice adds expansion to the base without subtracting the ₹1 lakh churn and ₹0.5 lakh of downgrades. That reports the cohort as compounding faster than it is, which is the specific error NRR exists to prevent.",
        cue: "Expansion never stands alone in NRR. Net it against churn and downgrades before dividing."
      }
    },
    vanity_metric: {
      0: {
        tag: "Rejected a decision-useful metric as vanity",
        label: "Discarded a metric that can fall as well as rise",
        why: "This choice assumed weekly activation by cohort is unsuitable for a rule. It is well suited: it is bounded, it can move in either direction, and it is close to the behaviour a team can act on — the opposite of the vanity pattern.",
        cue: "Ask whether the metric can get worse. A number that can only rise cannot trigger a decision rule."
      },
      1: {
        tag: "Rejected a decision-useful metric as vanity",
        label: "Discarded a direct economic measure",
        why: "This choice assumed contribution margin per order is unsuitable. It sits directly on the economics of each transaction and moves both ways with price, cost, and mix, which is precisely what a rule needs to act against.",
        cue: "Count the hops between the metric and money. Fewer hops usually means more decision-useful."
      },
      3: {
        tag: "Rejected a decision-useful metric as vanity",
        label: "Discarded a bounded, cohort-aligned outcome",
        why: "This choice assumed day-30 repurchase by cohort is unsuitable. It is bounded, aligned to a fixed age, and can deteriorate — so it supports a threshold and a pre-declared action, which all-time downloads cannot.",
        cue: "Prefer metrics with a denominator and a time window. Cumulative all-time counts have neither."
      }
    },
    allocation_rule: {
      0: {
        tag: "Expected a portfolio rule to remove risk",
        label: "Read a portfolio split as a guarantee of success",
        why: "This choice assumed the split makes experiments succeed. A portfolio exists because most new bets will not work; the split limits how much a failure costs while keeping enough capacity in play to learn something.",
        cue: "Ask what the structure protects against rather than what it promises. Portfolios bound downside, they do not remove it."
      },
      2: {
        tag: "Inverted the allocation weights",
        label: "Put the largest share on the least proven work",
        why: "This choice assumed the 70% belongs to the newest idea. It belongs to the known winners; reversing the weights would put most of constrained capacity behind the least evidenced work, which is the risk the rule is designed to avoid.",
        cue: "Read the split from most evidenced to least. The largest share sits with what is already working."
      },
      3: {
        tag: "Read a planning rule as a freeze on evidence",
        label: "Treated the allocation as fixed against new results",
        why: "This choice assumed the split forbids mid-quarter reallocation. It is a starting allocation under uncertainty, and evidence arriving within the period is exactly the reason to move capacity between the three buckets.",
        cue: "Ask whether the rule is a plan or a prohibition. Allocations start decisions; they do not close them."
      }
    },
    case_cohort: {
      0: {
        tag: "Scaled before the evidence supported it",
        label: "Scaled on volume while economics deteriorated",
        why: "This choice assumed doubled signups justify more spend. In the same period CAC rose to ₹3,100 against an estimated LTV of ₹2,700 and week-8 retention halved — so each additional customer is now bought above their estimated value.",
        cue: "Put CAC beside LTV before any scale decision. When CAC passes LTV, volume growth increases the loss."
      },
      2: {
        tag: "Deferred a decision past the point of evidence",
        label: "Postponed using a figure that is already actionable",
        why: "This choice assumed LTV must mature before it can inform the decision. An early LTV estimate is uncertain, but it is already below CAC and moving in the wrong direction; waiting 18 months means spending against known-bad economics throughout.",
        cue: "Ask whether the uncertainty in an estimate is large enough to reverse the conclusion. Here it is not."
      },
      3: {
        tag: "Replaced a diagnostic view with an aggregate",
        label: "Removed the measure that exposed the problem",
        why: "This choice assumed total users is the better view. Cohort retention is what revealed the decline from 32% to 17%; collapsing it into a total hides that decline behind the acquisition growth, which is how the situation arose.",
        cue: "When a view surfaces a problem, that is a reason to keep it, not to replace it."
      }
    },
    case_network: {
      0: {
        tag: "Called a paid referral loop a network effect",
        label: "Read incentivised acquisition as a structural effect",
        why: "This choice assumed the invite spike demonstrates a network effect. A network effect means existing users get more value as more users join; here the case states the product is no more useful when friends join, and the spike stops with the reward.",
        cue: "Ask whether existing users are better off because others joined. If the value came from the payment, it is a campaign."
      },
      2: {
        tag: "Applied a retention concept to an acquisition mechanism",
        label: "Named a habit loop for an acquisition event",
        why: "This choice assumed a habit loop is in play. A habit loop concerns repeated returning use by the same person; the case describes one-off invitations driven by a reward, with no evidence of recurring use developing.",
        cue: "Separate mechanisms that bring users in from mechanisms that bring them back. Habits are about return."
      },
      3: {
        tag: "Applied a monetisation concept to an acquisition mechanism",
        label: "Named a revenue mechanism for an acquisition event",
        why: "This choice assumed expansion revenue is involved. The ₹100 incentive is spend that acquires signups; nothing in the case describes existing accounts growing in value, which is what an expansion engine measures.",
        cue: "Check the direction of the money. Here it flows out to acquire, not in from growing accounts."
      }
    },
    case_nrr: {
      0: {
        tag: "Inverted the retention ratio",
        label: "Divided the ratio the wrong way round",
        why: "This choice reports growth from a cohort that shrank. The starting base of ₹20 lakh ended at ₹16 lakh, so the ratio is 16 ÷ 20 = 80%; the inverted division turns a contraction into apparent compounding.",
        cue: "Put the ending cohort value on top and the starting value underneath. Below 100% means the base shrank."
      },
      2: {
        tag: "Believed the calculation requires new-customer revenue",
        label: "Treated new sales as an input to cohort retention",
        why: "This choice assumed NRR cannot be computed without new sales. NRR deliberately excludes them: it measures what happened to one starting cohort, and admitting new customers is exactly the error that lets 35% acquisition growth hide an 80% result.",
        cue: "Fix the cohort before calculating. New customers were not in the starting base and do not enter it later."
      },
      3: {
        tag: "Reported the acquisition rate as the retention rate",
        label: "Answered with the growth figure from the case",
        why: "This choice assumed the 35% new-sales growth is the answer. That number describes new customers arriving; NRR describes what happened inside the existing cohort, and here the two point in opposite directions.",
        cue: "Check which population a percentage belongs to. New-sales growth and cohort NRR are different bases."
      }
    },
    mock_type_one: {
      1: {
        tag: "Reversed the two decision errors",
        label: "Named the opposite error",
        why: "This choice assumed repeated peeking causes missed effects. Stopping at the first favourable crossing selects for lucky moments, which manufactures effects that are not there — a false positive, which is why the win vanished in the next full cohort.",
        cue: "Ask what the stopping rule selects for. Stopping on good news inflates false positives."
      },
      2: {
        tag: "Reached for an unrelated growth concept",
        label: "Applied an economics term to an inference question",
        why: "This choice assumed customer lifetime is at issue. Lifetime describes how long customers stay and belongs to unit economics; the question asks which inference risk the stopping behaviour raised.",
        cue: "Check whether the option describes a property of customers or a property of the test. Here it is the test."
      },
      3: {
        tag: "Reached for an unrelated growth concept",
        label: "Applied a network term to an inference question",
        why: "This choice assumed network density is relevant. Density describes how connected users are to one another; nothing about the test's stopping rule concerns connections between users.",
        cue: "Ask whether the option could be affected by when the team stopped looking. If not, it is not the answer."
      }
    },
    mock_cohort: {
      0: {
        tag: "Read a rising total as improving health",
        label: "Proposed the display that causes the problem",
        why: "This choice assumed larger totals clarify retention. Growing totals are exactly what conceals a retention decline, because new entrants replace departing ones inside a single number.",
        cue: "Ask whether the change separates entry from staying, or merges them. Totals merge them."
      },
      2: {
        tag: "Removed the denominator from a rate",
        label: "Discarded what makes a rate comparable",
        why: "This choice assumed denominators obscure the picture. A retention rate is only interpretable against the base it came from; removing the denominator leaves counts that grow with acquisition and cannot be compared across groups.",
        cue: "Keep the denominator visible. A number without its base cannot be compared to another period."
      },
      3: {
        tag: "Averaged away the comparison that reveals the decline",
        label: "Blended the groups that need to be compared",
        why: "This choice assumed one combined average is clearer. Combining all customers is the blended view that hides deterioration: older healthy cohorts and newer weak ones average into a stable-looking line.",
        cue: "When groups differ by age, average within age and compare across it. One overall average erases the pattern."
      }
    },
    mock_friction: {
      0: {
        tag: "Denied that sequential losses compound",
        label: "Treated small step losses as additive",
        why: "This choice assumed modest drops cannot produce a large total loss. Each step's loss applies to the users who remain, so seven small percentage losses multiply rather than add — which is how reasonable-looking steps end below one-third.",
        cue: "Multiply the step survival rates rather than adding the losses. Seven steps at 85% leaves under 32%."
      },
      2: {
        tag: "Placed the value moment at signup",
        label: "Defined the aha moment as account creation",
        why: "This choice assumed signup is the value event. Signup is the start of the path, and the case measures how few users reach first value after it; treating signup as aha would report this funnel as succeeding.",
        cue: "The aha moment is the first point where the product does something useful for the user, always after registration."
      },
      3: {
        tag: "Treated added explanation as a cure for friction",
        label: "Proposed more steps as the fix for too many steps",
        why: "This choice assumed explanation reduces cognitive load. Additional steps add to the path being multiplied through; explanation sometimes helps, but adding it as a step increases the very compounding the case describes.",
        cue: "Count the steps before and after the fix. A remedy that lengthens the path to value usually deepens the problem."
      }
    },
    mock_churn: {
      0: {
        tag: "Answered a retention question with reach measures",
        label: "Paired a count with an exposure measure",
        why: "This choice assumed totals and impressions separate revenue loss from timing. Impressions measure exposure before anyone becomes a customer, and a total customer count reports neither how much revenue left nor when groups disengaged.",
        cue: "Check that each half of the pair answers one half of the question: magnitude of loss, and its timing by group."
      },
      2: {
        tag: "Answered a retention question with channel activity",
        label: "Paired two campaign-activity measures",
        why: "This choice assumed email activity tracks churn. Sends and opens measure outbound activity and attention to it; neither states how much revenue was lost nor when customer groups stopped engaging with the product.",
        cue: "Ask whether the measure would change if revenue left and nothing else did. If not, it is not a churn measure."
      },
      3: {
        tag: "Answered a retention question with acquisition measures",
        label: "Paired two acquisition-side measures",
        why: "This choice assumed CAC and reach address churn. Both describe getting customers in; the question asks about revenue leaving and the timing of disengagement, which sits entirely on the retention side.",
        cue: "Place each metric on the funnel. Acquisition metrics cannot answer questions about departure."
      }
    },
    mock_payback: {
      0: {
        tag: "Made an arithmetic slip in the payback division",
        label: "Landed short of the payback point",
        why: "At ₹2,000 of monthly gross profit, four months recovers ₹8,000 against a ₹12,000 CAC, leaving ₹4,000 outstanding. Understating payback makes a channel look like it recycles cash sooner than it does.",
        cue: "Multiply your answer back by the monthly profit and check it equals CAC. Four months returns ₹8,000, not ₹12,000."
      },
      2: {
        tag: "Made an arithmetic slip in the payback division",
        label: "Overshot the payback point",
        why: "At ₹2,000 of monthly gross profit, ten months recovers ₹20,000 — well beyond the ₹12,000 CAC. Overstating payback can wrongly stall a channel that is in fact recovering cash acceptably.",
        cue: "Multiply your answer back by the monthly profit and check it equals CAC. Ten months returns ₹20,000."
      },
      3: {
        tag: "Made an arithmetic slip in the payback division",
        label: "Overshot the payback point substantially",
        why: "At ₹2,000 of monthly gross profit, twenty-four months recovers ₹48,000 against a ₹12,000 CAC — four times the amount that needs recovering.",
        cue: "Divide CAC by monthly gross profit, then check by multiplying back: 6 × ₹2,000 = ₹12,000."
      }
    },
    mock_motion: {
      0: {
        tag: "Applied a self-serve motion to a complex enterprise sale",
        label: "Matched a low-touch motion to a high-touch sale",
        why: "This choice assumed self-serve suits this product. Security review, multi-stakeholder approval, and custom integration all require human coordination that no self-serve flow performs, and the contract value supports paying for it.",
        cue: "Count the people who must approve. Multiple approvers and custom work indicate a sales-led motion."
      },
      2: {
        tag: "Applied a consumer mechanism to an enterprise sale",
        label: "Matched a consumer tactic to an enterprise buyer",
        why: "This choice assumed referral coupons apply. Coupons address individual consumer purchase decisions; they do not move a committee through security review and integration planning on a high-value annual contract.",
        cue: "Ask who the buyer is. Individual-incentive tactics do not address committee decisions."
      },
      3: {
        tag: "Declined to name a motion",
        label: "Left the acquisition motion unspecified",
        why: "This choice assumed no motion is required. The product still has to reach and convince a buying committee; declining to specify one leaves the security, approval, and integration steps in the case with no one carrying them.",
        cue: "If the case names steps a buyer must be taken through, some motion has to own them."
      }
    },
    ibm_aravind_apply: {
      0: {
        tag: "Reduced use of the constrained resource",
        label: "Idled capacity at the bottleneck",
        why: "This choice assumed spare staff time is the goal. The surgeon's operating time is the constrained step; reducing theatre use lowers throughput precisely where capacity is scarcest, which is the opposite of what specialisation achieves here.",
        cue: "Identify the scarce resource, then ask whether the action gives it more time on its constrained task or less."
      },
      1: {
        tag: "Extended specialisation past the quality boundary",
        label: "Reassigned the expert task itself",
        why: "This choice assumed any task can be delegated for throughput. The model separates standardisable preparation and follow-up for trained support staff; the surgical step stays with the specialist, because throughput gained by lowering clinical quality is not the gain the model claims.",
        cue: "Split tasks by whether they are standardisable. The expert step is the one that is not."
      },
      3: {
        tag: "Kept all work with the constrained expert",
        label: "Loaded routine work back onto the scarce specialist",
        why: "This choice assumed consistency requires one person doing everything. The consistency comes from standardising the routine work so trained staff perform it reliably; keeping it with the surgeon is the original constraint the case describes.",
        cue: "Ask whether consistency needs the same person or a defined procedure. Standardisation delivers it without the bottleneck."
      }
    },
    sclm_smoothing_apply: {
      0: {
        tag: "Set alpha to one and discarded the prior forecast",
        label: "Replaced the forecast with the latest actual",
        why: "This choice assumed the new forecast becomes the observed demand. That is smoothing with alpha of 1, which keeps no history at all; at alpha 0.25 only a quarter of the 20-unit error is taken up, giving 105.",
        cue: "Check what alpha is. It is the fraction of the error you absorb — 0.25 means a quarter of it, not all of it."
      },
      1: {
        tag: "Adjusted the forecast against the error",
        label: "Moved the forecast in the wrong direction",
        why: "This choice moves down when actual demand came in above the forecast. The error is +20, so the correction is upward; moving to 95 increases the gap the update exists to close.",
        cue: "Compute the signed error first: actual − forecast. A positive error always corrects upward."
      },
      2: {
        tag: "Treated the forecast as unresponsive to error",
        label: "Left the forecast unchanged",
        why: "This choice assumed smoothing does not react to the latest result. Exponential smoothing is defined by responding to forecast error; alpha controls how strongly, and at 0.25 the forecast still moves by 5 units.",
        cue: "Ask whether alpha is zero. Any alpha above zero moves the forecast toward the observed demand."
      }
    }
  };

  // The catalogue "connect" questions reuse three fixed distractors verbatim.
  var SHARED_BY_TEXT = {
    // Each misconception ships in three lengths so the connect questions do not all
    // put the correct bridge at the same length rank (see CONNECT_WRONG in
    // `t6_catalog.js`). The phrasings are interchangeable; the diagnosis is not.
    "It works independently of the people, the constraints, and the decisions around it.": SHARED.isolation,
    "It works in exactly the same way independently of the people, the constraints, and the decisions that surround it.": SHARED.isolation,
    "It works in exactly the same way regardless of the people involved, the constraints in force, and the decisions being taken around it at the time.": SHARED.isolation,
    "It improves one local measure, so effects elsewhere in the system stop mattering.": SHARED.localOptimum,
    "It improves one local measure, so whatever happens elsewhere in the connected system no longer matters here at all.": SHARED.localOptimum,
    "It improves one local measure, so whatever happens elsewhere in the connected system can be treated as somebody else's problem to solve later on.": SHARED.localOptimum,
    "Once this choice is made, later evidence should not change the decision.": SHARED.evidenceClosed,
    "Once this choice has been made, later evidence should not be allowed to reopen or change the decision.": SHARED.evidenceClosed,
    "Once this choice has been made, later evidence should not be allowed to reopen it, because a decision that keeps moving is not really a decision.": SHARED.evidenceClosed
  };

  window.T6_AUTHORED_DIAGNOSES = {byQuestion: AUTHORED, byText: SHARED_BY_TEXT};
})();
