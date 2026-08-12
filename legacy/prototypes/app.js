/* ===== Shared layer: theme toggle + leaderboard (works with server.py; falls back to localStorage) ===== */
(function(){
  function lsGet(k,d){ try{var v=localStorage.getItem(k); return v===null?d:v;}catch(e){return d;} }
  function lsSet(k,v){ try{localStorage.setItem(k,v);}catch(e){} }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  var base = document.body.getAttribute('data-theme-base') || 'light';

  /* ---- theme ---- */
  function curTheme(){ return lsGet('mockTheme', base); }
  function applyTheme(t){
    document.body.classList.remove('theme-dark','theme-light');
    if(t!==base) document.body.classList.add('theme-'+t);
    var b=document.getElementById('mk-theme'); if(b) b.textContent = (t==='dark'?'☀':'☾');
    lsSet('mockTheme',t);
  }
  function toggleTheme(){ applyTheme(curTheme()==='dark'?'light':'dark'); }
  function injectThemeBtn(){
    if(document.getElementById('mk-theme')) return;
    var b=document.createElement('button'); b.id='mk-theme'; b.className='mk-theme-btn'; b.title='Toggle dark / light';
    b.addEventListener('click',toggleTheme); document.body.appendChild(b);
    b.textContent = (curTheme()==='dark'?'☀':'☾');
  }

  /* ---- username ---- */
  function getName(){ return lsGet('mockUser',''); }
  function setName(n){ lsSet('mockUser',(n||'').trim().slice(0,24)); }
  function promptName(force, after){
    if(getName() && !force){ if(after) after(); return; }
    if(!force && sessionStorage.getItem('mk-name-asked')){ if(after) after(); return; }
    try{ sessionStorage.setItem('mk-name-asked','1'); }catch(e){}
    var ov=document.createElement('div'); ov.className='mk-modal';
    ov.innerHTML='<div class="mk-box"><h3>Pick a leaderboard name</h3>'+
      '<p>Tracks your best mock scores and ranks you against everyone on the portal. Skip to stay anonymous.</p>'+
      '<input id="mk-name-in" maxlength="24" placeholder="e.g. Aneeket" value="'+esc(getName())+'">'+
      '<div class="mk-row"><button id="mk-name-skip">Skip</button><button id="mk-name-ok" class="pri">Save</button></div></div>';
    document.body.appendChild(ov);
    var inp=ov.querySelector('#mk-name-in'); setTimeout(function(){inp.focus();},30);
    function done(save){ if(save){ var v=inp.value.trim(); if(v) setName(v); } ov.remove(); if(after) after(); }
    ov.querySelector('#mk-name-ok').addEventListener('click',function(){done(true);});
    ov.querySelector('#mk-name-skip').addEventListener('click',function(){done(false);});
    inp.addEventListener('keydown',function(e){ if(e.key==='Enter') done(true); });
  }

  /* ---- leaderboard ---- */
  function localBoard(){
    try{ var d=JSON.parse(lsGet('mockBoardLocal','{}'));
      return Object.keys(d).map(function(k){return {name:k,best:d[k].best,test:d[k].test,plays:d[k].plays};})
        .sort(function(a,b){return b.best-a.best;});
    }catch(e){ return []; }
  }
  function saveLocal(name,test,pct){
    try{ var d=JSON.parse(lsGet('mockBoardLocal','{}')); var r=d[name]||{best:0,test:'',plays:0};
      r.plays++; if(pct>r.best){ r.best=pct; r.test=test; } d[name]=r; lsSet('mockBoardLocal',JSON.stringify(d)); }catch(e){}
  }
  function fetchBoard(){
    return fetch('/api/leaderboard',{cache:'no-store'})
      .then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(j){ return j.entries||[]; })
      .catch(function(){ return localBoard(); });
  }
  function submitScore(test,score,max){
    var pct = max>0 ? Math.round(score/max*1000)/10 : 0;
    var name = getName() || 'anon';
    saveLocal(name,test,pct);
    return fetch('/api/score',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:name,test:test,pct:pct,score:score,max:max})})
      .then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(j){ return j.entries||[]; })
      .catch(function(){ return localBoard(); });
  }
  /* call when a scored mock finishes: prompts for a name if needed, submits, refreshes any board on the page */
  function recordResult(test,score,max){
    function go(){ submitScore(test,score,max).then(function(){ var el=document.getElementById('mk-board'); if(el) renderBoard(el); }); }
    if(!getName()) promptName(true, go); else go();
  }
  function medal(i){ return i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'.'; }
  function renderBoard(el){
    if(typeof el==='string') el=document.getElementById(el);
    if(!el) return;
    el.innerHTML='<div class="mk-lb-load">Loading…</div>';
    fetchBoard().then(function(entries){
      var me=getName();
      if(!entries.length){ el.innerHTML='<div class="mk-lb-empty">No scores yet — take a Module Test or Exam Mock to get on the board!</div>'; return; }
      var h='<table class="mk-lb"><thead><tr><th></th><th>Name</th><th>Best</th><th>On</th></tr></thead><tbody>';
      entries.forEach(function(e,i){
        h+='<tr'+(e.name===me?' class="me"':'')+'><td>'+medal(i)+'</td><td>'+esc(e.name)+'</td><td>'+e.best+'%</td><td>'+esc(e.test||'—')+'</td></tr>';
      });
      el.innerHTML=h+'</tbody></table>';
    });
  }
  /* build the leaderboard card (used on the portal) */
  function mountBoard(containerId){
    var c=document.getElementById(containerId); if(!c) return;
    c.classList.add('mk-board-wrap');
    c.innerHTML='<div class="mk-board-head"><span class="t">🏆 Leaderboard</span>'+
      '<span class="who">You: <b id="mk-who">'+esc(getName()||'anonymous')+'</b> · <a id="mk-change">change</a></span></div>'+
      '<div id="mk-board"></div>';
    document.getElementById('mk-change').addEventListener('click',function(){
      promptName(true,function(){ var w=document.getElementById('mk-who'); if(w) w.textContent=getName()||'anonymous'; renderBoard('mk-board'); });
    });
    renderBoard('mk-board');
  }

  window.Mock={getName:getName,setName:setName,promptName:promptName,toggleTheme:toggleTheme,
    submitScore:submitScore,recordResult:recordResult,fetchBoard:fetchBoard,renderBoard:renderBoard,mountBoard:mountBoard};

  /* init */
  applyTheme(curTheme());
  function init(){
    injectThemeBtn();
    applyTheme(curTheme());
    var bid=document.body.getAttribute('data-board'); if(bid) mountBoard(bid);
    if(document.body.hasAttribute('data-ask-name')) promptName(false);
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded',init);
})();
