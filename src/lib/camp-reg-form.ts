/**
 * Camp registration form — the single implementation, mounted by
 * src/pages/camp-registration.astro. Ported from the design handoff v2
 * (CampRegForm.dc.html), with the site-owner's per-day expiry merged in.
 *
 * Call mountCampRegForm(container, opts) once per container. All state is
 * per-mount (closure), so separate mounts never share state. Styles live in
 * src/styles/camp-reg-form.css (import it in whichever page mounts this).
 *
 * Prices are the documented camp defaults; Square checkout is stubbed —
 * "Register & pay" advances to the printable confirmation without a real charge.
 */
export interface CampRegFormOptions {
  /** waiver signing URL */
  waiverUrl: string;
  /** private-day booking URL */
  bookingUrl: string;
  /** facility address line for the confirmation footer */
  address: string;
  /** category/identity accent (selection, checks, prices, icons). Not CTAs. */
  accent?: string;
  /** show the dark hero band. Hosts that supply their own header opt out. */
  showHero?: boolean;
}

interface WeekDef {
  id: string; n: string; dates: string; monday: string;
  days: string[]; partial?: boolean; month?: string; nums: Record<string, string>;
}
interface WeekEntry { days: Record<string, boolean>; late: Record<string, boolean>; }
interface Kid {
  id: string; name: string; age: string; allergies: string; notes: string;
  waiver: 'unset' | 'yes' | 'no'; waiverDone: boolean;
  camp: 'weekly' | 'paday' | 'private';
  weeks: Record<string, WeekEntry>; paDates: Record<string, { late: boolean }>;
}

export function mountCampRegForm(root: HTMLElement, opts: CampRegFormOptions): void {
  const WAIVER_URL = opts.waiverUrl;
  const BOOKING_URL = opts.bookingUrl;
  const ADDRESS = opts.address;
  const accent = opts.accent ?? '#e27902';
  const showHero = opts.showHero ?? true;

  root.classList.add('reg-root');
  root.style.setProperty('--acc', accent);
  root.style.fontFamily = "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif";
  root.style.color = '#211f1b';

  // ---- pricing model (documented camp defaults) ----
  const PL: Record<string, number> = {
    campWeekly: 350, campDaily: 90, camp2Days: 170, camp3Days: 240, camp4Days: 300,
    campPADay: 90, campPrivateDay: 90, latePickupPerDay: 20, latePickupBulk: 75,
  };
  const DYC = true; // day-camp late-pickup add-on enabled
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // `monday` = the Monday of each week; every camp day's real date derives from
  // it (used for per-day expiry). Week 6's Monday is Aug 3, the skipped Civic
  // Holiday. `nums` = day-of-month per weekday for the calendar cells; a weekday
  // missing from `days` is a stat holiday (rendered as a disabled "–" cell).
  const WEEKS: WeekDef[] = [
    { id:'w1', n:'Week 1', dates:'Jun 29 – Jul 3', monday:'2026-06-29', days:['Mon','Tue','Thu','Fri'], partial:true, month:'July', nums:{ Mon:'29', Tue:'30', Thu:'2', Fri:'3' } },
    { id:'w2', n:'Week 2', dates:'Jul 6 – 10', monday:'2026-07-06', days:['Mon','Tue','Wed','Thu','Fri'], nums:{ Mon:'6', Tue:'7', Wed:'8', Thu:'9', Fri:'10' } },
    { id:'w3', n:'Week 3', dates:'Jul 13 – 17', monday:'2026-07-13', days:['Mon','Tue','Wed','Thu','Fri'], nums:{ Mon:'13', Tue:'14', Wed:'15', Thu:'16', Fri:'17' } },
    { id:'w4', n:'Week 4', dates:'Jul 20 – 24', monday:'2026-07-20', days:['Mon','Tue','Wed','Thu','Fri'], nums:{ Mon:'20', Tue:'21', Wed:'22', Thu:'23', Fri:'24' } },
    { id:'w5', n:'Week 5', dates:'Jul 27 – 31', monday:'2026-07-27', days:['Mon','Tue','Wed','Thu','Fri'], nums:{ Mon:'27', Tue:'28', Wed:'29', Thu:'30', Fri:'31' } },
    { id:'w6', n:'Week 6', dates:'Aug 4 – 7', monday:'2026-08-03', days:['Tue','Wed','Thu','Fri'], partial:true, month:'August', nums:{ Tue:'4', Wed:'5', Thu:'6', Fri:'7' } },
    { id:'w7', n:'Week 7', dates:'Aug 10 – 14', monday:'2026-08-10', days:['Mon','Tue','Wed','Thu','Fri'], nums:{ Mon:'10', Tue:'11', Wed:'12', Thu:'13', Fri:'14' } },
    { id:'w8', n:'Week 8', dates:'Aug 17 – 21', monday:'2026-08-17', days:['Mon','Tue','Wed','Thu','Fri'], nums:{ Mon:'17', Tue:'18', Wed:'19', Thu:'20', Fri:'21' } },
    { id:'w9', n:'Week 9', dates:'Aug 24 – 28', monday:'2026-08-24', days:['Mon','Tue','Wed','Thu','Fri'], nums:{ Mon:'24', Tue:'25', Wed:'26', Thu:'27', Fri:'28' } },
  ];
  const PADATES = [
    { id:'pa1', label:'Fri · Oct 10' },
    { id:'pa2', label:'Fri · Nov 21' },
    { id:'pa3', label:'Fri · Jan 16' },
  ];

  // Per-day expiry: a camp day closes at the END of that day (so same-day
  // signup works); a whole week is "Closed" only once every day has passed.
  const DAY_OFFSET: Record<string, number> = { Mon:0, Tue:1, Wed:2, Thu:3, Fri:4 };
  const dayStart = (w: WeekDef, d: string) => { const dt = new Date(w.monday + 'T00:00:00'); dt.setDate(dt.getDate() + DAY_OFFSET[d]); return dt; };
  const dayExpired = (w: WeekDef, d: string) => { const end = dayStart(w, d); end.setDate(end.getDate() + 1); return Date.now() >= end.getTime(); };
  const openDays = (w: WeekDef) => w.days.filter((d) => !dayExpired(w, d));
  const weekExpired = (w: WeekDef) => openDays(w).length === 0;

  const daysPrice = (n: number) => { if (n <= 0) return 0; const key = ['campDaily','camp2Days','camp3Days','camp4Days','campWeekly'][Math.min(n,5)-1]; return PL[key]; };
  // Full week bills only the still-open days (all open = weekly rate).
  const weekFull = (w: WeekDef) => daysPrice(openDays(w).length);
  const lateCost = (n: number) => { if (n <= 0) return 0; return n >= 4 ? PL.latePickupBulk : n * PL.latePickupPerDay; };
  const waiverOk = (k: Kid) => k.waiver === 'yes' || (k.waiver === 'no' && k.waiverDone);
  const money = (n: number) => '$' + n.toLocaleString('en-US');
  const esc = (s: unknown) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  // ---- state ----
  let seq = 1;
  const blankKid = (id: string): Kid => ({ id, name:'', age:'', allergies:'', notes:'', waiver:'unset', waiverDone:false, camp:'weekly', weeks:{}, paDates:{} });
  const state = {
    stage: 'build' as 'build' | 'confirm',
    kids: [blankKid('k1')] as Kid[],
    expanded: 'k1' as string | null,
    parent: { name:'', email:'', phone:'' },
    error: '',
    mSumOpen: false,
    ref: '',
  };
  const kidById = (id: string | undefined) => state.kids.find((k) => k.id === id);

  // ---- pricing per child (attend excludes passed days) ----
  interface Line { title?: string; dates?: string; days?: string; label?: string; amount: number; sub?: boolean; }
  function computeKid(k: Kid): { lines: Line[]; total: number } {
    const lines: Line[] = []; let total = 0;
    if (k.camp === 'weekly') {
      WEEKS.forEach((w) => {
        const e = k.weeks[w.id]; if (!e) return;
        const attend = w.days.filter((d) => e.days[d] && !dayExpired(w, d));
        if (attend.length === 0) return;
        const base = daysPrice(attend.length);
        const detail = attend.length === openDays(w).length ? 'full week' : attend.join(', ');
        lines.push({ title:w.n, dates:w.dates, days:detail, amount:base }); total += base;
        const lateDays = attend.filter((d) => e.late[d]);
        if (lateDays.length > 0) { const lc = lateCost(lateDays.length); lines.push({ title:'Late pickup', days:lateDays.join(', '), amount:lc, sub:true }); total += lc; }
      });
    } else if (k.camp === 'paday') {
      PADATES.forEach((p) => {
        const e = k.paDates[p.id]; if (!e) return;
        lines.push({ label:'P.A. Day · ' + p.label, amount:PL.campPADay }); total += PL.campPADay;
        if (DYC && e.late) { lines.push({ label:'· late pickup to 4 PM', amount:PL.latePickupPerDay, sub:true }); total += PL.latePickupPerDay; }
      });
    }
    return { lines, total };
  }
  const grandTotal = () => state.kids.reduce((a, k) => a + computeKid(k).total, 0);

  // ---- summary line items (shared: desktop card, mobile sheet, receipt) ----
  interface SummaryLine { label?: string; title?: string; dates?: string; days?: string; amount: string; color: string; mt: string; }
  function summaryKidsData(): { name: string; lines: SummaryLine[] }[] {
    return state.kids
      .map((k, ki) => ({ k, ki, comp: computeKid(k) }))
      .filter((x) => x.comp.lines.length > 0)
      .map((x) => ({
        name: x.k.name.trim() || ('Camper ' + (x.ki + 1)),
        lines: x.comp.lines.map((l, li): SummaryLine => ({
          label: l.label, title: l.title, dates: l.dates, days: l.days, amount: money(l.amount),
          color: l.sub ? '#9b9890' : '#3a3833', mt: li === 0 ? '0px' : (l.sub ? '3px' : '13px'),
        })),
      }));
  }
  function summaryLineHTML(ln: SummaryLine) {
    const left = ln.title
      ? `<strong style="font-weight:800;">${esc(ln.title)}</strong>${ln.dates ? ' · ' + esc(ln.dates) : ''}`
      : esc(ln.label);
    const daysLine = ln.days ? `<div style="color:#9b9890; font-size:11.5px; margin-top:1px;">${esc(ln.days)}</div>` : '';
    return `<div style="font:600 12.5px/1.55 inherit; color:${ln.color}; margin-top:${ln.mt};">
      <div style="display:flex; justify-content:space-between; gap:12px;"><span>${left}</span><span style="white-space:nowrap;">${ln.amount}</span></div>
      ${daysLine}
    </div>`;
  }
  function summaryBlockHTML() {
    const kids = summaryKidsData();
    if (kids.length === 0) return `<p style="font:500 13px/1.5 inherit; color:#9b9890; margin:0;">Pick a camp and some days to see your total here.</p>`;
    return `<div style="display:flex; flex-direction:column; gap:16px;">` + kids.map((s) => `<div>
      <div style="font:800 12px/1 'Archivo',sans-serif; color:#a2601f; margin-bottom:8px; text-transform:uppercase; letter-spacing:.03em;">${esc(s.name)}</div>
      ${s.lines.map(summaryLineHTML).join('')}
    </div>`).join('') + `</div>`;
  }

  // ---- one child card ----
  function kidCardHTML(k: Kid, ki: number) {
    const comp = computeKid(k);
    const isExp = state.expanded === k.id;
    const isPrivate = k.camp === 'private';
    const initial = (k.name.trim()[0] || (ki + 1)).toString().toUpperCase();
    const displayName = k.name.trim() || ('Camper ' + (ki + 1));
    let summaryLine: string;
    if (isPrivate) summaryLine = 'Private day · booked by appointment';
    else if (k.camp === 'weekly') { const n = Object.keys(k.weeks).length; summaryLine = n ? ('Weekly Camp · ' + n + ' week' + (n>1?'s':'')) : 'Weekly Camp — pick weeks'; }
    else { const n = Object.keys(k.paDates).length; summaryLine = n ? ('P.A. Day · ' + n + ' day' + (n>1?'s':'')) : 'P.A. Day — pick dates'; }
    const priceLabel = (isPrivate || comp.total === 0) ? '' : money(comp.total);
    const cardBorder = isExp ? 'var(--acc)' : '#eae7df';
    const headBg = isExp ? '#fffdf9' : '#fff';

    const removeBtn = state.kids.length > 1
      ? `<span class="reg-x" data-act="removeKid" data-kid="${k.id}" title="Remove" style="flex:none; width:28px; height:28px; border-radius:8px; background:#f3f2ee; color:#9b9890; display:flex; align-items:center; justify-content:center; font-size:13px;"><i class="bi bi-trash"></i></span>`
      : '';
    const head = `<div class="reg-khead" data-act="toggleExpand" data-kid="${k.id}" style="display:flex; align-items:center; gap:12px; padding:14px 16px; background:${headBg};">
      <span style="flex:none; width:36px; height:36px; border-radius:10px; background:var(--acc); color:#fff; display:flex; align-items:center; justify-content:center; font:900 15px/1 'Archivo',sans-serif;">${esc(initial)}</span>
      <div style="flex:1; min-width:0;">
        <div style="font:800 15.5px/1.1 'Archivo',sans-serif;">${esc(displayName)}</div>
        <div style="font:600 12px/1.3 inherit; color:#8a877f; margin-top:3px;">${esc(summaryLine)}</div>
      </div>
      <span style="flex:none; font:900 16px/1 'Archivo',sans-serif; color:var(--acc);">${priceLabel}</span>
      ${removeBtn}
      <i class="bi ${isExp ? 'bi-chevron-up' : 'bi-chevron-down'}" style="flex:none; color:#b0aca3;"></i>
    </div>`;

    if (!isExp) return `<div style="background:#fff; border:1.5px solid ${cardBorder}; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(28,25,23,.05),0 14px 30px -26px rgba(28,25,23,.4);">${head}</div>`;

    const campChips = ([['weekly','Weekly'],['paday','P.A. Day'],['private','Private Day']] as [string, string][]).map(([val,label]) => {
      if (k.camp === val) return `<span class="reg-chip" data-act="setCamp" data-kid="${k.id}" data-camp="${val}" style="display:inline-flex; align-items:center; gap:7px; padding:10px 14px; border-radius:11px; border:1.5px solid var(--acc); background:#fff7ef; font:800 13px/1 'Archivo',sans-serif;"><i class="bi bi-check-circle-fill" style="color:var(--acc);"></i>${label}</span>`;
      return `<span class="reg-chip" data-act="setCamp" data-kid="${k.id}" data-camp="${val}" style="display:inline-flex; align-items:center; padding:10px 14px; border-radius:11px; border:1.5px solid #e5e2db; background:#fff; font:700 13px/1 'Archivo',sans-serif; color:#5b5853;">${label}</span>`;
    }).join('');
    const campBlock = `<div>
      <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin:12px 0 9px;">Camp</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">${campChips}</div>
    </div>`;

    let flow = '';
    if (k.camp === 'weekly') flow = weeklyFlowHTML(k);
    else if (k.camp === 'paday') flow = padayFlowHTML(k);
    else flow = privateFlowHTML();
    const details = isPrivate ? '' : camperDetailsHTML(k);

    return `<div style="background:#fff; border:1.5px solid ${cardBorder}; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(28,25,23,.05),0 14px 30px -26px rgba(28,25,23,.4);">
      ${head}
      <div style="padding:6px 16px 18px; display:flex; flex-direction:column; gap:18px;">
        ${campBlock}
        ${flow}
        ${details}
      </div>
    </div>`;
  }

  // ---- weekly flow: calendar rows ----
  function dayCellHTML(k: Kid, w: WeekDef, d: string) {
    const letter = d[0];
    const num = w.nums[d] || '';
    const hol = w.days.indexOf(d) === -1;
    if (hol) return `<span title="Holiday — no camp" style="width:40px; padding:6px 0 7px; text-align:center; border-radius:9px; background:#f3f2ee; border:1.5px solid #f3f2ee;"><span style="display:block; font:700 8.5px/1 'Archivo',sans-serif; letter-spacing:.04em; color:#c9c4b8;">${letter}</span><span style="display:block; font:800 13.5px/1 'Archivo',sans-serif; color:#c9c4b8; margin-top:3px;">–</span></span>`;
    if (dayExpired(w, d)) return `<span title="This day has passed" style="width:40px; padding:6px 0 7px; text-align:center; border-radius:9px; background:#f3f2ee; border:1.5px solid #eae7df; cursor:not-allowed;"><span style="display:block; font:700 8.5px/1 'Archivo',sans-serif; letter-spacing:.04em; color:#c9c4b8;">${letter}</span><span style="display:block; font:800 13.5px/1 'Archivo',sans-serif; color:#c4c0b7; margin-top:3px; text-decoration:line-through;">${num}</span></span>`;
    const e = k.weeks[w.id];
    const on = !!(e && e.days[d]);
    const cellStyle = on
      ? `width:40px; padding:6px 0 7px; text-align:center; border-radius:9px; background:var(--acc); border:1.5px solid var(--acc); color:#fff;`
      : `width:40px; padding:6px 0 7px; text-align:center; border-radius:9px; background:#fff; border:1.5px solid #e0dcd3;`;
    const letterStyle = on ? `opacity:.75;` : `color:#b0aca3;`;
    const numStyle = on ? `` : `color:#5b5853;`;
    return `<span class="reg-pill" data-act="weekDay" data-kid="${k.id}" data-week="${w.id}" data-day="${d}" style="${cellStyle}"><span style="display:block; font:700 8.5px/1 'Archivo',sans-serif; letter-spacing:.04em; ${letterStyle}">${letter}</span><span style="display:block; font:800 13.5px/1 'Archivo',sans-serif; margin-top:3px; ${numStyle}">${num}</span></span>`;
  }

  function weekRowHTML(k: Kid, w: WeekDef) {
    const closed = weekExpired(w);
    const e = k.weeks[w.id];
    const attend = e ? w.days.filter((d) => e.days[d] && !dayExpired(w, d)) : [];
    const sel = attend.length > 0;
    const rowBorder = sel ? 'var(--acc)' : '#ece9e2';

    let priceLabel: string, priceColor: string;
    if (closed) { priceLabel = 'Closed'; priceColor = '#9b9890'; }
    else if (sel) { priceLabel = money(computeKid({ ...k, camp:'weekly', weeks:{ [w.id]:e } }).total); priceColor = 'var(--acc)'; }
    else { priceLabel = money(weekFull(w)); priceColor = '#9b9890'; }

    const fourDay = w.partial ? `<span style="flex:none; font:700 8.5px/1 'Archivo',sans-serif; letter-spacing:.05em; text-transform:uppercase; color:#a2601f; background:#fff2e2; padding:4px 6px; border-radius:5px;">4-day</span>` : '';
    const labelClass = closed ? 'reg-wklabel' : 'reg-pill reg-wklabel';
    const labelData = closed ? '' : `data-act="toggleWeek" data-kid="${k.id}" data-week="${w.id}"`;
    const label = `<div class="${labelClass}" ${labelData}>
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
        <div style="font:800 13px/1.1 'Archivo',sans-serif;">${w.n}</div>
        ${fourDay}
      </div>
      <div class="reg-wkprice" style="font:800 12.5px/1 'Archivo',sans-serif; color:${priceColor}; margin-top:6px;">${priceLabel}</div>
    </div>`;

    const cells = `<div class="reg-wkcells">${DAYS.map((d) => dayCellHTML(k, w, d)).join('')}</div>`;

    let lateRow = '';
    if (sel && !closed) {
      const lateN = attend.filter((d) => e.late[d]).length;
      const lateLabel = lateN > 0 ? ('+' + money(lateCost(lateN)) + (lateN >= 4 ? ' (capped)' : '')) : '';
      const latePills = DAYS.map((d) => {
        const active = !!(e && e.days[d]) && w.days.indexOf(d) !== -1 && !dayExpired(w, d);
        if (!active) return `<span style="width:40px; visibility:hidden;"></span>`;
        const on = !!e.late[d];
        return on
          ? `<span class="reg-pill" data-act="weekLate" data-kid="${k.id}" data-week="${w.id}" data-day="${d}" style="width:40px; padding:8px 0; text-align:center; border-radius:8px; background:#211f1b; border:1.5px solid #211f1b; color:#ffd400; font:800 11px/1 'Archivo',sans-serif;">${d[0]}</span>`
          : `<span class="reg-pill" data-act="weekLate" data-kid="${k.id}" data-week="${w.id}" data-day="${d}" style="width:40px; padding:8px 0; text-align:center; border-radius:8px; background:#fff; border:1.5px solid #e0dcd3; color:#8a877f; font:800 11px/1 'Archivo',sans-serif;">${d[0]}</span>`;
      }).join('');
      lateRow = `<div class="reg-latrow">
        <div class="reg-wklabel">
          <div style="font:600 12px/1.4 inherit; color:#8a877f;">Late pickup to 4 PM</div>
          ${lateLabel ? `<div class="reg-wkprice" style="font:800 11.5px/1 'Archivo',sans-serif; color:var(--acc); margin-top:4px;">${lateLabel}</div>` : ''}
        </div>
        <div class="reg-wkcells">${latePills}</div>
      </div>`;
    }

    const divider = w.month ? `<div style="display:flex; align-items:center; gap:10px; margin:5px 0 -1px;"><span style="font:800 11px/1 'Archivo',sans-serif; letter-spacing:.09em; text-transform:uppercase;">${w.month}</span><span style="flex:1; height:1px; background:#e8e5dd;"></span></div>` : '';
    return `${divider}<div style="border:1px solid ${rowBorder}; border-radius:12px; overflow:hidden;"><div class="reg-wkrow">${label}${cells}</div>${lateRow}</div>`;
  }

  function weeklyFlowHTML(k: Kid) {
    const rows = WEEKS.map((w) => weekRowHTML(k, w)).join('');
    return `<div>
      <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:6px;">Pick your days</div>
      <div style="font:600 12px/1.4 inherit; color:#a8a49b; margin-bottom:10px;">Tap days — or tap a week's name to take the whole week.</div>
      <div style="display:flex; flex-direction:column; gap:8px;">${rows}</div>
    </div>`;
  }

  // ---- P.A. Day flow ----
  function padayFlowHTML(k: Kid) {
    const rows = PADATES.map((p) => {
      const e = k.paDates[p.id];
      const sel = !!e;
      const rowBorder = sel ? 'var(--acc)' : '#ece9e2';
      const check = sel
        ? `<span style="flex:none; width:20px; height:20px; border-radius:6px; background:var(--acc); display:flex; align-items:center; justify-content:center;"><i class="bi bi-check-lg" style="color:#fff; font-size:13px;"></i></span>`
        : `<span style="flex:none; width:20px; height:20px; border-radius:6px; border:1.5px solid #d5d1c8;"></span>`;
      const header = `<div class="reg-pill" data-act="togglePa" data-kid="${k.id}" data-pa="${p.id}" style="display:flex; align-items:center; gap:12px; padding:12px 13px;">
        ${check}
        <div style="flex:1;"><div style="font:800 13.5px/1.1 'Archivo',sans-serif;">${p.label}</div><div style="font:600 11.5px/1.3 inherit; color:#8a877f; margin-top:2px;">9 AM – 2 PM</div></div>
        <span style="flex:none; font:800 13.5px/1 'Archivo',sans-serif;">$90</span>
      </div>`;
      let lateRow = '';
      if (sel && DYC) {
        const on = !!e.late;
        const box = on
          ? `<span style="flex:none; width:18px; height:18px; border-radius:5px; background:#211f1b; display:flex; align-items:center; justify-content:center;"><i class="bi bi-check-lg" style="color:#ffd400; font-size:12px;"></i></span>`
          : `<span style="flex:none; width:18px; height:18px; border-radius:5px; border:1.5px solid #d5d1c8;"></span>`;
        lateRow = `<div class="reg-pill" data-act="paLate" data-kid="${k.id}" data-pa="${p.id}" style="background:#fbf9f4; border-top:1px solid #efece4; padding:11px 13px; display:flex; align-items:center; gap:10px;">
          ${box}
          <span style="flex:1; font:600 12px/1.3 inherit; color:#5b5853;">Late pickup to 4 PM</span>
          <span style="font:800 12px/1 'Archivo',sans-serif; color:var(--acc);">+$20</span>
        </div>`;
      }
      return `<div style="border:1px solid ${rowBorder}; border-radius:12px; overflow:hidden;">${header}${lateRow}</div>`;
    }).join('');
    return `<div>
      <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:9px;">Pick P.A. Day dates · $90 each</div>
      <div style="display:flex; flex-direction:column; gap:8px;">${rows}</div>
    </div>`;
  }

  // ---- private flow (yellow CTA) ----
  function privateFlowHTML() {
    return `<div style="border:1px solid #e8e5dd; background:#faf9f5; border-radius:12px; padding:16px 16px 18px;">
      <div style="display:flex; gap:13px; align-items:flex-start; margin-bottom:14px;">
        <span style="flex:none; width:38px; height:38px; border-radius:10px; background:#fff7ef; display:flex; align-items:center; justify-content:center;"><i class="bi bi-calendar2-week" style="color:var(--acc); font-size:17px;"></i></span>
        <div style="flex:1;">
          <div style="font:800 14.5px/1.15 'Archivo',sans-serif; margin-bottom:6px;">Private days are booked by appointment</div>
          <p style="font:400 13px/1.5 inherit; color:#5b5853; margin:0; text-wrap:pretty;">You pick your own date and we build the day around your group (5+ kids, $90 each). Reserve your date through our booking system — no need to fill out this form.</p>
        </div>
      </div>
      <a href="${BOOKING_URL}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; text-decoration:none; background:#ffd400; color:#211f1b; font:800 13px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em; padding:13px 18px; border-radius:10px;">Book a private day <i class="bi bi-arrow-up-right"></i></a>
    </div>`;
  }

  // ---- camper details + waiver ----
  function camperDetailsHTML(k: Kid) {
    const satisfied = waiverOk(k);
    const wStat = satisfied ? 'ok' : (k.waiver === 'unset' ? 'neutral' : 'todo');
    const waiverBorder = wStat === 'ok' ? '#cfe6d6' : (wStat === 'todo' ? '#f0dcc2' : '#e8e5dd');
    const waiverBg = wStat === 'ok' ? '#f0f8f2' : (wStat === 'todo' ? '#fff7ef' : '#faf9f5');

    const yesChip = k.waiver === 'yes'
      ? `<span class="reg-chip" data-act="waiver" data-kid="${k.id}" data-val="yes" style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px; border-radius:10px; border:1.5px solid #1b6b2f; background:#eef7f0; color:#1b6b2f; font:800 13px/1 'Archivo',sans-serif;"><i class="bi bi-check-circle-fill"></i>Yes — on file</span>`
      : `<span class="reg-chip" data-act="waiver" data-kid="${k.id}" data-val="yes" style="flex:1; display:inline-flex; align-items:center; justify-content:center; padding:11px; border-radius:10px; border:1.5px solid #e0dcd3; background:#fff; color:#5b5853; font:700 13px/1 'Archivo',sans-serif;">Yes — done before</span>`;
    const noChip = k.waiver === 'no'
      ? `<span class="reg-chip" data-act="waiver" data-kid="${k.id}" data-val="no" style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px; border-radius:10px; border:1.5px solid var(--acc); background:#fff7ef; color:#a2601f; font:800 13px/1 'Archivo',sans-serif;"><i class="bi bi-check-circle-fill"></i>No — first time</span>`
      : `<span class="reg-chip" data-act="waiver" data-kid="${k.id}" data-val="no" style="flex:1; display:inline-flex; align-items:center; justify-content:center; padding:11px; border-radius:10px; border:1.5px solid #e0dcd3; background:#fff; color:#5b5853; font:700 13px/1 'Archivo',sans-serif;">No — first time</span>`;

    let step2 = '';
    if (k.waiver === 'no') {
      const doneRow = k.waiverDone
        ? `<span style="flex:none; width:20px; height:20px; border-radius:6px; background:#1b6b2f; display:flex; align-items:center; justify-content:center;"><i class="bi bi-check-lg" style="color:#fff; font-size:13px;"></i></span><span style="font:700 12.5px/1.2 'Archivo',sans-serif; color:#1b6b2f;">Waiver submitted — all set</span>`
        : `<span style="flex:none; width:20px; height:20px; border-radius:6px; border:2px solid #d5b48a;"></span><span style="font:700 12.5px/1.2 'Archivo',sans-serif; color:#a2601f;">I've completed the waiver</span>`;
      step2 = `<div style="margin-top:12px; padding-top:12px; border-top:1px dashed #e6dcc8;">
        <div style="font:700 12.5px/1.35 'Archivo',sans-serif; color:#a2601f; margin-bottom:9px;">Step 2 — sign the one-time waiver, then confirm it's done.</div>
        <a href="${WAIVER_URL}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#ffd400; color:#211f1b; font:800 12.5px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em; padding:11px 15px; border-radius:9px; margin-bottom:10px;"><i class="bi bi-pencil-square"></i>Please sign the waiver here</a>
        <div class="reg-pill" data-act="waiverDone" data-kid="${k.id}" style="display:flex; align-items:center; gap:9px;">${doneRow}</div>
      </div>`;
    }

    return `<div>
      <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:9px;">Camper details</div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; gap:10px;">
          <input class="reg-in" style="flex:2;" type="text" placeholder="Camper's name" value="${esc(k.name)}" data-field="${k.id}.name">
          <input class="reg-in" style="flex:1;" type="number" min="5" max="17" inputmode="numeric" placeholder="Age (5+)" value="${esc(k.age)}" data-field="${k.id}.age">
        </div>
        <input class="reg-in" type="text" placeholder="Allergies we should know about" value="${esc(k.allergies)}" data-field="${k.id}.allergies">
        <textarea class="reg-in" placeholder="Anything the coaches should know? (optional)" data-field="${k.id}.notes">${esc(k.notes)}</textarea>
        <div style="border:1px solid ${waiverBorder}; background:${waiverBg}; border-radius:11px; padding:13px 14px;">
          <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:9px;">Waiver</div>
          <div style="font:700 13px/1.35 'Archivo',sans-serif; margin-bottom:11px;">Step 1 — has this camper filled out a Monkey Vault waiver before?</div>
          <div style="display:flex; gap:8px;">${yesChip}${noChip}</div>
          ${step2}
        </div>
      </div>
    </div>`;
  }

  // ---- build stage ----
  function buildStageHTML() {
    const cards = state.kids.map((k, ki) => kidCardHTML(k, ki)).join('');
    const total = grandTotal();
    const totalLabel = money(total);
    const ctaLabel = total > 0 ? ('Register & pay ' + totalLabel) : 'Register & pay';

    const pendingKids = state.kids.filter((k) => k.camp !== 'private' && computeKid(k).total > 0 && k.waiver === 'no' && !k.waiverDone);
    const waiverPending = pendingKids.length > 0;
    const waiverMsg = waiverPending ? ('Waiver still needed for ' + pendingKids.map((k) => k.name.trim() || ('camper ' + (state.kids.indexOf(k) + 1))).join(', ') + '.') : '';

    const k0 = state.kids[0];
    const canCopySchedule = !!k0 && k0.camp !== 'private' && (Object.keys(k0.weeks).length > 0 || Object.keys(k0.paDates).length > 0);
    const copyFromName = (k0 && k0.name.trim()) || 'Camper 1';
    const siblingBtn = canCopySchedule
      ? `<div class="reg-cta" data-act="addSibling" style="flex:1; min-width:180px; border:1.5px dashed #e6c98f; border-radius:14px; padding:15px; text-align:center; font:800 13.5px/1 'Archivo',sans-serif; color:#a2601f; background:#fffdf9;"><i class="bi bi-people"></i>&nbsp; Add a sibling — same days as ${esc(copyFromName)}</div>`
      : '';

    const waiverWarn = waiverPending
      ? `<div style="display:flex; align-items:flex-start; gap:8px; font:600 11.5px/1.4 inherit; color:#a2601f; background:#fff7ef; border:1px solid #f0dcc2; border-radius:9px; padding:9px 11px; margin-top:14px;"><i class="bi bi-exclamation-triangle-fill" style="margin-top:1px;"></i><span>${esc(waiverMsg)}</span></div>`
      : '';
    const errorBlock = state.error
      ? `<div style="font:600 11.5px/1.4 inherit; color:#b3261e; background:#fdecea; border-radius:9px; padding:9px 11px; margin-top:14px;">${esc(state.error)}</div>`
      : '';

    const kc = state.kids.length;
    const mobileCount = kc + ' camper' + (kc > 1 ? 's' : '');

    const sheet = state.mSumOpen ? `<div style="width:100%; max-height:270px; overflow-y:auto; padding:16px 18px 6px; border-bottom:1px solid rgba(255,255,255,.12);">
      ${mobileSheetLinesHTML()}
      <div style="font:500 10.5px/1.4 inherit; color:rgba(255,255,255,.5); padding-bottom:8px;">HST included. Cancel any week up to two weeks before it starts for a full refund, minus a $20 fee — less notice, 15% retained.</div>
    </div>` : '';
    const mSumChev = state.mSumOpen ? 'bi-chevron-down' : 'bi-chevron-up';

    const mobileNotice = (state.error || waiverPending) ? `<div class="reg-mnotice" data-noprint style="padding:0 16px 10px;">
      ${state.error ? `<div style="font:600 12px/1.4 inherit; color:#b3261e; background:#fdecea; border-radius:9px; padding:10px 12px;">${esc(state.error)}</div>` : ''}
      ${(!state.error && waiverPending) ? `<div style="display:flex; align-items:flex-start; gap:8px; font:600 12px/1.4 inherit; color:#a2601f; background:#fff7ef; border:1px solid #f0dcc2; border-radius:9px; padding:10px 12px;"><i class="bi bi-exclamation-triangle-fill" style="margin-top:1px;"></i><span>${esc(waiverMsg)}</span></div>` : ''}
    </div>` : '';

    const hero = showHero ? `<section data-noprint style="background:#211f1b; color:#fff; position:relative; overflow:hidden;">
      <div style="position:absolute; inset:0; background:radial-gradient(680px 340px at 88% -20%, rgba(226,121,2,.16), transparent 70%);"></div>
      <div style="max-width:1140px; margin:0 auto; padding:40px 24px 44px; position:relative;">
        <div style="display:inline-flex; align-items:center; gap:9px; font:700 12px/1 'Archivo',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:var(--acc); margin-bottom:16px;"><span style="width:22px; height:2px; background:var(--acc);"></span>Camp registration</div>
        <h1 style="font:900 clamp(30px,6vw,44px)/1.02 'Archivo',sans-serif; letter-spacing:-.02em; margin:0 0 12px;">Build your camp registration</h1>
        <p style="font:400 15.5px/1.55 inherit; color:rgba(255,255,255,.72); max-width:560px; margin:0; text-wrap:pretty;">Add each child, pick their camp and days, add late pickup only where you need it. Your total updates as you go — pay once, securely, at the end.</p>
      </div>
    </section>` : '';

    return `<div>
      ${hero}
      <div class="reg-wrap" style="max-width:1140px; margin:0 auto; padding:26px 16px 60px;">
        <div class="reg-grid">
          <div>
            <div style="font:700 11px/1 'Archivo',sans-serif; letter-spacing:.13em; text-transform:uppercase; color:#9b9890; margin-bottom:14px;">Who's registering</div>
            <div style="display:flex; flex-direction:column; gap:14px;">
              ${cards}
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <div class="reg-cta" data-act="addKid" style="flex:1; min-width:180px; border:1.5px dashed #d5d1c8; border-radius:14px; padding:15px; text-align:center; font:800 13.5px/1 'Archivo',sans-serif; color:#8a877f; background:#fff;"><i class="bi bi-plus-lg"></i>&nbsp; Add another child</div>
                ${siblingBtn}
              </div>
              <div style="background:#fff; border:1px solid #e8e5dd; border-radius:16px; padding:18px 18px 20px; box-shadow:0 1px 3px rgba(28,25,23,.05);">
                <div style="font:700 10.5px/1 'Archivo',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#9b9890; margin-bottom:12px;">Parent / guardian</div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                  <input class="reg-in" type="text" placeholder="Your name" value="${esc(state.parent.name)}" data-field="parent.name">
                  <div style="display:flex; gap:10px;">
                    <input class="reg-in" style="flex:1;" type="email" placeholder="Email" value="${esc(state.parent.email)}" data-field="parent.email">
                    <input class="reg-in" style="flex:1;" type="tel" placeholder="Phone" value="${esc(state.parent.phone)}" data-field="parent.phone">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="reg-side">
            <div style="background:#fff; border:1px solid #e3e0d8; border-radius:18px; overflow:hidden; box-shadow:0 1px 3px rgba(28,25,23,.06),0 24px 50px -40px rgba(28,25,23,.5);">
              <div style="background:#211f1b; color:#fff; padding:16px 20px;">
                <div style="font:700 10px/1 'Archivo',sans-serif; letter-spacing:.12em; text-transform:uppercase; color:var(--acc);">Your registration</div>
              </div>
              <div style="padding:18px 20px;">
                ${summaryBlockHTML()}
                <div style="margin-top:18px; padding-top:16px; border-top:1px solid #ece9e2;">
                  <div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font:800 15px/1 'Archivo',sans-serif;">Total</span><span style="font:900 26px/1 'Archivo',sans-serif; color:var(--acc);">${totalLabel}</span></div>
                  <div style="font:500 11px/1.4 inherit; color:#9b9890; margin-top:5px;">HST included</div>
                </div>
                ${waiverWarn}
                ${errorBlock}
                <div class="reg-cta" data-act="register" style="margin-top:16px; text-align:center; padding:15px; border-radius:12px; background:#ffd400; color:#211f1b; font:800 14.5px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em;">${ctaLabel}</div>
                <div style="display:flex; align-items:center; justify-content:center; gap:6px; font:600 10.5px/1.3 inherit; color:#b0aca3; margin-top:10px;"><i class="bi bi-lock-fill"></i>Secure checkout by Square</div>
                <div style="margin-top:14px; padding-top:12px; border-top:1px solid #ece9e2; font:500 11px/1.55 inherit; color:#9b9890; text-wrap:pretty;"><strong style="font-weight:700; color:#7a7770;">Plans change?</strong> Cancel any week up to two weeks before it starts for a full refund, minus a $20 processing fee. With less notice, 15% is retained.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="reg-mbar" data-noprint style="flex-direction:column; background:#211f1b; color:#fff; box-shadow:0 -8px 24px -12px rgba(0,0,0,.5);">
        ${sheet}
        <div style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 18px;">
          <div class="reg-pill" data-act="toggleMSum">
            <div style="display:flex; align-items:center; gap:6px; font:600 10.5px/1 inherit; color:rgba(255,255,255,.55); margin-bottom:5px;">${mobileCount} <i class="bi ${mSumChev}" style="font-size:10px;"></i></div>
            <div style="font:900 21px/1 'Archivo',sans-serif; color:var(--acc);">${totalLabel}</div>
          </div>
          <span class="reg-cta" data-act="register" style="display:inline-flex; align-items:center; gap:9px; padding:13px 20px; border-radius:11px; background:#ffd400; color:#211f1b; font:800 13.5px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em;">Register <i class="bi bi-arrow-right"></i></span>
        </div>
      </div>
      ${mobileNotice}
    </div>`;
  }

  function mobileSheetLinesHTML() {
    const kids = summaryKidsData();
    if (kids.length === 0) return `<div style="font:500 12px/1.5 inherit; color:rgba(255,255,255,.55); margin-bottom:10px;">Pick a camp and some days to see the breakdown here.</div>`;
    return kids.map((s) => `<div style="margin-bottom:12px;">
      <div style="font:800 11.5px/1 'Archivo',sans-serif; color:#ffd400; text-transform:uppercase; letter-spacing:.03em; margin-bottom:7px;">${esc(s.name)}</div>
      ${s.lines.map((ln) => {
        const left = ln.title ? `<strong style="font-weight:800;">${esc(ln.title)}</strong>${ln.days ? ' · ' + esc(ln.days) : ''}` : esc(ln.label);
        return `<div style="display:flex; justify-content:space-between; gap:12px; font:600 12px/1.5 inherit; color:rgba(255,255,255,.8); margin-top:${ln.mt};"><span>${left}</span><span style="white-space:nowrap;">${ln.amount}</span></div>`;
      }).join('')}
    </div>`).join('');
  }

  // ---- confirm stage ----
  const INSTRUCTIONS = [
    { icon:'bi-clipboard-check', title:'Before camp', items:[
      'Sign the one-time waiver for any first-time camper — it must be done before day 1.',
      'Pack a lunch and snacks (please avoid nuts), a labelled water bottle, clean indoor running shoes, and comfy clothes to move in. Label everything.' ] },
    { icon:'bi-sun', title:'The day of camp', items:[
      'Doors open at 8:45 AM for arrival. Camp runs 9:00 AM – 2:00 PM.',
      'On day one, arrive a few minutes early so we can check your camper in.' ] },
    { icon:'bi-box-arrow-in-right', title:'Check-in & check-out', items:[
      'Check in at the front desk — a parent/guardian signs each camper in and out.',
      'Standard pickup is 2:00 PM; late pickup (where purchased) runs until 4:00 PM.',
      'Running late, or need late pickup added last-minute? Call us — we’ll keep your camper until you arrive.',
      'Let us know in advance who else is authorized to pick up your child.' ] },
    { icon:'bi-shield-check', title:'Allergies & safety', items:[
      'Please avoid packing nuts, and tell the coaches about any allergies at drop-off.',
      'Cancellations need two weeks’ written notice (15% deposit retained for late notice; otherwise a $20 transaction fee).' ] },
  ];

  function confirmStageHTML() {
    const totalLabel = money(grandTotal());
    const emailLabel = state.parent.email || 'your email';
    const kids = summaryKidsData();
    const receipt = kids.map((s) => `<div style="margin-bottom:14px;">
      <div style="font:800 13px/1 'Archivo',sans-serif; margin-bottom:7px;">${esc(s.name)}</div>
      ${s.lines.map(summaryLineHTML).join('')}
    </div>`).join('');
    const instr = INSTRUCTIONS.map((ins) => {
      const items = ins.items.map((it) => `<div style="font:400 13px/1.5 inherit; color:#5b5853; text-wrap:pretty;">${esc(it)}</div>`).join('');
      return `<div style="display:flex; gap:13px;">
        <span style="flex:none; width:38px; height:38px; border-radius:10px; background:#fff7ef; display:flex; align-items:center; justify-content:center;"><i class="bi ${ins.icon}" style="color:var(--acc); font-size:17px;"></i></span>
        <div style="flex:1;">
          <div style="font:800 14px/1.15 'Archivo',sans-serif; margin-bottom:6px;">${ins.title}</div>
          <div style="display:flex; flex-direction:column; gap:5px;">${items}</div>
        </div>
      </div>`;
    }).join('');

    return `<div style="max-width:820px; margin:0 auto; padding:36px 16px 80px;">
      <div class="reg-doc" style="background:#fff; border:1px solid #e3e0d8; border-radius:20px; padding:34px 38px 40px; box-shadow:0 1px 3px rgba(28,25,23,.06),0 30px 60px -46px rgba(28,25,23,.5);">
        <div class="reg-doc-inner" style="max-width:640px; margin:0 auto;">
          <div style="display:flex; align-items:center; gap:14px; margin-bottom:22px;">
            <span style="flex:none; width:52px; height:52px; border-radius:14px; background:#e6f4ea; display:flex; align-items:center; justify-content:center;"><i class="bi bi-check-lg" style="color:#1b6b2f; font-size:28px;"></i></span>
            <div>
              <h1 style="font:900 26px/1.02 'Archivo',sans-serif; letter-spacing:-.015em; margin:0 0 4px;">You're registered!</h1>
              <p style="font:500 13.5px/1.4 inherit; color:#7a7770; margin:0;">Confirmation sent to ${esc(emailLabel)} · ${esc(state.ref)}</p>
            </div>
          </div>

          <div style="border:1px solid #ece9e2; border-radius:14px; overflow:hidden; margin-bottom:26px;">
            <div style="background:#faf9f5; padding:13px 18px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #ece9e2;">
              <span style="font:800 12px/1 'Archivo',sans-serif; letter-spacing:.04em; text-transform:uppercase; color:#211f1b;">Registration summary</span>
              <span style="font:700 11px/1 'Archivo',sans-serif; color:#9b9890;">Paid in full</span>
            </div>
            <div style="padding:16px 18px;">
              ${receipt}
              <div style="display:flex; justify-content:space-between; align-items:baseline; padding-top:13px; border-top:1px solid #ece9e2;"><span style="font:800 14px/1 'Archivo',sans-serif;">Total paid</span><span style="font:900 20px/1 'Archivo',sans-serif; color:var(--acc);">${totalLabel}</span></div>
            </div>
          </div>

          <div style="font:700 11px/1 'Archivo',sans-serif; letter-spacing:.12em; text-transform:uppercase; color:#9b9890; margin-bottom:14px;">What to know before camp</div>
          <div style="display:flex; flex-direction:column; gap:16px;">${instr}</div>

          <div style="margin-top:22px; padding-top:18px; border-top:1px solid #efece4; font:400 12px/1.5 inherit; color:#9b9890; text-wrap:pretty;">${esc(ADDRESS)} · Questions? Reply to your confirmation email or call the front desk.</div>

          <div data-noprint style="display:flex; flex-wrap:wrap; gap:10px; margin-top:24px;">
            <span class="reg-cta" data-act="download" style="display:inline-flex; align-items:center; gap:9px; background:#211f1b; color:#fff; font:800 13px/1 'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.03em; padding:14px 20px; border-radius:11px;"><i class="bi bi-download"></i>Download PDF summary</span>
            <span class="reg-cta" data-act="edit" style="display:inline-flex; align-items:center; gap:9px; background:transparent; color:#211f1b; font:700 13px/1 'Archivo',sans-serif; padding:14px 18px; border-radius:11px; border:1.5px solid #ddd9d0;">Register another camper</span>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ---- render (preserves focus + caret across full rebuilds) ----
  function render() {
    const active = document.activeElement as HTMLInputElement | null;
    const field = active && active.dataset ? active.dataset.field : null;
    let caret: number | null = null;
    if (field) { try { caret = active!.selectionStart; } catch (e) { caret = null; } }
    root.innerHTML = state.stage === 'build' ? buildStageHTML() : confirmStageHTML();
    if (field) {
      const el = root.querySelector<HTMLInputElement>(`[data-field="${field}"]`);
      if (el) { el.focus(); if (caret != null) { try { el.setSelectionRange(caret, caret); } catch (e) {} } }
    }
  }

  // Scroll whichever container scrolls us (window on the desktop page, the
  // phone's .m-scroll region when embedded in the mobile app) back to top.
  function scrollHome() {
    try {
      let el: HTMLElement | null = root;
      while (el) { if (el.scrollTop > 0) el.scrollTop = 0; el = el.parentElement; }
      window.scrollTo(0, 0);
    } catch (e) {}
  }

  function onRegister() {
    const { kids, parent } = state;
    if (grandTotal() <= 0) { state.error = 'Add at least one camp day. Private days are booked separately with the button in the card.'; render(); return; }
    if (!parent.name.trim() || !parent.email.trim()) { state.error = 'Please add the parent/guardian name and email.'; render(); return; }
    for (const k of kids) {
      if (k.camp === 'private') continue;
      if (computeKid(k).total <= 0) { state.error = 'Every camper needs at least one day (or remove them / switch to a private booking).'; render(); return; }
      if (!k.name.trim()) { state.error = 'Please name each camper.'; render(); return; }
      if (k.age !== '' && Number(k.age) < 5) { state.error = 'Camps are for ages 5 and up — check ' + (k.name.trim() || 'your camper') + '’s age.'; render(); return; }
      if (!waiverOk(k)) { state.error = 'Waiver still needed for ' + (k.name.trim() || 'a camper') + ' — answer Step 1 and complete it.'; render(); return; }
    }
    state.ref = 'TMV-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    state.stage = 'confirm'; state.error = ''; state.mSumOpen = false;
    render();
    scrollHome();
  }

  // ---- click actions (event delegation) ----
  root.addEventListener('click', (ev) => {
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!el || !root.contains(el)) return;
    const act = el.dataset.act;
    const id = el.dataset.kid;
    const k = id ? kidById(id) : null;
    if (act !== 'toggleMSum') state.error = '';

    switch (act) {
      case 'addKid': {
        const nid = 'k' + (++seq);
        state.kids = [...state.kids, blankKid(nid)];
        state.expanded = nid;
        break;
      }
      case 'addSibling': {
        const src = state.kids[0];
        if (!src) break;
        const nid = 'k' + (++seq);
        const kid = blankKid(nid);
        kid.camp = src.camp;
        kid.weeks = JSON.parse(JSON.stringify(src.weeks));
        kid.paDates = JSON.parse(JSON.stringify(src.paDates));
        state.kids = [...state.kids, kid];
        state.expanded = nid;
        break;
      }
      case 'removeKid': {
        ev.stopPropagation();
        state.kids = state.kids.filter((x) => x.id !== id);
        if (state.expanded === id) state.expanded = state.kids[0] ? state.kids[0].id : null;
        break;
      }
      case 'toggleExpand':
        state.expanded = state.expanded === id ? null : (id ?? null);
        break;
      case 'setCamp':
        if (k) k.camp = el.dataset.camp as Kid['camp'];
        break;
      case 'toggleWeek': {
        if (!k) break;
        const w = WEEKS.find((x) => x.id === el.dataset.week)!;
        if (weekExpired(w)) break;
        const e = k.weeks[w.id];
        const open = openDays(w);
        const allOn = e && open.length > 0 && open.every((d) => e.days[d]);
        if (allOn) { delete k.weeks[w.id]; }
        else { const days: Record<string, boolean> = {}; open.forEach((d) => { days[d] = true; }); k.weeks[w.id] = { days, late: (e && e.late) || {} }; }
        break;
      }
      case 'weekDay': {
        const w = WEEKS.find((x) => x.id === el.dataset.week)!;
        const d = el.dataset.day!;
        if (!k || dayExpired(w, d)) break;
        const prev = k.weeks[w.id];
        const e: WeekEntry = prev ? { days: { ...prev.days }, late: { ...prev.late } } : { days: {}, late: {} };
        e.days[d] = !e.days[d];
        if (w.days.some((x) => e.days[x])) k.weeks[w.id] = e; else delete k.weeks[w.id];
        break;
      }
      case 'weekLate': {
        const w = WEEKS.find((x) => x.id === el.dataset.week)!;
        const d = el.dataset.day!;
        const e = k && k.weeks[el.dataset.week!];
        if (e && !dayExpired(w, d)) e.late[d] = !e.late[d];
        break;
      }
      case 'togglePa': {
        if (!k) break;
        const pid = el.dataset.pa!;
        if (k.paDates[pid]) delete k.paDates[pid];
        else k.paDates[pid] = { late: false };
        break;
      }
      case 'paLate': {
        const e = k && k.paDates[el.dataset.pa!];
        if (e) e.late = !e.late;
        break;
      }
      case 'waiver':
        if (k) k.waiver = el.dataset.val as Kid['waiver'];
        break;
      case 'waiverDone':
        if (k) k.waiverDone = !k.waiverDone;
        break;
      case 'toggleMSum':
        state.mSumOpen = !state.mSumOpen;
        break;
      case 'register':
        onRegister();
        return;
      case 'edit':
        state.stage = 'build';
        render();
        scrollHome();
        return;
      case 'download':
        try { window.print(); } catch (e) {}
        return;
    }
    render();
  });

  // ---- text inputs (event delegation) ----
  root.addEventListener('input', (ev) => {
    const el = (ev.target as HTMLElement).closest<HTMLInputElement>('[data-field]');
    if (!el) return;
    const field = el.dataset.field!;
    const val = el.value;
    state.error = '';
    if (field.startsWith('parent.')) {
      (state.parent as Record<string, string>)[field.split('.')[1]] = val;
    } else {
      const [kid, prop] = field.split('.');
      const k = kidById(kid);
      if (k) (k as unknown as Record<string, string>)[prop] = val;
    }
    render();
  });

  render();
}
