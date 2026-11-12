import test from "node:test";
import assert from "node:assert/strict";
import {
  formatParisDate,
  isParisToday,
  isParisThisWeek,
  parisDateKey,
  parisWeekDays,
} from "./date.js";

test("Paris midnight determines today, independent of the device timezone", () => {
  const now = "2026-11-12T23:30:00Z";
  assert.equal(parisDateKey(now), "2026-11-13");
  assert.equal(isParisToday("2026-11-12T23:05:00Z", now), true);
  assert.equal(isParisToday("2026-11-12T22:59:59Z", now), false);
  assert.match(formatParisDate(now), /13 nov/);
  assert.match(formatParisDate(now), /00:30/);
});

test("Paris Monday starts the revenue week, even while UTC is still Sunday", () => {
  const now = "2026-11-15T23:30:00Z";
  assert.equal(isParisThisWeek("2026-11-15T23:00:00Z", now), true);
  assert.equal(isParisThisWeek("2026-11-15T22:59:59Z", now), false);
  assert.equal(isParisThisWeek("2026-11-22T23:00:00Z", now), false);
  const days = parisWeekDays(now);
  assert.deepEqual(
    days.map((day) => day.key),
    [
      "2026-11-16",
      "2026-11-17",
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
    ],
  );
  assert.equal(days[0].today, true);
});

test("calendar days stay contiguous across daylight-saving transitions", () => {
  for (const now of ["2026-03-29T01:30:00Z", "2026-10-25T01:30:00Z"]) {
    const days = parisWeekDays(now);
    assert.equal(days.length, 7);
    assert.equal(new Set(days.map((day) => day.key)).size, 7);
    assert.equal(days[6].today, true);
    assert.equal(isParisThisWeek(`${days[0].key}T12:00:00Z`, now), true);
  }
});
