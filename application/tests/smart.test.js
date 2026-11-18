import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,available,serviceMissions,advance,review,findMission,deadline} from '../src/domain.js';
import {propose,itinerary,uncoveredNeeds} from '../src/tours.js';
import {serviceRemaining,smartProgress} from '../src/smart.js';
import {fieldMissions} from '../src/navigation.js';

const ui={priority:'all',type:'all',sort:'smart'};
function complete(s,id){
 for(const event of ['take','arrive','scan','unlock','work','arrive-depot','photo','deposit'])
  assert.ok(advance(s,event,event==='photo'?'sample':id));
}
test('Smart choisit le dépôt ciblé avant une recharge plus rémunératrice',()=>{
 const s=initialState();
 // Seules ces deux missions restent à traiter sur le service.
 s.history.push(...serviceMissions(s).filter(m=>!['AG-2048','AG-2061'].includes(m.id)).map(m=>({id:m.id})));
 const plan=propose(s),trip=itinerary(s,plan);
 assert.equal(plan.ids[0],'AG-2048');assert.ok(trip.valid);
 assert.equal(fieldMissions(s,ui).nearest.id,'AG-2048');
});
test('Sans dépôt ciblé, Smart privilégie une intervention critique',()=>{
 const s=initialState();
 s.history.push(...serviceMissions(s).filter(m=>m.smart).map(m=>({id:m.id})));
 const plan=propose(s);
 assert.ok(plan.ids.some(id=>findMission(id).priority===3));
 assert.ok(itinerary(s,plan).valid);
});
test('Le pilote du soir respecte 20 h même si toutes les destinations ne sont pas couvertes et conserve le besoin gare non couvert',()=>{
 const s=initialState('evening'),plan=propose(s),trip=itinerary(s,plan);
 assert.equal(available(s).length,2);assert.equal(trip.targeted,1);assert.ok(trip.valid);
 assert.ok(trip.steps.every(step=>step.finishAt<=step.m.smart.deliverBy));
 assert.equal(uncoveredNeeds(s,plan).length,1);
 assert.match(uncoveredNeeds(s,plan)[0],/Campus/);

 assert.ok(trip.minutes<=60);
});
test('Les horaires et le créneau de dépôt invalident aussi un ajout manuel',()=>{
 const s=initialState('evening');s.now=Date.parse('2026-11-16T19:50:00+01:00');
 assert.deepEqual(propose(s).ids,[]);
 const manual=itinerary(s,{ids:['SMART-C']});
 assert.equal(manual.valid,false);assert.equal(manual.afterShift,true);assert.equal(manual.steps[0].targetLate,true);
 for(const at of ['2026-11-16T07:59:00+01:00','2026-11-16T20:00:00+01:00']){
  s.now=Date.parse(at);assert.equal(serviceRemaining(s.now),0);assert.deepEqual(propose(s).ids,[]);
 }
});
test('Le délai contractuel porte sur la prise en charge et non la fin de mission',()=>{
 const s=initialState();s.now=deadline(findMission('AG-2059'))-10*60000;
 const trip=itinerary(s,{ids:['AG-2059']});
 assert.ok(trip.steps[0].finishAt>deadline(findMission('AG-2059')));
 assert.equal(trip.steps[0].late,false);assert.ok(trip.valid);
});
test('Retirer une étape fait apparaître le besoin omis, sans faux objectif atteint',()=>{
 const s=initialState('evening'),plan=propose(s);plan.ids.pop();
 const trip=itinerary(s,plan);
 assert.equal(trip.targeted,0);assert.equal(uncoveredNeeds(s,{...plan,manual:true}).length,2);
 assert.equal(smartProgress(s).approved,0);
});
test('Les preuves, objectifs et états de revue survivent au rechargement sans double comptage',()=>{
 let s=initialState('evening');complete(s,'SMART-C');
 s=JSON.parse(JSON.stringify(s));
 assert.equal(s.mode,'evening');assert.equal(s.history[0].smart.quantity,1);
 assert.equal(smartProgress(s).pending,1);assert.equal(smartProgress(s).approved,0);
 assert.ok(review(s,'SMART-C','approved'));assert.equal(review(s,'SMART-C','approved'),false);
 assert.equal(smartProgress(s).approved,1);assert.equal(smartProgress(s).remaining,1);
 assert.deepEqual(propose(s).ids,['SMART-H']);
 assert.equal(advance(s,'take','SMART-C'),false);
 assert.equal(available(initialState()).length,8);
});
test('Une mission active est exclue de la tournée suivante avec son temps restant',()=>{
 const s=initialState('evening');advance(s,'take','SMART-C');
 const plan=propose(s),trip=itinerary(s,plan);
 assert.ok(!plan.ids.includes('SMART-C'));assert.ok(trip.departure>s.now);
 assert.ok(trip.minutes<=trip.capacity);
});


test('Une fin simulée planifiée consomme le temps du service après reprise',()=>{
 let s=initialState('evening');
 const trip=itinerary(s,{ids:['SMART-H']});
 advance(s,'take','SMART-H');s.active.expectedFinishAt=trip.steps[0].finishAt;
 s=JSON.parse(JSON.stringify(s));
 for(const event of ['arrive','scan','unlock','work','arrive-depot','photo','deposit'])
  assert.ok(advance(s,event,event==='photo'?'sample':null));
 assert.equal(s.now,trip.steps[0].finishAt);
 assert.deepEqual(propose(s).ids,[]);
});
test('Les échéances terrain respectent les horaires de Paris',()=>{
 const at = text => Date.parse(text);
 assert.equal(deadline(findMission('AG-2032')),at('2026-11-16T20:00:00+01:00'));
 assert.equal(deadline(findMission('SMART-C')),at('2026-11-16T20:00:00+01:00'));
 assert.equal(deadline(findMission('AG-2078')),at('2026-11-17T08:58:00+01:00'));
 for(const [created,expected] of [
  ['2026-07-10T16:01:00+02:00','2026-07-10T20:00:00+02:00'],
  ['2026-10-24T19:00:00+02:00','2026-10-24T20:00:00+02:00'],
  ['2026-03-29T00:00:00+01:00','2026-03-29T08:00:00+02:00'],
  ['2026-11-16T20:30:00+01:00','2026-11-17T08:00:00+01:00'],
 ]){
  assert.equal(deadline({type:'move',created:at(created)}),at(expected));
 }
 const s=initialState();
 for(const time of ['07:59','20:00']){
  s.now=at('2026-11-16T'+time+':00+01:00');
  assert.equal(advance(s,'take','AG-2032'),false);
 }
});

test('Le premier calcul planifie la journée et les dépôts du soir, avec une raison pour chaque mission écartée',()=>{
 const s=initialState();
 const plan=propose(s),trip=itinerary(s,plan);
 assert.equal(plan.ids[0],'AG-2048');
 assert.ok(trip.valid && trip.minutes>480);
 assert.equal(trip.targeted,3);
 assert.equal(new Set(plan.ids).size,serviceMissions(s).length);
 assert.ok(trip.steps.filter(step=>step.m.scope==='evening').every(step=>step.pickupAt>=step.m.created));
 assert.ok(trip.waiting>0);
 assert.ok(itinerary(s,{...plan,budget:60}).valid);
 assert.deepEqual(uncoveredNeeds(s,plan),[]);
 s.now=Date.parse('2026-11-16T10:30:00+01:00');
 const later=propose(s);
 assert.ok(itinerary(s,later).valid);
 assert.ok(!later.ids.includes('AG-2048'));
 assert.ok(uncoveredNeeds(s,later).some(text=>/Gare Saint-Laud.*11:01.*11:00/.test(text)));
 assert.equal(later.ids.length+uncoveredNeeds(s,later).length,serviceMissions(s).length);
});
