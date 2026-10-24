/**
 * The client path — SINGLE SOURCE OF TRUTH for the site's guidance layer.
 *
 * Lifted from the staff "Client Progression & Program Recommendation
 * Procedure": customers move Experience → Learn → Progress. Match the lesson to
 * the goal: the Intro Lesson is a set basic-parkour lesson plan, a specific
 * skill goes straight to a private lesson. Every page ends with a next step,
 * and the purchase is matched to the goal. The goal picker lives in ./goals.
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
    desc: 'Structured lessons at your own pace: learn and play.',
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

/**
 * "Every interaction ends with a next step" — ONE per page, and one LINE.
 *
 * The procedure's rule is about the coach in person, where the next step costs
 * nothing to say. On the web the same rule, applied per section, just becomes
 * more page to scroll — so it is deliberately capped at one quiet line at the
 * end of each program page, never a stack of banners. The open-gym → intro
 * nudge that used to live here is gone: the goal picker's "just play" answer
 * already says it, and saying it twice is the overload this cap exists to stop.
 */
export type NextStepKey =
  | 'group-private'   // Train
  | 'weekly-athletic' // Schedule
  | 'private-pack'    // Private Lessons
  | 'athletic-intro'; // Athletic Program

export interface NextStep {
  icon: string;
  /** One sentence: the observation and the recommendation, together. */
  text: string;
  cta: string;
  href: string;
  external?: boolean;
}

const INTRO_PRICE = '{introClass1x}';

export const nextSteps: Record<NextStepKey, NextStep> = {
  'group-private': {
    icon: 'bi-person-arms-up',
    text: 'Chasing one specific skill? A private lesson builds the whole hour around it.',
    cta: 'See private options', href: url('private-lessons'),
  },
  'weekly-athletic': {
    icon: 'bi-trophy',
    text: 'Training every week? The Athletic Program is built for exactly that, ages 9+.',
    cta: 'See the program', href: url('athletic-program'),
  },
  'private-pack': {
    icon: 'bi-arrow-repeat',
    text: 'Progress is repetition: a pack means each session builds on the last.',
    cta: 'See 5-packs', href: `${url('store')}#classes`,
  },
  'athletic-intro': {
    icon: 'bi-flag',
    text: 'Not sure you meet the prerequisite? Come to your first class: the coach checks it there.',
    cta: 'See the class times', href: url('schedule'),
  },
};

/* ----------------------------------------- match the purchase to the goal -- */

export interface PurchaseFit {
  color: string;
  who: string;
  title: string;
  rec: string;
  body: string;
  /** headline price + qualifier, a second (optional) figure beside it, and an optional fine-print line under them */
  price: { value: string; note: string };
  price2?: { value: string; note: string };
  fine?: string;
  cta: string;
  href: string;
  /** anchors on the same page scroll; routes navigate */
  onPage?: boolean;
}

export const purchaseFit: PurchaseFit[] = [
  {
    color: cat.openGym, who: 'Once in a while', title: 'Drop in', rec: 'Day pass or single class',
    body: 'Flexibility, or trying something for the first time. Come when you like, pay per visit, no commitment.',
    price: { value: '{openGym1x}', note: 'open gym' }, price2: { value: '{groupClass1x}', note: 'class' },
    cta: 'See day passes', href: '#price-open_gym', onPage: true,
  },
  {
    color: cat.classes, who: 'One goal, one program', title: 'Get a pack', rec: '10-class pack or a private 5-pack',
    body: 'Several sessions at the same thing: a skill, a class, a coach. Cheaper per visit, and each session builds on the last.',
    price: { value: '{groupClass10x}', note: '10 classes' }, fine: 'Valid 10 months · 20-pack: 20 months',
    cta: 'See packs', href: '#price-classes', onPage: true,
  },
  {
    color: '#211f1b', who: 'Every week', title: 'Membership', rec: 'Class membership · open gym included',
    body: 'Training is part of your routine and you want more than one class. Every recreational and specialized class, unlimited.',
    price: { value: '{classMembership30}', note: '30 days' }, fine: '90, 180 and 360-day terms save more',
    cta: 'See memberships', href: '#price-classes', onPage: true,
  },
  {
    color: cat.athletic, who: 'Serious about progressing', title: 'Train with a plan', rec: 'Athletic Program or private pack',
    body: 'Faster, more structured progression: two coached 90-min sessions a week with monthly check-ins, or a private pack with your own coach.',
    price: { value: '{athleticMembership30}', note: '/ month' }, fine: 'Ages 9+ · open gym included',
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
    color: cat.openGym, bookingTag: 'Drop-in', status: 'No reservation', statusTone: 'neutral', title: 'All-day Open Gym',
    desc: "Come play any time we're open, no time limit. Under 7s move with a parent, and the parent's free.",
    pills: 'All ages | No booking', price: '{openGym1x}', priceNote: 'day pass', cta: 'Plan a visit', href: url('open-gym'),
  },
  {
    color: cat.classes, bookingTag: 'Drop-in', status: 'No reservation', statusTone: 'neutral', title: 'Kids Parkour classes',
    desc: 'Learn this stuff with a coach. Recreational parkour and Flip Class, drop-in: try one first, no pack required.',
    pills: 'Parent & Child 3+ | Flips 7+', price: '{groupClass1x}', priceNote: 'single class', cta: 'See schedule', href: url('schedule'),
  },
  {
    color: cat.camps, bookingTag: 'Register', status: 'Dated', statusTone: 'neutral', title: 'Camps',
    desc: 'Full days of skills, flips, games and friends over P.A. days and school breaks. 9 AM–2 PM, late pickup to 4.',
    pills: 'Ages 5–16 | All levels', price: '{campPADay}', priceNote: 'P.A. Day · {campWeekly} / summer week', cta: 'See camp dates', href: url('camps'),
  },
];

/** The intro nudge under the party-return cards. */
export const partyReturnIntro = {
  lead: 'Want them to keep going?',
  body: 'Book an intro lesson: an hour of parkour basics with a coach, who then tells you which class suits your child.',
  cta: 'Book an intro',
  /** The price after the label, filled from the price list (`<Priced>`). */
  ctaPrice: ` · ${INTRO_PRICE}`,
  href: sq.getStarted.introduction,
};
