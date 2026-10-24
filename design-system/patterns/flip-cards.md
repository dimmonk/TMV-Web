# Flip cards

The Website Audit names flip cards as one of the site's strengths.

- Intro tiles (OfferingCard) and ClassCards flip on tap or click. A round flip icon sits top
  right; the back has a "Back" or "Flip back" control.
- Perspective 1600, `.6s cubic-bezier(.2,.75,.25,1)`, `aria-pressed` on the card.
- Clicking a link inside the card does not flip it.
- The front says what it is; the back carries detail (points list, or the spec sheet).
- Camps tiles in the design are hand-built flip tiles (height 486, radius 18), not OfferingCard.

Live: OfferingCard flips (grid-stacked faces). ClassCard does not flip (drift item K1).
Camps live uses its own cards.
