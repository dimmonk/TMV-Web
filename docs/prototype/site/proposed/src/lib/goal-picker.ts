/**
 * Goal picker — "What are you here for?" ASK → RECOMMEND interaction.
 *
 * Every recommendation panel is SERVER-RENDERED; this only swaps which one is
 * visible. Without JS the first goal's recommendation still reads correctly
 * (it carries `.on` from the server), so the section is never empty — the
 * goal rows are the enhancement, not the content.
 *
 * The goals are a vertical tablist (GoalPicker.astro). On a phone the open
 * recommendation sits under its goal, so closing the one above a tapped goal
 * moves the page: the tapped goal is kept in view.
 *
 * Scoped to `root` per the shared-logic rule in CLAUDE.md.
 */
export function mountGoalPickers(selector = '[data-goal-picker]'): void {
  document.querySelectorAll<HTMLElement>(selector).forEach(mountOne);
}

function mountOne(root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-goal-chip]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-goal-panel]'));
  if (!tabs.length || !panels.length) return;

  const show = (tab: HTMLButtonElement, focus = false): void => {
    const id = tab.dataset.goalChip;
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      const on = p.dataset.goalPanel === id;
      p.classList.toggle('on', on);
      p.hidden = !on;
    });
    if (focus) tab.focus();
    // Stacked (phone): the panel is under its row; keep the tapped row on screen.
    const panel = panels.find((p) => p.dataset.goalPanel === id);
    if (panel && panel.getBoundingClientRect().top >= tab.getBoundingClientRect().bottom - 1 && tab.getBoundingClientRect().top < 0) {
      tab.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(tab));
    // A vertical tablist: Up/Down move (Left/Right still accepted).
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      show(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });
}
