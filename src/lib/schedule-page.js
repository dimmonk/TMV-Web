// @ts-check
/**
 * The desktop schedule (the site chrome of /schedule): filter pills, the week bar, the Schedule changes card, the
 * dated week grid and the class popup, over the Members schedule projection and the site config's closed days.
 *
 * State is one frozen object, replaced on every change; each change redraws from it. The phone list is
 * `mobile-schedule.ts`, over the same week logic (`schedule-weeks.js`) and the same bar and card
 * (`schedule-week-view.js`).
 */
import { matchesFilter } from './print-schedule-sheet.js';
import { fetchPublicSchedule } from './public-projections.js';
import {
  gymToday, visibleWeeks, weekIndexOf, scheduleExceptions, sessionsForWeek, closedDaysOf, upcomingChanges, openGymSessions,
} from './schedule-weeks.js';
import { weekBar, changesCard, renderWeekGrid, mountClassPopup } from './schedule-week-view.js';

const FILTERS = ['all', 'kids', 'teens', 'adults', 'athletic', 'open-gym'];

/** @param {string} filter */
const sectionOf = (filter) => (filter === 'athletic' ? 'athletic' : filter === 'open-gym' ? 'open_gym' : 'classes');

/**
 * @param {HTMLElement} root - holds `[data-sched-filters]` (buttons with `data-filter`), `[data-sched-top]` and
 *   `[data-sched-week]`
 * @param {{ siteConfig: () => Promise<{hours: {day: string, time: string}[], closedDays: {date: string, reason: string}[]}> }} sources
 *   the published site config: its opening hours (Open Gym) and closed days
 */
export async function mountSchedulePage(root, { siteConfig }) {
  const filters = /** @type {HTMLElement|null} */ (root.querySelector('[data-sched-filters]'));
  const top = /** @type {HTMLElement|null} */ (root.querySelector('[data-sched-top]'));
  const weekRoot = /** @type {HTMLElement|null} */ (root.querySelector('[data-sched-week]'));
  if (!filters || !top || !weekRoot) return;

  weekRoot.replaceChildren(Object.assign(document.createElement('p'), { className: 'ws-note', textContent: 'Loading the schedule…' }));
  /** @type {Record<string, any>} */
  let schedule;
  /** @type {{hours: {day: string, time: string}[], closedDays: {date: string, reason: string}[]}} */
  let config;
  try {
    [schedule, config] = await Promise.all([fetchPublicSchedule(), siteConfig().catch(() => ({ hours: [], closedDays: [] }))]);
  } catch (err) {
    console.error('[schedule] load failed', err);
    weekRoot.replaceChildren(Object.assign(document.createElement('p'), { className: 'ws-note is-error', textContent: 'Unable to load the schedule. Please refresh.' }));
    return;
  }

  const today = gymToday();
  const weeks = visibleWeeks(today);
  const exceptions = scheduleExceptions({ cancellations: schedule.cancellations, closedDays: config.closedDays });
  const classes = /** @type {any[]} */ (schedule.classes);
  const open = mountClassPopup(root);

  // A link (?filter=) wins, then staff's saved default (Members, schedule display), then All. A link's ?date=
  // (a Schedule changes date on another page) opens that date's week.
  const params = new URLSearchParams(window.location.search);
  const urlFilter = params.get('filter') || '';
  const saved = schedule.scheduleDisplay?.filter || '';
  /** @type {Readonly<{week: number, filter: string}>} */
  let state = Object.freeze({
    week: Math.max(0, weekIndexOf(weeks, params.get('date') || '')),
    filter: FILTERS.includes(urlFilter) ? urlFilter : FILTERS.includes(saved) ? saved : 'all',
  });
  /** @param {Partial<typeof state>} patch */
  const update = (patch) => { state = Object.freeze({ ...state, ...patch }); render(); };

  function render() {
    filters?.querySelectorAll('[data-filter]').forEach((b) => {
      const on = /** @type {HTMLElement} */ (b).dataset.filter === state.filter;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const monday = weeks[state.week];
    top?.replaceChildren(...[
      weekBar({ weeks, index: state.week, onStep: (week) => update({ week }) }),
      changesCard({ changes: upcomingChanges(classes, today, exceptions), onGoto: (date) => update({ week: Math.max(0, weekIndexOf(weeks, date)) }) }),
    ].filter((n) => n !== null));
    const openGym = state.filter === 'open-gym';
    const base = openGym ? openGymSessions(config.hours) : classes.filter((c) => matchesFilter(c, state.filter));
    renderWeekGrid(/** @type {HTMLElement} */ (weekRoot), {
      sessions: sessionsForWeek(base, monday, exceptions),
      monday,
      today,
      closed: closedDaysOf(monday, exceptions),
      section: sectionOf(state.filter),
      // Open Gym is the open hours: a popup would add nothing to the block itself.
      onClassClick: openGym ? undefined : open,
    });
  }

  filters.querySelectorAll('[data-filter]').forEach((b) => {
    b.addEventListener('click', () => update({ filter: /** @type {HTMLElement} */ (b).dataset.filter || 'all' }));
  });
  render();
}
