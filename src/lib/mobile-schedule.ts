/**
 * The phone Schedule screen's live class list — extracted verbatim from the /m/
 * app so the mobile schedule behaves exactly as it did: age-filter chips, live
 * fetch from the booking system, per-day cards, retry on failure.
 *
 * Markup is generated here (not in the .astro file), so its styles live in
 * src/styles/mobile-app.css rather than being component-scoped.
 */

export function mountMobileSchedule() {
  const chipsEl = document.querySelector<HTMLElement>('[data-sched-chips]');
  const schedBody = document.querySelector<HTMLElement>('[data-sched-body]');
  if (!chipsEl || !schedBody) return;
  const SCHEDULE_API = 'https://us-central1-tmv-management.cloudfunctions.net/getPublicSchedule';
  let _matchesFilter: (c: any, f: string) => boolean;
  let _fmtRange: (s: string, e: string) => string;
  // ---- schedule (live SSOT via src/lib) ----
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const FILTERS: [string, string][] = [['all', 'All'], ['kids', 'Kids'], ['teens', 'Teens'], ['adults', 'Adults'], ['athletic', 'Athletic'], ['open-gym', 'Open Gym']];
  let schedClasses: any[] | null = null;
  let schedErr = false;
  let schedFilter = 'all';
  let schedStarted = false;

  const escapeHtml = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

  function openGymEntries() {
    const out: any[] = [];
    DAY_ORDER.forEach((d) => {
      out.push({ day: d, time: '11', endTime: '22', disciplineName: 'Open Gym', ageGroupName: 'All Ages', color: '#2e9e4f' });
      if (d === 5) out.push({ day: d, time: '22', endTime: '24', disciplineName: 'Open Gym', ageGroupName: 'Adults Only', color: '#2e7d32' });
    });
    return out;
  }
  function buildDays(filter: string) {
    const list = filter === 'open-gym' ? openGymEntries() : (schedClasses || []).filter((c) => _matchesFilter(c, filter));
    const today = new Date().getDay();
    const key = (t: string) => { const [h, m] = String(t || '').split(':'); return (parseInt(h, 10) || 0) * 60 + (parseInt(m || '0', 10) || 0); };
    const days: any[] = [];
    DAY_ORDER.forEach((d) => {
      const sessions = list.filter((c) => c.day === d).sort((a, b) => key(a.time) - key(b.time));
      if (!sessions.length) return;
      days.push({
        label: (d === today ? 'Today · ' : '') + DAY_LONG[d],
        sessions: sessions.map((c) => ({
          name: c.disciplineName || '', range: _fmtRange(c.time, c.endTime),
          age: c.ageGroupName || '', color: c.color || '#2196f3',
          isNew: !!c.isNew && !c.isCancelled, isCancelled: !!c.isCancelled,
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
  function renderSchedule() {
    if (!schedBody) return;
    if (schedErr) {
      schedBody.innerHTML = `<div class="m-err"><i class="bi bi-wifi-off"></i><p>Couldn't reach the booking system.</p><button type="button" class="m-retry" data-sched-retry>Try again</button></div>`;
      schedBody.querySelector('[data-sched-retry]')?.addEventListener('click', loadSchedule);
      return;
    }
    if (!schedClasses) { schedBody.innerHTML = `<div class="m-loading"><span class="m-spin"></span><span>Loading live schedule…</span></div>`; return; }
    const days = buildDays(schedFilter);
    if (!days.length) { schedBody.innerHTML = `<div style="text-align:center;padding:44px 20px;font:italic 500 13.5px/1.5 inherit;color:#8a877f">No classes match this filter.</div>`; return; }
    schedBody.innerHTML = days.map((day) => `
      <div class="m-sched-day">
        <div class="m-sched-daylabel">${escapeHtml(day.label)}</div>
        <div class="m-sched-card">
          ${day.sessions.map((s: any) => `
            <div class="m-sess" style="opacity:${s.isCancelled ? '.55' : '1'}">
              <span class="m-sess-bar" style="background:${s.color}"></span>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center"><span class="m-sess-name" style="text-decoration:${s.isCancelled ? 'line-through' : 'none'}">${escapeHtml(s.name)}</span>${s.isNew ? '<span class="m-sess-badge" style="color:#1b6b2f;background:#e6f4ea;border:1px solid #c7e4cf">New</span>' : ''}${s.isCancelled ? '<span class="m-sess-badge" style="color:#8b1f1f;background:#fbeaea;border:1px solid #ecc6c6">Ending</span>' : ''}</div>
                <div class="m-sess-meta">${escapeHtml(s.range)} · ${escapeHtml(s.age)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('') + `<div class="m-autonote"><i class="bi bi-arrow-repeat"></i><span>Times update automatically — the same schedule our front desk runs from.</span></div>`;
  }
  function loadSchedule() {
    schedErr = false; schedClasses = null; renderSchedule();
    Promise.all([
      import('./print-schedule-sheet.js'),
      fetch(SCHEDULE_API).then((r) => r.json()),
    ])
      .then(([mod, json]) => {
        _matchesFilter = mod.matchesFilter;
        _fmtRange = (s: string, e: string) => mod.fmtClassTimeRange(s, e, { suffix: 'long', sep: ' – ' });
        schedClasses = (json && json.success && json.data && json.data.classes) || [];
        renderSchedule();
      })
      .catch((e) => { console.warn('[schedule] load failed', e); schedErr = true; renderSchedule(); });
  }
  function ensureSchedule() { if (schedStarted) return; schedStarted = true; renderChips(); loadSchedule(); }
  ensureSchedule();
}
