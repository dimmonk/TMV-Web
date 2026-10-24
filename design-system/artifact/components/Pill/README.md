# Pill

Short facts on cards and heroes: 1 to 3 words, 2 or 3 per card (4 at most), never a sentence, never a repeat of the booking tag or the price. System sans 600 12.5px, padding 7px 12px, `radius-pill`.

| Variant | Class | Look |
|---|---|---|
| Light | `tmv-pill` | `text-2` on `tile`, `line-pill` border. |
| Tinted | `tmv-pill tmv-pill-tint` + `--accent` | Category at 10% fill, 24% border, text darkened so it reads (drift P1, T2). |
| On ink | `tmv-pill tmv-pill-dark` | White on white 9%. |
| On ink, category | `tmv-pill tmv-pill-dark-cat` + `--accent` | Category 16% fill, text 78% category mixed with white. |

Vocabulary from the card rules: age bands Parent & Child (3 to 6), Kids (7 to 12), Teens (13 to 17), Adults (18+), Teens & Adults (13+), All ages; program ages Ages 9+ (Athletic), Ages 5+ (Camps, Full Birthday), Ages 8+ (Mini birthday); format 1-on-1, Your own group; level All levels, Levels 1 to 2; size Min 5 kids, 3 to 15 people; duration 90 min, 2 hrs total; access Private room, All-day pass.

The consumer provides the words and, for tinted variants, `--accent` set to a `cat-*` token.
