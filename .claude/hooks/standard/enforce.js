#!/usr/bin/env node
/**
 * enforce.js — the ONE generic enforcement engine.
 *
 * Wired into BOTH PreToolUse (Edit|Write|MultiEdit|NotebookEdit) and Stop.
 * Contains zero project names. It finds the current project by locating a
 * `<project>/.claude/enforcement.json` manifest, then runs whichever gates the
 * manifest declares:
 *
 *   PreToolUse  →  docGate (read the architecture docs first)
 *               →  archPipeline front gate (armed shift ⇒ architect agent first)
 *   Stop        →  archPipeline back gate  (armed shift ⇒ refactor-cleaner after)
 *               →  tests    (ran the project's tests before stopping?)
 *               →  docCurrency (touched a *.md when source changed?)
 *
 * Every gate is opt-in: a manifest that omits a section skips that gate. Every
 * gate nags at most once per session, then stays out of the way. Fails OPEN —
 * any internal error exits 0 so a hook bug can never wedge a session.
 *
 * Manifest shape (all sections optional):
 * {
 *   "name": "TMV Members",
 *   "docGate":     { "requiredDocs": ["docs/subsystems.md", ...], "docList": "…" },
 *   "tests":       { "commands": ["npm run test:unit", …], "harnesses": ["http://…"], "reminder": "…" },
 *   "docCurrency": { "reminder": "…" },
 *   "archPipeline": true
 * }
 */

const path = require('path');
const core = require('./lib/hook-core');

core.ensureDir(core.STATE_DIR);

const sid = (s) => s.session_id || s.sessionId;
const transcriptOf = (s) => core.readTranscript(s.transcript_path || s.transcriptPath);

// ---- PreToolUse gates -------------------------------------------------------

function docGate(stdin, project) {
  const cfg = project.manifest.docGate;
  if (!cfg || !Array.isArray(cfg.requiredDocs) || cfg.requiredDocs.length === 0) return null;
  const sessionId = sid(stdin);
  if (core.alreadyNagged('doc', sessionId)) return null;

  const requiredAbs = cfg.requiredDocs.map((d) => path.resolve(project.dir, d));
  const read = core.hasReadAnyDoc(transcriptOf(stdin), requiredAbs);
  // Mark whether it passed or fired, so we don't re-scan on every subsequent edit.
  core.markNagged('doc', sessionId);
  if (read) return null;

  const names = cfg.requiredDocs.map((d) => path.basename(d)).join(' or ');
  return (
    `BLOCKED: you're editing source in ${project.manifest.name || project.dir} but haven't read its architecture docs this session.\n\n` +
    `Per ~/.claude/rules/consult-architecture-docs.md you MUST read ${names} before touching source code.\n\n` +
    `Read these now (start with the first):\n${cfg.docList || cfg.requiredDocs.map((d) => '  • ' + d).join('\n')}\n\n` +
    `Then state which subsystem your change touches, how it aligns with the target architecture, and whether any in-progress migration applies. This block fires once per session.`
  );
}

function archFrontGate(stdin, project) {
  if (!project.manifest.archPipeline) return null;
  const armed = core.readArmMarker(project.dir);
  if (!armed) return null;
  const sessionId = sid(stdin);
  if (core.alreadyNagged('arch-front', sessionId)) return null;

  const ranArchitect = core.eachToolUse(transcriptOf(stdin)).some((u) => core.isAgentSpawn(u, 'architect'));
  core.markNagged('arch-front', sessionId);
  if (ranArchitect) return null;

  return (
    `BLOCKED: ${project.manifest.name || project.dir} is ARMED as an architecture shift, but the architect agent has not run yet.\n\n` +
    `  Armed for: ${armed}\n\n` +
    `Per CLAUDE.md (Architecture-Shift Pipeline), the architect agent must confirm the end-game design BEFORE implementation. Spawn subagent_type "architect", point it at the architecture + subsystem docs, relay its findings, confirm direction, THEN implement.\n` +
    `This block fires once per session. If this is NOT an architecture shift, clear the marker:\n  rm "${core.armMarkerPath(project.dir)}"`
  );
}

function preToolUse(stdin, toolName) {
  if (!['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(toolName)) process.exit(0);
  const input = stdin.tool_input || stdin.toolInput || {};
  const filePath = input.file_path || input.notebook_path || input.path || '';
  if (!filePath) process.exit(0);
  if (core.SKIP_FILE_PATTERN.test(filePath)) process.exit(0); // never block doc/config edits
  if (!core.SOURCE_FILE_PATTERN.test(filePath)) process.exit(0);

  const project = core.findProjectRoot(filePath);
  if (!project) process.exit(0); // project has no manifest → no enforcement

  const messages = [docGate(stdin, project), archFrontGate(stdin, project)].filter(Boolean);
  if (messages.length) {
    process.stderr.write(messages.join('\n\n----------\n\n') + '\n');
    process.exit(2);
  }
  process.exit(0);
}

// ---- Stop gates -------------------------------------------------------------

function archBackGate(stdin, project, uses) {
  if (!project.manifest.archPipeline) return null;
  const armed = core.readArmMarker(project.dir);
  if (!armed) return null;
  const sessionId = sid(stdin);
  if (core.alreadyNagged('arch-back', sessionId)) return null;

  let lastEdit = -1;
  let lastCleaner = -1;
  for (const u of uses) {
    if (core.isSourceEdit(u, project.dir)) lastEdit = Math.max(lastEdit, u.index);
    if (core.isAgentSpawn(u, 'refactor-cleaner')) lastCleaner = Math.max(lastCleaner, u.index);
  }
  if (lastEdit === -1 || lastCleaner > lastEdit) return null;

  core.markNagged('arch-back', sessionId);
  return (
    `${project.manifest.name || project.dir} is ARMED as an architecture shift and you edited code, but the refactor-cleaner agent has not run after the last edit.\n\n` +
    `  Armed for: ${armed}\n\n` +
    `Per CLAUDE.md (Architecture-Shift Pipeline), after implementation you MUST run subagent_type "refactor-cleaner" to delete the old path, kill dead code, and verify zero orphan call sites (no-backward-compat). Then run tests + code-review.\n` +
    `When the shift has shipped, disarm:\n  rm "${core.armMarkerPath(project.dir)}"`
  );
}

function testsGate(stdin, project, uses) {
  const cfg = project.manifest.tests;
  if (!cfg || !Array.isArray(cfg.commands) || cfg.commands.length === 0) return null;
  const sessionId = sid(stdin);
  if (core.alreadyNagged('tests', sessionId)) return null;

  const harnesses = Array.isArray(cfg.harnesses) ? cfg.harnesses : [];
  const isTestRun = (u) => u.name === 'Bash' && cfg.commands.some((c) => String(u.input?.command || '').includes(c));
  const isHarness = (u) => {
    if (harnesses.length === 0) return false;
    const hay = String(u.input?.command || '') + ' ' + String(u.input?.url || '');
    return harnesses.some((h) => hay.includes(h));
  };

  let lastEdit = -1;
  let lastTest = -1;
  for (const u of uses) {
    if (core.isSourceEdit(u, project.dir)) lastEdit = Math.max(lastEdit, u.index);
    if (isTestRun(u) || isHarness(u)) lastTest = Math.max(lastTest, u.index);
  }
  if (lastEdit === -1 || lastTest > lastEdit) return null;

  core.markNagged('tests', sessionId);
  return cfg.reminder || `You modified code in ${project.manifest.name || project.dir} but ran no tests this session. Run the project's tests, or state why none apply.`;
}

function docCurrencyGate(stdin, project, uses) {
  const cfg = project.manifest.docCurrency;
  if (!cfg) return null;
  const sessionId = sid(stdin);
  if (core.alreadyNagged('doc-currency', sessionId)) return null;

  let codeEdited = false;
  let docEdited = false;
  for (const u of uses) {
    if (core.isArchitecturalEdit(u, project.dir)) codeEdited = true;
    if (core.isDocEdit(u, project.dir)) docEdited = true;
  }
  if (!codeEdited || docEdited) return null;

  core.markNagged('doc-currency', sessionId);
  return cfg.reminder || `You changed source in ${project.manifest.name || project.dir} but touched no *.md. Update the affected canon doc in the same change, or state the change has no architectural surface.`;
}

function stop(stdin) {
  const transcript = transcriptOf(stdin);
  const project = core.detectProjectFromContext(stdin.cwd, transcript);
  if (!project) process.exit(0);

  const uses = core.eachToolUse(transcript);
  const messages = [
    archBackGate(stdin, project, uses),
    testsGate(stdin, project, uses),
    docCurrencyGate(stdin, project, uses),
  ].filter(Boolean);

  if (messages.length) {
    process.stderr.write(messages.join('\n\n----------\n\n') + '\n');
    process.exit(2);
  }
  process.exit(0);
}

function main() {
  const stdin = core.readStdinJson();
  if (!stdin) process.exit(0);
  const toolName = stdin.tool_name || stdin.toolName;
  if (toolName) preToolUse(stdin, toolName);
  else stop(stdin);
  process.exit(0);
}

try {
  main();
} catch {
  process.exit(0); // fail open — never wedge a session on a hook bug
}
