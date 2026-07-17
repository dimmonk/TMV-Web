/**
 * The four "ways to start" for a first visit — SINGLE SOURCE OF TRUTH shared by
 * the desktop Get Started page (src/pages/get-started.astro) and the mobile
 * Get Started screen (src/pages/m/index.astro). Both render with the shared
 * BookingCard; each surface resolves the action href from the semantic `key`
 * (they have different routes — desktop opens its pages, mobile its screens).
 */
import { cat } from './site';

export type FirstSessionKey = 'intro' | 'private' | 'group' | 'opengym';

export interface FirstSessionOption {
  key: FirstSessionKey;
  title: string;
  color: string;
  status: string;
  statusTone: 'neutral' | 'go';
  desc: string;
  cta: string;
}

export const firstSessionOptions: FirstSessionOption[] = [
  { key: 'intro', title: 'Introduction Class', color: cat.intro, status: 'Reservation required', statusTone: 'neutral', desc: 'A one-on-one intro on a set beginner curriculum — the best place to start.', cta: 'Book intro' },
  { key: 'private', title: 'Private Class', color: cat.private, status: 'Reservation required', statusTone: 'neutral', desc: 'One-on-one or your own friend group, fully tailored to your goals.', cta: 'Book private' },
  { key: 'group', title: 'Group Class', color: cat.classes, status: 'No reservation', statusTone: 'go', desc: 'Drop into a scheduled class with other beginners — just show up.', cta: 'See schedule' },
  { key: 'opengym', title: 'Open Gym', color: cat.openGym, status: 'No reservation', statusTone: 'go', desc: 'Grab a day pass and train on your own, any time.', cta: 'Open gym info' },
];
