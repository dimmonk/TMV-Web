/**
 * The Members schedule, read ONCE per build for the Specialized Classes card.
 *
 * Both are the static projections the members app republishes on every change
 * (ADR-0154), read through the one client door (`public-projections.js`, a
 * verbatim copy of the members app's reader). The card's classes,
 * descriptions, days, times and ages come from the schedule
 * (`specializedView`); the shared price names its price-list keys and is filled
 * by `<Priced>` (data/prices.ts), so neither is typed in this repo. The browser re-reads the schedule on page load and updates
 * the card in place (lib/class-tabs.ts).
 *
 * FALLBACK, as for the site config: a failed read warns and carries on with
 * nothing (no card when the schedule cannot be read).
 */
import { fetchPublicSchedule } from '../lib/public-projections.js';
import { specializedView, type ClassRow } from '../lib/specialized-classes.js';
import { specializedClips } from './classes';

/** What every specialized class shares, said once on the card. */
export interface ClassOffer {
  /** The price line as a price template (lib/price-text.js), rendered through `<Priced>`. */
  price: string;
}

async function readAtBuild<T>(label: string, read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch (e) {
    console.warn(`[class-schedule] public ${label} fetch failed at build time; carrying on without it:`, (e as Error).message);
    return null;
  }
}

const schedule = await readAtBuild('schedule', () => fetchPublicSchedule({ fresh: true }));

/** The Specialized Classes, in the schedule's order. Empty when the schedule could not be read. */
export const specializedRows: ClassRow[] = specializedView(schedule as Parameters<typeof specializedView>[0], specializedClips);

export const specializedOffer: ClassOffer = {
  price: '{groupClass1x} a class · 10 for {groupClass10x}',
};
