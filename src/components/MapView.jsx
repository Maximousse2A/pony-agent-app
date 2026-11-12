import { useState } from "react";
import {
  BatteryCharging,
  MoveUpRight,
  Truck,
  Wrench,
  Plus,
  Minus,
  LocateFixed,
  Navigation,
} from "./icons.js";

export const typeIcons = {
  battery: BatteryCharging,
  relocation: MoveUpRight,
  recharge: Truck,
  workshop: Wrench,
};
export const typeColors = {
  battery: "#321ed3",
  relocation: "#321e64",
  recharge: "#fe6d80",
  workshop: "#00ffff",
};

// A self-contained schematic: geolocated markers, no external tiles or routing claims.
export default function MapView({ missions, onSelect, selectedId }) {
  const [zoom, setZoom] = useState(1);
  const project = (mission) => ({
    x: ((mission.lng + 0.605) / 0.08) * 1000,
    y: ((47.5 - mission.lat) / 0.06) * 700,
  });
  const width = 1000 / zoom,
    height = 700 / zoom;
  return (
    <div
      className="mission-map"
      aria-label="Plan schématique des missions à Angers"
    >
      <svg
        className="map-drawing"
        viewBox={`${500 - width / 2} ${350 - height / 2} ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Plan de démonstration : la Maine, centre-ville et quartiers d’Angers"
      >
        <defs>
          <pattern
            id="blocks"
            width="120"
            height="100"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-17)"
          >
            <rect width="120" height="100" fill="#d9d1e8" />
            <rect x="9" y="8" width="93" height="72" rx="7" fill="#e8e2ef" />
            <rect x="20" y="18" width="32" height="26" rx="3" fill="#cfc5df" />
            <rect x="59" y="18" width="32" height="48" rx="3" fill="#d4cbe3" />
          </pattern>
          <pattern
            id="park"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <rect width="22" height="22" fill="#ccc1df" />
            <circle cx="11" cy="11" r="2" fill="#b9a9d1" />
          </pattern>
        </defs>
        <rect width="1000" height="700" fill="url(#blocks)" />
        <path
          d="M0 65 Q180 50 290 0 L350 0 Q270 100 290 165 Q310 220 265 300 Q230 350 250 400 Q265 450 205 510 Q155 560 170 700 L80 700 Q80 555 135 485 Q195 415 180 370 Q155 300 200 235 Q235 170 200 135 Q160 100 0 140Z"
          fill="#b8aad0"
        />
        <path
          d="M0 70 Q180 55 282 0 M89 700 Q90 550 145 485 Q195 415 185 370 Q160 300 210 230"
          fill="none"
          stroke="#a38dbc"
          strokeWidth="3"
        />
        <path
          d="M760 0h240v205l-125 30-95-60Z M490 540l130-25 85 65-30 120H460Z M20 265l105-25 30 100-100 38Z"
          fill="url(#park)"
        />
        <g stroke="#f4f0f9" strokeWidth="17" fill="none">
          <path d="M-50 470L1060 100" />
          <path d="M480-30L700 760" />
          <path d="M0 600L1000 290" />
          <path d="M300-30L460 700" />
          <path d="M30 115L1000 470" />
        </g>
        <g stroke="#d7cde5" strokeWidth="1" fill="none">
          <path d="M-50 470L1060 100" />
          <path d="M480-30L700 760" />
          <path d="M0 600L1000 290" />
          <path d="M300-30L460 700" />
          <path d="M30 115L1000 470" />
        </g>
        <g stroke="#eee8f5" strokeWidth="12">
          <path d="M165 340L295 315" />
          <path d="M125 535L235 500" />
        </g>
        <g
          fontFamily="DM Sans, sans-serif"
          textAnchor="middle"
          fill="#75628f"
          fontSize="12"
          fontWeight="600"
          letterSpacing="2"
        >
          <text x="535" y="275">
            CENTRE-VILLE
          </text>
          <text x="530" y="640">
            LA ROSERAIE
          </text>
          <text x="720" y="85">
            SAINT-SERGE
          </text>
          <text x="100" y="190">
            LA DOUTRE
          </text>
          <text x="855" y="420">
            JUSTICES
          </text>
        </g>
        <g fontFamily="DM Sans, sans-serif" fontSize="11" fill="#7c6996">
          <text x="830" y="140">
            Jardin des plantes
          </text>
          <text x="332" y="435">
            Château d’Angers
          </text>
          <text x="620" y="487">
            Gare Saint-Laud
          </text>
          <text x="137" y="397" fill="#7d6697" transform="rotate(-68 137 397)">
            La Maine
          </text>
        </g>
        <g transform="translate(455 375)">
          <circle r="35" fill="#321ed3" opacity=".08" />
          <circle r="19" fill="#321ed3" opacity=".12" />
          <circle r="8" fill="#321ed3" stroke="white" strokeWidth="4" />
        </g>
        {missions.map((mission) => {
          const { x, y } = project(mission);
          return (
            <circle
              key={mission.id}
              cx={x}
              cy={y}
              r={selectedId === mission.id ? 26 : 23}
              fill="white"
              opacity=".65"
            />
          );
        })}
      </svg>
      <div
        className="map-markers"
        style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}
      >
        {missions.map((mission, index) => {
          const { x, y } = project(mission);
          const Icon = typeIcons[mission.type];
          return (
            <button
              key={mission.id}
              className={`map-pin ${mission.type} ${selectedId === mission.id ? "selected" : ""}`}
              style={{
                left: `${x / 10}%`,
                top: `${y / 7}%`,
                background: typeColors[mission.type],
                animationDelay: `${index * 40}ms`,
              }}
              onClick={() => onSelect(mission)}
              aria-label={`${mission.vehicleId}, ${mission.location}, ouvrir la mission`}
              title={mission.location}
            >
              <Icon size={19} />
            </button>
          );
        })}
      </div>
      <div className="map-top-label">
        <span className="live-dot" /> Angers{" "}
        <span className="map-label-divider">/</span> Zone de démonstration
      </div>
      <div className="map-controls">
        <button
          aria-label="Zoomer sur le plan"
          disabled={zoom >= 1.5}
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.25))}
        >
          <Plus size={19} />
        </button>
        <button
          aria-label="Dézoomer sur le plan"
          disabled={zoom <= 0.75}
          onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
        >
          <Minus size={19} />
        </button>
        <button aria-label="Recentrer le plan" onClick={() => setZoom(1)}>
          <LocateFixed size={19} />
        </button>
      </div>
      <div className="map-bottom-label">
        <Navigation size={12} /> Plan schématique · positions fictives
      </div>
      <div className="map-scale">
        500 m environ <span />
      </div>
    </div>
  );
}
