// @ts-check
/**
 * Opening hours, read from the rows staff publish.
 *
 * The published `hours` are free-text `{day, time}` rows in the order staff
 * saved them (`settings/siteConfig.hours`, Settings -> Banner, hours & social).
 * The About page shows them VERBATIM. Everything else that needs a number (the
 * open/closed pill, the structured data, the one-line summary under "Visit")
 * is derived here from those same rows, so there is one source and no second
 * copy of the hours to drift.
 *
 * Reading a row mirrors TMV-Members `public/js/core/site-hours.js` `parseHours`
 * (cross-repo, kept in step by hand): a weekday name (or its first three
 * letters) with `h:mm AM - h:mm PM` or `Closed`. A row this cannot read (a range
 * of days, "By appointment") still shows as text; it just feeds no number.
 */

export const DAY_NAMES = Object.freeze(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
/** Monday first, Sunday last: how the week is listed. */
const WEEK_ORDER = Object.freeze([1, 2, 3, 4, 5, 6, 0]);

const RANGE = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:–|—|-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i;
const MINUTES_PER_DAY = 1440;
/** Within this many minutes of closing, the pill reads "Closes at". */
const CLOSING_SOON_MINUTES = 120;

/**
 * @typedef {{day: string, time: string}} HoursRow
 * @typedef {{open: number, close: number}} OpenSpan - minutes since midnight; `close` passes 1440 for a close after midnight.
 * @typedef {(OpenSpan|null)[]} Week - Seven entries indexed like `Date#getDay`; null = closed or not listed.
 */

/** @param {string} text @returns {number} The weekday index, or -1. */
function dayIndex(text) {
  const d = text.trim().toLowerCase();
  if (!d) return -1;
  return DAY_NAMES.findIndex((name) => name.toLowerCase() === d || name.slice(0, 3).toLowerCase() === d);
}

/** @param {string} h @param {string|undefined} m @param {string} meridiem @returns {number} minutes, or -1 */
function toMinutes(h, m, meridiem) {
  const hour = Number(h);
  const minute = Number(m ?? '0');
  if (hour < 1 || hour > 12 || minute > 59) return -1;
  return ((hour % 12) + (meridiem.toLowerCase() === 'pm' ? 12 : 0)) * 60 + minute;
}

/**
 * The week the rows describe. The first readable row for a day wins.
 * @param {HoursRow[]} rows
 * @returns {Week}
 */
export function weekSchedule(rows) {
  /** @type {Week} */
  const week = [null, null, null, null, null, null, null];
  const seen = new Set();
  for (const row of rows) {
    const idx = dayIndex(row.day);
    if (idx < 0 || seen.has(idx)) continue;
    const time = row.time.trim();
    if (/^closed$/i.test(time)) { seen.add(idx); continue; }
    const range = RANGE.exec(time);
    if (!range) continue;
    const open = toMinutes(range[1], range[2], range[3]);
    let close = toMinutes(range[4], range[5], range[6]);
    if (open < 0 || close < 0) continue;
    if (close <= open) close += MINUTES_PER_DAY;
    seen.add(idx);
    week[idx] = { open, close };
  }
  return week;
}

/** @param {number} minutes @returns {string} `11 AM`, `10:30 PM`, `12 AM` */
export function formatClock(minutes) {
  const m = minutes % MINUTES_PER_DAY;
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}${min ? `:${String(min).padStart(2, '0')}` : ''} ${h24 < 12 ? 'AM' : 'PM'}`;
}

/** @param {OpenSpan} span @returns {string} */
const rangeLabel = (span) => `${formatClock(span.open)} – ${formatClock(span.close)}`;

/** @param {Week} week @returns {OpenSpan[]} The open days' spans, Monday first. */
const openSpans = (week) => WEEK_ORDER.flatMap((day) => (week[day] ? [/** @type {OpenSpan} */ (week[day])] : []));

/**
 * Runs of consecutive open days (Monday first) that share one range.
 * @param {Week} week
 * @returns {{from: number, to: number, label: string}[]}
 */
function runs(week) {
  /** @type {{from: number, to: number, label: string}[]} */
  const out = [];
  WEEK_ORDER.forEach((day, pos) => {
    const span = week[day];
    if (!span) return;
    const label = rangeLabel(span);
    const last = out[out.length - 1];
    if (last && last.to === pos - 1 && last.label === label) last.to = pos;
    else out.push({ from: pos, to: pos, label });
  });
  return out;
}

/**
 * The one-line "when are you open" text: "Open 7 days · 11 AM – 10 PM" when
 * every day shares one range, else the runs ("Mon–Fri 11 AM – 10 PM · Sat–Sun
 * 10 AM – 6 PM"). '' when no row could be read, so the caller renders nothing.
 * @param {HoursRow[]} rows
 * @returns {string}
 */
export function hoursSummary(rows) {
  const week = weekSchedule(rows);
  const found = runs(week);
  if (found.length === 0) return '';
  if (found.length === 1 && openSpans(week).length === 7) return `Open 7 days · ${found[0].label}`;
  const short = (/** @type {number} */ pos) => DAY_NAMES[WEEK_ORDER[pos]].slice(0, 3);
  return found
    .map((r) => `${r.from === r.to ? short(r.from) : `${short(r.from)}–${short(r.to)}`} ${r.label}`)
    .join(' · ');
}

/**
 * The About page's hours heading.
 * @param {HoursRow[]} rows
 * @returns {string}
 */
export function hoursHeading(rows) {
  const n = openSpans(weekSchedule(rows)).length;
  if (n === 7) return 'Open 7 days a week';
  return n > 0 ? `Open ${n} days a week` : 'Hours';
}

/** @param {number} minutes @returns {string} `11a`, `10:30p` */
function shortClock(minutes) {
  const m = minutes % MINUTES_PER_DAY;
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  return `${h24 % 12 || 12}${min ? `:${String(min).padStart(2, '0')}` : ''}${h24 < 12 ? 'a' : 'p'}`;
}

/**
 * The home hero's hours tile, or null when there is nothing readable to say.
 * @param {HoursRow[]} rows
 * @returns {{value: string, label: string, mobileLabel: string}|null}
 */
export function hoursStat(rows) {
  const spans = openSpans(weekSchedule(rows));
  if (spans.length === 0) return null;
  const value = `${spans.length} days`;
  const labels = new Set(spans.map(rangeLabel));
  if (labels.size !== 1) return { value, label: 'open every week', mobileLabel: 'open weekly' };
  const [span] = spans;
  return { value, label: `open ${rangeLabel(span)}`, mobileLabel: `${shortClock(span.open)} – ${shortClock(span.close)}` };
}

/** @param {number} minutes @returns {string} `HH:MM` for structured data; a midnight close is 23:59. */
function clock24(minutes) {
  const m = minutes === MINUTES_PER_DAY ? MINUTES_PER_DAY - 1 : minutes % MINUTES_PER_DAY;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * schema.org `openingHoursSpecification` entries, one per open day, Monday first.
 * @param {HoursRow[]} rows
 */
export function openingHoursSpec(rows) {
  const week = weekSchedule(rows);
  return WEEK_ORDER.flatMap((day) => {
    const span = week[day];
    return span ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_NAMES[day], opens: clock24(span.open), closes: clock24(span.close) }] : [];
  });
}

/**
 * @typedef {Object} OpenStatus
 * @property {'open'|'closing'|'closed'} state
 * @property {string} label
 */

/** @param {number} closeAt @param {number} minutes @returns {OpenStatus} */
function whileOpen(closeAt, minutes) {
  return closeAt - minutes <= CLOSING_SOON_MINUTES
    ? { state: 'closing', label: `Closes at ${formatClock(closeAt)}` }
    : { state: 'open', label: 'Open now' };
}

/**
 * The pill: open now, closing within two hours, or when it opens next. Null
 * when no day is open, so the caller renders no pill.
 * @param {Week} week
 * @param {number} day - gym weekday now, 0 = Sunday
 * @param {number} minutes - gym minutes now
 * @returns {OpenStatus|null}
 */
export function openStatus(week, day, minutes) {
  if (openSpans(week).length === 0) return null;
  const today = week[day];
  const yesterday = week[(day + 6) % 7];
  // A close after midnight (10 PM - 2 AM) is still open in the small hours of the next day.
  if (yesterday && yesterday.close > MINUTES_PER_DAY && minutes < yesterday.close - MINUTES_PER_DAY) {
    return whileOpen(yesterday.close - MINUTES_PER_DAY, minutes);
  }
  if (today && minutes >= today.open && minutes < today.close) return whileOpen(today.close, minutes);
  if (today && minutes < today.open) return { state: 'closed', label: `Opens ${formatClock(today.open)}` };
  for (let ahead = 1; ahead <= 7; ahead++) {
    const idx = (day + ahead) % 7;
    const next = week[idx];
    if (next) {
      const when = ahead === 1 ? '' : `${DAY_NAMES[idx].slice(0, 3)} `;
      return { state: 'closed', label: `Opens ${when}${formatClock(next.open)}` };
    }
  }
  return null;
}
