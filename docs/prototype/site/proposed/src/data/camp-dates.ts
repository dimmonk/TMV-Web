/**
 * PROPOSED (whole-site prototype): the camp dates a family can book, shown on the Camps page.
 *
 * SAMPLE DATA for the prototype. In the real build these are NOT typed here: staff enter them in Members next to the
 * camp booking links and they reach the site through the published site config, like the hours (one source, edited
 * where staff already edit camps; later the new camp registration flow owns them). Booking stays on Square.
 */
import { sq } from './square-links';

export interface CampDateGroup {
  key: string;
  title: string;
  /** what one booking buys, in a few words */
  unit: string;
  /** the dates in one line, for the cards that link here */
  summary: string;
  dates: { label: string; sub?: string }[];
  href: string;
}

/** One group's dates in a line ('' when the group is not published). */
export const datesSummary = (key: string): string => campDateGroups.find((g) => g.key === key)?.summary ?? '';

export const campDateGroups: CampDateGroup[] = [
  {
    key: 'winter', title: 'Winter Camp', unit: 'Book the week or single days', summary: 'Dec 21 – 24 & Dec 28 – 31',
    dates: [{ label: 'Dec 21 – 24', sub: '4 days' }, { label: 'Dec 28 – 31', sub: '4 days' }],
    href: sq.camps.winterCamp,
  },
  {
    key: 'march', title: 'March Break Camp', unit: 'Book the week or single days', summary: 'Mar 15 – 19',
    dates: [{ label: 'Mar 15 – 19', sub: 'Mon – Fri' }],
    href: sq.camps.marchCamp,
  },
  {
    key: 'summer', title: 'Summer Camp', unit: 'Weekly, Mon – Fri', summary: 'Weekly, Jul 5 – Aug 27',
    dates: ['Jul 5', 'Jul 12', 'Jul 19', 'Jul 26', 'Aug 2', 'Aug 9', 'Aug 16', 'Aug 23'].map((d) => ({ label: `Week of ${d}` })),
    href: sq.camps.summerCamp,
  },
  {
    key: 'paday', title: 'P.A. Day Camps', unit: 'Single days off school', summary: 'Next: Mon, Oct 26',
    dates: [
      { label: 'Mon, Oct 26' }, { label: 'Fri, Nov 20' }, { label: 'Fri, Jan 15' }, { label: 'Tue, Feb 2' },
      { label: 'Fri, Feb 12' }, { label: 'Mon, Feb 15' }, { label: 'Fri, Mar 26' }, { label: 'Fri, Jun 4' },
    ],
    href: sq.camps.paDayCamp,
  },
];

/** The questions parents ask before booking. Facts live here once; both chromes render them. */
export const campFaqs = [
  { q: 'What ages is camp for?', a: 'Ages 5 to 16, all levels. No experience and no intro lesson needed first.' },
  { q: 'When do I drop off and pick up?', a: 'Arrive from 8:45 AM; camp runs 9 AM to 2 PM. Optional late pickup runs to 4 PM.' },
  { q: 'Can we book fewer than five days?', a: 'Yes. Pick single days when you book; each date above is bookable on its own.' },
  { q: 'What should my child bring?', a: 'Clean indoor shoes, comfortable clothes, a labelled water bottle, lunch and snacks. Camp is nut-free.' },
  { q: 'What is the cancellation policy?', a: "Weekly camps: two weeks' written notice. With less, the 15% deposit is kept as an administration fee; with more, $20 is kept for transaction fees. P.A. Days: 24 hours' written notice, or 15% is kept." },
  { q: 'Do the dates match my school?', a: 'P.A. Days follow the main Toronto school boards. Check your own school calendar before booking.' },
];
