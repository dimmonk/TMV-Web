# Button

One button family, Archivo 800 uppercase at .03em; the variants differ by fill only. Yellow means action, so a view has exactly one `tmv-btn-primary`.

| Variant | Class | Use |
|---|---|---|
| Primary | `tmv-btn tmv-btn-primary` | The one main action of a view (Book a session, Register). `yellow` fill, `ink` text, `radius-btn`, padding 14px 22px. |
| Hero | add `tmv-btn-hero` | In page heroes: 15px, padding 16px 26px, `radius-btn-lg`. |
| Dark | `tmv-btn tmv-btn-dark` | A second action on paper or card, and card actions (Reserve, Book with coach). |
| Ghost | `tmv-btn tmv-btn-ghost` | Tertiary on light, 1.5px `#ddd9d0` border. |
| Ghost on ink | `tmv-btn tmv-btn-ghost-dark` | The second action in a dark hero, 1.5px white at 25%. |
| Text link | `tmv-link` | Card actions: 13.5px uppercase with an arrow in the category colour; the gap grows from 7 to 11px on hover. |
| Header Book Now | see SiteHeader | 13px, padding 11px 15px, `radius-sm`. |

Hover lifts buttons 1px. The consumer provides the label (verb first, uppercase by CSS) and the link.

Never: a second yellow button in one view, a category colour as a button fill (drift G3: Private Lessons Way 3 breaks this), a red button for anything but an error.
