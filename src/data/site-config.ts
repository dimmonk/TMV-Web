/**
 * The published site config: the ONE fetch, and the ONE place its parts are
 * taken from.
 *
 * Staff edit the Square links, the announcement banner, the opening hours and
 * the social links in the members app (Settings -> Booking & buy links, and
 * Banner, hours & social). Every save republishes `settings/siteConfig` to a
 * static, CDN-cached object (`functions/site-config-publish.js` in TMV-Members).
 * This module reads that object ONCE at build time, as it always has for links,
 * and everything below it (`square-links.ts` for the links, the layout's banner,
 * the About page's hours, the footer's socials) takes its part from here. No
 * page holds a copy of any of it: there is no hours table, no social list and
 * no banner text in this repo.
 *
 * FALLBACK, one behaviour for all of it: when the fetch fails (or the object is
 * not an object) the build warns and carries on with nothing published. Links
 * fall back to the generic booking/store pages (`square-links.ts`); the banner,
 * the hours and the socials simply do not render. Empty means nothing is shown,
 * never an empty section.
 *
 * A members-app save only reaches the site on the next release (rebuild); the
 * banner's expiry is re-checked in the browser (`PromoBanner.astro`) so an
 * expired one still comes down between releases.
 */
import { readPublishedConfig, type PublishedConfig } from '../lib/published-config.js';
import { gymNow } from '../lib/gym-clock.js';
import { promoIsShown } from '../lib/site-promo.js';

/** Public CDN projection of `settings/siteConfig`, republished on every admin save. */
const PUBLIC_CONFIG_URL = 'https://storage.googleapis.com/tmv-management.firebasestorage.app/public/site-config.json';

/** Tests point the build at a fixture server; production never sets it. */
const CONFIG_URL = process.env.TMV_SITE_CONFIG_URL || PUBLIC_CONFIG_URL;

async function fetchPublished(): Promise<PublishedConfig> {
  try {
    // Cache-bust the CDN. The object is served `max-age=300`, so the canonical
    // URL can hand back a copy up to 5 min stale, and a release right after a
    // staff save would bake in the PRE-save values. `cache:no-store` only governs
    // this process's own HTTP cache, not Google's edge; a unique query param
    // forces an edge miss so every build reads the latest publish.
    const res = await fetch(`${CONFIG_URL}?t=${Date.now()}`, { signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    if (!data || typeof data !== 'object') throw new Error('not an object');
    return readPublishedConfig(data);
  } catch (e) {
    console.warn('[site-config] live config fetch failed at build time; nothing published (links use static defaults, no banner, hours or socials):', (e as Error).message);
    return readPublishedConfig(null);
  }
}

const published = await fetchPublished();

/** The per-card Square links staff set, by page then card. Null when none were published. */
export const publishedLinks = published.links;

/** The opening hours as staff typed them, in order. Empty renders nothing. */
export const hours = published.hours;

/** Social links; '' where staff left one blank. */
export const social = published.social;

/** The announcement banner when it should show now, else null (off, no headline, or expired). */
export const promo = promoIsShown(published.promo, gymNow().wall) ? published.promo : null;
