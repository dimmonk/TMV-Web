# This project's shared Claude files are generated

The files listed in `.claude/standard.lock.json` (rules under `.claude/rules/standard/`, the shared
skills, agents, `.claude/hooks/standard/`, `.claude/standard/` and the audit workflow) are copies from
github.com/dimmonk/claude-config, made by its `standard/sync.mjs`. Never edit them here:
`npm run test:standard` fails on any hand-edited copy. Change the source in claude-config, commit and
push it, then re-sync this project (`node ~/.claude/standard/sync.mjs <project>`) and commit the result.
Project-specific skills, agents and rules sit beside them and are edited here as usual.
