import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BatteryCharging,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  QrCode,
} from "./icons.js";
import { MISSION_TYPES, currency } from "../domain/missions.js";
import { formatParisDate } from "../domain/date.js";
import { preparePhoto } from "./missionPhoto.js";
import DepositForm from "./DepositForm.jsx";

export default function MissionFlow({
  mission,
  notice,
  activeMission,
  dispatch,
  onClose,
  onFinished,
}) {
  const [vehicleCode, setVehicleCode] = useState(mission.vehicleId);
  const [scanError, setScanError] = useState("");
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const dialog = useRef(null),
    closeButton = useRef(null),
    options = useRef(null),
    fileInput = useRef(null);
  const mounted = useRef(true),
    photoRequest = useRef(0),
    latestClose = useRef(onClose);
  latestClose.current = onClose;
  useEffect(() => {
    if (confirmRelease) {
      dialog.current
        ?.querySelector(".field-release")
        ?.scrollIntoView({ block: "nearest" });
      dialog.current
        ?.querySelector(".field-release button")
        ?.focus({ preventScroll: true });
    }
  }, [confirmRelease]);
  const isProof = activeMission.stage === "deposit";
  const isUnlocked = activeMission.scanned && activeMission.unlocked;
  const config = MISSION_TYPES[mission.type];

  useEffect(() => {
    dialog.current
      ?.querySelector(".field-scroll")
      ?.scrollTo({ top: 0, behavior: "instant" });
    dialog.current
      ?.closest(".flow-panel")
      ?.scrollTo({ top: 0, behavior: "instant" });
  }, [isProof]);

  useEffect(() => {
    mounted.current = true;
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
          'button:not([disabled]),summary,a[href],input:not([disabled]):not([tabindex="-1"]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        ) || []),
      ].filter((element) => element.getClientRects().length);
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (!first) return;
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
      mounted.current = false;
      photoRequest.current += 1;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [mission.id]);

  function takePhoto() {
    if (photoLoading) return;
    setPhotoError("");
    fileInput.current?.click();
  }

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const request = ++photoRequest.current;
    setPhotoLoading(true);
    setPhotoError("");
    try {
      const photo = await preparePhoto(file);
      if (mounted.current && photoRequest.current === request)
        dispatch({ type: "SET_PHOTO", photo });
    } catch (error) {
      if (mounted.current && photoRequest.current === request)
        setPhotoError(error.message);
    } finally {
      if (mounted.current && photoRequest.current === request)
        setPhotoLoading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function startIntervention() {
    const code = vehicleCode.trim().toUpperCase();
    if (code !== mission.vehicleId.toUpperCase()) {
      setScanError(
        `Ce véhicule ne correspond pas à la mission. Identifiant attendu : ${mission.vehicleId}.`,
      );
      return;
    }
    setScanError("");
    dispatch({ type: "SCAN_AND_UNLOCK", vehicleId: code });
  }

  function completeIntervention() {
    if (!isUnlocked) return;
    // Legacy saved detail screens may already contain a validated unlock.
    if (activeMission.stage === "detail")
      dispatch({ type: "SET_STAGE", stage: "work" });
    dispatch({ type: "CONFIRM_WORK", confirmed: true });
    // This input is already mounted: opening it here retains the user gesture.
    if (!activeMission.photo) takePhoto();
  }

  function back() {
    if (confirmRelease) {
      setConfirmRelease(false);
      return;
    }
    if (isProof) dispatch({ type: "SET_STAGE", stage: "work" });
    else onClose?.();
  }

  return (
    <section
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Mission ${mission.vehicleId}`}
      className="field-flow"
    >
      <header className="field-flow-header">
        <button
          ref={closeButton}
          type="button"
          className="field-back"
          onClick={back}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {isProof ? "Intervention" : "Missions"}
        </button>
        <span className="field-screen-label">
          {isProof ? "Preuve de dépôt" : "Intervention"}
        </span>
        <details ref={options} className="field-options">
          <summary>Options</summary>
          <div className="field-menu-panel">
            <button
              type="button"
              onClick={() => {
                setConfirmRelease(true);
                if (options.current) options.current.open = false;
              }}
            >
              Libérer la mission
            </button>
          </div>
        </details>
      </header>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        capture="environment"
        onChange={uploadPhoto}
        className="sr-only"
        tabIndex={-1}
        aria-label="Ajouter une photo du véhicule"
      />

      {notice && (
        <p role="status" className="field-notice">
          {notice}
        </p>
      )}
      <div className={isProof ? "field-proof-shell" : "field-scroll"}>
        {confirmRelease && (
          <section
            className="field-release"
            aria-label="Confirmer la libération"
          >
            <h2>Libérer cette mission ?</h2>
            <p>
              La progression et les preuves ajoutées seront effacées. La mission
              restera disponible.
            </p>
            <div className="field-button-row">
              <button
                type="button"
                className="field-secondary"
                onClick={() => setConfirmRelease(false)}
              >
                Garder la mission
              </button>
              <button
                type="button"
                className="field-secondary field-danger"
                onClick={() => {
                  dispatch({ type: "CANCEL_ACTIVE" });
                  onClose?.();
                }}
              >
                Confirmer la libération
              </button>
            </div>
          </section>
        )}

        <div className="field-vehicle">
          <div>
            <p className="field-vehicle-kind">{mission.vehicleKind}</p>
            <h1>{mission.vehicleId}</h1>
            <p>{config.label}</p>
          </div>
          <strong className="field-pay">{currency(mission.pay)}</strong>
        </div>

        {!isProof && (
          <>
            <dl className="field-meta">
              <div>
                <dt>
                  <BatteryCharging size={18} aria-hidden="true" />
                  Batterie
                </dt>
                <dd>
                  <span
                    className={`battery-meter ${mission.battery <= 20 ? "low" : ""}`}
                  >
                    <span className="battery-outline">
                      <span style={{ width: `${mission.battery}%` }} />
                    </span>
                    {mission.battery} %
                  </span>
                </dd>
              </div>
              <div>
                <dt>
                  <Clock3 size={18} aria-hidden="true" />
                  Prise en charge avant
                </dt>
                <dd
                  className={
                    new Date(mission.deadlineAt) < Date.now()
                      ? "urgent"
                      : undefined
                  }
                >
                  {formatParisDate(mission.deadlineAt)}
                  {new Date(mission.deadlineAt) < Date.now() && (
                    <small>Délai dépassé</small>
                  )}
                </dd>
              </div>
            </dl>
            <div
              className="field-route"
              aria-label="Lieu du véhicule et destination"
            >
              <div className="field-route-line">
                <MapPin size={18} aria-hidden="true" />
                <div>
                  <span>Véhicule</span>
                  <strong>{mission.location}</strong>
                </div>
              </div>
              <div className="field-route-line">
                <MapPin size={18} aria-hidden="true" />
                <div>
                  <span>
                    {mission.type === "battery"
                      ? "Intervention sur place"
                      : "Dépôt attendu"}
                  </span>
                  <strong>{mission.destination.label}</strong>
                </div>
              </div>
            </div>
            {isUnlocked ? (
              <section className="field-instructions">
                <p className="field-status" role="status">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Véhicule identifié et ouvert <span>· simulation</span>
                </p>
                <h2>À réaliser</h2>
                <ol>
                  {config.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p id="work-confirmation" className="field-confirmation">
                  En continuant, je confirme avoir réalisé ces 3 points.
                </p>
              </section>
            ) : (
              <p className="field-scan-note">
                Scannez le QR du véhicule pour commencer. Le scan et l’ouverture
                sont simulés dans cette démo.
              </p>
            )}
            <details className="field-disclosure">
              <summary>Création et motif de la mission</summary>
              <p>Créée le {formatParisDate(mission.createdAt)}</p>
              <p>{mission.reason}</p>
              <p>
                {mission.zone === "centre" ? "Centre-ville" : "Périphérie"} ·
                Données fictives
              </p>
            </details>
            {!isUnlocked && (
              <details className="field-disclosure">
                <summary>Tester un autre identifiant</summary>
                <label htmlFor="vehicle-code">Identifiant lu par le scan</label>
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
                />
              </details>
            )}
          </>
        )}
        {isProof && (
          <DepositForm
            mission={mission}
            activeMission={activeMission}
            dispatch={dispatch}
            onFinished={onFinished}
            onTakePhoto={takePhoto}
            photoLoading={photoLoading}
            photoError={photoError}
            controlsDisabled={confirmRelease}
          />
        )}
      </div>

      {!isProof && (
        <div className="field-dock">
          {scanError && (
            <p id="scan-error" className="field-error" role="alert">
              {scanError}
            </p>
          )}
          <button
            type="button"
            className="field-primary"
            disabled={confirmRelease || photoLoading}
            onClick={isUnlocked ? completeIntervention : startIntervention}
            aria-describedby={isUnlocked ? "work-confirmation" : undefined}
          >
            {isUnlocked ? (
              <Camera size={18} aria-hidden="true" />
            ) : (
              <QrCode size={18} aria-hidden="true" />
            )}
            {isUnlocked
              ? activeMission.photo
                ? "Vérifier le dépôt"
                : "Terminé, prendre la photo"
              : "Scanner et ouvrir"}
          </button>
          <p className="field-dock-note">
            {isUnlocked
              ? "Photo du véhicule en place à l’étape suivante"
              : "Simulation du scan QR et du déverrouillage"}
          </p>
        </div>
      )}
    </section>
  );
}
