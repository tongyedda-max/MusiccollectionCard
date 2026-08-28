/* ═══ form.js — 5步表單、內嵌播放器、落釘、分段、草稿 ═══ */
'use strict';

const Form=(()=>{

let FS=null, step=1, bound=false, tick=null;
FS={ step:1, yt:{id:'',url:'',title:'',channel:'',duration:''},
  performers:[], year:'', label:[], rectype:[], stars:0,
  tempo:[], timbre:[], style:[], oneline:'',
  workMode:'pick', workId:'', newWork:{composer:[],name:'',catalog:'',key:[],scoring:[],era:[]},
  pins:[], segments:[], likes:[], dislikes:[], changes:[''], experiments:[''] };

/* ── 草稿（自動存本地） ── */
const DKEY='mcc_draft';
let dTimer=null;
function touch(){ clearTimeout(dTimer); dTimer=setTimeout(draftSave,500) }
function draftSave(){ try{ localStorage.setItem(DKEY,JSON.stringify(FS)) }catch(e){} }
function draftLoad(){ try{ return JSON.parse(localStorage.getItem(DKEY)) }catch(e){ return null } }
function draftClear(){ localStorage.removeItem(DKEY) }
function blank(){ return { step:1, yt:{id:'',url:'',title:'',channel:'',duration:''},
  performers:[], year:'', label:[], rectype:[], stars:0,
  tempo:[], timbre:[], style:[], oneline:'',
  workMode:'pick', workId:'', newWork:{composer:[],name:'',catalog:'',key:[],scoring:[],era:[]},
  pins:[], segments:[], likes:[], dislikes:[], changes:[''], experiments:[''] } }

/* ── 詞庫後備（Part 5/6 種子載入前都有嘢揀） ── */
const FB={
  label:['DG','Decca','Sony','RCA','EMI','Philips','Mercury','Chandos','BIS','Warner','Naxos'],
  rectype:['錄音室','現場錄音','歷史錄音','電台存檔','影片'],
  tempo:['偏快','適中','偏慢'],
  timbre:['溫暖','明亮','深暗','圓潤','金屬感','柔美'],
  style:['忠譜','浪漫化','古樂/HIP','炫技','內斂詩意'],
  instrument:['小提琴','中提琴','大提琴','低音提琴','鋼琴','吉他','長笛','單簧管','小號','指揮','樂團','弦樂四重奏','鋼琴三重奏'],
  era:['巴洛克','古典','早期浪漫','晚期浪漫','印象派','現代','當代'],
  key:['C大調','a小調','G大調','e小調','D大調','b小調','A大調','f#小調','E大調','c#小調','F大調','d小調','Bb大調','g小調','Eb大調','c小調','Ab大調','f小調','Db大調','Bb小調','Gb大調','eb小調'],
  scoring:['獨奏','鋼琴伴奏','鋼琴三重奏','弦樂四重奏','室內樂','管弦樂','協奏曲'],
  section:['呈示部','發展部','再現部','第一主題','第二主題','過渡','華彩段','尾聲','宣敘段','詼諧曲','慢板樂章','終曲']
};

/* ── 進入表單 ── */
function newRecord(prefillUrl){
  const d=draftLoad();
  FS=blank();
  if(d&&(d.yt&&d.yt.url||d.pins&&d.pins.length||d.segments&&d.segments.length)) Object.assign(FS,d);
  if(prefillUrl&&!FS.yt.url) FS.yt.url=prefillUrl;
  nav('form');
  bind();
  restoreUI();
  go(Math.min(Math.max(FS.step||1,1),5));
  toast(d&&(d.yt&&d.yt.url||d.segments&&d.segments.length)?'已回復上次草稿':'新記錄開始 🎬');
}

const pickDraws=[];
function restoreUI(){
  $('#yt-url').value=FS.yt.url||'';
  $('#f-oneline').value=FS.oneline||'';
  $('#yt-duration-in').value=FS.yt.duration||'';
  drawYTPreview(); drawPerformers(); drawPins(); drawSegments(); drawWorkSelect();
  pickDraws.forEach(f=>f());
}

function bind(){
  if(bound) return; bound=true;
  $('#btn-fetch').onclick=doFetch;
  $('#yt-url').addEventListener('input',e=>{FS.yt.url=e.target.value;touch()});
  $('#f-oneline').addEventListener('input',e=>{FS.oneline=e.target.value;touch()});
  $('#yt-duration-in').addEventListener('input',e=>{FS.yt.duration=e.target.value;touch()});

  pickDraws.push(
    pickBtn('#f-label',()=>FS.label,v=>FS.label=v,{title:'Label',items:catItems('Label',FB.label),customCat:'Label'}).draw,
    pickBtn('#f-rectype',()=>FS.rectype,v=>FS.rectype=v,{title:'錄音類型',items:catItems('錄音類型',FB.rectype),customCat:'錄音類型'}).draw,
    starBtn('#f-stars',()=>FS.stars,v=>{FS.stars=v;touch()}).draw,
    pickBtn('#f-tempo',()=>FS.tempo,v=>FS.tempo=v,{title:'速度印象',multi:true,items:catItems('速度印象',FB.tempo),customCat:'速度印象'}).draw,
    pickBtn('#f-timbre',()=>FS.timbre,v=>FS.timbre=v,{title:'音色取向',multi:true,items:catItems('音色取向',FB.timbre),customCat:'音色取向'}).draw,
    pickBtn('#f-style',()=>FS.style,v=>FS.style=v,{title:'風格取向',multi:true,items:catItems('風格取向',FB.style),customCat:'風格取向'}).draw
  );

  /* 年份 */
  $('#f-year').onclick=()=>{
    const ys=[]; for(let y=2025;y>=1900;y--) ys.push(y);
    Sheet.open('錄音年份',`<div class="chip-row" id="yr-chips" style="max-height:45vh;overflow-y:auto"></div>
      <div class="sheet-foot"><input id="yr-in" inputmode="numeric" placeholder="自訂年份"><button class="primary wide" id="yr-ok">確定</button></div>`,box=>{
      const c=box.querySelector('#yr-chips');
      ys.forEach(y=>{ const b=el('button','chip'+(String(FS.year)===String(y)?' sel':''),String(y));
        b.onclick=()=>{FS.year=String(y);Sheet.close();drawYear();touch()}; c.appendChild(b) });
      box.querySelector('#yr-ok').onclick=()=>{
        const v=box.querySelector('#yr-in').value.trim();
        if(v){FS.year=v;Sheet.close();drawYear();touch()}
      };
    });
  };
  function drawYear(){ const b=$('#f-year'); b.textContent=FS.year?'年份 '+FS.year:''; b.classList.toggle('has',!!FS.year) }
  drawYear(); pickDraws.push(drawYear);

  $('#btn-add-performer').onclick=addPerformer;
  $('#btn-new-work').onclick=()=>{ FS.workMode=FS.workMode==='new'?'pick':'new'; drawWorkSelect(); touch() };
  $('#btn-add-segment').onclick=()=>editSegment(null,{});
  $('#btn-add-change').onclick=()=>{ if(FS.changes.length>=5) return toast('最多 5 行'); FS.changes.push(''); drawFinal(); touch() };
  $('#btn-save').onclick=save;
  $('#btn-prev').onclick=()=>{ if(step>1) go(step-1) };
  $('#btn-next').onclick=()=>{ if(step<5) go(step+1); else save() };
  bindPin();
}

/* ── 第①步：抓 YouTube ── */
async function doFetch(){
  const url=$('#yt-url').value.trim();
  if(!url) return toast('先貼連結');
  toast('抓取中…');
  const r=await ytFetch(url);
  if(!r){ FS.yt.id=ytID(url)||''; drawYTPreview(); touch(); return toast('抓唔到——唔緊要，之後手動補') }
  FS.yt=Object.assign({},FS.yt,r,{url});
  drawYTPreview(); touch(); toast('✅ 抓到了');
}
function drawYTPreview(){
  const box=$('#yt-preview');
  if(!FS.yt.id&&!FS.yt.title){ box.classList.add('hidden'); return }
  box.classList.remove('hidden');
  $('#yt-thumb').src=FS.yt.thumb||'';
  $('#yt-title').textContent=FS.yt.title||'（標題待補）';
  $('#yt-channel').textContent=FS.yt.channel||'';
}

/* ── 第②步：演奏者 ── */
function addPerformer(){ FS.performers.push({name:'',instrument:[]}); drawPerformers(); touch() }
function drawPerformers(){
  const c=$('#performer-rows'); c.innerHTML='';
  FS.performers.forEach((p,i)=>{
    const row=el('div','list-item');
    const nb=el('button','pick'+(p.name?' has':''),p.name?esc(p.name):'撳一下揀演奏者');
    nb.style.flex='1'; nb.style.minWidth='0';
    nb.onclick=()=>openPersonPicker(name=>{p.name=name;drawPerformers();touch()});
    const ib=el('button','pick'+(p.instrument.length?' has':''),p.instrument.length?esc(p.instrument.join('・')):'樂器');
    ib.style.flex='0 0 38%';
    ib.onclick=()=>openPicker({title:'樂器／角色',multi:true,selected:[...p.instrument],items:catItems('樂器',FB.instrument),customCat:'樂器',enablePending:false,onDone:v=>{p.instrument=v;drawPerformers();touch()}});
    const x=el('button','ghost','×'); x.style.flex='0 0 44px';
    x.onclick=()=>{FS.performers.splice(i,1);drawPerformers();touch()};
    row.append(nb,ib,x); c.appendChild(row);
  });
}
function personItems(){
  const own=Data.cache.people.map(p=>({zh:p.name,en:p.alias||'',tag:p.instrument||''}));
  const have=new Set(own.map(o=>o.zh));
  const seed=((window.Vocab&&window.Vocab.byCat('音樂人'))||[]).filter(s=>!have.has(s.zh));
  return own.concat(seed);
}
function openPersonPicker(onPick){
  const cats=['全部','小提琴','鋼琴','大提琴','指揮','樂團','四重奏','作曲家'];
  let cur='全部';
  Sheet.open('揀演奏者／音樂人',()=>`
    <input id="pp-q" placeholder="🔍 搜尋">
    <div class="chip-row" id="pp-cats"></div>
    <div id="pp-chips" class="chip-row" style="max-height:40vh;overflow-y:auto"></div>
    <button class="ghost wide" id="pp-new">＋ 名單冇？新增此人</button>
    <div id="pp-nf" class="hidden"></div>`,
  box=>{
    const q=box.querySelector('#pp-q');
    const cc=box.querySelector('#pp-cats');
    const chips=box.querySelector('#pp-chips');
    const drawC=()=>{ cc.innerHTML=''; cats.forEach(k=>{
      const b=el('button','chip'+(cur===k?' sel':''),k);
      b.onclick=()=>{cur=k;drawC();draw()}; cc.appendChild(b) }) };
    const draw=()=>{
      const kw=(q.value||'').toLowerCase().trim();
      chips.innerHTML='';
      personItems().filter(it=>
        (cur==='全部'||((it.zh+' '+(it.tag||'')).includes(cur)))&&
        (!kw||((it.zh+it.en+(it.tag||'')).toLowerCase().includes(kw))))
        .forEach(it=>{ const b=el('button','chip',esc(it.zh));
          b.onclick=()=>{Sheet.close();onPick(it.zh)}; chips.appendChild(b) });
      if(!chips.children.length) chips.innerHTML='<p class="hint">冇結果——用下面 ＋新增</p>';
    };
    q.oninput=draw; drawC(); draw();
    box.querySelector('#pp-new').onclick=()=>{
      const f=box.querySelector('#pp-nf'); f.classList.remove('hidden');
      f.innerHTML=`<input id="nf-name" placeholder="名"><button class="primary wide" id="nf-ok">加入此人</button>`;
      f.querySelector('#nf-ok').onclick=()=>{
        const name=f.querySelector('#nf-name').value.trim();
        if(!name) return toast('打個名先');
        if(!Data.cache.people.find(x=>x.name===name))
          Data.cache.people.push({id:'p_'+Date.now(),name,alias:'',type:'人',instrument:'',roles:[],styleEra:[],activeFrom:'',activeTo:'',oneline:'',sources:[],createdAt:new Date().toISOString()});
        Sheet.close(); onPick(name); toast('已加：'+name);
      };
    };
  });
}

/* ── 第③步：作品 ── */
function drawWorkSelect(){
  const c=$('#f-work-select'); c.innerHTML='';
  if(!Data.cache.works.length) c.innerHTML='<p class="hint">仲未有作品記錄——用下面 ＋新作品</p>';
  Data.cache.works.forEach(w=>{
    const label=(w.composer?w.composer+'・':'')+w.name;
    const b=el('button','chip'+(FS.workMode==='existing'&&FS.workId===w.id?' sel':''),esc(label));
    b.onclick=()=>{FS.workMode='existing';FS.workId=w.id;drawWorkSelect();touch()};
    c.appendChild(b);
  });
  const slot=$('#work-card-slot');
  if(FS.workMode==='new'){ slot.classList.remove('hidden'); drawNewWork(slot) }
  else{ slot.classList.add('hidden'); slot.innerHTML='' }
}
function drawNewWork(slot){
  slot.innerHTML='';
  const f=el('div','',`
    <h3>🆕 新作品卡</h3>
    <label>作曲家</label><button class="pick" id="nw-composer"></button>
    <label>作品名稱</label><input id="nw-name" placeholder="例：小提琴協奏曲">
    <label>作品編號</label><input id="nw-cat" placeholder="例 Op.77（可略）">
    <label>總調性</label><button class="pick" id="nw-key"></button>
    <label>編制</label><button class="pick" id="nw-sc"></button>
    <label>時期／樂派</label><button class="pick" id="nw-era"></button>`);
  slot.appendChild(f);
  const eraItems=(()=>{ const a=catItems('時期',FB.era);
    const b=(window.Vocab&&window.Vocab.byCat('樂派'))||[];
    const have=new Set(a.map(x=>x.zh)); return a.concat(b.filter(x=>!have.has(x.zh))) })();
  pickBtn('#nw-composer',()=>FS.newWork.composer,v=>{FS.newWork.composer=v;touch()},
    {title:'作曲家',items:((window.Vocab&&window.Vocab.byCat('音樂人'))||[]).filter(it=>(it.tag||'').includes('作曲家')),customCat:'音樂人'});
  pickBtn('#nw-key',()=>FS.newWork.key,v=>{FS.newWork.key=v;touch()},
    {title:'總調性',items:catItems('總調性',FB.key),customCat:'總調性'});
  pickBtn('#nw-sc',()=>FS.newWork.scoring,v=>{FS.newWork.scoring=v;touch()},
    {title:'編制',items:catItems('編制',FB.scoring),customCat:'編制'});
  pickBtn('#nw-era',()=>FS.newWork.era,v=>{FS.newWork.era=v;touch()},
    {title:'時期／樂派',multi:true,items:eraItems,customCat:'時期'});
  $('#nw-name').value=FS.newWork.name; $('#nw-name').oninput=e=>{FS.newWork.name=e.target.value;touch()};
  $('#nw-cat').value=FS.newWork.catalog; $('#nw-cat').oninput=e=>{FS.newWork.catalog=e.target.value;touch()};
}

/* ── 內嵌播放器 ── */
const PL={p:null,_vid:null,cbs:[],
  ensure(cb){
    if(window.YT&&window.YT.Player){cb();return}
    this.cbs.push(cb);
    if(!document.getElementById('yt-api-scr')){
      const s=document.createElement('script'); s.id='yt-api-scr';
      s.src='https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    }
    window.onYouTubeIframeAPIReady=()=>{(PL.cbs.splice(0)).forEach(f=>f())};
  },
  mount(){
    const vid=FS.yt.id; if(!vid) return;
    const box=$('#player-box'); if(!box) return;
    if(this._vid===vid&&this.p) return;
    this._vid=vid; box.innerHTML='';
    const holder=document.createElement('div'); box.appendChild(holder);
    this.ensure(()=>{ PL.p=new window.YT.Player(holder,
      {videoId:vid,playerVars:{rel:0,modestbranding:1,playsinline:1},events:{}}) });
  },
  cur(){ try{ return Math.round(PL.p&&PL.p.getCurrentTime?PL.p.getCurrentTime():0) }catch(e){ return 0 } },
  seek(s){ try{ if(PL.p&&PL.p.seekTo){ PL.p.seekTo(s,true); PL.p.playVideo&&PL.p.playVideo() } }catch(e){} }
};
function startTick(){
  stopTick();
  let st=$('#pin-now');
  if(!st){ st=el('div','hint'); st.id='pin-now'; $('#btn-pin').after(st) }
  tick=setInterval(()=>{ st.textContent='▶ 播到 '+secToTs(PL.cur()) },500);
}
function stopTick(){ if(tick){clearInterval(tick);tick=null} }

/* ── 落釘 ── */
function bindPin(){
  const pb=$('#btn-pin');
  let tmr=null,long=false,lastTouch=0;
  pb.addEventListener('contextmenu',e=>e.preventDefault());
  pb.addEventListener('touchstart',()=>{long=false;tmr=setTimeout(()=>{long=true;dropPin(true)},550)},{passive:true});
  pb.addEventListener('touchend',()=>{clearTimeout(tmr);lastTouch=Date.now();if(!long)dropPin(false)});
  pb.addEventListener('click',()=>{ if(Date.now()-lastTouch>800&&!('ontouchstart' in window)) dropPin(false) });
}
function dropPin(long){
  if(!FS.yt.id) return toast('先喺第①步貼條片連結');
  if(!PL.p) return manualPin(long);
  const sec=PL.cur();
  const p={ts:secToTs(sec),sec,done:false};
  FS.pins.push(p); drawPins(); touch();
  if(long) editSegment(null,{ts:p.ts,sec,fromPin:FS.pins.length-1});
  else toast('📌 落釘 '+p.ts);
}
function manualPin(long){
  Sheet.open('手動輸入時間',`<input id="mp-ts" inputmode="numeric" placeholder="mm:ss，例 3:42"><button class="primary wide" id="mp-ok">落釘</button>`,box=>{
    box.querySelector('#mp-ok').onclick=()=>{
      const s=tsToSec(box.querySelector('#mp-ts').value);
      const p={ts:secToTs(s),sec:s,done:false};
      FS.pins.push(p); Sheet.close(); drawPins(); touch();
      if(long) editSegment(null,{ts:p.ts,sec:s,fromPin:FS.pins.length-1});
    };
  });
}
function drawPins(){
  const c=$('#pin-list'); if(!c) return;
  c.innerHTML=FS.pins.length?'':'<p class="hint">聽到重要位就撳「⏱ 落釘」；之後喺度逐釘撳開寫筆記</p>';
  FS.pins.forEach((p,i)=>{
    const b=el('button','pin-item',`<span class="ts">📌 ${esc(p.ts)}</span><span class="hint">${p.done?'✓ 已寫':'待寫 →'}</span>`);
    b.onclick=()=>{
      PL.seek(p.sec);
      if(p.done&&FS.segments[p.segIdx]!=null) editSegment(p.segIdx);
      else editSegment(null,{ts:p.ts,sec:p.sec,fromPin:i});
    };
    c.appendChild(b);
  });
}

/* ── 分段卡 ── */
function drawSegments(){
  const c=$('#segment-rows'); c.innerHTML='';
  FS.segments.forEach((s,i)=>{
    const mark=s.mark==='copy'?'✅':s.mark==='avoid'?'⛔':s.mark==='neutral'?'👀':'';
    const b=el('button','seg-card');
    b.style.width='100%'; b.style.textAlign='left';
    b.innerHTML=`<div class="ts">⏱ ${esc(s.ts||'?')} ${esc(s.tsEnd?'– '+s.tsEnd:'')} ${mark}</div>
      <div class="chip-row">${[...(s.section||[]),...(s.timbre||[]),...(s.tech||[])].map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>
      ${s.stars?`<div>${'⭐'.repeat(s.stars)}</div>`:''}
      ${s.note?`<p class="hint">${esc(s.note.slice(0,60))}${s.note.length>60?'…':''}</p>`:''}
      ${(s.sources||[]).length?`<p class="hint">📎 來源×${s.sources.length}</p>`:''}`;
    b.onclick=()=>editSegment(i);
    c.appendChild(b);
  });
}
function editSegment(idx,pre){
  const isNew=(idx==null);
  const s=isNew?Object.assign({ts:'',sec:0,section:[],timbre:[],tech:[],stars:0,note:'',sources:[],mark:''},pre||{}):FS.segments[idx];
  const w={ts:s.ts||'',tsEnd:s.tsEnd||'',section:[...(s.section||[])],timbre:[...(s.timbre||[])],
    tech:[...(s.tech||[])],stars:s.stars||0,note:s.note||'',
    sources:JSON.parse(JSON.stringify(s.sources||[])),mark:s.mark||''};
  const build=()=>`
    <div class="row2"><div><label>開始</label><input id="sg-ts" value="${esc(w.ts)}" placeholder="0:00"></div>
    <div><label>結束（可略）</label><input id="sg-te" value="${esc(w.tsEnd)}" placeholder="3:15"></div></div>
    <label>段落位置</label><button class="pick" id="sg-sec"></button>
    <label>音色</label><button class="pick" id="sg-tim"></button>
    <label>技巧</label><button class="pick" id="sg-tec"></button>
    <label>評分</label><button class="pick" id="sg-star"></button>
    <label>✍️ 筆記（想寫幾長得幾長）</label><textarea id="sg-note" rows="4">${esc(w.note)}</textarea>
    <label>📎 資料來源</label><div id="sg-src"></div><button class="ghost wide" id="sg-addsrc">＋ 加來源</button>
    <label>呢段點用？</label><div class="chip-row" id="sg-mark"></div>
    <div class="sheet-foot">
      ${isNew?'':'<button class="ghost wide" id="sg-del">🗑 刪除呢段</button>'}
      <button class="primary wide" id="sg-ok">完成</button></div>`;
  Sheet.open(isNew?'新分段筆記':'編輯分段',build,box=>{
    const secItems=(()=>{ const a=catItems('曲式',FB.section);
      const b=catItems('結構',[]); const have=new Set(a.map(x=>x.zh));
      return a.concat(b.filter(x=>!have.has(x.zh))) })();
    pickBtn('#sg-sec',()=>w.section,v=>w.section=v,
      {title:'段落位置',multi:true,items:secItems,customCat:'曲式',enablePending:false,enableSearch:false});
    pickBtn('#sg-tim',()=>w.timbre,v=>w.timbre=v,
      {title:'音色',multi:true,items:catItems('音色取向',FB.timbre),customCat:'音色取向',enablePending:false,enableSearch:false});
    pickBtn('#sg-tec',()=>w.tech,v=>w.tech=v,
      {title:'技巧',multi:true,items:catItems('技巧面向',[]).concat(catItems('術語',[])),customCat:'技巧面向',enablePending:false,enableSearch:false});
    starBtn('#sg-star',()=>w.stars,v=>w.stars=v);
    box.querySelector('#sg-ts').oninput=e=>{w.ts=e.target.value};
    box.querySelector('#sg-te').oninput=e=>{w.tsEnd=e.target.value};
    const note=box.querySelector('#sg-note'); note.oninput=()=>{w.note=note.value};
    const mk=box.querySelector('#sg-mark');
    const marks=[['copy','✅ 抄'],['avoid','⛔ 避'],['neutral','👀 中性']];
    const drawMk=()=>{ mk.innerHTML=''; marks.forEach(([k,lab])=>{
      const b=el('button','chip'+(w.mark===k?' sel':''),lab);
      b.onclick=()=>{w.mark=(w.mark===k?'':k);drawMk()}; mk.appendChild(b) }) };
    drawMk();
    const drawSrc=()=>{ const c=box.querySelector('#sg-src');
      c.innerHTML=w.sources.length?'':'<p class="hint">冇來源都得；想加就撳下面</p>';
      w.sources.forEach((sr,i)=>{
        const d=el('div','src-item',`<span class="tag">${esc(sr.type)}</span>${esc(sr.note||'')}${sr.url?` <a href="${esc(sr.url)}" target="_blank">開↗</a>`:''}`);
        const x=el('button','chip','×'); x.style.minHeight='0'; x.style.padding='0 .5rem';
        x.onclick=()=>{w.sources.splice(i,1);drawSrc()};
        d.appendChild(x); c.appendChild(d);
      }) };
    drawSrc();
    box.querySelector('#sg-addsrc').onclick=()=>sourceSheet(w.sources,drawSrc);
    box.querySelector('#sg-ok').onclick=()=>{
      if(!w.ts&&!w.note&&!w.section.length&&!w.mark){ Sheet.close(); return }
      if(isNew){ FS.segments.push(w);
        if(pre&&pre.fromPin!=null&&FS.pins[pre.fromPin]){
          FS.pins[pre.fromPin].done=true; FS.pins[pre.fromPin].segIdx=FS.segments.length-1 } }
      else FS.segments[idx]=w;
      Sheet.close(); drawSegments(); drawPins(); touch();
    };
    const del=box.querySelector('#sg-del');
    if(del) del.onclick=()=>{ FS.segments.splice(idx,1); Sheet.close(); drawSegments(); drawPins(); touch() };
  });
}

/* ── 📎 來源 ── */
function sourceSheet(list,redraw){
  let type='📄 文章/論文';
  const types=['▶ YouTube','📖 維基','🎼 IMSLP','💬 留言區','📄 文章/論文','📚 書','🗣 人講'];
  Sheet.open('加資料來源',()=>`
    <input id="sr-url" placeholder="貼連結（會自動認類型）">
    <div class="chip-row" id="sr-types"></div>
    <input id="sr-note" placeholder="一句註：講咩嚟㗎／邊部分有用">
    <button class="primary wide" id="sr-add">＋ 加入呢個來源</button>
    <div class="sheet-foot"><button class="ghost wide" id="sr-done">完成</button></div>`,
  box=>{
    const tc=box.querySelector('#sr-types');
    const drawT=()=>{ tc.innerHTML=''; types.forEach(t=>{
      const b=el('button','chip'+(type===t?' sel':''),t);
      b.onclick=()=>{type=t;drawT()}; tc.appendChild(b) }) };
    drawT();
    box.querySelector('#sr-url').addEventListener('input',e=>{
      const u=e.target.value;
      if(/youtu\.?be/.test(u)) type=types[0];
      else if(/wikipedia/.test(u)) type=types[1];
      else if(/imslp/.test(u)) type=types[2];
      else if(u) type=types[4];
      drawT();
    });
    box.querySelector('#sr-add').onclick=()=>{
      const url=box.querySelector('#sr-url').value.trim();
      const note=box.querySelector('#sr-note').value.trim();
      if(!url&&!note) return toast('貼連結或打句註');
      list.push({type,url,note});
      box.querySelector('#sr-url').value=''; box.querySelector('#sr-note').value='';
      redraw&&redraw(); toast('已加來源');
    };
    box.querySelector('#sr-done').onclick=()=>Sheet.close();
  });
}

/* ── 第⑤步：總結 ── */
function segLabel(s){ return `${s.ts}${(s.note||s.section.join('・')||'分段').slice(0,18)}` }
function toggleListDraw(container,list){
  container.innerHTML='';
  list.forEach(t=>{
    const b=el('button','chip sel',esc(t));
    b.onclick=()=>{ const i=list.indexOf(t); if(i>=0)list.splice(i,1); touch(); toggleListDraw(container,list) };
    container.appendChild(b);
  });
  const add=el('button','chip tag-add','＋ 自加');
  add.onclick=()=>Sheet.open('自加',`<input id="ta-v" placeholder="打一句"><button class="primary wide" id="ta-ok">加入</button>`,box=>{
    box.querySelector('#ta-ok').onclick=()=>{
      const v=box.querySelector('#ta-v').value.trim();
      if(v){ list.push(v); Sheet.close(); toggleListDraw(container,list); touch() }
    };
  });
  container.appendChild(add);
}
function drawRows(c,list,ph,cap,withAdd){
  c.innerHTML='';
  list.forEach((v,i)=>{
    const row=el('div','row2');
    const inp=el('input'); inp.value=v; inp.placeholder=ph;
    inp.oninput=()=>{list[i]=inp.value;touch()};
    const x=el('button','ghost','×'); x.style.flex='0 0 44px';
    x.onclick=()=>{list.splice(i,1);drawRows(c,list,ph,cap,withAdd);touch()};
    row.append(inp,x); c.appendChild(row);
  });
  if(withAdd&&list.length<cap){
    const b=el('button','ghost wide','＋ 加一行');
    b.onclick=()=>{list.push('');drawRows(c,list,ph,cap,withAdd);touch()};
    c.appendChild(b);
  }
}
function drawFinal(){
  FS.segments.filter(s=>s.mark==='copy'&&!s._liked).forEach(s=>{s._liked=true;FS.likes.push(segLabel(s))});
  FS.segments.filter(s=>s.mark==='avoid'&&!s._dis).forEach(s=>{s._dis=true;FS.dislikes.push(segLabel(s))});
  toggleListDraw($('#like-candidates'),FS.likes);
  toggleListDraw($('#dislike-candidates'),FS.dislikes);
  drawRows($('#change-rows'),FS.changes,'對自己拉奏嘅改動…',5,false);
  drawRows($('#experiment-rows'),FS.experiments,'練習實驗…',3,true);
}
  
/* ── 儲存 ── */
function resolveWorkName(){
  if(FS.workMode==='existing'){ const w=Data.cache.works.find(x=>x.id===FS.workId);
    if(w) return (w.composer?w.composer+'・':'')+w.name }
  if(FS.workMode==='new'&&FS.newWork.name.trim())
    return (FS.newWork.composer.filter(x=>x!=='⏳')[0]?FS.newWork.composer.filter(x=>x!=='⏳')[0]+'・':'')+FS.newWork.name.trim();
  return FS.yt.title||'';
}
function collectPending(){
  const p=[];
  ['label','rectype','tempo','timbre','style'].forEach(k=>{
    if((FS[k]||[]).includes('⏳')) p.push({label:'Label',rectype:'錄音類型',tempo:'速度印象',timbre:'音色取向',style:'風格取向'}[k]) });
  if(!FS.yt.title) p.push('影片標題');
  if(FS.workMode==='new'&&!FS.newWork.name.trim()) p.push('作品名稱');
  if(!FS.year) p.push('錄音年份');
  return p;
}
async function save(){
  if(!FS.yt.id&&!FS.yt.title&&!FS.yt.url) return toast('至少貼條片或抓到標題先');
  const workName=resolveWorkName();
  const v={ id:'v_'+Date.now(), createdAt:new Date().toISOString(),
    yt:Object.assign({},FS.yt),
    performers:FS.performers.filter(p=>p.name).map(p=>({name:p.name,instrument:p.instrument.join('・')})),
    year:FS.year, label:FS.label.includes('⏳')?'':FS.label.join(''),
    rectype:FS.rectype.includes('⏳')?'':FS.rectype.join(''),
    stars:FS.stars,
    tempo:FS.tempo.filter(x=>x!=='⏳'), timbre:FS.timbre.filter(x=>x!=='⏳'), style:FS.style.filter(x=>x!=='⏳'),
    oneline:FS.oneline, workId:FS.workMode==='existing'?FS.workId:'', workName,
    segments:FS.segments, likes:[...FS.likes], dislikes:[...FS.dislikes],
    changes:FS.changes.filter(x=>x&&x.trim()), experiments:FS.experiments.filter(x=>x&&x.trim()),
    pending:collectPending() };
  Data.cache.versions.unshift(v);
  let newP=0;
  v.performers.forEach(p=>{
    if(!Data.cache.people.find(x=>x.name===p.name))
      Data.cache.people.push({id:'p_'+Date.now()+'_'+(newP++),name:p.name,alias:'',type:'人',
        instrument:p.instrument,roles:[],styleEra:[],activeFrom:'',activeTo:'',oneline:'',sources:[],createdAt:v.createdAt});
  });
  if(FS.workMode==='new'&&FS.newWork.name.trim()){
    const w={id:'w_'+Date.now(),composer:FS.newWork.composer.filter(x=>x!=='⏳').join(''),
      name:FS.newWork.name.trim(),catalog:FS.newWork.catalog||'',key:FS.newWork.key.join('')||'',
      scoring:FS.newWork.scoring.join('')||'',era:FS.newWork.era.filter(x=>x!=='⏳'),
      movements:[],background:'',dedication:'',similar:[],goals:{},sources:[],createdAt:v.createdAt};
    Data.cache.works.unshift(w); v.workId=w.id;
  }
  const r1=await Data.save('versions',workName||'版本記錄');
  if(newP) await Data.save('people',newP+' 位音樂人');
  if(v.workId&&FS.workMode==='new') await Data.save('works','新作品');
  draftClear(); FS=blank(); step=1;
  toast(r1?'✅ 已儲存並同步 GitHub':'📵 已存本地；上返網自動同步');
  nav('home');
}

/* ── 步驟切換 ── */
function go(n){
  step=n; FS.step=n; touch();
  $$('#page-form .step-pane').forEach(p=>p.classList.add('hidden'));
  const pn=$('#step-'+n); if(pn) pn.classList.remove('hidden');
  $$('#step-dots i').forEach((d,i)=>d.classList.toggle('on',i<n));
  $('#btn-prev').style.visibility=n===1?'hidden':'visible';
  $('#btn-next').textContent=n===5?'💾 儲存':'下一步 →';
  window.scrollTo(0,0);
  if(n===2) drawPerformers();
  if(n===3) drawWorkSelect();
  if(n===4){ PL.mount(); startTick(); drawPins(); drawSegments() } else stopTick();
  if(n===5) drawFinal();
}

return {
  newRecord, go, save, touch,
  blur(){ draftSave() }
};

})();


window.Form=Form;
