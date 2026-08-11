(function(){
  "use strict";

  var STORAGE_KEY="dungeon.product.v1";
  var MAX_RESOLVE=2;

  var QUESTIONS=[
    {
      id:"macro_nominal_real",
      type:"mcq",
      kind:"Recall · MCQ",
      concept:"Foundations · nominal vs real",
      prompt:"India’s <b>nominal GDP</b> grew 15% while <b>real GDP</b> grew 7%. The gap of roughly 8% primarily represents:",
      options:["Export growth","Inflation captured by the GDP deflator","Population growth","The fiscal deficit"],
      correct:1,
      hint:"Ask what changes when output is valued at current prices rather than constant prices.",
      explanation:"Nominal growth includes price changes; real growth removes them. The approximate wedge between the two is inflation measured through the GDP deflator."
    },
    {
      id:"macro_money_multiplier",
      type:"mcq",
      kind:"Calculation · MCQ",
      concept:"Money · multiplier",
      prompt:"CRR is 4%. The RBI injects ₹500 crore of base money. What is the maximum deposit creation?<span class='formula'>Money multiplier = 1 ÷ CRR</span>",
      options:["₹2,000 crore","₹5,000 crore","₹12,500 crore","₹20,000 crore"],
      correct:2,
      hint:"Convert 4% to 0.04, find its reciprocal, then multiply by the base injection.",
      explanation:"1 ÷ 0.04 = 25. ₹500 crore × 25 = ₹12,500 crore. Lower reserve requirements increase the theoretical deposit multiplier."
    },
    {
      id:"macro_supply_shock",
      type:"written",
      kind:"Apply · short response",
      concept:"Policy · supply shocks",
      prompt:"Explain why raising interest rates cannot cleanly control inflation caused by a <b>supply shock</b>.",
      wordHint:"Aim for 50–80 words. You will compare your chain against a rubric.",
      hint:"Trace what higher rates change, then compare that with the original source of the price rise.",
      rubric:[
        "Monetary policy works primarily through aggregate demand.",
        "A supply shock shifts aggregate supply left; the inflation is cost-driven.",
        "Higher rates cannot directly restore oil, food, or productive capacity.",
        "Demand may fall without fixing supply, creating a stagflation trade-off."
      ],
      model:"Higher rates raise borrowing costs and reduce consumption and investment, so they cool aggregate demand. A supply shock, however, raises prices because productive capacity or an input has become scarce. Rates cannot produce more oil or food. Tightening can therefore reduce output while leaving the original supply constraint unresolved, creating a stagflationary policy dilemma."
    },
    {
      id:"macro_transmission_case",
      type:"choice",
      kind:"Case · choose one route",
      concept:"Open economy · transmission",
      prompt:"Choose one route through the case. Your selection changes the response prompt, not the reward.",
      choices:[
        {
          label:"Route A · Currency",
          prompt:"Oil prices surge, the rupee depreciates 8%, and the trade deficit widens. A minister says depreciation will automatically correct the deficit. Critically evaluate.",
          rubric:["Depreciation makes exports cheaper and imports dearer.","The J-curve means the deficit may initially worsen.","Oil demand is relatively inelastic.","Imported inflation can offset competitiveness gains.","Verdict: possible eventual help, but neither automatic nor immediate."],
          model:"Depreciation can improve competitiveness, but correction is not automatic. Existing contracts and higher rupee import costs can worsen the deficit first—the J-curve. India’s oil demand is relatively price-inelastic, so the import bill may remain high. Currency pass-through also raises domestic inflation and erodes part of the export advantage. Improvement depends on time and trade elasticities."
        },
        {
          label:"Route B · Household",
          prompt:"The RBI raises the repo rate by 50 basis points. Trace the effect on household consumption and name one channel that may fail.",
          rubric:["Repo increase raises bank funding and lending rates.","Higher EMIs reduce disposable income and new borrowing.","Consumption and aggregate demand fall with a lag.","A credit channel may fail if banks do not pass the change through."],
          model:"A repo increase raises banks’ funding costs and should lift lending rates and EMIs. Higher debt service reduces disposable income, while new home and car loans become less attractive, lowering consumption and aggregate demand with a lag. The credit channel can fail when banks absorb the change, remain risk-averse, or transmit policy rates only weakly."
        }
      ],
      hint:"Pick the route whose causal chain you can explain most confidently."
    },
    {
      id:"macro_trilemma",
      type:"mcq",
      kind:"Boss · MCQ",
      concept:"Open economy · trilemma",
      prompt:"The Impossible Trinity says a country cannot simultaneously maintain all three of:",
      options:[
        "Low inflation, high growth and low unemployment",
        "A fixed exchange rate, free capital mobility and independent monetary policy",
        "A fiscal surplus, trade surplus and low debt",
        "High FDI, low FPI and a stable currency"
      ],
      correct:1,
      hint:"The conflict appears when money can move across borders but the central bank also wants control over both its currency and domestic interest rate.",
      explanation:"A country can choose only two: a fixed exchange rate, free capital mobility, and independent monetary policy. India uses a managed float to retain meaningful policy independence alongside substantial capital mobility."
    }
  ];

  var COSMETICS={
    saffron:{id:"saffron",name:"Saffron Thread",short:"Saffron scarf",price:0,copy:"Warm against the cold threshold. Ari’s original signal."},
    blue:{id:"blue",name:"Threshold Mist",short:"Mistblue scarf",price:30,copy:"A cool blue thread that catches the Door’s cyan response."},
    green:{id:"green",name:"Rootbound Moss",short:"Moss scarf",price:30,copy:"A muted green woven from the color of old roots and patient return."}
  };

  var profile;
  var run=null;
  var currentResult=null;
  var marketSelection="saffron";
  var transitionLocked=false;
  var toastTimer=null;
  var scenarioMode=false;
  var scenarioTarget="home";

  var $=function(id){return document.getElementById(id);};
  var $$=function(selector,root){return Array.prototype.slice.call((root||document).querySelectorAll(selector));};

  function defaultProfile(){
    var prefersReduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return {
      version:1,
      player:{characterConfirmed:false,firstRunComplete:false,cosmetic:"saffron",owned:["saffron"]},
      economy:{embers:40},
      settings:{reducedMotion:!!prefersReduced},
      inProgress:null,
      lastResult:null,
      archive:[]
    };
  }

  function clone(value){return JSON.parse(JSON.stringify(value));}

  function loadProfile(){
    var base=defaultProfile();
    try{
      var parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(!parsed||parsed.version!==1) return base;
      base.player=Object.assign(base.player,parsed.player||{});
      base.economy=Object.assign(base.economy,parsed.economy||{});
      base.settings=Object.assign(base.settings,parsed.settings||{});
      base.inProgress=parsed.inProgress||null;
      base.lastResult=parsed.lastResult||null;
      base.archive=Array.isArray(parsed.archive)?parsed.archive.slice(0,8):[];
      if(!Array.isArray(base.player.owned)) base.player.owned=["saffron"];
      if(base.player.owned.indexOf("saffron")<0) base.player.owned.unshift("saffron");
      if(!COSMETICS[base.player.cosmetic]) base.player.cosmetic="saffron";
      return base;
    }catch(error){
      return base;
    }
  }

  function saveProfile(){
    if(scenarioMode) return;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(profile));}
    catch(error){toast("Local progress could not be saved in this browser.");}
  }

  function saveRun(){
    if(run&&run.status==="active") profile.inProgress=clone(run);
    saveProfile();
  }

  function showScreen(id,focus){
    $$(".screen").forEach(function(screen){screen.classList.toggle("active",screen.id===id);});
    document.body.setAttribute("data-screen",id);
    window.scrollTo(0,0);
    updateGlobalUi();
    if(focus!==false){
      window.setTimeout(function(){
        var target=document.querySelector("#"+id+" h1, #"+id+" button, #"+id+" summary");
        if(target){target.setAttribute("tabindex","-1");target.focus({preventScroll:true});}
      },20);
    }
  }

  function updateGlobalUi(){
    $$("[data-embers]").forEach(function(node){node.textContent=String(profile.economy.embers);});
    $$("[data-insight]").forEach(function(node){
      node.textContent=String(run&&run.powerups?run.powerups.insight:1);
    });
    document.body.classList.toggle("reduced-motion",!!profile.settings.reducedMotion);
    applyCosmetic(profile.player.cosmetic);
  }

  function applyCosmetic(id){
    var cosmetic=COSMETICS[id]||COSMETICS.saffron;
    $$("[data-ari]").forEach(function(node){
      node.classList.remove("scarf-saffron","scarf-blue","scarf-green");
      node.classList.add("scarf-"+cosmetic.id);
    });
    if($("market-ari")){
      $("market-ari").classList.remove("scarf-saffron","scarf-blue","scarf-green");
      $("market-ari").classList.add("scarf-"+marketSelection);
    }
    if($("home-equipped")) $("home-equipped").textContent=cosmetic.short;
    if($("character-scarf-name")) $("character-scarf-name").textContent=cosmetic.name.replace(" Thread","");
  }

  function updateHome(){
    var label="Enter the Dungeon";
    var kicker="Before the first door";
    if(profile.inProgress&&profile.inProgress.status==="active"){
      label="Continue the run";
      kicker=(profile.inProgress.index+1)+" of "+profile.inProgress.questionIds.length+" questions · "+profile.inProgress.resolve+" Resolve";
    }else if(profile.player.characterConfirmed){
      label="Begin a Run";
      kicker=profile.lastResult?"The Door remembers your last route":"The Transmission Stair is ready";
    }
    $("home-primary-label").textContent=label;
    $("home-primary-kicker").textContent=kicker;

    if(profile.lastResult){
      var result=profile.lastResult;
      $("home-record").querySelector(".eyebrow").textContent=result.status==="failed"?"Last attempt":"Last completed route";
      $("home-record-title").textContent=result.title+" · "+result.percent+"%";
      $("home-record-copy").textContent=result.recommendation.copy;
    }else{
      $("home-record").querySelector(".eyebrow").textContent="The record is quiet";
      $("home-record-title").textContent="No completed ascent";
      $("home-record-copy").textContent="Your first run will leave a route in the Archive.";
    }
    updateGlobalUi();
  }

  function goHome(){
    updateHome();
    showScreen("home-screen");
  }

  function toast(copy){
    var node=$("toast");
    node.textContent=copy;
    node.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer=window.setTimeout(function(){node.classList.remove("show");},2600);
  }

  function showMarket(){
    marketSelection=profile.player.cosmetic;
    renderMarket();
    showScreen("market-screen");
  }

  function renderMarket(){
    $$(".cosmetic-card").forEach(function(card){
      var id=card.getAttribute("data-cosmetic");
      var owned=profile.player.owned.indexOf(id)>=0;
      card.classList.toggle("selected",id===marketSelection);
      card.querySelector("small").textContent=owned?(id===profile.player.cosmetic?"Equipped":"Owned"):COSMETICS[id].price+" Embers";
    });
    var item=COSMETICS[marketSelection];
    var owned=profile.player.owned.indexOf(item.id)>=0;
    var equipped=profile.player.cosmetic===item.id;
    $("market-item-name").textContent=item.name;
    $("market-item-copy").textContent=item.copy;
    $("market-state-label").textContent=equipped?"Equipped":owned?"Owned":"Preview";
    $("market-status").textContent="";
    $("market-action").disabled=false;
    if(equipped){
      $("market-action").textContent="Equipped";
      $("market-action").disabled=true;
    }else if(owned){
      $("market-action").textContent="Equip "+item.name;
    }else if(profile.economy.embers>=item.price){
      $("market-action").textContent="Buy and equip · "+item.price+" Embers";
    }else{
      $("market-action").textContent="Need "+(item.price-profile.economy.embers)+" more Embers";
      $("market-action").disabled=true;
    }
    applyCosmetic(profile.player.cosmetic);
    $("market-ari").classList.remove("scarf-saffron","scarf-blue","scarf-green");
    $("market-ari").classList.add("scarf-"+item.id);
    updateGlobalUi();
  }

  function marketAction(){
    var item=COSMETICS[marketSelection];
    if(!item||profile.player.cosmetic===item.id) return;
    var owned=profile.player.owned.indexOf(item.id)>=0;
    var message="";
    if(!owned){
      if(profile.economy.embers<item.price) return;
      profile.economy.embers-=item.price;
      profile.player.owned.push(item.id);
      message=item.name+" purchased. No learning rule changed.";
    }else{
      message=item.name+" equipped.";
    }
    profile.player.cosmetic=item.id;
    saveProfile();
    renderMarket();
    $("market-status").textContent=message;
    toast(item.name+" equipped.");
  }

  function createRun(questionIds,recovery){
    var ids=questionIds&&questionIds.length?questionIds.slice():QUESTIONS.map(function(_,i){return i;});
    return {
      id:"run-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),
      status:"active",
      title:recovery?"Recovery · The Transmission Stair":"The Transmission Stair",
      subject:"Macroeconomics",
      recovery:!!recovery,
      questionIds:ids,
      index:0,
      resolve:MAX_RESOLVE,
      maxResolve:MAX_RESOLVE,
      score:0,
      secure:0,
      partial:0,
      missed:0,
      streak:0,
      quest:{status:"active",current:0,target:2,rewardGranted:false,healed:false},
      powerups:{insight:1,compass:1,anchor:1},
      answered:false,
      selectedOption:null,
      selectedChoice:null,
      removedOption:null,
      anchorArmed:false,
      assistedCurrent:[],
      hintVisible:false,
      powerMessage:"",
      draft:"",
      awaitingGrade:null,
      questionStarted:Date.now(),
      responses:[],
      finalizedResultId:null
    };
  }

  function fixtureResponse(sourceIndex,score,assistance){
    var q=QUESTIONS[sourceIndex];
    var outcome=score>=1?"secure":score>0?"partial":"missed";
    var playerAnswer="";
    var correctAnswer="";
    var explanation="";
    var selectedIndex=null;
    if(q.type==="mcq"){
      selectedIndex=score>=1?q.correct:q.options.map(function(_,i){return i;}).filter(function(i){return i!==q.correct;})[0];
      playerAnswer=q.options[selectedIndex];
      correctAnswer=q.options[q.correct];
      explanation=q.explanation;
    }else if(q.type==="choice"){
      selectedIndex=0;
      playerAnswer=score>=1?q.choices[0].model:"The route needs a clearer causal chain.";
      correctAnswer=q.choices[0].model;
      explanation="Rubric: "+q.choices[0].rubric.join(" ");
    }else{
      playerAnswer=score>=1?q.model:"Interest rates reduce demand, but I did not fully connect this to the supply shock.";
      correctAnswer=q.model;
      explanation="Rubric: "+q.rubric.join(" ");
    }
    return {
      runIndex:sourceIndex,
      questionId:q.id,
      sourceIndex:sourceIndex,
      kind:q.kind,
      concept:q.concept,
      prompt:stripHtml(q.prompt),
      score:score,
      outcome:outcome,
      playerAnswer:playerAnswer,
      correctAnswer:correctAnswer,
      explanation:explanation,
      selectedIndex:selectedIndex,
      seconds:18+sourceIndex*4,
      assistance:assistance||[],
      protectedResolve:false,
      questCompleted:false,
      feedbackTitle:outcome==="secure"?"Secure — the next step holds.":outcome==="partial"?"Developing — part of the route holds.":"Missed — the current step fractures."
    };
  }

  function seedRun(scores,options){
    var settings=options||{};
    var seeded=createRun(null,!!settings.recovery);
    seeded.responses=scores.map(function(score,index){
      return fixtureResponse(index,score,settings.assistanceAt===index?["Insight"]:[]);
    });
    seeded.score=scores.reduce(function(sum,score){return sum+score;},0);
    seeded.secure=scores.filter(function(score){return score>=1;}).length;
    seeded.partial=scores.filter(function(score){return score>0&&score<1;}).length;
    seeded.missed=scores.filter(function(score){return score<=0;}).length;
    seeded.resolve=typeof settings.resolve==="number"?settings.resolve:Math.max(0,MAX_RESOLVE-seeded.missed);
    seeded.index=typeof settings.index==="number"?settings.index:Math.min(scores.length,seeded.questionIds.length-1);
    seeded.answered=!!settings.answered;
    seeded.streak=typeof settings.streak==="number"?settings.streak:0;
    seeded.quest.current=Math.min(seeded.streak,seeded.quest.target);
    if(settings.questComplete){
      seeded.quest.status="complete";
      seeded.quest.current=seeded.quest.target;
      seeded.quest.rewardGranted=true;
      seeded.quest.healed=!!settings.questHealed;
    }
    if(settings.powerupsEmpty) seeded.powerups={insight:0,compass:0,anchor:0};
    if(settings.preselect){
      var current=QUESTIONS[seeded.questionIds[seeded.index]];
      if(current.type==="mcq"){
        seeded.selectedOption=settings.preselect==="correct"?current.correct:current.options.map(function(_,i){return i;}).filter(function(i){return i!==current.correct;})[0];
      }
    }
    seeded.questionStarted=Date.now();
    return seeded;
  }

  function applyScenario(name){
    scenarioTarget="home";
    profile=defaultProfile();
    profile.player.characterConfirmed=true;
    document.body.setAttribute("data-scenario",name);

    if(name==="fresh-new-player"){
      profile=defaultProfile();
      return;
    }
    if(name==="returning-with-save"){
      profile.inProgress=seedRun([1],{streak:1});
      return;
    }
    if(name==="market-empty"||name==="market-can-afford"){
      profile.economy.embers=name==="market-empty"?0:40;
      scenarioTarget="market";
      return;
    }
    if(name==="powerup-empty"){
      run=seedRun([],{powerupsEmpty:true});
      profile.inProgress=clone(run);
      scenarioTarget="run";
      return;
    }
    if(name==="quest-completes-with-heal"||name==="quest-completes-at-full-resolve"){
      run=seedRun([1],{
        resolve:name==="quest-completes-with-heal"?1:2,
        streak:1,
        preselect:"correct"
      });
      profile.inProgress=clone(run);
      scenarioTarget="run";
      return;
    }
    if(name==="last-question-correct"||name==="last-question-wrong-but-survives"){
      run=seedRun([1,1,1,.5],{
        index:4,
        resolve:2,
        preselect:name==="last-question-correct"?"correct":"wrong"
      });
      profile.inProgress=clone(run);
      scenarioTarget="run";
      return;
    }
    if(name==="resolve-exhausted"){
      run=seedRun([0],{resolve:1,preselect:"wrong"});
      profile.inProgress=clone(run);
      scenarioTarget="run";
      return;
    }
    if(name==="refresh-before-commit"){
      run=seedRun([],{preselect:"wrong"});
      profile.inProgress=clone(run);
      scenarioTarget="run";
      return;
    }
    if(name==="refresh-after-commit"){
      run=seedRun([1],{index:0,answered:true,resolve:2,streak:1});
      run.selectedOption=QUESTIONS[0].correct;
      profile.inProgress=clone(run);
      scenarioTarget="run";
      return;
    }
    if(name==="reduced-motion"){
      profile.settings.reducedMotion=true;
      return;
    }
    if(name==="all-correct"||name==="all-wrong"||name==="partial-and-assisted"){
      var scores=name==="all-correct"?[1,1,1,1,1]:name==="all-wrong"?[0,0]:[1,.5,0,1,.5];
      run=seedRun(scores,{
        resolve:name==="all-wrong"?0:name==="all-correct"?2:1,
        assistanceAt:name==="partial-and-assisted"?1:-1,
        questComplete:name==="all-correct",
        questHealed:false
      });
      run.status=name==="all-wrong"?"failed":"complete";
      currentResult=finalizeResult(run.status);
      scenarioTarget=name==="all-wrong"?"failure":"results";
    }
  }

  function beginRun(questionIds,recovery){
    if(transitionLocked) return;
    transitionLocked=true;
    run=createRun(questionIds,recovery);
    profile.inProgress=clone(run);
    saveProfile();
    $("enter-run").classList.add("opening");
    $("portal-wash").classList.add("active");
    window.setTimeout(function(){
      $("enter-run").classList.remove("opening");
      $("portal-wash").classList.remove("active");
      transitionLocked=false;
      showScreen("run-screen");
      renderQuestion();
    },900);
  }

  function resumeRun(){
    if(!profile.inProgress||profile.inProgress.status!=="active"){
      profile.inProgress=null;
      saveProfile();
      goHome();
      return;
    }
    run=clone(profile.inProgress);
    run.questionStarted=Date.now();
    showScreen("run-screen");
    renderQuestion();
    toast("Your place on the stair was restored.");
  }

  function currentQuestion(){
    if(!run) return null;
    return QUESTIONS[run.questionIds[run.index]];
  }

  function renderQuestion(){
    var q=currentQuestion();
    if(!q) return;
    $("run-subject").textContent=run.subject+" · "+(run.recovery?"Recovery":"Practice");
    $("run-chapter").textContent=run.title;
    $("question-kind").textContent=q.kind;
    $("question-count").textContent="Question "+(run.index+1)+" of "+run.questionIds.length;
    $("question-concept").textContent=q.concept;
    $("question-title").innerHTML=q.prompt;
    $("floor-label").textContent="Floor "+String(run.index+1).padStart(2,"0");
    $("feedback").className="feedback";
    $("feedback").innerHTML="";
    $("next-question").classList.add("hidden");
    $("commit-note").textContent="Choose a response, then commit it.";
    $("power-status").textContent=run.powerMessage||"";
    renderAnswer(q);

    if(run.awaitingGrade){
      renderRubric(q,run.awaitingGrade.response);
    }else if(run.answered){
      renderResolved(q,lastResponse());
    }else{
      if(!run.questionStarted) run.questionStarted=Date.now();
      if(run.hintVisible){
        $("feedback").className="feedback show partial";
        $("feedback").innerHTML="<h3>Insight</h3><p>"+escapeHtml(q.hint)+"</p>";
      }
      $("run-note-copy").textContent=run.anchorArmed?"Anchor armed. A miss will not cost Resolve.":"The world reacts after you commit.";
    }
    updateRunUi();
    saveRun();
  }

  function renderAnswer(q){
    var area=$("answer-area");
    area.innerHTML="";
    if(q.type==="mcq"){
      q.options.forEach(function(option,index){
        var button=document.createElement("button");
        button.type="button";
        button.className="option";
        button.setAttribute("data-option",String(index));
        button.innerHTML="<span class='option-key'>"+"ABCD"[index]+"</span><span>"+option+"</span><span class='answer-mark'></span>";
        if(run.selectedOption===index) button.classList.add("selected");
        if(run.removedOption===index){button.classList.add("removed");button.disabled=true;button.setAttribute("aria-label",option+" — removed by Compass");}
        if(!run.answered&&!run.awaitingGrade){
          button.addEventListener("click",function(){
            run.selectedOption=index;
            saveRun();
            renderQuestion();
          });
        }else{
          button.disabled=true;
        }
        area.appendChild(button);
      });
      if(!run.answered&&!run.awaitingGrade){
        var commit=document.createElement("button");
        commit.type="button";
        commit.className="button primary answer-commit";
        commit.id="commit-answer";
        commit.disabled=run.selectedOption===null;
        commit.textContent=run.selectedOption===null?"Select an answer":"Commit answer";
        commit.addEventListener("click",commitMcq);
        area.appendChild(commit);
      }
      return;
    }

    if(q.type==="written"){
      area.innerHTML="<div class='written-tools'><span>"+q.wordHint+"</span><span id='word-count'>0 words</span></div><textarea class='written-input' id='written-response' placeholder='Build the causal chain…'></textarea><button class='button primary answer-commit' id='submit-written' type='button'>Check against rubric</button>";
      var textarea=$("written-response");
      textarea.value=run.awaitingGrade?run.awaitingGrade.response:run.draft||"";
      updateWordCount(textarea);
      if(run.answered||run.awaitingGrade){
        textarea.disabled=true;
        $("submit-written").remove();
      }else{
        textarea.addEventListener("input",function(){
          run.draft=textarea.value;
          updateWordCount(textarea);
          saveRun();
        });
        $("submit-written").addEventListener("click",function(){
          var response=textarea.value.trim();
          if(!response){textarea.focus();return;}
          run.draft=response;
          run.awaitingGrade={response:response};
          saveRun();
          renderQuestion();
        });
      }
      return;
    }

    var grid=document.createElement("div");
    grid.className="choice-grid";
    q.choices.forEach(function(choice,index){
      var button=document.createElement("button");
      button.type="button";
      button.className="choice-button"+(run.selectedChoice===index?" selected":"");
      button.innerHTML="<b>"+choice.label+"</b>"+choice.prompt;
      button.disabled=run.answered||!!run.awaitingGrade;
      button.addEventListener("click",function(){
        run.selectedChoice=index;
        run.draft="";
        saveRun();
        renderQuestion();
      });
      grid.appendChild(button);
    });
    area.appendChild(grid);
    if(run.selectedChoice!==null){
      var wrap=document.createElement("div");
      wrap.innerHTML="<div class='written-tools'><span>Attempt only the selected route · 100–150 words</span><span id='word-count'>0 words</span></div><textarea class='written-input' id='written-response' placeholder='Build the causal chain…'></textarea>";
      area.appendChild(wrap);
      var responseBox=$("written-response");
      responseBox.value=run.awaitingGrade?run.awaitingGrade.response:run.draft||"";
      updateWordCount(responseBox);
      if(run.answered||run.awaitingGrade){
        responseBox.disabled=true;
      }else{
        responseBox.addEventListener("input",function(){run.draft=responseBox.value;updateWordCount(responseBox);saveRun();});
        var submit=document.createElement("button");
        submit.type="button";
        submit.className="button primary answer-commit";
        submit.textContent="Check against rubric";
        submit.addEventListener("click",function(){
          var response=responseBox.value.trim();
          if(!response){responseBox.focus();return;}
          run.draft=response;
          run.awaitingGrade={response:response};
          saveRun();
          renderQuestion();
        });
        area.appendChild(submit);
      }
    }
  }

  function updateWordCount(textarea){
    var node=$("word-count");
    if(!node) return;
    var words=textarea.value.trim()?textarea.value.trim().split(/\s+/).length:0;
    node.textContent=words+" word"+(words===1?"":"s");
  }

  function commitMcq(){
    if(!run||run.answered||run.awaitingGrade||run.selectedOption===null) return;
    var q=currentQuestion();
    var selected=run.selectedOption;
    var score=selected===q.correct?1:0;
    commitResult(score,{
      playerAnswer:q.options[selected],
      correctAnswer:q.options[q.correct],
      explanation:q.explanation,
      selectedIndex:selected
    });
  }

  function rubricSource(q){
    return q.type==="choice"?q.choices[run.selectedChoice]:q;
  }

  function renderRubric(q,response){
    var source=rubricSource(q);
    var feedback=$("feedback");
    feedback.className="feedback show partial";
    feedback.innerHTML="<h3>Compare your chain</h3><ul>"+source.rubric.map(function(item){return "<li>"+item+"</li>";}).join("")+"</ul><p class='model'><b>Model:</b> "+source.model+"</p><div class='self-grade'><button class='button secondary' data-grade='0' type='button'>Missed the chain</button><button class='button secondary' data-grade='0.5' type='button'>Partly there</button><button class='button primary' data-grade='1' type='button'>Covered it securely</button></div>";
    $$("[data-grade]",feedback).forEach(function(button){
      button.addEventListener("click",function(){
        if(run.answered) return;
        var grade=Number(button.getAttribute("data-grade"));
        commitResult(grade,{
          playerAnswer:response,
          correctAnswer:source.model,
          explanation:"Rubric: "+source.rubric.join(" "),
          selectedIndex:run.selectedChoice
        });
      });
    });
    $("commit-note").textContent="Self-assess against the visible evidence.";
    $("run-note-copy").textContent="The response is not graded until you choose the matching rubric band.";
  }

  function commitResult(score,data){
    if(!run||run.answered) return;
    var q=currentQuestion();
    var elapsed=Math.max(1,Math.round((Date.now()-run.questionStarted)/1000));
    var outcome=score>=1?"secure":score>0?"partial":"missed";
    var protectedResolve=false;
    var questCompleted=false;

    if(outcome==="secure"){
      run.score+=1;
      run.secure+=1;
      run.streak+=1;
      profile.economy.embers+=6;
    }else if(outcome==="partial"){
      run.score+=score;
      run.partial+=1;
      run.streak=0;
      profile.economy.embers+=2;
    }else{
      run.missed+=1;
      run.streak=0;
      if(run.anchorArmed){
        protectedResolve=true;
      }else{
        run.resolve=Math.max(0,run.resolve-1);
      }
    }

    run.quest.current=Math.min(run.streak,run.quest.target);
    if(run.quest.status==="active"&&run.streak>=run.quest.target&&!run.quest.rewardGranted){
      run.quest.status="complete";
      run.quest.rewardGranted=true;
      if(run.resolve<run.maxResolve){
        run.resolve+=1;
        run.quest.healed=true;
      }
      profile.economy.embers+=12;
      questCompleted=true;
    }

    var title=outcome==="secure"?"Secure — the next step holds.":outcome==="partial"?"Developing — part of the route holds.":"Missed — the current step fractures.";
    if(protectedResolve) title+=" The Anchor preserved Resolve.";
    run.responses.push({
      runIndex:run.index,
      questionId:q.id,
      sourceIndex:run.questionIds[run.index],
      kind:q.kind,
      concept:q.concept,
      prompt:stripHtml(q.prompt),
      score:score,
      outcome:outcome,
      playerAnswer:data.playerAnswer,
      correctAnswer:data.correctAnswer,
      explanation:data.explanation,
      selectedIndex:data.selectedIndex,
      seconds:elapsed,
      assistance:run.assistedCurrent.slice(),
      protectedResolve:protectedResolve,
      questCompleted:questCompleted,
      feedbackTitle:title
    });

    run.answered=true;
    run.awaitingGrade=null;
    run.anchorArmed=false;
    run.hintVisible=false;
    run.powerMessage="";
    run.draft=data.playerAnswer||"";
    saveRun();
    renderQuestion();
    animateOutcome(outcome);
    if(questCompleted) toast(run.quest.healed?"Recovery Trial complete · Resolve restored + 12 Embers":"Recovery Trial complete · 12 Embers");
  }

  function lastResponse(){
    return run&&run.responses.length?run.responses[run.responses.length-1]:null;
  }

  function renderResolved(q,response){
    if(!response) return;
    if(q.type==="mcq"){
      $$(".option").forEach(function(button,index){
        button.disabled=true;
        button.classList.remove("selected");
        if(index===q.correct){
          button.classList.add("correct");
          button.querySelector(".answer-mark").textContent="✓";
        }else if(index===response.selectedIndex){
          button.classList.add("wrong");
          button.querySelector(".answer-mark").textContent="×";
        }else if(index!==run.removedOption){
          button.classList.add("dim");
        }
      });
    }
    var feedback=$("feedback");
    feedback.className="feedback show "+(response.outcome==="missed"?"wrong":response.outcome==="partial"?"partial":"");
    feedback.innerHTML="<h3>"+escapeHtml(response.feedbackTitle)+"</h3><p>"+escapeHtml(response.explanation)+"</p>"+(response.assistance.length?"<p class='model'><b>Assistance recorded:</b> "+escapeHtml(response.assistance.join(", "))+"</p>":"");
    $("next-question").classList.remove("hidden");
    $("next-question").innerHTML=run.resolve<=0?"Face the reset <span>→</span>":run.index+1>=run.questionIds.length?"Finish the run <span>→</span>":"Next step <span>→</span>";
    $("commit-note").textContent=response.outcome==="secure"?"Progress awarded: one secure step.":response.outcome==="partial"?"Progress awarded: half a step.":"No climb awarded for this answer.";
    $("run-note-copy").textContent=response.feedbackTitle;
  }

  function animateOutcome(outcome){
    var climber=$("climber");
    climber.classList.remove("secure-motion","partial-motion","missed-motion");
    void climber.offsetWidth;
    climber.classList.add(outcome+"-motion");
  }

  function usePower(power){
    if(!run||run.answered||run.awaitingGrade||!run.powerups||run.powerups[power]<=0) return;
    var q=currentQuestion();
    if(power==="insight"){
      run.powerups.insight-=1;
      addAssistance("Insight");
      run.hintVisible=true;
      run.powerMessage="Insight: "+q.hint;
      $("run-note-copy").textContent="Insight spent. This response will be marked assisted.";
    }else if(power==="compass"){
      if(q.type!=="mcq"){
        $("power-status").textContent="Compass is available only on multiple-choice routes.";
        return;
      }
      var candidates=q.options.map(function(_,i){return i;}).filter(function(i){return i!==q.correct&&i!==run.selectedOption&&i!==run.removedOption;});
      if(!candidates.length){
        $("power-status").textContent="No removable wrong route remains.";
        return;
      }
      run.powerups.compass-=1;
      run.removedOption=candidates[0];
      addAssistance("Compass");
      run.powerMessage="Compass removed one incorrect route. Assistance will appear in review.";
    }else if(power==="anchor"){
      run.powerups.anchor-=1;
      run.anchorArmed=true;
      addAssistance("Anchor");
      run.powerMessage="Anchor armed. A missed answer will keep its grade but cost no Resolve.";
      $("run-note-copy").textContent="Anchor armed before commitment.";
    }
    saveRun();
    renderQuestion();
  }

  function addAssistance(label){
    if(run.assistedCurrent.indexOf(label)<0) run.assistedCurrent.push(label);
  }

  function updateRunUi(){
    $("hearts").textContent=Array.from({length:run.maxResolve},function(_,i){return i<run.resolve?"♥":"♡";}).join(" ");
    $("hearts").setAttribute("aria-label",run.resolve+" of "+run.maxResolve+" Resolve remaining");
    $("insight-count").textContent=run.powerups.insight;
    $("compass-count").textContent=run.powerups.compass;
    $("anchor-count").textContent=run.powerups.anchor;
    var blocked=run.answered||!!run.awaitingGrade;
    $("power-insight").disabled=blocked||run.powerups.insight<=0;
    $("power-compass").disabled=blocked||run.powerups.compass<=0||currentQuestion().type!=="mcq";
    $("power-anchor").disabled=blocked||run.powerups.anchor<=0||run.anchorArmed;
    $("power-anchor").classList.toggle("armed",run.anchorArmed);
    $("run-progress-fill").style.width=(run.responses.length/run.questionIds.length*100)+"%";

    $("quest-progress").textContent=(run.quest.status==="complete"?run.quest.target:run.quest.current)+" / "+run.quest.target;
    $("quest-card").classList.toggle("complete",run.quest.status==="complete");
    if(run.quest.status==="complete"){
      $("quest-copy").textContent=run.quest.healed?"Completed · Resolve restored + 12 Embers":"Completed · Resolve was full, +12 Embers";
    }else{
      $("quest-copy").textContent="Secure 2 answers in a row · reward: Resolve if missing + 12 Embers";
    }
    updateStairs();
    updateGlobalUi();
  }

  function updateStairs(){
    var responses=run.responses;
    $$(".stair").forEach(function(step,index){
      step.classList.remove("secure","partial","missed","unused");
      if(index>=run.questionIds.length){
        step.classList.add("unused");
        step.style.opacity=".16";
        return;
      }
      step.style.opacity="";
      var response=responses[index];
      if(response) step.classList.add(response.outcome);
    });
    var awarded=responses.reduce(function(sum,response){return sum+response.score;},0);
    var normalized=Math.min(4,awarded*(5/Math.max(1,run.questionIds.length)));
    $("climber").style.left=(14+normalized*12)+"%";
    $("climber").style.bottom=(12+normalized*16)+"%";
    var status=lastResponse();
    var stateCopy=status?status.outcome+" outcome; "+awarded+" awarded steps":"no answer committed";
    $("stair-world").setAttribute("aria-label","The Ascent: "+stateCopy+", question "+(run.index+1)+" of "+run.questionIds.length);
  }

  function nextQuestion(){
    if(!run||!run.answered) return;
    if(run.resolve<=0){
      finishRun("failed");
      return;
    }
    run.index+=1;
    if(run.index>=run.questionIds.length){
      finishRun("complete");
      return;
    }
    run.answered=false;
    run.selectedOption=null;
    run.selectedChoice=null;
    run.removedOption=null;
    run.anchorArmed=false;
    run.assistedCurrent=[];
    run.hintVisible=false;
    run.powerMessage="";
    run.draft="";
    run.awaitingGrade=null;
    run.questionStarted=Date.now();
    saveRun();
    renderQuestion();
    $("question-title").focus({preventScroll:true});
  }

  function finishRun(status){
    run.status=status;
    currentResult=finalizeResult(status);
    profile.inProgress=null;
    saveProfile();
    if(status==="failed"){
      showScreen("failure-screen");
    }else{
      var fullSecure=run.secure===run.questionIds.length;
      $("summit-kicker").textContent=fullSecure?"Perfect route":"Run complete";
      $("summit-title").textContent=fullSecure?"The Door opens.":"The Door remembers the route.";
      $("summit-copy").textContent=fullSecure?"Every step held. The threshold answers with light.":"The route is complete. Uncertain steps remain visible in your record.";
      showScreen("summit-screen");
    }
  }

  function finalizeResult(status){
    if(run.finalizedResultId&&profile.lastResult&&profile.lastResult.id===run.finalizedResultId) return profile.lastResult;
    var responses=clone(run.responses);
    var percent=Math.round(run.score/Math.max(1,run.questionIds.length)*100);
    var weak=responses.filter(function(item){return item.score<1;});
    var recommendation=weak.length?{
      title:"Recover "+weak.length+" uncertain route"+(weak.length===1?"":"s"),
      copy:"A short run will contain only the concepts marked Developing or Missed.",
      questionIds:weak.map(function(item){return item.sourceIndex;})
    }:{
      title:"Repeat the full chapter",
      copy:"Every answer was secure. Repeat the route when you want an unassisted confirmation.",
      questionIds:run.questionIds.slice()
    };
    var result={
      id:"result-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),
      runId:run.id,
      status:status,
      title:run.title,
      subject:run.subject,
      date:new Date().toISOString(),
      questionCount:run.questionIds.length,
      percent:percent,
      secure:run.secure,
      partial:run.partial,
      missed:run.missed,
      assisted:responses.filter(function(item){return item.assistance.length>0;}).length,
      score:run.score,
      resolve:run.resolve,
      maxResolve:run.maxResolve,
      quest:clone(run.quest),
      powerupsUsed:{
        insight:1-run.powerups.insight,
        compass:1-run.powerups.compass,
        anchor:1-run.powerups.anchor
      },
      responses:responses,
      recommendation:recommendation
    };
    run.finalizedResultId=result.id;
    profile.lastResult=clone(result);
    profile.archive.unshift(clone(result));
    profile.archive=profile.archive.slice(0,8);
    profile.player.firstRunComplete=true;
    currentResult=result;
    saveProfile();
    return result;
  }

  function renderResults(){
    var result=currentResult||profile.lastResult;
    if(!result){goHome();return;}
    $("results-title").textContent=result.status==="failed"?"This attempt ended here.":"Here is what changed.";
    $("results-intro").textContent=result.status==="failed"?"The answered route is preserved. Use it before resetting.":"Learning evidence comes before vanity metrics.";
    $("result-score").textContent=result.percent+"%";
    $("secure-count").textContent=result.secure;
    $("partial-count").textContent=result.partial;
    $("missed-count").textContent=result.missed;
    $("assisted-count").textContent=result.assisted;
    var total=result.responses.reduce(function(sum,item){return sum+item.seconds;},0);
    $("average-time").textContent=Math.round(total/Math.max(1,result.responses.length))+" sec";
    $("resolve-left").textContent=result.resolve+" / "+result.maxResolve;
    $("recommendation-title").textContent=result.recommendation.title;
    $("recommendation-copy").textContent=result.recommendation.copy;
    $("recovery-run").textContent=result.recommendation.questionIds.length<result.questionCount?"Start recovery run →":"Repeat full chapter →";

    $("concept-breakdown").innerHTML=result.responses.map(function(item){
      return "<div class='break-row "+item.outcome+"'><span>"+escapeHtml(item.concept)+"</span><span>"+outcomeLabel(item.outcome)+"</span></div>";
    }).join("");
    var used=result.powerupsUsed;
    $("systems-breakdown").innerHTML=[
      systemRow("Recovery Trial",result.quest.status==="complete"?(result.quest.healed?"Completed · Resolve restored":"Completed · Embers awarded"):"Not completed"),
      systemRow("Insight",used.insight+" used"),
      systemRow("Compass",used.compass+" used"),
      systemRow("Anchor",used.anchor+" used")
    ].join("");
    $("answer-review").innerHTML="<div class='review-list'>"+result.responses.map(function(item,index){
      var assist=item.assistance.length?item.assistance.join(", "):"None";
      return "<article class='review-item "+item.outcome+"'>"+
        "<div class='review-item-head'><span>Question "+(index+1)+" · "+escapeHtml(item.kind)+"</span><strong>"+outcomeLabel(item.outcome)+"</strong></div>"+
        "<h3>"+escapeHtml(item.concept)+"</h3>"+
        "<div class='review-evidence'><div><b>Your response</b>"+escapeHtml(item.playerAnswer||"No response")+"</div><div><b>Correct / model response</b>"+escapeHtml(item.correctAnswer||"—")+"</div></div>"+
        "<p>"+escapeHtml(item.explanation)+"</p>"+
        "<div class='review-evidence'><div><b>Assistance</b>"+escapeHtml(assist)+(item.protectedResolve?" · Resolve protected":"")+"</div><div><b>Response time</b>"+item.seconds+" seconds</div></div>"+
      "</article>";
    }).join("")+"</div>";
    showScreen("results-screen");
  }

  function systemRow(label,value){
    return "<div class='system-row'><span>"+escapeHtml(label)+"</span><span>"+escapeHtml(value)+"</span></div>";
  }

  function outcomeLabel(outcome){
    return outcome==="secure"?"Secure":outcome==="partial"?"Developing":"Missed";
  }

  function startRecovery(){
    var result=currentResult||profile.lastResult;
    if(!result) return;
    beginRun(result.recommendation.questionIds,true);
  }

  function renderArchive(){
    var area=$("archive-content");
    if(!profile.archive.length){
      area.innerHTML="<article class='empty-record'><p class='eyebrow'>No routes recorded</p><h2>The Archive is waiting.</h2><p>Complete or exhaust a run to leave a local prototype record here.</p></article>";
      return;
    }
    area.innerHTML=profile.archive.map(function(result){
      return "<article class='archive-record'><div class='archive-record-head'><div><p class='eyebrow'>"+escapeHtml(formatDate(result.date))+" · "+escapeHtml(result.status)+"</p><h2>"+escapeHtml(result.title)+"</h2><p>"+escapeHtml(result.recommendation.copy)+"</p></div><strong class='archive-score'>"+result.percent+"%</strong></div><div class='archive-metrics'><span><small>Secure</small><b>"+result.secure+"</b></span><span><small>Developing</small><b>"+result.partial+"</b></span><span><small>Missed</small><b>"+result.missed+"</b></span><span><small>Assisted</small><b>"+result.assisted+"</b></span></div></article>";
    }).join("");
  }

  function formatDate(value){
    try{return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",year:"numeric"}).format(new Date(value));}
    catch(error){return value;}
  }

  function stripHtml(value){
    var node=document.createElement("div");
    node.innerHTML=value;
    return node.textContent||node.innerText||"";
  }

  function escapeHtml(value){
    return String(value===undefined||value===null?"":value)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  function bindEvents(){
    $("brand-home").addEventListener("click",goHome);
    $$("[data-back-home]").forEach(function(button){button.addEventListener("click",goHome);});
    $("home-primary").addEventListener("click",function(){
      if(profile.inProgress&&profile.inProgress.status==="active"){resumeRun();return;}
      if(!profile.player.characterConfirmed){showScreen("character-screen");return;}
      showScreen("hall-screen");
    });
    $("home-market").addEventListener("click",showMarket);
    $("home-archive").addEventListener("click",function(){renderArchive();showScreen("archive-screen");});
    $("home-settings").addEventListener("click",function(){
      $("reduced-motion").checked=!!profile.settings.reducedMotion;
      showScreen("settings-screen");
    });
    $("confirm-character").addEventListener("click",function(){
      profile.player.characterConfirmed=true;
      saveProfile();
      showScreen("hall-screen");
    });
    $$(".cosmetic-card").forEach(function(card){
      card.addEventListener("click",function(){marketSelection=card.getAttribute("data-cosmetic");renderMarket();});
    });
    $("market-action").addEventListener("click",marketAction);
    $("enter-run").addEventListener("click",function(){beginRun(null,false);});
    $("enter-run-secondary").addEventListener("click",function(){beginRun(null,false);});
    $("next-question").addEventListener("click",nextQuestion);
    $$(".powerup").forEach(function(button){button.addEventListener("click",function(){usePower(button.getAttribute("data-power"));});});
    $("leave-run").addEventListener("click",function(){
      if(typeof $("leave-dialog").showModal==="function") $("leave-dialog").showModal();
      else if(window.confirm("Save this run and return home?")) goHome();
    });
    $("leave-dialog").addEventListener("close",function(){
      var choice=$("leave-dialog").returnValue;
      if(choice==="save"){
        saveRun();
        goHome();
      }else if(choice==="abandon"){
        profile.inProgress=null;
        run=null;
        saveProfile();
        goHome();
        toast("The unfinished route was abandoned.");
      }
    });
    $("show-results").addEventListener("click",renderResults);
    $("retry-run").addEventListener("click",function(){
      var ids=run&&run.questionIds?run.questionIds.slice():null;
      beginRun(ids,run&&run.recovery);
    });
    $("failure-home").addEventListener("click",renderResults);
    $("results-home").addEventListener("click",goHome);
    $("run-again").addEventListener("click",function(){beginRun(null,false);});
    $("recovery-run").addEventListener("click",startRecovery);
    $("reduced-motion").addEventListener("change",function(){
      profile.settings.reducedMotion=$("reduced-motion").checked;
      saveProfile();
      updateGlobalUi();
      $("settings-status").textContent=profile.settings.reducedMotion?"Reduced motion is on. Meaningful final states remain visible.":"Full motion is on.";
    });
    $("clear-prototype-data").addEventListener("click",function(){
      if(!window.confirm("Reset only this local prototype profile? Learning-engine files will not be touched.")) return;
      try{localStorage.removeItem(STORAGE_KEY);}catch(error){}
      profile=defaultProfile();
      run=null;
      currentResult=null;
      saveProfile();
      updateHome();
      $("settings-status").textContent="Local prototype profile reset. Learning-engine files were untouched.";
      updateGlobalUi();
    });
    $("threshold-video").addEventListener("error",function(){$("threshold-video").style.display="none";});
  }

  function init(){
    profile=loadProfile();
    var scenario=new URLSearchParams(window.location.search).get("scenario");
    if(scenario){
      scenarioMode=true;
      applyScenario(scenario);
    }
    bindEvents();
    updateHome();
    updateGlobalUi();
    if(scenarioTarget==="market"){
      showMarket();
    }else if(scenarioTarget==="run"){
      showScreen("run-screen",false);
      renderQuestion();
    }else if(scenarioTarget==="results"){
      renderResults();
    }else if(scenarioTarget==="failure"){
      showScreen("failure-screen",false);
    }else{
      showScreen("home-screen",false);
    }
    var reveal=function(){window.setTimeout(function(){$("preload-screen").classList.add("ready");},260);};
    if(document.readyState==="complete") reveal();
    else window.addEventListener("load",reveal,{once:true});
  }

  init();
})();
