/* ═══ main.js — 導航、底部選擇板、主頁、設定 ═══ */
'use strict';

/* Vocab 未載入時嘅後備（Part 4 vocab.js 會提供真身） */
if(!window.Vocab){
  window.Vocab={all:()=>[],byCat:()=>[],cats:()=>[],addCustom(){},search:()=>[]};
}

/* ── 小工具 ── */
function el(tag,cls,html){ const d=document.createElement(tag); if(cls)d.className=cls; if(html!=null)d.innerHTML=html; return d }
function catItems(cat,fb){ const a=(window.Vocab&&window.Vocab.byCat(cat))||[]; return a.length?a:(fb||[]).map(z=>({zh:z,en:'',tag:''})) }

/* ── 導航 ── */
let currentPage='home';
function nav(name){
  currentPage=name;
  $$('#content .page').forEach(p=>p.classList.add('hidden'));
  const pg=$('#page-'+name); if(pg) pg.classList.remove('hidden');
  $$('#bottomnav button[data-nav]').forEach(b=>b.classList.toggle('on',b.dataset.nav===name));
  window.scrollTo(0,0);
  if(window.Form && name!=='form'){ try{ Form.blur() }catch(e){} }
  if(name==='home') renderHome();
  if(name==='settings') renderSettings();
  if(name==='db' && window.Views) Views.render();
  if(name==='vocab' && window.VocabUI) VocabUI.render();
}

/* ── Sheet 引擎（支援疊層：揀嘢板→來源→返返轉頭） ── */
const Sheet={
  stack:[],
  open(title,build,onMount){ this.stack.push({title,build,onMount}); this._show() },
  _show(){
    const top=this.stack[this.stack.length-1]; if(!top) return;
    const s=$('#sheet'),c=$('#sheet-content');
    const html=(typeof top.build==='function')?top.build():top.build;
    c.innerHTML=`<div class="sheet-grip"></div><div class="sheet-title">${esc(top.title)}</div>`+html;
    s.classList.remove('hidden');
    s.onclick=e=>{ if(e.target===s) Sheet.close() };
    if(top.onMount) top.onMount(c);
  },
  close(){ this.stack.pop(); if(this.stack.length) this._show();
    else{ $('#sheet').classList.add('hidden'); $('#sheet-content').innerHTML='' } },
  closeAll(){ this.stack=[]; $('#sheet').classList.add('hidden'); $('#sheet-content').innerHTML='' }
};

/* ── 揀嘢板（chips＋搜尋＋🤷暫未確認＋🔍＋＋新增自訂） ── */
function openPicker(opt){
  const multi=!!opt.multi;
  let sel=(opt.selected||[]).filter(x=>x&&x!=='⏳');
  let items=opt.items||[];
  const build=()=>`
    <input id="pk-q" placeholder="🔍 打關鍵字過濾">
    ${opt.enableSearch===false?'':'<button class="ghost wide" id="pk-go">🔍 拎呢個字去 Google 搜尋</button>'}
    <div id="pk-chips" class="chip-row"></div>
    ${opt.enablePending===false?'':'<button class="ghost wide" id="pk-pd">🤷 暫未確認（之後再補）</button>'}
    ${opt.enableCustom===false?'':'<button class="ghost wide" id="pk-ad">＋ 新增自訂詞條</button><div id="pk-cf" class="hidden"></div>'}
    <div class="sheet-foot"><button class="primary wide" id="pk-ok">完成</button></div>`;
  Sheet.open(opt.title||'揀',build,box=>{
    const q=box.querySelector('#pk-q');
    const chips=box.querySelector('#pk-chips');
    const draw=()=>{
      const kw=(q.value||'').toLowerCase().trim();
      chips.innerHTML='';
      items.filter(it=>!kw||((it.zh||'')+(it.en||'')+(it.tag||'')).toLowerCase().includes(kw))
        .forEach(it=>{
          const b=el('button','chip'+(sel.includes(it.zh)?' sel':''),esc(it.zh));
          b.onclick=()=>{
            if(multi){ sel=sel.includes(it.zh)?sel.filter(x=>x!==it.zh):[...sel,it.zh]; b.classList.toggle('sel') }
            else{ sel=[it.zh]; chips.querySelectorAll('.chip').forEach(c=>c.classList.remove('sel')); b.classList.add('sel') }
          };
          chips.appendChild(b);
        });
      if(!chips.children.length) chips.innerHTML='<p class="hint">冇結果——可以新增自訂，或 🔍 去搜尋</p>';
    };
    q.oninput=draw; draw();
    box.querySelector('#pk-ok').onclick=()=>{ Sheet.close(); if(opt.onDone) opt.onDone(sel) };
    box.querySelector('#pk-pd')?.addEventListener('click',()=>{ Sheet.close(); if(opt.onDone) opt.onDone(['⏳']) });
    box.querySelector('#pk-go')?.addEventListener('click',()=>{
      const t=(q.value||'').trim();
      if(t) window.open('https://www.google.com/search?q='+encodeURIComponent(t));
    });
    box.querySelector('#pk-ad')?.addEventListener('click',()=>{
      const f=box.querySelector('#pk-cf'); if(!f) return;
      f.classList.remove('hidden');
      f.innerHTML=`<input id="cf-zh" placeholder="名（例：溫潤）"><input id="cf-en" placeholder="English（可略）"><button class="primary wide" id="cf-ok">加入並選用</button>`;
      f.querySelector('#cf-ok').onclick=()=>{
        const zh=f.querySelector('#cf-zh').value.trim();
        if(!zh) return toast('打個名先');
        window.Vocab.addCustom&&window.Vocab.addCustom(opt.customCat||'',{cat:opt.customCat||'',zh,en:f.querySelector('#cf-en').value.trim(),tag:'自訂',desc:''});
        if(multi) sel.push(zh); else sel=[zh];
        items=items.concat([{zh,en:'',tag:'自訂'}]);
        f.classList.add('hidden'); f.innerHTML='';
        draw(); toast('已加：'+zh);
      };
    });
  });
}

/* ── 假下拉掣（.pick）綁定 ── */
function pickBtn(sel,get,set,opt){
  const b=$(sel);
  const draw=()=>{ const v=get()||[];
    b.textContent=!v.length?'':(v[0]==='⏳'?'🤷 暫未確認':v.join('・'));
    b.classList.toggle('has',v.length>0&&v[0]!=='⏳'); };
  b.onclick=()=>openPicker(Object.assign({},opt,{selected:[...(get()||[])],
    onDone:v=>{ set(v); draw(); window.Form&&Form.touch&&Form.touch() }}));
  draw();
  return {draw};
}

/* ── ⭐ 評分掣 ── */
function starBtn(sel,get,set){
  const b=$(sel);
  const draw=()=>{ const n=get()||0; b.textContent=n?'⭐'.repeat(n):''; b.classList.toggle('has',n>0) };
  b.onclick=()=>Sheet.open('評分',[1,2,3,4,5].map(n=>`<button class="chip${get()===n?' sel':''}" data-n="${n}">${'⭐'.repeat(n)}</button>`).join(''),box=>{
    box.querySelectorAll('[data-n]').forEach(c=>c.onclick=()=>{ set(+c.dataset.n); Sheet.close(); draw() });
  });
  draw();
  return {draw};
}

/* ── 主頁 ── */
function renderHome(){
  $('#stat-works').textContent=Data.cache.works.length;
  $('#stat-perfs').textContent=Data.cache.versions.length;
  $('#stat-people').textContent=Data.cache.people.length;
  const pend=[];
  Data.cache.versions.forEach(v=>{
    (v.pending||[]).forEach(f=>pend.push({t:v.workName||v.yt.title||'未命名',f}));
  });
  const pl=$('#pending-list');
  pl.innerHTML=pend.length
    ? pend.slice(0,8).map(x=>`<div class="list-item"><div class="t"><b>${esc(x.t)}</b><span class="hint">${esc(x.f)} 待補</span></div></div>`).join('')
    : '<p class="hint">暫時冇嘢要補 👍</p>';
  const rl=$('#recent-list');
  rl.innerHTML=Data.cache.versions.slice(0,5).map(v=>{
    const who=(v.performers||[]).map(p=>p.name).join('・');
    return `<button class="list-item" data-nav="db" style="width:100%;text-align:left;background:none"><div class="t"><b>${esc(v.workName||v.yt.title||'未命名')}</b><span class="hint">${esc(who)} ${v.stars?'⭐'.repeat(v.stars):''}</span></div></button>`;
  }).join('')||'<p class="hint">仲未有記錄——貼條片開始 🎬</p>';
}

/* ── 設定 ── */
function renderSettings(){
  $('#set-user').textContent=CONFIG.GITHUB_USER;
  $('#set-repo').textContent=CONFIG.DATA_REPO;
  $('#set-pat-status').textContent=Store.get('pat','')?'✅ 已存（只喺你部機）':'❌ 未存';
  $('#set-stats').textContent=`作品 ${Data.cache.works.length}・版本 ${Data.cache.versions.length}・音樂人 ${Data.cache.people.length}・待同步 ${Queue.count()}`;
  $('#btn-renew-pat').onclick=()=>{
    Sheet.open('換 PAT',`<input id="np-pat" placeholder="github_pat_…"><button class="primary wide" id="np-ok">儲存新 PAT</button>`,box=>{
      box.querySelector('#np-ok').onclick=async()=>{
        const v=box.querySelector('#np-pat').value.trim();
        if(!v.startsWith('github_pat_')&&!v.startsWith('ghp_')) return toast('格式好似唔啱');
        Store.set('pat',v);
        try{ await API.verifyPAT(); toast('✅ PAT 已更新'); Sheet.close(); renderSettings() }
        catch(e){ toast('❌ '+e.message) }
      };
    });
  };
  $('#btn-retry-sync').onclick=async()=>{ const n=await Queue.flush(); toast(n?`☁️ 已補同步 ${n} 筆`:'冇嘢要同步'); renderSettings() };
  $('#btn-export').onclick=()=>{
    const blob=new Blob([JSON.stringify(Data.cache,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='musiccollection-export.json'; a.click();
  };
}

/* ── 全域點擊代理＋開機 ── */
document.addEventListener('click',e=>{
  const nv=e.target.closest('[data-nav]');
  if(nv){ nav(nv.dataset.nav) }
});
document.addEventListener('app:ready', async ()=>{
  await Data.loadAll();
  $('#btn-fab').onclick=()=>window.Form&&Form.newRecord();
  $('#btn-paste-go').onclick=()=>window.Form&&Form.newRecord($('#paste-link').value.trim());
  nav('home');
  if(Queue.count()){ const n=await Queue.flush(); if(n) toast(`☁️ 已補同步 ${n} 筆`) }
});
