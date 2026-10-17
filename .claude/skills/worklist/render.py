#!/usr/bin/env python3
"""
Render a docs/*-todo.md worklist as one self-contained HTML page for the
Artifact tool. Project-agnostic — works from any project's root (the script
lives globally at ~/.claude/skills/worklist/, not inside any one project).

    python3 ~/.claude/skills/worklist/render.py <worklist.md> <out.html> \\
        [--title "Name"] [--project "Project Name"] [--tokens path/to/tokens.css]

Run this with the current working directory set to the project root — the
worklist path (first argument) is resolved relative to it, and CSS token
auto-detection searches relative to it too.

The markdown file is the ONE source; this page is a view of it. Nothing here
is edited by hand and nothing is tracked anywhere else.

States come from plain GFM, so the file still reads on GitHub:
    - [x] done          - [ ] open          - [ ] **(now)** in progress
    any bullet under a "## Needs your decision" heading = waiting on the user

Colours are read from the current project's own CSS at render time — light
tokens from :root, dark tokens from whichever dark-mode selector the project
actually uses — so the checklist wears the app's palette and follows it when
the tokens move, instead of a pasted copy that drifts. Different projects use
different token vocabularies (a Bootstrap-flavored app vs. a from-scratch
design-token file), so token names are resolved through a small alias table
per semantic role rather than assumed to match exactly; anything not found
falls back to a neutral default so the page always renders correctly, just
without the project's exact brand colors for that one role.
"""
import argparse
import datetime
import html
import re
import sys
from pathlib import Path

# ── token discovery (project-agnostic) ──────────────────────────────────────

# Tried in order, relative to the project root, first existing file wins.
# Extend this list rather than hardcoding one project's filename.
CANDIDATE_TOKEN_FILES = [
    'public/css/v3.css',
    'public/css/tokens.css',
    'public/css/design-tokens.css',
    'public/css/variables.css',
    'public/css/app.css',
    'public/css/styles.css',
    'public/css/main.css',
    'src/styles/tokens.css',
    'src/css/tokens.css',
]

# Tried in order; first block found with at least one declaration wins.
CANDIDATE_DARK_SELECTORS = [
    r'\[data-theme="dark"\]',
    r'\[data-bs-theme="dark"\]',
    r'\[data-color-mode="dark"\]',
    r'html\.dark',
    r':root\.dark',
    r'\.dark-mode',
]

FALLBACK = {
    '--tone-hue': '220', '--tone-chroma': '0.02',
    '--color-bg': '#f7f6f3', '--color-bg-elevated': '#ffffff', '--color-bg-subtle': '#eceae5',
    '--color-border-subtle': '#e4e1db', '--color-border': '#d6d2ca',
    '--color-text': '#25221c', '--color-text-secondary': '#5c574d', '--color-text-muted': '#7d776c',
    '--color-accent': '#2f6fd6', '--color-accent-tint': '#e8f0fc',
    '--color-success': '#16a34a', '--color-paused': '#e27902', '--color-danger': '#b91c1c',
    '--font-sans': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",
    '--font-mono': 'ui-monospace, SFMono-Regular, Menlo, monospace',
}

# Semantic key -> ordered list of source variable names to try in a project's
# own CSS before falling back. The first alias present in the parsed :root
# (or dark-selector) declarations wins; the exact canonical name is tried
# first so a project that already matches this vocabulary needs no aliasing.
ALIASES = {
    '--color-bg':              ['--color-bg', '--bg', '--background'],
    '--color-bg-elevated':     ['--color-bg-elevated', '--color-bg-secondary', '--color-surface', '--surface'],
    '--color-bg-subtle':       ['--color-bg-subtle', '--color-gray-100', '--color-gray-50', '--color-bg'],
    '--color-border-subtle':   ['--color-border-subtle', '--color-border', '--bs-border-color', '--card-border-color'],
    '--color-border':          ['--color-border', '--bs-border-color', '--card-border-color', '--color-gray-300'],
    '--color-text':            ['--color-text', '--text', '--color-ink'],
    '--color-text-secondary':  ['--color-text-secondary', '--color-text-muted', '--text-secondary'],
    '--color-text-muted':      ['--color-text-muted', '--color-text-secondary', '--text-muted'],
    '--color-accent':          ['--color-accent', '--color-primary', '--bs-primary', '--accent'],
    '--color-accent-tint':     ['--color-accent-tint', '--color-primary-light', '--color-info-light'],
    '--color-success':         ['--color-success', '--bs-success'],
    '--color-paused':          ['--color-paused', '--color-warning', '--bs-warning'],
    '--color-danger':          ['--color-danger', '--bs-danger', '--color-error'],
}


def css_block(css, selector):
    m = re.search(r'^' + selector + r'\s*\{', css, re.M)
    if not m:
        return ''
    i = j = m.end()
    depth = 1
    while j < len(css) and depth:
        depth += {'{': 1, '}': -1}.get(css[j], 0)
        j += 1
    return css[i:j - 1]


def decls(body):
    return {m.group(1): ' '.join(m.group(2).split())
            for m in re.finditer(r'(--[\w-]+)\s*:\s*([^;]+);', body)}


VAR_REF = re.compile(r'^var\(\s*(--[\w-]+)\s*(?:,\s*(.*))?\)$')


def resolve_var_refs(raw):
    """A project's own CSS custom properties often reference each other
    (e.g. --bs-border-color: var(--color-gray-200)). We only emit a small
    semantic subset of the source file's declarations, so an unresolved
    var(--color-gray-200) in the output would dangle (that name is never
    defined in the page we generate) and silently fail to resolve in the
    browser. Resolve simple var() chains against the same declaration block
    before aliasing, so the emitted value is always a real color/length."""
    out = dict(raw)
    for _ in range(6):  # bounded passes for chains; a project's tokens are shallow
        changed = False
        for k, v in list(out.items()):
            m = VAR_REF.match(v)
            if not m:
                continue
            ref, fallback = m.group(1), m.group(2)
            if ref in out and not VAR_REF.match(out[ref]):
                out[k] = out[ref]
                changed = True
            elif ref not in out and fallback:
                out[k] = fallback.strip()
                changed = True
        if not changed:
            break
    return out


def resolve_aliases(raw):
    """Map a project's own declarations onto the canonical semantic keys this
    template uses, via ALIASES, falling back to FALLBACK per-key rather than
    all-or-nothing."""
    out = {}
    for canonical, candidates in ALIASES.items():
        for name in candidates:
            if name in raw:
                out[canonical] = raw[name]
                break
        else:
            if canonical in FALLBACK:
                out[canonical] = FALLBACK[canonical]
    # Carry through anything else the template wants that isn't role-aliased.
    for k in ('--tone-hue', '--tone-chroma', '--font-sans', '--font-mono'):
        if k in raw:
            out[k] = raw[k]
        elif k in FALLBACK:
            out[k] = FALLBACK[k]
    return out


def find_token_file(root, override):
    if override:
        p = (root / override) if not Path(override).is_absolute() else Path(override)
        return p if p.is_file() else None
    for rel in CANDIDATE_TOKEN_FILES:
        p = root / rel
        if p.is_file():
            return p
    return None


def load_tokens(root, override=None):
    path = find_token_file(root, override)
    if not path:
        return dict(FALLBACK), {}
    try:
        css = re.sub(r'/\*.*?\*/', '', path.read_text(), flags=re.S)
    except OSError:
        return dict(FALLBACK), {}

    raw_light = resolve_var_refs(decls(css_block(css, r':root')))
    light = resolve_aliases(raw_light)

    dark = {}
    for sel in CANDIDATE_DARK_SELECTORS:
        # Dark overrides are often partial (only the properties that change),
        # so resolve var() refs against dark-block-declares-first, falling
        # back to the light block for anything the dark block doesn't itself
        # redefine (e.g. a dark override of --bs-border-color pointing at a
        # --color-gray-200 that's only redefined in the dark block too, vs.
        # one that still points at a light-only value).
        raw_dark_only = decls(css_block(css, sel))
        if raw_dark_only:
            raw_dark = resolve_var_refs({**raw_light, **raw_dark_only})
            resolved = resolve_aliases(raw_dark)
            # Only keep keys that actually differ from light (a real override),
            # dropping ones that only exist because of the FALLBACK carry-through.
            dark = {k: v for k, v in resolved.items() if k in raw_dark_only or
                    any(alias in raw_dark_only for alias in ALIASES.get(k, []))}
            break
    return light, dark


# ── markdown ─────────────────────────────────────────────────────────────────
ID_TAIL = re.compile(r'\s*((?:[HML]\d{1,2}[a-z]?)(?:\s*·\s*[HML]\d{1,2}[a-z]?)*)\s*\.?\s*$')


ASCII_SAFE = str.maketrans({
    '—': '-',   # em dash
    '–': '-',   # en dash
    '·': '-',   # middle dot
    '•': '-',   # bullet
    '‘': "'", '’': "'",   # smart single quotes
    '“': '"', '”': '"',   # smart double quotes
    '…': '...',  # ellipsis
    '✓': 'x',   # checkmark
    '→': '->',  # right arrow
    '←': '<-',  # left arrow
    '⇒': '=>',  # right double arrow
})


def ascii_safe(text):
    """Some artifact-viewing paths have shown these bytes correctly UTF-8-encoded
    on disk but mis-decoded on screen (an em dash rendering as the classic
    UTF-8-read-as-Latin-1 mojibake). Rather than chase a transport we don't
    control, the rendered output just never depends on it: no non-ASCII
    typographic character survives into the page."""
    return text.translate(ASCII_SAFE)


def inline(text):
    t = html.escape(ascii_safe(text), quote=False)
    # Code spans are set aside first so an asterisk inside one (a `**` glob) is never read as emphasis.
    codes = []
    def stash(m):
        codes.append('<code>' + m.group(1) + '</code>')
        return '\x00%d\x00' % (len(codes) - 1)
    t = re.sub(r'`([^`]+)`', stash, t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])', r'<em>\1</em>', t)
    t = re.sub(r'\x00(\d+)\x00', lambda m: codes[int(m.group(1))], t)
    t = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<a href="\2">\1</a>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1', t)   # repo-relative links: text only
    return t


def is_needs_heading(name):
    """Matches the documented contract exactly ('## Needs your decision') —
    NOT a loose substring check. A loose 'decision' in name.lower() also
    matches a plain reference heading like 'Design decisions (locked)' and
    silently flags an already-settled bullet as waiting on the user."""
    return name.strip().lower() == 'needs your decision'


def parse(md):
    front = {}
    m = re.match(r'^---\n(.*?)\n---\n', md, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ':' in line:
                k, v = line.split(':', 1)
                front[k.strip()] = v.strip()
        md = md[m.end():]

    title, intro, groups, footer = '', [], [], []
    group = sub = None
    parent_item = None  # the last top-level item, while an indented "  - [ ]" line can still attach to it as a sub
    # The row (item or sub-step) an indented continuation line extends. GFM lets a list item wrap onto any
    # indented line; anything indented that is not itself a "- " line belongs to the row above it, never to a
    # note paragraph — otherwise the row is cut mid-sentence and its tail floats above the list as a loose box.
    cont_row = None
    para = []

    def flush_para():
        nonlocal para
        if para:
            text = ' '.join(p.strip().lstrip('>').strip() for p in para).strip()
            if text:
                target = sub if sub is not None else group
                if target is None:
                    intro.append(text)
                elif group and group['name'].lower() == 'rule':
                    footer.append(text)
                else:
                    target['notes'].append(text)
            para = []

    for raw in md.splitlines():
        line = raw.rstrip()
        if cont_row is not None and line[:1] in (' ', '\t') and line.strip() and not line.lstrip().startswith('- '):
            cont_row['text'] += ' ' + line.strip()
            continue
        cont_row = None
        if line.startswith('# '):
            flush_para()
            title = line[2:].strip()
            parent_item = None
        elif line.startswith('## '):
            flush_para()
            group = {'name': line[3:].strip(), 'notes': [], 'items': [], 'subs': []}
            groups.append(group)
            sub = None
            parent_item = None
        elif line.startswith('### ') and group is not None:
            flush_para()
            sub = {'name': line[4:].strip(), 'notes': [], 'items': []}
            group['subs'].append(sub)
            parent_item = None
        elif re.match(r'^- \[( |x|X)\] ', line) or (re.match(r'^- \*\*', line) and group
                                                    and is_needs_heading(group['name'])):
            flush_para()
            done = bool(re.match(r'^- \[[xX]\]', line))
            body = re.sub(r'^- (\[[ xX]\] )?', '', line)
            item = {'done': done, 'text': body.strip(), 'subs': [],
                    'needs': bool(group and is_needs_heading(group['name']))}
            (sub if sub is not None else group)['items'].append(item)
            parent_item = item
            cont_row = item
        elif re.match(r'^\s+- \[( |x|X)\] ', line) and parent_item is not None:
            # An indented checklist line under the item just added — its own sub-steps, not prose. Rendered as a
            # short list under the parent row instead of being swallowed into the group's note paragraph as literal
            # "- [x]" text (which drops both the row styling and, for a run of them, all inline formatting).
            flush_para()
            stripped = line.lstrip()
            done = bool(re.match(r'^- \[[xX]\]', stripped))
            body = re.sub(r'^- (\[[ xX]\] )?', '', stripped)
            sub_step = {'done': done, 'text': body.strip()}
            parent_item['subs'].append(sub_step)
            cont_row = sub_step
        elif line.strip() == '':
            flush_para()
            parent_item = None
        elif re.match(r'^- (?!\[)', line) and group is not None and not is_needs_heading(group['name']):
            # A plain bullet (no checkbox) in a section's notes, such as the lines of "The standard" under ## Goal:
            # kept as its own note line so the page draws a list, not one run-on paragraph.
            flush_para()
            (sub if sub is not None else group)['notes'].append({'bullet': line[2:].strip()})
        else:
            para.append(line)
    flush_para()
    return front, title, intro, groups, footer


def state(it):
    if it['done']:
        return 'done'
    if it['needs']:
        return 'needs'
    if it['text'].startswith('**(now)**'):
        return 'now'
    return 'open'


CHIP = {'done': ('ok', 'Done'), 'now': ('new', 'Now'), 'open': ('off', 'Open'), 'needs': ('hold', 'Needs you')}


def row(it):
    st = state(it)
    text = re.sub(r'^\*\*\(now\)\*\*\s*', '', it['text'])
    tags = []
    m = ID_TAIL.search(text)
    if m and not it['done'] or (m and it['done']):
        if m:
            tags = [t.strip() for t in m.group(1).split('·')]
            text = text[:m.start()].rstrip()
    tone, word = CHIP[st]
    tag_html = ''.join(f'<span class="tag">{html.escape(t)}</span>' for t in tags)
    subs_html = ''.join(sub_row(s) for s in it.get('subs') or [])
    subs = f'<ul class="subs">{subs_html}</ul>' if subs_html else ''
    return (f'<li class="row is-{st}"><span class="chip {tone}"><span class="dot"></span>{word}</span>'
            f'<span class="txt">{inline(text)}</span>'
            f'<span class="tags">{tag_html}</span>{subs}</li>')


def sub_row(it):
    """One line of an item's own sub-steps (an indented '  - [ ]' under it) — lighter than a full row: a mark and
    the text, no chip, no tags. Done/open both read from the same inline() as every other row's text."""
    return (f'<li class="is-{"done" if it["done"] else "open"}">'
            f'<span class="mark">{"x" if it["done"] else "-"}</span>'
            f'<span class="txt">{inline(it["text"])}</span></li>')


def all_items(g):
    return g['items'] + [i for s in g['subs'] for i in s['items']]


def legend(tag, name, items):
    done = sum(1 for i in items if i['done'])
    count = f'{done} of {len(items)} done' if items else ''
    return (f'<{tag} class="legend"><span class="t">{inline(name)}</span>'
            f'<span class="rule"></span><span class="n">{count}</span></{tag}>')


def notes_html(notes):
    """A section's notes: paragraphs as they are, and runs of plain bullets as one list."""
    out, run = [], []
    for n in notes + [None]:
        if isinstance(n, dict):
            run.append(f"<li>{inline(n['bullet'])}</li>")
            continue
        if run:
            out.append('<ul class="note-list">' + ''.join(run) + '</ul>')
            run = []
        if n is not None:
            out.append(f'<p class="note">{inline(n)}</p>')
    return out


def is_parked_heading(name):
    """'## Parked' (SKILL.md, Priority): secondary work, not started while the Main task is open. Drawn quieter."""
    return name.strip().lower() == 'parked'


def render_group(g):
    cls = 'group parked' if is_parked_heading(g['name']) else 'group'
    out = [f'<section class="{cls}">', legend('h2', g['name'], all_items(g))]
    out += notes_html(g['notes'])
    if g['items']:
        out.append('<ul class="rows">' + ''.join(row(i) for i in g['items']) + '</ul>')
    for s in g['subs']:
        out.append('<div class="sub">' + legend('h3', s['name'], s['items']))
        out += notes_html(s['notes'])
        if s['items']:
            out.append('<ul class="rows">' + ''.join(row(i) for i in s['items']) + '</ul>')
        out.append('</div>')
    out.append('</section>')
    return '\n'.join(out)


# ── page ─────────────────────────────────────────────────────────────────────
def page(md_path, root, project_name, title_override=None, tokens_override=None):
    front, h1, intro, groups, footer = parse(Path(md_path).read_text())
    title = title_override or re.split(r'\s+—\s+', h1)[0] or 'Worklist'
    groups = [g for g in groups if g['name'].lower() != 'rule']
    # The "## Goal" section (SKILL.md): the goal and the standard. It has no checkboxes, so it must never be
    # counted as finished and folded into history; it is drawn on its own, first, above the work.
    goal = next((g for g in groups if g['name'].strip().lower() == 'goal'), None)
    groups = [g for g in groups if g is not goal]
    goal_html = ''
    if goal:
        goal_html = ('<section class="goal" aria-label="Goal and standard"><h2 class="legend"><span class="t">Goal and standard</span>'
                     '<span class="rule"></span></h2>' + '\n'.join(notes_html(goal['notes'])) + '</section>')
    active = [g for g in groups if any(not i['done'] for i in all_items(g))]
    history = [g for g in groups if g not in active]
    # The meter/tally/lede are whole-worklist stats — they must count items in
    # a fully-done group too, or a completed phase collapsing into history
    # (see below) silently drops its items from "N of TOTAL done" the moment
    # it finishes, making the bar look like progress reset instead of grew.
    items = [i for g in groups for i in all_items(g)]
    n = {k: sum(1 for i in items if state(i) == k) for k in CHIP}
    total = len(items)
    light, dark = load_tokens(root, tokens_override)

    def token_css(src, keys):
        return ' '.join(f'{k}: {src[k]};' for k in keys if k in src)

    want = list(ALIASES.keys())
    root_css = token_css(light, ['--tone-hue', '--tone-chroma', '--font-sans', '--font-mono'] + want)
    dark_css = token_css(dark, [k for k in want if k in dark])

    if total:
        segs = ''.join(
            f'<span class="seg {k}" style="flex:{n[k]}"></span>' for k in ('done', 'now', 'needs', 'open') if n[k])
        meter = (f'<div class="meter" role="img" aria-label="{n["done"]} of {total} done, '
                 f'{n["now"]} in progress, {n["needs"]} waiting on you, {n["open"]} open">{segs}</div>')
        tally = ''.join(
            f'<div class="t-{k}"><dt><span class="chip {CHIP[k][0]}"><span class="dot"></span>{CHIP[k][1]}</span></dt>'
            f'<dd>{n[k]}</dd></div>' for k in ('done', 'now', 'needs', 'open'))
        lede = (f'{n["done"]} of {total} done'
                + (f', {n["now"]} in progress' if n['now'] else '')
                + (f', {n["needs"]} waiting on you' if n['needs'] else '')
                + (f', {n["open"]} still to do.' if n['open'] else '. Nothing left open.'))
    else:
        meter = tally = ''
        lede = 'Nothing open. Every line in this worklist is done.'

    now_items = [i for i in items if state(i) == 'now']
    now_html = ''
    if now_items:
        now_html = ('<section class="now" aria-label="Working on now"><h2 class="legend"><span class="t">Working on now</span>'
                    '<span class="rule"></span></h2><ul class="rows">' + ''.join(row(i) for i in now_items) + '</ul></section>')

    hist_html = ''
    if history:
        hcount = sum(len(all_items(g)) for g in history)
        hist_html = (f'<details class="history"><summary>Done earlier <span class="n">{hcount} items across '
                     f'{len(history)} sections</span></summary>' + '\n'.join(render_group(g) for g in history) + '</details>')

    stamp = datetime.datetime.now().strftime('%b %-d, %H:%M')
    src_rel = Path(md_path).resolve()
    try:
        src_rel = src_rel.relative_to(root)
    except ValueError:
        pass

    return f'''<title>{html.escape(ascii_safe(title))}</title>
<meta name="description" content="Live checklist rendered from {html.escape(str(src_rel))}">
<style>
:root {{ {root_css}
  --bg: var(--color-bg); --surface: var(--color-bg-elevated); --sunk: var(--color-bg-subtle);
  --rule: var(--color-border-subtle); --edge: var(--color-border);
  --ink: var(--color-text); --ink-2: var(--color-text-secondary); --ink-3: var(--color-text-muted);
  --accent: var(--color-accent); --accent-tint: var(--color-accent-tint);
  --ok: var(--color-success); --hold: var(--color-paused);
  color-scheme: light; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ {dark_css} color-scheme: dark; }} }}
:root[data-theme="dark"] {{ {dark_css} color-scheme: dark; }}
*, *::before, *::after {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font-family: var(--font-sans);
  font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; }}
.sheet {{ max-width: 820px; margin: 0 auto; padding: 40px 24px 64px; display: flex; flex-direction: column; gap: 28px; }}
.masthead {{ display: flex; flex-direction: column; gap: 12px; }}
.eyebrow {{ margin: 0; font-size: 11.5px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--ink-3); }}
h1 {{ margin: 0; font-size: 28px; line-height: 1.15; font-weight: 700; letter-spacing: -.01em; text-wrap: balance; }}
.lede {{ margin: 0; font-size: 15px; color: var(--ink-2); max-width: 62ch; }}
.intro {{ margin: 0; color: var(--ink-3); max-width: 70ch; font-size: 13px; }}
.meter {{ display: flex; gap: 2px; height: 8px; border-radius: 4px; overflow: hidden; background: var(--sunk); }}
.seg {{ min-width: 6px; }}
.seg.done {{ background: var(--ok); }} .seg.now {{ background: var(--accent); }}
.seg.needs {{ background: var(--hold); }} .seg.open {{ background: var(--edge); }}
.tally {{ display: flex; flex-wrap: wrap; gap: 8px 20px; margin: 0; }}
.tally > div {{ display: flex; align-items: center; gap: 8px; }}
.tally dd {{ margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; }}
.stamp {{ margin: 0; font-size: 12px; color: var(--ink-3); }}
.stamp code {{ font-size: 11.5px; }}

.legend {{ display: flex; align-items: center; gap: 12px; margin: 0 0 4px; font-size: 11.5px; font-weight: 600;
  letter-spacing: .07em; text-transform: uppercase; color: var(--ink-2); }}
.legend .t {{ flex: none; max-width: 70%; }}
.legend .rule {{ flex: 1; height: 1px; background: var(--edge); }}
.legend .n {{ flex: none; letter-spacing: .02em; text-transform: none; font-weight: 500; color: var(--ink-3);
  font-variant-numeric: tabular-nums; }}
h3.legend {{ font-size: 11px; color: var(--ink-3); margin-top: 18px; }}
/* A section intro is prose, not a task. It gets no box and no chip — same
   treatment as the document intro above. Boxing it only invented a third kind
   of object competing with the rows. */
.note {{ margin: 0 0 10px; font-size: 13px; color: var(--ink-3); max-width: 70ch; }}

.group, .now {{ display: flex; flex-direction: column; }}
.group.parked {{ opacity: .55; }}
.goal {{ display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; border: 1px solid var(--line, rgba(0,0,0,.12)); border-radius: 12px; }}
.goal .note {{ color: inherit; }}
.note-list {{ margin: 4px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }}
.rows {{ list-style: none; margin: 0; padding: 0; background: var(--surface); border: 1px solid var(--edge);
  border-radius: 8px; }}
.row {{ display: grid; grid-template-columns: 88px minmax(0, 1fr) auto; gap: 4px 12px; align-items: start;
  padding: 10px 14px; border-top: 1px solid var(--rule); }}
.row:first-child {{ border-top: 0; }}
.row.is-now {{ background: color-mix(in srgb, var(--accent) 6%, transparent); }}
.row.is-needs {{ background: color-mix(in srgb, var(--hold) 7%, transparent); }}
.row.is-done .txt {{ color: var(--ink-2); }}
.txt {{ max-width: 68ch; min-width: 0; overflow-wrap: anywhere; }}
.txt strong {{ font-weight: 600; color: var(--ink); }}
.txt a {{ color: var(--accent); }}
code {{ font-family: var(--font-mono); font-size: 12px; padding: 1px 4px; border-radius: 4px; background: var(--sunk); white-space: nowrap; }}
.tags {{ display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px; padding-top: 1px; }}
.tag {{ font-family: var(--font-mono); font-size: 11px; line-height: 18px; padding: 0 6px; border-radius: 4px;
  color: var(--ink-2); border: 1px solid var(--edge); font-variant-numeric: tabular-nums; }}
.subs {{ grid-column: 1 / -1; list-style: none; margin: 6px 0 0; padding: 0 0 0 100px; display: flex; flex-direction: column;
  gap: 4px; }}
.subs li {{ display: flex; gap: 8px; align-items: baseline; font-size: 12.5px; color: var(--ink-3); }}
.subs li.is-open {{ color: var(--ink-2); }}
.subs .mark {{ flex: none; width: 12px; text-align: center; font-variant-numeric: tabular-nums; }}
.subs .txt a {{ color: var(--accent); }}

.chip {{ display: inline-flex; align-items: center; gap: 5px; height: 20px; padding: 0 8px; border-radius: 4px;
  font-size: 12px; font-weight: 600; white-space: nowrap; margin-top: 1px; }}
.chip .dot {{ width: 6px; height: 6px; border-radius: 50%; background: currentColor; }}
.chip.ok {{ color: var(--ok); background: color-mix(in srgb, var(--ok) 12%, transparent); }}
.chip.new {{ color: var(--accent); background: var(--accent-tint); }}
.chip.hold {{ color: var(--hold); background: color-mix(in srgb, var(--hold) 14%, transparent); }}
.chip.off {{ color: var(--ink-3); background: color-mix(in srgb, var(--ink-3) 14%, transparent); }}

.history {{ border-top: 1px solid var(--edge); padding-top: 16px; }}
.history summary {{ cursor: pointer; font-weight: 600; color: var(--ink-2); list-style: none; display: flex; gap: 10px;
  align-items: baseline; }}
.history summary::-webkit-details-marker {{ display: none; }}
.history summary::before {{ content: "›"; display: inline-block; transition: transform .15s; color: var(--ink-3); }}
.history[open] summary::before {{ transform: rotate(90deg); }}
.history summary .n {{ font-weight: 400; color: var(--ink-3); font-size: 13px; }}
.history .group {{ margin-top: 20px; }}
.history .chip.ok {{ opacity: .85; }}
summary:focus-visible, a:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }}
footer {{ font-size: 12.5px; color: var(--ink-3); border-top: 1px solid var(--rule); padding-top: 14px; }}
footer p {{ margin: 0; max-width: 70ch; }}

@media (max-width: 640px) {{
  .sheet {{ padding: 24px 14px 48px; }}
  .row {{ grid-template-columns: minmax(0, 1fr); }}
  .tags {{ justify-content: flex-start; }}
  .subs {{ padding-left: 20px; }}
}}
@media (prefers-reduced-motion: reduce) {{ .history summary::before {{ transition: none; }} }}
</style>
<main class="sheet">
  <header class="masthead">
    <p class="eyebrow">{html.escape(ascii_safe(project_name))} - live worklist</p>
    <h1>{inline(title)}</h1>
    <p class="lede">{lede}</p>
    {meter}
    <dl class="tally">{tally}</dl>
    <p class="stamp">Updated {stamp} from <code>{html.escape(str(src_rel))}</code>. This page is republished whenever an item moves.</p>
  </header>
  {goal_html}
  {now_html}
  {''.join(render_group(g) for g in active)}
  {hist_html}
  {'<footer>' + ''.join(f'<p>{inline(t)}</p>' for t in footer) + '</footer>' if footer else ''}
</main>
'''


def main(argv):
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument('worklist')
    ap.add_argument('out')
    ap.add_argument('--title')
    ap.add_argument('--project', help='Project name for the page eyebrow; defaults to the cwd folder name.')
    ap.add_argument('--tokens', help='Path (relative to cwd) to the CSS file to read tokens from; '
                                      'overrides auto-detection.')
    if len(argv) < 3:
        sys.exit('usage: render.py <worklist.md> <out.html> [--title "Name"] '
                  '[--project "Project Name"] [--tokens path/to/tokens.css]')
    args = ap.parse_args(argv[1:])

    root = Path.cwd()
    project_name = args.project or root.name
    Path(args.out).write_text(page(args.worklist, root, project_name, args.title, args.tokens))
    print(f'rendered {args.worklist} -> {args.out} (project: {project_name}, root: {root})')


if __name__ == '__main__':
    main(sys.argv)
