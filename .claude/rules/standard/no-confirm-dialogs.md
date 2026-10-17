---
paths:
  - "**/*.{js,mjs,jsx,ts,tsx,html,astro,vue,svelte}"
---
# No Browser Dialogs

Never call `confirm()`, `prompt()` or `alert()` (or their `window.` forms). For destructive actions use
direct action + undo toast (preferred), a custom promise-based confirmation modal in the app's design
system (e.g. `await notifyConfirm('Delete this item?', { type: 'danger' })`), or an inline second-click
confirm. Notifications go through the app's toast system. If the project has no modal helper yet, build
one once and reuse it. Why: the user calls browser dialogs "super sloppy implementation".
