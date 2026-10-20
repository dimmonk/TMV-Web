/**
 * Specialized-classes list/detail card — one discipline visible at a time.
 *
 * Every panel is SERVER-RENDERED; this only swaps which one is shown, so the
 * first discipline reads with JS off and every class is in the HTML for search.
 * Scoped to each root so the desktop composition and the phone composition can
 * both be on the page without fighting.
 *
 * The tabs come from the Members schedule as it stood at the build; on mount
 * the schedule is read again and the card is brought up to date in place
 * (apply-specialized-classes.js): a class with no sessions left is hidden, and
 * the selection moves to the first class still listed.
 *
 * Video handling is deliberately NOT mountCardVideos: those clips live inside
 * hidden panels, so an IntersectionObserver never fires for them and a freshly
 * revealed panel would paint an empty box. Here the ACTIVE panel's clip is
 * played directly on switch and the others are paused, which is both correct
 * and cheaper — only one clip is ever downloading.
 */
import { specializedView } from './specialized-classes.js';
import { applySpecializedClasses } from './apply-specialized-classes.js';

export function mountClassTabs(selector = '[data-class-tabs]'): void {
  document.querySelectorAll<HTMLElement>(selector).forEach(mountOne);
}

function mountOne(root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-class-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-class-panel]'));
  if (!tabs.length || !panels.length) return;

  const detail = root.querySelector<HTMLElement>('[data-class-detail]');
  /** Stacked layout = the detail pane sits UNDER the list, so a tap that only
   *  swaps it can look like nothing happened. Side-by-side needs no scroll. */
  const isStacked = (): boolean =>
    !!detail && detail.getBoundingClientRect().top > root.getBoundingClientRect().top + 4;

  const show = (id: string, focusTab = false, scrollDetail = false): void => {
    tabs.forEach((t) => {
      const on = t.dataset.classTab === id;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focusTab) {
        t.focus();
        t.scrollIntoView({ block: 'nearest' });
      }
    });
    panels.forEach((p) => {
      const on = p.dataset.classPanel === id;
      p.hidden = !on;
      const v = p.querySelector('video');
      if (!v) return;
      if (on) playClip(v);
      else v.pause();
    });
    if (scrollDetail && detail && isStacked()) {
      detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => show(tab.dataset.classTab!, false, true));
    // The list is a vertical column, so Up/Down are the natural keys (Left/
    // Right still work — a roving tablist is expected to accept both). Moves
    // among the classes still listed.
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const listed = tabs.filter((t) => !t.hidden);
      const at = listed.indexOf(tab);
      show(listed[(at + dir + listed.length) % listed.length].dataset.classTab!, true);
    });
  });

  // Start the clip that is already showing.
  const open = panels.find((p) => !p.hidden)?.querySelector('video');
  if (open) playClip(open);

  void refresh(root, show);
}

/** Re-read the schedule and bring the card up to date; a failed read keeps what was built. */
async function refresh(root: HTMLElement, show: (id: string) => void): Promise<void> {
  try {
    const { fetchPublicSchedule } = await import('./public-projections.js');
    const listed = applySpecializedClasses(root, specializedView(await fetchPublicSchedule()));
    root.hidden = listed.length === 0;
    const selected = root.querySelector<HTMLElement>('[data-class-tab].on');
    if (listed.length && (!selected || selected.hidden)) show(listed[0]);
  } catch (e) {
    console.warn('[class-tabs] could not refresh the classes from the schedule; keeping what was built:', (e as Error).message);
  }
}

/** Same contract as lib/card-video: re-assert muted, fall back to frame one. */
function playClip(v: HTMLVideoElement): void {
  v.muted = true;
  v.play().catch((err: unknown) => {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    if (v.preload === 'metadata') return;
    v.preload = 'metadata';
    v.load();
  });
}
