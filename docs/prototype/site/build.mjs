// Builds the whole-site prototype: the REAL site twice, from the real components and stylesheets.
//
//   node docs/prototype/site/build.mjs        -> docs/prototype/dist/site/{now,proposed,assets,index.html}
//
//   now        the site exactly as the code on this branch builds it
//   proposed   the same build with the files under proposed/src/ swapped in for their twins under src/ (a sparse mirror:
//              a file there replaces the real one, a file only there is added, e.g. a new page or component)
//
// Neither build is the shipped site and nothing here is deployed: the release ships origin/main's src/, never this folder.
// The pages run offline: `offline.js` (first script on every page) answers the members app's published objects (site
// config, schedule, price list, camp catalogue) from a copy read once at build time, and refuses any other off-site request, so the
// published prototype never reaches production. Root-absolute links are rewritten relative, so the result works from
// any host, including the Artifact viewer.
import { build } from 'astro';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const SRC = join(APP, 'src');
const PROPOSED = join(HERE, 'proposed', 'src');
const OUT = join(APP, 'docs', 'prototype', 'dist', 'site');
const LIVE = 'https://storage.googleapis.com/tmv-management.firebasestorage.app/public/';
const PUBLISHED = ['site-config.json', 'schedule.json', 'price-list.json', 'camp-catalog.json'];

const exists = (p) => existsSync(p) && statSync(p).isFile();
const clean = (id) => id.split('?')[0];
const toProposed = (p) => (p.startsWith(SRC + sep) ? join(PROPOSED, relative(SRC, p)) : null);
const toSrc = (p) => (p.startsWith(PROPOSED + sep) ? join(SRC, relative(PROPOSED, p)) : null);

/** Swaps proposed/src/<x> in for src/<x> (and lets either tree import from the other), for the proposed build only. */
function proposedTree() {
  return {
    name: 'tmv-proto-proposed',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || source.startsWith('\0')) return null;
      const from = clean(importer);
      const hit = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (hit && !hit.external && exists(clean(hit.id))) return hit;
      const twin = toProposed(from) ?? toSrc(from);
      if (!twin) return null;
      const other = await this.resolve(source, twin, { ...options, skipSelf: true });
      if (!other || other.external) return null;
      const id = clean(other.id);
      if (exists(id)) return other;
      const added = toProposed(id);
      return added && exists(added) ? { ...other, id: other.id.replace(id, added) } : null;
    },
    load(id) {
      const file = toProposed(clean(id));
      if (!file || !exists(file) || id.includes('?')) return null;
      return readFileSync(file, 'utf8');
    },
  };
}

/** Pages that exist only in the proposal (a new route), registered as routes of the proposed build. */
function addedPages() {
  const dir = join(PROPOSED, 'pages');
  const added = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.astro') && !exists(join(SRC, 'pages', f))) : [];
  return {
    name: 'tmv-proto-added-pages',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => added.forEach((f) => injectRoute({ pattern: `/${f.replace(/\.astro$/, '')}`, entrypoint: join(dir, f) })),
    },
  };
}

/** Root-absolute URLs in a built file, relative to where that file sits. Page links name their index.html. */
function relativize(text, file, variantRoot) {
  const up = (root) => relative(dirname(file), root).split(sep).join('/') || '.';
  const site = up(OUT);
  const variant = up(variantRoot);
  const rel = (path) => {
    if (path.startsWith('assets/')) return `${site}/${path}`;
    const [bare, hash] = path.split('#');
    const isPage = bare === '' || bare.endsWith('/');
    return `${variant}/${bare}${isPage ? 'index.html' : ''}${hash !== undefined ? `#${hash}` : ''}`;
  };
  const inCss = (css) => css.replace(/url\((['"]?)\/(?!\/)([^'")]+)\1\)/g, (all, q, path) => `url(${q}${rel(path)}${q})`);
  if (file.endsWith('.css')) return inCss(text);
  return inCss(text)
    .replace(/(\s(?:href|src|poster|content|action|data-[a-z-]+)=")\/(?!\/)([^"]*)"/g, (all, attr, path) => `${attr}${rel(path)}"`)
    .replace(/(\ssrcset=")([^"]*)"/g, (all, attr, set) => `${attr}${set.replace(/(^|,\s*)\/(?!\/)(\S+)/g, (m, lead, p) => `${lead}${rel(p)}`)}"`);
}

function walk(dir, visit) {
  readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, visit); else visit(p);
  });
}

async function readPublished() {
  const entries = await Promise.all(PUBLISHED.map(async (name) => {
    const res = await fetch(LIVE + name);
    if (!res.ok) throw new Error(`[prototype] could not read ${name} (${res.status})`);
    return [name, await res.json()];
  }));
  return Object.fromEntries(entries);
}

function offlineScript(published) {
  return `// Prototype only: the page runs offline. The members app's published objects come from this copy; any other off-site request is refused.
(function () {
  var LIVE = ${JSON.stringify(LIVE)};
  var DATA = ${JSON.stringify(published)};
  var real = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (url.origin === location.origin && real) return real(input, init);
    var name = url.href.indexOf(LIVE) === 0 ? url.href.slice(LIVE.length).split('?')[0] : '';
    if (Object.prototype.hasOwnProperty.call(DATA, name)) {
      return Promise.resolve(new Response(JSON.stringify(DATA[name]), { status: 200, headers: { 'content-type': 'application/json' } }));
    }
    return Promise.reject(new TypeError('Prototype: off-site request blocked (' + url.origin + ')'));
  };
})();
`;
}

async function buildVariant(name, published) {
  const outDir = join(OUT, name);
  const proposed = name === 'proposed';
  await build({
    root: APP,
    outDir,
    logLevel: 'warn',
    integrations: proposed ? [addedPages()] : [],
    vite: { plugins: proposed ? [proposedTree()] : [] },
  });
  writeFileSync(join(outDir, 'offline.js'), offlineScript(published));
  walk(outDir, (file) => {
    if (/preload-helper\.[\w-]+\.js$/.test(file)) { // Vite preloads '/' + dep; resolve it from the module instead
      writeFileSync(file, readFileSync(file, 'utf8').replace(/function\((\w)\)\{return`\/`\+\1\}/, 'function($1){return new URL(`../`+$1,import.meta.url).href}'));
      return;
    }
    if (!/\.(html|css)$/.test(file)) return;
    let text = relativize(readFileSync(file, 'utf8'), file, outDir);
    if (file.endsWith('.html')) {
      const offline = relative(dirname(file), join(outDir, 'offline.js')).split(sep).join('/');
      text = text.replace(/<head>/, `<head><script src="${offline}"></script>`);
    }
    writeFileSync(file, text);
  });
  rmSync(join(outDir, 'assets'), { recursive: true, force: true }); // one shared copy, below
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const published = await readPublished();
process.env.TMV_SITE_CONFIG_URL = ''; // both builds read the live published config, as the real build does
await buildVariant('now', published);
await buildVariant('proposed', published);
cpSync(join(APP, 'public', 'assets'), join(OUT, 'assets'), { recursive: true });
cpSync(join(HERE, 'compare.html'), join(OUT, 'index.html'));
console.log(`[prototype] built ${relative(APP, OUT)}: now/, proposed/, assets/, index.html (the comparison page)`);
