// Flattens a prototype page into ONE self-contained HTML file, for publishing as an Artifact (a link the owner can click through).
//
//   node docs/prototype/flatten-page.mjs [page.html] [out.html]      defaults: index.html -> dist/prototype.html
//
// Every linked stylesheet is inlined in order (fonts and images inside them become data URIs), every classic script is inlined,
// every module script is bundled with esbuild (imports resolved as the browser resolves them: relative to the importing file, `/x`
// against this folder), and local <img> sources, in the page or as image paths in its scripts, become data URIs. Nothing is loaded at run time, so the page works from the
// Artifact host. Needs esbuild in the app: `npm i -D esbuild`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const [pageArg = 'index.html', outArg = 'dist/prototype.html'] = process.argv.slice(2);
const MIME = { '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
const isRemote = (ref) => /^(data:|https?:|\/\/|#)/.test(ref);
const dataUri = (file) => `data:${MIME[extname(file)]};base64,${readFileSync(file).toString('base64')}`;
const inlinable = (file) => existsSync(file) && MIME[extname(file)] !== undefined;
const escScript = (text) => text.replace(/<\/script/gi, '<\\/script');

function loadEsbuild() {
  try { return createRequire(join(ROOT, '../../package.json'))('esbuild'); } catch {
    throw new Error('esbuild is not installed in this app. Run `npm i -D esbuild` and try again.');
  }
}

const inlineCss = (html) => html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, (tag) => {
  const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
  if (!href || isRemote(href)) return tag;
  const file = join(ROOT, href.replace(/^\.?\//, '').split(/[?#]/)[0]);
  const css = readFileSync(file, 'utf8').replace(/url\((['"]?)([^'")]+)\1\)/g, (all, quote, ref) => {
    if (isRemote(ref)) return all;
    const path = ref.split(/[?#]/)[0];
    const target = path.startsWith('/') ? join(ROOT, path) : join(dirname(file), path); // `/x` is this folder's x, as served
    return inlinable(target) ? `url("${dataUri(target)}")` : all;
  });
  return `<style>/* ${href} */\n${css}\n</style>`;
});

const inlineImages = (html) => html.replace(/<img([^>]*?) src="([^"]+)"/g, (all, before, src) => {
  const file = join(ROOT, src.replace(/^\.?\//, ''));
  return !isRemote(src) && inlinable(file) ? `<img${before} src="${dataUri(file)}"` : all;
});

/** A quoted local image path in a script (`'proto/img/x.jpg'`, which a page renders into an <img>) becomes its data URI. */
const inlineScriptImages = (code) => code.replace(/(["'])([\w./-]+\.(?:png|jpe?g|gif|webp|svg))\1/g, (all, quote, src) => {
  const file = join(ROOT, src.replace(/^\.?\//, ''));
  return !isRemote(src) && inlinable(file) ? `${quote}${dataUri(file)}${quote}` : all;
});

async function inlineScripts(html, esbuild) {
  const tags = [...html.matchAll(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi)];
  let out = html;
  for (const [tag, before, src, after] of tags) {
    if (isRemote(src)) continue;
    const file = join(ROOT, src.replace(/^\.?\//, ''));
    const isModule = /type=["']module["']/i.test(before + after);
    const code = isModule
      ? (await esbuild.build({ entryPoints: [file], bundle: true, write: false, format: 'esm', platform: 'browser', logLevel: 'silent', plugins: [rootRelative()] })).outputFiles[0].text
      : readFileSync(file, 'utf8');
    out = out.replace(tag, () => `<script${isModule ? ' type="module"' : ''}>\n${escScript(inlineScriptImages(code))}\n</script>`);
  }
  return out;
}

/** `/js/x.js` means this folder's js/x.js, as it does when served from here. */
const rootRelative = () => ({
  name: 'root-relative',
  setup(build) { build.onResolve({ filter: /^\// }, (args) => (args.kind === 'entry-point' ? undefined : { path: join(ROOT, args.path) })); },
});

const page = readFileSync(join(ROOT, pageArg), 'utf8');
const html = await inlineScripts(inlineImages(inlineCss(page)), loadEsbuild());
const out = resolve(ROOT, outArg);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`[prototype] ${pageArg} -> ${out} (${Math.round(html.length / 1024)} KB, one file)`);
