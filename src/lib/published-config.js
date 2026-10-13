// @ts-check
/**
 * The published site config, as the website reads it.
 *
 * TMV-Members republishes `settings/siteConfig` to a static CDN object on every
 * staff save (`functions/site-config-publish.js`). That object carries the
 * per-card Square `links`, the announcement `promo`, the opening `hours` and the
 * `social` links. This is the one reader of its shape: `src/data/site-config.ts`
 * fetches it once per build and hands it here, and every consumer takes its
 * part from the result.
 *
 * Build and browser share this one reader: `fetchPublishedConfig` fetches and
 * validates, and the visibility rules downstream (`site-promo.js`,
 * `opening-hours.js`) are pure functions of its result.
 *
 * The server already validated the payload; this is the last gate before a
 * value reaches an href on the public page, so it validates again and never
 * trusts the shape (a partial or older object reads as empty, not as a throw).
 */

/** The published object. Server side: `SITE_CONFIG_OBJECT_PATH` (`functions/site-config-publish.js`). */
export const PUBLISHED_CONFIG_URL = 'https://storage.googleapis.com/tmv-management.firebasestorage.app/public/site-config.json';

export const SOCIAL_KEYS = Object.freeze(['instagram', 'facebook', 'youtube']);

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
 */

/** @param {unknown} v @returns {string} */
const text = (v) => (typeof v === 'string' ? v.trim() : '');

/**
 * Is any social link set? Decides whether the wrapper around them shows.
 * @param {Record<string, string>} social
 * @returns {boolean}
 */
export const hasSocial = (social) => Object.values(social).some(Boolean);

/** @param {unknown} v @returns {string} Only http(s) survives. */
function safeUrl(v) {
  const s = text(v);
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
    promo: {
      active: p.active === true,
      headline: text(p.headline),
      body: text(p.body),
      ctaLabel: text(p.ctaLabel),
      ctaUrl: safeUrl(p.ctaUrl),
      expiresAt: text(p.expiresAt),
    },
    hours: (Array.isArray(d.hours) ? d.hours : [])
      .map((h) => ({ day: text(obj(h).day), time: text(obj(h).time) }))
      .filter((h) => h.day || h.time),
    social,
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
