/**
 * Print Schedule Sheet renderer (vanilla JS, port of design_handoff_print_schedule/schedule-sheet.jsx).
 *
 * Pure presentational module for the new typographic print sheet design.
 * Reads from the public Cloud Function `getPublicSchedule` (same contract
 * as the legacy renderer that was deleted in May 2026 once this design hit parity).
 *
 * Three editions: color | editorial | bw
 * Filters: all | kids | teens | adults | athletic (program-based, cross-cuts age)
 *
 * Sheet uses CSS container queries (cqh/cqi). The .sheet element MUST be
 * sized in pixels (width/height) by the caller for cqh/cqi to compute.
 */

import { contrastText } from './color-utils.js';

const DEFAULT_API_URL = 'https://us-central1-tmv-management.cloudfunctions.net/getPublicSchedule';

const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun

// Gym operating hours ; anchor for the body grid's vertical extent.
// Every filter view spans AT LEAST these hours, so sparse filters
// (Athletic with 3-4 hours of class) share the same morning-to-evening
// shape as dense ones (All Classes). Hours with no matching classes
// compress to 0.22fr empty rows; populated rows stay at reasonable
// card heights instead of ballooning to fill the body.
// Classes scheduled outside this range still extend the grid ; the
// anchor is a floor / ceiling, not a hard clamp.
const GYM_OPEN_HOUR = 11;   // 11am ; first time-c row label
const GYM_LAST_HOUR = 21;   // 9pm ; last possible class start (gym closes 10pm)

// Note: an earlier port had a `SHORT_AGE` map keyed off ageKey for the
// compact-layout label. That map intentionally normalized non-standard
// names (e.g. "Women's Only") to a generic bucket like "ADULTS" ; but
// in this app the ageGroupName carries meaningful information (Women's
// Only, Mixed, etc.) that must be preserved in print. We always render
// `c.ageGroupName.toUpperCase()` in display; ageKey is used only for
// filter routing and grayscale tinting.

const HEADLINES = {
  all:        { h: 'All Classes',           s: 'Parent & Child · Kids · Teens · Adults' },
  kids:       { h: 'Parent & Child · Kids', s: 'Parent & Child (ages 3-6) · Kids (ages 7-12)' },
  teens:      { h: 'Teens',                 s: 'Ages 13-17 · includes Teens & Adults classes' },
  adults:     { h: 'Adults',                s: 'Ages 18+ · includes Teens & Adults classes' },
  athletic:   { h: 'Athletic Program',      s: 'Strength, speed, and agility training for any sport · Ages 9-14 and 15+' },
  'open-gym': { h: 'Open Gym',              s: 'Daily 11am - 10pm · Friday late session 10pm - 12am (Adults Only)' },
};

// Open Gym hours per day-of-week (0=Sun ... 6=Sat). `close` is exclusive
// (the block visually extends UP TO that hour, so close=22 means the
// block ends at the start of 10pm). Friday extends a second "adults only"
// block from 10pm to midnight.
const OPEN_GYM_DAILY = { open: 11, close: 22 };
const OPEN_GYM_FRIDAY_LATE = { open: 22, close: 24, label: 'Adults Only' };

// ─────────────────────── Pure helpers ───────────────────────

export function ageKeyOf(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('parent') || n.includes('child')) return 'pc';
  if (n.includes('teen') && n.includes('adult')) return 'ta';
  // Athletic-program age groups don't follow the kids/teens/adults
  // naming convention; they're "9-14" (kids range) and "15+" (covers
  // both teens and adults). Map them so they appear in the right
  // age-based filters: 9-14 → kids, 15+ → teens & adults (so the user
  // sees Speed League etc. on both the Teens and Adults calendars).
  if (n.includes('15+')) return 'ta';
  if (n.includes('9-14') || n.includes('9–14')) return 'k';
  if (n.includes('kid')) return 'k';
  if (n.includes('teen')) return 't';
  // 'adult' OR 'women' (e.g. "Women's Only") both fall under the adult
  // bucket; matches the legacy renderer's age-routing semantics so adult-
  // gendered classes don't render with no age-key (which leaves them
  // visually orphaned in v-bw and v-editorial editions).
  if (n.includes('adult') || n.includes('women')) return 'a';
  return 'x';
}

// Parse an "HH:MM" string (or a bare hour "11" / 11) into [h, m].
// Returns null on invalid/empty input so callers can guard.
function parseHM(t) {
  if (t === undefined || t === null || t === '') return null;
  const s = String(t);
  const [hStr, mStr] = s.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return null;
  const m = mStr === undefined ? 0 : (parseInt(mStr, 10) || 0);
  return [h, m];
}

/**
 * Format an "HH:MM" time for class-card display. Minutes are omitted when
 * zero (so "11a" stays "11a") and shown otherwise (so "11:30" → "11:30a").
 * The suffix style is the only thing that varies between renderers — the
 * print sheet uses "a"/"p", the embed uses "am"/"pm".
 *
 * @param {string|number} t  Either an "HH:MM" string or a numeric hour.
 * @param {{ suffix?: 'short' | 'long' }} [opts]
 * @returns {string}
 */
export function fmtClassTime(t, opts = {}) {
  const parsed = parseHM(t);
  if (!parsed) return '';
  // Normalize hour into 0-23; lets callers pass h=24 (Friday-late Open
  // Gym close) and have it render as 12a (midnight) instead of 12p.
  const h = ((parsed[0] % 24) + 24) % 24;
  const m = parsed[1];
  const long = opts.suffix === 'long';
  const ampm = h >= 12 ? (long ? 'pm' : 'p') : (long ? 'am' : 'a');
  const h12 = (h % 12) || 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

/**
 * Format a start/end class time range. When `end` is missing, falls back
 * to one hour after `start` (mirrors the legacy default).
 *
 * @param {string|number} start
 * @param {string|number} [end]
 * @param {{ suffix?: 'short' | 'long', sep?: string }} [opts]
 * @returns {string}
 */
export function fmtClassTimeRange(start, end, opts = {}) {
  const sParsed = parseHM(start);
  if (!sParsed) return '';
  const eParsed = parseHM(end) || [sParsed[0] + 1, sParsed[1]];
  const sep = opts.sep || '-';
  return `${fmtClassTime(`${sParsed[0]}:${String(sParsed[1]).padStart(2, '0')}`, opts)}${sep}${fmtClassTime(`${eParsed[0]}:${String(eParsed[1]).padStart(2, '0')}`, opts)}`;
}

// Local aliases for the print sheet's own callsites — short-suffix style.
const fmtHour = (h) => fmtClassTime(h, { suffix: 'short' });
const fmtRange = (s, e) => fmtClassTimeRange(s, e, { suffix: 'short', sep: '-' });

export function matchesFilter(c, filter) {
  // Program-based filter: athletic classes only. Discipline must carry
  // 'athletic' in accessCategories. The CF denormalizes the discipline's
  // accessCategories onto each class object so we can check here.
  if (filter === 'athletic') {
    return Array.isArray(c.accessCategories) && c.accessCategories.includes('athletic');
  }

  // All age-based filters AND the "All Classes" view are scoped to the
  // standard Classes program: a class is included only if its discipline
  // carries 'classes' in accessCategories. The Athletic program is its
  // own membership scope ; its classes only surface under the Athletic
  // filter, never under "All Classes" or any age filter, so the public
  // schedule and the in-app views match what a Classes member can use.
  // A discipline dual-tagged ['classes', 'athletic'] correctly appears
  // in both. Legacy data without accessCategories falls through to
  // classes semantics so old docs aren't hidden until they're re-saved.
  const isClassesProgram = !Array.isArray(c.accessCategories) || c.accessCategories.includes('classes');
  if (!isClassesProgram) return false;

  if (filter === 'all') return true;
  const k = ageKeyOf(c.ageGroupName);
  if (filter === 'kids') return k === 'pc' || k === 'k';
  if (filter === 'teens') return k === 't' || k === 'ta';
  if (filter === 'adults') return k === 'a' || k === 'ta';
  return k === filter;
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Format a Firestore-or-ISO last-modified timestamp into the "Effective"
 * label format. Returns null if the input is missing/invalid so callers
 * can fall back. The schedule's lastModifiedAt is auto-bumped by the
 * Firestore triggers in functions/schedule-metadata.js whenever the
 * weeklySchedule, disciplines, or ageGroups collections change.
 */
function formatEffectiveDate(input) {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ─────────────────────── DOM builders ───────────────────────

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.style) {
    for (const [k, v] of Object.entries(opts.style)) {
      if (k.startsWith('--')) node.style.setProperty(k, v);
      else node.style[k] = v;
    }
  }
  if (opts.attrs) {
    for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function buildClassCard(c, variant, layout, onClick) {
  const ak = ageKeyOf(c.ageGroupName);
  const cls = ['class', 'age-' + ak, 'layout-' + layout];
  if (c.isCancelled) cls.push('cancelled');
  // Admin-only: classes hidden from the public schedule are marked
  // `_hidden: true` by the denormalizer. The CSS scope
  // `.schedule-admin-wrap .class.is-hidden` dims/dashes them. The public
  // CF never sets `_hidden` so this is a no-op for print/embed paths.
  if (c._hidden) cls.push('is-hidden');

  const style = (variant === 'editorial' || variant === 'bw')
    ? { '--c': c.color }
    : { background: c.color, color: c.textColor || contrastText(c.color), '--c': c.color };

  if (onClick) style.cursor = 'pointer';

  const ageShort = (c.ageGroupName || '').toUpperCase();

  const children = [];
  if (c.isNew && !c.isCancelled) children.push(el('span', { className: 'tag new', text: 'NEW' }));
  if (c.isCancelled) children.push(el('span', { className: 'tag end', text: 'ENDING' }));
  children.push(el('div', { className: 'c-name', text: c.disciplineName || '' }));

  if (layout === 'compact') {
    children.push(el('div', { className: 'c-meta', style: { textAlign: 'center' } }, [
      el('span', { className: 'c-time', text: fmtRange(c.time, c.endTime) }),
      el('span', { className: 'c-age c-age-abbr', text: ageShort }),
    ]));
  } else {
    children.push(el('div', { className: 'c-time', text: fmtRange(c.time, c.endTime) }));
    children.push(el('div', { className: 'c-age c-age-full', text: c.ageGroupName || '' }));
  }

  // `data-class-id` is the route key the admin click handler uses to
  // look up the schedule entry and open its edit modal. Public
  // renderers ignore it.
  const attrs = c.id ? { 'data-class-id': String(c.id) } : undefined;
  const cardEl = el('div', { className: cls.join(' '), style, attrs }, children);
  if (onClick) cardEl.addEventListener('click', () => onClick(c));
  return cardEl;
}

function buildHeader(headline, subline, week) {
  return el('div', { className: 'h-rail' }, [
    el('div', { className: 'h-mark', text: 'TMV' }),
    el('div', { className: 'h-title' }, [
      el('div', { className: 'h-eyebrow', text: 'The Monkey Vault · Movement Training Center · Weekly Class Schedule' }),
      el('div', { className: 'h-headline', text: headline }),
      subline ? el('div', { className: 'h-subline', text: subline }) : null,
    ]),
    el('div', { className: 'h-meta' }, [
      el('div', { className: 'h-meta-label', text: 'Effective' }),
      el('div', { className: 'h-meta-value', text: week }),
    ]),
  ]);
}

function buildFooter(legendEntries) {
  const legend = el('div', { className: 'legend' },
    legendEntries.map(([name, color]) =>
      el('span', { className: 'swatch', style: { '--c': color }, text: name })
    )
  );
  const notes = el('div', { className: 'notes' }, [
    el('div', {}, [el('strong', { text: 'Class Duration' }), document.createTextNode(' · 60 min · starts on the hour')]),
    el('div', {}, [el('strong', { text: 'Late Arrival' }), document.createTextNode(' · No entry after 15 min · Open Gym available')]),
  ]);
  return el('div', { className: 'foot' }, [legend, notes]);
}

// ─────────────────────── Body grid ───────────────────────

function computeRows(filteredClasses, programClasses) {
  // The hour range comes from the FULL program (not the filtered set),
  // so sub-filters within the same program share a stable vertical
  // extent. Without this, picking the Kids filter (3 hours of class)
  // would let those few populated rows balloon to fill the whole body
  // height, producing huge cards. With this, the body still spans the
  // program's full morning-to-evening range; the kids hours render
  // populated while the rest compress to 0.22fr empty rows.
  // Falls back to the filtered set when no program scope was passed
  // (e.g. legacy callers).
  const hourSource = (programClasses && programClasses.length > 0) ? programClasses : filteredClasses;
  const hours = [...new Set(hourSource.map(c => parseInt(c.time, 10)))].sort((a, b) => a - b);
  if (hours.length === 0) return { rows: [], gridRowsCss: 'auto' };

  const visibleByKey = {};
  filteredClasses.forEach(c => {
    const k = `${c.day}-${parseInt(c.time, 10)}`;
    (visibleByKey[k] = visibleByKey[k] || []).push(c);
  });
  // Stable order within an hour bucket: a class at 11:00 must render
  // above one at 11:30. Without this, iteration order leaks into the
  // visual stack (now visible since minutes show on the card). Numeric
  // sort (not localeCompare) so unpadded legacy times like "9:30" still
  // order correctly.
  Object.keys(visibleByKey).forEach(k => {
    visibleByKey[k].sort((a, b) => {
      const ap = parseHM(a.time) || [0, 0];
      const bp = parseHM(b.time) || [0, 0];
      return (ap[0] * 60 + ap[1]) - (bp[0] * 60 + bp[1]);
    });
  });

  // Anchor the range to gym operating hours so every filter view shares
  // the same vertical extent. Classes outside the standard window still
  // extend the range ; Math.min/max takes whichever is wider.
  const minH = Math.min(GYM_OPEN_HOUR, ...hours);
  const maxH = Math.max(GYM_LAST_HOUR, ...hours);
  const fullHours = [];
  for (let h = minH; h <= maxH; h++) fullHours.push(h);

  const rows = [];
  fullHours.forEach((h, hi) => {
    const perDay = DAY_ORDER.map(d => visibleByKey[`${d}-${h}`] || []);
    const stack = Math.max(1, ...perDay.map(arr => arr.length));
    const isEmpty = !perDay.some(arr => arr.length > 0);
    const isLastHour = hi === fullHours.length - 1;
    for (let sub = 0; sub < stack; sub++) {
      rows.push({
        h, sub, stack, perDay,
        isEmpty,
        isLastHour,
        isFirstSub: sub === 0,
        isHourEnd: sub === stack - 1 && !isLastHour,
      });
    }
  });

  const gridRowsCss = ['auto', ...rows.map(r => r.isEmpty ? '0.22fr' : 'minmax(0, 1fr)')].join(' ');
  return { rows, gridRowsCss };
}

function buildBody(filteredClasses, variant, layout, onClassClick, programClasses) {
  const { rows, gridRowsCss } = computeRows(filteredClasses, programClasses);

  const body = el('div', { className: 'body', style: { gridTemplateRows: gridRowsCss } });

  // Header row
  body.appendChild(el('div', {
    className: 'time-h',
    text: 'HOUR',
    style: { gridColumn: '1', gridRow: '1' },
  }));
  DAY_ORDER.forEach((d, i) => {
    const isEnd = i === DAY_ORDER.length - 1;
    body.appendChild(el('div', {
      className: `day-h${isEnd ? ' col-end' : ''}`,
      text: DAY_LONG[d],
      style: { gridColumn: String(i + 2), gridRow: '1' },
    }));
  });

  // Body rows
  rows.forEach((r, ri) => {
    const gridRow = ri + 2;
    const isLastRow = ri === rows.length - 1;

    if (r.isFirstSub) {
      const timeCellCls = ['time-c'];
      if (r.isEmpty) timeCellCls.push('empty-hour-time');
      // time-c spans the entire hour via rowspan, so its bottom edge is
      // the hour-end edge. If this is the last hour of the sheet, that
      // edge is the sheet's bottom ; drop the divider so the time column
      // matches the day cells (which lose their bottom border on row-end).
      if (r.isLastHour) timeCellCls.push('row-end-time');
      body.appendChild(el('div', {
        className: timeCellCls.join(' '),
        text: fmtHour(r.h),
        style: { gridColumn: '1', gridRow: `${gridRow} / span ${r.stack}` },
      }));
    }

    r.perDay.forEach((items, di) => {
      const cellCls = ['cell'];
      if (r.isEmpty) cellCls.push('empty-hour');
      if (isLastRow) cellCls.push('row-end');
      // Hour boundary divider ; only the LAST sub-row of an hour gets one.
      // Sub-rows inside a multi-stack hour render as a single visual block,
      // matching the time-c column which spans all sub-rows.
      if (r.isHourEnd) cellCls.push('hour-end');
      if (di === DAY_ORDER.length - 1) cellCls.push('col-end');

      // data-day + data-hour are the route keys for the admin
      // onEmptyCellClick handler (and the CSS hover affordance on empty
      // cells). Public renderers ignore them.
      const cell = el('div', {
        className: cellCls.join(' '),
        style: { gridColumn: String(di + 2), gridRow: String(gridRow) },
        attrs: { 'data-day': String(DAY_ORDER[di]), 'data-hour': String(r.h) },
      });

      if (items[r.sub]) cell.appendChild(buildClassCard(items[r.sub], variant, layout, onClassClick));
      body.appendChild(cell);
    });
  });

  return body;
}

// ─────────────────────── Open Gym body ───────────────────────

/**
 * Build the body grid for the Open Gym filter view. Renders multi-hour
 * blocks per day instead of class cards: a single OPEN GYM block from
 * 11am to 10pm on every day, plus Friday's adults-only late block from
 * 10pm to midnight. Reuses the same .class card / .cell scaffolding so
 * variant styling (color / editorial / bw) and the gym-hours anchor
 * apply uniformly.
 */
function buildOpenGymBody(variant) {
  // Range covers gym open hours for any day, including Friday's late
  // extension (which pushes the body to 11pm row).
  const minH = OPEN_GYM_DAILY.open;
  const maxH = OPEN_GYM_FRIDAY_LATE.close - 1;
  const hours = [];
  for (let h = minH; h <= maxH; h++) hours.push(h);

  const gridRowsCss = ['auto', ...hours.map(() => 'minmax(0, 1fr)')].join(' ');
  const body = el('div', { className: 'body', style: { gridTemplateRows: gridRowsCss } });

  // Header row: HOUR + day names
  body.appendChild(el('div', { className: 'time-h', text: 'HOUR', style: { gridColumn: '1', gridRow: '1' } }));
  DAY_ORDER.forEach((d, i) => {
    const isEnd = i === DAY_ORDER.length - 1;
    body.appendChild(el('div', {
      className: `day-h${isEnd ? ' col-end' : ''}`,
      text: DAY_LONG[d],
      style: { gridColumn: String(i + 2), gridRow: '1' },
    }));
  });

  // Time column: hour label per row (11a, 12p, 1p ... 11p)
  hours.forEach((h, hi) => {
    const isLast = hi === hours.length - 1;
    body.appendChild(el('div', {
      className: `time-c${isLast ? ' row-end-time' : ''}`,
      text: fmtHour(h),
      style: { gridColumn: '1', gridRow: String(hi + 2) },
    }));
  });

  // Per-day blocks. Non-Friday columns also need empty cells for the
  // 10pm and 11pm rows so the grid keeps its day-column borders aligned.
  DAY_ORDER.forEach((d, i) => {
    const colIndex = i + 2;
    const isEnd = i === DAY_ORDER.length - 1;

    // Daily block: 11am to 10pm
    const dailyRowStart = OPEN_GYM_DAILY.open - minH + 2;
    const dailyRowSpan = OPEN_GYM_DAILY.close - OPEN_GYM_DAILY.open;
    const dailyCellCls = ['cell', 'og-cell', 'hour-end'];
    if (isEnd) dailyCellCls.push('col-end');
    const dailyCell = el('div', {
      className: dailyCellCls.join(' '),
      style: { gridColumn: String(colIndex), gridRow: `${dailyRowStart} / span ${dailyRowSpan}` },
    });
    dailyCell.appendChild(buildOpenGymCard({ start: 11, end: 22, ageLabel: 'All Ages', variant }));
    body.appendChild(dailyCell);

    if (d === 5) {
      // Friday late block: 10pm to 12am (adults only)
      const lateRowStart = OPEN_GYM_FRIDAY_LATE.open - minH + 2;
      const lateRowSpan = OPEN_GYM_FRIDAY_LATE.close - OPEN_GYM_FRIDAY_LATE.open;
      const lateCellCls = ['cell', 'og-cell', 'og-late'];
      if (isEnd) lateCellCls.push('col-end');
      lateCellCls.push('row-end');
      const lateCell = el('div', {
        className: lateCellCls.join(' '),
        style: { gridColumn: String(colIndex), gridRow: `${lateRowStart} / span ${lateRowSpan}` },
      });
      lateCell.appendChild(buildOpenGymCard({ start: 22, end: 24, ageLabel: OPEN_GYM_FRIDAY_LATE.label, variant, isLate: true }));
      body.appendChild(lateCell);
    } else {
      // Non-Friday columns: empty cells for the 10pm and 11pm rows so
      // the column borders + hatching read as gym-closed.
      for (let h = OPEN_GYM_FRIDAY_LATE.open; h < OPEN_GYM_FRIDAY_LATE.close; h++) {
        const rowIndex = h - minH + 2;
        const isLastRow = h === maxH;
        const cls = ['cell', 'empty-hour'];
        if (isEnd) cls.push('col-end');
        if (isLastRow) cls.push('row-end');
        body.appendChild(el('div', {
          className: cls.join(' '),
          style: { gridColumn: String(colIndex), gridRow: String(rowIndex) },
        }));
      }
    }
  });

  return body;
}

function buildOpenGymCard({ start, end, ageLabel, variant, isLate }) {
  const ageKey = isLate ? 'a' : 'x'; // late = adults; daily = no age routing
  const cls = ['class', 'og-card', 'layout-expanded', 'age-' + ageKey];

  // Match the Open Gym service color (--color-opengym = #4caf50). The
  // Friday late "Adults Only" block uses a darker shade of the same hue
  // so it reads as still part of the Open Gym program but visually
  // differentiated as an after-hours / adults-only slot.
  // Editorial / B&W: rely on the variant's existing .class rules ; only
  // --c gets set so the left rule (editorial) or border (bw) picks up
  // the green accent.
  const accent = isLate ? '#2e7d32' : '#4caf50';
  const style = (variant === 'editorial' || variant === 'bw')
    ? { '--c': accent }
    : { background: accent, color: '#ffffff', '--c': accent };

  return el('div', { className: cls.join(' '), style }, [
    el('div', { className: 'c-name', text: 'OPEN GYM' }),
    el('div', { className: 'c-time', text: fmtRange(String(start), String(end)) }),
    el('div', { className: 'c-age c-age-full', text: (ageLabel || '').toUpperCase() }),
  ]);
}

// ─────────────────────── Public API ───────────────────────

/**
 * @param {HTMLElement} root - Container to render into.
 * @param {Object} [opts]
 * @param {'color'|'editorial'|'bw'} [opts.variant='color']
 * @param {'all'|'kids'|'teens'|'adults'|'athletic'} [opts.filter='all']
 * @param {{ width: number, height: number }} [opts.canvasPx] - Pixel size for the .sheet container (required for cqh/cqi).
 * @param {string} [opts.week] - Override "Effective" date label (defaults to today).
 * @param {string} [opts.apiUrl] - Override schedule API endpoint.
 * @param {Object} [opts.schedule] - Pre-fetched schedule (skips fetch).
 * @param {(c: Object) => void} [opts.onClassClick] - Optional click handler.
 *        When provided, class cards become clickable and the handler
 *        receives the class object. Used by the public embed for popup
 *        details; print pages omit this and cards stay non-interactive.
 * @param {(day: number, hour: number) => void} [opts.onEmptyCellClick]
 *        Optional empty-cell click handler. When provided, clicking an
 *        empty grid cell fires the handler with the cell's day (0-6) +
 *        hour. Used by the admin preview to seed an "add class at this
 *        slot" modal; the public embed + print pages omit this.
 * @returns {Promise<Object>} Resolves with the schedule data when render completes.
 */
export async function renderPrintSheet(root, opts = {}) {
  const variant = ['color', 'editorial', 'bw'].includes(opts.variant) ? opts.variant : 'color';
  const filter = ['all', 'kids', 'teens', 'adults', 'athletic', 'open-gym'].includes(opts.filter) ? opts.filter : 'all';
  const apiUrl = opts.apiUrl || DEFAULT_API_URL;
  // "Effective <date>" priority:
  //   1. opts.week ; explicit caller override (e.g. preview a draft date)
  //   2. scheduleData.lastModifiedAt ; auto-bumped by Firestore triggers on
  //      weeklySchedule / disciplines / ageGroups changes
  //   3. today ; last-resort fallback for old schedule payloads that
  //      don't yet carry the field (pre-trigger-deploy data)
  // We resolve (2) below after fetching, since scheduleData isn't available
  // at this point yet. opts.week wins if present.
  let week = opts.week;

  if (!root) throw new Error('renderPrintSheet: root element required');

  // Loading state
  root.innerHTML = '';
  const loading = el('div', { className: 'sheet-loading', text: 'Loading schedule...', style: { padding: '40px', textAlign: 'center', fontFamily: 'Roboto, sans-serif' } });
  root.appendChild(loading);

  let scheduleData = opts.schedule;
  if (!scheduleData) {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Failed to fetch schedule');
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Unknown error');
      scheduleData = result.data;
    } catch (err) {
      console.error('Error loading schedule:', err);
      root.innerHTML = '';
      root.appendChild(el('div', { className: 'sheet-error', text: 'Unable to load schedule. Please refresh the page.', style: { padding: '40px', textAlign: 'center', color: '#b03030', fontFamily: 'Roboto, sans-serif' } }));
      throw err;
    }
  }

  // Resolve the "Effective" date now that scheduleData is in hand.
  if (!week) {
    week = formatEffectiveDate(scheduleData.lastModifiedAt) || todayLabel();
  }

  const filtered = (scheduleData.classes || []).filter(c => matchesFilter(c, filter));

  // Hour-range anchor: the body spans the FULL schedule's hour range ;
  // not just the filtered subset, and not just the current program.
  // This way every filter view (kids / teens / adults / athletic / all)
  // shares the same morning-to-evening vertical extent. Hours that have
  // no matching classes after filtering compress to 0.22fr empty rows,
  // so populated rows stay at consistent reasonable card heights even
  // for sparse filters like Athletic (which might only have 3-4 hours
  // of class). Without this, the Athletic view's body would only span
  // its 3 hours with cards ballooning huge.
  const programClasses = scheduleData.classes || [];

  // Legend: unique disciplines in encounter order, with their first-seen color.
  const seen = new Map();
  filtered.forEach(c => {
    if (!seen.has(c.disciplineName)) seen.set(c.disciplineName, c.color);
  });

  const meta = HEADLINES[filter] || HEADLINES.all;
  const layout = filter === 'all' ? 'compact' : 'expanded';

  // Open Gym is its own render mode: per-day multi-hour blocks instead
  // of class cards. Skip the legend (single discipline) and use the
  // dedicated body builder.
  const isOpenGym = filter === 'open-gym';
  const bodyEl = isOpenGym
    ? buildOpenGymBody(variant)
    : buildBody(filtered, variant, layout, opts.onClassClick, programClasses);
  const footerEl = isOpenGym
    ? buildFooter([])  // no per-discipline legend in open-gym view
    : buildFooter([...seen.entries()]);

  const sheet = el('div', { className: `sheet v-${variant}${isOpenGym ? ' v-open-gym' : ''}` }, [
    buildHeader(meta.h, meta.s, week),
    bodyEl,
    footerEl,
  ]);

  if (opts.canvasPx) {
    sheet.style.width = `${opts.canvasPx.width}px`;
    sheet.style.height = `${opts.canvasPx.height}px`;
  }

  // Admin-only: empty-cell click fires when the user clicks a cell with
  // no class card inside. We use event delegation on the sheet root so
  // we don't attach 77+ listeners (7 days x 11 hours). Cells carry
  // data-day + data-hour attrs set in buildBody. Open Gym filter has
  // no empty cells worth seeding, so we skip wiring there.
  if (opts.onEmptyCellClick && !isOpenGym) {
    sheet.addEventListener('click', (e) => {
      const cell = /** @type {HTMLElement | null} */ (e.target instanceof Element ? e.target.closest('.cell') : null);
      if (!cell || !sheet.contains(cell)) return;
      if (cell.querySelector('.class')) return; // occupied
      const day = parseInt(cell.dataset.day || '', 10);
      const hour = parseInt(cell.dataset.hour || '', 10);
      if (isNaN(day) || isNaN(hour)) return;
      opts.onEmptyCellClick(day, hour);
    });
  }

  root.innerHTML = '';
  root.appendChild(sheet);

  return scheduleData;
}
