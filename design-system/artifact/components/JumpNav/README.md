# JumpNav

Sticky in-page navigation under the header.

- Sticks at `header-h`, z 40, paper at 92% with an 8px blur, bottom border `line-pill`.
- Label Jump to: Archivo 700 11px .13em in `muted-3`.
- Links 700 12.5px, padding 7px 13px, `radius-pill`; idle `text-3`, active white with a `#e0c64a` border and `ink` text.
- At most two actions on the right (Archivo 700 13px `ink`): a primary only on single-conversion pages, otherwise Price List then Full Schedule.
- Back to top: a fixed 46px `ink` circle with a yellow arrow after 700px of scroll.
- Sections set `scroll-margin-top` to `scroll-margin`.

Props: `label`, `items`, `active`, `top`, `maxWidth`, `spy`, `actions`.
