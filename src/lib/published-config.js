// @ts-check
/**
 * The published site config, as the website reads it.
 *
 * TMV-Members republishes `settings/siteConfig` to a static CDN object on every
 * staff save (`functions/site-config-publish.js`). That object carries the
 * per-card Square `links`, the dated announcement `banners`, the opening `hours`,
 * the `social` links, the `closedDays` (dates the whole gym is closed), the
 * special `events` and the gym's `address`, `phone` and `email`. This is the one reader of its shape:
 * `src/data/site-config.ts` fetches it once per build and hands it here, and
 * every consumer takes its part from the result.
 *
 * Build and browser share this one reader: `fetchPublishedConfig` fetches and
 * validates, and the visibility rules downstream (`site-banner.js`,
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
 * `hoursRows`, banners for `banners`). TMV-Members holds the document to these in its rules, refuses
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
  banners: 24,
  hoursRows: 14,
  hoursDay: 40,
  hoursTime: 80,
  closedDays: 12,
  closedReason: 80,
  events: 12,
  eventTitle: 60,
  eventNote: 80,
  eventLink: 300,
  street: 80,
  city: 60,
  region: 40,
  postalCode: 12,
  phone: 30,
  email: 100,
});

/** A closed day or a banner's first and last day: a gym calendar day, what the members app writes. */
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/** An event's start or end: `HH:MM`, 24-hour gym time, what the members app writes. */
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Where an event photo lives: the members app's public event folder in Firebase Storage (TMV-Members ADR-0275,
 * `siteEventPhotoUrl`). A photo address anywhere else reads as no photo, and this is the one image origin the
 * hosting's Content-Security-Policy lets the website show it from.
 */
export const EVENT_PHOTO_PREFIX = 'https://firebasestorage.googleapis.com/v0/b/tmv-management.firebasestorage.app/o/public%2Fsite-events%2F';

/**
 * @typedef {Object} SiteEvent
 * @property {string} id
 * @property {string} title - never ''.
 * @property {string} date - `YYYY-MM-DD`, gym day.
 * @property {string} start - `HH:MM`.
 * @property {string} end - `HH:MM`, after `start`.
 * @property {string} note - one line, '' when none.
 * @property {string} link - http(s), '' when none.
 * @property {string} photoUrl - an address under `EVENT_PHOTO_PREFIX`, '' when none.
 *
 * @typedef {Object} Banner
 * @property {string} headline - never ''.
 * @property {string} body - '' when none.
 * @property {string} ctaLabel - '' when none.
 * @property {string} ctaUrl - '' when none.
 * @property {string} from - the first day it shows, `YYYY-MM-DD` gym time.
 * @property {string} to - the last day it shows (to its end), on or after `from`.
 *
 * @typedef {Object} PublishedConfig
 * @property {Record<string, Record<string, string>>|null} links - null when the object was not an object at all.
 * @property {Banner[]} banners - soonest first; the one whose days include today shows (`bannerOn`).
 * @property {{day: string, time: string}[]} hours
 * @property {Record<string, string>} social - every key of `SOCIAL_KEYS`, '' where unset.
 * @property {{date: string, reason: string}[]} closedDays - soonest first; past days are the reader's to drop.
 * @property {SiteEvent[]} events - soonest first; past events are the reader's to drop (`upcomingEvents`).
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
  const s = obj(d.social);
  /** @type {Record<string, string>} */
  const social = {};
  SOCIAL_KEYS.forEach((k) => { social[k] = safeUrl(s[k]); });
  return {
    links: readLinks(d.links),
    banners: readBanners(d.banners),
    hours: (Array.isArray(d.hours) ? d.hours : [])
      .map((h) => ({ day: text(obj(h).day), time: text(obj(h).time) }))
      .filter((h) => h.day.length <= LIMITS.hoursDay && h.time.length <= LIMITS.hoursTime)
      .filter((h) => h.day || h.time)
      .slice(0, LIMITS.hoursRows),
    social,
    closedDays: readClosedDays(d.closedDays),
    events: readEvents(d.events),
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
 * The special events, read the way the members app publishes them (`buildSiteEvents`): one with no title or a
 * title past its limit, a day that is not `YYYY-MM-DD`, or times that are not `HH:MM` with the end after the start
 * is dropped whole; a note past its limit or on more than one line reads as none, a link that is not http(s) within
 * its limit reads as none, and so does a photo outside the event photo folder. Soonest first, at most `LIMITS.events`.
 * @param {unknown} v
 * @returns {SiteEvent[]}
 */
function readEvents(v) {
  return (Array.isArray(v) ? v : [])
    .map((raw) => {
      const e = obj(raw);
      const note = bounded(e.note, LIMITS.eventNote);
      const link = safeUrl(e.link);
      const photoUrl = safeUrl(e.photoUrl);
      return {
        id: text(e.id),
        title: bounded(e.title, LIMITS.eventTitle),
        date: text(e.date),
        start: text(e.start),
        end: text(e.end),
        note: /[\r\n]/.test(note) ? '' : note,
        link: link.length <= LIMITS.eventLink ? link : '',
        photoUrl: photoUrl.startsWith(EVENT_PHOTO_PREFIX) ? photoUrl : '',
      };
    })
    .filter((e) => e.title !== '' && DATE_FORMAT.test(e.date) && TIME_FORMAT.test(e.start) && TIME_FORMAT.test(e.end) && e.start < e.end)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
    .slice(0, LIMITS.events);
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
 * The year's banners, read the way the members app publishes them (`buildBanners`): a banner with no headline,
 * a day that is not `YYYY-MM-DD` or a last day before its first is dropped whole, a message or button text past
 * its limit reads as none, and a button link that is not http(s) reads as none. Soonest first, at most
 * `LIMITS.banners`; the ones that are over are the publisher's to drop and never match today anyway.
 * @param {unknown} v
 * @returns {Banner[]}
 */
function readBanners(v) {
  return (Array.isArray(v) ? v : [])
    .map((raw) => {
      const b = obj(raw);
      return {
        headline: bounded(b.headline, LIMITS.headline),
        body: bounded(b.body, LIMITS.body),
        ctaLabel: bounded(b.ctaLabel, LIMITS.ctaLabel),
        ctaUrl: safeUrl(b.ctaUrl),
        from: text(b.from),
        to: text(b.to),
      };
    })
    .filter((b) => b.headline !== '' && DATE_FORMAT.test(b.from) && DATE_FORMAT.test(b.to) && b.from <= b.to)
    .sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : a.to < b.to ? -1 : a.to > b.to ? 1 : 0))
    .slice(0, LIMITS.banners);
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
