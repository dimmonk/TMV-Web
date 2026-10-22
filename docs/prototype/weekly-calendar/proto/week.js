// @ts-check
/**
 * The dated week, PROPOSED (not built). Pure: no DOM, no I/O.
 *
 * The rule the prototype demonstrates: a week is never stored. It is the recurring schedule laid on real dates,
 * minus a short list of exceptions staff add in Members. Two kinds of exception, one shape:
 *
 *   { type: 'cancel', classId, date, reason }   one class on one date
 *   { type: 'closed', date, reason }            the gym is closed that day: every class that day is off
 *
 * Dates are gym-local calendar days ('YYYY-MM-DD', America/Toronto). Weeks run Monday to Sunday, the order of the
 * printed sheet. The visitor sees this week plus the next WEEKS_AHEAD - 1; nothing in the past.
 */

export const WEEKS_AHEAD = 4;

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** A 'YYYY-MM-DD' day as a UTC-noon instant, so adding days never crosses a DST edge. */
function toNoon(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d, 12);
}
function toIso(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso, n) {
  return toIso(toNoon(iso) + n * DAY_MS);
}

/** 0 = Sunday … 6 = Saturday, the schedule's own day numbering. */
export function weekdayOf(iso) {
  return new Date(toNoon(iso)).getUTCDay();
}

/** The Monday on or before a day. */
export function mondayOf(iso) {
  return addDays(iso, -((weekdayOf(iso) + 6) % 7));
}

/** 'Oct 26' */
export function shortDate(iso) {
  const d = new Date(toNoon(iso));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** 'Tue Oct 27' */
export function dayAndDate(iso) {
  return `${DAYS_SHORT[weekdayOf(iso)]} ${shortDate(iso)}`;
}

/** 'Oct 26 – Nov 1', or 'Oct 19 – 25' inside one month. */
export function weekRangeLabel(monday) {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.slice(5, 7) === sunday.slice(5, 7);
  return `${shortDate(monday)} – ${sameMonth ? Number(sunday.slice(8)) : shortDate(sunday)}`;
}

/** The Mondays a visitor can step through, earliest first. */
export function visibleWeeks(today, count = WEEKS_AHEAD) {
  const first = mondayOf(today);
  return Array.from({ length: count }, (_, i) => addDays(first, i * 7));
}

/** The date a weekday falls on in the week starting `monday`. */
export function dateInWeek(monday, day) {
  return addDays(monday, (day + 6) % 7);
}

/**
 * The week's sessions: each recurring class on its date, with its status.
 * Returns new objects; the classes are not touched. A closed day wins over a class cancel on the same date.
 *
 * @param {ReadonlyArray<any>} classes - the recurring schedule
 * @param {string} monday
 * @param {ReadonlyArray<any>} exceptions
 */
export function sessionsForWeek(classes, monday, exceptions) {
  return classes.map((c) => {
    const date = dateInWeek(monday, c.day);
    const closed = exceptions.find((e) => e.type === 'closed' && e.date === date);
    const cancel = exceptions.find((e) => e.type === 'cancel' && e.date === date && e.classId === c.id);
    const off = closed || cancel;
    return {
      ...c,
      date,
      status: closed ? 'closed' : cancel ? 'cancelled' : 'on',
      offReason: off ? off.reason || '' : '',
    };
  });
}

/** The closed days of one week, keyed by date. */
export function closedDays(monday, exceptions) {
  const end = addDays(monday, 6);
  return new Map(exceptions.filter((e) => e.type === 'closed' && e.date >= monday && e.date <= end).map((e) => [e.date, e]));
}

/**
 * Every exception from today through the last visible week, soonest first: the "Changes coming up" notice.
 * The website is the only line to students, so the changes are listed, not only drawn on the grid.
 */
export function upcomingChanges(classes, today, exceptions, count = WEEKS_AHEAD) {
  const last = addDays(mondayOf(today), count * 7 - 1);
  const byId = new Map(classes.map((c) => [c.id, c]));
  return exceptions
    .filter((e) => e.date >= today && e.date <= last)
    // A cancel names a date its class actually runs on (the staff picker offers only those).
    .filter((e) => e.type === 'closed' || (byId.has(e.classId) && weekdayOf(e.date) === byId.get(e.classId).day))
    .map((e) => ({ ...e, cls: e.type === 'cancel' ? byId.get(e.classId) : null }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
