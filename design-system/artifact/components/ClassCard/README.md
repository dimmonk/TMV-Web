# ClassCard

The card that sells a class. Use it when the card must explain a class and how it is booked; an intro tile is an OfferingCard, a priced booking is a BookingCard.

Front: media 16:11 on `ink` (mp4, autoplay muted loop, played when on screen), category tag top left (`tmv-cattag`), a 4px category bar, the booking tag, `card-title`, `body-sm` description, a spec sheet, and a `tmv-link` action above a `line-soft` hairline. `card` fill, `radius-card`, `line` border; hover lifts 5px and zooms the media 1.05.

Spec sheet order is locked: **Level, Ages, Schedule, Booking, Price**. Level words: All levels, Levels 1 to 2, Prerequisite required. Booking words: Drop-in, no reservation needed; By appointment, reserve online; Membership, join any time; Direct with the coach.

Live puts the spec sheet on the front with no flip and no pills (drift K1: a parent on a phone sees it without discovering a hidden tap). The export's version flips, with pills on the front and the spec sheet on the back. Prices are named by their Members price-list key, never typed.

The consumer provides the category, media, words and link.
