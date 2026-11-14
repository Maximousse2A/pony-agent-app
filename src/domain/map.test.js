import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "./missions.js";
import { groupMapMarkers, projectMission } from "./map.js";

const at = (id, x, y) => ({
  id,
  lng: -0.605 + (x / 1000) * 0.08,
  lat: 47.5 - (y / 700) * 0.06,
});
const near = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-7);

test("map projection uses the existing 1000 by 700 coordinate system", () => {
  const point = projectMission(at("A", 250, 350));
  near(point.x, 250);
  near(point.y, 350);
  assert.deepEqual(groupMapMarkers([]), []);
});

test("nearby markers group while distant vehicles remain individually selectable", () => {
  const missions = [at("A", 100, 100), at("B", 140, 100), at("C", 500, 400)];
  const groups = groupMapMarkers(missions, { width: 1000, height: 700 });
  assert.equal(groups.length, 2);
  assert.equal(groups[0].id, "A|B");
  assert.deepEqual(
    groups[0].members.map((mission) => mission.id),
    ["A", "B"],
  );
  near(groups[0].x, 120);
  near(groups[0].y, 100);
  assert.equal(groups[1].id, "C");
});

test("displayed size and zoom change grouping in pixels rather than map units", () => {
  const horizontal = [at("A", 100, 100), at("B", 140, 100)];
  assert.equal(
    groupMapMarkers(horizontal, { width: 1000, height: 700 }).length,
    1,
  );
  assert.equal(
    groupMapMarkers(horizontal, { width: 2000, height: 700 }).length,
    2,
  );
  assert.equal(
    groupMapMarkers(horizontal, { width: 1000, height: 700, zoom: 2 }).length,
    2,
  );
  const vertical = [at("A", 100, 100), at("B", 100, 140)];
  assert.equal(
    groupMapMarkers(vertical, { width: 1000, height: 700 }).length,
    1,
  );
  assert.equal(
    groupMapMarkers(vertical, { width: 1000, height: 1400 }).length,
    2,
  );
  assert.equal(
    groupMapMarkers(horizontal, { width: 0, height: 0, zoom: 0, minGap: 0 })
      .length,
    2,
  );
});

test("new centroid overlaps are merged again with an original-point weighted center", () => {
  const groups = groupMapMarkers(
    [at("A", 100, 100), at("B", 150, 100), at("C", 125, 154)],
    { width: 1000, height: 700, minGap: 56 },
  );
  assert.equal(groups.length, 1);
  assert.equal(groups[0].id, "A|B|C");
  near(groups[0].x, 125);
  near(groups[0].y, 118);
});

test("all real seed missions occur exactly once with stable IDs and separated final centers", () => {
  const missions = createInitialState(Date.UTC(2026, 10, 12, 10)).missions;
  const snapshot = JSON.stringify(missions);
  const options = { width: 390, height: 570, zoom: 1, minGap: 56 };
  const groups = groupMapMarkers(missions, options);
  const reverse = groupMapMarkers([...missions].reverse(), options);
  assert.deepEqual(groups, reverse);
  assert.deepEqual(
    groups
      .flatMap((group) => group.members.map((mission) => mission.id))
      .sort(),
    missions.map((mission) => mission.id).sort(),
  );
  assert.equal(new Set(groups.map((group) => group.id)).size, groups.length);
  assert.equal(JSON.stringify(missions), snapshot);
  for (let left = 0; left < groups.length; left += 1) {
    for (let right = left + 1; right < groups.length; right += 1) {
      const dx = ((groups[left].x - groups[right].x) / 1000) * options.width;
      const dy = ((groups[left].y - groups[right].y) / 700) * options.height;
      assert.ok(Math.hypot(dx, dy) >= options.minGap - 1e-7);
    }
  }
});
