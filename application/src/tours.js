import {available,findMission,depositPoint,originPoint,tariff,deadline} from './domain.js';

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
 const atOrigin=point[0]===originPoint[0]&&point[1]===originPoint[1];
 const toPickup=atOrigin?Math.ceil(m.metres/1000*60/16)+1:travel(point,m.point);
 const handoff=travel(m.point,depositPoint(m));
 return {m,drive:toPickup+handoff,work:service[m.type],pickup:toPickup,minutes:toPickup+handoff+service[m.type],fee:tariff(m)};
}
function departureTime(state){
 if(!state.active)return state.now;
 const m=findMission(state.active.id);
 const leg=routeLeg(state.position||originPoint,m);
 const remaining=state.active.step==='deposit'?1:state.active.step==='work'?leg.minutes-leg.pickup:leg.minutes;
 return state.now+remaining*60000;
}
function itinerary(state,plan){
 const departure=departureTime(state);
 const ids=new Set(available(state).map(m=>m.id));
 let point=startPoint(state),minutes=0,drive=0,fee=0,late=false;
 const steps=[],points=[point];
 for(const id of plan?.ids||[]){
  if(!ids.delete(id))continue;
  const m=findMission(id),leg=routeLeg(point,m);
  const overtime=departure+(minutes+leg.minutes)*60000>deadline(m);
  late=late||overtime;minutes+=leg.minutes;drive+=leg.drive;fee+=leg.fee;
  point=depositPoint(m);points.push(m.point,point);steps.push({...leg,late:overtime});
 }
 return {steps,points,minutes,drive,fee,valid:steps.length>0&&!late&&minutes<=plan?.budget};
}
function propose(state,budget){
 const list=available(state),departure=departureTime(state);
 let best={ids:[],fee:0,minutes:0};
 // Eight demo vehicles: compare feasible orders and use duration to break equal-fee ties.
 function visit(point,remaining,ids,minutes,fee){
  if(fee>best.fee||(fee===best.fee&&minutes<best.minutes))best={ids,minutes,fee};
  for(const m of remaining){
   const leg=routeLeg(point,m),total=minutes+leg.minutes;
   if(total>budget||departure+(minutes+leg.minutes)*60000>deadline(m))continue;
   visit(depositPoint(m),remaining.filter(other=>other.id!==m.id),[...ids,m.id],total,fee+leg.fee);
  }
 }
 visit(startPoint(state),list,[],0,0);
 return {budget,ids:best.ids};
}

export {windows,duration,itinerary,propose};
