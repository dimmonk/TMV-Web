/**
 * Birthday parties — SINGLE SOURCE OF TRUTH for party card copy on every
 * surface.
 *
 * Two shapes live here:
 *  - `partyHubCards` — the condensed cards the Book hubs render (desktop Book
 *    page + mobile Book screen).
 *  - `partyCards` — the full Events-page cards (media, timeline, inclusion
 *    lists). These used to be hand-authored separately on the desktop Events
 *    page and the mobile Events screen, which let the two drift: the mobile
 *    copies silently lost the timeline detail, the inclusion lists and the
 *    invitation link. Both surfaces now render <PartyCard> from this data, so
 *    a copy/price change lands once and appears in both shells.
 */
import { cat, url } from './site';
import { sq } from './square-links';
import { eventPricing } from './events';

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

/** One row of the Full party's run-of-show. */
export interface PartyTimelineStep { t: string; label: string; }

/**
 * The full Events-page party cards. Rendered by <PartyCard> on BOTH the desktop
 * Events page and the mobile Events screen — the card adapts to whatever width
 * its container gives it, so there is no per-surface copy.
 */
export interface PartyCardData {
  key: 'full' | 'mini';
  /** 'light' = white card w/ accent border, 'dark' = ink card. */
  theme: 'light' | 'dark';
  /** Badge over the media (Full). */
  flag?: string;
  /** Inline pill tag above the title (Mini). */
  tag?: string;
  title: string;
  desc: string;
  /** Hero media (Full). */
  image?: string;
  timeline?: PartyTimelineStep[];
  /** Pipe-delimited facts rendered as pills (Full). */
  pills?: string;
  included?: string[];
  goodToKnow?: string[];
  price: string;
  priceSub: string;
  /** Secondary pricing lines (Full). */
  priceExtra?: string[];
  bookHref: string;
  bookLabel: string;
  /** Show the "Make an invitation" secondary action (Full). */
  invite?: boolean;
}

export const partyCards: PartyCardData[] = [
  {
    key: 'full',
    theme: 'light',
    flag: 'Most popular',
    title: 'Full Birthday Party',
    desc: 'Coaches stay with your group the whole time. A private party room, a coached session, and free play — the full experience.',
    image: url('assets/invite-default-photo.png'),
    timeline: [
      { t: '60′', label: 'Activities — parkour intro lesson, movement games & requested skills' },
      { t: '30′', label: 'Private party room — food, drinks & celebration' },
      { t: '30′', label: 'Open gym — free play under instructor supervision' },
    ],
    pills: 'Ages 5+ | 2 hrs total | Private room',
    price: eventPricing.fullBirthdayBase,
    priceSub: 'base price · up to 8 participants',
    priceExtra: ['+$25 per additional participant', '+$5 / participant for an extra hour'],
    bookHref: sq.book.fullBirthday,
    bookLabel: 'Book your party',
    invite: true,
  },
  {
    key: 'mini',
    theme: 'dark',
    tag: 'Smaller & last-minute',
    title: 'Mini Birthday Party',
    desc: 'Booked solid for the full package? The Mini is the same action-packed one-hour coached parkour session of games and challenges — just a lower minimum so smaller groups and last-minute plans still get in.',
    included: [
      'One-hour coached parkour session — games & challenges',
      '3 participants minimum, up to 15 · ages 8+',
      'All-day pass for every kid — open gym after, leave to eat, come back',
    ],
    goodToKnow: [
      'Coaches lead the session, then kids are on their own in open gym',
      'No private room — common-area tables are shared, not guaranteed',
    ],
    price: eventPricing.miniBirthdayPerKid,
    priceSub: 'per participant',
    bookHref: sq.book.miniBirthday,
    bookLabel: 'Book mini',
  },
];
