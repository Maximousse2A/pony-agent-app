import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Send,
  X,
} from "./icons.js";
import { SAMPLE_PHOTO } from "./missionPhoto.js";
import { isValidPhoto, isValidPosition } from "../domain/missions.js";

const REJECTION_REASONS = [
  "Véhicule déposé en dehors de la zone autorisée.",
  "Photo trop floue pour valider le stationnement.",
  "Véhicule inaccessible ou gênant le passage.",
];

export default function DepositForm({
  mission,
  activeMission,
  dispatch,
  onFinished,
  onTakePhoto,
  photoLoading,
  photoError,
  controlsDisabled = false,
}) {
  const [gpsStatus, setGpsStatus] = useState(
    activeMission.position ? "captured" : "loading",
  );
  const [gpsError, setGpsError] = useState("");
  const [scenario, setScenario] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(true),
    gpsRequest = useRef(0),
    submitted = useRef(false);
  const photo = activeMission.photo,
    position = activeMission.position;
  const photoReady = isValidPhoto(photo),
    positionReady = isValidPosition(position);

  function capturePosition() {
    const request = ++gpsRequest.current;
    setGpsStatus("loading");
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsStatus("error");
      setGpsError(
        "La géolocalisation n’est pas disponible dans ce navigateur.",
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (result) => {
        if (!mounted.current || gpsRequest.current !== request) return;
        dispatch({
          type: "SET_POSITION",
          position: {
            lat: result.coords.latitude,
            lng: result.coords.longitude,
            accuracy: result.coords.accuracy,
            simulated: false,
            capturedAt: new Date().toISOString(),
          },
        });
        setGpsStatus("captured");
      },
      (error) => {
        if (!mounted.current || gpsRequest.current !== request) return;
        setGpsStatus("error");
        setGpsError(
          error.code === 1
            ? "Accès à la position refusé."
            : "Position indisponible. Réessayez ou utilisez une position de démo.",
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }

  useEffect(() => {
    mounted.current = true;
    if (!activeMission.position) capturePosition();
    return () => {
      mounted.current = false;
      gpsRequest.current += 1;
    };
  }, []);

  function simulatePosition() {
    gpsRequest.current += 1;
    dispatch({
      type: "SET_POSITION",
      position: {
        lat: mission.destination.lat,
        lng: mission.destination.lng,
        accuracy: 8,
        simulated: true,
        capturedAt: new Date().toISOString(),
      },
    });
    setGpsStatus("captured");
    setGpsError("");
  }

  function submit(event) {
    event.preventDefault();
    if (
      !photoReady ||
      !positionReady ||
      photoLoading ||
      submitting ||
      submitted.current ||
      controlsDisabled
    )
      return;
    submitted.current = true;
    setSubmitting(true);
    dispatch({
      type: "SUBMIT",
      scenario,
      rejectionReason: scenario === "rejected" ? rejectionReason : null,
      completedAt: new Date().toISOString(),
    });
    onFinished?.(scenario);
  }

  const dockLabel = photoLoading
    ? "Préparation de la photo…"
    : !photoReady
      ? "Prendre la photo"
      : submitting
        ? "Envoi…"
        : !positionReady && gpsStatus === "loading"
          ? "Localisation en cours…"
          : "Envoyer le dépôt";

  return (
    <form onSubmit={submit} className="field-proof">
      <div className="field-proof-content">
        <div className="field-proof-destination">
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

        <section className="field-photo">
          <div className="field-section-heading">
            <h2>Photo du véhicule en place</h2>
            {photoReady && (
              <button
                type="button"
                className="field-text-button"
                onClick={onTakePhoto}
                disabled={photoLoading || controlsDisabled}
              >
                Reprendre
              </button>
            )}
          </div>
          <p className="field-photo-guidance">
            Cadrez le véhicule entier et le passage dégagé.
          </p>
          {photoReady ? (
            <div className="field-photo-preview">
              <img
                src={photo.dataUrl}
                alt={
                  photo.simulated
                    ? "Exemple de démonstration : vélo stationné, preuve simulée"
                    : "Photo de fin de mission ajoutée par l’agent"
                }
              />
              <button
                type="button"
                className="field-photo-remove"
                aria-label="Supprimer la photo"
                disabled={controlsDisabled || photoLoading}
                onClick={() => dispatch({ type: "SET_PHOTO", photo: null })}
              >
                <X size={18} aria-hidden="true" />
              </button>
              <span className="field-photo-caption">
                {photo.simulated ? "Exemple simulé" : "Photo ajoutée"}
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="field-photo-empty"
              onClick={onTakePhoto}
              disabled={photoLoading || controlsDisabled}
            >
              <Camera size={32} aria-hidden="true" />
              <span>
                {photoLoading
                  ? "Préparation de la photo…"
                  : "Prendre ou ajouter une photo"}
              </span>
            </button>
          )}
          {photoError && (
            <p className="field-error" role="alert">
              {photoError}
            </p>
          )}
        </section>

        <section className="field-gps" aria-label="Position de dépôt">
          <div className="field-gps-heading">
            <LocateFixed size={18} aria-hidden="true" />
            <p role="status">
              {positionReady
                ? position.simulated
                  ? "Position de démo enregistrée"
                  : "Position GPS capturée"
                : gpsStatus === "loading"
                  ? "Capture automatique du GPS…"
                  : "Position GPS manquante"}
            </p>
            {positionReady ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : gpsStatus === "loading" ? (
              <LoaderCircle
                size={18}
                className="field-loading"
                aria-hidden="true"
              />
            ) : (
              <AlertCircle size={18} aria-hidden="true" />
            )}
          </div>
          {positionReady && (
            <details className="field-gps-details">
              <summary>Voir la position</summary>
              <p>
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)} · ±{" "}
                {Math.round(position.accuracy || 0)} m
              </p>
              <p>
                {position.simulated
                  ? `Position simulée : ${mission.destination.label}`
                  : "Coordonnées réelles conservées. Le contrôle de la zone reste simulé."}
              </p>
              <button
                type="button"
                className="field-text-button"
                onClick={capturePosition}
                disabled={controlsDisabled}
              >
                Actualiser le GPS
              </button>
            </details>
          )}
          {gpsError && (
            <div className="field-gps-fallback">
              <p className="field-error" role="alert">
                {gpsError}
              </p>
              <div className="field-button-row">
                <button
                  type="button"
                  className="field-secondary"
                  onClick={capturePosition}
                  disabled={controlsDisabled}
                >
                  Réessayer le GPS
                </button>
                <button
                  type="button"
                  className="field-secondary"
                  onClick={simulatePosition}
                  disabled={controlsDisabled}
                >
                  Utiliser le GPS de démo
                </button>
              </div>
            </div>
          )}
        </section>

        <details className="field-demo">
          <summary>Outils de démo</summary>
          <p>Ces options simulent les preuves et la décision du dépôt.</p>
          <div className="field-button-row">
            <button
              type="button"
              className="field-secondary"
              disabled={photoLoading || controlsDisabled}
              onClick={() =>
                dispatch({
                  type: "SET_PHOTO",
                  photo: {
                    dataUrl: SAMPLE_PHOTO,
                    name: "Illustration de démonstration",
                    simulated: true,
                  },
                })
              }
            >
              Photo de démo
            </button>
            <button
              type="button"
              className="field-secondary"
              onClick={simulatePosition}
              disabled={controlsDisabled}
            >
              GPS de démo
            </button>
          </div>
          <fieldset disabled={controlsDisabled}>
            <legend>Résultat simulé</legend>
            {[
              ["pending", "En attente de contrôle"],
              ["approved", "Approuvée"],
              ["rejected", "Rejetée"],
            ].map(([value, label]) => (
              <label key={value} className="field-demo-option">
                <input
                  type="radio"
                  name="validation-scenario"
                  value={value}
                  checked={scenario === value}
                  onChange={() => setScenario(value)}
                />
                <span>{label}</span>
              </label>
            ))}
            {scenario === "rejected" && (
              <div>
                <label htmlFor="rejection-reason">Motif de rejet simulé</label>
                <select
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                >
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </select>
                <p className="field-error">
                  Une mission rejetée n’est pas rémunérée.
                </p>
              </div>
            )}
          </fieldset>
        </details>
      </div>
      <div className="field-dock">
        <p className="field-dock-note">
          {!photoReady
            ? "Une photo est nécessaire pour envoyer le dépôt"
            : !positionReady
              ? "Une position GPS est nécessaire pour envoyer le dépôt"
              : scenario === "pending"
                ? "Le dépôt sera envoyé pour contrôle"
                : `Résultat de démo : ${scenario === "approved" ? "approuvé" : "rejeté"}`}
        </p>
        <button
          type={photoReady ? "submit" : "button"}
          className="field-primary"
          onClick={photoReady ? undefined : onTakePhoto}
          disabled={
            controlsDisabled ||
            photoLoading ||
            submitting ||
            (photoReady && !positionReady)
          }
        >
          {photoReady ? (
            <Send size={18} aria-hidden="true" />
          ) : (
            <Camera size={18} aria-hidden="true" />
          )}
          {dockLabel}
        </button>
      </div>
    </form>
  );
}
