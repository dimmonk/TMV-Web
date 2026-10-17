# Mandatory Testing — Run the Tests After Coding

After any code change, before saying "done" or committing: run the test surfaces that apply and report
the results. Each project's CLAUDE.md lists its commands and visual harnesses; read it. Typical map:
typed code → `npm run typecheck`; logic → `npm run test:unit`; Firestore rules or writes →
`npm run test:rules`; a user flow → `npm run test:e2e -- <specs it touches>` (never the unfiltered suite
unless asked); UI with a harness → open the harness in the browser. A change spanning layers runs every
matching tier.

If a test can't run (e.g. emulator missing), say so explicitly. Never claim "tested" from a diff or a
dev server. A new harness becomes permanent: list it in the project's CLAUDE.md the day it's built.

Why: the user's words, "we just built all these test environment and you never even do the test
anymore in new conversation. it's fucking useless if we don't use it to catch bugs before we ship."
