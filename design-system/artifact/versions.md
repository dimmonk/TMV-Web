# Source and versions

The full export (292 of its 295 files, byte for byte) is backed up in the website repo at `design-system/source/`. Paths below are relative to that folder.


The export holds several copies of some files from different moments. Every copy was
compared byte for byte (and the standalone pages were decoded) to find the newest.

## Rule: the root of `source/` is the newest

For every file that exists in more than one place, the copy at the root of `source/` is the
newest. The other copies are older snapshots, kept for history.

| Folder in `source/` | What it is | Status |
|---|---|---|
| root `*.dc.html`, `categories.js`, `site-config.js(on)`, `tmv-data.js` | The design: components, pages, data | **Current** |
| `Design Language.dc.html`, `Card - Design Language.dc.html` | The system docs (hub and card rules) | Current |
| `CLAUDE.md`, `audit-notes.md` | The design's own rules and audit notes | Current |
| `assets/` | Logo, wordmark, class videos (mp4) and GIFs, camp photo, invitation photo | Current. The mp4s are identical to the live `public/assets/` files (`flips.mp4` is live `backflip.mp4`). The 8 class GIFs are not on the live site. |
| `design_handoff/` | A handoff from an earlier session: `CHANGELOG.md` (old to new snippets), `README.md`, `changed-files/` (6 pages), `mobile-app-data.json` | Changelog rules still apply; `changed-files/` are **older** than root (yellow instead of category heroes, scroll margin 132) |
| `design_handoff_camp_registration/` | Camp registration handoff: README spec, CHANGELOG, files | Same as root except `Mobile Website.dc.html`, which is older (rounded hero cards, phone frame) |
| `design_handoff_members_app/` | Members app handoff (README spec, design files) | Members app, not website. Its BookingCard, Mockup and support.js are older than root |
| `Mobile App Mockup.dc.html`, `Account Hero Card - Variants.dc.html`, `uploads/account-hero-card.html` | Members app concept | Members app, not website |
| `The Monkey Vault Website/` | An offline standalone build of 11 pages with components embedded | **Older** than root in every component and page (no menu button, fixed size titles, Home still had Open Gym, Visit Us and CTA band sections, parties yellow) |
| `_ds/` | The Members staff app design system (`base.css` tokens, the Members app stylesheet, canvas tools) | Members app, not website. Read: `base.css` in full; the 22,072-line `member-row/css/style.css` by section (first 2,240 lines in full); `_ds_bundle.js`, `cards.css` and `camp-checkin-style.css` identified, not read line by line |
| `public/` | Price list and print schedule modules and their embed pages | **Older** than live `src/lib/` (no web variant, no Groups section, Cloud Function URLs, `isCancelled` not `isEnding`). `color-utils.js` is identical |
| `scraps/` | Explorations: Athletic gate options, palette options A/B/C, Pathway variants, and check screenshots | History |
| `screenshots/` | 98 working screenshots from the design sessions | History; 1 viewed (`dl-index.png`), the rest inventoried |
| `uploads/` | Material given to the designer: saved old Square pages (Classes, Athletic, Summer Camp), the print schedule handoff, raw class videos, two Gemini birthday illustrations, screenshots of the old site, hand drawings | Reference. Two kid photos and the confidential audit PDF held back (see README) |
| `support.js`, `doc-page.js`, `image-slot.js`, `Canvas.dc.html`, `.image-slots.state.json`, `.thumbnail` | Claude Design tooling (runtime, printable doc shell, photo slot, blank canvas, tool state, project thumbnail) | Tooling. Never part of the site |

## How the repo's `design-reference/` differs from this export

`design-reference/` (in the repo since the redesign) is the export from the previous
handoff. Compared file by file:

**Same in both (16):** ClassCard, CtaBand, Faq, Invitation Card, JumpNav, OfferingCard,
Pathway, Pricing, Reviews, Schedule, SiteFooter, SiteHero, `image-slot.js`, `site-config.js`,
`site-config.json`, `tmv-data.js`, plus all 7 files under `public/`.

**Changed, the export is newer (17):**

| File | What changed in the export |
|---|---|
| `categories.js` | Parties `#ffd400` to `#e5399b` |
| `SiteHeader.dc.html` | Adds smooth scroll |
| `SectionHeader.dc.html` | Adds the `category` prop (category colour as accent) |
| `Pill.dc.html` | Dark pill can carry a category colour |
| `BookingCard.dc.html` | Adds `onClick` for in-app navigation |
| `Home.dc.html` | Events tile pink; Visit Us pointer and CTA band removed |
| `About.dc.html`, `GetStarted.dc.html`, `Private Lessons.dc.html` | Section scroll margin 132 to 120 only |
| `BookNow.dc.html` | Scroll margin 132 to 120; gift card note "delivered by email" to "by email or at the gym" |
| `Athletic Program.dc.html`, `Camps.dc.html`, `Events.dc.html` | Hero, eyebrow, stats and badges use the category colour instead of yellow; Camps allergy line "Please avoid packing nuts" |
| `Store.dc.html` | Scroll margin 132 to 120; closing CtaBand removed |
| `Train.dc.html` | Scroll margin 130 to 120; closing CtaBand removed; Open Gym dark pills carry the Open Gym colour |
| `Mobile Website.dc.html` | Camp registration sub screen, frameless phone, full-bleed heroes |
| `support.js` | Newer Claude Design runtime |

The 6 pages in `design_handoff/changed-files/` are byte-identical to the `design-reference/`
copies: that folder is the same older snapshot.

**Only in `design-reference/` (2):** `index.html` and `mobile.html`, launcher pages for the
old prototype.

**Only in the export:** both Design Language docs, Booking Tag Options, Account Hero Card,
Mobile App Mockup, Mobile Readiness Audit, Website Audit, Camp Registration and CampRegForm,
Canvas, `doc-page.js`, `CLAUDE.md`, `audit-notes.md`, and the folders `_ds/`, `assets/`,
`design_handoff*/`, `scraps/`, `screenshots/`, `uploads/`, `The Monkey Vault Website/`.

`design-reference/` is left untouched. Once this design system is approved it replaces
`design-reference/` as the reference (drift item X1).
