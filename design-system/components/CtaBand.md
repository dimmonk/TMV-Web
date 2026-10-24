# CtaBand

Two (or one, or three) big link cards that close a page. Source: `source/CtaBand.dc.html`.
Live: `src/components/CtaBand.astro`.

## Parts
Grid of N columns, gap 18. Card radius 16, padding 28px 30px.
- dark: ink fill, white text, icon tile `rgba(255,255,255,.1)`, eyebrow and arrow yellow.
- light: white, `#ebe9e4` border, icon tile yellow 22%, eyebrow `#b0aca3`.
Icon tile 46px radius 12 (icon 20px); eyebrow Archivo 700 11px .13em; title Archivo 800 23px.
Hover lifts 3px, arrow moves 4px.

## Props
`cards` (`dark|light :: eyebrow :: title :: icon :: href || ...`), `brand`, `ink`.
Default: Price List (dark) and Group Class Schedule (light).

## Live differences
None of note. Live stacks to one column at 720px.
