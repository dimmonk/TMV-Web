# No Scope Creep — Follow Exact Instructions

Do exactly what was asked. If the user shows before/after code, match it. Don't touch, refactor,
reformat or "improve" working code that wasn't mentioned, and don't add comments, logging or error
handling to code you didn't change. When adding UI, keep every existing element (add alongside, never
replace unless asked). Read-only views show everything, not a summary. If scope is unclear, ask.

Unrequested features ("it would be nice if…") are mentioned, not implemented. Bugs are not features: a
bug found mid-work is fixed in this session (see one-session-owns-the-whole-job.md).

Why: rewriting a whole positioning function for a 1-pixel fix broke three features; adding a "View"
button by removing "Edit" was never asked for.
