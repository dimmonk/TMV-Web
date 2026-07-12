import type { APIRoute } from 'astro';

// Every public route. Kept in sync as pages are added. (Replaces the fragile
// @astrojs/sitemap integration, which is incompatible with this Astro line.)
const routes = [
  '',
  'train',
  'camps',
  'events',
  'pricing',
  'store',
  'about',
  'get-started',
  'private-lessons',
  'athletic-program',
  'reviews',
  'book',
  'schedule',
];

export const GET: APIRoute = ({ site }) => {
  const origin = site!.origin;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const urls = routes
    .map((r) => {
      const loc = `${origin}${base}/${r}`.replace(/\/$/, '') || `${origin}${base}`;
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
