import { createSeed, TARIFFS, SLA_HOURS } from "../data/seed.js";

export const MISSION_TYPES = {
  battery: {
    label: "Changement de batterie",
    shortLabel: "Batterie",
    icon: "battery",
    color: "#6a56d6",
    pay: TARIFFS.battery,
    slaHours: SLA_HOURS.battery,
    steps: [
      "Retirer la batterie déchargée en sécurité",
      "Installer une batterie chargée et verrouiller le compartiment",
      "Vérifier l’allumage et remettre le véhicule en stationnement",
    ],
  },
  relocation: {
    label: "Relocalisation",
    shortLabel: "Relocalisation",
    icon: "move",
    color: "#248d85",
    pay: TARIFFS.relocation,
    slaHours: SLA_HOURS.relocation,
    steps: [
      "Vérifier l’état général avant le déplacement",
      "Transporter le véhicule vers la destination indiquée",
      "Stationner sans gêner le passage et verrouiller",
    ],
  },
  recharge: {
    label: "Récupération pour recharge",
    shortLabel: "Recharge",
    icon: "plug",
    color: "#d98a30",
    pay: TARIFFS.recharge,
    slaHours: SLA_HOURS.recharge,
    steps: [
      "Sécuriser le véhicule pour le transport",
      "Transporter le véhicule au dépôt de recharge",
      "Déposer dans la zone dédiée et brancher la recharge",
    ],
  },
  workshop: {
    label: "Retour à l’atelier",
    shortLabel: "Atelier",
    icon: "wrench",
    color: "#c56b77",
    pay: TARIFFS.workshop,
    slaHours: SLA_HOURS.workshop,
    steps: [
      "Identifier le défaut et sécuriser le véhicule",
      "Transporter le véhicule jusqu’à l’atelier",
      "Déposer dans la zone de réception et signaler le défaut",
    ],
  },
};

export const STATUS_LABELS = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
};
export const currency = (value) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    value || 0,
  );
export const formatMoney = currency;
export const formatDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
export const createInitialState = createSeed;

export function remainingTime(mission, now = Date.now()) {
  const minutes = Math.ceil(
    (new Date(mission.deadlineAt).getTime() - Number(now)) / 60_000,
  );
  if (minutes <= 0) return "Délai dépassé";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} h${rest ? ` ${String(rest).padStart(2, "0")}` : ""}`;
}

export function isValidPosition(position) {
  return (
    !!position &&
    Number.isFinite(position.lat) &&
    Number.isFinite(position.lng) &&
    Math.abs(position.lat) <= 90 &&
    Math.abs(position.lng) <= 180
  );
}

export function isValidPhoto(photo, { allowPlaceholder = false } = {}) {
  return (
    !!photo &&
    typeof photo.name === "string" &&
    typeof photo.simulated === "boolean" &&
    ((typeof photo.dataUrl === "string" &&
      /^data:image\/[a-z0-9.+-]+[;,]/i.test(photo.dataUrl)) ||
      (allowPlaceholder && photo.simulated && photo.dataUrl === null))
  );
}

function allStepsCompleted(mission, active) {
  return MISSION_TYPES[mission.type].steps.every((_, index) =>
    active.completedSteps.includes(index),
  );
}

export function reducer(state, action) {
  if (action.type === "RESET") return createInitialState(action.now);
  if (action.type === "REVIEW") {
    if (!["approved", "rejected"].includes(action.status)) return state;
    const entry = state.history.find(
      (record) => record.id === action.historyId,
    );
    if (!entry || entry.status !== "pending") return state;
    return {
      ...state,
      history: state.history.map((record) =>
        record.id === action.historyId
          ? {
              ...record,
              status: action.status,
              reviewedAt: new Date(action.now || Date.now()).toISOString(),
              rejectionReason:
                action.status === "rejected"
                  ? action.rejectionReason ||
                    "Dépôt non conforme aux consignes de la mission."
                  : null,
            }
          : record,
      ),
    };
  }
  if (action.type === "SELECT") {
    if (state.activeMission) return state;
    const mission = state.missions.find(
      (entry) => entry.id === action.missionId,
    );
    if (!mission) return state;
    return {
      ...state,
      activeMission: {
        missionId: mission.id,
        stage: "detail",
        scanned: false,
        unlocked: false,
        completedSteps: [],
        photo: null,
        position: null,
        startedAt: null,
      },
    };
  }
  if (action.type === "CANCEL_ACTIVE") return { ...state, activeMission: null };
  const active = state.activeMission;
  const mission =
    active && state.missions.find((entry) => entry.id === active.missionId);
  if (!active || !mission) return state;
  const update = (patch) => ({
    ...state,
    activeMission: { ...active, ...patch },
  });
  switch (action.type) {
    case "SCAN_AND_UNLOCK": {
      if (!["detail", "scan"].includes(active.stage)) return state;
      const vehicleId = String(action.vehicleId || "")
        .trim()
        .toUpperCase();
      if (vehicleId !== mission.vehicleId.trim().toUpperCase()) return state;
      return update({
        scanned: true,
        unlocked: true,
        stage: "work",
        startedAt:
          active.startedAt || new Date(action.now ?? Date.now()).toISOString(),
      });
    }
    case "CONFIRM_WORK": {
      if (
        action.confirmed !== true ||
        !["work", "scan"].includes(active.stage) ||
        !active.scanned ||
        !active.unlocked
      )
        return state;
      return update({
        completedSteps: MISSION_TYPES[mission.type].steps.map(
          (_, index) => index,
        ),
        stage: "deposit",
        workConfirmedAt: new Date(action.now ?? Date.now()).toISOString(),
      });
    }
    case "SET_STAGE": {
      if (!["detail", "scan", "work", "deposit"].includes(action.stage))
        return state;
      if (action.stage === "work" && !(active.scanned && active.unlocked))
        return state;
      if (
        action.stage === "deposit" &&
        !(active.unlocked && allStepsCompleted(mission, active))
      )
        return state;
      return update({
        stage: action.stage,
        startedAt:
          active.startedAt ||
          (action.stage === "scan"
            ? new Date(action.now || Date.now()).toISOString()
            : null),
      });
    }
    case "SCAN":
      return active.stage === "scan" &&
        String(action.vehicleId || "")
          .trim()
          .toUpperCase() === mission.vehicleId
        ? update({ scanned: true })
        : state;
    case "UNLOCK":
      return active.scanned ? update({ unlocked: true }) : state;
    case "TOGGLE_STEP": {
      if (
        !active.unlocked ||
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index >= MISSION_TYPES[mission.type].steps.length
      )
        return state;
      const completedSteps = active.completedSteps.includes(action.index)
        ? active.completedSteps.filter((index) => index !== action.index)
        : [...active.completedSteps, action.index];
      return update({ completedSteps });
    }
    case "SET_PHOTO":
      return action.photo === null || isValidPhoto(action.photo)
        ? update({ photo: action.photo })
        : state;
    case "SET_POSITION":
      return isValidPosition(action.position)
        ? update({ position: action.position })
        : state;
    case "SUBMIT": {
      if (
        active.stage !== "deposit" ||
        !active.scanned ||
        !active.unlocked ||
        !allStepsCompleted(mission, active) ||
        !isValidPhoto(active.photo) ||
        !isValidPosition(active.position)
      )
        return state;
      if (!["pending", "approved", "rejected"].includes(action.scenario))
        return state;
      const completedAt = action.completedAt || new Date().toISOString();
      const record = {
        ...mission,
        status: action.scenario,
        rejectionReason:
          action.scenario === "rejected"
            ? action.rejectionReason ||
              "Dépôt non conforme aux consignes de la mission."
            : null,
        completedAt,
        reviewedAt: action.scenario === "pending" ? null : completedAt,
        startedAt: active.startedAt || completedAt,
        workConfirmedAt: active.workConfirmedAt || null,
        photo: active.photo,
        position: active.position,
        completedSteps: active.completedSteps,
      };
      return {
        ...state,
        missions: state.missions.filter((entry) => entry.id !== mission.id),
        history: [record, ...state.history],
        activeMission: null,
      };
    }
    default:
      return state;
  }
}

export function getEarnings(history, { days = 7, now = Date.now() } = {}) {
  const cutoff = Number(now) - days * 86_400_000;
  const totals = { approved: 0, pending: 0, rejected: 0, count: 0 };
  for (const mission of history) {
    if (
      new Date(mission.completedAt).getTime() < cutoff ||
      new Date(mission.completedAt).getTime() > Number(now)
    )
      continue;
    if (Object.hasOwn(totals, mission.status)) {
      totals[mission.status] += mission.pay;
      totals.count += 1;
    }
  }
  return totals;
}
