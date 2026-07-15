#!/usr/bin/env node
/** Verificación integración Hermes ↔ ageNFT Unit-1 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..');
const RUNTIME = join(REPO, 'runtime');

const checks = [];

function run(label, cmd, { cwd = RUNTIME, expectExit = 0 } = {}) {
  try {
    const out = execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    checks.push({ label, ok: true, detail: out.trim().slice(0, 200) });
    return out;
  } catch (e) {
    const ok = e.status === expectExit;
    checks.push({
      label,
      ok,
      detail: (e.stdout || e.stderr || e.message).toString().trim().slice(0, 300),
    });
    return null;
  }
}

run('manifest validate', `node ${join(REPO, 'scripts/validate-manifest.mjs')} docs/manifest/examples/unit-1-lab.json`, {
  cwd: REPO,
});
run('budget status', 'node src/budget-status.mjs');
run('hermes-turn probe', 'node src/hermes-turn.mjs --plain --quiet "ping doctor"', { expectExit: 0 });
run('doctor probe', 'node src/doctor-probe.mjs', { expectExit: 0 });

const skill = join(homedir(), '.hermes/skills/agenft/core/SKILL.md');
checks.push({
  label: 'skill instalada',
  ok: existsSync(skill),
  detail: skill,
});

let cronOk = false;
try {
  const list = execSync('hermes cron list', { encoding: 'utf8' });
  cronOk = list.includes('agenft-unit1-doctor');
  checks.push({ label: 'cron doctor', ok: cronOk, detail: cronOk ? 'agenft-unit1-doctor' : 'no encontrado' });
} catch (e) {
  checks.push({ label: 'cron doctor', ok: false, detail: e.message });
}

const passed = checks.filter((c) => c.ok).length;
const total = checks.length;

console.log('\n=== Hermes verify Unit-1 ===\n');
for (const c of checks) {
  console.log(`${c.ok ? '✅' : '❌'} ${c.label}`);
  if (!c.ok || c.label.includes('probe')) console.log('   ', c.detail.split('\n')[0]);
}
console.log(`\n${passed}/${total} OK`);
process.exit(passed === total ? 0 : 1);
