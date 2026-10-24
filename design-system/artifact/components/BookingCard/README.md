# BookingCard

The card for booking or buying something with the price up front (Book, Store, Get Started step two, the phone Book tab). The whole card is one link: no photo, no flip, no nested button.

- `card`, `radius-card`, `line` border, `shadow-card`, a 4px category bar.
- Body padding 20px 20px 22px, gap 13px.
- Chip row: the booking tag, a duration chip, an optional flag and a status chip.
- `card-title` then `body-sm` in `text-3`, then tinted pills.
- Footer above a hairline: the price (`price`, with a `muted-3` note) and a `tmv-link` action.
- Hover lifts 4px and tints the border with the category at 50%.

Props: `color`, `duration`, `bookingTag`, `flag`, `status`, `statusTone` (neutral, go, info), `title`, `description`, `pills`, `price`, `priceNote`, `actionLabel`, `href`. The price comes from the Members price list by key; the preview shows a placeholder.
