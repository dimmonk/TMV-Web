# TMV-Web — Engineering Audit

**Date:** 2026-07-11 · **Auditor:** Claude (Opus 4.8) · **Build audited:** v7 (`89bbb73`)

This audits the *engineering* of the site (architecture, performance, SEO,
accessibility, standards) — not the visual design, which is owned by Claude
Design. Every finding is backed by a measurement from the current build.

## Verdict

The current site is a faithful **design-tool export**: excellent for previewing
the look with real content, but it is a client-rendered prototype, not a
production-standard website. The defining problems (no server-visible content,
no SEO, two-build device split, inline-everything styling, 100 MB of GIFs) are
all inherent to how the export is generated — they cannot be patched away on the
export without fighting the tool on every regeneration.

**The industry-standard fix is a one-time rebuild** of the same design + content
onto a static, pre-rendered, responsive foundation. See "Recommendation".

Severity: **P0** = blocks being a real public site · **P1** = below standard,
user- or business-visible · **P2** = quality/maintainability.

---

## P0 — Blocks production

### 1. Content is invisible to crawlers and social (client-only render)
- **Evidence:** `Home.dc.html` raw `<head>` has no `<title>`, no meta description,
  no OG tags; `<body>` is an empty `<x-dc>` template. All 13 content pages render
  client-side via React loaded from a CDN. `0` pages ship a `<title>`; `seo: {}`
  in `site-config.js` is empty so nothing is set even at runtime.
- **Standard:** Primary content and metadata must be in the initial HTML response
  (pre-rendered / SSR/SSG). Google can render JS but unreliably and slowly; most
  social/link scrapers (iMessage, WhatsApp, Slack, FB) do **not** run JS at all.
- **Impact:** Near-zero organic search presence; shared links show no title,
  description, or image.
- **Fix:** Pre-render every page to static HTML (rebuild).

### 2. No SEO metadata at all
- **Evidence:** `0` `<title>`, `0` `og:` tags, `0` Twitter cards, `0` canonical
  links, `0` JSON-LD blocks. No `robots.txt`, no `sitemap.xml`.
- **Standard:** Per-page `<title>` + meta description, Open Graph + Twitter cards,
  `rel=canonical`, `robots.txt`, `sitemap.xml`, and **`LocalBusiness`/`SportsActivityLocation`
  JSON-LD** (high value for a gym — powers the Google business panel, hours, map).
- **Fix:** Add all of the above during the rebuild; structured data from
  `site-config.js` (address, hours, phone are already there).

### 3. Entry URL is a JS redirect; deep URLs are ugly and device-forked
- **Evidence:** `index.html` is a `location.replace` router. Content lives at
  `Home.dc.html`, `Athletic Program.dc.html` (spaces in URLs), etc. Desktop vs
  mobile are **two separate builds** chosen by UA sniff + `matchMedia`.
- **Standard:** One canonical URL per page, clean paths (`/pricing`, not
  `/Pricing.dc.html`), **one responsive document** — not a device-sniffed redirect
  to a parallel build. Google explicitly recommends responsive over separate
  m-dot/redirect setups.
- **Fix:** Single responsive site, clean routes, no redirect entry (rebuild).

---

## P1 — Below standard, visible

### 4. ~100 MB of animated GIFs
- **Evidence:** `assets/` = 101 MB; 10 GIFs at ~8–11 MB each are 99% of page
  weight. `site-config.js` already flags this (`markGifs`/`flagGifs`).
- **Standard:** Looping motion → `<video muted loop autoplay playsinline>` with
  MP4 (H.264) + WebM (VP9/AV1). Typically 10–20× smaller.
- **Fix:** Encode videos, swap `<img.gif>` → `<video>`. *(Claude Design is already
  handling this one.)*

### 5. No responsive breakpoint system
- **Evidence:** `11` total `@media` queries site-wide; `7` are just the 820 px
  desktop↔mobile handoff. Nothing designed for the 820–1200 px tablet / small-laptop
  band.
- **Standard:** A mobile-first breakpoint scale (≈480 / 768 / 1024 / 1280) with
  fluid layouts between stops.
- **Fix:** Real breakpoint system in the rebuild's CSS.

### 6. Accessibility gaps
- **Evidence:** `<html lang>` on only `1` of `26` pages (index only). `10`
  `href="#"` dead links (socials), `1` empty `tel:`. `764` `<div>` vs a handful of
  landmarks. `1` `role=`. *(Positives: all 13 `<img>` have `alt`; some ARIA present;
  FAQ uses native `<details>`.)*
- **Standard:** `lang` on every page, no dead links, semantic landmarks
  (`<header><nav><main><footer>`), labeled controls, visible focus, WCAG AA
  contrast.
- **Fix:** Semantic rebuild; wire real social/phone URLs from `site-config.js`.

### 7. Render-blocking, waterfall loading
- **Evidence:** `25` pages load `support.js` render-blocking in `<head>`, which
  then loads React UMD from `unpkg`, then fetches each `.dc.html` component
  individually, then compiles in-browser. Only `2` images use `loading="lazy"`.
  Third-party origins: unpkg, jsdelivr, Google Fonts, editmysite CDN, cloud
  functions.
- **Standard:** Minimal/no render-blocking JS; static HTML first paint; lazy-load
  below-the-fold media; self-host or `font-display:swap` fonts; preconnect.
- **Fix:** Static-first rebuild removes the runtime entirely for content pages.

---

## P2 — Quality & maintainability

### 8. Inline-everything styling, no design tokens
- **Evidence:** `1,429` inline `style=` attributes. Brand colors hardcoded
  `#211f1b` **252×** and `#ffd400` **232×**. Only 2 CSS files exist (both for the
  embeds).
- **Standard:** Shared stylesheet + CSS custom properties for tokens; utility or
  component classes. One place to change a brand color.
- **Fix:** Token system + component styles in the rebuild.

### 9. No build/tooling/CI
- **Evidence:** No `package.json`, no minification, no image pipeline, no lint, no
  tests, no CI. Duplicated device-guard script inlined into every page.
- **Standard:** A build step (bundling, minify, image opt), formatting/lint, and
  CI that builds + deploys.
- **Fix:** Introduce an SSG toolchain (rebuild).

### 10. Runtime timing hacks
- **Evidence:** `site-config.js` re-applies prices on `setTimeout` at 600/1600/3200 ms
  to catch late-mounting components; polls for globals.
- **Standard:** Data available at render; no polling.
- **Fix:** Static render eliminates the race.

---

## Recommendation — one clean rebuild, exact visual parity

Patching the export toward these standards is patchwork on a prototype: the next
Claude Design regeneration overwrites it. The end-game is to **rebuild the same
design and content on a static site generator** — pixel-parity with the current
look, but standards-compliant underneath.

**Proposed stack:** [Astro](https://astro.build) — component-based (kills the
header/footer duplication), ships **zero JS by default** (static HTML first
paint), first-class SEO/meta, trivial GitHub Pages deploy. Islands only where a
page needs live data (Schedule, Pricing) — those keep fetching the existing Cloud
Functions.

**What the rebuild delivers:** pre-rendered HTML (fixes 1–3, 7), full SEO +
`LocalBusiness` JSON-LD (2), one responsive document with a real breakpoint scale
(3, 5), semantic + accessible markup (6), CSS tokens + shared styles (8), a build
+ CI pipeline (9), no timing hacks (10). GIF→video (4) lands here too.

**How it fits the workflow:** Claude Design exports become the **visual spec**.
When a new export arrives, diff it against the previous export to see exactly what
changed visually/content-wise, then port that delta into the Astro source. The
repo becomes the hand-maintained source of truth; exports are reference, not the
deploy artifact.

**Not doing:** m-dot/redirect device split, client-render runtime for content,
inline styles.

---

# Follow-up audit — 2026-07-17 (Fable 5)

Full read of the Astro build (all pages, components, layout, data modules,
deploy workflow, `/m/` runtime, cross-checked against design-reference).
Everything fixable without new assets or product decisions was fixed in the
same-day commit; what's below is the **deferred list** with why.

## Deferred — needs user input / assets

1. **Seven Train videos missing** (`backflip/strength/flexibility/acrodance/
   handstand/speedleague/explosive.mp4`) — referenced by the design and the
   port, never included in any export zip. Cards show a dark media box until
   the design side exports them. *Intentional for now (media list incomplete).*
2. **Square links intentionally generic** — many `sq.*` entries still fall back
   to the generic booking/store URL. Deliberately unfinished: the client
   account-management app will bring this in-house (Square stays as payment
   backend only).
3. **Members-app → site rebuild trigger unimplemented** — `square-links.ts`
   bakes the admin-published JSON at build time, but nothing calls GitHub when
   an admin saves (no dispatch code in TMV-Members functions, no
   `repository_dispatch` in deploy.yml). Needs a PAT decision. Until then link
   edits go live on the next unrelated push.
4. **Mobile/desktop split vs SEO** — phone UAs (including Googlebot smartphone,
   i.e. mobile-first indexing) are JS-redirected off every Astro page to
   `m/mobile.html` (hash-routed shell, one title for all screens). Mitigated
   same-day (title/description/canonical/lang added to the shell; shadow-site
   mirrors deleted), but the architectural question — responsive single site vs
   split — is still open and worth deciding before more mobile investment.
   Note: `public/robots.txt` is served at `/TMV-Web/robots.txt`, which crawlers
   never read (robots.txt only works at the origin root) — it's inert on a
   GitHub project page; sitemap discovery relies on Search Console submission.
5. **Mobile feature gaps** — the shell has no invitation-maker screen (desktop
   page now stays accessible on phones via `mobileRedirect={false}`), and its
   own card data still hotlinks the old Squarespace CDN (design-owned file;
   fix belongs in the design tool, not here).

## Accepted / by design (checked against design source, not defects)

- Home "Events" offering card is private-red, home eyebrows "02 —"/"04 —" plain
  text, athletic classTypes dot hexes — all match the design source exactly.
- Em-dashes and border-left note callouts come from approved design copy.
- Hardcoded darkened-brand hexes (JumpNav `#e0c64a`/`#e0a800`, events, about)
  bypass tokens but follow design values; revisit only if the brand changes.

---

# Mobile audit — 2026-07-17 (Fable 5) — post native-Astro rebuild + SSOT shift

Scope: the app-style mobile surface (`src/pages/m/index.astro`, `MobileLayout.astro`,
`MobileHero.astro`) and its consistency with the SSOT architecture shift (shared
components + `src/data/*` modules). Full read of the mobile page, the data
modules, and drift-diffs against the desktop pages.

## Verdict

The architecture is CONSISTENT with the SSOT direction. One language (Astro) on
both surfaces; the card components (`OfferingCard`, `BookingCard`, `ClassCard`)
and eight data modules (`offerings`, `classes`, `store`, `camps`,
`first-session`, `events`, `reviews`+`cat`/`hours`/`social` in `site.ts`, and
the `sq` Square registry) are each a single source read by both surfaces, with
the `surface.ts` override pattern (`only:` / `mobile:{}` / `desktop:{}`) for
per-surface variants. Live schedule/pricing import the canonical `src/lib`
modules (no copies). PWA manifest (`start_url: "."`), canonical → desktop home,
and the two device redirects verified non-looping.

## Fixed during this audit (same-day commits)

1. **Square-links pipeline was broken end-to-end** — the members-app's DEPLOYED
   publish function was a stale revision: an admin link save published the
   projection with every link EMPTY (doc had the 11 values; CDN JSON didn't).
   Fixed by running the current publisher against prod + redeploying
   `onSiteConfigChangePublish` + `republishSiteConfig` by name; verified a doc
   write now republishes correctly. Separately, many website cards bypassed the
   `sq` registry with static `links.*` — every bookable card on BOTH surfaces
   now routes through `sq` (camps, get-started/first-session, events/groups
   CTAs, home camps band, athletic membership, mobile book options + class
   links). Reminder: `sq` bakes at BUILD time — an admin link edit still needs
   a site rebuild to go live. RESOLVED DIRECTION (2026-07-17): hosting moves to
   Firebase (GitHub Pages is development-only), so no GitHub-token trigger will
   be built — the publish→rebuild flow will be designed as part of the Firebase
   hosting migration.
2. **Reviews carousel unusable on iOS** — swipe-only, and swipe didn't work on
   the user's device (works in Chromium emulation; iOS-specific). Added
   server-rendered dots + prev/next arrows with a scroll-synced script; all 3
   reviews reachable by tap, verified live.
3. **Dead scoped CSS** — the schedule/loading/error rules existed twice (scoped
   + `is:global`); the scoped copies could never match the runtime-injected DOM.
   Deleted (also the redundant scoped `.m-darkbtn`).
4. **OfferingCard fixed-height overlap (MAJOR).** `.flip` had a hard height
   (432px desktop / 360px mobile); whenever content outgrew it (narrow phones,
   wide/landscape screens where the 16:9 media grows tall) the card bled over
   the next one with no vertical spacing. Rebuilt as a grid-stacked flip (both
   faces share one grid cell, card sizes to its tallest face, `--oc-h` is now a
   minimum). Fixes mobile stacking AND the same latent overlap on narrow
   desktop widths.
5. **Reviews carousel root cause finally isolated: iOS Safari scroll-snap.**
   Both finger-swipe and programmatic `scrollTo` are unreliable on a
   `scroll-snap-type: x mandatory` container on iOS (fine in Chromium — which
   is why two scroll-based fixes verified locally and failed on-device).
   Rebuilt as a transform-driven track (`translateX` switched by dots / arrows
   / a touch handler) — no native scrolling left to break. Also: `aria-current`
   on the bottom-nav tabs and an explicit `pull` excerpt on the featured review
   (replacing fragile sentence-splitting).

## Open findings (ranked)

- **M1 · Book-hub duplication (both surfaces).** Desktop `book.astro` and the
  mobile Book screen each hand-write condensed copies of items whose domains
  now have SSOTs (camps, private lessons, birthdays, passes). They share `sq`
  hrefs now, but the copy is still parallel. Follow-up: make both hubs COMPOSE
  from the domain modules (with `surface`/hub overrides for the condensed copy).
- **M2 · Copy-drift pairs to fold into the surface-override pattern:**
  `aboutFacility` (mobile) vs `about.astro` facility array (same 4 items,
  wording drift); `campDay` (mobile) vs `camps.astro` schedule (same rows,
  format drift); `gsBring`/`gsArrive`/`gsFaqs` (mobile) vs get-started
  `bring`/`arrive`/`otherFaqs` (condensed subsets); `eventFaqs` (mobile, 4) vs
  events `faqGroups` (8). Subsetting is fine; the risk is policy answers
  drifting (payment/cancellation copy exists in both).
- **M3 · Hours inconsistency — ACCEPTED AS-IS (owner decision 2026-07-17; do not change).** The mobile status
  pill + schedule's synthesized Open Gym rows extend FRIDAY to midnight (with a
  10 PM–12 AM adults-only row), but `site.ts` hours, the About page, and the
  JSON-LD all say 11–10 every day. One of these is wrong. If Friday really runs
  to midnight, `site.ts` hours (and JSON-LD/About) should say so; if not, the
  mobile status/schedule logic should drop the Friday extension.
- **M4 · Hero/stat literals.** The home-hero stats ($25 · 7 days · Ages 3+) and
  a few "from $X" marketing literals are independent copy on each surface.
  Low-value cosmetic SSOT; prices of record already live in the live price list.
- **M5 · Home reviews-strip quote** is derived by sentence-splitting review #1
  (`split('. ').slice(0,2)`) — fragile if the review text changes. Consider an
  explicit `pull` field on the reviews SSOT.
- **M6 · A11y polish.** Bottom-nav tabs could set `aria-current`; screen
  switches don't manage focus; carousel controls have labels (done).
- **M7 · Known media gap.** 7 specialized-class videos still missing
  (backflip/strength/flexibility/acrodance/handstand/speedleague/explosive) —
  both surfaces show an empty media box until provided (intentional, pending).
- **M8 · Informational.** `sq.getStarted.*` admin values are currently empty, so
  the two get-started reservation cards fall back to the generic booking link —
  set them in Settings → Website to target them precisely.
