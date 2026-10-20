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
  // Parent-first order: the questions families ask most come first. Every entry shows on both surfaces.
  { key: 'camps',      label: 'Camps',            sub: 'Dates, ages & what to pack',      path: 'camps',            icon: 'bi-sun-fill',        fg: cat.camps },
  { key: 'events',     label: 'Birthday Parties', sub: 'Packages & parent questions',     path: 'events',           icon: 'bi-balloon-fill',    fg: cat.parties },
  { key: 'pricing',    label: 'Pricing',          sub: 'Drop-ins, packs & memberships',   path: 'pricing',          icon: 'bi-tag-fill',        fg: cat.openGym },
  { key: 'getstarted', label: 'First Visit',      sub: 'Waiver, what to bring & arrival', path: 'get-started',      icon: 'bi-flag-fill',       fg: cat.openGym },
  { key: 'opengym',    label: 'Open Gym',         sub: 'Play & train, no booking needed', path: 'open-gym',         icon: 'bi-door-open-fill',  fg: cat.openGym },
  { key: 'about',      label: 'Visit Us',         sub: 'Hours, directions & contact',     path: 'about',            icon: 'bi-geo-alt-fill',    fg: cat.classes },
  { key: 'private',    label: 'Private Lessons',  sub: 'Intro & one-on-one coaching',     path: 'private-lessons',  icon: 'bi-person-arms-up',  fg: cat.private },
  { key: 'athletic',   label: 'Athletic Program', sub: 'Structured training · ages 9+',   path: 'athletic-program', icon: 'bi-lightning-fill',  fg: cat.athletic },
  { key: 'groups',     label: 'Groups',           sub: 'Schools, teams & corporate',      path: 'groups',           icon: 'bi-people-fill',     fg: cat.groups },
  { key: 'store',      label: 'Buy Passes',       sub: 'Passes, packs & memberships',     path: 'store',            icon: 'bi-bag-fill',        fg: '#211f1b' },
  { key: 'reviews',    label: 'Reviews',          sub: 'What families & members say',     path: 'reviews',          icon: 'bi-star-fill',       fg: '#e9a300' },
];
