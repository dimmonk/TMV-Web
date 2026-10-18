# This project's shared Claude files are generated

The files listed in `.claude/standard.lock.json` (rules under `.claude/rules/standard/`, the shared
skills, agents, `.claude/hooks/standard/`, `.claude/standard/` including the deploy core in
`.claude/standard/deploy/`, and the audit workflow) are copies from
github.com/dimmonk/claude-config, made by its `standard/sync.mjs`. Never edit them here:
`npm run test:standard` fails on any hand-edited copy. Change the source in claude-config, commit and
push it, then re-sync this project (`node ~/.claude/standard/sync.mjs <project>`) and commit the result.
Project-specific skills, agents and rules sit beside them and are edited here as usual.

The deploy core (`.claude/standard/deploy/`, run as `npm run deploy -- --only <targets>`) is configured
by the project's own `deploy.config.mjs` and the hook modules it imports; those are never vendored and
are edited here. `firebase.json`'s `predeploy` entries, `scripts.deploy`, `scripts.deploy-check` and the
`.deploy-worktree/` ignore line are written by the sync too: leave them as they are (`sync.mjs --check`
reports a hand revert).
