import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,advance,missions,tariff,deadline,available,totals,review,initialTime} from '../src/domain.js';
const first=missions[0];
function depositReady(code='clear',m=first) {
 const s=initialState();s.scenario=code;
 for(const e of ['take','scan','unlock','work'])assert.equal(advance(s,e,m.id),true);
 return s;
}
for(const [type,centre,outer,hours] of [['battery',250,200,4],['move',400,350,6],['charge',700,600,4],['shop',600,600,24]]){
 test('Tarifs et délai · '+type,()=>{
   for(const [zone,rate] of [['Centre-ville',centre],['Périphérie',outer]]){
     const m=missions.find(x=>x.type===type&&x.zone===zone);assert.equal(tariff(m),rate);assert.equal(deadline(m)-m.created,hours*3600000);
   }
 });
}
test('Les étapes obligatoires et la prise unique sont respectées',()=>{
 const s=initialState();assert.equal(advance(s,'scan'),false);assert.equal(advance(s,'take','inconnue'),false);
 advance(s,'take',first.id);assert.equal(advance(s,'take',missions[1].id),false);
 assert.equal(advance(s,'work'),false);assert.equal(advance(s,'unlock'),false);advance(s,'scan');advance(s,'unlock');advance(s,'work');
 assert.ok(s.active.gps);assert.equal(advance(s,'deposit'),false);
});
for(const [code,status] of [['clear','approved'],['edge','pending'],['outside','rejected'],['photo','rejected']]){
 test('Dépôt et revenu · '+code,()=>{
   const s=depositReady(code);const initial=totals(s.history);
   assert.equal(advance(s,'photo','sample'),true);assert.equal(advance(s,'deposit'),true);
   assert.equal(s.history[0].status,status);assert.ok(s.history[0].reason);assert.ok(s.history[0].gps);assert.equal(s.history[0].photo,'sample');
   assert.equal(totals(s.history).approved-initial.approved,status==='approved'?400:0);
   assert.equal(s.active,null);assert.equal(advance(s,'deposit'),false);assert.equal(advance(s,'take',first.id),false);
 });
}
test('Le dépôt reprend avec sa preuve et son scénario après sérialisation',()=>{
 const original=depositReady('edge');advance(original,'photo','sample');
 const s=JSON.parse(JSON.stringify(original));s.scenario='clear';assert.equal(s.active.case,'edge');assert.equal(s.active.gps.accuracy,42);
 advance(s,'deposit');assert.equal(s.history[0].status,'pending');
});
test('Relevé et reprise photo corrigent deux cas indépendants',()=>{
 for(const code of ['edge','outside','photo']){
   const s=depositReady(code);advance(s,'photo','sample');
   if(code==='photo'){advance(s,'retake');assert.equal(advance(s,'deposit'),false);advance(s,'photo','sample');}
   else{advance(s,'retry');assert.equal(s.active.gps.accuracy,8);}
   advance(s,'deposit');assert.equal(s.history[0].status,'approved');
 }
});
test('Supervision simulée · décision unique, conservation du motif initial',()=>{
 for(const decision of ['approved','rejected']){
   const s=depositReady('edge');advance(s,'photo','sample');advance(s,'deposit');const prev=totals(s.history);
   assert.equal(review(s,first.id,decision),true);assert.equal(review(s,first.id,'approved'),false);
   assert.equal(prev.pending-totals(s.history).pending,400);assert.equal(totals(s.history).approved-prev.approved,decision==='approved'?400:0);
   assert.ok(s.history[0].initialReason);assert.ok(s.history[0].reviewedAt);
 }
});
test('Les huit missions peuvent être réalisées et le reset restaure la tournée',()=>{
 const s=initialState();for(const m of missions){for(const e of ['take','scan','unlock','work','photo','deposit'])assert.equal(advance(s,e,e==='photo'?'sample':m.id),true);}
 assert.equal(available(s).length,0);const fresh=initialState();assert.equal(available(fresh).length,8);assert.equal(fresh.now,initialTime);assert.equal(fresh.history.length,6);assert.equal(fresh.active,null);
});

