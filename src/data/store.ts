/**
 * Online store products — SINGLE SOURCE OF TRUTH shared by the desktop Store
 * page (src/pages/store.astro) and the mobile Store screen (src/pages/m/index.astro).
 * Both render these with the shared BookingCard; desktop groups them by
 * `section` under its section headers, mobile shows the flat list. Edit a
 * product once and both update. Prices/links flow from the price + Square SSOTs.
 */
import { cat } from './site';
import { sq } from './square-links';

export type StoreSection = 'opengym' | 'classes' | 'athletic';

export interface StoreProduct {
  section: StoreSection;
  color: string;
  title: string;
  description: string;
  pills: string;
  price: string;
  priceNote: string;
  href: string;
}

export const storeProducts: StoreProduct[] = [
  { section: 'opengym', color: cat.openGym, title: 'Day Passes', description: 'Your ticket to the gym — walk in and train as long as you like. Buy one visit, or save with a pack of 10 or 20.', pills: 'All ages | No time limit', price: 'From $25', priceNote: 'single pass', href: sq.store.dayPasses },
  { section: 'opengym', color: cat.openGym, title: 'Open Gym Membership', description: 'Come every day if you want — unlimited open gym for whatever stretch suits you, 30 days to a full year.', pills: 'Unlimited visits | 30–360 days', price: 'From $110', priceNote: '30 days', href: sq.store.openGymMembership },
  { section: 'classes', color: cat.classes, title: 'Class Passes', description: 'Good for any group class on the schedule — no reservation, just show up. Buy one class, or save with a pack of 10 or 20.', pills: 'Any group class | All levels', price: 'From $30', priceNote: 'single class', href: sq.store.classPasses },
  { section: 'classes', color: cat.classes, title: 'Class Membership', description: 'Everything drop-in, one flat month — unlimited group classes and unlimited open gym for 30 days.', pills: 'Classes + open gym | Unlimited', price: '$180', priceNote: '30 days', href: sq.store.classMembership },
  { section: 'classes', color: cat.private, title: 'Private Class Pack', description: "A block of private lessons at a better rate — pay once, then book each session with your coach when you're ready.", pills: '1-on-1 or small group | Book as you go', price: 'From $250', priceNote: '5-pack · kids', href: sq.store.privateClassPack },
  { section: 'athletic', color: cat.athletic, title: 'Athletic Membership', description: 'Unlimited Athletic Program training — grab a single month, or set it to auto-renew and pause or cancel any time.', pills: 'Ages 9+ | One-time or auto-renew', price: '$150', priceNote: 'per month', href: sq.store.athleticMembership },
];

export const storeBySection = (s: StoreSection) => storeProducts.filter((p) => p.section === s);
