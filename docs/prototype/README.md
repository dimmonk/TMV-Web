---
artifact: https://claude.ai/artifact/1AAeL8NEAfR7gy1BvkTW44
---

# TMV-Web living prototype

A clickable copy of TMV-Web with invented data. It runs inside the app's real stylesheets (symlinks into `dist/`, so run `npm run build` first),
so what the owner clicks through looks like the app as shipped, plus only what is being proposed. **Design and feature decisions are
built and approved here first; the approved prototype is the spec for the real build.** Skill: `.claude/skills/prototype`.

```bash
node docs/prototype/serve.mjs 5631      # http://127.0.0.1:5631/ (also: npm run proto); /phone.html is the 390px phone view
node docs/prototype/check-prototype.mjs # stylesheets match the app, symlinks resolve, no data layer or network reachable
node docs/prototype/flatten-page.mjs    # one self-contained dist/prototype.html, for the Artifact tool
```

`artifact:` in this file's frontmatter is the published link. Republish to that same link on every change (pass it as the Artifact
tool's `url`); the first publish writes the returned link here.

## Layout

- `index.html` the Train page's stylesheets (`dist/train/index.html`, in order), then `proto/proto.css`, then the Train page's real chrome.
- `_astro/`, `fonts/`, `assets/` symlinks into `dist/`. Never copy a live rule into `proto/`. `proto/img/` holds stills cut from the class clips (the flat file inlines them; the clips themselves are too big for it).
- `proto/registry.js` the screens, in nav order; `proto/pages/*.js` one page module per screen; `proto/app.js` the router;
  `proto/router.js` the pure hash parser; `proto/store.js` the immutable in-memory state with `reset()`; `proto/data.js` the sample data.
- `serve.mjs`, `phone.html`, `check-prototype.mjs`, `flatten-page.mjs` the tools above.

## Rules

1. **Live look.** Markup and class names are the app's, exactly. Where the app has a pure builder, import it from `js/` instead of redrawing it.
2. **No data layer, no network.** Sample data only, in `proto/data.js`. `check-prototype.mjs` fails on any import of Firebase or any
   `fetch`, in `proto/` or in an app module the pages reach.
3. **Mobile first.** Design the phone layout (390px, `phone.html`) first, then tablet, then desktop.
4. **A UI change to a built screen updates its page here in the same commit.** An approved but unbuilt design stays, flagged in its
   page's header comment.
