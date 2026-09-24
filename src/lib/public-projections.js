// @ts-check
/**
 * The ONE client door to the public schedule and price list (ADR-0154).
 *
 * Both are static, CDN-cached JSON objects in Cloud Storage, republished by the
 * server whenever their source changes (`functions/schedule-publish.js`,
 * `functions/price-list-publish.js`). Every reader goes through here — the
 * schedule embed and print sheet (and so the PDF), the price-list embed and
 * print sheet (and its PDF), the member app, and TMV-Web, which carries a
 * verbatim copy of this file in `src/lib/`. So the URLs are named once per
 * repo, the shape is validated once, and the NEW / ENDING badges are resolved
 * once (`schedule-tags.js`).
 *
 * `fresh: true` appends a cache-buster so the read skips the one-minute CDN
 * cache. Staff surfaces pass it (the admin Open-preview links put `fresh=1` on
 * the page URL): an admin who just saved an edit is looking for exactly that
 * edit. It beats the CDN, not the publish trigger, which can land a few seconds
 * after the save. The anonymous website never passes it — the cache is the
 * point. (The PDF generator needs neither: it answers the print page's request
 * for the object with a payload read live from Firestore.)
 *
 * Browser code on the Safari 13.1 floor (the Square site iframes the embed):
 * no lookbehind, no `??=`, no class fields, no `AbortSignal.timeout`.
 */

import { resolveClassTags } from './schedule-tags.js';

const PROJECTION_BASE = 'https://storage.googleapis.com/tmv-management.firebasestorage.app/public/';

/** The published schedule object. Server side: `SCHEDULE_OBJECT_PATH`. */
export const PUBLIC_SCHEDULE_URL = `${PROJECTION_BASE}schedule.json`;
/** The published price-list object. Server side: `PRICE_LIST_OBJECT_PATH`. */
export const PUBLIC_PRICE_LIST_URL = `${PROJECTION_BASE}price-list.json`;

/** The payload shapes this reader understands. Server side: `*_SCHEMA_VERSION`. */
export const SCHEDULE_SCHEMA_VERSION = 1;
export const PRICE_LIST_SCHEMA_VERSION = 1;

/**
 * @param {string} url
 * @param {boolean} fresh
 * @returns {string}
 */
function projectionUrl(url, fresh) {
  return fresh ? `${url}?t=${Date.now()}` : url;
}

/**
 * Fetch one projection and check it is a shape this reader understands.
 * Throws on a network failure, a non-OK status, or an unknown schemaVersion —
 * a renderer must show its error state, never render a half-understood object.
 *
 * @param {string} url
 * @param {number} schemaVersion
 * @param {string} label - for the error message
 * @returns {Promise<Record<string, any>>}
 */
async function fetchProjection(url, schemaVersion, label) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Public ${label} returned HTTP ${res.status}`);
  const json = await res.json();
  if (!json || typeof json !== 'object') throw new Error(`Public ${label} is not an object`);
  if (json.schemaVersion !== schemaVersion) {
    throw new Error(`Public ${label} has schemaVersion ${json.schemaVersion}, expected ${schemaVersion}`);
  }
  return json;
}

/**
 * The public schedule, with each class's NEW / ENDING badge resolved against
 * this device's clock. Returns a new object; the fetched JSON is not mutated.
 *
 * @param {{fresh?: boolean}} [opts]
 * @returns {Promise<Record<string, any>>}
 */
export async function fetchPublicSchedule({ fresh = false } = {}) {
  const json = await fetchProjection(projectionUrl(PUBLIC_SCHEDULE_URL, fresh), SCHEDULE_SCHEMA_VERSION, 'schedule');
  if (!Array.isArray(json.classes)) throw new Error('Public schedule has no classes array');
  const nowMs = Date.now();
  return { ...json, classes: json.classes.map((c) => resolveClassTags(c, nowMs)) };
}

/**
 * The public price list.
 *
 * @param {{fresh?: boolean}} [opts]
 * @returns {Promise<Record<string, any>>}
 */
export async function fetchPublicPriceList({ fresh = false } = {}) {
  const json = await fetchProjection(projectionUrl(PUBLIC_PRICE_LIST_URL, fresh), PRICE_LIST_SCHEMA_VERSION, 'price list');
  if (!json.priceList || typeof json.priceList !== 'object') throw new Error('Public price list has no priceList map');
  return json;
}
