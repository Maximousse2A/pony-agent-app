import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialState,
  reducer,
  MISSION_TYPES,
  getEarnings,
} from "./missions.js";
import { isValidState, loadState, saveState, STORAGE_KEY } from "./storage.js";

const now = Date.UTC(2026, 10, 12, 10);

function readyForDeposit(state = createInitialState(now)) {
  const mission = state.missions[0];
  const actions = [
    { type: "SELECT", missionId: mission.id },
    { type: "SET_STAGE", stage: "scan", now },
    { type: "SCAN", vehicleId: mission.vehicleId },
    { type: "UNLOCK" },
    { type: "SET_STAGE", stage: "work" },
    ...MISSION_TYPES[mission.type].steps.map((_, index) => ({
      type: "TOGGLE_STEP",
      index,
    })),
    { type: "SET_STAGE", stage: "deposit" },
    {
      type: "SET_PHOTO",
      photo: {
        dataUrl: "data:image/svg+xml,test",
        name: "Démo",
        simulated: true,
      },
    },
    {
      type: "SET_POSITION",
      position: {
        lat: mission.destination.lat,
        lng: mission.destination.lng,
        simulated: true,
        capturedAt: new Date(now).toISOString(),
      },
    },
  ];
  return actions.reduce(reducer, state);
}

test("seed respects both tariff zones and SLA deadlines for all mission types", () => {
  const state = createInitialState(now);
  assert.ok(isValidState(state));
  for (const mission of state.missions) {
    assert.equal(mission.pay, MISSION_TYPES[mission.type].pay[mission.zone]);
    assert.equal(
      new Date(mission.deadlineAt) - new Date(mission.createdAt),
      MISSION_TYPES[mission.type].slaHours * 3_600_000,
    );
    assert.ok(new Date(mission.deadlineAt).getTime() > now);
  }
  assert.deepEqual(
    new Set(state.missions.map((mission) => `${mission.type}:${mission.zone}`)),
    new Set(
      Object.keys(MISSION_TYPES).flatMap((type) => [
        `${type}:centre`,
        `${type}:peripherie`,
      ]),
    ),
  );
});

test("wrong vehicle and incomplete work cannot advance the mission", () => {
  let state = reducer(createInitialState(now), {
    type: "SELECT",
    missionId: "M-1042",
  });
  state = reducer(state, { type: "SET_STAGE", stage: "scan", now });
  assert.equal(reducer(state, { type: "SCAN", vehicleId: "PN-WRONG" }), state);
  assert.equal(reducer(state, { type: "UNLOCK" }), state);
  assert.equal(reducer(state, { type: "SET_STAGE", stage: "work" }), state);
  state = reducer(state, { type: "SCAN", vehicleId: "PN-2841" });
  state = reducer(state, { type: "UNLOCK" });
  assert.equal(reducer(state, { type: "SET_STAGE", stage: "deposit" }), state);
});

test("submission requires photo and valid coordinates, then persists exactly once", () => {
  let state = readyForDeposit();
  const missingPhoto = {
    ...state,
    activeMission: { ...state.activeMission, photo: null },
  };
  assert.equal(
    reducer(missingPhoto, { type: "SUBMIT", scenario: "approved" }),
    missingPhoto,
  );
  const badPosition = {
    ...state,
    activeMission: { ...state.activeMission, position: { lat: 99, lng: 0 } },
  };
  assert.equal(
    reducer(badPosition, { type: "SUBMIT", scenario: "approved" }),
    badPosition,
  );
  const initialHistory = state.history.length;
  state = reducer(state, {
    type: "SUBMIT",
    scenario: "approved",
    completedAt: new Date(now).toISOString(),
  });
  assert.equal(state.history.length, initialHistory + 1);
  assert.equal(state.activeMission, null);
  assert.ok(!state.missions.some((mission) => mission.id === "M-1042"));
  assert.equal(reducer(state, { type: "SUBMIT", scenario: "approved" }), state);
  assert.ok(isValidState(state));
});

test("rejection is unpaid and pending review cannot be processed twice", () => {
  let state = readyForDeposit();
  state = reducer(state, {
    type: "SUBMIT",
    scenario: "pending",
    completedAt: new Date(now).toISOString(),
  });
  const paidBefore = getEarnings(state.history, { now }).approved;
  state = reducer(state, {
    type: "REVIEW",
    historyId: "M-1042",
    status: "rejected",
    rejectionReason: "Photo floue",
    now,
  });
  assert.equal(state.history[0].rejectionReason, "Photo floue");
  assert.equal(getEarnings(state.history, { now }).approved, paidBefore);
  assert.equal(
    reducer(state, {
      type: "REVIEW",
      historyId: "M-1042",
      status: "approved",
      now,
    }),
    state,
  );
});

test("all four types can complete and reset produces fresh, independent demo data", () => {
  for (const type of Object.keys(MISSION_TYPES)) {
    const initial = createInitialState(now);
    const target = initial.missions.find((mission) => mission.type === type);
    const reordered = {
      ...initial,
      missions: [
        target,
        ...initial.missions.filter((mission) => mission.id !== target.id),
      ],
    };
    const complete = reducer(readyForDeposit(reordered), {
      type: "SUBMIT",
      scenario: "approved",
      completedAt: new Date(now).toISOString(),
    });
    assert.equal(complete.history[0].type, type);
    assert.equal(complete.history[0].status, "approved");
  }
  const state = readyForDeposit();
  const reset = reducer(state, { type: "RESET", now: now + 10_000 });
  assert.equal(reset.activeMission, null);
  assert.equal(reset.missions.length, 10);
  assert.equal(reset.demoStartedAt, new Date(now + 10_000).toISOString());
  reset.missions[0].destination.lat = 0;
  assert.equal(createInitialState(now).missions[0].destination.lat, 47.4713);
});

test("local storage round trip, schema drift, corrupt JSON, and quota failure are safe", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  const state = readyForDeposit();
  assert.equal(saveState(state, storage), true);
  assert.deepEqual(loadState(storage), state);
  values.set(STORAGE_KEY, "{broken");
  assert.ok(isValidState(loadState(storage)));
  values.set(STORAGE_KEY, JSON.stringify({ ...state, schemaVersion: 99 }));
  assert.equal(loadState(storage).activeMission, null);
  assert.equal(
    saveState(state, {
      setItem() {
        throw new Error("QuotaExceededError");
      },
    }),
    false,
  );
  assert.ok(
    isValidState(
      loadState({
        getItem() {
          throw new Error("Access denied");
        },
      }),
    ),
  );
});

test("corrupted evidence cannot crash a restored history or bypass deposit requirements", () => {
  const state = readyForDeposit();
  const emptyPhoto = {
    ...state,
    activeMission: { ...state.activeMission, photo: {} },
  };
  assert.equal(
    reducer(emptyPhoto, { type: "SUBMIT", scenario: "approved" }),
    emptyPhoto,
  );
  for (const corrupt of [
    {
      ...state,
      history: [{ ...state.history[0], position: { lat: "invalid", lng: 0 } }],
    },
    {
      ...state,
      history: [{ ...state.history[0], rejectionReason: { broken: true } }],
    },
    {
      ...state,
      missions: [{ ...state.missions[0], vehicleKind: { broken: true } }],
    },
    { ...state, missions: [{ ...state.missions[0], type: "toString" }] },
    { ...state, activeMission: { ...state.activeMission, scanned: false } },
  ]) {
    assert.equal(isValidState(corrupt), false);
    const restored = loadState({ getItem: () => JSON.stringify(corrupt) });
    assert.equal(restored.activeMission, null);
    assert.ok(isValidState(restored));
  }
});
