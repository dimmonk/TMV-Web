// @ts-check
/**
 * The gym's street address, phone number and email: how they are read out of the published site config and how
 * they are written as text and links.
 *
 * The values live in ONE place, TMV-Members `settings/siteConfig` (Settings > Banner, hours & social), and reach
 * this site through its published copy (`public/site-config.json`, read by `published-config.js`). Nothing in this
 * repo types them. This file is only the SHAPE and the WORDING, so an address reads the same here as on the waiver,
 * in the member app and in Quick Reference.
 *
 * PURE. Below this comment, a verbatim copy of TMV-Members `public/js/foundation/gym-contact.js` (ADR-0202).
 * Change one, change the other.
 */

/** The address fields, in the order they are written. */
export const GYM_ADDRESS_KEYS = Object.freeze(['street', 'city', 'region', 'postalCode']);

/** What `gymContactOf` gives for an object that holds nothing. */
const EMPTY_CONTACT = Object.freeze({ address: Object.freeze({ street: '', city: '', region: '', postalCode: '' }), phone: '', email: '' });

/** @param {unknown} v @returns {string} */
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

/**
 * The gym contact in a site-config object (the stored document or its published copy), with every field a trimmed
 * string. An object without `address` / `phone` / `email` gives empty strings, never undefined.
 * @param {unknown} source
 * @returns {{address: {street: string, city: string, region: string, postalCode: string}, phone: string, email: string}}
 */
export function gymContactOf(source) {
  const s = source && typeof source === 'object' ? /** @type {Record<string, any>} */ (source) : {};
  if (!s.address && !s.phone && !s.email) return EMPTY_CONTACT;
  const a = s.address && typeof s.address === 'object' ? s.address : {};
  return {
    address: { street: clean(a.street), city: clean(a.city), region: clean(a.region), postalCode: clean(a.postalCode) },
    phone: clean(s.phone),
    email: clean(s.email),
  };
}

/** The second line of an address: "Toronto, ON M1M 1M1". @param {{city: string, region: string, postalCode: string}} a */
function localityLine(a) {
  const regionAndCode = [a.region, a.postalCode].filter(Boolean).join(' ');
  return [a.city, regionAndCode].filter(Boolean).join(', ');
}

/**
 * The address as one line: "1 Main St, Unit 2, Toronto, ON M1M 1M1". '' when nothing is set.
 * @param {{street: string, city: string, region: string, postalCode: string}} address
 * @returns {string}
 */
export function gymAddressLine(address) {
  return [address.street, localityLine(address)].filter(Boolean).join(', ');
}

/**
 * The address as the two lines of a card: ["1 Main St, Unit 2", "Toronto, ON M1M 1M1"]. A line with nothing in
 * it is left out.
 * @param {{street: string, city: string, region: string, postalCode: string}} address
 * @returns {string[]}
 */
export function gymAddressLines(address) {
  return [address.street, localityLine(address)].filter(Boolean);
}

/**
 * A `tel:` link for the phone, or '' when it is not a number a phone can dial. A ten-digit number is a North
 * American one ("(416) 555-0100" -> "tel:+14165550100"); a longer one is dialled as typed.
 * @param {string} phone
 * @returns {string}
 */
export function gymPhoneHref(phone) {
  const digits = clean(phone).replace(/\D/g, '');
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`;
  return digits.length >= 7 ? `tel:${digits}` : '';
}

/**
 * A map link for the address, or '' when there is none.
 * @param {{street: string, city: string, region: string, postalCode: string}} address
 * @returns {string}
 */
export function gymDirectionsUrl(address) {
  const line = gymAddressLine(address);
  return line ? `https://maps.google.com/?q=${encodeURIComponent(line).replace(/%20/g, '+')}` : '';
}

/**
 * A `mailto:` link for the email, or '' when it is not one address (something@something.tld, no spaces).
 * @param {string} email
 * @returns {string}
 */
export function gymEmailHref(email) {
  const address = clean(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? `mailto:${address}` : '';
}
