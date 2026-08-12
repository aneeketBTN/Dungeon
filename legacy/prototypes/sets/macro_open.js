window.MOCK = {
  id: "macro_open",
  subject: "Macroeconomics",
  title: "Open Economy, Forex & the Trilemma",
  blurb: "Once the borders open, foreign forces amplify every shock. Master the two anchors (IRP & PPP), the trilemma, and the 1991 lesson.",
  items: [
    {type:"mcq", tag:"IRP", t:"Indian rates are 7%, US rates 3%. By Interest Rate Parity, the rupee should:",
     o:["Appreciate ~4%","Depreciate ~4% to equalise returns","Stay fixed","Depreciate 10%"], c:1,
     why:"IRP is the no-arbitrage condition: if you earn 4% more in India, the rupee must be expected to <b>depreciate ~4%</b> or everyone would pile into rupees. <b>Use it:</b> rate differentials predict currency direction — higher local rates → expected depreciation (or capital inflows now)."},
    {type:"mcq", tag:"PPP", t:"Real exchange rate <span class='f'>e = E × (P_foreign ÷ P_domestic)</span>. If e &gt; 1, the rupee is:",
     o:["Overvalued","Undervalued — Indian goods are cheap for foreigners","Pegged","At fair value"], c:1,
     why:"e &gt; 1 means a US Big Mac buys more than one Indian Big Mac → India is cheap → buyers flock, demand rupees → appreciation pull back toward e = 1 (PPP). <b>Use it:</b> PPP is the long-run 'gravitational anchor' for currencies; IRP drives the short run."},
    {type:"mcq", tag:"trilemma", t:"The Impossible Trinity says a country can have at most TWO of:",
     o:["Low inflation, high growth, low unemployment","Fixed exchange rate, free capital mobility, independent monetary policy","Surplus, low debt, low taxes","FDI, FPI, reserves"], c:1,
     why:"Pick two of {fixed FX, free capital, independent monetary policy}. India runs a <b>managed float</b> — keeping monetary independence + capital mobility, sacrificing a fixed rate. <b>Use it:</b> any 'why can't India do X' currency question usually traces to the trilemma."},
    {type:"mcq", tag:"regime", t:"India's exchange-rate regime is best described as:",
     o:["A hard peg to the USD","A pure free float","A managed float — mostly market-driven, RBI smooths volatility","A currency board"], c:2,
     why:"India avoids the corners: it lets the rupee float but the RBI intervenes (using reserves) to smooth sharp swings. This is the trilemma 'middle ground' — keeping the two more valuable corners and accepting some volatility."},
    {type:"mcq", tag:"BOP", t:"In the balance of payments, <span class='f'>Current Account + Capital Account = 0</span>. A current-account deficit must be:",
     o:["Illegal","Financed by a capital-account surplus (foreign capital inflows)","Impossible","Funded by printing money"], c:1,
     why:"A CAD (importing more than exporting) is financed by foreigners sending in capital. <b>Quality matters:</b> FDI (factories) is 'patient'; FPI (stocks) is 'hot money' that can flee in a shock — financing a CAD with hot money is the fragile setup."},
    {type:"mcq", tag:"FDI vs FPI", t:"Why is financing a current-account deficit mainly with FPI risky?",
     o:["FPI is taxed heavily","FPI is 'hot money' that can exit overnight in a global risk-off shock","FPI raises domestic rates","FPI is illegal"], c:1,
     why:"Portfolio flows into stocks/bonds are finicky — they reverse fast when global sentiment sours, draining reserves and crashing the currency. <b>This is exactly the 1991 setup</b>: deficits funded by short-term flows + an external shock = crisis."},
    {type:"mcq", tag:"1991", t:"The 1991 crisis (gold airlifted to the Bank of England) was triggered by:",
     o:["A stock-market crash","Deficits funded by hot money + the Gulf War oil/remittance shock draining reserves to ~2 weeks of imports","Hyperinflation","A banking fraud"], c:1,
     why:"Fragile financing met an external shock; reserves collapsed to ~$1bn (~2 weeks of imports), forcing ~47 tonnes of gold as collateral. <b>The lesson it birthed:</b> the managed float + liberalisation. Crises often reform the system."},
    {type:"written", t:"The US sharply raises interest rates while India holds steady. Walk through the likely effect on the <b>rupee</b> and India's policy options.",
     looking:[
       "By IRP, the rate gap favours the US → capital flight from India to higher US yields",
       "Excess supply of rupees in the forex market → rupee depreciates",
       "Knock-on: imported inflation (costlier oil/imports), pressure on the CAD",
       "RBI options: hike rates to narrow the differential; sell USD reserves to smooth; (managed-float intervention)",
       "Trade-offs: hiking hurts domestic growth; intervention burns reserves — the trilemma bites"
     ],
     model:"Higher US rates widen the rate differential in the US's favour, so by Interest Rate Parity capital flows out of India chasing US yields. This 'capital flight' creates excess supply of rupees in the forex market, depreciating the currency. A weaker rupee then imports inflation (oil and imports cost more) and pressures the current-account deficit. India's options reflect the trilemma: the RBI can hike its own rates to narrow the differential and stem outflows, but that dampens domestic growth; or it can sell USD from reserves to smooth the depreciation under its managed float, but that burns the buffer; or accept some depreciation, which aids exports. In practice the RBI blends measured intervention with rate signals, balancing currency stability against growth.",
     use:"Any 'US Fed hikes / global rates rise' scenario: IRP → capital flight → depreciation → imported inflation → RBI trade-offs (rates vs reserves vs letting it slide), framed by the trilemma."}
  ]
};
