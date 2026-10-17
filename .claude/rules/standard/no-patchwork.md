# No Patchwork — Get It Right the First Time

When something breaks: trace the actual root cause, read the existing pattern you are mirroring and
match it exactly, check every value and edge case, trace the data flow end to end, and only then write
the fix. Pattern is read → understand → write → verify, never try → fail → try.

If a fix fails, the next step is reading more code, not another guess. If a broken fix already shipped,
revert to a clean state and make one correct change instead of layering patches.

Destructive commands are not a shortcut: when blocked by unexpected state (stash, branches, locks),
investigate it; never `git reset --hard` or `rm -rf` it away.

Why: one mobile stepper change took 6+ follow-up patches, each eroding the user's trust.
