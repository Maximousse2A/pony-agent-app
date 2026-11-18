import {pickupDeadline,serviceRemaining} from './service.js';

export const types = {
  move: { name: 'Relocalisation', short: 'Déplacement', icon: 'route', cents: [400, 350], hours: 6, action: 'Déplacer le véhicule', done: 'Véhicule déplacé', instruction: 'Installez le véhicule sur un emplacement autorisé.' },
  battery: { name: 'Changement de batterie', short: 'Batterie', icon: 'battery', cents: [250, 200], hours: 4, action: 'Changer la batterie', done: 'Batterie remplacée', instruction: 'Remplacez la batterie, puis vérifiez sa fixation.' },
  charge: { name: 'Récupération pour recharge', short: 'Recharge', icon: 'plug', cents: [700, 600], hours: 4, action: 'Ramener en recharge', done: 'Véhicule mis en charge', instruction: 'Transportez le véhicule au dépôt et branchez-le sur un point de charge.' },
  shop: { name: 'Retour à l’atelier', short: 'Atelier', icon: 'tool', cents: [600, 600], hours: 24, action: 'Ramener à l’atelier', done: 'Véhicule remis à l’atelier', instruction: 'Chargez le véhicule dans le fourgon, puis remettez-le à l’équipe atelier.' },
};
export const initialTime = Date.parse('2026-11-16T09:40:00+01:00');
const minute = 60000;
const missionRows = [
  ['AG-2048','move','Place du Ralliement','Centre-ville',240,'Vélo','V-1842','Vélo immobile depuis 72 h',335,[61,47],'Gare Saint-Laud',2],
  ['AG-2059','battery','Boulevard Foch','Centre-ville',360,'Vélo','V-0927','Batterie à 12 %',100,[70,64],'Boulevard Foch',1],
  ['AG-2061','charge','Quai de la Savatte','Centre-ville',620,'Trottinette','T-3110','Batterie à 5 %, recharge au dépôt',75,[36,48],'Dépôt des Capucins',2],
  ['AG-2032','shop','Place Molière','Centre-ville',850,'Vélo','V-0615','Frein arrière signalé par un usager',620,[52,29],'Atelier Saint-Serge',3],
  ['AG-2066','battery','Avenue Jean-Joxé','Périphérie',1600,'Trottinette','T-2246','Batterie à 9 %',56,[76,18],'Avenue Jean-Joxé',2],
  ['AG-2068','move','Place Bichon','Périphérie',1900,'Vélo','V-1470','Stationnement hors secteur',90,[19,28],'Place Bichon',0],
  ['AG-2074','charge','Rue des Ponts-de-Cé','Périphérie',2700,'Vélo','V-1971','Batterie à 4 %, recharge au dépôt',50,[79,82],'Dépôt des Capucins',3],
  ['AG-2078','shop','Rue Saint-Jacques','Périphérie',3100,'Trottinette','T-2510','Direction à contrôler à l’atelier',42,[18,72],'Atelier Saint-Serge',1],
];
export const missions = missionRows.map(([id,type,place,zone,metres,vehicle,number,reason,age,point,destination,priority])=>({
  id,type,place,zone,metres,vehicle,number,reason,point,destination,priority,created:initialTime-age*minute,
}));
// Pilot instructions and coordinates are fictional; they are not demand forecasts.
export const eveningTime = Date.parse('2026-11-16T19:00:00+01:00');
const morningTarget = Date.parse('2026-11-17T07:30:00+01:00');
const eveningEnd = Date.parse('2026-11-16T20:00:00+01:00');
missions.push(...[
  ['SMART-C','Place Bichon','Campus · zone pilote',[19,28],[12,35],'V-2101'],
  ['SMART-H','Place Molière','Hôpital · zone pilote',[52,29],[42,15],'V-2102'],
].map(([id,place,destination,point,targetPoint,number])=>({
  id,type:'move',place,destination,point,targetPoint,number,vehicle:'Vélo',zone:'Centre-ville',metres:650,
  priority:2,created:eveningTime-30*minute,scope:'evening',
  reason:'Préparer la disponibilité de demain matin dans une zone de forte demande.',
  smart:{targetAt:morningTarget,deliverBy:eveningEnd,reason:'Déposer avant la fin du service pour préparer le créneau de 7 h 30.',
    retained:80,quantity:1},
})));
missions.find(m=>m.id==='AG-2048').smart={targetAt:Date.parse('2026-11-16T11:00:00+01:00'),
  deliverBy:Date.parse('2026-11-16T11:00:00+01:00'),quantity:1,
  reason:'Renfort de journée à la gare. Cette mission ne couvre pas le besoin de 7 h 30 déjà passé.'};
export const findMission = id => missions.find(m => m.id === id);
export const tariff = m => types[m.type].cents[m.zone === 'Centre-ville' ? 0 : 1];
export const deadline = m => pickupDeadline(m.created,types[m.type].hours);
export const money = c => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(c/100);
export const distance = m => m < 1000 ? m+' m' : (m/1000).toLocaleString('fr-FR',{maximumFractionDigits:1})+' km';
const format = (t,options) => new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',...options}).format(t);
export const hour = t => format(t,{hour:'2-digit',minute:'2-digit'});
export const day = t => format(t,{day:'numeric',month:'short'});
export const civilDate = t => format(t,{year:'numeric',month:'numeric',day:'numeric'});
export const statuses = { approved:'Approuvée', pending:'En attente', rejected:'Rejetée' };
export const scenarios = {
  clear:{label:'Dépôt conforme',accuracy:8,inside:true},
  edge:{label:'GPS en bord de zone',accuracy:42,inside:null},
  border:{label:'Refus en limite de zone · photo avec repère',accuracy:42,inside:false},
  outside:{label:'Position hors zone',accuracy:7,inside:false},
  photo:{label:'Photo inexploitable',accuracy:9,inside:true},
};
const seedHistory = [
  ['R-107','battery','Rue Saint-Laud','Centre-ville','approved',22],
  ['R-106','move','Place du Pilori','Centre-ville','pending',38],
  ['R-105','charge','Quai Ligny','Centre-ville','approved',62],
  ['R-104','move','Rue des Carmes','Centre-ville','rejected',80],
  ['R-103','battery','Rue Plantagenêt','Centre-ville','approved',1440],
  ['R-102','shop','Rue de la Chalouère','Périphérie','approved',1535],
];
export function initialState(mode='day') {
  return {version:1,mode:mode==='evening'?'evening':'day',now:mode==='evening'?eveningTime:initialTime,scenario:'edge',active:null,history:seedHistory.map(([id,type,place,zone,status,ago])=>({
    id,type,place,zone,status,amount:tariff({type,zone}),time:initialTime-ago*minute,
    reason:status==='rejected'?'Le point relevé se situe hors de la zone autorisée.':status==='pending'?'La précision GPS demande une vérification de la supervision.':'Le dépôt a été validé.',
    photo:status==='rejected'?'sample':null,
    vehicle:'Vélo',gps:status==='rejected'?{lat:'47.47300',lng:'-0.55857',accuracy:42,inside:false}:null,
    zoneAtDeposit:status==='rejected'?{name:place,lat:47.473,lng:-0.559,radius:25}:null,
    photoSignal:status==='rejected'?'landmark':null,source:'seed',
  }))};
}
export function serviceMissions(state) {
  const used = new Set(state.history.map(h=>h.id));
  return missions.filter(m => (state.mode!=='evening'||m.scope==='evening') && !used.has(m.id) && m.id!==state.active?.id);
}
export function available(state) {
  return serviceMissions(state).filter(m=>m.created<=state.now);
}
export function resultFor(code) {
  if (code==='outside'||code==='border') return ['rejected','Le point relevé se situe hors de la zone autorisée.'];
  if (code==='photo') return ['rejected','Le véhicule et son emplacement ne sont pas identifiables sur la photo.'];
  if (code==='edge') return ['pending','La position est incertaine. La supervision doit vérifier la photo et le repère de rue.'];
  return ['approved','La position et la preuve de dépôt ont été validées.'];
}
// Project the original demo map points into the same Angers coordinates used for proofs.
export function coordinates([x,y]) {
  return [Number((47.471+(47-y)*0.00018).toFixed(5)), Number((-0.555+(x-61)*0.0003).toFixed(5))];
}
export function gpsFor(code,m) {
  const [lat,lng]=coordinates(m.point);
  return {lat:lat.toFixed(5),lng:lng.toFixed(5),accuracy:scenarios[code].accuracy,inside:scenarios[code].inside};
}
const targets = {'Gare Saint-Laud':[56,83],'Dépôt des Capucins':[21,16],'Atelier Saint-Serge':[72,14]};
export const depositPoint = m => m.targetPoint || targets[m.destination] || m.point;
export const originPoint = [54,55];
export function zoneFor(m) {
  const centre=gpsFor('clear',{point:depositPoint(m)});
  return {name:m.destination,lat:Number(centre.lat),lng:Number(centre.lng),radius:25};
}
function capture(code, m) {
  const point=depositPoint(m);
  return gpsFor(code,{point:[point[0]+(code==='outside'?8:code==='border'?1.6:0),point[1]+(code==='edge'?2:0)]});
}
export const requiresDeposit = m => m.type !== 'battery';
function openProof(a,m) {
  a.step='deposit';a.gps=capture(a.case,m);a.photo=null;
}
export function advance(state,event,payload,at=Date.now()) {
  const a=state.active, m=a && findMission(a.id);
  if(event==='take' && !a && serviceRemaining(state.now)>0 && available(state).some(item=>item.id===payload)) {
    state.active={id:payload,step:'travel',started:state.now,timing:{acceptedAt:at}}; return true;
  }
  if(!a) return false;
  // Old saves keep their current step. Record only boundaries actually observed.
  const stamp = key => { (a.timing ||= {})[key] = at; };
  if(event==='arrive' && a.step==='travel'){stamp('arrivedAtVehicle');a.step='scan';return true;}
  if(event==='scan' && a.step==='scan'){a.step='unlock';state.now+=minute;return true;}
  if(event==='unlock' && a.step==='unlock'){stamp('interventionStartedAt');a.step='work';return true;}
  if(event==='work' && a.step==='work'){
    stamp('interventionEndedAt');a.case=state.scenario;state.now+=5*minute;
    if(requiresDeposit(m)) a.step='handoff';
    else openProof(a,m);
    return true;
  }
  if(event==='arrive-depot' && a.step==='handoff'){
    stamp('arrivedAtDeposit');openProof(a,m);return true;
  }
  if(a.step!=='deposit') return false;
  if(event==='photo' && (payload==='sample' || /^data:image\/jpeg;base64,/.test(payload))){a.photo=payload;return true;}
  if(event==='retry' && ['edge','outside','border'].includes(a.case)){
    a.case='clear';a.gps=capture('clear',m);return true;
  }
  if(event==='retake' && a.case==='photo'){a.case='clear';a.photo=null;return true;}
  if(event==='deposit' && a.gps && a.photo){
    stamp('completedAt');
    const [status,reason]=resultFor(a.case);
    state.now=Math.max(state.now+minute,Number.isFinite(a.expectedFinishAt)?a.expectedFinishAt:0);
    state.history.unshift({id:m.id,type:m.type,place:m.destination,zone:m.zone,amount:tariff(m),time:state.now,
      smart:m.smart?{...m.smart}:null, zoneAtDeposit:zoneFor(m), photoSignal:a.case==='photo'?'unclear':'landmark',
      status,reason:m.type==='battery'&&status==='approved'?'La position et la photo de l’intervention ont été validées.':reason,source:'run',photo:a.photo,gps:a.gps,number:m.number,vehicle:m.vehicle,started:a.started,timing:{...a.timing}});
    state.position=depositPoint(m);
    for(const prop of ['tour','draft']){
      if(state[prop]){
        state[prop].ids=state[prop].ids.filter(id=>id!==m.id);
        if(!state[prop].ids.length)state[prop]=null;
      }
    }
    state.active=null;return true;
  }
  return false;
}
export function totals(records) {
  return records.reduce((out,h)=>{out[h.status]+=h.amount;out.count++;return out;},{approved:0,pending:0,rejected:0,count:0});
}

export function review(state,id,decision) {
  const row=state.history.find(h=>h.id===id);
  if(!row || row.status!=='pending' || !['approved','rejected'].includes(decision)) return false;
  row.initialReason=row.reason;
  row.status=decision;
  row.reviewedAt=state.now;
  row.reason=decision==='approved'?'La supervision a reconnu l’emplacement sur la photo et a approuvé le dépôt.':'La supervision n’a pas pu identifier l’emplacement sur la photo.';
  return true;
}
