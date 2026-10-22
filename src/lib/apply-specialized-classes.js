// @ts-check
/**
 * The browser half of the Specialized Classes card: bring a built card up to
 * date with the schedule as it is now.
 *
 * The build rendered one row and one panel per class that had sessions at the
 * last release. This re-applies the SAME view (`specializedView`) in place: a
 * class whose sessions are all gone (or cancelled) is hidden, and every listed
 * class gets its current days, description, ages and times. A class
 * added in Members since the release shows from the next release. Text goes in
 * through `textContent` only: a published value is data, never markup.
 */

/** @typedef {import('./specialized-classes.js').ClassRow} ClassRow */

/**
 * @param {HTMLElement | null} el
 * @param {string} text
 */
function setText(el, text) {
  if (!el) return;
  el.textContent = text;
  el.hidden = !text;
}

/**
 * @param {Element} root - the card (`[data-class-tabs]`)
 * @param {ClassRow[]} rows
 * @returns {string[]} the ids still listed, in order
 */
export function applySpecializedClasses(root, rows) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  /** @type {string[]} */
  const listed = [];
  root.querySelectorAll('[data-class-tab]').forEach((tabEl) => {
    const tab = /** @type {HTMLElement} */ (tabEl);
    const id = tab.dataset.classTab ?? '';
    const row = byId.get(id);
    tab.hidden = !row;
    if (!row) return;
    listed.push(id);
    setText(tab.querySelector('[data-class-days]'), row.days);
    const panel = [...root.querySelectorAll('[data-class-panel]')]
      .find((p) => /** @type {HTMLElement} */ (p).dataset.classPanel === id);
    if (!panel) return;
    setText(panel.querySelector('[data-class-body]'), row.body);
    setText(panel.querySelector('[data-class-who]'), row.who);
    const whoRow = /** @type {HTMLElement | null} */ (panel.querySelector('[data-class-who-row]'));
    if (whoRow) whoRow.hidden = !row.who;
    const when = panel.querySelector('[data-class-when]');
    if (when) {
      // Not replaceChildren: the browser floor (Safari 13.1) predates it.
      while (when.firstChild) when.removeChild(when.firstChild);
      row.when.forEach((line) => {
        const span = when.ownerDocument.createElement('span');
        span.className = 'ct-when-line';
        span.textContent = line;
        when.appendChild(span);
      });
    }
  });
  return listed;
}
