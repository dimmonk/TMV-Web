# OfferingCard (intro tile)

The flip tile that introduces an area of the gym (Home "Three ways to get moving", Camps
tiles, Events birthday tiles). Source: `source/OfferingCard.dc.html`.
Live: `src/components/OfferingCard.astro`.

## Front
White, radius 18, border `#ebe9e4`. Media 16:10 on `#eceae4` (video, image, or the striped
"Photo needed" placeholder). Category tag top left (category fill, white, 700 10px .08em).
Flip icon (30px circle) top right. Title Archivo 800 22px, description 13px `#5b5853`.
Footer: "Tap for full details" and "Open" with a category arrow.

## Back
Eyebrow in the category colour plus "Back"; headline 800 20px; points list, each with a
30px icon tile (radius 9, category 13%); "Explore {title}" link.

## Motion
Height 432px, perspective 1600, `.6s cubic-bezier(.2,.75,.25,1)`.

## Props
`title`, `tag`, `desc`, `color`, `href`, `image`, `placeholder`, `back`, `points`, `height`,
`mediaRatio`, `titleSize`, `descSize`, `backTitleSize`, `padFront`, `padBack`.

## Rules (Card - Design Language section 07)
One price line at most, no pills, no booking tag. If a tile needs those, use a BookingCard.

## Live differences
Live stacks both faces in one grid cell so the card grows to its tallest face; the height
is a minimum. That fixes overlap the fixed height caused. No item.
