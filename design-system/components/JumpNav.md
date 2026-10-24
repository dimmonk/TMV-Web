# JumpNav

Sticky in-page navigation under the header. Source: `source/JumpNav.dc.html`.
Live: `src/components/JumpNav.astro`.

## Parts
- Bar: sticky at `top` (66px), z 40, paper `rgba(245,244,241,.92)` with blur 8, bottom border `#e7e5df`.
- Inner: max width 1200 (some pages pass 1120), padding 13px 24px.
- Label "Jump to": Archivo 700 11px .13em `#9b9890`.
- Links: 700 12.5px, padding 7px 13px, radius 999. Idle transparent `#5b5853`; active white with a `#e0c64a` border and ink text.
- Actions on the right, at most two: Archivo 700 13px ink, icon `#e0a800`.
- Back to top: fixed 46px ink circle with a yellow arrow, bottom right, appears after 700px of scroll.
- Scroll spy marks the section in view (offset top + 90).

## Props
`label`, `items` (`Label#id | ...`), `active`, `top`, `maxWidth`, `spy`, `actions` (`Label#href#icon | ...`).

## Rules (source/CLAUDE.md)
Right actions: at most two. A primary action only on pages with one conversion; otherwise
Price List then Full Schedule. Sections set `scroll-margin-top: 120px`.

## Live differences
Live is fixed at 1120px max width and the label and links use Archivo. No item; values match otherwise.
