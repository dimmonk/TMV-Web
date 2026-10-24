# Changelog — Camp Registration handoff v2 (Jul 20, 2026)

Changes since the v1 package. The design was heavily revised after a design audit
and stakeholder review; treat v2 as the source of truth.

## Architecture
- **Split into a shared component.** The whole registration flow now lives in
  `CampRegForm.dc.html`. `Camp Registration.dc.html` is a thin desktop page (site
  header + the form + site footer). The mobile site (`Mobile Website.dc.html`,
  "Register" sub-screen) mounts the SAME component — implement it once, render it
  in both shells.
- Responsiveness is **container-based, not viewport-based**: the form switches to
  its narrow layout when its container is ≤920px (grid → single column, sticky
  bottom pay bar) with a second breakpoint at ≤560px (week rows stack). Recreate
  with container queries or equivalent.
- In the mobile app shell, the bottom tab bar is **hidden during registration**;
  the form's sticky pay bar owns the bottom edge. Back is via the "‹ Registration"
  app-bar title.
- `BookingCard.dc.html` gained an optional `onClick` prop — when set it replaces
  `href` (in-app navigation instead of an external link). Used to route camp cards
  to the registration screen.

## Week picker — now a calendar (biggest UI change)
- The old week rows (checkbox + "Full week / Pick days" segmented toggle + day
  pills) are GONE. Each week is now a **calendar row**: five tappable date cells
  (M/T/W/T/F letters with real day-of-month numbers), grouped under "July" /
  "August" dividers.
- Tap a date cell to toggle that day; tap the **week name** to take (or clear) the
  full week. Mode is implicit: 5 selected days price at the weekly rate.
- Stat holidays (Jul 1, Aug 3) render as **disabled cells** ("–"), which is how
  4-day weeks explain themselves (plus the small "4-day" tag).
- The per-week dates line ("Aug 17 – 21") was removed — redundant with the cells.
- Late pickup: when a week has any selected day, a sub-row appears with letter
  cells aligned to the same five columns (ink/yellow when on; hidden spacer for
  non-attending days keeps alignment).
- On narrow containers (≤560px) each week stacks: full-width label line (name ·
  4-day tag · price right-aligned), cells stretched edge-to-edge below.

## Pricing & CTA behavior
- Week row shows a live price: unselected = full-week rate (grey); selected =
  the actual computed price incl. late pickup (accent).
- No more "$0" noise: camper-header price and CTA amount only render once
  total > 0 (CTA reads "Register & pay" until then).
- Late-pickup label is just "Late pickup to 4 PM" — tapping shows the running
  "+$40", with "+$75 (capped)" at 4+ days.
- Removed the old tier-dump hint lines ("1d $90 · 2d $170 …", "Full week $350 ·
  fewer days priced per tier …").

## Colour-system compliance (important)
- All conversion CTAs — "Register & pay", mobile "Register", "Book a private
  day", "Please sign the waiver here" — are now **brand yellow `#ffd400` on ink
  `#211f1b`**. The category orange (`accent`, default `#e27902`) is IDENTITY
  only: selected states, checks, prices, icons. Never fill a CTA with it.

## Cancellation policy
- New "Plans change?" fine-print block at the bottom of the summary card (and in
  the mobile breakdown sheet): *"Cancel any week up to two weeks before it starts
  for a full refund, minus a $20 processing fee. With less notice, 15% is
  retained."* Terms line under the total is just "HST included".

## Mobile-specific additions
- **Tappable total**: the sticky bar's total expands a dark line-item breakdown
  sheet (per-camper lines + HST/cancellation note, max-height scroll) so parents
  can review before paying. Chevron flips with state.
- Validation / waiver notices render above the sticky bar on mobile (the desktop
  summary card that held them is hidden there).

## Flow & validation
- **Sibling shortcut**: once Camper 1 has days picked, a second dashed button
  appears — "Add a sibling — same days as {name}" (copies camp + weeks/dates;
  details and waiver stay per-child).
- Waiver warning only shows after the parent answered "No — first time" without
  ticking the confirm; an untouched waiver is caught at register-time validation.
- Age is `type="number"`, min 5 / max 17, placeholder "Age (5+)", validated at
  register time ("Camps are for ages 5 and up…").

## Copy
- All "nut-free facility / environment" claims removed (business doesn't enforce
  it). Now phrased as a request: "please avoid nuts"; allergies placeholder is
  "Allergies we should know about".

## State model change
- Week entries are now `{ days: {Mon:true,…}, late: {Mon:true,…} }` — the old
  `mode: 'full'|'days'` field is gone (full week = all available days selected).
