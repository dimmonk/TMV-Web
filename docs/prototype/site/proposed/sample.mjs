// Sample special events for the proposed build (the members app publishes none yet): the site config's `events`,
// in the shape TMV-Members' `buildSiteEvents` writes, dated from the day the prototype is built.
const PREFIX = 'https://firebasestorage.googleapis.com/v0/b/tmv-management.firebasestorage.app/o/public%2Fsite-events%2F';

/** @param {string} iso @param {number} n */
const addDays = (iso, n) => new Date(Date.parse(`${iso}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
/** The first `weekday` (0 Sunday) at least `after` days from `iso`. */
const next = (iso, weekday, after) => {
  const from = addDays(iso, after);
  return addDays(from, (weekday - new Date(`${from}T12:00:00Z`).getUTCDay() + 7) % 7);
};

export default function sample(published, today) {
  const jamPhoto = `${PREFIX}sev_0000000000000001%2Fjam.jpg?alt=media`;
  const workshopPhoto = `${PREFIX}sev_0000000000000002%2Fworkshop.jpg?alt=media`;
  const events = [
    { id: 'sev_0000000000000001', title: 'Friday Night Parkour Jam', date: next(today, 5, 3), start: '19:00', end: '22:00', note: 'All levels, open gym price. Bring a friend.', link: null, photoUrl: jamPhoto },
    { id: 'sev_0000000000000002', title: 'Backflip Workshop', date: next(today, 6, 9), start: '13:00', end: '15:00', note: 'Ages 10+. Spots are limited.', link: 'https://example.com/backflip-workshop', photoUrl: workshopPhoto },
    { id: 'sev_0000000000000003', title: 'TMV Speed Challenge', date: next(today, 0, 20), start: '11:00', end: '16:00', note: null, link: 'https://example.com/speed-challenge', photoUrl: null },
  ];
  return {
    published: { ...published, 'site-config.json': { ...published['site-config.json'], events } },
    photos: { [jamPhoto]: 'assets/gym-03.jpg', [workshopPhoto]: 'assets/gym-07.jpg' },
  };
}
