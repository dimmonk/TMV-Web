/**
 * Single source of truth for the desktop ⇄ mobile-app (`/m/`) device switch.
 *
 * Decision signal: **available space**, not the user-agent form factor.
 * A phone has a small shorter-dimension in BOTH orientations; a tablet /
 * unfolded foldable / desktop does not. We compare that shorter dimension
 * against Android's canonical `sw600dp` tablet threshold.
 *
 * Why not sniff the UA: `Mobile` in the UA string lies on foldables. An
 * unfolded Galaxy Z Fold keeps `…Mobile…` in its UA even though its inner
 * screen is tablet-sized, which used to trap it on the phone UI. Measuring real
 * space fixes that with no manual toggle — folding/unfolding re-runs the check
 * on `resize`.
 *
 * ── Two properties that keep this from oscillating (the "keeps reloading" bug) ──
 *
 * 1. STABLE inputs. The size signal must be measured identically on the desktop
 *    pages and on `/m/`, or the two will disagree and redirect at each other
 *    forever. `innerHeight` is NOT stable — the mobile address bar hiding on
 *    scroll and mid-fold transitions change it — so the old `Math.min(w,h)`
 *    check flipped across the threshold between the two page loads. We use
 *    `innerWidth` (stable; unaffected by the address bar) and, for touch
 *    devices, the physical `screen` shorter side (stable regardless of chrome)
 *    instead of `innerHeight`.
 *
 * 2. HYSTERESIS. The two directions are deliberately NOT exact complements.
 *    Desktop→mobile fires at/below MOBILE_MAX_PX; mobile→desktop fires at/above
 *    DESKTOP_MIN_PX; the band between is a dead zone where whichever UI you are
 *    on stays put. To loop you would need the metric to be simultaneously
 *    ≤ MOBILE_MAX_PX and ≥ DESKTOP_MIN_PX — impossible — so any residual jitter
 *    (DPR rounding, a transient mid-fold size) can no longer bounce the page.
 *
 * A `(pointer: coarse)` capability query (NOT UA sniffing) distinguishes touch
 * devices from a merely-narrow desktop window. Crawlers are always kept on the
 * SEO-rich desktop pages (never sent to `/m/`).
 */

/** Shorter-side px at/below which a device shows the mobile app UI. */
export const MOBILE_MAX_PX = 599;
/** Shorter-side px at/above which a device shows the full desktop site.
 *  The gap MOBILE_MAX_PX..DESKTOP_MIN_PX is the hysteresis dead-band. */
export const DESKTOP_MIN_PX = 640;

// Shared helpers, inlined into both directions of the switch so the decision is
// computed identically on the desktop pages and on `/m/`.
const SHARED = `
  function isBot(){return /bot|crawl|spider|slurp|bingpreview|googlebot|google-inspectiontool|duckduckbot|baiduspider|yandex|facebookexternalhit|facebot|embedly|quora|whatsapp|telegrambot|twitterbot|linkedinbot|pinterest|applebot|petalbot|semrush|ahrefs|lighthouse|headlesschrome/i.test(navigator.userAgent);}
  // Orientation-independent, chrome-independent size in CSS px. Deliberately
  // avoids innerHeight (address bar / fold transitions make it jitter); uses the
  // stable physical screen shorter side for touch devices, and the window width
  // (also stable; scrollbar-inclusive so it matches on scrolling and app pages)
  // clamped by it so a narrow split-screen window on a tablet still reads small.
  function switchMetric(){
    var w=window.innerWidth;
    var coarse=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
    if(!coarse)return w;
    var sw=(window.screen&&screen.width)||w;
    var sh=(window.screen&&screen.height)||w;
    return Math.min(w,sw,sh);
  }
  function prefersMobileUI(){try{return !isBot()&&switchMetric()<=${MOBILE_MAX_PX};}catch(e){return false;}}
  function prefersDesktopUI(){try{return isBot()||switchMetric()>=${DESKTOP_MIN_PX};}catch(e){return true;}}
`;

/**
 * Returns the `<script is:inline>` body (as a string) for one direction of the
 * switch.
 * - `to:'mobile'` (desktop pages): redirect to `target` when the device is phone-sized.
 * - `to:'desktop'` (`/m/`): redirect to `target` when the device is tablet-sized or larger.
 *
 * The predicates are separated by the hysteresis dead-band, so a device sitting
 * in that band never redirects and the two pages can never ping-pong.
 */
export function deviceSwitchScript(opts: { to: 'mobile' | 'desktop'; target: string }): string {
  const pred = opts.to === 'mobile' ? 'prefersMobileUI()' : 'prefersDesktopUI()';
  const target = JSON.stringify(opts.target);
  return `(function(){${SHARED}
    function go(){if(${pred})location.replace(${target});}
    go();
    var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(go,250);});
  })();`;
}
