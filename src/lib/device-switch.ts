/**
 * Single source of truth for the desktop ⇄ mobile-app (`/m/`) device switch.
 *
 * Decision signal: **available space**, not the user-agent form factor.
 * We compare the SMALLER of the two viewport dimensions
 * (`Math.min(innerWidth, innerHeight)`, in CSS px) against one breakpoint —
 * Android's canonical `sw600dp` "smallest width" tablet threshold. This is
 * orientation-independent: a phone has a small shorter-dimension in BOTH
 * portrait and landscape, while a tablet / unfolded foldable does not.
 *
 * Why not sniff the UA: `Mobile` in the UA string lies on foldables. An
 * unfolded Galaxy Z Fold keeps `…Mobile…` in its UA even though its inner
 * screen is tablet-sized, which used to trap it on the phone UI and force the
 * user to flip on Chrome's "Desktop site". Measuring real space fixes that and
 * needs no manual toggle — folding/unfolding re-runs the check on `resize`.
 *
 * A `(pointer: coarse)` capability query (NOT UA sniffing) keeps a landscape
 * phone on the mobile UI while never misclassifying a short desktop window.
 *
 * Crawlers are always kept on the SEO-rich desktop pages (never sent to `/m/`).
 */

/** Shorter-viewport-dimension px at/below which a touch device shows the mobile app UI. */
export const MOBILE_MAX_PX = 599;

// Shared helpers, inlined into both directions of the switch so the decision is
// computed identically on the desktop pages and on `/m/`.
const SHARED = `
  function isBot(){return /bot|crawl|spider|slurp|bingpreview|googlebot|google-inspectiontool|duckduckbot|baiduspider|yandex|facebookexternalhit|facebot|embedly|quora|whatsapp|telegrambot|twitterbot|linkedinbot|pinterest|applebot|petalbot|semrush|ahrefs|lighthouse|headlesschrome/i.test(navigator.userAgent);}
  function prefersMobileUI(){try{
    if(isBot())return false;
    var w=window.innerWidth,h=window.innerHeight;
    if(w<=${MOBILE_MAX_PX})return true;
    var coarse=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
    return coarse&&Math.min(w,h)<=${MOBILE_MAX_PX};
  }catch(e){return false;}}
`;

/**
 * Returns the `<script is:inline>` body (as a string) for one direction of the
 * switch.
 * - `to:'mobile'` (desktop pages): redirect to `target` when the device prefers the app UI.
 * - `to:'desktop'` (`/m/`): redirect to `target` when the device does NOT prefer the app UI.
 */
export function deviceSwitchScript(opts: { to: 'mobile' | 'desktop'; target: string }): string {
  const cond = opts.to === 'mobile' ? 'prefersMobileUI()' : '!prefersMobileUI()';
  const target = JSON.stringify(opts.target);
  return `(function(){${SHARED}
    function go(){if(${cond})location.replace(${target});}
    go();
    var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(go,250);});
  })();`;
}
