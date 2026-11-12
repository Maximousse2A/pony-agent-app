import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Navigation,
  Send,
  X,
} from './icons.js';

const SAMPLE_PHOTO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"><rect width="900" height="560" fill="#e8eeea"/><path d="M0 310H900V560H0Z" fill="#c9d1cb"/><path d="M0 355H900M0 445H900M100 310V560M310 310V560M550 310V560M790 310V560" stroke="#b4bdb6" stroke-width="3"/><rect x="60" y="50" width="250" height="260" rx="8" fill="#d4ded4"/><rect x="80" y="70" width="210" height="200" rx="5" fill="#a4bba9"/><rect x="650" y="70" width="45" height="245" fill="#819c84"/><circle cx="675" cy="75" r="80" fill="#a0b79f"/><circle cx="320" cy="370" r="85" fill="none" stroke="#243a32" stroke-width="13"/><circle cx="610" cy="370" r="85" fill="none" stroke="#243a32" stroke-width="13"/><path d="M320 370L404 252L492 370H320L433 297H588L610 370M404 252L387 222H352M588 297L566 212L611 198M492 370L535 246" fill="none" stroke="#176e49" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M365 220H421" stroke="#243a32" stroke-width="15" stroke-linecap="round"/><rect x="431" y="282" width="76" height="36" rx="12" fill="#d4f56b"/><path d="M534 370L535 456" stroke="#243a32" stroke-width="8"/><rect x="30" y="490" width="840" height="42" rx="10" fill="#173e2e"/><text x="450" y="518" font-family="Arial,sans-serif" font-size="20" fill="white" text-anchor="middle">ILLUSTRATION DE DÉMONSTRATION · PHOTO SIMULÉE</text></svg>')}`;

const REJECTION_REASONS = [
  "Véhicule déposé en dehors de la zone autorisée.",
  "Photo trop floue pour valider le stationnement.",
  "Véhicule inaccessible ou gênant le passage.",
];

async function preparePhoto(file) {
  if (!file.type.startsWith("image/"))
    throw new Error("Choisissez un fichier image (JPEG, PNG ou WebP).");
  if (file.size > 15 * 1024 * 1024)
    throw new Error(
      "Cette photo est trop volumineuse. Choisissez une image de moins de 15 Mo.",
    );
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("La photo n’a pas pu être lue. Réessayez."));
    reader.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const loadedImage = new Image();
    loadedImage.onload = () => resolve(loadedImage);
    loadedImage.onerror = () =>
      reject(
        new Error(
          "Cette image n’a pas pu être ouverte. Essayez une photo JPEG ou PNG.",
        ),
      );
    loadedImage.src = dataUrl;
  });
  const scale = Math.min(
    1,
    960 / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("La photo n’a pas pu être préparée sur cet appareil.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.72),
    name: file.name,
    simulated: false,
  };
}

export default function DepositForm({
  mission,
  activeMission,
  dispatch,
  onFinished,
}) {
  const [gpsStatus, setGpsStatus] = useState(
    activeMission.position ? "captured" : "loading",
  );
  const [gpsError, setGpsError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [scenario, setScenario] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(true);
  const gpsRequest = useRef(0);
  const submitted = useRef(false);
  const fileInput = useRef(null);
  const photo = activeMission.photo;
  const position = activeMission.position;

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
            ? "Accès à la position refusé. Vous pouvez utiliser le GPS de démonstration."
            : "Position indisponible. Réessayez ou utilisez le GPS de démonstration.",
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

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    setPhotoLoading(true);
    try {
      const prepared = await preparePhoto(file);
      if (mounted.current) dispatch({ type: "SET_PHOTO", photo: prepared });
    } catch (error) {
      if (mounted.current) setPhotoError(error.message);
    } finally {
      if (mounted.current) setPhotoLoading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function submit(event) {
    event.preventDefault();
    if (!photo || !position || submitting || submitted.current) return;
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

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <Camera
            size={23}
            className="mt-0.5 shrink-0 text-emerald-800"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-slate-950">
              Photo de fin de mission
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Montrez le véhicule et son environnement. Cette preuve est
              obligatoire pour la validation.
            </p>
          </div>
        </div>
        {photo ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img
              src={photo.dataUrl}
              alt={
                photo.simulated
                  ? "Illustration de démonstration : vélo stationné, preuve photo simulée"
                  : "Photo de fin de mission ajoutée par l’agent"
              }
              className="max-h-64 w-full object-contain"
            />
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_PHOTO", photo: null })}
              aria-label="Supprimer la photo"
              className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <p className="bg-white px-4 py-3 text-xs font-medium text-slate-500">
              {photo.simulated
                ? "Photo de démonstration · Illustration simulée"
                : photo.name}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center">
            <ImagePlus
              size={31}
              className="mx-auto mb-2 text-slate-400"
              aria-hidden="true"
            />
            <p className="text-sm text-slate-500">
              Véhicule visible, stationnement dégagé
            </p>
          </div>
        )}
        <input
          ref={fileInput}
          id="deposit-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          onChange={uploadPhoto}
          className="sr-only"
          tabIndex={-1}
          aria-label="Ajouter une photo du véhicule"
        />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={photoLoading}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            {photoLoading ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Camera size={17} aria-hidden="true" />
            )}
            {photoLoading
              ? "Préparation de la photo…"
              : "Prendre / ajouter une photo"}
          </button>
          <button
            type="button"
            disabled={photoLoading}
            onClick={() => {
              setPhotoError("");
              dispatch({
                type: "SET_PHOTO",
                photo: {
                  dataUrl: SAMPLE_PHOTO,
                  name: "Illustration de démonstration",
                  simulated: true,
                },
              });
            }}
            className="min-h-12 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-60"
          >
            Utiliser la photo de démo
          </button>
        </div>
        {photoError && (
          <p role="alert" className="mt-3 text-sm leading-6 text-red-700">
            {photoError}
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex gap-3">
          <LocateFixed
            size={23}
            className="mt-0.5 shrink-0 text-emerald-800"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-slate-950">Position de dépôt</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Le GPS est demandé automatiquement à l’ouverture de cet écran.
            </p>
          </div>
        </div>
        {gpsStatus === "loading" && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"
          >
            <LoaderCircle
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />{" "}
            Recherche de votre position…
          </p>
        )}
        {position && (
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p
              role="status"
              className="flex items-center gap-2 text-sm font-semibold text-emerald-800"
            >
              <CheckCircle2 size={18} aria-hidden="true" />{" "}
              {position.simulated
                ? "Position de démonstration enregistrée"
                : "Position GPS capturée"}
            </p>
            <p className="mt-2 font-mono text-xs text-emerald-900">
              {position.lat.toFixed(5)}, {position.lng.toFixed(5)} · ±{" "}
              {Math.round(position.accuracy || 0)} m
            </p>
            <p className="mt-2 text-xs leading-5 text-emerald-800">
              {position.simulated
                ? `Position simulée : ${mission.destination.label}`
                : "Position réelle conservée dans la preuve. Les règles de dépôt restent simulées dans ce prototype."}
            </p>
          </div>
        )}
        {gpsError && (
          <p
            role="alert"
            className="mt-3 flex gap-2 text-sm leading-6 text-amber-800"
          >
            <AlertCircle
              size={18}
              className="mt-1 shrink-0"
              aria-hidden="true"
            />
            {gpsError}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {gpsStatus !== "loading" && (
            <button
              type="button"
              onClick={capturePosition}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Navigation size={15} aria-hidden="true" />{" "}
              {position ? "Actualiser le GPS" : "Réessayer le GPS"}
            </button>
          )}
          {(!position || !position.simulated) && (
            <button
              type="button"
              onClick={simulatePosition}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              <MapPin size={15} aria-hidden="true" /> Utiliser le GPS de démo
            </button>
          )}
        </div>
      </div>

      <fieldset className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <legend className="sr-only">Résultat simulé de validation</legend>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-slate-950">Validation du dépôt</h2>
          <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Mode démo
          </span>
        </div>
        <p className="mb-4 text-sm leading-6 text-slate-500">
          Choisissez le résultat pour explorer les trois parcours. Aucun
          contrôle réel n’est effectué.
        </p>
        <div className="space-y-2">
          {[
            [
              "pending",
              "En attente de contrôle",
              "La mission attend la validation du dépôt.",
            ],
            [
              "approved",
              "Approuvée",
              "La rémunération est ajoutée aux gains validés.",
            ],
            [
              "rejected",
              "Rejetée",
              "La mission n’est pas payée, avec un motif expliqué.",
            ],
          ].map(([value, label, description]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${scenario === value ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <input
                type="radio"
                name="validation-scenario"
                value={value}
                checked={scenario === value}
                onChange={() => setScenario(value)}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-900"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {description}
                </span>
              </span>
            </label>
          ))}
        </div>
        {scenario === "rejected" && (
          <div className="mt-4">
            <label
              htmlFor="rejection-reason"
              className="text-xs font-semibold text-slate-600"
            >
              Motif de rejet simulé
            </label>
            <div className="relative">
              <select
                id="rejection-reason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                className="mt-2 min-h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-3 pr-9 text-sm leading-6 text-slate-800"
              >
                {REJECTION_REASONS.map((reason) => (
                  <option key={reason}>{reason}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-6 text-slate-500"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-xs leading-5 text-red-700">
              Une mission rejetée n’est pas rémunérée.
            </p>
          </div>
        )}
      </fieldset>

      {(!photo || !position) && (
        <p className="text-center text-xs leading-5 text-slate-500">
          Ajoutez{" "}
          {!photo && !position
            ? "une photo et une position GPS"
            : !photo
              ? "une photo"
              : "une position GPS"}{" "}
          pour envoyer la mission.
        </p>
      )}
      <button
        type="submit"
        disabled={!photo || !position || photoLoading || submitting}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-5 py-4 font-bold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        <Send size={18} aria-hidden="true" />
        {submitting ? "Envoi…" : "Terminer et envoyer la mission"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-400">
        Photos et coordonnées restent dans le navigateur de cet appareil.
      </p>
    </form>
  );
}
