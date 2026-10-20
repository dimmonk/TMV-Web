/**
 * The goal picker — "What are you here for?" — SINGLE SOURCE OF TRUTH for the
 * ASK → RECOMMEND → REASON → INVITE entry point on Home. One goal → ONE
 * recommendation with a reason, one CTA, and where it usually leads next.
 *
 * Match the lesson to the goal (owner's rule, 2026-10-20): parkour basics → the
 * Intro Lesson, a set beginner lesson plan that is the same every time (why it
 * costs less); a specific skill → a Private Lesson built around it, first visit
 * included; regular structured training → the Athletic Program, whose
 * prerequisite is checked in the first class. "Just play" → Open Gym;
 * "birthday" → a party. Rendered by components/GoalPicker.astro on both chromes.
 *
 * Copy names options, never prices or hours: the one number on a card is its
 * `price` field (the real build reads it from the published price list), and
 * hours live only in what staff publish.
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
const PRIVATE = { color: cat.private, cta: 'Book a private lesson', href: sq.privateLessons.privateLesson, external: true, price: '1 hr · Kids $65 · Adults $85' } as const;
const openGym = url('open-gym');
const dayPass = `${url('store')}#opengym`;

export const goals: Goal[] = [
  {
    id: 'kid', label: 'Find an activity my kid loves', ...INTRO,
    eyebrow: "We'd start them with", title: 'An intro lesson with a coach',
    reason: 'A first taste of parkour on our set beginner lesson plan. Your child learns the basics one-on-one, you see how we coach, and the coach tells you which class fits next.',
    altLead: 'Not sure they want a lesson yet?', altLink: 'Try an open gym day pass first.', altHref: openGym,
    sideLabel: 'Where it usually leads',
    leads: [
      { title: 'Kids Parkour · Recreational', sub: 'Drop-in group class, no booking', color: cat.classes, href: url('schedule') },
      { title: 'Camps', sub: 'School breaks & P.A. Days · ages 5 to 16', color: cat.camps, href: url('camps') },
    ],
  },
  {
    id: 'parkour', label: 'Learn parkour', ...INTRO,
    eyebrow: "We'd start you with", title: 'An intro lesson with a coach',
    reason: 'One hour on our set beginner lesson plan: the parkour basics, the same proven plan every time. For a specific skill or goal, a private lesson is built around you instead.',
    altLead: 'Coming with friends?', altLink: 'Intros cost less per person in a group of two or more.', altHref: url('get-started'),
    sideLabel: 'Where it usually leads',
    leads: [
      { title: 'Recreational Parkour', sub: 'Drop-in group classes, all ages', color: cat.classes, href: url('schedule') },
      { title: 'Private lessons', sub: 'Built around your goal, at your pace', color: cat.private, href: url('private-lessons') },
    ],
  },
  {
    id: 'skill', label: 'Work on a specific skill', ...PRIVATE,
    eyebrow: "We'd start you with", title: 'A private lesson built around your goal',
    reason: 'A backflip, a handstand, a kong vault: tell us the goal and the coach plans the whole hour around it and your current level. You can book it as your very first visit.',
    altLead: 'Prefer a group?', altLink: 'See the specialized classes.', altHref: `${url('train')}#specialized`,
    sideLabel: 'Keep working on your goal',
    leads: [
      { title: 'Specialized group classes', sub: 'Flips, handstands, strength & more', color: cat.classes, href: `${url('train')}#specialized` },
      { title: 'Private 5-pack', sub: 'Every session on your goal', color: cat.private, href: url('private-lessons') },
    ],
  },
  {
    id: 'serious', label: 'Train seriously',
    color: cat.athletic, cta: 'See the Athletic Program', href: url('athletic-program'), price: '$150 / month · ages 9+',
    eyebrow: "We'd point you to", title: 'The Athletic Program',
    reason: 'Two coached 90-minute sessions a week and monthly check-ins. There is a prerequisite: your first class is the check, or a coach who has already worked with you can vouch.',
    altLead: 'One skill in mind instead?', altLink: 'Book a private lesson built around it.', altHref: sq.privateLessons.privateLesson,
    sideLabel: 'Where it usually leads',
    leads: [
      { title: 'Athletic Program', sub: '2 × 90 min a week + open gym · ages 9+', color: cat.athletic, href: url('athletic-program') },
      { title: 'Private lessons', sub: 'Extra 1-on-1 on what you are working on', color: cat.private, href: url('private-lessons') },
    ],
  },
  {
    id: 'play', label: 'Just play & burn energy',
    color: cat.openGym, eyebrow: "We'd point you to", title: 'Open Gym — no class, no booking',
    reason: "Full run of the floor, foam pit and obstacles, any time we're open, no time limit. Sign the waiver online, get a day pass, show up. All ages; kids under 7 play with a parent.",
    cta: 'Plan an open gym visit', href: openGym, price: '$25 · all day',
    altLead: 'Want coaching on a specific move?', altLink: 'Book a private lesson built around it.', altHref: sq.privateLessons.privateLesson,
    sideLabel: 'Coming back a lot?',
    leads: [
      { title: 'Visit packs', sub: 'Pre-paid, cheaper per visit', color: cat.openGym, href: dayPass },
      { title: 'Open Gym membership', sub: 'Unlimited, monthly', color: cat.openGym, href: dayPass },
    ],
  },
  {
    id: 'party', label: 'Celebrate a birthday',
    color: cat.parties, eyebrow: "We'd point you to", title: 'A Full Birthday Party',
    reason: 'Two hours: a coached session of games and challenges, then a private party room. Coaches stay with the group the whole time. Your card holds the slot; you pay on the day, by final headcount.',
    cta: 'Book a party', href: sq.book.fullBirthday, external: true, price: '$350 base · up to 8 kids',
    altLead: 'Smaller crew or short notice?', altLink: 'See the mini party.', altHref: url('events'),
    sideLabel: 'After the party',
    leads: [
      { title: 'Open Gym', sub: 'The easiest way back', color: cat.openGym, href: openGym },
      { title: 'Kids Parkour class', sub: "For the one who wouldn't stop", color: cat.classes, href: url('schedule') },
    ],
  },
];
