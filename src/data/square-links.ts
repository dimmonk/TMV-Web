/**
 * Square booking / purchase links for EVERY card on the site that books or
 * checks out on Square — organized by page.
 *
 * This is the LIVE side of the contract the members-app "Settings → Website"
 * page edits (`public/js/core/site-config-service.js` → `LINK_PAGES`, mirrored
 * server-side in `functions/site-config-publish.js`): one section per website
 * page, one entry per card. Per the build-time-bake decision, this module
 * fetches the admin-edited public JSON ONCE at build time and merges it over
 * the static defaults below — a specific link an admin has filled in wins;
 * anything still blank (or if the fetch fails) falls back to the generic
 * booking/store/gift link so the site never links to nothing. A members-app
 * save triggers a site rebuild to pick up the change.
 *
 * Cards that navigate to another site page (e.g. "See camps") are NOT here —
 * their Square link lives under the page they land on.
 */
import { links } from './site';

const B = links.booking; // generic appointments booking (fallback)
const S = links.store; // generic online store (fallback)

/** Static fallback shape — used until a per-card override is fetched. */
const DEFAULTS = {
  /* -------------------------------------------------- Book Now page ------- */
  book: {
    introduction: B, // intro / first private lesson
    privateLesson: B, // ongoing private (any coach)
    fullBirthday: B,
    miniBirthday: B,
    privateDayCamp: B,
    groupEvents: B,
    earlyGymAccess: B,
    giftCards: links.giftCard,
  },

  /* -------------------------------------------------- Home page ----------- */
  home: {
    heroBook: B,
    summerCamps: links.summerCamp,
    paDayCamps: links.paDayCamp,
  },

  /* -------------------------------------------------- Camps page ---------- */
  camps: {
    weeklyCamps: links.summerCamp,
    paDayCamp: links.paDayCamp,
    privateDayCamp: B,
  },

  /* -------------------------------------------------- Store page ---------- */
  store: {
    dayPasses: S,
    openGymMembership: S,
    classPasses: S,
    classMembership: S,
    privateClassPack: S,
    athleticMembership: links.athleticMembership,
    giftCard: links.giftCard,
  },

  /* -------------------------------------------------- Athletic page ------- */
  athletic: {
    membership: links.athleticMembership,
    trial: B,
  },

  /* -------------------------------------------------- Private Lessons ----- */
  // Per-coach booking links: each coach can have their own Square staff
  // booking URL, set at Settings -> Website in the members app.
  privateLessons: {
    introduction: B,
    privateLesson: B,
    coachTaigh: B,
    coachSteven: B,
    coachNelson: B,
  },

  /* -------------------------------------------------- Get Started --------- */
  getStarted: {
    introduction: B,
    privateClass: B,
  },
} as const;

type LinkPages = typeof DEFAULTS;
type PageKey = keyof LinkPages;

/** Public CDN projection of `settings/siteConfig`, republished on every admin save. */
const PUBLIC_CONFIG_URL = 'https://storage.googleapis.com/tmv-management.firebasestorage.app/public/site-config.json';

async function fetchLiveLinks(): Promise<Record<string, Record<string, string>> | null> {
  try {
    // Cache-bust the CDN. The object is served `max-age=300`, so the canonical
    // URL can hand back a copy up to 5 min stale — and an admin save triggers a
    // rebuild immediately, well inside that window, so a plain fetch here races
    // the edge cache and can bake in the PRE-save (stale) links. `cache:no-store`
    // only governs this process's own HTTP cache, not Google's edge; a unique
    // query param forces an edge miss so every build reads the latest publish.
    const res = await fetch(`${PUBLIC_CONFIG_URL}?t=${Date.now()}`, { signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return data && typeof data.links === 'object' ? data.links : null;
  } catch (e) {
    console.warn('[square-links] live config fetch failed at build time — using static defaults:', (e as Error).message);
    return null;
  }
}

/** A non-empty admin-set link wins; anything blank keeps the static default. */
function mergeLive(defaults: LinkPages, live: Record<string, Record<string, string>> | null): LinkPages {
  const out = {} as LinkPages;
  (Object.keys(defaults) as PageKey[]).forEach((pageKey) => {
    const merged = { ...defaults[pageKey] } as Record<string, string>;
    const livePage = live?.[pageKey];
    if (livePage) {
      Object.keys(merged).forEach((fieldKey) => {
        const v = livePage[fieldKey];
        if (typeof v === 'string' && v.trim()) merged[fieldKey] = v.trim();
      });
    }
    (out as Record<string, unknown>)[pageKey] = merged;
  });
  return out;
}

const liveLinks = await fetchLiveLinks();

/** Every card's resolved Square link — live admin value where set, static default otherwise. */
export const sq: LinkPages = mergeLive(DEFAULTS, liveLinks);

/** Flat helper: resolve a "page.key" path to its URL (used where handy). */
export const sqUrl = (page: PageKey, key: string): string =>
  (sq[page] as Record<string, string>)[key] ?? links.booking;

// re-export for symmetry so pages can pull generic fallbacks too
export { B as GENERIC_BOOKING, S as GENERIC_STORE };
