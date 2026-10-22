/**
 * The class catalog — SINGLE SOURCE OF TRUTH for every class card, shared by the
 * Train page (src/pages/train.astro). Edit a class here once; the page owns
 * only its LAYOUT and resolves the action href from the semantic `link`.
 *
 * `link` is resolved per render site: it opens the rich page where one exists
 * and falls back to booking where no
 * mobile screen exists. Everything else — copy, media, specs — lives here once.
 */

import { contact } from './site-config';

export type ClassGroup = 'core' | 'partnership';

/** Semantic action target, resolved per surface. */
export type ClassLink =
  | { screen: 'schedule' | 'private-lessons' | 'athletic-program' }
  | { external: string };

export interface ClassItem {
  group: ClassGroup;
  category: string;
  tag: string;
  title: string;
  image: string;
  description: string;
  bookingTag: string;
  pills: string;
  mediaBadge?: string;
  actionLabel: string;
  specs: string;
  link: ClassLink;
}

export const classes: ClassItem[] = [
  // ---- Core programs ----
  {
    group: 'core', category: 'Parkour', tag: 'Parkour', title: 'Recreational', image: 'assets/recreational.gif',
    description: 'Parkour & acrobatics at your own pace. Drop in at any class time: the coach meets you where you are, no commitment.', bookingTag: 'Drop-in',
    pills: 'All ages | All levels', actionLabel: 'View schedule', link: { screen: 'schedule' },
    specs: 'Level: All levels || Ages: All ages — Parent & Child (3+) to Adults || Booking: Drop-in · no reservation needed || Price: {groupClass1x} single · 10-pack {groupClass10x}',
  },
  {
    group: 'core', category: 'Private', tag: 'Private', title: 'Private Lessons', image: 'assets/private.mp4',
    description: 'Have a specific skill or goal, like a backflip or a handstand? The coach plans the whole hour around it, from your very first visit.', bookingTag: 'By appointment',
    pills: '1-on-1 | All ages', actionLabel: 'See private options', link: { screen: 'private-lessons' },
    specs: 'Level: All levels · built around you || Ages: Kids ≤17 & Adults 18+ || Booking: By appointment · reserve online || Price: Intro {introClass1x} · Kids from {privateKid1x} · Adults from {privateAdult1x}',
  },
  {
    group: 'core', category: 'Athletic', tag: 'Athletic', title: 'Athletic Program', image: 'assets/athletic.mp4',
    description: 'Train like an athlete several times a week: structured coaching for strength, speed and skill, with monthly progress check-ins.', bookingTag: 'Membership',
    pills: 'Ages 9+ | 90 min', mediaBadge: 'Serious students only', actionLabel: 'View program', link: { screen: 'athletic-program' },
    specs: 'Level: Prerequisite required || Ages: 9+ || Schedule: 2 × 90 min / week || Booking: Membership · join any time || Price: {athleticMembership30} / month · {athleticClassAddon} class add-on',
  },

  // ---- Partnership classes (booked directly with the partner coach) ----
  { group: 'partnership', category: 'Partner', tag: 'Partner', title: 'Stick Fighting Toronto', image: 'assets/stickfighting.mp4', description: 'Filipino stick fighting with our partner, coach Peter.', bookingTag: 'Direct with coach', pills: 'Adults (18+) | Saturdays', actionLabel: 'Contact coach', link: { external: 'mailto:coachpeter@stickfightingtoronto.com' }, specs: 'Level: All levels || Ages: Adults (18+) || Schedule: Sat — 10 AM to 12 PM || Booking: Direct with coach Peter || Price: $30 drop-in · $100 / month' },
  { group: 'partnership', category: 'Partner', tag: 'Partner', title: 'Martial Arts', image: 'assets/martialarts.mp4', description: 'Jiu Jitsu, Wrestling, Boxing & Muay Thai.', bookingTag: 'Direct with coach', pills: 'Ages 16+ | Grappling | Striking', actionLabel: 'Get in touch', link: { external: contact.href.email && `${contact.href.email}?subject=${encodeURIComponent('Martial Arts classes (for Ryan)')}` }, specs: 'Level: All levels · beginner to competitor || Ages: 16+ || Booking: Direct via WhatsApp · ask for Ryan || Disciplines: BJJ · Wrestling · Boxing · Muay Thai' },
];

export const coreClasses = classes.filter((c) => c.group === 'core');
export const partnershipClasses = classes.filter((c) => c.group === 'partnership');

/**
 * The Specialized Classes card's clips, by class name as the Members schedule
 * names it (without a level number: "Flips" covers Flips 1 and Flips 2). Which
 * classes are on the card, and their headline, description, days, times and ages,
 * all come from the Members schedule (src/lib/specialized-classes.js); a clip is
 * the one thing kept here, because each is re-encoded by hand before it ships.
 * A class with no file yet shows the placeholder, and heals once the file lands.
 */
export const specializedClips: Readonly<Record<string, string>> = Object.freeze({
  Flips: 'assets/flips.mp4',
  Backflip: 'assets/backflip.mp4',
  Calisthenics: 'assets/calisthenics.mp4',
  Tricking: 'assets/tricking.mp4',
  Gymnastics: 'assets/gymnastics.mp4',
  Strength: 'assets/strength.mp4',
  Flexibility: 'assets/flexibility.mp4',
  'Acro Dance': 'assets/acrodance.mp4',
  Handstand: 'assets/handstand.mp4',
  'Speed League': 'assets/speedleague.mp4',
});
