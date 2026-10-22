/**
 * The camp dates, read ONCE per build from the members app's public camp catalogue (`lib/camp-dates.js`), from
 * the gym's today on. Staff own the dates (each camp in TMV-Members carries them); nothing here types one. The
 * browser re-reads the catalogue on page load and re-applies the date lists in place (`CampDates.astro`); the
 * one-line summaries on the cards and whether a season is offered stay build-time.
 *
 * FALLBACK, as for the site config: a failed read warns and carries on with no dates (the Dates section and the
 * season cards render nothing).
 */
import { campDates, fetchCampCatalog, CAMP_DATE_GROUPS, type CampDates } from '../lib/camp-dates.js';
import { gymNow } from '../lib/gym-clock.js';
import { sqUrl } from './square-links';

async function readCatalog() {
  try {
    return await fetchCampCatalog();
  } catch (e) {
    console.warn('[camp-dates] public camp catalogue fetch failed at build time; carrying on with no dates:', (e as Error).message);
    return [];
  }
}

const today = gymNow().wall.slice(0, 10);
const byKey = new Map(campDates(await readCatalog(), today).map((g) => [g.key, g]));

export interface CampDateGroup extends CampDates {
  title: string;
  /** what one booking buys, in a few words */
  unit: string;
  /** the group's Square booking link */
  href: string;
}

/** Every group, in calendar order of the school year, with its dates (none when it has nothing left). */
export const campDateGroups: CampDateGroup[] = CAMP_DATE_GROUPS.map((g) => ({
  ...(byKey.get(g.key) ?? { key: g.key, runs: [], summary: '' }),
  title: g.title,
  unit: g.unit,
  href: sqUrl('camps', g.linkField),
}));

/** Does any camp have a date left? Decides whether the Dates section and the links to it render. */
export const hasCampDates = campDateGroups.some((g) => g.runs.length > 0);

/** One group's dates in a line ('' when it has none left). */
export const datesSummary = (key: string): string => byKey.get(key)?.summary ?? '';
