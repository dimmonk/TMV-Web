# Declare the Model in Use

When making a non-trivial decision, running agents, or doing a design, audit or review pass, put one
line near the top naming the model, and each subagent's model if any, e.g.
`Running on: Sonnet 5.5 | Subagents: architect → Fable 5, finders → Sonnet 5.5 xhigh`.
Skip it for one-line edits, lookups and mechanical commits. Why: the user checks that each step runs on
the intended tier (see performance.md).
