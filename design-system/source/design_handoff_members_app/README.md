# Handoff: The Monkey Vault — Members App

## Overview
A native-feeling **members app** for The Monkey Vault (parkour / movement gym in
Toronto). It reuses the exact shape of the mobile website — a 5-item bottom nav
(**Home · Store · Book · Schedule · More**) — so an existing member has nothing
new to learn. Two things flip relative to the public site: because the user is
already a member, the website's **Train** *sell* page becomes an in-app **Store**
*buy* page, and **Home** becomes an **account dashboard** (memberships, passes,
active bookings) instead of a marketing landing page.

The whole app is a single phone screen with five swappable tabs.

## About the Design Files
The files in `design-files/` are **design references created in HTML** — a working
inline-styled prototype showing intended look and behavior. They are **not
production code to ship directly**. The task is to **recreate these designs in the
target codebase's environment** (React Native / Expo, SwiftUI, Flutter, etc.),
using that project's established components, navigation, and styling patterns. If
no app codebase exists yet, pick the framework that best fits (a native mobile
app is the intended medium) and implement the screens there.

`Mobile App Mockup.dc.html` is the whole app. `BookingCard.dc.html` is the one
shared card used on the Store and Book tabs. `categories.js` is the color source
of truth. `support.js` is only the prototype runtime — you do **not** port it;
it just lets you open the `.dc.html` files in a browser to see the design live.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, and
interactions. Recreate the UI to match — exact hex values, font weights, and
sizes are given below and are literal in the source.

## App shell (applies to every screen)
A single phone frame, `392 × 812` in the mock (this is just the design canvas —
build it full-bleed / responsive to the device).

- **Background behind frame:** `#e9e7e1` (mock only; not part of the app).
- **App background:** `#f5f4f1` (Paper).
- **Status bar** (top): `#211f1b` (Ink) background, `9:41` + signal/wifi/battery
  glyphs in white. On device this is the real OS status bar.
- **App header** (below status bar): Ink `#211f1b` background, bottom border
  `rgba(255,255,255,.08)`. Left: 28×28 logo (`assets/tmvlogo.png`) + wordmark
  "THE MONKEY VAULT" in `Archivo 900, 13px, uppercase, letter-spacing .02em`,
  white. Right: a **live open/closed pill** (see Interactions → Open status).
- **Bottom nav** (fixed): background `rgba(28,26,23,.92)` with
  `backdrop-filter: blur(14px)`, top border `rgba(255,255,255,.08)`, padding
  `9px 12px 22px` (the 22px bottom is the home-indicator safe area). 5 equal
  flex items. Labels `Archivo 700, 10px, uppercase`. Inactive tint
  `rgba(255,255,255,.42)`, active tint `#fff`.
  - Item order & icons (Bootstrap Icons): **Home** `bi-house-door-fill` ·
    **Store** `bi-bag-fill` · **Book** `bi-calendar-check-fill` (center) ·
    **Schedule** `bi-calendar3` · **More** `bi-grid-fill`.
  - The center **Book** item is a raised FAB: 54×54 circle, `#ffd400` (Brand
    Yellow), `4px solid #2e2c29` ring, `margin-top:-30px` so it lifts above the
    bar, icon in Ink `#211f1b`, shadow `0 6px 15px -7px rgba(255,212,0,.45)`.
- **Scroll area** between header and nav scrolls; scrollbars are hidden.
- **Press feedback:** nav buttons `scale(.9)` on `:active`; quick-action/tile
  cards `scale(.97–.98)` on `:active`. All transitions `.12s ease`.

## Screens / Views

### 1. Home — Account dashboard  (tab `home`, default)
**Purpose:** at-a-glance view of who's on the account, what each person owns, and
what's booked.

**Layout (top → bottom, vertical scroll):**
1. **Section eyebrow** — row: "ON YOUR ACCOUNT" (`Archivo 800, 13px, uppercase,
   letter-spacing .06em`, color `#9b8e6a`). On **family** accounts a right-aligned
   "Manage →" button (`Archivo 800, 11.5px, uppercase`, Ink) that jumps to More.
2. **Member wallet carousel** — horizontal, scroll-snap, drag-to-scroll. Each
   card `308px` wide, Ink `#211f1b` bg, white text, radius `22px`, padding `20px`,
   with a soft radial glow tinted per member (`radial-gradient(340px 190px at 88%
   -25%, <glow>, transparent 70%)`). Card contents:
   - **Header row:** name (`Archivo 800, 17px`), role sub (`600 12px`,
     `rgba(255,255,255,.55)`), and a green **"Waiver OK"** chip
     (`bi-patch-check-fill`, fg `#5fd07f`, bg `rgba(95,208,127,.14)`, pill).
   - **Membership block:** label "MEMBERSHIP" (`Archivo 700, 10px, uppercase,
     letter-spacing .07em`, `rgba(255,255,255,.45)`). If owned: name + meta on a
     baseline-spread row, tinted with the member's category color; optional
     progress bar (`6px`, track `rgba(255,255,255,.14)`, fill = tint, width =
     percent). If not owned: a dashed **"Add a membership"** quick-add button
     (dashed border `rgba(255,255,255,.22)`, yellow `+` chip) → goes to Store.
   - **Passes block:** label "PASSES" same style. If owned: list of passes
     (label + meta, tinted). If none: dashed **"Add passes"** quick-add → Store.
3. **Carousel dots** (family only) — active dot is a `22px`-wide Ink pill,
   inactive are `6px` `#d8d5cd` dots; click to snap to a card.
4. **Active bookings** — header "Active bookings" (`Archivo 800, 17px`) + "Book →"
   shortcut. A white card (`#fff`, border `#ebe9e4`, radius `16px`) with a row per
   booking: a `3px` category-colored accent bar, title (`Archivo 800, 15px`),
   status label (`Archivo 600, 11px, uppercase`, tone-colored), and right-aligned
   when (`Archivo 800, 13px`) + who (`500 11.5px`, `#8a877f`). Empty state: a
   centered "No upcoming bookings — book a lesson, camp or party" card.

**Sample data (family account):** members = [You · Parent (Class Membership, 18
days left, 60% bar), Maya · age 8 (Class 10-pack, 6 left), Leo · age 11 (Athletic
Membership, renews Aug 1)]. Bookings = [Summer Camp 2026 · Maya · Jul 21–25 ·
Registered (info); Private Lesson · Leo · Sat Jul 19 2:00 PM · Booked (go);
Birthday Party · The Riveras · Sat Aug 2 1:00 PM · Booked (go)].
**Self account:** one member card (Open Gym Membership + Class 10-pack), one
booking (Private Lesson · You).

### 2. Store — Buy surface  (tab `train`)
**Purpose:** buy passes & memberships for anyone on the account.

**Layout:** header row — title "Passes & memberships" (`Archivo 800, 27px,
letter-spacing -.02em`) + sub "Buy for anyone on your account." (`500 14px`,
`#8a877f`) — and a **bag icon** (`bi-bag`, 40×40 white rounded square) with a red
count badge (`#f44336`, showing `2`). Below: a vertical stack (`gap:14px`) of
**BookingCard** components, one per product.

**Products (6):** Day Passes (Open Gym green, From $25), Open Gym Membership
(green, From $110), Class Passes (Classes blue, From $30), Class Membership (blue,
$180), Private Class Pack (Private red, From $250), Athletic Membership (Athletic
amber, $150). Each: title, description, two pills, price + price-note, action
"Buy". See `storeProducts` in the source for exact copy.

### 3. Book  (tab `book`, center FAB)
**Purpose:** start a booking flow.

**Layout:** title "Book" + sub "What would you like to book?", then a vertical
stack of **BookingCard**s — same component as Store but with a **booking-tag**
badge (the colored pill in the card's top-left).

**Options (4):** Private Lesson (red · "By appointment" · From $85) · Open Gym
(green · "Drop-in" · From $25) · Weekly Camps (Camps orange · "Register" · $350/wk)
· Birthday Party (Parties pink · "By appointment" · From $350). Exact copy in
`bookOptions`.

### 4. Schedule  (tab `schedule`)
**Purpose:** browse drop-in classes & open gym; "just show up."

**Layout:**
1. Title "Schedule" + sub "Drop-in classes & open gym — just show up."
2. **Day strip** — horizontal scroll of 7 day chips (Mon 14 … Sun 20). Each chip:
   min-width `52px`, radius `14px`, DOW label (`Archivo 700, 10px, uppercase`) over
   day number (`Archivo 900, 16px`). Selected = Ink `#211f1b` bg / white text;
   unselected = white bg, border `#e6e4dd`, Ink text, `#9b8e6a` sub. Default
   selected day index = 4 (Fri, shown as "Today").
3. **Day heading** — e.g. "Today · Fri Jul 18" + session count ("3 sessions").
4. **Session list** — white cards (`gap:10px`), each: left time block (`Archivo
   900, 15px` time + `700 10px` am/pm), a `3px` category accent bar, title
   (`Archivo 800, 15px`), sub (`500 12px`, `#8a877f`), and a green **"Drop-in"**
   chip (`bi-unlock-fill`, fg `#1b6b2f`, bg `#e6f4ea`). Open Gym appears as a
   session on most days. Full weekly schedule map is in `schedule` in the source.

### 5. More — Everything else  (tab `more`)
**Purpose:** account management + a launcher for the rest of the site.

**Layout:**
1. **Account card** (white, radius `16px`): header row = yellow `44px` avatar
   circle with the member initial (`Archivo 900, 18px`, Ink) + name "<Name>
   Rivera" + "Account holder". Then a list of tappable rows, each with a leading
   Bootstrap icon, label (`600 14px`), and trailing `bi-chevron-right`:
   **Family members · Waiver & documents · Payment methods · Notifications ·
   Help & contact · Sign out** (Sign out label muted `#9b8e6a`).
2. **Explore grid** — eyebrow "EXPLORE" then a 2-column grid (`gap:12px`) of tiles.
   Each tile: white card, radius `16px`, a `40px` rounded-square icon chip tinted
   `color-mix(in srgb, <cat> 14%, #fff)` with the icon in the category color, then
   title (`Archivo 800, 14.5px`) + sub (`500 11.5px`, `#8a877f`). Tiles: **Camps ·
   Events · Private Lessons · Athletic Program · Pricing · Groups · About ·
   Reviews** (icons/colors/subs in `moreTiles`). Tapping most tiles routes into
   Book or Store.
3. **"Visit us" card** — Ink `#211f1b` bg, radius `20px`, white text. Yellow
   eyebrow "VISIT US", then address (75 Carl Hall Rd, Unit 15 · Downsview Park,
   Toronto) with `bi-geo-alt-fill`, hours (Open 7 days · 11 AM – 10 PM) with
   `bi-clock-fill`, and two buttons: **Instagram** (`bi-instagram`) and **Call us**
   (`bi-telephone-fill`), each a translucent white pill.

## Interactions & Behavior
- **Tab navigation:** tapping a bottom-nav item switches the visible screen;
  active item turns white. Several in-screen shortcuts also switch tabs: Home's
  "Manage →" → More; "Book →" and empty-booking CTA → Book; quick-add buttons →
  Store; More's explore tiles → Book or Store per `moreTiles`.
- **Member carousel:** horizontal scroll-snap (snap-align center). Supports
  drag-to-scroll with a mouse (grab cursor; `>3px` movement counts as a drag).
  The dots reflect and control the active card; `scrollToCard(i)` animates to card
  `i` (card pitch ≈ `322px`). Active card index tracked in state.
- **Schedule day select:** tapping a day chip sets the selected day and swaps the
  session list + heading.
- **Open status pill (live):** computed from the **current time in
  `America/Toronto`**. Gym hours are 11 AM–10 PM (Fri until midnight). When open:
  "Open now", green fg `#5fd07f` / bg `rgba(95,208,127,.13)`, with a pulsing dot
  (`@keyframes tmv-pulse` box-shadow ring, 1.6s loop). When closed: "Opens 11 AM",
  muted white. A 60-second interval re-renders so the pill stays current.
- **Press states:** nav `scale(.9)`; tiles/quick-adds `scale(.97–.98)`; BookingCard
  hover lifts `translateY(-4px)` with a stronger shadow and widens the action gap
  (hover is desktop-only affordance; on device use the active/press state).

## State Management
Local UI state only (no server in the mock):
- `tab` — active screen: `home | train | book | schedule | more` (default from
  `startTab` prop, else `home`).
- `heroIndex` — active member card in the Home carousel (reset to 0 on tab change).
- `day` — selected Schedule day index (default `4` = Fri).
- `cats` — category color map, loaded async from `categories.js` on mount.
- **Props / configuration:** `memberName` (string, default "Ana"), `accountType`
  (`family | self`, default `family`), `startTab` (initial tab). In a real app
  these become the signed-in user's profile + the entry route.

**Data to fetch in the real app:** signed-in member + family members and each
person's memberships/passes (with remaining counts & expiry); active bookings &
registrations; the weekly class schedule; the buyable product catalog with live
prices; gym hours for the open/closed status.

## Design Tokens

**Core palette**
- Ink (primary text / dark surfaces): `#211f1b`
- Paper (app background): `#f5f4f1`
- Mock canvas bg (not app): `#e9e7e1`
- Brand Yellow (primary accent / FAB): `#ffd400`
- Card white: `#fff`; hairline border: `#ebe9e4` (also `#f0efea`, `#efeee8`)
- Muted text: `#8a877f`, `#9b9890`; eyebrow/gold-grey: `#9b8e6a`
- Dot inactive: `#d8d5cd`

**Category accent colors** — from `categories.js` (single source of truth; never
hardcode, resolve by key). Classes `#2196f3` · Athletic `#ffb82a` · Private
`#f44336` · Partner `#0d9488` · Open Gym `#2e9e4f` · Camps `#e27902` · Parties
`#e5399b` · Groups `#8c52ff` · Introduction `#6e6e6e`.

**Status / tone chips** (fixed meaning, reused everywhere)
- Go / positive: fg `#1b6b2f`, bg `#e6f4ea`
- Info: fg `#3a4a8c`, bg `#eef0f6`
- Neutral: fg `#211f1b`, bg `#f3f2ee`
- Open-now green (on dark): `#5fd07f`

**Typography**
- Display / headings / all labels & numerics: **Archivo** (weights 500–900).
  Sizes used: 27px/800 (screen titles), 20px/800 (card titles), 17px/800, 15px/800,
  13px/800 eyebrows, 10–11px/700–800 uppercase labels & chips.
- Body / UI text: **native system sans** (`-apple-system, BlinkMacSystemFont,
  'Segoe UI', system-ui, sans-serif`), weights 400–600.
- No other font families.

**Radii:** phone frame 46px · member card 22px · "Visit us" card 20px · white
cards / tiles / BookingCard 16px · day chip / icon chip 14px/12px · pills 999px.

**Shadows:** cards `0 1px 3px rgba(28,25,23,.04–.05), 0 12–14px 30px -22–24px
rgba(28,25,23,.38–.5)`. FAB `0 6px 15px -7px rgba(255,212,0,.45)`.

## Assets
- `assets/tmvlogo.png` — the monkey mark shown in the app header (28×28). Included
  in this bundle.
- **Icons:** [Bootstrap Icons](https://icons.getbootstrap.com/) v1.11.3 (loaded
  from CDN in the prototype). Icon names are given inline throughout this README
  and in the source. Swap for the target app's icon set if it has one; otherwise
  bundle Bootstrap Icons.
- **Fonts:** Archivo via Google Fonts (weights 500–900); body font is the OS
  system font (no download).

## Files (in `design-files/`)
- **`Mobile App Mockup.dc.html`** — the entire app: all five screens, the shell,
  the nav, and all sample data + logic (`renderVals()`). Start here.
- **`BookingCard.dc.html`** — the shared product/booking card used on Store & Book.
  Documents the accent bar, booking-tag badge, pills, price block, and action row.
- **`categories.js`** — category → accent-color map. The color source of truth.
- **`assets/tmvlogo.png`** — app header logo.
- **`support.js`** — prototype runtime **only** (do not port). Lets you open the
  `.dc.html` files in a browser to view the design live.

> These are `.dc.html` "Design Component" prototypes: markup between `<x-dc>`
> tags with an inline `<script>` logic class. Read them as a spec — the inline
> `style="…"` on each element is the literal styling to reproduce, and the logic
> class holds the sample data and behavior.
