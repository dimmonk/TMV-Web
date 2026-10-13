// @ts-check
/**
 * Cache warmer: what makes a tap instant.
 *
 * The click-to-render delay was the router fetching the target page's HTML on
 * click; HTML is served stale-while-revalidate (see firebase.json hosting:web in
 * TMV-Members), so once a page is in the HTTP cache the router serves it from
 * cache with no network round-trip and the swap is immediate. On idle this
 * fetch()es every on-screen internal link AND the render-blocking /_astro assets
 * it references, so both the HTML and its immutable CSS/JS are cached before the
 * tap, and a stale-served page always has the exact assets it needs (they are
 * immutable, so they never 404 against a newer deploy). Each URL is fetched at
 * most once.
 *
 * A module (not an inline script) so the site's Content-Security-Policy allows
 * no inline script at all. Registered on `astro:page-load`, which fires on the
 * first load and after every client-side navigation.
 */

/** @type {Set<string>} */
const warmedPages = new Set();
/** @type {Set<string>} */
const warmedAssets = new Set();

/** @param {string} u */
function warmAsset(u) {
  if (warmedAssets.has(u)) return;
  warmedAssets.add(u);
  fetch(u, { credentials: 'same-origin' }).catch(() => {});
}

/** @param {string} html */
function warmPageAssets(html) {
  const re = /(?:href|src)="(\/(?:_astro|fonts)\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html))) warmAsset(m[1]);
}

/** @param {() => void} f */
const idle = (f) => (window.requestIdleCallback ? window.requestIdleCallback(f) : window.setTimeout(f, 200));

function warm() {
  warmedPages.add(location.pathname.replace(/\/$/, ''));
  document.querySelectorAll('a[href^="/"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.indexOf('#') !== -1 || /** @type {HTMLAnchorElement} */ (a).target) return;
    const path = href.replace(/\/$/, '');
    if (warmedPages.has(path)) return;
    warmedPages.add(path);
    idle(() => {
      fetch(href, { credentials: 'same-origin' })
        .then((r) => r.text())
        .then(warmPageAssets)
        .catch(() => {});
    });
  });
}

document.addEventListener('astro:page-load', warm);
