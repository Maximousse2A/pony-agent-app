import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,available,advance,review,findMission,deadline} from '../src/domain.js';
import {propose,itinerary} from '../src/tours.js';
import {serviceRemaining,smartProgress,uncoveredNeeds} from '../src/smart.js';
import {fieldMissions} from '../src/navigation.js';

const ui={priority:'all',type:'all',sort:'smart'};
function complete(s,id){
 for(const event of ['take','arrive','scan','unlock','work','arrive-depot','photo','deposit'])
  assert.ok(advance(s,event,event==='photo'?'sample':id));
}
test('Smart choisit le dépôt ciblé avant une recharge plus rémunératrice',()=>{
 const s=initialState();
 // Compare only these two candidates, with time for one.
 s.history.push(...available(s).filter(m=>!['AG-2048','AG-2061'].includes(m.id)).map(m=>({id:m.id})));
 const plan=propose(s,45),trip=itinerary(s,plan);
 assert.deepEqual(plan.ids,['AG-2048']);assert.equal(trip.fee,400);assert.ok(trip.valid);
 assert.equal(fieldMissions(s,ui).nearest.id,'AG-2048');
});
test('Les interventions critiques restent prioritaires dans un budget contraint',()=>{
 const s=initialState(),plan=propose(s,55);
 assert.ok(plan.ids.some(id=>findMission(id).priority===3));
 assert.ok(itinerary(s,plan).valid);
});
test('Le pilote du soir respecte 20 h même si toutes les destinations ne sont pas couvertes et conserve le besoin gare non couvert',()=>{
 const s=initialState('evening'),plan=propose(s,60),trip=itinerary(s,plan);
 assert.equal(available(s).length,2);assert.equal(trip.targeted,1);assert.ok(trip.valid);
 assert.ok(trip.steps.every(step=>step.finishAt<=step.m.smart.deliverBy));
 assert.ok(uncoveredNeeds(s,trip.steps)[0].includes('couverture non assurée'));
 assert.equal(itinerary(s,propose(s,480)).steps.length,1);
 assert.ok(trip.minutes<=60);
});
test('Les horaires et le créneau de dépôt invalident aussi un ajout manuel',()=>{
 const s=initialState('evening');s.now=Date.parse('2026-11-16T19:50:00+01:00');
 assert.deepEqual(propose(s,480).ids,[]);
 const manual=itinerary(s,{budget:480,ids:['SMART-C']});
 assert.equal(manual.valid,false);assert.equal(manual.afterShift,true);assert.equal(manual.steps[0].targetLate,true);
 for(const at of ['2026-11-16T07:59:00+01:00','2026-11-16T20:00:00+01:00']){
  s.now=Date.parse(at);assert.equal(serviceRemaining(s.now),0);assert.deepEqual(propose(s,480).ids,[]);
 }
});
test('Le délai contractuel porte sur la prise en charge et non la fin de mission',()=>{
 const s=initialState();s.now=deadline(findMission('AG-2059'))-10*60000;
 const trip=itinerary(s,{budget:60,ids:['AG-2059']});
 assert.ok(trip.steps[0].finishAt>deadline(findMission('AG-2059')));
 assert.equal(trip.steps[0].late,false);assert.ok(trip.valid);
});
test('Retirer une étape fait apparaître le besoin omis, sans faux objectif atteint',()=>{
 const s=initialState('evening'),plan=propose(s,60);plan.ids.pop();
 const trip=itinerary(s,plan);
 assert.equal(trip.targeted,0);assert.equal(uncoveredNeeds(s,trip.steps).length,3);
 assert.equal(smartProgress(s).approved,0);
});
test('Les preuves, objectifs et états de revue survivent au rechargement sans double comptage',()=>{
 let s=initialState('evening');complete(s,'SMART-C');
 s=JSON.parse(JSON.stringify(s));
 assert.equal(s.mode,'evening');assert.equal(s.history[0].smart.quantity,1);
 assert.equal(smartProgress(s).pending,1);assert.equal(smartProgress(s).approved,0);
 assert.ok(review(s,'SMART-C','approved'));assert.equal(review(s,'SMART-C','approved'),false);
 assert.equal(smartProgress(s).approved,1);assert.equal(smartProgress(s).remaining,1);
 assert.deepEqual(propose(s,60).ids,['SMART-H']);
 assert.equal(advance(s,'take','SMART-C'),false);
 assert.equal(available(initialState()).length,8);
});
test('Une mission active est exclue de la tournée suivante avec son temps restant',()=>{
 const s=initialState('evening');advance(s,'take','SMART-C');
 const plan=propose(s,60),trip=itinerary(s,plan);
 assert.ok(!plan.ids.includes('SMART-C'));assert.ok(trip.departure>s.now);
 assert.ok(trip.minutes<=trip.capacity);
});


test('Une fin simulée planifiée consomme le temps du service après reprise',()=>{
 let s=initialState('evening');
 const trip=itinerary(s,{budget:60,ids:['SMART-H']});
 advance(s,'take','SMART-H');s.active.expectedFinishAt=trip.steps[0].finishAt;
 s=JSON.parse(JSON.stringify(s));
 for(const event of ['arrive','scan','unlock','work','arrive-depot','photo','deposit'])
  assert.ok(advance(s,event,event==='photo'?'sample':null));
 assert.equal(s.now,trip.steps[0].finishAt);
 assert.deepEqual(propose(s,60).ids,[]);
});
