// All locations, missions and agent earnings are fictional demonstration data.
const hour = 3_600_000;
const day = 24 * hour;
const iso = (value) => new Date(value).toISOString();

const missionTemplates = [
  {
    id: "M-1042",
    type: "battery",
    vehicleId: "PN-2841",
    vehicleKind: "Vélo électrique",
    zone: "centre",
    location: "Place du Ralliement",
    lat: 47.4713,
    lng: -0.5514,
    ageHours: 3.05,
    battery: 8,
    reason: "Batterie à 8 % après le dernier trajet.",
    destination: {
      label: "Place du Ralliement · stationnement autorisé",
      lat: 47.4713,
      lng: -0.5514,
    },
  },
  {
    id: "M-1043",
    type: "relocation",
    vehicleId: "PN-1936",
    vehicleKind: "Trottinette",
    zone: "centre",
    location: "Quai des Carmes",
    lat: 47.4761,
    lng: -0.5611,
    ageHours: 3.4,
    battery: 74,
    reason: "Déséquilibre de disponibilité : renforcer la zone de la gare.",
    destination: {
      label: "Gare Saint-Laud · aire vélos",
      lat: 47.4657,
      lng: -0.5568,
    },
  },
  {
    id: "M-1044",
    type: "recharge",
    vehicleId: "PN-3017",
    vehicleKind: "Vélo électrique",
    zone: "centre",
    location: "Jardin du Mail",
    lat: 47.4708,
    lng: -0.5468,
    ageHours: 1.8,
    battery: 3,
    reason: "Batterie déchargée ; récupération pour recharge requise.",
    destination: {
      label: "Dépôt Saint-Serge · zone recharge",
      lat: 47.4885,
      lng: -0.5525,
    },
  },
  {
    id: "M-1045",
    type: "workshop",
    vehicleId: "PN-1672",
    vehicleKind: "Trottinette",
    zone: "centre",
    location: "Rue Bressigny",
    lat: 47.4669,
    lng: -0.5484,
    ageHours: 7.2,
    battery: 53,
    reason: "Frein arrière signalé défectueux par un usager.",
    destination: {
      label: "Atelier Saint-Serge · réception",
      lat: 47.4882,
      lng: -0.552,
    },
  },
  {
    id: "M-1046",
    type: "battery",
    vehicleId: "PN-2508",
    vehicleKind: "Vélo électrique",
    zone: "peripherie",
    location: "Belle-Beille · place Beaussier",
    lat: 47.4775,
    lng: -0.5975,
    ageHours: 1.2,
    battery: 12,
    reason: "Seuil de batterie inférieur à 15 % atteint.",
    destination: {
      label: "Place Beaussier · aire de stationnement",
      lat: 47.4775,
      lng: -0.5975,
    },
  },
  {
    id: "M-1047",
    type: "relocation",
    vehicleId: "PN-2210",
    vehicleKind: "Vélo électrique",
    zone: "peripherie",
    location: "Lac de Maine · esplanade",
    lat: 47.4602,
    lng: -0.5959,
    ageHours: 2.3,
    battery: 86,
    reason: "Véhicule hors de son aire de stationnement prévue.",
    destination: {
      label: "Lac de Maine · parking autorisé",
      lat: 47.4625,
      lng: -0.5918,
    },
  },
  {
    id: "M-1048",
    type: "recharge",
    vehicleId: "PN-1822",
    vehicleKind: "Trottinette",
    zone: "peripherie",
    location: "Monplaisir · place de l’Europe",
    lat: 47.4937,
    lng: -0.5323,
    ageHours: 2.8,
    battery: 2,
    reason: "Véhicule immobilisé après épuisement de la batterie.",
    destination: {
      label: "Dépôt Saint-Serge · zone recharge",
      lat: 47.4885,
      lng: -0.5525,
    },
  },
  {
    id: "M-1049",
    type: "workshop",
    vehicleId: "PN-3194",
    vehicleKind: "Vélo électrique",
    zone: "peripherie",
    location: "La Roseraie · Jean-Vilar",
    lat: 47.4438,
    lng: -0.5558,
    ageHours: 12.1,
    battery: 61,
    reason: "Pneu avant crevé confirmé lors du contrôle terrain.",
    destination: {
      label: "Atelier Saint-Serge · réception",
      lat: 47.4882,
      lng: -0.552,
    },
  },
  {
    id: "M-1050",
    type: "battery",
    vehicleId: "PN-2075",
    vehicleKind: "Trottinette",
    zone: "centre",
    location: "Place Molière",
    lat: 47.4748,
    lng: -0.5548,
    ageHours: 0.6,
    battery: 11,
    reason: "Autonomie faible après une série de trajets.",
    destination: {
      label: "Place Molière · aire de stationnement",
      lat: 47.4748,
      lng: -0.5548,
    },
  },
  {
    id: "M-1051",
    type: "relocation",
    vehicleId: "PN-2916",
    vehicleKind: "Vélo électrique",
    zone: "centre",
    location: "Boulevard Foch",
    lat: 47.468,
    lng: -0.5512,
    ageHours: 0.4,
    battery: 92,
    reason: "Renfort demandé près du campus pour le prochain pic.",
    destination: {
      label: "Campus Saint-Serge · aire vélos",
      lat: 47.4826,
      lng: -0.5498,
    },
  },
];

const tariffs = {
  battery: { centre: 2.5, peripherie: 2 },
  relocation: { centre: 4, peripherie: 3.5 },
  recharge: { centre: 7, peripherie: 6 },
  workshop: { centre: 6, peripherie: 6 },
};
const slas = { battery: 4, relocation: 6, recharge: 4, workshop: 24 };

export function createSeed(now = Date.now()) {
  const timestamp = Number(new Date(now));
  const reference = Number.isFinite(timestamp) ? timestamp : Date.now();
  const missions = missionTemplates.map(({ ageHours, ...mission }) => {
    const created = reference - ageHours * hour;
    return {
      ...mission,
      destination: { ...mission.destination },
      createdAt: iso(created),
      deadlineAt: iso(created + slas[mission.type] * hour),
      pay: tariffs[mission.type][mission.zone],
    };
  });
  const historySpec = [
    { template: 0, hoursAgo: 0.4, status: "pending" },
    { template: 1, hoursAgo: 1.2, status: "approved" },
    { template: 2, hoursAgo: 2.0, status: "approved" },
    { template: 4, hoursAgo: 2.8, status: "approved" },
    {
      template: 5,
      hoursAgo: 4.1,
      status: "rejected",
      rejectionReason: "Véhicule déposé hors de la zone autorisée.",
    },
    { template: 3, hoursAgo: 24.8, status: "approved" },
    { template: 6, hoursAgo: 27.0, status: "approved" },
    { template: 7, hoursAgo: 30.0, status: "pending" },
    {
      template: 8,
      hoursAgo: 49.0,
      status: "rejected",
      rejectionReason:
        "Photo inexploitable : le véhicule n’est pas entièrement visible.",
    },
    { template: 9, hoursAgo: 52.0, status: "approved" },
    { template: 0, hoursAgo: 3 * 24 + 2, status: "approved" },
    { template: 2, hoursAgo: 4 * 24 + 3, status: "approved" },
    { template: 5, hoursAgo: 8 * 24 + 1, status: "approved" },
  ];
  const history = historySpec.map(
    ({ template, hoursAgo, status, rejectionReason }, index) => {
      const original = missions[template];
      const completed = reference - hoursAgo * hour;
      return {
        ...original,
        id: `H-${1030 - index}`,
        vehicleId: `PN-${1400 + index * 37}`,
        createdAt: iso(completed - hour),
        deadlineAt: iso(completed + (slas[original.type] - 1) * hour),
        startedAt: iso(completed - 14 * 60_000),
        completedAt: iso(completed),
        reviewedAt: status === "pending" ? null : iso(completed + 5 * 60_000),
        status,
        rejectionReason: rejectionReason || null,
        photo: {
          dataUrl: null,
          name: "Photo de démonstration",
          simulated: true,
        },
        position: {
          lat: original.destination.lat,
          lng: original.destination.lng,
          accuracy: 12,
          simulated: true,
          capturedAt: iso(completed),
        },
        completedSteps: [0, 1, 2],
      };
    },
  );
  return {
    schemaVersion: 1,
    demoStartedAt: iso(reference),
    missions,
    history,
    activeMission: null,
  };
}

export { tariffs as TARIFFS, slas as SLA_HOURS, day as DAY_MS };
