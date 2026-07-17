/**
 * The home "three ways to get moving" offering cards — SSOT shared by the
 * desktop home (src/pages/index.astro) and the mobile home screen. Each surface
 * resolves its own href from `key`: desktop uses `url(key)`, mobile uses `#key`
 * (the routes and the mobile hashes are the same word). Colors come from `cat`.
 */
import { cat } from './site';

export interface OfferingPoint {
  icon: string;
  text: string;
}

export interface Offering {
  /** route slug / mobile hash — 'train' | 'camps' | 'events' */
  key: string;
  title: string;
  tag: string;
  color: string;
  /** optional media (assets/… path; .mp4 etc. renders as a muted looping video) */
  image?: string;
  /** shown in the striped placeholder when no image is set */
  placeholder: string;
  desc: string;
  back: string;
  points: OfferingPoint[];
}

export const offerings: Offering[] = [
  {
    key: 'train',
    title: 'Train',
    tag: 'Classes · Open Gym',
    color: cat.classes,
    image: 'assets/athletic.mp4',
    placeholder: 'Athletes training — open gym floor or a class mid-session',
    desc: 'Drop in for open gym, book a class, or train like an athlete — every age and level.',
    back: 'How you can train',
    points: [
      { icon: 'bi-unlock', text: 'Open Gym — drop in daily, no time limit' },
      { icon: 'bi-mortarboard', text: 'Group Classes — parkour, flips, calisthenics, tricking & more' },
      { icon: 'bi-trophy', text: 'Athletic Program — structured, athlete-level coaching' },
      { icon: 'bi-person-arms-up', text: 'Private — one-on-one, built around your goals' },
    ],
  },
  {
    key: 'camps',
    title: 'Camps',
    tag: 'Kids 5+',
    color: cat.camps,
    image: 'assets/camps-home.png',
    placeholder: 'Kids at camp — a group shot or a candid mid-activity photo',
    desc: 'Full days of skills, flips, games and friends over school breaks and P.A. days.',
    back: 'Pick your camp',
    points: [
      { icon: 'bi-calendar-week', text: 'Weekly Camps — Winter, March & Summer' },
      { icon: 'bi-people', text: 'Private Day Camp — your own crew, any day' },
      { icon: 'bi-sun', text: 'P.A. Day Camp — single days, open to all' },
    ],
  },
  {
    key: 'events',
    title: 'Events',
    tag: 'Parties · Groups',
    color: cat.parties,
    placeholder: 'A birthday crew mid-celebration — party room or foam pit',
    desc: 'Birthdays that flip, plus group events for schools, teams and organizations.',
    back: 'Celebrate with us',
    points: [
      { icon: 'bi-balloon', text: 'Full & Mini birthday parties' },
      { icon: 'bi-people-fill', text: 'Group events — schools, teams, orgs' },
      { icon: 'bi-sunrise', text: 'Early gym access — the space to yourselves' },
    ],
  },
];
