// @ts-check
/**
 * Re-apply the published site config to a page that was built from an older
 * copy of it.
 *
 * The build renders the first paint (no-JS, SEO). On page load the browser
 * fetches the same published object (`live-site-config.ts`) and this brings
 * the DOM in line with it, in place and only where a hook exists:
 *
 *   a[data-sq="page.field"]          a Square link (resolved by `linkFor`)
 *   [data-promo] + data-promo-*      the announcement banner
 *   [data-hours-list|card|heading]   the About page's hours, rows cloned from
 *   <template data-hours-row>        the build's own markup (so its scoped styles apply)
 *   [data-hours-summary] (+ -wrap)   the one-line summary
 *   [data-hours-stat]                the hero tile (and the About "days" tile)
 *   [data-status]                    the open/closed pill's week
 *   [data-social] / [data-socials-wrap]
 *   [data-contact="phone|email|street|locality|line"]  the gym's contact, as text
 *     (an <a> also gets its tel:/mailto: href); [data-contact-href="phone|email|directions"]
 *     a link to it; [data-contact-wrap="phone|email|address"] the whole line around it
 *
 * The visibility rules are the build's own: it calls the same pure functions
 * (`bannerOn`, `hoursSummary`, ...) on the same reader's result, so there
 * is no second definition. Empty renders nothing: a hook with nothing to show
 * is `hidden`, never left empty and visible. JSON-LD is not touched (build only).
 */

import { bannerOn, bannerButton, gymDay } from './site-banner.js';
import { hasSocial } from './published-config.js';
import { contactView, CONTACT_PARTS } from './contact-view.js';
import { weekSchedule, hasOpenDays, hoursSummary, hoursHeading, hoursStat } from './opening-hours.js';

/** Fired on the document after the config was applied; the pill repaints on it. */
export const SITE_CONFIG_APPLIED = 'tmv:site-config';

/** @param {Element|null} el @param {string|null|undefined} text */
function setText(el, text) {
  if (el && el.textContent !== (text ?? '')) el.textContent = text ?? '';
}

/**
 * @param {Document} doc
 * @param {import('./published-config.js').PublishedConfig} config
 * @param {Object} ctx
 * @param {(page: string, field: string) => string} ctx.linkFor - the resolved Square link for a slot
 * @param {import('./gym-clock.js').GymNow} ctx.now
 */
export function applyPublishedConfig(doc, config, { linkFor, now }) {
  applyLinks(doc, linkFor);
  applyPromo(doc, bannerOn(config.banners, gymDay(now.wall)));
  applyHours(doc, config.hours);
  applySocial(doc, config.social);
  applyContact(doc, config.contact);
  doc.dispatchEvent(new (doc.defaultView?.Event ?? Event)(SITE_CONFIG_APPLIED));
}

/** @param {Document} doc @param {(page: string, field: string) => string} linkFor */
function applyLinks(doc, linkFor) {
  doc.querySelectorAll('a[data-sq]').forEach((a) => {
    const [page, field] = (a.getAttribute('data-sq') ?? '').split('.');
    const href = page && field ? linkFor(page, field) : '';
    if (href && a.getAttribute('href') !== href) a.setAttribute('href', href);
  });
}

/** @param {Document} doc @param {import('./published-config.js').Banner|null} promo - today's banner, or null */
function applyPromo(doc, promo) {
  const el = /** @type {HTMLElement|null} */ (doc.querySelector('[data-promo]'));
  if (!el) return;
  if (!promo) { el.hidden = true; return; }
  el.dataset.from = promo.from;
  el.dataset.to = promo.to;
  setText(el.querySelector('[data-promo-head]'), promo.headline);
  const body = /** @type {HTMLElement|null} */ (el.querySelector('[data-promo-body]'));
  setText(body, promo.body);
  if (body) body.hidden = promo.body === '';
  const cta = /** @type {HTMLAnchorElement|null} */ (el.querySelector('[data-promo-cta]'));
  if (cta) {
    const button = bannerButton(promo);
    cta.hidden = !button;
    if (button) { setText(cta, button.label); cta.setAttribute('href', button.href); }
  }
  el.hidden = false;
}

/** @param {Document} doc @param {import('./opening-hours.js').HoursRow[]} hours */
function applyHours(doc, hours) {
  applyHoursCard(doc, hours);
  const summary = hoursSummary(hours);
  doc.querySelectorAll('[data-hours-summary]').forEach((el) => {
    setText(el, summary);
    const wrap = /** @type {HTMLElement} */ (el.closest('[data-hours-wrap]') ?? el);
    wrap.hidden = summary === '';
  });
  const stat = hoursStat(hours);
  doc.querySelectorAll('[data-hours-stat]').forEach((tile) => {
    const el = /** @type {HTMLElement} */ (tile);
    el.hidden = stat === null;
    if (!stat) return;
    setText(el.querySelector('[data-stat-value]'), stat.value);
    const variant = el.dataset.statVariant;
    if (variant !== 'days') setText(el.querySelector('[data-stat-label]'), variant === 'mobile' ? stat.mobileLabel : stat.label);
  });
  const week = weekSchedule(hours);
  doc.querySelectorAll('[data-status]').forEach((pill) => {
    pill.setAttribute('data-week', JSON.stringify(week));
    /** @type {HTMLElement} */ (pill).hidden = !hasOpenDays(week);
  });
}

/** @param {Document} doc @param {import('./opening-hours.js').HoursRow[]} hours */
function applyHoursCard(doc, hours) {
  const card = /** @type {HTMLElement|null} */ (doc.querySelector('[data-hours-card]'));
  if (!card) return;
  card.hidden = hours.length === 0;
  setText(card.querySelector('[data-hours-heading]'), hoursHeading(hours));
  const list = card.querySelector('[data-hours-list]');
  const template = /** @type {HTMLTemplateElement|null} */ (card.querySelector('template[data-hours-row]'));
  if (!list || !template) return;
  const lines = [...list.querySelectorAll('[data-hours-line]')];
  const same = lines.length === hours.length && lines.every((line, i) =>
    line.querySelector('[data-day]')?.textContent === hours[i].day && line.querySelector('[data-time]')?.textContent === hours[i].time);
  if (same) return;
  lines.forEach((line) => line.remove());
  hours.forEach((row) => {
    const line = /** @type {HTMLElement|undefined} */ (template.content.firstElementChild?.cloneNode(true));
    if (!line) return;
    line.setAttribute('data-hours-line', '');
    setText(line.querySelector('[data-day]'), row.day);
    setText(line.querySelector('[data-time]'), row.time);
    list.appendChild(line);
  });
}

/** @param {Document} doc @param {Record<string, string>} social */
function applySocial(doc, social) {
  doc.querySelectorAll('[data-social]').forEach((a) => {
    const url = social[a.getAttribute('data-social') ?? ''] ?? '';
    /** @type {HTMLElement} */ (a).hidden = url === '';
    if (url) a.setAttribute('href', url); else a.removeAttribute('href');
  });
  doc.querySelectorAll('[data-socials-wrap]').forEach((wrap) => {
    /** @type {HTMLElement} */ (wrap).hidden = !hasSocial(social);
  });
}

/** @param {Document} doc @param {import('./published-config.js').Contact} contact */
function applyContact(doc, contact) {
  const view = contactView(contact);
  doc.querySelectorAll('[data-contact]').forEach((node) => {
    const el = /** @type {HTMLElement} */ (node);
    const key = /** @type {'phone'|'email'|'street'|'locality'|'line'} */ (el.dataset.contact);
    const text = view[key] ?? '';
    setText(el, text);
    el.hidden = text === '';
    const href = key === 'phone' || key === 'email' ? view.href[key] : '';
    if (el.tagName === 'A' && href) el.setAttribute('href', href);
  });
  doc.querySelectorAll('[data-contact-href]').forEach((node) => {
    const el = /** @type {HTMLElement} */ (node);
    const href = view.href[/** @type {'phone'|'email'|'directions'} */ (el.dataset.contactHref)] ?? '';
    el.hidden = href === '';
    if (href) el.setAttribute('href', href); else el.removeAttribute('href');
  });
  doc.querySelectorAll('[data-contact-wrap]').forEach((node) => {
    const el = /** @type {HTMLElement} */ (node);
    const part = CONTACT_PARTS[/** @type {keyof typeof CONTACT_PARTS} */ (el.dataset.contactWrap)];
    el.hidden = !part || part(view) === '';
  });
}
