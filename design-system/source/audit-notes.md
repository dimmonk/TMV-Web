# Audit working notes (in progress — resume here)

## Read so far
CLAUDE.md, Card - Design Language, categories.js, site-config.js, tmv-data.js,
Website Audit.dc.html (old audit, mostly resolved), Home, Train, BookNow,
GetStarted, Pricing, Schedule, Camps, Events.

## Findings so far

### Code bugs / issues
1. **Schedule mobile CSS**: `.embed-mobile .m-day-name{color:var(--emb-paper)}` (white) and `.m-empty` white-ish — page bg is light #f5f4f1 → invisible day headings on mobile. Embed CSS assumed dark host. VERIFY in preview ≤768px.
2. **GetStarted step-2 grid**: `grid-template-columns:repeat(4,1fr)` fixed — not responsive on mobile (other grids use auto-fit minmax).
3. **Dead data**: Home `trust:[...]` array unused by template (4.9★/300+ copy lives only there); Camps `camps:[...]` array fully duplicates hardcoded tiles (drift risk — tiles are hand-rolled in template).
4. **Hotlinked images**: Camps 3 tiles + Events full-party img from Square CDN (editmysite.com) — should be local assets.
5. Class prices hardcoded in Train ClassCard `specs` strings ($30 single · 10-pack $275, intro $45/$65/$85, stick fighting $30/$100mo) — NOT in PRICES map, not tagged data-tmv-price → drift risk vs live Pricing.
6. Home camps band hardcodes "Jun 30 – Aug 29, 2026" dates — stale risk (also "Summer 2026" badge).
7. TO CHECK: `initEmbed` exists in schedule-embed-sheet.js; popup IDs match; price-list-renderer entry (`renderPriceListSheet`); console errors on all pages; footer/header components; "The Monkey Vault Website/" folder = stale export?

### Category-color drift (violates categories.js SSOT)
- P.A. Day Camp: BookNow = camps orange; Home band = #2196f3 blue; Camps tile = #2196f3 blue.
- Private Day Camp: BookNow = orange; Camps tile = #2e9e4f green.
- Events page Groups section: Group Events icon/eyebrow = GREEN (#2e9e4f) should be groups purple #8c52ff; Early Gym Access = BLUE (#2196f3) should be openGym green #2e9e4f. (BookNow has them right.)

### Sell/Book/Intro consistency
- **Train drop-in class cards**: action "View schedule" but href → Square appointments external, NOT Schedule.dc.html. Specs say "Drop-in · no reservation needed" yet CTA lands on a booking/appointments page — contradicts itself. (Recreational, Flips, Calisthenics, Tricking, Gymnastics.)
- **Martial Arts card**: booking-tag "Drop-in" vs specs "Booking: Direct via WhatsApp · ask for Ryan"; href → Square appointments; no WhatsApp/contact link at all. Card DL gallery same. Stick Fighting: tag "Drop-in" vs "Direct with coach Peter" (has mailto). Tag vocabulary has no "Direct" chip — gap in system.
- Train hero "New here?" → #core anchor; Home hero → GetStarted.dc.html. Inconsistent first-timer path.
- GetStarted FAQ: "camps for kids 6–16" vs Camps/BookNow "Ages 5+".
- BookNow Introduction note "First session · less in groups" — unclear copy.
- Card DL §07 says Events' two birthday tiles = intro flip tiles; Events page actually uses two big custom cards (not tiles) — doc/reality drift.
- Booking-tag noise: Specialized section = 4 identical "Drop-in" tags; Partnership = 2 identical (DL §05 says skip when all same — but page-level mix may justify; judgement).
- Events "How booking works" says "pay in person based on final headcount" — for birthdays fine; but placed between birthdays and FAQ, applies to groups too — OK.
- Events FAQ consistent w/ mini party facts (3–15, $30, ages 8+, all-day pass, no room).

### Private Lessons page (read)
- Intro group rates "$35 each for 2 · $30 each for 3+" only explained here; BookNow's note "First session · less in groups" is cryptic shorthand for this.
- GetStarted discount callout "15% off any class/pass same day after Introduction" is NOT mentioned on Private Lessons page (where intro is actually sold) — cross-sell inconsistency.
- GetStarted calls Introduction "one-on-one intro"; PL allows group intro (2, 3+ rates). Minor copy drift.
- Coach cards use image-slot (3 photos still empty per old audit). Coach hrefs fall back to general booking when cfg.coaches[key].bookingUrl empty — all empty in defaults, so all 3 "Book with X" buttons currently land on the same generic Square page with no way to pick that specific coach → promise ("they'll come in just for you") not fulfilled by the link. FLAG as content/data-flow issue.
- PL types #f44336 hexes inline (matches categories.js private, ok but hand-typed).

### Still to read (updated)
Athletic Program, About, SiteHeader, SiteFooter, BookingCard, ClassCard, Pill,
JumpNav, CtaBand, SectionHeader, Reviews, Faq, Pathway (used?), SiteHero (used?),
Design Language.dc.html, public/js/standalone/*.js entry fns, site-config.json,
"The Monkey Vault Website/" folder purpose.

### Research digest (party planners + parents lens) — for report Section E
- Visitors judge a gym site in seconds; schedule + pricing + how-to-book should be findable in <5s; 70%+ traffic is mobile. (wodify, pushpress, kilo)
- Offer tiered CTAs (soft tour / see pricing / book now), all leading to the same goal; don't make people hunt. (smarthealthclubs, brpsystems)
- Real member/coach photos + video beat placeholders/stock; "feel the energy" in the hero. (wodify, brpsystems)
- Social proof: authentic reviews WITH names/photos, prominent; parents scan for "clean/safe/friendly/organized." (hellowalla, clubworx, hooray)
- Keep booking on-brand; sending users to a page that looks nothing like the site loses them. (wodify)
- Schedules must be current or they confuse. (sprucewebdesign)
- PARTY PARENTS specifically: transparent all-in pricing, no hidden fees (per-child vs package clarity); the "effort factor" — dedicated host, setup & cleanup handled, "what do I do on the day"; safety is a THRESHOLD qualifier (must reassure, doesn't differentiate); weekends fill fast → book-early urgency + easy online booking + instant confirmation; food/cake/decoration policy answered up front. (hippohopp, chuckecheese CEC, bowlero, urbanair)

### REPORT BUILT — appended Round two to Website Audit.dc.html (see below)

## VERIFIED (live checks done)
- Schedule mobile bug CONFIRMED via forced-mobile screenshot: day headings (MONDAY…) white-on-paper, invisible. Filters OK (data-filter overrides). No console errors.
- No console errors on: Home, Pricing, Schedule, Train, GetStarted, Camps, BookNow. Train logs only intentional GIF-flag warning.
- GIF "⚠ Replace with video" markers are VISIBLE on cards (flagGifs:true) — would ship to visitors; must set false at launch.
- Live schedule enumerated: Parkour (P&C/Kids/Teens/Adults/WOMEN'S ONLY Wed 12), Explosive, Calisthenics (Mon 6), Acro Dance 1 (Mon 7), Gymnastics (Tue 6), Tricking (Tue&Thu 7 ✓), Flips 1, Strength (Thu 6, SEPARATE from Calisthenics), Handstand (Thu 8), Backflip (Sat 12), Parkour Women's.
  → UNSOLD classes: Women's Only, Acro Dance, Handstand, Backflip, Strength — never mentioned on Train. "Recreational" (site) vs "Parkour" (schedule) naming mismatch.
  → Train Calisthenics pill "Mon · Wed · Fri — 6 PM" likely stale vs live (Calisthenics only seen Mon 6–7; Strength separate Thu). Same drift class old audit fixed for Athletic.
- Live price list vs copy: Classes 1x $30/10x $275/20x $500 ✓ Train specs; memberships 30d $180…360d $1450; Open Gym 1x $25 ✓/10x $225/20x $400 + memberships 30d $110…; Class add-on $10 ✓; Intro 1x $45/2x $35/3+ $30 ✓ PL page; Private Kids 1x $65, 2x $50ea, 3x+ $40ea, 5x $250; Adults 1x $85, 2x $70ea, 3x+ $60ea (group-rate ladder NOT mentioned on PL/BookNow beyond intro); Full Party $350/8, extra guest $25, extra hour $5 ✓; Mini $30 ✓; Camps full week $350 ✓ + PARTIAL WEEKS exist (1d $90 / 2d $170 / 3d $240 / 4d $300) — Camps page never mentions partial weeks; P.A. Day $90 ✓.
- Price-list embed rows MAY overlap (label text over next row) — likely html-to-image artifact; verify in real browser before flagging hard.
- Flip-card mirrored text in captures = screenshot artifact (preserve-3d), NOT a bug.

## Components (read)
- ClassCard: has its OWN hardcoded color map (parkour/private/athletic/flips/strength/tricking/gymnastics/partner) — does NOT import categories.js → SSOT violation in the core card. Also front pills + back spec labels use raw var(--cat): Athletic amber #ffb82a on 10% tint = failing contrast (BookingCard fixed this with catText darkening; ClassCard only fixed its booking chip via chipText, pills/labels missed).
- BookingCard: clean; priceKey wired to data-tmv-price-sub; pickInk OK.
- SiteHeader nav: Train/Camps/Events/Pricing/About + New here? + Book Now. NO Schedule link, NO Store link. active enum lacks get-started (GetStarted passes it; harmless).
- SiteFooter: Book col = Book a session/Passes & Pricing/Online store(s/order)/Gift cards(s/order). DEAD CODE: subscribe/newsletter state + localStorage logic with no form in template. Socials href '#' — site-config social URLs all EMPTY → dead icon links (old site had facebook.com/themonkeyvault).
- Pathway + SiteHero: only mounted on Design Language page now (old export train.html still had Pathway; live Train dropped it) — DL says "9 components"; two are unused on live pages.
- Reviews: 4.9★/"300+ reviews" + 3 sample quotes hardcoded defaults; reviewUrl = generic maps URL. Old-audit Low still open.
- Design Language index: pages grid + foundations; fine.

## STORE investigation (user's special focus)
- OLD site nav: top-level "Online Store" menu → "Passes & Memberships" (themonkeyvault.com/s/order) + "Gift card" (dedicated squareup.com/gift/4PQGSAK7CK7FB/order URL).
- NEW site store touchpoints: footer only (Online store + Gift cards→s/order), Train OpenGym "Get a day pass"→s/order, Athletic join CTAs→s/order, Pricing gift band→s/order. NOT in header; BookNow has no passes/memberships group; Home book-strip is booking-only.
- Pricing page hero PROMISES "checks out securely in our online store… buy before you arrive" but the live price list renderer has NO buy links (verified: no href/click in price-list-renderer.js) and the page has no store CTA except gift cards. Biggest store gap.
- CONFIG BUG: LINK_MAP maps 'https://www.themonkeyvault.com/s/order' → 'store' only; gift-card links hardcode the same URL, so the giftCard config key can never repoint them (collision). Also giftCard should probably be the dedicated squareup.com/gift URL like the old site.
- Placement recommendation (for report): 1) put a real "Buy passes" CTA on Pricing (hero + after list) since that's where intent peaks — or per-section buy links if Square store supports category anchors; 2) add Store to header (or a Passes & Memberships group on BookNow so "every bookable service" claim holds); 3) fix giftCard URL + LINK_MAP collision; 4) keep footer links.

### Deliverable — DECIDED (user answered)
- UPDATE the existing **Website Audit.dc.html** — append this round as a new dated round (keep old resolved items intact).
- **Report only** — no fixes applied this round; write findings so each is
  actionable (file + what to change).
- Audience: **party/event planners + parents booking for kids** (weight research accordingly).
- Structure plan: 1) Code bugs & issues, 2) Sell/Book/Intro consistency audit
  (per Card DL goals), 3) Gym-website best-practice comparison (research-backed,
  cite what matters: trust signals, pricing transparency, schedule, first-visit
  funnel, real photos, location/parking, coach bios, reviews), 4) prioritized
  shortlist. Keep severity chips like old audit (High/Med/Low).
