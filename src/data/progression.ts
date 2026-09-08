/**
 * The client path — SINGLE SOURCE OF TRUTH for the site's guidance layer.
 *
 * Lifted from the staff "Client Progression & Program Recommendation
 * Procedure": customers move Experience → Learn → Progress, the Intro Lesson
 * is THE first step for anyone who wants to learn (get them in the gym with a
 * coach), every page ends with a next step, and the purchase is matched to
 * the goal. The goal picker itself lives in ./goals (same layer, its own list).
 *
 * Everything here is rendered by width-agnostic components (PathStrip,
 * NextStep, PurchaseFit, PartyReturn) that both chromes share, so a copy or
 * price change lands once and appears on every surface.
 */
import { cat, url } from './site';
import { sq } from './square-links';

/* ------------------------------------------------------------- the path -- */

export type StageKey = 'experience' | 'learn' | 'progress';

export interface StageItem { label: string; color: string; }
export interface Stage {
  key: StageKey;
  n: string;
  title: string;
  desc: string;
  items: StageItem[];
}

export const stages: Stage[] = [
  {
    key: 'experience', n: 'Stage 1 · Experience', title: 'Come play',
    desc: 'See the space, burn energy, celebrate. No coach needed.',
    items: [
      { label: 'Open Gym', color: cat.openGym },
      { label: 'Birthday parties', color: cat.parties },
      { label: 'Group events', color: cat.groups },
    ],
  },
  {
    key: 'learn', n: 'Stage 2 · Learn', title: 'Learn with a coach',
    desc: 'Structured lessons at your own pace — learn and play.',
    items: [
      { label: 'Intro lesson', color: '#ffd400' },
      { label: 'Drop-in classes', color: cat.classes },
      { label: 'Camps', color: cat.camps },
    ],
  },
  {
    key: 'progress', n: 'Stage 3 · Progress', title: 'Go faster, go deeper',
    desc: 'More personal, more frequent, more serious.',
    items: [
      { label: 'Private lessons', color: cat.private },
      { label: 'Athletic Program', color: cat.athletic },
      { label: 'Memberships & packs', color: '#211f1b' },
    ],
  },
];

/* ------------------------------------------------ every page's next step -- */

export type NextStepKey =
  | 'opengym-intro'   // Train · after Open Gym
  | 'group-private'   // Train · after the group-class grid
  | 'weekly-athletic' // Train · after the membership band · Schedule
  | 'private-pack'    // Private Lessons · bottom
  | 'athletic-intro'; // Athletic Program · under Join

export interface NextStep {
  icon: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  external?: boolean;
}

const INTRO_PRICE = '$45';

export const nextSteps: Record<NextStepKey, NextStep> = {
  'opengym-intro': {
    icon: 'bi-bullseye', eyebrow: 'Working on the same move every visit?',
    title: 'Get a coach on it — book an intro lesson.',
    body: "One hour, one coach, the skill you're stuck on. You'll leave with a plan and a straight answer on which class fits.",
    cta: `Book an intro · ${INTRO_PRICE}`, href: sq.getStarted.introduction, external: true,
  },
  'group-private': {
    icon: 'bi-person-arms-up', eyebrow: 'Chasing one specific skill?',
    title: 'A private lesson builds the whole hour around it.',
    body: "Group classes are great for steady progress. When it's one move you keep almost landing, a private gets you there faster — pick the time, the coach and what you work on.",
    cta: 'See private options', href: url('private-lessons'),
  },
  'weekly-athletic': {
    icon: 'bi-trophy', eyebrow: 'Coming every week and want to improve?',
    title: 'You might be a better fit for the Athletic Program.',
    body: "Two coached 90-minute sessions a week, unlimited open gym, monthly evaluations so progress is tracked, not guessed. Ages 9+ — your coach will tell you when you're ready.",
    cta: 'See the program', href: url('athletic-program'),
  },
  'private-pack': {
    icon: 'bi-arrow-repeat', eyebrow: 'Made progress in a session?',
    title: 'Keep the momentum — book a pack, not a one-off.',
    body: 'Progress is repetition. A 5-pack means each session builds on the last instead of starting over, and it can be shared with friends and family.',
    cta: 'See 5-packs', href: `${url('store')}#classes`,
  },
  'athletic-intro': {
    icon: 'bi-flag', eyebrow: 'Not sure you meet the prerequisite?',
    title: "Start with an intro lesson — it's your assessment.",
    body: "One session with a coach and you'll know whether to enroll now or build a base in classes first. Either way you leave with a next step.",
    cta: `Book an intro · ${INTRO_PRICE}`, href: sq.getStarted.introduction, external: true,
  },
};

/* ----------------------------------------- match the purchase to the goal -- */

export interface PurchaseFit {
  color: string;
  who: string;
  title: string;
  rec: string;
  body: string;
  /** headline price + qualifier, and a second (optional) figure */
  price: { value: string; note: string };
  price2?: { value: string; note: string };
  cta: string;
  href: string;
  /** anchors on the same page scroll; routes navigate */
  onPage?: boolean;
}

export const purchaseFit: PurchaseFit[] = [
  {
    color: cat.openGym, who: 'Once in a while', title: 'Drop in', rec: 'Day pass or single class',
    body: 'Flexibility, or trying something for the first time. Come when you like, pay per visit, no commitment.',
    price: { value: '$25', note: 'open gym' }, price2: { value: '$30', note: 'class' },
    cta: 'See day passes', href: '#pl-embed-root', onPage: true,
  },
  {
    color: cat.classes, who: 'One goal, one program', title: 'Get a pack', rec: '10-class pack or a private 5-pack',
    body: 'Several sessions at the same thing — a skill, a class, a coach. Cheaper per visit, and each session builds on the last.',
    price: { value: '$275', note: '10 classes' }, price2: { value: '', note: 'valid 10+ months' },
    cta: 'See packs', href: '#pl-embed-root', onPage: true,
  },
  {
    color: '#211f1b', who: 'Every week', title: 'Membership', rec: 'Class membership · open gym included',
    body: 'Training is part of your routine and you want more than one class. Every recreational and specialized class, unlimited.',
    price: { value: '$180', note: '30 days' }, price2: { value: '', note: '90 / 180 / 360-day terms save more' },
    cta: 'See memberships', href: '#pl-embed-root', onPage: true,
  },
  {
    color: cat.athletic, who: 'Serious about progressing', title: 'Train with a plan', rec: 'Athletic Program or private pack',
    body: 'Faster, more structured progression: two coached 90-min sessions a week with monthly check-ins — or a private pack with your own coach.',
    price: { value: '$150', note: '/ month' }, price2: { value: '', note: 'ages 9+ · open gym included' },
    cta: 'See the program', href: url('athletic-program'),
  },
];

/* ---------------------------------------------- birthday party wrap-up -- */

/** The coach's end-of-party speech, as cards: the ways a party guest comes back. */
export interface PartyReturnCard {
  color: string;
  bookingTag: string;
  status: string;
  statusTone: 'neutral' | 'go';
  title: string;
  desc: string;
  pills: string;
  price: string;
  priceNote: string;
  cta: string;
  href: string;
}

export const partyReturn: PartyReturnCard[] = [
  {
    color: cat.openGym, bookingTag: 'Drop-in', status: 'No reservation', statusTone: 'go', title: 'All-day Open Gym',
    desc: "Come play anytime — every day, 11 AM to 10 PM, no time limit. Under 7s move with a parent, and the parent's free.",
    pills: 'All ages | 7 days', price: '$25', priceNote: 'day pass', cta: 'Get a pass', href: `${url('store')}#opengym`,
  },
  {
    color: cat.classes, bookingTag: 'Drop-in', status: 'No reservation', statusTone: 'go', title: 'Kids Parkour classes',
    desc: 'Learn this stuff with a coach. Recreational parkour and Flip Class, drop-in — try one first, no pack required.',
    pills: 'Parent & Child 3+ | Flips 7+', price: '$30', priceNote: 'single class', cta: 'See schedule', href: url('schedule'),
  },
  {
    color: cat.camps, bookingTag: 'Register', status: 'Dated', statusTone: 'neutral', title: 'Camps',
    desc: 'Full days of skills, flips, games and friends over P.A. days and school breaks. 9 AM–2 PM, late pickup to 4.',
    pills: 'Ages 5+ | All levels', price: '$90', priceNote: 'P.A. Day · $350 / summer week', cta: 'See camps', href: url('camps'),
  },
];

/** The intro nudge under the party-return cards. */
export const partyReturnIntro = {
  lead: "One of them wouldn't stop?",
  body: "An intro lesson is one hour with a coach who'll tell you what they're ready for.",
  cta: `Book an intro · ${INTRO_PRICE}`,
  href: sq.getStarted.introduction,
};
