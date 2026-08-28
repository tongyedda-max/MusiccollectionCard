/* ═══ views.js — 資料庫三視圖＋版本詳情＋作品卡／音樂人卡 ═══ */
'use strict';

window.Views=(()=>{
  let view='table', ftype='全部', bound=false, gCenter=null;

  function bindOnce(){
    if(bound) return; bound=true;
    $$('#db-tabs button').forEach(b=>b.onclick=()=>{ view=b.dataset.view; render() });
    $('#db-search').oninput=()=>render();
  }
  function render(){
    bindOnce();
    $$('#db-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    $('#view-table').classList.toggle('hidden',view!=='table');
    $('#view-graph').classList.toggle('hidden',view!=='graph');
    $('#view-timeline').classList.toggle('hidden',view!=='timeline');
    if(view==='table') renderTable();
    else if(view==='graph') renderGraph();
    else renderTimeline();
  }

  /* ── 列表 ── */
  function renderTable(){
    const fb=$('#db-filters'); fb.innerHTML='';
    ['全部','作品','版本','音樂人'].forEach(k=>{
      const b=el('button','chip'+(ftype===k?' sel':''),k);
      b.onclick=()=>{ ftype=k; render() }; fb.appendChild(b);
    });
    const q=($('#db-search').value||'').toLowerCase().trim();
    const hit=s=>!q||String(s||'').toLowerCase().includes(q);
    const rows=[];
    if(ftype==='全部'||ftype==='作品') Data.cache.works.forEach(w=>{
      const name=(w.composer?w.composer+'・':'')+w.name;
      if(hit(name+' '+(w.era||[]).join(' ')))
        rows.push({t:'🎼 '+name,s:[w.key,w.scoring].filter(Boolean).join('・')||'作品',go:()=>openWork(w.id)});
    });
    if(ftype==='全部'||ftype==='版本') Data.cache.versions.forEach(v=>{
      const who=(v.performers||[]).map(p=>p.name).join('・');
      if(hit((v.workName||'')+' '+((v.yt&&v.yt.title)||'')+' '+who))
        rows.push({t:'🎬 '+(v.workName||(v.yt&&v.yt.title)||'未命名版本'),
          s:[who,v.year,v.stars?'⭐'.repeat(v.stars):'',(v.segments||[]).length?v.segments.length+' 段筆記':''].filter(Boolean).join('｜'),
          go:()=>versionSheet(v)});
    });
    if(ftype==='全部'||ftype==='音樂人') Data.cache.people.forEach(p=>{
      if(hit(p.name+' '+(p.alias||'')+' '+(p.instrument||'')))
        rows.push({t:'👤 '+p.name,s:[p.instrument,(p.roles||[]).join('・')].filter(Boolean).join('・')||'音樂人',
          go:()=>openMusician(p.id)});
    });
    const list=$('#view-table'); list.innerHTML='';
    if(!rows.length){ list.innerHTML='<p class="hint">冇結果</p>'; return }
    rows.forEach(r=>{ const b=el('button','list-item');
      b.style.cssText='width:100%;text-align:left;background:none';
      b.innerHTML=`<div class="t"><b>${esc(r.t)}</b><span class="hint">${esc(r.s)}</span></div>`;
      b.onclick=r.go; list.appendChild(b);
    });
  }

  /* ── 版本詳情 ── */
  function versionSheet(v){
    const w=Data.cache.works.find(x=>x.id===v.workId);
    const chips=a=>(a||[]).length?`<div class="chip-row">${a.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`:'';
    const seg=(v.segments||[]).map(s=>{
      const mark=s.mark==='copy'?'✅':s.mark==='avoid'?'⛔':s.mark==='neutral'?'👀':'';
      const link=(v.yt&&v.yt.id&&s.sec!=null)?`<a href="${ytStamp(v.yt.id,s.sec)}" target="_blank">▶跳去呢刻</a>`:'';
      return `<div class="seg-card">
        <div class="ts">⏱ ${esc(s.ts||'?')}${s.tsEnd?'–'+esc(s.tsEnd):''} ${mark} ${link}</div>
        ${(s.section||[]).concat(s.timbre||[],s.tech||[]).length?`<div class="chip-row">${(s.section||[]).concat(s.timbre||[],s.tech||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`:''}
        ${s.stars?`<div>${'⭐'.repeat(s.stars)}</div>`:''}
        ${s.note?`<p>${esc(s.note)}</p>`:''}
        ${(s.sources||[]).map(sr=>`<p class="hint">📎 ${esc(sr.type)} ${esc(sr.note||'')}</p>`).join('')}
      </div>`; }).join('');
    const html=`
      ${v.yt&&v.yt.id?`<a class="primary wide" style="display:block;text-align:center;text-decoration:none;margin:.4rem 0" href="https://youtu.be/${esc(v.yt.id)}" target="_blank">▶ 開 YouTube</a>`:''}
      ${w?`<p class="hint">作品：${esc((w.composer?w.composer+'・':'')+w.name)}</p>`:''}
      <div class="chip-row">${(v.performers||[]).map(p=>`<button class="chip" data-p="${esc(p.name)}">${esc(p.name)}${p.instrument?'・'+esc(p.instrument):''}</button>`).join('')}</div>
      ${chips([].concat(v.tempo||[],v.timbre||[],v.style||[]))}
      <p class="hint">${[v.year,v.label,v.rectype].filter(Boolean).join('・')} ${v.stars?'⭐'.repeat(v.stars):''}</p>
      ${v.oneline?`<p>💬 ${esc(v.oneline)}</p>`:''}
      <h3>逐段筆記</h3>${seg||'<p class="hint">冇分段</p>'}
      ${(v.likes||[]).length?`<h3>✅ 抄</h3>${chips(v.likes)}`:''}
      ${(v.dislikes||[]).length?`<h3>⛔ 避</h3>${chips(v.dislikes)}`:''}
      ${(v.changes||[]).length?`<h3>✍️ 改動</h3>${v.changes.map(c=>`<p>• ${esc(c)}</p>`).join('')}`:''}
      ${(v.experiments||[]).length?`<h3>🧪 實驗</h3>${v.experiments.map(c=>`<p>• ${esc(c)}</p>`).join('')}`:''}
      ${(v.pending||[]).length?`<p class="hint">⏳ 待補：${esc(v.pending.join('、'))}</p>`:''}
      <div class="sheet-foot">
        <button class="ghost wide" id="vs-copy">📄 複製做新記錄草稿</button>
        <button class="ghost wide" id="vs-del">🗑 刪除呢筆記錄</button>
      </div>`;
    Sheet.open(v.workName||'版本詳情',html,box=>{
      box.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ Sheet.closeAll(); openMusicianByName(b.dataset.p) });
      box.querySelector('#vs-copy').onclick=()=>{ Sheet.closeAll(); copyAsDraft(v) };
      box.querySelector('#vs-del').onclick=()=>{
        Sheet.open('確認刪除','<p>真係刪除呢筆？（GitHub 都會刪）</p><button class="primary wide" id="dl-yes">刪</button>',b2=>{
          b2.querySelector('#dl-yes').onclick=async()=>{
            const i=Data.cache.versions.findIndex(x=>x.id===v.id);
            if(i>=0){ Data.cache.versions.splice(i,1);
              await Data.save('versions','刪除 '+(v.workName||'版本')) }
            Sheet.closeAll(); render(); toast('已刪除');
          };
        });
      };
    });
  }
  function copyAsDraft(v){
    const d={ step:1, yt:Object.assign({id:'',url:'',title:'',channel:'',duration:''},v.yt),
      performers:(v.performers||[]).map(p=>({name:p.name,instrument:p.instrument?String(p.instrument).split('・'):[]})),
      year:v.year||'', label:v.label?[v.label]:[], rectype:v.rectype?[v.rectype]:[],
      stars:v.stars||0, tempo:[...(v.tempo||[])], timbre:[...(v.timbre||[])], style:[...(v.style||[])],
      oneline:v.oneline||'', workMode:v.workId?'existing':'pick', workId:v.workId||'',
      newWork:{composer:[],name:'',catalog:'',key:[],scoring:[],era:[]},
      pins:[], segments:JSON.parse(JSON.stringify(v.segments||[])),
      likes:[...(v.likes||[])], dislikes:[...(v.dislikes||[])],
      changes:[...(v.changes||[])], experiments:[...(v.experiments||[])] };
    d.segments.forEach(s=>{ if(s.mark==='copy')s._liked=true; if(s.mark==='avoid')s._dis=true });
    try{ localStorage.setItem('mcc_draft',JSON.stringify(d)) }catch(e){}
    window.Form&&Form.newRecord();
  }

  /* ── 關係圖（放射狀，撳邊個跳邊個做中心） ── */
  function relations(c){
    const V=Data.cache.versions, rel=[];
    if(c.type==='person'){
      const mine=V.filter(v=>(v.performers||[]).some(p=>p.name===c.name));
      const co={};
      mine.forEach(v=>(v.performers||[]).forEach(p=>{ if(p.name!==c.name) co[p.name]=(co[p.name]||0)+1 }));
      Object.entries(co).sort((a,b)=>b[1]-a[1]).slice(0,4)
        .forEach(([n,k])=>rel.push({type:'person',name:n,sub:'合作×'+k}));
      mine.slice(0,2).forEach(v=>rel.push({type:'version',id:v.id,name:(v.workName||(v.yt&&v.yt.title)||'版本').slice(0,10),sub:v.year||''}));
      [...new Set(mine.map(v=>v.workId).filter(Boolean))].slice(0,2).forEach(id=>{
        const w=Data.cache.works.find(x=>x.id===id);
        if(w) rel.push({type:'work',id,name:w.name.slice(0,10),sub:w.composer||''});
      });
    }else if(c.type==='work'){
      const mine=V.filter(v=>v.workId===c.id);
      const per={};
      mine.forEach(v=>(v.performers||[]).forEach(p=>per[p.name]=(per[p.name]||0)+1));
      Object.entries(per).sort((a,b)=>b[1]-a[1]).slice(0,4)
        .forEach(([n,k])=>rel.push({type:'person',name:n,sub:'錄×'+k}));
      mine.slice(0,3).forEach(v=>rel.push({type:'version',id:v.id,
        name:((v.performers||[]).map(p=>p.name).join('・')||'版本').slice(0,10),sub:v.year||''}));
    }else{
      const v=V.find(x=>x.id===c.id);
      if(v){
        if(v.workId){ const w=Data.cache.works.find(x=>x.id===v.workId);
          if(w) rel.push({type:'work',id:w.id,name:w.name.slice(0,10)}) }
        (v.performers||[]).slice(0,5).forEach(p=>rel.push({type:'person',name:p.name,sub:p.instrument||''}));
      }
    }
    return rel.slice(0,8);
  }
  function nodeSVG(x,y,r,i,color){
    const nm=r.name||'', l1=nm.slice(0,7), l2=nm.length>7?nm.slice(7,14):'';
    return `<g data-gi="${i}" style="cursor:pointer">
      <circle cx="${x}" cy="${y}" r="30" fill="${color}" opacity=".92"/>
      <text x="${x}" y="${y-1}" text-anchor="middle" font-size="9" font-weight="700" fill="#1a1a1a">${esc(l1)}</text>
      ${l2?`<text x="${x}" y="${y+9}" text-anchor="middle" font-size="9" font-weight="700" fill="#1a1a1a">${esc(l2)}</text>`:''}
      ${r.sub?`<text x="${x}" y="${y+43}" text-anchor="middle" font-size="8" fill="#9a9aad">${esc(r.sub)}</text>`:''}
    </g>`;
  }
  function renderGraph(){
    const box=$('#view-graph');
    const P=Data.cache.people, W=Data.cache.works, V=Data.cache.versions;
    if(!P.length&&!W.length&&!V.length){ box.innerHTML='<p class="hint">有咗記錄先有關係圖</p>'; return }
    if(!gCenter){
      const cnt={}; V.forEach(v=>(v.performers||[]).forEach(p=>cnt[p.name]=(cnt[p.name]||0)+1));
      const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
      gCenter= top?{type:'person',name:top[0]}
        :(W[0]?{type:'work',id:W[0].id,name:W[0].name}:{type:'version',id:V[0].id,name:V[0].workName||'版本'});
    }
    const rel=relations(gCenter), C=180, R=128;
    const col=t=>t==='person'?'#e8b04b':t==='work'?'#8ab4f8':'#7bc47f';
    let svg='<svg viewBox="0 0 360 360" style="width:100%;max-width:420px;display:block;margin:0 auto">';
    rel.forEach((r,i)=>{ const a=-Math.PI/2+i*2*Math.PI/rel.length;
      svg+=`<line x1="${C}" y1="${C}" x2="${C+R*Math.cos(a)}" y2="${C+R*Math.sin(a)}" stroke="#33334a" stroke-width="1.5"/>` });
    rel.forEach((r,i)=>{ const a=-Math.PI/2+i*2*Math.PI/rel.length;
      svg+=nodeSVG(C+R*Math.cos(a),C+R*Math.sin(a),r,i,col(r.type)) });
    svg+=`<g data-gc="1" style="cursor:pointer">
      <circle cx="${C}" cy="${C}" r="34" fill="${col(gCenter.type)}"/>
      <text x="${C}" y="${C+4}" text-anchor="middle" font-size="10" font-weight="800" fill="#1a1a1a">${esc((gCenter.name||'').slice(0,8))}</text>
    </g></svg>`;
    box.innerHTML=`<div class="panel">
      <button class="ghost wide" id="g-repick">🔄 揀中心</button>${svg}
      <p class="hint">撳圓圈＝跳去嗰個做中心；撳中間粒＝開佢張卡</p></div>`;
    box.querySelectorAll('[data-gi]').forEach(n=>n.onclick=()=>{
      const r=rel[+n.dataset.gi];
      gCenter = r.type==='person'?{type:'person',name:r.name}:{type:r.type,id:r.id,name:r.name};
      renderGraph();
    });
    box.querySelectorAll('[data-gc]').forEach(n=>n.onclick=()=>centerOpen(gCenter));
    $('#g-repick').onclick=pickCenter;
  }
  function centerOpen(c){
    if(c.type==='person') openMusicianByName(c.name);
    else if(c.type==='work') openWork(c.id);
    else{ const v=Data.cache.versions.find(x=>x.id===c.id); if(v) versionSheet(v) }
  }
  function pickCenter(){
    const items=[
      ...Data.cache.people.map(p=>({t:'👤 '+p.name,go:()=>{gCenter={type:'person',name:p.name};Sheet.close();renderGraph()}})),
      ...Data.cache.works.map(w=>({t:'🎼 '+((w.composer?w.composer+'・':'')+w.name),go:()=>{gCenter={type:'work',id:w.id,name:w.name};Sheet.close();renderGraph()}})),
      ...Data.cache.versions.slice(0,10).map(v=>({t:'🎬 '+(v.workName||(v.yt&&v.yt.title)||'版本'),go:()=>{gCenter={type:'version',id:v.id,name:v.workName||'版本'};Sheet.close();renderGraph()}}))
    ];
    Sheet.open('揀關係圖中心',items.map((it,i)=>`<button class="ghost wide" data-pc="${i}">${esc(it.t)}</button>`).join(''),box=>{
      box.querySelectorAll('[data-pc]').forEach(b=>b.onclick=items[+b.dataset.pc].go);
    });
  }

  /* ── 時間軸 ── */
  function renderTimeline(){
    const box=$('#view-timeline');
    const vs=[...Data.cache.versions].sort((a,b)=>String(b.year||'').localeCompare(String(a.year||'')));
    if(!vs.length){ box.innerHTML='<p class="hint">仲未有版本記錄</p>'; return }
    let cur=null, html='';
    vs.forEach(v=>{
      const y=v.year||'年份待補';
      if(y!==cur){ if(cur!==null)html+='</div>'; html+=`<div class="panel"><h3>${esc(y)}</h3>`; cur=y }
      const who=(v.performers||[]).map(p=>p.name).join('・');
      html+=`<button class="list-item tl-item" data-id="${esc(v.id)}" style="width:100%;text-align:left;background:none">
        <div class="t"><b>${esc(v.workName||(v.yt&&v.yt.title)||'未命名')}</b>
        <span class="hint">${esc(who)} ${v.stars?'⭐'.repeat(v.stars):''}</span></div></button>`;
    });
    box.innerHTML=html+'</div>';
    box.querySelectorAll('.tl-item').forEach(b=>b.onclick=()=>{
      const v=Data.cache.versions.find(x=>x.id===b.dataset.id); if(v) versionSheet(v);
    });
  }

  /* ── 作品卡 ── */
  function openWork(id){
    const src=id?Data.cache.works.find(x=>x.id===id):null;
    const w=src?JSON.parse(JSON.stringify(src)):
      {id:'w_'+Date.now(),composer:'',name:'',catalog:'',key:'',scoring:'',edition:'',era:[],movements:[],
       background:'',dedication:'',similar:[],similarNote:'',goals:{},sources:[],createdAt:new Date().toISOString()};
    nav('work');
    $('#w-name').value=w.name||'';       $('#w-name').oninput=e=>{w.name=e.target.value};
    $('#w-background').value=w.background||''; $('#w-background').oninput=e=>{w.background=e.target.value};
    $('#w-dedication').value=w.dedication||''; $('#w-dedication').oninput=e=>{w.dedication=e.target.value};
    $('#w-similar-note').value=w.similarNote||''; $('#w-similar-note').oninput=e=>{w.similarNote=e.target.value};
    ['narrative','tempo','timbre','style','structure'].forEach(k=>{
      const inp=$('#goal-'+k); inp.value=(w.goals&&w.goals[k])||'';
      inp.oninput=e=>{ w.goals=w.goals||{}; w.goals[k]=e.target.value };
    });
    pickBtn('#w-composer',()=>w.composer?[w.composer]:[],v=>{w.composer=v.filter(x=>x!=='⏳').join('')},
      {title:'作曲家',items:(window.Vocab?Vocab.byCat('音樂人'):[]).filter(t=>(t.tag||'').includes('作曲家')),customCat:'音樂人'});
    pickBtn('#w-catalog',()=>w.catalog?[w.catalog]:[],v=>{w.catalog=v.join('')},
      {title:'作品編號',items:[],customCat:'作品編號',enablePending:false});
    pickBtn('#w-key',()=>w.key?[w.key]:[],v=>{w.key=v.join('')},
      {title:'總調性',items:catItems('總調性',[]),customCat:'總調性',enablePending:false});
    pickBtn('#w-scoring',()=>w.scoring?[w.scoring]:[],v=>{w.scoring=v.join('')},
      {title:'編制',items:catItems('編制',[]),customCat:'編制',enablePending:false});
    pickBtn('#w-era',()=>[...(w.era||[])],v=>{w.era=v.filter(x=>x!=='⏳')},
      {title:'時期／樂派',multi:true,items:catItems('時期',[]).concat(catItems('樂派',[])),customCat:'時期'});
    pickBtn('#w-edition',()=>w.edition?[w.edition]:[],v=>{w.edition=v.join('')},
      {title:'樂譜版本',items:catItems('樂譜版本',[]),customCat:'樂譜版本',enablePending:false});
    pickBtn('#w-similar',()=>[...(w.similar||[])],v=>{w.similar=v},
      {title:'同類作品',multi:true,items:Data.cache.works.filter(x=>x.id!==w.id).map(x=>({zh:(x.composer?x.composer+'・':'')+x.name})),enablePending:false,enableCustom:false});
    drawMovements(w); drawSources(w,'w-sources');
    $('#btn-add-movement').onclick=()=>{ w.movements.push({name:'',form:''}); drawMovements(w) };
    $('#page-work .src-add').onclick=()=>srcSheet(w.sources,()=>drawSources(w,'w-sources'));
    $('#btn-save-work').onclick=async()=>{
      if(!w.name.trim()) return toast('作品名稱必要');
      const i=Data.cache.works.findIndex(x=>x.id===w.id);
      if(i>=0) Data.cache.works[i]=w; else Data.cache.works.unshift(w);
      await Data.save('works',w.name);
      toast('✅ 作品卡已存'); nav('db'); render();
    };
  }
  function drawMovements(w){
    const c=$('#movement-rows'); c.innerHTML='';
    w.movements=w.movements||[];
    if(!w.movements.length) c.innerHTML='<p class="hint">逐個樂章加：名＋曲式</p>';
    w.movements.forEach((m,i)=>{
      const row=el('div','row2');
      const inp=el('input'); inp.value=m.name||''; inp.placeholder='樂章名／速度標記';
      inp.oninput=()=>{m.name=inp.value};
      const f=el('button','pick'+(m.form?' has':''),m.form||'曲式'); f.style.flex='0 0 34%';
      f.onclick=()=>openPicker({title:'曲式',items:catItems('曲式',[]),customCat:'曲式',
        enablePending:false,selected:m.form?[m.form]:[],onDone:v=>{m.form=v.join('');drawMovements(w)}});
      const x=el('button','ghost','×'); x.style.flex='0 0 44px';
      x.onclick=()=>{w.movements.splice(i,1);drawMovements(w)};
      row.append(inp,f,x); c.appendChild(row);
    });
  }

  /* ── 音樂人卡 ── */
  function openMusician(id,presetName){
    const src=id?Data.cache.people.find(x=>x.id===id):null;
    const m=src?JSON.parse(JSON.stringify(src)):
      {id:'p_'+Date.now(),name:presetName||'',alias:'',type:'人',instrument:'',roles:[],styleEra:[],
       activeFrom:'',activeTo:'',oneline:'',sources:[],createdAt:new Date().toISOString()};
    nav('musician');
    $('#m-name').value=m.name||'';   $('#m-name').oninput=e=>{m.name=e.target.value};
    $('#m-alias').value=m.alias||''; $('#m-alias').oninput=e=>{m.alias=e.target.value};
    $('#m-oneline').value=m.oneline||''; $('#m-oneline').oninput=e=>{m.oneline=e.target.value};
    $('#m-active-from').value=m.activeFrom||''; $('#m-active-from').oninput=e=>{m.activeFrom=e.target.value};
    $('#m-active-to').value=m.activeTo||'';     $('#m-active-to').oninput=e=>{m.activeTo=e.target.value};
    pickBtn('#m-type',()=>[m.type].filter(Boolean),v=>{m.type=v.join('')},
      {title:'類型',items:[{zh:'人'},{zh:'樂團'},{zh:'弦樂四重奏'},{zh:'室內樂組合'},{zh:'合唱團'}],enablePending:false,enableCustom:false});
    pickBtn('#m-instrument',()=>m.instrument?[m.instrument]:[],v=>{m.instrument=v.join('・')},
      {title:'樂器',items:catItems('樂器',[]),customCat:'樂器',enablePending:false});
    pickBtn('#m-roles',()=>[...(m.roles||[])],v=>{m.roles=v},
      {title:'Roles',multi:true,items:catItems('Roles',[]),customCat:'Roles',enablePending:false});
    pickBtn('#m-styleera',()=>[...(m.styleEra||[])],v=>{m.styleEra=v},
      {title:'Style-Era',multi:true,items:catItems('時期',[]).concat(catItems('樂派',[])),customCat:'時期',enablePending:false});
    drawSources(m,'m-sources');
    $('#page-musician .src-add').onclick=()=>srcSheet(m.sources,()=>drawSources(m,'m-sources'));
    $('#btn-save-musician').onclick=async()=>{
      if(!m.name.trim()) return toast('名稱必要');
      const i=Data.cache.people.findIndex(x=>x.id===m.id);
      if(i>=0) Data.cache.people[i]=m; else Data.cache.people.unshift(m);
      await Data.save('people',m.name);
      toast('✅ 音樂人卡已存'); nav('db'); render();
    };
  }
  function openMusicianByName(name){
    const p=Data.cache.people.find(x=>x.name===name);
    openMusician(p?p.id:null,name);
  }

  /* ── 📎 來源（作品卡／音樂人卡共用） ── */
  function drawSources(obj,containerId){
    const c=$('#'+containerId); c.innerHTML='';
    obj.sources=obj.sources||[];
    if(!obj.sources.length) c.innerHTML='<p class="hint">冇來源；想加就撳下面</p>';
    obj.sources.forEach((sr,i)=>{
      const d=el('div','src-item',`<span class="tag">${esc(sr.type)}</span>${esc(sr.note||'')}${sr.url?` <a href="${esc(sr.url)}" target="_blank">開↗</a>`:''}`);
      const x=el('button','chip','×'); x.style.minHeight='0'; x.style.padding='0 .5rem';
      x.onclick=()=>{obj.sources.splice(i,1);drawSources(obj,containerId)};
      d.appendChild(x); c.appendChild(d);
    });
  }
  function srcSheet(list,redraw){
    const types=['▶ YouTube','📖 維基','🎼 IMSLP','💬 留言區','📄 文章/論文','📚 書','🗣 人講'];
    let type='📄 文章/論文';
    Sheet.open('加資料來源',()=>`
      <input id="sr2-url" placeholder="貼連結（自動認類型）">
      <div class="chip-row" id="sr2-types"></div>
      <input id="sr2-note" placeholder="一句註：講咩嚟㗎／邊部分有用">
      <button class="primary wide" id="sr2-add">＋ 加入呢個來源</button>
      <div class="sheet-foot"><button class="ghost wide" id="sr2-done">完成</button></div>`,box=>{
      const tc=box.querySelector('#sr2-types');
      const dt=()=>{ tc.innerHTML=''; types.forEach(t=>{
        const b=el('button','chip'+(type===t?' sel':''),t);
        b.onclick=()=>{type=t;dt()}; tc.appendChild(b) }) };
      dt();
      box.querySelector('#sr2-url').addEventListener('input',e=>{ const u=e.target.value;
        if(/youtu\.?be/.test(u))type=types[0]; else if(/wikipedia/.test(u))type=types[1];
        else if(/imslp/.test(u))type=types[2]; else if(u)type=types[4]; dt() });
      box.querySelector('#sr2-add').onclick=()=>{
        const url=box.querySelector('#sr2-url').value.trim(), note=box.querySelector('#sr2-note').value.trim();
        if(!url&&!note) return toast('貼連結或打句註');
        list.push({type,url,note});
        box.querySelector('#sr2-url').value=''; box.querySelector('#sr2-note').value='';
        redraw&&redraw(); toast('已加來源');
      };
      box.querySelector('#sr2-done').onclick=()=>Sheet.close();
    });
  }

  return {render,openWork,openMusician};
})();
