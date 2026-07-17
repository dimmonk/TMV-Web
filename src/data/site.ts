/**
 * Single source of truth for site-wide data: brand, contact, hours, Square
 * links, socials, per-page SEO, nav. Ported from the design export's
 * site-config.json. Change a value here and every page follows.
 */

/** Prefix an internal path with the deploy base (`/TMV-Web/`). */
export const url = (p: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, '');

export const site = {
  name: 'The Monkey Vault',
  legalName: 'The Monkey Vault Inc.',
  tagline: 'Parkour & Movement Training Centre',
  city: 'Toronto',
  description:
    "Toronto's home for parkour, flips and movement. Drop in to open gym, book a class, send the kids to camp or throw a party — every age, every level.",
  address: {
    street: '75 Carl Hall Rd, Unit 15',
    locality: 'Toronto',
    region: 'ON',
    postalCode: 'M3K 2B9',
    country: 'CA',
    neighbourhood: 'Downsview Park',
  },
  phone: '+1-647-350-1111',
  phoneDisplay: '(647) 350-1111',
  email: 'info@themonkeyvault.com',
  geo: { lat: 43.7276, lng: -79.4788 },
  mapUrl: 'https://maps.google.com/?q=75+Carl+Hall+Rd+Unit+15+Toronto',
  hoursLabel: 'Open 7 days · 11 AM – 10 PM',
} as const;

/** Square / external booking + store URLs. */
export const links = {
  booking: 'https://www.themonkeyvault.com/s/appointments',
  store: 'https://www.themonkeyvault.com/s/order',
  waiver: 'https://tmv-members.web.app/waiver',
  giftCard: 'https://squareup.com/gift/4PQGSAK7CK7FB/order',
  summerCamp:
    'https://www.themonkeyvault.com/product/summer-camps-2026/R2Z7XNZMEXSG6EFR5YQRAFLO',
  paDayCamp:
    'https://www.themonkeyvault.com/product/pa-day-camps/7PGIQLBT3X2QUL5I4XL2VMK7',
  athleticMembership:
    'https://www.themonkeyvault.com/product/athletic-program-monthly-membership/NXP3HEIUKLFQXQT6JBVXMIDW',
  getStartedWaiver: 'https://www.themonkeyvault.com/get-started',
  googleReviews: 'https://www.google.com/maps/place/The+Monkey+Vault',
} as const;

export const social = {
  instagram: 'https://www.instagram.com/themonkeyvault',
  facebook: 'https://www.facebook.com/themonkeyvault',
  youtube: 'https://www.youtube.com/@TheMonkeyVault',
} as const;

export const hours = [
  { day: 'Monday', time: '11:00 AM – 10:00 PM' },
  { day: 'Tuesday', time: '11:00 AM – 10:00 PM' },
  { day: 'Wednesday', time: '11:00 AM – 10:00 PM' },
  { day: 'Thursday', time: '11:00 AM – 10:00 PM' },
  { day: 'Friday', time: '11:00 AM – 10:00 PM' },
  { day: 'Saturday', time: '11:00 AM – 10:00 PM' },
  { day: 'Sunday', time: '11:00 AM – 10:00 PM' },
] as const;

/**
 * Featured customer reviews — SSOT for the Reviews component on both the Home
 * page and /reviews. These are real, hand-curated 5-star Google reviews from
 * the Business Profile (https://maps.app.goo.gl/JB5P5xV6kNPPTfeXA), picked
 * across distinct subjects (families/open gym, birthday parties, adult skills).
 *
 * To refresh: open the Google reviews, copy the strongest recent 5-star ones,
 * and swap the entries below (verbatim excerpts, first name + last initial).
 * `ratingValue`/`ratingCount` are the headline figures shown in the badge —
 * update them from the top of the Google page when they move.
 */
export const reviews = {
  ratingValue: '4.9',
  ratingCount: 'Based on 300+ Google reviews',
  items: [
    {
      quote:
        'My kids love it. They really felt safe and inspired by other peers which helped them break out of their own comfort zones and ended up literally taking big leaps. If you want a place to have fun and connect to a cool community, The Monkey Vault is the place for all ages.',
      name: 'Tim N.',
      context: 'Parent · Open Gym',
    },
    {
      quote:
        "Hosted our daughter's birthday party here and were overall very pleased with the experience. Our guide was very friendly and patient with the kids and took his time to teach them safe ways to enjoy the space. Price was also very reasonable.",
      name: 'Leila',
      context: 'Parent · Birthday Party',
    },
    {
      quote:
        'Super fun place for kids and adults to learn new skills and burn off energy. Classes are a great way to get introduced to new skills, and the 1:1 sessions are a perfect opportunity to really refine them. Such a cool, one-of-a-kind place!',
      name: 'Bronte L.',
      context: 'Member · Classes & 1-on-1',
    },
  ],
} as const;

/** Category accent colors (matches the export's categories.js). SSOT — the
 * `--c-*` vars in styles/global.css mirror these; keep both in sync. */
export const cat = {
  classes: '#2196f3',
  athletic: '#ffb82a',
  private: '#f44336',
  openGym: '#2e9e4f',
  camps: '#e27902',
  parties: '#e5399b',
  groups: '#8c52ff',
  intro: '#6e6e6e',
  partner: '#0d9488',
} as const;

/** Primary nav — label + route key. Routes resolve through `url()`. */
export const nav = [
  { key: 'train', label: 'Train', path: 'train' },
  { key: 'camps', label: 'Camps', path: 'camps' },
  { key: 'events', label: 'Events', path: 'events' },
  { key: 'pricing', label: 'Pricing', path: 'pricing' },
  { key: 'store', label: 'Store', path: 'store' },
  { key: 'about', label: 'About', path: 'about' },
] as const;

/** Per-page SEO copy, ported verbatim from site-config.json's `seo`. */
export const seo = {
  home: {
    title:
      'The Monkey Vault | Parkour & Movement Training Centre in Toronto',
    description:
      "Toronto's home for parkour, flips and movement. Drop in to open gym, book a class, send the kids to camp or throw a party — every age, every level, in Downsview Park.",
  },
  getStarted: {
    title: 'Get Started | The Monkey Vault — Your First Parkour Visit',
    description:
      'New to parkour? Get started at The Monkey Vault in three steps: sign your waiver, book your first session, and learn what to bring. No experience needed.',
  },
  train: {
    title: 'Train | Open Gym, Classes & Athletic Program — The Monkey Vault',
    description:
      'Train parkour your way in Toronto: drop-in open gym, coached classes in flips, calisthenics and tricking, or the structured Athletic Program.',
  },
  camps: {
    title: 'Parkour Camps in Toronto | The Monkey Vault',
    description:
      'Summer, Winter, March Break and P.A. Day parkour camps for kids ages 5+. Expert coaching, skill-building and games, 9 AM–2 PM with late pickup.',
  },
  events: {
    title: 'Birthday Parties & Group Events | The Monkey Vault Toronto',
    description:
      'Throw an unforgettable parkour birthday party or book a group event for your school, team or organization at The Monkey Vault in Toronto.',
  },
  makeInvitation: {
    title: 'Invitation Maker | The Monkey Vault Toronto',
    description:
      "Make a birthday invitation for your Monkey Vault party in seconds — pick a style, fill in the details, and download to text, post or print.",
  },
  pricing: {
    title: 'Passes, Memberships & Pricing | The Monkey Vault',
    description:
      "Open gym day passes, class packages and memberships at The Monkey Vault — Toronto's parkour and movement training centre.",
  },
  store: {
    title: 'Online Store | Passes & Memberships — The Monkey Vault',
    description:
      'Buy open gym passes, visit packs, class packs, memberships and gift cards online — ready at the front desk when you arrive at The Monkey Vault, Toronto.',
  },
  about: {
    title: "About | The Monkey Vault — Toronto's Parkour Community",
    description:
      "Meet The Monkey Vault: Toronto's parkour and movement training centre in Downsview Park, built for every age and every level.",
  },
  privateLessons: {
    title: 'Private Parkour Lessons | The Monkey Vault Toronto',
    description:
      'One-on-one parkour coaching at The Monkey Vault, built around your goals and pace. All ages and levels — book an intro or a private with your coach.',
  },
  athletic: {
    title: 'Athletic Program | Athlete-Level Parkour Training — The Monkey Vault',
    description:
      'Structured, athlete-level parkour training at The Monkey Vault. Coached progressions and progress tracking for dedicated movers, ages 9+.',
  },
  reviews: {
    title: 'Reviews | The Monkey Vault — 4.9★ on Google',
    description:
      'See what Toronto families and athletes say about The Monkey Vault — 300+ Google reviews from parents, open-gym members and first-timers.',
  },
  book: {
    title: 'Book Now | Classes, Private Lessons & Parties — The Monkey Vault',
    description:
      'Book your parkour session at The Monkey Vault: drop in for open gym, reserve a private lesson, register for camp or plan a birthday party.',
  },
  schedule: {
    title: 'Class Schedule | The Monkey Vault — Toronto Parkour',
    description:
      "The Monkey Vault's live group-class schedule — parkour, flips, calisthenics and tricking, filterable by age. Straight from our booking system.",
  },
} as const;

export type PageKey = keyof typeof seo;
