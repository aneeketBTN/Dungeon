window.MOCK = {
  id: "macro_fiscal",
  subject: "Macroeconomics",
  title: "Fiscal Policy & Growth",
  blurb: "The government's spending-and-taxing lever — when it multiplies, when it crowds out, and what actually makes a nation richer over decades.",
  items: [
    {type:"mcq", tag:"fiscal multiplier", t:"MPC = 0.75. The government spends an extra ₹100 crore. Total impact on GDP? <span class='f'>Multiplier = 1 ÷ (1 − MPC)</span>",
     o:["₹100 crore","₹400 crore","₹133 crore","₹750 crore"], c:1,
     why:"1/(1−0.75) = 4 → 100 × 4 = ₹400 crore. Each rupee is re-spent down a chain at rate MPC. <b>Use it:</b> the higher the propensity to consume, the bigger the bang per rupee of stimulus — so stimulus targeted at lower-income (high-MPC) groups multiplies more."},
    {type:"mcq", tag:"crowding out", t:"Heavy government borrowing can 'crowd out' private investment because:",
     o:["It bans private firms from borrowing","It pushes up interest rates, making private borrowing costlier","It always lowers rates","It boosts exports"], c:1,
     why:"More public borrowing competes for the same pool of savings → rates rise → some private investment is displaced. <b>Use it:</b> it's the key caveat to fiscal stimulus — the multiplier can be partly offset if crowding out is strong (typically worse near full employment)."},
    {type:"mcq", tag:"debt sustainability", t:"Government debt-to-GDP tends to stabilise when:",
     o:["Interest rate r exceeds growth g","Growth g exceeds interest rate r","The deficit is zero","Inflation is zero"], c:1,
     why:"If <b>g &gt; r</b>, the economy outgrows its interest bill and debt/GDP drifts down (sustainable). If <b>r &gt; g</b>, it spirals. <b>Use it:</b> this is THE test for 'is this deficit dangerous?' — it's about the r-vs-g gap, not the deficit's size alone."},
    {type:"mcq", tag:"FRBM", t:"The FRBM Act is about:",
     o:["The RBI's inflation target","Legislated limits on the fiscal deficit to preserve 'fiscal space'","Foreign-exchange reserves","Bank capital ratios"], c:1,
     why:"Fiscal Responsibility &amp; Budget Management — caps deficits so debt stays sustainable and leaves room to spend countercyclically in downturns. <b>Use it:</b> 'fiscal space' = the buffer to act in a crisis; running deficits in booms burns that buffer."},
    {type:"mcq", tag:"countercyclical", t:"Keynesian countercyclical fiscal policy means the government should:",
     o:["Spend more in booms, less in slumps","Spend more in slumps, consolidate in booms","Always run a balanced budget","Never intervene"], c:1,
     why:"Lean against the cycle: stimulate when private demand is weak, pull back when it's strong. <b>Trap:</b> pro-cyclical policy (spending in booms) overheats and wastes fiscal space — the opposite of what's needed."},
    {type:"mcq", tag:"growth engine", t:"Over the long run, sustained per-capita growth comes mainly from:",
     o:["Adding more workers","Technological progress / productivity","Accumulating more capital alone","Higher prices"], c:1,
     why:"Capital alone hits <b>diminishing returns</b>; only technology shifts the production frontier out, escaping the Malthusian trap. <b>Use it:</b> long-run growth questions are supply-side — answer with productivity, innovation, human capital — not demand stimulus."},
    {type:"mcq", tag:"fiscal vs monetary", t:"Against a banking-crisis demand slump where rate cuts aren't reaching firms, the better tool is often:",
     o:["More rate cuts regardless","Fiscal stimulus that bypasses the broken banking channel","Raising the CRR","Tightening fiscal policy"], c:1,
     why:"When monetary transmission is broken (credit channel jammed), <b>fiscal policy injects demand directly</b> — government spending doesn't need banks to lend. This is why fiscal and monetary policy are complements, deployed by situation."},
    {type:"written", t:"'A fiscal deficit is always dangerous.' Critically evaluate, using the idea of <b>debt sustainability (r vs g)</b>.",
     looking:[
       "Reject the absolutism: deficits can be benign or dangerous depending on context",
       "Debt/GDP stabilises when g > r; spirals when r > g",
       "Benign case: productive deficits (infrastructure) that raise future g, with g > r",
       "Dangerous case: deficits funding consumption when r > g, or eroding fiscal space",
       "Mention crowding out and the value of FRBM-style discipline / countercyclical use"
     ],
     model:"The claim is too absolute. A deficit's danger depends on debt sustainability, captured by r vs g. If the economy's growth rate g exceeds the interest rate r on its debt, the country outgrows its interest bill and debt-to-GDP drifts down — the deficit is sustainable, especially if it funds productive investment (infrastructure, human capital) that raises future growth. It becomes dangerous when r exceeds g, so debt compounds faster than the economy, or when deficits merely fund consumption and burn the 'fiscal space' needed for future crises. Large deficits can also crowd out private investment by lifting interest rates. So deficits are a tool: benign when productive and when g > r, dangerous when they erode sustainability — which is why frameworks like the FRBM Act and countercyclical discipline matter.",
     use:"Any deficit/debt question: anchor on r vs g, distinguish productive vs consumption spending, and mention crowding out + fiscal space. Avoid blanket 'deficits are bad'."}
  ]
};
