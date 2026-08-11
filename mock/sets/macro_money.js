window.MOCK = {
  id: "macro_money",
  subject: "Macroeconomics",
  title: "Money, Banking & Inflation",
  blurb: "Where money actually comes from, and what really moves prices. The difference between demand-pull and cost-push decides whether the RBI can even help.",
  items: [
    {type:"mcq", tag:"nature of money", t:"Modern money is fundamentally:",
     o:["Backed by gold in a vault","Fiat — debt/IOU backed by trust and the central bank's promise","Backed by foreign currency reserves only","Created by UPI"], c:1,
     why:"Money is debt: a banknote is a central-bank IOU. <b>Why it matters:</b> if money is trust, then <b>credibility is the RBI's real asset</b> — lose trust (hyperinflation) and the whole system unravels regardless of policy."},
    {type:"mcq", tag:"inside vs outside", t:"Roughly 95% of the money supply is:",
     o:["Physical cash printed by the RBI","Commercial-bank deposits (inside money)","Gold","Foreign reserves"], c:1,
     why:"Outside money = RBI cash (~5%); inside money = bank deposits (~95%), created when banks lend. <b>Use it:</b> this is why bank lending behaviour (the credit channel) matters so much — most 'money' is created by commercial banks, not the printing press."},
    {type:"mcq", tag:"UPI", t:"'UPI created huge amounts of new money in India.' This is:",
     o:["True — UPI prints money","False — UPI is a wrapper that moves existing bank deposits faster","True — UPI is outside money","False — UPI destroys money"], c:1,
     why:"UPI changes the <b>velocity</b> (speed) of money, not the <b>stock</b>. New money only comes from RBI base money or bank lending. <b>Trap:</b> exams love conflating 'faster payments' with 'more money' — don't fall for it."},
    {type:"mcq", tag:"money multiplier", t:"RBI injects ₹200 crore of base money; CRR is 4%. Maximum deposit creation? <span class='f'>Multiplier = 1 ÷ CRR</span>",
     o:["₹800 crore","₹5,000 crore","₹2,000 crore","₹200 crore"], c:1,
     why:"1/0.04 = 25 → 200 × 25 = ₹5,000 crore. Fractional-reserve banking multiplies the 'seed' into 'fruit'. <b>Use it:</b> a lower CRR → bigger multiplier → more credit creation — that's why CRR is a liquidity lever."},
    {type:"mcq", tag:"aggregates", t:"Which monetary aggregate includes fixed deposits (time deposits)?",
     o:["M0","M1","M3","None"], c:2,
     why:"M0 = base (reserves+currency); M1 = currency + demand deposits (spendable now); M3 = M1 + time deposits/FDs. Liquidity falls M0→M3. <b>Use it:</b> match the aggregate to the question — 'spendable now' = M1; 'broad savings' = M3."},
    {type:"mcq", tag:"CPI vs WPI", t:"The RBI's legal inflation target is based on:",
     o:["WPI wholesale prices","CPI retail prices (headline 4% ±2%)","Core inflation only","The GDP deflator"], c:1,
     why:"CPI = retail/consumer prices (what households feel); WPI = wholesale. RBI targets CPI <b>headline 4% ±2%</b> but watches <b>core</b> (ex food &amp; fuel) for the underlying trend, since food/fuel are volatile and supply-driven."},
    {type:"mcq", tag:"demand vs cost-push", t:"Tomato prices spike after a failed monsoon, pushing up inflation. This is:",
     o:["Demand-pull — too much spending","Cost-push (supply-side) inflation","Hyperinflation","Core inflation"], c:1,
     why:"A supply shock shifts AS left — prices rise for cost reasons, not excess demand. <b>Critical implication:</b> raising rates can't 'grow tomatoes'; it only crushes demand while prices stay high → <b>stagflation</b>. Diagnosing demand-pull vs cost-push tells you whether the RBI can even help."},
    {type:"written", t:"A bad monsoon spikes food prices and headline inflation jumps. A commentator demands the RBI hike rates immediately. Using <b>demand-pull vs cost-push</b>, evaluate this.",
     looking:[
       "Identify this as a cost-push / supply shock (AS shifts left)",
       "Monetary policy works on the demand side (rate hikes cool C and I)",
       "Rate hikes can't increase food supply — they only suppress demand",
       "Risk = worsening output/stagflation; food inflation often self-corrects with the next harvest",
       "Nuance: act only if it un-anchors inflation expectations / spills into core"
     ],
     model:"This is cost-push (supply-side) inflation: a monsoon failure shifts aggregate supply left, raising prices for cost reasons, not excess demand. Monetary policy operates on the demand side — a rate hike raises borrowing costs and cools consumption and investment, but it cannot grow more tomatoes. So hiking would suppress already-adequate demand and hurt output while food prices stay high, risking stagflation. Food shocks are often transitory and reverse with the next harvest, so the textbook response is to look through them. The RBI should act only if the shock threatens to un-anchor inflation expectations or feed into core inflation — then a measured hike protects credibility.",
     use:"Any 'should the RBI hike?' scenario: first classify the shock. Demand-pull → tighten. Cost-push → monetary policy is near-powerless; look through it unless expectations slip."}
  ]
};
