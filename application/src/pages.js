import logo from './assets/pony-white.svg';
import {missionsPage} from './field.js';
import {caseLabels} from './appeals.js';
import { icon,typeMark } from './icons.js';
import {types,hour,day,statuses,totals,money} from './domain.js';

import {periodRange,periodRecords,periods,reportDate,shiftDay,validDay} from './reporting.js';

const navItems=[['missions','map','Missions'],['historique','history','Historique'],['revenus','wallet','Revenus']];

function nav(page){return navItems.map(([to,i,name])=>`<a href="#${to}" class="navitem ${page===to?'current':''}" ${page===to?'aria-current="page"':''}>${icon(i)}<span>${name}</span></a>`).join('')}
function header(page){return `<header class="top"><div class="topinner"><a class="brand" href="#missions" aria-label="PonyOps, missions"><img src="${logo}" alt="pony"><span>Ops</span></a><nav class="desk-nav" aria-label="Navigation principale">${nav(page)}</nav><button class="demo" data-act="demo">${icon('flask',16)} Démo</button></div></header>`}
function intro(title,sub){return `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div></div>`}
const longDate = new Intl.DateTimeFormat('fr-FR',{dateStyle:'full',timeZone:'UTC'});
const shortDate = new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeZone:'UTC'});
const asDate = key => new Date(key+'T12:00:00Z');
function calendar(selected,history){
  const start=periodRange(selected,'week').start;
  const activeDays=new Set(history.map(h=>reportDate(h.time)));
  const weekdays=['lun.','mar.','mer.','jeu.','ven.','sam.','dim.'];
  const days=weekdays.map((label,index)=>{
    const key=shiftDay(start,index);
    if(!validDay(key))return '<span></span>';
    const hasRecords=activeDays.has(key);
    return `<button data-act="report-day" data-id="${key}" aria-pressed="${selected===key}" aria-label="${longDate.format(asDate(key))}${hasRecords?', missions terminées':''}"><small>${label}</small><b>${Number(key.slice(-2))}</b><i class="${hasRecords?'has-records':''}"></i></button>`;
  }).join('');
  const arrow=(delta,label,i)=>`<button class="icon-button" data-act="report-week" data-id="${delta}" aria-label="${label}" ${validDay(shiftDay(selected,delta))?'':'disabled'}>${icon(i,17)}</button>`;
  return `<section class="report-calendar" aria-label="Calendrier des missions"><div class="calendar-head">
    ${arrow(-7,'Semaine précédente','back')}<input type="date" name="report-date" aria-label="Choisir une date" min="0001-01-01" max="9999-12-31" value="${selected}">${arrow(7,'Semaine suivante','arrow')}
    </div><div class="calendar-days">${days}</div></section>`;
}
function tag(s){return `<span class="status ${s}"><i></i>${statuses[s]}</span>`}
function historyRow(h){
  return `<button class="history-row" data-act="receipt" data-id="${h.id}">${typeMark(h.type)}<span class="row-main"><strong>${types[h.type].name}</strong><span>${h.place}</span><small>${day(h.time)} · ${hour(h.time)}</small></span><span class="row-end"><b>${money(h.status==='rejected'?0:h.amount)}</b>${h.appeal?'<small class="case-label">'+caseLabels[h.appeal.stage]+'</small>':tag(h.status)}</span></button>`
}
const statusFilters={all:'Toutes',approved:'Approuvées',pending:'En attente',rejected:'Rejetées'};
function filterButtons(options,selected,act){
  return Object.entries(options).map(([key,label])=>
    `<button data-act="${act}" data-id="${key}" aria-pressed="${key===selected}" class="${key===selected?'chosen':''}">${label}</button>`
  ).join('');
}
function historyPage(state,ui){
  const selected=ui.reportDay || reportDate(state.now);
  const records=periodRecords(state.history,periodRange(selected,'day'));
  const list=records.filter(h=>ui.status==='all'||h.status===ui.status);
  const empty=records.length?'Aucune mission avec ce statut ce jour-là.':'Aucune mission terminée ce jour-là.';
  return intro('Historique','Interventions terminées, décisions et preuves.')+calendar(selected,state.history)+
    `<section class="ledger"><div class="tabs" role="group" aria-label="Filtrer par statut">${filterButtons(statusFilters,ui.status,'status')}</div>
    ${list.map(historyRow).join('')||`<p class="empty">${empty}</p>`}</section>`;
}
function earningsPage(state,ui){
  const selected=ui.reportDay || reportDate(state.now);
  const range=periodRange(selected,ui.period);
  const records=periodRecords(state.history,range);
  const t=totals(records);
  const count=status=>records.filter(h=>h.status===status).length;
  const missionCount=n=>n+' mission'+(n>1?'s':'');
  const approved=count('approved');
  const formatted=key=>shortDate.format(asDate(key));
  const caption=range.start===range.end?formatted(range.start):`Du ${formatted(range.start)} au ${formatted(range.end)}`;
  return intro('Mes revenus','Rémunération à la mission · montants simulés')+calendar(selected,state.history)+
    `<div class="report-period"><div class="tabs period" role="group" aria-label="Période des revenus">${filterButtons(periods,ui.period,'period')}</div><span>${caption}</span></div>
    <div class="earn-grid"><section class="earn-hero">${icon('wallet',32)}<p>Revenus approuvés</p><strong>${money(t.approved)}</strong><span>${missionCount(approved)} approuvée${approved>1?'s':''}</span></section>
    <section class="balances"><div><span>${tag('pending')}<small>${missionCount(count('pending'))} · hors revenus approuvés</small></span><b>${money(t.pending)}</b></div>
    <div><span>${tag('rejected')}<small>${missionCount(count('rejected'))} · ${money(t.rejected)} de tarifs refusés</small></span><b>${money(0)}</b></div></section></div>
    <section class="ledger"><h2>Détail des missions <span class="count">${t.count}</span></h2>${records.map(historyRow).join('')||'<p class="empty">Aucune mission terminée sur cette période.</p>'}</section>`;
}
function shell(page,state,ui){
  return header(page)+`<main class="${page==='missions'?'field-main':''}">${page==='missions'?missionsPage(state,ui):page==='historique'?historyPage(state,ui):earningsPage(state,ui)}</main><nav class="mobile-nav" aria-label="Navigation mobile">${nav(page)}</nav>`;
}

export {shell,tag};
