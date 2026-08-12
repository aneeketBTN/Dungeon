window.MOCK = {
  id: "macro_monetary",
  subject: "Macroeconomics",
  title: "Monetary Policy, Bonds & Transmission",
  blurb: "The RBI's steering wheel: how a single repo-rate change ripples through bonds, banks and your EMI — and where the wheel disconnects from the road.",
  items: [
    {type:"mcq", tag:"bonds", t:"A ₹1,000 G-Sec with an 8% coupon trades at ₹800. Its current yield is: <span class='f'>Yield = Coupon ÷ Price</span>",
     o:["8%","10%","12.5%","6.4%"], c:1,
     why:"Coupon = ₹80/yr (fixed). 80/800 = 10%. Price fell, yield rose — <b>bond prices and yields move inversely</b>. The yield, not the coupon, is the market's live read on the true cost of borrowing."},
    {type:"mcq", tag:"yield signal", t:"Why do economists watch the bond yield rather than the coupon?",
     o:["The coupon changes daily","The yield is the market-discovered, live cost of money; the coupon is fixed at issue","Coupons are secret","Yields never change"], c:1,
     why:"The coupon is locked when the bond is issued; the yield moves with price every day. <b>Use it:</b> rising yields = market pricing in higher rates/risk — a real-time stress gauge for borrowing costs across the economy."},
    {type:"mcq", tag:"repo / arbitrage", t:"When the RBI raises the repo rate, other rates (G-Secs, loans) tend to rise too because:",
     o:["The RBI sets every rate by law","Arbitrage links the rates — like connected water tanks, raising one lifts the others","Banks are forced to copy it","It only affects overnight rates"], c:1,
     why:"The repo is the overnight 'anchor'; arbitrage transmits it up the curve (the connected-tanks analogy). <b>Use it:</b> this is the start of the transmission chain — repo up → funding costs up → lending rates/EMIs up."},
    {type:"mcq", tag:"transmission", t:"Which is NOT one of the five monetary-policy transmission channels?",
     o:["Interest rate","Asset price (wealth effect)","Expectations (forward guidance)","Exchange-control channel"], c:3,
     why:"The five: Interest rate · Credit · Asset price (wealth effect) · Balance sheet (collateral) · Expectations. <b>Use it:</b> in a 'trace the effect' question, walk at least two channels and note one can be sticky/fail (e.g. the credit channel if banks won't pass it on)."},
    {type:"mcq", tag:"output gap", t:"Actual GDP is below Potential GDP. This negative output gap signals:",
     o:["Overheating — hike rates","Spare capacity / slack — room to stimulate","Hyperinflation","A trade surplus"], c:1,
     why:"<span class='f'>Output gap = Actual − Potential</span>. Negative = the economy runs below its '8-hr-sleep' capacity → unemployment, weak demand → case for easing. Positive = overheating → case for tightening. It's the RBI's core diagnostic for its dual mandate."},
    {type:"mcq", tag:"Fisher", t:"Your loan is 7% and inflation is 7%. The real cost of borrowing is: <span class='f'>Real = Nominal − Inflation</span>",
     o:["14%","7%","0% — essentially free","−7%"], c:2,
     why:"Fisher identity: 7−7 = 0%. <b>Why it matters:</b> the <b>real</b> rate is the true economic cost. High nominal rates can be cheap in real terms during high inflation — always convert to real before judging whether money is 'tight' or 'loose'."},
    {type:"mcq", tag:"limits", t:"In a deep slump, the RBI cuts rates to ~0% but the economy stays stuck. The next tool is:",
     o:["Raising the CRR","Quantitative Easing (QE) — buying assets to inject liquidity directly","Devaluing the rupee","Doing nothing — policy is out of options"], c:1,
     why:"At the <b>Zero Lower Bound</b>, conventional rate cuts die. QE injects liquidity by buying bonds/assets. <b>Pair this with the other limit:</b> against a supply shock, rate moves also fail ('can't grow tomatoes'). Knowing the limits is what separates a top answer from a textbook one."},
    {type:"written", t:"The RBI turns hawkish and hikes the repo rate by 50 bps. <b>Trace</b> how this reaches household consumption, and name one channel that might fail to fire.",
     looking:[
       "Repo up → banks' cost of funds up → G-Sec yields & lending rates/EMIs up (arbitrage)",
       "Higher EMIs cut disposable income; costlier loans deter car/home borrowing → C falls → AD & inflation ease",
       "Reinforcing channels: asset-price/wealth effect (stocks/property dip), expectations (hawkish guidance dampens spending)",
       "A channel that can fail: the credit channel — if banks are risk-averse or transmission is sticky, rates don't pass through",
       "Note the lags"
     ],
     model:"A repo hike raises banks' cost of funds, and via arbitrage this lifts G-Sec yields and lending rates, pushing up EMIs. Higher EMIs cut households' disposable income and make new car/home borrowing costlier, so consumption falls, dragging aggregate demand and inflation down (with lags). Two channels reinforce this: the asset-price channel (rates up → stocks/property soften → negative wealth effect → less spending) and the expectations channel (a hawkish stance pre-emptively cools demand). The channel that may fail is the credit channel: if banks are risk-averse or transmission is sticky, they may not pass the hike through, so household borrowing costs barely move and the policy underperforms.",
     use:"The template for any 'trace the policy' question: name the mechanism step-by-step, add a reinforcing channel, and flag a failure point + lags. That structure earns the top band."}
  ]
};
