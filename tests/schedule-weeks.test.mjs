// The dated week of the schedule page: the pure week logic (src/lib/schedule-weeks.js) and the parts that draw it
// (src/lib/schedule-week-view.js), over staff's one-date cancellations (schedule.json) and closed days (site config).
// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  gymToday, mondayOf, weekRangeLabel, visibleWeeks, weekIndexOf, readCancellations, scheduleExceptions, sessionsForWeek,
  closedDaysOf, upcomingChanges, openGymSessions, CANCELLATION_REASON_MAX,
} from '../src/lib/schedule-weeks.js';

const { window } = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { document: window.document, HTMLElement: window.HTMLElement, Element: window.Element });
const { weekBar, changesCard, changeText, renderWeekGrid, mountClassPopup } = await import('../src/lib/schedule-week-view.js');

const TODAY = '2026-10-22'; // a Thursday
const CLASSES = [
  { id: 'pk', day: 1, time: '17:00', endTime: '18:00', disciplineName: 'Parkour', ageGroupName: 'Kids', color: '#00bf63' },
  { id: 'fl', day: 4, time: '19:00', endTime: '20:00', disciplineName: 'Flips 1', ageGroupName: 'Adults', color: '#2196f3', description: '**Bold** <img src=x onerror=alert(1)>' },
  { id: 'tr', day: 6, time: '11:00', endTime: '12:00', disciplineName: 'Tricking', ageGroupName: 'Teens', color: '#ff7f50' },
];

test('the gym\'s today is Toronto\'s calendar day, whatever the host zone', () => {
  assert.equal(gymToday(new Date('2026-10-23T03:30:00Z')), '2026-10-22'); // 11:30pm in Toronto
});

test('weeks run Monday to Sunday, four of them from this week', () => {
  assert.equal(mondayOf(TODAY), '2026-10-19');
  assert.equal(mondayOf('2026-10-25'), '2026-10-19');
  assert.deepEqual(visibleWeeks(TODAY), ['2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09']);
  assert.equal(weekRangeLabel('2026-10-19'), 'Oct 19 – 25');
  assert.equal(weekRangeLabel('2026-10-26'), 'Oct 26 – Nov 1');
  assert.equal(weekIndexOf(visibleWeeks(TODAY), '2026-11-08'), 2);
  assert.equal(weekIndexOf(visibleWeeks(TODAY), '2026-12-01'), -1);
});

test('a cancellation that is malformed is dropped, and a reason past its limit reads as none', () => {
  const rows = readCancellations([
    { classId: 'fl', date: '2026-10-29', reason: 'Coach away' },
    { classId: 'fl', date: '29/10/2026' },
    { date: '2026-10-29' },
    'x',
    { classId: 'pk', date: '2026-11-02', reason: 'x'.repeat(CANCELLATION_REASON_MAX + 1) },
  ]);
  assert.deepEqual(rows, [
    { type: 'cancel', classId: 'fl', date: '2026-10-29', reason: 'Coach away' },
    { type: 'cancel', classId: 'pk', date: '2026-11-02', reason: '' },
  ]);
  assert.deepEqual(readCancellations(undefined), []);
});

test('a cancelled date is off for that class only; a closed day takes every class that day, over a cancel', () => {
  const exceptions = scheduleExceptions({
    cancellations: [{ classId: 'fl', date: '2026-10-29', reason: 'Coach away' }, { classId: 'tr', date: '2026-10-31', reason: 'x' }],
    closedDays: [{ date: '2026-10-31', reason: 'Halloween' }],
  });
  const week = sessionsForWeek(CLASSES, '2026-10-26', exceptions);
  assert.deepEqual(week.map((s) => [s.id, s.date, s.status, s.offReason]), [
    ['pk', '2026-10-26', 'on', ''],
    ['fl', '2026-10-29', 'cancelled', 'Coach away'],
    ['tr', '2026-10-31', 'closed', 'Halloween'],
  ]);
  assert.equal(sessionsForWeek(CLASSES, '2026-10-19', exceptions).every((s) => s.status === 'on'), true, 'other weeks run as usual');
  assert.deepEqual([...closedDaysOf('2026-10-26', exceptions).keys()], ['2026-10-31']);
});

test('the changes list runs from today to the last visible week, soonest first, and only names real class dates', () => {
  const exceptions = scheduleExceptions({
    cancellations: [
      { classId: 'fl', date: '2026-10-29' },
      { classId: 'fl', date: '2026-10-28' }, // not a Thursday: Flips never runs that day
      { classId: 'gone', date: '2026-10-29' },
      { classId: 'fl', date: '2026-10-15' }, // past
      { classId: 'fl', date: '2026-11-19' }, // past the fourth week
    ],
    closedDays: [{ date: '2026-10-24', reason: 'Event' }],
  });
  const list = upcomingChanges(CLASSES, TODAY, exceptions);
  assert.deepEqual(list.map((e) => [e.type, e.date]), [['closed', '2026-10-24'], ['cancel', '2026-10-29']]);
  assert.equal(changeText(list[0]), 'Gym closed: Event');
  assert.equal(changeText(list[1]), 'Flips 1 (Adults) 7pm–8pm cancelled');
});

test('the grid dates each day, marks today, the past and a closed day, and tags a cancelled class', () => {
  const root = document.createElement('div');
  const exceptions = scheduleExceptions({ cancellations: [{ classId: 'fl', date: TODAY, reason: 'Coach away' }], closedDays: [{ date: '2026-10-24', reason: 'Event' }] });
  renderWeekGrid(root, {
    sessions: sessionsForWeek(CLASSES, '2026-10-19', exceptions), monday: '2026-10-19', today: TODAY,
    closed: closedDaysOf('2026-10-19', exceptions), section: 'classes', onClassClick: () => {},
  });
  const heads = [...root.querySelectorAll('.ws-head')];
  assert.equal(heads.length, 7);
  assert.match(heads[3].textContent, /Today · Oct 22Thursday/);
  assert.ok(heads[3].classList.contains('is-today'));
  assert.ok(heads[0].classList.contains('is-past'));
  assert.equal(heads[5].querySelector('.ws-closed').textContent, 'Gym closed: Event');
  const items = [...root.querySelectorAll('.ws-item')];
  assert.equal(items.length, 3);
  const flips = items.find((i) => i.textContent.startsWith('Flips 1'));
  assert.ok(flips.classList.contains('is-off'));
  assert.equal(flips.querySelector('.ws-tag').textContent, 'Cancelled');
  const tricking = items.find((i) => i.textContent.startsWith('Tricking'));
  assert.equal(tricking.querySelector('.ws-tag').textContent, 'Closed');
  assert.deepEqual([...root.querySelectorAll('.ws-hour')].map((h) => h.textContent), ['11am', '5pm', '7pm']);
});

test('an empty filter says so, and no change means no changes card', () => {
  const root = document.createElement('div');
  renderWeekGrid(root, { sessions: [], monday: '2026-10-19', today: TODAY, closed: new Map(), section: 'classes' });
  assert.equal(root.querySelector('.ws-note').textContent, 'No classes match this filter.');
  assert.equal(changesCard({ changes: [], onGoto: () => {} }), null);
});

test('the week bar steps over the visible weeks and offers the way back', () => {
  const weeks = visibleWeeks(TODAY);
  const steps = [];
  const first = weekBar({ weeks, index: 0, onStep: (i) => steps.push(i) });
  assert.ok(first.querySelector('[aria-label="Previous week"]').disabled);
  assert.equal(first.querySelector('.wk-today'), null);
  const last = weekBar({ weeks, index: 3, onStep: (i) => steps.push(i) });
  assert.ok(last.querySelector('[aria-label="Next week"]').disabled);
  assert.equal(last.querySelector('.wk-eyebrow').textContent, 'In 3 weeks');
  last.querySelector('[aria-label="Previous week"]').click();
  last.querySelector('.wk-today').click();
  assert.deepEqual(steps, [2, 0]);
});

test('staff text reaches the page as text: a reason or a name cannot add markup', () => {
  const evil = '<img src=x onerror=alert(1)>';
  const card = changesCard({ changes: [{ type: 'closed', date: '2026-10-24', reason: evil }], onGoto: () => {} });
  assert.equal(card.querySelector('img'), null);
  assert.match(card.textContent, /Gym closed: <img/);
  const root = document.createElement('div');
  renderWeekGrid(root, { sessions: [{ ...CLASSES[0], disciplineName: evil, date: '2026-10-19', status: 'on', offReason: '' }], monday: '2026-10-19', today: TODAY, closed: new Map(), section: 'classes' });
  assert.equal(root.querySelector('img'), null);
});

test('the popup names the date, says when that date is off, and escapes the description', () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const open = mountClassPopup(host);
  const [flips] = sessionsForWeek([CLASSES[1]], '2026-10-19', [{ type: 'cancel', classId: 'fl', date: TODAY, reason: 'Coach away' }]);
  open(flips);
  const overlay = host.querySelector('.ws-pop-overlay');
  assert.equal(overlay.hidden, false);
  assert.equal(host.querySelector('.ws-pop-title').textContent, 'Flips 1');
  assert.match(host.querySelector('.ws-pop-row').textContent, /Thu Oct 22 · 7pm – 8pm/);
  assert.match(host.querySelector('.ws-pop-off').textContent, /Cancelled on Thu Oct 22Coach awayEvery other week runs as usual\./);
  assert.equal(host.querySelector('.ws-pop-desc strong').textContent, 'Bold');
  assert.equal(host.querySelector('.ws-pop-desc img'), null);
  host.querySelector('.ws-pop-close').click();
  assert.equal(overlay.hidden, true);
  open({ ...flips, status: 'on', offReason: '', description: '' });
  assert.equal(host.querySelector('.ws-pop-off').hidden, true);
  assert.equal(host.querySelector('.ws-pop-desc').hidden, true);
});

test('Open Gym is the published opening hours, with Friday late split off as adults only', () => {
  const blocks = openGymSessions([
    { day: 'Monday', time: '11:00 AM – 10:00 PM' },
    { day: 'Friday', time: '11:00 AM – 12:00 AM' },
    { day: 'Sunday', time: 'Closed' },
    { day: 'Holidays', time: 'By appointment' },
  ]);
  assert.deepEqual(blocks.map((b) => [b.day, b.time, b.endTime, b.ageGroupName]), [[1, '11:00', '22:00', 'All Ages'], [5, '11:00', '22:00', 'All Ages'], [5, '22:00', '24:00', 'Adults Only']]);
  assert.deepEqual(openGymSessions([]), []);
  const root = document.createElement('div');
  renderWeekGrid(root, { sessions: sessionsForWeek(blocks, '2026-10-19', []), monday: '2026-10-19', today: TODAY, closed: new Map(), section: 'open_gym' });
  assert.deepEqual([...root.querySelectorAll('.ws-when')].map((w) => w.textContent), ['11am–10pm', '11am–10pm', '10pm–12am']);
  assert.deepEqual(openGymSessions([{ day: 'Friday', time: '11:00 AM – 10:00 PM' }]).map((b) => b.ageGroupName), ['All Ages'], 'no late hours, no adults-only block');
});

test('a v2 schedule (isEnding, partner, cancellations) draws like v1: Ending tag, cancelled date, reason', async () => {
  const { fetchPublicSchedule } = await import('../src/lib/public-projections.js');
  const v2 = {
    schemaVersion: 2,
    classes: [{ ...CLASSES[1], isNew: false, isNewSetAt: null, isEnding: true, isEndingSetAt: new Date().toISOString(), partner: null }],
    cancellations: [{ classId: 'fl', date: '2026-10-29', reason: null }],
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => v2 });
  try {
    const schedule = await fetchPublicSchedule();
    const exceptions = scheduleExceptions({ cancellations: schedule.cancellations, closedDays: [] });
    assert.deepEqual(exceptions, [{ type: 'cancel', classId: 'fl', date: '2026-10-29', reason: '' }]);
    const root = document.createElement('div');
    renderWeekGrid(root, { sessions: sessionsForWeek(schedule.classes, '2026-10-19', exceptions), monday: '2026-10-19', today: TODAY, closed: new Map(), section: 'classes' });
    assert.equal(root.querySelector('.ws-tag').textContent, 'Ending');
    assert.equal(sessionsForWeek(schedule.classes, '2026-10-26', exceptions)[0].status, 'cancelled');
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ ...v2, schemaVersion: 3 }) });
    await assert.rejects(fetchPublicSchedule(), /schemaVersion 3, expected 1 or 2/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('the home page card shows only when there is a change, and a date opens that week on /schedule', async () => {
  const { mountScheduleChanges } = await import('../src/lib/schedule-changes.js');
  const { weekIndexOf: indexOf } = await import('../src/lib/schedule-weeks.js');
  const today = gymToday();
  const [, nextMonday] = visibleWeeks(today);
  const body = { schemaVersion: 1, classes: [{ ...CLASSES[0], isNew: false, isCancelled: false }], cancellations: [{ classId: 'pk', date: nextMonday, reason: 'Coach away' }] };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => body });
  const host = () => Object.assign(document.createElement('div'), { hidden: true });
  try {
    const shown = host();
    shown.dataset.scheduleHref = '/schedule/';
    await mountScheduleChanges([shown], { siteConfig: async () => ({ closedDays: [] }) });
    assert.equal(shown.hidden, false);
    assert.match(shown.textContent, /Parkour \(Kids\) 5pm–6pm cancelled/);
    assert.equal(indexOf(visibleWeeks(today), nextMonday), 1, 'the linked date is in the second visible week');

    body.cancellations = [];
    const quiet = host();
    await mountScheduleChanges([quiet], { siteConfig: async () => { throw new Error('offline'); } });
    assert.equal(quiet.hidden, true);
    assert.equal(quiet.childElementCount, 0);

    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
    const failed = host();
    await mountScheduleChanges([failed], { siteConfig: async () => ({ closedDays: [] }) });
    assert.equal(failed.hidden, true);
  } finally {
    globalThis.fetch = realFetch;
  }
});
