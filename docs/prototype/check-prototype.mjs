// Keeps the living prototype honest. Run: `node docs/prototype/check-prototype.mjs` (exit 1 lists every problem).
//   1. Parity: index.html loads every stylesheet dist/train/index.html loads, in the same order, then only proto/*.css. A prototype
//      that drifts from the app's stylesheets gets a design signed off that the app does not have.
//   2. Symlinks: every symlink in this folder (css, img, js, ...) resolves to a real file or folder in the app's public assets.
//   3. Isolation: the module graph the pages load (proto/ and any app module it imports through ../js) reaches no data layer and no
//      network: no Firebase, no Firestore, no fetch, no XHR, no WebSocket, no beacons. The prototype never touches production data.
import { existsSync, lstatSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const APP = resolve(ROOT, '../..');
const PUBLIC = join(APP, 'dist');
const PAGES = ['index.html', 'phone.html'];
const FORBIDDEN = [
  [/\bfirebase\b/i, 'Firebase'], [/\bfirestore\b/i, 'Firestore'], [/gstatic\.com\/firebasejs/, 'the Firebase CDN'],
  [/\bfetch\s*\(/, 'fetch()'], [/\bXMLHttpRequest\b/, 'XMLHttpRequest'], [/\bWebSocket\b/, 'WebSocket'], [/\bEventSource\b/, 'EventSource'],
  [/\bsendBeacon\b/, 'sendBeacon'], [/\bhttpsCallable\b/, 'a callable function'], [/\bindexedDB\b/, 'IndexedDB'],
];
const IMPORT_SPECIFIER = /(?:\bimport|\bexport)\s*(?:[^'"();]*?\bfrom\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const isRemote = (href) => /^(https?:)?\/\//.test(href);

const stylesheets = (html) => [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0])
  .filter((tag) => /rel\s*=\s*["']stylesheet["']/i.test(tag)).map((tag) => /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]).filter(Boolean)
  .map((href) => (isRemote(href) ? href : href.replace(/^\.?\//, '').split(/[?#]/)[0]));

function parityProblems() {
  const app = join(PUBLIC, 'train', 'index.html'); // the Train page: the screen this prototype designs
  if (!existsSync(app)) return ['dist/train/index.html not found, so the stylesheets cannot be compared'];
  const live = stylesheets(readFileSync(app, 'utf8')).filter((href) => !isRemote(href));
  const proto = stylesheets(readFileSync(join(ROOT, 'index.html'), 'utf8')).filter((href) => !isRemote(href));
  const shared = proto.filter((href) => !href.startsWith('proto/'));
  const problems = [];
  live.filter((href) => !shared.includes(href)).forEach((href) => problems.push(`index.html does not load ${href}, which dist/train/index.html loads`));
  shared.filter((href) => !live.includes(href)).forEach((href) => problems.push(`index.html loads ${href}, which dist/train/index.html does not`));
  if (problems.length === 0 && live.join() !== shared.join()) problems.push('index.html loads the app\'s stylesheets in a different order than dist/train/index.html');
  if (proto.some((href, i) => href.startsWith('proto/') && proto.slice(i + 1).some((later) => !later.startsWith('proto/')))) problems.push('a proto/ stylesheet loads before an app stylesheet; the app\'s come first');
  proto.filter((href) => href.startsWith('proto/') && !existsSync(join(ROOT, href))).forEach((href) => problems.push(`index.html loads ${href}, which does not exist`));
  return problems;
}

function symlinkProblems() {
  return readdirSync(ROOT).filter((name) => lstatSync(join(ROOT, name)).isSymbolicLink())
    .filter((name) => !existsSync(join(ROOT, name))).map((name) => `${name} is a symlink to nothing: the app's ${name} moved or was renamed; relink it to the new location`);
}

/** The module files a page loads, found by following import specifiers from its module scripts. */
function reachable(entryHtml) {
  const html = readFileSync(join(ROOT, entryHtml), 'utf8');
  const queue = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']module["'][^>]*src\s*=\s*["']([^"']+)["']/gi)].map((m) => join(ROOT, m[1]));
  const seen = new Map();
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file) || !existsSync(file) || !statSync(file).isFile()) continue;
    const text = readFileSync(file, 'utf8');
    seen.set(file, text);
    for (const m of text.matchAll(IMPORT_SPECIFIER)) {
      const spec = m[1] ?? m[2];
      if (spec.startsWith('.')) queue.push(resolve(dirname(file), spec));
      else if (spec.startsWith('/')) queue.push(join(ROOT, posix.normalize(spec)));
    }
  }
  return seen;
}

function isolationProblems() {
  const files = new Map(PAGES.filter((page) => existsSync(join(ROOT, page))).flatMap((page) => [...reachable(page)]));
  return [...files].flatMap(([file, text]) => {
    const bare = [...text.matchAll(IMPORT_SPECIFIER)].map((m) => m[1] ?? m[2]).filter((s) => !s.startsWith('.') && !s.startsWith('/') && !s.startsWith('data:'));
    const named = FORBIDDEN.filter(([pattern]) => pattern.test(text.replace(/\/\/.*$/gm, ''))).map(([, what]) => what);
    const where = file.startsWith(ROOT) ? file.slice(ROOT.length + 1) : file;
    return [...bare.map((s) => `${where} imports "${s}"`), ...named.map((what) => `${where} reaches ${what}`)]
      .map((p) => `${p}: the prototype may not touch a data layer or the network (use sample data in proto/data.js)`);
  });
}

const problems = [...parityProblems(), ...symlinkProblems(), ...isolationProblems()];
if (problems.length > 0) {
  console.error(`[prototype] ${problems.length} problem(s):`);
  problems.forEach((p) => console.error(`  ${p}`));
  process.exit(1);
}
console.log('[prototype] stylesheets match the app, symlinks resolve, no data layer or network is reachable.');
