# Git Workflow

Commit messages: `<type>: <description>` plus an optional body; types are feat, fix, refactor, docs,
test, chore, perf, ci. One logical change per commit; a deploy gets its own `chore: release N` commit.

For a PR: read the whole commit history (`git diff <base>...HEAD`), write a full summary with a test
plan, and push with `-u` on a new branch.
