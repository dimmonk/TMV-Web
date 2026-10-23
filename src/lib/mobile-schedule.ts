/**
 * The phone Schedule screen's live class list: age-filter chips, the week bar over the visible weeks, the Schedule
 * changes card, then one card per day with its date. The schedule is the static public projection the members app
 * publishes, read through `fetchPublicSchedule()` (public-projections.js, a verbatim copy of the members app's
 * reader, which also resolves the NEW / ENDING badges; ADR-0154 in TMV-Members). The dates, staff's one-date
 * cancellations and closed days come from `schedule-weeks.js`, the same week the desktop grid draws.
 *
 * The day cards are generated here as markup (not in the .astro file), so their styles live in
 * src/styles/mobile-app.css; the week bar and changes card are the desktop's own (`schedule-week-view.js`), styled
 * for the phone in src/styles/schedule-web.css.
 */
import { matchesFilter, fmtClassTimeRange } from './print-schedule-sheet.js';
import { fetchPublicSchedule } from './public-projections.js';
import {
  gymToday, visibleWeeks, weekIndexOf, dateInWeek, shortDate, scheduleExceptions, sessionsForWeek, closedDaysOf,
  upcomingChanges, openGymSessions, timeKey,
} from './schedule-weeks.js';
import { weekBar, changesCard } from './schedule-week-view.js';

type SiteConfig = { hours: { day: string, time: string }[], closedDays: { date: string, reason: string }[] };

export function mountMobileSchedule({ siteConfig }: { siteConfig: () => Promise<SiteConfig> }) {
  const chipsEl = document.querySelector<HTMLElement>('[data-sched-chips]');
  const topEl = document.querySelector<HTMLElement>('[data-sched-weekbar]');
  const schedBody = document.querySelector<HTMLElement>('[data-sched-body]');
  if (!chipsEl || !topEl || !schedBody) return;
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const FILTERS: [string, string][] = [['all', 'All'], ['kids', 'Kids'], ['teens', 'Teens'], ['adults', 'Adults'], ['athletic', 'Athletic'], ['open-gym', 'Open Gym']];
  const fmtRange = (s: string, e: string) => fmtClassTimeRange(s, e, { suffix: 'long', sep: ' – ' });
  const today = gymToday();
  const weeks = visibleWeeks(today);
  let schedClasses: any[] | null = null;
  let exceptions: any[] = [];
  let hours: SiteConfig['hours'] = [];
  let schedErr = false;
  let schedFilter = 'all';
  // A link's ?date= (a Schedule changes date on another page) opens that date's week.
  let schedWeek = Math.max(0, weekIndexOf(weeks, new URLSearchParams(window.location.search).get('date') || ''));

  const escapeHtml = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

  function buildDays(filter: string) {
    const base = filter === 'open-gym' ? openGymSessions(hours) : (schedClasses || []).filter((c) => matchesFilter(c, filter));
    const monday = weeks[schedWeek];
    const list = sessionsForWeek(base, monday, exceptions);
    const closed = closedDaysOf(monday, exceptions);
    const days: any[] = [];
    DAY_ORDER.forEach((d) => {
      const date = dateInWeek(monday, d);
      // This week starts at today on the phone: yesterday's classes are no use on the move.
      if (date < today) return;
      const sessions = list.filter((c) => c.day === d).sort((a, b) => timeKey(a.time) - timeKey(b.time));
      if (!sessions.length) return;
      const shut = closed.get(date);
      days.push({
        label: `${date === today ? 'Today · ' : ''}${DAY_LONG[d]} · ${shortDate(date)}`,
        closed: shut ? `Closed${shut.reason ? ` · ${shut.reason}` : ''}` : '',
        sessions: sessions.map((c) => ({
          name: c.disciplineName || '', range: fmtRange(c.time, c.endTime),
          age: c.ageGroupName || '', color: c.color || '#2196f3',
          status: c.status, reason: c.offReason,
          isNew: !!c.isNew && !c.isEnding && c.status === 'on', isEnding: !!c.isEnding && c.status === 'on',
        })),
      });
    });
    return days;
  }
  function renderChips() {
    if (!chipsEl) return;
    chipsEl.innerHTML = FILTERS.map(([k, l]) => {
      const on = k === schedFilter;
      return `<button type="button" class="m-chip" data-filter="${k}" style="color:${on ? '#fff' : '#3a3833'};background:${on ? '#211f1b' : '#fff'};border:1px solid ${on ? '#211f1b' : '#e6e4dd'}">${l}</button>`;
    }).join('');
    chipsEl.querySelectorAll<HTMLElement>('[data-filter]').forEach((b) => b.addEventListener('click', () => { schedFilter = b.dataset.filter || 'all'; renderChips(); renderSchedule(); }));
  }
  function renderTop() {
    if (!topEl) return;
    topEl.hidden = !schedClasses;
    if (!schedClasses) { topEl.replaceChildren(); return; }
    const goTo = (week: number) => { schedWeek = week; renderSchedule(); };
    const card = changesCard({ changes: upcomingChanges(schedClasses, today, exceptions), onGoto: (date: string) => goTo(Math.max(0, weekIndexOf(weeks, date))) });
    topEl.replaceChildren(weekBar({ weeks, index: schedWeek, onStep: goTo }), ...(card ? [card] : []));
  }
  function renderSchedule() {
    if (!schedBody) return;
    renderTop();
    if (schedErr) {
      schedBody.innerHTML = `<div class="m-err"><i class="bi bi-wifi-off"></i><p>Couldn't reach the booking system.</p><button type="button" class="m-retry" data-sched-retry>Try again</button></div>`;
      schedBody.querySelector('[data-sched-retry]')?.addEventListener('click', loadSchedule);
      return;
    }
    if (!schedClasses) { schedBody.innerHTML = `<div class="m-loading"><span class="m-spin"></span><span>Loading live schedule…</span></div>`; return; }
    const days = buildDays(schedFilter);
    if (!days.length) { schedBody.innerHTML = `<div style="text-align:center;padding:44px 20px;font:italic 500 13.5px/1.5 inherit;color:#8a877f">No classes match this filter this week.</div>`; return; }
    schedBody.innerHTML = days.map((day) => `
      <div class="m-sched-day">
        <div class="m-sched-daylabel">${escapeHtml(day.label)}${day.closed ? `<span class="wk-daylabel-closed">${escapeHtml(day.closed)}</span>` : ''}</div>
        <div class="m-sched-card">
          ${day.sessions.map((s: any) => `
            <div class="m-sess" style="opacity:${s.status !== 'on' || s.isEnding ? '.55' : '1'}">
              <span class="m-sess-bar" style="background:${escapeHtml(s.color)}"></span>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center"><span class="m-sess-name" style="text-decoration:${s.status !== 'on' || s.isEnding ? 'line-through' : 'none'}">${escapeHtml(s.name)}</span>${s.isNew ? '<span class="m-sess-badge" style="color:#1b6b2f;background:#e6f4ea;border:1px solid #c7e4cf">New</span>' : ''}${s.isEnding ? '<span class="m-sess-badge" style="color:#8b1f1f;background:#fbeaea;border:1px solid #ecc6c6">Ending</span>' : ''}${s.status === 'cancelled' ? '<span class="m-sess-badge" style="color:#8b1f1f;background:#fbeaea;border:1px solid #ecc6c6">Cancelled</span>' : ''}${s.status === 'closed' ? '<span class="m-sess-badge" style="color:#8b1f1f;background:#fbeaea;border:1px solid #ecc6c6">Closed</span>' : ''}</div>
                <div class="m-sess-meta">${escapeHtml(s.range)} · ${escapeHtml(s.age)}</div>
                ${s.status === 'cancelled' && s.reason ? `<div class="wk-sess-reason">${escapeHtml(s.reason)}</div>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('') + `<div class="m-autonote"><i class="bi bi-arrow-repeat"></i><span>Times update automatically — the same schedule our front desk runs from.</span></div>`;
  }
  function loadSchedule() {
    schedErr = false; schedClasses = null; renderSchedule();
    Promise.all([fetchPublicSchedule(), siteConfig().catch((): SiteConfig => ({ hours: [], closedDays: [] }))])
      .then(([schedule, config]) => {
        hours = config.hours;
        exceptions = scheduleExceptions({ cancellations: schedule.cancellations, closedDays: config.closedDays });
        schedClasses = schedule.classes;
        renderSchedule();
      })
      .catch((e) => { console.warn('[schedule] load failed', e); schedErr = true; renderSchedule(); });
  }
  renderChips();
  loadSchedule();
}
