/**
 * Birthday parties — SINGLE SOURCE OF TRUTH for the condensed party cards the
 * Book hubs render (desktop Book page + mobile Book screen). The expansive
 * Events-page layout (timeline, media) stays bespoke and reads prices from
 * `eventPricing` in data/events.ts; this module owns the hub-card copy so a
 * price/booking change lands in one place.
 */
import { cat } from './site';
import { sq } from './square-links';

export interface PartyHubCard {
  key: 'full' | 'mini';
  color: string;
  title: string;
  dur: string;
  flag?: string;
  bookingTag: string;
  desc: string;
  pills: string;
  price: string;
  priceNote: string;
  href: string;
}

export const partyHubCards: PartyHubCard[] = [
  { key: 'full', color: cat.parties, title: 'Full Birthday Party', dur: '2 hrs', price: '$350 base', priceNote: 'Up to 8 kids · +$25/extra kid', flag: 'Most popular', bookingTag: 'By appointment', desc: 'A coached session, a private party room and free play — coaches with the group the whole time.', pills: 'Ages 5+ | Private room', href: sq.book.fullBirthday },
  { key: 'mini', color: cat.parties, title: 'Mini Birthday Party', dur: '1 hr', price: '$30 / kid', priceNote: '3 kids min · up to 15', bookingTag: 'By appointment', desc: 'The same one-hour coached session of games and challenges, with a lower minimum. All-day pass for every kid.', pills: 'Ages 8+ | 3–15 people | All-day pass', href: sq.book.miniBirthday },
];
