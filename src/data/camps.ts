/**
 * Camp sessions — SINGLE SOURCE OF TRUTH for the Camps page
 * (src/pages/camps.astro, rendered as flip cards). The object carries the union
 * of the fields the layouts use; each reads what it renders.
 */
import { sq, isLinkSet } from './square-links';
import type { Surfaced } from './surface';

export interface CampFact { icon: string; text: string; }

export interface Camp extends Surfaced {
  /** stable id — surfaces pick camps by this, never by array index */
  key: 'weekly' | 'private' | 'paday';
  title: string;
  tag: string;
  image: string;      // assets/… (each surface prefixes with url())
  desc: string;
  price: string;
  cta: string;
  href: string;
  // desktop flip card
  facts: CampFact[];
  back: string;
  included: string;
  // mobile BookingCard
  bookingTag: string;
  pills: string;
  priceNote: string;
  // condensed variant for the Book hubs (desktop Book page + mobile Book screen)
  hub: { dur: string; desc: string; pills: string; priceNote: string; bookingTag: string; cta: string; href: string };
}

/* ---------------------------------------------------------------- seasons --
 * The weekly camp runs three times a year as three separate Square products.
 * One card described all three but carried ONE link, so booking a season meant
 * pasting its URL over another season's. Each season is its own row now, with
 * its own editable link.
 *
 * `bookable` is NOT hand-maintained: a season is bookable exactly when its
 * link is set in Settings -> Website. A blank field means there is no active
 * Square item for that season right now, so the site stops offering it instead
 * of sending people to a different season's product page.
 */
export interface WeeklySeason {
  key: 'winter' | 'march' | 'summer';
  /** card title and the Settings -> Website field label */
  label: string;
  /** short badge on the card */
  badge: string;
  /** when it runs, in the gym's words */
  when: string;
  price: string;
  href: string;
  bookable: boolean;
}

export const weeklySeasons: WeeklySeason[] = [
  { key: 'winter', label: 'Winter Camp', badge: 'Winter break', when: 'Over the winter break — dates on the booking page', price: '$350 / week', href: sq.camps.winterCamp, bookable: isLinkSet('camps', 'winterCamp') },
  { key: 'march', label: 'March Break Camp', badge: 'March Break', when: 'March Break week — dates on the booking page', price: '$350 / week', href: sq.camps.marchCamp, bookable: isLinkSet('camps', 'marchCamp') },
  { key: 'summer', label: 'Summer Camp', badge: 'Summer', when: 'Weekly sessions all summer — dates on the booking page', price: '$350 / week', href: sq.camps.summerCamp, bookable: isLinkSet('camps', 'summerCamp') },
];

/** The seasons a visitor can book today, in calendar order. */
export const bookableSeasons = (): WeeklySeason[] => weeklySeasons.filter((s) => s.bookable);

/** What the Weekly Camps card books, or undefined when no season is open —
 *  in which case the card is dropped rather than advertising a camp that
 *  cannot be bought. */
export const nextSeason = (): WeeklySeason | undefined => bookableSeasons()[0];

const allCamps: Camp[] = [
  {
    key: 'weekly', title: 'Weekly Camps', tag: 'Winter · March · Summer', image: 'assets/camp-weekly.png',
    desc: 'A full week of parkour adventure over school breaks — skill-building, games, friendship and unforgettable memories.',
    facts: [{ icon: 'bi-calendar-week', text: 'Mon–Fri, full weeks' }, { icon: 'bi-people', text: 'Ages 5+, all levels' }, { icon: 'bi-stopwatch', text: '9 AM–2 PM · late pickup to 4 PM' }],
    back: 'A full week of parkour', included: 'Daily structured lessons, flips, individual skills, games and a cool-down — plus a lunch break. Sessions run over Winter, March Break and Summer.',
    price: '$350 / week', cta: 'Reserve', href: nextSeason()?.href ?? '',
    bookingTag: 'Register', pills: 'Ages 5+ | Mon–Fri | All levels', priceNote: 'late pickup to 4 PM',
    mobile: { desc: 'A full week of parkour over school breaks — skills, flips, games and friends.' },
    hub: { dur: '9–2 daily', desc: 'A full week of parkour over Winter, March Break and Summer — coached skills, flips, games and friends. All levels.', pills: 'Ages 5+ | Mon–Fri | All levels', priceNote: 'late pickup to 4 PM', bookingTag: 'Register', cta: 'See camps', href: '' },
  },
  {
    key: 'private', title: 'Private Day Camp', tag: 'Your own group', image: 'assets/camp-private.png',
    desc: 'Gather your crew for a private day — tailored activities and personal coaching for groups of five or more, any day of the week.',
    facts: [{ icon: 'bi-people-fill', text: 'Minimum 5 kids' }, { icon: 'bi-calendar-check', text: 'Book at least a week ahead' }, { icon: 'bi-stars', text: 'Birthdays, homeschool, friends' }],
    back: 'Your own private camp day', included: 'Parkour, acrobatics, nerf battles and more with your own instructor, 9 AM–2 PM. Flexible start times; late pickup available.',
    price: '$90 / kid', cta: 'Enquire', href: sq.camps.privateDayCamp,
    bookingTag: 'By appointment', pills: 'Min 5 kids | 9 AM–2 PM', priceNote: 'book a week ahead',
    mobile: { desc: 'Gather your crew for a private day — groups of five or more, any day.' },
    hub: { dur: '9–2', desc: 'Gather your own crew for a private camp day — your own instructor, parkour, acrobatics, nerf battles and games. Book at least a week ahead.', pills: 'Min 5 kids | Your own group', priceNote: '5 kids minimum', bookingTag: 'By appointment', cta: 'Enquire', href: sq.camps.privateDayCamp },
  },
  {
    key: 'paday', title: 'P.A. Day Camp', tag: 'Single day · public', image: 'assets/camp-paday.png',
    desc: 'A single day of parkour excitement on your day off school. Open to the public — fun challenges and expert coaching, start to finish.',
    facts: [{ icon: 'bi-sun', text: 'One-day sessions' }, { icon: 'bi-unlock', text: 'Open to the general public' }, { icon: 'bi-clock-history', text: '9 AM–2 PM · late pickup to 4 PM' }],
    back: 'A day off, well spent', included: 'Expert coaching and non-stop challenges, open to everyone. The next P.A. Day date is always posted on the booking page.',
    price: '$90 / day', cta: 'Reserve', href: sq.camps.paDayCamp,
    bookingTag: 'Register', pills: 'Ages 5+ | Single days', priceNote: '9 AM–2 PM',
    mobile: { desc: 'A single day of parkour on a day off school — open to the public.' },
    hub: { dur: '9–2', desc: 'A single day of parkour on your day off school — expert coaching and non-stop challenges, start to finish.', pills: 'Ages 5+ | Single day', priceNote: 'open to the public', bookingTag: 'Register', cta: 'See dates', href: '' },
  },
];

/** A day at camp — SSOT for the desktop Camps 'know' section + the mobile
 * Camps day-schedule card (same rows on both). */
export const campDaySchedule = [
  { time: '8:45 – 9:00', label: 'Arrival & check-in' },
  { time: '9:00 – 11:00', label: 'Activities' },
  { time: '11:00 – 11:30', label: 'Lunch' },
  { time: '11:30 – 12:00', label: 'Free time' },
  { time: '12:00 – 2:00', label: 'Activities' },
  { time: '2:00 – 4:00', label: 'Late pick-up (optional)' },
];

/** The camps a visitor can actually book today. The weekly card drops out when
 *  no season is open — better no card than one that leads nowhere. */
export const camps: Camp[] = allCamps.filter((c) => c.key !== 'weekly' || nextSeason());

/** Pick a camp by key, or undefined when it is not currently offered. */
export const campByKey = (key: Camp['key']): Camp | undefined => camps.find((c) => c.key === key);
