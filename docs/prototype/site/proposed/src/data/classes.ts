/**
 * The class catalog — SINGLE SOURCE OF TRUTH for every class card, shared by the
 * Train page (src/pages/train.astro). Edit a class here once; the page owns
 * only its LAYOUT and resolves the action href from the semantic `link`.
 *
 * `link` is resolved per render site: it opens the rich page where one exists
 * and falls back to booking where no
 * mobile screen exists. Everything else — copy, media, specs — lives here once.
 */

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
  backActionLabel?: string;
  backEyebrow: string;
  backHeadline: string;
  backBody: string;
  specs: string;
  link: ClassLink;
}

export const classes: ClassItem[] = [
  // ---- Core programs ----
  {
    group: 'core', category: 'Parkour', tag: 'Parkour', title: 'Recreational', image: 'assets/recreational.gif',
    description: 'Parkour & acrobatics at your own pace. All fun, zero pressure.', bookingTag: 'Drop-in',
    pills: 'All ages | All levels', actionLabel: 'View schedule', link: { screen: 'schedule' },
    backEyebrow: 'Recreational · Parkour', backHeadline: 'At your own pace, zero pressure',
    backBody: 'Relaxed, drop-in parkour and acrobatics. Coaches meet you exactly where you are — no commitment, no pressure.',
    specs: 'Level: All levels || Ages: All ages — Parent & Child (3+) to Adults || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275',
  },
  {
    group: 'core', category: 'Private', tag: 'Private', title: 'Private Lessons', image: 'assets/private.mp4',
    description: 'Have a specific skill or goal? A private lesson is built around you, from your very first visit.', bookingTag: 'By appointment',
    pills: '1-on-1 | All ages', actionLabel: 'See private options', link: { screen: 'private-lessons' },
    backEyebrow: 'Private · 1-on-1', backHeadline: 'Private lesson or intro?',
    backBody: 'A private lesson is planned around your goal and level: a backflip, a handstand, anything. The cheaper $45 intro is different: a set beginner lesson plan for learning the parkour basics.',
    specs: 'Level: All levels · built around you || Ages: Kids ≤17 & Adults 18+ || Booking: By appointment · reserve online || Price: Intro $45 · Kids from $65 · Adults from $85',
  },
  {
    group: 'core', category: 'Athletic', tag: 'Athletic', title: 'Athletic Program', image: 'assets/athletic.mp4',
    description: 'Train like an athlete with structured coaching and progress tracking.', bookingTag: 'Membership',
    pills: 'Ages 9+ | 90 min', mediaBadge: 'Serious students only', actionLabel: 'View program', link: { screen: 'athletic-program' },
    backEyebrow: 'Athletic · Program', backHeadline: 'Build a well-rounded athlete',
    backBody: 'Train several times a week to build strength, speed and all-round athleticism. Monthly check-ins track your progress.',
    specs: 'Level: Prerequisite required || Ages: 9+ || Schedule: 2 × 90 min / week || Booking: Membership · join any time || Price: $150 / month · $5 class add-on',
  },

  // ---- Partnership classes (booked directly with the partner coach) ----
  { group: 'partnership', category: 'Partner', tag: 'Partner', title: 'Stick Fighting Toronto', image: 'assets/stickfighting.mp4', description: 'Filipino stick fighting with our partner, coach Peter.', bookingTag: 'Direct with coach', pills: 'Adults (18+) | Saturdays', actionLabel: 'Contact coach', backActionLabel: 'Contact coach Peter', link: { external: 'mailto:coachpeter@stickfightingtoronto.com' }, backEyebrow: 'Partner · Adults', backHeadline: 'Filipino stick fighting', backBody: 'Footwork, timing and weapon flow with coach Peter. Welcoming adult class — booked directly with the coach.', specs: 'Level: All levels || Ages: Adults (18+) || Schedule: Sat — 10 AM to 12 PM || Booking: Direct with coach Peter || Price: $30 drop-in · $100 / month' },
  { group: 'partnership', category: 'Partner', tag: 'Partner', title: 'Martial Arts', image: 'assets/martialarts.mp4', description: 'Jiu Jitsu, Wrestling, Boxing & Muay Thai.', bookingTag: 'Direct with coach', pills: 'Ages 16+ | Grappling | Striking', actionLabel: 'Get in touch', link: { external: 'mailto:info@themonkeyvault.com?subject=Martial%20Arts%20classes%20(for%20Ryan)' }, backEyebrow: 'Partner · Teens 16+ & Adults', backHeadline: 'Grappling & striking', backBody: 'Jiu Jitsu, Wrestling, Boxing and Muay Thai under partner coaches. Beginner to competitor — booked directly via WhatsApp.', specs: 'Level: All levels · beginner to competitor || Ages: 16+ || Booking: Direct via WhatsApp · ask for Ryan || Disciplines: BJJ · Wrestling · Boxing · Muay Thai' },
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
