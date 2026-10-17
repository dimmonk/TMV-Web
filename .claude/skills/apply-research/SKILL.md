---
name: apply-research
description: Use right after ANY research phase (web research, reading existing-code patterns, design-pattern investigation) and BEFORE writing code. Forces a Finding -> Implementation-decision mapping so research is actually applied, not ignored. Trigger whenever you researched something then are about to implement.
origin: extracted-from-rules
---

> **Recommended model:** sonnet — mapping research findings to implementation decisions. (Skills run in the session model; this is the intended tier — switch with `/model` if needed.)

# Apply Research Findings

When asked to research design patterns or best practices before implementing, actually follow the findings in the implementation. Don't treat research as a checkbox exercise.

## The rule

After a research phase, before writing code:

1. **List the key findings** from the research.
2. **Map each finding** to a specific implementation decision.
3. **If the implementation contradicts a finding**, stop and explain why.

Don't research thoroughly and then build the opposite.

## Why

On the Meticulous mobile redesign, research found:
- "Put selection state in a compact header bar"
- "Live brewing should be immersive, not a modal"

Then the implementation did the exact opposite — bars as separate body elements and the brew flow still in a modal overlay. This caused 15+ patch commits before the approach was abandoned and redone.

Research without application is worse than no research — it wastes time twice (once to find the answer, once to ignore it).

## How to apply

- After any research step, before writing code, create a short mapping: **Finding → Implementation decision**. Include it in the response so the user can see the research is being used.
- If any finding conflicts with a user preference or constraint, flag it explicitly and ask.
- If you can't map a finding to the implementation, it means either the research was irrelevant (say so) or the implementation is wrong.

## Corollary: reading the existing code is research too

Reading the existing project's patterns before proposing a new one is a form of research (see `read-before-writing.md`). Ignoring what you found is the same failure mode — do the work and then throw it away.
