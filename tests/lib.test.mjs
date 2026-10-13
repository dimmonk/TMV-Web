// Pure-logic tests for the modules that turn the published site config into
// what the pages render. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPublishedConfig, fetchPublishedConfig, hasSocial } from '../src/lib/published-config.js';
import { moveSlotMarkers } from '../src/lib/sq-slot-marker.js';
import { expiryStamp, isExpired, promoIsShown, promoButton } from '../src/lib/site-promo.js';
import { gymNow } from '../src/lib/gym-clock.js';
import { jsonForScript } from '../src/lib/json-for-script.js';
import {
  weekSchedule, hasOpenDays, hoursSummary, hoursHeading, hoursStat, openingHoursSpec, openStatus, formatClock,
} from '../src/lib/opening-hours.js';

const ALL_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  .map((day) => ({ day, time: '11:00 AM – 10:00 PM' }));

// ---- published-config -------------------------------------------------------

test('a missing or malformed object reads as empty, not as a throw', () => {
  for (const bad of [null, undefined, 'x', 7, [], { promo: 'x', hours: 'x', social: 'x' }]) {
    const c = readPublishedConfig(bad);
    assert.equal(c.promo.active, false);
    assert.deepEqual(c.hours, []);
    assert.deepEqual(c.social, { instagram: '', facebook: '', youtube: '' });
  }
});

test('only http(s) URLs survive into social and the promo button', () => {
  const c = readPublishedConfig({
    social: { instagram: 'javascript:alert(1)', facebook: 'https://facebook.com/x', youtube: 'not a url' },
    promo: { active: true, headline: 'H', ctaUrl: 'data:text/html,x' },
  });
  assert.equal(c.social.instagram, '');
  assert.equal(c.social.facebook, 'https://facebook.com/x');
  assert.equal(c.social.youtube, '');
  assert.equal(c.promo.ctaUrl, '');
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

test('hours keep their order and their text; rows with neither day nor time are dropped', () => {
  const c = readPublishedConfig({ hours: [{ day: 'Sunday', time: '10 AM' }, { day: '', time: '' }, { day: 'Holidays', time: 'By appointment' }] });
  assert.deepEqual(c.hours, [{ day: 'Sunday', time: '10 AM' }, { day: 'Holidays', time: 'By appointment' }]);
});

// ---- promo rules ------------------------------------------------------------

const live = { active: true, headline: 'Spots open', body: '', ctaLabel: '', ctaUrl: '', expiresAt: '' };

test('the banner shows only when on, with a headline, and not expired', () => {
  assert.equal(promoIsShown(live, '2026-10-12T12:00:00'), true);
  assert.equal(promoIsShown({ ...live, active: false }, '2026-10-12T12:00:00'), false);
  assert.equal(promoIsShown({ ...live, headline: '' }, '2026-10-12T12:00:00'), false);
});

test('the expiry is the END of the chosen day, not the midnight that starts it', () => {
  const promo = { ...live, expiresAt: '2026-10-12T23:59:59' };
  assert.equal(promoIsShown(promo, '2026-10-12T00:00:01'), true);
  assert.equal(promoIsShown(promo, '2026-10-12T23:59:59'), true);
  assert.equal(promoIsShown(promo, '2026-10-13T00:00:00'), false);
});

test('a date-only or minute-only expiry means the end of that day / minute', () => {
  assert.equal(expiryStamp('2026-10-12'), '2026-10-12T23:59:59');
  assert.equal(expiryStamp('2026-10-12T18:30'), '2026-10-12T18:30:59');
  assert.equal(expiryStamp('soon'), '');
  assert.equal(isExpired('soon', '2099-01-01T00:00:00'), false);
  assert.equal(isExpired('', '2099-01-01T00:00:00'), false);
});

test('the banner button needs both a label and a link', () => {
  assert.deepEqual(promoButton({ ...live, ctaLabel: 'Go', ctaUrl: 'https://x.example' }), { label: 'Go', href: 'https://x.example' });
  assert.equal(promoButton({ ...live, ctaLabel: 'Go' }), null);
  assert.equal(promoButton({ ...live, ctaUrl: 'https://x.example' }), null);
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

test('a banner expiring on a daylight-saving day comes down at the gym\'s midnight, not an hour early or late', () => {
  const shownAt = (expiresAt, iso) => promoIsShown({ ...live, expiresAt }, gymNow(new Date(iso)).wall);
  assert.equal(shownAt('2026-03-08T23:59:59', '2026-03-09T03:59:59Z'), true);
  assert.equal(shownAt('2026-03-08T23:59:59', '2026-03-09T04:00:00Z'), false);
  assert.equal(shownAt('2026-11-01', '2026-11-02T04:59:59Z'), true);
  assert.equal(shownAt('2026-11-01', '2026-11-02T05:00:00Z'), false);
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
