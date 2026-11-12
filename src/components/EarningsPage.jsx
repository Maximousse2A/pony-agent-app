import { useState } from "react";
import { Wallet, CheckCircle2, ArrowUpRight, History } from "./icons.js";
import {
  MISSION_TYPES,
  currency as money,
  STATUS_LABELS as labelStatus,
} from "../domain/missions.js";
import {
  formatParisDate as date,
  isParisToday as isToday,
  isParisThisWeek as isThisWeek,
  parisDateKey,
  parisWeekDays,
} from "../domain/date.js";
import { typeIcons } from "./MapView.jsx";

const total = (rows) => rows.reduce((sum, row) => sum + row.pay, 0);

export default function EarningsPage({ history }) {
  const [period, setPeriod] = useState("week");
  const rows = history
    .filter((m) =>
      period === "today" ? isToday(m.completedAt) : isThisWeek(m.completedAt),
    )
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const approved = rows.filter((m) => m.status === "approved"),
    pending = rows.filter((m) => m.status === "pending"),
    rejected = rows.filter((m) => m.status === "rejected");
  const chart = parisWeekDays().map((d) => ({
    ...d,
    amount: total(
      history.filter(
        (m) => m.status === "approved" && parisDateKey(m.completedAt) === d.key,
      ),
    ),
  }));
  const max = Math.max(...chart.map((d) => d.amount), 10);
  return (
    <section className="content-page earnings-page">
      <div className="page-heading pony-page-heading">
        <div>
          <div className="eyebrow">UNE VISION CLAIRE DE VOTRE ACTIVITÉ</div>
          <h1 className="font-black">Le fruit de vos missions.</h1>
          <p>Des montants transparents, du dépôt à l’approbation.</p>
        </div>
        <div className="page-heading-icon">
          <Wallet size={27} />
        </div>
      </div>
      <div className="filter-row">
        <button
          className={`filter-chip ${period === "today" ? "selected" : ""}`}
          aria-pressed={period === "today"}
          onClick={() => setPeriod("today")}
        >
          Aujourd’hui
        </button>
        <button
          className={`filter-chip ${period === "week" ? "selected" : ""}`}
          aria-pressed={period === "week"}
          onClick={() => setPeriod("week")}
        >
          Cette semaine
        </button>
      </div>
      <div className="earnings-grid">
        <div className="earnings-hero">
          <div className="earnings-hero-top">
            <span>
              <CheckCircle2 size={17} />
              Revenus approuvés
            </span>
            <ArrowUpRight size={25} />
          </div>
          <strong>{money(total(approved))}</strong>
          <span>
            {approved.length} missions validées{" "}
            {period === "today" ? "aujourd’hui" : "depuis lundi"}
          </span>
          <div className="earnings-hero-foot">
            Montants de démonstration · aucun versement réel
          </div>
        </div>
        <div className="earnings-side">
          <div className="summary-card">
            <span>En attente d’approbation</span>
            <strong>{money(total(pending))}</strong>
            <small>{pending.length} missions · non acquises</small>
          </div>
          <div className="summary-card">
            <span>Non rémunérées</span>
            <strong>{money(total(rejected))}</strong>
            <small>
              {rejected.length} missions rejetées · exclues des revenus
            </small>
          </div>
        </div>
      </div>
      <div className="chart-card">
        <div className="section-title">
          <h2>Votre semaine en un regard</h2>
          <span>Revenus approuvés</span>
        </div>
        <div
          className="bar-chart"
          role="img"
          aria-label={`Revenus approuvés cette semaine : ${chart.map((d) => `${d.day} ${money(d.amount)}`).join(", ")}`}
        >
          {chart.map((d, i) => (
            <div className={`chart-column ${d.today ? "today" : ""}`} key={i}>
              <span>{money(d.amount)}</span>
              <div className="chart-bar-track">
                <div
                  className="chart-bar"
                  style={{ height: `${Math.max((d.amount / max) * 100, 2)}%` }}
                />
              </div>
              <small>{d.day}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">
        <h2>Détail des gains</h2>
        <span>
          {rows.length} missions ·{" "}
          {period === "today" ? "aujourd’hui" : "cette semaine"}
        </span>
      </div>
      <div className="history-list" aria-label="Détail des gains de la période">
        {rows.length === 0 ? (
          <div className="empty-state">
            <History size={28} />
            <h3>Aucune mission sur cette période</h3>
            <p>Vos prochaines interventions apparaîtront ici après le dépôt.</p>
          </div>
        ) : (
          rows.map((m) => {
            const Icon = typeIcons[m.type];
            return (
              <article className="history-item" key={m.id}>
                <div className="history-row">
                  <span className={`mission-icon ${m.type}`}>
                    <Icon size={20} />
                  </span>
                  <span className="history-main">
                    <strong>
                      {m.vehicleId} · {MISSION_TYPES[m.type].shortLabel}
                    </strong>
                    <span>{date(m.completedAt)}</span>
                  </span>
                  <span className={`status-pill ${m.status}`}>
                    {labelStatus[m.status]}
                  </span>
                  <strong
                    className={m.status === "rejected" ? "unpaid" : ""}
                    aria-label={`${m.status === "pending" ? "Montant en attente" : m.status === "rejected" ? "Montant payé" : "Montant approuvé"} : ${money(m.status === "rejected" ? 0 : m.pay)}`}
                  >
                    {money(m.status === "rejected" ? 0 : m.pay)}
                  </strong>
                </div>
              </article>
            );
          })
        )}
      </div>
      <p className="footnote">
        Les montants en attente restent à valider. Les missions rejetées sont
        affichées à 0 € et exclues des revenus approuvés.
      </p>
      <div className="section-title">
        <h2>Barème par mission</h2>
        <span>Montants fictifs du cas</span>
      </div>
      <div className="rates-table">
        <div className="rates-row rates-head">
          <span>Mission</span>
          <span>Centre</span>
          <span>Périphérie</span>
        </div>
        {Object.entries(MISSION_TYPES).map(([key, type]) => (
          <div className="rates-row" key={key}>
            <span>{type.label}</span>
            <strong>{money(type.pay.centre)}</strong>
            <strong>{money(type.pay.peripherie)}</strong>
          </div>
        ))}
      </div>
      <p className="footnote">
        Les montants reflètent le barème du cas, utilisé comme rémunération dans
        cette démo. Le contrat réel de rémunération des agents reste à préciser.
        La pénalité mensuelle de 5 % concerne la facture du prestataire.
      </p>
    </section>
  );
}
