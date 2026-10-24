# ClassCard

The card that sells a class (Train page, mobile Train). Source: `source/ClassCard.dc.html`.
Live: `src/components/ClassCard.astro`.

## Front (vertical layout)
1. Media 16:11 on ink: video (autoplay, muted, loop) or image.
2. Category tag top left: radius 999, Archivo 700 11px .08em, category fill (Athletic text `#2a1e00`).
3. Optional media badge under it: dark `rgba(28,25,23,.62)` blur, `#ffd86b` text, lock icon ("Serious students only").
4. Flip button top right: 30px circle.
5. 4px category bar on top of the card.
6. Booking-method tag (see patterns/booking-tag.md), solid by default, or on the image.
7. Title Archivo 800 21px; description 13px `#5b5853`.
8. Pills, tinted with the category (Athletic text darkened 70%).
9. Optional meta lines (icon and text).
10. Action link: Archivo 800 14px uppercase, top hairline `#f0efea`, arrow in the category colour.

White, radius 16, border `#ebe9e4`. Hover lifts 5px, media zooms 1.05.

## Back (flip)
Padding 22px. Eyebrow (class · category, category colour, 700 11px) and "Flip back";
hook headline 800 20px; body 13px `#4a4843`; spec sheet in a two-column grid (label Archivo
700 10px .07em in the category colour, value 600 13px `#3a3833`); the same action.
Locked spec order: **Level, Ages, Schedule, Booking, Price**. Level words: All levels /
Levels 1 to 2 / Prerequisite required. Booking words: "Drop-in · no reservation needed",
"By appointment · reserve online", "Membership · join any time", "Direct with the coach".
No back given: the whole card is one link.

## Horizontal layout
160px media column with an eyebrow chip; same parts.

## Props
`category`, `color`, `tag`, `title`, `description`, `pills`, `bookingTag`, `bookingTagStyle`
(solid, onImage), `meta`, `mediaBadge`, `image`, `actionLabel`, `href`, `layout`, `eyebrow`,
`backEyebrow`, `backHeadline`, `backBody`, `specs`, `backActionLabel`.

## Live differences
Live has no flip and no pills: the specs sit on the front. Drift item K1.
