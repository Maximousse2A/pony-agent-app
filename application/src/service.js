const minute = 60_000;
const opening = 8 * 60;
const closing = 20 * 60;
const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

function minuteOfDay(at) {
  const [hours, minutes] = clock.format(at).split(':').map(Number);
  return hours * 60 + minutes;
}

function atMinute(anchor, target) {
  return Math.floor(anchor / minute) * minute + (target - minuteOfDay(anchor)) * minute;
}

export function serviceRemaining(at) {
  const local = minuteOfDay(at);
  return local >= opening && local < closing ? (atMinute(at, closing) - at) / minute : 0;
}

export function pickupDeadline(created, hours) {
  const due = created + hours * 60 * minute;
  const local = minuteOfDay(due);
  if (local >= opening && due <= atMinute(due, closing)) return due;

  // Use a daytime anchor on the intended date, including on clock-change nights.
  const anchor = local < opening ? due - 12 * 60 * minute : due;
  const lastClose = atMinute(anchor, closing);
  if (lastClose >= created) return lastClose;

  // A request created and due overnight first becomes actionable at reopening.
  return atMinute(due + (local < opening ? 6 : 12) * 60 * minute, opening);
}
