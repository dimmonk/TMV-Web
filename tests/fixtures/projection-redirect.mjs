// Preloaded into the test builds (NODE_OPTIONS=--import): points the members
// app's public projections (schedule, price list) at the test's fixture server,
// so a build never reads the live objects. Production builds never load this.
const LIVE = 'https://storage.googleapis.com/tmv-management.firebasestorage.app/public/';
const base = process.env.TMV_PROJECTION_FIXTURE_BASE;

if (base) {
  const real = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return real(url.startsWith(LIVE) ? base + url.slice(LIVE.length) : input, init);
  };
}
