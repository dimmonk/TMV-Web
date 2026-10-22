// Invented sample exceptions: what staff would add in Members. Never real records.
// The prototype's fixed today is Thursday 2026-10-22 (gym time), so the four visible weeks are Oct 19 to Nov 15.
const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); }); return Object.freeze(o); };

export const TODAY = '2026-10-22';

export const SAMPLE_EXCEPTIONS = deepFreeze([
  { type: 'cancel', classId: 'c41', date: '2026-10-23', reason: 'Coach away', label: 'Flips 2 (Adults) cancelled' },
  { type: 'cancel', classId: 'c18', date: '2026-10-27', reason: 'Coach at a competition', label: 'Tricking cancelled' },
  { type: 'closed', date: '2026-10-31', reason: 'Halloween', label: 'Gym closed for Halloween' },
  { type: 'cancel', classId: 'c35', date: '2026-11-12', reason: '', label: 'Handstand cancelled, no reason given' },
]);
