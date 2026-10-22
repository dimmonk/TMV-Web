// Builds the real site against a fixture of the published site config and
// reads the HTML it produced, then plays the browser's refresh over that HTML.
//
// Build half: the banner, the hours and the social links come from the
// published payload; an expired banner and an empty value show nothing.
// Browser half: a page built from one payload is brought up to date with a
// newer one in place (a changed hours row, a banner that has since expired or
// been added, a re-pointed link). Run: npm test (each build takes a few
// seconds; the builds run one after another because they share Astro's cache).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { transformSync } from 'rolldown/utils';
import { readPublishedConfig } from '../src/lib/published-config.js';
import { applyPublishedConfig } from '../src/lib/apply-site-config.js';
import { gymNow } from '../src/lib/gym-clock.js';

const ROOT = resolve(import.meta.dirname, '..');
const BLANK_PROMO = { active: false, headline: '', body: '', ctaLabel: '', ctaUrl: '', expiresAt: '' };
const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  .map((day) => ({ day, time: day === 'Saturday' || day === 'Sunday' ? '10:00 AM – 6:00 PM' : '11:00 AM – 10:00 PM' }));
const SOCIAL = { instagram: 'https://www.instagram.com/fixture-ig', youtube: 'https://www.youtube.com/@fixture', facebook: 'https://www.facebook.com/fixture-fb' };
const NO_SOCIAL = { instagram: '', youtube: '', facebook: '' };
const LIVE_PROMO = { active: true, headline: 'Spring camp is open', body: 'Spots fill fast', ctaLabel: 'Register', ctaUrl: 'https://example.com/camp', expiresAt: '2099-12-31T23:59:59' };

/** The members app's public schedule and price list, as every build reads them (tests/fixtures/projection-redirect.mjs). */
const SCHEDULE = {
  schemaVersion: 1,
  disciplines: [
    { id: 'pk', name: 'Parkour', order: 0, accessCategories: ['classes'], description: 'Run, jump' },
    { id: 'tr', name: 'Tricking', order: 1, accessCategories: ['classes'], description: 'Fixture tricking body' },
    { id: 'f1', name: 'Flips 1', order: 2, accessCategories: ['classes'], description: 'Fixture flips body' },
    { id: 'f2', name: 'Flips 2', order: 3, accessCategories: ['classes'] },
    { id: 'ex', name: 'Explosive', order: 4, accessCategories: ['classes'], description: 'No sessions' },
  ],
  classes: [
    { id: 'c1', day: 1, time: '17:00', disciplineId: 'pk', ageRange: '7-12', isCancelled: false, showOnWebsite: true },
    { id: 'c2', day: 2, time: '19:00', disciplineId: 'tr', ageRange: '13+', isCancelled: false, showOnWebsite: true },
    { id: 'c3', day: 4, time: '19:00', disciplineId: 'tr', ageRange: '13+', isCancelled: false, showOnWebsite: true },
    { id: 'c4', day: 3, time: '19:00', disciplineId: 'f1', ageRange: '18+', isCancelled: false, showOnWebsite: true },
    { id: 'c5', day: 5, time: '20:00', disciplineId: 'f2', ageRange: '18+', isCancelled: false, showOnWebsite: true },
  ],
};
const PRICE_LIST = { schemaVersion: 1, priceList: { groupClass1x: 31, groupClass10x: 276 } };
/** The members app's public camp catalogue: one P.A. Day and a four-day winter camp, both ahead of any test run. */
const CAMP_CATALOG = {
  schemaVersion: 1,
  camps: [
    { id: 'pa', name: 'PA Day', type: 'pa-day', dates: ['2099-01-15'] },
    { id: 'wi', name: 'Winter Camp', type: 'winter', dates: ['2099-12-21', '2099-12-22', '2099-12-23', '2099-12-24'] },
    { id: 'old', name: 'Past camp', type: 'summer', dates: ['2020-07-06'] },
  ],
};

/** What the fixture server answers for the site config; each test sets it before it builds. */
let payload = {};
let status = 200;
let server;
let base;
const workdirs = [];

before(async () => {
  server = http.createServer((req, res) => {
    const path = new URL(req.url, 'http://fixture').pathname;
    const body = path === '/schedule.json' ? SCHEDULE : path === '/price-list.json' ? PRICE_LIST
      : path === '/camp-catalog.json' ? CAMP_CATALOG : payload;
    res.writeHead(path === '/site-config.json' ? status : 200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  base = `http://127.0.0.1:${server.address().port}/site-config.json`;
});

after(() => {
  server.close();
  workdirs.forEach((d) => rmSync(d, { recursive: true, force: true }));
});

/**
 * Build the site against the current fixture; returns a reader for built pages.
 * Async on purpose: a blocking spawn would stop this process answering the
 * build's fetch of the fixture, and every build would silently fall back to
 * "nothing published", which would make the "renders nothing" tests pass for
 * the wrong reason. So every build must have READ the fixture, except the one
 * test that passes `expectFetch: false` because it wants the fetch to fail.
 */
async function build({ expectFetch = true } = {}) {
  const out = mkdtempSync(join(tmpdir(), 'tmv-web-'));
  workdirs.push(out);
  const env = {
    ...process.env,
    TMV_SITE_CONFIG_URL: base,
    TMV_PROJECTION_FIXTURE_BASE: base.replace(/site-config\.json$/, ''),
    NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --import ${join(ROOT, 'tests/fixtures/projection-redirect.mjs')}`.trim(),
  };
  const child = spawn('npx', ['astro', 'build', '--outDir', out], { cwd: ROOT, env });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  const code = await new Promise((done) => child.on('close', done));
  assert.equal(code, 0, `astro build failed:\n${log}`);
  assert.equal(/live config fetch failed/.test(log), !expectFetch, `the build ${expectFetch ? 'must read' : 'must fail to read'} the fixture:\n${log}`);
  const html = (path) => readFileSync(join(out, path, 'index.html'), 'utf8');
  return { page: html, dom: (path) => new JSDOM(html(path)).window.document, log, out };
}

/** Serve this config (over the empty one) to the next build. */
function serve(config, code = 200) {
  payload = { fallbacks: {}, links: {}, promo: BLANK_PROMO, hours: [], social: NO_SOCIAL, ...config };
  status = code;
}

/** Is the element in the page AND not hidden (itself or an ancestor)? */
const shown = (doc, selector) => [...doc.querySelectorAll(selector)].some((el) => !el.closest('[hidden]'));

/** The browser's refresh: bring a built page up to date with a newer published object. */
function refresh(doc, published, { now = gymNow() } = {}) {
  const config = readPublishedConfig({ fallbacks: {}, links: {}, promo: BLANK_PROMO, hours: [], social: NO_SOCIAL, ...published });
  applyPublishedConfig(doc, config, { linkFor: (page, field) => config.links?.[page]?.[field] || `default:${page}.${field}`, now });
}

const hoursLines = (doc) => [...doc.querySelectorAll('[data-hours-line]')].map((l) => [l.querySelector('[data-day]').textContent, l.querySelector('[data-time]').textContent]);

// ---- build ------------------------------------------------------------------

test('a published banner, hours and social links reach the pages', async () => {
  serve({
    promo: LIVE_PROMO,
    hours: [...WEEK, { day: 'Holidays', time: 'By appointment' }],
    social: SOCIAL,
  });
  const site = await build();
  const home = site.dom('');
  const about = site.dom('about');

  // Banner: headline, message, button, on every page.
  for (const doc of [home, about]) {
    assert.ok(shown(doc, '[data-promo]'), 'banner shows');
    assert.equal(doc.querySelector('[data-promo-head]').textContent, 'Spring camp is open');
    assert.equal(doc.querySelector('[data-promo-body]').textContent, 'Spots fill fast');
    assert.equal(doc.querySelector('[data-promo-cta]').getAttribute('href'), 'https://example.com/camp');
  }

  // Hours: every row verbatim, in the order published, including the free-text one.
  assert.deepEqual(hoursLines(about), [...WEEK, { day: 'Holidays', time: 'By appointment' }].map((r) => [r.day, r.time]));
  assert.ok(shown(about, '[data-hours-card]'));
  assert.equal(about.querySelector('[data-hours-heading]').textContent, 'Open 7 days a week');
  assert.equal(home.querySelector('[data-hours-summary]').textContent, 'Mon–Fri 11 AM – 10 PM · Sat–Sun 10 AM – 6 PM');

  // Social links: footer, About, structured data.
  for (const key of Object.keys(SOCIAL)) {
    assert.equal(home.querySelector(`[data-social="${key}"]`).getAttribute('href'), SOCIAL[key], `footer links ${key}`);
    assert.equal(about.querySelector(`[data-social="${key}"]`).getAttribute('href'), SOCIAL[key], `about links ${key}`);
    assert.ok(site.page('').includes(JSON.stringify(SOCIAL[key])), `structured data lists ${key}`);
  }
  assert.match(site.page(''), /"dayOfWeek":"Saturday","opens":"10:00","closes":"18:00"/);
  assert.ok(shown(home, '[data-status]'));

  // The old hard-coded social links are gone from the site.
  assert.doesNotMatch(site.page(''), /instagram\.com\/themonkeyvault/);
});

test('the Specialized Classes card is the Members schedule, and its price the price list', async () => {
  serve({ hours: WEEK });
  const site = await build();
  assert.doesNotMatch(site.log, /\[class-schedule\]/, 'the build read both projections');
  const train = site.dom('train');
  const card = train.querySelector('[data-chrome="site"] [data-class-tabs]');
  const names = [...card.querySelectorAll('.ct-row-t')].map((n) => n.textContent);
  // Parkour is a core program; Explosive has no sessions; Flips 1 and 2 are one entry.
  assert.deepEqual(names, ['Tricking', 'Flips']);
  assert.deepEqual([...card.querySelectorAll('[data-class-days]')].map((d) => d.textContent), ['Tue · Thu', 'Wed · Fri']);
  const tricking = card.querySelector('[data-class-panel="tricking"]');
  assert.equal(tricking.querySelector('[data-class-body]').textContent, 'Fixture tricking body');
  assert.equal(card.querySelector('[data-class-headline]'), null);
  assert.deepEqual([...card.querySelectorAll('[data-class-panel="flips"] .ct-when-line')].map((l) => l.textContent),
    ['Level 1, ages 18+: Wed — 7 PM', 'Level 2, ages 18+: Fri — 8 PM']);
  assert.match(card.querySelector('.ct-offer-t').textContent, /All drop-in: \$31 a class · 10 for \$276\./);
  assert.doesNotMatch(site.page('train'), /Explosive/);
});

test('a published link reaches its anchors, and a blank one falls back to the default', async () => {
  serve({ links: { getStarted: { introduction: 'https://example.com/intro' } }, hours: WEEK });
  const site = await build();
  const doc = site.dom('');
  const intro = doc.querySelector('a[data-sq="getStarted.introduction"]');
  assert.equal(intro.getAttribute('href'), 'https://example.com/intro');
  const blank = site.dom('camps').querySelector('a[data-sq="camps.paDayCamp"]');
  assert.match(blank.getAttribute('href'), /^https:\/\/the-monkey-vault-inc\.square\.site\/product\/pa-day-camps\//);
  // No slot marker is left in any href.
  assert.equal([...doc.querySelectorAll('a')].filter((a) => (a.getAttribute('href') ?? '').includes('tmv-sq')).length, 0);
});

test('an expired banner is not shown', async () => {
  serve({
    promo: { ...LIVE_PROMO, headline: 'Winter sale', expiresAt: '2020-01-31T23:59:59' },
    hours: WEEK,
  });
  const home = (await build()).dom('');
  assert.ok(!shown(home, '[data-promo]'));
  assert.doesNotMatch(home.documentElement.outerHTML, /Winter sale/);
});

test('a banner that is switched off, or has no headline, is not shown', async () => {
  serve({ promo: { ...BLANK_PROMO, active: false, headline: 'Off banner' }, hours: WEEK });
  const off = (await build()).dom('');
  assert.ok(!shown(off, '[data-promo]'));
  assert.doesNotMatch(off.documentElement.outerHTML, /Off banner/);
  serve({ promo: { ...BLANK_PROMO, active: true, body: 'No headline' }, hours: WEEK });
  assert.ok(!shown((await build()).dom(''), '[data-promo]'));
});

test('empty values render nothing: no banner, hours, pill, social or structured hours', async () => {
  serve({});
  const site = await build();
  const home = site.dom('');
  const about = site.dom('about');
  for (const [doc, selector] of [
    [home, '[data-promo]'], [home, '[data-status]'], [home, '[data-socials-wrap]'], [home, '[data-hours-summary]'], [home, '[data-hours-stat]'],
    [about, '[data-hours-card]'], [about, '[data-socials-wrap]'], [about, '[data-social]'],
  ]) {
    assert.ok(!shown(doc, selector), `${selector} stays hidden`);
  }
  assert.doesNotMatch(site.page(''), /openingHoursSpecification|"sameAs"/);
  assert.doesNotMatch(home.body.textContent + about.body.textContent, /Open 7 days/);
});

test('when the published object cannot be read the build still succeeds and shows nothing', async () => {
  serve({}, 500);
  const site = await build({ expectFetch: false });
  const home = site.dom('');
  assert.ok(!shown(home, '[data-promo]') && !shown(home, '[data-status]') && !shown(home, '[data-socials-wrap]'));
});

test('a social link cannot break out of the structured data script', async () => {
  // A scheme-valid URL may still carry `</script>`: it must reach the page as data, never as markup.
  const evil = 'https://www.instagram.com/x</script><script>window.pwned=1</script>';
  serve({ hours: WEEK, social: { ...NO_SOCIAL, instagram: evil } });
  const site = await build();
  for (const path of ['', 'about']) {
    const doc = site.dom(path);
    const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    assert.equal(ld.length, 1);
    assert.deepEqual(JSON.parse(ld[0].textContent).sameAs, [evil], 'the URL arrives whole, as data');
    const others = [...doc.querySelectorAll('script:not([type="application/ld+json"])')];
    assert.ok(!others.some((s) => s.textContent.includes('pwned')), 'no other script element carries the payload');
  }
});

test('a published link that is not http(s) never reaches an href', async () => {
  serve({
    links: { getStarted: { introduction: 'javascript:alert(1)' }, camps: { paDayCamp: 'https://example.com/ok' }, store: { dayPasses: 'data:text/html,x' } },
    hours: WEEK,
  });
  const site = await build();
  for (const path of ['', 'store']) {
    for (const a of site.dom(path).querySelectorAll('a[href]')) assert.doesNotMatch(a.getAttribute('href'), /^\s*(javascript|data|vbscript):/i, `${path || 'home'}: ${a.outerHTML}`);
  }
  const home = site.dom('');
  const fallback = home.querySelector('a[data-sq="book.fullBirthday"]').getAttribute('href');
  assert.equal(home.querySelector('a[data-sq="getStarted.introduction"]').getAttribute('href'), fallback, 'a bad link falls back to the default');
  assert.equal(site.dom('camps').querySelector('a[data-sq="camps.paDayCamp"]').getAttribute('href'), 'https://example.com/ok');
  const store = site.dom('store');
  assert.equal(
    store.querySelector('a[data-sq="store.dayPasses"]').getAttribute('href'),
    store.querySelector('a[data-sq="store.openGymMembership"]').getAttribute('href'),
    'a bad store link falls back to the generic store page',
  );
});

test('the camp dates are the members catalogue: upcoming runs per camp, past and empty camps hidden', async () => {
  serve({ hours: WEEK });
  const site = await build();
  const camps = site.dom('camps');
  const chips = (doc, key) => [...doc.querySelectorAll(`[data-camp-group="${key}"] .cd-date`)].map((li) => li.textContent);
  assert.ok(shown(camps, '#dates[data-camp-dates]'), 'the Dates section shows');
  assert.deepEqual(chips(camps, 'winter'), ['Dec 21 – 244 days', 'Dec 21 – 244 days'], 'both chromes');
  assert.deepEqual(chips(camps, 'paday'), ['Thu, Jan 15', 'Thu, Jan 15']);
  assert.ok(!shown(camps, '[data-camp-group="summer"]'), 'a camp whose dates have passed is hidden');
  assert.ok(!shown(camps, '[data-camp-group="march"]'), 'a camp with no dates is hidden');
  // The phone screen renders the same groups under its own anchor.
  assert.ok(camps.querySelector('[data-chrome="app"] #m-dates'));
  // The P.A. Day card leads to its dates.
  assert.ok([...camps.querySelectorAll('a.campresv')].some((a) => a.getAttribute('href') === '#dates'));
});

test('the shipped client scripts need no syntax lowering for the browser floor (Safari 13.1 / iOS 13.4)', async () => {
  // `||=`, `&&=` and `??=` are Safari 14: a module that holds one does not parse at all on the floor,
  // so none of its code runs. `?.` and `??` are fine there. Lowering for the floor must change nothing.
  serve({ hours: WEEK });
  const site = await build();
  const needsLowering = (name, code) => {
    const modern = transformSync(name, code, { target: 'esnext' });
    const floor = transformSync(name, code, { target: 'safari13.1' });
    assert.equal(modern.errors.length + floor.errors.length, 0, `${name} parses`);
    return modern.code !== floor.code;
  };
  const files = readdirSync(join(site.out, '_astro')).filter((f) => f.endsWith('.js'));
  assert.ok(files.length > 5, 'the build emitted its scripts');
  const offenders = files.filter((f) => needsLowering(f, readFileSync(join(site.out, '_astro', f), 'utf8')));
  const inline = [...site.page('').matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
    .filter(([, code], i) => code.trim() && needsLowering(`inline-${i}.js`, code)).map((_, i) => `inline script ${i}`);
  assert.deepEqual([...offenders, ...inline], [], 'these scripts use syntax newer than the floor');
});

test('no built page carries an inline script or an inline event handler (the hosting CSP allows neither)', async () => {
  // TMV-Members firebase.json (hosting:web) sends a Content-Security-Policy whose script-src is 'self' plus one
  // pinned file, with no 'unsafe-inline'. An inline <script> or an on*= attribute would be blocked in every browser,
  // silently. JSON-LD is data, not script, and is the one inline <script> a page may carry.
  serve({ hours: WEEK, social: SOCIAL, promo: LIVE_PROMO });
  const site = await build();
  const pages = [];
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const f = join(dir, e.name);
    if (e.isDirectory()) walk(f); else if (e.name.endsWith('.html')) pages.push(f);
  });
  walk(site.out);
  assert.ok(pages.length > 10, 'the build emitted its pages');
  const offenders = [];
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    for (const [tag] of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/g)) offenders.push(`${file.slice(site.out.length)}: ${tag}`);
    for (const [attr] of html.matchAll(/\son[a-z]+\s*=\s*["'][^"']*["']/gi)) offenders.push(`${file.slice(site.out.length)}: ${attr}`);
    for (const [url] of html.matchAll(/(?:href|src|action)\s*=\s*["']\s*javascript:[^"']*/gi)) offenders.push(`${file.slice(site.out.length)}: ${url}`);
  }
  assert.deepEqual(offenders, []);
});

// ---- the browser's refresh over a built page --------------------------------

test('the refresh updates a changed hours row, adds a row and keeps the build\'s styling hooks', async () => {
  serve({ hours: WEEK, social: SOCIAL });
  const site = await build();
  const about = site.dom('about');
  const built = about.querySelector('[data-hours-line]');
  const styleHooks = [...built.attributes].map((a) => a.name).filter((n) => n.startsWith('data-astro-cid'));
  assert.ok(styleHooks.length > 0, 'the build scopes the row\'s styles');

  const newer = WEEK.map((r) => (r.day === 'Monday' ? { day: 'Monday', time: '9:00 AM – 5:00 PM' } : r)).concat({ day: 'Holidays', time: 'By appointment' });
  refresh(about, { hours: newer, social: SOCIAL });

  assert.deepEqual(hoursLines(about), newer.map((r) => [r.day, r.time]));
  for (const line of about.querySelectorAll('[data-hours-line]')) {
    for (const hook of styleHooks) assert.ok(line.hasAttribute(hook), `every row keeps ${hook}`);
  }
  assert.ok(shown(about, '[data-hours-card]'));
  // The summary and the pill follow the same rows.
  const home = site.dom('');
  refresh(home, { hours: newer, social: SOCIAL });
  assert.match(home.querySelector('[data-hours-summary]').textContent, /^Mon 9 AM – 5 PM · Tue–Fri 11 AM – 10 PM/);
  assert.equal(JSON.parse(home.querySelector('[data-status]').getAttribute('data-week'))[1].open, 9 * 60);
});

test('the refresh hides a banner that has expired since the build', async () => {
  serve({ promo: LIVE_PROMO, hours: WEEK });
  const home = (await build()).dom('');
  assert.ok(shown(home, '[data-promo]'));
  refresh(home, { promo: { ...LIVE_PROMO, expiresAt: '2020-01-31T23:59:59' }, hours: WEEK });
  assert.ok(!shown(home, '[data-promo]'));
});

test('the refresh shows a banner published after the build, and changes its text', async () => {
  serve({ hours: WEEK });
  const home = (await build()).dom('');
  assert.ok(!shown(home, '[data-promo]'));
  refresh(home, { promo: LIVE_PROMO, hours: WEEK });
  assert.ok(shown(home, '[data-promo]'));
  assert.equal(home.querySelector('[data-promo-head]').textContent, 'Spring camp is open');
  assert.equal(home.querySelector('[data-promo-cta]').getAttribute('href'), 'https://example.com/camp');
  refresh(home, { promo: { ...LIVE_PROMO, headline: 'Camp is full', ctaUrl: '' }, hours: WEEK });
  assert.equal(home.querySelector('[data-promo-head]').textContent, 'Camp is full');
  assert.ok(!shown(home, '[data-promo-cta]'), 'a button without a link is not a button');
});

test('the refresh re-points a link and shows a social link added after the build', async () => {
  serve({ hours: WEEK });
  const home = (await build()).dom('');
  assert.ok(!shown(home, '[data-socials-wrap]'));
  refresh(home, { hours: WEEK, social: { ...NO_SOCIAL, instagram: 'https://www.instagram.com/new' }, links: { getStarted: { introduction: 'https://example.com/new-intro' } } });
  assert.equal(home.querySelector('a[data-sq="getStarted.introduction"]').getAttribute('href'), 'https://example.com/new-intro');
  assert.ok(shown(home, '[data-social="instagram"]'));
  assert.ok(!shown(home, '[data-social="youtube"]'), 'a blank link stays hidden');
  // Blank again: back to the default.
  refresh(home, { hours: WEEK });
  assert.equal(home.querySelector('a[data-sq="getStarted.introduction"]').getAttribute('href'), 'default:getStarted.introduction');
});

test('the refresh with everything emptied shows nothing', async () => {
  serve({ promo: LIVE_PROMO, hours: WEEK, social: SOCIAL });
  const site = await build();
  const home = site.dom('');
  const about = site.dom('about');
  refresh(home, {});
  refresh(about, {});
  for (const [doc, selector] of [
    [home, '[data-promo]'], [home, '[data-status]'], [home, '[data-socials-wrap]'], [home, '[data-hours-summary]'], [home, '[data-hours-stat]'],
    [about, '[data-hours-card]'], [about, '[data-socials-wrap]'],
  ]) {
    assert.ok(!shown(doc, selector), `${selector} is hidden once nothing is published`);
  }
});
