# TMV-Web — project notes for Claude

Astro static site for The Monkey Vault. Built to `dist/`, deployed to Firebase
Hosting (`themonkeyvault` / themonkeyvault.com) from the **TMV-Members** repo:
`cd ../TMV-Members && firebase deploy --only hosting:web` (its predeploy runs
`scripts/build-web.sh`, which copies this repo's fresh `dist/`). So the deploy
flow is: `npm run build` here → deploy from TMV-Members.

## One responsive document, two chromes

There is **one** front-end. Every route is a normal Astro page using
`BaseLayout`, and the chrome is chosen by a media query — not by a device check.

- **Below `md` (768px)** — the app shell: `MobileAppHeader` (dark sticky header)
  + `MobileTabBar` (fixed bottom tabs) + `MobileMoreSheet`.
- **At `md` and up** — the site chrome: `SiteHeader` + `SiteFooter`.

Both chromes are rendered on every page, unconditionally, and tagged
`data-chrome="app" | "site"`. **The handoff is written exactly once**, in
`src/styles/global.css`. No other file may branch on it, and nothing sniffs the
user agent or redirects.

768 matches the other three TMV apps. The canonical scale is
**640 / 768 / 1024 / 1280** — use those for anything affecting page layout or
chrome (component-internal wrap points may still be bespoke).

> There used to be a second document at `/m/` reached by a JS device-switch
> redirect. It's gone. That design forced an unfolded Galaxy Fold onto the phone
> UI (its UA still says `Mobile`), and it kept producing missing-nav bugs
> whenever a feature landed in only one shell. Don't reintroduce a device fork —
> app-style chrome is just CSS.

## THE RULE: content carries no chrome — the layout sets header/footer/nav

A feature is content. `BaseLayout` owns header, footer and nav. So a feature
must never bake in page chrome, and never assume a viewport.

1. **Shared markup** — an Astro component with no chrome (e.g.
   `components/InvitationMaker.astro`, `components/PartyCard.astro`).
2. **Shared logic** (only if interactive) — a `mount*(root, opts)` module in
   `src/lib` whose queries are scoped to `root` (e.g. `lib/invitation-maker.ts`,
   `lib/camp-reg-form.ts`).
3. **One wiring** — a page renders it inside `BaseLayout`. That's it. There is
   no second surface to register it in, which is the whole point.

**Content must be width-agnostic:** no fixed widths, no baked-in `.container`.
It fills whatever column it's given; width and padding are the layout's job
(see `PartyCard`'s note). It must read correctly from ~320px up.

## Page props that drive the app chrome

On `BaseLayout`:

- `mobileTab` — which bottom tab lights up (`home|train|book|schedule|more`).
- `appHeader` — `'brand'` for the tab destinations, `'back'` for pages beneath
  them (renders a back chevron; `appTitle` labels it, `backHref` targets it).
  Back is a real link, so a cold deep-link from search behaves.

A page cannot forget its nav: both chromes are unconditional, so there is no
opt-out flag to get wrong.

## Navigation IA

The primary nav (`nav` in `data/site.ts`) is deliberately capped at **six**. The
long tail lives in **`src/data/explore.ts`** — one array rendered by both the
mobile More sheet and the desktop footer's Explore column. Add a revenue stream
there once and it appears on both surfaces.
