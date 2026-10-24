# Handoff: Print Schedule Redesign

## Overview

A redesigned weekly class schedule printable for The Monkey Vault (TMV-Members). The current `print-schedule.html` renders a Bootstrap-style grid of class cards; this redesign replaces it with a tighter, type-driven layout offered in three editions (**Color** / **Editorial** / **B&W**) and four audience filters (**All / Kids / Teens / Adults**).

The schedule is intended to be printed on US Letter (8.5″ × 11″) at landscape — fixed canvas of **1056 × 816 px** — and reads from the same `getPublicSchedule` data shape the existing renderer uses.

## About the Design Files

The files in this bundle are **design references created in HTML** — a working prototype showing the intended look and behavior, not production code to drop in. The job is to **recreate this design inside the existing TMV-Members React/Vite app** at the existing `print-schedule.html` route, replacing the current `schedule-renderer.js` + `schedule-renderer.css`. Keep the existing URL contract (`?width=&height=&orientation=&mode=&age=`) so links from the rest of the site keep working.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and layout are pixel-tuned for the 1056×816 canvas. Recreate pixel-perfectly. The prototype is a single-file React app loaded via Babel-standalone — production should use the codebase's existing React + Vite + CSS pipeline (no Babel-standalone, no inline JSX `<script>` tags).

## Files in this bundle

| File | Role |
|---|---|
| `Print Schedule.html` | The live design canvas — opens 12 artboards (3 editions × 4 filters) using the `design_canvas` starter component. Use for visual reference only; do not ship. |
| `schedule-sheet.jsx` | The actual schedule renderer component. **This is the file to port.** Renames/restructure as appropriate for the codebase (`PrintSchedule.tsx`, etc). |
| `schedule-styles.css` | All sheet styles (header, grid, cards, three-edition variants). **This is the CSS to port.** |
| `mock-data.js` | Mock `MOCK_SCHEDULE` matching the production `getPublicSchedule` return shape — shows the data contract. |

## Data contract

The renderer expects `schedule.classes` — an array of class rows with this shape (already what the existing endpoint returns):

```ts
type ClassRow = {
  day: number;            // 0=Sunday … 6=Saturday
  time: string;           // "11" — 24h start hour as string
  endTime: string;        // "12" — 24h end hour as string
  disciplineName: string; // "PARKOUR", "TRAMPOLINE", …
  ageGroupName: string;   // "Parent & Child", "Kids", "Teens", "Adults", "Teens & Adults"
  color: string;          // hex — discipline brand color
  textColor?: string;     // optional override; otherwise auto-contrast against `color`
  isNew?: boolean;        // shows a "NEW" tag
  isCancelled?: boolean;  // shows an "ENDING" tag + line-through + dimmed
};
```

Age-group classification (`AGE_KEY` in the JSX) is by string match on `ageGroupName`:
- `pc` ← contains "parent" or "child"
- `ta` ← contains "teen" AND "adult"
- `k` ← contains "kid"
- `t` ← contains "teen"
- `a` ← contains "adult"

## URL contract (preserve)

```
print-schedule.html?width=1056&height=816&orientation=landscape&mode=color&age=all
```

| Param | Values | Notes |
|---|---|---|
| `width` / `height` | px | Canvas size. Default 1056×816. |
| `orientation` | `landscape` / `portrait` | Currently only landscape is tuned. |
| `mode` | `color` / `editorial` / `bw` | Visual edition. |
| `age` | `all` / `kids` / `teens` / `adults` | Filter. `kids` includes Parent & Child. `teens` and `adults` both include Teens & Adults. |

Filter logic (port verbatim from `schedule-sheet.jsx`):
- `all` → no filter
- `kids` → `ageKey === 'pc' || 'k'`
- `teens` → `ageKey === 't' || 'ta'`
- `adults` → `ageKey === 'a' || 'ta'`

## Layout system

### Sheet (`.sheet`)

```
┌─────────────────────────────────────────────┐
│ HEADER (auto)                                │
│  TMV mark │ eyebrow + headline + subline │ wk│
├─────────────────────────────────────────────┤
│ BODY (1fr) — CSS grid                        │
│   col 1: time labels                         │
│   col 2-8: Mon..Sun                          │
│   row 1: day headers                         │
│   row 2..N: hour rows (1fr or 0.22fr empty)  │
├─────────────────────────────────────────────┤
│ FOOTER (auto)                                │
│  legend chips │ class duration / late policy │
└─────────────────────────────────────────────┘
```

`.sheet` has `container-type: size` so all interior `cqh` / `cqi` units scale to the sheet.

### Body grid

```js
gridTemplateColumns: '5.5cqi repeat(7, 1fr)'   // time col, then 7 day cols
gridTemplateRows: 'auto ' + rows.map(r => r.isEmpty ? '0.22fr' : 'minmax(0, 1fr)')
```

Hours run from `min(allHours)` to `max(allHours)` **including empty afternoon hours** (1p–4p) — those rows render with a dim time label and diagonal hatching so the morning/evening break reads naturally.

When an hour has multiple classes on the same day (stacked), the renderer creates **sub-rows**: each populated sub-row gets `1fr`, each empty hour `0.22fr`. The time label spans `gridRow: ${hourStart} / span ${stack}` so it stays anchored to its hour.

### Card (`.class`)

```css
.class {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 0.4cqh 5%;        /* vertical = sheet-cqh, horizontal = card-width-% */
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  justify-content: center;
  gap: 0.3cqh;
}
.class.layout-expanded {     /* filtered views — 3 rows */
  justify-content: space-between;  /* name top, age bottom, time floats */
  gap: 0;
}
```

Two layouts driven by filter:
- **`layout-compact`** (used when `filter === 'all'`) — 2 rows: name + meta line (`time · age-abbr`), centered.
- **`layout-expanded`** (used for kids/teens/adults) — 3 rows: name (top) / time (centered in remaining space) / full age label (bottom). `justify-content: space-between` is the key — it adapts to whatever card height the grid produces, so dense schedules and sparse schedules both read well.

Card text color auto-contrasts against the card's background color via `contrastText(rgb)` (luminance > 0.6 → near-black, otherwise white). Editorial and B&W variants override card backgrounds (see Editions below).

## Editions

All three share the same DOM and grid; the difference is `.sheet.v-{color|editorial|bw}` modifier classes.

### `v-color` — print-shop run

- White paper background.
- Cards filled with `c.color` (discipline color), text auto-contrasted.
- Header/footer black-on-white.
- Use case: one-time printed posters, customer-facing.

### `v-editorial` — warm editorial

- Paper: `#f4ede0` (warm off-white).
- Ink: `#1a1612` (near-black) / `#5a4f44` (secondary).
- Cards: **no fill** — just a 4px left rule in `var(--c)` (the discipline color), name + time in ink.
- Use case: framed wall version, a publication not a database.

### `v-bw` — cheap copy-paper

- White paper.
- Cards filled with grayscale tones keyed to age group:
  - `age-pc` → `#f0f0f0`
  - `age-k`  → `#e2e2e2`
  - `age-t`  → `#cdcdcd`
  - `age-ta` → `#b8b8b8`
  - `age-a`  → `#9c9c9c`
- All ink black.
- Use case: in-house Xerox run.

## Design tokens

Defined in `:root` of `schedule-styles.css`:

```css
--paper:     #ffffff;
--ink:       #111111;
--ink-2:     #555555;
--rule:      #1a1a1a;
--rule-soft: rgba(0,0,0,0.10);

/* editorial */
--ed-paper: #f4ede0;
--ed-ink:   #1a1612;
--ed-ink-2: #5a4f44;

/* tags */
--new: #1a7a3a;
--end: #b03030;
```

### Typography

| Role | Family | Size | Weight | Letter-spacing |
|---|---|---|---|---|
| Eyebrow | Roboto Mono | `1.05cqh` | 500 | `0.18em`, uppercase |
| Headline | Oswald | `5.2cqh` | 600 | `0.02em`, uppercase |
| Subline | Oswald | `1.55cqh` | 400 | `0.04em` |
| Day header | Oswald | `1.65cqh` | 600 | `0.18em`, uppercase |
| Time label | Roboto Mono | `1.4cqh` | 500 | `0.04em` |
| Card name | Oswald | `1.85cqh` (compact) / `1.95cqh` (expanded) | 600 | `0.02em`, uppercase, `nowrap + ellipsis` |
| Card meta | Roboto Mono (time) + Oswald (age abbr) | `1.15cqh` | 500 | — |
| Card age (expanded) | Oswald | `1.15cqh` | 500 | `0.06em`, uppercase |
| Footer legend | Oswald | `1.4cqh` | 500 | `0.05em`, uppercase |

All sizes are `cqh` of the `.sheet` container — the sheet is `container-type: size`, so the design scales cleanly when the canvas is enlarged or shrunk.

### Spacing

- Sheet padding: header `1.6cqh 2.2cqi`, footer `1.2cqh 2.2cqi`
- Card padding: `0.4cqh` vertical, `5%` horizontal
- Card gap: `0.3cqh` (compact) / `0` (expanded — `space-between` does the work)
- Grid gap: `0` (cells are separated by 1px borders, not gap)

### Borders & rules

- Sheet border: `0.4cqh solid var(--ink)`
- Header bottom: `0.25cqh solid var(--ink)`
- Time column right edge: `1px solid var(--rule)` (strong vertical)
- Day-header bottom: `1px solid var(--rule)` (strong horizontal)
- Cell sub-row top divider: `1px solid var(--rule-soft)` (hairline)
- Hour-end divider: `1px solid var(--rule-soft)` on the bottom of every populated row
- Empty-hour cells: `repeating-linear-gradient` diagonal hatching at 8% opacity

### Card flags

- `.tag.new` — green (`var(--new)`) outlined "NEW" pill, top-right of card
- `.tag.end` — red (`var(--end)`) outlined "ENDING" pill, top-right
- `.cancelled` — line-through on name, opacity 0.55

## Header content

```jsx
<Header
  headline={meta.h}     // "All Classes" | "Parent & Child · Kids" | "Teens" | "Adults"
  subline={meta.s}      // "Parent & Child · Kids · Teens · Adults" | "(ages 3-6)…" | "Ages 13-17 · includes Teens & Adults classes" | "Ages 18+ · includes Teens & Adults classes"
  week={effective}      // "May 8, 2026" — defaults to today() formatted "MMMM D, YYYY"
/>
```

`headlines` map (lift verbatim):
```js
const headlines = {
  all:    { h: 'All Classes',           s: 'Parent & Child · Kids · Teens · Adults' },
  kids:   { h: 'Parent & Child · Kids', s: 'Parent & Child (ages 3–6) · Kids (ages 7–12)' },
  teens:  { h: 'Teens',                 s: 'Ages 13–17 · includes Teens & Adults classes' },
  adults: { h: 'Adults',                s: 'Ages 18+ · includes Teens & Adults classes' },
};
```

## Age-group label map

```js
const SHORT_AGE = {
  pc: 'PARENT & CHILD',
  k:  'KIDS',
  t:  'TEENS',
  a:  'ADULTS',
  ta: 'TEENS & ADULTS',
};
```

## Footer content

- **Legend** — one chip per unique `disciplineName` seen in the filtered set, with a 0.6cqi square swatch in the discipline color and the name beside it.
- **Notes** — two static lines:
  - `**Class Duration** · 60 min · starts on the hour`
  - `**Late Arrival** · No entry after 15 min · Open Gym available`

## Print integration

The current page already uses the URL params to size the canvas. Keep that. Add a `mode` and `age` param read; pass them as `variant` and `filter` props to the new `<ScheduleSheet>` component. The component itself is purely presentational — it takes a `schedule` prop and renders. Wire `getPublicSchedule()` once at the top of the page and pass the result down.

For PDF export, the existing `window.print()` flow still works — the sheet is sized exactly to the canvas, no media queries needed. Confirm that page margins are zero in the print CSS and that the sheet's own border is inside the printable area.

## Fonts

Two families, both Google Fonts:
- **Oswald** — weights 400, 500, 600
- **Roboto Mono** — weights 400, 500

Add via the codebase's existing font-loading pattern (probably a `<link>` in `index.html` or an `@import` in the global stylesheet).

## What NOT to ship

- The `Print Schedule.html` file is a design canvas wrapping multiple variants for review — do not ship it. Only `schedule-sheet.jsx` + `schedule-styles.css` need to be ported.
- `mock-data.js` is for visual reference only — production reads from the live `getPublicSchedule` response.
- The Babel-standalone script tags, the `<DesignCanvas>` / `<DCSection>` / `<DCArtboard>` wrappers, and the inline JSX-in-HTML pattern are prototyping conveniences. Use the codebase's normal compile pipeline.

## Open questions for the developer

- Confirm the codebase's existing font-loading pattern and whether Oswald/Roboto Mono are already loaded elsewhere.
- Confirm whether `getPublicSchedule` returns `textColor` per row or whether the renderer should compute contrast (the prototype computes it).
- Decide whether the three editions (`color` / `editorial` / `bw`) should be exposed in the admin UI as a dropdown or stay URL-only.
