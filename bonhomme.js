/* Kinetra — bonhomme animé qui montre le mouvement de chaque exercice.
   Utilisation : Bonhomme.find(nom) -> id ou null ; Bonhomme.mount(element, nom) -> true/false ;
   Bonhomme.names() -> liste des noms d'exercices animés. */
(function(){
'use strict';
const G=150; // niveau du sol
const L={T:42,N:5,HR:9,UL:27,LL:26,UA:23,FA:24,FT:10};
const R=Math.PI/180;
const dir=a=>[Math.sin(a*R),-Math.cos(a*R)];
const add=(p,a,l)=>{const d=dir(a);return[p[0]+d[0]*l,p[1]+d[1]*l]};
const ang=(p,q)=>Math.atan2(q[0]-p[0],-(q[1]-p[1]))/R;
// Angles absolus en degrés : 0 = vers le haut, 90 = vers l'avant (droite), 180 = vers le bas.

function ik(root,target,a,b,bend){
  let d=Math.hypot(target[0]-root[0],target[1]-root[1]);
  d=Math.max(Math.abs(a-b)+.01,Math.min(a+b-.01,d));
  const c=Math.max(-1,Math.min(1,(a*a+d*d-b*b)/(2*a*d)));
  const j=add(root,ang(root,target)+bend*Math.acos(c)/R,a);
  return[j,add(j,ang(j,target),b)];
}

function limb(root,a1,a2,target,bend,l1,l2){
  if(target)return ik(root,target,l1,l2,bend);
  const j=add(root,a1,l1);return[j,add(j,a2,l2)];
}

function solve(p){
  const J={front:!!p.front};
  const hip=p.hip,sh=add(hip,p.t,L.T);
  const hd=p.t+(p.hd||0);
  J.hip=hip;J.sh=sh;J.neck=add(sh,hd,L.N);J.head=add(J.neck,hd,L.HR);
  const side=(far)=>{
    const m=far&&p.front?-1:1;               // vue de face : côté gauche en miroir
    const ox=p.front?(far?-1:1):0;
    const hr=[hip[0]+ox*7,hip[1]],sr=[sh[0]+ox*12,sh[1]];
    const mir=t=>t&&p.front&&far?[2*hip[0]-t[0],t[1]]:t;
    const g=(k)=>far&&p['f'+k]!==undefined?p['f'+k]:p[k];
    const leg=limb(hr,m*g('th'),m*g('sh'),mir(g('ft')),m*(g('kb')||-1),L.UL,L.LL);
    let ht=g('ht');const htr=g('htr');
    if(htr&&!ht)ht=[sh[0]+htr[0],sh[1]+htr[1]];
    if(htr&&p.front&&far)ht=[sh[0]-htr[0],sh[1]+htr[1]];else ht=mir(ht);
    const arm=limb(sr,m*g('ua'),m*g('fa'),ht,m*(g('eb')||1),L.UA,L.FA);
    const fo=g('fo')!==undefined?g('fo'):90;
    return{hip:hr,sh:sr,knee:leg[0],ank:leg[1],toe:add(leg[1],m*fo,p.front?6:L.FT),elb:arm[0],hand:arm[1]};
  };
  J.n=side(false);J.f=side(true);
  return J;
}

const ease=t=>.5-.5*Math.cos(Math.PI*t);
function lerp(a,b,t){
  if(typeof a==='number')return a+(b-a)*t;
  if(Array.isArray(a))return a.map((v,i)=>lerp(v,b[i],t));
  return t<.5?a:b;
}
function mix(A,B,t){const o={};for(const k in A)o[k]=k in B?lerp(A[k],B[k],t):A[k];for(const k in B)if(!(k in o))o[k]=B[k];return o}

// ---------- Accessoires ----------
const plate=(h,r=13)=>`<circle cx="${h[0]}" cy="${h[1]}" r="${r}" class="bh-plate"/><circle cx="${h[0]}" cy="${h[1]}" r="3" class="bh-hub"/>`;
const dumb=(h)=>`<rect x="${h[0]-7}" y="${h[1]-4}" width="14" height="8" rx="3" class="bh-plate"/>`;
const bench=`<rect x="58" y="112" width="112" height="8" rx="3" class="bh-prop"/><path d="M70 120V${G}M158 120V${G}" class="bh-propl"/>`;

// ---------- Exercices ----------
// Chaque image clé : d = durée pour l'atteindre (ms), h = pause (ms), p = pose.
const stand={hip:[120,93],t:0,ft:[121,146],kb:-1,ua:180,fa:180};
const X={
squat:{n:'Squat (barre)',m:'Cuisses, fessiers',
  c:['Pieds largeur d\'épaules, pointes un peu ouvertes','Fesses en arrière, dos droit, regard devant','Genoux dans l\'axe des pieds, talons au sol'],
  mu:[['thigh',0,1]],
  k:[{d:1100,h:400,p:{hip:[120,93],t:2,ft:[121,146],htr:[-4,-2],eb:-1}},{d:1500,h:250,p:{hip:[97,118],t:36,ft:[121,146],htr:[-4,-2],eb:-1}}],
  back:J=>plate([J.sh[0]-3,J.sh[1]-3])},
squatpdc:{n:'Squat poids du corps',m:'Cuisses, fessiers',
  c:['Pieds largeur d\'épaules','Bras devant pour l\'équilibre, poitrine haute','Descends jusqu\'à cuisses parallèles au sol si possible'],
  mu:[['thigh',0,1]],
  k:[{d:1000,h:350,p:{hip:[120,93],t:2,ft:[121,146],ua:180,fa:180}},{d:1300,h:250,p:{hip:[97,118],t:34,ft:[121,146],ua:95,fa:95}}]},
goblet:{n:'Squat gobelet',m:'Cuisses, fessiers',
  c:['Haltère tenu contre la poitrine','Coudes entre les genoux en bas','Dos droit, talons au sol'],
  mu:[['thigh',0,1]],
  k:[{d:1000,h:350,p:{hip:[120,93],t:2,ft:[121,146],htr:[10,10],eb:-1}},{d:1300,h:250,p:{hip:[98,120],t:30,ft:[121,146],htr:[10,10],eb:-1}}],
  front:J=>dumb([J.n.hand[0]+3,J.n.hand[1]])},
couche:{n:'Développé couché',m:'Pectoraux, triceps, épaules',
  c:['Omoplates serrées, fesses sur le banc','Descends la barre au bas des pectoraux','Coudes à environ 45° du corps, pas écartés à 90°'],
  mu:[['torso',.6,.95],['ua',0,1]],
  k:[{d:1100,h:300,p:{hip:[95,105],t:90,hd:0,ft:[74,146],kb:-1,ht:[134,58],eb:-1}},{d:1400,h:250,p:{hip:[95,105],t:90,hd:0,ft:[74,146],kb:-1,ht:[129,98],eb:-1}}],
  stat:bench,back:J=>plate(J.n.hand,13)},
pompes:{n:'Pompes',m:'Pectoraux, triceps, gainage',
  c:['Mains un peu plus larges que les épaules','Corps gainé en planche : pas de fesses en l\'air','Descends la poitrine près du sol, coudes vers l\'arrière'],
  mu:[['torso',.6,.95],['ua',0,1]],
  k:[{d:1000,h:300,p:{hip:[100,124],t:66,ft:[51,142],fo:205,ht:[141,146],eb:1}},{d:1300,h:200,p:{hip:[104,135],t:79,ft:[51,145],fo:205,ht:[138,146],eb:1}}]},
tractions:{n:'Tractions',m:'Dos, biceps',
  c:['Prise un peu plus large que les épaules','Tire en ramenant les coudes vers les côtes','Menton au-dessus de la barre, redescends bras tendus'],
  mu:[['torso',.45,.95],['ua',0,1]],
  k:[{d:1300,h:350,p:{hip:[118,103],t:2,th:172,sh:220,ht:[120,14],eb:1}},{d:1100,h:350,p:{hip:[116,71],t:4,th:168,sh:205,ht:[120,14],eb:1}}],
  stat:`<path d="M80 12H160" class="bh-bar"/>`},
tirage:{n:'Tirage vertical',m:'Dos, biceps',
  c:['Poitrine sortie, léger recul du buste','Tire la barre vers le haut de la poitrine','Remonte lentement, bras presque tendus'],
  mu:[['torso',.45,.95],['ua',0,1]],
  k:[{d:1300,h:300,p:{hip:[100,113],t:-6,th:95,sh:178,fo:90,ht:[106,26],eb:1}},{d:1100,h:350,p:{hip:[100,113],t:-12,th:95,sh:178,fo:90,ht:[104,72],eb:1}}],
  stat:`<rect x="78" y="116" width="40" height="8" rx="3" class="bh-prop"/><path d="M98 124V${G}" class="bh-propl"/>`,
  back:J=>`<path d="M${J.n.hand[0]} ${J.n.hand[1]}V4" class="bh-cable"/><path d="M${J.n.hand[0]-18} ${J.n.hand[1]}H${J.n.hand[0]+18}" class="bh-bar"/>`},
rowing:{n:'Rowing',m:'Dos, biceps, arrière d\'épaules',
  c:['Buste penché, dos plat, genoux un peu fléchis','Tire vers le nombril en serrant les omoplates','Ne donne pas d\'élan avec le dos'],
  mu:[['torso',.4,.95],['ua',0,1]],
  k:[{d:1300,h:250,p:{hip:[100,98],t:68,ft:[113,146],ht:[140,124],eb:1}},{d:1000,h:400,p:{hip:[100,98],t:68,ft:[113,146],ht:[122,103],eb:1}}],
  back:J=>plate(J.n.hand,12)},
militaire:{n:'Développé militaire',m:'Épaules, triceps',
  c:['Debout, fessiers et abdos serrés','Pousse la barre verticalement au-dessus de la tête','Ne cambre pas le bas du dos'],
  mu:[['ua',0,.45]],
  k:[{d:1300,h:300,p:{hip:[120,93],t:0,ft:[121,146],ht:[127,52],eb:-1}},{d:1100,h:350,p:{hip:[120,93],t:0,ft:[121,146],ht:[122,6],eb:-1}}],
  back:J=>plate([J.n.hand[0],J.n.hand[1]],12)},
sdt:{n:'Soulevé de terre',m:'Fessiers, ischios, bas du dos',
  c:['Barre contre les tibias, dos plat','Pousse dans le sol avec les jambes, bras tendus','La barre reste collée aux jambes en montant'],
  mu:[['thigh',0,.6],['torso',0,.4]],
  k:[{d:1400,h:350,p:{hip:[94,108],t:66,ft:[119,146],ht:[124,137],eb:1}},{d:1300,h:400,p:{hip:[119,93],t:0,ft:[119,146],ht:[123,99],eb:1}}],
  back:J=>plate([J.n.hand[0],Math.min(J.n.hand[1],G-13)],13)},
rdl:{n:'Soulevé de terre roumain',m:'Ischios, fessiers',
  c:['Genoux légèrement fléchis et fixes','Pousse les fesses en arrière, dos plat','Descends à mi-tibia, sans arrondir le dos'],
  mu:[['thigh',0,.7]],
  k:[{d:1200,h:300,p:{hip:[119,94],t:0,ft:[121,146],ht:[123,100],eb:1}},{d:1500,h:250,p:{hip:[103,100],t:72,ft:[121,146],ht:[128,128],eb:1}}],
  back:J=>plate(J.n.hand,12)},
fente:{n:'Fentes',m:'Cuisses, fessiers',
  c:['Grand pas en avant, buste droit','Le genou arrière descend vers le sol','Genou avant au-dessus de la cheville'],
  mu:[['thigh',0,1]],
  k:[{d:1100,h:300,p:{hip:[114,95],t:0,ft:[141,146],fft:[89,145],fkb:-1,ffo:110,ua:180,fa:180}},{d:1400,h:250,p:{hip:[113,124],t:0,ft:[141,146],fft:[89,145],fkb:-1,ffo:110,ua:180,fa:180}}]},
dipschaise:{n:'Dips sur chaise',m:'Triceps, épaules',
  c:['Mains au bord de la chaise, doigts vers l\'avant','Descends en pliant les coudes vers l\'arrière','Garde le dos proche de la chaise'],
  mu:[['ua',0,1]],
  k:[{d:1000,h:300,p:{hip:[104,100],t:-6,ft:[140,146],kb:1,ht:[95,104],eb:1}},{d:1300,h:250,p:{hip:[104,131],t:-6,ft:[146,146],kb:1,ht:[95,104],eb:1}}],
  stat:`<rect x="56" y="104" width="40" height="7" rx="2" class="bh-prop"/><path d="M60 111V${G}M92 111V${G}M58 104V64" class="bh-propl"/>`},
dipsbarres:{n:'Dips (barres)',m:'Triceps, pectoraux',
  c:['Bras tendus, épaules basses','Descends jusqu\'à ce que les coudes fassent 90°','Remonte sans verrouiller brutalement'],
  mu:[['ua',0,1],['torso',.6,.95]],
  k:[{d:1000,h:300,p:{hip:[112,80],t:10,th:176,sh:235,ht:[123,80],eb:1}},{d:1300,h:250,p:{hip:[110,100],t:16,th:176,sh:235,ht:[123,80],eb:1}}],
  stat:`<path d="M100 82H150" class="bh-bar"/><path d="M146 82V${G}" class="bh-propl"/>`},
triceps:{n:'Extension triceps',m:'Triceps',
  c:['Coudes fixes, pointés vers le plafond','Descends l\'haltère derrière la tête','Tends les bras sans bouger les coudes'],
  mu:[['ua',0,1]],
  k:[{d:1000,h:300,p:{hip:[120,93],t:0,ft:[121,146],ua:2,fa:2}},{d:1200,h:250,p:{hip:[120,93],t:0,ft:[121,146],ua:2,fa:-150}}],
  front:J=>dumb(J.n.hand)},
curl:{n:'Curl biceps',m:'Biceps',
  c:['Coudes collés au corps','Monte sans balancer le buste','Redescends lentement, bras tendus'],
  mu:[['ua',0,1]],
  k:[{d:1200,h:250,p:{hip:[120,93],t:0,ft:[121,146],ua:178,fa:178}},{d:1000,h:350,p:{hip:[120,93],t:0,ft:[121,146],ua:182,fa:30}}],
  front:J=>dumb(J.n.hand)},
laterale:{n:'Élévations latérales',m:'Épaules',
  c:['Coudes légèrement fléchis','Monte les bras sur le côté jusqu\'aux épaules','Ne hausse pas les épaules, descends lentement'],
  mu:[['ua',0,.5]],
  k:[{d:1200,h:250,p:{front:1,hip:[120,93],t:0,th:178,sh:180,fo:110,ua:168,fa:170}},{d:1000,h:350,p:{front:1,hip:[120,93],t:0,th:178,sh:180,fo:110,ua:94,fa:96}}],
  front:J=>dumb(J.n.hand)+dumb(J.f.hand)},
mollets:{n:'Mollets',m:'Mollets',
  c:['Monte le plus haut possible sur la pointe des pieds','Tiens 1 seconde en haut','Redescends lentement, talons bas'],
  mu:[['shin',0,.6]],
  k:[{d:900,h:300,p:{hip:[120,93],t:0,ft:[121,146],fo:90,ua:180,fa:180}},{d:800,h:600,p:{hip:[123,85],t:0,ft:[124,138],fo:122,ua:180,fa:180}}]},
pont:{n:'Pont fessier',m:'Fessiers, ischios',
  c:['Pieds à plat, près des fesses','Pousse dans les talons et monte le bassin','Serre les fessiers en haut, sans cambrer'],
  mu:[['thigh',0,.35],['torso',0,.2]],
  k:[{d:1100,h:250,p:{hip:[112,140],t:-90,hd:0,ft:[142,145],kb:-1,ua:90,fa:90}},{d:1000,h:600,p:{hip:[112,116],t:-123,hd:33,ft:[142,145],kb:-1,ua:90,fa:90}}]},
crunch:{n:'Crunch',m:'Abdominaux',
  c:['Bas du dos collé au sol','Enroule le haut du dos, regard vers les genoux','Expire en montant, ne tire pas sur la nuque'],
  mu:[['torso',.2,.75]],
  k:[{d:1000,h:250,p:{hip:[112,141],t:-87,hd:0,ft:[142,145],kb:-1,ua:100,fa:100}},{d:900,h:450,p:{hip:[112,141],t:-55,hd:20,ft:[142,145],kb:-1,ua:115,fa:115}}]},
gainage:{n:'Gainage (planche)',m:'Abdominaux, tout le tronc',
  c:['Coudes sous les épaules','Corps droit de la tête aux talons','Serre abdos et fessiers, respire calmement'],
  mu:[['torso',.15,.75]],
  k:[{d:1600,h:200,p:{hip:[101,130],t:78,ft:[49,143],fo:205,ua:180,fa:90}},{d:1600,h:200,p:{hip:[101,129],t:78,ft:[49,143],fo:205,ua:180,fa:90}}]},
mountain:{n:'Mountain climbers',m:'Abdominaux, cardio',
  c:['Position de pompe, bras tendus','Ramène un genou vers la poitrine puis alterne','Bassin bas et stable'],
  mu:[['torso',.15,.75],['thigh',0,1]],
  k:[{d:380,h:0,p:{hip:[101,125],t:68,ft:[110,144],kb:-1,fft:[51,143],ffo:205,fo:205,ht:[141,146],eb:1}},{d:380,h:0,p:{hip:[101,125],t:68,ft:[51,143],fft:[110,144],fkb:-1,ffo:205,fo:205,ht:[141,146],eb:1}}]},
pompesinc:{n:'Pompes inclinées',m:'Pectoraux, triceps, gainage',
  c:['Mains posées sur la chaise, bras tendus','Corps droit de la tête aux talons','Descends la poitrine vers le bord de la chaise'],
  mu:[['torso',.6,.95],['ua',0,1]],
  stat:`<rect x="150" y="104" width="34" height="6" rx="2" class="bh-prop"/><path d="M156 110V${G}M180 110V${G}" class="bh-propl"/>`,
  k:[{d:1000,h:300,p:{hip:[82,132],t:71,ft:[40,146],fo:205,ht:[165,104],eb:1}},{d:1300,h:200,p:{hip:[80,140],t:72,ft:[40,146],fo:205,ht:[165,104],eb:1}}]},
bulgare:{n:'Squat bulgare',m:'Cuisses, fessiers',
  c:['Pied arrière posé sur la chaise, pied avant au sol','Descends le genou arrière vers le sol, buste droit','Genou avant dans l\'axe du pied'],
  mu:[['thigh',0,1]],
  stat:`<rect x="62" y="100" width="30" height="6" rx="2" class="bh-prop"/><path d="M68 106V${G}M86 106V${G}" class="bh-propl"/>`,
  k:[{d:1100,h:300,p:{hip:[112,96],t:4,ft:[120,146],fft:[76,100],fkb:-1,ffo:110}},{d:1300,h:250,p:{hip:[110,116],t:6,ft:[120,146],fft:[76,100],fkb:-1,ffo:110}}]},
pont1j:{n:'Pont fessier à une jambe',m:'Fessiers, ischios',
  c:['Une jambe tendue vers le haut, l\'autre pliée au sol','Pousse dans le talon et monte le bassin','Garde le bassin droit, sans pencher sur le côté'],
  mu:[['thigh',0,.35],['torso',0,.2]],
  k:[{d:1100,h:250,p:{hip:[112,140],t:-90,hd:0,ft:[142,145],kb:-1,fft:null,fth:60,fsh:60,ua:90,fa:90}},{d:1000,h:600,p:{hip:[112,116],t:-123,hd:33,ft:[142,145],kb:-1,fft:null,fth:60,fsh:60,ua:90,fa:90}}]},
jacks:{n:'Jumping jacks',m:'Cardio',
  c:['Saute en écartant bras et jambes','Atterris en souplesse sur l\'avant du pied','Garde un rythme régulier'],
  mu:[],
  k:[{d:350,h:50,p:{front:1,hip:[120,93],t:0,th:178,sh:180,fo:110,ua:172,fa:172}},{d:350,h:50,p:{front:1,hip:[120,88],t:0,th:160,sh:162,fo:110,ua:30,fa:22}}]}
};

const RULES=[
 [/pont|hip thrust|releve de bassin/,'pont'],
 [/roumain|rdl|jambes tendues/,'rdl'],
 [/souleve de terre|deadlift|\bsdt\b/,'sdt'],
 [/gobelet|goblet/,'goblet'],
 [/squat.*(poids du corps|sans|air|maison|saut)|air squat/,'squatpdc'],
 [/squat/,'squat'],
 [/fente|lunge|bulgare/,'fente'],
 [/militaire|developpe (debout|assis|epaule)|overhead|press epaule/,'militaire'],
 [/couche|bench|developpe/,'couche'],
 [/traction|pull.?up|chin.?up/,'tractions'],
 [/tirage (vertical|poitrine|nuque|haut)|lat ?pull/,'tirage'],
 [/rowing|tirage|\brow\b/,'rowing'],
 [/pompe|push.?up/,'pompes'],
 [/dips.*(chaise|banc)/,'dipschaise'],
 [/dips/,'dipsbarres'],
 [/triceps|barre au front|skull/,'triceps'],
 [/^(?!.*(leg|ischio|jambe)).*curl/,'curl'],
 [/elevation.*lat|laterale/,'laterale'],
 [/mollet|calf/,'mollets'],
 [/gainage|planche|plank/,'gainage'],
 [/crunch|abdo|releve de buste/,'crunch'],
 [/mountain|grimpeur/,'mountain'],
 [/jumping|jack/,'jacks']
];
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
// Variantes dessinées en premier, puis exercices sans dessin exact (null = pas d'image, seulement le nom et les conseils)
const VARIANTS=[
  [/pompe.*(incline|chaise)/,'pompesinc'],
  [/bulgare/,'bulgare'],
  [/pont.*une jambe/,'pont1j']
];
const NOPIC=[
  /incline|marteau|gainage.*lateral|planche.*lateral|fentes? arriere|assis|poulie|face pull|leg|presse|superman/
];
function find(name){
  const s=norm(name);if(!s)return null;
  for(const[r,id]of VARIANTS)if(r.test(s))return id;
  if(NOPIC.some(r=>r.test(s)))return null;
  for(const[r,id]of RULES)if(r.test(s))return id;
  return null;
}

// ---------- Dessin ----------
const P=(a,b)=>`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
const part=(a,b,f,t)=>P([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
function limbs(s){return P(s.hip,s.knee)+P(s.knee,s.ank)+P(s.ank,s.toe)+P(s.sh,s.elb)+P(s.elb,s.hand)}
function seg(J,s,name){
  if(name==='torso')return[J.hip,J.sh];
  if(name==='thigh')return[s.hip,s.knee];
  if(name==='shin')return[s.knee,s.ank];
  if(name==='ua')return[s.sh,s.elb];
  return[s.elb,s.hand];
}

function css(){
  if(document.getElementById('bh-css'))return;
  const st=document.createElement('style');st.id='bh-css';
  st.textContent=`.bh{position:relative}
.bh svg{display:block;width:100%;max-width:260px;height:auto;margin:0 auto;background:var(--field);border-radius:16px}
.bh-g{stroke:var(--line);stroke-width:2}
.bh-body{fill:none;stroke:var(--ink);stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
.bh-far{opacity:.3}
.bh-isfront .bh-far{opacity:1}
.bh-torso{stroke-width:9}
.bh-head{fill:var(--ink)}
.bh-mu{fill:none;stroke:var(--teal);stroke-width:7;stroke-linecap:round}
.bh-plate{fill:var(--warm);stroke:var(--ink);stroke-width:2}
.bh-hub{fill:var(--ink)}
.bh-prop{fill:var(--mut);opacity:.55}
.bh-propl{stroke:var(--mut);stroke-width:4;opacity:.55;fill:none}
.bh-bar{stroke:var(--ink);stroke-width:4;stroke-linecap:round;fill:none}
.bh-cable{stroke:var(--mut);stroke-width:1.5;fill:none}
.bh-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.bh-hd b{font-size:16px}
.bh-hd button{flex:none;padding:8px 14px;font-size:14px}
.bh-cues{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.bh-cues li{display:flex;gap:9px;font-size:15px;line-height:1.35}
.bh-cues li:before{content:"";flex:none;width:7px;height:7px;border-radius:50%;background:var(--teal);margin-top:7px}
.bh-mus{margin-top:10px}
.bh-mus i{font-style:normal;display:inline-block;width:14px;height:5px;border-radius:3px;background:var(--teal);vertical-align:2px;margin-right:6px}`;
  document.head.appendChild(st);
}

const NS='http://www.w3.org/2000/svg';
const RM=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let running=null;

function mount(el,name,opt){
  opt=opt||{};
  if(running&&!opt.still){running.stop();running=null}
  const id=X[name]?name:find(name);
  if(!el)return false;
  if(!id){el.innerHTML='';return false}
  css();
  const ex=X[id];
  el.innerHTML=`<div class="bh"><div class="bh-hd"><b>${ex.n}</b><button class="sec" type="button">Pause</button></div>
<svg viewBox="0 -12 240 170" role="img" aria-label="Bonhomme qui montre le mouvement : ${ex.n}">
<path d="M8 ${G+.5}H232" class="bh-g"/><g class="bh-stat">${ex.stat||''}</g><g class="bh-back"></g>
<path class="bh-body bh-far"/><path class="bh-body bh-torso"/><circle r="${L.HR}" class="bh-head"/><path class="bh-body bh-near"/><path class="bh-mu"/><g class="bh-front"></g></svg>
<ul class="bh-cues">${ex.c.map(c=>`<li>${c}</li>`).join('')}</ul>
<div class="mut bh-mus"><i></i>Muscles travaillés : ${ex.m}</div></div>`;
  const q=s=>el.querySelector(s),svg=q('svg');
  const far=q('.bh-far'),tor=q('.bh-torso'),head=q('.bh-head'),near=q('.bh-near'),mu=q('.bh-mu'),back=q('.bh-back'),front=q('.bh-front'),btn=q('button');
  const K=ex.k,n=K.length;
  const total=K.reduce((a,k)=>a+k.d+k.h,0);
  function poseAt(ms){
    let t=ms%total;
    for(let i=0;i<n;i++){
      const nx=K[(i+1)%n];
      if(t<K[i].h)return K[i].p;t-=K[i].h;
      if(t<nx.d)return mix(K[i].p,nx.p,ease(t/nx.d));t-=nx.d;
    }
    return K[0].p;
  }
  function draw(p){
    const J=solve(p);
    far.setAttribute('d',limbs(J.f));
    near.setAttribute('d',limbs(J.n));
    tor.setAttribute('d',P(J.hip,J.sh)+P(J.sh,J.neck)+(p.front?P(J.f.sh,J.n.sh)+P(J.f.hip,J.n.hip):''));
    svg.classList.toggle('bh-isfront',!!p.front);
    head.setAttribute('cx',J.head[0].toFixed(1));head.setAttribute('cy',J.head[1].toFixed(1));
    let m='';
    (ex.mu||[]).forEach(([s,f,t])=>{
      [J.n].concat(p.front?[J.f]:[]).forEach(side=>{const[a,b]=seg(J,side,s);m+=part(a,b,f,t)});
    });
    mu.setAttribute('d',m||'M0 0');
    back.innerHTML=ex.back?ex.back(J):'';
    front.innerHTML=ex.front?ex.front(J):'';
  }
  if(opt.still){draw(opt.pose||poseAt(opt.at||0));return true}
  let t0=performance.now(),off=0,paused=RM,raf=0,dead=false;
  if(paused)off=K[0].h+K[1].d;
  function frame(now){
    if(dead)return;
    if(!paused&&el.offsetParent!==null)draw(poseAt(now-t0+off));
    raf=requestAnimationFrame(frame);
  }
  draw(poseAt(off));
  btn.textContent=paused?'Lecture':'Pause';
  btn.onclick=()=>{
    if(paused){t0=performance.now();paused=false;btn.textContent='Pause'}
    else{off+=performance.now()-t0;paused=true;btn.textContent='Lecture'}
  };
  raf=requestAnimationFrame(frame);
  running={stop(){dead=true;cancelAnimationFrame(raf)}};
  return true;
}

window.Bonhomme={find,mount,names:()=>Object.values(X).map(e=>e.n),_X:X,_solve:solve,_mix:mix};
})();
