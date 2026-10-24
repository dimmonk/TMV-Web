# SiteHero

The dark page hero, as a component. Source: `source/SiteHero.dc.html`.
Live: no `SiteHero` component. Live uses the shared `.pagehero` classes in `global.css`
plus page-specific heroes. The Website Audit notes SiteHero was unused by the design's own pages too.

## Layouts
- `split`: grid 1.05fr .95fr, gap 48; media 5:4, radius 18, 3px `rgba(255,255,255,.08)` border, big shadow, yellow badge bottom right. Stacks below 820px.
- `centered`: padding 88px 96px, title `clamp(40px, 9vw, 68px)`.
- stats: a rail of numbers under the copy.

## Parts
- Eyebrow Archivo 700 12px .14em yellow with a 22x2px dash.
- H1 Archivo 800 `clamp(38px, 8.5vw, 58px)`/1.0, -.022em.
- Sub 16px/1.55 `rgba(255,255,255,.72)`, max 460px.
- Primary CTA: yellow, Archivo 800 15px uppercase, padding 16px 26px, radius 12, arrow.
- Secondary CTA: outline 1.5px `rgba(255,255,255,.25)`, 700 15px, radius 12.
- Stats: value Archivo 800 26px yellow, label 600 12.5px `rgba(255,255,255,.6)`, divided.
- Optional "New here?" line under the CTAs.

## Props
`layout`, `eyebrow`, `title`, `sub`, `primaryCta`, `secondaryCta`, `stats` (`value :: label | ...`), `image`, `badge`, `brand`.

## Rules
One yellow CTA, the second is outline. A category page may tint the glow, eyebrow and
stat values with its category colour; the CTA stays yellow (Athletic, Camps, Events,
Private Lessons do this).
