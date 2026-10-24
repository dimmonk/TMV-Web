# Changes since last export — for Claude Code

Apply these to the Astro repo (`dimmonk/TMV-Web`). All colours come from the
category colour map (`categories.js` → `catColor(key)`) — the single source of
truth. **Do not darken/shade category colours for legibility** — use the true
hex. Brand yellow `#ffd400` stays ONLY on primary action buttons and global
chrome (header/footer/selection); category colour drives identity accents
(eyebrows, borders, price, badges, icons, stat numbers, section-header number).

Category code: Open Gym `#2e9e4f` · Classes `#2196f3` · Private `#f44336` ·
Partner `#0d9488` · Athletic `#ffb82a` · Camps `#e27902` · Parties/Birthday
`#e5399b` · Groups `#8c52ff` · Introduction `#6e6e6e`.

---

## 1. Parties/Birthday colour changed: yellow → pink `#e5399b`
- `categories.js`: `parties` colour `#ffd400` → `#e5399b`.
- Reason: parties was reusing the brand yellow, so it couldn't signal itself.
- Anything that renders the parties/birthday accent must follow this (it's the
  SSOT; the price list follows the same code).

## 2. Events page — wired to the parties colour (was all brand yellow)
- Page now resolves a `--party` accent from `catColor('parties')` and uses it
  for ALL identity accents: hero eyebrow + dash, hero "Weekends fill fast"
  badge, hero radial glow, Full Party card border + "Most popular" badge +
  duration numbers, Mini Party tag + checkmarks + price, FAQ group titles.
- Brand yellow **stays** on the action buttons ("Birthday parties", "Book
  mini") and chrome (`::selection`, footer hover).
- Groups section stays purple via its SectionHeader `category="groups"`.

## 3. Home page — Events offering card colour fixed
- The "Events" offering card was `#f44336` (private red) — wrong category.
- Changed to parties pink `#e5399b`.

## 4. Athletic Program page — wired to the athletic colour (was all brand yellow)
- Page resolves `--cat` from `catColor('athletic')` (amber `#ffb82a`) and uses
  the TRUE amber (no darkening) for all identity accents: hero eyebrow + dash +
  glow + stat numbers, "Key benefits" label, benefit icon tiles, step-number
  chips, structure Pill tint, schedule "Athletic" dot, join checkmarks,
  "30-day membership" label, membership card border, pay-option icons, "Get the
  pass" underline.
- Brand yellow **stays** on the action buttons ("Join the program", "View full
  schedule") and `::selection`.

## 5. Camps page — hero wired to camps orange (was brand yellow)
- Hero eyebrow + dash, the three stat numbers, the floating badge, and the hero
  glow → camps orange `#e27902` (matches the camp cards, which were already
  orange).
- Hero CTA ("See the camps") and chrome stay brand yellow.

## 6. SectionHeader component — category accent + parties fallback
- (Already had the `category` prop.) Its internal paint-before-load fallback
  for `parties` updated `#ffd400` → `#e5399b` to match `categories.js`.
- REMINDER: no legibility darkening of the accent — true category hex only.

## 7. Global smooth scroll
- `SiteHeader` stylesheet gained `html{scroll-behavior:smooth;}` so every page
  that mounts it smooth-scrolls on any in-page `#anchor` (JumpNav pills + hero
  jump links). Existing `scroll-margin-top` keeps the landing offset correct.

## 8. Anchor landing offset normalized to 120px
- All JumpNav pages set section `scroll-margin-top:120px` (was 130/132/140):
  Train, Store, Events, Camps, Private Lessons, GetStarted, Athletic Program,
  About, BookNow. 120 = 66px header + ~54px sticky JumpNav, so a jump lands
  with the JumpNav flush at top (no hero bar peeking above it).
- Home keeps 80px (no sticky JumpNav — header-only offset).

---

## Still hardcoded but the CORRECT colour (SSOT-source when convenient — no visual change)
- **Camps cards**: use literal `#e27902` (right orange) rather than
  `catColor('camps')`.
- **Private Lessons**: wrapper sets `--cat:#f44336` (right red) rather than
  `catColor('private')`.
- **Store BookingCards**: pass literal category hexes (`#2e9e4f`, `#2196f3`,
  `#f44336`, `#ffb82a`) — all correct.
- **Design Language** swatch grid (section 08): swatch hexes are typed inline,
  so the parties swatch still shows the old yellow — update it to `#e5399b`.

## Legitimately brand yellow (multi-category pages — do NOT change)
- Home, About, Store, Pricing, Schedule, BookNow, GetStarted, Train: these are
  multi-category or neutral, so brand yellow chrome/accents are intended.
