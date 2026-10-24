# SiteHeader

Desktop site chrome: the sticky dark bar at the top of every desktop page.
Source: `source/SiteHeader.dc.html`. Live: `src/components/SiteHeader.astro`.

## Parts
- Bar: sticky, `#211f1b`, height 66px, max width 1200px, padding 0 20px, bottom border `rgba(255,255,255,.08)`.
- Brand: logo 40px plus wordmark "THE MONKEY VAULT", Archivo 900 18px, .02em, yellow, uppercase. The wordmark hides below 460px.
- Nav links: system 600 13.5px, `rgba(255,255,255,.65)`; active is 700 white with a 3px yellow bar under the bar (bottom -23px).
- "New here?" ghost button: flag icon, Archivo 700 12.5px uppercase, 1px `rgba(255,255,255,.2)` border, radius 8, goes to Get Started.
- Book Now: the one yellow button. Archivo 800 13px uppercase, padding 11px 15px, radius 9.
- Menu button at 820px and below (42px square, radius 9), opens a drop-down list (Archivo 600 16px rows) ending in "New here? Start here".

## Props
`active` (nav key), `brand` (default `#ffd400`).

## Nav in the design
Train, Camps, Events, Pricing, Store, About. No Schedule link.

## Rules
- Exactly one yellow button in the bar.
- The active page gets the underline; nothing else is coloured.

## Live differences
Nav labels and count, menu breakpoint, and when "New here?" hides. See drift items H1 to H3.
