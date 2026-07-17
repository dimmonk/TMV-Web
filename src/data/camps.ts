/**
 * Camp sessions — SINGLE SOURCE OF TRUTH shared by the desktop Camps page
 * (src/pages/camps.astro, rendered as flip cards) and the mobile Camps screen
 * (src/pages/m/index.astro, rendered with BookingCard). The object carries the
 * union of both layouts' fields; each surface reads what it renders. Edit a
 * camp once and both update.
 */
import { sq } from './square-links';
import type { Surfaced } from './surface';

export interface CampFact { icon: string; text: string; }

export interface Camp extends Surfaced {
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

export const camps: Camp[] = [
  {
    title: 'Weekly Camps', tag: 'Winter · March · Summer', image: 'assets/camp-weekly.png',
    desc: 'A full week of parkour adventure over school breaks — skill-building, games, friendship and unforgettable memories.',
    facts: [{ icon: 'bi-calendar-week', text: 'Mon–Fri, full weeks' }, { icon: 'bi-people', text: 'Ages 5+, all levels' }, { icon: 'bi-stopwatch', text: '9 AM–2 PM · late pickup to 4 PM' }],
    back: 'A full week of parkour', included: 'Daily structured lessons, flips, individual skills, games and a cool-down — plus a lunch break. Sessions run over Winter, March Break and Summer.',
    price: '$350 / week', cta: 'Reserve', href: sq.camps.weeklyCamps,
    bookingTag: 'Register', pills: 'Ages 5+ | Mon–Fri | All levels', priceNote: 'late pickup to 4 PM',
    mobile: { desc: 'A full week of parkour over school breaks — skills, flips, games and friends.' },
    hub: { dur: '9–2 daily', desc: 'A full week of parkour over Winter, March Break and Summer — coached skills, flips, games and friends. All levels.', pills: 'Ages 5+ | Mon–Fri | All levels', priceNote: 'late pickup to 4 PM', bookingTag: 'Register', cta: 'See camps', href: '' },
  },
  {
    title: 'Private Day Camp', tag: 'Your own group', image: 'assets/camp-private.png',
    desc: 'Gather your crew for a private day — tailored activities and personal coaching for groups of five or more, any day of the week.',
    facts: [{ icon: 'bi-people-fill', text: 'Minimum 5 kids' }, { icon: 'bi-calendar-check', text: 'Book at least a week ahead' }, { icon: 'bi-stars', text: 'Birthdays, homeschool, friends' }],
    back: 'Your own private camp day', included: 'Parkour, acrobatics, nerf battles and more with your own instructor, 9 AM–2 PM. Flexible start times; late pickup available.',
    price: '$90 / kid', cta: 'Enquire', href: sq.camps.privateDayCamp,
    bookingTag: 'By appointment', pills: 'Min 5 kids | 9 AM–2 PM', priceNote: 'book a week ahead',
    mobile: { desc: 'Gather your crew for a private day — groups of five or more, any day.' },
    hub: { dur: '9–2', desc: 'Gather your own crew for a private camp day — your own instructor, parkour, acrobatics, nerf battles and games. Book at least a week ahead.', pills: 'Min 5 kids | Your own group', priceNote: '5 kids minimum', bookingTag: 'By appointment', cta: 'Enquire', href: sq.camps.privateDayCamp },
  },
  {
    title: 'P.A. Day Camp', tag: 'Single day · public', image: 'assets/camp-paday.png',
    desc: 'A single day of parkour excitement on your day off school. Open to the public — fun challenges and expert coaching, start to finish.',
    facts: [{ icon: 'bi-sun', text: 'One-day sessions' }, { icon: 'bi-unlock', text: 'Open to the general public' }, { icon: 'bi-clock-history', text: '9 AM–2 PM · late pickup to 4 PM' }],
    back: 'A day off, well spent', included: 'Expert coaching and non-stop challenges, open to everyone. The next P.A. Day date is always posted on the booking page.',
    price: '$90 / day', cta: 'Reserve', href: sq.camps.paDayCamp,
    bookingTag: 'Register', pills: 'Ages 5+ | Single days', priceNote: '9 AM–2 PM',
    mobile: { desc: 'A single day of parkour on a day off school — open to the public.' },
    hub: { dur: '9–2', desc: 'A single day of parkour on your day off school — expert coaching and non-stop challenges, start to finish.', pills: 'Ages 5+ | Single day', priceNote: 'open to the public', bookingTag: 'Register', cta: 'See dates', href: '' },
  },
];
