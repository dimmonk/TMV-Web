# TMV-Web — project notes for Claude

Astro static site for The Monkey Vault. Built to `dist/`, deployed to Firebase
Hosting (`themonkeyvault` / themonkeyvault.com) from the **TMV-Members** repo:

```bash
cd ../TMV-Members && npm run deploy -- --only hosting:web
```

That one command is the website's only deploy path. It is a counted release run by the shared deploy core
(`TMV-Members/.claude/standard/deploy/`, configured by `TMV-Members/deploy.config.mjs`, `hosting:web` with
`repo: '../TMV-Web'`), in the order **cut, build, commit, tag, push, deploy, check**:

1. It adds a throwaway worktree of **this repo's `origin/main`** at `.deploy-worktree/` (gitignored) and ships that, never
   your working tree: uncommitted work, an untracked file, a checkout that is not main or is behind it cannot reach the site,
   and nothing here is gated or touched. Work you have not pushed does not ship; the command prints what it is leaving behind.
2. It cuts the next revision in **`public/version.json`** (`{ revision, date, commit }`: the count of website releases, the
   day, and the first 8 characters of the commit being released), in that worktree. You never edit `public/version.json` by
   hand. Astro copies `public/` verbatim into `dist/`, so the file is served at `/version.json` with no copy step.
3. It builds the site in that worktree with the cut release (`npm run build`, never a stale `dist/`). If the build fails, the
   worktree is discarded and nothing is committed, pushed or deployed.
4. Only then does it commit `chore: release N` here (that file alone), tag it `release-N`, and push both to `origin/main`
   atomically. A rejected push is re-cut on the new `origin/main` (up to five times). The core refuses to cut unless origin's
   highest `release-*` tag equals the revision in `public/version.json`.
5. It assembles the public site in TMV-Members (`web-dist/`: this build plus the waiver surfaces) and deploys it. A hand-typed
   `firebase deploy` is refused by the guard on every target.
6. It then checks the live site (`/version.json` names the revision, `/index.html`
   answers, `/_astro/**` is immutable, nothing private is served) and exits 2 with
   the rollback if it is not that release (`npm run deploy-check -- hosting:web N` re-checks a revision).

Nothing a visitor sees names the revision: `/version.json` exists for the daily
status report only, and no page, footer or meta tag shows it. This is a public
repository, so `public/version.json` carries only those three values.

## The published site config: banner, hours, social, links

Staff own the announcement banner, the opening hours, the social links, the
gym's address, phone and email, and the per-card Square links (TMV-Members, Settings -> Banner, hours & social and
Booking & buy links). TMV-Members republishes them on every save to a static
object, and **`src/data/site-config.ts` reads it once per build**: the ONLY
fetch. `square-links.ts` takes `links` from it; `PromoBanner.astro` takes the
banner, the About page/footer/mobile sheets take the hours and socials, the
header pill and the LocalBusiness JSON-LD take the hours, and every address, phone
and email line takes `contact` (`src/lib/contact-view.js` over `gym-contact.js`, a
copy of TMV-Members `foundation/gym-contact.js`). **Do not type a banner, an hours
table, a social URL, an address, a phone number or an email anywhere in this repo.** That would be a second
copy that staff edits no longer reach.

- **Empty renders nothing**: no banner strip, no Hours card, no pill, no social
  row, no `sameAs`/`openingHoursSpecification`, never an empty section.
- **Fetch failure** is the same for all of it: the build warns
  (`[site-config] live config fetch failed`) and carries on with nothing
  published (links use their static fallbacks; the rest renders nothing).
- **Hours are shown verbatim** (`{day, time}` rows in staff's order, free text
  included). Numbers derived from them (pill, JSON-LD, the one-line summary, the
  hero tile) come from `src/lib/opening-hours.js`, which mirrors TMV-Members
  `core/site-hours.js` `parseHours`; rows it cannot read feed no number.
- **Banner shows** only when on, with a headline, and before its expiry (the END
  of the chosen day, gym time, `America/Toronto`: `src/lib/site-promo.js`,
  `gym-clock.js`). Checked at build and again in the browser, so an expired one
  comes down between releases.
- **The build is the first paint; the browser keeps it current.** On page load
  `src/lib/live-site-config.ts` fetches the SAME object (`PUBLISHED_CONFIG_URL`,
  the same reader `fetchPublishedConfig` the build uses, `cache: 'no-cache'` so
  it revalidates by ETag) and `src/lib/apply-site-config.js` re-applies links,
  banner, hours (+ pill, summaries, hero tile) and socials in place, using the
  same pure rules as the build. So a staff save shows within minutes with no
  release. A failed fetch keeps what was built and warns in the console. JSON-LD
  and a seasonal card that is offered or not (`isLinkSet`) stay build-time.
- **Hooks, not copies**: every live-updatable element carries a `data-*` hook
  (`data-promo`, `data-hours-card|list|summary|stat`, `data-status`,
  `data-social`, `data-socials-wrap`, `data-contact`, `data-contact-href`,
  `data-contact-wrap`) and is always in the markup, `hidden`
  when there is nothing to show (global `[hidden]` wins over any display). A
  Square link slot travels in the href as `#tmv-sq=page.field`, which the build
  (`astro.config.mjs` + `src/lib/sq-slot-marker.js`) moves into `data-sq`. Add a
  new surface by adding the hook and teaching `apply-site-config.js` about it.
- **A published value is data, never markup.** Text reaches the page through Astro's escaping or `textContent`
  (never `innerHTML`); every URL (social, banner button, every Square link) passes `safeUrl` in
  `src/lib/published-config.js`, so only http(s) reaches an `href` and a bad link reads as unset (the card keeps
  its default); the structured data is written with `jsonForScript` (`src/lib/json-for-script.js`), because a valid
  URL can still carry `</script>`. Every value is bounded (`LIMITS` in `published-config.js`: URLs 500, headline 120,
  message 280, button text 40, 14 hours rows of day 40 / hours 80, 12 closed days of reason 80, mirroring TMV-Members `SITE_CONFIG_LIMITS` by hand):
  a value past its limit reads as unset. A switched-off banner carries no text, and a banner whose expiry is not
  `YYYY-MM-DDTHH:MM:SS` reads as off.
- **No inline script, anywhere.** The hosting sends a Content-Security-Policy (TMV-Members `firebase.json`,
  `hosting:web`, ADR-0169) whose `script-src` allows no inline script. So every script is a file
  (`vite.build.assetsInlineLimit: 0` stops Astro inlining small ones), there is no `is:inline` script, no `on*=`
  handler (the fonts media swap is `src/lib/async-stylesheets.js`) and no `javascript:` URL; the render test fails on
  any of them. JSON-LD is data and may stay inline. A new third-party load (script, embed, fetch, image host) needs its
  origin added to that policy in TMV-Members, or it is blocked.
- **The browser floor is Safari 13.1 / iOS 13.4.** The `browserFloor` plugin in `astro.config.mjs` targets it for the
  CLIENT bundle only (the server build and the CSS keep Astro's `esnext`), so the bundler lowers `||=`, `&&=` and
  `??=` (Safari 14) in every script it emits; a module holding one does not parse on the floor and none of its code
  runs. `?.` and `??` are fine there. The render test fails if any built script needs lowering for the floor.
- `TMV_SITE_CONFIG_URL` points the build at a fixture (tests only).
- `npm test` builds the site against fixtures, asserts the rendered HTML, then
  plays the browser refresh over the built pages (jsdom).

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

## Build toolchain gotchas (Astro 7 / Vite 8)

- **Prefixed CSS pairs: the unprefixed property goes LAST** (`-webkit-backdrop-filter`
  then `backdrop-filter`; same for `backface-visibility`). The build's CSS
  minifier (Lightning CSS) keeps only the last of a prefixed/unprefixed pair, so
  the other order silently drops the property Chrome and Firefox need.
- **Build-time file checks resolve from the project root** (`process.cwd()`, see
  `src/lib/class-media.ts`), never from `import.meta.url`: the bundler relocates
  modules, so a source-relative path points at nothing in the build.
- The router is `<ClientRouter />` (Astro 5 renamed `ViewTransitions`).
- Node 22.12+ is required (`undici`, pulled in by Astro's font code, wants 22.19+;
  the build runs on 22.16 with an `EBADENGINE` warning and works).

## Navigation IA

The primary nav (`nav` in `data/site.ts`) is deliberately capped at **seven**
(Open Gym joined Classes in 2026-10; below 1280px the header drops "New here?" so
seven fit, and the menu button takes over below 1024px). The
long tail lives in **`src/data/explore.ts`** — one array rendered by both the
mobile More sheet and the desktop footer's Explore column. Add a revenue stream
there once and it appears on both surfaces.

## Camp dates: the Members camp catalogue

Camp dates are never typed here. TMV-Members publishes its sellable camps to a public object
(`camp-catalog.json`, `PUBLIC_CAMP_CATALOG_URL` in `src/lib/camp-dates.js`); `src/data/camp-dates.ts` reads it once
per build and `CampDates.astro` re-reads it on page load (`applyCampDates`, text only), like the site config. Dates
show from the gym's today on, as runs of consecutive days per camp type. A camp with no dates left renders nothing;
no dates at all hides the Dates section (`data-camp-dates`) and the links to it. A weekly season is offered only
when it has dates AND its Square link is set. Booking stays on each camp's Square link. A failed read warns
(`[camp-dates]`) and shows no dates. The test server serves a fixture catalogue.

## The class schedule: dated weeks

`/schedule` shows the Members recurring schedule laid on real dates: this week plus the next three (prev/next arrows),
Monday to Sunday, gym time. A week is never stored; `src/lib/schedule-weeks.js` (pure) builds it from the schedule
projection plus two kinds of exception staff set in Members: a one-date class cancellation (`cancellations` in
`schedule.json`) and a day the whole gym is closed (`closedDays` in the site config, read by `published-config.js`,
fetched in the browser through `live-site-config.ts` `publishedSiteConfig`). A closed day wins over a cancel. Open Gym
is the published opening hours, one block per open day (`openGymSessions`), with Friday from 10pm split off as
adults only (`ADULTS_ONLY_LATE`, a house rule that stays in code by Steven's Members scope, like the late-arrival minutes). The
"Schedule changes" card lists every exception through the last visible week; none means no card.

Desktop is `schedule-page.js` + `schedule-week-view.js` (an hour grid in the price list's card parts, colour rule per
class, hover lights a class's repeats, a site-card popup); the phone is `mobile-schedule.ts` with the same week bar
and changes card. Styles: `src/styles/schedule-web.css`. The printed sheet modules (`print-schedule-sheet.js`,
`schedule-embed-sheet.js`) are verbatim Members copies (`tmv-web-lib-mirror.test.js` in TMV-Members): never edit them
here alone; the website only borrows their time formatting, filters and description renderer. Tests:
`tests/schedule-weeks.test.mjs`.

## The price list: one renderer, a web skin

`/pricing` renders the members app's price list with the shared `src/lib/price-list-renderer.js` in its `'web'`
variant (cards in the print sheet's column layout, details behind an ⓘ, `src/styles/price-list-web.css` maps each
section to its site colour). The layout (`src/lib/price-list-layout.js`: sections, rows, bullets such as pass expiry,
footnotes) is shared with TMV-Members' printed sheet; change both copies together.

## The guidance layer: sell the progress, not the program

The site carries a second layer on top of the program catalog, lifted from the
staff **Client Progression & Program Recommendation Procedure**. The catalog
answers "what do you offer"; the guidance layer answers "what should *I* do
next". Both are needed — the nav stays catalog-shaped for findability, and the
guidance sits on top of it.

Four rules, and the data module that owns each:

1. **The client path** — Experience → Learn → Progress. `stages` in
   `data/progression.ts`, rendered by `PathStrip`. Camps live in **Learn**
   (recreational: learn and play), not Experience.
2. **Match the first step to the goal** (owner's rulings, 2026-10-20/21). Learn
   parkour → the Intro Lesson (a set basics lesson, hence cheaper), then
   Recreational. A kid trying it out → a drop-in Recreational class (intro as
   the "or"), leading to Camps and Open Gym, never Athletic. A specific skill →
   a Private Lesson. Train seriously → Specialized classes and Privates. Get
   Started step two is the intro, not a menu of four equal options.
3. **One clear next step** — `goals` in `data/goals.ts` → `GoalPicker`
   (ASK → RECOMMEND → REASON → INVITE). One goal in, ONE recommendation out,
   with the reason and where it leads. Never a list of every program.
4. **Every page ends with a next step** — `nextSteps` in `data/progression.ts`
   → `NextStep`. Group class → private; training weekly → Athletic; private →
   pack; Athletic → the first class is the prerequisite check.

Two more from the same procedure: **value before price** (`purchaseFit` →
`PurchaseFit`, above the live price list) and **the party wrap-up**
(`partyReturn` → `PartyReturn`, under the party cards — a party is only one of
the ways back in).

### Adding to it

Change the copy in the data module, never in a page. Every one of these
components is content-only and width-agnostic per THE RULE above, so the same
component renders in both chromes — `variant="compact"` is a density knob, not
a second implementation. If you find yourself writing a second copy of a
recommendation for the phone, stop: that's the drift this layer exists to
prevent.
