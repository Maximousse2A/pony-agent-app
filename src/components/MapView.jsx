import { useState, useEffect, useRef } from "react";
import {
  BatteryCharging,
  MoveUpRight,
  Truck,
  Wrench,
  Plus,
  Minus,
  LocateFixed,
  Navigation,
  X,
  ChevronRight,
} from "./icons.js";

import { groupMapMarkers } from "../domain/map.js";
import { MISSION_TYPES, currency } from "../domain/missions.js";

export const typeIcons = {
  battery: BatteryCharging,
  relocation: MoveUpRight,
  recharge: Truck,
  workshop: Wrench,
};
// A self-contained schematic: geolocated markers, no external tiles or routing claims.
export default function MapView({ missions, onSelect, selectedId }) {
  const [zoom, setZoom] = useState(1);
  const host = useRef(null);
  const [size, setSize] = useState({ width: 390, height: 248 });
  const [clusterId, setClusterId] = useState(null);
  const clusterPicker = useRef(null),
    clusterTrigger = useRef(null),
    returnClusterFocus = useRef(false);
  useEffect(() => {
    if (clusterId)
      clusterPicker.current
        ?.querySelector("ul button")
        ?.focus({ preventScroll: true });
    else if (returnClusterFocus.current) {
      returnClusterFocus.current = false;
      clusterTrigger.current?.focus({ preventScroll: true });
    }
  }, [clusterId]);
  const closeCluster = () => {
    returnClusterFocus.current = true;
    setClusterId(null);
  };
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const groups = groupMapMarkers(missions, {
    width: Math.max(1, size.width - 32),
    height: Math.max(1, size.height - 32),
    zoom,
    minGap: 56,
  });
  const openGroup = groups.find((group) => group.id === clusterId);
  const changeZoom = (value) => {
    setZoom(value);
    setClusterId(null);
  };
  const width = 1000 / zoom,
    height = 700 / zoom;
  return (
    <div
      className="mission-map"
      aria-label="Plan schématique des missions à Angers"
    >
      <div className="map-viewport" ref={host}>
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
              <rect width="120" height="100" fill="#eceeed" />
              <rect x="9" y="8" width="93" height="72" rx="7" fill="#f5f6f4" />
              <rect
                x="20"
                y="18"
                width="32"
                height="26"
                rx="3"
                fill="#dfe3df"
              />
              <rect
                x="59"
                y="18"
                width="32"
                height="48"
                rx="3"
                fill="#e3e6e1"
              />
            </pattern>
            <pattern
              id="park"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <rect width="22" height="22" fill="#e2eadf" />
              <circle cx="11" cy="11" r="2" fill="#cbd8c7" />
            </pattern>
          </defs>
          <rect width="1000" height="700" fill="url(#blocks)" />
          <path
            d="M0 65 Q180 50 290 0 L350 0 Q270 100 290 165 Q310 220 265 300 Q230 350 250 400 Q265 450 205 510 Q155 560 170 700 L80 700 Q80 555 135 485 Q195 415 180 370 Q155 300 200 235 Q235 170 200 135 Q160 100 0 140Z"
            fill="#d4e3e8"
          />
          <path
            d="M0 70 Q180 55 282 0 M89 700 Q90 550 145 485 Q195 415 185 370 Q160 300 210 230"
            fill="none"
            stroke="#b9d0d8"
            strokeWidth="3"
          />
          <path
            d="M760 0h240v205l-125 30-95-60Z M490 540l130-25 85 65-30 120H460Z M20 265l105-25 30 100-100 38Z"
            fill="url(#park)"
          />
          <g stroke="#ffffff" strokeWidth="17" fill="none">
            <path d="M-50 470L1060 100" />
            <path d="M480-30L700 760" />
            <path d="M0 600L1000 290" />
            <path d="M300-30L460 700" />
            <path d="M30 115L1000 470" />
          </g>
          <g stroke="#daddda" strokeWidth="1" fill="none">
            <path d="M-50 470L1060 100" />
            <path d="M480-30L700 760" />
            <path d="M0 600L1000 290" />
            <path d="M300-30L460 700" />
            <path d="M30 115L1000 470" />
          </g>
          <g stroke="#fafafa" strokeWidth="12">
            <path d="M165 340L295 315" />
            <path d="M125 535L235 500" />
          </g>
          <g
            fontFamily="DM Sans, sans-serif"
            textAnchor="middle"
            fill="#626b66"
            fontSize="12"
            fontWeight="500"
            letterSpacing="0"
          >
            <text x="535" y="275">
              Centre-ville
            </text>
            <text x="530" y="640">
              La Roseraie
            </text>
            <text x="720" y="85">
              Saint-Serge
            </text>
            <text x="100" y="190">
              La Doutre
            </text>
            <text x="855" y="420">
              Justices
            </text>
          </g>
          <g fontFamily="DM Sans, sans-serif" fontSize="11" fill="#737c76">
            <text x="830" y="140">
              Jardin des plantes
            </text>
            <text x="332" y="435">
              Château d’Angers
            </text>
            <text x="620" y="487">
              Gare Saint-Laud
            </text>
            <text
              x="137"
              y="397"
              fill="#687f89"
              transform="rotate(-68 137 397)"
            >
              La Maine
            </text>
          </g>
          <g transform="translate(455 375)">
            <circle r="35" fill="#321ed3" opacity=".08" />
            <circle r="19" fill="#321ed3" opacity=".12" />
            <circle r="8" fill="#321ed3" stroke="white" strokeWidth="4" />
          </g>
        </svg>
        <div className="map-markers" inert={Boolean(openGroup)}>
          {groups.map((group) => {
            const mission = group.members[0];
            const Icon = typeIcons[mission.type];
            const multiple = group.members.length > 1;
            return (
              <button
                key={group.id}
                className={`map-pin ${multiple ? "cluster" : ""} ${group.members.some((m) => selectedId === m.id) ? "selected" : ""}`}
                style={{
                  left: `${((group.x - 500) * zoom + 500) / 10}%`,
                  top: `${((group.y - 350) * zoom + 350) / 7}%`,
                }}
                onClick={(event) => {
                  if (multiple) {
                    clusterTrigger.current = event.currentTarget;
                    setClusterId(group.id);
                  } else onSelect(mission);
                }}
                aria-label={
                  multiple
                    ? `${group.members.length} missions proches, afficher les véhicules`
                    : `${mission.vehicleId}, ${mission.location}, ouvrir la mission`
                }
                aria-expanded={multiple ? clusterId === group.id : undefined}
              >
                {multiple ? group.members.length : <Icon size={20} />}
              </button>
            );
          })}
        </div>
      </div>
      {openGroup && (
        <section
          ref={clusterPicker}
          className="map-cluster-picker"
          aria-label="Véhicules proches"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeCluster();
            }
          }}
        >
          <div>
            <strong>{openGroup.members.length} véhicules proches</strong>
            <button
              aria-label="Fermer les véhicules proches"
              onClick={closeCluster}
            >
              <X size={18} />
            </button>
          </div>
          <ul>
            {openGroup.members.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => {
                    setClusterId(null);
                    onSelect(m);
                  }}
                >
                  <span>
                    <strong>
                      {m.vehicleId} · {MISSION_TYPES[m.type].shortLabel}
                    </strong>
                    <small>{m.location}</small>
                  </span>
                  <b>{currency(m.pay)}</b>
                  <ChevronRight size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="map-top-label">Angers · plan de démo</div>
      <div className="map-controls" inert={Boolean(openGroup)}>
        <button
          aria-label="Zoomer sur le plan"
          disabled={zoom >= 1.5}
          onClick={() => changeZoom(Math.min(1.5, zoom + 0.25))}
        >
          <Plus size={19} />
        </button>
        <button
          aria-label="Dézoomer sur le plan"
          disabled={zoom <= 0.75}
          onClick={() => changeZoom(Math.max(0.75, zoom - 0.25))}
        >
          <Minus size={19} />
        </button>
        <button aria-label="Recentrer le plan" onClick={() => changeZoom(1)}>
          <LocateFixed size={19} />
        </button>
      </div>
      <div className="map-bottom-label">
        <Navigation size={12} /> Plan schématique · positions fictives
      </div>
    </div>
  );
}
