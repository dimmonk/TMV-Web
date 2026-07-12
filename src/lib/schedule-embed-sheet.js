/**
 * Embed-side controller for the new sheet design.
 *
 * Wraps the print sheet renderer (print-schedule-sheet.js ; same code that
 * generates the printed PDFs) and adds embed-only behavior:
 *  - Filter pills (All / Kids / Teens / Adults)
 *  - Mobile view with day tabs + per-day class list (sub-768px viewports)
 *  - Click-to-open popup with full class details
 *  - postMessage height reporting so the parent iframe can auto-size
 *
 * The desktop sheet itself is rendered by print-schedule-sheet.js ; this
 * module never re-implements that layout; it only adds the chrome around
 * it. The print PDFs and the embed share one source of truth.
 */

import { renderPrintSheet, ageKeyOf, matchesFilter, fmtClassTimeRange } from './print-schedule-sheet.js';
import { contrastText } from './color-utils.js';

const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const VALID_FILTERS = ['all', 'kids', 'teens', 'adults', 'athletic', 'open-gym'];
const VALID_VARIANTS = ['color', 'editorial', 'bw'];

// Public schedule endpoint — same URL used internally by renderPrintSheet.
// Pre-fetched here so initEmbed can read `scheduleDisplay` before first
// paint to apply the admin's saved variant/filter defaults.
const SCHEDULE_API_URL = 'https://us-central1-tmv-management.cloudfunctions.net/getPublicSchedule';

// Filter / age-key helpers are imported from print-schedule-sheet.js so the
// desktop sheet and the mobile day-list view always share one source of
// truth. Adding a new filter or age-routing rule lives in ONE place.

// Embed-side time formatter — long suffix ("11am"), em-dash separator
// (" – "). Minute-handling lives in the shared `fmtClassTimeRange` so
// the desktop sheet (short suffix), the mobile list, and the popup all
// pick up new format rules from one place.
const fmtRange = (s, e) => fmtClassTimeRange(s, e, { suffix: 'long', sep: ' – ' });

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  if (opts.style) for (const [k, v] of Object.entries(opts.style)) {
    if (k.startsWith('--')) node.style.setProperty(k, v);
    else node.style[k] = v;
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

// ── Open Gym synthetic entries (mobile only ; desktop sheet uses its
//    own dedicated buildOpenGymBody renderer in print-schedule-sheet.js) ──

function buildOpenGymMobileEntries() {
  // One entry per day showing the daily window. Friday adds a second
  // entry for the 10pm-12am adults-only block. Colors match the desktop
  // sheet's Open Gym cards: --color-opengym (#4caf50) for the daily
  // block, a darker shade (#2e7d32) for Friday's adults-only late slot.
  const entries = [];
  for (const d of DAY_ORDER) {
    entries.push({
      day: d, time: '11', endTime: '22',
      disciplineName: 'Open Gym',
      ageGroupName: 'All Ages',
      color: '#4caf50',
      accessCategories: ['open-gym'],
    });
    if (d === 5) {
      entries.push({
        day: d, time: '22', endTime: '24',
        disciplineName: 'Open Gym',
        ageGroupName: 'Adults Only',
        color: '#2e7d32',
        accessCategories: ['open-gym'],
      });
    }
  }
  return entries;
}

// ── Mobile list view ──────────────────────────────────────────────────────

function buildMobileList(root, filtered, variant, onClick) {
  // Group by day in DAY_ORDER (Mon..Sun), then by hour, sorted ascending.
  const byDay = {};
  DAY_ORDER.forEach(d => { byDay[d] = {}; });
  filtered.forEach(c => {
    const h = parseInt(c.time, 10);
    if (!byDay[c.day]) return;
    if (!byDay[c.day][h]) byDay[c.day][h] = [];
    byDay[c.day][h].push(c);
  });
  // Stable order within an hour bucket: 11:00 sorts above 11:30, etc.
  // Matches the desktop sheet's computeRows sort. Numeric (not
  // localeCompare) so unpadded legacy times like "9:30" still order.
  const timeKey = (t) => {
    const [hStr, mStr] = String(t || '').split(':');
    return (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr || '0', 10) || 0);
  };
  Object.values(byDay).forEach(hours => {
    Object.values(hours).forEach(arr => {
      arr.sort((a, b) => timeKey(a.time) - timeKey(b.time));
    });
  });

  root.innerHTML = '';

  DAY_ORDER.forEach(d => {
    const hours = Object.keys(byDay[d]).map(Number).sort((a, b) => a - b);
    if (hours.length === 0) return;

    const section = el('section', { className: 'm-day' });
    section.appendChild(el('h3', { className: 'm-day-name', text: DAY_LONG[d] }));

    hours.forEach(h => {
      byDay[d][h].forEach(c => {
        const card = buildMobileCard(c, variant, onClick);
        section.appendChild(card);
      });
    });

    root.appendChild(section);
  });

  if (root.children.length === 0) {
    root.appendChild(el('p', {
      className: 'm-empty',
      text: 'No classes match this filter.',
    }));
  }
}

function buildMobileCard(c, variant, onClick) {
  const ak = ageKeyOf(c.ageGroupName);
  const cls = ['m-card', 'm-age-' + ak, 'm-v-' + variant];
  if (c.isCancelled) cls.push('m-cancelled');

  // Same color routing as the sheet:
  //   color edition  → solid fill, auto-contrast text
  //   editorial / bw → no fill, left rule in discipline color (color) or ink (bw)
  const style = { '--c': c.color };
  if (variant === 'color') {
    style.background = c.color;
    style.color = c.textColor || contrastText(c.color);
  }

  const tags = [];
  if (c.isNew && !c.isCancelled) tags.push(el('span', { className: 'm-tag m-tag-new', text: 'NEW' }));
  if (c.isCancelled) tags.push(el('span', { className: 'm-tag m-tag-end', text: 'ENDING' }));

  const card = el('button', { className: cls.join(' '), style, attrs: { type: 'button' } }, [
    ...tags,
    el('div', { className: 'm-name', text: c.disciplineName || '' }),
    el('div', { className: 'm-meta' }, [
      el('span', { className: 'm-time', text: fmtRange(c.time, c.endTime) }),
      el('span', { className: 'm-dot', text: '·' }),
      el('span', { className: 'm-age', text: c.ageGroupName || '' }),
    ]),
  ]);

  if (onClick) card.addEventListener('click', () => onClick(c));
  return card;
}

// Tiny markdown renderer for class descriptions in the popup. Safe-by-
// construction: escapes the input first (so any user-typed HTML becomes
// plain text), then re-introduces a small whitelisted set of tags for
// the markdown features we explicitly support.
//
// Supported syntax:
//   **bold**          → <strong>
//   *italic* / _ital_ → <em>
//   `code`            → <code>
//   [text](https…)    → <a href> (only http/https URLs accepted)
//   - item / * item   → <ul><li> (consecutive lines group into one list)
//   blank line        → paragraph break
//   single newline    → <br>
function renderMarkdown(text) {
  if (!text) return '';
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const inline = (s) => s
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)(?<!\s)\*(?=$|[^*\w])/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_(?!\s)([^_\n]+?)(?<!\s)_(?=$|[^_\w])/g, '$1<em>$2</em>')
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = escaped.split('\n');
  const out = [];
  let inList = false;
  let blankRun = 0;

  function closeList() {
    if (inList) { out.push('</ul>'); inList = false; }
  }

  for (const raw of lines) {
    const listMatch = raw.match(/^\s*[-*]\s+(.+)$/);
    if (listMatch) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push('<li>' + inline(listMatch[1]) + '</li>');
      blankRun = 0;
      continue;
    }
    if (raw.trim() === '') {
      closeList();
      blankRun++;
      // collapse runs of blank lines into a single paragraph break
      if (blankRun === 1) out.push('<br><br>');
      continue;
    }
    closeList();
    if (out.length && !out[out.length - 1].endsWith('<br>') && !out[out.length - 1].endsWith('<br><br>') && !out[out.length - 1].endsWith('</ul>')) {
      out.push('<br>');
    }
    out.push(inline(raw));
    blankRun = 0;
  }
  closeList();
  return out.join('');
}

// ── Popup modal ───────────────────────────────────────────────────────────

function setupPopup() {
  const overlay = document.getElementById('embed-popup-overlay');
  const modal = document.getElementById('embed-popup');
  if (!overlay || !modal) return null;

  const titleEl = modal.querySelector('.popup-title');
  const timeEl = modal.querySelector('.popup-time');
  const ageEl = modal.querySelector('.popup-age');
  const descWrap = modal.querySelector('.popup-desc-wrap');
  const descEl = modal.querySelector('.popup-desc');
  const closeBtn = modal.querySelector('.popup-close');
  const stripe = modal.querySelector('.popup-stripe');

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function open(c) {
    titleEl.textContent = c.disciplineName || '';
    timeEl.textContent = fmtRange(c.time, c.endTime);
    ageEl.textContent = c.ageGroupName || '';
    if (c.description) {
      // Markdown-rendered (escaped + safe). Lets descriptions carry
      // **bold**, *italic*, `code`, [links](url), and - bullet lists,
      // plus paragraph breaks via blank lines.
      descEl.innerHTML = renderMarkdown(c.description);
      descWrap.style.display = '';
    } else {
      descWrap.style.display = 'none';
    }
    if (stripe) stripe.style.background = c.color || '#14110f';
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  return { open, close };
}

// ── Height reporting (parent iframe auto-resize) ──────────────────────────

function setupAutoResize() {
  // Use body.getBoundingClientRect().height (sub-pixel float of the
  // actually-rendered body height) + Math.ceil. Two reasons:
  //   1. body's rendered height equals its content height — it does
  //      NOT grow when the parent iframe resizes. documentElement
  //      .scrollHeight, by contrast, often tracks the iframe viewport
  //      height, which created an infinite-growth loop: parent sets
  //      iframe=H → html.scrollHeight=H → next report=H+buffer → loop.
  //   2. getBoundingClientRect returns sub-pixel float, so Math.ceil
  //      always rounds UP — no phantom scrollbar from a 1px shortfall,
  //      and no +N buffer that compounds across feedback cycles.
  let last = 0;
  function report() {
    const h = Math.ceil(document.body.getBoundingClientRect().height);
    if (h === last) return;
    last = h;
    try { parent.postMessage({ tmvScheduleEmbedHeight: h }, '*'); } catch {}
  }

  window.addEventListener('load', report);
  window.addEventListener('resize', report);
  if ('ResizeObserver' in window) {
    new ResizeObserver(report).observe(document.body);
  }
  // Initial fire after first render frame, plus one more after the next
  // frame so the schedule sheet's container-query layout has fully
  // settled before we measure.
  requestAnimationFrame(() => {
    report();
    requestAnimationFrame(report);
  });
}

// ── Public init ───────────────────────────────────────────────────────────

export async function initEmbed(opts = {}) {
  const params = new URLSearchParams(window.location.search);
  const urlVariant = params.get('variant');
  const urlFilter = params.get('filter');

  const desktopRoot = document.getElementById('embed-desktop-root');
  const mobileRoot = document.getElementById('embed-mobile-root');
  const filterButtons = document.querySelectorAll('.embed-filter');

  // Pre-fetch the schedule so we can read scheduleDisplay (the admin's
  // saved variant/filter defaults) before deciding which filter pill is
  // active on first paint. URL params still win for ad-hoc previews;
  // saved defaults win over hard-coded fallbacks. Mirrors the price
  // list embed behavior on priceListDisplay.
  let cachedSchedule = null;
  let savedVariant = opts.variant || 'color';
  let savedFilter = opts.filter || 'all';
  try {
    const res = await fetch(SCHEDULE_API_URL);
    if (res.ok) {
      const json = await res.json();
      if (json?.success && json.data) {
        cachedSchedule = json.data;
        const d = cachedSchedule.scheduleDisplay || {};
        if (VALID_VARIANTS.includes(d.variant)) savedVariant = d.variant;
        if (VALID_FILTERS.includes(d.filter)) savedFilter = d.filter;
      }
    }
  } catch (err) {
    // Non-fatal: renderPrintSheet below will surface a load error if
    // the API is truly unreachable. Falling back to defaults here lets
    // the embed try to render with what URL params it has.
    console.error('[embed] pre-fetch failed', err);
  }

  const variant = VALID_VARIANTS.includes(urlVariant) ? urlVariant : savedVariant;
  const initialFilter = VALID_FILTERS.includes(urlFilter) ? urlFilter : savedFilter;

  const popup = setupPopup();
  const onClassClick = popup ? c => popup.open(c) : null;

  async function renderAll(filter) {
    if (desktopRoot) {
      try {
        const result = await renderPrintSheet(desktopRoot, {
          variant,
          filter,
          schedule: cachedSchedule || undefined,
          onClassClick,
        });
        if (!cachedSchedule && result) cachedSchedule = result;
      } catch (err) {
        console.error('[embed] desktop render failed', err);
        desktopRoot.innerHTML = '<div class="embed-error">Unable to load schedule. Please refresh.</div>';
      }
    }

    if (mobileRoot && cachedSchedule) {
      // Open Gym is synthesized client-side ; it isn't in the schedule
      // data feed (it's the gym's operating hours, not classes).
      const filtered = filter === 'open-gym'
        ? buildOpenGymMobileEntries()
        : (cachedSchedule.classes || []).filter(c => matchesFilter(c, filter));
      // Open-gym popup wouldn't add anything (no description, no
      // discipline detail) ; render plain non-clickable cards.
      const mobileClick = filter === 'open-gym' ? null : onClassClick;
      buildMobileList(mobileRoot, filtered, variant, mobileClick);
    }
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAll(btn.dataset.filter);
    });
    btn.classList.toggle('active', btn.dataset.filter === initialFilter);
  });

  await renderAll(initialFilter);
  setupAutoResize();
}
