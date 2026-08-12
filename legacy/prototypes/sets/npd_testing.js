window.MOCK = {
  id: "npd_testing",
  subject: "NPD",
  title: "Use-Testing, Teams & Services (PSS)",
  blurb: "Does it survive contact with real users — and real org politics? Alpha/beta/gamma, the team structures that ship products, and servitisation.",
  items: [
    {type:"mcq", tag:"alpha/beta", t:"Alpha vs Beta testing — which is correct?",
     o:["Alpha = external customers; Beta = internal team","Alpha = internal team in controlled conditions; Beta = real external users in natural conditions","Both use external users","Both are internal"], c:1,
     why:"Alpha = internal/controlled (catch obvious bugs early); Beta = real users in the wild (surface real-world usage gaps). <b>Trap:</b> the classic reversal — Alpha is in-house first, Beta is out-in-the-world second."},
    {type:"mcq", tag:"gamma", t:"Gamma testing is:",
     o:["Internal-only testing","Final verification that the product meets its specifications before full launch","Live A/B testing","Lead-user testing"], c:1,
     why:"Gamma = the final conformance check against spec (important in regulated/safety-critical products). Sequence: Alpha (internal) → Beta (real users) → Gamma (spec verification). Each answers a different readiness question."},
    {type:"mcq", tag:"org structure", t:"For a radical breakthrough project needing speed and tight integration, the best NPD structure is usually:",
     o:["Functional","Lightweight matrix","Autonomous / 'tiger' team (dedicated, co-located)","No structure"], c:2,
     why:"Spectrum (depth↔integration): functional → lightweight matrix → heavyweight matrix → autonomous team. Radical work suits heavyweight/autonomous (fast, integrated); incremental work suits functional/lightweight (deep expertise, lower cost). <b>Use it:</b> match structure to project type."},
    {type:"mcq", tag:"heavyweight PM", t:"A heavyweight matrix structure features:",
     o:["A coordinator with little authority","A powerful product manager with broad authority driving integration while members keep functional ties","Fully independent departments","No product manager"], c:1,
     why:"The heavyweight PM has the clout to force cross-functional integration and protect product integrity — stronger than a lightweight coordinator who can only nudge. <b>Use it:</b> it's the structure that best delivers internal+external integrity."},
    {type:"mcq", tag:"PSS use", t:"A firm keeps ownership of a washing machine and charges per wash cycle. PSS type?",
     o:["Product-oriented","Use-oriented","Result-oriented","None"], c:1,
     why:"Use-oriented: provider owns the asset, customer pays for access/use — customer avoids capex, provider keeps the asset risk. (Product-oriented = you own it + services; Result-oriented = you buy the outcome.)"},
    {type:"mcq", tag:"PSS result", t:"Rolls-Royce's 'Power by the Hour' — airlines pay per hour of engine thrust, not for the engine — is:",
     o:["Product-oriented","Use-oriented","Result-oriented","Asset-sharing"], c:2,
     why:"Result-oriented: the customer buys a guaranteed outcome; the provider owns and maintains everything and is paid for results. The deepest form of servitisation — provider bears all the risk and is incentivised on uptime."},
    {type:"mcq", tag:"servitisation", t:"Servitisation deepens along the order:",
     o:["Result → Use → Product","Product-oriented → Use-oriented → Result-oriented","Use → Product → Result","They're unordered"], c:1,
     why:"Ownership and risk shift from the customer to the provider as you move product → use → result. <b>Why it matters:</b> moving down this path turns one-off sales into recurring revenue and aligns the provider with the customer's outcome — but demands the provider absorb more risk."},
    {type:"written", t:"Distinguish <b>alpha, beta and gamma</b> testing, and explain why a firm runs them in sequence.",
     looking:[
       "Alpha = internal team, controlled conditions — catches obvious defects early",
       "Beta = real external users in their natural environment — surfaces real-world usage problems",
       "Gamma = final verification against specifications before full launch",
       "Sequence logic: controlled-internal → real-external → final-conformance; each answers a different question, escalating realism and cost"
     ],
     model:"These are sequential product-use tests, each answering a different readiness question. Alpha testing is done internally by the firm's own team under controlled conditions to catch obvious defects cheaply and early. Beta testing then places the product with real external users in their natural environment, surfacing real-world usage problems, edge cases and acceptance issues that a lab can't reveal. Gamma testing is a final verification that the finished product conforms to its specifications and requirements before full launch — especially important for regulated or safety-critical products. Firms run them in sequence because realism and cost rise at each step: it's far cheaper to fix internal bugs at alpha than to discover them in the field, so you de-risk progressively — controlled-internal, then real-external, then final-conformance — before committing to a full market launch.",
     use:"Any product-use-testing question; pairs with the funnel (use-testing sits between prototyping and market testing). Don't confuse alpha (internal) with beta (external)."}
  ]
};
