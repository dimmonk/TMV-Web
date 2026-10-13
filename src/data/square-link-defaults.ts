/**
 * The Square link slots and the ONE rule that resolves them: a non-empty
 * staff-set link wins, anything blank keeps the static default.
 *
 * Shared by the build (`square-links.ts`, which resolves every card's href) and
 * by the browser (`lib/live-site-config.ts`, which re-resolves them against the
 * freshly fetched published config), so the rule has a single definition. No
 * top-level await here: this module is safe in a client bundle.
 */
import { links } from './site';

export const B = links.booking; // generic appointments booking (fallback)
export const S = links.store; // generic online store (fallback)

/** Static fallback shape: what a card links to until staff set a specific link. */
export const DEFAULTS = {
  /* -------------------------------------------------- Book Now page ------- */
  book: {
    introduction: B, // intro / first private lesson
    privateLesson: B, // ongoing private (any coach)
    fullBirthday: B,
    miniBirthday: B,
    groupEvents: B,
    earlyGymAccess: B,
  },

  /* -------------------------------------------------- Home page ----------- */
  /* The Home page has no editable links left: its camp cards read the seasons
     below, and its hero books the intro via `getStarted.introduction`. Two
     admin fields once held the SAME camp product (home.summerCamps and
     camps.weeklyCamps) — one slot per camp now. */

  /* -------------------------------------------------- Camps page ---------- */
  camps: {
    winterCamp: links.winterCamp,
    marchCamp: links.marchCamp,
    summerCamp: links.summerCamp,
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
  },

  /* -------------------------------------------------- Private Lessons ----- */
  // Per-coach booking links: each coach can have their own Square staff
  // booking URL, set at Settings -> Website in the members app.
  privateLessons: {
    introduction: B,
    privateLesson: B,
    /* Per-coach slots removed with the roster — see `perCoachBookingEnabled`.
       They come back when each coach has a real Square staff booking page. */
  },

  /* -------------------------------------------------- Get Started --------- */
  getStarted: {
    introduction: B,
  },
} as const;

export type LinkPages = typeof DEFAULTS;
export type PageKey = keyof LinkPages;

/** A non-empty admin-set link wins; anything blank keeps the static default. */
export function mergeLive(defaults: LinkPages, live: Record<string, Record<string, string>> | null): LinkPages {
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
