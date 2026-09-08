/**
 * The goal picker — "What are you here for?" — SINGLE SOURCE OF TRUTH for the
 * ASK → RECOMMEND → REASON → INVITE entry point on Home. One goal → ONE
 * recommendation with a reason, one CTA, and where it usually leads next.
 *
 * Every "learn" goal lands on the Intro Lesson (the designed first step: get
 * them in the gym with a coach); "just play" → Open Gym; "birthday" → a
 * party. Rendered by components/GoalPicker.astro on both chromes.
 */
import { cat, url } from './site';
import { sq } from './square-links';

export interface GoalLead { title: string; sub: string; color: string; href: string; }

export interface Goal {
  id: string;
  label: string;
  /** recommendation card */
  color: string;
  eyebrow: string;
  title: string;
  reason: string;
  cta: string;
  href: string;
  external?: boolean;
  price: string;
  /** the "or…" line under the CTA */
  altLead: string;
  altLink: string;
  altHref: string;
  /** side column */
  sideLabel: string;
  leads: GoalLead[];
}

const INTRO = { color: cat.intro, cta: 'Book an intro', href: sq.getStarted.introduction, external: true, price: '$45 · 1 hr · 1-on-1' } as const;
const openGym = `${url('train')}#opengym`;
const dayPass = `${url('store')}#opengym`;

export const goals: Goal[] = [
  {
    id: 'kid', label: 'Find an activity my kid loves', ...INTRO,
    eyebrow: "We'd start them with", title: 'An intro lesson with a coach',
    reason: "One private session on our beginner curriculum. The coach sees where your kid is at, you see how we coach, and you leave knowing exactly which class fits — instead of guessing from a schedule.",
    altLead: 'Not sure they want a lesson yet?', altLink: 'Try an open gym day pass first — $25.', altHref: dayPass,
    sideLabel: 'Where it usually leads',
    leads: [
      { title: 'Kids Parkour · Recreational', sub: 'Drop-in group class · $30, 10-pack $275', color: cat.classes, href: url('schedule') },
      { title: 'Camps', sub: 'P.A. Days $90 · Summer weeks $350', color: cat.camps, href: url('camps') },
    ],
  },
  {
    id: 'parkour', label: 'Learn parkour', ...INTRO,
    eyebrow: "We'd start you with", title: 'An intro lesson with a coach',
    reason: "A one-hour private on the beginner curriculum — what parkour is, what you can already do, and how we coach it. You finish with a real recommendation for what to book next, not a menu.",
    altLead: 'Coming with friends?', altLink: 'Intros are $35 each for two, $30 each for three or more.', altHref: url('private-lessons'),
    sideLabel: 'Where it usually leads',
    leads: [
      { title: 'Recreational Parkour', sub: 'Drop-in group classes, all ages', color: cat.classes, href: url('schedule') },
      { title: 'Private lessons', sub: 'Faster, built around your goals · from $65', color: cat.private, href: url('private-lessons') },
    ],
  },
  {
    id: 'backflip', label: 'Land a backflip', ...INTRO,
    eyebrow: "We'd start you with", title: "An intro lesson — tell the coach it's the backflip",
    reason: 'The coach builds the hour around that one skill, spots you the whole way, and tells you straight whether Flip Class or a private pack gets you there fastest. Structured coaching, not figuring it out in open gym.',
    altLead: 'Already flipping?', altLink: 'Drop into Flip Class or Backflip Only (adults, Sat 12 PM) — $30.', altHref: url('schedule'),
    sideLabel: 'Where it usually leads',
    leads: [
      { title: 'Flip Class · Levels 1–2', sub: 'Drop-in · ages 7+ · $30, 10-pack $275', color: cat.classes, href: url('schedule') },
      { title: 'Private 5-pack', sub: 'The whole session on the one move', color: cat.private, href: url('private-lessons') },
    ],
  },
  {
    id: 'serious', label: 'Train seriously', ...INTRO,
    eyebrow: "We'd start you with", title: 'An intro lesson — it doubles as your assessment',
    reason: "The Athletic Program has a prerequisite, and the intro is how a coach checks it. One session and you'll know whether to enroll now or build a base in classes first — and you'll have a coach who knows your name.",
    altLead: 'Already have the base?', altLink: 'Go straight to the Athletic Program — $150 / month.', altHref: url('athletic-program'),
    sideLabel: 'Where it usually leads',
    leads: [
      { title: 'Athletic Program', sub: '2 × 90 min a week + open gym · ages 9+', color: cat.athletic, href: url('athletic-program') },
      { title: 'Train with a specific coach', sub: 'Ongoing 1-on-1, they follow your whole progress', color: cat.private, href: `${url('private-lessons')}#coaches` },
    ],
  },
  {
    id: 'play', label: 'Just play & burn energy',
    color: cat.openGym, eyebrow: "We'd point you to", title: 'Open Gym — no class, no booking',
    reason: "Full run of the floor, foam pit and obstacles, every day 11 AM – 10 PM, no time limit. Sign the waiver online, buy a day pass, show up. Everyone's welcome, all ages mixed.",
    cta: 'Get a day pass', href: dayPass, price: '$25 · all day',
    altLead: 'Keep working on the same move?', altLink: "That's when an intro lesson is worth it.", altHref: sq.getStarted.introduction,
    sideLabel: 'Coming back a lot?',
    leads: [
      { title: 'Visit packs', sub: 'Pre-paid, cheaper per visit', color: cat.openGym, href: dayPass },
      { title: 'Open Gym membership', sub: 'Unlimited, monthly', color: cat.openGym, href: dayPass },
    ],
  },
  {
    id: 'party', label: 'Celebrate a birthday',
    color: cat.parties, eyebrow: "We'd point you to", title: 'A Full Birthday Party',
    reason: 'Two hours: a coached session of games and challenges, then a private party room. Coaches stay with the group the whole time. Your card holds the slot — you pay on the day, by final headcount.',
    cta: 'Book a party', href: sq.book.fullBirthday, external: true, price: '$350 base · up to 8 kids',
    altLead: 'Smaller crew or short notice?', altLink: 'Mini party — $30 a kid, 3 kid minimum.', altHref: url('events'),
    sideLabel: 'After the party',
    leads: [
      { title: 'Open Gym day pass', sub: 'The easiest way back — $25', color: cat.openGym, href: openGym },
      { title: 'Kids Parkour class', sub: "For the one who wouldn't stop", color: cat.classes, href: url('schedule') },
    ],
  },
];
