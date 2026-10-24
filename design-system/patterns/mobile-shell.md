# Mobile app shell

From `source/Mobile Website.dc.html` (newest copy), and the Members app concept
`Mobile App Mockup.dc.html` which reuses the same shell.

## App bar
Sticky, ink. Logo 28px and "THE MONKEY VAULT" Archivo 900 13px. On the right an open-status
pill: "Open now" `#5fd07f` on `rgba(95,208,127,.13)` with a pulsing dot, or "Opens 11 AM" muted.
Sub pages show a yellow back chevron and the page title instead of the brand.

## Page hero (every screen except Home)
Full bleed, ink, glow `radial-gradient(360px 200px at 92% -20%, rgba(255,212,0,.16), transparent 70%)`,
eyebrow 10.5px yellow with a dash, H2 Archivo 800 30px, description 14px `.72`, optional
full-width yellow CTA radius 13, optional three-stat rail (Archivo 800 18px yellow).
Older copies used rounded (radius 22) hero cards with side margins.

## Bottom tabs
Fixed, `rgba(28,26,23,.92)` with blur 14. Five: Home, Train, **Book** (a raised yellow circle,
54px, raised 30px), Schedule, More. Active white, inactive `.42`.

## More
Two-column tiles (icon tile with the colour at 14%), a dark Visit us card.

## Screens
Home, Train, Book, Schedule, More, and sub screens Pricing, Store, Get Started, About, Camps,
Register (camp form, tabs hidden), Events, Groups, Reviews. See pages.md.

## Live
`MobileAppHeader.astro` (logo 32px, wordmark 14.5px, same pill), `MobileHero.astro` (same
recipe), `MobileTabBar.astro` (tab "Classes" not "Train", Book circle 64px raised 36px),
`MobileMoreSheet.astro` (a sheet, not a screen). Drift items M1 to M3.
