import {missionPurpose,objectiveLabel,smartProgress,uncoveredNeeds} from './smart.js';
import {fieldMissions,priorities} from './navigation.js';
import {icon,typeMark} from './icons.js';
import {available,findMission,types,tariff,day,hour,deadline,distance,money,originPoint} from './domain.js';
import {itinerary,windows,duration} from './tours.js';

const act=(action,text,ico,css='small-btn',id='')=>`<button class="${css}" data-act="${action}" data-id="${id}">${ico?icon(ico,17):''}${text}</button>`;
const tool=(action,label,ico,id='',disabled=false)=>`<button class="field-tool" data-act="${action}" data-id="${id}" aria-label="${label}" title="${label}" ${disabled?'disabled':''}>${icon(ico,18)}</button>`;
function slider(m,active=false){
 const label=active?'Glisser pour continuer':'Glisser pour accepter';
 return `<div class="accept-slide" data-mission="${m.id}" data-resume="${active}"><div class="slide-fill"></div><span class="slide-label">${label}</span><div class="slide-thumb" tabindex="0" role="slider" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-describedby="slideKeys">${icon('arrow',23)}</div></div><span class="sr" id="slideKeys">Au clavier, utilisez la flèche droite jusqu’au bout, puis Entrée.</span>`;
}
const badge = m => `<span class="dispatch-priority priority-${m.priority}">${priorities[m.priority]}</span>`;
function acceptControls(m,active=false){
 return `<div class="accept-controls">${slider(m,active)}${act(active?'resume':'take',active?'Reprendre':'Accepter',null,'accept-button',m.id)}</div>`;
}
function compactMission(nearest,active){
 if(!nearest&&!active)return '<p class="near-empty">Aucune mission disponible pour ce filtre.</p>';
 return `<div class="near-preview">${nearest?`<button class="near-summary" data-act="select" data-id="${nearest.id}"><span><b>${types[nearest.type].name}</b><strong>${money(tariff(nearest))}</strong></span><span><small>${distance(nearest.metres)} · ${nearest.place}</small>${badge(nearest)}</span></button>`:''}
 ${nearest?.smart?`<p class="smart-purpose">${missionPurpose(nearest)}</p>`:''}
 ${active?act('resume','Reprendre · '+active.number,'flag','small-btn',active.id):acceptControls(nearest)}</div>`;
}
function card(m,ui){
 return `<button class="mission-row ${ui.selected===m.id?'selected-row':''}" data-act="select" data-id="${m.id}" aria-pressed="${ui.selected===m.id}">${typeMark(m.type)}<span class="row-main"><strong>${types[m.type].name}</strong><span>${m.place}</span>${m.smart?`<small class="smart-purpose">Vers ${m.destination} · avant ${hour(m.smart.deliverBy)}</small>`:''}<small>${m.number} · ${distance(m.metres)} · ${hour(deadline(m))}</small></span><span class="row-end"><b>${money(tariff(m))}</b>${badge(m)}</span></button>`;
}
function selectedCard(m,state){
 const active=state.active?.id===m.id,blocked=state.active&&!active;
 return `<header class="vehicle-head">${typeMark(m.type,true)}<div><small>${m.vehicle} ${m.number} · ${m.zone}</small><h2 tabindex="-1">${types[m.type].name}</h2></div><b>${money(tariff(m))}</b></header>
 <div class="vehicle-trip"><strong>${icon('pin',16)} ${m.place}</strong><span>${m.reason}</span>${badge(m)}</div>
 ${m.smart?`<section class="smart-note"><strong>${missionPurpose(m)}</strong><p>${m.smart.reason}</p><small>${objectiveLabel(m.smart)} · consigne pilote fictive</small></section>`:''}
 <details class="vehicle-facts"><summary>Créée le ${day(m.created)} à ${hour(m.created)} · avant ${hour(deadline(m))}</summary><p>${m.type==='battery'?'Intervention sur place':'Dépôt prévu'} · ${m.destination}<br>Distance indicative · ${distance(m.metres)}</p></details>
 ${blocked?`<p class="hint">Terminez d’abord la mission en cours.</p>${act('select','Mission en cours','flag','small-btn',state.active.id)}`:acceptControls(m,active)}`;
}
function routeEditor(state){
 const plan=state.draft;
 if(!plan)return '';
 const trip=itinerary(state,plan);
 const addable=available(state).filter(m=>!plan.ids.includes(m.id));
 const empty=!trip.steps.length,over=trip.minutes>plan.budget,late=trip.steps.some(s=>s.late||s.targetLate);
 return `<div class="plan-heading"><h2>Les priorités de Pony</h2><span class="sim">Pilote simulé</span></div>
 <div class="time-choices" aria-label="Temps disponible">${windows.map(([v,l])=>`<button data-act="budget" data-id="${v}" aria-pressed="${v===plan.budget}">${l}</button>`).join('')}</div>
 <div class="plan-scroll">
 <p class="smart-purpose">${state.mode==='evening'?'Préparer demain à 7 h 30 · service jusqu’à 20 h':'Interventions critiques, puis disponibilité aux lieux utiles.'}</p>
 <p class="hint">Départ estimé à ${hour(trip.departure)} · ${trip.capacity} min restantes avant la fin du service. Les durées choisies sont plafonnées à 20 h.</p>
 <div class="trip-metrics"><div><small>Dépôts ciblés</small><strong>${trip.targeted}</strong></div><div><small>Durée estimée</small><strong>${duration(trip.minutes)}</strong></div></div>
 <p class="hint">${money(trip.fee)} de tarifs, sous réserve de validation · ${trip.drive} min de trajet · ${trip.minutes-trip.drive} min d’intervention${state.active?' · départ après la mission en cours':''}</p>
 <details class="smart-needs"><summary>Besoins non couverts</summary>${uncoveredNeeds(state,trip.steps).map(text=>`<p>${text}</p>`).join('')}</details>
 <details class="smart-needs"><summary>Pourquoi cette tournée ?</summary><p>Interventions critiques d’abord, puis dépôts ciblés dans leur créneau, puis autres tâches. À couverture égale, le temps total le plus court passe avant les gains.</p><p>Objectifs et durées fictifs. Un dépôt validé ne garantit pas la présence du véhicule demain. L’observation de 80 % restant aux campus et à l’hôpital concerne les dépôts à 20 h ; ce n’est pas une prévision individuelle.</p></details>
 ${state.mode!=='evening'?act('confirm-evening','Explorer la préparation du soir','route','small-btn'):''}
 ${trip.steps.length?'<div id="routePreview" class="route-inset" role="img" aria-label="Itinéraire indicatif des étapes de Pony Smart"></div>':''}
 <ol class="stage-list">${trip.steps.map(({m,minutes,fee,late,targetLate,finishAt},i)=>`<li><b class="stage-index">${i+1}</b><div><strong>${m.place}</strong><small>${types[m.type].short} · ${minutes} min · ${money(fee)}</small>${m.destination!==m.place?`<small>Dépôt · ${m.destination}</small>`:''}<small>Fin estimée · ${hour(finishAt)}</small>${m.smart?`<small class="smart-purpose">${m.smart.reason}</small>`:''}${late?'<small class="conflict">Prise en charge après l’échéance</small>':''}${targetLate?'<small class="conflict">Objectif de dépôt hors délai</small>':''}</div><div class="stage-controls">${tool('up','Avancer '+m.place,'up',m.id,i===0)}${tool('down','Reculer '+m.place,'down',m.id,i===trip.steps.length-1)}${tool('remove','Retirer '+m.place,'cross',m.id)}</div></li>`).join('')}</ol>
 ${empty?'<p>Aucune étape retenue pour cette durée.</p>':''}
 ${addable.length?`<label class="add-step">Ajouter une étape<select name="add-stop"><option value="">Choisir une mission</option>${addable.map(m=>`<option value="${m.id}">${m.place} · ${types[m.type].short}</option>`).join('')}</select></label>`:''}
 ${trip.afterShift?'<p class="conflict">Fin après 20 h ou départ hors service. Réduisez la tournée.</p>':''}
 ${over?`<p class="conflict">La tournée dépasse la durée choisie de ${trip.minutes-plan.budget} min.</p>`:''}${late?'<p class="conflict">Réordonnez ou retirez les étapes hors délai.</p>':''}
 </div><div class="plan-footer"><button class="btn primary" data-act="confirm-tour" ${trip.valid?'':'disabled'}>${icon('check',17)} Confirmer la tournée</button>${act('leave-plan','Retour aux missions',null,'text-btn')}</div>`;
}
function missionsPage(state,ui){
 const {list,nearest,withDistance}=fieldMissions(state,ui);
 const progress=smartProgress(state);
 const listTitle=ui.sort==='smart'?'Priorités terrain':'À proximité';
 const active=state.active&&withDistance(findMission(state.active.id));
 const editing=ui.mode==='plan'&&!!state.draft;
 const trip=itinerary(state,editing?state.draft:state.tour);
 const picked=active?.id===ui.selected?active:list.find(m=>m.id===ui.selected);
 const detail=Boolean(picked)&&ui.mode==='detail'&&!editing;
 const folded=ui.folded;
 const next=trip.steps[0]?.m;
 return `<div class="field-screen ${folded?'folded':''} ${editing?'editing':''}" aria-label="Missions terrain">
 <h1 class="sr">Missions terrain</h1><div id="mapHost" class="map-window"></div>
 <a class="map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© contributeurs OpenStreetMap</a>
 <div class="map-locality">${icon('pin',16)}<b>Angers</b><span>· ${ui.location?'Ma position GPS':'Position de démo'}</span></div>
 <div class="map-utilities">${tool('zoom-in','Agrandir la carte','plus')}${tool('zoom-out','Réduire la carte','minus')}${tool('recenter','Utiliser ma position','locate')}</div>
 <div class="dock-zone">
 <button class="bolt" data-act="${editing&&!folded?'fold':'plan'}" aria-expanded="${editing&&!folded}" aria-label="${editing&&!folded?'Réduire Pony Smart':'Ouvrir Pony Smart'}">${icon('bolt',21)}<span>Pony Smart</span></button>
 <section class="field-dock" id="fieldDock" aria-label="Panneau de missions">
 <button type="button" class="dock-toggle" data-act="fold" aria-expanded="${!folded}" aria-controls="dockContent">
 <strong>${editing?'Pony Smart':detail&&!folded?picked.number:listTitle}${!editing&&!detail?` <span class="count">${list.length}</span>`:''}</strong>
 <span class="dock-command">${folded?'Ouvrir':'Réduire'} ${icon(folded?'up':'down',17)}</span></button>
 ${folded&&!editing?compactMission(nearest,active):''}
 <div id="dockContent" class="dock-content" ${folded?'hidden':''}>
 ${folded?'':editing?routeEditor(state):detail?`<div class="detail-tools">${act('list','Toutes les missions','back','text-btn')}</div><div class="selected-content">${selectedCard(picked,state)}</div>`:
 `<div class="mission-list"><div class="dock-heading"><small>Angers · ${hour(state.now)}</small>${tool('filter','Filtrer et trier les missions','filter')}</div>
 <section class="smart-overview"><strong>${state.mode==='evening'?'Préparer demain matin':'Disponibilité et interventions'}</strong><p>${progress.remaining} mission(s) ciblée(s) disponible(s) · ${progress.approved} dépôt(s) approuvé(s) · ${progress.pending} en attente${progress.rejected?' · '+progress.rejected+' refusé(s)':''}</p><small>Présence au créneau cible : non mesurée</small>${act('plan','Voir la tournée Smart','route','small-btn')}</section>
 ${active?`<button class="tour-strip" data-act="select" data-id="${active.id}">${icon('flag',16)} Mission en cours · ${active.number} ${icon('chevron',16)}</button>`:''}
 ${state.tour?`<div class="saved-tour"><span>${icon('route',16)} Pony Smart · ${trip.steps.length} à faire</span>${act('plan','Ajuster',null,'text-btn')}${act('clear-tour','Quitter',null,'text-btn')}</div>${next?`<button class="next-stop" data-act="select" data-id="${next.id}">Prochaine étape · ${next.place} ${icon('chevron',15)}</button>`:''}`:''}
 ${list.map(m=>card(m,ui)).join('')||'<p class="empty">Aucune mission disponible pour ce filtre.</p>'}</div>`}
 </div></section></div></div>`;
}

export {missionsPage};
