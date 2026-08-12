window.MOCK = {
  id: "npd_design",
  subject: "NPD",
  title: "Design, Prototyping & Architecture",
  blurb: "Architecture is destiny — it locks in cost, variety and speed for life. Master the modular↔integral split and the six modularity types.",
  items: [
    {type:"mcq", tag:"integral", t:"An iPhone's internals — tightly interdependent, optimised as one whole — is:",
     o:["Modular architecture","Integral architecture","Platform architecture","Open architecture"], c:1,
     why:"Integral = coupled components tuned together → top performance, compact, but costly to change. <b>Use it:</b> choose integral when performance/efficiency dominate and you control the whole stack."},
    {type:"mcq", tag:"modular", t:"A desktop PC where you swap RAM, upgrade the GPU and keep the motherboard is:",
     o:["Integral","Modular","Vertical","Closed"], c:1,
     why:"Modular = standardised interfaces, mix-and-match, easy upgrades/variety. <b>Use it:</b> choose modular when customers want customisation/upgradability or you want many variants cheaply. <b>Trap:</b> never reverse modular and integral — modular = decoupled, integral = coupled."},
    {type:"mcq", tag:"6 modularity", t:"Lego — standardised connectors letting free configuration — is which modularity type?",
     o:["Bus","Sectional","Cut-to-fit","Component-swapping"], c:1,
     why:"Sectional = standard interfaces, freely configurable (Lego). The six types: component-swapping, component-sharing, <b>bus</b> (common backbone — PC motherboard), <b>sectional</b>, mix, <b>cut-to-fit</b> (adjust a dimension). <b>Use it:</b> Sec A loves 'name the modularity type'."},
    {type:"mcq", tag:"DFM", t:"Design for Manufacturing (DFM) means:",
     o:["Designing the marketing campaign","Designing the product so it's cheap and easy to manufacture","Manufacturing before design","Designing for the customer"], c:1,
     why:"DFM bakes manufacturability into the design (fewer parts, easier assembly) to cut cost and defects. <b>Why it matters:</b> a brilliant design that's a nightmare to build dies on cost — DFM is where the 10/100 rule pays off."},
    {type:"mcq", tag:"prototyping", t:"The main purpose of prototyping is to:",
     o:["Finalise marketing","Move from whiteboard to testable reality — learn and de-risk before committing to tooling","Replace concept testing","Set the price"], c:1,
     why:"Prototypes turn ideas into something you can test and fail cheaply (Gillette Mach3 invested heavily here). <b>Use it:</b> decide in-house (control, IP) vs vendor (speed, cost) prototyping based on the project's risk and secrecy."},
    {type:"mcq", tag:"Swatch/Shimano", t:"Swatch (interchangeable style modules) vs Shimano (tightly integrated gear systems) illustrate:",
     o:["B2B vs B2C","Modular vs integral design choices","Cheap vs expensive","Old vs new"], c:1,
     why:"Swatch leaned modular (variety/fashion) while Shimano went integral (performance). <b>Use it:</b> the same industry can split on architecture depending on whether customers value variety or peak performance."},
    {type:"mcq", tag:"integrity", t:"A product that's beautifully engineered internally but misreads what customers want has:",
     o:["High internal integrity, low external integrity","Low internal, high external","Neither","Both"], c:0,
     why:"Internal integrity = function↔structure coherence (engineering/org); external integrity = product↔customer fit. They're independent. <b>Use it:</b> great products (Clark &amp; Fujimoto's Honda example) achieve both, usually via a heavyweight PM linking engineering to customer meaning."},
    {type:"written", t:"Define and contrast <b>modular and integral</b> product architecture with an example of each, and explain the trade-off a firm weighs.",
     looking:[
       "Modular: standardised, decoupled interfaces — mix/match, swap, upgrade (e.g. PC, bicycle)",
       "Integral: tightly interdependent components optimised as a whole (e.g. iPhone, F1 car)",
       "Trade-off: modular = variety/customisation/upgradability/reuse, lower change-cost",
       "Integral = superior performance/compactness/efficiency, but costly to change",
       "Choose modular when variety/upgradability matters; integral when performance dominates"
     ],
     model:"Modular architecture uses standardised, decoupled interfaces so components can be mixed, matched, swapped and upgraded independently — a desktop PC or a bicycle. Integral architecture has tightly interdependent components optimised together as a single whole, maximising performance but making change expensive — an iPhone's internals or an F1 car. The trade-off: modularity buys variety, customisation, upgradability, component reuse and a lower cost of change, at some cost to peak performance and compactness; integrality buys superior, finely-tuned performance and efficiency, at the cost of flexibility and easy change. So a firm chooses modular when customers value variety or upgradability and it wants many variants cheaply, and integral when performance, size or efficiency are the decisive competitive dimensions and it controls the whole system.",
     use:"The flagship NPD compare question; also informs platform/variety strategy and supply-chain decisions. Never reverse the two poles."}
  ]
};
