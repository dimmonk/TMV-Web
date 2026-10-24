# Faq

Accordion of questions. Source: `source/Faq.dc.html`. Live: `src/components/Faq.astro`.

## Parts
Paper section, max 880, padding 72px 24px. Centered eyebrow, H2 Archivo 800 36px, subhead.
Items: white, radius 14, border `#ebe9e4` (`#dcd9d1` when open), padding 20px 24px, light
shadow. Question Archivo 700 16px `#2b2925`; a yellow plus that turns 45 degrees; answer
400 14px/1.6 `#5a574f`, animated open. Footer: "Still have a question? Email us / call".

## Props
`brand`, `eyebrow`, `heading`, `subhead`, plus the item list.

## Rules
The standalone FAQ page was retired; the FAQ lives in Get Started (Website Audit round 1).
The Events page uses a second, different accordion (patterns/accordions.md, drift item A1).

## Live differences
Live uses native `details` with the same look. Arrival cutoff wording: drift item C3.
