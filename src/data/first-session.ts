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
  { title: "A coach sees where you're at", sub: 'Not a tour — a real hour of coaching, scaled to you or your kid.' },
  { title: 'You leave with one next step', sub: 'The coach tells you which class, pack or program fits — and why.' },
  { title: 'Any question, answered in person', sub: 'Ages, levels, safety, schedule — easier face to face than on a website.' },
];

/** The same-day bonus — was step three's closer, now part of the intro pitch. */
export const introBonus = {
  strong: '15% off',
  text: 'any pass or class you buy the same day as your intro.',
};

export interface OtherWayIn { label: string; color: string; href: string; }

export const otherWaysIn: OtherWayIn[] = [
  { label: 'Open Gym day pass · $25', color: cat.openGym, href: `${url('train')}#opengym` },
  { label: 'Drop into a group class · $30', color: cat.classes, href: url('schedule') },
  { label: 'Birthday parties', color: cat.parties, href: url('events') },
];
