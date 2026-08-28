/* ═══ MusiccollectionCard — 門鎖＋GitHub 同步核心 ═══ */

/* ── 細工具 ── */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;
function showToast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.add('hidden'),2200); }

/* ── 本地儲存 ── */
const Store = {
  get(k,fb){ try{const v=localStorage.getItem('mcc_'+k);return v?JSON.parse(v):fb}catch(e){return fb} },
  set(k,v){ localStorage.setItem('mcc_'+k,JSON.stringify(v)) },
  del(k){ localStorage.removeItem('mcc_'+k) }
};

/* ── 密碼（SHA-256，只存 hash 喺本機） ── */
async function sha256hex(s){
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

/* ── GitHub API ── */
const API = {
  base(){ return `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.DATA_REPO}`; },
  headers(){ return { 'Authorization':`Bearer ${Store.get('pat','')}`,
                      'Accept':'application/vnd.github+json' }; },
  async verifyPAT(){
    const r=await fetch('https://api.github.com/user',{headers:this.headers()});
    if(!r.ok) throw new Error('PAT 無效（'+r.status+'）');
    const r2=await fetch(this.base(),{headers:this.headers()});
    if(r2.status===404) throw new Error('搵唔到 repo '+CONFIG.DATA_REPO+'（檢查名同 PAT 授權）');
    if(!r2.ok) throw new Error('repo 存取失敗（'+r2.status+'）');
    return true;
  },
  async getJSON(path,fallback){
    const r=await fetch(`${this.base()}/contents/${path}`,{headers:this.headers()});
    if(r.status===404) return fallback;
    if(!r.ok) throw new Error('讀取失敗 '+path+' ('+r.status+')');
    const j=await r.json();
    const bin=atob(j.content.replace(/\n/g,''));
    return JSON.parse(decodeURIComponent(escape(bin)));
  },
  async putJSON(path,obj,msg){
    let sha;
    const r0=await fetch(`${this.base()}/contents/${path}`,{headers:this.headers()});
    if(r0.ok) sha=(await r0.json()).sha;
    const b64=btoa(unescape(encodeURIComponent(JSON.stringify(obj,null,2))));
    const body={message:msg,content:b64,branch:CONFIG.DATA_BRANCH};
    if(sha) body.sha=sha;
    const r=await fetch(`${this.base()}/contents/${path}`,{method:'PUT',
      headers:{...this.headers(),'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok) throw new Error('寫入失敗 '+path+' ('+r.status+')');
  }
};

/* ── 離線同步隊列（斷網自動存本地，返嚟重試） ── */
const Queue = {
  all(){ return Store.get('queue',[]) },
  push(t){ const q=this.all(); q.push(t); Store.set('queue',q); setSyncBadge('pending') },
  async flush(){
    const q=this.all(); const left=[];
    for(const t of q){ try{ await API.putJSON(t.path,t.obj,t.msg) }catch(e){ left.push(t) } }
    Store.set('queue',left); setSyncBadge(left.length?'pending':'ok');
    return q.length-left.length;
  },
  count(){ return this.all().length }
};

/* ── 資料集合 ── */
const FILES={ works:'data/works.json', versions:'data/versions.json',
              people:'data/people.json', vocabCustom:'data/vocab-custom.json' };
const Data = {
  cache:{works:[],versions:[],people:[],vocabCustom:[]},
  async loadAll(){
    for(const k of Object.keys(FILES)){
      try{ this.cache[k]=await API.getJSON(FILES[k],[]) }catch(e){ this.cache[k]=[] }
    }
  },
  async save(coll,label){
    const msg=`笔记: ${label||coll} ${new Date().toLocaleString('zh-HK')}`;
    try{ await API.putJSON(FILES[coll],this.cache[coll],msg); setSyncBadge('ok'); return true }
    catch(e){ Queue.push({path:FILES[coll],obj:this.cache[coll],msg}); return false }
  }
};

/* ── 同步徽章 ── */
function setSyncBadge(state){
  const b=$('#sync-badge'); if(!b) return;
  b.textContent = state==='ok' ? '☁️✓' : '⏳';
  b.title = state==='ok' ? '已同步' : '有未同步記錄';
}

/* ── YouTube（免 API key：oEmbed＋縮圖 fallback） ── */
function ytID(url){
  const m=String(url||'').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m?m[1]:null;
}
async function ytFetch(url){
  const id=ytID(url); if(!id) return null;
  const out={id,title:'',channel:'',thumb:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`};
  const tryFetch=async u=>{ try{ const r=await fetch(u); if(r.ok) return await r.json() }catch(e){} return null };
  const j=await tryFetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
          || await tryFetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
  if(j){ out.title=j.title||''; out.channel=j.author_name||''; if(j.thumbnail_url) out.thumb=j.thumbnail_url }
  return out;
}
const ytStamp=(id,sec)=>`https://youtu.be/${id}?t=${sec}`;
const tsToSec=s=>{ const p=String(s).split(':').map(Number); return p.reduce((a,b)=>a*60+b,0)||0 };
const secToTs=s=>{ s=Math.round(s); const m=Math.floor(s/60); return `${m}:${String(s%60).padStart(2,'0')}` };

/* ── 門鎖 DOM 邏輯 ── */
const Auth = {
  async unlock(){
    const err=$('#lock-err'); err.textContent='';
    try{
      const has=!!Store.get('pwhash',null);
      if(!has){
        const p1=$('#pw-new1').value, p2=$('#pw-new2').value;
        if(p1.length<4) throw new Error('密碼至少 4 個字');
        if(p1!==p2) throw new Error('兩次密碼唔一致');
        Store.set('pwhash',await sha256hex(p1));
      }else{
        const p=$('#pw-in').value;
        if(await sha256hex(p)!==Store.get('pwhash')) throw new Error('密碼錯咗');
      }
      const pat=$('#pat-in').value.trim();
      if(!pat.startsWith('github_pat_')&&!pat.startsWith('ghp_')) throw new Error('PAT 格式好似唔啱');
      Store.set('pat',pat);
      await API.verifyPAT();
      Store.set('unlocked',true);
      enterApp();
    }catch(e){ err.textContent=e.message }
  }
};
function enterApp(){
  $('#page-lock').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#sync-badge').classList.remove('hidden');
  setSyncBadge(Queue.count()?'pending':'ok');
  document.dispatchEvent(new Event('app:ready'));
}

/* ── 開機 ── */
window.addEventListener('DOMContentLoaded',()=>{
  const has=!!Store.get('pwhash',null);
  $('#lock-set').classList.toggle('hidden',has);
  $('#lock-enter').classList.toggle('hidden',!has);
  $('#pat-in').value=Store.get('pat','');
  $('#btn-unlock').addEventListener('click',Auth.unlock);
  $('#btn-lock')?.addEventListener('click',()=>location.reload());
});
