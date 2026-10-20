// The Specialized Classes, as the Train page lists them (src/data/classes.ts, shaped by the proposed src/lib/specialized-classes.js).
// This is the site's own public marketing copy, not records: no people, nothing private. A fixed "today" keeps screenshots stable.
export const TODAY = '2026-10-20';

export const OFFER = Object.freeze({
  "booking": "Drop-in",
  "bookingNote": "no reservation needed",
  "price": "$30 single · 10-pack $275",
  "actionLabel": "View schedule"
});

export const CLASSES = Object.freeze([
  {
    "id": "flip-class",
    "name": "Flip Class",
    "days": "",
    "headline": "A levelled path through the air",
    "body": "A safe, progressive route through the flipping fundamentals — Level 1 into Level 2. Always spotted and matted.",
    "who": "Ages 7+ · Levels 1–2",
    "when": "On the schedule",
    "poster": "proto/img/flips.jpg"
  },
  {
    "id": "backflip-only",
    "name": "Backflip Only",
    "days": "Sat",
    "headline": "Chase the one move",
    "body": "A focused session built around a single skill: the standing backflip. Progressions, spotting and reps until it’s yours — always matted.",
    "who": "Adults (18+)",
    "when": "Sat — 12 PM",
    "poster": "proto/img/backflip.jpg"
  },
  {
    "id": "calisthenics",
    "name": "Calisthenics",
    "days": "Weekdays",
    "headline": "Bodyweight strength & control",
    "body": "Bodyweight strength, control and mobility. Stands alone or powers up everything else you train.",
    "who": "Teens & Adults (13+)",
    "when": "Weekday evenings · exact times on the schedule",
    "poster": "proto/img/calisthenics.jpg"
  },
  {
    "id": "tricking",
    "name": "Tricking",
    "days": "Tue · Thu",
    "headline": "Martial arts meets acrobatics",
    "body": "Kicks, flips and twists chained into flowing combos. High-energy — and you build your own style.",
    "who": "Teens & Adults (13+)",
    "when": "Tue · Thu — 7 PM",
    "poster": "proto/img/tricking.jpg"
  },
  {
    "id": "gymnastics",
    "name": "Gymnastics",
    "days": "Tue · Fri",
    "headline": "The foundation under everything",
    "body": "Strength, flexibility and clean form — the fundamentals that make everything else safer and sharper.",
    "who": "Teens & Adults (13+)",
    "when": "Tue · Fri — 6 PM",
    "poster": "proto/img/gymnastics.jpg"
  },
  {
    "id": "strength",
    "name": "Strength",
    "days": "Thu · Fri",
    "headline": "Raw power & resilience",
    "body": "Focused, progressive strength work — heavier loading and conditioning that translates straight into everything else you train.",
    "who": "Teens & Adults (13+)",
    "when": "Thu — 6 PM · Fri — 9 PM",
    "poster": ""
  },
  {
    "id": "flexibility",
    "name": "Flexibility",
    "days": "Fri",
    "headline": "More range, safer movement",
    "body": "Active mobility and flexibility drills that unlock deeper positions and keep you moving well for the long haul.",
    "who": "Teens & Adults (13+)",
    "when": "Fri — 7 PM",
    "poster": ""
  },
  {
    "id": "acro-dance",
    "name": "Acro Dance",
    "days": "Mon",
    "headline": "Where acrobatics turns into artistry",
    "body": "Acrobatic technique through a dancer’s lens — clean lines, extension and controlled transitions built into expressive, performance-ready sequences. A levelled path: start in Level 1 and grow into Level 2.",
    "who": "Teens & Adults (13+) · Levels 1–2",
    "when": "Mon — 7 PM (L1) · 8 PM (L2)",
    "poster": ""
  },
  {
    "id": "handstand",
    "name": "Handstand",
    "days": "Thu",
    "headline": "Find your line, hold it",
    "body": "Wrist prep, alignment and balance drills that build toward a strong, controlled freestanding handstand.",
    "who": "Teens & Adults (13+)",
    "when": "Thu — 8 PM",
    "poster": ""
  },
  {
    "id": "speed-league",
    "name": "Speed League",
    "days": "Wed",
    "headline": "Run it. Beat the clock.",
    "body": "Timed parkour runs with coaching feedback, times posted to a public leaderboard. Open to everyone as a drop-in class and part of the Athletic Program.",
    "who": "Ages 9+ · split 9–14 and 15+",
    "when": "Wed — 6 PM (9–14) · 7 PM (15+)",
    "poster": ""
  }
]);

export const SEED = {
  selected: CLASSES[0].id,
};
