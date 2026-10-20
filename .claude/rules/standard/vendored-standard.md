# This project's shared Claude files are generated

The files listed in `.claude/standard.lock.json` (rules under `.claude/rules/standard/`, the shared
skills, agents, `.claude/hooks/standard/`, `.claude/standard/` including the deploy core in
`.claude/standard/deploy/`, the checks script `.claude/standard/checks.mjs` and its GitHub workflow
`.github/workflows/checks.yml`, and the audit workflow) are copies from
github.com/dimmonk/claude-config, made by its `standard/sync.mjs`. Never edit them here:
`npm run test:standard` fails on any hand-edited copy. Change the source in claude-config, commit and
push it, then re-sync this project (`node ~/.claude/standard/sync.mjs <project>`) and commit the result.
Project-specific skills, agents and rules sit beside them and are edited here as usual.

The deploy core (`.claude/standard/deploy/`, run as `npm run deploy -- --only <targets>`) is configured
by the project's own `deploy.config.mjs` and the hook modules it imports; those are never vendored and
are edited here. `firebase.json`'s `predeploy` entries, `scripts.deploy` and `scripts.deploy-check` are written by the
sync too (the deploy's temporary checkout lives in `~/Library/Caches/claude-deploy`, never in the project): leave them as they are (`sync.mjs --check`
reports a hand revert).

Code ships through the same fast checks everywhere: `.claude/standard/checks.mjs` runs the project's
`typecheck`, `lint` and `test:unit` scripts (whichever exist). `npm run deploy` runs them on the shipped
tree and refuses on a failure; `.github/workflows/checks.yml` runs them on a pull request into main, rationed
(no drafts, no docs-only changes, a new push cancels the old run, one 10-minute job) so the free Actions
minutes last. Make a check pass rather than removing the script.
