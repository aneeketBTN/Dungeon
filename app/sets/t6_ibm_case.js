/* Released IBM case pack — 21 August 2026.
 *
 * The supplied "caselet" is an open design brief. It names no organisation,
 * sector, place, beneficiary segment, evidence, constraint, or decision. The
 * disciplined response is therefore to state assumptions and create the missing
 * case before applying the course. This file keeps that interpretation, one
 * reusable working model, and ten paper-length questions together so Examiner and
 * Quick Notes cannot drift into different versions of the brief.
 *
 * The model figures below are explicitly design assumptions for practice. They are
 * not represented as national statistics or as facts supplied by the examiner.
 */
(function () {
  "use strict";

  var prompt = "Based on your understanding of the condition of the poor people in our country and the discussions on case studies that we studied during the course, create an inclusive business model.";

  var assumptions = [
    "The phrase ‘poor people’ is narrowed to small and marginal farmers; an inclusive model needs a specific underserved group, not a population label.",
    "The pilot covers 600 farmers across six villages. This is a planning assumption used to make the operating model testable, not a claimed national statistic.",
    "The binding problems are fragmented sale volumes, perishability, weak price information, irregular cash flow, limited storage, and costly access to dependable buyers.",
    "Farmers remain free to sell elsewhere. Inclusion is not created by replacing one compulsory intermediary with another.",
    "The first hub is a pilot. Expansion is conditional on farmer outcomes, service reliability, and unit economics surviving for two crop cycles."
  ];

  var model = {
    name: "Kisan Saathi Hubs",
    thesis: "A farmer-owned network of solar-powered village hubs that combines grading, storage, aggregation, transparent buyer linkage, and sale-linked payment into one financially sustainable service.",
    caselet: "Released prompt: “" + prompt + "”\n\nWorking assumptions for this practice paper: Kisan Saathi Hubs pilots six village hubs for 600 small and marginal farmers who currently face small sale lots, perishability, weak price information, irregular cash flow, limited storage, and poor buyer access. These are the candidate's design assumptions, not facts supplied by the examiner.\n\nAn FPO owns 65% of the local company and a mission-bound social enterprise owns 35%. The hubs provide grading, solar storage, transparent prices, aggregation, and access to several buyers. Farmers pay after sale through a disclosed storage fee and 2% commission, may sell elsewhere, and elect the directors who approve fees and grievances.\n\nConcessional first-loss capital funds the unproven pilot; normal fees must cover recurring operation. Expansion begins only after two crop cycles show reliable service, positive hub cash contribution, higher farmer prices after all fees, lower spoilage, prompt payment, and participation by the smallest farmers.",
    operatingModel: [
      "Farmer-owned local company: 65% FPO, 35% mission-bound social enterprise.",
      "Village delivery: grading, solar cold and dry storage, transparent prices, aggregation, and multi-buyer linkage.",
      "Affordability: pay after sale; disclosed storage charge and 2% transaction commission; no compulsory sale through the hub.",
      "Capital: catalytic first-loss support for the pilot, then impact debt only after demand and cash contribution are evidenced.",
      "Scale gate: two crop cycles, positive hub contribution, reliable uptime, better net farmer price after fees, lower spoilage, and inclusive participation.",
      "Impact design: baseline plus phased comparison; economic, capability, relationship, and environmental outcomes rather than activity counts alone."
    ]
  };

  function criterion(id, label, description) {
    return {id: id, label: label, description: description};
  }

  function commonRubric(ideas, evidence, integration, decision, limit) {
    return [
      criterion("diagnosis", "Governing ideas", ideas),
      criterion("evidence", "Use of the brief", evidence),
      criterion("integration", "How the ideas connect", integration),
      criterion("decision", "The design decision", decision),
      criterion("limit", "What would change it", limit)
    ];
  }

  var questions = [
    {
      id: "ibm_released_01_problem",
      module: 1,
      title: "Define the poverty problem before designing",
      conceptIds: ["ibm_disparity_gap", "ibm_poverty_dynamics", "ibm_smallholder_bottlenecks"],
      task: "Using disparity, poverty dynamics, and smallholder bottlenecks, identify Kisan Saathi's beneficiary and binding problem. Use the working assumptions and justify why the segment must be specific.",
      rubric: commonRubric(
        "Uses disparity, poverty dynamics, and smallholder bottlenecks to identify a structural constraint rather than treating poverty as a personality or a lack of effort.",
        "Uses the stated pilot assumptions: 600 farmers, six villages, fragmented lots, perishability, irregular cash flow, weak information, storage, and buyer access.",
        "Shows how the constraints reinforce one another and why a service aimed at one mechanism can improve income stability.",
        "Selects small and marginal farmers as the initial beneficiary and makes higher net price plus lower loss the governing outcome.",
        "Names evidence that could disprove the diagnosis, such as storage not being the binding constraint or tenant and landless households being excluded."
      ),
      exemplar: "The phrase ‘poor people’ is not a usable customer segment, because it groups together people facing different constraints and invites a model built on stereotype rather than mechanism. Kisan Saathi therefore begins with small and marginal farmers in six pilot villages. The working assumptions identify a connected disparity: each farmer has a small, perishable lot, little capacity to wait for a better price, irregular cash flow, weak price information, and limited access to dependable buyers. Perishability then converts weak bargaining power into a forced sale; the urgent need for cash makes waiting even harder; and fragmented volumes prevent an individual farmer from meeting a buyer’s minimum lot. The business should therefore be judged on the gap it closes — net price after every fee, spoilage avoided, payment speed, and income stability — rather than on how many farmers register. Narrowing the first segment makes the inclusive ambition testable: the model can be designed around a specific constraint and a defined beneficiary instead of claiming to solve poverty in general. The diagnosis should still be tested before capital is committed. If baseline work shows that water, production quality, land tenure, or debt is the true binding constraint, a storage-and-market hub would be well intentioned but misdirected. Participation data must also reveal whether tenants, women farmers, and the smallest sellers can use the service rather than leaving it to larger landholders."
    },
    {
      id: "ibm_released_02_identity",
      module: 1,
      title: "Prove that the model is inclusive",
      conceptIds: ["ibm_inclusive", "ibm_profit_social_good", "ibm_zone_of_conflict"],
      task: "Using the definition of inclusive business and the zone of conflict, explain why Kisan Saathi qualifies. Give one change that would make it an ordinary commercial enterprise instead.",
      rubric: commonRubric(
        "Defines inclusive business through a primary underserved need plus financial sustainability, and uses the zone of conflict as the pressure test.",
        "Uses the 65% farmer ownership, voluntary sale rule, disclosed fees, operating-cost discipline, and patronage dividend rather than relying on the venture’s stated intentions.",
        "Explains why earned revenue protects continuity while governance protects the social objective when profit incentives diverge.",
        "Classifies the design as inclusive only while farmer outcomes remain primary and specifies what the organisation must refuse in the zone of conflict.",
        "Identifies mission drift that would change the classification, such as prioritising high-margin commercial storage or locking farmers into one buyer."
      ),
      exemplar: "Kisan Saathi is designed as an inclusive business, not CSR and not charity, because the underserved need sits inside the operating model and the service must cover its recurring cost. Its test is not whether the enterprise speaks about farmers; it is what the structure protects when farmer welfare and profit diverge. Farmer organisations own 65% of the local company, elected directors approve fees, selling through the hub remains voluntary, prices and weights are published, and surplus after maintenance can return as a patronage dividend. Those choices make farmer benefit part of the business architecture rather than an annual programme funded after profit. The fees are equally important. If normal operation depended permanently on a grant, service would end when the donor’s budget changed; earned revenue gives the social result continuity. The zone of conflict supplies the classification test. Suppose commercial traders offer much higher margins for using the cold room during the harvest period, displacing member produce, or one buyer offers volume in exchange for exclusive access to farmers. An ordinary commercial enterprise would be structured to take the higher return. Kisan Saathi remains inclusive only if it protects member access and choice while still refusing transactions that make the hub loss-making. If the organisation shifts capacity to wealthier customers, hides fees, or traps farmers inside one buyer relationship, the label should change regardless of its original intention."
    },
    {
      id: "ibm_released_03_ownership",
      module: 7,
      title: "Place farmers inside the value chain",
      conceptIds: ["ibm_fpo", "ibm_governance"],
      task: "Using FPO ownership and governance, identify the roles farmers play in Kisan Saathi. Assess the 65:35 structure and recommend one safeguard against value extraction.",
      rubric: commonRubric(
        "Uses FPO ownership, aggregation, market linkage, and governance rather than treating membership by itself as inclusion.",
        "Uses the 65:35 ownership, elected directors, published weights and prices, voluntary sale, grievance process, and patronage dividend.",
        "Connects collective volume to bargaining power and then shows why governance and professional capability determine who captures the surplus created.",
        "Keeps farmer majority control while giving the operating partner a bounded role in technology, maintenance, standards, and market access.",
        "Addresses elite capture, token voting, weak buyer capability, or a related-party transaction that could make nominal farmer ownership meaningless."
      ),
      exemplar: "Farmers are not only users of Kisan Saathi. They are suppliers, majority owners, and the source of the volume that makes the model economically possible. Aggregation converts many small lots into a buyer-sized consignment, but an FPO registration does not itself produce bargaining power or income. The value appears only when grading is consistent, buyers are actually linked, prices are transparent, and the organisation has enough working capability to complete the sale. The proposed 65:35 structure is defensible because farmer organisations retain control while the social enterprise contributes assets the collective does not automatically possess: equipment design, maintenance, operating standards, software, training, and buyer relationships. The minority partner’s return and authority should be written down, not left to goodwill. Farmer-elected directors must approve the fee schedule, related-party purchases, buyer exclusivity, and the rule for surplus. Published digital and physical price boards, receipts showing weight and deductions, an independent audit, a reachable grievance process, and the right to withdraw produce make control usable in practice. A maintenance reserve should come before dividends so ownership does not starve the asset that creates the value; remaining surplus can return according to patronage rather than land size. The structure fails if a few large growers dominate voting, if the social enterprise controls all information, or if membership grows without professional sales and quality capability."
    },
    {
      id: "ibm_released_04_value",
      module: 5,
      title: "Create shared value rather than transfer risk",
      conceptIds: ["ibm_shared_value", "ibm_backward_integration", "ibm_diageo_value_chain"],
      task: "Using shared value, explain how Kisan Saathi benefits both farmers and buyers. Identify one situation in which the model would transfer risk instead of creating value.",
      rubric: commonRubric(
        "Uses perishability and shared value to locate additional value, not a redistribution presented as creation.",
        "Uses grading, storage, buyer-sized aggregation, transparent deductions, several buyers, and the higher-net-price scale gate.",
        "Connects reduced spoilage and quality consistency to better farmer returns and lower buyer procurement cost or rejection.",
        "Makes the enterprise earn only when the farmer receives a better net outcome and keeps quality and price risk visibly allocated.",
        "Names a failure condition such as buyer concentration, rejection risk pushed wholly upstream, or fees absorbing the price improvement."
      ),
      exemplar: "The shared value in Kisan Saathi does not come from asking a buyer to pay more out of sympathy. It comes from changing the chain so that less value is destroyed. A farmer with a perishable, ungraded small lot is forced to accept the buyer available today; a buyer sourcing the same crop through many tiny transactions bears search, inspection, rejection, and coordination costs. The hub grades at source, stores the crop when an immediate sale would destroy bargaining power, aggregates to a contracted lot, and gives several buyers a consistent specification. Farmers can gain through lower spoilage and a higher net price after every disclosed fee, while buyers gain through reliable volume, fewer rejections, traceability, and lower procurement friction. Those gains arise from the same operating improvement. The model becomes extractive if it calls any firm saving ‘shared value’ while farmers carry the downside. A buyer contract should therefore state the grade, testing method, rejection procedure, payment period, and who bears a loss caused by equipment failure or changed specifications. The 2% commission and storage deduction should be reported beside the counterfactual local price so the enterprise cannot celebrate a higher headline sale while leaving the farmer worse off after fees. Several buyers and a voluntary exit protect choice. If one buyer dictates price, rejects after delivery, or transfers weather and quality risk entirely to members, the system has moved value to a stronger party rather than created it."
    },
    {
      id: "ibm_released_05_affordability",
      module: 5,
      title: "Design affordability as a system",
      conceptIds: ["ibm_bop", "ibm_single_serve", "ibm_empathy_credit", "ibm_selco"],
      task: "Using bottom-of-the-pyramid affordability and SELCO's product–finance–service system, explain why Kisan Saathi uses pay-after-sale pricing. State what else must work for the offer to remain affordable.",
      rubric: commonRubric(
        "Applies bottom-of-pyramid design and SELCO’s product–finance–service system to irregular cash flow rather than assuming a discount solves affordability.",
        "Uses the after-sale deduction, disclosed storage fee, 2% commission, voluntary exit, local maintenance, and sale-linked repayment logic.",
        "Shows how payment timing, livelihood benefit, equipment uptime, and trust jointly determine whether the service can actually be used.",
        "Supports pay-after-sale pricing with independent finance and a repair commitment while keeping capacity and total obligations visible.",
        "Names over-indebtedness, hidden deductions, delayed payment, or service downtime as conditions that would make the nominally affordable offer unusable."
      ),
      exemplar: "A low nominal fee does not make Kisan Saathi affordable if it is due before the farmer has cash, if using the hub delays payment, or if the cold room fails during the harvest. The design should therefore follow the same systems logic that made SELCO useful: the product, finance, income benefit, and service promise have to hold together. Here the service is grading, storage, and market access; payment is deducted only after sale; the livelihood benefit is the improvement in price and reduction in loss; and local trained technicians protect uptime. The disclosed 2% transaction commission is acceptable only if the receipt shows the local comparison price, every deduction, and the farmer’s final net return. The farmer must also be able to remove produce or sell elsewhere, because compulsory use turns affordability into dependency. Pilot capital should finance the shared asset rather than encourage each farmer to take equipment debt. Where short working-capital credit is needed, an independent lender should assess total obligations and repayment capacity, with repayment linked to the crop sale rather than a fixed instalment that ignores the income cycle. The model should monitor payment days and complaints as seriously as price. A service advertised as cheap becomes unusable when settlement is late, deductions are opaque, or no technician can restore cooling. Affordability is therefore the reliability of the whole transaction, not the size of one charge."
    },
    {
      id: "ibm_released_06_operations",
      module: 4,
      title: "Choose what is local and what is standard",
      conceptIds: ["ibm_decentralised_model", "ibm_asset_light", "ibm_replication", "ibm_decentralised_footprint"],
      task: "Using decentralisation and the asset-light model, state what Kisan Saathi should manage locally and what it should standardise centrally. Justify the division.",
      rubric: commonRubric(
        "Uses decentralisation, asset-light partnership, and controlled replication rather than treating local presence or central ownership as universally superior.",
        "Uses local operators and technicians, FPO majority ownership, common grading, service, audit, software, maintenance, and multi-buyer standards.",
        "Connects local trust and knowledge to access while connecting central standards to buyer confidence and equipment reliability.",
        "Assigns community-facing work and routine operation locally, while keeping certification, technology, training, maintenance escalation, data controls, and buyer contracting consistent.",
        "Names the signal that decentralisation is failing, such as inconsistent grades, uptime below the service promise, audit breaches, or partners excluding the smallest farmers."
      ),
      exemplar: "Kisan Saathi should be decentralised where local knowledge and trust determine access, and standardised where consistency determines whether the market will pay. The FPO-owned hub should recruit operators, schedule member access, maintain the local price board, hear grievances, and manage daily storage and dispatch. Local women and young people can be trained as technicians because a repair promise is not credible when the nearest capable person is many hours away. The central social enterprise should not own every village site merely to feel in control; that would make capital and management the ceiling on growth. Its role is to supply the equipment specification, grading protocol, software, operator certification, preventive-maintenance schedule, data safeguards, audit process, and buyer contracts that must mean the same thing across hubs. The model is therefore asset-light only in the correct sense: local capital and ownership can carry the physical footprint, while the standards buyers and farmers rely on are not relaxed. Replication should be licensed and conditional. A hub begins trading only after operator certification and service testing, and it can be suspended if weights, grades, fee receipts, uptime, or member-access rules fail audit. Decentralisation has failed when local adaptation changes the promise rather than the method — for example, a partner favours large growers, hides deductions, or grades differently to increase throughput. Local ownership creates reach; common standards keep that reach trustworthy."
    },
    {
      id: "ibm_released_07_economics",
      module: 8,
      title: "Make the financing logic honest",
      conceptIds: ["ibm_social_business", "ibm_impact_investing", "ibm_blended_finance", "ibm_giin_criteria"],
      task: "Using blended finance and impact investment, recommend how Kisan Saathi should finance the pilot and later expansion. Separate temporary subsidy from recurring operating viability.",
      rubric: commonRubric(
        "Separates social business, impact investment, and blended finance, including intentionality, measurement, and an expected return.",
        "Uses first-loss pilot capital, fee-funded operations, later impact debt, hub-level cash contribution, two crop cycles, and the explicit farmer outcome gates.",
        "Connects temporary risk-bearing to learning, then connects demonstrated demand and outcomes to repayable scale capital.",
        "Uses concessional money only for the unproven early risk and refuses expansion capital until both operating economics and inclusion hold.",
        "Names what would stop investment: permanent operating subsidy, return depending on opaque fees, weak additionality, or impact reporting based only on hubs and members."
      ),
      exemplar: "The pilot has a genuine financing problem: the first solar hub carries installation, demand, and operating risk that commercial lenders cannot price from evidence because the evidence does not yet exist. Blended finance can address that specific early risk through a grant or concessional first-loss layer, but it should not hide a business that loses money every time it operates. Storage, grading, and transaction fees must cover staff, energy, maintenance, insurance, data, and routine replacement once utilisation reaches the pilot threshold. The two crop cycles are therefore an investment gate, not a ceremonial pilot period. Only after the hub shows positive cash contribution, reliable service, and a higher net farmer price after every fee should later equipment use impact debt. An impact investor should test all parts of the mandate: the intended beneficiaries and outcome were stated before investment; the operating model measures who participates and what changes; management acts when inclusion or service drifts; and a financial return can be earned without defeating the purpose. The investor should also ask what its capital contributes beyond ordinary finance and who bears the first loss. It should refuse a plan whose return depends on exclusive buyers, hidden deductions, or permanent subsidy of normal operation. Counting hubs, members, or tonnes handled is not enough. Capital becomes reusable only when repayment comes from a service that improves the farmer’s net position, which is what makes the financial and social logic one model rather than two stories."
    },
    {
      id: "ibm_released_08_protection",
      module: 3,
      title: "Protect the model from mission dilution",
      conceptIds: ["ibm_mission_dilution", "ibm_responsible_lending", "ibm_governance"],
      task: "Using mission dilution, responsible finance, and governance, identify two ways Kisan Saathi could harm farmers and recommend one enforceable protection for each.",
      rubric: commonRubric(
        "Uses mission dilution, responsible finance, and governance as operating controls rather than as statements of values.",
        "Uses majority farmer ownership, approval of fees, voluntary sale, several buyers, total-obligation checks, transparent receipts, grievance handling, and participation reporting.",
        "Explains how growth incentives can gradually remove the protections that made the original model inclusive.",
        "Creates enforceable guardrails on pricing, lending, buyer concentration, access, data, board power, and related-party transactions.",
        "Names trade-offs and escalation rules, including when a hub, lender, buyer, director, or partner must be suspended."
      ),
      exemplar: "Kisan Saathi can harm farmers without ever announcing a change in mission. A growth target may reward tonnes handled, causing managers to favour large growers; a lender may use the hub’s transaction data to push credit beyond repayment capacity; one buyer may become dominant and demand exclusivity; and the social enterprise may raise fees or reserve capacity for commercial users to improve its return. Each move can make the dashboard look stronger while reducing farmer choice. The protections therefore have to be enforceable. Farmer-elected directors approve fees, buyer exclusivity, related-party purchases, and the surplus rule; receipts show weight, grade, benchmark price, and every deduction; farmers may withdraw produce or sell elsewhere; and the grievance channel must sit outside the local operator. No loan should be approved from crop value alone: total household obligations, the production cycle, and downside capacity have to be checked by an independent regulated lender. Buyer concentration should carry a ceiling and a published contingency. Participation reports should be split by farm size, gender, tenure, and village so 600 registered members cannot conceal control by the largest fifty. Directors should disclose conflicts and face term limits, while repeated audit or service breaches suspend the partner. These controls have costs — slower decisions, duplicated oversight, and sometimes a less profitable contract — but that is the zone in which the organisation proves what it is designed to protect. Scale that removes the screening and choice of the pilot is mission dilution, not successful replication."
    },
    {
      id: "ibm_released_09_scale",
      module: 4,
      title: "Scale only what has been proved",
      conceptIds: ["ibm_replication", "ibm_scaling_ceiling", "ibm_decentralised_footprint"],
      task: "Using controlled replication and the scaling ceiling, decide whether Kisan Saathi should enter thirty more villages after one harvest. State the go conditions and one stop condition.",
      rubric: commonRubric(
        "Uses the scaling ceiling and controlled replication to reject reach as sufficient evidence.",
        "Uses two crop cycles, positive hub cash contribution, higher net price after fees, lower spoilage, prompt payment, inclusive participation, reliable uptime, and common standards.",
        "Connects growth pace to the slowest capability the model cannot safely dilute: operator training, maintenance, buyer demand, governance, or working capital.",
        "Recommends a staged cluster expansion with explicit go, hold, and stop thresholds rather than thirty simultaneous launches.",
        "Names a cost of waiting and the evidence that would justify acceleration, while preserving the right to stop when outcomes or standards fail."
      ),
      exemplar: "Requests from thirty villages prove interest, not a repeatable model. Kisan Saathi should scale only after the pilot survives two crop cycles because one harvest cannot reveal seasonal demand, maintenance failure, buyer behaviour, repayment timing, or whether early participation was carried by unusually committed leaders. The go decision requires both halves of inclusion. At hub level, fees must cover recurring operation and contribute positively after normal maintenance; service uptime, grading consistency, and payment time must meet the promise. At farmer level, net price after all deductions must improve, spoilage must fall, and participation must include the smallest growers, women, and tenants rather than only the easiest volume. The scalable unit is not the cold room alone. It is a trained operator, local technician, audited governance process, common grading protocol, multi-buyer demand, transparent transaction, and maintenance response. Expansion should therefore move in a small geographic cluster where training, spares, audits, and buyer routes can be shared, then open the next cluster only after the first meets its gates. Thirty simultaneous sites would make central attention and service capacity the scaling ceiling. Waiting carries a real cost: villages continue distress selling and another intermediary may occupy the space. That supports a faster staged pipeline, not the removal of standards. Expansion stops when uptime falls, buyer concentration rises, unit cash weakens, or farmer net outcomes no longer hold; replication that loses the protective mechanism is a different model."
    },
    {
      id: "ibm_released_10_impact",
      module: 8,
      title: "Measure impact without mistaking activity for change",
      conceptIds: ["ibm_ted_london", "ibm_impact_measurement", "ibm_giin_criteria", "ibm_carbon_markets"],
      task: "Using output, outcome, impact, and Ted London's stakeholder lens, design a short scorecard for Kisan Saathi. Include one comparison that makes the impact claim credible.",
      rubric: commonRubric(
        "Uses output–outcome–impact, a credible counterfactual, Ted London’s stakeholders and dimensions, and impact-investment discipline.",
        "Uses the proposed baseline, phased comparison villages, farmer net price, spoilage, payment days, income stability, participation, uptime, energy, transport, and refrigerant measures.",
        "Shows how one operating change can create economic, capability, relationship, and environmental effects across farmers, buyers, workers, intermediaries, and communities.",
        "Selects a small decision-linked scorecard and a phased comparison rather than claiming attribution from before-and-after improvement alone.",
        "Names selection, displacement, leakage, elite capture, rebound transport, refrigerant, and reporting burden as limits to the impact claim."
      ),
      exemplar: "Kisan Saathi should report a chain of evidence rather than call every activity impact. A hub opened, 600 members registered, tonnes stored, operators trained, and solar units installed are outputs. Higher net price after all fees, lower spoilage, faster payment, more stable income, improved access to buyers, and reliable local work are outcomes. Impact is the part of those changes that would not have happened without the model. The phased rollout makes that claim more credible: collect the same baseline in participating villages and comparable villages waiting for the next phase, then compare how each changes across the same crop cycles while recording rainfall, crop mix, and market-price shocks. Ted London widens the scorecard. Farmers as sellers may gain income, skills, bargaining power, and stronger relationships; buyers may gain quality and reliability; local operators gain capability and status; displaced traders may lose income; and community effects may include who controls information and whether women and tenant farmers gain voice. Environmental claims also require discipline. Solar cooling and lower spoilage are benefits, but additional transport, refrigerant leakage, equipment disposal, and any rebound in production must be measured. The scorecard should stay small enough to change decisions: net farmer return, loss rate, payment days, participation by group, hub cash contribution, uptime, complaints, buyer concentration, energy source, and material emissions. If nobody can say what decision an indicator changes, collecting it is burden rather than accountability."
    }
  ];

  questions.forEach(function (question) {
    question.caselet = model.caselet;
    question.examOnly = true;
    question.releasedCase = true;
  });

  var lenses = [
    {number: 1, title: "Problem and beneficiary", cue: "Narrow ‘poor people’ to a specific group and name the structural constraint."},
    {number: 2, title: "Inclusive identity", cue: "Show which objective wins when social impact and profit diverge."},
    {number: 3, title: "Ownership and role", cue: "Place the beneficiary inside the value chain as producer, user, worker, or owner."},
    {number: 4, title: "Shared value", cue: "Identify new value and show who captures it and who carries the risk."},
    {number: 5, title: "Affordability", cue: "Join product, payment timing, finance, livelihood benefit, and dependable service."},
    {number: 6, title: "Operating model", cue: "Decide what stays local and what must remain standard across every site."},
    {number: 7, title: "Economics and capital", cue: "Separate temporary catalytic support from a viable operating model."},
    {number: 8, title: "Protection", cue: "Make mission, lending, governance, and choice safeguards enforceable."},
    {number: 9, title: "Scale", cue: "Replicate only after unit economics, outcomes, and service standards hold."},
    {number: 10, title: "Impact", cue: "Separate output, outcome, and attributable impact; include negative effects."
    }
  ];

  window.T6_IBM_RELEASED_CASE = {
    releasedAt: "2026-08-21T10:44:00+05:30",
    prompt: prompt,
    interpretation: "This is an open design brief, not a factual case. State assumptions, create one coherent model, and defend it with the course.",
    answerShape: [
      "Answer the question in the first sentence.",
      "State the assumption needed because the released brief omitted it.",
      "Apply one or two course ideas and explain the causal mechanism.",
      "Commit to the resulting model decision.",
      "Close with a risk, metric, or condition that would change the answer."
    ],
    assumptions: assumptions,
    model: model,
    lenses: lenses,
    questions: questions
  };

  window.T6_INTEGRATED = window.T6_INTEGRATED || {};
  window.T6_INTEGRATED.IBM = (window.T6_INTEGRATED.IBM || []).concat(questions);
})();
