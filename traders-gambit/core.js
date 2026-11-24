'use strict';
// ---------- tables (replaces roles) ----------
const TABLES = [
  {id:'fx',  name:'外匯桌',     tag:'FX',  color:'#FFA552'},
  {id:'au',  name:'黃金桌',     tag:'AU',  color:'#FFC98A'},
  {id:'idx', name:'指數桌',     tag:'IDX', color:'#E9CDBF'},
  {id:'etf', name:'美股 ETF 桌', tag:'ETF', color:'#F6D2B8'},
  {id:'btc', name:'比特幣桌',   tag:'BTC', color:'#FFB877'}
];

// ---------- price anchors (approximate public levels; demo only) ----------
const GOLD_A = [['2018-01-31',1345],['2018-02-28',1318],['2018-03-30',1325],['2018-04-30',1315],['2018-05-31',1298],['2018-06-29',1252],['2018-07-31',1224],['2018-08-16',1174],['2018-08-31',1201],['2018-09-28',1192],['2018-10-31',1215],['2018-11-30',1222],['2018-12-31',1282],
 ['2019-01-31',1321],['2019-02-28',1313],['2019-03-29',1292],['2019-04-30',1284],['2019-05-31',1305],['2019-06-28',1409],['2019-07-31',1413],['2019-08-30',1520],['2019-09-04',1550],['2019-09-30',1472],['2019-10-31',1513],['2019-11-29',1464],['2019-12-31',1517],
 ['2020-01-31',1589],['2020-02-24',1660],['2020-02-28',1585],['2020-03-09',1680],['2020-03-19',1475],['2020-03-31',1577],['2020-04-14',1727],['2020-04-30',1687],['2020-05-29',1730],['2020-06-30',1781],['2020-07-31',1975],['2020-08-07',2035],['2020-08-31',1968],['2020-09-30',1886],['2020-10-30',1879],['2020-11-30',1777],['2020-12-31',1898],
 ['2021-01-29',1847],['2021-02-26',1734],['2021-03-31',1708],['2021-04-30',1769],['2021-05-31',1907],['2021-06-30',1770]];
const BTC_A = [['2020-10-02',10600],['2020-10-31',13800],['2020-11-30',19700],['2020-12-31',29000],['2021-01-31',33100],['2021-02-21',57500],['2021-02-28',45200],['2021-03-13',61200],['2021-03-31',58900],['2021-04-14',63500],['2021-04-30',57700],['2021-05-19',37000],['2021-05-31',37300],['2021-06-22',32500],['2021-06-30',35000],['2021-07-20',29800],['2021-07-31',41500],['2021-08-31',47100],['2021-09-06',52700],['2021-09-21',40700],['2021-09-30',43800],['2021-10-20',66000],['2021-10-31',61300],['2021-11-10',66900],['2021-11-30',57000],['2021-12-04',49200],['2021-12-31',46300],['2022-01-24',36300],['2022-01-31',38500],['2022-02-28',43200],['2022-03-29',47400],['2022-03-31',45500],['2022-04-30',37700],['2022-05-12',29000],['2022-05-31',31800],['2022-06-18',19000],['2022-06-30',19900]];
const AUD_A = [['2019-01-04',0.7100],['2019-01-31',0.7265],['2019-02-28',0.7095],['2019-03-29',0.7100],['2019-04-30',0.7050],['2019-05-31',0.6935],['2019-06-28',0.7020],['2019-07-31',0.6840],['2019-08-30',0.6735],['2019-09-30',0.6755],['2019-10-31',0.6895],['2019-11-29',0.6765],['2019-12-31',0.7020],
 ['2020-01-31',0.6690],['2020-02-28',0.6515],['2020-03-19',0.5800],['2020-03-31',0.6140],['2020-04-30',0.6520],['2020-05-29',0.6665],['2020-06-30',0.6900],['2020-07-31',0.7145],['2020-08-31',0.7375],['2020-09-30',0.7160],['2020-10-30',0.7030],['2020-11-30',0.7350],['2020-12-31',0.7700],['2021-01-29',0.7650],['2021-02-26',0.7700],['2021-03-31',0.7600]];

const DAY=86400000;
const dt=s=>Date.parse(s+'T00:00:00Z');
function fmtD(t){ const d=new Date(t); return d.getUTCFullYear()+'/'+String(d.getUTCMonth()+1).padStart(2,'0')+'/'+String(d.getUTCDate()).padStart(2,'0'); }
function fmtM(t){ const d=new Date(t); return d.getUTCFullYear()+'/'+String(d.getUTCMonth()+1).padStart(2,'0'); }
function interp(anchors,t){
  for(let i=1;i<anchors.length;i++){ const a=dt(anchors[i-1][0]), b=dt(anchors[i][0]); if(t<=b){ const f=(t-a)/(b-a); return anchors[i-1][1]+(anchors[i][1]-anchors[i-1][1])*Math.max(0,Math.min(1,f)); } }
  return anchors[anchors.length-1][1];
}
function weekly(cfg){
  const out=[]; let s=cfg.seed; const r=()=>{ s=(s*9301+49297)%233280; return s/233280; };
  const t0=dt(cfg.ctx[0]), t1=dt(cfg.ctx[1]); let prev=interp(cfg.anchors,t0-7*DAY);
  for(let t=t0;t<=t1;t+=7*DAY){
    const base=interp(cfg.anchors,t); const c=base*(1+(r()-0.5)*cfg.vol);
    const o=prev; let h=Math.max(o,c)*(1+0.002+r()*cfg.vol*0.6), l=Math.min(o,c)*(1-0.002-r()*cfg.vol*0.6);
    (cfg.over||[]).forEach(ov=>{ const ot=dt(ov[0]); if(ot>t-7*DAY && ot<=t){ if(ov[1]==='h') h=Math.max(h,ov[2]); else l=Math.min(l,ov[2]); } });
    out.push({t,o,h,l,c}); prev=c;
  }
  return out;
}
function klineQ(def){
  const bars=weekly(def);
  const qs=dt(def.win[0]), qe=dt(def.win[1]), hf=dt(def.hide);
  const iq0=bars.findIndex(b=>b.t>=qs), iq1=bars.length-1-[...bars].reverse().findIndex(b=>b.t<=qe), ih=bars.findIndex(b=>b.t>=hf);
  const from=bars[ih-1].c, to=bars[iq1].c;
  return Object.assign({type:'kline', bars, iq0, iq1, ih, from, to, answer: to>from?'up':'down'}, def);
}

const Q = [
  {type:'item', title:'選擇你的道具', sub:'道具的用途，等全部題目結束才會揭曉',
   options:[{k:'A',t:'積分嘉獎',d:'相信自己最後會進 Top 5'},{k:'B',t:'保險理賠',d:'怕吊車尾，先買個保險'}]},
  klineQ({name:'黃金 XAU/USD', title:'這是某個商品的週線，遮住的部分會走高還是走低？', anchors:GOLD_A, seed:11, vol:0.012, dp:0,
    ctx:['2018-01-05','2021-06-25'], win:['2019-01-04','2020-08-28'], hide:'2020-02-07',
    over:[['2020-03-20','l',1451],['2020-08-07','h',2075]],
    story:'遮住的期間先遇上 2020 年 3 月疫情崩跌，隨後一路上攻，8 月創下約 2,075 美元的歷史新高。', botUp:0.55}),
  klineQ({name:'比特幣 BTC/USD', title:'這是某個商品的週線，遮住的部分會走高還是走低？', anchors:BTC_A, seed:23, vol:0.05, dp:0,
    ctx:['2020-10-02','2022-06-24'], win:['2021-05-07','2022-01-28'], hide:'2021-10-22',
    over:[['2021-11-10','h',69000],['2021-12-04','l',42000],['2021-05-19','l',30000],['2022-06-18','l',17600]],
    story:'遮住的期間先衝上約 69,000 美元的歷史高點，接著反轉，2022 年 1 月底跌到 3 萬多。先漲後跌，最後是走低。', botUp:0.6}),
  klineQ({name:'澳幣 AUD/USD', title:'這是某個商品的週線，遮住的部分會走高還是走低？', anchors:AUD_A, seed:37, vol:0.008, dp:4,
    ctx:['2019-01-04','2021-03-26'], win:['2019-06-07','2020-08-28'], hide:'2020-03-27',
    over:[['2020-03-19','l',0.5506]],
    story:'2020 年 3 月暴跌到約 0.55 之後反轉，8 月底回到 0.73 以上。', botUp:0.45}),
  {type:'minority', title:'年度最後一週，帳上還有一筆獲利中的部位，你會？', sub:'心態題｜最多人選的 +1，越少人選分數越高（同票同分）',
   options:[{k:'A',t:'全部平倉，開心過年'},{k:'B',t:'減碼一半，落袋為安'},{k:'C',t:'照原計畫，繼續持有'},{k:'D',t:'逆勢加碼，賭明年開紅盤'}],
   bot:[0.2,0.36,0.3,0.14], host:'市場上，跟大家做一樣的事，通常賺不到最多。'},
  {type:'minority', title:'2027 年，你最看好哪個市場？', sub:'心態題｜最多人選的 +1，越少人選分數越高（同票同分）',
   options:[{k:'A',t:'黃金'},{k:'B',t:'比特幣'},{k:'C',t:'美股'},{k:'D',t:'外匯（美元）'}],
   bot:[0.36,0.26,0.26,0.12], host:'大家都看好的，往往已經漲完了。'},
  {type:'estimate', title:'2026 年 1 月，黃金創下的歷史最高價是多少美元？', sub:'估價題｜越接近答案，分數越高（+4 ~ +1）',
   min:3000, max:7000, step:10, def:5000, answer:5595, bin:200, unit:'美元',
   story:'答案：約 5,595 美元（2026/1/29 盤中）。之後一路回落，10 月底一度跌到 3,870 美元附近。'},
  {type:'trivia', title:'SpaceX 今年 6 月 IPO，募得多少資金？', sub:'時事題｜答對 +2',
   options:[{k:'A',t:'294 億美元'},{k:'B',t:'500 億美元'},{k:'C',t:'750 億美元'},{k:'D',t:'1,060 億美元'}],
   answer:2, botP:0.4, story:'答案：750 億美元，每股 135 美元，創史上最大 IPO。294 億是沙烏地阿美 2019 年的舊紀錄；1,060 億是換算成澳幣的金額。'},
  {type:'trivia', title:'2026 世界盃冠軍是哪一國？', sub:'時事題｜答對 +2',
   options:[{k:'A',t:'阿根廷'},{k:'B',t:'西班牙'},{k:'C',t:'法國'},{k:'D',t:'英格蘭'}],
   answer:1, botP:0.6, story:'答案：西班牙。決賽延長賽 1:0 擊敗阿根廷，隊史第二座冠軍。'},
  {type:'trivia', title:'EBC 的 Podcast 叫什麼名字？', sub:'壓軸題｜答對 +2',
   options:[{k:'A',t:'財金 E 點通'},{k:'B',t:'財經地球村'},{k:'C',t:'財經觀察室'},{k:'D',t:'觀點會客室'}],
   answer:3, botP:0.45, story:'答案：觀點會客室。'}
];

const NAME_A = ['午夜','多頭','空軍','停損','K棒','均線','跳空','長紅','黃金','比特','外匯','逆勢','波段','當沖','佛系','穩健','爆倉','鑽石','槓桿','開紅'];
const NAME_B = ['狙擊手','阿姨','一號','達人','收藏家','信徒','小王子','戰神','獵人','探險家','老司機','女王','少年','大叔','仙人','手','教主','玩家','船長','盤'];

// ---------- scoring ----------
function allPlayers(){ return S.you ? S.players.concat([S.you]) : S.players; }
function minorityPoints(qi){
  const q=Q[qi]; const cnt=q.options.map(()=>0);
  allPlayers().forEach(p=>{ const a=p.ans[qi]; if(a!==undefined) cnt[a]++; });
  const used=[...new Set(cnt.filter(c=>c>0))].sort((a,b)=>b-a); // most picked first
  const pts=cnt.map(c=> c===0?0:1+used.indexOf(c));
  return {cnt, pts, top:Math.max(...pts)};
}
function estimatePoints(qi){
  const q=Q[qi]; const ps=allPlayers().filter(p=>p.ans[qi]!==undefined); const n=ps.length; const map={};
  const sorted=ps.map(p=>({id:p.id, d:Math.abs(p.ans[qi]-q.answer)})).sort((a,b)=>a.d-b.d);
  let first=0; sorted.forEach((x,i)=>{ if(i>0 && x.d!==sorted[i-1].d) first=i; map[x.id]=4-Math.floor(first*4/n); });
  return map;
}
function totals(){
  const cache={};
  Q.forEach((q,qi)=>{ if(q.type==='minority') cache[qi]=minorityPoints(qi); if(q.type==='estimate') cache[qi]=estimatePoints(qi); });
  return allPlayers().map(p=>{
    let s=0, t=0;
    Q.forEach((q,qi)=>{
      const a=p.ans[qi]; t+= p.t[qi]||30000; if(a===undefined) return;
      if(q.type==='kline') s+= a===q.answer?1:0;
      else if(q.type==='trivia') s+= a===q.answer?2:0;
      else if(q.type==='minority') s+= cache[qi].pts[a];
      else if(q.type==='estimate') s+= cache[qi][p.id]||0;
    });
    return {p, pre:s, time:t, item:p.ans[0]};
  });
}
function questionPoints(p,qi){
  const q=Q[qi], a=p.ans[qi]; if(a===undefined) return 0;
  if(q.type==='kline') return a===q.answer?1:0;
  if(q.type==='trivia') return a===q.answer?2:0;
  if(q.type==='minority') return minorityPoints(qi).pts[a];
  if(q.type==='estimate') return estimatePoints(qi)[p.id]||0;
  return 0;
}
function bonus(rule,item,rank,n){
  if(rule==='original'){ if(item===0) return rank<=5?2:0; if(item===1) return rank>n-3?3:0; }
  else { if(item===0) return rank<=10?1:0; if(item===1) return rank>5?2:0; }
  return 0;
}
function standings(){
  const rows=totals(); const n=rows.length;
  rows.sort((a,b)=> b.pre-a.pre || a.time-b.time);
  rows.forEach((r,i)=>{ r.preRank=i+1; r.bonus=bonus(S.rule,r.item,i+1,n); r.final=r.pre+r.bonus; });
  const fin=rows.slice().sort((a,b)=> b.final-a.final || a.time-b.time); fin.forEach((r,i)=>r.finalRank=i+1);
  return {pre:rows, fin};
}

// ---------- helpers ----------
const CHIPS=r=> r===1?3: r===2?2: r<=5?1:0;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=(v,dp)=>Number(v).toLocaleString('en-US',{minimumFractionDigits:dp||0,maximumFractionDigits:dp||0});
function tableBadge(id){ const r=TABLES.find(x=>x.id===id)||TABLES[0]; return `<span class="role" style="background:${r.color}" title="${esc(r.name)}" aria-label="${esc(r.name)}">${r.tag}</span>`; }
function answeredCount(qi){ return allPlayers().filter(p=>p.ans[qi]!==undefined).length; }

// ---------- mascot robot ----------
const EYES = {
  ring:  '<circle cx="96" cy="61" r="15"/>',
  think: '<path d="M78 61 H90 M102 61 H114"/>',
  happy: '<path d="M78 67 Q85 53 92 67 M100 67 Q107 53 114 67"/>',
  sad:   '<path d="M84 68 Q96 58 108 68"/>',
  dots:  '<circle cx="85" cy="61" r="6" fill="#FFA552" stroke="none"/><circle cx="107" cy="61" r="6" fill="#FFA552" stroke="none"/>',
  target:'<circle cx="96" cy="61" r="15"/><circle cx="96" cy="61" r="5"/>'
};
function robot(expr, pose, size){
  const w=size, h=Math.round(size*1.2);
  return `<svg class="robot ${pose||''}" width="${w}" height="${h}" viewBox="0 0 200 240" aria-hidden="true">
  <ellipse class="r-shadow" cx="100" cy="230" rx="40" ry="7" fill="#FFA552" opacity=".38" filter="url(#rbSoft)"/>
  <g class="r-float">
    <g class="r-arm r-arm-l"><path d="M60 128 C 34 140 26 178 34 200 C 46 192 58 162 68 140 Z" fill="url(#rbShell)"/><circle cx="64" cy="132" r="11" fill="url(#rbMetal)"/></g>
    <g class="r-arm r-arm-r"><path d="M140 128 C 166 140 174 178 166 200 C 154 192 142 162 132 140 Z" fill="url(#rbShell)"/><circle cx="136" cy="132" r="11" fill="url(#rbMetal)"/></g>
    <path d="M100 112 C 138 112 148 146 141 176 C 134 204 116 220 100 220 C 84 220 66 204 59 176 C 52 146 62 112 100 112 Z" fill="url(#rbShell)"/>
    <rect x="98" y="156" width="4" height="22" rx="2" fill="#FFA552" filter="url(#rbGlow)"/>
    <rect x="86" y="100" width="28" height="16" rx="5" fill="url(#rbMetal)"/>
    <g class="r-head">
      <circle cx="44" cy="62" r="13" fill="url(#rbMetal)"/><circle cx="156" cy="62" r="13" fill="url(#rbMetal)"/>
      <rect x="40" y="16" width="120" height="92" rx="44" fill="url(#rbShell)"/>
      <rect x="52" y="28" width="96" height="66" rx="30" fill="#1A1215"/>
      <path d="M64 38 Q 84 31 112 33" stroke="#FFFFFF" stroke-opacity=".16" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g class="r-eye" filter="url(#rbGlow)" stroke="#FFA552" fill="none" stroke-width="5" stroke-linecap="round">${EYES[expr]||EYES.ring}</g>
      <g fill="#FFA552"><circle cx="134" cy="53" r="2.2"/><circle cx="134" cy="61" r="2.2"/><circle cx="134" cy="69" r="2.2"/></g>
    </g>
  </g>
</svg>`;
}

// ---------- charts ----------
function setupCanvas(cv){ const r=cv.getBoundingClientRect(); const d=window.devicePixelRatio||1; cv.width=Math.max(10,r.width*d); cv.height=Math.max(10,r.height*d); const ctx=cv.getContext('2d'); ctx.scale(d,d); return {ctx,w:r.width,h:r.height}; }
function drawK(cv,q,rev,view){
  if(!cv) return; const {ctx,w,h}=setupCanvas(cv);
  const i0 = (rev&&view==='ctx')?0:q.iq0, i1=(rev&&view==='ctx')?q.bars.length-1:q.iq1;
  const bars=q.bars.slice(i0,i1+1); const visEnd = rev? bars.length : q.ih-i0;
  const vis=bars.slice(0, rev?bars.length:visEnd);
  const pad={l:12,r:70,t:14,b:26};
  const hi=Math.max(...(rev?bars:vis).map(b=>b.h)), lo=Math.min(...(rev?bars:vis).map(b=>b.l));
  const span=(hi-lo)||1; const H=hi+span*0.06, L=lo-span*0.06;
  const y=v=>pad.t+(H-v)/(H-L)*(h-pad.t-pad.b); const bw=(w-pad.l-pad.r)/bars.length;
  const xi=i=>pad.l+i*bw;
  // shaded zones
  if(rev){
    if(view==='ctx'){ ctx.fillStyle='rgba(255,165,82,0.06)'; ctx.fillRect(xi(q.iq0-i0),0,(q.iq1-q.iq0+1)*bw,h-pad.b); }
    ctx.fillStyle='rgba(255,165,82,0.16)'; ctx.fillRect(xi(q.ih-i0),0,(q.iq1-q.ih+1)*bw,h-pad.b);
  }
  // grid + y labels
  ctx.strokeStyle='#5A2034'; ctx.lineWidth=1; ctx.fillStyle='#D3B7BE'; ctx.font='11px "IBM Plex Mono", monospace';
  for(let k=0;k<=4;k++){ const v=L+(H-L)*k/4, yy=y(v); ctx.beginPath(); ctx.moveTo(pad.l,yy); ctx.lineTo(w-pad.r,yy); ctx.stroke(); if(rev) ctx.fillText(num(v,q.dp), w-pad.r+6, yy+4); }
  // x labels (only when revealed: dates would give the answer away)
  if(rev && w>=520){ const step = view==='ctx'?6:3; let last=-1;
    bars.forEach((b,i)=>{ const d=new Date(b.t); const m=d.getUTCMonth(); if(m%step===0 && m!==last && d.getUTCDate()<=7){ last=m; ctx.fillStyle='#D3B7BE'; ctx.fillText(fmtM(b.t), xi(i), h-8); ctx.strokeStyle='#5A2034'; ctx.beginPath(); ctx.moveTo(xi(i),h-pad.b); ctx.lineTo(xi(i),h-pad.b+4); ctx.stroke(); } if(m%step!==0) last=-1; });
  }
  // candles
  (rev?bars:vis).forEach((b,i)=>{
    const x=xi(i)+bw/2, up=b.c>=b.o; const col= up?'#FFA552':'#C98F9D';
    ctx.strokeStyle=col; ctx.beginPath(); ctx.moveTo(x,y(b.h)); ctx.lineTo(x,y(b.l)); ctx.stroke();
    const top=y(Math.max(b.o,b.c)), bot=y(Math.min(b.o,b.c)); const hh=Math.max(1,bot-top); const cw=Math.max(1,bw*0.62);
    if(up){ ctx.fillStyle=col; ctx.fillRect(x-cw/2,top,cw,hh); } else { ctx.fillStyle='#2B0A15'; ctx.fillRect(x-cw/2,top,cw,hh); ctx.strokeRect(x-cw/2,top,cw,hh); }
  });
  // cover
  const x0=xi(q.ih-i0);
  if(!rev){ ctx.fillStyle='#4A1527'; ctx.fillRect(x0,0,w-pad.r-x0,h); const fs=Math.min(72,h*0.3); ctx.fillStyle='#FFA552'; ctx.font='900 '+fs+'px "Bodoni Moda", serif'; ctx.textAlign='center'; ctx.fillText('?', x0+(w-pad.r-x0)/2, h/2+fs/3); ctx.textAlign='left'; }
  ctx.strokeStyle='#FFA552'; ctx.setLineDash([5,5]); ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0,h-pad.b); ctx.stroke(); ctx.setLineDash([]);
  if(rev){ ctx.fillStyle='#FFA552'; ctx.font='600 12px "Noto Sans TC", sans-serif'; ctx.fillText('剛剛遮住的部分', x0+6, 16); if(view==='ctx'){ ctx.fillStyle='#D3B7BE'; ctx.fillText('題目區間', xi(q.iq0-i0)+6, 16); } }
}
function drawEst(cv,qi){
  if(!cv) return; const {ctx,w,h}=setupCanvas(cv); const q=Q[qi];
  const bins=[]; for(let v=q.min; v<q.max; v+=q.bin) bins.push({v,c:0});
  allPlayers().forEach(p=>{ const a=p.ans[qi]; if(a===undefined) return; bins[Math.min(bins.length-1,Math.floor((a-q.min)/q.bin))].c++; });
  const pad={l:20,r:20,t:34,b:26}; const mx=Math.max(1,...bins.map(b=>b.c)); const bw=(w-pad.l-pad.r)/bins.length;
  const x=v=>pad.l+(v-q.min)/(q.max-q.min)*(w-pad.l-pad.r);
  bins.forEach((b,i)=>{ const bh=(h-pad.t-pad.b)*b.c/mx; ctx.fillStyle='#9A4A60'; ctx.fillRect(pad.l+i*bw+1,h-pad.b-bh,bw-2,bh); if(b.c){ ctx.fillStyle='#D3B7BE'; ctx.font='11px "IBM Plex Mono", monospace'; ctx.textAlign='center'; ctx.fillText(b.c, pad.l+i*bw+bw/2, h-pad.b-bh-4); ctx.textAlign='left'; } });
  ctx.fillStyle='#D3B7BE'; ctx.font='11px "IBM Plex Mono", monospace'; ctx.textAlign='center';
  for(let v=q.min; v<=q.max; v+=1000) ctx.fillText(num(v), Math.min(w-pad.r-14,Math.max(pad.l+14,x(v))), h-8);
  const ax=x(q.answer); ctx.strokeStyle='#FFA552'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(ax,pad.t-8); ctx.lineTo(ax,h-pad.b); ctx.stroke();
  ctx.fillStyle='#FFA552'; ctx.font='600 13px "IBM Plex Mono", monospace'; ctx.fillText('答案 '+num(q.answer), ax, pad.t-14); ctx.textAlign='left';
  if(S.you && S.you.ans[qi]!==undefined){ const yx=x(S.you.ans[qi]); ctx.strokeStyle='#FFE0CF'; ctx.lineWidth=1; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(yx,pad.t); ctx.lineTo(yx,h-pad.b); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle='#FFE0CF'; ctx.fillText('你', yx+4, pad.t+12); }
}


// ---------- network (Firebase Realtime Database) ----------
const GAME_ID = (new URLSearchParams(location.search).get('g') || window.GAME_ID || 'gala2026').replace(/[^A-Za-z0-9_-]/g,'');
const PLAYER_URL = location.origin + location.pathname.replace(/host\.html$/,'').replace(/index\.html$/,'') + (GAME_ID==='gala2026' && !new URLSearchParams(location.search).get('g') ? '' : '?g='+GAME_ID);
const S = {phase:'title', qi:-1, players:[], you:null, rule:'suggested', kView:'win', roster:0, openedAt:0, draftName:'', draftTable:null, val:null};
const NET = {uid:null, db:null, base:null, offset:0, isHost:false, raw:{state:null, players:{}, answers:{}}};

function showErr(msg){
  let b=document.getElementById('errbar');
  if(!b){ b=document.createElement('div'); b.id='errbar'; b.setAttribute('role','alert'); document.body.appendChild(b); }
  b.textContent=msg; b.hidden=false; clearTimeout(showErr._t); showErr._t=setTimeout(()=>{ b.hidden=true; },6000);
}
function serverNow(){ return Date.now()+NET.offset; }

let _raf=0;
function scheduleRender(){ if(_raf) return; _raf=requestAnimationFrame(()=>{ _raf=0; rebuild(); render(); }); }

function rebuild(){
  const st=NET.raw.state||{phase:'title',qi:-1};
  const pr=NET.raw.players||{};
  const ids = st.roster ? Object.keys(st.roster).filter(id=>pr[id]) : Object.keys(pr);
  const objs = ids.map(id=>({id, name:pr[id].name, table:pr[id].table, bot:!!pr[id].bot, ans:{}, t:{}}));
  const byId = Object.fromEntries(objs.map(o=>[o.id,o]));
  Object.entries(NET.raw.answers||{}).forEach(([qk,m])=>{
    const qi=Number(qk.slice(1)); if(!m) return;
    Object.entries(m).forEach(([id,v])=>{ const o=byId[id]; if(o && v){ o.ans[qi]=v.a; o.t[qi]=v.t; } });
  });
  S.phase=st.phase||'title'; S.qi=(typeof st.qi==='number')?st.qi:-1; S.openedAt=st.openedAt||0;
  S.roster = st.roster ? objs.length : objs.length;
  if(NET.isHost){ S.you=null; S.players=objs; }
  else { S.you = byId[NET.uid]||null; S.players = objs.filter(o=>o.id!==NET.uid); }
}

NET.start = function(isHost, onReady){
  NET.isHost=isHost;
  const cfg=window.FIREBASE_CONFIG||{};
  if(!window.firebase || !cfg.apiKey || !cfg.databaseURL){
    document.body.innerHTML='<div class="setup"><h1>尚未完成設定</h1><p>請先在 config.js 填入 Firebase 的設定，再重新上傳到 Netlify。</p></div>';
    return;
  }
  firebase.initializeApp(cfg);
  NET.db=firebase.database();
  NET.base=NET.db.ref('games/'+GAME_ID);
  NET.db.ref('.info/serverTimeOffset').on('value',s=>{ NET.offset=s.val()||0; });
  firebase.auth().onAuthStateChanged(async user=>{
    if(!user){ firebase.auth().signInAnonymously().catch(e=>showErr('登入失敗：'+e.message)); return; }
    if(NET.uid===user.uid) return;
    NET.uid=user.uid;
    NET.base.child('state').on('value',s=>{ NET.raw.state=s.val(); scheduleRender(); }, e=>showErr('連線失敗：'+e.message));
    NET.base.child('players').on('value',s=>{ NET.raw.players=s.val()||{}; scheduleRender(); });
    const ar=NET.base.child('answers');
    ar.on('child_added',s=>{ NET.raw.answers[s.key]=s.val(); scheduleRender(); });
    ar.on('child_changed',s=>{ NET.raw.answers[s.key]=s.val(); scheduleRender(); });
    ar.on('child_removed',s=>{ delete NET.raw.answers[s.key]; scheduleRender(); });
    if(onReady) onReady(user.uid);
  });
};

// player actions
NET.join = function(name, table){
  return NET.base.child('players/'+NET.uid).set({name:name.slice(0,8), table, joinedAt:firebase.database.ServerValue.TIMESTAMP});
};
NET.answer = function(qi, value){
  if(!S.you || S.you.ans[qi]!==undefined) return;
  const t=Math.max(0, Math.round(serverNow()-(S.openedAt||serverNow())));
  S.you.ans[qi]=value; S.you.t[qi]=t; render();
  NET.base.child('answers/q'+qi+'/'+NET.uid).set({a:value, t}).catch(err=>{
    delete S.you.ans[qi]; delete S.you.t[qi]; lastPhoneKey=''; render();
    showErr('送出失敗，這題可能已經截止');
  });
};
