import {
  createInitialState,
  isValidPhoto,
  isValidPosition,
  MISSION_TYPES,
} from "./missions.js";

export const STORAGE_KEY = "pony-agent-demo:v1";

const validDate = (value) =>
  typeof value === "string" && Number.isFinite(new Date(value).getTime());
function validMission(mission) {
  return (
    !!mission &&
    typeof mission.id === "string" &&
    !!mission.id &&
    Object.hasOwn(MISSION_TYPES, mission.type) &&
    typeof mission.vehicleId === "string" &&
    typeof mission.vehicleKind === "string" &&
    Number.isFinite(mission.battery) &&
    mission.battery >= 0 &&
    mission.battery <= 100 &&
    ["centre", "peripherie"].includes(mission.zone) &&
    typeof mission.location === "string" &&
    typeof mission.reason === "string" &&
    Number.isFinite(mission.pay) &&
    mission.pay >= 0 &&
    validDate(mission.createdAt) &&
    validDate(mission.deadlineAt) &&
    isValidPosition(mission) &&
    !!mission.destination &&
    typeof mission.destination.label === "string" &&
    isValidPosition(mission.destination)
  );
}

function validEvidencePosition(position) {
  return (
    isValidPosition(position) &&
    typeof position.simulated === "boolean" &&
    validDate(position.capturedAt) &&
    (position.accuracy === undefined ||
      (Number.isFinite(position.accuracy) && position.accuracy >= 0))
  );
}

export function isValidState(state) {
  if (
    !state ||
    state.schemaVersion !== 1 ||
    !Array.isArray(state.missions) ||
    !Array.isArray(state.history)
  )
    return false;
  if (
    !state.missions.every(validMission) ||
    !state.history.every(
      (record) =>
        validMission(record) &&
        ["pending", "approved", "rejected"].includes(record.status) &&
        validDate(record.completedAt) &&
        validDate(record.startedAt) &&
        (record.reviewedAt === null || validDate(record.reviewedAt)) &&
        (record.rejectionReason === null ||
          typeof record.rejectionReason === "string") &&
        isValidPhoto(record.photo, { allowPlaceholder: true }) &&
        validEvidencePosition(record.position),
    )
  )
    return false;
  const missionIds = state.missions.map((mission) => mission.id);
  const historyIds = state.history.map((record) => record.id);
  if (
    new Set([...missionIds, ...historyIds]).size !==
    missionIds.length + historyIds.length
  )
    return false;
  const active = state.activeMission;
  if (active !== null) {
    if (
      !active ||
      !missionIds.includes(active.missionId) ||
      !["detail", "scan", "work", "deposit"].includes(active.stage) ||
      !Array.isArray(active.completedSteps) ||
      typeof active.scanned !== "boolean" ||
      typeof active.unlocked !== "boolean"
    )
      return false;
    const mission = state.missions.find(
      (entry) => entry.id === active.missionId,
    );
    if (
      active.completedSteps.some(
        (index) =>
          !Number.isInteger(index) ||
          index < 0 ||
          index >= MISSION_TYPES[mission.type].steps.length,
      )
    )
      return false;
    if (
      new Set(active.completedSteps).size !== active.completedSteps.length ||
      (active.unlocked && !active.scanned)
    )
      return false;
    if (
      ["work", "deposit"].includes(active.stage) &&
      !(active.scanned && active.unlocked)
    )
      return false;
    if (
      active.stage === "deposit" &&
      !MISSION_TYPES[mission.type].steps.every((_, index) =>
        active.completedSteps.includes(index),
      )
    )
      return false;
    if (active.position && !validEvidencePosition(active.position))
      return false;
    if (active.photo && !isValidPhoto(active.photo)) return false;
    if (active.startedAt !== null && !validDate(active.startedAt)) return false;
  }
  return true;
}

// Storage may be unavailable in private browsing or full after photo uploads.
// Keep the app usable in memory and let the caller show a persistence warning.
export function loadState(storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    const saved = target?.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      if (isValidState(state)) return state;
    }
  } catch {
    // A damaged or inaccessible demo must never prevent the app from opening.
  }
  return createInitialState();
}

export function saveState(state, storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    if (!target || !isValidState(state)) return false;
    target.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
