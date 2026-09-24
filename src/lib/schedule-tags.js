// @ts-check
/**
 * Schedule badges — the ONE place "is this NEW / ENDING badge still showing?"
 * is decided.
 *
 * An admin ticks "Mark as NEW" or "Mark as CANCELLED" (shown as ENDING) on a
 * class; the flag is stamped with when it was set (`isNewSetAt` /
 * `isCancelledSetAt`, db-service) and the badge shows for a fixed number of
 * days after that, then quietly stops — no admin has to come back and untick
 * it.
 *
 * The public schedule is a STATIC object (ADR-0154), so it cannot resolve that
 * against "now" — it would bake in the answer from the moment it was published.
 * It ships the raw flag and stamp instead, and every reader resolves them here,
 * against its own clock:
 *
 *   - `public-projections.fetchPublicSchedule` — every public reader
 *     (embed, print sheet + PDF, member app, TMV-Web);
 *   - `schedule-admin.tagExpiryText` — the "(expires Mar 3)" hint in the
 *     class modal.
 *
 * Pure: no imports, no I/O, no DOM. TMV-Web carries a verbatim copy in
 * `src/lib/` (pinned by `tests/unit/tmv-web-lib-mirror.test.js`).
 */

/** Days a "NEW" badge shows after the admin ticks it. */
export const NEW_TAG_DURATION_DAYS = 30;
/** Days an "ENDING" badge shows after the admin ticks it. */
export const CANCELLED_TAG_DURATION_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Milliseconds for a stamp in any shape a reader holds it in: an ISO string
 * (the public object), a Firestore Timestamp (the admin cache), a Date, or
 * epoch ms. Null when missing or unparseable.
 *
 * @param {any} setAt
 * @returns {number|null}
 */
function stampMs(setAt) {
  if (setAt === null || setAt === undefined || setAt === '') return null;
  let ms;
  if (typeof setAt.toMillis === 'function') ms = setAt.toMillis();
  else if (setAt instanceof Date) ms = setAt.getTime();
  else if (typeof setAt === 'string' || typeof setAt === 'number') ms = new Date(setAt).getTime();
  else return null;
  return Number.isFinite(ms) ? ms : null;
}

/**
 * When a badge set at `setAt` stops showing, in epoch ms. Null when there is no
 * usable stamp (the badge then never expires on its own — see `tagActive`).
 *
 * @param {any} setAt
 * @param {number} days
 * @returns {number|null}
 */
export function tagExpiresAt(setAt, days) {
  const setMs = stampMs(setAt);
  return setMs === null ? null : setMs + days * DAY_MS;
}

/**
 * Whether a badge is showing right now.
 *
 * True only when the flag is set AND its window has not closed. A flag with no
 * stamp counts as showing: data that predates the stamp keeps its badge until
 * an admin re-toggles it (which stamps it) — the rule the old endpoint applied.
 *
 * @param {any} flag
 * @param {any} setAt
 * @param {number} days
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function tagActive(flag, setAt, days, nowMs = Date.now()) {
  if (!flag) return false;
  const expiresMs = tagExpiresAt(setAt, days);
  if (expiresMs === null) return true;
  return nowMs < expiresMs;
}

/**
 * A NEW class object with `isNew` / `isCancelled` resolved to "showing now".
 * The input is not touched, so a renderer reading `c.isNew` / `c.isCancelled`
 * needs no change.
 *
 * @template {{isNew?: any, isNewSetAt?: any, isCancelled?: any, isCancelledSetAt?: any}} T
 * @param {T} c
 * @param {number} [nowMs]
 * @returns {T & {isNew: boolean, isCancelled: boolean}}
 */
export function resolveClassTags(c, nowMs = Date.now()) {
  return {
    ...c,
    isNew: tagActive(c.isNew, c.isNewSetAt, NEW_TAG_DURATION_DAYS, nowMs),
    isCancelled: tagActive(c.isCancelled, c.isCancelledSetAt, CANCELLED_TAG_DURATION_DAYS, nowMs),
  };
}
