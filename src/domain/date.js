export const PARIS_TIME_ZONE = "Europe/Paris";
const DAY_MS = 86_400_000;
const parisCalendar = new Intl.DateTimeFormat("en-CA", {
  timeZone: PARIS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function parisDateKey(value = Date.now()) {
  const parts = Object.fromEntries(
    parisCalendar
      .formatToParts(new Date(value))
      .map(({ type, value: part }) => [type, part]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function parisCalendarDay(value) {
  return Date.parse(`${parisDateKey(value)}T00:00:00.000Z`) / DAY_MS;
}

export function formatParisDate(value, options = {}) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
    timeZone: PARIS_TIME_ZONE,
  }).format(new Date(value));
}

export function isParisToday(value, now = Date.now()) {
  return parisDateKey(value) === parisDateKey(now);
}

export function isParisThisWeek(value, now = Date.now()) {
  const currentDay = parisCalendarDay(now);
  const weekday = new Date(currentDay * DAY_MS).getUTCDay();
  const monday = currentDay - ((weekday + 6) % 7);
  const day = parisCalendarDay(value);
  return day >= monday && day < monday + 7;
}

// Calendar-day arithmetic deliberately avoids 24-hour arithmetic on Paris
// instants: a daylight-saving transition can make a local day 23 or 25 hours.
export function parisWeekDays(now = Date.now()) {
  const currentDay = parisCalendarDay(now);
  const weekday = new Date(currentDay * DAY_MS).getUTCDay();
  const monday = currentDay - ((weekday + 6) % 7);
  return Array.from({ length: 7 }, (_, index) => {
    const day = monday + index;
    const labelDate = new Date(day * DAY_MS + 12 * 3_600_000);
    return {
      key: labelDate.toISOString().slice(0, 10),
      day: new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        timeZone: PARIS_TIME_ZONE,
      }).format(labelDate),
      today: day === currentDay,
    };
  });
}
