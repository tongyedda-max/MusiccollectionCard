/* ═══ vocab.js — 詞庫引擎＋管理頁 ═══ */
'use strict';

window.Vocab=(()=>{
  const seeds=[...(window.VOCAB_SEED_1||[]),...(window.VOCAB_SEED_2||[])];
  const cs=()=>Data.cache.vocabCustom||(Data.cache.vocabCustom=[]);

  function all(){
    const ov=new Set(cs().filter(c=>c.overrideOf).map(c=>c.cat+'::'+c.overrideOf));
    const out=seeds.filter(s=>!ov.has(s.cat+'::'+s.zh));
    cs().forEach(c=>{
      if(c.overrideOf){
        const base=seeds.find(s=>s.cat===c.cat&&s.zh===c.overrideOf)||{};
        out.push(Object.assign({},base,c,{custom:true,edited:true}));
      }else out.push(Object.assign({},c,{custom:true}));
    });
    return out;
  }
  const cats=()=>[...new Set(all().map(t=>t.cat).filter(Boolean))];
  const byCat=cat=>all().filter(t=>t.cat===cat);
  const search=q=>{ q=(q||'').toLowerCase().trim();
    return q?all().filter(t=>((t.zh||'')+' '+(t.en||'')+' '+(t.tag||'')+' '+(t.desc||'')).toLowerCase().includes(q)):all() };
  function addCustom(cat,term){
    if(cs().find(x=>x.cat===cat&&x.zh===term.zh&&!x.overrideOf)) return false;
    cs().push(Object.assign({id:'vc_'+Date.now()+Math.random().toString(36).slice(2,6),
      cat,zh:'',en:'',tag:'自訂',desc:'',createdAt:new Date().toISOString()},term,{cat}));
    Data.save('vocabCustom','詞條 '+term.zh);
    return true;
  }
  function override(cat,zh,patch){
    let c=cs().find(x=>x.overrideOf===zh&&x.cat===cat);
    if(!c){ c={id:'vc_'+Date.now(),cat,overrideOf:zh,zh}; cs().push(c) }
    Object.assign(c,patch);
    Data.save('vocabCustom','修改詞條 '+zh);
  }
  function remove(id){
    const i=cs().findIndex(x=>x.id===id);
    if(i>=0){ const c=cs()[i]; cs().splice(i,1); Data.save('vocabCustom','刪除詞條 '+(c.zh||'')) }
  }
  return {all,cats,byCat,search,addCustom,override,remove};
})();

window.VocabUI=(()=>{
  let cat='全部', q='', bound=false;

  function bindOnce(){
    if(bound) return; bound=true;
    $('#vocab-search').oninput=e=>{ q=e.target.value; render() };
    $('#btn-add-term').onclick=addTerm;
  }
  function render(){
    bindOnce();
    const cats=['全部',...Vocab.cats()];
    const cc=$('#vocab-cats'); cc.innerHTML='';
    cats.forEach(k=>{ const b=el('button','chip'+(cat===k?' sel':''),esc(k));
      b.onclick=()=>{ cat=k; render() }; cc.appendChild(b) });
    $('#vocab-count').textContent='共 '+Vocab.all().length+' 條';
    const items=(cat==='全部'?Vocab.search(q):Vocab.search(q).filter(t=>t.cat===cat));
    const list=$('#vocab-list'); list.innerHTML='';
    if(!items.length){ list.innerHTML='<p class="hint">搵唔到——換個字，或撳下面＋新增</p>'; return }
    items.forEach(t=>list.appendChild(termCard(t)));
  }
  function termCard(t){
    const d=el('div','vocab-item');
    d.innerHTML=`<span class="zh">${esc(t.zh||'')}</span> <span class="en">${esc(t.en||'')}</span>
      ${t.edited?'<span class="custom-mark">已改</span>':t.custom?'<span class="custom-mark">自訂</span>':''}
      <br><span class="tag">${esc(t.cat||'')}${t.tag?'・'+esc(t.tag):''}</span>
      ${t.desc?`<div class="desc">${esc(t.desc)}</div>`:''}`;
    const row=el('div','row2'); row.style.marginTop='.4rem';
    const e=el('button','ghost','✏️ 改'); e.style.minHeight='36px';
    e.onclick=()=>editTerm(t); row.appendChild(e);
    if(t.custom){
      const x=el('button','ghost','🗑 刪'); x.style.minHeight='36px';
      x.onclick=()=>{ Vocab.remove(t.id); render(); toast('已刪') }; row.appendChild(x);
    }
    d.appendChild(row); return d;
  }
  function editTerm(t){
    const isOv=!t.custom;
    Sheet.open(isOv?'修改預設詞條':'編輯自訂詞條',()=>`
      <p class="hint">${esc(t.cat||'')}${isOv?'・預設條目：改完標「已改」，喺列表刪除即還原':''}</p>
      <label>中文</label><input id="vt-zh" value="${esc(t.zh||'')}">
      <label>English</label><input id="vt-en" value="${esc(t.en||'')}">
      <label>tag</label><input id="vt-tag" value="${esc(t.tag||'')}">
      <label>說明</label><textarea id="vt-desc" rows="3">${esc(t.desc||'')}</textarea>
      <button class="primary wide" id="vt-ok">儲存</button>`,box=>{
      box.querySelector('#vt-ok').onclick=()=>{
        const zh=box.querySelector('#vt-zh').value.trim();
        const patch={ zh:zh||t.zh, en:box.querySelector('#vt-en').value.trim(),
          tag:box.querySelector('#vt-tag').value.trim(), desc:box.querySelector('#vt-desc').value.trim() };
        if(isOv){ Vocab.override(t.cat,t.zh,patch) }
        else{ const c=(Data.cache.vocabCustom||[]).find(x=>x.id===t.id);
          if(c) Object.assign(c,patch); Data.save('vocabCustom','改詞條 '+patch.zh) }
        Sheet.close(); render(); toast('已儲存');
      };
    });
  }
  function addTerm(){
    const cats=Vocab.cats(); let ccat=cats[0]||'自訂';
    Sheet.open('新增詞條',()=>`
      <div class="chip-row" id="va-cats"></div>
      <input id="va-zh" placeholder="中文（必要）">
      <input id="va-en" placeholder="English（可略）">
      <input id="va-tag" placeholder="tag（可略）">
      <textarea id="va-desc" rows="2" placeholder="說明（可略）"></textarea>
      <button class="primary wide" id="va-ok">加入</button>`,box=>{
      const cc=box.querySelector('#va-cats');
      const draw=()=>{ cc.innerHTML=''; cats.forEach(k=>{
        const b=el('button','chip'+(ccat===k?' sel':''),esc(k));
        b.onclick=()=>{ ccat=k; draw() }; cc.appendChild(b) }) };
      draw();
      box.querySelector('#va-ok').onclick=()=>{
        const zh=box.querySelector('#va-zh').value.trim();
        if(!zh) return toast('中文名必要');
        Vocab.addCustom(ccat,{ zh, en:box.querySelector('#va-en').value.trim(),
          tag:box.querySelector('#va-tag').value.trim(), desc:box.querySelector('#va-desc').value.trim() });
        Sheet.close(); render(); toast('已加：'+zh);
      };
    });
  }
  return {render};
})();
  
