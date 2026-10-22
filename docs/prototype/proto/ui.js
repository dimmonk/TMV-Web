// Small builders shared by the pages. When the app has a pure builder for the same thing (a row, a badge, a modal), import the
// app's own from ../js/ instead of redrawing it here; this file is only for what the prototype itself needs.

/** HTML-escapes text for safe interpolation into a template string. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** The empty-state block for a list with nothing in it. */
export const emptyState = (message) => `<p class="proto-empty">${esc(message)}</p>`;

/** `items.map(row).join('')`, or the empty state when there are none. */
export const rows = (items, row, emptyMessage) => (items.length === 0 ? emptyState(emptyMessage) : items.map(row).join(''));
