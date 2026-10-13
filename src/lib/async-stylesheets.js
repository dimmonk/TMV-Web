// @ts-check
/**
 * Stylesheets loaded without blocking first paint: `<link rel="stylesheet"
 * media="print" data-async-css>` downloads in the background and is switched to
 * `media="all"` once it has loaded (the Google Fonts sheet; see BaseLayout).
 *
 * This used to be an inline `onload="this.media='all'"` handler. An inline
 * handler needs `'unsafe-inline'` (or `'unsafe-hashes'`, which the Safari 13.1
 * floor does not understand) in the Content-Security-Policy, so it lives here
 * and the policy allows no inline script at all. A module runs after parsing, so
 * a sheet that already finished loading is switched at once and one still on
 * its way is switched when it lands.
 */
document.querySelectorAll('link[data-async-css]').forEach((node) => {
  const link = /** @type {HTMLLinkElement} */ (node);
  const show = () => { link.media = 'all'; };
  if (link.sheet) show();
  else link.addEventListener('load', show, { once: true });
});
