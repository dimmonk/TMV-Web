// Builds the real site against a fixture of the published site config and
// reads the HTML it produced. This is the check that the banner, the hours and
// the social links come from the published payload, and that an expired banner
// or an empty value renders nothing. Run: npm test (each build takes a few
// seconds; the builds run one after another because they share Astro's cache).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const BLANK_PROMO = { active: false, headline: '', body: '', ctaLabel: '', ctaUrl: '', expiresAt: '' };
const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  .map((day) => ({ day, time: day === 'Saturday' || day === 'Sunday' ? '10:00 AM – 6:00 PM' : '11:00 AM – 10:00 PM' }));

/** What the fixture server answers; each test sets it before it builds. */
let payload = {};
let status = 200;
let server;
let base;
const workdirs = [];

before(async () => {
  server = http.createServer((_req, res) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(payload));
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
  const child = spawn('npx', ['astro', 'build', '--outDir', out], { cwd: ROOT, env: { ...process.env, TMV_SITE_CONFIG_URL: base } });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  const code = await new Promise((done) => child.on('close', done));
  assert.equal(code, 0, `astro build failed:\n${log}`);
  assert.equal(/live config fetch failed/.test(log), !expectFetch, `the build ${expectFetch ? 'must read' : 'must fail to read'} the fixture:\n${log}`);
  return { page: (path) => readFileSync(join(out, path, 'index.html'), 'utf8'), log };
}

/** Serve this config (over the empty one) to the next build. */
function serve(config, code = 200) {
  payload = { fallbacks: {}, links: {}, promo: BLANK_PROMO, hours: [], social: { instagram: '', youtube: '', facebook: '' }, ...config };
  status = code;
}

test('a published banner, hours and social links reach the pages', async () => {
  serve({
    promo: { active: true, headline: 'Spring camp is open', body: 'Spots fill fast', ctaLabel: 'Register', ctaUrl: 'https://example.com/camp', expiresAt: '2099-12-31T23:59:59' },
    hours: [...WEEK, { day: 'Holidays', time: 'By appointment' }],
    social: { instagram: 'https://www.instagram.com/fixture-ig', youtube: 'https://www.youtube.com/@fixture', facebook: 'https://www.facebook.com/fixture-fb' },
  });
  const site = await build();
  const home = site.page('');
  const about = site.page('about');

  // Banner: headline, message, button, on every page.
  assert.match(home, /data-promo/);
  assert.match(home, /Spring camp is open/);
  assert.match(home, /Spots fill fast/);
  assert.match(home, /href="https:\/\/example\.com\/camp"[^>]*>Register</);
  assert.match(about, /Spring camp is open/);

  // Hours: every row verbatim, in the order published, including the free-text one.
  const rows = [...about.matchAll(/<div class="ab-hrow[^"]*"[^>]*><span[^>]*>([^<]*)<\/span><span[^>]*>([^<]*)<\/span>/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(rows, [...WEEK, { day: 'Holidays', time: 'By appointment' }].map((r) => [r.day, r.time]));
  assert.match(about, /Open 7 days a week/);
  assert.match(home, /Mon–Fri 11 AM – 10 PM · Sat–Sun 10 AM – 6 PM/);

  // Social links: footer, About, structured data.
  for (const href of ['https://www.instagram.com/fixture-ig', 'https://www.youtube.com/@fixture', 'https://www.facebook.com/fixture-fb']) {
    assert.ok(home.includes(`href="${href}"`), `footer links ${href}`);
    assert.ok(about.includes(`href="${href}"`), `about links ${href}`);
    assert.ok(home.includes(JSON.stringify(href)), `structured data lists ${href}`);
  }
  assert.match(home, /"dayOfWeek":"Saturday","opens":"10:00","closes":"18:00"/);
  assert.match(home, /data-status/);

  // The old hard-coded social links are gone from the site.
  assert.doesNotMatch(home, /instagram\.com\/themonkeyvault/);
});

test('an expired banner is not shown', async () => {
  serve({
    promo: { active: true, headline: 'Winter sale', body: 'Ends soon', ctaLabel: 'Shop', ctaUrl: 'https://example.com/sale', expiresAt: '2020-01-31T23:59:59' },
    hours: WEEK,
  });
  const home = (await build()).page('');
  assert.doesNotMatch(home, /data-promo/);
  assert.doesNotMatch(home, /Winter sale/);
});

test('a banner that is switched off, or has no headline, is not shown', async () => {
  serve({ promo: { ...BLANK_PROMO, active: false, headline: 'Off banner' }, hours: WEEK });
  assert.doesNotMatch((await build()).page(''), /Off banner/);
  serve({ promo: { ...BLANK_PROMO, active: true, body: 'No headline' }, hours: WEEK });
  assert.doesNotMatch((await build()).page(''), /data-promo/);
});

test('empty values render nothing: no banner, hours, pill, social or structured hours', async () => {
  serve({});
  const site = await build();
  const home = site.page('');
  const about = site.page('about');
  assert.doesNotMatch(home, /data-promo/);
  assert.doesNotMatch(home, /data-status/);
  assert.doesNotMatch(home, /sf-socials/);
  assert.doesNotMatch(home, /openingHoursSpecification/);
  assert.doesNotMatch(home, /"sameAs"/);
  assert.doesNotMatch(home, /Open 7 days/);
  assert.doesNotMatch(about, /ab-hours/);
  assert.doesNotMatch(about, /ab-social/);
  assert.doesNotMatch(about, /Open 7 days/);
});

test('when the published object cannot be read the build still succeeds and shows nothing', async () => {
  serve({}, 500);
  const site = await build({ expectFetch: false });
  assert.doesNotMatch(site.page(''), /data-promo|data-status|sf-socials/);
});
