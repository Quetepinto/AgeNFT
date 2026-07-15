#!/usr/bin/env node
/** Verificación Hermes ↔ Unit-Mainnet MVP */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..');
const RUNTIME = join(REPO, 'runtime');
const checks = [];

function run(label, cmd, { cwd = RUNTIME, env = {}, expectExit = 0 } = {}) {
  try {
    const out = execSync(cmd, {
      cwd,
      env: { ...process.env, AGENFT_TOKEN_ID: '1', ...env },
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
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

run('manifest load', 'node -e "import(\'./src/manifest-loader.mjs\').then(m=>m.loadManifest(\'../docs/manifest/examples/unit-mainnet.json\'))"', {
  cwd: RUNTIME,
});
run('budget status', 'node src/budget-status.mjs');
run('hermes-turn probe', 'node src/hermes-turn.mjs --plain --quiet "ping"', { expectExit: 0 });
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
  cronOk = list.includes('agenft-unit-mainnet-doctor') || list.includes('agenft-unit1-doctor');
  checks.push({ label: 'cron doctor', ok: cronOk, detail: cronOk ? 'encontrado' : 'no encontrado' });
} catch (e) {
  checks.push({ label: 'cron doctor', ok: false, detail: e.message });
}

const passed = checks.filter((c) => c.ok).length;
console.log('\n=== Hermes verify Unit-Mainnet ===\n');
for (const c of checks) {
  console.log(`${c.ok ? '✅' : '❌'} ${c.label}`);
  if (!c.ok) console.log('   ', c.detail.split('\n')[0]);
}
console.log(`\n${passed}/${checks.length} OK`);
process.exit(passed === checks.length ? 0 : 1);
