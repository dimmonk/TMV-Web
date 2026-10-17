# Single Source of Truth — Never Dual-Write

Never write the same data to two places. Before creating a collection, field or structure, ask whether
an existing system already handles the concept; if so, extend it with feature-specific metadata (e.g. a
`bookingId` on a log entry) instead of building a parallel pipeline. Writing "merge" or "sync" code
between two sources of one concept means you already went wrong: consolidate.

The same holds in the UI: one owner per piece of state, no duplicate arrays, caches or derived values.

Why: `birthdayCheckins.checkedIn[]` beside the check-in `logs` caused counts jumping 149→155,
inconsistent buttons and undo drift; a parallel "charges" array beside `balanceEntries` needed
permanent reconciliation.
