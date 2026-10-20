---
name: prototype
description: Use for any design or feature decision in an app with a UI, and before ANY significant screen, mobile/tablet redesign, modal, notification or interactive change. Builds and keeps a living prototype in docs/prototype/ that runs on the app's real stylesheets with invented data, publishes it as an Artifact link the owner clicks through as if it were real, and treats the approved prototype as the spec for the real build. Also scaffolds the prototype in an app that has none. Not for small single-breakpoint tweaks or copy fixes.
origin: generalized from the TMV-Members admin prototype (docs/admin-redesign/prototype) and the old mobile-first prototype rule
---

> **Recommended model:** sonnet at high effort. (Skills run in the session model; switch with `/model` if needed.)

# Living prototype

The owner decides design and features by **clicking through a prototype that looks and behaves like the app**, not by reading a
description or looking at a drawing. The prototype lives in the app at `docs/prototype/`, runs inside the app's real stylesheets,
uses invented in-memory data, and is published as one Artifact link that is republished to the same link on every change.
**The approved prototype is the spec for the real build.**

An Artifact canvas, hand-written standalone HTML or a Figma-style mockup has none of the design system and drifts from it on sight.
Do not use one for a proposal: build the page in the prototype.

## The rule

Design and feature decisions are built **in the prototype first**, approved there, and only then built in the real app.

- **Build there first:** any new screen, any change to what a screen shows or how it behaves, any mobile/tablet redesign (always
  significant), any complex or iterative notification, modal or interactive flow, and any feature whose shape is not settled.
- **Skip it:** a one-breakpoint tweak, a padding or copy fix, a bug fix. Change the real app directly.
- **Approved means the owner clicked through the published link and said so.** Until then the real code is not written.
- **After approval the prototype is the spec.** Build the real screen to match it (same markup and class names, same states, same
  copy), and when the real screen later changes, change its prototype page in the same commit. A prototype that drifts from the
  app gets a design signed off that the app does not have.

## Mobile first (the rule that used to be its own skill)

Before touching the real app for a mobile or tablet redesign, the design is validated in the prototype, phone layout first:

1. Design the **phone layout (390px)** first, in `phone.html` (it frames the prototype in a real 390px iframe so the app's own media
   queries fire), then tablet (768px), then desktop.
2. Iterate on the prototype until the design is right, show the link, get approval.
3. Only then integrate into the real app, mechanically, because the prototype already uses the app's tokens and class names.

Why: the first Meticulous mobile redesign went straight into the real app's media queries and broke everywhere, with many patch
commits; the second used a standalone prototype and was approved in one round. The real app has too many constraints (other media
queries, existing components, deploy coupling) to iterate on during a design phase. Keep the prototype after integration: it is the
place for the next iteration.

## What exists, and how to use it

If `docs/prototype/` exists in the app, use it. If not, scaffold it once:

```bash
node .claude/skills/prototype/scaffold.mjs [--public public] [--name "App Name"]      # in the app's root
node ~/.claude/skills/prototype/scaffold.mjs --app <path>                              # from the global copy
```

It never overwrites (the folder must not exist) and never deletes. It creates:

| Path | What |
|---|---|
| `docs/prototype/serve.mjs` | Local read-only server, loopback only, follows the symlinks. `node docs/prototype/serve.mjs 5631` or `npm run proto`. |
| `docs/prototype/index.html` | Loads **every stylesheet `public/index.html` loads, in the same order**, then `proto/proto.css`; a placeholder frame to replace with the real shell. |
| `docs/prototype/css`, `img`, `js`, ... | **Symlinks into the app's public assets**, found from the stylesheet links and their `url()` references. Never copy a live rule into `proto/`. |
| `docs/prototype/proto/store.js`, `data.js` | Immutable in-memory state (deep-frozen; every update returns a new state), `reset()`, `subscribe()`, invented sample data with a fixed "today". |
| `docs/prototype/proto/registry.js` | One list of screens in nav order; one page module per screen under `proto/pages/`. |
| `docs/prototype/proto/app.js`, `router.js` | The hash router (`#page/param`), repaint on state change, `data-nav` / `data-act` / form actions. |
| `docs/prototype/proto/pages/example.js` | One working example page showing the contract. Rewrite it into the first real screen. |
| `docs/prototype/phone.html` | The 390px / 768px device frame (mobile first). |
| `docs/prototype/check-prototype.mjs` | Fails if the stylesheets drifted from the app, a symlink broke, or any page reaches a data layer or the network. |
| `docs/prototype/flatten-page.mjs` | Bundles a page into one self-contained HTML file for the Artifact tool (needs `npm i -D esbuild`). |
| `docs/prototype/README.md` | Frontmatter `artifact:` holds the published link. |

## Working in it

1. **Read the live builder first.** For each screen, find the app's own markup builder (`public/js/...`) and write the same elements
   with the same class names. Where the builder is a pure string function, import it from `js/` instead of copying it. A rule in
   `proto/proto.css` is allowed only for what the app does not have (the review frame, a proposed design not yet built).
2. **Replace the placeholder frame** with the app's real shell markup (title bar, sidebar, bottom nav) from `public/index.html`, class
   names unchanged. Keep `<main id="proto-main">` as the mount point and put `data-nav="<page id>"` on the controls that open a page.
3. **One page module per screen**, registered in `proto/registry.js` (`title`, `render(state, params, ctx)`, optional `actions`,
   `notes`). Put design notes and open questions in the page's `notes` so the owner sees them next to the screen.
4. **Sample data is invented and never touches production.** No real names, no copied records (the repo may be public and the
   prototype is published). No Firebase, no `fetch`, no import of an app module that reaches a data layer: `check-prototype.mjs`
   enforces it. Change state only through `update()` with new objects; never mutate.
5. **Make it feel real:** every control does what the real one will do (validation, empty and error states, Discard returning to the
   saved copy, role or permission variants), against the sample data.

## Publishing it (every change)

1. `node docs/prototype/check-prototype.mjs` must pass.
2. `node docs/prototype/flatten-page.mjs` writes `docs/prototype/dist/prototype.html` (gitignored), one self-contained file. It is
   the `index.html` page, so the owner sees the phone layout by opening the link on a phone (the app's own media queries fire);
   `phone.html` is for local review only.
3. Publish the flat file with the **Artifact tool**. If `docs/prototype/README.md` already has `artifact: <url>` in its frontmatter,
   pass that as the tool's `url` so the **same link updates**; otherwise publish fresh and write the returned link into the
   frontmatter. Republish after every change that lands (changes that land together go out in one republish).
4. Give the owner the link once, at the first publish. After that the link is where the design lives. Tell the owner what changed
   and what you need decided, in a few words.

## Keeping it the spec

- A live UI change adds or edits its prototype page in the **same commit** (the template's `docs/conventions.md` doc-currency
  table already says so).
- Approved but unbuilt designs stay in the prototype, built on the live look; say so in the page's header comment.
- `check-prototype.mjs` joins the project's pre-commit habits; run it after any stylesheet change in the app.
- Not part of the app: `docs/prototype/` is excluded from lint and typecheck (the template's `eslint.config.js` ignores it).
