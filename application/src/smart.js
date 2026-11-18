import {available,day,hour} from './domain.js';

// A product rule for the pilot, not an inferred commercial value or an AI forecast.
export function smartRank(m) {
  return m.priority===3?3:m.smart?2:1;
}
export function compareSmart(a,b) {
  return smartRank(b)-smartRank(a) || (a.smart?.deliverBy??Infinity)-(b.smart?.deliverBy??Infinity) ||
    b.priority-a.priority || a.metres-b.metres;
}
export function serviceRemaining(at) {
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(at);
  const minutes=Number(parts.find(p=>p.type==='hour').value)*60+Number(parts.find(p=>p.type==='minute').value);
  return minutes>=8*60&&minutes<20*60?20*60-minutes:0;
}
export function missionPurpose(m) {
  if(m.smart)return `${m.destination} · dépôt avant ${hour(m.smart.deliverBy)}`;
  return m.priority===3?'Intervention critique à traiter en premier':m.reason;
}
export function objectiveLabel(smart) {
  return `Disponibilité visée le ${day(smart.targetAt)} à ${hour(smart.targetAt)}`;
}
export function smartProgress(state) {
  const rows=state.history.filter(h=>h.smart && (state.mode==='evening'?h.id.startsWith('SMART-'):!h.id.startsWith('SMART-')));
  return {approved:rows.filter(h=>h.status==='approved').length,pending:rows.filter(h=>h.status==='pending').length,
    rejected:rows.filter(h=>h.status==='rejected').length,remaining:available(state).filter(m=>m.smart).length};
}
export function uncoveredNeeds(state,steps=[]) {
  const planned=new Set(steps.filter(s=>!s.late&&!s.targetLate).map(s=>s.m.id));
  const omissions=available(state).filter(m=>m.smart&&!planned.has(m.id)).map(m=>`${m.destination} : mission non incluse dans cette tournée.`);
  return [state.mode==='evening'
    ?'Gare demain à 7 h 30 : couverture non assurée. Aucun agent entre 20 h et 8 h ; seuls 40 % des véhicules déposés à 20 h restent à 7 h 30. Organisation à convenir avec le prestataire.'
    :'Gare à 7 h 30 : créneau passé, couverture non vérifiée. Le renfort de journée ne rattrape pas le service manqué.',...omissions];
}
