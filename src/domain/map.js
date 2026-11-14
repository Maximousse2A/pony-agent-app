const BASE_WIDTH = 1000;
const BASE_HEIGHT = 700;

export function projectMission(mission) {
  return {
    x: ((mission.lng + 0.605) / 0.08) * BASE_WIDTH,
    y: ((47.5 - mission.lat) / 0.06) * BASE_HEIGHT,
  };
}

const byId = (left, right) =>
  left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
const positive = (value, fallback) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

function markerGroup(members) {
  const sorted = [...members].sort(byId);
  const points = sorted.map(projectMission);
  return {
    id: sorted.map((mission) => mission.id).join("|"),
    members: sorted,
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  };
}

/**
 * Group overlapping marker centers using their actual displayed pixel distance.
 * Coordinates returned stay in the map's 1000 × 700 base space. Recalculate on
 * resize or zoom; each merge reduces the group count, so the loop terminates.
 */
export function groupMapMarkers(
  missions,
  { width = BASE_WIDTH, height = BASE_HEIGHT, zoom = 1, minGap = 56 } = {},
) {
  const scaleX = (positive(width, BASE_WIDTH) / BASE_WIDTH) * positive(zoom, 1);
  const scaleY =
    (positive(height, BASE_HEIGHT) / BASE_HEIGHT) * positive(zoom, 1);
  const gap = Number.isFinite(minGap) && minGap >= 0 ? minGap : 56;
  let groups = missions.map((mission) => markerGroup([mission])).sort(byId);

  while (groups.length > 1) {
    let pair = null;
    for (let left = 0; left < groups.length && !pair; left += 1) {
      for (let right = left + 1; right < groups.length; right += 1) {
        const dx = (groups[left].x - groups[right].x) * scaleX;
        const dy = (groups[left].y - groups[right].y) * scaleY;
        if (Math.hypot(dx, dy) < gap) {
          pair = [left, right];
          break;
        }
      }
    }
    if (!pair) break;
    const [left, right] = pair;
    const merged = markerGroup([
      ...groups[left].members,
      ...groups[right].members,
    ]);
    groups = groups
      .filter((_, index) => index !== left && index !== right)
      .concat(merged)
      .sort(byId);
  }

  return groups;
}
