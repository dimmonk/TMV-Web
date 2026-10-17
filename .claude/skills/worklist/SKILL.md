---
name: worklist
description: Keep a live, visible checklist for any multi-part job — one markdown worklist in docs/, rendered as an Artifact page and republished every time an item moves. Use at the start of any task with more than two parts (including a big plan / roadmap / gap analysis), and whenever the user says "todo list", "checklist", "the list", "what's left", or asks for progress. Works in any project — this skill is global, not tied to one codebase. The desktop app has no built-in todo tool; this is the replacement, and it is not optional.
---

# worklist

The desktop app's Code tab has no built-in todo tool. This skill is that
feature, and it applies to every project — never re-create a project-local
copy of it; that's exactly the parallel-copy drift this skill's own rules
warn against elsewhere in this user's setup.

## The model

- **One source.** A markdown file in the current project's `docs/` (for
  example `docs/edit-account-todo.md`): GFM checkboxes under `##` / `###`
  headings. The page is a view of that file. Never keep a second list
  anywhere else — not in a message, not in memory, not in a scratch file.
- **States**, all plain GFM so the file still reads on GitHub:
  - `- [x]` done — only once it is built AND seen working (a passing assertion
    or a screenshot), never because a diff looks right
  - `- [ ]` open
  - `- [ ] **(now)** …` in progress — one or two at a time, not the whole list
  - any item under a `## Needs your decision` heading — waiting on the user
- Finding IDs (`H1 · M4`) and 8-character commit hashes in an item's text are
  shown as tags on the page.

## The goal and the standard, at the top of every list

Every worklist opens with a `## Goal` section, before any item, written from
the user's own words:

- **Goal**: one sentence, what the job is for and who it serves.
- **The standard**: the quality bar the result must meet, as a few short
  lines a reviewer can check (who the reader or user is, what "done well"
  looks like, what is out of bounds). Not a restatement of the items.
- **How we stay on track**: the working rules for this job, a few lines
  (the main task keeps moving, everything is checked against the standard,
  the depth the user asked for, and any rule the user has added).

The page draws this section first, above the work, so it is the first thing
anyone reading the list sees.

Use it every time, not only at the start: before launching any work, check
the work serves the goal; before ticking an item `[x]`, check the result
against the standard and say which line it meets. When the user corrects
course, the correction goes into the Goal or the standard first, then into
the items. A result that does the item but misses the standard is not done.

## Priority: the main task never stalls, and nothing loses the goal

The list is in work order, and the order is the user's, not yours.

- **`## Main task` comes first**, and holds what the user named as the
  priority, broken into its parts. It must always be moving: at every point
  in the session, some Main task item is `(now)` and actually being worked.
- **`## Parked` holds secondary work.** It may run in parallel, as long as the
  Main task keeps moving and the secondary work does not pull your own
  attention off it. If secondary work is what you are spending your turns
  on, stop it and go back to the Main task.
- **Secondary work obeys the same Goal and standard.** Its depth is the depth
  the user asked for ("a reminder" is a reminder, not a research project),
  and it is written for the same reader in the same language. Check it
  against the standard before you tick it, exactly like Main task work.
- **When the user names a new priority, rewrite the list first**: the new
  priority becomes Main task, and you say in one line what moved.
- A bug found mid-work is written down at once (never lost) and placed by
  priority. One session owns the whole job, in the order the user set.

Why: 2026-10-05 (TMV coaching program). Parallel work was not the problem.
The problem: the main task (the coaching units) stopped while secondary work
(first aid, gym procedures) took the turns, and that secondary work went
deep into legal research the standard never asked for, losing sight of the
goal: a program for teen and young-adult coaches, in their language.

## Steps

1. **At the start**, write every part of the job as an item: each fix, each
   finding, each test run, each deploy step, under `## Main task` or
   `## Parked` as the priority section above says. Anything found mid-work is
   ADDED to the file at once, never lost in a doc nobody re-reads, and is done
   in priority order, never in parallel with an open Main task item it is not
   part of.
2. **Render and publish**, with the working directory set to the project
   root (the worklist path and CSS-token auto-detection both resolve
   relative to it):

   ```bash
   python3 ~/.claude/skills/worklist/render.py docs/<name>-todo.md <scratchpad>/<name>-worklist.html
   ```

   The script auto-detects the project's own CSS tokens (tries common paths
   like `public/css/tokens.css`, `public/css/app.css`, `public/css/v3.css`,
   …; a project's actual variable names are matched through a small alias
   table per semantic role, e.g. `--color-accent` also accepts
   `--color-primary` or `--bs-primary`) and both light/dark mode, so the
   rendered page wears whichever app it's for instead of a pasted default.
   Falls back to a neutral palette if nothing is found — never fails to
   render. Pass `--tokens path/to/file.css` to override detection, and
   `--project "Name"` to override the eyebrow label (defaults to the current
   directory's name).

   Publish the HTML with the Artifact tool. If the file's frontmatter already
   has `artifact: <url>`, pass that as `url` so the same page updates;
   otherwise publish fresh and write the returned URL into the frontmatter.
3. **Every time an item changes state**, edit the markdown, re-render and
   republish. Changes that land together go out in one republish.
4. **Give the user the link once**, when the list first goes up. After that
   the page is where progress lives.
5. **Never write `Session: CLEAR`** (or whatever the project's status-line
   convention is) **while the file has an open item for this job** — an open
   worklist item is exactly the "one thing outstanding" a status-line rule
   asks for.

## Per-project doc-tracking conventions

Some projects gitignore most of `docs/` except a fixed canonical set (check
`.gitignore` before assuming a new `docs/*-todo.md` file will be tracked by
git) — that's fine, the worklist file is a live working doc, not necessarily
meant to ship in the repo's history. The rendered Artifact page is what
persists across sessions regardless of whether the source markdown is
committed.
