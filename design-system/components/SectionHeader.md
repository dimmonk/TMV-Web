# SectionHeader

The numbered heading that opens every content section. Source: `source/SectionHeader.dc.html`.
Live: `src/components/SectionHeader.astro`.

## Parts
- Eyebrow: Archivo 700 12px .14em uppercase `#b0aca3`, with the number (800, accent colour) and a 14x2px accent bar.
- Title: Archivo 800 `clamp(23px, 5.4vw, 34px)`/1.06, -.018em, max 680px, balanced wrap.
- Description: 400 15px/1.55 `#6a6760`, max 600px, 12px above.
- Optional action link: Archivo 800 13px uppercase .04em, 2px accent underline.

## Props
`num`, `eyebrow`, `title`, `description`, `align` (left, center), `theme` (light, dark),
`category` (a categories.js key: its colour replaces yellow as the accent), `actionLabel`, `href`, `brand`.

## Rules
On dark: title white, description `rgba(255,255,255,.7)`, eyebrow `.5`.

## Live differences
Live takes a hex `color` instead of a `category` key. Same visual result. No item.
