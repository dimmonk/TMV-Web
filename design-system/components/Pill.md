# Pill

Short facts on cards and heroes ("Ages 5+", "Private room"). Source: `source/Pill.dc.html`.
Live: `src/components/Pill.astro`.

## Parts
System 600 12.5px, padding 7px 12px, radius 999, gap 6 to an optional icon (11px).

## Variants
| Variant | Text | Fill | Border | Icon |
|---|---|---|---|---|
| light | `#3a3833` | `#f3f2ee` | `#e6e4dd` | `#9b9890` |
| tinted | category colour | category 10% on white | category 24% | category |
| dark, no colour | white | `rgba(255,255,255,.09)` | `rgba(255,255,255,.16)` | white |
| dark, with colour | category 78% mixed with white | category 16% | category 36% | same as text |

## Props
`items` (`Label#icon | ...`), `variant`, `color`, `gap` (default 8).

## Rules (Card - Design Language, sections 03 and 04)
1 to 3 words, 2 or 3 per card (max 4), never a sentence, never repeats the booking tag or the price.
Vocabulary: age bands Parent & Child (3 to 6), Kids (7 to 12), Teens (13 to 17), Adults (18+),
Teens & Adults (13+), All ages; program ages Ages 9+ (Athletic), 5+ (Camps, Full Birthday),
8+ (Mini birthday); format 1-on-1, Your own group; level All levels, Levels 1 to 2; group size
Min 5 kids, 3 to 15 people, Min 10 people; duration 90 min, 2 hrs total; access Private room, All-day pass.

## Live differences
Drift item P1 (light fill, tinted text darkening, dark text, no icons).
