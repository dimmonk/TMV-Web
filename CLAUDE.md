# TMV-Web — project notes for Claude

Astro static site for The Monkey Vault. Built to `dist/`, deployed to Firebase
Hosting (`themonkeyvault` / themonkeyvault.com) from the **TMV-Members** repo:
`cd ../TMV-Members && firebase deploy --only hosting:web` (its predeploy runs
`scripts/build-web.sh`, which copies this repo's fresh `dist/`). So the deploy
flow is: `npm run build` here → deploy from TMV-Members.

## The two site chromes — desktop pages vs the `/m/` mobile app

The site has **two** front-ends:

1. **Desktop pages** (`src/pages/*.astro`) — use `BaseLayout` (top `SiteHeader`
   + `SiteFooter`). Responsive, but on phones they **redirect** to the mobile
   app via `BaseLayout`'s device switch (`src/lib/device-switch.ts`).
2. **The mobile app** (`src/pages/m/index.astro`) — a single-page, app-style UI
   with a dark header and a **bottom tab bar**. Screens are toggled by URL hash
   (`/m/#home`, `/m/#events`, …). This is what phone users actually see.

## RULE: any page that renders on a phone must have the mobile bottom nav

A page reachable on a phone must never be a dead-end (no way back into the app).
There are exactly two correct ways to make a page work on mobile — pick one:

- **Redirect pattern (default, preferred when the app can host it).** Keep
  `mobileRedirect` at its default (`true`) and build a matching screen inside
  the `/m/` app, then set `mobileHash="<screen>"` so phones deep-link into it.
  Extract shared logic into a module used by both (see `camp-registration.astro`
  + `src/lib/camp-reg-form.ts` — one form, mounted on both the desktop page and
  the `/m/` "Register" screen). Phone users get the full app shell.

- **Standalone pattern (for big design-delivered pages the app can't host).**
  Set `mobileRedirect={false}` on `BaseLayout`. The layout then **automatically**
  renders `<MobileTabBar>` (phone-only, links back into `/m/#…`), so the page
  keeps the bottom nav with no extra wiring. Optionally set
  `mobileTab="more"` to highlight a tab. Example: `make-invitation.astro`.

**The gate is structural:** `BaseLayout` renders the tab bar whenever
`mobileRedirect={false}` (see the INVARIANT comment there). You cannot add a
mobile-visible page and forget the nav — it's tied to the same flag. When a new
full page arrives (e.g. from design), the only decision is *which* of the two
patterns above; both keep the mobile nav intact.

Do **not** hand-add `<MobileTabBar>` to a page — it comes from `BaseLayout`. If
you build a page with a custom layout (not `BaseLayout`) that shows on mobile,
you are outside the gate: include `<MobileTabBar>` yourself, or (better) route
it through `BaseLayout`.
