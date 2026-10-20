# Handoff — open threads

Written 2026-10-20. Start here in a new thread; `CLAUDE.md` covers how the site
is built and deployed, this file covers what is unfinished.

## 1. Specialized classes card — design not signed off

Eleven specialized classes currently render as `src/components/ClassTabs.astro`:
a vertical list on the left, a detail pane on the right. **It is live and it is
wrong.** The detail pane repeats the identical price, booking method and CTA
eleven times, which leaves ~140px of bare white beside the clip that no amount
of re-cropping fixes.

Design canvas with the options:
https://claude.ai/artifact/SPg7EKdGNXvio5vXqQ5BVm

- **A–D** (rejected) — four ways to fill the hole, all keeping the detail pane.
- **F** — one table. Price/booking stated once in the header; each row carries
  only what differs (name, what it is, who it's for, when). No media, so no hole.
- **G** — the same table once clips exist: a 76px thumb column appears, row
  height 46→61, nothing else moves. Rows without footage show an empty plate,
  so clips can ship one class at a time.

**Needs a decision between F and G's rollout**, plus: F drops the per-class
`backBody` paragraph from `src/data/classes.ts`. Decide whether that copy moves
to the schedule page, becomes an expanding row, or is cut.

If F wins, `ClassTabs.astro` and `src/lib/class-tabs.ts` are replaced, not patched.

## 2. Square links still on the storefront domain

`links.booking` in `src/data/site.ts` was moved to `book.squareup.com`. Still on
`the-monkey-vault-inc.square.site`:

- `links.store`
- `links.summerCamp` / `winterCamp` / `marchCamp` / `paDayCamp`
- `links.athleticMembership`

That host currently 302s back to `www.themonkeyvault.com`. **If DNS moves to
Firebase before Square is disconnected, `/product/**` loops infinitely.** Each
needs its real Square destination from the owner.

## 3. Stale booking link in the published config

The live homepage serves a booking URL under seller id `cu536s65ivw0s1`,
alongside the correct `n4zdjvxlwo48zk`. That one comes from the admin-edited
config (TMV-Members → Settings → Booking & buy links), not from this repo.
Needs checking and probably re-saving.

## 4. Go-live checklist — never produced

The owner asked for a single ordered checklist covering their five steps plus
the engineering ones, so the cutover can be done in one sitting:

1. Finalize the specialized-classes UI (item 1 above).
2. Full pass over the site.
3. Confirm only the top layer ships — Square keeps bookings and payments.
4. Re-state how the domain split was decided.
5. Subdomain cutover: `training.` and `members.` as subdomains, waiver as a
   `/waiver` path (per-origin auth state forces that split).

Owner-only actions that belong in it: GCP Maps key referrer allowlist
(`themonkeyvault.com/*`, `themonkeyvault.web.app/*`, or address autocomplete
fails with `RefererNotAllowedMapError`), disconnecting Square **before** DNS
moves, DreamHost DNS + SPF/DKIM, updating Square/Google/social profile URLs,
and auditing printed QR codes.

Redirects for the old URLs are already deployed from TMV-Members
(`firebase.json`, `hosting:web`) and pinned by `tests/unit/web-redirect-map.test.js`.
