#!/usr/bin/env node
// Creates the living prototype in an app: docs/prototype/ with a local server, an index.html that loads the app's real stylesheets
// through symlinks into its public assets, an immutable in-memory store with reset, a page registry, a hash router and one example
// page. Never overwrites (the folder must not exist), never deletes, never reads or writes production data.
//
//   node .claude/skills/prototype/scaffold.mjs [--app <dir>] [--public <dir>] [--name "App Name"]
//
//   --app     the app's root (default: the current directory)
//   --public  the folder hosting serves, relative to --app (default: public)
//   --name    shown in the frame and the title (default: package.json "name", else the folder name)
//
// Design: SKILL.md beside this file. The files it writes are in scaffold/.
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCAFFOLD_DIR = join(dirname(fileURLToPath(import.meta.url)), 'scaffold');
const PROTOTYPE_DIR = 'docs/prototype';
const ALWAYS_LINKED = ['img', 'js'];
const PLACEHOLDER = /\{\{([A-Z_]+)\}\}/g;
const FLAGS = ['app', 'public', 'name'];

export function parseArgs(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    if (!argv[i].startsWith('--') || !FLAGS.includes(key)) throw new Error(`unknown argument ${argv[i]} (known: ${FLAGS.map((f) => `--${f}`).join(', ')})`);
    if (argv[i + 1] === undefined) throw new Error(`${argv[i]} needs a value`);
    flags[key] = argv[i + 1];
  }
  return flags;
}

const isLocal = (ref) => !/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref);
const normalize = (ref) => posix.normalize(ref.replace(/^\//, '').split(/[?#]/)[0]);

/** The stylesheet hrefs of an HTML document in load order; a local one is made relative to the public folder, a remote one is kept as written. */
export function stylesheetHrefs(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0])
    .filter((tag) => /rel\s*=\s*["']stylesheet["']/i.test(tag))
    .map((tag) => /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1])
    .filter(Boolean)
    .map((href) => (isLocal(href) ? normalize(href) : href));
}

/** The public-folder paths a stylesheet's url(...) references, resolved against the stylesheet's own location. */
function cssAssetRefs(publicAbs, href) {
  const file = join(publicAbs, normalize(href));
  if (!existsSync(file)) return [];
  return [...readFileSync(file, 'utf8').matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => m[2])
    .filter((ref) => isLocal(ref) && !ref.startsWith('data:'))
    .map((ref) => (ref.startsWith('/') ? normalize(ref) : posix.normalize(posix.join(posix.dirname(normalize(href)), ref.split(/[?#]/)[0]))));
}

/** The top-level names of the public folder the prototype must link, in a stable order. */
export function linkedNames(publicAbs, hrefs) {
  const firstSegment = (path) => (path.startsWith('..') ? null : path.split('/')[0]);
  const wanted = [...hrefs.map((h) => firstSegment(normalize(h))), ...hrefs.flatMap((h) => cssAssetRefs(publicAbs, h).map(firstSegment)), ...ALWAYS_LINKED];
  return [...new Set(wanted.filter(Boolean))].filter((name) => existsSync(join(publicAbs, name))).sort();
}

/** A fallback when public/index.html names no stylesheet: every .css under public/css, sorted. */
function fallbackStylesheets(publicAbs) {
  const dir = join(publicAbs, 'css');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.css')).sort().map((f) => `css/${f}`);
}

function fill(text, values, file) {
  return text.replace(PLACEHOLDER, (all, name) => {
    if (!(name in values)) throw new Error(`${file}: placeholder ${all} has no value`);
    return values[name];
  });
}

function scaffoldFiles(dir = SCAFFOLD_DIR) {
  return readdirSync(dir).sort().flatMap((entry) => {
    const abs = join(dir, entry);
    return statSync(abs).isDirectory() ? scaffoldFiles(abs) : [abs];
  });
}

function appName(appDir, flags) {
  if (flags.name) return flags.name;
  const pkg = join(appDir, 'package.json');
  const named = existsSync(pkg) ? JSON.parse(readFileSync(pkg, 'utf8')).name : null;
  return named || basename(appDir);
}

/** Adds scripts.proto to package.json unless there is one. Returns whether it changed the file. */
function addProtoScript(appDir) {
  const pkgAbs = join(appDir, 'package.json');
  if (!existsSync(pkgAbs)) return false;
  const pkg = JSON.parse(readFileSync(pkgAbs, 'utf8'));
  if (pkg.scripts?.proto) return false;
  writeFileSync(pkgAbs, `${JSON.stringify({ ...pkg, scripts: { ...pkg.scripts, proto: 'node docs/prototype/serve.mjs' } }, null, 2)}\n`);
  return true;
}

/** Creates docs/prototype in the app; returns { dir, linked, stylesheets, files }. Throws, changing nothing, when it cannot. */
export function scaffoldPrototype({ appDir, publicDir = 'public', name }) {
  const app = resolve(appDir);
  const publicAbs = join(app, publicDir);
  const protoAbs = join(app, PROTOTYPE_DIR);
  if (!existsSync(publicAbs)) throw new Error(`${publicAbs} not found: pass --public <the folder hosting serves>`);
  if (existsSync(protoAbs)) throw new Error(`${protoAbs} already exists; the prototype is scaffolded once. Edit it in place (nothing was changed)`);
  const indexAbs = join(publicAbs, 'index.html');
  const found = existsSync(indexAbs) ? stylesheetHrefs(readFileSync(indexAbs, 'utf8')) : [];
  const hrefs = found.length > 0 ? found : fallbackStylesheets(publicAbs);
  const links = hrefs.map((href) => `<link rel="stylesheet" href="${href}">`);
  const values = { APP_NAME: appName(app, { name }), STYLESHEETS: links.join('\n'), PUBLIC_DIR: publicDir };

  const files = scaffoldFiles().map((abs) => {
    const rel = relative(SCAFFOLD_DIR, abs);
    const dest = join(protoAbs, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, fill(readFileSync(abs, 'utf8'), values, rel));
    return rel;
  });
  writeFileSync(join(protoAbs, '.gitignore'), 'dist/\n');
  const linked = linkedNames(publicAbs, hrefs.filter(isLocal));
  linked.forEach((entry) => symlinkSync(relative(protoAbs, join(publicAbs, entry)), join(protoAbs, entry)));
  addProtoScript(app);
  return { dir: protoAbs, linked, stylesheets: hrefs, files };
}

const isEntryPoint = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isEntryPoint) {
  try {
    const flags = parseArgs(process.argv.slice(2));
    const result = scaffoldPrototype({ appDir: flags.app || process.cwd(), publicDir: flags.public, name: flags.name });
    console.log(`[prototype] ${result.dir}: ${result.files.length} files, ${result.stylesheets.length} app stylesheets, linked ${result.linked.join(', ') || 'nothing'}`);
    console.log('[prototype] next: node docs/prototype/check-prototype.mjs, then node docs/prototype/serve.mjs');
  } catch (error) {
    console.error(`[prototype] ${error.message}`);
    process.exit(1);
  }
}
