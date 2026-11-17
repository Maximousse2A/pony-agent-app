import {findMission,zoneFor} from './domain.js';

const caseLabels={checking:'Réexamen IA en cours',support:'Au support',approved:'Contestation acceptée',upheld:'Refus confirmé'};
function evidence(h){
 const zone=h.zoneAtDeposit || (findMission(h.id) && zoneFor(findMission(h.id)));
 const fix=h.gps;
 const gps=fix&&[fix.lat,fix.lng,fix.accuracy].every(v=>v!==null&&v!==''&&Number.isFinite(Number(v)))&&Number(fix.accuracy)>=0?fix:null;
 const offset=gps && zone ? Math.round(Math.hypot((Number(gps.lat)-zone.lat)*111320,
   (Number(gps.lng)-zone.lng)*111320*Math.cos(zone.lat*Math.PI/180))) : null;
 return {zone,gps,offset,photo:h.photo?(h.photoSignal||'unknown'):'missing'};
}
function appeal(state,id){
 const h=state.history.find(row=>row.id===id);
 if(!h||h.status!=='rejected'||h.appeal)return false;
 h.appeal={stage:'checking',original:h.reason,due:Date.now()+1100};
 return true;
}
function resolveAI(h){
 const a=h.appeal;
 if(a?.stage!=='checking'||Date.now()<a.due)return false;
 const {zone,gps,offset,photo}=evidence(h);
 let reason='';
 if(!gps||!zone||photo==='missing')reason='Les pièces conservées ne suffisent pas à situer le véhicule dans la zone.';
 else if(photo!=='landmark')reason='La photo ne permet pas au scénario IA d’identifier le lieu avec certitude.';
 else if(offset>Number(zone.radius)+Number(gps.accuracy))reason=`Le point se trouve à ${offset} m du centre. Même avec une précision de ± ${gps.accuracy} m, il reste hors de la zone. La photo et le relevé doivent être départagés.`;
 if(reason){a.stage='support';a.aiReason=reason;return true;}
 a.stage='approved';h.status='approved';
 a.aiReason=`Le repère de la photo correspond à ${zone.name}. La marge de précision de ± ${gps.accuracy} m est compatible avec la zone autorisée.`;
 h.reason=a.aiReason;return true;
}
function resolveSupport(state,id){
 const h=state.history.find(row=>row.id===id);
 if(h?.appeal?.stage!=='support')return false;
 const {photo,zone,gps}=evidence(h);
 // The mock human can recognise a street landmark in an otherwise conflicting dossier.
 const ok=photo==='landmark'&&Boolean(zone)&&Boolean(gps);
 h.appeal.stage=ok?'approved':'upheld';
 h.appeal.supportReason=ok?`Le support reconnaît le repère et le marquage au sol de ${zone.name} sur la photo. Le dépôt est validé malgré l’écart GPS.`:
 'Les éléments archivés ne permettent pas au support de confirmer le stationnement dans la zone. Le refus est maintenu.';
 h.status=ok?'approved':'rejected';h.reason=h.appeal.supportReason;
 return true;
}

export {caseLabels,evidence,appeal,resolveAI,resolveSupport};
