/**
 * Get Started · step two — SINGLE SOURCE OF TRUTH for "book your intro lesson"
 * (components/IntroStep.astro, rendered by both chromes).
 *
 * There used to be four equal cards here (intro / private / group / open gym).
 * The client-progression procedure makes the Intro Lesson THE first step for
 * anyone who wants to learn, so step two is now one recommendation with the
 * why beside it, and the other ways in are a quiet row underneath. The intro's
 * own copy and price stay in ./private-lessons (privateWays[0]) — this file
 * only holds what's specific to the Get Started framing.
 */
import { cat, url } from './site';

export interface IntroWhy { title: string; sub: string; }

export const introWhy: IntroWhy[] = [
  { title: 'The parkour basics, one-on-one', sub: 'A set beginner lesson plan, the same proven hour every time. That is why it costs less than a private.' },
  { title: 'You leave knowing what fits next', sub: 'The coach tells you which class or program suits you or your kid.' },
  { title: 'Any question, answered in person', sub: 'Ages, levels, safety, schedule — easier face to face than on a website.' },
];

/** The other first visit: a specific skill or goal goes straight to a private lesson (owner's rule, 2026-10-20). */
export const privateFirst = {
  label: 'Have a specific skill or goal?',
  text: 'Book a private lesson instead. The coach plans the whole hour around it — you can book it as your very first visit.',
  cta: 'Book a private lesson',
};

/** The same-day bonus — was step three's closer, now part of the intro pitch. */
export const introBonus = {
  strong: '15% off',
  text: 'any pass or class you buy the same day as your intro.',
};

export interface OtherWayIn { label: string; color: string; href: string; }

export const otherWaysIn: OtherWayIn[] = [
  { label: 'Open Gym · no booking', color: cat.openGym, href: url('open-gym') },
  { label: 'Drop into a group class', color: cat.classes, href: url('schedule') },
  { label: 'Birthday parties', color: cat.parties, href: url('events') },
];
