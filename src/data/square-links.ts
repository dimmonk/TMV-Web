/**
 * Square booking / purchase links for EVERY card on the site that books or
 * checks out on Square — organized by page.
 *
 * This is the contract the members-app "Settings → Website" page edits: one
 * section per website page, one entry per card. Each value is that card's
 * specific Square item / booking URL. Defaults point at the generic
 * booking/store/gift link until a specific item URL is filled in; the live
 * members-app config overrides these at build time.
 *
 * Cards that navigate to another site page (e.g. "See camps") are NOT here —
 * their Square link lives under the page they land on.
 */
import { links } from './site';

const B = links.booking; // generic appointments booking (fallback)
const S = links.store; // generic online store (fallback)

export const sq = {
  /* -------------------------------------------------- Book Now page ------- */
  book: {
    introduction: links.booking, // intro / first private lesson
    privateLesson: links.booking, // ongoing private (any coach)
    fullBirthday: links.booking,
    miniBirthday: links.booking,
    privateDayCamp: links.booking,
    groupEvents: links.booking,
    earlyGymAccess: links.booking,
    giftCards: links.giftCard,
  },

  /* -------------------------------------------------- Home page ----------- */
  home: {
    heroBook: links.booking,
    summerCamps: links.summerCamp,
    paDayCamps: links.paDayCamp,
  },

  /* -------------------------------------------------- Camps page ---------- */
  camps: {
    weeklyCamps: links.summerCamp,
    paDayCamp: links.paDayCamp,
    privateDayCamp: links.booking,
  },

  /* -------------------------------------------------- Store page ---------- */
  // Per-item Square checkout URLs — the export left these blank (fell back to
  // the generic store). Fill each with its own Square catalog item URL.
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
    trial: links.booking,
  },
} as const;

/** Flat helper: resolve a "page.key" path to its URL (used where handy). */
export const sqUrl = (page: keyof typeof sq, key: string): string =>
  (sq[page] as Record<string, string>)[key] ?? links.booking;

// re-export for symmetry so pages can pull generic fallbacks too
export { B as GENERIC_BOOKING, S as GENERIC_STORE };
