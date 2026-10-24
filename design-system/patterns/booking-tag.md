# Booking-method tag

Tells the visitor how a thing is booked, before they read anything else.

## Final form (Card - Design Language section 05; BookingCard; ClassCard)
Solid chip in the content area: radius 6, padding 6px 12px, Archivo 800 10.5px .07em
uppercase, category fill, white text (ink on light colours), with an icon.

| Words | Icon |
|---|---|
| Drop-in | `bi-door-open` |
| By appointment | `bi-calendar-check` |
| Membership | `bi-arrow-repeat` |
| Register | `bi-calendar-event` |
| Direct with coach | `bi-chat-dots` (partner classes) |

Use it when the cards in one group mix booking types. Skip it when every card books the same
way, and on intro tiles. The pill row drops anything that repeats the tag.

## Other versions in the export
- `Design Language.dc.html` shows a tinted version (radius 5, category 9% fill, 22% border, category text).
- `Booking Tag - Options.dc.html` explores five treatments (A solid, B ink badge, C label only, D on photo, E outlined, marked new). A is the one used in the components.
- ClassCard also supports an on-image dark version (`#ffd86b` text).

Three versions of one element: drift item K2.

Live: solid version in BookingCard and ClassCard.
