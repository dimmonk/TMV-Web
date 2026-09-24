# The Monkey Vault — website (desktop + mobile)

Static site for live testing. `index.html` auto-routes by device:

- **Desktop / wide viewport →** `Home.dc.html` (full desktop site: Home, Train, Schedule, Pricing, Camps, Events, Store, About, Get Started, Private Lessons, Athletic Program, Reviews, Book Now).
- **Phone / narrow viewport →** `mobile.html` (the mobile-first UI with a bottom bar and full-bleed layout).

## Deploy to GitHub Pages

1. Push the **contents of this folder** to a repo (keep the folder structure — `assets/` and `public/` matter).
2. Repo → **Settings → Pages** → *Deploy from a branch* → pick your branch and **/ (root)**.
3. Open the Pages URL. `index.html` handles the desktop/mobile split.

Must be served over HTTP(S) — opening the files directly from disk (`file://`) won't work, because pages load components and data at runtime. GitHub Pages (or any static host) is fine.

## Live data / internet

These load from the network at runtime (so the host needs internet, which live sites have):

- **Class schedule** — `public/schedule.json`, the static CDN projection the members app publishes to Cloud Storage (Schedule page + mobile Schedule tab), read through `fetchPublicSchedule()` in `src/lib/public-projections.js`.
- **Price list** — `public/price-list.json`, same pattern (Pricing page), read through `fetchPublicPriceList()`.
- `src/lib/public-projections.js` and `src/lib/schedule-tags.js` are verbatim copies of the members app's reader (only the import paths differ; TMV-Members ADR-0154). Re-copy them, never edit them here — a mirror test in TMV-Members fails when they drift.
- Fonts (Google Fonts) and icons (Bootstrap Icons) via CDN; gym photos via CDN.

## Editing links & prices in one place

`site-config.js` / `site-config.json` hold the Square booking/store/gift URLs, per-item store links, per-coach booking links, promo bar, hours and social links. Change them there and every page updates.
