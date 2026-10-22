#!/usr/bin/env node
// Builds the prototype as ONE self-contained HTML file for the Artifact tool: the BUILT /schedule/ page (run
// `npm run build` first) with its stylesheets, fonts and images inlined, every script of the real page removed,
// and the prototype (proto/main.js, bundled with rolldown, which Astro's Vite already installs) plus proto/proto.css
// added. Reads only dist/ and public/; writes docs/prototype/weekly-calendar/dist/schedule.html (gitignored).
//
//   npm run build && node docs/prototype/weekly-calendar/flatten.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'rolldown';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const PAGE = join(ROOT, 'dist', 'schedule', 'index.html');
const OUT = join(HERE, 'dist', 'schedule.html');
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

if (!existsSync(PAGE)) throw new Error('dist/schedule/index.html is missing: run `npm run build` first');

/** A site path (/x/y) as a file: dist/ first (built assets), then public/. */
function siteFile(path) {
  const clean = path.split(/[?#]/)[0].replace(/^\//, '');
  for (const base of ['dist', 'public']) {
    const file = join(ROOT, base, clean);
    if (existsSync(file)) return file;
  }
  throw new Error(`not found in dist/ or public/: ${path}`);
}
function dataUri(path) {
  const file = siteFile(path);
  const ext = file.slice(file.lastIndexOf('.'));
  if (!MIME[ext]) throw new Error(`no MIME type for ${file}`);
  return `data:${MIME[ext]};base64,${readFileSync(file).toString('base64')}`;
}
const inlineUrls = (css) => css.replace(/url\((['"]?)(\/[^'")]+)\1\)/g, (_, q, p) => `url("${dataUri(p)}")`);

let html = readFileSync(PAGE, 'utf8');
// Stylesheets: the page's own, in its order, inlined.
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="(\/[^"]+)"[^>]*>/g, (_, href) => `<style>${inlineUrls(readFileSync(siteFile(href), 'utf8'))}</style>`);
// The real page's scripts (they fetch the live schedule and drive the router) and its preloads go.
html = html.replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, '');
html = html.replace(/<link\b[^>]*rel="(?:preload|modulepreload|manifest)"[^>]*>/g, '');
// Images and icons the markup names by site path.
html = html.replace(/(src|href)="(\/assets\/[^"]+\.(?:png|jpg|svg))"/g, (_, attr, p) => `${attr}="${dataUri(p)}"`);
// The artifact's name, first in <head> so it is found in the first 8 KB.
html = html.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<head>/, '<head><title>Weekly Class Calendar</title>');

const bundle = await build({
  input: join(HERE, 'proto', 'main.js'),
  write: false,
  output: { format: 'iife', minify: false },
});
const js = bundle.output[0].code.replace(/<\/script/gi, '<\\/script');
const css = readFileSync(join(HERE, 'proto', 'proto.css'), 'utf8');
html = html.replace('</head>', `<style>${css}</style></head>`).replace('</body>', `<script>${js}</script></body>`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`wrote ${OUT} (${Math.round(html.length / 1024)} KB)`);
