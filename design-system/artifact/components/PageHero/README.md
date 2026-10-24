# PageHero

Every desktop page opens on a dark band (SiteHero in the export, `.pagehero` on the site).

- `ink` background with a radial glow top right: radial-gradient(700px 370px at 89% -13%, accent at .13 to .16, transparent 70%).
- Eyebrow Archivo 700 12px .14em in the accent, with a 22 by 2px dash.
- Title `hero-title` (split) or `hero-title-centered`.
- Sub copy `lead`, white at 72%, max 460px.
- One yellow `tmv-btn-hero` and one `tmv-btn-ghost-dark`.
- Optional stat rail: value Archivo 800 26px in the accent, label 600 12.5px white at 60%, divided.
- Split layout: grid 1.05fr .95fr, gap 48px, media 5:4 at `radius-tile` with `shadow-hero-media`; stacks below `bp-md`.

A category page (Athletic, Camps, Birthday Parties, Private Lessons) tints the glow, eyebrow and stats with its `cat-*` colour; the main button stays yellow.
