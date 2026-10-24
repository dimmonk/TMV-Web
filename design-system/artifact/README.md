The public website of The Monkey Vault, a parkour and movement gym in Toronto. Built from the Claude Design export "Website redesign from Square" (October 2026) and checked against the live site at release 37.

**Status: draft for Steven's approval.** Where the design and the live site differ, the [Drift list](drift-list.md) names each difference with a recommendation. Nothing changes on the live site or in this system until Steven says yes to an item.

## Who it is for

A first-time visitor, mostly on a phone, who must find their way in within seconds: a parent booking a kid's class or party, a teen or adult trying parkour, someone looking for open gym. Every rule below serves that.

## Ground rules

1. **Desktop holds the content; the phone gets the same content laid out for the phone.** One page per route. The chrome changes at `bp-md` (768px): below it the phone app shell (MobileAppBar, MobileTabBar), at and above it SiteHeader and SiteFooter. Content never carries chrome and never assumes a width.
2. **Reuse the components here; never fork a second copy.** If a page needs something new, it is proposed first, with the reason it helps the visitor.
3. **Category colours come from one place**: the `cat-*` tokens.
4. **Members holds the facts that change**: prices, hours, address, phone, email, socials, camp dates, the schedule, booking links and the banner. Never type them into a page or a preview. A price is named by its price-list key in braces (`{openGym1x}`), filled at build and again in the browser.
5. **Less is more.** Every line of copy earns its place.

## Colour

Three roles, never mixed:

| Role | Token | Use | Never |
|---|---|---|---|
| Action | `yellow` | Primary buttons, Book Now, the active nav bar, numbers and eyebrows on `ink` | A category's identity; text on `paper` or `card` |
| Identity | `cat-*` | Card top bar, category tag, tinted pills, section accent, the glow on a category page | A primary button |
| Status | `go-text` on `go-fill` (and `info-*`, `warn-*`, `error-*`, `ending-*`) | No reservation, Booking now, New, Ending, form errors | Decoration |

- One `yellow` action per view. A second action is `tmv-btn-dark` on light or `tmv-btn-ghost-dark` on `ink`.
- Pages sit on `paper`; cards on `card` with a `line` border; dark bands on `ink`; the footer on `ink-footer`.
- Body text is `ink`; secondary `text-2`; card descriptions `text-3`; section descriptions `muted`.
- Category fills use the true hex. Small text in a category colour on white is darkened only when the true colour is unreadable (athletic amber); text on an athletic fill is `athletic-ink` (drift T2).
- The nine categories: Classes `cat-classes`, Athletic `cat-athletic`, Private `cat-private`, Partner `cat-partner`, Open Gym `cat-open-gym`, Camps `cat-camps`, Parties `cat-parties`, Groups `cat-groups`, Introduction `cat-intro`. No other category colours (drift T5).

Contrast notes kept from the source: `muted-3` (2.9:1 on `card`), `faint` (2.1:1 on `paper`) and white text on most category fills (about 3:1) fall below 4.5:1. They are used only for short notes, eyebrows and bold tags.

## Type

- Display: **Archivo** 700 to 900 (Google Fonts), for headings, buttons, eyebrows, tags and prices. Styles `hero-title`, `hero-title-centered`, `section-title`, `mobile-hero-title`, `card-title`, `price`, `button`, `eyebrow`, `tag`. Buttons, eyebrows and tags are uppercase.
- Body: the system sans (`-apple-system`, Segoe UI, system-ui) 400 to 600. Styles `lead`, `body`, `body-sm`, `pill`, `nav`.
- Headings use tight tracking (-.018em to -.022em) and balanced wrap. Hero and section titles are fluid (`clamp`) on the site; the token holds the largest size.

## Layout and spacing

- Content max `container` (1200px), side padding `gutter` (24px).
- Sections `section-y` on lead sections and `section-y-sm` on the rest.
- Card grids `repeat(auto-fit, minmax(300px, 1fr))` with `grid-gap`.
- The desktop header is `header-h` tall; JumpNav sticks under it; sections set `scroll-margin`.
- Breakpoints are the live canon only: `bp-sm`, `bp-md`, `bp-lg`, `bp-xl` (640, 768, 1024, 1280). The export's 820, 720, 460 and 440 are not used (drift T1).

## Shape, depth and motion

- Radius by role: `radius-tag` tags, `radius-sm` header buttons and small tiles, `radius-btn` buttons and inputs, `radius-btn-lg` hero buttons and icon tiles, `radius-faq`, `radius-card` cards, `radius-tile` intro tiles and review cards, `radius-feature` feature and phone cards, `radius-pill` pills.
- Shadows are soft and warm: `shadow-card` at rest, `shadow-card-hover` on hover, `shadow-tile`, `shadow-feature`, `shadow-hero-media` for a photo on ink.
- Cards lift 4 to 5px on hover in .2s; media zooms 1.05. Text links grow their arrow gap from 7 to 11px. Flip cards turn in .6s cubic-bezier(.2,.75,.25,1). Respect `prefers-reduced-motion`.

## Cards: which one

- A card that **introduces** an area is an OfferingCard (no pills, no booking tag, one price line at most).
- A card that **sells** a class is a ClassCard (spec sheet: Level, Ages, Schedule, Booking, Price).
- A card that **books or buys** with the price up front is a BookingCard.

The test: does the card need to explain how you book? If yes, it is not an intro tile.

## Copy

- Plain words a parent would use. Name things by what visitors recognise: Classes, Open Gym, Camps, Birthday Parties, Schedule, Pricing, Visit Us.
- **No em dashes, anywhere.** Use a period, comma or colon.
- Buttons start with a verb: Book a session, Reserve, Register & pay.
- Pills are 1 to 3 words, never a sentence. See the Pill component for the vocabulary.
- Arrival is 15 minutes before a class, everywhere.
- Real figures only: the Google rating and quotes are the real ones.

## Imagery and icons

- Photos and class videos are the gym's own, served by the site. Class media are mp4 (muted, looped, played when on screen), never GIFs (drift D3, D4).
- Never show an identifiable child without the family's consent.
- Icons: Bootstrap Icons 1.11.3 on the site. The previews here use plain glyphs in their place.
- Logos: see the Logos asset group. The wordmark is live text in Archivo 900 `yellow` on `ink`.

## Further sections

- [Drift list](drift-list.md): every difference between the export and the live site, with a recommendation, for Steven to approve item by item.
- [Pages](pages.md): every page design, section by section.
- [Source and versions](versions.md): which copy of each export file is newest, and how the older `design-reference/` differs.
