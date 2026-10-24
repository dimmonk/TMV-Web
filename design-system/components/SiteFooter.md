# SiteFooter

Desktop footer. Source: `source/SiteFooter.dc.html`. Live: `src/components/SiteFooter.astro`.

## Parts
- Background `#1a1815` (one step darker than Ink), text `rgba(255,255,255,.6)`.
- Grid 1.6fr 1fr 1fr 1fr, gap 40, padding 54px 24px 32px, max 1200. Two columns at 720px and below, one at 440px.
- Brand column: logo 38px, wordmark Archivo 900 16px yellow, blurb, social squares (36px, radius 9, `rgba(255,255,255,.08)`).
- Columns: **Explore** (Train, Camps, Events, Pricing, About), **Visit** (address, hours line, "New here? Get started" in yellow), **Book** (Book a session, Passes & Pricing, Online store, Gift cards).
- Column title Archivo 700 11px .12em `rgba(255,255,255,.4)`; links 500 13px, hover yellow.
- Legal bar: "(c) year The Monkey Vault Inc." and "Parkour & Movement Training Centre · Toronto".

## Props
`brand`.

## Data in the design
Address and "Open daily 11 AM to 10 PM" are typed; social links point to `#`.

## Live differences
Live reads address, hours and socials from the Members site config (hidden when empty) and
builds Explore from `src/data/explore.ts`. See drift item F1.
