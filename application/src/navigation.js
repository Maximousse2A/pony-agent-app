import {available, coordinates, deadline, originPoint} from './domain.js';

export const priorities = ['Faible', 'Normale', 'Haute', 'Critique'];

export function directions([lat, lng]) {
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(lat + ',' + lng);
}

function metresBetween([lat1, lng1], [lat2, lng2]) {
  const rad = Math.PI / 180;
  const h = Math.sin((lat2-lat1)*rad/2)**2 +
    Math.cos(lat1*rad) * Math.cos(lat2*rad) * Math.sin((lng2-lng1)*rad/2)**2;
  return Math.round(12742000 * Math.asin(Math.sqrt(Math.min(1, h))));
}

export function fieldMissions(state, ui) {
  const position = ui.location || coordinates(state.position || originPoint);
  const withDistance = m => ({...m, metres: metresBetween(position, coordinates(m.point))});
  const all = available(state).map(withDistance);
  const near = all.filter(m => (ui.type === 'all' || m.type === ui.type) &&
    (ui.priority === 'all' || String(m.priority) === ui.priority)).sort((a,b) => a.metres-b.metres);
  const list = [...near];
  if (ui.sort === 'priority') list.sort((a,b) => b.priority-a.priority || a.metres-b.metres);
  if (ui.sort === 'time') list.sort((a,b) => deadline(a)-deadline(b) || a.metres-b.metres);
  return {list, nearest: near[0], position, withDistance};
}
