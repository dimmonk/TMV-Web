// @ts-check
/** Written as code points so no editor or tool can turn them into the characters themselves. */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g');
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g');

/**
 * JSON for the inside of a `<script>` element (the structured data).
 *
 * `JSON.stringify` leaves `<` alone, so a string that holds `</script>` closes
 * the element and what follows it is parsed as markup. A published value
 * (a social link is a valid URL with `</script>` in its path) must reach the
 * page as data, never as markup. The escape for `<` reads back as `<` to any
 * JSON parser, and also covers `<!--`. The two line separators are escaped as
 * well: legal in JSON, but a line break to JavaScript before ES2019.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function jsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029');
}
