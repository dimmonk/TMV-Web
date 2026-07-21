/**
 * Swipeable review carousel — ported verbatim from the /m/ app.
 *
 * Binds every `[data-carousel]` in the document: dot buttons, prev/next arrows
 * and horizontal touch swipe. Scoped per root, so several can coexist.
 */
export function mountReviewCarousels(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-rev-track]');
    if (!track) return;
    const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-rev-dot]'));
    const count = track.children.length;
    let idx = 0;
    const paint = () => {
      track.style.transform = `translateX(${-100 * idx}%)`;
      dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    };
    const go = (i: number) => { idx = Math.max(0, Math.min(count - 1, i)); paint(); };
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    root.querySelector('[data-rev-prev]')?.addEventListener('click', () => go(idx - 1));
    root.querySelector('[data-rev-next]')?.addEventListener('click', () => go(idx + 1));
    const vp = root.querySelector<HTMLElement>('[data-rev-viewport]');
    let touchX = 0;
    vp?.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    vp?.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    paint();
  });
}
