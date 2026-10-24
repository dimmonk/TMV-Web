/**
 * Home-hero stat tiles: SSOT for both surfaces (desktop uses `label`, the
 * narrower mobile hero uses `mobileLabel` where set).
 *
 * The lead figure is the DROP-IN CLASS: the least-barrier way in is always shown first (owner's rule, 2026-10-24):
 * no booking, no commitment, come to any class time. The intro and the day pass follow in the goal picker and the
 * line under these tiles.
 *
 * The hours tile is not typed here. It is read off the published opening hours
 * (`site-config.ts`), and when there are none to read the tile is hidden.
 */
import { hours } from './site-config';
import { hoursStat } from '../lib/opening-hours.js';

export interface HeroStat {
  value: string;
  label: string;
  mobileLabel?: string;
  /** The opening-hours tile: the browser keeps it current. */
  hours?: boolean;
  /** No readable hours at build time: the tile stays in the markup, hidden. */
  hidden?: boolean;
}

const hoursTile = hoursStat(hours);

export const heroStats: readonly HeroStat[] = [
  { value: '{groupClass1x}', label: 'drop-in class · no booking', mobileLabel: 'drop-in class' },
  // Always in the markup (hidden when there is nothing to say) so the browser can show it
  // when hours are published after the build.
  { value: hoursTile?.value ?? '', label: hoursTile?.label ?? '', mobileLabel: hoursTile?.mobileLabel ?? '', hours: true, hidden: !hoursTile },
  { value: 'Ages 3+', label: 'all levels' },
];
