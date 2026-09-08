/**
 * Goal picker — "What are you here for?" ASK → RECOMMEND interaction.
 *
 * Every recommendation panel is SERVER-RENDERED; this only swaps which one is
 * visible. Without JS the first goal's recommendation still reads correctly
 * (it carries `.on` from the server), so the section is never empty — the
 * chips are the enhancement, not the content.
 *
 * Scoped to `root` per the shared-logic rule in CLAUDE.md, so several pickers
 * (desktop composition + phone composition on the same document) never fight.
 */
export function mountGoalPickers(selector = '[data-goal-picker]'): void {
  document.querySelectorAll<HTMLElement>(selector).forEach(mountOne);
}

function mountOne(root: HTMLElement): void {
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-goal-chip]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-goal-panel]'));
  if (!chips.length || !panels.length) return;

  const show = (id: string): void => {
    chips.forEach((c) => {
      const on = c.dataset.goalChip === id;
      c.classList.toggle('on', on);
      c.setAttribute('aria-selected', on ? 'true' : 'false');
      c.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      const on = p.dataset.goalPanel === id;
      p.classList.toggle('on', on);
      p.hidden = !on;
    });
  };

  chips.forEach((chip, i) => {
    chip.addEventListener('click', () => show(chip.dataset.goalChip!));
    // Roving tabindex — a tablist behaves with arrow keys, not just tabs.
    chip.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = chips[(i + dir + chips.length) % chips.length];
      show(next.dataset.goalChip!);
      next.focus();
    });
  });
}
