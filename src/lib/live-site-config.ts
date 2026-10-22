/**
 * The browser half of the published site config.
 *
 * The page was built from the object as it stood at the last release. On every
 * page load this fetches the SAME object (`PUBLISHED_CONFIG_URL`, through the
 * same reader the build uses) and re-applies links, banner, hours and socials in
 * place (`apply-site-config.js`), so a staff save in the members app shows
 * within the object's cache window, no release needed. The build stays the first
 * paint, the no-JS page and the structured data.
 *
 * `cache: 'no-cache'` makes the browser revalidate with the object's ETag on
 * every fetch: the answer is a cheap 304 until something was published, then the
 * new body at once (the object's own `max-age=300` would otherwise pin a visitor
 * to a copy up to five minutes old, on top of the publish delay).
 *
 * A failed fetch keeps what was built and says so once in the console. The
 * result is shared across client-side navigations and re-fetched when it is
 * older than `REFRESH_AFTER_MS`.
 */
import { fetchPublishedConfig, readPublishedConfig, PUBLISHED_CONFIG_URL, type PublishedConfig } from './published-config.js';
import { applyPublishedConfig } from './apply-site-config.js';
import { gymNow } from './gym-clock.js';
import { DEFAULTS, mergeLive } from '../data/square-link-defaults';

const REFRESH_AFTER_MS = 60_000;

let latest: PublishedConfig | null = null;
let fetchedAt = 0;
let inFlight: Promise<void> | null = null;

function apply(config: PublishedConfig) {
  const resolved = mergeLive(DEFAULTS, config.links) as unknown as Record<string, Record<string, string>>;
  applyPublishedConfig(document, config, { linkFor: (page, field) => resolved[page]?.[field] ?? '', now: gymNow() });
}

async function refresh() {
  // A page swapped in by the router is the build's copy again: paint what we know first.
  if (latest) apply(latest);
  if (latest && Date.now() - fetchedAt < REFRESH_AFTER_MS) return;
  if (!inFlight) {
    inFlight = fetchPublishedConfig(PUBLISHED_CONFIG_URL, { init: { cache: 'no-cache' } })
      .then((config) => { latest = config; fetchedAt = Date.now(); })
      .catch((e: Error) => { console.warn('[site-config] could not refresh the site config; keeping what was built:', e.message); })
      .finally(() => { inFlight = null; });
  }
  const before = latest;
  await inFlight;
  if (latest && latest !== before) apply(latest);
}

/**
 * The published config as the browser last read it, for the schedule (which draws its week from the opening hours
 * and closed days rather than patching the built page). Shares this module's one fetch; empty when it could not be
 * read.
 */
export async function publishedSiteConfig(): Promise<PublishedConfig> {
  await refresh();
  return latest ?? readPublishedConfig(null);
}

document.addEventListener('astro:page-load', () => { void refresh(); });
