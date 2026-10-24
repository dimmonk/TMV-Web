# OfferingCard

The intro tile that introduces an area of the gym (Home, Camps tiles, the birthday tiles). It flips: the front says what it is, the back carries a short points list.

- Front: `card`, `radius-tile`, `line` border; media 16:10 on `media` (video, image, or the striped Photo needed placeholder); category tag top left; a 30px flip button top right; title Archivo 800 22px; `body-sm` description; footer Tap for full details and Open with a category arrow.
- Back: eyebrow in the category colour plus Back; headline Archivo 800 20px; points with 30px icon tiles (`radius-sm`, category at 13%); an Explore link.
- Flip: perspective 1600px, .6s cubic-bezier(.2,.75,.25,1), `aria-pressed` on the card; a link inside never flips it.

Rules: one price line at most, no pills, no booking tag; a tile that needs those is a BookingCard. Live stacks both faces in one grid cell so the card grows to its taller face.
