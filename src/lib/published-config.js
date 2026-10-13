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
 * The server already validated the payload; this is the last gate before a
 * value reaches an href on the public page, so it validates again and never
 * trusts the shape (a partial or older object reads as empty, not as a throw).
 */

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
    links: d.links && typeof d.links === 'object' ? d.links : null,
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
