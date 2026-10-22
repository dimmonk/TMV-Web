// The Specialized Classes as the Train page builds them: the members app's public schedule and price list, shaped by
// src/lib/specialized-classes.js (snapshot 2026-10-20). Public class listings, no people and nothing private.
export const TODAY = '2026-10-20';

export const OFFER = Object.freeze({ price: "$30 a class · 10 for $275" });

export const CLASSES = Object.freeze([
  {
    "id": "acro-dance",
    "name": "Acro Dance",
    "days": "Mon",
    "who": "Ages 13+ · Levels 1–2",
    "when": [
      "Level 1, ages 13+: Mon — 7 PM",
      "Level 2, ages 13+: Mon — 8 PM"
    ],
    "body": "This class teaches acrobatic moves with an aesthetic focus, designed to be applied in dance contexts. Beyond just performing flips and balances, participants refine their techniques to emphasize beauty and grace, enhancing strength and coordination with an artistic edge.",
    "poster": ""
  },
  {
    "id": "backflip",
    "name": "Backflip",
    "days": "Sat",
    "who": "Ages 18+",
    "when": [
      "Sat — 12 PM"
    ],
    "body": "This class focuses on mastering the backflip, an acrobatic skill, through safe progressions, enhancing strength, coordination, and confidence.",
    "poster": "proto/img/backflip.jpg"
  },
  {
    "id": "calisthenics",
    "name": "Calisthenics",
    "days": "Mon · Wed · Fri",
    "who": "Ages 13+",
    "when": [
      "Mon · Wed · Fri — 6 PM"
    ],
    "body": "Calisthenics classes harness bodyweight training to boost strength, flexibility, and endurance, starting with basics like pull-ups, push-ups, and dips. Advanced practitioners tackle challenging moves such as front levers, muscle-ups, and planches, with scalable options ensuring all levels are pushed to improve functional fitness and athleticism.",
    "poster": "proto/img/calisthenics.jpg"
  },
  {
    "id": "flips",
    "name": "Flips",
    "days": "Tue · Wed · Thu · Fri · Sun",
    "who": "Ages 7–12 · 13–17 · 18+ · Levels 1–2",
    "when": [
      "Level 1, ages 7–12: Thu 6 PM · Sun 12 PM",
      "Level 1, ages 13–17: Tue 7 PM · Sun 1 PM",
      "Level 1, ages 18+: Wed 7 PM · Thu 12 PM · Fri 7 PM",
      "Level 2, ages 18+: Wed · Fri — 8 PM"
    ],
    "body": "This beginner class covers the three basic acrobatic skills: front flip, back flip, and side flip. With a focus on safety and proper technique, participants build confidence and coordination while mastering these foundational flips, preparing them for more advanced training.",
    "poster": "proto/img/flips.jpg"
  },
  {
    "id": "gymnastics",
    "name": "Gymnastics",
    "days": "Tue · Fri",
    "who": "Ages 13+",
    "when": [
      "Tue · Fri — 6 PM"
    ],
    "body": "This class centers on gymnastic-style drills to build a robust foundation for gymnastics, acrobatics, and circus movements. Covering essentials like handstands, cartwheels, and back handsprings, it prioritizes proper technique and progressive skill-building. Perfect for those aiming to develop versatile, foundational skills for any movement discipline.",
    "poster": "proto/img/gymnastics.jpg"
  },
  {
    "id": "flexibility",
    "name": "Flexibility",
    "days": "Fri",
    "who": "Ages 13+",
    "when": [
      "Fri — 7 PM"
    ],
    "body": "Functional Flexibility & Mobility. \n\nTransform your range of motion. This class moves beyond static stretching to focus on active mobility. You'll systematically increase usable flexibility, improve joint health, range of movement and performance. Ideal for athletes, desk workers, and anyone seeking resilient, long-term mobility.",
    "poster": ""
  },
  {
    "id": "tricking",
    "name": "Tricking",
    "days": "Tue · Thu",
    "who": "Ages 13+",
    "when": [
      "Tue · Thu — 7 PM"
    ],
    "body": "Tricking fuses martial arts, gymnastics, and breakdancing into a unique, dynamic movement style. Participants learn spins, kicks, flips, and acrobatic tricks, emphasizing creativity and fluidity. This class is ideal for those eager to challenge themselves and explore innovative ways of moving.",
    "poster": "proto/img/tricking.jpg"
  },
  {
    "id": "strength",
    "name": "Strength",
    "days": "Thu · Fri",
    "who": "Ages 13+",
    "when": [
      "Thu 6 PM · Fri 9 PM"
    ],
    "body": "Foundation Strength HIIT.\n\nBuild a powerful, resilient physique with this strength-centric HIIT class. Through structured intervals of compound functional movements, you'll target every major muscle group, boost your metabolism, and enhance full-body conditioning. Scalable for all levels, the focus is on form, progressive overload, and sustainable results. Expect to leave stronger, inside and out.",
    "poster": ""
  },
  {
    "id": "handstand",
    "name": "Handstand",
    "days": "Thu",
    "who": "Ages 13+",
    "when": [
      "Thu — 8 PM"
    ],
    "body": "The Art of the Handstand.\nUnlock the skill of a balanced, freestanding handstand. This progressive class focuses on the essential components: wrist preр, shoulder stability, core alignment, and balance techniques. Through structured drills and expert coaching, you'll build the strength, body awareness, and confidence to go upside down safely and with control. Perfect for dedicated beginners and those refining their practice.",
    "poster": ""
  },
  {
    "id": "combat",
    "name": "Combat",
    "days": "Sat",
    "who": "Ages 13+",
    "when": [
      "Sat — 9 AM"
    ],
    "body": "Combat-focused training combining Boxing, Muay Thai, Judo, BJJ, Wrestling, and more, with an emphasis on striking, grappling, and practical combat skills.",
    "poster": ""
  }
]);

export const SEED = {
  selected: CLASSES[0].id,
};
