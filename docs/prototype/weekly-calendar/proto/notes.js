// Design notes and open questions, shown in the review panel next to the screen.
export const NOTES = Object.freeze([
  'Weeks are never built by hand. Each week is the recurring schedule on real dates, minus the changes staff add in Members (cancel one class on one date, or close the gym for a day).',
  'The website is the only way students hear about a change, so changes are listed above the schedule ("Schedule changes"), not only struck through on the grid. Tap a date in that list to jump to its week.',
  'Four weeks: this week plus the next three. The arrows stop there; nothing in the past.',
  'Desktop shows the whole week, with days already gone faded. The phone list starts at today in the current week.',
  '"Cancelled" (one date) and "Ending" (the class is being retired, every week) are two different tags. Today the Members checkbox called Cancelled actually means Ending.',
  'Desktop look (proposed): the sheet\'s hour grid in the website\'s own parts, the same card, colour rule, kicker and pills as the price list. Switch "Desktop look" to "Printed sheet" to compare. The printed PDF keeps the poster look either way, and one schedule renderer draws both.',
  'Each class keeps its colour as a rule down its left edge. Point at a class and every other time it runs this week stays lit while the rest fades.',
  'Not changed: the sheet look and colours, the age filters, the class popup, the phone day list, the printed PDF (it stays the undated weekly sheet).',
  'Open question: should the "Schedule changes" list also show on the home page, so people see it without opening the schedule?',
]);
