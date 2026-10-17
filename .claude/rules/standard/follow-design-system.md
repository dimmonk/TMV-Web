---
paths:
  - "**/*.{css,scss,html,astro,vue,svelte,jsx,tsx}"
---
# Follow the Established Design System

Every variant in a component family (buttons, cards, inputs, notification tiers) shares the same base
class: shape, size, padding, radius, alignment and type scale stay identical. Only fill, border, text
and icon color change between variants. A genuinely different shape is a new component family, not a
variant. Check by putting the variants side by side in the harness: they must read as siblings.

Why: a tertiary button became a circular icon with a stacked label, breaking a 3-tier system agreed
minutes earlier. TMV Members' 4 notification tiers differ only by border and dot color.
