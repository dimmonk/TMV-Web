---
name: prototype-mobile-first
description: Use when starting any SIGNIFICANT mobile or tablet UX redesign, or any complex/iterative notification/modal/interactive redesign. Mandates building a standalone prototype HTML file (or test harness) and getting approval BEFORE touching the real app. Not for small single-breakpoint tweaks.
origin: extracted-from-rules
---

> **Recommended model:** sonnet — UI prototyping. (Skills run in the session model; this is the intended tier — switch with `/model` if needed.)

# Prototype Mobile/Tablet Redesigns in a Standalone File First

For any significant mobile or tablet UX redesign, build a standalone prototype HTML file first — don't modify the real app until the design is validated.

## The rule

Before touching the real app for a mobile/tablet redesign:

1. Create a standalone `prototype-mobile.html` (or similar) with inline CSS and JS
2. Iterate quickly on the prototype until the design is right
3. Show the prototype to the user and get approval
4. Only then integrate the validated design into the real app

## Why

The first attempt at a Meticulous mobile redesign went straight to modifying the real app's media queries. Result: broken everywhere, hard to roll back, required many patch commits.

The second attempt used a standalone prototype file. Result: fast iteration, no risk to the real app, user approved the design in one round, clean integration.

Prototyping is faster than fixing. The real app has too many constraints (other media queries, existing components, deployment coupling) to iterate on during a design phase.

## How to apply

- **Any significant mobile/tablet redesign** = prototype first.
- **Small tweaks** (adjust one breakpoint, fix one card padding) = modify real app directly, no prototype needed.
- The prototype should use the real app's color tokens and typography where possible, so the integration is mechanical.
- Keep the prototype file after integration — it's useful for future iterations.

## Corollary: the same pattern for notification/modal/complex-interactive redesigns

If the UX is complex enough that you're going to iterate on it multiple times, a standalone test harness beats iterating on the real app. The TMV Members `notification-test.html` is an example — it loads the real module but lets you exercise every variant in isolation, with no app state interference.
