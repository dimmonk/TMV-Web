// Hash routing, pure so it can be tested without a browser: `#<page id>/<param>/<param>`.

/** { id, params } for a location hash; `#`, `#/` and '' give { id: null, params: [] }. */
export function parseHash(hash) {
  const parts = String(hash || '').replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  return { id: parts[0] ?? null, params: parts.slice(1) };
}

/** The hash for a page id and params. */
export const buildHash = (id, ...params) => `#${[id, ...params].map(encodeURIComponent).join('/')}`;

/** The page a hash opens: the registered page with that id, else the default one. */
export function resolveRoute(pages, defaultId, hash) {
  const { id, params } = parseHash(hash);
  const page = pages.find((p) => p.id === id) ?? pages.find((p) => p.id === defaultId) ?? null;
  return { page, params };
}
