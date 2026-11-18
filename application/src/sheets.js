import {objectiveLabel,missionPurpose} from './smart.js';
import {directions,priorities} from './navigation.js';
import {coordinates,requiresDeposit,depositPoint} from './domain.js';
import bike from './assets/bike.jpg';
import scooter from './assets/scooter.jpg';
import {icon,typeMark} from './icons.js';
import {types,scenarios,money,distance,tariff,day,hour,deadline} from './domain.js';
import {durationText,receiptDurations} from './reporting.js';
import {tag} from './pages.js';
import {evidence,caseLabels} from './appeals.js';

const btn=(act,label,i,klass='primary',id='',disabled=false)=>`<button type="button" class="btn ${klass}" data-act="${act}" data-id="${id}" ${disabled?'disabled':''}>${i?icon(i,18):''}${label}</button>`;
const line=(name,value)=>`<div class="fact"><dt>${name}</dt><dd>${value}</dd></div>`;
const closeButton='<button class="close" data-act="close" aria-label="Fermer">'+icon('cross')+'</button>';
function wrap(kicker,title,content,foot=''){
 return `<div class="sheet-top"><span>${kicker}</span>${closeButton}</div><div class="sheet-content"><h2 id="sheetTitle" tabindex="-1">${title}</h2>${content}</div>${foot?`<div class="sheet-foot">${foot}</div>`:''}`;
}
const notice=(i,title,body,tone='')=>`<div class="notice ${tone}">${icon(i,20)}<div><strong>${title}</strong>${body?`<p>${body}</p>`:''}</div></div>`;
function missionSheet(m,state){
 const a=state.active?.id===m.id?state.active:null,t=types[m.type];
 if(!a)return '';
 const transfer=requiresDeposit(m);
 const steps=['Trajet','Identifier','Intervenir',...(transfer?['Déposer']:[])];
 const level=a.step==='travel'?0:['scan','unlock'].includes(a.step)?1:a.step==='work'||!transfer?2:3;
 const stepper=`<ol class="steps">${steps.map((s,n)=>`<li class="${n<level?'done':n===level?'active':''}" ${n===level?'aria-current="step"':''}><b>${n<level?icon('check',12):n+1}</b>${s}</li>`).join('')}</ol>`;
 const context=`<p class="sub">${m.vehicle} ${m.number} · <span class="dispatch-priority priority-${m.priority}">${priorities[m.priority]}</span></p>${stepper}`;
 const target=m.smart?`<p class="smart-note"><strong>${missionPurpose(m)}</strong><br><small>${objectiveLabel(m.smart)}</small></p>`:'';
 const gpsLink=(point,label)=>`<a class="btn secondary" href="${directions(coordinates(point))}" target="_blank" rel="noopener noreferrer">${icon('route',18)} ${label}</a>`;
 if(a.step==='travel')return wrap(t.name,'Se rendre au véhicule',context+`<div class="work-block">${typeMark(m.type,true)}<div><strong>${m.place}</strong><p>${m.reason}</p></div></div>`+target,
   gpsLink(m.point,"S’y rendre")+btn('arrive','Je suis arrivé','check'));
 if(a.step==='handoff')return wrap(t.name,'Se rendre au dépôt',context+(target||`<p class="dest">${icon('pin',17)} ${m.destination}</p>`),
   gpsLink(depositPoint(m),'Itinéraire vers le dépôt')+btn('arrive-depot','Je suis arrivé au dépôt','check'));
 if(level===1){
   const scanned=a.step==='unlock';
   return wrap(t.name,scanned?'Véhicule identifié':'Identifier le véhicule',context+`<div class="scan-target"><div class="scan-frame">${icon(scanned?'check':'scan',54)}</div><b>${m.number}</b></div>`,
     scanned?btn('unlock','Simuler le déverrouillage','lock'):btn('scan','Simuler le scan','scan'));
 }
 if(a.step==='work'){
   const task={move:'Préparer le déplacement',charge:'Préparer le retour en recharge',shop:'Préparer le retour à l’atelier'};
   const instruction={move:'Récupérez le véhicule pour le déplacer.',charge:'Récupérez le véhicule pour le ramener en recharge.',shop:'Chargez le véhicule pour le retour à l’atelier.'};
   return wrap(t.name,transfer?task[m.type]:t.action,context+`<div class="work-block">${typeMark(m.type,true)}<div><strong>${m.place}</strong><p>${transfer?instruction[m.type]:t.instruction}</p></div></div>`,
    btn('work',transfer?'Véhicule pris en charge':t.done,'check'));
 }
 const edge=a.case==='edge',outside=['outside','border'].includes(a.case),photoBad=a.case==='photo';
 const reading=edge?'Position incertaine':outside?'Point hors zone':'Position dans la zone';
 const guide=edge?'La supervision vérifiera le repère visible sur la photo.':outside?'Rejoignez la zone de dépôt et actualisez la position.':'';
 let gps=`<section class="proof-block"><div class="proof-head">${icon('locate')}<h3>${transfer?'Position au dépôt':'Position de l’intervention'}</h3><small>GPS simulé</small></div>${notice(edge||outside?'alert':'check',reading,guide,edge||outside?'warn':'good')}<div class="gps-meta"><span>Précision ± ${a.gps.accuracy} m</span><details><summary>Coordonnées</summary>${a.gps.lat}, ${a.gps.lng}</details></div>${edge||outside?btn('retry','Simuler un nouveau relevé','locate','secondary'):''}</section>`;
 const photoSrc=a.photo==='sample'?sample(m.vehicle):a.photo;
 let proof=`<section class="proof-block"><div class="proof-head">${icon('camera')}<h3>${transfer?'Photo du dépôt':'Photo de l’intervention'}</h3><small>Obligatoire</small></div><p class="hint">${edge?'Incluez un panneau ou la façade voisine dans le cadre.':'Gardez les deux roues et l’emplacement visibles.'}</p>
 ${photoSrc?`<figure class="proof-image"><img src="${photoSrc}" alt="Preuve de dépôt du véhicule"><figcaption>${a.photo==='sample'?'Photo de démonstration':'Photo ajoutée sur cet appareil'}</figcaption></figure>`:''}
 ${photoBad&&a.photo?notice('alert','Photo inexploitable','Reprenez la photo pour éviter un refus.','warn'):''}
 <div class="photo-actions">${photoBad&&a.photo?btn('retake','Reprendre la photo','camera','secondary'):''}
 <label class="btn secondary file-button">${icon('camera',17)}${photoSrc?'Changer la photo':'Prendre une photo'}<input id="photoInput" type="file" accept="image/*" capture="environment"></label>
 ${a.photo==='sample'?'':btn('sample','Utiliser la photo démo',null,'text-btn')}</div></section>`;
 return wrap(t.name,transfer?'Vérifier la dépose':'Confirmer l’intervention sur place',context+`<p class="dest">${icon('pin',17)} ${m.destination}</p>`+(transfer?`<p>${t.instruction}</p>`+gpsLink(depositPoint(m),'Itinéraire vers le dépôt'):'')+gps+proof,
 btn('deposit',edge?'Envoyer en vérification':transfer?'Valider le dépôt':'Valider l’intervention',edge?'receipt':'check','primary','',!a.photo));
}
function sample(vehicle){return vehicle==='Trottinette'?scooter:bike;}

function casePanel(h){
 const a=h.appeal;
 if(!a&&h.status!=='rejected')return '';
 const ev=evidence(h);
 const facts=`<details><summary>Éléments du dépôt</summary><dl>${line('Photo',h.photo?'Photo du dépôt conservée':'Indisponible dans ce dossier')}${line('Position GPS',ev.gps?ev.gps.lat+', '+ev.gps.lng:'Indisponible')}${line('Précision',ev.gps?'± '+ev.gps.accuracy+' m':'Inconnue')}${line('Zone autorisée',ev.zone?ev.zone.name+' · rayon '+ev.zone.radius+' m':'Non documentée')}${ev.offset!==null?line('Distance au centre',ev.offset+' m'):''}</dl></details>`;
 if(!a)return `<section class="appeal-box"><p>La photo et le GPS sont joints automatiquement au réexamen.</p>${btn('appeal','Contester le refus','receipt','secondary',h.id)}${facts}</section>`;
 return `<section class="appeal-box"><span class="sim">Traitement simulé</span><h3>${caseLabels[a.stage]}</h3><details><summary>Suivi de la contestation</summary><ol class="case-timeline"><li><b>Refus initial</b><p>${a.original}</p></li><li><b>Réexamen par IA</b><p>${a.aiReason||'Comparaison de la photo, du point GPS et de sa précision avec la zone autorisée…'}</p></li>${a.stage==='support'||a.supportReason?`<li><b>Vérification manuelle</b><p>${a.supportReason||'Les pièces ont été transmises au support. Une décision est attendue.'}</p></li>`:''}</ol></details>${facts}${a.stage==='support'?btn('support','Simuler la réponse du support','receipt','secondary',h.id):''}</section>`;
}


function receipt(h){
 const onSite=!requiresDeposit(h);
 const impact={approved:'Revenu approuvé',pending:'Montant en attente',rejected:'Montant rémunéré'};
 const photo=h.photo==='sample'?sample(h.vehicle):h.photo;
 const duration=receiptDurations(h);
 const hasMeasures=[duration.work,duration.travel,duration.total].some(value=>value!==null);
 const timingLabel=duration.source==='simulated'?'Durées simulées':hasMeasures?'Durées mesurées':'Durées non enregistrées';
 const reasonTitle={approved:'Validation',pending:'Motif de l’attente',rejected:'Motif du refus'};
 const resultIcon={approved:'check',pending:'clock',rejected:'alert'};
 const decision=notice(resultIcon[h.status],reasonTitle[h.status],h.reason,h.status==='approved'?'good':h.status==='rejected'?'refused':'warn');
 const measurements=`<section class="timing"><h3>${timingLabel}</h3><dl class="receipt-times">${line('Intervention',durationText(duration.work))}${line('Trajet',durationText(duration.travel))}${line('Total',durationText(duration.total))}</dl></section>`;
 return wrap('Reçu · '+h.id,types[h.type].name,`
   <p class="sub">${h.place} · ${day(h.time)} à ${hour(h.time)}</p>
   <div class="receipt-result"><div><small>${impact[h.status]}</small><strong>${money(h.status==='rejected'?0:h.amount)}</strong></div>${tag(h.status)}</div>
   ${decision}${casePanel(h)}
   ${h.status==='pending'?`<details><summary>Simuler la décision de supervision</summary><div class="photo-actions">${btn('review-ok','Approuver','check','secondary',h.id)}${btn('review-no','Rejeter','cross','secondary',h.id)}</div></details>`:''}
   ${h.smart?`<section class="smart-note"><strong>${objectiveLabel(h.smart)}</strong><p>Dépôt soumis ${h.time<=h.smart.deliverBy?'dans le créneau':'hors créneau'}. ${h.status==='approved'?'Présence à l’heure cible non mesurée.':h.status==='rejected'?'Dépôt refusé, objectif non confirmé.':'Contribution en attente de validation.'}</p></section>`:''}
   ${measurements}
   <details><summary>Détails de la mission</summary><dl>${line(onSite?'Intervention sur place':'Dépôt',h.place)}${line('Tarif prévu',money(h.amount))}${h.gps?line('GPS simulé',h.gps.lat+', '+h.gps.lng+' · ± '+h.gps.accuracy+' m'):''}</dl><p class="hint">Décision et rémunération simulées.</p></details>
   ${photo?`<details><summary>${onSite?'Photo de l’intervention':'Photo du dépôt'}</summary><img class="receipt-photo" src="${photo}" alt="Photo de l’intervention"></details>`:''}
   ${h.initialReason?`<details><summary>Décision de supervision · ${hour(h.reviewedAt)}</summary><p>${h.initialReason}</p></details>`:''}`,

 btn('to-history','Voir l’historique','history','primary'));
}
function demoPanel(state,reset){
 if(reset==='evening')return wrap('Démo du soir','Préparer demain matin ?',`<p>Charger ce scénario réinitialise les missions, les photos et les revenus de cette démo sur cet appareil.</p><p>Il est 19 h. Deux consignes pilotes fictives ciblent un campus et l’hôpital avant 20 h. Le besoin de la gare à 7 h 30 reste non couvert.</p>`,btn('reset-evening','Réinitialiser et charger le soir','route')+btn('close','Annuler',null,'secondary'));
 if(reset) return wrap('Démo','Recommencer la tournée ?',`<p>Les missions, photos, revenus et réglages de cette démo retrouveront leur état initial sur cet appareil.</p>`,btn('reset','Réinitialiser la démo','reset')+btn('demo','Annuler',null,'secondary'));
 return wrap('Réglages','Mode démo',`<p>16 novembre · ${state.mode==='evening'?'service du soir':'service de journée'} · ${hour(state.now)}</p><h3>Prochain dépôt</h3><p class="hint">Choisissez le scénario avant d’ouvrir le dépôt.</p><fieldset class="choices"><legend class="sr">Scénario du dépôt</legend>${Object.entries(scenarios).map(([key,s])=>`<label><input type="radio" name="scenario" value="${key}" ${state.scenario===key?'checked':''}>${s.label}</label>`).join('')}</fieldset><p class="hint">Scan, GPS, décisions et revenus simulés. Photos et progression conservées sur cet appareil.</p>`,btn('close','Revenir à la tournée','arrow')+btn('confirm-evening','Charger la préparation du soir','route','secondary')+btn('confirm-reset','Réinitialiser la journée','reset','text-btn'));
}
function filterPanel(ui){
 const group=(key,opts)=>`<fieldset class="choices"><legend>${key==='type'?'Type de mission':key==='priority'?'Priorité':'Ordre des missions'}</legend>${opts.map(([k,v])=>`<label><input type="radio" name="${key}" value="${k}" ${ui[key]===k?'checked':''}>${v}</label>`).join('')}</fieldset>`;
 return wrap('Carte et liste','Filtrer et trier',group('type',[['all','Tous les types'],...Object.entries(types).map(([k,v])=>[k,v.name])])+group('priority',[['all','Toutes les priorités'],...priorities.map((p,i)=>[String(i),p])])+group('sort',[['smart','Priorités Pony Smart'],['distance','Plus proches d’abord'],['time','Échéance la plus proche'],['priority','Priorité puis proximité']]),btn('close','Afficher les missions','map'));
}

export {missionSheet,receipt,demoPanel,filterPanel};
