/**
 * "The space" facility cards — SSOT for the desktop About page and the mobile
 * About screen. Desktop shows the full body; mobile's `mobile` override carries
 * the shorter body its tighter grid uses.
 */
import type { Surfaced } from './surface';

export interface FacilityCard extends Surfaced {
  icon: string;
  title: string;
  body: string;
}

export const facility: FacilityCard[] = [
  { icon: 'bi-grid-3x3-gap-fill', title: 'Gymnastics floor', body: 'Sprung floor and tumbling space for flips, acrobatics and clean form work.', mobile: { body: 'Sprung floor and tumbling space for flips and clean form.' } },
  { icon: 'bi-box-seam', title: 'Foam pit & mats', body: 'Land big tricks safely. Padded throughout for confident progression.', mobile: { body: 'Land big tricks safely — padded throughout.' } },
  { icon: 'bi-bricks', title: 'Obstacles & rigs', body: 'Walls, bars, rails and vaults — purpose-built for parkour movement.', mobile: { body: 'Walls, bars, rails and vaults for parkour.' } },
  { icon: 'bi-heart-pulse', title: 'Weight training', body: 'A strength-and-conditioning section to build the engine behind the skills.', mobile: { body: 'A strength-and-conditioning section too.' } },
];
