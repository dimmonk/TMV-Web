# Drift list: design system vs live site

Compared: the export (`design-system/source/`, newest root copies) against `main` at
release 37 (`63125ee`). Nothing has been changed on either side. Each item needs Steven's
yes or no.

How to read an item:
- **Design** is what the export shows. **Live** is what visitors see today.
- **Recommend** is my pick and the reason, judged by one test: does a first-time visitor,
  mostly on a phone, find their way in faster?
- "Keep live" means: change nothing on the site, and update the design system file so it
  matches the site. "Use design" means: change the live site (a site change, done only
  after your yes).

32 items: 4 change the live site, 22 keep the site as it is, 5 are design-file clean-ups,
1 is repo housekeeping.

## Changes to the live site (need your yes)

| # | Difference | Design | Live | Recommend | Why |
|---|---|---|---|---|---|
| C1 | Em dashes in copy | Used throughout | 76 site files still have them, including most page titles shown in Google results | Remove from both, replace with a period, comma or colon | Your standing rule. Titles in search results are the first thing a new visitor reads |
| C2 | Camp allergy line | "Please avoid packing nuts, and let us know about any allergies" (camp handoff removed the nut-free claim on purpose) | Camps page: "A nut-free environment, please pack nut-free". The camp registration form and the Square camp page already say "avoid nuts" | Use design wording | "Nut-free" is a promise the gym cannot guarantee; a parent of an allergic child may rely on it. One wording everywhere |
| M1 | Mobile Book button size | Raised yellow circle 54px, lifted 30px | 64px, lifted 36px | Use design (54px) | The bottom bar takes less of a small phone's screen and the button still stands out |
| G3 | Private Lessons "Way 3" button | Red filled (breaks the design's own rule) | Red filled (follows the design) | Make it yellow, or ink | The colour rule is yellow means action, red means "Private". A red button reads as identity or a warning, not "tap me" |

## Keep live (update the design system to match the site)

| # | Difference | Design | Live | Recommend | Why |
|---|---|---|---|---|---|
| T1 | Breakpoints | 820 (menu, heroes stack), 720 and 440 (footer), 460, 768 | 640 / 768 / 1024 / 1280, phone chrome below 768 | Keep live | Matches the other three TMV apps; one phone line for everything |
| T2 | Darkened category colours for text | CHANGELOG says never darken, yet BookingCard, ClassCard, Pill and Booking Tag E darken light colours (Athletic amber) for text | Same darkening for text on white; fills at true hex | Keep live, and write the rule as: fills at true hex, small text on white darkened only when the true colour is unreadable | Amber `#ffb82a` text on white is not readable. Fills keep the real colour |
| H1 | Desktop nav | Train, Camps, Events, Pricing, Store, About (6) | Classes, Open Gym, Camps, Birthday Parties, Schedule, Pricing, Visit Us (7) | Keep live | Your approved navigation (Open Gym joined in October). Visitors look for "Classes" and "Birthday Parties", not "Train" and "Events" |
| H2 | Menu button breakpoint | Below 820px | Below 1024px | Keep live | Seven links do not fit between 820 and 1024 |
| H3 | "New here?" button in the header | Always on desktop | Hidden below 1280px (still on Home, in the menu and the footer) | Keep live | Same space reason as H2 |
| F1 | Footer address, hours, socials | Typed; socials link to `#` | From Members settings, hidden when empty | Keep live | Staff edit them once in Members; a typed copy goes stale |
| D1 | Prices, hours, camp dates, Square links | Typed in the design (`PRICES` map, 9 summer weeks, P.A. dates, hours 11 to 10) | All from Members (price list, camp catalogue, site config) | Keep live | Your locked rule: Members holds the numbers, names, dates and links |
| D2 | Camp registration data | Weeks, P.A. dates and fallback prices typed in CampRegForm | Form reads the Members camp catalogue and price list (page not published yet) | Keep live | Same rule as D1 |
| D3 | Class media | GIFs (8 to 11 MB each) and mp4 | mp4 only, play when on screen | Keep live | GIFs are 10x heavier; on a phone they slow the page (the agency audit flagged the same) |
| D4 | Photos | Hotlinked from the old Square site (editmysite CDN) | Served from the site's own `public/assets/` | Keep live | The old site's images disappear when Square is retired |
| K1 | ClassCard | Flips; pills on the front, spec sheet (Level, Ages, Schedule, Booking, Price) on the back | No flip; the spec sheet is on the front, no pills | Keep live | A parent on a phone sees level, ages, schedule and price without discovering a hidden tap |
| K2 | Booking-method tag | Three versions: solid (components), tinted (Design Language hub), outlined (options file, marked new) | Solid | Keep live (solid) and delete the other two from the system docs | One element, one look |
| P1 | Pill look | Light: grey `#f3f2ee` fill. Tinted: text in the true category colour. Dark: pure white text. Optional icons | Light: white fill. Tinted: text darkened 55%. Dark: white at 85%. No icons | Keep live | Darkened text is readable on every category (see T2); icons are unused anywhere on the site |
| M2 | Mobile tab label | Home, **Train**, Book, Schedule, More | Home, **Classes**, Book, Schedule, More | Keep live | Matches the desktop nav (H1) |
| M3 | Mobile More | A full screen | A bottom sheet over the current page | Keep live | Opens and closes without losing your place |
| G1 | Pathway component colour | Athletic destination `#e9a300` | Not used; live has its own path strip (`PathStrip`) and goal picker | Keep live; mark Pathway retired | Your goal-picker rulings replaced it |
| G2 | Home page | Offerings flip tiles, Camps band, Reviews | Goal picker, schedule changes, special events, visit summary, activity links, Reviews | Keep live | Built from your rulings of Oct 20 to 24 (one goal in, one recommendation out) |
| G4 | Pricing page | The printed sheet layout embedded | The same price list in the website's own card look (`web` variant) | Keep live | Reads on a phone; the print layout is a fixed Letter page |
| G5 | Schedule page | The printed weekly sheet embedded | Real dated weeks with cancellations and closed days | Keep live | Shows this week's actual classes, not a template |
| R1 | Reviews | 4.9 from 300+, three sample quotes | 4.6 from 449, three real Google quotes | Keep live | Real figures; invented ones would mislead |
| A1 | Accordion style | Faq cards (plus icon) and the Events two-column chevron list | Both, same as design | Keep both for now; pick one standard later if you want | Each fits its page; no visitor harm today |
| D5 | Input style | Two: invitation (white, ink focus) and camp registration (grey fill, orange focus) | Both, same as design | Keep both for now | Same as A1; worth one standard when the camp form goes live |

## Design file clean-ups only (no site change)

| # | What | Fix in the design system |
|---|---|---|
| T3 | `Card - Design Language`, `Booking Tag - Options` and the two audit docs use a cooler neutral set (`#17171b`, `#f6f6f7`, `#e9e9ec`, yellow `#ffd200`) found nowhere else | Note as doc-only styling; the site tokens are Ink, Paper, Yellow |
| T4 | Parties still yellow `#ffd400` in `Card - Design Language` section 08, the Mobile Website fallback and the old standalone build | Parties is pink `#e5399b` |
| T5 | Stray colours: open gym `#4caf50` in the schedule embed, lifted `#4caf6a` / `#4aa3f0` on Train, Explosive `#e23b3b`, Speed League `#ef5a4e`, page colours Schedule `#0ea5e9` and Reviews `#e9a300` | Use the nine category colours only |
| C3 | Arrival rule: Faq default says 30 minutes, everything else says 15 | 15 minutes (live says 15 everywhere) |
| C4 | Explosive class still shown on Train and Athletic; it is cancelled | Remove from the design pages |

## Repo housekeeping

| # | What | Recommend |
|---|---|---|
| X1 | `design-reference/` (the previous handoff) is now superseded by `design-system/` | After you approve this list, remove `design-reference/` and point CLAUDE.md and project memory at `design-system/` (one reference, not two) |

## Outside the website (Members app, noted only)

- The Members app concept (`Account Hero Card - Variants`, `uploads/account-hero-card.html`) shows a private 5-pack with an expiry ("valid 12 months", "Expires Jan 14"). Your rule: private 5-packs do not expire.
