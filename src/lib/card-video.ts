/**
 * On-screen playback for the muted looping clips used as card media — the home
 * flip cards (OfferingCard) and the class tiles (ClassCard). Shared so both
 * surfaces behave identically: a page like Train carries ~11 clips, so they are
 * `preload="none"` and only start downloading once they scroll into view.
 *
 * Why this is more than `play().catch(noop)`: the clip IS the card's picture.
 * A `<video preload="none">` with no poster paints nothing until playback
 * starts, so every reason a browser can refuse autoplay renders as an empty
 * grey box — iOS Low Power Mode, data saver, and, the one that bites on this
 * site, the inline-autoplay grant being lost when a view-transition swap adopts
 * the element out of a parsed document instead of creating it with the page
 * parser (a full reload works, tapping a nav tab doesn't). So: re-assert
 * `muted` on the live element before asking to play — that is what the grant
 * keys off — and if playback is still refused, load metadata so the browser
 * paints the first frame instead of nothing.
 */

/** Observe every video matching `selector`; play while on screen, pause off. */
export function mountCardVideos(selector: string): void {
  const vids = document.querySelectorAll<HTMLVideoElement>(selector);
  if (!vids.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target as HTMLVideoElement;
      if (entry.isIntersecting) playCardVideo(v);
      else v.pause();
    });
  }, { rootMargin: '120px' });
  vids.forEach((v) => io.observe(v));
}

function playCardVideo(v: HTMLVideoElement): void {
  // The element may have just been adopted in by a view-transition swap, which
  // can drop the parser-set muted state — and unmuted means no inline autoplay.
  v.muted = true;
  v.play().catch((err: unknown) => {
    // Our own pause() racing a pending play() — not a refusal, nothing to do.
    if (err instanceof DOMException && err.name === 'AbortError') return;
    showFirstFrame(v);
  });
}

/** Autoplay refused — fetch just enough for the browser to paint frame one. */
function showFirstFrame(v: HTMLVideoElement): void {
  if (v.preload === 'metadata') return;
  v.preload = 'metadata';
  v.load();
}
