import {requiresDeposit} from './domain.js';

// Compare calendar days in Angers. UTC arithmetic below operates on day keys,
// independently of the device's time zone and changes of daylight saving time.
const parisDate = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
});
export const reportDate = timestamp => parisDate.format(timestamp);
const utcDay = key => new Date(key + 'T00:00:00Z');
const dayKey = date => date.toISOString().slice(0, 10);

export function validDay(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || key.startsWith('0000')) return false;
  const date = utcDay(key);
  return Number.isFinite(date.getTime()) && dayKey(date) === key;
}

export function shiftDay(key, days) {
  const date = utcDay(key);
  date.setUTCDate(date.getUTCDate() + days);
  return dayKey(date);
}

export const periods = {day: 'Jour', week: 'Semaine', month: 'Mois', ytd: 'YTD'};

export function periodRange(key, period) {
  const date = utcDay(key);
  if (period === 'week') {
    const start = shiftDay(key, -((date.getUTCDay() + 6) % 7));
    return {start, end: shiftDay(start, 6)};
  }
  if (period === 'month') {
    date.setUTCMonth(date.getUTCMonth() + 1, 0);
    return {start: key.slice(0, 7) + '-01', end: dayKey(date)};
  }
  if (period === 'ytd') return {start: key.slice(0, 4) + '-01-01', end: key};
  return {start: key, end: key};
}

export function periodRecords(history, {start, end}) {
  return history.filter(record => {
    const date = reportDate(record.time);
    return date >= start && date <= end;
  }).sort((a, b) => b.time - a.time);
}

const minute = 60000;
// Durations for archived demonstration receipts, in minutes. The total also
// includes identification and proof submission. Never estimate a live run.
const examples = {
  battery: {work: 8, travel: 4, total: 15},
  move: {work: 8, travel: 11, total: 22},
  charge: {work: 6, travel: 9, total: 17},
  shop: {work: 16, travel: 15, total: 35},
};

function elapsed(start, end) {
  return Number.isFinite(start) && Number.isFinite(end) && end >= start ? end - start : null;
}

export function receiptDurations(record) {
  if (record.source === 'seed' && !record.timing) {
    const {work, travel, total} = examples[record.type];
    return {source: 'simulated', work: work * minute, travel: travel * minute, total: total * minute};
  }
  const t = record.timing || {};
  const pickup = elapsed(t.acceptedAt, t.arrivedAtVehicle);
  const transfer = requiresDeposit(record) ? elapsed(t.interventionEndedAt, t.arrivedAtDeposit) : 0;
  return {
    source: 'measured',
    work: elapsed(t.interventionStartedAt, t.interventionEndedAt),
    travel: pickup === null || transfer === null ? null : pickup + transfer,
    total: elapsed(t.acceptedAt, t.completedAt),
  };
}

export function durationText(ms) {
  if (ms === null) return 'Indisponible';
  if (ms > 0 && ms < 1000) return '< 1 s';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return seconds + ' s';
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 60) return Math.floor(minutes / 60) + ' h ' + String(minutes % 60).padStart(2, '0');
  return minutes + ' min' + (seconds % 60 ? ' ' + seconds % 60 + ' s' : '');
}
