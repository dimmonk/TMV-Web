# Components

Every shared component in the export. Each page gives purpose, parts, exact values, props,
rules and the live differences. Source files are in [`../source/`](../source/).

| Component | Purpose | Live counterpart |
|---|---|---|
| [SiteHeader](SiteHeader.md) | Desktop top bar | `SiteHeader.astro` |
| [SiteFooter](SiteFooter.md) | Desktop footer | `SiteFooter.astro` |
| [SiteHero](SiteHero.md) | Dark page hero | `.pagehero` in `global.css` and page heroes |
| [SectionHeader](SectionHeader.md) | Numbered section heading | `SectionHeader.astro` |
| [JumpNav](JumpNav.md) | Sticky in-page nav | `JumpNav.astro` |
| [Pathway](Pathway.md) | Basics then Athletic path | not used |
| [Pill](Pill.md) | Short facts | `Pill.astro` |
| [ClassCard](ClassCard.md) | Sells a class, flips | `ClassCard.astro` (no flip) |
| [BookingCard](BookingCard.md) | Books or buys, price up front | `BookingCard.astro` |
| [OfferingCard](OfferingCard.md) | Intro flip tile | `OfferingCard.astro` |
| [CtaBand](CtaBand.md) | Closing link cards | `CtaBand.astro` |
| [Reviews](Reviews.md) | Google reviews | `Reviews.astro` |
| [Faq](Faq.md) | Accordion FAQ | `Faq.astro` |
| [CampRegForm](CampRegForm.md) | Camp registration | `_camp-registration.astro` |

Which card to use (Card - Design Language, section 00): a card that **sells** is a
ClassCard, a card that **books** is a BookingCard, a card that **introduces** is an
OfferingCard. The test: does the card need to explain how you book? If yes, it is not an
intro tile.

The mobile app shell (app bar, page hero, bottom tabs, More sheet) is in
[../patterns/mobile-shell.md](../patterns/mobile-shell.md).
