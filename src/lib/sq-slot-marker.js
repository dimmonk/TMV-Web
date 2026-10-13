// @ts-check
/**
 * Square link slots in a built page.
 *
 * `square-links.ts` writes every card's href as `<url>#tmv-sq=<page>.<field>`
 * so the slot travels with the value through the data modules and components.
 * After the build, this moves the marker into a `data-sq` attribute on the
 * anchor (`href="<url>" data-sq="<page>.<field>"`), which is what
 * `apply-site-config.js` reads to re-resolve a link in the browser. A marker
 * that is not on an anchor's href (a value copied into another attribute) is
 * stripped, so no visitor ever sees the fragment.
 */

const ON_HREF = /href="([^"]*?)#tmv-sq=([A-Za-z0-9.]+)"/g;
const ANY = /#tmv-sq=[A-Za-z0-9.]+/g;

/**
 * @param {string} html
 * @returns {string}
 */
export function moveSlotMarkers(html) {
  return html.replace(ON_HREF, 'href="$1" data-sq="$2"').replace(ANY, '');
}
