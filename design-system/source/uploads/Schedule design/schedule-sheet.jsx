/* global React, ReactDOM, MOCK_SCHEDULE */
const { useMemo } = React;

const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun

const AGE_KEY = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('parent') || n.includes('child')) return 'pc';
  if (n.includes('teen') && n.includes('adult')) return 'ta';
  if (n.includes('kid')) return 'k';
  if (n.includes('teen')) return 't';
  if (n.includes('adult')) return 'a';
  return 'x';
};

const fmtHour = (h) => {
  if (h === 0) return '12a';
  if (h < 12) return h + 'a';
  if (h === 12) return '12p';
  return h - 12 + 'p';
};
const fmtRange = (s, e) => {
  if (!s) return '';
  const sh = parseInt(s);
  const eh = e ? parseInt(e) : sh + 1;
  return `${fmtHour(sh)}–${fmtHour(eh)}`;
};

function contrastText(rgb) {
  if (!rgb) return '#fff';
  const m = rgb.match(/\d+/g);
  if (!m) return '#fff';
  const [r, g, b] = m.map(Number);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1a1a1a' : '#ffffff';
}

const SHORT_AGE = { pc: 'PARENT & CHILD', k: 'KIDS', t: 'TEENS', a: 'ADULTS', ta: 'TEENS & ADULTS' };

function ClassCard({ c, variant, layout }) {
  const ageKey = AGE_KEY(c.ageGroupName);
  const cls = ['class', 'age-' + ageKey, 'layout-' + layout];
  if (c.isCancelled) cls.push('cancelled');
  const style = variant === 'editorial' || variant === 'bw' ?
  { '--c': c.color } :
  { background: c.color, color: c.textColor || contrastText(c.color), '--c': c.color };
  const ageShort = SHORT_AGE[ageKey] || c.ageGroupName.toUpperCase();
  return (
    <div className={cls.join(' ')} style={style}>
      {c.isNew && !c.isCancelled && <span className="tag new">NEW</span>}
      {c.isCancelled && <span className="tag end">ENDING</span>}
      <div className="c-name">{c.disciplineName}</div>
      {layout === 'compact' ?
      <div className="c-meta" style={{ textAlign: "center" }}>
          <span className="c-time">{fmtRange(c.time, c.endTime)}</span>
          <span className="c-age c-age-abbr">{ageShort}</span>
        </div> :

      <>
          <div className="c-time">{fmtRange(c.time, c.endTime)}</div>
          <div className="c-age c-age-full">{c.ageGroupName}</div>
        </>
      }
    </div>);

}

function Header({ headline, subline, week }) {
  return (
    <div className="h-rail">
      <div className="h-mark">TMV</div>
      <div className="h-title">
        <div className="h-eyebrow">The Monkey Vault · Movement Training Center · Weekly Class Schedule</div>
        <div className="h-headline">{headline}</div>
        {subline && <div className="h-subline">{subline}</div>}
      </div>
      <div className="h-meta">
        <div className="h-meta-label">Effective</div>
        <div className="h-meta-value">{week}</div>
      </div>
    </div>);

}

const todayLabel = () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

function ScheduleSheet({ variant = 'color', filter = 'all', schedule = window.MOCK_SCHEDULE, week }) {
  const effective = week || todayLabel();

  // 'kids' print groups Parent & Child + Kids; teens/adults prints include T&A classes
  const matchesFilter = (c) => {
    const k = AGE_KEY(c.ageGroupName);
    if (filter === 'all') return true;
    if (filter === 'kids') return k === 'pc' || k === 'k';
    if (filter === 'teens') return k === 't' || k === 'ta';
    if (filter === 'adults') return k === 'a' || k === 'ta';
    return k === filter;
  };
  const allHours = useMemo(
    () => [...new Set(schedule.classes.map((c) => parseInt(c.time)))].sort((a, b) => a - b),
    [schedule]
  );

  const filtered = schedule.classes.filter(matchesFilter);

  const visibleByKey = {};
  filtered.forEach((c) => {
    const k = `${c.day}-${parseInt(c.time)}`;
    (visibleByKey[k] = visibleByKey[k] || []).push(c);
  });

  // Show the FULL hour range from min to max — empty afternoon hours
  // (1p, 2p, 3p, 4p) become visibly empty rows so the morning/evening
  // break reads naturally, the way the original schedule did it.
  const minH = Math.min(...allHours);
  const maxH = Math.max(...allHours);
  const fullHours = [];
  for (let h = minH; h <= maxH; h++) fullHours.push(h);

  // Flatten into a row sequence: header is row 1; then sub-rows.
  // Hours with no visible classes still render as a single empty row.
  const rows = [];
  fullHours.forEach((h, hi) => {
    const perDay = DAY_ORDER.map((d) => visibleByKey[`${d}-${h}`] || []);
    const stack = Math.max(1, ...perDay.map((arr) => arr.length));
    const isEmpty = !perDay.some((arr) => arr.length > 0);
    const isLastHour = hi === fullHours.length - 1;
    for (let sub = 0; sub < stack; sub++) {
      rows.push({
        type: 'sub', h, sub, stack, perDay,
        isEmpty,
        isFirstSub: sub === 0,
        isHourEnd: sub === stack - 1 && !isLastHour
      });
    }
  });

  // Empty hour rows take very little space — just enough to show the time
  // label and a hint of hatching so the break reads, without stealing
  // height from populated rows where the actual classes live.
  const gridRowsCss = ['auto', ...rows.map((r) => r.isEmpty ? '0.22fr' : 'minmax(0, 1fr)')].join(' ');

  const headlines = {
    all: { h: 'All Classes', s: 'Parent & Child · Kids · Teens · Adults' },
    kids: { h: 'Parent & Child · Kids', s: 'Parent & Child (ages 3–6) · Kids (ages 7–12)' },
    teens: { h: 'Teens', s: 'Ages 13–17 · includes Teens & Adults classes' },
    adults: { h: 'Adults', s: 'Ages 18+ · includes Teens & Adults classes' }
  };
  const meta = headlines[filter] || headlines.all;
  const layout = filter === 'all' ? 'compact' : 'expanded';

  const seen = new Map();
  filtered.forEach((c) => {if (!seen.has(c.disciplineName)) seen.set(c.disciplineName, c.color);});

  return (
    <div className={`sheet v-${variant}`}>
      <Header headline={meta.h} subline={meta.s} week={effective} />

      <div className="body" style={{ gridTemplateRows: gridRowsCss }}>
        {/* header row */}
        <div className="time-h" style={{ gridColumn: 1, gridRow: 1 }}>HOUR</div>
        {DAY_ORDER.map((d, i) =>
        <div
          key={'dh-' + d}
          className={`day-h${i === DAY_ORDER.length - 1 ? ' col-end' : ''}`}
          style={{ gridColumn: i + 2, gridRow: 1 }}>
          
            {DAY_LONG[d]}
          </div>
        )}

        {rows.map((r, ri) => {
          const gridRow = ri + 2;
          const isLastRow = ri === rows.length - 1;
          return (
            <React.Fragment key={`r-${r.h}-${r.sub}`}>
              {r.isFirstSub &&
              <div
                className={`time-c${r.isEmpty ? ' empty-hour-time' : ''}${isLastRow ? ' row-end-time' : ''}`}
                style={{ gridColumn: 1, gridRow: `${gridRow} / span ${r.stack}` }}>
                {fmtHour(r.h)}</div>
              }
              {r.perDay.map((items, di) => {
                const cellCls = ['cell'];
                if (r.isEmpty) cellCls.push('empty-hour');
                if (isLastRow) cellCls.push('row-end');
                if (!r.isHourEnd && !r.isFirstSub) cellCls.push('sub-row');
                if (di === DAY_ORDER.length - 1) cellCls.push('col-end');
                return (
                  <div
                    key={di}
                    className={cellCls.join(' ')}
                    style={{ gridColumn: di + 2, gridRow }}>
                    
                    {items[r.sub] ? <ClassCard c={items[r.sub]} variant={variant} layout={layout} /> : null}
                  </div>);

              })}
            </React.Fragment>);

        })}
      </div>

      <div className="foot">
        <div className="legend">
          {[...seen.entries()].map(([name, color]) =>
          <span key={name} className="swatch" style={{ '--c': color }}>{name}</span>
          )}
        </div>
        <div className="notes">
          <div><strong>Class Duration</strong> · 60 min · starts on the hour</div>
          <div><strong>Late Arrival</strong> · No entry after 15 min · Open Gym available</div>
        </div>
      </div>
    </div>);

}

window.ScheduleSheet = ScheduleSheet;