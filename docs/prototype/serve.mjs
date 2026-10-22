// Local server for the living prototype of TMV-Web: `node docs/prototype/serve.mjs [port]`, then open http://127.0.0.1:5631/.
// Serves this folder only, following the symlinks into the app's public assets (css, img, js). Read-only, bound to loopback,
// no cache. Nothing here talks to Firebase or to any production system.
import { createServer } from 'node:http';
import { realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.argv[2] || process.env.PORT || 5631);
const HOST = '127.0.0.1';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
};

/** The file a URL path names, or null when it would leave this folder (the check is on the path, so a symlink inside is followed). */
export function fileFor(urlPath) {
  const rel = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  const abs = resolve(ROOT, `.${rel}`);
  return abs.startsWith(ROOT + sep) ? abs : null;
}

export function createPrototypeServer() {
  return createServer(async (req, res) => {
    try {
      const file = fileFor(new URL(req.url, 'http://x').pathname);
      if (!file) throw new Error('outside the prototype folder');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  createPrototypeServer().listen(PORT, HOST, () => console.log(`TMV-Web prototype on http://${HOST}:${PORT}`));
}
