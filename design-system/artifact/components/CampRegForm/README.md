# CampRegForm

In-house camp registration: one family, several kids, weeks or days, late pickup, one payment. Not published on the site yet. Accent `cat-camps`.

1. Kid cards (accordion): `radius-card`, 1.5px border, `cat-camps` when open, a 36px initial tile.
2. Camp type chips: Weekly, P.A. Day, Private Day; selected has a `cat-camps` border, `warn-fill` and a check.
3. Week calendar: 4-day weeks tagged `warn-text`; day cells 40px `radius-sm` (on is a camps fill, holiday `tile`).
4. Late pickup row on `#fbf9f4`.
5. Waiver box: done `go-text` on `#f0f8f2`, to do `warn-text` on `warn-fill`.
6. Summary card `radius-tile`, `ink` header, total Archivo 900 26px in `cat-camps`, HST included, the yellow Register and pay button, Secure checkout by Square.
7. Confirmation: receipt, what to know before camp, Register another camper.

At 920px of its own width the summary becomes a sticky dark bar; at 560px week rows wrap. Camp dates come from the Members camp catalogue and prices from the price list, never typed (drift D2).
