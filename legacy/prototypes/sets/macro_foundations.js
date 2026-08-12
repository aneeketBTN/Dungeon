window.MOCK = {
  id: "macro_foundations",
  subject: "Macroeconomics",
  title: "Foundations & National Accounts",
  blurb: "The lens, the variables and the identities everything else is built on. Get these reflexes automatic and the rest of macro clicks.",
  items: [
    {type:"mcq", tag:"micro vs macro", t:"Macroeconomics is best described as:",
     o:["The study of a single firm's pricing","The aggregation of millions of micro decisions, via markets, over space and time","Only government policy","The same as accounting"], c:1,
     why:"Micro = the unit (you buying a sandwich). Macro = those decisions <b>aggregated</b> across an economy. Whenever a question feels huge, remember it's just micro choices summed up — that framing tells you which lever (demand or supply) is moving."},
    {type:"mcq", tag:"nominal vs real", t:"Nominal GDP grew 12% but real GDP grew 5%. The ~7% gap is:",
     o:["Population growth","Inflation — the GDP deflator","Export growth","A statistical error"], c:1,
     why:"Nominal = current prices (contaminated by inflation); real = constant base-year prices (pure quantity). <span class='f'>Nominal − Real ≈ inflation</span>. <b>Use it:</b> any time someone brags about 'GDP up 12%', ask how much is just higher prices vs real output."},
    {type:"mcq", tag:"real GDP", t:"Why do statisticians compute Real GDP using base-year prices?",
     o:["To make the number bigger","To 'fix the price vector' and isolate the change in quantity produced","Because nominal data is unavailable","To match other countries"], c:1,
     why:"You can't add 2kg apples + 1kg oranges, so we value everything in money — but money's value drifts. Fixing prices strips out inflation so you see the <b>real quantity story</b>. That's why real GDP is the honest growth measure."},
    {type:"mcq", tag:"GDP identity", t:"In <span class='f'>Y = C + I + G + NX</span>, NX stands for:",
     o:["Net taxes","Net exports (Exports − Imports)","Nominal expenditure","New investment"], c:1,
     why:"The expenditure identity: total output = Consumption + Investment + Government + Net exports. <b>Use it:</b> when a shock hits, ask which letter it moves first (e.g. a global slump → NX falls) and trace from there."},
    {type:"mcq", tag:"savings = investment", t:"Rearranging the GDP identity gives the savings identity:",
     o:["S_private + S_public + S_foreign = I","C = I + G","Y = M × V","I = G − T"], c:0,
     why:"<span class='f'>(Y−C−T) + (T−G) + (Im−Ex) = I</span> → private + public + foreign savings fund all investment. <b>Why it matters:</b> it shows a current-account deficit (foreign savings) is literally financing domestic investment — trade and capital flows are two sides of one coin."},
    {type:"mcq", tag:"short vs long run", t:"Short-run economic fluctuations are mainly ___-driven; the long-run trend is ___-driven.",
     o:["supply; demand","demand; supply","tax; spending","import; export"], c:1,
     why:"Sleep analogy: your long-run capacity is ~8 hrs (supply/potential); a stressed Monday (6 hrs) or lazy Sunday (10 hrs) is short-run demand noise. <b>Use it:</b> short-run problems (recessions, booms) are demand problems → demand policy. Long-run growth is a supply story → productivity/technology."},
    {type:"mcq", tag:"frictions", t:"A Pizza Hut menu that doesn't change daily despite tomato-price swings is an example of:",
     o:["Hyperinflation","Price stickiness (menu costs)","Quantitative easing","Crowding out"], c:1,
     why:"Sticky prices + frictions (info gaps, credit constraints) are the 'sand in the gears' that let demand shocks move real output in the short run. If prices adjusted instantly, money would be neutral and recessions wouldn't bite — stickiness is WHY short-run policy works."},
    {type:"written", t:"Explain the difference between <b>nominal and real GDP</b>, and why the distinction matters when reading a country's growth figures.",
     looking:[
       "Nominal = output valued at current prices; contaminated by inflation",
       "Real = output valued at constant base-year prices; isolates quantity",
       "Nominal − Real growth ≈ inflation (the GDP deflator)",
       "Why it matters: high nominal growth can be mostly price rises, not more goods — real GDP is the honest welfare/output measure"
     ],
     model:"Nominal GDP values all production at today's prices, so it rises both when we make more goods AND when prices go up — it's 'contaminated' by inflation. Real GDP fixes prices at a base year, stripping out price changes to reveal the true change in quantity produced. The gap between nominal and real growth is essentially inflation (the GDP deflator). The distinction matters because a headline like '12% growth' can be mostly inflation: if prices rose 8%, real output only grew ~4%. Policymakers and investors must use real GDP to judge genuine improvement in output and living standards.",
     use:"Any growth/comparison question — strip inflation first. Also underpins 'is this boom real or just prices?' and cross-country comparisons (use real, PPP-adjusted figures)."}
  ]
};
