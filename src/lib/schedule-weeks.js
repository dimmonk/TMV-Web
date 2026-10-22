// @ts-check
/**
 * The dated week. Pure: no DOM, no I/O.
 *
 * A week is never stored. It is the recurring Members schedule laid on real dates, minus a short list of exceptions
 * staff add in Members. Two kinds of exception, one shape:
 *
 *   { type: 'cancel', classId, date, reason }   one class on one date (schedule.json `cancellations`)
 *   { type: 'closed', date, reason }            the whole gym is closed that day (site config `closedDays`)
 *
 * Dates are gym-local calendar days ('YYYY-MM-DD', America/Toronto, `gym-clock.js`). Weeks run Monday to Sunday, the
 * order of the printed sheet. A visitor sees this week plus the next WEEKS_AHEAD - 1; nothing in the past.
 *
 * Both the desktop grid (`schedule-week-view.js`) and the phone list (`mobile-schedule.ts`) read their weeks here.
 */
import { gymNow } from './gym-clock.js';
import { weekSchedule } from './opening-hours.js';

export const WEEKS_AHEAD = 4;

/** The longest one-date cancellation reason the reader keeps. TMV-Members: `CANCELLATION_REASON_MAX`. */
export const CANCELLATION_REASON_MAX = 120;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Above each week: where it sits from today. */
export const WEEK_EYEBROWS = Object.freeze(['This week', 'Next week', 'In 2 weeks', 'In 3 weeks']);

/** The gym's today, 'YYYY-MM-DD'. */
export function gymToday(date = new Date()) {
  return gymNow(date).wall.slice(0, 10);
}

/** A 'YYYY-MM-DD' day as a UTC-noon instant, so adding days never crosses a DST edge. @param {string} iso */
function toNoon(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d, 12);
}
/** @param {number} ms */
const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);

/** @param {string} iso @param {number} n */
export function addDays(iso, n) {
  return toIso(toNoon(iso) + n * DAY_MS);
}

/** 0 = Sunday … 6 = Saturday, the schedule's own day numbering. @param {string} iso */
export function weekdayOf(iso) {
  return new Date(toNoon(iso)).getUTCDay();
}

/** The Monday on or before a day. @param {string} iso */
export function mondayOf(iso) {
  return addDays(iso, -((weekdayOf(iso) + 6) % 7));
}

/** 'Oct 26' @param {string} iso */
export function shortDate(iso) {
  const d = new Date(toNoon(iso));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** 'Tue Oct 27' @param {string} iso */
export function dayAndDate(iso) {
  return `${DAYS_SHORT[weekdayOf(iso)]} ${shortDate(iso)}`;
}

/** 'Oct 26 – Nov 1', or 'Oct 19 – 25' inside one month. @param {string} monday */
export function weekRangeLabel(monday) {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.slice(5, 7) === sunday.slice(5, 7);
  return `${shortDate(monday)} – ${sameMonth ? Number(sunday.slice(8)) : shortDate(sunday)}`;
}

/** The Mondays a visitor can step through, earliest first. @param {string} today */
export function visibleWeeks(today, count = WEEKS_AHEAD) {
  const first = mondayOf(today);
  return Array.from({ length: count }, (_, i) => addDays(first, i * 7));
}

/** The visible week a date falls in, or -1. @param {string[]} weeks @param {string} date */
export function weekIndexOf(weeks, date) {
  return weeks.findIndex((m) => date >= m && date <= addDays(m, 6));
}

/** The date a weekday falls on in the week starting `monday`. @param {string} monday @param {number} day */
export function dateInWeek(monday, day) {
  return addDays(monday, (day + 6) % 7);
}

/** @param {unknown} v */
const text = (v) => (typeof v === 'string' ? v.trim() : '');

/**
 * The schedule's one-date cancellations as exceptions. The publisher already projects them (shown classes only, today
 * on, bounded reason); this is the last gate before the page, so a malformed row is dropped, never trusted.
 * @param {unknown} raw - schedule.json `cancellations`
 */
export function readCancellations(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((c) => (c && typeof c === 'object' ? /** @type {Record<string, unknown>} */ (c) : {}))
    .filter((c) => text(c.classId) && DATE.test(text(c.date)))
    .map((c) => ({
      type: /** @type {const} */ ('cancel'),
      classId: text(c.classId),
      date: text(c.date),
      reason: text(c.reason).length <= CANCELLATION_REASON_MAX ? text(c.reason) : '',
    }));
}

/**
 * Every exception the week knows: the schedule's cancellations and the site config's closed days.
 * @param {{ cancellations?: unknown, closedDays?: ReadonlyArray<{date: string, reason: string}> }} sources
 */
export function scheduleExceptions({ cancellations, closedDays = [] }) {
  return [
    ...closedDays.map((d) => ({ type: /** @type {const} */ ('closed'), date: d.date, reason: d.reason })),
    ...readCancellations(cancellations),
  ];
}

/**
 * The week's sessions: each recurring class on its date, with its status. Returns new objects; the classes are not
 * touched. A closed day wins over a class cancel on the same date.
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

/** The closed days of one week, keyed by date. @param {string} monday @param {ReadonlyArray<any>} exceptions */
export function closedDaysOf(monday, exceptions) {
  const end = addDays(monday, 6);
  return new Map(exceptions.filter((e) => e.type === 'closed' && e.date >= monday && e.date <= end).map((e) => [e.date, e]));
}

/**
 * Every exception from today through the last visible week, soonest first: the "Schedule changes" card. The website
 * is the only line to students, so the changes are listed, not only drawn on the grid.
 * @param {ReadonlyArray<any>} classes @param {string} today @param {ReadonlyArray<any>} exceptions
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

/** Minutes since midnight of a schedule time ('17:30', '9'), for ordering. @param {unknown} t */
export function timeKey(t) {
  const [h, m] = String(t || '').split(':');
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m || '0', 10) || 0);
}

/** Minutes since midnight as a schedule time: 1320 -> '22:00', 1440 -> '24:00' (midnight). @param {number} m */
const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/**
 * Friday late Open Gym is adults only. A house rule that rarely changes, so it stays in this code (Steven's Members
 * scope, 2026-10-22); the hours themselves are Members'.
 */
export const ADULTS_ONLY_LATE = Object.freeze({ day: 5, from: 22 * 60 });

/**
 * Open Gym is the gym's open hours, not a class in the schedule feed: one block on each day the published opening
 * hours (Members, Settings -> Banner, hours & social) read as open, with Friday's adults-only late block split off
 * when those hours run past it. Both chromes list it from here; no hours, no blocks.
 * @param {ReadonlyArray<{day: string, time: string}>} hoursRows
 */
export function openGymSessions(hoursRows) {
  const block = (/** @type {number} */ d, /** @type {number} */ open, /** @type {number} */ close, /** @type {boolean} */ adults) => ({
    id: `open-gym-${d}${adults ? '-late' : ''}`, day: d, time: hm(open), endTime: hm(close), disciplineName: 'Open Gym',
    ageGroupName: adults ? 'Adults Only' : 'All Ages', color: adults ? '#2e7d32' : '#2e9e4f',
  });
  return weekSchedule([...hoursRows]).flatMap((span, d) => {
    if (!span) return [];
    const late = ADULTS_ONLY_LATE;
    if (d !== late.day || span.close <= late.from || span.open >= late.from) return [block(d, span.open, span.close, false)];
    return [block(d, span.open, late.from, false), block(d, late.from, span.close, true)];
  });
}
