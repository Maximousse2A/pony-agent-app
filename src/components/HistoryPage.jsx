import { useState } from "react";
import { History, MapPin, ChevronRight, AlertCircle, Check } from "./icons.js";
import {
  MISSION_TYPES,
  currency as money,
  STATUS_LABELS as labelStatus,
} from "../domain/missions.js";
import { formatParisDate as date } from "../domain/date.js";
import { typeIcons } from "./MapView.jsx";

export default function HistoryPage({ history, dispatch, filter, setFilter }) {
  const [expanded, setExpanded] = useState(null);
  const rows = history
    .filter((m) => filter === "all" || m.status === filter)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  return (
    <section className="content-page history-page">
      <div className="page-heading pony-page-heading">
        <div>
          <div className="eyebrow">CHAQUE INTERVENTION COMPTE</div>
          <h1 className="font-black">Vos missions, en détail.</h1>
          <p>Retrouvez vos dépôts et leur statut de validation.</p>
        </div>
        <div className="page-heading-icon">
          <History size={27} />
        </div>
      </div>
      <div className="summary-grid three">
        {["pending", "approved", "rejected"].map((status) => (
          <div className="summary-card" key={status}>
            <span className={`status-dot ${status}`} />
            <span>
              {status === "pending"
                ? "En attente"
                : status === "approved"
                  ? "Approuvées"
                  : "Rejetées"}
            </span>
            <strong>
              {history.filter((m) => m.status === status).length}
              <small>missions</small>
            </strong>
          </div>
        ))}
      </div>
      <div className="section-title">
        <h2>Historique des interventions</h2>
        <span>{history.length} missions</span>
      </div>
      <div className="filter-row" aria-label="Filtrer l’historique">
        {[
          ["all", "Toutes"],
          ["pending", "En attente"],
          ["approved", "Approuvées"],
          ["rejected", "Rejetées"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "filter-chip selected" : "filter-chip"}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="history-list">
        {rows.length === 0 ? (
          <div className="empty-state">
            <History size={28} />
            <h3>Aucune mission ici pour le moment</h3>
            <p>
              Les missions correspondantes apparaîtront après votre prochain
              dépôt.
            </p>
          </div>
        ) : (
          rows.map((m) => {
            const Icon = typeIcons[m.type];
            return (
              <article className="history-item" key={m.id}>
                <button
                  className="history-row"
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  aria-expanded={expanded === m.id}
                >
                  <span className={`mission-icon ${m.type}`}>
                    <Icon size={20} />
                  </span>
                  <span className="history-main">
                    <strong>{MISSION_TYPES[m.type].label}</strong>
                    <span>
                      {m.vehicleId} · {date(m.completedAt)}
                    </span>
                  </span>
                  <span className={`status-pill ${m.status}`}>
                    {labelStatus[m.status]}
                  </span>
                  <strong className={m.status === "rejected" ? "unpaid" : ""}>
                    {money(m.status === "rejected" ? 0 : m.pay)}
                  </strong>
                  <ChevronRight
                    className={expanded === m.id ? "rotate" : ""}
                    size={17}
                  />
                </button>
                {expanded === m.id && (
                  <div className="history-detail">
                    <p>
                      <MapPin size={15} />
                      {m.location} → {m.destination.label}
                    </p>
                    <p>
                      <strong>Création :</strong> {date(m.createdAt)} ·{" "}
                      {m.reason}
                    </p>
                    {m.photo?.dataUrl && (
                      <img
                        src={m.photo.dataUrl}
                        alt={`Preuve de dépôt ${m.vehicleId}${m.photo.simulated ? " (exemple simulé)" : ""}`}
                        className="evidence-photo"
                      />
                    )}
                    <p className="muted">
                      {m.photo?.simulated ? "Photo de démonstration. " : ""}
                      {m.position
                        ? `GPS ${m.position.simulated ? "simulé" : "capturé"} : ${m.position.lat.toFixed(5)}, ${m.position.lng.toFixed(5)}`
                        : "Position non conservée dans cet exemple historique."}
                    </p>
                    {m.status === "rejected" && (
                      <div className="inline-alert">
                        <AlertCircle size={18} />
                        <span>
                          <strong>Mission non rémunérée.</strong>{" "}
                          {m.rejectionReason}
                        </span>
                      </div>
                    )}
                    {m.status === "pending" && (
                      <div className="review-box">
                        <p>
                          <strong>Simulation de la supervision</strong>
                          <br />
                          Choisissez une décision pour tester son impact sur les
                          revenus.
                        </p>
                        <div className="button-row">
                          <button
                            className="small-button dark"
                            onClick={() =>
                              dispatch({
                                type: "REVIEW",
                                historyId: m.id,
                                status: "approved",
                              })
                            }
                          >
                            <Check size={15} />
                            Approuver
                          </button>
                          <button
                            className="small-button"
                            onClick={() =>
                              dispatch({
                                type: "REVIEW",
                                historyId: m.id,
                                status: "rejected",
                                rejectionReason:
                                  "Photo de dépôt non exploitable (scénario de démonstration).",
                              })
                            }
                          >
                            Rejeter · photo non exploitable
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
      <p className="footnote">
        Les validations sont simulées. Une mission rejetée n’est pas payée.
      </p>
    </section>
  );
}
