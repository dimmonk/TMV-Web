// @ts-check
/**
 * The gym's wall clock.
 *
 * Everything the staff type into Settings -> Website is local gym time with no
 * zone (an opening hour, a banner's first and last day). So the
 * site reads "now" the same way, in the gym's zone, wherever the build runs and
 * wherever the visitor is. One definition, used by the build and by the browser.
 */

export const GYM_TIME_ZONE = 'America/Toronto';

/**
 * @typedef {Object} GymNow
 * @property {number} dayIndex - 0 (Sunday) to 6, like `Date#getDay`.
 * @property {number} minutes - Minutes since the gym's midnight.
 * @property {string} wall - `YYYY-MM-DDTHH:MM:SS` in the gym's zone: compares as text; its first ten characters are the gym's day.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * @param {Date} [date]
 * @returns {GymNow}
 */
export function gymNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: GYM_TIME_ZONE, hourCycle: 'h23', weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  /** @type {Record<string, string>} */
  const p = {};
  parts.forEach((part) => { p[part.type] = part.value; });
  const hour = Number(p.hour) % 24;
  return {
    dayIndex: WEEKDAYS.indexOf(p.weekday),
    minutes: hour * 60 + Number(p.minute),
    wall: `${p.year}-${p.month}-${p.day}T${String(hour).padStart(2, '0')}:${p.minute}:${p.second}`,
  };
}
