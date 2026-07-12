/**
 * Print/embed layout schema for the Price List.
 *
 * The DB stores a flat map of priceList keys → numeric values
 * (settings.priceList — edited via the Price List settings page).
 * The renderer needs a richer presentation structure: sections grouped
 * across columns, sub-bullets (e.g. Camp daily breakdown), sub-groups
 * (Private Classes' Kids/Adults), and an "intro discount eligible"
 * flag for the ★ marker.
 *
 * This module is the single source of truth for that presentation
 * layout — both the print page and the embed page render through it.
 *
 * Color palette mirrors the badge colors used elsewhere in the app:
 *   blue (Classes), red (Private), yellow (Birthday Party),
 *   orange (Camps), green (Open Gym), gray (Intro/Athletic), black.
 */

// `textOnHeader` is the text color rendered ON TOP of palette.header
// (the colored pill and the .ed-glabel sub-group banner). Defaults to
// white; yellow gets dark text since white-on-yellow fails contrast.
export const PRICE_LIST_PALETTE = {
  blue:   { header: '#1E4FA8', body: '#D7E4F4', divider: '#B6CFE8' },
  red:    { header: '#E63946', body: '#FCE3E3', divider: '#F4C5C5' },
  yellow: { header: '#F9CA1A', body: '#FFF6CC', divider: '#F2DE7A', textOnHeader: '#1a1a1a' },
  orange: { header: '#F5853F', body: '#FDE2D0', divider: '#F4C49B' },
  green:  { header: '#19A95C', body: '#D6F2DF', divider: '#A9DDB9' },
  gray:   { header: '#6E6E6E', body: '#E6E6E6', divider: '#C9C9C9' },
  black:  { header: '#111111', body: '#E6E6E6', divider: '#C9C9C9' },
};

/**
 * The ordered section list. Each section maps to a card on the printed
 * sheet. `colorKey` indexes into PRICE_LIST_PALETTE. `intro: true`
 * enables the 15% intro discount marker (★ on Index, [15% INTRO] pill
 * on Editorial).
 *
 * Items resolve from priceList[priceKey]. Sub-bullets nest under their
 * parent item — supports both static text bullets (e.g. "Min. 8
 * participants") and price-bearing rows (Camp daily breakdown).
 *
 * Groups (mutually exclusive with `items`) split a section into named
 * sub-groups (Kids / Adults).
 *
 * Static-text-only items (no priceKey) are allowed for things like
 * "Party room not included" — they render as bullets without prices.
 */
export const PRICE_LIST_SECTIONS = [
  {
    id: 'classes',
    title: 'Classes',
    color: 'blue',
    intro: true,
    about: [
      'Wide range of disciplines offered: Parkour, acrobatics, tricking, calisthenics, breakdancing, stretching',
      'All classes are drop-in',
      'No long-term commitments required',
      'Day Pass included for that day',
      'No reservation required',
    ],
    groups: [
      {
        label: 'Passes',
        items: [
          { priceKey: 'groupClass1x',  label: '1x Class' },
          { priceKey: 'groupClass10x', label: '10x Classes' },
          { priceKey: 'groupClass20x', label: '20x Classes' },
        ],
      },
      {
        label: 'Memberships',
        items: [
          { priceKey: 'classMembership30',  label: '30 Days Unlimited' },
          { priceKey: 'classMembership90',  label: '90 Days Unlimited' },
          { priceKey: 'classMembership180', label: '180 Days Unlimited' },
          { priceKey: 'classMembership360', label: '360 Days Unlimited' },
        ],
      },
    ],
  },
  {
    id: 'private_classes',
    title: 'Private Classes',
    color: 'red',
    intro: true,
    about: [
      'Tailored training sessions for individuals or small groups, with flexible scheduling and focused, goal-oriented coaching',
      'Day Pass included for that day',
      'Reservation required',
    ],
    groups: [
      {
        label: 'Kids',
        items: [
          { priceKey: 'privateKid1x',       label: '1x Kid' },
          { priceKey: 'privateKid2x',       label: '2x Kids',        suffix: 'each' },
          { priceKey: 'privateKid3xPlus',   label: '3x Kids & More', suffix: 'each' },
          { priceKey: 'privateKid5xBundle', label: '5x Pack Bundle', separated: true },
        ],
      },
      {
        label: 'Adults',
        items: [
          { priceKey: 'privateAdult1x',       label: '1x Adult' },
          { priceKey: 'privateAdult2x',       label: '2x Adults',        suffix: 'each' },
          { priceKey: 'privateAdult3xPlus',   label: '3x Adults & More', suffix: 'each' },
          { priceKey: 'privateAdult5xBundle', label: '5x Pack Bundle', separated: true },
        ],
      },
    ],
  },
  {
    id: 'birthday_party',
    title: 'Birthday Party',
    color: 'yellow',
    intro: false,
    about: [
      'Birthday party packages centered around parkour and movement activities',
      'Party Duration: 2 hours total — 1 hour of instructed activities + 1 hour for food, celebrations and free time around the gym',
      'Food and Decorations: bring your own food, drinks, and decorations',
      'Ask about alternative options if all time slots are booked',
      'Reservations required',
    ],
    groups: [
      {
        label: 'Full Party',
        items: [
          {
            priceKey: 'partyBase', label: 'Basic Package',
            bullets: [
              { text: 'Min. 8 participants' },
              { text: 'Duration: 2 hours' },
              { text: '1 hour lesson' },
              { text: 'Party room included' },
            ],
          },
          { priceKey: 'partyExtraGuest', label: 'Extra guest' },
          {
            priceKey: 'partyExtraHour', label: 'Extra hour of free time', suffix: 'each',
            bullets: [{ text: 'Party room not included' }],
          },
        ],
      },
      {
        label: 'Mini Party',
        items: [
          {
            priceKey: 'partyMiniPerPerson', label: 'Per participant', suffix: '/person',
            bullets: [
              { text: '3–15 participants · age 8+' },
              { text: '1 hour coached session' },
              { text: 'All-day open gym pass included' },
              { text: 'No party room · shared common area' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'camps',
    title: 'Camps',
    color: 'orange',
    intro: false,
    about: [
      'Action-packed parkour training and games for all skill levels — combining skill-building with fun every session',
      'Weekly: Winter, March break, and summer week-long camps. Single day options available',
      'P.A. Day Camp: single-day camp on school P.A. days',
      'Private Day Camp: plan your own private camp with minimum 5 kids',
    ],
    items: [
      {
        priceKey: 'campWeekly', label: 'Full Week (5 days)',
        bullets: [
          { priceKey: 'campDaily', label: '1 day' },
          { priceKey: 'camp2Days', label: '2 days' },
          { priceKey: 'camp3Days', label: '3 days' },
          { priceKey: 'camp4Days', label: '4 days' },
        ],
      },
      { priceKey: 'campPADay',      label: 'P.A. Day Camp' },
      {
        priceKey: 'campPrivateDay', label: 'Private Day Camp',
        bullets: [
          { text: 'Min. 5 participants' },
        ],
      },
      {
        label: 'Late Pickup',
        bullets: [
          { priceKey: 'latePickupPerDay', label: 'Per day' },
          { priceKey: 'latePickupBulk',   label: '4–5 days' },
        ],
      },
    ],
  },
  {
    id: 'open_gym',
    title: 'Open Gym',
    color: 'green',
    intro: true,
    about: [
      'Come use our facility for your own personal training or just play around and have fun',
      'Hours: 11 AM to 10 PM',
      'No reservation required',
    ],
    groups: [
      {
        label: 'Passes',
        items: [
          { priceKey: 'openGym1x',  label: '1x Day Pass' },
          { priceKey: 'openGym10x', label: '10x Day Passes' },
          { priceKey: 'openGym20x', label: '20x Day Passes' },
        ],
      },
      {
        label: 'Memberships',
        items: [
          { priceKey: 'membership30',         label: '30 Days' },
          { priceKey: 'membership90',         label: '90 Days' },
          { priceKey: 'membership180',        label: '180 Days' },
          { priceKey: 'membership360',        label: '360 Days' },
          { priceKey: 'membershipClassAddon', label: 'Class add-on', separated: true },
        ],
      },
    ],
  },
  {
    id: 'introduction_class',
    title: 'Introduction Class',
    color: 'gray',
    intro: false,
    about: [
      'Designed for first-timers — covers parkour basics, essential safety skills, and gym rules to give a good starting point',
      'Typically a one-time class',
      'Day Pass included for that day',
      'Reservation required',
    ],
    items: [
      { priceKey: 'introClass1x',     label: '1x Person' },
      { priceKey: 'introClass2x',     label: '2x People',         suffix: 'each' },
      { priceKey: 'introClass3xPlus', label: '3x People & More',  suffix: 'each' },
    ],
  },
  {
    id: 'athletic_program',
    title: 'Athletic Program',
    color: 'black',
    intro: false,
    about: [
      'Develops versatile, well-rounded athletes through physical conditioning, parkour, and acrobatics training',
      'Training Focus: strength, speed, and readiness to excel in various sports, starting with parkour and acrobatics',
      'Monthly membership is the primary option — best for athletes training multiple times a week',
      '10x Pass is a fallback for athletes who can only attend once a week',
      '1st time trial class available (group class base rate applies)',
      'No reservation required',
    ],
    groups: [
      {
        label: 'Memberships',
        items: [
          { priceKey: 'athleticMembership30', label: '30 Days Membership' },
        ],
      },
      {
        label: 'Passes',
        items: [
          {
            priceKey: 'athleticClass10x', label: '10x Classes',
            bullets: [
              { text: 'Fallback option for athletes attending once a week' },
            ],
          },
          { priceKey: 'athleticClassAddon', label: 'Class add-on', separated: true },
        ],
      },
    ],
  },
];

/**
 * Column distribution (3 columns, top-to-bottom). Sections appear in
 * the order listed within each column. Mirrors the existing Editorial
 * design intent.
 */
// Sections distributed across 3 columns. After consolidating Classes
// (was group_classes + class_memberships) and Open Gym (was open_gym +
// memberships), 7 sections remain — laid out so each column has roughly
// equal vertical content. Tall sections (those with sub-groups) get
// their own column where possible.
// Column order: col 1 has the headline "Classes" + "Private Classes"
// products; col 2 (middle) now hosts the Open Gym / Introduction /
// Athletic group (was col 3); col 3 ends with Birthday Party + Camps.
// Swap done per user request — puts the denser 3-section column in
// the middle of the sheet.
export const PRICE_LIST_COLUMNS = [
  ['classes', 'private_classes'],
  ['open_gym', 'introduction_class', 'athletic_program'],
  ['birthday_party', 'camps'],
];

export const PRICE_LIST_FOOTNOTES = [
  'All classes include open gym for that day.',
  'All prices include taxes.',
  'Passes can be shared with friends and family.',
];

/**
 * Format a numeric price as a display string. Falls back to "$0" when
 * the value is missing or non-numeric so the sheet still renders.
 *   formatPrice(30)              → '$30'
 *   formatPrice(30, 'each')      → '$30 each'
 *   formatPrice(undefined)       → '$0'
 */
export function formatPrice(value, suffix) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  const safe = Number.isFinite(n) ? n : 0;
  // Drop trailing .00 for integer-valued prices ($30 not $30.00)
  const rendered = Number.isInteger(safe) ? `$${safe}` : `$${safe.toFixed(2)}`;
  return suffix ? `${rendered} ${suffix}` : rendered;
}

/**
 * Format the priceListMetadata.lastModifiedAt timestamp as a human
 * "Month YYYY" string. Accepts ISO strings, JS Dates, Firestore
 * Timestamps (with .toDate()), and ms-since-epoch numbers. Returns
 * null for missing / invalid input so callers can omit the eyebrow
 * cleanly.
 *   formatEffective('2026-05-11T...') → 'May 2026'
 *   formatEffective(null)             → null
 */
export function formatEffective(input) {
  if (!input) return null;
  let d;
  if (input instanceof Date) d = input;
  else if (typeof input === 'object' && typeof input.toDate === 'function') d = input.toDate();
  else d = new Date(input);
  if (!d || isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
