# Model & Token Policy (revised 2026-09-28)

Sonnet 5.5 is the default for everything; escalate on evidence, not stakes-by-vibes. Tiers live in one
place: each `~/.claude/agents/<role>.md` frontmatter (`model:` + `effort:`). In short: Sonnet low–medium
for retrieval and mechanical roles; Sonnet high for implementers and the main session; Sonnet xhigh for
finders and reviewers; Opus 5.5 for security review and a Sonnet role that failed twice; Fable 5 only for
audit-judge, architect and critical finders/reviewers (money, lifecycle, Square, auth, rating writes).
Workflows name a ROLE via `agentType`, never a model literal. Measurements behind these choices:
`~/.claude/docs/model-tier-evidence.md`.

Token rules:
1. Effort is the main dial: `high` default, `xhigh` only for recall-bound finding/review, `low` for
   retrieval. Never `max` on Sonnet. Set effort at session start, not mid-session.
2. State agent count and rough token cost before a workflow. Prefer one agent with a good prompt over
   many re-reading the same files; never start a second heavy session in parallel.
3. Verify panels only for findings that survive a cheap filter first.
4. Small prompts (paths + question), small structured returns (≤300 words). Long-running workflow agents
   write detail to a file and return a tiny index, act at least once a minute, and keep each command
   under 90 seconds.
5. Text tools before screenshots; at most 2 images per check.
6. Keep always-loaded context small: prune before adding; procedures go in skills, file-specific
   guidance in path-scoped rules.
7. Inline work that fails twice moves to Opus 5.5, and say so. Never start higher "to be safe".
8. Never retry a limit/quota error blindly; read its reset. Never throttle or stage work to protect
   quota: launch it whole and resume from cache after a limit.
9. Don't cap depth by fear: cut waste (re-reading, duplicates, screenshots, retries), not depth.
