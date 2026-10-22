/**
 * The Members schedule and price list, read ONCE per build for the Specialized
 * Classes card.
 *
 * Both are the static projections the members app republishes on every change
 * (ADR-0154), read through the one client door (`public-projections.js`, a
 * verbatim copy of the members app's reader). The card's classes,
 * descriptions, days, times and ages come from the schedule
 * (`specializedView`); the shared price comes from the price list, so neither is
 * typed in this repo. The browser re-reads the schedule on page load and updates
 * the card in place (lib/class-tabs.ts).
 *
 * FALLBACK, as for the site config: a failed read warns and carries on with
 * nothing (no card when the schedule cannot be read; no price in the shared
 * block when the price list cannot be read).
 */
import { fetchPublicSchedule, fetchPublicPriceList } from '../lib/public-projections.js';
import { formatPrice } from '../lib/price-list-layout.js';
import { specializedView, type ClassRow } from '../lib/specialized-classes.js';
import { specializedClips } from './classes';

/** What every specialized class shares, said once on the card. */
export interface ClassOffer {
  /** "$30 a class · 10 for $275", or '' when the price list could not be read. */
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

const [schedule, prices] = await Promise.all([
  readAtBuild('schedule', () => fetchPublicSchedule({ fresh: true })),
  readAtBuild('price list', () => fetchPublicPriceList({ fresh: true })),
]);

/** The Specialized Classes, in the schedule's order. Empty when the schedule could not be read. */
export const specializedRows: ClassRow[] = specializedView(schedule as Parameters<typeof specializedView>[0], specializedClips);

const single = prices?.priceList?.groupClass1x;
const tenPack = prices?.priceList?.groupClass10x;

export const specializedOffer: ClassOffer = {
  price: typeof single === 'number' && typeof tenPack === 'number'
    ? `${formatPrice(single)} a class · 10 for ${formatPrice(tenPack)}`
    : '',
};
