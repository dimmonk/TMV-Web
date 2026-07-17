/**
 * Shared events/group data — SINGLE SOURCE OF TRUTH for the pieces that are
 * duplicated between the desktop Events page and the mobile Events/Groups
 * screens. The party and early-access layouts are bespoke per surface (their
 * marketing presentation differs), so what lives here is the genuinely shared,
 * change-prone data: the group-event per-head price tiers and the headline
 * party prices. Booking links come from `links`/`sq`.
 */

export interface GroupTier { label: string; val: string; }

/** Group-event price per participant (also shown as the "smaller groups pay the base" fallback). */
export const groupTiers: GroupTier[] = [
  { label: 'Up to 10', val: '$300 base' },
  { label: '11–30', val: '$27.50 each' },
  { label: '31–50', val: '$25.00 each' },
  { label: '51+', val: '$22.50 each' },
];

/** Headline prices used across the party/group cards on both surfaces. */
export const eventPricing = {
  fullBirthdayBase: '$350',
  miniBirthdayPerKid: '$30',
  earlyAccessFrom: 'From $50/hr',
} as const;
