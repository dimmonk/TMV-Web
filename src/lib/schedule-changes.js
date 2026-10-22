// @ts-check
/**
 * The Schedule changes card outside /schedule (the home page, `ScheduleChanges.astro`): staff's cancelled class dates
 * and closed days through the last visible week, the same list and card the schedule page draws (`upcomingChanges`,
 * `changesCard`). Nothing to list, or a failed read, leaves every host hidden. A date opens /schedule on its week
 * (`?date=`).
 */
import { fetchPublicSchedule } from './public-projections.js';
import { gymToday, scheduleExceptions, upcomingChanges } from './schedule-weeks.js';
import { changesCard } from './schedule-week-view.js';

/**
 * @param {HTMLElement[]} hosts - each carries `data-schedule-href`, the schedule page's URL
 * @param {{ siteConfig: () => Promise<{closedDays: {date: string, reason: string}[]}> }} sources
 */
export async function mountScheduleChanges(hosts, { siteConfig }) {
  if (!hosts.length) return;
  /** @type {Record<string, any>} */
  let schedule;
  /** @type {{closedDays: {date: string, reason: string}[]}} */
  let config;
  try {
    [schedule, config] = await Promise.all([fetchPublicSchedule(), siteConfig().catch(() => ({ closedDays: [] }))]);
  } catch (err) {
    console.warn('[schedule-changes] load failed', err);
    return;
  }
  const exceptions = scheduleExceptions({ cancellations: schedule.cancellations, closedDays: config.closedDays });
  const changes = upcomingChanges(/** @type {any[]} */ (schedule.classes), gymToday(), exceptions);
  hosts.forEach((host) => {
    const card = changesCard({
      changes,
      onGoto: (date) => { window.location.assign(`${host.dataset.scheduleHref}?date=${date}`); },
    });
    host.replaceChildren(...(card ? [card] : []));
    host.hidden = !card;
  });
}
