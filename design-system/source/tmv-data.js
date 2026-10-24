// tmv-data.js — single access point for live data from the members app (SSOT).
// Both endpoints are public GET, CORS-enabled, cached 60s server-side.
// Website-side we add a short cache so multiple pages/components share one fetch.

const BASE = 'https://us-central1-tmv-management.cloudfunctions.net';
const TTL_MS = 5 * 60 * 1000; // 5 min client cache

const mem = {};

async function fetchCached(fn) {
  // in-memory (per page load)
  if (mem[fn] && mem[fn].t > Date.now() - TTL_MS) return mem[fn].v;
  if (mem[fn + ':p']) return mem[fn + ':p'];

  // sessionStorage (across pages in one visit)
  const sk = 'tmv-data:' + fn;
  try {
    const raw = sessionStorage.getItem(sk);
    if (raw) {
      const c = JSON.parse(raw);
      if (c.t > Date.now() - TTL_MS) {
        mem[fn] = c;
        return c.v;
      }
    }
  } catch (e) {}

  const p = fetch(BASE + '/' + fn)
    .then(r => {
      if (!r.ok) throw new Error(fn + ' HTTP ' + r.status);
      return r.json();
    })
    .then(j => {
      if (!j || !j.success) throw new Error(fn + ' returned success:false');
      const entry = { t: Date.now(), v: j.data };
      mem[fn] = entry;
      try { sessionStorage.setItem(sk, JSON.stringify(entry)); } catch (e) {}
      delete mem[fn + ':p'];
      return j.data;
    })
    .catch(err => { delete mem[fn + ':p']; throw err; });
  mem[fn + ':p'] = p;
  return p;
}

/** Full schedule payload: { classes, disciplines, ageGroups, scheduleDisplay, lastModifiedAt } */
export function getSchedule() { return fetchCached('getPublicSchedule'); }

/** Full price payload: { priceList, priceListAbout, priceListDisplay, lastModifiedAt } */
export function getPriceData() { return fetchCached('getPublicPriceList'); }

/** Flat key -> number map, e.g. prices.openGym1x === 25 */
export async function getPrices() { return (await getPriceData()).priceList; }

/** Format a price number as display string: fmtPrice(25) -> "$25" */
export function fmtPrice(n) {
  if (typeof n !== 'number' || isNaN(n)) return '';
  return '$' + (Number.isInteger(n) ? n : n.toFixed(2));
}

/** "17:00" -> "5:00" (12h, no meridiem) ; meridiem via timeMeridiem() */
export function fmtTime(t) {
  const [h, m] = String(t).split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return h12 + ':' + String(m).padStart(2, '0');
}
export function timeMeridiem(t) {
  return Number(String(t).split(':')[0]) >= 12 ? 'pm' : 'am';
}

/** Readable text color for a schedule class color (schedule palette is SSOT, don't restyle it). */
export function textColorFor(hex, explicit) {
  if (explicit) return explicit;
  const h = String(hex || '').replace('#', '');
  if (h.length < 6) return '#211f1b';
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.58 ? '#211f1b' : '#ffffff';
}
