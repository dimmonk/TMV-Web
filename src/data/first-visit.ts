/**
 * Get-Started "what to bring" + "when you arrive" steps — SSOT for the desktop
 * Get Started page and the mobile Get Started screen. Desktop text is canonical;
 * the `mobile` override carries the shorter phrasing.
 */
import type { Surfaced } from './surface';

export interface BringItem extends Surfaced { text: string; }
export interface ArriveStep extends Surfaced { n: string; text: string; }

export const firstVisitBring: BringItem[] = [
  { text: 'Comfortable clothes you can move in.' },
  { text: "A second pair of clean indoor shoes — not the ones you arrived in. (Forgot them? You can train barefoot, but shoes are comfier when you're starting out.)", mobile: { text: 'A clean pair of indoor shoes (or train barefoot).' } },
  { text: 'A water bottle so you can stay hydrated.', mobile: { text: 'A water bottle to stay hydrated.' } },
];

export const firstVisitArrive: ArriveStep[] = [
  { n: '1', text: 'Arrive 15 minutes early to sign in and get set.', mobile: { text: 'Arrive 15 minutes early to sign in.' } },
  { n: '2', text: 'Stash your things in a locker (bring your own lock).', mobile: { text: 'Stash your things in a locker (bring a lock).' } },
  { n: '3', text: 'Read the Rules poster at the entrance.' },
  { n: '4', text: 'Head to the spring floor and join the group warm-up.', mobile: { text: 'Join the group warm-up on the spring floor.' } },
];
