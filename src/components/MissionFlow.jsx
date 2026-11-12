import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Bike,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  LockKeyholeOpen,
  MapPin,
  QrCode,
  ShieldCheck,
  Truck,
  Wrench,
} from './icons.js';
import { MISSION_TYPES } from "../domain/missions";
import DepositForm from "./DepositForm";

const TYPE_ICONS = {
  battery: BatteryCharging,
  relocation: Bike,
  recharge: Truck,
  workshop: Wrench,
};
const STAGES = ["detail", "scan", "work", "deposit"];
const STAGE_LABELS = ["Choisir", "Scanner", "Intervenir", "Déposer"];
const money = (amount) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    amount,
  );
const dateTime = (value) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(value));

export default function MissionFlow({
  mission,
  activeMission,
  dispatch,
  onClose,
  onFinished,
}) {
  const [vehicleCode, setVehicleCode] = useState(mission.vehicleId);
  const [scanError, setScanError] = useState("");
  const [confirmRelease, setConfirmRelease] = useState(false);
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const latestClose = useRef(onClose);
  latestClose.current = onClose;
  const stage = activeMission.stage;
  const stageIndex = STAGES.indexOf(stage);
  const config = MISSION_TYPES[mission.type];
  const Icon = TYPE_ICONS[mission.type] || Bike;
  const completed = activeMission.completedSteps || [];
  const allDone = config.steps.every((_, index) => completed.includes(index));

  useEffect(() => {
    const scrollContainer = dialog.current?.closest(".flow-panel");
    if (scrollContainer)
      scrollContainer.scrollTo({ top: 0, behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [stage]);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    function handleKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        latestClose.current?.();
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...(dialog.current?.querySelectorAll(
          'button:not([disabled]),a[href],input:not([disabled]):not([tabindex="-1"]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        ) || []),
      ].filter((element) => element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [mission.id]);

  function scanVehicle(event) {
    event.preventDefault();
    if (vehicleCode.trim().toUpperCase() !== mission.vehicleId.toUpperCase()) {
      setScanError(
        `Ce véhicule ne correspond pas à la mission. Scannez ${mission.vehicleId}.`,
      );
      return;
    }
    setScanError("");
    dispatch({ type: "SCAN", vehicleId: mission.vehicleId });
  }

  return (
    <section
      ref={dialog}
      role="dialog"
      aria-modal="true"
      className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-6"
      aria-label="Réalisation de la mission"
    >
      <button
        ref={closeButton}
        type="button"
        onClick={onClose}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft size={18} aria-hidden="true" /> Retour aux missions
      </button>

      <ol
        className="mb-8 grid grid-cols-4 gap-2"
        aria-label="Étapes de la mission"
      >
        {STAGE_LABELS.map((label, index) => (
          <li
            key={label}
            aria-current={index === stageIndex ? "step" : undefined}
            className="flex flex-col items-center gap-2"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${index <= stageIndex ? "bg-emerald-950 text-white" : "bg-slate-100 text-slate-400"}`}
            >
              {index < stageIndex ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`text-xs font-semibold sm:text-sm ${index === stageIndex ? "text-emerald-950" : "text-slate-500"}`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">
            <Icon size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              {mission.vehicleKind} · {mission.vehicleId}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              {config.label}
            </h1>
          </div>
        </div>
        <span className="shrink-0 rounded-xl bg-lime-100 px-3 py-2 text-lg font-bold text-emerald-950">
          {money(mission.pay)}
        </span>
      </div>

      {stage === "detail" && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <MapPin
                className="mt-0.5 shrink-0 text-emerald-700"
                size={21}
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Véhicule à récupérer
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {mission.location}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Angers ·{" "}
                  {mission.zone === "centre" ? "Centre-ville" : "Périphérie"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Clock3 size={14} aria-hidden="true" /> Prise en charge avant
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-950">
                  {dateTime(mission.deadlineAt)}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <BatteryCharging size={14} aria-hidden="true" /> Batterie
                  actuelle
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-950">
                  {mission.battery} %
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-base font-bold text-slate-950">
              Pourquoi cette mission ?
            </h2>
            <p className="text-sm leading-6 text-slate-600">{mission.reason}</p>
            <p className="mt-3 text-xs text-slate-400">
              Créée le {dateTime(mission.createdAt)} · Données fictives
            </p>
            <div className="mt-5 flex gap-3 rounded-2xl bg-slate-50 p-4">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0 text-slate-600"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  {mission.type === "battery"
                    ? "Validation sur place"
                    : "Destination de dépôt"}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {mission.destination.label}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <Info size={18} className="mt-1 shrink-0" aria-hidden="true" />
            <p>
              Le scan et le déverrouillage sont simulés. Votre progression est
              enregistrée sur cet appareil.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_STAGE", stage: "scan" })}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-5 py-4 font-bold text-white transition hover:bg-emerald-900"
          >
            Commencer cette mission <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      )}

      {stage === "scan" && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
            <p className="mb-6 text-sm text-slate-500">
              Vérifiez l’identifiant avant de déverrouiller le véhicule.
            </p>
            <div
              className={`mx-auto flex h-40 w-40 items-center justify-center rounded-3xl border-2 border-dashed ${activeMission.scanned ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-slate-50 text-slate-800"}`}
            >
              {activeMission.scanned ? (
                <CheckCircle2 size={70} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <QrCode size={96} strokeWidth={1.5} aria-hidden="true" />
              )}
            </div>
            <p className="mt-4 text-lg font-bold text-slate-950">
              {mission.vehicleId}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Simulateur de QR · Aucune caméra nécessaire
            </p>
            {!activeMission.scanned ? (
              <form onSubmit={scanVehicle} className="mt-6 text-left">
                <label
                  htmlFor="vehicle-code"
                  className="text-sm font-semibold text-slate-700"
                >
                  Identifiant lu par le scan
                </label>
                <input
                  id="vehicle-code"
                  value={vehicleCode}
                  onChange={(event) => {
                    setVehicleCode(event.target.value);
                    setScanError("");
                  }}
                  autoComplete="off"
                  spellCheck="false"
                  aria-invalid={!!scanError}
                  aria-describedby={scanError ? "scan-error" : undefined}
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-mono uppercase text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />
                {scanError && (
                  <p
                    id="scan-error"
                    role="alert"
                    className="mt-2 text-sm text-red-700"
                  >
                    {scanError}
                  </p>
                )}
                <button
                  type="submit"
                  className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-5 py-4 font-bold text-white hover:bg-emerald-900"
                >
                  <QrCode size={19} aria-hidden="true" /> Simuler le scan QR
                </button>
              </form>
            ) : (
              <p
                role="status"
                className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700"
              >
                <CheckCircle2 size={18} aria-hidden="true" /> Véhicule identifié
              </p>
            )}
          </div>

          {activeMission.scanned && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex gap-3">
                <LockKeyholeOpen
                  size={22}
                  className="shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
                <div aria-live="polite" aria-atomic="true">
                  <h2 className="font-bold text-slate-950">
                    {activeMission.unlocked
                      ? "Véhicule déverrouillé"
                      : "Déverrouiller le véhicule"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeMission.unlocked
                      ? "Simulation terminée. Vous pouvez intervenir."
                      : "La commande sera simulée dans cette démonstration."}
                  </p>
                </div>
              </div>
              {!activeMission.unlocked ? (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "UNLOCK" })}
                  className="min-h-13 w-full rounded-2xl bg-emerald-950 px-5 py-4 font-bold text-white hover:bg-emerald-900"
                >
                  Simuler le déverrouillage
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_STAGE", stage: "work" })}
                  className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-5 py-4 font-bold text-white hover:bg-emerald-900"
                >
                  Passer à l’intervention{" "}
                  <ArrowRight size={19} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {stage === "work" && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Votre intervention
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Confirmez chaque étape réalisée avant de préparer la validation.
            </p>
            <div className="mt-5 space-y-3">
              {config.steps.map((step, index) => (
                <label
                  key={step}
                  className={`flex min-h-17 cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${completed.includes(index) ? "border-emerald-200 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <input
                    type="checkbox"
                    checked={completed.includes(index)}
                    onChange={() => dispatch({ type: "TOGGLE_STEP", index })}
                    className="h-5 w-5 shrink-0 accent-emerald-900"
                  />
                  <span className="text-sm font-medium leading-6 text-slate-800">
                    {step}
                  </span>
                </label>
              ))}
            </div>
            <p
              className="mt-4 text-xs font-medium text-slate-500"
              role="status"
            >
              {completed.length} / {config.steps.length} étapes confirmées
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
            <MapPin
              size={20}
              className="mt-0.5 shrink-0 text-slate-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {mission.type === "battery"
                  ? "Lieu de l’intervention"
                  : "Lieu de dépôt attendu"}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {mission.destination.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={!allDone}
            onClick={() => dispatch({ type: "SET_STAGE", stage: "deposit" })}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-5 py-4 font-bold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            Préparer la validation <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      )}

      {stage === "deposit" && (
        <DepositForm
          mission={mission}
          activeMission={activeMission}
          dispatch={dispatch}
          onFinished={onFinished}
        />
      )}
      <div className="mt-6 border-t border-slate-200 pt-4">
        {confirmRelease ? (
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-950">
              Libérer cette mission ?
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-900">
              Votre progression et les preuves ajoutées seront effacées. La
              mission restera disponible sur la carte.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmRelease(false)}
                className="min-h-11 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-950"
              >
                Garder la mission
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "CANCEL_ACTIVE" });
                  onClose?.();
                }}
                className="min-h-11 rounded-xl bg-amber-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirmer la libération
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRelease(true)}
            className="min-h-11 w-full rounded-xl px-3 py-2 text-center text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            Libérer cette mission
          </button>
        )}
      </div>
      <p className="mt-7 flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-slate-400">
        <ShieldCheck size={14} className="shrink-0" aria-hidden="true" />{" "}
        Prototype · Aucun véhicule réel n’est commandé
      </p>
    </section>
  );
}
