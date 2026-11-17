import logo from './assets/pony-white.svg';
import {missionsPage} from './field.js';
import {caseLabels} from './appeals.js';
import { icon,typeMark } from './icons.js';
import {types,hour,day,civilDate,statuses,totals,money} from './domain.js';

const navItems=[['missions','map','Missions'],['historique','history','Historique'],['revenus','wallet','Revenus']];

function nav(page){return navItems.map(([to,i,name])=>`<a href="#${to}" class="navitem ${page===to?'current':''}" ${page===to?'aria-current="page"':''}>${icon(i)}<span>${name}</span></a>`).join('')}
function header(page){return `<header class="top"><div class="topinner"><a class="brand" href="#missions" aria-label="PonyOps, missions"><img src="${logo}" alt="pony"><span>Ops</span></a><nav class="desk-nav" aria-label="Navigation principale">${nav(page)}</nav><button class="demo" data-act="demo">${icon('flask',16)} Démo</button></div></header>`}
function dateLine(t){return `<span class="dateline">${icon('calendar',16)} Lundi 16 novembre <i></i> ${hour(t)}</span>`}
function intro(title,sub,now,extra=''){return `<div class="page-head"><div>${dateLine(now)}<h1>${title}</h1><p>${sub}</p></div>${extra}</div>`}
function tag(s){return `<span class="status ${s}"><i></i>${statuses[s]}</span>`}
function historyRow(h){
  return `<button class="history-row" data-act="receipt" data-id="${h.id}">${typeMark(h.type)}<span class="row-main"><strong>${types[h.type].name}</strong><span>${h.place}</span><small>${day(h.time)} · ${hour(h.time)}</small></span><span class="row-end"><b>${money(h.status==='rejected'?0:h.amount)}</b>${h.appeal?'<small class="case-label">'+caseLabels[h.appeal.stage]+'</small>':tag(h.status)}</span></button>`
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
  return header(page)+`<main class="${page==='missions'?'field-main':''}">${page==='missions'?missionsPage(state,ui):page==='historique'?historyPage(state,ui):earningsPage(state,ui)}</main><nav class="mobile-nav" aria-label="Navigation mobile">${nav(page)}</nav>`;
}

export {shell,tag};
