// @ts-check
/**
 * The Specialized Classes card, shaped from the class catalog.
 *
 * Every specialized class is booked, priced and actioned the same way, so the
 * card says that ONCE (`offer`) and each class carries only what genuinely
 * differs: name, headline, body, who it is for, when it runs. A class that
 * stops matching the others would make the shared block wrong for it, so that
 * is a build error naming the class, never a silently wrong price.
 *
 * Pure: media (which needs the filesystem) is resolved by the component.
 */

/**
 * @typedef {import('../data/classes').ClassItem} ClassItem
 * @typedef {{ booking: string, bookingNote: string, price: string, link: ClassItem['link'], actionLabel: string }} ClassOffer
 * @typedef {{ id: string, name: string, who: string, when: string, days: string, headline: string, body: string, image: string }} ClassRow
 */

/** Shown in the When column for a class whose times live only on the schedule. */
export const NO_FIXED_TIME = 'On the schedule';

const WEEKDAYS = Object.freeze(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

/**
 * The days a class runs, short enough for one line beside its name: the
 * weekdays its schedule names, in week order ("Thu — 6 PM · Fri — 9 PM" reads
 * "Thu · Fri"), "Weekdays" for weekday evenings, else nothing (the panel still
 * shows the full schedule).
 * @param {string} schedule
 */
export function scheduleDays(schedule) {
  const named = WEEKDAYS.filter((d) => new RegExp(`\\b${d}`, 'i').test(schedule));
  if (named.length) return named.join(' · ');
  return /\bweekday/i.test(schedule) ? 'Weekdays' : '';
}

/** @param {string} s */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * `specs` is "Level: … || Ages: … || Schedule: … || Booking: … || Price: …";
 * read it into a map keyed by the lower-cased label.
 * @param {string} specs
 * @returns {Record<string, string>}
 */
export function parseSpecs(specs) {
  return Object.fromEntries(
    specs.split('||').map((s) => s.trim()).filter(Boolean).map((row) => {
      const i = row.indexOf(':');
      return i >= 0 ? [row.slice(0, i).trim().toLowerCase(), row.slice(i + 1).trim()] : ['', row];
    }),
  );
}

/**
 * Who a class is for: its ages ("7+" reads "Ages 7+"), then its level unless
 * it is open to every level.
 * @param {Record<string, string>} s
 */
function whoFor(s) {
  const ages = s.ages ? (/^\d/.test(s.ages) ? `Ages ${s.ages}` : s.ages) : '';
  const level = s.level && !/^all levels/i.test(s.level) ? s.level : '';
  return [ages, level].filter(Boolean).join(' · ');
}

/** @param {ClassItem} c */
function offerOf(c) {
  const s = parseSpecs(c.specs);
  const [, ...note] = (s.booking ?? '').split('·').map((p) => p.trim());
  return {
    booking: c.bookingTag,
    bookingNote: note.join(' · '),
    price: s.price ?? '',
    link: c.link,
    actionLabel: c.actionLabel,
  };
}

/**
 * @param {ClassItem[]} classes
 * @returns {{ offer: ClassOffer, rows: ClassRow[] }}
 */
export function specializedView(classes) {
  if (!classes.length) throw new Error('[specialized-classes] no classes to show');
  const offer = offerOf(classes[0]);
  const key = JSON.stringify(offer);
  const odd = classes.find((c) => JSON.stringify(offerOf(c)) !== key);
  if (odd) {
    throw new Error(`[specialized-classes] "${odd.title}" is booked, priced or actioned differently from "${classes[0].title}"; the card states those once for every class (src/data/classes.ts)`);
  }
  if (!offer.price) throw new Error(`[specialized-classes] "${classes[0].title}" has no Price in its specs`);

  const rows = classes.map((c) => {
    const s = parseSpecs(c.specs);
    return {
      id: slug(c.title),
      name: c.title,
      who: whoFor(s),
      when: s.schedule || NO_FIXED_TIME,
      days: scheduleDays(s.schedule ?? ''),
      headline: c.backHeadline,
      body: c.backBody,
      image: c.image,
    };
  });
  return { offer, rows };
}
