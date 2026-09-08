/**
 * Specialized-classes tab card — one discipline visible at a time.
 *
 * Every panel is SERVER-RENDERED; this only swaps which one is shown, so the
 * first discipline reads with JS off and all eleven are in the HTML for search.
 * Scoped to each root so the desktop composition and the phone composition can
 * both be on the page without fighting.
 *
 * Video handling is deliberately NOT mountCardVideos: those clips live inside
 * hidden panels, so an IntersectionObserver never fires for them and a freshly
 * revealed panel would paint an empty box. Here the ACTIVE panel's clip is
 * played directly on switch and the others are paused, which is both correct
 * and cheaper — only one clip is ever downloading.
 */
export function mountClassTabs(selector = '[data-class-tabs]'): void {
  document.querySelectorAll<HTMLElement>(selector).forEach(mountOne);
}

function mountOne(root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-class-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-class-panel]'));
  if (!tabs.length || !panels.length) return;

  const show = (id: string, focusTab = false): void => {
    tabs.forEach((t) => {
      const on = t.dataset.classTab === id;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focusTab) {
        t.focus();
        // Keep the active tab in view in the horizontal strip on a phone.
        t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(tab.dataset.classTab!));
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      show(tabs[(i + dir + tabs.length) % tabs.length].dataset.classTab!, true);
    });
  });

  // Start the clip that is already showing.
  const open = panels.find((p) => !p.hidden)?.querySelector('video');
  if (open) playClip(open);
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
