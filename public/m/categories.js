/* ============================================================================
 * The Monkey Vault — category accent colours (single source of truth)
 * ----------------------------------------------------------------------------
 * "Colour by what you're booking." The price list drives these; every page
 * imports from HERE so the Design Language and the live pages can never drift.
 * Change a colour once and the whole site follows.
 * ==========================================================================*/

export const CATEGORIES = [
  { key:'classes',      name:'Classes',      color:'#2196f3', note:'All group classes — Recreational, Flips, Calisthenics, Tricking, Gymnastics.' },
  { key:'athletic',     name:'Athletic',     color:'#ffb82a', note:'The Athletic Program. Dark ink on its chips.' },
  { key:'private',      name:'Private',      color:'#f44336', note:'1-on-1 lessons, kids & adults.' },
  { key:'partner',      name:'Partner',      color:'#0d9488', note:'Stick Fighting & Martial Arts — paid with the coach.' },
  { key:'openGym',      name:'Open Gym',     color:'#2e9e4f', note:'Drop-in passes & early gym access.' },
  { key:'camps',        name:'Camps',        color:'#e27902', note:'Weekly, P.A. Day & Private day camps.' },
  { key:'parties',      name:'Parties',      color:'#e5399b', note:'Birthdays — party pink so parties can signal themselves (was brand yellow).' },
  { key:'groups',       name:'Groups',       color:'#8c52ff', note:'Schools, corporate & team events.' },
  { key:'introduction', name:'Introduction', color:'#6e6e6e', note:'First-timer intro lesson — neutral grey, no category yet.' },
];

const BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

/* Resolve a category key -> accent hex. Unknown keys fall back to neutral. */
export function catColor(key) {
  return (BY_KEY[key] && BY_KEY[key].color) || '#6e6e6e';
}
