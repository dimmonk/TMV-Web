# Tokens

Values as the export defines them. "Live" says what `src/styles/global.css` and
`src/data/site.ts` on `main` (release 37) use, where it differs. Differences are numbered
in [../drift-list.md](../drift-list.md).

## Core palette

| Token | Value | Use | Source |
|---|---|---|---|
| Ink | `#211f1b` | Header, heroes, dark cards, body text, dark buttons | every page; `Design Language.dc.html` Foundations |
| Yellow (brand) | `#ffd400` | The action colour: primary buttons, active marks, numbers on ink | same |
| Paper | `#f5f4f1` | Page background | same |
| Footer ink | `#1a1815` | Footer only (one step darker than Ink) | `SiteFooter.dc.html` (live: `--ink-2`, same value) |
| Card | `#ffffff` | Cards | all cards |

Live matches all five.

## Neutrals (light surfaces)

| Value | Role in the export |
|---|---|
| `#3a3833` | Strong secondary text, light pill text |
| `#5b5853` | Card description text |
| `#6a6760` | Muted text, section descriptions |
| `#8a877f` | Labels, input labels |
| `#9b9890` | Notes, "Jump to" label, review context |
| `#b0aca3` | Section eyebrow (faint) |
| `#ebe9e4` | Card border |
| `#f0efea`, `#efeee8` | Hairlines inside cards |
| `#e6e4dd`, `#e7e5df` | Pill border, JumpNav bottom border |
| `#f3f2ee` | Neutral tile and chip fill |
| `#eceae4` | Media placeholder fill |

Live has the same set as named tokens (`--text-2` `#3a3833`, `--text-3` `#5b5853`,
`--muted` `#6a6760`, `--muted-2` `#8a877f`, `--muted-3` `#9b9890`, `--faint` `#b0aca3`,
`--line` `#ebe9e4`, `--line-soft` `#f0efea`).

Camp registration adds its own set (from `design_handoff_camp_registration/README.md`):
borders `#e3e0d8 #e8e5dd #ece9e2 #e0dcd3`, tints `#fbf9f4 #faf9f5 #fff7ef`.

Two design docs use a different, cooler neutral set: `Card - Design Language.dc.html`,
`Booking Tag - Options.dc.html` and the two audit docs (`#17171b` ink, `#f6f6f7` page,
`#e9e9ec` border, `#55555c` and `#9a9aa2` text, `#ffd200` yellow). That set appears in no
page and no component. See drift item T3.

## Category colours ("colour by what you are booking")

The single source is `source/categories.js` (`catColor(key)`, unknown keys fall back to
`#6e6e6e`).

| Key | Name | Hex | Note in the source |
|---|---|---|---|
| `classes` | Classes | `#2196f3` | All group classes |
| `athletic` | Athletic | `#ffb82a` | Dark ink on its chips |
| `private` | Private | `#f44336` | 1-on-1 lessons |
| `partner` | Partner | `#0d9488` | Stick Fighting and Martial Arts, paid with the coach |
| `openGym` | Open Gym | `#2e9e4f` | Drop-in passes and early access |
| `camps` | Camps | `#e27902` | Weekly, P.A. Day and Private day camps |
| `parties` | Parties | `#e5399b` | Birthdays |
| `groups` | Groups | `#8c52ff` | Schools, corporate, teams |
| `introduction` | Introduction | `#6e6e6e` | First-timer intro lesson |

Live `cat` in `src/data/site.ts` and `--c-*` in `global.css` match all nine values (live key
`intro` for `introduction`, `openGym` for `openGym`).

Rule from `design_handoff/CHANGELOG.md`: category colours are used at their true hex, never
darkened. Several components still darken them; see drift item T2.

Older or stray category values found in the export:

| Where | Value | Instead of |
|---|---|---|
| `Card - Design Language.dc.html` section 08, `Mobile Website.dc.html` fallback, `The Monkey Vault Website/` | parties `#ffd400` | `#e5399b` |
| `Pathway.dc.html`, `scraps/Pathway - Variants.dc.html`, Reviews stars on mobile | `#e9a300` | athletic `#ffb82a` |
| `Schedule.dc.html` embed tokens, `_ds/` Members styles | open gym `#4caf50` | `#2e9e4f` |
| `Train.dc.html` dark bands | lifted green `#4caf6a`, lifted blue `#4aa3f0` | not in categories.js |
| `Athletic Program.dc.html` schedule rows | Explosive `#e23b3b`, Speed League `#ef5a4e` | not in categories.js |
| `Design Language.dc.html` page index | Schedule `#0ea5e9`, Reviews `#e9a300` | not in categories.js |
| `Invitation Card.dc.html` accent swatches | `#ffd400 #ffb02a #ff8fae #7fc8f0 #8fd6a8` | invitation palette, by design |

## Status colours

| Tone | Text | Fill | Use |
|---|---|---|---|
| go | `#1b6b2f` | `#e6f4ea` | "No reservation", "Booking now", success |
| info | `#3a4a8c` | `#eef0f6` | Informational chip |
| neutral | `#211f1b` | `#f3f2ee` | "Reservation required" |
| warn (camp reg) | `#a2601f` | `#fff7ef` | Waiver to do, 4-day week |
| error (camp reg) | `#b3261e` | `#fdecea` | Form errors |
| open now (mobile) | `#5fd07f` | `rgba(95,208,127,.13)` | Open-status pill on ink |
| New tag | `#1b6b2f` | `#e6f4ea`, border `#c7e4cf` | Schedule |
| Ending tag | `#8b1f1f` | `#fbeaea`, border `#ecc6c6` | Schedule |
| arrival callout | `#5c4d12` text, `#9a7b00` icon | `#fff7d6`, border `#f1e4a0` | Get Started |

Live BookingCard uses the same go, info and neutral values.

## Type

| Role | Family | Weight | Size | Tracking |
|---|---|---|---|---|
| Display (all headings, buttons, eyebrows, tags) | Archivo (Google Fonts) | 700 to 900 | | |
| Body | system sans: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` | 400 to 600 | | |
| Page H1 (split hero) | Archivo | 800 | `clamp(38px, 8.5vw, 58px)`, line 1.0 | -.022em |
| Page H1 (centered hero) | Archivo | 800 | `clamp(40px, 9vw, 68px)` | -.022em |
| Section H2 | Archivo | 800 | `clamp(23px, 5.4vw, 34px)`, line 1.06 | -.018em |
| Card title | Archivo | 800 | 20 to 22px | -.01em |
| Eyebrow | Archivo | 700 | 12px (11px in cards) | .14em, uppercase |
| Button | Archivo | 800 | 13 to 15px | .03em, uppercase |
| Body | system | 400 | 13 to 16px, line 1.5 to 1.6 | |
| Pill | system | 600 | 12.5px | |
| Mobile hero H2 | Archivo | 800 | 30px | -.02em |

The Members print schedule embed (`Schedule.dc.html`, `uploads/Schedule design/`) uses its
own families: Oswald, Roboto, Roboto Mono. That is the printed sheet's look, not the site's.

Icons: Bootstrap Icons 1.11.3 everywhere.

Live: `--font-display` and `--font-body` match. Live loads Archivo itself (async stylesheet)
and uses the same sizes in `SectionHeader` and `.pagehero-title` (`clamp(34px, 8vw, 54px)`).

## Radius

| Value | Used for |
|---|---|
| 999px | Pills, chips, tags on media, avatars |
| 6px | Booking-method tag (solid chip) |
| 8 to 9px | Header buttons, small tiles |
| 10 to 11px | Buttons, inputs |
| 12px | Icon tiles, callouts |
| 14px | FAQ items |
| 16px | Cards (BookingCard, ClassCard, CtaBand) |
| 18px | Intro tiles (OfferingCard), heroes media, review cards |
| 20 to 22px | Feature cards, mobile cards, page heroes on older mobile |
| 46px | The phone frame in the mobile mockups (frame only) |

Live: `--radius` 16px, `--radius-lg` 22px; components set the rest inline, same values.

## Shadows

| Name | Value |
|---|---|
| card rest | `0 1px 3px rgba(28,25,23,.05), 0 12px 30px -22px rgba(28,25,23,.4)` |
| card hover | `0 1px 3px rgba(28,25,23,.05), 0 22px 40px -24px rgba(28,25,23,.5)` |
| tile rest | `0 1px 3px rgba(28,25,23,.05), 0 16px 34px -30px rgba(28,25,23,.4)` |
| feature | `0 1px 3px rgba(28,25,23,.05), 0 22px 50px -36px rgba(28,25,23,.4)` |
| hero media | `0 30px 60px -25px rgba(0,0,0,.7)` |
| invitation preview | `0 2px 4px rgba(28,25,23,.06), 0 40px 70px -40px rgba(28,25,23,.55)` |

Live `--shadow-sm`, `--shadow-md` and `--shadow-lg` are the tile, feature and lifted values.

## Layout and spacing

- Content width 1200px, side padding 24px (header 20px). Live: `--container` 1200, `--gutter` 24.
- Section rhythm: 48px top and bottom on most sections, 72px on lead sections. Live:
  `.section` uses `clamp(48px, 8vw, 72px)`.
- Card grids: `repeat(auto-fit, minmax(300px to 330px, 1fr))`, gap 18 to 22px.
- JumpNav sits at `top: 66px` (the header height); sections use `scroll-margin-top: 120px`
  (Home 80px).

## Breakpoints

The export uses: 820 (header menu button, two-column heroes stack), 720 and 440 (footer
columns), 460 (wordmark hides), 768 (schedule list), and container queries at 920 and 560
inside the camp registration form.

Live canon is **640 / 768 / 1024 / 1280**, with the phone to desktop chrome handoff at 768,
written once in `global.css`. See drift item T1.

## Motion

- Card hover lift: `translateY(-4px)` to `-5px`, `.2s ease`; media zoom `scale(1.05)` to `1.06`.
- Flip: `.6s cubic-bezier(.2,.75,.25,1)`, perspective 1600px.
- Arrow nudge on hover: gap 7px to 11px.
- Open-status pulse: 1.6s, green ring to 6px.
- Smooth scroll for in-page anchors.

Live matches, and adds `prefers-reduced-motion` handling the export does not have.
