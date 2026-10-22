// @ts-check
/**
 * Camp dates, as the website shows them: read from the members app's public camp catalogue.
 *
 * Staff create camps in TMV-Members (each with its real dates), and the server republishes the sellable ones to a
 * static CDN object on every change and once a day (`functions/camp-catalog-publish.js`, `camp-catalog.json`): a
 * camp whose every day has passed drops out on its own. That object is the one source of the dates; nothing here
 * types one. Booking still goes to each camp's Square link.
 *
 * The build reads the catalogue once (`src/data/camp-dates.ts`) and renders the dates; on page load the browser
 * reads it again and re-applies them in place (`applyCampDates`, from `CampDates.astro`), so a camp staff add or a
 * date that passes shows without a release. Both use the same pure rules below.
 *
 * Browser code on the Safari 13.1 floor: no `??=`, `||=`, `&&=`, no lookbehind.
 */

/** The published catalogue. Server side: `CATALOG_OBJECT_PATH` in `functions/camp-catalog-publish.js`. */
export const PUBLIC_CAMP_CATALOG_URL = 'https://storage.googleapis.com/tmv-management.firebasestorage.app/public/camp-catalog.json';

/** The payload shape this reader understands. Server side: `CAMP_CATALOG_SCHEMA_VERSION`. */
export const CAMP_CATALOG_SCHEMA_VERSION = 1;

/**
 * The camps the website lists, one group per camp type (`CAMP_TYPE_IDS` in the members app's
 * `camp-schema.js`; a private camp is booked on request, so it has no dates here). `linkField` is the group's
 * Square link (`sq.camps.<linkField>`).
 */
export const CAMP_DATE_GROUPS = Object.freeze([
  { type: 'winter', key: 'winter', title: 'Winter Camp', unit: 'Book the week or single days', linkField: 'winterCamp' },
  { type: 'march-break', key: 'march', title: 'March Break Camp', unit: 'Book the week or single days', linkField: 'marchCamp' },
  { type: 'summer', key: 'summer', title: 'Summer Camp', unit: 'Weekly, Monday to Friday', linkField: 'summerCamp' },
  { type: 'pa-day', key: 'paday', title: 'P.A. Day Camps', unit: 'Single days off school', linkField: 'paDayCamp' },
]);

/** A catalogue date: `YYYY-MM-DD`, the gym's calendar day. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @typedef {{type: string, dates: string[]}} CatalogCamp
 * @typedef {{label: string, sub: string}} DateRun
 * @typedef {{key: string, runs: DateRun[], summary: string}} CampDates
 */

/**
 * The catalogue's camps, as this reader trusts them: a known type and real `YYYY-MM-DD` dates. Anything else
 * is left out (a partial or older object reads as no camps, never as a throw).
 * @param {unknown} json
 * @returns {CatalogCamp[]}
 */
export function readCampCatalog(json) {
  const camps = json && typeof json === 'object' ? /** @type {Record<string, any>} */ (json).camps : null;
  if (!Array.isArray(camps)) return [];
  const types = CAMP_DATE_GROUPS.map((g) => g.type);
  return camps
    .filter((c) => c && typeof c === 'object' && types.includes(c.type) && Array.isArray(c.dates))
    .map((c) => ({ type: c.type, dates: c.dates.filter((d) => typeof d === 'string' && ISO_DAY.test(d)) }));
}

/** @param {string} iso @returns {Date} midnight UTC of that calendar day, so formatting never shifts it a day. */
const day = (iso) => new Date(`${iso}T00:00:00Z`);

const fmt = (/** @type {Intl.DateTimeFormatOptions} */ opts) => new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' });
const MONTH_DAY = fmt({ month: 'short', day: 'numeric' });
const WEEKDAY_MONTH_DAY = fmt({ weekday: 'short', month: 'short', day: 'numeric' });
const DAY_ONLY = fmt({ day: 'numeric' });

/**
 * Split sorted days into runs of consecutive days (a weekend or any gap starts a new run).
 * @param {string[]} days - sorted, unique
 * @returns {string[][]}
 */
function runsOf(days) {
  /** @type {string[][]} */
  const runs = [];
  days.forEach((d) => {
    const last = runs[runs.length - 1];
    const prev = last ? last[last.length - 1] : '';
    if (prev && day(d).getTime() - day(prev).getTime() === 86400000) last.push(d);
    else runs.push([d]);
  });
  return runs;
}

/**
 * One run as a chip: a single day names its weekday ("Mon, Oct 26"); a stretch reads "Dec 21 – 24", or
 * "Jun 29 – Jul 3" across a month, with how many days it is.
 * @param {string[]} run
 * @returns {DateRun}
 */
function runLabel(run) {
  const first = day(run[0]);
  if (run.length === 1) return { label: WEEKDAY_MONTH_DAY.format(first), sub: '' };
  const last = day(run[run.length - 1]);
  const end = first.getUTCMonth() === last.getUTCMonth() ? DAY_ONLY.format(last) : MONTH_DAY.format(last);
  return { label: `${MONTH_DAY.format(first)} – ${end}`, sub: `${run.length} days` };
}

/**
 * Every group's dates from today on, as runs, plus a one-line summary for the cards that link to them. A group
 * with nothing left has no runs and an empty summary (it renders nothing).
 * @param {CatalogCamp[]} camps
 * @param {string} todayIso - the gym's date, `YYYY-MM-DD`
 * @returns {CampDates[]}
 */
export function campDates(camps, todayIso) {
  return CAMP_DATE_GROUPS.map((g) => {
    const days = [...new Set(camps.filter((c) => c.type === g.type).flatMap((c) => c.dates))]
      .filter((d) => d >= todayIso)
      .sort();
    const runs = runsOf(days).map(runLabel);
    let summary = '';
    if (runs.length > 0) {
      summary = g.type === 'pa-day' ? `Next: ${runs[0].label}`
        : runs.length <= 2 ? runs.map((r) => r.label).join(' & ')
        : `${runs.length} weeks from ${runs[0].label.split(' – ')[0]}`;
    }
    return { key: g.key, runs, summary };
  });
}

/**
 * Fetch the catalogue and read it. Throws on a network failure, a non-OK status or an unknown schemaVersion; the
 * caller decides what failing means (the build warns and shows no dates, the browser keeps what was built).
 * @param {RequestInit} [init] - e.g. `{cache: 'no-cache'}` in the browser
 * @returns {Promise<CatalogCamp[]>}
 */
export async function fetchCampCatalog(init = {}) {
  const res = await fetch(PUBLIC_CAMP_CATALOG_URL, init);
  if (!res.ok) throw new Error(`Public camp catalogue returned HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.schemaVersion !== CAMP_CATALOG_SCHEMA_VERSION) {
    throw new Error(`Public camp catalogue has schemaVersion ${json && json.schemaVersion}, expected ${CAMP_CATALOG_SCHEMA_VERSION}`);
  }
  return readCampCatalog(json);
}

/**
 * Bring the built dates up to date in place. Every group is always in the markup (`data-camp-group`), hidden when
 * it has no dates, and the whole block (`data-camp-dates`) hides when no group has any. Text only, never markup.
 * @param {ParentNode} root
 * @param {CampDates[]} groups
 */
export function applyCampDates(root, groups) {
  root.querySelectorAll('[data-camp-dates]').forEach((block) => {
    let any = false;
    groups.forEach((g) => {
      const group = /** @type {HTMLElement|null} */ (block.querySelector(`[data-camp-group="${g.key}"]`));
      const list = group && group.querySelector('[data-camp-runs]');
      if (!group || !list) return;
      const doc = list.ownerDocument;
      list.textContent = '';
      g.runs.forEach((r) => {
        const li = doc.createElement('li');
        li.className = 'cd-date';
        const label = doc.createElement('span');
        label.className = 'cd-date-l';
        label.textContent = r.label;
        li.appendChild(label);
        if (r.sub) {
          const sub = doc.createElement('span');
          sub.className = 'cd-date-s';
          sub.textContent = r.sub;
          li.appendChild(sub);
        }
        list.appendChild(li);
      });
      group.hidden = g.runs.length === 0;
      if (g.runs.length > 0) any = true;
    });
    /** @type {HTMLElement} */ (block).hidden = !any;
  });
}
