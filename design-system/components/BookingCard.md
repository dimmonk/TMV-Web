# BookingCard

The card for booking or buying something with a price up front (Book Now, Store, Get
Started step 2, mobile Book). Source: `source/BookingCard.dc.html`.
Live: `src/components/BookingCard.astro`.

## Parts
- The whole card is one link. White, radius 16, border `#ebe9e4`, card rest shadow; 4px category bar.
- Body padding 20px 20px 22px, gap 13.
- Chip row: booking-method tag (solid, radius 6, 800 10.5px .07em, category fill, ink or white text by luminance > 150); duration chip (radius 999, category 13% fill, 700 10px .09em, clock icon); flag (category fill); status chip (neutral, go, info tones).
- Title Archivo 800 20px/1.12; description 13px/1.5 `#5b5853`.
- Pills: 600 12.5px, padding 5px 10px, tinted.
- Footer, top hairline `#efeee8`, padding-top 16: price Archivo 800 20px with note 600 12.5px `#9b9890`; action Archivo 800 13.5px uppercase with an arrow.
- Hover lifts 4px and tints the border with the category at 50%.

## Props
`color`, `duration`, `bookingTag`, `flag`, `status`, `statusTone` (neutral, go, info),
`title`, `description`, `pills`, `price`, `priceNote`, `priceKey`, `actionLabel`, `href`,
`target`, `onClick` (in-app navigation for the mobile design).

## Rules
No photo, no flip, no nested button. Price shown up front.

## Live differences
Live matches the layout and values. Live fills prices from the Members price list by key
(`<Priced>`), not `priceKey`. Text on light accents is darkened 62% in both (drift item T2).
