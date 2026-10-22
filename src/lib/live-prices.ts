/**
 * The browser half of the card prices.
 *
 * The page was built from the price list as it stood at the last release. On
 * every page load that shows a price, this reads the published price list again
 * (the one client door, `fetchPublicPriceList`) and re-fills every price in
 * place (`apply-prices.js`), so a price saved in Members shows within the
 * object's one-minute cache, no release needed. A failed read keeps what was
 * built and says so once in the console. The result is shared across
 * client-side navigations and re-read when older than `REFRESH_AFTER_MS`.
 */
import { fetchPublicPriceList } from './public-projections.js';
import { applyPrices } from './apply-prices.js';

const REFRESH_AFTER_MS = 60_000;

let latest: Record<string, unknown> | null = null;
let fetchedAt = 0;
let inFlight: Promise<void> | null = null;

async function refresh() {
  if (!document.querySelector('[data-price-text]')) return;
  if (latest) applyPrices(document, latest);
  if (latest && Date.now() - fetchedAt < REFRESH_AFTER_MS) return;
  if (!inFlight) {
    inFlight = fetchPublicPriceList()
      .then((json) => { latest = json.priceList as Record<string, unknown>; fetchedAt = Date.now(); })
      .catch((e: Error) => { console.warn('[prices] could not refresh the price list; keeping what was built:', e.message); })
      .finally(() => { inFlight = null; });
  }
  const before = latest;
  await inFlight;
  if (latest && latest !== before) applyPrices(document, latest);
}

document.addEventListener('astro:page-load', () => { void refresh(); });
