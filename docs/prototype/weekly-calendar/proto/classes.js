// Sample schedule for the prototype: the 48 classes of the live public schedule (a public file) as of 2026-10-22,
// with ids replaced and coach names left out. Read-only: frozen, never fetched.
const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); }); return Object.freeze(o); };

export const SAMPLE_CLASSES = deepFreeze([
 {
  "id": "c01",
  "day": 0,
  "time": "11:00",
  "endTime": "12:00",
  "color": "#00bf63",
  "textColor": null,
  "description": "Designed for children, this class blends parkour movement, flips, and fun games to create an exciting and active experience. Kids develop agility, creativity, and teamwork while learning to overcome obstacles in a safe, supportive setting. It's all about boosting physical fitness and essential movement skills through enjoyable challenges.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Kids",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c02",
  "day": 0,
  "time": "11:00",
  "endTime": "12:00",
  "color": "#ff914d",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c03",
  "day": 0,
  "time": "12:00",
  "endTime": "13:00",
  "color": "#8c52ff",
  "textColor": null,
  "description": "This beginner class covers the three basic acrobatic skills: front flip, back flip, and side flip. With a focus on safety and proper technique, participants build confidence and coordination while mastering these foundational flips, preparing them for more advanced training.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 1",
  "ageGroupName": "Kids",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c04",
  "day": 0,
  "time": "13:00",
  "endTime": "14:00",
  "color": "#545454",
  "textColor": null,
  "description": "This beginner class covers the three basic acrobatic skills: front flip, back flip, and side flip. With a focus on safety and proper technique, participants build confidence and coordination while mastering these foundational flips, preparing them for more advanced training.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 1",
  "ageGroupName": "Teens",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c05",
  "day": 1,
  "time": "12:00",
  "endTime": "13:00",
  "color": "#ffea00",
  "textColor": null,
  "description": "This class emphasizes teaching young children how to navigate their surroundings and control their bodies safely through parkour. With parents actively participating, it creates a supportive environment where kids build spatial awareness, coordination, and confidence. The curriculum uses playful movements and basic parkour techniques to ensure a fun and secure learning experience.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Parent & Child",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c06",
  "day": 1,
  "time": "17:00",
  "endTime": "18:00",
  "color": "#00bf63",
  "textColor": null,
  "description": "Designed for children, this class blends parkour movement, flips, and fun games to create an exciting and active experience. Kids develop agility, creativity, and teamwork while learning to overcome obstacles in a safe, supportive setting. It's all about boosting physical fitness and essential movement skills through enjoyable challenges.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Kids",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c07",
  "day": 1,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#a6a6a6",
  "textColor": null,
  "description": "Calisthenics classes harness bodyweight training to boost strength, flexibility, and endurance, starting with basics like pull-ups, push-ups, and dips. Advanced practitioners tackle challenging moves such as front levers, muscle-ups, and planches, with scalable options ensuring all levels are pushed to improve functional fitness and athleticism.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Calisthenics",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c08",
  "day": 1,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#ff5757",
  "textColor": null,
  "description": "Tailored for teenagers, this class takes parkour to a more advanced level, incorporating flips and conditioning exercises. It challenges participants to enhance their strength, flexibility, and technique while mastering complex movements. The curriculum builds on existing skills, offering a progressive and dynamic training experience.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Teens",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c09",
  "day": 1,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#8c5645",
  "textColor": null,
  "description": "This class teaches acrobatic moves with an aesthetic focus, designed to be applied in dance contexts. Beyond just performing flips and balances, participants refine their techniques to emphasize beauty and grace, enhancing strength and coordination with an artistic edge.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Acro Dance 1",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c10",
  "day": 1,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#ff914d",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c11",
  "day": 1,
  "time": "20:00",
  "endTime": "21:00",
  "color": "#8c5645",
  "textColor": null,
  "description": "To progress to Acro Level 2, students must demonstrate a strong, controlled cartwheel, perform a handstand to bridge, show the ability to backbend and recover independently, and confidently kick into a handstand without support.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Acro Dance 2",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c12",
  "day": 2,
  "time": "12:00",
  "endTime": "13:00",
  "color": "#00bf63",
  "textColor": null,
  "description": "Designed for children, this class blends parkour movement, flips, and fun games to create an exciting and active experience. Kids develop agility, creativity, and teamwork while learning to overcome obstacles in a safe, supportive setting. It's all about boosting physical fitness and essential movement skills through enjoyable challenges.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Kids",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c13",
  "day": 2,
  "time": "17:00",
  "endTime": "18:00",
  "color": "#ffea00",
  "textColor": null,
  "description": "This class emphasizes teaching young children how to navigate their surroundings and control their bodies safely through parkour. With parents actively participating, it creates a supportive environment where kids build spatial awareness, coordination, and confidence. The curriculum uses playful movements and basic parkour techniques to ensure a fun and secure learning experience.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Parent & Child",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c14",
  "day": 2,
  "time": "18:00",
  "endTime": "19:30",
  "color": "#FFCA28",
  "textColor": null,
  "description": null,
  "accessCategories": [
   "athletic"
  ],
  "showOnWebsite": true,
  "disciplineName": "Athletic",
  "ageGroupName": "9-14 years old",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c15",
  "day": 2,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#d9d9d9",
  "textColor": null,
  "description": "This class centers on gymnastic-style drills to build a robust foundation for gymnastics, acrobatics, and circus movements. Covering essentials like handstands, cartwheels, and back handsprings, it prioritizes proper technique and progressive skill-building. Perfect for those aiming to develop versatile, foundational skills for any movement discipline.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Gymnastics",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c16",
  "day": 2,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#00bf63",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Kids",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c17",
  "day": 2,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#545454",
  "textColor": null,
  "description": "This beginner class covers the three basic acrobatic skills: front flip, back flip, and side flip. With a focus on safety and proper technique, participants build confidence and coordination while mastering these foundational flips, preparing them for more advanced training.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 1",
  "ageGroupName": "Teens",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c18",
  "day": 2,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#38b6ff",
  "textColor": null,
  "description": "Tricking fuses martial arts, gymnastics, and breakdancing into a unique, dynamic movement style. Participants learn spins, kicks, flips, and acrobatic tricks, emphasizing creativity and fluidity. This class is ideal for those eager to challenge themselves and explore innovative ways of moving.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Tricking",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c19",
  "day": 2,
  "time": "19:30",
  "endTime": "21:00",
  "color": "#FFCA28",
  "textColor": null,
  "description": null,
  "accessCategories": [
   "athletic"
  ],
  "showOnWebsite": true,
  "disciplineName": "Athletic",
  "ageGroupName": "15+ years old",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c20",
  "day": 2,
  "time": "20:00",
  "endTime": "21:00",
  "color": "#ff914d",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c21",
  "day": 3,
  "time": "12:00",
  "endTime": "13:00",
  "color": "#cb6ce6",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Women's only",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c22",
  "day": 3,
  "time": "17:00",
  "endTime": "18:00",
  "color": "#00bf63",
  "textColor": null,
  "description": "Designed for children, this class blends parkour movement, flips, and fun games to create an exciting and active experience. Kids develop agility, creativity, and teamwork while learning to overcome obstacles in a safe, supportive setting. It's all about boosting physical fitness and essential movement skills through enjoyable challenges.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Kids",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c23",
  "day": 3,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#a6a6a6",
  "textColor": null,
  "description": "Calisthenics classes harness bodyweight training to boost strength, flexibility, and endurance, starting with basics like pull-ups, push-ups, and dips. Advanced practitioners tackle challenging moves such as front levers, muscle-ups, and planches, with scalable options ensuring all levels are pushed to improve functional fitness and athleticism.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Calisthenics",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c24",
  "day": 3,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#ff914d",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c25",
  "day": 3,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#004aad",
  "textColor": null,
  "description": "This beginner class covers the three basic acrobatic skills: front flip, back flip, and side flip. With a focus on safety and proper technique, participants build confidence and coordination while mastering these foundational flips, preparing them for more advanced training.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 1",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c26",
  "day": 3,
  "time": "20:00",
  "endTime": "21:00",
  "color": "#004aad",
  "textColor": null,
  "description": "For those proficient enough with the basics, this intermediate class delves into variations of the front flip, back flip, and side flip, offering more advanced techniques. Participants explore flips from heights, hanging positions, and with twists, enhancing strength, coordination, and aerial awareness.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 2",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c27",
  "day": 4,
  "time": "12:00",
  "endTime": "13:00",
  "color": "#004aad",
  "textColor": null,
  "description": "This beginner class covers the three basic acrobatic skills: front flip, back flip, and side flip. With a focus on safety and proper technique, participants build confidence and coordination while mastering these foundational flips, preparing them for more advanced training.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 1",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c28",
  "day": 4,
  "time": "17:00",
  "endTime": "18:00",
  "color": "#ff5757",
  "textColor": null,
  "description": "Tailored for teenagers, this class takes parkour to a more advanced level, incorporating flips and conditioning exercises. It challenges participants to enhance their strength, flexibility, and technique while mastering complex movements. The curriculum builds on existing skills, offering a progressive and dynamic training experience.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Teens",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c29",
  "day": 4,
  "time": "18:00",
  "endTime": "19:30",
  "color": "#FFCA28",
  "textColor": null,
  "description": null,
  "accessCategories": [
   "athletic"
  ],
  "showOnWebsite": true,
  "disciplineName": "Athletic",
  "ageGroupName": "9-14 years old",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c30",
  "day": 4,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#8c52ff",
  "textColor": null,
  "description": "This beginner class covers the three basic acrobatic skills: front flip, back flip, and side flip. With a focus on safety and proper technique, participants build confidence and coordination while mastering these foundational flips, preparing them for more advanced training.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 1",
  "ageGroupName": "Kids",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c31",
  "day": 4,
  "time": "18:00",
  "endTime": "19:30",
  "color": "#009688",
  "textColor": null,
  "description": "Foundation Strength HIIT.\n\nBuild a powerful, resilient physique with this strength-centric HIIT class. Through structured intervals of compound functional movements, you'll target every major muscle group, boost your metabolism, and enhance full-body conditioning. Scalable for all levels, the focus is on form, progressive overload, and sustainable results. Expect to leave stronger, inside and out.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Strength",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c32",
  "day": 4,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#ff914d",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c33",
  "day": 4,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#38b6ff",
  "textColor": null,
  "description": "Tricking fuses martial arts, gymnastics, and breakdancing into a unique, dynamic movement style. Participants learn spins, kicks, flips, and acrobatic tricks, emphasizing creativity and fluidity. This class is ideal for those eager to challenge themselves and explore innovative ways of moving.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Tricking",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c34",
  "day": 4,
  "time": "19:30",
  "endTime": "21:00",
  "color": "#FFCA28",
  "textColor": null,
  "description": null,
  "accessCategories": [
   "athletic"
  ],
  "showOnWebsite": true,
  "disciplineName": "Athletic",
  "ageGroupName": "15+ years old",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c35",
  "day": 4,
  "time": "20:00",
  "endTime": "21:00",
  "color": "#F52750",
  "textColor": null,
  "description": "The Art of the Handstand.\nUnlock the skill of a balanced, freestanding handstand. This progressive class focuses on the essential components: wrist preр, shoulder stability, core alignment, and balance techniques. Through structured drills and expert coaching, you'll build the strength, body awareness, and confidence to go upside down safely and with control. Perfect for dedicated beginners and those refining their practice.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Handstand",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c36",
  "day": 5,
  "time": "12:00",
  "endTime": "13:00",
  "color": "#ff914d",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c37",
  "day": 5,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#a6a6a6",
  "textColor": null,
  "description": "Calisthenics classes harness bodyweight training to boost strength, flexibility, and endurance, starting with basics like pull-ups, push-ups, and dips. Advanced practitioners tackle challenging moves such as front levers, muscle-ups, and planches, with scalable options ensuring all levels are pushed to improve functional fitness and athleticism.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Calisthenics",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c38",
  "day": 5,
  "time": "18:00",
  "endTime": "19:00",
  "color": "#d9d9d9",
  "textColor": null,
  "description": "This class centers on gymnastic-style drills to build a robust foundation for gymnastics, acrobatics, and circus movements. Covering essentials like handstands, cartwheels, and back handsprings, it prioritizes proper technique and progressive skill-building. Perfect for those aiming to develop versatile, foundational skills for any movement discipline.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Gymnastics",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c39",
  "day": 5,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#5e17eb",
  "textColor": null,
  "description": "Functional Flexibility & Mobility. \n\nTransform your range of motion. This class moves beyond static stretching to focus on active mobility. You'll systematically increase usable flexibility, improve joint health, range of movement and performance. Ideal for athletes, desk workers, and anyone seeking resilient, long-term mobility.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flexibility",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c40",
  "day": 5,
  "time": "19:00",
  "endTime": "20:00",
  "color": "#004aad",
  "textColor": null,
  "description": "This beginner class covers the three basic acrobatic skills: front flip, back flip, and side flip. With a focus on safety and proper technique, participants build confidence and coordination while mastering these foundational flips, preparing them for more advanced training.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 1",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c41",
  "day": 5,
  "time": "20:00",
  "endTime": "21:00",
  "color": "#004aad",
  "textColor": null,
  "description": "For those proficient enough with the basics, this intermediate class delves into variations of the front flip, back flip, and side flip, offering more advanced techniques. Participants explore flips from heights, hanging positions, and with twists, enhancing strength, coordination, and aerial awareness.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Flips 2",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c42",
  "day": 5,
  "time": "21:00",
  "endTime": "22:30",
  "color": "#009688",
  "textColor": null,
  "description": "Foundation Strength HIIT.\n\nBuild a powerful, resilient physique with this strength-centric HIIT class. Through structured intervals of compound functional movements, you'll target every major muscle group, boost your metabolism, and enhance full-body conditioning. Scalable for all levels, the focus is on form, progressive overload, and sustainable results. Expect to leave stronger, inside and out.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Strength",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c43",
  "day": 6,
  "time": "09:00",
  "endTime": "10:00",
  "color": "#2A9D8F",
  "textColor": null,
  "description": "Combat-focused training combining Boxing, Muay Thai, Judo, BJJ, Wrestling, and more, with an emphasis on striking, grappling, and practical combat skills.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Combat",
  "ageGroupName": "Teens & adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c44",
  "day": 6,
  "time": "11:00",
  "endTime": "12:00",
  "color": "#00bf63",
  "textColor": null,
  "description": "Designed for children, this class blends parkour movement, flips, and fun games to create an exciting and active experience. Kids develop agility, creativity, and teamwork while learning to overcome obstacles in a safe, supportive setting. It's all about boosting physical fitness and essential movement skills through enjoyable challenges.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Kids",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c45",
  "day": 6,
  "time": "11:00",
  "endTime": "12:00",
  "color": "#ff914d",
  "textColor": null,
  "description": "This class offers parkour, flips, and conditioning for adults, adapting to the skill levels of attendees - from beginners to intermediate practitioners. Whether you're starting your parkour journey or honing your abilities, the content varies to meet your needs, providing a comprehensive and flexible training session focused on fundamentals and progression.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c46",
  "day": 6,
  "time": "12:00",
  "endTime": "13:00",
  "color": "#004aad",
  "textColor": null,
  "description": "This class focuses on mastering the backflip, an acrobatic skill, through safe progressions, enhancing strength, coordination, and confidence.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Backflip",
  "ageGroupName": "Adults",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c47",
  "day": 6,
  "time": "12:00",
  "endTime": "13:00",
  "color": "#ffea00",
  "textColor": null,
  "description": "This class emphasizes teaching young children how to navigate their surroundings and control their bodies safely through parkour. With parents actively participating, it creates a supportive environment where kids build spatial awareness, coordination, and confidence. The curriculum uses playful movements and basic parkour techniques to ensure a fun and secure learning experience.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Parent & Child",
  "isNew": false,
  "isCancelled": false
 },
 {
  "id": "c48",
  "day": 6,
  "time": "13:00",
  "endTime": "14:00",
  "color": "#ff5757",
  "textColor": null,
  "description": "Tailored for teenagers, this class takes parkour to a more advanced level, incorporating flips and conditioning exercises. It challenges participants to enhance their strength, flexibility, and technique while mastering complex movements. The curriculum builds on existing skills, offering a progressive and dynamic training experience.",
  "accessCategories": [
   "classes"
  ],
  "showOnWebsite": true,
  "disciplineName": "Parkour",
  "ageGroupName": "Teens",
  "isNew": false,
  "isCancelled": false
 }
]);

/** The variant and filter the live schedule opens on (its scheduleDisplay). */
export const SAMPLE_DISPLAY = deepFreeze({"variant": "color", "filter": "all"});
