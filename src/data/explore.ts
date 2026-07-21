/**
 * The "everything else" tile set — the long tail that deliberately stays OUT of
 * the six-item primary nav (`nav` in site.ts).
 *
 * Capping the top nav is an intentional IA call, so the overflow needs a home.
 * This one array is the single source for all three of its renderings:
 *   - the mobile More sheet (grid of cards — skimmable, the point of the sheet)
 *   - the desktop homepage "explore" section (same grid)
 *   - the footer link columns (plain links)
 *
 * Add a revenue stream here and it appears in every surface at once.
 *
 * Resolve per surface with `forSurface(exploreTiles, surface)` (src/data/surface.ts)
 * rather than reading this array directly — that's what lets one entry (Events)
 * carry a mobile-only label override without touching what desktop shows.
 */
import { cat } from './site';
import type { Surfaced } from './surface';

export interface ExploreTile extends Surfaced {
  key: string;
  label: string;
  sub: string;
  /** Route key for `url()`. May carry a #hash while a section is still part of a bigger page. */
  path: string;
  /** bootstrap-icons class name. */
  icon: string;
  /** Icon colour. The chip tint is derived from it in CSS (color-mix), so there is one colour to set. */
  fg: string;
}

export const exploreTiles: ExploreTile[] = [
  { key: 'pricing',    label: 'Pricing',     sub: 'Passes, packs & memberships', path: 'pricing',       icon: 'bi-tag-fill',     fg: cat.openGym },
  { key: 'store',      label: 'Store',       sub: 'Buy passes & memberships',    path: 'store',         icon: 'bi-bag-fill',     fg: '#211f1b' },
  { key: 'camps',      label: 'Camps',       sub: 'School-break day camps',      path: 'camps',         icon: 'bi-sun-fill',     fg: cat.camps },
  // Base/desktop label stays 'Events' (matches the top nav and the page itself).
  // Mobile gets 'Birthday Parties' because Groups now has its own tile right
  // below this one, and without the split "Events" reads ambiguously in a
  // grid of single-word cards — a mobile-only scanability fix, not a rename.
  { key: 'events',     label: 'Events', mobile: { label: 'Birthday Parties' }, sub: 'Kids & teen parties at the gym', path: 'events', icon: 'bi-balloon-fill', fg: cat.parties },
  { key: 'groups',     label: 'Groups',      sub: 'Schools, teams & corporate',  path: 'groups',        icon: 'bi-people-fill',  fg: cat.groups },
  { key: 'about',      label: 'About',       sub: 'The space, hours & contact',  path: 'about',         icon: 'bi-geo-alt-fill', fg: cat.classes },
  { key: 'reviews',    label: 'Reviews',     sub: 'What members say',            path: 'reviews',       icon: 'bi-star-fill',    fg: '#e9a300' },
  { key: 'getstarted', label: 'Get Started', sub: 'First-visit guide',           path: 'get-started',   icon: 'bi-flag-fill',    fg: cat.openGym },
];
