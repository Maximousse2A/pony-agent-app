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
} from "./icons.js";
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
      className="pony-flow mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-6"
      aria-label="Réalisation de la mission"
    >
      <button
        ref={closeButton}
        type="button"
        onClick={onClose}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-pony-coral-ink hover:text-pony-purple transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
      >
        <ArrowLeft size={18} className="text-pony-coral" aria-hidden="true" />{" "}
        Retour aux missions
      </button>

      <ol
        className="pony-stepper mb-8 grid grid-cols-4 gap-2"
        aria-label="Étapes de la mission"
      >
        {STAGE_LABELS.map((label, index) => (
          <li
            key={label}
            aria-current={index === stageIndex ? "step" : undefined}
            className="flex flex-col items-center gap-2"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${index <= stageIndex ? "bg-pony-blue text-white" : "bg-pony-light text-pony-muted"}`}
            >
              {index < stageIndex ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`text-xs font-semibold sm:text-sm ${index === stageIndex ? "text-pony-purple" : "text-pony-muted"}`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="pony-mission-heading mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pony-cyan/20 text-pony-purple">
            <Icon size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-pony-muted">
              {mission.vehicleKind}{" "}
              <span className="whitespace-nowrap">· {mission.vehicleId}</span>
            </p>
            <h1 className="text-xl font-black tracking-tight text-pony-purple sm:text-2xl">
              {config.label}
            </h1>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-pony-cyan px-4 py-2 text-lg font-extrabold text-pony-purple">
          {money(mission.pay)}
        </span>
      </div>

      {stage === "detail" && (
        <div className="space-y-5">
          <div className="rounded-[28px] border border-pony-border bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <MapPin
                className="mt-0.5 shrink-0 text-pony-blue"
                size={21}
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-pony-muted">
                  Véhicule à récupérer
                </p>
                <p className="mt-1 font-semibold text-pony-purple">
                  {mission.location}
                </p>
                <p className="mt-1 text-sm text-pony-muted">
                  Angers ·{" "}
                  {mission.zone === "centre" ? "Centre-ville" : "Périphérie"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-pony-border pt-5">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-pony-muted">
                  <Clock3 size={14} aria-hidden="true" /> Prise en charge avant
                </p>
                <p className="mt-1.5 text-sm font-semibold text-pony-purple">
                  {dateTime(mission.deadlineAt)}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-pony-muted">
                  <BatteryCharging size={14} aria-hidden="true" /> Batterie
                  actuelle
                </p>
                <p className="mt-1.5 text-sm font-semibold text-pony-purple">
                  {mission.battery} %
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-pony-border bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-base font-extrabold text-pony-purple">
              Pourquoi cette mission ?
            </h2>
            <p className="text-sm leading-6 text-pony-purple/80">
              {mission.reason}
            </p>
            <p className="mt-3 text-xs text-pony-muted">
              Créée le {dateTime(mission.createdAt)} · Données fictives
            </p>
            <div className="mt-5 flex gap-3 rounded-2xl bg-pony-light p-4">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0 text-pony-purple/80"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-pony-muted">
                  {mission.type === "battery"
                    ? "Validation sur place"
                    : "Destination de dépôt"}
                </p>
                <p className="mt-1 text-sm font-semibold text-pony-purple">
                  {mission.destination.label}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl bg-pony-cyan/10 p-4 text-sm leading-6 text-pony-purple">
            <Info size={18} className="mt-1 shrink-0" aria-hidden="true" />
            <p>
              Le scan et le déverrouillage sont simulés. Votre progression est
              enregistrée sur cet appareil.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_STAGE", stage: "scan" })}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-pony-blue px-5 py-4 font-bold text-white hover:bg-pony-purple transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
          >
            Commencer cette mission <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      )}

      {stage === "scan" && (
        <div className="space-y-5">
          <div className="rounded-[28px] border border-pony-border bg-white p-6 text-center">
            <p className="mb-6 text-sm text-pony-muted">
              Vérifiez l’identifiant avant de déverrouiller le véhicule.
            </p>
            <div
              className={`mx-auto flex h-40 w-40 items-center justify-center rounded-[28px] border-2 border-dashed ${activeMission.scanned ? "border-pony-cyan bg-pony-cyan/10 text-pony-blue" : "border-pony-border bg-pony-light text-pony-purple"}`}
            >
              {activeMission.scanned ? (
                <CheckCircle2 size={70} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <QrCode size={96} strokeWidth={1.5} aria-hidden="true" />
              )}
            </div>
            <p className="mt-4 text-lg font-extrabold text-pony-purple">
              {mission.vehicleId}
            </p>
            <p className="mt-1 text-xs text-pony-muted">
              Simulateur de QR · Aucune caméra nécessaire
            </p>
            {!activeMission.scanned ? (
              <form onSubmit={scanVehicle} className="mt-6 text-left">
                <label
                  htmlFor="vehicle-code"
                  className="text-sm font-semibold text-pony-purple"
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
                  className="mt-2 min-h-12 w-full rounded-xl border border-pony-border bg-white px-4 font-mono uppercase text-pony-purple outline-none focus:border-pony-blue focus:ring-2 focus:ring-pony-blue/15"
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
                  className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-pony-blue px-5 py-4 font-bold text-white hover:bg-pony-purple transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
                >
                  <QrCode size={19} aria-hidden="true" /> Simuler le scan QR
                </button>
              </form>
            ) : (
              <p
                role="status"
                className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-pony-blue"
              >
                <CheckCircle2 size={18} aria-hidden="true" /> Véhicule identifié
              </p>
            )}
          </div>

          {activeMission.scanned && (
            <div className="rounded-[28px] border border-pony-border bg-white p-5">
              <div className="mb-4 flex gap-3">
                <LockKeyholeOpen
                  size={22}
                  className="shrink-0 text-pony-blue"
                  aria-hidden="true"
                />
                <div aria-live="polite" aria-atomic="true">
                  <h2 className="font-extrabold text-pony-purple">
                    {activeMission.unlocked
                      ? "Véhicule déverrouillé"
                      : "Déverrouiller le véhicule"}
                  </h2>
                  <p className="mt-1 text-sm text-pony-muted">
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
                  className="min-h-13 w-full rounded-full bg-pony-blue px-5 py-4 font-bold text-white hover:bg-pony-purple transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
                >
                  Simuler le déverrouillage
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_STAGE", stage: "work" })}
                  className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-pony-blue px-5 py-4 font-bold text-white hover:bg-pony-purple transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
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
          <div className="rounded-[28px] border border-pony-border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-pony-purple">
              Votre intervention
            </h2>
            <p className="mt-2 text-sm leading-6 text-pony-muted">
              Confirmez chaque étape réalisée avant de préparer la validation.
            </p>
            <div className="mt-5 space-y-3">
              {config.steps.map((step, index) => (
                <label
                  key={step}
                  className={`flex min-h-17 cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${completed.includes(index) ? "border-pony-blue/25 bg-pony-cyan/10" : "border-pony-border hover:bg-pony-light"}`}
                >
                  <input
                    type="checkbox"
                    checked={completed.includes(index)}
                    onChange={() => dispatch({ type: "TOGGLE_STEP", index })}
                    className="h-5 w-5 shrink-0 accent-pony-blue"
                  />
                  <span className="text-sm font-medium leading-6 text-pony-purple">
                    {step}
                  </span>
                </label>
              ))}
            </div>
            <p
              className="mt-4 text-xs font-medium text-pony-muted"
              role="status"
            >
              {completed.length} / {config.steps.length} étapes confirmées
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-pony-light p-4">
            <MapPin
              size={20}
              className="mt-0.5 shrink-0 text-pony-purple/80"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold text-pony-muted">
                {mission.type === "battery"
                  ? "Lieu de l’intervention"
                  : "Lieu de dépôt attendu"}
              </p>
              <p className="mt-1 text-sm font-semibold text-pony-purple">
                {mission.destination.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={!allDone}
            onClick={() => dispatch({ type: "SET_STAGE", stage: "deposit" })}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-pony-blue px-5 py-4 font-bold text-white hover:bg-pony-purple disabled:cursor-not-allowed disabled:bg-pony-border disabled:text-pony-muted transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
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
      <div className="mt-6 border-t border-pony-border pt-4">
        {confirmRelease ? (
          <div className="rounded-2xl bg-pony-coral/10 p-4">
            <p className="text-sm font-semibold text-pony-purple">
              Libérer cette mission ?
            </p>
            <p className="mt-1 text-xs leading-5 text-pony-purple/80">
              Votre progression et les preuves ajoutées seront effacées. La
              mission restera disponible sur la carte.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmRelease(false)}
                className="min-h-11 rounded-full border border-pony-coral/30 bg-white px-4 py-2 text-sm font-semibold text-pony-purple transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
              >
                Garder la mission
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "CANCEL_ACTIVE" });
                  onClose?.();
                }}
                className="min-h-11 rounded-full bg-pony-purple px-4 py-2 text-sm font-semibold text-white transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
              >
                Confirmer la libération
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRelease(true)}
            className="min-h-11 w-full rounded-full px-3 py-2 text-center text-xs font-semibold text-pony-muted hover:bg-pony-light hover:text-pony-purple transition-[transform,background-color,color] duration-200 ease-out enabled:active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
          >
            Libérer cette mission
          </button>
        )}
      </div>
      <p className="mt-7 flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-pony-muted">
        <ShieldCheck size={14} className="shrink-0" aria-hidden="true" />{" "}
        Prototype · Aucun véhicule réel n’est commandé
      </p>
    </section>
  );
}
