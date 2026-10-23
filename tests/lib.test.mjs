// Pure-logic tests for the modules that turn the published site config into
// what the pages render. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fillPrices, hasPriceToken } from '../src/lib/price-text.js';
import { readPublishedConfig, fetchPublishedConfig, hasSocial, LIMITS } from '../src/lib/published-config.js';
import { moveSlotMarkers } from '../src/lib/sq-slot-marker.js';
import { bannerOn, bannerButton, bannerShowsOn, gymDay } from '../src/lib/site-banner.js';
import { gymNow } from '../src/lib/gym-clock.js';
import { jsonForScript } from '../src/lib/json-for-script.js';
import { specializedView, splitLevel, clock } from '../src/lib/specialized-classes.js';
import { applySpecializedClasses } from '../src/lib/apply-specialized-classes.js';
import { JSDOM } from 'jsdom';
import {
  weekSchedule, hasOpenDays, hoursSummary, hoursHeading, hoursStat, openingHoursSpec, openStatus, formatClock,
} from '../src/lib/opening-hours.js';
import { readCampCatalog, campDates, applyCampDates } from '../src/lib/camp-dates.js';
import { upcomingEvents, eventTime } from '../src/lib/site-events.js';

const ALL_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  .map((day) => ({ day, time: '11:00 AM – 10:00 PM' }));

// ---- published-config -------------------------------------------------------

test('a value past its limit reads as unset, a value at its limit is kept', () => {
  const url = (n) => `https://x.example/${'a'.repeat(n - 18)}`;
  const at = readPublishedConfig({
    links: { book: { introduction: url(LIMITS.url) } },
    social: { instagram: url(LIMITS.url) },
    banners: [{ headline: 'h'.repeat(LIMITS.headline), body: 'b'.repeat(LIMITS.body), ctaLabel: 'c'.repeat(LIMITS.ctaLabel), ctaUrl: url(LIMITS.url), from: '2026-11-01', to: '2026-11-30' }],
  });
  assert.equal(at.links.book.introduction.length, LIMITS.url);
  assert.equal(at.social.instagram.length, LIMITS.url);
  assert.equal(at.banners[0].headline.length, LIMITS.headline);
  assert.equal(at.banners[0].ctaUrl.length, LIMITS.url);
  const over = readPublishedConfig({
    links: { book: { introduction: url(LIMITS.url + 1) } },
    social: { instagram: url(LIMITS.url + 1) },
    banners: [{ headline: 'Spring camp', body: 'b'.repeat(LIMITS.body + 1), ctaLabel: 'c'.repeat(LIMITS.ctaLabel + 1), ctaUrl: url(LIMITS.url + 1), from: '2026-11-01', to: '2026-11-30' }],
  });
  assert.equal(over.links.book.introduction, '');
  assert.equal(over.social.instagram, '');
  assert.deepEqual(over.banners, [{ headline: 'Spring camp', body: '', ctaLabel: '', ctaUrl: '', from: '2026-11-01', to: '2026-11-30' }]);
});

test('hours rows past a limit are left out, and only the first rows up to the limit are read', () => {
  const rows = [
    { day: 'd'.repeat(LIMITS.hoursDay + 1), time: 'Closed' },
    { day: 'Monday', time: 't'.repeat(LIMITS.hoursTime + 1) },
    ...Array.from({ length: LIMITS.hoursRows + 3 }, (_, i) => ({ day: `Row ${i}`, time: 'Closed' })),
  ];
  const { hours } = readPublishedConfig({ hours: rows });
  assert.equal(hours.length, LIMITS.hoursRows);
  assert.deepEqual(hours[0], { day: 'Row 0', time: 'Closed' });
});

test('a banner with no headline, an unreadable day or its days backwards is dropped; the rest read soonest first', () => {
  const ok = { headline: 'Winter camp', body: null, ctaLabel: null, ctaUrl: null, from: '2026-11-01', to: '2026-12-21' };
  const { banners } = readPublishedConfig({ banners: [
    { ...ok, headline: 'Holidays', from: '2026-12-22', to: '2027-01-02' },
    { ...ok, headline: '' },
    { ...ok, headline: 'h'.repeat(LIMITS.headline + 1) },
    { ...ok, from: 'soon' },
    { ...ok, to: '2026-12-21T23:59:59' },
    { ...ok, from: '2026-12-22', to: '2026-12-21' },
    'x',
    ok,
  ] });
  assert.deepEqual(banners.map((b) => b.headline), ['Winter camp', 'Holidays']);
  assert.deepEqual(banners[0], { headline: 'Winter camp', body: '', ctaLabel: '', ctaUrl: '', from: '2026-11-01', to: '2026-12-21' });
  const many = Array.from({ length: LIMITS.banners + 3 }, (_, i) => ({ ...ok, from: `2027-01-${String(i + 1).padStart(2, '0')}`, to: `2027-01-${String(i + 1).padStart(2, '0')}` }));
  assert.equal(readPublishedConfig({ banners: many }).banners.length, LIMITS.banners);
});

test('a missing or malformed object reads as empty, not as a throw', () => {
  for (const bad of [null, undefined, 'x', 7, [], { banners: 'x', hours: 'x', social: 'x' }]) {
    const c = readPublishedConfig(bad);
    assert.deepEqual(c.banners, []);
    assert.deepEqual(c.hours, []);
    assert.deepEqual(c.social, { instagram: '', facebook: '', youtube: '' });
  }
});

test('the contact is read bounded; a phone nobody can dial or an email that is not one address reads as unset', () => {
  const ok = { address: { street: '1 Main St', city: 'Toronto', region: 'ON', postalCode: 'M1M 1M1' }, phone: ' (416) 555-0100 ', email: 'a@b.ca' };
  assert.deepEqual(readPublishedConfig(ok).contact, { ...ok, phone: '(416) 555-0100' });
  const bad = readPublishedConfig({ address: { street: 'x'.repeat(LIMITS.street + 1), city: 7 }, phone: '12', email: 'a b@c.ca' }).contact;
  assert.deepEqual(bad, { address: { street: '', city: '', region: '', postalCode: '' }, phone: '', email: '' });
  assert.deepEqual(readPublishedConfig(null).contact, bad);
});

test('a price template fills from the price list, all or nothing', () => {
  const list = { groupClass1x: 30, groupClass10x: 275, partyExtra: 27.5 };
  assert.equal(fillPrices('{groupClass1x} single · 10-pack {groupClass10x}', list), '$30 single · 10-pack $275');
  assert.equal(fillPrices('{partyExtra} each', list), '$27.50 each');
  assert.equal(fillPrices('From {groupClass1x} · {missing}', list), '', 'one missing price hides the line');
  assert.equal(fillPrices('{groupClass1x}', { groupClass1x: '30' }), '', 'a price that is not a number is missing');
  assert.equal(fillPrices('{groupClass1x}', null), '');
  assert.equal(fillPrices('No price here', null), 'No price here');
  assert.equal(hasPriceToken('From {openGym1x}'), true);
  assert.equal(hasPriceToken('Ages 3+ {}'), false);
});

test('only http(s) URLs survive into social and the banner button', () => {
  const c = readPublishedConfig({
    social: { instagram: 'javascript:alert(1)', facebook: 'https://facebook.com/x', youtube: 'not a url' },
    banners: [{ headline: 'H', ctaLabel: 'Go', ctaUrl: 'data:text/html,x', from: '2026-11-01', to: '2026-11-01' }],
  });
  assert.equal(c.social.instagram, '');
  assert.equal(c.social.facebook, 'https://facebook.com/x');
  assert.equal(c.social.youtube, '');
  assert.equal(c.banners[0].ctaUrl, '');
});

test('a published Square link that is not http(s) reads as unset, so the card keeps its default', () => {
  const c = readPublishedConfig({ links: {
    book: { introduction: 'javascript:alert(1)', privateLesson: ' https://sq.example/p ', fullBirthday: 7, miniBirthday: 'data:text/html,x' },
    store: 'x',
  } });
  assert.deepEqual(c.links, { book: { introduction: '', privateLesson: 'https://sq.example/p', fullBirthday: '', miniBirthday: '' } });
  assert.equal(readPublishedConfig({ links: 'x' }).links, null);
  assert.equal(readPublishedConfig({}).links, null);
});

test('closed days keep a readable date, sorted, at most the limit; a reason past its limit reads as none', () => {
  const rows = Array.from({ length: LIMITS.closedDays + 2 }, (_, i) => ({ date: `2026-12-${String(31 - i).padStart(2, '0')}`, reason: 'Holiday' }));
  const { closedDays } = readPublishedConfig({ closedDays: [...rows, { date: 'Dec 25', reason: 'x' }, { reason: 'no date' }] });
  assert.equal(closedDays.length, LIMITS.closedDays);
  assert.equal(closedDays[0].date, '2026-12-18');
  assert.deepEqual(readPublishedConfig({ closedDays: [{ date: '2026-12-25', reason: 'x'.repeat(LIMITS.closedReason + 1) }] }).closedDays, [{ date: '2026-12-25', reason: '' }]);
  assert.deepEqual(readPublishedConfig({}).closedDays, []);
});

test('hours keep their order and their text; rows with neither day nor time are dropped', () => {
  const c = readPublishedConfig({ hours: [{ day: 'Sunday', time: '10 AM' }, { day: '', time: '' }, { day: 'Holidays', time: 'By appointment' }] });
  assert.deepEqual(c.hours, [{ day: 'Sunday', time: '10 AM' }, { day: 'Holidays', time: 'By appointment' }]);
});

// ---- banner rules -----------------------------------------------------------

const banner = (headline, from, to) => ({ headline, body: '', ctaLabel: '', ctaUrl: '', from, to });
const year = [banner('Winter camp', '2026-11-01', '2026-12-21'), banner('Holidays', '2026-12-22', '2027-01-02')];

test('the banner showing is the one whose days include today, first day to last day', () => {
  assert.equal(bannerOn(year, '2026-10-31'), null);
  assert.equal(bannerOn(year, '2026-11-01').headline, 'Winter camp');
  assert.equal(bannerOn(year, '2026-12-21').headline, 'Winter camp');
  assert.equal(bannerOn(year, '2026-12-22').headline, 'Holidays');
  assert.equal(bannerOn(year, '2027-01-03'), null);
  assert.equal(bannerOn([], '2026-11-01'), null);
});

test('if two banners overlap anyway, the soonest one shows', () => {
  const both = readPublishedConfig({ banners: [banner('Later', '2026-11-10', '2026-11-20'), banner('First', '2026-11-01', '2026-11-30')] }).banners;
  assert.equal(bannerOn(both, '2026-11-15').headline, 'First');
});

test('the banner button needs both a label and a link', () => {
  const b = year[0];
  assert.deepEqual(bannerButton({ ...b, ctaLabel: 'Go', ctaUrl: 'https://x.example' }), { label: 'Go', href: 'https://x.example' });
  assert.equal(bannerButton({ ...b, ctaLabel: 'Go' }), null);
  assert.equal(bannerButton({ ...b, ctaUrl: 'https://x.example' }), null);
});

test('the social wrapper shows when any one link is set', () => {
  assert.equal(hasSocial({ instagram: '', facebook: '', youtube: '' }), false);
  assert.equal(hasSocial({ instagram: '', facebook: 'https://f.example', youtube: '' }), true);
});

// ---- gym clock --------------------------------------------------------------

test('the gym clock is Toronto time whatever the host zone is', () => {
  // 2026-01-15 03:30 UTC is 22:30 on the 14th in Toronto (EST, UTC-5), a Wednesday.
  const n = gymNow(new Date('2026-01-15T03:30:00Z'));
  assert.equal(n.wall, '2026-01-14T22:30:00');
  assert.equal(n.minutes, 22 * 60 + 30);
  assert.equal(n.dayIndex, 3);
  // Midnight is hour 00, never 24.
  assert.equal(gymNow(new Date('2026-01-15T05:00:00Z')).wall, '2026-01-15T00:00:00');
});

test('the gym clock follows Toronto through both daylight-saving changes', () => {
  // Spring forward, Sunday 2026-03-08: 02:00 EST jumps to 03:00 EDT.
  assert.equal(gymNow(new Date('2026-03-08T06:59:59Z')).wall, '2026-03-08T01:59:59');
  assert.equal(gymNow(new Date('2026-03-08T07:00:00Z')).wall, '2026-03-08T03:00:00');
  // The end of that day is 23:59:59 EDT, which is 03:59:59 UTC the next day.
  assert.equal(gymNow(new Date('2026-03-09T03:59:59Z')).wall, '2026-03-08T23:59:59');
  assert.equal(gymNow(new Date('2026-03-09T04:00:00Z')).wall, '2026-03-09T00:00:00');
  // Fall back, Sunday 2026-11-01: 02:00 EDT returns to 01:00 EST, so 01:30 happens twice.
  assert.equal(gymNow(new Date('2026-11-01T05:30:00Z')).wall, '2026-11-01T01:30:00');
  assert.equal(gymNow(new Date('2026-11-01T06:30:00Z')).wall, '2026-11-01T01:30:00');
  // The end of that day is 23:59:59 EST, which is 04:59:59 UTC the next day.
  assert.equal(gymNow(new Date('2026-11-02T04:59:59Z')).wall, '2026-11-01T23:59:59');
  assert.equal(gymNow(new Date('2026-11-02T05:00:00Z')).wall, '2026-11-02T00:00:00');
});

test('a banner\'s last day ends at the gym\'s midnight on a daylight-saving day, not an hour early or late', () => {
  const shownAt = (iso) => bannerShowsOn(year[0], gymDay(gymNow(new Date(iso)).wall));
  // 2026-12-21 is EST: its end is 04:59:59 UTC the next day.
  assert.equal(shownAt('2026-12-22T04:59:59Z'), true);
  assert.equal(shownAt('2026-12-22T05:00:00Z'), false);
  const spring = banner('Spring', '2026-03-01', '2026-03-08');
  assert.equal(bannerShowsOn(spring, gymDay(gymNow(new Date('2026-03-09T03:59:59Z')).wall)), true);
  assert.equal(bannerShowsOn(spring, gymDay(gymNow(new Date('2026-03-09T04:00:00Z')).wall)), false);
  const fall = banner('Fall', '2026-10-25', '2026-11-01');
  assert.equal(bannerShowsOn(fall, gymDay(gymNow(new Date('2026-11-02T04:59:59Z')).wall)), true);
  assert.equal(bannerShowsOn(fall, gymDay(gymNow(new Date('2026-11-02T05:00:00Z')).wall)), false);
});

// ---- opening hours ----------------------------------------------------------

test('the standard week reads as seven open days and summarises on one line', () => {
  const week = weekSchedule(ALL_WEEK);
  assert.equal(week.filter(Boolean).length, 7);
  assert.equal(hoursSummary(ALL_WEEK), 'Open 7 days · 11 AM – 10 PM');
  assert.equal(hoursHeading(ALL_WEEK), 'Open 7 days a week');
  assert.deepEqual(hoursStat(ALL_WEEK), { value: '7 days', label: 'open 11 AM – 10 PM', mobileLabel: '11a – 10p' });
});

test('a mixed week summarises in runs; closed days and free text are left out', () => {
  const rows = [
    ...ALL_WEEK.slice(0, 5),
    { day: 'Saturday', time: '10:00 AM – 6:00 PM' },
    { day: 'Sunday', time: 'Closed' },
    { day: 'Holidays', time: 'By appointment' },
  ];
  assert.equal(hoursSummary(rows), 'Mon–Fri 11 AM – 10 PM · Sat 10 AM – 6 PM');
  assert.equal(hoursHeading(rows), 'Open 6 days a week');
  assert.equal(hoursStat(rows).label, 'open every week');
});

test('no readable hours means no summary, no tile, no spec and no pill', () => {
  const rows = [{ day: 'Holidays', time: 'By appointment' }];
  assert.equal(hasOpenDays(weekSchedule(rows)), false);
  assert.equal(hasOpenDays(weekSchedule(ALL_WEEK)), true);
  assert.equal(hoursSummary([]), '');
  assert.equal(hoursSummary(rows), '');
  assert.equal(hoursStat(rows), null);
  assert.deepEqual(openingHoursSpec(rows), []);
  assert.equal(openStatus(weekSchedule(rows), 1, 600), null);
});

test('structured data lists each open day with its own times', () => {
  const spec = openingHoursSpec([{ day: 'Monday', time: '9:00 AM – 5:30 PM' }, { day: 'Tuesday', time: 'Closed' }, { day: 'Friday', time: '6:00 PM – 12:00 AM' }]);
  assert.deepEqual(spec.map((s) => [s.dayOfWeek, s.opens, s.closes]), [['Monday', '09:00', '17:30'], ['Friday', '18:00', '23:59']]);
});

test('the pill follows the gym week', () => {
  const week = weekSchedule(ALL_WEEK);
  assert.deepEqual(openStatus(week, 1, 11 * 60 + 30), { state: 'open', label: 'Open now' });
  assert.deepEqual(openStatus(week, 1, 20 * 60 + 30), { state: 'closing', label: 'Closes at 10 PM' });
  assert.deepEqual(openStatus(week, 1, 9 * 60), { state: 'closed', label: 'Opens 11 AM' });
  assert.deepEqual(openStatus(week, 1, 23 * 60), { state: 'closed', label: 'Opens 11 AM' });
});

test('the pill names the next open day when tomorrow is closed', () => {
  const rows = ALL_WEEK.map((r) => (r.day === 'Tuesday' ? { day: 'Tuesday', time: 'Closed' } : r));
  assert.deepEqual(openStatus(weekSchedule(rows), 1, 23 * 60), { state: 'closed', label: 'Opens Wed 11 AM' });
});

test('a close after midnight stays open into the small hours', () => {
  const week = weekSchedule([{ day: 'Friday', time: '6:00 PM – 2:00 AM' }]);
  assert.deepEqual(openStatus(week, 6, 60), { state: 'closing', label: 'Closes at 2 AM' });
});

test('clock formatting drops :00 and keeps minutes', () => {
  assert.equal(formatClock(11 * 60), '11 AM');
  assert.equal(formatClock(22 * 60 + 30), '10:30 PM');
  assert.equal(formatClock(24 * 60), '12 AM');
});

// ---- data inside a <script> element -------------------------------------------

test('JSON placed in a script element can not close it or open a comment, and still reads back whole', () => {
  const value = { u: 'https://x.example/</script><script>alert(1)</script>', c: '<!-- x', sep: 'a\u2028b\u2029c' };
  const out = jsonForScript(value);
  assert.doesNotMatch(out, /<|\u2028|\u2029/);
  assert.deepEqual(JSON.parse(out), value);
});

// ---- the shared reader (build and browser) -----------------------------------

const reply = (body, ok = true, statusCode = 200) => async () => ({ ok, status: statusCode, json: async () => body });

test('the shared reader returns the validated config', async () => {
  const c = await fetchPublishedConfig('http://x', { fetchFn: reply({ hours: [{ day: 'Monday', time: '9 AM' }], social: { instagram: 'https://i.example' } }) });
  assert.deepEqual(c.hours, [{ day: 'Monday', time: '9 AM' }]);
  assert.equal(c.social.instagram, 'https://i.example');
});

test('the shared reader throws on a bad status, a non-object body and a timeout, so each caller can keep what it has', async () => {
  await assert.rejects(fetchPublishedConfig('http://x', { fetchFn: reply({}, false, 503) }), /status 503/);
  await assert.rejects(fetchPublishedConfig('http://x', { fetchFn: reply(null) }), /not an object/);
  const never = (_url, init) => new Promise((_ok, fail) => init.signal.addEventListener('abort', () => fail(new Error('aborted'))));
  await assert.rejects(fetchPublishedConfig('http://x', { fetchFn: never, timeoutMs: 10 }), /aborted/);
});

test('a Square slot marker moves into data-sq on its anchor, and any stray marker is stripped', () => {
  const html = '<a href="https://sq.example/x#tmv-sq=book.introduction" target="_blank">Go</a><i data-x="https://sq.example/y#tmv-sq=store.dayPasses"></i>';
  assert.equal(
    moveSlotMarkers(html),
    '<a href="https://sq.example/x" data-sq="book.introduction" target="_blank">Go</a><i data-x="https://sq.example/y"></i>',
  );
});

// ---- specialized-classes ----------------------------------------------------

const D = (id, name, over = {}) => ({ id, name, order: 0, accessCategories: ['classes'], description: `${name} body`, ...over });
const S = (disciplineId, day, time, ageRange, over = {}) => ({ disciplineId, day, time, ageRange, isEnding: false, showOnWebsite: true, ...over });
const SCHEDULE = {
  disciplines: [
    D('pk', 'Parkour'), D('f1', 'Flips 1', { order: 2 }), D('f2', 'Flips 2', { order: 3, description: 'Level two body' }),
    D('tr', 'Tricking', { order: 1 }), D('ath', 'Athletic', { accessCategories: ['athletic'] }),
    D('ex', 'Explosive', { order: 4 }), D('sl', 'Speed League', { order: 5 }), D('hs', 'Handstand', { order: 6 }),
  ],
  classes: [
    S('pk', 1, '17:00', '7-12'),
    S('f2', 5, '20:00', '18+'), S('f1', 0, '12:00', '7-12'), S('f1', 4, '18:00', '7-12'), S('f1', 3, '19:00', '18+'), S('f2', 3, '20:00', '18+'),
    S('tr', 2, '19:00', '13+'), S('tr', 4, '19:00', '13+'),
    S('ath', 2, '18:00', '9-14'),
    S('sl', 3, '18:00', '9-14', { isEnding: true }),
    S('hs', 4, '20:00', '13+', { showOnWebsite: false }),
  ],
};

test('the card lists the classes with sessions, levels as one entry, in the schedule order', () => {
  const rows = specializedView(SCHEDULE, { Flips: 'assets/flips.mp4' });
  // Parkour is a core program, Athletic is not a drop-in class, Explosive has no
  // sessions, Speed League only a cancelled one, Handstand only one kept off the website.
  assert.deepEqual(rows.map((r) => r.id), ['tricking', 'flips']);
  const [tricking, flips] = rows;
  assert.deepEqual(tricking, {
    id: 'tricking', name: 'Tricking', days: 'Tue · Thu', who: 'Ages 13+', when: ['Tue · Thu — 7 PM'],
    body: 'Tricking body', image: '',
  });
  assert.equal(flips.name, 'Flips');
  assert.equal(flips.days, 'Wed · Thu · Fri · Sun');
  assert.equal(flips.who, 'Ages 7–12 · 18+ · Levels 1–2');
  assert.deepEqual(flips.when, ['Level 1, ages 7–12: Thu 6 PM · Sun 12 PM', 'Level 1, ages 18+: Wed — 7 PM', 'Level 2, ages 18+: Wed · Fri — 8 PM']);
  assert.equal(flips.body, 'Flips 1 body');
  assert.equal(flips.image, 'assets/flips.mp4');
});

test('an unreadable schedule lists nothing', () => {
  assert.deepEqual(specializedView(null), []);
  assert.deepEqual(specializedView({}), []);
});

test('a level number is split off the class name, and times read as a clock', () => {
  assert.deepEqual(splitLevel('Acro Dance 2'), { group: 'Acro Dance', level: 2 });
  assert.deepEqual(splitLevel('Tricking'), { group: 'Tricking', level: 0 });
  assert.equal(clock('19:00'), '7 PM');
  assert.equal(clock('19:30'), '7:30 PM');
  assert.equal(clock('12:00'), '12 PM');
  assert.equal(clock('09:15'), '9:15 AM');
});

test('the browser brings a built card up to date in place, as text', () => {
  const { document } = new JSDOM(`<div data-class-tabs>
    ${['tricking', 'flips'].map((id) => `<button data-class-tab="${id}"><span data-class-days>old</span></button>`).join('')}
    ${['tricking', 'flips'].map((id) => `<div data-class-panel="${id}"><p data-class-body>old</p>
      <div data-class-who-row><span data-class-who>old</span></div><span data-class-when><span>old</span></span></div>`).join('')}
  </div>`).window;
  const root = document.querySelector('[data-class-tabs]');
  const rows = specializedView({ ...SCHEDULE, disciplines: SCHEDULE.disciplines.map((d) => (d.id === 'tr' ? { ...d, description: '<img src=x onerror=alert(1)>' } : d)) })
    .filter((r) => r.id === 'tricking');
  assert.deepEqual(applySpecializedClasses(root, rows), ['tricking']);
  const tab = (id) => root.querySelector(`[data-class-tab="${id}"]`);
  const panel = root.querySelector('[data-class-panel="tricking"]');
  assert.equal(tab('flips').hidden, true);
  assert.equal(tab('tricking').hidden, false);
  assert.equal(tab('tricking').querySelector('[data-class-days]').textContent, 'Tue · Thu');
  assert.equal(panel.querySelector('[data-class-body]').textContent, '<img src=x onerror=alert(1)>');
  assert.equal(panel.querySelector('img'), null);
  assert.deepEqual([...panel.querySelectorAll('[data-class-when] .ct-when-line')].map((l) => l.textContent), ['Tue · Thu — 7 PM']);
});

// ---- camp dates ---------------------------------------------------------------

const byKey = (groups) => Object.fromEntries(groups.map((g) => [g.key, g]));

test('the camp catalogue keeps known types and real dates; anything else reads as no camps', () => {
  assert.deepEqual(readCampCatalog(null), []);
  assert.deepEqual(readCampCatalog({ camps: 'x' }), []);
  assert.deepEqual(readCampCatalog({ camps: [
    { type: 'winter', dates: ['2099-12-21', '21/12/2099', 7] },
    { type: 'private', dates: ['2099-01-01'] },
    { type: 'summer' },
  ] }), [{ type: 'winter', dates: ['2099-12-21'] }]);
});

test('camp dates fall into runs of consecutive days, from today on, with a summary per camp', () => {
  const g = byKey(campDates([
    { type: 'summer', dates: ['2099-07-06', '2099-07-07', '2099-07-08', '2099-07-09', '2099-07-10', '2099-06-29', '2099-06-30', '2099-07-01', '2099-07-02', '2099-07-03', '2099-07-13'] },
    { type: 'winter', dates: ['2099-12-21', '2099-12-22', '2099-12-28'] },
    { type: 'pa-day', dates: ['2099-02-13', '2020-01-01', '2099-01-15'] },
  ], '2026-10-22'));
  assert.deepEqual(g.summer.runs.map((r) => r.label), ['Jun 29 – Jul 3', 'Jul 6 – 10', 'Mon, Jul 13'], 'a weekend starts a new run');
  assert.equal(g.summer.runs[0].sub, '5 days');
  assert.equal(g.summer.summary, '3 weeks from Jun 29');
  assert.deepEqual(g.winter.runs, [{ label: 'Dec 21 – 22', sub: '2 days' }, { label: 'Mon, Dec 28', sub: '' }]);
  assert.equal(g.winter.summary, 'Dec 21 – 22 & Mon, Dec 28');
  assert.deepEqual(g.paday.runs.map((r) => r.label), ['Thu, Jan 15', 'Fri, Feb 13'], 'the past date is gone, the rest in order');
  assert.equal(g.paday.summary, 'Next: Thu, Jan 15');
  assert.deepEqual(g.march, { key: 'march', runs: [], summary: '' });
});

test('three or more runs summarise as a count of weeks', () => {
  const weeks = ['2099-07-06', '2099-07-13', '2099-07-20'];
  assert.equal(byKey(campDates([{ type: 'summer', dates: weeks }], '2099-01-01')).summer.summary, '3 weeks from Mon, Jul 6');
});

test('the browser refresh fills the date lists as text and hides empty camps and an empty block', () => {
  const { document } = new JSDOM(`<section data-camp-dates>
    <div data-camp-group="winter"><ul data-camp-runs><li>old</li></ul></div>
    <div data-camp-group="paday" hidden><ul data-camp-runs></ul></div>
  </section>`).window;
  applyCampDates(document, [
    { key: 'winter', runs: [], summary: '' },
    { key: 'paday', runs: [{ label: '<b>Thu, Jan 15</b>', sub: '' }], summary: '' },
  ]);
  const block = document.querySelector('[data-camp-dates]');
  assert.equal(block.hidden, false);
  assert.equal(document.querySelector('[data-camp-group="winter"]').hidden, true);
  const paday = document.querySelector('[data-camp-group="paday"]');
  assert.equal(paday.hidden, false);
  assert.equal(paday.querySelector('.cd-date-l').textContent, '<b>Thu, Jan 15</b>');
  assert.equal(paday.querySelector('b'), null, 'text, never markup');
  applyCampDates(document, [{ key: 'winter', runs: [], summary: '' }, { key: 'paday', runs: [], summary: '' }]);
  assert.equal(block.hidden, true);
});

// ---- special events ---------------------------------------------------------

const PHOTO = 'https://firebasestorage.googleapis.com/v0/b/tmv-management.firebasestorage.app/o/public%2Fsite-events%2Fsev_0000000000000001%2Fjam.jpg?alt=media';
const jam = { id: 'sev_0000000000000001', title: 'Parkour Jam', date: '2026-11-06', start: '19:00', end: '22:00', note: 'All levels', link: 'https://example.com/jam', photoUrl: PHOTO };

test('special events read soonest first; one without a title, a day or times in order is dropped', () => {
  const { events } = readPublishedConfig({ events: [
    { ...jam, id: 'b', title: 'Later', date: '2026-11-20' },
    { ...jam, id: 'c', title: 'Same day, earlier', start: '10:00', end: '12:00' },
    { ...jam, id: 'd', title: '' },
    { ...jam, id: 'e', title: 't'.repeat(LIMITS.eventTitle + 1) },
    { ...jam, id: 'f', date: 'Nov 6' },
    { ...jam, id: 'g', start: '7pm' },
    { ...jam, id: 'h', start: '22:00', end: '19:00' },
    'x',
    jam,
  ] });
  assert.deepEqual(events.map((e) => e.id), ['c', jam.id, 'b']);
  assert.deepEqual(events[1], jam);
  const many = Array.from({ length: LIMITS.events + 2 }, (_, i) => ({ ...jam, id: `m${i}` }));
  assert.equal(readPublishedConfig({ events: many }).events.length, LIMITS.events);
});

test('an event note, link or photo that cannot be shown reads as none; the event stays', () => {
  const [e] = readPublishedConfig({ events: [{
    ...jam, note: 'two\nlines', link: 'javascript:alert(1)', photoUrl: 'https://evil.example/x.jpg',
  }] }).events;
  assert.deepEqual([e.title, e.note, e.link, e.photoUrl], ['Parkour Jam', '', '', '']);
  const [long] = readPublishedConfig({ events: [{ ...jam, note: 'n'.repeat(LIMITS.eventNote + 1), link: `https://x.example/${'a'.repeat(LIMITS.eventLink)}`, photoUrl: null }] }).events;
  assert.deepEqual([long.note, long.link, long.photoUrl], ['', '', '']);
  assert.deepEqual(readPublishedConfig({}).events, []);
});

test('only events from the gym\'s today on are shown, with their hours', () => {
  const list = readPublishedConfig({ events: [{ ...jam, id: 'past', date: '2026-11-05' }, jam] }).events;
  assert.deepEqual(upcomingEvents(list, '2026-11-06').map((e) => e.id), [jam.id]);
  assert.deepEqual(upcomingEvents(list, '2026-11-07'), []);
  assert.equal(eventTime(jam), '7pm–10pm');
});
