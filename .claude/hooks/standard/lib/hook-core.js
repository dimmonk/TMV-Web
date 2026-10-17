/**
 * hook-core.js — shared machinery for the generic enforcement engine.
 *
 * The four enforcement gates (doc-reading, tests, doc-currency, arch-pipeline)
 * used to each carry a copy of these helpers plus a hardcoded TMV_PROJECTS table.
 * That duplication is gone: the logic lives here once, and every project declares
 * its OWN rules in `<project>/.claude/enforcement.json`. This module contains no
 * project names — it discovers projects by walking up from a path until it finds
 * an enforcement.json manifest.
 *
 * Everything fails OPEN: any internal error resolves to "no project / no block"
 * so a hook bug can never wedge a session.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const STATE_DIR = path.join(os.homedir(), '.claude', 'hook-state');

const SOURCE_FILE_PATTERN = /\.(js|ts|tsx|jsx|mjs|cjs|py|html|css|rules)$/i;
const SKIP_FILE_PATTERN = /\.(md|markdown|txt|json|yaml|yml)$/i;
const DOC_FILE_PATTERN = /\.(md|markdown)$/i;
const AGENT_TOOL_NAMES = ['Task', 'Agent'];
const EDIT_TOOL_NAMES = ['Edit', 'Write', 'NotebookEdit'];

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function readStdinJson() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

function readTranscript(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return [];
  try {
    return fs
      .readFileSync(transcriptPath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function eachToolUse(transcript) {
  const uses = [];
  for (let i = 0; i < transcript.length; i++) {
    const content = transcript[i]?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block?.type === 'tool_use') {
        uses.push({ index: i, name: block.name, input: block.input || {} });
      }
    }
  }
  return uses;
}

/**
 * A project synced with the shared standard carries its own copy of this engine in
 * .claude/hooks/standard/, wired in its committed settings.json so cloud sessions get it.
 * The global copy then stays out, so the same gates never run twice.
 */
const THIS_ENGINE = fs.realpathSync(path.join(__dirname, '..', 'enforce.js'));
function deferToProjectEngine(projectDir) {
  const vendored = path.join(projectDir, '.claude', 'hooks', 'standard', 'enforce.js');
  return fs.existsSync(vendored) && fs.realpathSync(vendored) !== THIS_ENGINE;
}

/**
 * Walk up from startPath until a directory contains .claude/enforcement.json.
 * Returns { dir, manifest } or null. startPath may be a file (an edit target)
 * or a directory (a cwd) — a file path just wastes one iteration before its
 * dirname is reached. Never ascends above the filesystem root.
 */
function findProjectRoot(startPath) {
  if (!startPath) return null;
  let cur = path.resolve(startPath);
  for (let i = 0; i < 40; i++) {
    const manifestPath = path.join(cur, '.claude', 'enforcement.json');
    if (fs.existsSync(manifestPath)) {
      if (deferToProjectEngine(cur)) return null;
      const manifest = readJson(manifestPath);
      return manifest ? { dir: cur, manifest } : null;
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}

/** cwd first, then any cwd recorded in the transcript. */
function detectProjectFromContext(cwd, transcript) {
  const fromCwd = findProjectRoot(cwd);
  if (fromCwd) return fromCwd;
  for (const entry of transcript) {
    const c = entry?.cwd || entry?.message?.cwd;
    const p = findProjectRoot(c);
    if (p) return p;
  }
  return null;
}

function editedPath(use) {
  if (!EDIT_TOOL_NAMES.includes(use.name)) return '';
  return use.input?.file_path || use.input?.notebook_path || use.input?.path || '';
}

function underDir(fp, dir) {
  return fp === dir || fp.startsWith(dir + path.sep);
}

function isSourceEdit(use, dir) {
  const fp = editedPath(use);
  return !!fp && underDir(fp, dir) && SOURCE_FILE_PATTERN.test(fp);
}

/** Source edit that also isn't under tests/ — used by the doc-currency gate. */
function isArchitecturalEdit(use, dir) {
  const fp = editedPath(use);
  if (!fp || !underDir(fp, dir) || !SOURCE_FILE_PATTERN.test(fp)) return false;
  const rel = fp.slice(dir.length + 1);
  return !(rel.startsWith('tests' + path.sep) || rel.startsWith('test' + path.sep));
}

function isDocEdit(use, dir) {
  const fp = editedPath(use);
  return !!fp && underDir(fp, dir) && DOC_FILE_PATTERN.test(fp);
}

function isAgentSpawn(use, subagent) {
  if (!AGENT_TOOL_NAMES.includes(use.name)) return false;
  const t = use.input?.subagent_type || use.input?.subagentType || '';
  return String(t).toLowerCase() === subagent;
}

function hasReadAnyDoc(transcript, requiredAbsPaths) {
  const wanted = new Set(requiredAbsPaths);
  for (const use of eachToolUse(transcript)) {
    if (use.name === 'Read' && wanted.has(use.input?.file_path || '')) return true;
  }
  return false;
}

// ---- arch-shift arming marker (project-scoped, survives across sessions) -----
function projectKey(dir) {
  return path.basename(dir).replace(/[^A-Za-z0-9._-]/g, '_');
}
function armMarkerPath(dir) {
  return path.join(STATE_DIR, `arch-shift.${projectKey(dir)}.txt`);
}
function readArmMarker(dir) {
  const p = armMarkerPath(dir);
  if (!fs.existsSync(p)) return null;
  try {
    return fs.readFileSync(p, 'utf8').trim() || '(no reason recorded)';
  } catch {
    return '(no reason recorded)';
  }
}

// ---- once-per-session nag state ---------------------------------------------
function nagPath(tag, sessionId) {
  return path.join(STATE_DIR, `nag-${tag}-${sessionId || 'nosess'}.txt`);
}
function alreadyNagged(tag, sessionId) {
  return fs.existsSync(nagPath(tag, sessionId));
}
function markNagged(tag, sessionId) {
  try {
    fs.writeFileSync(nagPath(tag, sessionId), String(Date.now()));
  } catch {}
}

module.exports = {
  STATE_DIR,
  SOURCE_FILE_PATTERN,
  SKIP_FILE_PATTERN,
  ensureDir,
  readStdinJson,
  readTranscript,
  eachToolUse,
  findProjectRoot,
  detectProjectFromContext,
  editedPath,
  isSourceEdit,
  isArchitecturalEdit,
  isDocEdit,
  isAgentSpawn,
  hasReadAnyDoc,
  armMarkerPath,
  readArmMarker,
  alreadyNagged,
  markNagged,
};
