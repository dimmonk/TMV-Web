# One Session Owns the Whole Job

Everything found while working a task is handled in that session: fixed, tested, committed, pushed and
deployed. A bug, leak, gap or stale doc found mid-work goes on the session's worklist
(`docs/*-todo.md`, the `worklist` skill) and gets done here. Never hand it to `spawn_task`, a
background session or "a follow-up"; `spawn_task` is only for when the user asks for another session.

Sequence the list so shared resources are spent once (one e2e run, one deploy), and don't edit code a
running verification is exercising.

## Shipping: no stops

Tests pass, then merge, migrate data and deploy in one run, without asking. This is the only rule
about when to ask during shipping; any other note, memory or doc that says to wait for a go before a
merge, a database or data change, or a deploy is out of date and does not apply.

The one exception: stop and ask before a migration or command that deletes production data (drops a
collection, table or field holding data, or bulk-deletes documents). Everything else ships.

Outside shipping, ask only for a genuine owner or product decision; anything that truly can't be done
here goes under `## Needs your decision` with your pick. `Session: CLEAR` is unavailable while any
worklist item is open.

Why: the owner's words, "we've had issues with multiple sessions working in parallel and you being
overly cautious about deploying, committing, asking too much question i don't know the answer to."
Contradictory saved notes about asking before merging a database change caused repeated stops.
