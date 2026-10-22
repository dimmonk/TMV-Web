// @ts-check
/**
 * A price on a card, read from the members app's price list instead of typed.
 *
 * Card copy that carries a price names it by its price-list key in braces:
 * `'From {openGym1x} / day'`, `'{groupClass1x} single · 10-pack {groupClass10x}'`.
 * `fillPrices` puts the published amount in (`formatPrice`, the price sheet's own
 * wording, so "$30" and "$27.50" read as they do on /pricing). The build fills
 * the first paint (`<Priced>`, data/prices.ts); the browser fills it again from
 * the price list it reads on page load (`apply-prices.js`), so a price edit in
 * Members shows on every card with no release.
 *
 * All or nothing: a template with any key the price list does not hold (not
 * published, not a number) fills to '', and the line renders nothing, never a
 * sentence with a hole in it.
 */
import { formatPrice } from './price-list-layout.js';

const TOKEN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

/** @param {string} text @returns {boolean} Does the text name a price? */
export const hasPriceToken = (text) => new RegExp(TOKEN.source).test(text);

/**
 * @param {string} template
 * @param {Record<string, unknown>|null|undefined} priceList - the published `priceList` map
 * @returns {string} The text with every price in, or '' when one is missing.
 */
export function fillPrices(template, priceList) {
  let missing = false;
  const text = template.replace(TOKEN, (_, key) => {
    const value = priceList?.[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) { missing = true; return ''; }
    return formatPrice(value);
  });
  return missing ? '' : text;
}
