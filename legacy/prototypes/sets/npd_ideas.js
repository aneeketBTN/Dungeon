window.MOCK = {
  id: "npd_ideas",
  subject: "NPD",
  title: "Ideas, Concept Testing & Evaluation",
  blurb: "Where ideas come from and how to kill the weak ones cheaply on paper — Kano, QFD, ATAR and the conjoint trade-off, plus the hypothetical-bias trap.",
  items: [
    {type:"mcq", tag:"lead users", t:"Lead users — a prime source of breakthrough ideas — are found:",
     o:["Among laggards","At the leading edge of the market, in analogous/advanced markets, and among extreme users","Only inside the firm","Among average customers"], c:1,
     why:"Lead users face needs months/years ahead and benefit from solving them, so they innovate first. <b>Use it:</b> instead of asking the average customer (who only knows today's needs), study those living tomorrow's problems — their hacks become your products."},
    {type:"mcq", tag:"Kano", t:"A car's brakes: absent → customers furious; present → merely neutral. Kano category?",
     o:["Delighter","One-dimensional","Must-be","Indifferent"], c:2,
     why:"Must-be (threshold): expected, so presence earns no praise but absence kills you. <b>Use it:</b> secure all must-bes first, compete on one-dimensionals (more = better), then differentiate with delighters — which decay into expectations over time."},
    {type:"mcq", tag:"Buyer Utility Map", t:"The Blue Ocean Buyer Utility Map scans utility across:",
     o:["Price vs cost","The six buyer-experience stages: purchase, delivery, use, supplements, maintenance, disposal","Competitors only","The funnel stages"], c:1,
     why:"It hunts for untapped utility across the whole experience cycle, not just 'use'. <b>Use it:</b> blue-ocean ideas often hide in the stages rivals ignore (e.g. easy disposal, painless maintenance)."},
    {type:"mcq", tag:"QFD", t:"In QFD's House of Quality, the 'roof' (correlation matrix) shows:",
     o:["Customer importance","How technical requirements correlate — conflicts and synergies","Competitor prices","Sales forecasts"], c:1,
     why:"WHATs (customer needs) map to HOWs (specs) via 9/3/1 scores → technical weights; the roof flags spec-vs-spec tensions (lighter vs stronger). <b>Use it:</b> QFD translates the Voice of the Customer into engineering priorities and surfaces trade-offs early."},
    {type:"mcq", tag:"ATAR", t:"ATAR: Market 2M, Awareness 50%, Trial 40%, Availability 80%, Repeat 50%. Demand? <span class='f'>Demand = Mkt × A × T × Av × R</span>",
     o:["160,000","400,000","80,000","320,000"], c:0,
     why:"2,000,000 × 0.5 × 0.4 × 0.8 × 0.5 = 160,000. All factors are fractions; multiply through. <b>Use it:</b> ATAR shows where demand leaks — a weak link (say 40% trial) caps everything, telling you which lever (awareness? availability?) to fix."},
    {type:"mcq", tag:"conjoint", t:"Conjoint analysis is used to:",
     o:["Test a prototype's durability","Decompose customers' overall preferences into the part-worth value of each attribute, revealing trade-offs","Forecast the share price","Design the factory"], c:1,
     why:"By showing full bundles, it infers how much each attribute (price, feature, brand) really contributes — exposing the trade-offs people make, not just what they claim matters. <b>Use it:</b> it's how you price features and pick the optimal configuration."},
    {type:"mcq", tag:"hypothetical bias", t:"A survey says 78% 'would buy' a smart bottle, but real trial is 12%. The core lesson:",
     o:["The survey was too small","Stated-intent concept tests overstate behaviour (hypothetical bias); behaviour-based tests predict trial better","Pricing was wrong","Beta testing would fix it"], c:1,
     why:"People over-claim purchase intent when nothing is at stake. <b>Use it:</b> trust a simulated/real test market over 'would you buy?' surveys, and never make a launch call on stated intent alone — this is the classic concept-vs-market-test trap."},
    {type:"written", t:"Explain the <b>Kano model's</b> three core categories with an example each, and how a PM should use it to prioritise features.",
     looking:[
       "Must-be: absent → anger, present → neutral (e.g. brakes)",
       "One-dimensional: more = better, roughly linear (e.g. battery life)",
       "Delighter / attractive: absent → neutral, present → delight (e.g. surprise upgrade)",
       "Prioritisation: secure must-bes first, compete on one-dimensionals, differentiate with delighters",
       "Note delighters erode into expectations over time"
     ],
     model:"Kano classifies features by how satisfaction responds to performance. Must-be (basic) features are expected: their absence causes anger but their presence only prevents dissatisfaction — e.g. brakes or a seatbelt. One-dimensional (performance) features scale linearly: more is better, like battery life or fuel economy. Delighters (attractive) are unexpected features that create delight when present but don't dissatisfy when absent, like a surprise free upgrade. A PM should sequence investment accordingly: first guarantee every must-be (a gap here is fatal), then compete on the one-dimensionals customers actively compare, and finally differentiate with a delighter or two. Crucially, delighters decay into expectations over time (today's wow becomes tomorrow's baseline), so the delighter pipeline must be continuously refreshed.",
     use:"Feature-prioritisation and roadmap questions; pairs naturally with QFD (translate the prioritised needs into specs)."}
  ]
};
