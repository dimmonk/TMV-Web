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

## THE RULE: content carries no chrome — the shell sets header/footer/nav

A feature is content. The **shell** it renders in owns the header, footer and
nav. So a feature must never bake in page chrome, and must never be a dead-end
on a phone.

**Every feature that works on a phone belongs in the `/m/` app shell.** Build it
as three pieces:

1. **Shared markup** — an Astro component with no chrome (e.g.
   `components/InvitationMaker.astro`, `components/PartyCard.astro`).
2. **Shared logic** (only if interactive) — a `mount*(root, opts)` module in
   `src/lib` whose queries are scoped to `root` (e.g. `lib/invitation-maker.ts`,
   `lib/camp-reg-form.ts`). No assumption about which shell it's in.
3. **Two thin wirings** — the desktop page renders it inside `BaseLayout`, and
   the `/m/` app renders it in a `data-screen` section (register the screen in
   `SUBS` + `SUBTITLES`, and lazy-mount the logic in `render()`).

Then set `mobileHash="<screen>"` on the desktop page so phones deep-link into
the app screen instead of loading desktop chrome. Worked examples:
`make-invitation.astro` → `/m/#invitation`, `camp-registration.astro` →
`/m/#register`.

**Shared content must be shell-agnostic:** no fixed widths, no viewport media
queries, no `.container`/`.m-pad` baked in. It fills whatever column the shell
gives it. Width and padding are the shell's concern (see `PartyCard`'s note).

### Fallback (rare): a page that truly can't be an app screen

Set `mobileRedirect={false}`. `BaseLayout` then **automatically** renders
`<MobileTabBar>` so the page still has the bottom nav instead of being a
dead-end. This is a structural guard, not a pattern to reach for — nothing uses
it today. Never hand-add `<MobileTabBar>`; it comes from `BaseLayout`. A page on
a custom layout (not `BaseLayout`) is outside the guard entirely — route it
through `BaseLayout`.
