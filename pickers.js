/* Kinetra — sélecteurs maison : remplacent les menus et l'horloge natifs d'Android.
   Les <select> et <input type="time"> restent dans la page (cachés) : le code qui lit ou écrit leur valeur ne change pas. */
(function(){
'use strict';
const css=`
.cs-native{display:none!important}
.cs-btn{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;background:var(--field);color:var(--ink);border:1.5px solid var(--line);border-radius:14px;padding:13px 14px;font:inherit;font-size:16px;font-weight:500;text-align:left;margin:0;transition:none}
.cs-btn:active{transform:none;border-color:var(--teal)}
.cs-btn:after{content:"";flex:none;width:8px;height:8px;border-right:2px solid var(--mut);border-bottom:2px solid var(--mut);transform:rotate(45deg) translate(-2px,-2px)}
.cs-ov{position:fixed;inset:0;background:rgba(5,15,22,.55);z-index:60;display:flex;align-items:flex-end;justify-content:center;animation:csIn .15s ease-out}
@keyframes csIn{from{opacity:0}to{opacity:1}}
.cs-sh{background:var(--card);color:var(--ink);width:100%;max-width:560px;border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px;max-height:82vh;box-shadow:0 -8px 30px rgba(0,0,0,.25)}
.cs-t{font-weight:700;font-size:17px;text-align:center}
.cs-list{overflow:auto;display:flex;flex-direction:column;gap:6px;min-height:0;-webkit-overflow-scrolling:touch}
.cs-opt{background:var(--field);color:var(--ink);border:0;border-radius:14px;padding:14px 16px;text-align:left;font:inherit;font-size:16px;font-weight:500;display:flex;justify-content:space-between;align-items:center;transition:none}
.cs-opt.on{background:var(--teal);color:var(--tealink);font-weight:700}
.cs-opt.on:after{content:"";width:9px;height:5px;border-left:2.5px solid currentColor;border-bottom:2.5px solid currentColor;transform:rotate(-45deg);margin-right:4px}
.cs-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0;max-height:50vh}
.cs-cols .cs-list{max-height:50vh}
.cs-acts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cs-acts button{padding:14px;font-size:16px;font-weight:700;border-radius:14px;border:0}
.cs-x{background:var(--soft);color:var(--ink)}
.cs-ok{background:var(--teal);color:var(--tealink)}
.cs-disp{font-size:34px;font-weight:700;text-align:center;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
`;
const st=document.createElement('style');st.id='cs-css';st.textContent=css;document.head.appendChild(st);

// ----- feuille modale (en bas de l'écran) -----
function sheet(title,body,actions){
  const ov=document.createElement('div');ov.className='cs-ov';
  const sh=document.createElement('div');sh.className='cs-sh';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');
  if(title){const t=document.createElement('div');t.className='cs-t';t.textContent=title;sh.appendChild(t)}
  sh.appendChild(body);
  const close=()=>{ov.remove();document.removeEventListener('keydown',onKey)};
  const onKey=e=>{if(e.key==='Escape')close()};
  if(actions&&actions.length){
    const row=document.createElement('div');row.className='cs-acts';
    actions.forEach(a=>{const b=document.createElement('button');b.type='button';b.className=a.cls;b.textContent=a.label;b.onclick=()=>a.run(close);row.appendChild(b)});
    sh.appendChild(row);
  }else{
    const b=document.createElement('button');b.type='button';b.className='cs-x';b.textContent=tr('Annuler');b.style.padding='14px';b.style.borderRadius='14px';b.style.border='0';b.style.fontSize='16px';b.style.fontWeight='700';b.onclick=close;sh.appendChild(b);
  }
  ov.appendChild(sh);
  ov.addEventListener('click',e=>{if(e.target===ov)close()});
  document.addEventListener('keydown',onKey);
  document.body.appendChild(ov);
  return {close,sh};
}
function tr(s){return typeof window.tr==='function'?window.tr(s):s}

// ----- menu déroulant -----
function openSelect(sel){
  const list=document.createElement('div');list.className='cs-list';
  [...sel.options].forEach(o=>{
    const b=document.createElement('button');b.type='button';
    b.className='cs-opt'+(o.value===sel.value?' on':'');
    b.textContent=o.text;
    b.onclick=()=>{
      const changed=sel.value!==o.value;
      sel.value=o.value;
      if(changed)sel.dispatchEvent(new Event('change',{bubbles:true}));
      syncOne(sel);
      s.close();
    };
    list.appendChild(b);
  });
  const s=sheet(sel.getAttribute('aria-label')||'',list,null);
  const cur=list.querySelector('.on');if(cur)cur.scrollIntoView({block:'center'});
}

// ----- heure (horloge à deux colonnes) -----
function openTime(inp){
  const cur=(inp.value||'09:00').split(':').map(Number);
  let h=cur[0]||0,m=cur[1]||0;
  const wrap=document.createElement('div');wrap.className='cs-cols';
  const disp=document.createElement('div');disp.className='cs-disp';
  const colH=document.createElement('div');colH.className='cs-list';
  const colM=document.createElement('div');colM.className='cs-list';
  const mins=[];for(let i=0;i<60;i+=5)mins.push(i);if(!mins.includes(m))mins.push(m);mins.sort((a,b)=>a-b);
  const pad=n=>String(n).padStart(2,'0');
  const paint=()=>{
    disp.textContent=pad(h)+':'+pad(m);
    colH.querySelectorAll('.cs-opt').forEach(b=>b.classList.toggle('on',+b.dataset.v===h));
    colM.querySelectorAll('.cs-opt').forEach(b=>b.classList.toggle('on',+b.dataset.v===m));
  };
  for(let i=0;i<24;i++){const b=document.createElement('button');b.type='button';b.className='cs-opt';b.dataset.v=i;b.textContent=pad(i)+' h';b.onclick=()=>{h=i;paint()};colH.appendChild(b)}
  mins.forEach(v=>{const b=document.createElement('button');b.type='button';b.className='cs-opt';b.dataset.v=v;b.textContent=pad(v)+' min';b.onclick=()=>{m=v;paint()};colM.appendChild(b)});
  wrap.appendChild(colH);wrap.appendChild(colM);
  const body=document.createElement('div');body.style.display='flex';body.style.flexDirection='column';body.style.gap='12px';
  body.appendChild(disp);body.appendChild(wrap);
  paint();
  const s=sheet('',body,[
    {label:tr('Annuler'),cls:'cs-x',run:c=>c()},
    {label:'OK',cls:'cs-ok',run:c=>{
      const v=pad(h)+':'+pad(m);
      if(inp.value!==v){inp.value=v;inp.dispatchEvent(new Event('change',{bubbles:true}))}
      syncOne(inp);c();
    }}
  ]);
  const sel=colH.querySelector('.on');if(sel)sel.scrollIntoView({block:'center'});
  const sel2=colM.querySelector('.on');if(sel2)sel2.scrollIntoView({block:'center'});
}

// ----- remplacement des contrôles natifs -----
function enhance(el){
  if(el.dataset.cs)return;
  el.dataset.cs='1';
  el.classList.add('cs-native');
  const b=document.createElement('button');
  b.type='button';
  b.className='cs-btn'+(el.className?' '+el.className.replace('cs-native','').trim():'');
  b.setAttribute('aria-label',el.getAttribute('aria-label')||'');
  b.onclick=()=>{el.tagName==='SELECT'?openSelect(el):openTime(el)};
  el.insertAdjacentElement('afterend',b);
  el._cs=b;
  syncOne(el);
}
function label(el){
  if(el.tagName==='SELECT'){const o=el.options[el.selectedIndex];return o?o.text:''}
  return el.value||'--:--';
}
function syncOne(el){
  const b=el._cs;if(!b)return;
  const t=label(el);
  if(b.textContent!==t)b.textContent=t;
  b.disabled=!!el.disabled;
}
function scan(){
  document.querySelectorAll('select:not([data-cs]),input[type=time]:not([data-cs])').forEach(enhance);
}
function syncAll(){
  document.querySelectorAll('[data-cs]').forEach(syncOne);
}
const mo=new MutationObserver(()=>scan());
function start(){
  scan();
  if(document.body)mo.observe(document.body,{subtree:true,childList:true});
  setInterval(syncAll,300);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();
