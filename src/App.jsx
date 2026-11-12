import { useEffect, useReducer, useState } from "react";
import {
  Map,
  List,
  Wallet,
  History,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  X,
  CircleHelp,
  Clock3,
  MapPin,
  Bike,
  SlidersHorizontal,
  CheckCircle2,
  FileDown,
} from './components/icons.js';
import {
  reducer,
  MISSION_TYPES,
  currency as money,
} from "./domain/missions.js";
import { loadState, saveState } from "./domain/storage.js";
import { isParisToday as isToday } from "./domain/date.js";
import MissionFlow from "./components/MissionFlow.jsx";
import HistoryPage from "./components/HistoryPage.jsx";
import EarningsPage from "./components/EarningsPage.jsx";
import MapView, { typeIcons } from "./components/MapView.jsx";

const total = (rows) => rows.reduce((sum, row) => sum + row.pay, 0);
function timeLeft(value, now) {
  const mins = Math.ceil((new Date(value) - now) / 60000);
  if (mins <= 0) return "Délai dépassé";
  return mins >= 60
    ? `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, "0")}`
    : `${mins} min`;
}

function Brand() {
  return (
    <div className="brand">
      <span>
        pony<span className="brand-period">.</span>
      </span>
      <span className="brand-caption">TERRAIN</span>
    </div>
  );
}
function MissionCard({ mission, now, onSelect, active }) {
  const Icon = typeIcons[mission.type];
  const urgent = new Date(mission.deadlineAt) - now < 3600000;
  return (
    <button
      className={`mission-card ${active ? "active" : ""}`}
      onClick={() => onSelect(mission)}
    >
      <div className="mission-card-top">
        <span className={`mission-icon ${mission.type}`}>
          <Icon size={20} />
        </span>
        <span className="mission-card-title">
          <strong>{MISSION_TYPES[mission.type].label}</strong>
          <span>
            {mission.vehicleId} <span>·</span> {mission.vehicleKind}
          </span>
        </span>
        <span className="mission-pay">{money(mission.pay)}</span>
      </div>
      <div className="mission-location">
        <MapPin size={14} />
        <span>{mission.location}</span>
        <ChevronRight size={16} />
      </div>
      <div className="mission-card-bottom">
        <span className={urgent ? "deadline urgent" : "deadline"}>
          <Clock3 size={12} />
          {timeLeft(mission.deadlineAt, now)}
        </span>
        <span>{mission.zone === "centre" ? "Centre-ville" : "Périphérie"}</span>
        {active && <span className="active-badge">En cours</span>}
      </div>
    </button>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [page, setPage] = useState("missions");
  const [filter, setFilter] = useState("all");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [view, setView] = useState("map");
  const [now, setNow] = useState(Date.now());
  const [sort, setSort] = useState("deadline");
  const [showHelp, setShowHelp] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const [showFlow, setShowFlow] = useState(Boolean(state.activeMission));
  useEffect(() => {
    setStorageFailed(!saveState(state));
  }, [state]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!showHelp && !showReset) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const modal = document.querySelector(".info-modal");
    const handler = (event) => {
      if (event.key === "Escape") {
        setShowHelp(false);
        setShowReset(false);
      }
      if (event.key === "Tab") {
        const items = modal?.querySelectorAll(
          "button:not(:disabled), input, select, a[href]",
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handler);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [showHelp, showReset]);
  const visible = state.missions
    .filter((m) => filter === "all" || m.type === filter)
    .sort((a, b) =>
      sort === "pay"
        ? b.pay - a.pay
        : new Date(a.deadlineAt) - new Date(b.deadlineAt),
    );
  const active = state.missions.find(
    (m) => m.id === state.activeMission?.missionId,
  );
  const todayRows = state.history.filter((m) => isToday(m.completedAt));
  const availableTotal = total(state.missions);
  const select = (mission) => {
    if (active && active.id !== mission.id) {
      if (state.activeMission.stage === "detail") {
        dispatch({ type: "CANCEL_ACTIVE" });
      } else {
        setShowFlow(true);
        return;
      }
    }
    dispatch({ type: "SELECT", missionId: mission.id });
    setShowFlow(true);
  };
  const navigate = (key) => {
    setPage(key);
    setShowFlow(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const exportHistory = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), demo: true, ...state },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pony-demo-missions.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const nav = [
    ["missions", Map, "Missions"],
    ["history", History, "Historique"],
    ["earnings", Wallet, "Revenus"],
  ];
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Brand />
        <div className="workspace-label">VOTRE ESPACE AGENT</div>
        <nav aria-label="Navigation principale">
          {nav.map(([key, Icon, label]) => (
            <button
              key={key}
              className={page === key ? "nav-item selected" : "nav-item"}
              onClick={() => navigate(key)}
              aria-current={page === key ? "page" : undefined}
            >
              <Icon size={20} />
              {label}
              {key === "missions" && <span>{state.missions.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="shift-card">
            <span className="live-dot" />
            <strong>Prêt pour le terrain.</strong>
            <p>
              Une ville qui bouge,
              <br />
              grâce à vous.
            </p>
            <Bike size={50} strokeWidth={1.2} />
          </div>
          <button className="sidebar-link" onClick={() => setShowHelp(true)}>
            <CircleHelp size={17} /> Guide de démonstration
            <ArrowUpRight size={14} />
          </button>
          <button className="sidebar-link" onClick={() => setShowReset(true)}>
            <RotateCcw size={16} /> Réinitialiser la démo
          </button>
          <div className="agent-profile">
            <div className="avatar">AM</div>
            <div>
              <strong>Alex Martin</strong>
              <span>Agent terrain · profil fictif</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="app-header">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="desktop-breadcrumb">
            Espace agent <ChevronRight size={14} />{" "}
            <strong>
              {page === "missions"
                ? "Missions disponibles"
                : page === "history"
                  ? "Historique"
                  : "Mes revenus"}
            </strong>
          </div>
          <div className="header-right">
            <span className="demo-badge">DÉMO</span>
            <span className="service-pill">
              <span className="live-dot" /> En service
            </span>
            <button
              className="mobile-help icon-button"
              aria-label="Guide de démonstration"
              onClick={() => setShowHelp(true)}
            >
              <CircleHelp size={21} />
            </button>
            <span className="header-avatar avatar">AM</span>
          </div>
        </header>
        {storageFailed && (
          <div className="storage-warning" role="alert">
            La sauvegarde locale est indisponible. Votre progression reste
            disponible tant que cet onglet reste ouvert. Exportez vos données
            avant de le fermer.
          </div>
        )}
        <main id="main-content">
          {page === "missions" ? (
            <div className="missions-page">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">SUR LE TERRAIN, À ANGERS</div>
                  <h1>
                    On remet la ville en mouvement
                    <span className="heading-period">.</span>
                  </h1>
                  <p>Votre prochaine mission est au coin de la rue.</p>
                </div>
                <div className="date-label">
                  <span className="live-dot" />
                  {new Date(now).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    timeZone: "Europe/Paris",
                  })}
                </div>
              </div>
              <div className="mission-stats">
                <div>
                  <span className="stat-icon">
                    <MapPin size={17} />
                  </span>
                  <strong>{state.missions.length}</strong>
                  <span>missions disponibles</span>
                </div>
                <div>
                  <span className="stat-icon">
                    <Wallet size={17} />
                  </span>
                  <strong>{money(availableTotal)}</strong>
                  <span>à réaliser</span>
                </div>
                <div>
                  <span className="stat-icon">
                    <CheckCircle2 size={17} />
                  </span>
                  <strong>
                    {todayRows.filter((m) => m.status === "approved").length}
                  </strong>
                  <span>approuvées aujourd’hui</span>
                </div>
              </div>
              {active && (
                <button
                  className="resume-banner"
                  onClick={() => setShowFlow(true)}
                >
                  <span className={`mission-icon ${active.type}`}>
                    {(() => {
                      const Icon = typeIcons[active.type];
                      return <Icon size={20} />;
                    })()}
                  </span>
                  <span>
                    <strong>Une mission vous attend</strong>
                    <span>
                      {active.vehicleId} · Reprendre votre intervention
                    </span>
                  </span>
                  <ArrowRight size={19} />
                </button>
              )}
              <div className="mission-workspace">
                <div className="workspace-toolbar">
                  <div className="filter-row">
                    {[
                      ["all", "Tout"],
                      ...Object.entries(MISSION_TYPES).map(([key, type]) => [
                        key,
                        type.shortLabel || type.label,
                      ]),
                    ].map(([key, label]) => (
                      <button
                        className={`filter-chip ${filter === key ? "selected" : ""}`}
                        aria-pressed={filter === key}
                        key={key}
                        onClick={() => setFilter(key)}
                      >
                        {key !== "all" &&
                          (() => {
                            const Icon = typeIcons[key];
                            return <Icon size={14} />;
                          })()}
                        {label}
                      </button>
                    ))}
                  </div>
                  <div
                    className="view-toggle"
                    aria-label="Affichage des missions"
                  >
                    <button
                      aria-label="Afficher le plan et la liste"
                      aria-pressed={view === "map"}
                      className={view === "map" ? "selected" : ""}
                      onClick={() => setView("map")}
                    >
                      <Map size={17} />
                    </button>
                    <button
                      aria-label="Afficher uniquement la liste"
                      aria-pressed={view === "list"}
                      className={view === "list" ? "selected" : ""}
                      onClick={() => setView("list")}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
                <div
                  className={`workspace-body ${view === "list" ? "list-only" : ""}`}
                >
                  {view === "map" && (
                    <MapView
                      missions={visible}
                      onSelect={select}
                      selectedId={active?.id}
                    />
                  )}
                  <section
                    className="mission-list-panel"
                    aria-label="Liste des missions"
                  >
                    <div className="list-panel-header">
                      <h2>
                        À vous de jouer <span>{visible.length}</span>
                      </h2>
                      <label className="sort-control">
                        <SlidersHorizontal size={14} />
                        <span className="sr-only">Trier les missions</span>
                        <select
                          value={sort}
                          onChange={(e) => setSort(e.target.value)}
                        >
                          <option value="deadline">Délai le plus court</option>
                          <option value="pay">Rémunération</option>
                        </select>
                      </label>
                    </div>
                    <div className="mission-cards">
                      {visible.length ? (
                        visible.map((m) => (
                          <MissionCard
                            key={m.id}
                            mission={m}
                            now={now}
                            onSelect={select}
                            active={active?.id === m.id}
                          />
                        ))
                      ) : (
                        <div className="empty-state">
                          <CheckCircle2 size={30} />
                          <h3>Tout est à jour ici.</h3>
                          <p>
                            Choisissez un autre type de mission ou réinitialisez
                            la démo.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
                <div className="workspace-footer">
                  <span>
                    <span className="live-dot" />{" "}
                    {storageFailed
                      ? "Session temporaire"
                      : "Progression enregistrée sur cet appareil"}
                  </span>
                  <span>Données fictives · aucune opération réelle</span>
                </div>
              </div>
              <div className="field-note">
                <span className="note-icon">
                  <Bike size={21} />
                </span>
                <p>
                  <strong>Un véhicule de plus, une ville qui respire.</strong>
                  <br />
                  Sélectionnez une mission pour découvrir les étapes et le lieu
                  de dépôt.
                </p>
                <ArrowUpRight size={22} />
              </div>
            </div>
          ) : page === "history" ? (
            <HistoryPage
              history={state.history}
              dispatch={dispatch}
              filter={historyFilter}
              setFilter={setHistoryFilter}
            />
          ) : (
            <EarningsPage history={state.history} />
          )}
        </main>
        <footer className="app-footer">
          <span>
            pony terrain <span>·</span> Prototype du case study
          </span>
          <button onClick={exportHistory}>
            <FileDown size={14} />
            Exporter mes données de démo
          </button>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Navigation mobile">
        {nav.map(([key, Icon, label]) => (
          <button
            key={key}
            className={page === key ? "selected" : ""}
            aria-current={page === key ? "page" : undefined}
            onClick={() => navigate(key)}
          >
            <Icon size={21} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {showFlow && active && (
        <div className="flow-backdrop">
          <div className="flow-panel">
            <MissionFlow
              key={active.id}
              mission={active}
              activeMission={state.activeMission}
              dispatch={dispatch}
              onClose={() => setShowFlow(false)}
              onFinished={() => {
                setShowFlow(false);
                setPage("history");
                setHistoryFilter("all");
              }}
            />
          </div>
        </div>
      )}
      {showHelp && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelp(false);
          }}
        >
          <section
            className="info-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
          >
            <button
              className="modal-close"
              autoFocus
              aria-label="Fermer le guide"
              onClick={() => setShowHelp(false)}
            >
              <X size={21} />
            </button>
            <div className="eyebrow">BIENVENUE SUR LE TERRAIN</div>
            <h2 id="guide-title">Une démo, de bout en bout.</h2>
            <p>
              Explorez les missions fictives à Angers, puis réalisez une
              intervention en quelques étapes.
            </p>
            <ol className="guide-steps">
              <li>
                <strong>Choisir une mission</strong>
                <span>
                  Consultez le motif, la date de création, le délai et le
                  montant.
                </span>
              </li>
              <li>
                <strong>Scanner et intervenir</strong>
                <span>
                  Le scan et le déverrouillage sont simulés. Votre progression
                  est sauvegardée.
                </span>
              </li>
              <li>
                <strong>Déposer et vérifier</strong>
                <span>
                  Ajoutez une photo ou un exemple, autorisez le GPS ou
                  choisissez une position simulée. Testez un dépôt accepté, en
                  attente ou rejeté.
                </span>
              </li>
              <li>
                <strong>Suivre vos revenus</strong>
                <span>
                  Les rejets ne sont pas payés. Vous pouvez simuler la
                  supervision depuis l’historique.
                </span>
              </li>
            </ol>
            <div className="guide-note">
              Vos preuves restent sur cet appareil. Réinitialisez la démo pour
              rejouer les parcours.
            </div>
            <div className="button-row">
              <button
                className="primary-button"
                onClick={() => setShowHelp(false)}
              >
                C’est parti <ArrowRight size={17} />
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  setShowHelp(false);
                  setShowReset(true);
                }}
              >
                <RotateCcw size={16} />
                Reset demo
              </button>
            </div>
          </section>
        </div>
      )}
      {showReset && (
        <div className="modal-backdrop">
          <section
            className="info-modal small"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <div className="eyebrow">REPARTIR DE ZÉRO</div>
            <h2 id="reset-title">Réinitialiser la démo ?</h2>
            <p>
              Les missions, les preuves et les revenus de cet appareil seront
              remplacés par les exemples initiaux. Exportez vos données si vous
              souhaitez les conserver.
            </p>
            <div className="button-row">
              <button
                className="secondary-button"
                autoFocus
                onClick={() => setShowReset(false)}
              >
                Annuler
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  dispatch({ type: "RESET" });
                  setNow(Date.now());
                  setShowReset(false);
                  setShowFlow(false);
                  setPage("missions");
                  setFilter("all");
                }}
              >
                Réinitialiser
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
