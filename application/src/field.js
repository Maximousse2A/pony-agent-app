import {missionPurpose,objectiveLabel} from './smart.js';
import {fieldMissions,priorities} from './navigation.js';
import {icon,typeMark} from './icons.js';
import {serviceMissions,findMission,types,tariff,day,hour,civilDate,deadline,distance,money} from './domain.js';
import {itinerary,duration,uncoveredNeeds} from './tours.js';

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
 const m=active||nearest;
 if(!m)return '<p class="near-empty">Aucune mission pour ces filtres.</p>';
 return `<div class="near-preview"><button class="near-summary" data-act="select" data-id="${m.id}"><span><b>${types[m.type].name}</b></span><small>${m.place} · ${distance(m.metres)}</small><span>${badge(m)}<strong>${money(tariff(m))}</strong></span>${m.smart?`<small class="smart-purpose">${missionPurpose(m)}</small>`:''}</button>
 ${act(active?'resume':'take',active?'Reprendre':'Accepter',null,'accept-button',m.id)}</div>`;
}
function pickupLabel(m,now){
 const due=deadline(m);
 return civilDate(due)===civilDate(now)?hour(due):`le ${day(due)} à ${hour(due)}`;
}
function card(m,ui,now){
 return `<button class="mission-row ${ui.selected===m.id?'selected-row':''}" data-act="select" data-id="${m.id}" aria-pressed="${ui.selected===m.id}">${typeMark(m.type)}<span class="row-main"><strong>${types[m.type].name}</strong><span>${m.place}</span>${m.smart?`<small class="smart-purpose">Vers ${m.destination} · avant ${hour(m.smart.deliverBy)}</small>`:''}<small>${distance(m.metres)} · à prendre avant ${pickupLabel(m,now)}</small></span><span class="row-end"><b>${money(tariff(m))}</b>${badge(m)}</span></button>`;
}
function selectedCard(m,state){
 const active=state.active?.id===m.id,blocked=state.active&&!active;
 return `<header class="vehicle-head">${typeMark(m.type,true)}<div><small>${m.vehicle} ${m.number} · ${m.zone}</small><h2 tabindex="-1">${types[m.type].name}</h2></div><b>${money(tariff(m))}</b></header>
 <div class="vehicle-trip"><strong>${icon('pin',16)} ${m.place}</strong><span>${m.reason}</span>${badge(m)}</div>
 ${m.smart?`<section class="smart-note"><strong>${missionPurpose(m)}</strong><p>${objectiveLabel(m.smart)}</p></section>`:''}
 <details class="vehicle-facts"><summary>À prendre avant ${pickupLabel(m,state.now)} · ${distance(m.metres)}</summary><p>Créée le ${day(m.created)} à ${hour(m.created)}<br>${m.type==='battery'?'Intervention sur place':'Dépôt prévu'} · ${m.destination}${m.smart?'<br>'+m.smart.reason:''}</p></details>
 ${blocked?`<p class="hint">Terminez d’abord la mission en cours.</p>${act('select','Mission en cours','flag','small-btn',state.active.id)}`:acceptControls(m,active)}`;
}
function routeEditor(state){
 const plan=state.draft;
 if(!plan)return '';
 const trip=itinerary(state,plan);
 const addable=serviceMissions(state).filter(m=>!plan.ids.includes(m.id));
 const empty=!trip.steps.length,late=trip.steps.some(s=>s.late||s.targetLate);
 const needs=uncoveredNeeds(state,plan,trip);
 const reviews=state.history.filter(h=>h.smart&&['pending','rejected'].includes(h.status));
 const activeTarget=state.active&&findMission(state.active.id)?.smart&&findMission(state.active.id);
 return `<div class="plan-heading"><h2>${state.mode==='evening'?'Préparer demain à 7 h 30':'Tournée proposée'}</h2></div>
 <div class="plan-scroll">
 <div class="trip-metrics"><div><small>Dépôts planifiés</small><strong>${trip.targeted} / ${serviceMissions(state).filter(m=>m.smart).length}</strong></div><div><small>Trajet et intervention</small><strong>${duration(trip.minutes-trip.waiting)}</strong></div><div><small>Tarif potentiel</small><strong>${money(trip.fee)}</strong></div></div>
 <p class="route-time">${icon('clock',15)} Départ ${hour(trip.departure)}${state.active?' après la mission en cours':''}${trip.steps.length?' · Fin prévue '+hour(trip.departure+trip.minutes*60000):''}</p>
 ${needs.length?`<details class="smart-needs"><summary>Missions hors tournée <span class="count">${needs.length}</span></summary>${needs.map(text=>`<p>${text}</p>`).join('')}</details>`:''}
 ${reviews.length?`<details class="smart-needs"><summary>Dépôts à suivre <span class="count">${reviews.length}</span></summary>${reviews.map(h=>`<p>${findMission(h.id)?.destination||'Dépôt ciblé'} · ${h.status==='rejected'?'dépôt refusé, besoin à réexaminer':'preuve en attente de validation'}</p>`).join('')}</details>`:''}
 ${activeTarget?`<p class="route-time">Dépôt en cours · ${activeTarget.destination}</p>`:''}
 <ol class="stage-list">${trip.steps.map(({m,minutes,late,targetLate,finishAt},i)=>`<li><b class="stage-index">${i+1}</b><div><strong>${m.place}</strong><small>${types[m.type].short} · ${minutes} min · fin ${hour(finishAt)}</small>${m.destination!==m.place?`<small class="${m.smart?'smart-purpose':''}">${icon('route',13)} ${m.destination}${m.smart?' avant '+hour(m.smart.deliverBy):''}</small>`:''}${m.smart?`<small>${objectiveLabel(m.smart)}</small>`:''}${m.created>state.now?`<small>Disponible à ${hour(m.created)}</small>`:''}${m.priority===3?badge(m):''}${late?'<small class="conflict">Prise en charge après l’échéance</small>':''}${targetLate?'<small class="conflict">Objectif de dépôt hors délai</small>':''}</div><div class="stage-controls">${tool('up','Avancer '+m.place,'up',m.id,i===0)}${tool('down','Reculer '+m.place,'down',m.id,i===trip.steps.length-1)}${tool('remove','Retirer '+m.place,'cross',m.id)}</div></li>`).join('')}</ol>
 ${empty?'<p>Aucune mission réalisable sur le service restant.</p>':''}
 ${trip.steps.length?'<div id="routePreview" class="route-inset" role="img" aria-label="Itinéraire indicatif des étapes de Pony Smart"></div>':''}
 ${addable.length?`<label class="add-step">Ajouter une étape<select name="add-stop"><option value="">Choisir une mission</option>${addable.map(m=>`<option value="${m.id}">${m.place} · ${types[m.type].short}</option>`).join('')}</select></label>`:''}
 ${trip.afterShift?'<p class="conflict">Fin après 20 h ou départ hors service. Réduisez la tournée.</p>':''}
 ${late?'<p class="conflict">Réordonnez ou retirez les étapes hors délai.</p>':''}

 <details class="smart-needs"><summary>Critères et estimations</summary><p>Ordre de priorité : dépôts ciblés réalisables, interventions critiques, autres missions. À couverture égale, Pony Smart privilégie une fin plus tôt, puis une durée de travail plus courte. Le tarif départage les tournées équivalentes.</p><p>${trip.drive} min de trajet et ${trip.minutes-trip.waiting-trip.drive} min sur place. Tarifs sous réserve de validation.</p><p>La présence au créneau cible reste à vérifier. Dans le cas étudié, 80 % des véhicules déposés à 20 h au campus ou à l’hôpital y sont encore à 7 h 30.</p></details>
 </div><div class="plan-footer"><button class="btn primary" data-act="confirm-tour" ${trip.valid?'':'disabled'}>${icon('check',17)} Confirmer la tournée</button>${act('leave-plan','Retour aux missions',null,'text-btn')}</div>`;
}
function missionsPage(state,ui){
 const {list,nearest,withDistance}=fieldMissions(state,ui);
 const targeted=list.filter(m=>m.smart);
 const others=list.filter(m=>!m.smart);
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
 ${folded&&!editing?compactMission(targeted[0]??nearest,active):''}
 <div id="dockContent" class="dock-content" ${folded?'hidden':''}>
 ${folded?'':editing?routeEditor(state):detail?`<div class="detail-tools">${act('list','Toutes les missions','back','text-btn')}</div><div class="selected-content">${selectedCard(picked,state)}</div>`:
 `<div class="mission-list"><div class="dock-heading"><small>${icon('clock',15)} ${hour(state.now)}</small>${tool('filter','Filtrer et trier les missions','filter')}</div>
 ${active?`<button class="tour-strip" data-act="select" data-id="${active.id}">${icon('flag',16)} Mission en cours · ${active.number} ${icon('chevron',16)}</button>`:''}
 ${state.tour?`<div class="saved-tour"><span>${icon('route',16)} Pony Smart · ${trip.steps.length} à faire</span>${act('adjust-tour','Ajuster',null,'text-btn')}${act('clear-tour','Quitter',null,'text-btn')}</div>${next?.created>state.now&&!state.active?`<button class="next-stop" data-act="wait-next" data-id="${next.id}">Simuler le départ à ${hour(next.created)} · ${next.place} ${icon('chevron',15)}</button>`:next&&next.created<=state.now?`<button class="next-stop" data-act="select" data-id="${next.id}">Prochaine étape · ${next.place} ${icon('chevron',15)}</button>`:''}`:''}
 ${targeted.length?`<section aria-labelledby="targeted-title"><h2 id="targeted-title" class="mission-group-title">Dépôts ciblés <span class="count">${targeted.length}</span></h2>${targeted.map(m=>card(m,ui,state.now)).join('')}</section>`:''}
 ${targeted.length&&others.length?'<h2 class="mission-group-title">Autres missions</h2>':''}
 ${others.map(m=>card(m,ui,state.now)).join('')}
 ${list.length?'':'<p class="empty">Aucune mission disponible pour ce filtre.</p>'}</div>`}
 </div></section></div></div>`;
}

export {missionsPage};
