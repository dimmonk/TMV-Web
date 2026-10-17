#!/bin/sh
# PATH-proof node resolver for Claude Code hooks.
#
# Why this exists: apps launched from Finder/Dock (the Claude Code *desktop app*)
# do NOT inherit the login-shell PATH, so `node` installed at /usr/local/bin or
# /opt/homebrew/bin is not found and every `node ...` hook silently no-ops —
# enforcement (doc-reading gate, test gate, arch pipeline) stops firing while
# everything still LOOKS wired. This wrapper resolves node from the known install
# locations explicitly, so hooks fire identically from the terminal, the VS Code
# extension, and the desktop app.
#
# Usage in ~/.claude/settings.json:
#   "command": "sh ~/.claude/scripts/hooks/run-node.sh ~/.claude/scripts/hooks/<hook>.js"
#
# Override: set CLAUDE_HOOK_NODE to an absolute node path to force a specific one
# (e.g. an nvm version). Single source of truth — every hook routes through here.

for n in "$CLAUDE_HOOK_NODE" /usr/local/bin/node /opt/homebrew/bin/node /usr/bin/node; do
  [ -n "$n" ] && [ -x "$n" ] && exec "$n" "$@"
done
# Last resort: whatever `node` is on PATH (works when launched from a terminal).
exec node "$@"
