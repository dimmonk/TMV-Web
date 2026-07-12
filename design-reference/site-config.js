/* ============================================================================
 * The Monkey Vault — live site config loader + applier
 * ----------------------------------------------------------------------------
 * ONE place to manage editable website content (Square links, event promo,
 * hours, social). The website reads this on load; the members app will own it.
 *
 * >>> WHEN THE MEMBERS-APP ENDPOINT IS LIVE: change CONFIG_URL below to the
 *     endpoint URL (e.g. 'https://app.themonkeyvault.com/api/site-config.json').
 *     Nothing else needs to change — the shape is identical to site-config.json.
 * ==========================================================================*/

const CONFIG_URL = './site-config.json';   // <-- repoint to live endpoint later

/* ============================================================================
 * PRICES — single source of truth for every price quoted in page copy.
 * (Pricing.dc.html renders the full live price list from the members app;
 * these are the marketing-copy mentions on other pages.) Change a number
 * HERE, once — every element tagged data-tmv-price / data-tmv-price-sub
 * follows. Can be overridden per-key by a "prices" object in
 * site-config.json (and later the members-app endpoint).
 * ==========================================================================*/
export const PRICES = {
  openGymDay:      '$25',   // open gym day pass
  openGym10x:      '$225',  // open gym 10-visit pack
  membership30:    '$110',  // open gym membership, 30 days
  classMembership30: '$180', // class membership (classes + open gym), 30 days
  private5xKids:   '$250',  // private class pack — 5 kids' lessons (adults $350)
  privateIntro:    '$45',   // one-time intro private
  privateKids:     '$65',   // private lesson, kids / standard
  privateAdults:   '$85',   // private lesson, adults
  campWeekly:      '$350',  // weekly camp, per week
  campDay:         '$90',   // P.A. Day camp / private day camp, per kid
  athleticMonthly: '$150',  // Athletic Program, per month
  athleticGear:    '$275',  // Athletic Program gear/assessment package
  athleticClassAddon: '$5', // Athletic per-class add-on (with a class membership)
  groupClass1x:    '$30',   // group class, single
  groupClass10x:   '$275',  // group class, 10-pack
  stickDropIn:     '$30',   // Stick Fighting drop-in (partner-set rate)
  stickMonthly:    '$100',  // Stick Fighting monthly (partner-set rate)
  partyBase:       '$350',  // full birthday party, base
  partyExtraKid:   '$25',   // per additional kid
  miniPartyKid:    '$30',   // mini party, per kid
  groupFrom:       '$300',  // group events, from
  earlyAccessHr:   '$50',   // early gym access, per hour
};

// Baked-in defaults so every page works during streaming, offline, or if the
// fetch fails. These mirror site-config.json.
const DEFAULTS = {
  squareLinks: {
    booking:     'https://www.themonkeyvault.com/s/appointments',
    store:       'https://www.themonkeyvault.com/s/order',
    waiver:      'https://tmv-members.web.app/waiver',
    giftCard:    'https://squareup.com/gift/4PQGSAK7CK7FB/order',
    invitations: 'https://www.themonkeyvault.com/invitations',
    summerCamp:  'https://www.themonkeyvault.com/product/summer-camps-2026/R2Z7XNZMEXSG6EFR5YQRAFLO',
    paDayCamp:   'https://www.themonkeyvault.com/product/pa-day-camps/7PGIQLBT3X2QUL5I4XL2VMK7',
    athleticMembership: 'https://www.themonkeyvault.com/product/athletic-program-monthly-membership/NXP3HEIUKLFQXQT6JBVXMIDW',
  },
  // Per-item Square checkout URLs for the site's own Store page
  // (Store.dc.html) — one key per item in the Square catalog. Paste each
  // item's Square purchase-workflow URL here; empty = the card falls back
  // to the general online store page.
  storeItems: {
    dayPasses: '',
    openGymMembership: '',
    classPasses: '',
    classMembership: '',
    privateClassPack: '',
  },
  // Per-coach private-booking links for the Private Lessons roster. Each coach's
  // own Square staff calendar URL. Leave bookingUrl empty to fall back to the
  // general booking page. The members app will own these.
  coaches: {
    taigh:  { name: 'Taigh Smullen', role: 'Manager', bookingUrl: '' },
    steven: { name: 'Steven Leblanc', role: 'Manager', bookingUrl: '' },
    nelson: { name: 'Nelson Lin', role: 'Coach', bookingUrl: '' },
  },
  promo: { active: false, headline: '', body: '', ctaLabel: '', ctaUrl: '', expiresAt: '' },
  hours: null,
  social: { instagram: 'https://www.instagram.com/themonkeyvault', youtube: '', facebook: 'https://www.facebook.com/themonkeyvault' },
  flagGifs: false,
  seo: {},
};

// Maps the CURRENT hardcoded href in the pages -> config key. Lets us patch
// every link without tagging them individually.
const LINK_MAP = {
  'https://www.themonkeyvault.com/s/appointments': 'booking',
  'https://www.themonkeyvault.com/s/order': 'store',
  'https://squareup.com/gift/4PQGSAK7CK7FB/order': 'giftCard',
  'https://www.themonkeyvault.com/get-started': 'waiver',
  'https://www.themonkeyvault.com/invitations': 'invitations',
  'https://www.themonkeyvault.com/product/summer-camps-2026/R2Z7XNZMEXSG6EFR5YQRAFLO': 'summerCamp',
  'https://www.themonkeyvault.com/product/pa-day-camps/7PGIQLBT3X2QUL5I4XL2VMK7': 'paDayCamp',
  'https://www.themonkeyvault.com/product/athletic-program-monthly-membership/NXP3HEIUKLFQXQT6JBVXMIDW': 'athleticMembership',
};

let _cache = null;

function deepMerge(base, over) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  if (!over || typeof over !== 'object') return out;
  for (const k of Object.keys(over)) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k]) {
      out[k] = deepMerge(base[k], over[k]);
    } else if (over[k] !== undefined && over[k] !== null && over[k] !== '') {
      out[k] = over[k];
    }
  }
  return out;
}

export async function loadSiteConfig() {
  if (_cache) return _cache;
  _cache = (async () => {
    try {
      const res = await fetch(CONFIG_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('config ' + res.status);
      return deepMerge(DEFAULTS, await res.json());
    } catch (e) {
      console.warn('[site-config] using defaults —', e.message);
      return DEFAULTS;
    }
  })();
  return _cache;
}

function promoIsLive(promo) {
  if (!promo || !promo.active) return false;
  if (promo.expiresAt) {
    const t = Date.parse(promo.expiresAt);
    if (!isNaN(t) && Date.now() > t) return false;
  }
  return true;
}

// Patch every price mention on the page from PRICES (merged with any
// overrides in cfg.prices). Two forms:
//   data-tmv-price="key"     -> element text becomes PRICES[key]
//   data-tmv-price-sub="key" -> first "$NN" in the element's subtree text
//                               is replaced (for composed strings like pills)
//   data-tmv-price-multi="k1,k2" -> successive "$NN" occurrences in the
//                               subtree are replaced by each key in order
//                               (for spec rows quoting two+ prices)
function applyPrices(cfg) {
  const prices = { ...PRICES, ...(cfg && cfg.prices) };
  document.querySelectorAll('[data-tmv-price]').forEach((el) => {
    const v = prices[el.getAttribute('data-tmv-price')];
    if (v) el.textContent = v;
  });
  document.querySelectorAll('[data-tmv-price-sub]').forEach((el) => {
    const v = prices[el.getAttribute('data-tmv-price-sub')];
    if (!v) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (/\$\d[\d.]*/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/\$\d[\d.]*/, v); break; }
    }
  });
  document.querySelectorAll('[data-tmv-price-multi]').forEach((el) => {
    const keys = (el.getAttribute('data-tmv-price-multi') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!keys.length) return;
    let i = 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode()) && i < keys.length) {
      n.nodeValue = n.nodeValue.replace(/\$\d[\d.]*/g, (m) => {
        const v = prices[keys[i]];
        i += 1;
        return v || m;
      });
    }
  });
}

// Patch every Square link on the page to its configured URL.
function applyLinks(cfg) {
  document.querySelectorAll('a[href]').forEach((a) => {
    const key = LINK_MAP[a.getAttribute('href')];
    if (key && cfg.squareLinks[key]) a.setAttribute('href', cfg.squareLinks[key]);
  });
}

// Wire social icons (matched by their bootstrap-icon class, since the markup
// uses placeholder href="#"). Only sets when a URL is configured.
function applySocial(cfg) {
  const pairs = [['bi-instagram', 'instagram'], ['bi-youtube', 'youtube'], ['bi-facebook', 'facebook']];
  document.querySelectorAll('a').forEach((a) => {
    for (const [icon, key] of pairs) {
      if (a.querySelector('.' + icon) && cfg.social[key]) {
        a.setAttribute('href', cfg.social[key]);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
    }
  });
}

// Inject a dismissible promo bar directly under the page header.
function applyPromo(cfg) {
  if (document.getElementById('tmv-promo-bar')) return;
  if (!promoIsLive(cfg.promo)) return;
  const header = document.querySelector('header');
  if (!header) return;
  const p = cfg.promo;
  const brand = getComputedStyle(document.body).getPropertyValue('--brand').trim() || '#ffd400';

  const bar = document.createElement('div');
  bar.id = 'tmv-promo-bar';
  bar.style.cssText = 'position:relative; z-index:45; background:' + brand + '; color:#211f1b;';
  const cta = p.ctaUrl
    ? '<a href="' + p.ctaUrl + '" target="_blank" rel="noopener" style="flex:none; display:inline-flex; align-items:center; gap:7px; background:#211f1b; color:#fff; font:800 12px/1 \'Archivo\',sans-serif; text-transform:uppercase; letter-spacing:.04em; text-decoration:none; padding:9px 15px; border-radius:8px;">' + (p.ctaLabel || 'Learn more') + ' <i class="bi bi-arrow-right"></i></a>'
    : '';
  bar.innerHTML =
    '<div style="max-width:1200px; margin:0 auto; padding:11px 24px; display:flex; align-items:center; gap:16px;">' +
      '<i class="bi bi-stars" style="font-size:16px; flex:none;"></i>' +
      '<div style="flex:1; min-width:0; display:flex; align-items:baseline; gap:10px; flex-wrap:wrap;">' +
        '<span style="font:800 13.5px/1.2 \'Archivo\',sans-serif; letter-spacing:-.005em;">' + (p.headline || '') + '</span>' +
        (p.body ? '<span style="font:600 12.5px/1.3 -apple-system,system-ui,sans-serif; color:rgba(33,31,27,.72);">' + p.body + '</span>' : '') +
      '</div>' +
      cta +
      '<button aria-label="Dismiss" style="flex:none; background:transparent; border:0; cursor:pointer; color:#211f1b; font-size:18px; line-height:1; padding:4px; opacity:.7;"><i class="bi bi-x-lg"></i></button>' +
    '</div>';
  header.insertAdjacentElement('afterend', bar);
  bar.querySelector('button').addEventListener('click', () => bar.remove());
}

// Set the document <title> and meta description for SEO, per page key.
// Pass the page key (e.g. 'home', 'getStarted') matching cfg.seo.
function applySeo(cfg, page) {
  if (!page || !cfg.seo || !cfg.seo[page]) return;
  const s = cfg.seo[page];
  if (s.title) document.title = s.title;
  if (s.description) {
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
    m.setAttribute('content', s.description);
  }
}

// PERFORMANCE / MEDIA TODO (audit finding 05 — on standby):
// Square forced us to use animated GIFs. We can serve real video now, so this
// flags every <img src="*.gif"> on the page with a small corner marker + a
// console list, so each spot that should become an MP4/WebM loop is easy to
// find. Turn off by setting "flagGifs": false in site-config.json once swapped.
function markGifs(cfg) {
  if (cfg.flagGifs === false) return;
  const gifs = [...document.querySelectorAll('img')].filter(img => /\.gif(\?|$)/i.test(img.getAttribute('src') || ''));
  if (!gifs.length) return;
  const srcs = new Set();
  gifs.forEach((img) => {
    srcs.add(img.getAttribute('src'));
    const host = img.parentElement;
    if (!host) return;
    if (host.querySelector(':scope > [data-gif-flag]')) return;
    const cs = getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    const tag = document.createElement('div');
    tag.setAttribute('data-gif-flag', '1');
    tag.title = 'This GIF should be replaced with an optimized MP4/WebM video (we can do that now). Set flagGifs:false in site-config.json to hide these markers.';
    tag.style.cssText = 'position:absolute; bottom:8px; left:8px; z-index:6; display:inline-flex; align-items:center; gap:5px; background:rgba(28,25,23,.82); color:#ffd400; font:800 9px/1 Archivo,system-ui,sans-serif; letter-spacing:.06em; text-transform:uppercase; padding:5px 8px; border-radius:7px; pointer-events:auto; backdrop-filter:blur(3px);';
    tag.innerHTML = '<span style="font-size:11px;">\u26A0</span> Replace with video';
    host.appendChild(tag);
  });
  console.warn('[site-config] ' + gifs.length + ' GIF(s) flagged to replace with video:', [...srcs]);
}

/* Call once from a page's componentDidMount. Patches links/social/promo/seo.
   Pass { page } to set the SEO title + description for that page. */
export async function applySiteConfig(opts = {}) {
  const cfg = await loadSiteConfig();
  try { applyLinks(cfg); } catch (e) { console.warn(e); }
  try {
    applyPrices(cfg);
    // components (pills, cards) can mount after us — re-patch briefly
    [600, 1600, 3200].forEach((ms) => setTimeout(() => { try { applyPrices(cfg); } catch (e) {} }, ms));
  } catch (e) { console.warn(e); }
  try { applySocial(cfg); } catch (e) { console.warn(e); }
  try { applyPromo(cfg); } catch (e) { console.warn(e); }
  try { applySeo(cfg, opts.page); } catch (e) { console.warn(e); }
  try { markGifs(cfg); } catch (e) { console.warn(e); }
  return cfg;
}

/* ----------------------------------------------------------------------------
 * Mount a YouTube video into `elId` via the IFrame Player API. Using the API
 * (rather than a bare <iframe src>) sets the embed origin correctly, which
 * avoids the "Error 153 / player configuration" failure some embed contexts
 * hit. Autoplays muted + loops, like a hero background clip, with controls.
 * ------------------------------------------------------------------------- */
export function mountYouTubeHero(elId, videoId) {
  // Size the container to the video's real aspect ratio (falls back to the
  // CSS value already on the box). Avoids hardcoding per-video ratios.
  (async () => {
    try {
      const el = document.getElementById(elId);
      const box = el && el.parentElement;
      if (!box) return;
      const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const j = await r.json();
      if (j.width && j.height) box.style.aspectRatio = j.width + ' / ' + j.height;
    } catch (e) { /* keep CSS fallback */ }
  })();
  const make = () => {
    if (!window.YT || !window.YT.Player) return false;
    const el = document.getElementById(elId);
    if (!el || el.dataset.ytMounted) return true;
    el.dataset.ytMounted = '1';
    new window.YT.Player(el, {
      videoId,
      host: 'https://www.youtube-nocookie.com',
      width: '100%',
      height: '100%',
      playerVars: { autoplay: 1, mute: 1, loop: 1, playlist: videoId, controls: 1, rel: 0, modestbranding: 1, playsinline: 1 },
    });
    return true;
  };
  if (make()) return;
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { if (typeof prev === 'function') { try { prev(); } catch (e) {} } make(); };
  if (!document.getElementById('tmv-yt-api')) {
    const s = document.createElement('script');
    s.id = 'tmv-yt-api';
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
  const t = setInterval(() => { if (make()) clearInterval(t); }, 200);
  setTimeout(() => clearInterval(t), 10000);
}
