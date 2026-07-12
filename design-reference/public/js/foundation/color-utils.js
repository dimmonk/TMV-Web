/**
 * Color utilities — single source of truth for color math shared across the app.
 *
 * `contrastText` picks a readable foreground (near-black or white) for a given
 * background hex using perceived (Rec. 601) luminance. Used anywhere a
 * background color is data-driven and the text must stay legible on top of it
 * (access badges, the print/embed schedule sheets, etc.).
 */

/**
 * Return a legible text color ('#1a1a1a' or '#ffffff') for a hex background.
 *
 * @param {string} bg - Background color as a hex string (`#rgb` or `#rrggbb`,
 *   leading `#` optional). Anything unparseable falls back to white text.
 * @returns {string} '#1a1a1a' for light backgrounds, '#ffffff' for dark ones.
 */
export function contrastText(bg) {
  if (!bg) return '#ffffff';
  const hex = String(bg).replace('#', '');
  if (hex.length !== 3 && hex.length !== 6) return '#ffffff';
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#ffffff';
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1a1a1a' : '#ffffff';
}
