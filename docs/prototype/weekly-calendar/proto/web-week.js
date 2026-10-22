// PROPOSED, not built: the schedule in the WEBSITE's look, the way the price list got its own (the 'web' variant of
// price-list-renderer.js, src/styles/price-list-web.css). Built only from parts the site already has: the price list's
// card (.pw-card look: white card, 2px category rule under the title, Archivo title, body-font rows), the eyebrow
// kicker and the coloured dot of the "Which one is you?" cards. One card per day, classes listed in time order.
// In the real build this is the 'web' variant of print-schedule-sheet.js; the printed sheet and PDF keep the poster.
import { fmtClassTimeRange } from '../../../../src/lib/print-schedule-sheet.js';
import { dateInWeek, shortDate } from './week.js';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const fmtRange = (s, e) => fmtClassTimeRange(s, e, { suffix: 'long', sep: '–' });
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

function classRow(s, onClick) {
  const off = s.status === 'cancelled' || s.status === 'closed';
  const btn = el('button', {
    type: 'button',
    class: `ws-item${off ? ' is-off' : ''}`,
    'aria-label': `${s.disciplineName}, ${s.ageGroupName}, ${fmtRange(s.time, s.endTime)}${off ? ', cancelled' : ''}`,
  }, [
    el('span', { class: 'ws-time', text: fmtRange(s.time, s.endTime) }),
    el('span', { class: 'ws-name' }, [
      el('span', { class: 'ws-dot', style: { background: s.color || 'var(--c)' }, 'aria-hidden': 'true' }),
      s.disciplineName || '',
    ]),
    el('span', { class: 'ws-age' }, [s.ageGroupName || '', tagFor(s)]),
  ]);
  if (onClick && !off) btn.addEventListener('click', () => onClick(s));
  return el('li', {}, [btn]);
}

function dayCard(d, { sessions, monday, today, closed, onClassClick }) {
  const date = dateInWeek(monday, d);
  const isToday = date === today;
  const shut = closed.get(date);
  const here = sessions.filter((s) => s.day === d).sort((a, b) => minutes(a.time) - minutes(b.time));
  const body = shut
    ? el('p', { class: 'ws-note is-closed', text: `Gym closed${shut.reason ? `: ${shut.reason}` : ''}` })
    : here.length
      ? el('ul', { class: 'ws-items' }, here.map((s) => classRow(s, onClassClick)))
      : el('p', { class: 'ws-note', text: 'No classes' });
  return el('section', {
    class: `ws-day${isToday ? ' is-today' : ''}${date < today ? ' is-past' : ''}${shut ? ' is-closed' : ''}`,
    'aria-label': `${DAY_LONG[d]} ${shortDate(date)}`,
  }, [
    el('header', { class: 'ws-head' }, [
      el('span', { class: 'ws-kicker' }, [isToday ? el('span', { class: 'rule' }) : null, isToday ? `Today · ${shortDate(date)}` : shortDate(date)]),
      el('h3', { class: 'ws-title', text: DAY_LONG[d] }),
    ]),
    body,
  ]);
}

/**
 * Draw one dated week as seven day cards.
 * @param {HTMLElement} root
 * @param {{ sessions: any[], monday: string, today: string, closed: Map<string, any>, section: string, onClassClick?: Function }} opts
 *   `section` picks the category colour of the card rule, as the price list does (classes | athletic | open_gym).
 */
export function renderWebWeek(root, { sessions, monday, today, closed, section, onClassClick }) {
  root.innerHTML = '';
  root.appendChild(el('div', { class: 'ws-week', 'data-section': section }, [
    el('div', { class: 'ws-grid' }, DAY_ORDER.map((d) => dayCard(d, { sessions, monday, today, closed, onClassClick }))),
    el('footer', { class: 'ws-foot' }, [
      el('span', { text: 'Classes run 60 min unless shown. No entry after 15 min; Open Gym is always available.' }),
      el('span', { text: 'Tap a class for details.' }),
    ]),
  ]));
}
