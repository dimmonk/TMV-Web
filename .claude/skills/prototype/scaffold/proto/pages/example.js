// EXAMPLE PAGE: delete or rewrite once the first real screen exists. It shows the whole contract on one tiny screen: render from
// state, change state only through update() with new objects, handle clicks through `actions`, carry design notes.
// Build the markup with the live app's class names (find the builder in public/js and write the same elements) so the screen looks
// like the app as shipped; the proto-* classes below are the placeholder frame's own.
import { TODAY } from '../data.js';
import { append, nextId, update, without } from '../store.js';
import { esc, rows } from '../ui.js';

export const title = 'Sign-ups';

export const notes = {
  changes: ['Example only: a list you can add to and remove from, to show the page contract.'],
  decide: ['Replace this page with the first screen being designed.'],
};

const row = (signup) => `
  <li class="proto-row" data-id="${esc(signup.id)}">
    <span class="proto-row-main"><strong>${esc(signup.name)}</strong>${signup.note ? `<small>${esc(signup.note)}</small>` : ''}</span>
    <button type="button" class="proto-btn" data-act="remove" data-id="${esc(signup.id)}">Remove</button>
  </li>`;

export function render(state) {
  return `
    <h1>${esc(title)}</h1>
    <ul class="proto-list">${rows(state.signups, row, 'No sign-ups yet.')}</ul>
    <form class="proto-form" data-form="add">
      <input name="name" placeholder="Name" aria-label="Name" required>
      <input name="note" placeholder="Note (optional)" aria-label="Note">
      <button type="submit" class="proto-btn proto-btn-primary">Add</button>
    </form>`;
}

/** The state with one more sign-up; pure, so it is testable without a browser. */
export const addSignup = (state, name, note) => ({
  ...state,
  signups: append(state.signups, { id: nextId(state.signups, 's'), name, note, joined: TODAY }),
});

export const actions = {
  remove: (ctx, el) => update((state) => ({ ...state, signups: without(state.signups, el.dataset.id) })),
  add: (ctx, form) => {
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    if (name) update((state) => addSignup(state, name, String(data.get('note') || '').trim()));
  },
};
