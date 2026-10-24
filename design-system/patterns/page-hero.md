# Page hero

Every desktop page opens on a dark band.

- Ink background, a radial glow top right: `radial-gradient(680 to 720px 360 to 380px at 88 to 90% -12 to -15%, accent at .13 to .16, transparent 70%)`.
- Eyebrow with a 22x2 dash in the accent (yellow, or the category colour on a category page).
- H1 Archivo 800, fluid size (see tokens).
- One yellow CTA and one outline CTA.
- Optional stat rail (yellow or category values), optional media on the right (5:4, radius 18), optional badge.
- Get Started uses a centered hero with dashes both sides.

Live: `.pagehero`, `.pagehero-glow`, `.pagehero-kicker`, `.pagehero-title` in `global.css`
(accent through `--ph`), the same recipe. Mobile: see mobile-shell.md.
