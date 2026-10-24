# Pages

One section per page design in `source/`. Each lists the order of sections and the
components used. Live page in brackets.

## Home (`Home.dc.html`) [`src/pages/index.astro`]
1. Split dark hero: eyebrow "Parkour & Movement Training Centre · Toronto", H1 "Move better. Have more fun.", Book a session (yellow) and Explore the gym; stat rail $25 open gym day pass, 7 days open 11 to 10, Ages 3+ all levels; "New here?" link; photo crossfade every 4s with a yellow address badge.
2. "Book online" strip in ink.
3. 01 Where to start: SectionHeader "Three ways to get moving" and three OfferingCards (Train blue with athletic.mp4, Camps orange, Events pink).
4. 02 Camps band (ink): "Dated & filling up", camp cards with a 5px orange bar, status dot, price, ink Reserve.
5. Reviews.

## Train (`Train.dc.html`) [`train.astro`, nav label "Classes"]
Split hero "Train your way." JumpNav (Open Gym, Core, Specialized, Partnership; actions Price List, Full Schedule).
00 Open Gym dark feature band. 01 Core Programs: ClassCards Recreational, Private, Athletic (with backs).
02 Specialized (classes colour): Flip, Backflip Only, Calisthenics, Tricking, Gymnastics, Strength, Flexibility, Acro Dance, Handstand, Speed League, Explosive.
All-access membership dark band. 03 Partnership (teal): Stick Fighting, Martial Arts with "Direct with coach".

## Athletic Program (`Athletic Program.dc.html`) [`athletic-program.astro`]
Amber category page. Hero with four stats; JumpNav with "Join now". 01 The program and six benefit tiles. 02 Class structure in five steps. 03 Schedule as class-type rows (Athletic, Explosive, Speed League) pointing to the live schedule. 04 Join: membership card (2px amber border, price 46px, payment options) and a 10x pass fallback. CtaBand.

## Private Lessons (`Private Lessons.dc.html`) [`private-lessons.astro`]
Red category page. Hero "Private lessons, built around you." JumpNav (Three ways, Choose a coach, Good to know; action Price List). Three "way" cards with prices (Way 3 featured with a red border and red CTA). Coach roster (photo slot, role chip, bio, tags, "Book with X"): Taigh Smullen, Steven Leblanc, Nelson Lin. Good to know tiles. Dark help strip.

## Camps (`Camps.dc.html`) [`camps.astro`]
Orange hero "Parkour camps, packed with fun.", stats 9 AM to 2 PM, Ages 5+, til 4 PM, YouTube hero video, "Limited spots" badge. JumpNav (The Camps, A Day at Camp). Three flip tiles: Weekly, Private Day Camp, P.A. Day. "A day at camp": dark timeline, activity pills, six fact tiles, Sign the waiver.

## Camp Registration (`Camp Registration.dc.html`) [`_camp-registration.astro`, not published]
SiteHeader, CampRegForm, SiteFooter.

## Events (`Events.dc.html`) [`events.astro`, nav label "Birthday Parties"]
Pink category page. Hero with YouTube video and "Weekends fill fast". JumpNav with "Book a party". 01 Birthdays: Full Party feature card (Most popular, 60/30/30 minute timeline, $350, Book your party, Make an invitation), Mini Party dark card, "How booking works" five steps, two-column FAQ. 02 Groups: Group Events card with the tier table, Early Gym Access card.

## Invitation Card (`Invitation Card.dc.html`) [`make-invitation.astro`]
Controls column (396px) and live preview. Styles Portrait 440x616, Ticket 660x300, Square 470. Five accent swatches, Full colour or Ink-friendly. QR code, PNG download.

## Book Now (`BookNow.dc.html`) [`book.astro`]
Hero "Pick what you want to book." JumpNav by group. Groups of BookingCards: Private Lessons, Birthday Parties, Camps, Groups & Teams, Early Gym Access, Passes & Memberships. Dark "Not sure which to pick?" strip.

## Store (`Store.dc.html`) [`store.astro`]
Hero "Passes & Memberships." JumpNav (Open Gym, Classes, Athletic, Gift Cards). SectionHeader per category and BookingCards; gift card band; footnote.

## Pricing (`Pricing.dc.html`) [`pricing.astro`]
Hero "One price list. Buy before you arrive." The Members price list rendered natively (print sheet layout). CtaBand Store and Book. Gift card band.

## Schedule (`Schedule.dc.html`) [`schedule.astro`]
Hero "The full class schedule, always up to date." The Members print schedule sheet embedded, with age filters; on phones a day list.

## Get Started (`GetStarted.dc.html`) [`get-started.astro`]
Centered hero "Your first visit, in three steps." JumpNav by step. Step pattern: 56px ink tile with a yellow number, eyebrow "Step one", H2 32px. Step 1 waiver (ink button). Step 2 four BookingCards with status chips. Step 3 what to bring and how to arrive, arrival callout (15 minutes), first-visit discount callout. Faq.

## About (`About.dc.html`) [`about.astro`, nav label "Visit Us"]
Split hero "A home for the movement." with photo crossfade and address badge. JumpNav (Facility, Gallery, Visit). 01 four facility tiles. 02 gallery (11 photos). 03 Visit: contact card and dark hours card. Social band.

## Mobile Website (`Mobile Website.dc.html`) [the app chrome below 768px, `src/components/mobile/*`]
See mobile-shell.md. Screens: Home, Train, Book, Schedule, More, Pricing, Store, Get Started, About, Camps, Register, Events, Groups, Reviews.

## Pages on the live site with no page design
Open Gym (`open-gym.astro`), Groups (`groups.astro`), Reviews (`reviews.astro`), 404. The
design covers Groups and Reviews only as mobile sub screens and Open Gym as a Train section.

## Design docs (not pages)
- `Design Language.dc.html`: the hub (pages index, foundations, components 01 to 09).
- `Card - Design Language.dc.html`: card system rules (sections 00 to 09).
- `Booking Tag - Options.dc.html`, `Account Hero Card - Variants.dc.html`, `scraps/*`: explorations.
- `Mobile Readiness Audit.dc.html`, `Website Audit.dc.html`: audits from July 2026, mostly resolved.
- `Mobile App Mockup.dc.html`, `design_handoff_members_app/`: the Members app concept, not the website.
