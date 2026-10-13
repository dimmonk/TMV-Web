// @ts-check
/**
 * The announcement banner's show rules, in one place, run by the build (the
 * banner is rendered or not) and by the browser (a banner that expired since
 * the last build comes down on its own).
 *
 * What Settings -> Banner, hours & social promises:
 *   - "Show the banner on the website" off: the website does not show it.
 *   - "Take it down after <date>": it disappears at the END of that day (the
 *     document stores `YYYY-MM-DDT23:59:59`, gym time).
 *   - A banner needs a headline to show.
 */

/** The time of day a date-only expiry means: the last second of it. */
const END_OF_DAY = 'T23:59:59';

/**
 * A stored expiry as a comparable gym-time stamp, or '' for none. A date-only
 * value means the end of that day; text that does not start with a date is no
 * expiry (the editor shows an empty date for it as well).
 * @param {string} stored
 * @returns {string}
 */
export function expiryStamp(stored) {
  const m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2})(?::(\d{2}))?)?/.exec(typeof stored === 'string' ? stored : '');
  if (!m) return '';
  return m[2] ? `${m[1]}T${m[2]}:${m[3] ?? '59'}` : `${m[1]}${END_OF_DAY}`;
}

/**
 * Has the stored expiry passed?
 * @param {string} stored
 * @param {string} wallNow - `GymNow.wall`
 * @returns {boolean}
 */
export function isExpired(stored, wallNow) {
  const stamp = expiryStamp(stored);
  return stamp !== '' && wallNow > stamp;
}

/**
 * Should the banner show right now?
 * @param {import('./published-config.js').Promo} promo
 * @param {string} wallNow - `GymNow.wall`
 * @returns {boolean}
 */
export function promoIsShown(promo, wallNow) {
  return promo.active && promo.headline !== '' && !isExpired(promo.expiresAt, wallNow);
}
