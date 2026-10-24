# Colour roles

From `source/CLAUDE.md` and `Design Language.dc.html` (Foundations).

| Role | Colour | Used for | Never for |
|---|---|---|---|
| Action | Yellow `#ffd400` | Primary buttons, Book Now, active marks, numbers on ink | Identity of a category |
| Identity | Category colour (tokens) | Card bar, category tag, tinted pills, section accent, page glow on a category page | Primary buttons |
| Status | Green go `#1b6b2f` on `#e6f4ea` (plus info and neutral tones) | "No reservation", "Booking now", open now | Decoration |

Rules:
- One yellow action per view. A second action is ink (on light) or outline (on dark).
- Category pages (Athletic, Camps, Events, Private Lessons) tint glow, eyebrow and stats with
  their colour; their CTAs stay yellow.
- Category colours at their true hex, never darkened (design_handoff CHANGELOG).

Known breaks in the export itself: Private Lessons "Way 3" uses a red filled CTA; the
Mobile Website home "Events" tile uses red; several components darken colours for text.
See drift items T2 and G3.
