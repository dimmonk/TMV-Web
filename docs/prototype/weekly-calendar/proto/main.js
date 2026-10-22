// The weekly class calendar prototype. Runs inside the BUILT /schedule/ page (the real header, footer, app chrome and
// every stylesheet), with that page's own scripts removed and this one in their place. The desktop sheet is drawn by
// the live renderer (src/lib/print-schedule-sheet.js) from sample data; the phone list repeats the markup of
// src/lib/mobile-schedule.ts (which can only fetch, so it cannot be fed sample data). What is PROPOSED and not built
// is marked `wk-` and styled in proto.css.
import { renderPrintSheet, matchesFilter, fmtClassTimeRange } from '../../../../src/lib/print-schedule-sheet.js';
import { buildOpenGymMobileEntries } from '../../../../src/lib/schedule-embed-sheet.js';
import { SAMPLE_CLASSES, SAMPLE_DISPLAY } from './classes.js';
import { SAMPLE_EXCEPTIONS, TODAY } from './data.js';
import {
  visibleWeeks, sessionsForWeek, closedDays, upcomingChanges, weekRangeLabel, shortDate, dayAndDate, dateInWeek,
} from './week.js';
import { NOTES } from './notes.js';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FILTERS = [['all', 'All'], ['kids', 'Kids'], ['teens', 'Teens'], ['adults', 'Adults'], ['athletic', 'Athletic'], ['open-gym', 'Open Gym']];
const WEEK_EYEBROW = ['This week', 'Next week', 'In 2 weeks', 'In 3 weeks'];
const fmtLong = (s, e) => fmtClassTimeRange(s, e, { suffix: 'long', sep: ' – ' });
const IN_FRAME = window.self !== window.top;

// ── State: one immutable object, replaced on every change ────────────────────────────────────────────────
const INITIAL = Object.freeze({
  mode: 'proposed', // 'proposed' | 'live'
  week: 0, // index into visibleWeeks
  filter: SAMPLE_DISPLAY.filter || 'all',
  exceptionsOn: Object.freeze(SAMPLE_EXCEPTIONS.map(() => true)),
  phone: false,
  notesOpen: false,
  reviewMin: false,
});
let state = INITIAL;
const PAGE_HTML = IN_FRAME ? '' : '<!doctype html>' + document.documentElement.outerHTML;

function update(patch) {
  state = Object.freeze({ ...state, ...patch });
  render();
  pushToPhone();
}

const exceptions = () => SAMPLE_EXCEPTIONS.filter((_, i) => state.exceptionsOn[i]);
const weeks = visibleWeeks(TODAY);

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children) if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return node;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── Proposed pieces shared by both chromes ───────────────────────────────────────────────────────────────
function weekBar() {
  const i = state.week;
  return el('div', { class: 'wk-bar', role: 'group', 'aria-label': 'Week' }, [
    el('button', { type: 'button', class: 'wk-arrow', 'data-act': 'prev', 'aria-label': 'Previous week', disabled: i === 0 }, [el('i', { class: 'bi bi-chevron-left', 'aria-hidden': 'true' })]),
    el('div', { class: 'wk-label', 'aria-live': 'polite' }, [
      el('span', { class: 'wk-eyebrow', text: WEEK_EYEBROW[i] }),
      el('span', { class: 'wk-range', text: weekRangeLabel(weeks[i]) }),
    ]),
    el('button', { type: 'button', class: 'wk-arrow', 'data-act': 'next', 'aria-label': 'Next week', disabled: i === weeks.length - 1 }, [el('i', { class: 'bi bi-chevron-right', 'aria-hidden': 'true' })]),
    i > 0 ? el('button', { type: 'button', class: 'wk-today', 'data-act': 'this-week', text: 'Back to this week' }) : null,
  ]);
}

function changesNotice() {
  const list = upcomingChanges(SAMPLE_CLASSES, TODAY, exceptions());
  if (!list.length) return null;
  return el('div', { class: 'wk-changes' }, [
    el('div', { class: 'wk-changes-h' }, [el('i', { class: 'bi bi-exclamation-triangle', 'aria-hidden': 'true' }), 'Schedule changes']),
    el('ul', {}, list.map((e) => {
      const what = e.type === 'closed' ? `Gym closed${e.reason ? `: ${e.reason}` : ''}` : `${e.cls.disciplineName} (${e.cls.ageGroupName}) ${fmtLong(e.cls.time, e.cls.endTime)} cancelled${e.reason ? `: ${e.reason}` : ''}`;
      return el('li', {}, [
        el('button', { type: 'button', class: 'wk-change-date', 'data-act': 'goto', 'data-date': e.date, text: dayAndDate(e.date) }),
        el('span', { text: what }),
      ]);
    })),
  ]);
}

// ── Desktop: the live sheet, then the proposed dates and exceptions laid on it ───────────────────────────
let popup = null;
function setupPopup() {
  const overlay = document.getElementById('embed-popup-overlay');
  const modal = document.getElementById('embed-popup');
  if (!overlay || !modal) return null;
  const close = () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  modal.querySelector('.popup-close')?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  return {
    open(c) {
      modal.querySelector('.popup-title').textContent = c.disciplineName || '';
      const dated = state.mode === 'proposed' && c.date;
      modal.querySelector('.popup-time').textContent = dated ? `${dayAndDate(c.date)} · ${fmtLong(c.time, c.endTime)}` : fmtLong(c.time, c.endTime);
      modal.querySelector('.popup-age').textContent = c.ageGroupName || '';
      modal.querySelector('.wk-popup-off')?.remove();
      if (dated && c.status !== 'on') {
        const head = c.status === 'closed' ? `Gym closed ${dayAndDate(c.date)}` : `Cancelled on ${dayAndDate(c.date)}`;
        modal.querySelector('.popup-title').after(el('div', { class: 'wk-popup-off' }, [
          el('strong', { text: head }), c.offReason ? el('span', { text: c.offReason }) : null,
          el('span', { class: 'wk-popup-next', text: 'Every other week runs as usual.' }),
        ]));
      }
      const wrap = modal.querySelector('.popup-desc-wrap');
      wrap.style.display = c.description ? '' : 'none';
      modal.querySelector('.popup-desc').textContent = c.description || '';
      modal.querySelector('.popup-stripe').style.background = c.color || '#14110f';
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    },
  };
}

async function renderDesktop() {
  const root = document.getElementById('embed-desktop-root');
  const shell = document.querySelector('.embed-shell');
  if (!root || !shell) return;
  shell.querySelectorAll('.wk-bar, .wk-changes').forEach((n) => n.remove());
  document.querySelectorAll('#embed-filters .embed-filter').forEach((b) => b.classList.toggle('active', b.dataset.filter === state.filter));

  const proposed = state.mode === 'proposed';
  const monday = weeks[state.week];
  const sessions = proposed ? sessionsForWeek(SAMPLE_CLASSES, monday, exceptions()) : SAMPLE_CLASSES;
  const byId = new Map(sessions.map((s) => [s.id, s]));
  await renderPrintSheet(root, {
    variant: SAMPLE_DISPLAY.variant,
    filter: state.filter,
    schedule: { classes: sessions },
    week: proposed ? weekRangeLabel(monday) : 'October 20, 2026',
    onClassClick: (c) => popup?.open(byId.get(c.id) || c),
  });
  if (!proposed) return;

  const desktop = shell.querySelector('.embed-desktop');
  desktop.before(weekBar());
  const notice = changesNotice();
  if (notice) desktop.before(notice);

  const sheet = root.querySelector('.sheet');
  sheet.classList.add('wk-dated');
  const metaLabel = sheet.querySelector('.h-meta-label');
  if (metaLabel) metaLabel.textContent = WEEK_EYEBROW[state.week];
  const closed = closedDays(monday, exceptions());
  const colDate = (col) => dateInWeek(monday, DAY_ORDER[col - 2]);

  sheet.querySelectorAll('.day-h').forEach((h, i) => {
    const date = dateInWeek(monday, DAY_ORDER[i]);
    h.classList.add('wk-day-h');
    if (date === TODAY) h.classList.add('wk-is-today');
    if (date < TODAY) h.classList.add('wk-is-past');
    h.appendChild(el('span', { class: 'wk-day-date', text: date === TODAY ? `Today · ${shortDate(date)}` : shortDate(date) }));
    if (closed.has(date)) h.appendChild(el('span', { class: 'wk-day-closed', text: 'Closed' }));
  });
  sheet.querySelectorAll('.cell').forEach((cell) => {
    const date = colDate(Number(cell.style.gridColumnStart));
    if (date < TODAY) cell.classList.add('wk-is-past');
    if (closed.has(date)) cell.classList.add('wk-is-closed');
  });
  sheet.querySelectorAll('.class[data-class-id]').forEach((card) => {
    const s = byId.get(card.dataset.classId);
    if (!s || s.status === 'on') return;
    card.classList.add('cancelled', 'wk-off');
    card.querySelector('.tag')?.remove();
    card.prepend(el('span', { class: 'tag end', text: s.status === 'closed' ? 'CLOSED' : 'CANCELLED' }));
  });
  // Open Gym is not a class list: a closed day greys its column (done above) and labels its block.
  if (state.filter === 'open-gym') {
    sheet.querySelectorAll('.cell.wk-is-closed .class').forEach((card) => card.classList.add('cancelled', 'wk-off'));
  }
}

// ── Phone: the markup of src/lib/mobile-schedule.ts, plus the proposed week bar, dates and exceptions ───
function phoneDays() {
  const proposed = state.mode === 'proposed';
  const monday = weeks[state.week];
  const base = state.filter === 'open-gym'
    ? buildOpenGymMobileEntries().map((c, i) => ({ ...c, id: `og${i}` }))
    : SAMPLE_CLASSES.filter((c) => matchesFilter(c, state.filter));
  const list = proposed ? sessionsForWeek(base, monday, exceptions()) : base;
  const closed = proposed ? closedDays(monday, exceptions()) : new Map();
  const key = (t) => { const [h, m] = String(t || '').split(':'); return (parseInt(h, 10) || 0) * 60 + (parseInt(m || '0', 10) || 0); };
  const todayDay = 4; // the prototype's fixed today, Thu Oct 22
  return DAY_ORDER.flatMap((d) => {
    const date = proposed ? dateInWeek(monday, d) : null;
    // This week starts at today on the phone: yesterday's classes are no use on the move.
    if (date && date < TODAY) return [];
    const sessions = list.filter((c) => c.day === d).sort((a, b) => key(a.time) - key(b.time));
    if (!sessions.length) return [];
    const isToday = proposed ? date === TODAY : d === todayDay;
    const label = proposed ? `${isToday ? 'Today · ' : ''}${DAY_LONG[d]} · ${shortDate(date)}` : `${isToday ? 'Today · ' : ''}${DAY_LONG[d]}`;
    return [{ label, closed: date ? closed.get(date) : null, sessions }];
  });
}

function phoneSessionHtml(s) {
  const off = s.status === 'cancelled' || s.status === 'closed';
  const ending = !!s.isCancelled;
  const dim = off || ending;
  const badge = off
    ? `<span class="m-sess-badge" style="color:#8b1f1f;background:#fbeaea;border:1px solid #ecc6c6">${s.status === 'closed' ? 'Closed' : 'Cancelled'}</span>`
    : ending ? '<span class="m-sess-badge" style="color:#8b1f1f;background:#fbeaea;border:1px solid #ecc6c6">Ending</span>' : '';
  const reason = off && s.offReason ? `<div class="wk-sess-reason">${esc(s.offReason)}</div>` : '';
  return `
    <div class="m-sess" style="opacity:${dim ? '.55' : '1'}">
      <span class="m-sess-bar" style="background:${esc(s.color || '#2196f3')}"></span>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center"><span class="m-sess-name" style="text-decoration:${dim ? 'line-through' : 'none'}">${esc(s.disciplineName || '')}</span>${badge}</div>
        <div class="m-sess-meta">${esc(fmtLong(s.time, s.endTime))} · ${esc(s.ageGroupName || '')}</div>
        ${reason}
      </div>
    </div>`;
}

function renderPhone() {
  const chipsEl = document.querySelector('[data-sched-chips]');
  const body = document.querySelector('[data-sched-body]');
  if (!chipsEl || !body) return;
  chipsEl.innerHTML = FILTERS.map(([k, l]) => {
    const on = k === state.filter;
    return `<button type="button" class="m-chip" data-filter="${k}" style="color:${on ? '#fff' : '#3a3833'};background:${on ? '#211f1b' : '#fff'};border:1px solid ${on ? '#211f1b' : '#e6e4dd'}">${l}</button>`;
  }).join('');
  const days = phoneDays();
  body.innerHTML = days.length ? days.map((day) => `
      <div class="m-sched-day">
        <div class="m-sched-daylabel">${esc(day.label)}${day.closed ? ` <span class="wk-daylabel-closed">Closed${day.closed.reason ? ` · ${esc(day.closed.reason)}` : ''}</span>` : ''}</div>
        <div class="m-sched-card">${day.sessions.map(phoneSessionHtml).join('')}</div>
      </div>`).join('') + '<div class="m-autonote"><i class="bi bi-arrow-repeat"></i><span>Times update automatically — the same schedule our front desk runs from.</span></div>'
    : '<div style="text-align:center;padding:44px 20px;font:italic 500 13.5px/1.5 inherit;color:#8a877f">No classes match this filter.</div>';
  body.parentElement.querySelectorAll(':scope > .wk-phone-top').forEach((n) => n.remove());
  if (state.mode === 'proposed') {
    const top = el('div', { class: 'm-pad-x wk-phone-top' }, [weekBar(), changesNotice()]);
    body.before(top);
  }
}

// ── The review frame (not part of the design) ────────────────────────────────────────────────────────────
function seg(name, options, current) {
  return el('div', { class: 'proto-seg' }, options.map(([v, label]) =>
    el('button', { type: 'button', 'data-act': name, 'data-v': v, class: String(current) === v ? 'on' : '', text: label })));
}

function renderReview() {
  if (IN_FRAME) return;
  document.getElementById('proto-review')?.remove();
  const panel = el('aside', { id: 'proto-review', class: state.reviewMin ? 'is-min' : '', 'aria-label': 'Prototype controls' }, [
    el('div', { class: 'proto-title' }, [
      el('strong', { text: 'Prototype' }), el('span', { text: 'Weekly class calendar · today is Thu Oct 22' }),
      el('button', { type: 'button', class: 'proto-min', 'data-act': 'min', 'aria-label': state.reviewMin ? 'Show controls' : 'Hide controls', text: state.reviewMin ? '+' : '–' }),
    ]),
    el('div', { class: 'proto-row' }, [el('span', { text: 'Version' }), seg('mode', [['proposed', 'Proposed'], ['live', 'Live today']], state.mode)]),
    el('div', { class: 'proto-row' }, [el('span', { text: 'Screen' }), seg('screen', [['desktop', 'This screen'], ['phone', 'Phone']], state.phone ? 'phone' : 'desktop')]),
    state.mode === 'proposed' ? el('div', { class: 'proto-ex' }, [
      el('span', { text: 'Sample changes staff made in Members (tick to switch on)' }),
      ...SAMPLE_EXCEPTIONS.map((e, i) => el('label', {}, [
        el('input', { type: 'checkbox', 'data-act': 'ex', 'data-i': String(i), checked: state.exceptionsOn[i] }),
        el('span', { text: `${dayAndDate(e.date)}: ${e.label}` }),
      ])),
    ]) : null,
    el('div', { class: 'proto-row' }, [
      el('button', { type: 'button', class: 'proto-link', 'data-act': 'notes', text: state.notesOpen ? 'Hide notes' : 'Design notes and questions' }),
      el('button', { type: 'button', class: 'proto-link', 'data-act': 'reset', text: 'Reset' }),
    ]),
    state.notesOpen ? el('div', { class: 'proto-notes' }, NOTES.map((n) => el('p', { text: n }))) : null,
  ]);
  document.body.appendChild(panel);
}

let phoneFrame = null;
function renderPhoneFrame() {
  if (IN_FRAME) return;
  if (!state.phone) { phoneFrame?.parentElement.remove(); phoneFrame = null; return; }
  if (phoneFrame) return;
  const shade = el('div', { class: 'proto-phone-shade', 'data-act': 'screen', 'data-v': 'desktop' });
  phoneFrame = el('iframe', { class: 'proto-phone', title: 'Phone, 390px wide' });
  phoneFrame.srcdoc = PAGE_HTML;
  phoneFrame.addEventListener('load', pushToPhone);
  shade.appendChild(phoneFrame);
  document.body.appendChild(shade);
}
function pushToPhone() {
  try { phoneFrame?.contentWindow?.postMessage({ protoState: { ...state, phone: false, notesOpen: false } }, '*'); } catch { /* frame not ready */ }
}

function render() {
  renderDesktop();
  renderPhone();
  renderReview();
  renderPhoneFrame();
}

// ── Actions ──────────────────────────────────────────────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target : null;
  if (!t) return;
  const filterBtn = t.closest('[data-filter]');
  if (filterBtn) { update({ filter: filterBtn.dataset.filter }); return; }
  const act = t.closest('[data-act]');
  if (act && act.tagName !== 'INPUT') {
    const a = act.dataset.act;
    if (a === 'prev') update({ week: Math.max(0, state.week - 1) });
    else if (a === 'next') update({ week: Math.min(weeks.length - 1, state.week + 1) });
    else if (a === 'this-week') update({ week: 0 });
    else if (a === 'goto') update({ week: weeks.findIndex((m) => act.dataset.date >= m && act.dataset.date <= dateInWeek(m, 0)) });
    else if (a === 'mode') update({ mode: act.dataset.v, week: 0 });
    else if (a === 'screen' && (e.target === act || act.tagName === 'BUTTON')) update({ phone: act.dataset.v === 'phone' });
    else if (a === 'min') update({ reviewMin: !state.reviewMin });
    else if (a === 'notes') update({ notesOpen: !state.notesOpen });
    else if (a === 'reset') update({ ...INITIAL, phone: state.phone, reviewMin: state.reviewMin });
    return;
  }
  // Every other link on the page belongs to the real site, which this prototype does not include.
  const link = t.closest('a[href]');
  if (link) e.preventDefault();
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t instanceof HTMLInputElement && t.dataset.act === 'ex') {
    const i = Number(t.dataset.i);
    update({ exceptionsOn: Object.freeze(state.exceptionsOn.map((on, j) => (j === i ? t.checked : on))) });
  }
});
window.addEventListener('message', (e) => {
  if (IN_FRAME && e.data && e.data.protoState) { state = Object.freeze(e.data.protoState); render(); }
});

document.documentElement.classList.add(IN_FRAME ? 'proto-in-frame' : 'proto-top');
popup = setupPopup();
render();
