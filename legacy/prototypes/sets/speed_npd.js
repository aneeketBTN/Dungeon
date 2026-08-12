window.MOCK = {
  id: "speed_npd",
  subject: "NPD",
  title: "⚡ NPD Formula Speedrun",
  blurb: "NPD has just two calculations — ATAR and QFD weighting (both 1-mark Sec A items). Drill each from 4 angles until they're automatic.",
  items: [
    // ---- ATAR ----
    {type:"mcq", tag:"ATAR", t:"Market 2M, Awareness 50%, Trial 40%, Availability 80%, Repeat 50%. Demand? <span class='f'>Demand = M × A × T × Av × R</span>",
     o:["80,000","160,000","320,000","400,000"], c:1, why:"2,000,000 × 0.5 × 0.4 × 0.8 × 0.5 = 160,000. All factors are fractions; multiply through."},
    {type:"mcq", tag:"ATAR", t:"Market 1M, Awareness 60%, Trial 30%, Availability 90%, Repeat 50%. Demand?",
     o:["81,000","162,000","54,000","108,000"], c:0, why:"1,000,000 × 0.6 × 0.3 × 0.9 × 0.5 = 81,000."},
    {type:"mcq", tag:"ATAR (diagnose)", t:"Awareness 90%, Trial 20%, Availability 95%, Repeat 80%. Which lever most limits demand?",
     o:["Awareness","Trial (only 20%)","Availability","Repeat"], c:1, why:"In a multiplicative model the lowest fraction caps everything. Trial at 20% is the bottleneck — fix conversion/sampling, not more ads."},
    {type:"mcq", tag:"ATAR (interpret)", t:"You double Availability from 40% to 80%, holding the rest constant. Demand:",
     o:["Stays the same","Doubles","Halves","Rises 10%"], c:1, why:"Because ATAR is multiplicative, doubling any single fraction doubles total demand — which is why finding the weakest link matters."},
    // ---- QFD ----
    {type:"mcq", tag:"QFD weighting", t:"A spec scores 9 with a need rated 4, and 3 with a need rated 5. Technical weight? <span class='f'>Σ(importance × 9/3/1)</span>",
     o:["36","51","45","27"], c:1, why:"(4 × 9) + (5 × 3) = 36 + 15 = 51."},
    {type:"mcq", tag:"QFD weighting", t:"A spec scores 9 (need rated 3), 3 (need rated 2), and 1 (need rated 5). Technical weight?",
     o:["38","45","30","54"], c:0, why:"(3 × 9) + (2 × 3) + (5 × 1) = 27 + 6 + 5 = 38."},
    {type:"mcq", tag:"QFD (relative %)", t:"A technical requirement has weight 60; the grand total of all weights is 300. Its relative importance? <span class='f'>weight ÷ grand total</span>",
     o:["20%","60%","5%","30%"], c:0, why:"60 / 300 = 20%. Relative % ranks which specs to prioritise in design."},
    {type:"mcq", tag:"QFD (scores)", t:"In QFD's House of Quality, the relationship-strength scores used are:",
     o:["1 / 2 / 3","9 / 3 / 1 (strong / moderate / weak)","10 / 5 / 1","9 / 6 / 3"], c:1, why:"The 9/3/1 scale deliberately over-weights strong links so dominant specs stand out."}
  ]
};
