import bike from './assets/bike.jpg';
import scooter from './assets/scooter.jpg';
import {icon} from './icons.js';
import {types,scenarios,money,distance,tariff,day,hour,deadline} from './domain.js';
import {typeMark,tag} from './pages.js';

const btn=(act,label,i,klass='primary',id='',disabled=false)=>`<button type="button" class="btn ${klass}" data-act="${act}" data-id="${id}" ${disabled?'disabled':''}>${i?icon(i,18):''}${label}</button>`;
const line=(name,value)=>`<div class="fact"><dt>${name}</dt><dd>${value}</dd></div>`;
const closeButton='<button class="close" data-act="close" aria-label="Fermer">'+icon('cross')+'</button>';
function wrap(kicker,title,content,foot=''){
 return `<div class="sheet-top"><span>${kicker}</span>${closeButton}</div><div class="sheet-content"><h2 id="sheetTitle" tabindex="-1">${title}</h2>${content}</div>${foot?`<div class="sheet-foot">${foot}</div>`:''}`;
}
const notice=(i,title,body,tone='')=>`<div class="notice ${tone}">${icon(i,20)}<div><strong>${title}</strong><p>${body}</p></div></div>`;
function missionSheet(m,state){
 const a=state.active?.id===m.id?state.active:null,t=types[m.type],meta=`${m.vehicle} ${m.number} · ${m.id}`;
 if(!a){
   const conflict=Boolean(state.active);
   return wrap('Fiche mission',t.name,`<div class="mission-key">${typeMark(m.type,true)}<div><strong>${m.place}</strong><p>${m.zone} · ${distance(m.metres)}</p></div><b>${money(tariff(m))}</b></div>
    <h3>Motif de création</h3><p>${m.reason}</p>
    <dl>${line('Créée le',day(m.created)+' à '+hour(m.created))}${line('Prise en charge avant',hour(deadline(m))+' · délai '+t.hours+' h')}${line('Véhicule',m.vehicle+' '+m.number)}${line('Dépôt prévu',m.destination)}</dl>
    ${conflict?notice('flag','Une mission est en cours','Terminez-la pour pouvoir en prendre une autre.'):''}`,conflict?btn('mission','Reprendre ma mission','arrow','primary',state.active.id):btn('take','Prendre cette mission','arrow','primary',m.id));
 }
 const steps=['Identifier','Intervenir','Déposer'],level=['scan','unlock'].includes(a.step)?0:a.step==='work'?1:2;
 const stepper=`<ol class="steps">${steps.map((s,n)=>`<li class="${n<level?'done':n===level?'active':''}"><b>${n<level?icon('check',12):n+1}</b>${s}</li>`).join('')}</ol>`;
 const context=`<p class="sub">${meta}</p>${stepper}`;
 if(level===0){
   const scanned=a.step==='unlock';
   return wrap(t.name,scanned?'Véhicule identifié':'Identifier le véhicule',context+`<div class="scan-target"><div class="scan-frame">${icon(scanned?'check':'scan',54)}</div><b>${m.number}</b><span>${scanned?'Identifiant reconnu':'Identifiant à scanner'}</span></div><p class="hint">Le scan et la serrure sont simulés pour cette démo.</p>`,
     scanned?btn('unlock','Simuler le déverrouillage','lock'):btn('scan','Simuler le scan','scan'));
 }
 if(level===1) return wrap(t.name,t.action,context+`<div class="work-block">${typeMark(m.type,true)}<div><strong>${m.destination}</strong><p>${t.instruction}</p></div></div>${notice('lock','Véhicule déverrouillé','Déverrouillage simulé. Confirmez l’intervention une fois le travail terminé.')}`,btn('work',t.done,'check'));
 const edge=a.case==='edge',outside=a.case==='outside',photoBad=a.case==='photo';
 const reading=edge?'Position incertaine':outside?'Point hors zone':'Position dans la zone';
 const guide=edge?'Cadrez le véhicule entier avec un repère de rue identifiable. La supervision pourra vérifier ce dépôt.':outside?'Rejoignez l’emplacement autorisé et relevez la position à nouveau.':'Le point relevé correspond à l’emplacement prévu.';
 let gps=`<section class="proof-block"><div class="proof-head">${icon('locate')}<h3>Position au dépôt</h3><small>GPS simulé</small></div>${notice(edge||outside?'alert':'check',reading,guide,edge||outside?'warn':'good')}<div class="gps-meta"><span>Précision ± ${a.gps.accuracy} m</span><span>${a.gps.lat}, ${a.gps.lng}</span></div>${edge||outside?btn('retry','Simuler un nouveau relevé','locate','secondary'):''}</section>`;
 const photoSrc=a.photo==='sample'?sample(m.vehicle):a.photo;
 let proof=`<section class="proof-block"><div class="proof-head">${icon('camera')}<h3>Photo du dépôt</h3></div><p class="hint">${edge?'Incluez un panneau ou la façade voisine dans le cadre.':'Gardez les deux roues et l’emplacement visibles.'}</p>
 ${photoSrc?`<figure class="proof-image"><img src="${photoSrc}" alt="Preuve de dépôt du véhicule"><figcaption>${a.photo==='sample'?'Photo de démonstration':'Photo ajoutée sur cet appareil'}</figcaption></figure>`:''}
 ${photoBad&&a.photo?notice('alert','Photo inexploitable dans ce scénario','Reprenez la preuve ou soumettez-la pour jouer le rejet.','warn'):''}
 <div class="photo-actions">${photoBad&&a.photo?btn('retake','Reprendre la photo','camera','secondary'):''}
 <label class="btn secondary file-button">${icon('camera',17)}${photoSrc?'Changer la photo':'Prendre une photo'}<input id="photoInput" type="file" accept="image/*" capture="environment"></label>
 ${a.photo==='sample'?'':btn('sample','Utiliser la photo démo',null,'text-btn')}</div></section>`;
 return wrap(t.name,'Vérifier la dépose',context+`<p class="dest">${icon('pin',17)} ${m.destination}</p>`+gps+proof,
 btn('deposit',edge?'Envoyer en vérification':'Valider le dépôt',edge?'receipt':'check','primary','',!a.photo)+(!a.photo?'<small>Une photo est nécessaire pour valider.</small>':''));
}
function sample(vehicle){return vehicle==='Trottinette'?scooter:bike;}
function receipt(h){
 let impact=h.status==='approved'?'Inclus dans vos revenus approuvés':h.status==='pending'?'En attente de décision · hors revenus approuvés':'Mission non rémunérée';
 const photo=h.photo==='sample'?sample(h.vehicle):h.photo;
 return wrap('Reçu de mission · '+h.id,'Résultat du dépôt',`<div class="receipt-result ${h.status}">${tag(h.status)}<strong>${money(h.status==='rejected'?0:h.amount)}</strong><span>${impact}</span></div><h3>${h.status==='rejected'?'Motif du rejet':h.status==='pending'?'Pourquoi cette attente ?':'Motif de validation'}</h3><p>${h.reason}</p><dl>${line('Mission',types[h.type].name)}${line('Lieu de dépôt',h.place)}${line('Déposée le',day(h.time)+' à '+hour(h.time))}${line('Tarif prévu',money(h.amount))}${h.gps?line('Position simulée',h.gps.lat+', '+h.gps.lng+' · ± '+h.gps.accuracy+' m'):''}</dl>
 ${photo?`<details><summary>Afficher la photo du dépôt</summary><img class="receipt-photo" src="${photo}" alt="Photo jointe au dépôt"></details>`:''}${h.initialReason?notice('history','Décision de supervision · '+hour(h.reviewedAt),'Dépôt initialement en attente. '+h.initialReason):''}
 ${h.status==='pending'?`<details><summary>Simuler la décision de supervision</summary><p class="hint">Choisissez le résultat à jouer pour ce dossier.</p><div class="photo-actions">${btn('review-ok','Approuver le dépôt','check','secondary',h.id)}${btn('review-no','Rejeter le dépôt','cross','secondary',h.id)}</div></details>`:''}<p class="hint">Décision et rémunération simulées.</p>`,
 btn('to-history','Voir l’historique','history','primary'));
}
function demoPanel(state,reset){
 if(reset) return wrap('Démo','Recommencer la tournée ?',`<p>Les missions, photos, revenus et réglages de cette démo retrouveront leur état initial sur cet appareil.</p>`,btn('reset','Réinitialiser la démo','reset')+btn('demo','Annuler',null,'secondary'));
 return wrap('Réglages','Mode démo',`<p>La tournée démarre le 16 novembre à 09:40. L’horloge avance avec les actions. Scan, serrure, GPS, supervision et revenus sont simulés.</p><h3>Scénario du prochain dépôt</h3><p class="hint">Choisissez avant de confirmer l’intervention. Le scénario reste fixe une fois le dépôt ouvert.</p><fieldset class="choices"><legend class="sr">Scénario du dépôt</legend>${Object.entries(scenarios).map(([key,s])=>`<label><input type="radio" name="scenario" value="${key}" ${state.scenario===key?'checked':''}>${s.label}</label>`).join('')}</fieldset><p class="hint">Vos photos et votre progression restent dans ce navigateur.</p>`,btn('close','Revenir à la tournée','arrow')+btn('confirm-reset','Réinitialiser la démo','reset','text-btn'));
}
function filterPanel(ui){
 const group=(key,opts)=>`<fieldset class="choices"><legend>${key==='type'?'Type de mission':'Ordre des missions'}</legend>${opts.map(([k,v])=>`<label><input type="radio" name="${key}" value="${k}" ${ui[key]===k?'checked':''}>${v}</label>`).join('')}</fieldset>`;
 return wrap('Carte et liste','Filtrer et trier',group('type',[['all','Tous les types'],...Object.entries(types).map(([k,v])=>[k,v.name])])+group('sort',[['distance','Plus proches d’abord'],['time','Échéance la plus proche']]),btn('close','Afficher les missions','map'));
}

export {missionSheet,receipt,demoPanel,filterPanel};
