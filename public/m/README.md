# The Monkey Vault — mobile app-style UI (`/m/`)

The phone experience of the site. Desktop lives at the repo root as the Astro
site (`src/pages/*`); phones are redirected here by the layout's device switch,
and `mobile.html`'s own switch sends desktop-width visitors back to `../`.

## What ships here (runtime closure only)

- `mobile.html` — the entire app-style UI (hash-routed screens).
- `support.js` — the design-tool runtime that renders it.
- `BookingCard.dc.html`, `ClassCard.dc.html`, `OfferingCard.dc.html` — the only
  components `mobile.html` dc-imports at runtime.
- `categories.js`, `site-config.js` + `site-config.json` — category accents and
  the Square link/config source (repoint `CONFIG_URL` to the live members-app
  endpoint when it ships).
- `public/` — the price-list / print-schedule renderer modules + CSS shared
  with the members app.
- `assets/`, `manifest.json`, `index.html` (device router).

The full set of design-tool page mirrors (Home.dc.html, Train.dc.html, …) is
NOT deployed — those are diff baselines and live in `design-reference/` at the
repo root. Don't re-add them here; anything shipped under `public/` is publicly
crawlable and shadows the real site.

## Live data / internet

Loaded from the network at runtime:

- **Class schedule** — `getPublicSchedule` Cloud Function.
- **Price list** — `getPublicPriceList` Cloud Function.
- Fonts (Google Fonts) and icons (Bootstrap Icons) via CDN.
