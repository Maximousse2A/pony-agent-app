import logo from './assets/pony-white.svg';
import art from './assets/angers.webp';
import { icon } from './icons.js';
import {types,available,findMission,deadline,tariff,hour,day,civilDate,statuses,totals,money,distance} from './domain.js';

const navItems=[['missions','map','Missions'],['historique','history','Historique'],['revenus','wallet','Revenus']];

function nav(page){return navItems.map(([to,i,name])=>`<a href="#${to}" class="navitem ${page===to?'current':''}" ${page===to?'aria-current="page"':''}>${icon(i)}<span>${name}</span></a>`).join('')}
function header(page){return `<header class="top"><div class="topinner"><a class="brand" href="#missions" aria-label="PonyOps, missions"><img src="${logo}" alt="pony"><span>Ops</span></a><nav class="desk-nav" aria-label="Navigation principale">${nav(page)}</nav><button class="demo" data-act="demo">${icon('flask',16)} Démo</button></div></header>`}
function typeMark(type,large=false){return `<span class="type-mark ${type} ${large?'large':''}">${icon(types[type].icon,large?26:21)}</span>`}
function dateLine(t){return `<span class="dateline">${icon('calendar',16)} Lundi 16 novembre <i></i> ${hour(t)}</span>`}
function intro(title,sub,now,extra=''){return `<div class="page-head"><div>${dateLine(now)}<h1>${title}</h1><p>${sub}</p></div>${extra}</div>`}
function tag(s){return `<span class="status ${s}"><i></i>${statuses[s]}</span>`}
function mapView(list){
  return `<section class="map-card" aria-label="Carte des missions à Angers"><div class="map-window" id="mapWindow"><div class="map-plane" id="mapPlane">
    <img class="map-art" src="${art}" alt="" draggable="false">
    <div class="you" style="left:54%;top:55%" aria-label="Votre position simulée"><span></span></div>
    ${list.map(m=>`<button class="pin ${m.type}" style="left:${m.point[0]}%;top:${m.point[1]}%" data-act="mission" data-id="${m.id}" aria-label="${types[m.type].name}, ${m.place}, ${money(tariff(m))}"><span>${icon(types[m.type].icon,20)}</span></button>`).join('')}
    </div><div class="map-city">${icon('pin',16)} Angers</div><div class="north" aria-hidden="true"><span>N</span><svg viewBox="0 0 20 24" width="14" height="17"><path d="m10 1 7 21-7-4z" fill="#554f64"/><path d="m10 1-7 21 7-4z" fill="#a7a2ad"/></svg></div>
    <div class="map-actions"><button data-act="zoom-in" aria-label="Agrandir la carte">${icon('plus')}</button><button data-act="zoom-out" aria-label="Réduire la carte">${icon('minus')}</button><button data-act="recenter" aria-label="Recentrer la carte">${icon('locate')}</button></div><span class="map-note">Carte schématique</span></div>
    <div class="map-legend"><span><b class="legend-you"></b> Ma position</span><span>${icon('layers',16)} ${list.length} mission${list.length!==1?'s':''} sur la carte</span></div></section>`
}
function missionCard(m,state){
  const mins=Math.ceil((deadline(m)-state.now)/60000);
  return `<button class="mission-row" data-act="mission" data-id="${m.id}">${typeMark(m.type)}<span class="row-main"><strong>${types[m.type].name}</strong><span>${m.place}</span><small>${distance(m.metres)}<i></i><span class="${mins<=30?'near':''}">${mins<=30?icon('clock',12):''}Avant ${hour(deadline(m))}</span></small></span><span class="row-end"><b>${money(tariff(m))}</b>${icon('chevron',16)}</span></button>`
}
function missionsPage(state,ui){
  const all=available(state);
  const list=all.filter(m=>ui.type==='all'||m.type===ui.type).sort((a,b)=>ui.sort==='time'?deadline(a)-deadline(b):a.metres-b.metres);
  const today=state.history.filter(h=>civilDate(h.time)===civilDate(state.now)),t=totals(today);
  return intro('Missions terrain','Angers · Secteur d’intervention',state.now,`<div class="tour-summary"><span class="sum-icon">${icon('wallet')}</span><div><small>Revenus du jour</small><b>${money(t.approved)}</b></div><a href="#revenus" aria-label="Voir les revenus du jour">${icon('chevron',18)}</a></div>`)+
    (state.active?`<button class="in-progress" data-act="mission" data-id="${state.active.id}"><span>${icon('flag')} Mission en cours · ${findMission(state.active.id).place}</span><b>Reprendre ${icon('arrow',16)}</b></button>`:'')+
    `<div class="field-grid">${mapView(list)}<section class="queue"><div class="queue-head"><div><h2>À proximité <span class="count">${list.length}</span></h2></div><button class="icon-button ${ui.type!=='all'?'on':''}" data-act="filter" aria-label="Filtrer et trier les missions">${icon('filter')}</button></div><div class="sortline">${icon(ui.sort==='time'?'clock':'navigation',15)} ${ui.sort==='time'?'Par échéance':'Par distance'}${ui.type!=='all'?` · ${types[ui.type].short}`:''}</div>
    <div class="mission-list">${list.map(m=>missionCard(m,state)).join('')||`<p class="empty">Aucune mission disponible${ui.type==='all'?'':' pour ce type'}.</p>`}</div></section></div>
    <div class="field-foot">${icon('info',15)} Données de démonstration <i></i> Position et distances simulées</div>`
}
function historyRow(h){
  return `<button class="history-row" data-act="receipt" data-id="${h.id}">${typeMark(h.type)}<span class="row-main"><strong>${types[h.type].name}</strong><span>${h.place}</span><small>${day(h.time)} · ${hour(h.time)}</small></span><span class="row-end"><b>${money(h.status==='rejected'?0:h.amount)}</b>${tag(h.status)}</span></button>`
}
function historyPage(state,ui){
  const list=state.history.filter(h=>ui.status==='all'||h.status===ui.status);
  return intro('Historique','Retrouvez le résultat et la preuve de chaque dépôt.',state.now)+`<section class="ledger"><div class="tabs" aria-label="Filtrer les missions">${[['all','Toutes'],...Object.entries(statuses).map(([k])=>[k,{approved:'Approuvées',pending:'En attente',rejected:'Rejetées'}[k]])].map(([k,v])=>`<button data-act="status" data-id="${k}" aria-pressed="${ui.status===k}" class="${ui.status===k?'chosen':''}">${v}</button>`).join('')}</div>${list.map(historyRow).join('')||'<p class="empty">Aucune mission dans cet état.</p>'}</section>`
}
function earningsPage(state,ui){
 const records=state.history.filter(h=>ui.period==='all'||civilDate(h.time)===civilDate(state.now)),t=totals(records);
 return intro('Mes revenus','Rémunération à la mission · montants simulés',state.now)+`<div class="tabs period"><button class="${ui.period==='day'?'chosen':''}" data-act="period" data-id="day" aria-pressed="${ui.period==='day'}">Aujourd’hui</button><button class="${ui.period==='all'?'chosen':''}" data-act="period" data-id="all" aria-pressed="${ui.period==='all'}">Tout l’historique</button></div><div class="earn-grid"><section class="earn-hero">${icon('wallet',32)}<p>Revenus approuvés</p><strong>${money(t.approved)}</strong><span>${records.filter(h=>h.status==='approved').length} missions approuvées</span></section><section class="balances"><div><span>${tag('pending')}<small>Hors des revenus approuvés</small></span><b>${money(t.pending)}</b></div><div><span>${tag('rejected')}<small>${money(t.rejected)} de tarifs refusés</small></span><b>${money(0)}</b></div></section></div><section class="ledger"><h2>Détail des missions</h2>${records.map(historyRow).join('')}</section>`
}
function shell(page,state,ui){
  return header(page)+`<main>${page==='missions'?missionsPage(state,ui):page==='historique'?historyPage(state,ui):earningsPage(state,ui)}</main><nav class="mobile-nav" aria-label="Navigation mobile">${nav(page)}</nav>`;
}

export {shell,typeMark,tag};
