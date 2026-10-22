// TRAIN · SPECIALIZED CLASSES. Approved 2026-10-20 and built (src/components/ClassTabs.astro). Three parts, only one changes:
//   1. the class list (name, plus the days it runs on one line),
//   2. ONE shared block for what every class has in common (drop-in, price, the schedule link), said once,
//   3. ONE panel that changes with the selected class (description, who it is for, when, the clip).
// Comparing classes side by side is the schedule page's job, which the shared block links to. Every class, its
// description, days, times and ages come from the Members schedule; the price from the Members price list.
// The section header is the live SectionHeader markup; the card's rules are in proto/proto.css until it is built.
import { CLASSES, OFFER } from '../data.js';
import { update } from '../store.js';
import { esc } from '../ui.js';

export const title = 'Specialized classes';

export const notes = {
  changes: [
    'Drop-in, price and the schedule button are said once, in the block under the panel. Nothing repeats per class.',
    'The list shows each class and the days it runs, on one line. Exact times are in the panel.',
    'The panel is the only part that changes when you pick a class. The clip fills its side, so there is no empty gap.',
    'On a phone: the list, then the panel with its clip on top, then the shared block.',
    'Classes, descriptions, days, times and ages come from the Members schedule. Levels (Flips 1 and 2) are one entry.',
    'Headlines are empty until they are filled in on Members, Settings, Class types.',
    'Stills stand in for the clips here; on the site the clip plays. Classes with no clip yet show the placeholder.',
  ],
  decide: [],
};

const sectionHeader = `
  <div class="trainsec-head" data-astro-cid-umxd3svy><div class="sh2" style="--brand:#2196f3" data-astro-cid-pb4nux2a>
    <div class="sh2-eyebrow" data-astro-cid-pb4nux2a><span class="num" data-astro-cid-pb4nux2a>02</span><span class="rule" data-astro-cid-pb4nux2a></span>Go Deeper</div>
    <h2 class="sh2-title" data-astro-cid-pb4nux2a>Specialized Classes</h2>
    <p class="sh2-desc" data-astro-cid-pb4nux2a>Focused disciplines on top of recreational parkour. Scan the list, open the one you want to chase hard.</p>
  </div></div>`;

const row = (c, on) => `
  <button type="button" class="ct-row${on ? ' on' : ''}" data-act="pick" data-id="${esc(c.id)}" role="tab" aria-selected="${on}">
    <span class="ct-row-t">${esc(c.name)}</span>
    ${c.days ? `<span class="ct-row-days">${esc(c.days)}</span>` : ''}
    <i class="bi bi-chevron-right ct-row-chev" aria-hidden="true"></i>
  </button>`;

const panel = (c) => `
  <div class="ct-panel" role="tabpanel" aria-label="${esc(c.name)}">
    <div class="ct-copy">
      <h3 class="ct-title">${esc(c.name)}</h3>
      ${c.body ? `<p class="ct-desc">${esc(c.body)}</p>` : ''}
      <div class="ct-facts">
        ${c.who ? `<div class="ct-spec"><span class="ct-spec-l">Who it's for</span><span class="ct-spec-v">${esc(c.who)}</span></div>` : ''}
        <div class="ct-spec"><span class="ct-spec-l">When</span><span class="ct-spec-v">${c.when.map((line) => `<span class="ct-when-line">${esc(line)}</span>`).join('')}</span></div>
      </div>
    </div>
    <div class="ct-media">
      ${c.poster
        ? `<img class="ct-img" src="${esc(c.poster)}" alt="${esc(c.name)}">`
        : '<div class="ct-media-ph" aria-hidden="true"><i class="bi bi-person-arms-up"></i></div>'}
    </div>
  </div>`;

export function render(state) {
  const selected = CLASSES.find((c) => c.id === state.selected) ?? CLASSES[0];
  return `
  <section id="specialized" class="trainsec trainsec-specialized" data-astro-cid-umxd3svy>
    ${sectionHeader}
    <div class="ct" style="--cat:#2196f3">
      <div class="ct-list" role="tablist" aria-orientation="vertical" aria-label="Specialized classes">
        ${CLASSES.map((c) => row(c, c.id === selected.id)).join('')}
      </div>
      <div class="ct-side">
        <div class="ct-detail" id="ct-detail">${panel(selected)}</div>
        <div class="ct-offer">
          <p class="ct-offer-t"><strong>All drop-in${OFFER.price ? `: ${esc(OFFER.price)}` : ''}.</strong> No reservation needed.</p>
          <a href="#specialized" class="btn btn-dark ct-act">View schedule <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
        </div>
      </div>
    </div>
  </section>`;
}

/** The state with `id` selected; pure. */
export const pick = (state, id) => ({ ...state, selected: id });

export const actions = {
  pick: (ctx, el) => {
    update((state) => pick(state, el.dataset.id));
    // Stacked (phone/tablet), the panel sits under the list: bring it into view, as the site does.
    const detail = document.getElementById('ct-detail');
    const list = detail?.closest('.ct')?.querySelector('.ct-list');
    if (detail && list && detail.getBoundingClientRect().top > list.getBoundingClientRect().top + 4) {
      detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  },
};
