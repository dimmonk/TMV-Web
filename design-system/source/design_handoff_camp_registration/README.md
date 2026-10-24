# Handoff: Camp Registration

> **Read CHANGELOG.md first** if you saw the v1 package — the design was
> significantly revised (shared component, calendar-style week picker, CTA
> colours, cancellation policy block, mobile breakdown sheet).

## Overview
A multi-child summer camp registration flow for **The Monkey Vault**. A parent adds
one or more children, picks each child's camp type (Weekly, P.A. Day, or Private
Day), selects days on a calendar-style week picker, adds optional late pickup,
fills in camper + parent details, completes a one-time waiver step, and pays once
via Square. A running total updates live. On submit the page swaps to a printable
confirmation / receipt view.

The flow is **one shared component** (`CampRegForm.dc.html`) rendered in two shells:
- **Desktop**: `Camp Registration.dc.html` = site header + dark hero + form + footer.
- **Mobile**: `Mobile Website.dc.html` mounts the same form as its "Register"
  sub-screen (hero hidden via a `showHero` prop; the app's tab bar hides during
  registration so the form's sticky pay bar owns the bottom edge).

Implement the flow once and render it in both contexts.

## About the Design Files
The files in this bundle are **design references created in HTML** — working
prototypes showing intended look, copy, and behavior, not production code to ship.
Recreate them in the target codebase's existing environment (React, Vue, native,
etc.) using its established patterns; if no environment exists yet, choose the most
appropriate framework and implement there.

The prototypes are "Design Components" (`.dc.html`): the `<x-dc>` template holds
markup, the trailing `<script>` class holds logic (state, pricing, handlers). The
logic class (`renderVals()`) is the source of truth for computed values and wiring.
They reference a prototype runtime (`support.js`, not included) — treat them as
readable specs, not a runnable bundle.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy, and interactions are final.
Recreate to match, using the codebase's UI library where equivalents exist.

## Screens / Views

### 1. Build stage
Two-column grid on desktop (`minmax(0,1fr) 340px; gap:26px`, max-width 1140px);
single column below a 920px **container** width (use container queries — the form
must adapt to its container, not the viewport, because the mobile shell renders it
inside a 392px phone frame).

**Child card** (white, radius 16, border 1.5px — accent `#e27902` when expanded,
`#eae7df` collapsed): collapsible header with initial badge (36×36, accent bg),
name + summary line, live price (hidden while $0), trash (only when >1 child),
chevron. One card expanded at a time.

**Camp chips**: Weekly / P.A. Day / Private Day. Selected: accent border +
`#fff7ef` bg + check icon.

**Weekly — calendar picker** (the core UI):
- Eyebrow "Pick your days" + hint line "Tap days — or tap a week's name to take
  the whole week."
- Month dividers ("JULY", "AUGUST" — Archivo 800 11px uppercase + hairline).
- One row per camp week (9 weeks, Jun 29 – Aug 28): left label (week name, "4-day"
  tag on holiday weeks, price) + five date cells (M/T/W/T/F letter 8.5px over
  day-of-month number 13.5px, 40px wide, radius 9).
  - Cell states: **off** (white, `#e0dcd3` 1.5px border), **on** (accent bg+border,
    white text), **holiday** (`#f3f2ee` bg, `#c9c4b8` text, "–", not tappable —
    Jul 1 and Aug 3).
  - Price: unselected = full-week rate, grey `#9b9890`; selected = computed price
    incl. late pickup, accent.
- Selected weeks reveal a late-pickup sub-row (`#fbf9f4` bg, hairline top):
  label "Late pickup to 4 PM" + running "+$40" ("+$75 (capped)" at 4+ days) and
  five letter cells aligned to the same columns (on: ink `#211f1b` bg / yellow
  `#ffd400` text; off: white bordered; non-attending day: invisible spacer).
- ≤560px container: week label becomes a full-width line (name · tag · price
  right-aligned), cells stretch edge-to-edge below (min 40px, max 54px each).

**P.A. Day**: date rows ($90 each, 9 AM–2 PM) with checkbox + optional late-pickup
add-on row (+$20 each; shown only when `dayCampLatePickup` is on).

**Private Day**: info panel — booked by appointment via the booking system
(external link), not paid in this cart.

**Camper details**: name; age (`type="number"`, min 5, max 17, placeholder
"Age (5+)"); allergies ("Allergies we should know about" — do NOT claim a nut-free
facility anywhere); notes. **Waiver** block: Step 1 "done before?" (Yes on file /
No first time); "No" reveals Step 2: yellow "Please sign the waiver here" link +
"I've completed the waiver" confirm tick.

**Add buttons** (dashed, side by side): "Add another child", and — once Camper 1
has days picked — "Add a sibling — same days as {name}" (copies camp + weeks/dates;
details & waiver stay per-child).

**Parent / guardian** card: name, email, phone.

**Summary card** (sticky right rail, desktop only): dark header, per-child line
items (week · dates, day detail, amounts; late-pickup sub-lines grey), then:
- Total row + "HST included"
- **CTA: brand yellow `#ffd400` on ink `#211f1b`** — "Register & pay $X" (amount
  omitted while $0). *Never fill CTAs with the category accent.*
- "🔒 Secure checkout by Square" (centered, muted)
- Hairline, then the policy block: **"Plans change?** Cancel any week up to two
  weeks before it starts for a full refund, minus a $20 processing fee. With less
  notice, 15% is retained." (500 11px/1.55, `#9b9890`; lead-in 700 `#7a7770`)
- Waiver-pending (amber) / error (red) notices above the CTA when relevant.

**Mobile sticky bar** (≤920px container; desktop summary hidden): dark bar with
camper count + total (accent) on the left — **tappable**: expands a breakdown
sheet above the bar (per-camper lines, "HST included. Cancel any week…" note,
max-height 270px scroll, chevron flips) — and a yellow "Register →" button.
Validation/waiver notices render just above the bar.

### 2. Confirm stage
Printable receipt card: green-check "You're registered!" + email + `TMV-XXXXX`
ref; "Registration summary / Paid in full" line items + total; "What to know
before camp" (4 icon groups — copy verbatim in the logic's `instructions` array,
incl. the cancellation policy); address line; actions ("Download PDF summary" =
`window.print()`, "Register another camper" = back to build). `data-noprint`
chrome hides on print.

## Interactions & Behavior
- Day-cell tap toggles a day (creates the week entry on first tap, removes it when
  the last day is untapped). Week-name tap: none/partial → full week; full → clear.
- 5 selected days automatically price at the weekly rate ($350); fewer use the day
  tiers (1d $90 / 2d $170 / 3d $240 / 4d $300). Holiday (4-day) weeks max out at
  the 4-day tier.
- Late pickup $20/day, capped at $75 for 4+ days per week.
- Validation on Register, in order: total > 0; parent name + email; each
  non-private child needs ≥1 day, a name, age ≥5 (if given), satisfied waiver.
  First failure sets the error (summary card on desktop, above the bar on mobile).
- Waiver nudge appears only after "No — first time" is chosen without the confirm
  tick; untouched waivers are caught at register time.
- Submit generates a ref, switches to confirm, scrolls to top (scroll the actual
  scroll container — the phone shell scrolls a div, not the window).

## State Management
- `stage: 'build'|'confirm'`; `kids[]`: `{ id, name, age, allergies, notes,
  waiver:'unset'|'yes'|'no', waiverDone, camp:'weekly'|'paday'|'private',
  weeks:{[weekId]:{days:{[day]:bool}, late:{[day]:bool}}}, paDates:{[paId]:{late}} }`
  (no `mode` field — full week = all available days selected)
- `expanded` (one card), `parent{name,email,phone}`, `error`, `ref`,
  `mSumOpen` (mobile breakdown), `priceList` (live).
- Prices load from the members-app SSOT (`tmv-data.js` → `getPrices()`); hardcoded
  fallbacks cover offline. Wire to the real pricing source + Square checkout in
  production.

## Design Tokens
Core: ink `#211f1b`, paper `#f5f4f1`, brand yellow `#ffd400` (ACTION — all
conversion CTAs, yellow on ink), category accent `#e27902` (IDENTITY — selected
states, checks, prices, icons; prop-driven, options `#e27902 #2196f3 #f44336
#2e9e4f #ffd400`).
Secondary text `#5b5853`/`#8a877f`/`#9b9890`/`#b0aca3`; borders `#e3e0d8`/
`#e8e5dd`/`#ece9e2`/`#e0dcd3`; tint panels `#fbf9f4`/`#faf9f5`/`#fff7ef`;
waiver-ok green `#1b6b2f` on `#eef7f0`; warning `#a2601f` on `#fff7ef`; error
`#b3261e` on `#fdecea`; holiday cell `#f3f2ee`/`#c9c4b8`.
Type: Archivo 700–900 for display/labels/CTAs; system sans for body. Radii:
inputs 10, cells 9, rows 12, cards 16–18, doc 20. Icons: Bootstrap Icons 1.11.3.

## Files
- `CampRegForm.dc.html` — **the flow itself. Primary file.**
- `Camp Registration.dc.html` — thin desktop page shell.
- `Mobile Website.dc.html` — mobile site; see its "Register" sub-screen +
  `navVisible` handling and the camp cards routing via `onClick`.
- `BookingCard.dc.html` — shared card; note the optional `onClick` prop.
- `SiteHeader.dc.html`, `SiteFooter.dc.html` — desktop page chrome.
- `tmv-data.js` (live prices), `site-config.js`/`.json` (canonical Square/booking/
  waiver URLs), `categories.js` (category colours — `catColor('camps')`).
- `CHANGELOG.md` — everything that changed since v1.
