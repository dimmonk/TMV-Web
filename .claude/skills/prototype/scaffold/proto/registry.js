// THE STRUCTURE. One registry: every screen of the prototype is one page module listed here, in nav order. The real app's screen map
// (docs/subsystems.md) is what this mirrors; adding a screen means adding a page file and one line below, nothing else.
//
// A page module exports:
//   title             the heading and the nav label
//   render(state, params, ctx)   returns the page's HTML as a string, built with the app's real class names
//   actions           optional { name: (ctx, element, event) => void }, run for a click on [data-act="name"] inside the page
//   notes             optional { changes: [..], decide: [..] }, the design notes shown for the owner's review
import * as example from './pages/example.js';

export const DEFAULT_PAGE = 'example';

export const PAGES = [
  { id: 'example', icon: 'bi-list-check', page: example },
];

export const findPage = (id) => PAGES.find((entry) => entry.id === id) ?? null;
