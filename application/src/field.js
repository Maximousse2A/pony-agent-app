import art from './assets/angers.webp';
import {icon,typeMark} from './icons.js';
import {available,findMission,types,tariff,day,hour,deadline,distance,money,originPoint} from './domain.js';
import {itinerary,windows,duration} from './tours.js';

const act=(action,text,ico,css='small-btn',id='')=>`<button class="${css}" data-act="${action}" data-id="${id}">${ico?icon(ico,17):''}${text}</button>`;
const tool=(action,label,ico,id='',disabled=false)=>`<button class="field-tool" data-act="${action}" data-id="${id}" aria-label="${label}" title="${label}" ${disabled?'disabled':''}>${icon(ico,18)}</button>`;
function lineDrawing(plan){
 const points=plan.points.map(([x,y])=>`${x*8.4},${y*6}`).join(' ');
 return `<svg class="route-line" viewBox="0 0 840 600" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="white" stroke-width="7" vector-effect="non-scaling-stroke"/><polyline points="${points}" fill="none" stroke="#321ed3" stroke-width="3.5" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}
function mapView(list,state,selected,plan){
 const start=state.position||originPoint;
 const pins=list.map(m=>{
  const n=plan.steps.findIndex(l=>l.m.id===m.id);
  return `<button class="pin ${m.type} ${selected===m.id?'picked':''}" style="left:${m.point[0]}%;top:${m.point[1]}%" data-act="select" data-id="${m.id}" aria-label="${types[m.type].name}, ${m.number}, ${m.place}" aria-pressed="${selected===m.id}"><span>${n<0?icon(types[m.type].icon,20):n+1}</span>${selected===m.id?`<b class="pin-caption">${m.number}</b>`:''}</button>`;
 }).join('');
 return `<div id="mapWindow" class="map-window" aria-label="Carte des missions à Angers"><div id="mapPlane" class="map-plane"><img class="map-art" src="${art}" alt="" draggable="false">${plan.steps.length?lineDrawing(plan):''}<div class="you" style="left:${start[0]}%;top:${start[1]}%" aria-label="Position simulée"><span></span></div>${pins}</div></div>`;
}
function slider(m,active=false){
 const label=active?'Glisser pour continuer':'Glisser pour accepter';
 return `<div class="accept-slide" data-mission="${m.id}" data-resume="${active}"><div class="slide-fill"></div><span class="slide-label">${label}</span><div class="slide-thumb" tabindex="0" role="slider" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-describedby="slideKeys">${icon('arrow',23)}</div></div><span class="sr" id="slideKeys">Au clavier, utilisez la flèche droite jusqu’au bout, puis Entrée.</span>`;
}
function card(m,ui){
 return `<button class="mission-row ${ui.selected===m.id?'selected-row':''}" data-act="select" data-id="${m.id}" aria-pressed="${ui.selected===m.id}">${typeMark(m.type)}<span class="row-main"><strong>${types[m.type].name}</strong><span>${m.place}</span><small>${m.number} · ${distance(m.metres)} · ${hour(deadline(m))}</small></span><span class="row-end"><b>${money(tariff(m))}</b>${icon('chevron',15)}</span></button>`;
}
function selectedCard(m,state){
 const active=state.active?.id===m.id,blocked=state.active&&!active;
 return `<header class="vehicle-head">${typeMark(m.type,true)}<div><small>${m.vehicle} ${m.number} · ${m.zone}</small><h2 tabindex="-1">${types[m.type].name}</h2></div><b>${money(tariff(m))}</b></header>
 <div class="vehicle-trip"><strong>${icon('pin',16)} ${m.place}</strong><span>${m.reason}</span></div>
 <details class="vehicle-facts"><summary>Créée le ${day(m.created)} à ${hour(m.created)} · avant ${hour(deadline(m))}</summary><p>Dépôt prévu · ${m.destination}<br>Distance indicative · ${distance(m.metres)}</p></details>
 ${blocked?`<p class="hint">Terminez d’abord la mission en cours.</p>${act('select','Mission en cours','flag','small-btn',state.active.id)}`:slider(m,active)}`;
}
function routeEditor(state){
 const plan=state.draft;
 if(!plan)return '';
 const trip=itinerary(state,plan);
 const addable=available(state).filter(m=>!plan.ids.includes(m.id));
 const empty=!trip.steps.length,over=trip.minutes>plan.budget,late=trip.steps.some(s=>s.late);
 return `<div class="plan-heading"><h2>Proposition de tournée</h2><span class="sim">IA simulée</span></div>
 <div class="time-choices" aria-label="Temps disponible">${windows.map(([v,l])=>`<button data-act="budget" data-id="${v}" aria-pressed="${v===plan.budget}">${l}</button>`).join('')}</div>
 <div class="plan-scroll">
 <div class="trip-metrics"><div><small>Durée estimée</small><strong>${duration(trip.minutes)}</strong></div><div><small>Gains estimés</small><strong>${money(trip.fee)}</strong></div></div>
 <p class="hint">${trip.drive} min de trajet · ${trip.minutes-trip.drive} min d’intervention${state.active?' · départ après la mission en cours':''}</p>
 ${trip.steps.length?`<div class="route-inset" aria-label="Tracé indicatif dans l’ordre des étapes"><img src="${art}" alt="">${lineDrawing(trip)}${trip.steps.map(({m},i)=>`<b style="left:${m.point[0]}%;top:${m.point[1]}%">${i+1}</b>`).join('')}</div>`:''}
 <ol class="stage-list">${trip.steps.map(({m,minutes,fee,late},i)=>`<li><b class="stage-index">${i+1}</b><div><strong>${m.place}</strong><small>${types[m.type].short} · ${minutes} min · ${money(fee)}</small>${m.destination!==m.place?`<small>Dépôt · ${m.destination}</small>`:''}${late?'<small class="conflict">Fin prévue après l’échéance</small>':''}</div><div class="stage-controls">${tool('up','Avancer '+m.place,'up',m.id,i===0)}${tool('down','Reculer '+m.place,'down',m.id,i===trip.steps.length-1)}${tool('remove','Retirer '+m.place,'cross',m.id)}</div></li>`).join('')}</ol>
 ${empty?'<p>Aucune étape retenue pour cette durée.</p>':''}
 ${addable.length?`<label class="add-step">Ajouter une étape<select name="add-stop"><option value="">Choisir une mission</option>${addable.map(m=>`<option value="${m.id}">${m.place} · ${types[m.type].short}</option>`).join('')}</select></label>`:''}
 ${over?`<p class="conflict">La tournée dépasse la durée choisie de ${trip.minutes-plan.budget} min.</p>`:''}${late?'<p class="conflict">Réordonnez ou retirez les étapes hors délai.</p>':''}
 </div><div class="plan-footer"><button class="btn primary" data-act="confirm-tour" ${trip.valid?'':'disabled'}>${icon('check',17)} Confirmer la tournée</button>${act('leave-plan','Retour aux missions',null,'text-btn')}</div>`;
}
function missionsPage(state,ui){
 const active=state.active&&findMission(state.active.id);
 const all=available(state);
 const editing=ui.mode==='plan'&&!!state.draft;
 const trip=itinerary(state,editing?state.draft:state.tour);
 const list=all.filter(m=>ui.type==='all'||ui.type===m.type).sort((a,b)=>ui.sort==='time'?deadline(a)-deadline(b):a.metres-b.metres);
 const mapList=editing||state.tour?all:list;
 const points=active?[...mapList,active]:mapList;
 const picked=points.find(m=>m.id===ui.selected);
 const detail=Boolean(picked)&&ui.mode==='detail'&&!editing;
 const folded=ui.folded;
 const next=trip.steps[0]?.m;
 return `<div class="field-screen ${folded?'folded':''} ${editing?'editing':''}" aria-label="Missions terrain">
 ${mapView(points,state,ui.selected,trip)}
 <div class="map-locality">${icon('pin',16)}<b>Angers</b><span>· Carte simulée</span></div>
 <div class="map-utilities">${tool('zoom-in','Agrandir la carte','plus')}${tool('zoom-out','Réduire la carte','minus')}${tool('recenter','Recentrer la carte','locate')}</div>
 <div class="dock-zone"><div class="dock-tools"><button class="bolt" data-act="plan" aria-label="Proposer une tournée assistée par IA">${icon('bolt',21)}<span>Tournée IA</span></button></div>
 <section class="field-dock" id="fieldDock" aria-label="Panneau de missions">
 <button class="dock-handle" data-act="fold" aria-expanded="${!folded}" aria-label="${folded?'Déployer':'Replier'} le panneau"><span></span></button>
 ${folded?`<button class="fold-summary" data-act="fold"><strong>${editing?'Tournée proposée':detail?picked.number:'Missions à proximité'}</strong><span>${editing?duration(trip.minutes):detail?picked.place:list.length+' disponibles'} ${icon('up',16)}</span></button>`:
 editing?routeEditor(state):detail?`<div class="detail-tools">${act('list','À proximité','back','text-btn')}</div><div class="selected-content">${selectedCard(picked,state)}</div>`:
 `<div class="dock-heading"><div><small>Territoire d’Angers · ${hour(state.now)}</small><h2>À proximité <span class="count">${list.length}</span></h2></div>${tool('filter','Filtrer et trier les missions','filter')}</div>
 ${active?`<button class="tour-strip" data-act="select" data-id="${active.id}">${icon('flag',16)} Mission en cours · ${active.number} ${icon('chevron',16)}</button>`:''}
 ${state.tour?`<div class="saved-tour"><span>${icon('route',16)} Tournée · ${trip.steps.length} à faire</span>${act('plan','Ajuster',null,'text-btn')}${act('clear-tour','Quitter',null,'text-btn')}</div>${next?`<button class="next-stop" data-act="select" data-id="${next.id}">Prochaine étape · ${next.place} ${icon('chevron',15)}</button>`:''}`:''}
 <div class="mission-list">${list.map(m=>card(m,ui)).join('')||'<p class="empty">Aucune mission disponible pour ce filtre.</p>'}</div>`}
 </section></div></div>`;
}

export {missionsPage};
