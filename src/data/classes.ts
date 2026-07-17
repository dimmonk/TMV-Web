/**
 * The class catalog — SINGLE SOURCE OF TRUTH for every class card, shared by the
 * desktop Train page (src/pages/train.astro) and the mobile Train screen
 * (src/pages/m/index.astro). Edit a class here once and it populates both
 * surfaces; each surface only owns its own LAYOUT (desktop = grid sections,
 * mobile = stacked list) and resolves the action href from the semantic `link`.
 *
 * `link` is where the two surfaces legitimately differ (they have different
 * routes): desktop opens its rich pages, mobile falls back to booking where no
 * mobile screen exists. Everything else — copy, media, specs — lives here once.
 */

export type ClassGroup = 'core' | 'specialized' | 'partnership';

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
    description: 'Three ways in: a discounted intro, ongoing 1-on-1 at standard rates, or your own specific coach to follow your whole progress.', bookingTag: 'By appointment',
    pills: '1-on-1 | All ages', actionLabel: 'See private options', link: { screen: 'private-lessons' },
    backEyebrow: 'Private · 1-on-1', backHeadline: 'Three ways to train privately',
    backBody: "Start with a one-time Introduction, continue one-on-one at standard rates with whoever's on, or pick a specific coach who follows your whole progress — on your schedule.",
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

  // ---- Specialized classes ----
  { group: 'specialized', category: 'Flips', tag: 'Flips', title: 'Flip Class', image: 'assets/flips.mp4', description: 'Master your flips, safely — a levelled path from first roll to full aerials.', bookingTag: 'Drop-in', pills: 'Ages 7+ | Levels 1–2', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Flips', backHeadline: 'A levelled path through the air', backBody: 'A safe, progressive route through the flipping fundamentals — Level 1 into Level 2. Always spotted and matted.', specs: 'Level: Levels 1–2 || Ages: 7+ || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Flips', tag: 'Backflip Only', title: 'Backflip Only', image: 'assets/backflip.mp4', description: 'One goal, one class — land your first standing backflip.', bookingTag: 'Drop-in', pills: 'Adults (18+) | Sat — 12 PM', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Backflip Only', backHeadline: 'Chase the one move', backBody: 'A focused session built around a single skill: the standing backflip. Progressions, spotting and reps until it’s yours — always matted.', specs: 'Level: All levels || Ages: Adults (18+) || Schedule: Sat — 12 PM || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Strength', tag: 'Strength', title: 'Calisthenics', image: 'assets/calisthenics.mp4', description: 'Build serious bodyweight strength and control.', bookingTag: 'Drop-in', pills: 'Teens & Adults (13+) | Weekday evenings', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Strength', backHeadline: 'Bodyweight strength & control', backBody: 'Bodyweight strength, control and mobility. Stands alone or powers up everything else you train.', specs: 'Level: All levels || Ages: Teens & Adults (13+) || Schedule: Weekday evenings · exact times on the schedule || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Tricking', tag: 'Tricking', title: 'Tricking', image: 'assets/tricking.mp4', description: 'Kicks, flips and twists — martial arts meets acrobatics.', bookingTag: 'Drop-in', pills: 'Teens & Adults (13+) | Tue & Thu — 7 PM', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Tricking', backHeadline: 'Martial arts meets acrobatics', backBody: 'Kicks, flips and twists chained into flowing combos. High-energy — and you build your own style.', specs: 'Level: All levels || Ages: Teens & Adults (13+) || Schedule: Tue · Thu — 7 PM || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Gymnastics', tag: 'Gymnastics', title: 'Gymnastics', image: 'assets/gymnastics.mp4', description: 'Strength, flexibility and clean form — the base for everything.', bookingTag: 'Drop-in', pills: 'Teens & Adults (13+) | Tue & Fri — 6 PM', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Gymnastics', backHeadline: 'The foundation under everything', backBody: 'Strength, flexibility and clean form — the fundamentals that make everything else safer and sharper.', specs: 'Level: All levels || Ages: Teens & Adults (13+) || Schedule: Tue · Fri — 6 PM || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Strength', tag: 'Strength', title: 'Strength', image: 'assets/strength.mp4', description: 'Targeted strength training to build raw power and resilience.', bookingTag: 'Drop-in', pills: 'Teens & Adults (13+) | Thu & Fri evenings', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Strength', backHeadline: 'Raw power & resilience', backBody: 'Focused, progressive strength work — heavier loading and conditioning that translates straight into everything else you train.', specs: 'Level: All levels || Ages: Teens & Adults (13+) || Schedule: Thu — 6 PM · Fri — 9 PM || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Flexibility', tag: 'Flexibility', title: 'Flexibility', image: 'assets/flexibility.mp4', description: 'Open up your range with active mobility and flexibility.', bookingTag: 'Drop-in', pills: 'Teens & Adults (13+) | Fri — 7 PM', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Flexibility', backHeadline: 'More range, safer movement', backBody: 'Active mobility and flexibility drills that unlock deeper positions and keep you moving well for the long haul.', specs: 'Level: All levels || Ages: Teens & Adults (13+) || Schedule: Fri — 7 PM || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Tricking', tag: 'Acro Dance', title: 'Acro Dance', image: 'assets/acrodance.mp4', description: 'Acrobatics for dancers — line, expression and performance-ready flow. Levels 1 & 2.', bookingTag: 'Drop-in', pills: 'Teens & Adults (13+) | Mon evenings | Levels 1–2', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Acro Dance', backHeadline: 'Where acrobatics turns into artistry', backBody: 'Acrobatic technique through a dancer’s lens — clean lines, extension and controlled transitions built into expressive, performance-ready sequences. A levelled path: start in Level 1 and grow into Level 2.', specs: 'Level: Levels 1–2 || Ages: Teens & Adults (13+) || Schedule: Mon — 7 PM (L1) · 8 PM (L2) || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Gymnastics', tag: 'Handstand', title: 'Handstand', image: 'assets/handstand.mp4', description: 'Balance, alignment and the path to a solid handstand.', bookingTag: 'Drop-in', pills: 'Teens & Adults (13+) | Thu — 8 PM', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Handstand', backHeadline: 'Find your line, hold it', backBody: 'Wrist prep, alignment and balance drills that build toward a strong, controlled freestanding handstand.', specs: 'Level: All levels || Ages: Teens & Adults (13+) || Schedule: Thu — 8 PM || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Parkour', tag: 'Speed League', title: 'Speed League', image: 'assets/speedleague.mp4', description: 'Timed parkour runs with coaching feedback — times posted to a public leaderboard.', bookingTag: 'Drop-in', pills: 'Ages 9+ | Wed evenings', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Speed League', backHeadline: 'Run it. Beat the clock.', backBody: 'Timed parkour runs with coaching feedback, times posted to a public leaderboard. Open to everyone as a drop-in class and part of the Athletic Program.', specs: 'Level: All levels || Ages: 9+ · split 9–14 and 15+ || Schedule: Wed — 6 PM (9–14) · 7 PM (15+) || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },
  { group: 'specialized', category: 'Strength', tag: 'Explosive', title: 'Explosive', image: 'assets/explosive.mp4', description: 'Plyometric, power-based training for explosive strength and speed.', bookingTag: 'Drop-in', pills: 'Teens & Adults (13+) | Mon & Fri — 5 PM', actionLabel: 'View schedule', link: { screen: 'schedule' }, backEyebrow: 'Explosive', backHeadline: 'Power, speed, athletic pop', backBody: 'Plyometric and power-based training to build explosive strength, speed and athletic performance. Open as a drop-in class and part of the Athletic Program.', specs: 'Level: All levels || Ages: Teens & Adults (13+) || Schedule: Mon · Fri — 5 PM || Booking: Drop-in · no reservation needed || Price: $30 single · 10-pack $275' },

  // ---- Partnership classes (booked directly with the partner coach) ----
  { group: 'partnership', category: 'Partner', tag: 'Partner', title: 'Stick Fighting Toronto', image: 'assets/stickfighting.mp4', description: 'Filipino stick fighting with our partner, coach Peter.', bookingTag: 'Direct with coach', pills: 'Adults (18+) | Saturdays', actionLabel: 'Contact coach', backActionLabel: 'Contact coach Peter', link: { external: 'mailto:coachpeter@stickfightingtoronto.com' }, backEyebrow: 'Partner · Adults', backHeadline: 'Filipino stick fighting', backBody: 'Footwork, timing and weapon flow with coach Peter. Welcoming adult class — booked directly with the coach.', specs: 'Level: All levels || Ages: Adults (18+) || Schedule: Sat — 10 AM to 12 PM || Booking: Direct with coach Peter || Price: $30 drop-in · $100 / month' },
  { group: 'partnership', category: 'Partner', tag: 'Partner', title: 'Martial Arts', image: 'assets/martialarts.mp4', description: 'Jiu Jitsu, Wrestling, Boxing & Muay Thai.', bookingTag: 'Direct with coach', pills: 'Ages 16+ | Grappling | Striking', actionLabel: 'Get in touch', link: { external: 'mailto:info@themonkeyvault.com?subject=Martial%20Arts%20classes%20(for%20Ryan)' }, backEyebrow: 'Partner · Teens 16+ & Adults', backHeadline: 'Grappling & striking', backBody: 'Jiu Jitsu, Wrestling, Boxing and Muay Thai under partner coaches. Beginner to competitor — booked directly via WhatsApp.', specs: 'Level: All levels · beginner to competitor || Ages: 16+ || Booking: Direct via WhatsApp · ask for Ryan || Disciplines: BJJ · Wrestling · Boxing · Muay Thai' },
];

export const coreClasses = classes.filter((c) => c.group === 'core');
export const specializedClasses = classes.filter((c) => c.group === 'specialized');
export const partnershipClasses = classes.filter((c) => c.group === 'partnership');
