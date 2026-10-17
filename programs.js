// ===== Kinetra : programmes d'entraînement =====
// Dépend de : D, $, save, day, esc, fmt, render, rest, go (dans index.html) et Bonhomme (bonhomme.js)
const X=(n,s,r,t,b)=>({n,s,r,t:t||90,b:!!b});
const PRESETS=[
{id:'fb3',name:'Full body 3 jours',lvl:'Débutant',where:'Salle',freq:'3 séances par semaine',
 desc:'Tout le corps à chaque séance, en alternant A et B. Le plus simple pour apprendre les mouvements.',
 sessions:[
  {n:'Full body A',ex:[X('Squat',3,'6-8',150),X('Développé couché',3,'6-8',150),X('Rowing barre',3,'8-10',120),X('Développé militaire',2,'8-10',120),X('Gainage',3,'30-45 s',60,1)]},
  {n:'Full body B',ex:[X('Soulevé de terre roumain',3,'8-10',150),X('Développé incliné haltères',3,'8-10',120),X('Tirage vertical',3,'8-10',120),X('Fentes',2,'10-12',90),X('Curl biceps',2,'10-12',60)]}
 ]},
{id:'ul4',name:'Haut / bas 4 jours',lvl:'Intermédiaire',where:'Salle',freq:'4 séances par semaine',
 desc:'Deux séances haut du corps, deux séances bas du corps. Par exemple lundi haut, mardi bas, jeudi haut, vendredi bas.',
 sessions:[
  {n:'Haut A',ex:[X('Développé couché',4,'6-8',150),X('Rowing barre',4,'6-8',150),X('Développé militaire',3,'8-10',120),X('Tirage vertical',3,'8-10',90),X('Curl biceps',2,'10-12',60),X('Extension triceps poulie',2,'10-12',60)]},
  {n:'Bas A',ex:[X('Squat',4,'6-8',150),X('Soulevé de terre roumain',3,'8-10',150),X('Presse à cuisses',3,'10-12',120),X('Leg curl',3,'10-12',90),X('Mollets debout',4,'10-15',60)]},
  {n:'Haut B',ex:[X('Développé incliné haltères',4,'8-10',120),X('Tractions',4,'6-10',150),X('Rowing haltère',3,'8-10',90),X('Élévations latérales',3,'12-15',60),X('Face pull',3,'12-15',60),X('Curl marteau',2,'10-12',60)]},
  {n:'Bas B',ex:[X('Soulevé de terre',3,'5',180),X('Fentes bulgares',3,'8-10',120),X('Hip thrust',3,'8-12',120),X('Leg extension',3,'12-15',90),X('Mollets assis',4,'12-15',60)]}
 ]},
{id:'ppl',name:'Push / Pull / Legs',lvl:'Intermédiaire',where:'Salle',freq:'3 à 6 séances par semaine',
 desc:'Trois séances qui se répètent : pousser, tirer, jambes. Une fois chacune pour 3 jours par semaine, ou deux fois pour 6 jours.',
 sessions:[
  {n:'Push',ex:[X('Développé couché',4,'6-8',150),X('Développé militaire',3,'8-10',120),X('Développé incliné haltères',3,'8-10',120),X('Élévations latérales',3,'12-15',60),X('Extension triceps poulie',3,'10-12',60)]},
  {n:'Pull',ex:[X('Rowing barre',4,'6-8',150),X('Tractions',3,'6-10',150),X('Rowing poulie assis',3,'10-12',90),X('Face pull',3,'12-15',60),X('Curl biceps',3,'10-12',60),X('Curl marteau',2,'10-12',60)]},
  {n:'Legs',ex:[X('Squat',4,'6-8',150),X('Soulevé de terre roumain',3,'8-10',150),X('Presse à cuisses',3,'10-12',120),X('Leg curl',3,'10-12',90),X('Mollets debout',4,'10-15',60)]}
 ]},
{id:'home',name:'Maison, sans matériel',lvl:'Débutant',where:'Maison',freq:'3 séances par semaine',
 desc:'Aucun matériel : une chaise et un mur suffisent. Alterne A et B. Quand les séries deviennent faciles, ajoute des répétitions.',
 sessions:[
  {n:'Maison A',ex:[X('Squat au poids du corps',3,'12-15',60,1),X('Pompes',3,'8-12',90,1),X('Fentes arrière',3,'10-12',60,1),X('Pont fessier',3,'12-15',60,1),X('Gainage',3,'30-45 s',60,1)]},
  {n:'Maison B',ex:[X('Squat bulgare (pied sur une chaise)',3,'8-10',90,1),X('Pompes inclinées (mains sur une chaise)',3,'10-15',60,1),X('Pont fessier à une jambe',3,'8-12',60,1),X('Superman',3,'12-15',60,1),X('Gainage latéral',3,'20-30 s',60,1)]}
 ]}
];

let pDraft={},pFlash='',pEd=null;
const pSame=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
const pNum=n=>String(Math.round(n*100)/100).replace('.',',');
const pTimed=r=>/s\s*$/.test(String(r).trim());
const pTop=r=>parseInt(String(r).split('-').pop());
const pNewId=()=>{let id=Date.now();const u=new Set([...D.sets,...D.meals,...D.progs].map(x=>x.id));while(u.has(id))id++;return id};
const pNames=()=>[...new Set([...PRESETS,...D.progs].flatMap(p=>p.sessions.flatMap(s=>s.ex.map(x=>x.n))))];
const pFind=id=>PRESETS.find(p=>p.id===id)||D.progs.find(p=>p.id===id)||null;
function pCur(){const a=D.act;if(!a||a.id==null)return null;const p=pFind(a.id);if(!p||!p.sessions.length)return null;return{p,i:Math.min(a.i||0,p.sessions.length-1)}}

// Dernière séance (hors aujourd'hui) pour cet exercice
function pLast(name){
  const L=D.sets.filter(s=>pSame(s.ex,name)&&s.d!==day());if(!L.length)return null;
  const dd=L.reduce((m,s)=>s.d>m?s.d:m,'');return L.filter(s=>s.d===dd).sort((a,b)=>a.id-b.id);
}
function pPrefill(x){
  const today=D.sets.filter(s=>s.d===day()&&pSame(s.ex,x.n)).sort((a,b)=>a.id-b.id);
  const reps0=parseInt(x.r)||'';
  if(today.length){const l=today[today.length-1];return{kg:l.kg||'',reps:pTimed(x.r)?(l.sec||''):(l.reps||''),hint:''}}
  const prev=pLast(x.n);
  if(!prev)return{kg:'',reps:reps0,hint:x.b?'':'Première fois : commence avec une charge légère.'};
  if(x.b||prev.every(s=>!s.kg))return{kg:'',reps:reps0,hint:'Dernière fois : '+prev.map(s=>s.sec?s.sec+' s':s.reps+' rép.').join(', ')+'.'};
  const mx=Math.max(...prev.map(s=>s.kg)),reps=prev.map(s=>s.reps).join(', ');
  const hit=!pTimed(x.r)&&prev.length>=x.s&&prev.every(s=>s.reps>=pTop(x.r));
  if(hit){const nk=Math.round((mx+2.5)*100)/100;return{kg:nk,reps:reps0,hint:'Dernière fois : '+pNum(mx)+' kg × '+reps+'. Objectif atteint : essaie '+pNum(nk)+' kg.'}}
  return{kg:mx,reps:reps0,hint:'Dernière fois : '+pNum(mx)+' kg × '+reps+'.'};
}

// ----- Séance du jour (dans l'onglet Séance)
function renderProg(){
  const box=$('progBox');if(!box)return;
  const c=pCur();
  if(!c){box.innerHTML=`<div class="pg-card"><h3>Programme</h3><p class="mut" style="margin:0 0 12px">Aucun programme en cours. Choisis-en un dans l'onglet Programmes pour suivre tes séances ici.</p><div class="row"><button class="sec" onclick="go('plans')">Voir les programmes</button></div></div>`;return}
  const p=c.p,i=c.i,s=p.sessions[i];
  const rows=s.ex.map((x,ei)=>{
    const key=p.id+'|'+i+'|'+ei,dr=pDraft[key]||{},pf=pPrefill(x);
    const kv=dr.k!==undefined?dr.k:pf.kg,rv=dr.r!==undefined?dr.r:pf.reps;
    const done=D.sets.filter(t=>t.d===day()&&pSame(t.ex,x.n)).length;
    const dots=Array.from({length:x.s},(_,k)=>`<i class="${k<done?'f':''}"></i>`).join('')+(done>x.s?`<span>+${done-x.s}</span>`:'');
    const timed=pTimed(x.r),hasDemo=!!(window.Bonhomme&&Bonhomme.find(x.n));
    return `<div class="pg-ex"><div class="pg-exh"><b>${esc(x.n)}</b><span class="mut num">${x.s} × ${esc(x.r.replace('-','–'))}</span><span class="pg-dots" role="img" aria-label="${done} séries faites sur ${x.s}">${dots}</span></div>`
      +(pf.hint?`<div class="pg-hint">${esc(pf.hint)}</div>`:'')
      +`<div class="pg-in${x.b?' nb':''}">`
      +(x.b?'':`<input id="pk_${ei}" type="number" inputmode="decimal" step="any" placeholder="kg" aria-label="Charge en kg" value="${esc(kv)}">`)
      +`<input id="pr_${ei}" type="number" inputmode="numeric" placeholder="${timed?'sec':'rép.'}" aria-label="${timed?'Secondes':'Répétitions'}" value="${esc(rv)}">`
      +`<button onclick="pLog(${ei})">Valider</button></div><div class="pg-err" id="pe_${ei}"></div>`
      +(hasDemo?`<details class="pg-demo"><summary>Voir le geste</summary><div class="pg-dm" data-n="${esc(x.n)}"></div></details>`:'')
      +`</div>`;
  }).join('');
  box.innerHTML=`<div class="pg-card"><div class="pg-head"><div><h3>${esc(s.n)}</h3><span class="mut">${esc(p.name)}</span></div>`
    +(p.sessions.length>1?`<select id="pSess" onchange="pPick(this.value)" aria-label="Changer de séance">${p.sessions.map((q,k)=>`<option value="${k}"${k===i?' selected':''}>${esc(q.n)}</option>`).join('')}</select>`:'')
    +`</div>`+(pFlash?`<div class="pg-flash">${esc(pFlash)}</div>`:'')+rows
    +`<div class="row"><button class="sec" onclick="pFinish()">Terminer la séance</button><button class="del" onclick="pStop()">Arrêter le programme</button></div></div>`;
  box.querySelectorAll('details.pg-demo').forEach(d=>d.addEventListener('toggle',()=>{if(d.open){const m=d.querySelector('.pg-dm');if(m&&!m.hasChildNodes())Bonhomme.mount(m,m.dataset.n)}}));
}
const pBox=document.getElementById('progBox');
if(pBox){
  pBox.addEventListener('input',e=>{
    const m=(e.target.id||'').match(/^p([kr])_(\d+)$/);if(!m)return;
    const c=pCur();if(!c)return;
    const key=c.p.id+'|'+c.i+'|'+m[2];(pDraft[key]=pDraft[key]||{})[m[1]==='k'?'k':'r']=e.target.value;
    const er=$('pe_'+m[2]);if(er)er.textContent='';
  });
}
function pLog(ei){
  const c=pCur();if(!c)return;
  const x=c.p.sessions[c.i].ex[ei],er=$('pe_'+ei);
  const reps=parseFloat($('pr_'+ei).value);
  const kg=x.b?0:parseFloat($('pk_'+ei).value);
  if(isNaN(reps)||reps<=0){er.textContent=pTimed(x.r)?'Entre la durée en secondes.':'Entre le nombre de répétitions.';return}
  if(isNaN(kg)||kg<0){er.textContent='Entre la charge en kg (0 si poids du corps).';return}
  const rec=pTimed(x.r)?{id:pNewId(),d:day(),ex:x.n,kg:0,reps:0,sec:reps}:{id:pNewId(),d:day(),ex:x.n,kg,reps};
  D.sets.push(rec);delete pDraft[c.p.id+'|'+c.i+'|'+ei];pFlash='';
  save();render();rest(x.t||90);
}
function pPick(v){if(!D.act)return;D.act={id:D.act.id,i:+v,t:Date.now()};pDraft={};pFlash='';save();render()}
function pFinish(){
  const c=pCur();if(!c)return;
  const n=c.p.sessions.length,nx=(c.i+1)%n;
  D.act={id:c.p.id,i:nx,t:Date.now()};pDraft={};
  pFlash=n>1?'Séance terminée. Prochaine séance : '+c.p.sessions[nx].n+'.':'Séance terminée.';
  save();render();scrollTo(0,0);
}
function pStart(id){D.act={id,i:0,t:Date.now()};pDraft={};pFlash='';save();go('seance')}
function pStop(){if(!confirm('Arrêter le programme en cours ?'))return;D.act={id:null,i:0,t:Date.now()};pDraft={};pFlash='';save();render()}

// ----- Onglet Programmes
const pExLine=x=>`<li><span>${esc(x.n)}</span><span class="mut num">${x.s} × ${esc(x.r.replace('-','–'))}</span></li>`;
function pCard(p,custom){
  const on=D.act&&D.act.id===p.id,id=JSON.stringify(p.id);
  const tags=custom?`<span class="pg-tag">${p.sessions.length} ${p.sessions.length>1?'séances':'séance'}</span>`:`<span class="pg-tag">${esc(p.lvl)}</span><span class="pg-tag">${esc(p.where)}</span><span class="pg-tag">${esc(p.freq)}</span>`;
  const acts=`<div class="row"><button onclick='pStart(${id})'>${on?'Recommencer au début':'Commencer ce programme'}</button></div><div class="row">`
    +(custom?`<button class="sec" onclick='pEdit(${id})'>Modifier</button><button class="del" onclick='pDel(${id})'>Supprimer</button>`:`<button class="sec" onclick='pCustomize(${id})'>Personnaliser</button>`)+`</div>`;
  return `<details class="pg-prog" data-id="${esc(p.id)}"><summary><span class="pg-pt">${esc(p.name)}${on?' <span class="pg-tag pg-on">En cours</span>':''}</span><span class="pg-tags">${tags}</span></summary><div class="pg-pb">`
    +(p.desc?`<p class="mut" style="margin:0">${esc(p.desc)}</p>`:'')
    +p.sessions.map(s=>`<div class="pg-sname">${esc(s.n)}</div><ul class="pg-exl">${s.ex.map(pExLine).join('')}</ul>`).join('')+acts+`</div></details>`;
}
function renderPlans(){
  const L=$('plansList');if(!L)return;
  const open=new Set([...L.querySelectorAll('details[open]')].map(d=>d.dataset.id));
  const c=pCur();let h='';
  if(c)h+=`<div class="pg-card"><h3>Programme en cours</h3><p style="margin:0 0 4px"><b>${esc(c.p.name)}</b></p><p class="mut" style="margin:0 0 12px">Prochaine séance : ${esc(c.p.sessions[c.i].n)}</p><div class="row"><button onclick="go('seance')">Ouvrir la séance</button></div></div>`;
  h+=`<div class="pg-sec">Prêts à l'emploi</div>`+PRESETS.map(p=>pCard(p,false)).join('');
  h+=`<div class="pg-sec">Mes programmes</div>`+(D.progs.length?D.progs.map(p=>pCard(p,true)).join(''):`<p class="mut" style="margin:6px 2px">Tu n'as pas encore créé de programme.</p>`);
  h+=`<div class="row"><button class="sec" onclick="pNew()">Créer un programme</button></div><p class="mut" style="margin:18px 2px 0">Ces programmes sont des repères généraux, pas un avis médical. En cas de douleur ou de blessure, demande l'avis d'un médecin ou d'un coach.</p>`;
  L.innerHTML=h;
  L.querySelectorAll('details').forEach(d=>{if(open.has(d.dataset.id))d.open=true});
}

// ----- Éditeur de programme
const pBlank=()=>({n:'',s:3,r:'8-12',t:90,b:false});
function pShowEd(){$('plansList').classList.add('hide');$('plansEdit').classList.remove('hide');pRenderEd();scrollTo(0,0)}
function pHideEd(){pEd=null;$('plansEdit').classList.add('hide');$('plansList').classList.remove('hide');scrollTo(0,0);render()}
function pNew(){pEd={id:pNewId(),isNew:true,name:'',sessions:[{n:'',ex:[pBlank()]}]};pShowEd()}
function pEdit(id){const p=D.progs.find(x=>x.id===id);if(!p)return;pEd=JSON.parse(JSON.stringify(p));pEd.isNew=false;pShowEd()}
function pCustomize(id){const p=PRESETS.find(x=>x.id===id);if(!p)return;pEd={id:pNewId(),isNew:true,name:p.name+' (perso)',sessions:JSON.parse(JSON.stringify(p.sessions))};pShowEd()}
function pDel(id){
  const p=D.progs.find(x=>x.id===id);if(!p||!confirm('Supprimer « '+p.name+' » ?'))return;
  D.progs=D.progs.filter(x=>x.id!==id);D.del.push(id);
  if(D.act&&D.act.id===id)D.act={id:null,i:0,t:Date.now()};
  save();render();
}
function pEdAddEx(si){pEd.sessions[si].ex.push(pBlank());pRenderEd()}
function pEdDelEx(si,xi){pEd.sessions[si].ex.splice(xi,1);pRenderEd()}
function pEdAddSes(){pEd.sessions.push({n:'',ex:[pBlank()]});pRenderEd()}
function pEdDelSes(si){pEd.sessions.splice(si,1);pRenderEd()}
function pEdSave(){
  const S=pEd.sessions.map((s,i)=>({n:(s.n||'').trim()||'Séance '+(i+1),ex:s.ex.filter(x=>(x.n||'').trim()).map(x=>({n:x.n.trim(),s:x.s>0?x.s:3,r:(x.r||'').trim()||'8-12',t:x.t||90,b:!!x.b}))})).filter(s=>s.ex.length);
  if(!S.length){$('pEdMsg').textContent='Ajoute au moins un exercice avec un nom.';return}
  const p={id:pEd.id,name:(pEd.name||'').trim()||'Mon programme',sessions:S,u:Date.now()};
  const k=D.progs.findIndex(x=>x.id===p.id);if(k>=0)D.progs[k]=p;else D.progs.push(p);
  if(D.act&&D.act.id===p.id&&D.act.i>=S.length)D.act={id:p.id,i:0,t:Date.now()};
  save();pHideEd();
}
function pRenderEd(){
  $('plansEdit').innerHTML=`<div class="pg-card"><h3>${pEd.isNew?'Nouveau programme':'Modifier le programme'}</h3><input data-k="pn" value="${esc(pEd.name)}" placeholder="Nom du programme" aria-label="Nom du programme"></div>`
  +pEd.sessions.map((s,si)=>`<div class="pg-card"><div class="row" style="margin-top:0"><input data-k="sn" data-s="${si}" value="${esc(s.n)}" placeholder="Nom de la séance (ex. Haut du corps)" aria-label="Nom de la séance"><button class="x" style="flex:none" aria-label="Supprimer la séance" onclick="pEdDelSes(${si})">×</button></div>`
    +s.ex.map((x,xi)=>`<div class="pg-edx"><input data-k="en" data-s="${si}" data-x="${xi}" value="${esc(x.n)}" placeholder="Exercice" aria-label="Exercice"><input data-k="es" data-s="${si}" data-x="${xi}" type="number" inputmode="numeric" value="${x.s||''}" placeholder="Séries" aria-label="Nombre de séries"><input data-k="er" data-s="${si}" data-x="${xi}" value="${esc(x.r)}" placeholder="Rép." aria-label="Répétitions"><button class="x" aria-label="Supprimer l'exercice" onclick="pEdDelEx(${si},${xi})">×</button></div><label class="pg-edb"><input type="checkbox" data-k="eb" data-s="${si}" data-x="${xi}"${x.b?' checked':''}> Poids du corps (sans charge)</label>`).join('')
    +`<div class="row"><button class="sec" onclick="pEdAddEx(${si})">Ajouter un exercice</button></div></div>`).join('')
  +`<div class="row"><button class="sec" onclick="pEdAddSes()">Ajouter une séance</button></div><div id="pEdMsg" class="pg-err"></div><div class="row"><button onclick="pEdSave()">Enregistrer</button><button class="sec" onclick="pHideEd()">Annuler</button></div>`;
}
document.getElementById('plansEdit').addEventListener('input',e=>{
  const t=e.target,k=t.dataset.k;if(!k||!pEd)return;
  const s=+t.dataset.s,x=+t.dataset.x;
  if(k==='pn')pEd.name=t.value;
  else if(k==='sn')pEd.sessions[s].n=t.value;
  else if(k==='en')pEd.sessions[s].ex[x].n=t.value;
  else if(k==='es')pEd.sessions[s].ex[x].s=parseInt(t.value)||0;
  else if(k==='er')pEd.sessions[s].ex[x].r=t.value;
  else if(k==='eb')pEd.sessions[s].ex[x].b=t.checked;
  const m=$('pEdMsg');if(m)m.textContent='';
});

// Navigation entre onglets
function go(v){
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.v===v));
  ['seance','plans','histo','prog','repas','data'].forEach(k=>$('v-'+k).classList.toggle('hide',k!==v));
  $('title').textContent=titles[v];
  pFlash='';scrollTo(0,0);render();
}
