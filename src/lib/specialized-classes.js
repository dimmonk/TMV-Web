// @ts-check
/**
 * The Specialized Classes card, shaped from the published Members schedule.
 *
 * The schedule in the members app is the one source of which classes run, when
 * and for whom (`fetchPublicSchedule`, public-projections.js). A class is on the
 * card only while it has sessions on that schedule: add one in Members and it
 * appears from the next release, take its last session off and it goes at once
 * (the browser hides it). Levels of one class ("Flips 1", "Flips 2") are ONE
 * entry, with every level's times in its panel. The name
 * and description are the class type's in Members (Settings -> Class
 * types), the same description the schedule's class popup shows. This repo keeps
 * only the clips (`specializedClips`, src/data/classes.ts), keyed by class name,
 * because they are re-encoded by hand before they ship.
 *
 * Pure, and the same in the build (first paint) and the browser (which re-reads
 * the schedule and updates the card in place, lib/class-tabs.ts).
 */

/**
 * @typedef {{ id: string, name: string, description?: string|null, order?: number, accessCategories?: string[] }} Discipline
 * @typedef {{ day: number, time: string, disciplineId: string, ageRange?: string|null, isEnding?: boolean, showOnWebsite?: boolean }} Session
 * @typedef {{ disciplines?: Discipline[], classes?: Session[] }} Schedule
 * @typedef {{ id: string, name: string, days: string, who: string, when: string[], body: string, image: string }} ClassRow
 */

/** Group classes the Core Programs cards on the Train page already present (Recreational). */
export const CORE_DISCIPLINES = Object.freeze(['Parkour']);

/** The access category of a drop-in group class (Athletic-only classes carry `athletic` alone). */
const CLASS_ACCESS = 'classes';

/** Week order, Monday first; indexes are `Date#getDay` (0 = Sunday), as the schedule stores them. */
const WEEK_ORDER = Object.freeze([1, 2, 3, 4, 5, 6, 0]);
const DAY_SHORT = Object.freeze(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
const LEVEL_SUFFIX = /\s+(\d+)$/;

/** @param {string} s */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** "Flips 2" -> { group: "Flips", level: 2 }; "Tricking" -> { group: "Tricking", level: 0 }. */
export function splitLevel(/** @type {string} */ name) {
  const m = LEVEL_SUFFIX.exec(name.trim());
  return m ? { group: name.trim().slice(0, m.index), level: Number(m[1]) } : { group: name.trim(), level: 0 };
}

/** "19:00" -> "7 PM", "19:30" -> "7:30 PM", "12:00" -> "12 PM". */
export function clock(/** @type {string} */ hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Minutes into the week, Monday 00:00 first, for sorting sessions. */
const weekMinute = (/** @type {Session} */ s) => WEEK_ORDER.indexOf(s.day) * 1440 + Number(s.time.slice(0, 2)) * 60 + Number(s.time.slice(3, 5));
/** The youngest age in "7-12" / "13+" / "18+", for sorting. */
const minAge = (/** @type {string} */ range) => Number(/\d+/.exec(range)?.[0] ?? 0);
/** "7-12" -> "7–12". */
const dash = (/** @type {string} */ range) => range.replace('-', '–');

/**
 * Sessions as one line: "Tue · Thu — 7 PM" when they share a time, else
 * "Thu 6 PM · Fri 9 PM".
 * @param {Session[]} sessions - sorted
 */
function timesLine(sessions) {
  const times = new Set(sessions.map((s) => s.time));
  if (times.size === 1) return `${[...new Set(sessions.map((s) => DAY_SHORT[s.day]))].join(' · ')} — ${clock(sessions[0].time)}`;
  return sessions.map((s) => `${DAY_SHORT[s.day]} ${clock(s.time)}`).join(' · ');
}

/**
 * The panel's When: one line per level and age bracket, labelled only when
 * there is more than one.
 * @param {{ level: number, session: Session }[]} entries - sorted
 */
function whenLines(entries) {
  /** @type {Map<string, { level: number, age: string, sessions: Session[] }>} */
  const buckets = new Map();
  entries.forEach(({ level, session }) => {
    const age = session.ageRange ?? '';
    const key = `${level}|${age}`;
    const bucket = buckets.get(key) ?? { level, age, sessions: [] };
    buckets.set(key, { ...bucket, sessions: [...bucket.sessions, session] });
  });
  const list = [...buckets.values()].sort((a, b) => a.level - b.level || minAge(a.age) - minAge(b.age));
  if (list.length === 1) return [timesLine(list[0].sessions)];
  return list.map((b) => {
    const label = [b.level ? `Level ${b.level}` : '', b.age ? `ages ${dash(b.age)}` : ''].filter(Boolean).join(', ');
    return `${label[0].toUpperCase()}${label.slice(1)}: ${timesLine(b.sessions)}`;
  });
}

/**
 * @param {number[]} levels - sorted, unique, non-zero
 * @param {string[]} ages
 */
function whoFor(levels, ages) {
  const sorted = [...new Set(ages.filter(Boolean))].sort((a, b) => minAge(a) - minAge(b)).map(dash);
  const agePart = sorted.length ? `Ages ${sorted.join(' · ')}` : '';
  const levelPart = levels.length > 1 ? `Levels ${levels[0]}–${levels[levels.length - 1]}` : '';
  return [agePart, levelPart].filter(Boolean).join(' · ');
}

/**
 * @param {Schedule | null | undefined} schedule
 * @param {Record<string, string>} [clips] - clip path by class name (the schedule's name without its level number)
 * @returns {ClassRow[]}
 */
export function specializedView(schedule, clips = {}) {
  const disciplines = new Map((schedule?.disciplines ?? []).map((d) => [d.id, d]));
  /** @type {Map<string, { name: string, order: number, entries: { level: number, discipline: Discipline, session: Session }[] }>} */
  const groups = new Map();
  (schedule?.classes ?? []).forEach((session) => {
    const d = disciplines.get(session.disciplineId);
    if (!d || session.isEnding || session.showOnWebsite === false) return;
    if (!(d.accessCategories ?? []).includes(CLASS_ACCESS)) return;
    const { group, level } = splitLevel(d.name);
    if (CORE_DISCIPLINES.includes(group)) return;
    const prev = groups.get(group) ?? { name: group, order: d.order ?? 0, entries: [] };
    groups.set(group, {
      ...prev,
      order: Math.min(prev.order, d.order ?? 0),
      entries: [...prev.entries, { level, discipline: d, session }],
    });
  });

  return [...groups.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)).map((g) => {
    const entries = [...g.entries].sort((a, b) => a.level - b.level || weekMinute(a.session) - weekMinute(b.session));
    const sessions = entries.map((e) => e.session);
    const days = WEEK_ORDER.filter((day) => sessions.some((s) => s.day === day)).map((day) => DAY_SHORT[day]);
    const levels = [...new Set(entries.map((e) => e.level).filter(Boolean))].sort((a, b) => a - b);
    // The description is the lowest level's that has one ("Flips 1" before "Flips 2").
    const body = entries.map((e) => (e.discipline.description ?? '').trim()).find(Boolean) ?? '';
    return {
      id: slug(g.name),
      name: g.name,
      days: days.join(' · '),
      who: whoFor(levels, sessions.map((s) => s.ageRange ?? '')),
      when: whenLines(entries),
      body,
      image: clips[g.name] ?? '',
    };
  });
}
