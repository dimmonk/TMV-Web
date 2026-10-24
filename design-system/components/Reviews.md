# Reviews

Google reviews section. Source: `source/Reviews.dc.html`. Live: `src/components/Reviews.astro`.

## Parts
- Header row: eyebrow, H2 Archivo 800 36px, subhead, and a Google rating badge on the right (white, radius 16, rating Archivo 900 38px, stars `#ffb400`, Google icon `#4285f4`).
- Cards: grid minmax 300, gap 20; white, radius 18, padding 28px, border `#ebe9e4`; stars; quote mark in yellow 70%; quote 500 15px/1.55 `#3a3833`; avatar circle 42px coloured by a cycling palette; name Archivo 800 14.5px; context 600 12.5px `#9b9890`. Hover lift 4px.
- "Leave a review" ink button, radius 11.

## Props
`brand`, `eyebrow`, `heading`, `subhead`, `ratingValue` (4.9), `ratingCount` (300+), `reviewUrl`.

## Live differences
Live shows the real figures (4.6 from 449 reviews) and three real quotes from `src/data/site.ts`.
The design's 4.9 / 300+ and sample quotes are placeholders. Drift item R1.
