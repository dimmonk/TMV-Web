/**
 * PROPOSED (whole-site prototype): the parent questions about a birthday party, ONE list for both chromes.
 * The phone used to carry its own four-question copy; now it renders this same list.
 */
export interface PartyFaqGroup { title: string; items: { q: string; a: string }[]; }

export const partyFaqGroups: PartyFaqGroup[] = [
  { title: 'Booking', items: [
    { q: 'When do I pay?', a: "You don't pay anything upfront. The credit card collected during booking is only for our cancellation policy and won't be charged. Payment is made in person on the day of the party, based on the final count of participants — so you only pay for who actually shows up." },
    { q: 'What is the cancellation policy?', a: "A cancellation fee applies if the booking is canceled within 24 hours of the appointment or if there's a no-show. Full details are provided during the booking process." },
    { q: 'What if weekend slots are fully booked?', a: "The availability you see online is all we have — we can't create additional slots. If you have a smaller group, consider the Mini Birthday Party: the same one-hour coached parkour session, with a minimum of just 3 participants ($30 each, max 15), ages 8+. Each kid gets an all-day pass, but it doesn't include a private room — common-area tables are shared and not guaranteed." },
  ] },
  { title: 'Day of the party', items: [
    { q: 'When should we arrive?', a: "The host is welcome to arrive 15 minutes before the scheduled party time. Depending on availability — if there's no party before yours — the room may be ready a little earlier." },
    { q: 'Are there age requirements?', a: "To make sure everyone has a great time, we ask that the group be similar in age. Our coaches tailor the activities and difficulty to the group, so mixing very different ages (e.g. a 4-year-old with 7–8 year olds) doesn't work well." },
  ] },
  { title: 'Food & drinks', items: [
    { q: 'What are the food options?', a: "We don't provide food, drinks or catering — but you're welcome to bring whatever you'd like (cake, pizza, snacks, drinks) with no restrictions or fees. You can also order delivery; Domino's and Pizza Nova are within three blocks and know our location well. We recommend ordering on arrival or ahead of time, and we provide a fridge/freezer to store your items during the party." },
    { q: 'What supplies do you provide?', a: "We provide the party room, tables, and a fridge/freezer for storage. We don't provide plates, cups, utensils, napkins or serving supplies — the host brings all catering items. You're also welcome to bring your own decorations." },
  ] },
  { title: 'During the party', items: [
    { q: 'Can we extend the open gym time?', a: "Yes — just ask the instructor assigned to your party. It's $5 per participant for an extra hour. Note that extending gym time does not extend your party-room time: the room must be vacated at the 2-hour mark so we can prep it for the next group." },
  ] },
];
