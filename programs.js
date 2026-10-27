// ===== Kinetra : programmes d'entraînement =====
// Dépend de : D, $, save, day, esc, fmt, render, rest, go (dans index.html) et Bonhomme (bonhomme.js)
const X=(n,s,r,t,b)=>({n,s,r,t:t||90,b:!!b});
const PRESETS=[
{id:'epaules',name:"Gagner en largeur d'épaules",lvl:'Tous niveaux',where:'Salle',freq:'2 séances par semaine',
 desc:"Épaules larges et dos qui s'élargit : élévations latérales, développé et tirages. Deux séances à alterner.",
 sessions:[
  {n:'Épaules A',ex:[X('Élévations latérales',3,'12-15',60),X('Développé militaire',3,'8-10',90),X('Élévations frontales',3,'12-15',60),X('Tirage vertical',3,'10-12',60),X('Rowing menton',3,'10-12',60)]},
  {n:'Épaules B',ex:[X('Développé Arnold',3,'8-10',90),X('Élévations latérales',3,'12-15',60),X('Face pull',3,'12-15',45),X('Pompes pieds surélevés',3,'8-12',60),X('Élévations frontales',2,'12-15',45)]}
 ]},
{id:'abdos-deb',name:'Abdos débutant',lvl:'Débutant',where:'Maison',freq:'2 séances par semaine',
 desc:'Un gainage et des crunchs doux pour installer la ceinture abdominale. Commence par les versions faciles.',
 sessions:[
  {n:'Abdos A',ex:[X('Crunch',3,'15',45),X('Gainage (planche)',3,'30 s',45,1),X('Dead bug',3,'10 par côté',45),X('Mountain climbers',3,'30 s',45,1),X('Superman',3,'12',45)]},
  {n:'Abdos B',ex:[X('Relevé de jambes',3,'10',60),X('Bird dog',3,'8 par côté',45),X('Gainage latéral',3,'20 s par côté',45,1),X('Crunch',3,'15',45),X('Gainage (planche)',3,'30 s',45,1)]}
 ]},
{id:'bas-deb',name:'Bas du corps débutant',lvl:'Débutant',where:'Maison',freq:'2 séances par semaine',
 desc:'Squats, ponts et fentes au poids du corps, pour apprendre à bien placer les genoux et les hanches.',
 sessions:[
  {n:'Bas A',ex:[X('Squat poids du corps',3,'15',60),X('Pont fessier',3,'15',60),X('Fentes',3,'10 par jambe',60),X('Montée sur banc',3,'10',60),X('Mollets debout',3,'15',45)]},
  {n:'Bas B',ex:[X('Squat gobelet',3,'10',60),X('Pont fessier à une jambe',3,'8 par jambe',60),X('Montée sur banc',3,'10',60),X('Fentes',3,'8 par jambe',60),X('Mollets debout',3,'15',45)]}
 ]},
{id:'bras-deb',name:'Bras débutant',lvl:'Débutant',where:'Maison',freq:'2 séances par semaine',
 desc:'Biceps et triceps avec ton poids du corps, une chaise et des élastiques si tu en as.',
 sessions:[
  {n:'Bras A',ex:[X('Curl biceps',3,'12',60),X('Extension triceps',3,'12',60),X('Dips sur chaise',3,'8-10',60),X('Curl marteau',3,'12',60),X('Pompes',3,'8-10',60)]},
  {n:'Bras B',ex:[X('Extension triceps élastique',3,'12',45),X('Curl élastique',3,'12',45),X('Dips sur chaise',3,'8-10',60),X('Curl marteau',3,'10',60),X('Pompes inclinées',3,'8-10',60)]}
 ]},
{id:'abdos-int',name:'Abdos intermédiaire',lvl:'Intermédiaire',where:'Maison',freq:'2 séances par semaine',
 desc:'Relevés de jambes, crunchs en V et gainages plus longs, pour une ceinture abdominale plus solide.',
 sessions:[
  {n:'Abdos A',ex:[X('Crunch en V',3,'10',60),X('Relevé de jambes',3,'12',60),X('Gainage latéral',3,'30 s par côté',45,1),X('Mountain climbers',3,'40 s',45,1),X('Superman',3,'12',45)]},
  {n:'Abdos B',ex:[X('Dead bug',3,'12 par côté',45),X('Gainage (planche)',3,'60 s',60,1),X('Crunch',3,'20',45),X('Crunch en V',3,'12',60),X('Bird dog',3,'10 par côté',45)]}
 ]},
{id:'haut-int',name:'Haut du corps intermédiaire',lvl:'Intermédiaire',where:'Salle',freq:'2 séances par semaine',
 desc:'Deux séances : une de poussée (pectoraux, épaules, triceps) et une de tirage (dos, biceps). Alterne-les.',
 sessions:[
  {n:'Poussée',ex:[X('Développé couché',4,'6-8',120),X('Développé militaire',3,'8-10',90),X('Dips barres',3,'8-10',90),X('Élévations latérales',3,'12-15',60),X('Pompes',3,'10-15',60)]},
  {n:'Tirage',ex:[X('Tractions',4,'6-10',120),X('Rowing barre',3,'8-10',90),X('Tirage vertical',3,'10-12',60),X('Pull-over haltère',3,'10-12',60),X('Face pull',3,'12-15',45)]}
 ]},
{id:'bas-int',name:'Bas du corps intermédiaire',lvl:'Intermédiaire',where:'Salle',freq:'2 séances par semaine',
 desc:'Squats, soulevés de terre et fentes bulgares, avec une séance axée sur les jambes et une séance axée sur les fessiers.',
 sessions:[
  {n:'Bas A',ex:[X('Squat',4,'6-8',120),X('Soulevé de terre roumain',3,'8-10',120),X('Fentes bulgares',3,'8-10',90),X('Mollets debout',4,'10-15',45),X('Montée sur banc',3,'10',60)]},
  {n:'Bas B',ex:[X('Soulevé de terre',3,'5',150),X('Hip thrust',3,'8-12',90),X('Squat gobelet',3,'10',90),X('Montée sur banc',3,'10',60),X('Mollets assis',3,'12-15',45)]}
 ]},
{id:'bras-int',name:'Bras intermédiaire',lvl:'Intermédiaire',where:'Salle',freq:'2 séances par semaine',
 desc:'Biceps et triceps chargés, avec des tractions et des pompes diamant pour renforcer les bras.',
 sessions:[
  {n:'Bras A',ex:[X('Curl barre',4,'8-10',75),X('Extension triceps barre au front',3,'10',60),X('Curl marteau',3,'10',60),X('Dips barres',3,'8-10',90),X('Extension triceps poulie',3,'12',45)]},
  {n:'Bras B',ex:[X('Tractions',4,'6-8',120),X('Pompes diamant',3,'10',60),X('Curl concentré',3,'10',60),X('Extension triceps au-dessus de la tête',3,'10',60),X('Curl élastique',3,'12',45)]}
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

// ----- Séance du jour : lancée dans le même écran que les séances toutes faites
window.pRunning=false;
// Étapes : [id, secondes d'effort, secondes de repos, nom, saisie {kg,reps,hasKg} ou null, libellé]
function pSteps(p,i){
  const out=[];
  p.sessions[i].ex.forEach(x=>{
    const timed=pTimed(x.r),pf=timed?null:pPrefill(x);
    for(let j=1;j<=x.s;j++){
      out.push([null,timed?(parseInt(x.r)||30):0,x.t||90,x.n,timed?null:{kg:pf.kg,reps:pf.reps,hasKg:!x.b},'Série '+j+' sur '+x.s]);
    }
  });
  if(out.length)out[out.length-1][2]=0;
  return out;
}
function renderProg(){
  const box=$('progBox');if(!box)return;
  if(window.pRunning){box.classList.add('hide');return}
  box.classList.remove('hide');
  const c=pCur();
  if(!c){box.innerHTML=`<div class="pg-card"><h3>Programme</h3><p class="mut" style="margin:0 0 12px">Aucun programme en cours. Choisis-en un dans l'onglet Programmes pour lancer ses séances ici.</p><div class="row"><button class="sec" onclick="go('plans')">Voir les programmes</button></div></div>`;return}
  const s=c.p.sessions[c.i];
  const sel=c.p.sessions.length>1?`<select id="pSess" onchange="pPick(this.value)" aria-label="Changer de séance">${c.p.sessions.map((q,k)=>`<option value="${k}"${k===c.i?' selected':''}>${esc(q.n)}</option>`).join('')}</select>`:'';
  box.innerHTML=`<div class="pg-card"><div class="pg-head"><div><h3>${esc(s.n)}</h3><span class="mut">${esc(c.p.name)} · ${s.ex.length} exercices</span></div>${sel}</div>`
    +`<div class="row"><button onclick="pRunStart()">Commencer la séance</button></div><div class="row"><button class="del" onclick="pStop()">Arrêter le programme</button></div></div>`;
}
function pRunStart(){
  const c=pCur();if(!c)return;
  const steps=pSteps(c.p,c.i);if(!steps.length)return;
  run={s:{n:c.p.name+' · '+c.p.sessions[c.i].n,s:steps},k:0,ph:'prep',left:PREP,paused:false,pid:c.p.id,pi:c.i};
  window.pRunning=true;
  $('pre').classList.add('hide');$('progBox').classList.add('hide');$('runCard').classList.remove('hide');
  $('runPauseBtn').textContent='Pause';scrollTo(0,0);
  stepStart();
  clearInterval(rTick);rTick=setInterval(tickRun,1000);
}
function pOnFinish(){const p=pFind(run.pid);if(!p)return;D.act={id:p.id,i:(run.pi+1)%p.sessions.length,t:Date.now()};save()}
function pAfterRun(){window.pRunning=false;render()}
function pPick(v){if(!D.act)return;D.act={id:D.act.id,i:+v,t:Date.now()};save();render()}
function pStart(id){D.act={id,i:0,t:Date.now()};save();go('seance')}
function pStop(){if(!confirm('Arrêter le programme en cours ?'))return;D.act={id:null,i:0,t:Date.now()};save();render()}

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
  const c=pCur();let h=recoCard();
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

// ===== Programme recommandé : questionnaire -> programme adapté (niveau, lieu, jours, durée) =====
// Exercices : [nom, groupe, niveau 0 à 2, lieu M = maison sans matériel, H = haltères, S = salle, durée si chronométré]
const EXO=[
 ["Pompes inclinées (mains sur une chaise)","push",0,"M",""],["Pompes","push",1,"M",""],["Pompes pieds surélevés","push",2,"M",""],
 ["Dips sur chaise","push",1,"M",""],["Squat au poids du corps","legs",0,"M",""],["Fentes arrière","legs",1,"M",""],
 ["Squat bulgare (pied sur une chaise)","legs",2,"M",""],["Pont fessier","hinge",0,"M",""],["Pont fessier à une jambe","hinge",2,"M",""],
 ["Superman","pull",0,"M",""],["Gainage (genoux au sol)","core",0,"M","20-30 s"],["Gainage","core",1,"M","30-45 s"],
 ["Gainage latéral","core",2,"M","20-30 s"],["Crunch","core",1,"M",""],["Jumping jacks","cardio",0,"M","30-40 s"],
 ["Mountain climbers","cardio",1,"M","30-40 s"],
 ["Développé haltères","push",1,"H",""],["Rowing haltère","pull",1,"H",""],["Squat gobelet","legs",1,"H",""],
 ["Fentes haltères","legs",1,"H",""],["Soulevé de terre roumain haltères","hinge",1,"H",""],["Élévations latérales","shoulder",0,"H",""],
 ["Curl biceps","arms",0,"H",""],["Extension triceps","arms",1,"H",""],["Développé militaire haltères","shoulder",1,"H",""],
 ["Presse à cuisses","legs",0,"S",""],["Squat","legs",1,"S",""],["Fentes bulgares","legs",2,"S",""],["Leg extension","legs",0,"S",""],
 ["Développé couché","push",1,"S",""],["Développé incliné haltères","push",1,"S",""],["Tirage vertical","pull",0,"S",""],
 ["Rowing barre","pull",1,"S",""],["Tractions","pull",2,"S",""],["Soulevé de terre roumain","hinge",1,"S",""],
 ["Soulevé de terre","hinge",2,"S",""],["Leg curl","hinge",0,"S",""],["Hip thrust","hinge",1,"S",""],
 ["Développé militaire","shoulder",1,"S",""],["Face pull","shoulder",1,"S",""],["Curl biceps poulie","arms",0,"S",""],
 ["Extension triceps poulie","arms",1,"S",""],["Mollets debout","calves",0,"S",""]
].map(([n,g,l,w,t])=>({n,g,l,w,t,b:w==='M'}));
const RQ=[
 {k:'lvl',q:"Quel est ton niveau ?",o:[['deb',"Je débute ou je reprends"],['int',"Je m'entraîne depuis quelques mois"],['av',"Je m'entraîne depuis plus d'un an"]]},
 {k:'lieu',q:"Où t'entraînes-tu ?",o:[['M','Maison, sans matériel'],['H','Maison, avec des haltères'],['S','Salle de sport']]},
 {k:'jours',q:"Combien de jours par semaine ?",o:[['2','2 jours'],['3','3 jours'],['4','4 jours']]},
 {k:'dur',q:"Combien de temps par séance ?",o:[['10','10 à 15 min'],['20','20 à 30 min'],['30','30 à 45 min']]}
];
let RQS={step:0,a:{}};
const RLVL={deb:'débutant',int:'intermédiaire',av:'avancé'},RLIEU={M:'maison sans matériel',H:'maison avec haltères',S:'salle de sport'},RDUR={'10':'10 à 15 min','20':'20 à 30 min','30':'30 à 45 min'};
function recoCard(){return `<div class="pg-card"><h3>Programme recommandé</h3><p class="mut" style="margin:0 0 12px">Réponds à quatre questions (niveau, lieu, jours et durée) et Kinetra te propose un programme adapté.</p><div class="row"><button onclick="recoStart()">Trouver mon programme</button></div></div>`}
function recoStart(){RQS={step:0,a:{}};$('plansList').classList.add('hide');$('reco').classList.remove('hide');renderReco();scrollTo(0,0)}
function recoClose(){RQS={step:0,a:{}};$('reco').classList.add('hide');$('plansList').classList.remove('hide');render()}
function recoAns(k,v){RQS.a[k]=v;RQS.step++;renderReco();scrollTo(0,0)}
function recoBack(){if(RQS.step>0){RQS.step--;renderReco()}}
function recoPick(g,place,maxL,used,rot){
  const ok=e=>e.g===g&&!used.has(e.n)&&e.l<=maxL&&(place==='S'||(place==='H'?e.w!=='S':e.w==='M'));
  const c=EXO.filter(ok).sort((x,y)=>y.l-x.l);
  return c.length?c[rot%c.length]:null;
}
function recoBuild(a){
  // Difficulté : niveau, séries et repos. Durée : nombre d'exercices calculé pour tenir le temps choisi.
  const L={deb:{sets:3,rest:60,maxL:0,reps:'10-12'},int:{sets:3,rest:75,maxL:1,reps:'8-12'},av:{sets:4,rest:90,maxL:2,reps:'6-10'}}[a.lvl];
  const short=a.dur==='10';
  const sets=short?2:L.sets;
  const rest=short?({deb:45,int:60,av:90})[a.lvl]:L.rest;
  const target={'10':720,'20':1500,'30':2280}[a.dur];
  const nEx=Math.max(2,Math.min(7,Math.round(Math.round(target/(45+rest))/sets)));
  const days=+a.jours;
  const T=days===2?[['legs','push','pull','core','hinge'],['legs','push','pull','hinge','shoulder']]
    :days===3?[['legs','push','pull','core','hinge'],['legs','push','pull','core','arms'],['legs','hinge','push','pull','core']]
    :[['push','pull','push','pull','shoulder','arms'],['legs','hinge','legs','core','calves'],['push','pull','push','pull','shoulder','arms'],['legs','hinge','legs','core','calves']];
  const names=days===4?['Haut A','Bas A','Haut B','Bas B']:['Séance A','Séance B','Séance C'];
  const sessions=T.map((slots,i)=>{
    const used=new Set(),ex=[];
    for(let k=0;ex.length<nEx&&k<slots.length*3;k++){
      const e=recoPick(slots[k%slots.length],a.lieu,L.maxL,used,i+k);
      if(e){used.add(e.n);ex.push({n:e.n,s:sets,r:e.t||L.reps,t:rest,b:!!e.b})}
    }
    const min=Math.round(ex.reduce((s,x)=>s+x.s*(45+x.t),0)/60);
    return {n:names[i],ex,min};
  });
  const desc=`Niveau ${RLVL[a.lvl]}, ${RLIEU[a.lieu]}, ${days} jour${days>1?'s':''} par semaine, séances d'environ ${RDUR[a.dur]}.`;
  return {name:'Programme recommandé',desc,sessions};
}
function renderReco(){
  const box=$('reco');if(!box)return;
  if(RQS.step<RQ.length){
    const Q=RQ[RQS.step];
    box.innerHTML=`<div class="pg-card"><div class="mut">Question ${RQS.step+1} sur ${RQ.length}</div><h3 style="margin-top:6px">${esc(Q.q)}</h3>`
      +Q.o.map(([v,t])=>`<button class="rec" type="button" onclick="recoAns('${Q.k}','${v}')">${esc(t)}</button>`).join('')
      +`<div class="row" style="margin-top:14px"><button class="sec" type="button" onclick="${RQS.step>0?'recoBack()':'recoClose()'}">${RQS.step>0?'← Retour':'Annuler'}</button></div></div>`;
    return;
  }
  const P=recoBuild(RQS.a);RQS.plan=P;
  box.innerHTML=`<div class="pg-card"><h3>Ton programme recommandé</h3><p class="mut" style="margin:0 0 6px">${esc(P.desc)}</p>`
    +P.sessions.map(s=>`<div class="pg-sname">${esc(s.n)} · environ ${s.min} min</div><ul class="pg-exl">${s.ex.map(pExLine).join('')}</ul>`).join('')
    +`<div class="row" style="margin-top:14px"><button type="button" onclick="recoSave(false)">Enregistrer et commencer</button></div>`
    +`<div class="row"><button class="sec" type="button" onclick="recoSave(true)">Enregistrer sans commencer</button></div>`
    +`<div class="row"><button class="sec" type="button" onclick="recoStart()">Refaire le questionnaire</button></div>`
    +`<div class="row"><button class="del" type="button" onclick="recoClose()">Fermer</button></div>`
    +`<p class="mut" style="font-size:13px">Repère général, pas un avis médical. Commence doucement et arrête si tu as mal.</p></div>`;
}
function recoSave(noStart){
  const P=RQS.plan;if(!P)return;
  const p={id:pNewId(),name:P.name,desc:P.desc,sessions:P.sessions.map(s=>({n:s.n,ex:s.ex})),u:Date.now()};
  D.progs.push(p);save();
  if(noStart){recoClose()}else{recoClose();pStart(p.id)}
}
