'use strict';
// ---------- phone ----------
let lastPhoneKey='';
function revealedUpTo(){ if(['rank','items','final'].includes(S.phase)) return Q.length-1; return S.phase==='reveal'?S.qi:S.qi-1; }
function myTotal(){ if(!S.you) return 0; let s=0; const last=revealedUpTo(); for(let i=0;i<=last;i++) s+=questionPoints(S.you,i);
  if(S.phase==='final'){ const r=standings().fin.find(x=>x.p===S.you); return r.final; } return s; }
function phoneReveal(q,qi,a){
  if(q.type==='kline'){
    const pct=(q.to/q.from-1)*100;
    return `<div class="mini"><canvas id="pk" role="img" aria-label="縮小版解答週線圖"></canvas></div><div class="p-ans"><b>${esc(q.name)}</b>｜週線<br>答案：<b>${q.answer==='up'?'走高':'走低'}</b>（${pct>=0?'+':''}${pct.toFixed(1)}%）<br>你選：${a===undefined?'未作答':(a==='up'?'走高':'走低')}</div>`;
  }
  if(q.type==='estimate'){
    return `<div class="mini"><canvas id="pe" role="img" aria-label="縮小版估價分布"></canvas></div><div class="p-ans">答案：<b>${num(q.answer)} ${q.unit}</b><br>你的估價：${a===undefined?'未作答':num(a)+'（差 '+num(Math.abs(a-q.answer))+'）'}</div>`;
  }
  const ps=allPlayers(); const mp=q.type==='minority'?minorityPoints(qi):null;
  return `<div class="p-title" style="font-size:18px">${esc(q.title)}</div><div class="p-list">${q.options.map((o,i)=>{
    const c=ps.filter(p=>p.ans[qi]===i).length; const right = q.type==='trivia' && i===q.answer;
    const tail = q.type==='minority' ? `${c} 人｜${mp.pts[i]?'+'+mp.pts[i]:'—'}` : (right?'正解 +2':`${c} 人`);
    return `<div class="p-row ${right||(mp&&mp.pts[i]===mp.top)?'right':''} ${a===i?'mine':''}"><span>${o.k}　${esc(o.t)}${a===i?'（你）':''}</span><span>${tail}</span></div>`;
  }).join('')}</div>`;
}
function renderPhone(){
  const el=document.getElementById('phone'); const ph=S.phase; const you=S.you;
  const key=[ph,S.qi,S.rule,you?you.name:'',S.draftTable,you&&S.qi>=0?String(you.ans[S.qi]):''].join('|');
  if(key===lastPhoneKey) return; lastPhoneKey=key;
  const head = you ? `<div class="p-head"><span>${tableBadge(you.table)} ${esc(you.name)}</span><span class="ptot">總分<b>${myTotal()}</b></span></div>${S.qi>=0&&['open','reveal'].includes(ph)?`<div class="p-sub">第 ${S.qi+1} / ${Q.length} 題</div>`:''}` : `<div class="p-head"><span>Trader's Gambit</span><span></span></div>`;
  if(ph==='title'){ el.innerHTML=head+`<div class="wait">${robot('ring','wave',110)}<div class="p-title">交易員的計謀</div><div>等待主持人開放加入</div></div>`; return; }
  if(!you){
    if(ph!=='join'){ el.innerHTML=head+`<div class="wait"><div class="p-title">遊戲已開始</div><div>本局人數已鎖定，無法再加入</div></div>`; return; }
    if(!S.draftTable){
      el.innerHTML=head+`<div class="p-sub">步驟 1 / 2</div><div class="p-title">你坐在哪一桌？</div><div class="p-sub">請選擇你桌上的商品桌符號</div>
        <div class="p-opts">${TABLES.map(t=>`<button type="button" class="p-opt" data-table="${t.id}">${tableBadge(t.id)}<span>${esc(t.name)}</span></button>`).join('')}</div>`;
      el.querySelectorAll('[data-table]').forEach(b=>b.addEventListener('click',()=>{ S.draftTable=b.dataset.table; renderPhone(); }));
      return;
    }
    const tb=TABLES.find(t=>t.id===S.draftTable);
    el.innerHTML=head+`<div class="p-sub">步驟 2 / 2</div><div class="p-title">取一個匿名暱稱</div>
      <div class="p-opt picked">${tableBadge(tb.id)}<span>${esc(tb.name)}</span><button type="button" class="ghost" id="chgTable" style="margin-left:auto">換桌</button></div>
      <div class="field"><label for="nick">暱稱（最多 8 個字，會顯示在排行榜上）</label><input id="nick" type="text" maxlength="8" value="${esc(S.draftName)}" placeholder="例如：午夜狙擊手"></div>
      <button class="btn" id="joinBtn" type="button" ${S.draftName.trim()?'':'disabled'}>進入遊戲</button>`;
    document.getElementById('nick').addEventListener('input',e=>{ S.draftName=e.target.value; document.getElementById('joinBtn').disabled=!S.draftName.trim(); });
    document.getElementById('chgTable').addEventListener('click',()=>{ S.draftTable=null; renderPhone(); });
    document.getElementById('joinBtn').addEventListener('click',()=>{ const b=document.getElementById('joinBtn'); b.disabled=true; b.textContent='加入中…'; NET.join(S.draftName.trim(), S.draftTable).catch(err=>{ b.disabled=false; b.textContent='進入遊戲'; showErr('加入失敗：'+(err&&err.message||err)); }); });
    return;
  }
  if(ph==='join'){ el.innerHTML=head+`<div class="wait">${robot('dots','wave',100)}<div class="p-title">已加入</div><div>等待主持人正式開始…</div></div>`; return; }
  if(ph==='open'||ph==='reveal'){
    const qi=S.qi, q=Q[qi], a=you.ans[qi];
    if(ph==='reveal'){
      if(q.type==='item'){ el.innerHTML=head+`<div class="wait"><div class="p-title">你選了「${a===undefined?'未作答':q.options[a].t}」</div><div>用途最後才揭曉</div></div>`; return; }
      const pts=questionPoints(you,qi);
      const react=`<div class="p-react">${robot(pts?'happy':'sad', pts?'cheer':'sad', 54)}<b>${pts?(pts>=3?'太神了！':'入帳成功！'):(a===undefined?'這題錯過了':'差一點！')}</b></div>`;
      const nCoins=Math.min(pts*6,24); const caps=[8,6,5,3,2]; let coins='', k=0;
      for(let row=0; row<caps.length && k<nCoins; row++){ const cap=Math.min(caps[row], nCoins-k);
        for(let j=0;j<cap;j++,k++){ const x=50+(j-(cap-1)/2)*11+(((k*37)%7)-3)-9, y=44-row*7+(((k*53)%5)-2), r=((k*71)%40)-20;
          coins+=`<i class="coin" style="left:${x}px;top:${y}px;--r:${r}deg;animation-delay:${(0.28+k*0.035).toFixed(3)}s"></i>`; } }
      el.innerHTML=head+react+phoneReveal(q,qi,a)+(pts
        ? `<div class="toast has-coins" role="status"><div><span class="tcount">入帳 +${pts} 分</span><small>第 ${qi+1} 題得分已入帳</small></div><div class="tpile" aria-hidden="true">${coins}</div></div>`
        : `<div class="toast zero" role="status">+0 分<small>${a===undefined?'這題沒有作答':'這題沒有得分'}</small></div>`);
      if(q.type==='kline') drawK(document.getElementById('pk'), q, true, 'win');
      if(q.type==='estimate') drawEst(document.getElementById('pe'), qi);
      const t=el.querySelector('.toast'); setTimeout(()=>{ if(t) t.remove(); },2300);
      return;
    }
    if(a!==undefined){
      const txt=q.type==='kline'?(a==='up'?'走高':'走低'):q.type==='estimate'?num(a)+' '+q.unit:q.options[a].t;
      el.innerHTML=head+(q.type==='kline'?`<div class="mini"><canvas id="pk" role="img" aria-label="縮小版週線圖"></canvas></div>`:'')+`<div class="wait">${q.type==='kline'?'':robot('think','think',90)}<div>已送出</div><div class="p-title">${esc(txt)}</div><div>等待主持人公布</div></div>`;
      if(q.type==='kline') drawK(document.getElementById('pk'), q, false, 'win');
      return;
    }
    let inner=`<div class="p-title">${esc(q.title)}</div><div class="p-sub">${esc(q.type==='kline'?'週線｜灰色區塊已遮住｜猜對 +1':q.sub)}</div>`;
    if(q.type==='kline') inner+=`<div class="mini"><canvas id="pk" role="img" aria-label="縮小版週線圖"></canvas></div><div class="p-opts"><button class="p-opt" data-a="up" type="button"><span class="k">▲</span>走高</button><button class="p-opt" data-a="down" type="button"><span class="k">▼</span>走低</button></div>`;
    else if(q.type==='estimate'){ const v=S.val??q.def; inner+=`<div class="bidval" id="estv">${num(v)}</div><label for="estr" class="note">拖拉選擇（${num(q.min)} – ${num(q.max)} ${q.unit}）</label><input class="range" id="estr" type="range" min="${q.min}" max="${q.max}" step="${q.step}" value="${v}"><button class="btn" id="estBtn" type="button">送出估價</button>`; }
    else inner+=`<div class="p-opts">${q.options.map((o,i)=>`<button class="p-opt" data-a="${i}" type="button"><span class="k">${o.k}</span><span>${esc(o.t)}${o.d?`<br><small class="p-sub">${esc(o.d)}</small>`:''}</span></button>`).join('')}</div>`;
    el.innerHTML=head+inner;
    if(q.type==='kline') drawK(document.getElementById('pk'), q, false, 'win');
    el.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{ const v=b.dataset.a; NET.answer(qi, q.type==='kline'?v:Number(v)); }));
    const r=document.getElementById('estr');
    if(r){ r.addEventListener('input',e=>{ S.val=Number(e.target.value); document.getElementById('estv').textContent=num(S.val); });
      document.getElementById('estBtn').addEventListener('click',()=>{ NET.answer(qi, S.val??q.def); }); }
    return;
  }
  const st=standings();
  if(ph==='rank'){ const r=st.pre.find(x=>x.p===you); el.innerHTML=head+`<div class="wait"><div>目前（未含道具）</div><div class="big-pts">#${r.preRank}</div><div>${r.pre} 分</div></div>`; return; }
  if(ph==='items'){ const r=st.pre.find(x=>x.p===you); el.innerHTML=head+`<div class="wait">${robot(r.bonus?'happy':'target', r.bonus?'cheer':'think', 90)}<div>你的道具</div><div class="p-title">${r.item===0?'A 積分嘉獎':r.item===1?'B 保險理賠':'沒有選'}</div><div>${r.bonus?'觸發！+'+r.bonus+' 分':'這次沒有觸發'}</div></div>`; return; }
  if(ph==='final'){ const r=st.fin.find(x=>x.p===you);
    el.innerHTML=head+`<div class="wait">${r.finalRank<=5?robot('dots','cheer',110):robot('ring','wave',90)}<div>最終名次</div><div class="big-pts">#${r.finalRank}</div><div>${r.final} 分（含道具 +${r.bonus}）</div>${r.finalRank<=5?`<div class="p-title" style="color:var(--gold)">${r.finalRank===1?'恭喜奪冠！':'恭喜進入 Top 5！'}<br>可領取 ${CHIPS(r.finalRank)} 枚籌碼</div><div>請出示此畫面給工作人員</div>`:'<div>謝謝參與！</div>'}</div>`; }
}


// ---------- player boot ----------
function render(){ renderPhone(); }
function startPlayer(){
  NET.start(false);
  let rt; window.addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{ lastPhoneKey=''; render(); },200); });
  render();
}
startPlayer();
