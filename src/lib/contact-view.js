// @ts-check
/**
 * The gym's contact as the page shows it: the text and the links of every
 * `data-contact*` hook, from the published contact (`published-config.js`).
 * The build and the browser refresh (`apply-site-config.js`) both call this, so
 * there is one definition of what each hook shows. '' means "nothing to show":
 * the hook is `hidden`.
 */
import { gymAddressLine, gymPhoneHref, gymEmailHref, gymDirectionsUrl } from './gym-contact.js';

/**
 * @typedef {Object} ContactView
 * @property {string} phone - as typed, for display
 * @property {string} email
 * @property {string} street - the first address line
 * @property {string} locality - the second: "Toronto, ON M3K 2B9"
 * @property {string} line - the whole address on one line
 * @property {import('./published-config.js').Contact['address']} address - the parts, for structured data
 * @property {Record<'phone'|'email'|'directions', string>} href
 */

/**
 * @param {import('./published-config.js').Contact} contact
 * @returns {ContactView}
 */
export function contactView(contact) {
  const { address, phone, email } = contact;
  return {
    phone,
    email,
    street: address.street,
    locality: gymAddressLine({ ...address, street: '' }),
    line: gymAddressLine(address),
    address,
    href: { phone: gymPhoneHref(phone), email: gymEmailHref(email), directions: gymDirectionsUrl(address) },
  };
}

/** Which part of the contact a `data-contact-wrap` stands for, and so when it is empty. */
export const CONTACT_PARTS = Object.freeze({
  phone: /** @param {ContactView} v */ (v) => v.phone,
  email: /** @param {ContactView} v */ (v) => v.email,
  address: /** @param {ContactView} v */ (v) => v.line,
});
