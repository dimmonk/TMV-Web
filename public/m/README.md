# `/m/` — mobile PWA assets

The phone experience now lives at `src/pages/m/index.astro` (native Astro,
served at `/TMV-Web/m/`). It reuses the same components and SSOT data as the
desktop site — `OfferingCard`, `BookingCard`, `ClassCard`, `data/site`,
`data/square-links`, and the `src/lib` schedule/price modules — so a card or
data change lands on both surfaces at once.

This folder holds only the static PWA assets that page references:

- `manifest.json` — installable PWA manifest (`start_url` = `.`, i.e. `/m/`).
- `assets/` — the manifest's app icons.

The old design-tool runtime (`mobile.html`, `support.js`, the `*.dc.html`
component exports, `categories.js`, `site-config.js`, `public/js/**`) was
retired when the page was rebuilt in Astro — don't re-add it. The design-tool
component sources remain in `design-reference/` at the repo root as diff
baselines.
