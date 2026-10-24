/**
 * Shared events/group data — SINGLE SOURCE OF TRUTH for the pieces that are
 * duplicated between the desktop Events page and the mobile Events/Groups
 * screens. The party and early-access layouts are bespoke per surface (their
 * marketing presentation differs), so what lives here is the genuinely shared,
 * change-prone data: the group-event per-head price tiers and the headline
 * party prices, each naming its Members price-list key (`<Priced>` fills it).
 * Booking links come from `links`/`sq`.
 */
import { cat as catColor } from './site';
import { sq as sqLinks } from './square-links';

export interface GroupTier { label: string; val: string; }

/** Group-event price per participant (also shown as the "smaller groups pay the base" fallback). */
export const groupTiers: GroupTier[] = [
  { label: 'Up to 10', val: '{groupEventBase} base' },
  { label: '11–30', val: '{groupEventPerPerson11to30} each' },
  { label: '31–50', val: '{groupEventPerPerson31to50} each' },
  { label: '51+', val: '{groupEventPerPerson51Plus} each' },
];

/** Headline prices used across the party/group cards on both surfaces. */
export const eventPricing = {
  fullBirthdayBase: '{partyBase}',
  miniBirthdayPerKid: '{partyMiniPerPerson}',
  earlyAccessFrom: 'From {earlyAccessHour}/hr',
  earlyAccessOpenGym: '+ {earlyAccessOpenGym} / person open gym',
  groupBaseFine: 'smaller groups pay the {groupEventBase} base',
} as const;

/** Condensed group / early-access cards the Book hubs render. */
export interface GroupHubCard {
  key: 'groupEvents' | 'earlyAccess';
  color: string;
  title: string;
  dur: string;
  bookingTag: string;
  desc: string;
  pills: string;
  price: string;
  priceNote: string;
  href: string;
}

export const groupHubCards: GroupHubCard[] = [
  { key: 'groupEvents', color: catColor.groups, title: 'Group Events', dur: '2 hrs', price: 'From {groupEventBase}', priceNote: '10 min · tiered per head', bookingTag: 'By appointment', desc: 'Schools, corporate teams, youth orgs and sports teams: an hour of guided activities then an hour of open gym. Teamwork, confidence and skills, expert-led.', pills: 'Min 10 people | All levels', href: sqLinks.book.groupEvents },
  { key: 'earlyAccess', color: catColor.openGym, title: 'Early Gym Access', dur: '1 hr', price: 'From {earlyAccessHour} / hr', priceNote: '+ {earlyAccessOpenGym} / person open gym', bookingTag: 'By appointment', desc: 'Reserve The Monkey Vault before we open at 11 AM for exclusive access. Perfect for small groups or focused training with no crowds.', pills: 'Your own group | Before 11 AM', href: sqLinks.book.earlyGymAccess },
];
