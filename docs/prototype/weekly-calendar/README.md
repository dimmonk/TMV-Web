---
artifact: https://claude.ai/artifact/Fy7q9ZnrqWqg1KCebKe3Uv
---

# Weekly class calendar prototype

The proposal for a dated weekly class schedule, clicked through before any real code is written. It is one page, kept in
its own folder beside the site's living prototype (`docs/prototype/`, its own README) so the two never touch. It runs inside the
BUILT site (the real header, footer, app chrome and every stylesheet), with the built page's own scripts removed and
the prototype's script in their place, so it can never drift from the live look.

```bash
npm run build && node docs/prototype/weekly-calendar/flatten.mjs   # writes docs/prototype/weekly-calendar/dist/schedule.html (gitignored)
```

Publish that one file with the Artifact tool to the link in the frontmatter above, so the same link updates.

| Path | What |
|---|---|
| `flatten.mjs` | Built `/schedule/` page + inlined CSS, fonts and images, real scripts removed, `proto/` bundled in (rolldown, already installed by Astro). |
| `proto/main.js` | The screens: the desktop sheet is drawn by the live `src/lib/print-schedule-sheet.js`; the phone list repeats `src/lib/mobile-schedule.ts`'s markup. Holds the review panel (Proposed / Live today, This screen / Phone, sample changes, notes). |
| `proto/week.js` | PROPOSED pure logic: dated weeks from the recurring schedule plus exceptions (cancel one class on one date, gym closed for a day). The spec for the real build. |
| `proto/classes.js` | Sample schedule: the live public schedule's 48 classes, ids replaced, no coach names. |
| `proto/data.js` | Invented sample exceptions and the fixed today (Thu 2026-10-22). |
| `proto/notes.js` | Design notes and open questions, shown in the review panel. |
| `proto/proto.css` | Styles for what is proposed and not built (`wk-*`) and the review frame (`proto-*`). |

Rules: sample data never touches production (no fetch, no Firebase); state changes only by replacing one frozen object.

## Status: not built, awaiting sign-off

Brief: `/mnt/project-files/weekly-class-calendar/brief.md` (project files). Decisions taken 2026-10-22: no emails (the
website is the only line to students), "gym closed" days included, four weeks visible.
