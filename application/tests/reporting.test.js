import test from 'node:test';
import assert from 'node:assert/strict';
import {advance,initialState,missions,review,totals} from '../src/domain.js';
import {durationText,periodRange,periodRecords,receiptDurations,reportDate,shiftDay,validDay} from '../src/reporting.js';

const timestamp = Date.parse;
const select = (history,date,period) => periodRecords(history,periodRange(date,period));

test('Historique et revenus utilisent le jour de fin à Paris, même après révision',()=>{
  const s=initialState();
  const today=reportDate(s.now);
  const daily=()=>select(s.history,today,'day');
  assert.deepEqual(daily().map(h=>h.id),['R-107','R-106','R-105','R-104']);
  assert.deepEqual(totals(daily()),{approved:950,pending:400,rejected:400,count:4});
  s.now+=86400000;
  assert.ok(review(s,'R-106','approved'));
  assert.deepEqual(totals(daily()),{approved:1350,pending:0,rejected:400,count:4});
  assert.deepEqual(totals(select(s.history,'2026-11-16','month')),{approved:2200,pending:0,rejected:400,count:6});
  assert.deepEqual(select(s.history,'2026-11-17','day'),[]);
});

test('Jour, semaine, mois et YTD sélectionnent chacun les reçus attendus',()=>{
  const dates=['2025-12-31','2026-01-01','2026-10-31','2026-11-01','2026-11-08','2026-11-09','2026-11-11','2026-11-15','2026-11-16','2026-12-01'];
  const records=dates.map((key,i)=>({time:timestamp(key+'T12:00:00Z'),status:'approved',amount:100*(i+1)}));
  const expected={day:[6],week:[7,6,5],month:[8,7,6,5,4,3],ytd:[6,5,4,3,2,1]};
  for(const [period,indices] of Object.entries(expected)){
    const list=select(records,'2026-11-11',period);
    assert.deepEqual(list,indices.map(i=>records[i]));
    assert.equal(totals(list).approved,indices.reduce((sum,i)=>sum+100*(i+1),0));
  }
  assert.deepEqual(periodRange('2027-01-01','week'),{start:'2026-12-28',end:'2027-01-03'});
  assert.equal(periodRange('2024-02-03','month').end,'2024-02-29');
  assert.equal(periodRange('2026-12-08','month').end,'2026-12-31');
  assert.ok(!validDay('2026-02-29'));
  assert.ok(validDay('2024-02-29'));
});

test('Minuit parisien et changements d’heure',()=>{
  for(const [date,before,end] of [
    ['2026-03-29','2026-03-28T22:59:59Z','2026-03-29T22:00:00Z'],
    ['2026-10-25','2026-10-24T21:59:59Z','2026-10-25T23:00:00Z'],
  ]){
    assert.equal(reportDate(timestamp(before)),shiftDay(date,-1));
    assert.equal(reportDate(timestamp(before)+1000),date);
    assert.equal(reportDate(timestamp(end)-1),date);
    assert.equal(reportDate(timestamp(end)),shiftDay(date,1));
  }
});

for(const type of ['battery','move','charge','shop']){
  test('Reçu et rattachement à la date de démonstration · '+type,()=>{
    const state=initialState();
    const id=missions.find(m=>m.type===type).id;
    for(const [event,payload,at] of [
      ['take',id,1000],['arrive',null,3000],['scan',null,4000],['unlock',null,5000],['work',null,11000],
      ...(type==='battery'?[]:[['arrive-depot',null,14000]]),['photo','sample',15000],['deposit',null,16000],
    ]) assert.ok(advance(state,event,payload,at));
    const record=state.history[0];
    assert.deepEqual(receiptDurations(record),{source:'measured',work:6000,travel:type==='battery'?2000:5000,total:15000});
    assert.equal(select(state.history,'2026-11-16','day')[0].id,id);
    const fixture=receiptDurations(state.history.find(h=>h.type===type&&h.source==='seed'));
    assert.equal(fixture.source,'simulated');
    assert.ok(fixture.total>=fixture.travel+fixture.work&&fixture.work>0&&fixture.travel>0);
  });
}

test('Les bornes absentes ou inversées restent inconnues et un trajet nul reste mesurable',()=>{
  const h={source:'run',type:'move',timing:{acceptedAt:2000,arrivedAtVehicle:2000,interventionStartedAt:3500,interventionEndedAt:3400,completedAt:4000}};
  assert.deepEqual(receiptDurations(h),{source:'measured',work:null,travel:null,total:2000});
  assert.equal(receiptDurations({...h,type:'battery'}).travel,0);
  assert.deepEqual(receiptDurations({type:'battery',source:'run',started:5,time:10}),{source:'measured',work:null,travel:null,total:null});
  assert.equal(durationText(null),'Indisponible');
  assert.equal(durationText(0),'0 s');
  assert.equal(durationText(420),'< 1 s');
  assert.equal(durationText(83000),'1 min 23 s');
});
