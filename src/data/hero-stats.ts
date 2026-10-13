/**
 * Home-hero stat tiles: SSOT for both surfaces (desktop uses `label`, the
 * narrower mobile hero uses `mobileLabel` where set).
 *
 * The lead figure is the INTRO LESSON, not the day pass: the client-progression
 * procedure makes the intro the designed first step for anyone who wants to
 * learn, and the hero's primary action books it. The $25 day pass hasn't gone
 * anywhere: it's the line directly under these tiles, for people who are only
 * here to play.
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
  { value: '$45', label: 'intro lesson · 1-on-1', mobileLabel: 'intro · 1-on-1' },
  // Always in the markup (hidden when there is nothing to say) so the browser can show it
  // when hours are published after the build.
  { value: hoursTile?.value ?? '', label: hoursTile?.label ?? '', mobileLabel: hoursTile?.mobileLabel ?? '', hours: true, hidden: !hoursTile },
  { value: 'Ages 3+', label: 'all levels' },
];
