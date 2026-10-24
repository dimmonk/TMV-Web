# The Monkey Vault: website design system

This folder is the design system for the public website, built from the Claude Design
export "Website redesign from Square" (October 2026). It is a reference only. Nothing here
is built, shipped or imported by the site: `src/` does not read it and `tsconfig.json`
excludes it.

Status: **draft for approval.** Where the design and the live site differ, the differences
are listed in the artifact's drift list ([backup](artifact/drift-list.md)). Steven approves each item. Until an item is
approved, the live site stays as it is and the design file stays as it is.

## Where the design system lives

The design system is the Design System artifact **The Monkey Vault Website**:
https://claude.ai/artifact/4zocEa7e9SRcorriud1Zd8 (tokens, components with live previews,
logos, the brand book, the drift list, pages and source history).

This folder is only a backup:

| Folder | What it holds |
|---|---|
| [`artifact/`](artifact/README.md) | A copy of the artifact's files (`tokens.json`, `components/`, `README.md`, `drift-list.md`, `pages.md`, `versions.md`). The artifact is the original; edit it there. |
| [`source/`](source/) | Every file from the export, byte for byte, in its original layout (292 of the 295 files). |

## Three files were held back

The repo is public. These three export files are not committed; they stay in the project
files with the original zip (`Website redesign from Square.zip`):

- `uploads/HMDC-2023-Session1-LR-175.jpg` and `-176.jpg`: photos of identifiable children.
- `uploads/audit-monkey-valut.pdf`: a third party report marked Confidential (REACH, June 25 2026, score 52/100).

Nothing in the design uses them.

## How to open the design files

The `.dc.html` files are Claude Design components. They need `source/support.js` (the
Claude Design runtime) beside them and a local web server, because they fetch each other:

```bash
cd design-system/source && python3 -m http.server 8080
# then open http://localhost:8080/Design%20Language.dc.html
```

`Design Language.dc.html` is the hub: every page, the foundations and every component.

## Ground rules this design states (from `source/CLAUDE.md`)

1. Desktop is the source of truth. Mobile shows the same content, laid out for the phone.
2. Reuse the shared components; never fork a second copy of one.
3. Category colours come from one place (`categories.js` in the design, `cat` in
   `src/data/site.ts` on the site).
4. Three colour roles: yellow means action, the category colour means identity, green means status.
5. Archivo 700 to 900 for display, the system sans for body.
6. Less is more: every line of copy earns its place.

## Copy note

The export's copy uses em dashes in many places. Steven's rule is no em dashes in site
copy. The docs in this folder use none; the files in `source/` are kept verbatim, so their
em dashes stay until a copy item is approved (see the drift list, item C1).
