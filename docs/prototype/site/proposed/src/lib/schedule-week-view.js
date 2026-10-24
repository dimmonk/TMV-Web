// @ts-check
/**
 * The dated week in the website's look: the parts of the schedule page that draw it. DOM only; the week itself comes
 * from `schedule-weeks.js` and the page's state from `schedule-page.js` (desktop) or `mobile-schedule.ts` (phone).
 *
 * Built from parts the site already ships (signed off 2026-10-22): the price list's card (white card, 2px category
 * rule under an Archivo title, body-font rows), the eyebrow kicker, and each class's colour as a rule down its left
 * edge. Laid out as the printed sheet: hours down the left, days across, each class in its hour row.
 *
 * Every published value (a class name, a reason) reaches the page as `textContent`; the class description goes
 * through the embed's escaping markdown renderer, the same one the popup has always used.
 */
import { fmtClassTime, fmtClassTimeRange } from './print-schedule-sheet.js';
import { renderMarkdown } from './schedule-embed-sheet.js';
import { dateInWeek, dayAndDate, shortDate, weekRangeLabel, timeKey, WEEK_EYEBROWS } from './schedule-weeks.js';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** @param {string} s @param {string} e */
const fmtRange = (s, e) => fmtClassTimeRange(s, e, { suffix: 'long', sep: '–' });
/** @param {unknown} t */
const hourOf = (t) => parseInt(String(t), 10) || 0;

/**
 * @param {string} tag
 * @param {Record<string, any>} [attrs]
 * @param {Array<Node|string|null|undefined|false>} [children]
 * @returns {HTMLElement}
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className = v;
    else if (k === 'style') Object.entries(v).forEach(([p, val]) => node.style.setProperty(p, String(val)));
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children) if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return node;
}

const icon = (/** @type {string} */ name) => el('i', { class: `bi bi-${name}`, 'aria-hidden': 'true' });

// ── Week bar and Schedule changes (both chromes) ─────────────────────────────────────────────────────────

/**
 * Previous / next over the visible weeks, with where the week sits from today.
 * @param {{ weeks: string[], index: number, onStep: (index: number) => void }} opts
 */
export function weekBar({ weeks, index, onStep }) {
  const arrow = (/** @type {number} */ to, /** @type {string} */ label, /** @type {string} */ name) => {
    const b = el('button', { type: 'button', class: 'wk-arrow', 'aria-label': label, disabled: to < 0 || to >= weeks.length }, [icon(name)]);
    b.addEventListener('click', () => onStep(to));
    return b;
  };
  const back = index > 0 ? el('button', { type: 'button', class: 'wk-today', text: 'Back to this week' }) : null;
  back?.addEventListener('click', () => onStep(0));
  return el('div', { class: 'wk-bar', role: 'group', 'aria-label': 'Week' }, [
    arrow(index - 1, 'Previous week', 'chevron-left'),
    el('div', { class: 'wk-label', 'aria-live': 'polite' }, [
      el('span', { class: 'wk-eyebrow', text: WEEK_EYEBROWS[index] || '' }),
      el('span', { class: 'wk-range', text: weekRangeLabel(weeks[index]) }),
    ]),
    arrow(index + 1, 'Next week', 'chevron-right'),
    back,
  ]);
}

/**
 * One line of the Schedule changes card.
 * @param {any} change - an entry of `upcomingChanges`
 */
export function changeText(change) {
  const why = change.reason ? `: ${change.reason}` : '';
  if (change.type === 'closed') return `Gym closed${why}`;
  const c = change.cls;
  return `${c.disciplineName || ''} (${c.ageGroupName || ''}) ${fmtRange(c.time, c.endTime)} cancelled${why}`;
}

/**
 * Every change coming up, soonest first; each date jumps to its week. Null when there is none: no empty card.
 * @param {{ changes: any[], onGoto: (date: string) => void }} opts
 */
export function changesCard({ changes, onGoto }) {
  if (!changes.length) return null;
  return el('section', { class: 'wk-changes', 'aria-label': 'Schedule changes' }, [
    el('h2', { class: 'wk-changes-h' }, [icon('exclamation-triangle'), 'Schedule changes']),
    el('ul', {}, changes.map((change) => {
      const date = el('button', { type: 'button', class: 'wk-change-date', text: dayAndDate(change.date) });
      date.addEventListener('click', () => onGoto(change.date));
      return el('li', {}, [date, el('span', { text: changeText(change) })]);
    })),
  ]);
}

// ── The week grid (desktop) ──────────────────────────────────────────────────────────────────────────────

/** @param {any} s */
function tagFor(s) {
  if (s.status === 'cancelled') return el('span', { class: 'ws-tag is-off', text: 'Cancelled' });
  if (s.status === 'closed') return el('span', { class: 'ws-tag is-off', text: 'Closed' });
  if (s.isEnding) return el('span', { class: 'ws-tag', text: 'Ending' });
  if (s.isNew) return el('span', { class: 'ws-tag is-new', text: 'New' });
  return null;
}

/** @param {any} s @param {((s: any) => void)|undefined} onClick */
function classItem(s, onClick) {
  const off = s.status !== 'on';
  const btn = el(onClick ? 'button' : 'div', {
    type: onClick ? 'button' : null,
    class: `ws-item${off ? ' is-off' : ''}`,
    style: { '--k': s.color || 'var(--c)' },
    'data-key': s.color || '',
    'aria-label': `${s.disciplineName || ''}, ${s.ageGroupName || ''}, ${fmtRange(s.time, s.endTime)}${off ? `, ${s.status}` : ''}`,
  }, [
    el('span', { class: 'ws-name', text: s.disciplineName || '' }),
    el('span', { class: 'ws-age', text: s.ageGroupName || '' }),
    el('span', { class: 'ws-when' }, [fmtRange(s.time, s.endTime), tagFor(s)]),
  ]);
  if (onClick) btn.addEventListener('click', () => onClick(s));
  return btn;
}

/** @param {number} d @param {{ monday: string, today: string, closed: Map<string, any> }} ctx */
function dayHead(d, { monday, today, closed }) {
  const date = dateInWeek(monday, d);
  const isToday = date === today;
  const shut = closed.get(date);
  return el('div', {
    class: `ws-head${isToday ? ' is-today' : ''}${date < today ? ' is-past' : ''}${shut ? ' is-closed' : ''}`,
    role: 'columnheader',
  }, [
    el('span', { class: 'ws-kicker' }, [isToday ? el('span', { class: 'rule' }) : null, isToday ? `Today · ${shortDate(date)}` : shortDate(date)]),
    el('span', { class: 'ws-title', text: DAY_LONG[d] }),
    shut ? el('span', { class: 'ws-closed', text: `Gym closed${shut.reason ? `: ${shut.reason}` : ''}` }) : null,
  ]);
}

/**
 * Draw one dated week: hours down the left, days across, each class in its hour row.
 * @param {HTMLElement} root
 * @param {{ sessions: any[], monday: string, today: string, closed: Map<string, any>, section: string, onClassClick?: (s: any) => void }} opts
 *   `section` picks the category colour of the day rules, as the price list does (classes | athletic | open_gym).
 */
export function renderWeekGrid(root, { sessions, monday, today, closed, section, onClassClick }) {
  const hours = [...new Set(sessions.map((s) => hourOf(s.time)))].sort((a, b) => a - b);
  const grid = el('div', { class: 'ws-grid', role: 'table', 'aria-label': `Class schedule, ${weekRangeLabel(monday)}` });
  grid.appendChild(el('div', { class: 'ws-corner', role: 'columnheader' }));
  DAY_ORDER.forEach((d) => grid.appendChild(dayHead(d, { monday, today, closed })));
  hours.forEach((h) => {
    grid.appendChild(el('div', { class: 'ws-hour', role: 'rowheader', text: fmtClassTime(String(h), { suffix: 'long' }) }));
    DAY_ORDER.forEach((d) => {
      const date = dateInWeek(monday, d);
      const here = sessions.filter((s) => s.day === d && hourOf(s.time) === h).sort((a, b) => timeKey(a.time) - timeKey(b.time));
      grid.appendChild(el('div', {
        class: `ws-cell${date < today ? ' is-past' : ''}${closed.has(date) ? ' is-closed' : ''}${date === today ? ' is-today' : ''}`,
        role: 'cell',
      }, here.map((s) => classItem(s, onClassClick))));
    });
  });

  // Point at a class and every other session of it stays lit while the rest fades: the colour finds its repeats.
  const light = (/** @type {string} */ key) => {
    grid.classList.toggle('has-focus', Boolean(key));
    grid.querySelectorAll('.ws-item').forEach((n) => n.classList.toggle('is-match', Boolean(key) && /** @type {HTMLElement} */ (n).dataset.key === key));
  };
  const keyAt = (/** @type {EventTarget|null} */ t) => (t instanceof Element ? /** @type {HTMLElement|null} */ (t.closest('.ws-item'))?.dataset.key || '' : '');
  grid.addEventListener('mouseover', (e) => light(keyAt(e.target)));
  grid.addEventListener('mouseleave', () => light(''));
  grid.addEventListener('focusin', (e) => light(keyAt(e.target)));
  grid.addEventListener('focusout', () => light(''));

  root.replaceChildren(el('div', { class: 'ws-week', 'data-section': section }, [
    hours.length
      ? el('div', { class: 'ws-card' }, [el('div', { class: 'ws-scroll' }, [grid])])
      : el('p', { class: 'ws-note', text: 'No classes match this filter.' }),
    el('footer', { class: 'ws-foot' }, [
      el('span', { text: 'No entry after 15 min.' }),
      onClassClick ? el('span', { text: 'Click a class for details.' }) : null,
    ]),
  ]));
}

// ── The day list (phone and tablet) ─────────────────────────────────────────────────────────────────────

/**
 * The same week as a list of days, for widths where seven columns do not fit: each day's kicker and title, then its
 * classes in one site card, in the grid's own class rows. The current week starts at today (yesterday's classes are no
 * use on the move); a later week shows every day. A day with no class is left out.
 * @param {HTMLElement} root
 * @param {{ sessions: any[], monday: string, today: string, closed: Map<string, any>, section: string, onClassClick?: (s: any) => void }} opts
 */
export function renderWeekList(root, { sessions, monday, today, closed, section, onClassClick }) {
  const days = DAY_ORDER
    .map((d) => ({ d, date: dateInWeek(monday, d), here: sessions.filter((s) => s.day === d).sort((a, b) => timeKey(a.time) - timeKey(b.time)) }))
    .filter(({ date, here }) => date >= today && here.length);
  root.replaceChildren(el('div', { class: 'ws-week ws-list', 'data-section': section }, [
    ...(days.length
      ? days.map(({ d, date, here }) => {
        const shut = closed.get(date);
        return el('section', { class: 'ws-day', 'aria-label': `${DAY_LONG[d]} ${shortDate(date)}` }, [
          el('div', { class: `ws-head${date === today ? ' is-today' : ''}${shut ? ' is-closed' : ''}` }, [
            el('span', { class: 'ws-kicker' }, [date === today ? el('span', { class: 'rule' }) : null, date === today ? `Today · ${shortDate(date)}` : shortDate(date)]),
            el('span', { class: 'ws-title', text: DAY_LONG[d] }),
            shut ? el('span', { class: 'ws-closed', text: `Gym closed${shut.reason ? `: ${shut.reason}` : ''}` }) : null,
          ]),
          el('div', { class: 'ws-card' }, here.map((s) => classItem(s, onClassClick))),
        ]);
      })
      : [el('p', { class: 'ws-note', text: 'No classes match this filter this week.' })]),
    el('footer', { class: 'ws-foot' }, [
      el('span', { text: 'No entry after 15 min.' }),
      onClassClick ? el('span', { text: 'Tap a class for details.' }) : null,
    ]),
  ]));
}

// ── The class popup (desktop) ────────────────────────────────────────────────────────────────────────────

/**
 * A site card over the page: the class's title over its colour rule, the date and time, the age, a notice when this
 * date is off, then the description. Appended to `host`; returns `open(session)`.
 * @param {HTMLElement} host
 */
export function mountClassPopup(host) {
  const title = el('h2', { class: 'ws-pop-title', id: 'ws-pop-title' });
  const close = el('button', { type: 'button', class: 'ws-pop-close', 'aria-label': 'Close' }, [icon('x-lg')]);
  const when = el('span', { class: 'ws-pop-value' });
  const age = el('span', { class: 'ws-pop-value' });
  const notice = el('div', { class: 'ws-pop-off', hidden: true });
  const desc = el('div', { class: 'ws-pop-desc', hidden: true });
  const row = (/** @type {string} */ label, /** @type {HTMLElement} */ value) => el('div', { class: 'ws-pop-row' }, [el('span', { class: 'ws-pop-label', text: label }), value]);
  const card = el('div', { class: 'ws-pop', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ws-pop-title' }, [
    close, title, notice, row('When', when), row('Age', age), desc,
  ]);
  const overlay = el('div', { class: 'ws-pop-overlay', hidden: true }, [card]);
  host.appendChild(overlay);

  /** @type {HTMLElement|null} */
  let opener = null;
  const shut = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    opener?.focus();
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) shut(); });
  close.addEventListener('click', shut);
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') shut(); });

  /** @param {any} s - a session of `sessionsForWeek` */
  return function open(s) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    card.style.setProperty('--pc', s.color || 'var(--ink)');
    title.textContent = s.disciplineName || '';
    when.textContent = `${dayAndDate(s.date)} · ${fmtClassTimeRange(s.time, s.endTime, { suffix: 'long', sep: ' – ' })}`;
    age.textContent = s.ageGroupName || '';
    notice.replaceChildren();
    notice.hidden = s.status === 'on';
    if (s.status !== 'on') {
      notice.append(
        el('strong', { text: s.status === 'closed' ? `Gym closed ${dayAndDate(s.date)}` : `Cancelled on ${dayAndDate(s.date)}` }),
        s.offReason ? el('span', { text: s.offReason }) : '',
        el('span', { class: 'ws-pop-next', text: 'Every other week runs as usual.' }),
      );
    }
    desc.hidden = !s.description;
    desc.innerHTML = s.description ? renderMarkdown(s.description) : '';
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    close.focus();
  };
}
