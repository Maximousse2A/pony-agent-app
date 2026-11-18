import {serviceMissions,types,findMission,depositPoint,originPoint,tariff,deadline,hour} from './domain.js';
import {serviceRemaining} from './smart.js';

const service={battery:12,move:18,charge:25,shop:35};
const duration=min=>min>=60?`${Math.floor(min/60)} h${min%60?' '+String(min%60).padStart(2,'0'):''}`:`${min} min`;
function travel(a,b){
 if(a[0]===b[0]&&a[1]===b[1])return 0;
 const km=Math.hypot((a[0]-b[0])*0.074,(a[1]-b[1])*0.055);
 return Math.ceil(km*60/16)+1;
}
function startPoint(state){return state.active?depositPoint(findMission(state.active.id)):state.position||originPoint;}
function routeLeg(point,m){
 const toPickup=travel(point,m.point),handoff=travel(m.point,depositPoint(m));
 return {m,drive:toPickup+handoff,work:service[m.type],pickup:toPickup,minutes:toPickup+handoff+service[m.type],fee:tariff(m)};
}
function departureTime(state){
 if(!state.active)return state.now;
 if(Number.isFinite(state.active.expectedFinishAt))return Math.max(state.now,state.active.expectedFinishAt);
 const m=findMission(state.active.id),leg=routeLeg(state.position||originPoint,m);
 const step=state.active.step;
 const remaining=step==='deposit'?1:step==='handoff'?travel(m.point,depositPoint(m))+1:step==='work'?leg.work+travel(m.point,depositPoint(m)):leg.minutes;
 return state.now+remaining*60000;
}
function stepConstraints(m,departure,elapsed,leg,due=deadline(m)){
 // The contract concerns pickup; the Smart target concerns completed delivery.
 const pickupAt=departure+(elapsed+leg.pickup)*60000;
 const finishAt=departure+(elapsed+leg.minutes)*60000;
 return {pickupAt,finishAt,late:pickupAt>due,targetLate:!!m.smart&&finishAt>m.smart.deliverBy};
}
function itinerary(state,plan){
 const departure=departureTime(state),capacity=serviceRemaining(departure);
 const ids=new Set(serviceMissions(state).map(m=>m.id));
 let point=startPoint(state),minutes=0,waiting=0,drive=0,fee=0,late=false,targetLate=false;
 const steps=[],points=[point];
 for(const id of plan?.ids||[]){
  if(!ids.delete(id))continue;
  const m=findMission(id),leg=routeLeg(point,m);
  const wait=Math.max(0,(m.created-departure)/60000-minutes);
  waiting+=wait;minutes+=wait;
  const limits=stepConstraints(m,departure,minutes,leg);
  late ||= limits.late;targetLate ||= limits.targetLate;
  minutes+=leg.minutes;drive+=leg.drive;fee+=leg.fee;
  point=depositPoint(m);points.push(m.point,point);steps.push({...leg,...limits});
 }
 return {steps,points,minutes,waiting,drive,fee,departure,capacity,afterShift:minutes>capacity,
  targeted:steps.filter(s=>s.m.smart&&!s.late&&!s.targetLate&&(s.finishAt-departure)/60000<=capacity).length,
  valid:steps.length>0&&!late&&!targetLate&&minutes<=capacity};
}
function propose(state){
 const list=serviceMissions(state),departure=departureTime(state),capacity=serviceRemaining(departure);
 const deadlines=new Map(list.map(m=>[m.id,deadline(m)]));
 let best={ids:[],score:[0,0,0,0,0],minutes:0,work:0,fee:0};
 function better(score,minutes,work,fee){
  for(let i=0;i<score.length;i++)if(score[i]!==best.score[i])return score[i]>best.score[i];
  return minutes<best.minutes||(minutes===best.minutes&&(work<best.work||(work===best.work&&fee>best.fee)));
 }
 // Lexicographic priorities: targeted deliveries, critical interventions, other tasks.
 // Travel/time breaks ties before agent remuneration. No unsupported demand forecast.
 function visit(point,remaining,ids,minutes,work,fee,score){
  if(better(score,minutes,work,fee))best={ids,minutes,work,fee,score};
  for(const m of remaining){
   const start=Math.max(minutes,(m.created-departure)/60000);
   const leg=routeLeg(point,m),total=start+leg.minutes,limits=stepConstraints(m,departure,start,leg,deadlines.get(m.id));
   if(total>capacity||limits.late||limits.targetLate)continue;
   // Count targeted, critical, high, normal and low priority missions in this order.
   const priorityIndex=m.smart?0:4-m.priority;
   const nextScore=[...score];
   nextScore[priorityIndex]++;
   visit(depositPoint(m),remaining.filter(other=>other.id!==m.id),[...ids,m.id],total,work+leg.minutes,fee+leg.fee,nextScore);
  }
 }
 visit(startPoint(state),list,[],0,0,0,[0,0,0,0,0]);
 return {ids:best.ids,strategy:'smart'};
}

export function nextFieldMission(state){
 if(state.active)return findMission(state.active.id);
 for(const id of state.tour?.ids||[]){
  const trip=itinerary(state,{ids:[id]});
  if(trip.valid)return trip.steps[0].m;
 }
 return findMission(propose(state).ids[0]);
}

export function uncoveredNeeds(state,plan,trip=itinerary(state,plan)){
 const covered=new Set(trip.steps.filter(s=>!s.late&&!s.targetLate&&(s.finishAt-trip.departure)/60000<=trip.capacity).map(s=>s.m.id));
 return serviceMissions(state).filter(m=>!covered.has(m.id)).map(m=>{
  const direct=itinerary(state,{ids:[m.id]});
  const step=direct.steps[0];
  let reason;
  if(!direct.capacity)reason='départ hors des horaires de service.';
  else if(step.targetLate)reason=`dépôt au plus tôt à ${hour(step.finishAt)}, après l’objectif de ${hour(m.smart.deliverBy)}.`;
  else if(step.late)reason=`prise en charge au plus tôt à ${hour(step.pickupAt)}, après l’échéance de ${hour(deadline(m))}.`;
  else if(direct.afterShift)reason='le trajet et le dépôt dépassent la fin du service à 20 h.';
  else if(plan.manual)reason='hors de la sélection actuelle ou hors délai dans cet ordre.';
  else reason='incompatible avec les missions prioritaires avant leurs échéances ou la fin du service.';
  return `${m.smart?m.destination:types[m.type].short+' · '+m.place} · ${reason}`;
 });
}

export {duration,itinerary,propose};
