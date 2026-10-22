// @ts-check
/**
 * Re-fill every price on a page built from an older copy of the price list.
 *
 * `<Priced>` keeps each line's template in `data-price-text`; this fills it
 * again from the price list the browser just read, with the build's own rule
 * (`fillPrices`): a line that names a missing price is hidden.
 */
import { fillPrices } from './price-text.js';

/**
 * @param {Document} doc
 * @param {Record<string, unknown>} priceList - the published `priceList` map
 */
export function applyPrices(doc, priceList) {
  doc.querySelectorAll('[data-price-text]').forEach((node) => {
    const el = /** @type {HTMLElement} */ (node);
    const text = fillPrices(el.dataset.priceText ?? '', priceList);
    if (el.textContent !== text) el.textContent = text;
    el.hidden = text === '';
  });
}
