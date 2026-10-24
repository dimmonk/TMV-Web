# CampRegForm

In-house camp registration: one family, several kids, weeks or days, late pickup, one
payment. Source: `source/CampRegForm.dc.html`, page `source/Camp Registration.dc.html`,
spec `source/design_handoff_camp_registration/README.md` and `CHANGELOG.md`.
Live: `src/pages/_camp-registration.astro` (not linked yet), `src/lib/camp-reg-form.ts`, `src/styles/camp-reg-form.css`.

## Structure
Container queries on the form itself: at 920px one column with a sticky dark bar (total and
Register) instead of the side summary; at 560px week rows wrap and day cells stretch.

1. Hero (optional): dark, orange glow, H1 Archivo 900 `clamp(30px, 6vw, 44px)`.
2. Kid cards (accordion): radius 16, 1.5px border (orange when open), 36px initial tile.
3. Camp type chips: Weekly, P.A. Day, Private Day; selected has an orange border, `#fff7ef` fill and a check.
4. Week calendar: 9 summer weeks; 4-day weeks tagged `#a2601f` on `#fff2e2`; day cells 40px radius 9 (on = orange fill, holiday `#f3f2ee`).
5. Late pickup row on `#fbf9f4` with ink and yellow pills.
6. Waiver box, two steps: ok `#f0f8f2`/`#cfe6d6` with `#1b6b2f`; to do `#fff7ef`/`#f0dcc2` with `#a2601f`.
7. Summary card radius 18, ink header, total Archivo 900 26px orange, "HST included", yellow "Register & pay" button radius 12, "Secure checkout by Square", cancellation copy.
8. Confirmation: receipt, "What to know before camp", Download PDF, "Register another camper".

Inputs `.reg-in`: fill `#f6f5f1`, border `#e3e0d8`, radius 10; focus orange border and white fill.

## Props
`accent` (`#e27902`), `dayCampLatePickup`, `showHero`.

## Data in the design
Weeks, P.A. dates and fallback prices are typed. Live rule: camp dates come from the
Members camp catalogue and prices from the Members price list. Drift item D2.
