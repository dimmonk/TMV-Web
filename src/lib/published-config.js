// @ts-check
/**
 * The published site config, as the website reads it.
 *
 * TMV-Members republishes `settings/siteConfig` to a static CDN object on every
 * staff save (`functions/site-config-publish.js`). That object carries the
 * per-card Square `links`, the announcement `promo`, the opening `hours`, the
 * `social` links, the `closedDays` (dates the whole gym is closed) and the
 * gym's `address`, `phone` and `email`. This is the one reader of its shape:
 * `src/data/site-config.ts` fetches it once per build and hands it here, and
 * every consumer takes its part from the result.
 *
 * Build and browser share this one reader: `fetchPublishedConfig` fetches and
 * validates, and the visibility rules downstream (`site-promo.js`,
 * `opening-hours.js`) are pure functions of its result.
 *
 * The server already validated the payload; this is the last gate before a
 * value reaches an href on the public page, so it validates again and never
 * trusts the shape (a partial or older object reads as empty, not as a throw).
 */

import { gymContactOf, gymPhoneHref, gymEmailHref, GYM_ADDRESS_KEYS } from './gym-contact.js';

/** The published object. Server side: `SITE_CONFIG_OBJECT_PATH` (`functions/site-config-publish.js`). */
export const PUBLISHED_CONFIG_URL = 'https://storage.googleapis.com/tmv-management.firebasestorage.app/public/site-config.json';

export const SOCIAL_KEYS = Object.freeze(['instagram', 'facebook', 'youtube']);

/**
 * The most each published value may hold, in characters (rows for
 * `hoursRows`). TMV-Members holds the document to these in its rules, refuses
 * them at Save and never publishes past them (`SITE_CONFIG_LIMITS` in
 * `functions/site-config-publish.js`, kept in step by hand); this reader drops a
 * value past its limit again (as unset), so a value that got round all of that
 * still cannot take over a page.
 */
export const LIMITS = Object.freeze({
  url: 500,
  headline: 120,
  body: 280,
  ctaLabel: 40,
  hoursRows: 14,
  hoursDay: 40,
  hoursTime: 80,
  closedDays: 12,
  closedReason: 80,
  street: 80,
  city: 60,
  region: 40,
  postalCode: 12,
  phone: 30,
  email: 100,
});

/** A closed day: a gym calendar day, what the members app writes. */
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/** A stored banner expiry: gym-time `YYYY-MM-DDTHH:MM:SS`, what the members app writes. */
const EXPIRY_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

/** @type {Promo} The banner when there is none to show: no text at all. */
const NO_PROMO = Object.freeze({ active: false, headline: '', body: '', ctaLabel: '', ctaUrl: '', expiresAt: '' });

/**
 * @typedef {Object} Promo
 * @property {boolean} active
 * @property {string} headline
 * @property {string} body
 * @property {string} ctaLabel
 * @property {string} ctaUrl
 * @property {string} expiresAt - `YYYY-MM-DDTHH:MM:SS` gym time (the end of the chosen day), or ''.
 *
 * @typedef {Object} PublishedConfig
 * @property {Record<string, Record<string, string>>|null} links - null when the object was not an object at all.
 * @property {Promo} promo
 * @property {{day: string, time: string}[]} hours
 * @property {Record<string, string>} social - every key of `SOCIAL_KEYS`, '' where unset.
 * @property {{date: string, reason: string}[]} closedDays - soonest first; past days are the reader's to drop.
 * @property {Contact} contact
 *
 * @typedef {Object} Contact
 * @property {{street: string, city: string, region: string, postalCode: string}} address - '' where unset.
 * @property {string} phone - as staff typed it, shown verbatim; '' when unset.
 * @property {string} email - '' when unset or not one address.
 */

/** @param {unknown} v @returns {string} */
const text = (v) => (typeof v === 'string' ? v.trim() : '');

/** @param {unknown} v @param {number} limit @returns {string} The text, or '' when it is past its limit. */
const bounded = (v, limit) => {
  const t = text(v);
  return t.length <= limit ? t : '';
};

/**
 * Is any social link set? Decides whether the wrapper around them shows.
 * @param {Record<string, string>} social
 * @returns {boolean}
 */
export const hasSocial = (social) => Object.values(social).some(Boolean);

/** @param {unknown} v @returns {string} Only http(s) within the URL limit survives. */
function safeUrl(v) {
  const s = bounded(v, LIMITS.url);
  if (!s) return '';
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:' ? s : '';
  } catch {
    return '';
  }
}

/** @param {unknown} v @returns {Record<string, any>} */
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? /** @type {Record<string, any>} */ (v) : {});

/**
 * The per-card Square links: every value is a http(s) URL or '' (unset, so the
 * card keeps its default). They reach `href`s on the build and in the browser,
 * so they get the same gate as the social links.
 * @param {unknown} v
 * @returns {Record<string, Record<string, string>>|null} null when the object carried no `links` object at all.
 */
function readLinks(v) {
  if (!v || typeof v !== 'object') return null;
  /** @type {Record<string, Record<string, string>>} */
  const links = {};
  Object.entries(v).forEach(([page, fields]) => {
    if (!fields || typeof fields !== 'object') return;
    links[page] = {};
    Object.entries(fields).forEach(([field, url]) => { links[page][field] = safeUrl(url); });
  });
  return links;
}

/**
 * @param {unknown} data - the parsed published JSON, or null when there is none
 * @returns {PublishedConfig}
 */
export function readPublishedConfig(data) {
  const d = obj(data);
  const p = obj(d.promo);
  const s = obj(d.social);
  /** @type {Record<string, string>} */
  const social = {};
  SOCIAL_KEYS.forEach((k) => { social[k] = safeUrl(s[k]); });
  return {
    links: readLinks(d.links),
    promo: readPromo(p),
    hours: (Array.isArray(d.hours) ? d.hours : [])
      .map((h) => ({ day: text(obj(h).day), time: text(obj(h).time) }))
      .filter((h) => h.day.length <= LIMITS.hoursDay && h.time.length <= LIMITS.hoursTime)
      .filter((h) => h.day || h.time)
      .slice(0, LIMITS.hoursRows),
    social,
    closedDays: readClosedDays(d.closedDays),
    contact: readContact(d),
  };
}

/**
 * The days the whole gym is closed. A row with no readable date is dropped; a reason past its limit reads as none
 * (the day is still closed). Sorted by date, at most `LIMITS.closedDays`.
 * @param {unknown} v
 * @returns {{date: string, reason: string}[]}
 */
function readClosedDays(v) {
  return (Array.isArray(v) ? v : [])
    .map((r) => ({ date: text(obj(r).date), reason: bounded(obj(r).reason, LIMITS.closedReason) }))
    .filter((r) => DATE_FORMAT.test(r.date))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(0, LIMITS.closedDays);
}

/**
 * The gym's address, phone and email, read the way TMV-Members publishes them
 * (`gymContactOf`): every part bounded, and a phone nobody can dial or an email
 * that is not one address reads as unset.
 * @param {Record<string, any>} d
 * @returns {Contact}
 */
function readContact(d) {
  const c = gymContactOf(d);
  const address = { street: '', city: '', region: '', postalCode: '' };
  GYM_ADDRESS_KEYS.forEach((k) => {
    const key = /** @type {keyof Contact['address']} */ (k);
    address[key] = bounded(c.address[key], LIMITS[key]);
  });
  const phone = bounded(c.phone, LIMITS.phone);
  const email = bounded(c.email, LIMITS.email);
  return { address, phone: gymPhoneHref(phone) ? phone : '', email: gymEmailHref(email) ? email : '' };
}

/**
 * The banner, read the way the members app publishes it: off means no text at
 * all, and an expiry that is not `YYYY-MM-DDTHH:MM:SS` means off (an expiry
 * nobody can read must not mean "never expires").
 * @param {Record<string, any>} p
 * @returns {Promo}
 */
function readPromo(p) {
  const expiresAt = text(p.expiresAt);
  if (p.active !== true || (expiresAt !== '' && !EXPIRY_FORMAT.test(expiresAt))) return { ...NO_PROMO };
  return {
    active: true,
    headline: bounded(p.headline, LIMITS.headline),
    body: bounded(p.body, LIMITS.body),
    ctaLabel: bounded(p.ctaLabel, LIMITS.ctaLabel),
    ctaUrl: safeUrl(p.ctaUrl),
    expiresAt,
  };
}

/**
 * Fetch the published object and read it. Throws on a network failure, a
 * timeout, a non-OK status or a body that is not an object; the caller decides
 * what failing means (the build warns and renders nothing, the browser warns and
 * keeps what was built).
 *
 * @param {string} url
 * @param {Object} [opts]
 * @param {RequestInit} [opts.init] - e.g. `{cache: 'no-cache'}` in the browser
 * @param {number} [opts.timeoutMs]
 * @param {typeof fetch} [opts.fetchFn]
 * @returns {Promise<PublishedConfig>}
 */
export async function fetchPublishedConfig(url, { init = {}, timeoutMs = 8000, fetchFn = fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(url, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    if (!data || typeof data !== 'object') throw new Error('not an object');
    return readPublishedConfig(data);
  } finally {
    clearTimeout(timer);
  }
}
