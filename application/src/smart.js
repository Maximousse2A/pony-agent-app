import {available,day,hour} from './domain.js';

// A product rule for the pilot, not an inferred commercial value or an AI forecast.
export function smartRank(m) {
  return m.smart?3:m.priority===3?2:1;
}
export function compareSmart(a,b) {
  return smartRank(b)-smartRank(a) || (a.smart?.deliverBy??Infinity)-(b.smart?.deliverBy??Infinity) ||
    b.priority-a.priority || a.metres-b.metres;
}
export {serviceRemaining} from './service.js';
export function missionPurpose(m) {
  if(m.smart)return `${m.destination} · dépôt avant ${hour(m.smart.deliverBy)}`;
  return m.priority===3?'Intervention critique':m.reason;
}
export function objectiveLabel(smart) {
  return `Disponibilité visée le ${day(smart.targetAt)} à ${hour(smart.targetAt)}`;
}
export function smartProgress(state) {
  const rows=state.history.filter(h=>h.smart);
  return {approved:rows.filter(h=>h.status==='approved').length,pending:rows.filter(h=>h.status==='pending').length,
    rejected:rows.filter(h=>h.status==='rejected').length,remaining:available(state).filter(m=>m.smart).length};
}
