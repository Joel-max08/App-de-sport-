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
etqua:{ad:{f:"Garde le talon plus loin de la fesse, avec un appui sous la main pour l'équilibre.",d:"Garde le talon bien contre la fesse et tiens 45 secondes sans appui."},n:'Étirement des quadriceps',m:'Cuisses (avant)',
  c:['Debout, tiens-toi à un appui si besoin','Ramène le talon vers la fesse, genoux serrés','Garde le bassin droit, sans cambrer. Change de côté'],
  mu:[['thigh',0,.5]],
  k:[{d:900,h:1500,p:{hip:[120,93],t:2,ft:[112,122],kb:-1,ua:180,fa:180}},{d:900,h:1500,p:{hip:[120,93],t:2,ft:[112,122],kb:-1,ua:180,fa:180}}]},
etisch:{ad:{f:"Penche-toi seulement jusqu'où tu sens l'étirement, mains posées sur les cuisses.",d:"Attrape tes orteils genoux bien tendus, dos long, et tiens 45 secondes."},n:'Étirement des ischio-jambiers',m:'Arrière des cuisses',
  c:['Jambes tendues, genoux souples','Plie-toi en avant depuis les hanches, dos long','Sens l\'étirement derrière la cuisse, puis change de côté'],
  mu:[['thigh',0,.5]],
  k:[{d:900,h:1500,p:{hip:[112,92],t:112,ft:[118,146],kb:-1,ua:160,fa:140}},{d:900,h:1500,p:{hip:[112,92],t:112,ft:[118,146],kb:-1,ua:160,fa:140}}]},
etpec:{ad:{f:"Bras à hauteur de la taille et ouverture douce de la poitrine.",d:"Bras plus haut contre un cadre de porte, et avance légèrement le corps."},n:'Étirement des pectoraux',m:'Poitrine, épaules',
  c:['Bras tendus à l\'horizontale derrière toi','Ouvre la poitrine, épaules basses','Respire calmement pendant 30 secondes'],
  mu:[['torso',.55,.85]],
  k:[{d:900,h:1500,p:{hip:[120,93],t:-4,ft:[121,146],ua:-100,fa:-100}},{d:900,h:1500,p:{hip:[120,93],t:-4,ft:[121,146],ua:-100,fa:-100}}]},
etTri:{ad:{f:"Garde le coude plus haut et tire moins fort, ou tiens le coude avec l'autre main.",d:"Tire le coude un peu plus fort vers l'arrière et tiens 45 secondes."},n:'Étirement des triceps',m:'Triceps',
  c:['Bras levé, coude pointé vers le ciel','Plie le coude et pose la main entre les omoplates','Pousse doucement le coude vers l\'arrière, puis change de bras'],
  mu:[['ua',0,.6]],
  k:[{d:900,h:1500,p:{hip:[120,93],t:0,ft:[121,146],kb:-1,ua:0,fa:-150}},{d:900,h:1500,p:{hip:[120,93],t:0,ft:[121,146],kb:-1,ua:0,fa:-150}}]},
etEpaule:{ad:{f:"Garde le bras plus bas et ne force pas.",d:"Tire le bras plus loin vers l'opposé en gardant le dos droit, et tiens 30 secondes."},n:'Étirement des épaules',m:'Épaules, haut du dos',
  c:['Bras tendu devant toi, à hauteur d\'épaule','Garde les épaules basses, sans les lever','Respire calmement, puis change de bras'],
  mu:[['ua',0,.6]],
  k:[{d:900,h:1500,p:{hip:[120,93],t:0,ft:[121,146],kb:-1,ua:90,fa:90}},{d:900,h:1500,p:{hip:[120,93],t:0,ft:[121,146],kb:-1,ua:90,fa:90}}]},
squat:{ad:{f:"Descends moins bas, cuisses encore au-dessus du parallèle, et charge plus légère.",d:"Tiens 2 secondes en bas, remonte sans talonner et augmente la charge petit à petit."},n:'Squat (barre)',m:'Cuisses, fessiers',
  c:['Pieds largeur d\'épaules, pointes un peu ouvertes','Fesses en arrière, dos droit, regard devant','Genoux dans l\'axe des pieds, talons au sol'],
  mu:[['thigh',0,1]],
  k:[{d:1100,h:400,p:{hip:[120,93],t:2,ft:[121,146],htr:[-4,-2],eb:-1}},{d:1500,h:250,p:{hip:[97,118],t:36,ft:[121,146],htr:[-4,-2],eb:-1}}],
  back:J=>plate([J.sh[0]-3,J.sh[1]-3])},
squatpdc:{ad:{f:"Descends à mi-hauteur, avec une chaise derrière toi pour te guider.",d:"Ralentis la descente sur 3 secondes, ou fais le squat sur une jambe à la fois."},n:'Squat poids du corps',m:'Cuisses, fessiers',
  c:['Pieds largeur d\'épaules','Bras devant pour l\'équilibre, poitrine haute','Descends jusqu\'à cuisses parallèles au sol si possible'],
  mu:[['thigh',0,1]],
  k:[{d:1000,h:350,p:{hip:[120,93],t:2,ft:[121,146],ua:180,fa:180}},{d:1300,h:250,p:{hip:[97,118],t:34,ft:[121,146],ua:95,fa:95}}]},
goblet:{ad:{f:"Prends un poids plus léger, ou une bouteille d'eau.",d:"Descends sur 3 secondes, tiens 1 seconde en bas, avec un haltère plus lourd."},n:'Squat gobelet',m:'Cuisses, fessiers',
  c:['Haltère tenu contre la poitrine','Coudes entre les genoux en bas','Dos droit, talons au sol'],
  mu:[['thigh',0,1]],
  k:[{d:1000,h:350,p:{hip:[120,93],t:2,ft:[121,146],htr:[10,10],eb:-1}},{d:1300,h:250,p:{hip:[98,120],t:30,ft:[121,146],htr:[10,10],eb:-1}}],
  front:J=>dumb([J.n.hand[0]+3,J.n.hand[1]])},
couche:{ad:{f:"Pousse avec un élastique à la place de la barre, ou un haltère plus léger.",d:"Descends la barre sur 3 secondes, pause poitrine, puis pousse en poussant fort."},n:'Développé couché',m:'Pectoraux, triceps, épaules',
  c:['Omoplates serrées, fesses sur le banc','Descends la barre au bas des pectoraux','Coudes à environ 45° du corps, pas écartés à 90°'],
  mu:[['torso',.6,.95],['ua',0,1]],
  k:[{d:1100,h:300,p:{hip:[95,105],t:90,hd:0,ft:[74,146],kb:-1,ht:[134,58],eb:-1}},{d:1400,h:250,p:{hip:[95,105],t:90,hd:0,ft:[74,146],kb:-1,ht:[129,98],eb:-1}}],
  stat:bench,back:J=>plate(J.n.hand,13)},
pompes:{ad:{f:"Pompes sur les genoux, ou mains sur une surface haute (table, plan de travail).",d:"Pieds surélevés sur une chaise, ou pause de 2 secondes en bas."},n:'Pompes',m:'Pectoraux, triceps, gainage',
  c:['Mains un peu plus larges que les épaules','Corps gainé en planche : pas de fesses en l\'air','Descends la poitrine près du sol, coudes vers l\'arrière'],
  mu:[['torso',.6,.95],['ua',0,1]],
  k:[{d:1000,h:300,p:{hip:[100,124],t:66,ft:[51,142],fo:205,ht:[141,146],eb:1}},{d:1300,h:200,p:{hip:[104,135],t:79,ft:[51,145],fo:205,ht:[138,146],eb:1}}]},
tractions:{ad:{f:"Utilise un élastique d'assistance, ou tire à la barre basse, corps incliné.",d:"Pause de 2 secondes en haut, descente lente sur 3 secondes, ou lest."},n:'Tractions',m:'Dos, biceps',
  c:['Prise un peu plus large que les épaules','Tire en ramenant les coudes vers les côtes','Menton au-dessus de la barre, redescends bras tendus'],
  mu:[['torso',.45,.95],['ua',0,1]],
  k:[{d:1300,h:350,p:{hip:[118,103],t:2,th:172,sh:220,ht:[120,14],eb:1}},{d:1100,h:350,p:{hip:[116,71],t:4,th:168,sh:205,ht:[120,14],eb:1}}],
  stat:`<path d="M80 12H160" class="bh-bar"/>`},
tirage:{ad:{f:"Charge plus légère, tire jusqu'à la poitrine sans te pencher en arrière.",d:"Tiens 1 seconde en bas, puis remonte lentement sur 3 secondes."},n:'Tirage vertical',m:'Dos, biceps',
  c:['Poitrine sortie, léger recul du buste','Tire la barre vers le haut de la poitrine','Remonte lentement, bras presque tendus'],
  mu:[['torso',.45,.95],['ua',0,1]],
  k:[{d:1300,h:300,p:{hip:[100,113],t:-6,th:95,sh:178,fo:90,ht:[106,26],eb:1}},{d:1100,h:350,p:{hip:[100,113],t:-12,th:95,sh:178,fo:90,ht:[104,72],eb:1}}],
  stat:`<rect x="78" y="116" width="40" height="8" rx="3" class="bh-prop"/><path d="M98 124V${G}" class="bh-propl"/>`,
  back:J=>`<path d="M${J.n.hand[0]} ${J.n.hand[1]}V4" class="bh-cable"/><path d="M${J.n.hand[0]-18} ${J.n.hand[1]}H${J.n.hand[0]+18}" class="bh-bar"/>`},
rowing:{ad:{f:"Dos moins incliné, main posée sur un banc, charge légère.",d:"Tiens 1 seconde poitrine contre la barre, descente lente sur 3 secondes."},n:'Rowing',m:'Dos, biceps, arrière d\'épaules',
  c:['Buste penché, dos plat, genoux un peu fléchis','Tire vers le nombril en serrant les omoplates','Ne donne pas d\'élan avec le dos'],
  mu:[['torso',.4,.95],['ua',0,1]],
  k:[{d:1300,h:250,p:{hip:[100,98],t:68,ft:[113,146],ht:[140,124],eb:1}},{d:1000,h:400,p:{hip:[100,98],t:68,ft:[113,146],ht:[122,103],eb:1}}],
  back:J=>plate(J.n.hand,12)},
militaire:{ad:{f:"Pousse assis sur un banc avec dossier, haltères plus légers.",d:"Pousse debout, sans appui du dos, pieds écartés, charge progressive."},n:'Développé militaire',m:'Épaules, triceps',
  c:['Debout, fessiers et abdos serrés','Pousse la barre verticalement au-dessus de la tête','Ne cambre pas le bas du dos'],
  mu:[['ua',0,.45]],
  k:[{d:1300,h:300,p:{hip:[120,93],t:0,ft:[121,146],ht:[127,52],eb:-1}},{d:1100,h:350,p:{hip:[120,93],t:0,ft:[121,146],ht:[122,6],eb:-1}}],
  back:J=>plate([J.n.hand[0],J.n.hand[1]],12)},
sdt:{ad:{f:"Barre plus légère, tirée depuis un plot ou des disques sous la barre.",d:"Pause au genou avant de tirer, dos neutre, charge progressive."},n:'Soulevé de terre',m:'Fessiers, ischios, bas du dos',
  c:['Barre contre les tibias, dos plat','Pousse dans le sol avec les jambes, bras tendus','La barre reste collée aux jambes en montant'],
  mu:[['thigh',0,.6],['torso',0,.4]],
  k:[{d:1400,h:350,p:{hip:[94,108],t:66,ft:[119,146],ht:[124,137],eb:1}},{d:1300,h:400,p:{hip:[119,93],t:0,ft:[119,146],ht:[123,99],eb:1}}],
  back:J=>plate([J.n.hand[0],Math.min(J.n.hand[1],G-13)],13)},
rdl:{ad:{f:"Descends moins bas, dos droit, avec une charge légère.",d:"Descends lentement sur 3 secondes, avec une charge plus lourde."},n:'Soulevé de terre roumain',m:'Ischios, fessiers',
  c:['Genoux légèrement fléchis et fixes','Pousse les fesses en arrière, dos plat','Descends à mi-tibia, sans arrondir le dos'],
  mu:[['thigh',0,.7]],
  k:[{d:1200,h:300,p:{hip:[119,94],t:0,ft:[121,146],ht:[123,100],eb:1}},{d:1500,h:250,p:{hip:[103,100],t:72,ft:[121,146],ht:[128,128],eb:1}}],
  back:J=>plate(J.n.hand,12)},
fente:{ad:{f:"Fais la fente en t'appuyant sur une chaise ou un mur, et descends moins bas.",d:"Ajoute des haltères ou fais les fentes en marchant."},n:'Fentes',m:'Cuisses, fessiers',
  c:['Grand pas en avant, buste droit','Le genou arrière descend vers le sol','Genou avant au-dessus de la cheville'],
  mu:[['thigh',0,1]],
  k:[{d:1100,h:300,p:{hip:[114,95],t:0,ft:[141,146],fft:[89,145],fkb:-1,ffo:110,ua:180,fa:180}},{d:1400,h:250,p:{hip:[113,124],t:0,ft:[141,146],fft:[89,145],fkb:-1,ffo:110,ua:180,fa:180}}]},
dipschaise:{ad:{f:"Plie moins les coudes et garde les pieds plus près de la chaise.",d:"Pieds posés plus loin pour charger davantage les bras, avec une pause en bas."},n:'Dips sur chaise',m:'Triceps, épaules',
  c:['Mains au bord de la chaise, doigts vers l\'avant','Descends en pliant les coudes vers l\'arrière','Garde le dos proche de la chaise'],
  mu:[['ua',0,1]],
  k:[{d:1000,h:300,p:{hip:[100,104],t:-4,th:143,sh:143,ht:[93,104],eb:-1}},{d:1300,h:250,p:{hip:[104,118],t:-6,th:122,sh:122,ht:[93,104],eb:1}}],
  stat:`<rect x="56" y="104" width="40" height="7" rx="2" class="bh-prop"/><path d="M60 111V${G}M92 111V${G}M58 104V64" class="bh-propl"/>`},
dipsbarres:{ad:{f:"Dips sur chaise ou banc, coudes moins pliés.",d:"Dips aux barres avec un lest, ou pause de 2 secondes en bas."},n:'Dips (barres)',m:'Triceps, pectoraux',
  c:['Bras tendus, épaules basses','Descends jusqu\'à ce que les coudes fassent 90°','Remonte sans verrouiller brutalement'],
  mu:[['ua',0,1],['torso',.6,.95]],
  k:[{d:1000,h:300,p:{hip:[112,80],t:10,th:176,sh:235,ht:[123,80],eb:1}},{d:1300,h:250,p:{hip:[110,100],t:16,th:176,sh:235,ht:[123,80],eb:1}}],
  stat:`<path d="M100 82H150" class="bh-bar"/><path d="M146 82V${G}" class="bh-propl"/>`},
triceps:{ad:{f:"Charge plus légère, coudes bien collés au corps.",d:"Charge plus lourde, descente lente sur 3 secondes."},n:'Extension triceps',m:'Triceps',
  c:['Coudes fixes, pointés vers le plafond','Descends l\'haltère derrière la tête','Tends les bras sans bouger les coudes'],
  mu:[['ua',0,1]],
  k:[{d:1000,h:300,p:{hip:[120,93],t:0,ft:[121,146],ua:2,fa:2}},{d:1200,h:250,p:{hip:[120,93],t:0,ft:[121,146],ua:2,fa:-150}}],
  front:J=>dumb(J.n.hand)},
curl:{ad:{f:"Haltère plus léger, en alternant un bras après l'autre.",d:"Descente lente sur 3 secondes, charge progressive."},n:'Curl biceps',m:'Biceps',
  c:['Coudes collés au corps','Monte sans balancer le buste','Redescends lentement, bras tendus'],
  mu:[['ua',0,1]],
  k:[{d:1200,h:250,p:{hip:[120,93],t:0,ft:[121,146],ua:178,fa:178}},{d:1000,h:350,p:{hip:[120,93],t:0,ft:[121,146],ua:182,fa:30}}],
  front:J=>dumb(J.n.hand)},
laterale:{ad:{f:"Monte les bras seulement jusqu'à la hauteur des épaules, charge légère.",d:"Pause d'1 seconde en haut, descente lente, charge progressive."},n:'Élévations latérales',m:'Épaules',
  c:['Coudes légèrement fléchis','Monte les bras sur le côté jusqu\'aux épaules','Ne hausse pas les épaules, descends lentement'],
  mu:[['ua',0,.5]],
  k:[{d:1200,h:250,p:{front:1,hip:[120,93],t:0,th:178,sh:180,fo:110,ua:168,fa:170}},{d:1000,h:350,p:{front:1,hip:[120,93],t:0,th:178,sh:180,fo:110,ua:94,fa:96}}],
  front:J=>dumb(J.n.hand)+dumb(J.f.hand)},
mollets:{ad:{f:"Fais-le en t'appuyant sur un mur ou une rampe, sans charge.",d:"Sur une seule jambe, avec une charge dans la main, pause de 2 secondes en haut."},n:'Mollets',m:'Mollets',
  c:['Monte le plus haut possible sur la pointe des pieds','Tiens 1 seconde en haut','Redescends lentement, talons bas'],
  mu:[['shin',0,.6]],
  k:[{d:900,h:300,p:{hip:[120,93],t:0,ft:[121,146],fo:90,ua:180,fa:180}},{d:800,h:600,p:{hip:[123,85],t:0,ft:[124,138],fo:122,ua:180,fa:180}}]},
pont:{ad:{f:"Monte le bassin moins haut, pieds plus près des fesses.",d:"Pause de 2 secondes en haut, ou une charge posée sur le bassin."},n:'Pont fessier',m:'Fessiers, ischios',
  c:['Pieds à plat, près des fesses','Pousse dans les talons et monte le bassin','Serre les fessiers en haut, sans cambrer'],
  mu:[['thigh',0,.35],['torso',0,.2]],
  k:[{d:1100,h:250,p:{hip:[112,140],t:-90,hd:0,ft:[142,145],kb:-1,ua:90,fa:90}},{d:1000,h:600,p:{hip:[112,116],t:-123,hd:33,ft:[142,145],kb:-1,ua:90,fa:90}}]},
crunch:{ad:{f:"Mains le long des cuisses, mouvement court, menton légèrement ouvert.",d:"Mains derrière la tête sans tirer sur la nuque, pause de 2 secondes en haut."},n:'Crunch',m:'Abdominaux',
  c:['Bas du dos collé au sol','Enroule le haut du dos, regard vers les genoux','Expire en montant, ne tire pas sur la nuque'],
  mu:[['torso',.2,.75]],
  k:[{d:1000,h:250,p:{hip:[112,141],t:-87,hd:0,ft:[142,145],kb:-1,ua:100,fa:100}},{d:900,h:450,p:{hip:[112,141],t:-55,hd:20,ft:[142,145],kb:-1,ua:115,fa:115}}]},
gainage:{ad:{f:"Fais la planche sur les genoux, ou appui sur une surface haute.",d:"Lève alternativement un bras ou une jambe, ou tiens plus de 60 secondes."},n:'Gainage (planche)',m:'Abdominaux, tout le tronc',
  c:['Coudes sous les épaules','Corps droit de la tête aux talons','Serre abdos et fessiers, respire calmement'],
  mu:[['torso',.15,.75]],
  k:[{d:1600,h:200,p:{hip:[101,130],t:78,ft:[49,143],fo:205,ua:180,fa:90}},{d:1600,h:200,p:{hip:[101,129],t:78,ft:[49,143],fo:205,ua:180,fa:90}}]},
mountain:{ad:{f:"Ralentis le rythme et fais-le en appui sur une table.",d:"Accélère le rythme en gardant le bassin stable."},n:'Mountain climbers',m:'Abdominaux, cardio',
  c:['Position de pompe, bras tendus','Ramène un genou vers la poitrine puis alterne','Bassin bas et stable'],
  mu:[['torso',.15,.75],['thigh',0,1]],
  k:[{d:380,h:0,p:{hip:[101,125],t:68,ft:[110,144],kb:-1,fft:[51,143],ffo:205,fo:205,ht:[141,146],eb:1}},{d:380,h:0,p:{hip:[101,125],t:68,ft:[51,143],fft:[110,144],fkb:-1,ffo:205,fo:205,ht:[141,146],eb:1}}]},
pompesinc:{ad:{f:"Mains plus hautes sur la chaise : le corps est plus incliné, donc plus facile.",d:"Mains plus basses, chaise plus basse ou pieds plus loin : plus difficile."},n:'Pompes inclinées',m:'Pectoraux, triceps, gainage',
  c:['Mains posées sur la chaise, bras tendus','Corps droit de la tête aux talons','Descends la poitrine vers le bord de la chaise'],
  mu:[['torso',.6,.95],['ua',0,1]],
  stat:`<rect x="150" y="104" width="34" height="6" rx="2" class="bh-prop"/><path d="M156 110V${G}M180 110V${G}" class="bh-propl"/>`,
  k:[{d:1000,h:300,p:{hip:[97,108],t:44,ft:[60,146],fo:205,ht:[165,104],eb:1}},{d:1300,h:200,p:{hip:[105,118],t:58,ft:[60,146],fo:205,ht:[165,104],eb:1}}]},
bulgare:{ad:{f:"Pied arrière posé plus bas, sur un banc, et descente moins profonde.",d:"Haltères dans les mains, ou pause de 2 secondes en bas."},n:'Squat bulgare',m:'Cuisses, fessiers',
  c:['Pied arrière posé sur la chaise, pied avant au sol','Descends le genou arrière vers le sol, buste droit','Genou avant dans l\'axe du pied'],
  mu:[['thigh',0,1]],
  stat:`<rect x="62" y="100" width="30" height="6" rx="2" class="bh-prop"/><path d="M68 106V${G}M86 106V${G}" class="bh-propl"/>`,
  k:[{d:1100,h:300,p:{hip:[112,96],t:4,ft:[120,146],fft:[76,100],fkb:-1,ffo:110}},{d:1300,h:250,p:{hip:[110,116],t:6,ft:[120,146],fft:[76,100],fkb:-1,ffo:110}}]},
pont1j:{ad:{f:"Les deux jambes au sol pour la poussée, puis une seule jambe.",d:"Pause de 2 secondes en haut, ou jambe tendue plus haute."},n:'Pont fessier à une jambe',m:'Fessiers, ischios',
  c:['Une jambe tendue vers le haut, l\'autre pliée au sol','Pousse dans le talon et monte le bassin','Garde le bassin droit, sans pencher sur le côté'],
  mu:[['thigh',0,.35],['torso',0,.2]],
  k:[{d:1100,h:250,p:{hip:[112,140],t:-90,hd:0,ft:[142,145],kb:-1,fft:null,fth:60,fsh:60,ua:90,fa:90}},{d:1000,h:600,p:{hip:[112,116],t:-123,hd:33,ft:[142,145],kb:-1,fft:null,fth:60,fsh:60,ua:90,fa:90}}]},
jacks:{ad:{f:"Sans sauter : écarte bras et jambes au rythme de la marche.",d:"Rythme plus rapide, ou ajoute des montées de genoux entre deux."},n:'Jumping jacks',m:'Cardio',
  c:['Saute en écartant bras et jambes','Atterris en souplesse sur l\'avant du pied','Garde un rythme régulier'],
  mu:[],
  k:[{d:350,h:50,p:{front:1,hip:[120,93],t:0,th:178,sh:180,fo:110,ua:172,fa:172}},{d:350,h:50,p:{front:1,hip:[120,88],t:0,th:160,sh:162,fo:110,ua:30,fa:22}}]},
superman:{ad:{f:"Lève seulement les bras, ou seulement les jambes.",d:"Tiens 3 secondes en haut, bras et jambes décollés du sol."},n:'Superman',m:'Dos, fessiers',
  c:['Allongé sur le ventre, bras tendus devant toi','Lève en même temps les bras et les jambes de quelques centimètres','Tiens 2 secondes, puis redescends lentement en gardant la nuque dans le prolongement du dos'],
  mu:[['torso',.1,.6],['thigh',0,.5]],
  k:[{d:1000,h:600,p:{hip:[108,141],t:90,hd:0,ft:[57,142],kb:-1,ht:[196,146],eb:1}},{d:1000,h:800,p:{hip:[108,141],t:70,hd:0,ft:[62,122],kb:-1,ht:[200,100],eb:1}}]}
};

const RULES=[
 [/face pull/,'tirage'],
 [/superman/,'superman'],
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
  /leg|presse/
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
// Capsule effilée entre deux points (rayon ra au départ, rb à l'arrivée), arrondie aux deux bouts
const cap=(a,b,ra,rb,c='')=>{
  const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1e-6;
  const nx=-dy/l,ny=dx/l,f=v=>v.toFixed(1);
  return `<path class="${c}" d="M${f(a[0]+nx*ra)} ${f(a[1]+ny*ra)}L${f(b[0]+nx*rb)} ${f(b[1]+ny*rb)}A${rb} ${rb} 0 0 0 ${f(b[0]-nx*rb)} ${f(b[1]-ny*rb)}L${f(a[0]-nx*ra)} ${f(a[1]-ny*ra)}A${ra} ${ra} 0 0 0 ${f(a[0]+nx*ra)} ${f(a[1]+ny*ra)}Z"/>`;
};
const dot=(q,r)=>`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r}"/>`;
// Jambe (cuisse épaisse, genou, mollet, cheville, pied) et bras (bras, coude, avant-bras, main)
const mid=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
function limbsSVG(s){
  // Tenue : short noir sur le haut de la cuisse, manche jaune sur le haut du bras
  return cap(s.hip,s.knee,6,4)+cap(s.hip,mid(s.hip,s.knee,.5),6.2,5.6,'bh-short')+dot(s.knee,4)+cap(s.knee,s.ank,4,2.6)+dot(s.ank,2.6)+cap(s.ank,s.toe,2.6,2.2,'bh-shoe')
    +cap(s.sh,s.elb,4.2,3.2)+cap(s.sh,mid(s.sh,s.elb,.45),4.8,4.4,'bh-shirt')+dot(s.elb,3.2)+cap(s.elb,s.hand,3.2,2.2)+dot(s.hand,3);
}
// Buste : bassin, épaules, cou (et largeur des épaules/hanches de face)
function torsoSVG(J,p){
  const w=[(J.hip[0]+J.sh[0])/2,(J.hip[1]+J.sh[1])/2];
  let s=cap(J.hip,w,8.2,6.8,'bh-short')+cap(w,J.sh,6.8,9.8,'bh-shirt')+cap(J.sh,J.neck,4.4,3.6,'bh-sk');
  if(p.front)s+=cap(J.n.sh,J.f.sh,6.5,6.5,'bh-shirt')+cap(J.n.hip,J.f.hip,8,8,'bh-short');
  return s;
}

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
.bh-torso{fill:var(--ink)}
.bh-shirt{fill:#FFC400;stroke:rgba(90,60,0,.35);stroke-width:.6}
.bh-short{fill:#15222C}
.bh-near,.bh-far{fill:var(--skin,#EDB48F);stroke:rgba(15,43,61,.25);stroke-width:.8}
.bh-sk{fill:var(--skin,#EDB48F)}
.bh-shoe{fill:var(--ink)}
.bh-far{opacity:.3}
.bh-isfront .bh-far{opacity:1}
.bh-head{fill:var(--skin,#EDB48F);stroke:rgba(15,43,61,.25);stroke-width:.8}
.bh-mu{fill:none;stroke:var(--teal);stroke-width:5;stroke-linecap:round;opacity:.95}
.bh-plate{fill:var(--warm);stroke:var(--ink);stroke-width:2}
.bh-hub{fill:var(--ink)}
.bh-prop{fill:var(--mut);opacity:.55}
.bh-propl{stroke:var(--mut);stroke-width:4;opacity:.55;fill:none}
.bh-bar{stroke:var(--ink);stroke-width:4;stroke-linecap:round;fill:none}
.bh-cable{stroke:var(--mut);stroke-width:1.5;fill:none}
.bh-band{fill:none;stroke:var(--teal);stroke-width:2.6;stroke-linecap:round}
.bh-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.bh-hd b{font-size:16px}
.bh-hd button{flex:none;padding:8px 14px;font-size:14px}
.bh-cues{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.bh-cues li{display:flex;gap:9px;font-size:15px;line-height:1.35}
.bh-cues li:before{content:"";flex:none;width:7px;height:7px;border-radius:50%;background:var(--teal);margin-top:7px}
.bh-mus{margin-top:10px}
.bh-ad{margin-top:12px}.bh-ad .chips{margin-top:0}.bh-ad .chips button.on{background:var(--teal);color:var(--tealink)}.bh-adt{font-size:15px;line-height:1.4;margin:10px 0 0;color:var(--ink)}
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
<g class="bh-far"></g><g class="bh-torso"></g><ellipse class="bh-head" rx="6.6" ry="8.4"/><g class="bh-near"></g><path class="bh-mu"/><g class="bh-front"></g></svg>
<ul class="bh-cues">${ex.c.map(c=>`<li>${c}</li>`).join('')}</ul>
${el.dataset.noad?'':'<div class="bh-ad"><div class="chips"><button type="button" class="on" data-l="s">Standard</button><button type="button" data-l="f">Facile</button><button type="button" data-l="d">Difficile</button></div><p class="bh-adt mut"></p></div>'}
<div class="mut bh-mus"><i></i>Muscles travaillés : ${ex.m}</div></div>`;
  const q=s=>el.querySelector(s),svg=q('svg');
  const far=q('.bh-far'),tor=q('.bh-torso'),head=q('.bh-head'),near=q('.bh-near'),mu=q('.bh-mu'),back=q('.bh-back'),front=q('.bh-front'),btn=q('button');
  const cues=q('.bh-cues'),adt=q('.bh-adt'),lv=el.querySelectorAll('.bh-ad button');
  lv.forEach(b=>b.onclick=()=>{
    const l=b.dataset.l;
    lv.forEach(x=>x.classList.toggle('on',x===b));
    if(l==='s'||!ex.ad){cues.classList.remove('hide');adt.textContent=''}
    else{cues.classList.add('hide');adt.textContent=(l==='f'?'Version facile : ':'Version difficile : ')+ex.ad[l]}
  });
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
    far.innerHTML=limbsSVG(J.f);
    near.innerHTML=limbsSVG(J.n);
    tor.innerHTML=torsoSVG(J,p);
    svg.classList.toggle('bh-isfront',!!p.front);
    const hx=J.head[0].toFixed(1),hy=J.head[1].toFixed(1);
    head.setAttribute('cx',hx);head.setAttribute('cy',hy);
    head.setAttribute('transform',`rotate(${(p.t+(p.hd||0)).toFixed(1)} ${hx} ${hy})`);
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

// ---------- Exercices par matériel (ajout) ----------
const bandL=(a,b)=>`<path d="${P(a,b)}" class="bh-band"/>`;
const ringAt=q=>`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="7" class="bh-band"/>`;
Object.assign(X,{
elpont:{ad:{f:"Bande plus légère, ou pieds plus près des fesses.",d:"Pause de 2 secondes en haut, avec une bande plus forte."},n:'Pont fessier élastique',m:'Fessiers, ischios',
  c:['Bande juste au-dessus des genoux','Pousse dans les talons et monte le bassin','Écarte légèrement les genoux contre la bande'],
  mu:[['thigh',0,.35],['torso',0,.2]],k:X.pont.k,back:J=>ringAt(J.n.knee)},
elrow:{ad:{f:"Bande plus légère, ou tire moins loin.",d:"Bande plus forte, pause de 1 seconde à fond."},n:'Rowing assis élastique',m:'Dos, biceps',
  c:['Assis, jambes tendues, bande autour des pieds','Tire les coudes vers l\'arrière, poitrine haute','Reviens lentement, bras presque tendus'],
  mu:[['torso',.4,.95],['ua',0,1]],
  k:[{d:1300,h:250,p:{hip:[100,137],t:-12,ft:[150,140],kb:-1,ht:[138,100],eb:1}},{d:1100,h:400,p:{hip:[100,137],t:-12,ft:[150,140],kb:-1,ht:[108,116],eb:1}}],
  back:J=>bandL([150,140],J.n.hand)},
elpull:{ad:{f:"Bande plus légère, ou mains plus écartées.",d:"Bande plus forte, pause de 1 seconde en bas."},n:'Tirage élastique',m:'Dos, biceps',
  c:['Bande accrochée en hauteur, bras tendus vers le haut','Tire les mains vers le haut de la poitrine','Coudes vers le bas et les côtés, poitrine sortie'],
  mu:[['torso',.4,.95],['ua',0,1]],
  k:[{d:1300,h:250,p:{hip:[120,93],t:0,ft:[121,146],kb:-1,ht:[132,8],eb:1}},{d:1100,h:400,p:{hip:[120,93],t:-6,ft:[121,146],kb:-1,ht:[142,70],eb:1}}],
  back:J=>bandL([140,-8],J.n.hand)},
elapart:{ad:{f:"Bande plus légère, bras moins écartés.",d:"Bande plus forte, pause de 2 secondes en position ouverte."},n:'Écarté élastique',m:'Épaules, dos',
  c:['Bande tendue devant toi, bras presque tendus','Écarte les bras sur les côtés, coudes légèrement fléchis','Serre les omoplates en fin de mouvement'],
  mu:[['ua',0,1]],
  k:[{d:1000,h:300,p:{front:true,hip:[120,93],t:0,ft:[117,146],kb:-1,ht:[125,66],eb:1}},{d:1100,h:300,p:{front:true,hip:[120,93],t:0,ft:[117,146],kb:-1,ua:90,fa:90}}],
  back:J=>bandL(J.n.hand,J.f.hand)},
elpress:{ad:{f:"Bande plus légère, pousse moins haut.",d:"Pause de 2 secondes en haut, bande plus forte."},n:'Développé épaules élastique',m:'Épaules, triceps',
  c:['Debout sur la bande, poignées au niveau des épaules','Pousse vers le haut jusqu\'à bras tendus','Redescends lentement sans cambrer le dos'],
  mu:[['ua',0,.45]],k:[{d:1100,h:300,p:{hip:[120,93],t:0,ft:[121,146],kb:-1,ht:[104,60],eb:-1}},{d:1300,h:350,p:{hip:[120,93],t:0,ft:[121,146],kb:-1,ht:[100,8],eb:-1}}],back:J=>bandL([121,146],J.n.hand)},
eltriceps:{ad:{f:"Bande plus légère, coudes bien collés.",d:"Bande plus forte, descente lente sur 3 secondes."},n:'Extension triceps élastique',m:'Triceps',
  c:['Bande accrochée derrière et au-dessus de toi','Coudes fixes, pointés vers le plafond','Tends les bras sans bouger les coudes'],
  mu:[['ua',0,1]],k:X.triceps.k,back:J=>bandL([118,-6],J.n.hand)},
elsquat:{ad:{f:"Bande plus légère, descends moins bas.",d:"Pause de 2 secondes en bas, bande plus forte."},n:'Squat élastique',m:'Cuisses, fessiers',
  c:['Bande juste au-dessus des genoux','Genoux poussés vers l\'extérieur pendant tout le mouvement','Descends en gardant les talons au sol'],
  mu:[['thigh',0,1]],k:X.squatpdc.k,back:J=>ringAt(J.n.knee)},
pullover:{ad:{f:"Haltère plus léger, descends moins loin.",d:"Descends lentement sur 3 secondes, pause en bas."},n:'Pull-over haltère',m:'Dos, pectoraux, dentelé',
  c:['Allongé sur le banc, haltère tenu à deux mains','Bras tendus, descends l\'haltère derrière la tête','Remonte en gardant les coudes presque tendus'],
  mu:[['torso',.6,.95],['ua',0,1]],
  k:[{d:1300,h:300,p:{hip:[95,105],t:90,hd:0,ft:[74,146],kb:-1,ua:0,fa:0}},{d:1400,h:300,p:{hip:[95,105],t:90,hd:0,ft:[74,146],kb:-1,ua:90,fa:90}}],
  stat:bench,back:J=>dumb(J.n.hand)},
bancstep:{ad:{f:"Banc plus bas, ou sans charge.",d:"Haltères en mains, pied posé plus haut, descente lente."},n:'Montée sur banc',m:'Cuisses, fessiers',
  c:['Un pied entier posé sur le banc','Pousse dans le talon du pied du banc pour monter','Redescends lentement, le pied arrière touche à peine le sol'],
  mu:[['thigh',0,1]],
  k:[{d:1100,h:300,p:{hip:[120,93],t:2,ft:[121,146],kb:-1,ua:180,fa:180}},{d:1300,h:400,p:{hip:[126,74],t:2,ft:[128,110],fft:[106,118],kb:-1,ua:180,fa:180}}],
  stat:bench},
hang:{ad:{f:"Jambes plus tendues, sans rien aux pieds.",d:"Pause de 2 secondes en tirant les omoplates, ou lest."},n:'Suspension active',m:'Dos, avant-bras, épaules',
  c:['Mains plus larges que les épaules, bras tendus','Épaules basses, sans haussement','Tire les omoplates vers le bas, puis relâche'],
  mu:[['torso',.45,.95],['ua',0,1]],
  k:[{d:1500,h:500,p:{hip:[118,103],t:2,th:172,sh:220,ht:[120,14],eb:1}},{d:900,h:400,p:{hip:[118,97],t:4,th:172,sh:220,ht:[120,14],eb:1}}],
  stat:`<path d="M80 12H160" class="bh-bar"/>`},
swing:{ad:{f:"Kettlebell plus légère, mouvement plus court.",d:"Kettlebell plus lourde, une seule main, relâche la hauteur."},n:'Swing kettlebell',m:'Fessiers, ischios, dos, épaules',
  c:['Pieds écartés, kettlebell entre les jambes','Pousse les hanches en arrière, dos plat','Projette les hanches vers l\'avant, bras tendus devant'],
  mu:[['thigh',0,.7],['torso',0,.4]],
  k:[{d:1100,h:250,p:{hip:[104,100],t:68,ft:[121,146],kb:-1,ht:[124,137],eb:1}},{d:1000,h:300,p:{hip:[120,93],t:2,ft:[121,146],kb:-1,ht:[162,60],eb:1}}],
  front:J=>plate(J.n.hand,7)},
goodmorning:{ad:{f:"Sans charge, bâton ou barre légère sur les épaules.",d:"Barre plus lourde, descente plus lente."},n:'Good morning barre',m:'Ischios, bas du dos, fessiers',
  c:['Barre sur les trapèzes, dos plat','Pousse les fesses en arrière, genoux légèrement fléchis','Remonte en serrant les fessiers'],
  mu:[['thigh',0,.7]],
  k:[{d:1200,h:300,p:{hip:[120,93],t:2,ft:[121,146],htr:[-16,8],eb:-1}},{d:1500,h:250,p:{hip:[103,100],t:70,ft:[121,146],htr:[-16,8],eb:-1}}],
  back:J=>plate([J.sh[0]-2,J.sh[1]+1],6)},
hipbarre:{ad:{f:"Sans charge, pieds plus près des fesses.",d:"Pause de 2 secondes en haut, barre plus lourde."},n:'Pont fessier à la barre',m:'Fessiers, ischios',
  c:['Haut du dos calé sur le banc, barre sur le bassin','Pieds à plat, près des fesses','Pousse dans les talons et monte le bassin, serre les fessiers'],
  mu:[['thigh',0,.35],['torso',0,.2]],k:X.pont.k,stat:bench,front:J=>plate([J.hip[0],J.hip[1]-7],7)}
});

window.Bonhomme={find,mount,names:()=>Object.values(X).map(e=>e.n),_X:X,_solve:solve,_mix:mix};
})();
