# Coding Style

- Immutability: return new objects; never mutate in place.
- Many small files organized by feature/domain: 200-400 lines typical, 800 max; functions under 50
  lines; nesting no deeper than 4 levels.
- Handle errors explicitly at every level: user-friendly messages in UI code, detailed context in
  server logs, never swallow an error silently.
- Validate at system boundaries (user input, API responses, file content) with schema validation where
  available, and fail fast with clear messages.
- No hardcoded values: use constants or config.
