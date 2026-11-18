import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, advance, missions, coordinates, zoneFor, depositPoint, requiresDeposit} from '../src/domain.js';
import {directions, fieldMissions, priorities} from '../src/navigation.js';

for (const type of ['battery', 'move', 'charge', 'shop']) {
  test('Reprise du trajet, preuve et horodatages · '+type, () => {
    const m=missions.find(row=>row.type===type);
    let state=initialState();
    assert.ok(advance(state,'take',m.id,1000));
    // Opening the directions link must not start identification or mutate the save.
    const destination = new URL(directions(coordinates(m.point))).searchParams.get('destination');
    assert.equal(destination, coordinates(m.point).join(','));
    state=JSON.parse(JSON.stringify(state));
    assert.equal(state.active.step,'travel');
    assert.equal(advance(state,'scan'),false);
    assert.ok(advance(state,'arrive',null,6000));
    assert.equal(advance(state,'arrive'),false);
    assert.ok(advance(state,'scan',null,7000));
    assert.ok(advance(state,'unlock',null,8000));
    assert.ok(advance(state,'work',null,18000));
    state=JSON.parse(JSON.stringify(state));
    if (requiresDeposit(m)) {
      assert.equal(state.active.step,'handoff');
      const zone=zoneFor(m);
      assert.equal(new URL(directions(coordinates(depositPoint(m)))).searchParams.get('destination'),[zone.lat,zone.lng].join(','));
      assert.equal(advance(state,'photo','sample'),false);
      assert.ok(advance(state,'arrive-depot',null,26000));
    }
    assert.equal(state.active.step,'deposit');
    assert.equal(advance(state,'deposit'),false);
    assert.ok(advance(state,'photo','sample'));
    assert.ok(advance(state,'deposit',null,30000));
    assert.deepEqual(state.history[0].timing,{
      acceptedAt:1000,arrivedAtVehicle:6000,interventionStartedAt:8000,interventionEndedAt:18000,
      ...(requiresDeposit(m)?{arrivedAtDeposit:26000}:{}),completedAt:30000
    });
    assert.equal(advance(state,'deposit'),false);
  });
}

test('Un ancien dossier reprend à son étape avec les preuves déjà fournies', () => {
  const s=initialState();
  s.active={id:missions[0].id,step:'scan',started:s.now};
  assert.ok(advance(s,'scan'));
  assert.ok(advance(s,'unlock',null,2000));
  assert.equal(s.active.timing.acceptedAt,undefined);
  s.active={id:missions[0].id,step:'deposit',started:s.now,photo:'sample',case:'clear',gps:{lat:'47.47',lng:'-0.55',accuracy:8,inside:true}};
  assert.ok(advance(s,'deposit',null,4000));
  assert.deepEqual(s.history[0].timing,{completedAt:4000});
  assert.equal(s.history[0].photo,'sample');
  assert.equal(s.history[0].status,'approved');
});

test('Plus proche du GPS, tri secondaire et combinaison des filtres', () => {
  const s=initialState();
  const ui={priority:'all',type:'all',sort:'priority',location:coordinates(missions[1].point)};
  const {list,nearest}=fieldMissions(s,ui);
  assert.equal(nearest.id,missions[1].id);
  assert.equal(nearest.metres,0);
  assert.equal(list[0].priority,3);
  assert.deepEqual([...new Set(list.map(m=>priorities[m.priority]))],['Critique','Haute','Normale','Faible']);
  assert.ok(list.every((m,i)=>!i||list[i-1].priority>m.priority||list[i-1].metres<=m.metres));
  const filtered=fieldMissions(s,{...ui,type:'battery',priority:'2'});
  assert.equal(filtered.list.length,1); assert.equal(filtered.nearest.id,'AG-2066');
  assert.equal(fieldMissions(s,{...ui,type:'shop',priority:'0'}).nearest,undefined);
  assert.ok(advance(s,'take',nearest.id));
  assert.notEqual(fieldMissions(s,ui).nearest.id,nearest.id);
});

test('Sans GPS, la proximité suit le dernier emplacement de démonstration', () => {
  const s=initialState(),ui={priority:'all',type:'all',sort:'distance'};
  assert.equal(fieldMissions(s,ui).nearest.id,'AG-2048');
  s.position=missions[7].point;
  assert.equal(fieldMissions(s,ui).nearest.id,'AG-2078');
});
