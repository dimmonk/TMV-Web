// Prototype state. Fake, in-memory, and never a copy of production data: nothing here reads Firestore, a file of real records or
// the network. Every state is deeply frozen and every update returns a NEW state, so a Discard can always return to the saved copy
// and a page can never change another page's data by accident. `reset()` puts the sample data back as proto/data.js wrote it.
import { SEED } from './data.js';

/** Freezes `value` and everything inside it; returns it. */
export function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

const fresh = () => deepFreeze(structuredClone(SEED));
const listeners = new Set();
let state = fresh();

export const getState = () => state;

/** Replaces the state with `change(state)`, which must return a new object (see the list helpers below); then tells the listeners. */
export function update(change) {
  const next = change(state);
  if (next === state) return state;
  if (next === null || typeof next !== 'object') throw new Error('update(change): change must return the next state object');
  state = deepFreeze(next);
  listeners.forEach((listener) => listener(state));
  return state;
}

/** Puts the sample data back exactly as proto/data.js wrote it. */
export function reset() {
  state = fresh();
  listeners.forEach((listener) => listener(state));
  return state;
}

/** Calls `listener(state)` after every update and reset; returns the function that stops it. */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Immutable list helpers: each returns a new array and leaves the old one as it was.
export const append = (list, item) => [...list, item];
export const without = (list, id) => list.filter((item) => item.id !== id);
export const withItem = (list, id, patch) => list.map((item) => (item.id === id ? { ...item, ...patch } : item));
export const nextId = (list, prefix) => `${prefix}${list.reduce((max, item) => Math.max(max, Number(String(item.id).replace(/\D+/g, '')) || 0), 0) + 1}`;
