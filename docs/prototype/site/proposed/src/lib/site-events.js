// @ts-check
/**
 * Special events: the gym's public happenings staff list in the members app (Settings -> Website -> Special events,
 * TMV-Members ADR-0275), published as `events` on the site config. Drawn in the browser from the same object the
 * rest of the config refreshes from (`live-site-config.ts` `publishedSiteConfig`), like the Schedule changes card, so a
 * staff save shows with no release and a past event drops off on its own. No event, or a failed read, leaves every
 * host hidden: no empty section.
 *
 * Built from parts the site already ships: the price list's card (`price-list-web.css`: white card, 2px category
 * rule under an Archivo title, the group label band, body rows and the bottom action), in the events colour. Every
 * published value reaches the page as `textContent` or an attribute; the link and the photo were gated by the reader
 * (`published-config.js`).
 */
import { dayAndDate } from './schedule-weeks.js';
import { fmtClassTimeRange } from './print-schedule-sheet.js';

/** The home card lists this many; the Events page lists them all. */
export const COMING_UP_COUNT = 3;

/**
 * @param {import('./published-config.js').SiteEvent[]} events - soonest first, as the reader gives them
 * @param {string} today - the gym's `YYYY-MM-DD`
 * @returns {import('./published-config.js').SiteEvent[]} the ones from today on
 */
export const upcomingEvents = (events, today) => events.filter((e) => e.date >= today);

/** '6:00 – 9:00 PM' @param {{start: string, end: string}} e */
export const eventTime = (e) => fmtClassTimeRange(e.start, e.end, { suffix: 'long', sep: '–' });

/**
 * An element of `doc` (the page, or a test's jsdom page).
 * @param {Document} doc
 * @returns {(tag: string, attrs?: Record<string, any>, children?: Array<Node|string|null|undefined|false>) => HTMLElement}
 */
const maker = (doc) => (tag, attrs = {}, children = []) => {
  const node = doc.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false || v === '') continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children) if (c) node.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c);
  return node;
};

/**
 * One event as a price list card: its photo, title, day band, hours and note, and its link as the card's action.
 * @param {Document} doc
 * @param {import('./published-config.js').SiteEvent} e
 * @returns {HTMLElement}
 */
export function eventCard(doc, e) {
  const el = maker(doc);
  const icon = (/** @type {string} */ name) => el('i', { class: `bi bi-${name}`, 'aria-hidden': 'true' });
  return el('article', { class: 'pw-card se-card', 'data-event': e.id }, [
    e.photoUrl ? el('img', { class: 'se-photo', src: e.photoUrl, alt: e.title, loading: 'lazy' }) : null,
    el('div', { class: 'pw-head' }, [el('h3', { class: 'pw-title', text: e.title })]),
    el('div', { class: 'pw-glabel', text: dayAndDate(e.date) }),
    el('ul', { class: 'pw-items' }, [
      el('li', { class: 'pw-item' }, [el('div', { class: 'pw-row' }, [el('span', { class: 'pw-label', text: eventTime(e) })])]),
    ]),
    e.note ? el('ul', { class: 'pw-bullets' }, [el('li', { text: e.note })]) : null,
    e.link ? el('a', { class: 'pw-action', href: e.link, target: '_blank', rel: 'noopener' }, ['Details', icon('arrow-up-right')]) : null,
  ]);
}

/**
 * The home page's card: the next few events, one row each, and the way to the Events page.
 * @param {Document} doc
 * @param {import('./published-config.js').SiteEvent[]} events - upcoming, soonest first
 * @param {string} href - the Events page's special events section
 * @returns {HTMLElement}
 */
export function comingUpCard(doc, events, href) {
  const el = maker(doc);
  const icon = (/** @type {string} */ name) => el('i', { class: `bi bi-${name}`, 'aria-hidden': 'true' });
  const shown = events.slice(0, COMING_UP_COUNT);
  return el('article', { class: 'pw-card se-card' }, [
    el('div', { class: 'pw-head' }, [el('h3', { class: 'pw-title', text: 'Coming up at the gym' })]),
    el('ul', { class: 'pw-items' }, shown.map((e, i) => el('li', { class: `pw-item${i > 0 ? ' pw-item-separated' : ''}` }, [
      el('div', { class: 'pw-row' }, [el('span', { class: 'pw-label', text: e.title }), el('span', { class: 'pw-amount', text: dayAndDate(e.date) })]),
      el('ul', { class: 'pw-bullets' }, [el('li', { text: e.note ? `${eventTime(e)} · ${e.note}` : eventTime(e) })]),
    ]))),
    el('a', { class: 'pw-action', href }, [events.length > shown.length ? `All ${events.length} events` : 'See the events', icon('arrow-right')]),
  ]);
}

/**
 * Draw the events into every host, or hide them all. A host is `[data-site-events="list"]` (the Events page's
 * section: one card per event into its `[data-site-events-cards]`) or `[data-site-events="next"]` (the home card,
 * linking to `data-events-href`).
 * @param {Document} doc
 * @param {import('./published-config.js').SiteEvent[]} events
 * @param {string} today - the gym's `YYYY-MM-DD`
 */
export function applySiteEvents(doc, events, today) {
  const upcoming = upcomingEvents(events, today);
  doc.querySelectorAll('[data-site-events]').forEach((node) => {
    const host = /** @type {HTMLElement} */ (node);
    host.hidden = upcoming.length === 0;
    if (host.dataset.siteEvents === 'next') {
      host.replaceChildren(...(upcoming.length ? [comingUpCard(doc, upcoming, host.dataset.eventsHref ?? '')] : []));
      return;
    }
    host.querySelector('[data-site-events-cards]')?.replaceChildren(...upcoming.map((e) => eventCard(doc, e)));
  });
}
