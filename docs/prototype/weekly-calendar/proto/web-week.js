// PROPOSED, not built: the schedule in the WEBSITE's look, the way the price list got its own (the 'web' variant of
// price-list-renderer.js, src/styles/price-list-web.css). Built only from parts the site already has: the price list's
// card (.pw-card look: white card, 2px category rule under the title, Archivo title, body-font rows), the eyebrow
// kicker and the price list's coloured rules (each class carries its colour as a rule down its left edge). Laid out as the printed sheet: hours down the left,
// days across, each class in its hour row (Steven 2026-10-22: one card per day lost the at-a-glance read).
// In the real build this is the 'web' variant of print-schedule-sheet.js; the printed sheet and PDF keep the poster.
import { fmtClassTime, fmtClassTimeRange } from '../../../../src/lib/print-schedule-sheet.js';
import { dateInWeek, shortDate } from './week.js';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const fmtRange = (s, e) => fmtClassTimeRange(s, e, { suffix: 'long', sep: '–' });
const hourOf = (t) => parseInt(String(t), 10) || 0;
const minutes = (t) => { const [h, m] = String(t || '').split(':'); return (parseInt(h, 10) || 0) * 60 + (parseInt(m || '0', 10) || 0); };

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className = v;
    else if (k === 'style') Object.entries(v).forEach(([p, val]) => node.style.setProperty(p, val));
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children) if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return node;
}

function tagFor(s) {
  if (s.status === 'cancelled') return el('span', { class: 'ws-tag is-off', text: 'Cancelled' });
  if (s.isCancelled) return el('span', { class: 'ws-tag', text: 'Ending' });
  if (s.isNew) return el('span', { class: 'ws-tag is-new', text: 'New' });
  return null;
}

function classItem(s, onClick) {
  const off = s.status === 'cancelled' || s.status === 'closed';
  const btn = el('button', {
    type: 'button',
    class: `ws-item${off ? ' is-off' : ''}`,
    style: { '--k': s.color || 'var(--c)' },
    'data-key': s.color || '',
    'aria-label': `${s.disciplineName}, ${s.ageGroupName}, ${fmtRange(s.time, s.endTime)}${off ? ', cancelled' : ''}`,
  }, [
    el('span', { class: 'ws-name', text: s.disciplineName || '' }),
    el('span', { class: 'ws-age' }, [s.ageGroupName || '']),
    el('span', { class: 'ws-when' }, [fmtRange(s.time, s.endTime), tagFor(s)]),
  ]);
  if (onClick) btn.addEventListener('click', () => onClick(s));
  return btn;
}

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
 * Draw one dated week: hours down the left, days across, each class in its hour row (the printed sheet's grid).
 * @param {HTMLElement} root
 * @param {{ sessions: any[], monday: string, today: string, closed: Map<string, any>, section: string, onClassClick?: Function }} opts
 *   `section` picks the category colour of the day rules, as the price list does (classes | athletic | open_gym).
 */
export function renderWebWeek(root, { sessions, monday, today, closed, section, onClassClick }) {
  const hours = [...new Set(sessions.map((s) => hourOf(s.time)))].sort((a, b) => a - b);
  const grid = el('div', { class: 'ws-grid', role: 'table', 'aria-label': 'Class schedule' });
  grid.appendChild(el('div', { class: 'ws-corner', role: 'columnheader' }));
  DAY_ORDER.forEach((d) => grid.appendChild(dayHead(d, { monday, today, closed })));
  hours.forEach((h) => {
    grid.appendChild(el('div', { class: 'ws-hour', role: 'rowheader', text: fmtClassTime(h, { suffix: 'long' }) }));
    DAY_ORDER.forEach((d) => {
      const date = dateInWeek(monday, d);
      const here = sessions.filter((s) => s.day === d && hourOf(s.time) === h).sort((a, b) => minutes(a.time) - minutes(b.time));
      grid.appendChild(el('div', {
        class: `ws-cell${date < today ? ' is-past' : ''}${closed.has(date) ? ' is-closed' : ''}${date === today ? ' is-today' : ''}`,
        role: 'cell',
      }, here.map((s) => classItem(s, onClassClick))));
    });
  });

  // Point at a class and every other session of it stays lit while the rest fades: the colour finds its repeats.
  const light = (key) => {
    grid.classList.toggle('has-focus', Boolean(key));
    grid.querySelectorAll('.ws-item').forEach((n) => n.classList.toggle('is-match', Boolean(key) && n.dataset.key === key));
  };
  grid.addEventListener('mouseover', (e) => light(e.target.closest('.ws-item')?.dataset.key || ''));
  grid.addEventListener('mouseleave', () => light(''));
  grid.addEventListener('focusin', (e) => light(e.target.closest('.ws-item')?.dataset.key || ''));
  grid.addEventListener('focusout', () => light(''));

  root.innerHTML = '';
  root.appendChild(el('div', { class: 'ws-week', 'data-section': section }, [
    hours.length ? el('div', { class: 'ws-card' }, [el('div', { class: 'ws-scroll' }, [grid])]) : el('p', { class: 'ws-note', text: 'No classes match this filter.' }),
    el('footer', { class: 'ws-foot' }, [
      el('span', { text: 'Classes run 60 min unless shown. No entry after 15 min; Open Gym is always available.' }),
      el('span', { text: 'Tap a class for details.' }),
    ]),
  ]));
}
