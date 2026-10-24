# The Monkey Vault — build rules (read first, every time)

This project HAS a design language. Use it. Do not invent components, colors, or
type. When something feels missing, the answer is almost always "reuse what exists,"
not "make a new thing." `Design Language.dc.html` is the index of the whole system.

## Desktop is the source of truth — mobile derives from it
The desktop site is the SSOT for every component, layout pattern, and piece of
copy. When building or fixing the mobile version:
1. Find the desktop component/pattern this maps to first.
2. If it already works as-is on mobile (or with a smaller size prop), `<dc-import>`
   it directly — do not rewrite its markup, CSS, or interaction logic inline in
   the mobile file, even "just this once."
3. Only if it's genuinely unusable at mobile width (e.g. needs a different tap
   target, different layout shape) do you adapt it — and when you do, factor the
   shared part into (or out to) a component BOTH desktop and mobile import, so
   there is still one implementation, not two forks that can drift apart.
4. Never duplicate a component's CSS/state/logic into a second file. If you
   catch yourself copy-pasting a `<style>` block or a handler between Home.dc.html
   and Mobile Website.dc.html (or any two pages), stop and extract a shared
   `.dc.html` component instead.

## Always start from these — never hand-roll an equivalent
Mount the existing component with `<dc-import>`; adapt by passing fewer/different
props, NOT by rebuilding it:
- **BookingCard.dc.html** — any "thing you can book / choose" card (accent bar,
  optional duration chip, status flag, tinted pills, price, action). Trim it by
  omitting props (duration/pills/price are all optional) — don't clone it.
- **ClassCard.dc.html** — the flip card that sells a class (front + back).
- **Pill.dc.html** — every small label/tag. One spec, pick a variant.
- **SiteHeader / SiteHero / SectionHeader / Pathway / JumpNav / CtaBand / SiteFooter** —
  the page furniture. Reuse, don't recreate.

If a component is *close* but not perfect, make a small NON-BREAKING improvement to
the component itself (e.g. wrap a field in `sc-if` so it's optional), then use it.
Other pages must keep working.

## Colors — never type a hex you made up
- Category / "colour by what you're booking" accents come from **`categories.js`**
  (`catColor('private')`, etc.). It is the single source of truth and the Design
  Language page reads from it too. Change a color THERE, once.
- Core palette: Ink `#211f1b`, Brand Yellow `#ffd400`, Paper `#f5f4f1`.
- Status chips already exist (green `#1b6b2f`/`#e6f4ea`, neutral ink/`#f3f2ee`,
  blue `#3a4a8c`/`#eef0f6`) — reuse them; don't mix new amber/green tints.
- A status is a FIXED binary, not a category. Same meaning = same colour on every
  card (e.g. "No reservation" = green `go` chip everywhere, "Reservation required" =
  neutral chip everywhere). Use `BookingCard`'s `status` + `statusTone` (neutral/go/
  info) for this — never the category colour, which only marks identity (bar/arrow).
- **Colour has three roles — never mix them.** Brand yellow = ACTION: every primary /
  conversion CTA is yellow on ink, on every page, so button colour always means "this
  is the button" (a day-pass CTA is yellow, NOT the Open Gym green). Category colour =
  IDENTITY only: bar, arrow, category pill — it never fills a CTA. Green = STATUS (the
  `go` chip); don't reuse it as an action colour. The only category-on-a-button case:
  a SECONDARY / ghost button inside a category-themed block may take a thin
  category-coloured border; the filled primary CTA still stays yellow.

## Card backs — locked facts vocabulary
The flip-side spec sheet uses fixed labels in fixed order: **Level → Ages →
Schedule → Booking → Price** (skip empty rows, never rename; max one "·" detail
per value). Locked values: Level = "All levels" / "Levels 1–2" / "Prerequisite
required" (never "beginner-friendly"). Booking = one phrase per method:
"Drop-in · no reservation needed" / "By appointment · reserve online" /
"Membership · join any time" / "Direct with the coach". "Who"/"Format" labels and
"open gym included" (universal = noise) are retired. One product-specific extra
row only when it's the defining fact (e.g. Disciplines). Full spec:
`Card - Design Language.dc.html` section 02.

## Type
Archivo (700–900) for display/headings; native system sans for body/UI. No other
families. Sizes per the Design Language type block.

## Links
All Square/booking URLs route through **`site-config.js`** (booking, store, waiver,
…). Use the canonical URL; never paste a different one inline.

## Content bar
Less is more. Default to the minimum that does the job — a context like "Get Started"
needs the choice + reservation status + one line + the action, NOT every field a
card *can* show. Don't pad with stats, pills, or extra sections unless asked.

## JumpNav right side (`actions`)
The right-aligned links are "leave this page to act or reference" — NEVER section
anchors (those are the left `items`). Max 2, filled in this priority order:
1. **Primary action** — the single page-level conversion, and ONLY on pages that
   have one. Pages that book per-card (Train, Camps, Store, Private Lessons — each
   program has its own reserve button) have NO page-level CTA, so they skip this
   slot. One-conversion pages get it: Events → "Book a party", Athletic Program →
   "Join now" (Square URLs via `site-config.js`).
2. **Reference shortcut(s)** — shared cross-page references in FIXED order:
   Price List → Full Schedule. Price List appears on pages that sell
   class/pass-priced things; Full Schedule only when the page is time/class-based
   (Train). Store sells gift cards/merch → NO price-list link.
Current map: Train = Price List · Full Schedule; Camps / Private Lessons = Price
List; Events = Book a party; Athletic = Join now; About = New here? Get started
(soft primary, no pricing/booking); Store / Get Started = none.
