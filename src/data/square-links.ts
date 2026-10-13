/**
 * Square booking / purchase links for EVERY card on the site that books or
 * checks out on Square — organized by page.
 *
 * This is the LIVE side of the contract the members-app "Settings → Website"
 * page edits (`public/js/core/site-config-service.js` → `LINK_PAGES`, mirrored
 * server-side in `functions/site-config-publish.js`): one section per website
 * page, one entry per card. The admin-edited public JSON is fetched ONCE at
 * build time (`site-config.ts`, which also feeds the banner, hours and socials)
 * and merged over the static defaults (`square-link-defaults.ts`): a specific
 * link an admin has filled in wins; anything blank (or if the fetch fails)
 * falls back to the generic booking/store/gift link so the site never links to
 * nothing. The browser re-resolves the same slots against the freshly fetched
 * object on page load (`lib/live-site-config.ts`), so a save shows within the
 * object's cache window without waiting for a release.
 *
 * Cards that navigate to another site page (e.g. "See camps") are NOT here —
 * their Square link lives under the page they land on.
 */
import { links } from './site';
import { publishedLinks } from './site-config';
import { DEFAULTS, mergeLive, B, S, type LinkPages, type PageKey } from './square-link-defaults';

const liveLinks = publishedLinks;

/**
 * Where a slot is written in a built page. Every card's href carries its slot
 * as a `#tmv-sq=page.field` fragment, and the build (`astro.config.mjs`,
 * `lib/sq-slot-marker.js`) moves it into a `data-sq` attribute on the anchor,
 * so the browser knows which slot an anchor is when it re-resolves the links.
 */
const tagged = (resolved: LinkPages): LinkPages => {
  const out: Record<string, Record<string, string>> = {};
  (Object.keys(resolved) as PageKey[]).forEach((page) => {
    out[page] = {};
    Object.entries(resolved[page]).forEach(([field, url]) => { out[page][field] = `${url}#tmv-sq=${page}.${field}`; });
  });
  return out as unknown as LinkPages;
};

/** Every card's resolved Square link, live admin value where set, static default otherwise (slot-tagged, see above). */
export const sq: LinkPages = tagged(mergeLive(DEFAULTS, liveLinks));

/**
 * Did an admin actually SET this link, or is the value just the static
 * fallback?
 *
 * For most slots a blank field falling back to the generic booking/store page
 * is the right behaviour. For anything seasonal it is not: a blank field means
 * "there is no active Square item for this right now", so the surface must not
 * offer it rather than quietly sending people to a different product's page.
 */
export const isLinkSet = (page: PageKey, field: string): boolean =>
  typeof liveLinks?.[page]?.[field] === 'string' && liveLinks[page][field].trim() !== '';

/** Flat helper: resolve a "page.key" path to its URL (used where handy). */
export const sqUrl = (page: PageKey, key: string): string =>
  (sq[page] as Record<string, string>)[key] ?? links.booking;

// re-export for symmetry so pages can pull generic fallbacks too
export { B as GENERIC_BOOKING, S as GENERIC_STORE };
