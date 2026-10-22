/**
 * The members app's price list, read ONCE per build for every price on a card.
 *
 * Card copy names a price by its price-list key (`'From {openGym1x}'`,
 * `lib/price-text.js`); `<Priced>` fills it from here for the first paint and
 * tags it so the browser fills it again from the price list it reads on page
 * load (`lib/live-prices.ts`). So no price is typed in this repo, and a price
 * saved in Members (Pricing) reaches every card with no release.
 *
 * FALLBACK, as for the site config: a failed read warns and carries on with no
 * prices; a line that names one renders nothing.
 */
import { fetchPublicPriceList } from '../lib/public-projections.js';
import { fillPrices } from '../lib/price-text.js';

async function readAtBuild(): Promise<Record<string, unknown> | null> {
  try {
    const json = await fetchPublicPriceList({ fresh: true });
    return json.priceList as Record<string, unknown>;
  } catch (e) {
    console.warn('[prices] public price list fetch failed at build time; carrying on with no card prices:', (e as Error).message);
    return null;
  }
}

/** The published `priceList` map, or null when it could not be read. */
export const priceList = await readAtBuild();

/** A price template filled from the build's price list; '' when a price it names is missing. */
export const priced = (template: string): string => fillPrices(template, priceList);
