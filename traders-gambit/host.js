'use strict';
// ---------- host screen ----------
function renderScreen(){
  const el=document.getElementById('screen'); const ph=S.phase;
  if(ph==='title'){ el.innerHTML=`<div class="hero">${robot('ring','wave',150)}<div class="en">Trader's Gambit</div><div class="zh">交易員的計謀</div><div class="event">EBC GRAND FINALE 贏家夜沙龍｜2026.12.19</div></div>`; return; }
  if(ph==='join'){
    const n=allPlayers().length;
    el.innerHTML=`<div class="join-wrap"><div class="join-left">${robot('dots','wave',100)}<div class="zh" style="font-family:var(--display-zh);font-weight:900;font-size:clamp(22px,3vw,40px);letter-spacing:6px">掃描 QR code 加入遊戲</div><div class="event">選擇你的商品桌，再取一個匿名暱稱</div><div class="event">已加入</div><div class="en" style="font-family:var(--display-en);font-style:italic;font-weight:900;color:var(--gold);font-size:clamp(56px,8vw,120px);line-height:1">${n}<span style="font-size:.35em"> 人</span></div></div><div class="join-right"><div id="qr" class="qr"></div><div class="qr-url">${esc(PLAYER_URL)}</div></div></div>`;
    drawQR(); return;
  }
  if(ph==='open'||ph==='reveal') return renderQuestion(el);
  if(ph==='rank') return renderBoard(el,false);
  if(ph==='items') return renderItems(el);
  if(ph==='final') return renderBoard(el,true);
}

function renderQuestion(el){
  const qi=S.qi, q=Q[qi], rev=S.phase==='reveal';
  const head=`<div class="qno">QUESTION ${String(qi+1).padStart(2,'0')}</div><div class="qtitle">${esc(rev&&q.type==='kline'? q.name+'｜週線' : q.title)}</div><div class="qsub">${esc(q.type==='kline'? (rev? '題目區間 '+fmtM(q.bars[q.iq0].t)+' – '+fmtM(q.bars[q.iq1].t)+'｜亮橘色區塊是剛剛遮住的部分' : '週線｜最後約 '+Math.round((q.iq1-q.ih+1)/(q.iq1-q.iq0+1)*100)+'% 已遮住｜商品名稱揭曉時公布') : q.sub)}</div><div class="answered">已作答 <b>${answeredCount(qi)}</b> / ${S.roster}</div>`;
  let body='';
  if(q.type==='kline'){
    let cap='';
    if(rev){ const ps=allPlayers(); const up=ps.filter(p=>p.ans[qi]==='up').length, dn=ps.filter(p=>p.ans[qi]==='down').length;
      const pct=(q.to/q.from-1)*100;
      cap=`<div class="story">答案：${q.answer==='up'?'走高':'走低'}。遮住區間 ${fmtD(q.bars[q.ih].t)} – ${fmtD(q.bars[q.iq1].t)}，從 ${num(q.from,q.dp)} 到 ${num(q.to,q.dp)}（${pct>=0?'+':''}${pct.toFixed(1)}%）。${esc(q.story)}</div><div class="chart-cap">全場：走高 ${up} 人｜走低 ${dn} 人</div>`; }
    body=`<div class="chart-box"><canvas id="kc" role="img" aria-label="週線圖"></canvas></div>${cap}`;
  } else if(q.type==='estimate'){
    if(!rev) body=`<div class="chart-box" style="display:grid;place-items:center"><div style="text-align:center;display:flex;flex-direction:column;gap:8px"><div class="qsub">請在手機上拖拉，輸入你的估價</div><div style="font-family:var(--display-en);font-style:italic;font-weight:900;font-size:clamp(40px,7vw,84px);color:var(--gold)">${num(q.min)} – ${num(q.max)}</div><div class="qsub">單位：${q.unit}</div></div></div>`;
    else body=`<div class="chart-box"><canvas id="bc" role="img" aria-label="全場估價分布"></canvas></div><div class="story">${esc(q.story)}</div>`;
  } else {
    const ps=allPlayers(); const n=Math.max(1,answeredCount(qi)); const mp=(q.type==='minority'&&rev)?minorityPoints(qi):null;
    body='<div class="opts">'+q.options.map((o,i)=>{
      const c=ps.filter(p=>p.ans[qi]===i).length; let badge='', cls='';
      if(rev){ if(q.type==='minority'){ badge=`<span class="pts ${mp.pts[i]?'':'zero'}">${mp.pts[i]?'+'+mp.pts[i]:'無人選'}</span>`; if(mp.pts[i]===mp.top) cls='win'; }
               if(q.type==='trivia' && i===q.answer){ cls='win'; badge='<span class="pts">+2</span>'; } }
      return `<div class="opt ${cls}">${badge}<span class="k">${o.k}</span><span class="t">${esc(o.t)}</span>${o.d?`<span class="qsub">${esc(o.d)}</span>`:''}${rev?`<div class="bar"><i style="width:${Math.round(c/n*100)}%"></i></div><div class="meta"><span>${c} 人</span><span>${Math.round(c/n*100)}%</span></div>`:''}</div>`;
    }).join('')+'</div>';
    if(rev && q.type==='minority') body+=`<div class="story">${esc(q.host)}</div>`;
    if(rev && q.type==='trivia') body+=`<div class="story">${esc(q.story)}</div>`;
    if(rev && q.type==='item') body+=`<div class="story">道具用途？等到最後一題結束才揭曉。</div>`;
  }
  const bot = rev ? robot('happy','cheer',84) : robot(q.type==='kline'?'target':'think','think',84);
  el.innerHTML=`<div class="host-bot">${bot}</div>`+head+`<div class="qbody">${body}</div>`;
  if(q.type==='kline') drawK(document.getElementById('kc'), q, rev, S.kView);
  if(q.type==='estimate' && rev) drawEst(document.getElementById('bc'), qi);
}

function renderBoard(el,final){
  const st=standings(); const rows=final?st.fin:st.pre; const preTop5=new Set(st.pre.slice(0,5).map(r=>r.p.id));
  el.innerHTML=`<div class="host-bot">${final?robot('dots','cheer',84):robot('think','think',84)}</div><div class="qno">${final?'FINAL':'BEFORE ITEMS'}</div><div class="qtitle">${final?'最終排名':'目前排名（尚未加上道具分）'}</div><div class="qsub">${final?'冠軍 3 枚・第 2 名 2 枚・第 3–5 名各 1 枚籌碼｜標示「擠進」的人，是靠道具翻盤的':'道具還沒揭曉，排名可能還會變動'}</div>
  <div class="qbody" style="justify-content:flex-start;overflow:auto"><div class="lb ${final?'final':''}"><div class="lb-head"><span>名次</span><span>桌</span><span>暱稱</span><span>${final?'總分（含道具）':'分數'}</span><span>${final?'道具加分':'道具'}</span><span>${final?'籌碼':''}</span></div>${rows.slice(0,10).map(r=>{
    const rank=final?r.finalRank:r.preRank;
    const climb = final && rank<=5 && !preTop5.has(r.p.id);
    const b = final ? `<span class="b ${r.bonus?'plus':''}">${r.bonus?'+'+r.bonus:'—'}</span>` : `<span class="b">${r.item===0?'A':r.item===1?'B':'—'}</span>`;
    const c = final && CHIPS(rank) ? `<span class="c">${CHIPS(rank)} 枚</span>` : '<span class="c"></span>';
    return `<div class="lb-row ${rank<=5?'top':''} ${r.p===S.you?'you':''}"><span class="r">#${rank}</span>${tableBadge(r.p.table)}<span>${esc(r.p.name)}${r.p===S.you?'（你）':''}${climb?'<span class="tag">擠進</span>':''}</span><span class="s">${final?r.final:r.pre}</span>${b}${c}</div>`;
  }).join('')}</div>${final?dropped(st):''}</div>`;
}
function dropped(st){
  const finTop=new Set(st.fin.slice(0,5).map(r=>r.p.id)); const out=st.pre.slice(0,5).filter(r=>!finTop.has(r.p.id));
  if(!out.length) return `<p class="note">這一局道具沒有改變 Top 5 名單。</p>`;
  return `<p class="note">被擠出 Top 5：${out.map(r=>esc(r.p.name)+`（原第 ${r.preRank} 名，最終第 ${r.finalRank} 名）`).join('、')}</p>`;
}
function renderItems(el){
  const ps=allPlayers(); const a=ps.filter(p=>p.ans[0]===0).length, b=ps.filter(p=>p.ans[0]===1).length;
  const ra=S.rule==='original'?'加分前排名在前 5 名 → 再加 2 分':'加分前排名在前 10 名 → 再加 1 分';
  const rb=S.rule==='original'?'加分前排名在最後 3 名 → 再加 3 分':'加分前沒有進前 5 名 → 理賠 2 分';
  el.innerHTML=`<div class="host-bot">${robot('target','think',84)}</div><div class="qno">ITEM REVEAL</div><div class="qtitle">道具用途揭曉</div><div class="qsub">還記得第 1 題選的道具嗎？</div>
  <div class="qbody"><div class="items-split">
    <div class="item-card"><span style="font-family:var(--mono);color:var(--gold)">A</span><span class="n">積分嘉獎</span><span class="c">${a} 人</span><span class="d">${ra}</span></div>
    <div class="item-card"><span style="font-family:var(--mono);color:var(--gold)">B</span><span class="n">保險理賠</span><span class="c">${b} 人</span><span class="d">${rb}</span></div>
  </div></div>`;
}


// ---------- host control ----------
const TS = () => firebase.database.ServerValue.TIMESTAMP;
let hostReady=false, resetArmed=false, botTimers=[], lastBotQ=null;

function hostLabel(){
  return {title:'開放加入', join:'正式開始（鎖定人數）', open:'公布結果', reveal:S.qi<Q.length-1?'下一題':'公布排名（未含道具）', rank:'揭曉道具用途', items:'公布最終排名', final:'遊戲結束'}[S.phase];
}
function openState(i){ return {phase:'open', qi:i, qk:'q'+i, openedAt:TS()}; }
function hostNext(){
  if(!hostReady) return;
  const st=NET.base.child('state'); const ph=S.phase;
  if(ph==='title') st.update({phase:'join', qi:-1, qk:null, roster:null});
  else if(ph==='join'){
    const roster={}; Object.keys(NET.raw.players||{}).forEach(id=>roster[id]=true);
    if(!Object.keys(roster).length){ showErr('還沒有人加入'); return; }
    st.update(Object.assign({roster}, openState(0)));
  }
  else if(ph==='open') st.update({phase:'reveal'});
  else if(ph==='reveal'){ if(S.qi<Q.length-1) st.update(openState(S.qi+1)); else st.update({phase:'rank', qk:null}); }
  else if(ph==='rank') st.update({phase:'items'});
  else if(ph==='items') st.update({phase:'final'});
  S.kView='win';
}
function hostReset(){
  const b=document.getElementById('resetBtn');
  if(!resetArmed){ resetArmed=true; b.textContent='再按一次：清除所有玩家與答案'; setTimeout(()=>{ resetArmed=false; b.textContent='清除重來'; },4000); return; }
  resetArmed=false; b.textContent='清除重來';
  botTimers.forEach(clearTimeout); botTimers=[]; lastBotQ=null;
  NET.base.update({state:{phase:'title', qi:-1}, players:null, answers:null}).catch(e=>showErr('清除失敗：'+e.message));
}
function addBots(n){
  if(S.phase!=='join' && S.phase!=='title'){ showErr('只能在開放加入時加入模擬玩家'); return; }
  const pr=NET.raw.players||{}; const used=new Set(Object.values(pr).map(p=>p.name)); const upd={};
  let made=0, guard=0;
  while(made<n && guard<500){ guard++;
    const nm=NAME_A[Math.floor(Math.random()*NAME_A.length)]+NAME_B[Math.floor(Math.random()*NAME_B.length)];
    if(used.has(nm)) continue; used.add(nm);
    const id='bot_'+Math.random().toString(36).slice(2,10);
    upd[id]={name:nm.slice(0,8), table:TABLES[Math.floor(Math.random()*TABLES.length)].id, bot:true, joinedAt:TS()}; made++;
  }
  NET.base.child('players').update(upd).catch(e=>showErr('加入模擬玩家失敗：'+e.message));
}
function gauss(){ return Math.sqrt(-2*Math.log(Math.random()+1e-9))*Math.cos(2*Math.PI*Math.random()); }
function botAnswer(q){
  if(q.type==='item') return Math.random()<0.6?0:1;
  if(q.type==='kline') return Math.random()<(q.botUp||0.5)?'up':'down';
  if(q.type==='minority'){ const r=Math.random(); let a=0; for(let i=0;i<q.bot.length;i++){ a+=q.bot[i]; if(r<a) return i; } return q.bot.length-1; }
  if(q.type==='estimate') return Math.max(q.min, Math.min(q.max, Math.round((4900+gauss()*650)/q.step)*q.step));
  if(q.type==='trivia') return Math.random()<q.botP ? q.answer : [0,1,2,3].filter(x=>x!==q.answer)[Math.floor(Math.random()*3)];
}
function runBotsIfNeeded(){
  if(S.phase!=='open' || lastBotQ===S.qi) return;
  lastBotQ=S.qi; const qi=S.qi, q=Q[qi];
  S.players.filter(p=>p.bot && p.ans[qi]===undefined).forEach(p=>{
    const delay=1200+Math.random()*9000;
    botTimers.push(setTimeout(()=>{
      if(S.phase!=='open'||S.qi!==qi) return;
      NET.base.child('answers/q'+qi+'/'+p.id).set({a:botAnswer(q), t:Math.round(delay)});
    },delay));
  });
}
let qrFor='';
function drawQR(){
  const el=document.getElementById('qr'); if(!el) return;
  if(!window.QRCode){ el.textContent='QR code 載入失敗，請直接輸入網址'; return; }
  el.innerHTML=''; new QRCode(el,{text:PLAYER_URL, width:240, height:240, colorDark:'#2B0A15', colorLight:'#F6F0EA', correctLevel:QRCode.CorrectLevel.M});
}

function render(){
  renderScreen();
  const b=document.getElementById('hostBtn'); b.textContent=hostLabel(); b.disabled = !hostReady || S.phase==='final';
  const vb=document.getElementById('viewBtn'); const isK = S.phase==='reveal' && Q[S.qi] && Q[S.qi].type==='kline';
  vb.hidden=!isK; vb.textContent = S.kView==='ctx' ? '回到題目區間' : '看更長期的走勢';
  document.getElementById('botBtn').hidden = !(S.phase==='join'||S.phase==='title');
  const n=allPlayers().length;
  document.getElementById('hostProg').textContent =
    S.phase==='join' ? `已加入 ${n} 人｜遊戲代號 ${GAME_ID}` :
    (S.qi>=0 && ['open','reveal'].includes(S.phase) ? `第 ${S.qi+1} / ${Q.length} 題｜已作答 ${answeredCount(S.qi)} / ${S.roster}｜遊戲代號 ${GAME_ID}` : `遊戲代號 ${GAME_ID}`);
  runBotsIfNeeded();
}

function startHost(){
  document.getElementById('hostBtn').addEventListener('click',hostNext);
  document.getElementById('viewBtn').addEventListener('click',()=>{ S.kView = S.kView==='ctx'?'win':'ctx'; render(); });
  document.getElementById('resetBtn').addEventListener('click',hostReset);
  document.getElementById('botBtn').addEventListener('click',()=>addBots(10));
  let rt; window.addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(render,150); });
  NET.start(true, uid=>{
    NET.base.child('hostUid').transaction(cur=> cur===null ? uid : undefined, (err, committed, snap)=>{
      if(err){ showErr('無法取得主持權限：'+err.message); return; }
      if(snap.val()!==uid){
        document.getElementById('hostProg').textContent='這個遊戲代號已經有其他裝置在主持。請用原本的電腦開啟，或在網址後加上 ?g=新代號 開一局新的。';
        return;
      }
      hostReady=true;
      NET.base.child('state').once('value').then(s=>{ if(!s.exists()) NET.base.child('state').set({phase:'title', qi:-1}); });
      render();
    });
  });
  render();
}
startHost();
