#!/usr/bin/env node
/**
 * The fast checks every project runs before code ships: the same list for a deploy (the core runs them in the shipped
 * worktree before the preflight hook) and for the rationed GitHub check on a pull request (.github/workflows/checks.yml).
 * One definition, so what the deploy refuses and what GitHub marks red can never drift apart.
 *
 * The list is the package.json scripts a project has among CHECK_SCRIPTS, in that order. A project that has none of them
 * runs nothing. The slow suites (rules, e2e) are deliberately not here: they are scoped to the change and run by hand.
 *
 *   node .claude/standard/checks.mjs        run the checks in the current directory; exit 1 at the first failure
 */
import { spawn } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Script names, cheapest first so a failure costs as little as possible. */
export const CHECK_SCRIPTS = Object.freeze(['typecheck', 'lint', 'test:unit']);

/** The check scripts `pkg` (a parsed package.json, or null) defines, in CHECK_SCRIPTS order. */
export function checksFor(pkg) {
  const scripts = pkg?.scripts ?? {};
  return CHECK_SCRIPTS.filter((name) => typeof scripts[name] === 'string' && scripts[name].trim() !== '');
}

/** The parsed package.json in `dir`, or null when there is none. */
export function readPackage(dir) {
  try { return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')); } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error(`cannot read ${join(dir, 'package.json')}: ${error.message}`);
  }
}

/**
 * Run the checks of the project in `dir` with `run(cmd, args, { cwd })`, which rejects when the command fails.
 * Resolves to the scripts that ran; rejects at the first failure with an error naming it.
 */
export async function runChecks(run, dir, log = () => {}) {
  const scripts = checksFor(readPackage(dir));
  for (const name of scripts) {
    log(`check: npm run ${name}`);
    try { await run('npm', ['run', name], { cwd: dir }); } catch (error) {
      throw new Error(`npm run ${name} failed in ${dir}.\n${error.message}`);
    }
  }
  return scripts;
}

const spawnRun = (cmd, args, { cwd }) => new Promise((resolveRun, reject) => {
  const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  child.on('error', reject);
  child.on('exit', (code) => (code === 0 ? resolveRun() : reject(new Error(`exit code ${code}`))));
});

const isEntryPoint = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isEntryPoint) {
  try {
    const ran = await runChecks(spawnRun, process.cwd(), (line) => process.stdout.write(`[checks] ${line}\n`));
    process.stdout.write(`[checks] passed: ${ran.length === 0 ? 'no check scripts defined' : ran.join(', ')}\n`);
  } catch (error) {
    process.stderr.write(`[checks] FAILED: ${error.message}\n`);
    process.exitCode = 1;
  }
}
