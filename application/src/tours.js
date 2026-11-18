import {available,findMission,depositPoint,originPoint,tariff,deadline} from './domain.js';
import {serviceRemaining,smartRank} from './smart.js';

const windows=[[60,'1 heure'],[240,'Demi-journée'],[480,'Journée']];
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
function stepConstraints(m,departure,elapsed,leg){
 // The contract concerns pickup; the Smart target concerns completed delivery.
 const pickupAt=departure+(elapsed+leg.pickup)*60000;
 const finishAt=departure+(elapsed+leg.minutes)*60000;
 return {pickupAt,finishAt,late:pickupAt>deadline(m),targetLate:!!m.smart&&finishAt>m.smart.deliverBy};
}
function itinerary(state,plan){
 const departure=departureTime(state),capacity=serviceRemaining(departure);
 const ids=new Set(available(state).map(m=>m.id));
 let point=startPoint(state),minutes=0,drive=0,fee=0,late=false,targetLate=false;
 const steps=[],points=[point];
 for(const id of plan?.ids||[]){
  if(!ids.delete(id))continue;
  const m=findMission(id),leg=routeLeg(point,m),limits=stepConstraints(m,departure,minutes,leg);
  late ||= limits.late;targetLate ||= limits.targetLate;
  minutes+=leg.minutes;drive+=leg.drive;fee+=leg.fee;
  point=depositPoint(m);points.push(m.point,point);steps.push({...leg,...limits});
 }
 return {steps,points,minutes,drive,fee,departure,capacity,afterShift:minutes>capacity,
  targeted:steps.filter(s=>s.m.smart&&!s.targetLate).length,
  valid:steps.length>0&&!late&&!targetLate&&minutes<=plan?.budget&&minutes<=capacity};
}
function propose(state,budget){
 const list=available(state),departure=departureTime(state),capacity=Math.min(budget,serviceRemaining(departure));
 let best={ids:[],score:[0,0,0],minutes:0,fee:0};
 function better(score,minutes,fee){
  for(let i=0;i<score.length;i++)if(score[i]!==best.score[i])return score[i]>best.score[i];
  return minutes<best.minutes||(minutes===best.minutes&&fee>best.fee);
 }
 // Lexicographic priorities: critical interventions, targeted deliveries, other tasks.
 // Travel/time breaks ties before agent remuneration. No unsupported demand forecast.
 function visit(point,remaining,ids,minutes,fee,score){
  if(better(score,minutes,fee))best={ids,minutes,fee,score};
  for(const m of remaining){
   const leg=routeLeg(point,m),total=minutes+leg.minutes,limits=stepConstraints(m,departure,minutes,leg);
   if(total>capacity||limits.late||limits.targetLate)continue;
   const nextScore=[...score];nextScore[3-smartRank(m)]++;
   visit(depositPoint(m),remaining.filter(other=>other.id!==m.id),[...ids,m.id],total,fee+leg.fee,nextScore);
  }
 }
 visit(startPoint(state),list,[],0,0,[0,0,0]);
 return {budget,ids:best.ids,strategy:'smart'};
}

export {windows,duration,itinerary,propose};
