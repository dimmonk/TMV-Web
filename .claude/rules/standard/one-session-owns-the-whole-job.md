# One Session Owns the Whole Job

Everything found while working a task is handled in that session: fixed, tested, committed, pushed and
deployed. A bug, leak, gap or stale doc found mid-work goes on the session's worklist
(`docs/*-todo.md`, the `worklist` skill) and gets done here. Never hand it to `spawn_task`, a
background session or "a follow-up"; `spawn_task` is only for when the user asks for another session.

Sequence the list so shared resources are spent once (one e2e run, one deploy), and don't edit code a
running verification is exercising. Commit, push and deploy as the project's CLAUDE.md defines without
asking. Ask only for a genuine owner or product decision, or before a destructive production action;
anything that truly can't be done here goes under `## Needs your decision` with your pick.
`Session: CLEAR` is unavailable while any worklist item is open.

Why: the user's words, "we've had issues with multiple sessions working in parallel and you being
overly cautious about deploying, committing, asking too much question i don't know the answer to."
