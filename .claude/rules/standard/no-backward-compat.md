# No Backward Compatibility Shims

When refactoring, break cleanly: delete the old API and rewrite every call site, however many (use
grep plus a script for 100+). Never propose optional migrations, gradual rollouts with shims, legacy
wrappers, "deprecated" re-exports, `_unused` renames or `// removed` comments. If something is unused,
delete it. Verification is a grep for the old name returning zero matches.

Why: parallel APIs drift forever; the one-time rewrite is cheap. Precedent: 472 `showToast` call sites
rewritten to `notify*` in one commit (TMV Members, Apr 2026).
