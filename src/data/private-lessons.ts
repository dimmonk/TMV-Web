/**
 * Private lessons — SINGLE SOURCE OF TRUTH for the "three ways to train
 * privately". The full copy (base) is the desktop Private Lessons page; the
 * `hub` variant is the condensed BookingCard copy the Book hubs (desktop Book
 * page + mobile Book screen) render. One file owns every variant of this
 * domain's copy; surfaces only resolve their own hrefs.
 */
import { cat } from './site';

export interface PrivateWayHub {
  dur?: string;
  flag?: string;
  bookingTag: string;
  desc: string;
  pills: string;
  price?: string;
  priceNote: string;
}

export interface PrivateWay {
  key: 'intro' | 'private' | 'coach';
  color: string;
  title: string;
  /** page card: headline price + qualifier + fine print */
  price: string;
  per?: string;
  sub: string;
  desc: string;
  cta: string;
  /** condensed variant for the Book hubs */
  hub: PrivateWayHub;
}

export const privateWays: PrivateWay[] = [
  {
    key: 'intro', color: cat.intro, title: 'Introduction',
    price: '$45', per: 'first session', sub: '$35 each for 2 · $30 each for 3+',
    desc: 'A one-time lesson on a set beginner curriculum — the best first taste of parkour, and where everyone starts.',
    cta: 'Book intro',
    hub: { dur: '1 hr', price: '$45', priceNote: 'First session · groups from $30 each', bookingTag: 'By appointment', desc: 'A one-time private lesson and the best first taste of parkour — what it is, what you can do with it, and how we coach it.', pills: 'All ages | 1-on-1' },
  },
  {
    key: 'private', color: cat.private, title: 'Private Lesson',
    price: 'From $65', per: 'per session', sub: 'Kids $65 · Adults $85 · 5-packs available',
    desc: 'Ongoing one-on-one (or your own small group) with whichever coach is on shift. All ages, all levels, flexible scheduling.',
    cta: 'Book a private',
    hub: { dur: '1 hr', price: 'From $65', priceNote: 'Any coach on shift · 5-packs available', bookingTag: 'By appointment', desc: 'Ongoing one-on-one or small-group coaching, built around your goals with flexible scheduling. Pick your age group when you book — we’ll match a coach.', pills: '1-on-1 | All ages' },
  },
  {
    key: 'coach', color: cat.private, title: 'Train with a specific coach',
    price: "Coach's rate", sub: 'Set per coach · ongoing 1-on-1',
    desc: "Pick the coach whose style fits your goals and stick with them — one instructor who follows your whole progress, building each session on the last. They'll come in just for you, even on a day off.",
    cta: 'Choose a coach',
    hub: { flag: 'Pick your coach', priceNote: 'Coach sets their own rate', bookingTag: 'By appointment', desc: 'Pick a coach and stick with them — one instructor who follows your whole progress and comes in just for your session, even on a day off.', pills: '1-on-1 | Your coach' },
  },
];
