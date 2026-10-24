# Design handoff — read CHANGELOG.md first

This folder is built for a **coding agent** (e.g. Claude Code) applying
design changes to an existing Astro codebase — not a from-scratch spec.

- **`CHANGELOG.md`** — the only file you need to act on. It lists every
  concrete change made in this design session as an exact OLD → NEW text
  snippet, with the source design file and a guess at the matching Astro
  location. Grep for OLD, replace with NEW. Skip anything already applied.
- **`changed-files/`** — full, current copies of the 6 design files that
  changed this session (`Train.dc.html`, `SectionHeader.dc.html`,
  `Store.dc.html`, `Events.dc.html`, `Camps.dc.html`,
  `Athletic Program.dc.html`). These are HTML *design references*
  (inline-styled prototypes), not code to paste verbatim — use them as the
  ground truth only when a CHANGELOG snippet doesn't match anything in the
  Astro source (i.e. that section has drifted and needs a manual port).

## Workflow going forward

1. Design/iterate in the design tool (this project).
2. At handoff time, this `design_handoff/` folder is regenerated with a
   fresh `CHANGELOG.md` scoped to *only what changed since the last
   handoff*, plus updated `changed-files/`.
3. Hand the zip of this folder (not the whole project) to Claude Code.
   It only needs to read `CHANGELOG.md` and apply the snippets — no need
   to diff entire files or re-scan pages that didn't change.

If Claude Code hits a CHANGELOG snippet whose OLD text isn't found anywhere
(because the Astro implementation of that section looks structurally
different from the HTML prototype), that's expected — read the equivalent
spot in `changed-files/` and port the visual/behavioral intent by hand
rather than trying to force a literal text match.
