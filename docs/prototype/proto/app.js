// The prototype's router and shell wiring: reads the hash, renders the registered page into #proto-main, repaints when the state
// changes, and handles the three kinds of control (data-nav opens a page, data-act runs a page action, data-proto is review chrome).
import { DEFAULT_PAGE, PAGES } from './registry.js';
import { getState, reset, subscribe } from './store.js';
import { buildHash, resolveRoute } from './router.js';
import { esc } from './ui.js';

const main = document.getElementById('proto-main');
const nav = document.getElementById('proto-nav');
const THEME_KEY = 'proto-theme';
const navigate = (id, ...params) => { location.hash = buildHash(id, ...params); };
const ctx = { navigate };

function notesHtml(notes) {
  if (!notes) return '';
  const list = (items) => (items?.length ? `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '');
  return `<details class="proto-notes"><summary>Design notes</summary>${list(notes.changes)}${notes.decide?.length ? `<strong>To decide</strong>${list(notes.decide)}` : ''}</details>`;
}

function renderNav(activeId) {
  if (!nav) return;
  nav.innerHTML = PAGES.map(({ id, page }) => `<button type="button" class="proto-nav-item${id === activeId ? ' active' : ''}" data-nav="${esc(id)}">${esc(page.title)}</button>`).join('');
}

function markActive(activeId) {
  document.querySelectorAll('[data-nav]').forEach((el) => el.classList.toggle('active', el.dataset.nav === activeId));
}

function paint() {
  const { page: entry, params } = resolveRoute(PAGES, DEFAULT_PAGE, location.hash);
  if (!entry) { main.innerHTML = '<p class="proto-empty">No pages are registered. Add one in proto/registry.js.</p>'; return; }
  const scroll = main.scrollTop;
  renderNav(entry.id);
  markActive(entry.id);
  main.innerHTML = entry.page.render(getState(), params, ctx) + notesHtml(entry.page.notes);
  main.scrollTop = scroll;
  document.title = `${entry.page.title} · prototype`;
}

const currentActions = () => resolveRoute(PAGES, DEFAULT_PAGE, location.hash).page?.page.actions ?? {};

function review(action) {
  if (action === 'reset') reset();
  if (action === 'theme') {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* storage blocked: the choice lasts this page view */ }
  }
  if (action === 'phone') location.href = `phone.html${location.hash}`;
}

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const navEl = target?.closest('[data-nav]');
  if (navEl) { location.hash = `#${navEl.dataset.nav}`; return; }
  const reviewEl = target?.closest('[data-proto]');
  if (reviewEl) { review(reviewEl.dataset.proto); return; }
  const actEl = target?.closest('[data-act]');
  const run = actEl && main.contains(actEl) ? currentActions()[actEl.dataset.act] : null;
  if (run) run(ctx, actEl, event);
});

document.addEventListener('submit', (event) => {
  const form = event.target instanceof HTMLFormElement ? event.target : null;
  const run = form && main.contains(form) ? currentActions()[form.dataset.form] : null;
  if (!run) return;
  event.preventDefault();
  run(ctx, form, event);
  form.reset();
});

if (window.parent !== window) document.querySelector('[data-proto="phone"]')?.remove();
subscribe(paint);
addEventListener('hashchange', paint);
paint();
